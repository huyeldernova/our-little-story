package com.ourlittlestory.image;

import com.ourlittlestory.user.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.Instant;

/** Metadata for an uploaded image. The bytes live in {@link ImageStorage}. */
@Entity
@Table(name = "stored_images")
public class StoredImage {

    @Id
    @Column(length = 36)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "uploader_id", nullable = false)
    private User uploader;

    @Column(name = "storage_key", nullable = false, unique = true, length = 200)
    private String storageKey;

    @Column(name = "content_type", nullable = false, length = 30)
    private String contentType;

    @Column(name = "size_bytes", nullable = false)
    private long sizeBytes;

    private Integer width;

    private Integer height;

    @Column(nullable = false, length = 64)
    private String sha256;

    @Column(name = "original_filename")
    private String originalFilename;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    protected StoredImage() {
    }

    public StoredImage(String id, User uploader, String storageKey, String contentType, long sizeBytes,
                       Integer width, Integer height, String sha256, String originalFilename) {
        this.id = id;
        this.uploader = uploader;
        this.storageKey = storageKey;
        this.contentType = contentType;
        this.sizeBytes = sizeBytes;
        this.width = width;
        this.height = height;
        this.sha256 = sha256;
        this.originalFilename = originalFilename;
    }

    @PrePersist
    void onCreate() {
        createdAt = Instant.now();
    }

    public String getId() {
        return id;
    }

    public User getUploader() {
        return uploader;
    }

    public String getStorageKey() {
        return storageKey;
    }

    public String getContentType() {
        return contentType;
    }

    public long getSizeBytes() {
        return sizeBytes;
    }

    public Integer getWidth() {
        return width;
    }

    public Integer getHeight() {
        return height;
    }

    public String getSha256() {
        return sha256;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
