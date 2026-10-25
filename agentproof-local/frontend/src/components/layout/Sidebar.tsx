import React from "react"
import { Shield, Cpu, RefreshCw } from "lucide-react"
import { StatusBadge } from "@/components/ui/status-badge"
import { HealthInfo } from "@/types"
import { NAV_ITEMS } from "@/types/navigation"

interface SidebarProps {
  currentTab: string
  onSelectTab: (tab: string) => void
  health: HealthInfo | null
  onRefreshHealth: () => void
  isRefreshing: boolean
}

export function Sidebar({
  currentTab,
  onSelectTab,
  health,
  onRefreshHealth,
  isRefreshing,
}: SidebarProps) {
  const isOllamaConnected = health?.ollama?.connected ?? false

  return (
    <aside className="fixed left-0 top-0 z-30 flex h-screen w-64 flex-col border-r border-white/10 bg-[#0A0C11] transition-all">
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between border-b border-white/10 px-5">
        <button
          onClick={() => onSelectTab("landing")}
          className="flex items-center gap-2.5 text-left focus:outline-none"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 border border-white/20 text-white shadow-[0_0_12px_rgba(255,255,255,0.15)]">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm font-bold tracking-tight text-[#F5F7FC]">AgentGuard</div>
            <div className="text-[10px] font-mono tracking-wider text-neutral-400 uppercase">Local Security</div>
          </div>
        </button>
        <StatusBadge variant="neutral" className="text-[10px] px-1.5 py-0 border-white/10 bg-white/5 text-[#A3A9B7]">
          v1.0
        </StatusBadge>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4" aria-label="Main Navigation">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = currentTab === item.id
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                isActive
                  ? "bg-white/15 text-white border border-white/30 font-semibold shadow-[0_0_12px_rgba(255,255,255,0.1)]"
                  : "text-[#A3A9B7] hover:bg-[#10131A] hover:text-[#F5F7FC] border border-transparent"
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? "text-white" : "text-[#727B8D]"}`} />
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>

      {/* System Status Footer */}
      <div className="border-t border-white/10 p-4 bg-[#050608]/80">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-mono font-medium text-[#A3A9B7] flex items-center gap-1.5">
            <Cpu className="h-3.5 w-3.5 text-white" /> Local Ollama
          </span>
          <button
            onClick={onRefreshHealth}
            disabled={isRefreshing}
            className="text-[#727B8D] hover:text-[#F5F7FC] transition-colors p-1"
            title="Refresh connection status"
          >
            <RefreshCw className={`h-3 w-3 ${isRefreshing ? "animate-spin text-white" : ""}`} />
          </button>
        </div>

        <div className="flex items-center justify-between text-xs">
          <StatusBadge
            variant={isOllamaConnected ? "allow" : "warn"}
            className="text-[10px]"
          >
            {isOllamaConnected ? "OLLAMA ONLINE" : "OFFLINE"}
          </StatusBadge>
          <span className="font-mono text-[11px] text-[#A3A9B7] truncate max-w-[90px]">
            {health?.default_model || "gemma4"}
          </span>
        </div>

        <div className="mt-3 text-[10px] text-[#727B8D] font-mono flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-[#35C98A]" />
          <span>Air-Gapped Policy Engine</span>
        </div>
      </div>
    </aside>
  )
}
