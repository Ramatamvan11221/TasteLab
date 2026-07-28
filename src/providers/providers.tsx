"use client";

import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            border: "3px solid var(--color-tastelab-black)",
            borderRadius: "0.75rem",
            boxShadow: "4px 4px 0 0 var(--color-tastelab-black)",
            fontWeight: 600,
          },
        }}
      />
    </>
  );
}
