package com.military.transaction.controller;

import com.military.transaction.dto.CreatePurchaseRequest;
import com.military.transaction.entity.Purchase;
import com.military.transaction.security.UserPrincipal;
import com.military.transaction.service.PurchaseService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/purchases")
public class PurchaseController {

    private final PurchaseService purchaseService;

    public PurchaseController(PurchaseService purchaseService) {
        this.purchaseService = purchaseService;
    }

    @PostMapping
    public ResponseEntity<Purchase> createPurchase(@Valid @RequestBody CreatePurchaseRequest request,
                                                   @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.status(HttpStatus.CREATED).body(purchaseService.createPurchase(request, principal));
    }

    @GetMapping
    public ResponseEntity<List<Purchase>> getAllPurchases(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(purchaseService.getAllPurchases(principal));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Purchase> getPurchaseById(@PathVariable Long id,
                                                    @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(purchaseService.getPurchaseById(id, principal));
    }
}
