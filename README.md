💊 Pharmacy Management System
A web-based Full-Stack Pharmacy Management System developed using React.js, Java, Spring Boot, and MySQL. The application brings medicine inventory, customer purchases, order processing, delivery tracking, and administrative reporting into one system.

It combines a customer-facing shopping experience with an administrative dashboard and communicates through RESTful APIs. JWT-based authentication components and user roles are included to support customer and administrator workflows.
📌 Project Purpose
The main purpose of this system is to provide a centralized platform for pharmacy-related operations, including:
- Medicine registration and inventory management
- Medicine browsing, searching, and filtering
- Customer registration and login
- Shopping cart and order placement
- Sales and delivery status tracking
- Sales summaries and low-stock reporting
- Administrative monitoring and user management
The application aims to reduce manual record handling, simplify daily pharmacy operations, and provide an organized way to manage medicines and orders.
🛠️ Technology Stack
Backend
- Java 17
- Spring Boot 3.2
- Spring Web (REST APIs)
- Spring Data JPA / Hibernate
- Spring Security and JWT components
- Apache Maven
Frontend
- React.js 18
- JavaScript
- HTML5 and CSS3
- Tailwind CSS
- Vite
- React Router
- Axios
Database
- MySQL 8
Development Tools
- Git & GitHub
- Docker Compose (optional MySQL setup)
- Swagger / OpenAPI for API documentation
📂 System Modules
1. 👤 User Authentication & Management Module
Purpose
Handles account registration, login, and user administration.
Operations Supported
- Register a new customer account
- Log in to the application
- Use JWT-based authentication components
- Support customer and administrator roles
- View and manage users through administrative interfaces
Key Files
backend/src/main/java/com/example/pharmacy/controller/AuthController.java
backend/src/main/java/com/example/pharmacy/controller/UserController.java
backend/src/main/java/com/example/pharmacy/security/JwtUtil.java
frontend/src/pages/Login.jsx
frontend/src/pages/Register.jsx
frontend/src/context/AuthContext.jsx
2. 💊 Medicine & Inventory Management Module
Purpose
Maintains medicine details and monitors pharmacy stock.
Operations Supported
- Add new medicines
- View and search available medicines
- Filter products by available criteria
- Update medicine information
- Manage stock quantities and expiry information
- Identify medicines with low stock
Key Files
backend/src/main/java/com/example/pharmacy/controller/MedicineController.java
backend/src/main/java/com/example/pharmacy/service/MedicineService.java
backend/src/main/java/com/example/pharmacy/entity/Medicine.java
frontend/src/pages/Browse.jsx
frontend/src/pages/AdminPanel.jsx
3. 🛒 Shopping Cart & Order Management Module
Purpose
Allows customers to select medicines and place orders while keeping sales records.
Operations Supported
- Add products to a shopping cart
- Review selected items and quantities
- Create orders through the backend API
- Record sales and their associated items
- View and update sales status in administrative workflows
- Handle order cancellation in the backend
Key Files
frontend/src/pages/Cart.jsx
frontend/src/context/CartContext.jsx
backend/src/main/java/com/example/pharmacy/controller/SaleController.java
backend/src/main/java/com/example/pharmacy/service/SaleService.java
backend/src/main/java/com/example/pharmacy/entity/Sale.java
backend/src/main/java/com/example/pharmacy/entity/SaleItem.java
4. 🚚 Delivery Management Module
Purpose
Supports tracking and management of deliveries associated with orders.
Operations Supported
- Maintain delivery records
- View delivery information
- Update delivery status
- Support administrative tracking of order fulfillment
Key Files
backend/src/main/java/com/example/pharmacy/controller/DeliveryController.java
backend/src/main/java/com/example/pharmacy/service/DeliveryService.java
backend/src/main/java/com/example/pharmacy/entity/Delivery.java
backend/src/main/java/com/example/pharmacy/entity/DeliveryStatus.java
5. 📊 Sales Reporting Module
Purpose
Provides summaries that help administrators review sales and stock information.
Operations Supported
- Generate sales summary reports
- Generate low-stock reports
- View previously generated reports
- Filter reports by type
- Access report information through REST APIs
Key Files
backend/src/main/java/com/example/pharmacy/controller/ReportController.java
backend/src/main/java/com/example/pharmacy/service/ReportService.java
backend/src/main/java/com/example/pharmacy/entity/Report.java
frontend/src/pages/AdminPanel.jsx
6. 🧑‍💼 Administration Dashboard Module
Purpose
Provides a central interface for monitoring and managing pharmacy activities.
Operations Supported
- Manage medicines and inventory
- View users and sales records
- Update order statuses
- Monitor stock and sales information
- Access reporting features
Key Files
frontend/src/pages/AdminPanel.jsx
frontend/src/components/ProtectedRoute.jsx
backend/src/main/java/com/example/pharmacy/controller/UserController.java
backend/src/main/java/com/example/pharmacy/controller/MedicineController.java
🧩 System Architecture
The application follows a frontend–backend architecture:
1. React frontend: Displays the customer pages and administrative dashboard.
2. Spring Boot backend: Provides REST APIs and implements business logic.
3. MySQL database: Stores users, medicines, sales, deliveries, and reports.
4. JWT authentication components: Support sign-in and token-based requests.
5. Docker Compose: Optionally runs the MySQL database only for local development.
Main API Groups
Module	API Base Path
Authentication	/api/auth
Users	/api/users
Medicines	/api/medicines
Sales	/api/sales
Deliveries	/api/deliveries
Reports	/api/reports


🗂️ Project Folder Structure
pharmacy-management-system/
├── backend/
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/example/pharmacy/
│       │   ├── controller/
│       │   ├── service/
│       │   ├── repository/
│       │   ├── entity/
│       │   └── security/
│       └── resources/
│           ├── application.properties
│           ├── schema.sql
│           └── data.sql
├── docker/
│   └── docker-compose.yml
├── frontend/
│   ├── package.json
│   └── src/
│       ├── api/
│       ├── components/
│       ├── context/
│       └── pages/
└── README.md
⚙️ How to Run the Project
Prerequisites
- JDK 17 and Maven
- Node.js and npm
- MySQL 8 or Docker Desktop
1. Configure the database
Create a MySQL database named pharmacydb, then import the SQL schema from backend/src/main/resources/schema.sql.
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS pharmacydb;"
mysql -u root -p pharmacydb < backend/src/main/resources/schema.sql
The data.sql file contains optional sample data for local testing.

Docker option: To run MySQL in a container, set a password and run:
export MYSQL_ROOT_PASSWORD='choose-a-local-password'
docker compose -f docker/docker-compose.yml up -d
The included Docker Compose file creates a database named pharmacy, not pharmacydb. When using Docker, point DB_URL to jdbc:mysql://localhost:3306/pharmacy and import the schema into that database. Docker Compose does not automatically start the frontend or backend.

2. Start the backend
Set your local database credentials and a unique JWT secret in the terminal:
export DB_URL='jdbc:mysql://localhost:3306/pharmacydb'
export DB_USERNAME='your_mysql_username'
export DB_PASSWORD='your_mysql_password'
export JWT_SECRET="$(openssl rand -base64 48)"
cd backend
mvn spring-boot:run
Backend URL: http://localhost:8081

Swagger UI (when the backend is running): http://localhost:8081/swagger-ui/index.html
3. Start the frontend
In a second terminal, from the project root:
cd frontend
npm install
npm run dev
Frontend URL: http://localhost:5173
Setup note: Database schema validation may report differences between the provided SQL schema and JPA entities. If that happens, align the local schema with the entities before continuing. The project has not been verified as a production deployment.

🎯 Learning Outcomes
This project demonstrates practical experience with:
- Building a full-stack web application
- Connecting a React frontend to Spring Boot REST APIs
- Using MySQL for relational data storage
- Designing layered backend code with controllers, services, and repositories
- Implementing JWT-related authentication functionality
- Developing administrative and customer interfaces
- Managing application configuration and local Docker services
🔒 Security & Usage Note
This repository is intended as a learning and portfolio project, not as a production-ready pharmacy system. Before any public deployment, strengthen role-based API authorization, validate inputs, restrict CORS, review handling of personal information, and configure secrets securely. Do not commit passwords, live credentials, or real customer data.
🚀 Future Improvements
- Improve authorization rules and security testing
- Add automated unit and integration tests
- Improve inventory validation and expiry notifications
- Introduce CI/CD and deployment workflows
- Enhance dashboards and reporting visualizations
Developed as a full-stack web development project using React, Spring Boot, and MySQL.
