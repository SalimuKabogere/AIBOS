import React from 'react';
import { Draggable } from 'react-beautiful-dnd';

const TaskItem = ({ task, index, onUpdate, onDelete }) => {
  const handleToggleComplete = () => {
    onUpdate(task.id, { ...task, completed: !task.completed });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500 bg-red-50';
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'low':
        return 'border-l-green-500 bg-green-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  const getPriorityBadgeColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  return (
    <Draggable draggableId={task.id.toString()} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`p-4 border-l-4 rounded-r-lg transition-all duration-200 border bg-white ${
            getPriorityColor(task.priority)
          } ${
            snapshot.isDragging ? 'shadow-lg transform rotate-1' : 'shadow-sm hover:shadow-md'
          } ${task.completed ? 'opacity-60' : ''}`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3 flex-1">
              <input
                type="checkbox"
                checked={task.completed}
                onChange={handleToggleComplete}
                className="w-5 h-5 text-black rounded focus:ring-black mt-0.5"
              />
              <div className="flex-1 min-w-0">
                <h3
                  className={`font-medium font-oswald ${
                    task.completed
                      ? 'line-through text-gray-500'
                      : 'text-gray-900'
                  }`}
                >
                  {task.title}
                </h3>
                {task.description && (
                  <p
                    className={`text-sm mt-1 font-oswald ${
                      task.completed ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    {task.description}
                  </p>
                )}
                {task.due_date && (
                  <p className="text-xs text-gray-500 mt-1 font-oswald">
                    Due: {new Date(task.due_date).toLocaleDateString()}
                  </p>
                )}
                {task.created_at && (
                  <p className="text-xs text-gray-400 mt-1 font-oswald">
                    Created: {new Date(task.created_at).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-3 ml-4">
              <span
                className={`text-xs px-3 py-1 rounded-full font-medium font-oswald ${
                  getPriorityBadgeColor(task.priority)
                }`}
              >
                {task.priority.toUpperCase()}
              </span>
              <button
                onClick={() => onDelete(task.id)}
                className="text-gray-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition-colors"
                aria-label="Delete task"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
              <div className="cursor-move text-gray-300 hover:text-gray-500">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 8h16M4 16h16"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default TaskItem;