package com.ourlittlestory.chat;

import com.ourlittlestory.auth.AppUserPrincipal;
import com.ourlittlestory.auth.CurrentUser;
import com.ourlittlestory.chat.ChatDtos.ChatError;
import com.ourlittlestory.chat.ChatDtos.StompSendRequest;
import com.ourlittlestory.chat.ChatDtos.TypingRequest;
import com.ourlittlestory.common.ApiException;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validator;
import java.security.Principal;
import java.util.Set;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.handler.annotation.MessageExceptionHandler;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.stereotype.Controller;

/** STOMP endpoints: /app/chat.send and /app/chat.typing. Errors go to /user/queue/errors. */
@Controller
public class ChatStompController {

    private static final Logger log = LoggerFactory.getLogger(ChatStompController.class);

    private final ChatService chat;
    private final Validator validator;

    public ChatStompController(ChatService chat, Validator validator) {
        this.chat = chat;
        this.validator = validator;
    }

    @MessageMapping("/chat.send")
    public void send(@Payload StompSendRequest body, Principal principal) {
        AppUserPrincipal user = CurrentUser.from(principal);
        try {
            validate(body);
            chat.send(body.conversationId(), user.getId(), body.toRequest());
        } catch (ApiException ex) {
            throw new SendFailed(ex, body == null ? null : body.clientMessageId());
        }
    }

    /** Carries the clientMessageId so the sender can mark that bubble as failed. */
    static class SendFailed extends RuntimeException {
        final ApiException cause;
        final String clientMessageId;

        SendFailed(ApiException cause, String clientMessageId) {
            super(cause.getMessage(), cause, false, false);
            this.cause = cause;
            this.clientMessageId = clientMessageId;
        }
    }

    @MessageExceptionHandler(SendFailed.class)
    @SendToUser(destinations = "/queue/errors", broadcast = false)
    public ChatError handleSendFailed(SendFailed ex) {
        return new ChatError(ex.cause.getCode(), ex.cause.getMessage(), ex.clientMessageId);
    }

    @MessageMapping("/chat.typing")
    public void typing(@Payload TypingRequest body, Principal principal) {
        AppUserPrincipal user = CurrentUser.from(principal);
        validate(body);
        chat.typing(body.conversationId(), user.getId(), user.getDisplayName(), body.typing());
    }

    @MessageExceptionHandler(ApiException.class)
    @SendToUser(destinations = "/queue/errors", broadcast = false)
    public ChatError handleApi(ApiException ex) {
        return new ChatError(ex.getCode(), ex.getMessage(), null);
    }

    @MessageExceptionHandler(Exception.class)
    @SendToUser(destinations = "/queue/errors", broadcast = false)
    public ChatError handleOther(Exception ex) {
        log.warn("STOMP message failed: {}", ex.toString());
        return new ChatError("BAD_MESSAGE", "Message could not be processed", null);
    }

    private <T> void validate(T body) {
        if (body == null) {
            throw ApiException.badRequest("BAD_MESSAGE", "Empty payload");
        }
        Set<ConstraintViolation<T>> violations = validator.validate(body);
        if (!violations.isEmpty()) {
            ConstraintViolation<T> v = violations.iterator().next();
            throw ApiException.badRequest("VALIDATION_FAILED", v.getPropertyPath() + " " + v.getMessage());
        }
    }
}
