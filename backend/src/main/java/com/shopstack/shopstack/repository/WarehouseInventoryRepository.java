package com.shopstack.shopstack.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.shopstack.shopstack.model.Product;
import com.shopstack.shopstack.model.Warehouse;
import com.shopstack.shopstack.model.WarehouseInventory;
import org.springframework.data.jpa.repository.Query;
@Repository
public interface WarehouseInventoryRepository extends JpaRepository<WarehouseInventory, UUID> {

    List<WarehouseInventory> findByWarehouse(Warehouse warehouse);

    List<WarehouseInventory> findByProduct(Product product);

    Optional<WarehouseInventory> findByWarehouseAndProduct(
            Warehouse warehouse,
            Product product
    );
    @Query("SELECT COALESCE(SUM(w.availableQuantity), 0) FROM WarehouseInventory w")
    Long getTotalAvailableStock();
}