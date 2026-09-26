package com.military.auth.config;

import com.military.auth.entity.Role;
import com.military.auth.entity.User;
import com.military.auth.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        seedAdminUser();
        seedCommanderUsers();
        seedLogisticsOfficerUser();
    }

    private void seedAdminUser() {
        String adminEmail = "admin@military.com";
        if (!userRepository.existsByEmail(adminEmail)) {
            User admin = new User(
                    "System Admin",
                    adminEmail,
                    passwordEncoder.encode("Admin@123"),
                    Role.ADMIN,
                    null
            );
            userRepository.save(admin);
            log.info("Seeded default Admin user: {}", adminEmail);
        }
    }

    private void seedCommanderUsers() {
        String commanderAlphaEmail = "commander.alpha@military.com";
        if (!userRepository.existsByEmail(commanderAlphaEmail)) {
            User commanderAlpha = new User(
                    "Commander Alpha",
                    commanderAlphaEmail,
                    passwordEncoder.encode("Commander@123"),
                    Role.BASE_COMMANDER,
                    1L
            );
            userRepository.save(commanderAlpha);
            log.info("Seeded Commander Alpha user for Base 1: {}", commanderAlphaEmail);
        }

        String commanderBravoEmail = "commander.bravo@military.com";
        if (!userRepository.existsByEmail(commanderBravoEmail)) {
            User commanderBravo = new User(
                    "Commander Bravo",
                    commanderBravoEmail,
                    passwordEncoder.encode("Commander@123"),
                    Role.BASE_COMMANDER,
                    2L
            );
            userRepository.save(commanderBravo);
            log.info("Seeded Commander Bravo user for Base 2: {}", commanderBravoEmail);
        }
    }

    private void seedLogisticsOfficerUser() {
        String logisticsEmail = "logistics@military.com";
        if (!userRepository.existsByEmail(logisticsEmail)) {
            User officer = new User(
                    "Logistics Officer",
                    logisticsEmail,
                    passwordEncoder.encode("Logistics@123"),
                    Role.LOGISTICS_OFFICER,
                    1L
            );
            userRepository.save(officer);
            log.info("Seeded Logistics Officer user: {}", logisticsEmail);
        }
    }
}
