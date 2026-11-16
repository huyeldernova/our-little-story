-- Plan cards in the chat: a message of type PLAN points at a date proposal.
-- Runs unchanged on MySQL 8.0.19+ and on H2 in MySQL mode (both accept
-- ALTER TABLE ... DROP CONSTRAINT for a CHECK constraint). V1 is left untouched.

ALTER TABLE messages DROP CONSTRAINT ck_messages_type;

ALTER TABLE messages
    ADD CONSTRAINT ck_messages_type CHECK (type IN ('TEXT', 'IMAGE', 'NOTE', 'PLAN'));

ALTER TABLE messages ADD COLUMN proposal_id BIGINT NULL;

ALTER TABLE messages
    ADD CONSTRAINT fk_messages_proposal FOREIGN KEY (proposal_id) REFERENCES date_proposals (id);

CREATE INDEX ix_messages_proposal_id ON messages (proposal_id);
