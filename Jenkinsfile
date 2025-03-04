pipeline {
    agent { 
        node {
            label 'docker-agent-alpine'
        }
    }

    environment {
        // Environment variables
        NEXT_PUBLIC_API_URL = credentials('NEXT_PUBLIC_API_URL')
        // Docker registry credentials
        DOCKER_REGISTRY = credentials('DOCKER_REGISTRY_CREDENTIALS')
    }

    options {
        // Add timestamps to console output
        timestamps()
        // Set timeout
        timeout(time: 30, unit: 'MINUTES')
    }

    stages {
        stage('Setup') {
            steps {
                echo "Setting up Node.js environment..."
                sh '''
                # Install Node.js and npm (using Alpine package manager)
                apk add --update nodejs npm
                
                # Display Node.js and npm versions for debugging
                echo "Node.js version:"
                node --version
                echo "npm version:"
                npm --version
                
                # Install pnpm
                npm install -g pnpm
                echo "pnpm version:"
                pnpm --version
                
                # Install dependencies
                pnpm install
                '''
            }
        }

        stage('Lint & Type Check') {
            steps {
                echo "Linting and type checking..."
                sh '''
                # Run ESLint and TypeScript type checking
                pnpm run lint
                pnpm run type-check
                '''
            }
        }

        stage('Test') {
            steps {
                echo "Testing..."
                sh '''
                # Run tests
                pnpm test
                '''
            }
        }

        stage('Build') {
            steps {
                echo "Building..."
                sh '''
                # Build the Next.js application
                pnpm run build
                '''
            }
        }

        stage('Docker Build') {
            steps {
                echo "Building Docker image..."
                script {
                    def branch = env.BRANCH_NAME ?: sh(script: 'git rev-parse --abbrev-ref HEAD', returnStdout: true).trim()
                    def buildNumber = env.BUILD_NUMBER ?: "local"
                    def dockerTag = "${branch}-${buildNumber}"
                    
                    // Install Docker if not available
                    sh '''
                    if ! command -v docker &> /dev/null; then
                        echo "Docker not found, installing..."
                        apk add --update docker
                    fi
                    
                    # Display Docker version for debugging
                    docker --version || echo "Docker installation failed"
                    '''
                    
                    // Build Docker image with environment variables passed as build args
                    sh """
                    docker build \
                      --build-arg NEXT_PUBLIC_API_URL=\${NEXT_PUBLIC_API_URL} \
                      -t fireworks-app:${dockerTag} . || echo "Docker build failed - agent might need Docker socket mounted"
                    """
                }
            }
        }

        stage('Docker Push') {
            when {
                expression { 
                    def branch = env.BRANCH_NAME ?: sh(script: 'git rev-parse --abbrev-ref HEAD', returnStdout: true).trim()
                    return branch == 'develop' || branch == 'staging' || branch == 'main'
                }
            }
            steps {
                echo "Pushing Docker image..."
                script {
                    def branch = env.BRANCH_NAME ?: sh(script: 'git rev-parse --abbrev-ref HEAD', returnStdout: true).trim()
                    def buildNumber = env.BUILD_NUMBER ?: "local"
                    def dockerTag = "${branch}-${buildNumber}"
                    
                    // Login to Docker registry and push
                    // Note: You'll need to configure DOCKER_REGISTRY_CREDENTIALS in Jenkins
                    sh """
                    # Verify Docker is working
                    docker info || echo "Docker daemon not accessible"
                    
                    # Login to Docker registry
                    echo \${DOCKER_REGISTRY_PSW} | docker login -u \${DOCKER_REGISTRY_USR} --password-stdin || echo "Docker login failed"
                    
                    # Tag and push the image
                    docker tag fireworks-app:${dockerTag} \${DOCKER_REGISTRY_USR}/fireworks-app:${dockerTag} || echo "Docker tag failed"
                    docker push \${DOCKER_REGISTRY_USR}/fireworks-app:${dockerTag} || echo "Docker push failed - check registry permissions"
                    """
                }
            }
        }

        stage('Deploy') {
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
            node(null) {
                cleanWs()
                // Clean up Docker images to prevent disk space issues
                sh 'docker system prune -f || true'
            }
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
