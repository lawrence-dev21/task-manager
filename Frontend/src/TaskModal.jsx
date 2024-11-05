import React from 'react';
import '/src/main.css';

const TaskModal = ({ isOpen, onClose, onSubmit, task, setTask, error, isLoading }) => {
    if (!isOpen) return null;

    const handleFormSubmit = (e) => {
        e.preventDefault();
        onSubmit(e);
    };

    return (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-70 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full transition-transform transform hover:scale-105">
                <h2 className="text-2xl font-semibold mb-4 text-center">{task.id ? 'Edit Task' : 'Add New Task'}</h2>
                <form onSubmit={handleFormSubmit} className="space-y-4">
                    <input
                        type="text"
                        value={task.name || ''}
                        onChange={(e) => setTask(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Task Name"
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
                        required
                    />
                    <textarea
                        value={task.description || ''}
                        onChange={(e) => setTask(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Task Description"
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
                        required
                    />
                    <input
                        type="date"
                        value={task.dueDate || ''}
                        onChange={(e) => setTask(prev => ({ ...prev, dueDate: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
                        required
                    />

                    {error && <p className="text-red-500 text-sm">{error}</p>}

                    <div className="flex justify-end space-x-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition flex items-center"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <span className="loader mr-2"></span> // Add your loader styling here
                            ) : (
                                task.id ? 'Update Task' : 'Add Task'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TaskModal;
