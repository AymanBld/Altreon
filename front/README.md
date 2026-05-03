# Altreon - Frontend Web Hub

This directory contains the React-based web interface for the Altreon Incident Response Platform. It includes both the **Admin Triage Dashboard** and the **Secure Reporting Hub**.

## Technologies

- **React 19**
- **Vite** (Build tool)
- **Tailwind CSS** (Styling)
- **React Router 7** (Navigation)

## Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Environment Variables**:
   Create a `.env` file or ensure the defaults in `src/config.js` point to your backend:
   `VITE_API_BASE_URL=http://127.0.0.1:8000`

3. **Run Development Server**:
   ```bash
   npm run dev
   ```

## Key Components

- `src/components/admin/`: Admin-facing triage and vault views.
- `src/components/user/`: User-facing reporting wizard.
- `src/theme/`: Shared design tokens and aesthetics.

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
