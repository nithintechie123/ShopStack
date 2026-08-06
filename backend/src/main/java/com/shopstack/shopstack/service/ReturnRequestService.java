package com.shopstack.shopstack.service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.shopstack.shopstack.dto.VendorReturnResponse;
import com.shopstack.shopstack.model.Order;
import com.shopstack.shopstack.model.OrderItem;
import com.shopstack.shopstack.model.ReturnRequest;
import com.shopstack.shopstack.model.User;
import com.shopstack.shopstack.repository.OrderRepository;
import com.shopstack.shopstack.repository.ReturnRequestRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class ReturnRequestService {

    private final ReturnRequestRepository returnRequestRepository;
    private final OrderRepository orderRepository;

    public ReturnRequest createReturnRequest(
            UUID orderId,
            String reason,
            String description,
            User user) {

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!order.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }

        if (returnRequestRepository.findByOrderId(orderId).isPresent()) {
            throw new RuntimeException("Return request already submitted");
        }

        ReturnRequest request = ReturnRequest.builder()
                .order(order)
                .reason(reason)
                .description(description)
                .status("PENDING")
                .build();

        return returnRequestRepository.save(request);
    }

    public ReturnRequest getReturnRequest(UUID orderId, User user) {

        ReturnRequest request = returnRequestRepository
                .findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Return request not found"));

        if (!request.getOrder().getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }

        return request;
    }

    public ReturnRequest updateStatus(UUID orderId, String status) {

    ReturnRequest request = returnRequestRepository
            .findByOrderId(orderId)
            .orElseThrow(() -> new RuntimeException("Return request not found"));

    switch (status.toUpperCase()) {

        case "APPROVED":
        case "REJECTED":
        case "REFUND_PROCESSED":
        case "COMPLETED":
            request.setStatus(status.toUpperCase());
            break;

        default:
            throw new RuntimeException("Invalid return status");
    }

    return returnRequestRepository.save(request);
}

    public List<VendorReturnResponse> getVendorReturnRequests(User vendor) {

    return returnRequestRepository.findAll()
            .stream()
            .filter(request ->
                    request.getOrder().getItems().stream()
                            .anyMatch(item ->
                                    item.getProduct()
                                            .getVendor()
                                            .getUser()
                                            .getId()
                                            .equals(vendor.getId())))
            .map(request -> {

                OrderItem item = request.getOrder()
                        .getItems()
                        .get(0);

                return VendorReturnResponse.builder()
                        .returnId(request.getId())
                        .orderId(request.getOrder().getId())
                        .customerName(request.getOrder().getUser().getFirstName() + " " + request.getOrder().getUser().getLastName())
                        .productName(item.getProduct().getName())
                        .reason(request.getReason())
                        .description(request.getDescription())
                        .status(request.getStatus())
                        .requestDate(request.getRequestDate())
                        .build();

            })
            .collect(Collectors.toList());
}
}