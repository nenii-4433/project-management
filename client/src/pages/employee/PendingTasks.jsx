import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/useAuth';
import Sidebar from '../../components/Sidebar';
import { 
  Check, 
  X, 
  Clock, 
  AlertCircle, 
  FileText 
} from 'lucide-react';

const PendingTasks = () => {
  const { token } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPending = async () => {
    try {
      const { data } = await axios.get('/api/tasks/pending', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(data);
    } catch (error) {
      console.error('Error fetching pending tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchPending();
  }, [token]);

  const handleStatusChange = async (id, status) => {
    try {
      await axios.patch(`/api/tasks/${id}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchPending();
    } catch (error) {
      alert('Error updating task status');
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0a0a0c]">
      <Sidebar role="employee" />

      <main className="flex-1 p-8 overflow-y-auto">
        <header className="mb-10">
          <h1 className="text-3xl font-bold text-white tracking-tight">New Assignments</h1>
          <p className="text-gray-400 mt-1 font-medium">Please review and accept your pending tasks</p>
        </header>

        {loading ? (
          <div className="text-center py-20 text-gray-500 italic font-medium anim-pulse">Preparing inbox...</div>
        ) : (
          <div className="max-w-4xl space-y-6">
            {tasks.map((task) => (
              <div 
                key={task._id} 
                className="glass rounded-3xl border border-[#2d2d34] p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 group hover:border-blue-500/20 transition-all shadow-xl"
              >
                <div className="flex-1">
                   <div className="flex items-center gap-3 mb-3">
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-orange-500/20 bg-orange-500/10 text-orange-400`}>
                        Pending Review
                      </span>
                      {task.priority === 'high' && (
                        <span className="flex items-center gap-1 text-red-500 font-bold text-[10px] uppercase tracking-widest">
                          <AlertCircle size={14}/> Urgent
                        </span>
                      )}
                   </div>
                   
                   <h3 className="text-2xl font-bold text-white mb-2">{task.title}</h3>
                   <p className="text-gray-400 mb-4 line-clamp-2 max-w-2xl">{task.description || 'No detailed description provided for this assignment.'}</p>
                   
                   <div className="flex items-center gap-6 mt-2">
                      <div className="flex items-center gap-2 text-gray-500 text-sm">
                        <Clock size={16} className="text-gray-600" />
                        <span className="font-medium">Due: {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-500 text-sm">
                        <FileText size={16} className="text-gray-600" />
                        <span className="font-medium">Assigned by: Management</span>
                      </div>
                   </div>
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                   <button 
                     onClick={() => handleStatusChange(task._id, 'accepted')}
                     className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-emerald-600/20 active:scale-95"
                   >
                     <Check size={20} /> Accept
                   </button>
                   <button 
                     onClick={() => handleStatusChange(task._id, 'rejected')}
                     className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-[#1e1e24] hover:bg-red-900/30 text-gray-300 hover:text-red-400 px-8 py-3 rounded-2xl font-bold border border-[#2d2d34] transition-all active:scale-95"
                   >
                     <X size={20} /> Reject
                   </button>
                </div>
              </div>
            ))}

            {tasks.length === 0 && (
              <div className="py-32 flex flex-col items-center justify-center glass border-dashed border-[#2d2d34] rounded-[40px] text-center">
                <div className="w-20 h-20 bg-blue-600/10 rounded-full flex items-center justify-center mb-6">
                  <FileText size={40} className="text-blue-500 opacity-40" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Your inbox is empty</h3>
                <p className="text-gray-500 font-medium">New assignments will appear here as soon as they are published.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default PendingTasks;
