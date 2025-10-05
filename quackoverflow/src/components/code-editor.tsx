"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Play,
  Copy,
  RotateCcw,
  Cloud,
  CloudOff,
  Loader2,
  Check,
} from "lucide-react";
import { useUIStore } from "@/store/uiStore";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useConversation } from "@elevenlabs/react";

export const CodeEditor: React.FC = () => {
  const { sendContextualUpdate } = useConversation();

  const { selectedLines, setSelectedLines, clearSelectedLines } = useUIStore();
  const { user } = useUser();
  const userId = user?.id || "anonymous";

  // Fetch user's code from Convex
  const userCodeData = useQuery(api.userCode.getUserCode, { userId });
  const updateCode = useMutation(api.userCode.updateUserCode);

  const [code, setCode] = useState("");
  const [isInitialized, setIsInitialized] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartLine, setDragStartLine] = useState<number | null>(null);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">(
    "saved"
  );
  const editorRef = useRef<HTMLDivElement>(null);
  const lastSavedCodeRef = useRef<string>("");
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasUnsavedChangesRef = useRef(false);

  // Sync with Convex data only on initial load OR if no unsaved changes
  useEffect(() => {
    if (userCodeData?.code) {
      if (!isInitialized) {
        console.log("Initializing code from Convex:", {
          codePreview: userCodeData.code.substring(0, 50),
          isDefault: (userCodeData as any).isDefault,
          userId,
        });
        setCode(userCodeData.code);
        lastSavedCodeRef.current = userCodeData.code;
        setIsInitialized(true);
      } else if (
        !hasUnsavedChangesRef.current &&
        userCodeData.code !== lastSavedCodeRef.current
      ) {
        // Only sync from server if we don't have unsaved changes
        // This handles the case where the code was updated in another tab/session
        console.log("Syncing code from Convex (no local changes)", {
          isDefault: (userCodeData as any).isDefault,
          userId,
        });
        setCode(userCodeData.code);
        lastSavedCodeRef.current = userCodeData.code;
      } else if (
        (userCodeData as any).isDefault &&
        hasUnsavedChangesRef.current
      ) {
        console.warn(
          "Server returned default code but we have unsaved changes - ignoring",
          { userId }
        );
      }
    }
  }, [userCodeData, isInitialized, userId]);

  // Debounce updates to Convex
  useEffect(() => {
    // Only save if initialized and code has changed from last saved version
    if (isInitialized && code && code !== lastSavedCodeRef.current) {
      setSaveStatus("unsaved");
      hasUnsavedChangesRef.current = true;

      // Clear any existing timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(async () => {
        setSaveStatus("saving");
        console.log("Saving code to Convex:", code.substring(0, 50));
        try {
          await updateCode({ userId, code });
          lastSavedCodeRef.current = code;
          hasUnsavedChangesRef.current = false;
          setSaveStatus("saved");
          console.log("Code saved successfully");

          sendContextualUpdate(
            `Updated User Code ${new Date().toLocaleTimeString()}\n ${code}`
          );
        } catch (error) {
          setSaveStatus("unsaved");
          hasUnsavedChangesRef.current = true;
          console.error("Failed to save code:", error);
        }
      }, 1000); // Update after 1 second of no changes

      return () => {
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
        }
      };
    }
  }, [code, userId, updateCode, isInitialized]);

  useEffect(() => {
    const handleMouseUp = () => {
      setIsDragging(false);
      setDragStartLine(null);
    };

    window.addEventListener("mouseup", handleMouseUp);
    return () => window.removeEventListener("mouseup", handleMouseUp);
  }, []);

  // Show loading state
  if (!userCodeData) {
    return (
      <div className="flex flex-col h-full items-center justify-center">
        <p className="text-muted-foreground">Loading your code...</p>
      </div>
    );
  }

  const lines = code.split("\n");

  const handleDuckClick = (lineIndex: number) => {
    if (selectedLines.has(lineIndex)) {
      const newSelection = new Set(
        Array.from(selectedLines).filter((i) => i !== lineIndex)
      );
      setSelectedLines(newSelection);
      return;
    }
    const newSelection = new Set(Array.from(selectedLines).concat(lineIndex));
    setSelectedLines(newSelection);
    setDragStartLine(lineIndex);
    setIsDragging(true);
  };

  const handleDuckEnter = (lineIndex: number) => {
    if (isDragging && dragStartLine !== null) {
      const start = Math.min(dragStartLine, lineIndex);
      const end = Math.max(dragStartLine, lineIndex);
      const newSelection = new Set<number>();
      for (let i = start; i <= end; i++) {
        newSelection.add(i);
      }
      setSelectedLines(newSelection);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
  };

  const handleReset = async () => {
    const defaultCode = ``;
    setCode(defaultCode);
    setSaveStatus("saving");
    hasUnsavedChangesRef.current = true;
    try {
      await updateCode({ userId, code: defaultCode });
      lastSavedCodeRef.current = defaultCode;
      hasUnsavedChangesRef.current = false;
      setSaveStatus("saved");
    } catch (error) {
      setSaveStatus("unsaved");
      console.error("Failed to save code:", error);
    }
    clearSelectedLines();
  };

  const handleNewLine = (index: number) => {
    const newLines = [...lines];
    newLines.splice(index + 1, 0, "");
    setCode(newLines.join("\n"));
    // Focus next line
    setTimeout(() => {
      const nextInput = editorRef.current?.querySelectorAll("input")[
        index + 1
      ] as HTMLInputElement;
      nextInput?.focus();
    }, 0);
  };

  const handleRemoveLine = (index: number) => {
    const newLines = lines.filter((_, i) => i !== index);
    setCode(newLines.join("\n"));
    // Focus previous line
    setTimeout(() => {
      const prevInput = editorRef.current?.querySelectorAll("input")[
        Math.max(0, index - 1)
      ] as HTMLInputElement;
      prevInput?.focus();
    }, 0);
    clearSelectedLines();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Editor Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Code Editor</h2>
          <p className="text-sm text-muted-foreground">
            {selectedLines.size > 0
              ? `${selectedLines.size} line${
                  selectedLines.size > 1 ? "s" : ""
                } selected`
              : "Write or paste your code to debug"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Save Status Indicator */}
          <div className="flex items-center gap-2 text-sm">
            {saveStatus === "saved" && (
              <>
                <Check className="w-4 h-4 text-green-500" />
                <span className="text-green-500">Saved</span>
              </>
            )}
            {saveStatus === "saving" && (
              <>
                <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                <span className="text-blue-500">Saving...</span>
              </>
            )}
            {saveStatus === "unsaved" && (
              <>
                <Cloud className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Unsaved changes</span>
              </>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={handleCopy}>
            <Copy className="w-4 h-4 mr-2" />
            Copy
          </Button>
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto" ref={editorRef}>
        <div className="relative">
          {lines.map((line, index) => (
            <div
              key={index}
              className={`flex items-start group hover:bg-accent/50 transition-colors ${
                selectedLines.has(index) ? "bg-accent" : ""
              }`}
            >
              {/* Duck selector */}
              <div
                className="flex-shrink-0 w-12 flex items-center justify-center py-2 cursor-pointer select-none"
                onMouseDown={() => handleDuckClick(index)}
                onMouseEnter={() => handleDuckEnter(index)}
              >
                <span
                  className={`text-lg transition-all ${
                    selectedLines.has(index)
                      ? "scale-125 opacity-100"
                      : "opacity-40 group-hover:opacity-70"
                  }`}
                >
                  🦆
                </span>
              </div>

              {/* Line number */}
              <div className="flex-shrink-0 w-12 py-2 text-right pr-4 text-xs text-muted-foreground select-none">
                {index + 1}
              </div>

              {/* Code line */}
              <div className="flex-1 py-2 pr-6">
                <input
                  type="text"
                  value={line}
                  onChange={(e) => {
                    const newLines = [...lines];
                    newLines[index] = e.target.value;
                    setCode(newLines.join("\n"));
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleNewLine(index);
                    } else if (
                      e.key === "Backspace" &&
                      line === "" &&
                      lines.length > 1
                    ) {
                      e.preventDefault();
                      handleRemoveLine(index);
                    }
                  }}
                  className="w-full bg-transparent text-foreground font-mono text-sm focus:outline-none"
                  spellCheck={false}
                  placeholder={index === 0 ? "Start typing your code..." : ""}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Editor Footer */}
      <div className="px-6 py-3 border-t border-border bg-card">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>Lines: {lines.length}</span>
            <span>Characters: {code.length}</span>
            {selectedLines.size > 0 && (
              <span className="text-accent-foreground font-medium">
                Selected:{" "}
                {Array.from(selectedLines)
                  .sort((a, b) => a - b)
                  .map((i) => i + 1)
                  .join(", ")}
              </span>
            )}
          </div>
          <div>JavaScript</div>
        </div>
      </div>
    </div>
  );
};
