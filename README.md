# Career Board

Welcome to the **Career Board** project! This is an Angular application designed to help users manage career-related content.

## Prerequisites

Before running the project, make sure you have the following installed:

- [Docker](https://www.docker.com/get-started) (for running with Docker)
- [Node.js](https://nodejs.org/en/) (for running locally without Docker)

## Running Locally (without Docker)

1. Clone the repository:
   ```bash
   git clone https://github.com/career-board/career-board.git
   cd career-board
   ```

2. Install the dependencies:
   ```bash
   npm install
   ```

3. Run the application:
   ```bash
   npm start
   ```

4. Access the app at [http://localhost:4200](http://localhost:4200).

## Running with Docker

If you'd like to run the application using Docker, follow these steps:

1. Clone the repository:
   ```bash
   git clone https://github.com/career-board/career-board.git
   cd career-board
   ```

2. Build the Docker image:
   ```bash
   docker build -t career-board .
   ```

3. Run the application in a Docker container:
   ```bash
   docker run -p 4200:80 --name career-board-container career-board
   ```

4. Access the app at [http://localhost:4200](http://localhost:4200).

## Re-running the Application with Docker (after changes)

If you make changes to the project and want to rerun the application with Docker, follow these steps:

1. Stop and remove the existing container:
   ```bash
   docker stop career-board-container
   docker rm career-board-container
   ```

2. Remove the existing Docker image:
   ```bash
   docker rmi career-board
   ```

3. Rebuild the Docker image:
   ```bash
   docker build -t career-board .
   ```

4. Rerun the application:
   ```bash
   docker run -p 4200:80 --name career-board-container career-board
   ```

5. Access the app at [http://localhost:4200](http://localhost:4200).

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.


## Project structure

The project follows a standard Angular application structure:

- `/src` - Main application source code
  - `/app` - Core application components and modules
  - `/environments` - Environment-specific configuration files
  - `main.ts` - Application entry point
  - `styles.scss` - Global styles
  - `index.html` - Main HTML template

- `/public` - Static assets and resources
- `/node_modules` - Project dependencies
- Configuration Files:
  - `package.json` - Project metadata and dependencies
  - `tsconfig.json` - TypeScript configuration
  - `angular.json` - Angular workspace configuration
  - `.editorconfig` - Editor settings
  - `Dockerfile` - Container configuration

```

src/
├── app/
│   ├── core/                // Global services and single-instance modules
│   │   ├── guards/          // Route guards (e.g., AuthGuard, RoleGuard)
│   │   ├── interceptors/    // HTTP interceptors (e.g., JWT, Error Handling)
│   │   ├── services/        // Global services (e.g., AuthService, APIService)
│   │   ├── models/          // Interfaces and types used globally
|   |   |── Layouts          // Layout components for different user roles
│   │   └── core.module.ts   // CoreModule definition
│   ├── shared/              // Reusable components, directives, and pipes
│   │   ├── components/      // Shared UI components (e.g., modals, buttons)
│   │   ├── directives/      // Custom reusable directives
│   │   ├── pipes/           // Reusable pipes (e.g., date formatting)
│   │   └── shared.module.ts // SharedModule definition
│   ├── features/            // Feature-specific modules and components
│   │   ├── auth/            // Authentication module
│   │   ├── posts/           // Post management module
│   │   ├── users/           // User management module
│   │   └── admin/           // Admin-specific module
│   ├── layouts/             // Layout components for different user roles
│   │   ├── admin-layout/    // Admin layout (e.g., sidebar, header)
│   │   └── user-layout/     // User layout
│   ├── app-routing.module.ts  // Main routing configuration
│   └── app.module.ts        // Root application module 
├── assets/                  // Static assets (images, icons, etc.)
├── environments/            // Environment-specific configurations
└── styles/                  // Global styles and CSS variables
```

### Zoom view of the `features/posts` module
```

src/app/features/
└── posts/
    ├── components/
    │   ├── post-list/
    │   ├── post-detail/
    │   ├── post-create/
    │   └── post-edit/
    ├── services/
    │   └── post.service.ts
    ├── models/
    │   └── post.model.ts      // Model definition for Post
    ├── posts-routing.module.ts
    └── posts.module.ts
```
