"use client";

import { useEffect, useState } from "react";
import { ActiveDuck } from "@/components/active-duck";
import { cn } from "@/lib/utils";

export interface DuckPersonality {
  id: string;
  name: string;
  emoji: string;
  description: string;
  color: string;
}

const duckPersonalities: DuckPersonality[] = [
  {
    id: "rubberDuck",
    name: "Rubber Duck",
    emoji: "🦆",
    description:
      "Patient and encouraging, guides you through problems step by step",
    color: "from-blue-500/20 to-cyan-500/20",
  },
  {
    id: "angryDuck",
    name: "Angry Duck",
    emoji: "🤬",
    description: "Gets angry when you make mistakes",
    color: "from-purple-500/20 to-pink-500/20",
  },
];

export function DuckSelector() {
  const [activeDuck, setActiveDuck] = useState<DuckPersonality>(
    duckPersonalities[0]
  );

  const playQuackSound = () => {
    const audio = new Audio("/quack.mp3");
    audio.play().catch((error) => {
      console.error("Error playing quack sound:", error);
    });
  };

  const handleDuckSelect = (duck: DuckPersonality) => {
    setActiveDuck(duck);
    playQuackSound();
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-background to-muted/20">
      {/* Duck Profile Circles at Top */}
      <div className="p-6 border-b border-border/50 backdrop-blur-sm">
        <h1 className="text-lg font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-4">
          Choose Your Assistant
        </h1>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          {duckPersonalities.map((duck) => (
            <button
              key={duck.id}
              onClick={() => handleDuckSelect(duck)}
              className={cn(
                "group relative flex flex-col items-center gap-2 p-3 rounded-2xl transition-all duration-300",
                "hover:scale-105 hover:-translate-y-1",
                activeDuck.id === duck.id
                  ? "bg-primary/10 shadow-lg shadow-primary/20"
                  : "hover:bg-secondary/50"
              )}
              title={duck.name}
            >
              <div
                className={cn(
                  "relative flex items-center justify-center w-20 h-20 rounded-full transition-all duration-300",
                  "bg-gradient-to-br overflow-hidden border-3",
                  "shadow-lg",
                  activeDuck.id === duck.id
                    ? "border-primary scale-110 shadow-primary/30"
                    : "border-border/30 opacity-70 group-hover:opacity-100 group-hover:border-primary/50",
                  duck.color
                )}
              >
                <span className="text-4xl">{duck.emoji}</span>
                {activeDuck.id === duck.id && (
                  <div className="absolute inset-0 rounded-full border-2 border-primary animate-pulse" />
                )}
              </div>
              <span
                className={cn(
                  "text-xs font-medium transition-colors",
                  activeDuck.id === duck.id
                    ? "text-primary"
                    : "text-muted-foreground group-hover:text-foreground"
                )}
              >
                {duck.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Active Duck Display */}
      <div className="flex-1 p-6 flex items-center justify-center">
        <ActiveDuck duck={activeDuck} />
      </div>
    </div>
  );
}
