import { create } from "zustand";

export interface ToastNotification {
  id: string;
  type: "success" | "error" | "info" | "warning";
  message: string;
  durationMs?: number;
}

interface UIState {
  sidebarOpen: boolean;
  activeFeedTab: "for-you" | "following" | "trending";
  activeMarketplaceCategory: string;
  activeModal: "login" | "topup-opx" | "subscribe-tier" | null;
  toasts: ToastNotification[];

  // Actions
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setActiveFeedTab: (tab: "for-you" | "following" | "trending") => void;
  setActiveMarketplaceCategory: (category: string) => void;
  openModal: (modal: "login" | "topup-opx" | "subscribe-tier") => void;
  closeModal: () => void;
  addToast: (toast: Omit<ToastNotification, "id">) => void;
  removeToast: (id: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: false,
  activeFeedTab: "for-you",
  activeMarketplaceCategory: "all",
  activeModal: null,
  toasts: [],

  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setActiveFeedTab: (activeFeedTab) => set({ activeFeedTab }),
  setActiveMarketplaceCategory: (activeMarketplaceCategory) =>
    set({ activeMarketplaceCategory }),
  openModal: (activeModal) => set({ activeModal }),
  closeModal: () => set({ activeModal: null }),

  addToast: (toast) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }],
    }));

    const duration = toast.durationMs || 4000;
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, duration);
  },

  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));
