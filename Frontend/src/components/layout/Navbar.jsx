import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Bell, ChevronDown, LogOut, Menu, X,
  LayoutDashboard, Package, Wallet, Settings, User,
  Briefcase, Search, MessageCircle, ShoppingCart, RefreshCw
} from "lucide-react";
import { getUnreadCount } from "../../services/notificationService";

/* Fonts:
<link href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
*/

/* ─── DESIGN TOKENS (disamakan dengan halaman lain: GRAD_PRIMARY 135deg) ─ */
const GRADIENT      = "linear-gradient(135deg, #2563EB 0%, #1D4ED8 40%, #0891B2 75%, #06B6D4 100%)";
const FONT_DISPLAY  = "'Baloo 2', sans-serif";
const FONT_BODY     = "'Inter', sans-serif";

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [navSearch, setNavSearch] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);

  const handleNavSearch = (e) => {
    e.preventDefault();
    navigate(`/laptop${navSearch ? `?search=${encodeURIComponent(navSearch)}` : ""}`);
    setShowMobileMenu(false);
  };

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    const userData = sessionStorage.getItem("user");
    if (token && userData) {
      setIsLoggedIn(true);
      setUser(JSON.parse(userData));
    } else {
      setIsLoggedIn(false);
      setUnreadCount(0);
    }
    // Route changes should never leave stale menus open
    setShowDropdown(false);
    setShowMobileMenu(false);
  }, [location]);

  useEffect(() => {
    if (!isLoggedIn) return;
    const fetchCount = () =>
      getUnreadCount().then(res => setUnreadCount(res?.data?.count ?? 0)).catch(() => {});
    fetchCount();
    const interval = setInterval(fetchCount, 30000);

    // Langsung update badge saat halaman notifikasi markAsRead/markAllRead
    const onNotifRead = (e) => {
      if (e.detail?.markAll) {
        setUnreadCount(0);
      } else {
        setUnreadCount((c) => Math.max(0, c - 1));
      }
    };
    window.addEventListener("notif:read", onNotifRead);

    return () => {
      clearInterval(interval);
      window.removeEventListener("notif:read", onNotifRead);
    };
  }, [isLoggedIn]);

  // Close the account dropdown when clicking anywhere outside it
  useEffect(() => {
    if (!showDropdown) return;
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showDropdown]);

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    setIsLoggedIn(false);
    setUser(null);
    setShowDropdown(false);
    navigate("/");
  };

  const getMenuItems = () => {
    if (!user) return [];
    const baseItems = [
      { label: "Orders", href: "/orders", icon: ShoppingCart },
      { label: "Pengembalian", href: "/returns", icon: RefreshCw },
      { label: "Inspeksi", href: "/inspections", icon: Settings },
      { label: "Wallet", href: "/wallet", icon: Wallet },
      { label: "Chat", href: "/chat", icon: MessageCircle },
      { label: "Notifikasi", href: "/notifications", icon: Bell },
    ];
    const roleMenus = {
      buyer: baseItems,
      seller: [
        { label: "Dashboard", href: "/seller/dashboard", icon: LayoutDashboard },
        { label: "Produk Saya", href: "/seller/products", icon: Package },
        { label: "Orders", href: "/seller/orders", icon: ShoppingCart },
        { label: "Pengembalian", href: "/seller/returns", icon: RefreshCw },
        { label: "Wallet", href: "/seller/wallet", icon: Wallet },
        { label: "Chat", href: "/chat", icon: MessageCircle },
        { label: "Notifikasi", href: "/seller/notifications", icon: Bell },
      ],
      technician: [
        { label: "Dashboard", href: "/technician/dashboard", icon: LayoutDashboard },
        { label: "Inspection Jobs", href: "/technician/jobs", icon: Briefcase },
        { label: "Wallet", href: "/technician/wallet", icon: Wallet },
        { label: "Chat", href: "/chat", icon: MessageCircle },
        { label: "Notifikasi", href: "/technician/notifications", icon: Bell },
      ],
      admin: [
        { label: "Admin Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
        { label: "Chat", href: "/chat", icon: MessageCircle },
        { label: "Notifikasi", href: "/notifications", icon: Bell },
      ],
      owner: [
        { label: "Dashboard Owner", href: "/owner/dashboard", icon: LayoutDashboard },
        { label: "Chat", href: "/chat", icon: MessageCircle },
        { label: "Notifikasi", href: "/notifications", icon: Bell },
      ],
    };
    return roleMenus[user.role] || baseItems;
  };

  const navItems = [
    { label: "Beranda", href: "/" },
    { label: "Laptop", href: "/laptop" },
    { label: "Inspeksi", href: "/inspections" },
    { label: "Brand", href: "/brand" },
    { label: "Tentang", href: "/about" },
  ];

  return (
    <header
      className="sticky top-0 z-50 transition-colors"
      style={{ background: "#FFFFFF", borderBottom: "1px solid #E2E8F0" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16 gap-4 lg:gap-5">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
              style={{ background: GRADIENT, fontFamily: FONT_DISPLAY }}
            >
              L
            </div>
            <div className="hidden sm:block leading-tight">
              <p className="text-[15px] font-bold text-[#0F172A]" style={{ fontFamily: FONT_DISPLAY }}>
                Lap<span style={{ backgroundImage: GRADIENT, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>Nesia</span>
              </p>
              <p className="text-[10px] text-[#64748B]">Laptop & Inspeksi</p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex gap-1 flex-shrink-0">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className="relative text-[13px] font-medium px-3 py-2 rounded-lg transition-colors whitespace-nowrap"
                  style={{ color: isActive ? "#2563EB" : "#475569", background: isActive ? "rgba(37,99,235,0.08)" : "transparent" }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = "#0F172A"; e.currentTarget.style.background = "#F1F5F9"; }}
                  onMouseLeave={e => { e.currentTarget.style.color = isActive ? "#2563EB" : "#475569"; e.currentTarget.style.background = isActive ? "rgba(37,99,235,0.08)" : "transparent"; }}
                >
                  {item.label}
                  {isActive && (
                    <span
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-3/4 rounded-full"
                      style={{ background: GRADIENT }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Search — flex-1 + min-w-0 lets it shrink gracefully instead of pushing right-side actions off-screen on narrower desktop widths */}
          <form onSubmit={handleNavSearch} className="hidden lg:block flex-1 min-w-0 max-w-[260px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#94A3B8]" size={14} />
              <input
                type="text"
                placeholder="Cari model laptop..."
                value={navSearch}
                onChange={e => setNavSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm text-[#0F172A] rounded-full outline-none placeholder:text-[#94A3B8] transition-colors"
                style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", fontFamily: FONT_BODY }}
                onFocus={e => (e.target.style.borderColor = "rgba(37,99,235,0.5)")}
                onBlur={e => (e.target.style.borderColor = "#E2E8F0")}
              />
            </div>
          </form>

          {/* Right */}
          <div className="flex items-center gap-2 ml-auto flex-shrink-0">
            {isLoggedIn && user ? (
              <>
                {/* Bell */}
                <button
                  onClick={() => {
                    if (user.role === "seller") navigate("/seller/notifications");
                    else if (user.role === "technician") navigate("/technician/notifications");
                    else navigate("/notifications");
                  }}
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
                <div className="w-px h-6 bg-[#E2E8F0] hidden sm:block" />

                {/* User Dropdown */}
                <div className="relative flex-shrink-0" ref={dropdownRef}>
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center gap-2 px-2 sm:px-3 py-1.5 rounded-full transition-colors"
                    style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }}
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
                    <ChevronDown size={14} className={`hidden sm:block transition-transform flex-shrink-0 ${showDropdown ? "rotate-180" : ""}`} style={{ color: "#94A3B8" }} />
                  </button>

                  {showDropdown && (
                    <div
                      className="absolute right-0 mt-2 w-56 rounded-2xl py-2 z-50 shadow-lg"
                      style={{ background: "#FFFFFF", border: "1px solid #E2E8F0" }}
                    >
                      <div className="px-4 py-2.5 border-b border-[#E2E8F0]">
                        <p className="font-semibold text-[#0F172A] text-sm">{user.name}</p>
                        <p className="text-xs capitalize text-[#64748B]">{user.role}</p>
                      </div>

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

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors mt-1 text-[#EF4444] border-t border-[#E2E8F0]"
                        onMouseEnter={e => { e.currentTarget.style.background = "#FEF2F2"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                      >
                        <LogOut size={16} />
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="hidden sm:inline-flex items-center px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap"
                  style={{ color: "#2563EB", border: "1px solid rgba(37,99,235,0.5)", fontFamily: FONT_BODY }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(37,99,235,0.05)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="hidden sm:inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold text-[#0F172A] transition hover:brightness-110 whitespace-nowrap"
                  style={{ background: GRADIENT, fontFamily: FONT_DISPLAY }}
                >
                  Daftar
                </Link>
              </>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="lg:hidden p-2 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition flex-shrink-0"
              aria-label="Toggle menu"
              aria-expanded={showMobileMenu}
            >
              {showMobileMenu ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="lg:hidden border-t border-[#E2E8F0] bg-white px-4 py-4 space-y-3">
          {/* Search was desktop-only before; mobile users had no way to search from the navbar at all */}
          <form onSubmit={handleNavSearch}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#94A3B8]" size={14} />
              <input
                type="text"
                placeholder="Cari model laptop..."
                value={navSearch}
                onChange={e => setNavSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-sm text-[#0F172A] rounded-xl outline-none placeholder:text-[#94A3B8] transition-colors"
                style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", fontFamily: FONT_BODY }}
                onFocus={e => (e.target.style.borderColor = "rgba(37,99,235,0.5)")}
                onBlur={e => (e.target.style.borderColor = "#E2E8F0")}
              />
            </div>
          </form>

          <div className="space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setShowMobileMenu(false)}
                  className="block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
                  style={{ color: isActive ? "#2563EB" : "#475569", background: isActive ? "rgba(37,99,235,0.08)" : "transparent" }}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          {!isLoggedIn && (
            <div className="pt-3 border-t border-[#E2E8F0] flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setShowMobileMenu(false)}
                className="w-full text-center py-2.5 text-sm font-medium rounded-xl"
                style={{ color: "#2563EB", border: "1px solid rgba(37,99,235,0.5)" }}
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setShowMobileMenu(false)}
                className="w-full text-center py-2.5 text-sm font-semibold text-[#0F172A] rounded-xl"
                style={{ background: GRADIENT, fontFamily: FONT_DISPLAY }}
              >
                Daftar
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}