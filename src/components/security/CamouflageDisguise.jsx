import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, CheckSquare, Plus, ArrowLeft, Lock, Search } from 'lucide-react';
import { useSecurity } from '../../context/SecurityContext';
import { triggerHaptic } from '../../utils/iosMotion';

export function CamouflageDisguise() {
  const { isCamouflageMode, toggleCamouflageMode } = useSecurity();
  const [tasks, setTasks] = useState([
    { id: 1, text: 'Buy groceries (Milk, Eggs, Bread)', done: true },
    { id: 2, text: 'Review quarterly project report', done: false },
    { id: 3, text: 'Schedule dentist appointment', done: false },
    { id: 4, text: 'Renew car insurance policy', done: true }
  ]);
  const [newTask, setNewTask] = useState('');

  if (!isCamouflageMode) return null;

  const handleToggleTask = (id) => {
    triggerHaptic('light');
    setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    setTasks([...tasks, { id: Date.now(), text: newTask.trim(), done: false }]);
    setNewTask('');
    triggerHaptic('medium');
  };

  const handleExitCamouflage = () => {
    triggerHaptic('success');
    toggleCamouflageMode();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 z-50 flex flex-col bg-[#121214] text-gray-200 select-none overflow-hidden font-sans"
      >
        {/* Subtle Disguised Header */}
        <header className="px-4 py-3 bg-[#18181b] border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <FileText className="w-3.5 h-3.5" />
            </div>
            <div>
              <h1 className="text-xs font-semibold text-gray-100 leading-tight">My Daily Notes</h1>
              <span className="text-[10px] text-gray-400 leading-none">Local Notepad v2.4</span>
            </div>
          </div>

          {/* Discreet Exit Button */}
          <button
            type="button"
            onClick={handleExitCamouflage}
            className="px-2.5 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-[11px] font-medium flex items-center gap-1 border border-gray-700 transition-colors"
            title="Return to PulsePath"
          >
            <Lock className="w-3 h-3 text-gray-400" />
            <span>Close Note</span>
          </button>
        </header>

        {/* Notes Search Bar */}
        <div className="p-3 bg-[#141416] border-b border-gray-800/80">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-gray-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              readOnly
              placeholder="Search notes and checklists..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-gray-900 border border-gray-800 text-xs text-gray-300 placeholder-gray-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Disguised Note Content */}
        <main className="flex-1 p-3.5 overflow-y-auto space-y-3">
          <div className="p-3 rounded-xl bg-gray-900/90 border border-gray-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-200">Personal Tasks</span>
              <span className="text-[10px] text-gray-500">Updated today</span>
            </div>

            <div className="space-y-1.5 pt-1">
              {tasks.map(task => (
                <div
                  key={task.id}
                  onClick={() => handleToggleTask(task.id)}
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-800/50 cursor-pointer text-xs text-gray-300 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={task.done}
                    onChange={() => {}}
                    className="accent-amber-500 rounded"
                  />
                  <span className={task.done ? 'line-through text-gray-500' : ''}>
                    {task.text}
                  </span>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddTask} className="pt-2 flex gap-1.5">
              <input
                type="text"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                placeholder="Add quick memo..."
                className="flex-1 px-2.5 py-1 text-xs rounded-lg bg-gray-800 border border-gray-700 text-gray-200 focus:outline-none"
              />
              <button
                type="submit"
                className="px-2.5 py-1 rounded-lg bg-gray-700 hover:bg-gray-600 text-xs text-white"
              >
                Add
              </button>
            </form>
          </div>

          <div className="p-3 rounded-xl bg-gray-900/60 border border-gray-800 text-xs text-gray-400 space-y-1">
            <div className="font-medium text-gray-300">Quick Reminder:</div>
            <p className="text-[11px] leading-relaxed">
              Back up local workspace files to cloud storage before the upcoming system maintenance window this Friday.
            </p>
          </div>
        </main>

        {/* Bottom Disguised Footer */}
        <footer className="px-3 py-2 bg-[#18181b] border-t border-gray-800 flex items-center justify-between text-[10px] text-gray-500">
          <span>Synced locally</span>
          <button
            type="button"
            onClick={handleExitCamouflage}
            className="text-gray-400 hover:text-white underline underline-offset-2"
          >
            Exit Disguise Mode
          </button>
        </footer>
      </motion.div>
    </AnimatePresence>
  );
}

export default CamouflageDisguise;
