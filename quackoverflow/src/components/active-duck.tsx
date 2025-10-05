"use client";

import { useCallback } from "react";
import { DuckPersonality } from "@/components/duck-selector";
import { duckAgentIds } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useSharedConversation } from "@/contexts/ConversationContext";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useUser } from "@clerk/nextjs";

interface ActiveDuckProps {
  duck: DuckPersonality;
}

export function ActiveDuck({ duck }: ActiveDuckProps) {
  const conversation = useSharedConversation();
  const { user } = useUser();
  const userId = user?.id || "anonymous";

  // Fetch user's code from Convex
  const userCodeData = useQuery(api.userCode.getUserCode, { userId });

  const startConversation = useCallback(async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      await conversation.startSession({
        agentId: duckAgentIds[duck.id as keyof typeof duckAgentIds],
        // userId: "YOUR_CUSTOMER_USER_ID", // Optional field for tracking your end user IDs
        connectionType: "webrtc",
      });

      // Send the user's code to the conversation when starting
      if (userCodeData?.code) {
        console.log("Sending code to conversation on start:", {
          codePreview: userCodeData.code.substring(0, 50),
          userId,
        });
        conversation.sendUserMessage(
          `Here is the User's Code, use it when they ask for it ${new Date().toLocaleTimeString()}\n${userCodeData.code}`
        );
      }
    } catch (error) {
      console.error("Failed to start conversation:", error);
    }
  }, [conversation, duck.id, userCodeData, userId]);
  const stopConversation = useCallback(async () => {
    await conversation.endSession();
  }, [conversation]);
  const isConnected = conversation.status === "connected";
  const isSpeaking = conversation.isSpeaking;
  const transcriptMessages = conversation.transcriptMessages || [];
  const currentMessage = transcriptMessages[transcriptMessages.length - 1];

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-md">
      {/* End Call Button - Shown at top when connected */}
      {isConnected && (
        <button
          onClick={stopConversation}
          className={cn(
            "w-full px-4 py-2 rounded-xl font-semibold transition-all duration-200",
            "shadow-lg hover:shadow-xl hover:-translate-y-0.5",
            "bg-gradient-to-r from-red-500 to-rose-500 text-white hover:from-red-600 hover:to-rose-600"
          )}
        >
          End Conversation
        </button>
      )}

      {/* Current Caption Display - Fixed height for UI stability */}
      {isConnected && (
        <div className="w-full h-20 bg-secondary/30 backdrop-blur-sm border border-border/50 rounded-xl shadow-lg overflow-hidden">
          <div className="h-full overflow-y-auto p-3 flex items-center justify-center">
            {currentMessage ? (
              <p className="text-sm leading-relaxed text-center text-foreground">
                {currentMessage.message}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                Waiting for message...
              </p>
            )}
          </div>
        </div>
      )}

      {/* Duck Profile Picture */}
      <div className="flex flex-col items-center gap-2">
        <div className="relative">
          {/* Speaking Animation Rings */}
          {isConnected && isSpeaking && (
            <>
              <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
              <div className="absolute -inset-4 rounded-full bg-primary/10 animate-pulse" />
            </>
          )}

          {/* Main Duck Avatar */}
          <div
            className={cn(
              "relative w-32 h-32 rounded-full overflow-hidden border-4 shadow-2xl bg-gradient-to-br flex items-center justify-center transition-all duration-300",
              duck.color,
              isConnected
                ? isSpeaking
                  ? "border-green-500 scale-105 shadow-green-500/50"
                  : "border-blue-500 shadow-blue-500/50"
                : "border-border"
            )}
          >
            <span className="text-6xl">{duck.emoji}</span>

            {/* Status Indicator Dot */}
            {isConnected && (
              <div className="absolute bottom-2 right-2">
                <div
                  className={cn(
                    "w-4 h-4 rounded-full border-2 border-background",
                    isSpeaking ? "bg-green-500 animate-pulse" : "bg-blue-500"
                  )}
                />
              </div>
            )}
          </div>
        </div>

        {/* Duck Info */}
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            {duck.name}
          </h2>
          <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
            {duck.description}
          </p>
        </div>
      </div>

      {/* Status Badge */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 backdrop-blur-sm border border-border/50">
        <div
          className={cn(
            "w-2 h-2 rounded-full transition-colors",
            isConnected
              ? isSpeaking
                ? "bg-green-500 animate-pulse"
                : "bg-blue-500"
              : "bg-muted-foreground"
          )}
        />
        <span className="text-xs font-medium">
          {!isConnected
            ? "Disconnected"
            : isSpeaking
              ? "Speaking..."
              : "Listening"}
        </span>
      </div>

      {/* Start Conversation Button - Only shown when not connected */}
      {!isConnected && (
        <button
          onClick={startConversation}
          className={cn(
            "w-full px-4 py-2 rounded-xl font-semibold transition-all duration-200",
            "shadow-lg hover:shadow-xl hover:-translate-y-0.5",
            "bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600"
          )}
        >
          Start Conversation
        </button>
      )}
    </div>
  );
}
