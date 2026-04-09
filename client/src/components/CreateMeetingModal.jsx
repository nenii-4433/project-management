import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Users, MessageSquare, Video, Loader2, Check } from 'lucide-react';

const CreateMeetingModal = ({ isOpen, onClose, onCreated, token }) => {
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    departmentId: '',
    invitedUsers: []
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [deptRes, empRes] = await Promise.all([
          axios.get('/api/departments', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('/api/employees', { headers: { Authorization: `Bearer ${token}` } })
        ]);
        setDepartments(deptRes.data);
        setEmployees(empRes.data);
      } catch (err) {
        console.error('Error fetching data for meeting modal');
      }
    };
    if (isOpen) fetchData();
  }, [isOpen, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const roomId = `NexFlow-${Math.random().toString(36).substring(2, 9)}`;
      const { data } = await axios.post('/api/meetings', {
        ...formData,
        roomId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      onCreated(data);
      onClose();
    } catch (err) {
      console.error('Failed to create meeting');
    } finally {
      setLoading(false);
    }
  };

  const toggleUserSelection = (userId) => {
    setFormData(prev => {
      const isSelected = prev.invitedUsers.includes(userId);
      return {
        ...prev,
        invitedUsers: isSelected 
          ? prev.invitedUsers.filter(id => id !== userId) 
          : [...prev.invitedUsers, userId]
      };
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-[#111114] border border-[#2d2d34] w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="p-6 border-b border-[#2d2d34] flex justify-between items-center bg-[#16161a]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/20 text-blue-500 flex items-center justify-center">
              <Video size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white leading-tight">Host Video Call</h2>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Start a secure session</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[#2d2d34] rounded-xl text-gray-500 transition-all">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto scrollbar-hide">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest px-1">Meeting Title</label>
            <input 
              type="text"
              required
              placeholder="e.g., Weekly Sync or Performance Review"
              className="w-full bg-[#16161a] border border-[#2d2d34] rounded-2xl p-4 text-white placeholder-gray-600 outline-none focus:border-blue-500/50 transition-all font-medium"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest px-1">Department (Optional)</label>
              <select 
                className="w-full bg-[#16161a] border border-[#2d2d34] rounded-2xl p-4 text-white outline-none appearance-none focus:border-blue-500/50 transition-all font-medium"
                value={formData.departmentId}
                onChange={(e) => setFormData({...formData, departmentId: e.target.value})}
              >
                <option value="">Select a department</option>
                {departments.map(dept => (
                  <option key={dept._id} value={dept._id}>{dept.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest px-1 flex items-center justify-between">
                Individual Invitees
                <span className="text-[10px] text-blue-500 lowercase font-normal">{formData.invitedUsers.length} selected</span>
              </label>
              <div className="w-full h-[150px] bg-[#16161a] border border-[#2d2d34] rounded-2xl p-3 overflow-y-auto space-y-1 scrollbar-hide">
                {employees.map(emp => (
                  <label 
                    key={emp._id}
                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                      formData.invitedUsers.includes(emp._id) ? 'bg-blue-600/10 border border-blue-500/20' : 'hover:bg-[#2d2d34]/50 border border-transparent'
                    }`}
                  >
                    <input 
                      type="checkbox" 
                      className="hidden"
                      checked={formData.invitedUsers.includes(emp._id)}
                      onChange={() => toggleUserSelection(emp._id)}
                    />
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                      formData.invitedUsers.includes(emp._id) ? 'bg-blue-500 border-blue-500' : 'border-[#2d2d34] bg-transparent'
                    }`}>
                      {formData.invitedUsers.includes(emp._id) && <Check size={10} className="text-white" />}
                    </div>
                    <span className={`text-sm font-medium ${formData.invitedUsers.includes(emp._id) ? 'text-blue-400' : 'text-gray-400'}`}>
                      {emp.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="p-6 bg-blue-600/5 rounded-3xl border border-blue-500/10 flex items-start gap-4">
             <div className="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-500 flex items-center justify-center shrink-0">
                <Users size={16} />
             </div>
             <p className="text-xs text-blue-400/80 leading-relaxed font-medium">
               Inviting a department will automatically notify every member assigned to that workspace. You can also pick specific individuals from others departments manually.
             </p>
          </div>

          <button 
            type="submit"
            disabled={loading || !formData.title}
            className={`w-full py-5 rounded-[30px] font-black uppercase tracking-widest text-sm transition-all shadow-xl shadow-blue-600/10 ${
              loading || !formData.title ? 'bg-[#2d2d34] text-gray-600' : 'bg-blue-600 text-white hover:bg-blue-500 active:scale-95'
            }`}
          >
            {loading ? <div className="flex items-center justify-center gap-2 italic font-bold">Synchronizing Host... <Loader2 className="animate-spin" size={16}/></div> : 'Initialize Meeting'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateMeetingModal;
