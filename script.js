// --- PRELOADER LOGIC ---
window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    
    // Wait for 1.5 seconds (to let the line draw animation finish)
    setTimeout(() => {
        preloader.classList.add('fade-out');
    }, 1500);
});

// 1. STATE & SELECTIONS
// We store all our tasks in this array.
// We check localStorage first to see if tasks exist. If not, we start with an empty array.
let tasks = JSON.parse(localStorage.getItem('quigly-tasks')) || [];
let currentFilter = 'all';
let searchQuery = '';

// DOM Elements
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


// 2. THEME TOGGLE
// Check local storage for theme preference on load
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


// 3. RENDER FUNCTION (The UI Engine)
// This function takes our 'tasks' array, filters it, and draws it to the screen.
function renderTasks() {
    taskList.innerHTML = ''; // Clear current list

    // Apply Filter (All, Active, Completed)
    let filteredTasks = tasks.filter(task => {
        if (currentFilter === 'active') return !task.completed;
        if (currentFilter === 'completed') return task.completed;
        return true;
    });

    // Apply Search Filter
    if (searchQuery) {
        filteredTasks = filteredTasks.filter(task => 
            task.text.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }

    // Loop through tasks and create HTML for each
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

    updateStats();
}

// 4. TASK ACTIONS (Add, Delete, Toggle)
function addTask(e) {
    e.preventDefault(); // Stop page reload
    const text = taskInput.value.trim();
    
    // Validation: Don't allow empty tasks
    if (!text) {
        alert("Please enter a task!");
        return;
    }

    const newTask = {
        id: Date.now(), // Unique ID based on timestamp
        text: text,
        category: taskCategory.value,
        priority: taskPriority.value,
        completed: false
    };

    tasks.push(newTask);
    saveAndRender();
    taskInput.value = ''; // Clear input
}

function deleteTask(id) {
    // Keep only tasks that DON'T match the id
    tasks = tasks.filter(task => task.id !== id);
    saveAndRender();
}

function toggleTask(id) {
    // Find the task and flip its completed status
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


// 5. STATS & PROGRESS BAR
function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(task => task.completed).length;
    const active = total - completed;

    // Update counter
    taskCounter.textContent = `${active} task${active !== 1 ? 's' : ''} left`;

    // Update progress bar
    let percentage = 0;
    if (total > 0) {
        percentage = Math.round((completed / total) * 100);
    }
    
    progressBarFill.style.width = `${percentage}%`;
    progressPercentage.textContent = `${percentage}%`;
}

// 6. HELPER & EVENT LISTENERS
function saveAndRender() {
    // Save to localStorage
    localStorage.setItem('quigly-tasks', JSON.stringify(tasks));
    // Re-draw UI
    renderTasks();
}

// Event Listeners
taskForm.addEventListener('submit', addTask);
clearCompletedBtn.addEventListener('click', clearCompleted);

// Filter Buttons
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Remove active class from all
        filterBtns.forEach(b => b.classList.remove('active'));
        // Add to clicked
        btn.classList.add('active');
        
        currentFilter = btn.dataset.filter;
        renderTasks();
    });
});

// Search Box
searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    renderTasks();
});

// Initial Render on page load
renderTasks();