/**
 * @file src/layouts/MainLayout.jsx
 * @description Main layout entry proxying to the dynamic role-based layout switcher.
 */

import RoleBasedLayout from './RoleBasedLayout';

const MainLayout = () => {
  return <RoleBasedLayout />;
};

export default MainLayout;
