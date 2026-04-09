import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/useAuth';
import Sidebar from '../../components/Sidebar';
import { 
  Plus, 
  Search, 
  Filter, 
  MessageSquare, 
  Edit3, 
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  X
} from 'lucide-react';

const HRTasks = () => {
  const { token } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assignedTo: '',
    departmentId: '',
    priority: 'medium',
    deadline: ''
  });

  const fetchData = async () => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          status: statusFilter || undefined,
          priority: priorityFilter || undefined,
          search: searchQuery || undefined
        }
      };
      
      const [taskRes, empRes, deptRes] = await Promise.all([
        axios.get('/api/tasks', config),
        axios.get('/api/employees', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('/api/departments', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      
      setTasks(taskRes.data);
      setEmployees(empRes.data);
      setDepartments(deptRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchData();
  }, [token, statusFilter, priorityFilter, searchQuery]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/tasks', newTask, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowAddModal(false);
      setNewTask({ title: '', description: '', assignedTo: '', departmentId: '', priority: 'medium', deadline: '' });
      fetchData();
    } catch (error) {
      alert('Error creating task');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending': return <span className="bg-orange-500/10 text-orange-400 border border-orange-500/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Pending</span>;
      case 'accepted': return <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Accepted</span>;
      case 'in_progress': return <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Working</span>;
      case 'completed': return <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Done</span>;
      case 'rejected': return <span className="bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Rejected</span>;
      default: return null;
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'high': return <span className="text-red-500 flex items-center gap-1 font-bold text-xs uppercase"><AlertCircle size={14}/> High</span>;
      case 'medium': return <span className="text-blue-500 flex items-center gap-1 font-bold text-xs uppercase"><Clock size={14}/> Medium</span>;
      case 'low': return <span className="text-gray-500 flex items-center gap-1 font-bold text-xs uppercase"><CheckCircle size={14}/> Low</span>;
      default: return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0a0a0c]">
      <Sidebar role="hr" />

      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Task Oversight</h1>
            <p className="text-gray-400 mt-1">Monitor project progress and assign work orders</p>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-600/20 active:scale-95"
          >
            <Plus size={20} /> New Assignment
          </button>
        </header>

        {/* Action Bar */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input 
              type="text" 
              placeholder="Search tasks..."
              className="w-full bg-[#16161a] border border-[#2d2d34] rounded-xl py-3 pl-12 pr-4 text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-4">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#16161a] border border-[#2d2d34] rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500/20 transition-all"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
            </select>
            <select 
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-[#16161a] border border-[#2d2d34] rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500/20 transition-all"
            >
              <option value="">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-500 italic">Syncing task data...</div>
        ) : (
          <div className="glass border border-[#2d2d34] rounded-3xl overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#16161a] border-b border-[#2d2d34]">
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Description</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Assignee</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Priority</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Deadline</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2d2d34]">
                {tasks.map((task) => (
                  <tr key={task._id} className="hover:bg-[#16161a]/50 transition-all group">
                    <td className="px-6 py-5">
                      <div className="font-bold text-white mb-0.5">{task.title}</div>
                      <div className="text-xs text-gray-500 line-clamp-1">{task.description || 'No description provided'}</div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center text-blue-400 text-xs font-bold">
                          {task.assignedTo?.name?.[0]}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-200">{task.assignedTo?.name}</div>
                          <div className="text-[10px] text-gray-500 uppercase font-bold tracking-tight">{task.departmentId?.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      {getStatusBadge(task.status)}
                    </td>
                    <td className="px-6 py-5">
                      {getPriorityBadge(task.priority)}
                    </td>
                    <td className="px-6 py-5 text-sm text-gray-300">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-gray-500" />
                        {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'No limit'}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        <button className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-all">
                          <MessageSquare size={18} />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-white hover:bg-[#2d2d34] rounded-lg transition-all">
                          <Edit3 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Creation Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="glass w-full max-w-lg rounded-3xl border border-[#2d2d34] overflow-hidden fade-in">
              <div className="px-8 py-6 border-b border-[#2d2d34] flex justify-between items-center bg-[#16161a]">
                <h3 className="text-xl font-bold text-white">Create New Task</h3>
                <button onClick={() => setShowAddModal(false)} className="text-gray-500 hover:text-white transition-all"><X size={20}/></button>
              </div>
              <form onSubmit={handleCreateTask} className="p-8 space-y-5">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">Task Title</label>
                  <input 
                    type="text" required
                    className="w-full bg-[#1e1e24] border border-[#2d2d34] rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500/20"
                    placeholder="Enter short title..."
                    value={newTask.title}
                    onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">Department</label>
                    <select 
                      className="w-full bg-[#1e1e24] border border-[#2d2d34] rounded-xl px-4 py-3 text-white"
                      value={newTask.departmentId}
                      onChange={(e) => setNewTask({...newTask, departmentId: e.target.value, assignedTo: ''})}
                    >
                      <option value="">Select Dept...</option>
                      {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">Assigned To</label>
                    <select 
                      required
                      className="w-full bg-[#1e1e24] border border-[#2d2d34] rounded-xl px-4 py-3 text-white disabled:opacity-50"
                      value={newTask.assignedTo}
                      onChange={(e) => setNewTask({...newTask, assignedTo: e.target.value})}
                      disabled={!newTask.departmentId}
                    >
                      <option value="">{newTask.departmentId ? 'Select Employee...' : 'Select Department First'}</option>
                      {employees
                        .filter(e => !newTask.departmentId || e.departmentId?.toString() === newTask.departmentId)
                        .map(e => <option key={e._id} value={e._id}>{e.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">Priority</label>
                    <select 
                      className="w-full bg-[#1e1e24] border border-[#2d2d34] rounded-xl px-4 py-3 text-white"
                      value={newTask.priority}
                      onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                    >
                      <option value="low">Low Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="high">High Priority</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">Deadline Date</label>
                    <input 
                      type="date"
                      className="w-full bg-[#1e1e24] border border-[#2d2d34] rounded-xl px-4 py-3 text-white"
                      value={newTask.deadline}
                      onChange={(e) => setNewTask({...newTask, deadline: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">HR Notes (Optional)</label>
                  <textarea 
                    className="w-full bg-[#1e1e24] border border-[#2d2d34] rounded-xl px-4 py-3 text-white h-24 resize-none"
                    placeholder="Technical requirements, links, etc..."
                    value={newTask.description}
                    onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                  />
                </div>
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl mt-4 shadow-lg shadow-blue-600/20 transition-all active:scale-95">
                  Confirm Assignment
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default HRTasks;
