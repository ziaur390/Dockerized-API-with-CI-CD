const state = { tasks: [], view: "all", search: "", loading: true, loadError: false };
const list = document.querySelector("#task-list");
const emptyState = document.querySelector("#empty-state");
const feedback = document.querySelector("#feedback");
const form = document.querySelector("#task-form");
const titleInput = document.querySelector("#task-title");
const searchInput = document.querySelector("#task-search");
let feedbackTimer;

document.querySelector("#today-label").textContent = new Intl.DateTimeFormat(undefined, {
  weekday: "long", month: "long", day: "numeric",
}).format(new Date());

function setConnection(connected) {
  const parent = document.querySelector(".topbar-right");
  parent.classList.toggle("is-connected", connected);
  parent.classList.toggle("is-offline", !connected);
  document.querySelector("#connection-status").textContent = connected ? "Connected to API" : "API unavailable";
}

function showFeedback(message, success = false) {
  clearTimeout(feedbackTimer);
  feedback.textContent = message;
  feedback.classList.toggle("success", success);
  feedback.hidden = false;
  if (success) feedbackTimer = setTimeout(() => { feedback.hidden = true; }, 3500);
}

async function api(path, options = {}) {
  let response;
  try {
    response = await fetch(path, {
      headers: { Accept: "application/json", ...(options.body ? { "Content-Type": "application/json" } : {}) },
      ...options,
    });
  } catch {
    setConnection(false);
    throw new Error("Could not reach the API. Check that Docker Compose is running.");
  }
  if (!response.ok) {
    let message = `Request failed (${response.status}).`;
    try {
      const data = await response.json();
      if (typeof data.detail === "string") message = data.detail;
      if (Array.isArray(data.detail)) message = data.detail.map(item => item.msg).join("; ");
    } catch { /* Keep the HTTP status message. */ }
    if (response.status >= 500) setConnection(false);
    throw new Error(message);
  }
  setConnection(true);
  return response.status === 204 ? null : response.json();
}

async function loadTasks() {
  state.loading = true;
  state.loadError = false;
  list.textContent = "Loading your tasks…";
  emptyState.hidden = true;
  try {
    const tasks = [];
    for (let offset = 0; ; offset += 100) {
      const page = await api(`/tasks?offset=${offset}&limit=100`);
      tasks.push(...page);
      if (page.length < 100) break;
    }
    state.tasks = tasks;
    feedback.hidden = true;
  } catch (error) {
    state.loadError = true;
    showFeedback(error.message);
  } finally {
    state.loading = false;
    render();
  }
}

function setView(view) {
  state.view = view;
  document.querySelectorAll("[data-view]").forEach(button => {
    const selected = button.dataset.view === view;
    button.classList.toggle("is-active", selected);
    if (button.classList.contains("filter-tab")) button.setAttribute("aria-pressed", String(selected));
    if (button.classList.contains("nav-item")) {
      if (selected) button.setAttribute("aria-current", "page");
      else button.removeAttribute("aria-current");
    }
  });
  render();
}

function render() {
  const total = state.tasks.length;
  const active = state.tasks.filter(task => !task.completed).length;
  const completed = total - active;
  document.querySelector("#stat-total").textContent = total;
  document.querySelector("#stat-active").textContent = active;
  document.querySelector("#stat-completed").textContent = completed;
  document.querySelector("#nav-all-count").textContent = total;
  document.querySelector("#nav-active-count").textContent = active;
  document.querySelector("#nav-completed-count").textContent = completed;
  document.querySelector("#footer-summary").textContent = `${active} ${active === 1 ? "task" : "tasks"} to go`;

  const visible = state.tasks.filter(task => {
    if (state.view === "active" && task.completed) return false;
    if (state.view === "completed" && !task.completed) return false;
    return task.title.toLocaleLowerCase().includes(state.search);
  });
  document.querySelector("#heading-count").textContent = visible.length;
  list.replaceChildren(...visible.map(createTaskRow));
  emptyState.hidden = state.loading || visible.length > 0;
  if (visible.length === 0) {
    const title = document.querySelector("#empty-title");
    const description = document.querySelector("#empty-description");
    if (state.loadError) {
      title.textContent = "Tasks could not load.";
      description.textContent = "Check the API connection and reload this page.";
    } else if (state.search) {
      title.textContent = "Nothing matched.";
      description.textContent = "Try a different search term.";
    } else if (state.view === "completed") {
      title.textContent = "No completed tasks yet.";
      description.textContent = "Completed tasks will show up here.";
    } else if (state.view === "active" && total > 0) {
      title.textContent = "All caught up!";
      description.textContent = "You have finished every task on your list.";
    } else {
      title.textContent = "A fresh start.";
      description.textContent = "Add your first task above and get moving.";
    }
  }
}

function createTaskRow(task) {
  const row = document.createElement("div");
  row.className = `task-row${task.completed ? " is-completed" : ""}`;
  row.dataset.taskId = String(task.id);

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.className = "task-checkbox";
  checkbox.checked = task.completed;
  checkbox.setAttribute("aria-label", `${task.completed ? "Mark incomplete" : "Complete"}: ${task.title}`);
  checkbox.addEventListener("change", async () => {
    row.classList.add("is-busy");
    try {
      const updated = await api(`/tasks/${task.id}`, {
        method: "PUT", body: JSON.stringify({ title: task.title, completed: checkbox.checked }),
      });
      Object.assign(task, updated);
      render();
    } catch (error) {
      checkbox.checked = task.completed;
      row.classList.remove("is-busy");
      showFeedback(error.message);
    }
  });

  const info = document.createElement("div");
  info.className = "task-info";
  const title = document.createElement("span");
  title.className = "task-title";
  title.textContent = task.title;
  const id = document.createElement("span");
  id.className = "task-id";
  id.textContent = `TASK #${String(task.id).padStart(3, "0")}`;
  info.append(title, id);

  const actions = document.createElement("div");
  actions.className = "row-actions";
  const edit = document.createElement("button");
  edit.type = "button";
  edit.className = "icon-button";
  edit.textContent = "✎";
  edit.setAttribute("aria-label", `Edit ${task.title}`);
  edit.addEventListener("click", () => showEditForm(row, task));
  const remove = document.createElement("button");
  remove.type = "button";
  remove.className = "icon-button delete";
  remove.textContent = "×";
  remove.setAttribute("aria-label", `Delete ${task.title}`);
  remove.addEventListener("click", () => showDeleteConfirmation(row, task));
  actions.append(edit, remove);
  row.append(checkbox, info, actions);
  return row;
}

function showDeleteConfirmation(row, task) {
  const info = row.querySelector(".task-info");
  row.querySelector(".row-actions").hidden = true;
  const prompt = document.createElement("div");
  prompt.className = "delete-confirmation";
  const question = document.createElement("span");
  question.textContent = `Delete “${task.title}”?`;
  const confirm = document.createElement("button");
  confirm.type = "button";
  confirm.className = "confirm-delete";
  confirm.textContent = "Delete";
  const cancel = document.createElement("button");
  cancel.type = "button";
  cancel.className = "cancel-delete";
  cancel.textContent = "Cancel";
  cancel.addEventListener("click", render);
  confirm.addEventListener("click", async () => {
    confirm.disabled = true;
    try {
      await api(`/tasks/${task.id}`, { method: "DELETE" });
      state.tasks = state.tasks.filter(item => item.id !== task.id);
      render();
      showFeedback("Task deleted.", true);
    } catch (error) {
      confirm.disabled = false;
      showFeedback(error.message);
    }
  });
  prompt.append(question, confirm, cancel);
  info.replaceChildren(prompt);
  confirm.focus();
}

function showEditForm(row, task) {
  const info = row.querySelector(".task-info");
  const actions = row.querySelector(".row-actions");
  actions.hidden = true;
  const editor = document.createElement("form");
  editor.className = "edit-form";
  const input = document.createElement("input");
  input.type = "text";
  input.value = task.title;
  input.maxLength = 200;
  input.required = true;
  input.setAttribute("aria-label", "Edit task title");
  const save = document.createElement("button");
  save.type = "submit";
  save.textContent = "Save";
  const cancel = document.createElement("button");
  cancel.type = "button";
  cancel.className = "cancel";
  cancel.textContent = "Cancel";
  cancel.addEventListener("click", render);
  input.addEventListener("keydown", event => { if (event.key === "Escape") render(); });
  editor.addEventListener("submit", async event => {
    event.preventDefault();
    const title = input.value.trim();
    if (!title) { showFeedback("Enter a task title before saving."); return; }
    save.disabled = true;
    try {
      const updated = await api(`/tasks/${task.id}`, {
        method: "PUT", body: JSON.stringify({ title, completed: task.completed }),
      });
      Object.assign(task, updated);
      render();
      showFeedback("Task updated.", true);
    } catch (error) {
      save.disabled = false;
      showFeedback(error.message);
    }
  });
  editor.append(input, save, cancel);
  info.replaceChildren(editor);
  input.focus();
  input.select();
}

form.addEventListener("submit", async event => {
  event.preventDefault();
  const title = titleInput.value.trim();
  if (!title) { showFeedback("Enter a task title first."); return; }
  const submit = form.querySelector("button[type=submit]");
  submit.disabled = true;
  try {
    const task = await api("/tasks", { method: "POST", body: JSON.stringify({ title }) });
    state.tasks.push(task);
    titleInput.value = "";
    state.search = "";
    searchInput.value = "";
    setView("all");
    titleInput.focus();
    showFeedback("Task added.", true);
  } catch (error) {
    showFeedback(error.message);
  } finally {
    submit.disabled = false;
  }
});

document.querySelectorAll("[data-view]").forEach(button => {
  button.addEventListener("click", () => setView(button.dataset.view));
});
searchInput.addEventListener("input", () => {
  state.search = searchInput.value.trim().toLocaleLowerCase();
  render();
});
document.querySelector("#focus-task-button").addEventListener("click", () => {
  titleInput.scrollIntoView({ behavior: "smooth", block: "center" });
  titleInput.focus();
});

loadTasks();
