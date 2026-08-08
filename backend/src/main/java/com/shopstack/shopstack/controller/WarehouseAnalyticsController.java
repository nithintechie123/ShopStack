package com.shopstack.shopstack.controller;

import com.shopstack.shopstack.dto.warehouse.WarehouseAnalyticsResponse;
import com.shopstack.shopstack.service.WarehouseAnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/warehouse")
@RequiredArgsConstructor
public class WarehouseAnalyticsController {

    private final WarehouseAnalyticsService warehouseAnalyticsService;

    @GetMapping("/analytics")
    public ResponseEntity<WarehouseAnalyticsResponse> getAnalytics() {

        return ResponseEntity.ok(
                warehouseAnalyticsService.getAnalytics()
        );
    }
}