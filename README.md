# Next-Gen Personal Dashboard

A personal dashboard application built with Next.js, TypeScript, and Tailwind CSS. This application provides a modern interface to help you organize your tasks, track your progress, and stay motivated with AI-powered features.

## Features

*   **Authentication:** Secure login form.
*   **Dashboard:** A central hub for your daily activities.
    *   **Motivational Messages:** Get a dose of motivation every day, powered by AI.
    *   **Task Management:** Create, manage, and track your tasks with an intuitive interface.
    *   **Notes:** Jot down your thoughts and ideas in a dedicated notes section.
    *   **Week View:** Visualize your week at a glance.
*   **Statistics:** Get insights into your productivity.
    *   **Activity Heatmap:** See your activity patterns over time.
    *   **Overview Cards:** Key metrics at a glance.
    *   **Weekly Performance Chart:** Track your performance week over week.
*   **AI Integration:** Leveraging Genkit for intelligent features like daily motivational messages.
*   **Theming:** Light and dark mode support.

## Technologies Used

*   **Framework:** [Next.js](https://nextjs.org/)
*   **Language:** [TypeScript](https://www.typescriptlang.org/)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
*   **UI Components:** [Radix UI](https://www.radix-ui.com/) & [shadcn/ui](https://ui.shadcn.com/)
*   **AI:** [Genkit](https://firebase.google.com/docs/genkit)
*   **Charts:** [Recharts](https://recharts.org/)
*   **Forms:** [React Hook Form](https://react-hook-form.com/)
*   **Deployment:** Configured for [Firebase App Hosting](https://firebase.google.com/docs/app-hosting).

## Getting Started

### Prerequisites

*   [Node.js](https://nodejs.org/) (v20 or later)
*   [npm](https://www.npmjs.com/)

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/milesdredd/streakSphere.git
    ```
2.  Navigate to the project directory:
    ```bash
    cd web-app
    ```
3.  Install the dependencies:
    ```bash
    npm install
    ```

### Running the Development Server

To start the development server, run the following command:

```bash
npm run dev
```

The application will be available at [http://localhost:9002](http://localhost:9002).

## Project Structure

```
/
├── public/              # Static assets
├── src/
│   ├── ai/              # AI-related code (Genkit flows)
│   ├── app/             # Next.js App Router pages and layouts
│   ├── components/      # Reusable UI components
│   ├── context/         # React context providers
│   ├── hooks/           # Custom React hooks
│   └── lib/             # Utility functions and data
├── .env.local           # Environment variables (create this file)
├── next.config.ts       # Next.js configuration
├── package.json         # Project dependencies and scripts
└── tsconfig.json        # TypeScript configuration
```

## Deployment

This project is configured for deployment with [Firebase App Hosting](https://firebase.google.com/docs/app-hosting). The `apphosting.yaml` file contains the basic configuration for deployment.
