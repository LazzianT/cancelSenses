import { useState } from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, Sliders, BarChart3, ChevronLeft, ChevronRight, ShieldAlert } from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export default function Sidebar({ currentTab, setCurrentTab }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'prediction', name: 'Prediction', icon: Sliders },
    { id: 'analytics', name: 'Analytics', icon: BarChart3 },
  ];

  return (
    <motion.div
      animate={{ width: isCollapsed ? '84px' : '280px' }}
      transition={{ type: 'spring', stiffness: 200, damping: 25 }}
      className="h-screen sticky top-0 bg-brand-bg flex flex-col justify-between p-4 z-50 select-none border-r border-slate-300/40"
    >
      <div>
        {/* LOGO AREA: Layered Geometry */}
        <div className="flex items-center gap-3.5 px-2 py-4 mb-10 overflow-hidden whitespace-nowrap">
          <motion.div 
            whileHover={{ scale: 1.1, rotate: 180 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
            className="w-11 h-11 rounded-xl bg-brand-surface shadow-neo-out flex items-center justify-center relative flex-shrink-0 cursor-pointer"
          >
            <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-brand-blue to-brand-orange animate-pulse" />
          </motion.div>
          
          {!isCollapsed && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col font-sans"
            >
              <span className="text-xl font-black tracking-tight text-brand-text">
                CANCEL<span className="text-brand-blue font-light">SENSE</span>
              </span>
              <span className="text-[9px] font-extrabold tracking-[0.2em] text-brand-orange uppercase -mt-1">
                Risk Intelligence
              </span>
            </motion.div>
          )}
        </div>

        {/* NAVIGATION MENUS */}
        <nav className="space-y-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button key={item.id} onClick={() => setCurrentTab(item.id)} className="w-full relative block">
                <motion.div
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 ${
                    isActive 
                      ? 'shadow-neo-in text-brand-blue font-bold' 
                      : 'shadow-neo-btn text-brand-muted hover:text-brand-text hover:shadow-neo-out'
                  }`}
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-brand-orange rotate-12' : 'text-brand-muted'}`} />
                  {!isCollapsed && (
                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm tracking-wide font-medium">
                      {item.name}
                    </motion.span>
                  )}
                </motion.div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* COLLAPSE TOGGLE */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="w-full flex items-center justify-center p-3 rounded-xl shadow-neo-btn text-brand-muted hover:text-brand-text active:shadow-neo-btn-active transition-all duration-200"
      >
        {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
      </button>
    </motion.div>
  );
}