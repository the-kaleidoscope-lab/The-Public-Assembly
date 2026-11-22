import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ShieldCheck, Calendar, User, Award, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';

const VerifyCertificate = () => {
  const { id } = useParams();
  const [cert, setCert] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await fetch(`/api/verify/${id}`);
        if (res.ok) {
          const data = await res.json();
          setCert(data);
        } else {
          setError(true);
        }
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    verify();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-pearl">
      <div className="w-12 h-12 border-4 border-prospera-blue border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-pearl pt-32 pb-24">
      <div className="max-w-3xl mx-auto px-6">
        <Link to="/" className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] font-bold text-slate-400 hover:text-slate-900 transition-colors mb-12 font-display">
          <ArrowLeft size={14} /> Back to Home
        </Link>

        {error ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[40px] p-12 border border-rose-100 text-center shadow-xl shadow-rose-500/5"
          >
            <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-8">
              <AlertCircle size={40} className="text-rose-500" />
            </div>
            <h1 className="text-3xl font-display font-medium text-slate-900 mb-4">Invalid Certificate</h1>
            <p className="text-slate-500 font-display leading-relaxed mb-8">
              The certificate ID you are trying to verify does not exist or has been revoked. 
              Please check the ID and try again.
            </p>
            <div className="text-xs font-mono text-slate-400 bg-slate-50 p-4 rounded-2xl inline-block">
              ID: {id}
            </div>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[40px] overflow-hidden border border-slate-100 shadow-2xl shadow-slate-200/50"
          >
            <div className="bg-prospera-blue p-12 text-white text-center relative">
              <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10 pointer-events-none">
                <div className="absolute -top-1/2 -left-1/4 w-[150%] h-[200%] bg-[radial-gradient(circle,white_1px,transparent_1px)] [background-size:40px_40px]" />
              </div>
              <div className="relative z-10">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center mx-auto mb-6 border border-white/30">
                  <ShieldCheck size={40} className="text-white" />
                </div>
                <h1 className="text-4xl font-display font-medium mb-2">Verified Authentic</h1>
                <p className="text-white/70 font-display tracking-widest text-[10px] uppercase font-bold">Prospera Assembly Certification Authority</p>
              </div>
            </div>

            <div className="p-12">
              <div className="grid gap-8">
                <div className="flex items-start gap-6 p-6 rounded-3xl bg-slate-50 border border-slate-100">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                    <User className="text-prospera-blue" size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Recipient Name</p>
                    <p className="text-xl font-display font-medium text-slate-900">{cert.name}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="flex items-start gap-6 p-6 rounded-3xl bg-slate-50 border border-slate-100">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                      <Award className="text-prospera-blue" size={24} />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Role & Type</p>
                      <p className="text-lg font-display font-medium text-slate-900">{cert.role}</p>
                      <p className="text-xs text-slate-500">{cert.type}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-6 p-6 rounded-3xl bg-slate-50 border border-slate-100">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                      <Calendar className="text-prospera-blue" size={24} />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Issue Date</p>
                      <p className="text-lg font-display font-medium text-slate-900">{new Date(cert.issuedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-6 p-6 rounded-3xl bg-slate-50 border border-slate-100">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                    <CheckCircle className="text-prospera-blue" size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Mission / Action</p>
                    <p className="text-xl font-display font-medium text-slate-900">{cert.action}</p>
                  </div>
                </div>
              </div>

              <div className="mt-12 pt-12 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2">Certificate ID</p>
                  <p className="font-mono text-sm text-slate-900 bg-slate-100 px-4 py-2 rounded-xl">{cert.certificateId}</p>
                </div>
                <div className="text-center md:text-right">
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2">Status</p>
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold uppercase tracking-widest">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    Authentic & Valid
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default VerifyCertificate;
