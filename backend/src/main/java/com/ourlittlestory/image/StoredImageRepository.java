package com.ourlittlestory.image;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface StoredImageRepository extends JpaRepository<StoredImage, String> {

    @Query("select i from StoredImage i join fetch i.uploader where i.id = :id")
    Optional<StoredImage> findWithUploader(String id);
}
