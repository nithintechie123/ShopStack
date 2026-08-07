package com.shopstack.shopstack.service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.shopstack.shopstack.dto.CartItemRequest;
import com.shopstack.shopstack.dto.CheckoutRequest;
import com.shopstack.shopstack.dto.CouponValidationResponse;
import com.shopstack.shopstack.dto.VendorEarningsDTO;
import com.shopstack.shopstack.dto.VendorOrderItemResponse;
import com.shopstack.shopstack.dto.VendorOrderResponse;
import com.shopstack.shopstack.model.Coupon;
import com.shopstack.shopstack.model.Order;
import com.shopstack.shopstack.model.OrderItem;
import com.shopstack.shopstack.model.Product;
import com.shopstack.shopstack.model.User;
import com.shopstack.shopstack.model.VendorProfile;
import com.shopstack.shopstack.repository.CouponRepository;
import com.shopstack.shopstack.repository.OrderRepository;
import com.shopstack.shopstack.repository.ProductRepository;
import com.shopstack.shopstack.repository.VendorProfileRepository;
import com.shopstack.shopstack.util.CommissionUtils;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class OrderService {

    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final CouponRepository couponRepository;
    private final PaymentService paymentService;
    private final CouponService couponService;
    private final VendorProfileRepository vendorProfileRepository;


    public Order placeOrder(User user, CheckoutRequest request) {

        BigDecimal subtotal = BigDecimal.ZERO;
        BigDecimal discount = BigDecimal.ZERO;
        BigDecimal finalAmount;

        List<OrderItem> orderItems = new ArrayList<>();

        for (CartItemRequest item : request.getItems()) {

            Product product = productRepository.findByIdForUpdate(item.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found"));

            if (product.getStockQuantity() < item.getQuantity()) {
                throw new RuntimeException(
                        "Insufficient stock for product: " + product.getName());
            }

            BigDecimal itemTotal = product.getPrice()
                    .multiply(BigDecimal.valueOf(item.getQuantity()));

            subtotal = subtotal.add(itemTotal);

            OrderItem orderItem = OrderItem.builder()
                    .product(product)
                    .quantity(item.getQuantity())
                    .price(product.getPrice())
                    .build();

            orderItems.add(orderItem);
        }

        if (request.getCouponCode() != null && !request.getCouponCode().isBlank()) {
            CouponValidationResponse valResponse = couponService.validateCoupon(request.getCouponCode(), subtotal);
            if (!valResponse.isValid()) {
                throw new RuntimeException(valResponse.getMessage());
            }
            discount = valResponse.getCalculatedDiscount();
        }

        BigDecimal shippingFee = (subtotal.compareTo(new BigDecimal("1000")) > 0 || subtotal.compareTo(BigDecimal.ZERO) == 0)
                ? BigDecimal.ZERO
                : new BigDecimal("99");

        finalAmount = subtotal.subtract(discount).add(shippingFee);
        if (finalAmount.compareTo(BigDecimal.ZERO) < 0) {
            finalAmount = BigDecimal.ZERO;
        }

        String transactionId;

        if ("RAZORPAY".equalsIgnoreCase(request.getPaymentMethod())) {
            boolean isValid = paymentService.verifySignature(
                    request.getRazorpayOrderId(),
                    request.getRazorpayPaymentId(),
                    request.getRazorpaySignature()
            );

            if (!isValid) {
                throw new RuntimeException("Payment signature verification failed.");
            }
            transactionId = request.getRazorpayPaymentId();
        } else {
            var paymentResult = paymentService.processPayment(
                    finalAmount,
                    request.getPaymentMethod(),
                    request.getBillingInfo()
            );

            if (!(Boolean) paymentResult.get("success")) {
                throw new RuntimeException(
                        paymentResult.get("message").toString());
            }
            transactionId = paymentResult.get("transactionId").toString();
        }


        String shipping = request.getShippingAddress();
        if (shipping == null || shipping.isBlank()) {
            shipping = "Address not specified";
        }
        String billing = request.getBillingAddress();
        if (billing == null || billing.isBlank()) {
            billing = shipping;
        }

        Order order = Order.builder()
                .user(user)
                .subtotal(subtotal)
                .discount(discount)
                .finalAmount(finalAmount)
                .shippingAddress(shipping)
                .billingAddress(billing)
                .paymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod() : "COD")
                .paymentStatus("PAID")
                .trackingStatus("PLACED")
                .transactionId(transactionId)
                .build();

        for (OrderItem item : orderItems) {
            item.setOrder(order);
        }

        order.setItems(orderItems);



        for (CartItemRequest item : request.getItems()) {

            Product product = productRepository
                    .findByIdForUpdate(item.getProductId())
                    .orElseThrow();

            product.setStockQuantity(
                    product.getStockQuantity() - item.getQuantity()
            );

            productRepository.save(product);
        }



        Order savedOrder = orderRepository.save(order);

        if (request.getCouponCode() != null && !request.getCouponCode().isBlank()) {
            couponService.incrementCouponUsage(request.getCouponCode());
        }

        return savedOrder;
    }


    public List<Order> getOrdersByUser(User user) {
        return orderRepository.findByUserIdOrderByOrderDateDesc(user.getId());
    }

    public Order getOrderById(java.util.UUID orderId, User user) {

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        boolean isOwner = order.getUser().getId().equals(user.getId());
        boolean isAdmin = user.getRole() == com.shopstack.shopstack.model.Role.ADMIN;
        boolean isVendor =
                isVendorForOrder(order, user);

        if (!isOwner && !isAdmin && !isVendor) {
            throw new RuntimeException("Access denied");
        }

        return order;
    }

    private boolean isVendorForOrder(Order order, User user) {
        if (user == null || user.getRole() != com.shopstack.shopstack.model.Role.VENDOR) {
            return false;
        }
        if (order.getItems() == null) return false;
        return order.getItems().stream()
                .anyMatch(item -> item.getProduct() != null
                        && item.getProduct().getVendor() != null
                        && item.getProduct().getVendor().getUser() != null
                        && item.getProduct().getVendor().getUser().getId().equals(user.getId()));
    }

    public Order updateOrderStatus(java.util.UUID orderId, String status, User user) {

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        boolean isOwner = order.getUser().getId().equals(user.getId());
        boolean isAdmin = user.getRole() == com.shopstack.shopstack.model.Role.ADMIN;
        boolean isVendor = isVendorForOrder(order, user);

        if (!isOwner && !isAdmin && !isVendor) {
            throw new RuntimeException("Access denied to update order status");
        }

        String uppercaseStatus = status.trim().toUpperCase();

        if ("CANCELLED".equals(uppercaseStatus)) {
            if (isOwner && !isAdmin && !isVendor) {
                if ("SHIPPED".equalsIgnoreCase(order.getTrackingStatus()) ||
                    "OUT_FOR_DELIVERY".equalsIgnoreCase(order.getTrackingStatus()) ||
                    "DELIVERED".equalsIgnoreCase(order.getTrackingStatus())) {
                    throw new RuntimeException("Orders that are already shipped or delivered cannot be cancelled.");
                }
            }
        }


        // Vendor can update only these statuses
        if (isVendor) {

            if (!uppercaseStatus.equals("CONFIRMED")
                    && !uppercaseStatus.equals("PREPARING")
                    && !uppercaseStatus.equals("READY_FOR_WAREHOUSE")) {

                throw new RuntimeException(
                        "Vendor can only update to CONFIRMED, PREPARING or READY_FOR_WAREHOUSE.");
            }
        }





        order.setTrackingStatus(uppercaseStatus);

        return orderRepository.save(order);
    }

    public List<VendorOrderResponse> getOrdersForVendor(User user) {

        if (user.getRole() != com.shopstack.shopstack.model.Role.VENDOR) {
            throw new RuntimeException("Access denied");
        }

        VendorProfile vendorProfile = vendorProfileRepository.findByUserId(user.getId()).orElse(null);
        BigDecimal commissionRate = vendorProfile != null && vendorProfile.getCommissionRate() != null
                ? vendorProfile.getCommissionRate()
                : CommissionUtils.DEFAULT_COMMISSION_RATE;

        List<Order> orders = orderRepository.findByVendorId(user.getId());

        List<VendorOrderResponse> response = new ArrayList<>();

        for (Order order : orders) {

            BigDecimal vendorAmount = BigDecimal.ZERO;
            List<VendorOrderItemResponse> itemResponses = new ArrayList<>();

            for (OrderItem item : order.getItems()) {

                if (item.getProduct() != null
                        && item.getProduct().getVendor() != null
                        && item.getProduct().getVendor().getUser() != null
                        && item.getProduct().getVendor().getUser().getId().equals(user.getId())) {

                    BigDecimal total = item.getPrice()
                            .multiply(BigDecimal.valueOf(item.getQuantity()));

                    vendorAmount = vendorAmount.add(total);

                    BigDecimal itemCommission = CommissionUtils.calculateCommission(item.getPrice(), item.getQuantity(), commissionRate);
                    BigDecimal itemPayout = CommissionUtils.calculateVendorPayout(item.getPrice(), item.getQuantity(), commissionRate);

                    itemResponses.add(
                            VendorOrderItemResponse.builder()
                                    .productId(item.getProduct().getId())
                                    .productName(item.getProduct().getName())
                                    .quantity(item.getQuantity())
                                    .price(item.getPrice())
                                    .total(total)
                                    .commissionRate(commissionRate)
                                    .commissionDeducted(itemCommission)
                                    .netPayout(itemPayout)
                                    .build()
                    );
                }
            }

            BigDecimal orderCommission = CommissionUtils.calculateCommission(vendorAmount, commissionRate);
            BigDecimal orderPayout = CommissionUtils.calculateVendorPayout(vendorAmount, commissionRate);

            response.add(
                    VendorOrderResponse.builder()
                            .id(order.getId())
                            .orderDate(order.getOrderDate())
                            .customerName(
                                    order.getUser() != null
                                            ? (order.getUser().getFirstName() + " " + order.getUser().getLastName())
                                            : "Customer"
                            )
                            .trackingStatus(order.getTrackingStatus())
                            .paymentStatus(order.getPaymentStatus())
                            .vendorAmount(vendorAmount)
                            .commissionRate(commissionRate)
                            .commissionDeducted(orderCommission)
                            .netPayout(orderPayout)
                            .shippingAddress(order.getShippingAddress())
                            .items(itemResponses)
                            .build()
            );
        }

        return response;
    }

    public VendorEarningsDTO getVendorEarningsSummary(User user) {
        if (user.getRole() != com.shopstack.shopstack.model.Role.VENDOR) {
            throw new RuntimeException("Access denied");
        }

        VendorProfile vendorProfile = vendorProfileRepository.findByUserId(user.getId()).orElse(null);
        BigDecimal commissionRate = vendorProfile != null && vendorProfile.getCommissionRate() != null
                ? vendorProfile.getCommissionRate()
                : CommissionUtils.DEFAULT_COMMISSION_RATE;

        List<Order> orders = orderRepository.findByVendorId(user.getId());
        BigDecimal totalSales = BigDecimal.ZERO;
        long completedOrders = 0;

        for (Order order : orders) {
            String trackingStatus = order.getTrackingStatus();
            if (trackingStatus != null && trackingStatus.equalsIgnoreCase("CANCELLED")) {
                continue;
            }

            BigDecimal orderVendorTotal = BigDecimal.ZERO;
            if (order.getItems() != null) {
                for (OrderItem item : order.getItems()) {
                    if (item.getProduct() != null
                            && item.getProduct().getVendor() != null
                            && item.getProduct().getVendor().getUser() != null
                            && item.getProduct().getVendor().getUser().getId().equals(user.getId())) {
                        BigDecimal lineTotal = item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
                        orderVendorTotal = orderVendorTotal.add(lineTotal);
                    }
                }
            }

            if (orderVendorTotal.compareTo(BigDecimal.ZERO) > 0) {
                totalSales = totalSales.add(orderVendorTotal);
                completedOrders++;
            }
        }

        BigDecimal totalCommission = CommissionUtils.calculateCommission(totalSales, commissionRate);
        BigDecimal totalPayout = CommissionUtils.calculateVendorPayout(totalSales, commissionRate);

        return VendorEarningsDTO.builder()
                .vendorId(vendorProfile != null ? vendorProfile.getId() : null)
                .vendorName(vendorProfile != null ? vendorProfile.getStoreName() : (user.getFirstName() + " " + user.getLastName()))
                .status(vendorProfile != null && vendorProfile.getStatus() != null ? vendorProfile.getStatus().name() : "ACTIVE")
                .totalSales(totalSales)
                .totalCommission(totalCommission)
                .totalPayout(totalPayout)
                .completedOrders(completedOrders)
                .commissionRate(commissionRate)
                .build();
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    public BigDecimal calculateOrderTotal(CheckoutRequest request) {
        BigDecimal subtotal = BigDecimal.ZERO;
        BigDecimal discount = BigDecimal.ZERO;

        for (CartItemRequest item : request.getItems()) {
            Product product = productRepository.findById(item.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found"));

            BigDecimal itemTotal = product.getPrice()
                    .multiply(BigDecimal.valueOf(item.getQuantity()));
            subtotal = subtotal.add(itemTotal);
        }

        if (request.getCouponCode() != null && !request.getCouponCode().isBlank()) {
            CouponValidationResponse valResponse = couponService.validateCoupon(request.getCouponCode(), subtotal);
            if (!valResponse.isValid()) {
                throw new RuntimeException(valResponse.getMessage());
            }
            discount = valResponse.getCalculatedDiscount();
        }

        //shipping fee
        BigDecimal shippingFee = (subtotal.compareTo(new BigDecimal("1000")) > 0 || subtotal.compareTo(BigDecimal.ZERO) == 0)
                ? BigDecimal.ZERO
                : new BigDecimal("99");

        BigDecimal finalAmount = subtotal.subtract(discount).add(shippingFee);
        return finalAmount.compareTo(BigDecimal.ZERO) < 0 ? BigDecimal.ZERO : finalAmount;
    }

}