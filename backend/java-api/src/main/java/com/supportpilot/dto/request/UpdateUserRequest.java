package com.supportpilot.dto.request;

import lombok.Data;

@Data
public class UpdateUserRequest {
    private String name;
    private String email;
    private String password;
    private String role;
    private Boolean disabled;
}
