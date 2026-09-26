package com.military.transaction.controller;

import com.military.transaction.dto.CreateExpenditureRequest;
import com.military.transaction.entity.Expenditure;
import com.military.transaction.security.UserPrincipal;
import com.military.transaction.service.ExpenditureService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/expenditures")
public class ExpenditureController {

    private final ExpenditureService expenditureService;

    public ExpenditureController(ExpenditureService expenditureService) {
        this.expenditureService = expenditureService;
    }

    @PostMapping
    public ResponseEntity<Expenditure> createExpenditure(@Valid @RequestBody CreateExpenditureRequest request,
                                                         @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.status(HttpStatus.CREATED).body(expenditureService.createExpenditure(request, principal));
    }

    @GetMapping
    public ResponseEntity<List<Expenditure>> getAllExpenditures(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(expenditureService.getAllExpenditures(principal));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Expenditure> getExpenditureById(@PathVariable Long id,
                                                          @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(expenditureService.getExpenditureById(id, principal));
    }
}
