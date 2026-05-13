package com.ecommerce.project;

import com.ecommerce.project.model.Category;
import com.ecommerce.project.model.Cart;
import com.ecommerce.project.model.CartItem;
import com.ecommerce.project.model.Coupon;
import com.ecommerce.project.model.Order;
import com.ecommerce.project.model.OrderItem;
import com.ecommerce.project.model.Payment;
import com.ecommerce.project.model.Product;
import com.ecommerce.project.model.ProductStatus;
import com.ecommerce.project.model.User;
import com.ecommerce.project.repositories.CartItemRepository;
import com.ecommerce.project.repositories.CartRepository;
import com.ecommerce.project.repositories.CategoryRepository;
import com.ecommerce.project.repositories.CouponRepository;
import com.ecommerce.project.repositories.OrderItemRepository;
import com.ecommerce.project.repositories.OrderRepository;
import com.ecommerce.project.repositories.PaymentRepository;
import com.ecommerce.project.repositories.ProductRepository;
import com.ecommerce.project.repositories.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class MarketplaceWorkflowIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CouponRepository couponRepository;

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Test
    void authUserEndpointRequiresAuthentication() throws Exception {
        mockMvc.perform(get("/api/auth/user"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void loginResponseIncludesSellerProfileFields() throws Exception {
        Map<String, String> loginRequest = new HashMap<>();
        loginRequest.put("username", "seller1");
        loginRequest.put("password", "password2");

        mockMvc.perform(post("/api/auth/signin")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(header().exists("Set-Cookie"))
                .andExpect(jsonPath("$.username").value("seller1"))
                .andExpect(jsonPath("$.roles[0]").value("ROLE_SELLER"))
                .andExpect(jsonPath("$.storeName").value("Seller One"))
                .andExpect(jsonPath("$.sellerApproved").value(true))
                .andExpect(jsonPath("$.sellerActive").value(true));
    }

    @Test
    @WithMockUser(username = "user1", roles = "USER")
    void sellerProfileEndpointRejectsNonSellerUsers() throws Exception {
        Map<String, String> updateRequest = new HashMap<>();
        updateRequest.put("storeName", "Buyer Store");
        updateRequest.put("storeDescription", "This should not be allowed for a customer account.");

        mockMvc.perform(put("/api/seller/profile")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "seller1", roles = "SELLER")
    void sellerProfileEndpointAllowsSellerAndReturnsUpdatedFields() throws Exception {
        Map<String, String> updateRequest = new HashMap<>();
        updateRequest.put("storeName", "Seller One Updated");
        updateRequest.put("storeDescription", "Updated store description for seller profile management.");

        mockMvc.perform(put("/api/seller/profile")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("seller1"))
                .andExpect(jsonPath("$.roles[0]").value("ROLE_SELLER"))
                .andExpect(jsonPath("$.storeName").value("Seller One Updated"))
                .andExpect(jsonPath("$.storeDescription").value("Updated store description for seller profile management."));
    }

    @Test
    @WithMockUser(username = "user1", roles = "USER")
    void reviewEligibilityAllowsBuyerAfterSuccessfulPurchaseEvenIfOrderIsPending() throws Exception {
        User buyer = userRepository.findByUserName("user1").orElseThrow();
        User seller = userRepository.findByUserName("seller1").orElseThrow();

        Category category = new Category();
        category.setCategoryName("Laptops");
        category = categoryRepository.save(category);

        Product product = new Product();
        product.setProductName("Test Laptop");
        product.setDescription("High performance testing laptop");
        product.setImage("default.png");
        product.setQuantity(8);
        product.setPrice(50000);
        product.setDiscount(10);
        product.setSpecialPrice(45000);
        product.setDeleted(false);
        product.setProductStatus(ProductStatus.ACTIVE);
        product.setCategory(category);
        product.setUser(seller);
        product = productRepository.save(product);

        Payment payment = new Payment("online", "pi_test_paid", "succeeded", "Payment verified with Stripe", "Stripe");
        payment = paymentRepository.save(payment);

        Order order = new Order();
        order.setEmail(buyer.getEmail());
        order.setOrderDate(LocalDate.now());
        order.setTotalAmount(45000.0);
        order.setOrderStatus("PENDING");
        order.setPayment(payment);
        order = orderRepository.save(order);

        payment.setOrder(order);
        paymentRepository.save(payment);

        OrderItem orderItem = new OrderItem();
        orderItem.setOrder(order);
        orderItem.setProduct(product);
        orderItem.setQuantity(1);
        orderItem.setDiscount(10);
        orderItem.setOrderedProductPrice(45000.0);
        orderItemRepository.save(orderItem);

        mockMvc.perform(get("/api/products/{productId}/reviews/eligibility", product.getProductId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.canReview").value(true))
                .andExpect(jsonPath("$.alreadyReviewed").value(false));
    }

    @Test
    @WithMockUser(username = "user1", roles = "USER")
    void applyingCouponUpdatesCartTotalsForBuyer() throws Exception {
        User buyer = userRepository.findByUserName("user1").orElseThrow();
        User seller = userRepository.findByUserName("seller1").orElseThrow();

        Category category = new Category();
        category.setCategoryName("Phones");
        category = categoryRepository.save(category);

        Product product = new Product();
        product.setProductName("Flagship Phone");
        product.setDescription("Testing coupon discount calculation");
        product.setImage("default.png");
        product.setQuantity(10);
        product.setPrice(1000);
        product.setDiscount(10);
        product.setSpecialPrice(900);
        product.setDeleted(false);
        product.setProductStatus(ProductStatus.ACTIVE);
        product.setCategory(category);
        product.setUser(seller);
        product = productRepository.save(product);

        Cart cart = new Cart();
        cart.setUser(buyer);
        cart.setTotalPrice(1800.0);
        cart.setDiscountAmount(0.0);
        cart = cartRepository.save(cart);

        CartItem cartItem = new CartItem();
        cartItem.setCart(cart);
        cartItem.setProduct(product);
        cartItem.setQuantity(2);
        cartItem.setDiscount(product.getDiscount());
        cartItem.setProductPrice(product.getSpecialPrice());
        cartItemRepository.save(cartItem);
        cart.getCartItems().add(cartItem);

        Coupon coupon = new Coupon();
        coupon.setCode("SAVE10");
        coupon.setDescription("Ten percent off");
        coupon.setDiscountPercentage(10.0);
        coupon.setMinimumOrderAmount(500.0);
        coupon.setActive(true);
        couponRepository.save(coupon);

        Map<String, String> request = new HashMap<>();
        request.put("code", "SAVE10");

        mockMvc.perform(post("/api/carts/users/cart/coupon")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.appliedCouponCode").value("SAVE10"))
                .andExpect(jsonPath("$.subtotalPrice").value(1800.0))
                .andExpect(jsonPath("$.discountAmount").value(180.0))
                .andExpect(jsonPath("$.totalPrice").value(1620.0));
    }
}
