"use client";

import { useConversation } from "@elevenlabs/react";
import { createContext, useContext, ReactNode, useState } from "react";

export interface TranscriptMessage {
  source: "user" | "ai";
  message: string;
  timestamp: number;
}

type ConversationContextType = ReturnType<typeof useConversation> & {
  transcriptMessages: TranscriptMessage[];
};

const ConversationContext = createContext<ConversationContextType | null>(null);

export function ConversationProvider({ children }: { children: ReactNode }) {
  const [transcriptMessages, setTranscriptMessages] = useState<
    TranscriptMessage[]
  >([]);

  const conversation = useConversation({
    onConnect: () => {
      console.log("Connected");
      setTranscriptMessages([]);
    },
    onDisconnect: () => {
      console.log("Disconnected");
    },
    onMessage: (message) => {
      console.log("Message:", message);
      // Add message to transcript
      setTranscriptMessages((prev) => [
        ...prev,
        {
          source: message.source === "user" ? "user" : "ai",
          message: message.message,
          timestamp: Date.now(),
        },
      ]);
    },
    onError: (error) => console.error("Error:", error),
  });

  return (
    <ConversationContext.Provider
      value={{ ...conversation, transcriptMessages }}
    >
      {children}
    </ConversationContext.Provider>
  );
}

export function useSharedConversation() {
  const context = useContext(ConversationContext);
  if (!context) {
    throw new Error(
      "useSharedConversation must be used within ConversationProvider"
    );
  }
  return context;
}
