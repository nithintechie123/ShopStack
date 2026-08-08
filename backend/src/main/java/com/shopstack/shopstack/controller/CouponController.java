package com.shopstack.shopstack.controller;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.shopstack.shopstack.dto.CouponDTO;
import com.shopstack.shopstack.dto.CouponValidationResponse;
import com.shopstack.shopstack.model.Coupon;
import com.shopstack.shopstack.model.Role;
import com.shopstack.shopstack.model.User;
import com.shopstack.shopstack.repository.UserRepository;
import com.shopstack.shopstack.service.CouponService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class CouponController {

    private final CouponService couponService;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalStateException("Not authenticated");
        }
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    private void checkAdminAccess() {
        User user = getCurrentUser();
        if (user.getRole() != Role.ADMIN) {
            throw new IllegalStateException("Access denied: Admin role required");
        }
    }

    // ==========================================
    // ADMIN ENDPOINTS
    // ==========================================

    @GetMapping("/api/admin/coupons")
    public ResponseEntity<?> getAllCoupons() {
        try {
            checkAdminAccess();
            List<Coupon> coupons = couponService.getAllCoupons();
            return ResponseEntity.ok(coupons);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/api/admin/coupons/stats")
    public ResponseEntity<?> getCouponStats() {
        try {
            checkAdminAccess();
            return ResponseEntity.ok(couponService.getCouponStats());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/api/admin/coupons")
    public ResponseEntity<?> createCoupon(@Validated @RequestBody CouponDTO dto) {
        try {
            checkAdminAccess();
            Coupon created = couponService.createCoupon(dto);
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/api/admin/coupons/{id}")
    public ResponseEntity<?> updateCoupon(@PathVariable("id") UUID id, @Validated @RequestBody CouponDTO dto) {
        try {
            checkAdminAccess();
            Coupon updated = couponService.updateCoupon(id, dto);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PatchMapping("/api/admin/coupons/{id}/toggle")
    public ResponseEntity<?> toggleCouponStatus(@PathVariable("id") UUID id) {
        try {
            checkAdminAccess();
            Coupon toggled = couponService.toggleCouponStatus(id);
            return ResponseEntity.ok(toggled);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/api/admin/coupons/{id}")
    public ResponseEntity<?> deleteCoupon(@PathVariable("id") UUID id) {
        try {
            checkAdminAccess();
            couponService.deleteCoupon(id);
            return ResponseEntity.ok(Map.of("message", "Coupon deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ==========================================
    // CUSTOMER / PUBLIC ENDPOINTS
    // ==========================================

    @GetMapping("/api/coupons/active")
    public ResponseEntity<?> getActiveCoupons() {
        try {
            List<Coupon> activeCoupons = couponService.getActiveCouponsForCustomer();
            return ResponseEntity.ok(activeCoupons);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/api/coupons/validate/{code}")
    public ResponseEntity<?> validateCouponGet(
            @PathVariable("code") String code,
            @RequestParam(name = "subtotal", required = false) BigDecimal subtotal) {
        try {
            CouponValidationResponse response = couponService.validateCoupon(code, subtotal);
            if (!response.isValid()) {
                return ResponseEntity.badRequest().body(response);
            }
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/api/coupons/validate")
    public ResponseEntity<?> validateCouponPost(@RequestBody Map<String, Object> request) {
        try {
            String code = (String) request.get("code");
            BigDecimal subtotal = null;
            if (request.get("subtotal") != null) {
                subtotal = new BigDecimal(request.get("subtotal").toString());
            }
            CouponValidationResponse response = couponService.validateCoupon(code, subtotal);
            if (!response.isValid()) {
                return ResponseEntity.badRequest().body(response);
            }
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
