package com.shopstack.shopstack.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.shopstack.shopstack.dto.CommissionSummaryDTO;
import com.shopstack.shopstack.dto.RevenueReportDTO;
import com.shopstack.shopstack.dto.SalesReportDTO;
import com.shopstack.shopstack.dto.VendorEarningsDTO;
import com.shopstack.shopstack.model.Order;
import com.shopstack.shopstack.model.OrderItem;
import com.shopstack.shopstack.model.Product;
import com.shopstack.shopstack.model.Role;
import com.shopstack.shopstack.repository.OrderRepository;
import com.shopstack.shopstack.repository.ProductRepository;
import com.shopstack.shopstack.repository.UserRepository;
import com.shopstack.shopstack.repository.VendorProfileRepository;
import com.shopstack.shopstack.util.CommissionUtils;

@Service
public class AdminReportServiceImpl implements AdminReportService {

    private final UserRepository userRepository;
    private final VendorProfileRepository vendorProfileRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;

    public AdminReportServiceImpl(UserRepository userRepository,
                                  VendorProfileRepository vendorProfileRepository,
                                  ProductRepository productRepository,
                                  OrderRepository orderRepository) {
        this.userRepository = userRepository;
        this.vendorProfileRepository = vendorProfileRepository;
        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
    }

    @Override
    public Map<String, Object> getDashboardStatistics() {
        long totalCustomers = userRepository.countByRole(Role.CUSTOMER);
        long totalVendors = vendorProfileRepository.count();
        long totalProducts = productRepository.count();
        
        List<Order> nonCancelledOrders = orderRepository.findByTrackingStatusNot("CANCELLED");
        long totalOrders = nonCancelledOrders.size();
        
        CommissionSummaryDTO commissionSummary = getCommissionSummary();
        BigDecimal totalRevenue = nonCancelledOrders.stream()
                .map(Order::getFinalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
                
        List<Map<String, Object>> topProducts = getTopSellingProducts(5);
        
        Map<String, Object> stats = new java.util.HashMap<>();
        stats.put("totalCustomers", totalCustomers);
        stats.put("totalVendors", totalVendors);
        stats.put("totalProducts", totalProducts);
        stats.put("totalOrders", totalOrders);
        stats.put("totalRevenue", totalRevenue);
        stats.put("totalSales", commissionSummary.getTotalSales());
        stats.put("totalCommission", commissionSummary.getTotalCommission());
        stats.put("totalPayout", commissionSummary.getTotalPayout());
        stats.put("completedOrders", commissionSummary.getCompletedOrders());
        stats.put("topSellingProducts", topProducts);
        
        return stats;
    }

    @Override
    public CommissionSummaryDTO getCommissionSummary() {
        List<Order> nonCancelledOrders = orderRepository.findByTrackingStatusNot("CANCELLED");

        BigDecimal totalSales = BigDecimal.ZERO;
        BigDecimal totalCommission = BigDecimal.ZERO;
        BigDecimal totalPayout = BigDecimal.ZERO;

        for (Order order : nonCancelledOrders) {
            if (order.getItems() == null) continue;
            for (OrderItem item : order.getItems()) {
                if (item.getPrice() == null) continue;
                BigDecimal itemTotal = item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
                BigDecimal commissionRate = CommissionUtils.safeCommissionRate(
                        item.getProduct() != null && item.getProduct().getVendor() != null
                                ? item.getProduct().getVendor().getCommissionRate()
                                : null
                );
                BigDecimal commission = CommissionUtils.calculateCommission(item.getPrice(), item.getQuantity(), commissionRate);
                BigDecimal payout = CommissionUtils.calculateVendorPayout(item.getPrice(), item.getQuantity(), commissionRate);

                totalSales = totalSales.add(itemTotal);
                totalCommission = totalCommission.add(commission);
                totalPayout = totalPayout.add(payout);
            }
        }

        return CommissionSummaryDTO.builder()
                .totalSales(totalSales.setScale(2, RoundingMode.HALF_UP))
                .totalCommission(totalCommission.setScale(2, RoundingMode.HALF_UP))
                .totalPayout(totalPayout.setScale(2, RoundingMode.HALF_UP))
                .completedOrders(nonCancelledOrders.size())
                .build();
    }

    @Override
    public List<VendorEarningsDTO> getVendorEarnings() {
        List<Order> nonCancelledOrders = orderRepository.findByTrackingStatusNot("CANCELLED");
        Map<UUID, VendorEarningsDTO> earningsByVendor = new HashMap<>();

        for (Order order : nonCancelledOrders) {
            if (order.getItems() == null) continue;
            Set<UUID> countedOrders = new HashSet<>();
            for (OrderItem item : order.getItems()) {
                if (item.getProduct() == null || item.getProduct().getVendor() == null) continue;
                UUID vendorId = item.getProduct().getVendor().getId();
                VendorEarningsDTO stats = earningsByVendor.computeIfAbsent(vendorId, id -> VendorEarningsDTO.builder()
                        .vendorId(vendorId)
                        .vendorName(item.getProduct().getVendor().getStoreName())
                        .status(item.getProduct().getVendor().getStatus() != null ? item.getProduct().getVendor().getStatus().name() : "UNKNOWN")
                        .commissionRate(CommissionUtils.safeCommissionRate(item.getProduct().getVendor().getCommissionRate()))
                        .totalSales(BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP))
                        .totalCommission(BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP))
                        .totalPayout(BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP))
                        .completedOrders(0L)
                        .build());

                BigDecimal itemTotal = item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
                BigDecimal commission = CommissionUtils.calculateCommission(item.getPrice(), item.getQuantity(), stats.getCommissionRate());
                BigDecimal payout = CommissionUtils.calculateVendorPayout(item.getPrice(), item.getQuantity(), stats.getCommissionRate());

                stats.setTotalSales(stats.getTotalSales().add(itemTotal).setScale(2, RoundingMode.HALF_UP));
                stats.setTotalCommission(stats.getTotalCommission().add(commission).setScale(2, RoundingMode.HALF_UP));
                stats.setTotalPayout(stats.getTotalPayout().add(payout).setScale(2, RoundingMode.HALF_UP));

                if (!countedOrders.contains(vendorId)) {
                    stats.setCompletedOrders(stats.getCompletedOrders() + 1);
                    countedOrders.add(vendorId);
                }
            }
        }

        return earningsByVendor.values().stream()
                .sorted((a, b) -> b.getTotalSales().compareTo(a.getTotalSales()))
                .toList();
    }

    @Override
    public List<RevenueReportDTO> getRevenueReport() {
        List<Order> nonCancelledOrders = orderRepository.findByTrackingStatusNot("CANCELLED");
        
        Map<java.time.LocalDate, List<Order>> ordersByDate = nonCancelledOrders.stream()
                .filter(o -> o.getOrderDate() != null)
                .collect(java.util.stream.Collectors.groupingBy(o -> o.getOrderDate().toLocalDate()));
                
        return ordersByDate.entrySet().stream()
                .map(entry -> {
                    BigDecimal dailyRevenue = entry.getValue().stream()
                            .map(Order::getFinalAmount)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);
                    return RevenueReportDTO.builder()
                            .date(entry.getKey())
                            .revenue(dailyRevenue)
                            .orderCount((long) entry.getValue().size())
                            .build();
                })
                .sorted(java.util.Comparator.comparing(RevenueReportDTO::getDate).reversed())
                .collect(java.util.stream.Collectors.toList());
    }

    @Override
    public SalesReportDTO getSalesReport() {
        List<Order> nonCancelledOrders = orderRepository.findByTrackingStatusNot("CANCELLED");
        long totalOrders = nonCancelledOrders.size();
        
        long totalItemsSold = nonCancelledOrders.stream()
                .filter(o -> o.getItems() != null)
                .flatMap(o -> o.getItems().stream())
                .mapToLong(OrderItem::getQuantity)
                .sum();
                
        BigDecimal totalSalesAmount = nonCancelledOrders.stream()
                .map(Order::getFinalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
                
        BigDecimal averageOrderValue = BigDecimal.ZERO;
        if (totalOrders > 0) {
            averageOrderValue = totalSalesAmount.divide(BigDecimal.valueOf(totalOrders), 2, java.math.RoundingMode.HALF_UP);
        }
        
        return SalesReportDTO.builder()
                .totalOrders(totalOrders)
                .totalItemsSold(totalItemsSold)
                .totalSalesAmount(totalSalesAmount)
                .averageOrderValue(averageOrderValue)
                .build();
    }

    @Override
    public List<Map<String, Object>> getTopSellingProducts(int limit) {
        List<Order> nonCancelledOrders = orderRepository.findByTrackingStatusNot("CANCELLED");
        
        Map<Product, Long> productQuantities = nonCancelledOrders.stream()
                .filter(o -> o.getItems() != null)
                .flatMap(o -> o.getItems().stream())
                .filter(item -> item.getProduct() != null)
                .collect(java.util.stream.Collectors.groupingBy(
                        OrderItem::getProduct,
                        java.util.stream.Collectors.summingLong(OrderItem::getQuantity)
                ));
                
        return productQuantities.entrySet().stream()
                .sorted((e1, e2) -> Long.compare(e2.getValue(), e1.getValue()))
                .limit(limit)
                .map(entry -> {
                    Product p = entry.getKey();
                    Map<String, Object> map = new java.util.HashMap<>();
                    map.put("productId", p.getId());
                    map.put("productName", p.getName());
                    map.put("price", p.getPrice());
                    map.put("quantitySold", entry.getValue());
                    return map;
                })
                .collect(java.util.stream.Collectors.toList());
    }
}
