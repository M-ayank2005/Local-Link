# Contributing to Local Links

First off, thank you for considering contributing to Local Links! We welcome contributions from everyone.

This document outlines the process for contributing to the project.

## 1. Fork the Repository

Navigate to the main Local Links repository on GitHub and click the **"Fork"** button in the top right corner. This will create a copy of the repository in your own GitHub account.

## 2. Clone your Fork

Next, clone the forked repository to your local machine:

```bash
git clone https://github.com/YOUR-USERNAME/local_link.git
cd local_link
```

*(Note: Replace `YOUR-USERNAME` with your actual GitHub username and adjust the repo name if necessary).*

## 3. Set Up the Project

Local Links consists of a Next.js frontend and an Express Node.js backend. You'll need to set up both.

### Backend Setup (Express + MongoDB)

Make sure you have MongoDB running locally or have a MongoDB URI ready.

```bash
# Navigate to the backend directory
cd backend

# Install dependencies (using pnpm, npm, or yarn)
pnpm install

# Set up environment variables
cp .env.example .env
```

Open the `.env` file and update the variables (like `MONGO_URI`) as needed for your local environment.

Run the local development server:

```bash
# Start the backend server
node src/server.js
```

### Frontend Setup (Next.js)

Open a new terminal window and set up the React frontend:

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
pnpm install

# Start the Next.js development server
pnpm run dev
```

The frontend should now be running on `http://localhost:3000` (or another port if 3000 is in use), and the backend on `http://localhost:5000`.

## 4. Make Changes and Test

Before making any changes, create a new branch for your feature, bug fix, or documentation update:

```bash
git checkout -b feature/my-awesome-feature
# or
git checkout -b fix/issue-name
```

- Write your code!
- Ensure your changes do not break existing functionality.
- Test your changes locally by interacting with the app on both the frontend and backend.

## 5. Commit and Push

Once you are satisfied with your changes, add and commit them. Please write clear, concise commit messages.

```bash
git add .
git commit -m "feat: added my awesome feature"
```

Push your new branch to your forked repository:

```bash
git push origin feature/my-awesome-feature
```

## 6. Create a Pull Request (PR)

1. Go back to your forked repository on GitHub.
2. You should see a prompt to **"Compare & pull request"** for your recently pushed branch. Click it.
3. If you don't see the prompt, manually go to the **Pull requests** tab and click **"New pull request"**.
4. Set the base repository to the original Local Links repository and the `main` branch, and the head repository to your fork and the branch you just created.
5. Provide a clear title and description for your PR. Explain what you changed, why you changed it, and any testing steps required.
6. Click **"Create pull request"**.

A maintainer will review your code, and once approved, it will be merged into the main project. Thank you for making Local Links better!
