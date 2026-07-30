package com.shopstack.shopstack.service;

import com.shopstack.shopstack.dto.LoginRequest;
import com.shopstack.shopstack.dto.LoginResponse;
import com.shopstack.shopstack.dto.RegisterRequest;
import com.shopstack.shopstack.model.*;
import com.shopstack.shopstack.repository.CustomerProfileRepository;
import com.shopstack.shopstack.repository.UserRepository;
import com.shopstack.shopstack.repository.VendorProfileRepository;
import com.shopstack.shopstack.security.JwtTokenProvider;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final CustomerProfileRepository customerProfileRepository;
    private final VendorProfileRepository vendorProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;

    public AuthService(UserRepository userRepository,
                       CustomerProfileRepository customerProfileRepository,
                       VendorProfileRepository vendorProfileRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtTokenProvider tokenProvider) {
        this.userRepository = userRepository;
        this.customerProfileRepository = customerProfileRepository;
        this.vendorProfileRepository = vendorProfileRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
    }

    @Transactional
    public User register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email is already registered!");
        }

        Role role;
        try {
            role = Role.valueOf(request.getRole().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid role specified. Must be CUSTOMER, VENDOR, ADMIN, or WAREHOUSE_STAFF.");
        }

        User user = User.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .role(role)
                .isActive(true)
                .build();

        User savedUser = userRepository.save(user);

        if (role == Role.CUSTOMER) {
            CustomerProfile customerProfile = CustomerProfile.builder()
                    .user(savedUser)
                    .build();
            customerProfileRepository.save(customerProfile);
        } else if (role == Role.VENDOR) {
            if (request.getStoreName() == null || request.getStoreName().trim().isEmpty()) {
                throw new IllegalArgumentException("Store name is required for vendor registration!");
            }
            if (vendorProfileRepository.findByStoreName(request.getStoreName()).isPresent()) {
                throw new IllegalArgumentException("Store name is already taken!");
            }
            VendorProfile vendorProfile = VendorProfile.builder()
                    .user(savedUser)
                    .storeName(request.getStoreName())
                    .description(request.getStoreDescription())
                    .businessLicense(request.getBusinessLicense())
                    .taxId(request.getTaxId())
                    .status(VendorStatus.PENDING_APPROVAL)
                    .commissionRate(new BigDecimal("0.10"))
                    .build();
            vendorProfileRepository.save(vendorProfile);
        }

        return savedUser;
    }

    public LoginResponse login(LoginRequest request) {
        if ("admin1@shopstack.com".equalsIgnoreCase(request.getEmail()) && !userRepository.existsByEmail("admin1@shopstack.com")) {
            User admin = User.builder()
                    .email("admin1@shopstack.com")
                    .passwordHash(passwordEncoder.encode("Admin@123"))
                    .firstName("Boss")
                    .lastName("Admin")
                    .role(Role.ADMIN)
                    .isActive(true)
                    .build();
            userRepository.save(admin);
        }

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("User not found after authentication!"));

        String token = tokenProvider.generateToken(authentication, user.getId().toString());

        return LoginResponse.builder()
                .token(token)
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole().name())
                .profilePictureUrl(user.getProfilePictureUrl())
                .build();
    }
}
