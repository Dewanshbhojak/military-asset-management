package com.military.transaction.service;

import com.military.transaction.dto.CreateAssignmentRequest;
import com.military.transaction.entity.Assignment;
import com.military.transaction.repository.AssignmentRepository;
import com.military.transaction.security.UserPrincipal;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class AssignmentService {

    private final AssignmentRepository assignmentRepository;
    private final EventPublisher eventPublisher;
    private final AssetServiceClient assetServiceClient;

    public AssignmentService(AssignmentRepository assignmentRepository,
                             EventPublisher eventPublisher,
                             AssetServiceClient assetServiceClient) {
        this.assignmentRepository = assignmentRepository;
        this.eventPublisher = eventPublisher;
        this.assetServiceClient = assetServiceClient;
    }

    @Transactional
    public Assignment createAssignment(CreateAssignmentRequest request, UserPrincipal principal) {
        if (principal != null && "BASE_COMMANDER".equals(principal.getRole())) {
            if (principal.getBaseId() == null || !principal.getBaseId().equals(request.getBaseId())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Base Commanders can only create assignments for their assigned base.");
            }
        }

        assetServiceClient.validateSufficientStock(request.getBaseId(), request.getEquipmentId(), request.getQuantity());

        Long assignedBy = principal != null && principal.getUserId() != null ? principal.getUserId() : 1L;

        Assignment assignment = new Assignment(
                request.getBaseId(),
                request.getEquipmentId(),
                request.getPersonnelName(),
                request.getQuantity(),
                assignedBy
        );

        Assignment saved = assignmentRepository.save(assignment);

        // Publish event to RabbitMQ
        eventPublisher.publishAssignmentCreated(
                saved.getId(),
                saved.getBaseId(),
                saved.getEquipmentId(),
                saved.getPersonnelName(),
                saved.getQuantity(),
                saved.getAssignedBy()
        );

        return saved;
    }

    public List<Assignment> getAllAssignments(UserPrincipal principal) {
        if (principal != null && "BASE_COMMANDER".equals(principal.getRole())) {
            if (principal.getBaseId() == null) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Base Commander account has no assigned base.");
            return assignmentRepository.findByBaseId(principal.getBaseId());
        }
        return assignmentRepository.findAll();
    }

    public Assignment getAssignmentById(Long id, UserPrincipal principal) {
        Assignment assignment = assignmentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Assignment not found with ID: " + id));

        if (principal != null && "BASE_COMMANDER".equals(principal.getRole())) {
            if (principal.getBaseId() == null) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Base Commander account has no assigned base.");
            if (!principal.getBaseId().equals(assignment.getBaseId())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied for this assignment.");
            }
        }
        return assignment;
    }
}
