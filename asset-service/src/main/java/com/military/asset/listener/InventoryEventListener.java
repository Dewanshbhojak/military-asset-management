package com.military.asset.listener;

import com.military.asset.config.RabbitMQConfig;
import com.military.asset.service.InventoryService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class InventoryEventListener {

    private static final Logger log = LoggerFactory.getLogger(InventoryEventListener.class);

    private final InventoryService inventoryService;

    public InventoryEventListener(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @RabbitListener(queues = RabbitMQConfig.INVENTORY_QUEUE)
    public void handleEvent(Map<String, Object> event) {
        log.info("Received event in Asset Service: {}", event);

        String eventId = (String) event.get("eventId");
        String eventType = (String) event.get("eventType");

        if (eventId != null && !inventoryService.processIdempotentEvent(eventId)) {
            return;
        }

        try {
            switch (eventType) {
                case "PURCHASE_CREATED": {
                    Long baseId = getLongValue(event.get("baseId"));
                    Long equipmentId = getLongValue(event.get("equipmentId"));
                    Integer quantity = getIntValue(event.get("quantity"));
                    inventoryService.increaseStock(baseId, equipmentId, quantity);
                    break;
                }
                case "TRANSFER_CREATED": {
                    Long fromBaseId = getLongValue(event.get("fromBaseId"));
                    Long toBaseId = getLongValue(event.get("toBaseId"));
                    Long equipmentId = getLongValue(event.get("equipmentId"));
                    Integer quantity = getIntValue(event.get("quantity"));

                    inventoryService.decreaseStock(fromBaseId, equipmentId, quantity);
                    inventoryService.increaseStock(toBaseId, equipmentId, quantity);
                    break;
                }
                case "ASSIGNMENT_CREATED": {
                    Long baseId = getLongValue(event.get("baseId"));
                    Long equipmentId = getLongValue(event.get("equipmentId"));
                    Integer quantity = getIntValue(event.get("quantity"));
                    inventoryService.decreaseStock(baseId, equipmentId, quantity);
                    break;
                }
                case "EXPENDITURE_CREATED": {
                    Long baseId = getLongValue(event.get("baseId"));
                    Long equipmentId = getLongValue(event.get("equipmentId"));
                    Integer quantity = getIntValue(event.get("quantity"));
                    inventoryService.decreaseStock(baseId, equipmentId, quantity);
                    break;
                }
                default:
                    log.warn("Unknown event type: {}", eventType);
            }
        } catch (Exception e) {
            log.error("Error processing inventory event: {}", e.getMessage(), e);
        }
    }

    private Long getLongValue(Object obj) {
        if (obj == null) return null;
        return ((Number) obj).longValue();
    }

    private Integer getIntValue(Object obj) {
        if (obj == null) return null;
        return ((Number) obj).intValue();
    }
}
