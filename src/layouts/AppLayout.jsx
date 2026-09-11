import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar.jsx'
import TopBar from '../components/TopBar.jsx'
import BottomNav from '../components/BottomNav.jsx'
import MobileDrawer from '../components/MobileDrawer.jsx'

export default function AppLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <div className="flex h-full">
      <Sidebar />
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <TopBar onOpenDrawer={() => setDrawerOpen(true)} />
        <main className="flex-1 overflow-y-auto px-4 md:px-8 py-6 pb-24 lg:pb-8">
          <Outlet />
        </main>
      </div>

      <BottomNav />
    </div>
  )
}
