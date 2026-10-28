CREATE DATABASE  IF NOT EXISTS `pagemind` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `pagemind`;
-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: localhost    Database: pagemind
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `biblioteca_usuario`
--

DROP TABLE IF EXISTS `biblioteca_usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `biblioteca_usuario` (
  `id_biblioteca` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int NOT NULL,
  `id_livro` int NOT NULL,
  `status` enum('quero_ler','lendo','lido') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'quero_ler',
  `pagina_atual` int NOT NULL DEFAULT '0',
  `atualizado_em` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_biblioteca`),
  UNIQUE KEY `uq_biblioteca_usuario_livro` (`id_usuario`,`id_livro`),
  KEY `fk_biblioteca_livro` (`id_livro`),
  CONSTRAINT `fk_biblioteca_livro` FOREIGN KEY (`id_livro`) REFERENCES `livro` (`id_livro`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_biblioteca_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `biblioteca_usuario`
--

LOCK TABLES `biblioteca_usuario` WRITE;
/*!40000 ALTER TABLE `biblioteca_usuario` DISABLE KEYS */;
INSERT INTO `biblioteca_usuario` VALUES (1,2,7,'lido',387,'2026-10-06 20:20:59'),(2,3,7,'lendo',387,'2026-10-08 18:28:31'),(3,3,2,'quero_ler',0,'2026-10-22 23:38:07'),(13,4,8,'lido',70,'2026-10-19 15:47:28'),(16,3,9,'quero_ler',0,'2026-10-22 23:38:26'),(17,3,10,'lido',309,'2026-10-26 19:36:24'),(18,3,8,'lido',70,'2026-10-27 18:34:29'),(19,3,11,'lido',337,'2026-10-28 15:01:25');
/*!40000 ALTER TABLE `biblioteca_usuario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `comentario`
--

DROP TABLE IF EXISTS `comentario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comentario` (
  `id_comentario` int NOT NULL AUTO_INCREMENT,
  `texto` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `data` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `id_usuario` int NOT NULL,
  `id_resenha` int NOT NULL,
  PRIMARY KEY (`id_comentario`),
  KEY `fk_comentario_usuario` (`id_usuario`),
  KEY `idx_comentario_resenha` (`id_resenha`),
  CONSTRAINT `fk_comentario_resenha` FOREIGN KEY (`id_resenha`) REFERENCES `resenha` (`id_resenha`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_comentario_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comentario`
--

LOCK TABLES `comentario` WRITE;
/*!40000 ALTER TABLE `comentario` DISABLE KEYS */;
INSERT INTO `comentario` VALUES (1,'MUITO BOM','2026-09-27 13:03:11',2,7),(2,'n gostei','2026-09-27 13:11:40',2,6),(4,'Muito bom','2026-10-19 15:50:33',3,14),(5,'kkkk','2026-10-22 23:37:43',3,14),(6,'muito daora','2026-10-26 19:33:48',3,12),(7,'muito legal','2026-10-27 18:34:44',3,16);
/*!40000 ALTER TABLE `comentario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `curtida`
--

DROP TABLE IF EXISTS `curtida`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `curtida` (
  `id_curtida` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int NOT NULL,
  `id_resenha` int NOT NULL,
  `criado_em` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_curtida`),
  UNIQUE KEY `uq_curtida_usuario_resenha` (`id_usuario`,`id_resenha`),
  KEY `idx_curtida_resenha` (`id_resenha`),
  CONSTRAINT `fk_curtida_resenha` FOREIGN KEY (`id_resenha`) REFERENCES `resenha` (`id_resenha`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_curtida_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `curtida`
--

LOCK TABLES `curtida` WRITE;
/*!40000 ALTER TABLE `curtida` DISABLE KEYS */;
INSERT INTO `curtida` VALUES (1,2,8,'2026-09-27 13:03:02'),(3,2,6,'2026-09-27 13:03:15'),(5,2,7,'2026-09-27 13:11:29'),(6,2,5,'2026-10-06 20:12:15'),(10,3,8,'2026-10-06 20:38:06'),(11,3,7,'2026-10-06 20:38:07'),(12,3,6,'2026-10-06 20:38:08'),(14,3,4,'2026-10-06 20:50:02'),(15,3,13,'2026-10-06 20:50:03'),(18,4,14,'2026-10-19 15:51:02'),(19,3,11,'2026-10-22 18:55:29'),(20,3,14,'2026-10-22 23:37:36'),(21,3,16,'2026-10-27 18:34:38');
/*!40000 ALTER TABLE `curtida` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `instituicao`
--

DROP TABLE IF EXISTS `instituicao`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `instituicao` (
  `id_instituicao` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `cnpj` varchar(18) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email_contato` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ativo` tinyint(1) NOT NULL DEFAULT '1',
  `criado_em` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_instituicao`),
  UNIQUE KEY `cnpj` (`cnpj`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `instituicao`
--

LOCK TABLES `instituicao` WRITE;
/*!40000 ALTER TABLE `instituicao` DISABLE KEYS */;
INSERT INTO `instituicao` VALUES (1,'Firjan SENAI','00.000.000/0001-00','contato@senai.edu.br',1,'2026-09-15 18:54:52');
/*!40000 ALTER TABLE `instituicao` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `livro`
--

DROP TABLE IF EXISTS `livro`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `livro` (
  `id_livro` int NOT NULL AUTO_INCREMENT,
  `google_books_id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `titulo` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `autor` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `genero` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `imagem_capa` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `paginas` int DEFAULT NULL,
  `criado_em` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_livro`),
  UNIQUE KEY `google_books_id` (`google_books_id`),
  KEY `idx_livro_google_id` (`google_books_id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `livro`
--

LOCK TABLES `livro` WRITE;
/*!40000 ALTER TABLE `livro` DISABLE KEYS */;
INSERT INTO `livro` VALUES (1,'wrOQLV6xB-wC','1984','George Orwell','Ficção Distópica','https://exemplo.com/1984.jpg',NULL,'2026-09-21 14:39:52'),(2,'Z6djDwAAQBAJ','Dom Casmurro','Machado de Assis','Fiction','https://books.google.com/books/content?id=Z6djDwAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api',NULL,'2026-09-21 21:51:05'),(3,'DCmuEQAAQBAJ','Percy Jackson and the Olympians: The Sea of Monsters, The Graphic Novel','Rick Riordan, Robert Venditti','Juvenile Fiction','https://books.google.com/books/content?id=DCmuEQAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api',NULL,'2026-09-21 21:53:03'),(4,'eCSuEQAAQBAJ','Percy Jackson and the Olympians: The Lightning Thief: The Graphic Novel','Rick Riordan, Robert Venditti','Juvenile Fiction','https://books.google.com/books/content?id=eCSuEQAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api',NULL,'2026-09-21 21:59:20'),(5,'LJVfAwAAQBAJ','Spider-Man','Dan Slott','Comics & Graphic Novels','https://books.google.com/books/content?id=LJVfAwAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api',NULL,'2026-09-23 17:33:09'),(6,'4KuACgAAQBAJ','Batman: Arkham Knight (2015-) #32','Peter J. Tomasi','Comics & Graphic Novels','https://books.google.com/books/content?id=4KuACgAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api',NULL,'2026-09-23 17:42:13'),(7,'Yz8Fnw0PlEQC','The Hunger Games (Hunger Games, Book One)','Suzanne Collins','Ficção Young Adult','https://books.google.com/books/content?id=Yz8Fnw0PlEQC&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api',387,'2026-10-06 20:20:59'),(8,'XSxKEAAAQBAJ','O Pequeno Príncipe','Antoine De  Saint-exupéry','Ficção','https://books.google.com/books/content?id=XSxKEAAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api',70,'2026-10-19 15:47:28'),(9,'7RwGEAAAQBAJ','Marvel-historia','Ned Hartley, Marvel','Quadrinhos','https://books.google.com/books/content?id=7RwGEAAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api',100,'2026-10-22 23:38:26'),(10,'kotPYEqx7kMC','1984','George Orwell','Ficção','https://books.google.com/books/content?id=kotPYEqx7kMC&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api',309,'2026-10-26 19:36:24'),(11,'8bdcAAAAQBAJ','Memórias póstumas de Brás Cubas','Machado de Assis',NULL,'https://books.google.com/books/content?id=8bdcAAAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api',337,'2026-10-28 15:01:25');
/*!40000 ALTER TABLE `livro` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `resenha`
--

DROP TABLE IF EXISTS `resenha`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `resenha` (
  `id_resenha` int NOT NULL AUTO_INCREMENT,
  `titulo` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nota` tinyint NOT NULL,
  `texto` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `data` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `id_usuario` int NOT NULL,
  `id_livro` int NOT NULL,
  PRIMARY KEY (`id_resenha`),
  KEY `idx_resenha_usuario` (`id_usuario`),
  KEY `idx_resenha_livro` (`id_livro`),
  CONSTRAINT `fk_resenha_livro` FOREIGN KEY (`id_livro`) REFERENCES `livro` (`id_livro`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_resenha_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `chk_resenha_nota` CHECK ((`nota` between 1 and 5))
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `resenha`
--

LOCK TABLES `resenha` WRITE;
/*!40000 ALTER TABLE `resenha` DISABLE KEYS */;
INSERT INTO `resenha` VALUES (4,'Teste 1',3,'Livro legal legal','2026-09-21 21:51:05',2,2),(5,'teste',4,'livro legal','2026-09-21 21:53:03',2,3),(6,'123',5,'açfnhahjgga','2026-09-21 21:59:20',2,4),(7,'Miranha',2,'aura','2026-09-23 17:33:09',2,5),(8,'morcego',1,'muito ruim','2026-09-23 17:42:13',2,6),(11,'resenha 2',1,'teste','2026-10-06 20:47:58',3,2),(12,'resenha 3',5,'taaa','2026-10-06 20:48:25',3,2),(13,'resenha 4',5,'aaaa','2026-10-06 20:49:54',3,2),(14,'O Pequeno',5,'ta bom ta bom, principe pequeno, bem legal, pequeno principe','2026-10-19 15:47:28',4,8),(15,'Pesado',5,'Livro muito bom, recomendo, ótimo repertório','2026-10-26 19:36:24',3,10),(16,'Otimo livro',5,'Otimo livro me diverti muito lendo','2026-10-27 18:34:29',3,8),(17,'otimo livro',3,'hshjgfhsfgh','2026-10-28 15:01:25',3,11);
/*!40000 ALTER TABLE `resenha` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuario`
--

DROP TABLE IF EXISTS `usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuario` (
  `id_usuario` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `senha` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo` enum('aluno','professor') COLLATE utf8mb4_unicode_ci NOT NULL,
  `foto` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bio` text COLLATE utf8mb4_unicode_ci,
  `id_instituicao` int NOT NULL,
  `ativo` tinyint(1) NOT NULL DEFAULT '1',
  `criado_em` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_usuario_instituicao` (`id_instituicao`),
  KEY `idx_usuario_tipo` (`tipo`),
  CONSTRAINT `fk_usuario_instituicao` FOREIGN KEY (`id_instituicao`) REFERENCES `instituicao` (`id_instituicao`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuario`
--

LOCK TABLES `usuario` WRITE;
/*!40000 ALTER TABLE `usuario` DISABLE KEYS */;
INSERT INTO `usuario` VALUES (1,'Maria Teste','maria@teste.com','$2y$10$C2aie2C9VskFZIXVZq8izuDaY3kAlGoN3jnpLpI9ujdMivzvrUQRO','aluno',NULL,NULL,1,1,'2026-09-15 19:39:08'),(2,'kalebe','sayon@gmail.com','$2y$10$dLJcDxX9XMMSYOckjYwtx.yVX.mkHVxRjZOC8IMyyl3Qr1hAKN/6W','professor',NULL,'lindo',1,1,'2026-09-15 20:11:40'),(3,'Admin','admin@gmail.com','$2y$10$qOLzcNEKXUfbawhQuzGMau2hYdvPjJcf4zshluWEKhoH/N6.uYmoC','professor',NULL,NULL,1,1,'2026-10-06 20:24:55'),(4,'Bernado','bernado@gmail.com','$2y$10$/Btt2n0cgBlsGwWU3NmvOe.w2NSKIA.2m9h1pCaqt7Ady8ms4naIS','aluno',NULL,NULL,1,1,'2026-10-19 15:44:22');
/*!40000 ALTER TABLE `usuario` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-28 15:29:33
