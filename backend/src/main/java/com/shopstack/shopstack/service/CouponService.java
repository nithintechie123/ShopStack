package com.shopstack.shopstack.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.shopstack.shopstack.dto.CouponDTO;
import com.shopstack.shopstack.dto.CouponValidationResponse;
import com.shopstack.shopstack.model.Coupon;
import com.shopstack.shopstack.repository.CouponRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class CouponService {

    private final CouponRepository couponRepository;

    public List<Coupon> getAllCoupons() {
        return couponRepository.findAll();
    }

    public List<Coupon> getActiveCouponsForCustomer() {
        LocalDateTime now = LocalDateTime.now();
        return couponRepository.findByActiveTrue().stream()
                .filter(c -> c.getStartDate() == null || !c.getStartDate().isAfter(now))
                .filter(c -> c.getExpiryDate() == null || !c.getExpiryDate().isBefore(now))
                .filter(c -> c.getUsageLimit() == null || c.getUsageLimit() == 0 || c.getUsedCount() < c.getUsageLimit())
                .collect(Collectors.toList());
    }

    public Coupon getCouponById(UUID id) {
        return couponRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Coupon not found with id: " + id));
    }

    public Coupon createCoupon(CouponDTO dto) {
        String normalizedCode = dto.getCode().trim().toUpperCase();
        if (couponRepository.existsByCodeIgnoreCase(normalizedCode)) {
            throw new IllegalArgumentException("Coupon with code '" + normalizedCode + "' already exists.");
        }

        validateDiscountValue(dto.getDiscountType(), dto.getDiscountValue());

        Coupon coupon = Coupon.builder()
                .code(normalizedCode)
                .discountType(dto.getDiscountType().trim().toUpperCase())
                .discountValue(dto.getDiscountValue())
                .minOrderAmount(dto.getMinOrderAmount())
                .maxDiscountAmount(dto.getMaxDiscountAmount())
                .usageLimit(dto.getUsageLimit())
                .usedCount(0)
                .startDate(dto.getStartDate())
                .expiryDate(dto.getExpiryDate())
                .active(dto.getActive() != null ? dto.getActive() : true)
                .description(dto.getDescription())
                .build();

        return couponRepository.save(coupon);
    }

    public Coupon updateCoupon(UUID id, CouponDTO dto) {
        Coupon coupon = getCouponById(id);
        String normalizedCode = dto.getCode().trim().toUpperCase();

        if (!coupon.getCode().equalsIgnoreCase(normalizedCode) && couponRepository.existsByCodeIgnoreCase(normalizedCode)) {
            throw new IllegalArgumentException("Coupon with code '" + normalizedCode + "' already exists.");
        }

        validateDiscountValue(dto.getDiscountType(), dto.getDiscountValue());

        coupon.setCode(normalizedCode);
        coupon.setDiscountType(dto.getDiscountType().trim().toUpperCase());
        coupon.setDiscountValue(dto.getDiscountValue());
        coupon.setMinOrderAmount(dto.getMinOrderAmount());
        coupon.setMaxDiscountAmount(dto.getMaxDiscountAmount());
        coupon.setUsageLimit(dto.getUsageLimit());
        coupon.setStartDate(dto.getStartDate());
        coupon.setExpiryDate(dto.getExpiryDate());
        if (dto.getActive() != null) {
            coupon.setActive(dto.getActive());
        }
        coupon.setDescription(dto.getDescription());

        return couponRepository.save(coupon);
    }

    public Coupon toggleCouponStatus(UUID id) {
        Coupon coupon = getCouponById(id);
        coupon.setActive(!coupon.isActive());
        return couponRepository.save(coupon);
    }

    public void deleteCoupon(UUID id) {
        Coupon coupon = getCouponById(id);
        couponRepository.delete(coupon);
    }

    public CouponValidationResponse validateCoupon(String code, BigDecimal subtotal) {
        if (code == null || code.isBlank()) {
            return CouponValidationResponse.builder()
                    .valid(false)
                    .message("Coupon code cannot be empty.")
                    .build();
        }

        String normalizedCode = code.trim().toUpperCase();
        Coupon coupon = couponRepository.findByCodeIgnoreCase(normalizedCode).orElse(null);

        if (coupon == null) {
            return CouponValidationResponse.builder()
                    .valid(false)
                    .code(normalizedCode)
                    .message("Invalid coupon code.")
                    .build();
        }

        if (!coupon.isActive()) {
            return CouponValidationResponse.builder()
                    .valid(false)
                    .code(coupon.getCode())
                    .message("This coupon is currently inactive.")
                    .build();
        }

        LocalDateTime now = LocalDateTime.now();

        if (coupon.getStartDate() != null && now.isBefore(coupon.getStartDate())) {
            return CouponValidationResponse.builder()
                    .valid(false)
                    .code(coupon.getCode())
                    .message("This coupon promotion has not started yet.")
                    .build();
        }

        if (coupon.getExpiryDate() != null && now.isAfter(coupon.getExpiryDate())) {
            return CouponValidationResponse.builder()
                    .valid(false)
                    .code(coupon.getCode())
                    .expiryDate(coupon.getExpiryDate())
                    .message("Coupon code '" + coupon.getCode() + "' has expired!")
                    .build();
        }

        if (coupon.getUsageLimit() != null && coupon.getUsageLimit() > 0 && coupon.getUsedCount() >= coupon.getUsageLimit()) {
            return CouponValidationResponse.builder()
                    .valid(false)
                    .code(coupon.getCode())
                    .message("Coupon code '" + coupon.getCode() + "' usage limit has been reached.")
                    .build();
        }

        if (subtotal != null && coupon.getMinOrderAmount() != null
                && subtotal.compareTo(coupon.getMinOrderAmount()) < 0) {
            BigDecimal remaining = coupon.getMinOrderAmount().subtract(subtotal);
            return CouponValidationResponse.builder()
                    .valid(false)
                    .code(coupon.getCode())
                    .minOrderAmount(coupon.getMinOrderAmount())
                    .message("Minimum order amount of ₹" + coupon.getMinOrderAmount() + " required. Add ₹" + remaining + " more to qualify.")
                    .build();
        }

        BigDecimal calculatedDiscount = BigDecimal.ZERO;
        if (subtotal != null && subtotal.compareTo(BigDecimal.ZERO) > 0) {
            if ("PERCENTAGE".equalsIgnoreCase(coupon.getDiscountType())) {
                calculatedDiscount = subtotal.multiply(coupon.getDiscountValue())
                        .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
                if (coupon.getMaxDiscountAmount() != null
                        && coupon.getMaxDiscountAmount().compareTo(BigDecimal.ZERO) > 0
                        && calculatedDiscount.compareTo(coupon.getMaxDiscountAmount()) > 0) {
                    calculatedDiscount = coupon.getMaxDiscountAmount();
                }
            } else if ("FLAT".equalsIgnoreCase(coupon.getDiscountType())) {
                calculatedDiscount = coupon.getDiscountValue().min(subtotal);
            }
        } else {
            calculatedDiscount = "FLAT".equalsIgnoreCase(coupon.getDiscountType()) ? coupon.getDiscountValue() : BigDecimal.ZERO;
        }

        return CouponValidationResponse.builder()
                .valid(true)
                .code(coupon.getCode())
                .discountType(coupon.getDiscountType())
                .discountValue(coupon.getDiscountValue())
                .calculatedDiscount(calculatedDiscount)
                .minOrderAmount(coupon.getMinOrderAmount())
                .maxDiscountAmount(coupon.getMaxDiscountAmount())
                .description(coupon.getDescription())
                .expiryDate(coupon.getExpiryDate())
                .message("Coupon applied successfully!")
                .build();
    }

    public void incrementCouponUsage(String code) {
        if (code == null || code.isBlank()) return;
        couponRepository.findByCodeIgnoreCase(code.trim()).ifPresent(coupon -> {
            coupon.setUsedCount(coupon.getUsedCount() + 1);
            couponRepository.save(coupon);
        });
    }

    public Map<String, Object> getCouponStats() {
        List<Coupon> all = couponRepository.findAll();
        LocalDateTime now = LocalDateTime.now();

        long total = all.size();
        long active = all.stream().filter(Coupon::isActive).count();
        long expired = all.stream().filter(c -> c.getExpiryDate() != null && c.getExpiryDate().isBefore(now)).count();
        long totalRedemptions = all.stream().mapToInt(Coupon::getUsedCount).sum();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalCoupons", total);
        stats.put("activeCoupons", active);
        stats.put("expiredCoupons", expired);
        stats.put("totalRedemptions", totalRedemptions);

        return stats;
    }

    private void validateDiscountValue(String type, BigDecimal value) {
        if (value == null || value.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Discount value must be greater than zero.");
        }
        if ("PERCENTAGE".equalsIgnoreCase(type) && value.compareTo(BigDecimal.valueOf(100)) > 0) {
            throw new IllegalArgumentException("Percentage discount cannot exceed 100%.");
        }
    }
}
