# QuickNotes Production API Design

## A. API Overview
The QuickNotes API is a RESTful web service designed to allow users to securely create, read, update, and delete personal notes, as well as organize them with tags. 

- **Purpose**: To provide a reliable, scalable, and secure backend for the QuickNotes frontend applications (web and mobile).
- **REST Principles**: Resources (like notes and tags) are identified by URLs. HTTP methods (`GET`, `POST`, `PATCH`, `DELETE`) represent actions on these resources.
- **Data Format**: All requests and responses use `application/json`.
- **Authentication**: Protected endpoints require a valid JSON Web Token (JWT) in the `Authorization: Bearer <token>` header. This ensures users can only access their own data.
- **Base URL**: `https://api.quicknotes.example.com/v1` *(Note: This is a proposed example domain for documentation purposes).*

## B. Endpoint Table

| Method | Path | Purpose | Auth Required | Success Status |
|---|---|---|---|---|
| `POST` | `/auth/register` | Register a new user account | No | `201 Created` |
| `POST` | `/auth/login` | Authenticate user and receive JWT | No | `200 OK` |
| `GET` | `/notes` | List the authenticated user's notes (paginated) | Yes | `200 OK` |
| `POST` | `/notes` | Create a new note for the authenticated user | Yes | `201 Created` |
| `GET` | `/notes/{id}` | Retrieve a specific note by ID | Yes | `200 OK` |
| `PATCH` | `/notes/{id}` | Partially update a note (e.g., title or body) | Yes | `200 OK` |
| `DELETE` | `/notes/{id}` | Delete a specific note | Yes | `204 No Content` |
| `GET` | `/tags` | List the authenticated user's tags | Yes | `200 OK` |
| `POST` | `/notes/{id}/tags` | Associate existing tags with a note | Yes | `201 Created` |

## C. Create Note: Request and Response

**Request** (`POST /notes`)
```json
{
  "title": "Meeting notes",
  "body": "Discuss the project timeline and assign tasks."
}