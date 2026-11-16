package com.ourlittlestory.invitation;

import java.time.LocalTime;

public enum TimeSlot {
    MORNING(LocalTime.of(5, 0), LocalTime.of(11, 59)),
    AFTERNOON(LocalTime.of(12, 0), LocalTime.of(17, 59)),
    EVENING(LocalTime.of(18, 0), LocalTime.of(23, 59));

    private final LocalTime from;
    private final LocalTime to;

    TimeSlot(LocalTime from, LocalTime to) {
        this.from = from;
        this.to = to;
    }

    public boolean contains(LocalTime time) {
        return !time.isBefore(from) && !time.isAfter(to);
    }
}
