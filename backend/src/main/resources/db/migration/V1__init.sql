-- Our Little Story: initial schema.
-- Written to run unchanged on MySQL 8 (utf8mb4 database, InnoDB default)
-- and on H2 in MySQL mode (used by the automated tests).
-- All timestamps are stored in UTC.

CREATE TABLE users (
    id            BIGINT       NOT NULL AUTO_INCREMENT,
    username      VARCHAR(50)  NOT NULL,
    display_name  VARCHAR(80)  NOT NULL,
    password_hash VARCHAR(100) NOT NULL,
    created_at    DATETIME(6)  NOT NULL,
    updated_at    DATETIME(6)  NOT NULL,
    CONSTRAINT pk_users PRIMARY KEY (id),
    CONSTRAINT uk_users_username UNIQUE (username)
);

CREATE TABLE conversations (
    id         BIGINT      NOT NULL AUTO_INCREMENT,
    title      VARCHAR(80) NOT NULL,
    created_at DATETIME(6) NOT NULL,
    CONSTRAINT pk_conversations PRIMARY KEY (id)
);

CREATE TABLE stored_images (
    id                VARCHAR(36)  NOT NULL,
    uploader_id       BIGINT       NOT NULL,
    storage_key       VARCHAR(200) NOT NULL,
    content_type      VARCHAR(30)  NOT NULL,
    size_bytes        BIGINT       NOT NULL,
    width             INT          NULL,
    height            INT          NULL,
    sha256            VARCHAR(64)  NOT NULL,
    original_filename VARCHAR(255) NULL,
    created_at        DATETIME(6)  NOT NULL,
    CONSTRAINT pk_stored_images PRIMARY KEY (id),
    CONSTRAINT uk_stored_images_storage_key UNIQUE (storage_key),
    CONSTRAINT fk_stored_images_uploader FOREIGN KEY (uploader_id) REFERENCES users (id)
);

CREATE TABLE messages (
    id                BIGINT      NOT NULL AUTO_INCREMENT,
    conversation_id   BIGINT      NOT NULL,
    sender_id         BIGINT      NOT NULL,
    type              VARCHAR(10) NOT NULL,
    content           TEXT        NULL,
    image_id          VARCHAR(36) NULL,
    client_message_id VARCHAR(36) NOT NULL,
    created_at        DATETIME(6) NOT NULL,
    CONSTRAINT pk_messages PRIMARY KEY (id),
    CONSTRAINT uk_messages_sender_client_id UNIQUE (sender_id, client_message_id),
    CONSTRAINT ck_messages_type CHECK (type IN ('TEXT', 'IMAGE', 'NOTE')),
    CONSTRAINT fk_messages_conversation FOREIGN KEY (conversation_id) REFERENCES conversations (id),
    CONSTRAINT fk_messages_sender FOREIGN KEY (sender_id) REFERENCES users (id),
    CONSTRAINT fk_messages_image FOREIGN KEY (image_id) REFERENCES stored_images (id)
);

CREATE INDEX ix_messages_conversation_id ON messages (conversation_id, id);

CREATE TABLE conversation_members (
    id                   BIGINT      NOT NULL AUTO_INCREMENT,
    conversation_id      BIGINT      NOT NULL,
    user_id              BIGINT      NOT NULL,
    last_read_message_id BIGINT      NULL,
    joined_at            DATETIME(6) NOT NULL,
    CONSTRAINT pk_conversation_members PRIMARY KEY (id),
    CONSTRAINT uk_conversation_members UNIQUE (conversation_id, user_id),
    CONSTRAINT fk_conversation_members_conversation FOREIGN KEY (conversation_id) REFERENCES conversations (id),
    CONSTRAINT fk_conversation_members_user FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE TABLE date_invitations (
    id                    BIGINT       NOT NULL AUTO_INCREMENT,
    inviter_id            BIGINT       NOT NULL,
    invitee_id            BIGINT       NOT NULL,
    message               VARCHAR(1000) NULL,
    status                VARCHAR(10)  NOT NULL,
    confirmed_proposal_id BIGINT       NULL,
    responded_at          DATETIME(6)  NULL,
    confirmed_at          DATETIME(6)  NULL,
    created_at            DATETIME(6)  NOT NULL,
    updated_at            DATETIME(6)  NOT NULL,
    version               BIGINT       NOT NULL DEFAULT 0,
    CONSTRAINT pk_date_invitations PRIMARY KEY (id),
    CONSTRAINT ck_date_invitations_status CHECK (status IN ('PENDING', 'ACCEPTED', 'THINKING')),
    CONSTRAINT fk_date_invitations_inviter FOREIGN KEY (inviter_id) REFERENCES users (id),
    CONSTRAINT fk_date_invitations_invitee FOREIGN KEY (invitee_id) REFERENCES users (id)
);

CREATE TABLE date_proposals (
    id             BIGINT       NOT NULL AUTO_INCREMENT,
    invitation_id  BIGINT       NOT NULL,
    proposer_id    BIGINT       NOT NULL,
    proposed_date  DATE         NOT NULL,
    time_slot      VARCHAR(10)  NOT NULL,
    specific_time  TIME         NULL,
    activity       VARCHAR(120) NOT NULL,
    location       VARCHAR(200) NULL,
    note           VARCHAR(500) NULL,
    inviter_agreed BOOLEAN      NOT NULL DEFAULT FALSE,
    invitee_agreed BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at     DATETIME(6)  NOT NULL,
    CONSTRAINT pk_date_proposals PRIMARY KEY (id),
    CONSTRAINT ck_date_proposals_time_slot CHECK (time_slot IN ('MORNING', 'AFTERNOON', 'EVENING')),
    CONSTRAINT fk_date_proposals_invitation FOREIGN KEY (invitation_id) REFERENCES date_invitations (id),
    CONSTRAINT fk_date_proposals_proposer FOREIGN KEY (proposer_id) REFERENCES users (id)
);

CREATE INDEX ix_date_proposals_invitation_id ON date_proposals (invitation_id);

ALTER TABLE date_invitations
    ADD CONSTRAINT fk_date_invitations_confirmed_proposal
    FOREIGN KEY (confirmed_proposal_id) REFERENCES date_proposals (id);
