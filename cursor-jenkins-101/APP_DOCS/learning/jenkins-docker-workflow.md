# Jenkins CI/CD with Docker Workflow

This document provides a visual representation of how Jenkins interacts with Docker in our CI/CD pipeline for the Fireworks Sales application.

## Architecture Overview

```mermaid
flowchart TD
    subgraph "Host Machine"
        A[Developer] --> B[Git Repository]
        Z[Docker Engine]
    end
    
    subgraph "Docker Containers"
        C[jenkins-blueocean Container]
        D[Docker Agent Container]
        E[socat Container]
    end
    
    B --> C
    C --> D
    C --> E
    D --> Z
    E --> Z
    
    subgraph "Jenkins Pipeline"
        F[Checkout Code] --> G[Setup]
        G --> H[Lint]
        H --> I[Type Check]
        I --> J[Generate Prisma Client]
        J --> K[Test]
        K --> L[Build]
        L --> M[Deploy]
    end
    
    C --> F
    D --> F
```

## Container Interaction Diagram

```mermaid
sequenceDiagram
    participant Dev as Developer
    participant Git as GitHub
    participant JM as Jenkins Master (jenkins-blueocean)
    participant JA as Jenkins Agent (Docker)
    participant DE as Docker Engine
    
    Dev->>Git: Push Code
    Git->>JM: Webhook Notification
    JM->>DE: Request Agent Container
    DE->>JA: Create Agent Container
    JM->>JA: Execute Pipeline
    JA->>Git: Checkout Code
    JA->>JA: Run Build Steps
    JA->>JM: Report Results
    JM->>Dev: Notify Build Status
```

## Docker Network Configuration

```mermaid
flowchart LR
    subgraph "Docker Network"
        A[jenkins-blueocean] <--> B[Docker Socket]
        A <--> C[socat Container]
        C <--> D[Docker Engine API]
        D <--> E[Docker Agent Container]
    end
    
    subgraph "External"
        F[GitHub]
        G[Developer Machine]
    end
    
    A <--> F
    G <--> A
    G <--> F
```

## Current Setup Analysis

Based on our investigation, here's how your current Docker setup is configured:

```mermaid
flowchart TD
    A[Host Machine] --> B[Docker Engine]
    
    B --> C[jenkins-blueocean Container]
    B --> D[socat Container]
    B --> E[openwebui Container]
    B --> F[watchtower Container]
    
    C --> G[Jenkins Master]
    G --> H[fireworks-sales Job]
    
    H --> I[Jenkinsfile]
    I --> J[Pipeline Stages]
    
    D --> K[Docker Socket Proxy]
    K --> L[Docker API]
    L --> M[Dynamic Agent Containers]
```

## Troubleshooting Docker Issues

If your Jenkins pipeline is not working properly with Docker, consider the following issues:

```mermaid
flowchart TD
    A[Docker Issues] --> B{Problem Areas}
    
    B --> C[Container Networking]
    B --> D[Docker Socket Access]
    B --> E[Agent Configuration]
    B --> F[Resource Constraints]
    
    C --> C1[Solution: Check network settings]
    D --> D1[Solution: Verify socket permissions]
    E --> E1[Solution: Check agent template]
    F --> F1[Solution: Monitor resource usage]
    
    C1 --> G[docker network inspect]
    D1 --> H[docker exec permissions check]
    E1 --> I[Jenkins agent configuration]
    F1 --> J[docker stats]
```

## Docker Agent Workflow

The following diagram shows how Jenkins uses Docker agents to execute pipeline stages:

```mermaid
sequenceDiagram
    participant JM as Jenkins Master
    participant DE as Docker Engine
    participant DA as Docker Agent
    participant GH as GitHub
    
    JM->>DE: Request agent with node:18-alpine image
    DE->>DA: Create container
    JM->>DA: Connect to agent
    JM->>DA: Execute pipeline
    DA->>GH: Clone repository
    DA->>DA: Install pnpm
    DA->>DA: Run lint
    DA->>DA: Run type check
    DA->>DA: Generate Prisma client
    DA->>DA: Run tests
    DA->>DA: Build application
    DA->>DA: Deploy to environment
    DA->>JM: Report results
    JM->>DE: Terminate agent
    DE->>DA: Stop and remove container
```

## Current Docker Container Status

Based on our investigation, these are the Docker containers currently running in your environment:

```mermaid
gantt
    title Docker Container Status
    dateFormat  YYYY-MM-DD
    section Active Containers
    jenkins-blueocean      :active, 2025-03-03, 1d
    socat (gallant_leakey) :active, 2025-03-03, 1d
    openwebui              :active, 2025-02-23, 10d
    watchtower             :active, 2025-02-23, 10d
```

## Recommendations for Docker Setup

To ensure your Jenkins pipeline works correctly with Docker, consider the following recommendations:

1. **Container Communication**:
   - Ensure all containers are on the same Docker network
   - Verify that the Jenkins container can communicate with the Docker socket

2. **Docker Socket Access**:
   - Check that the socat container is properly forwarding Docker socket connections
   - Verify that the Jenkins container has the necessary permissions

3. **Agent Configuration**:
   - Confirm that the Docker agent template is correctly configured
   - Ensure the agent has access to the necessary resources

4. **Resource Monitoring**:
   - Monitor container resource usage to ensure there are no constraints
   - Check for any container logs indicating resource issues

By following these recommendations, you should be able to resolve any Docker-related issues with your Jenkins pipeline. 