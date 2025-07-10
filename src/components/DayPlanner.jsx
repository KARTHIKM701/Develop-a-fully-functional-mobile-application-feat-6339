import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { format, addDays, subDays, isToday, isSameDay } from 'date-fns';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiArrowLeft, FiPlus, FiTrash2, FiEdit2, FiCheck, FiClock, FiCalendar, FiChevronLeft, FiChevronRight } = FiIcons;

const DayPlanner = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({ title: '', time: '', priority: 'medium' });
  const [showAddTask, setShowAddTask] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  useEffect(() => {
    const savedTasks = localStorage.getItem('dayPlannerTasks');
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('dayPlannerTasks', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = () => {
    if (newTask.title.trim()) {
      const task = {
        id: Date.now(),
        ...newTask,
        date: selectedDate.toISOString(),
        completed: false,
        createdAt: new Date().toISOString()
      };
      setTasks([...tasks, task]);
      setNewTask({ title: '', time: '', priority: 'medium' });
      setShowAddTask(false);
    }
  };

  const toggleTask = (id) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const updateTask = (id, updates) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, ...updates } : task
    ));
    setEditingTask(null);
  };

  const getTasksForDate = (date) => {
    return tasks.filter(task => 
      isSameDay(new Date(task.date), date)
    ).sort((a, b) => {
      if (a.time && b.time) {
        return a.time.localeCompare(b.time);
      }
      return 0;
    });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-400 bg-red-400/10 border-red-400/30';
      case 'medium': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
      case 'low': return 'text-green-400 bg-green-400/10 border-green-400/30';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/30';
    }
  };

  const todayTasks = getTasksForDate(selectedDate);
  const completedTasks = todayTasks.filter(task => task.completed);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/')}
              className="p-2 bg-gold-400/20 border border-gold-400/30 rounded-lg hover:bg-gold-400/30 transition-all duration-300 text-gold-400"
            >
              <SafeIcon icon={FiArrowLeft} className="text-xl" />
            </motion.button>
            <div>
              <h1 className="text-2xl font-luxury font-bold text-gold-400">Day Planner</h1>
              <p className="text-gray-400">Organize your daily activities</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddTask(true)}
            className="p-3 bg-gold-400 text-black rounded-lg hover:bg-gold-500 transition-all duration-300 font-semibold"
          >
            <SafeIcon icon={FiPlus} className="text-xl" />
          </motion.button>
        </div>

        {/* Date Navigation */}
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gold-400/20 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedDate(subDays(selectedDate, 1))}
              className="p-2 bg-gray-800/50 border border-gray-700 rounded-lg hover:bg-gray-700/50 transition-all duration-300 text-gray-400"
            >
              <SafeIcon icon={FiChevronLeft} />
            </motion.button>
            <div className="text-center">
              <h2 className="text-xl font-semibold text-white">
                {format(selectedDate, 'EEEE, MMMM d')}
              </h2>
              <p className="text-gold-400 text-sm">
                {isToday(selectedDate) ? 'Today' : format(selectedDate, 'yyyy')}
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedDate(addDays(selectedDate, 1))}
              className="p-2 bg-gray-800/50 border border-gray-700 rounded-lg hover:bg-gray-700/50 transition-all duration-300 text-gray-400"
            >
              <SafeIcon icon={FiChevronRight} />
            </motion.button>
          </div>
          
          {/* Progress */}
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Progress</span>
              <span className="text-sm text-gold-400">
                {completedTasks.length} of {todayTasks.length} completed
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-gold-400 to-gold-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${todayTasks.length > 0 ? (completedTasks.length / todayTasks.length) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>

        {/* Tasks */}
        <div className="space-y-4">
          {todayTasks.length === 0 ? (
            <div className="text-center py-12">
              <SafeIcon icon={FiCalendar} className="text-6xl text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">No tasks for this day</p>
              <p className="text-gray-500 text-sm">Add a task to get started</p>
            </div>
          ) : (
            todayTasks.map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-gray-900/50 backdrop-blur-sm border border-gold-400/20 rounded-xl p-4 ${
                  task.completed ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => toggleTask(task.id)}
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                        task.completed 
                          ? 'bg-gold-400 border-gold-400 text-black' 
                          : 'border-gray-500 hover:border-gold-400'
                      }`}
                    >
                      {task.completed && <SafeIcon icon={FiCheck} className="text-xs" />}
                    </motion.button>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className={`font-semibold ${
                          task.completed ? 'line-through text-gray-500' : 'text-white'
                        }`}>
                          {task.title}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs border ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                      </div>
                      {task.time && (
                        <div className="flex items-center space-x-1 mt-1">
                          <SafeIcon icon={FiClock} className="text-xs text-gray-400" />
                          <span className="text-sm text-gray-400">{task.time}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setEditingTask(task)}
                      className="p-2 text-blue-400 hover:bg-blue-400/20 rounded-lg transition-all duration-300"
                    >
                      <SafeIcon icon={FiEdit2} className="text-sm" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => deleteTask(task.id)}
                      className="p-2 text-red-400 hover:bg-red-400/20 rounded-lg transition-all duration-300"
                    >
                      <SafeIcon icon={FiTrash2} className="text-sm" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Add Task Modal */}
        {showAddTask && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gray-900 border border-gold-400/30 rounded-2xl p-6 w-full max-w-md"
            >
              <h3 className="text-xl font-semibold text-gold-400 mb-4">Add New Task</h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Task title"
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:outline-none focus:border-gold-400 text-white placeholder-gray-500"
                />
                <input
                  type="time"
                  value={newTask.time}
                  onChange={(e) => setNewTask({...newTask, time: e.target.value})}
                  className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:outline-none focus:border-gold-400 text-white"
                />
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                  className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:outline-none focus:border-gold-400 text-white"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
                <div className="flex space-x-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={addTask}
                    className="flex-1 bg-gold-400 text-black py-3 rounded-lg font-semibold hover:bg-gold-500 transition-all duration-300"
                  >
                    Add Task
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowAddTask(false)}
                    className="flex-1 bg-gray-700 text-white py-3 rounded-lg font-semibold hover:bg-gray-600 transition-all duration-300"
                  >
                    Cancel
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Edit Task Modal */}
        {editingTask && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gray-900 border border-gold-400/30 rounded-2xl p-6 w-full max-w-md"
            >
              <h3 className="text-xl font-semibold text-gold-400 mb-4">Edit Task</h3>
              <div className="space-y-4">
                <input
                  type="text"
                  value={editingTask.title}
                  onChange={(e) => setEditingTask({...editingTask, title: e.target.value})}
                  className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:outline-none focus:border-gold-400 text-white placeholder-gray-500"
                />
                <input
                  type="time"
                  value={editingTask.time}
                  onChange={(e) => setEditingTask({...editingTask, time: e.target.value})}
                  className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:outline-none focus:border-gold-400 text-white"
                />
                <select
                  value={editingTask.priority}
                  onChange={(e) => setEditingTask({...editingTask, priority: e.target.value})}
                  className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:outline-none focus:border-gold-400 text-white"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
                <div className="flex space-x-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => updateTask(editingTask.id, editingTask)}
                    className="flex-1 bg-gold-400 text-black py-3 rounded-lg font-semibold hover:bg-gold-500 transition-all duration-300"
                  >
                    Update Task
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setEditingTask(null)}
                    className="flex-1 bg-gray-700 text-white py-3 rounded-lg font-semibold hover:bg-gray-600 transition-all duration-300"
                  >
                    Cancel
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default DayPlanner;