# AI Hotel Operations Management System

Live Demo:
https://zinmimi.github.io/ai-maintenance-ticket-assistant/

A responsive web application for managing hotel operations, maintenance requests, and departmental coordination.

## Features

- **Ticket Submission** - Create maintenance and operations tickets with title, description, department, category, and priority
- **Department Management** - Route tickets to appropriate departments (Engineering, Housekeeping, Front Office, IT, F&B, Security, HR, Finance)
- **Image Upload** - Attach photos of issues via drag-and-drop or file picker
- **Category System** - Organize by issue type (Plumbing, Electrical, HVAC, Structural, Appliance)
- **Priority Levels** - Set urgency (Low, Medium, High, Critical) with color-coded indicators
- **Ticket Management** - View, filter, and resolve tickets
- **Persistent Storage** - Tickets saved in localStorage
- **Responsive Design** - Works on desktop and mobile devices

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
├── index.html          # Main HTML structure
├── styles.css          # Styling and responsive layout
├── app.js              # Application logic
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
