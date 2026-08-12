package com.supportpilot.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "system_settings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SystemSettings {

    /** Always id=1 (singleton pattern) */
    @Id
    private Long id;

    @Builder.Default
    private String siteName = "SupportPilot";

    @Builder.Default
    private String supportEmail = "support@supportpilot.ai";

    @Builder.Default
    private boolean autoAssignTickets = true;

    @Builder.Default
    private boolean aiClassificationEnabled = true;
}
