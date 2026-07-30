package com.shopstack.shopstack.service;

import com.shopstack.shopstack.dto.SalesReportDTO;
import com.shopstack.shopstack.dto.RevenueReportDTO;

import java.util.List;
import java.util.Map;

public interface AdminReportService {
    Map<String, Object> getDashboardStatistics();
    List<RevenueReportDTO> getRevenueReport();
    SalesReportDTO getSalesReport();
    List<Map<String, Object>> getTopSellingProducts(int limit);
}
