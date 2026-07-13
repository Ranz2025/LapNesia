import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Bell, ChevronDown, LogOut, User,
  LayoutDashboard, Package, Wallet, Settings,
  Briefcase, MessageCircle, ShoppingCart, RefreshCw
} from "lucide-react";
import { getUnreadCount } from "../../services/notificationService";

const GRADIENT     = "linear-gradient(135deg, #2563EB 0%, #1D4ED8 40%, #0891B2 75%, #06B6D4 100%)";
const FONT_DISPLAY = "'Baloo 2', sans-serif";
const FONT_BODY    = "'Inter', sans-serif";

export default function DashboardTopBar() {
  const [user, setUser]               = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate  = useNavigate();
  const location  = useLocation();
  const dropdownRef = useRef(null);

  /* ── Read user from session ── */
  useEffect(() => {
    const userData = sessionStorage.getItem("user");
    if (userData) setUser(JSON.parse(userData));
    setShowDropdown(false);
  }, [location]);

  /* ── Unread notification count ── */
  useEffect(() => {
    if (!user) return;
    const fetch = () =>
      getUnreadCount().then(r => setUnreadCount(r?.data?.count ?? 0)).catch(() => {});
    fetch();
    const id = setInterval(fetch, 30_000);
    const onRead = (e) => setUnreadCount(c => e.detail?.markAll ? 0 : Math.max(0, c - 1));
    window.addEventListener("notif:read", onRead);
    return () => { clearInterval(id); window.removeEventListener("notif:read", onRead); };
  }, [user]);

  /* ── Close dropdown on outside click ── */
  useEffect(() => {
    if (!showDropdown) return;
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setShowDropdown(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showDropdown]);

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    setShowDropdown(false);
    navigate("/");
  };

  const getMenuItems = () => {
    if (!user) return [];
    const maps = {
      buyer: [
        { label: "Orders",       href: "/orders",        icon: ShoppingCart },
        { label: "Pengembalian", href: "/returns",        icon: RefreshCw },
        { label: "Inspeksi",     href: "/inspections",    icon: Settings },
        { label: "Wallet",       href: "/wallet",         icon: Wallet },
        { label: "Chat",         href: "/chat",           icon: MessageCircle },
        { label: "Notifikasi",   href: "/notifications",  icon: Bell },
      ],
      seller: [
        { label: "Dashboard",    href: "/seller/dashboard",      icon: LayoutDashboard },
        { label: "Produk Saya",  href: "/seller/products",       icon: Package },
        { label: "Orders",       href: "/seller/orders",         icon: ShoppingCart },
        { label: "Pengembalian", href: "/seller/returns",        icon: RefreshCw },
        { label: "Wallet",       href: "/seller/wallet",         icon: Wallet },
        { label: "Chat",         href: "/chat",                  icon: MessageCircle },
        { label: "Notifikasi",   href: "/seller/notifications",  icon: Bell },
      ],
      technician: [
        { label: "Dashboard",      href: "/technician/dashboard", icon: LayoutDashboard },
        { label: "Inspection Jobs",href: "/technician/jobs",      icon: Briefcase },
        { label: "Wallet",         href: "/technician/wallet",    icon: Wallet },
        { label: "Chat",           href: "/chat",                 icon: MessageCircle },
        { label: "Notifikasi",     href: "/notifications",        icon: Bell },
      ],
      admin: [
        { label: "Admin Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
        { label: "Chat",            href: "/chat",            icon: MessageCircle },
        { label: "Notifikasi",      href: "/notifications",   icon: Bell },
      ],
      owner: [
        { label: "Dashboard Owner", href: "/owner/dashboard", icon: LayoutDashboard },
        { label: "Chat",            href: "/chat",             icon: MessageCircle },
        { label: "Notifikasi",      href: "/notifications",    icon: Bell },
      ],
    };
    return maps[user.role] || maps.buyer;
  };

  if (!user) return null;

  return (
    <div
      className="flex items-center justify-end gap-2 px-4 sm:px-6 lg:px-8 h-14"
      style={{ background: "#FFFFFF", borderBottom: "1px solid #E2E8F0" }}
    >
      {/* Bell */}
      <button
        onClick={() => navigate(user.role === "seller" ? "/seller/notifications" : "/notifications")}
        className="relative w-9 h-9 rounded-full flex items-center justify-center transition-colors flex-shrink-0"
        style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", color: "#64748B" }}
        onMouseEnter={e => { e.currentTarget.style.color = "#0F172A"; e.currentTarget.style.background = "#F1F5F9"; }}
        onMouseLeave={e => { e.currentTarget.style.color = "#64748B"; e.currentTarget.style.background = "#F8FAFC"; }}
        aria-label="Notifikasi"
      >
        <Bell size={17} />
        {unreadCount > 0 && (
          <span
            className="absolute top-0.5 right-0.5 min-w-[14px] h-3.5 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5"
            style={{ background: "#EF4444", border: "1.5px solid #FFFFFF" }}
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Divider */}
      <div className="w-px h-6 bg-[#E2E8F0]" />

      {/* User Dropdown */}
      <div className="relative flex-shrink-0" ref={dropdownRef}>
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-2 px-2 sm:px-3 py-1.5 rounded-full transition-colors"
          style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", fontFamily: FONT_BODY }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(37,99,235,0.4)")}
          onMouseLeave={e => (e.currentTarget.style.borderColor = "#E2E8F0")}
          aria-expanded={showDropdown}
        >
          <div
            className="w-[30px] h-[30px] rounded-full flex items-center justify-center text-white text-[13px] font-bold flex-shrink-0"
            style={{ background: GRADIENT, fontFamily: FONT_DISPLAY }}
          >
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <div className="hidden sm:block text-left leading-tight">
            <p className="text-[13px] font-semibold text-[#0F172A]">{user.name}</p>
            <p className="text-[10px] capitalize text-[#64748B]">{user.role}</p>
          </div>
          <ChevronDown
            size={14}
            className={`hidden sm:block transition-transform flex-shrink-0 ${showDropdown ? "rotate-180" : ""}`}
            style={{ color: "#94A3B8" }}
          />
        </button>

        {showDropdown && (
          <div
            className="absolute right-0 mt-2 w-56 rounded-2xl py-2 z-50 shadow-lg"
            style={{ background: "#FFFFFF", border: "1px solid #E2E8F0" }}
          >
            {/* Header */}
            <div className="px-4 py-2.5 border-b border-[#E2E8F0]">
              <p className="font-semibold text-[#0F172A] text-sm">{user.name}</p>
              <p className="text-xs capitalize text-[#64748B]">{user.role}</p>
            </div>

            {/* Menu items */}
            {getMenuItems().map((item) => (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setShowDropdown(false)}
                className="flex items-center gap-3 px-4 py-2 text-sm transition-colors text-[#475569]"
                onMouseEnter={e => { e.currentTarget.style.color = "#0F172A"; e.currentTarget.style.background = "#F1F5F9"; }}
                onMouseLeave={e => { e.currentTarget.style.color = "#475569"; e.currentTarget.style.background = "transparent"; }}
              >
                <item.icon size={16} style={{ color: "#2563EB" }} />
                <span>{item.label}</span>
              </Link>
            ))}

            {/* Edit Profile */}
            <Link
              to="/profile"
              onClick={() => setShowDropdown(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm transition-colors text-[#475569] border-t border-[#E2E8F0]"
              onMouseEnter={e => { e.currentTarget.style.color = "#0F172A"; e.currentTarget.style.background = "#F1F5F9"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "#475569"; e.currentTarget.style.background = "transparent"; }}
            >
              <User size={16} style={{ color: "#2563EB" }} />
              <span>Edit Profil</span>
            </Link>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors mt-1 text-[#EF4444] border-t border-[#E2E8F0]"
              onMouseEnter={e => (e.currentTarget.style.background = "#FEF2F2")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
