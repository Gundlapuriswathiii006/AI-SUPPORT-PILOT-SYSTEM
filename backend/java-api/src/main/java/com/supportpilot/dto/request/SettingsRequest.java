package com.supportpilot.dto.request;

import lombok.Data;

@Data
public class SettingsRequest {
    private String siteName;
    private String supportEmail;
    private Boolean autoAssignTickets;
    private Boolean aiClassificationEnabled;
}
