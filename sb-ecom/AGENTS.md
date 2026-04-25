# AGENTS.md - Spring Boot E-Commerce Project

## Project Overview

**sb-ecom** is a Spring Boot 3.5.3 REST API for a multi-user e-commerce platform supporting three user roles: CUSTOMER, SELLER, and ADMIN. It features product catalogs, shopping carts, orders with Stripe payment integration, and role-based access control.

**Tech Stack:** Java 21, Spring Boot 3, Spring Security (JWT), Spring Data JPA, PostgreSQL, Stripe API, Lombok, ModelMapper, SpringDoc OpenAPI (Swagger)

---

## Architecture Patterns

### Layered Architecture (Controller → Service → Repository)

The application follows strict separation of concerns:

- **Controllers** (`/controller`): HTTP endpoints with `@RestController`, input validation via `@Valid`
- **Services** (`/service`): Interfaces with `Impl` implementations. All business logic lives here (queries, transformations, validations)
- **Repositories** (`/repositories`): Spring Data JPA interfaces extending `JpaRepository` (no custom implementations needed)
- **Models** (`/model`): JPA `@Entity` classes with Lombok annotations (`@Data`, `@NoArgsConstructor`, `@AllArgsConstructor`)

**Key Pattern:** Service interfaces are always used (`ProductService` interface → `ProductServiceImpl` implementation). Always inject the interface type.

### DTOs and Data Transfer

- Request/Response objects live in `/payload` directory (e.g., `ProductDTO`, `ProductResponse`, `OrderRequestDTO`)
- Use `ModelMapper` to convert between entity models and DTOs (not manual mapping)
- Pagination response pattern: `ProductResponse`, `OrderResponse`, `AnalyticsResponse` contain paginated data + metadata

### Exception Handling

- Custom exceptions: `ResourceNotFoundException` (404), `APIException` (400)
- Global handler: `MyGlobalExceptionHandler` with `@RestControllerAdvice` maps exceptions to `APIResponse` objects
- All API errors return consistent JSON: `{"message": "...", "success": false}`

---

## Critical Business Rules & Domain Knowledge

### Role-Based Access Control (Security)

Three roles defined in `/security/WebSecurityConfig.java`:

- **ROLE_USER**: Regular customers (default role on signup)
- **ROLE_SELLER**: Can list products, view seller analytics
- **ROLE_ADMIN**: Can manage categories, view all orders, access admin endpoints

Endpoints use `@RequestMapping("/api/admin/**")` and `@RequestMapping("/api/seller/**")` with role enforcement in `WebSecurityConfig.filterChain()`. JWT tokens (HS256) are validated on every request by `AuthTokenFilter`.

### Order Lifecycle

Order statuses (defined in `AppConstants`): `PENDING` → `CONFIRMED` → `SHIPPED` → `DELIVERED` or `CANCELLED`

Payment integration via **Stripe API** (`StripeService`, `StripeServiceImpl`):
- `/api/order/stripe-webhook` endpoint handles webhook callbacks (permit all, signature verified)
- Payment success updates order status, inventory adjusts

### Product Model Relationships

- `Product` has `@ManyToOne` relationship to `Category` and `User` (seller)
- Cascade behavior: `CascadeType.PERSIST, CascadeType.MERGE` for related entities
- Discount applied as: `specialPrice = price - (price * discount)`

### Search & Filtering Patterns

`ProductService.getAllProducts()` example shows standard pattern:

```java
// Signature includes pagination + optional filters
ProductResponse getAllProducts(Integer pageNumber, Integer pageSize, String sortBy, String sortOrder, String keyword, String category);

// Default values in AppConstants: PAGE_NUMBER="0", PAGE_SIZE="10", SORT_DIR="asc"
```

---

## Configuration & Environment

### Database

- **Driver:** PostgreSQL (H2 in-memory commented out)
- **URL:** `spring.datasource.url=${DB_URL:jdbc:postgresql://localhost:5432/ecommerce}`
- **Auto-schema:** `spring.jpa.hibernate.ddl-auto=update` (creates tables on startup)
- **Credentials:** Username/password from environment variables (dev defaults in `application.properties`)

### Authentication

- **JWT Secret:** 256-bit HS256 key from environment variable `JWT_SECRET` (if not set, auto-generated on startup)
- **Expiration:** `JWT_EXPIRATION_MS=${JWT_EXPIRATION_MS:300000000}` (~3.5 days default)
- **Cookie Name:** `springBootEcom` for token storage

### External Services

- **Stripe:** Secret key from `stripe.secret.key` environment variable
- **Frontend URL:** `${FRONTEND_URL:http://localhost:5173/}` (for CORS)
- **Image Base URL:** `${IMAGE_BASE_URL:http://localhost:8080/images}` (local file serving)

---

## Common Development Workflows

### Build & Run

```bash
mvn clean package              # Build with tests
mvn spring-boot:run           # Start development server (port 8080)
mvn test                       # Run all tests
```

### Database Initialization

On first startup, `WebSecurityConfig.CommandLineRunner` initializes:
- Three default roles (USER, SELLER, ADMIN)
- Three test users: `user1`, `seller1`, `admin` (passwords in code - change in production)

### Testing

Test classes in `/src/test/java/com/ecommerce/project/` use Spring Test framework. Example: `SbEcomApplicationTests.java`

### Debugging Tips

- Enable SQL logging: Uncomment `spring.jpa.show-sql=true` in `application.properties`
- Enable security debugging: `logging.level.org.springframework.security=DEBUG`
- View OpenAPI docs at `/swagger-ui.html` after startup

---

## Adding New Features: Template Example

**Scenario:** Add a new "Coupon" feature

1. **Create Model** (`/model/Coupon.java`): JPA entity with Lombok
2. **Create Repository** (`/repositories/CouponRepository.java`): Extend `JpaRepository<Coupon, Long>`
3. **Create DTOs** (`/payload/CouponDTO.java`): Request/response objects
4. **Create Service Interface** (`/service/CouponService.java`): Define public methods
5. **Create Service Implementation** (`/service/CouponServiceImpl.java`): Inject repository + use ModelMapper
6. **Create Controller** (`/controller/CouponController.java`): Inject service, add `@RequestMapping` endpoints
7. **Update Security** (`/security/WebSecurityConfig.java`): Add role-based path in `filterChain()`

Always use constructor injection `@Autowired` (avoid field injection in new code).

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `pom.xml` | Maven dependencies (Stripe, JWT, ModelMapper, Lombok) |
| `/security/WebSecurityConfig.java` | JWT config, role definitions, endpoint security rules |
| `/config/AppConstants.java` | Pagination defaults, order statuses |
| `/exceptions/MyGlobalExceptionHandler.java` | Exception-to-response mapping |
| `/repositories/*` | Data access layer (Spring Data JPA) |
| `application.properties` | Environment variable defaults |

---

## Project-Specific Conventions

1. **Naming:** Use full descriptive names (e.g., `addProduct`, not `add`)
2. **Pagination:** Always return `PageResponse` objects with content, pageNumber, pageSize, totalPages
3. **Timestamps:** Entities auto-handle via JPA (createdAt, updatedAt implicit where needed)
4. **Field Validation:** Use `@NotBlank`, `@Size`, `@Valid` in controllers and models
5. **API Paths:** `/api/admin/**` for admin, `/api/seller/**` for seller, `/api/public/**` for public
6. **Response Pattern:** All endpoints return `ResponseEntity<DTO>` with appropriate HTTP status (201 for created, 200 for success, 404 for not found)

---

## Integration Points

- **Stripe Webhook:** POST `/api/order/stripe-webhook` (no auth required) - updates order payment status
- **CORS:** Enabled for `FRONTEND_URL` (see `WebMvcConfig`)
- **Image Upload:** Products store image filenames; files saved to `/images` directory
- **JWT Token Validation:** Every request (except public endpoints) validated by `AuthTokenFilter` before reaching controllers

---

## Current Limitations & Future Considerations

- Password reset flow not implemented
- No email notifications for order status changes
- Analytics endpoint exists but features may be limited
- Cart is per-session (not persisted for inactive users)
- File upload lacks virus scanning

