import { DuckSelector } from "@/components/duck-selector"
import { CodeEditor } from "@/components/code-editor"

export default function Home() {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Left Pane - Duck Personalities and Active Duck */}
      <div className="w-96 border-r border-border flex flex-col">
        <DuckSelector />
      </div>

      {/* Right Pane - Code Editor */}
      <div className="flex-1 overflow-hidden">
        <CodeEditor />
      </div>
    </div>
  )
}
