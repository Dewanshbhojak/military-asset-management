package com.military.audit;

import com.military.audit.entity.AuditLog;
import com.military.audit.repository.AuditLogRepository;
import com.military.audit.service.AuditLogService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
public class AuditServiceApplicationTests {

    @MockBean
    private RabbitTemplate rabbitTemplate;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private AuditLogService auditLogService;

    @Test
    void testAuditLogSaveAndFilter() {
        AuditLog logItem = new AuditLog("uuid-1", "PURCHASE_CREATED", "TransactionService", 10L, 1L, "PURCHASE_CREATED", "{}");
        auditLogRepository.save(logItem);

        List<AuditLog> result = auditLogService.getAuditLogs("PURCHASE_CREATED", null, null);
        assertFalse(result.isEmpty());
        assertEquals("PURCHASE_CREATED", result.get(0).getEventType());
    }
}
