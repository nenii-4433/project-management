import React, { useState } from 'react'
import { X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

function TaskModal({ isOpen, onClose, onSave, task = null }) {
  const [content, setContent] = useState(task?.content || '')
  const [description, setDescription] = useState(task?.description || '')
  const [tags, setTags] = useState(task?.tags?.join(', ') || '')

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({
      id: task?.id || `task-${Date.now()}`,
      content,
      description,
      tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag !== ''),
    })
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-[#16161a] border border-[#2d2d34] rounded-2xl shadow-2xl p-8 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-[#f8fafc]">
                {task ? 'Edit Task' : 'Create New Task'}
              </h2>
              <button 
                onClick={onClose}
                className="p-1 hover:bg-[#2d2d34] rounded-lg text-[#94a3b8] transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[#94a3b8] mb-2">Title</label>
                <input 
                  autoFocus
                  type="text" 
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="What needs to be done?"
                  className="w-full bg-[#0a0a0c] border border-[#2d2d34] rounded-xl px-4 py-3 text-[#f8fafc] focus:outline-none focus:border-blue-500 transition-colors placeholder:text-[#4a4a55]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#94a3b8] mb-2">Description</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add more details..."
                  className="w-full bg-[#0a0a0c] border border-[#2d2d34] rounded-xl px-4 py-3 text-[#f8fafc] focus:outline-none focus:border-blue-500 transition-colors placeholder:text-[#4a4a55] min-h-[120px] resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#94a3b8] mb-2">Tags (comma separated)</label>
                <input 
                  type="text" 
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="Design, Feature, Bug"
                  className="w-full bg-[#0a0a0c] border border-[#2d2d34] rounded-xl px-4 py-3 text-[#f8fafc] focus:outline-none focus:border-blue-500 transition-colors placeholder:text-[#4a4a55]"
                />
              </div>

              <div className="flex justify-end gap-4 mt-8">
                <button 
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl text-sm font-medium text-[#f8fafc] hocus:bg-[#2d2d34] transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors shadow-lg shadow-blue-500/20"
                >
                  {task ? 'Save Changes' : 'Create Task'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default TaskModal
