# Jenkins CI/CD Pipeline Workflow

This document provides a visual representation of our Jenkins CI/CD pipeline workflow for the Fireworks Sales application, along with an analysis of potential issues in the current setup.

## Pipeline Workflow Diagram

```mermaid
flowchart TD
    subgraph "GitHub Repository"
        A[Developer Push] --> B[GitHub Repository]
        B --> |main branch| C1[Trigger Jenkins Pipeline]
        B --> |develop branch| C2[Trigger Jenkins Pipeline]
        B --> |staging branch| C3[Trigger Jenkins Pipeline]
    end

    subgraph "Jenkins Pipeline"
        C1 --> D[Checkout Code]
        C2 --> D
        C3 --> D
        D --> E[Setup: Install pnpm]
        E --> F[Lint: ESLint]
        F --> G[Type Check: TypeScript]
        G --> H[Generate Prisma Client]
        H --> I[Test: Jest]
        I --> J[Build: Next.js]
        
        J --> |main branch| K1[Deploy to Production]
        J --> |develop branch| K2[Deploy to Development]
        J --> |staging branch| K3[Deploy to Staging]
        
        K1 --> L[Post-Build Actions]
        K2 --> L
        K3 --> L
    end

    subgraph "Deployment Environments"
        K1 --> M1[Production Environment]
        K2 --> M2[Development Environment]
        K3 --> M3[Staging Environment]
    end
```

## Current Setup Analysis

Based on the investigation of your Jenkins setup, here's an analysis of the current state and potential issues:

### Working Components

1. **Jenkins Container**: The `jenkins-blueocean` container is running properly on port 8080.
2. **Job Configuration**: The `fireworks-sales` job is configured to monitor your GitHub repository.
3. **Branch Configuration**: The job is set up to watch the `main`, `develop`, and `staging` branches.
4. **Pipeline Definition**: The job is looking for a Jenkinsfile in the root of your repository.
5. **Credentials Structure**: The necessary credential placeholders are defined in credentials.groovy.

### Potential Issues

```mermaid
flowchart LR
    A[Jenkins Setup] --> B{Issues}
    B --> C[Authentication]
    B --> D[Missing Builds]
    B --> E[Credential Values]
    B --> F[GitHub Webhook]
    B --> G[Docker Agent]
    
    C --> C1[Authentication required for API access]
    D --> D1[No builds directory found]
    E --> E1[Placeholder credential values]
    F --> F1[No webhook configuration]
    G --> G1[Docker agent connectivity issues]
    
    C1 --> H[Solutions]
    D1 --> H
    E1 --> H
    F1 --> H
    G1 --> H
    
    H --> I[Access Jenkins UI]
    H --> J[Update credentials]
    H --> K[Configure webhook]
    H --> L[Check Docker network]
    H --> M[Reload configuration]
```

## Troubleshooting Steps

1. **Authentication Issues**:
   - Access the Jenkins web interface at http://localhost:8080/
   - Log in with your "mark" user credentials
   - If you've forgotten your password, you may need to reset it

2. **Missing Builds**:
   - The builds directory was not found, indicating no builds have run yet
   - Manually trigger a build from the Jenkins UI
   - Check console output for errors

3. **Credential Values**:
   - Replace placeholder values in credentials with actual values:
     - next-public-api-url
     - dev-database-url
     - staging-database-url
     - production-database-url

4. **GitHub Webhook Configuration**:
   - Set up a webhook in your GitHub repository
   - Point it to http://your-jenkins-url/github-webhook/
   - Select the "Push" event

5. **Docker Agent Connectivity**:
   - Check if the Docker agent can connect to your repository
   - Verify network settings between Jenkins and Docker
   - Check if the Docker agent has the necessary permissions

## Next Steps

1. Access the Jenkins web interface
2. Verify the job configuration
3. Update credentials with actual values
4. Manually trigger a build
5. Monitor the build process
6. Set up GitHub webhooks for automatic builds
7. Configure notifications for build results

By following these steps, you should be able to resolve the issues with your Jenkins pipeline and get it working properly. 