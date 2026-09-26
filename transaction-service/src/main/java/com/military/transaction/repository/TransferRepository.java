package com.military.transaction.repository;

import com.military.transaction.entity.Transfer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransferRepository extends JpaRepository<Transfer, Long> {
    List<Transfer> findByFromBaseIdOrToBaseId(Long fromBaseId, Long toBaseId);
}
