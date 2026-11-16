package com.ourlittlestory.admin;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ourlittlestory.common.ApiException;
import com.ourlittlestory.story.StoryLocation;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.file.AtomicMoveNotSupportedException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Comparator;
import java.util.UUID;
import java.util.regex.Pattern;
import java.util.stream.Stream;
import java.util.zip.ZipEntry;
import java.util.zip.ZipException;
import java.util.zip.ZipInputStream;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

/**
 * Replaces the private story content from an uploaded .zip:
 *   story.json + assets/*.(jpg|jpeg|png|webp|gif), optionally inside a top-level "story-private/".
 * Entries are checked one by one (no "..", no absolute paths: zip-slip is refused outright),
 * anything else is ignored, sizes are capped (zip bombs), story.json must be JSON with "texts".
 * The content is unpacked into a temporary sibling directory and then swapped in with
 * (atomic) moves, so readers never see a half-written story.
 */
@Service
public class StoryUploadService {

    public static final long MAX_ZIP_BYTES = 60L * 1024 * 1024;
    static final long MAX_ENTRY_BYTES = 30L * 1024 * 1024;
    static final long MAX_TOTAL_BYTES = 300L * 1024 * 1024;
    static final int MAX_ENTRIES = 2000;

    /** Same names the story asset endpoint serves (lower-case extensions). */
    private static final Pattern ASSET = Pattern.compile("^[A-Za-z0-9][A-Za-z0-9._-]{0,120}\\.(jpg|jpeg|png|webp|gif)$");
    private static final Logger log = LoggerFactory.getLogger(StoryUploadService.class);

    private final StoryLocation location;
    private final ObjectMapper json;

    public StoryUploadService(StoryLocation location, ObjectMapper json) {
        this.location = location;
        this.json = json;
    }

    public record UploadResult(int files, int assets) {
    }

    public UploadResult replaceFrom(InputStream zip) throws IOException {
        Path target = location.configured();
        Path parent = target.getParent();
        Files.createDirectories(parent);
        Path tmp = Files.createDirectory(parent.resolve(".story-upload-" + UUID.randomUUID()));
        try {
            int assets = unpack(zip, tmp);
            Path storyJson = tmp.resolve("story.json");
            if (!Files.isRegularFile(storyJson)) {
                throw ApiException.badRequest("STORY_JSON_MISSING", "The zip has no story.json");
            }
            validateStory(storyJson);
            swapIn(tmp, target);
            log.info("Story content replaced: story.json + {} assets", assets);
            return new UploadResult(assets + 1, assets);
        } finally {
            deleteTree(tmp);
        }
    }

    private int unpack(InputStream in, Path dest) throws IOException {
        int assets = 0;
        int entries = 0;
        long total = 0;
        boolean story = false;
        try (ZipInputStream zin = new ZipInputStream(in)) {
            ZipEntry e;
            while ((e = zin.getNextEntry()) != null) {
                if (++entries > MAX_ENTRIES) {
                    throw ApiException.badRequest("ZIP_TOO_MANY_FILES", "The zip has too many files");
                }
                String name = safeName(e.getName());
                if (e.isDirectory()) {
                    continue;
                }
                if (name.startsWith("story-private/")) {
                    name = name.substring("story-private/".length());
                }
                Path out;
                if (name.equals("story.json")) {
                    if (story) {
                        throw ApiException.badRequest("ZIP_DUPLICATE", "The zip has more than one story.json");
                    }
                    story = true;
                    out = dest.resolve("story.json");
                } else if (name.startsWith("assets/") && ASSET.matcher(name.substring(7)).matches()) {
                    Path assetsDir = Files.createDirectories(dest.resolve("assets"));
                    out = assetsDir.resolve(name.substring(7));
                    if (!out.normalize().startsWith(assetsDir) || Files.exists(out)) {
                        throw ApiException.badRequest("ZIP_BAD_ENTRY", "Unexpected file in the zip: " + name);
                    }
                    assets++;
                } else {
                    continue; // README, __MACOSX/, .DS_Store …: ignored
                }
                total += copyCapped(zin, out, MAX_ENTRY_BYTES, MAX_TOTAL_BYTES - total);
            }
        } catch (ZipException ex) {
            throw ApiException.badRequest("ZIP_INVALID", "That file is not a valid zip");
        }
        if (entries == 0) {
            throw ApiException.badRequest("ZIP_INVALID", "That file is not a valid zip");
        }
        return assets;
    }

    /** Normalised entry name; any absolute path or ".." segment rejects the whole upload (zip-slip). */
    static String safeName(String raw) {
        String name = raw.replace('\\', '/');
        if (name.startsWith("/") || name.matches("^[A-Za-z]:.*") || name.contains("\0")) {
            throw ApiException.badRequest("ZIP_UNSAFE_PATH", "Unsafe path in the zip: " + raw);
        }
        for (String part : name.split("/")) {
            if (part.equals("..")) {
                throw ApiException.badRequest("ZIP_UNSAFE_PATH", "Unsafe path in the zip: " + raw);
            }
        }
        return name.replaceAll("^(\\./)+", "");
    }

    private static long copyCapped(InputStream in, Path out, long maxEntry, long remaining) throws IOException {
        long limit = Math.min(maxEntry, remaining);
        long written = 0;
        byte[] buf = new byte[64 * 1024];
        try (OutputStream os = Files.newOutputStream(out)) {
            int n;
            while ((n = in.read(buf)) > 0) {
                written += n;
                if (written > limit) {
                    throw ApiException.badRequest("ZIP_TOO_LARGE", "A file in the zip is too large");
                }
                os.write(buf, 0, n);
            }
        }
        return written;
    }

    private void validateStory(Path storyJson) {
        JsonNode root;
        try {
            root = json.readTree(storyJson.toFile());
        } catch (IOException ex) {
            throw ApiException.badRequest("STORY_JSON_INVALID", "story.json is not valid JSON");
        }
        if (root == null || !root.isObject() || !root.path("texts").isObject()) {
            throw ApiException.badRequest("STORY_JSON_INVALID", "story.json has no \"texts\"");
        }
    }

    /** target ← tmp, keeping the old content until the new one is in place. */
    private static void swapIn(Path tmp, Path target) throws IOException {
        Path ready = target.resolveSibling(".story-ready-" + UUID.randomUUID());
        Path old = target.resolveSibling(".story-old-" + UUID.randomUUID());
        move(tmp, ready);
        boolean hadOld = Files.exists(target);
        if (hadOld) {
            move(target, old);
        }
        try {
            move(ready, target);
        } catch (IOException ex) {
            if (hadOld) {
                move(old, target); // put the previous content back
            }
            deleteTree(ready);
            throw ex;
        }
        if (hadOld) {
            deleteTree(old);
        }
    }

    private static void move(Path from, Path to) throws IOException {
        try {
            Files.move(from, to, StandardCopyOption.ATOMIC_MOVE);
        } catch (AtomicMoveNotSupportedException ex) {
            Files.move(from, to);
        }
    }

    static void deleteTree(Path dir) {
        if (!Files.exists(dir)) {
            return;
        }
        try (Stream<Path> walk = Files.walk(dir)) {
            walk.sorted(Comparator.reverseOrder()).forEach(p -> {
                try {
                    Files.deleteIfExists(p);
                } catch (IOException ignored) {
                    // best effort cleanup
                }
            });
        } catch (IOException ignored) {
            // best effort cleanup
        }
    }
}
