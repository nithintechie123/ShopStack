package com.shopstack.shopstack.service;

import com.shopstack.shopstack.model.*;
import com.shopstack.shopstack.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ProductService {

    @jakarta.persistence.PersistenceContext
    private jakarta.persistence.EntityManager entityManager;

    private final ProductRepository productRepository;
    private final VendorProfileRepository vendorProfileRepository;
    private final CategoryRepository categoryRepository;
    private final ProductReviewRepository reviewRepository;
    private final ProductImageRepository imageRepository;
    private final OrderRepository orderRepository;

    public ProductService(ProductRepository productRepository,
                          VendorProfileRepository vendorProfileRepository,
                          CategoryRepository categoryRepository,
                          ProductReviewRepository reviewRepository,
                          ProductImageRepository imageRepository,
                          OrderRepository orderRepository) {
        this.productRepository = productRepository;
        this.vendorProfileRepository = vendorProfileRepository;
        this.categoryRepository = categoryRepository;
        this.reviewRepository = reviewRepository;
        this.imageRepository = imageRepository;
        this.orderRepository = orderRepository;
    }

    @Transactional
    public Product createProduct(UUID vendorUserId, Product product, UUID categoryId) {
        VendorProfile vendor = vendorProfileRepository.findByUserId(vendorUserId)
                .orElseThrow(() -> new IllegalArgumentException("Vendor profile not found for user!"));
        
        if (vendor.getStatus() != VendorStatus.APPROVED) {
            throw new IllegalArgumentException("Your vendor account is not approved yet! Cannot create products.");
        }

        product.setVendor(vendor);
        product.setStatus(ProductStatus.DRAFT);

        // Generate slug from product name + random suffix for uniqueness
        String baseSlug = product.getName().toLowerCase()
                .replaceAll("[^a-z0-9\\s]", "")
                .replaceAll("\\s+", "-");
        String finalSlug = baseSlug + "-" + UUID.randomUUID().toString().substring(0, 6);
        product.setSlug(finalSlug);

        if (categoryId != null) {
            Category category = categoryRepository.findById(categoryId)
                    .orElseThrow(() -> new IllegalArgumentException("Category not found!"));
            product.setCategory(category);
        }

        if (product.getImages() != null) {
            for (ProductImage image : product.getImages()) {
                image.setProduct(product);
            }
        }

        return productRepository.save(product);
    }

    @Transactional
    public Product updateProduct(UUID vendorUserId, UUID productId, Product updatedProduct, UUID categoryId) {
        Product existing = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found!"));

        // Security check: Only the owning vendor can update the product
        if (!existing.getVendor().getUser().getId().equals(vendorUserId)) {
            throw new SecurityException("Unauthorized: You do not own this product!");
        }

        existing.setName(updatedProduct.getName());
        existing.setBrand(updatedProduct.getBrand());
        existing.setDescription(updatedProduct.getDescription());
        existing.setPrice(updatedProduct.getPrice());
        existing.setStockQuantity(updatedProduct.getStockQuantity());
        
        // Reset approval if product was modified (standard marketplace safety)
        if (existing.getStatus() == ProductStatus.APPROVED) {
            existing.setStatus(ProductStatus.PENDING_APPROVAL);
        }

        if (categoryId != null) {
            Category category = categoryRepository.findById(categoryId)
                    .orElseThrow(() -> new IllegalArgumentException("Category not found!"));
            existing.setCategory(category);
        }

        return productRepository.save(existing);
    }

    @Transactional
    public Product updateStockQuantity(User user, UUID productId, Integer newStockQuantity) {
        if (newStockQuantity < 0) {
            throw new IllegalArgumentException("Stock quantity cannot be negative");
        }

        Product existing = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found!"));

        boolean isAdmin = user.getRole() == Role.ADMIN;
        boolean isVendor = existing.getVendor() != null &&
                existing.getVendor().getUser() != null &&
                existing.getVendor().getUser().getId().equals(user.getId());

        if (!isAdmin && !isVendor) {
            throw new SecurityException("Unauthorized to update inventory stock for this product");
        }

        existing.setStockQuantity(newStockQuantity);
        return productRepository.save(existing);
    }

    @Transactional
    public Product submitForApproval(UUID vendorUserId, UUID productId) {
        Product existing = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found!"));

        if (!existing.getVendor().getUser().getId().equals(vendorUserId)) {
            throw new SecurityException("Unauthorized");
        }

        existing.setStatus(ProductStatus.PENDING_APPROVAL);
        return productRepository.save(existing);
    }

    @Transactional
    public Product approveProduct(UUID productId, ProductStatus status) {
        Product existing = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found!"));
        
        if (status != ProductStatus.APPROVED && status != ProductStatus.REJECTED) {
            throw new IllegalArgumentException("Admin can only set status to APPROVED or REJECTED");
        }
        
        existing.setStatus(status);
        return productRepository.save(existing);
    }

    public Product getProductBySlug(String slug) {
        Product product = productRepository.findBySlug(slug)
                .orElseThrow(() -> new IllegalArgumentException("Product not found!"));
        
        // Return product images and reviews
        product.getImages().size(); // Trigger lazy load
        product.getReviews().size(); // Trigger lazy load
        return product;
    }

    public List<Product> getProductsByVendor(UUID vendorUserId) {
        VendorProfile vendor = vendorProfileRepository.findByUserId(vendorUserId)
                .orElseThrow(() -> new IllegalArgumentException("Vendor not found"));
        return productRepository.findByVendorId(vendor.getId());
    }

    public List<Product> getPendingProducts() {
        return productRepository.findByStatus(ProductStatus.PENDING_APPROVAL);
    }

    public List<Product> searchProducts(String query, UUID categoryId, BigDecimal minPrice, BigDecimal maxPrice) {
        List<Product> products = productRepository.findByStatus(ProductStatus.APPROVED);

        if (query != null && !query.trim().isEmpty()) {
            products = productRepository.searchApprovedProducts(query, ProductStatus.APPROVED);
        }

        return products.stream()
                .filter(p -> categoryId == null || (p.getCategory() != null && p.getCategory().getId().equals(categoryId)))
                .filter(p -> minPrice == null || p.getPrice().compareTo(minPrice) >= 0)
                .filter(p -> maxPrice == null || p.getPrice().compareTo(maxPrice) <= 0)
                .collect(Collectors.toList());
    }

    @Transactional
    public ProductImage addProductImage(UUID vendorUserId, UUID productId, String imageUrl, boolean isPrimary) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        if (!product.getVendor().getUser().getId().equals(vendorUserId)) {
            throw new SecurityException("Unauthorized");
        }

        if (isPrimary) {
            // Mark all other images of this product as non-primary
            product.getImages().forEach(img -> {
                if (img.isPrimary()) {
                    img.setPrimary(false);
                    imageRepository.save(img);
                }
            });
        }

        ProductImage image = ProductImage.builder()
                .product(product)
                .imageUrl(imageUrl)
                .isPrimary(isPrimary)
                .build();

        return imageRepository.save(image);
    }

    @Transactional
    public ProductReview addReview(User user, UUID productId, Integer rating, String comment) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        if (rating < 1 || rating > 5) {
            throw new IllegalArgumentException("Rating must be between 1 and 5");
        }

        boolean hasPurchased = orderRepository.hasUserPurchasedAndReceivedProduct(user.getId(), productId);
        if (!hasPurchased) {
            throw new IllegalArgumentException("You can only review products you have purchased and received.");
        }

        ProductReview review = ProductReview.builder()
                .product(product)
                .user(user)
                .rating(rating)
                .comment(comment)
                .build();

        return reviewRepository.save(review);
    }

    @Transactional
    public void deleteProduct(UUID userId, Role role, UUID productId) {
        Product existing = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found!"));

        boolean isAdmin = role == Role.ADMIN;
        boolean isOwnerVendor = existing.getVendor() != null &&
                existing.getVendor().getUser() != null &&
                existing.getVendor().getUser().getId().equals(userId);

        if (!isAdmin && !isOwnerVendor) {
            throw new SecurityException("Unauthorized: You cannot delete this product!");
        }

        // Delete references to avoid FK constraint violations
        entityManager.createNativeQuery("DELETE FROM warehouse_inventory WHERE product_id = :productId")
                .setParameter("productId", productId)
                .executeUpdate();

        entityManager.createNativeQuery("DELETE FROM stock_movements WHERE product_id = :productId")
                .setParameter("productId", productId)
                .executeUpdate();

        entityManager.createNativeQuery("DELETE FROM wishlist_items WHERE product_id = :productId")
                .setParameter("productId", productId)
                .executeUpdate();

        entityManager.createNativeQuery("DELETE FROM order_items WHERE product_id = :productId")
                .setParameter("productId", productId)
                .executeUpdate();

        productRepository.delete(existing);
    }
}
