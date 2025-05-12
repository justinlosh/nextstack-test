# API Routes Documentation

The Flat File CMS provides a RESTful API for accessing and managing content. This document describes the available endpoints, request/response formats, and examples.

## Base URL

All API endpoints are available under the `/api` path.

## API Structure

The API follows this pattern:

\`\`\`
/api/[module]/[action]
\`\`\`

Where:
- `[module]` is the content type (e.g., "page", "post", "product")
- `[action]` is the operation to perform (e.g., "list", "get", "create", "update", "delete")

## Available Endpoints

### List Content

**GET** `/api/[module]/list`

Lists all content entries of a specific type with support for pagination, filtering, and sorting.

#### Query Parameters

- `page`: Page number (default: 1)
- `pageSize`: Number of items per page (default: 10)
- `sortBy`: Field to sort by (default: "updatedAt")
- `sortOrder`: Sort order, "asc" or "desc" (default: "desc")
- Any other parameter will be used for filtering (e.g., `status=published`)

#### Special Filter Operators

You can use special operators in filter parameters:

- `[field]_gt`: Greater than
- `[field]_gte`: Greater than or equal
- `[field]_lt`: Less than
- `[field]_lte`: Less than or equal
- `[field]_ne`: Not equal
- `[field]_contains`: Contains substring
- `[field]_startsWith`: Starts with substring
- `[field]_endsWith`: Ends with substring

Example: `/api/product/list?price_gt=50&price_lt=100`

#### Response

\`\`\`json
{
  "data": [
    {
      "id": "product-1",
      "title": "Product 1",
      "price": 99.99,
      ...
    },
    ...
  ],
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "totalItems": 25,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
\`\`\`

### Get Content

**GET** `/api/[module]/get?id=[id]`

Gets a single content entry by ID.

#### Query Parameters

- `id`: Content ID (required)

#### Response

\`\`\`json
{
  "data": {
    "id": "about-us",
    "title": "About Us",
    "content": "# About Us\n\nWelcome to our website!",
    ...
  }
}
\`\`\`

### Create Content

**POST** `/api/[module]/create`

Creates a new content entry.

#### Request Body

\`\`\`json
{
  "title": "New Page",
  "slug": "new-page",
  "content": "# New Page\n\nThis is a new page.",
  ...
}
\`\`\`

#### Response

\`\`\`json
{
  "data": {
    "id": "new-page",
    "title": "New Page",
    "slug": "new-page",
    "content": "# New Page\n\nThis is a new page.",
    "createdAt": "2023-05-15T10:30:00.000Z",
    "updatedAt": "2023-05-15T10:30:00.000Z",
    ...
  }
}
\`\`\`

### Update Content

**PUT** `/api/[module]/update`

Updates an existing content entry.

#### Request Body

\`\`\`json
{
  "id": "about-us",
  "title": "Updated About Us",
  "content": "# About Us\n\nThis content has been updated.",
  ...
}
\`\`\`

#### Response

\`\`\`json
{
  "data": {
    "id": "about-us",
    "title": "Updated About Us",
    "content": "# About Us\n\nThis content has been updated.",
    "updatedAt": "2023-05-16T15:45:00.000Z",
    ...
  }
}
\`\`\`

### Delete Content

**DELETE** `/api/[module]/delete?id=[id]`

Deletes a content entry.

#### Query Parameters

- `id`: Content ID (required)

#### Response

\`\`\`json
{
  "success": true
}
\`\`\`

### Advanced Query

**POST** `/api/[module]/query`

Performs an advanced query with complex filtering, sorting, and pagination.

#### Request Body

\`\`\`json
{
  "filters": {
    "status": "published",
    "price_gt": 50,
    "tags_in": ["featured", "sale"]
  },
  "sort": {
    "field": "price",
    "order": "asc"
  },
  "pagination": {
    "page": 1,
    "pageSize": 20
  }
}
\`\`\`

#### Response

\`\`\`json
{
  "data": [
    {
      "id": "product-1",
      "title": "Product 1",
      "price": 59.99,
      ...
    },
    ...
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalItems": 15,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPreviousPage": false
  }
}
\`\`\`

## Error Handling

All API endpoints return appropriate HTTP status codes and error messages in a consistent format:

\`\`\`json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      "field1": ["Error message for field1"],
      "field2": ["Error message for field2"]
    }
  }
}
\`\`\`

### Common Error Codes

- `VALIDATION_ERROR`: Request data failed validation
- `CONTENT_TYPE_ERROR`: Content type is not registered
- `NOT_FOUND_ERROR`: Content not found
- `DUPLICATE_ERROR`: Content with the same ID already exists
- `INVALID_ACTION`: Action is not supported for the HTTP method
- `INVALID_JSON`: Invalid JSON in request body

## Examples

### List all published pages

\`\`\`
GET /api/page/list?status=published
\`\`\`

### Get a specific product

\`\`\`
GET /api/product/get?id=premium-package
\`\`\`

### Create a new blog post

\`\`\`
POST /api/post/create
Content-Type: application/json

{
  "title": "New Blog Post",
  "slug": "new-blog-post",
  "content": "# New Blog Post\n\nThis is a new blog post.",
  "author": "Admin",
  "status": "draft"
}
\`\`\`

### Update a product price

\`\`\`
PUT /api/product/update
Content-Type: application/json

{
  "id": "premium-package",
  "price": 89.99,
  "salePrice": 79.99
}
\`\`\`

### Delete a page

\`\`\`
DELETE /api/page/delete?id=old-page
\`\`\`

### Advanced query for products

\`\`\`
POST /api/product/query
Content-Type: application/json

{
  "filters": {
    "price_gt": 50,
    "price_lt": 100,
    "status": "published"
  },
  "sort": {
    "field": "price",
    "order": "asc"
  },
  "pagination": {
    "page": 1,
    "pageSize": 10
  }
}
