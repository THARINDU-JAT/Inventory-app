package com.example.product.service;

import com.example.product.dto.ProductRequest;
import com.example.product.dto.ProductResponse;
import com.example.product.entity.Product;
import com.example.product.exception.ResourceNotFoundException;
import com.example.product.repository.ProductRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepository repository;

    @InjectMocks
    private ProductService service;

    private Product sample() {
        Product p = new Product();
        p.setId(1L);
        p.setName("Mouse");
        p.setPrice(new BigDecimal("19.99"));
        p.setQuantity(10);
        return p;
    }

    @Test
    void create_savesAndReturnsResponse() {
        when(repository.save(any(Product.class))).thenAnswer(inv -> {
            Product p = inv.getArgument(0);
            p.setId(1L);
            return p;
        });

        ProductResponse res = service.create(new ProductRequest("Mouse", null, new BigDecimal("19.99"), 10));

        assertThat(res.id()).isEqualTo(1L);
        assertThat(res.name()).isEqualTo("Mouse");
    }

    @Test
    void findById_returnsProduct() {
        when(repository.findById(1L)).thenReturn(Optional.of(sample()));

        assertThat(service.findById(1L).name()).isEqualTo("Mouse");
    }

    @Test
    void findById_throwsWhenMissing() {
        when(repository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.findById(99L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("99");
    }

    @Test
    void update_changesFields() {
        when(repository.findById(1L)).thenReturn(Optional.of(sample()));

        ProductResponse res = service.update(1L, new ProductRequest("Keyboard", "desc", new BigDecimal("49.00"), 5));

        assertThat(res.name()).isEqualTo("Keyboard");
        assertThat(res.quantity()).isEqualTo(5);
    }

    @Test
    void delete_removesProduct() {
        Product p = sample();
        when(repository.findById(1L)).thenReturn(Optional.of(p));

        service.delete(1L);

        verify(repository).delete(p);
    }
}
