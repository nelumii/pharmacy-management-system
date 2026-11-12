// src/main/java/com/example/pharmacy/service/MedicineService.java
package com.example.pharmacy.service;

import com.example.pharmacy.entity.Medicine;
import com.example.pharmacy.repository.MedicineRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
@Transactional
public class MedicineService {

    @Autowired
    private MedicineRepository medicineRepository;

    // Get all active medicines
    @Transactional(readOnly = true)
    public List<Medicine> all() {
        return medicineRepository.findByActiveTrue();
    }

    // Get medicine by ID (active only)
    @Transactional(readOnly = true)
    public Medicine get(Long id) {
        return medicineRepository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new RuntimeException("Medicine not found with id: " + id));
    }

    // Get all medicines (including inactive) - for admin
    @Transactional(readOnly = true)
    public List<Medicine> getAllIncludingInactive() {
        return medicineRepository.findAll();
    }

    // Save medicine
    @Transactional
    public Medicine save(Medicine medicine) {
        if (medicine.getCreatedAt() == null) {
            medicine.setCreatedAt(Instant.now());
        }
        if (medicine.getActive() == null) {
            medicine.setActive(true);
        }
        return medicineRepository.save(medicine);
    }

    // Soft delete - mark as inactive
    @Transactional
    public void delete(Long id) {
        System.out.println("🗑️ Soft deleting medicine with ID: " + id);

        Medicine medicine = medicineRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Medicine not found with id: " + id));

        // Mark as inactive instead of deleting
        medicine.setActive(false);
        medicineRepository.save(medicine);

        System.out.println("✅ Medicine marked as inactive: " + medicine.getName());
    }

    // Reactivate medicine
    @Transactional
    public Medicine reactivate(Long id) {
        Medicine medicine = medicineRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Medicine not found with id: " + id));
        medicine.setActive(true);
        return medicineRepository.save(medicine);
    }

    // Get available medicines for customers (active and quantity > 0)
    @Transactional(readOnly = true)
    public List<Medicine> availableForCustomers() {
        return medicineRepository.findByActiveTrueAndQuantityGreaterThan(0);
    }

    // Hard delete (for admin only - use with extreme caution)
    @Transactional
    public void hardDelete(Long id) {
        Medicine medicine = medicineRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Medicine not found with id: " + id));
        medicineRepository.delete(medicine);
    }
}
