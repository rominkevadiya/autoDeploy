const PAGE_LIMIT = 50;

document.addEventListener('DOMContentLoaded', () => {
    const taskForm = document.getElementById('task-form');
    const taskTitleInput = document.getElementById('task-title');
    const taskDescInput = document.getElementById('task-desc');
    const tasksList = document.getElementById('tasks-list');
    const taskCount = document.getElementById('task-count');
    const emptyState = document.getElementById('empty-state');
    const errorBanner = document.getElementById('app-error');
    const pageNote = document.getElementById('page-note');

    fetchTasks();

    taskForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const title = taskTitleInput.value.trim();
        const description = taskDescInput.value.trim();

        if (!title) return;

        const submitBtn = taskForm.querySelector('button');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Adding...';
        submitBtn.disabled = true;

        try {
            const response = await fetch('/tasks/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ title, description: description || null })
            });

            if (response.ok) {
                clearError();
                taskTitleInput.value = '';
                taskDescInput.value = '';
                fetchTasks();
            } else {
                showError(await errorMessage(response, 'Could not add task.'));
            }
        } catch (error) {
            showError('Could not reach the server. Try again.');
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });

    async function fetchTasks() {
        try {
            const response = await fetch(`/tasks/?skip=0&limit=${PAGE_LIMIT}`);
            if (!response.ok) {
                showError(await errorMessage(response, 'Could not load tasks.'));
                return;
            }
            const tasks = await response.json();
            clearError();
            renderTasks(tasks);
        } catch (error) {
            showError('Could not load tasks. Check that the API is running.');
        }
    }

    function renderTasks(tasks) {
        const taskElements = tasksList.querySelectorAll('.task-item');
        taskElements.forEach(el => el.remove());

        taskCount.textContent = tasks.length;
        pageNote.classList.toggle('hidden', tasks.length < PAGE_LIMIT);

        if (tasks.length === 0) {
            emptyState.classList.remove('hidden');
            return;
        }

        emptyState.classList.add('hidden');

        tasks.sort((a, b) => {
            if (a.completed === b.completed) return b.id - a.id;
            return a.completed ? 1 : -1;
        });

        tasks.forEach(task => {
            const taskEl = document.createElement('div');
            taskEl.className = `task-item ${task.completed ? 'completed' : ''}`;
            taskEl.dataset.id = String(task.id);

            const title = escapeHTML(task.title);
            const description = task.description ? escapeHTML(task.description) : '';

            taskEl.innerHTML = `
                <div class="task-content">
                    <button type="button" class="task-checkbox" data-action="toggle" aria-label="Toggle complete"></button>
                    <div class="task-text" data-view>
                        <div class="task-title">${title}</div>
                        ${description ? `<div class="task-desc">${description}</div>` : ''}
                    </div>
                    <form class="edit-form hidden" data-edit>
                        <input type="text" name="title" value="${title}" maxlength="200" required>
                        <input type="text" name="description" value="${description}" maxlength="2000" placeholder="Details (optional)">
                        <div class="edit-actions">
                            <button type="submit" class="text-btn">Save</button>
                            <button type="button" class="text-btn" data-action="cancel-edit">Cancel</button>
                        </div>
                    </form>
                </div>
                <div class="task-actions">
                    <button type="button" class="text-btn" data-action="edit">Edit</button>
                    <button type="button" class="delete-btn" data-action="delete" aria-label="Delete task">Delete</button>
                </div>
            `;

            const view = taskEl.querySelector('[data-view]');
            const editForm = taskEl.querySelector('[data-edit]');

            taskEl.querySelector('[data-action="toggle"]').addEventListener('click', () => toggleTask(task.id));
            taskEl.querySelector('[data-action="delete"]').addEventListener('click', () => deleteTask(task.id));
            taskEl.querySelector('[data-action="edit"]').addEventListener('click', () => {
                view.classList.add('hidden');
                editForm.classList.remove('hidden');
            });
            taskEl.querySelector('[data-action="cancel-edit"]').addEventListener('click', () => {
                editForm.reset();
                editForm.classList.add('hidden');
                view.classList.remove('hidden');
            });
            editForm.addEventListener('submit', async (event) => {
                event.preventDefault();
                const formData = new FormData(editForm);
                await updateTask(task.id, {
                    title: String(formData.get('title') || '').trim(),
                    description: String(formData.get('description') || '').trim() || null,
                    completed: task.completed,
                });
            });

            tasksList.appendChild(taskEl);
        });
    }

    async function toggleTask(id) {
        try {
            const response = await fetch(`/tasks/${id}/toggle`, { method: 'PATCH' });
            if (response.ok) {
                clearError();
                fetchTasks();
            } else {
                showError(await errorMessage(response, 'Could not update task.'));
            }
        } catch (error) {
            showError('Could not update task.');
        }
    }

    async function deleteTask(id) {
        try {
            const response = await fetch(`/tasks/${id}`, { method: 'DELETE' });
            if (response.ok) {
                clearError();
                fetchTasks();
            } else {
                showError(await errorMessage(response, 'Could not delete task.'));
            }
        } catch (error) {
            showError('Could not delete task.');
        }
    }

    async function updateTask(id, payload) {
        try {
            const response = await fetch(`/tasks/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (response.ok) {
                clearError();
                fetchTasks();
            } else {
                showError(await errorMessage(response, 'Could not save task.'));
            }
        } catch (error) {
            showError('Could not save task.');
        }
    }

    function showError(message) {
        errorBanner.textContent = message;
        errorBanner.classList.remove('hidden');
    }

    function clearError() {
        errorBanner.textContent = '';
        errorBanner.classList.add('hidden');
    }

    async function errorMessage(response, fallback) {
        try {
            const data = await response.json();
            if (typeof data.detail === 'string') return data.detail;
        } catch (error) {
            // body was not JSON
        }
        return fallback;
    }

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
