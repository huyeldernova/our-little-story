package com.ourlittlestory.image;

import com.ourlittlestory.chat.ConversationMemberRepository;
import com.ourlittlestory.common.ApiException;
import com.ourlittlestory.user.User;
import com.ourlittlestory.user.UserRepository;
import java.io.IOException;
import java.io.InputStream;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.HexFormat;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
public class ImageService {

    private static final Logger log = LoggerFactory.getLogger(ImageService.class);

    public record ImageDto(String id, String url, String contentType, long sizeBytes, Integer width, Integer height) {
        static ImageDto from(StoredImage i) {
            return new ImageDto(i.getId(), "/api/images/" + i.getId(), i.getContentType(), i.getSizeBytes(),
                    i.getWidth(), i.getHeight());
        }
    }

    public record ImageContent(StoredImage meta, InputStream stream) {
    }

    private final ImageStorage storage;
    private final ImageValidator validator;
    private final StoredImageRepository images;
    private final UserRepository users;
    private final ConversationMemberRepository members;

    public ImageService(ImageStorage storage, ImageValidator validator, StoredImageRepository images,
                        UserRepository users, ConversationMemberRepository members) {
        this.storage = storage;
        this.validator = validator;
        this.images = images;
        this.users = users;
        this.members = members;
    }

    @Transactional
    public ImageDto upload(Long uploaderId, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw ApiException.badRequest("EMPTY_FILE", "Please choose an image");
        }
        if (file.getSize() > ImageValidator.MAX_BYTES) {
            throw new ApiException(HttpStatus.PAYLOAD_TOO_LARGE, "FILE_TOO_LARGE", "Images must be 10 MB or smaller");
        }
        byte[] bytes;
        try {
            bytes = file.getBytes();
        } catch (IOException e) {
            throw ApiException.badRequest("BAD_UPLOAD", "Could not read the upload");
        }
        ImageValidator.Result result = validator.validate(bytes);
        User uploader = users.getReferenceById(uploaderId);

        String id = UUID.randomUUID().toString();
        LocalDate today = LocalDate.now(ZoneOffset.UTC);
        String key = "images/%d/%02d/%s.%s".formatted(today.getYear(), today.getMonthValue(), id,
                result.kind().extension);
        try {
            storage.store(key, bytes, result.kind().mime);
        } catch (IOException e) {
            log.error("Failed to store image", e);
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "STORAGE_ERROR", "Could not save the image");
        }
        StoredImage image = new StoredImage(id, uploader, key, result.kind().mime, bytes.length,
                result.width(), result.height(), sha256(bytes), sanitizeName(file.getOriginalFilename()));
        try {
            images.saveAndFlush(image);
        } catch (RuntimeException e) {
            try {
                storage.delete(key);
            } catch (IOException ignored) {
                // best effort clean-up
            }
            throw e;
        }
        return ImageDto.from(image);
    }

    /** Readable by the uploader and by anyone who shares a conversation with the uploader. */
    @Transactional(readOnly = true)
    public ImageContent open(String id, Long requesterId) {
        if (!isUuid(id)) {
            throw ApiException.notFound("Image");
        }
        StoredImage image = images.findWithUploader(id).orElseThrow(() -> ApiException.notFound("Image"));
        Long uploaderId = image.getUploader().getId();
        if (!uploaderId.equals(requesterId) && !members.shareConversation(uploaderId, requesterId)) {
            throw ApiException.notFound("Image");
        }
        try {
            return new ImageContent(image, storage.open(image.getStorageKey()));
        } catch (IOException e) {
            log.error("Stored image bytes missing for {}", id);
            throw ApiException.notFound("Image");
        }
    }

    @Transactional(readOnly = true)
    public StoredImage requireOwnedImage(String id, Long ownerId) {
        if (!isUuid(id)) {
            throw ApiException.badRequest("INVALID_IMAGE", "Unknown image");
        }
        StoredImage image = images.findWithUploader(id)
                .orElseThrow(() -> ApiException.badRequest("INVALID_IMAGE", "Unknown image"));
        if (!image.getUploader().getId().equals(ownerId)) {
            throw ApiException.forbidden("You can only send images you uploaded");
        }
        return image;
    }

    static boolean isUuid(String s) {
        return s != null && s.matches("^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$");
    }

    private static String sanitizeName(String name) {
        if (name == null) {
            return null;
        }
        String base = name.replace('\\', '/');
        base = base.substring(base.lastIndexOf('/') + 1).replaceAll("[\\p{Cntrl}]", "");
        return base.length() > 255 ? base.substring(0, 255) : base;
    }

    private static String sha256(byte[] bytes) {
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(bytes));
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(e);
        }
    }
}
