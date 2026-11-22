import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'motion/react';
import { Award, Download, ExternalLink, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Certificate {
  _id?: string;
  id?: string;
  certificateId: string;
  type: string;
  actionTitle: string;
  issuedAt: string;
  qrLink: string;
}

export default function Profile() {
  const { user, loading: authLoading } = useAuth();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (user) {
      fetch(`/api/users/${user.id}/certificates`)
        .then(res => res.json())
        .then(data => {
          setCertificates(Array.isArray(data) ? data : []);
          setLoading(false);
        })
        .catch(() => {
          setCertificates([]);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [user, authLoading]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-pearl flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-prospera-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-pearl pt-36 pb-20 px-6 flex items-center justify-center">
        <div className="prospera-card p-12 max-w-lg w-full text-center bg-white border border-slate-100 shadow-2xl">
          <div className="w-20 h-20 rounded-3xl bg-slate-50 flex items-center justify-center mx-auto mb-8 text-prospera-blue">
            <ShieldCheck size={40} />
          </div>
          <h1 className="text-3xl font-display font-medium text-slate-900 mb-4">Sign In Required</h1>
          <p className="text-slate-500 font-display font-light mb-8">
            Sign in to view your civic dashboard, contributions, and verified certificates.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/login" className="bg-slate-900 text-white px-8 py-4 rounded-full font-display font-bold text-xs uppercase tracking-widest hover:bg-prospera-blue transition-all">
              Sign In
            </Link>
            <Link to="/signup" className="bg-white border border-slate-200 text-slate-900 px-8 py-4 rounded-full font-display font-bold text-xs uppercase tracking-widest hover:border-prospera-blue transition-all">
              Create Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pearl pt-32 pb-20">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <h1 className="text-5xl font-display font-medium text-slate-900 mb-4">My Dashboard</h1>
          <p className="text-slate-500 font-display font-light">Manage your contributions and certificates.</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-12">
          <div className="md:col-span-1">
            <div className="prospera-card p-8 text-center sticky top-32">
              <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-6 text-3xl font-display font-bold text-slate-900">
                {(user.fullName || 'U').charAt(0).toUpperCase()}
              </div>
              <h2 className="text-2xl font-display font-medium text-slate-900 mb-2">{user.fullName}</h2>
              <p className="text-slate-500 font-display font-light mb-8">{user.email}</p>
              <div className="pt-8 border-t border-slate-100">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-display font-bold uppercase tracking-widest text-slate-400">Total Certificates</span>
                  <span className="text-xl font-display font-medium text-slate-900">{certificates.length}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <h3 className="text-2xl font-display font-medium text-slate-900 mb-8 flex items-center gap-3">
              <Award className="text-prospera-blue" />
              Verified Certificates
            </h3>

            {loading ? (
              <div className="space-y-6">
                {[1, 2].map(i => (
                  <div key={i} className="h-32 bg-slate-100 animate-pulse rounded-3xl" />
                ))}
              </div>
            ) : certificates.length > 0 ? (
              <div className="space-y-6">
                {certificates.map((cert, i) => {
                  const certKey = cert._id || cert.id || cert.certificateId || String(i);
                  const downloadId = cert._id || cert.id;
                  return (
                  <motion.div 
                    key={certKey}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="prospera-card p-8 flex flex-col md:flex-row items-center justify-between gap-8 group hover:border-prospera-blue transition-all"
                  >
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 rounded-2xl bg-prospera-blue/10 text-prospera-blue flex items-center justify-center">
                        <ShieldCheck size={32} />
                      </div>
                      <div>
                        <h4 className="text-lg font-display font-bold text-slate-900">{cert.type}</h4>
                        <p className="text-sm text-slate-500 font-display font-light mb-1">{cert.actionTitle}</p>
                        <p className="text-[10px] text-slate-400 font-display uppercase tracking-widest">Issued on {cert.issuedAt ? new Date(cert.issuedAt).toLocaleDateString() : 'Recently'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {downloadId && (
                        <a 
                          href={`/api/certificates/${downloadId}/download`}
                          className="p-4 rounded-2xl bg-slate-900 text-white hover:bg-prospera-blue transition-all shadow-lg shadow-slate-900/10"
                          title="Download PDF"
                        >
                          <Download size={20} />
                        </a>
                      )}
                      <Link 
                        to={`/verify/${cert.certificateId}`}
                        className="p-4 rounded-2xl bg-white border border-slate-100 text-slate-400 hover:text-prospera-blue hover:border-prospera-blue transition-all"
                        title="View Verification Page"
                      >
                        <ExternalLink size={20} />
                      </Link>
                    </div>
                  </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="prospera-card p-12 text-center">
                <div className="w-20 h-20 rounded-3xl bg-slate-50 flex items-center justify-center mx-auto mb-8 text-slate-300">
                  <Award size={40} />
                </div>
                <h4 className="text-xl font-display font-medium text-slate-900 mb-4">No Certificates Yet</h4>
                <p className="text-slate-500 font-display font-light mb-8">Start an initiative or join as a volunteer to earn verified certificates instantly.</p>
                <Link to="/initiatives">
                  <button className="bg-slate-900 text-white px-10 py-5 rounded-full font-display font-bold text-xs uppercase tracking-widest hover:bg-prospera-blue transition-all">
                    Browse Initiatives
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
