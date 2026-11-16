package com.ourlittlestory.auth;

import com.ourlittlestory.common.ApiException;
import com.ourlittlestory.user.UserDto;
import com.ourlittlestory.user.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.context.SecurityContextHolderStrategy;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.security.web.csrf.CsrfTokenRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Auth")
public class AuthController {

    public record LoginRequest(
            @NotBlank @Size(max = 50) String username,
            @NotBlank @Size(max = 200) String password) {
    }

    public record CsrfResponse(String headerName, String token) {
    }

    private final AuthenticationManager authenticationManager;
    private final SecurityContextRepository securityContextRepository;
    private final CsrfTokenRepository csrfTokenRepository;
    private final LoginAttemptService loginAttempts;
    private final UserRepository users;
    private final SecurityContextHolderStrategy contextHolder = SecurityContextHolder.getContextHolderStrategy();

    public AuthController(AuthenticationManager authenticationManager,
                          SecurityContextRepository securityContextRepository,
                          CsrfTokenRepository csrfTokenRepository,
                          LoginAttemptService loginAttempts,
                          UserRepository users) {
        this.authenticationManager = authenticationManager;
        this.securityContextRepository = securityContextRepository;
        this.csrfTokenRepository = csrfTokenRepository;
        this.loginAttempts = loginAttempts;
        this.users = users;
    }

    @GetMapping("/csrf")
    @Operation(summary = "Get the CSRF token for this session; send it back in the given header on every POST/PUT/DELETE")
    public CsrfResponse csrf(CsrfToken token) {
        return new CsrfResponse(token.getHeaderName(), token.getToken());
    }

    @PostMapping("/login")
    @Operation(summary = "Sign in with username and password; starts a session (HttpOnly cookie)")
    public UserDto login(@Valid @RequestBody LoginRequest body, HttpServletRequest request,
                         HttpServletResponse response) {
        String ip = request.getRemoteAddr();
        String username = body.username().trim();
        if (loginAttempts.isBlocked(username, ip)) {
            throw new ApiException(HttpStatus.TOO_MANY_REQUESTS, "TOO_MANY_ATTEMPTS",
                    "Too many failed attempts. Please wait a little and try again.");
        }
        Authentication auth;
        try {
            auth = authenticationManager.authenticate(
                    UsernamePasswordAuthenticationToken.unauthenticated(username, body.password()));
        } catch (AuthenticationException e) {
            loginAttempts.recordFailure(username, ip);
            throw new ApiException(HttpStatus.UNAUTHORIZED, "INVALID_CREDENTIALS", "Wrong username or password");
        }
        loginAttempts.recordSuccess(username, ip);

        // Protect against session fixation, then rotate the CSRF token.
        request.getSession(true);
        request.changeSessionId();
        csrfTokenRepository.saveToken(null, request, response);

        SecurityContext context = contextHolder.createEmptyContext();
        context.setAuthentication(auth);
        contextHolder.setContext(context);
        securityContextRepository.saveContext(context, request, response);

        AppUserPrincipal principal = (AppUserPrincipal) auth.getPrincipal();
        return new UserDto(principal.getId(), principal.getUsername(), principal.getDisplayName());
    }

    @PostMapping("/logout")
    @Operation(summary = "Sign out and invalidate the session")
    public ResponseEntity<Void> logout(HttpServletRequest request, HttpServletResponse response) {
        new SecurityContextLogoutHandler().logout(request, response, contextHolder.getContext().getAuthentication());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    @Operation(summary = "The signed-in user, or 401")
    public UserDto me() {
        Long id = CurrentUser.id();
        return users.findById(id).map(UserDto::from)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "UNAUTHENTICATED", "Please sign in"));
    }
}
