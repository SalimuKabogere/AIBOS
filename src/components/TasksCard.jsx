import React, { useState, useEffect } from 'react';
import { tasksService } from '../services/tasksService';

const TasksCard = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentTasks();
  }, []);

  const fetchRecentTasks = async () => {
    try {
      setLoading(true);
      // First try without filters to see if we get any data
      const response = await tasksService.getTasks({});
      console.log('TasksCard response:', response);
      console.log('TasksCard response type:', typeof response, Array.isArray(response));
      
      // Handle different response structures
      let allTasks = [];
      if (Array.isArray(response)) {
        allTasks = response;
      } else if (response.results) {
        allTasks = response.results;
      } else if (response.data?.results) {
        allTasks = response.data.results;
      } else if (response.data && Array.isArray(response.data)) {
        allTasks = response.data;
      }
      
      console.log('TasksCard raw data:', allTasks);
      
        // Normalize tasks and filter pending tasks client-side and limit to 5
        const normalized = allTasks.map(t => ({
          ...t,
          completed: !!(t.completed || t.is_completed || (t.status === 'completed') || (t.progress === 100)),
          is_completed: !!(t.is_completed || t.completed || (t.status === 'completed')),
          category: t.category_name || (t.category_obj && t.category_obj.name) || t.category,
          id: t.id || t.pk || t.task_id,
        }));

        const pendingTasks = normalized.filter(task => !task.completed).slice(0, 5);
      console.log('TasksCard filtered tasks:', pendingTasks);
      
      setTasks(pendingTasks);
    } catch (error) {
      console.error('Error fetching recent tasks:', error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleTaskComplete = async (taskId, currentStatus) => {
    try {
      await tasksService.toggleComplete(taskId);
      // Refresh the task list
      fetchRecentTasks();
    } catch (error) {
      console.error('Error toggling task:', error);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-black font-bold';
      case 'medium': return 'text-gray-700 font-medium';
      case 'low': return 'text-gray-500';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-black font-oswald">Recent Tasks</h3>
        <div className="text-sm text-gray-500 font-oswald">
          Pending
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="text-gray-500 font-oswald">Loading tasks...</div>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">✅</div>
              <p className="text-gray-500 font-oswald">No pending tasks!</p>
              <p className="text-sm text-gray-400 font-oswald mt-1">Great job staying on top of things</p>
            </div>
          ) : (
            <>
              <div className="text-sm text-gray-600 font-oswald mb-3">
                Showing latest {tasks.length} pending tasks
              </div>
              <div className="max-h-48 overflow-y-auto space-y-2">
                {tasks.map((task) => (
                  <div key={task.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <input
                      type="checkbox"
                      checked={task.completed || task.is_completed || task.status === 'completed'}
                      onChange={() => toggleTaskComplete(task.id, task.status)}
                      className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className={`font-medium font-oswald text-sm ${
                        task.completed || task.is_completed || task.status === 'completed' 
                          ? 'line-through text-gray-500' : 'text-black'
                      }`}>
                        {task.title}
                      </h4>
                      {task.description && (
                        <p className="text-xs text-gray-500 font-oswald mt-1 truncate">
                          {task.description}
                        </p>
                      )}
                      {task.due_date && (
                        <p className="text-xs text-gray-400 font-oswald mt-1">
                          Due: {new Date(task.due_date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className={`text-xs font-oswald ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-center">
                <button 
                  onClick={() => window.location.reload()} // This could be improved with proper routing
                  className="text-xs text-black hover:underline font-oswald"
                >
                  View all tasks →
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default TasksCard;