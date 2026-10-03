'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  User, 
  LogOut, 
  LayoutDashboard, 
  Settings, 
  ShieldCheck, 
  ChevronDown,
  Sparkles,
  FileText
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { AuthModal } from '@/components/auth/AuthModal';

export function UserNav() {
  const { user, userProfile, isAdmin, logout, loading } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (loading) {
    return (
      <div className="h-9 w-24 bg-secondary animate-pulse rounded-xl" />
    );
  }

  if (!user) {
    return (
      <>
        <button
          type="button"
          onClick={() => setAuthModalOpen(true)}
          className="h-9 px-3.5 bg-primary text-white hover:bg-primary/90 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
        >
          <User className="h-3.5 w-3.5" />
          <span>Sign In</span>
        </button>

        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
        />
      </>
    );
  }

  const displayName = userProfile?.displayName || userProfile?.username || user.displayName || user.email?.split('@')[0] || 'My Account';
  const initial = (displayName.charAt(0) || 'U').toUpperCase();

  const handleLogout = async () => {
    await logout();
    setDropdownOpen(false);
    router.push('/');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 bg-secondary hover:bg-secondary/80 border border-border/80 rounded-xl transition-all cursor-pointer text-xs font-bold text-foreground"
      >
        {user.photoURL ? (
          <img src={user.photoURL} alt={displayName} className="w-6 h-6 rounded-full object-cover" />
        ) : (
          <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-black">
            {initial}
          </div>
        )}
        <span className="hidden sm:inline-block max-w-[120px] truncate">{displayName}</span>
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-card border border-border/80 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in duration-150">
          <div className="px-3 py-2 border-b border-border/60 mb-1">
            <p className="text-xs font-bold text-foreground truncate">{displayName}</p>
            <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
            {userProfile?.username && (
              <p className="text-[10px] text-primary font-mono mt-0.5">@{userProfile.username}</p>
            )}
          </div>

          <Link
            href="/dashboard"
            onClick={() => setDropdownOpen(false)}
            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl hover:bg-secondary text-foreground transition-colors"
          >
            <LayoutDashboard className="h-3.5 w-3.5 text-primary" />
            <span>My Invoices Dashboard</span>
          </Link>

          <Link
            href="/invoice/gst"
            onClick={() => setDropdownOpen(false)}
            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl hover:bg-secondary text-foreground transition-colors"
          >
            <FileText className="h-3.5 w-3.5 text-blue-600" />
            <span>Create GST Invoice</span>
          </Link>

          <Link
            href="/invoice/nongst"
            onClick={() => setDropdownOpen(false)}
            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl hover:bg-secondary text-foreground transition-colors"
          >
            <FileText className="h-3.5 w-3.5 text-amber-600" />
            <span>Create Non-GST Bill</span>
          </Link>

          {isAdmin && (
            <Link
              href="/admin"
              onClick={() => setDropdownOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl hover:bg-secondary text-foreground transition-colors"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>Admin Portal</span>
            </Link>
          )}

          <div className="border-t border-border/60 my-1" />

          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl hover:bg-destructive/10 text-destructive transition-colors cursor-pointer text-left"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </div>
  );
}
