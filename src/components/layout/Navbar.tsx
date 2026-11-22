import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Menu, X, User, LogOut, ChevronRight, Globe } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../lib/utils';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => setIsOpen(false), [location]);

  const navLinks = [
    { name: 'Initiatives', path: '/initiatives' },
    { name: 'Impact', path: '/impact' },
    { name: 'The Auditor', path: '/auditor' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  const isHomePage = location.pathname === '/';

  return (
    <nav 
      className={cn(
        "fixed top-0 left-0 w-full z-50 transition-all duration-500 px-6 py-4",
        scrolled ? "py-3" : "py-6"
      )}
    >
      <div 
        className={cn(
          "max-w-7xl mx-auto rounded-full transition-all duration-500 flex items-center justify-between px-6 py-2 border",
          scrolled 
            ? "bg-white/80 backdrop-blur-xl border-slate-200/50 shadow-lg shadow-slate-200/20" 
            : "bg-transparent border-transparent"
        )}
      >
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className={cn(
            "w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-500 group-hover:rotate-12",
            scrolled ? "bg-slate-900 text-white" : "bg-slate-900 text-white shadow-xl"
          )}>
            <Shield size={18} />
          </div>
          <span className="text-sm font-display font-bold tracking-tighter uppercase transition-colors duration-500 text-slate-900">
            Public Assembly
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className="text-[11px] font-display font-bold uppercase tracking-widest transition-all hover:opacity-70 text-slate-600 hover:text-slate-900"
            >
              {link.name}
            </Link>
          ))}
          
          <div className="h-4 w-px mx-2 transition-colors bg-slate-200" />

          {user ? (
            <div className="flex items-center gap-4">
              <Link 
                to="/profile"
                className="text-[11px] font-display font-bold uppercase tracking-widest transition-all text-slate-900"
              >
                Profile
              </Link>
              <Link 
                to="/initiatives"
                className="text-[11px] font-display font-bold uppercase tracking-widest transition-all text-slate-900"
              >
                Explore
              </Link>
              <button 
                onClick={logout}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-all bg-slate-100 text-slate-600 hover:bg-slate-200"
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <Link to="/login">
              <button className={cn(
                "px-6 py-2 rounded-full text-[11px] font-display font-bold uppercase tracking-widest transition-all",
                scrolled 
                  ? "bg-slate-900 text-white hover:bg-slate-800" 
                  : "bg-slate-900 text-white hover:bg-prospera-blue shadow-xl"
              )}>
                Join Assembly
              </button>
            </Link>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden w-10 h-10 rounded-full flex items-center justify-center transition-all bg-slate-100 text-slate-900"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 w-full px-6 py-4 md:hidden"
          >
            <div className="bg-white rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden">
              <div className="p-8 space-y-6">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    className="flex items-center justify-between group"
                  >
                    <span className="text-2xl font-display font-medium text-slate-900 group-hover:translate-x-2 transition-transform">
                      {link.name}
                    </span>
                    <ChevronRight className="text-slate-300 group-hover:text-prospera-blue transition-colors" />
                  </Link>
                ))}
                
                <div className="pt-6 border-t border-slate-100">
                  {user ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                        <div className="w-10 h-10 rounded-full bg-prospera-blue flex items-center justify-center text-white font-bold">
                          {user.fullName?.[0] || 'U'}
                        </div>
                        <div>
                          <p className="text-sm font-display font-bold text-slate-900">{user.fullName}</p>
                          <p className="text-[10px] text-slate-400 uppercase tracking-widest">Active Member</p>
                        </div>
                      </div>
                      <Link to="/profile" className="block w-full py-4 text-center bg-white border border-slate-200 text-slate-900 rounded-2xl font-display font-bold text-sm">
                        My Profile
                      </Link>
                      <Link to="/initiatives" className="block w-full py-4 text-center bg-slate-900 text-white rounded-2xl font-display font-bold text-sm">
                        Explore Initiatives
                      </Link>
                      <button 
                        onClick={logout}
                        className="w-full py-4 text-center border border-slate-200 text-slate-600 rounded-2xl font-display font-bold text-sm flex items-center justify-center gap-2"
                      >
                        <LogOut size={16} /> Sign Out
                      </button>
                    </div>
                  ) : (
                    <Link to="/login" className="block w-full py-4 text-center bg-slate-900 text-white rounded-2xl font-display font-bold text-sm">
                      Join the Assembly
                    </Link>
                  )}
                </div>
              </div>
              <div className="bg-slate-50 p-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe size={14} className="text-slate-400" />
                  <span className="text-[10px] font-display font-bold text-slate-400 uppercase tracking-widest">Global Network</span>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400">
                    <Shield size={14} />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
