import { create } from "zustand";

interface UIState {
  selectedLines: Set<number>;
  setSelectedLines: (lines: Set<number>) => void;
  clearSelectedLines: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  selectedLines: new Set(),
  setSelectedLines: (selectedLines) => set({ selectedLines }),
  clearSelectedLines: () => set({ selectedLines: new Set() }),
}));
