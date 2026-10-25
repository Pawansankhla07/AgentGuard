import React from "react"
import { cn } from "@/lib/utils"

export type BadgeVariant =
  | "allow"
  | "block"
  | "warn"
  | "info"
  | "neutral"
  | "success"

interface StatusBadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  className?: string
  icon?: React.ReactNode
}

export function StatusBadge({
  children,
  variant = "neutral",
  className,
  icon,
}: StatusBadgeProps) {
  const variantStyles: Record<BadgeVariant, string> = {
    allow: "bg-[#35C98A]/12 text-[#35C98A] border-[#35C98A]/30",
    success: "bg-[#35C98A]/12 text-[#35C98A] border-[#35C98A]/30",
    block: "bg-[#FF6577]/12 text-[#FF6577] border-[#FF6577]/30",
    warn: "bg-[#F2B84B]/12 text-[#F2B84B] border-[#F2B84B]/30",
    info: "bg-[#55B9F5]/12 text-[#55B9F5] border-[#55B9F5]/30",
    neutral: "bg-[#98A7BB]/10 text-[#98A7BB] border-[#263246]",
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-xs font-mono font-medium border uppercase tracking-wider",
        variantStyles[variant],
        className
      )}
    >
      {icon && <span className="inline-block">{icon}</span>}
      {children}
    </span>
  )
}
