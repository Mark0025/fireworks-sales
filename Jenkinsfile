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

        stage('Lint & Type Check') {
            steps {
                // Run ESLint and TypeScript type checking
                sh 'pnpm run lint'
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
                }
            }
        }

        stage('Build') {
            steps {
                // Build the Next.js application
                sh 'pnpm build'
            }
        }

        stage('Deploy') {
            steps {
                script {
                    if (env.BRANCH_NAME == 'develop') {
                        // Deploy to development
                        withEnv(['DATABASE_URL=$DEV_DATABASE_URL']) {
                            sh 'echo "Deploying to development environment"'
                            sh 'pnpm prisma migrate deploy'
                            sh 'pnpm deploy:dev'
                        }
                    } else if (env.BRANCH_NAME == 'staging') {
                        // Deploy to staging
                        withEnv(['DATABASE_URL=$STAGING_DATABASE_URL']) {
                            sh 'echo "Deploying to staging environment"'
                            sh 'pnpm prisma migrate deploy'
                            sh 'pnpm deploy:staging'
                        }
                    } else if (env.BRANCH_NAME == 'main') {
                        // Deploy to production
                        input message: 'Deploy to production?'
                        withEnv(['DATABASE_URL=$PRODUCTION_DATABASE_URL']) {
                            sh 'echo "Deploying to production environment"'
                            sh 'pnpm prisma migrate deploy'
                            sh 'pnpm deploy:prod'
                        }
                    } else {
                        echo "Branch ${env.BRANCH_NAME} does not deploy automatically"
                    }
                }
            }
        }
    }

    post {
        success {
            echo 'Build and deployment successful!'
        }
        failure {
            echo 'Build or deployment failed!'
        }
    }
} 