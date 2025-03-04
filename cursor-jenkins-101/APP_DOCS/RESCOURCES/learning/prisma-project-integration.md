# Integrating Prisma ORM into the Fireworks Sales Project Plan

This document outlines how to update our project plan to incorporate Prisma ORM for database management in our Fireworks Sales application.

## Updated Project Structure

Add the following to our project structure:

```
src/
├── ...existing structure...
├── prisma/                # Prisma configuration and migrations
│   ├── schema.prisma      # Database schema definition
│   └── migrations/        # Database migrations
├── lib/
│   ├── prisma.ts          # Prisma client singleton
│   ├── products.ts        # Product data access functions
│   ├── users.ts           # User data access functions
│   └── orders.ts          # Order data access functions
└── ...
```

## Updated Tech Stack

Add Prisma to our tech stack:

- **Next.js 15.1.7+** - React framework for building full-stack web applications
- **TypeScript** - For type safety and better developer experience
- **Prisma ORM** - For type-safe database access and migrations
- **PostgreSQL** - Primary database (or SQLite for development)
- **TailwindCSS** - For styling with utility classes
- **Shadcn UI** - For accessible, customizable UI components
- **Jest & React Testing Library** - For unit and integration testing
- **Jenkins** - For CI/CD pipeline
- **App Router** - For file-based routing with Server Components
- **src/ directory structure** - For better organization of code

## Updated Getting Started Commands

```bash
# Create a new Next.js project with TypeScript
pnpm dlx create-next-app@latest fireworks-sales --typescript --eslint --tailwind --app --src-dir

# Navigate to the project directory
cd fireworks-sales

# Install Prisma
pnpm add -D prisma
pnpm add @prisma/client

# Initialize Prisma
npx prisma init

# Install additional dependencies
pnpm add @testing-library/react @testing-library/jest-dom jest jest-environment-jsdom

# Install Shadcn UI
pnpm dlx shadcn-ui@latest init

# Add Shadcn UI components as needed
pnpm dlx shadcn-ui@latest add button card input form
```

## Updated Development Phases

### Phase 1: Initial Setup & Database Schema (Week 1)

#### 1. Project Setup
- Initialize Next.js project with TypeScript
- Configure Jest and Testing Library
- Setup initial Jenkins pipeline
- Create basic project structure
- Setup Shadcn UI components

#### 2. Database Schema Design
- Define Prisma schema for products, users, and orders
- Create initial migration
- Setup database connection
- Create Prisma client singleton

```prisma
// Example schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql" // or "sqlite" for development
  url      = env("DATABASE_URL")
}

model Product {
  id          String   @id @default(cuid())
  name        String
  description String?
  price       Float
  imageUrl    String?
  category    String
  inStock     Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  orders    Order[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Order {
  id        String      @id @default(cuid())
  user      User        @relation(fields: [userId], references: [id])
  userId    String
  items     OrderItem[]
  total     Float
  status    String      @default("pending")
  createdAt DateTime    @default(now())
  updatedAt DateTime    @updatedAt
}

model OrderItem {
  id        String @id @default(cuid())
  order     Order  @relation(fields: [orderId], references: [id])
  orderId   String
  productId String
  quantity  Int
  price     Float
}
```

#### 3. Data Access Layer
- Create data access functions for products, users, and orders
- Implement error handling and connection management
- Write tests for data access functions

```typescript
// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
```

#### 4. Homepage Development (TDD Approach)
- Write tests for homepage components
- Implement basic layout (Header, Footer)
- Create hero section
- Add product preview section with data from Prisma

### Phase 2: Product Catalog (Week 2)

#### 1. Product Management
- Implement product listing page with Prisma queries
- Create product detail page with dynamic routes
- Add filtering and pagination with Prisma
- Implement product search functionality

```typescript
// src/app/products/page.tsx
import { getProducts } from '@/lib/products';
import ProductCard from '@/components/products/ProductCard';

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { category?: string; page?: string };
}) {
  const page = Number(searchParams.page) || 1;
  const pageSize = 12;
  
  const products = await getProducts({
    category: searchParams.category,
    inStock: true,
    skip: (page - 1) * pageSize,
    take: pageSize,
  });

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Our Products</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
```

#### 2. Admin Product Management (Optional)
- Create admin interface for product management
- Implement CRUD operations with Prisma
- Add image upload functionality

### Phase 3: User Authentication & Profiles (Week 3)

#### 1. User Authentication
- Implement user registration and login
- Create authentication middleware
- Setup session management
- Integrate with Prisma User model

#### 2. User Profiles
- Create user profile page
- Implement profile editing
- Add address management
- Display order history from Prisma

```typescript
// src/app/profile/page.tsx
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { getUserWithOrders } from '@/lib/users';
import ProfileForm from '@/components/profile/ProfileForm';
import OrderHistory from '@/components/profile/OrderHistory';

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/login');
  }
  
  const user = await getUserWithOrders(session.user.id);
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Your Profile</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <ProfileForm user={user} />
        <OrderHistory orders={user.orders} />
      </div>
    </div>
  );
}
```

### Phase 4: Shopping Cart & Checkout (Week 4)

#### 1. Shopping Cart
- Implement cart context and state management
- Create cart page with item management
- Add persistence with local storage or database

#### 2. Checkout Process
- Create multi-step checkout flow
- Implement address and payment collection
- Create order in database using Prisma transactions
- Send order confirmation

```typescript
// Example of creating an order with Prisma transaction
async function createOrder(userId: string, items: CartItem[], address: Address, payment: PaymentInfo) {
  return prisma.$transaction(async (tx) => {
    // Calculate total
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Create the order
    const order = await tx.order.create({
      data: {
        userId,
        total,
        status: 'pending',
        // Add address and payment info
      },
    });
    
    // Create order items
    for (const item of items) {
      await tx.orderItem.create({
        data: {
          orderId: order.id,
          productId: item.id,
          quantity: item.quantity,
          price: item.price,
        },
      });
    }
    
    return order;
  });
}
```

### Phase 5: Admin Dashboard (Week 5, Optional)

#### 1. Order Management
- Create order listing page
- Implement order detail view
- Add order status management
- Generate reports with Prisma aggregations

#### 2. User Management
- Create user listing page
- Implement user detail view
- Add user role management

## Updated CI/CD Pipeline

Update the Jenkins pipeline to include Prisma-specific steps:

```groovy
pipeline {
    agent {
        docker {
            image 'node:18-alpine'
            args '-u root'
        }
    }
    stages {
        stage('Setup') {
            steps {
                sh 'npm install -g pnpm'
                sh 'pnpm install'
            }
        }
        stage('Generate Prisma Client') {
            steps {
                sh 'npx prisma generate'
            }
        }
        stage('Lint') {
            steps {
                sh 'pnpm run lint'
            }
        }
        stage('Test') {
            steps {
                sh 'pnpm test'
            }
        }
        stage('Build') {
            steps {
                sh 'pnpm run build'
            }
        }
        stage('Database Migrations - Staging') {
            when {
                branch 'develop'
            }
            steps {
                // Apply migrations to staging database
                sh 'DATABASE_URL=$STAGING_DATABASE_URL npx prisma migrate deploy'
            }
        }
        stage('Deploy to Staging') {
            when {
                branch 'develop'
            }
            steps {
                // Deploy to staging environment
                echo 'Deploying to staging...'
            }
        }
        stage('Database Migrations - Production') {
            when {
                branch 'main'
            }
            steps {
                // Apply migrations to production database
                sh 'DATABASE_URL=$PRODUCTION_DATABASE_URL npx prisma migrate deploy'
            }
        }
        stage('Deploy to Production') {
            when {
                branch 'main'
            }
            steps {
                // Deploy to production environment
                echo 'Deploying to production...'
            }
        }
    }
    post {
        always {
            // Clean up workspace
            cleanWs()
        }
    }
}
```

## Testing Strategy Updates

### Unit Testing
- Test data access functions with a test database
- Use Prisma's transaction API for test isolation
- Mock Prisma client for component tests

```typescript
// Example test for a data access function
import { prismaMock } from '../singleton';
import { getProductById } from '@/lib/products';

jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: prismaMock,
}));

describe('Product data access', () => {
  it('should get a product by id', async () => {
    const mockProduct = {
      id: '1',
      name: 'Test Product',
      description: 'Test Description',
      price: 19.99,
      imageUrl: '/test.jpg',
      category: 'Test',
      inStock: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    prismaMock.product.findUnique.mockResolvedValue(mockProduct);
    
    const product = await getProductById('1');
    expect(product).toEqual(mockProduct);
  });
});
```

### Integration Testing
- Use a test database for integration tests
- Reset the database between test runs
- Test complete workflows involving database operations

## Environment Setup

Create different environment configurations:

```
# .env.development
DATABASE_URL="postgresql://dev:dev@localhost:5432/fireworks_dev"
# or for simpler setup:
# DATABASE_URL="file:./dev.db"

# .env.test
DATABASE_URL="postgresql://test:test@localhost:5432/fireworks_test"
# or for testing:
# DATABASE_URL="file:./test.db"

# .env.production
DATABASE_URL="postgresql://user:password@production-host:5432/fireworks_prod"
```

## Conclusion

By integrating Prisma ORM into our Fireworks Sales application, we gain:

1. **Type-safe database access**: Prisma generates TypeScript types based on our schema
2. **Simplified data modeling**: Declarative schema definition with clear relations
3. **Migration management**: Versioned database schema changes
4. **Efficient queries**: Optimized database access with relations
5. **Developer experience**: Intuitive API and excellent tooling

This updated project plan provides a solid foundation for building a robust e-commerce application with proper database management and type safety throughout the stack. 