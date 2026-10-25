import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface MetricCardProps {
  label: string
  value: string | number
  subtext?: string
  color?: string
  icon?: React.ReactNode
  className?: string
}

export function MetricCard({
  label,
  value,
  subtext,
  color,
  icon,
  className,
}: MetricCardProps) {
  return (
    <Card className={cn("overflow-hidden border-[#263246] bg-[#121925]/90 hover:border-[#3B4A63] transition-all", className)}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold tracking-wider text-[#98A7BB] uppercase">
            {label}
          </span>
          {icon && <div className="text-[#98A7BB] opacity-80">{icon}</div>}
        </div>
        <div
          className="mt-2 text-2xl font-bold font-mono tracking-tight text-[#F1F5FB]"
          style={color ? { color } : undefined}
        >
          {value}
        </div>
        {subtext && (
          <div className="mt-1 text-xs text-[#98A7BB]/80 truncate">
            {subtext}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
