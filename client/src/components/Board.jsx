import React, { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import Column from './Column'
import { DndContext, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable'

const INITIAL_DATA = {
  tasks: {
    'task-1': { id: 'task-1', content: 'Design System', description: 'Create a cohesive design system for the app.', tags: ['Design', 'UI'] },
    'task-2': { id: 'task-2', content: 'Database Schema', description: 'Define the SQL schema for the backend.', tags: ['Backend'] },
    'task-3': { id: 'task-3', content: 'API Integration', description: 'Connect the frontend to the REST API.', tags: ['Frontend'] },
    'task-4': { id: 'task-4', content: 'Authentication', description: 'Implement JWT based auth.', tags: ['Security'] },
    'task-5': { id: 'task-5', content: 'Board Logic', description: 'Add drag and drop support.', tags: ['Feature'] },
  },
  columns: {
    'column-1': { id: 'column-1', title: 'To Do', taskIds: ['task-1', 'task-2'] },
    'column-2': { id: 'column-2', title: 'In Progress', taskIds: ['task-3', 'task-4'] },
    'column-3': { id: 'column-3', title: 'Done', taskIds: ['task-5'] },
  },
  columnOrder: ['column-1', 'column-2', 'column-3'],
}

function Board() {
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem('stellar-kanban-data')
    return saved ? JSON.parse(saved) : INITIAL_DATA
  })

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  useEffect(() => {
    localStorage.setItem('stellar-kanban-data', JSON.stringify(data))
  }, [data])

  useEffect(() => {
    const handleAddTask = (e) => {
      const newTask = e.detail
      setData(prev => ({
        ...prev,
        tasks: {
          ...prev.tasks,
          [newTask.id]: newTask
        },
        columns: {
          ...prev.columns,
          ['column-1']: {
            ...prev.columns['column-1'],
            taskIds: [newTask.id, ...prev.columns['column-1'].taskIds]
          }
        }
      }))
    }

    window.addEventListener('addTask', handleAddTask)
    return () => window.removeEventListener('addTask', handleAddTask)
  }, [])

  const findColumn = (id) => {
    if (data.columns[id]) return data.columns[id]
    return Object.values(data.columns).find(col => col.taskIds.includes(id))
  }

  const onDragOver = (event) => {
    const { active, over } = event
    if (!over) return

    const activeId = active.id
    const overId = over.id

    const activeColumn = findColumn(activeId)
    const overColumn = findColumn(overId)

    if (!activeColumn || !overColumn || activeColumn === overColumn) return

    setData(prev => {
      const activeTaskIds = [...prev.columns[activeColumn.id].taskIds]
      const overTaskIds = [...prev.columns[overColumn.id].taskIds]

      const activeIndex = activeTaskIds.indexOf(activeId)
      const overIndex = overTaskIds.indexOf(overId)

      let newIndex
      if (prev.columns[overId]) {
        newIndex = overTaskIds.length
      } else {
        const isBelowOverItem =
          over &&
          active.rect.current.translated &&
          active.rect.current.translated.top >
            over.rect.top + over.rect.height

        const modifier = isBelowOverItem ? 1 : 0
        newIndex = overIndex >= 0 ? overIndex + modifier : overTaskIds.length
      }

      return {
        ...prev,
        columns: {
          ...prev.columns,
          [activeColumn.id]: {
            ...prev.columns[activeColumn.id],
            taskIds: activeTaskIds.filter(id => id !== activeId)
          },
          [overColumn.id]: {
            ...prev.columns[overColumn.id],
            taskIds: [
              ...overTaskIds.slice(0, newIndex),
              activeId,
              ...overTaskIds.slice(newIndex)
            ]
          }
        }
      }
    })
  }

  const onDragEnd = (event) => {
    const { active, over } = event
    if (!over) return

    const activeId = active.id
    const overId = over.id

    const activeColumn = findColumn(activeId)
    const overColumn = findColumn(overId)

    if (!activeColumn || !overColumn || activeColumn !== overColumn) return

    const activeIndex = activeColumn.taskIds.indexOf(activeId)
    const overIndex = activeColumn.taskIds.indexOf(overId)

    if (activeIndex !== overIndex) {
      setData(prev => ({
        ...prev,
        columns: {
          ...prev.columns,
          [activeColumn.id]: {
            ...prev.columns[activeColumn.id],
            taskIds: arrayMove(prev.columns[activeColumn.id].taskIds, activeIndex, overIndex)
          }
        }
      }))
    }
  }

  return (
    <div className="flex gap-6 h-full items-start overflow-x-auto pb-4">
      <DndContext 
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
      >
        {data.columnOrder.map((columnId) => {
          const column = data.columns[columnId]
          const tasks = column.taskIds.map((taskId) => data.tasks[taskId])

          return (
            <Column 
              key={column.id} 
              id={column.id} 
              title={column.title} 
              tasks={tasks} 
            />
          )
        })}
      </DndContext>

      <button className="flex items-center gap-2 px-4 py-3 rounded-xl border border-dashed border-[#2d2d34] bg-[#16161a]/30 text-[#94a3b8] hover:text-[#f8fafc] hover:border-blue-500 hover:bg-[#16161a] transition-all min-w-[280px]">
        <Plus size={18} />
        <span className="font-medium">Add Column</span>
      </button>
    </div>
  )
}

export default Board
