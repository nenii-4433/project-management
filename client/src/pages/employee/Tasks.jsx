import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import Sidebar from '../../components/Sidebar';
import { 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  ChevronRight,
  Briefcase
} from 'lucide-react';

const EmployeeTasks = () => {
  const { token } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const { data } = await axios.get('/api/tasks/my-tasks', {
          headers: { Authorization: `Bearer ${token}` }
        });
        // Filter out pending and rejected tasks for this view
        setTasks(data.filter(t => t.status !== 'pending' && t.status !== 'rejected'));
      } catch (error) {
        console.error('Error fetching tasks:', error);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchTasks();
  }, [token]);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'medium': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      case 'low': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0a0a0c]">
      <Sidebar role="employee" />

      <main className="flex-1 p-8 overflow-y-auto">
        <header className="mb-10">
          <h1 className="text-3xl font-bold text-white tracking-tight">My Active Tasks</h1>
          <p className="text-gray-400 mt-1 font-medium">Manage your current assignments and track progress</p>
        </header>

        {loading ? (
          <div className="text-center py-20 text-gray-500 italic font-medium anim-pulse">Syncing with workspace...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {tasks.map((task) => (
              <Link 
                key={task._id} 
                to={`/employee/tasks/${task._id}`}
                className="glass group rounded-3xl border border-[#2d2d34] p-6 hover:border-blue-500/40 hover:bg-[#16161a]/60 transition-all block relative"
              >
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${getPriorityColor(task.priority)}`}>
                    {task.priority} Priority
                  </span>
                  <div className="text-gray-500 group-hover:translate-x-1 group-hover:text-blue-400 transition-all">
                    <ChevronRight size={20} />
                  </div>
                </div>

                <h3 className="text-xl font-bold text-white mb-2 line-clamp-1">{task.title}</h3>
                <p className="text-sm text-gray-400 line-clamp-2 mb-6 min-h-[40px]">{task.description || 'No description provided.'}</p>

                <div className="space-y-4 pt-4 border-t border-[#2d2d34]">
                   <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                      <span className="text-gray-500">Assignment Status</span>
                      <span className={
                        task.status === 'completed' ? 'text-emerald-400' : 
                        task.status === 'in_progress' ? 'text-purple-400' : 'text-blue-400'
                      }>
                        {task.status.replace('_', ' ')}
                      </span>
                   </div>
                   
                   <div className="w-full bg-[#1e1e24] h-1.5 rounded-full overflow-hidden">
                      <div className={`h-full transition-all duration-1000 ${
                        task.status === 'completed' ? 'w-full bg-emerald-500' : 
                        task.status === 'in_progress' ? 'w-[65%] bg-purple-500' : 'w-[15%] bg-blue-500'
                      }`} />
                   </div>

                   <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-2 text-gray-500 text-xs">
                        <Clock size={14} />
                        <span>Deadline: {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'None'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-400 text-xs font-medium">
                        <Briefcase size={14} className="text-blue-400" />
                        <span>{task.assignedBy?.name}</span>
                      </div>
                   </div>
                </div>
              </Link>
            ))}

            {tasks.length === 0 && (
              <div className="col-span-full py-20 flex flex-col items-center justify-center glass border-dashed border-[#2d2d34] rounded-3xl">
                <CheckCircle size={48} className="text-emerald-500/20 mb-4" />
                <p className="text-gray-500 font-medium italic">All caught up! No active tasks for now.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default EmployeeTasks;
