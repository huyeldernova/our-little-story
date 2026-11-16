package com.ourlittlestory.admin;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.ourlittlestory.IntegrationTestBase;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;

/** POST /api/admin/story: author only, safe unzip, content swapped in. */
class AdminStoryIntegrationTest extends IntegrationTestBase {

    private static final Path STORY_DIR;

    static {
        try {
            STORY_DIR = Files.createTempDirectory("ols-admin-story").resolve("story");
        } catch (IOException e) {
            throw new IllegalStateException(e);
        }
    }

    @DynamicPropertySource
    static void storyDir(DynamicPropertyRegistry r) {
        r.add("app.story.directory", STORY_DIR::toString);
        r.add("app.story.fallback-directory", () -> "src/test/resources/story-fixture");
    }

    private static byte[] zip(Map<String, String> entries) throws IOException {
        ByteArrayOutputStream bytes = new ByteArrayOutputStream();
        try (ZipOutputStream z = new ZipOutputStream(bytes)) {
            for (var e : entries.entrySet()) {
                z.putNextEntry(new ZipEntry(e.getKey()));
                z.write(e.getValue().getBytes(StandardCharsets.UTF_8));
                z.closeEntry();
            }
        }
        return bytes.toByteArray();
    }

    private static MockMultipartFile file(byte[] zip) {
        return new MockMultipartFile("file", "story.zip", "application/zip", zip);
    }

    private static final String STORY = "{\"version\":1,\"chapterTitles\":[],\"texts\":{\"c01.001\":\"Uploaded text\"},\"lightbox\":[]}";

    @Test
    void onlyTheAuthorMayUpload() throws Exception {
        byte[] z = zip(Map.of("story.json", STORY));
        mvc.perform(multipart("/api/admin/story").file(file(z)).with(as(bob)).with(csrf()))
                .andExpect(status().isForbidden());
        mvc.perform(multipart("/api/admin/story").file(file(z)).with(as(alice)))
                .andExpect(status().isForbidden()); // no CSRF token
        mvc.perform(get("/api/admin/status").with(as(bob))).andExpect(jsonPath("$.admin").value(false));
        mvc.perform(get("/api/admin/status").with(as(alice))).andExpect(jsonPath("$.admin").value(true));
    }

    @Test
    void zipSlipIsRefused() throws Exception {
        Map<String, String> entries = new LinkedHashMap<>();
        entries.put("story.json", STORY);
        entries.put("assets/../../evil.jpg", "x");
        mvc.perform(multipart("/api/admin/story").file(file(zip(entries))).with(as(alice)).with(csrf()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("ZIP_UNSAFE_PATH"));
        mvc.perform(multipart("/api/admin/story").file(file(zip(Map.of("../evil", "x")))).with(as(alice)).with(csrf()))
                .andExpect(status().isBadRequest());
        assertThat(STORY_DIR.getParent().resolve("evil.jpg")).doesNotExist();
        assertThat(STORY_DIR.getParent().getParent().resolve("evil")).doesNotExist();
    }

    @Test
    void invalidStoryJsonIsRefusedAndTheOldContentStays() throws Exception {
        mvc.perform(multipart("/api/admin/story").file(file(zip(Map.of("story.json", "{\"version\":1}"))))
                        .with(as(alice)).with(csrf()))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("STORY_JSON_INVALID"));
        mvc.perform(multipart("/api/admin/story").file(file(zip(Map.of("readme.txt", "hi"))))
                        .with(as(alice)).with(csrf()))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("STORY_JSON_MISSING"));
    }

    @Test
    void aValidZipReplacesTheStory() throws Exception {
        // Before any upload the placeholder (fallback) story is served.
        mvc.perform(get("/api/story").with(as(bob))).andExpect(status().isOk());

        Map<String, String> entries = new LinkedHashMap<>();
        entries.put("story-private/story.json", STORY);
        entries.put("story-private/assets/photo-1.jpg", "jpeg-bytes");
        entries.put("story-private/assets/notes.txt", "ignored");
        entries.put("__MACOSX/story-private/._story.json", "ignored");
        mvc.perform(multipart("/api/admin/story").file(file(zip(entries))).with(as(alice)).with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.files").value(2))
                .andExpect(jsonPath("$.assets").value(1));

        mvc.perform(get("/api/story").with(as(bob)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.texts['c01.001']").value("Uploaded text"));
        mvc.perform(get("/api/story/assets/photo-1.jpg").with(as(bob)))
                .andExpect(status().isOk()).andExpect(content().bytes("jpeg-bytes".getBytes(StandardCharsets.UTF_8)));
        assertThat(STORY_DIR.resolve("assets/notes.txt")).doesNotExist();

        // A second upload (zip without the top folder) replaces everything, old assets included.
        mvc.perform(multipart("/api/admin/story").file(file(zip(Map.of("story.json",
                        STORY.replace("Uploaded text", "Second upload"))))).with(as(alice)).with(csrf()))
                .andExpect(status().isOk()).andExpect(jsonPath("$.files").value(1));
        mvc.perform(get("/api/story").with(as(bob))).andExpect(jsonPath("$.texts['c01.001']").value("Second upload"));
        assertThat(STORY_DIR.resolve("assets/photo-1.jpg")).doesNotExist();
        try (var leftovers = Files.list(STORY_DIR.getParent())) {
            assertThat(leftovers.map(p -> p.getFileName().toString())).containsExactly("story");
        }
    }
}
