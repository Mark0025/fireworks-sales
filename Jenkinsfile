pipeline {
    agent {
        docker {
            image 'node:18-alpine'
            args '-u root'
        }
    }

    environment {
        // Environment variables
        NEXT_PUBLIC_API_URL = credentials('next-public-api-url')
        // Database URLs for different environments
        DEV_DATABASE_URL = credentials('dev-database-url')
        STAGING_DATABASE_URL = credentials('staging-database-url')
        PRODUCTION_DATABASE_URL = credentials('production-database-url')
    }

    stages {
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

        stage('Lint') {
            steps {
                // Run ESLint
                sh 'pnpm run lint'
            }
        }

        stage('Type Check') {
            steps {
                // Run TypeScript type checking
                sh 'pnpm exec tsc --noEmit'
            }
        }

        stage('Generate Prisma Client') {
            steps {
                // Generate Prisma client based on schema
                sh 'npx prisma generate'
            }
        }

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

        stage('Build') {
            steps {
                // Build the Next.js application
                sh 'pnpm run build'
            }
        }

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
    }

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
} 