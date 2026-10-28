# QuickNotes System Design

Welcome to the QuickNotes project! This repository demonstrates how to build a browser-based application that communicates with an API, alongside professional system design documentation for scaling a real-world backend to support 1 million users.

## Project Objectives
1. **Frontend API Client**: A working, accessible web application built with HTML5, CSS3, and vanilla JavaScript that interacts with the JSONPlaceholder practice API.
2. **System Design Documentation**: Professional architectural, database, and API design documents outlining how a production-ready QuickNotes backend would be built, secured, and scaled.

## Repository Structure
```text
quicknotes-system-design/
│
├── index.html          # Main application structure
├── style.css           # Styling and responsive design
├── api.js              # Frontend API client logic
├── README.md           # This file
│
└── docs/
    ├── api-design.md       # Production REST API specification
    ├── data-model.md       # Relational database schema (PostgreSQL)
    └── architecture.md     # Scalable system architecture for 1M users