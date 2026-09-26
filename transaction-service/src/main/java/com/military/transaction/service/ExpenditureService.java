package com.military.transaction.service;

import com.military.transaction.dto.CreateExpenditureRequest;
import com.military.transaction.entity.Expenditure;
import com.military.transaction.repository.ExpenditureRepository;
import com.military.transaction.security.UserPrincipal;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class ExpenditureService {

    private final ExpenditureRepository expenditureRepository;
    private final EventPublisher eventPublisher;
    private final AssetServiceClient assetServiceClient;

    public ExpenditureService(ExpenditureRepository expenditureRepository,
                              EventPublisher eventPublisher,
                              AssetServiceClient assetServiceClient) {
        this.expenditureRepository = expenditureRepository;
        this.eventPublisher = eventPublisher;
        this.assetServiceClient = assetServiceClient;
    }

    @Transactional
    public Expenditure createExpenditure(CreateExpenditureRequest request, UserPrincipal principal) {
        if (principal != null && "BASE_COMMANDER".equals(principal.getRole()) && principal.getBaseId() != null) {
            if (!principal.getBaseId().equals(request.getBaseId())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Base Commanders can only record expenditures for their assigned base.");
            }
        }

        assetServiceClient.validateSufficientStock(request.getBaseId(), request.getEquipmentId(), request.getQuantity());

        Long recordedBy = principal != null && principal.getUserId() != null ? principal.getUserId() : 1L;

        Expenditure expenditure = new Expenditure(
                request.getBaseId(),
                request.getEquipmentId(),
                request.getQuantity(),
                request.getReason(),
                recordedBy
        );

        Expenditure saved = expenditureRepository.save(expenditure);

        // Publish event to RabbitMQ
        eventPublisher.publishExpenditureCreated(
                saved.getId(),
                saved.getBaseId(),
                saved.getEquipmentId(),
                saved.getQuantity(),
                saved.getReason(),
                saved.getRecordedBy()
        );

        return saved;
    }

    public List<Expenditure> getAllExpenditures(UserPrincipal principal) {
        if (principal != null && "BASE_COMMANDER".equals(principal.getRole()) && principal.getBaseId() != null) {
            return expenditureRepository.findByBaseId(principal.getBaseId());
        }
        return expenditureRepository.findAll();
    }

    public Expenditure getExpenditureById(Long id, UserPrincipal principal) {
        Expenditure expenditure = expenditureRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Expenditure not found with ID: " + id));

        if (principal != null && "BASE_COMMANDER".equals(principal.getRole()) && principal.getBaseId() != null) {
            if (!principal.getBaseId().equals(expenditure.getBaseId())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied for this expenditure.");
            }
        }
        return expenditure;
    }
}
