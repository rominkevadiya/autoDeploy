import React, { useState, useEffect } from 'react';
import TaskForm from './components/TaskForm';
import TaskItem from './components/TaskItem';
import './index.css';

export default function App() {
    const [tasks, setTasks] = useState([]);
    const [totalTasks, setTotalTasks] = useState(0);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    const API_URL = '/tasks/';

    const fetchTasks = async () => {
        try {
            const res = await fetch(`${API_URL}?skip=0&limit=50`);
            if (!res.ok) throw new Error('Could not load tasks. Check that the API is running.');
            const data = await res.json();
            setTasks(data.items);
            setTotalTasks(data.total_count);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const addTask = async (title, description) => {
        try {
            const res = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, description, completed: false })
            });
            if (!res.ok) throw new Error('Failed to add task');
            fetchTasks();
        } catch (err) {
            setError(err.message);
        }
    };

    const toggleTask = async (id, completed) => {
        try {
            const res = await fetch(`${API_URL}${id}?completed=${completed}`, {
                method: 'PUT'
            });
            if (!res.ok) throw new Error('Failed to update task');
            
            // Optimistic update
            setTasks(tasks.map(t => t.id === id ? { ...t, completed } : t));
        } catch (err) {
            setError(err.message);
        }
    };

    const editTask = async (id, updates) => {
        try {
            const res = await fetch(`${API_URL}${id}?title=${encodeURIComponent(updates.title)}&description=${encodeURIComponent(updates.description || '')}`, {
                method: 'PUT'
            });
            if (!res.ok) throw new Error('Failed to update task');
            fetchTasks();
        } catch (err) {
            setError(err.message);
        }
    };

    const deleteTask = async (id) => {
        try {
            const res = await fetch(`${API_URL}${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete task');
            // Optimistic update
            setTasks(tasks.filter(t => t.id !== id));
            setTotalTasks(prev => prev - 1);
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="container">
            <div className="background-orbs">
                <div className="orb orb-1"></div>
                <div className="orb orb-2"></div>
                <div className="orb orb-3"></div>
            </div>

            <header>
                <div className="logo">
                    <span className="logo-mark" aria-hidden="true">✓</span>
                    <h1>Taskflow</h1>
                </div>
                <p>Organize your work, effortlessly.</p>
            </header>

            {error && (
                <div className="app-error" role="alert">
                    {error}
                </div>
            )}

            <main>
                <TaskForm onAdd={addTask} />

                <div className="tasks-container">
                    <div className="tasks-header">
                        <h2>Your Tasks</h2>
                        <span className="badge">{totalTasks}</span>
                    </div>
                    {totalTasks > 50 && (
                        <p className="page-note">Showing the first 50 tasks.</p>
                    )}

                    <div className="tasks-list">
                        {loading && <p style={{textAlign: 'center', color: 'var(--text-secondary)'}}>Loading tasks...</p>}
                        {!loading && tasks.length === 0 && (
                            <div className="empty-state">
                                <p>No tasks yet. Add one above!</p>
                            </div>
                        )}
                        {tasks.map(task => (
                            <TaskItem 
                                key={task.id} 
                                task={task} 
                                onToggle={toggleTask} 
                                onDelete={deleteTask} 
                                onEdit={editTask}
                            />
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
