-- ============================================================================
-- ProfBaza — Full portal schema (migration 002)
-- Moves the whole `PortalDatabase` (previously a localStorage JSON blob under
-- key `profbaza.portal-db.v2-belarus`) into a normalized relational schema.
--
-- Design notes
--  * Portal-facing entity ids are strings (e.g. `org-...`, `news-...`,
--    `u-site-admin`) to match the existing frontend/seed ids 1:1 — this avoids
--    a fragile id-remapping layer on the frontend.
--  * Users keep their existing INT primary key + api_token (auth is untouched).
--    A new `public_id` column holds the portal-facing id: for real registered
--    users it equals the stringified INT id (so nothing changes for them); for
--    demo/seed users it equals the seed id (`u-site-admin`, ...). All portal
--    tables reference `users.public_id`.
--  * Charset/collation is utf8mb4 / utf8mb4_general_ci everywhere to match the
--    existing `users` table, so foreign keys to `users.public_id` are valid.
--  * JSON columns are used only where the data is genuinely a small fixed map
--    (feature flags) or an inherently nested per-user document (journal) — not
--    as a dumping ground. Lists that are queried (tags, sources, access rules,
--    notification targets) are normalized into their own tables.
--
-- Idempotent: safe to re-run. Run with:
--   /Applications/XAMPP/xamppfiles/bin/mysql -u root profbaza_api < 002_full_portal_schema.sql
-- ============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ─── users: extend for portal (keep auth columns intact) ────────────────────
ALTER TABLE `users`
  ADD COLUMN IF NOT EXISTS `public_id`         VARCHAR(64)  NULL AFTER `id`,
  ADD COLUMN IF NOT EXISTS `site_role`         VARCHAR(32)  NULL AFTER `role_id`,
  ADD COLUMN IF NOT EXISTS `subject`           VARCHAR(150) NULL AFTER `specialization`,
  ADD COLUMN IF NOT EXISTS `is_banned`         TINYINT(1)   NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS `updated_at`        TIMESTAMP    NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp();

-- Backfill public_id for existing real users (= stringified INT id) and a
-- default site_role derived from the legacy Russian role taxonomy.
UPDATE `users` SET `public_id` = CAST(`id` AS CHAR) WHERE `public_id` IS NULL OR `public_id` = '';
UPDATE `users` u
  LEFT JOIN `roles` r ON r.id = u.role_id
  SET u.site_role = CASE r.name
    WHEN 'Суперадминистратор'        THEN 'site_admin'
    WHEN 'Администратор организации'  THEN 'organization_admin'
    WHEN 'Редактор'                  THEN 'editor'
    WHEN 'Модератор контента'         THEN 'editor'
    ELSE 'user'
  END
  WHERE u.site_role IS NULL OR u.site_role = '';

-- public_id must be UNIQUE so portal tables can FK to it.
ALTER TABLE `users` ADD UNIQUE KEY IF NOT EXISTS `uq_users_public_id` (`public_id`);

-- ─── drop portal tables (FK-safe; checks already disabled) ──────────────────
DROP TABLE IF EXISTS `notification_dismissals`;
DROP TABLE IF EXISTS `notification_roles`;
DROP TABLE IF EXISTS `notification_users`;
DROP TABLE IF EXISTS `notifications`;
DROP TABLE IF EXISTS `support_attachments`;
DROP TABLE IF EXISTS `support_tickets`;
DROP TABLE IF EXISTS `news_submissions`;
DROP TABLE IF EXISTS `news_gallery`;
DROP TABLE IF EXISTS `news_sources`;
DROP TABLE IF EXISTS `news_tags`;
DROP TABLE IF EXISTS `news_specialty_tags`;
DROP TABLE IF EXISTS `news`;
DROP TABLE IF EXISTS `document_access_users`;
DROP TABLE IF EXISTS `document_access_subjects`;
DROP TABLE IF EXISTS `document_access_tags`;
DROP TABLE IF EXISTS `document_access_roles`;
DROP TABLE IF EXISTS `documents`;
DROP TABLE IF EXISTS `sections`;
DROP TABLE IF EXISTS `join_requests`;
DROP TABLE IF EXISTS `invite_codes`;
DROP TABLE IF EXISTS `org_creation_requests`;
DROP TABLE IF EXISTS `membership_specialty_tags`;
DROP TABLE IF EXISTS `memberships`;
DROP TABLE IF EXISTS `org_specialty_tags`;
DROP TABLE IF EXISTS `organizations`;
DROP TABLE IF EXISTS `user_favorites`;
DROP TABLE IF EXISTS `user_specialty_tags`;
DROP TABLE IF EXISTS `specialty_tags`;
DROP TABLE IF EXISTS `incidents`;
DROP TABLE IF EXISTS `knowledge_articles`;
DROP TABLE IF EXISTS `cabinet_entries`;
DROP TABLE IF EXISTS `site_settings`;

-- ─── specialty tags (cross-org or org-scoped) ───────────────────────────────
CREATE TABLE `specialty_tags` (
  `id`              VARCHAR(64)  NOT NULL,
  `organization_id` VARCHAR(64)  NULL,
  `name`            VARCHAR(150) NOT NULL,
  `description`     TEXT         NOT NULL,
  `color`          VARCHAR(32)  NOT NULL DEFAULT '',
  -- small fixed feature map {diary,calendar,notes,documents,journal} -> JSON ok
  `features`        LONGTEXT     NOT NULL DEFAULT '{}',
  `created_at`      TIMESTAMP    NOT NULL DEFAULT current_timestamp(),
  `updated_at`      TIMESTAMP    NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_spec_org` (`organization_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ─── users <-> specialty tags ───────────────────────────────────────────────
CREATE TABLE `user_specialty_tags` (
  `user_id` VARCHAR(64) NOT NULL,
  `tag_id`  VARCHAR(64) NOT NULL,
  PRIMARY KEY (`user_id`, `tag_id`),
  KEY `idx_ust_tag` (`tag_id`),
  CONSTRAINT `fk_ust_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`public_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ─── user favorites (saved knowledge-base / news items) ─────────────────────
CREATE TABLE `user_favorites` (
  `user_id`    VARCHAR(64)  NOT NULL,
  `item_id`    VARCHAR(128) NOT NULL,
  `created_at` TIMESTAMP    NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`user_id`, `item_id`),
  CONSTRAINT `fk_fav_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`public_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ─── organizations ──────────────────────────────────────────────────────────
CREATE TABLE `organizations` (
  `id`          VARCHAR(64)  NOT NULL,
  `short_name`  VARCHAR(255) NOT NULL,
  `full_name`   VARCHAR(500) NOT NULL,
  `description` TEXT         NOT NULL,
  `is_active`   TINYINT(1)   NOT NULL DEFAULT 1,
  `created_at`  TIMESTAMP    NOT NULL DEFAULT current_timestamp(),
  `updated_at`  TIMESTAMP    NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `org_specialty_tags` (
  `organization_id` VARCHAR(64) NOT NULL,
  `tag_id`          VARCHAR(64) NOT NULL,
  PRIMARY KEY (`organization_id`, `tag_id`),
  CONSTRAINT `fk_ost_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ─── memberships (user <-> organization, with org-local role) ───────────────
CREATE TABLE `memberships` (
  `id`              VARCHAR(64) NOT NULL,
  `organization_id` VARCHAR(64) NOT NULL,
  `user_id`         VARCHAR(64) NOT NULL,
  `role`            VARCHAR(32) NOT NULL DEFAULT 'member',
  `status`          VARCHAR(16) NOT NULL DEFAULT 'approved',
  `joined_at`       TIMESTAMP   NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_mem_org` (`organization_id`),
  KEY `idx_mem_user` (`user_id`),
  CONSTRAINT `fk_mem_org`  FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_mem_user` FOREIGN KEY (`user_id`)         REFERENCES `users` (`public_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `membership_specialty_tags` (
  `membership_id` VARCHAR(64) NOT NULL,
  `tag_id`        VARCHAR(64) NOT NULL,
  PRIMARY KEY (`membership_id`, `tag_id`),
  CONSTRAINT `fk_mst_mem` FOREIGN KEY (`membership_id`) REFERENCES `memberships` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ─── invite codes ───────────────────────────────────────────────────────────
CREATE TABLE `invite_codes` (
  `id`              VARCHAR(64) NOT NULL,
  `organization_id` VARCHAR(64) NOT NULL,
  `code`            VARCHAR(64) NOT NULL,
  `created_at`      TIMESTAMP   NOT NULL DEFAULT current_timestamp(),
  `expires_at`      TIMESTAMP   NULL,
  `is_active`       TINYINT(1)  NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  KEY `idx_invite_org` (`organization_id`),
  KEY `idx_invite_code` (`code`),
  CONSTRAINT `fk_invite_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ─── join requests ──────────────────────────────────────────────────────────
CREATE TABLE `join_requests` (
  `id`                  VARCHAR(64) NOT NULL,
  `organization_id`     VARCHAR(64) NOT NULL,
  `user_id`             VARCHAR(64) NOT NULL,
  `invite_code`         VARCHAR(64) NOT NULL DEFAULT '',
  `status`              VARCHAR(16) NOT NULL DEFAULT 'pending',
  `created_at`          TIMESTAMP   NOT NULL DEFAULT current_timestamp(),
  `reviewed_at`         TIMESTAMP   NULL,
  `reviewed_by_user_id` VARCHAR(64) NULL,
  `comment`             TEXT        NULL,
  PRIMARY KEY (`id`),
  KEY `idx_jr_org` (`organization_id`),
  KEY `idx_jr_user` (`user_id`),
  KEY `idx_jr_status` (`status`),
  CONSTRAINT `fk_jr_org`  FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_jr_user` FOREIGN KEY (`user_id`)         REFERENCES `users` (`public_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ─── organization creation requests ─────────────────────────────────────────
CREATE TABLE `org_creation_requests` (
  `id`                      VARCHAR(64)  NOT NULL,
  `user_id`                 VARCHAR(64)  NOT NULL,
  `short_name`              VARCHAR(255) NOT NULL,
  `full_name`               VARCHAR(500) NOT NULL,
  `description`             TEXT         NOT NULL,
  `status`                  VARCHAR(16)  NOT NULL DEFAULT 'pending',
  `created_at`              TIMESTAMP    NOT NULL DEFAULT current_timestamp(),
  `reviewed_at`             TIMESTAMP    NULL,
  `reviewed_by_user_id`     VARCHAR(64)  NULL,
  `comment`                 TEXT         NULL,
  `created_organization_id` VARCHAR(64)  NULL,
  PRIMARY KEY (`id`),
  KEY `idx_ocr_user` (`user_id`),
  KEY `idx_ocr_status` (`status`),
  CONSTRAINT `fk_ocr_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`public_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ─── document sections ──────────────────────────────────────────────────────
CREATE TABLE `sections` (
  `id`              VARCHAR(64)  NOT NULL,
  `organization_id` VARCHAR(64)  NOT NULL,
  `name`            VARCHAR(255) NOT NULL,
  `description`     TEXT         NOT NULL,
  `kind`            VARCHAR(16)  NOT NULL DEFAULT 'common',
  `created_at`      TIMESTAMP    NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_sec_org` (`organization_id`),
  CONSTRAINT `fk_sec_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ─── documents (+ normalized access rules) ──────────────────────────────────
CREATE TABLE `documents` (
  `id`              VARCHAR(64)  NOT NULL,
  `organization_id` VARCHAR(64)  NOT NULL,
  `section_id`      VARCHAR(64)  NOT NULL,
  `title`           VARCHAR(500) NOT NULL,
  `type`            VARCHAR(16)  NOT NULL DEFAULT 'PDF',
  `subject`         VARCHAR(150) NULL,
  `description`     TEXT         NOT NULL,
  `size`            VARCHAR(32)  NOT NULL DEFAULT '',
  `file_url`        TEXT         NULL,
  `file_name`       VARCHAR(255) NULL,
  `access_mode`     VARCHAR(20)  NOT NULL DEFAULT 'all',
  `updated_at`      TIMESTAMP    NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at`      TIMESTAMP    NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_doc_org` (`organization_id`),
  KEY `idx_doc_section` (`section_id`),
  CONSTRAINT `fk_doc_org`     FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_doc_section` FOREIGN KEY (`section_id`)      REFERENCES `sections` (`id`)      ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `document_access_roles` (
  `document_id` VARCHAR(64) NOT NULL,
  `role`        VARCHAR(32) NOT NULL,
  PRIMARY KEY (`document_id`, `role`),
  CONSTRAINT `fk_dar_doc` FOREIGN KEY (`document_id`) REFERENCES `documents` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `document_access_tags` (
  `document_id` VARCHAR(64) NOT NULL,
  `tag_id`      VARCHAR(64) NOT NULL,
  PRIMARY KEY (`document_id`, `tag_id`),
  CONSTRAINT `fk_dat_doc` FOREIGN KEY (`document_id`) REFERENCES `documents` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `document_access_subjects` (
  `document_id` VARCHAR(64)  NOT NULL,
  `subject`     VARCHAR(150) NOT NULL,
  PRIMARY KEY (`document_id`, `subject`),
  CONSTRAINT `fk_das_doc` FOREIGN KEY (`document_id`) REFERENCES `documents` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `document_access_users` (
  `document_id` VARCHAR(64) NOT NULL,
  `user_id`     VARCHAR(64) NOT NULL,
  PRIMARY KEY (`document_id`, `user_id`),
  CONSTRAINT `fk_dau_doc` FOREIGN KEY (`document_id`) REFERENCES `documents` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ─── news (+ normalized tags/sources/gallery; author/editor relations) ──────
CREATE TABLE `news` (
  `id`               VARCHAR(64)  NOT NULL,
  `title`            VARCHAR(500) NOT NULL,
  `summary`          TEXT         NOT NULL,
  `body`             LONGTEXT     NOT NULL DEFAULT '[]', -- ordered paragraphs (JSON array)
  `category`         VARCHAR(150) NOT NULL DEFAULT '',
  `specialization`   VARCHAR(150) NULL,
  `audience`         VARCHAR(32)  NOT NULL DEFAULT 'Все',
  `author`           VARCHAR(255) NOT NULL DEFAULT '',
  `author_user_id`   VARCHAR(64)  NULL,  -- relation to author (nullable)
  `editor_user_id`   VARCHAR(64)  NULL,  -- relation to last editor (nullable)
  `published_at`     VARCHAR(32)  NOT NULL DEFAULT '',
  `is_public`        TINYINT(1)   NOT NULL DEFAULT 1,
  `organization_id`  VARCHAR(64)  NULL,
  `cover_image_url`  TEXT         NULL,
  `video_url`        TEXT         NULL,
  `guest_preview`    TEXT         NULL,
  `registered_only`  TEXT         NULL,
  `created_at`       TIMESTAMP    NOT NULL DEFAULT current_timestamp(),
  `updated_at`       TIMESTAMP    NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_news_org` (`organization_id`),
  KEY `idx_news_author` (`author_user_id`),
  KEY `idx_news_public` (`is_public`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `news_tags` (
  `news_id` VARCHAR(64)  NOT NULL,
  `tag`     VARCHAR(150) NOT NULL,
  PRIMARY KEY (`news_id`, `tag`),
  CONSTRAINT `fk_nt_news` FOREIGN KEY (`news_id`) REFERENCES `news` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `news_sources` (
  `id`      INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `news_id` VARCHAR(64)  NOT NULL,
  `label`   VARCHAR(255) NOT NULL,
  `url`     TEXT         NOT NULL,
  `sort`    INT          NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `idx_ns_news` (`news_id`),
  CONSTRAINT `fk_ns_news` FOREIGN KEY (`news_id`) REFERENCES `news` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `news_gallery` (
  `id`      INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `news_id` VARCHAR(64)  NOT NULL,
  `url`     TEXT         NOT NULL,
  `sort`    INT          NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `idx_ng_news` (`news_id`),
  CONSTRAINT `fk_ng_news` FOREIGN KEY (`news_id`) REFERENCES `news` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `news_specialty_tags` (
  `news_id` VARCHAR(64) NOT NULL,
  `tag_id`  VARCHAR(64) NOT NULL,
  PRIMARY KEY (`news_id`, `tag_id`),
  CONSTRAINT `fk_nst_news` FOREIGN KEY (`news_id`) REFERENCES `news` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ─── news submissions (user-proposed drafts -> editor moderation) ───────────
-- The draft article payload is an inherently-transient nested document, stored
-- as JSON; status/title columns are promoted for listing & moderation queries.
CREATE TABLE `news_submissions` (
  `id`                  VARCHAR(64)  NOT NULL,
  `title`               VARCHAR(500) NOT NULL DEFAULT '',
  `article`             LONGTEXT     NOT NULL,            -- Omit<NewsArticle,'id'> as JSON
  `submitted_by_user_id` VARCHAR(64) NOT NULL,
  `submitted_at`        TIMESTAMP    NOT NULL DEFAULT current_timestamp(),
  `status`              VARCHAR(16)  NOT NULL DEFAULT 'pending',
  `reviewed_at`         TIMESTAMP    NULL,
  `reviewed_by_user_id` VARCHAR(64)  NULL,
  `reviewer_comment`    TEXT         NULL,
  PRIMARY KEY (`id`),
  KEY `idx_sub_user` (`submitted_by_user_id`),
  KEY `idx_sub_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ─── notifications (+ normalized targets & read/dismiss state) ──────────────
CREATE TABLE `notifications` (
  `id`              VARCHAR(64)  NOT NULL,
  `title`           VARCHAR(500) NOT NULL,
  `message`         TEXT         NOT NULL,
  `sender_label`    VARCHAR(255) NOT NULL DEFAULT '',
  `organization_id` VARCHAR(64)  NULL,
  `scope`           VARCHAR(32)  NOT NULL DEFAULT 'all',
  `created_at`      TIMESTAMP    NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_notif_org` (`organization_id`),
  KEY `idx_notif_scope` (`scope`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `notification_users` (
  `notification_id` VARCHAR(64) NOT NULL,
  `user_id`         VARCHAR(64) NOT NULL,
  PRIMARY KEY (`notification_id`, `user_id`),
  CONSTRAINT `fk_nu_notif` FOREIGN KEY (`notification_id`) REFERENCES `notifications` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `notification_roles` (
  `notification_id` VARCHAR(64) NOT NULL,
  `role`            VARCHAR(32) NOT NULL,
  PRIMARY KEY (`notification_id`, `role`),
  CONSTRAINT `fk_nr_notif` FOREIGN KEY (`notification_id`) REFERENCES `notifications` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `notification_dismissals` (
  `notification_id` VARCHAR(64) NOT NULL,
  `user_id`         VARCHAR(64) NOT NULL,
  `dismissed_at`    TIMESTAMP   NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`notification_id`, `user_id`),
  CONSTRAINT `fk_nd_notif` FOREIGN KEY (`notification_id`) REFERENCES `notifications` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ─── support tickets (+ attachments) ────────────────────────────────────────
CREATE TABLE `support_tickets` (
  `id`                  VARCHAR(64)  NOT NULL,
  `user_id`             VARCHAR(64)  NOT NULL,
  `organization_id`     VARCHAR(64)  NULL,
  `subject`             VARCHAR(500) NOT NULL,
  `message`             TEXT         NOT NULL,
  `status`              VARCHAR(16)  NOT NULL DEFAULT 'open',
  `created_at`          TIMESTAMP    NOT NULL DEFAULT current_timestamp(),
  `reviewed_at`         TIMESTAMP    NULL,
  `reviewed_by_user_id` VARCHAR(64)  NULL,
  `admin_response`      TEXT         NULL,
  PRIMARY KEY (`id`),
  KEY `idx_st_user` (`user_id`),
  KEY `idx_st_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `support_attachments` (
  `id`        INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `ticket_id` VARCHAR(64)  NOT NULL,
  `name`      VARCHAR(255) NOT NULL,
  `type`      VARCHAR(100) NOT NULL DEFAULT '',
  `data_url`  LONGTEXT     NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_sa_ticket` (`ticket_id`),
  CONSTRAINT `fk_sa_ticket` FOREIGN KEY (`ticket_id`) REFERENCES `support_tickets` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ─── incidents (+ optional relations to reporter/org) ───────────────────────
CREATE TABLE `incidents` (
  `id`                  VARCHAR(64)  NOT NULL,
  `title`               VARCHAR(500) NOT NULL,
  `category`            VARCHAR(150) NOT NULL DEFAULT '',
  `level`               VARCHAR(16)  NOT NULL DEFAULT 'Средний',
  `audience`            VARCHAR(255) NOT NULL DEFAULT '',
  `summary`             TEXT         NOT NULL,
  `first_steps`         TEXT         NOT NULL,
  `documents`           TEXT         NOT NULL,
  `owner`               VARCHAR(32)  NOT NULL DEFAULT 'Редакция',
  `attachment_name`     VARCHAR(255) NULL,
  `attachment_url`      TEXT         NULL,
  `reported_by_user_id` VARCHAR(64)  NULL, -- relation to reporter
  `organization_id`     VARCHAR(64)  NULL, -- relation to organization
  `created_at`          TIMESTAMP    NOT NULL DEFAULT current_timestamp(),
  `updated_at`          TIMESTAMP    NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_inc_owner` (`owner`),
  KEY `idx_inc_org` (`organization_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ─── knowledge base catalog (article ordering/categories/tags) ──────────────
-- Saved articles are user_favorites; this table holds the article catalog so
-- the knowledge base is DB-driven and orderable. Body kept as text.
CREATE TABLE `knowledge_articles` (
  `id`          VARCHAR(64)  NOT NULL,
  `title`       VARCHAR(500) NOT NULL,
  `category`    VARCHAR(150) NOT NULL DEFAULT '',
  `summary`     TEXT         NULL,
  `body`        LONGTEXT     NULL,
  `tags`        LONGTEXT     NOT NULL DEFAULT '[]',
  `sort_order`  INT          NOT NULL DEFAULT 0,
  `created_at`  TIMESTAMP    NOT NULL DEFAULT current_timestamp(),
  `updated_at`  TIMESTAMP    NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_kb_cat` (`category`),
  KEY `idx_kb_sort` (`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ─── personal cabinet (per-user, per-feature document) ──────────────────────
-- One row per (user, feature). `payload` is the user's personal list/object for
-- that feature (calendar, notes, diary, journal, employment-docs/steps).
-- This is personal scratch data, never cross-queried — JSON per feature is the
-- right granularity (not a global blob).
CREATE TABLE `cabinet_entries` (
  `user_id`    VARCHAR(64) NOT NULL,
  `feature`    VARCHAR(32) NOT NULL,
  `payload`    LONGTEXT    NOT NULL,
  `updated_at` TIMESTAMP   NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`user_id`, `feature`),
  CONSTRAINT `fk_cab_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`public_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ─── site settings (single row) ─────────────────────────────────────────────
CREATE TABLE `site_settings` (
  `id`                     TINYINT      NOT NULL DEFAULT 1,
  `portal_name`            VARCHAR(255) NOT NULL DEFAULT 'ПрофБаза',
  `important_note_title`   VARCHAR(255) NOT NULL DEFAULT '',
  `first_login_help_title` VARCHAR(255) NOT NULL DEFAULT '',
  `support_email`          VARCHAR(255) NOT NULL DEFAULT '',
  `maintenance_mode`       TINYINT(1)   NOT NULL DEFAULT 0,
  `global_banner`          TEXT         NULL,
  `demo_mode`              TINYINT(1)   NOT NULL DEFAULT 1,
  `updated_at`             TIMESTAMP    NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  CONSTRAINT `chk_settings_singleton` CHECK (`id` = 1)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `site_settings` (`id`, `portal_name`) VALUES (1, 'ПрофБаза')
  ON DUPLICATE KEY UPDATE `id` = `id`;

SET FOREIGN_KEY_CHECKS = 1;
