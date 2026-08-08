package com.shopstack.shopstack.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.shopstack.shopstack.dto.shipment.CreateShipmentRequest;
import com.shopstack.shopstack.model.Shipment;
import com.shopstack.shopstack.service.ShipmentService;
import java.util.UUID;
import com.shopstack.shopstack.dto.shipment.UpdateShipmentStatusRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/shipment")
@RequiredArgsConstructor
public class ShipmentController {

    private final ShipmentService shipmentService;

    @PostMapping
    public ResponseEntity<?> createShipment(
            @Valid @RequestBody CreateShipmentRequest request) {

        try {

            Shipment shipment =
                    shipmentService.createShipment(request);

            return ResponseEntity.ok(shipment);

        } catch (RuntimeException ex) {

            return ResponseEntity.badRequest()
                    .body(Map.of("error", ex.getMessage()));
        }
    }

    @PutMapping("/{shipmentId}/status")
    public ResponseEntity<?> updateShipmentStatus(
            @PathVariable UUID shipmentId,
            @Valid @RequestBody UpdateShipmentStatusRequest request) {

        try {

            Shipment shipment =
                    shipmentService.updateShipmentStatus(shipmentId, request);

            return ResponseEntity.ok(shipment);

        } catch (RuntimeException ex) {

            return ResponseEntity.badRequest()
                    .body(Map.of("error", ex.getMessage()));
        }
    }

    @GetMapping("/{shipmentId}")
    public ResponseEntity<?> getShipmentById(
            @PathVariable UUID shipmentId) {

        try {

            Shipment shipment =
                    shipmentService.getShipmentById(shipmentId);

            return ResponseEntity.ok(shipment);

        } catch (RuntimeException ex) {

            return ResponseEntity.badRequest()
                    .body(Map.of("error", ex.getMessage()));
        }
    }

    @GetMapping("/track/{trackingNumber}")
    public ResponseEntity<?> trackShipment(
            @PathVariable String trackingNumber) {

        try {

            Shipment shipment =
                    shipmentService.trackShipment(trackingNumber);

            return ResponseEntity.ok(shipment);

        } catch (RuntimeException ex) {

            return ResponseEntity.badRequest()
                    .body(Map.of("error", ex.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<?> getAllShipments() {
        try {
            return ResponseEntity.ok(shipmentService.getAllShipments());
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", ex.getMessage()));
        }
    }

}