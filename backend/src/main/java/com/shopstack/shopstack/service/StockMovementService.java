package com.shopstack.shopstack.service;

import com.shopstack.shopstack.dto.warehouse.CreateStockMovementRequest;
import com.shopstack.shopstack.model.MovementType;
import com.shopstack.shopstack.model.Product;
import com.shopstack.shopstack.model.StockMovement;
import com.shopstack.shopstack.model.Warehouse;
import com.shopstack.shopstack.repository.ProductRepository;
import com.shopstack.shopstack.repository.StockMovementRepository;
import com.shopstack.shopstack.repository.WarehouseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class StockMovementService {

    private final StockMovementRepository stockMovementRepository;
    private final WarehouseRepository warehouseRepository;
    private final ProductRepository productRepository;

    public StockMovement create(CreateStockMovementRequest request) {

        Warehouse warehouse = warehouseRepository.findById(request.getWarehouseId())
                .orElseThrow(() -> new RuntimeException("Warehouse not found"));

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        StockMovement movement = StockMovement.builder()
                .warehouse(warehouse)
                .product(product)
                .movementType(request.getMovementType())
                .quantity(request.getQuantity())
                .reference(request.getReference())
                .build();

        return stockMovementRepository.save(movement);
    }

    public List<StockMovement> getAll() {
        return stockMovementRepository.findAll();
    }

    public List<StockMovement> getByProductId(java.util.UUID productId) {

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        return stockMovementRepository.findByProduct(product);
    }

    public void recordMovement(
            Warehouse warehouse,
            Product product,
            MovementType movementType,
            Integer quantity,
            String reference) {

        StockMovement movement = StockMovement.builder()
                .warehouse(warehouse)
                .product(product)
                .movementType(movementType)
                .quantity(quantity)
                .reference(reference)
                .build();

        stockMovementRepository.save(movement);
    }
}