import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { MessageSquare, Paperclip, MoreHorizontal } from 'lucide-react'

function TaskCard({ task }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-[#16161a] border border-[#2d2d34] rounded-xl p-4 shadow-xl hover:border-blue-500/50 transition-all cursor-grab active:cursor-grabbing group min-h-[120px] flex flex-col ${
        isDragging ? 'shadow-blue-500/10' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-3 text-[10px] font-bold uppercase tracking-wider text-[#94a3b8]">
        <div className="flex gap-2">
          {task.tags.map(tag => (
            <span key={tag} className="bg-[#1f2025] px-2 py-0.5 rounded-md text-blue-400 border border-[#2d2d34]">
              {tag}
            </span>
          ))}
        </div>
        <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-[#1f2025] rounded-md">
          <MoreHorizontal size={14} />
        </button>
      </div>

      <h3 className="font-semibold text-[14px] text-[#f8fafc] mb-2 leading-tight">
        {task.content}
      </h3>
      <p className="text-[13px] text-[#94a3b8] mb-4 line-clamp-2 leading-snug">
        {task.description}
      </p>

      <div className="mt-auto pt-3 border-t border-[#2d2d34] flex items-center justify-between text-[#94a3b8]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <MessageSquare size={14} />
            <span className="text-[11px] font-medium">3</span>
          </div>
          <div className="flex items-center gap-1">
            <Paperclip size={14} />
            <span className="text-[11px] font-medium">1</span>
          </div>
        </div>
        
        <div className="flex -space-x-1">
          {[1, 2].map(i => (
            <div key={i} className="w-5 h-5 rounded-full border-2 border-[#16161a] bg-gradient-to-tr from-blue-600 to-cyan-400"></div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default TaskCard
