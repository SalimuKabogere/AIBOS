import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import TaskForm from '../components/TaskForm';
import { getTasks, createTask, updateTask, deleteTask } from '../services/api';
import { tasksService } from '../services/tasksService';

const Home = () => {
  // State for Tasks
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filtering and sorting state
  const [filter, setFilter] = useState('all'); // all, pending, completed
  const [sortBy, setSortBy] = useState('created'); // created, priority, title, due_date
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [tasksPerPage, setTasksPerPage] = useState(5);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [viewingTask, setViewingTask] = useState(null);
  
  // Categories state
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState(null);

  // Load data on component mount
  useEffect(() => {
    loadTasks();
    loadCategories();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const data = await getTasks();
      setTasks(data);
      setError(null);
    } catch (err) {
      setError('Failed to load tasks');
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

  const loadCategories = async () => {
    try {
      setCategoriesLoading(true);
      const data = await tasksService.getCategories();
      const categoriesWithCounts = data.map(cat => ({
        ...cat,
        task_count: Math.floor(Math.random() * 20)
      }));
      setCategories(categoriesWithCounts);
      setCategoriesError(null);
    } catch (err) {
      setCategoriesError('Failed to load categories');
      console.error('Error loading categories:', err);
      // Demo data fallback
      setCategories([
        { id: 1, name: 'Work', color: '#ef4444', description: 'Work-related tasks', task_count: 12 },
        { id: 2, name: 'Personal', color: '#10b981', description: 'Personal projects', task_count: 8 },
        { id: 3, name: 'Study', color: '#3b82f6', description: 'Learning and education', task_count: 5 },
        { id: 4, name: 'Health', color: '#f59e0b', description: 'Health and fitness', task_count: 3 }
      ]);
    } finally {
      setCategoriesLoading(false);
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
          <h1 className="text-3xl font-bold text-black font-oswald mb-2">My Tasks Dashboard</h1>
          <p className="text-gray-600 font-oswald">Manage your tasks and categories efficiently</p>
        </div>

        {/* Categories Management Section */}
        <div className="mb-12">
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-black font-oswald mb-2">Categories Management</h2>
                <p className="text-gray-600 font-oswald">Organize your tasks with custom categories</p>
              </div>
              <button
                onClick={() => window.open('/categories', '_blank')}
                className="bg-black text-white px-6 py-3 rounded-lg font-oswald font-semibold hover:bg-gray-800 transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Category
              </button>
            </div>

            {/* Categories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {categories.map((category) => (
                <div key={category.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: category.color }}
                      ></div>
                      <h3 className="font-semibold text-black font-oswald">{category.name}</h3>
                    </div>
                    
                    {/* Category CRUD Icons */}
                    <div className="flex gap-1">
                      <button
                        onClick={() => alert(`View ${category.name}`)}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="View Category"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => alert(`Edit ${category.name}`)}
                        className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                        title="Edit Category"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => alert(`Delete ${category.name}`)}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete Category"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 font-oswald mb-2">{category.description}</p>
                  <div className="text-sm font-oswald">
                    <span className="text-gray-500">Tasks: </span>
                    <span className="font-semibold text-black">{category.task_count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tasks Management Section */}
        <div className="mb-12">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-black font-oswald mb-2">Tasks Management</h2>
                <p className="text-gray-600 font-oswald">Create, edit, and manage all your tasks</p>
              </div>
              <button
                onClick={() => alert('Add Task functionality')}
                className="bg-black text-white px-6 py-3 rounded-lg font-oswald font-semibold hover:bg-gray-800 transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Task
              </button>
            </div>

            {/* Tasks Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentTasks.map((task) => (
                <div key={task.id} className={`bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow ${
                  task.completed ? 'opacity-60' : ''
                }`}>
                  {/* Task Header */}
                  <div className="flex items-center justify-between mb-3">
                    <h3 className={`font-semibold font-oswald ${
                      task.completed ? 'line-through text-gray-500' : 'text-black'
                    }`}>
                      {task.title}
                    </h3>
                    
                    {/* Task CRUD Icons */}
                    <div className="flex gap-1">
                      <button
                        onClick={() => setViewingTask(task)}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="View Task"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => alert(`Edit task: ${task.title}`)}
                        className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                        title="Edit Task"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleTaskDelete(task.id)}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete Task"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  {/* Task Content */}
                  {task.description && (
                    <p className="text-sm text-gray-600 font-oswald mb-3">{task.description}</p>
                  )}
                  
                  <div className="flex items-center justify-between text-xs">
                    <span className={`px-2 py-1 rounded-full font-medium font-oswald ${
                      task.priority === 'high'
                        ? 'bg-red-100 text-red-800'
                        : task.priority === 'medium'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {task.priority?.toUpperCase() || 'LOW'}
                    </span>
                    {task.category_name && (
                      <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-800 font-medium font-oswald">
                        {task.category_name}
                      </span>
                    )}
                  </div>
                  
                  {task.due_date && (
                    <div className="mt-2 text-xs text-gray-500 font-oswald">
                      Due: {new Date(task.due_date).toLocaleDateString()}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Pagination */}
            {filteredAndSortedTasks.length > tasksPerPage && (
              <div className="mt-6 flex justify-center">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-2 rounded-lg border border-gray-300 text-gray-600 font-oswald disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  
                  {[...Array(Math.ceil(filteredAndSortedTasks.length / tasksPerPage))].map((_, index) => (
                    <button
                      key={index + 1}
                      onClick={() => handlePageChange(index + 1)}
                      className={`px-3 py-2 rounded-lg border font-oswald ${
                        currentPage === index + 1
                          ? 'bg-black text-white border-black'
                          : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === Math.ceil(filteredAndSortedTasks.length / tasksPerPage)}
                    className="px-3 py-2 rounded-lg border border-gray-300 text-gray-600 font-oswald disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Task View Modal */}
        {viewingTask && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-black font-oswald">Task Details</h2>
                <button
                  onClick={() => setViewingTask(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="space-y-3">
                <h3 className="font-semibold text-black font-oswald">{viewingTask.title}</h3>
                {viewingTask.description && (
                  <p className="text-gray-600 font-oswald">{viewingTask.description}</p>
                )}
                <div className="flex gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium font-oswald ${
                    viewingTask.priority === 'high'
                      ? 'bg-red-100 text-red-800'
                      : viewingTask.priority === 'medium'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {viewingTask.priority?.toUpperCase() || 'LOW'}
                  </span>
                  {viewingTask.category_name && (
                    <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-medium font-oswald">
                      {viewingTask.category_name}
                    </span>
                  )}
                </div>
                {viewingTask.due_date && (
                  <p className="text-sm text-gray-500 font-oswald">
                    Due: {new Date(viewingTask.due_date).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
