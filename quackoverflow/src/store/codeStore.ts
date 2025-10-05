import { create } from 'zustand';

interface CodeState {
  code: string;
  setCode: (code: string) => void;
}

const defaultCode = `// Your code here
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log(fibonacci(10));`;

export const useCodeStore = create<CodeState>((set) => ({
  code: defaultCode,
  setCode: (code) => set({ code }),
}));
