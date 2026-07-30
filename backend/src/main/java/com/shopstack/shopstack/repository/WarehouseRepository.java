package com.shopstack.shopstack.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.shopstack.shopstack.model.Warehouse;

@Repository
public interface WarehouseRepository extends JpaRepository<Warehouse, UUID> {

    Optional<Warehouse> findByWarehouseCode(String warehouseCode);

    boolean existsByWarehouseCode(String warehouseCode);
}