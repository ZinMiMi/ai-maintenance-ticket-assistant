// AI Hotel Operations Management System - Main Application

class HotelOperationsApp {
  constructor() {
    this.TICKETS_KEY = 'hotelOperationsTickets';
    this.USERS_KEY = 'hotelOperationsUsers';
    this.SESSION_KEY = 'hotelOperationsSession';

    this.tickets = this.loadTickets();
    this.users = this.loadUsers();
    this.currentUser = this.getCurrentUser();
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

    this.bindNavigation();
    this.bindLogin();
    this.bindEvents();

    if (this.currentUser) {
      this.showApp();
    } else {
      this.showLogin();
    }

    this.updateDateDisplay();
  }

  showLogin() {
    document.getElementById('section-login')?.classList.add('active');
    document.getElementById('sidebar').style.display = 'none';
    document.querySelector('.topbar').style.display = 'none';
    document.getElementById('mainLayout').style.marginLeft = '0';
    // Hide all other sections
    document.querySelectorAll('.page-section:not(#section-login)').forEach(s => s.classList.remove('active'));
  }

  showApp() {
    document.getElementById('section-login')?.classList.remove('active');
    document.getElementById('sidebar').style.display = '';
    document.querySelector('.topbar').style.display = '';
    document.getElementById('mainLayout').style.marginLeft = '';
    this.updateUserDisplay();
    this.renderTickets();
    this.renderDashboard();
    // Navigate to dashboard if on login or no hash
    const hash = window.location.hash.replace('#', '');
    if (!hash || hash === 'login') {
      this.navigateTo('dashboard');
    } else {
      this.navigateTo(hash);
    }
  }

  updateUserDisplay() {
    if (!this.currentUser) return;
    const initials = this.currentUser.name.split(' ').map(w => w[0]).join('').toUpperCase();
    // Sidebar user
    const sidebarAvatar = document.querySelector('.sidebar-footer .user-avatar');
    const sidebarName = document.querySelector('.sidebar-footer .user-name');
    const sidebarRole = document.querySelector('.sidebar-footer .user-role');
    if (sidebarAvatar) sidebarAvatar.textContent = initials;
    if (sidebarName) sidebarName.textContent = this.currentUser.name;
    if (sidebarRole) sidebarRole.textContent = this.currentUser.role;
    // Topbar user
    const topbarAvatar = document.querySelector('.topbar .user-avatar-sm');
    if (topbarAvatar) topbarAvatar.textContent = initials;
  }

  bindLogin() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const user = this.users.find(u => u.email === email);
        if (user) {
          this.setCurrentUser(user);
          this.showApp();
          this.showToast(`Welcome, ${user.name}!`);
        } else {
          this.showToast('User not found');
        }
      });
    }

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        this.logout();
        window.location.hash = '';
        window.location.reload();
      });
    }
  }

  bindNavigation() {
    // Sidebar nav items
    document.querySelectorAll('.nav-item[data-section]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        this.navigateTo(link.dataset.section);
      });
    });

    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    if (mobileMenuBtn) {
      mobileMenuBtn.addEventListener('click', () => {
        sidebar.classList.toggle('open');
        sidebarOverlay.classList.toggle('open');
      });
    }
    if (sidebarOverlay) {
      sidebarOverlay.addEventListener('click', () => {
        sidebar.classList.remove('open');
        sidebarOverlay.classList.remove('open');
      });
    }

    // Sidebar collapse
    const collapseBtn = document.getElementById('sidebarCollapseBtn');
    if (collapseBtn) {
      collapseBtn.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
      });
    }

    // Theme toggle
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', () => {
        const html = document.documentElement;
        const current = html.getAttribute('data-theme');
        html.setAttribute('data-theme', current === 'dark' ? 'light' : 'dark');
      });
    }

    // Global search
    const globalSearch = document.getElementById('globalSearch');
    if (globalSearch) {
      globalSearch.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        if (query.length > 0) {
          this.navigateTo('tickets');
          this.filterStatus.value = 'all';
          this.filterDepartment.value = 'all';
          this.filterCategory.value = 'all';
          this.filterPriority.value = 'all';
          this.renderTickets();
          const cards = this.ticketList.querySelectorAll('.ticket-card');
          cards.forEach(card => {
            const text = card.textContent.toLowerCase();
            card.style.display = text.includes(query) ? '' : 'none';
          });
        }
      });
    }

    // Handle hash navigation on load
    const hash = window.location.hash.replace('#', '');
    if (hash && document.getElementById(`section-${hash}`)) {
      this.navigateTo(hash);
    }
  }

  navigateTo(sectionId) {
    // Hide all sections
    document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));
    // Show target section
    const target = document.getElementById(`section-${sectionId}`);
    if (target) target.classList.add('active');
    // Update active nav item
    document.querySelectorAll('.nav-item[data-section]').forEach(link => {
      link.classList.toggle('active', link.dataset.section === sectionId);
    });
    // Close mobile sidebar
    document.getElementById('sidebar')?.classList.remove('open');
    document.getElementById('sidebarOverlay')?.classList.remove('open');
    // Update URL hash
    window.location.hash = sectionId;
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
    const dept = document.getElementById('department').value;
    const ticket = {
      id: Date.now(),
      title: document.getElementById('issueTitle').value,
      description: document.getElementById('issueDescription').value,
      department: dept,
      category: document.getElementById('category').value,
      priority: document.getElementById('priority').value,
      assignedTo: null,
      assignedDepartment: dept,
      createdBy: this.currentUser ? this.currentUser.id : null,
      image: this.imagePreview.style.display !== 'none' ? this.imagePreview.src : null,
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

  getVisibleTickets() {
    if (!this.currentUser) return [];
    const user = this.currentUser;

    if (user.role === 'Administrator') {
      return this.tickets;
    }
    if (user.role === 'Department Manager') {
      return this.tickets.filter(t => t.assignedDepartment === user.department || t.department === user.department);
    }
    if (user.role === 'Staff') {
      return this.tickets.filter(t => t.assignedTo === user.name);
    }
    if (user.role === 'Guest') {
      return this.tickets.filter(t => t.createdBy === user.id);
    }
    return [];
  }

  getFilteredTickets() {
    const visible = this.getVisibleTickets();
    const status = this.filterStatus.value;
    const department = this.filterDepartment.value;
    const category = this.filterCategory.value;
    const priority = this.filterPriority.value;

    return visible.filter(ticket => {
      if (status !== 'all' && ticket.status !== status) return false;
      if (department !== 'all' && ticket.department !== department) return false;
      if (category !== 'all' && ticket.category !== category) return false;
      if (priority !== 'all' && ticket.priority !== priority) return false;
      return true;
    });
  }

  updateDateDisplay() {
    const dateEl = document.getElementById('currentDate');
    if (dateEl) {
      dateEl.textContent = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  }

  renderTickets() {
    const filtered = this.getFilteredTickets();
    this.ticketCount.textContent = `${filtered.length} ticket${filtered.length !== 1 ? 's' : ''}`;

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
            <select class="status-select status-${ticket.status}" onchange="app.updateStatus(${ticket.id}, this.value)" ${this.isGuest() ? 'disabled' : ''}>
              <option value="open" ${ticket.status === 'open' ? 'selected' : ''}>Open</option>
              <option value="in-progress" ${ticket.status === 'in-progress' ? 'selected' : ''}>In Progress</option>
              <option value="pending" ${ticket.status === 'pending' ? 'selected' : ''}>Pending</option>
              <option value="resolved" ${ticket.status === 'resolved' ? 'selected' : ''}>Resolved</option>
              <option value="closed" ${ticket.status === 'closed' ? 'selected' : ''}>Closed</option>
            </select>
            ${this.canAssign() ? `<button class="btn-icon" onclick="app.assignTicket(${ticket.id})" title="Assign">👤</button>` : ''}
            <button class="btn-icon" onclick="app.toggleHistory(${ticket.id})" title="History">
              📜
            </button>
            ${this.canDelete() ? `<button class="btn-icon" onclick="app.deleteTicket(${ticket.id})" title="Delete">🗑️</button>` : ''}
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
          ${ticket.source === 'guest' ? `<span class="badge badge-guest">📱 Guest Request</span>` : ''}
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
    localStorage.setItem(this.TICKETS_KEY, JSON.stringify(this.tickets));
  }

  loadTickets() {
    const saved = localStorage.getItem(this.TICKETS_KEY);
    return saved ? JSON.parse(saved) : [];
  }

  // ---- User Management ----

  loadUsers() {
    const saved = localStorage.getItem(this.USERS_KEY);
    if (saved) return JSON.parse(saved);
    this.seedDemoUsers();
    return JSON.parse(localStorage.getItem(this.USERS_KEY));
  }

  saveUsers() {
    localStorage.setItem(this.USERS_KEY, JSON.stringify(this.users));
  }

  seedDemoUsers() {
    const demoUsers = [
      { id: 1, name: 'Admin User', email: 'admin@hotel.com', role: 'Administrator', department: 'all' },
      { id: 2, name: 'Eng Manager', email: 'eng.manager@hotel.com', role: 'Department Manager', department: 'engineering' },
      { id: 3, name: 'Engineer One', email: 'engineer1@hotel.com', role: 'Staff', department: 'engineering' },
      { id: 4, name: 'HK Manager', email: 'hk.manager@hotel.com', role: 'Department Manager', department: 'housekeeping' },
      { id: 5, name: 'Housekeeper One', email: 'housekeeping1@hotel.com', role: 'Staff', department: 'housekeeping' }
    ];
    localStorage.setItem(this.USERS_KEY, JSON.stringify(demoUsers));
  }

  getCurrentUser() {
    const saved = localStorage.getItem(this.SESSION_KEY);
    return saved ? JSON.parse(saved) : null;
  }

  setCurrentUser(user) {
    this.currentUser = user;
    localStorage.setItem(this.SESSION_KEY, JSON.stringify(user));
  }

  logout() {
    this.currentUser = null;
    localStorage.removeItem(this.SESSION_KEY);
  }

  getUsersByDepartment(department) {
    return this.users.filter(u => u.department === department || u.department === 'all');
  }

  getStaffByDepartment(department) {
    return this.users.filter(u => u.department === department && u.role === 'Staff');
  }

  isAdmin() {
    return this.currentUser && this.currentUser.role === 'Administrator';
  }

  isManager() {
    return this.currentUser && this.currentUser.role === 'Department Manager';
  }

  isStaff() {
    return this.currentUser && this.currentUser.role === 'Staff';
  }

  isGuest() {
    return this.currentUser && this.currentUser.role === 'Guest';
  }

  canAssign() {
    return this.isAdmin() || this.isManager();
  }

  canDelete() {
    return this.isAdmin();
  }

  canCreateTicket() {
    return this.currentUser && this.currentUser.role !== 'Guest';
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
    this.aiAnalyzeBtn.innerHTML = '<span>🔄 Analyzing...</span>';

    // Simulate AI processing delay (remove when using real API)
    setTimeout(() => {
      const result = this.classifier.classify(title, description);
      this.lastClassification = result;
      this.displaySuggestions(result);

      this.aiAnalyzeBtn.disabled = false;
      this.aiAnalyzeBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M12 2a4 4 0 0 1 4 4c0 1.95-1.4 3.57-3.25 3.92L12 22"/><path d="M12 2a4 4 0 0 0-4 4c0 1.95 1.4 3.57 3.25 3.92"/><circle cx="12" cy="14" r="2"/></svg><span>AI Analyze</span>';
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
    const visible = this.getVisibleTickets();
    const total = visible.length;
    const open = visible.filter(t => t.status === 'open').length;
    const inProgress = visible.filter(t => t.status === 'in-progress').length;
    const pending = visible.filter(t => t.status === 'pending').length;
    const resolved = visible.filter(t => t.status === 'resolved').length;
    const closed = visible.filter(t => t.status === 'closed').length;

    document.getElementById('statTotal').textContent = total;
    document.getElementById('statOpen').textContent = open;
    document.getElementById('statProgress').textContent = inProgress;
    document.getElementById('statPending').textContent = pending;
    document.getElementById('statResolved').textContent = resolved;
    document.getElementById('statClosed').textContent = closed;

    // Department chart - for managers, show only their department
    let departments = ['engineering', 'housekeeping', 'front-office', 'it', 'fb', 'security', 'hr', 'finance'];
    if (this.isManager()) {
      departments = [this.currentUser.department];
    }
    const deptCounts = departments.map(dept => ({
      name: this.formatDepartment(dept),
      icon: this.getDepartmentIcon(dept),
      count: visible.filter(t => t.department === dept).length
    }));
    this.renderBarChart('departmentChart', deptCounts);

    // Priority chart
    const priorities = ['critical', 'high', 'medium', 'low'];
    const priorityCounts = priorities.map(priority => ({
      name: priority.charAt(0).toUpperCase() + priority.slice(1),
      count: visible.filter(t => t.priority === priority).length
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
