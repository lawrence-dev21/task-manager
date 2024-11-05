import React, { useEffect, useState } from 'react'; 
import axios from 'axios';
import TaskModal from './TaskModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faCheck } from '@fortawesome/free-solid-svg-icons';
import '/src/main.css';

const Home = () => {
    const [tasks, setTasks] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [task, setTask] = useState({ id: null, name: '', description: '', dueDate: '' });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [filterText, setFilterText] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const tasksPerPage = 5;

    const fetchTasks = async () => {
        try {
            const res = await axios.get('http://localhost:5000/gettasks');
           // console.log('Fetched tasks:', res.data);
            setTasks(res.data);
        } catch (error) {
            console.error('Error fetching tasks:', error);
            setError('Failed to fetch tasks');
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    // const handleAddTask = async () => {
    //     if (!task.name || !task.description || !task.dueDate) {
    //         setError('All fields are required.');
    //         return;
    //     }
    //     setIsLoading(true);
    //     try {
    //         await axios.post('http://localhost:5000/addtask', {
    //             name: task.name,
    //             description: task.description,
    //             due_date: task.dueDate,
    //         });
    //         closeModal(); // Close the modal
    //         await fetchTasks(); // Refresh the task list
    //     } catch (error) {
    //         console.error('Error adding task:', error);
    //         setError(error.response?.data?.message || 'Failed to add task'); // Display backend error message
    //     } finally {
    //         setIsLoading(false);
    //     }
    // };
    
    // const handleUpdateTask = async () => {
    //     if (!task.name || !task.description || !task.dueDate) {
    //         setError('All fields are required.');
    //         return;
    //     }
    //     setIsLoading(true);
    //     try {
    //         await axios.put(`http://localhost:5000/update/${task.id}`, {
    //             name: task.name,
    //             description: task.description,
    //             due_date: task.dueDate,
    //         });
    //         closeModal(); // Close the modal
    //         await fetchTasks(); // Refresh the task list
    //     } catch (error) {
    //         console.error('Error updating task:', error);
    //         setError(error.response?.data?.message || 'Failed to update task'); // Display backend error message
    //     } finally {
    //         setIsLoading(false);
    //     }
    // };
    
    const handleAddTask = async () => {
        if (!task.name || !task.description || !task.dueDate) {
            setError('All fields are required.');
            return;
        }
        setIsLoading(true);
        try {
            await axios.post('http://localhost:5000/addtask', {
                name: task.name,
                description: task.description,
                due_date: task.dueDate,
            });
            closeModal(); // Close the modal
            await fetchTasks(); // Refresh the task list
        } catch (error) {
            if (error.response && error.response.status === 409) {
                setError('A task with this name already exists.');
            } else {
                setError('Failed to add task');
            }
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleUpdateTask = async () => {
        if (!task.name || !task.description || !task.dueDate) {
            setError('All fields are required.');
            return;
        }
        setIsLoading(true);
        try {
            await axios.put(`http://localhost:5000/update/${task.id}`, {
                name: task.name,
                description: task.description,
                due_date: task.dueDate,
            });
            closeModal(); // Close the modal
            await fetchTasks(); // Refresh the task list
        } catch (error) {
            if (error.response && error.response.status === 409) {
                setError('A task with this name already exists.');
            } else {
                setError('Failed to update task');
            }
        } finally {
            setIsLoading(false);
        }
    };
    
    const openModal = (task = {}) => {
        setTask(task);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setTask({ id: null, name: '', description: '', dueDate: '' });
        setIsModalOpen(false);
        setError('');
    };

    const filteredTasks = tasks.filter(todo => {
        const statusMatch = filterStatus === 'all' || 
                            (filterStatus === 'done' && todo.status) || 
                            (filterStatus === 'pending' && !todo.status);
        
        const textMatch = todo.name.toLowerCase().includes(filterText.toLowerCase()) || 
                          todo.description.toLowerCase().includes(filterText.toLowerCase());

        return statusMatch && textMatch;
    });

    const indexOfLastTask = currentPage * tasksPerPage;
    const indexOfFirstTask = indexOfLastTask - tasksPerPage;
    const currentTasks = filteredTasks.slice(indexOfFirstTask, indexOfLastTask);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this task?')) {
            try {
                await axios.delete('http://localhost:5000/delete-task', { data: { id } });
                fetchTasks();
            } catch (error) {
                console.error('Error deleting task:', error);
                setError('Failed to delete task');
            }
        }
    };

    const handleComplete = async (id) => {
        try {
            await axios.post('http://localhost:5000/complete-task', { id });
            fetchTasks();
        } catch (error) {
            console.error('Error completing task:', error);
            setError('Failed to complete task');
        }
    };

    return (
        <div className="bg-gray-100 min-h-screen flex flex-col items-center p-7">
            <div className="bg-white w-full max-w-6xl p-8 rounded-lg shadow-lg">
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Task Manager</h2>
                <div className="flex justify-between mb-4">
                    <select 
                        className="border border-gray-300 rounded-lg p-2 w-1/4 focus:ring focus:ring-blue-400"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="all">All</option>
                        <option value="pending">Pending</option>
                        <option value="done">Done</option>
                    </select>
                    <button 
                        onClick={() => openModal()} 
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                    >
                        <FontAwesomeIcon icon={faPlus} className="mr-2" /> Add New Task
                    </button>
                </div>
                
                {error && <div className="text-red-500 mb-4 text-center">{error}</div>}
                
                <table className="w-full table-auto border-collapse bg-white rounded-lg shadow-md">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="p-2 border">Task ID</th>
                            <th className="p-2 border">Task Name</th>
                            <th className="p-2 border">Description</th>
                            <th className="p-2 border">Due Date</th>
                            <th className="p-2 border">Status</th>
                            <th className="p-2 border">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentTasks.map((todo) => (
                            <tr key={todo.id} className="text-center even:bg-gray-100">
                                <td className="p-2 border">{todo.id}</td>
                                <td className="p-2 border">{todo.name}</td>
                                <td className="p-2 border">{todo.description}</td>
                                <td className="p-2 border">{new Date(todo.due_date).toLocaleDateString()}</td>
                                <td className="p-2 border">
                                    {todo.status ? 'Done' : 'Pending'}
                                </td>
                                <td className="p-2 border flex justify-center space-x-2">
                                    {todo.status === 0 && ( // Show actions for pending tasks
                                        <>
                                            <button
                                                onClick={() => openModal(todo)}
                                                className="text-blue-500 hover:underline transition"
                                            >
                                                <FontAwesomeIcon icon={faEdit} className="mr-1" /> 
                                            </button>
                                            <button
                                                onClick={() => handleDelete(todo.id)}
                                                className="text-red-500 hover:underline transition"
                                            >
                                                <FontAwesomeIcon icon={faTrash} className="mr-1" /> 
                                            </button>
                                            <button
                                                onClick={() => handleComplete(todo.id)}
                                                className="text-green-500 hover:underline transition"
                                            >
                                                <FontAwesomeIcon icon={faCheck} className="mr-1" />
                                            </button>
                                        </>
                                    )}
                                    {todo.status === 1 && ( // Only show delete for completed tasks
                                        <button
                                            onClick={() => handleDelete(todo.id)}
                                            className="text-red-500 hover:underline transition"
                                        >
                                            <FontAwesomeIcon icon={faTrash} className="mr-1" /> Delete
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Pagination */}
                <div className="flex justify-center mt-4 space-x-2">
                    {Array.from({ length: Math.ceil(filteredTasks.length / tasksPerPage) }, (_, index) => (
                        <button 
                            key={index + 1}
                            onClick={() => paginate(index + 1)}
                            className={`px-4 py-2 rounded-lg transition ${currentPage === index + 1 ? 'bg-blue-600 text-white' : 'bg-gray-300 hover:bg-gray-400'}`}
                        >
                            {index + 1}
                        </button>
                    ))}
                </div>
            </div>
            <TaskModal
                isOpen={isModalOpen}
                onClose={closeModal}
                onSubmit={task.id ? handleUpdateTask : handleAddTask} // Determine whether to add or update
                task={task}
                error={error}
                setTask={setTask}
                isLoading={isLoading}
            />
        </div>
    );
};

export default Home;
