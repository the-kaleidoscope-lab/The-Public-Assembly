import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, AlertTriangle, Clock, CheckCircle, 
  ArrowRight, IndianRupee, Globe, Target, 
  Award, Zap, ExternalLink, Scale, Heart,
  ChevronRight, MessageSquare, User, Building, MapPin
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../lib/utils';
import { toast } from 'sonner';
import { io, Socket } from 'socket.io-client';

interface Complaint {
  id: string;
  _id: string;
  title: string;
  subject: string;
  description: string;
  sector: string;
  ward: string;
  city: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'ESCALATED' | 'AUDITOR_REVIEW';
  assignedTo: string;
  officer1Reply?: string;
  officer2Reply?: string;
  expiresAt: string;
  createdAt: string;
  escalatedAt?: string;
  tokensEarned: number;
  location?: { lat: number, lng: number };
}

const Auditor = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    complainantName: '',
    complainantEmail: '',
    rawDescription: '',
    sector: 'Water',
    ward: 'Ward 12 (Central)',
    customSector: '',
    customWard: '',
    city: ''
  });
  const [location, setLocation] = useState<{ lat: number, lng: number, address?: string } | null>(null);
  const [locating, setLocating] = useState(false);
  const [activeComplaintId, setActiveComplaintId] = useState<string | null>(localStorage.getItem('activeComplaintId'));
  const socketRef = useRef<Socket | null>(null);

  const sectors = ['Water', 'Electricity', 'Roads', 'Sanitation', 'Law', 'Other (Type below)'];
  const wards = ['Ward 12 (Central)', 'Ward 45 (East)', 'Ward 08 (North)', 'Ward 22 (South)', 'Other (Type below)'];

  const activeComplaint = complaints.find(c => (c.id || c._id) === activeComplaintId) || null;

  useEffect(() => {
    fetchComplaints();
    
    // Socket connection
    socketRef.current = io();
    socketRef.current.on('complaint:new', (newComplaint: Complaint) => {
      setComplaints(prev => [newComplaint, ...prev]);
    });
    socketRef.current.on('complaint:update', (updated: Complaint) => {
      setComplaints(prev => prev.map(c => (c._id === updated._id || c.id === updated.id) ? updated : c));
      if ((updated._id === activeComplaintId || updated.id === activeComplaintId) && updated.status === 'RESOLVED') {
        toast.success('Complaint resolved!');
      }
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [activeComplaintId]);

  useEffect(() => {
    if (activeComplaintId) {
      localStorage.setItem('activeComplaintId', activeComplaintId);
    } else {
      localStorage.removeItem('activeComplaintId');
    }
  }, [activeComplaintId]);

  useEffect(() => {
    if (user && !formData.complainantName) {
      setFormData(prev => ({ ...prev, complainantName: user.fullName, complainantEmail: user.email }));
    }
  }, [user]);

  const handleGetLocation = () => {
    setLocating(true);
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      setLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          address: 'Current GPS Location'
        });
        setLocating(false);
        toast.success('Location captured');
      },
      (error) => {
        console.error('Location error', error);
        toast.error('Unable to retrieve your location');
        setLocating(false);
      }
    );
  };

  const fetchComplaints = async () => {
    try {
      const res = await fetch('/api/complaints');
      if (res.ok) {
        const data = await res.json();
        setComplaints(data);
      }
    } catch (error) {
      console.error('Failed to fetch complaints', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return toast.error('Please login to submit a complaint');
    if (!formData.rawDescription) return;

    const finalSector = formData.sector === 'Other (Type below)' ? formData.customSector : formData.sector;
    const finalWard = formData.ward === 'Other (Type below)' ? formData.customWard : formData.ward;

    if (!finalSector || !finalWard) return toast.error('Please specify sector and ward');

    setSubmitting(true);
    try {
      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...formData, 
          sector: finalSector,
          ward: finalWard,
          userId: user.id, 
          location
        })
      });
      if (res.ok) {
        const newComplaint = await res.json();
        setActiveComplaintId(newComplaint._id || newComplaint.id);
        setFormData({ ...formData, rawDescription: '', customSector: '', customWard: '', city: '' });
        setLocation(null);
        toast.success('Complaint submitted successfully');
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || 'Failed to submit complaint');
      }
    } catch (error) {
      console.error('Submit error', error);
      toast.error('Failed to submit complaint');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusStep = (status: string) => {
    switch (status) {
      case 'PENDING': return 1;
      case 'IN_PROGRESS': return 2;
      case 'ESCALATED': return 3;
      case 'AUDITOR_REVIEW': return 4;
      case 'RESOLVED': return 5;
      default: return 1;
    }
  };

  const handleAuditorResolve = async (id: string) => {
    try {
      const res = await fetch(`/api/complaints/${id}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ officer: 'Auditor' })
      });
      if (res.ok) {
        toast.success('Complaint resolved by Auditor');
      }
    } catch (error) {
      toast.error('Failed to resolve complaint');
    }
  };

  const Timer = ({ createdAt, status, escalatedAt }: { createdAt: string, status: string, escalatedAt?: string }) => {
    const [timeLeft, setTimeLeft] = useState<string>('');

    useEffect(() => {
      if (status !== 'PENDING' && status !== 'ESCALATED') return;
      
      const updateTimer = () => {
        const start = status === 'ESCALATED' && escalatedAt ? new Date(escalatedAt).getTime() : new Date(createdAt).getTime();
        const duration = status === 'ESCALATED' ? 60 * 60 * 1000 : 30 * 60 * 1000;
        const now = new Date().getTime();
        const diff = (start + duration) - now;

        if (diff <= 0) {
          setTimeLeft('00:00');
          return;
        }
        const mins = Math.floor(diff / 60000);
        const secs = Math.floor((diff % 60000) / 1000);
        setTimeLeft(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
      };

      updateTimer();
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
    }, [createdAt, status, escalatedAt]);

    if (status === 'RESOLVED' || status === 'AUDITOR_REVIEW') return null;

    return (
      <div className={cn(
        "flex items-center gap-2 font-mono font-bold text-xl",
        status === 'ESCALATED' ? "text-rose-500" : "text-prospera-blue"
      )}>
        <Clock size={20} className="animate-pulse" />
        {timeLeft}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-pearl pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        
        {/* Header */}
        <div className="mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl"
          >
            <span className="pill-outline border-slate-900 mb-8">The Auditor</span>
            <h1 className="text-7xl md:text-9xl font-display font-medium leading-[0.85] tracking-tighter mb-12">
              Accountability <br /> in <span className="italic text-slate-400">Real-Time.</span>
            </h1>
            <p className="text-2xl text-slate-500 font-display font-light leading-relaxed max-w-2xl">
              Submit your complaint, track the resolution window, and see the system work for you. 
              30 minutes to action, or we escalate to the top.
            </p>
          </motion.div>
        </div>

        {/* Main Split Layout */}
        <div className="grid lg:grid-cols-2 gap-12 mb-24">
          
          {/* Left: Input */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="prospera-card p-12 bg-white"
          >
            <div className="flex items-center gap-4 mb-12">
              <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center">
                <Shield size={24} />
              </div>
              <div>
                <h3 className="text-2xl font-display font-medium text-slate-900">Submit Complaint</h3>
                <p className="text-sm text-slate-400 font-display font-light">Your voice, structured for action.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400 ml-4 font-display">Name</label>
                  <input 
                    type="text"
                    value={formData.complainantName}
                    onChange={(e) => setFormData({...formData, complainantName: e.target.value})}
                    className="w-full px-8 py-4 rounded-full bg-slate-50 border border-transparent focus:border-prospera-blue/20 focus:bg-white outline-none transition-all text-slate-900 font-display"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400 ml-4 font-display">Email</label>
                  <input 
                    type="email"
                    value={formData.complainantEmail}
                    onChange={(e) => setFormData({...formData, complainantEmail: e.target.value})}
                    className="w-full px-8 py-4 rounded-full bg-slate-50 border border-transparent focus:border-prospera-blue/20 focus:bg-white outline-none transition-all text-slate-900 font-display"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400 ml-4 font-display">Sector</label>
                  <select 
                    value={formData.sector}
                    onChange={(e) => setFormData({...formData, sector: e.target.value})}
                    className="w-full px-8 py-4 rounded-full bg-slate-50 border border-transparent focus:border-prospera-blue/20 focus:bg-white outline-none transition-all text-slate-900 font-display appearance-none cursor-pointer"
                  >
                    {sectors.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  {formData.sector === 'Other (Type below)' && (
                    <input 
                      type="text"
                      placeholder="Enter custom sector..."
                      value={formData.customSector}
                      onChange={(e) => setFormData({...formData, customSector: e.target.value})}
                      className="w-full px-8 py-3 mt-2 rounded-full bg-slate-50 border border-slate-100 focus:border-prospera-blue/20 focus:bg-white outline-none transition-all text-slate-900 font-display"
                    />
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400 ml-4 font-display">Ward</label>
                  <select 
                    value={formData.ward}
                    onChange={(e) => setFormData({...formData, ward: e.target.value})}
                    className="w-full px-8 py-4 rounded-full bg-slate-50 border border-transparent focus:border-prospera-blue/20 focus:bg-white outline-none transition-all text-slate-900 font-display appearance-none cursor-pointer"
                  >
                    {wards.map(w => <option key={w} value={w}>{w}</option>)}
                  </select>
                  {formData.ward === 'Other (Type below)' && (
                    <input 
                      type="text"
                      placeholder="Enter custom ward..."
                      value={formData.customWard}
                      onChange={(e) => setFormData({...formData, customWard: e.target.value})}
                      className="w-full px-8 py-3 mt-2 rounded-full bg-slate-50 border border-slate-100 focus:border-prospera-blue/20 focus:bg-white outline-none transition-all text-slate-900 font-display"
                    />
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400 ml-4 font-display">City Location</label>
                <input 
                  type="text"
                  placeholder="Enter city or specific area..."
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                  className="w-full px-8 py-4 rounded-full bg-slate-50 border border-transparent focus:border-prospera-blue/20 focus:bg-white outline-none transition-all text-slate-900 font-display"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400 ml-4 font-display">Complaint Details</label>
                <textarea 
                  value={formData.rawDescription}
                  onChange={(e) => setFormData({...formData, rawDescription: e.target.value})}
                  placeholder="Describe the issue in detail..."
                  rows={4}
                  className="w-full px-8 py-5 rounded-[2rem] bg-slate-50 border border-transparent focus:border-prospera-blue/20 focus:bg-white outline-none transition-all text-slate-900 placeholder:text-slate-300 resize-none font-display"
                />
              </div>

              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={handleGetLocation}
                  disabled={locating}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-display font-bold text-xs transition-all",
                    location ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-slate-50 text-slate-600 border border-slate-100 hover:bg-slate-100"
                  )}
                >
                  <MapPin size={16} />
                  {locating ? 'Locating...' : location ? 'Location Fixed' : 'Use My Location'}
                </button>
                {location && (
                  <div className="text-[10px] font-mono text-slate-400">
                    {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                  </div>
                )}
              </div>

              <button 
                type="submit" 
                disabled={submitting}
                className="w-full bg-slate-900 text-white py-5 rounded-full font-display font-bold text-sm hover:bg-prospera-blue transition-all shadow-2xl flex items-center justify-center gap-3 group disabled:opacity-50"
              >
                {submitting ? 'Processing...' : 'Submit Complaint'}
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          </motion.div>

          {/* Right: Preview + Panel */}
          <div className="space-y-8">
            <AnimatePresence mode="wait">
              {activeComplaint ? (
                <motion.div
                  key="active"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="prospera-card p-12 bg-slate-900 text-white relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-64 h-64 bg-prospera-blue/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                  
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-12">
                      <div>
                        <span className="text-[10px] uppercase tracking-widest font-bold text-prospera-blue mb-2 block font-display">Active Complaint #{activeComplaint._id || activeComplaint.id}</span>
                        <h3 className="text-3xl font-display font-medium leading-tight">{activeComplaint.title}</h3>
                      </div>
                      <Timer createdAt={activeComplaint.createdAt} status={activeComplaint.status} escalatedAt={activeComplaint.escalatedAt} />
                    </div>

                    {/* Status Flow */}
                    <div className="flex items-center justify-between mb-12 relative px-4">
                      <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/10 -translate-y-1/2 z-0" />
                      {[1, 2, 3, 4, 5].map((step) => (
                        <div 
                          key={step} 
                          className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center z-10 transition-all duration-500 border",
                            getStatusStep(activeComplaint.status) >= step 
                              ? "bg-prospera-blue border-prospera-blue text-white shadow-lg shadow-prospera-blue/20" 
                              : "bg-slate-900 border-white/10 text-white/20"
                          )}
                        >
                          {getStatusStep(activeComplaint.status) > step ? <CheckCircle size={14} /> : <span className="text-[10px] font-bold">{step}</span>}
                        </div>
                      ))}
                    </div>

                    <div className="space-y-6 mb-12">
                      <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
                        <p className="text-sm text-white/60 font-display font-light leading-relaxed italic">
                          "{activeComplaint.description}"
                        </p>
                      </div>

                      {/* Replies */}
                      {(activeComplaint.officer1Reply || activeComplaint.officer2Reply) && (
                        <div className="space-y-4">
                          {activeComplaint.officer1Reply && (
                            <div className="p-6 rounded-3xl bg-prospera-blue/10 border border-prospera-blue/20">
                              <p className="text-[10px] uppercase tracking-widest text-prospera-blue font-bold mb-2">Officer 1 Reply</p>
                              <p className="text-sm text-white font-display font-light">{activeComplaint.officer1Reply}</p>
                            </div>
                          )}
                          {activeComplaint.officer2Reply && (
                            <div className="p-6 rounded-3xl bg-rose-500/10 border border-rose-500/20">
                              <p className="text-[10px] uppercase tracking-widest text-rose-400 font-bold mb-2">Officer 2 Reply</p>
                              <p className="text-sm text-white font-display font-light">{activeComplaint.officer2Reply}</p>
                            </div>
                          )}
                        </div>
                      )}
                      
                      <div className="grid grid-cols-2 gap-6">
                        <div className="flex items-center gap-3">
                          <User size={18} className="text-prospera-blue" />
                          <div>
                            <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold font-display">Assigned To</p>
                            <p className="text-sm font-display font-medium">{activeComplaint.assignedTo}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Building size={18} className="text-prospera-blue" />
                          <div>
                            <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold font-display">Status</p>
                            <p className={cn(
                              "text-sm font-display font-medium",
                              activeComplaint.status === 'RESOLVED' ? "text-emerald-400" : 
                              activeComplaint.status === 'ESCALATED' ? "text-rose-400" : 
                              activeComplaint.status === 'AUDITOR_REVIEW' ? "text-red-500 font-bold" : "text-amber-400"
                            )}>{activeComplaint.status}</p>
                          </div>
                        </div>
                      </div>

                      {activeComplaint.status === 'AUDITOR_REVIEW' && (
                        <div className="p-8 rounded-[2.5rem] bg-red-500/10 border border-red-500/20 space-y-6">
                          <div className="flex items-center gap-3 text-red-500">
                            <AlertTriangle size={20} />
                            <h4 className="text-sm font-bold uppercase tracking-widest font-display">Auditor Intervention Required</h4>
                          </div>
                          <p className="text-xs text-white/60 font-display leading-relaxed">
                            This complaint has failed resolution by both officers. As the Auditor, you must now intervene, take disciplinary action if necessary, and resolve the issue manually.
                          </p>
                          <div className="flex gap-4">
                            <button 
                              onClick={() => handleAuditorResolve(activeComplaint._id || activeComplaint.id)}
                              className="flex-1 bg-red-500 text-white py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-red-600 transition-all font-display shadow-lg shadow-red-500/20"
                            >
                              Resolve & Close Case
                            </button>
                          </div>
                        </div>
                      )}

                      {activeComplaint.location?.lat && (
                        <a 
                          href={`https://www.google.com/maps?q=${activeComplaint.location.lat},${activeComplaint.location.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-prospera-blue hover:underline"
                        >
                          <MapPin size={14} /> View Location on Maps
                        </a>
                      )}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="prospera-card p-12 bg-slate-50 border-dashed border-2 border-slate-200 flex flex-col items-center justify-center text-center h-full min-h-[400px]"
                >
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                    <MessageSquare className="text-slate-300" size={32} />
                  </div>
                  <h3 className="text-xl font-display font-medium text-slate-400">No Active Complaint</h3>
                  <p className="text-sm text-slate-400 font-display font-light max-w-xs mt-2">
                    Submit a complaint to start the resolution timer and track accountability.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Status Flow Visual */}
            <div className="prospera-card p-10 bg-white">
              <h4 className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-8 font-display">Accountability Flow</h4>
              <div className="relative flex justify-between">
                <div className="absolute top-5 left-0 w-full h-px bg-slate-100 -z-0" />
                {[
                  { label: 'User', icon: User },
                  { label: 'Officer 1', icon: Building },
                  { label: 'Officer 2', icon: Shield },
                  { label: 'Resolved', icon: CheckCircle }
                ].map((step, i) => {
                  let isActive = false;
                  if (activeComplaint) {
                    if (activeComplaint.status === 'PENDING') isActive = i <= 1;
                    if (activeComplaint.status === 'ESCALATED') isActive = i <= 2;
                    if (activeComplaint.status === 'RESOLVED') isActive = true;
                  }
                  
                  return (
                    <div key={i} className="relative z-10 flex flex-col items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500",
                        isActive ? "bg-slate-900 text-white" : "bg-white border border-slate-200 text-slate-300"
                      )}>
                        <step.icon size={16} />
                      </div>
                      <span className={cn(
                        "text-[10px] font-display font-bold uppercase tracking-widest",
                        isActive ? "text-slate-900" : "text-slate-300"
                      )}>{step.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Complaints List */}
        <div className="mb-24">
          <h3 className="text-2xl font-display font-medium text-slate-900 mb-8">Recent Complaints</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {complaints.map(c => (
              <button
                key={c._id || c.id}
                onClick={() => setActiveComplaintId(c._id || c.id)}
                className={cn(
                  "text-left p-8 rounded-[2rem] transition-all border-2",
                  activeComplaintId === (c._id || c.id) 
                    ? "bg-slate-900 border-slate-900 text-white shadow-2xl" 
                    : "bg-white border-slate-100 text-slate-900 hover:border-slate-200"
                )}
              >
                <div className="flex justify-between items-start mb-4">
                  <span className={cn(
                    "text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full",
                    c.status === 'RESOLVED' ? "bg-emerald-100 text-emerald-600" : 
                    c.status === 'ESCALATED' ? "bg-rose-100 text-rose-600" : "bg-amber-100 text-amber-600"
                  )}>
                    {c.status}
                  </span>
                  {c.status === 'PENDING' && <Timer createdAt={c.createdAt} status={c.status} />}
                </div>
                <h4 className="text-lg font-display font-bold mb-2 line-clamp-1">{c.title}</h4>
                <p className="text-xs opacity-60 font-display font-light line-clamp-2">{c.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* NGO Section - Shown prominently when escalated */}
        <AnimatePresence>
          {activeComplaint?.status === 'ESCALATED' && (
            <motion.section
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-24"
            >
              <div className="flex items-center gap-4 mb-12">
                <div className="w-12 h-12 bg-rose-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-rose-500/20">
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <h3 className="text-4xl font-display font-medium text-slate-900 tracking-tighter">Escalation Support</h3>
                  <p className="text-slate-500 font-display font-light">The time limit has expired. These NGOs are ready to step in.</p>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                {[
                  { name: 'Jal Shakti NGO', area: 'Water & Sanitation', icon: Zap },
                  { name: 'Civic Watch', area: 'Law & Order', icon: Shield },
                  { name: 'Road Safe Foundation', area: 'Infrastructure', icon: Target }
                ].map((ngo, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ y: -10 }}
                    className="prospera-card p-10 bg-white border-rose-100"
                  >
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-6">
                      <ngo.icon className="text-rose-500" size={24} />
                    </div>
                    <h4 className="text-xl font-display font-bold text-slate-900 mb-2">{ngo.name}</h4>
                    <p className="text-sm text-slate-400 font-display font-light mb-8">{ngo.area}</p>
                    <button
                      type="button"
                      onClick={() => toast.success(`Escalation support request sent to ${ngo.name} for Complaint #${activeComplaint._id || activeComplaint.id}`)}
                      className="w-full py-4 rounded-2xl border border-slate-200 text-slate-900 font-display font-bold text-xs hover:bg-slate-900 hover:text-white transition-all"
                    >
                      Join Support
                    </button>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Official Help & Resources */}
        <section className="pt-24 border-t border-slate-100">
          <div className="text-center mb-24">
            <span className="pill-outline border-slate-900 mb-8">External Support</span>
            <h2 className="text-6xl font-display font-medium tracking-tighter">Official Help & <span className="italic text-slate-400">Resources.</span></h2>
            <p className="text-slate-500 font-display font-light mt-6 max-w-2xl mx-auto">
              Connect with actual government systems and established legal frameworks beyond our platform.
            </p>
          </div>

          {/* Govt Portals */}
          <div className="mb-24">
            <div className="flex items-center gap-3 mb-12">
              <Building size={20} className="text-prospera-blue" />
              <h3 className="text-2xl font-display font-medium text-slate-900">Government Portals</h3>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {resources.government.map((res, i) => (
                <ResourceCard key={i} title={res.title} link={res.link} desc={res.desc} />
              ))}
            </div>
          </div>

          {/* Legal Resources */}
          <div className="mb-24">
            <div className="flex items-center gap-3 mb-12">
              <Scale size={20} className="text-prospera-blue" />
              <h3 className="text-2xl font-display font-medium text-slate-900">Legal & Law Resources</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              {resources.legal.map((res, i) => (
                <ResourceCard key={i} title={res.title} link={res.link} desc={res.desc} />
              ))}
            </div>
          </div>

          {/* NGO Support */}
          <div>
            <div className="flex items-center gap-3 mb-12">
              <Heart size={20} className="text-prospera-blue" />
              <h3 className="text-2xl font-display font-medium text-slate-900">NGO Support</h3>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {resources.ngo.map((res, i) => (
                <ResourceCard key={i} title={res.title} link={res.link} desc={res.desc} />
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

interface ResourceCardProps {
  title: string;
  link: string;
  desc: string;
}

const ResourceCard: React.FC<ResourceCardProps> = ({ title, link, desc }) => (
  <motion.div
    whileHover={{ y: -5, scale: 1.02 }}
    className="prospera-card p-8 bg-white flex flex-col h-full group hover:shadow-2xl hover:shadow-prospera-blue/5 transition-all"
  >
    <h4 className="text-lg font-display font-bold text-slate-900 mb-4 group-hover:text-prospera-blue transition-colors">{title}</h4>
    <p className="text-sm text-slate-500 font-display font-light leading-relaxed mb-8 flex-grow">
      {desc}
    </p>
    <a 
      href={link} 
      target="_blank" 
      rel="noopener noreferrer"
      className="flex items-center justify-between text-[10px] uppercase tracking-widest font-bold text-slate-400 hover:text-slate-900 transition-colors pt-6 border-t border-slate-50"
    >
      Visit Website <ExternalLink size={14} />
    </a>
  </motion.div>
);

const resources = {
  government: [
    { title: 'National Portal of India', link: 'https://www.india.gov.in', desc: 'Official gateway to all government services and complaint systems' },
    { title: 'MyGov India', link: 'https://www.mygov.in', desc: 'Citizen engagement platform to raise issues and participate' },
    { title: 'Public Grievance Portal (CPGRAMS)', link: 'https://pgportal.gov.in', desc: 'File complaints directly to government departments' },
    { title: 'Swachh Bharat Complaint Portal', link: 'https://swachhbharatmission.gov.in', desc: 'Report sanitation and cleanliness issues' },
  ],
  legal: [
    { title: 'India Code', link: 'https://www.indiacode.nic.in', desc: 'Official repository of Indian laws' },
    { title: 'eCourts Services', link: 'https://ecourts.gov.in', desc: 'Access court case information and services' },
  ],
  ngo: [
    { title: 'GiveIndia', link: 'https://www.giveindia.org', desc: 'Trusted NGO platform for social causes' },
    { title: 'Goonj', link: 'https://goonj.org', desc: 'Works on rural development and disaster relief' },
    { title: 'CRY (Child Rights and You)', link: 'https://www.cry.org', desc: 'NGO focused on child rights' },
    { title: 'HelpAge India', link: 'https://www.helpageindia.org', desc: 'Supports elderly citizens' },
  ]
};

export default Auditor;
