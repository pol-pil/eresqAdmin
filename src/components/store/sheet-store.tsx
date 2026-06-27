// sheet-store.ts
import { create } from "zustand";

export const SheetStore = create<{
  open: boolean;
  selectedAlert: any | null;
  openSheet: (alert: any) => void;
  closeSheet: () => void;
}>((set) => ({
  open: false,
  selectedAlert: null,
  openSheet: (alert) => set({ open: true, selectedAlert: alert }),
  closeSheet: () => set({ open: false, selectedAlert: null }),
}));