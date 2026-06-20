# AI Maintenance Ticket Assistant

A simple, responsive web application for submitting and managing maintenance tickets with image upload support.

## Features

- **Ticket Submission** - Create maintenance tickets with title, description, category, and priority
- **Image Upload** - Attach photos of issues via drag-and-drop or file picker
- **Category Selection** - Organize tickets by type (Plumbing, Electrical, HVAC, Structural, Appliance)
- **Priority Levels** - Set urgency (Low, Medium, High, Critical) with color-coded indicators
- **Ticket Management** - View, filter, and resolve tickets
- **Persistent Storage** - Tickets saved in localStorage
- **Responsive Design** - Works on desktop and mobile devices

## Getting Started

1. Open `index.html` in a web browser
2. Fill in the ticket form with issue details
3. Optionally upload an image of the problem
4. Submit and manage your tickets

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
