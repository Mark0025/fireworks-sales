# Using Prisma ORM with Next.js

## What is Prisma?

Prisma is a next-generation Object-Relational Mapping (ORM) tool that simplifies database access in Node.js and TypeScript applications. It consists of three main components:

1. **Prisma Client**: An auto-generated, type-safe query builder for Node.js & TypeScript
2. **Prisma Migrate**: A declarative data modeling and migration system
3. **Prisma Studio**: A GUI to view and edit data in your database

Prisma works with various databases including PostgreSQL, MySQL, SQLite, SQL Server, MongoDB, and CockroachDB.

## Why Use Prisma with Next.js?

Prisma and Next.js make an excellent combination for several reasons:

1. **Type Safety**: Prisma generates TypeScript types based on your database schema, providing end-to-end type safety
2. **Server Components**: Prisma works seamlessly with Next.js Server Components for data fetching
3. **Performance**: Prisma's efficient query building helps optimize database access
4. **Developer Experience**: Both tools focus on developer experience and productivity
5. **Data Validation**: Prisma helps validate data before it reaches your database

## Setting Up Prisma in a Next.js Project

### Installation

Using pnpm with our Next.js project:

```bash
# Install Prisma CLI and client as dev dependencies
pnpm add -D prisma
pnpm add @prisma/client
```

### Initialization

Initialize Prisma in your project:

```bash
npx prisma init
```

This creates:
- A `prisma` directory with a `schema.prisma` file
- A `.env` file for your database connection string

### Configure Database Connection

Edit the `.env` file to set your database connection string:

```
# .env
DATABASE_URL="postgresql://username:password@localhost:5432/mydb?schema=public"
```

For development with SQLite (simpler setup):
```
DATABASE_URL="file:./dev.db"
```

### Define Your Data Model

Edit the `prisma/schema.prisma` file to define your data model:

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql" // or "mysql", "sqlite", etc.
  url      = env("DATABASE_URL")
}

// Define your models
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

### Generate Prisma Client

After defining your schema, generate the Prisma Client:

```bash
npx prisma generate
```

### Create Database Migrations

Create and apply migrations to set up your database:

```bash
# Create a migration
npx prisma migrate dev --name init

# Apply migrations to production (when ready)
npx prisma migrate deploy
```

## Setting Up Prisma Client in Next.js

### Create a Prisma Client Instance

Create a file to instantiate and export the Prisma Client:

```typescript
// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
```

This pattern ensures that during development with hot reloading, we don't create multiple instances of PrismaClient.

## Using Prisma with Next.js Server Components

### Fetching Data in Server Components

```typescript
// src/app/products/page.tsx
import prisma from '@/lib/prisma';
import ProductCard from '@/components/products/ProductCard';

export default async function ProductsPage() {
  // Fetch products directly in the Server Component
  const products = await prisma.product.findMany({
    where: {
      inStock: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

### Fetching a Single Item

```typescript
// src/app/products/[id]/page.tsx
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';

export default async function ProductPage({ params }: { params: { id: string } }) {
  const product = await prisma.product.findUnique({
    where: {
      id: params.id,
    },
  });

  if (!product) {
    notFound();
  }

  return (
    <div>
      <h1>{product.name}</h1>
      <p>{product.description}</p>
      <p>${product.price.toFixed(2)}</p>
      {/* More product details */}
    </div>
  );
}
```

## Creating API Routes with Prisma

For client-side mutations or third-party API access, create API routes:

```typescript
// src/app/api/products/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const products = await prisma.product.findMany();
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const product = await prisma.product.create({
      data: {
        name: body.name,
        description: body.description,
        price: body.price,
        imageUrl: body.imageUrl,
        category: body.category,
        inStock: body.inStock ?? true,
      },
    });
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
```

## Creating a Data Access Layer

For larger applications, it's a good practice to create a data access layer:

```typescript
// src/lib/products.ts
import prisma from '@/lib/prisma';
import { Product } from '@prisma/client';

export async function getProducts(options?: {
  inStock?: boolean;
  category?: string;
  limit?: number;
}): Promise<Product[]> {
  return prisma.product.findMany({
    where: {
      ...(options?.inStock !== undefined && { inStock: options.inStock }),
      ...(options?.category && { category: options.category }),
    },
    take: options?.limit,
    orderBy: {
      createdAt: 'desc',
    },
  });
}

export async function getProductById(id: string): Promise<Product | null> {
  return prisma.product.findUnique({
    where: { id },
  });
}

export async function createProduct(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
  return prisma.product.create({
    data,
  });
}

export async function updateProduct(id: string, data: Partial<Product>): Promise<Product> {
  return prisma.product.update({
    where: { id },
    data,
  });
}

export async function deleteProduct(id: string): Promise<Product> {
  return prisma.product.delete({
    where: { id },
  });
}
```

Then use these functions in your components:

```typescript
// src/app/products/page.tsx
import { getProducts } from '@/lib/products';
import ProductCard from '@/components/products/ProductCard';

export default async function ProductsPage() {
  const products = await getProducts({ inStock: true });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

## Advanced Prisma Features

### Relations

Prisma makes it easy to work with related data:

```typescript
// Fetch orders with related user and items
const ordersWithRelations = await prisma.order.findMany({
  include: {
    user: true,
    items: true,
  },
});
```

### Transactions

Use transactions for operations that need to be atomic:

```typescript
// Create an order with multiple items in a transaction
const newOrder = await prisma.$transaction(async (tx) => {
  // Create the order
  const order = await tx.order.create({
    data: {
      userId: userId,
      total: calculateTotal(items),
      status: 'pending',
    },
  });

  // Create order items
  for (const item of items) {
    await tx.orderItem.create({
      data: {
        orderId: order.id,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
      },
    });
  }

  return order;
});
```

### Middleware

Prisma middleware allows you to hook into the query lifecycle:

```typescript
// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Log all queries in development
if (process.env.NODE_ENV === 'development') {
  prisma.$use(async (params, next) => {
    const before = Date.now();
    const result = await next(params);
    const after = Date.now();
    console.log(`Query ${params.model}.${params.action} took ${after - before}ms`);
    return result;
  });
}

export default prisma;
```

## Testing with Prisma

### Setting Up a Test Environment

1. Create a separate test database
2. Use environment variables to switch between databases

```
# .env.test
DATABASE_URL="postgresql://test:test@localhost:5432/test_db"
```

### Using Prisma in Tests

```typescript
// tests/product.test.ts
import { prisma } from '@/lib/prisma';
import { createProduct, getProductById } from '@/lib/products';

beforeAll(async () => {
  // Set up test database
  await prisma.$connect();
});

afterAll(async () => {
  // Clean up
  await prisma.product.deleteMany();
  await prisma.$disconnect();
});

describe('Product operations', () => {
  it('should create a product', async () => {
    const product = await createProduct({
      name: 'Test Product',
      description: 'Test Description',
      price: 19.99,
      category: 'Test',
      imageUrl: '/test.jpg',
      inStock: true,
    });

    expect(product).toHaveProperty('id');
    expect(product.name).toBe('Test Product');
  });

  it('should retrieve a product by id', async () => {
    // Create a product first
    const created = await createProduct({
      name: 'Another Product',
      description: 'Another Description',
      price: 29.99,
      category: 'Test',
      imageUrl: '/another.jpg',
      inStock: true,
    });

    // Retrieve it
    const retrieved = await getProductById(created.id);
    
    expect(retrieved).not.toBeNull();
    expect(retrieved?.name).toBe('Another Product');
  });
});
```

## Best Practices for Prisma with Next.js

### 1. Use a Single Prisma Instance

As shown earlier, use a singleton pattern to avoid multiple Prisma Client instances.

### 2. Organize Your Schema

- Group related models together
- Use meaningful names for models and fields
- Add comments to explain complex relationships

### 3. Use Migrations Properly

- Create migrations for all schema changes
- Review migrations before applying them
- Use `prisma migrate dev` in development
- Use `prisma migrate deploy` in production

### 4. Leverage TypeScript Integration

- Use the generated types from Prisma
- Create custom types that extend Prisma types when needed

```typescript
import { Product } from '@prisma/client';

// Extend the Product type
type ProductWithInventory = Product & {
  inventoryStatus: 'in-stock' | 'low-stock' | 'out-of-stock';
};
```

### 5. Handle Errors Properly

```typescript
try {
  const product = await prisma.product.findUnique({
    where: { id },
  });
  return product;
} catch (error) {
  console.error('Database error:', error);
  throw new Error('Failed to fetch product');
}
```

### 6. Use Connection Pooling in Production

For serverless environments, consider using connection pooling:

```typescript
// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    // Enable connection pooling for serverless environments
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    // Log queries in development
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

### 7. Use Prisma Studio for Development

Prisma Studio provides a GUI to view and edit your data:

```bash
npx prisma studio
```

## Integrating Prisma with CI/CD

Update your Jenkins pipeline to handle Prisma migrations:

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
        stage('Test') {
            steps {
                sh 'pnpm test'
            }
        }
        stage('Build') {
            steps {
                sh 'pnpm build'
            }
        }
        stage('Database Migrations') {
            when {
                branch 'main'
            }
            steps {
                // Apply migrations to production database
                sh 'npx prisma migrate deploy'
            }
        }
        // Deployment stages...
    }
}
```

## Troubleshooting Common Prisma Issues

### Issue: Prisma Client Not Generated

**Symptom**: Error about missing Prisma Client

**Solution**: Run `npx prisma generate`

### Issue: Migration Conflicts

**Symptom**: Conflicts when running migrations

**Solution**: 
- In development: Reset the database with `npx prisma migrate reset`
- In production: Carefully review migrations and resolve conflicts manually

### Issue: Connection Issues

**Symptom**: Cannot connect to database

**Solution**:
- Check your DATABASE_URL
- Ensure database server is running
- Check network access and firewall settings

### Issue: Type Errors

**Symptom**: TypeScript errors with Prisma types

**Solution**:
- Regenerate Prisma Client after schema changes
- Make sure your TypeScript version is compatible

## Conclusion

Prisma provides a powerful, type-safe way to interact with your database in Next.js applications. By following the patterns and practices outlined in this guide, you can build robust, maintainable applications with efficient database access.

The combination of Next.js Server Components and Prisma creates a seamless data fetching experience, allowing you to focus on building features rather than dealing with database complexities.

Remember to:
- Keep your schema clean and well-organized
- Use migrations for all schema changes
- Leverage TypeScript integration for type safety
- Create a data access layer for complex applications
- Handle errors properly
- Use connection pooling in production

With these practices in place, you'll have a solid foundation for your Next.js and Prisma application. 