// ----------------- Elements -----------------
const taskForm = document.getElementById("new-task-form");
const taskInput = document.getElementById("task-input");
const taskList = document.getElementById("task-list");
const itemsLeft = document.getElementById("items-left");
const toast = document.getElementById("toast");
const filterBtns = document.querySelectorAll("[data-filter]");
const clearCompletedBtn = document.getElementById("clear-completed");
const taskTemplate = document.getElementById("task-item-template");

// ----------------- State -----------------
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let currentFilter = "all";

// ----------------- Functions -----------------
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function renderTasks() {
  taskList.innerHTML = "";

  let filteredTasks = tasks;
  if (currentFilter === "active") {
    filteredTasks = tasks.filter((t) => !t.completed);
  } else if (currentFilter === "completed") {
    filteredTasks = tasks.filter((t) => t.completed);
  }

  filteredTasks.forEach((task) => {
    const taskNode = taskTemplate.content.cloneNode(true);
    const li = taskNode.querySelector("li");
    li.dataset.id = task.id;

    const checkbox = li.querySelector(".task__toggle");
    const textSpan = li.querySelector(".task__text");
    const editBtn = li.querySelector(".edit");
    const deleteBtn = li.querySelector(".delete");

    checkbox.checked = task.completed;
    textSpan.textContent = task.text;
    if (task.completed) li.classList.add("completed");

    // Toggle completion
    checkbox.addEventListener("change", () => toggleTask(task.id));

    // Edit
    editBtn.addEventListener("click", () => editTask(task.id, textSpan));

    // Delete
    deleteBtn.addEventListener("click", () => deleteTask(task.id));

    taskList.appendChild(li);
  });

  updateItemsLeft();
}

function updateItemsLeft() {
  const count = tasks.filter((t) => !t.completed).length;
  itemsLeft.textContent = `${count} item${count !== 1 ? "s" : ""} left`;
}

function addTask(text) {
  if (!text.trim()) {
    showToast("Task cannot be empty!");
    return;
  }

  const newTask = { id: Date.now(), text, completed: false };
  tasks.push(newTask);
  saveTasks();
  renderTasks();
}

function toggleTask(id) {
  const task = tasks.find((t) => t.id === id);
  if (task) {
    task.completed = !task.completed;
    saveTasks();
    renderTasks();

    // 🎉 Confetti when task is completed
    if (task.completed && typeof confetti === "function") {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#ff6ec4", "#8e2de2", "#4facfe", "#43e97b", "#22c55e"]
      });
    }
  }
}

function editTask(id, textSpan) {
  const task = tasks.find((t) => t.id === id);
  if (!task) return;

  const editing = textSpan.isContentEditable;
  if (!editing) {
    textSpan.contentEditable = true;
    textSpan.focus();
  } else {
    textSpan.contentEditable = false;
    task.text = textSpan.textContent.trim() || task.text;
    saveTasks();
    renderTasks();
  }
}

function deleteTask(id) {
  tasks = tasks.filter((t) => t.id !== id);
  saveTasks();
  renderTasks();
}

function clearCompleted() {
  tasks = tasks.filter((t) => !t.completed);
  saveTasks();
  renderTasks();
}

function showToast(message) {
  toast.textContent = message;
  setTimeout(() => (toast.textContent = ""), 2000);
}

// ----------------- Event Listeners -----------------
taskForm.addEventListener("submit", (e) => {
  e.preventDefault();
  addTask(taskInput.value);
  taskInput.value = "";
});

filterBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterBtns.forEach((b) => b.classList.remove("chip--active"));
    btn.classList.add("chip--active");
    currentFilter = btn.dataset.filter;
    renderTasks();
  });
});

clearCompletedBtn.addEventListener("click", clearCompleted);

// ----------------- Init -----------------
renderTasks();
