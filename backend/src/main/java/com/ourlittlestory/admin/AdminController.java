package com.ourlittlestory.admin;

import com.ourlittlestory.auth.AppUserPrincipal;
import com.ourlittlestory.auth.CurrentUser;
import com.ourlittlestory.admin.StoryUploadService.UploadResult;
import com.ourlittlestory.common.ApiException;
import com.ourlittlestory.config.AppProperties;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.io.IOException;
import java.io.InputStream;
import java.security.Principal;
import java.util.Locale;
import java.util.Map;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

/**
 * Author-only tools. Only the story author (the user whose username is OLS_USER1_USERNAME)
 * may upload the private story content; everyone else gets 403. CSRF applies as for every POST.
 */
@RestController
@RequestMapping("/api/admin")
@Tag(name = "Admin")
public class AdminController {

    private final AppProperties props;
    private final StoryUploadService uploads;

    public AdminController(AppProperties props, StoryUploadService uploads) {
        this.props = props;
        this.uploads = uploads;
    }

    @GetMapping("/status")
    @Operation(summary = "Whether the signed-in user may use the admin tools")
    public Map<String, Boolean> status(Principal principal) {
        return Map.of("admin", isAuthor(CurrentUser.from(principal)));
    }

    @PostMapping(value = "/story", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Replace the private story content from a .zip (story.json + assets/)")
    public UploadResult uploadStory(@RequestParam("file") MultipartFile file, Principal principal) throws IOException {
        if (!isAuthor(CurrentUser.from(principal))) {
            throw ApiException.forbidden("Only the story author can upload the story");
        }
        if (file.isEmpty()) {
            throw ApiException.badRequest("EMPTY_FILE", "Please choose a .zip file");
        }
        if (file.getSize() > StoryUploadService.MAX_ZIP_BYTES) {
            throw ApiException.badRequest("ZIP_TOO_LARGE", "The zip is larger than 60 MB");
        }
        String name = file.getOriginalFilename() == null ? "" : file.getOriginalFilename().toLowerCase(Locale.ROOT);
        if (!name.endsWith(".zip")) {
            throw ApiException.badRequest("NOT_A_ZIP", "Please choose a .zip file");
        }
        try (InputStream in = file.getInputStream()) {
            return uploads.replaceFrom(in);
        }
    }

    private boolean isAuthor(AppUserPrincipal user) {
        var author = props.bootstrap().user1();
        return author != null && author.username() != null && !author.username().isBlank()
                && author.username().equals(user.getUsername());
    }
}
