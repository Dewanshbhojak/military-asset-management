package com.military.transaction.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(AbstractHttpConfigurer::disable)
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/actuator/**", "/error").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/purchases/**").hasAnyRole("ADMIN", "LOGISTICS_OFFICER")
                .requestMatchers(HttpMethod.GET, "/api/purchases/**").authenticated()

                .requestMatchers(HttpMethod.POST, "/api/transfers/**").hasAnyRole("ADMIN", "LOGISTICS_OFFICER")
                .requestMatchers(HttpMethod.GET, "/api/transfers/**").authenticated()

                .requestMatchers(HttpMethod.POST, "/api/assignments/**").hasAnyRole("ADMIN", "BASE_COMMANDER")
                .requestMatchers(HttpMethod.GET, "/api/assignments/**").authenticated()

                .requestMatchers(HttpMethod.POST, "/api/expenditures/**").hasAnyRole("ADMIN", "BASE_COMMANDER")
                .requestMatchers(HttpMethod.GET, "/api/expenditures/**").authenticated()

                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
