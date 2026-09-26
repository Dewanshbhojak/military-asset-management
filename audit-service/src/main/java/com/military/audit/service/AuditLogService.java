package com.military.audit.service;

import com.military.audit.entity.AuditLog;
import com.military.audit.repository.AuditLogRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    public AuditLogService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    public List<AuditLog> getAuditLogs(String eventType, Long userId, String service) {
        if (eventType != null && !eventType.trim().isEmpty()) {
            return auditLogRepository.findByEventType(eventType);
        }
        if (userId != null) {
            return auditLogRepository.findByUserId(userId);
        }
        if (service != null && !service.trim().isEmpty()) {
            return auditLogRepository.findByServiceName(service);
        }
        return auditLogRepository.findAll();
    }

    public AuditLog getAuditLogById(Long id) {
        return auditLogRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Audit log not found with ID: " + id));
    }
}
