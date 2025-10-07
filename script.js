// Todo App JavaScript
class TodoApp {
  constructor() {
    this.tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    this.currentFilter = "all";
    this.editingTaskId = null;
    this.deletingTaskId = null;

    this.initializeElements();
    this.bindEvents();
    this.renderTasks();
  }

  initializeElements() {
    // Main elements
    this.tasksContainer = document.getElementById("tasksContainer");
    this.addTaskBtn = document.getElementById("addTaskBtn");

    // Modal elements
    this.taskModal = document.getElementById("taskModal");
    this.detailModal = document.getElementById("detailModal");
    this.deleteModal = document.getElementById("deleteModal");

    // Form elements
    this.taskForm = document.getElementById("taskForm");
    this.taskTitle = document.getElementById("taskTitle");
    this.taskDescription = document.getElementById("taskDescription");
    this.taskDeadline = document.getElementById("taskDeadline");
    this.taskStatus = document.getElementById("taskStatus");

    // Modal controls
    this.closeModal = document.getElementById("closeModal");
    this.closeDetailModal = document.getElementById("closeDetailModal");
    this.closeDetailBtn = document.getElementById("closeDetailBtn");
    this.cancelBtn = document.getElementById("cancelBtn");
    this.cancelDeleteBtn = document.getElementById("cancelDeleteBtn");
    this.confirmDeleteBtn = document.getElementById("confirmDeleteBtn");

    // Filter buttons
    this.filterButtons = document.querySelectorAll(".filter-btn");

    // Detail elements
    this.taskDetail = document.getElementById("taskDetail");
    this.taskToDelete = document.getElementById("taskToDelete");
    this.modalTitle = document.getElementById("modalTitle");
  }

  bindEvents() {
    // Add task button
    this.addTaskBtn.addEventListener("click", () => this.openAddModal());

    // Modal close events
    this.closeModal.addEventListener("click", () => this.closeTaskModal());
    this.closeDetailModal.addEventListener("click", () =>
      this.closeDetailModalWindow()
    );
    this.closeDetailBtn.addEventListener("click", () =>
      this.closeDetailModalWindow()
    );
    this.cancelBtn.addEventListener("click", () => this.closeTaskModal());
    this.cancelDeleteBtn.addEventListener("click", () =>
      this.closeDeleteModal()
    );
    this.confirmDeleteBtn.addEventListener("click", () => this.confirmDelete());

    // Form submission
    this.taskForm.addEventListener("submit", (e) => this.handleFormSubmit(e));

    // Filter buttons
    this.filterButtons.forEach((btn) => {
      btn.addEventListener("click", (e) =>
        this.setFilter(e.target.dataset.filter)
      );
    });

    // Close modals when clicking outside
    window.addEventListener("click", (e) => {
      if (e.target === this.taskModal) this.closeTaskModal();
      if (e.target === this.detailModal) this.closeDetailModalWindow();
      if (e.target === this.deleteModal) this.closeDeleteModal();
    });
  }

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  openAddModal() {
    this.editingTaskId = null;
    this.modalTitle.textContent = "Add New Task";
    this.taskForm.reset();
    this.taskStatus.value = "not-started";
    this.showModal(this.taskModal);
  }

  openEditModal(taskId) {
    const task = this.tasks.find((t) => t.id === taskId);
    if (!task) return;

    this.editingTaskId = taskId;
    this.modalTitle.textContent = "Edit Task";
    this.taskTitle.value = task.title;
    this.taskDescription.value = task.description || "";
    this.taskDeadline.value = task.deadline
      ? this.formatDateTimeForInput(task.deadline)
      : "";
    this.taskStatus.value = task.status;
    this.showModal(this.taskModal);
  }

  openDetailModal(taskId) {
    const task = this.tasks.find((t) => t.id === taskId);
    if (!task) return;

    this.renderTaskDetail(task);
    this.showModal(this.detailModal);
  }

  openDeleteModal(taskId) {
    const task = this.tasks.find((t) => t.id === taskId);
    if (!task) return;

    this.deletingTaskId = taskId;
    this.taskToDelete.textContent = task.title;
    this.showModal(this.deleteModal);
  }

  showModal(modal) {
    modal.classList.add("show");
    modal.style.display = "flex";
  }

  closeTaskModal() {
    this.taskModal.classList.remove("show");
    this.taskModal.style.display = "none";
    this.editingTaskId = null;
  }

  closeDetailModalWindow() {
    this.detailModal.classList.remove("show");
    this.detailModal.style.display = "none";
  }

  closeDeleteModal() {
    this.deleteModal.classList.remove("show");
    this.deleteModal.style.display = "none";
    this.deletingTaskId = null;
  }

  handleFormSubmit(e) {
    e.preventDefault();

    const title = this.taskTitle.value.trim();
    if (!title) {
      alert("Please enter a task title");
      return;
    }

    const taskData = {
      title: title,
      description: this.taskDescription.value.trim(),
      deadline: this.taskDeadline.value
        ? new Date(this.taskDeadline.value).toISOString()
        : null,
      status: this.taskStatus.value,
      createdAt: new Date().toISOString(),
    };

    if (this.editingTaskId) {
      this.updateTask(this.editingTaskId, taskData);
    } else {
      this.addTask(taskData);
    }

    this.closeTaskModal();
  }

  addTask(taskData) {
    const task = {
      id: this.generateId(),
      ...taskData,
    };

    this.tasks.unshift(task);
    this.saveTasks();
    this.renderTasks();
  }

  updateTask(taskId, taskData) {
    const taskIndex = this.tasks.findIndex((t) => t.id === taskId);
    if (taskIndex === -1) return;

    this.tasks[taskIndex] = {
      ...this.tasks[taskIndex],
      ...taskData,
      updatedAt: new Date().toISOString(),
    };

    this.saveTasks();
    this.renderTasks();
  }

  deleteTask(taskId) {
    this.tasks = this.tasks.filter((t) => t.id !== taskId);
    this.saveTasks();
    this.renderTasks();
    this.closeDeleteModal();
  }

  confirmDelete() {
    if (this.deletingTaskId) {
      this.deleteTask(this.deletingTaskId);
    }
  }

  setFilter(filter) {
    this.currentFilter = filter;

    // Update active filter button
    this.filterButtons.forEach((btn) => {
      btn.classList.remove("active");
      if (btn.dataset.filter === filter) {
        btn.classList.add("active");
      }
    });

    this.renderTasks();
  }

  getFilteredTasks() {
    if (this.currentFilter === "all") {
      return this.tasks;
    }
    return this.tasks.filter((task) => task.status === this.currentFilter);
  }

  renderTasks() {
    const filteredTasks = this.getFilteredTasks();

    if (filteredTasks.length === 0) {
      this.tasksContainer.innerHTML = this.getEmptyStateHTML();
      return;
    }

    this.tasksContainer.innerHTML = filteredTasks
      .map((task) => this.getTaskHTML(task))
      .join("");

    // Bind task action events
    this.bindTaskEvents();
  }

  bindTaskEvents() {
    // Edit buttons
    document.querySelectorAll(".edit-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const taskId = e.target.closest(".task-card").dataset.taskId;
        this.openEditModal(taskId);
      });
    });

    // Delete buttons
    document.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const taskId = e.target.closest(".task-card").dataset.taskId;
        this.openDeleteModal(taskId);
      });
    });

    // View detail buttons
    document.querySelectorAll(".view-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const taskId = e.target.closest(".task-card").dataset.taskId;
        this.openDetailModal(taskId);
      });
    });

    // Status change buttons
    document.querySelectorAll(".status-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const taskId = e.target.closest(".task-card").dataset.taskId;
        const newStatus = e.target.dataset.status;
        this.updateTaskStatus(taskId, newStatus);
      });
    });
  }

  updateTaskStatus(taskId, newStatus) {
    const taskIndex = this.tasks.findIndex((t) => t.id === taskId);
    if (taskIndex === -1) return;

    this.tasks[taskIndex].status = newStatus;
    this.tasks[taskIndex].updatedAt = new Date().toISOString();

    this.saveTasks();
    this.renderTasks();
  }

  getTaskHTML(task) {
    const deadlineText = task.deadline
      ? this.formatDeadline(task.deadline)
      : "";
    const isOverdue =
      task.deadline &&
      new Date(task.deadline) < new Date() &&
      task.status !== "completed";

    return `
            <div class="task-card ${task.status}" data-task-id="${task.id}">
                <div class="task-header">
                    <h3 class="task-title">${this.escapeHtml(task.title)}</h3>
                    <span class="task-status ${
                      task.status
                    }">${this.getStatusText(task.status)}</span>
                </div>
                ${
                  task.description
                    ? `<div class="task-description">${this.escapeHtml(
                        task.description
                      )}</div>`
                    : ""
                }
                ${
                  deadlineText
                    ? `<div class="task-deadline ${
                        isOverdue ? "overdue" : ""
                      }">📅 ${deadlineText}</div>`
                    : ""
                }
                <div class="task-actions">
                    <button class="btn btn-primary view-btn">View Details</button>
                    <button class="btn btn-secondary edit-btn">Edit</button>
                    ${
                      task.status !== "completed"
                        ? `<button class="btn btn-success status-btn" data-status="completed">Mark Complete</button>`
                        : ""
                    }
                    ${
                      task.status !== "active"
                        ? `<button class="btn btn-primary status-btn" data-status="active">Mark Active</button>`
                        : ""
                    }
                    ${
                      task.status !== "not-started"
                        ? `<button class="btn btn-secondary status-btn" data-status="not-started">Mark Not Started</button>`
                        : ""
                    }
                    <button class="btn btn-danger delete-btn">Delete</button>
                </div>
            </div>
        `;
  }

  getEmptyStateHTML() {
    const filterText = this.getFilterText(this.currentFilter);
    return `
            <div class="empty-state">
                <h3>No ${filterText} tasks found</h3>
                <p>${
                  this.currentFilter === "all"
                    ? "Add your first task to get started!"
                    : `No tasks with status "${filterText}" found.`
                }</p>
            </div>
        `;
  }

  getFilterText(filter) {
    const filterTexts = {
      all: "tasks",
      "not-started": "not started",
      active: "active",
      completed: "completed",
    };
    return filterTexts[filter] || filter;
  }

  getStatusText(status) {
    const statusTexts = {
      "not-started": "Not Started",
      active: "Active",
      completed: "Completed",
    };
    return statusTexts[status] || status;
  }

  renderTaskDetail(task) {
    const deadlineText = task.deadline
      ? this.formatDeadline(task.deadline)
      : "No deadline set";
    const createdText = this.formatDateTime(task.createdAt);
    const updatedText = task.updatedAt
      ? this.formatDateTime(task.updatedAt)
      : null;

    this.taskDetail.innerHTML = `
            <div class="detail-item">
                <div class="detail-label">Title</div>
                <div class="detail-value">${this.escapeHtml(task.title)}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Description</div>
                <div class="detail-value">${
                  task.description
                    ? this.escapeHtml(task.description)
                    : "No description provided"
                }</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Status</div>
                <div class="detail-value">
                    <span class="task-status ${
                      task.status
                    }">${this.getStatusText(task.status)}</span>
                </div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Deadline</div>
                <div class="detail-value">${deadlineText}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Created</div>
                <div class="detail-value">${createdText}</div>
            </div>
            ${
              updatedText
                ? `
            <div class="detail-item">
                <div class="detail-label">Last Updated</div>
                <div class="detail-value">${updatedText}</div>
            </div>
            `
                : ""
            }
        `;
  }

  formatDeadline(deadline) {
    const date = new Date(deadline);
    const now = new Date();
    const diffTime = date - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return `Overdue by ${Math.abs(diffDays)} day${
        Math.abs(diffDays) !== 1 ? "s" : ""
      }`;
    } else if (diffDays === 0) {
      return "Due today";
    } else if (diffDays === 1) {
      return "Due tomorrow";
    } else {
      return `Due in ${diffDays} days`;
    }
  }

  formatDateTime(dateString) {
    const date = new Date(dateString);
    return (
      date.toLocaleDateString() +
      " at " +
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  }

  formatDateTimeForInput(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(this.tasks));
  }
}

// Initialize the app when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new TodoApp();
});
