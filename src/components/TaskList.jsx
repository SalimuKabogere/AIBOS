import React from 'react';
import { Droppable } from 'react-beautiful-dnd';
import TaskItem from './TaskItem';

const TaskList = ({ tasks, onTaskUpdate, onTaskDelete, showingResults }) => {
  return (
    <div className="bg-white rounded-lg border shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-black font-oswald">Tasks</h2>
        <div className="text-right">
          <span className="text-sm text-gray-500 font-oswald">
            {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
          </span>
          {showingResults && (
            <div className="text-xs text-gray-400 font-oswald mt-1">
              {showingResults}
            </div>
          )}
        </div>
      </div>
      <Droppable droppableId="tasks">
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="space-y-3"
          >
            {tasks.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-2">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <p className="text-gray-500 font-oswald">
                  No tasks found. Create your first task!
                </p>
              </div>
            ) : (
              tasks.map((task, index) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  index={index}
                  onUpdate={onTaskUpdate}
                  onDelete={onTaskDelete}
                />
              ))
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default TaskList;