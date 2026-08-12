package com.supportpilot.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class PythonApiConfig {

    @Value("${supportpilot.python-api-url}")
    private String pythonApiUrl;

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }

    public String getPythonApiUrl() {
        return pythonApiUrl;
    }
}
