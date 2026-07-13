-- Fix action_url pada notifikasi return_requested yang masih mengarah ke /seller/orders
UPDATE notifications
SET data = JSON_SET(
    data,
    '$.action_url',
    CONCAT('/returns/', JSON_UNQUOTE(JSON_EXTRACT(data, '$.return_id')))
)
WHERE type = 'App\\Notifications\\ReturnRequestedNotification'
  AND JSON_UNQUOTE(JSON_EXTRACT(data, '$.action_url')) != CONCAT('/returns/', JSON_UNQUOTE(JSON_EXTRACT(data, '$.return_id')));

-- Fix action_url pada notifikasi return_status_updated yang masih mengarah ke /orders/...
UPDATE notifications
SET data = JSON_SET(
    data,
    '$.action_url',
    CONCAT('/returns/', JSON_UNQUOTE(JSON_EXTRACT(data, '$.return_id')))
)
WHERE type = 'App\\Notifications\\ReturnStatusUpdatedNotification'
  AND JSON_UNQUOTE(JSON_EXTRACT(data, '$.action_url')) != CONCAT('/returns/', JSON_UNQUOTE(JSON_EXTRACT(data, '$.return_id')));

-- Verifikasi hasil
SELECT
    id,
    type,
    JSON_UNQUOTE(JSON_EXTRACT(data, '$.type')) AS notif_type,
    JSON_UNQUOTE(JSON_EXTRACT(data, '$.action_url')) AS action_url,
    created_at
FROM notifications
WHERE type IN (
    'App\\Notifications\\ReturnRequestedNotification',
    'App\\Notifications\\ReturnStatusUpdatedNotification'
)
ORDER BY created_at DESC;
