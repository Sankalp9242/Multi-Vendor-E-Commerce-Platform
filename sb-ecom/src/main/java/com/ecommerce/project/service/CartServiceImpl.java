package com.ecommerce.project.service;

import com.ecommerce.project.exceptions.APIException;
import com.ecommerce.project.exceptions.ResourceNotFoundException;
import com.ecommerce.project.model.Cart;
import com.ecommerce.project.model.CartItem;
import com.ecommerce.project.model.Coupon;
import com.ecommerce.project.model.Product;
import com.ecommerce.project.model.ProductStatus;
import com.ecommerce.project.payload.CartDTO;
import com.ecommerce.project.payload.CartItemDTO;
import com.ecommerce.project.payload.ProductDTO;
import com.ecommerce.project.repositories.CartItemRepository;
import com.ecommerce.project.repositories.CartRepository;
import com.ecommerce.project.repositories.CouponRepository;
import com.ecommerce.project.repositories.ProductRepository;
import com.ecommerce.project.util.AuthUtil;
import jakarta.transaction.Transactional;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
public class CartServiceImpl implements CartService{
    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private AuthUtil authUtil;

    @Autowired
    ProductRepository productRepository;

    @Autowired
    CartItemRepository cartItemRepository;

    @Autowired
    CouponRepository couponRepository;

    @Autowired
    ModelMapper modelMapper;

    @Override
    public CartDTO addProductToCart(Long productId, Integer quantity) {
        Cart cart  = createCart();

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "productId", productId));

        validateCartItemRequest(product, quantity);

        CartItem cartItem = cartItemRepository.findCartItemByProductIdAndCartId(cart.getCartId(), productId);

        if (cartItem != null) {
            throw new APIException("Product " + product.getProductName() + " already exists in the cart");
        }

        CartItem newCartItem = new CartItem();

        newCartItem.setProduct(product);
        newCartItem.setCart(cart);
        newCartItem.setQuantity(quantity);
        newCartItem.setDiscount(product.getDiscount());
        newCartItem.setProductPrice(product.getSpecialPrice());

        cartItemRepository.save(newCartItem);
        cart.getCartItems().add(newCartItem);
        recalculateCart(cart);
        cartRepository.save(cart);
        return mapCartToDto(cart);
    }

    @Override
    public List<CartDTO> getAllCarts() {
        List<Cart> carts = cartRepository.findAll();

        if (carts.size() == 0) {
            throw new APIException("No cart exists");
        }

        return carts.stream()
                .peek(this::recalculateCart)
                .map(this::mapCartToDto)
                .collect(Collectors.toList());
    }

    @Override
    public CartDTO getCart(String emailId, Long cartId) {
        Cart cart = cartRepository.findCartByEmailAndCartId(emailId, cartId);
        if (cart == null){
            throw new ResourceNotFoundException("Cart", "cartId", cartId);
        }
        recalculateCart(cart);
        cartRepository.save(cart);
        return mapCartToDto(cart);
    }

    @Override
    public CartDTO getLoggedInUserCart() {
        String emailId = authUtil.loggedInEmail();
        Cart cart = cartRepository.findCartByEmail(emailId);
        if (cart == null) {
            throw new ResourceNotFoundException("Cart", "email", emailId);
        }
        recalculateCart(cart);
        cartRepository.save(cart);
        return mapCartToDto(cart);
    }

    @Transactional
    @Override
    public CartDTO updateProductQuantityInCart(Long productId, Integer quantity) {

        String emailId = authUtil.loggedInEmail();
        Cart userCart = cartRepository.findCartByEmail(emailId);
        if (userCart == null) {
            throw new ResourceNotFoundException("Cart", "email", emailId);
        }
        Long cartId  = userCart.getCartId();

        Cart cart = cartRepository.findById(cartId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart", "cartId", cartId));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "productId", productId));

        CartItem cartItem = cartItemRepository.findCartItemByProductIdAndCartId(cartId, productId);

        if (cartItem == null) {
            throw new APIException("Product " + product.getProductName() + " not available in the cart!!!");
        }

        // Calculate new quantity
        int newQuantity = cartItem.getQuantity() + quantity;

        // Validation to prevent negative quantities
        if (newQuantity < 0) {
            throw new APIException("The resulting quantity cannot be negative.");
        }

        if (newQuantity > 0 && product.getQuantity() < newQuantity) {
            throw new APIException("Please, make an order of the " + product.getProductName()
                    + " less than or equal to the quantity " + product.getQuantity() + ".");
        }

        if (newQuantity == 0){
            cartItemRepository.delete(cartItem);
            cart.getCartItems().removeIf(item -> item.getProduct().getProductId().equals(productId));
        } else {
            cartItem.setProductPrice(product.getSpecialPrice());
            cartItem.setQuantity(newQuantity);
            cartItem.setDiscount(product.getDiscount());
            cartItemRepository.save(cartItem);
        }

        recalculateCart(cart);
        cartRepository.save(cart);
        return mapCartToDto(cart);
    }


    private Cart createCart() {
        Cart userCart  = cartRepository.findCartByEmail(authUtil.loggedInEmail());
        if(userCart != null){
            return userCart;
        }

        Cart cart = new Cart();
        cart.setTotalPrice(0.00);
        cart.setDiscountAmount(0.00);
        cart.setUser(authUtil.loggedInUser());
        Cart newCart =  cartRepository.save(cart);

        return newCart;
    }


    @Transactional
    @Override
    public String deleteProductFromCart(Long cartId, Long productId) {
        Cart cart = cartRepository.findById(cartId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart", "cartId", cartId));

        CartItem cartItem = cartItemRepository.findCartItemByProductIdAndCartId(cartId, productId);

        if (cartItem == null) {
            throw new ResourceNotFoundException("Product", "productId", productId);
        }

        cartItemRepository.deleteCartItemByProductIdAndCartId(cartId, productId);
        cart.getCartItems().removeIf(item -> item.getProduct().getProductId().equals(productId));
        recalculateCart(cart);
        cartRepository.save(cart);

        return "Product " + cartItem.getProduct().getProductName() + " removed from the cart !!!";
    }

    @Transactional
    @Override
    public String deleteProductFromLoggedInCart(Long productId) {
        String emailId = authUtil.loggedInEmail();
        Cart cart = cartRepository.findCartByEmail(emailId);
        if (cart == null) {
            throw new ResourceNotFoundException("Cart", "email", emailId);
        }

        return deleteProductFromCart(cart.getCartId(), productId);
    }


    @Override
    public void updateProductInCarts(Long cartId, Long productId) {
        Cart cart = cartRepository.findById(cartId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart", "cartId", cartId));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "productId", productId));

        CartItem cartItem = cartItemRepository.findCartItemByProductIdAndCartId(cartId, productId);

        if (cartItem == null) {
            throw new APIException("Product " + product.getProductName() + " not available in the cart!!!");
        }

        cartItem.setProductPrice(product.getSpecialPrice());
        cartItemRepository.save(cartItem);
        recalculateCart(cart);
        cartRepository.save(cart);
    }

    @Transactional
    @Override
    public String createOrUpdateCartWithItems(List<CartItemDTO> cartItems) {
        if (cartItems == null || cartItems.isEmpty()) {
            throw new APIException("Cart items cannot be empty");
        }

        // Get user's email
        String emailId = authUtil.loggedInEmail();

        // Check if an existing cart is available or create a new one
        Cart existingCart = cartRepository.findCartByEmail(emailId);
        if (existingCart == null) {
            existingCart = new Cart();
            existingCart.setTotalPrice(0.00);
            existingCart.setUser(authUtil.loggedInUser());
            existingCart = cartRepository.save(existingCart);
        } else {
            // Clear all current items in the existing cart
            cartItemRepository.deleteAllByCartId(existingCart.getCartId());
            existingCart.getCartItems().clear();
        }

        // Process each item in the request to add to the cart
        for (CartItemDTO cartItemDTO : cartItems) {
            Long productId = cartItemDTO.getProductId();
            Integer quantity = cartItemDTO.getQuantity();

            // Find the product by ID
            Product product = productRepository.findById(productId)
                    .orElseThrow(() -> new ResourceNotFoundException("Product", "productId", productId));

            validateCartItemRequest(product, quantity);

            // Create and save cart item
            CartItem cartItem = new CartItem();
            cartItem.setProduct(product);
            cartItem.setCart(existingCart);
            cartItem.setQuantity(quantity);
            cartItem.setProductPrice(product.getSpecialPrice());
            cartItem.setDiscount(product.getDiscount());
            cartItemRepository.save(cartItem);
            existingCart.getCartItems().add(cartItem);
        }

        recalculateCart(existingCart);
        cartRepository.save(existingCart);
        return "Cart created/updated with the new items successfully";
    }

    @Transactional
    @Override
    public CartDTO applyCouponToLoggedInCart(String couponCode) {
        Cart cart = getLoggedInCartEntity();
        if (cart.getCartItems().isEmpty()) {
            throw new APIException("Add products to the cart before applying a coupon");
        }

        Coupon coupon = validateCouponForSubtotal(couponCode, calculateSubtotal(cart));
        cart.setAppliedCouponCode(coupon.getCode());
        recalculateCart(cart);
        cartRepository.save(cart);
        return mapCartToDto(cart);
    }

    @Transactional
    @Override
    public CartDTO removeCouponFromLoggedInCart() {
        Cart cart = getLoggedInCartEntity();
        clearCoupon(cart);
        recalculateCart(cart);
        cartRepository.save(cart);
        return mapCartToDto(cart);
    }

    private void validateCartItemRequest(Product product, Integer quantity) {
        if (quantity == null || quantity <= 0) {
            throw new APIException("Quantity must be greater than 0");
        }

        if (product.getUser() == null) {
            throw new APIException("Product is not available");
        }

        if (product.getProductStatus() != ProductStatus.ACTIVE || Boolean.TRUE.equals(product.getDeleted())) {
            throw new APIException(product.getProductName() + " is not available");
        }

        if (product.getUser().getUserId().equals(authUtil.loggedInUserId())) {
            throw new APIException("You cannot purchase your own product: " + product.getProductName());
        }

        if (product.getQuantity() == 0) {
            throw new APIException(product.getProductName() + " is not available");
        }

        if (product.getQuantity() < quantity) {
            throw new APIException("Please, make an order of the " + product.getProductName()
                    + " less than or equal to the quantity " + product.getQuantity() + ".");
        }
    }

    private Cart getLoggedInCartEntity() {
        String emailId = authUtil.loggedInEmail();
        Cart cart = cartRepository.findCartByEmail(emailId);
        if (cart == null) {
            throw new ResourceNotFoundException("Cart", "email", emailId);
        }
        return cart;
    }

    private CartDTO mapCartToDto(Cart cart) {
        CartDTO cartDTO = modelMapper.map(cart, CartDTO.class);
        double subtotal = calculateSubtotal(cart);
        cartDTO.setSubtotalPrice(subtotal);
        cartDTO.setDiscountAmount(defaultDouble(cart.getDiscountAmount()));
        cartDTO.setAppliedCouponCode(cart.getAppliedCouponCode());

        List<ProductDTO> products = cart.getCartItems().stream()
                .map(item -> {
                    ProductDTO productDTO = modelMapper.map(item.getProduct(), ProductDTO.class);
                    productDTO.setQuantity(item.getQuantity());
                    return productDTO;
                })
                .collect(Collectors.toList());

        cartDTO.setProducts(products);
        return cartDTO;
    }

    private void recalculateCart(Cart cart) {
        double subtotal = calculateSubtotal(cart);
        double discountAmount = 0.0;

        if (cart.getAppliedCouponCode() != null && !cart.getAppliedCouponCode().isBlank()) {
            Coupon coupon = resolveCoupon(cart.getAppliedCouponCode());
            if (coupon == null || !isCouponApplicable(coupon, subtotal)) {
                clearCoupon(cart);
            } else {
                discountAmount = roundToTwoDecimals(subtotal * (coupon.getDiscountPercentage() / 100.0));
                cart.setAppliedCouponCode(coupon.getCode());
            }
        }

        cart.setDiscountAmount(discountAmount);
        cart.setTotalPrice(roundToTwoDecimals(Math.max(subtotal - discountAmount, 0.0)));
    }

    private double calculateSubtotal(Cart cart) {
        return roundToTwoDecimals(cart.getCartItems().stream()
                .mapToDouble(item -> item.getProductPrice() * item.getQuantity())
                .sum());
    }

    private Coupon validateCouponForSubtotal(String couponCode, double subtotal) {
        Coupon coupon = resolveCoupon(couponCode);
        if (coupon == null) {
            throw new APIException("Coupon code does not exist");
        }

        if (!Boolean.TRUE.equals(coupon.getActive())) {
            throw new APIException("Coupon is inactive");
        }

        if (coupon.getExpiryDate() != null && coupon.getExpiryDate().isBefore(LocalDate.now())) {
            throw new APIException("Coupon has expired");
        }

        if (subtotal < defaultDouble(coupon.getMinimumOrderAmount())) {
            throw new APIException("Cart total does not meet the minimum amount for this coupon");
        }

        return coupon;
    }

    private boolean isCouponApplicable(Coupon coupon, double subtotal) {
        if (coupon == null || !Boolean.TRUE.equals(coupon.getActive())) {
            return false;
        }

        if (coupon.getExpiryDate() != null && coupon.getExpiryDate().isBefore(LocalDate.now())) {
            return false;
        }

        return subtotal >= defaultDouble(coupon.getMinimumOrderAmount());
    }

    private Coupon resolveCoupon(String couponCode) {
        if (couponCode == null || couponCode.isBlank()) {
            return null;
        }

        return couponRepository.findByCodeIgnoreCase(couponCode.trim().toUpperCase(Locale.ROOT))
                .orElse(null);
    }

    private void clearCoupon(Cart cart) {
        cart.setAppliedCouponCode(null);
        cart.setDiscountAmount(0.0);
    }

    private double defaultDouble(Double value) {
        return value == null ? 0.0 : value;
    }

    private double roundToTwoDecimals(double value) {
        return Math.round(value * 100.0) / 100.0;
    }

}
