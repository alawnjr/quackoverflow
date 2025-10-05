import { DuckSelector } from "@/components/duck-selector";
import { CodeEditor } from "@/components/code-editor";
import { Header } from "@/components/header";

export default function Home() {
  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-background">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        {/* Left Pane - Duck Personalities and Active Duck */}
        <div className="w-96 border-r border-border flex flex-col">
          <DuckSelector />
        </div>

        {/* Right Pane - Code Editor */}
        <div className="flex-1 overflow-hidden">
          <CodeEditor />
        </div>
      </div>
    </div>
  );
}
