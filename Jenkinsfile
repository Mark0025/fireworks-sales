pipeline {
    agent {
        label 'docker-agent-alpine'
    }

    environment {
        // Environment variables
        NEXT_PUBLIC_API_URL = credentials('NEXT_PUBLIC_API_URL')
        // Database URLs for different environments
        DEV_DATABASE_URL = credentials('DEV_DATABASE_URL')
        STAGING_DATABASE_URL = credentials('STAGING_DATABASE_URL')
        PRODUCTION_DATABASE_URL = credentials('PRODUCTION_DATABASE_URL')
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
                sh 'pnpm type-check'
            }
        }

        stage('Generate Prisma Client') {
            steps {
                // Generate Prisma client based on schema
                sh 'pnpm prisma generate'
            }
        }

        stage('Test') {
            steps {
                // Set test database URL
                withEnv(['DATABASE_URL=$DEV_DATABASE_URL']) {
                    // Run tests (when implemented)
                    echo 'Tests will be implemented later'
                    // sh 'pnpm test'
                }
            }
        }

        stage('Build') {
            steps {
                // Build the Next.js application
                sh 'pnpm build'
            }
        }

        stage('Deploy to Development') {
            when {
                branch 'develop'
            }
            steps {
                // Apply database migrations to development
                withEnv(['DATABASE_URL=$DEV_DATABASE_URL']) {
                    sh 'echo "Deploying to development environment"'
                    sh 'DATABASE_URL=$DEV_DATABASE_URL pnpm prisma migrate deploy'
                    sh 'pnpm deploy:dev'
                }
            }
        }

        stage('Deploy to Staging') {
            when {
                branch 'staging'
            }
            steps {
                // Apply database migrations to staging
                withEnv(['DATABASE_URL=$STAGING_DATABASE_URL']) {
                    sh 'echo "Deploying to staging environment"'
                    sh 'DATABASE_URL=$STAGING_DATABASE_URL pnpm prisma migrate deploy'
                    sh 'pnpm deploy:staging'
                }
            }
        }

        stage('Deploy to Production') {
            when {
                branch 'main'
            }
            steps {
                // Confirm production deployment (manual step)
                input message: 'Deploy to production?'
                
                // Apply database migrations to production
                withEnv(['DATABASE_URL=$PRODUCTION_DATABASE_URL']) {
                    sh 'echo "Deploying to production environment"'
                    sh 'DATABASE_URL=$PRODUCTION_DATABASE_URL pnpm prisma migrate deploy'
                    sh 'pnpm deploy:prod'
                }
            }
        }
    }

    post {
        always {
            echo 'Pipeline execution completed'
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