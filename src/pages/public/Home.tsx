import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Globe, Play, Shield, Zap, Users, BarChart3, Sparkles, MessageSquare, MoreHorizontal, Menu, ArrowDown } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home = () => {
  const [scrollProgress, setScrollProgress] = React.useState(0);

  React.useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = totalHeight > 0 ? Math.min(100, Math.max(0, (window.scrollY / totalHeight) * 100)) : 0;
      setScrollProgress(progress);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#eef2f6] selection:bg-prospera-blue/30 overflow-x-hidden relative font-sans">
      {/* Scroll Progress Indicator */}
      <motion.div 
        className="fixed top-0 left-0 h-1 bg-prospera-blue z-[100]"
        style={{ width: `${scrollProgress}%` }}
      />

      {/* Grain Texture Overlay */}
      <div className="grain-overlay" />

      {/* Stunning Artwork Background Animation */}
      <div className="animated-mesh">
        <div className="mesh-circle mesh-1" />
        <div className="mesh-circle mesh-2" />
        <div className="mesh-circle mesh-3" />
        <div className="mesh-circle mesh-4" />
      </div>

      {/* Top Section: Split Hero as per Image */}
      <section className="min-h-screen flex flex-col lg:flex-row p-4 md:p-6 gap-6 relative z-10">
        
        {/* Left Column: Visual & Chat Elements */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: [0.23, 1, 0.32, 1] }}
          className="relative flex-[1.2] rounded-[3rem] overflow-hidden group min-h-[600px] lg:min-h-0 bg-slate-200 shadow-2xl perspective-1000"
        >
          <motion.div
            className="w-full h-full rotate-x-12 transition-transform duration-1000 group-hover:rotate-0"
          >
            <motion.img 
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 2, ease: "easeOut" }}
              src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=1600" 
              alt="Human Collaboration" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-tr from-slate-900/60 via-transparent to-transparent" />
          
          {/* Top Left: Auth Pills */}
          <div className="absolute top-10 left-10 flex bg-white/10 backdrop-blur-2xl rounded-full p-1.5 border border-white/20 shadow-2xl">
            <Link to="/login" className="px-6 py-2 rounded-full text-white/90 text-xs font-display font-bold hover:text-white transition-all">Log In</Link>
            <Link to="/signup" className="px-6 py-2 rounded-full bg-white text-slate-900 text-xs font-display font-bold hover:bg-slate-100 transition-all shadow-xl">Sign Up</Link>
          </div>

          {/* Social Icons Top Center */}
          <div className="absolute top-10 left-1/2 -translate-x-1/2 flex gap-3">
            {[Facebook, Twitter, Instagram].map((Icon, i) => (
              <Link key={i} to="/contact">
                <motion.div 
                  whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.3)' }}
                  className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white cursor-pointer"
                >
                  <Icon size={18} />
                </motion.div>
              </Link>
            ))}
          </div>

          {/* Floating Chat Bubbles */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="absolute top-32 left-10 glass-card-premium p-6 rounded-[2.5rem] max-w-[300px]"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-prospera-blue flex items-center justify-center text-[10px] font-bold text-white shadow-lg">PA</div>
              <span className="text-[10px] font-bold text-white/80 uppercase tracking-[0.2em]">Collective Intelligence</span>
            </div>
            <p className="text-sm text-white font-display font-light leading-relaxed">
              "Gathering the assembly to finance a new decentralized social movement."
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.2, duration: 1 }}
            className="absolute top-[300px] left-20 glass-card-premium p-5 rounded-[2rem] max-w-[260px]"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-900 shadow-xl">
                <Play size={16} fill="currentColor" />
              </div>
              <div className="flex gap-1 items-center">
                {[...Array(15)].map((_, i) => (
                  <motion.div 
                    key={i} 
                    animate={{ height: [10, 20, 10] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
                    className="w-1 bg-white/40 rounded-full" 
                  />
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.6, duration: 1 }}
            className="absolute top-[380px] left-10 glass-panel p-4 rounded-[1.5rem] max-w-[200px] border-white/30"
          >
            <p className="text-[10px] text-white font-display font-light">
              "Thanks for support! 🙌"
            </p>
          </motion.div>

          {/* Bottom Left: Image in bubble */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2, duration: 1 }}
            className="absolute bottom-10 left-10 w-48 h-64 rounded-[2.5rem] overflow-hidden border-4 border-white/20 shadow-2xl"
          >
            <img 
              src="https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&q=80&w=600" 
              alt="Collaboration" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </motion.div>
        </motion.div>

        {/* Right Column: The Main Card */}
        <motion.div 
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="bg-white rounded-[3rem] p-10 lg:p-16 flex flex-col justify-between flex-1 shadow-[0_40px_80px_-15px_rgba(0,0,0,0.08)] border border-slate-50 relative overflow-hidden"
        >
          {/* Decorative background element */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-prospera-blue/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex-grow relative z-10">
            <div className="flex items-center justify-between mb-12">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-lg">
                  <Shield size={20} />
                </div>
                <span className="text-xl font-display font-bold tracking-tighter uppercase text-slate-900">The Public Assembly</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex gap-1">
                  <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="w-1.5 h-1.5 bg-slate-900 rounded-full" />
                  <div className="w-1.5 h-1.5 bg-slate-300 rounded-full" />
                </div>
                <Link to="/initiatives" className="bg-slate-100 hover:bg-slate-200 text-slate-900 px-6 py-2.5 rounded-full text-xs font-display font-bold flex items-center gap-2 transition-colors">
                  Explore <Menu size={14} />
                </Link>
              </div>
            </div>

            <div className="mb-12">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex flex-wrap gap-3 mb-4"
              >
                <span className="px-8 py-3 rounded-full border-2 border-slate-900 text-3xl lg:text-6xl font-display font-medium tracking-tighter hover:bg-slate-900 hover:text-white transition-all cursor-default text-gradient-silk">Unite.</span>
                <span className="px-8 py-3 rounded-full border-2 border-slate-900 text-3xl lg:text-6xl font-display font-medium tracking-tighter hover:bg-slate-900 hover:text-white transition-all cursor-default text-gradient-silk">Collaborate.</span>
                <Link to="/initiatives">
                  <motion.div 
                    whileHover={{ rotate: 45, scale: 1.1 }}
                    className="w-20 h-20 rounded-full bg-prospera-blue flex items-center justify-center text-slate-900 shadow-2xl cursor-pointer"
                  >
                    <ArrowRight size={36} />
                  </motion.div>
                </Link>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="flex flex-wrap gap-3"
              >
                <span className="px-8 py-3 rounded-full border-2 border-slate-900 text-3xl lg:text-6xl font-display font-medium tracking-tighter hover:bg-slate-900 hover:text-white transition-all cursor-default text-gradient-silk">Impact.</span>
                <span className="px-8 py-3 rounded-full bg-slate-900 text-white text-3xl lg:text-6xl font-display font-medium tracking-tighter shadow-2xl cursor-default">Together.</span>
              </motion.div>
            </div>

            <div className="space-y-6 mb-12">
              <div className="flex items-start gap-4 group">
                <div className="mt-1 w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-prospera-blue/20 transition-colors">
                  <Users size={16} className="text-slate-900" />
                </div>
                <div>
                  <h4 className="text-sm font-display font-bold text-slate-900">Collective Agency</h4>
                  <p className="text-xs text-slate-500 font-display leading-relaxed">Reclaiming power through decentralized social movements and shared foundations.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 group">
                <div className="mt-1 w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-prospera-blue/20 transition-colors">
                  <Zap size={16} className="text-slate-900" />
                </div>
                <div>
                  <h4 className="text-sm font-display font-bold text-slate-900">Independent Action</h4>
                  <p className="text-xs text-slate-500 font-display leading-relaxed">Humans gathering to solve global challenges without external dependencies.</p>
                </div>
              </div>

              <Link to="/how-it-works" className="flex items-center gap-3 text-slate-900 font-display text-sm font-bold bg-slate-50 hover:bg-slate-100 transition-colors p-4 rounded-2xl border border-slate-100">
                <Globe size={18} className="animate-spin-slow" />
                <span>Building the Future of Global Social Work</span>
                <ArrowRight size={14} className="ml-auto -rotate-45" />
              </Link>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6">
              <Link to="/start" className="w-full sm:w-auto">
                <button className="w-full bg-slate-900 text-white px-10 py-4 rounded-full font-display font-bold text-sm shadow-[0_20px_40px_-10px_rgba(15,23,42,0.3)] hover:shadow-[0_25px_50px_-12px_rgba(15,23,42,0.4)] transition-all flex items-center justify-center gap-3 group">
                  Join the Assembly <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
              <Link to="/how-it-works" className="text-slate-400 hover:text-slate-900 transition-colors font-display font-bold text-sm flex items-center gap-2">
                Our Philosophy <ArrowRight size={18} />
              </Link>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-100 flex items-center justify-between relative z-10">
            <div className="flex items-center gap-4">
              <div className="flex -space-x-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-white overflow-hidden shadow-sm">
                    <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" />
                  </div>
                ))}
                <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center border-2 border-white text-white text-[10px] font-bold shadow-sm">
                  +2k
                </div>
              </div>
              <p className="text-[10px] text-slate-400 font-display font-medium uppercase tracking-widest">
                Active Members
              </p>
            </div>
            <div className="flex items-center gap-2 text-prospera-blue font-display text-[10px] font-bold">
              <Sparkles size={14} />
              <span>LIVE IMPACT</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Middle Section: Text & Button */}
      <section className="py-24 px-6 md:px-12 lg:px-24 text-center">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12">
          <h2 className="text-4xl md:text-6xl font-display font-medium tracking-tighter leading-[1.1] text-left max-w-3xl">
            We help local <span className="pill-outline px-6 py-1">entrepreneurs</span> & <br />
            <span className="pill-highlight px-6 py-1 text-prospera-blue">organizations</span> raise funds for projects
          </h2>
          <Link to="/how-it-works">
            <button className="bg-white border border-slate-200 px-10 py-4 rounded-full font-display font-bold text-sm shadow-lg hover:shadow-xl transition-all flex items-center gap-3 whitespace-nowrap">
              Learn More <div className="w-2 h-2 bg-prospera-blue rounded-full" />
            </button>
          </Link>
        </div>
      </section>

      {/* Features Grid: 3 Cards */}
      <section className="pb-32 px-6 md:px-12 lg:px-24">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 01 */}
          <motion.div 
            whileHover={{ y: -10, scale: 1.02 }}
            className="glass-card-premium rounded-[3rem] p-10 relative overflow-hidden group border-prospera-blue/20"
          >
            <div className="flex justify-between items-start mb-12">
              <span className="pill-outline bg-white/50 border-white/50 px-4 py-1 text-[10px] uppercase tracking-widest text-slate-900">local projects & initiatives</span>
              <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center text-white shadow-xl group-hover:rotate-45 transition-transform">
                <ArrowRight size={20} className="-rotate-45" />
              </div>
            </div>
            <div className="relative z-10 mb-8">
              <h3 className="text-4xl font-display font-bold text-slate-900 leading-none mb-4">
                01/ Transparent <br /> Funding
              </h3>
              <Link to="/initiatives">
                <button className="bg-slate-900 text-white px-6 py-2.5 rounded-full text-[10px] font-display font-bold flex items-center gap-2 shadow-lg hover:bg-slate-800 transition-colors">
                  Explore <div className="w-1.5 h-1.5 bg-prospera-blue rounded-full" />
                </button>
              </Link>
            </div>
            <div className="absolute -bottom-10 -right-10 w-64 h-64 rounded-full overflow-hidden border-8 border-white/30 rotate-12 shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=600" 
                alt="Funding" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </motion.div>

          {/* Card 02 */}
          <motion.div 
            whileHover={{ y: -10, scale: 1.02 }}
            className="glass-card-premium rounded-[3rem] p-10 relative overflow-hidden group border-green-100"
          >
            <div className="relative z-10 mb-12">
              <h3 className="text-4xl font-display font-bold text-slate-900 leading-none mb-4">
                02/ Inspiration <br /> & Impact
              </h3>
              <Link to="/initiatives">
                <button className="bg-slate-900 text-white px-6 py-2.5 rounded-full text-[10px] font-display font-bold flex items-center gap-2 shadow-lg hover:bg-slate-800 transition-colors">
                  Explore <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                </button>
              </Link>
            </div>
            <div className="relative w-full aspect-square rounded-[2.5rem] overflow-hidden shadow-2xl mb-8 group-hover:scale-[1.02] transition-transform">
              <img 
                src="https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=600" 
                alt="Impact" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-display font-bold text-slate-400 uppercase tracking-widest">catalyst for new ideas</span>
              <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center text-white shadow-xl group-hover:rotate-45 transition-transform">
                <ArrowRight size={20} className="-rotate-45" />
              </div>
            </div>
          </motion.div>

          {/* Card 03 */}
          <motion.div 
            whileHover={{ y: -10, scale: 1.02 }}
            className="glass-card-premium rounded-[3rem] p-10 relative overflow-hidden group border-blue-50"
          >
            <div className="flex justify-between items-start mb-12">
              <span className="pill-outline bg-white/50 border-white/50 px-4 py-1 text-[10px] uppercase tracking-widest text-slate-900">democratic decision</span>
              <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center text-white shadow-xl group-hover:rotate-45 transition-transform">
                <ArrowRight size={20} className="-rotate-45" />
              </div>
            </div>
            <div className="relative w-full aspect-[4/3] rounded-[2.5rem] overflow-hidden shadow-2xl mb-8 blob-mask group-hover:scale-[1.02] transition-transform">
              <img 
                src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=600" 
                alt="Involvement" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="relative z-10">
              <h3 className="text-4xl font-display font-bold text-slate-900 leading-none mb-4">
                03/ Participation <br /> & Involvement
              </h3>
              <Link to="/initiatives">
                <button className="bg-slate-900 text-white px-6 py-2.5 rounded-full text-[10px] font-display font-bold flex items-center gap-2 shadow-lg hover:bg-slate-800 transition-colors">
                  Explore <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Bento Grid Section: Human Connection & Impact */}
      <section className="py-32 px-6 md:px-12 lg:px-24 bg-white relative z-10 rounded-[4rem] mx-4 md:mx-6 mb-24 shadow-2xl overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-slate-50 to-white pointer-events-none" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
            <div className="max-w-2xl">
              <span className="pill-highlight mb-6">Human Connection & Impact</span>
              <h2 className="text-5xl md:text-7xl font-display font-medium tracking-tighter leading-[0.9] text-slate-900">
                Reclaiming Civic Agency through <span className="text-prospera-blue italic">Collective Action.</span>
              </h2>
            </div>
            <p className="text-slate-500 font-display text-lg max-w-sm leading-relaxed">
              We provide the tools for social beings to gather, collaborate, and build foundations for global growth without external help.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Large Card */}
            <motion.div 
              whileHover={{ scale: 0.99 }}
              className="md:col-span-8 bg-slate-900 rounded-[3rem] p-12 text-white relative overflow-hidden group min-h-[500px]"
            >
              <div className="absolute inset-0 opacity-40 group-hover:opacity-60 transition-opacity">
                <img 
                  src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&q=80&w=1200" 
                  alt="Global Growth" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent" />
              <div className="relative z-10 h-full flex flex-col justify-end">
                <h3 className="text-4xl md:text-5xl font-display font-bold mb-6 leading-tight">
                  Build Foundations for <br /> Global Growth.
                </h3>
                <div className="flex items-center gap-6">
                  <Link to="/start">
                    <button className="bg-white text-slate-900 px-8 py-3 rounded-full font-display font-bold text-sm flex items-center gap-2">
                      Start Building <ArrowRight size={18} />
                    </button>
                  </Link>
                  <span className="text-white/60 font-display text-sm italic">Join 2,400+ active builders</span>
                </div>
              </div>
            </motion.div>

            {/* Side Column Cards */}
            <div className="md:col-span-4 flex flex-col gap-6">
              <motion.div 
                whileHover={{ scale: 1.02, y: -5 }}
                className="glass-card-premium rounded-[3rem] p-10 flex-1 flex flex-col justify-between"
              >
                <div className="w-12 h-12 rounded-2xl bg-prospera-blue flex items-center justify-center text-white shadow-lg">
                  <Zap size={24} />
                </div>
                <div>
                  <h4 className="text-2xl font-display font-bold text-slate-900 mb-2">Mobilize Change</h4>
                  <p className="text-slate-500 font-display text-sm leading-relaxed">Rapid response tools for emerging social movements.</p>
                </div>
              </motion.div>

              <motion.div 
                whileHover={{ scale: 1.02, y: -5 }}
                className="glass-card-premium rounded-[3rem] p-10 flex-1 flex flex-col justify-between"
              >
                <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-lg">
                  <Globe size={24} />
                </div>
                <div>
                  <h4 className="text-2xl font-display font-bold text-slate-900 mb-2">Scale Solutions</h4>
                  <p className="text-slate-500 font-display text-sm leading-relaxed">Turn local initiatives into global foundations.</p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-32 px-6 md:px-12 lg:px-24 relative z-10 overflow-hidden">
        {/* Floating Background Shapes */}
        <motion.div 
          animate={{ 
            y: [0, -20, 0],
            rotate: [0, 10, 0]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 -right-20 w-96 h-96 bg-prospera-blue/5 rounded-full blur-[120px] pointer-events-none"
        />
        <motion.div 
          animate={{ 
            y: [0, 20, 0],
            rotate: [0, -10, 0]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-1/4 -left-20 w-[500px] h-[500px] bg-slate-200/50 rounded-full blur-[150px] pointer-events-none"
        />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <div className="relative">
            <motion.div 
              animate={{ 
                scale: [1, 1.05, 1],
                rotate: [0, 5, 0]
              }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-20 -left-20 w-64 h-64 bg-prospera-blue/20 rounded-full blur-[100px] pointer-events-none" 
            />
            <div className="relative z-10 rounded-[4rem] overflow-hidden shadow-2xl aspect-[4/5] mask-radial">
              <img 
                src="https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=1200" 
                alt="Philosophy" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              className="absolute -bottom-10 -right-10 glass-panel p-8 rounded-[3rem] border-white/40 max-w-[280px] shadow-2xl"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center text-white">
                  <Sparkles size={24} />
                </div>
                <span className="font-display font-bold text-slate-900">Pure Human <br /> Potential</span>
              </div>
              <p className="text-xs text-slate-500 font-display leading-relaxed">
                "The assembly is where we remember that we don't need permission to change the world."
              </p>
            </motion.div>
          </div>

          <div>
            <span className="pill-outline mb-8">Our Philosophy</span>
            <h2 className="text-5xl md:text-7xl font-display font-medium tracking-tighter leading-[0.9] text-slate-900 mb-12">
              The Power of <br /> <span className="text-slate-400">Human Connection.</span>
            </h2>
            <div className="space-y-12">
              <div className="flex gap-6">
                <div className="text-4xl font-display font-bold text-prospera-blue opacity-50">01</div>
                <div>
                  <h4 className="text-xl font-display font-bold text-slate-900 mb-3">Social Beings, Social Work</h4>
                  <p className="text-slate-500 font-display leading-relaxed">
                    Humans are inherently social. We leverage this nature to build movements that don't rely on institutional gatekeepers.
                  </p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="text-4xl font-display font-bold text-prospera-blue opacity-50">02</div>
                <div>
                  <h4 className="text-xl font-display font-bold text-slate-900 mb-3">Decentralized Foundations</h4>
                  <p className="text-slate-500 font-display leading-relaxed">
                    Every foundation built on our platform is owned and operated by the community that created it.
                  </p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="text-4xl font-display font-bold text-prospera-blue opacity-50">03</div>
                <div>
                  <h4 className="text-xl font-display font-bold text-slate-900 mb-3">Global Growth</h4>
                  <p className="text-slate-500 font-display leading-relaxed">
                    By collaborating across borders, we create a network of impact that scales naturally with human participation.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-32 px-6 md:px-12 lg:px-24 relative z-10">
        <div className="max-w-7xl mx-auto bg-slate-900 rounded-[4rem] p-16 md:p-24 text-center relative overflow-hidden shadow-[0_50px_100px_-20px_rgba(15,23,42,0.5)]">
          <div className="absolute inset-0 opacity-30 pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.2),transparent_70%)]" />
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-prospera-blue/20 rounded-full blur-[100px] animate-pulse" />
            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-prospera-blue/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
          </div>
          
          <div className="relative z-10">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 text-white text-[10px] font-display font-bold mb-12 tracking-[0.3em] uppercase"
            >
              <Sparkles size={14} className="text-prospera-blue" />
              Ready to lead the movement?
            </motion.div>
            
            <h2 className="text-5xl md:text-8xl font-display font-medium tracking-tighter leading-[0.85] text-white mb-12">
              Start Your <br /> <span className="text-prospera-blue italic text-gradient-silk" style={{ backgroundImage: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 50%, #3b82f6 100%)' }}>Assembly.</span>
            </h2>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
              <Link to="/start" className="w-full sm:w-auto">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full bg-white text-slate-900 px-12 py-6 rounded-full font-display font-bold text-lg shadow-2xl flex items-center justify-center gap-3 group"
                >
                  Create Initiative <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </Link>
              <Link to="/initiatives" className="w-full sm:w-auto">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full bg-transparent border-2 border-white/20 text-white px-12 py-6 rounded-full font-display font-bold text-lg hover:bg-white/5 transition-colors"
                >
                  View Movements
                </motion.button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Back to Top Button */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: scrollProgress > 20 ? 1 : 0, y: scrollProgress > 20 ? 0 : 20 }}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-10 right-10 w-14 h-14 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-2xl z-[100] hover:scale-110 transition-transform"
      >
        <ArrowDown className="rotate-180" size={24} />
      </motion.button>
    </div>
  );
};

const Plus = ({ size, className }: { size: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const Facebook = ({ size, className }: { size: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
  </svg>
);

const Twitter = ({ size, className }: { size: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
  </svg>
);

const Instagram = ({ size, className }: { size: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

export default Home;
