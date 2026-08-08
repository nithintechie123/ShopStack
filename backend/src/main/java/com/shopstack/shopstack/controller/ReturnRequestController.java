package com.shopstack.shopstack.controller;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.shopstack.shopstack.dto.VendorReturnResponse;
import com.shopstack.shopstack.model.ReturnRequest;
import com.shopstack.shopstack.model.User;
import com.shopstack.shopstack.repository.UserRepository;
import com.shopstack.shopstack.service.ReturnRequestService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class ReturnRequestController {

    private final ReturnRequestService returnRequestService;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("Not authenticated");
        }

        String email = authentication.getName();

        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @PostMapping("/api/returns/{orderId}")
    public ResponseEntity<?> submitReturnRequest(
            @PathVariable UUID orderId,
            @RequestBody Map<String, String> request) {

        try {

            User user = getCurrentUser();

            ReturnRequest returnRequest =
                    returnRequestService.createReturnRequest(
                            orderId,
                            request.get("reason"),
                            request.get("description"),
                            user);

            return ResponseEntity.ok(returnRequest);

        } catch (Exception e) {

            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/api/returns/{orderId}")
    public ResponseEntity<?> getReturnRequest(
            @PathVariable UUID orderId) {

        try {

            User user = getCurrentUser();

            ReturnRequest request =
                    returnRequestService.getReturnRequest(orderId, user);

            return ResponseEntity.ok(request);

        } catch (Exception e) {

            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/api/vendor/returns")
    public ResponseEntity<?> getVendorReturnRequests() {

        try {

            User vendor = getCurrentUser();

            List<VendorReturnResponse> requests =
                    returnRequestService.getVendorReturnRequests(vendor);

            return ResponseEntity.ok(requests);

        } catch (Exception e) {

            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/api/returns/{orderId}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable UUID orderId,
            @RequestBody Map<String, String> body) {

        try {

            ReturnRequest request =
                    returnRequestService.updateStatus(
                            orderId,
                            body.get("status"));

            return ResponseEntity.ok(request);

        } catch (Exception e) {

            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }
}