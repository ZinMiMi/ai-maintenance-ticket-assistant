// AI Hotel Operations Management System - Main Application

class HotelOperationsApp {
  constructor() {
    this.tickets = this.loadTickets();
    this.classifier = new AITicketClassifier();
    this.init();
  }

  init() {
    this.form = document.getElementById('ticketForm');
    this.ticketList = document.getElementById('ticketList');
    this.ticketCount = document.getElementById('ticketCount');
    this.imageUpload = document.getElementById('imageUpload');
    this.imagePreview = document.getElementById('imagePreview');
    this.uploadPlaceholder = document.getElementById('uploadPlaceholder');
    this.filterStatus = document.getElementById('filterStatus');
    this.filterDepartment = document.getElementById('filterDepartment');
    this.filterCategory = document.getElementById('filterCategory');
    this.filterPriority = document.getElementById('filterPriority');
    this.aiAnalyzeBtn = document.getElementById('aiAnalyzeBtn');
    this.aiSuggestions = document.getElementById('aiSuggestions');
    this.lastClassification = null;

    this.bindEvents();
    this.renderTickets();
    this.renderDashboard();
  }

  bindEvents() {
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    this.imageUpload.addEventListener('change', (e) => this.handleImageUpload(e));
    this.filterStatus.addEventListener('change', () => this.renderTickets());
    this.filterDepartment.addEventListener('change', () => this.renderTickets());
    this.filterCategory.addEventListener('change', () => this.renderTickets());
    this.filterPriority.addEventListener('change', () => this.renderTickets());
    this.aiAnalyzeBtn.addEventListener('click', () => this.analyzeTicket());
    document.getElementById('applySuggestions').addEventListener('click', () => this.applySuggestions());

    // Drag and drop
    const uploadArea = document.getElementById('uploadArea');
    uploadArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadArea.style.borderColor = 'var(--primary)';
      uploadArea.style.background = 'var(--gray-50)';
    });
    uploadArea.addEventListener('dragleave', () => {
      uploadArea.style.borderColor = '';
      uploadArea.style.background = '';
    });
    uploadArea.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadArea.style.borderColor = '';
      uploadArea.style.background = '';
      if (e.dataTransfer.files.length) {
        this.imageUpload.files = e.dataTransfer.files;
        this.handleImageUpload({ target: this.imageUpload });
      }
    });
  }

  handleImageUpload(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreview.src = e.target.result;
        this.imagePreview.style.display = 'block';
        this.uploadPlaceholder.style.display = 'none';
      };
      reader.readAsDataURL(file);
    }
  }

  handleSubmit(e) {
    e.preventDefault();

    const now = new Date().toISOString();
    const ticket = {
      id: Date.now(),
      title: document.getElementById('issueTitle').value,
      description: document.getElementById('issueDescription').value,
      department: document.getElementById('department').value,
      category: document.getElementById('category').value,
      priority: document.getElementById('priority').value,
      assignedTo: document.getElementById('assignedTo').value || null,
      image: this.imagePreview.src || null,
      status: 'open',
      createdAt: now,
      updatedAt: now,
      history: [{
        status: 'open',
        timestamp: now,
        note: 'Ticket created'
      }]
    };

    this.tickets.unshift(ticket);
    this.saveTickets();
    this.renderTickets();
    this.renderDashboard();
    this.form.reset();
    this.imagePreview.style.display = 'none';
    this.uploadPlaceholder.style.display = 'flex';

    this.showToast('Ticket submitted successfully!');
  }

  deleteTicket(id) {
    this.tickets = this.tickets.filter(t => t.id !== id);
    this.saveTickets();
    this.renderTickets();
    this.renderDashboard();
    this.showToast('Ticket deleted');
  }

  updateStatus(id, newStatus) {
    const ticket = this.tickets.find(t => t.id === id);
    if (ticket) {
      const now = new Date().toISOString();
      ticket.status = newStatus;
      ticket.updatedAt = now;
      ticket.history.push({
        status: newStatus,
        timestamp: now,
        note: `Status changed to ${this.formatStatus(newStatus)}`
      });
      this.saveTickets();
      this.renderTickets();
      this.renderDashboard();
      this.showToast(`Ticket status updated to ${this.formatStatus(newStatus)}`);
    }
  }

  assignTicket(id) {
    const ticket = this.tickets.find(t => t.id === id);
    if (ticket) {
      const assignedTo = prompt('Assign to:', ticket.assignedTo || '');
      if (assignedTo !== null) {
        const now = new Date().toISOString();
        ticket.assignedTo = assignedTo || null;
        ticket.updatedAt = now;
        ticket.history.push({
          status: ticket.status,
          timestamp: now,
          note: assignedTo ? `Assigned to ${assignedTo}` : 'Assignment removed'
        });
        this.saveTickets();
        this.renderTickets();
        this.showToast(assignedTo ? `Ticket assigned to ${assignedTo}` : 'Assignment removed');
      }
    }
  }

  toggleHistory(id) {
    const historyEl = document.getElementById(`history-${id}`);
    if (historyEl) {
      historyEl.style.display = historyEl.style.display === 'none' ? 'block' : 'none';
    }
  }

  getFilteredTickets() {
    const status = this.filterStatus.value;
    const department = this.filterDepartment.value;
    const category = this.filterCategory.value;
    const priority = this.filterPriority.value;

    return this.tickets.filter(ticket => {
      if (status !== 'all' && ticket.status !== status) return false;
      if (department !== 'all' && ticket.department !== department) return false;
      if (category !== 'all' && ticket.category !== category) return false;
      if (priority !== 'all' && ticket.priority !== priority) return false;
      return true;
    });
  }

  renderTickets() {
    const filtered = this.getFilteredTickets();
    this.ticketCount.textContent = filtered.length;

    if (filtered.length === 0) {
      this.ticketList.innerHTML = `
        <div class="empty-state">
          <span class="empty-icon">📋</span>
          <p>No tickets found</p>
        </div>
      `;
      return;
    }

    this.ticketList.innerHTML = filtered.map(ticket => `
      <div class="ticket-card priority-${ticket.priority} status-${ticket.status}">
        <div class="ticket-header">
          <span class="ticket-title">${this.escapeHtml(ticket.title)}</span>
          <div class="ticket-actions">
            <select class="status-select status-${ticket.status}" onchange="app.updateStatus(${ticket.id}, this.value)">
              <option value="open" ${ticket.status === 'open' ? 'selected' : ''}>Open</option>
              <option value="in-progress" ${ticket.status === 'in-progress' ? 'selected' : ''}>In Progress</option>
              <option value="pending" ${ticket.status === 'pending' ? 'selected' : ''}>Pending</option>
              <option value="resolved" ${ticket.status === 'resolved' ? 'selected' : ''}>Resolved</option>
              <option value="closed" ${ticket.status === 'closed' ? 'selected' : ''}>Closed</option>
            </select>
            <button class="btn-icon" onclick="app.assignTicket(${ticket.id})" title="Assign">
              👤
            </button>
            <button class="btn-icon" onclick="app.toggleHistory(${ticket.id})" title="History">
              📜
            </button>
            <button class="btn-icon" onclick="app.deleteTicket(${ticket.id})" title="Delete">
              🗑️
            </button>
          </div>
        </div>
        <p class="ticket-description">${this.escapeHtml(ticket.description)}</p>
        ${ticket.image ? `<img src="${ticket.image}" class="ticket-image" alt="Issue">` : ''}
        <div class="ticket-meta">
          <span class="badge badge-department">${this.getDepartmentIcon(ticket.department)} ${this.formatDepartment(ticket.department)}</span>
          <span class="badge badge-category">${this.getCategoryIcon(ticket.category)} ${ticket.category}</span>
          <span class="badge badge-priority-${ticket.priority}">${ticket.priority}</span>
          <span class="badge badge-status-${ticket.status}">${this.formatStatus(ticket.status)}</span>
          ${ticket.assignedTo ? `<span class="badge badge-assigned">👤 ${this.escapeHtml(ticket.assignedTo)}</span>` : ''}
        </div>
        <div class="ticket-time">
          <span>Created: ${this.formatDate(ticket.createdAt)}</span>
          ${ticket.updatedAt !== ticket.createdAt ? `<span> • Updated: ${this.formatDate(ticket.updatedAt)}</span>` : ''}
        </div>
        <div id="history-${ticket.id}" class="ticket-history" style="display: none;">
          <h4>History</h4>
          <div class="history-timeline">
            ${(ticket.history || []).map(entry => `
              <div class="history-entry">
                <span class="history-status">${this.formatStatus(entry.status)}</span>
                <span class="history-note">${entry.note}</span>
                <span class="history-time">${this.formatDate(entry.timestamp)}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `).join('');
  }

  getDepartmentIcon(department) {
    const icons = {
      'engineering': '🔧',
      'housekeeping': '🧹',
      'front-office': '🛎️',
      'it': '💻',
      'fb': '🍽️',
      'security': '🔒',
      'hr': '👥',
      'finance': '💰'
    };
    return icons[department] || '🏨';
  }

  formatDepartment(department) {
    const names = {
      'engineering': 'Engineering',
      'housekeeping': 'Housekeeping',
      'front-office': 'Front Office',
      'it': 'IT',
      'fb': 'F&B',
      'security': 'Security',
      'hr': 'HR',
      'finance': 'Finance'
    };
    return names[department] || department;
  }

  getCategoryIcon(category) {
    const icons = {
      plumbing: '🚿',
      electrical: '⚡',
      hvac: '❄️',
      structural: '🏗️',
      appliance: '🔌',
      other: '📦'
    };
    return icons[category] || '📦';
  }

  formatStatus(status) {
    const statuses = {
      'open': 'Open',
      'in-progress': 'In Progress',
      'pending': 'Pending',
      'resolved': 'Resolved',
      'closed': 'Closed'
    };
    return statuses[status] || status;
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  saveTickets() {
    localStorage.setItem('hotelOperationsTickets', JSON.stringify(this.tickets));
  }

  loadTickets() {
    const saved = localStorage.getItem('hotelOperationsTickets');
    return saved ? JSON.parse(saved) : [];
  }

  analyzeTicket() {
    const title = document.getElementById('issueTitle').value;
    const description = document.getElementById('issueDescription').value;

    if (!title && !description) {
      this.showToast('Please enter a title or description first');
      return;
    }

    // Show loading state
    this.aiAnalyzeBtn.disabled = true;
    this.aiAnalyzeBtn.innerHTML = '🔄 Analyzing...';

    // Simulate AI processing delay (remove when using real API)
    setTimeout(() => {
      const result = this.classifier.classify(title, description);
      this.lastClassification = result;
      this.displaySuggestions(result);

      this.aiAnalyzeBtn.disabled = false;
      this.aiAnalyzeBtn.innerHTML = '🤖 AI Analyze';
    }, 500);
  }

  displaySuggestions(result) {
    const suggestions = document.getElementById('aiSuggestions');
    const dept = document.getElementById('aiDept');
    const cat = document.getElementById('aiCat');
    const priority = document.getElementById('aiPriority');
    const confidence = document.getElementById('aiConfidence');

    dept.textContent = this.formatDepartment(result.department.value);
    cat.textContent = result.category.value;
    priority.textContent = result.priority.value;
    confidence.textContent = `${result.confidence}% confident`;

    // Color code priority
    priority.className = 'ai-value priority-' + result.priority.value;

    suggestions.style.display = 'block';
  }

  applySuggestions() {
    if (!this.lastClassification) return;

    const result = this.lastClassification;
    document.getElementById('department').value = result.department.value;
    document.getElementById('category').value = result.category.value;
    document.getElementById('priority').value = result.priority.value;

    this.showToast('AI suggestions applied');
  }

  renderDashboard() {
    const total = this.tickets.length;
    const open = this.tickets.filter(t => t.status === 'open').length;
    const inProgress = this.tickets.filter(t => t.status === 'in-progress').length;
    const pending = this.tickets.filter(t => t.status === 'pending').length;
    const resolved = this.tickets.filter(t => t.status === 'resolved').length;
    const closed = this.tickets.filter(t => t.status === 'closed').length;

    document.getElementById('statTotal').textContent = total;
    document.getElementById('statOpen').textContent = open;
    document.getElementById('statProgress').textContent = inProgress;
    document.getElementById('statPending').textContent = pending;
    document.getElementById('statResolved').textContent = resolved;
    document.getElementById('statClosed').textContent = closed;

    // Department chart
    const departments = ['engineering', 'housekeeping', 'front-office', 'it', 'fb', 'security', 'hr', 'finance'];
    const deptCounts = departments.map(dept => ({
      name: this.formatDepartment(dept),
      icon: this.getDepartmentIcon(dept),
      count: this.tickets.filter(t => t.department === dept).length
    }));
    this.renderBarChart('departmentChart', deptCounts);

    // Priority chart
    const priorities = ['critical', 'high', 'medium', 'low'];
    const priorityCounts = priorities.map(priority => ({
      name: priority.charAt(0).toUpperCase() + priority.slice(1),
      count: this.tickets.filter(t => t.priority === priority).length
    }));
    this.renderBarChart('priorityChart', priorityCounts);
  }

  renderBarChart(containerId, data) {
    const container = document.getElementById(containerId);
    const maxCount = Math.max(...data.map(d => d.count), 1);

    container.innerHTML = data.map(item => {
      const percentage = (item.count / maxCount) * 100;
      return `
        <div class="chart-row">
          <span class="chart-label">${item.icon || ''} ${item.name}</span>
          <div class="chart-bar-container">
            <div class="chart-bar" style="width: ${percentage}%"></div>
            <span class="chart-value">${item.count}</span>
          </div>
        </div>
      `;
    }).join('');
  }

  showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }
}

// Initialize app
const app = new HotelOperationsApp();
