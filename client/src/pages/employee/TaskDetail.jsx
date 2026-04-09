import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import Sidebar from '../../components/Sidebar';
import { 
  ArrowLeft, 
  Send, 
  Clock, 
  Calendar, 
  AlertCircle, 
  MessageSquare, 
  User,
  CheckCircle2,
  PlayCircle,
  FileText
} from 'lucide-react';

const TaskDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  
  const [task, setTask] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchTaskDetails = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const [taskRes, commentsRes] = await Promise.all([
        axios.get('/api/tasks/my-tasks', config), // Reusing my-tasks and filtering locally for simplicity
        axios.get(`/api/tasks/${id}/comments`, config)
      ]);
      
      const foundTask = taskRes.data.find(t => t._id === id);
      setTask(foundTask);
      setComments(commentsRes.data);
    } catch (error) {
      console.error('Error fetching task details:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchTaskDetails();
  }, [id, token]);

  const handleUpdateStatus = async (status) => {
    try {
      await axios.patch(`/api/tasks/${id}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTaskDetails();
    } catch (error) {
      alert('Error updating status');
    }
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const { data } = await axios.post(`/api/tasks/${id}/comments`, { body: newComment }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setComments([...comments, data]);
      setNewComment('');
    } catch (error) {
      alert('Error posting comment');
    }
  };

  if (loading) return <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center text-gray-500 italic">Syncing with server...</div>;
  if (!task) return <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center text-gray-500 italic font-medium tracking-tight">Assignment not found or inaccessible.</div>;

  return (
    <div className="flex min-h-screen bg-[#0a0a0c]">
      <Sidebar role="employee" />

      <main className="flex-1 p-8 overflow-y-auto">
        <button 
          onClick={() => navigate('/employee/tasks')}
          className="flex items-center gap-2 text-gray-500 hover:text-white transition-all mb-8 font-medium group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-all" /> Back to My Inbox
        </button>

        <div className="max-w-5xl grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Task Details */}
          <div className="lg:col-span-2 space-y-6">
            <section className="glass p-8 rounded-3xl border border-[#2d2d34]">
               <div className="flex items-center gap-3 mb-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                    task.priority === 'high' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                    task.priority === 'medium' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  }`}>
                    {task.priority} Priority
                  </span>
                  <span className="text-gray-500 text-xs font-medium ml-auto flex items-center gap-1.5"><Clock size={14}/> {new Date(task.createdAt).toLocaleDateString()}</span>
               </div>
               
               <h1 className="text-4xl font-bold text-white mb-6 tracking-tight leading-tight">{task.title}</h1>
               <div className="prose prose-invert max-w-none mb-10">
                  <p className="text-gray-400 text-lg leading-relaxed">{task.description || 'Welcome to your assignment. Please use the discussion thread for any clarifications or updates regarding the scope of work.'}</p>
               </div>

               {/* Status Controls */}
               <div className="pt-8 border-t border-[#2d2d34]">
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6 px-1">Update Your Status</div>
                  <div className="flex flex-wrap gap-3">
                     <button 
                        onClick={() => handleUpdateStatus('in_progress')}
                        disabled={task.status === 'in_progress'}
                        className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all ${
                          task.status === 'in_progress' ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30' : 'bg-[#1e1e24] text-gray-400 border border-[#2d2d34] hover:bg-purple-600/10 hover:text-purple-400'
                        }`}
                     >
                        <PlayCircle size={20} /> Work in Progress
                     </button>
                     <button 
                        onClick={() => handleUpdateStatus('completed')}
                        disabled={task.status === 'completed'}
                        className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all ${
                          task.status === 'completed' ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30' : 'bg-[#1e1e24] text-gray-400 border border-[#2d2d34] hover:bg-emerald-600/10 hover:text-emerald-400'
                        }`}
                     >
                        <CheckCircle2 size={20} /> Mark Finished
                     </button>
                  </div>
               </div>
            </section>

            {/* Comment Section */}
            <section className="glass p-8 rounded-3xl border border-[#2d2d34]">
               <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-2">
                 <MessageSquare size={20} className="text-blue-500" /> Collaboration Thread
               </h3>
               
               <div className="space-y-6 mb-10 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                  {comments.map((comment) => (
                    <div key={comment._id} className={`flex gap-4 ${comment.authorId?._id === user?._id ? 'flex-row-reverse' : ''}`}>
                       <div className="w-10 h-10 rounded-xl bg-gray-700/20 border border-[#2d2d34] flex items-center justify-center shrink-0 overflow-hidden">
                          {comment.authorId?.avatarUrl ? (
                            <img src={comment.authorId.avatarUrl} className="w-full h-full object-cover" alt="Avatar" />
                          ) : (
                            <User className="text-gray-500" size={20} />
                          )}
                       </div>
                       <div className={`flex flex-col ${comment.authorId?._id === user?._id ? 'items-end' : 'items-start'} max-w-[80%]`}>
                          <div className={`px-5 py-3 rounded-2xl text-sm font-medium ${
                            comment.authorId?._id === user?._id ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-[#1e1e24] text-gray-200 border border-[#2d2d34] rounded-tl-none'
                          }`}>
                            {comment.body}
                          </div>
                          <span className="text-[10px] text-gray-500 mt-1 font-bold uppercase tracking-wider px-1">
                            {comment.authorId?.name} • {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                       </div>
                    </div>
                  ))}
                  {comments.length === 0 && (
                    <div className="text-center py-10">
                       <p className="text-gray-500 italic text-sm">No discussion started yet.</p>
                    </div>
                  )}
               </div>

               <form onSubmit={handlePostComment} className="flex gap-3 pt-6 border-t border-[#2d2d34]">
                  <input 
                    type="text" 
                    placeholder="Type a message or share an update..."
                    className="flex-1 bg-[#16161a] border border-[#2d2d34] rounded-2xl px-5 py-3 text-white focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                  />
                  <button 
                    type="submit"
                    className="w-12 h-12 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl flex items-center justify-center transition-all shadow-lg shadow-blue-600/20 active:scale-95 shrink-0"
                  >
                    <Send size={20} />
                  </button>
               </form>
            </section>
          </div>

          {/* Right Column: Sidebar Info */}
          <div className="space-y-6">
             <div className="glass p-6 rounded-3xl border border-[#2d2d34]">
                <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 px-1">Assignment Info</div>
                <div className="space-y-5">
                   <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-600/10 flex items-center justify-center text-blue-500 shrink-0 border border-blue-500/10">
                        <Calendar size={18} />
                      </div>
                      <div>
                         <div className="text-xs font-bold text-gray-300">Deadline</div>
                         <div className="text-sm text-gray-500 font-medium">{task.deadline ? new Date(task.deadline).toDateString() : 'Unspecified'}</div>
                      </div>
                   </div>
                   <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-600/10 flex items-center justify-center text-blue-500 shrink-0 border border-blue-500/10">
                        <CheckCircle2 size={18} />
                      </div>
                      <div>
                         <div className="text-xs font-bold text-gray-300">Status</div>
                         <div className="text-sm text-gray-500 font-medium capitalize">{task.status.replace('_', ' ')}</div>
                      </div>
                   </div>
                   <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-600/10 flex items-center justify-center text-blue-500 shrink-0 border border-blue-500/10">
                        <FileText size={18} />
                      </div>
                      <div>
                         <div className="text-xs font-bold text-gray-300">Assigned By</div>
                         <div className="text-sm text-gray-500 font-medium">{task.assignedBy?.name}</div>
                      </div>
                   </div>
                </div>
             </div>

             <div className="glass p-6 rounded-3xl border border-[#2d2d34]">
                <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 px-1 flex items-center justify-between">
                   <span>Project Metadata</span>
                   <AlertCircle size={14} className="text-blue-500" />
                </div>
                <div className="bg-[#16161a] p-4 rounded-2xl border border-[#2d2d34] text-[11px] text-gray-500 leading-relaxed font-medium">
                   This task was generated as part of a critical project milestone. Please ensure all deliverables are logged before marking as finished.
                </div>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TaskDetail;
