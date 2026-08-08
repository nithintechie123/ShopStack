package com.shopstack.shopstack;

import com.shopstack.shopstack.model.*;
import com.shopstack.shopstack.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Component
public class CategorySeeder implements CommandLineRunner {

    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final VendorProfileRepository vendorProfileRepository;
    private final ProductRepository productRepository;
    private final PasswordEncoder passwordEncoder;
    private final CouponRepository couponRepository;

    public CategorySeeder(CategoryRepository categoryRepository,
                          UserRepository userRepository,
                          VendorProfileRepository vendorProfileRepository,
                          ProductRepository productRepository,
                          PasswordEncoder passwordEncoder, CouponRepository couponRepository) {
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
        this.vendorProfileRepository = vendorProfileRepository;
        this.productRepository = productRepository;
        this.passwordEncoder = passwordEncoder;
        this.couponRepository = couponRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        
        if (couponRepository.count() == 0) {
            Coupon save20 = Coupon.builder()
                    .code("SAVE20")
                    .discountType("PERCENTAGE")
                    .discountValue(new BigDecimal("20.00"))
                    .minOrderAmount(new BigDecimal("500.00"))
                    .maxDiscountAmount(new BigDecimal("1000.00"))
                    .usageLimit(100)
                    .usedCount(5)
                    .description("Get 20% off on orders above ₹500 (Max discount ₹1000)")
                    .expiryDate(LocalDateTime.now().plusYears(2))
                    .active(true)
                    .build();

            Coupon flat500 = Coupon.builder()
                    .code("FLAT500")
                    .discountType("FLAT")
                    .discountValue(new BigDecimal("500.00"))
                    .minOrderAmount(new BigDecimal("2000.00"))
                    .usageLimit(50)
                    .usedCount(12)
                    .description("Flat ₹500 discount on orders above ₹2000")
                    .expiryDate(LocalDateTime.now().plusYears(2))
                    .active(true)
                    .build();

            Coupon welcome10 = Coupon.builder()
                    .code("WELCOME10")
                    .discountType("PERCENTAGE")
                    .discountValue(new BigDecimal("10.00"))
                    .minOrderAmount(new BigDecimal("100.00"))
                    .usageLimit(500)
                    .usedCount(42)
                    .description("10% instant discount on your purchase")
                    .expiryDate(LocalDateTime.now().plusYears(3))
                    .active(true)
                    .build();

            Coupon expired20 = Coupon.builder()
                    .code("EXPIRED20")
                    .discountType("PERCENTAGE")
                    .discountValue(new BigDecimal("20.00"))
                    .description("Expired summer promotion")
                    .expiryDate(LocalDateTime.now().minusMonths(1))
                    .active(true)
                    .build();

            couponRepository.save(save20);
            couponRepository.save(flat500);
            couponRepository.save(welcome10);
            couponRepository.save(expired20);
            System.out.println("Seeded default coupons: SAVE20, FLAT500, WELCOME10, EXPIRED20");
        }

        List<Category> defaultCategories = Arrays.asList(
                Category.builder().name("Electronics").slug("electronics").build(),
                Category.builder().name("Fashion").slug("fashion").build(),
                Category.builder().name("Home & Kitchen").slug("home-kitchen").build(),
                Category.builder().name("Books").slug("books").build(),
                Category.builder().name("Sports & Outdoors").slug("sports-outdoors").build(),
                Category.builder().name("Beauty & Care").slug("beauty-care").build(),
                Category.builder().name("Toys & Games").slug("toys-games").build(),
                Category.builder().name("Groceries").slug("groceries").build()
        );

        for (Category cat : defaultCategories) {
            if (categoryRepository.findBySlug(cat.getSlug()).isEmpty()) {
                categoryRepository.save(cat);
                System.out.println("Seeded category: " + cat.getName());
            }
        }
        // System.out.println("Category seeding check complete!");

        // Seed default admin
        User adminUser = userRepository.findByEmail("admin1@shopstack.com").orElse(null);
        if (adminUser == null) {
            adminUser = User.builder()
                    .email("admin1@shopstack.com")
                    .passwordHash(passwordEncoder.encode("Admin@123"))
                    .firstName("Boss")
                    .lastName("Admin")
                    .role(Role.ADMIN)
                    .isActive(true)
                    .build();
            userRepository.save(adminUser);
            System.out.println("Seeded admin: admin1@shopstack.com / Admin@123");
        }

        // Seed default vendor
        User vendorUser = userRepository.findByEmail("vendor1@shopstack.com").orElse(null);
        if (vendorUser == null) {
            vendorUser = User.builder()
                    .email("vendor1@shopstack.com")
                    .passwordHash(passwordEncoder.encode("Vendor@123"))
                    .firstName("Jane")
                    .lastName("Vendor")
                    .role(Role.VENDOR)
                    .isActive(true)
                    .build();
            vendorUser = userRepository.save(vendorUser);
            System.out.println("Seeded default vendor user.");
        }
        
        // Seed suspended user
        User suspendedUser = userRepository.findByEmail("suspended@shopstack.com").orElse(null);
        if (suspendedUser == null) {
            suspendedUser = User.builder()
                    .email("suspended@shopstack.com")
                    .passwordHash(passwordEncoder.encode("Suspended@123"))
                    .firstName("Suspended")
                    .lastName("User")
                    .role(Role.CUSTOMER)
                    .isActive(false)
                    .build();
            userRepository.save(suspendedUser);
            System.out.println("Seeded suspended user: suspended@shopstack.com / Suspended@123");
        }

        VendorProfile vendorProfile = vendorProfileRepository.findByUserId(vendorUser.getId()).orElse(null);
        if (vendorProfile == null) {
            vendorProfile = VendorProfile.builder()
                    .user(vendorUser)
                    .storeName("ShopStack Emporium")
                    .description("The primary flagship store of ShopStack, providing a massive variety of goods.")
                    .businessLicense("LIC-998822")
                    .taxId("TAX-772211")
                    .status(VendorStatus.APPROVED)
                    .commissionRate(new BigDecimal("0.10"))
                    .build();
            vendorProfile = vendorProfileRepository.save(vendorProfile);
            System.out.println("Seeded default vendor profile.");
        }

        // Product seeding disabled as requested
    }

    private void seedProduct(VendorProfile vendor, Category category, String name, String slug, String brand, 
                             String description, BigDecimal price, int stock, String imageUrl) {
        Product product = Product.builder()
                .vendor(vendor)
                .category(category)
                .name(name)
                .slug(slug + "-" + UUID.randomUUID().toString().substring(0, 6))
                .brand(brand)
                .description(description)
                .price(price)
                .stockQuantity(stock)
                .status(ProductStatus.APPROVED)
                .images(new ArrayList<>())
                .reviews(new ArrayList<>())
                .build();

        ProductImage image = ProductImage.builder()
                .product(product)
                .imageUrl(imageUrl)
                .isPrimary(true)
                .build();

        product.getImages().add(image);
        productRepository.save(product);
    }
}
