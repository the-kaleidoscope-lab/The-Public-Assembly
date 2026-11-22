import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Shield, Mail, Lock, ArrowRight, Github, Chrome, User } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isEmailLogin, setIsEmailLogin] = useState(false);
  const { login, loginWithEmail } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from || '/initiatives';

  const handleGoogleLogin = async () => {
    try {
      await login();
      navigate(from);
    } catch (error) {
      console.error('Login failed:', error);
      toast.error('Login failed. Please try again.');
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await loginWithEmail(email, password);
      toast.success('Signed in successfully!');
      navigate(from);
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
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
          <h1 className="text-5xl md:text-6xl font-display font-medium text-slate-900 mb-4 tracking-tighter">Welcome <span className="italic text-slate-400">Back.</span></h1>
          <p className="text-slate-500 font-display font-light">Sign in to access your civic dashboard.</p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="prospera-card p-10 md:p-16 border border-slate-100 shadow-2xl bg-white"
        >
          {isEmailLogin ? (
            <form onSubmit={handleEmailLogin} className="space-y-6">
              <div className="space-y-2 text-left">
                <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400 ml-4">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input 
                    type="email"
                    required
                    placeholder="Enter your email"
                    className="w-full bg-slate-50 border-none rounded-full py-5 pl-14 pr-8 text-sm font-display focus:ring-2 focus:ring-prospera-blue transition-all"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2 text-left">
                <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400 ml-4">Password</label>
                <div className="relative">
                  <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input 
                    type="password"
                    required
                    placeholder="Enter your password"
                    className="w-full bg-slate-50 border-none rounded-full py-5 pl-14 pr-8 text-sm font-display focus:ring-2 focus:ring-prospera-blue transition-all"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-slate-900 text-white py-6 rounded-full font-display font-bold text-sm uppercase tracking-widest hover:bg-prospera-blue transition-all shadow-xl flex items-center justify-center gap-4 group"
              >
                Sign In
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>

              <button 
                type="button"
                onClick={() => setIsEmailLogin(false)}
                className="w-full text-slate-400 text-xs font-display font-medium hover:text-slate-900 transition-colors"
              >
                Or sign in with Google
              </button>
            </form>
          ) : (
            <div className="space-y-6">
              <button 
                type="button"
                onClick={handleGoogleLogin}
                className="w-full bg-slate-900 text-white py-6 rounded-full font-display font-bold text-sm uppercase tracking-widest hover:bg-prospera-blue transition-all shadow-xl flex items-center justify-center gap-4 group"
              >
                <Chrome size={20} className="group-hover:rotate-12 transition-transform" />
                Sign In with Google
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>

              <button 
                type="button"
                onClick={() => setIsEmailLogin(true)}
                className="w-full bg-white text-slate-900 border border-slate-200 py-6 rounded-full font-display font-bold text-sm uppercase tracking-widest hover:border-prospera-blue transition-all shadow-sm flex items-center justify-center gap-4"
              >
                <Mail size={20} />
                Sign In with Email
              </button>
            </div>
          )}

          <div className="relative my-12">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-bold">
              <span className="bg-white px-4 text-slate-400 font-display">Secure Authentication</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-8 opacity-40 grayscale">
            <Github size={24} />
            <Chrome size={24} />
            <Shield size={24} />
          </div>

          <div className="mt-10 pt-10 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-500 font-display font-light">
              Don't have an account? <Link to="/signup" className="text-slate-900 font-bold hover:underline">Join the Assembly</Link>
            </p>
          </div>
        </motion.div>

        <p className="text-center mt-12 text-sm text-slate-500 font-display font-light">
          By signing in, you agree to our <Link to="/terms" className="text-slate-900 font-bold hover:underline">Terms of Assembly</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
