"use client";

import { useConversation } from "@elevenlabs/react";
import { createContext, useContext, ReactNode } from "react";

type ConversationContextType = ReturnType<typeof useConversation>;

const ConversationContext = createContext<ConversationContextType | null>(null);

export function ConversationProvider({ children }: { children: ReactNode }) {
  const conversation = useConversation({
    onConnect: () => console.log("Connected"),
    onDisconnect: () => console.log("Disconnected"),
    onMessage: (message) => console.log("Message:", message),
    onError: (error) => console.error("Error:", error),
  });

  return (
    <ConversationContext.Provider value={conversation}>
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
