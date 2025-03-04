# Jenkins Pipeline Troubleshooting Guide

This document provides a visual representation of the troubleshooting process for the Jenkins CI/CD pipeline issues in the Fireworks Sales application.

## Current Pipeline Status

Based on our investigation, the Jenkins pipeline for the Fireworks Sales application is configured but not executing builds. This guide will help identify and resolve the issues.

## Issue Identification Flowchart

```mermaid
flowchart TD
    A[Jenkins Pipeline Not Working] --> B{Root Cause Analysis}
    
    B --> C[Configuration Issues]
    B --> D[Authentication Issues]
    B --> E[Network/Connectivity Issues]
    B --> F[Resource Issues]
    
    C --> C1[Job Configuration]
    C --> C2[Jenkinsfile Issues]
    C --> C3[Credential Configuration]
    
    D --> D1[Login Required]
    D --> D2[API Access Denied]
    D --> D3[GitHub Authentication]
    
    E --> E1[Docker Network]
    E --> E2[GitHub Connectivity]
    E --> E3[Agent Communication]
    
    F --> F1[Container Resources]
    F --> F2[Build Space]
    F --> F3[Plugin Compatibility]
    
    C1 --> G[Solutions]
    C2 --> G
    C3 --> G
    D1 --> G
    D2 --> G
    D3 --> G
    E1 --> G
    E2 --> G
    E3 --> G
    F1 --> G
    F2 --> G
    F3 --> G
    
    G --> H[Access Jenkins UI]
    G --> I[Verify Jenkinsfile]
    G --> J[Update Credentials]
    G --> K[Check Network]
    G --> L[Restart Container]
    G --> M[Manual Build Trigger]
```

## Observed Symptoms

From our command-line investigation, we've observed the following symptoms:

```mermaid
gantt
    title Jenkins Pipeline Issue Timeline
    dateFormat  YYYY-MM-DD
    section Configuration
    Job Created           :done, 2025-03-03, 1d
    Credentials Added     :done, 2025-03-03, 1d
    section Issues
    No Builds Directory   :crit, 2025-03-04, 1d
    Authentication Required :crit, 2025-03-04, 1d
    API Access Denied     :crit, 2025-03-04, 1d
    section Troubleshooting
    Manual Directory Creation :active, 2025-03-04, 1d
    Manual Build Simulation :active, 2025-03-04, 1d
```

## Detailed Diagnosis

### 1. Configuration Check

```mermaid
flowchart LR
    A[Configuration Check] --> B{Issues Found}
    B -->|Yes| C[Job Configuration]
    B -->|Yes| D[Jenkinsfile Path]
    B -->|Yes| E[Branch Specification]
    B -->|Yes| F[Credential Values]
    
    C --> G[Solution: Verify fireworks-pipeline.xml]
    D --> H[Solution: Confirm Jenkinsfile in repo root]
    E --> I[Solution: Verify branch patterns]
    F --> J[Solution: Update credential values]
```

### 2. Authentication Check

```mermaid
flowchart LR
    A[Authentication Check] --> B{Issues Found}
    B -->|Yes| C[Jenkins UI Access]
    B -->|Yes| D[API Access]
    B -->|Yes| E[GitHub Access]
    
    C --> F[Solution: Login with mark user]
    D --> G[Solution: Get API token]
    E --> H[Solution: Configure GitHub credentials]
```

### 3. Build Process Check

```mermaid
flowchart LR
    A[Build Process] --> B{Issues Found}
    B -->|Yes| C[No Builds Directory]
    B -->|Yes| D[No Build History]
    B -->|Yes| E[No Console Output]
    
    C --> F[Solution: Trigger manual build]
    D --> G[Solution: Check job configuration]
    E --> H[Solution: Check Jenkins logs]
```

## Step-by-Step Resolution

1. **Access Jenkins UI**:
   - Navigate to http://localhost:8080/
   - Login with your "mark" user credentials

2. **Verify Job Configuration**:
   - Check that the job is pointing to the correct GitHub repository
   - Verify that the Jenkinsfile path is correct (should be in the root)
   - Confirm branch specifications are correct (main, develop, staging)

3. **Update Credentials**:
   - Navigate to Manage Jenkins > Manage Credentials
   - Update the placeholder values with actual values:
     - next-public-api-url
     - dev-database-url
     - staging-database-url
     - production-database-url

4. **Trigger Manual Build**:
   - Navigate to the fireworks-sales job
   - Click "Build Now" to manually trigger a build
   - Monitor the console output for errors

5. **Configure GitHub Webhook**:
   - In your GitHub repository, go to Settings > Webhooks
   - Add a new webhook pointing to http://your-jenkins-url/github-webhook/
   - Select the "Push" event

6. **Check Docker Network**:
   - Verify that the Jenkins container can communicate with the Docker agent
   - Check that the Docker agent can access GitHub

7. **Restart Jenkins**:
   - If all else fails, try restarting the Jenkins container:
   ```bash
   docker restart jenkins-blueocean
   ```

By following these steps systematically, you should be able to identify and resolve the issues with your Jenkins pipeline. 