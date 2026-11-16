package com.ourlittlestory.chat;

public enum MessageType {
    TEXT,
    IMAGE,
    NOTE,
    /** A date-plan card created by the server from a proposal; clients cannot send it. */
    PLAN
}
