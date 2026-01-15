# Contributing to Data Structures Visualizer

Thank you for your interest in contributing to the Data Structures Visualizer! We welcome contributions from the community to help make this project better for students and developers.

## 🤝 How to Contribute

### Reporting Bugs
1.  Check the [Issue Tracker](../../issues) to see if the bug has already been reported.
2.  If not, open a new issue.
3.  Describe the issue clearly:
    *   What happened?
    *   What did you expect to happen?
    *   Steps to reproduce.
    *   Screenshots (if applicable).

### Requesting Features
1.  Check the [Issue Tracker](../../issues) for existing requests.
2.  Open a new issue with the "Feature Request" label.
3.  Explain clearly why this feature would be useful.

### Submitting Code Changes
1.  **Fork the Repository**: Click the "Fork" button at the top right of the repo page.
2.  **Clone your Fork**:
    ```bash
    git clone https://github.com/YOUR_USERNAME/Data-Structures-Visualizer.git
    cd Data-Structures-Visualizer
    ```
3.  **Create a Branch**:
    *   Use a descriptive name: `feature/new-algo-name` or `fix/issue-description`.
    *   `git checkout -b feature/my-feature`
4.  **Make Changes**:
    *   Follow the existing code style (clean React functional components, TypeScript types).
    *   Ensure all new algorithm logic is separated from the visualization components.
5.  **Test Your Changes**: Run the app locally to ensure everything works as expected.
    *   `npm run dev`
6.  **Commit Changes**:
    *   Write clear, concise commit messages.
    *   `git commit -m "Add visualization for [Algorithm Name]"`
7.  **Push to GitHub**:
    *   `git push origin feature/my-feature`
8.  **Open a Pull Request**:
    *   Go to the original repository.
    *   Click "New Pull Request".
    *   Select your branch and submit.

## 💻 Development Guidelines

### Technology Stack
*   **React** (v18+)
*   **TypeScript**
*   **Tailwind CSS**
*   **Vite**

### Project Structure
*   `src/algorithms/`: Pure TypeScript implementations of algorithms (no UI code).
*   `src/visualizers/`: React components that handle the animation logic.
*   `src/components/`: Reusable UI elements (Controls, Layouts).

### Code Style
*   Use TypeScript for all new files.
*   Prefer functional components with Hooks.
*   Use Tailwind CSS for styling.
*   Keep files small and focused.

## 📜 License
By contributing, you agree that your contributions will be licensed under the MIT License.
