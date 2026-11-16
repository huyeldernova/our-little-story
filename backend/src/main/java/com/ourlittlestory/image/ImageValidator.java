package com.ourlittlestory.image;

import com.ourlittlestory.common.ApiException;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.Iterator;
import javax.imageio.ImageIO;
import javax.imageio.ImageReader;
import javax.imageio.stream.ImageInputStream;
import org.springframework.stereotype.Component;

/**
 * Validates uploads by their bytes, not their file name or the client's
 * Content-Type: the magic number must be JPEG, PNG or WebP and the header must
 * parse to sane dimensions.
 */
@Component
public class ImageValidator {

    public static final long MAX_BYTES = 10L * 1024 * 1024;
    static final int MAX_DIMENSION = 12_000;
    static final long MAX_PIXELS = 60_000_000L;

    public enum Kind {
        JPEG("image/jpeg", "jpg"),
        PNG("image/png", "png"),
        WEBP("image/webp", "webp");

        public final String mime;
        public final String extension;

        Kind(String mime, String extension) {
            this.mime = mime;
            this.extension = extension;
        }
    }

    public record Result(Kind kind, int width, int height) {
    }

    public Result validate(byte[] bytes) {
        if (bytes == null || bytes.length == 0) {
            throw ApiException.badRequest("EMPTY_FILE", "The file is empty");
        }
        if (bytes.length > MAX_BYTES) {
            throw new ApiException(org.springframework.http.HttpStatus.PAYLOAD_TOO_LARGE, "FILE_TOO_LARGE",
                    "Images must be 10 MB or smaller");
        }
        Kind kind = detect(bytes);
        if (kind == null) {
            throw new ApiException(org.springframework.http.HttpStatus.UNSUPPORTED_MEDIA_TYPE, "UNSUPPORTED_TYPE",
                    "Only JPEG, PNG and WebP images are allowed");
        }
        int[] dims = kind == Kind.WEBP ? webpDimensions(bytes) : imageIoDimensions(bytes);
        if (dims == null || dims[0] <= 0 || dims[1] <= 0) {
            throw ApiException.badRequest("CORRUPT_IMAGE", "The image could not be read");
        }
        if (dims[0] > MAX_DIMENSION || dims[1] > MAX_DIMENSION || (long) dims[0] * dims[1] > MAX_PIXELS) {
            throw ApiException.badRequest("IMAGE_TOO_LARGE", "The image dimensions are too large");
        }
        return new Result(kind, dims[0], dims[1]);
    }

    static Kind detect(byte[] b) {
        if (b.length >= 3 && (b[0] & 0xFF) == 0xFF && (b[1] & 0xFF) == 0xD8 && (b[2] & 0xFF) == 0xFF) {
            return Kind.JPEG;
        }
        if (b.length >= 8 && (b[0] & 0xFF) == 0x89 && b[1] == 'P' && b[2] == 'N' && b[3] == 'G'
                && b[4] == 0x0D && b[5] == 0x0A && b[6] == 0x1A && b[7] == 0x0A) {
            return Kind.PNG;
        }
        if (b.length >= 16 && b[0] == 'R' && b[1] == 'I' && b[2] == 'F' && b[3] == 'F'
                && b[8] == 'W' && b[9] == 'E' && b[10] == 'B' && b[11] == 'P') {
            return Kind.WEBP;
        }
        return null;
    }

    private static int[] imageIoDimensions(byte[] bytes) {
        try (ImageInputStream in = ImageIO.createImageInputStream(new ByteArrayInputStream(bytes))) {
            if (in == null) {
                return null;
            }
            Iterator<ImageReader> readers = ImageIO.getImageReaders(in);
            if (!readers.hasNext()) {
                return null;
            }
            ImageReader reader = readers.next();
            try {
                reader.setInput(in, true, true);
                return new int[] {reader.getWidth(0), reader.getHeight(0)};
            } finally {
                reader.dispose();
            }
        } catch (IOException | RuntimeException e) {
            return null;
        }
    }

    /** Reads dimensions from the first VP8 / VP8L / VP8X chunk of a WebP file. */
    static int[] webpDimensions(byte[] b) {
        if (b.length < 30) {
            return null;
        }
        String chunk = new String(b, 12, 4, java.nio.charset.StandardCharsets.US_ASCII);
        int d = 20; // start of chunk payload
        switch (chunk) {
            case "VP8 " -> {
                // frame tag (3 bytes) + start code 9d 01 2a + 14-bit width/height
                if ((b[d + 3] & 0xFF) != 0x9D || (b[d + 4] & 0xFF) != 0x01 || (b[d + 5] & 0xFF) != 0x2A) {
                    return null;
                }
                int w = ((b[d + 6] & 0xFF) | ((b[d + 7] & 0xFF) << 8)) & 0x3FFF;
                int h = ((b[d + 8] & 0xFF) | ((b[d + 9] & 0xFF) << 8)) & 0x3FFF;
                return new int[] {w, h};
            }
            case "VP8L" -> {
                if ((b[d] & 0xFF) != 0x2F) {
                    return null;
                }
                int b1 = b[d + 1] & 0xFF, b2 = b[d + 2] & 0xFF, b3 = b[d + 3] & 0xFF, b4 = b[d + 4] & 0xFF;
                int w = 1 + (((b2 & 0x3F) << 8) | b1);
                int h = 1 + (((b4 & 0x0F) << 10) | (b3 << 2) | ((b2 & 0xC0) >> 6));
                return new int[] {w, h};
            }
            case "VP8X" -> {
                int w = 1 + ((b[d + 4] & 0xFF) | ((b[d + 5] & 0xFF) << 8) | ((b[d + 6] & 0xFF) << 16));
                int h = 1 + ((b[d + 7] & 0xFF) | ((b[d + 8] & 0xFF) << 8) | ((b[d + 9] & 0xFF) << 16));
                return new int[] {w, h};
            }
            default -> {
                return null;
            }
        }
    }
}
