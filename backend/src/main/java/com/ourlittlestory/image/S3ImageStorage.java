package com.ourlittlestory.image;

import com.ourlittlestory.config.AppProperties;
import jakarta.annotation.PreDestroy;
import java.io.InputStream;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.ServerSideEncryption;

/**
 * Stores images in a private S3 bucket. Enabled with app.storage.type=s3.
 * Credentials come from the default AWS provider chain (on EC2: the instance
 * role). No access keys are ever read from this repository.
 * Images are still served through GET /api/images/{id} so access checks apply.
 */
@Component
@ConditionalOnProperty(prefix = "app.storage", name = "type", havingValue = "s3")
public class S3ImageStorage implements ImageStorage {

    private final S3Client s3;
    private final String bucket;
    private final String prefix;

    public S3ImageStorage(AppProperties props) {
        AppProperties.S3 cfg = props.storage().s3();
        if (cfg.bucket() == null || cfg.bucket().isBlank()) {
            throw new IllegalStateException("app.storage.s3.bucket must be set when app.storage.type=s3");
        }
        this.bucket = cfg.bucket();
        this.prefix = cfg.prefix() == null ? "" : cfg.prefix().replaceAll("^/+", "");
        var builder = S3Client.builder();
        if (cfg.region() != null && !cfg.region().isBlank()) {
            builder.region(Region.of(cfg.region()));
        }
        this.s3 = builder.build();
    }

    @Override
    public void store(String key, byte[] bytes, String contentType) {
        s3.putObject(PutObjectRequest.builder()
                        .bucket(bucket)
                        .key(prefix + key)
                        .contentType(contentType)
                        .serverSideEncryption(ServerSideEncryption.AES256)
                        .build(),
                RequestBody.fromBytes(bytes));
    }

    @Override
    public InputStream open(String key) {
        return s3.getObject(GetObjectRequest.builder().bucket(bucket).key(prefix + key).build());
    }

    @Override
    public void delete(String key) {
        s3.deleteObject(DeleteObjectRequest.builder().bucket(bucket).key(prefix + key).build());
    }

    @PreDestroy
    void close() {
        s3.close();
    }
}
