package com.shopstack.shopstack.service;

import java.util.List;
import java.util.Map;

import com.shopstack.shopstack.dto.CommissionSummaryDTO;
import com.shopstack.shopstack.dto.RevenueReportDTO;
import com.shopstack.shopstack.dto.SalesReportDTO;
import com.shopstack.shopstack.dto.VendorEarningsDTO;

public interface AdminReportService {
    Map<String, Object> getDashboardStatistics();
    CommissionSummaryDTO getCommissionSummary();
    List<VendorEarningsDTO> getVendorEarnings();
    List<RevenueReportDTO> getRevenueReport();
    SalesReportDTO getSalesReport();
    List<Map<String, Object>> getTopSellingProducts(int limit);
}
