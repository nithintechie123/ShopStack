package com.shopstack.shopstack.dto.warehouse;

import com.shopstack.shopstack.WarehouseStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateWarehouseRequest {

    @NotBlank
    private String warehouseName;

    @NotBlank
    private String address;

    @NotBlank
    private String city;

    @NotBlank
    private String state;

    @NotBlank
    private String pincode;

    @NotBlank
    private String managerName;

    @NotBlank
    private String contactNumber;

    @NotNull
    private WarehouseStatus status;
}