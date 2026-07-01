// src/components/layout/PublicLayout.jsx
import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

/**
 * PublicLayout - Layout untuk halaman publik (Home, Laptop, Brand, About)
 * Includes: Navbar + main content + Footer
 * Background: Gradasi cerah dari Home.jsx yang disesuaikan dengan palet warna baru
 */
export default function PublicLayout({ children }) {
  return (
    <div
      className="flex flex-col min-h-screen transition-colors"
      style={{
        background: "linear-gradient(145deg, #DBEAFE 0%, #EFF6FF 50%, #F0F9FF 100%)",
        fontFamily: "'Inter', sans-serif"
      }}
    >
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
