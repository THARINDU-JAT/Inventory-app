# Product API

Spring Boot 3 + JPA + MySQL CRUD API with Swagger UI.

## Requirements
JDK 17+, Maven 3.9+, MySQL 8

## Setup
1. Run `src/main/resources/schema.sql.example` in MySQL (creates DB and user).
2. Optionally set env vars: `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `CORS_ORIGINS`.
3. Start the app: `mvn spring-boot:run`
4. Swagger UI: http://localhost:8080/swagger-ui.html
5. Tests: `mvn test`

## Profiles
- `dev` (default): ddl-auto=update, SQL logging, Swagger on
- `prod`: ddl-auto=validate, Swagger off. Run with `--spring.profiles.active=prod`

## Endpoints
| Method | Path | Description |
|--------|------|-------------|
| GET | /api/v1/products?page=0&size=10&sort=id,desc | List (paginated) |
| GET | /api/v1/products/{id} | Get one |
| POST | /api/v1/products | Create |
| PUT | /api/v1/products/{id} | Update |
| DELETE | /api/v1/products/{id} | Delete |
