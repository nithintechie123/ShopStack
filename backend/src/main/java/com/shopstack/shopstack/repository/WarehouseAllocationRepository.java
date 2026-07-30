package com.shopstack.shopstack.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.shopstack.shopstack.model.Order;
import com.shopstack.shopstack.model.Warehouse;
import com.shopstack.shopstack.model.WarehouseAllocation;

@Repository
public interface WarehouseAllocationRepository extends JpaRepository<WarehouseAllocation, UUID> {

    List<WarehouseAllocation> findByWarehouse(Warehouse warehouse);

    List<WarehouseAllocation> findByOrder(Order order);
}