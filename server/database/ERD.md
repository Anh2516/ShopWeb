# Lược đồ ERD (quan hệ bảng)

Sơ đồ ở dạng Mermaid cho nhanh chóng, thể hiện các bảng chính và quan hệ cùng hành vi xóa.

```mermaid
erDiagram
    USERS ||--o{ ORDERS : "1-n (ON DELETE CASCADE)"
    USERS ||--o{ WALLET_TRANSACTIONS : "1-n (ON DELETE CASCADE)"
    USERS ||--o{ INVENTORY_ENTRIES : "created_by (ON DELETE SET NULL)"
    USERS ||--o{ WALLET_TRANSACTIONS : "approved_by (ON DELETE SET NULL)"

    CATEGORIES ||--o{ PRODUCTS : "1-n (ON DELETE SET NULL)"

    PRODUCTS ||--o{ PRODUCT_IMAGES : "1-n (ON DELETE CASCADE)"
    PRODUCTS ||--o{ ORDER_ITEMS : "1-n (ON DELETE CASCADE)"
    PRODUCTS ||--o{ INVENTORY_ENTRIES : "1-n (ON DELETE SET NULL)"

    ORDERS ||--o{ ORDER_ITEMS : "1-n (ON DELETE CASCADE)"

    USERS {
        int id PK
        varchar email UNIQUE
        varchar password
        varchar name
        varchar phone
        text address
        decimal balance
        char customer_code UNIQUE
        enum role
        timestamp created_at
        timestamp updated_at
    }

    CATEGORIES {
        int id PK
        varchar name
        text description
        timestamp created_at
        timestamp updated_at
    }

    PRODUCTS {
        int id PK
        varchar name
        text description
        decimal price
        int stock
        int category_id FK
        varchar image
        tinyint is_visible
        timestamp created_at
        timestamp updated_at
    }

    PRODUCT_IMAGES {
        int id PK
        int product_id FK
        varchar image_url
        int display_order
        timestamp created_at
    }

    ORDERS {
        int id PK
        int user_id FK
        decimal total
        text shipping_address
        varchar payment_method
        varchar payment_gateway
        enum status
        timestamp created_at
        timestamp updated_at
    }

    ORDER_ITEMS {
        int id PK
        int order_id FK
        int product_id FK
        int quantity
        decimal price
        timestamp created_at
    }

    INVENTORY_ENTRIES {
        int id PK
        int product_id FK
        varchar product_name
        varchar product_image
        int quantity
        decimal unit_cost
        decimal total_cost
        text note
        int created_by FK
        varchar supplier_name
        varchar supplier_contact
        varchar supplier_email
        text supplier_address
        timestamp created_at
    }

    WALLET_TRANSACTIONS {
        int id PK
        int user_id FK
        decimal amount
        varchar method
        enum type
        text note
        enum status
        int approved_by FK
        timestamp approved_at
        timestamp created_at
    }
```

## Ghi chú
- `ON DELETE CASCADE`: xóa bản ghi cha sẽ xóa bản ghi con liên quan (đơn hàng, ảnh, order items, giao dịch ví của user).
- `ON DELETE SET NULL`: giữ lịch sử nhưng bỏ liên kết khi bản ghi cha bị xóa (inventory_entries.product_id, inventory_entries.created_by, wallet_transactions.approved_by, products.category_id).
- Có hai quan hệ từ `users` tới `wallet_transactions`:
  - `user_id` (owner giao dịch) — cascade.
  - `approved_by` (người duyệt) — set null.


