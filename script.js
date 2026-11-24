const input = document.getElementById("task-input");
const dueInput = document.getElementById("due-input");
const addBtn = document.getElementById("add-btn");
const list = document.getElementById("task-list");
const filterButtons = document.querySelectorAll(".filters button");

// Load saved tasks (or start with an empty list)
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

// which filter is selected (not saved, resets to "all" on reload)
let currentFilter = "all";

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// NEW: aaj ki date "YYYY-MM-DD" format mein (apne local time ke hisaab se)
function getToday() {
  const d = new Date();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return d.getFullYear() + "-" + month + "-" + day;
}

// decide which tasks to show
function getVisibleTasks() {
  if (currentFilter === "active") {
    return tasks.filter(function (task) {
      return !task.done;
    });
  }
  if (currentFilter === "done") {
    return tasks.filter(function (task) {
      return task.done;
    });
  }
  return tasks;
}

function renderTasks() {
  list.innerHTML = "";
  const today = getToday();

  getVisibleTasks().forEach(function (task) {
    const li = document.createElement("li");
    if (task.done) {
      li.classList.add("done");
    }

    const span = document.createElement("span");
    span.textContent = task.text;
    span.addEventListener("click", function () {
      task.done = !task.done;
      saveTasks();
      renderTasks();
    });

    // NEW: text aur due date ek saath
    const info = document.createElement("div");
    info.classList.add("info");
    info.appendChild(span);

    // NEW: purane tasks mein dueDate nahi hoti, wo bas skip ho jate hain
    if (task.dueDate) {
      const due = document.createElement("small");
      due.classList.add("due");
      due.textContent = "Due: " + task.dueDate;
      if (!task.done && task.dueDate < today) {
        due.classList.add("overdue");
        due.textContent += " (overdue)";
      }
      info.appendChild(due);
    }

    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.classList.add("edit-btn");
    editBtn.addEventListener("click", function () {
      const newText = prompt("Edit task:", task.text);
      if (newText === null) return; // Cancel dabaya
      const trimmed = newText.trim();
      if (trimmed === "") return; // khali text allowed nahi
      task.text = trimmed;
      saveTasks();
      renderTasks();
    });

    const delBtn = document.createElement("button");
    delBtn.textContent = "Delete";
    delBtn.addEventListener("click", function () {
      tasks = tasks.filter(function (t) {
        return t !== task;
      });
      saveTasks();
      renderTasks();
    });

    const actions = document.createElement("div");
    actions.classList.add("actions");
    actions.appendChild(editBtn);
    actions.appendChild(delBtn);

    li.appendChild(info);
    li.appendChild(actions);
    list.appendChild(li);
  });
}

function addTask() {
  const text = input.value.trim();
  if (text === "") return;

  // CHANGED: dueDate bhi save hoti hai (khali ho sakti hai)
  tasks.push({ text: text, done: false, dueDate: dueInput.value });
  saveTasks();
  renderTasks();
  input.value = "";
  dueInput.value = "";
}

addBtn.addEventListener("click", addTask);

input.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    addTask();
  }
});

// filter buttons
filterButtons.forEach(function (btn) {
  btn.addEventListener("click", function () {
    currentFilter = btn.dataset.filter;

    filterButtons.forEach(function (b) {
      b.classList.remove("active");
    });
    btn.classList.add("active");

    renderTasks();
  });
});

// Show saved tasks when the page opens
renderTasks();
