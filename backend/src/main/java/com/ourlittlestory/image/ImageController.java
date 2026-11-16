package com.ourlittlestory.image;

import com.ourlittlestory.auth.CurrentUser;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.time.Duration;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.CacheControl;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@Tag(name = "Images")
public class ImageController {

    private final ImageService images;

    public ImageController(ImageService images) {
        this.images = images;
    }

    @PostMapping(path = "/api/uploads/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload a JPEG, PNG or WebP image (max 10 MB). Field name: file")
    public ResponseEntity<ImageService.ImageDto> upload(@RequestParam("file") MultipartFile file) {
        return ResponseEntity.status(HttpStatus.CREATED).body(images.upload(CurrentUser.id(), file));
    }

    @GetMapping("/api/images/{id}")
    @Operation(summary = "Download an image (only for the uploader and people sharing a conversation)")
    public ResponseEntity<InputStreamResource> get(@PathVariable String id) {
        ImageService.ImageContent content = images.open(id, CurrentUser.id());
        StoredImage meta = content.meta();
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(meta.getContentType()))
                .contentLength(meta.getSizeBytes())
                .cacheControl(CacheControl.maxAge(Duration.ofDays(7)).cachePrivate())
                .eTag("\"" + meta.getSha256() + "\"")
                .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.inline().build().toString())
                .header("Content-Security-Policy", "default-src 'none'")
                .body(new InputStreamResource(content.stream()));
    }
}
