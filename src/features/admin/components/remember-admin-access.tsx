"use client";

import { useEffect } from "react";
import { markAdminAccess } from "../lib/admin-access-hint";

export function RememberAdminAccess() {
  useEffect(() => {
    markAdminAccess();
  }, []);

  return null;
}
