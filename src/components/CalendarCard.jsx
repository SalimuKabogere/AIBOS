import React, { useState, useEffect } from 'react';
import { tasksService } from '../services/tasksService';

const CalendarCard = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [todayTasks, setTodayTasks] = useState([]);
  const [monthTasks, setMonthTasks] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    fetchMonthTasks();
  }, [currentDate]);

  const fetchMonthTasks = async () => {
    try {
      setLoading(true);
      
      // First try getting all tasks to see what we have
      const response = await tasksService.getTasks({});
      
      console.log('CalendarCard response:', response);
      console.log('CalendarCard response type:', typeof response, Array.isArray(response));
      
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
      
      console.log('CalendarCard all tasks:', allTasks);
      console.log('CalendarCard processing tasks:', allTasks.length);
      
      // Get start and end of current month for filtering
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      const startDate = startOfMonth.toISOString().split('T')[0];
      const endDate = endOfMonth.toISOString().split('T')[0];
      
      console.log('CalendarCard filtering for month:', startDate, 'to', endDate);
      
      // Group tasks by date
      const tasksGrouped = {};
      
      allTasks.forEach(task => {
        console.log('CalendarCard checking task:', task.title, 'due_date:', task.due_date);
        if (task.due_date) {
          // Extract just the date part (YYYY-MM-DD) from the full datetime
          const dateKey = task.due_date.split('T')[0];
          const taskDate = dateKey;
          // Check if task is in current month
          if (taskDate >= startDate && taskDate <= endDate) {
            if (!tasksGrouped[dateKey]) {
              tasksGrouped[dateKey] = [];
            }
            tasksGrouped[dateKey].push(task);
            console.log('CalendarCard added task to date:', dateKey);
          }
        }
      });
      
      console.log('CalendarCard grouped tasks:', tasksGrouped);
      console.log('CalendarCard monthTasks object keys:', Object.keys(tasksGrouped));
      console.log('CalendarCard sample task structure:', allTasks[0]);
      
      setMonthTasks(tasksGrouped);
      
      // Set today's tasks
      const today = new Date().toISOString().split('T')[0];
      setTodayTasks(tasksGrouped[today] || []);
      
    } catch (error) {
      console.error('Error fetching month tasks:', error);
      setMonthTasks({});
      setTodayTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const isToday = (day) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const hasTasksOnDate = (day) => {
    const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
      .toISOString().split('T')[0];
    const hasTask = monthTasks[dateStr] && monthTasks[dateStr].length > 0;
    
    if (hasTask) {
      console.log(`CalendarCard: Date ${dateStr} (day ${day}) HAS tasks:`, monthTasks[dateStr]);
    }
    return hasTask;
  };

  const getTasksForDate = (day) => {
    const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
      .toISOString().split('T')[0];
    return monthTasks[dateStr] || [];
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const selectDate = (day) => {
    const newSelectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(newSelectedDate);
    const dateStr = newSelectedDate.toISOString().split('T')[0];
    setTodayTasks(monthTasks[dateStr] || []);
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-8"></div>);
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const hasTask = hasTasksOnDate(day);
      const tasksForDay = getTasksForDate(day);
      const isCurrentDay = isToday(day);
      const isSelected = selectedDate.getDate() === day && 
                        selectedDate.getMonth() === currentDate.getMonth() &&
                        selectedDate.getFullYear() === currentDate.getFullYear();
      
      // Create tooltip content for tasks
      const tooltipContent = hasTask ? 
        `Tasks on ${currentDate.toLocaleDateString('en-US', { month: 'long' })} ${day}:\n${tasksForDay.map(task => `• ${task.title}`).join('\n')}` : 
        '';
      
      days.push(
        <button
          key={day}
          onClick={() => selectDate(day)}
          title={tooltipContent}
          className={`relative h-8 w-8 text-xs font-oswald rounded flex items-center justify-center transition-colors ${
            isCurrentDay
              ? 'bg-black text-white'
              : isSelected
              ? 'bg-gray-200 text-black'
              : hasTask
              ? 'bg-red-600 text-white hover:bg-red-700'
              : 'hover:bg-gray-100 text-gray-700'
          }`}
        >
          {day}
          {hasTask && (
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-800 rounded-full"></span>
          )}
        </button>
      );
    }
    
    return days;
  };

  const getTimeUntilDue = (dueDate, dueTime) => {
    if (!dueDate) return null;
    
    const now = new Date();
    const due = new Date(dueDate);
    
    if (dueTime) {
      const [hours, minutes] = dueTime.split(':');
      due.setHours(parseInt(hours), parseInt(minutes));
    }
    
    const diffMs = due - now;
    
    if (diffMs < 0) return 'Overdue';
    
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m left`;
    } else {
      return `${minutes}m left`;
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-black font-oswald">Calendar</h3>
        <div className="text-sm text-gray-500 font-oswald">
          {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center flex-1">
          <div className="text-gray-500 font-oswald">Loading calendar...</div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col">
          {/* Calendar Navigation */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigateMonth(-1)}
              className="p-1 hover:bg-gray-100 rounded text-gray-600 hover:text-black"
            >
              ←
            </button>
            <h4 className="font-bold text-black font-oswald">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h4>
            <button
              onClick={() => navigateMonth(1)}
              className="p-1 hover:bg-gray-100 rounded text-gray-600 hover:text-black"
            >
              →
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="flex-1">
            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="h-8 flex items-center justify-center text-xs font-oswald text-gray-500 font-medium">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar days */}
            <div className="grid grid-cols-7 gap-1 mb-4">
              {renderCalendar()}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center space-x-4 text-xs font-oswald text-gray-500 mb-4">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-black rounded"></div>
                <span>Today</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-red-600 rounded"></div>
                <span>Has tasks</span>
              </div>
            </div>

            {/* Selected Date Tasks */}
            <div className="border-t pt-4">
              <h5 className="font-medium text-black font-oswald text-sm mb-2">
                {formatDate(selectedDate)}
              </h5>
              {todayTasks.length === 0 ? (
                <p className="text-xs text-gray-500 font-oswald">No tasks on this date</p>
              ) : (
                <div className="space-y-2 max-h-24 overflow-y-auto">
                  {todayTasks.slice(0, 3).map((task) => (
                    <div key={task.id} className="flex items-center justify-between text-xs">
                      <span className="font-oswald truncate flex-1">{task.title}</span>
                      <span className={`px-1 py-0.5 rounded text-xs ${
                        task.priority === 'high' ? 'bg-black text-white' :
                        task.priority === 'medium' ? 'bg-gray-600 text-white' :
                        'bg-gray-300 text-gray-800'
                      }`}>
                        {task.priority}
                      </span>
                    </div>
                  ))}
                  {todayTasks.length > 3 && (
                    <p className="text-xs text-gray-400 font-oswald">
                      +{todayTasks.length - 3} more tasks
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarCard;