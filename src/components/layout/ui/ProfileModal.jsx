// components/layout/ui/ProfileModal.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  LayoutDashboard,
  BookOpen,
  Award,
  Calendar,
  TrendingUp,
  Settings,
  LogOut,
  X,
  ChevronRight,
  GraduationCap,
  Clock,
  Star
} from "lucide-react";

const ProfileModal = ({ isOpen, onClose, user, onLogout }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const menuItems = [
    { icon: User, label: "My Profile", path: "/profile", color: "#8b5cf6" },
    { icon: Award, label: "Certificates", path: "/certificates", color: "#f59e0b" },
    { icon: Settings, label: "Settings", path: "/settings", color: "#6b7280" },
  ];

  const handleNavigation = (path) => {
    navigate(path);
    onClose();
  };

  const handleLogout = () => {
    onLogout();
    onClose();
  };

  // Get first name
  const firstName = user?.name?.split(' ')[0] || 'User';

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 z-[100] transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        style={{ backdropFilter: 'blur(4px)' }}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-[101] bg-white dark:bg-[#1a1a35] rounded-t-3xl shadow-2xl transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{
          maxHeight: '85vh',
          overflowY: 'auto',
          borderTopLeftRadius: '24px',
          borderTopRightRadius: '24px',
        }}
      >
        {/* Handle/Drag indicator */}
        <div className="sticky top-0 bg-white dark:bg-[#1a1a35] pt-4 pb-2 px-6 border-b border-gray-100 dark:border-[#2a2a4a]">
          <div className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-4" />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl overflow-hidden ring-4 ring-indigo-100 dark:ring-indigo-900/30">
                  <img
                    src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=6366f1&color=fff&size=128`}
                    alt={user?.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-[#1a1a35]" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                  {user?.name || 'User'}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {user?.email || 'user@example.com'}
                </p>
                <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold mt-0.5">
                  {user?.role || 'Student'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-[#252545] flex items-center justify-center hover:bg-gray-200 dark:hover:bg-[#2a2a4a] transition-colors"
            >
              <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="text-center p-2 rounded-xl bg-indigo-50 dark:bg-indigo-900/20">
              <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                {user?.coursesEnrolled || 0}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Enrolled</p>
            </div>
            <div className="text-center p-2 rounded-xl bg-green-50 dark:bg-green-900/20">
              <p className="text-lg font-bold text-green-600 dark:text-green-400">
                {user?.certificates || 0}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Certificates</p>
            </div>
            <div className="text-center p-2 rounded-xl bg-amber-50 dark:bg-amber-900/20">
              <p className="text-lg font-bold text-amber-600 dark:text-amber-400">
                {user?.progress || 0}%
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Progress</p>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="p-4">
          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  onClick={() => handleNavigation(item.path)}
                  className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-[#252545] transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: `${item.color}15` }}
                    >
                      <Icon className="h-5 w-5" style={{ color: item.color }} />
                    </div>
                    <span className="font-semibold text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">
                      {item.label}
                    </span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
                </button>
              );
            })}
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors group mt-2"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-900/30 flex items-center justify-center group-hover:bg-red-100 dark:group-hover:bg-red-900/40">
                <LogOut className="h-5 w-5 text-red-500" />
              </div>
              <span className="font-semibold text-red-600 dark:text-red-400 group-hover:text-red-700 dark:group-hover:text-red-300">
                Sign Out
              </span>
            </div>
          </button>
        </div>

        {/* Footer */}
        <div className="px-4 pb-6 text-center">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Joined {user?.joinDate ? new Date(user.joinDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'recently'}
          </p>
        </div>
      </div>
    </>
  );
};

export default ProfileModal;