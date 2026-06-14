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
-- Current Database: `profbaza_api`
--

/*!40000 DROP DATABASE IF EXISTS `profbaza_api`*/;

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `profbaza_api` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */;

USE `profbaza_api`;

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
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `email` varchar(255) DEFAULT NULL,
  `password_hash` varchar(255) DEFAULT NULL,
  `name` varchar(255) NOT NULL DEFAULT '',
  `avatar` varchar(500) DEFAULT NULL,
  `email_verified` tinyint(1) NOT NULL DEFAULT 0,
  `specialization` varchar(100) DEFAULT NULL,
  `is_young_specialist` tinyint(1) NOT NULL DEFAULT 0,
  `is_first_employment` tinyint(1) NOT NULL DEFAULT 0,
  `role_id` int(10) unsigned DEFAULT NULL,
  `api_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `api_token` (`api_token`),
  KEY `fk_user_role` (`role_id`),
  CONSTRAINT `fk_user_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'admin@profbaza.ru','$2y$10$GlcCddAnTtlLHMpfCqVk9OikjdS6DlrmGqDTvHocXEDAODmPKuxY6','Соколова Мария Викторовна',NULL,0,NULL,0,0,5,'0880743e49800fd9b90698b6223d375840ac71ae50344d6aa47952d17d0b58fe','2026-05-28 01:33:02'),(2,'ddaby512@gmail.com',NULL,'mired s','https://lh3.googleusercontent.com/a/ACg8ocK2ViKuoONZwAVF0PLeiHwV1Bh4eWm3xLKVzLOBTiZwY9-pJ1g=s96-c',1,NULL,0,0,2,'dca6e84d603f5485a768ca5cafaa407e3d66e4f0e593e3f602d857b61b68fa16','2026-05-28 02:05:14'),(3,'belov@example.ru','$2y$10$hlRjcVUkhZvDE3xqfvAhb.BfcecdgQXCFb6eSsv78X.eBO2HQmXwC','цуцуй цу',NULL,0,'',0,0,2,'12589da3a6f51983d6c83e3b501796701a7c66dfdfc312c44690faf98c12e098','2026-05-28 02:32:00'),(5,'editor@profbaza.ru','$2y$10$qWmjluKcwxexAPSk7fTxPe1z7.T5nNvfNAxqrhHL.UMfk2fzH/TBG','Никитин Артем Павлович',NULL,0,'Педагогика',0,0,6,'ff022a44e720b36c53a21eac6ac34568bb265844cfda048be05f7c5954a3ac27','2026-05-31 12:52:11'),(6,'codex.scenario.1780780839908@example.ru','$2y$10$sKUFh14BG8mQP/C3dq6z/Oia1jPJ2fcuJh1IBnFBeTFyBvvRpuAei','Тест Сценарий',NULL,0,'Педагогика / Образование',1,0,2,'8f3c5ef684f89c9d91ae84e094943feb8972c67eccd9c24af409fb16c49eb353','2026-06-06 21:20:44'),(7,'zincovich@profbase.xyz','$2y$10$KHtgTREaP1BWfjJRId2qXOnd9/k0ebyyf0wu8cWDYyNCaUy39gNbO','Никита Зинькович',NULL,0,'Другое',1,0,2,'7c2f4a2d0c8779e31356fc06d9f9a418865175c4e3347bd3383350b9b1ecd29b','2026-06-12 18:52:58');
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

-- Dump completed on 2026-06-13 10:27:32
