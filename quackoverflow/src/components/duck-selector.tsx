"use client"

import { useState } from "react"
import { ActiveDuck } from "@/components/active-duck"
import { cn } from "@/lib/utils"

export interface DuckPersonality {
  id: string
  name: string
  emoji: string
  description: string
  color: string
}

const duckPersonalities: DuckPersonality[] = [
  {
    id: "mentor",
    name: "Mentor Duck",
    emoji: "🦆",
    description: "Patient and encouraging, guides you through problems step by step",
    color: "from-blue-500/20 to-cyan-500/20",
  },
  {
    id: "socratic",
    name: "Socratic Duck",
    emoji: "🧐",
    description: "Asks thought-provoking questions to help you find your own answers",
    color: "from-purple-500/20 to-pink-500/20",
  },
  {
    id: "cheerleader",
    name: "Cheerleader Duck",
    emoji: "🎉",
    description: "Enthusiastic and supportive, celebrates every small win",
    color: "from-yellow-500/20 to-orange-500/20",
  },
  {
    id: "debugger",
    name: "Debugger Duck",
    emoji: "🔍",
    description: "Methodical and analytical, helps you trace bugs systematically",
    color: "from-green-500/20 to-teal-500/20",
  },
  {
    id: "zen",
    name: "Zen Duck",
    emoji: "🧘",
    description: "Calm and philosophical, helps you step back and see the bigger picture",
    color: "from-indigo-500/20 to-blue-500/20",
  },
]

export function DuckSelector() {
  const [activeDuck, setActiveDuck] = useState<DuckPersonality>(duckPersonalities[0])

  return (
    <div className="flex flex-col h-full">
      {/* Duck Profile Circles at Top */}
      <div className="p-4 border-b border-border">
        <h1 className="text-sm font-semibold text-muted-foreground mb-3">Select Your Duck</h1>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          {duckPersonalities.map((duck) => (
            <button
              key={duck.id}
              onClick={() => setActiveDuck(duck)}
              className={cn(
                "relative flex items-center justify-center w-14 h-14 rounded-full transition-all hover:scale-110",
                "bg-secondary border-2",
                activeDuck.id === duck.id
                  ? "border-primary scale-110"
                  : "border-transparent opacity-60 hover:opacity-100",
              )}
              title={duck.name}
            >
              <span className="text-3xl">{duck.emoji}</span>
              {activeDuck.id === duck.id && (
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-primary" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Active Duck Display */}
      <div className="flex-1 p-6 flex items-center justify-center">
        <ActiveDuck duck={activeDuck} />
      </div>
    </div>
  )
}
