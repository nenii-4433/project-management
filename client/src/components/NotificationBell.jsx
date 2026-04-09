import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { Bell, Check, Info, AlertTriangle, FileText, CheckCircle, CheckSquare, RefreshCcw, Star } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { io } from 'socket.io-client';

const NotificationBell = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!token || !user) return;

    const fetchCount = async () => {
      try {
        const { data } = await axios.get('/api/notifications/unread-count', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUnreadCount(data);
      } catch (err) {
        console.error('Failed to fetch unread count');
      }
    };

    fetchCount();
    const interval = setInterval(fetchCount, 30000); // Polling every 30s

    // Real-time socket updates
    const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000');
    newSocket.emit('join_room', user._id || user.userId);
    
    newSocket.on('new_notification', (data) => {
      setUnreadCount(prev => prev + 1);
      // Immediately inject to state if dropdown is open
      if (isOpen) {
        setNotifications(prev => [data, ...prev].slice(0, 20));
      }
    });

    newSocket.on('new_meeting', (data) => {
      setUnreadCount(prev => prev + 1);
    });

    return () => {
      clearInterval(interval);
      newSocket.disconnect();
    };
  }, [token, user, isOpen]);

  // Handle clicking outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown = async () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setLoading(true);
      try {
        const { data } = await axios.get('/api/notifications', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setNotifications(data);
      } catch (error) {
         console.error('Failed to load notifications');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleMarkAsRead = async (id, targetUrl) => {
    try {
      await axios.patch(`/api/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUnreadCount(prev => Math.max(0, prev - 1));
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      
      if (targetUrl) navigate(targetUrl);
      setIsOpen(false);
    } catch (err) {
      console.error('Error marking as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await axios.patch('/api/notifications/read-all', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Error marking all as read');
    }
  };

  const getNotificationIcon = (type) => {
    switch(type) {
      case 'task_assigned': return <CheckSquare className="text-blue-500" size={16} />;
      case 'task_update': return <RefreshCcw className="text-orange-500" size={16} />;
      case 'report_submitted': return <FileText className="text-emerald-500" size={16} />;
      case 'rating_received': return <Star className="text-yellow-500" size={16} />;
      default: return <Info className="text-purple-500" size={16} />;
    }
  };

  const getTargetUrl = (type) => {
     switch(type) {
        case 'task_assigned': return (user.role === 'employee' ? '/employee/pending' : '/hr/tasks');
        case 'task_update': return (user.role === 'employee' ? '/employee/pending' : '/hr/tasks');
        case 'report_submitted': return '/hr/reports';
        case 'rating_received': return '/employee/profile';
        default: return null;
     }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={toggleDropdown}
        className="w-10 h-10 rounded-2xl flex items-center justify-center bg-[#16161a] border border-[#2d2d34] text-gray-400 hover:text-white hover:bg-[#2d2d34] transition-all relative"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-[#111114]">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute left-0 top-full mt-4 w-[380px] bg-[#111114] border border-[#2d2d34] rounded-[32px] shadow-2xl overflow-hidden z-[999] glass"
          >
            <div className="p-4 border-b border-[#2d2d34] flex justify-between items-center bg-[#16161a]">
              <h3 className="font-bold text-white">Notifications</h3>
              {unreadCount > 0 && (
                <button 
                  onClick={handleMarkAllAsRead}
                  className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
                >
                  <Check size={14} /> Mark all read
                </button>
              )}
            </div>

            <div className="max-h-[400px] overflow-y-auto scrollbar-hide flex flex-col">
              {loading ? (
                 <div className="p-8 text-center text-gray-500 text-xs uppercase font-bold tracking-widest animate-pulse">Loading Logs...</div>
              ) : notifications.length === 0 ? (
                 <div className="p-8 text-center text-gray-500 text-sm">You are all caught up! No notifications yet.</div>
              ) : (
                notifications.map((notif) => (
                  <button 
                    key={notif._id}
                    onClick={() => handleMarkAsRead(notif._id, getTargetUrl(notif.type))}
                    className={`text-left p-4 flex gap-4 transition-all w-full border-b border-[#2d2d34]/50 last:border-0 ${
                      !notif.isRead ? 'bg-blue-600/5 hover:bg-blue-600/10' : 'hover:bg-white/[0.02]'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-[#1e1e24] border border-[#2d2d34] shrink-0 flex items-center justify-center">
                      <AlertTriangle className={notif.isRead ? "text-gray-500" : "text-blue-500"} size={14} />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <span className={`text-sm font-bold ${!notif.isRead ? 'text-white' : 'text-gray-400'}`}>
                          {notif.title}
                        </span>
                        {!notif.isRead && <div className="w-2 h-2 rounded-full bg-blue-500 mt-1 shrink-0" />}
                      </div>
                      <p className={`text-xs ${!notif.isRead ? 'text-gray-300 font-medium' : 'text-gray-500'} line-clamp-2`}>
                        {notif.body}
                      </p>
                      {notif.senderId && (
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-2 flex items-center gap-1">
                           From: {notif.senderId.name}
                        </p>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
