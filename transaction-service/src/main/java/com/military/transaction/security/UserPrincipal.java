package com.military.transaction.security;

public class UserPrincipal {
    private final Long userId;
    private final String email;
    private final String role;
    private final Long baseId;

    public UserPrincipal(Long userId, String email, String role, Long baseId) {
        this.userId = userId;
        this.email = email;
        this.role = role;
        this.baseId = baseId;
    }

    public Long getUserId() { return userId; }
    public String getEmail() { return email; }
    public String getRole() { return role; }
    public Long getBaseId() { return baseId; }
}
