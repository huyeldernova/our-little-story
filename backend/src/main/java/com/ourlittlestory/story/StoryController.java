package com.ourlittlestory.story;

import com.ourlittlestory.common.ApiException;
import com.ourlittlestory.config.AppProperties;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Duration;
import java.util.Locale;
import java.util.Map;
import java.util.regex.Pattern;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Serves the private story content (texts, letters, photos) to signed-in users only.
 * The content lives outside the repository in app.story.directory:
 *   story.json      chapter texts
 *   assets/*.jpg    photos and screenshots referenced from story.json
 * so nothing personal is ever committed or bundled into the public frontend.
 */
@RestController
@RequestMapping("/api/story")
@Tag(name = "Story")
public class StoryController {

    private static final Pattern ASSET_NAME =
            Pattern.compile("^[A-Za-z0-9][A-Za-z0-9._-]{0,120}\\.(jpg|jpeg|png|webp|gif|mp3|m4a|ogg)$");
    private static final Map<String, MediaType> TYPES = Map.of(
            "jpg", MediaType.IMAGE_JPEG, "jpeg", MediaType.IMAGE_JPEG, "png", MediaType.IMAGE_PNG,
            "webp", MediaType.parseMediaType("image/webp"), "gif", MediaType.IMAGE_GIF,
            "mp3", MediaType.parseMediaType("audio/mpeg"), "m4a", MediaType.parseMediaType("audio/mp4"),
            "ogg", MediaType.parseMediaType("audio/ogg"));

    private final AppProperties props;

    public StoryController(AppProperties props) {
        this.props = props;
    }

    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "The story content (chapter texts) as JSON")
    public ResponseEntity<String> story() throws IOException {
        Path file = root().resolve("story.json");
        if (!Files.isRegularFile(file)) {
            throw new ApiException(HttpStatus.NOT_FOUND, "STORY_NOT_FOUND", "story.json is missing");
        }
        return ResponseEntity.ok()
                .cacheControl(CacheControl.noCache().cachePrivate())
                .contentType(MediaType.APPLICATION_JSON)
                .body(Files.readString(file));
    }

    @GetMapping("/assets/{name}")
    @Operation(summary = "A photo or other asset referenced by story.json")
    public ResponseEntity<Resource> asset(@PathVariable String name) {
        if (!ASSET_NAME.matcher(name).matches()) {
            throw ApiException.notFound("Asset");
        }
        Path assets = root().resolve("assets").normalize();
        Path file = assets.resolve(name).normalize();
        if (!file.startsWith(assets) || !Files.isRegularFile(file)) {
            throw ApiException.notFound("Asset");
        }
        String ext = name.substring(name.lastIndexOf('.') + 1).toLowerCase(Locale.ROOT);
        return ResponseEntity.ok()
                .contentType(TYPES.get(ext))
                .cacheControl(CacheControl.maxAge(Duration.ofDays(1)).cachePrivate())
                .header("X-Content-Type-Options", "nosniff")
                .body(new FileSystemResource(file));
    }

    private Path root() {
        String dir = props.story().directory();
        if (dir == null || dir.isBlank()) {
            throw new ApiException(HttpStatus.NOT_FOUND, "STORY_NOT_CONFIGURED", "Story directory is not configured");
        }
        return Path.of(dir).toAbsolutePath().normalize();
    }
}
