import { create } from 'zustand';

interface CodeState {
  code: string;
  selectedLines: Set<number>;
  setCode: (code: string) => void;
  setSelectedLines: (lines: Set<number>) => void;
  resetCode: () => void;
}

const defaultCode = `// Your code here
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log(fibonacci(10));`;

export const useCodeStore = create<CodeState>((set) => ({
  code: defaultCode,
  selectedLines: new Set(),
  setCode: (code) => set({ code }),
  setSelectedLines: (selectedLines) => set({ selectedLines }),
  resetCode: () => set({ code: defaultCode, selectedLines: new Set() }),
}));

