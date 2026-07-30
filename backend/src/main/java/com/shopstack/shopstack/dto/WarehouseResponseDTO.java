package com.shopstack.shopstack.dto;

import java.time.LocalDateTime;
import java.util.UUID;

import com.shopstack.shopstack.WarehouseStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WarehouseResponseDTO {

    private UUID id;

    private String warehouseName;

    private String warehouseCode;

    private String address;

    private String city;

    private String state;

    private String pincode;

    private String managerName;

    private String contactNumber;

    private WarehouseStatus status;

    private LocalDateTime createdAt;
}