import React, { useState, useEffect } from 'react';
import { tasksService } from '../services/tasksService';

const CompletedTasks = () => {
  const [completedTasks, setCompletedTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCompletedTasks();
  }, []);

  const loadCompletedTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await tasksService.getTasks({ completed: true });
      const raw = data.results || data || [];
      const normalized = (raw || []).map(t => ({
        ...t,
        completed: !!(t.completed || t.is_completed || (t.status === 'completed') || (t.progress === 100)),
        is_completed: !!(t.is_completed || t.completed || (t.status === 'completed')),
        category: t.category_name || t.category || (t.category_obj && t.category_obj.name) || t.category,
        id: t.id || t.pk || t.task_id,
      }));

      setCompletedTasks(normalized.filter(task => task.completed));
    } catch (error) {
      console.error('Error loading completed tasks:', error);
      setError(error.message);
      // Fallback demo data
      setCompletedTasks([
        {
          id: 1,
          title: 'Sample completed task',
          description: 'This is a demo completed task',
          priority: 'medium',
          category: 'Work',
          completed: true,
          completed_at: '2024-01-20',
          created_at: '2024-01-15'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleUncompleteTask = async (taskId) => {
    try {
      await tasksService.toggleComplete(taskId);
      loadCompletedTasks();
    } catch (error) {
      console.error('Error uncompleting task:', error);
      alert('Error updating task. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold text-black font-oswald mb-4">Completed Tasks</h2>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black" aria-hidden="true"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-black font-oswald">Completed Tasks</h2>
          <p className="text-gray-600 font-oswald mt-1">
            {completedTasks.length} task{completedTasks.length !== 1 ? 's' : ''} completed
          </p>
        </div>
        <button
          onClick={loadCompletedTasks}
          className="px-4 py-2 bg-black text-white rounded-lg hover:opacity-90 transition-colors font-oswald"
        >
          Refresh
        </button>
      </div>

      {/* Completed Tasks List */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        {completedTasks.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 font-oswald mb-2">No completed tasks</h3>
            <p className="text-gray-600 font-oswald">Complete some tasks to see them here!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {completedTasks.map(task => (
              <div key={task.id} className="border rounded-lg p-4 bg-white border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {/* Completed Checkbox */}
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={true}
                        onChange={() => handleUncompleteTask(task.id)}
                        className="w-5 h-5 text-black border-gray-300 rounded focus:ring-black"
                        aria-label={`Uncomplete ${task.title}`}
                      />
                      <svg className="w-4 h-4 text-black ml-1" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    
                    {/* Task Info */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 font-oswald">
                        {task.title}
                      </h3>
                      {task.description && (
                        <p className="text-gray-600 text-sm font-oswald">{task.description}</p>
                      )}
                    </div>
                  </div>

                  {/* Task Meta */}
                  <div className="text-right">
                    <div className="flex items-center space-x-2 mb-1">
                      {/* Priority Badge */}
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        task.priority === 'high' ? 'bg-gray-100 text-gray-900' :
                        task.priority === 'medium' ? 'bg-gray-100 text-gray-900' :
                        'bg-gray-100 text-gray-900'
                      }`}>
                        {task.priority}
                      </span>
                      
                      {/* Category Badge */}
                      {task.category && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-900 rounded text-xs font-oswald">
                          {task.category_name || task.category}
                        </span>
                      )}
                    </div>
                    
                    {/* Completion Date */}
                    <p className="text-xs text-gray-500 font-oswald">
                      Completed: {task.completed_at ? new Date(task.completed_at).toLocaleDateString() : 'Today'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Statistics */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 font-oswald mb-4">Completion Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-black">{completedTasks.length}</div>
            <div className="text-sm text-gray-600 font-oswald">Total Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-black">
              {completedTasks.filter(t => t.priority === 'high').length}
            </div>
            <div className="text-sm text-gray-600 font-oswald">High Priority</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-black">
              {new Set(completedTasks.map(t => t.category).filter(Boolean)).size}
            </div>
            <div className="text-sm text-gray-600 font-oswald">Categories</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompletedTasks;