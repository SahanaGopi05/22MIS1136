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

# Stage 2

## Database Choice

PostgreSQL

---

## Notification Table Schema

```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY,
    title VARCHAR(255),
    message TEXT,
    type VARCHAR(50),
    priority VARCHAR(20),
    is_read BOOLEAN DEFAULT FALSE,
    user_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Possible Problems with Large Data Volume

- Slower notification retrieval
- High database load during peak usage
- Delayed unread count calculations
- Increased storage usage
- Slower filtering and sorting operations

---

## Solutions

- Add indexes on user_id and created_at
- Use pagination for notification fetching
- Archive old notifications
- Cache unread notification counts
- Use WebSockets for real-time notification delivery
- Use read replicas for scaling read operations

---

## Queries

### Create Notification

```sql
INSERT INTO notifications (
    id,
    title,
    message,
    type,
    priority,
    is_read,
    user_id
)
VALUES (
    'n_01',
    'Afford Internship',
    'Internship applications',
    'placement',
    'high',
    false,
    'u_01'
);
```

---

### Get Notifications

```sql
SELECT *
FROM notifications
WHERE user_id = 'u_01'
ORDER BY created_at DESC
LIMIT 10;
```

---

### Get Notification By ID

```sql
SELECT *
FROM notifications
WHERE id = 'n_01';
```

---

### Mark Notification as Read

```sql
UPDATE notifications
SET is_read = true
WHERE id = 'n_01';
```

---

### Mark All Notifications as Read

```sql
UPDATE notifications
SET is_read = true
WHERE user_id = 'u_01';
```

---

### Delete Notification

```sql
DELETE FROM notifications
WHERE id = 'n_01';
```

---

### Get Unread Notifications Count

```sql
SELECT COUNT(*)
FROM notifications
WHERE user_id = 'u_01'
AND is_read = false;
```

---

### Filter Notifications

```sql
SELECT *
FROM notifications
WHERE type = 'exam'
AND priority = 'high';
```