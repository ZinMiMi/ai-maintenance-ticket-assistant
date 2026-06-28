<!-- test -->
# AI Hotel Operations Management System

Live Demo:
https://zinmimi.github.io/ai-maintenance-ticket-assistant/

A responsive web application for managing hotel operations, maintenance requests, and departmental coordination.

## Features

- **Guest Service Portal** - Mobile-friendly interface for guests to submit requests
- **QR Code Access** - Generate QR codes for easy guest portal access
- **Auto-Routing** - Guest requests automatically routed to correct departments
- **Ticket Workflow Management** - Full lifecycle tracking with statuses: Open, In Progress, Pending, Resolved, Closed
- **Ticket Assignment** - Assign tickets to specific staff members
- **Status History** - Complete audit trail of all status changes with timestamps
- **AI Ticket Classification** - Intelligent analysis suggests department, category, and priority based on description
- **Operations Dashboard** - Real-time overview of ticket statistics by status, department, and priority
- **Ticket Submission** - Create maintenance and operations tickets with title, description, department, category, and priority
- **Department Management** - Route tickets to appropriate departments (Engineering, Housekeeping, Front Office, IT, F&B, Security, HR, Finance)
- **Image Upload** - Attach photos of issues via drag-and-drop or file picker
- **Category System** - Organize by issue type (Plumbing, Electrical, HVAC, Structural, Appliance)
- **Priority Levels** - Set urgency (Low, Medium, High, Critical) with color-coded indicators
- **Advanced Filtering** - Filter by status, department, category, and priority
- **Persistent Storage** - Tickets saved in localStorage
- **Responsive Design** - Works on desktop and mobile devices

## Guest Service Portal

The Guest Service Portal (`guest.html`) provides a mobile-friendly interface for hotel guests.

### Guest Request Types

| Type | Icon | Department | Description |
|------|------|------------|-------------|
| Housekeeping | 🧹 | Housekeeping | Room cleaning, towels, amenities |
| Maintenance | 🔧 | Engineering | Repairs, equipment issues |
| Concierge | 🛎️ | Front Office | Reservations, recommendations |
| Transportation | 🚗 | Front Office | Taxi, shuttle, car service |

### Features

- **Quick Category Selection** - Visual buttons for common requests
- **Room Number Tracking** - Requests linked to guest rooms
- **Urgency Levels** - Guests can indicate request priority
- **Contact Preferences** - Guests choose how to be contacted
- **Auto-Routing** - Requests automatically assigned to correct department
- **QR Code Generation** - Generate QR codes for room placement
- **Request Confirmation** - Guests receive request ID and ETA

### Accessing the Portal

- Direct link: `guest.html`
- From staff dashboard: Click "📱 Guest Service Portal" in header
- QR Code: Generate and place in guest rooms

## Ticket Workflow

### Statuses

| Status | Description |
|--------|-------------|
| 🔓 Open | New ticket, awaiting assignment |
| 🔄 In Progress | Work has started |
| ⏸️ Pending | Waiting for parts, info, or approval |
| ✅ Resolved | Issue has been fixed |
| 📁 Closed | Ticket completed and archived |

### Workflow Features

- **Status Dropdown** - Change ticket status directly from the ticket card
- **Assign Button** - Assign tickets to staff members via prompt
- **History Button** - View complete status change timeline
- **Timestamps** - Created and Last Updated dates on each ticket
- **Audit Trail** - All changes logged with timestamps

## AI Classification

The AI Ticket Classifier analyzes ticket descriptions and suggests:

- **Department** - Routes to the appropriate hotel department
- **Category** - Classifies the issue type (Plumbing, Electrical, HVAC, etc.)
- **Priority** - Assesses urgency level based on keywords

### How to Use

1. Enter a ticket title and description
2. Click **🤖 AI Analyze**
3. Review the suggestions
4. Click **Apply Suggestions** to auto-fill the form

### Architecture

The AI classifier uses a modular architecture (`ai-classifier.js`) designed for easy integration:

- **Current**: Keyword-based analysis with confidence scoring
- **Future**: Replace with Claude API by implementing the same `classify()` interface

```javascript
// To integrate Claude API, extend the classifier:
class ClaudeClassifier extends AITicketClassifier {
  async classify(title, description) {
    // Call Claude API here
    // Return same format: { department, category, priority, confidence }
  }
}
```

## Dashboard

The Operations Dashboard provides at-a-glance metrics:

- **Total Tickets** - All tickets in the system
- **Open** - New tickets awaiting assignment
- **In Progress** - Tickets being worked on
- **Pending** - Tickets waiting for external factors
- **Resolved** - Completed tickets
- **Closed** - Archived tickets
- **By Department** - Ticket distribution across hotel departments
- **By Priority** - Breakdown of tickets by urgency level

## Departments

| Department | Icon | Use Case |
|------------|------|----------|
| Engineering | 🔧 | Maintenance, repairs, equipment |
| Housekeeping | 🧹 | Room cleaning, laundry, supplies |
| Front Office | 🛎️ | Reception, reservations, guest services |
| IT | 💻 | Technology, networks, systems |
| F&B | 🍽️ | Food & Beverage, kitchen, restaurants |
| Security | 🔒 | Safety, access control, surveillance |
| HR | 👥 | Staff, training, policies |
| Finance | 💰 | Billing, accounting, procurement |

## Getting Started

1. Open `index.html` in a web browser
2. Fill in the ticket form with issue details
3. Select the appropriate department
4. Optionally upload an image of the problem
5. Submit and manage your tickets

## File Structure

```
├── index.html          # Staff operations dashboard
├── styles.css          # Staff dashboard styling
├── app.js              # Staff application logic
├── ai-classifier.js    # AI classification engine
├── guest.html          # Guest service portal
├── guest.css           # Guest portal styling
├── guest.js            # Guest request handling
├── qrcode.js           # QR code generation
├── README.md           # This file
├── .mcp.json           # MCP configuration
├── .claude/
│   ├── skills/maintenance/SKILL.md
│   └── agents/maintenance-agent.md
└── slides/
    └── pitch.md        # Presentation slides
```

## Technologies

- HTML5
- CSS3 (Grid, Flexbox, Custom Properties)
- Vanilla JavaScript (ES6+)
- LocalStorage for data persistence

## License

MIT
