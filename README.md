🚀 Getting Started
Docker Setup Guide
This guide will help you run EasyShop using Docker containers. No local Node.js or MongoDB installation required!

Prerequisites
Install Docker on your machine

Basic understanding of terminal/command line

Step 1: Environment Setup
Create a file named .env.local in the root directory with the following content:
# Database Configuration
MONGODB_URI=mongodb://easyshop-mongodb:27017/easyshop

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000  # Replace with your EC2 instance's public IP or put localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000/api  # Replace with your EC2 instance's public IP or put localhost:3000/api
NEXTAUTH_SECRET=your-nextauth-secret-key  # Generate this using the command below

# JWT Configuration
JWT_SECRET=your-jwt-secret-key  # Generate this using the command below

To generate secure secret keys, use these commands in your terminal:
For NEXTAUTH_SECRET:
openssl rand -base64 32

For JWT_SECRET:
openssl rand -hex 32

Step 2: Running the Application
You have two options to run the application:

Option 1: Using Docker Compose (Recommended)
This is the easiest way to run the application. All services will be started in the correct order with proper dependencies.
# Start all services
docker compose up -d

# View logs
docker compose logs -f

# Stop all services
docker compose down

Option 2: Manual Docker Commands
If you prefer more control, you can run each service manually:

1. Create a Docker network:
docker network create easyshop-network

2. Start MongoDB:
docker run -d \
  --name easyshop-mongodb \
  --network easyshop-network \
  -p 27017:27017 \
  -v mongodb_data:/data/db \
  mongo:latest

3. Build the main application:
docker build -t easyshop .

4. Build and run data migration:
Build migration image:
docker build -t easyshop-migration -f scripts/Dockerfile.migration .

Run migration:
docker run --rm \
  --network easyshop-network \
  --env-file .env.local \
  easyshop-migration

5. Start the EasyShop application:
docker run -d \
  --name easyshop \
  --network easyshop-network \
  -p 3000:3000 \
  --env-file .env.local \
  easyshop:latest

Accessing the Application
Open your web browser and visit http://localhost:3000. You should see the EasyShop homepage!

Useful Docker Commands
# View running containers
docker ps

# View container logs
docker logs easyshop
docker logs easyshop-mongodb

# Stop containers
docker stop easyshop easyshop-mongodb

# Remove containers
docker rm easyshop easyshop-mongodb

# Remove network
docker network rm easyshop-network

🧪 Testing
[!NOTE] Coming soon: Unit tests and E2E tests with Jest and Cypress

🔧 Troubleshooting
Build Errors
Dynamic Server Usage Warnings

Error: Dynamic server usage: Page couldn't be rendered statically

Solution: This is expected behavior for dynamic routes and API endpoints. These warnings appear during build but won't affect the application's functionality.

MongoDB Connection Issues
Error: MongoDB connection failed

Solution:

Ensure MongoDB is running locally.

Check if your MongoDB connection string is correct in .env.local.

Try connecting to MongoDB using MongoDB Compass with the same connection string.

Development Tips
Clear .next folder if you encounter strange build issues: rm -rf .next

Run npm install after pulling new changes

Make sure all environment variables are properly set

Use Node.js version 18 or higher

📦 Project Structure
easyshop/
├── src/
│   ├── app/              # Next.js App Router pages
│   ├── components/       # Reusable React components
│   ├── lib/             # Utilities and configurations
│   │   ├── auth/        # Authentication logic
│   │   ├── db/          # Database configuration
│   │   └── features/    # Redux slices
│   ├── types/           # TypeScript type definitions
│   └── styles/          # Global styles and Tailwind config
├── public/              # Static assets
└── scripts/            # Database migration scripts

🤝 Contributing
We welcome contributions! Please follow these steps:

Fork the repository

Create a new branch: git checkout -b feature/amazing-feature

Make your changes

Run tests: npm test (coming soon)

Commit your changes: git commit -m 'Add amazing feature'

Push to the branch: git push origin feature/amazing-feature

Open a Pull Request

[!TIP] Check our Contributing Guidelines for more details.

📝 License
This project is licensed under the MIT License - see the LICENSE file for details.

🙏 Acknowledgments
Next.js
Tailwind CSS
MongoDB
Redux Toolkit
Radix UI

📫 Contact
For questions or feedback, please open an issue or contact the maintainers:

Made with ❤️ by @sahastra16

Project Link: https://github.com/sahastra16/tws-e-commerce-app

LinkedIn Link : https://www.linkedin.com/in/sahastra/ 
