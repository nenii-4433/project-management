import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/useAuth';
import Sidebar from '../components/Sidebar';
import { 
  Search, 
  Send, 
  User, 
  Hash, 
  Plus, 
  MoreVertical,
  ArrowLeft,
  Loader2,
  CheckCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Messages = () => {
  const { user, token, socket } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(true);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  
  const scrollRef = useRef();

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const { data } = await axios.get('/api/messages/conversations', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setConversations(data);
      } catch (err) {
        console.error('Error fetching conversations');
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchConversations();
  }, [token]);

  useEffect(() => {
    if (selectedConv) {
      const fetchMessages = async () => {
        try {
          const { data } = await axios.get(`/api/messages/${selectedConv._id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setMessages(data);
          socket?.emit('join_conversation', selectedConv._id);
          
          // Mark messages as read
          await axios.put(`/api/messages/${selectedConv._id}/read`, {}, {
            headers: { Authorization: `Bearer ${token}` }
          });
          window.dispatchEvent(new Event('messages_read'));
          setConversations(prev => prev.map(c => 
            c._id === selectedConv._id ? { ...c, unreadCount: 0 } : c
          ));
        } catch (err) {
          console.error('Error fetching messages', err);
        }
      };
      fetchMessages();
    }
  }, [selectedConv, token, socket]);

  useEffect(() => {
    if (socket) {
      const handleNewMessage = async (msg) => {
        if (msg.conversationId === selectedConv?._id) {
          setMessages(prev => [...prev, msg]);
          try {
            await axios.put(`/api/messages/${selectedConv._id}/read`, {}, {
              headers: { Authorization: `Bearer ${token}` }
            });
            window.dispatchEvent(new Event('messages_read'));
          } catch (err) {
            console.error('Error marking new message as read', err);
          }
        }
        // Update conversation snippets in sidebar
        setConversations(prev => prev.map(c => {
          if (c._id === msg.conversationId) {
            const isMe = msg.senderId?._id === user?._id || msg.senderId === user?._id;
            return { 
              ...c, 
              latestMessage: msg,
              unreadCount: isMe ? (c.unreadCount || 0) : ((selectedConv?._id === c._id) ? 0 : (c.unreadCount || 0) + 1)
            };
          }
          return c;
        }));
      };

      socket.on('new_message', handleNewMessage);
      return () => socket.off('new_message', handleNewMessage);
    }
  }, [socket, selectedConv, token, user]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!body.trim()) return;

    try {
      const { data } = await axios.post('/api/messages', {
        conversationId: selectedConv._id,
        body
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBody('');
      // Message is appended via socket listener
    } catch (err) {
      console.error('Send failed');
    }
  };

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.length > 2) {
      try {
        const { data } = await axios.get(`/api/users/employees?search=${query}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSearchResults(data);
      } catch (err) {
        console.error('Search error');
      }
    } else {
      setSearchResults([]);
    }
  };

  const startNewConversation = async (recipientId) => {
    try {
      const { data } = await axios.post('/api/messages', {
        recipientId,
        body: 'Started a new conversation'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedConv(data.conversationId);
      setShowSearch(false);
      // Re-fetch conversations
      const convRes = await axios.get('/api/messages/conversations', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConversations(convRes.data);
    } catch (err) {
      console.error('Error starting conversation');
    }
  };

  const getConvName = (conv) => {
    if (conv.type === 'department') return `${conv.departmentId?.name} (Dept)`;
    return conv.otherParticipants?.[0]?.userId?.name || 'Private Chat';
  };

  const getConvDept = (conv) => {
    if (conv.type === 'department') return '';
    return conv.otherParticipants?.[0]?.userId?.departmentName || '';
  };

  return (
    <div className="flex h-screen bg-[#0a0a0c] overflow-hidden">
      <Sidebar role={user?.role} />

      <main className="flex-1 flex overflow-hidden">
        {/* Chat Sidebar */}
        <aside className={`w-full lg:w-[400px] border-r border-[#2d2d34] flex flex-col bg-[#111114] ${selectedConv ? 'hidden lg:flex' : 'flex'}`}>
          <div className="p-6 border-b border-[#2d2d34]">
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-white tracking-tight italic">Messages</h2>
                <button 
                  onClick={() => setShowSearch(true)}
                  className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-500 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all shadow-lg active:scale-95"
                >
                   <Plus size={20} />
                </button>
             </div>
             <div className="relative">
                <input 
                  type="text" 
                  placeholder="Seach conversations..."
                  className="w-full bg-[#16161a] border border-[#2d2d34] rounded-2xl pl-12 pr-5 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
             </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
             {loading ? (
               <div className="flex flex-col items-center justify-center py-20 text-gray-600">
                  <Loader2 className="animate-spin mb-2" size={24} />
                  <span className="text-xs font-bold uppercase tracking-widest">Encrypting Socket...</span>
               </div>
             ) : (
               conversations.map(conv => (
                 <button
                   key={conv._id}
                   onClick={() => setSelectedConv(conv)}
                   className={`w-full p-4 rounded-3xl flex items-center gap-4 transition-all group ${
                     selectedConv?._id === conv._id ? 'bg-blue-600 shadow-xl shadow-blue-600/20' : 'hover:bg-white/[0.03]'
                   }`}
                 >
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center overflow-hidden border ${
                      selectedConv?._id === conv._id ? 'bg-white/20 border-white/20' : 'bg-black/20 border-white/5'
                    }`}>
                       {conv.type === 'department' ? <Hash size={24} className="text-white/40" /> : <User size={24} className="text-white/40" />}
                    </div>
                    <div className="flex-1 text-left">
                       <div className="flex justify-between items-center mb-1">
                          <span className={`text-sm font-bold ${selectedConv?._id === conv._id ? 'text-white' : 'text-gray-200'} flex items-center gap-2`}>
                             {getConvName(conv)}
                             {getConvDept(conv) && (
                                <span className="text-[9px] font-bold bg-white/5 border border-white/10 px-1.5 py-0.5 rounded-md text-gray-400 uppercase tracking-wider">
                                  {getConvDept(conv)}
                                </span>
                             )}
                          </span>
                          <div className="flex items-center gap-2">
                            {conv.unreadCount > 0 && selectedConv?._id !== conv._id && (
                               <div className="h-2.5 w-2.5 bg-red-500 rounded-full shadow-lg shadow-red-500/50 animate-pulse" />
                            )}
                            <span className={`text-[10px] font-bold ${selectedConv?._id === conv._id ? 'text-blue-100' : 'text-gray-600'}`}>
                               {conv.latestMessage ? new Date(conv.latestMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                            </span>
                          </div>
                       </div>
                       <p className={`text-xs line-clamp-1 font-medium ${selectedConv?._id === conv._id ? 'text-blue-100' : 'text-gray-500'}`}>
                          {conv.latestMessage?.body || 'No messages yet...'}
                       </p>
                    </div>
                 </button>
               ))
             )}
          </div>
        </aside>

        {/* Chat Main Window */}
        <section className={`flex-1 flex flex-col bg-[#0a0a0c] ${!selectedConv ? 'hidden lg:flex' : 'flex'}`}>
           {selectedConv ? (
             <>
               <header className="p-6 border-b border-[#2d2d34] flex justify-between items-center bg-[#111114]/50 backdrop-blur-xl">
                  <div className="flex items-center gap-4">
                     <button onClick={() => setSelectedConv(null)} className="lg:hidden p-2 text-gray-500">
                        <ArrowLeft size={20} />
                     </button>
                     <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 border border-white/10" />
                     <div>
                        <h3 className="text-white font-bold">{getConvName(selectedConv)}</h3>
                        {getConvDept(selectedConv) && (
                          <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">
                            {getConvDept(selectedConv)}
                          </div>
                        )}
                        <div className="flex items-center gap-1.5 text-[10px] text-emerald-500 font-bold uppercase tracking-widest mt-0.5">
                           <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Now
                        </div>
                     </div>
                  </div>
                  <button className="p-2 text-gray-600 hover:text-white transition-all"><MoreVertical size={20} /></button>
               </header>

               <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide">
                  <AnimatePresence>
                    {messages.map((msg, idx) => {
                      const isMe = msg.senderId?._id === user?._id;
                      return (
                        <motion.div 
                          key={msg._id} 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                        >
                           <div className={`max-w-[70%] ${isMe ? 'order-1' : 'order-1'}`}>
                              {!isMe && <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">{msg.senderId?.name}</div>}
                              <div className={`p-4 rounded-[28px] text-sm font-medium leading-relaxed shadow-lg ${
                                isMe ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-[#1e1e24] text-gray-200 border border-[#2d2d34] rounded-tl-none'
                              }`}>
                                 {msg.body}
                                 <div className={`mt-2 text-[8px] flex justify-end items-center gap-1 ${isMe ? 'text-blue-100' : 'text-gray-500'}`}>
                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    {isMe && <CheckCheck size={10} />}
                                 </div>
                              </div>
                           </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                  <div ref={scrollRef} />
               </div>

               <div className="p-8 bg-[#111114]/50 backdrop-blur-xl border-t border-[#2d2d34]">
                  <form onSubmit={handleSendMessage} className="relative group">
                     <input 
                       type="text" 
                       placeholder="Transmitting signal..."
                       className="w-full bg-[#16161a] border border-[#2d2d34] rounded-3xl pl-6 pr-20 py-5 text-sm text-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/40 transition-all font-medium placeholder:italic shadow-inner"
                       value={body}
                       onChange={(e) => setBody(e.target.value)}
                     />
                     <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <button 
                          type="submit"
                          className="bg-blue-600 text-white p-3.5 rounded-2xl font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-500 active:scale-90 transition-all"
                        >
                           <Send size={20} />
                        </button>
                     </div>
                  </form>
               </div>
             </>
           ) : (
             <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <div className="w-24 h-24 rounded-[40px] bg-gradient-to-br from-[#16161a] to-[#2d2d34] border border-white/5 flex items-center justify-center text-gray-700 mb-8 opacity-50 shadow-2xl">
                   <MessageSquare size={48} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">Enterprise Messaging</h3>
                <p className="text-gray-500 max-w-sm font-medium leading-relaxed italic">Select a conversation or start a new broadcast to coordinate with your team.</p>
             </div>
           )}
        </section>
      </main>

      {/* New Chat Search Modal */}
      <AnimatePresence>
         {showSearch && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60] flex items-center justify-center p-4"
            >
               <motion.div 
                 initial={{ scale: 0.9, opacity: 0 }}
                 animate={{ scale: 1, opacity: 1 }}
                 exit={{ scale: 0.9, opacity: 0 }}
                 className="glass w-full max-w-lg rounded-[40px] border border-[#2d2d34] overflow-hidden"
               >
                  <div className="p-8 border-b border-[#2d2d34] flex justify-between items-center bg-white/5">
                     <h3 className="text-2xl font-black text-white italic tracking-tight">New Broadcast</h3>
                     <button onClick={() => setShowSearch(false)} className="text-gray-500 hover:text-white transition-all">
                        <ArrowLeft size={24} />
                     </button>
                  </div>
                  <div className="p-8 space-y-6">
                     <div className="relative">
                        <input 
                          type="text" 
                          autoFocus
                          placeholder="Search colleagues..."
                          className="w-full bg-black/40 border border-[#2d2d34] rounded-2xl pl-12 pr-5 py-4 text-white font-medium focus:ring-2 focus:ring-blue-500/20"
                          value={searchQuery}
                          onChange={handleSearch}
                        />
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={20} />
                     </div>

                     <div className="space-y-2 max-h-[300px] overflow-y-auto scrollbar-hide">
                        {searchResults.map(emp => (
                          <button 
                            key={emp._id}
                            onClick={() => startNewConversation(emp._id)}
                            className="w-full p-4 rounded-3xl bg-white/[0.02] border border-white/[0.02] hover:bg-white/[0.05] hover:border-blue-500/20 flex items-center gap-4 transition-all group"
                          >
                             <div className="w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center font-bold text-blue-500 text-xs uppercase">
                                {emp.name[0]}
                             </div>
                             <div className="text-left">
                                <div className="text-sm font-bold text-white group-hover:text-blue-400 transition-all">{emp.name}</div>
                                <div className="text-[10px] text-gray-500 font-medium uppercase tracking-widest">{emp.email}</div>
                             </div>
                          </button>
                        ))}
                        {searchQuery.length > 2 && searchResults.length === 0 && (
                          <p className="text-center text-gray-600 italic text-sm py-10">No matches found in directory.</p>
                        )}
                        {!searchQuery && (
                          <p className="text-center text-gray-600 italic text-sm py-10">Search by name or email...</p>
                        )}
                     </div>
                  </div>
               </motion.div>
            </motion.div>
         )}
      </AnimatePresence>
    </div>
  );
};

// Simple Fallback Icon
const MessageSquare = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

export default Messages;
