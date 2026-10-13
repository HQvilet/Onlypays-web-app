import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useUIStore } from "./use-ui-store";

const resetUIStore = () => {
  useUIStore.setState({
    sidebarOpen: false,
    activeFeedTab: "for-you",
    activeMarketplaceCategory: "all",
    activeModal: null,
    toasts: [],
  });
};

describe("useUIStore", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    resetUIStore();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it("toggles the sidebar open state", () => {
    expect(useUIStore.getState().sidebarOpen).toBe(false);

    useUIStore.getState().toggleSidebar();

    expect(useUIStore.getState().sidebarOpen).toBe(true);
  });

  it("opens and closes the active modal", () => {
    useUIStore.getState().openModal("topup-opx");

    expect(useUIStore.getState().activeModal).toBe("topup-opx");

    useUIStore.getState().closeModal();

    expect(useUIStore.getState().activeModal).toBeNull();
  });

  it("adds a toast and removes it after the timeout", () => {
    useUIStore.getState().addToast({
      type: "success",
      message: "Saved",
      durationMs: 1000,
    });

    expect(useUIStore.getState().toasts).toHaveLength(1);
    expect(useUIStore.getState().toasts[0]).toMatchObject({
      type: "success",
      message: "Saved",
    });

    vi.advanceTimersByTime(1000);

    expect(useUIStore.getState().toasts).toHaveLength(0);
  });

  it("removes a toast by id", () => {
    useUIStore.getState().addToast({
      type: "info",
      message: "Queued",
      durationMs: 5000,
    });

    const [{ id }] = useUIStore.getState().toasts;

    useUIStore.getState().removeToast(id);

    expect(useUIStore.getState().toasts).toHaveLength(0);
  });
});