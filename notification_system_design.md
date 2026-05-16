# Stage 1

## Create Notification

### Endpoint

```http
POST /api/v1/notifications
```

### Request Body

```json
{
  "title": "Afford Internship",
  "message": "Internship applications",
  "type": "placement",
  "priority": "high"
}
```

### Response

```json
{
  "success": true,
  "notificationId": "n_01",
  "message": "Notification created"
}
```

---

## Get Notifications

### Endpoint

```http
GET /api/v1/notifications
```

### Query Parameters

| Parameter | Type |
|---|---|
| page | number |
| limit | number |
| category | string |

### Response

```json
{
  "success": true,
  "notifications": [
    {
      "id": "n_01",
      "title": "Workshop Reminder",
      "message": "Workshop starts now",
      "type": "event",
      "priority": "medium",
      "isRead": false,
      "createdAt": "2026-05-16T09:30:00Z"
    }
  ]
}
```

---

## Get Notification By ID

### Endpoint

```http
GET /api/v1/notifications/:id
```

### Response

```json
{
  "success": true,
  "notification": {
    "id": "n_01",
    "title": "Workshop Reminder",
    "message": "workshop starts now",
    "type": "event",
    "priority": "medium",
    "isRead": false,
    "createdAt": "2026-05-16T09:30:00Z"
  }
}
```

---

## Mark Notification as Read

### Endpoint

```http
PATCH /api/v1/notifications/:id/read
```

### Response

```json
{
  "success": true,
  "message": "Notification updated"
}
```

---

## Mark All Notifications as Read

### Endpoint

```http
PATCH /api/v1/notifications/read-all
```

### Response

```json
{
  "success": true,
  "message": "All notifications marked as read"
}
```

---

## Delete Notification

### Endpoint

```http
DELETE /api/v1/notifications/:id
```

### Response

```json
{
  "success": true,
  "message": "Notification removed"
}
```

---

## Get Unread Notifications Count

### Endpoint

```http
GET /api/v1/notifications/unread-count
```

### Response

```json
{
  "success": true,
  "count": 3
}
```

---

## Filter Notifications

### Endpoint

```http
GET /api/v1/notifications/filter
```

### Query Parameters

| Parameter | Type |
|---|---|
| type | string |
| priority | string |

### Response

```json
{
  "success": true,
  "notifications": [
    {
      "id": "n_01",
      "title": "Exam Hall Update",
      "message": "Hall allocation has been updated",
      "type": "exam",
      "priority": "high"
    }
  ]
}
```

---

## Notification Schema

```json
{
  "id": "string",
  "title": "string",
  "message": "string",
  "type": "placement | event | exam | result | general",
  "priority": "low | medium | high",
  "isRead": "boolean",
  "createdAt": "timestamp"
}
```

---

## Error Response

```json
{
  "success": false,
  "error": "Invalid notification ID"
}
```