# Git Genius

![Git Genius](https://img.shields.io/badge/Git-Genius-blue)
![React](https://img.shields.io/badge/React-18.3.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue)
![License](https://img.shields.io/badge/license-MIT-green)

Git Genius is a powerful web application that provides detailed analytics and insights for GitHub profiles. It helps developers understand their GitHub activity, repository statistics, and coding patterns through an intuitive and visually appealing interface.

## ✨ Features

- **GitHub Profile Analysis**: Comprehensive analysis of GitHub profiles with detailed statistics
- **Repository Insights**: Detailed view of repository metrics including stars, commits, and languages
- **Language Distribution**: Visual representation of programming language usage across repositories
- **Year-based Filtering**: Filter statistics by year to track progress over time
- **Real-time Search**: Instant GitHub username search with profile suggestions
- **Responsive Design**: Beautiful, responsive UI that works across all devices
- **Share Profiles**: Easy sharing of analyzed GitHub profiles

## 🚀 Tech Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom animations
- **UI Components**: Radix UI with shadcn/ui
- **Charts**: Recharts for data visualization
- **API Integration**: GitHub API via Octokit
- **State Management**: TanStack Query (React Query)
- **Build Tool**: Vite
- **Deployment**: Vercel

## 🛠️ Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/Developer-Utkarsh/gitgenius.git
   ```

2. Navigate to project directory:

   ```bash
   cd git-genius
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Create a `.env` file in the root directory with the following variables:

   ```env
   VITE_ENV=development
   VITE_GITHUB_CLIENT_ID=your_github_client_id
   VITE_GITHUB_REDIRECT_URI=your_redirect_uri
   VITE_DEV_API_URL=http://localhost:3000/api
   VITE_DEV_CLIENT_URL=http://localhost:8080
   GITHUB_CLIENT_SECRET=your_github_client_secret
   ```

5. Start the development server:

   ```bash
   npm run dev
   ```

6. Open your browser and visit `http://localhost:8080`

Note: You'll need to create a GitHub OAuth App and get the client ID and secret. Set the callback URL in your GitHub OAuth App settings to match VITE_GITHUB_REDIRECT_URI.

## 🔧 Configuration

The project uses several configuration files:

- `vite.config.ts` for Vite configuration
- `tailwind.config.ts` for Tailwind CSS customization
- `tsconfig.json` for TypeScript settings
- `eslint.config.js` for code linting

## 🌟 Usage

1. Visit the application and authenticate with your GitHub account
2. Enter a GitHub username to analyze
3. View comprehensive statistics including:
   - Repository count
   - Language distribution
   - Total lines of code
   - Commit history
   - Star count
   - Pull request statistics

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [GitHub API](https://docs.github.com/en/rest) for providing the data
- [shadcn/ui](https://ui.shadcn.com/) for beautiful UI components
- [Recharts](https://recharts.org/) for chart components
- [Tailwind CSS](https://tailwindcss.com/) for styling

## 📧 Contact

For questions or feedback, please open an issue or reach out to the maintainers.

---

Made with ❤️ by [Utkarsh Tiwari](https://github.com/Developer-Utkarsh)
