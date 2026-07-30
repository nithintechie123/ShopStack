package com.shopstack.shopstack.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WarehouseRequestDTO {

    private String warehouseName;

    private String warehouseCode;

    private String address;

    private String city;

    private String state;

    private String pincode;

    private String managerName;

    private String contactNumber;
}