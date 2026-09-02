import React, { useState } from 'react';

export default function TaskItem({ task, onToggle, onDelete, onEdit }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState(task.title);
    const [editDesc, setEditDesc] = useState(task.description || '');
    const [editCategory, setEditCategory] = useState(task.category || '');
    const [editDueDate, setEditDueDate] = useState(task.due_date ? new Date(task.due_date).toISOString().slice(0, 16) : '');

    const handleSave = () => {
        if (!editTitle.trim()) return;
        const formattedDate = editDueDate ? new Date(editDueDate).toISOString() : null;
        onEdit(task.id, { 
            title: editTitle, 
            description: editDesc,
            category: editCategory || null,
            due_date: formattedDate,
            completed: task.completed
        });
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
                        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                            <input 
                                type="text" 
                                value={editCategory} 
                                onChange={(e) => setEditCategory(e.target.value)} 
                                maxLength="50"
                                placeholder="Category (e.g. Work)"
                            />
                            <input 
                                type="datetime-local" 
                                value={editDueDate} 
                                onChange={(e) => setEditDueDate(e.target.value)} 
                            />
                        </div>
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span className="task-title">{task.title}</span>
                        {task.category && (
                            <span className="task-badge">{task.category}</span>
                        )}
                        {task.due_date && (
                            <span className={`task-date ${new Date(task.due_date) < new Date() && !task.completed ? 'overdue' : ''}`}>
                                🕒 {new Date(task.due_date).toLocaleString()}
                            </span>
                        )}
                    </div>
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
