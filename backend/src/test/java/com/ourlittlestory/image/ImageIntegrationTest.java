package com.ourlittlestory.image;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.ourlittlestory.IntegrationTestBase;
import com.ourlittlestory.TestImages;
import java.util.Arrays;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;

class ImageIntegrationTest extends IntegrationTestBase {

    private JsonNode upload(byte[] bytes, String name, String declaredType) throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", name, declaredType, bytes);
        return body(mvc.perform(multipart("/api/uploads/images").file(file).with(as(alice)).with(csrf()))
                .andExpect(status().isCreated()).andReturn());
    }

    @Test
    void uploadsJpegPngAndWebpWithUuidIdsAndMetadata() throws Exception {
        JsonNode jpg = upload(TestImages.jpeg(40, 30), "photo.jpg", "image/jpeg");
        assertThat(jpg.get("contentType").asText()).isEqualTo("image/jpeg");
        assertThat(jpg.get("width").asInt()).isEqualTo(40);
        assertThat(jpg.get("height").asInt()).isEqualTo(30);
        assertThat(jpg.get("id").asText()).matches("[0-9a-f-]{36}");

        JsonNode png = upload(TestImages.png(5, 7), "../../evil name.png", "image/png");
        assertThat(png.get("contentType").asText()).isEqualTo("image/png");

        JsonNode webp = upload(TestImages.webpLossless(300, 200), "x.webp", "image/webp");
        assertThat(webp.get("contentType").asText()).isEqualTo("image/webp");
        assertThat(webp.get("width").asInt()).isEqualTo(300);
        assertThat(webp.get("height").asInt()).isEqualTo(200);

        String key = jdbc.queryForObject("select storage_key from stored_images where id = ?", String.class,
                png.get("id").asText());
        assertThat(key).doesNotContain("evil").endsWith(png.get("id").asText() + ".png");
        String original = jdbc.queryForObject("select original_filename from stored_images where id = ?",
                String.class, png.get("id").asText());
        assertThat(original).isEqualTo("evil name.png");
    }

    @Test
    void contentIsCheckedNotTheExtensionOrDeclaredType() throws Exception {
        byte[] html = "<html><script>alert(1)</script></html>".getBytes();
        mvc.perform(multipart("/api/uploads/images")
                        .file(new MockMultipartFile("file", "cute.jpg", "image/jpeg", html))
                        .with(as(alice)).with(csrf()))
                .andExpect(status().isUnsupportedMediaType())
                .andExpect(jsonPath("$.code").value("UNSUPPORTED_TYPE"));

        byte[] gif = "GIF89a....".getBytes();
        mvc.perform(multipart("/api/uploads/images")
                        .file(new MockMultipartFile("file", "a.png", "image/png", gif))
                        .with(as(alice)).with(csrf()))
                .andExpect(status().isUnsupportedMediaType());

        byte[] truncatedPng = Arrays.copyOf(TestImages.png(10, 10), 12);
        mvc.perform(multipart("/api/uploads/images")
                        .file(new MockMultipartFile("file", "a.png", "image/png", truncatedPng))
                        .with(as(alice)).with(csrf()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("CORRUPT_IMAGE"));
    }

    @Test
    void filesOverTenMegabytesAreRejected() throws Exception {
        byte[] big = new byte[10 * 1024 * 1024 + 1];
        byte[] png = TestImages.png(2, 2);
        System.arraycopy(png, 0, big, 0, png.length);
        mvc.perform(multipart("/api/uploads/images")
                        .file(new MockMultipartFile("file", "big.png", "image/png", big))
                        .with(as(alice)).with(csrf()))
                .andExpect(status().isPayloadTooLarge());
    }

    @Test
    void imagesAreServedOnlyToAuthorisedUsers() throws Exception {
        byte[] bytes = TestImages.png(3, 3);
        String id = upload(bytes, "p.png", "image/png").get("id").asText();

        byte[] got = mvc.perform(get("/api/images/" + id).with(as(bob)))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Type", "image/png"))
                .andExpect(header().string("X-Content-Type-Options", "nosniff"))
                .andExpect(header().string("Cache-Control", org.hamcrest.Matchers.containsString("private")))
                .andReturn().getResponse().getContentAsByteArray();
        assertThat(got).isEqualTo(bytes);

        mvc.perform(get("/api/images/" + id)).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/images/" + id).with(as(outsider()))).andExpect(status().isNotFound());
        mvc.perform(get("/api/images/../../etc/passwd").with(as(bob))).andExpect(status().is4xxClientError());
        mvc.perform(get("/api/images/00000000-0000-0000-0000-000000000000").with(as(bob)))
                .andExpect(status().isNotFound());
    }

    @Test
    void uploadRequiresCsrfAndLogin() throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", "p.png", "image/png", TestImages.png(2, 2));
        mvc.perform(multipart("/api/uploads/images").file(file).with(as(alice))).andExpect(status().isForbidden());
        mvc.perform(multipart("/api/uploads/images").file(file).with(csrf())).andExpect(status().isUnauthorized());
    }
}
