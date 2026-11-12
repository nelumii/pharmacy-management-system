package com.example.pharmacy.controller;

import com.example.pharmacy.dto.AuthResponse;
import com.example.pharmacy.dto.LoginRequest;
import com.example.pharmacy.dto.RegisterRequest;
import com.example.pharmacy.entity.Role;
import com.example.pharmacy.entity.User;
import com.example.pharmacy.repository.UserRepository;
import com.example.pharmacy.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/api/auth")
public class AuthController {
    @Autowired private AuthenticationManager authManager;
    @Autowired private JwtUtil jwtUtil;
    @Autowired private UserRepository userRepo;
    @Autowired private PasswordEncoder encoder;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req){
        try {
            authManager.authenticate(
                    new UsernamePasswordAuthenticationToken(req.getUsername(), req.getPassword())
            );
            var user = userRepo.findByUsername(req.getUsername()).orElseThrow();
            String token = jwtUtil.generateToken(user.getUsername(), user.getRole().name());
            return ResponseEntity.ok(new AuthResponse(token, user.getRole().name()));
        } catch (Exception e) {
            return ResponseEntity.status(401).body("Invalid username or password");
        }
    }
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest req){
        if(userRepo.existsByUsername(req.getUsername())) return ResponseEntity.badRequest().body("Username already exists");
        if(userRepo.existsByEmail(req.getEmail())) return ResponseEntity.badRequest().body("Email already exists");
        User u = User.builder().username(req.getUsername()).email(req.getEmail()).password(encoder.encode(req.getPassword())).role(Role.CUSTOMER).build();
        userRepo.save(u);
        return ResponseEntity.ok("Registered");
    }
}
