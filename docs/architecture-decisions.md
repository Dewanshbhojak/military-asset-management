# Architecture Decisions Record (ADR)

## 1. Monorepo Microservices Architecture
**Context**: We need a clean, manageable setup for a 2-day deadline while maintaining strict microservice boundaries.
**Decision**: Store all services in a single git repository (monorepo) with isolated Maven modules:
- `auth-service`
- `asset-service`
- `transaction-service`
- `audit-service`
- `api-gateway`

## 2. Database Ownership & Zero Cross-Service Foreign Keys
**Context**: Direct database linkage between microservices causes tight coupling and violates microservice autonomy.
**Decision**: Each microservice exclusively owns its database schema:
- `auth_db` owned by Auth Service
- `asset_db` owned by Asset Service
- `transaction_db` owned by Transaction Service
- `audit_db` owned by Audit Service

Cross-service entity relationships store primitive identifiers (`baseId`, `equipmentId`, `createdBy`) rather than `@ManyToOne` or `@OneToMany` JPA mappings.

## 3. JWT-Based Stateless Authentication & Security Context Propagation
**Context**: API Gateway routes requests to downstream services. Downstream services must enforce RBAC and Base-Level scope.
**Decision**: Auth Service issues signed JWT tokens containing:
- `userId`
- `email`
- `role` (`ADMIN`, `BASE_COMMANDER`, `LOGISTICS_OFFICER`)
- `baseId` (assigned military base ID)

Each service uses a shared JWT Secret key (`JWT_SECRET`) to parse and validate token claims locally. This avoids synchronous auth validation roundtrips to Auth Service on every request.

## 4. Asynchronous Event-Driven Inventory Sync & Audit Logging via RabbitMQ
**Context**: Transactions (purchases, transfers, assignments, expenditures) produce side-effects in Inventory (Asset Service) and Audit logs (Audit Service).
**Decision**:
- Transaction Service records business transactions and publishes events to RabbitMQ topic exchange `military.events`.
- Asset Service listens to `military.events` via queue `asset.inventory.queue` to update inventory quantities atomically.
- Audit Service listens to `military.events` via queue `audit.queue` to log system audit records.
- Idempotency is preserved by attaching a unique `eventId` (UUID) to every event.

## 5. Base-Level Scope Security Enforcements
**Context**: `BASE_COMMANDER` role must only view and modify data belonging to their assigned `baseId`.
**Decision**:
- Microservices inspect the authenticated user's `baseId` and `role`.
- If `role` is `BASE_COMMANDER` and `baseId` does not match the target resource's `baseId`, the request is rejected with HTTP `403 Forbidden`.
- `ADMIN` role bypasses base-level restrictions.
