// src/main/java/com/example/pharmacy/service/ReportService.java
package com.example.pharmacy.service;

import com.example.pharmacy.entity.*;
import com.example.pharmacy.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ReportService {

    @Autowired
    private ReportRepository reportRepository;

    @Autowired
    private SaleRepository saleRepository;

    @Autowired
    private MedicineRepository medicineRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DeliveryRepository deliveryRepository;

    @Autowired
    private SaleItemRepository saleItemRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    // =======================================
    // CRUD OPERATIONS
    // =======================================

    public List<Report> getAllReports() {
        return reportRepository.findAll();
    }

    public Report getReportById(Long id) {
        return reportRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Report not found with id: " + id));
    }

    public void deleteReport(Long id) {
        if (!reportRepository.existsById(id)) {
            throw new RuntimeException("Report not found with id: " + id);
        }
        reportRepository.deleteById(id);
    }

    public List<Report> getReportsByType(ReportType type) {
        return reportRepository.findByReportType(type);
    }

    // =======================================
    // REPORT GENERATION
    // =======================================

    public Report generateSalesSummary(Instant start, Instant end) {
        try {
            // Validate dates
            if (start.isAfter(end)) {
                throw new IllegalArgumentException("Start date must be before end date");
            }

            // Generate comprehensive sales report data
            Map<String, Object> reportData = generateSalesSummaryData(start, end);

            // Create and save report
            Report report = Report.builder()
                    .reportType(ReportType.SALES_SUMMARY)
                    .content(objectMapper.writeValueAsString(reportData))
                    .generatedDate(Instant.now())
                    .build();

            return reportRepository.save(report);

        } catch (Exception e) {
            throw new RuntimeException("Error generating sales summary report: " + e.getMessage(), e);
        }
    }

    public Report generateLowStockReport(Integer threshold) {
        try {
            if (threshold == null || threshold < 0) {
                threshold = 10; // Default threshold
            }

            Map<String, Object> reportData = generateLowStockData(threshold);

            Report report = Report.builder()
                    .reportType(ReportType.LOW_STOCK)
                    .content(objectMapper.writeValueAsString(reportData))
                    .generatedDate(Instant.now())
                    .build();

            return reportRepository.save(report);

        } catch (Exception e) {
            throw new RuntimeException("Error generating low stock report: " + e.getMessage(), e);
        }
    }

    // =======================================
    // SALES SUMMARY DATA GENERATION
    // =======================================

    private Map<String, Object> generateSalesSummaryData(Instant start, Instant end) {
        Map<String, Object> data = new HashMap<>();

        // Period information
        Map<String, Object> period = new HashMap<>();
        period.put("start", start.toString());
        period.put("end", end.toString());
        period.put("days", ChronoUnit.DAYS.between(start, end) + 1);
        data.put("period", period);

        // Get sales in date range
        List<Sale> sales = saleRepository.findBySaleDateBetween(start, end);

        // Basic sales metrics
        Map<String, Object> salesMetrics = calculateSalesMetrics(sales, start, end);
        data.put("salesAnalytics", salesMetrics);

        // Top selling medicines
        List<Map<String, Object>> topMedicines = calculateTopSellingMedicines(start, end);
        salesMetrics.put("topSellingMedicines", topMedicines);

        // Customer analytics
        Map<String, Object> customerAnalytics = calculateCustomerAnalytics(sales);
        data.put("customerAnalytics", customerAnalytics);

        // Stock analytics
        Map<String, Object> stockAnalytics = calculateStockAnalytics();
        data.put("stockAnalytics", stockAnalytics);

        // Delivery analytics
        Map<String, Object> deliveryAnalytics = calculateDeliveryAnalytics(start, end);
        data.put("deliveryAnalytics", deliveryAnalytics);

        // Summary
        Map<String, Object> summary = new HashMap<>();
        summary.put("totalSales", sales.size());
        summary.put("totalRevenue", salesMetrics.get("totalRevenue"));
        summary.put("averageOrderValue", salesMetrics.get("averageOrderValue"));
        summary.put("generatedAt", Instant.now().toString());
        data.put("summary", summary);

        return data;
    }

    private Map<String, Object> calculateSalesMetrics(List<Sale> sales, Instant start, Instant end) {
        Map<String, Object> metrics = new HashMap<>();

        BigDecimal totalRevenue = sales.stream()
                .map(Sale::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        int totalSales = sales.size();
        BigDecimal avgOrderValue = totalSales > 0 ?
                totalRevenue.divide(BigDecimal.valueOf(totalSales), 2, BigDecimal.ROUND_HALF_UP) :
                BigDecimal.ZERO;

        long totalItems = sales.stream()
                .flatMap(sale -> sale.getItems().stream())
                .mapToLong(item -> item.getQuantity())
                .sum();

        Set<Long> uniqueCustomers = sales.stream()
                .map(sale -> sale.getUser().getId())
                .collect(Collectors.toSet());

        // Status breakdown
        Map<String, Map<String, Object>> statusBreakdown = new HashMap<>();
        for (SaleStatus status : SaleStatus.values()) {
            long count = sales.stream().filter(s -> s.getStatus() == status).count();
            double percentage = totalSales > 0 ? (double) count / totalSales * 100 : 0;

            Map<String, Object> statusData = new HashMap<>();
            statusData.put("count", count);
            statusData.put("percentage", percentage);
            statusBreakdown.put(status.name(), statusData);
        }

        // Daily averages
        long days = ChronoUnit.DAYS.between(start, end) + 1;
        double dailyAvgRevenue = days > 0 ? totalRevenue.doubleValue() / days : 0;
        double dailyAvgOrders = days > 0 ? (double) totalSales / days : 0;

        metrics.put("totalRevenue", totalRevenue.doubleValue());
        metrics.put("totalSalesCount", totalSales);
        metrics.put("averageOrderValue", avgOrderValue.doubleValue());
        metrics.put("totalItemsSold", totalItems);
        metrics.put("uniqueCustomers", uniqueCustomers.size());
        metrics.put("statusBreakdown", statusBreakdown);
        metrics.put("dailyAverageRevenue", dailyAvgRevenue);
        metrics.put("dailyAverageOrders", dailyAvgOrders);
        metrics.put("averageItemsPerOrder", totalSales > 0 ? (double) totalItems / totalSales : 0);

        return metrics;
    }

    private List<Map<String, Object>> calculateTopSellingMedicines(Instant start, Instant end) {
        // Get top selling medicines with quantities and revenue
        List<Object[]> topMedicinesData = saleItemRepository.getTopSellingMedicines(start, end);

        List<Map<String, Object>> topMedicines = new ArrayList<>();
        int rank = 1;

        for (Object[] row : topMedicinesData) {
            Medicine medicine = (Medicine) row[0];
            Long quantitySold = (Long) row[1];
            BigDecimal revenue = (BigDecimal) row[2];

            Map<String, Object> medicineData = new HashMap<>();
            medicineData.put("rank", rank++);
            medicineData.put("id", medicine.getId());
            medicineData.put("name", medicine.getName());
            medicineData.put("category", medicine.getCategory());
            medicineData.put("quantitySold", quantitySold);
            medicineData.put("revenue", revenue.doubleValue());
            medicineData.put("currentStock", medicine.getQuantity());

            topMedicines.add(medicineData);
        }

        return topMedicines;
    }

    private Map<String, Object> calculateCustomerAnalytics(List<Sale> sales) {
        Map<String, Object> analytics = new HashMap<>();

        // Customer purchase frequency
        Map<User, List<Sale>> customerSales = sales.stream()
                .collect(Collectors.groupingBy(Sale::getUser));

        List<Map<String, Object>> topCustomers = customerSales.entrySet().stream()
                .map(entry -> {
                    User customer = entry.getKey();
                    List<Sale> customerPurchases = entry.getValue();

                    BigDecimal totalSpent = customerPurchases.stream()
                            .map(Sale::getTotalAmount)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);

                    Map<String, Object> customerData = new HashMap<>();
                    customerData.put("id", customer.getId());
                    customerData.put("username", customer.getUsername());
                    customerData.put("email", customer.getEmail());
                    customerData.put("totalOrders", customerPurchases.size());
                    customerData.put("totalSpent", totalSpent.doubleValue());
                    customerData.put("averageOrderValue",
                            totalSpent.divide(BigDecimal.valueOf(customerPurchases.size()), 2, BigDecimal.ROUND_HALF_UP).doubleValue());

                    return customerData;
                })
                .sorted((a, b) -> Double.compare((Double) b.get("totalSpent"), (Double) a.get("totalSpent")))
                .limit(10)
                .collect(Collectors.toList());

        analytics.put("topCustomers", topCustomers);
        analytics.put("uniqueCustomers", customerSales.size());
        analytics.put("averageOrdersPerCustomer",
                customerSales.size() > 0 ? (double) sales.size() / customerSales.size() : 0);

        return analytics;
    }

    // =======================================
    // LOW STOCK DATA GENERATION
    // =======================================

    private Map<String, Object> generateLowStockData(Integer threshold) {
        Map<String, Object> data = new HashMap<>();

        // Get all medicines
        List<Medicine> allMedicines = medicineRepository.findAll();

        // Filter low stock medicines
        List<Medicine> lowStockMedicines = allMedicines.stream()
                .filter(m -> m.getQuantity() <= threshold)
                .sorted(Comparator.comparing(Medicine::getQuantity))
                .collect(Collectors.toList());

        // Out of stock medicines
        List<Medicine> outOfStockMedicines = allMedicines.stream()
                .filter(m -> m.getQuantity() == 0)
                .collect(Collectors.toList());

        // Expired medicines
        LocalDate today = LocalDate.now();
        List<Medicine> expiredMedicines = allMedicines.stream()
                .filter(m -> m.getExpiryDate() != null && m.getExpiryDate().isBefore(today))
                .collect(Collectors.toList());

        // Expiring soon (within 30 days)
        LocalDate thirtyDaysFromNow = today.plusDays(30);
        List<Medicine> expiringSoonMedicines = allMedicines.stream()
                .filter(m -> m.getExpiryDate() != null &&
                        m.getExpiryDate().isAfter(today) &&
                        m.getExpiryDate().isBefore(thirtyDaysFromNow))
                .collect(Collectors.toList());

        // Summary statistics
        Map<String, Object> summary = new HashMap<>();
        summary.put("totalMedicines", allMedicines.size());
        summary.put("lowStockCount", lowStockMedicines.size());
        summary.put("outOfStockCount", outOfStockMedicines.size());
        summary.put("expiredCount", expiredMedicines.size());
        summary.put("expiringSoonCount", expiringSoonMedicines.size());
        summary.put("threshold", threshold);
        summary.put("generatedAt", Instant.now().toString());

        // Low stock items detail
        List<Map<String, Object>> lowStockDetails = lowStockMedicines.stream()
                .map(medicine -> {
                    Map<String, Object> item = new HashMap<>();
                    item.put("id", medicine.getId());
                    item.put("name", medicine.getName());
                    item.put("category", medicine.getCategory());
                    item.put("currentStock", medicine.getQuantity());
                    item.put("price", medicine.getPrice().doubleValue());
                    item.put("expiryDate", medicine.getExpiryDate() != null ? medicine.getExpiryDate().toString() : null);

                    // Calculate status
                    String status = "LOW_STOCK";
                    if (medicine.getQuantity() == 0) {
                        status = "OUT_OF_STOCK";
                    }
                    if (medicine.getExpiryDate() != null && medicine.getExpiryDate().isBefore(today)) {
                        status = "EXPIRED";
                    }
                    item.put("status", status);

                    // Calculate days until expiry
                    if (medicine.getExpiryDate() != null) {
                        long daysUntilExpiry = ChronoUnit.DAYS.between(today, medicine.getExpiryDate());
                        item.put("daysUntilExpiry", daysUntilExpiry);
                    }

                    return item;
                })
                .collect(Collectors.toList());

        // Category-wise analysis
        Map<String, Long> categoryBreakdown = lowStockMedicines.stream()
                .collect(Collectors.groupingBy(
                        medicine -> medicine.getCategory() != null ? medicine.getCategory() : "Uncategorized",
                        Collectors.counting()
                ));

        // Critical alerts
        List<Map<String, Object>> criticalAlerts = new ArrayList<>();

        // Add out of stock alerts
        outOfStockMedicines.forEach(medicine -> {
            Map<String, Object> alert = new HashMap<>();
            alert.put("type", "OUT_OF_STOCK");
            alert.put("severity", "HIGH");
            alert.put("medicineId", medicine.getId());
            alert.put("medicineName", medicine.getName());
            alert.put("category", medicine.getCategory());
            alert.put("message", "Medicine is completely out of stock");
            criticalAlerts.add(alert);
        });

        // Add expired alerts
        expiredMedicines.forEach(medicine -> {
            Map<String, Object> alert = new HashMap<>();
            alert.put("type", "EXPIRED");
            alert.put("severity", "HIGH");
            alert.put("medicineId", medicine.getId());
            alert.put("medicineName", medicine.getName());
            alert.put("category", medicine.getCategory());
            alert.put("expiryDate", medicine.getExpiryDate().toString());
            alert.put("message", "Medicine has expired and should be removed");
            criticalAlerts.add(alert);
        });

        // Add expiring soon alerts
        expiringSoonMedicines.forEach(medicine -> {
            Map<String, Object> alert = new HashMap<>();
            alert.put("type", "EXPIRING_SOON");
            alert.put("severity", "MEDIUM");
            alert.put("medicineId", medicine.getId());
            alert.put("medicineName", medicine.getName());
            alert.put("category", medicine.getCategory());
            alert.put("expiryDate", medicine.getExpiryDate().toString());
            alert.put("daysUntilExpiry", ChronoUnit.DAYS.between(today, medicine.getExpiryDate()));
            alert.put("message", "Medicine will expire within 30 days");
            criticalAlerts.add(alert);
        });

        // Build final data structure
        data.put("summary", summary);
        data.put("lowStockItems", lowStockDetails);
        data.put("categoryBreakdown", categoryBreakdown);
        data.put("criticalAlerts", criticalAlerts);

        // Recommendations
        List<String> recommendations = generateStockRecommendations(lowStockMedicines, outOfStockMedicines, expiredMedicines);
        data.put("recommendations", recommendations);

        return data;
    }

    private List<String> generateStockRecommendations(List<Medicine> lowStock, List<Medicine> outOfStock, List<Medicine> expired) {
        List<String> recommendations = new ArrayList<>();

        if (!outOfStock.isEmpty()) {
            recommendations.add("URGENT: Restock " + outOfStock.size() + " out-of-stock medicines immediately");
        }

        if (!expired.isEmpty()) {
            recommendations.add("Remove " + expired.size() + " expired medicines from inventory");
        }

        if (!lowStock.isEmpty()) {
            recommendations.add("Order " + lowStock.size() + " medicines with low stock levels");
        }

        if (recommendations.isEmpty()) {
            recommendations.add("Stock levels are healthy - no immediate action required");
        }

        return recommendations;
    }

    private Map<String, Object> calculateStockAnalytics() {
        List<Medicine> allMedicines = medicineRepository.findAll();

        Map<String, Object> analytics = new HashMap<>();

        BigDecimal totalStockValue = allMedicines.stream()
                .map(m -> m.getPrice().multiply(BigDecimal.valueOf(m.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long lowStockCount = allMedicines.stream().filter(m -> m.getQuantity() <= 10).count();
        long expiredCount = allMedicines.stream()
                .filter(m -> m.getExpiryDate() != null && m.getExpiryDate().isBefore(LocalDate.now()))
                .count();

        analytics.put("totalMedicines", allMedicines.size());
        analytics.put("totalStockValue", totalStockValue.doubleValue());
        analytics.put("lowStockCount", lowStockCount);
        analytics.put("expiredCount", expiredCount);
        analytics.put("healthyStockCount", allMedicines.size() - lowStockCount - expiredCount);

        return analytics;
    }

    private Map<String, Object> calculateDeliveryAnalytics(Instant start, Instant end) {
        // Get sales with deliveries in the date range
        List<Sale> sales = saleRepository.findBySaleDateBetween(start, end);
        List<Delivery> deliveries = sales.stream()
                .map(Sale::getDelivery)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        Map<String, Object> analytics = new HashMap<>();

        long totalDeliveries = deliveries.size();
        long completedDeliveries = deliveries.stream()
                .filter(d -> d.getStatus() == DeliveryStatus.DELIVERED)
                .count();

        double completionRate = totalDeliveries > 0 ?
                (double) completedDeliveries / totalDeliveries * 100 : 0;

        // Calculate average delivery time for completed deliveries
        double averageDeliveryTimeHours = deliveries.stream()
                .filter(d -> d.getStatus() == DeliveryStatus.DELIVERED && d.getDeliveryDate() != null)
                .mapToLong(d -> ChronoUnit.HOURS.between(d.getCreatedAt(), d.getDeliveryDate()))
                .average()
                .orElse(0);

        analytics.put("totalDeliveries", totalDeliveries);
        analytics.put("completedDeliveries", completedDeliveries);
        analytics.put("completionRate", completionRate);
        analytics.put("averageDeliveryTimeHours", averageDeliveryTimeHours);

        return analytics;
    }
}
