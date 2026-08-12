package com.supportpilot.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class KbArticleRequest {
    @NotBlank
    private String title;
    @NotBlank
    private String category;
    @NotBlank
    private String content;
}
