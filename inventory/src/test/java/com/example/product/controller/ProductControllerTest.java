package com.example.product.controller;

import com.example.product.dto.ProductRequest;
import com.example.product.dto.ProductResponse;
import com.example.product.exception.ResourceNotFoundException;
import com.example.product.service.ProductService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ProductController.class)
class ProductControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ProductService service;

    private ProductResponse response() {
        return new ProductResponse(1L, "Mouse", "desc", new BigDecimal("19.99"), 10,
                LocalDateTime.now(), LocalDateTime.now());
    }

    @Test
    void create_returns201WithLocation() throws Exception {
        when(service.create(any(ProductRequest.class))).thenReturn(response());
        ProductRequest req = new ProductRequest("Mouse", "desc", new BigDecimal("19.99"), 10);

        mockMvc.perform(post("/api/v1/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(header().exists("Location"))
                .andExpect(jsonPath("$.name").value("Mouse"));
    }

    @Test
    void create_returns400WhenInvalid() throws Exception {
        ProductRequest req = new ProductRequest("", null, new BigDecimal("-1"), null);

        mockMvc.perform(post("/api/v1/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.name").exists());
    }

    @Test
    void get_returns404WhenMissing() throws Exception {
        when(service.findById(99L)).thenThrow(new ResourceNotFoundException("Product 99 not found"));

        mockMvc.perform(get("/api/v1/products/99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.detail").value("Product 99 not found"));
    }

    @Test
    void delete_returns204() throws Exception {
        mockMvc.perform(delete("/api/v1/products/1"))
                .andExpect(status().isNoContent());
    }

    @Test
    void delete_returns404WhenMissing() throws Exception {
        doThrow(new ResourceNotFoundException("Product 5 not found")).when(service).delete(eq(5L));

        mockMvc.perform(delete("/api/v1/products/5"))
                .andExpect(status().isNotFound());
    }
}
