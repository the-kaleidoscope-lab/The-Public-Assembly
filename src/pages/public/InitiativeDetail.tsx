import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MapPin, Users, Calendar, ArrowLeft, ShieldCheck, 
  MessageSquare, CheckSquare, Activity, Send, 
  Clock, AlertCircle, Plus, MoreVertical, IndianRupee, CheckCircle,
  GitBranch, ChevronRight, FileText, Image as ImageIcon, Download,
  Volume2, Megaphone, Crown, Circle, ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../lib/utils';
import { formatDistanceToNow } from 'date-fns';

const MissionTree = ({ initiative, volunteerCount, tasks }: { initiative: any, volunteerCount: number, tasks: any[] }) => {
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const totalTasks = tasks.length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

const isCompleted = initiative.status?.toUpperCase() === 'COMPLETED';
  const nodes = [
    { 
      id: 'start', 
      label: 'Initiated', 
      date: initiative.createdAt ? new Date(initiative.createdAt).toLocaleDateString() : 'Oct 12, 2025', 
      status: 'completed', 
      icon: Calendar 
    },
    { 
      id: 'mobilize', 
      label: 'Mobilizing', 
      detail: `${volunteerCount} Volunteers Joined`, 
      status: volunteerCount > 0 ? 'completed' : 'active', 
      icon: Users 
    },
    { 
      id: 'execution', 
      label: 'In Process', 
      detail: totalTasks > 0 ? `${completedTasks}/${totalTasks} Tasks Done (${progressPercent}%)` : 'Defining Tasks...', 
      status: isCompleted ? 'completed' : (totalTasks > 0 ? 'active' : 'pending'), 
      icon: Activity 
    },
    { 
      id: 'finish', 
      label: 'Completion', 
      date: isCompleted ? `Finished on ${new Date(initiative.completedAt || Date.now()).toLocaleDateString()}` : (initiative.endDate ? new Date(initiative.endDate).toLocaleDateString() : 'Estimated Dec 2025'), 
      status: isCompleted ? 'completed' : 'pending', 
      icon: CheckCircle 
    },
  ];

  return (
    <div className="prospera-card p-12 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-8 opacity-5">
        <GitBranch size={120} />
      </div>
      <h3 className="text-2xl font-display font-medium mb-12 text-slate-900 flex items-center gap-3">
        <GitBranch className="text-prospera-blue" size={24} />
        Mission Roadmap
      </h3>
      
      <div className="relative">
        {/* Vertical Line */}
        <div className="absolute left-[27px] top-0 bottom-0 w-0.5 bg-slate-100" />
        
        <div className="space-y-12 relative">
          {nodes.map((node, i) => (
            <motion.div 
              key={node.id}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-start gap-8 group"
            >
              <div className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center z-10 transition-all duration-500 shadow-lg",
                node.status === 'completed' ? "bg-emerald-500 text-white" : 
                node.status === 'active' ? "bg-prospera-blue text-white animate-pulse" : 
                "bg-white border-2 border-slate-100 text-slate-300"
              )}>
                <node.icon size={20} />
              </div>
              
              <div className="pt-2">
                <h4 className={cn(
                  "text-lg font-display font-medium transition-colors",
                  node.status === 'pending' ? "text-slate-400" : "text-slate-900"
                )}>
                  {node.label}
                </h4>
                <p className="text-sm text-slate-500 font-display font-light">
                  {node.date || node.detail}
                </p>
              </div>
              
              {node.status === 'active' && (
                <div className="ml-auto">
                  <span className="pill-highlight">
                    Current Stage
                  </span>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

const InitiativeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { socket } = useSocket();
  const { user } = useAuth();
  const [initiative, setInitiative] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [supportCount, setSupportCount] = useState(0);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [volunteerCount, setVolunteerCount] = useState(0);
  const [activeTab, setActiveTab] = useState('overview');
  const [isJoined, setIsJoined] = useState(false);
  const [isSupporter, setIsSupporter] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [taskModalStatus, setTaskModalStatus] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`/api/initiatives/${id}`)
      .then(async res => {
        if (!res.ok) throw new Error('Initiative not found');
        return res.json();
      })
      .then(data => {
        setInitiative(data);
        setVolunteerCount(data.volunteers?.length || 0);
        setSupportCount(data.supportCount || 0);
        if (user) {
          setIsJoined(data.volunteers?.some((v: any) => (v.userId?.id || v.userId?._id || v.userId) === user.id));
          setIsSupporter(data.donations?.some((d: any) => (d.userId?.id || d.userId?._id || d.userId) === user.id));
        }
      })
      .catch(() => {
        toast.error('Initiative not found');
        navigate('/initiatives');
      });

    fetch(`/api/initiatives/${id}/tasks`)
      .then(res => res.json())
      .then(data => setTasks(Array.isArray(data) ? data : []))
      .catch(() => setTasks([]));

    fetch(`/api/initiatives/${id}/messages`)
      .then(res => res.json())
      .then(data => setMessages(Array.isArray(data) ? data : []))
      .catch(() => setMessages([]));

    if (socket) {
      socket.emit('join:initiative', id);
      
      socket.on('volunteer:update', ({ count }) => {
        setVolunteerCount(count);
      });

      socket.on('initiative:support', ({ initiativeId: sid, supportCount: count }) => {
        if (sid === id) {
          setSupportCount(count);
        }
      });

      socket.on('task:update', (updatedTask: any) => {
        const uid = updatedTask.id || updatedTask._id;
        setTasks(prev => prev.map(t => (t.id || t._id) === uid ? updatedTask : t));
      });

      socket.on('task:new', (newTask: any) => {
        const nid = newTask.id || newTask._id;
        setTasks(prev => prev.some(t => (t.id || t._id) === nid) ? prev : [...prev, newTask]);
      });

      socket.on('initiative:update', (updatedInitiative: any) => {
        setInitiative((prev: any) => ({
          ...prev,
          ...updatedInitiative,
          createdBy: typeof updatedInitiative?.createdBy === 'object' ? updatedInitiative.createdBy : prev?.createdBy
        }));
      });

      socket.on('message:new', (msg: any) => {
        setMessages(prev => [...prev, msg]);
      });
    }

    return () => {
      if (socket) {
        socket.off('volunteer:update');
        socket.off('initiative:support');
        socket.off('task:update');
        socket.off('task:new');
        socket.off('initiative:update');
        socket.off('message:new');
      }
    };
  }, [id, socket, user, navigate]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleJoin = async () => {
    if (!user) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }
    try {
      const res = await fetch(`/api/initiatives/${id}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      });
      const data = await res.json();
      if (res.ok) {
        setIsJoined(true);
        setVolunteerCount(prev => prev + 1);
        toast.success("Welcome to the mission! Your Enrollment Certificate has been issued and sent to your email.");
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
        setActiveTab('tasks'); // Switch to workflow immediately
      } else {
        toast.error(data.error || "Failed to join initiative");
      }
    } catch (err) {
      toast.error("Connection error. Please try again.");
    }
  };

  const handleComplete = async () => {
    const creatorId = typeof initiative?.createdBy === 'object' ? (initiative.createdBy?.id || initiative.createdBy?._id) : initiative?.createdBy;
    if (!user || user.id !== creatorId) return;
    const res = await fetch(`/api/initiatives/${id}/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id })
    });
    if (res.ok) {
      const updated = await res.json();
      setInitiative(updated);
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#3b82f6', '#0f172a', '#ffffff']
      });
      toast.success("Mission completed! Global Celebration Initiated! Certificates issued.");
    } else {
      const err = await res.json();
      toast.error(err.error || "Failed to complete mission");
    }
  };

  const handleSendMessage = async (e: React.FormEvent, fileData?: { url: string, name: string, type: string }) => {
    if (e) e.preventDefault();
    if ((!newMessage.trim() && !fileData) || !user) return;

    const res = await fetch(`/api/initiatives/${id}/messages`, {
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

  const handleSupport = async () => {
    if (!user) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }
    try {
      const res = await fetch(`/api/initiatives/${id}/support`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, amount: 10 })
      });
      if (res.ok) {
        const data = await res.json();
        setSupportCount(data.supportCount);
        setIsSupporter(true);
        setActiveTab('tasks'); // Unlock and show tasks
      }
    } catch (error) {
      console.error('Support error:', error);
    }
  };

  const updateTaskStatus = async (taskId: string, status: string) => {
    const res = await fetch(`/api/tasks/${taskId}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (res.ok) {
      toast.success(`Task moved to ${status}`);
    }
  };

  const handleAddTask = (status: string = 'todo') => {
    if (!user) return;
    setTaskModalStatus(status);
    setNewTaskTitle('');
    setNewTaskDescription('');
  };

  const handleSubmitNewTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !taskModalStatus || !newTaskTitle.trim()) return;

    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        initiativeId: id,
        title: newTaskTitle.trim(),
        description: newTaskDescription.trim(),
        assignedTo: user.id,
        status: taskModalStatus
      })
    });
    if (res.ok) {
      toast.success("Task added to board");
      setTaskModalStatus(null);
      setNewTaskTitle('');
      setNewTaskDescription('');
    } else {
      toast.error("Failed to add task");
    }
  };

  const handlePhotoUpload = async (type: 'before' | 'after', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      const res = await fetch(`/api/initiatives/${id}/photos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, photoUrl: base64 })
      });
      if (res.ok) {
        const updated = await res.json();
        setInitiative((prev: any) => ({ ...prev, ...updated }));
        toast.success(`${type === 'before' ? 'Before' : 'After'} photo updated!`);
      } else {
        toast.error('Failed to upload photo');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAISuggestions = async () => {
    setIsGeneratingAI(true);
    try {
      const res = await fetch(`/api/initiatives/${id}/ai-suggestions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        const suggestions = await res.json();
        // Add each suggestion as a task
        for (const suggestion of suggestions) {
          await fetch('/api/tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              initiativeId: id, 
              title: suggestion, 
              description: 'AI Suggested Task', 
              assignedTo: user?.id, 
              status: 'todo' 
            })
          });
        }
        toast.success("AI has suggested and added 5 new tasks!");
      } else {
        const err = await res.json();
        toast.error(err.error || "AI suggestions failed");
      }
    } catch (error) {
      toast.error("Failed to connect to AI service");
    } finally {
      setIsGeneratingAI(false);
    }
  };

  if (!initiative) return (
    <div className="min-h-screen flex items-center justify-center bg-pearl">
      <div className="w-12 h-12 border-4 border-prospera-blue border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const creatorId = typeof initiative.createdBy === 'object' ? (initiative.createdBy?.id || initiative.createdBy?._id) : initiative.createdBy;
  const leaderName = initiative.creatorName || (typeof initiative.createdBy === 'object' ? initiative.createdBy?.fullName : null) || 'Assembly Leader';
  const isLeader = Boolean(user && user.id === creatorId);
  const isInitiativeCompleted = initiative.status?.toUpperCase() === 'COMPLETED';

  return (
    <div className="min-h-screen bg-pearl pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Back Button */}
        <Link to="/initiatives" className="inline-flex items-center gap-2 pill-outline border-slate-200 text-slate-400 hover:text-slate-900 transition-colors mb-12">
          <ArrowLeft size={14} /> Back to Initiatives
        </Link>

        {/* Hero Section */}
        <div className="grid lg:grid-cols-2 gap-24 mb-24 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="flex items-center gap-4 mb-8">
              <span className="pill-outline bg-slate-900 border-slate-900 text-white">
                {initiative.category}
              </span>
              {initiative.verified && (
                <span className="flex items-center gap-1 text-emerald-600 text-[10px] font-display font-bold uppercase tracking-widest">
                  <ShieldCheck size={14} /> Verified Initiative
                </span>
              )}
            </div>
            <h1 className="text-6xl md:text-8xl font-display font-medium leading-[0.85] tracking-tighter mb-10">
              {initiative.title}
            </h1>
            <div className="flex flex-wrap gap-12 mb-12">
              <div className="flex flex-col">
                <span className="text-4xl font-display font-light text-slate-900">{volunteerCount}</span>
                <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400 font-display">Active Volunteers</span>
              </div>
              <div className="w-px h-12 bg-slate-100" />
              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  <IndianRupee size={20} className="text-slate-900" />
                  <span className="text-4xl font-display font-light text-slate-900">{initiative.estimatedCost?.toLocaleString()}</span>
                </div>
                <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400 font-display">Target Funding</span>
              </div>
              <div className="w-px h-12 bg-slate-100" />
              <div className="flex flex-col">
                <span className="text-4xl font-display font-light text-slate-900">{supportCount}</span>
                <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400 font-display">Supporters</span>
              </div>
              <div className="w-px h-12 bg-slate-100" />
              <div className="flex flex-col">
                <span className="text-4xl font-display font-light text-slate-900">{initiative.city}</span>
                <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400 font-display">Location</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-4">
              {isJoined ? (
                <div className="bg-emerald-50 text-emerald-600 px-10 py-5 rounded-full text-xs font-display font-bold uppercase tracking-widest border border-emerald-100 flex items-center justify-center gap-2">
                  <CheckCircle size={16} /> You are a Volunteer
                </div>
              ) : (
                <button 
                  onClick={handleJoin}
                  className="bg-slate-900 text-pearl px-10 py-5 rounded-full text-xs font-display font-bold uppercase tracking-widest hover:bg-prospera-blue transition-all shadow-xl"
                >
                  Join as Volunteer
                </button>
              )}
              {isLeader && !isInitiativeCompleted && (
                <button 
                  onClick={handleComplete}
                  className="bg-prospera-blue text-pearl px-10 py-5 rounded-full text-xs font-display font-bold uppercase tracking-widest hover:bg-slate-900 transition-all shadow-xl flex items-center justify-center gap-2"
                >
                  <Activity size={16} /> Action Completed
                </button>
              )}
              <button 
                onClick={handleSupport}
                className="bg-white text-slate-900 border border-slate-100 px-10 py-5 rounded-full text-xs font-display font-bold uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm"
              >
                Support Project
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="aspect-video rounded-[3rem] overflow-hidden shadow-2xl border border-slate-100 relative group"
          >
            <img 
              src={`https://picsum.photos/seed/${initiative.id}/1200/800`} 
              alt={initiative.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent opacity-60" />
          </motion.div>
        </div>

        {/* Leader Banner */}
        {isLeader && !isInitiativeCompleted && (
          <div className="mb-12 p-8 bg-slate-900 rounded-[3rem] text-white flex items-center justify-between shadow-2xl">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-full bg-prospera-blue text-white flex items-center justify-center animate-pulse">
                <Activity size={32} />
              </div>
              <div>
                <h3 className="text-2xl font-display font-medium">Action Control</h3>
                <p className="text-white/40 font-display font-light uppercase tracking-widest text-[10px]">Leader Dashboard Active</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                to={`/initiatives/${id}/control`}
                className="bg-white/10 text-white px-8 py-5 rounded-full text-xs font-display font-bold uppercase tracking-widest hover:bg-white hover:text-slate-900 transition-all"
              >
                Mission Control
              </Link>
              <button 
                onClick={handleComplete}
                className="bg-prospera-blue text-white px-10 py-5 rounded-full text-xs font-display font-bold uppercase tracking-widest hover:bg-white hover:text-slate-900 transition-all shadow-xl"
              >
                Action Completed
              </button>
            </div>
          </div>
        )}

        {isInitiativeCompleted && (
          <div className="mb-12 p-8 bg-emerald-50 border border-emerald-100 rounded-[3rem] flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <CheckCircle size={32} />
              </div>
              <div>
                <h3 className="text-2xl font-display font-medium text-slate-900">Mission Accomplished</h3>
                <p className="text-slate-500 font-display font-light uppercase tracking-widest text-[10px]">Global Celebration Active</p>
              </div>
            </div>
            <div className="flex gap-4">
              <button 
                onClick={() => confetti()}
                className="pill-outline bg-emerald-500 border-emerald-500 text-white hover:bg-emerald-600"
              >
                Celebrate Again
              </button>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-12 border-b border-slate-100 mb-16">
          {[
            { id: 'overview', label: 'Overview', icon: Activity },
            { id: 'tasks', label: 'Task Board', icon: CheckSquare },
            { id: 'discussion', label: `Discussion (${volunteerCount})`, icon: MessageSquare },
            { id: 'support', label: 'Support & Policies', icon: ShieldCheck },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "pb-6 text-[10px] font-display font-bold uppercase tracking-[0.3em] flex items-center gap-2 transition-all relative",
                activeTab === tab.id ? "text-prospera-blue" : "text-slate-400 hover:text-slate-600"
              )}
            >
              <tab.icon size={14} />
              {tab.label}
              {activeTab === tab.id && (
                <motion.div 
                  layoutId="tab-underline" 
                  className="absolute bottom-0 left-0 w-full h-0.5 bg-prospera-blue rounded-full" 
                />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {activeTab === 'overview' && (
            <div className="grid lg:grid-cols-3 gap-16">
              <div className="lg:col-span-2 space-y-16">
                <div className="prospera-card p-12">
                  <h3 className="text-2xl font-display font-medium mb-8 text-slate-900">About this Initiative</h3>
                  <p className="text-xl text-slate-600 leading-relaxed font-display font-light">
                    {initiative.description}
                  </p>
                </div>
                
                <MissionTree initiative={initiative} volunteerCount={volunteerCount} tasks={tasks} />
                
                <div className="prospera-card p-12">
                  <div className="flex items-center justify-between mb-12">
                    <h3 className="text-2xl font-display font-medium text-slate-900">Mission Progress Photos</h3>
                    {isLeader && (
                      <div className="flex gap-4">
                        <label className="cursor-pointer bg-slate-100 px-6 py-3 rounded-full text-[10px] font-display font-bold uppercase tracking-widest hover:bg-slate-200 transition-all">
                          Upload Before
                          <input type="file" className="hidden" onChange={(e) => handlePhotoUpload('before', e)} />
                        </label>
                        <label className="cursor-pointer bg-slate-900 text-white px-6 py-3 rounded-full text-[10px] font-display font-bold uppercase tracking-widest hover:bg-prospera-blue transition-all">
                          Upload After
                          <input type="file" className="hidden" onChange={(e) => handlePhotoUpload('after', e)} />
                        </label>
                      </div>
                    )}
                  </div>
                  <div className="grid md:grid-cols-2 gap-12">
                    <div className="space-y-4">
                      <p className="text-[10px] font-display font-bold uppercase tracking-[0.3em] text-slate-400">Before Action</p>
                      <div className="aspect-video rounded-[2rem] bg-slate-50 border border-dashed border-slate-200 overflow-hidden flex items-center justify-center group">
                        {initiative.beforePhoto ? (
                          <img src={initiative.beforePhoto} alt="Before" className="w-full h-full object-cover" />
                        ) : (
                          <div className="text-center p-8">
                            <ImageIcon size={32} className="mx-auto mb-4 text-slate-300" />
                            <p className="text-xs text-slate-400 font-display font-light">No before photo uploaded yet.</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="space-y-4">
                      <p className="text-[10px] font-display font-bold uppercase tracking-[0.3em] text-slate-400">After Action</p>
                      <div className="aspect-video rounded-[2rem] bg-slate-50 border border-dashed border-slate-200 overflow-hidden flex items-center justify-center group">
                        {initiative.afterPhoto ? (
                          <img src={initiative.afterPhoto} alt="After" className="w-full h-full object-cover" />
                        ) : (
                          <div className="text-center p-8">
                            <ImageIcon size={32} className="mx-auto mb-4 text-slate-300" />
                            <p className="text-xs text-slate-400 font-display font-light">No after photo uploaded yet.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="prospera-card p-10">
                    <h4 className="text-[10px] font-display font-bold uppercase tracking-[0.3em] mb-8 text-slate-400">Supplies Needed</h4>
                    <ul className="space-y-6">
                      {initiative.suppliesNeeded?.split(',').map((item: string, i: number) => (
                        <li key={i} className="flex items-center gap-4 text-base text-slate-600 font-display">
                          <div className="w-2 h-2 bg-prospera-blue rounded-full" />
                          {item.trim()}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="prospera-card p-10">
                    <h4 className="text-[10px] font-display font-bold uppercase tracking-[0.3em] mb-8 text-slate-400">Timeline</h4>
                    <div className="space-y-8">
                      <div className="flex gap-6">
                        <div className="w-px bg-slate-100 relative">
                          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-200 rounded-full" />
                        </div>
                        <div>
                          <p className="text-sm font-display font-bold text-slate-900">Proposal Submitted</p>
                          <p className="text-xs text-slate-400 font-display">Oct 12, 2025</p>
                        </div>
                      </div>
                      <div className="flex gap-6">
                        <div className="w-px bg-slate-100 relative">
                          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-prospera-blue rounded-full animate-pulse shadow-lg shadow-prospera-blue/20" />
                        </div>
                        <div>
                          <p className="text-sm font-display font-bold text-slate-900">Mobilization Phase</p>
                          <p className="text-xs text-slate-400 font-display">In Progress</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-8">
                <div className="bg-slate-900 p-10 rounded-[3rem] text-pearl relative overflow-hidden shadow-2xl">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-prospera-blue/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                  <div className="relative z-10">
                    <h4 className="text-[10px] font-display font-bold uppercase tracking-[0.3em] mb-8 text-pearl/40">Impact Score</h4>
                    <div className="flex items-end gap-2 mb-6">
                      <span className="text-6xl font-display font-light text-pearl">850</span>
                      <span className="text-sm text-pearl/40 mb-2 uppercase tracking-widest font-display">Points</span>
                    </div>
                    <p className="text-sm text-pearl/60 leading-relaxed mb-10 font-display font-light">
                      This initiative has generated significant community value through verified actions.
                    </p>
                    <div className="h-1.5 bg-pearl/10 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        whileInView={{ width: '85%' }}
                        viewport={{ once: true }}
                        transition={{ duration: 1 }}
                        className="h-full bg-prospera-blue shadow-lg shadow-prospera-blue/20" 
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tasks' && (
            <div className="relative">
              <div className="flex items-center justify-between mb-12 px-6">
                <h3 className="text-2xl font-display font-medium text-slate-900">Task Board</h3>
                {isLeader && (
                  <button 
                    onClick={handleAISuggestions}
                    disabled={isGeneratingAI}
                    className="flex items-center gap-2 px-8 py-4 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-display font-bold uppercase tracking-widest hover:bg-indigo-100 transition-all disabled:opacity-50 shadow-sm border border-indigo-100"
                  >
                    {isGeneratingAI ? (
                      <Clock size={14} className="animate-spin" />
                    ) : (
                      <Activity size={14} />
                    )}
                    AI Suggest Tasks
                  </button>
                )}
              </div>
              {!isJoined && !isSupporter && (
                <div className="absolute inset-0 z-20 backdrop-blur-md bg-white/40 flex items-center justify-center rounded-[3rem]">
                  <div className="prospera-card p-12 text-center max-w-md shadow-2xl">
                    <div className="w-20 h-20 rounded-3xl bg-slate-900 text-white flex items-center justify-center mx-auto mb-8">
                      <Users size={32} />
                    </div>
                    <h3 className="text-2xl font-display font-medium mb-4 text-slate-900">Join the Mission</h3>
                    <p className="text-slate-500 font-display font-light mb-8">
                      The task board is exclusive to volunteers and supporters. Join the group to assign tasks and track progress in real-time.
                    </p>
                    <div className="space-y-4">
                      <button 
                        onClick={handleJoin}
                        className="bg-slate-900 text-pearl px-10 py-5 rounded-full text-xs font-display font-bold uppercase tracking-widest hover:bg-prospera-blue transition-all shadow-xl w-full"
                      >
                        Join as Volunteer
                      </button>
                      <button 
                        onClick={handleSupport}
                        className="bg-white text-slate-900 border border-slate-200 px-10 py-5 rounded-full text-xs font-display font-bold uppercase tracking-widest hover:border-prospera-blue transition-all shadow-sm w-full"
                      >
                        Support Project
                      </button>
                    </div>
                  </div>
                </div>
              )}
              <div className={cn("grid md:grid-cols-3 gap-12", (!isJoined && !isSupporter) && "opacity-20 pointer-events-none")}>
                {[
                  { id: 'todo', label: 'To-Do', color: 'bg-slate-50 border-slate-200' },
                  { id: 'in-progress', label: 'In Progress', color: 'bg-prospera-blue/5 border-prospera-blue/20' },
                  { id: 'completed', label: 'Completed', color: 'bg-emerald-50 border-emerald-200' }
                ].map(column => (
                <div key={column.id} className={cn("p-8 rounded-[3rem] border transition-all h-fit", column.color)}>
                  <div className="flex items-center justify-between mb-8 px-2">
                    <h4 className="text-[10px] font-display font-bold uppercase tracking-[0.3em] text-slate-900">
                      {column.label}
                    </h4>
                      <div className="flex items-center gap-3">
                        {(isJoined || isSupporter) && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleAddTask(column.id); }}
                            className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-prospera-blue hover:border-prospera-blue hover:scale-110 transition-all flex items-center justify-center shadow-md"
                            title={`Add to ${column.label}`}
                          >
                            <Plus size={14} />
                          </button>
                        )}
                        <span className="bg-white px-3 py-1 rounded-full text-[10px] font-display font-bold text-slate-900 border border-slate-100 shadow-sm">
                          {tasks.filter(t => t.status === column.id).length}
                        </span>
                      </div>
                  </div>
                  <div className="space-y-6">
                    {tasks.filter(t => t.status === column.id).map(task => (
                      <motion.div
                        key={task.id}
                        layoutId={`task-${task.id}`}
                        onClick={() => navigate(`/tasks/${task.id}`)}
                        className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group cursor-pointer"
                      >
                        <div className="flex justify-between items-start mb-6">
                          <h5 className="text-base font-display font-medium text-slate-900">{task.title}</h5>
                          <div className="flex gap-2">
                            {column.id !== 'todo' && (
                              <button 
                                onClick={(e) => { e.stopPropagation(); updateTaskStatus(task.id, 'todo'); }}
                                className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center hover:bg-blue-500 hover:text-white transition-all shadow-sm"
                                title="Move to To-Do"
                              >
                                <Circle size={14} />
                              </button>
                            )}
                            {column.id !== 'in-progress' && (
                              <button 
                                onClick={(e) => { e.stopPropagation(); updateTaskStatus(task.id, 'in-progress'); }}
                                className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center hover:bg-amber-500 hover:text-white transition-all shadow-sm"
                                title="Move to In Progress"
                              >
                                <Clock size={14} />
                              </button>
                            )}
                            {column.id !== 'completed' && (
                              <button 
                                onClick={(e) => { e.stopPropagation(); updateTaskStatus(task.id, 'completed'); }}
                                className="h-8 px-4 rounded-full bg-emerald-500 text-white flex items-center justify-center hover:bg-emerald-600 transition-all shadow-md text-[10px] font-display font-bold uppercase tracking-widest gap-2"
                                title="Mark as Completed"
                              >
                                <CheckCircle size={14} />
                                <span>Action Completed</span>
                              </button>
                            )}
                            {column.id === 'completed' && (
                              <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md">
                                <CheckCircle size={14} />
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-display font-bold">
                              {task.id.slice(-4)}
                            </div>
                            <span className="text-[10px] font-display font-bold uppercase tracking-widest text-slate-400 group-hover:text-prospera-blue transition-colors">View Initiation Room</span>
                          </div>
                          <div className="flex gap-2">
                            <button className="p-2 text-slate-300 hover:text-slate-600 transition-colors">
                              <ArrowRight size={14} />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                    {/* Removed old Add Task button */}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

          {activeTab === 'support' && (
            <div className="max-w-4xl mx-auto space-y-12">
              <div className="prospera-card p-12">
                <div className="flex items-center gap-6 mb-12">
                  <div className="w-20 h-20 rounded-3xl bg-slate-900 flex items-center justify-center text-white shadow-2xl">
                    <Crown size={32} />
                  </div>
                  <div>
                    <h3 className="text-3xl font-display font-medium text-slate-900">Initiative Leader</h3>
                    <p className="text-slate-500 font-display font-light">The visionary behind this movement.</p>
                  </div>
                </div>
                
                <div className="bg-slate-50 rounded-[2rem] p-8 border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-prospera-blue flex items-center justify-center text-white font-display font-bold">
                      {leaderName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-display font-bold text-slate-900">{leaderName}</p>
                      <p className="text-xs text-slate-400 font-display">Verified Leader</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => toast.info(`Connecting you with ${leaderName}...`)}
                    className="pill-outline border-slate-200 text-slate-600 hover:bg-white transition-all"
                  >
                    Contact Leader
                  </button>
                </div>
              </div>

              <div className="prospera-card p-12">
                <h3 className="text-2xl font-display font-medium mb-8 text-slate-900">Initiative Policies</h3>
                <div className="space-y-8">
                  {[
                    { title: 'Transparency First', desc: 'All funding and resource allocation is tracked and visible to all supporters.' },
                    { title: 'Community Led', desc: 'Decisions are made through consensus among active volunteers and the leader.' },
                    { title: 'Safety & Respect', desc: 'A zero-tolerance policy for harassment or discrimination in all mission activities.' },
                    { title: 'Impact Verification', desc: 'Every task completed must be verified by at least two other volunteers.' }
                  ].map((policy, i) => (
                    <div key={i} className="flex gap-6">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                        <ShieldCheck size={20} />
                      </div>
                      <div>
                        <h4 className="font-display font-bold text-slate-900 mb-1">{policy.title}</h4>
                        <p className="text-slate-500 font-display font-light text-sm leading-relaxed">{policy.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'discussion' && (
            <div className="relative">
              {!isJoined && (
                <div className="absolute inset-0 z-20 backdrop-blur-md bg-white/40 flex items-center justify-center rounded-[3rem]">
                  <div className="prospera-card p-12 text-center max-w-md shadow-2xl">
                    <div className="w-20 h-20 rounded-3xl bg-slate-900 text-white flex items-center justify-center mx-auto mb-8">
                      <MessageSquare size={32} />
                    </div>
                    <h3 className="text-2xl font-display font-medium mb-4 text-slate-900">Volunteer Chat Room</h3>
                    <p className="text-slate-500 font-display font-light mb-8">
                      Connect with {volunteerCount} other volunteers. Join the group to share updates, images, and files.
                    </p>
                    <button 
                      onClick={handleJoin}
                      className="bg-slate-900 text-pearl px-10 py-5 rounded-full text-xs font-display font-bold uppercase tracking-widest hover:bg-prospera-blue transition-all shadow-xl w-full"
                    >
                      Join as Volunteer
                    </button>
                  </div>
                </div>
              )}
              <div className={cn("max-w-4xl mx-auto h-[700px] flex flex-col bg-white rounded-[3rem] border border-slate-100 overflow-hidden shadow-2xl", !isJoined && "opacity-20 pointer-events-none")}>
                <div className="flex-1 overflow-y-auto p-12 space-y-8 custom-scrollbar">
                {messages.map((msg, i) => {
                  const msgUserObj = typeof msg.userId === 'object' ? msg.userId : null;
                  const msgUserId = msgUserObj ? (msgUserObj.id || msgUserObj._id) : msg.userId;
                  const msgAuthor = msg.fullName || msgUserObj?.fullName || 'Volunteer';
                  const isOwnMsg = Boolean(user && msgUserId && String(msgUserId) === String(user.id));
                  let timeLabel = 'just now';
                  try {
                    const d = new Date(msg.createdAt);
                    if (!Number.isNaN(d.getTime())) timeLabel = `${formatDistanceToNow(d)} ago`;
                  } catch {}

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
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-[10px] font-display font-bold text-slate-900">{msgAuthor}</span>
                      <span className="text-[10px] text-slate-400 uppercase tracking-widest font-display">{timeLabel}</span>
                    </div>
                    <div className={cn(
                      "px-8 py-5 rounded-[2rem] text-base leading-relaxed font-display",
                      isOwnMsg
                        ? "bg-slate-900 text-pearl rounded-tr-none font-light" 
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
                  <label className="w-12 h-12 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-prospera-blue hover:border-prospera-blue transition-all flex items-center justify-center cursor-pointer">
                    <ImageIcon size={20} />
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                  </label>
                  <label className="w-12 h-12 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-prospera-blue hover:border-prospera-blue transition-all flex items-center justify-center cursor-pointer">
                    <FileText size={20} />
                    <input type="file" className="hidden" onChange={handleFileUpload} />
                  </label>
                </div>
                <input 
                  type="text" 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={isUploading ? "Uploading file..." : "Share an update or ask a question..."}
                  disabled={isUploading}
                  className="flex-1 bg-white rounded-2xl px-8 py-5 text-base outline-none focus:ring-2 focus:ring-slate-200 border border-slate-200 transition-all text-slate-900 placeholder:text-slate-400 font-display disabled:opacity-50"
                />
                <button 
                  type="submit" 
                  disabled={isUploading}
                  className="w-16 h-16 bg-slate-900 text-pearl rounded-2xl flex items-center justify-center hover:bg-prospera-blue transition-all shadow-xl disabled:opacity-50"
                >
                  <Send size={24} />
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Add Task Modal */}
      <AnimatePresence>
        {taskModalStatus && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setTaskModalStatus(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[3rem] shadow-2xl p-10"
            >
              <div className="flex justify-between items-center mb-8">
                <div>
                  <span className="text-[10px] uppercase tracking-widest font-bold text-prospera-blue font-display">New Mission Task</span>
                  <h3 className="text-2xl font-display font-medium text-slate-900 mt-1">Add to {taskModalStatus.replace('-', ' ')}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setTaskModalStatus(null)}
                  className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all"
                >
                  <Plus className="rotate-45" size={20} />
                </button>
              </div>
              <form onSubmit={handleSubmitNewTask} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400 font-display">Task Title</label>
                  <input
                    type="text"
                    required
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="e.g., Coordinate waste collection bags"
                    className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:border-prospera-blue outline-none font-display text-slate-900"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400 font-display">Description</label>
                  <textarea
                    rows={3}
                    value={newTaskDescription}
                    onChange={(e) => setNewTaskDescription(e.target.value)}
                    placeholder="Add clear execution details for volunteers..."
                    className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:border-prospera-blue outline-none font-display text-slate-900 resize-none"
                  />
                </div>
                <div className="flex gap-4 pt-2">
                  <button
                    type="button"
                    onClick={() => setTaskModalStatus(null)}
                    className="flex-1 py-4 rounded-full border border-slate-200 text-slate-500 text-xs font-display font-bold uppercase tracking-widest hover:bg-slate-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-4 rounded-full bg-slate-900 text-white text-xs font-display font-bold uppercase tracking-widest hover:bg-prospera-blue transition-all shadow-lg"
                  >
                    Create Task
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Task Detail Modal */}
      <AnimatePresence>
        {selectedTask && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTask(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl overflow-hidden"
            >
              <div className="p-12">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <span className={cn(
                      "pill-outline mb-4 inline-block",
                      selectedTask.status === 'completed' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                      selectedTask.status === 'in-progress' ? "bg-amber-50 text-amber-600 border-amber-100" :
                      "bg-slate-50 text-slate-600 border-slate-100"
                    )}>
                      {selectedTask.status.replace('-', ' ')}
                    </span>
                    <h3 className="text-3xl font-display font-medium text-slate-900">{selectedTask.title}</h3>
                  </div>
                  <button 
                    onClick={() => setSelectedTask(null)}
                    className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all"
                  >
                    <Plus className="rotate-45" size={24} />
                  </button>
                </div>

                <div className="space-y-8 mb-12">
                  <div className="flex items-start gap-6">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
                      <Users size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-1">Assigned To</p>
                      <p className="font-display font-medium text-slate-900">
                        {selectedTask.assignedTo
                          ? (typeof selectedTask.assignedTo === 'object' ? selectedTask.assignedTo.fullName : `Volunteer #${selectedTask.assignedTo}`)
                          : 'Unassigned'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-6">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
                      <Clock size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-1">Created</p>
                      <p className="font-display font-medium text-slate-900">
                        {selectedTask.createdAt ? `${formatDistanceToNow(new Date(selectedTask.createdAt))} ago` : 'Recently'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  {['todo', 'in-progress', 'completed'].map(status => (
                    <button
                      key={status}
                      onClick={() => {
                        updateTaskStatus(selectedTask.id, status);
                        setSelectedTask(null);
                      }}
                      className={cn(
                        "flex-1 py-4 rounded-2xl text-[10px] font-display font-bold uppercase tracking-widest transition-all border",
                        selectedTask.status === status 
                          ? "bg-slate-900 text-white border-slate-900" 
                          : "bg-white text-slate-400 border-slate-100 hover:border-slate-200"
                      )}
                    >
                      {status.replace('-', ' ')}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  </div>
);
};

export default InitiativeDetail;
