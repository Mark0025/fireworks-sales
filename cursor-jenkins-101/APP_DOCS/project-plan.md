# Fireworks Sales Application - Project Plan

## Overview
This project is a modern e-commerce application for selling fireworks products. It will be built using Next.js 15+, TypeScript, and follow Test-Driven Development (TDD) practices with a robust CI/CD pipeline using Jenkins.

## Tech Stack
- **Next.js 15.1.7+** - React framework for building full-stack web applications
- **TypeScript** - For type safety and better developer experience
- **TailwindCSS** - For styling with utility classes
- **Shadcn UI** - For accessible, customizable UI components
- **Jest & React Testing Library** - For unit and integration testing
- **Jenkins** - For CI/CD pipeline
- **App Router** - For file-based routing with Server Components
- **src/ directory structure** - For better organization of code

## Project Structure
```
src/
├── app/                  # App Router directory (pages, layouts, etc.)
│   ├── page.tsx          # Homepage
│   ├── layout.tsx        # Root layout
│   ├── products/         # Products routes
│   │   ├── page.tsx      # Products listing page
│   │   ├── [id]/         # Dynamic product route
│   │       └── page.tsx  # Product detail page
│   └── cart/             # Cart route
│       └── page.tsx      # Cart page
├── components/           # Reusable UI components
│   ├── ui/               # Shadcn UI components
│   ├── layout/           # Layout components (Header, Footer, etc.)
│   ├── products/         # Product-related components
│   └── cart/             # Cart-related components
├── lib/                  # Utility functions and shared logic
│   ├── types.ts          # TypeScript interfaces and types
│   ├── utils.ts          # Utility functions
│   └── constants.ts      # Constants used throughout the app
├── hooks/                # Custom React hooks
├── providers/            # Context providers
├── public/               # Static assets
├── styles/               # Global styles
└── tests/                # Test files
    ├── unit/             # Unit tests
    └── integration/      # Integration tests
```

## Getting Started

### Project Setup Commands

```bash
# Create a new Next.js project with TypeScript
npx create-next-app@latest fireworks-sales --typescript --eslint --tailwind --app --src-dir

# Navigate to the project directory
cd fireworks-sales

# Install additional dependencies
npm install @testing-library/react @testing-library/jest-dom jest jest-environment-jsdom

# Install Shadcn UI
npx shadcn-ui@latest init

# Add Shadcn UI components as needed
npx shadcn-ui@latest add button card input form

# Setup Jest
npm install --save-dev jest @testing-library/react @testing-library/jest-dom jest-environment-jsdom

# Create jest.config.js file
```

### Jest Configuration (jest.config.js)
```javascript
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};

module.exports = createJestConfig(customJestConfig);
```

### Jest Setup (jest.setup.js)
```javascript
import '@testing-library/jest-dom';
```

## Development Phases

### Phase 1: Initial Setup & Homepage (Week 1)

#### 1. Project Setup
- Initialize Next.js project with TypeScript
- Configure Jest and Testing Library
- Setup initial Jenkins pipeline
- Create basic project structure
- Setup Shadcn UI components

#### 2. Homepage Development (TDD Approach)
- Write tests for homepage components
- Implement basic layout (Header, Footer)
- Create hero section
- Add product preview section

**Example TDD Workflow:**
1. Write test for Header component
2. Implement Header component to pass the test
3. Refactor as needed
4. Repeat for other components

### Phase 2: Product Catalog (Week 2)

#### 1. Product Types & Interfaces
```typescript
// src/lib/types.ts
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  inStock: boolean;
}
```

#### 2. Product List Component
- Implement product grid layout
- Add filtering by category
- Implement pagination

#### 3. Product Card Component
- Display product image, name, price
- Add to cart button
- Quick view functionality

#### 4. Product Detail Page
- Display comprehensive product information
- Image gallery
- Add to cart with quantity selector

### Phase 3: Shopping Cart (Week 3)

#### 1. Cart Context
```typescript
// src/providers/CartProvider.tsx
'use client';

import { createContext, useContext, useState } from 'react';
import { Product } from '@/lib/types';

interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  
  // Implement cart functions
  
  return (
    <CartContext.Provider value={{ 
      items, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      clearCart,
      totalItems,
      totalPrice
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
```

#### 2. Cart Page
- Display cart items
- Update quantities
- Remove items
- Calculate totals

#### 3. Checkout Process
- Shipping information form
- Payment method selection
- Order summary
- Order confirmation

### Phase 4: User Authentication (Week 4)

#### 1. User Registration & Login
- Registration form with validation
- Login form
- Password reset functionality

#### 2. User Profile
- View and edit profile information
- Order history
- Saved payment methods

## Testing Requirements

### Unit Testing
- All components must have unit tests
- Test component rendering
- Test user interactions
- Test state changes

**Example Component Test:**
```typescript
// src/components/products/ProductCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ProductCard } from './ProductCard';
import { CartProvider } from '@/providers/CartProvider';

const mockProduct = {
  id: '1',
  name: 'Test Product',
  description: 'Test Description',
  price: 19.99,
  imageUrl: '/images/test.jpg',
  category: 'Test Category',
  inStock: true,
};

describe('ProductCard', () => {
  it('renders product information correctly', () => {
    render(
      <CartProvider>
        <ProductCard product={mockProduct} />
      </CartProvider>
    );
    
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('$19.99')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add to cart/i })).toBeInTheDocument();
  });
  
  it('adds product to cart when button is clicked', () => {
    render(
      <CartProvider>
        <ProductCard product={mockProduct} />
      </CartProvider>
    );
    
    const addToCartButton = screen.getByRole('button', { name: /add to cart/i });
    fireEvent.click(addToCartButton);
    
    // Assert cart state changes (would need to mock useCart or check for visual feedback)
  });
});
```

### Integration Testing
- Test component interactions
- Test page navigation
- Test data flow between components

### E2E Testing (Optional)
- Test complete user flows
- Test checkout process
- Test authentication

## CI/CD Pipeline with Jenkins

### Jenkins Pipeline Stages
1. **Checkout**: Pull the latest code from the repository
2. **Install Dependencies**: Install npm packages
3. **Linting**: Run ESLint to check code quality
4. **Unit Tests**: Run Jest tests
5. **Build**: Build the Next.js application
6. **Deploy**: Deploy to staging/production environment

### Jenkinsfile Example
```groovy
pipeline {
    agent {
        docker {
            image 'node:18-alpine'
        }
    }
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        stage('Install') {
            steps {
                sh 'npm ci'
            }
        }
        stage('Lint') {
            steps {
                sh 'npm run lint'
            }
        }
        stage('Test') {
            steps {
                sh 'npm test'
            }
        }
        stage('Build') {
            steps {
                sh 'npm run build'
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

## Best Practices

### Next.js Best Practices
1. **Use Server Components by default**: Only use Client Components when necessary for interactivity
2. **Implement proper data fetching**: Use Server Components for data fetching
3. **Optimize images**: Use Next.js Image component for automatic optimization
4. **Implement proper error handling**: Use error.tsx files for error boundaries
5. **Use loading states**: Implement loading.tsx files for loading states

### React Best Practices
1. **Use functional components**: Prefer functional components with hooks over class components
2. **Keep components small and focused**: Each component should have a single responsibility
3. **Use proper state management**: Use React Context for global state
4. **Implement proper prop typing**: Use TypeScript interfaces for component props
5. **Avoid prop drilling**: Use Context or composition to avoid passing props through multiple levels

### TypeScript Best Practices
1. **Define interfaces for all data structures**: Create clear interfaces for all data types
2. **Use strict type checking**: Enable strict mode in tsconfig.json
3. **Avoid using 'any'**: Be specific with types
4. **Use type inference when possible**: Let TypeScript infer types when it's clear
5. **Create reusable types**: Define common types in a central location

### Testing Best Practices
1. **Follow AAA pattern**: Arrange-Act-Assert
2. **Test behavior, not implementation**: Focus on what the component does, not how it does it
3. **Use meaningful assertions**: Make assertions that validate important behavior
4. **Mock external dependencies**: Use Jest mocks for external services
5. **Maintain test isolation**: Each test should be independent

## PR Review Process
1. Code meets style guidelines
2. Tests are present and passing
3. Jenkins build is green
4. Code review completed by at least one team member
5. No merge conflicts

## File Explanations

### Key Files and Their Purpose

#### src/app/page.tsx
The homepage of the application. This is a Server Component that renders the landing page with product highlights.

#### src/app/layout.tsx
The root layout that wraps all pages. Contains common elements like header, footer, and providers.

#### src/components/ui/*
Shadcn UI components that are used throughout the application.

#### src/components/products/ProductCard.tsx
Displays individual product information in a card format. Used in product listings.

#### src/components/cart/CartItem.tsx
Represents an item in the shopping cart with quantity controls.

#### src/providers/CartProvider.tsx
Manages the shopping cart state using React Context.

#### src/lib/types.ts
Contains TypeScript interfaces and types used throughout the application.

## Learning Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [Shadcn UI Documentation](https://ui.shadcn.com)
- [Jenkins Documentation](https://www.jenkins.io/doc)