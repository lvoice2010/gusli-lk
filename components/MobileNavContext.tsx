"use client";

import { createContext, useContext, useState } from "react";

type Ctx = { open: boolean; setOpen: (v: boolean) => void };
const MobileNavCtx = createContext<Ctx>({ open: false, setOpen: () => {} });

export function useMobileNav() {
  return useContext(MobileNavCtx);
}

export function MobileNavProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return <MobileNavCtx.Provider value={{ open, setOpen }}>{children}</MobileNavCtx.Provider>;
}
