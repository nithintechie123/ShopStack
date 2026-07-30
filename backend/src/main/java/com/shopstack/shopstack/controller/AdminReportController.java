package com.shopstack.shopstack.controller;

import com.shopstack.shopstack.dto.SalesReportDTO;
import com.shopstack.shopstack.dto.RevenueReportDTO;
import com.shopstack.shopstack.service.AdminReportService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminReportController {

    private final AdminReportService adminReportService;

    public AdminReportController(AdminReportService adminReportService) {
        this.adminReportService = adminReportService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboardStatistics() {
        return ResponseEntity.ok(adminReportService.getDashboardStatistics());
    }

    @GetMapping("/revenue")
    public ResponseEntity<List<RevenueReportDTO>> getRevenueReport() {
        return ResponseEntity.ok(adminReportService.getRevenueReport());
    }

    @GetMapping("/reports")
    public ResponseEntity<SalesReportDTO> getSalesReport() {
        return ResponseEntity.ok(adminReportService.getSalesReport());
    }
}
