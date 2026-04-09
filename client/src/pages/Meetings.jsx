import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/useAuth';
import Sidebar from '../components/Sidebar';
import JitsiMeetingContainer from '../components/JitsiMeetingContainer';
import CreateMeetingModal from '../components/CreateMeetingModal';
import { 
  Video, 
  Users, 
  Plus, 
  ExternalLink, 
  Clock, 
  ShieldCheck, 
  Loader2, 
  AlertCircle,
  Activity,
  ArrowRight
} from 'lucide-react';

const Meetings = () => {
  const { token, user } = useAuth();
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCall, setActiveCall] = useState(null); // { roomId, title }
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchMeetings = async () => {
    try {
      const { data } = await axios.get('/api/meetings/active', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMeetings(data);
    } catch (err) {
      console.error('Error fetching meetings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchMeetings();
    const interval = setInterval(fetchMeetings, 15000); // Polling for new meetings
    return () => clearInterval(interval);
  }, [token]);

  const handleJoinCall = (meeting) => {
    setActiveCall(meeting);
  };

  const handleEndCall = async (meetingId) => {
     setActiveCall(null);
     if (user.role === 'hr') {
        try {
          await axios.patch(`/api/meetings/${meetingId}/end`, {}, {
            headers: { Authorization: `Bearer ${token}` }
          });
          fetchMeetings();
        } catch (err) {
          console.error('Failed to end meeting');
        }
     }
  };

  if (activeCall) {
    return (
      <div className="flex min-h-screen bg-[#0a0a0c]">
        <Sidebar role={user.role} />
        <main className="flex-1 p-8 overflow-hidden flex flex-col h-screen">
            <header className="mb-6 flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-black text-white tracking-tight">{activeCall.title}</h1>
                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">Direct Secure Session • AES-256</p>
              </div>
              <button 
                onClick={() => handleEndCall(activeCall._id)}
                className="px-6 py-3 bg-red-600/10 text-red-500 border border-red-500/20 rounded-2xl font-bold uppercase tracking-widest text-[10px] hover:bg-red-500 hover:text-white transition-all shadow-lg shadow-red-600/5 active:scale-95"
              >
                {user.role === 'hr' ? 'Terminate Meeting' : 'Leave Call'}
              </button>
            </header>
            <JitsiMeetingContainer 
              roomId={activeCall.roomId} 
              userName={user.name} 
              onEnd={() => handleEndCall(activeCall._id)}
            />
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#0a0a0c]">
      <Sidebar role={user.role} />
      
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="mb-10 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">Project Meetings</h1>
            <p className="text-gray-400 mt-1 font-medium italic">High-definition collaboration rooms for remote teams</p>
          </div>
          {user.role === 'hr' && (
            <button 
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 bg-blue-600 px-6 py-4 rounded-[30px] text-white font-black uppercase tracking-widest text-xs hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20 active:scale-95"
            >
              <Plus size={18} /> Initialize Meeting
            </button>
          )}
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 text-blue-500 gap-4">
            <Loader2 className="animate-spin" size={32} />
            <span className="text-xs font-bold uppercase tracking-widest animate-pulse">Syncing Active Rooms...</span>
          </div>
        ) : (
          <div className="space-y-12">
            <section>
              <h2 className="text-white font-bold mb-6 flex items-center gap-2 border-l-4 border-blue-500 pl-4">
                 Live Collaborations
              </h2>
              {meetings.length === 0 ? (
                <div className="p-20 bg-[#16161a] border border-dashed border-[#2d2d34] rounded-[40px] text-center max-w-3xl mx-auto">
                  <div className="w-16 h-16 rounded-3xl bg-[#0a0a0c] border border-[#2d2d34] flex items-center justify-center mx-auto mb-6 text-gray-700">
                    <Video size={32} className="opacity-10" />
                  </div>
                  <h3 className="text-white font-bold text-lg">No active meetings found</h3>
                  <p className="text-gray-500 mt-2 text-sm leading-relaxed max-w-sm mx-auto">
                    There are no current calls happening in the department workspace. Check back later or start a new session.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {meetings.map(meet => (
                    <div key={meet._id} className="bg-[#111114] border border-[#2d2d34] p-6 rounded-[35px] flex flex-col group hover:border-blue-500/30 transition-all cursor-default">
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-blue-600/10 text-blue-500 flex items-center justify-center shrink-0 border border-blue-600/10">
                            <Video size={24}/>
                          </div>
                          <div>
                            <h4 className="text-white font-bold text-lg leading-tight mb-1 group-hover:text-blue-400 transition-colors uppercase tracking-tight">{meet.title}</h4>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest flex items-center gap-1">
                               <ShieldCheck size={10} className="text-blue-500"/> Host: {meet.hostId?.name}
                            </p>
                          </div>
                        </div>
                      </div>

                      <p className="text-sm text-gray-400 leading-relaxed line-clamp-2 mb-8 h-10 px-1">
                        {meet.description || 'No additional description provided for this session.'}
                      </p>

                      <div className="mt-auto space-y-4">
                        <div className="flex items-center justify-between p-4 bg-[#16161a] border border-[#2d2d34] rounded-2xl">
                          <div className="flex items-center gap-2">
                            <Activity size={12} className="text-blue-500 animate-pulse"/>
                            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Active Now</span>
                          </div>
                          <div className="flex items-center gap-1 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                            <Clock size={12}/> Started {new Date(meet.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>

                        <button 
                          onClick={() => handleJoinCall(meet)}
                          className="w-full py-4 bg-white text-black font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 rounded-2xl hover:bg-blue-600 hover:text-white transition-all active:scale-95"
                        >
                          Establish Join <ArrowRight size={14}/>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        <CreateMeetingModal 
          isOpen={showCreateModal} 
          onClose={() => setShowCreateModal(false)}
          onCreated={(newMeet) => {
            fetchMeetings();
            setActiveCall(newMeet);
          }}
          token={token}
        />
      </main>
    </div>
  );
};

export default Meetings;
