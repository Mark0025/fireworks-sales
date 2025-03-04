pipeline {
    agent { 
        node {
            label 'docker-agent-alpine' // Assumes this has Node.js, pnpm, and Docker pre-installed
            customWorkspace '/home/jenkins/workspace' // Optional: Ensure writable workspace
        }
    }

    environment {
        NEXT_PUBLIC_API_URL = credentials('NEXT_PUBLIC_API_URL')
        DOCKER_REGISTRY = credentials('DOCKER_REGISTRY_CREDENTIALS')
        BRANCH = "${env.BRANCH_NAME ?: sh(script: 'git rev-parse --abbrev-ref HEAD', returnStdout: true).trim()}"
        BUILD_TAG = "${BRANCH}-${env.BUILD_NUMBER ?: 'local'}"
    }

    options {
        timestamps()
        timeout(time: 30, unit: 'MINUTES')
    }

    stages {
        stage('Prepare') {
            steps {
                echo "Preparing environment..."
                sh '''
                # Verify tools are available
                node --version
                pnpm --version
                docker --version
                # Install dependencies (matches Dockerfile)
                pnpm install --frozen-lockfile
                '''
            }
        }

        stage('Lint & Type Check') {
            steps {
                echo "Linting and type checking..."
                sh 'pnpm run lint && pnpm run type-check'
            }
        }

        stage('Test') {
            steps {
                echo "Running tests..."
                sh 'pnpm test'
            }
        }

        stage('Docker Build') {
            steps {
                echo "Building Docker image..."
                sh """
                docker build \
                  --build-arg NEXT_PUBLIC_API_URL=\${NEXT_PUBLIC_API_URL} \
                  -t fireworks-app:${BUILD_TAG} .
                """
            }
        }

        stage('Docker Push') {
            when {
                anyOf {
                    expression { return env.BRANCH == 'develop' }
                    expression { return env.BRANCH == 'staging' }
                    expression { return env.BRANCH == 'main' }
                }
            }
            steps {
                echo "Pushing Docker image..."
                sh """
                echo \${DOCKER_REGISTRY_PSW} | docker login -u \${DOCKER_REGISTRY_USR} --password-stdin
                docker tag fireworks-app:${BUILD_TAG} \${DOCKER_REGISTRY_USR}/fireworks-app:${BUILD_TAG}
                docker push \${DOCKER_REGISTRY_USR}/fireworks-app:${BUILD_TAG}
                """
            }
        }

        stage('Deploy') {
            steps {
                script {
                    echo "Current branch: ${env.BRANCH}"
                    if (env.BRANCH == 'develop') {
                        sh 'pnpm run deploy:dev'
                    } else if (env.BRANCH == 'staging') {
                        sh 'pnpm run deploy:staging'
                    } else if (env.BRANCH == 'main') {
                        input message: 'Deploy to production?'
                        sh 'pnpm run deploy:prod'
                    } else {
                        echo "Branch ${env.BRANCH} does not deploy automatically"
                    }
                }
            }
        }
    }

    post {
        always {
            cleanWs()
            sh 'docker system prune -f || true'
        }
        success {
            echo 'Build and deployment successful!'
        }
        failure {
            echo 'Build or deployment failed!'
            error 'Pipeline failed - check logs for details'
        }
    }
}