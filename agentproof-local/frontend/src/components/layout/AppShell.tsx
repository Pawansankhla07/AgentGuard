import React, { useState } from "react"
import { Sidebar } from "@/components/layout/Sidebar"
import { Topbar } from "@/components/layout/Topbar"
import { HealthInfo } from "@/types"
import { NAV_ITEMS } from "@/types/navigation"

interface AppShellProps {
  currentTab: string
  onSelectTab: (tab: string) => void
  health: HealthInfo | null
  onRefreshHealth: () => void
  isRefreshing: boolean
  children: React.ReactNode
}

export function AppShell({
  currentTab,
  onSelectTab,
  health,
  onRefreshHealth,
  isRefreshing,
  children,
}: AppShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // If on landing page, display clean full canvas view
  if (currentTab === "landing") {
    return <>{children}</>
  }

  const activeItem = NAV_ITEMS.find((item) => item.id === currentTab)
  const activeLabel = activeItem ? activeItem.label : "Dashboard"

  return (
    <div className="min-h-screen bg-[#050608] text-[#F5F7FC]">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar
          currentTab={currentTab}
          onSelectTab={onSelectTab}
          health={health}
          onRefreshHealth={onRefreshHealth}
          isRefreshing={isRefreshing}
        />
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative z-10 w-64 bg-[#0A0C11]">
            <Sidebar
              currentTab={currentTab}
              onSelectTab={(tab) => {
                onSelectTab(tab)
                setMobileMenuOpen(false)
              }}
              health={health}
              onRefreshHealth={onRefreshHealth}
              isRefreshing={isRefreshing}
            />
          </div>
        </div>
      )}

      {/* Main Workspace */}
      <div className="flex flex-col md:pl-64">
        <Topbar
          onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
          health={health}
          activeTabLabel={activeLabel}
          onOpenShowcase={() => onSelectTab("landing")}
        />
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
