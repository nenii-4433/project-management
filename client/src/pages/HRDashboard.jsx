import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import Sidebar from '../components/Sidebar';
import {
  Users, Building2, CheckSquare, Clock, Loader2, Share2, AlertCircle, Activity, Calendar
} from 'lucide-react';

// Live Countdown Component
const LiveCountdown = ({ deadline }) => {
  const [timeLeft, setTimeLeft] = useState('');
  const [isImminent, setIsImminent] = useState(false);

  useEffect(() => {
    if (!deadline) {
      setTimeLeft('No Deadline');
      return;
    }

    const calculateTime = () => {
      const now = new Date();
      const target = new Date(deadline);
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft('OVERDUE');
        setIsImminent(true);
        return;
      }

      if (diff < 24 * 60 * 60 * 1000) setIsImminent(true);
      else setIsImminent(false);

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft(
        `${days}d ${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`
      );
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [deadline]);

  return (
    <span className={`text-xs font-bold font-mono tracking-wider ${isImminent ? 'text-red-500 animate-pulse' : 'text-emerald-400'}`}>
      {timeLeft}
    </span>
  );
};

const HRDashboard = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [activeTasks, setActiveTasks] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const [statsRes, activeTasksRes, activityRes] = await Promise.all([
          axios.get('/api/dashboard/hr-stats', config),
          axios.get('/api/dashboard/hr-active-tasks', config),
          axios.get('/api/dashboard/recent-activity', config)
        ]);

        setStats(statsRes.data);
        setActiveTasks(activeTasksRes.data);
        setRecentActivity(activityRes.data);
      } catch (error) {
        console.error('Error fetching dashboard analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchDashboardData();
  }, [token]);

  const StatCard = ({ icon: Icon, label, value, colorClass, highlightRow = false }) => (
    <div className={`p-6 rounded-[30px] border border-[#2d2d34] bg-[#16161a] transition-all hover:scale-[1.02] ${highlightRow ? 'ring-1 ring-red-500/20' : ''}`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${colorClass}`}>
          <Icon size={24} />
        </div>
      </div>
      <div className="space-y-1">
        <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest">{label}</h4>
        <p className={`text-4xl font-black ${highlightRow ? 'text-red-500' : 'text-white'}`}>{value}</p>
      </div>
    </div>
  );

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
      <Sidebar role="hr" />

      <main className="flex-1 p-8 overflow-y-auto">
        <header className="mb-10">
          <h1 className="text-3xl font-black text-white tracking-tight">Analytics Overview</h1>
          <p className="text-gray-400 mt-1 font-medium">Real-time macro statistics and workforce velocity tracking</p>
        </header>

        {loading || !stats ? (
          <div className="flex items-center justify-center py-32 text-blue-500 gap-3">
            <Loader2 className="animate-spin" size={24} /> 
            <span className="font-bold uppercase tracking-widest text-xs truncate">Aggregating Datasource...</span>
          </div>
        ) : (
          <div className="space-y-10 animate-in fade-in zoom-in duration-500">
            {/* 7 Stat Cards Array */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <StatCard icon={Users} label="Total Employees" value={stats.totalEmployees} colorClass="bg-blue-600/20 text-blue-500" />
              <StatCard icon={Building2} label="Departments" value={stats.totalDepartments} colorClass="bg-emerald-600/20 text-emerald-500" />
              <StatCard icon={CheckSquare} label="Total Tasks" value={stats.totalTasks} colorClass="bg-purple-600/20 text-purple-500" />
              <StatCard icon={Clock} label="Pending Tasks" value={stats.pendingTasks} colorClass="bg-orange-600/20 text-orange-500" />
              <StatCard icon={Loader2} label="In Progress" value={stats.inProgressTasks} colorClass="bg-cyan-600/20 text-cyan-500" />
              <StatCard icon={Share2} label="Completed" value={stats.completedTasks} colorClass="bg-green-600/20 text-green-500" />
              <StatCard icon={AlertCircle} label="Overdue" value={stats.overdueTasks} colorClass="bg-red-600/20 text-red-500" highlightRow={stats.overdueTasks > 0} />
            </div>

            {/* Global Active Workflows Section instead of Charts */}
            <section className="bg-[#16161a] border border-[#2d2d34] rounded-[30px] p-8">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-white font-bold flex items-center gap-2">
                  <Activity size={18} className="text-blue-500"/> Global Active Workflows
                </h3>
                <span className="bg-blue-500/10 text-blue-500 border border-blue-500/20 text-xs font-bold px-3 py-1 rounded-full">
                   {activeTasks.length} Active
                </span>
              </div>

              {activeTasks.length === 0 ? (
                <div className="p-10 border border-dashed border-[#2d2d34] rounded-2xl text-center">
                  <p className="text-gray-500 font-medium">No active tasks found in the network.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {activeTasks.map(task => {
                    const statusObj = getStatusLabel(task.status);
                    return (
                      <div key={task._id} className="p-6 bg-[#0a0a0c] border border-[#2d2d34] rounded-2xl flex flex-col h-full hover:border-[#3d3d44] transition-colors relative group">
                        
                        <div className="flex justify-between items-start mb-4">
                           <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-gray-800 border border-[#2d2d34] flex items-center justify-center shrink-0 text-white font-bold text-sm">
                                {task.assignedTo?.name?.[0] || '?'}
                              </div>
                              <div>
                                 <p className="text-xs text-gray-500 font-bold uppercase tracking-widest leading-none mb-1">Assignee</p>
                                 <p className="text-white text-sm font-bold truncate max-w-[120px]">{task.assignedTo?.name || 'Unknown'}</p>
                              </div>
                           </div>
                           <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest shrink-0 bg-gray-800 text-gray-300 border border-[#2d2d34]`}>
                              {task.priority || 'standard'}
                           </span>
                        </div>

                        <h4 className="text-white font-medium text-lg leading-tight mb-6 line-clamp-2">{task.title}</h4>

                        <div className="mt-auto space-y-6">
                           <div className="flex justify-between items-center bg-[#16161a] p-3 rounded-xl border border-[#2d2d34]">
                              <div>
                                 <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Created On</span>
                                 <span className="text-xs text-gray-300 font-medium flex items-center gap-1">
                                    <Calendar size={12}/>
                                    {new Date(task.createdAt).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}
                                 </span>
                              </div>
                              <div className="text-right">
                                 <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Deadline T-Minus</span>
                                 <LiveCountdown deadline={task.deadline} />
                              </div>
                           </div>

                           <div>
                              <div className="flex justify-between items-center mb-2">
                                <span className={`text-[10px] font-bold uppercase tracking-widest ${statusObj.color}`}>{statusObj.label}</span>
                                <span className="text-xs font-bold text-white">{task.progressPercent}%</span>
                              </div>
                              <div className="h-2 w-full bg-[#16161a] rounded-full overflow-hidden border border-[#2d2d34]">
                                <div 
                                  className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full transition-all duration-1000 ease-out" 
                                  style={{ width: `${task.progressPercent}%` }}
                                />
                              </div>
                           </div>
                        </div>

                      </div>
                    )
                  })}
                </div>
              )}
            </section>

            {/* Activity Feed */}
            <div className="bg-[#16161a] border border-[#2d2d34] rounded-[30px] p-8">
              <h3 className="text-white font-bold mb-6 flex items-center gap-2">
                <Activity size={18} className="text-emerald-500"/> Global Activity Feed
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recentActivity.map(activity => {
                  const relativeTime = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
                  const diffInHours = Math.round((new Date(activity.createdAt) - new Date()) / (1000 * 60 * 60));
                  const timeString = diffInHours === 0 ? 'Just now' : relativeTime.format(diffInHours, 'hour');

                  return (
                    <div key={activity._id} className="flex items-start gap-4 p-4 rounded-2xl bg-[#0a0a0c] border border-[#2d2d34]">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-700 to-gray-900 border border-gray-600/50 flex items-center justify-center text-white font-bold text-sm shrink-0">
                        {activity.actorId?.name?.[0] || '?'}
                      </div>
                      <div>
                        <p className="text-gray-300 text-sm">
                          <span className="text-white font-bold">{activity.actorId?.name || 'Unknown User'}</span>{' '}
                          {activity.action.replace(/_/g, ' ')}{' '}
                          {activity.metadata?.taskTitle && <span className="text-blue-400 font-medium">{activity.metadata.taskTitle}</span>}
                        </p>
                        <span className="text-xs text-gray-500 font-bold tracking-widest uppercase mt-1 block">
                          {timeString}
                        </span>
                      </div>
                    </div>
                  );
                })}
                {recentActivity.length === 0 && (
                  <div className="p-8 text-center text-gray-500 text-sm font-medium col-span-2">No recent activity found on the network.</div>
                )}
              </div>
            </div>

          </div>
        )}
      </main>
    </div>
  );
};

export default HRDashboard;
