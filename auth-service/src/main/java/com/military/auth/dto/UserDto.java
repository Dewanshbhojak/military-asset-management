package com.military.auth.dto;

import com.military.auth.entity.Role;
import com.military.auth.entity.User;

public class UserDto {
    private Long id;
    private String name;
    private String email;
    private Role role;
    private Long baseId;

    public UserDto() {}

    public UserDto(Long id, String name, String email, Role role, Long baseId) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.role = role;
        this.baseId = baseId;
    }

    public static UserDto fromEntity(User user) {
        return new UserDto(
            user.getId(),
            user.getName(),
            user.getEmail(),
            user.getRole(),
            user.getBaseId()
        );
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public Long getBaseId() { return baseId; }
    public void setBaseId(Long baseId) { this.baseId = baseId; }
}
