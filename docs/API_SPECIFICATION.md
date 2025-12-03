# API Specification

## Base URL

```
https://{api-gateway-id}.execute-api.{region}.amazonaws.com/prod
```

## Authentication

All endpoints require a valid JWT token from AWS Cognito in the Authorization header:

```
Authorization: Bearer <jwt-token>
```

---

## Shop Endpoints

### List User Shops

```http
GET /shops
```

**Response:**
```json
{
  "data": [
    {
      "id": "shop-001",
      "name": "Downtown Electronics",
      "ownerId": "user-001",
      "address": "123 Main St",
      "phone": "+1 555-0123",
      "email": "info@downtown.com",
      "planType": "free",
      "createdAt": "2024-01-15T10:00:00Z",
      "updatedAt": "2024-11-01T14:30:00Z"
    }
  ]
}
```

### Create Shop

```http
POST /shops
Content-Type: application/json

{
  "name": "My New Shop",
  "address": "456 Oak Street",
  "phone": "+1 555-0456",
  "email": "contact@myshop.com"
}
```

**Success Response (201):**
```json
{
  "data": {
    "id": "shop-002",
    "name": "My New Shop",
    "ownerId": "user-001",
    "address": "456 Oak Street",
    "phone": "+1 555-0456",
    "email": "contact@myshop.com",
    "createdAt": "2024-12-01T10:00:00Z",
    "updatedAt": "2024-12-01T10:00:00Z"
  }
}
```

**Error Response (400) - Limit Reached:**
```json
{
  "error": "SHOP_LIMIT_REACHED",
  "message": "You have reached the maximum number of shops for your plan"
}
```

### Get Shop

```http
GET /shops/{shopId}
```

### Update Shop

```http
PUT /shops/{shopId}
Content-Type: application/json

{
  "name": "Updated Shop Name",
  "address": "789 New Address"
}
```

### Delete Shop

```http
DELETE /shops/{shopId}
```

**Error Response (400) - Last Shop:**
```json
{
  "error": "CANNOT_DELETE_LAST_SHOP",
  "message": "You must have at least one shop"
}
```

---

## Product Endpoints

### List Products

```http
GET /products?shopId={shopId}&search={search}&category={category}&lowStockOnly={boolean}
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| shopId | string | Yes | Target shop ID |
| search | string | No | Search by name or SKU |
| category | string | No | Filter by category |
| lowStockOnly | boolean | No | Only show low stock items |

**Response:**
```json
{
  "data": {
    "items": [
      {
        "id": "prod-001",
        "shopId": "shop-001",
        "name": "Wireless Headphones",
        "sku": "WBH-001",
        "category": "Audio",
        "unitPrice": 79.99,
        "currentStock": 45,
        "reorderThreshold": 20,
        "location": "Shelf A1",
        "createdAt": "2024-02-01T10:00:00Z",
        "updatedAt": "2024-11-28T14:30:00Z"
      }
    ],
    "total": 1,
    "page": 1,
    "pageSize": 50,
    "hasMore": false
  }
}
```

### Create Product

```http
POST /products
Content-Type: application/json

{
  "shopId": "shop-001",
  "name": "New Product",
  "sku": "NP-001",
  "category": "Electronics",
  "unitPrice": 29.99,
  "currentStock": 100,
  "reorderThreshold": 20,
  "location": "Shelf B2"
}
```

### Update Product

```http
PUT /products/{productId}?shopId={shopId}
Content-Type: application/json

{
  "name": "Updated Product Name",
  "unitPrice": 34.99
}
```

### Delete Product

```http
DELETE /products/{productId}?shopId={shopId}
```

---

## Inventory Endpoints

### Get Inventory

```http
GET /inventory?shopId={shopId}
```

**Response:**
```json
{
  "data": [
    {
      "id": "prod-001",
      "shopId": "shop-001",
      "name": "Wireless Headphones",
      "sku": "WBH-001",
      "currentStock": 45,
      "reorderThreshold": 20,
      "location": "Shelf A1"
    }
  ]
}
```

### Adjust Stock

```http
POST /inventory/adjust?shopId={shopId}
Content-Type: application/json

{
  "productId": "prod-001",
  "quantityChange": 50,
  "type": "IN",
  "reason": "purchase",
  "notes": "Restocked from supplier"
}
```

**Parameters:**
| Field | Type | Values | Description |
|-------|------|--------|-------------|
| productId | string | - | Target product ID |
| quantityChange | number | - | Positive for IN, negative for OUT |
| type | string | IN, OUT | Transaction direction |
| reason | string | purchase, sale, adjustment, wastage, return | Transaction reason |
| notes | string | - | Optional notes |

**Response:**
```json
{
  "data": {
    "product": {
      "id": "prod-001",
      "currentStock": 95
    },
    "transaction": {
      "id": "tx-001",
      "productId": "prod-001",
      "shopId": "shop-001",
      "quantityChange": 50,
      "type": "IN",
      "reason": "purchase",
      "notes": "Restocked from supplier",
      "performedBy": "user-001",
      "timestamp": "2024-12-01T10:00:00Z"
    }
  }
}
```

### Get Transaction History

```http
GET /inventory/transactions?shopId={shopId}&productId={productId}
```

---

## Sales Endpoints

### List Sales

```http
GET /sales?shopId={shopId}&startDate={date}&endDate={date}&productId={productId}
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| shopId | string | Yes | Target shop ID |
| startDate | string | No | ISO date (YYYY-MM-DD) |
| endDate | string | No | ISO date (YYYY-MM-DD) |
| productId | string | No | Filter by product |

**Response:**
```json
{
  "data": {
    "items": [
      {
        "id": "sale-001",
        "shopId": "shop-001",
        "productId": "prod-001",
        "productName": "Wireless Headphones",
        "productSku": "WBH-001",
        "quantity": 2,
        "unitPrice": 79.99,
        "totalAmount": 159.98,
        "timestamp": "2024-12-01T09:30:00Z",
        "performedBy": "user-001"
      }
    ],
    "total": 1,
    "page": 1,
    "pageSize": 50,
    "hasMore": false
  }
}
```

### Record Sale

```http
POST /sales?shopId={shopId}
Content-Type: application/json

{
  "productId": "prod-001",
  "quantity": 2
}
```

**Response:**
```json
{
  "data": {
    "id": "sale-002",
    "shopId": "shop-001",
    "productId": "prod-001",
    "productName": "Wireless Headphones",
    "productSku": "WBH-001",
    "quantity": 2,
    "unitPrice": 79.99,
    "totalAmount": 159.98,
    "timestamp": "2024-12-01T15:00:00Z",
    "performedBy": "user-001"
  }
}
```

### Get Sales Stats

```http
GET /sales/stats?shopId={shopId}&period={period}
```

**Query Parameters:**
| Parameter | Values |
|-----------|--------|
| period | today, week, month |

**Response:**
```json
{
  "data": {
    "totalSales": 25,
    "totalRevenue": 2450.75,
    "averageOrderValue": 98.03
  }
}
```

### Get Top Selling Products

```http
GET /sales/top-products?shopId={shopId}&limit={limit}
```

**Response:**
```json
{
  "data": [
    {
      "productId": "prod-001",
      "productName": "Wireless Headphones",
      "totalQuantity": 45,
      "totalRevenue": 3599.55
    }
  ]
}
```

---

## Alert Endpoints

### Get Notification Preferences

```http
GET /alerts/preferences?shopId={shopId}
```

**Response:**
```json
{
  "data": {
    "emailEnabled": true,
    "smsEnabled": false,
    "email": "alerts@myshop.com",
    "phone": "",
    "lowStockThresholdPercent": 100
  }
}
```

### Update Notification Preferences

```http
PUT /alerts/preferences?shopId={shopId}
Content-Type: application/json

{
  "emailEnabled": true,
  "smsEnabled": true,
  "email": "alerts@myshop.com",
  "phone": "+1 555-0123"
}
```

### Send Test Alert

```http
POST /alerts/test?shopId={shopId}
```

**Response:**
```json
{
  "data": {
    "success": true,
    "message": "Test notification sent successfully"
  }
}
```

---

## Error Responses

### Standard Error Format

```json
{
  "error": "ERROR_CODE",
  "message": "Human readable error message"
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| UNAUTHORIZED | 401 | Invalid or missing JWT token |
| FORBIDDEN | 403 | User doesn't own the requested shop |
| NOT_FOUND | 404 | Resource not found |
| SHOP_LIMIT_REACHED | 400 | Cannot create more shops |
| INSUFFICIENT_STOCK | 400 | Not enough stock for operation |
| VALIDATION_ERROR | 400 | Invalid request parameters |
