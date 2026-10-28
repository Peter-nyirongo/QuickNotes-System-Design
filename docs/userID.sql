
---

### 6. `docs/data-model.md`

```markdown
# QuickNotes Database Design

This document outlines the relational database schema for the production QuickNotes service, using PostgreSQL.

## A. Required Entities & Relationships

1. **users**: Stores account credentials and profile data.
2. **notes**: Stores the actual note content, linked to a user.
3. **tags**: Stores user-defined categories for organizing notes.
4. **note_tags**: A junction table resolving the many-to-many relationship between notes and tags.

### Relationships
- **One-to-Many**: One `user` can own many `notes`, but each `note` belongs to exactly one `user` (via `user_id`). Similarly, one `user` can create many `tags`.
- **Many-to-Many**: A `note` can have multiple `tags`, and a `tag` can be associated with multiple `notes`. The `note_tags` junction table manages this, ensuring data integrity via foreign keys. The application logic must ensure a user can only link tags that they own.

## B. Table Specifications

### 1. `users`
- `id`: UUID, Primary Key.
- `name`: VARCHAR(100), NOT NULL.
- `email`: VARCHAR(255), NOT NULL, UNIQUE.
- `password_hash`: VARCHAR(255), NOT NULL. *(Passwords must never be stored in plaintext. They must be hashed using a strong algorithm like bcrypt or Argon2 to protect user data in case of a database breach).*
- `created_at`: TIMESTAMP, NOT NULL, DEFAULT CURRENT_TIMESTAMP.

### 2. `notes`
- `id`: UUID, Primary Key.
- `user_id`: UUID, NOT NULL, Foreign Key referencing `users(id)` ON DELETE CASCADE.
- `title`: VARCHAR(100), NOT NULL.
- `body`: TEXT, NULL (optional).
- `created_at`: TIMESTAMP, NOT NULL, DEFAULT CURRENT_TIMESTAMP.
- `updated_at`: TIMESTAMP, NOT NULL, DEFAULT CURRENT_TIMESTAMP.

### 3. `tags`
- `id`: UUID, Primary Key.
- `user_id`: UUID, NOT NULL, Foreign Key referencing `users(id)` ON DELETE CASCADE.
- `name`: VARCHAR(50), NOT NULL.
- `created_at`: TIMESTAMP, NOT NULL, DEFAULT CURRENT_TIMESTAMP.
- *Constraint*: UNIQUE(`user_id`, `name`) to prevent a user from creating duplicate tag names.

### 4. `note_tags`
- `note_id`: UUID, NOT NULL, Foreign Key referencing `notes(id)` ON DELETE CASCADE.
- `tag_id`: UUID, NOT NULL, Foreign Key referencing `tags(id)` ON DELETE CASCADE.
- *Primary Key*: Composite Primary Key (`note_id`, `tag_id`) to prevent duplicate tag assignments to the same note.

## C. SQL CREATE TABLE Statements

```sql
-- 1. Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Notes Table
CREATE TABLE notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    body TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tags Table
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, name)
);

-- 4. Note-Tags Junction Table
CREATE TABLE note_tags (
    note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (note_id, tag_id)
);