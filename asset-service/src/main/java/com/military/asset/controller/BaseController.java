package com.military.asset.controller;

import com.military.asset.entity.Base;
import com.military.asset.security.UserPrincipal;
import com.military.asset.service.BaseService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/bases")
public class BaseController {

    private final BaseService baseService;

    public BaseController(BaseService baseService) {
        this.baseService = baseService;
    }

    @GetMapping
    public ResponseEntity<List<Base>> getAllBases() {
        return ResponseEntity.ok(baseService.getAllBases());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Base> getBaseById(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal principal) {
        if (principal != null && "BASE_COMMANDER".equals(principal.getRole()) && !id.equals(principal.getBaseId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied: Base Commanders can only access their assigned base data.");
        }
        return ResponseEntity.ok(baseService.getBaseById(id));
    }

    @PostMapping
    public ResponseEntity<Base> createBase(@Valid @RequestBody Base base) {
        return ResponseEntity.status(HttpStatus.CREATED).body(baseService.createBase(base));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Base> updateBase(@PathVariable Long id, @Valid @RequestBody Base base) {
        return ResponseEntity.ok(baseService.updateBase(id, base));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBase(@PathVariable Long id) {
        baseService.deleteBase(id);
        return ResponseEntity.noContent().build();
    }
}
