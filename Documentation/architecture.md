# Architecture - Local Link

## High-level components

- Frontend: Next.js application (`frontend/`)
- Backend API: Node.js + Express (`backend/`)
- Database: MongoDB
- ML microservice: FastAPI (`ml-service/`)

## Runtime interaction

```text
Client (Next.js pages)
  -> Backend API (Express)
    -> MongoDB
    -> ML service (FastAPI)
```

## Backend module organization

```text
backend/src/
|-- config/
|-- controllers/
|   |-- commerce/
|   |-- emergency/
|   |-- food/
|   `-- resources/
|-- middlewares/
|-- models/
|   |-- commerce/
|   |-- emergency/
|   |-- food/
|   `-- resources/
|-- routes/
|   |-- commerce/
|   |-- emergency/
|   |-- food/
|   `-- resources/
`-- server.js
```

## API routing map (current)

- `/api/auth` -> user auth/profile routes
- `/api/v1/commerce` -> commerce routes
- `/api/v1/shopkeeper` -> commerce shopkeeper routes
- `/api/v1/admin` -> commerce admin routes
- `/api/food` -> food routes
- `/api/v1/resources` -> resource routes
- `/api/v1/bookings` -> resource booking routes
- `/api/v1/emergency` -> emergency routes

## Data and model notes

- MongoDB stores users, food listings, commerce entities, resources, bookings, and emergency records.
- Geospatial operations should use MongoDB 2dsphere indexes for nearby queries.
- JWT cookie/session checks are enforced by backend middleware and frontend route proxy checks.

## ML integration pattern

- Backend calls ML endpoints over HTTP (axios).
- ML service is independently deployable and versioned.
- If ML is unavailable, backend should gracefully degrade and still serve core data.

## Deployment suggestion

- Local dev: run 3 processes (`frontend`, `backend`, `ml-service`).
- Production: containerize each service independently, use reverse proxy and managed MongoDB.
