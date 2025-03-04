# Jenkins Pipeline for Next.js and Prisma

This document explains the Jenkins pipeline configuration for the Fireworks Sales application, which uses Next.js, TypeScript, and Prisma ORM.

## Overview

The Jenkinsfile defines a complete CI/CD pipeline that:

1. Builds and tests the application
2. Runs type checking and linting
3. Generates the Prisma client
4. Deploys to different environments based on branch
5. Applies database migrations safely

## Pipeline Structure

### Agent Configuration

```groovy
agent {
    docker {
        image 'node:18-alpine'
        args '-u root'
    }
}
```

This section specifies that the pipeline will run in a Docker container using the `node:18-alpine` image. The `-u root` argument ensures that the container runs with root privileges, which can be necessary for certain operations.

### Environment Variables

```groovy
environment {
    // Environment variables
    NEXT_PUBLIC_API_URL = credentials('next-public-api-url')
    // Database URLs for different environments
    DEV_DATABASE_URL = credentials('dev-database-url')
    STAGING_DATABASE_URL = credentials('staging-database-url')
    PRODUCTION_DATABASE_URL = credentials('production-database-url')
}
```

This section defines environment variables that will be used throughout the pipeline:
- `NEXT_PUBLIC_API_URL`: Public API URL for the frontend
- `DEV_DATABASE_URL`: Database connection string for development
- `STAGING_DATABASE_URL`: Database connection string for staging
- `PRODUCTION_DATABASE_URL`: Database connection string for production

These are defined as Jenkins credentials for security, rather than hardcoding them in the Jenkinsfile.

## Pipeline Stages

### 1. Setup

```groovy
stage('Setup') {
    steps {
        // Install pnpm globally
        sh 'npm install -g pnpm'
        
        // Install dependencies using pnpm
        sh 'pnpm install'
        
        // Display versions for debugging
        sh 'node --version'
        sh 'pnpm --version'
    }
}
```

This stage:
- Installs pnpm globally (our package manager of choice)
- Installs project dependencies using pnpm
- Outputs Node.js and pnpm versions for debugging purposes

### 2. Lint

```groovy
stage('Lint') {
    steps {
        // Run ESLint
        sh 'pnpm run lint'
    }
}
```

This stage runs ESLint to check code quality and style. It will fail the build if there are linting errors.

### 3. Type Check

```groovy
stage('Type Check') {
    steps {
        // Run TypeScript type checking
        sh 'pnpm exec tsc --noEmit'
    }
}
```

This stage runs TypeScript's type checker without emitting output files. It ensures type safety throughout the codebase.

### 4. Generate Prisma Client

```groovy
stage('Generate Prisma Client') {
    steps {
        // Generate Prisma client based on schema
        sh 'npx prisma generate'
    }
}
```

This stage generates the Prisma client based on the schema defined in `prisma/schema.prisma`. This is necessary before running tests or building the application.

### 5. Test

```groovy
stage('Test') {
    steps {
        // Set test database URL
        withEnv(['DATABASE_URL=$DEV_DATABASE_URL']) {
            // Run tests (when implemented)
            sh 'echo "Tests would run here - to be implemented"'
            // sh 'pnpm test'
        }
    }
}
```

This stage runs tests with the development database URL. Currently, it's a placeholder as tests haven't been implemented yet.

### 6. Build

```groovy
stage('Build') {
    steps {
        // Build the Next.js application
        sh 'pnpm run build'
    }
}
```

This stage builds the Next.js application, creating an optimized production build.

### 7. Deploy to Development

```groovy
stage('Deploy to Development') {
    when {
        branch 'develop'
    }
    steps {
        // Apply database migrations to development
        withEnv(['DATABASE_URL=$DEV_DATABASE_URL']) {
            sh 'npx prisma migrate deploy'
        }
        
        // Deploy to development environment
        sh 'echo "Deploying to development environment"'
        // Add your deployment commands here
    }
}
```

This stage:
- Only runs when the branch is 'develop'
- Applies Prisma migrations to the development database
- Deploys the application to the development environment (placeholder)

### 8. Deploy to Staging

```groovy
stage('Deploy to Staging') {
    when {
        branch 'staging'
    }
    steps {
        // Apply database migrations to staging
        withEnv(['DATABASE_URL=$STAGING_DATABASE_URL']) {
            sh 'npx prisma migrate deploy'
        }
        
        // Deploy to staging environment
        sh 'echo "Deploying to staging environment"'
        // Add your deployment commands here
    }
}
```

This stage:
- Only runs when the branch is 'staging'
- Applies Prisma migrations to the staging database
- Deploys the application to the staging environment (placeholder)

### 9. Deploy to Production

```groovy
stage('Deploy to Production') {
    when {
        branch 'main'
    }
    steps {
        // Confirm production deployment (manual step)
        input message: 'Deploy to production?', ok: 'Deploy'
        
        // Apply database migrations to production
        withEnv(['DATABASE_URL=$PRODUCTION_DATABASE_URL']) {
            sh 'npx prisma migrate deploy'
        }
        
        // Deploy to production environment
        sh 'echo "Deploying to production environment"'
        // Add your deployment commands here
    }
}
```

This stage:
- Only runs when the branch is 'main'
- Requires manual confirmation before proceeding (for safety)
- Applies Prisma migrations to the production database
- Deploys the application to the production environment (placeholder)

## Post-Build Actions

```groovy
post {
    always {
        // Clean up workspace
        cleanWs()
    }
    
    success {
        // Notify on success
        echo 'Build and deployment successful!'
    }
    
    failure {
        // Notify on failure
        echo 'Build or deployment failed!'
    }
}
```

These actions run after all stages:
- `always`: Cleans up the workspace regardless of build result
- `success`: Runs when the build succeeds (currently just logs a message)
- `failure`: Runs when the build fails (currently just logs a message)

## Setting Up Jenkins Credentials

Before using this pipeline, you need to set up the following credentials in Jenkins:

1. **next-public-api-url**: The public API URL for the frontend
2. **dev-database-url**: Database connection string for development
3. **staging-database-url**: Database connection string for staging
4. **production-database-url**: Database connection string for production

To add these credentials in Jenkins:

1. Navigate to Jenkins > Manage Jenkins > Credentials > System > Global credentials
2. Click "Add Credentials"
3. Select "Secret text" as the kind
4. Enter the ID (e.g., "dev-database-url")
5. Enter the secret value (e.g., "postgresql://user:password@localhost:5432/fireworks_dev")
6. Click "OK"

## Customizing Deployment Steps

The deployment steps in this pipeline are placeholders. You'll need to replace them with actual deployment commands for your infrastructure. For example:

```groovy
// For AWS Elastic Beanstalk
sh 'eb deploy fireworks-dev'

// For Vercel
sh 'vercel --prod'

// For Docker-based deployment
sh 'docker build -t fireworks-app .'
sh 'docker push your-registry/fireworks-app:latest'
```

## Adding Notifications

You can enhance the post-build actions to send notifications:

```groovy
post {
    success {
        // Send success notification
        slackSend channel: '#deployments', color: 'good', message: "Deployment successful: ${env.JOB_NAME} #${env.BUILD_NUMBER}"
    }
    
    failure {
        // Send failure notification
        slackSend channel: '#deployments', color: 'danger', message: "Deployment failed: ${env.JOB_NAME} #${env.BUILD_NUMBER}"
        emailext subject: "Build Failed: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                 body: "Check console output at ${env.BUILD_URL}",
                 to: 'team@example.com'
    }
}
```

## Best Practices

1. **Separate Concerns**: Keep database migrations separate from application deployment
2. **Manual Approval**: Always require manual approval for production deployments
3. **Environment Variables**: Store sensitive information in Jenkins credentials
4. **Fail Fast**: Run linting and type checking early in the pipeline
5. **Clean Workspace**: Always clean up the workspace after builds
6. **Notifications**: Set up notifications for build success/failure
7. **Version Tagging**: Consider adding version tagging for production deployments 