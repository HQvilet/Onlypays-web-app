import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface AuthUser {
  sub: string;
  email: string;
  name?: string;
  nickname?: string;
  picture?: string | null;
  email_verified?: boolean;
  role?: string;
  [key: string]: unknown;
}

export interface AuthSessionPayload {
  user: AuthUser;
  accessToken: string;
  idToken?: string | null;
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  idToken: string | null;
  isAuthenticated: boolean;
  hasHydrated: boolean;

  // Actions
  setSession: (session: AuthSessionPayload) => void;
  clearSession: () => void;
  updateUser: (partial: Partial<AuthUser>) => void;
  setHasHydrated: (hydrated: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      idToken: null,
      isAuthenticated: false,
      hasHydrated: false,

      setSession: ({ user, accessToken, idToken = null }) =>
        set({
          user,
          accessToken,
          idToken,
          isAuthenticated: Boolean(user && accessToken),
        }),

      clearSession: () =>
        set({
          user: null,
          accessToken: null,
          idToken: null,
          isAuthenticated: false,
        }),

      updateUser: (partial) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...partial } : null,
        })),

      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
    }),
    {
      name: "onlypays_auth_store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        idToken: state.idToken,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
