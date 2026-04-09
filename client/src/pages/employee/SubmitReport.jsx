import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/useAuth';
import Sidebar from '../../components/Sidebar';
import { 
  ClipboardCheck, 
  Send, 
  Paperclip, 
  AlertCircle,
  CheckCircle2,
  ListTodo
} from 'lucide-react';

const SubmitReport = () => {
  const { token } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [formData, setFormData] = useState({
    taskId: '',
    description: '',
    progressPercent: 0,
    attachmentUrl: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const { data } = await axios.get('/api/tasks/my-tasks', {
          headers: { Authorization: `Bearer ${token}` }
        });
        // Filter only non-completed tasks for report submission
        setTasks(data.filter(t => t.status !== 'completed'));
      } catch (err) {
        console.error('Error fetching tasks');
      }
    };
    if (token) fetchTasks();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.taskId) return alert('Please select a task');
    
    setLoading(true);
    setMessage(null);
    try {
      await axios.post('/api/reports', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage({ type: 'success', text: 'Progress report submitted successfully!' });
      setFormData({ taskId: '', description: '', progressPercent: 0, attachmentUrl: '' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Error submitting report' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0a0a0c]">
      <Sidebar role="employee" />

      <main className="flex-1 p-8 overflow-y-auto">
        <header className="mb-10">
           <h1 className="text-4xl font-bold text-white tracking-tight">Post Daily Report</h1>
           <p className="text-gray-400 mt-1 font-medium italic">Update your supervisor on your latest progress.</p>
        </header>

        <div className="max-w-3xl">
          {message && (
            <div className={`mb-8 p-6 rounded-3xl flex items-center gap-3 border ${
              message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
            }`}>
              {message.type === 'success' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
              <span className="font-bold">{message.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="glass p-10 rounded-[40px] border border-[#2d2d34] space-y-8">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="md:col-span-2">
                   <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 block px-1">Select Assignment</label>
                   <div className="relative">
                      <select 
                        required
                        className="w-full bg-[#16161a] border border-[#2d2d34] rounded-2xl px-5 py-3.5 text-white focus:ring-2 focus:ring-blue-500/20 transition-all font-medium appearance-none"
                        value={formData.taskId}
                        onChange={(e) => setFormData({...formData, taskId: e.target.value})}
                      >
                         <option value="">Choose a task...</option>
                         {tasks.map(t => (
                           <option key={t._id} value={t._id}>{t.title}</option>
                         ))}
                      </select>
                      <ListTodo className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                   </div>
                </div>

                <div className="md:col-span-2">
                   <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 block px-1">Progress Percentage</label>
                   <div className="flex items-center gap-6">
                      <input 
                        type="number" 
                        min="0" 
                        max="100"
                        required
                        placeholder="0-100"
                        className="w-32 bg-[#16161a] border border-[#2d2d34] rounded-2xl px-5 py-3.5 text-white focus:ring-2 focus:ring-blue-500/20 transition-all font-bold text-center"
                        value={formData.progressPercent}
                        onChange={(e) => setFormData({...formData, progressPercent: parseInt(e.target.value) || 0})}
                      />
                      <div className="flex-1 bg-black/20 h-4 rounded-full overflow-hidden border border-[#2d2d34] relative">
                         <div 
                           className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 transition-all duration-700 ease-out shadow-[0_0_15px_rgba(37,99,235,0.3)]"
                           style={{ width: `${formData.progressPercent}%` }}
                         />
                      </div>
                      <span className="text-white font-bold w-12">{formData.progressPercent}%</span>
                   </div>
                </div>

                <div className="md:col-span-2">
                   <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 block px-1">Work Logic / Summary</label>
                   <textarea 
                     required
                     rows="5"
                     placeholder="Describe what was accomplished, blockers resolved, and next steps..."
                     className="w-full bg-[#16161a] border border-[#2d2d34] rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-blue-500/20 transition-all font-medium leading-relaxed"
                     value={formData.description}
                     onChange={(e) => setFormData({...formData, description: e.target.value})}
                   />
                </div>

                <div className="md:col-span-2">
                   <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 block px-1 flex items-center gap-2">
                      <Paperclip size={14} /> Attachment URL (Optional)
                   </label>
                   <input 
                     type="url" 
                     placeholder="Link to file, pull request, or design..."
                     className="w-full bg-[#16161a] border border-[#2d2d34] rounded-2xl px-5 py-3.5 text-white focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                     value={formData.attachmentUrl}
                     onChange={(e) => setFormData({...formData, attachmentUrl: e.target.value})}
                   />
                </div>
             </div>

             <div className="pt-6">
                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 text-white rounded-2xl py-4 font-bold transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 active:scale-[0.98] flex items-center justify-center gap-3"
                >
                  {loading ? 'Submitting Report...' : <><Send size={20} /> Submit Daily Report</>}
                </button>
             </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default SubmitReport;
