
# 🛍️ EasyShop – Full Stack E-commerce App

A modern full-stack e-commerce application built with **Next.js**, **TypeScript**, **MongoDB**, **Tailwind CSS**, and deployed with **Docker**, **Jenkins**, and **Argo CD** on **AWS EKS**.

---

## ⚙️ DevOps Architecture (Production)

```mermaid graph LR A[GitHub Repo] --> B[Jenkins CI] B --> C[Git Update: Manifest] C --> D[ArgoCD - GitOps] D --> E[EKS Cluster] E --> F[EasyShop App] E --> G[Prometheus & Grafana] ```

---

## 🚀 Getting Started

### 🐳 Docker Setup Guide

This guide will help you run EasyShop using Docker containers. No local Node.js or MongoDB installation required!

---

### ✅ Prerequisites

- Install [Docker](https://docs.docker.com/get-docker/) on your machine
- Basic understanding of terminal/command line

---

### 🔧 Step 1: Environment Setup

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

To generate secure keys:

```bash
# For NEXTAUTH_SECRET
openssl rand -base64 32

# For JWT_SECRET
openssl rand -hex 32
```

---

### ▶️ Step 2: Running the Application

#### 🔹 Option 1: Using Docker Compose (Recommended)

```bash
# Start all services
docker compose up -d

# View logs
docker compose logs -f

# Stop all services
docker compose down
```

---

#### 🔹 Option 2: Manual Docker Commands

1. Create a Docker network:

```bash
docker network create easyshop-network
```

2. Start MongoDB:

```bash
docker run -d \
  --name easyshop-mongodb \
  --network easyshop-network \
  -p 27017:27017 \
  -v mongodb_data:/data/db \
  mongo:latest
```

3. Build the main app:

```bash
docker build -t easyshop .
```

4. Build & run migration:

```bash
docker build -t easyshop-migration -f scripts/Dockerfile.migration .

docker run --rm \
  --network easyshop-network \
  --env-file .env.local \
  easyshop-migration
```

5. Run the app:

```bash
docker run -d \
  --name easyshop \
  --network easyshop-network \
  -p 3000:3000 \
  --env-file .env.local \
  easyshop:latest
```

---

### 🌐 Accessing the App

Visit: [http://localhost:3000](http://localhost:3000)

You should see the EasyShop homepage!

---

### 🧰 Useful Docker Commands

```bash
# View running containers
docker ps

# Logs
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

> 📌 Coming soon: Unit & E2E tests using Jest and Cypress

---

## 🔧 Troubleshooting

### ❗ Build Errors

**Error**: `Dynamic server usage: Page couldn't be rendered statically`  
**Solution**: Safe to ignore. These warnings appear during build due to dynamic routes.

### ❗ MongoDB Connection Failed

**Solution**:

- Ensure MongoDB is running
- Verify connection string in `.env.local`
- Try connecting via MongoDB Compass

---

## 💡 Development Tips

- Clear `.next` folder: `rm -rf .next`
- Run `npm install` after pulling updates
- Use Node.js version **18+**
- Check environment variables

---

## 📦 Project Structure

```
easyshop/
├── src/
│   ├── app/              # Next.js App Router pages
│   ├── components/       # Reusable React components
│   ├── lib/              # Utilities and configs
│   │   ├── auth/         # Auth logic
│   │   ├── db/           # DB config
│   │   └── features/     # Redux slices
│   ├── types/            # TypeScript types
│   └── styles/           # Tailwind + global styles
├── public/               # Static assets
└── scripts/              # Database migration scripts
```

---

## 🤝 Contributing

We welcome contributions! To contribute:

```bash
# Fork & clone repo
git checkout -b feature/your-feature
# Make changes
git commit -m "Add your feature"
git push origin feature/your-feature
# Open a PR
```

> 💡 Check our `CONTRIBUTING.md` for guidelines.

---

## 📝 License

This project is licensed under the **MIT License** – see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [MongoDB](https://www.mongodb.com/)
- [Redux Toolkit](https://redux-toolkit.js.org/)
- [Radix UI](https://www.radix-ui.com/)

---

## 📫 Contact

For questions or feedback, please reach out:

- Made with ❤️ by [@sahastra16](https://github.com/sahastra16)
- Project Repo: [EasyShop GitHub](https://github.com/sahastra16/tws-e-commerce-app)
- LinkedIn: [Sahastra's Profile](https://www.linkedin.com/in/sahastra/)
