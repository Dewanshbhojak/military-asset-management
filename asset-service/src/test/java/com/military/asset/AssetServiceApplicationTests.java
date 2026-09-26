package com.military.asset;

import com.military.asset.entity.Base;
import com.military.asset.entity.Equipment;
import com.military.asset.entity.EquipmentType;
import com.military.asset.entity.Inventory;
import com.military.asset.service.BaseService;
import com.military.asset.service.EquipmentService;
import com.military.asset.service.InventoryService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.web.server.ResponseStatusException;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
public class AssetServiceApplicationTests {

    @MockBean
    private RabbitTemplate rabbitTemplate;

    @Autowired
    private BaseService baseService;

    @Autowired
    private EquipmentService equipmentService;

    @Autowired
    private InventoryService inventoryService;

    @Test
    void testInventoryStockUpdateAndNegativeProtection() {
        Base base = baseService.createBase(new Base("Test Base", "Test City"));
        Equipment equipment = equipmentService.createEquipment(new Equipment("Test Rifle", EquipmentType.WEAPON, "Pcs", "Test"));

        inventoryService.increaseStock(base.getId(), equipment.getId(), 50);

        Inventory inv = inventoryService.getInventoryByBaseAndEquipment(base.getId(), equipment.getId());
        assertEquals(50, inv.getQuantity());

        inventoryService.decreaseStock(base.getId(), equipment.getId(), 20);
        inv = inventoryService.getInventoryByBaseAndEquipment(base.getId(), equipment.getId());
        assertEquals(30, inv.getQuantity());

        assertThrows(ResponseStatusException.class, () -> {
            inventoryService.decreaseStock(base.getId(), equipment.getId(), 100);
        });
    }
}
