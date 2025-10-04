"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mic, MicOff } from "lucide-react"
import { cn } from "@/lib/utils"
import type { DuckPersonality } from "@/components/duck-selector"

interface ActiveDuckProps {
  duck: DuckPersonality
}

export function ActiveDuck({ duck }: ActiveDuckProps) {
  const [isListening, setIsListening] = useState(false)
  const [audioLevel, setAudioLevel] = useState(0)

  // Simulate audio level animation when listening
  useEffect(() => {
    if (!isListening) {
      setAudioLevel(0)
      return
    }

    const interval = setInterval(() => {
      setAudioLevel(Math.random() * 100)
    }, 100)

    return () => clearInterval(interval)
  }, [isListening])

  return (
    <Card className={cn("p-8 bg-gradient-to-br w-full", duck.color)}>
      <div className="flex flex-col items-center">
        {/* Duck Display with Voice Indicator */}
        <div className="relative">
          <div className={cn("text-9xl transition-transform duration-200", isListening && "scale-110")}>
            {duck.emoji}
          </div>

          {/* Voice Indicator Rings */}
          {isListening && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="absolute rounded-full bg-primary/30 animate-ping"
                style={{
                  width: `${140 + audioLevel * 0.5}px`,
                  height: `${140 + audioLevel * 0.5}px`,
                }}
              />
              <div
                className="absolute rounded-full bg-primary/20 animate-pulse"
                style={{
                  width: `${160 + audioLevel * 0.3}px`,
                  height: `${160 + audioLevel * 0.3}px`,
                }}
              />
            </div>
          )}
        </div>

        {/* Duck Name */}
        <h2 className="text-2xl font-semibold text-foreground mt-6">{duck.name}</h2>

        {/* Duck Description */}
        <p className="text-sm text-muted-foreground mt-2 text-center max-w-xs">{duck.description}</p>

        {/* Voice Control Button */}
        <Button
          onClick={() => setIsListening(!isListening)}
          className={cn("mt-6 w-full", isListening && "bg-destructive hover:bg-destructive/90")}
          size="lg"
        >
          {isListening ? (
            <>
              <MicOff className="w-5 h-5 mr-2" />
              Stop Listening
            </>
          ) : (
            <>
              <Mic className="w-5 h-5 mr-2" />
              Start Voice Session
            </>
          )}
        </Button>

        {/* Status Text */}
        <p className="text-xs text-muted-foreground mt-4 text-center">
          {isListening ? "Listening to your code problems..." : "Ready to help you debug"}
        </p>
      </div>
    </Card>
  )
}
