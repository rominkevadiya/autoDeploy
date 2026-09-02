import React, { useState } from 'react';

export default function TaskForm({ onAdd }) {
    const [title, setTitle] = useState('');
    const [desc, setDesc] = useState('');
    const [category, setCategory] = useState('');
    const [dueDate, setDueDate] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!title.trim()) return;
        const formattedDate = dueDate ? new Date(dueDate).toISOString() : null;
        onAdd(title, desc, category || null, formattedDate);
        setTitle('');
        setDesc('');
        setCategory('');
        setDueDate('');
    };

    return (
        <div className="glass-card add-task-card">
            <form id="task-form" onSubmit={handleSubmit}>
                <div className="input-group">
                    <input 
                        type="text" 
                        id="task-title" 
                        placeholder="What needs to be done?" 
                        required 
                        autoComplete="off" 
                        maxLength="200"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    <input 
                        type="text" 
                        id="task-desc" 
                        placeholder="Details (optional)" 
                        autoComplete="off" 
                        maxLength="2000"
                        value={desc}
                        onChange={(e) => setDesc(e.target.value)}
                    />
                </div>
                <div className="input-group">
                    <input 
                        type="text" 
                        placeholder="Category (e.g. Work)" 
                        maxLength="50"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                    />
                    <input 
                        type="datetime-local" 
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                    />
                </div>
                <button type="submit" className="primary-btn">Add Task</button>
            </form>
        </div>
    );
}
