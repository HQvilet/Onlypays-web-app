import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface OpxWalletState {
  balance: number;
  pendingBalance: number;
  isUpdating: boolean;

  // Actions
  setBalance: (balance: number) => void;
  debitOptimistic: (amount: number) => boolean;
  credit: (amount: number) => void;
  rollbackDebit: (amount: number) => void;
}

export const useOpxStore = create<OpxWalletState>()(
  persist(
    (set, get) => ({
      balance: 1250, // Default demo balance
      pendingBalance: 0,
      isUpdating: false,

      setBalance: (balance) => set({ balance }),

      debitOptimistic: (amount) => {
        const current = get().balance;
        if (current < amount) {
          return false;
        }
        set({
          balance: current - amount,
          pendingBalance: get().pendingBalance + amount,
        });
        return true;
      },

      credit: (amount) =>
        set((state) => ({
          balance: state.balance + amount,
        })),

      rollbackDebit: (amount) =>
        set((state) => ({
          balance: state.balance + amount,
          pendingBalance: Math.max(0, state.pendingBalance - amount),
        })),
    }),
    {
      name: "onlypays_opx_wallet",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
