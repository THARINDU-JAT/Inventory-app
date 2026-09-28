package com.example.product.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

@Schema(description = "Payload for creating or updating a product")
public record ProductRequest(

        @Schema(example = "Wireless Mouse")
        @NotBlank(message = "Name is required")
        @Size(max = 100, message = "Name must be at most 100 characters")
        String name,

        @Schema(example = "Ergonomic 2.4GHz wireless mouse")
        @Size(max = 500, message = "Description must be at most 500 characters")
        String description,

        @Schema(example = "19.99")
        @NotNull(message = "Price is required")
        @DecimalMin(value = "0.0", message = "Price must be zero or more")
        @Digits(integer = 8, fraction = 2, message = "Price allows up to 8 digits and 2 decimals")
        BigDecimal price,

        @Schema(example = "50")
        @NotNull(message = "Quantity is required")
        @Min(value = 0, message = "Quantity must be zero or more")
        Integer quantity
) {}
