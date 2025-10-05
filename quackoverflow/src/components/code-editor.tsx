"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play, Copy, RotateCcw, Cloud, CloudOff } from "lucide-react";
import { useCodeStore } from "@/store/codeStore";
import { db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { loadCodeFromFirestore } from "@/lib/firebaseCodeSync";

export const CodeEditor: React.FC = () => {
  const { code, setCode, selectedLines, setSelectedLines, resetCode } = useCodeStore();
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartLine, setDragStartLine] = useState<number | null>(null);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const editorRef = useRef<HTMLDivElement>(null);

  const lines = code.split("\n");

  // Load code from Firebase on component mount
  useEffect(() => {
    const loadCode = async () => {
      try {
        const savedCode = await loadCodeFromFirestore();
        if (savedCode) {
          setCode(savedCode);
        }
      } catch (error) {
        console.error('Error loading code from Firebase:', error);
      } finally {
        setIsInitialLoad(false);
      }
    };

    loadCode();
  }, [setCode]);

  // Auto-save code to Firebase with debouncing
  useEffect(() => {
    // Skip saving on initial load
    if (isInitialLoad) return;

    const saveToFirebase = async () => {
      try {
        setSaveStatus('saving');
        const codeDocRef = doc(db, 'code', 'code');
        await setDoc(codeDocRef, {
          code,
          updatedAt: new Date().toISOString(),
          lineCount: lines.length,
          characterCount: code.length
        });
        setSaveStatus('saved');
      } catch (error) {
        console.error('Error saving to Firebase:', error);
        setSaveStatus('error');
      }
    };

    // Debounce: wait 1.5 seconds after last change before saving
    const timeoutId = setTimeout(() => {
      saveToFirebase();
    }, 1500);

    return () => clearTimeout(timeoutId);
  }, [code, lines.length, isInitialLoad]);

  useEffect(() => {
    const handleMouseUp = () => {
      setIsDragging(false);
      setDragStartLine(null);
    };

    window.addEventListener("mouseup", handleMouseUp);
    return () => window.removeEventListener("mouseup", handleMouseUp);
  }, []);

  const handleDuckClick = (lineIndex: number) => {
    if (selectedLines.has(lineIndex)) {
      const newSelection = new Set(Array.from(selectedLines).filter((i) => i !== lineIndex));
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

  const handleReset = () => {
    resetCode();
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
    const newSelection = new Set<number>();
    setSelectedLines(newSelection);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Editor Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-foreground">Code Editor</h2>
            {saveStatus === 'saving' && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Cloud className="w-3 h-3 animate-pulse" />
                Saving...
              </span>
            )}
            {saveStatus === 'saved' && (
              <span className="flex items-center gap-1 text-xs text-green-600">
                <Cloud className="w-3 h-3" />
                Saved
              </span>
            )}
            {saveStatus === 'error' && (
              <span className="flex items-center gap-1 text-xs text-red-600">
                <CloudOff className="w-3 h-3" />
                Error
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {selectedLines.size > 0
              ? `${selectedLines.size} line${
                  selectedLines.size > 1 ? "s" : ""
                } selected`
              : "Write or paste your code to debug"}
          </p>
        </div>
        <div className="flex items-center gap-2">
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
