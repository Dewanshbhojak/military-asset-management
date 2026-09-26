package com.military.transaction;

import com.military.transaction.dto.CreatePurchaseRequest;
import com.military.transaction.dto.CreateTransferRequest;
import com.military.transaction.entity.Purchase;
import com.military.transaction.entity.Transfer;
import com.military.transaction.security.UserPrincipal;
import com.military.transaction.service.AssetServiceClient;
import com.military.transaction.service.EventPublisher;
import com.military.transaction.service.PurchaseService;
import com.military.transaction.service.TransferService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.web.server.ResponseStatusException;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
public class TransactionServiceApplicationTests {

    @MockBean
    private RabbitTemplate rabbitTemplate;

    @MockBean
    private EventPublisher eventPublisher;

    @MockBean
    private AssetServiceClient assetServiceClient;

    @Autowired
    private PurchaseService purchaseService;

    @Autowired
    private TransferService transferService;

    @Test
    void testPurchaseCreationSuccess() {
        CreatePurchaseRequest req = new CreatePurchaseRequest();
        req.setBaseId(1L);
        req.setEquipmentId(1L);
        req.setQuantity(50);

        UserPrincipal principal = new UserPrincipal(1L, "admin@military.com", "ADMIN", null);
        Purchase purchase = purchaseService.createPurchase(req, principal);

        assertNotNull(purchase.getId());
        assertEquals(50, purchase.getQuantity());
    }

    @Test
    void testTransferSameBaseRejected() {
        CreateTransferRequest req = new CreateTransferRequest();
        req.setFromBaseId(1L);
        req.setToBaseId(1L);
        req.setEquipmentId(1L);
        req.setQuantity(10);

        UserPrincipal principal = new UserPrincipal(1L, "admin@military.com", "ADMIN", null);
        assertThrows(ResponseStatusException.class, () -> transferService.createTransfer(req, principal));
    }
}
