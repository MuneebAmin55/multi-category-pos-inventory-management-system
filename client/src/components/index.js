/**
 * @file src/components/index.js
 * @description Barrel export for common and layout components.
 */

export { default as ProtectedRoute } from './ProtectedRoute';
export { default as RoleProtectedRoute } from './RoleProtectedRoute';
export { default as Header } from './Header';
export { default as Sidebar } from './Sidebar';

// Layout sub-components
export { default as BaseLayout } from './layout/BaseLayout';
export { default as ResponsiveSidebar } from './layout/ResponsiveSidebar';
export { default as Navbar } from './layout/Navbar';
export { default as Breadcrumb } from './layout/Breadcrumb';
export { default as NotificationsDropdown } from './layout/NotificationsDropdown';
export { default as UserProfileDropdown } from './layout/UserProfileDropdown';
export { default as MobileBottomNav } from './layout/MobileBottomNav';
