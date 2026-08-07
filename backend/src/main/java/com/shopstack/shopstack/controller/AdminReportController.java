package com.shopstack.shopstack.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.shopstack.shopstack.dto.CommissionSummaryDTO;
import com.shopstack.shopstack.dto.RevenueReportDTO;
import com.shopstack.shopstack.dto.SalesReportDTO;
import com.shopstack.shopstack.dto.VendorEarningsDTO;
import com.shopstack.shopstack.service.AdminReportService;

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

    @GetMapping("/commission")
    public ResponseEntity<CommissionSummaryDTO> getCommissionSummary() {
        return ResponseEntity.ok(adminReportService.getCommissionSummary());
    }

    @GetMapping("/vendor-earnings")
    public ResponseEntity<List<VendorEarningsDTO>> getVendorEarnings() {
        return ResponseEntity.ok(adminReportService.getVendorEarnings());
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
