# Pharmacy Management System

A full-stack pharmacy management web application built with **React**, **Spring Boot**, and **MySQL**. It combines a customer-facing medicine catalog and shopping cart with administrative workflows for medicine inventory, sales, deliveries, users, and reporting.

> **Portfolio / learning project.** Review authentication and authorization, input validation, CORS, and data protection before using it with real customers, prescriptions, or a public deployment.

## Features

- User registration and login with JWT-based authentication components
- Admin and customer roles
- Medicine browsing, search, filtering, and cart management
- Checkout and order creation
- Medicine and stock administration
- Sales and delivery tracking
- Administrative reporting, low-stock views, and data export features

## Tech stack

| Layer | Technologies |
| --- | --- |
| Frontend | React 18, Vite, React Router, Tailwind CSS, Axios |
| Backend | Java 17, Spring Boot 3.2, Spring Security, Spring Data JPA |
| Database | MySQL |
| API / authentication | REST endpoints, JWT |
| Developer tooling | Maven, Docker Compose (MySQL) |

## Project structure

```text
pharmacy-management-system/
├── backend/             # Spring Boot REST API and MySQL persistence
│   ├── pom.xml
│   └── src/main/
│       ├── java/
│       └── resources/
├── frontend/            # React application and assets
│   ├── package.json
│   └── src/
├── docker/              # Optional local MySQL service
├── .env.example         # Variable names and example values (not auto-loaded)
└── README.md
```

## Local setup

**Requirements:** Java 17, Maven, Node.js/npm, and MySQL 8 (or Docker for MySQL).

1. **Create a MySQL database.** The backend configuration defaults to a database named `pharmacydb` on port `3306`. Run `backend/src/main/resources/schema.sql` to initialize the schema; `data.sql` contains optional sample data. If schema and JPA entity definitions do not match, fix the schema or configure a development-only schema update before testing.
2. **Set environment variables** in the terminal where you will run the backend. These are required after removing embedded credentials from the public source:

   ```bash
   export DB_URL='jdbc:mysql://localhost:3306/pharmacydb'
   export DB_USERNAME='your_mysql_username'
   export DB_PASSWORD='your_mysql_password'
   export JWT_SECRET="$(openssl rand -base64 48)"
   ```

   On Windows, use your shell's equivalent syntax. Keep credentials outside Git. The `.env.example` file lists settings but is **not automatically loaded** by Spring Boot.
3. **Start the backend** from the `backend` directory:

   ```bash
   cd backend
   mvn spring-boot:run
   ```

   API defaults to **http://localhost:8081**. Swagger UI is available at `http://localhost:8081/swagger-ui/index.html` if the API starts successfully.
4. **Start the frontend** in a different terminal:

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

   Open **http://localhost:5173**. The frontend's Axios client currently points to `http://localhost:8081`.

**Optional Docker database:** `docker/docker-compose.yml` provisions a MySQL container. Set `MYSQL_ROOT_PASSWORD` in your environment and then run `docker compose -f docker/docker-compose.yml up -d`. The Compose database name is `pharmacy`, while the backend's default URL uses `pharmacydb`; configure `DB_URL` to match your chosen database before running.

## API overview

- Authentication: `/api/auth/*`
- Medicines: `/api/medicines/*`
- Users: `/api/users/*`
- Sales: `/api/sales/*`
- Deliveries: `/api/deliveries/*`
- Reports: `/api/reports/*`

## Screenshots

Add screenshots of the login page, medicine catalog, shopping cart, and admin dashboard here. Screenshots help visitors quickly understand what the system does.

## Security and project status

This repository is intended as a learning and portfolio demonstration, **not a production-ready pharmacy or e-commerce deployment**. In particular, review the URL access rules in `SecurityConfig.java`: some API path groups are currently permitted broadly even though individual methods may have role annotations. Tighten authorization, restrict CORS, validate and secure all order and delivery endpoints, review demo accounts, and remove sample/customer data before any live deployment. A unique JWT signing key must be supplied via the `JWT_SECRET` environment variable.

## Contributing

Suggestions and feedback are welcome. Do not commit secrets, personal data, build output, or `node_modules`.
