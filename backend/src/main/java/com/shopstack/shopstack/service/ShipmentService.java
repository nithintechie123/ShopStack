package com.shopstack.shopstack.service;

import java.util.UUID;

import com.shopstack.shopstack.dto.shipment.UpdateShipmentStatusRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.shopstack.shopstack.dto.shipment.CreateShipmentRequest;
import com.shopstack.shopstack.model.Order;
import com.shopstack.shopstack.model.Shipment;
import com.shopstack.shopstack.model.ShipmentStatus;
import com.shopstack.shopstack.repository.OrderRepository;
import com.shopstack.shopstack.repository.ShipmentRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ShipmentService {

    private final ShipmentRepository shipmentRepository;
    private final OrderRepository orderRepository;

    @Transactional
    public Shipment createShipment(CreateShipmentRequest request) {

        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new RuntimeException("Order not found."));

        if (!"READY_TO_SHIP".equals(order.getTrackingStatus())) {
            throw new RuntimeException(
                    "Only READY_TO_SHIP orders can create shipments.");
        }

        if (shipmentRepository.findByOrder(order).isPresent()) {
            throw new RuntimeException(
                    "Shipment already exists for this order.");
        }

        String trackingNumber =
                "SHP-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        Shipment shipment = Shipment.builder()
                .order(order)
                .courierName(request.getCourierName())
                .trackingNumber(trackingNumber)
                .shipmentStatus(ShipmentStatus.CREATED)
                .build();

        return shipmentRepository.save(shipment);
    }


    @Transactional
    public Shipment updateShipmentStatus(
            UUID shipmentId,
            UpdateShipmentStatusRequest request) {

        Shipment shipment = shipmentRepository.findById(shipmentId)
                .orElseThrow(() -> new RuntimeException("Shipment not found."));

        // ADD THESE LINES HERE
        ShipmentStatus currentStatus = shipment.getShipmentStatus();
        ShipmentStatus newStatus = request.getShipmentStatus();

        if (!isValidTransition(currentStatus, newStatus)) {
            throw new RuntimeException(
                    "Invalid shipment status transition from "
                            + currentStatus + " to " + newStatus);
        }

        // Existing code continues from here
        shipment.setShipmentStatus(newStatus);

        Order order = shipment.getOrder();

        switch (newStatus) {

            case DISPATCHED:
                order.setTrackingStatus("DISPATCHED");
                shipment.setDispatchedAt(java.time.LocalDateTime.now());
                break;

            case IN_TRANSIT:
                order.setTrackingStatus("IN_TRANSIT");
                break;

            case OUT_FOR_DELIVERY:
                order.setTrackingStatus("OUT_FOR_DELIVERY");
                break;

            case DELIVERED:
                order.setTrackingStatus("DELIVERED");
                shipment.setDeliveredAt(java.time.LocalDateTime.now());
                if("PENDING".equalsIgnoreCase(order.getPaymentMethod())){
                    order.setPaymentStatus("PAID");
                }
                break;

            default:
                break;
        }

        orderRepository.save(order);

        return shipmentRepository.save(shipment);
    }


    @Transactional(readOnly = true)
    public Shipment getShipmentById(UUID shipmentId) {

        return shipmentRepository.findById(shipmentId)
                .orElseThrow(() ->
                        new RuntimeException("Shipment not found."));
    }


    @Transactional(readOnly = true)
    public Shipment trackShipment(String trackingNumber) {

        return shipmentRepository.findByTrackingNumber(trackingNumber)
                .orElseThrow(() ->
                        new RuntimeException("Shipment not found."));
    }


    private boolean isValidTransition(
            ShipmentStatus current,
            ShipmentStatus next) {

        return switch (current) {

            case CREATED ->
                    next == ShipmentStatus.DISPATCHED;

            case DISPATCHED ->
                    next == ShipmentStatus.IN_TRANSIT;

            case IN_TRANSIT ->
                    next == ShipmentStatus.OUT_FOR_DELIVERY;

            case OUT_FOR_DELIVERY ->
                    next == ShipmentStatus.DELIVERED;

            case DELIVERED ->
                    false;

            default ->
                    false;
        };
    }

    @Transactional(readOnly = true)
    public java.util.List<Shipment> getAllShipments() {
        return shipmentRepository.findAll();
    }

}