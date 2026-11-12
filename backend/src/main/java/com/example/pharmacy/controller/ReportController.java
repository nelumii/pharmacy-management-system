// src/main/java/com/example/pharmacy/controller/ReportController.java
package com.example.pharmacy.controller;

import com.example.pharmacy.dto.ReportRequest;
import com.example.pharmacy.entity.Report;
import com.example.pharmacy.entity.ReportType;
import com.example.pharmacy.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    @Autowired
    private ReportService reportService;

    // Generate Reports
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<Report> generateReport(@RequestBody ReportRequest request) {
        try {
            Report report = switch (request.getType()) {
                case SALES_SUMMARY -> reportService.generateSalesSummary(
                        request.getStart(),
                        request.getEnd()
                );
                case LOW_STOCK -> reportService.generateLowStockReport(
                        request.getThreshold() != null ? request.getThreshold() : 10
                );
                default -> throw new IllegalArgumentException("Unsupported report type: " + request.getType());
            };

            return ResponseEntity.ok(report);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Get All Reports
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<List<Report>> getAllReports() {
        try {
            List<Report> reports = reportService.getAllReports();
            return ResponseEntity.ok(reports);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Get Report by ID
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{id}")
    public ResponseEntity<Report> getReportById(@PathVariable Long id) {
        try {
            Report report = reportService.getReportById(id);
            return ResponseEntity.ok(report);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Delete Report
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReport(@PathVariable Long id) {
        try {
            reportService.deleteReport(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Get Reports by Type
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/type/{type}")
    public ResponseEntity<List<Report>> getReportsByType(@PathVariable ReportType type) {
        try {
            List<Report> reports = reportService.getReportsByType(type);
            return ResponseEntity.ok(reports);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Quick Generate Sales Summary (with default date range - last 30 days)
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/quick/sales")
    public ResponseEntity<Report> quickSalesSummary() {
        try {
            java.time.Instant end = java.time.Instant.now();
            java.time.Instant start = end.minus(30, java.time.temporal.ChronoUnit.DAYS);

            Report report = reportService.generateSalesSummary(start, end);
            return ResponseEntity.ok(report);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Quick Generate Low Stock Report (with default threshold)
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/quick/lowstock")
    public ResponseEntity<Report> quickLowStockReport() {
        try {
            Report report = reportService.generateLowStockReport(10);
            return ResponseEntity.ok(report);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
