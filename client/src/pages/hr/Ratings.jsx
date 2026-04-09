import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/useAuth';
import { Star, Loader2 } from 'lucide-react';

const Ratings = () => {
  const { token } = useAuth();
  const [ratings, setRatings] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedTask, setSelectedTask] = useState('');
  const [score, setScore] = useState(0);
  const [hoveredScore, setHoveredScore] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, [token]);

  const fetchInitialData = async () => {
    try {
      const [ratingsRes, employeesRes] = await Promise.all([
        axios.get('/api/ratings', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('/api/employees', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setRatings(ratingsRes.data);
      setEmployees(employeesRes.data);
    } catch (err) {
      console.error('Error fetching initial data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedEmployee) {
      const fetchTasks = async () => {
        try {
          const { data } = await axios.get(`/api/tasks/employee/${selectedEmployee}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setTasks(data);
        } catch (err) {
          console.error('Error fetching employee tasks', err);
          setTasks([]);
        }
      };
      fetchTasks();
    } else {
      setTasks([]);
      setSelectedTask('');
    }
  }, [selectedEmployee, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEmployee || score === 0) return;
    
    setSubmitting(true);
    try {
      await axios.post('/api/ratings', {
        employeeId: selectedEmployee,
        taskId: selectedTask || null,
        score,
        feedback
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Reset form on success
      setSelectedEmployee('');
      setSelectedTask('');
      setScore(0);
      setFeedback('');
      // Refresh list
      fetchInitialData();
    } catch (err) {
      console.error('Error submitting rating', err);
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (ratingValue, interactive = false) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={interactive ? 28 : 16}
            className={`transition-all ${interactive ? 'cursor-pointer' : ''} ${
              (interactive ? (hoveredScore || score) >= star : ratingValue >= star)
                ? 'fill-yellow-500 text-yellow-500'
                : 'fill-transparent text-gray-600'
            }`}
            onMouseEnter={() => interactive && setHoveredScore(star)}
            onMouseLeave={() => interactive && setHoveredScore(0)}
            onClick={() => interactive && setScore(star)}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-black text-white italic tracking-tight">Performance Ratings</h1>
        <p className="text-gray-400 mt-2 font-medium">Evaluate employees and review historical ratings.</p>
      </header>

      {/* Submission Form */}
      <section className="glass border border-white/5 p-8 rounded-3xl">
        <h2 className="text-xl font-bold text-white mb-6">Submit Rating</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">Select Employee *</label>
              <select
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                required
                className="w-full bg-[#16161a] border border-[#2d2d34] rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="">Choose an employee...</option>
                {employees.map(emp => (
                  <option key={emp._id} value={emp._id}>{emp.name} ({emp.email})</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">Select Task (Optional)</label>
              <select
                value={selectedTask}
                onChange={(e) => setSelectedTask(e.target.value)}
                disabled={!selectedEmployee || tasks.length === 0}
                className="w-full bg-[#16161a] border border-[#2d2d34] rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50"
              >
                <option value="">No task selected / General review</option>
                {tasks.map(task => (
                  <option key={task._id} value={task._id}>{task.title}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">Score (1-5) *</label>
            {renderStars(score, true)}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">Feedback</label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Provide constructive feedback..."
              className="w-full bg-[#16161a] border border-[#2d2d34] rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 min-h-[100px]"
            />
          </div>

          <button
            type="submit"
            disabled={submitting || !selectedEmployee || score === 0}
            className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-500 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            {submitting ? <Loader2 className="animate-spin" size={20} /> : 'Submit Performance Rating'}
          </button>
        </form>
      </section>

      {/* Ratings History Table */}
      <section className="glass border border-white/5 rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-[#2d2d34]">
          <h2 className="text-xl font-bold text-white">Global Ratings History</h2>
        </div>
        
        {loading ? (
          <div className="p-8 flex justify-center text-gray-600"><Loader2 className="animate-spin" size={32} /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-400">
              <thead className="bg-[#111114] text-gray-500 uppercase font-bold text-xs">
                <tr>
                  <th className="px-6 py-4">Employee</th>
                  <th className="px-6 py-4">Task Evaluated</th>
                  <th className="px-6 py-4">Score</th>
                  <th className="px-6 py-4">Feedback</th>
                  <th className="px-6 py-4">Evaluator</th>
                  <th className="px-6 py-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2d2d34]">
                {ratings.map(rating => (
                  <tr key={rating._id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-white font-bold">{rating.employeeId?.name || 'Unknown'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-300 max-w-[200px] truncate">{rating.taskId?.title || 'General Review'}</div>
                    </td>
                    <td className="px-6 py-4">
                      {renderStars(rating.score)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-400 max-w-xs line-clamp-2 italic">"{rating.feedback}"</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-600/20 text-blue-500 flex items-center justify-center font-bold text-[10px] uppercase">
                          {rating.ratedByHrId?.name?.[0] || 'A'}
                        </div>
                        <span className="text-xs font-bold text-gray-300">{rating.ratedByHrId?.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium">
                      {new Date(rating.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {ratings.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500 italic">No ratings found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default Ratings;
