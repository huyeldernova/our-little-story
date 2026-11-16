package com.ourlittlestory.auth;

import com.ourlittlestory.user.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class AppUserDetailsService implements UserDetailsService {

    private final UserRepository users;

    public AppUserDetailsService(UserRepository users) {
        this.users = users;
    }

    @Override
    public UserDetails loadUserByUsername(String username) {
        return users.findByUsername(username)
                .map(u -> new AppUserPrincipal(u.getId(), u.getUsername(), u.getDisplayName(), u.getPasswordHash()))
                .orElseThrow(() -> new UsernameNotFoundException("Unknown user"));
    }
}
