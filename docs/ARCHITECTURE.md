# Architecture Documentation

## System Architecture Diagram

```mermaid
flowchart TB
    subgraph Client["Client Layer"]
        Browser["Web Browser"]
        Mobile["Mobile Browser"]
    end

    subgraph Frontend["Frontend (AWS Amplify)"]
        React["React Application"]
        Router["React Router"]
        State["State Management"]
    end

    subgraph Auth["Authentication (AWS Cognito)"]
        UserPool["Cognito User Pool"]
        JWT["JWT Tokens"]
    end

    subgraph API["API Layer (AWS API Gateway)"]
        Gateway["REST API Gateway"]
        Authorizer["Cognito Authorizer"]
    end

    subgraph Compute["Compute Layer (AWS Lambda)"]
        AuthLambda["Auth Functions"]
        ProductLambda["Product Functions"]
        InventoryLambda["Inventory Functions"]
        SalesLambda["Sales Functions"]
        AlertLambda["Alert Functions"]
    end

    subgraph Database["Database (AWS DynamoDB)"]
        MainTable["InventorySystem Table"]
        GSI["Global Secondary Indexes"]
    end

    subgraph Notifications["Notifications (AWS SNS)"]
        Topics["SNS Topics"]
        Email["Email Subscriptions"]
        SMS["SMS Subscriptions"]
    end

    subgraph Monitoring["Monitoring (AWS CloudWatch)"]
        Logs["CloudWatch Logs"]
        Metrics["CloudWatch Metrics"]
        Alarms["CloudWatch Alarms"]
    end

    Browser --> React
    Mobile --> React
    React --> Router
    Router --> State
    State --> Gateway
    
    React --> UserPool
    UserPool --> JWT
    JWT --> Gateway
    
    Gateway --> Authorizer
    Authorizer --> UserPool
    
    Gateway --> AuthLambda
    Gateway --> ProductLambda
    Gateway --> InventoryLambda
    Gateway --> SalesLambda
    Gateway --> AlertLambda
    
    AuthLambda --> MainTable
    ProductLambda --> MainTable
    InventoryLambda --> MainTable
    SalesLambda --> MainTable
    AlertLambda --> MainTable
    
    InventoryLambda --> Topics
    AlertLambda --> Topics
    
    Topics --> Email
    Topics --> SMS
    
    AuthLambda --> Logs
    ProductLambda --> Logs
    InventoryLambda --> Logs
    SalesLambda --> Logs
    AlertLambda --> Logs
```

## Data Flow

### Authentication Flow

```mermaid
sequenceDiagram
    participant User
    participant React
    participant Cognito
    participant API
    participant Lambda
    participant DynamoDB

    User->>React: Enter credentials
    React->>Cognito: Sign In request
    Cognito-->>React: JWT Token
    React->>React: Store token
    React->>API: Request with JWT
    API->>Cognito: Validate token
    Cognito-->>API: Token valid
    API->>Lambda: Forward request
    Lambda->>DynamoDB: Query data (filtered by shopId)
    DynamoDB-->>Lambda: Return data
    Lambda-->>API: Response
    API-->>React: JSON response
    React-->>User: Display data
```

### Low Stock Alert Flow

```mermaid
sequenceDiagram
    participant User
    participant React
    participant API
    participant Lambda
    participant DynamoDB
    participant SNS
    participant Email/SMS

    User->>React: Adjust inventory (remove stock)
    React->>API: POST /inventory/adjust
    API->>Lambda: Process adjustment
    Lambda->>DynamoDB: Update stock level
    Lambda->>Lambda: Check if stock < threshold
    alt Stock below threshold
        Lambda->>SNS: Publish low stock alert
        SNS->>Email/SMS: Send notification
    end
    Lambda-->>API: Return updated product
    API-->>React: Response
    React-->>User: Show confirmation
```

## Component Architecture

```
src/
├── components/
│   ├── layout/           # Layout components
│   │   ├── AppSidebar    # Navigation sidebar
│   │   ├── TopBar        # Header with user menu
│   │   └── DashboardLayout # Protected route wrapper
│   ├── dashboard/        # Dashboard-specific components
│   │   ├── StatCard      # Metric display cards
│   │   ├── LowStockTable # Alert table
│   │   └── RecentSalesCard # Sales summary
│   └── ui/               # Shadcn/UI components
├── contexts/
│   └── AuthContext       # Authentication state
├── services/             # API service layer
│   ├── api.ts            # Base API client
│   ├── authService.ts    # Cognito integration
│   ├── productService.ts # Product CRUD
│   ├── inventoryService.ts # Stock management
│   ├── salesService.ts   # Sales operations
│   └── alertService.ts   # SNS notifications
├── types/
│   └── inventory.ts      # TypeScript interfaces
├── config/
│   └── api.ts            # AWS configuration
├── data/
│   └── mockData.ts       # Development mock data
└── pages/                # Route components
```

## Security Architecture

1. **Authentication**: AWS Cognito handles all user authentication
2. **Authorization**: API Gateway validates JWT tokens before forwarding requests
3. **Multi-tenancy**: All Lambda functions filter data by `shopId` from the JWT claims
4. **Data isolation**: DynamoDB access patterns ensure shops can only access their own data
5. **Transport**: All communication uses HTTPS

## Scalability Considerations

- **Serverless**: Lambda auto-scales based on demand
- **DynamoDB**: On-demand capacity mode handles traffic spikes
- **API Gateway**: Handles millions of requests per second
- **SNS**: Highly available messaging system
