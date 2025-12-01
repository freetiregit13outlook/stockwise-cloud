# DynamoDB Schema Documentation

## Table Design: Single-Table Pattern

### Table Name: `InventorySystem`

| Attribute | Type | Description |
|-----------|------|-------------|
| PK | String | Partition Key |
| SK | String | Sort Key |
| GSI1PK | String | GSI1 Partition Key |
| GSI1SK | String | GSI1 Sort Key |

## Entity Types

### Shop

```json
{
  "PK": "SHOP#<shopId>",
  "SK": "META",
  "entityType": "SHOP",
  "shopId": "uuid",
  "name": "Shop Name",
  "ownerId": "cognito-user-id",
  "address": "123 Main St",
  "phone": "+1234567890",
  "email": "shop@example.com",
  "notificationEmail": "alerts@example.com",
  "notificationPhone": "+1234567890",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

### Product

```json
{
  "PK": "SHOP#<shopId>",
  "SK": "PRODUCT#<productId>",
  "GSI1PK": "SHOP#<shopId>#CATEGORY#<category>",
  "GSI1SK": "PRODUCT#<productId>",
  "entityType": "PRODUCT",
  "productId": "uuid",
  "shopId": "uuid",
  "name": "Product Name",
  "sku": "SKU-001",
  "category": "Electronics",
  "unitPrice": 29.99,
  "currentStock": 100,
  "reorderThreshold": 20,
  "location": "Shelf A1",
  "description": "Product description",
  "imageUrl": "https://...",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

### Inventory Transaction

```json
{
  "PK": "PRODUCT#<productId>",
  "SK": "TX#<timestamp>#<transactionId>",
  "GSI1PK": "SHOP#<shopId>",
  "GSI1SK": "TX#<timestamp>",
  "entityType": "TRANSACTION",
  "transactionId": "uuid",
  "productId": "uuid",
  "shopId": "uuid",
  "quantityChange": -5,
  "type": "OUT",
  "reason": "sale",
  "notes": "Optional notes",
  "performedBy": "user-id",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### Sale

```json
{
  "PK": "SHOP#<shopId>",
  "SK": "SALE#<timestamp>#<saleId>",
  "GSI1PK": "SHOP#<shopId>#PRODUCT#<productId>",
  "GSI1SK": "SALE#<timestamp>",
  "entityType": "SALE",
  "saleId": "uuid",
  "shopId": "uuid",
  "productId": "uuid",
  "productName": "Product Name",
  "productSku": "SKU-001",
  "quantity": 2,
  "unitPrice": 29.99,
  "totalAmount": 59.98,
  "performedBy": "user-id",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

## Access Patterns

| Access Pattern | Key Condition | Index |
|----------------|---------------|-------|
| Get shop by ID | PK = SHOP#<shopId>, SK = META | Main |
| List all products for shop | PK = SHOP#<shopId>, SK begins_with PRODUCT# | Main |
| Get product by ID | PK = SHOP#<shopId>, SK = PRODUCT#<productId> | Main |
| List products by category | GSI1PK = SHOP#<shopId>#CATEGORY#<category> | GSI1 |
| Get transaction history for product | PK = PRODUCT#<productId>, SK begins_with TX# | Main |
| List all transactions for shop | GSI1PK = SHOP#<shopId>, GSI1SK begins_with TX# | GSI1 |
| List sales for shop | PK = SHOP#<shopId>, SK begins_with SALE# | Main |
| List sales by date range | PK = SHOP#<shopId>, SK between SALE#<start> and SALE#<end> | Main |
| List sales for product | GSI1PK = SHOP#<shopId>#PRODUCT#<productId>, GSI1SK begins_with SALE# | GSI1 |

## Global Secondary Index: GSI1

| Attribute | Type |
|-----------|------|
| GSI1PK | Partition Key |
| GSI1SK | Sort Key |

## Low Stock Query

To find low stock products, scan with filter:
```javascript
FilterExpression: 'currentStock < reorderThreshold AND entityType = :product'
```

For better performance with larger datasets, consider:
1. A separate GSI for low stock items
2. A scheduled Lambda that maintains a "low stock" entity

## Capacity Planning

| Shop Size | Products | Daily Transactions | Recommended Mode |
|-----------|----------|-------------------|------------------|
| Small | ~100 | ~50 | On-Demand |
| Medium | ~1,000 | ~500 | On-Demand |
| Large | ~5,000+ | ~2,000+ | Provisioned with Auto-scaling |

## Data Retention

- **Sales**: Keep indefinitely for reporting
- **Transactions**: Archive to S3 after 90 days
- **Products**: Soft delete (add `deletedAt` attribute)
