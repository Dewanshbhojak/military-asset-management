package com.military.asset.config;

import com.military.asset.entity.Base;
import com.military.asset.entity.Equipment;
import com.military.asset.entity.EquipmentType;
import com.military.asset.entity.Inventory;
import com.military.asset.repository.BaseRepository;
import com.military.asset.repository.EquipmentRepository;
import com.military.asset.repository.InventoryRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private final BaseRepository baseRepository;
    private final EquipmentRepository equipmentRepository;
    private final InventoryRepository inventoryRepository;

    public DataSeeder(BaseRepository baseRepository,
                      EquipmentRepository equipmentRepository,
                      InventoryRepository inventoryRepository) {
        this.baseRepository = baseRepository;
        this.equipmentRepository = equipmentRepository;
        this.inventoryRepository = inventoryRepository;
    }

    @Override
    public void run(String... args) {
        seedBases();
        seedEquipment();
        seedInventory();
    }

    private void seedBases() {
        if (baseRepository.count() == 0) {
            baseRepository.save(new Base("Alpha Base", "Delhi"));
            baseRepository.save(new Base("Bravo Base", "Jaipur"));
            baseRepository.save(new Base("Charlie Base", "Bengaluru"));
            log.info("Seeded initial Bases: Alpha Base, Bravo Base, Charlie Base");
        }
    }

    private void seedEquipment() {
        if (equipmentRepository.count() == 0) {
            equipmentRepository.save(new Equipment("Rifle", EquipmentType.WEAPON, "Pcs", "Standard assault rifle"));
            equipmentRepository.save(new Equipment("Tank", EquipmentType.VEHICLE, "Units", "Main battle tank"));
            equipmentRepository.save(new Equipment("Ammunition", EquipmentType.AMMUNITION, "Rounds", "5.56mm ammo rounds"));
            log.info("Seeded initial Equipment: Rifle, Tank, Ammunition");
        }
    }

    private void seedInventory() {
        if (inventoryRepository.count() == 0) {
            // Alpha Base (ID 1)
            inventoryRepository.save(new Inventory(1L, 1L, 100)); // Rifle = 100
            inventoryRepository.save(new Inventory(1L, 2L, 20));  // Tank = 20
            inventoryRepository.save(new Inventory(1L, 3L, 500)); // Ammunition = 500

            // Bravo Base (ID 2)
            inventoryRepository.save(new Inventory(2L, 1L, 50));  // Rifle = 50
            inventoryRepository.save(new Inventory(2L, 2L, 10));  // Tank = 10
            inventoryRepository.save(new Inventory(2L, 3L, 300)); // Ammunition = 300

            // Charlie Base (ID 3)
            inventoryRepository.save(new Inventory(3L, 1L, 80));  // Rifle = 80
            inventoryRepository.save(new Inventory(3L, 2L, 15));  // Tank = 15
            inventoryRepository.save(new Inventory(3L, 3L, 400)); // Ammunition = 400

            log.info("Seeded initial Inventory stock records across bases");
        }
    }
}
