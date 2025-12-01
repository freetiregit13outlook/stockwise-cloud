# AWS Setup Guide

## Prerequisites

- AWS Account with appropriate permissions
- AWS CLI installed and configured
- Node.js 18+ installed
- Git installed

## Step 1: Create Cognito User Pool

### Using AWS Console

1. Navigate to **Amazon Cognito** > **User Pools**
2. Click **Create user pool**
3. Configure sign-in experience:
   - Select **Email** as sign-in option
   - Click **Next**

4. Configure security requirements:
   - Password policy: Minimum 8 characters
   - MFA: Optional (recommended for production)
   - Click **Next**

5. Configure sign-up experience:
   - Enable self-registration
   - Required attributes: email
   - Click **Next**

6. Configure message delivery:
   - Email: Use Cognito default (or configure SES for production)
   - Click **Next**

7. Integrate your app:
   - User pool name: `inventory-system-users`
   - App client name: `inventory-web-app`
   - Client secret: Don't generate
   - Click **Next**

8. Review and create

### Save These Values
```
User Pool ID: us-east-1_XXXXXXXXX
App Client ID: XXXXXXXXXXXXXXXXXXXXXXXXXX
```

## Step 2: Create DynamoDB Table

### Using AWS Console

1. Navigate to **DynamoDB** > **Tables**
2. Click **Create table**
3. Configure:
   - Table name: `InventorySystem`
   - Partition key: `PK` (String)
   - Sort key: `SK` (String)
4. Settings: Default settings (On-demand capacity)
5. Click **Create table**

### Create GSI

1. Open the table > **Indexes** tab
2. Click **Create index**
3. Configure:
   - Partition key: `GSI1PK` (String)
   - Sort key: `GSI1SK` (String)
   - Index name: `GSI1`
4. Click **Create index**

## Step 3: Create SNS Topic

1. Navigate to **Amazon SNS** > **Topics**
2. Click **Create topic**
3. Configure:
   - Type: Standard
   - Name: `inventory-low-stock-alerts`
4. Click **Create topic**

### Create Subscriptions

For email alerts:
1. Select the topic > **Create subscription**
2. Protocol: Email
3. Endpoint: your-email@example.com
4. Click **Create subscription**
5. Confirm the email subscription

For SMS alerts:
1. Select the topic > **Create subscription**
2. Protocol: SMS
3. Endpoint: +1234567890
4. Click **Create subscription**

## Step 4: Create Lambda Functions

### Create IAM Role

1. Navigate to **IAM** > **Roles**
2. Click **Create role**
3. Select **Lambda** as use case
4. Attach policies:
   - `AmazonDynamoDBFullAccess`
   - `AmazonSNSFullAccess`
   - `CloudWatchLogsFullAccess`
5. Role name: `inventory-lambda-role`

### Create Functions

Create the following Lambda functions with Node.js 18.x runtime:

#### 1. auth-handler
```javascript
// Handles /auth/me endpoint
export const handler = async (event) => {
  const claims = event.requestContext.authorizer.claims;
  
  // Fetch user and shop data from DynamoDB
  // Return user profile
};
```

#### 2. products-handler
```javascript
// Handles /products/* endpoints
export const handler = async (event) => {
  const shopId = event.requestContext.authorizer.claims['custom:shopId'];
  const method = event.httpMethod;
  const path = event.path;
  
  // CRUD operations filtered by shopId
};
```

#### 3. inventory-handler
```javascript
// Handles /inventory/* endpoints
// Includes low stock alert trigger
export const handler = async (event) => {
  // On stock adjustment, check threshold
  // If below, publish to SNS
};
```

#### 4. sales-handler
```javascript
// Handles /sales/* endpoints
export const handler = async (event) => {
  // Record sales, update stock
};
```

## Step 5: Create API Gateway

1. Navigate to **API Gateway**
2. Click **Create API** > **REST API**
3. API name: `inventory-api`

### Configure Authorizer

1. Go to **Authorizers** > **Create**
2. Name: `CognitoAuthorizer`
3. Type: Cognito
4. Cognito User Pool: Select your pool
5. Token Source: `Authorization`

### Create Resources and Methods

```
/auth
  /me
    GET → auth-handler (Cognito Authorizer)

/products
  GET → products-handler (Cognito Authorizer)
  POST → products-handler (Cognito Authorizer)
  /{id}
    GET → products-handler (Cognito Authorizer)
    PUT → products-handler (Cognito Authorizer)
    DELETE → products-handler (Cognito Authorizer)

/inventory
  GET → inventory-handler (Cognito Authorizer)
  /adjust
    POST → inventory-handler (Cognito Authorizer)

/sales
  GET → sales-handler (Cognito Authorizer)
  POST → sales-handler (Cognito Authorizer)

/alerts
  /test
    POST → alerts-handler (Cognito Authorizer)
  /preferences
    GET → alerts-handler (Cognito Authorizer)
    PUT → alerts-handler (Cognito Authorizer)
```

### Enable CORS

For each resource, enable CORS:
- Access-Control-Allow-Origin: *
- Access-Control-Allow-Headers: Content-Type,Authorization
- Access-Control-Allow-Methods: GET,POST,PUT,DELETE,OPTIONS

### Deploy API

1. Click **Deploy API**
2. Stage name: `prod`
3. Note the **Invoke URL**

## Step 6: Deploy Frontend

### Configure Environment

Create `.env` file in the frontend project:

```env
VITE_API_BASE_URL=https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/prod
VITE_COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
VITE_COGNITO_CLIENT_ID=XXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_AWS_REGION=us-east-1
```

### Update API Config

In `src/config/api.ts`, set:
```typescript
USE_MOCK_DATA: false
```

### Deploy to Amplify

1. Navigate to **AWS Amplify**
2. Click **New app** > **Host web app**
3. Connect your Git repository
4. Configure build settings:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: dist
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

5. Add environment variables from `.env`
6. Deploy

## Step 7: Verify Deployment

### Test Authentication

1. Navigate to your Amplify URL
2. Create a new account
3. Verify email
4. Sign in

### Test API Endpoints

Using curl or Postman:

```bash
# Get products (with JWT token)
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  https://api-url/prod/products
```

### Test Low Stock Alerts

1. Create a product with low threshold
2. Reduce stock below threshold
3. Verify SNS notification received

## Troubleshooting

### Common Issues

**CORS Errors**
- Ensure OPTIONS method returns correct headers
- Check API Gateway CORS configuration

**401 Unauthorized**
- Verify Cognito authorizer is attached
- Check token is being sent in Authorization header

**Lambda Timeout**
- Increase timeout in Lambda configuration
- Check DynamoDB connection

**SNS Not Sending**
- Verify subscription is confirmed
- Check Lambda has SNS publish permissions

## Production Checklist

- [ ] Enable Cognito MFA
- [ ] Configure SES for production emails
- [ ] Set up CloudWatch alarms
- [ ] Enable API Gateway throttling
- [ ] Configure DynamoDB auto-scaling
- [ ] Set up WAF for API protection
- [ ] Enable CloudTrail for audit logging
- [ ] Configure backup for DynamoDB
