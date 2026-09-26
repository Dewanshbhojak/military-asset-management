package com.military.audit.repository;

import com.military.audit.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    List<AuditLog> findByEventType(String eventType);
    List<AuditLog> findByUserId(Long userId);
    List<AuditLog> findByServiceName(String serviceName);
}
