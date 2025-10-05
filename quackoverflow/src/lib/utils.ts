import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const duckAgentIds = {
  rubberDuck: "agent_1001k6r3k6b5ehx9x698bqht44z3",
  angryDuck: "agent_5301k6rfmxx4fjjtqc47yqbyjvrj",
};
