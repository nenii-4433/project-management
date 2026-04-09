import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/useAuth';
import { Star, Loader2, Award, Building, Mail, User as UserIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

const Profile = () => {
  const { user, token } = useAuth();
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ average: 0, total: 0 });

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user?._id || !token) return;
      try {
        const { data } = await axios.get(`/api/ratings/employee/${user._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setRatings(data);

        // Calculate stats
        if (data.length > 0) {
          const avg = data.reduce((acc, curr) => acc + curr.score, 0) / data.length;
          setStats({ average: avg.toFixed(1), total: data.length });
        }
      } catch (err) {
        console.error('Error fetching profile ratings', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, [user, token]);

  const renderStars = (ratingValue) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            className={`${ratingValue >= star ? 'fill-yellow-500 text-yellow-500' : 'fill-transparent text-gray-600'}`}
          />
        ))}
      </div>
    );
  };

  if (!user) return null;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* Profile Header */}
      <section className="glass border border-white/5 p-8 rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-500/20 to-transparent blur-[100px] pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
          <div className="w-32 h-32 rounded-[40px] bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center border-4 border-[#111114] shadow-2xl shrink-0">
             <UserIcon size={48} className="text-white" />
          </div>
          <div className="flex-1 space-y-4 pt-2">
            <div>
              <h1 className="text-4xl font-black text-white tracking-tight">{user.name}</h1>
              <div className="flex flex-wrap gap-4 mt-4 justify-center md:justify-start">
                <div className="flex items-center gap-2 text-gray-400 font-medium">
                  <Mail size={16} className="text-emerald-500" />
                  {user.email}
                </div>
                <div className="flex items-center gap-2 text-gray-400 font-medium">
                  <Building size={16} className="text-blue-500" />
                  {user.department || 'General Assignments'}
                </div>
              </div>
            </div>

            <div className="flex gap-6 pt-4 border-t border-[#2d2d34]">
              <div>
                 <div className="text-3xl font-black text-white">{stats.average}</div>
                 <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Average Score</div>
              </div>
              <div>
                 <div className="text-3xl font-black text-white">{stats.total}</div>
                 <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Total Reviews</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ratings Section */}
      <section>
        <div className="flex items-center gap-3 mb-6">
           <Award className="text-emerald-500" size={24} />
           <h2 className="text-2xl font-bold text-white tracking-tight">My Ratings</h2>
        </div>

        {loading ? (
          <div className="flex justify-center p-20"><Loader2 className="animate-spin text-gray-500" size={40} /></div>
        ) : ratings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ratings.map(rating => (
              <div key={rating._id} className="glass border border-white/5 p-6 rounded-3xl hover:border-emerald-500/30 transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-500/10 flex flex-col h-full">
                <div className="flex justify-between items-center mb-4">
                  {renderStars(rating.score)}
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                    {new Date(rating.createdAt).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="flex-1 mb-6">
                  <p className="text-gray-300 italic text-sm leading-relaxed">
                    "{rating.feedback}"
                  </p>
                </div>

                <div className="border-t border-[#2d2d34] pt-4 mt-auto">
                  {rating.taskId ? (
                    <Link to={`/employee/tasks/${rating.taskId._id}`} className="text-sm font-bold text-emerald-400 hover:text-emerald-300 transition-colors block mb-2 truncate">
                      Task: {rating.taskId.title}
                    </Link>
                  ) : (
                    <div className="text-sm font-bold text-gray-500 block mb-2">General Review</div>
                  )}
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-600/20 text-blue-500 flex items-center justify-center font-bold text-[10px] uppercase">
                       {rating.ratedByHrId?.name?.[0] || 'H'}
                    </div>
                    <span className="text-xs font-medium text-gray-400">Reviewed by {rating.ratedByHrId?.name}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass border border-white/5 rounded-3xl p-16 text-center">
            <h3 className="text-xl font-bold text-white mb-2">No Performance Records Yet</h3>
            <p className="text-gray-500 font-medium max-w-sm mx-auto">Your evaluations and feedback from HR managers will appear here as they are submitted.</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default Profile;
