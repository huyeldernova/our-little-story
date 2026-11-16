package com.ourlittlestory.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI ourLittleStoryOpenApi() {
        return new OpenAPI().info(new Info()
                .title("Our Little Story API")
                .version("1.0.0")
                .description("""
                        Session-cookie auth. Call GET /api/auth/csrf first and send the token in the
                        X-CSRF-TOKEN header on POST/PUT/DELETE. Real-time chat uses STOMP over
                        WebSocket at /ws: send to /app/chat.send and /app/chat.typing, subscribe to
                        /topic/conversations/{conversationId} and /user/queue/errors."""));
    }
}
