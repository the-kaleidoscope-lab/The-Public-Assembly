import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  ShieldCheck, ArrowLeft, Users, CheckSquare, 
  Megaphone, Activity, Plus, Send, CheckCircle, Clock, AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../lib/utils';

const MissionControl = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [initiative, setInitiative] = useState<any>(null);
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [announcement, setAnnouncement] = useState('');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/initiatives/${id}`);
        if (!res.ok) {
          toast.error('Initiative not found');
          navigate('/initiatives');
          return;
        }
        const data = await res.json();
        const creatorId = typeof data.createdBy === 'object'
          ? (data.createdBy?.id || data.createdBy?._id)
          : data.createdBy;

        if (!user || String(creatorId) !== String(user.id)) {
          navigate(`/initiatives/${id}`);
          return;
        }

        setInitiative(data);
        setVolunteers(Array.isArray(data.volunteers) ? data.volunteers : []);

        const tasksRes = await fetch(`/api/initiatives/${id}/tasks`);
        const tasksData = tasksRes.ok ? await tasksRes.json() : [];
        setTasks(Array.isArray(tasksData) ? tasksData : []);
      } catch (error) {
        console.error('Error fetching mission data:', error);
        toast.error('Failed to load mission control data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, user, authLoading, navigate]);

  const handlePostAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcement.trim()) return;

    try {
      const res = await fetch(`/api/initiatives/${id}/announcements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id, text: announcement })
      });

      if (res.ok) {
        setAnnouncement('');
        toast.success('Announcement broadcasted to all volunteers');
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to broadcast announcement');
      }
    } catch {
      toast.error('Network error while broadcasting');
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initiativeId: id, title: newTaskTitle, description: newTaskDescription })
      });

      if (res.ok) {
        const task = await res.json();
        setTasks(prev => [...prev, task]);
        setNewTaskTitle('');
        setNewTaskDescription('');
        toast.success('Mission task created');
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to create task');
      }
    } catch {
      toast.error('Network error while creating task');
    }
  };

  const handleAssignTask = async (taskId: string, userId: string) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });

      if (res.ok) {
        const updatedTask = await res.json();
        setTasks(prev => prev.map(t => (t.id || t._id) === taskId ? updatedTask : t));
        toast.success('Task assignment updated');
      } else {
        toast.error('Failed to assign task');
      }
    } catch {
      toast.error('Network error while assigning task');
    }
  };

  const handleUpdateStatus = async (status: string) => {
    const endpoint = status === 'Completed' ? `/api/initiatives/${id}/complete` : `/api/initiatives/${id}/status`;
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, userId: user?.id })
      });

      if (res.ok) {
        const updated = await res.json();
        setInitiative((prev: any) => ({ ...prev, ...updated }));
        if (status === 'Completed') {
          toast.success("Mission completed! Certificates have been issued and emailed.");
        } else {
          toast.success(`Status updated to ${status}`);
        }
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to update status");
      }
    } catch {
      toast.error('Failed to update status');
    }
  };

  if (loading || authLoading || !initiative) return (
    <div className="min-h-screen flex items-center justify-center bg-pearl">
      <div className="w-12 h-12 border-4 border-prospera-blue border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const isCompleted = initiative.status?.toUpperCase() === 'COMPLETED';

  return (
    <div className="min-h-screen bg-pearl pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <Link to={`/initiatives/${id}`} className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] font-bold text-slate-400 hover:text-slate-900 transition-colors mb-12 font-display">
          <ArrowLeft size={14} /> Back to Mission
        </Link>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <ShieldCheck className="text-prospera-blue" size={24} />
              <span className="prospera-pill border-slate-200">Mission Control Center</span>
            </div>
            <h1 className="text-6xl md:text-7xl font-display font-medium tracking-tighter text-slate-900">
              Command: <span className="italic text-slate-400">{initiative.title}</span>
            </h1>
          </motion.div>
          <div className="flex gap-4">
            <button 
              onClick={() => handleUpdateStatus('In Progress')}
              className={cn(
                "px-8 py-4 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all font-display",
                initiative.status === 'In Progress' ? "bg-prospera-blue border-prospera-blue text-white shadow-lg shadow-prospera-blue/20" : "bg-white border-slate-200 text-slate-400 hover:border-slate-900 hover:text-slate-900"
              )}
            >
              Set In Progress
            </button>
            <button 
              onClick={() => handleUpdateStatus('Completed')}
              disabled={isCompleted}
              className={cn(
                "px-8 py-4 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all font-display",
                isCompleted ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "bg-white border-slate-200 text-slate-400 hover:border-emerald-500 hover:text-emerald-500"
              )}
            >
              {isCompleted ? 'Completed' : 'Mark Completed'}
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Left Column: Announcements & Volunteers */}
          <div className="lg:col-span-1 space-y-12">
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="prospera-card p-10 bg-white"
            >
              <h3 className="text-xl font-display font-medium mb-8 flex items-center gap-3 text-slate-900">
                <Megaphone className="text-prospera-blue" size={20} />
                Global Announcement
              </h3>
              <form onSubmit={handlePostAnnouncement} className="space-y-4">
                <textarea 
                  value={announcement}
                  onChange={(e) => setAnnouncement(e.target.value)}
                  placeholder="Broadcast a message to all volunteers..."
                  rows={4}
                  className="w-full bg-slate-50 border border-slate-100 rounded-[2rem] p-6 text-sm outline-none focus:border-prospera-blue/20 focus:bg-white transition-all resize-none font-display"
                />
                <button type="submit" className="w-full bg-slate-900 text-white py-5 rounded-full font-bold uppercase tracking-widest text-[10px] hover:bg-prospera-blue transition-all flex items-center justify-center gap-2 font-display shadow-xl">
                  <Send size={14} /> Broadcast Message
                </button>
              </form>
            </motion.section>

            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="prospera-card p-10 bg-white"
            >
              <h3 className="text-xl font-display font-medium mb-8 flex items-center gap-3 text-slate-900">
                <Users className="text-prospera-blue" size={20} />
                Volunteer Roster
              </h3>
              <div className="space-y-6 max-h-[400px] overflow-y-auto custom-scrollbar pr-4">
                {volunteers.map((v, idx) => {
                  const vUser = typeof v.userId === 'object' ? v.userId : null;
                  const vId = vUser?.id || vUser?._id || v.userId || idx;
                  const vName = vUser?.fullName || v.fullName || 'Volunteer';
                  return (
                    <div key={vId} className="flex items-center justify-between p-5 rounded-[2rem] bg-slate-50 border border-transparent hover:border-slate-200 transition-all group">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-slate-900 font-bold text-xs shadow-sm border border-slate-100">
                          {vName.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-display font-bold text-slate-900">{vName}</p>
                          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-display">Active Volunteer</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                      </div>
                    </div>
                  );
                })}
                {volunteers.length === 0 && (
                  <p className="text-sm text-slate-400 text-center py-8 font-display">No volunteers yet. Mobilize the community!</p>
                )}
              </div>
            </motion.section>
          </div>

          {/* Right Column: Task Management */}
          <div className="lg:col-span-2 space-y-12">
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="prospera-card p-12 bg-white"
            >
              <div className="flex items-center justify-between mb-12">
                <h3 className="text-2xl font-display font-medium flex items-center gap-3 text-slate-900">
                  <CheckSquare className="text-prospera-blue" size={24} />
                  Task Orchestration
                </h3>
                <span className="prospera-pill border-slate-200">
                  {tasks.length} Total Tasks
                </span>
              </div>

              <form onSubmit={handleCreateTask} className="space-y-4 mb-12">
                <input 
                  type="text" 
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="Task title..."
                  className="w-full bg-slate-50 border border-slate-100 rounded-full px-8 py-5 text-sm outline-none focus:border-prospera-blue/20 focus:bg-white transition-all font-display"
                />
                <textarea 
                  value={newTaskDescription}
                  onChange={(e) => setNewTaskDescription(e.target.value)}
                  placeholder="Task description..."
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-100 rounded-[2rem] p-6 text-sm outline-none focus:border-prospera-blue/20 focus:bg-white transition-all resize-none font-display"
                />
                <button type="submit" className="w-full bg-slate-900 text-white py-5 rounded-full font-bold uppercase tracking-widest text-[10px] hover:bg-prospera-blue transition-all shadow-xl flex items-center justify-center gap-2 font-display">
                  <Plus size={18} /> Create Mission Task
                </button>
              </form>

              <div className="space-y-6">
                {tasks.map(task => {
                  const taskId = task.id || task._id;
                  const assignedObj = typeof task.assignedTo === 'object' ? task.assignedTo : null;
                  const assignedId = assignedObj ? (assignedObj.id || assignedObj._id) : (task.assignedTo || '');
                  const matchedVol = volunteers.find(v => {
                    const vUser = typeof v.userId === 'object' ? v.userId : null;
                    const vId = vUser?.id || vUser?._id || v.userId;
                    return vId && String(vId) === String(assignedId);
                  });
                  const assignedName = assignedObj?.fullName || (typeof matchedVol?.userId === 'object' ? matchedVol.userId?.fullName : matchedVol?.fullName) || 'Member';

                  return (
                  <div key={taskId} className="p-8 rounded-[3rem] bg-slate-50 border border-transparent hover:border-slate-200 transition-all group cursor-pointer" onClick={() => navigate(`/tasks/${taskId}`)}>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex items-start gap-6">
                        <div className={cn(
                          "w-14 h-14 rounded-[1.5rem] flex items-center justify-center shrink-0 shadow-sm",
                          task.status === 'completed' ? "bg-emerald-500 text-white" : "bg-white text-slate-300 border border-slate-100"
                        )}>
                          {task.status === 'completed' ? <CheckCircle size={24} /> : <Clock size={24} />}
                        </div>
                        <div>
                          <h4 className="text-xl font-display font-medium mb-2 text-slate-900">{task.title}</h4>
                          <div className="flex items-center gap-4">
                            <span className={cn(
                              "text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full font-display",
                              task.status === 'completed' ? "bg-emerald-100 text-emerald-600" : "bg-prospera-blue/10 text-prospera-blue"
                            )}>
                              {task.status}
                            </span>
                            {assignedId ? (
                              <span className="text-[10px] text-slate-400 uppercase tracking-widest flex items-center gap-2 font-display">
                                <Users size={12} /> Assigned to {assignedName}
                              </span>
                            ) : (
                              <span className="text-[10px] text-rose-500 uppercase tracking-widest flex items-center gap-2 font-display">
                                <AlertCircle size={12} /> Unassigned
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4" onClick={(e) => e.stopPropagation()}>
                        <select 
                          className="bg-white border border-slate-200 rounded-full px-6 py-3 text-[10px] font-bold uppercase tracking-widest outline-none focus:border-prospera-blue/20 font-display text-slate-900 shadow-sm"
                          value={assignedId || ''}
                          onChange={(e) => handleAssignTask(taskId, e.target.value)}
                        >
                          <option value="">Assign Volunteer</option>
                          {volunteers.map((v, idx) => {
                            const vUser = typeof v.userId === 'object' ? v.userId : null;
                            const vId = vUser?.id || vUser?._id || v.userId;
                            const vName = vUser?.fullName || v.fullName || 'Volunteer';
                            return <option key={vId || idx} value={vId}>{vName}</option>;
                          })}
                        </select>
                      </div>
                    </div>
                  </div>
                  );
                })}
                {tasks.length === 0 && (
                  <div className="text-center py-24 border-2 border-dashed border-slate-100 rounded-[4rem]">
                    <Activity className="mx-auto text-slate-200 mb-6" size={48} />
                    <p className="text-slate-400 font-display font-light">No tasks defined for this mission yet.</p>
                  </div>
                )}
              </div>
            </motion.section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MissionControl;
