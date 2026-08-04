package com.shopstack.shopstack.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.shopstack.shopstack.model.Order;
import com.shopstack.shopstack.model.Shipment;

@Repository
public interface ShipmentRepository extends JpaRepository<Shipment, UUID> {

    Optional<Shipment> findByOrder(Order order);

    Optional<Shipment> findByTrackingNumber(String trackingNumber);
}