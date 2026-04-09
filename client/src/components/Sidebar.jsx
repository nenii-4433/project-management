import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import axios from 'axios';
import { Layout, Users, FileText, Settings, LogOut, Briefcase, Clock, ClipboardCheck, Award, MessageSquare, User, Video } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import NotificationBell from './NotificationBell';

const Sidebar = ({ role }) => {
  const { token, logout, socket, user } = useAuth();
  const [pendingCount, setPendingCount] = React.useState(0);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [toasts, setToasts] = React.useState([]);

  // ... (fetch hooks below)

  React.useEffect(() => {
    const fetchPendingCount = async () => {
      if (role === 'employee' && token) {
        try {
          const { data } = await axios.get('/api/tasks/pending', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setPendingCount(data.length);
        } catch (err) {
          console.error(err);
        }
      }
    };
    fetchPendingCount();
  }, [role, token]);

  React.useEffect(() => {
    const fetchUnreadCount = async () => {
      if (token) {
        try {
          const { data } = await axios.get('/api/messages/unread', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUnreadCount(data.unreadCount);
        } catch (err) {
          console.error(err);
        }
      }
    };
    fetchUnreadCount();

    const handleMessagesRead = () => {
      fetchUnreadCount();
    };

    window.addEventListener('messages_read', handleMessagesRead);
    return () => window.removeEventListener('messages_read', handleMessagesRead);
  }, [token]);

  React.useEffect(() => {
    if (socket && user) {
      const handleNewMessage = (payload) => {
        const msg = payload.message ? payload.message : payload;
        
        if (msg.senderId?._id !== user._id && msg.senderId !== user._id) {
          setUnreadCount(prev => prev + 1);
          
          // Trigger Toast Notification
          const newToast = {
            id: Date.now(),
            type: 'message',
            sender: msg.senderId?.name || 'Someone',
            body: msg.body
          };
          setToasts(prev => [...prev, newToast]);
          
          // Auto-remove toast after 5 seconds
          setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== newToast.id));
          }, 5000);
        }
      };

      const handleNewMeeting = (data) => {
        const newToast = {
          id: Date.now(),
          type: 'meeting',
          sender: data.hostName,
          body: `Started a meeting: ${data.title}`,
          roomId: data.roomId
        };
        setToasts(prev => [...prev, newToast]);
        
        // Auto-remove meeting toast after 10 seconds
        setTimeout(() => {
          setToasts(prev => prev.filter(t => t.id !== newToast.id));
        }, 10000);
      };
      
      socket.on('message_received', handleNewMessage);
      socket.on('new_message', handleNewMessage);
      socket.on('new_meeting', handleNewMeeting);
      return () => {
        socket.off('message_received', handleNewMessage);
        socket.off('new_message', handleNewMessage);
        socket.off('new_meeting', handleNewMeeting);
      };
    }
  }, [socket, user]);

  const hrLinks = [
    { to: '/hr/dashboard', icon: Layout, label: 'Dashboard' },
    { to: '/hr/departments', icon: Briefcase, label: 'Departments' },
    { to: '/hr/employees', icon: Users, label: 'Employees' },
    { to: '/hr/tasks', icon: FileText, label: 'Tasks' },
    { to: '/hr/reports', icon: ClipboardCheck, label: 'Reports' },
    { to: '/hr/ratings', icon: Award, label: 'Ratings' },
    { to: '/hr/messages', icon: MessageSquare, label: 'Messages' },
    { to: '/hr/meetings', icon: Video, label: 'Video Calls' },
    { to: '/hr/settings', icon: Settings, label: 'Settings' },
  ];

  const employeeLinks = [
    { to: '/employee/dashboard', icon: Layout, label: 'Dashboard' },
    { to: '/employee/tasks', icon: FileText, label: 'Active Tasks' },
    { to: '/employee/pending', icon: Clock, label: 'Pending' },
    { to: '/employee/submit-report', icon: ClipboardCheck, label: 'Submit Report' },
    { to: '/employee/profile', icon: User, label: 'Profile' },
    { to: '/employee/messages', icon: MessageSquare, label: 'Messages' },
    { to: '/employee/meetings', icon: Video, label: 'Video Calls' },
    { to: '/employee/settings', icon: Settings, label: 'Settings' },
  ];

  const links = role === 'hr' ? hrLinks : employeeLinks;

  return (
    <aside className="w-64 border-r border-[#2d2d34] p-6 glass flex flex-col h-screen sticky top-0 z-50">
      <div className="flex items-center justify-between mb-10 px-2 w-full">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg ${role === 'hr' ? 'bg-blue-600' : 'bg-emerald-600'}`} />
          <h2 className="font-bold text-xl tracking-tight text-white">NexFlow</h2>
        </div>
        <NotificationBell />
      </div>

      <nav className="flex-1 space-y-2">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center gap-3 w-full p-3 rounded-xl transition-all ${
                isActive
                  ? role === 'hr'
                    ? 'bg-blue-600/10 text-blue-400 font-medium border border-blue-500/20'
                    : 'bg-emerald-600/10 text-emerald-400 font-medium border border-emerald-500/20'
                  : 'text-gray-400 hover:bg-[#1e1e24] hover:text-gray-200'
              }`
            }
          >
            <link.icon className="w-5 h-5" /> 
            <span className="flex-1">{link.label}</span>
            {link.label === 'Pending' && pendingCount > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse shadow-lg shadow-red-500/20">
                {pendingCount}
              </span>
            )}
            {link.label === 'Messages' && unreadCount > 0 && (
              <span className="w-2.5 h-2.5 bg-red-500 rounded-full shadow-lg shadow-red-500/50 animate-pulse" />
            )}
          </NavLink>
        ))}
      </nav>

      <button
        onClick={logout}
        className="flex items-center gap-3 w-full p-3 rounded-xl text-red-400 hover:bg-red-400/10 transition-all mt-auto"
      >
        <LogOut className="w-5 h-5" /> Logout
      </button>

      {/* Global Toast Notifications */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
              className="bg-[#1e1e24]/90 backdrop-blur-xl border border-white/5 p-4 rounded-2xl shadow-2xl flex items-start gap-4 max-w-xs pointer-events-auto"
            >
              {toast.type === 'meeting' ? (
                <>
                  <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/20 text-purple-500 flex items-center justify-center shrink-0">
                    <Video size={20} />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <h4 className="text-white text-sm font-bold truncate leading-tight">Video Call: {toast.sender}</h4>
                    <p className="text-gray-400 text-xs truncate mt-1 leading-snug">{toast.body}</p>
                    <NavLink 
                      to={role === 'hr' ? '/hr/meetings' : '/employee/meetings'}
                      className="inline-block mt-3 px-4 py-1.5 bg-purple-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-purple-500 transition-all"
                    >
                      Join Session
                    </NavLink>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/20 text-blue-500 flex items-center justify-center shrink-0">
                    <MessageSquare size={20} />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <h4 className="text-white text-sm font-bold truncate leading-tight">Incoming: {toast.sender}</h4>
                    <p className="text-gray-400 text-xs truncate mt-1 leading-snug">{toast.body}</p>
                  </div>
                </>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </aside>
  );
};

export default Sidebar;
