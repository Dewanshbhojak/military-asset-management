package com.military.transaction.service;

import com.military.transaction.dto.CreatePurchaseRequest;
import com.military.transaction.entity.Purchase;
import com.military.transaction.repository.PurchaseRepository;
import com.military.transaction.security.UserPrincipal;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class PurchaseService {

    private final PurchaseRepository purchaseRepository;
    private final EventPublisher eventPublisher;

    public PurchaseService(PurchaseRepository purchaseRepository, EventPublisher eventPublisher) {
        this.purchaseRepository = purchaseRepository;
        this.eventPublisher = eventPublisher;
    }

    @Transactional
    public Purchase createPurchase(CreatePurchaseRequest request, UserPrincipal principal) {
        Long createdBy = principal != null && principal.getUserId() != null ? principal.getUserId() : 1L;

        Purchase purchase = new Purchase(
                request.getBaseId(),
                request.getEquipmentId(),
                request.getQuantity(),
                request.getPurchaseDate(),
                createdBy
        );

        Purchase saved = purchaseRepository.save(purchase);

        // Publish event to RabbitMQ
        eventPublisher.publishPurchaseCreated(
                saved.getId(),
                saved.getBaseId(),
                saved.getEquipmentId(),
                saved.getQuantity(),
                saved.getCreatedBy()
        );

        return saved;
    }

    public List<Purchase> getAllPurchases(UserPrincipal principal) {
        if (principal != null && "BASE_COMMANDER".equals(principal.getRole()) && principal.getBaseId() != null) {
            return purchaseRepository.findByBaseId(principal.getBaseId());
        }
        return purchaseRepository.findAll();
    }

    public Purchase getPurchaseById(Long id, UserPrincipal principal) {
        Purchase purchase = purchaseRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Purchase not found with ID: " + id));

        if (principal != null && "BASE_COMMANDER".equals(principal.getRole())) {
            if (principal.getBaseId() != null && !principal.getBaseId().equals(purchase.getBaseId())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied for this base transaction.");
            }
        }
        return purchase;
    }
}
