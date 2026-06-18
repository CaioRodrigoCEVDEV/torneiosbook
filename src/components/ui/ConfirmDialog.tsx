"use client";

import type { ReactNode } from "react";
import { Button } from "./Button";

interface ConfirmDialogProps {
  message: string;
  children: ReactNode;
  className?: string;
  type?: "button" | "submit";
}

export function ConfirmDialog({ message, children, className, type = "submit" }: ConfirmDialogProps) {
  return (
    <Button
      type={type}
      variant="secondary"
      className={className}
      onClick={(event) => {
        if (!window.confirm(message)) {
          event.preventDefault();
          event.stopPropagation();
        }
      }}
    >
      {children}
    </Button>
  );
}
