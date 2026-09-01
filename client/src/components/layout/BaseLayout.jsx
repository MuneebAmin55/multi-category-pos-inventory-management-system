/**
 * @file src/components/layout/BaseLayout.jsx
 * @description Master shell composing ResponsiveSidebar, Navbar, dynamic content, and MobileBottomNav.
 */

import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import ResponsiveSidebar from './ResponsiveSidebar';
import Navbar from './Navbar';
import MobileBottomNav from './MobileBottomNav';

const BaseLayout = ({
  navItems = [],
  brandTitle = 'Mart POS',
  roleSubtitle = 'Management Console',
  badgeText = 'Admin',
  badgeColor = 'bg-blue-500/20 text-blue-300 border-blue-400/30',
  terminalTitle = 'Mart POS Central',
}) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-900">
      {/* Responsive Sidebar (Desktop docked + Mobile drawer) */}
      <ResponsiveSidebar
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
        navItems={navItems}
        brandTitle={brandTitle}
        roleSubtitle={roleSubtitle}
        badgeText={badgeText}
        badgeColor={badgeColor}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <Navbar
          onToggleMobileSidebar={() => setMobileSidebarOpen((prev) => !prev)}
          terminalTitle={terminalTitle}
        />

        {/* Scrollable Page Body with bottom padding for mobile navigation bar */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-20 md:pb-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Touchscreen Mobile Bottom Bar */}
      <MobileBottomNav navItems={navItems} />
    </div>
  );
};

export default BaseLayout;
