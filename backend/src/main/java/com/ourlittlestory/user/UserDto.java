package com.ourlittlestory.user;

/** Public view of a user. Never contains the password hash. */
public record UserDto(Long id, String username, String displayName) {

    public static UserDto from(User user) {
        return new UserDto(user.getId(), user.getUsername(), user.getDisplayName());
    }
}
