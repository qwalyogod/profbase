-- MariaDB dump 10.19  Distrib 10.4.28-MariaDB, for osx10.10 (x86_64)
--
-- Host: localhost    Database: profbaza_api
-- ------------------------------------------------------
-- Server version	10.4.28-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `cabinet_entries`
--

DROP TABLE IF EXISTS `cabinet_entries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cabinet_entries` (
  `user_id` varchar(64) NOT NULL,
  `feature` varchar(32) NOT NULL,
  `payload` longtext NOT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`user_id`,`feature`),
  CONSTRAINT `fk_cab_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`public_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cabinet_entries`
--

LOCK TABLES `cabinet_entries` WRITE;
/*!40000 ALTER TABLE `cabinet_entries` DISABLE KEYS */;
/*!40000 ALTER TABLE `cabinet_entries` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `document_access_roles`
--

DROP TABLE IF EXISTS `document_access_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `document_access_roles` (
  `document_id` varchar(64) NOT NULL,
  `role` varchar(32) NOT NULL,
  PRIMARY KEY (`document_id`,`role`),
  CONSTRAINT `fk_dar_doc` FOREIGN KEY (`document_id`) REFERENCES `documents` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `document_access_roles`
--

LOCK TABLES `document_access_roles` WRITE;
/*!40000 ALTER TABLE `document_access_roles` DISABLE KEYS */;
INSERT INTO `document_access_roles` VALUES ('doc-2','member'),('doc-2','organization_admin'),('doc-2','teacher'),('doc-5','organization_admin'),('doc-5','teacher');
/*!40000 ALTER TABLE `document_access_roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `document_access_subjects`
--

DROP TABLE IF EXISTS `document_access_subjects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `document_access_subjects` (
  `document_id` varchar(64) NOT NULL,
  `subject` varchar(150) NOT NULL,
  PRIMARY KEY (`document_id`,`subject`),
  CONSTRAINT `fk_das_doc` FOREIGN KEY (`document_id`) REFERENCES `documents` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `document_access_subjects`
--

LOCK TABLES `document_access_subjects` WRITE;
/*!40000 ALTER TABLE `document_access_subjects` DISABLE KEYS */;
INSERT INTO `document_access_subjects` VALUES ('doc-3','Математика'),('doc-4','Информатика');
/*!40000 ALTER TABLE `document_access_subjects` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `document_access_tags`
--

DROP TABLE IF EXISTS `document_access_tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `document_access_tags` (
  `document_id` varchar(64) NOT NULL,
  `tag_id` varchar(64) NOT NULL,
  PRIMARY KEY (`document_id`,`tag_id`),
  CONSTRAINT `fk_dat_doc` FOREIGN KEY (`document_id`) REFERENCES `documents` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `document_access_tags`
--

LOCK TABLES `document_access_tags` WRITE;
/*!40000 ALTER TABLE `document_access_tags` DISABLE KEYS */;
INSERT INTO `document_access_tags` VALUES ('doc-7','tag-teacher'),('doc-8','tag-general');
/*!40000 ALTER TABLE `document_access_tags` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `document_access_users`
--

DROP TABLE IF EXISTS `document_access_users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `document_access_users` (
  `document_id` varchar(64) NOT NULL,
  `user_id` varchar(64) NOT NULL,
  PRIMARY KEY (`document_id`,`user_id`),
  CONSTRAINT `fk_dau_doc` FOREIGN KEY (`document_id`) REFERENCES `documents` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `document_access_users`
--

LOCK TABLES `document_access_users` WRITE;
/*!40000 ALTER TABLE `document_access_users` DISABLE KEYS */;
INSERT INTO `document_access_users` VALUES ('doc-6','u-org-admin');
/*!40000 ALTER TABLE `document_access_users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `documents`
--

DROP TABLE IF EXISTS `documents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `documents` (
  `id` varchar(64) NOT NULL,
  `organization_id` varchar(64) NOT NULL,
  `section_id` varchar(64) NOT NULL,
  `title` varchar(500) NOT NULL,
  `type` varchar(16) NOT NULL DEFAULT 'PDF',
  `subject` varchar(150) DEFAULT NULL,
  `description` text NOT NULL,
  `size` varchar(32) NOT NULL DEFAULT '',
  `file_url` text DEFAULT NULL,
  `file_name` varchar(255) DEFAULT NULL,
  `access_mode` varchar(20) NOT NULL DEFAULT 'all',
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_doc_org` (`organization_id`),
  KEY `idx_doc_section` (`section_id`),
  CONSTRAINT `fk_doc_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_doc_section` FOREIGN KEY (`section_id`) REFERENCES `sections` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `documents`
--

LOCK TABLES `documents` WRITE;
/*!40000 ALTER TABLE `documents` DISABLE KEYS */;
INSERT INTO `documents` VALUES ('doc-1','org-1234','sec-common','Устав организации','PDF',NULL,'Основной документ организации.','240 КБ',NULL,NULL,'all','2026-03-14 21:00:00','2026-06-14 19:00:59'),('doc-2','org-1234','sec-common','Правила внутреннего распорядка','DOCX',NULL,'Правила поведения и работы в организации.','88 КБ',NULL,NULL,'roles','2026-02-19 21:00:00','2026-06-14 19:00:59'),('doc-3','org-1234','sec-math','Учебный план по математике для 7 класса','DOCX','Математика','Годовой учебный план по математике.','54 КБ',NULL,NULL,'subjects','2026-04-11 21:00:00','2026-06-14 19:00:59'),('doc-4','org-1234','sec-informatics','Задания по информатике: блок алгоритмов','PDF','Информатика','Подборка заданий для 8-9 классов.','120 КБ',NULL,NULL,'subjects','2026-04-17 21:00:00','2026-06-14 19:00:59'),('doc-5','org-1234','sec-methods','Методические рекомендации по проверочным работам','PDF',NULL,'Общие методические рекомендации.','96 КБ',NULL,NULL,'roles','2026-01-29 21:00:00','2026-06-14 19:00:59'),('doc-6','org-1234','sec-plans','График внутришкольного контроля','XLSX',NULL,'План-график контрольных мероприятий.','70 КБ',NULL,NULL,'users','2026-02-28 21:00:00','2026-06-14 19:00:59'),('doc-7','org-1234','sec-methods','Памятка преподавателя: журнал и КТП','PDF',NULL,'Тестовый документ доступен только специальности «Преподаватель».','132 КБ',NULL,NULL,'specialty_tags','2026-05-19 21:00:00','2026-06-14 19:00:59'),('doc-8','org-1234','sec-common','Общая памятка молодого специалиста','DOCX',NULL,'Тестовый документ доступен специальности «Общий специалист».','64 КБ',NULL,NULL,'specialty_tags','2026-05-21 21:00:00','2026-06-14 19:00:59');
/*!40000 ALTER TABLE `documents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `incidents`
--

DROP TABLE IF EXISTS `incidents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `incidents` (
  `id` varchar(64) NOT NULL,
  `title` varchar(500) NOT NULL,
  `category` varchar(150) NOT NULL DEFAULT '',
  `level` varchar(16) NOT NULL DEFAULT 'Средний',
  `audience` varchar(255) NOT NULL DEFAULT '',
  `summary` text NOT NULL,
  `first_steps` text NOT NULL,
  `documents` text NOT NULL,
  `owner` varchar(32) NOT NULL DEFAULT 'Редакция',
  `attachment_name` varchar(255) DEFAULT NULL,
  `attachment_url` text DEFAULT NULL,
  `reported_by_user_id` varchar(64) DEFAULT NULL,
  `organization_id` varchar(64) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_inc_owner` (`owner`),
  KEY `idx_inc_org` (`organization_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `incidents`
--

LOCK TABLES `incidents` WRITE;
/*!40000 ALTER TABLE `incidents` DISABLE KEYS */;
INSERT INTO `incidents` VALUES ('inc-1','Конфликт с родителями','Коммуникация','Средний','Педагогика','Претензии, жалобы или агрессивное поведение родителей.','Сохранить спокойствие; зафиксировать дату и суть обращения; сообщить руководителю; предложить письменный формат.','Объяснительная, служебная записка, копии переписки, протокол встречи.','Редакция',NULL,NULL,NULL,NULL,'2026-05-20 09:00:00','2026-06-14 19:00:59'),('inc-2','Травма на рабочем месте','Безопасность','Высокий','Все специальности','Алгоритм фиксации травмы, уведомления ответственных и подготовки документов.','Обеспечить помощь; уведомить администрацию; не менять место происшествия без необходимости; собрать свидетелей.','Акт, объяснительные, медицинская справка, журнал регистрации.','Редакция',NULL,NULL,NULL,NULL,'2026-05-20 09:00:00','2026-06-14 19:00:59'),('inc-3','Нарушение трудовых прав','Правовой','Высокий','Все специальности','Незаконные удержания, нагрузка, невыплаты или давление.','Собрать документы; письменно запросить основание; обратиться к руководителю или в профсоюз.','Трудовой договор, расчетные листки, графики, переписка, заявление.','Редакция',NULL,NULL,NULL,NULL,'2026-05-20 09:00:00','2026-06-14 19:00:59');
/*!40000 ALTER TABLE `incidents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `invite_codes`
--

DROP TABLE IF EXISTS `invite_codes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `invite_codes` (
  `id` varchar(64) NOT NULL,
  `organization_id` varchar(64) NOT NULL,
  `code` varchar(64) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `expires_at` timestamp NULL DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  KEY `idx_invite_org` (`organization_id`),
  KEY `idx_invite_code` (`code`),
  CONSTRAINT `fk_invite_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invite_codes`
--

LOCK TABLES `invite_codes` WRITE;
/*!40000 ALTER TABLE `invite_codes` DISABLE KEYS */;
INSERT INTO `invite_codes` VALUES ('invite-1','org-1234','SCH-2026-K8X4','2026-05-20 09:00:00',NULL,1);
/*!40000 ALTER TABLE `invite_codes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `join_requests`
--

DROP TABLE IF EXISTS `join_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `join_requests` (
  `id` varchar(64) NOT NULL,
  `organization_id` varchar(64) NOT NULL,
  `user_id` varchar(64) NOT NULL,
  `invite_code` varchar(64) NOT NULL DEFAULT '',
  `status` varchar(16) NOT NULL DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `reviewed_at` timestamp NULL DEFAULT NULL,
  `reviewed_by_user_id` varchar(64) DEFAULT NULL,
  `comment` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_jr_org` (`organization_id`),
  KEY `idx_jr_user` (`user_id`),
  KEY `idx_jr_status` (`status`),
  CONSTRAINT `fk_jr_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_jr_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`public_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `join_requests`
--

LOCK TABLES `join_requests` WRITE;
/*!40000 ALTER TABLE `join_requests` DISABLE KEYS */;
INSERT INTO `join_requests` VALUES ('req-1','org-1234','u-teacher-pending','SCH-2026-K8X4','pending','2026-05-18 08:20:00',NULL,NULL,NULL);
/*!40000 ALTER TABLE `join_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `knowledge_articles`
--

DROP TABLE IF EXISTS `knowledge_articles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `knowledge_articles` (
  `id` varchar(64) NOT NULL,
  `title` varchar(500) NOT NULL,
  `category` varchar(150) NOT NULL DEFAULT '',
  `summary` text DEFAULT NULL,
  `body` longtext DEFAULT NULL,
  `tags` longtext NOT NULL DEFAULT '[]',
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_kb_cat` (`category`),
  KEY `idx_kb_sort` (`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `knowledge_articles`
--

LOCK TABLES `knowledge_articles` WRITE;
/*!40000 ALTER TABLE `knowledge_articles` DISABLE KEYS */;
/*!40000 ALTER TABLE `knowledge_articles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `membership_specialty_tags`
--

DROP TABLE IF EXISTS `membership_specialty_tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `membership_specialty_tags` (
  `membership_id` varchar(64) NOT NULL,
  `tag_id` varchar(64) NOT NULL,
  PRIMARY KEY (`membership_id`,`tag_id`),
  CONSTRAINT `fk_mst_mem` FOREIGN KEY (`membership_id`) REFERENCES `memberships` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `membership_specialty_tags`
--

LOCK TABLES `membership_specialty_tags` WRITE;
/*!40000 ALTER TABLE `membership_specialty_tags` DISABLE KEYS */;
INSERT INTO `membership_specialty_tags` VALUES ('m-1','tag-teacher'),('m-2','tag-teacher'),('m-3','tag-general');
/*!40000 ALTER TABLE `membership_specialty_tags` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `memberships`
--

DROP TABLE IF EXISTS `memberships`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `memberships` (
  `id` varchar(64) NOT NULL,
  `organization_id` varchar(64) NOT NULL,
  `user_id` varchar(64) NOT NULL,
  `role` varchar(32) NOT NULL DEFAULT 'member',
  `status` varchar(16) NOT NULL DEFAULT 'approved',
  `joined_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_mem_org` (`organization_id`),
  KEY `idx_mem_user` (`user_id`),
  CONSTRAINT `fk_mem_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_mem_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`public_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `memberships`
--

LOCK TABLES `memberships` WRITE;
/*!40000 ALTER TABLE `memberships` DISABLE KEYS */;
INSERT INTO `memberships` VALUES ('m-1','org-1234','u-org-admin','organization_admin','approved','2025-09-02 09:00:00'),('m-2','org-1234','u-teacher-approved','teacher','approved','2025-09-05 10:00:00'),('m-3','org-1234','u-user','member','approved','2026-01-12 08:00:00');
/*!40000 ALTER TABLE `memberships` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `news`
--

DROP TABLE IF EXISTS `news`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `news` (
  `id` varchar(64) NOT NULL,
  `title` varchar(500) NOT NULL,
  `summary` text NOT NULL,
  `body` longtext NOT NULL DEFAULT '[]',
  `category` varchar(150) NOT NULL DEFAULT '',
  `specialization` varchar(150) DEFAULT NULL,
  `audience` varchar(32) NOT NULL DEFAULT 'Все',
  `author` varchar(255) NOT NULL DEFAULT '',
  `author_user_id` varchar(64) DEFAULT NULL,
  `editor_user_id` varchar(64) DEFAULT NULL,
  `published_at` varchar(32) NOT NULL DEFAULT '',
  `is_public` tinyint(1) NOT NULL DEFAULT 1,
  `organization_id` varchar(64) DEFAULT NULL,
  `cover_image_url` text DEFAULT NULL,
  `video_url` text DEFAULT NULL,
  `guest_preview` text DEFAULT NULL,
  `registered_only` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_news_org` (`organization_id`),
  KEY `idx_news_author` (`author_user_id`),
  KEY `idx_news_public` (`is_public`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `news`
--

LOCK TABLES `news` WRITE;
/*!40000 ALTER TABLE `news` DISABLE KEYS */;
INSERT INTO `news` VALUES ('news-2023-07-28-001','Первое рабочее место молодого педагога: с чего начинается распределение','Практический гид по старту после распределения: когда начинается срок работы, какие бумаги взять с собой и что уточнить у нанимателя в первый день.','[\"Редакция разбирает ключевые вопросы: Кому материал нужен; Какие нормы открыть; Какие документы проверить; Частые ошибки на старте.\",\"Открытая часть материала: статус, сроки и базовые документы.\"]','Старт карьеры','Педагогика','Новичок','Редакция ПрофБазы',NULL,NULL,'2023-07-28',1,NULL,NULL,NULL,'Гостю: статус, сроки и базовые документы.','После входа: пошаговый сценарий первого месяца, вопросы кадровику и персональный чек-лист.','2026-06-14 18:00:59','2026-06-14 19:00:59'),('news-2023-08-02-002','Какие документы взять на оформление в школу в первый день','Короткая памятка по базовому набору документов при приеме на работу и по тем бумагам, копии которых лучше оставить у себя.','[\"Редакция разбирает ключевые вопросы: Что обязательно оформить; Что проверить в документах; Где бывают ошибки; Когда писать запрос.\",\"Открытая часть материала: базовые правила и минимум документов.\"]','Кадровые документы',NULL,'Новичок','Анастасия Ковалёва',NULL,NULL,'2023-08-02',1,NULL,NULL,NULL,'Гостю: базовые правила и минимум документов.','После входа: детальный чек-лист, типовые ошибки и шаблон личной папки.','2026-06-14 18:00:59','2026-06-14 19:00:59'),('news-2023-08-09-003','Трудовой договор или контракт: что обычно предлагают молодому специалисту','Материал помогает различить трудовой договор и контракт, понять срок действия документа и набор обязательных условий.','[\"Редакция разбирает ключевые вопросы: Что обязательно оформить; Что проверить в документах; Где бывают ошибки; Когда писать запрос.\",\"Открытая часть материала: короткое сравнение договора и контракта.\"]','Кадровые документы','Право','Новичок','Егор Григорьев',NULL,NULL,'2023-08-09',0,NULL,NULL,NULL,'Гостю: короткое сравнение договора и контракта.','После входа: чек-лист по чтению проекта документа и список спорных пунктов.','2026-06-14 18:00:59','2026-06-14 19:00:59'),('news-2023-08-16-004','Испытательный срок: когда он не применяется к молодому специалисту','Объясняем, почему предварительное испытание не всегда допустимо и какие формулировки важно проверить в тексте договора.','[\"Редакция разбирает ключевые вопросы: Что обязательно оформить; Что проверить в документах; Где бывают ошибки; Когда писать запрос.\",\"Открытая часть материала: когда испытание не устанавливают.\"]','Кадровые документы','Право','Новичок','Марина Лапицкая',NULL,NULL,'2023-08-16',0,NULL,NULL,NULL,'Гостю: когда испытание не устанавливают.','После входа: алгоритм разговора с кадровой службой и быстрый чек-лист по формулировкам.','2026-06-14 18:00:59','2026-06-14 19:00:59'),('news-2023-08-23-005','Медосмотр перед началом работы: кому нужен и что проверить','Понятный вводный материал о предварительном медосмотре, обязательных справках и роли нанимателя в этом процессе.','[\"Редакция разбирает ключевые вопросы: Кого затрагивает правило; Обязанности нанимателя и работника; Какие журналы и акты проверить; Как зафиксировать выполнение.\",\"Открытая часть материала: кто проходит медосмотр и что взять с собой.\"]','Охрана труда и медосмотры','Медицина','Новичок','Елена Бурак',NULL,NULL,'2023-08-23',1,NULL,NULL,NULL,'Гостю: кто проходит медосмотр и что взять с собой.','После входа: расширенный чек-лист по справкам, срокам и типовым вопросам к нанимателю.','2026-06-14 18:00:59','2026-06-14 19:00:59'),('news-2023-09-01-006','Вводный инструктаж по охране труда в учреждении образования: что спросить','Показываем, какие темы обычно входят во вводный инструктаж, где фиксируется его прохождение и какие локальные инструкции стоит запросить.','[\"Редакция разбирает ключевые вопросы: Кого затрагивает правило; Обязанности нанимателя и работника; Какие журналы и акты проверить; Как зафиксировать выполнение.\",\"Открытая часть материала: виды инструктажа и базовые вопросы.\"]','Охрана труда и медосмотры',NULL,'Новичок','Антон Жилин',NULL,NULL,'2023-09-01',0,NULL,NULL,NULL,'Гостю: виды инструктажа и базовые вопросы.','После входа: список локальных инструкций и календарь контрольных точек на первый год.','2026-06-14 18:00:59','2026-06-14 19:00:59'),('news-2023-09-12-007','Рабочее время педагога: как понимать нагрузку, подготовку и дежурства','Материал помогает отличать педагогическую нагрузку от другой работы и не путать учебные часы с общей организацией рабочего времени.','[\"Редакция разбирает ключевые вопросы: Из чего состоит выплата или гарантия; Какие нормы действуют; Что проверить у себя; Когда задавать вопрос бухгалтерии.\",\"Открытая часть материала: базовая схема нагрузки и рабочего времени.\"]','Оплата труда и гарантии','Педагогика','Новичок','Ольга Савчук',NULL,NULL,'2023-09-12',0,NULL,NULL,NULL,'Гостю: базовая схема нагрузки и рабочего времени.','После входа: разбор замещений, дежурств и спорных поручений.','2026-06-14 18:00:59','2026-06-14 19:00:59'),('news-2023-09-26-008','Первый расчетный листок: из чего складывается зарплата в бюджетной организации','Публикация помогает новичку не потеряться в окладе, надбавках и стимулирующих выплатах и увидеть, какие вопросы правильно задавать бухгалтерии.','[\"Редакция разбирает ключевые вопросы: Из чего состоит выплата или гарантия; Какие нормы действуют; Что проверить у себя; Когда задавать вопрос бухгалтерии.\",\"Открытая часть материала: из чего состоит первая выплата.\"]','Оплата труда и гарантии',NULL,'Новичок','Редакция ПрофБазы',NULL,NULL,'2023-09-26',1,NULL,NULL,NULL,'Гостю: из чего состоит первая выплата.','После входа: разбор типовых строк начислений и мини-шаблон для учета выплат.','2026-06-14 18:00:59','2026-06-14 19:00:59'),('news-2023-10-10-009','Отпуск педагога: когда составляют график и почему это важно','Объясняем, как работает график отпусков, почему его надо читать заранее и какие нюансы лучше проговорить до утверждения.','[\"Редакция разбирает ключевые вопросы: Из чего состоит выплата или гарантия; Какие нормы действуют; Что проверить у себя; Когда задавать вопрос бухгалтерии.\",\"Открытая часть материала: график отпусков простым языком.\"]','Оплата труда и гарантии','Педагогика','Все','Ирина Руденко',NULL,NULL,'2023-10-10',0,NULL,NULL,NULL,'Гостю: график отпусков простым языком.','После входа: переносы, разделение отпуска и частые спорные кейсы.','2026-06-14 18:00:59','2026-06-14 19:00:59'),('news-2023-10-24-010','Локальные документы школы: какие положения стоит прочитать в первую неделю','Стартовый перечень локальных актов, которые реально влияют на режим работы, оплату, охрану труда и коммуникацию внутри школы.','[\"Редакция разбирает ключевые вопросы: Что обязательно оформить; Что проверить в документах; Где бывают ошибки; Когда писать запрос.\",\"Открытая часть материала: список актов, которые точно стоит найти.\"]','Локальные документы и организация','Право','Новичок','Ксения Левчук',NULL,NULL,'2023-10-24',1,NULL,NULL,NULL,'Гостю: список актов, которые точно стоит найти.','После входа: разбор ПВТР, положения об оплате труда и внутренних алгоритмов школы.','2026-06-14 18:00:59','2026-06-14 19:00:59'),('news-2023-11-07-011','Наставник на старте: как выстроить рабочие договоренности','Статья о том, как молодому педагогу не ждать абстрактной помощи, а договориться о конкретных встречах, обратной связи и наблюдении уроков.','[\"Редакция разбирает ключевые вопросы: Какие возможности доступны; Как связать это с ролью; Где искать официальные программы; Как собрать личный план.\",\"Открытая часть материала: первый шаг в работе с наставником.\"]','Профразвитие и аттестация','Педагогика','Новичок','Елена Бурак',NULL,NULL,'2023-11-07',0,NULL,NULL,NULL,'Гостю: первый шаг в работе с наставником.','После входа: шаблон договоренности, календарь встреч и карта наблюдений за уроками.','2026-06-14 18:00:59','2026-06-14 19:00:59'),('news-2023-11-21-012','Классное руководство для начинающего учителя: на что согласовываться письменно','Материал помогает заранее обсудить объем задач, отчетность и коммуникацию с администрацией, если новичку предлагают классное руководство.','[\"Редакция разбирает ключевые вопросы: Что меняется в процессе; Какие документы открыть; Как это влияет на педагога; Чек-лист действий.\",\"Открытая часть материала: роли и ожидания от классного руководителя.\"]','Педагогическая практика','Педагогика','Новичок','Марина Лапицкая',NULL,NULL,'2023-11-21',0,NULL,NULL,NULL,'Гостю: роли и ожидания от классного руководителя.','После входа: чек-лист по журналам, коммуникации с родителями и внутреннему распределению задач.','2026-06-14 18:00:59','2026-06-14 19:00:59'),('news-2023-12-05-013','Как вести школьную документацию без лишней паники','Вместо длинных цитат из нормативки даем понятный маршрут: какие записи ведутся регулярно, где искать образцы и когда лучше уточнять порядок у администрации.','[\"Редакция разбирает ключевые вопросы: Что обязательно оформить; Что проверить в документах; Где бывают ошибки; Когда писать запрос.\",\"Открытая часть материала: обзор основных видов школьной документации.\"]','Локальные документы и организация','Педагогика','Новичок','Ольга Савчук',NULL,NULL,'2023-12-05',0,NULL,NULL,NULL,'Гостю: обзор основных видов школьной документации.','После входа: подборка рабочих шаблонов, частых ошибок и личный чек-лист на четверть.','2026-06-14 18:00:59','2026-06-14 19:00:59'),('news-2023-12-12-014','Конфликт с родителями: как фиксировать коммуникацию корректно','Публикация объясняет, почему важно отделять эмоции от фактов и какие служебные записи помогают школе действовать аккуратно и законно.','[\"Редакция разбирает ключевые вопросы: Какие участники включаются; Какой алгоритм работает; Что нужно зафиксировать; Куда обращаться за поддержкой.\",\"Открытая часть материала: памятка по деловой коммуникации и фиксации фактов.\"]','Инциденты и обращения','Право','Все','Антон Жилин',NULL,NULL,'2023-12-12',0,NULL,NULL,NULL,'Гостю: памятка по деловой коммуникации и фиксации фактов.','После входа: образцы записей, эскалация вопроса и практический алгоритм.','2026-06-14 18:00:59','2026-06-14 19:00:59'),('news-2023-12-19-015','Если в классе есть ребенок с ОПФР: с чего начать взаимодействие','Материал для педагога, который впервые работает в инклюзивной среде и хочет быстро понять круг специалистов и доступные методические опоры.','[\"Редакция разбирает ключевые вопросы: Какие участники включаются; Какой алгоритм работает; Что нужно зафиксировать; Куда обращаться за поддержкой.\",\"Открытая часть материала: первые шаги педагога в инклюзивной среде.\"]','Инклюзия и поддержка','Социальная работа','Новичок','Ирина Руденко',NULL,NULL,'2023-12-19',0,NULL,NULL,NULL,'Гостю: первые шаги педагога в инклюзивной среде.','После входа: маршрут взаимодействия с семьей и внутришкольной командой.','2026-06-14 18:00:59','2026-06-14 19:00:59'),('news-2023-12-26-016','Психологическая безопасность в школе: когда обращаться к педагогу-психологу','Показываем, как распознать ситуацию, которую не стоит решать в одиночку, и как корректно подключать школьную психологическую службу.','[\"Редакция разбирает ключевые вопросы: Какие участники включаются; Какой алгоритм работает; Что нужно зафиксировать; Куда обращаться за поддержкой.\",\"Открытая часть материала: признаки ситуации, где нужна помощь психолога.\"]','Инклюзия и поддержка','Педагогика','Все','Ксения Левчук',NULL,NULL,'2023-12-26',0,NULL,NULL,NULL,'Гостю: признаки ситуации, где нужна помощь психолога.','После входа: алгоритм передачи информации и взаимодействия с семьей и администрацией.','2026-06-14 18:00:59','2026-06-14 19:00:59'),('news-2024-01-09-017','Что изменилось в Трудовом кодексе с 1 января 2024 года: гид для молодых специалистов','Собираем ключевые изменения без лишней теории и показываем, какие из них чаще всего касаются расчета, отпусков, оформления и увольнения.','[\"Редакция разбирает ключевые вопросы: Что обязательно оформить; Что проверить в документах; Где бывают ошибки; Когда писать запрос.\",\"Открытая часть материала: краткий обзор главных изменений ТК.\"]','Кадровые документы','Право','Все','Редакция ПрофБазы',NULL,NULL,'2024-01-09',1,NULL,NULL,NULL,'Гостю: краткий обзор главных изменений ТК.','После входа: расширенный разбор тем, которые влияют на повседневную работу и документы.','2026-06-14 18:00:59','2026-06-14 19:00:59'),('news-2024-01-23-018','Зарплата не реже двух раз в месяц: как это работает после изменений ТК','Публикация объясняет, что именно поменялось в подходе к выплате заработной платы и что работнику важно проверить в локальных документах.','[\"Редакция разбирает ключевые вопросы: Из чего состоит выплата или гарантия; Какие нормы действуют; Что проверить у себя; Когда задавать вопрос бухгалтерии.\",\"Открытая часть материала: памятка о периодичности выплаты зарплаты.\"]','Оплата труда и гарантии','Право','Все','Егор Григорьев',NULL,NULL,'2024-01-23',0,NULL,NULL,NULL,'Гостю: памятка о периодичности выплаты зарплаты.','После входа: как сопоставить закон, ПВТР и фактические даты выплат.','2026-06-14 18:00:59','2026-06-14 19:00:59'),('news-2024-02-06-019','Обновленные формы трудового договора и ПВТР с 2024 года: что проверять работнику','Материал помогает сравнить проект договора и правила внутреннего трудового распорядка с новыми требованиями и не пропустить важные формулировки.','[\"Редакция разбирает ключевые вопросы: Что обязательно оформить; Что проверить в документах; Где бывают ошибки; Когда писать запрос.\",\"Открытая часть материала: что изменилось в типовых формах.\"]','Локальные документы и организация','Право','Все','Анастасия Ковалёва',NULL,NULL,'2024-02-06',0,NULL,NULL,NULL,'Гостю: что изменилось в типовых формах.','После входа: чек-лист для чтения договора, ПВТР и ключевых локальных актов.','2026-06-14 18:00:59','2026-06-14 19:00:59'),('news-2024-02-20-020','Трудовая книжка в 2024 году: какие записи особенно важны после приема','Показываем, какие сведения должны появиться в трудовой книжке, как работнику сверять записи и зачем хранить копии кадровых документов.','[\"Редакция разбирает ключевые вопросы: Что обязательно оформить; Что проверить в документах; Где бывают ошибки; Когда писать запрос.\",\"Открытая часть материала: памятка по первым записям и сверке данных.\"]','Кадровые документы','Право','Новичок','Марина Лапицкая',NULL,NULL,'2024-02-20',0,NULL,NULL,NULL,'Гостю: памятка по первым записям и сверке данных.','После входа: ошибки, исправления и безопасное хранение кадровых копий.','2026-06-14 18:00:59','2026-06-14 19:00:59'),('news-2024-03-05-021','Изменение существенных условий труда: когда вас должны предупредить','Статья нужна, когда меняется режим, объем работы или другие условия и важно понять, где проходит граница между обычной организацией труда и существенными изменениями.','[\"Редакция разбирает ключевые вопросы: Что обязательно оформить; Что проверить в документах; Где бывают ошибки; Когда писать запрос.\",\"Открытая часть материала: какие изменения нельзя вводить молча.\"]','Кадровые документы','Право','Все','Антон Жилин',NULL,NULL,'2024-03-05',0,NULL,NULL,NULL,'Гостю: какие изменения нельзя вводить молча.','После входа: разбор уведомлений, сроков и личного алгоритма при спорной ситуации.','2026-06-14 18:00:59','2026-06-14 19:00:59'),('news-2024-03-19-022','Совмещение, совместительство, замены уроков: чем они отличаются','Материал помогает не путать похожие понятия и понимать, по каким правилам оформляются дополнительные поручения и часы.','[\"Редакция разбирает ключевые вопросы: Что обязательно оформить; Что проверить в документах; Где бывают ошибки; Когда писать запрос.\",\"Открытая часть материала: таблица различий между тремя режимами.\"]','Кадровые документы','Право','Все','Никита Маркевич',NULL,NULL,'2024-03-19',0,NULL,NULL,NULL,'Гостю: таблица различий между тремя режимами.','После входа: оформление, оплата и красные флаги при дополнительных часах.','2026-06-14 18:00:59','2026-06-14 19:00:59'),('news-2024-04-02-023','Коллективный договор школы: как понять, есть ли в нем льготы для работников','Объясняем, зачем читать коллективный договор даже новичку и какие дополнительные гарантии в нем иногда закрепляются сверх базовых норм.','[\"Редакция разбирает ключевые вопросы: Что обязательно оформить; Что проверить в документах; Где бывают ошибки; Когда писать запрос.\",\"Открытая часть материала: что смотреть в коллективном договоре в первую очередь.\"]','Локальные документы и организация','Право','Все','Елена Бурак',NULL,NULL,'2024-04-02',0,NULL,NULL,NULL,'Гостю: что смотреть в коллективном договоре в первую очередь.','После входа: наиболее полезные разделы и подсказки, как сравнить их с другими актами.','2026-06-14 18:00:59','2026-06-14 19:00:59'),('news-2024-04-16-024','Отпуска педагога и график отпусков: что учитывать весной','Собираем практические вопросы, которые возникают до утверждения летнего графика: переносы, разделение, совмещение с учебной нагрузкой.','[\"Редакция разбирает ключевые вопросы: Из чего состоит выплата или гарантия; Какие нормы действуют; Что проверить у себя; Когда задавать вопрос бухгалтерии.\",\"Открытая часть материала: что проверить до утверждения графика.\"]','Оплата труда и гарантии','Педагогика','Все','Ирина Руденко',NULL,NULL,'2024-04-16',0,NULL,NULL,NULL,'Гостю: что проверить до утверждения графика.','После входа: переносы, письменные согласования и частые спорные кейсы.','2026-06-14 18:00:59','2026-06-14 19:00:59'),('news-2024-05-07-025','Аттестация педагогических работников: базовая дорожная карта на несколько лет','Материал для тех, кто хочет заранее понимать логику квалификационных категорий и планировать развитие без спешки в последний момент.','[\"Редакция разбирает ключевые вопросы: Какие возможности доступны; Как связать это с ролью; Где искать официальные программы; Как собрать личный план.\",\"Открытая часть материала: что важно знать об аттестации заранее.\"]','Профразвитие и аттестация','Педагогика','Все','Ольга Савчук',NULL,NULL,'2024-05-07',1,NULL,NULL,NULL,'Гостю: что важно знать об аттестации заранее.','После входа: маршрут подготовки на несколько лет и карта доказательств.','2026-06-14 18:00:59','2026-06-14 19:00:59'),('news-2024-05-21-026','Повышение квалификации после 2024 года: как собрать свой маршрут','Смотрим на официальные программы повышения квалификации, переподготовки и стажировки и объясняем, как выбирать их под реальную должность.','[\"Редакция разбирает ключевые вопросы: Какие возможности доступны; Как связать это с ролью; Где искать официальные программы; Как собрать личный план.\",\"Открытая часть материала: обзор форм дополнительного образования взрослых.\"]','Профразвитие и аттестация','Педагогика','Все','Ксения Левчук',NULL,NULL,'2024-05-21',0,NULL,NULL,NULL,'Гостю: обзор форм дополнительного образования взрослых.','После входа: конструктор личного плана развития под должность и аттестацию.','2026-06-14 18:00:59','2026-06-14 19:00:59'),('news-2024-06-04-027','Профессиональное выгорание педагога: как заметить первые сигналы','Не медицинская консультация, а практический материал о ранних признаках выгорания, нарушениях нагрузки и моментах, когда стоит искать помощь.','[\"Редакция разбирает ключевые вопросы: Какие участники включаются; Какой алгоритм работает; Что нужно зафиксировать; Куда обращаться за поддержкой.\",\"Открытая часть материала: первые сигналы, которые лучше не игнорировать.\"]','Инклюзия и поддержка','Педагогика','Все','Елена Бурак',NULL,NULL,'2024-06-04',0,NULL,NULL,NULL,'Гостю: первые сигналы, которые лучше не игнорировать.','После входа: чек-лист риска, план нагрузки на месяц и маршруты обращения за поддержкой.','2026-06-14 18:00:59','2026-06-14 19:00:59'),('news-2024-06-18-028','Дружелюбная и поддерживающая среда в школе: что может сделать классный руководитель','Разбираем модель поддерживающей школьной среды на уровне повседневных действий: правила класса, язык коммуникации и маршрутизация проблем.','[\"Редакция разбирает ключевые вопросы: Какие участники включаются; Какой алгоритм работает; Что нужно зафиксировать; Куда обращаться за поддержкой.\",\"Открытая часть материала: пять простых практик для класса.\"]','Инклюзия и поддержка','Педагогика','Все','Редакция ПрофБазы',NULL,NULL,'2024-06-18',0,NULL,NULL,NULL,'Гостю: пять простых практик для класса.','После входа: алгоритм внедрения правил класса и наблюдения за рисками насилия.','2026-06-14 18:00:59','2026-06-14 19:00:59'),('news-2024-07-02-029','Профилактика буллинга: какие алгоритмы уже работают в системе образования','Материал собирает практики раннего реагирования и показывает, как связать наблюдение педагога, работу психолога и действия администрации.','[\"Редакция разбирает ключевые вопросы: Какие участники включаются; Какой алгоритм работает; Что нужно зафиксировать; Куда обращаться за поддержкой.\",\"Открытая часть материала: короткий алгоритм раннего реагирования.\"]','Инклюзия и поддержка','Социальная работа','Все','Антон Жилин',NULL,NULL,'2024-07-02',1,NULL,NULL,NULL,'Гостю: короткий алгоритм раннего реагирования.','После входа: фиксация, эскалация и взаимодействие с родителями и специалистами.','2026-06-14 18:00:59','2026-06-14 19:00:59'),('news-2024-07-16-030','Инклюзивный класс: где искать методическую поддержку','Публикация направляет педагога к официальным разделам и ежегодным письмам, где можно искать программы, подходы и полезные разъяснения.','[\"Редакция разбирает ключевые вопросы: Какие участники включаются; Какой алгоритм работает; Что нужно зафиксировать; Куда обращаться за поддержкой.\",\"Открытая часть материала: где искать официальные материалы по инклюзии.\"]','Инклюзия и поддержка','Социальная работа','Все','Ирина Руденко',NULL,NULL,'2024-07-16',0,NULL,NULL,NULL,'Гостю: где искать официальные материалы по инклюзии.','После входа: подборка разделов, писем и вопросов для команды сопровождения.','2026-06-14 18:00:59','2026-06-14 19:00:59'),('news-2024-08-13-031','Электронный дневник и электронный журнал: что важно школе до внедрения сервиса','Материал о правовых и организационных условиях внедрения сервиса: договор, хранение данных, методическое сопровождение и обучение персонала.','[\"Редакция разбирает ключевые вопросы: Какие сервисы или правила действуют; Где границы по данным; Что оформить локально; Мини-чек-лист школы.\",\"Открытая часть материала: условия, без которых внедрение не стоит запускать.\"]','Цифровая среда и данные','Информационные технологии','Опытный','Никита Маркевич',NULL,NULL,'2024-08-13',0,NULL,NULL,NULL,'Гостю: условия, без которых внедрение не стоит запускать.','После входа: договор, хранение данных, техподдержка и роль ответственных специалистов.','2026-06-14 18:00:59','2026-06-14 19:00:59'),('news-2024-08-27-032','Официальный сайт школы: что должно обновляться регулярно','Статья объясняет, почему сайт школы — это не только PR, но и исполнение официальных требований к актуальности и полноте информации.','[\"Редакция разбирает ключевые вопросы: Какие сервисы или правила действуют; Где границы по данным; Что оформить локально; Мини-чек-лист школы.\",\"Открытая часть материала: минимальный режим обновления сайта.\"]','Цифровая среда и данные','Информационные технологии','Опытный','Ольга Савчук',NULL,NULL,'2024-08-27',1,NULL,NULL,NULL,'Гостю: минимальный режим обновления сайта.','После входа: аудит разделов, периодичности обновления и внутреннего контроля качества информации.','2026-06-14 18:00:59','2026-06-14 19:00:59'),('news-2024-09-10-033','Персональные данные учащихся и работников: как проверить политику школы','Показываем, как сопоставить школьную политику обработки персональных данных с реальными процессами — от личных дел до фото и публикаций на сайте.','[\"Редакция разбирает ключевые вопросы: Какие сервисы или правила действуют; Где границы по данным; Что оформить локально; Мини-чек-лист школы.\",\"Открытая часть материала: что должно быть в политике школы.\"]','Цифровая среда и данные','Право','Опытный','Ксения Левчук',NULL,NULL,'2024-09-10',0,NULL,NULL,NULL,'Гостю: что должно быть в политике школы.','После входа: аудит процессов, форм согласия и разделов сайта, где чаще всего нужны правки.','2026-06-14 18:00:59','2026-06-14 19:00:59'),('news-2024-09-24-034','Портал занятости и рынок труда: как использовать данные Белстата и госресурсов без ошибок','Материал учит читать официальные данные о рынке труда и вакансиях без завышенных выводов и использовать их в профориентации и личном планировании.','[\"Редакция разбирает ключевые вопросы: Какие данные доступны; Как их читать без ошибок; Что это значит для специалиста; Как использовать в работе.\",\"Открытая часть материала: какие официальные данные можно открыть за 10 минут.\"]','Аналитика и профориентация',NULL,'Все','Егор Григорьев',NULL,NULL,'2024-09-24',0,NULL,NULL,NULL,'Гостю: какие официальные данные можно открыть за 10 минут.','После входа: динамика, региональные различия и ограничения статистики.','2026-06-14 18:00:59','2026-06-14 19:00:59'),('news-2024-10-08-035','Молодой педагог и обращение в профсоюз или к руководителю: когда писать официально','Статья о границе между устным разговором и официальным обращением, если вопрос касается нагрузки, выплат или условий труда.','[\"Редакция разбирает ключевые вопросы: Какие участники включаются; Какой алгоритм работает; Что нужно зафиксировать; Куда обращаться за поддержкой.\",\"Открытая часть материала: когда достаточно разговора, а когда уже нужен письменный след.\"]','Инциденты и обращения','Право','Новичок','Марина Лапицкая',NULL,NULL,'2024-10-08',0,NULL,NULL,NULL,'Гостю: когда достаточно разговора, а когда уже нужен письменный след.','После входа: формулировки, маршрут обращения и советы по сохранению доказательств.','2026-06-14 18:00:59','2026-06-14 19:00:59'),('news-2024-10-22-036','Если произошел инцидент на работе: какую информацию фиксировать в первый день','Публикация помогает не потерять важные факты после происшествия на работе и понимать, какие действия нужны для последующего разбирательства.','[\"Редакция разбирает ключевые вопросы: Кого затрагивает правило; Обязанности нанимателя и работника; Какие журналы и акты проверить; Как зафиксировать выполнение.\",\"Открытая часть материала: какие факты стоит зафиксировать сразу.\"]','Инциденты и обращения','Право','Все','Антон Жилин',NULL,NULL,'2024-10-22',0,NULL,NULL,NULL,'Гостю: какие факты стоит зафиксировать сразу.','После входа: первичные действия, уведомления и сбор документов без самодеятельности.','2026-06-14 18:00:59','2026-06-14 19:00:59'),('news-2025-01-21-037','Кодекс об образовании изменился: что важно молодому специалисту к сентябрю 2025 года','Сводка по тем изменениям в сфере образования, которые напрямую касаются распределения, статуса выпускника, школы и образовательного процесса.','[\"Редакция разбирает ключевые вопросы: Кому материал нужен; Какие нормы открыть; Какие документы проверить; Частые ошибки на старте.\",\"Открытая часть материала: ключевые изменения для молодых работников.\"]','Старт карьеры','Право','Все','Редакция ПрофБазы',NULL,NULL,'2025-01-21',1,NULL,NULL,NULL,'Гостю: ключевые изменения для молодых работников.','После входа: что именно сверять с локальными актами и практикой учреждения.','2026-06-14 18:00:59','2026-06-14 19:00:59'),('news-2025-02-04-038','Платное обучение и статус молодого специалиста: что изменилось после корректировки Кодекса об образовании','Материал для выпускников и кадровиков о том, как читать норму о направлении на работу и статусе молодого специалиста после обновления кодекса.','[\"Редакция разбирает ключевые вопросы: Кому материал нужен; Какие нормы открыть; Какие документы проверить; Частые ошибки на старте.\",\"Открытая часть материала: пояснение к норме о статусе молодого специалиста.\"]','Старт карьеры','Право','Все','Егор Григорьев',NULL,NULL,'2025-02-04',0,NULL,NULL,NULL,'Гостю: пояснение к норме о статусе молодого специалиста.','После входа: сценарии, риски неверного толкования и вопросы для ручной проверки.','2026-06-14 18:00:59','2026-06-14 19:00:59'),('news-2025-03-11-039','Распределение и направление на работу в 2025 году: практические вопросы выпуска','Статья собирает то, что обычно интересует выпускников в конце учебного года: сроки, документы, прибытие, перераспределение и старт работы.','[\"Редакция разбирает ключевые вопросы: Кому материал нужен; Какие нормы открыть; Какие документы проверить; Частые ошибки на старте.\",\"Открытая часть материала: памятка к выпуску и первому месту работы.\"]','Старт карьеры','Педагогика','Новичок','Анастасия Ковалёва',NULL,NULL,'2025-03-11',1,NULL,NULL,NULL,'Гостю: памятка к выпуску и первому месту работы.','После входа: большой FAQ по прибытии, срокам и документам.','2026-06-14 18:00:59','2026-06-14 19:00:59'),('news-2025-03-25-040','Целевая подготовка для педагогики: как читать информацию о заказчиках кадров','Показываем, как будущему педагогу и работодателю читать разделы о целевой подготовке и почему важно сверять данные по конкретной специальности.','[\"Редакция разбирает ключевые вопросы: Какие данные доступны; Как их читать без ошибок; Что это значит для специалиста; Как использовать в работе.\",\"Открытая часть материала: что такое заказчик кадров и где искать данные.\"]','Аналитика и профориентация','Педагогика','Все','Ирина Руденко',NULL,NULL,'2025-03-25',0,NULL,NULL,NULL,'Гостю: что такое заказчик кадров и где искать данные.','После входа: разбор договоров, мест и вопросов до подписания.','2026-06-14 18:00:59','2026-06-14 19:00:59'),('news-2025-04-08-041','Заказчик кадров и база практики: что полезно знать будущему работодателю','Материал для школы и другой организации, которая принимает студентов на практику или рассчитывает на выпускников по распределению.','[\"Редакция разбирает ключевые вопросы: Что обязательно оформить; Что проверить в документах; Где бывают ошибки; Когда писать запрос.\",\"Открытая часть материала: роль заказчика кадров и базы практики.\"]','Локальные документы и организация','Педагогика','Опытный','Антон Жилин',NULL,NULL,'2025-04-08',0,NULL,NULL,NULL,'Гостю: роль заказчика кадров и базы практики.','После входа: документы, ожидания и схема взаимодействия с учреждением образования.','2026-06-14 18:00:59','2026-06-14 19:00:59'),('news-2025-04-22-042','Профильные педагогические классы: как школа может работать с будущими абитуриентами','Статья для администрации и педагогов о том, как использовать профориентационные возможности школы без формального подхода.','[\"Редакция разбирает ключевые вопросы: Что меняется в процессе; Какие документы открыть; Как это влияет на педагога; Чек-лист действий.\",\"Открытая часть материала: идеи системной работы с педагогическими классами.\"]','Аналитика и профориентация','Педагогика','Опытный','Ольга Савчук',NULL,NULL,'2025-04-22',0,NULL,NULL,NULL,'Гостю: идеи системной работы с педагогическими классами.','После входа: план профориентации на год и связки с вузами.','2026-06-14 18:00:59','2026-06-14 19:00:59'),('news-2025-05-06-043','Профессиональная подготовка школьников в X-XI классах: что это значит для педагога','Объясняем, как новые или обновленные профориентационные форматы влияют на расписание, взаимодействие с организациями и роль учителя.','[\"Редакция разбирает ключевые вопросы: Что меняется в процессе; Какие документы открыть; Как это влияет на педагога; Чек-лист действий.\",\"Открытая часть материала: что меняется для педагога и школы.\"]','Педагогическая практика','Педагогика','Все','Никита Маркевич',NULL,NULL,'2025-05-06',0,NULL,NULL,NULL,'Гостю: что меняется для педагога и школы.','После входа: роли, формы работы и точки координации с работодателями.','2026-06-14 18:00:59','2026-06-14 19:00:59'),('news-2025-05-27-044','Методические рекомендации по трудовому воспитанию: полезно не только трудовику','Публикация показывает, как рекомендации по трудовому воспитанию могут пригодиться классному руководителю, заместителю директора и педагогу-организатору.','[\"Редакция разбирает ключевые вопросы: Что меняется в процессе; Какие документы открыть; Как это влияет на педагога; Чек-лист действий.\",\"Открытая часть материала: где рекомендации могут пригодиться разным ролям.\"]','Педагогическая практика','Педагогика','Все','Елена Бурак',NULL,NULL,'2025-05-27',0,NULL,NULL,NULL,'Гостю: где рекомендации могут пригодиться разным ролям.','После входа: примеры мероприятий, профориентационных связок и учебных активностей.','2026-06-14 18:00:59','2026-06-14 19:00:59'),('news-2025-06-25-045','Новый портал УЧИМсяВМЕСТЕ.БЕЛ: что там искать молодому педагогу','Показываем, какие разделы портала практичнее всего использовать в первый год работы: урок, воспитание, цифровая грамотность и ИИ.','[\"Редакция разбирает ключевые вопросы: Какие возможности доступны; Как связать это с ролью; Где искать официальные программы; Как собрать личный план.\",\"Открытая часть материала: быстрый обзор разделов педагогического портала.\"]','Профразвитие и аттестация','Педагогика','Новичок','Ксения Левчук',NULL,NULL,'2025-06-25',1,NULL,NULL,NULL,'Гостю: быстрый обзор разделов педагогического портала.','После входа: маршруты использования портала по ролям, целям и месячному плану.','2026-06-14 18:00:59','2026-06-14 19:00:59'),('news-2025-07-09-046','Онлайн-школа педагога: как включить вебинары в свой план развития','Материал о том, как не копить случайные сертификаты, а использовать вебинары и открытые сессии как часть последовательного профессионального маршрута.','[\"Редакция разбирает ключевые вопросы: Какие возможности доступны; Как связать это с ролью; Где искать официальные программы; Как собрать личный план.\",\"Открытая часть материала: что брать из онлайн-школы, если времени мало.\"]','Профразвитие и аттестация','Педагогика','Все','Марина Лапицкая',NULL,NULL,'2025-07-09',0,NULL,NULL,NULL,'Гостю: что брать из онлайн-школы, если времени мало.','После входа: матрица выбора тем, журнал участия и советы по фиксации результата.','2026-06-14 18:00:59','2026-06-14 19:00:59'),('news-2025-08-05-047','ИИ в образовательном процессе: что рекомендуют официальные методические материалы','Статья не про хайп, а про осторожное использование ИИ там, где это уже отражено в официальных методических источниках и ресурсах для педагогов.','[\"Редакция разбирает ключевые вопросы: Какие сервисы или правила действуют; Где границы по данным; Что оформить локально; Мини-чек-лист школы.\",\"Открытая часть материала: официальные упоминания ИИ в методических материалах.\"]','Цифровая среда и данные','Информационные технологии','Все','Редакция ПрофБазы',NULL,NULL,'2025-08-05',1,NULL,NULL,NULL,'Гостю: официальные упоминания ИИ в методических материалах.','После входа: безопасные сценарии, примеры промптов и ограничения по данным.','2026-06-14 18:00:59','2026-06-14 19:00:59'),('news-2025-08-19-048','Сайт школы в 2025/2026 году: чек-лист разделов и обновлений','Материал для ответственных за сайт и администрации: что проверить к началу учебного года, чтобы сайт отражал обязательную и реально полезную информацию.','[\"Редакция разбирает ключевые вопросы: Какие сервисы или правила действуют; Где границы по данным; Что оформить локально; Мини-чек-лист школы.\",\"Открытая часть материала: мини-чек-лист сайта на старт года.\"]','Цифровая среда и данные','Информационные технологии','Опытный','Ольга Савчук',NULL,NULL,'2025-08-19',0,NULL,NULL,NULL,'Гостю: мини-чек-лист сайта на старт года.','После входа: расширенный аудит разделов, обновлений и распределения ответственности.','2026-06-14 18:00:59','2026-06-14 19:00:59'),('news-2025-09-02-049','ЭОР, ЕИОР и электронные пособия: где брать разрешенные материалы','Показываем, как отличать официально рекомендуемые электронные ресурсы от случайных подборок и зачем это важно для педагога и школы.','[\"Редакция разбирает ключевые вопросы: Какие сервисы или правила действуют; Где границы по данным; Что оформить локально; Мини-чек-лист школы.\",\"Открытая часть материала: где искать официальные электронные ресурсы.\"]','Цифровая среда и данные','Информационные технологии','Все','Ольга Савчук',NULL,NULL,'2025-09-02',0,NULL,NULL,NULL,'Гостю: где искать официальные электронные ресурсы.','После входа: типы ресурсов, грифы и безопасное использование на занятиях.','2026-06-14 18:00:59','2026-06-14 19:00:59'),('news-2025-09-16-050','Сервисы карта учащегося, электронный дневник и журнал: какие условия важны для школы','Объединяем в одном материале организационные условия внедрения сервисов, требования к инфраструктуре и роль согласования с участниками процесса.','[\"Редакция разбирает ключевые вопросы: Какие сервисы или правила действуют; Где границы по данным; Что оформить локально; Мини-чек-лист школы.\",\"Открытая часть материала: вопросы для школы до внедрения сервисов.\"]','Цифровая среда и данные','Информационные технологии','Опытный','Никита Маркевич',NULL,NULL,'2025-09-16',0,NULL,NULL,NULL,'Гостю: вопросы для школы до внедрения сервисов.','После входа: договоры, согласования, данные и сопровождение пользователей.','2026-06-14 18:00:59','2026-06-14 19:00:59'),('news-2025-09-30-051','Защита персональных данных в образовании: обновляем локальные документы правильно','Материал помогает школе перечитать политику, согласия, регистры и внутренние инструкции после обновления методических рекомендаций.','[\"Редакция разбирает ключевые вопросы: Какие сервисы или правила действуют; Где границы по данным; Что оформить локально; Мини-чек-лист школы.\",\"Открытая часть материала: что перепроверить в локальных документах.\"]','Цифровая среда и данные','Право','Опытный','Ксения Левчук',NULL,NULL,'2025-09-30',1,NULL,NULL,NULL,'Гостю: что перепроверить в локальных документах.','После входа: подробный аудит процессов и типовых ошибок школы.','2026-06-14 18:00:59','2026-06-14 19:00:59'),('news-2025-10-14-052','Примерная политика обработки персональных данных для школы: как адаптировать шаблон','Пошаговая статья о том, почему шаблон нельзя копировать без адаптации и какие разделы следует привязывать к реальным процессам учреждения.','[\"Редакция разбирает ключевые вопросы: Какие сервисы или правила действуют; Где границы по данным; Что оформить локально; Мини-чек-лист школы.\",\"Открытая часть материала: почему шаблон нужно адаптировать.\"]','Цифровая среда и данные','Право','Опытный','Егор Григорьев',NULL,NULL,'2025-10-14',0,NULL,NULL,NULL,'Гостю: почему шаблон нужно адаптировать.','После входа: сопоставление целей обработки, составов данных и реальных процессов школы.','2026-06-14 18:00:59','2026-06-14 19:00:59'),('news-2025-10-28-053','ЦЭ-2025 для педагогов в аудитории: ключевые организационные правила','Материал помогает педагогу заранее понять поведение в аудитории, порядок действий и документы, на которые стоит опираться при подготовке.','[\"Редакция разбирает ключевые вопросы: Что меняется в процессе; Какие документы открыть; Как это влияет на педагога; Чек-лист действий.\",\"Открытая часть материала: памятка по роли педагога в аудитории.\"]','Педагогическая практика','Педагогика','Все','Ирина Руденко',NULL,NULL,'2025-10-28',0,NULL,NULL,NULL,'Гостю: памятка по роли педагога в аудитории.','После входа: регламент, частые вопросы и личная подготовка к экзаменационному дню.','2026-06-14 18:00:59','2026-06-14 19:00:59'),('news-2025-11-11-054','Лето в школе: что проверить перед новым учебным годом по охране труда','Публикация для администрации и ответственных сотрудников о летнем окне, когда удобнее всего обновлять инструкции, журналы и внутренние маршруты безопасности.','[\"Редакция разбирает ключевые вопросы: Кого затрагивает правило; Обязанности нанимателя и работника; Какие журналы и акты проверить; Как зафиксировать выполнение.\",\"Открытая часть материала: летний чек-лист по охране труда.\"]','Охрана труда и медосмотры',NULL,'Опытный','Елена Бурак',NULL,NULL,'2025-11-11',0,NULL,NULL,NULL,'Гостю: летний чек-лист по охране труда.','После входа: ревизия инструкций, инструктажей, журналов и локальных алгоритмов.','2026-06-14 18:00:59','2026-06-14 19:00:59'),('news-2025-11-25-055','Повышение зарплаты в бюджетной сфере в 2025 году: что это меняет для работников образования','Материал помогает отличать общую новость о базовой ставке от реального пересчета выплат по конкретной должности и локальным положениям.','[\"Редакция разбирает ключевые вопросы: Из чего состоит выплата или гарантия; Какие нормы действуют; Что проверить у себя; Когда задавать вопрос бухгалтерии.\",\"Открытая часть материала: что означает повышение базовой ставки.\"]','Оплата труда и гарантии',NULL,'Все','Редакция ПрофБазы',NULL,NULL,'2025-11-25',1,NULL,NULL,NULL,'Гостю: что означает повышение базовой ставки.','После входа: как изменения отражаются на окладе, надбавках и локальных расчетах.','2026-06-14 18:00:59','2026-06-14 19:00:59'),('news-2025-12-09-056','Тарифные разряды, надбавки и стимулирующие выплаты: как читать локальные положения','Статья нужна тем, кто хочет понимать, на каком уровне устанавливаются выплаты и где искать различия между общегосударственными нормами и локальным порядком.','[\"Редакция разбирает ключевые вопросы: Из чего состоит выплата или гарантия; Какие нормы действуют; Что проверить у себя; Когда задавать вопрос бухгалтерии.\",\"Открытая часть материала: из чего состоят стимулирующие выплаты.\"]','Оплата труда и гарантии','Право','Все','Анастасия Ковалёва',NULL,NULL,'2025-12-09',0,NULL,NULL,NULL,'Гостю: из чего состоят стимулирующие выплаты.','После входа: маршрут чтения положения об оплате труда и список вопросов к бухгалтерии.','2026-06-14 18:00:59','2026-06-14 19:00:59'),('news-2025-12-16-057','Расследование несчастных случаев: что меняется с 2026 года и что подготовить заранее','Материал предупреждает организации и работников о свежих изменениях в порядке расследования и подсказывает, какие локальные алгоритмы стоит обновить заранее.','[\"Редакция разбирает ключевые вопросы: Кого затрагивает правило; Обязанности нанимателя и работника; Какие журналы и акты проверить; Как зафиксировать выполнение.\",\"Открытая часть материала: что меняется в расследовании несчастных случаев.\"]','Охрана труда и медосмотры','Право','Опытный','Антон Жилин',NULL,NULL,'2025-12-16',0,NULL,NULL,NULL,'Гостю: что меняется в расследовании несчастных случаев.','После входа: список документов и внутренних процедур до вступления изменений в силу.','2026-06-14 18:00:59','2026-06-14 19:00:59'),('news-2025-12-23-058','Молодой специалист в сельской местности: какие вопросы задавать про жилье и локальную поддержку','Не обещаем универсальных льгот, а подсказываем, какие условия нужно уточнять по месту работы и по местным решениям до переезда.','[\"Редакция разбирает ключевые вопросы: Кому материал нужен; Какие нормы открыть; Какие документы проверить; Частые ошибки на старте.\",\"Открытая часть материала: вопросы про жилье, дорогу и локальную поддержку.\"]','Старт карьеры','Педагогика','Новичок','Марина Лапицкая',NULL,NULL,'2025-12-23',0,NULL,NULL,NULL,'Гостю: вопросы про жилье, дорогу и локальную поддержку.','После входа: чек-лист разговора с работодателем и блок темы для ручной проверки.','2026-06-14 18:00:59','2026-06-14 19:00:59'),('news-2026-01-07-059','Молодые специалисты в здравоохранении: какие гарантии и сопровождение видны в 2025-2026 годах','Смотрим на официальные материалы Минздрава и собираем в одном месте видимые меры сопровождения, надбавки и организационную поддержку.','[\"Редакция разбирает ключевые вопросы: Кому материал нужен; Какие нормы открыть; Какие документы проверить; Частые ошибки на старте.\",\"Открытая часть материала: сводка по гарантиям и поддержке молодых специалистов в здравоохранении.\"]','Старт карьеры','Медицина','Новичок','Редакция ПрофБазы',NULL,NULL,'2026-01-07',0,NULL,NULL,NULL,'Гостю: сводка по гарантиям и поддержке молодых специалистов в здравоохранении.','После входа: пояснение выплат, сопровождения и тем, которые нужно сверять по месту работы.','2026-06-14 18:00:59','2026-06-14 19:00:59'),('news-2026-01-14-060','Обязательные медосмотры работников: что изменилось весной 2026 года','Короткая справка по изменениям в инструкции о медосмотрах и напоминание, что точные требования нужно сверять по действующей официальной редакции.','[\"Редакция разбирает ключевые вопросы: Кого затрагивает правило; Обязанности нанимателя и работника; Какие журналы и акты проверить; Как зафиксировать выполнение.\",\"Открытая часть материала: обзор весенних изменений по медосмотрам.\"]','Охрана труда и медосмотры','Медицина','Все','Редакция ПрофБазы',NULL,NULL,'2026-01-14',1,NULL,NULL,NULL,'Гостю: обзор весенних изменений по медосмотрам.','После входа: кого это затрагивает и какие процессы стоит перепроверить.','2026-06-14 18:00:59','2026-06-14 19:00:59'),('news-2026-01-21-061','Перераспределение выпускников по направлению Здравоохранение: что нужно проверить по официальному порядку','Материал делает упор на ручную проверку актуального порядка и помогает выпускнику не смешивать общие правила с отраслевыми исключениями.','[\"Редакция разбирает ключевые вопросы: Что обязательно оформить; Что проверить в документах; Где бывают ошибки; Когда писать запрос.\",\"Открытая часть материала: где искать официальный порядок перераспределения.\"]','Кадровые документы','Медицина','Новичок','Егор Григорьев',NULL,NULL,'2026-01-21',0,NULL,NULL,NULL,'Гостю: где искать официальный порядок перераспределения.','После входа: список документов и вопросов, которые нужно сверять по отраслевой процедуре.','2026-06-14 18:00:59','2026-06-14 19:00:59'),('news-2026-01-28-062','Прием в первые классы – 2026: памятка для педагога и администрации','Материал не дублирует родительскую памятку, а показывает, что школе важно подготовить по срокам, сайтам, горячим линиям и прозрачности приема.','[\"Редакция разбирает ключевые вопросы: Что меняется в процессе; Какие документы открыть; Как это влияет на педагога; Чек-лист действий.\",\"Открытая часть материала: ключевые даты и задачи школы.\"]','Педагогическая практика','Педагогика','Опытный','Ольга Савчук',NULL,NULL,'2026-01-28',0,NULL,NULL,NULL,'Гостю: ключевые даты и задачи школы.','После входа: чек-лист по сайту, документам, ответственным лицам и коммуникации.','2026-06-14 18:00:59','2026-06-14 19:00:59'),('news-2026-02-04-063','Социальные услуги на дому: что должен знать молодой специалист по социальной работе','Материал вводный, но опирается на официальные условия оказания социальных услуг и помогает быстро понять структуру системы.','[\"Редакция разбирает ключевые вопросы: Какие участники включаются; Какой алгоритм работает; Что нужно зафиксировать; Куда обращаться за поддержкой.\",\"Открытая часть материала: что такое социальные услуги на дому и где искать правила.\"]','Инклюзия и поддержка','Социальная работа','Новичок','Ирина Руденко',NULL,NULL,'2026-02-04',0,NULL,NULL,NULL,'Гостю: что такое социальные услуги на дому и где искать правила.','После входа: обзор маршрута клиента, условий оказания услуг и роли молодого специалиста.','2026-06-14 18:00:59','2026-06-14 19:00:59'),('news-2026-02-11-064','Итоговая аттестация-2026: что должен знать педагог до мая','Собрали в одном месте то, что педагогу важно проверить заранее: сроки, форматы, резервные дни и организационные роли.','[\"Редакция разбирает ключевые вопросы: Что меняется в процессе; Какие документы открыть; Как это влияет на педагога; Чек-лист действий.\",\"Открытая часть материала: краткая памятка по подготовке к итоговой аттестации.\"]','Педагогическая практика','Педагогика','Все','Ирина Руденко',NULL,NULL,'2026-02-11',1,NULL,NULL,NULL,'Гостю: краткая памятка по подготовке к итоговой аттестации.','После входа: календарь, распределение ролей и подборка документов для команды.','2026-06-14 18:00:59','2026-06-14 19:00:59'),('news-2026-02-18-065','ТЦСОН как база практики и трудоустройства: короткий путеводитель по системе','Публикация помогает студенту и выпускнику быстро понять, где искать учреждения системы социального обслуживания и как оценивать варианты практики.','[\"Редакция разбирает ключевые вопросы: Какие данные доступны; Как их читать без ошибок; Что это значит для специалиста; Как использовать в работе.\",\"Открытая часть материала: обзор системы ТЦСОН и возможных ролей.\"]','Аналитика и профориентация','Социальная работа','Новичок','Ксения Левчук',NULL,NULL,'2026-02-18',0,NULL,NULL,NULL,'Гостю: обзор системы ТЦСОН и возможных ролей.','После входа: поиск базы практики, знакомство с услугами и подготовка к собеседованию.','2026-06-14 18:00:59','2026-06-14 19:00:59'),('news-2026-02-25-066','ЦЭ-2026: инструкция для работы в аудитории без лишнего стресса','Материал для педагогов, которых назначили в аудитории: что взять с собой, что не делать и какие спорные ситуации лучше заранее проговорить с ответственными.','[\"Редакция разбирает ключевые вопросы: Что меняется в процессе; Какие документы открыть; Как это влияет на педагога; Чек-лист действий.\",\"Открытая часть материала: что помнить в день работы на ЦЭ.\"]','Педагогическая практика','Педагогика','Все','Елена Бурак',NULL,NULL,'2026-02-25',1,NULL,NULL,NULL,'Гостю: что помнить в день работы на ЦЭ.','После входа: алгоритм до начала экзамена, в аудитории и при нестандартных ситуациях.','2026-06-14 18:00:59','2026-06-14 19:00:59'),('news-2026-03-10-067','Целевой набор – 2026: как школе использовать новые возможности профориентации','Показываем, как данные по целевым местам можно перевести в школьную профориентацию, встречи с заказчиками кадров и разговоры с родителями.','[\"Редакция разбирает ключевые вопросы: Какие данные доступны; Как их читать без ошибок; Что это значит для специалиста; Как использовать в работе.\",\"Открытая часть материала: как использовать данные о целевом наборе в профориентации.\"]','Аналитика и профориентация','Педагогика','Опытный','Антон Жилин',NULL,NULL,'2026-03-10',0,NULL,NULL,NULL,'Гостю: как использовать данные о целевом наборе в профориентации.','После входа: сценарий встреч, публикаций на сайте школы и консультаций для семей.','2026-06-14 18:00:59','2026-06-14 19:00:59'),('news-2026-03-17-068','Рынок труда весной 2026 года: какие сигналы важны молодому специалисту','Без громких выводов разбираем, какие официальные индикаторы рынка труда стоит смотреть и что они реально говорят о ситуации для выпускника.','[\"Редакция разбирает ключевые вопросы: Какие данные доступны; Как их читать без ошибок; Что это значит для специалиста; Как использовать в работе.\",\"Открытая часть материала: сигналы рынка труда, понятные без спецподготовки.\"]','Аналитика и профориентация',NULL,'Все','Анастасия Ковалёва',NULL,NULL,'2026-03-17',0,NULL,NULL,NULL,'Гостю: сигналы рынка труда, понятные без спецподготовки.','После входа: динамика занятости, зарплат и ограничения статистики для карьерных решений.','2026-06-14 18:00:59','2026-06-14 19:00:59'),('news-2026-03-24-069','Поступление после профильных педагогических классов в 2026 году: что объяснить ученикам','Статья помогает педагогу и классному руководителю корректно рассказать выпускникам о возможностях и ограничениях поступления после профильных классов.','[\"Редакция разбирает ключевые вопросы: Что меняется в процессе; Какие документы открыть; Как это влияет на педагога; Чек-лист действий.\",\"Открытая часть материала: памятка для разговора с выпускниками профильных классов.\"]','Аналитика и профориентация','Педагогика','Все','Ксения Левчук',NULL,NULL,'2026-03-24',0,NULL,NULL,NULL,'Гостю: памятка для разговора с выпускниками профильных классов.','После входа: FAQ по собеседованию, документам и ожидаемым вопросам учеников.','2026-06-14 18:00:59','2026-06-14 19:00:59'),('news-2026-03-31-070','Зарплата в 2026 году: как читать оперативные данные Белстата без поспешных выводов','Материал объясняет разницу между средней зарплатой по стране, отраслевой динамикой и личной зарплатой конкретного работника.','[\"Редакция разбирает ключевые вопросы: Из чего состоит выплата или гарантия; Какие нормы действуют; Что проверить у себя; Когда задавать вопрос бухгалтерии.\",\"Открытая часть материала: что показывают оперативные данные Белстата.\"]','Оплата труда и гарантии',NULL,'Все','Никита Маркевич',NULL,NULL,'2026-03-31',0,NULL,NULL,NULL,'Гостю: что показывают оперативные данные Белстата.','После входа: чтение показателей, сезонности и региональных различий без неверных обобщений.','2026-06-14 18:00:59','2026-06-14 19:00:59'),('news-2026-04-07-071','2025/2026 учебный год завершается: какие документы и отчеты не забыть','Материал для администрации, классных руководителей и молодых педагогов о конце учебного года без лишней суеты и потери обязательных действий.','[\"Редакция разбирает ключевые вопросы: Что обязательно оформить; Что проверить в документах; Где бывают ошибки; Когда писать запрос.\",\"Открытая часть материала: короткий чек-лист завершения учебного года.\"]','Локальные документы и организация','Педагогика','Все','Марина Лапицкая',NULL,NULL,'2026-04-07',0,NULL,NULL,NULL,'Гостю: короткий чек-лист завершения учебного года.','После входа: перечень документов, сроков, сверок и внутренних задач на май–июнь.','2026-06-14 18:00:59','2026-06-14 19:00:59'),('news-2026-04-14-072','Несчастные случаи на производстве: новый порядок расследования и роль работодателя','Разбираем уже вступившие или вступающие изменения в расследовании, сохраняя акцент на обязанностях работодателя и фиксации обстоятельств.','[\"Редакция разбирает ключевые вопросы: Кого затрагивает правило; Обязанности нанимателя и работника; Какие журналы и акты проверить; Как зафиксировать выполнение.\",\"Открытая часть материала: роль работодателя в новом порядке расследования.\"]','Охрана труда и медосмотры','Право','Опытный','Ольга Савчук',NULL,NULL,'2026-04-14',0,NULL,NULL,NULL,'Гостю: роль работодателя в новом порядке расследования.','После входа: документы, сроки и действия организации при происшествии.','2026-06-14 18:00:59','2026-06-14 19:00:59'),('news-2026-04-21-073','Подготовка к 2026/2027 учебному году: с какого чек-листа начать июнь','Публикация нужна тем, кто отвечает за большой массив подготовительных действий и хочет быстро разделить их на обязательные, методические и организационные.','[\"Редакция разбирает ключевые вопросы: Что обязательно оформить; Что проверить в документах; Где бывают ошибки; Когда писать запрос.\",\"Открытая часть материала: стартовый июньский чек-лист.\"]','Локальные документы и организация','Педагогика','Опытный','Никита Маркевич',NULL,NULL,'2026-04-21',0,NULL,NULL,NULL,'Гостю: стартовый июньский чек-лист.','После входа: дорожная карта по сайтам, актам, кадрам, ресурсам и безопасности.','2026-06-14 18:00:59','2026-06-14 19:00:59'),('news-2026-04-28-074','Охрана труда при работе с офисным оборудованием: почему тема снова актуальна','Даже в офисной и школьной работе хватает формальных и реальных рисков; статья напоминает о правилах, инструкциях и типичных пробелах в организации.','[\"Редакция разбирает ключевые вопросы: Кого затрагивает правило; Обязанности нанимателя и работника; Какие журналы и акты проверить; Как зафиксировать выполнение.\",\"Открытая часть материала: памятка по безопасной работе с офисной техникой.\"]','Охрана труда и медосмотры',NULL,'Все','Марина Лапицкая',NULL,NULL,'2026-04-28',0,NULL,NULL,NULL,'Гостю: памятка по безопасной работе с офисной техникой.','После входа: чек-лист рабочего места, инструктажа и локальной инструкции.','2026-06-14 18:00:59','2026-06-14 19:00:59'),('news-2026-05-05-075','Интернет-безопасность детей: что меняется в разговорах с родителями в 2026 году','Материал опирается на свежие публичные разъяснения и предлагает школе практичный формат бесед с семьями без запугивания и морализаторства.','[\"Редакция разбирает ключевые вопросы: Какие участники включаются; Какой алгоритм работает; Что нужно зафиксировать; Куда обращаться за поддержкой.\",\"Открытая часть материала: тезисы для разговора школы с родителями о цифровой безопасности.\"]','Инклюзия и поддержка','Педагогика','Все','Редакция ПрофБазы',NULL,NULL,'2026-05-05',1,NULL,NULL,NULL,'Гостю: тезисы для разговора школы с родителями о цифровой безопасности.','После входа: сценарий классного часа и родительской встречи с памятками.','2026-06-14 18:00:59','2026-06-14 19:00:59'),('news-2026-05-12-076','Защита детей от негативного контента: что может сделать школа кроме формальных бесед','Публикация собирает реальные действия школы: маршрутизация сигналов, работа с родителями, цифровая гигиена и совместные правила класса.','[\"Редакция разбирает ключевые вопросы: Какие участники включаются; Какой алгоритм работает; Что нужно зафиксировать; Куда обращаться за поддержкой.\",\"Открытая часть материала: список практических действий школы по теме контента.\"]','Инклюзия и поддержка','Социальная работа','Все','Елена Бурак',NULL,NULL,'2026-05-12',0,NULL,NULL,NULL,'Гостю: список практических действий школы по теме контента.','После входа: пакет идей для классного руководителя, психолога и администрации.','2026-06-14 18:00:59','2026-06-14 19:00:59'),('news-2026-05-19-077','Персональные данные в школе в 2026 году: какие документы стоит перепроверить','Статья помогает провести короткий внутренний аудит: политика, согласия, сайт, фото, личные дела, журналы и обработка запросов субъектов данных.','[\"Редакция разбирает ключевые вопросы: Какие сервисы или правила действуют; Где границы по данным; Что оформить локально; Мини-чек-лист школы.\",\"Открытая часть материала: список документов для внутренней перепроверки.\"]','Цифровая среда и данные','Право','Опытный','Егор Григорьев',NULL,NULL,'2026-05-19',1,NULL,NULL,NULL,'Гостю: список документов для внутренней перепроверки.','После входа: большой чек-лист по процессам обработки и разграничению доступа.','2026-06-14 18:00:59','2026-06-14 19:00:59'),('news-2026-05-26-078','Закон о защите персональных данных могут менять: что отслеживать редакции и школе','Материал сознательно оставляет пространство для ручной проверки и показывает, какие обновления нужно мониторить перед публикацией справочных текстов.','[\"Редакция разбирает ключевые вопросы: Какие сервисы или правила действуют; Где границы по данным; Что оформить локально; Мини-чек-лист школы.\",\"Открытая часть материала: какие темы надо проверять по свежей редакции закона.\"]','Цифровая среда и данные','Право','Опытный','Антон Жилин',NULL,NULL,'2026-05-26',0,NULL,NULL,NULL,'Гостю: какие темы надо проверять по свежей редакции закона.','После входа: мониторинговый лист для редакции и школы с точками перепроверки.','2026-06-14 18:00:59','2026-06-14 19:00:59');
/*!40000 ALTER TABLE `news` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `news_gallery`
--

DROP TABLE IF EXISTS `news_gallery`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `news_gallery` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `news_id` varchar(64) NOT NULL,
  `url` text NOT NULL,
  `sort` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `idx_ng_news` (`news_id`),
  CONSTRAINT `fk_ng_news` FOREIGN KEY (`news_id`) REFERENCES `news` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `news_gallery`
--

LOCK TABLES `news_gallery` WRITE;
/*!40000 ALTER TABLE `news_gallery` DISABLE KEYS */;
/*!40000 ALTER TABLE `news_gallery` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `news_sources`
--

DROP TABLE IF EXISTS `news_sources`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `news_sources` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `news_id` varchar(64) NOT NULL,
  `label` varchar(255) NOT NULL,
  `url` text NOT NULL,
  `sort` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `idx_ns_news` (`news_id`),
  CONSTRAINT `fk_ns_news` FOREIGN KEY (`news_id`) REFERENCES `news` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=782 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `news_sources`
--

LOCK TABLES `news_sources` WRITE;
/*!40000 ALTER TABLE `news_sources` DISABLE KEYS */;
INSERT INTO `news_sources` VALUES (626,'news-2023-07-28-001','Кодекс об образовании','https://pravo.by/document/?guid=3871&p0=hk1100243',0),(627,'news-2023-07-28-001','Минобразования: молодые специалисты','https://edu.gov.by/news/za-kompetentnymi-molodymi-spetsialistami--budushchee-strany/',1),(628,'news-2023-08-02-002','Трудовой кодекс','https://pravo.by/document/?guid=3871&p0=hk9900296',0),(629,'news-2023-08-02-002','Минтруда: документы при приеме','https://www.mintrud.gov.by/ru/dokumenti-pri-zakluchenii-trudovogo-dogovora-ru',1),(630,'news-2023-08-09-003','Трудовой кодекс','https://pravo.by/document/?guid=3871&p0=hk9900296',0),(631,'news-2023-08-09-003','Минтруда: заключение контракта','https://www.mintrud.gov.by/ru/zakluchenie-kontakta-ru',1),(632,'news-2023-08-16-004','Трудовой кодекс','https://pravo.by/document/?guid=3871&p0=hk9900296',0),(633,'news-2023-08-16-004','Минтруда: предварительное испытание','https://www.mintrud.gov.by/ru/trud-dog-s-predv-ispitaniem-ru',1),(634,'news-2023-08-23-005','Минздрав: медосмотры работающих','https://minzdrav.gov.by/ru/dlya-spetsialistov/normativno-pravovaya-baza/baza-npa.php?ELEMENT_ID=334599',0),(635,'news-2023-08-23-005','Минтруда: медосмотр при приеме','https://www.mintrud.gov.by/special/ru/kategorii-lits-podlezhashih-med-osmotru-ru',1),(636,'news-2023-09-01-006','Минтруда: правила по охране труда','https://www.mintrud.gov.by/ru/pravila-po-ohrane-truda-ru',0),(637,'news-2023-09-01-006','Минтруда: типовые инструкции','https://www.mintrud.gov.by/ru/tipovye-instrukcii-po-ohrane-truda-ru',1),(638,'news-2023-09-12-007','Минтруда: суммирование трудовых отпусков','https://www.mintrud.gov.by/printv/ru/sum-trud-otpuskov-ru',0),(639,'news-2023-09-12-007','Трудовой кодекс','https://pravo.by/document/?guid=3871&p0=hk9900296',1),(640,'news-2023-09-26-008','Минтруда: оплата в бюджетной сфере','https://www.mintrud.gov.by/ru/oplata-truda-v-budzhetnoj-sfere-ru',0),(641,'news-2023-09-26-008','Белстат: зарплата','https://www.belstat.gov.by/ofitsialnaya-statistika/realny-sector-ekonomiki/stoimost-rabochey-sily/operativnye-dannye/o-nachislennoy-sredney-zarabotnoy-plate-rabotnikov/',1),(642,'news-2023-10-10-009','Минтруда: виды отпусков','https://www.mintrud.gov.by/ru/vidu-trud-otpuskov-ru',0),(643,'news-2023-10-10-009','Минтруда: педагогические отпуска','https://www.mintrud.gov.by/printv/ru/sum-trud-otpuskov-ru',1),(644,'news-2023-10-24-010','Трудовой кодекс','https://pravo.by/document/?guid=3871&p0=hk9900296',0),(645,'news-2023-10-24-010','Минтруда: корректировка ПВТР и форм договора','https://www.mintrud.gov.by/ru/news-ru/view/s-1-janvarja-2024-g-korrektirujutsja-primernaja-forma-trudovogo-dogovora-i-tipovye-pravila-vnutrennego-7687-2023/',1),(646,'news-2023-11-07-011','Минобразования: аттестация','https://edu.gov.by/sistema-obrazovaniya/upr-kadr/attestatsiya/',0),(647,'news-2023-11-07-011','Минобразования: допобразование взрослых','https://edu.gov.by/urovni-obrazovaniya/dopolnitelnoe-obrazovanie-vzroslykh/',1),(648,'news-2023-11-21-012','Минобразования: 2025/2026 учебный год','https://edu.gov.by/urovni-obrazovaniya/srenee-obr/srenee-obr/informatsiya/2025-2026-uchebnyy-god/',0),(649,'news-2023-11-21-012','Минобразования: ИМП 2025/2026','https://edu.gov.by/urovni-obrazovaniya/srenee-obr/srenee-obr/informatsiya/2025-2026-uchebnyy-god/%D0%98%D0%9C%D0%9F2025_2026.pdf',1),(650,'news-2023-12-05-013','Минобразования: 2025/2026 учебный год','https://edu.gov.by/urovni-obrazovaniya/srenee-obr/srenee-obr/informatsiya/2025-2026-uchebnyy-god/',0),(651,'news-2023-12-05-013','Минобразования: ИМП 2025/2026','https://edu.gov.by/urovni-obrazovaniya/srenee-obr/srenee-obr/informatsiya/2025-2026-uchebnyy-god/%D0%98%D0%9C%D0%9F2025_2026.pdf',1),(652,'news-2023-12-12-014','Минобразования: поддерживающая среда','https://edu.gov.by/news/v-shkolakh-belarusi-budet-vnedrena-model-druzhestvennaya-i-podderzhivayushchaya-sreda-v-uchrezhdeniya/',0),(653,'news-2023-12-12-014','Минобразования: практики педагогов-психологов','https://edu.gov.by/news/algoritmy-raboty-i-luchshie-praktiki-pedagogovpsikhologov-obsudili-na-respublikanskom-seminare/',1),(654,'news-2023-12-19-015','Минобразования: специальное образование','https://edu.gov.by/urovni-obrazovaniya/spetsialnoe-obrazovanie/spets-obr/',0),(655,'news-2023-12-19-015','Минобразования: практики педагогов-психологов','https://edu.gov.by/news/algoritmy-raboty-i-luchshie-praktiki-pedagogovpsikhologov-obsudili-na-respublikanskom-seminare/',1),(656,'news-2023-12-26-016','Минобразования: поддерживающая среда','https://edu.gov.by/news/v-shkolakh-belarusi-budet-vnedrena-model-druzhestvennaya-i-podderzhivayushchaya-sreda-v-uchrezhdeniya/',0),(657,'news-2023-12-26-016','Минобразования: практики педагогов-психологов','https://edu.gov.by/news/algoritmy-raboty-i-luchshie-praktiki-pedagogovpsikhologov-obsudili-na-respublikanskom-seminare/',1),(658,'news-2024-01-09-017','Минтруда: комментарий к Закону 2023 года','https://www.mintrud.gov.by/ru/komment-zakon-273z-ru',0),(659,'news-2024-01-09-017','Pravo.by: аналитика по изменениям ТК','https://pravo.by/novosti/analitika/2024/mart/77219/',1),(660,'news-2024-01-23-018','Минтруда: комментарий к Закону 2023 года','https://www.mintrud.gov.by/ru/komment-zakon-273z-ru',0),(661,'news-2024-01-23-018','Pravo.by: аналитика по изменениям ТК','https://pravo.by/novosti/analitika/2024/mart/77219/',1),(662,'news-2024-02-06-019','Минтруда: новые формы и ПВТР','https://www.mintrud.gov.by/ru/news-ru/view/s-1-janvarja-2024-g-korrektirujutsja-primernaja-forma-trudovogo-dogovora-i-tipovye-pravila-vnutrennego-7687-2023/',0),(663,'news-2024-02-06-019','Трудовой кодекс','https://pravo.by/document/?guid=3871&p0=hk9900296',1),(664,'news-2024-02-20-020','Трудовой кодекс','https://pravo.by/document/?guid=3871&p0=hk9900296',0),(665,'news-2024-02-20-020','Минтруда: трудовые книжки','https://mintrud.gov.by/ru/vedenie-trud-knizhek-ru',1),(666,'news-2024-03-05-021','Трудовой кодекс','https://pravo.by/document/?guid=3871&p0=hk9900296',0),(667,'news-2024-03-05-021','Минтруда: изменение трудового договора','https://www.mintrud.gov.by/ru/izmenenia_trydovogo_doovora',1),(668,'news-2024-03-19-022','Трудовой кодекс','https://pravo.by/document/?guid=3871&p0=hk9900296',0),(669,'news-2024-03-19-022','Минтруда: заключение трудового договора','https://www.mintrud.gov.by/ru/zaklychenie_trud_dogovora',1),(670,'news-2024-04-02-023','Трудовой кодекс','https://pravo.by/document/?guid=3871&p0=hk9900296',0),(671,'news-2024-04-02-023','Минтруда: перечень обязательных кадровых документов','https://www.mintrud.gov.by/special/ru/rekomendacii_po_perechnu_dokumentov_135',1),(672,'news-2024-04-16-024','Минтруда: виды отпусков','https://www.mintrud.gov.by/ru/vidu-trud-otpuskov-ru',0),(673,'news-2024-04-16-024','Минтруда: педагогические отпуска','https://www.mintrud.gov.by/printv/ru/sum-trud-otpuskov-ru',1),(674,'news-2024-05-07-025','Минобразования: аттестация','https://edu.gov.by/sistema-obrazovaniya/upr-kadr/attestatsiya/',0),(675,'news-2024-05-07-025','Минобразования: допобразование взрослых','https://edu.gov.by/urovni-obrazovaniya/dopolnitelnoe-obrazovanie-vzroslykh/',1),(676,'news-2024-05-21-026','Минобразования: допобразование взрослых','https://edu.gov.by/urovni-obrazovaniya/dopolnitelnoe-obrazovanie-vzroslykh/',0),(677,'news-2024-05-21-026','Минобразования: нормативная база допобразования','https://edu.gov.by/urovni-obrazovaniya/dopolnitelnoe-obrazovanie-vzroslykh/dop-obr/normativno-pravovoe-obespechenie/',1),(678,'news-2024-06-04-027','Минобразования: практики педагогов-психологов','https://edu.gov.by/news/algoritmy-raboty-i-luchshie-praktiki-pedagogovpsikhologov-obsudili-na-respublikanskom-seminare/',0),(679,'news-2024-06-04-027','Минобразования: поддерживающая среда','https://edu.gov.by/news/v-shkolakh-belarusi-budet-vnedrena-model-druzhestvennaya-i-podderzhivayushchaya-sreda-v-uchrezhdeniya/',1),(680,'news-2024-06-18-028','Минобразования: поддерживающая среда','https://edu.gov.by/news/v-shkolakh-belarusi-budet-vnedrena-model-druzhestvennaya-i-podderzhivayushchaya-sreda-v-uchrezhdeniya/',0),(681,'news-2024-06-18-028','Минобразования: практики педагогов-психологов','https://edu.gov.by/news/algoritmy-raboty-i-luchshie-praktiki-pedagogovpsikhologov-obsudili-na-respublikanskom-seminare/',1),(682,'news-2024-07-02-029','Минобразования: поддерживающая среда','https://edu.gov.by/news/v-shkolakh-belarusi-budet-vnedrena-model-druzhestvennaya-i-podderzhivayushchaya-sreda-v-uchrezhdeniya/',0),(683,'news-2024-07-02-029','Минобразования: практики педагогов-психологов','https://edu.gov.by/news/algoritmy-raboty-i-luchshie-praktiki-pedagogovpsikhologov-obsudili-na-respublikanskom-seminare/',1),(684,'news-2024-07-16-030','Минобразования: специальное образование','https://edu.gov.by/urovni-obrazovaniya/spetsialnoe-obrazovanie/spets-obr/',0),(685,'news-2024-07-16-030','Минобразования: практики педагогов-психологов','https://edu.gov.by/news/algoritmy-raboty-i-luchshie-praktiki-pedagogovpsikhologov-obsudili-na-respublikanskom-seminare/',1),(686,'news-2024-08-13-031','Минобразования: 2025/2026 учебный год','https://edu.gov.by/urovni-obrazovaniya/srenee-obr/srenee-obr/informatsiya/2025-2026-uchebnyy-god/',0),(687,'news-2024-08-13-031','Минобразования: ИМП 2025/2026','https://edu.gov.by/urovni-obrazovaniya/srenee-obr/srenee-obr/informatsiya/2025-2026-uchebnyy-god/%D0%98%D0%9C%D0%9F2025_2026.pdf',1),(688,'news-2024-08-27-032','Минобразования: ИМП 2025/2026','https://edu.gov.by/urovni-obrazovaniya/srenee-obr/srenee-obr/informatsiya/2025-2026-uchebnyy-god/%D0%98%D0%9C%D0%9F2025_2026.pdf',0),(689,'news-2024-08-27-032','Закон о персональных данных','https://pravo.by/document/?guid=3871&p0=H12100099',1),(690,'news-2024-09-10-033','Закон о персональных данных','https://pravo.by/document/?guid=3871&p0=H12100099',0),(691,'news-2024-09-10-033','НЦЗПД: примерная политика для школ','https://cpd.by/primernaja-politika-v-otnoshenii-obrabotki-personalnyh-dannyh-dlja-uoso-udo/',1),(692,'news-2024-09-24-034','Белстат: рынок труда','https://www.belstat.gov.by/ofitsialnaya-statistika/ssrd-mvf_2/tablitsy-svodnyh-dannyh/realnyi-sektor_2/rynok-truda_2/',0),(693,'news-2024-09-24-034','Белстат: зарплата','https://www.belstat.gov.by/ofitsialnaya-statistika/realny-sector-ekonomiki/stoimost-rabochey-sily/operativnye-dannye/o-nachislennoy-sredney-zarabotnoy-plate-rabotnikov/',1),(694,'news-2024-10-08-035','Трудовой кодекс','https://pravo.by/document/?guid=3871&p0=hk9900296',0),(695,'news-2024-10-08-035','Минтруда: заключение трудового договора','https://www.mintrud.gov.by/ru/zaklychenie_trud_dogovora',1),(696,'news-2024-10-22-036','Минтруда: правила по охране труда','https://www.mintrud.gov.by/ru/pravila-po-ohrane-truda-ru',0),(697,'news-2024-10-22-036','Минтруда: типовые инструкции','https://www.mintrud.gov.by/ru/tipovye-instrukcii-po-ohrane-truda-ru',1),(698,'news-2025-01-21-037','Закон № 46-З от 05.12.2024','https://pravo.by/document/?guid=3961&p0=H12400046',0),(699,'news-2025-01-21-037','Pravo.by: что изменилось','https://pravo.by/novosti/obshchestvenno-politicheskie-i-v-oblasti-prava/2025/maj/88846/',1),(700,'news-2025-02-04-038','Закон № 46-З от 05.12.2024','https://pravo.by/document/?guid=3961&p0=H12400046',0),(701,'news-2025-02-04-038','Минобразования: студенты и выпускники','https://edu.gov.by/urovni-obrazovaniya/vysshee-obrazovanie/studentam/',1),(702,'news-2025-03-11-039','Кодекс об образовании','https://pravo.by/document/?guid=3871&p0=hk1100243',0),(703,'news-2025-03-11-039','Минобразования: трудоустройство выпускников','https://edu.gov.by/news/trudoustroystvo-vypusknikov-uchrezhdeniy-vysshego-obrazovaniya-stabilnost-otvetstvennost-i-perspekti/',1),(704,'news-2025-03-25-040','Минобразования: целевой набор 2026','https://edu.gov.by/abiturientu-2026/tselevoy-nabor/',0),(705,'news-2025-03-25-040','Минобразования: новость о целевом наборе 2026','https://edu.gov.by/news/abiturientu-2026-tselevoy-nabor/',1),(706,'news-2025-04-08-041','Минобразования: целевой набор 2026','https://edu.gov.by/abiturientu-2026/tselevoy-nabor/',0),(707,'news-2025-04-08-041','Минобразования: трудоустройство выпускников','https://edu.gov.by/news/trudoustroystvo-vypusknikov-uchrezhdeniy-vysshego-obrazovaniya-stabilnost-otvetstvennost-i-perspekti/',1),(708,'news-2025-04-22-042','Минобразования: профориентационная работа','https://edu.gov.by/urovni-obrazovaniya/srenee-obr/srenee-obr/informatsiya/proforientatsionnaya-rabota-s-uchashchimisya/',0),(709,'news-2025-04-22-042','Минобразования: профильные классы','https://edu.gov.by/abiturientu-2026/vypusknikam-profilnykh-klassov-professionalnoy-napravlennosti/',1),(710,'news-2025-05-06-043','Минобразования: профориентационная работа','https://edu.gov.by/urovni-obrazovaniya/srenee-obr/srenee-obr/informatsiya/proforientatsionnaya-rabota-s-uchashchimisya/',0),(711,'news-2025-05-06-043','Минобразования: профильные классы','https://edu.gov.by/abiturientu-2026/vypusknikam-profilnykh-klassov-professionalnoy-napravlennosti/',1),(712,'news-2025-05-27-044','Минобразования: новость о трудовом воспитании','https://edu.gov.by/news/bolshe-praktiki-usilenie-nastavnichestva-i-razvitie-sovmestnykh-proektov-v-ministerstve-obrazovaniya/',0),(713,'news-2025-05-27-044','Минобразования: профориентационная работа','https://edu.gov.by/urovni-obrazovaniya/srenee-obr/srenee-obr/informatsiya/proforientatsionnaya-rabota-s-uchashchimisya/',1),(714,'news-2025-06-25-045','Минобразования: УЧИМсяВМЕСТЕ.БЕЛ','https://edu.gov.by/news/v-belarusi-zapustili-novyy-obrazovatelnyy-portal-dlya-pedagogov-uchimsyavmestebel1/',0),(715,'news-2025-06-25-045','Минобразования: онлайн-школа педагога','https://edu.gov.by/news/onlaynshkola-akademii-obrazovaniya--aktualnoe-predlozhenie-dlya-pedagogov/',1),(716,'news-2025-07-09-046','Минобразования: УЧИМсяВМЕСТЕ.БЕЛ','https://edu.gov.by/news/v-belarusi-zapustili-novyy-obrazovatelnyy-portal-dlya-pedagogov-uchimsyavmestebel1/',0),(717,'news-2025-07-09-046','Минобразования: онлайн-школа педагога','https://edu.gov.by/news/onlaynshkola-akademii-obrazovaniya--aktualnoe-predlozhenie-dlya-pedagogov/',1),(718,'news-2025-08-05-047','Минобразования: ИМП 2025/2026','https://edu.gov.by/urovni-obrazovaniya/srenee-obr/srenee-obr/informatsiya/2025-2026-uchebnyy-god/%D0%98%D0%9C%D0%9F2025_2026.pdf',0),(719,'news-2025-08-05-047','Минобразования: УЧИМсяВМЕСТЕ.БЕЛ','https://edu.gov.by/news/v-belarusi-zapustili-novyy-obrazovatelnyy-portal-dlya-pedagogov-uchimsyavmestebel1/',1),(720,'news-2025-08-19-048','Минобразования: ИМП 2025/2026','https://edu.gov.by/urovni-obrazovaniya/srenee-obr/srenee-obr/informatsiya/2025-2026-uchebnyy-god/%D0%98%D0%9C%D0%9F2025_2026.pdf',0),(721,'news-2025-08-19-048','Закон о персональных данных','https://pravo.by/document/?guid=3871&p0=H12100099',1),(722,'news-2025-09-02-049','Минобразования: 2025/2026 учебный год','https://edu.gov.by/urovni-obrazovaniya/srenee-obr/srenee-obr/informatsiya/2025-2026-uchebnyy-god/',0),(723,'news-2025-09-02-049','Минобразования: ИМП 2025/2026','https://edu.gov.by/urovni-obrazovaniya/srenee-obr/srenee-obr/informatsiya/2025-2026-uchebnyy-god/%D0%98%D0%9C%D0%9F2025_2026.pdf',1),(724,'news-2025-09-16-050','Минобразования: ИМП 2025/2026','https://edu.gov.by/urovni-obrazovaniya/srenee-obr/srenee-obr/informatsiya/2025-2026-uchebnyy-god/%D0%98%D0%9C%D0%9F2025_2026.pdf',0),(725,'news-2025-09-16-050','Закон о персональных данных','https://pravo.by/document/?guid=3871&p0=H12100099',1),(726,'news-2025-09-30-051','НЦЗПД: чек-лист для школ','https://cpd.by/chek-list-zashhita-personalnyh-dannyh-v-uchrezhdenii-obrazovanija-vazhnye-pravila/',0),(727,'news-2025-09-30-051','НЦЗПД: обновление рекомендаций по политике','https://cpd.by/metodologija-v-dejstvii-centrom-obnovleny-rekomendacii-po-sostavleniju-politiki-obrabotki-personalnyh-dannyh/',1),(728,'news-2025-10-14-052','Закон о персональных данных','https://pravo.by/document/?guid=3871&p0=H12100099',0),(729,'news-2025-10-14-052','НЦЗПД: примерная политика для школ','https://cpd.by/primernaja-politika-v-otnoshenii-obrabotki-personalnyh-dannyh-dlja-uoso-udo/',1),(730,'news-2025-10-28-053','Минобразования: ЦЭ 2025','https://edu.gov.by/tsentralizovannyy-ekzamen-2025/rekomendatsii-po-organizatsii-raboty-pedagogicheskikh-rabotnikov-v-auditorii-v-khode-provedeniya-tse/',0),(731,'news-2025-10-28-053','Минобразования: 2025/2026 учебный год','https://edu.gov.by/urovni-obrazovaniya/srenee-obr/srenee-obr/informatsiya/2025-2026-uchebnyy-god/',1),(732,'news-2025-11-11-054','Минтруда: правила по охране труда','https://www.mintrud.gov.by/ru/pravila-po-ohrane-truda-ru',0),(733,'news-2025-11-11-054','Минтруда: типовые инструкции','https://www.mintrud.gov.by/ru/tipovye-instrukcii-po-ohrane-truda-ru',1),(734,'news-2025-11-25-055','Минтруда: оплата в бюджетной сфере','https://www.mintrud.gov.by/ru/oplata-truda-v-budzhetnoj-sfere-ru',0),(735,'news-2025-11-25-055','Белстат: зарплата','https://www.belstat.gov.by/ofitsialnaya-statistika/realny-sector-ekonomiki/stoimost-rabochey-sily/operativnye-dannye/o-nachislennoy-sredney-zarabotnoy-plate-rabotnikov/',1),(736,'news-2025-12-09-056','Минтруда: оплата в бюджетной сфере','https://www.mintrud.gov.by/ru/oplata-truda-v-budzhetnoj-sfere-ru',0),(737,'news-2025-12-09-056','Pravo.by: оплата труда в сфере образования','https://pravo.by/document/?guid=12551&p0=W21934276',1),(738,'news-2025-12-16-057','Минтруда: изменения в расследовании','https://www.mintrud.gov.by/ru/news-ru/view/v-belarusi-rasshiren-krug-lits-i-sluchaev-dlja-rassledovanija-neschastnyx-sluchaev-na-proizvodstve-11531-2025/',0),(739,'news-2025-12-16-057','Минтруда: правила по охране труда','https://www.mintrud.gov.by/ru/pravila-po-ohrane-truda-ru',1),(740,'news-2025-12-23-058','Кодекс об образовании','https://pravo.by/document/?guid=3871&p0=hk1100243',0),(741,'news-2025-12-23-058','Минобразования: молодые специалисты','https://edu.gov.by/news/za-kompetentnymi-molodymi-spetsialistami--budushchee-strany/',1),(742,'news-2026-01-07-059','Минздрав: гарантии и компенсации','https://minzdrav.gov.by/ru/novoe-na-sayte/garantii-i-kompensatsii-dlya-molodykh-spetsialistov-i-vrachey-internov/',0),(743,'news-2026-01-07-059','Минздрав: центры поддержки интернов','https://minzdrav.gov.by/ru/novoe-na-sayte/v-meduniversitetakh-sozdayutsya-tsentry-podderzhki-molodykh-spetsialistov-i-internov/',1),(744,'news-2026-01-14-060','Минздрав: медосмотры работающих','https://minzdrav.gov.by/ru/dlya-spetsialistov/normativno-pravovaya-baza/baza-npa.php?ELEMENT_ID=334599',0),(745,'news-2026-01-14-060','Минздрав: изменения с 26 апреля 2026','https://minzdrav.gov.by/ru/novoe-na-sayte/26-aprelya-vstupyat-v-silu-izmeneniya-v-instruktsiyu-o-poryadke-provedeniya-obyazatelnykh-i-vneocher/',1),(746,'news-2026-01-21-061','Минздрав: распределение и перераспределение','https://minzdrav.gov.by/ru/dlya-spetsialistov/kadry-i-obrazovanie/raspredelenie-i-pereraspredelenie.php',0),(747,'news-2026-01-21-061','Кодекс об образовании','https://pravo.by/document/?guid=3871&p0=hk1100243',1),(748,'news-2026-01-28-062','Минобразования: прием в первые классы – 2026','https://edu.gov.by/news/priem-v-pervye-klassy--2026-glavnoe-dlya-roditeley/',0),(749,'news-2026-01-28-062','Минобразования: вопросы и ответы по 1 классу','https://edu.gov.by/urovni-obrazovaniya/srenee-obr/srenee-obr/informatsiya/voprosy-i-otvety-kasayushchiesya-postupleniya-rebenka-v-pervyy-klass/',1),(750,'news-2026-02-04-063','Минтруда: перечень ТЦСОН','https://www.mintrud.gov.by/ru/perechen-tcson-ru',0),(751,'news-2026-02-04-063','Минтруда: социальные услуги на дому','https://mintrud.gov.by/ru/socuslugi-na-domy-ru',1),(752,'news-2026-02-11-064','Минобразования: ЦЭ 2026','https://edu.gov.by/tsentralizovannyy-ekzamen/tsentralizovannyy-ekzamen-2026/',0),(753,'news-2026-02-11-064','Минобразования: итоговая аттестация 2026','https://edu.gov.by/news/itogovaya-attestatsiya2026-glavnoe-dlya-vypusknikov-i-roditeley/',1),(754,'news-2026-02-18-065','Минтруда: ТЦСОН','https://www.mintrud.gov.by/ru/tson-ru',0),(755,'news-2026-02-18-065','Минтруда: услуги дневного пребывания','https://www.mintrud.gov.by/ru/uslugi-dnevnogo-prebivania-ru',1),(756,'news-2026-02-25-066','Минобразования: ЦЭ 2026','https://edu.gov.by/tsentralizovannyy-ekzamen/tsentralizovannyy-ekzamen-2026/',0),(757,'news-2026-02-25-066','Минобразования: рекомендации для педагогов','https://edu.gov.by/tsentralizovannyy-ekzamen/tsentralizovannyy-ekzamen-2026/rekomendatsii-po-organizatsii-raboty-pedagogicheskikh-rabotnikov-v-auditorii-v-khode-provedeniya-tse/',1),(758,'news-2026-03-10-067','Минобразования: целевой набор 2026','https://edu.gov.by/abiturientu-2026/tselevoy-nabor/',0),(759,'news-2026-03-10-067','Минобразования: новость о целевом наборе 2026','https://edu.gov.by/news/abiturientu-2026-tselevoy-nabor/',1),(760,'news-2026-03-17-068','Белстат: рынок труда','https://www.belstat.gov.by/ofitsialnaya-statistika/ssrd-mvf_2/tablitsy-svodnyh-dannyh/realnyi-sektor_2/rynok-truda_2/',0),(761,'news-2026-03-17-068','Белстат: зарплата','https://www.belstat.gov.by/ofitsialnaya-statistika/realny-sector-ekonomiki/stoimost-rabochey-sily/operativnye-dannye/o-nachislennoy-sredney-zarabotnoy-plate-rabotnikov/',1),(762,'news-2026-03-24-069','Минобразования: профильные классы','https://edu.gov.by/abiturientu-2026/vypusknikam-profilnykh-klassov-professionalnoy-napravlennosti/',0),(763,'news-2026-03-24-069','Минобразования: профориентационная работа','https://edu.gov.by/urovni-obrazovaniya/srenee-obr/srenee-obr/informatsiya/proforientatsionnaya-rabota-s-uchashchimisya/',1),(764,'news-2026-03-31-070','Белстат: зарплата','https://www.belstat.gov.by/ofitsialnaya-statistika/realny-sector-ekonomiki/stoimost-rabochey-sily/operativnye-dannye/o-nachislennoy-sredney-zarabotnoy-plate-rabotnikov/',0),(765,'news-2026-03-31-070','Белстат: публикации и бюллетени','https://www.belstat.gov.by/ofitsialnaya-statistika/publications/izdania/public_bulletin/',1),(766,'news-2026-04-07-071','Минобразования: 2025/2026 учебный год','https://edu.gov.by/urovni-obrazovaniya/srenee-obr/srenee-obr/informatsiya/2025-2026-uchebnyy-god/',0),(767,'news-2026-04-07-071','Минобразования: завершение учебного года','https://edu.gov.by/urovni-obrazovaniya/srenee-obr/srenee-obr/informatsiya/zavershenie-2025-2026-uchebnogo-goda/',1),(768,'news-2026-04-14-072','Минтруда: изменения в расследовании','https://www.mintrud.gov.by/ru/news-ru/view/v-belarusi-rasshiren-krug-lits-i-sluchaev-dlja-rassledovanija-neschastnyx-sluchaev-na-proizvodstve-11531-2025/',0),(769,'news-2026-04-14-072','Минтруда: правила по охране труда','https://www.mintrud.gov.by/ru/pravila-po-ohrane-truda-ru',1),(770,'news-2026-04-21-073','Минобразования: 2025/2026 учебный год','https://edu.gov.by/urovni-obrazovaniya/srenee-obr/srenee-obr/informatsiya/2025-2026-uchebnyy-god/',0),(771,'news-2026-04-21-073','Минобразования: завершение учебного года','https://edu.gov.by/urovni-obrazovaniya/srenee-obr/srenee-obr/informatsiya/zavershenie-2025-2026-uchebnogo-goda/',1),(772,'news-2026-04-28-074','Pravo.by: офисное оборудование','https://pravo.by/document/?guid=12551&p0=W22136578p',0),(773,'news-2026-04-28-074','Минтруда: типовые инструкции','https://www.mintrud.gov.by/ru/tipovye-instrukcii-po-ohrane-truda-ru',1),(774,'news-2026-05-05-075','Минобразования: негативный контент','https://edu.gov.by/news/zashchita-detey-ot-negativnogo-kontenta-v-internete--odin-iz-prioritetov-sistemy-obrazovaniya/',0),(775,'news-2026-05-05-075','Детский правовой сайт: интернет и ребенок','https://mir.pravo.by/edu/internet-i-rebenok/',1),(776,'news-2026-05-12-076','Минобразования: негативный контент','https://edu.gov.by/news/zashchita-detey-ot-negativnogo-kontenta-v-internete--odin-iz-prioritetov-sistemy-obrazovaniya/',0),(777,'news-2026-05-12-076','Детский правовой сайт: интернет и ребенок','https://mir.pravo.by/edu/internet-i-rebenok/',1),(778,'news-2026-05-19-077','НЦЗПД: чек-лист для школ','https://cpd.by/chek-list-zashhita-personalnyh-dannyh-v-uchrezhdenii-obrazovanija-vazhnye-pravila/',0),(779,'news-2026-05-19-077','НЦЗПД: обновление рекомендаций по политике','https://cpd.by/metodologija-v-dejstvii-centrom-obnovleny-rekomendacii-po-sostavleniju-politiki-obrabotki-personalnyh-dannyh/',1),(780,'news-2026-05-26-078','Pravo.by: новации в Закон о персональных данных','https://pravo.by/novosti/obshchestvenno-politicheskie-i-v-oblasti-prava/2026/january/92092/',0),(781,'news-2026-05-26-078','Pravo.by: что изменится в Законе о персональных данных','https://pravo.by/novosti/obshchestvenno-politicheskie-i-v-oblasti-prava/2026/maj/93598/',1);
/*!40000 ALTER TABLE `news_sources` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `news_specialty_tags`
--

DROP TABLE IF EXISTS `news_specialty_tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `news_specialty_tags` (
  `news_id` varchar(64) NOT NULL,
  `tag_id` varchar(64) NOT NULL,
  PRIMARY KEY (`news_id`,`tag_id`),
  CONSTRAINT `fk_nst_news` FOREIGN KEY (`news_id`) REFERENCES `news` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `news_specialty_tags`
--

LOCK TABLES `news_specialty_tags` WRITE;
/*!40000 ALTER TABLE `news_specialty_tags` DISABLE KEYS */;
/*!40000 ALTER TABLE `news_specialty_tags` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `news_submissions`
--

DROP TABLE IF EXISTS `news_submissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `news_submissions` (
  `id` varchar(64) NOT NULL,
  `title` varchar(500) NOT NULL DEFAULT '',
  `article` longtext NOT NULL,
  `submitted_by_user_id` varchar(64) NOT NULL,
  `submitted_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `status` varchar(16) NOT NULL DEFAULT 'pending',
  `reviewed_at` timestamp NULL DEFAULT NULL,
  `reviewed_by_user_id` varchar(64) DEFAULT NULL,
  `reviewer_comment` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_sub_user` (`submitted_by_user_id`),
  KEY `idx_sub_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `news_submissions`
--

LOCK TABLES `news_submissions` WRITE;
/*!40000 ALTER TABLE `news_submissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `news_submissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `news_tags`
--

DROP TABLE IF EXISTS `news_tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `news_tags` (
  `news_id` varchar(64) NOT NULL,
  `tag` varchar(150) NOT NULL,
  PRIMARY KEY (`news_id`,`tag`),
  CONSTRAINT `fk_nt_news` FOREIGN KEY (`news_id`) REFERENCES `news` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `news_tags`
--

LOCK TABLES `news_tags` WRITE;
/*!40000 ALTER TABLE `news_tags` DISABLE KEYS */;
INSERT INTO `news_tags` VALUES ('news-2023-07-28-001','молодой специалист'),('news-2023-07-28-001','первое место'),('news-2023-07-28-001','распределение'),('news-2023-07-28-001','школа'),('news-2023-08-02-002','документы'),('news-2023-08-02-002','кадры'),('news-2023-08-02-002','прием на работу'),('news-2023-08-02-002','школа'),('news-2023-08-09-003','кадры'),('news-2023-08-09-003','контракт'),('news-2023-08-09-003','первое место'),('news-2023-08-09-003','трудовой договор'),('news-2023-08-16-004','испытательный срок'),('news-2023-08-16-004','молодой специалист'),('news-2023-08-16-004','право'),('news-2023-08-16-004','трудовой договор'),('news-2023-08-23-005','медосмотр'),('news-2023-08-23-005','охрана труда'),('news-2023-08-23-005','прием на работу'),('news-2023-08-23-005','справка'),('news-2023-09-01-006','безопасность'),('news-2023-09-01-006','инструктаж'),('news-2023-09-01-006','охрана труда'),('news-2023-09-01-006','школа'),('news-2023-09-12-007','дежурства'),('news-2023-09-12-007','нагрузка'),('news-2023-09-12-007','педагог'),('news-2023-09-12-007','рабочее время'),('news-2023-09-26-008','бюджетная сфера'),('news-2023-09-26-008','зарплата'),('news-2023-09-26-008','педагог'),('news-2023-09-26-008','расчетный листок'),('news-2023-10-10-009','график отпусков'),('news-2023-10-10-009','кадры'),('news-2023-10-10-009','отпуск'),('news-2023-10-10-009','педагог'),('news-2023-10-24-010','кадры'),('news-2023-10-24-010','локальные акты'),('news-2023-10-24-010','ПВТР'),('news-2023-10-24-010','школа'),('news-2023-11-07-011','адаптация'),('news-2023-11-07-011','молодой педагог'),('news-2023-11-07-011','наставничество'),('news-2023-11-07-011','профразвитие'),('news-2023-11-21-012','документация'),('news-2023-11-21-012','классное руководство'),('news-2023-11-21-012','новичок'),('news-2023-11-21-012','педагогика'),('news-2023-12-05-013','документация'),('news-2023-12-05-013','журнал'),('news-2023-12-05-013','планирование'),('news-2023-12-05-013','школа'),('news-2023-12-12-014','коммуникация'),('news-2023-12-12-014','конфликт'),('news-2023-12-12-014','родители'),('news-2023-12-12-014','служебная записка'),('news-2023-12-19-015','инклюзия'),('news-2023-12-19-015','команда сопровождения'),('news-2023-12-19-015','ОПФР'),('news-2023-12-19-015','педагог'),('news-2023-12-26-016','безопасность'),('news-2023-12-26-016','кризисная ситуация'),('news-2023-12-26-016','педагог-психолог'),('news-2023-12-26-016','школа'),('news-2024-01-09-017','изменения 2024'),('news-2024-01-09-017','право'),('news-2024-01-09-017','работник'),('news-2024-01-09-017','Трудовой кодекс'),('news-2024-01-23-018','выплаты'),('news-2024-01-23-018','зарплата'),('news-2024-01-23-018','изменения 2024'),('news-2024-01-23-018','Трудовой кодекс'),('news-2024-02-06-019','изменения 2024'),('news-2024-02-06-019','локальные акты'),('news-2024-02-06-019','ПВТР'),('news-2024-02-06-019','трудовой договор'),('news-2024-02-20-020','записи'),('news-2024-02-20-020','кадры'),('news-2024-02-20-020','прием на работу'),('news-2024-02-20-020','трудовая книжка'),('news-2024-03-05-021','изменение работы'),('news-2024-03-05-021','право'),('news-2024-03-05-021','работник'),('news-2024-03-05-021','существенные условия труда'),('news-2024-03-19-022','замены'),('news-2024-03-19-022','нагрузка'),('news-2024-03-19-022','совместительство'),('news-2024-03-19-022','совмещение'),('news-2024-04-02-023','коллективный договор'),('news-2024-04-02-023','локальные акты'),('news-2024-04-02-023','льготы'),('news-2024-04-02-023','школа'),('news-2024-04-16-024','весна'),('news-2024-04-16-024','график'),('news-2024-04-16-024','отпуск'),('news-2024-04-16-024','педагог'),('news-2024-05-07-025','аттестация'),('news-2024-05-07-025','квалификационная категория'),('news-2024-05-07-025','педагог'),('news-2024-05-07-025','планирование'),('news-2024-05-21-026','педагог'),('news-2024-05-21-026','переподготовка'),('news-2024-05-21-026','повышение квалификации'),('news-2024-05-21-026','стажировка'),('news-2024-06-04-027','выгорание'),('news-2024-06-04-027','педагог'),('news-2024-06-04-027','психологическая помощь'),('news-2024-06-04-027','самопомощь'),('news-2024-06-18-028','буллинг'),('news-2024-06-18-028','классный руководитель'),('news-2024-06-18-028','поддерживающая среда'),('news-2024-06-18-028','школа'),('news-2024-07-02-029','алгоритм'),('news-2024-07-02-029','буллинг'),('news-2024-07-02-029','профилактика'),('news-2024-07-02-029','школа'),('news-2024-07-16-030','инклюзивное образование'),('news-2024-07-16-030','методическая поддержка'),('news-2024-07-16-030','ОПФР'),('news-2024-07-16-030','педагог'),('news-2024-08-13-031','данные'),('news-2024-08-13-031','цифровизация'),('news-2024-08-13-031','электронный дневник'),('news-2024-08-13-031','электронный журнал'),('news-2024-08-27-032','локальные требования'),('news-2024-08-27-032','обновления'),('news-2024-08-27-032','официальная информация'),('news-2024-08-27-032','сайт школы'),('news-2024-09-10-033','персональные данные'),('news-2024-09-10-033','политика'),('news-2024-09-10-033','сайт'),('news-2024-09-10-033','школа'),('news-2024-09-24-034','Белстат'),('news-2024-09-24-034','вакансии'),('news-2024-09-24-034','профориентация'),('news-2024-09-24-034','рынок труда'),('news-2024-10-08-035','обращение'),('news-2024-10-08-035','профсоюз'),('news-2024-10-08-035','руководитель'),('news-2024-10-08-035','условия труда'),('news-2024-10-22-036','безопасность'),('news-2024-10-22-036','инцидент'),('news-2024-10-22-036','работа'),('news-2024-10-22-036','фиксация фактов'),('news-2025-01-21-037','изменения 2025'),('news-2025-01-21-037','Кодекс об образовании'),('news-2025-01-21-037','молодой специалист'),('news-2025-01-21-037','право'),('news-2025-02-04-038','кодекс'),('news-2025-02-04-038','платное обучение'),('news-2025-02-04-038','распределение'),('news-2025-02-04-038','статус молодого специалиста'),('news-2025-03-11-039','вуз'),('news-2025-03-11-039','выпуск'),('news-2025-03-11-039','направление на работу'),('news-2025-03-11-039','распределение'),('news-2025-03-25-040','заказчик кадров'),('news-2025-03-25-040','педагогика'),('news-2025-03-25-040','поступление'),('news-2025-03-25-040','целевая подготовка'),('news-2025-04-08-041','заказчик кадров'),('news-2025-04-08-041','практика'),('news-2025-04-08-041','работодатель'),('news-2025-04-08-041','школа'),('news-2025-04-22-042','абитуриент'),('news-2025-04-22-042','педагогические классы'),('news-2025-04-22-042','профориентация'),('news-2025-04-22-042','школа'),('news-2025-05-06-043','X-XI классы'),('news-2025-05-06-043','педагог'),('news-2025-05-06-043','профессиональная подготовка'),('news-2025-05-06-043','профориентация'),('news-2025-05-27-044','методические рекомендации'),('news-2025-05-27-044','педагогика'),('news-2025-05-27-044','трудовое воспитание'),('news-2025-05-27-044','школа'),('news-2025-06-25-045','молодой педагог'),('news-2025-06-25-045','развитие'),('news-2025-06-25-045','ресурсы'),('news-2025-06-25-045','УЧИМсяВМЕСТЕ.БЕЛ'),('news-2025-07-09-046','вебинары'),('news-2025-07-09-046','онлайн-школа'),('news-2025-07-09-046','педагог'),('news-2025-07-09-046','профразвитие'),('news-2025-08-05-047','искусственный интеллект'),('news-2025-08-05-047','методика'),('news-2025-08-05-047','педагог'),('news-2025-08-05-047','цифровизация'),('news-2025-08-19-048','2025/2026'),('news-2025-08-19-048','администрация'),('news-2025-08-19-048','сайт школы'),('news-2025-08-19-048','чек-лист'),('news-2025-09-02-049','ЕИОР'),('news-2025-09-02-049','учебные ресурсы'),('news-2025-09-02-049','электронные пособия'),('news-2025-09-02-049','ЭОР'),('news-2025-09-16-050','карта учащегося'),('news-2025-09-16-050','цифровые сервисы'),('news-2025-09-16-050','электронный дневник'),('news-2025-09-16-050','электронный журнал'),('news-2025-09-30-051','локальные документы'),('news-2025-09-30-051','НЦЗПД'),('news-2025-09-30-051','персональные данные'),('news-2025-09-30-051','школа'),('news-2025-10-14-052','политика обработки данных'),('news-2025-10-14-052','право'),('news-2025-10-14-052','шаблон'),('news-2025-10-14-052','школа'),('news-2025-10-28-053','организация'),('news-2025-10-28-053','педагог в аудитории'),('news-2025-10-28-053','ЦЭ'),('news-2025-10-28-053','экзамен'),('news-2025-11-11-054','инструкции'),('news-2025-11-11-054','охрана труда'),('news-2025-11-11-054','подготовка к году'),('news-2025-11-11-054','школа'),('news-2025-11-25-055','базовая ставка'),('news-2025-11-25-055','бюджетная сфера'),('news-2025-11-25-055','зарплата'),('news-2025-11-25-055','образование'),('news-2025-12-09-056','локальные акты'),('news-2025-12-09-056','надбавки'),('news-2025-12-09-056','стимулирующие выплаты'),('news-2025-12-09-056','тарифный разряд'),('news-2025-12-16-057','изменения 2026'),('news-2025-12-16-057','несчастный случай'),('news-2025-12-16-057','охрана труда'),('news-2025-12-16-057','расследование'),('news-2025-12-23-058','жилье'),('news-2025-12-23-058','молодой специалист'),('news-2025-12-23-058','поддержка'),('news-2025-12-23-058','сельская местность'),('news-2026-01-07-059','гарантии'),('news-2026-01-07-059','здравоохранение'),('news-2026-01-07-059','Минздрав'),('news-2026-01-07-059','молодой специалист'),('news-2026-01-14-060','здоровье'),('news-2026-01-14-060','изменения 2026'),('news-2026-01-14-060','медосмотры'),('news-2026-01-14-060','работник'),('news-2026-01-21-061','выпускник'),('news-2026-01-21-061','здравоохранение'),('news-2026-01-21-061','официальный порядок'),('news-2026-01-21-061','перераспределение'),('news-2026-01-28-062','администрация'),('news-2026-01-28-062','первый класс'),('news-2026-01-28-062','прием 2026'),('news-2026-01-28-062','школа'),('news-2026-02-04-063','социальная работа'),('news-2026-02-04-063','социальные услуги'),('news-2026-02-04-063','ТЦСОН'),('news-2026-02-04-063','услуги на дому'),('news-2026-02-11-064','итоговая аттестация'),('news-2026-02-11-064','педагог'),('news-2026-02-11-064','школа'),('news-2026-02-11-064','экзамены'),('news-2026-02-18-065','практика'),('news-2026-02-18-065','социальная работа'),('news-2026-02-18-065','трудоустройство'),('news-2026-02-18-065','ТЦСОН'),('news-2026-02-25-066','аудитория'),('news-2026-02-25-066','инструкция'),('news-2026-02-25-066','педагог'),('news-2026-02-25-066','ЦЭ-2026'),('news-2026-03-10-067','поступление'),('news-2026-03-10-067','профориентация'),('news-2026-03-10-067','целевой набор'),('news-2026-03-10-067','школа'),('news-2026-03-17-068','аналитика'),('news-2026-03-17-068','Белстат'),('news-2026-03-17-068','молодой специалист'),('news-2026-03-17-068','рынок труда'),('news-2026-03-24-069','педагогические классы'),('news-2026-03-24-069','поступление'),('news-2026-03-24-069','собеседование'),('news-2026-03-24-069','ученики'),('news-2026-03-31-070','Белстат'),('news-2026-03-31-070','бюджетная сфера'),('news-2026-03-31-070','данные'),('news-2026-03-31-070','зарплата'),('news-2026-04-07-071','документы'),('news-2026-04-07-071','конец учебного года'),('news-2026-04-07-071','отчеты'),('news-2026-04-07-071','школа'),('news-2026-04-14-072','несчастный случай'),('news-2026-04-14-072','охрана труда'),('news-2026-04-14-072','работодатель'),('news-2026-04-14-072','расследование'),('news-2026-04-21-073','администрация'),('news-2026-04-21-073','новый учебный год'),('news-2026-04-21-073','подготовка'),('news-2026-04-21-073','чек-лист'),('news-2026-04-28-074','инструкция'),('news-2026-04-28-074','офисное оборудование'),('news-2026-04-28-074','охрана труда'),('news-2026-04-28-074','рабочее место'),('news-2026-05-05-075','дети'),('news-2026-05-05-075','интернет-безопасность'),('news-2026-05-05-075','родители'),('news-2026-05-05-075','цифровая среда'),('news-2026-05-12-076','дети'),('news-2026-05-12-076','негативный контент'),('news-2026-05-12-076','профилактика'),('news-2026-05-12-076','школа'),('news-2026-05-19-077','аудит'),('news-2026-05-19-077','документы'),('news-2026-05-19-077','персональные данные'),('news-2026-05-19-077','школа'),('news-2026-05-26-078','изменения закона'),('news-2026-05-26-078','мониторинг'),('news-2026-05-26-078','персональные данные'),('news-2026-05-26-078','редакция');
/*!40000 ALTER TABLE `news_tags` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notification_dismissals`
--

DROP TABLE IF EXISTS `notification_dismissals`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `notification_dismissals` (
  `notification_id` varchar(64) NOT NULL,
  `user_id` varchar(64) NOT NULL,
  `dismissed_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`notification_id`,`user_id`),
  CONSTRAINT `fk_nd_notif` FOREIGN KEY (`notification_id`) REFERENCES `notifications` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notification_dismissals`
--

LOCK TABLES `notification_dismissals` WRITE;
/*!40000 ALTER TABLE `notification_dismissals` DISABLE KEYS */;
/*!40000 ALTER TABLE `notification_dismissals` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notification_roles`
--

DROP TABLE IF EXISTS `notification_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `notification_roles` (
  `notification_id` varchar(64) NOT NULL,
  `role` varchar(32) NOT NULL,
  PRIMARY KEY (`notification_id`,`role`),
  CONSTRAINT `fk_nr_notif` FOREIGN KEY (`notification_id`) REFERENCES `notifications` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notification_roles`
--

LOCK TABLES `notification_roles` WRITE;
/*!40000 ALTER TABLE `notification_roles` DISABLE KEYS */;
/*!40000 ALTER TABLE `notification_roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notification_users`
--

DROP TABLE IF EXISTS `notification_users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `notification_users` (
  `notification_id` varchar(64) NOT NULL,
  `user_id` varchar(64) NOT NULL,
  PRIMARY KEY (`notification_id`,`user_id`),
  CONSTRAINT `fk_nu_notif` FOREIGN KEY (`notification_id`) REFERENCES `notifications` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notification_users`
--

LOCK TABLES `notification_users` WRITE;
/*!40000 ALTER TABLE `notification_users` DISABLE KEYS */;
/*!40000 ALTER TABLE `notification_users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `notifications` (
  `id` varchar(64) NOT NULL,
  `title` varchar(500) NOT NULL,
  `message` text NOT NULL,
  `sender_label` varchar(255) NOT NULL DEFAULT '',
  `organization_id` varchar(64) DEFAULT NULL,
  `scope` varchar(32) NOT NULL DEFAULT 'all',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_notif_org` (`organization_id`),
  KEY `idx_notif_scope` (`scope`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES ('notif-org-1','Методический день в средней школе №12','Организационное тестовое уведомление видно только сотрудникам средней школы №12.','Средняя школа №12','org-1234','organization','2026-06-01 09:00:00'),('notif-site-1','Добро пожаловать в обновленную ПрофБазу','Глобальное тестовое уведомление видно всем пользователям портала.','Администрация сайта',NULL,'all','2026-06-01 08:00:00');
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `org_creation_requests`
--

DROP TABLE IF EXISTS `org_creation_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `org_creation_requests` (
  `id` varchar(64) NOT NULL,
  `user_id` varchar(64) NOT NULL,
  `short_name` varchar(255) NOT NULL,
  `full_name` varchar(500) NOT NULL,
  `description` text NOT NULL,
  `status` varchar(16) NOT NULL DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `reviewed_at` timestamp NULL DEFAULT NULL,
  `reviewed_by_user_id` varchar(64) DEFAULT NULL,
  `comment` text DEFAULT NULL,
  `created_organization_id` varchar(64) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_ocr_user` (`user_id`),
  KEY `idx_ocr_status` (`status`),
  CONSTRAINT `fk_ocr_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`public_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `org_creation_requests`
--

LOCK TABLES `org_creation_requests` WRITE;
/*!40000 ALTER TABLE `org_creation_requests` DISABLE KEYS */;
INSERT INTO `org_creation_requests` VALUES ('org-req-1','u-user','Гимназия №5','ГУО «Гимназия № 5 г. Минска»','Хотим подключить организацию для методической работы и документов.','pending','2026-06-08 11:00:00',NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `org_creation_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `org_specialty_tags`
--

DROP TABLE IF EXISTS `org_specialty_tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `org_specialty_tags` (
  `organization_id` varchar(64) NOT NULL,
  `tag_id` varchar(64) NOT NULL,
  PRIMARY KEY (`organization_id`,`tag_id`),
  CONSTRAINT `fk_ost_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `org_specialty_tags`
--

LOCK TABLES `org_specialty_tags` WRITE;
/*!40000 ALTER TABLE `org_specialty_tags` DISABLE KEYS */;
INSERT INTO `org_specialty_tags` VALUES ('org-1234','tag-teacher'),('org-lyceum','tag-general'),('org-lyceum','tag-teacher');
/*!40000 ALTER TABLE `org_specialty_tags` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `organizations`
--

DROP TABLE IF EXISTS `organizations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `organizations` (
  `id` varchar(64) NOT NULL,
  `short_name` varchar(255) NOT NULL,
  `full_name` varchar(500) NOT NULL,
  `description` text NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `organizations`
--

LOCK TABLES `organizations` WRITE;
/*!40000 ALTER TABLE `organizations` DISABLE KEYS */;
INSERT INTO `organizations` VALUES ('org-1234','Средняя школа №12','ГУО «Средняя школа № 12 г. Минска»','Учреждение общего среднего образования с профильными методическими материалами для педагогов.',1,'2025-09-01 07:00:00','2026-06-14 19:00:59'),('org-lyceum','Лицей «Сфера»','ГУО «Лицей «Сфера» г. Минска»','Лицей с углубленным изучением математики и информатики.',1,'2025-10-10 07:00:00','2026-06-14 19:00:59');
/*!40000 ALTER TABLE `organizations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `roles` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `is_system` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'Гость',1),(2,'Пользователь',1),(3,'Модератор контента',1),(4,'Администратор организации',1),(5,'Суперадминистратор',1),(6,'Редактор',1);
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sections`
--

DROP TABLE IF EXISTS `sections`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sections` (
  `id` varchar(64) NOT NULL,
  `organization_id` varchar(64) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `kind` varchar(16) NOT NULL DEFAULT 'common',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_sec_org` (`organization_id`),
  CONSTRAINT `fk_sec_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sections`
--

LOCK TABLES `sections` WRITE;
/*!40000 ALTER TABLE `sections` DISABLE KEYS */;
INSERT INTO `sections` VALUES ('sec-common','org-1234','Общие документы','Документы, доступные всем участникам организации.','common','2026-06-14 19:00:59'),('sec-informatics','org-1234','Информатика','Материалы для преподавателей информатики.','specialized','2026-06-14 19:00:59'),('sec-math','org-1234','Математика','Материалы для преподавателей математики.','specialized','2026-06-14 19:00:59'),('sec-methods','org-1234','Методические материалы','Методические документы и рекомендации.','specialized','2026-06-14 19:00:59'),('sec-plans','org-1234','Учебные планы','Планы, календарно-тематические графики и рабочие программы.','specialized','2026-06-14 19:00:59');
/*!40000 ALTER TABLE `sections` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `site_settings`
--

DROP TABLE IF EXISTS `site_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `site_settings` (
  `id` tinyint(4) NOT NULL DEFAULT 1,
  `portal_name` varchar(255) NOT NULL DEFAULT 'ПрофБаза',
  `important_note_title` varchar(255) NOT NULL DEFAULT '',
  `first_login_help_title` varchar(255) NOT NULL DEFAULT '',
  `support_email` varchar(255) NOT NULL DEFAULT '',
  `maintenance_mode` tinyint(1) NOT NULL DEFAULT 0,
  `global_banner` text DEFAULT NULL,
  `demo_mode` tinyint(1) NOT NULL DEFAULT 1,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  CONSTRAINT `chk_settings_singleton` CHECK (`id` = 1)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `site_settings`
--

LOCK TABLES `site_settings` WRITE;
/*!40000 ALTER TABLE `site_settings` DISABLE KEYS */;
INSERT INTO `site_settings` VALUES (1,'ПрофБаза','Важная информация','Помощь при первом входе','info@profbaza.by',0,NULL,1,'2026-06-14 15:30:22');
/*!40000 ALTER TABLE `site_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `social_accounts`
--

DROP TABLE IF EXISTS `social_accounts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `social_accounts` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(10) unsigned NOT NULL,
  `provider` varchar(50) NOT NULL,
  `provider_user_id` varchar(255) NOT NULL,
  `provider_email` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_provider_user` (`provider`,`provider_user_id`),
  KEY `fk_social_user` (`user_id`),
  CONSTRAINT `fk_social_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `social_accounts`
--

LOCK TABLES `social_accounts` WRITE;
/*!40000 ALTER TABLE `social_accounts` DISABLE KEYS */;
INSERT INTO `social_accounts` VALUES (1,2,'google','110077129040482246343','ddaby512@gmail.com','2026-05-28 02:05:14'),(2,2,'yandex','2317532358','satoruugod@yandex.ru','2026-05-28 02:05:22');
/*!40000 ALTER TABLE `social_accounts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `specialty_tags`
--

DROP TABLE IF EXISTS `specialty_tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `specialty_tags` (
  `id` varchar(64) NOT NULL,
  `organization_id` varchar(64) DEFAULT NULL,
  `name` varchar(150) NOT NULL,
  `description` text NOT NULL,
  `color` varchar(32) NOT NULL DEFAULT '',
  `features` longtext NOT NULL DEFAULT '{}',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_spec_org` (`organization_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `specialty_tags`
--

LOCK TABLES `specialty_tags` WRITE;
/*!40000 ALTER TABLE `specialty_tags` DISABLE KEYS */;
INSERT INTO `specialty_tags` VALUES ('tag-general',NULL,'Общий специалист','Базовый набор кабинета без журнала. Подходит для непедагогических специальностей.','#64748B','{\"diary\":true,\"calendar\":true,\"notes\":true,\"documents\":true,\"journal\":false}','2026-05-20 09:00:00','2026-06-14 19:00:59'),('tag-teacher',NULL,'Преподаватель','Педагогические материалы, КТП, дневник, календарь и расширенный журнал.','#2563EB','{\"diary\":true,\"calendar\":true,\"notes\":true,\"documents\":true,\"journal\":true}','2026-05-20 09:00:00','2026-06-14 19:00:59');
/*!40000 ALTER TABLE `specialty_tags` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `support_attachments`
--

DROP TABLE IF EXISTS `support_attachments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `support_attachments` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `ticket_id` varchar(64) NOT NULL,
  `name` varchar(255) NOT NULL,
  `type` varchar(100) NOT NULL DEFAULT '',
  `data_url` longtext NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_sa_ticket` (`ticket_id`),
  CONSTRAINT `fk_sa_ticket` FOREIGN KEY (`ticket_id`) REFERENCES `support_tickets` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `support_attachments`
--

LOCK TABLES `support_attachments` WRITE;
/*!40000 ALTER TABLE `support_attachments` DISABLE KEYS */;
/*!40000 ALTER TABLE `support_attachments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `support_tickets`
--

DROP TABLE IF EXISTS `support_tickets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `support_tickets` (
  `id` varchar(64) NOT NULL,
  `user_id` varchar(64) NOT NULL,
  `organization_id` varchar(64) DEFAULT NULL,
  `subject` varchar(500) NOT NULL,
  `message` text NOT NULL,
  `status` varchar(16) NOT NULL DEFAULT 'open',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `reviewed_at` timestamp NULL DEFAULT NULL,
  `reviewed_by_user_id` varchar(64) DEFAULT NULL,
  `admin_response` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_st_user` (`user_id`),
  KEY `idx_st_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `support_tickets`
--

LOCK TABLES `support_tickets` WRITE;
/*!40000 ALTER TABLE `support_tickets` DISABLE KEYS */;
INSERT INTO `support_tickets` VALUES ('ticket-1','u-org-admin','org-1234','Не отображается часть документов','У некоторых преподавателей не открывается раздел «Методические материалы». Подскажите, как настроить доступ.','open','2026-06-05 08:30:00',NULL,NULL,NULL);
/*!40000 ALTER TABLE `support_tickets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_favorites`
--

DROP TABLE IF EXISTS `user_favorites`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_favorites` (
  `user_id` varchar(64) NOT NULL,
  `item_id` varchar(128) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`user_id`,`item_id`),
  CONSTRAINT `fk_fav_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`public_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_favorites`
--

LOCK TABLES `user_favorites` WRITE;
/*!40000 ALTER TABLE `user_favorites` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_favorites` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_specialty_tags`
--

DROP TABLE IF EXISTS `user_specialty_tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_specialty_tags` (
  `user_id` varchar(64) NOT NULL,
  `tag_id` varchar(64) NOT NULL,
  PRIMARY KEY (`user_id`,`tag_id`),
  KEY `idx_ust_tag` (`tag_id`),
  CONSTRAINT `fk_ust_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`public_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_specialty_tags`
--

LOCK TABLES `user_specialty_tags` WRITE;
/*!40000 ALTER TABLE `user_specialty_tags` DISABLE KEYS */;
INSERT INTO `user_specialty_tags` VALUES ('u-org-admin','tag-teacher'),('u-teacher-approved','tag-teacher'),('u-teacher-pending','tag-teacher'),('u-user','tag-general');
/*!40000 ALTER TABLE `user_specialty_tags` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `public_id` varchar(64) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `password_hash` varchar(255) DEFAULT NULL,
  `name` varchar(255) NOT NULL DEFAULT '',
  `avatar` varchar(500) DEFAULT NULL,
  `email_verified` tinyint(1) NOT NULL DEFAULT 0,
  `specialization` varchar(100) DEFAULT NULL,
  `subject` varchar(150) DEFAULT NULL,
  `is_young_specialist` tinyint(1) NOT NULL DEFAULT 0,
  `is_first_employment` tinyint(1) NOT NULL DEFAULT 0,
  `role_id` int(10) unsigned DEFAULT NULL,
  `site_role` varchar(32) DEFAULT NULL,
  `api_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `is_banned` tinyint(1) NOT NULL DEFAULT 0,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `api_token` (`api_token`),
  UNIQUE KEY `uq_users_public_id` (`public_id`),
  KEY `fk_user_role` (`role_id`),
  CONSTRAINT `fk_user_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=45 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'1','admin@profbaza.ru','$2y$10$GlcCddAnTtlLHMpfCqVk9OikjdS6DlrmGqDTvHocXEDAODmPKuxY6','Соколова Мария Викторовна',NULL,0,NULL,NULL,0,0,5,'site_admin','0880743e49800fd9b90698b6223d375840ac71ae50344d6aa47952d17d0b58fe','2026-05-28 01:33:02',0,'2026-06-14 18:25:43'),(2,'2','ddaby512@gmail.com',NULL,'mired s','https://lh3.googleusercontent.com/a/ACg8ocK2ViKuoONZwAVF0PLeiHwV1Bh4eWm3xLKVzLOBTiZwY9-pJ1g=s96-c',1,NULL,NULL,0,0,2,'user','dca6e84d603f5485a768ca5cafaa407e3d66e4f0e593e3f602d857b61b68fa16','2026-05-28 02:05:14',0,'2026-06-14 18:25:43'),(3,'3','belov@example.ru','$2y$10$hlRjcVUkhZvDE3xqfvAhb.BfcecdgQXCFb6eSsv78X.eBO2HQmXwC','цуцуй цу',NULL,0,'',NULL,0,0,2,'user','12589da3a6f51983d6c83e3b501796701a7c66dfdfc312c44690faf98c12e098','2026-05-28 02:32:00',0,'2026-06-14 18:25:43'),(5,'5','editor@profbaza.ru','$2y$10$qWmjluKcwxexAPSk7fTxPe1z7.T5nNvfNAxqrhHL.UMfk2fzH/TBG','Никитин Артем Павлович',NULL,0,'Педагогика',NULL,0,0,6,'editor','ff022a44e720b36c53a21eac6ac34568bb265844cfda048be05f7c5954a3ac27','2026-05-31 12:52:11',0,'2026-06-14 18:25:43'),(6,'6','codex.scenario.1780780839908@example.ru','$2y$10$sKUFh14BG8mQP/C3dq6z/Oia1jPJ2fcuJh1IBnFBeTFyBvvRpuAei','Тест Сценарий',NULL,0,'Педагогика / Образование',NULL,1,0,2,'user','8f3c5ef684f89c9d91ae84e094943feb8972c67eccd9c24af409fb16c49eb353','2026-06-06 21:20:44',0,'2026-06-14 18:25:43'),(7,'7','zincovich@profbase.xyz','$2y$10$KHtgTREaP1BWfjJRId2qXOnd9/k0ebyyf0wu8cWDYyNCaUy39gNbO','Никита Зинькович',NULL,0,'Другое',NULL,1,0,2,'user','7c2f4a2d0c8779e31356fc06d9f9a418865175c4e3347bd3383350b9b1ecd29b','2026-06-12 18:52:58',0,'2026-06-14 18:25:43'),(38,'u-site-admin','admin@profbaza.by','$2y$10$ciAc5jtAd768ukg6OyF4KuOG.CVh1U/O6QxAHNNV1iWAE2zGBshBW','Соколова Мария Викторовна',NULL,1,NULL,NULL,0,0,5,'site_admin',NULL,'2025-09-01 08:00:00',0,'2026-06-14 19:00:59'),(39,'u-org-admin','petrova@school12.minsk.edu.by','$2y$10$ciAc5jtAd768ukg6OyF4KuOG.CVh1U/O6QxAHNNV1iWAE2zGBshBW','Петрова Ирина Викторовна',NULL,1,'Математика','Математика',0,0,4,'organization_admin',NULL,'2025-09-02 09:00:00',0,'2026-06-14 19:00:59'),(40,'u-editor','editor@profbaza.by','$2y$10$ciAc5jtAd768ukg6OyF4KuOG.CVh1U/O6QxAHNNV1iWAE2zGBshBW','Никитин Артем Павлович',NULL,1,'Педагогика','Педагогика',0,0,6,'editor',NULL,'2025-11-10 10:00:00',0,'2026-06-14 19:00:59'),(41,'u-teacher-approved','ivanova@school12.minsk.edu.by','$2y$10$ciAc5jtAd768ukg6OyF4KuOG.CVh1U/O6QxAHNNV1iWAE2zGBshBW','Иванова Анна Сергеевна',NULL,1,'Математика','Математика',1,1,2,'user',NULL,'2025-09-05 10:00:00',0,'2026-06-14 19:00:59'),(42,'u-teacher-pending','kozlova@example.by','$2y$10$ciAc5jtAd768ukg6OyF4KuOG.CVh1U/O6QxAHNNV1iWAE2zGBshBW','Козлова Марина Николаевна',NULL,1,'Информатика','Информатика',1,0,2,'user',NULL,'2026-03-28 09:00:00',0,'2026-06-14 19:00:59'),(43,'u-user','belov@example.by','$2y$10$ciAc5jtAd768ukg6OyF4KuOG.CVh1U/O6QxAHNNV1iWAE2zGBshBW','Белов Андрей Романович',NULL,1,NULL,NULL,0,0,2,'user',NULL,'2026-03-30 08:30:00',0,'2026-06-14 19:00:59');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-06-14 22:53:16
