package com.shopstack.shopstack.controller;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.shopstack.shopstack.dto.CheckoutRequest;
import com.shopstack.shopstack.model.Coupon;
import com.shopstack.shopstack.model.Order;
import com.shopstack.shopstack.model.User;
import com.shopstack.shopstack.repository.CouponRepository;
import com.shopstack.shopstack.repository.UserRepository;
import com.shopstack.shopstack.service.OrderService;
import com.shopstack.shopstack.service.PaymentService;
import com.shopstack.shopstack.dto.VendorOrderResponse;

@RestController
public class OrderController {

    private final OrderService orderService;
    private final UserRepository userRepository;
    private final CouponRepository couponRepository;
    private final PaymentService paymentService;

    public OrderController(OrderService orderService, UserRepository userRepository, CouponRepository couponRepository, PaymentService paymentService) {
        this.orderService = orderService;
        this.userRepository = userRepository;
        this.couponRepository = couponRepository;
        this.paymentService = paymentService;
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalStateException("Not authenticated");
        }
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    @PostMapping("/api/orders/create-payment-session")
    public ResponseEntity<?> createPaymentSession(@Validated @RequestBody CheckoutRequest request) {
        try {
            BigDecimal finalAmount = orderService.calculateOrderTotal(request);
            Map<String, Object> session = paymentService.createRazorpayOrder(finalAmount);
            return ResponseEntity.ok(session);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/api/orders/checkout")
    public ResponseEntity<?> checkout(@Validated @RequestBody CheckoutRequest request) {
        try {
            User user = getCurrentUser();
            Order order = orderService.placeOrder(user, request);
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/api/orders/my-orders")
    public ResponseEntity<?> getMyOrders() {
        try {
            User user = getCurrentUser();
            List<Order> orders = orderService.getOrdersByUser(user);
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/api/orders/{id}")
    public ResponseEntity<?> getOrderById(@PathVariable("id") UUID id) {
        try {
            User user = getCurrentUser();
            Order order = orderService.getOrderById(id, user);
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/api/orders/{id}/status")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable("id") UUID id,
            @RequestBody Map<String, Object> request) {
        try {
            User user = getCurrentUser();
            String status = (String) request.get("status");
            if (status == null || status.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Status is required"));
            }
            Order updated = orderService.updateOrderStatus(id, status, user);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/api/vendor/orders")
    public ResponseEntity<?> getVendorOrders() {
        try {
            User user = getCurrentUser();
            List<VendorOrderResponse> orders = orderService.getOrdersForVendor(user);
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/api/admin/orders")
    public ResponseEntity<?> getAdminOrders() {
        try {
            User user = getCurrentUser();
            if (user.getRole() != com.shopstack.shopstack.model.Role.ADMIN) {
                return ResponseEntity.status(403).body(Map.of("error", "Forbidden: Admin access required"));
            }
            List<Order> orders = orderService.getAllOrders();
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/api/coupons/validate/{code}")
    public ResponseEntity<?> validateCoupon(@PathVariable("code") String code) {
        try {
            Coupon coupon = couponRepository.findByCodeIgnoreCaseAndActiveTrue(code)
                    .orElseThrow(() -> new IllegalArgumentException("Invalid or inactive coupon code!"));
            if (coupon.getExpiryDate().isBefore(LocalDateTime.now())) {
                throw new IllegalArgumentException("Coupon code has expired!");
            }
            return ResponseEntity.ok(Map.of(
                    "code", coupon.getCode(),
                    "discountType", coupon.getDiscountType(),
                    "discountValue", coupon.getDiscountValue()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}