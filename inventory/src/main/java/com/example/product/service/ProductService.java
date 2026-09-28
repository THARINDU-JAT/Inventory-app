package com.example.product.service;

import com.example.product.dto.ProductRequest;
import com.example.product.dto.ProductResponse;
import com.example.product.entity.Product;
import com.example.product.exception.ResourceNotFoundException;
import com.example.product.repository.ProductRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProductService {

    private final ProductRepository repository;

    public ProductService(ProductRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public Page<ProductResponse> findAll(Pageable pageable) {
        return repository.findAll(pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public ProductResponse findById(Long id) {
        return toResponse(getOrThrow(id));
    }

    @Transactional
    public ProductResponse create(ProductRequest request) {
        Product product = new Product();
        apply(product, request);
        return toResponse(repository.save(product));
    }

    @Transactional
    public ProductResponse update(Long id, ProductRequest request) {
        Product product = getOrThrow(id);
        apply(product, request);
        return toResponse(product);
    }

    @Transactional
    public void delete(Long id) {
        repository.delete(getOrThrow(id));
    }

    private Product getOrThrow(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product " + id + " not found"));
    }

    private void apply(Product product, ProductRequest request) {
        product.setName(request.name());
        product.setDescription(request.description());
        product.setPrice(request.price());
        product.setQuantity(request.quantity());
    }

    private ProductResponse toResponse(Product p) {
        return new ProductResponse(
                p.getId(), p.getName(), p.getDescription(),
                p.getPrice(), p.getQuantity(), p.getCreatedAt(), p.getUpdatedAt());
    }
}
