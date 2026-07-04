// components/layout/Navbar.jsx (Fixed for mobile)
import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "./../assets/image/logo.png";
import {
  BookOpen,
  Bell,
  ChevronDown,
  Menu,
  X,
  Calendar,
  Home,
  User,
  Award,
  Clock,
  TrendingUp,
  Settings,
  Sparkles,
  LogOut,
  LogIn,
  UserPlus,
  Zap,
  ChevronRight,
  FolderGit2,
} from "lucide-react";
import ProfileModal from "./ui/ProfileModal"; 

const Navbar = ({ isAuthenticated, user, onLogout, onAuthModalOpen }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const profileMenuRef = useRef(null);
  const notificationsRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Check if mobile/tablet view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Scroll effect
  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menus on resize
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Close menus on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setIsProfileMenuOpen(false);
      }
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target)
      ) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsProfileMenuOpen(false);
    setShowProfileModal(false);
  }, [location]);

  // Handle logout
  const handleLogout = (e) => {
    e.preventDefault();
    onLogout();
    setIsProfileMenuOpen(false);
    setShowProfileModal(false);
    navigate("/");
  };

  // Handle auth modal open
  const handleAuthModalOpen = (mode, e) => {
    e?.preventDefault();
    onAuthModalOpen(mode);
    setIsMobileMenuOpen(false);
  };

  const handleProfileClick = () => {
    if (isMobile) {
      setShowProfileModal(true);
    } else {
      setIsProfileMenuOpen(!isProfileMenuOpen);
    }
  };

  const handleNavigation = (path) => {
    navigate(path);
    setIsProfileMenuOpen(false);
    setShowProfileModal(false);
    setIsMobileMenuOpen(false);
  };

  // Mock notifications
  const notifications = [
    {
      id: 1,
      title: "New Lesson Available",
      message: "Advanced React Patterns",
      time: "5 min ago",
      read: false,
      icon: BookOpen,
      color: "blue",
    },
    {
      id: 2,
      title: "Certificate Ready",
      message: "Web Development Fundamentals",
      time: "1 hr ago",
      read: false,
      icon: Award,
      color: "green",
    },
    {
      id: 3,
      title: "Upcoming Deadline",
      message: "Final Project Submission",
      time: "2 hrs ago",
      read: true,
      icon: Clock,
      color: "amber",
    },
  ];

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Dynamic classes
  const glassNav = isScrolled
    ? "bg-white/95 backdrop-blur-xl border-b border-gray-200/80 shadow-lg shadow-gray-200/20"
    : "bg-gradient-to-r from-indigo-900/95 to-purple-900/95 backdrop-blur-md border-b border-white/20";

  const textPrimary = isScrolled ? "text-gray-800" : "text-white";
  const textMuted = isScrolled ? "text-gray-500" : "text-white/70";
  const hoverBg = isScrolled ? "hover:bg-indigo-50" : "hover:bg-white/15";
  const activeBg = isScrolled
    ? "bg-indigo-50 text-indigo-600"
    : "bg-white/20 text-white";
  const ringColor = isScrolled ? "ring-gray-200" : "ring-white/30";

  // Updated navLinks - only keep Home, My Lessons, Projects, Calendar
  const navLinks = [
    { name: "Home", href: "/home", icon: Home },
    { name: "My Lessons", href: "/lessons", icon: BookOpen },
    { name: "Projects", href: "/projects", icon: FolderGit2 },
    { name: "Calendar", href: "/calendar", icon: Calendar },
  ];

  const profileLinks = [
    { name: "My Profile", path: "/profile", icon: User },
    { name: "Certificates", path: "/certificates", icon: Award },
    { name: "Settings", path: "/settings", icon: Settings },
  ];

  return (
    <>
      <style>{`
        @keyframes slideInFromTop {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-in {
          animation: slideInFromTop 0.2s ease-out;
        }
        
        .bg-grid-white {
          background-image: url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.1' fill-rule='evenodd'%3E%3Cpath d='M0 0h40v40H0z'/%3E%3C/g%3E%3C/svg%3E");
        }

        .dropdown-panel {
          position: absolute;
          right: 0;
          top: calc(100% + 12px);
          width: 320px;
          z-index: 50;
        }

        @media (max-width: 400px) {
          .dropdown-panel {
            position: fixed;
            left: 8px;
            right: 8px;
            width: auto;
            top: 68px;
          }
        }

        @media (min-width: 401px) and (max-width: 640px) {
          .dropdown-panel {
            max-width: calc(100vw - 16px);
          }
        }
      `}</style>

      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${glassNav}`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            {/* Logo and Mobile Menu Button */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={`lg:hidden relative group flex items-center justify-center w-10 h-10 rounded-xl transition-all ${hoverBg} ${textPrimary}`}
                aria-label="Toggle menu"
              >
                <div className="absolute inset-0 rounded-xl bg-current opacity-0 group-hover:opacity-10 transition-opacity" />
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5 relative z-10" />
                ) : (
                  <Menu className="h-5 w-5 relative z-10" />
                )}
              </button>

              <Link
                to="/"
                className="flex items-center gap-3 group select-none"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-xl blur-lg opacity-60 group-hover:opacity-100 transition-opacity" />
                  <div className="relative flex items-center justify-center w-10 h-10 rounded-xl group-hover:shadow-xl group-hover:shadow-indigo-500/40 group-hover:scale-110 transition-all duration-300">
                    <img
                      src={logo}
                      alt="LearnFlow Logo"
                      className="w-full h-full absolute left-1"
                    />
                  </div>
                </div>
                <span
                  className={`text-xl font-bold tracking-tight whitespace-nowrap transition-colors duration-300 ${
                    isScrolled ? "text-gray-900" : "text-white"
                  }`}
                >
                  E
                  <span
                    className={
                      isScrolled ? "text-indigo-600" : "text-indigo-300"
                    }
                  >
                    learning
                  </span>
                </span>
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center gap-1 flex-1 justify-center">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    to={link.href}
                    className={`
                      relative group flex items-center gap-2 px-4 py-2 rounded-xl
                      text-sm font-medium transition-all duration-200
                      ${
                        isActive
                          ? activeBg
                          : isScrolled
                            ? `text-gray-600 ${hoverBg} hover:text-indigo-600`
                            : `text-white/80 ${hoverBg} hover:text-white`
                      }
                    `}
                  >
                    <link.icon
                      className="h-4 w-4"
                      strokeWidth={isActive ? 2.5 : 2}
                    />
                    {link.name}

                    {isActive && (
                      <span
                        className={`absolute -bottom-1 left-3 right-3 h-0.5 rounded-full ${
                          isScrolled
                            ? "bg-gradient-to-r from-indigo-500 to-purple-500"
                            : "bg-white"
                        }`}
                      />
                    )}

                    {!isActive && (
                      <span className="absolute inset-0 rounded-xl bg-current opacity-0 group-hover:opacity-5 transition-opacity" />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {isAuthenticated && user ? (
                <>
                  {/* Notifications */}
                  <div className="relative" ref={notificationsRef}>
                    <button
                      onClick={() =>
                        setIsNotificationsOpen(!isNotificationsOpen)
                      }
                      className={`relative group flex items-center justify-center w-10 h-10 rounded-xl transition-all ${hoverBg} ${textPrimary}`}
                      aria-label="Notifications"
                    >
                      <div className="absolute inset-0 rounded-xl bg-current opacity-0 group-hover:opacity-10 transition-opacity" />
                      <Bell className="h-5 w-5 relative z-10" strokeWidth={2} />

                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex min-w-[1.25rem] h-5">
                          <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 animate-ping opacity-75" />
                          <span className="relative inline-flex items-center justify-center h-5 px-1.5 rounded-full bg-gradient-to-r from-red-500 to-rose-500 text-[10px] font-bold text-white ring-2 ring-white">
                            {unreadCount > 9 ? "9+" : unreadCount}
                          </span>
                        </span>
                      )}
                    </button>

                    {isNotificationsOpen && (
                      <div className="dropdown-panel animate-in">
                        <div className="rounded-2xl bg-white shadow-2xl shadow-black/10 ring-1 ring-black/5 overflow-hidden">
                          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                            <h3 className="font-semibold text-gray-900">
                              Notifications
                            </h3>
                            {unreadCount > 0 && (
                              <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
                                {unreadCount} new
                              </span>
                            )}
                          </div>

                          <div className="max-h-96 overflow-y-auto">
                            {notifications.map((notification) => {
                              const Icon = notification.icon;
                              const colors = {
                                blue: "bg-blue-50 text-blue-600",
                                green: "bg-green-50 text-green-600",
                                amber: "bg-amber-50 text-amber-600",
                              };

                              return (
                                <div
                                  key={notification.id}
                                  className={`flex gap-3 px-5 py-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                                    !notification.read ? "bg-indigo-50/30" : ""
                                  }`}
                                >
                                  <div
                                    className={`flex-shrink-0 w-10 h-10 rounded-xl ${colors[notification.color]} flex items-center justify-center`}
                                  >
                                    <Icon className="h-5 w-5" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-gray-900">
                                      {notification.title}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                      {notification.message}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                      {notification.time}
                                    </p>
                                  </div>
                                  {!notification.read && (
                                    <span className="w-2 h-2 rounded-full bg-indigo-600 mt-2 flex-shrink-0" />
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          <div className="border-t border-gray-100 p-3">
                            <button className="w-full text-center text-sm font-medium text-indigo-600 hover:text-indigo-700 py-2 hover:bg-indigo-50 rounded-xl transition-colors">
                              View all notifications
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Profile Menu */}
                  <div className="relative" ref={profileMenuRef}>
                    <button
                      onClick={handleProfileClick}
                      className={`group flex items-center gap-3 rounded-xl pl-2 pr-3 py-1.5 transition-all ${hoverBg} ring-1 ${ringColor}`}
                    >
                      <div className="relative">
                        <img
                          src={
                            user?.avatar ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "User")}&background=6366f1&color=fff&size=128`
                          }
                          alt={user?.name}
                          className="h-8 w-8 rounded-lg object-cover ring-2 ring-indigo-400/60"
                        />
                        <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-400 border-2 border-white" />
                      </div>

                      <div className="hidden lg:block text-left">
                        <p
                          className={`text-sm font-semibold leading-tight ${textPrimary}`}
                        >
                          {user?.name?.split(" ")[0] || "User"}
                        </p>
                        <p className={`text-xs ${textMuted}`}>
                          {user?.role || "Student"}
                        </p>
                      </div>

                      <ChevronDown
                        className={`h-4 w-4 transition-transform duration-300 ${
                          isProfileMenuOpen ? "rotate-180" : ""
                        } ${textMuted}`}
                      />
                    </button>

                    {!isMobile && isProfileMenuOpen && (
                      <div className="dropdown-panel animate-in">
                        <div className="rounded-2xl bg-white shadow-2xl shadow-black/10 ring-1 ring-black/5 overflow-hidden">
                          <div className="relative px-6 py-6 bg-gradient-to-br from-indigo-600 via-indigo-600 to-purple-700">
                            <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black)]" />

                            <div className="relative flex items-center gap-4">
                              <div className="relative">
                                <img
                                  src={
                                    user?.avatar ||
                                    `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "User")}&background=6366f1&color=fff&size=128`
                                  }
                                  alt={user?.name}
                                  className="h-16 w-16 rounded-xl object-cover ring-4 ring-white/30"
                                />
                                <span className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-emerald-400 border-4 border-white" />
                              </div>

                              <div className="flex-1 min-w-0">
                                <p className="text-lg font-bold text-white truncate">
                                  {user?.name}
                                </p>
                                <p className="text-sm text-white/80 truncate">
                                  {user?.email}
                                </p>
                                <div className="flex items-center gap-2 mt-2">
                                  <span className="inline-flex items-center gap-1 text-xs bg-white/20 text-white px-2 py-1 rounded-full">
                                    <Calendar className="h-3 w-3" />
                                    Joined{" "}
                                    {user?.joinDate
                                      ? new Date(
                                          user.joinDate,
                                        ).toLocaleDateString("en-US", {
                                          month: "short",
                                          year: "numeric",
                                        })
                                      : "Recently"}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-3 gap-2 mt-5">
                              {[
                                {
                                  label: "Progress",
                                  value: user?.progress || 0,
                                  icon: TrendingUp,
                                },
                                {
                                  label: "Courses",
                                  value: user?.coursesEnrolled || 0,
                                  icon: BookOpen,
                                },
                                {
                                  label: "Certs",
                                  value: user?.certificates || 0,
                                  icon: Award,
                                },
                              ].map((stat, i) => {
                                const Icon = stat.icon;
                                return (
                                  <div
                                    key={i}
                                    className="bg-white/10 rounded-xl p-2 backdrop-blur-sm"
                                  >
                                    <div className="flex items-center gap-1.5 mb-1">
                                      <Icon className="h-3 w-3 text-white/70" />
                                      <p className="text-[10px] text-white/70">
                                        {stat.label}
                                      </p>
                                    </div>
                                    <p className="text-lg font-bold text-white">
                                      {stat.value}
                                    </p>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          <div className="py-2">
                            {profileLinks.map((item, i) => {
                              const Icon = item.icon;
                              return (
                                <button
                                  key={i}
                                  onClick={() => handleNavigation(item.path)}
                                  className="w-full group flex items-center gap-3 px-6 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50/50 transition-all"
                                >
                                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-indigo-100 flex items-center justify-center transition-colors">
                                    <Icon className="h-4 w-4 text-gray-500 group-hover:text-indigo-600 transition-colors" />
                                  </div>
                                  <div className="flex-1 min-w-0 text-left">
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium group-hover:text-indigo-700 transition-colors">
                                        {item.name}
                                      </span>
                                    </div>
                                  </div>
                                  <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-indigo-400 transition-all group-hover:translate-x-0.5" />
                                </button>
                              );
                            })}
                          </div>

                          {user?.achievements &&
                            user.achievements.length > 0 && (
                              <div className="border-t border-gray-100 px-6 py-4">
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                                  Recent Achievements
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {user.achievements.slice(0, 3).map((a, i) => (
                                    <span
                                      key={i}
                                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 text-xs font-medium rounded-full ring-1 ring-amber-200/60"
                                    >
                                      <Sparkles className="h-3 w-3" />
                                      {a}
                                    </span>
                                  ))}
                                  {user.achievements.length > 3 && (
                                    <span className="px-3 py-1.5 bg-gray-50 text-gray-600 text-xs font-medium rounded-full ring-1 ring-gray-200">
                                      +{user.achievements.length - 3} more
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}

                          <div className="border-t border-gray-100 p-2">
                            <button
                              onClick={handleLogout}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors group"
                            >
                              <div className="w-8 h-8 rounded-lg bg-red-50 group-hover:bg-red-100 flex items-center justify-center transition-colors">
                                <LogOut className="h-4 w-4" />
                              </div>
                              <span>Sign out</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-3">
                  <button
                    onClick={(e) => handleAuthModalOpen("signin", e)}
                    className={`group relative hidden sm:flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium transition-all ${hoverBg} ${textPrimary} overflow-hidden`}
                  >
                    <span className="absolute inset-0 bg-current opacity-0 group-hover:opacity-5 transition-opacity" />
                    <LogIn className="h-4 w-4" />
                    Sign In
                  </button>

                  <button
                    onClick={(e) => handleAuthModalOpen("signup", e)}
                    className="group relative flex items-center gap-2 px-5 sm:px-6 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 hover:scale-105 active:scale-100 transition-all duration-300 overflow-hidden"
                  >
                    <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity" />
                    <Zap className="h-4 w-4" />
                    <span className="hidden sm:inline">Get Started Free</span>
                    <span className="sm:hidden">Join</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu - This now correctly uses the updated navLinks */}
        <div
          className={`lg:hidden transition-all duration-300 ease-in-out overflow-hidden ${
            isMobileMenuOpen ? "max-h-[32rem] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div
            className={`border-t ${isScrolled ? "border-gray-200/60" : "border-white/20"} ${
              isScrolled
                ? "bg-white/95 backdrop-blur-xl"
                : "bg-gray-900/95 backdrop-blur-xl"
            }`}
          >
            <div className="px-4 py-3 space-y-1">
              {/* Mobile menu items - now only showing Home, My Lessons, Projects, Calendar */}
              {navLinks.map((link) => {
                const isActive = location.pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    to={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                      ${
                        isActive
                          ? isScrolled
                            ? "bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700"
                            : "bg-white/20 text-white"
                          : isScrolled
                            ? "text-gray-600 hover:bg-gray-50 hover:text-indigo-600"
                            : "text-white/80 hover:bg-white/10 hover:text-white"
                      }
                    `}
                  >
                    <link.icon className="h-5 w-5" />
                    <span className="flex-1">{link.name}</span>
                    {isActive && (
                      <span
                        className={`text-xs font-bold px-2 py-1 rounded-full ${
                          isScrolled
                            ? "bg-indigo-100 text-indigo-700"
                            : "bg-white/30 text-white"
                        }`}
                      >
                        Active
                      </span>
                    )}
                  </Link>
                );
              })}

              {/* Mobile Auth Buttons */}
              {!isAuthenticated && (
                <div className="pt-4 mt-3 border-t border-white/15 space-y-2">
                  <button
                    onClick={(e) => {
                      handleAuthModalOpen("signin", e);
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/15 text-white text-sm font-medium hover:bg-white/25 transition-colors"
                  >
                    <LogIn className="h-4 w-4" />
                    Sign In
                  </button>
                  <button
                    onClick={(e) => {
                      handleAuthModalOpen("signup", e);
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-bold shadow-lg"
                  >
                    <UserPlus className="h-4 w-4" />
                    Create Free Account
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Profile Modal for Mobile/Tablet */}
      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        user={user}
        onLogout={onLogout}
        profileLinks={profileLinks}
      />
    </>
  );
};

export default Navbar;
