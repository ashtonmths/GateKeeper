# LockSystem

A powerful project lock management system that provides API endpoints for controlling and checking project lock status. Perfect for managing deployment gates, feature flags, or any system that needs centralized lock control.

![LockSystem Dashboard](./screenshots/dashboard.png)
*Dashboard showing project lock statuses*

![Create Project](./screenshots/create-project.png)
*Create new projects with lock control*

![Lock Toggle](./screenshots/lock-toggle.png)
*Easy lock/unlock toggle interface*

## Features

- 🔐 **Lock Management** - Create and manage multiple projects with lock/unlock capabilities
- 🌐 **Public API** - RESTful API endpoints for external projects to check lock status
- 🔒 **Secure Authentication** - User authentication with NextAuth.js (only owners can modify projects)
- ⚡ **Real-time Updates** - Instant UI updates when toggling lock status
- 📊 **Modern Dashboard** - Clean purple-themed interface to view and manage all your projects
- 🎨 **Beautiful UI** - Solid color design with smooth animations and hover effects
- 🛡️ **Authorization** - Only project owners can change lock status
- 📋 **API Integration** - Easy-to-copy API endpoints for each project

## Tech Stack

- [Next.js 15](https://nextjs.org) - React framework
- [NextAuth.js 5](https://next-auth.js.org) - Authentication
- [Prisma](https://prisma.io) - Database ORM with PostgreSQL
- [tRPC](https://trpc.io) - End-to-end typesafe API
- [Tailwind CSS](https://tailwindcss.com) - Utility-first CSS framework
- [PostgreSQL](https://postgresql.org) - Relational database
- [TypeScript](https://www.typescriptlang.org/) - Type safety

## Quick Start

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm/yarn/pnpm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Subtilizer28/LockSystem.git
cd LockSystem
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:

Create a `.env` file in the root directory:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/locksystem"
NEXTAUTH_SECRET="your-secret-key-here"  # Generate with: openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"
```

4. Set up the database:
```bash
npm run db:push
```

This will create all necessary tables in your PostgreSQL database.

5. Start the development server:
```bash
npm run dev
```

Visit `http://localhost:3000` and create an account to get started!

## API Documentation

### Public API Endpoint

The LockSystem provides a public API endpoint that external projects can use to check lock status.

#### Check Lock Status (GET)

**Endpoint:** `GET /api/lock-status?projectId={id}`

**Description:** Check if a project is locked or unlocked.

**Parameters:**
- `projectId` (query parameter, required): The ID of the project to check

**Example Request:**
```bash
curl "http://localhost:3000/api/lock-status?projectId=1"
```

**Success Response (200):**
```json
{
  "projectId": 1,
  "name": "My Project",
  "locked": true,
  "status": "locked"
}
```

**Error Responses:**

Missing projectId (400):
```json
{
  "error": "projectId is required"
}
```

Invalid projectId (400):
```json
{
  "error": "projectId must be a valid number"
}
```

Project not found (404):
```json
{
  "error": "Project not found"
}
```

#### Check Lock Status (POST)

**Endpoint:** `POST /api/lock-status`

**Description:** Check if a project is locked or unlocked using POST method.

**Request Body:**
```json
{
  "projectId": 1
}
```

**Example Request:**
```bash
curl -X POST http://localhost:3000/api/lock-status \
  -H "Content-Type: application/json" \
  -d '{"projectId": 1}'
```

**Response:** Same as GET method

## Usage Examples

### JavaScript/Node.js

```javascript
// Using fetch API
async function checkLockStatus(projectId) {
  const response = await fetch(
    `http://localhost:3000/api/lock-status?projectId=${projectId}`
  );
  const data = await response.json();
  
  if (data.locked) {
    console.log(`Project ${data.name} is LOCKED`);
    // Stop deployment or return error
    return false;
  } else {
    console.log(`Project ${data.name} is UNLOCKED`);
    // Proceed with deployment
    return true;
  }
}

// Use in your deployment script
const canDeploy = await checkLockStatus(1);
if (!canDeploy) {
  process.exit(1);
}
```

### Python

```python
import requests

def check_lock_status(project_id):
    response = requests.get(
        f"http://localhost:3000/api/lock-status?projectId={project_id}"
    )
    data = response.json()
    
    if response.status_code == 200:
        if data['locked']:
            print(f"Project {data['name']} is LOCKED")
            return False
        else:
            print(f"Project {data['name']} is UNLOCKED")
            return True
    else:
        print(f"Error: {data.get('error', 'Unknown error')}")
        return False

# Use in your deployment script
if not check_lock_status(1):
    exit(1)
```

### Bash/Shell Script

```bash
#!/bin/bash

PROJECT_ID=1
API_URL="http://localhost:3000/api/lock-status?projectId=${PROJECT_ID}"

response=$(curl -s "$API_URL")
locked=$(echo "$response" | jq -r '.locked')

if [ "$locked" = "true" ]; then
    echo "❌ Project is LOCKED. Deployment blocked."
    exit 1
else
    echo "✅ Project is UNLOCKED. Proceeding with deployment."
    # Continue with deployment
fi
```

### GitHub Actions

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  check-lock:
    runs-on: ubuntu-latest
    steps:
      - name: Check Lock Status
        id: lock-check
        run: |
          response=$(curl -s "https://your-domain.com/api/lock-status?projectId=1")
          locked=$(echo "$response" | jq -r '.locked')
          if [ "$locked" = "true" ]; then
            echo "Project is locked. Stopping deployment."
            exit 1
          fi
      
      - name: Deploy
        if: success()
        run: |
          echo "Deploying application..."
          # Your deployment commands here
```

## Database Schema

```prisma
model Project {
  id          Int      @id @default(autoincrement())
  name        String
  description String?
  ownerId     String
  owner       User     @relation(fields: [ownerId], references: [id])
  locked      Boolean  @default(true)  // Projects locked by default
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  emailVerified DateTime?
  password      String?
  image         String?
  accounts      Account[]
  projects      Project[]
  sessions      Session[]
}
```

**Security Note:** Only the project owner (user who created the project) can lock/unlock their projects. The system enforces ownership verification on all mutation operations.

## Development

### Available Scripts

- `npm run dev` - Start development server with Turbo
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run typecheck` - Run TypeScript type checking
- `npm run db:push` - Push schema changes to database
- `npm run db:studio` - Open Prisma Studio
- `npm run format:write` - Format code with Prettier
- `npm run format:check` - Check code formatting

## Project Structure

```
locksystem/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/          # Authentication routes
│   │   │   ├── lock-status/   # Public lock check API
│   │   │   └── trpc/          # tRPC routes
│   │   ├── auth/
│   │   │   ├── login/         # Login page
│   │   │   └── signup/        # Signup page
│   │   ├── create/            # Create project page
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Dashboard
│   ├── server/
│   │   ├── api/
│   │   │   ├── routers/
│   │   │   │   └── project.ts # Project router
│   │   │   ├── root.ts        # Root router
│   │   │   └── trpc.ts        # tRPC config
│   │   ├── auth/              # Auth configuration
│   │   └── db.ts              # Database client
│   └── trpc/                  # tRPC client setup
└── public/                    # Static files
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add environment variables
4. Deploy

### Docker

```bash
docker build -t locksystem .
docker run -p 3000:3000 locksystem
```

## Environment Variables

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Yes | `postgresql://user:password@localhost:5432/locksystem` |
| `NEXTAUTH_SECRET` | Secret for NextAuth.js (generate with `openssl rand -base64 32`) | Yes | `your-secret-key-here` |
| `NEXTAUTH_URL` | Your application URL | Yes | `http://localhost:3000` |

## Security Features

- ✅ **Password Hashing** - User passwords encrypted with bcrypt
- ✅ **Session Management** - Secure session handling with NextAuth.js
- ✅ **Owner Authorization** - Only project owners can modify lock status
- ✅ **Protected Routes** - Authentication required for all project operations
- ✅ **Type Safety** - Full TypeScript implementation with tRPC
- ✅ **Input Validation** - Zod schemas validate all inputs

## How It Works

1. **User Registration** - Users create accounts with email and password
2. **Create Projects** - Authenticated users can create projects (locked by default)
3. **Manage Locks** - Only the project owner can toggle lock/unlock status
4. **Public API** - External services check lock status via public API endpoint
5. **Access Control** - Dashboard shows only user's own projects

## Use Cases

- **Deployment Gates**: Prevent deployments when a project is locked
- **Feature Flags**: Control feature availability across environments
- **Maintenance Mode**: Lock projects during maintenance windows
- **Release Control**: Coordinate releases across multiple services
- **CI/CD Integration**: Integrate with your CI/CD pipeline to block automated deployments
- **Emergency Stop**: Quickly lock all projects to prevent changes during incidents

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Support

For issues and questions, please open an issue on GitHub.

## Author

**Subtilizer28**
- GitHub: [@Subtilizer28](https://github.com/Subtilizer28)

---

Built with ❤️ using the [T3 Stack](https://create.t3.gg/)
