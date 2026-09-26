package com.military.transaction.service;

import com.military.transaction.dto.CreateTransferRequest;
import com.military.transaction.entity.Transfer;
import com.military.transaction.repository.TransferRepository;
import com.military.transaction.security.UserPrincipal;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class TransferService {

    private final TransferRepository transferRepository;
    private final EventPublisher eventPublisher;
    private final AssetServiceClient assetServiceClient;

    public TransferService(TransferRepository transferRepository,
                           EventPublisher eventPublisher,
                           AssetServiceClient assetServiceClient) {
        this.transferRepository = transferRepository;
        this.eventPublisher = eventPublisher;
        this.assetServiceClient = assetServiceClient;
    }

    @Transactional
    public Transfer createTransfer(CreateTransferRequest request, UserPrincipal principal) {
        if (request.getFromBaseId().equals(request.getToBaseId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Source base and destination base cannot be the same.");
        }

        // Validate stock in source base
        assetServiceClient.validateSufficientStock(request.getFromBaseId(), request.getEquipmentId(), request.getQuantity());

        Long createdBy = principal != null && principal.getUserId() != null ? principal.getUserId() : 1L;

        Transfer transfer = new Transfer(
                request.getFromBaseId(),
                request.getToBaseId(),
                request.getEquipmentId(),
                request.getQuantity(),
                createdBy
        );

        Transfer saved = transferRepository.save(transfer);

        // Publish event to RabbitMQ
        eventPublisher.publishTransferCreated(
                saved.getId(),
                saved.getFromBaseId(),
                saved.getToBaseId(),
                saved.getEquipmentId(),
                saved.getQuantity(),
                saved.getCreatedBy()
        );

        return saved;
    }

    public List<Transfer> getAllTransfers(UserPrincipal principal) {
        if (principal != null && "BASE_COMMANDER".equals(principal.getRole()) && principal.getBaseId() != null) {
            return transferRepository.findByFromBaseIdOrToBaseId(principal.getBaseId(), principal.getBaseId());
        }
        return transferRepository.findAll();
    }

    public Transfer getTransferById(Long id, UserPrincipal principal) {
        Transfer transfer = transferRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Transfer not found with ID: " + id));

        if (principal != null && "BASE_COMMANDER".equals(principal.getRole()) && principal.getBaseId() != null) {
            if (!principal.getBaseId().equals(transfer.getFromBaseId()) && !principal.getBaseId().equals(transfer.getToBaseId())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied for this transfer transaction.");
            }
        }
        return transfer;
    }
}
