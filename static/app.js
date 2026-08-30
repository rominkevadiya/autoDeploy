const API_URL = ''; // Since frontend is served by FastAPI, relative path is fine

document.addEventListener('DOMContentLoaded', () => {
    const taskForm = document.getElementById('task-form');
    const taskTitleInput = document.getElementById('task-title');
    const taskDescInput = document.getElementById('task-desc');
    const tasksList = document.getElementById('tasks-list');
    const taskCount = document.getElementById('task-count');
    const emptyState = document.getElementById('empty-state');

    // Fetch and display tasks on load
    fetchTasks();

    // Handle form submission
    taskForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const title = taskTitleInput.value.trim();
        const description = taskDescInput.value.trim();
        
        if (!title) return;

        const submitBtn = taskForm.querySelector('button');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="ri-loader-4-line ri-spin"></i> Adding...';
        submitBtn.disabled = true;

        try {
            const response = await fetch('/tasks/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ title, description })
            });

            if (response.ok) {
                taskTitleInput.value = '';
                taskDescInput.value = '';
                fetchTasks();
            }
        } catch (error) {
            console.error('Error adding task:', error);
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });

    // Fetch all tasks from backend
    async function fetchTasks() {
        try {
            const response = await fetch('/tasks/');
            const tasks = await response.json();
            renderTasks(tasks);
        } catch (error) {
            console.error('Error fetching tasks:', error);
        }
    }

    // Render tasks to the DOM
    function renderTasks(tasks) {
        // Clear current tasks (except empty state)
        const taskElements = tasksList.querySelectorAll('.task-item');
        taskElements.forEach(el => el.remove());

        taskCount.textContent = tasks.length;

        if (tasks.length === 0) {
            emptyState.classList.remove('hidden');
            return;
        }

        emptyState.classList.add('hidden');

        // Sort: incomplete first, then sort by ID descending
        tasks.sort((a, b) => {
            if (a.completed === b.completed) return b.id - a.id;
            return a.completed ? 1 : -1;
        });

        tasks.forEach(task => {
            const taskEl = document.createElement('div');
            taskEl.className = `task-item ${task.completed ? 'completed' : ''}`;
            taskEl.dataset.id = task.id;
            
            taskEl.innerHTML = `
                <div class="task-content">
                    <div class="task-checkbox" onclick="toggleTask(${task.id}, ${task.completed})">
                        <i class="ri-check-line"></i>
                    </div>
                    <div class="task-text">
                        <div class="task-title">${escapeHTML(task.title)}</div>
                        ${task.description ? `<div class="task-desc">${escapeHTML(task.description)}</div>` : ''}
                    </div>
                </div>
                <button class="delete-btn" onclick="deleteTask(${task.id})">
                    <i class="ri-delete-bin-line"></i>
                </button>
            `;
            
            tasksList.appendChild(taskEl);
        });
    }

    // Expose functions to global scope for onclick attributes
    window.toggleTask = async (id, currentStatus) => {
        try {
            const response = await fetch(`/tasks/${id}/toggle`, {
                method: 'PATCH'
            });
            
            if (response.ok) {
                fetchTasks();
            }
        } catch (error) {
            console.error('Error toggling task:', error);
        }
    };

    window.deleteTask = async (id) => {
        try {
            const response = await fetch(`/tasks/${id}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                fetchTasks();
            }
        } catch (error) {
            console.error('Error deleting task:', error);
        }
    };

    // Helper to prevent XSS
    function escapeHTML(str) {
        return str.replace(/[&<>'"]/g, 
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag] || tag)
        );
    }
});
