// AI Maintenance Ticket Assistant - Main Application

class MaintenanceTicketApp {
  constructor() {
    this.tickets = this.loadTickets();
    this.init();
  }

  init() {
    this.form = document.getElementById('ticketForm');
    this.ticketList = document.getElementById('ticketList');
    this.ticketCount = document.getElementById('ticketCount');
    this.imageUpload = document.getElementById('imageUpload');
    this.imagePreview = document.getElementById('imagePreview');
    this.uploadPlaceholder = document.getElementById('uploadPlaceholder');
    this.filterCategory = document.getElementById('filterCategory');
    this.filterPriority = document.getElementById('filterPriority');

    this.bindEvents();
    this.renderTickets();
  }

  bindEvents() {
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    this.imageUpload.addEventListener('change', (e) => this.handleImageUpload(e));
    this.filterCategory.addEventListener('change', () => this.renderTickets());
    this.filterPriority.addEventListener('change', () => this.renderTickets());

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

    const ticket = {
      id: Date.now(),
      title: document.getElementById('issueTitle').value,
      description: document.getElementById('issueDescription').value,
      category: document.getElementById('category').value,
      priority: document.getElementById('priority').value,
      image: this.imagePreview.src || null,
      status: 'open',
      createdAt: new Date().toISOString()
    };

    this.tickets.unshift(ticket);
    this.saveTickets();
    this.renderTickets();
    this.form.reset();
    this.imagePreview.style.display = 'none';
    this.uploadPlaceholder.style.display = 'flex';

    this.showToast('Ticket submitted successfully!');
  }

  deleteTicket(id) {
    this.tickets = this.tickets.filter(t => t.id !== id);
    this.saveTickets();
    this.renderTickets();
    this.showToast('Ticket deleted');
  }

  toggleStatus(id) {
    const ticket = this.tickets.find(t => t.id === id);
    if (ticket) {
      ticket.status = ticket.status === 'open' ? 'resolved' : 'open';
      this.saveTickets();
      this.renderTickets();
    }
  }

  getFilteredTickets() {
    const category = this.filterCategory.value;
    const priority = this.filterPriority.value;

    return this.tickets.filter(ticket => {
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
      <div class="ticket-card priority-${ticket.priority}">
        <div class="ticket-header">
          <span class="ticket-title">${this.escapeHtml(ticket.title)}</span>
          <div class="ticket-actions">
            <button class="btn-icon" onclick="app.toggleStatus(${ticket.id})" title="Toggle Status">
              ${ticket.status === 'open' ? '✅' : '🔄'}
            </button>
            <button class="btn-icon" onclick="app.deleteTicket(${ticket.id})" title="Delete">
              🗑️
            </button>
          </div>
        </div>
        <p class="ticket-description">${this.escapeHtml(ticket.description)}</p>
        ${ticket.image ? `<img src="${ticket.image}" class="ticket-image" alt="Issue">` : ''}
        <div class="ticket-meta">
          <span class="badge badge-category">${this.getCategoryIcon(ticket.category)} ${ticket.category}</span>
          <span class="badge badge-priority-${ticket.priority}">${ticket.priority}</span>
          <span class="badge badge-status">${ticket.status}</span>
        </div>
        <div class="ticket-time">${this.formatDate(ticket.createdAt)}</div>
      </div>
    `).join('');
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
    localStorage.setItem('maintenanceTickets', JSON.stringify(this.tickets));
  }

  loadTickets() {
    const saved = localStorage.getItem('maintenanceTickets');
    return saved ? JSON.parse(saved) : [];
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
const app = new MaintenanceTicketApp();
