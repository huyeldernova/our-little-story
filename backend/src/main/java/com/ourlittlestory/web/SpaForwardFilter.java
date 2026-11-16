package com.ourlittlestory.web;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Single-service deploy: the built React app lives in classpath:/static. Client-side routes
 * (/login, /story/3, /admin/story …) are forwarded to /index.html so a refresh never 404s.
 * Only GET requests whose path is not an API / WebSocket / docs path and whose last segment
 * has no file extension are forwarded. Without a built frontend (local dev with Vite) this
 * filter does nothing.
 */
@Component
public class SpaForwardFilter extends OncePerRequestFilter {

    private static final List<String> SKIP = List.of("/api/", "/api", "/ws", "/v3/", "/swagger-ui", "/error",
            "/assets/");

    private final boolean hasIndex = new ClassPathResource("static/index.html").exists();

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        if (!hasIndex || !"GET".equals(request.getMethod())) {
            return true;
        }
        String path = request.getRequestURI().substring(request.getContextPath().length());
        if (path.isEmpty() || path.equals("/") || path.equals("/index.html")) {
            return path.equals("/index.html");
        }
        for (String prefix : SKIP) {
            if (path.startsWith(prefix)) {
                return true;
            }
        }
        String last = path.substring(path.lastIndexOf('/') + 1);
        return last.contains(".");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        request.getRequestDispatcher("/index.html").forward(request, response);
    }
}
