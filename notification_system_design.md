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
# Stage 3

## Existing Query

```sql
SELECT * FROM notifications
WHERE user_id = 'u_01'
AND is_read = false
ORDER BY created_at ASC;
```

---

## Is the Query Accurate?

Yes, the query correctly retrieves unread notifications of a user sorted by notification creation time.

---

## Why is the Query Slow?

- The notifications table contains millions of rows
- Full table scans may happen if indexes are missing
- Sorting using ORDER BY on large datasets is expensive
- SELECT * fetches unnecessary columns
- Increased concurrent requests increase database load

---

## Optimized Query

```sql
SELECT id, title, message, type, priority, created_at
FROM notifications
WHERE user_id = 'u_01'
AND is_read = false
ORDER BY created_at DESC
LIMIT 20;
```

---

## Recommended Index

```sql
CREATE INDEX idx_notifications_user_read_created
ON notifications(user_id, is_read, created_at);
```

---

## Likely Computation Cost

Without indexing:
- O(n)

With indexing:
- O(log n)

---

## Should Indexes Be Added on Every Column?

No.

Adding indexes on every column is not effective because:

- Inserts and updates become slower
- Additional storage is required
- Unused indexes waste resources
- Database maintenance overhead increases

Indexes should only be added to:
- Frequently filtered columns
- Sorting columns
- Join columns

---

## Query to Find Users Who Received Placement Notifications in Last 7 Days

```sql
SELECT DISTINCT user_id
FROM notifications
WHERE type = 'placement'
AND created_at >= NOW() - INTERVAL '7 days';
```
# Stage 4

## Solution

Fetching notifications from the database every time a page loads increases database traffic and slows down the application when the number of users grows. To improve performance, caching and real-time updates can be used.

---

## Redis Caching

Recent notifications and unread counts can be stored in Redis.

Flow:
- Check Redis first
- If cache exists, return cached data
- Otherwise fetch from database and update cache

Advantages:
- Faster response time
- Reduces database queries

Disadvantages:
- Extra memory usage
- Cache invalidation handling required

---

## Pagination

Notifications should be fetched in smaller batches.

Example:

```http
GET /api/v1/notifications?page=1&limit=20
```

Advantages:
- Faster queries
- Lower server load

Disadvantages:
- Multiple requests required for more data

---

## WebSockets

WebSockets can be used to push notifications instantly instead of repeatedly fetching notifications from APIs.

Advantages:
- Real-time updates
- Reduces unnecessary API requests

Disadvantages:
- More complex implementation
- Persistent socket connections consume memory

---

## Lazy Loading

Notifications should load only when the notification section is opened.

Advantages:
- Faster initial page load
- Fewer unnecessary requests

Disadvantages:
- Small delay while opening notifications

---

## Database Indexing

Indexes can be added on:
- user_id
- is_read
- created_at

Advantages:
- Faster filtering and sorting

Disadvantages:
- Slower insert/update operations
- Extra storage required

---

## Archiving Old Notifications

Old notifications can be moved to a separate archive table.

Advantages:
- Smaller active dataset
- Faster queries on recent notifications

Disadvantages:
- Archived notifications take longer to access

---

## Final Approach

- Redis for caching
- WebSockets for real-time updates
- Pagination for notification listing
- Lazy loading in frontend
- Indexing on frequently queried columns

# Stage 5

## Issues

- Sending notifications one by one is slow
- Email failures can interrupt the process
- High load on the server during bulk notifications

---

## Improved Design

Notifications can first be stored in the database and email sending can be handled separately using queues.

This avoids blocking the main application flow.

---

## Failed Email Handling

If email delivery fails:
- move failed jobs to retry queue
- retry after some delay
- store failure logs

---

## Updated Flow

javascript
async function notifyStudents(studentIds, message) {

    for (const id of studentIds) {

        await saveNotification(id, message);

        emailQueue.add({
            studentId: id,
            message
        });

        sendRealtimeNotification(id, message);
    }
}


---

## Benefits

- Faster bulk processing
- Better reliability
- Easier handling of failed emails
- Reduced database and server load

# Stage 6

## Priority Inbox Design

Notifications are arranged using:
- notification category
- notification time

Higher importance is given to placement related notifications, followed by results and events.

Priority order:
- Placement
- Result
- Event

If two notifications have the same priority, the newer notification is shown first.

---

## Handling Incoming Notifications

Instead of sorting the complete list repeatedly, only the current top 10 notifications are maintained.

Whenever a new notification arrives:
- calculate its priority
- compare it with existing notifications
- update the list if required

This avoids unnecessary sorting on large datasets.

---

## Sample Logic

javascript
const weights = {
  Placement: 30,
  Result: 20,
  Event: 10
};

function sortNotifications(items) {

  return items.sort((a, b) => {

    const first =
      weights[b.Type] - weights[a.Type];

    if (first !== 0) {
      return first;
    }

    return (
      new Date(b.Timestamp) -
      new Date(a.Timestamp)
    );

  }).slice(0, 10);
}


---

## Benefits

- Quick access to important notifications
- Less processing overhead
- Easier to manage live incoming notifications