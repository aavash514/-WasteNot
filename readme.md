# WasteNot

**A Truman State University Sustainability App**

## Table of Contents
1. [About the Project](#about-the-project)
2. [Features](#features)
3. [Technologies Used](#technologies-used)
4. [Project Structure](#project-structure)
5. [Installation](#installation)
6. [Usage](#usage)
7. [Contributing](#contributing)
8. [License](#license)
9. [Team](#team)

## About the Project
WasteNot is a web app designed to help Truman State University students reduce food waste, adopt sustainable habits, and stay informed about campus sustainability efforts. By combining gamification, AI, and real-time tracking, WasteNot empowers users to make a tangible impact on the environment.

## Features
* **Food Waste Tracker**: Analyze plate photos to estimate food waste.
* **Sustainable Shopping Assistant**: Scan receipts to identify eco-friendly alternatives.
* **Gamification**: Earn streaks and badges for sustainable actions.
* **Campus News Hub**: Stay updated on Truman's green initiatives.

## Technologies Used
* **Frontend**: React, TypeScript, Tailwind CSS, Radix UI components
* **Backend**: Express.js, Node.js
* **Database**: PostgreSQL (via Neon Database)
* **ORM**: Drizzle ORM
* **AI Integration**: Google Cloud Vision API
* **Authentication**: Passport.js
* **Form Management**: React Hook Form with Zod validation
* **State Management**: React Query
* **Routing**: Wouter
* **Build Tools**: Vite, ESBuild
* **Development**: TypeScript, Drizzle Kit

## Project Structure
```
├── client/           # Frontend React application
│   └── src/          # Source files for the frontend
├── server/           # Express server files
├── shared/           # Shared code between frontend and backend
│   └── schema.ts     # Database schema definitions
├── migrations/       # Database migration files
├── .git/             # Git repository
├── .gitignore        # Git ignore file
├── drizzle.config.ts # Drizzle ORM configuration
├── postcss.config.js # PostCSS configuration
├── tailwind.config.js # Tailwind CSS configuration
├── tsconfig.json     # TypeScript configuration
├── theme.json        # UI theme configuration
└── vite.config.js    # Vite configuration
```

## Installation
1. Clone the repository:
   ```
   git clone https://github.com/your-username/WasteNot.git
   ```

2. Navigate to the project directory:
   ```
   cd WasteNot
   ```

3. Install the required dependencies:
   ```
   npm install
   ```

4. Set up environment variables:
   Create a `.env` file in the root directory with:
   ```
   DATABASE_URL=your_postgresql_connection_string
   ```

5. Run database migrations:
   ```
   npm run db:push
   ```

## Usage
1. Start the development server:
   ```
   npm run dev
   ```

2. Open your web browser and navigate to:
   ```
   http://localhost:5000
   ```

3. Use the navigation sidebar to access different features:
   * Dashboard: Overview of your sustainability impact
   * Food Waste Tracker: Upload food photos to track waste
   * News: Campus sustainability updates
   * Badges: Achievements for sustainable actions

## Available Scripts
- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run check` - Run TypeScript type checking
- `npm run db:push` - Push database schema changes

## Contributing
We welcome contributions to WasteNot! To contribute:
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

Please make sure to follow our coding standards and include appropriate tests.

## License
This project is licensed under the MIT License - see the LICENSE file for details.

## Team
* [Your Name] - Developer
* [Team Member] - UI/UX Designer
* [Team Member] - Project Manager
* [Team Member] - Content Creator
"# -WasteNot" 
