import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/useAuth';
import Sidebar from '../../components/Sidebar';
import { 
  FileText, 
  Search, 
  Filter, 
  User, 
  Calendar,
  ExternalLink,
  Loader2,
  Clock
} from 'lucide-react';

const HRReports = () => {
  const { token } = useAuth();
  const [reports, setReports] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [filters, setFilters] = useState({ employeeId: '', taskId: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [reportsRes, employeesRes, tasksRes] = await Promise.all([
          axios.get(`/api/reports?employeeId=${filters.employeeId}&taskId=${filters.taskId}`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get('/api/users/employees', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('/api/tasks', { headers: { Authorization: `Bearer ${token}` } })
        ]);
        setReports(reportsRes.data);
        setEmployees(employeesRes.data);
        setTasks(tasksRes.data);
      } catch (err) {
        console.error('Error fetching reporting data');
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchData();
  }, [token, filters]);

  const getProgressColor = (percent) => {
    if (percent >= 100) return 'bg-emerald-500';
    if (percent >= 70) return 'bg-blue-500';
    if (percent >= 30) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="flex min-h-screen bg-[#0a0a0c]">
      <Sidebar role="hr" />

      <main className="flex-1 p-8 overflow-y-auto">
        <header className="mb-10 lg:flex justify-between items-end">
           <div>
              <h1 className="text-4xl font-bold text-white tracking-tight">Project Momentum</h1>
              <p className="text-gray-400 mt-1 font-medium">Review all submitted progress reports and work summaries.</p>
           </div>
           
           <div className="mt-6 lg:mt-0 flex flex-wrap gap-4">
              <div className="relative min-w-[200px]">
                 <select 
                   className="w-full bg-[#16161a] border border-[#2d2d34] rounded-2xl px-5 py-2.5 text-sm text-white appearance-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                   value={filters.employeeId}
                   onChange={(e) => setFilters({...filters, employeeId: e.target.value})}
                 >
                    <option value="">All Employees</option>
                    {employees.map(e => <option key={e._id} value={e._id}>{e.name}</option>)}
                 </select>
                 <User className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600" size={14} />
              </div>
              <div className="relative min-w-[200px]">
                 <select 
                   className="w-full bg-[#16161a] border border-[#2d2d34] rounded-2xl px-5 py-2.5 text-sm text-white appearance-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                   value={filters.taskId}
                   onChange={(e) => setFilters({...filters, taskId: e.target.value})}
                 >
                    <option value="">All Tasks</option>
                    {tasks.map(t => <option key={t._id} value={t._id}>{t.title}</option>)}
                 </select>
                 <FileText className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600" size={14} />
              </div>
           </div>
        </header>

        {loading ? (
             <div className="flex items-center justify-center py-20 text-gray-500 italic anim-pulse font-medium">
                <Loader2 className="animate-spin mr-2" size={20} /> Pulling latest reports...
             </div>
        ) : (
          <div className="glass rounded-[40px] border border-[#2d2d34] overflow-hidden shadow-2xl">
             <table className="w-full border-collapse">
                <thead>
                   <tr className="bg-[#16161a]/80 border-b border-[#2d2d34]">
                      <th className="px-6 py-6 text-left text-[10px] font-bold text-gray-500 uppercase tracking-widest">Employee</th>
                      <th className="px-6 py-6 text-left text-[10px] font-bold text-gray-500 uppercase tracking-widest">Assignment</th>
                      <th className="px-6 py-6 text-left text-[10px] font-bold text-gray-500 uppercase tracking-widest">Description</th>
                      <th className="px-6 py-6 text-left text-[10px] font-bold text-gray-500 uppercase tracking-widest">Progress</th>
                      <th className="px-6 py-6 text-left text-[10px] font-bold text-gray-500 uppercase tracking-widest">Attachment</th>
                      <th className="px-6 py-6 text-left text-[10px] font-bold text-gray-500 uppercase tracking-widest">Submitted</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-[#2d2d34]/50">
                   {reports.map((report) => (
                     <tr key={report._id} className="hover:bg-white/[0.02] transition-all group">
                        <td className="px-6 py-6">
                           <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-blue-600/10 flex items-center justify-center text-blue-500 border border-blue-500/10 font-bold text-xs">
                                 {report.employeeId?.name?.[0]}
                              </div>
                              <span className="text-sm font-bold text-gray-200">{report.employeeId?.name}</span>
                           </div>
                        </td>
                        <td className="px-6 py-6">
                           <span className="text-sm font-medium text-blue-400">{report.taskId?.title}</span>
                        </td>
                        <td className="px-6 py-6">
                           <p className="text-xs text-gray-500 leading-relaxed max-w-xs group-hover:text-gray-300 transition-all font-medium">
                              {report.description}
                           </p>
                        </td>
                        <td className="px-6 py-6">
                           <div className="flex items-center gap-3 min-w-[120px]">
                              <div className="flex-1 bg-black/20 h-2 rounded-full overflow-hidden border border-white/5">
                                 <div 
                                   className={`h-full ${getProgressColor(report.progressPercent)} transition-all duration-1000`} 
                                   style={{ width: `${report.progressPercent}%` }}
                                 />
                              </div>
                              <span className="text-[10px] font-bold text-gray-400">{report.progressPercent}%</span>
                           </div>
                        </td>
                        <td className="px-6 py-6">
                           {report.attachmentUrl ? (
                             <a 
                               href={report.attachmentUrl} 
                               target="_blank" 
                               rel="noopener noreferrer"
                               className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/10 text-blue-400 text-xs font-bold hover:bg-blue-600/20 transition-all"
                             >
                               <ExternalLink size={12} /> View File
                             </a>
                           ) : (
                             <span className="text-[10px] text-gray-600 italic font-bold">None</span>
                           )}
                        </td>
                        <td className="px-6 py-6 whitespace-nowrap">
                           <div className="flex flex-col">
                              <span className="text-xs font-bold text-gray-300">{new Date(report.createdAt).toLocaleDateString()}</span>
                              <span className="text-[10px] text-gray-500 font-medium flex items-center gap-1"><Clock size={10}/> {new Date(report.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                           </div>
                        </td>
                     </tr>
                   ))}
                   {reports.length === 0 && (
                     <tr>
                        <td colSpan="6" className="px-6 py-20 text-center">
                           <div className="flex flex-col items-center gap-3">
                              <FileText className="text-gray-700" size={32} />
                              <p className="text-gray-500 italic font-medium">No progress reports match your filters.</p>
                           </div>
                        </td>
                     </tr>
                   )}
                </tbody>
             </table>
          </div>
        )}
      </main>
    </div>
  );
};

export default HRReports;
