import React, { useState, useEffect } from 'react';
import TaskForm from './components/TaskForm';
import TaskItem from './components/TaskItem';
import Auth from './components/Auth';
import './index.css';

export default function App() {
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [tasks, setTasks] = useState([]);
    const [totalTasks, setTotalTasks] = useState(0);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    const API_URL = '/tasks/';

    const handleLogin = (newToken) => {
        setToken(newToken);
        localStorage.setItem('token', newToken);
    };

    const handleLogout = () => {
        setToken(null);
        localStorage.removeItem('token');
        setTasks([]);
        setTotalTasks(0);
    };

    const getHeaders = () => {
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    };

    const fetchTasks = async () => {
        if (!token) return;
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}?skip=0&limit=50`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.status === 401) {
                handleLogout();
                throw new Error('Session expired. Please login again.');
            }
            if (!res.ok) throw new Error('Could not load tasks. Check that the API is running.');
            const data = await res.json();
            setTasks(data.items);
            setTotalTasks(data.total);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, [token]);

    const addTask = async (title, description, category, due_date) => {
        try {
            const res = await fetch(API_URL, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({ title, description, category, due_date, completed: false })
            });
            if (res.status === 401) return handleLogout();
            if (!res.ok) throw new Error('Failed to add task');
            fetchTasks();
        } catch (err) {
            setError(err.message);
        }
    };

    const toggleTask = async (id, completed) => {
        try {
            const res = await fetch(`${API_URL}${id}/toggle`, {
                method: 'PATCH',
                headers: getHeaders()
            });
            if (res.status === 401) return handleLogout();
            if (!res.ok) throw new Error('Failed to update task');
            
            // Optimistic update
            setTasks(tasks.map(t => t.id === id ? { ...t, completed } : t));
        } catch (err) {
            setError(err.message);
        }
    };

    const editTask = async (id, updates) => {
        try {
            const res = await fetch(`${API_URL}${id}`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify({ 
                    title: updates.title, 
                    description: updates.description, 
                    category: updates.category,
                    due_date: updates.due_date,
                    completed: updates.completed 
                })
            });
            if (res.status === 401) return handleLogout();
            if (!res.ok) throw new Error('Failed to update task');
            fetchTasks();
        } catch (err) {
            setError(err.message);
        }
    };

    const deleteTask = async (id) => {
        try {
            const res = await fetch(`${API_URL}${id}`, { 
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.status === 401) return handleLogout();
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

            <header style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <div className="logo" style={{justifyContent: 'flex-start'}}>
                    <span className="logo-mark" aria-hidden="true">✓</span>
                    <h1>Taskflow</h1>
                </div>
                {token && (
                    <button onClick={handleLogout} style={{background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: '500'}}>
                        Logout
                    </button>
                )}
            </header>

            {error && (
                <div className="app-error" role="alert">
                    {error}
                </div>
            )}

            <main>
                {!token ? (
                    <Auth onLogin={handleLogin} />
                ) : (
                    <>
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
                    </>
                )}
            </main>
        </div>
    );
}
