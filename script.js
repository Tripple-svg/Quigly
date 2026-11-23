window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    setTimeout(() => {
        preloader.classList.add('fade-out');
    }, 1500);
});
//Localstorage
let tasks = JSON.parse(localStorage.getItem('quigly-tasks')) || [];
let currentFilter = 'all';
let searchQuery = '';

const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const taskCategory = document.getElementById('task-category');
const taskPriority = document.getElementById('task-priority');
const taskList = document.getElementById('task-list');
const taskCounter = document.getElementById('task-counter');
const clearCompletedBtn = document.getElementById('clear-completed');
const progressBarFill = document.getElementById('progress-bar-fill');
const progressPercentage = document.getElementById('progress-percentage');
const filterBtns = document.querySelectorAll('.filter-btn');
const searchInput = document.getElementById('search-input');
const themeToggle = document.getElementById('theme-toggle');

if (localStorage.getItem('quigly-theme') === 'light') {
    document.body.classList.add('light-mode');
    themeToggle.innerHTML = '<i class="fa-solid fa-moon"></i>';
}

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    
    if (document.body.classList.contains('light-mode')) {
        localStorage.setItem('quigly-theme', 'light');
        themeToggle.innerHTML = '<i class="fa-solid fa-moon"></i>';
    } else {
        localStorage.setItem('quigly-theme', 'dark');
        themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
    }
});


function renderTasks() {
    taskList.innerHTML = '';

    let filteredTasks = tasks.filter(task => {
        if (currentFilter === 'active') return !task.completed;
        if (currentFilter === 'completed') return task.completed;
        return true;
    });

    if (searchQuery) {
        filteredTasks = filteredTasks.filter(task => 
            task.text.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }

// No Tasks Found
    if (filteredTasks.length === 0) {
        taskList.innerHTML = `<li class="empty-state">No tasks found.</li>`;
    } else {
        filteredTasks.forEach(task => {
            const li = document.createElement('li');
            li.className = `task-item ${task.completed ? 'completed' : ''}`;
            
            li.innerHTML = `
                <div class="task-content">
                    <input type="checkbox" ${task.completed ? 'checked' : ''} onchange="toggleTask(${task.id})">
                    <div>
                        <span class="task-text">${task.text}</span>
                        <div class="task-tags">
                            <span class="tag ${task.category.toLowerCase()}">${task.category}</span>
                            <span class="tag ${task.priority.toLowerCase()}">${task.priority}</span>
                        </div>
                    </div>
                </div>
                <div class="task-actions">
                    <button class="delete-btn" onclick="deleteTask(${task.id})"><i class="fa-solid fa-trash"></i></button>
                </div>
            `;
            taskList.appendChild(li);
        });
    }

    updateStats();
}

function addTask(e) {
    e.preventDefault(); // Stop page reload
    const text = taskInput.value.trim();
    
    if (!text) {
        alert("Please enter a task!");
        return;
    }

    const newTask = {
        id: Date.now(),
        text: text,
        category: taskCategory.value,
        priority: taskPriority.value,
        completed: false
    };

    tasks.push(newTask);
    saveAndRender();
    taskInput.value = '';
}

function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    saveAndRender();
}

function toggleTask(id) {
    tasks = tasks.map(task => {
        if (task.id === id) {
            return { ...task, completed: !task.completed };
        }
        return task;
    });
    saveAndRender();
}

function clearCompleted() {
    tasks = tasks.filter(task => !task.completed);
    saveAndRender();
}


function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(task => task.completed).length;
    const active = total - completed;

    taskCounter.textContent = `${active} task${active !== 1 ? 's' : ''} left`;

    let percentage = 0;
    if (total > 0) {
        percentage = Math.round((completed / total) * 100);
    }
    
    progressBarFill.style.width = `${percentage}%`;
    progressPercentage.textContent = `${percentage}%`;
}

function saveAndRender() {
    localStorage.setItem('quigly-tasks', JSON.stringify(tasks));
    renderTasks();
}

// Event Listeners
taskForm.addEventListener('submit', addTask);
clearCompletedBtn.addEventListener('click', clearCompleted);

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        currentFilter = btn.dataset.filter;
        renderTasks();
    });
});

searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    renderTasks();
});

renderTasks();