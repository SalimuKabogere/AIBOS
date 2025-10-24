import React, { useState, useEffect } from 'react';
import { tasksService } from '../services/tasksService';

const TimeTrackerCard = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasksWithDeadlines();
  }, []);

  const fetchTasksWithDeadlines = async () => {
    try {
      setLoading(true);
      
      // First try getting all tasks to see what we have
      const response = await tasksService.getTasks({});
      console.log('TimeTrackerCard response:', response);
      console.log('TimeTrackerCard response type:', typeof response, Array.isArray(response));
      
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
      
      console.log('TimeTrackerCard tasks data:', allTasks);
      
      // Filter tasks with due dates client-side
      const tasksWithDueDates = allTasks.filter(task => task.due_date && task.status !== 'completed');
      console.log('TimeTrackerCard tasks with due dates:', tasksWithDueDates);
      
      setTasks(tasksWithDueDates);
    } catch (error) {
      console.error('Error fetching tasks with deadlines:', error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const getTimeRemaining = (dueDate, dueTime) => {
    console.log('getTimeRemaining called with:', { dueDate, dueTime });
    
    if (!dueDate) {
      console.log('No due date provided');
      return null;
    }
    
    const now = new Date();
    const due = new Date(dueDate);
    
    console.log('Current time:', now);
    console.log('Due date parsed:', due);
    
    if (dueTime) {
      const [hours, minutes] = dueTime.split(':');
      due.setHours(parseInt(hours), parseInt(minutes));
      console.log('Due date with time:', due);
    } else {
      due.setHours(23, 59, 59); // End of day if no time specified
      console.log('Due date set to end of day:', due);
    }
    
    const diffMs = due - now;
    console.log('Time difference (ms):', diffMs);
    
    if (diffMs <= 0) {
      console.log('Task is overdue');
      return { text: 'Overdue', status: 'overdue', urgency: 'critical' };
    }
    
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
    
    console.log('Time breakdown:', { days, hours, minutes, seconds });
    
    // Format as day:hr:min:sec
    const formatTime = (d, h, m, s) => {
      return `${d.toString().padStart(2, '0')}:${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };
    
    const text = formatTime(days, hours, minutes, seconds);
    let urgency = 'normal';
    
    // Determine urgency based on total time remaining
    if (days === 0 && hours <= 2) {
      urgency = 'critical';
    } else if (days <= 1) {
      urgency = 'urgent';
    } else {
      urgency = 'normal';
    }
    
    const result = { text, status: 'pending', urgency };
    console.log('getTimeRemaining result:', result);
    return result;
  };

  const getUrgencyStyle = (urgency) => {
    switch (urgency) {
      case 'critical':
        return 'bg-black text-white border-black';
      case 'urgent':
        return 'bg-white text-black border-black';
      case 'normal':
        return 'bg-white text-black border-gray-400';
      default:
        return 'bg-white text-black border-gray-300';
    }
  };

  const sortTasksByUrgency = (tasks) => {
    console.log('TimeTrackerCard: Sorting tasks:', tasks);
    
    return tasks
      .map(task => {
        const timeInfo = getTimeRemaining(task.due_date, task.due_time);
        console.log(`Task "${task.title}": due_date=${task.due_date}, due_time=${task.due_time}, timeInfo=`, timeInfo);
        return {
          ...task,
          timeInfo
        };
      })
      .filter(task => {
        const hasTimeInfo = task.timeInfo !== null;
        console.log(`Task "${task.title}" has time info:`, hasTimeInfo);
        return hasTimeInfo;
      })
      .sort((a, b) => {
        const urgencyOrder = { 'overdue': 0, 'critical': 1, 'urgent': 2, 'normal': 3 };
        const aOrder = urgencyOrder[a.timeInfo.status === 'overdue' ? 'overdue' : a.timeInfo.urgency];
        const bOrder = urgencyOrder[b.timeInfo.status === 'overdue' ? 'overdue' : b.timeInfo.urgency];
        return aOrder - bOrder;
      });
  };

  const sortedTasks = sortTasksByUrgency(tasks);
  console.log('TimeTrackerCard: Final sorted tasks:', sortedTasks);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-black font-oswald">Time Tracker</h3>
        <div className="text-sm text-gray-500 font-oswald">
          Deadlines
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="text-gray-500 font-oswald">Loading deadlines...</div>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedTasks.length === 0 ? (
            <div className="text-center py-8">
              <img 
                src="/timer.jpg" 
                alt="No Deadlines" 
                className="w-16 h-16 mx-auto mb-2"
              />
              <p className="text-gray-500 font-oswald">No upcoming deadlines!</p>
              <p className="text-sm text-gray-400 font-oswald mt-1">All tasks are on track</p>
            </div>
          ) : (
            <>
              <div className="text-sm text-gray-600 font-oswald mb-3">
                {sortedTasks.filter(t => t.timeInfo?.status === 'overdue').length > 0 && (
                  <span className="text-black font-bold">
                    {sortedTasks.filter(t => t.timeInfo?.status === 'overdue').length} overdue • 
                  </span>
                )} {sortedTasks.length} tasks with deadlines
              </div>
              <div className="max-h-48 overflow-y-auto space-y-2">
                {sortedTasks.slice(0, 5).map((task) => (
                  <div 
                    key={task.id} 
                    className={`p-3 rounded-lg border ${getUrgencyStyle(task.timeInfo?.urgency || 'normal')}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <h4 className="font-medium font-oswald text-sm truncate flex-1">{task.title}</h4>
                        <div className="text-xs font-oswald font-bold">
                          {task.timeInfo?.text}
                        </div>
                      </div>
                    </div>
                    <p className="text-xs opacity-70 font-oswald mt-2 ml-6">
                      Due: {new Date(task.due_date).toLocaleDateString()}
                      {task.due_time && ` at ${task.due_time}`}
                    </p>
                  </div>
                ))}
              </div>
              
              {sortedTasks.length > 0 && (
                <div className="mt-4 pt-3 border-t border-gray-200">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <div className="text-sm font-bold text-black font-oswald">
                        {sortedTasks.filter(t => t.timeInfo?.status === 'overdue').length}
                      </div>
                      <div className="text-xs text-gray-500 font-oswald">Overdue</div>
                    </div>
                    <div>
                      <div className="text-sm font-bold text-black font-oswald">
                        {sortedTasks.filter(t => t.timeInfo?.urgency === 'critical' || t.timeInfo?.urgency === 'urgent').length}
                      </div>
                      <div className="text-xs text-gray-500 font-oswald">Urgent</div>
                    </div>
                    <div>
                      <div className="text-sm font-bold text-black font-oswald">
                        {sortedTasks.filter(t => t.timeInfo?.urgency === 'normal').length}
                      </div>
                      <div className="text-xs text-gray-500 font-oswald">Normal</div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default TimeTrackerCard;