package com.shopstack.shopstack.dto.admin;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class WarehouseStaffResponse {

    private UUID id;
    private String firstName;
    private String lastName;
    private String email;
    private String role;
}