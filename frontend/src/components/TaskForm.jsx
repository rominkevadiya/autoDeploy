import React, { useState } from 'react';

export default function TaskForm({ onAdd }) {
    const [title, setTitle] = useState('');
    const [desc, setDesc] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!title.trim()) return;
        onAdd(title, desc);
        setTitle('');
        setDesc('');
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
                <button type="submit" className="primary-btn">Add Task</button>
            </form>
        </div>
    );
}
