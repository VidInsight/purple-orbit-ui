# Workflow Automation Platform

A modern, full-featured workflow automation platform built with React, TypeScript, and Vite. Create, manage, and execute automated workflows with a beautiful visual editor.

![Tech Stack](https://img.shields.io/badge/React-18.3.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![Vite](https://img.shields.io/badge/Vite-5.x-purple)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.x-cyan)

## ✨ Features

### 🎯 Core Features
- **Visual Workflow Editor** - Drag-and-drop interface powered by React Flow
- **Execution Monitoring** - Real-time execution tracking with detailed logs
- **Credential Management** - Secure storage for API keys and credentials
- **Database Connections** - Manage multiple database connections
- **File Storage** - Upload and manage workflow files
- **API Key Management** - Generate and manage API keys with granular permissions

### 👥 Collaboration
- **User Management** - Role-based access control (Admin, Editor, Viewer)
- **Team Invitations** - Invite users with email and custom messages
- **Workspace Management** - Multi-workspace support

### 💳 Billing & Subscriptions
- **Flexible Plans** - Free, Pro, and Enterprise tiers
- **Usage Tracking** - Monitor workflows, executions, and storage
- **Billing History** - View and download invoices
- **Payment Management** - Secure payment method updates

### 🎨 User Experience
- **Dark/Light Mode** - Fully themed with smooth transitions
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- **Keyboard Shortcuts** - Quick navigation with Cmd/Ctrl shortcuts
- **Toast Notifications** - Real-time feedback for all actions
- **Error Boundary** - Graceful error handling

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ or Bun
- npm, yarn, or bun package manager

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd workflow-automation-platform
```

2. Install dependencies:
```bash
npm install
# or
bun install
```

3. Configure API endpoint (optional):
```bash
# .env.local dosyası oluşturun (veya mevcut dosyayı düzenleyin)
echo "VITE_API_BASE_URL=http://localhost:8000" > .env.local
```

**Not:** Default API URL: `http://localhost:8000`. Production için `.env.local` dosyasında değiştirin.

4. Start the development server:
```bash
npm run dev
# or
bun run dev
```

5. Open your browser to `http://localhost:8080`

### Demo Data
The application automatically seeds demo data on first load, including:
- Sample workspace
- Demo workflows
- Mock execution data
- Sample users and invitations

## 📁 Project Structure

```
src/
├── components/
│   ├── layout/              # Layout components (Navbar, PageLayout, etc.)
│   ├── shared/              # Reusable components (ListPageTemplate, etc.)
│   ├── ui/                  # shadcn/ui components
│   ├── workflow-editor/     # Workflow editor components
│   ├── executions/          # Execution detail components
│   ├── user-management/     # User management components
│   ├── api-keys/            # API key management components
│   └── billing/             # Billing components
├── context/
│   ├── ThemeContext.tsx     # Dark/light mode management
│   ├── WorkspaceContext.tsx # Workspace state management
│   └── UserContext.tsx      # User state management
├── pages/
│   ├── WorkspaceSelection.tsx
│   ├── Dashboard.tsx
│   ├── Workflows.tsx
│   ├── WorkflowEditor.tsx
│   ├── Executions.tsx
│   ├── ExecutionDetails.tsx
│   ├── Credentials.tsx
│   ├── Databases.tsx
│   ├── Variables.tsx
│   ├── Files.tsx
│   ├── ApiKeys.tsx
│   ├── UserManagement.tsx
│   ├── Billing.tsx
│   └── NotFound.tsx
├── types/
│   ├── common.ts            # Common type definitions
│   ├── workflow.ts          # Workflow types
│   ├── execution.ts         # Execution types
│   ├── workspace.ts         # Workspace types
│   ├── user.ts              # User types
│   ├── billing.ts           # Billing types
│   └── api.ts               # API response types
├── config/
│   └── api.ts               # API endpoint configuration
├── utils/
│   ├── workspaceStorage.ts  # Workspace localStorage utilities
│   ├── workflowStorage.ts   # Workflow localStorage utilities
│   ├── mockData.ts          # Mock data generators
│   ├── mockExecutionData.ts # Mock execution data
│   ├── dashboardData.ts     # Dashboard data
│   ├── keyboardShortcuts.ts # Keyboard shortcut handlers
│   └── seedData.ts          # Demo data seeding
├── lib/
│   ├── utils.ts             # Utility functions
│   └── apiClient.ts         # API client (HTTP requests)
├── hooks/
│   ├── use-toast.ts         # Toast notification hook
│   ├── use-mobile.tsx       # Mobile detection hook
│   └── useNavbar.ts         # Navbar state hook
├── App.tsx                  # Main app with routing
├── main.tsx                 # Entry point
└── index.css                # Global styles & design system
```

## 🎨 Tech Stack

### Core
- **React 18.3** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router DOM** - Client-side routing

### UI & Styling
- **TailwindCSS** - Utility-first CSS
- **shadcn/ui** - Component library
- **Lucide React** - Icon library
- **React Flow** - Visual workflow editor

### State Management
- **React Context** - Global state (Theme, Workspace, User)
- **React Query** - Server state management (ready for backend)
- **localStorage** - Client-side persistence

### API Integration
- **API Client** - Centralized HTTP client (`src/lib/apiClient.ts`)
- **API Config** - Centralized endpoint management (`src/config/api.ts`)
- **Type-Safe** - Full TypeScript support for API requests/responses
- **Authentication** - JWT Bearer Token & API Key support

### Development
- **ESLint** - Code linting
- **TypeScript ESLint** - TypeScript-specific linting
- **Vite Plugin React** - Fast refresh

## ⌨️ Keyboard Shortcuts

- `Cmd/Ctrl + D` - Go to Dashboard
- `Cmd/Ctrl + W` - Go to Workflows
- `Cmd/Ctrl + E` - Go to Executions
- `Cmd/Ctrl + K` - Command Palette (Coming Soon)

## 🎯 Key Pages & Features

### Workflow Editor
- Visual node-based editor
- Drag and drop nodes (Trigger, Action, Condition, Loop, End)
- Connect nodes with edges
- Node property panel
- Auto-save functionality
- Export/import workflows as JSON

### Execution Details
- Execution overview with status
- Step-by-step timeline
- Input/output data viewer
- Collapsible logs (Console, Errors, Debug)
- Re-run functionality
- Download execution reports

### User Management
- Active users table with role management
- Pending invitations tracking
- Inline role editing for admins
- Bulk user invitations
- Email validation

### API Keys
- Generate API keys with custom permissions
- One-time key reveal with mandatory confirmation
- Key masking for security
- Expiration tracking with warnings
- Copy to clipboard functionality

### Billing
- Current plan overview with usage bars
- Plan comparison (Free, Pro, Enterprise)
- Monthly/annual billing toggle
- Billing history with invoice downloads
- Payment method management
- Billing information editor

## 🔒 Security Features

- API keys are masked after creation
- One-time key reveal with confirmation
- Expiration warnings for keys and payment methods
- Role-based access control
- Protected routes requiring workspace context
- Error boundary for graceful error handling

## 📱 Responsive Design

The application is fully responsive with:
- Desktop-first design (1400px max-width containers)
- Collapsible sidebar for mobile
- Responsive tables that convert to cards on mobile
- Touch-friendly UI elements
- Mobile-optimized modals and dropdowns

## 🎨 Design System

### Colors
- **Primary**: Deep purple (Purple-600/500)
- **Background**: Slate-950 (dark) / White (light)
- **Surface**: Slate-900 (dark) / Slate-50 (light)
- **Accent**: Purple-500
- **Semantic**: Green-500 (success), Amber-500 (warning), Red-500 (error)

### Typography
- **Font**: Inter (sans-serif)
- **Headings**: font-semibold
- **Body**: font-normal

### Spacing
- **Base Unit**: 4px (Tailwind default)
- **Container**: 1400px max-width
- **Padding**: px-6 py-4

## 🚢 Deployment

### Build for Production

```bash
npm run build
# or
bun run build
```

The build output will be in the `dist/` directory.

### Deploy to Vercel/Netlify

1. Connect your repository
2. Set build command: `npm run build` or `bun run build`
3. Set output directory: `dist`
4. Deploy!

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### API Configuration

Backend API endpoint'leri merkezi olarak `src/config/api.ts` dosyasında yönetilir.

**Environment Variables:**
- `VITE_API_BASE_URL` - API base URL (default: `http://localhost:8000`)

**Kullanım Örneği:**
```typescript
import { apiClient } from '@/lib/apiClient';
import { API_ENDPOINTS } from '@/config/api';

// Login
const response = await apiClient.post(
  API_ENDPOINTS.auth.login,
  { email_or_username: 'user@example.com', password: 'password' },
  { skipAuth: true }
);

// Authenticated request
const workflows = await apiClient.get(
  API_ENDPOINTS.workflow.list(workspaceId),
  { token: accessToken }
);
```

**Daha fazla örnek için:** `src/lib/apiClient.example.ts` dosyasına bakın.

### Adding New Pages

1. Create page component in `src/pages/`
2. Add route in `src/App.tsx`
3. Add navigation item in `src/components/layout/Navbar.tsx`
4. Wrap with `<ProtectedRoute>` if workspace context is required

### Adding New Features

1. Create types in `src/types/`
2. Create components in `src/components/`
3. Add utilities in `src/utils/`
4. Update mock data generators if needed

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) - Beautiful component library
- [Lucide](https://lucide.dev/) - Icon library
- [React Flow](https://reactflow.dev/) - Workflow visualization
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS

---

Built with ❤️ using React, TypeScript, and Vite
