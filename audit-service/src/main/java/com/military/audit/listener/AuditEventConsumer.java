package com.military.audit.listener;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.military.audit.config.RabbitMQConfig;
import com.military.audit.entity.AuditLog;
import com.military.audit.repository.AuditLogRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class AuditEventConsumer {

    private static final Logger log = LoggerFactory.getLogger(AuditEventConsumer.class);

    private final AuditLogRepository auditLogRepository;
    private final ObjectMapper objectMapper;

    public AuditEventConsumer(AuditLogRepository auditLogRepository, ObjectMapper objectMapper) {
        this.auditLogRepository = auditLogRepository;
        this.objectMapper = objectMapper;
    }

    @RabbitListener(queues = RabbitMQConfig.AUDIT_QUEUE)
    public void consumeEvent(Map<String, Object> event) {
        log.info("Received event in Audit Service: {}", event);

        try {
            String eventId = (String) event.get("eventId");
            String eventType = (String) event.getOrDefault("eventType", "UNKNOWN_EVENT");
            Long entityId = getLongValue(event.get("entityId"));
            Long userId = getLongValue(event.get("createdBy"));
            if (userId == null) userId = getLongValue(event.get("userId"));

            String details = objectMapper.writeValueAsString(event);

            AuditLog auditLog = new AuditLog(
                    eventId,
                    eventType,
                    "TransactionService",
                    entityId,
                    userId,
                    eventType,
                    details
            );

            auditLogRepository.save(auditLog);
            log.info("Successfully persisted AuditLog record for eventId: {}", eventId);
        } catch (Exception e) {
            log.error("Failed to persist audit log for event {}: {}", event, e.getMessage(), e);
        }
    }

    private Long getLongValue(Object obj) {
        if (obj == null) return null;
        return ((Number) obj).longValue();
    }
}
