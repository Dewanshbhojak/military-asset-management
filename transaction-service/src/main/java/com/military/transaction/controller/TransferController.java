package com.military.transaction.controller;

import com.military.transaction.dto.CreateTransferRequest;
import com.military.transaction.entity.Transfer;
import com.military.transaction.security.UserPrincipal;
import com.military.transaction.service.TransferService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transfers")
public class TransferController {

    private final TransferService transferService;

    public TransferController(TransferService transferService) {
        this.transferService = transferService;
    }

    @PostMapping
    public ResponseEntity<Transfer> createTransfer(@Valid @RequestBody CreateTransferRequest request,
                                                   @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.status(HttpStatus.CREATED).body(transferService.createTransfer(request, principal));
    }

    @GetMapping
    public ResponseEntity<List<Transfer>> getAllTransfers(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(transferService.getAllTransfers(principal));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Transfer> getTransferById(@PathVariable Long id,
                                                    @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(transferService.getTransferById(id, principal));
    }
}
