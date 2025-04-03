<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

# HR Manager - Sports Bankroll Management

## 📌 About the Project

The **HR Manager** is a sports bankroll management platform built using **NestJS** to provide a robust, scalable, and secure backend. The system includes features for user management, authentication, statistics, sports predictions, and more.

## 🚀 Technologies Used

- **[NestJS](https://nestjs.com/)** - Progressive Node.js framework
- **[Prisma](https://www.prisma.io/)** - ORM for database management
- **[PostgreSQL](https://www.postgresql.org/)** - Relational database
- **[JWT (JSON Web Token)](https://jwt.io/)** - Secure authentication
- **[TypeScript](https://www.typescriptlang.org/)** - Development language
- **[Jest](https://jestjs.io/)** - Testing framework

## 📁 Project Structure

```
📦 hr-manager-pgbs
│── 📜 README.md                # Project documentation
│── 📜 package.json             # Dependencies and scripts
│── 📜 tsconfig.json            # TypeScript configuration
│── 📜 jest-e2e.json            # E2E test configuration
│
├── 📂 prisma                   # Prisma ORM configuration
│   ├── 📂 migrations           # Database migration history
│   ├── prisma.client.ts        # PrismaClient instance
│   ├── prisma.module.ts        # Module for injecting PrismaService
│   ├── prisma.service.ts       # Service handling database connections
│   ├── schema.prisma           # Prisma schema definition
│
├── 📂 src                      # Main application code
│   │
│   ├── 📂 app                  # Application root module
│   │   ├── app.module.ts       # Main module importing other modules
│   │   ├── app.controller.ts   # Main controller
│   │   ├── app.service.ts      # Main service
│   │   ├── main.ts             # NestJS application entry point
│   │
│   ├── 📂 config               # Global configurations
│   │   ├── prisma.config.ts    # Prisma ORM configuration
│   │
│   ├── 📂 common               # Shared resources
│   │   ├── 📂 decorator        # Custom decorators
│   │   ├── 📂 guards           # Route protection guards
│   │   ├── 📂 middlewares      # Global middlewares (e.g., Logger, CORS)
│   │   ├── 📂 enums            # Enum definitions used in the project
│   │   ├── 📂 interfaces       # Shared interfaces across modules
│   │   ├── 📂 strategy         # Authentication/authorization strategies
│   │   │   ├── jwt.strategy.ts # JWT authentication strategy
│   │   │   ├── index.ts        # Centralized export for strategies
│   │   ├── 📂 dto              # Global DTOs (if shared across modules)
│   │
│   ├── 📂 services             # Reusable services
│   │   ├── 📂 mailer           # Email sending service
│   │   │   ├── mail.module.ts
│   │   │   ├── mail.service.ts
│   │   ├── 📂 cache            # (Optional) Cache service (e.g., Redis)
│   │   │   ├── cache.module.ts
│   │   │   ├── cache.service.ts
│   │
│   ├── 📂 modules              # Application modules
│   │   ├── 📂 auth             # Authentication and JWT management
│   │   │   ├── dto/            # DTOs specific to the module
│   │   │   ├── interfaces/     # Interfaces specific to the module
│   │   │   ├── auth.module.ts  # Authentication module
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   ├── 📂 users            # User management
│   │   ├── 📂 bankroll         # Financial management
│   │   ├── 📂 client-data      # Client data management
│   │   ├── 📂 events           # System events
│   │   ├── 📂 predictions      # Predictions and analytics
│   │   ├── 📂 subscriptions    # Subscriptions and payments
│   │   ├── 📂 health           # API health check endpoint
│
├── 📂 test                     # Unit and E2E tests
│   ├── 📂 unit                 # Unit tests for services
│   ├── 📂 integration          # Integration tests for controllers
│   ├── 📂 e2e                  # End-to-End (E2E) tests
│   ├── app.e2e-spec.ts         # Main E2E tests
...


## 🔑 Authentication & Security

The project implements **JWT** authentication and **Guards** for role-based access control:

- `JwtAuthGuard` → Protects authenticated routes
- `RolesGuard` → Restricts access based on user permissions

## 🛠️ Setup & Installation

### **1️⃣ Clone the repository**

```sh
git clone https://github.com/your-username/project-nestjs.git
cd project-nestjs
```

### **2️⃣ Install dependencies**

```sh
yarn install  # or npm install
```

### **3️⃣ Configure environment variables**

Create a `.env` file at the root of the project and add your settings:

```
DATABASE_URL=postgresql://user:password@localhost:5432/hrmanager
JWT_SECRET=your_secret_key
MAIL_HOST=smtp.example.com
MAIL_USER=user@example.com
MAIL_PASS=password
```

### **4️⃣ Run database migrations**

```sh
yarn prisma migrate dev  # or npx prisma migrate dev
```

### **5️⃣ Start the server**

```sh
yarn start:dev  # or npm run start:dev
```

The server will be running at `http://localhost:3000`

## 📌 Automated Testing

To run tests, use:

```sh
yarn test        # Unit tests
yarn test:e2e    # Integration tests
```

## 📫 Contribution

1. **Fork** the repository
2. Create a new **branch**: `git checkout -b feature/new-feature`
3. Make your changes and **commit**: `git commit -m 'Adding new feature'`
4. Push to the remote repository: `git push origin feature/new-feature`
5. Open a **Pull Request**

## 📜 License

This project is licensed under the **MIT License**. Feel free to use and improve it! 🚀

---
Developed with 💙 by [Hudson Tavares](https://github.com/hltav)
