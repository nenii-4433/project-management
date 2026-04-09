import React from 'react'
import { MoreVertical, Plus } from 'lucide-react'
import TaskCard from './TaskCard'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useDroppable } from '@dnd-kit/core'

function Column({ id, title, tasks }) {
  const { setNodeRef } = useDroppable({ id })

  return (
    <div className="flex flex-col min-w-[280px] w-[320px] max-h-full">
      <div className="flex items-center justify-between mb-4 group">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold text-sm text-[#f8fafc]">{title}</h2>
          <span className="bg-[#16161a] px-2 py-0.5 rounded-full text-[10px] font-bold text-[#94a3b8] border border-[#2d2d34]">
            {tasks.length}
          </span>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="p-1 hover:bg-[#16161a] rounded-md text-[#94a3b8] transition-colors">
            <Plus size={14} />
          </button>
          <button className="p-1 hover:bg-[#16161a] rounded-md text-[#94a3b8] transition-colors">
            <MoreVertical size={14} />
          </button>
        </div>
      </div>

      <div 
        ref={setNodeRef} 
        className="flex-1 flex flex-col gap-3 p-1 overflow-y-auto scrollbar-hide min-h-[150px]"
      >
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </SortableContext>
      </div>
    </div>
  )
}

export default Column
