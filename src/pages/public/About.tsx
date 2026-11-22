import React from 'react';
import { motion } from 'motion/react';
import { Globe, Shield, Zap, ArrowRight, Mail, Github, Twitter } from 'lucide-react';
import { Link } from 'react-router-dom';

const About = () => {
  return (
    <div className="min-h-screen bg-pearl pt-32 pb-24 px-6 md:px-12 lg:px-24">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <header className="mb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl"
          >
            <span className="pill-outline border-slate-900 mb-8">Our Mission</span>
            <h1 className="text-7xl md:text-9xl font-display font-medium leading-[0.85] tracking-tighter mb-12">
              A New Paradigm <br /> for <span className="italic text-slate-400">Civic Action.</span>
            </h1>
            <p className="text-2xl text-slate-500 font-display font-light leading-relaxed max-w-2xl">
              The Public Assembly is a decentralized ecosystem designed to reclaim civic agency and coordinate collective impact at scale.
            </p>
          </motion.div>
        </header>

        {/* The Vision - Split Layout */}
        <section className="mb-48 grid lg:grid-cols-2 gap-24 items-center">
          <div className="prospera-card bg-slate-900 text-white p-16">
            <h2 className="text-5xl font-display font-medium leading-tight mb-8">
              Why we <span className="italic text-prospera-blue">exist.</span>
            </h2>
            <p className="text-lg text-white/70 font-display font-light leading-relaxed mb-12">
              Traditional institutions are often too slow or too disconnected to address local crises. We provide the infrastructure for citizens to organize, fund, and execute projects with radical transparency.
            </p>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <span className="text-4xl font-display font-bold text-prospera-blue block mb-2">450+</span>
                <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Active Hubs</span>
              </div>
              <div>
                <span className="text-4xl font-display font-bold text-prospera-blue block mb-2">1.2M</span>
                <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Actions Taken</span>
              </div>
            </div>
          </div>
          
          <div className="relative aspect-square rounded-[4rem] overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&q=80&w=1200" 
              alt="Professional Collaboration" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </div>
        </section>

        {/* Core Values */}
        <section className="mb-48">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-24 gap-12">
            <h2 className="text-5xl md:text-7xl font-display font-medium tracking-tighter leading-[0.9] max-w-2xl">
              Built on <span className="pill-outline border-slate-900">radical</span> <br />
              <span className="pill-highlight">transparency</span> & trust
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              { 
                icon: Shield, 
                title: 'Decentralized Trust', 
                desc: 'No central authority. The community governs the assembly through verifiable consensus and open auditing.' 
              },
              { 
                icon: Zap, 
                title: 'Hyper-Local Action', 
                desc: 'We empower local leaders who understand their communities best, providing them with global-scale resources.' 
              },
              { 
                icon: Globe, 
                title: 'Global Connectivity', 
                desc: 'Knowledge and resources flow freely across borders, allowing successful initiatives to be replicated anywhere.' 
              }
            ].map((value, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="prospera-card p-12"
              >
                <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-8">
                  <value.icon className="text-slate-900" size={32} />
                </div>
                <h3 className="text-2xl font-display font-medium text-slate-900 mb-6">{value.title}</h3>
                <p className="text-slate-500 font-display font-light leading-relaxed">
                  {value.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* The Collective - Abstract Representation */}
        <section className="mb-48">
          <div className="text-center mb-24">
            <span className="prospera-pill border-slate-900 mb-8">The Collective</span>
            <h2 className="text-6xl font-display font-medium tracking-tighter">Architects of <span className="italic text-slate-400">Change.</span></h2>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <div className="prospera-card flex flex-col items-center text-center p-16">
              <div className="w-32 h-32 rounded-full bg-slate-900 flex items-center justify-center text-white text-4xl font-display font-bold mb-8 shadow-2xl">
                KN
              </div>
              <h3 className="text-2xl font-display font-bold mb-2">Founder & Chief Architect</h3>
              <p className="text-slate-400 font-display text-sm uppercase tracking-widest mb-8">Visionary Leadership</p>
              <p className="text-slate-600 font-display font-light leading-relaxed max-w-sm">
                Dedicated to building the digital infrastructure for a more resilient and participatory society.
              </p>
            </div>

            <div className="prospera-card flex flex-col items-center text-center p-16 bg-prospera-blue/10 border-prospera-blue/20">
              <div className="w-32 h-32 rounded-full bg-white border-4 border-prospera-blue flex items-center justify-center text-prospera-blue text-4xl font-display font-bold mb-8 shadow-2xl">
                PA
              </div>
              <h3 className="text-2xl font-display font-bold mb-2">The Public Assembly</h3>
              <p className="text-slate-400 font-display text-sm uppercase tracking-widest mb-8">Global Community</p>
              <p className="text-slate-600 font-display font-light leading-relaxed max-w-sm">
                A decentralized network of thousands of citizens, organizers, and verifiers working in unison.
              </p>
            </div>
          </div>
        </section>

        {/* Contact / Join */}
        <section className="prospera-card bg-slate-900 text-white p-24 text-center overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-prospera-blue/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10">
            <h2 className="text-6xl md:text-8xl font-display font-medium tracking-tighter leading-[0.85] mb-12">
              Join the <br /> <span className="italic text-prospera-blue">Conversation.</span>
            </h2>
            <div className="flex flex-wrap justify-center gap-8 mb-16">
              <Link to="/contact" className="flex items-center gap-3 text-white/60 hover:text-white transition-colors font-display font-bold text-sm">
                <Twitter size={20} /> Twitter
              </Link>
              <Link to="/contact" className="flex items-center gap-3 text-white/60 hover:text-white transition-colors font-display font-bold text-sm">
                <Github size={20} /> GitHub
              </Link>
              <a href="mailto:contact@publicassembly.org" className="flex items-center gap-3 text-white/60 hover:text-white transition-colors font-display font-bold text-sm">
                <Mail size={20} /> Email
              </a>
            </div>
            <Link to="/start">
              <button className="bg-white text-slate-900 px-16 py-6 rounded-full font-display font-bold text-sm hover:bg-prospera-blue transition-all shadow-2xl">
                Become a Member
              </button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;
