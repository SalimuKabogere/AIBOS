import React, { useState, useEffect } from 'react';
import { tasksService } from '../services/tasksService';

const CategoriesCard = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await tasksService.getCategories();
      console.log('CategoriesCard response:', response);
      setCategories(response.results || response || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (index) => {
    const colors = [
      'bg-gray-100 text-gray-800',
      'bg-gray-200 text-gray-900',
      'bg-gray-50 text-gray-700',
      'bg-gray-150 text-gray-800',
      'bg-black text-white',
      'bg-gray-800 text-white',
      'bg-gray-300 text-gray-900',
      'bg-gray-600 text-white'
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-black font-oswald">Categories</h3>
        <div className="text-sm text-gray-500 font-oswald">
          {categories.length} total
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="text-gray-500 font-oswald">Loading categories...</div>
        </div>
      ) : (
        <div className="space-y-3">
          {categories.length === 0 ? (
            <div className="text-center py-8">
              <img 
                src="/task1.jpg" 
                alt="No Categories" 
                className="w-16 h-16 mx-auto mb-2"
              />
              <p className="text-gray-500 font-oswald">No categories yet!</p>
              <p className="text-sm text-gray-400 font-oswald mt-1">Create categories to organize your tasks</p>
            </div>
          ) : (
            <div className="max-h-48 overflow-y-auto space-y-2">
              {categories.map((category, index) => (
                <div 
                  key={category.id} 
                  className={`flex items-center justify-between p-3 rounded-lg ${getCategoryColor(index)}`}
                >
                  <div className="flex items-center space-x-3">
                    <div>
                      <h4 className="font-medium font-oswald text-sm">{category.name}</h4>
                      {category.description && (
                        <p className="text-xs opacity-70 font-oswald mt-1">
                          {category.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-oswald opacity-70">
                      {category.task_count || 0} tasks
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {categories.length > 0 && (
            <div className="mt-4 pt-3 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-lg font-bold text-black font-oswald">
                    {categories.reduce((sum, cat) => sum + (cat.task_count || 0), 0)}
                  </div>
                  <div className="text-xs text-gray-500 font-oswald">Total Tasks</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-black font-oswald">
                    {categories.length}
                  </div>
                  <div className="text-xs text-gray-500 font-oswald">Categories</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CategoriesCard;