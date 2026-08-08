package com.shopstack.shopstack.controller;

import com.shopstack.shopstack.dto.warehouse.CreateStockMovementRequest;
import com.shopstack.shopstack.model.StockMovement;
import com.shopstack.shopstack.service.StockMovementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/warehouse/stock-movement")
@RequiredArgsConstructor
public class StockMovementController {

    private final StockMovementService stockMovementService;

    @PostMapping
    public ResponseEntity<?> create(
            @Valid @RequestBody CreateStockMovementRequest request) {

        try {

            StockMovement movement =
                    stockMovementService.create(request);

            return ResponseEntity.ok(movement);

        } catch (RuntimeException ex) {

            return ResponseEntity.badRequest()
                    .body(Map.of("error", ex.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<?> getAll() {

        return ResponseEntity.ok(
                stockMovementService.getAll());
    }

    @GetMapping("/{productId}")
    public ResponseEntity<?> getByProduct(
            @PathVariable UUID productId) {

        return ResponseEntity.ok(
                stockMovementService.getByProductId(productId));
    }
}