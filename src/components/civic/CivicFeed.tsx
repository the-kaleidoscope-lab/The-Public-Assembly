import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useSocket } from '../../context/SocketContext';
import { Activity, MapPin, User, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '../../lib/utils';

interface FeedItem {
  id?: string | number;
  _id?: string;
  type: string;
  message: string;
  initiativeId?: string | number;
  userId?: string | number;
  createdAt: string;
}

const formatRelative = (val?: string) => {
  if (!val) return 'Just now';
  const d = new Date(val);
  if (Number.isNaN(d.getTime())) return 'Recently';
  return `${formatDistanceToNow(d)} ago`;
};

const CivicFeed: React.FC = () => {
  const { socket } = useSocket();
  const [feed, setFeed] = useState<FeedItem[]>([]);

  useEffect(() => {
    fetch('/api/feed')
      .then(res => res.json())
      .then(data => setFeed(Array.isArray(data) ? data : []))
      .catch(() => setFeed([]));

    if (socket) {
      socket.emit('join:feed');
      socket.on('feed:update', (newItem: FeedItem) => {
        const newId = newItem?.id || newItem?._id;
        setFeed(prev => {
          if (newId && prev.some(p => (p.id || p._id) === newId)) return prev;
          return [newItem, ...prev].slice(0, 50);
        });
      });
    }

    return () => {
      if (socket) socket.off('feed:update');
    };
  }, [socket]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xl font-serif dark:text-pearl">Live <span className="italic">Civic Feed</span></h3>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-[10px] uppercase tracking-widest font-bold opacity-40 dark:text-pearl/40">Real-time updates</span>
        </div>
      </div>

      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-4 custom-scrollbar">
        <AnimatePresence initial={false}>
          {feed.map((item, idx) => (
            <motion.div
              key={item.id || item._id || idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="p-6 rounded-2xl bg-white dark:bg-white/5 border border-indigo-500/5 dark:border-white/5 hover:border-indigo-400/30 transition-all group"
            >
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-pearl dark:bg-white/5 flex items-center justify-center text-indigo-900 dark:text-pearl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <Activity size={18} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium dark:text-pearl/90 leading-tight mb-2">
                    {item.message}
                  </p>
                  <div className="flex items-center gap-4 text-[10px] uppercase tracking-widest font-bold opacity-40 dark:text-pearl/40">
                    <span className="flex items-center gap-1">
                      <Clock size={10} /> {formatRelative(item.createdAt)}
                    </span>
                    {item.initiativeId && (
                      <span className="flex items-center gap-1">
                        <MapPin size={10} /> Initiative #{item.initiativeId}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CivicFeed;
