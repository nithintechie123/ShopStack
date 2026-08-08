package com.shopstack.shopstack.dto.warehouse;

import com.shopstack.shopstack.WarehouseStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;
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

    @NotNull(message = "Capacity is required")
    @Min(value = 1, message = "Capacity must be positive")
    private Integer capacity;
}