"use client";

import { useSyncExternalStore } from "react";

export const ADMIN_ACCESS_HINT_KEY = "talleryeu-admin-access";

export function markAdminAccess() {
  localStorage.setItem(ADMIN_ACCESS_HINT_KEY, "1");
}

function subscribe(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  return () => window.removeEventListener("storage", onStoreChange);
}

function getSnapshot() {
  return localStorage.getItem(ADMIN_ACCESS_HINT_KEY) === "1";
}

function getServerSnapshot() {
  return false;
}

export function useAdminAccessHint() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
