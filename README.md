# Distributed Military Asset Management System (Day 1 MVP)

A high-performance, event-driven distributed system for managing military bases, equipment catalog, real-time inventory, purchases, inter-base transfers, personnel assignments, and audit logging.

---

## 1. System Architecture

```text
                               React Frontend (Day 2)
                                         |
                                         v
                                  API Gateway :8080
                                         |
          +------------------------------+------------------------------+
          |                              |                              |
          v                              v                              v
   Auth Service                    Asset Service               Transaction Service
      :8081                            :8082                          :8083
          |                              |                              |
       auth_db                        asset_db                     transaction_db
                                         |
                                         +------------------+
                                                            |
                                                         RabbitMQ :5672
                                                            |
                                                            v
                                                      Audit Service
                                                         :8084
                                                            |
                                                         audit_db
```

---

## 2. Microservice Ownership & Ports

| Microservice | Port | Database | Primary Function |
|---|---|---|---|
| **API Gateway** | `8080` | None | Unified routing, CORS management, token forwarding |
| **Auth Service** | `8081` | `auth_db` | Authentication, BCrypt password hashing, JWT creation & User management |
| **Asset Service** | `8082` | `asset_db` | Base management, Equipment catalog & Base stock inventory tracking |
| **Transaction Service** | `8083` | `transaction_db` | Purchases, Inter-base transfers, Personnel assignments & Expenditures |
| **Audit Service** | `8084` | `audit_db` | Async event consumption & System-wide audit log query/filtering |
| **MySQL** | `3306` | Multi-DB | Microservice isolated schemas (`auth_db`, `asset_db`, `transaction_db`, `audit_db`) |
| **RabbitMQ** | `5672` / `15672` | AMQP | Event bus with topic exchange `military.events` |

---

## 3. Technology Stack

- **Java**: 17
- **Framework**: Spring Boot 3.2.5
- **Security**: Spring Security & JWT (`jjwt` 0.11.5)
- **Database**: MySQL 8.0 & Spring Data JPA
- **Messaging**: RabbitMQ (Spring AMQP)
- **Gateway**: Spring Cloud Gateway (Spring Cloud 2023.0.1)
- **Containerization**: Docker & Docker Compose

---

## 4. Default Credentials & Test Users

| Role | Email | Password | Assigned Base ID | Scope |
|---|---|---|---|---|
| **ADMIN** | `admin@military.com` | `Admin@123` | `null` | Global Access |
| **BASE_COMMANDER** | `commander.alpha@military.com` | `Commander@123` | `1` (Alpha Base) | Base 1 Only |
| **BASE_COMMANDER** | `commander.bravo@military.com` | `Commander@123` | `2` (Bravo Base) | Base 2 Only |
| **LOGISTICS_OFFICER** | `logistics@military.com` | `Logistics@123` | `1` | Logistics Access |

---

## 5. Event-Driven Inventory Sync & Idempotency

When a transaction is created in **Transaction Service**, a JSON event is published to RabbitMQ topic exchange `military.events`:

1. `PURCHASE_CREATED` (`purchase.created`) -> Asset Service increases target base inventory stock.
2. `TRANSFER_CREATED` (`transfer.created`) -> Asset Service decreases source base stock and increases destination base stock atomically.
3. `ASSIGNMENT_CREATED` (`assignment.created`) -> Asset Service decreases target base inventory stock.
4. `EXPENDITURE_CREATED` (`expenditure.created`) -> Asset Service decreases target base inventory stock.
5. `Audit Service` consumes all events from queue `audit.queue` (routing key `#`) and writes persistent audit records to `audit_db`.

**Idempotency Protection**: Each event carries a unique `eventId` UUID. `Asset Service` tracks processed events in `processed_events` table to prevent double-processing.

---

## 6. How to Run

### Infrastructure (MySQL & RabbitMQ)

```bash
docker compose up -d mysql rabbitmq
```

- **MySQL**: `localhost:3306` (User: `root`, Password: `root`)
- **RabbitMQ UI**: `http://localhost:15672` (User: `guest`, Password: `guest`)

### Run All Backend Services via Docker Compose

```bash
docker compose up --build
```

### Run Services Locally via Maven

```bash
# 1. Auth Service
cd auth-service && mvn spring-boot:run

# 2. Asset Service
cd asset-service && mvn spring-boot:run

# 3. Transaction Service
cd transaction-service && mvn spring-boot:run

# 4. Audit Service
cd audit-service && mvn spring-boot:run

# 5. API Gateway
cd api-gateway && mvn spring-boot:run
```

---

## 7. Critical Business Flow Demonstration

Execute requests via API Gateway (`http://localhost:8080`):

1. **Login as Admin**:
   - `POST /api/auth/login` with `{"email": "admin@military.com", "password": "Admin@123"}` -> Receive JWT token.
2. **Retrieve Seeded Bases**:
   - `GET /api/bases` (Returns Alpha Base ID 1, Bravo Base ID 2, Charlie Base ID 3).
3. **Retrieve Seeded Equipment**:
   - `GET /api/equipment` (Returns Rifle ID 1, Tank ID 2, Ammunition ID 3).
4. **View Base A Stock**:
   - `GET /api/inventory/1` (Alpha Base Rifle stock = 100).
5. **Purchase 50 Rifles for Base A**:
   - `POST /api/purchases` with `{"baseId": 1, "equipmentId": 1, "quantity": 50}`.
   - `PURCHASE_CREATED` event published -> Base A inventory increases to 150.
6. **Transfer 20 Rifles from Base A to Base B**:
   - `POST /api/transfers` with `{"fromBaseId": 1, "toBaseId": 2, "equipmentId": 1, "quantity": 20}`.
   - `TRANSFER_CREATED` event published -> Base A inventory becomes 130, Base B inventory becomes 70.
7. **Assign 10 Rifles to Personnel**:
   - `POST /api/assignments` with `{"baseId": 1, "equipmentId": 1, "personnelName": "Capt. Vikram Batra", "quantity": 10}`.
8. **Record Expenditure**:
   - `POST /api/expenditures` with `{"baseId": 1, "equipmentId": 1, "quantity": 5, "reason": "Firing range training"}`.
9. **Query Audit Logs**:
   - `GET /api/audit-logs` -> Shows all purchase, transfer, assignment, and expenditure audit records.

---

## 8. Postman Collection

Import `postman/military-asset-management.json` into Postman.

- Pre-configured environment variable: `baseUrl = http://localhost:8080`
- Automatically saves JWT token to collection variables on login!

---

## 9. Running Tests

```bash
# Run tests for all modules
mvn test
```
