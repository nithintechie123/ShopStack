package com.shopstack.shopstack.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.shopstack.shopstack.model.Order;

@Repository
public interface OrderRepository extends JpaRepository<Order, UUID> {
    
    List<Order> findByUserIdOrderByOrderDateDesc(UUID userId);

    @Query("SELECT DISTINCT o FROM Order o JOIN o.items i WHERE i.product.vendor.user.id = :vendorId ORDER BY o.orderDate DESC")
    List<Order> findByVendorId(@Param("vendorId") UUID vendorId);

    //Added for admin reports
    List<Order> findByTrackingStatusNot(String trackingStatus);
    long countByTrackingStatus(String trackingStatus);

    @Query("SELECT COUNT(o) > 0 FROM Order o JOIN o.items i WHERE o.user.id = :userId AND i.product.id = :productId AND o.trackingStatus = 'DELIVERED'")
    boolean hasUserPurchasedAndReceivedProduct(@Param("userId") UUID userId, @Param("productId") UUID productId);
}