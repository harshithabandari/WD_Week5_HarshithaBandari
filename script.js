const taskForm = document.querySelector('#task-form');
const taskInput = document.querySelector('#task-input');
const priorityInput = document.querySelector('#priority-input');
const taskList = document.querySelector('#task-list');
const searchInput = document.querySelector('#search-input');
const filterButtons = document.querySelectorAll('.filter-button');
const progressCount = document.querySelector('#progress-count');
const taskSummary = document.querySelector('#task-summary');
const emptyState = document.querySelector('#empty-state');
const clearCompletedButton = document.querySelector('#clear-completed');
const formMessage = document.querySelector('#form-message');
const todayDate = document.querySelector('#today-date');

let tasks = JSON.parse(localStorage.getItem('dayframeTasks')) || [];
let currentFilter = 'all';

function saveTasks() {
  localStorage.setItem('dayframeTasks', JSON.stringify(tasks));
}

function getVisibleTasks() {
  const searchText = searchInput.value.trim().toLowerCase();

  return tasks.filter(function (task) {
    const matchesSearch = task.title.toLowerCase().includes(searchText);
    const matchesFilter = currentFilter === 'all'
      || (currentFilter === 'active' && !task.completed)
      || (currentFilter === 'completed' && task.completed);

    return matchesSearch && matchesFilter;
  });
}

function updateSummary() {
  const completedTasks = tasks.filter(function (task) {
    return task.completed;
  }).length;
  const taskWord = tasks.length === 1 ? 'task' : 'tasks';

  progressCount.textContent = completedTasks + ' of ' + tasks.length + ' done';
  taskSummary.textContent = tasks.length + ' ' + taskWord;
  clearCompletedButton.hidden = completedTasks === 0;
}

function renderTasks() {
  taskList.innerHTML = '';
  const visibleTasks = getVisibleTasks();

  visibleTasks.forEach(function (task) {
    const listItem = document.createElement('li');
    listItem.className = 'task-item';
    if (task.completed) {
      listItem.classList.add('is-completed');
    }

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'task-check';
    checkbox.checked = task.completed;
    checkbox.setAttribute('aria-label', 'Mark ' + task.title + ' as complete');
    checkbox.dataset.action = 'toggle';
    checkbox.dataset.id = task.id;

    const details = document.createElement('div');
    details.className = 'task-details';

    const title = document.createElement('span');
    title.className = 'task-title';
    title.textContent = task.title;

    const priority = document.createElement('span');
    priority.className = 'priority priority-' + task.priority;
    priority.textContent = task.priority;

    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.className = 'delete-button';
    deleteButton.textContent = 'Delete';
    deleteButton.setAttribute('aria-label', 'Delete ' + task.title);
    deleteButton.dataset.action = 'delete';
    deleteButton.dataset.id = task.id;

    details.append(title, priority);
    listItem.append(checkbox, details, deleteButton);
    taskList.append(listItem);
  });

  emptyState.hidden = visibleTasks.length > 0;
  updateSummary();
}

function addTask(title, priority) {
  const task = {
    id: Date.now().toString(),
    title: title,
    priority: priority,
    completed: false
  };

  tasks.unshift(task);
  saveTasks();
  renderTasks();
}

taskForm.addEventListener('submit', function (event) {
  event.preventDefault();
  const title = taskInput.value.trim();

  if (title === '') {
    formMessage.textContent = 'Please enter a task before adding it.';
    taskInput.focus();
    return;
  }

  formMessage.textContent = '';
  addTask(title, priorityInput.value);
  taskForm.reset();
  taskInput.focus();
});

taskInput.addEventListener('input', function () {
  formMessage.textContent = '';
});

taskList.addEventListener('change', function (event) {
  if (event.target.dataset.action !== 'toggle') {
    return;
  }

  const taskId = event.target.dataset.id;
  tasks = tasks.map(function (task) {
    if (task.id === taskId) {
      task.completed = event.target.checked;
    }
    return task;
  });

  saveTasks();
  renderTasks();
});

taskList.addEventListener('click', function (event) {
  if (event.target.dataset.action !== 'delete') {
    return;
  }

  const taskId = event.target.dataset.id;
  tasks = tasks.filter(function (task) {
    return task.id !== taskId;
  });

  saveTasks();
  renderTasks();
});

filterButtons.forEach(function (button) {
  button.addEventListener('click', function () {
    currentFilter = button.dataset.filter;

    filterButtons.forEach(function (filterButton) {
      const isSelected = filterButton === button;
      filterButton.classList.toggle('is-active', isSelected);
      filterButton.setAttribute('aria-pressed', isSelected);
    });

    renderTasks();
  });
});

searchInput.addEventListener('input', renderTasks);

clearCompletedButton.addEventListener('click', function () {
  tasks = tasks.filter(function (task) {
    return !task.completed;
  });

  saveTasks();
  renderTasks();
});

todayDate.textContent = new Intl.DateTimeFormat('en', {
  weekday: 'long',
  month: 'long',
  day: 'numeric'
}).format(new Date());

renderTasks();
