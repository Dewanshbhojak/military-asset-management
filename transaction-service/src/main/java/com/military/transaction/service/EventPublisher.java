package com.military.transaction.service;

import com.military.transaction.config.RabbitMQConfig;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class EventPublisher {

    private static final Logger log = LoggerFactory.getLogger(EventPublisher.class);

    private final RabbitTemplate rabbitTemplate;

    public EventPublisher(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    public void publishPurchaseCreated(Long purchaseId, Long baseId, Long equipmentId, Integer quantity, Long createdBy) {
        Map<String, Object> event = new HashMap<>();
        event.put("eventType", "PURCHASE_CREATED");
        event.put("eventId", UUID.randomUUID().toString());
        event.put("entityId", purchaseId);
        event.put("baseId", baseId);
        event.put("equipmentId", equipmentId);
        event.put("quantity", quantity);
        event.put("createdBy", createdBy);
        event.put("userId", createdBy);
        event.put("timestamp", LocalDateTime.now().toString());

        rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE_NAME, "purchase.created", event);
        log.info("Published PURCHASE_CREATED event: {}", event);
    }

    public void publishTransferCreated(Long transferId, Long fromBaseId, Long toBaseId, Long equipmentId, Integer quantity, Long createdBy) {
        Map<String, Object> event = new HashMap<>();
        event.put("eventType", "TRANSFER_CREATED");
        event.put("eventId", UUID.randomUUID().toString());
        event.put("entityId", transferId);
        event.put("fromBaseId", fromBaseId);
        event.put("toBaseId", toBaseId);
        event.put("equipmentId", equipmentId);
        event.put("quantity", quantity);
        event.put("createdBy", createdBy);
        event.put("userId", createdBy);
        event.put("timestamp", LocalDateTime.now().toString());

        rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE_NAME, "transfer.created", event);
        log.info("Published TRANSFER_CREATED event: {}", event);
    }

    public void publishAssignmentCreated(Long assignmentId, Long baseId, Long equipmentId, String personnelName, Integer quantity, Long assignedBy) {
        Map<String, Object> event = new HashMap<>();
        event.put("eventType", "ASSIGNMENT_CREATED");
        event.put("eventId", UUID.randomUUID().toString());
        event.put("entityId", assignmentId);
        event.put("baseId", baseId);
        event.put("equipmentId", equipmentId);
        event.put("personnelName", personnelName);
        event.put("quantity", quantity);
        event.put("createdBy", assignedBy);
        event.put("userId", assignedBy);
        event.put("timestamp", LocalDateTime.now().toString());

        rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE_NAME, "assignment.created", event);
        log.info("Published ASSIGNMENT_CREATED event: {}", event);
    }

    public void publishExpenditureCreated(Long expenditureId, Long baseId, Long equipmentId, Integer quantity, String reason, Long recordedBy) {
        Map<String, Object> event = new HashMap<>();
        event.put("eventType", "EXPENDITURE_CREATED");
        event.put("eventId", UUID.randomUUID().toString());
        event.put("entityId", expenditureId);
        event.put("baseId", baseId);
        event.put("equipmentId", equipmentId);
        event.put("quantity", quantity);
        event.put("reason", reason);
        event.put("createdBy", recordedBy);
        event.put("userId", recordedBy);
        event.put("timestamp", LocalDateTime.now().toString());

        rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE_NAME, "expenditure.created", event);
        log.info("Published EXPENDITURE_CREATED event: {}", event);
    }
}
