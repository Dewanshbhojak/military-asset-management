package com.military.auth;

import com.military.auth.dto.LoginRequest;
import com.military.auth.dto.LoginResponse;
import com.military.auth.entity.Role;
import com.military.auth.entity.User;
import com.military.auth.repository.UserRepository;
import com.military.auth.security.JwtService;
import com.military.auth.service.AuthService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.web.server.ResponseStatusException;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
public class AuthServiceApplicationTests {

    @Autowired
    private AuthService authService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @Test
    void testAdminLoginSuccess() {
        LoginRequest request = new LoginRequest("admin@military.com", "Admin@123");
        LoginResponse response = authService.login(request);

        assertNotNull(response);
        assertNotNull(response.getToken());
        assertEquals("admin@military.com", response.getUser().getEmail());
        assertEquals(Role.ADMIN, response.getUser().getRole());
        assertTrue(jwtService.isTokenValid(response.getToken()));
    }

    @Test
    void testWrongPasswordRejected() {
        LoginRequest request = new LoginRequest("admin@military.com", "WrongPass123");
        assertThrows(ResponseStatusException.class, () -> authService.login(request));
    }
}
