import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Mail, MessageSquare, MapPin, Send } from 'lucide-react';
import { toast } from 'sonner';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Message sent! We'll get back to you soon.");
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="min-h-screen bg-pearl pt-48 pb-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-24 max-w-4xl"
        >
          <span className="prospera-pill border-slate-900 mb-8">Get in Touch</span>
          <h1 className="text-7xl md:text-9xl font-display font-medium leading-[0.85] tracking-tighter mb-12">
            Contact <br /> <span className="italic text-slate-400">Us.</span>
          </h1>
          <p className="text-2xl text-slate-500 font-display font-light leading-relaxed max-w-2xl">
            Have questions about the assembly or need support with an initiative? We're here to help.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-24">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] uppercase tracking-[0.3em] font-bold text-slate-400 font-display">Full Name</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 focus:outline-none focus:border-prospera-blue transition-colors font-display font-light"
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] uppercase tracking-[0.3em] font-bold text-slate-400 font-display">Email Address</label>
                  <input 
                    type="email" 
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 focus:outline-none focus:border-prospera-blue transition-colors font-display font-light"
                    placeholder="john@example.com"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] uppercase tracking-[0.3em] font-bold text-slate-400 font-display">Subject</label>
                <input 
                  type="text" 
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 focus:outline-none focus:border-prospera-blue transition-colors font-display font-light"
                  placeholder="How can we help?"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] uppercase tracking-[0.3em] font-bold text-slate-400 font-display">Message</label>
                <textarea 
                  rows={6}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 focus:outline-none focus:border-prospera-blue transition-colors font-display font-light resize-none"
                  placeholder="Tell us more..."
                />
              </div>
              <button 
                type="submit"
                className="bg-slate-900 text-pearl px-12 py-6 rounded-full text-xs font-display font-bold uppercase tracking-widest hover:bg-prospera-blue transition-all shadow-xl flex items-center gap-3"
              >
                Send Message <Send size={14} />
              </button>
            </form>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-16"
          >
            <div className="space-y-8">
              <h3 className="text-2xl font-display font-medium text-slate-900">Connect with us</h3>
              <div className="space-y-6">
                {[
                  { icon: Mail, label: 'Email', value: 'hello@publicassembly.org' },
                  { icon: MessageSquare, label: 'Support', value: 'support@publicassembly.org' },
                  { icon: MapPin, label: 'Office', value: '123 Civic Plaza, New Delhi' }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-6 group">
                    <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all duration-500">
                      <item.icon size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-slate-400 font-display">{item.label}</p>
                      <p className="text-lg font-display font-light text-slate-900">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900 p-12 rounded-[3rem] text-white relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-prospera-blue/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/40 mb-8 font-display">Community Support</h4>
              <p className="text-xl font-display font-light leading-relaxed mb-10">
                Our support team is available 24/7 to help you manage your initiatives and ensure a safe, productive environment for all assembly members.
              </p>
              <Link to="/how-it-works" className="inline-block text-xs font-display font-bold uppercase tracking-widest text-prospera-blue hover:text-white transition-colors">
                Visit Help Center →
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
