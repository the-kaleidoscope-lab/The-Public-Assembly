import React from 'react';
import { Shield, Twitter, Github, Linkedin, Mail, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-slate-900 pt-32 pb-16 relative overflow-hidden text-white">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
        <div className="grid lg:grid-cols-4 gap-24 mb-32">
          <div className="lg:col-span-2">
            <Link to="/" className="inline-flex items-center gap-3 mb-10 group">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-500 shadow-xl">
                <Shield className="text-slate-900" size={24} />
              </div>
              <span className="text-xl font-display font-bold tracking-tighter text-white">THE PUBLIC ASSEMBLY</span>
            </Link>
            <p className="text-xl text-white/60 max-w-md font-display font-light leading-relaxed mb-12">
              Empowering responsible citizens to lead, organize, and execute meaningful civic action. 
              Together, we build the nation we want to live in.
            </p>
            <div className="flex gap-4">
              <Link to="/contact" aria-label="Twitter" className="w-12 h-12 rounded-2xl border border-white/10 flex items-center justify-center text-white/40 hover:bg-white hover:text-slate-900 hover:border-white transition-all duration-300">
                <Twitter size={20} />
              </Link>
              <Link to="/contact" aria-label="GitHub" className="w-12 h-12 rounded-2xl border border-white/10 flex items-center justify-center text-white/40 hover:bg-white hover:text-slate-900 hover:border-white transition-all duration-300">
                <Github size={20} />
              </Link>
              <Link to="/contact" aria-label="LinkedIn" className="w-12 h-12 rounded-2xl border border-white/10 flex items-center justify-center text-white/40 hover:bg-white hover:text-slate-900 hover:border-white transition-all duration-300">
                <Linkedin size={20} />
              </Link>
              <a href="mailto:contact@publicassembly.org" aria-label="Email" className="w-12 h-12 rounded-2xl border border-white/10 flex items-center justify-center text-white/40 hover:bg-white hover:text-slate-900 hover:border-white transition-all duration-300">
                <Mail size={20} />
              </a>
            </div>
          </div>

          <div>
            <Link to="/how-it-works">
              <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/40 mb-10 font-display hover:text-prospera-blue transition-colors cursor-pointer">Platform</h4>
            </Link>
            <ul className="space-y-6">
              {[
                { name: 'Initiatives', path: '/initiatives' },
                { name: 'Impact', path: '/impact' },
                { name: 'About Us', path: '/about' },
                { name: 'Start Action', path: '/start' }
              ].map(link => (
                <li key={link.name}>
                  <Link to={link.path} className="text-base text-white/60 hover:text-prospera-blue transition-colors flex items-center gap-2 group font-display font-light">
                    {link.name} <ArrowUpRight size={14} className="opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <Link to="/privacy">
              <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/40 mb-10 font-display hover:text-prospera-blue transition-colors cursor-pointer">Legal</h4>
            </Link>
            <ul className="space-y-6">
              {[
                { name: 'Privacy Policy', path: '/privacy' },
                { name: 'Terms of Service', path: '/terms' },
                { name: 'Code of Conduct', path: '/code-of-conduct' },
                { name: 'Contact', path: '/contact' }
              ].map(link => (
                <li key={link.name}>
                  <Link to={link.path} className="text-base text-white/60 hover:text-prospera-blue transition-colors flex items-center gap-2 group font-display font-light">
                    {link.name} <ArrowUpRight size={14} className="opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-16 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/20 font-display">
            © 2025 THE PUBLIC ASSEMBLY. ALL RIGHTS RESERVED.
          </p>
          <div className="flex items-center gap-12">
            <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/20 font-display">Built for the People</span>
            <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-full border border-white/10">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/60 font-display">Systems Online</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
