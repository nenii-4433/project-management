import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/useAuth';
import Sidebar from '../../components/Sidebar';
import { 
  Plus, 
  Trash2, 
  Users as UsersIcon, 
  Search, 
  X, 
  UserPlus, 
  MoreVertical,
  Briefcase
} from 'lucide-react';

const Departments = () => {
  const { user, token } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [selectedDept, setSelectedDept] = useState(null);
  const [deptMembers, setDeptMembers] = useState([]);
  
  // Form states
  const [newDept, setNewDept] = useState({ name: '', description: '' });
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');

  const fetchData = async () => {
    try {
      const [deptRes, empRes] = await Promise.all([
        axios.get('/api/departments', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('/api/users/employees', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      setDepartments(deptRes.data);
      setEmployees(empRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token]);

  const handleCreateDept = async (e) => {
    e.preventDefault();
    console.log('Attempting to create department:', newDept);
    console.log('Active token:', token ? 'Present' : 'Missing');
    
    try {
      const { data } = await axios.post('/api/departments', newDept, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Department created successfully:', data);
      setNewDept({ name: '', description: '' });
      setShowCreateModal(false);
      fetchData();
    } catch (error) {
      console.error('Create Department error details:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Unknown error';
      const status = error.response?.status ? ` (Status: ${error.response.status})` : '';
      alert(`Error creating department: ${errorMsg}${status}`);
    }
  };

  const handleDeleteDept = async (id) => {
    if (!window.confirm('Are you sure you want to delete this department? This will also remove all member assignments.')) return;
    try {
      await axios.delete(`/api/departments/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
    } catch (error) {
      alert('Error deleting department');
    }
  };

  const handleViewMembers = async (dept) => {
    setSelectedDept(dept);
    try {
      const { data } = await axios.get(`/api/departments/${dept._id}/members`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDeptMembers(data);
      setShowMembersModal(true);
    } catch (error) {
      alert('Error fetching members');
    }
  };

  const handleAddMember = async () => {
    if (!selectedEmployeeId) return;
    try {
      await axios.post(`/api/departments/${selectedDept._id}/members`, { userId: selectedEmployeeId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedEmployeeId('');
      // Refresh members list
      const { data } = await axios.get(`/api/departments/${selectedDept._id}/members`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDeptMembers(data);
      fetchData(); // Refresh counts in main table
    } catch (error) {
      alert(error.response?.data?.message || 'Error adding member');
    }
  };

  const handleRemoveMember = async (userId) => {
    try {
      await axios.delete(`/api/departments/${selectedDept._id}/members/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDeptMembers(deptMembers.filter(m => m.userId._id !== userId));
      fetchData(); // Refresh counts
    } catch (error) {
      alert('Error removing member');
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0a0a0c]">
      <Sidebar role="hr" />

      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
              <Briefcase className="text-blue-500" /> Departments
            </h1>
            <p className="text-gray-400 mt-1">Organize and manage your company structure</p>
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-lg shadow-blue-600/20 active:scale-95"
          >
            <Plus size={20} /> Create Department
          </button>
        </header>

        {loading ? (
          <div className="flex items-center justify-center min-h-[400px] text-gray-500">Loading departments...</div>
        ) : (
          <div className="glass rounded-3xl border border-[#2d2d34] overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#16161a] border-b border-[#2d2d34]">
                  <th className="px-6 py-4 text-sm font-semibold text-gray-400 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-400 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-400 uppercase tracking-wider">Members</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-400 uppercase tracking-wider">Created By</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2d2d34]">
                {departments.map((dept) => (
                  <tr key={dept._id} className="hover:bg-[#16161a]/50 transition-all group">
                    <td className="px-6 py-5">
                      <div className="font-bold text-white">{dept.name}</div>
                      <div className="text-xs text-gray-500 mt-0.5">Created {new Date(dept.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-5 text-gray-400 max-w-xs truncate">{dept.description || 'No description'}</td>
                    <td className="px-6 py-5">
                      <span className="bg-blue-600/10 text-blue-400 px-3 py-1 rounded-full text-sm font-medium border border-blue-500/20">
                        {dept.memberCount} Members
                      </span>
                    </td>
                    <td className="px-6 py-5 text-gray-400 text-sm">{dept.createdByHrId?.name || 'Unknown'}</td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleViewMembers(dept)}
                          className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-all"
                          title="View Members"
                        >
                          <UsersIcon size={18} />
                        </button>
                        <button 
                          onClick={() => handleDeleteDept(dept._id)}
                          className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                          title="Delete Department"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {departments.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-10 text-center text-gray-500 italic">No departments found. Create your first one above.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="glass w-full max-w-md rounded-3xl border border-[#2d2d34] overflow-hidden fade-in shadow-2xl">
              <div className="p-6 border-b border-[#2d2d34] flex justify-between items-center bg-[#16161a]">
                <h2 className="text-xl font-bold text-white">New Department</h2>
                <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-white"><X size={20} /></button>
              </div>
              <form onSubmit={handleCreateDept} className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5 ml-1">Department Name</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-[#1e1e24] border border-[#2d2d34] rounded-xl py-3 px-4 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all"
                    placeholder="e.g. Engineering, Sales, HR"
                    value={newDept.name}
                    onChange={(e) => setNewDept({ ...newDept, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5 ml-1">Description</label>
                  <textarea
                    className="w-full bg-[#1e1e24] border border-[#2d2d34] rounded-xl py-3 px-4 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all h-32 resize-none"
                    placeholder="Describe the department's role..."
                    value={newDept.description}
                    onChange={(e) => setNewDept({ ...newDept, description: e.target.value })}
                  />
                </div>
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-600/20 transition-all active:scale-95">
                  Create Department
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Manage Members Modal */}
        {showMembersModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="glass w-full max-w-lg rounded-3xl border border-[#2d2d34] overflow-hidden fade-in shadow-2xl flex flex-col max-h-[85vh]">
              <div className="p-6 border-b border-[#2d2d34] flex justify-between items-center bg-[#16161a]">
                <div>
                  <h2 className="text-xl font-bold text-white">{selectedDept?.name} Members</h2>
                  <p className="text-xs text-gray-500 mt-0.5">{deptMembers.length} active members</p>
                </div>
                <button onClick={() => setShowMembersModal(false)} className="text-gray-400 hover:text-white"><X size={20} /></button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {deptMembers.map((member) => (
                  <div key={member._id} className="flex items-center gap-4 bg-[#16161a] p-3 rounded-2xl border border-[#2d2d34] group">
                    <div className="w-10 h-10 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold uppercase overflow-hidden">
                      {member.userId.avatarUrl ? (
                         <img src={member.userId.avatarUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        member.userId.name[0]
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-white truncate">{member.userId.name}</div>
                      <div className="text-xs text-gray-500 truncate">{member.userId.email}</div>
                    </div>
                    <button 
                      onClick={() => handleRemoveMember(member.userId._id)}
                      className="p-2 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                {deptMembers.length === 0 && (
                  <div className="text-center py-10 text-gray-500 italic">No members assigned yet.</div>
                )}
              </div>

              <div className="p-6 border-t border-[#2d2d34] bg-[#16161a]/80">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Add New Member</label>
                <div className="flex gap-2">
                  <select
                    value={selectedEmployeeId}
                    onChange={(e) => setSelectedEmployeeId(e.target.value)}
                    className="flex-1 bg-[#1e1e24] border border-[#2d2d34] rounded-xl py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all appearance-none"
                  >
                    <option value="">Select an employee...</option>
                    {employees
                      .filter(emp => !deptMembers.find(m => m.userId._id === emp._id))
                      .map(emp => (
                        <option key={emp._id} value={emp._id}>{emp.name}</option>
                      ))
                    }
                  </select>
                  <button 
                    onClick={handleAddMember}
                    disabled={!selectedEmployeeId}
                    className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-4 py-2.5 rounded-xl transition-all active:scale-95 flex items-center gap-2 font-bold"
                  >
                    <UserPlus size={18} /> Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Departments;
