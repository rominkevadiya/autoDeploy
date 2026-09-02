import React, { useState } from 'react';

export default function TaskItem({ task, onToggle, onDelete, onEdit }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState(task.title);
    const [editDesc, setEditDesc] = useState(task.description || '');

    const handleSave = () => {
        if (!editTitle.trim()) return;
        onEdit(task.id, { title: editTitle, description: editDesc });
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <div className="task-item">
                <div className="task-content">
                    <div className="edit-form">
                        <input 
                            type="text" 
                            value={editTitle} 
                            onChange={(e) => setEditTitle(e.target.value)} 
                            maxLength="200"
                            autoFocus
                        />
                        <input 
                            type="text" 
                            value={editDesc} 
                            onChange={(e) => setEditDesc(e.target.value)} 
                            maxLength="2000"
                            placeholder="Details (optional)"
                        />
                    </div>
                    <div className="edit-actions">
                        <button className="text-btn" onClick={handleSave}>Save</button>
                        <button className="text-btn" onClick={() => setIsEditing(false)}>Cancel</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`task-item ${task.completed ? 'completed' : ''}`}>
            <div className="task-content">
                <button 
                    className="task-checkbox" 
                    onClick={() => onToggle(task.id, !task.completed)}
                    aria-label={task.completed ? "Mark incomplete" : "Mark complete"}
                />
                <div className="task-text">
                    <span className="task-title">{task.title}</span>
                    {task.description && <span className="task-desc">{task.description}</span>}
                </div>
            </div>
            <div className="task-actions">
                <button className="text-btn" onClick={() => setIsEditing(true)}>Edit</button>
                <button className="delete-btn" onClick={() => onDelete(task.id)}>Delete</button>
            </div>
        </div>
    );
}
