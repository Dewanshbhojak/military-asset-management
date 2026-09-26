package com.military.asset.repository;

import com.military.asset.entity.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, Long> {
    List<Inventory> findByBaseId(Long baseId);
    Optional<Inventory> findByBaseIdAndEquipmentId(Long baseId, Long equipmentId);
}
