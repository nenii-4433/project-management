import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/useAuth';
import Sidebar from '../components/Sidebar';
import { 
  Clock, 
  CheckCircle, 
  Loader2, 
  CheckSquare,
  AlertCircle,
  Calendar
} from 'lucide-react';

const EmployeeDashboard = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [activeTasks, setActiveTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await axios.get('/api/dashboard/employee-stats', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(data.stats);
        setActiveTasks(data.activeTasks);
      } catch (error) {
        console.error('Error fetching employee stats:', error);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchStats();
  }, [token]);

  const StatCard = ({ icon: Icon, label, value, colorClass }) => (
    <div className={`p-6 rounded-[30px] border border-[#2d2d34] bg-[#16161a] transition-all hover:scale-[1.02]`}>
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${colorClass}`}>
        <Icon size={24} />
      </div>
      <div className="space-y-1">
        <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest">{label}</h4>
        <p className="text-4xl font-black text-white">{value}</p>
      </div>
    </div>
  );

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return 'bg-red-500/20 text-red-500 border border-red-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30';
      case 'low': return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
    }
  };

  const getStatusLabel = (status) => {
    switch(status) {
      case 'pending': return { label: 'Pending', color: 'text-orange-400' };
      case 'accepted': return { label: 'Accepted', color: 'text-blue-400' };
      case 'in_progress': return { label: 'Working', color: 'text-cyan-400' };
      default: return { label: status, color: 'text-gray-400' };
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0a0a0c]">
      <Sidebar role="employee" />

      <main className="flex-1 p-8 overflow-y-auto">
        <header className="mb-10">
          <h1 className="text-3xl font-black text-white tracking-tight">My Workspace</h1>
          <p className="text-gray-400 mt-1 font-medium">Hello {user?.name}, here is your current workflow overview.</p>
        </header>

        {loading || !stats ? (
          <div className="flex items-center justify-center py-32 text-blue-500 gap-3">
            <Loader2 className="animate-spin" size={24} /> 
            <span className="font-bold uppercase tracking-widest text-xs truncate">Loading Workspace...</span>
          </div>
        ) : (
          <div className="space-y-10 animate-in fade-in zoom-in duration-500">
            
            {/* 4 Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              <StatCard icon={Clock} label="Pending Action" value={stats.pendingTasks} colorClass="bg-orange-600/20 text-orange-500" />
              <StatCard icon={CheckSquare} label="Accepted" value={stats.acceptedTasks} colorClass="bg-blue-600/20 text-blue-500" />
              <StatCard icon={Loader2} label="In Progress" value={stats.inProgressTasks} colorClass="bg-cyan-600/20 text-cyan-500" />
              <StatCard icon={CheckCircle} label="Completed" value={stats.completedTasks} colorClass="bg-emerald-600/20 text-emerald-500" />
            </div>

            {/* Active Tasks Grid */}
            <section>
              <h2 className="text-xl font-bold text-white tracking-tight mb-6 flex items-center gap-2">
                Active Projects <span className="text-xs font-bold bg-[#2d2d34] px-2 py-1 rounded-md text-gray-400">{activeTasks.length}</span>
              </h2>
              
              {activeTasks.length === 0 ? (
                <div className="p-10 border border-dashed border-[#2d2d34] rounded-[30px] text-center bg-[#16161a]">
                  <p className="text-gray-500 font-medium">You have no active workflows. Take a break!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activeTasks.map(task => {
                    const statusObj = getStatusLabel(task.status);
                    return (
                      <button 
                        key={task._id} 
                        onClick={() => navigate(`/employee/tasks/${task._id}`)}
                        className="p-6 bg-[#16161a] border border-[#2d2d34] rounded-[30px] text-left hover:bg-white/[0.02] hover:border-blue-500/50 transition-all group flex flex-col h-full"
                      >
                        <div className="flex justify-between items-start mb-4 gap-4">
                          <h3 className="font-bold text-white text-lg leading-tight group-hover:text-blue-400 transition-colors line-clamp-2">
                            {task.title}
                          </h3>
                          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest shrink-0 ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                        </div>

                        <div className="flex items-center justify-between mt-auto pt-6 mb-5">
                          <span className={`text-xs font-bold uppercase tracking-widest ${statusObj.color}`}>
                            {statusObj.label}
                          </span>
                          <span className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
                            <Calendar size={14} />
                            {task.deadline ? new Date(task.deadline).toLocaleDateString(undefined, {month: 'short', day: 'numeric'}) : 'No limit'}
                          </span>
                        </div>

                        {/* Progress Bar Component */}
                        <div className="mt-auto">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Completion Progress</span>
                            <span className="text-xs font-bold text-white">{task.progressPercent}%</span>
                          </div>
                          <div className="h-2 w-full bg-black/50 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full transition-all duration-1000 ease-out" 
                              style={{ width: `${task.progressPercent}%` }}
                            />
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  );
};

export default EmployeeDashboard;
