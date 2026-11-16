package com.ourlittlestory.common;

import java.time.Instant;
import java.util.Map;

/** JSON body for every error response. */
public record ErrorResponse(Instant timestamp, int status, String code, String message, Map<String, String> fieldErrors) {

    public static ErrorResponse of(int status, String code, String message) {
        return new ErrorResponse(Instant.now(), status, code, message, null);
    }
}
