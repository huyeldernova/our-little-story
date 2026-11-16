package com.ourlittlestory.auth;

import com.ourlittlestory.common.ApiException;
import java.security.Principal;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

/** Helpers for reading the logged-in user from HTTP and STOMP contexts. */
public final class CurrentUser {

    private CurrentUser() {
    }

    public static AppUserPrincipal get() {
        return from(SecurityContextHolder.getContext().getAuthentication());
    }

    public static Long id() {
        return get().getId();
    }

    public static AppUserPrincipal from(Principal principal) {
        if (principal instanceof Authentication auth && auth.getPrincipal() instanceof AppUserPrincipal p) {
            return p;
        }
        throw new ApiException(HttpStatus.UNAUTHORIZED, "UNAUTHENTICATED", "Please sign in");
    }
}
