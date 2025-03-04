pipeline {
    agent {
        label 'docker-agent-alpine'
    }

    environment {
        // Environment variables
        NEXT_PUBLIC_API_URL = credentials('NEXT_PUBLIC_API_URL')
    }

    stages {
        stage('Setup') {
            agent {
                docker {
                    image 'node:18-alpine'
                    reuseNode true
                }
            }
            steps {
                // Install dependencies
                sh 'npm install -g pnpm'
                sh 'pnpm install'
                
                // Display versions for debugging
                sh 'node --version'
                sh 'pnpm --version'
            }
        }

        stage('Lint & Type Check') {
            agent {
                docker {
                    image 'node:18-alpine'
                    reuseNode true
                }
            }
            steps {
                // Run ESLint and TypeScript type checking
                sh 'pnpm run lint'
                sh 'pnpm run type-check'
            }
        }

        stage('Test') {
            agent {
                docker {
                    image 'node:18-alpine'
                    reuseNode true
                }
            }
            steps {
                // Run tests
                sh 'pnpm test'
            }
        }

        stage('Build') {
            agent {
                docker {
                    image 'node:18-alpine'
                    reuseNode true
                }
            }
            steps {
                // Build the Next.js application
                sh 'pnpm run build'
            }
        }

        stage('Deploy') {
            agent {
                docker {
                    image 'node:18-alpine'
                    reuseNode true
                }
            }
            steps {
                script {
                    def branch = env.BRANCH_NAME ?: sh(script: 'git rev-parse --abbrev-ref HEAD', returnStdout: true).trim()
                    
                    echo "Current branch: ${branch}"
                    
                    if (branch == 'develop') {
                        // Deploy to development
                        sh 'pnpm run deploy:dev'
                    } else if (branch == 'staging') {
                        // Deploy to staging
                        sh 'pnpm run deploy:staging'
                    } else if (branch == 'main') {
                        // Deploy to production
                        input message: 'Deploy to production?'
                        sh 'pnpm run deploy:prod'
                    } else {
                        echo "Branch ${branch} does not deploy automatically"
                    }
                }
            }
        }
    }

    post {
        always {
            cleanWs()
        }
        success {
            echo 'Build and deployment successful!'
        }
        failure {
            echo 'Build or deployment failed!'
            echo 'Sending notification...'
        }
    }
}
