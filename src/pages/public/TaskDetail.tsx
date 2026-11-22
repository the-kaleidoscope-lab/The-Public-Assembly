import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, Shield, Users, CheckCircle, Clock, 
  MessageSquare, Send, FileText, Image as ImageIcon, 
  Download, Activity, AlertCircle, User, Crown
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { cn } from '../../lib/utils';
import { formatDistanceToNow } from 'date-fns';

const TaskDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket } = useSocket();
  const [task, setTask] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const res = await fetch(`/api/tasks/${id}`);
        if (!res.ok) throw new Error('Task not found');
        const data = await res.json();
        setTask(data);
        
        const msgRes = await fetch(`/api/tasks/${id}/messages`);
        const msgData = msgRes.ok ? await msgRes.json() : [];
        setMessages(Array.isArray(msgData) ? msgData : []);
      } catch (error) {
        console.error('Error fetching task:', error);
        navigate('/initiatives');
      } finally {
        setLoading(false);
      }
    };
    fetchTask();

    if (socket) {
      socket.emit('join:task', id);
      socket.on('task_message:new', (msg: any) => {
        setMessages(prev => [...prev, msg]);
      });
      socket.on('task:update', (updatedTask: any) => {
        if (updatedTask.id === id || updatedTask._id === id) {
          setTask((prev: any) => ({ ...prev, ...updatedTask }));
        }
      });
    }

    return () => {
      if (socket) {
        socket.off('task_message:new');
        socket.off('task:update');
      }
    };
  }, [id, socket, navigate]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent, fileData?: { url: string, name: string, type: string }) => {
    if (e) e.preventDefault();
    if ((!newMessage.trim() && !fileData) || !user) return;

    const res = await fetch(`/api/tasks/${id}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        userId: user?.id, 
        text: newMessage,
        fileUrl: fileData?.url,
        fileName: fileData?.name,
        fileType: fileData?.type
      })
    });
    if (res.ok) setNewMessage('');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      await handleSendMessage(null as any, {
        url: base64,
        name: file.name,
        type: file.type
      });
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const updateStatus = async (status: string) => {
    const res = await fetch(`/api/tasks/${id}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (res.ok) {
      const updated = await res.json();
      setTask((prev: any) => ({ ...prev, ...updated }));
    }
  };

  if (loading || !task) return (
    <div className="min-h-screen flex items-center justify-center bg-pearl">
      <div className="w-12 h-12 border-4 border-prospera-blue border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const initiativeLinkId = typeof task.initiativeId === 'object' ? (task.initiativeId?.id || task.initiativeId?._id) : task.initiativeId;
  const assignedObj = typeof task.assignedTo === 'object' ? task.assignedTo : null;
  const assignedId = task.assignedToId || (assignedObj ? (assignedObj.id || assignedObj._id) : task.assignedTo);
  const assignedName = task.assignedName || assignedObj?.fullName || (assignedId ? 'Assigned Member' : null);
  const leaderName = task.leaderName || 'Assembly Leader';
  const isAssigned = Boolean(user && assignedId && String(assignedId) === String(user.id));
  const isLeader = Boolean(user && task.leaderId && String(task.leaderId) === String(user.id));
  const cleanMembers = Array.isArray(task.members) ? task.members.filter((m: any) => m && typeof m === 'object') : [];

  const safeTimeAgo = (dateVal: any) => {
    try {
      const d = new Date(dateVal);
      return Number.isNaN(d.getTime()) ? 'just now' : `${formatDistanceToNow(d)} ago`;
    } catch {
      return 'just now';
    }
  };

  return (
    <div className="min-h-screen bg-pearl pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <Link to={initiativeLinkId ? `/initiatives/${initiativeLinkId}` : '/initiatives'} className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] font-bold text-slate-400 hover:text-slate-900 transition-colors mb-12 font-display">
          <ArrowLeft size={14} /> Back to Initiative
        </Link>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Left Column: Task Details */}
          <div className="lg:col-span-1 space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="prospera-card p-10 bg-white shadow-xl"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center text-white",
                  task.status === 'completed' ? "bg-emerald-500" : task.status === 'in-progress' ? "bg-amber-500" : "bg-slate-400"
                )}>
                  {task.status === 'completed' ? <CheckCircle size={24} /> : <Clock size={24} />}
                </div>
                <span className="prospera-pill border-slate-200 uppercase tracking-widest text-[10px]">{task.status}</span>
              </div>

              <h1 className="text-4xl font-display font-medium text-slate-900 mb-6 leading-tight">
                {task.title}
              </h1>

              <div className="space-y-6 mb-10">
                <div>
                  <h4 className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-3 font-display">Description</h4>
                  <p className="text-slate-600 font-display font-light leading-relaxed">
                    {task.description || 'No detailed description provided for this task.'}
                  </p>
                </div>

                <div className="pt-6 border-t border-slate-100">
                  <h4 className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-4 font-display">Mission Leader</h4>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                      {leaderName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-display font-bold text-slate-900">{leaderName}</p>
                      <p className="text-[10px] text-slate-400 uppercase tracking-widest">Initiative Creator</p>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100">
                  <h4 className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-4 font-display">Assigned Member</h4>
                  {assignedId ? (
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-prospera-blue text-white flex items-center justify-center font-bold text-xs">
                        {(assignedName || 'M').charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-display font-bold text-slate-900">{assignedName}</p>
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest">Task Owner</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 text-rose-500">
                      <AlertCircle size={18} />
                      <span className="text-[10px] uppercase tracking-widest font-bold font-display">Unassigned</span>
                    </div>
                  )}
                </div>
              </div>

              {(isAssigned || isLeader) && (
                <div className="space-y-3">
                  <h4 className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-4 font-display">Update Progress</h4>
                  <div className="grid grid-cols-3 gap-2">
                    <button 
                      onClick={() => updateStatus('todo')}
                      className={cn(
                        "py-3 rounded-xl text-[8px] font-bold uppercase tracking-widest border transition-all",
                        task.status === 'todo' ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-400 border-slate-100 hover:border-slate-300"
                      )}
                    >
                      To-Do
                    </button>
                    <button 
                      onClick={() => updateStatus('in-progress')}
                      className={cn(
                        "py-3 rounded-xl text-[8px] font-bold uppercase tracking-widest border transition-all",
                        task.status === 'in-progress' ? "bg-amber-500 text-white border-amber-500" : "bg-white text-slate-400 border-slate-100 hover:border-slate-300"
                      )}
                    >
                      In Progress
                    </button>
                    <button 
                      onClick={() => updateStatus('completed')}
                      className={cn(
                        "py-3 rounded-xl text-[8px] font-bold uppercase tracking-widest border transition-all",
                        task.status === 'completed' ? "bg-emerald-500 text-white border-emerald-500" : "bg-white text-slate-400 border-slate-100 hover:border-slate-300"
                      )}
                    >
                      Completed
                    </button>
                  </div>
                </div>
              )}
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="prospera-card p-10 bg-slate-900 text-white"
            >
              <h3 className="text-xl font-display font-medium mb-8 flex items-center gap-3">
                <Users size={20} className="text-prospera-blue" />
                Initiative Members ({cleanMembers.length})
              </h3>
              <div className="space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                {cleanMembers.map((member: any, idx: number) => (
                  <div key={member.id || member._id || idx} className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold">
                      {(member.fullName || 'M').charAt(0)}
                    </div>
                    <span className="text-sm font-display font-light text-white/80">{member.fullName || 'Member'}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Column: Initiation Room (Chat) */}
          <div className="lg:col-span-2">
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-[3rem] border border-slate-100 overflow-hidden shadow-2xl flex flex-col h-[800px]"
            >
              <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-prospera-blue/10 text-prospera-blue flex items-center justify-center">
                    <MessageSquare size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-display font-medium text-slate-900">Initiation Room</h3>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-display">Task-Specific Coordination</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-display">Live Session</span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar">
                {messages.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-20">
                    <Activity size={64} className="mb-6" />
                    <p className="text-xl font-display font-light">The initiation room is open.<br/>Begin coordinating the task.</p>
                  </div>
                )}
                {messages.map((msg, i) => {
                  const msgUserObj = typeof msg.userId === 'object' ? msg.userId : null;
                  const msgUserId = msgUserObj ? (msgUserObj.id || msgUserObj._id) : msg.userId;
                  const msgAuthor = msg.fullName || msgUserObj?.fullName || 'Member';
                  const isOwnMsg = Boolean(user && msgUserId && String(msgUserId) === String(user.id));

                  return (
                    <motion.div
                      key={msg.id || msg._id || i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        "flex flex-col max-w-[80%]",
                        isOwnMsg ? "ml-auto items-end" : "items-start"
                      )}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-[10px] font-display font-bold text-slate-900">{msgAuthor}</span>
                        <span className="text-[10px] text-slate-400 uppercase tracking-widest font-display">{safeTimeAgo(msg.createdAt)}</span>
                      </div>
                      <div className={cn(
                        "px-8 py-5 rounded-[2rem] text-base leading-relaxed font-display",
                        isOwnMsg
                          ? "bg-slate-900 text-pearl rounded-tr-none font-light shadow-lg" 
                          : "bg-slate-50 text-slate-900 rounded-tl-none border border-slate-100"
                      )}>
                        {msg.text}
                        {msg.fileUrl && (
                          <div className="mt-4 pt-4 border-t border-white/10">
                            {msg.fileType?.startsWith('image/') ? (
                              <img src={msg.fileUrl} alt={msg.fileName} className="max-w-full rounded-xl shadow-lg" referrerPolicy="no-referrer" />
                            ) : (
                              <a 
                                href={msg.fileUrl} 
                                download={msg.fileName}
                                className="flex items-center gap-3 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all"
                              >
                                <div className="w-10 h-10 rounded-lg bg-prospera-blue flex items-center justify-center text-white">
                                  <FileText size={20} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-bold truncate">{msg.fileName}</p>
                                  <p className="text-[10px] opacity-50 uppercase tracking-widest">Download File</p>
                                </div>
                                <Download size={16} className="opacity-50" />
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
                <div ref={chatEndRef} />
              </div>

              <form onSubmit={handleSendMessage} className="p-8 bg-slate-50 border-t border-slate-100 flex gap-4 items-center">
                <div className="flex gap-2">
                  <label className="w-12 h-12 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-prospera-blue hover:border-prospera-blue transition-all flex items-center justify-center cursor-pointer shadow-sm">
                    <ImageIcon size={20} />
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                  </label>
                  <label className="w-12 h-12 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-prospera-blue hover:border-prospera-blue transition-all flex items-center justify-center cursor-pointer shadow-sm">
                    <FileText size={20} />
                    <input type="file" className="hidden" onChange={handleFileUpload} />
                  </label>
                </div>
                <input 
                  type="text" 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={isUploading ? "Uploading file..." : "Coordinate task execution..."}
                  disabled={isUploading}
                  className="flex-1 bg-white rounded-2xl px-8 py-5 text-base outline-none focus:ring-2 focus:ring-slate-200 border border-slate-200 transition-all text-slate-900 placeholder:text-slate-400 font-display disabled:opacity-50 shadow-sm"
                />
                <button 
                  type="submit" 
                  disabled={isUploading}
                  className="w-16 h-16 bg-slate-900 text-pearl rounded-2xl flex items-center justify-center hover:bg-prospera-blue transition-all shadow-xl disabled:opacity-50"
                >
                  <Send size={24} />
                </button>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetail;
