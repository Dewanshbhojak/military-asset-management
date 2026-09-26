package com.military.asset.service;

import com.military.asset.entity.Inventory;
import com.military.asset.entity.ProcessedEvent;
import com.military.asset.repository.InventoryRepository;
import com.military.asset.repository.ProcessedEventRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class InventoryService {

    private static final Logger log = LoggerFactory.getLogger(InventoryService.class);

    private final InventoryRepository inventoryRepository;
    private final ProcessedEventRepository processedEventRepository;

    public InventoryService(InventoryRepository inventoryRepository, ProcessedEventRepository processedEventRepository) {
        this.inventoryRepository = inventoryRepository;
        this.processedEventRepository = processedEventRepository;
    }

    public List<Inventory> getAllInventory() {
        return inventoryRepository.findAll();
    }

    public List<Inventory> getInventoryByBaseId(Long baseId) {
        return inventoryRepository.findByBaseId(baseId);
    }

    public Inventory getInventoryByBaseAndEquipment(Long baseId, Long equipmentId) {
        return inventoryRepository.findByBaseIdAndEquipmentId(baseId, equipmentId)
                .orElse(new Inventory(baseId, equipmentId, 0));
    }

    @Transactional
    public void increaseStock(Long baseId, Long equipmentId, int quantity) {
        if (quantity <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Quantity must be positive");
        }
        Inventory inv = inventoryRepository.findByBaseIdAndEquipmentId(baseId, equipmentId)
                .orElseGet(() -> new Inventory(baseId, equipmentId, 0));

        inv.setQuantity(inv.getQuantity() + quantity);
        inventoryRepository.save(inv);
        log.info("Increased inventory for baseId={}, equipmentId={} by {}. New total: {}", baseId, equipmentId, quantity, inv.getQuantity());
    }

    @Transactional
    public void decreaseStock(Long baseId, Long equipmentId, int quantity) {
        if (quantity <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Quantity must be positive");
        }
        Inventory inv = inventoryRepository.findByBaseIdAndEquipmentId(baseId, equipmentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "No inventory record found for baseId: " + baseId + ", equipmentId: " + equipmentId));

        if (inv.getQuantity() < quantity) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "INSUFFICIENT_INVENTORY: Base " + baseId + " has only " + inv.getQuantity() + " units available.");
        }

        inv.setQuantity(inv.getQuantity() - quantity);
        inventoryRepository.save(inv);
        log.info("Decreased inventory for baseId={}, equipmentId={} by {}. New total: {}", baseId, equipmentId, quantity, inv.getQuantity());
    }

    @Transactional
    public boolean processIdempotentEvent(String eventId) {
        if (eventId != null && processedEventRepository.existsById(eventId)) {
            log.info("Event {} already processed. Skipping duplicate processing.", eventId);
            return false;
        }
        if (eventId != null) {
            processedEventRepository.save(new ProcessedEvent(eventId));
        }
        return true;
    }
}
