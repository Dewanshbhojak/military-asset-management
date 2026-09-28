package com.military.transaction.config;

import com.military.transaction.dto.CreateAssignmentRequest;
import com.military.transaction.dto.CreateExpenditureRequest;
import com.military.transaction.dto.CreatePurchaseRequest;
import com.military.transaction.dto.CreateTransferRequest;
import com.military.transaction.repository.AssignmentRepository;
import com.military.transaction.repository.ExpenditureRepository;
import com.military.transaction.repository.PurchaseRepository;
import com.military.transaction.repository.TransferRepository;
import com.military.transaction.service.AssignmentService;
import com.military.transaction.service.ExpenditureService;
import com.military.transaction.service.PurchaseService;
import com.military.transaction.service.TransferService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DemoTransactionSeeder implements CommandLineRunner {
    private static final Logger log = LoggerFactory.getLogger(DemoTransactionSeeder.class);
    private final PurchaseRepository purchases;
    private final TransferRepository transfers;
    private final AssignmentRepository assignments;
    private final ExpenditureRepository expenditures;
    private final PurchaseService purchaseService;
    private final TransferService transferService;
    private final AssignmentService assignmentService;
    private final ExpenditureService expenditureService;

    public DemoTransactionSeeder(PurchaseRepository purchases, TransferRepository transfers,
            AssignmentRepository assignments, ExpenditureRepository expenditures,
            PurchaseService purchaseService, TransferService transferService,
            AssignmentService assignmentService, ExpenditureService expenditureService) {
        this.purchases = purchases;
        this.transfers = transfers;
        this.assignments = assignments;
        this.expenditures = expenditures;
        this.purchaseService = purchaseService;
        this.transferService = transferService;
        this.assignmentService = assignmentService;
        this.expenditureService = expenditureService;
    }

    @Override
    public void run(String... args) {
        if (purchases.count() + transfers.count() + assignments.count() + expenditures.count() > 0) return;

        purchase(1, 1, 35);
        purchase(3, 1, 24);
        purchase(6, 3, 12);

        transfer(1, 2, 1, 14);
        transfer(2, 5, 1, 9);
        transfer(3, 6, 1, 11);
        transfer(4, 7, 1, 8);
        transfer(6, 10, 1, 10);

        assignment(1, 1, "Personnel Alpha", 3);
        assignment(2, 1, "Personnel Bravo", 2);
        assignment(3, 1, "Personnel Charlie", 3);
        assignment(6, 1, "Personnel Delta", 2);

        expenditure(1, 3, 4, "Training exercise");
        expenditure(2, 3, 3, "Maintenance");
        expenditure(3, 3, 2, "Damaged equipment");
        expenditure(4, 3, 5, "Routine consumption");
        expenditure(6, 3, 2, "Replacement");
        log.info("Published fictional demo purchase, transfer, assignment and expenditure events");
    }

    private void purchase(long baseId, long equipmentId, int quantity) {
        CreatePurchaseRequest request = new CreatePurchaseRequest();
        request.setBaseId(baseId); request.setEquipmentId(equipmentId); request.setQuantity(quantity);
        purchaseService.createPurchase(request, null);
    }

    private void transfer(long from, long to, long equipmentId, int quantity) {
        CreateTransferRequest request = new CreateTransferRequest();
        request.setFromBaseId(from); request.setToBaseId(to); request.setEquipmentId(equipmentId); request.setQuantity(quantity);
        transferService.createTransfer(request, null);
    }

    private void assignment(long baseId, long equipmentId, String personnel, int quantity) {
        CreateAssignmentRequest request = new CreateAssignmentRequest();
        request.setBaseId(baseId); request.setEquipmentId(equipmentId); request.setPersonnelName(personnel); request.setQuantity(quantity);
        assignmentService.createAssignment(request, null);
    }

    private void expenditure(long baseId, long equipmentId, int quantity, String reason) {
        CreateExpenditureRequest request = new CreateExpenditureRequest();
        request.setBaseId(baseId); request.setEquipmentId(equipmentId); request.setQuantity(quantity); request.setReason(reason);
        expenditureService.createExpenditure(request, null);
    }
}
