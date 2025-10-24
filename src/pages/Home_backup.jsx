import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import TaskForm from '../components/TaskForm';
import { getTasks, createTask, updateTask, deleteTask } from '../services/api';
import { tasksService } from '../services/tasksService';

const Home = () => {
  // State for Tasks
  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [tasksError, setTasksError] = useState(null);
  
  // State for Categories
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState(null);
  
  // UI State
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [viewingTask, setViewingTask] = useState(null);
  const [viewingCategory, setViewingCategory] = useState(null);

  // Load data on component mount
  useEffect(() => {
    loadTasks();
    loadCategories();
  }, []);

  const loadTasks = async () => {
    try {
      setTasksLoading(true);
      const data = await getTasks();
      setTasks(data);
      setTasksError(null);
    } catch (err) {
      setTasksError('Failed to load tasks');
      console.error('Error loading tasks:', err);
      // Demo data fallback
      setTasks([
        {
          id: 1,
          title: 'Complete project setup',
          description: 'Set up the initial project structure and dependencies',
          priority: 'high',
          completed: false,
          category: 'Work',
          due_date: '2025-10-25T10:00:00Z'
        },
        {
          id: 2,
          title: 'Write documentation',
          description: 'Create comprehensive documentation for the project',
          priority: 'medium',
          completed: false,
          category: 'Work',
          due_date: '2025-10-26T15:00:00Z'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskCreate = async (taskData) => {
    try {
      const newTask = await createTask(taskData);
      setTasks(prev => [...prev, newTask]);
    } catch (err) {
      console.error('Error creating task:', err);
      // Fallback to local state update
      setTasks(prev => [...prev, taskData]);
    }
  };

  const handleTaskUpdate = async (taskId, updatedData) => {
    try {
      const updatedTask = await updateTask(taskId, updatedData);
      setTasks(prev => prev.map(task => 
        task.id === taskId ? updatedTask : task
      ));
    } catch (err) {
      console.error('Error updating task:', err);
      // Fallback to local state update
      setTasks(prev => prev.map(task => 
        task.id === taskId ? updatedData : task
      ));
    }
  };

  const handleTaskDelete = async (taskId) => {
    try {
      await deleteTask(taskId);
      setTasks(prev => prev.filter(task => task.id !== taskId));
    } catch (err) {
      console.error('Error deleting task:', err);
      // Fallback to local state update
      setTasks(prev => prev.filter(task => task.id !== taskId));
    }
  };



  // Filter and sort tasks
  const filteredAndSortedTasks = tasks
    .filter(task => {
      // Filter by status
      if (filter === 'pending' && task.completed) return false;
      if (filter === 'completed' && !task.completed) return false;
      
      // Filter by category
      if (categoryFilter !== 'all' && task.category !== parseInt(categoryFilter)) return false;
      
      // Filter by priority
      if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;
      
      // Filter by search query
      if (searchQuery) {
        return task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
               (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));
      }
      
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
        case 'title':
          return a.title.localeCompare(b.title);
        case 'due_date':
          if (!a.due_date && !b.due_date) return 0;
          if (!a.due_date) return 1;
          if (!b.due_date) return -1;
          return new Date(a.due_date) - new Date(b.due_date);
        case 'created':
        default:
          return new Date(b.created_at || b.createdAt || 0) - new Date(a.created_at || a.createdAt || 0);
      }
    });

  // Pagination calculations
  const totalPages = Math.ceil(filteredAndSortedTasks.length / tasksPerPage);
  const indexOfLastTask = currentPage * tasksPerPage;
  const indexOfFirstTask = indexOfLastTask - tasksPerPage;
  const currentTasks = filteredAndSortedTasks.slice(indexOfFirstTask, indexOfLastTask);

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [filter, searchQuery, categoryFilter, priorityFilter, sortBy]);

  const taskStats = {
    total: tasks.length,
    pending: tasks.filter(t => !t.completed).length,
    completed: tasks.filter(t => t.completed).length,
    highPriority: tasks.filter(t => t.priority === 'high' && !t.completed).length,
    filtered: filteredAndSortedTasks.length
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const clearAllFilters = () => {
    setFilter('all');
    setCategoryFilter('all');
    setPriorityFilter('all');
    setSearchQuery('');
    setSortBy('created');
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
              <p className="mt-4 text-gray-600 font-oswald">Loading tasks...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black font-oswald mb-2">My Tasks</h1>
          <p className="text-gray-600 font-oswald">Manage and organize your tasks efficiently</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg font-oswald">
            <p>{error} - Using demo data</p>
          </div>
        )}

        {/* Task Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <div className="text-2xl font-bold text-black font-oswald">{taskStats.total}</div>
            <div className="text-sm text-gray-600 font-oswald">Total Tasks</div>
          </div>
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <div className="text-2xl font-bold text-blue-600 font-oswald">{taskStats.pending}</div>
            <div className="text-sm text-gray-600 font-oswald">Pending</div>
          </div>
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <div className="text-2xl font-bold text-green-600 font-oswald">{taskStats.completed}</div>
            <div className="text-sm text-gray-600 font-oswald">Completed</div>
          </div>
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <div className="text-2xl font-bold text-red-600 font-oswald">{taskStats.highPriority}</div>
            <div className="text-sm text-gray-600 font-oswald">High Priority</div>
          </div>
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <div className="text-2xl font-bold text-purple-600 font-oswald">{taskStats.filtered}</div>
            <div className="text-sm text-gray-600 font-oswald">Filtered Results</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Column - Task Form and Filters */}
          <div className="lg:col-span-1 space-y-6">
            <TaskForm onTaskCreate={handleTaskCreate} />

            {/* Task Details Card */}
            {viewingTask && (
              <div className="bg-white p-6 rounded-lg border shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-black font-oswald">Task Details</h3>
                  <button
                    onClick={() => setViewingTask(null)}
                    className="text-gray-400 hover:text-gray-600 p-1"
                    title="Close Details"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="space-y-4">
                  {/* Task Title and Status */}
                  <div className={`p-3 rounded-lg ${
                    viewingTask.priority === 'high' 
                      ? 'bg-red-50 border border-red-200' 
                      : viewingTask.priority === 'medium'
                      ? 'bg-yellow-50 border border-yellow-200'
                      : 'bg-green-50 border border-green-200'
                  }`}>
                    <h4 className={`font-bold font-oswald ${
                      viewingTask.completed ? 'line-through text-gray-500' : 'text-gray-900'
                    }`}>
                      {viewingTask.title}
                    </h4>
                    <div className="flex items-center justify-between mt-2">
                      <span className={`text-xs px-2 py-1 rounded-full font-oswald ${
                        viewingTask.priority === 'high'
                          ? 'bg-red-100 text-red-800'
                          : viewingTask.priority === 'medium'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {viewingTask.priority.toUpperCase()} PRIORITY
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full font-oswald ${
                        viewingTask.completed 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {viewingTask.completed ? 'COMPLETED' : 'PENDING'}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  {viewingTask.description && (
                    <div>
                      <label className="text-sm font-medium text-gray-700 font-oswald">Description:</label>
                      <p className="text-sm text-gray-600 mt-1 p-2 bg-gray-50 rounded font-oswald">
                        {viewingTask.description}
                      </p>
                    </div>
                  )}

                  {/* Dates and Times */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 font-oswald">Timeline:</label>
                    <div className="mt-2 space-y-2">
                      {viewingTask.due_date && (
                        <div className="flex items-center justify-between p-2 bg-orange-50 rounded">
                          <span className="text-sm font-oswald">Due Date:</span>
                          <span className="text-sm text-orange-600 font-oswald font-medium">
                            {new Date(viewingTask.due_date).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      {viewingTask.created_at && (
                        <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm font-oswald">Created:</span>
                          <span className="text-sm text-gray-600 font-oswald">
                            {new Date(viewingTask.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="pt-4 border-t border-gray-200">
                    <label className="text-sm font-medium text-gray-700 font-oswald mb-2 block">Quick Actions:</label>
                    <div className="space-y-2">
                      <button
                        onClick={() => {
                          handleTaskUpdate(viewingTask.id, { ...viewingTask, completed: !viewingTask.completed });
                          setViewingTask({ ...viewingTask, completed: !viewingTask.completed });
                        }}
                        className={`w-full py-2 px-3 rounded-lg font-oswald text-sm transition-colors ${
                          viewingTask.completed
                            ? 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                            : 'bg-green-50 text-green-700 hover:bg-green-100'
                        }`}
                      >
                        Mark as {viewingTask.completed ? 'Pending' : 'Completed'}
                      </button>
                      <button
                        onClick={() => {
                          setViewingTask(null);
                          // Handle edit functionality
                        }}
                        className="w-full bg-gray-50 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-100 transition-colors font-oswald text-sm"
                      >
                        Edit Task
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Search and Filters Card */}
            <div className="bg-white p-6 rounded-lg border shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-black font-oswald">Filter & Search</h3>
                <button
                  onClick={clearAllFilters}
                  className="text-sm px-3 py-1 text-gray-600 hover:text-black hover:bg-gray-100 rounded font-oswald transition-colors"
                >
                  Clear All
                </button>
              </div>
              
              {/* Search Bar */}
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent font-oswald"
                />
              </div>

              {/* Status Filter Buttons */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2 font-oswald">Status:</label>
                <div className="flex flex-wrap gap-2">
                  {['all', 'pending', 'completed'].map((filterOption) => (
                    <button
                      key={filterOption}
                      onClick={() => setFilter(filterOption)}
                      className={`px-4 py-2 rounded-lg text-sm font-oswald transition-colors ${
                        filter === filterOption
                          ? 'bg-black text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Priority Filter */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2 font-oswald">Priority:</label>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent font-oswald"
                >
                  <option value="all">All Priorities</option>
                  <option value="high">High Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="low">Low Priority</option>
                </select>
              </div>

              {/* Category Filter */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2 font-oswald">Category:</label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent font-oswald"
                >
                  <option value="all">All Categories</option>
                  <option value="1">Work</option>
                  <option value="2">Personal</option>
                  <option value="3">Study</option>
                  <option value="4">Health</option>
                </select>
              </div>

              {/* Sort Options */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2 font-oswald">Sort by:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent font-oswald"
                >
                  <option value="created">Date Created</option>
                  <option value="priority">Priority</option>
                  <option value="title">Title</option>
                  <option value="due_date">Due Date</option>
                </select>
              </div>

              {/* Tasks per page */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-oswald">Tasks per page:</label>
                <select
                  value={tasksPerPage}
                  onChange={(e) => setTasksPerPage(parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent font-oswald"
                >
                  <option value={5}>5 tasks</option>
                  <option value={10}>10 tasks</option>
                  <option value={15}>15 tasks</option>
                  <option value={20}>20 tasks</option>
                </select>
              </div>
            </div>
          </div>

          {/* Right Column - Task Management */}
          <div className="lg:col-span-3 space-y-6">
            {/* Task Cards Grid */}
            <div className="bg-white rounded-lg border shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-black font-oswald">My Tasks</h2>
                <div className="text-right">
                  <span className="text-sm text-gray-500 font-oswald">
                    {currentTasks.length} {currentTasks.length === 1 ? 'task' : 'tasks'}
                  </span>
                  <div className="text-xs text-gray-400 font-oswald mt-1">
                    Showing {indexOfFirstTask + 1}-{Math.min(indexOfLastTask, filteredAndSortedTasks.length)} of {filteredAndSortedTasks.length} tasks
                  </div>
                </div>
              </div>

              {currentTasks.length === 0 ? (
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
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {currentTasks.map((task) => (
                    <div
                      key={task.id}
                      className={`bg-white border-l-4 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow ${
                        task.priority === 'high' 
                          ? 'border-l-red-500 bg-red-50' 
                          : task.priority === 'medium'
                          ? 'border-l-yellow-500 bg-yellow-50'
                          : 'border-l-green-500 bg-green-50'
                      } ${task.completed ? 'opacity-60' : ''}`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start space-x-3 flex-1">
                          <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={() => handleTaskUpdate(task.id, { ...task, completed: !task.completed })}
                            className="w-5 h-5 text-black rounded focus:ring-black mt-0.5"
                          />
                          <div className="flex-1 min-w-0">
                            <h3 className={`font-bold font-oswald ${
                              task.completed ? 'line-through text-gray-500' : 'text-gray-900'
                            }`}>
                              {task.title}
                            </h3>
                          </div>
                        </div>
                        
                        {/* Action Icons */}
                        <div className="flex items-center space-x-1 ml-2">
                          {/* View/Details Icon */}
                          <button
                            onClick={() => setViewingTask(task)}
                            className="text-gray-600 hover:text-blue-600 p-3 rounded-lg hover:bg-blue-50 transition-colors border-2 border-gray-400 hover:border-blue-400 bg-gray-100"
                            title="View Details"
                          >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          
                          {/* Edit Icon */}
                          <button
                            onClick={() => {/* Handle edit */}}
                            className="text-gray-600 hover:text-green-600 p-3 rounded-lg hover:bg-green-50 transition-colors border-2 border-gray-400 hover:border-green-400 bg-gray-100"
                            title="Edit Task"
                          >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          
                          {/* Delete Icon */}
                          <button
                            onClick={() => handleTaskDelete(task.id)}
                            className="text-gray-600 hover:text-red-600 p-3 rounded-lg hover:bg-red-50 transition-colors border-2 border-gray-400 hover:border-red-400 bg-gray-100"
                            title="Delete Task"
                          >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      
                      {task.description && (
                        <p className={`text-sm mb-3 font-oswald ${
                          task.completed ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {task.description}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between text-xs">
                        <span className={`px-3 py-1 rounded-full font-medium font-oswald ${
                          task.priority === 'high'
                            ? 'bg-red-100 text-red-800 border border-red-200'
                            : task.priority === 'medium'
                            ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                            : 'bg-green-100 text-green-800 border border-green-200'
                        }`}>
                          {task.priority.toUpperCase()}
                        </span>
                        
                        {task.due_date && (
                          <span className="text-gray-500 font-oswald">
                            Due: {new Date(task.due_date).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white p-4 rounded-lg border shadow-sm mt-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600 font-oswald">
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`px-3 py-1 rounded-lg font-oswald text-sm ${
                        currentPage === 1
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Previous
                    </button>
                    
                    {/* Page numbers */}
                    <div className="flex space-x-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                        // Show first page, last page, current page, and pages around current
                        if (
                          page === 1 ||
                          page === totalPages ||
                          (page >= currentPage - 1 && page <= currentPage + 1)
                        ) {
                          return (
                            <button
                              key={page}
                              onClick={() => handlePageChange(page)}
                              className={`px-3 py-1 rounded-lg font-oswald text-sm ${
                                currentPage === page
                                  ? 'bg-black text-white'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              {page}
                            </button>
                          );
                        } else if (
                          page === currentPage - 2 ||
                          page === currentPage + 2
                        ) {
                          return (
                            <span key={page} className="px-2 text-gray-400">
                              ...
                            </span>
                          );
                        }
                        return null;
                      })}
                    </div>

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`px-3 py-1 rounded-lg font-oswald text-sm ${
                        currentPage === totalPages
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;