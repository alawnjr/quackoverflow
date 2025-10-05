"use client";
import { DuckSelector } from "@/components/duck-selector";
import { CodeEditor } from "@/components/code-editor";
import { Header } from "@/components/header";
import { useUser } from "@clerk/nextjs";
import { useConversation } from "@elevenlabs/react";
import { useEffect } from "react";

export default function Home() {
  const { user } = useUser();
  const { sendContextualUpdate } = useConversation();

  useEffect(() => {
    if (user?.id) {
      sendContextualUpdate(`USER_ID=${user.id}`);
    }
  }, [user, sendContextualUpdate]);

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
