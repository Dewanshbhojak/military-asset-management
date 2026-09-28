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
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Component
@Order(1)
public class DataSeeder implements CommandLineRunner {
    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);
    private static final String DEMO = "Fictional demo inventory for application testing only";

    private final BaseRepository baseRepository;
    private final EquipmentRepository equipmentRepository;
    private final InventoryRepository inventoryRepository;
    private final JdbcTemplate jdbcTemplate;

    public DataSeeder(BaseRepository baseRepository, EquipmentRepository equipmentRepository,
                      InventoryRepository inventoryRepository, JdbcTemplate jdbcTemplate) {
        this.baseRepository = baseRepository;
        this.equipmentRepository = equipmentRepository;
        this.inventoryRepository = inventoryRepository;
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) {
        jdbcTemplate.execute("ALTER TABLE equipment MODIFY COLUMN type VARCHAR(32) NOT NULL");
        List<Base> bases = seedBases();
        List<Equipment> equipment = seedEquipment();
        seedInventory(bases, equipment);
    }

    private List<Base> seedBases() {
        String[][] data = {
            {"Alpha Command Base", "New Delhi"}, {"Bravo Command Base", "Jaipur, Rajasthan"},
            {"Charlie Command Base", "Pune, Maharashtra"}, {"Delta Command Base", "Lucknow, Uttar Pradesh"},
            {"Echo Command Base", "Jodhpur, Rajasthan"}, {"Foxtrot Command Base", "Bengaluru, Karnataka"},
            {"Golf Command Base", "Chandigarh"}, {"Hotel Command Base", "Guwahati, Assam"},
            {"India Command Base", "Srinagar, Jammu & Kashmir"}, {"Juliet Command Base", "Secunderabad, Telangana"}
        };
        for (int i = 0; i < data.length; i++) {
            final String baseName = data[i][0];
            final long preferredId = i + 1L;
            final boolean preserveLegacyId = i < 3;
            Base base = baseRepository.findAll().stream()
                .filter(candidate -> candidate.getName().equalsIgnoreCase(baseName))
                .findFirst().orElseGet(() -> preserveLegacyId
                    ? baseRepository.findById(preferredId).orElseGet(Base::new)
                    : new Base());
            base.setName(data[i][0]);
            base.setLocation(data[i][1]);
            baseRepository.save(base);
        }
        log.info("Ensured 10 fictional demo command bases");
        return baseRepository.findAll();
    }

    private List<Equipment> seedEquipment() {
        Object[][] data = {
            {"Rifle", EquipmentType.WEAPON, "UNIT"}, {"Tank", EquipmentType.VEHICLE, "VEHICLE"},
            {"Ammunition", EquipmentType.AMMUNITION, "BOX"},
            {"Assault Rifle", EquipmentType.WEAPON, "UNIT"}, {"Sniper Rifle", EquipmentType.WEAPON, "UNIT"},
            {"Machine Gun", EquipmentType.WEAPON, "UNIT"}, {"Pistol", EquipmentType.WEAPON, "UNIT"},
            {"Mortar", EquipmentType.WEAPON, "UNIT"}, {"Armoured Vehicle", EquipmentType.VEHICLE, "VEHICLE"},
            {"Military Truck", EquipmentType.VEHICLE, "VEHICLE"}, {"Utility Vehicle", EquipmentType.VEHICLE, "VEHICLE"},
            {"Patrol Vehicle", EquipmentType.VEHICLE, "VEHICLE"}, {"Engineering Vehicle", EquipmentType.VEHICLE, "VEHICLE"},
            {"Rifle Ammunition", EquipmentType.AMMUNITION, "BOX"}, {"Heavy Ammunition", EquipmentType.AMMUNITION, "ROUND"},
            {"Mortar Ammunition", EquipmentType.AMMUNITION, "ROUND"}, {"Field Radio", EquipmentType.COMMUNICATION, "UNIT"},
            {"Tactical Communication Unit", EquipmentType.COMMUNICATION, "SET"}, {"Ballistic Helmet", EquipmentType.PROTECTIVE, "UNIT"},
            {"Protective Vest", EquipmentType.PROTECTIVE, "UNIT"}, {"Field Generator", EquipmentType.LOGISTICS, "UNIT"},
            {"Portable Water Unit", EquipmentType.LOGISTICS, "UNIT"}, {"Medical Kit", EquipmentType.LOGISTICS, "KIT"},
            {"Field Tent", EquipmentType.LOGISTICS, "SET"}
        };
        Map<String, Equipment> existing = equipmentRepository.findAll().stream()
            .collect(Collectors.toMap(Equipment::getName, Function.identity(), (first, ignored) -> first));
        for (Object[] row : data) {
            String name = (String) row[0];
            Equipment item = existing.get(name);
            if (item == null) {
                item = new Equipment(name, (EquipmentType) row[1], (String) row[2], DEMO);
                existing.put(name, equipmentRepository.save(item));
            } else if (name.equals("Rifle") || name.equals("Tank") || name.equals("Ammunition")
                    || item.getDescription() == null || item.getDescription().isBlank()) {
                item.setDescription(DEMO);
                equipmentRepository.save(item);
            }
        }
        log.info("Ensured fictional demo equipment catalog");
        return equipmentRepository.findAll();
    }

    private void seedInventory(List<Base> bases, List<Equipment> equipment) {
        for (Base base : bases) {
            int baseIndex = Math.toIntExact(base.getId() - 1);
            for (Equipment item : equipment) {
                if (inventoryRepository.findByBaseIdAndEquipmentId(base.getId(), item.getId()).isPresent()) continue;
                int quantity = demoQuantity(baseIndex, item);
                inventoryRepository.save(new Inventory(base.getId(), item.getId(), quantity));
            }
        }
        log.info("Ensured varied, non-negative fictional demo stock across all bases");
    }

    private int demoQuantity(int baseIndex, Equipment item) {
        int categoryBase = switch (item.getType()) {
            case WEAPON -> 70;
            case VEHICLE -> 8;
            case AMMUNITION -> 240;
            case COMMUNICATION -> 18;
            case PROTECTIVE -> 75;
            case LOGISTICS -> 16;
        };
        int variation = Math.floorMod((baseIndex + 3) * 37 + item.getName().hashCode(), 70);
        return categoryBase + variation + (baseIndex % 3) * 11;
    }
}
