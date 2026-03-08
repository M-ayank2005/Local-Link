# Security Notes - Local Link

## Authentication and authorization

- Use JWT-based authentication for protected APIs.
- Keep JWT expiry short and rotate/refresh securely when implemented.
- Enforce role checks for protected module actions (resident, shopkeeper, ngo, admin).

## Password and identity safety

- Hash passwords using bcrypt/bcryptjs before storage.
- Never log passwords or tokens.
- Use secure cookie settings in production (`HttpOnly`, `Secure`, `SameSite`).

## API hardening

- Validate and sanitize all incoming payloads.
- Add rate limiting for login, registration, and high-traffic search routes.
- Return generic authentication errors to avoid user enumeration.

## Data protection

- Store secrets in environment variables and secret managers.
- Apply least-privilege database credentials.
- Minimize precision of shared location data where exact coordinates are unnecessary.

## Transport and infra

- Enforce HTTPS in production.
- Restrict CORS origins to trusted frontend domains.
- Keep dependency versions updated and patch known vulnerabilities promptly.

## Monitoring and response

- Log authentication failures and suspicious activity.
- Add health checks for backend and ML service.
- Define basic incident response steps (detect, contain, recover, review).
