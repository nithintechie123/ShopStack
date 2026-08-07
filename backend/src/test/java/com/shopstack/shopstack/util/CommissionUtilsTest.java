package com.shopstack.shopstack.util;

import java.math.BigDecimal;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class CommissionUtilsTest {

    @Test
    @DisplayName("Should correctly calculate 10% default vendor commission profit on standard amounts")
    void testStandardCommission() {
        BigDecimal totalSales = new BigDecimal("1000.00");
        BigDecimal commissionProfit = CommissionUtils.calculateCommission(totalSales, CommissionUtils.DEFAULT_COMMISSION_RATE);
        BigDecimal platformShare = CommissionUtils.calculatePlatformShare(totalSales, CommissionUtils.DEFAULT_COMMISSION_RATE);

        assertEquals(new BigDecimal("100.00"), commissionProfit);
        assertEquals(new BigDecimal("900.00"), platformShare);
    }

    @Test
    @DisplayName("Should correctly calculate vendor commission profit with quantity and unit price")
    void testItemPriceAndQuantityCommission() {
        BigDecimal price = new BigDecimal("499.50");
        int quantity = 2; // Total = 999.00
        BigDecimal rate = new BigDecimal("0.10");

        BigDecimal commissionProfit = CommissionUtils.calculateCommission(price, quantity, rate);
        BigDecimal platformShare = CommissionUtils.calculatePlatformShare(price.multiply(BigDecimal.valueOf(quantity)), rate);

        assertEquals(new BigDecimal("99.90"), commissionProfit);
        assertEquals(new BigDecimal("899.10"), platformShare);
    }

    @Test
    @DisplayName("Should properly apply HALF_UP rounding for fractional cents")
    void testRoundingBehavior() {
        BigDecimal price = new BigDecimal("19.95");
        int quantity = 1;
        BigDecimal rate = new BigDecimal("0.10"); // 1.995 -> 2.00

        BigDecimal commissionProfit = CommissionUtils.calculateCommission(price, quantity, rate);
        BigDecimal platformShare = CommissionUtils.calculatePlatformShare(price, rate);

        assertEquals(new BigDecimal("2.00"), commissionProfit);
        assertEquals(new BigDecimal("17.95"), platformShare);
    }

    @Test
    @DisplayName("Should handle null and zero inputs gracefully")
    void testNullAndZeroHandling() {
        assertEquals(new BigDecimal("0.00"), CommissionUtils.calculateCommission(null, new BigDecimal("0.10")));
        assertEquals(new BigDecimal("0.00"), CommissionUtils.calculateCommission(BigDecimal.ZERO, new BigDecimal("0.10")));
        assertEquals(new BigDecimal("0.00"), CommissionUtils.calculateCommission(new BigDecimal("100.00"), null));
        assertEquals(new BigDecimal("10.00"), CommissionUtils.calculateCommission(new BigDecimal("100.00"), CommissionUtils.safeCommissionRate(null)));
        assertEquals(new BigDecimal("0.00"), CommissionUtils.calculateCommission(null, 2, new BigDecimal("0.10")));
        assertEquals(new BigDecimal("0.00"), CommissionUtils.calculateCommission(new BigDecimal("100.00"), 0, new BigDecimal("0.10")));
        assertEquals(new BigDecimal("0.00"), CommissionUtils.calculateCommission(new BigDecimal("100.00"), -1, new BigDecimal("0.10")));
    }

    @Test
    @DisplayName("Should safely handle custom vendor rates including 0% commission")
    void testCustomCommissionRates() {
        BigDecimal totalSales = new BigDecimal("500.00");
        BigDecimal zeroRate = BigDecimal.ZERO;
        BigDecimal highRate = new BigDecimal("0.25");

        assertEquals(new BigDecimal("0.00"), CommissionUtils.calculateCommission(totalSales, zeroRate));
        assertEquals(new BigDecimal("500.00"), CommissionUtils.calculatePlatformShare(totalSales, zeroRate));

        assertEquals(new BigDecimal("125.00"), CommissionUtils.calculateCommission(totalSales, highRate));
        assertEquals(new BigDecimal("375.00"), CommissionUtils.calculatePlatformShare(totalSales, highRate));
    }
}
