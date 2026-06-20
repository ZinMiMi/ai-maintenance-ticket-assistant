/**
 * Guest Service Portal
 * Handles guest requests and creates tickets in the operations system
 */

class GuestServicePortal {
  constructor() {
    this.selectedCategory = null;
    this.init();
  }

  init() {
    this.form = document.getElementById('guestRequestForm');
    this.requestForm = document.getElementById('requestForm');
    this.successMessage = document.getElementById('successMessage');
    this.formTitle = document.getElementById('formTitle');

    this.bindEvents();
  }

  bindEvents() {
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
  }

  selectCategory(category) {
    this.selectedCategory = category;
    this.formTitle.textContent = this.getCategoryTitle(category);
    this.requestForm.style.display = 'block';
    this.successMessage.style.display = 'none';

    // Scroll to form
    this.requestForm.scrollIntoView({ behavior: 'smooth' });
  }

  hideForm() {
    this.requestForm.style.display = 'none';
    this.selectedCategory = null;
  }

  handleSubmit(e) {
    e.preventDefault();

    const roomNumber = document.getElementById('roomNumber').value;
    const guestName = document.getElementById('guestName').value;
    const details = document.getElementById('requestDetails').value;
    const urgency = document.getElementById('urgency').value;
    const contactMethod = document.getElementById('contactMethod').value;

    // Create ticket
    const ticket = this.createTicket(roomNumber, guestName, details, urgency, contactMethod);

    // Show success
    this.showSuccess(ticket);

    // Reset form
    this.form.reset();
    this.requestForm.style.display = 'none';
  }

  createTicket(roomNumber, guestName, details, urgency, contactMethod) {
    const now = new Date().toISOString();
    const department = this.getDepartmentForCategory(this.selectedCategory);
    const category = this.getCategoryMapping(this.selectedCategory);

    const ticket = {
      id: Date.now(),
      title: `${this.getCategoryTitle(this.selectedCategory)} - Room ${roomNumber}`,
      description: `Guest: ${guestName}\nRoom: ${roomNumber}\nContact: ${contactMethod}\n\n${details}`,
      department: department,
      category: category,
      priority: urgency,
      assignedTo: null,
      image: null,
      status: 'open',
      source: 'guest',
      guestInfo: {
        name: guestName,
        room: roomNumber,
        contact: contactMethod
      },
      createdAt: now,
      updatedAt: now,
      history: [{
        status: 'open',
        timestamp: now,
        note: `Guest request submitted from Room ${roomNumber}`
      }]
    };

    // Save to localStorage (shared with main app)
    this.saveTicket(ticket);

    return ticket;
  }

  getDepartmentForCategory(category) {
    const mapping = {
      'housekeeping': 'housekeeping',
      'maintenance': 'engineering',
      'concierge': 'front-office',
      'transportation': 'front-office'
    };
    return mapping[category] || 'front-office';
  }

  getCategoryMapping(category) {
    const mapping = {
      'housekeeping': 'other',
      'maintenance': 'other',
      'concierge': 'other',
      'transportation': 'other'
    };
    return mapping[category] || 'other';
  }

  getCategoryTitle(category) {
    const titles = {
      'housekeeping': '🧹 Housekeeping Request',
      'maintenance': '🔧 Maintenance Request',
      'concierge': '🛎️ Concierge Request',
      'transportation': '🚗 Transportation Request'
    };
    return titles[category] || 'Guest Request';
  }

  saveTicket(ticket) {
    const tickets = JSON.parse(localStorage.getItem('hotelOperationsTickets') || '[]');
    tickets.unshift(ticket);
    localStorage.setItem('hotelOperationsTickets', JSON.stringify(tickets));
  }

  showSuccess(ticket) {
    document.getElementById('requestId').textContent = ticket.id;
    document.getElementById('etaMessage').textContent = this.getETA(ticket.priority);

    this.successMessage.style.display = 'block';
    this.successMessage.scrollIntoView({ behavior: 'smooth' });
  }

  getETA(priority) {
    const etas = {
      'critical': '⏱️ Expected response: Within 15 minutes',
      'high': '⏱️ Expected response: Within 30 minutes',
      'medium': '⏱️ Expected response: Within 1 hour',
      'low': '⏱️ Expected response: Within 2 hours'
    };
    return etas[priority] || etas['medium'];
  }

  resetForm() {
    this.successMessage.style.display = 'none';
    this.selectedCategory = null;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  generateQR() {
    const qrContainer = document.getElementById('qrCode');
    const guestUrl = window.location.href;

    // Use QRCode library if available, otherwise show placeholder
    if (typeof QRCode !== 'undefined') {
      qrContainer.innerHTML = '';
      new QRCode(qrContainer, {
        text: guestUrl,
        width: 150,
        height: 150,
        colorDark: '#1f2937',
        colorLight: '#ffffff',
      });
    } else {
      qrContainer.innerHTML = `
        <div style="padding: 20px; background: var(--gray-50); border-radius: 8px;">
          <p style="font-size: 3rem; margin-bottom: 8px;">📱</p>
          <p style="font-size: 0.9rem; color: var(--gray-500);">
            QR Code Library not loaded<br>
            <small>URL: ${guestUrl}</small>
          </p>
        </div>
      `;
    }

    this.showToast('QR Code generated!');
  }

  showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }
}

// Initialize guest portal
const guest = new GuestServicePortal();
