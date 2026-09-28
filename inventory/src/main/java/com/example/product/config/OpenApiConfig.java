package com.example.product.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI productOpenApi() {
        return new OpenAPI().info(new Info()
                .title("Product API")
                .version("v1")
                .description("Simple CRUD API built with Spring Boot, JPA and MySQL"));
    }
}
