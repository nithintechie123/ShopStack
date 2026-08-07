package com.shopstack.shopstack.util;

import java.math.BigDecimal;
import java.math.RoundingMode;

public class CommissionUtils {

    public static final BigDecimal DEFAULT_COMMISSION_RATE = new BigDecimal("0.10");

    /**
     * Calculates the Vendor Commission Profit generated from a single item.
     * Commission Profit = price * quantity * commissionRate
     */
    public static BigDecimal calculateCommission(BigDecimal price, int quantity, BigDecimal commissionRate) {
        if (price == null || quantity <= 0) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }
        BigDecimal rate = safeCommissionRate(commissionRate);
        BigDecimal total = price.multiply(BigDecimal.valueOf(quantity));
        return calculateCommission(total, rate);
    }

    /**
     * Calculates the Vendor Commission Profit generated from total sales.
     * Commission Profit = totalSales * commissionRate
     */
    public static BigDecimal calculateCommission(BigDecimal totalSales, BigDecimal commissionRate) {
        if (totalSales == null || totalSales.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }
        BigDecimal rate = safeCommissionRate(commissionRate);
        return totalSales.multiply(rate).setScale(2, RoundingMode.HALF_UP);
    }

    /**
     * Calculates the Vendor's take-home Commission Profit.
     */
    public static BigDecimal calculateVendorPayout(BigDecimal price, int quantity, BigDecimal commissionRate) {
        return calculateCommission(price, quantity, commissionRate);
    }

    /**
     * Calculates the Vendor's take-home Commission Profit.
     */
    public static BigDecimal calculateVendorPayout(BigDecimal totalSales, BigDecimal commissionRate) {
        return calculateCommission(totalSales, commissionRate);
    }

    /**
     * Calculates the Platform/Admin base share.
     * Platform Share = totalSales - vendorCommission
     */
    public static BigDecimal calculatePlatformShare(BigDecimal totalSales, BigDecimal commissionRate) {
        if (totalSales == null || totalSales.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }
        BigDecimal vendorCommission = calculateCommission(totalSales, commissionRate);
        return totalSales.subtract(vendorCommission).max(BigDecimal.ZERO).setScale(2, RoundingMode.HALF_UP);
    }

    public static BigDecimal safeCommissionRate(BigDecimal commissionRate) {
        if (commissionRate == null) {
            return DEFAULT_COMMISSION_RATE;
        }
        if (commissionRate.compareTo(BigDecimal.ZERO) < 0) {
            return BigDecimal.ZERO;
        }
        return commissionRate;
    }
}

