package com.ourlittlestory.image;

import java.io.IOException;
import java.io.InputStream;

/**
 * Where image bytes are kept. Local disk is used by default; an S3
 * implementation is selected with app.storage.type=s3.
 */
public interface ImageStorage {

    void store(String key, byte[] bytes, String contentType) throws IOException;

    InputStream open(String key) throws IOException;

    void delete(String key) throws IOException;
}
