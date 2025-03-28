# Workflow Management System

A modern web application for creating and managing automated workflows with a visual flow editor.

## Features

- User authentication with email and password
- Visual workflow editor with drag-and-drop interface
- Support for multiple step types (API calls, emails)
- Workflow execution and monitoring
- Search and filter workflows
- Responsive design

## Tech Stack

- React with TypeScript
- Material-UI for components
- React Flow for workflow visualization
- Firebase for authentication and data storage
- Vite for build tooling

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Firebase account and project

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd workflow-management
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

## Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/         # Page components
├── contexts/      # React contexts
├── services/      # External service integrations
├── store/         # State management
├── utils/         # Utility functions
├── types/         # TypeScript type definitions
└── assets/        # Static assets
```

## Features in Detail

### Authentication
- Email and password authentication
- Protected routes
- Session management

### Workflow Editor
- Visual flow editor with drag-and-drop
- Support for multiple step types
- Real-time preview
- Save and load workflows

### Workflow List
- List view of all workflows
- Search and filter functionality
- Status indicators
- Quick actions (edit, delete, execute)

### Step Types
- API Calls
  - Configure URL and method
  - Support for GET, POST, PUT, DELETE
- Email
  - Configure recipient, subject, and body
  - Template support

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 