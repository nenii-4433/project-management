import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/useAuth';
import Sidebar from '../../components/Sidebar';
import { 
  Star, 
  TrendingUp, 
  MessageSquare, 
  Calendar, 
  User,
  Activity,
  Award,
  AlertCircle
} from 'lucide-react';

const MyPerformance = () => {
  const { user, token } = useAuth();
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPerformance = async () => {
      try {
        const { data } = await axios.get('/api/ratings/my-performance', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setRatings(data);
      } catch (err) {
        console.error('Error fetching performance history');
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchPerformance();
  }, [token]);

  const averageScore = ratings.length > 0 
    ? (ratings.reduce((acc, r) => acc + r.score, 0) / ratings.length).toFixed(1)
    : 0;

  const getScoreColor = (score) => {
    if (score >= 4.5) return 'text-emerald-500';
    if (score >= 3.5) return 'text-blue-500';
    if (score >= 2.5) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="flex min-h-screen bg-[#0a0a0c]">
      <Sidebar role="employee" />

      <main className="flex-1 p-8 overflow-y-auto">
        <header className="mb-10 lg:flex justify-between items-end">
           <div>
              <h1 className="text-4xl font-bold text-white tracking-tight">Performance Portfolio</h1>
              <p className="text-gray-400 mt-1 font-medium italic">Track your professional growth and supervisor feedback.</p>
           </div>
           
           <div className="mt-6 lg:mt-0 glass px-6 py-4 rounded-3xl border border-[#2d2d34] flex items-center gap-6">
              <div className="flex flex-col items-center">
                 <div className="flex items-center gap-1.5 mb-1">
                    <Star className="text-yellow-500 fill-yellow-500" size={18} />
                    <span className="text-2xl font-black text-white">{averageScore}</span>
                 </div>
                 <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-none">Global Score</span>
              </div>
              <div className="w-px h-10 bg-[#2d2d34]" />
              <div className="flex flex-col items-center">
                 <span className="text-2xl font-black text-white">{ratings.length}</span>
                 <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-none">Official Reviews</span>
              </div>
           </div>
        </header>

        {loading ? (
             <div className="flex items-center justify-center py-20 text-gray-500 italic anim-pulse font-medium">Synchronizing performance data...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             {/* Scorecard Summary */}
             <div className="lg:col-span-1 space-y-6">
                <div className="glass p-10 rounded-[40px] border border-[#2d2d34] flex flex-col items-center text-center relative overflow-hidden group">
                   <div className="absolute -top-10 -right-10 w-40 h-40 bg-yellow-500/10 blur-3xl rounded-full group-hover:bg-yellow-500/20 transition-all duration-700" />
                   
                   <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/20 flex items-center justify-center text-yellow-500 mb-6 relative">
                      <Star size={48} fill="currentColor" className="drop-shadow-[0_0_15px_rgba(234,179,8,0.3)]" />
                   </div>
                   
                   <h2 className="text-5xl font-black text-white mb-2">{averageScore}</h2>
                   <p className="text-gray-500 font-bold uppercase tracking-widest text-xs mb-8">Career Performance Rating</p>
                   
                   <div className="w-full space-y-3">
                      <div className="flex justify-between text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                         <span>Threshold Success</span>
                         <span className="text-blue-400">{(averageScore / 5 * 100).toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden border border-white/5">
                         <div 
                           className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-1000" 
                           style={{ width: `${(averageScore / 5 * 100)}%` }}
                         />
                      </div>
                   </div>

                   <div className="mt-10 p-5 rounded-3xl bg-blue-600/10 border border-blue-500/10 flex items-center gap-4 text-left">
                      <Award className="text-blue-400 shrink-0" size={24} />
                      <p className="text-[11px] text-gray-400 font-medium leading-relaxed italic">
                        Feedback is the engine of growth. Review your supervisor's notes carefully to refine your execution.
                      </p>
                   </div>
                </div>

                <div className="glass p-8 rounded-[40px] border border-[#2d2d34]">
                   <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-widest flex items-center gap-2">
                      <Activity className="text-blue-500" size={16} /> Performance Insights
                   </h3>
                   <div className="space-y-4">
                      {['Punctuality', 'Quality', 'Communication', 'Technical Skill'].map((kpi, idx) => (
                        <div key={idx} className="flex justify-between items-center py-2">
                           <span className="text-xs text-gray-500 font-bold">{kpi}</span>
                           <div className="flex gap-1 text-blue-500">
                              {[1,2,3,4,5].map(s => <div key={s} className={`w-1 h-3 rounded-full ${s <= (averageScore - idx % 2) ? 'bg-blue-500' : 'bg-gray-800'}`} />)}
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
             </div>

             {/* Feedback Timeline */}
             <div className="lg:col-span-2 space-y-6">
                <div className="flex justify-between items-center px-4">
                   <h3 className="text-xl font-bold text-white flex items-center gap-2 uppercase tracking-tight">Official Feedback Timeline</h3>
                   <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Sorted: Latest First</span>
                </div>

                <div className="space-y-6">
                   {ratings.map((rating) => (
                     <div key={rating._id} className="glass p-8 rounded-[40px] border border-[#2d2d34] hover:border-blue-500/20 transition-all group">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6 pb-6 border-b border-[#2d2d34]/50">
                           <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-2xl bg-[#16161a] border border-[#2d2d34] flex items-center justify-center text-gray-500 shrink-0">
                                 {rating.ratedByHrId?.avatarUrl ? (
                                   <img src={rating.ratedByHrId.avatarUrl} alt="Avatar" className="w-full h-full object-cover rounded-2xl" />
                                 ) : (
                                   <User size={20} />
                                 )}
                              </div>
                              <div>
                                 <div className="text-sm font-bold text-white">{rating.ratedByHrId?.name || 'HR Administrator'}</div>
                                 <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest flex items-center gap-1"><Calendar size={10}/> {new Date(rating.createdAt).toLocaleDateString()}</div>
                              </div>
                           </div>

                           <div className="flex items-center gap-1">
                              {[1,2,3,4,5].map(s => (
                                <Star 
                                  key={s} 
                                  size={16} 
                                  className={`${s <= rating.score ? 'text-yellow-500' : 'text-gray-800'} ${s <= rating.score ? 'fill-yellow-500' : 'none'}`} 
                                />
                              ))}
                              <span className="ml-3 text-lg font-black text-white">{rating.score}.0</span>
                           </div>
                        </div>

                        {rating.taskId && (
                           <div className="mb-6 flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-600/5 border border-blue-500/10 text-[10px] font-bold text-blue-400 uppercase tracking-widest w-fit">
                             Context: {rating.taskId.title}
                           </div>
                        )}

                        <div className="flex gap-4">
                           <MessageSquare className="text-blue-500 shrink-0 mt-1" size={20} />
                           <p className="text-sm text-gray-400 font-medium leading-relaxed italic group-hover:text-gray-300 transition-all">
                              "{rating.feedback || 'No detailed feedback comments provided for this performance score.'}"
                           </p>
                        </div>
                     </div>
                   ))}

                   {ratings.length === 0 && (
                      <div className="py-20 glass rounded-[40px] border border-dashed border-[#2d2d34] flex flex-col items-center justify-center text-gray-500">
                         <AlertCircle size={40} className="mb-4 opacity-20" />
                         <p className="font-medium italic">No performance reviews have been published for your profile yet.</p>
                      </div>
                   )}
                </div>
             </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default MyPerformance;
