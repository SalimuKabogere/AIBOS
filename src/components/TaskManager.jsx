import React, { useState, useEffect } from 'react';
import { tasksService } from '../services/tasksService';
import DeleteConfirmation from './DeleteConfirmation';

const TaskManager = () => {
  // Tasks state
  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [tasksError, setTasksError] = useState(null);

  // Categories state
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState(null);

  // Filter and pagination state
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [tasksPerPage, setTasksPerPage] = useState(6);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form states
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [viewingTask, setViewingTask] = useState(null);
  const [viewingCategory, setViewingCategory] = useState(null);

  // Drag and drop state
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [dragOverTaskId, setDragOverTaskId] = useState(null);

  // Form data states
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    category: '',
    due_date: '',
    priority: 'medium'
  });

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    color: '#3B82F6'
  });

  // Delete confirmation states
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    isOpen: false,
    type: null, // 'task' or 'category'
    item: null,
    onConfirm: null
  });

  // Load data on component mount
  useEffect(() => {
    loadCategories();
    loadTasks();
  }, []);

  const loadCategories = async () => {
    try {
      setCategoriesLoading(true);
      setCategoriesError(null);
      const data = await tasksService.getCategories();
      setCategories(data.results || data);
    } catch (error) {
      console.error('Error loading categories:', error);
      setCategoriesError(error.message);
      
      // Only use demo data if it's a network error or server is unreachable
      if (error.code === 'ERR_NETWORK' || error.response?.status >= 500) {
        setCategories([
          { id: 1, name: 'Work', description: 'Work-related tasks', color: '#3B82F6' },
          { id: 2, name: 'Personal', description: 'Personal tasks and goals', color: '#10B981' },
          { id: 3, name: 'Health', description: 'Health and fitness goals', color: '#F59E0B' },
          { id: 4, name: 'Learning', description: 'Learning and development', color: '#8B5CF6' }
        ]);
      } else {
        // For other errors (like 401, 403), show empty list
        setCategories([]);
      }
    } finally {
      setCategoriesLoading(false);
    }
  };

  const loadTasks = async () => {
    try {
      setTasksLoading(true);
      const data = await tasksService.getTasks();
      const raw = data.results || data || [];

      // Normalize tasks so UI always sees a `completed` boolean and consistent category field
      const normalized = (raw || []).map(t => {
        const category_id = t.category || t.category_id || (t.category_obj && t.category_obj.id) || null;
        const category_name = t.category_name || (t.category_obj && t.category_obj.name) || (typeof t.category === 'string' ? t.category : null);
        return {
          ...t,
          // handle multiple possible completion fields from backend
          completed: !!(t.completed || t.is_completed || (t.status === 'completed') || (t.progress === 100)),
          is_completed: !!(t.is_completed || t.completed || (t.status === 'completed')),
          // provide both id and name for category
          category_id,
          category_name,
          category: category_name,
          // ensure id exists
          id: t.id || t.pk || t.task_id,
        };
      });

  console.debug('Loaded tasks (normalized):', normalized);
  setTasks(normalized);
    } catch (error) {
      console.error('Error loading tasks:', error);
      setTasksError(error.message);
      // Fallback demo data
      setTasks([
        {
          id: 1,
          title: 'Complete project proposal',
          description: 'Finish the Q4 project proposal document',
          priority: 'high',
          category: 'Work',
          due_date: '2024-12-30',
          completed: false,
          created_at: '2024-01-15'
        },
        {
          id: 2,
          title: 'Write documentation',
          description: 'Create comprehensive documentation for the project',
          priority: 'medium',
          category: 'Work',
          due_date: '2024-12-25',
          completed: false,
          created_at: '2024-01-16'
        }
      ]);
    } finally {
      setTasksLoading(false);
    }
  };

  const handleTaskCreate = async (taskData) => {
    try {
      setLoading(true);
      // Prepare payload: backend usually expects category id
      const payload = {
        title: (taskData.title || '').toString(),
        description: taskData.description || '',
        priority: taskData.priority || 'medium',
      };

      // Normalize due_date to ISO if provided (backend usually accepts ISO 8601)
      if (taskData.due_date) {
        try {
          const iso = new Date(taskData.due_date).toISOString();
          payload.due_date = iso;
        } catch (e) {
          // fallback to raw value
          payload.due_date = taskData.due_date;
        }
      }

      // Only include category when a valid selection was made
      if (taskData.category && taskData.category !== '') {
        const catId = Number(taskData.category);
        payload.category = Number.isNaN(catId) ? taskData.category : catId;
      }

      console.debug('Creating task with payload:', payload);

      await tasksService.createTask(payload);
      await loadTasks();
    } catch (error) {
      console.error('Error creating task:', error);
      // If server returned HTML (Django debug page / IntegrityError), show a friendly message and log the HTML to console
      if (error.response && typeof error.response.data === 'string') {
        const ct = error.response.headers && error.response.headers['content-type'];
        if (ct && ct.includes('text/html')) {
          console.error('Server HTML error page:', error.response.data);
          alert('Server error creating task. The server returned an HTML error page (IntegrityError). Please check backend logs or paste the server traceback in the chat.');
          return;
        }
      }

      // show validation messages if available (JSON)
      const details = error.response && error.response.data ? JSON.stringify(error.response.data) : error.message;
      alert('Error creating task: ' + details);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskUpdate = async (taskId, taskData) => {
    try {
      setLoading(true);
      await tasksService.updateTask(taskId, taskData);
      await loadTasks();
    } catch (error) {
      console.error('Error updating task:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskDelete = async (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    setDeleteConfirmation({
      isOpen: true,
      type: 'task',
      item: task,
      onConfirm: async () => {
        try {
          setLoading(true);
          await tasksService.deleteTask(taskId);
          await loadTasks();
        } catch (error) {
          console.error('Error deleting task:', error);
          alert('Error deleting task. Please try again.');
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const handleTaskToggleComplete = async (taskId) => {
    // Optimistic UI update: flip completed locally first for instant feedback
    const prevTasks = tasks;
    try {
      setTasks(prev => prev.map(t => t.id === taskId ? ({ ...t, completed: !t.completed, is_completed: !t.is_completed }) : t));
      // Call server to persist
      const res = await tasksService.toggleComplete(taskId);
      console.debug('toggleComplete response:', res);
      // Refresh to ensure server state matches UI
      await loadTasks();
    } catch (error) {
      console.error('Error toggling task completion:', error);
      alert('Error updating task. Please try again.');
      // Revert optimistic update on failure
      setTasks(prevTasks);
    } finally {
      setLoading(false);
    }
  };

  // Drag and drop handlers (client-side reorder)
  const onDragStart = (e, taskId) => {
    e.dataTransfer.setData('text/plain', String(taskId));
    e.dataTransfer.effectAllowed = 'move';
    setDraggedTaskId(taskId);
  };

  const onDragOver = (e, taskId) => {
    e.preventDefault(); // allow drop
    if (dragOverTaskId !== taskId) setDragOverTaskId(taskId);
  };

  const onDragEnd = () => {
    setDraggedTaskId(null);
    setDragOverTaskId(null);
  };

  const onDrop = (e, targetTaskId) => {
    e.preventDefault();
    const draggedId = parseInt(e.dataTransfer.getData('text/plain'));
    if (!draggedId || draggedId === targetTaskId) {
      onDragEnd();
      return;
    }

    setTasks(prevTasks => {
      const newTasks = [...prevTasks];
      const fromIndex = newTasks.findIndex(t => t.id === draggedId);
      const toIndex = newTasks.findIndex(t => t.id === targetTaskId);
      if (fromIndex === -1 || toIndex === -1) return prevTasks;
      const [moved] = newTasks.splice(fromIndex, 1);
      newTasks.splice(toIndex, 0, moved);
      return newTasks;
    });
    // preserve manual order after a drop so sorting doesn't override it
    setSortBy('manual');
    onDragEnd();
  };

  // Filtering logic
  const filteredTasks = tasks.filter(task => {
    if (filter === 'completed' && !task.completed) return false;
    if (filter === 'pending' && task.completed) return false;
    if (filter === 'overdue') {
      const today = new Date();
      const dueDate = new Date(task.due_date);
      if (task.completed || dueDate >= today) return false;
    }
    
    if (categoryFilter !== 'all') {
      const cf = categoryFilter?.toString();
      const tid = task.category_id != null ? task.category_id.toString() : null;
      if (tid !== cf && task.category_name !== categoryFilter) return false;
    }
    if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return task.title.toLowerCase().includes(query) || 
             (task.description && task.description.toLowerCase().includes(query));
    }
    
    return true;
  });

  // Sorting logic
  // If sortBy is 'manual' we preserve the tasks array order (used for drag-and-drop)
  const sortedTasks = (sortBy === 'manual')
    ? [...filteredTasks]
    : [...filteredTasks].sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'priority':
          const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
          return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
        case 'due_date':
          if (!a.due_date && !b.due_date) return 0;
          if (!a.due_date) return 1;
          if (!b.due_date) return -1;
          return new Date(a.due_date) - new Date(b.due_date);
        case 'created_at':
        default:
          return new Date(b.created_at) - new Date(a.created_at);
      }
    });

  // Pagination logic
  const totalPages = Math.ceil(sortedTasks.length / tasksPerPage);
  const indexOfLastTask = currentPage * tasksPerPage;
  const indexOfFirstTask = indexOfLastTask - tasksPerPage;
  const currentTasks = sortedTasks.slice(indexOfFirstTask, indexOfLastTask);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, searchQuery, categoryFilter, priorityFilter, sortBy]);

  const taskStats = {
    total: tasks.length,
    completed: tasks.filter(t => t.completed).length,
    pending: tasks.filter(t => !t.completed).length,
    overdue: tasks.filter(t => !t.completed && new Date(t.due_date) < new Date()).length
  };

  const clearAllFilters = () => {
    setFilter('all');
    setCategoryFilter('all');
    setPriorityFilter('all');
    setSearchQuery('');
    setSortBy('created_at');
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Form handling functions
  const handleTaskFormSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTask) {
        await handleTaskUpdate(editingTask.id, taskForm);
      } else {
        await handleTaskCreate(taskForm);
      }
      setTaskForm({ title: '', description: '', category: '', due_date: '', priority: 'medium' });
      setShowTaskForm(false);
      setEditingTask(null);
    } catch (error) {
      console.error('Error submitting task form:', error);
    }
  };

  const handleCategoryFormSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await tasksService.updateCategory(editingCategory.id, categoryForm);
      } else {
        await tasksService.createCategory(categoryForm);
      }
      setCategoryForm({ name: '', description: '', color: '#3B82F6' });
      setShowCategoryForm(false);
      setEditingCategory(null);
      loadCategories();
    } catch (error) {
      console.error('Error submitting category form:', error);
      alert('Error saving category. Please try again.');
    }
  };

  const handleCategoryDelete = async (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    setDeleteConfirmation({
      isOpen: true,
      type: 'category',
      item: category,
      onConfirm: async () => {
        try {
          await tasksService.deleteCategory(categoryId);
          loadCategories();
        } catch (error) {
          console.error('Error deleting category:', error);
          alert('Error deleting category. Please try again.');
        }
      }
    });
  };

  const startEditTask = (task) => {
    setEditingTask(task);
    setTaskForm({
      title: task.title,
      description: task.description || '',
      category: task.category_id || task.category || task.category_name || '',
      due_date: task.due_date ? task.due_date.slice(0, 16) : '',
      priority: task.priority || 'medium'
    });
    setShowTaskForm(true);
  };

  const startEditCategory = (category) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      description: category.description || '',
      color: category.color || '#3B82F6'
    });
    setShowCategoryForm(true);
  };

  // Category operations
  const handleCreateCategory = async (e) => {
    e.preventDefault();
    try {
      await tasksService.createCategory(categoryForm);
      setCategoryForm({ name: '', description: '' });
      setShowCategoryForm(false);
      loadCategories();
    } catch (error) {
      console.error('Error creating category:', error);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await tasksService.deleteCategory(categoryId);
        loadCategories();
        loadTasks();
      } catch (error) {
        console.error('Error deleting category:', error);
      }
    }
  };

  // Filter handlers
  const handleFilterChange = (key, value) => {
    setFilter(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilter({ category: '', completed: '', search: '', overdue: '' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg font-oswald">Loading tasks...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
      {/* Page Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">My Tasks</h1>
        <p className="text-lg text-gray-600">Manage your categories and tasks efficiently</p>
      </div>

      {/* Categories Management Section */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Categories Management</h2>
          <button
            onClick={() => setShowCategoryForm(true)}
            className="px-4 py-2 bg-black text-white rounded-lg hover:opacity-90 transition-colors"
          >
            + Add Category
          </button>
        </div>

        {categoriesLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map(category => (
              <div key={category.id} className="bg-gray-50 rounded-lg p-4 border hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                  <div className="flex space-x-2">
                    {/* View Icon */}
                    <button
                      onClick={() => setViewingCategory(category)}
                      className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                      title="View category"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                    
                    {/* Edit Icon */}
                    <button
                      onClick={() => startEditCategory(category)}
                      className="p-1 text-green-600 hover:text-green-800 transition-colors"
                      title="Edit category"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    
                    {/* Delete Icon */}
                    <button
                      onClick={() => handleCategoryDelete(category.id)}
                      className="p-1 text-red-600 hover:text-red-800 transition-colors"
                      title="Delete category"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
                <p className="text-gray-600 text-sm">{category.description}</p>
                {category.color && (
                  <div className="mt-2 flex items-center">
                    <div 
                      className="w-4 h-4 rounded-full mr-2" 
                      style={{ backgroundColor: category.color }}
                    ></div>
                    <span className="text-xs text-gray-500">{category.color}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tasks Management Section */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Tasks Management</h2>
          <button
            onClick={() => setShowTaskForm(true)}
            className="px-4 py-2 bg-black text-white rounded-lg hover:opacity-90 transition-colors"
          >
            + Add Task
          </button>
        </div>

        {/* Filters Section */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Tasks</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="overdue">Overdue</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="created_at">Sort by Date</option>
              <option value="title">Sort by Title</option>
              <option value="priority">Sort by Priority</option>
              <option value="due_date">Sort by Due Date</option>
            </select>

            <button
              onClick={clearAllFilters}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Tasks Grid */}
        {tasksLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {currentTasks.map(task => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={(e) => onDragStart(e, task.id)}
                  onDragOver={(e) => onDragOver(e, task.id)}
                  onDrop={(e) => onDrop(e, task.id)}
                  onDragEnd={onDragEnd}
                  className={`bg-gray-50 rounded-lg p-4 border hover:shadow-md transition-shadow ${dragOverTaskId === task.id ? 'ring-2 ring-black' : ''}`}
                >
                  {/* Checkbox and Title Row */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={task.completed || false}
                        onChange={() => handleTaskToggleComplete(task.id)}
                        className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <h3 className={`text-lg font-semibold ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                        {task.title}
                      </h3>
                    </div>
                    <div className="flex space-x-2">
                      {/* View Icon */}
                      <button
                        onClick={() => setViewingTask(task)}
                        className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                        title="View task"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      
                      {/* Edit Icon */}
                      <button
                        onClick={() => startEditTask(task)}
                        className="p-1 text-green-600 hover:text-green-800 transition-colors"
                        title="Edit task"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      
                      {/* Delete Icon */}
                      <button
                        onClick={() => handleTaskDelete(task.id)}
                        className="p-1 text-red-600 hover:text-red-800 transition-colors"
                        title="Delete task"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-2">{task.description}</p>
                  
                  <div className="flex justify-between items-center">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      task.priority === 'high' ? 'bg-red-100 text-red-800' :
                      task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {task.priority}
                    </span>
                    
                    {task.category_name && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                        {task.category_name}
                      </span>
                    )}
                  </div>
                  
                  {task.due_date && (
                    <div className="mt-2 text-xs text-gray-500">
                      Due: {new Date(task.due_date).toLocaleDateString()}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                
                <span className="px-4 py-2 text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Task Form Modal */}
      {showTaskForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">
              {editingTask ? 'Edit Task' : 'Add New Task'}
            </h2>
            <form onSubmit={handleTaskFormSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Task title"
                value={taskForm.title}
                onChange={(e) => setTaskForm(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <textarea
                placeholder="Task description (optional)"
                value={taskForm.description}
                onChange={(e) => setTaskForm(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="3"
              />
              <select
                value={taskForm.category}
                onChange={(e) => setTaskForm(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Category (optional)</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              <select
                value={taskForm.priority}
                onChange={(e) => setTaskForm(prev => ({ ...prev, priority: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
              <input
                type="datetime-local"
                value={taskForm.due_date}
                onChange={(e) => setTaskForm(prev => ({ ...prev, due_date: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  {editingTask ? 'Update Task' : 'Create Task'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowTaskForm(false);
                    setEditingTask(null);
                    setTaskForm({ title: '', description: '', category: '', due_date: '', priority: 'medium' });
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Form Modal */}
      {showCategoryForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </h2>
            <form onSubmit={handleCategoryFormSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Category name"
                value={categoryForm.name}
                onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <textarea
                placeholder="Category description (optional)"
                value={categoryForm.description}
                onChange={(e) => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="3"
              />
              <div className="flex items-center space-x-3">
                <label className="text-sm font-medium text-gray-700">Color:</label>
                <input
                  type="color"
                  value={categoryForm.color}
                  onChange={(e) => setCategoryForm(prev => ({ ...prev, color: e.target.value }))}
                  className="w-12 h-8 border rounded cursor-pointer"
                />
                <span className="text-sm text-gray-500">{categoryForm.color}</span>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingCategory ? 'Update Category' : 'Create Category'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCategoryForm(false);
                    setEditingCategory(null);
                    setCategoryForm({ name: '', description: '', color: '#3B82F6' });
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Task Modal */}
      {viewingTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Task Details</h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700">Title:</label>
                <p className="text-gray-900">{viewingTask.title}</p>
              </div>
              {viewingTask.description && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Description:</label>
                  <p className="text-gray-900">{viewingTask.description}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-700">Priority:</label>
                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                  viewingTask.priority === 'high' ? 'bg-red-100 text-red-800' :
                  viewingTask.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {viewingTask.priority}
                </span>
              </div>
              {viewingTask.category && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Category:</label>
                  <p className="text-gray-900">{viewingTask.category}</p>
                </div>
              )}
              {viewingTask.due_date && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Due Date:</label>
                  <p className="text-gray-900">{new Date(viewingTask.due_date).toLocaleString()}</p>
                </div>
              )}
            </div>
            <div className="mt-6">
              <button
                onClick={() => setViewingTask(null)}
                className="w-full px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Category Modal */}
      {viewingCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Category Details</h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700">Name:</label>
                <p className="text-gray-900">{viewingCategory.name}</p>
              </div>
              {viewingCategory.description && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Description:</label>
                  <p className="text-gray-900">{viewingCategory.description}</p>
                </div>
              )}
              {viewingCategory.color && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Color:</label>
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-6 h-6 rounded-full border" 
                      style={{ backgroundColor: viewingCategory.color }}
                    ></div>
                    <span className="text-gray-900">{viewingCategory.color}</span>
                  </div>
                </div>
              )}
            </div>
            <div className="mt-6">
              <button
                onClick={() => setViewingCategory(null)}
                className="w-full px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmation
        isOpen={deleteConfirmation.isOpen}
        onClose={() => setDeleteConfirmation({ isOpen: false, type: null, item: null, onConfirm: null })}
        onConfirm={deleteConfirmation.onConfirm}
        title={`Delete ${deleteConfirmation.type}`}
        itemName={deleteConfirmation.item?.name || deleteConfirmation.item?.title || ''}
        itemType={deleteConfirmation.type}
      />
    </div>
  );
};

export default TaskManager;