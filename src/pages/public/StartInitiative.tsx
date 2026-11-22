import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, ArrowRight, ArrowLeft, MapPin, 
  Tag, FileText, IndianRupee, CheckCircle 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { cn } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

const StartInitiative = () => {
  const { user, login } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Environment',
    city: '',
    estimatedCost: '',
    suppliesNeeded: '',
    emergency: false
  });
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const categories = ['Environment', 'Education', 'Infrastructure', 'Life', 'Food', 'Health'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || submitting) return;
    if (!formData.title.trim() || !formData.city.trim() || !formData.description.trim()) {
      toast.error('Please complete title, city, and description before launching.');
      return;
    }
    
    setSubmitting(true);
    try {
      const res = await fetch('/api/initiatives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, createdBy: user.id })
      });
      if (res.ok) {
        toast.success('Initiative launched successfully! Your Certificate of Initiation has been issued.');
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 }
        });
        navigate('/initiatives');
      } else {
        const err = await res.json();
        toast.error(`Error: ${err.error || 'Failed to launch initiative'}`);
      }
    } catch (error) {
      console.error('[SUBMIT ERROR]', error);
      toast.error('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login();
    } catch {
      toast.error('Google sign-in failed. Please try again.');
    }
  };

  const nextStep = () => {
    if (step === 1) {
      if (!formData.title.trim()) {
        toast.error('Please enter an initiative title.');
        return;
      }
      if (!formData.city.trim()) {
        toast.error('Please enter a city or location.');
        return;
      }
    }
    if (step === 2 && !formData.description.trim()) {
      toast.error('Please describe your initiative and proposed solution.');
      return;
    }
    setStep(s => s + 1);
  };
  const prevStep = () => setStep(s => s - 1);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-pearl pt-24">
      <div className="w-full max-w-4xl">
        {/* Progress Bar */}
        <div className="mb-16">
          <div className="flex justify-between items-center mb-4">
            <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-slate-400 font-display">Step {step} of 3</span>
            <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-slate-900 font-display">
              {step === 1 ? 'Basic Info' : step === 2 ? 'Details & Budget' : 'Review & Submit'}
            </span>
          </div>
          <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${(step / 3) * 100}%` }}
              className="h-full bg-prospera-blue"
            />
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="prospera-card p-10 md:p-16 bg-white border border-slate-100 shadow-2xl"
        >
          {!user ? (
            <div className="text-center space-y-8">
              <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-sm">
                <Shield className="text-prospera-blue" size={40} />
              </div>
              <h2 className="text-5xl font-display font-medium text-slate-900 tracking-tighter">Authentication Required</h2>
              <p className="text-slate-500 font-display font-light max-w-md mx-auto">
                To ensure accountability and community trust, please sign in with your Gmail to start a new action.
              </p>
              <div className="max-w-sm mx-auto">
                <button 
                  type="button"
                  onClick={handleLogin}
                  className="w-full bg-slate-900 text-white py-5 rounded-full font-bold uppercase tracking-widest text-[10px] hover:bg-prospera-blue transition-all shadow-xl font-display flex items-center justify-center gap-2"
                >
                  <Shield size={18} />
                  Sign In with Google
                </button>
              </div>
            </div>
          ) : (
            <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-10"
              >
                <div className="text-center mb-12">
                  <h2 className="text-5xl font-display font-medium mb-4 text-slate-900 tracking-tighter">The <span className="italic text-slate-400">Proposal.</span></h2>
                  <p className="text-slate-500 font-display font-light">Define the core mission of your initiative.</p>
                </div>

                <div className="space-y-8">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400 ml-4 font-display">Initiative Title</label>
                    <div className="relative">
                      <FileText className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                      <input 
                        type="text" 
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        placeholder="e.g. Restoring the Central Park Lake"
                        className="w-full pl-16 pr-8 py-5 rounded-full bg-slate-50 border border-transparent focus:border-prospera-blue/20 focus:bg-white outline-none transition-all text-slate-900 placeholder:text-slate-300 font-display"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400 ml-4 font-display">Category</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {categories.map(cat => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setFormData({...formData, category: cat})}
                          className={cn(
                            "py-4 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all border font-display",
                            formData.category === cat 
                              ? "bg-prospera-blue text-white border-prospera-blue shadow-lg shadow-prospera-blue/20" 
                              : "bg-slate-50 text-slate-400 border-transparent hover:border-slate-200"
                          )}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400 ml-4 font-display">Location (City)</label>
                    <div className="relative">
                      <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                      <input 
                        type="text" 
                        value={formData.city}
                        onChange={(e) => setFormData({...formData, city: e.target.value})}
                        placeholder="e.g. Mumbai, Maharashtra"
                        className="w-full pl-16 pr-8 py-5 rounded-full bg-slate-50 border border-transparent focus:border-prospera-blue/20 focus:bg-white outline-none transition-all text-slate-900 placeholder:text-slate-300 font-display"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-8">
                  <button type="button" onClick={nextStep} className="bg-slate-900 text-white px-10 py-5 rounded-full font-bold uppercase tracking-widest text-[10px] hover:bg-prospera-blue transition-all shadow-xl flex items-center gap-2 group font-display">
                    Continue <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-10"
              >
                <div className="text-center mb-12">
                  <h2 className="text-5xl font-display font-medium mb-4 text-slate-900 tracking-tighter">The <span className="italic text-slate-400">Execution.</span></h2>
                  <p className="text-slate-500 font-display font-light">Detail the resources and impact of your project.</p>
                </div>

                <div className="space-y-8">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400 ml-4 font-display">Description</label>
                    <textarea 
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Describe the challenge and your proposed solution..."
                      rows={4}
                      className="w-full px-8 py-6 rounded-[2rem] bg-slate-50 border border-transparent focus:border-prospera-blue/20 focus:bg-white outline-none transition-all text-slate-900 placeholder:text-slate-300 resize-none font-display"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400 ml-4 font-display">Estimated Budget (₹)</label>
                      <div className="relative">
                        <IndianRupee className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                        <input 
                          type="number" 
                          value={formData.estimatedCost}
                          onChange={(e) => setFormData({...formData, estimatedCost: e.target.value})}
                          placeholder="50000"
                          className="w-full pl-16 pr-8 py-5 rounded-full bg-slate-50 border border-transparent focus:border-prospera-blue/20 focus:bg-white outline-none transition-all text-slate-900 placeholder:text-slate-300 font-display"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400 ml-4 font-display">Supplies Needed</label>
                      <div className="relative">
                        <Tag className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                        <input 
                          type="text" 
                          value={formData.suppliesNeeded}
                          onChange={(e) => setFormData({...formData, suppliesNeeded: e.target.value})}
                          placeholder="Gloves, Paint, Plants..."
                          className="w-full pl-16 pr-8 py-5 rounded-full bg-slate-50 border border-transparent focus:border-prospera-blue/20 focus:bg-white outline-none transition-all text-slate-900 placeholder:text-slate-300 font-display"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 ml-4">
                    <input 
                      type="checkbox" 
                      id="emergency"
                      checked={formData.emergency}
                      onChange={(e) => setFormData({...formData, emergency: e.target.checked})}
                      className="w-5 h-5 rounded border-slate-200 text-prospera-blue focus:ring-prospera-blue/20"
                    />
                    <label htmlFor="emergency" className="text-[10px] uppercase tracking-widest font-bold text-slate-500 font-display">Mark as Urgent / Emergency</label>
                  </div>
                </div>

                <div className="flex justify-between pt-8">
                  <button type="button" onClick={prevStep} className="px-10 py-5 rounded-full border border-slate-200 text-slate-400 flex items-center gap-2 hover:border-slate-900 hover:text-slate-900 transition-all font-display font-bold text-[10px] uppercase tracking-widest">
                    <ArrowLeft size={18} /> Back
                  </button>
                  <button type="button" onClick={nextStep} className="bg-slate-900 text-white px-10 py-5 rounded-full font-bold uppercase tracking-widest text-[10px] hover:bg-prospera-blue transition-all shadow-xl flex items-center gap-2 group font-display">
                    Review Proposal <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-10"
              >
                <div className="text-center mb-12">
                  <h2 className="text-5xl font-display font-medium mb-4 text-slate-900 tracking-tighter">The <span className="italic text-slate-400">Review.</span></h2>
                  <p className="text-slate-500 font-display font-light">Confirm your initiative details before launching.</p>
                </div>

                <div className="space-y-6 p-10 rounded-[3rem] bg-slate-50 border border-slate-100">
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <span className="text-[8px] uppercase tracking-widest font-bold text-slate-400 block mb-1 font-display">Title</span>
                      <p className="text-sm font-display font-bold text-slate-900">{formData.title || 'Untitled Initiative'}</p>
                    </div>
                    <div>
                      <span className="text-[8px] uppercase tracking-widest font-bold text-slate-400 block mb-1 font-display">Category</span>
                      <p className="text-sm font-display font-bold text-slate-900">{formData.category}</p>
                    </div>
                    <div>
                      <span className="text-[8px] uppercase tracking-widest font-bold text-slate-400 block mb-1 font-display">Location</span>
                      <p className="text-sm font-display font-bold text-slate-900">{formData.city || 'Not specified'}</p>
                    </div>
                    <div>
                      <span className="text-[8px] uppercase tracking-widest font-bold text-slate-400 block mb-1 font-display">Budget</span>
                      <p className="text-sm font-display font-bold text-slate-900">₹{formData.estimatedCost || '0'}</p>
                    </div>
                  </div>
                  <div className="pt-6 border-t border-slate-200">
                    <span className="text-[8px] uppercase tracking-widest font-bold text-slate-400 block mb-1 font-display">Description</span>
                    <p className="text-sm text-slate-500 font-display font-light leading-relaxed line-clamp-3">{formData.description || 'No description provided.'}</p>
                  </div>
                </div>

                <div className="flex justify-between pt-8">
                  <button type="button" onClick={prevStep} className="px-10 py-5 rounded-full border border-slate-200 text-slate-400 flex items-center gap-2 hover:border-slate-900 hover:text-slate-900 transition-all font-display font-bold text-[10px] uppercase tracking-widest">
                    <ArrowLeft size={18} /> Back
                  </button>
                  <button type="button" onClick={handleSubmit} disabled={submitting} className="bg-slate-900 text-white px-10 py-5 rounded-full font-bold uppercase tracking-widest text-[10px] hover:bg-emerald-500 transition-all shadow-xl flex items-center gap-2 font-display disabled:opacity-50">
                    {submitting ? 'Launching...' : 'Launch Initiative'} <CheckCircle size={18} className="ml-2" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default StartInitiative;
