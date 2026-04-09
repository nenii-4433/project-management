import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/useAuth';
import Sidebar from '../../components/Sidebar';
import { 
  Plus, 
  Search, 
  UserPlus, 
  Trash2, 
  ShieldCheck, 
  ShieldAlert,
  Star,
  MessageSquare,
  X,
  Send,
  Loader2
} from 'lucide-react';

const Employees = () => {
  const { token } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRateModal, setShowRateModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  
  // States for Adding Employee
  const [newEmp, setNewEmp] = useState({ name: '', email: '', password: '', departmentId: '' });
  const [departments, setDepartments] = useState([]);

  // States for Rating
  const [ratingData, setRatingData] = useState({ score: 5, feedback: '' });
  const [ratingLoading, setRatingLoading] = useState(false);

  const fetchEmployees = async () => {
    try {
      const { data } = await axios.get('/api/employees', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEmployees(data);
    } catch (err) {
      console.error('Error fetching employees');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchDepts = async () => {
      try {
        const { data } = await axios.get('/api/departments', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setDepartments(data);
      } catch (err) {
        console.error('Error fetching departments');
      }
    };
    if (token) {
      fetchEmployees();
      fetchDepts();
    }
  }, [token]);

  const handleToggleStatus = async (id) => {
    try {
      await axios.patch(`/api/employees/${id}/toggle-status`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchEmployees();
    } catch (err) {
      alert('Error updating status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this employee? This will also remove their department memberships.')) return;
    try {
      await axios.delete(`/api/employees/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchEmployees();
    } catch (err) {
      alert('Error deleting employee');
    }
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/employees', newEmp, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowAddModal(false);
      setNewEmp({ name: '', email: '', password: '', departmentId: '' });
      fetchEmployees();
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating employee');
    }
  };

  const handleRateEmployee = async (e) => {
    e.preventDefault();
    setRatingLoading(true);
    try {
      await axios.post('/api/ratings', {
        employeeId: selectedEmployee._id,
        score: ratingData.score,
        feedback: ratingData.feedback
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowRateModal(false);
      setRatingData({ score: 5, feedback: '' });
      fetchEmployees();
    } catch (err) {
      alert('Error submitting rating');
    } finally {
      setRatingLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0a0a0c]">
      <Sidebar role="hr" />

      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-bold text-white tracking-tight">Workforce Directory</h1>
            <p className="text-gray-400 mt-1 font-medium">Manage your team members and monitor their performance.</p>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-600/20 active:scale-95"
          >
            <UserPlus size={20} /> Onboard Employee
          </button>
        </header>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-500 italic">Syncing with server...</div>
        ) : (
          <div className="glass rounded-[40px] border border-[#2d2d34] overflow-hidden">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#16161a]/80 border-b border-[#2d2d34]">
                  <th className="px-6 py-6 text-left text-[10px] font-bold text-gray-500 uppercase tracking-widest">Employee</th>
                  <th className="px-6 py-6 text-left text-[10px] font-bold text-gray-500 uppercase tracking-widest">Department</th>
                  <th className="px-6 py-6 text-left text-[10px] font-bold text-gray-500 uppercase tracking-widest">Performance</th>
                  <th className="px-6 py-6 text-left text-[10px] font-bold text-gray-500 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-6 text-right text-[10px] font-bold text-gray-500 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2d2d34]/50 text-sm">
                {employees.map((emp) => (
                  <tr key={emp._id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold uppercase">
                          {emp.name[0]}
                        </div>
                        <div>
                          <div className="text-white font-bold">{emp.name}</div>
                          <div className="text-xs text-gray-500 font-medium">{emp.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6 text-gray-400 font-medium">{emp.departmentName}</td>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-1.5">
                        <Star className="text-yellow-500 fill-yellow-500" size={14} />
                        <span className="text-white font-bold">{emp.averageRating > 0 ? emp.averageRating : 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                        emp.isActive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}>
                        {emp.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        <button 
                          onClick={() => { setSelectedEmployee(emp); setShowRateModal(true); }}
                          title="Rate Employee"
                          className="p-2.5 rounded-xl bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 hover:bg-yellow-500 hover:text-white transition-all"
                        >
                          <Star size={18} />
                        </button>
                        <button 
                          onClick={() => handleToggleStatus(emp._id)}
                          className={`p-2.5 rounded-xl transition-all border ${
                            emp.isActive ? 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500 hover:text-white' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500 hover:text-white'
                          }`}
                        >
                          {emp.isActive ? <ShieldAlert size={18} /> : <ShieldCheck size={18} />}
                        </button>
                        <button 
                          onClick={() => handleDelete(emp._id)}
                          className="p-2.5 rounded-xl bg-gray-500/10 text-gray-400 border border-gray-500/20 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Add Employee Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="glass w-full max-w-lg rounded-[40px] border border-[#2d2d34] overflow-hidden shadow-2xl animate-in zoom-in duration-300">
              <div className="p-8 border-b border-[#2d2d34] flex justify-between items-center">
                <h3 className="text-2xl font-bold text-white flex items-center gap-3"><UserPlus className="text-blue-500" /> Onboard Employee</h3>
                <button onClick={() => setShowAddModal(false)} className="text-gray-500 hover:text-white transition-all"><X size={24}/></button>
              </div>
              <form onSubmit={handleAddEmployee} className="p-8 space-y-6">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Full Name</label>
                  <input required className="w-full bg-[#16161a] border border-[#2d2d34] rounded-2xl px-5 py-3.5 text-white focus:ring-2 focus:ring-blue-500/20 transition-all font-medium" placeholder="E.g. John Doe" value={newEmp.name} onChange={e => setNewEmp({...newEmp, name: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Email Address</label>
                  <input required className="w-full bg-[#16161a] border border-[#2d2d34] rounded-2xl px-5 py-3.5 text-white focus:ring-2 focus:ring-blue-500/20 transition-all font-medium" type="email" placeholder="john@company.com" value={newEmp.email} onChange={e => setNewEmp({...newEmp, email: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-6">
                   <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Temporary Password</label>
                      <input required className="w-full bg-[#16161a] border border-[#2d2d34] rounded-2xl px-5 py-3.5 text-white focus:ring-2 focus:ring-blue-500/20 transition-all font-medium" type="password" value={newEmp.password} onChange={e => setNewEmp({...newEmp, password: e.target.value})} />
                   </div>
                   <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Department</label>
                      <select required className="w-full bg-[#16161a] border border-[#2d2d34] rounded-2xl px-5 py-3.5 text-white appearance-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium" value={newEmp.departmentId} onChange={e => setNewEmp({...newEmp, departmentId: e.target.value})}>
                         <option value="">Select Dept</option>
                         {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                      </select>
                   </div>
                </div>
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-2xl py-4 font-bold transition-all shadow-lg shadow-blue-600/20 active:scale-95">Complete Onboarding</button>
              </form>
            </div>
          </div>
        )}

        {/* Rate Employee Modal */}
        {showRateModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
             <div className="glass w-full max-w-lg rounded-[40px] border border-[#2d2d34] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
                <div className="p-8 border-b border-[#2d2d34] flex justify-between items-center">
                   <h3 className="text-2xl font-bold text-white flex items-center gap-3"><Star className="text-yellow-500" /> Performance Review</h3>
                   <button onClick={() => setShowRateModal(false)} className="text-gray-500 hover:text-white transition-all"><X size={24}/></button>
                </div>
                <form onSubmit={handleRateEmployee} className="p-8 space-y-8">
                   <div className="bg-[#16161a] p-6 rounded-3xl border border-[#2d2d34] flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold">
                         {selectedEmployee?.name?.[0]}
                      </div>
                      <div>
                         <div className="text-white font-bold">{selectedEmployee?.name}</div>
                         <div className="text-xs text-gray-500 font-medium">{selectedEmployee?.email}</div>
                      </div>
                   </div>

                   <div className="text-center">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6 block">Target Performance Score</label>
                      <div className="flex justify-center gap-4">
                         {[1, 2, 3, 4, 5].map((star) => (
                           <button 
                             key={star}
                             type="button"
                             onClick={() => setRatingData({...ratingData, score: star})}
                             className={`p-1.5 transition-all duration-300 hover:scale-125 ${ratingData.score >= star ? 'text-yellow-500' : 'text-gray-700'}`}
                           >
                             <Star size={36} fill={ratingData.score >= star ? 'currentColor' : 'none'} />
                           </button>
                         ))}
                      </div>
                      <div className="mt-4 text-xs font-bold text-yellow-500 uppercase tracking-widest">
                        {ratingData.score === 5 ? 'Exceptional Execution' : 
                         ratingData.score === 4 ? 'Solid Contribution' :
                         ratingData.score === 3 ? 'Meets Expectations' :
                         ratingData.score === 2 ? 'Needs Focus' : 'Underperforming'}
                      </div>
                   </div>

                   <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 block px-1">Supervisor Feedback</label>
                      <textarea 
                        required
                        placeholder="Detail specific instances of good work or areas requiring attention..."
                        className="w-full bg-[#16161a] border border-[#2d2d34] rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-yellow-500/20 transition-all font-medium leading-relaxed"
                        rows="4"
                        value={ratingData.feedback}
                        onChange={e => setRatingData({...ratingData, feedback: e.target.value})}
                      />
                   </div>

                   <button 
                     type="submit" 
                     disabled={ratingLoading}
                     className="w-full bg-yellow-500 hover:bg-yellow-400 text-black rounded-2xl py-4 font-bold transition-all shadow-lg shadow-yellow-500/10 active:scale-95 flex items-center justify-center gap-2"
                   >
                     {ratingLoading ? <Loader2 className="animate-spin" /> : <><Send size={18} /> Publish Official Review</>}
                   </button>
                </form>
             </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Employees;
