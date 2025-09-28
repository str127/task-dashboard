// --- Initialize Tasks ---
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

const taskContainer = document.getElementById("taskContainer");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskModal = document.getElementById("taskModal");
const closeModal = document.getElementById("closeModal");
const taskForm = document.getElementById("taskForm");
const taskTitle = document.getElementById("taskTitle");
const taskDescription = document.getElementById("taskDescription");
const taskCategory = document.getElementById("taskCategory");
const taskPriority = document.getElementById("taskPriority");
const searchInput = document.getElementById("searchInput");
const filterStatus = document.getElementById("filterStatus");
const filterPriority = document.getElementById("filterPriority");
const sortBy = document.getElementById("sortBy");

// --- Toast Function ---
function showToast(message) {
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerText = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add("show"), 100);
    setTimeout(() => { toast.classList.remove("show"); setTimeout(() => toast.remove(), 500); }, 2000);
}

// --- Save to LocalStorage ---
function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

// --- Render Tasks ---
function renderTasks() {
    // Filter tasks
    let filteredTasks = tasks.filter(task =>
        task.title.toLowerCase().includes(searchInput.value.toLowerCase()) &&
        (filterStatus.value === "all" || task.status === filterStatus.value) &&
        (filterPriority.value === "all" || task.priority === filterPriority.value)
    );

    // Sort tasks
    if (sortBy.value === "priority") {
        const order = { high: 1, medium: 2, low: 3 };
        filteredTasks.sort((a, b) => order[a.priority] - order[b.priority]);
    } else {
        filteredTasks.sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    // Clear container
    taskContainer.innerHTML = "";

    filteredTasks.forEach((task, index) => {
        const taskEl = document.createElement("div");
        taskEl.className = `task ${task.priority} ${task.status}`;
        taskEl.setAttribute("draggable", true);
        taskEl.innerHTML = `
            <h3>${task.title}</h3>
            <p>${task.description}</p>
            <small>${task.category} | ${task.priority}</small>
            <div class="task-buttons">
                <button onclick="toggleStatus(${index})">${task.status==="completed"?"Undo":"Done"}</button>
                <button onclick="deleteTask(${index})">Delete</button>
            </div>
        `;
        taskContainer.appendChild(taskEl);

        // Drag events
        taskEl.addEventListener("dragstart", e => e.dataTransfer.setData("text/plain", index));
        // Double click to edit
        taskEl.addEventListener("dblclick", () => editTask(index));
    });
}

// --- Add Task ---
function addTask(title, description, category, priority) {
    tasks.push({ title, description, category, priority, date: new Date(), status: "pending" });
    saveTasks();
    renderTasks();
    showToast("Task added!");
}

// --- Delete Task ---
function deleteTask(index) {
    tasks.splice(index, 1);
    saveTasks();
    renderTasks();
    showToast("Task deleted!");
}

// --- Toggle Task Status ---
function toggleStatus(index) {
    tasks[index].status = tasks[index].status === "completed" ? "pending" : "completed";
    saveTasks();
    renderTasks();
}

// --- Edit Task ---
function editTask(index) {
    taskModal.style.display = "block";
    taskTitle.value = tasks[index].title;
    taskDescription.value = tasks[index].description;
    taskCategory.value = tasks[index].category;
    taskPriority.value = tasks[index].priority;

    taskForm.onsubmit = e => {
        e.preventDefault();
        tasks[index] = {
            title: taskTitle.value,
            description: taskDescription.value,
            category: taskCategory.value,
            priority: taskPriority.value,
            date: tasks[index].date,
            status: tasks[index].status
        };
        saveTasks();
        renderTasks();
        taskModal.style.display = "none";
        taskForm.reset();
        showToast("Task updated!");
        taskForm.onsubmit = defaultSubmit;
    };
}

// --- Default Form Submit ---
const defaultSubmit = e => {
    e.preventDefault();
    addTask(taskTitle.value, taskDescription.value, taskCategory.value, taskPriority.value);
    taskModal.style.display = "none";
    taskForm.reset();
};
taskForm.onsubmit = defaultSubmit;

// --- Event Listeners ---
addTaskBtn.onclick = () => taskModal.style.display = "block";
closeModal.onclick = () => taskModal.style.display = "none";

searchInput.oninput = renderTasks;
filterStatus.onchange = renderTasks;
filterPriority.onchange = renderTasks;
sortBy.onchange = renderTasks;

// Keyboard shortcuts
document.addEventListener("keydown", e => {
    if (e.ctrlKey && e.key === "n") taskModal.style.display = "block";
});

// --- Drag-and-Drop Reordering ---
taskContainer.addEventListener("dragover", e => e.preventDefault());
taskContainer.addEventListener("drop", e => {
    const fromIndex = e.dataTransfer.getData("text/plain");
    const toIndex = Array.from(taskContainer.children).indexOf(e.target.closest(".task"));
    if (toIndex >= 0 && fromIndex != toIndex) {
        const [movedTask] = tasks.splice(fromIndex, 1);
        tasks.splice(toIndex, 0, movedTask);
        saveTasks();
        renderTasks();
    }
});

// --- Initial Render ---
renderTasks();
