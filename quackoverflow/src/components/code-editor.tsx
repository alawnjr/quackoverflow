"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Play, Copy, RotateCcw } from "lucide-react"

const defaultCode = `// Your code here
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log(fibonacci(10));`

export function CodeEditor() {
  const [code, setCode] = useState(defaultCode)
  const [selectedLines, setSelectedLines] = useState<Set<number>>(new Set())
  const [isDragging, setIsDragging] = useState(false)
  const [dragStartLine, setDragStartLine] = useState<number | null>(null)
  const editorRef = useRef<HTMLDivElement>(null)

  const lines = code.split("\n")

  useEffect(() => {
    const handleMouseUp = () => {
      setIsDragging(false)
      setDragStartLine(null)
    }

    window.addEventListener("mouseup", handleMouseUp)
    return () => window.removeEventListener("mouseup", handleMouseUp)
  }, [])

  const handleDuckClick = (lineIndex: number) => {
    setSelectedLines(new Set([lineIndex]))
    setDragStartLine(lineIndex)
    setIsDragging(true)
  }

  const handleDuckEnter = (lineIndex: number) => {
    if (isDragging && dragStartLine !== null) {
      const start = Math.min(dragStartLine, lineIndex)
      const end = Math.max(dragStartLine, lineIndex)
      const newSelection = new Set<number>()
      for (let i = start; i <= end; i++) {
        newSelection.add(i)
      }
      setSelectedLines(newSelection)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
  }

  const handleReset = () => {
    setCode(defaultCode)
    setSelectedLines(new Set())
  }

  return (
    <div className="flex flex-col h-full">
      {/* Editor Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Code Editor</h2>
          <p className="text-sm text-muted-foreground">
            {selectedLines.size > 0
              ? `${selectedLines.size} line${selectedLines.size > 1 ? "s" : ""} selected`
              : "Write or paste your code to discuss"}
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
          <Button size="sm">
            <Play className="w-4 h-4 mr-2" />
            Run
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
                    selectedLines.has(index) ? "scale-125 opacity-100" : "opacity-40 group-hover:opacity-70"
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
                    const newLines = [...lines]
                    newLines[index] = e.target.value
                    setCode(newLines.join("\n"))
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      const newLines = [...lines]
                      newLines.splice(index + 1, 0, "")
                      setCode(newLines.join("\n"))
                      // Focus next line
                      setTimeout(() => {
                        const nextInput = editorRef.current?.querySelectorAll("input")[index + 1] as HTMLInputElement
                        nextInput?.focus()
                      }, 0)
                    } else if (e.key === "Backspace" && line === "" && lines.length > 1) {
                      e.preventDefault()
                      const newLines = lines.filter((_, i) => i !== index)
                      setCode(newLines.join("\n"))
                      // Focus previous line
                      setTimeout(() => {
                        const prevInput = editorRef.current?.querySelectorAll("input")[
                          Math.max(0, index - 1)
                        ] as HTMLInputElement
                        prevInput?.focus()
                      }, 0)
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
  )
}
