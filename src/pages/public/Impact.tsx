import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, Users, Globe, Target, Award, Zap } from 'lucide-react';

const Impact = () => {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(() => {});
  }, []);

  const data = [
    { name: 'Jan', initiatives: 45, impact: 1200 },
    { name: 'Feb', initiatives: 82, impact: 2500 },
    { name: 'Mar', initiatives: 156, impact: 4800 },
    { name: 'Apr', initiatives: 298, impact: 8200 },
    { name: 'May', initiatives: 542, impact: 15600 },
    { name: 'Jun', initiatives: 890, impact: 28400 },
  ];

  const impactStats = [
    { label: 'Active Hubs', value: stats?.totalInitiatives || '450+', icon: Globe, color: 'text-prospera-blue' },
    { label: 'Total Citizens', value: '1.2M+', icon: Users, color: 'text-emerald-500' },
    { label: 'Impact Score', value: '98/100', icon: Target, color: 'text-slate-400' },
    { label: 'Awards Won', value: '24', icon: Award, color: 'text-purple-500' },
  ];

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
            <span className="pill-outline border-slate-900 mb-8">Data & Insights</span>
            <h1 className="text-7xl md:text-9xl font-display font-medium leading-[0.85] tracking-tighter mb-12">
              Measuring our <br /> <span className="italic text-slate-400">Collective Impact.</span>
            </h1>
            <p className="text-2xl text-slate-500 font-display font-light leading-relaxed max-w-2xl">
              Transparency is our foundation. Explore the real-time data behind our global movement for civic change.
            </p>
          </motion.div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-24">
          {impactStats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="prospera-card p-10"
            >
              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-6">
                <stat.icon className={stat.color} size={24} />
              </div>
              <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-2 font-display">{stat.label}</p>
              <h3 className="text-4xl font-display font-light text-slate-900">{stat.value}</h3>
            </motion.div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid lg:grid-cols-2 gap-8 mb-24">
          {/* Growth Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="prospera-card p-12"
          >
            <div className="flex justify-between items-center mb-12">
              <div>
                <h3 className="text-2xl font-display font-medium text-slate-900">Initiative Growth</h3>
                <p className="text-sm text-slate-400 font-display font-light">Monthly active projects worldwide</p>
              </div>
              <TrendingUp className="text-emerald-500" size={24} />
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorInit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0066FF" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#0066FF" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontFamily: 'Inter'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontFamily: 'Inter'}} />
                  <Tooltip 
                    contentStyle={{backgroundColor: '#fff', border: 'none', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontFamily: 'Inter'}}
                    itemStyle={{color: '#0f172a', fontWeight: 500}}
                  />
                  <Area type="monotone" dataKey="initiatives" stroke="#0066FF" strokeWidth={3} fillOpacity={1} fill="url(#colorInit)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Impact Score Chart */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="prospera-card p-12"
          >
            <div className="flex justify-between items-center mb-12">
              <div>
                <h3 className="text-2xl font-display font-medium text-slate-900">Citizen Engagement</h3>
                <p className="text-sm text-slate-400 font-display font-light">Active participation metrics</p>
              </div>
              <Zap className="text-prospera-blue" size={24} />
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontFamily: 'Inter'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontFamily: 'Inter'}} />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{backgroundColor: '#fff', border: 'none', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontFamily: 'Inter'}}
                  />
                  <Bar dataKey="impact" fill="#0f172a" radius={[10, 10, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Global Reach Section */}
        <section className="bg-slate-900 rounded-[4rem] p-12 md:p-24 text-white relative overflow-hidden mb-24">
          <div className="absolute top-0 right-0 w-96 h-96 bg-prospera-blue/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="grid lg:grid-cols-2 gap-24 items-center relative z-10">
            <div>
              <h2 className="text-4xl md:text-6xl font-display font-light leading-tight mb-8">
                Global Reach, <br /> Local <span className="italic text-prospera-blue">Action.</span>
              </h2>
              <p className="text-xl text-white/60 font-display font-light leading-relaxed mb-12">
                Our platform connects citizens across borders, sharing knowledge and resources to solve common challenges.
              </p>
              <div className="space-y-6">
                {[
                  { label: 'Asia Pacific', value: '45%' },
                  { label: 'Europe', value: '25%' },
                  { label: 'Americas', value: '20%' },
                  { label: 'Africa', value: '10%' },
                ].map((region, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-2 font-display">
                      <span className="text-white/60">{region.label}</span>
                      <span className="text-prospera-blue font-medium">{region.value}</span>
                    </div>
                    <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        whileInView={{ width: region.value }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: i * 0.1 }}
                        className="h-full bg-prospera-blue"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="aspect-square rounded-[3rem] overflow-hidden border border-white/10 relative">
              <img 
                src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&q=80&w=1200" 
                alt="Global Map" 
                className="w-full h-full object-cover opacity-40"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-slate-900/40" />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Impact;
