import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const duckAgentIds = {
  rubberDuck: "agent_5301k6rfmxx4fjjtqc47yqbyjvrj",
  angryDuck: "agent_5301k6rfmxx4fjjtqc47yqbyjvrj",
};
