package com.ourlittlestory.image;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.ourlittlestory.TestImages;
import com.ourlittlestory.common.ApiException;
import org.junit.jupiter.api.Test;

class ImageValidatorTest {

    private final ImageValidator validator = new ImageValidator();

    @Test
    void detectsFormatsByMagicNumber() {
        assertThat(ImageValidator.detect(TestImages.jpeg(2, 2))).isEqualTo(ImageValidator.Kind.JPEG);
        assertThat(ImageValidator.detect(TestImages.png(2, 2))).isEqualTo(ImageValidator.Kind.PNG);
        assertThat(ImageValidator.detect(TestImages.webpLossless(2, 2))).isEqualTo(ImageValidator.Kind.WEBP);
        assertThat(ImageValidator.detect("hello world, not an image".getBytes())).isNull();
    }

    @Test
    void readsWebpLosslessDimensions() {
        ImageValidator.Result r = validator.validate(TestImages.webpLossless(1234, 567));
        assertThat(r.width()).isEqualTo(1234);
        assertThat(r.height()).isEqualTo(567);
    }

    @Test
    void rejectsAbsurdDimensions() {
        assertThatThrownBy(() -> validator.validate(TestImages.webpLossless(16000, 16000)))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("dimensions");
    }

    @Test
    void rejectsEmptyInput() {
        assertThatThrownBy(() -> validator.validate(new byte[0])).isInstanceOf(ApiException.class);
    }
}
