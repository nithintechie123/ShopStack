package com.shopstack.shopstack.service;

import com.shopstack.shopstack.dto.SalesReportDTO;
import com.shopstack.shopstack.dto.RevenueReportDTO;
import com.shopstack.shopstack.model.Order;
import com.shopstack.shopstack.model.OrderItem;
import com.shopstack.shopstack.model.Product;
import com.shopstack.shopstack.model.Role;
import com.shopstack.shopstack.repository.OrderRepository;
import com.shopstack.shopstack.repository.ProductRepository;
import com.shopstack.shopstack.repository.UserRepository;
import com.shopstack.shopstack.repository.VendorProfileRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

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
        stats.put("topSellingProducts", topProducts);
        
        return stats;
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
