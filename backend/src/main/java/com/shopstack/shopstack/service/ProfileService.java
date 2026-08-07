package com.shopstack.shopstack.service;

import com.shopstack.shopstack.model.*;
import com.shopstack.shopstack.repository.CustomerProfileRepository;
import com.shopstack.shopstack.repository.UserRepository;
import com.shopstack.shopstack.repository.VendorProfileRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
public class ProfileService {

    private final UserRepository userRepository;
    private final CustomerProfileRepository customerProfileRepository;
    private final VendorProfileRepository vendorProfileRepository;

    public ProfileService(UserRepository userRepository,
                          CustomerProfileRepository customerProfileRepository,
                          VendorProfileRepository vendorProfileRepository) {
        this.userRepository = userRepository;
        this.customerProfileRepository = customerProfileRepository;
        this.vendorProfileRepository = vendorProfileRepository;
    }

    public CustomerProfile getCustomerProfile(UUID userId) {
        return customerProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Customer profile not found for user: " + userId));
    }

    @Transactional
    public CustomerProfile updateCustomerProfile(UUID userId, CustomerProfile updated) {
        CustomerProfile existing = getCustomerProfile(userId);
        existing.setPhone(updated.getPhone());
        existing.setShippingAddress(updated.getShippingAddress());
        existing.setBillingAddress(updated.getBillingAddress());
        return customerProfileRepository.save(existing);
    }

    public VendorProfile getVendorProfile(UUID userId) {
        return vendorProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Vendor profile not found for user: " + userId));
    }

    @Transactional
    public VendorProfile updateVendorProfile(UUID userId, VendorProfile updated) {
        VendorProfile existing = getVendorProfile(userId);
        
        // If changing store name, make sure it is unique
        if (!existing.getStoreName().equals(updated.getStoreName())) {
            if (vendorProfileRepository.findByStoreName(updated.getStoreName()).isPresent()) {
                throw new IllegalArgumentException("Store name is already taken!");
            }
            existing.setStoreName(updated.getStoreName());
        }
        
        existing.setDescription(updated.getDescription());
        existing.setBusinessLicense(updated.getBusinessLicense());
        existing.setTaxId(updated.getTaxId());
        return vendorProfileRepository.save(existing);
    }

    @Transactional
    public VendorProfile updateVendorStatus(UUID vendorProfileId, VendorStatus status, BigDecimal commissionRate) {
        VendorProfile profile = vendorProfileRepository.findById(vendorProfileId)
                .orElseThrow(() -> new IllegalArgumentException("Vendor profile not found with ID: " + vendorProfileId));
        
        profile.setStatus(status);
        if (commissionRate != null) {
            profile.setCommissionRate(validateAndNormalizeRate(commissionRate));
        }
        return vendorProfileRepository.save(profile);
    }

    @Transactional
    public VendorProfile updateVendorCommission(UUID vendorProfileId, BigDecimal commissionRate) {
        VendorProfile profile = vendorProfileRepository.findById(vendorProfileId)
                .orElseThrow(() -> new IllegalArgumentException("Vendor profile not found with ID: " + vendorProfileId));
        
        if (commissionRate == null) {
            throw new IllegalArgumentException("Commission rate cannot be null");
        }
        
        profile.setCommissionRate(validateAndNormalizeRate(commissionRate));
        return vendorProfileRepository.save(profile);
    }

    private BigDecimal validateAndNormalizeRate(BigDecimal rate) {
        if (rate.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Commission rate cannot be negative");
        }
        // If rate is provided as percentage (e.g. 10 or 15 instead of 0.10 or 0.15)
        if (rate.compareTo(BigDecimal.ONE) > 0) {
            if (rate.compareTo(BigDecimal.valueOf(100)) <= 0) {
                rate = rate.divide(BigDecimal.valueOf(100), 4, java.math.RoundingMode.HALF_UP);
            } else {
                throw new IllegalArgumentException("Commission rate cannot exceed 100%");
            }
        }
        return rate.setScale(4, java.math.RoundingMode.HALF_UP);
    }

    public List<VendorProfile> getVendorsByStatus(VendorStatus status) {
        return vendorProfileRepository.findByStatus(status);
    }

    public List<VendorProfile> getAllVendors() {
        return vendorProfileRepository.findAll();
    }

     public long getCustomerCount(){
        return userRepository.countByRole(Role.CUSTOMER);
     }

      public List<User> getCustomers() {
          return userRepository.findByRole(Role.CUSTOMER);
      }

      @Transactional
      public User toggleUserStatus(UUID userId) {
          User user = userRepository.findById(userId)
                  .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));
          user.setActive(!user.isActive());
          return userRepository.save(user);
      }

}
