package com.ourlittlestory.chat;

import com.ourlittlestory.auth.CurrentUser;
import com.ourlittlestory.chat.ChatDtos.ConversationDto;
import com.ourlittlestory.chat.ChatDtos.MessageDto;
import com.ourlittlestory.chat.ChatDtos.MessagePage;
import com.ourlittlestory.chat.ChatDtos.ReadReceipt;
import com.ourlittlestory.chat.ChatDtos.ReadRequest;
import com.ourlittlestory.chat.ChatDtos.SendMessageRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/conversations")
@Tag(name = "Conversations")
public class ConversationController {

    private final ChatService chat;

    public ConversationController(ChatService chat) {
        this.chat = chat;
    }

    @GetMapping
    @Operation(summary = "Conversations of the signed-in user, with members, online status and unread count")
    public List<ConversationDto> list() {
        return chat.listConversations(CurrentUser.id());
    }

    @GetMapping("/{id}/messages")
    @Operation(summary = "Message history, newest page first. Pass before=<oldest id you have> for older pages")
    public MessagePage messages(@PathVariable Long id,
                                @RequestParam(required = false) Long before,
                                @RequestParam(required = false) Integer limit) {
        return chat.history(id, CurrentUser.id(), before, limit);
    }

    @PostMapping("/{id}/messages")
    @Operation(summary = "Send a message (REST fallback for /app/chat.send). Idempotent per clientMessageId")
    public ResponseEntity<MessageDto> send(@PathVariable Long id, @Valid @RequestBody SendMessageRequest body) {
        return ResponseEntity.status(HttpStatus.CREATED).body(chat.send(id, CurrentUser.id(), body));
    }

    @PutMapping("/{id}/read")
    @Operation(summary = "Mark messages up to lastReadMessageId as read")
    public ReadReceipt read(@PathVariable Long id, @Valid @RequestBody ReadRequest body) {
        return chat.markRead(id, CurrentUser.id(), body.lastReadMessageId());
    }
}
