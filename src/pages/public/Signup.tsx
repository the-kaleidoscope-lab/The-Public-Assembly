import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Shield, Mail, Lock, ArrowRight, User, MapPin, Phone } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

const Signup = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    city: '',
    phone: ''
  });
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(formData);
      toast.success('Account created successfully!');
      navigate('/initiatives');
    } catch (error: any) {
      toast.error(error.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-pearl pt-32 pb-24">
      <div className="w-full max-w-xl">
        <div className="text-center mb-12">
          <Link to="/" className="inline-flex items-center gap-2 mb-8 group">
            <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-500 shadow-xl">
              <Shield className="text-white" size={24} />
            </div>
            <span className="text-xl font-display font-bold tracking-tighter text-slate-900">THE PUBLIC ASSEMBLY</span>
          </Link>
          <h1 className="text-5xl md:text-6xl font-display font-medium text-slate-900 mb-4 tracking-tighter">Join the <span className="italic text-slate-400">Assembly.</span></h1>
          <p className="text-slate-500 font-display font-light">Create an account to start contributing to your community.</p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="prospera-card p-10 md:p-16 border border-slate-100 shadow-2xl bg-white"
        >
          <form onSubmit={handleSignup} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400 ml-4">Full Name</label>
              <div className="relative">
                <User className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  type="text"
                  required
                  placeholder="Enter your full name"
                  className="w-full bg-slate-50 border-none rounded-full py-5 pl-14 pr-8 text-sm font-display focus:ring-2 focus:ring-prospera-blue transition-all"
                  value={formData.fullName}
                  onChange={e => setFormData({...formData, fullName: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400 ml-4">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  type="email"
                  required
                  placeholder="Enter your email"
                  className="w-full bg-slate-50 border-none rounded-full py-5 pl-14 pr-8 text-sm font-display focus:ring-2 focus:ring-prospera-blue transition-all"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400 ml-4">City</label>
                <div className="relative">
                  <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input 
                    type="text"
                    required
                    placeholder="Your city"
                    className="w-full bg-slate-50 border-none rounded-full py-5 pl-14 pr-8 text-sm font-display focus:ring-2 focus:ring-prospera-blue transition-all"
                    value={formData.city}
                    onChange={e => setFormData({...formData, city: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400 ml-4">Phone</label>
                <div className="relative">
                  <Phone className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input 
                    type="tel"
                    placeholder="Optional"
                    className="w-full bg-slate-50 border-none rounded-full py-5 pl-14 pr-8 text-sm font-display focus:ring-2 focus:ring-prospera-blue transition-all"
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400 ml-4">Password</label>
              <div className="relative">
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  type="password"
                  required
                  placeholder="Create a password"
                  className="w-full bg-slate-50 border-none rounded-full py-5 pl-14 pr-8 text-sm font-display focus:ring-2 focus:ring-prospera-blue transition-all"
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-slate-900 text-white py-6 rounded-full font-display font-bold text-sm uppercase tracking-widest hover:bg-prospera-blue transition-all shadow-xl flex items-center justify-center gap-4 group"
            >
              Create Account
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="mt-10 pt-10 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-500 font-display font-light">
              Already have an account? <Link to="/login" className="text-slate-900 font-bold hover:underline">Sign In</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Signup;
