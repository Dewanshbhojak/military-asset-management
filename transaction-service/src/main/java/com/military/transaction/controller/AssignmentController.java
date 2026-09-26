package com.military.transaction.controller;

import com.military.transaction.dto.CreateAssignmentRequest;
import com.military.transaction.entity.Assignment;
import com.military.transaction.security.UserPrincipal;
import com.military.transaction.service.AssignmentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/assignments")
public class AssignmentController {

    private final AssignmentService assignmentService;

    public AssignmentController(AssignmentService assignmentService) {
        this.assignmentService = assignmentService;
    }

    @PostMapping
    public ResponseEntity<Assignment> createAssignment(@Valid @RequestBody CreateAssignmentRequest request,
                                                       @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.status(HttpStatus.CREATED).body(assignmentService.createAssignment(request, principal));
    }

    @GetMapping
    public ResponseEntity<List<Assignment>> getAllAssignments(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(assignmentService.getAllAssignments(principal));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Assignment> getAssignmentById(@PathVariable Long id,
                                                        @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(assignmentService.getAssignmentById(id, principal));
    }
}
