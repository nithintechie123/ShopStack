package com.shopstack.shopstack.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.shopstack.shopstack.model.Order;
import com.shopstack.shopstack.model.ReturnRequest;

public interface ReturnRequestRepository extends JpaRepository<ReturnRequest, UUID> {

    List<ReturnRequest> findByOrder(Order order);

    Optional<ReturnRequest> findByOrderId(UUID orderId);
}