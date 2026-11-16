package com.ourlittlestory.story;

import com.ourlittlestory.common.ApiException;
import com.ourlittlestory.config.AppProperties;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.concurrent.atomic.AtomicBoolean;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

/**
 * Where the story content lives. {@code app.story.directory} is the real (private) content;
 * if it has no story.json yet and {@code app.story.fallback-directory} has one (the public
 * placeholder story baked into the Docker image), the fallback is served so the site still
 * opens until the private content is uploaded.
 */
@Component
public class StoryLocation {

    private static final Logger log = LoggerFactory.getLogger(StoryLocation.class);

    private final AppProperties props;
    private final AtomicBoolean warned = new AtomicBoolean();

    public StoryLocation(AppProperties props) {
        this.props = props;
    }

    /** The configured directory (target of uploads). */
    public Path configured() {
        String dir = props.story().directory();
        if (dir == null || dir.isBlank()) {
            throw new ApiException(HttpStatus.NOT_FOUND, "STORY_NOT_CONFIGURED", "Story directory is not configured");
        }
        return Path.of(dir).toAbsolutePath().normalize();
    }

    /** The directory to read from right now. */
    public Path current() {
        Path dir = configured();
        if (Files.isRegularFile(dir.resolve("story.json"))) {
            warned.set(false);
            return dir;
        }
        String fb = props.story().fallbackDirectory();
        if (fb != null && !fb.isBlank()) {
            Path fallback = Path.of(fb).toAbsolutePath().normalize();
            if (Files.isRegularFile(fallback.resolve("story.json"))) {
                if (warned.compareAndSet(false, true)) {
                    log.warn("No story.json in {}; serving the placeholder story from {} until content is uploaded",
                            dir, fallback);
                }
                return fallback;
            }
        }
        return dir;
    }
}
