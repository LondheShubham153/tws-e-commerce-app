# 🛍️ EasyShop - Modern E-commerce Platform

[![Next.js](https://img.shields.io/badge/Next.js-14.1.0-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.1.1-green?style=flat-square&logo=mongodb)](https://www.mongodb.com/)
[![Redux](https://img.shields.io/badge/Redux-2.2.1-purple?style=flat-square&logo=redux)](https://redux.js.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

EasyShop is a modern, full-stack e-commerce platform built with Next.js 14, TypeScript, and MongoDB. It features a beautiful UI with Tailwind CSS, secure authentication, real-time cart updates, and a seamless shopping experience.

## ✨ Features

- 🎨 Modern and responsive UI with dark mode support
- 🔐 Secure JWT-based authentication
- 🛒 Real-time cart management with Redux
- 📱 Mobile-first design approach
- 🔍 Advanced product search and filtering
- 💳 Secure checkout process
- 📦 Multiple product categories
- 👤 User profiles and order history
- 🌙 Dark/Light theme support

## 🏗️ Architecture

EasyShop follows a three-tier architecture pattern:

### 1. Presentation Tier (Frontend)
- Next.js React Components
- Redux for State Management
- Tailwind CSS for Styling
- Client-side Routing
- Responsive UI Components

### 2. Application Tier (Backend)
- Next.js API Routes
- Business Logic
- Authentication & Authorization
- Request Validation
- Error Handling
- Data Processing

### 3. Data Tier (Database)
- MongoDB Database
- Mongoose ODM
- Data Models
- CRUD Operations
- Data Validation

```mermaid
graph LR
  A[GitHub Repo] --> B[Jenkins CI]
  B --> C[Git Update: Manifest]
  C --> D["ArgoCD - GitOps"]
  D --> E[EKS Cluster]
  E --> F[EasyShop App]
  E --> G["Prometheus + Grafana"]

## 🚀 Getting Started

### 🐳 Docker Setup Guide

This guide will help you run **EasyShop** using Docker containers.  
No local Node.js or MongoDB installation required!

---

### ✅ Prerequisites

- 🐳 [Docker](https://docs.docker.com/get-docker/) installed on your machine  
- 💻 Basic understanding of terminal/command line

---

### ⚙️ Step 1: Environment Setup

Create a file named `.env.local` in the root directory with the following content:

```env
# Database Configuration
MONGODB_URI=mongodb://easyshop-mongodb:27017/easyshop

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXTAUTH_SECRET=your-nextauth-secret-key

# JWT Configuration
JWT_SECRET=your-jwt-secret-key
```

#### 🔐 To generate secure secret keys:

```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Generate JWT_SECRET
openssl rand -hex 32
```

---

### 🚦 Step 2: Running the Application

#### 🧩 Option 1: Using Docker Compose (Recommended)

```bash
# Start all services
docker compose up -d

# View logs
docker compose logs -f

# Stop all services
docker compose down
```

---

#### ⚙️ Option 2: Manual Docker Commands

1. **Create a Docker network:**

```bash
docker network create easyshop-network
```

2. **Start MongoDB:**

```bash
docker run -d   --name easyshop-mongodb   --network easyshop-network   -p 27017:27017   -v mongodb_data:/data/db   mongo:latest
```

3. **Build the main application:**

```bash
docker build -t easyshop .
```

4. **Build and run data migration:**

```bash
# Build migration image
docker build -t easyshop-migration -f scripts/Dockerfile.migration .

# Run migration
docker run --rm   --network easyshop-network   --env-file .env.local   easyshop-migration
```

5. **Start the EasyShop app:**

```bash
docker run -d   --name easyshop   --network easyshop-network   -p 3000:3000   --env-file .env.local   easyshop:latest
```

---

### 🌐 Accessing the Application

> Open your browser and visit:  
> [http://localhost:3000](http://localhost:3000)

You should see the **EasyShop** homepage!

---

### 🔍 Useful Docker Commands

```bash
# View running containers
docker ps

# View logs
docker logs easyshop
docker logs easyshop-mongodb

# Stop containers
docker stop easyshop easyshop-mongodb

# Remove containers
docker rm easyshop easyshop-mongodb

# Remove network
docker network rm easyshop-network
```

---

## 🧪 Testing

> ⚠️ _Coming soon: Unit tests and E2E tests using Jest and Cypress_

---

## 🛠️ Troubleshooting

### ⚠️ Dynamic Server Usage Warnings

```bash
Error: Dynamic server usage: Page couldn't be rendered statically
```

**Solution:**  
This is expected for dynamic routes and API endpoints. These warnings won’t affect functionality.

---

### ❌ MongoDB Connection Issues

```bash
Error: MongoDB connection failed
```

**Solutions:**

- Ensure MongoDB is running
- Verify MongoDB URI in `.env.local`
- Test the connection using [MongoDB Compass](https://www.mongodb.com/products/compass)

---

## 💡 Development Tips

- Clear Next.js build cache:  
  `rm -rf .next`
- Run `npm install` after pulling changes
- Use Node.js version **18+**
- Double-check environment variables

---

## 📦 Project Structure

```bash
easyshop/
├── src/
│   ├── app/              # Next.js App Router pages
│   ├── components/       # Reusable React components
│   ├── lib/              # Utilities and config
│   │   ├── auth/         # Authentication logic
│   │   ├── db/           # MongoDB config
│   │   └── features/     # Redux slices
│   ├── types/            # TypeScript types
│   └── styles/           # Global styles + Tailwind CSS
├── public/               # Static assets
└── scripts/              # Database migration scripts
```

---

## 🤝 Contributing

We welcome contributions! Follow these steps:

```bash
# 1. Fork the repository
# 2. Create your branch
git checkout -b feature/amazing-feature

# 3. Make your changes
# 4. Commit your changes
git commit -m "Add amazing feature"

# 5. Push your changes
git push origin feature/amazing-feature

# 6. Open a Pull Request 🎉
```

📌 _Check our **Contributing Guidelines** for more details_

---

## 📝 License

This project is licensed under the **MIT License** – see the [LICENSE](./LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [MongoDB](https://www.mongodb.com/)
- [Redux Toolkit](https://redux-toolkit.js.org/)
- [Radix UI](https://www.radix-ui.com/)

---

## 📫 Contact

For feedback or questions, open an issue or reach out:

**Made with ❤️ by [@sahastra16](https://github.com/sahastra16)**  
🔗 Project: [https://github.com/sahastra16/tws-e-commerce-app](https://github.com/sahastra16/tws-e-commerce-app)  
🔗 LinkedIn: [https://www.linkedin.com/in/sahastra/](https://www.linkedin.com/in/sahastra/)
