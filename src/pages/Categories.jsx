import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { tasksService } from '../services/tasksService';

const Categories = () => {
  console.log('Categories component rendering...');
  
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [categoriesPerPage, setCategoriesPerPage] = useState(8);
  const [sortBy, setSortBy] = useState('name'); // name, task_count, created
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [viewingCategory, setViewingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    color: '#6366f1',
    description: ''
  });

  console.log('Categories state:', { 
    categoriesCount: categories.length, 
    loading, 
    error, 
    viewingCategory: viewingCategory?.name 
  });

  // Load categories on component mount
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    console.log('Loading categories...');
    try {
      setLoading(true);
      const data = await tasksService.getCategories();
      console.log('Categories API response:', data);
      // Add task count to each category (this would come from backend)
      const categoriesWithCounts = data.map(cat => ({
        ...cat,
        task_count: Math.floor(Math.random() * 20) // Mock data for now
      }));
      console.log('Categories with counts:', categoriesWithCounts);
      setCategories(categoriesWithCounts);
      setError(null);
    } catch (err) {
      setError('Failed to load categories');
      console.error('Error loading categories:', err);
      console.log('Using demo data fallback');
      // Demo data fallback
      const demoCategories = [
        { id: 1, name: 'Work', color: '#ef4444', description: 'Work-related tasks', task_count: 12 },
        { id: 2, name: 'Personal', color: '#10b981', description: 'Personal projects and tasks', task_count: 8 },
        { id: 3, name: 'Study', color: '#3b82f6', description: 'Learning and education', task_count: 5 },
        { id: 4, name: 'Health', color: '#f59e0b', description: 'Health and fitness goals', task_count: 3 },
        { id: 5, name: 'Shopping', color: '#8b5cf6', description: 'Shopping lists and purchases', task_count: 7 },
        { id: 6, name: 'Travel', color: '#06b6d4', description: 'Travel planning and bookings', task_count: 2 }
      ];
      console.log('Demo categories set:', demoCategories);
      setCategories(demoCategories);
    } finally {
      setLoading(false);
      console.log('Categories loading finished');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await tasksService.updateCategory(editingCategory.id, formData);
        setCategories(prev => prev.map(cat => 
          cat.id === editingCategory.id ? { ...cat, ...formData } : cat
        ));
      } else {
        const newCategory = await tasksService.createCategory(formData);
        setCategories(prev => [...prev, { ...newCategory, task_count: 0 }]);
      }
      resetForm();
      await loadCategories(); // Refresh to get updated counts
    } catch (err) {
      console.error('Error saving category:', err);
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      color: category.color,
      description: category.description || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await tasksService.deleteCategory(categoryId);
        setCategories(prev => prev.filter(cat => cat.id !== categoryId));
      } catch (err) {
        console.error('Error deleting category:', err);
      }
    }
  };

  const resetForm = () => {
    setFormData({ name: '', color: '#6366f1', description: '' });
    setEditingCategory(null);
    setShowForm(false);
  };

  // Filter and sort categories
  const filteredAndSortedCategories = categories
    .filter(category => {
      if (searchQuery) {
        return category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
               (category.description && category.description.toLowerCase().includes(searchQuery.toLowerCase()));
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'task_count':
          return b.task_count - a.task_count;
        case 'created':
          return new Date(b.created_at || 0) - new Date(a.created_at || 0);
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

  // Pagination calculations
  const totalPages = Math.ceil(filteredAndSortedCategories.length / categoriesPerPage);
  const indexOfLastCategory = currentPage * categoriesPerPage;
  const indexOfFirstCategory = indexOfLastCategory - categoriesPerPage;
  const currentCategories = filteredAndSortedCategories.slice(indexOfFirstCategory, indexOfLastCategory);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortBy]);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const categoryStats = {
    total: categories.length,
    totalTasks: categories.reduce((sum, cat) => sum + cat.task_count, 0),
    filtered: filteredAndSortedCategories.length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
              <p className="mt-4 text-gray-600 font-oswald">Loading categories...</p>
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-black font-oswald mb-2">Categories</h1>
            <p className="text-gray-600 font-oswald">Organize your tasks with custom categories</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-black text-white px-6 py-3 rounded-lg font-oswald hover:bg-gray-800 transition-colors"
          >
            Add Category
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg font-oswald">
            <p>{error} - Using demo data</p>
          </div>
        )}

        {/* Category Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <div className="text-2xl font-bold text-black font-oswald">{categoryStats.total}</div>
            <div className="text-sm text-gray-600 font-oswald">Total Categories</div>
          </div>
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <div className="text-2xl font-bold text-blue-600 font-oswald">{categoryStats.totalTasks}</div>
            <div className="text-sm text-gray-600 font-oswald">Total Tasks</div>
          </div>
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <div className="text-2xl font-bold text-purple-600 font-oswald">{categoryStats.filtered}</div>
            <div className="text-sm text-gray-600 font-oswald">Filtered Results</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar - Search and Filters */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-lg border shadow-sm">
              <h3 className="text-lg font-bold text-black font-oswald mb-4">Search & Filter</h3>
              
              <div className="space-y-4">
                {/* Search Bar */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 font-oswald">Search:</label>
                  <input
                    type="text"
                    placeholder="Search categories..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent font-oswald"
                  />
                </div>

                {/* Sort Options */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 font-oswald">Sort by:</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent font-oswald"
                  >
                    <option value="name">Name</option>
                    <option value="task_count">Task Count</option>
                    <option value="created">Date Created</option>
                  </select>
                </div>

                {/* Items per page */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 font-oswald">Items per page:</label>
                  <select
                    value={categoriesPerPage}
                    onChange={(e) => setCategoriesPerPage(parseInt(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent font-oswald"
                  >
                    <option value={8}>8 items</option>
                    <option value={12}>12 items</option>
                    <option value={16}>16 items</option>
                    <option value={20}>20 items</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Category Details Card */}
            {viewingCategory && (
              <div className="bg-white p-6 rounded-lg border shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-black font-oswald">Category Details</h3>
                  <button
                    onClick={() => setViewingCategory(null)}
                    className="text-gray-400 hover:text-gray-600 p-1"
                    title="Close Details"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="space-y-4">
                  {/* Category Name and Color */}
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div
                      className="w-6 h-6 rounded-full shadow-sm"
                      style={{ backgroundColor: viewingCategory.color }}
                    ></div>
                    <div>
                      <h4 className="font-bold text-gray-900 font-oswald">{viewingCategory.name}</h4>
                      <p className="text-xs text-gray-500 font-oswald">Color: {viewingCategory.color}</p>
                    </div>
                  </div>

                  {/* Description */}
                  {viewingCategory.description && (
                    <div>
                      <label className="text-sm font-medium text-gray-700 font-oswald">Description:</label>
                      <p className="text-sm text-gray-600 mt-1 p-2 bg-gray-50 rounded font-oswald">
                        {viewingCategory.description}
                      </p>
                    </div>
                  )}

                  {/* Statistics */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 font-oswald">Statistics:</label>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
                        <span className="text-sm font-oswald">Total Tasks:</span>
                        <span className="font-bold text-blue-600 font-oswald">{viewingCategory.task_count}</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                        <span className="text-sm font-oswald">Status:</span>
                        <span className="text-sm text-green-600 font-oswald font-medium">Active</span>
                      </div>
                      {viewingCategory.created_at && (
                        <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm font-oswald">Created:</span>
                          <span className="text-sm text-gray-600 font-oswald">
                            {new Date(viewingCategory.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="pt-4 border-t border-gray-200">
                    <label className="text-sm font-medium text-gray-700 font-oswald mb-2 block">Quick Actions:</label>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setViewingCategory(null);
                          handleEdit(viewingCategory);
                        }}
                        className="flex-1 bg-green-50 text-green-700 py-2 px-3 rounded-lg hover:bg-green-100 transition-colors font-oswald text-sm"
                      >
                        Edit Category
                      </button>
                      <button
                        onClick={() => {
                          setViewingCategory(null);
                          // Navigate to tasks filtered by this category
                          window.location.href = `/home?category=${viewingCategory.id}`;
                        }}
                        className="flex-1 bg-blue-50 text-blue-700 py-2 px-3 rounded-lg hover:bg-blue-100 transition-colors font-oswald text-sm"
                      >
                        View Tasks
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Categories Grid */}
          <div className="lg:col-span-3">
            {/* Categories Grid */}
        <div className="bg-white rounded-lg border shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-black font-oswald">Categories</h2>
            <div className="text-sm text-gray-500 font-oswald">
              Showing {indexOfFirstCategory + 1}-{Math.min(indexOfLastCategory, filteredAndSortedCategories.length)} of {filteredAndSortedCategories.length} categories
            </div>
          </div>

          {currentCategories.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-2">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <p className="text-gray-500 font-oswald">
                No categories found. Create your first category!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {currentCategories.map((category) => (
                <div
                  key={category.id}
                  className="bg-white border-l-4 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
                  style={{ borderLeftColor: category.color }}
                >
                  {/* Category Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3 flex-1">
                      <div
                        className="w-6 h-6 rounded-full shadow-sm"
                        style={{ backgroundColor: category.color }}
                      ></div>
                      <h3 className="font-bold text-gray-900 font-oswald text-lg">{category.name}</h3>
                    </div>
                    
                    {/* Action Icons */}
                    <div className="flex items-center space-x-1 ml-2">
                      {console.log(`Rendering action icons for category: ${category.name}`)}
                      {/* View/Details Icon */}
                      <button
                        onClick={() => {
                          console.log(`View button clicked for: ${category.name}`);
                          setViewingCategory(category);
                        }}
                        className="text-gray-600 hover:text-blue-600 p-3 rounded-lg hover:bg-blue-50 transition-colors border-2 border-gray-400 hover:border-blue-400 bg-gray-100"
                        title="View Category Details"
                      >
                        {console.log('Rendering view (eye) icon')}
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      
                      {/* Edit Icon */}
                      <button
                        onClick={() => {
                          console.log(`Edit button clicked for: ${category.name}`);
                          handleEdit(category);
                        }}
                        className="text-gray-600 hover:text-green-600 p-3 rounded-lg hover:bg-green-50 transition-colors border-2 border-gray-400 hover:border-green-400 bg-gray-100"
                        title="Edit Category"
                      >
                        {console.log('Rendering edit (pencil) icon')}
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      
                      {/* Delete Icon */}
                      <button
                        onClick={() => {
                          console.log(`Delete button clicked for: ${category.name}`);
                          handleDelete(category.id);
                        }}
                        className="text-gray-600 hover:text-red-600 p-3 rounded-lg hover:bg-red-50 transition-colors border-2 border-gray-400 hover:border-red-400 bg-gray-100"
                        title="Delete Category"
                      >
                        {console.log('Rendering delete (trash) icon')}
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  {/* Category Description */}
                  {category.description && (
                    <p className="text-sm text-gray-600 mb-4 font-oswald leading-relaxed">
                      {category.description}
                    </p>
                  )}
                  
                  {/* Category Stats */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <span className="text-sm text-gray-600 font-oswald">
                        {category.task_count} {category.task_count === 1 ? 'task' : 'tasks'}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: category.color }}
                      ></div>
                      <span className="text-xs text-gray-400 font-oswald uppercase">
                        Active
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white p-4 rounded-lg border shadow-sm">
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

        {/* Category Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-bold text-black font-oswald mb-4">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 font-oswald">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter category name..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent font-oswald"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 font-oswald">
                    Color
                  </label>
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                    className="w-full h-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 font-oswald">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter category description..."
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-vertical font-oswald"
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 font-oswald transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-black text-white py-2 px-4 rounded-lg hover:bg-gray-800 font-oswald transition-colors"
                  >
                    {editingCategory ? 'Update' : 'Create'} Category
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Categories;