/**
 * @file src/components/layout/NotificationsDropdown.jsx
 * @description Interactive notification dropdown placeholder with mock system alerts.
 */

import { useState, useRef, useEffect } from 'react';
import {
  HiOutlineBell,
  HiOutlineCheckCircle,
  HiOutlineExclamation,
  HiOutlineClock,
  HiOutlineSparkles,
} from 'react-icons/hi';

const INITIAL_NOTIFICATIONS = [
  {
    id: 1,
    title: 'Low Stock Alert',
    message: 'Organic Cold Milk (SKU: COLD-001) is below reorder threshold (3 remaining).',
    type: 'warning',
    time: '10m ago',
    unread: true,
  },
  {
    id: 2,
    title: 'Item Expiring Soon',
    message: '2 units of Greek Yogurt expire in 48 hours in Cold Section B.',
    type: 'danger',
    time: '25m ago',
    unread: true,
  },
  {
    id: 3,
    title: 'Shift Transaction Logged',
    message: 'Invoice INV-20260831-XK92 completed ($148.50 via UPI).',
    type: 'success',
    time: '1h ago',
    unread: false,
  },
  {
    id: 4,
    title: 'Daily Auto-Backup',
    message: 'System inventory snapshot saved to database cluster.',
    type: 'info',
    time: '3h ago',
    unread: false,
  },
];

const NotificationsDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [filter, setFilter] = useState('all');
  const dropdownRef = useRef(null);

  const unreadCount = notifications.filter((n) => n.unread).length;

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const toggleReadStatus = (id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, unread: !n.unread } : n)));
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread') return n.unread;
    return true;
  });

  const getIcon = (type) => {
    switch (type) {
      case 'warning':
        return <HiOutlineExclamation className="w-4 h-4 text-amber-600" />;
      case 'danger':
        return <HiOutlineClock className="w-4 h-4 text-rose-600" />;
      case 'success':
        return <HiOutlineCheckCircle className="w-4 h-4 text-emerald-600" />;
      default:
        return <HiOutlineSparkles className="w-4 h-4 text-blue-600" />;
    }
  };

  const getBadgeBg = (type) => {
    switch (type) {
      case 'warning':
        return 'bg-amber-100 border-amber-200';
      case 'danger':
        return 'bg-rose-100 border-rose-200';
      case 'success':
        return 'bg-emerald-100 border-emerald-200';
      default:
        return 'bg-blue-100 border-blue-200';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open notifications"
        className="relative p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20"
      >
        <HiOutlineBell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white border border-slate-200/80 shadow-2xl z-50 overflow-hidden transform transition-all">
          {/* Header */}
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-800 text-sm">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-700">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Filter tabs */}
          <div className="flex items-center px-4 py-2 bg-white border-b border-slate-100 text-xs font-medium gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                filter === 'all' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                filter === 'unread'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {filteredNotifications.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">No notifications found</div>
            ) : (
              filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => toggleReadStatus(notification.id)}
                  className={`p-3.5 flex gap-3 hover:bg-slate-50 transition-colors cursor-pointer ${
                    notification.unread ? 'bg-blue-50/40' : ''
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl border flex items-center justify-center flex-shrink-0 ${getBadgeBg(
                      notification.type
                    )}`}
                  >
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <p className="text-xs font-semibold text-slate-800 truncate">
                        {notification.title}
                      </p>
                      <span className="text-[10px] text-slate-400 flex-shrink-0">
                        {notification.time}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                      {notification.message}
                    </p>
                  </div>
                  {notification.unread && (
                    <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 flex-shrink-0" />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-2.5 border-t border-slate-100 bg-slate-50 text-center">
            <span className="text-[11px] text-slate-500">
              System alerts refresh automatically in real-time
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsDropdown;
