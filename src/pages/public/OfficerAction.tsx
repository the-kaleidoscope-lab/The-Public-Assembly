import React, { useState, useEffect } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { Shield, CheckCircle, MessageSquare, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

const OfficerAction = () => {
  const { action } = useParams<{ action: string }>();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid or missing security token.');
      setLoading(false);
      return;
    }

    if (action === 'resolve') {
      handleResolve();
    } else if (action === 'reply') {
      setLoading(false);
    } else {
      setStatus('error');
      setMessage('Unknown action requested.');
      setLoading(false);
    }
  }, [action, token]);

  const handleResolve = async () => {
    try {
      const res = await fetch(`/api/officer-action/resolve?token=${token}`, { method: 'POST' });
      const data = await res.json();
      
      if (res.ok) {
        setStatus('success');
        setMessage(data.message || 'Complaint has been successfully resolved and the timer has been stopped.');
      } else {
        setStatus('error');
        setMessage(data.error || 'Failed to resolve complaint. The link might have expired.');
      }
    } catch (error) {
      setStatus('error');
      setMessage('A network error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return toast.error('Please enter a reply');

    setSubmitting(true);
    try {
      const res = await fetch(`/api/officer-action/reply?token=${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reply: replyText })
      });
      const data = await res.json();

      if (res.ok) {
        setStatus('success');
        setMessage('Your reply has been posted and the complainant has been notified. The complaint is now marked as resolved.');
      } else {
        toast.error(data.error || 'Failed to post reply.');
      }
    } catch (error) {
      toast.error('A network error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-pearl flex items-center justify-center">
        <Loader2 className="animate-spin text-prospera-blue" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pearl pt-32 pb-24 px-6">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="prospera-card p-12 bg-white shadow-2xl"
        >
          <div className="flex items-center gap-4 mb-12">
            <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center">
              <Shield size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-display font-medium text-slate-900">Officer Action</h1>
              <p className="text-sm text-slate-400 font-display font-light uppercase tracking-widest">Secure Portal</p>
            </div>
          </div>

          {status === 'idle' && action === 'reply' && (
            <form onSubmit={handleReplySubmit} className="space-y-8">
              <div className="space-y-4">
                <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400 ml-4 font-display">Your Official Reply</label>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Enter your response to the complainant..."
                  rows={6}
                  className="w-full px-8 py-6 rounded-[2rem] bg-slate-50 border border-transparent focus:border-prospera-blue/20 focus:bg-white outline-none transition-all text-slate-900 placeholder:text-slate-300 resize-none font-display"
                  required
                />
                <p className="text-xs text-slate-400 italic px-4">
                  Note: Posting a reply will automatically mark the complaint as RESOLVED and stop the escalation timer.
                </p>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-slate-900 text-white py-5 rounded-full font-display font-bold text-sm hover:bg-prospera-blue transition-all shadow-xl flex items-center justify-center gap-3 group disabled:opacity-50"
              >
                {submitting ? 'Posting Reply...' : 'Post Reply & Resolve'}
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          )}

          {status === 'success' && (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8">
                <CheckCircle size={40} />
              </div>
              <h2 className="text-2xl font-display font-medium text-slate-900 mb-4">Action Successful</h2>
              <p className="text-slate-500 font-display font-light leading-relaxed mb-12">
                {message}
              </p>
              <button 
                onClick={() => window.close()}
                className="text-sm font-display font-bold text-prospera-blue hover:underline"
              >
                You can close this window now.
              </button>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-8">
                <AlertCircle size={40} />
              </div>
              <h2 className="text-2xl font-display font-medium text-slate-900 mb-4">Action Failed</h2>
              <p className="text-rose-500/80 font-display font-light leading-relaxed mb-12">
                {message}
              </p>
              <Link 
                to="/"
                className="inline-block bg-slate-900 text-white px-8 py-4 rounded-full font-display font-bold text-xs hover:bg-prospera-blue transition-all"
              >
                Return to Home
              </Link>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default OfficerAction;
