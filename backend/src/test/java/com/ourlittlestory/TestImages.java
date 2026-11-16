package com.ourlittlestory;

import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.UncheckedIOException;
import javax.imageio.ImageIO;

/** Generates real image bytes for tests. */
public final class TestImages {

    private TestImages() {
    }

    public static byte[] png(int w, int h) {
        return encode("png", w, h);
    }

    public static byte[] jpeg(int w, int h) {
        return encode("jpg", w, h);
    }

    private static byte[] encode(String format, int w, int h) {
        BufferedImage img = new BufferedImage(w, h, BufferedImage.TYPE_INT_RGB);
        for (int x = 0; x < w; x++) {
            for (int y = 0; y < h; y++) {
                img.setRGB(x, y, (x * 31 + y * 17) & 0xFFFFFF);
            }
        }
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            ImageIO.write(img, format, out);
            return out.toByteArray();
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
    }

    /** A minimal lossless WebP (VP8L) header for a w x h image. Enough for header validation. */
    public static byte[] webpLossless(int w, int h) {
        int ww = w - 1;
        int hh = h - 1;
        byte[] payload = new byte[] {
                0x2F,
                (byte) (ww & 0xFF),
                (byte) (((ww >> 8) & 0x3F) | ((hh & 0x03) << 6)),
                (byte) ((hh >> 2) & 0xFF),
                (byte) ((hh >> 10) & 0x0F),
                0, 0, 0, 0, 0
        };
        byte[] out = new byte[20 + payload.length];
        put(out, 0, "RIFF");
        int riffSize = out.length - 8;
        out[4] = (byte) riffSize;
        out[5] = (byte) (riffSize >> 8);
        put(out, 8, "WEBP");
        put(out, 12, "VP8L");
        out[16] = (byte) payload.length;
        System.arraycopy(payload, 0, out, 20, payload.length);
        return out;
    }

    private static void put(byte[] out, int at, String s) {
        for (int i = 0; i < 4; i++) {
            out[at + i] = (byte) s.charAt(i);
        }
    }
}
