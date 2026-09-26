package com.military.asset.controller;

import com.military.asset.entity.Inventory;
import com.military.asset.security.UserPrincipal;
import com.military.asset.service.InventoryService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/inventory")
public class InventoryController {

    private final InventoryService inventoryService;

    public InventoryController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @GetMapping
    public ResponseEntity<List<Inventory>> getAllInventory(@AuthenticationPrincipal UserPrincipal principal) {
        if (principal != null && "BASE_COMMANDER".equals(principal.getRole())) {
            if (principal.getBaseId() != null) {
                return ResponseEntity.ok(inventoryService.getInventoryByBaseId(principal.getBaseId()));
            }
        }
        return ResponseEntity.ok(inventoryService.getAllInventory());
    }

    @GetMapping("/{baseId}")
    public ResponseEntity<List<Inventory>> getInventoryByBaseId(@PathVariable Long baseId,
                                                                 @AuthenticationPrincipal UserPrincipal principal) {
        validateBaseScope(baseId, principal);
        return ResponseEntity.ok(inventoryService.getInventoryByBaseId(baseId));
    }

    @GetMapping("/{baseId}/{equipmentId}")
    public ResponseEntity<Inventory> getInventoryByBaseAndEquipment(@PathVariable Long baseId,
                                                                      @PathVariable Long equipmentId,
                                                                      @AuthenticationPrincipal UserPrincipal principal) {
        validateBaseScope(baseId, principal);
        return ResponseEntity.ok(inventoryService.getInventoryByBaseAndEquipment(baseId, equipmentId));
    }

    @PutMapping("/stock")
    public ResponseEntity<Void> updateStock(@RequestBody Map<String, Object> payload) {
        Long baseId = ((Number) payload.get("baseId")).longValue();
        Long equipmentId = ((Number) payload.get("equipmentId")).longValue();
        Integer quantity = ((Number) payload.get("quantity")).intValue();
        String action = (String) payload.getOrDefault("action", "INCREASE");

        if ("DECREASE".equalsIgnoreCase(action)) {
            inventoryService.decreaseStock(baseId, equipmentId, quantity);
        } else {
            inventoryService.increaseStock(baseId, equipmentId, quantity);
        }
        return ResponseEntity.ok().build();
    }

    private void validateBaseScope(Long targetBaseId, UserPrincipal principal) {
        if (principal != null && "BASE_COMMANDER".equals(principal.getRole())) {
            if (principal.getBaseId() != null && !principal.getBaseId().equals(targetBaseId)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied: Base Commanders can only view inventory for their assigned base.");
            }
        }
    }
}
