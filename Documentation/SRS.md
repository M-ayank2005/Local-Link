# Software Requirements Specification (SRS) - Local Link

## 1. Introduction

### Purpose
Build a hyperlocal platform connecting residents, shops, NGOs, and service providers to reduce waste, share resources, support local commerce, and improve emergency response.

### Scope
Web application with a Next.js frontend, Express backend, MongoDB database, and a FastAPI ML microservice for prediction and recommendation capabilities.

## 2. Overall Description

### Product perspective
- Modular backend with domain-based routes/controllers/models
- Next.js frontend consuming backend REST APIs
- MongoDB used for location-based lookups and transactional records
- ML microservice integrated via HTTP calls from backend

### User classes
- Resident
- Shopkeeper
- NGO
- Service provider (planned/partial)
- Admin

## 3. Functional Requirements

### FR-1: Apartment Commerce
- Users can browse shops and products.
- Users can add items to cart and place orders.
- Shopkeepers can manage inventory and process orders.

### FR-2: Food Waste Module
- Residents/shopkeepers can create surplus food listings.
- NGOs/residents can claim listings.
- Listings become unavailable after expiry time.
- Owners can mark pickups as completed.

### FR-3: Shared Resource Pool
- Users can list resources for rent with price and deposit.
- Users can browse nearby resources.
- Users can request bookings and manage booking lifecycle.

### FR-4: Emergency Network
- Users can discover blood and medicine availability by locality.
- Access is limited to authenticated users.
- Data should be filterable by area and availability.

### FR-5: Skill Exchange (planned)
- Providers create service listings.
- Residents book providers and submit reviews after service.

## 4. Non-Functional Requirements

- Performance: common API reads should target sub-300ms under normal load.
- Security: JWT auth, password hashing, role-based access control.
- Availability: core user flows available during standard operating windows.
- Scalability: ML service isolated as a separate process/service.
- Usability: mobile-first UI behavior in all frontend modules.

## 5. External Interfaces

### Backend REST API (examples)
- `GET /api/auth/me`
- `GET /api/v1/commerce/*`
- `GET /api/food`
- `GET /api/v1/resources`
- `GET /api/v1/emergency`

### ML service endpoints
- `POST /ml/recommend-resources`
- `POST /ml/predict-demand`
- `POST /ml/no-show-prob`
- `GET /health`
