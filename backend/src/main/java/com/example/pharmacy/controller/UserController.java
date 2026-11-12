package com.example.pharmacy.controller;

import com.example.pharmacy.entity.Role;
import com.example.pharmacy.entity.User;
import com.example.pharmacy.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController @RequestMapping("/api/users")
public class UserController {
  @Autowired private UserService service;

  // @PreAuthorize("hasRole('ADMIN')") // Temporarily disabled for debugging
  @PostMapping public User create(@RequestBody User u){ return service.create(u.getUsername(), u.getEmail(), u.getPassword(), u.getRole()); }

  // @PreAuthorize("hasRole('ADMIN')") // Temporarily disabled for debugging
  @GetMapping public List<User> all(){ return service.all(); }

  // @PreAuthorize("hasRole('ADMIN')") // Temporarily disabled for debugging
  @GetMapping("/{id}") public User get(@PathVariable Long id){ return service.find(id).orElseThrow(); }

  // @PreAuthorize("hasRole('ADMIN')") // Temporarily disabled for debugging
  @PutMapping("/{id}") public User update(@PathVariable Long id, @RequestBody User u){
    return service.update(id, u.getUsername(), u.getEmail(), u.getPassword(), u.getRole());
  }

  // @PreAuthorize("hasRole('ADMIN')") // Temporarily disabled for debugging
  @DeleteMapping("/{id}") public void delete(@PathVariable Long id){ service.delete(id); }
}
