package com.shopstack.shopstack.controller;

import com.shopstack.shopstack.model.CustomerProfile;
import com.shopstack.shopstack.model.User;
import com.shopstack.shopstack.model.VendorProfile;
import com.shopstack.shopstack.repository.UserRepository;
import com.shopstack.shopstack.service.ProfileService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/profiles")
public class ProfileController {

    private final ProfileService profileService;
    private final UserRepository userRepository;

    public ProfileController(ProfileService profileService, UserRepository userRepository) {
        this.profileService = profileService;
        this.userRepository = userRepository;
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalStateException("Not authenticated");
        }
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    @GetMapping("/customer")
    public ResponseEntity<?> getCustomerProfile() {
        try {
            User user = getCurrentUser();
            CustomerProfile profile = profileService.getCustomerProfile(user.getId());
            return ResponseEntity.ok(profile);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/customer")
    public ResponseEntity<?> updateCustomerProfile(@RequestBody CustomerProfile request) {
        try {
            User user = getCurrentUser();
            CustomerProfile updated = profileService.updateCustomerProfile(user.getId(), request);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/vendor")
    public ResponseEntity<?> getVendorProfile() {
        try {
            User user = getCurrentUser();
            VendorProfile profile = profileService.getVendorProfile(user.getId());
            return ResponseEntity.ok(profile);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/vendor")
    public ResponseEntity<?> updateVendorProfile(@RequestBody VendorProfile request) {
        try {
            User user = getCurrentUser();
            VendorProfile updated = profileService.updateVendorProfile(user.getId(), request);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/avatar")
    public ResponseEntity<?> updateAvatar(@RequestBody Map<String, String> request) {
        try {
            User user = getCurrentUser();
            String avatarUrl = request.get("avatarUrl");
            user.setProfilePictureUrl(avatarUrl);
            userRepository.save(user);
            return ResponseEntity.ok(Map.of("message", "Profile picture updated successfully", "profilePictureUrl", avatarUrl));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/avatar")
    public ResponseEntity<?> removeAvatar() {
        try {
            User user = getCurrentUser();
            user.setProfilePictureUrl(null);
            userRepository.save(user);
            return ResponseEntity.ok(Map.of("message", "Profile picture removed successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
