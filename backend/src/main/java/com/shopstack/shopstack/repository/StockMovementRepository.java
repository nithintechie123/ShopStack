package com.shopstack.shopstack.repository;

import com.shopstack.shopstack.model.Product;
import com.shopstack.shopstack.model.StockMovement;
import com.shopstack.shopstack.model.Warehouse;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface StockMovementRepository extends JpaRepository<StockMovement, UUID> {

    List<StockMovement> findByWarehouse(Warehouse warehouse);

    List<StockMovement> findByProduct(Product product);

    List<StockMovement> findByWarehouseAndProduct(Warehouse warehouse, Product product);
}