-- MySQL dump 10.13  Distrib 8.0.45, for Linux (x86_64)
--
-- Host: localhost    Database: huanong_palm
-- ------------------------------------------------------
-- Server version	8.0.45-0ubuntu0.24.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `admin`
--

DROP TABLE IF EXISTS `admin`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admin` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '管理员账号',
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '密码(加密)',
  `name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '姓名',
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '邮箱',
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '手机号',
  `role` enum('super','normal') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'normal' COMMENT '角色',
  `status` tinyint DEFAULT '1' COMMENT '状态: 1启用 0禁用',
  `last_login_at` timestamp NULL DEFAULT NULL COMMENT '最后登录时间',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `username` (`username`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC COMMENT='管理员表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin`
--

LOCK TABLES `admin` WRITE;
/*!40000 ALTER TABLE `admin` DISABLE KEYS */;
INSERT INTO `admin` VALUES (1,'admin','$2b$10$BBF067ti4sWs42w/wTHoeeP9XJTQRjJIqQVbSU4jvlUKJ8ZDy7uDS','超级管理员',NULL,NULL,'super',1,'2026-04-08 08:14:08','2026-02-15 14:34:53','2026-04-08 08:14:08'),(2,'202214720219','$2b$10$4Vv.WcG1mZx0zalN60gThOdzPG1MMfvRokwDwObbjOof3nJD7y/tO','汪城弘','wch18979276719@163.com','19879099190','normal',1,'2026-02-25 01:29:39','2026-02-16 04:39:54','2026-02-25 01:29:39');
/*!40000 ALTER TABLE `admin` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bus_arrival_subscription`
--

DROP TABLE IF EXISTS `bus_arrival_subscription`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bus_arrival_subscription` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL COMMENT '用户ID',
  `line_id` int NOT NULL COMMENT '线路ID',
  `stop_id` int NOT NULL COMMENT '站点ID',
  `status` tinyint DEFAULT '1' COMMENT '状态: 1启用 0禁用',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  KEY `line_id` (`line_id`) USING BTREE,
  KEY `stop_id` (`stop_id`) USING BTREE,
  KEY `idx_user` (`user_id`) USING BTREE,
  CONSTRAINT `bus_arrival_subscription_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `bus_arrival_subscription_ibfk_2` FOREIGN KEY (`line_id`) REFERENCES `bus_line` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `bus_arrival_subscription_ibfk_3` FOREIGN KEY (`stop_id`) REFERENCES `bus_stop` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC COMMENT='到站订阅表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bus_arrival_subscription`
--

LOCK TABLES `bus_arrival_subscription` WRITE;
/*!40000 ALTER TABLE `bus_arrival_subscription` DISABLE KEYS */;
/*!40000 ALTER TABLE `bus_arrival_subscription` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bus_line`
--

DROP TABLE IF EXISTS `bus_line`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bus_line` (
  `id` int NOT NULL AUTO_INCREMENT,
  `number` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '线路编号',
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '线路名称',
  `start_station` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '起点站',
  `end_station` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '终点站',
  `operating_time` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '运营时间',
  `interval_minutes` int DEFAULT NULL COMMENT '发车间隔(分钟)',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `route_cache` longtext COLLATE utf8mb4_general_ci COMMENT '路线坐标点缓存(JSON)',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC COMMENT='校巴线路表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bus_line`
--

LOCK TABLES `bus_line` WRITE;
/*!40000 ALTER TABLE `bus_line` DISABLE KEYS */;
INSERT INTO `bus_line` VALUES (9,'1','1号路','西南门站','教三站','07:00-22:30',15,'2026-03-09 07:36:32','{\"points\":[{\"latitude\":23.153847,\"longitude\":113.35166},{\"latitude\":23.154127,\"longitude\":113.351639},{\"latitude\":23.154607,\"longitude\":113.351623},{\"latitude\":23.154607,\"longitude\":113.351623},{\"latitude\":23.154674,\"longitude\":113.351783},{\"latitude\":23.154804,\"longitude\":113.35209},{\"latitude\":23.154869,\"longitude\":113.352408},{\"latitude\":23.154873,\"longitude\":113.352631},{\"latitude\":23.154751,\"longitude\":113.353362},{\"latitude\":23.154713,\"longitude\":113.353546},{\"latitude\":23.154668,\"longitude\":113.353942},{\"latitude\":23.154679,\"longitude\":113.354561},{\"latitude\":23.154675,\"longitude\":113.354687},{\"latitude\":23.154675,\"longitude\":113.354687},{\"latitude\":23.154672,\"longitude\":113.354794},{\"latitude\":23.154676,\"longitude\":113.355312},{\"latitude\":23.15467,\"longitude\":113.355743},{\"latitude\":23.15467,\"longitude\":113.355743},{\"latitude\":23.154659,\"longitude\":113.356415},{\"latitude\":23.154669,\"longitude\":113.357095},{\"latitude\":23.154669,\"longitude\":113.357095},{\"latitude\":23.154665,\"longitude\":113.357203},{\"latitude\":23.155709,\"longitude\":113.357174},{\"latitude\":23.156046,\"longitude\":113.357165},{\"latitude\":23.156146,\"longitude\":113.357156},{\"latitude\":23.156146,\"longitude\":113.357156},{\"latitude\":23.156175,\"longitude\":113.357348},{\"latitude\":23.156175,\"longitude\":113.357348},{\"latitude\":23.156239,\"longitude\":113.357431},{\"latitude\":23.15638,\"longitude\":113.357565},{\"latitude\":23.156651,\"longitude\":113.357787},{\"latitude\":23.157403,\"longitude\":113.358357},{\"latitude\":23.157403,\"longitude\":113.358357},{\"latitude\":23.157507,\"longitude\":113.358277},{\"latitude\":23.156651,\"longitude\":113.357641},{\"latitude\":23.156469,\"longitude\":113.357487},{\"latitude\":23.156389,\"longitude\":113.357403},{\"latitude\":23.1563,\"longitude\":113.357157},{\"latitude\":23.1563,\"longitude\":113.357157},{\"latitude\":23.156294,\"longitude\":113.357139},{\"latitude\":23.156294,\"longitude\":113.357139},{\"latitude\":23.156146,\"longitude\":113.357156},{\"latitude\":23.156175,\"longitude\":113.357348},{\"latitude\":23.156175,\"longitude\":113.357348},{\"latitude\":23.156239,\"longitude\":113.357431},{\"latitude\":23.156301,\"longitude\":113.357496},{\"latitude\":23.156651,\"longitude\":113.357787},{\"latitude\":23.157403,\"longitude\":113.358357},{\"latitude\":23.157988,\"longitude\":113.358774},{\"latitude\":23.158474,\"longitude\":113.359149},{\"latitude\":23.159192,\"longitude\":113.35958},{\"latitude\":23.159433,\"longitude\":113.359755},{\"latitude\":23.159433,\"longitude\":113.359755},{\"latitude\":23.159496,\"longitude\":113.359684},{\"latitude\":23.15928,\"longitude\":113.359509},{\"latitude\":23.159221,\"longitude\":113.359465},{\"latitude\":23.158551,\"longitude\":113.359055},{\"latitude\":23.158046,\"longitude\":113.358693},{\"latitude\":23.158046,\"longitude\":113.358693},{\"latitude\":23.158037,\"longitude\":113.358686},{\"latitude\":23.158037,\"longitude\":113.358686},{\"latitude\":23.157988,\"longitude\":113.358774},{\"latitude\":23.158474,\"longitude\":113.359149},{\"latitude\":23.159192,\"longitude\":113.35958},{\"latitude\":23.159433,\"longitude\":113.359755},{\"latitude\":23.159536,\"longitude\":113.36004},{\"latitude\":23.159576,\"longitude\":113.360218},{\"latitude\":23.159576,\"longitude\":113.360294},{\"latitude\":23.159567,\"longitude\":113.360363},{\"latitude\":23.159485,\"longitude\":113.36071},{\"latitude\":23.159485,\"longitude\":113.36071},{\"latitude\":23.159589,\"longitude\":113.360751},{\"latitude\":23.159634,\"longitude\":113.360653},{\"latitude\":23.159686,\"longitude\":113.360249},{\"latitude\":23.159683,\"longitude\":113.360146},{\"latitude\":23.159621,\"longitude\":113.35993},{\"latitude\":23.159514,\"longitude\":113.359719},{\"latitude\":23.159514,\"longitude\":113.359719},{\"latitude\":23.159496,\"longitude\":113.359684},{\"latitude\":23.159496,\"longitude\":113.359684},{\"latitude\":23.159845,\"longitude\":113.359194},{\"latitude\":23.159845,\"longitude\":113.359194},{\"latitude\":23.16027,\"longitude\":113.359178},{\"latitude\":23.160687,\"longitude\":113.359092},{\"latitude\":23.160789,\"longitude\":113.359083},{\"latitude\":23.160864,\"longitude\":113.359096},{\"latitude\":23.161045,\"longitude\":113.359165},{\"latitude\":23.16121,\"longitude\":113.359217},{\"latitude\":23.16121,\"longitude\":113.359217},{\"latitude\":23.161289,\"longitude\":113.358913},{\"latitude\":23.161301,\"longitude\":113.358574},{\"latitude\":23.161301,\"longitude\":113.358574},{\"latitude\":23.161316,\"longitude\":113.358211},{\"latitude\":23.161335,\"longitude\":113.358153},{\"latitude\":23.161371,\"longitude\":113.358124},{\"latitude\":23.161409,\"longitude\":113.358108},{\"latitude\":23.161525,\"longitude\":113.358097},{\"latitude\":23.162152,\"longitude\":113.358058},{\"latitude\":23.162152,\"longitude\":113.358058},{\"latitude\":23.162146,\"longitude\":113.357283},{\"latitude\":23.162164,\"longitude\":113.357236},{\"latitude\":23.162164,\"longitude\":113.357236},{\"latitude\":23.162187,\"longitude\":113.357208},{\"latitude\":23.162243,\"longitude\":113.357193},{\"latitude\":23.162243,\"longitude\":113.357193},{\"latitude\":23.162312,\"longitude\":113.356291},{\"latitude\":23.162333,\"longitude\":113.356239},{\"latitude\":23.162334,\"longitude\":113.3562},{\"latitude\":23.16227,\"longitude\":113.355958},{\"latitude\":23.162234,\"longitude\":113.355674},{\"latitude\":23.162228,\"longitude\":113.355029},{\"latitude\":23.162204,\"longitude\":113.354394},{\"latitude\":23.162204,\"longitude\":113.354202},{\"latitude\":23.162204,\"longitude\":113.354202},{\"latitude\":23.162198,\"longitude\":113.353687},{\"latitude\":23.162201,\"longitude\":113.352765},{\"latitude\":23.162201,\"longitude\":113.352765},{\"latitude\":23.161849,\"longitude\":113.352646},{\"latitude\":23.161598,\"longitude\":113.352617},{\"latitude\":23.161598,\"longitude\":113.352617},{\"latitude\":23.161409,\"longitude\":113.352597},{\"latitude\":23.160096,\"longitude\":113.352615},{\"latitude\":23.159612,\"longitude\":113.352602},{\"latitude\":23.159612,\"longitude\":113.352602},{\"latitude\":23.159334,\"longitude\":113.352595},{\"latitude\":23.159334,\"longitude\":113.352595},{\"latitude\":23.15933,\"longitude\":113.35228},{\"latitude\":23.159362,\"longitude\":113.351921},{\"latitude\":23.159352,\"longitude\":113.350927},{\"latitude\":23.159361,\"longitude\":113.350821},{\"latitude\":23.159406,\"longitude\":113.350647},{\"latitude\":23.159462,\"longitude\":113.350506},{\"latitude\":23.159626,\"longitude\":113.350239},{\"latitude\":23.159654,\"longitude\":113.349942},{\"latitude\":23.159638,\"longitude\":113.349583},{\"latitude\":23.159638,\"longitude\":113.349583},{\"latitude\":23.159807,\"longitude\":113.349562},{\"latitude\":23.159807,\"longitude\":113.349562},{\"latitude\":23.159638,\"longitude\":113.349583},{\"latitude\":23.159638,\"longitude\":113.349583},{\"latitude\":23.159654,\"longitude\":113.349942},{\"latitude\":23.159626,\"longitude\":113.350239},{\"latitude\":23.159626,\"longitude\":113.350239},{\"latitude\":23.159462,\"longitude\":113.350506},{\"latitude\":23.159406,\"longitude\":113.350647},{\"latitude\":23.159361,\"longitude\":113.350821},{\"latitude\":23.159352,\"longitude\":113.350927},{\"latitude\":23.159362,\"longitude\":113.351921},{\"latitude\":23.15933,\"longitude\":113.35228},{\"latitude\":23.159334,\"longitude\":113.352595},{\"latitude\":23.159334,\"longitude\":113.352595},{\"latitude\":23.159254,\"longitude\":113.352597},{\"latitude\":23.159239,\"longitude\":113.352581},{\"latitude\":23.159199,\"longitude\":113.352568},{\"latitude\":23.15916,\"longitude\":113.352584},{\"latitude\":23.159137,\"longitude\":113.352622},{\"latitude\":23.158946,\"longitude\":113.352605},{\"latitude\":23.158699,\"longitude\":113.352601},{\"latitude\":23.158599,\"longitude\":113.352607},{\"latitude\":23.158188,\"longitude\":113.352632},{\"latitude\":23.157472,\"longitude\":113.352696},{\"latitude\":23.157189,\"longitude\":113.352701},{\"latitude\":23.156725,\"longitude\":113.35271},{\"latitude\":23.156721,\"longitude\":113.35271},{\"latitude\":23.156721,\"longitude\":113.35271},{\"latitude\":23.156725,\"longitude\":113.35271},{\"latitude\":23.157189,\"longitude\":113.352701},{\"latitude\":23.157472,\"longitude\":113.352696},{\"latitude\":23.158188,\"longitude\":113.352632},{\"latitude\":23.158599,\"longitude\":113.352607},{\"latitude\":23.158599,\"longitude\":113.352607},{\"latitude\":23.15863,\"longitude\":113.35184},{\"latitude\":23.158623,\"longitude\":113.351546},{\"latitude\":23.158615,\"longitude\":113.351546}],\"stations\":[{\"id\":17,\"name\":\"西南门站\",\"latitude\":\"23.1538500\",\"longitude\":\"113.3517060\",\"created_at\":\"2026-03-14T09:58:32.000Z\",\"sequence\":1},{\"id\":1,\"name\":\"湿地公园\",\"latitude\":\"23.1546950\",\"longitude\":\"113.3546880\",\"created_at\":\"2026-02-08T11:55:54.000Z\",\"sequence\":2},{\"id\":18,\"name\":\"教六站\",\"latitude\":\"23.1546790\",\"longitude\":\"113.3557430\",\"created_at\":\"2026-03-14T10:07:50.000Z\",\"sequence\":3},{\"id\":19,\"name\":\"田家炳站\",\"latitude\":\"23.1562700\",\"longitude\":\"113.3571700\",\"created_at\":\"2026-03-14T10:09:13.000Z\",\"sequence\":4},{\"id\":20,\"name\":\"嵩山站\",\"latitude\":\"23.1580250\",\"longitude\":\"113.3587270\",\"created_at\":\"2026-03-14T10:10:10.000Z\",\"sequence\":5},{\"id\":21,\"name\":\"生科院站\",\"latitude\":\"23.1594820\",\"longitude\":\"113.3597390\",\"created_at\":\"2026-03-14T10:11:21.000Z\",\"sequence\":6},{\"id\":22,\"name\":\"科技楼站\",\"latitude\":\"23.1613060\",\"longitude\":\"113.3585740\",\"created_at\":\"2026-03-14T10:15:34.000Z\",\"sequence\":7},{\"id\":23,\"name\":\"燕山一栋站\",\"latitude\":\"23.1621790\",\"longitude\":\"113.3572450\",\"created_at\":\"2026-03-14T10:16:31.000Z\",\"sequence\":8},{\"id\":24,\"name\":\"国际交流生公寓\",\"latitude\":\"23.1622100\",\"longitude\":\"113.3542020\",\"created_at\":\"2026-03-14T10:19:05.000Z\",\"sequence\":9},{\"id\":25,\"name\":\"音乐楼站\",\"latitude\":\"23.1615990\",\"longitude\":\"113.3526090\",\"created_at\":\"2026-03-14T10:19:56.000Z\",\"sequence\":10},{\"id\":26,\"name\":\"艺术学院站\",\"latitude\":\"23.1596120\",\"longitude\":\"113.3525880\",\"created_at\":\"2026-03-14T10:21:22.000Z\",\"sequence\":11},{\"id\":27,\"name\":\"华山八栋站\",\"latitude\":\"23.1598070\",\"longitude\":\"113.3495610\",\"created_at\":\"2026-03-14T10:22:36.000Z\",\"sequence\":12},{\"id\":29,\"name\":\"图书馆站\",\"latitude\":\"23.1567210\",\"longitude\":\"113.3527070\",\"created_at\":\"2026-03-14T10:24:44.000Z\",\"sequence\":13},{\"id\":28,\"name\":\"教三站\",\"latitude\":\"23.1586150\",\"longitude\":\"113.3515460\",\"created_at\":\"2026-03-14T10:23:29.000Z\",\"sequence\":14}]}'),(10,'2','2号线','西南门站','人才公寓站','07:00-22:30',15,'2026-03-14 11:17:30','{\"points\":[{\"latitude\":23.153847,\"longitude\":113.35166},{\"latitude\":23.154127,\"longitude\":113.351639},{\"latitude\":23.154607,\"longitude\":113.351623},{\"latitude\":23.154607,\"longitude\":113.351623},{\"latitude\":23.154804,\"longitude\":113.35209},{\"latitude\":23.154869,\"longitude\":113.352408},{\"latitude\":23.154873,\"longitude\":113.352631},{\"latitude\":23.154873,\"longitude\":113.352631},{\"latitude\":23.155245,\"longitude\":113.352656},{\"latitude\":23.155657,\"longitude\":113.352697},{\"latitude\":23.156416,\"longitude\":113.352683},{\"latitude\":23.156725,\"longitude\":113.35271},{\"latitude\":23.156725,\"longitude\":113.35271},{\"latitude\":23.1568,\"longitude\":113.353246},{\"latitude\":23.156829,\"longitude\":113.35366},{\"latitude\":23.156765,\"longitude\":113.354552},{\"latitude\":23.156788,\"longitude\":113.354568},{\"latitude\":23.156765,\"longitude\":113.354552},{\"latitude\":23.156765,\"longitude\":113.354552},{\"latitude\":23.156735,\"longitude\":113.354556},{\"latitude\":23.156723,\"longitude\":113.354566},{\"latitude\":23.156712,\"longitude\":113.354595},{\"latitude\":23.156718,\"longitude\":113.354624},{\"latitude\":23.156718,\"longitude\":113.354624},{\"latitude\":23.156739,\"longitude\":113.354643},{\"latitude\":23.156753,\"longitude\":113.354646},{\"latitude\":23.156779,\"longitude\":113.354638},{\"latitude\":23.156795,\"longitude\":113.354617},{\"latitude\":23.156795,\"longitude\":113.354617},{\"latitude\":23.157198,\"longitude\":113.354586},{\"latitude\":23.157731,\"longitude\":113.354521},{\"latitude\":23.158977,\"longitude\":113.354222},{\"latitude\":23.159053,\"longitude\":113.354192},{\"latitude\":23.159142,\"longitude\":113.354133},{\"latitude\":23.159142,\"longitude\":113.354133},{\"latitude\":23.159144,\"longitude\":113.354111},{\"latitude\":23.159144,\"longitude\":113.354111},{\"latitude\":23.159191,\"longitude\":113.353726},{\"latitude\":23.159179,\"longitude\":113.353539},{\"latitude\":23.159136,\"longitude\":113.353244},{\"latitude\":23.159171,\"longitude\":113.352702},{\"latitude\":23.159171,\"longitude\":113.352702},{\"latitude\":23.159213,\"longitude\":113.352708},{\"latitude\":23.15925,\"longitude\":113.352685},{\"latitude\":23.159266,\"longitude\":113.352641},{\"latitude\":23.159254,\"longitude\":113.352597},{\"latitude\":23.159254,\"longitude\":113.352597},{\"latitude\":23.159624,\"longitude\":113.352603},{\"latitude\":23.160096,\"longitude\":113.352615},{\"latitude\":23.161409,\"longitude\":113.352597},{\"latitude\":23.161822,\"longitude\":113.35264},{\"latitude\":23.162201,\"longitude\":113.352765},{\"latitude\":23.162343,\"longitude\":113.352818},{\"latitude\":23.162495,\"longitude\":113.352859},{\"latitude\":23.162855,\"longitude\":113.352872},{\"latitude\":23.163042,\"longitude\":113.352852},{\"latitude\":23.163376,\"longitude\":113.352754},{\"latitude\":23.164085,\"longitude\":113.352479},{\"latitude\":23.164085,\"longitude\":113.352479},{\"latitude\":23.163376,\"longitude\":113.352754},{\"latitude\":23.163042,\"longitude\":113.352852},{\"latitude\":23.162855,\"longitude\":113.352872},{\"latitude\":23.162495,\"longitude\":113.352859},{\"latitude\":23.162343,\"longitude\":113.352818},{\"latitude\":23.162201,\"longitude\":113.352765},{\"latitude\":23.161822,\"longitude\":113.35264},{\"latitude\":23.161409,\"longitude\":113.352597},{\"latitude\":23.160096,\"longitude\":113.352615},{\"latitude\":23.159254,\"longitude\":113.352597},{\"latitude\":23.159239,\"longitude\":113.352581},{\"latitude\":23.159199,\"longitude\":113.352568},{\"latitude\":23.15916,\"longitude\":113.352584},{\"latitude\":23.159137,\"longitude\":113.352622},{\"latitude\":23.159137,\"longitude\":113.352622},{\"latitude\":23.159141,\"longitude\":113.352667},{\"latitude\":23.159171,\"longitude\":113.352702},{\"latitude\":23.159171,\"longitude\":113.352702},{\"latitude\":23.159136,\"longitude\":113.353244},{\"latitude\":23.159179,\"longitude\":113.353539},{\"latitude\":23.159191,\"longitude\":113.353726},{\"latitude\":23.159142,\"longitude\":113.354133},{\"latitude\":23.159172,\"longitude\":113.354695},{\"latitude\":23.159363,\"longitude\":113.355425},{\"latitude\":23.159647,\"longitude\":113.356295},{\"latitude\":23.159705,\"longitude\":113.356538},{\"latitude\":23.159743,\"longitude\":113.35676},{\"latitude\":23.159743,\"longitude\":113.35676},{\"latitude\":23.159729,\"longitude\":113.356996},{\"latitude\":23.159657,\"longitude\":113.357573},{\"latitude\":23.159657,\"longitude\":113.35779},{\"latitude\":23.159679,\"longitude\":113.358081},{\"latitude\":23.15978,\"longitude\":113.358376},{\"latitude\":23.159939,\"longitude\":113.358788},{\"latitude\":23.159931,\"longitude\":113.358901},{\"latitude\":23.159845,\"longitude\":113.359194},{\"latitude\":23.159496,\"longitude\":113.359684},{\"latitude\":23.159496,\"longitude\":113.359684},{\"latitude\":23.159221,\"longitude\":113.359465},{\"latitude\":23.158653,\"longitude\":113.35912},{\"latitude\":23.158365,\"longitude\":113.358925},{\"latitude\":23.158365,\"longitude\":113.358925},{\"latitude\":23.158037,\"longitude\":113.358686},{\"latitude\":23.157796,\"longitude\":113.358483},{\"latitude\":23.157507,\"longitude\":113.358277},{\"latitude\":23.156651,\"longitude\":113.357641},{\"latitude\":23.156469,\"longitude\":113.357487},{\"latitude\":23.156389,\"longitude\":113.357403},{\"latitude\":23.1563,\"longitude\":113.357157},{\"latitude\":23.1563,\"longitude\":113.357157},{\"latitude\":23.156294,\"longitude\":113.357139},{\"latitude\":23.156294,\"longitude\":113.357139},{\"latitude\":23.156314,\"longitude\":113.357068},{\"latitude\":23.156047,\"longitude\":113.357086},{\"latitude\":23.155478,\"longitude\":113.357081},{\"latitude\":23.154669,\"longitude\":113.357095},{\"latitude\":23.153088,\"longitude\":113.357147},{\"latitude\":23.152468,\"longitude\":113.357112},{\"latitude\":23.152468,\"longitude\":113.357112},{\"latitude\":23.152416,\"longitude\":113.356994},{\"latitude\":23.152416,\"longitude\":113.356994},{\"latitude\":23.152335,\"longitude\":113.356937},{\"latitude\":23.152278,\"longitude\":113.356913},{\"latitude\":23.152116,\"longitude\":113.356922},{\"latitude\":23.152033,\"longitude\":113.356993},{\"latitude\":23.152006,\"longitude\":113.357101},{\"latitude\":23.151993,\"longitude\":113.357229},{\"latitude\":23.152046,\"longitude\":113.357321},{\"latitude\":23.152123,\"longitude\":113.357398},{\"latitude\":23.152247,\"longitude\":113.357426},{\"latitude\":23.15235,\"longitude\":113.357384},{\"latitude\":23.152416,\"longitude\":113.357322},{\"latitude\":23.152465,\"longitude\":113.357215},{\"latitude\":23.152465,\"longitude\":113.357215},{\"latitude\":23.153043,\"longitude\":113.357253},{\"latitude\":23.153043,\"longitude\":113.357253},{\"latitude\":23.153019,\"longitude\":113.358732},{\"latitude\":23.153012,\"longitude\":113.359171},{\"latitude\":23.153012,\"longitude\":113.359171},{\"latitude\":23.153096,\"longitude\":113.359133},{\"latitude\":23.153096,\"longitude\":113.359098},{\"latitude\":23.153096,\"longitude\":113.359098},{\"latitude\":23.153118,\"longitude\":113.357825},{\"latitude\":23.153135,\"longitude\":113.357256},{\"latitude\":23.153135,\"longitude\":113.357256},{\"latitude\":23.153088,\"longitude\":113.357147},{\"latitude\":23.152468,\"longitude\":113.357112},{\"latitude\":23.152468,\"longitude\":113.357112},{\"latitude\":23.152414,\"longitude\":113.356988},{\"latitude\":23.152335,\"longitude\":113.356937},{\"latitude\":23.152261,\"longitude\":113.356912},{\"latitude\":23.152116,\"longitude\":113.356922},{\"latitude\":23.152033,\"longitude\":113.356993},{\"latitude\":23.152006,\"longitude\":113.357101},{\"latitude\":23.151993,\"longitude\":113.357229},{\"latitude\":23.152046,\"longitude\":113.357321},{\"latitude\":23.152134,\"longitude\":113.357405},{\"latitude\":23.152247,\"longitude\":113.357426},{\"latitude\":23.15235,\"longitude\":113.357384},{\"latitude\":23.15235,\"longitude\":113.357384},{\"latitude\":23.152217,\"longitude\":113.358419},{\"latitude\":23.152115,\"longitude\":113.359091},{\"latitude\":23.152115,\"longitude\":113.359091},{\"latitude\":23.151288,\"longitude\":113.359065},{\"latitude\":23.151003,\"longitude\":113.359086},{\"latitude\":23.150769,\"longitude\":113.359127},{\"latitude\":23.150457,\"longitude\":113.359207},{\"latitude\":23.150153,\"longitude\":113.359303},{\"latitude\":23.149878,\"longitude\":113.35941},{\"latitude\":23.149878,\"longitude\":113.35941},{\"latitude\":23.149925,\"longitude\":113.359531},{\"latitude\":23.150534,\"longitude\":113.359304},{\"latitude\":23.150536,\"longitude\":113.35931}],\"stations\":[{\"id\":17,\"name\":\"西南门站\",\"latitude\":\"23.1538500\",\"longitude\":\"113.3517060\",\"created_at\":\"2026-03-14T09:58:32.000Z\",\"sequence\":1},{\"id\":30,\"name\":\"绿榕园站\",\"latitude\":\"23.1567830\",\"longitude\":\"113.3545740\",\"created_at\":\"2026-03-14T10:34:30.000Z\",\"sequence\":2},{\"id\":31,\"name\":\"宁荫湖站\",\"latitude\":\"23.1591360\",\"longitude\":\"113.3541100\",\"created_at\":\"2026-03-14T11:10:28.000Z\",\"sequence\":3},{\"id\":32,\"name\":\"校医院站\",\"latitude\":\"23.1640920\",\"longitude\":\"113.3524980\",\"created_at\":\"2026-03-14T11:11:21.000Z\",\"sequence\":4},{\"id\":33,\"name\":\"钢研所\",\"latitude\":\"23.1597470\",\"longitude\":\"113.3567590\",\"created_at\":\"2026-03-14T11:12:50.000Z\",\"sequence\":5},{\"id\":34,\"name\":\"嵩山197站\",\"latitude\":\"23.1583640\",\"longitude\":\"113.3589260\",\"created_at\":\"2026-03-14T11:14:00.000Z\",\"sequence\":6},{\"id\":19,\"name\":\"田家炳站\",\"latitude\":\"23.1562700\",\"longitude\":\"113.3571700\",\"created_at\":\"2026-03-14T10:09:13.000Z\",\"sequence\":7},{\"id\":35,\"name\":\"茶山小区站\",\"latitude\":\"23.1524120\",\"longitude\":\"113.3569960\",\"created_at\":\"2026-03-14T11:15:31.000Z\",\"sequence\":8},{\"id\":36,\"name\":\"体育馆站\",\"latitude\":\"23.1530590\",\"longitude\":\"113.3590970\",\"created_at\":\"2026-03-14T11:16:10.000Z\",\"sequence\":9},{\"id\":37,\"name\":\"人才公寓站\",\"latitude\":\"23.1505360\",\"longitude\":\"113.3593100\",\"created_at\":\"2026-03-14T11:16:42.000Z\",\"sequence\":10}]}'),(11,'4','4号线','西南门站','泰山24栋站','07:00-22:30',15,'2026-03-14 11:26:11',NULL),(12,'3','3号线','西南门站','启林北桥头站','07:00-22:30',15,'2026-03-14 11:31:35','{\"points\":[{\"latitude\":23.153847,\"longitude\":113.35166},{\"latitude\":23.154127,\"longitude\":113.351639},{\"latitude\":23.154607,\"longitude\":113.351623},{\"latitude\":23.154607,\"longitude\":113.351623},{\"latitude\":23.154804,\"longitude\":113.35209},{\"latitude\":23.154869,\"longitude\":113.352408},{\"latitude\":23.154873,\"longitude\":113.352631},{\"latitude\":23.154751,\"longitude\":113.353362},{\"latitude\":23.154713,\"longitude\":113.353546},{\"latitude\":23.154668,\"longitude\":113.353942},{\"latitude\":23.154679,\"longitude\":113.354561},{\"latitude\":23.154675,\"longitude\":113.354687},{\"latitude\":23.154675,\"longitude\":113.354687},{\"latitude\":23.15467,\"longitude\":113.355743},{\"latitude\":23.15467,\"longitude\":113.355743},{\"latitude\":23.154659,\"longitude\":113.356415},{\"latitude\":23.154669,\"longitude\":113.357095},{\"latitude\":23.154669,\"longitude\":113.357095},{\"latitude\":23.154665,\"longitude\":113.357203},{\"latitude\":23.156046,\"longitude\":113.357165},{\"latitude\":23.156146,\"longitude\":113.357156},{\"latitude\":23.156146,\"longitude\":113.357156},{\"latitude\":23.156175,\"longitude\":113.357348},{\"latitude\":23.156175,\"longitude\":113.357348},{\"latitude\":23.156239,\"longitude\":113.357431},{\"latitude\":23.15638,\"longitude\":113.357565},{\"latitude\":23.156651,\"longitude\":113.357787},{\"latitude\":23.157403,\"longitude\":113.358357},{\"latitude\":23.157403,\"longitude\":113.358357},{\"latitude\":23.157507,\"longitude\":113.358277},{\"latitude\":23.156651,\"longitude\":113.357641},{\"latitude\":23.156469,\"longitude\":113.357487},{\"latitude\":23.156389,\"longitude\":113.357403},{\"latitude\":23.1563,\"longitude\":113.357157},{\"latitude\":23.1563,\"longitude\":113.357157},{\"latitude\":23.156294,\"longitude\":113.357139},{\"latitude\":23.156294,\"longitude\":113.357139},{\"latitude\":23.156146,\"longitude\":113.357156},{\"latitude\":23.156175,\"longitude\":113.357348},{\"latitude\":23.156175,\"longitude\":113.357348},{\"latitude\":23.156239,\"longitude\":113.357431},{\"latitude\":23.156301,\"longitude\":113.357496},{\"latitude\":23.156651,\"longitude\":113.357787},{\"latitude\":23.157403,\"longitude\":113.358357},{\"latitude\":23.157988,\"longitude\":113.358774},{\"latitude\":23.158474,\"longitude\":113.359149},{\"latitude\":23.159192,\"longitude\":113.35958},{\"latitude\":23.159433,\"longitude\":113.359755},{\"latitude\":23.159433,\"longitude\":113.359755},{\"latitude\":23.159496,\"longitude\":113.359684},{\"latitude\":23.15928,\"longitude\":113.359509},{\"latitude\":23.159221,\"longitude\":113.359465},{\"latitude\":23.158551,\"longitude\":113.359055},{\"latitude\":23.158046,\"longitude\":113.358693},{\"latitude\":23.158046,\"longitude\":113.358693},{\"latitude\":23.158037,\"longitude\":113.358686},{\"latitude\":23.158037,\"longitude\":113.358686},{\"latitude\":23.157988,\"longitude\":113.358774},{\"latitude\":23.158474,\"longitude\":113.359149},{\"latitude\":23.159192,\"longitude\":113.35958},{\"latitude\":23.159433,\"longitude\":113.359755},{\"latitude\":23.159536,\"longitude\":113.36004},{\"latitude\":23.159576,\"longitude\":113.360218},{\"latitude\":23.159576,\"longitude\":113.360294},{\"latitude\":23.159567,\"longitude\":113.360363},{\"latitude\":23.159485,\"longitude\":113.36071},{\"latitude\":23.159485,\"longitude\":113.36071},{\"latitude\":23.159589,\"longitude\":113.360751},{\"latitude\":23.159634,\"longitude\":113.360653},{\"latitude\":23.159686,\"longitude\":113.360249},{\"latitude\":23.159683,\"longitude\":113.360146},{\"latitude\":23.159621,\"longitude\":113.35993},{\"latitude\":23.159514,\"longitude\":113.359719},{\"latitude\":23.159514,\"longitude\":113.359719},{\"latitude\":23.159496,\"longitude\":113.359684},{\"latitude\":23.159496,\"longitude\":113.359684},{\"latitude\":23.159433,\"longitude\":113.359755},{\"latitude\":23.159501,\"longitude\":113.359936},{\"latitude\":23.159556,\"longitude\":113.360112},{\"latitude\":23.159576,\"longitude\":113.360218},{\"latitude\":23.159576,\"longitude\":113.360294},{\"latitude\":23.159567,\"longitude\":113.360363},{\"latitude\":23.159485,\"longitude\":113.36071},{\"latitude\":23.159358,\"longitude\":113.361072},{\"latitude\":23.159352,\"longitude\":113.361144},{\"latitude\":23.15929,\"longitude\":113.361263},{\"latitude\":23.159086,\"longitude\":113.361701},{\"latitude\":23.159049,\"longitude\":113.362251},{\"latitude\":23.159067,\"longitude\":113.362417},{\"latitude\":23.159126,\"longitude\":113.362737},{\"latitude\":23.159232,\"longitude\":113.363063},{\"latitude\":23.159283,\"longitude\":113.363173},{\"latitude\":23.159381,\"longitude\":113.363344},{\"latitude\":23.159591,\"longitude\":113.363616},{\"latitude\":23.159635,\"longitude\":113.363719},{\"latitude\":23.159667,\"longitude\":113.363841},{\"latitude\":23.159668,\"longitude\":113.363897},{\"latitude\":23.159668,\"longitude\":113.363897},{\"latitude\":23.159578,\"longitude\":113.36432},{\"latitude\":23.159542,\"longitude\":113.364404},{\"latitude\":23.159534,\"longitude\":113.366152},{\"latitude\":23.159562,\"longitude\":113.366218},{\"latitude\":23.159562,\"longitude\":113.366218},{\"latitude\":23.159552,\"longitude\":113.366224},{\"latitude\":23.159552,\"longitude\":113.366224},{\"latitude\":23.159562,\"longitude\":113.366218},{\"latitude\":23.159562,\"longitude\":113.366218},{\"latitude\":23.15959,\"longitude\":113.366151},{\"latitude\":23.159606,\"longitude\":113.365427},{\"latitude\":23.159604,\"longitude\":113.364398},{\"latitude\":23.159578,\"longitude\":113.36432},{\"latitude\":23.159598,\"longitude\":113.364223},{\"latitude\":23.159668,\"longitude\":113.363897},{\"latitude\":23.159668,\"longitude\":113.363897},{\"latitude\":23.159682,\"longitude\":113.364246},{\"latitude\":23.159689,\"longitude\":113.365208},{\"latitude\":23.159689,\"longitude\":113.365208},{\"latitude\":23.160634,\"longitude\":113.365106},{\"latitude\":23.161362,\"longitude\":113.365109},{\"latitude\":23.161627,\"longitude\":113.36512},{\"latitude\":23.161694,\"longitude\":113.365145},{\"latitude\":23.161707,\"longitude\":113.365156},{\"latitude\":23.161707,\"longitude\":113.365156},{\"latitude\":23.161749,\"longitude\":113.366268},{\"latitude\":23.16168,\"longitude\":113.366513},{\"latitude\":23.161618,\"longitude\":113.366676},{\"latitude\":23.161244,\"longitude\":113.36754},{\"latitude\":23.161244,\"longitude\":113.36754},{\"latitude\":23.160958,\"longitude\":113.368134},{\"latitude\":23.160958,\"longitude\":113.368134},{\"latitude\":23.161051,\"longitude\":113.368096},{\"latitude\":23.161157,\"longitude\":113.368065},{\"latitude\":23.161245,\"longitude\":113.368051},{\"latitude\":23.161398,\"longitude\":113.368068},{\"latitude\":23.161445,\"longitude\":113.368081},{\"latitude\":23.161527,\"longitude\":113.368113},{\"latitude\":23.161581,\"longitude\":113.368148},{\"latitude\":23.161645,\"longitude\":113.368225},{\"latitude\":23.161731,\"longitude\":113.368355},{\"latitude\":23.162255,\"longitude\":113.36899},{\"latitude\":23.162255,\"longitude\":113.36899}],\"stations\":[{\"id\":17,\"name\":\"西南门站\",\"latitude\":\"23.1538500\",\"longitude\":\"113.3517060\",\"created_at\":\"2026-03-14T09:58:32.000Z\",\"sequence\":1},{\"id\":1,\"name\":\"湿地公园\",\"latitude\":\"23.1546950\",\"longitude\":\"113.3546880\",\"created_at\":\"2026-02-08T11:55:54.000Z\",\"sequence\":2},{\"id\":18,\"name\":\"教六站\",\"latitude\":\"23.1546790\",\"longitude\":\"113.3557430\",\"created_at\":\"2026-03-14T10:07:50.000Z\",\"sequence\":3},{\"id\":19,\"name\":\"田家炳站\",\"latitude\":\"23.1562700\",\"longitude\":\"113.3571700\",\"created_at\":\"2026-03-14T10:09:13.000Z\",\"sequence\":4},{\"id\":20,\"name\":\"嵩山站\",\"latitude\":\"23.1580250\",\"longitude\":\"113.3587270\",\"created_at\":\"2026-03-14T10:10:10.000Z\",\"sequence\":5},{\"id\":21,\"name\":\"生科院站\",\"latitude\":\"23.1594820\",\"longitude\":\"113.3597390\",\"created_at\":\"2026-03-14T10:11:21.000Z\",\"sequence\":6},{\"id\":44,\"name\":\"教五广场站\",\"latitude\":\"23.1595700\",\"longitude\":\"113.3662620\",\"created_at\":\"2026-03-14T11:29:49.000Z\",\"sequence\":7},{\"id\":45,\"name\":\"荷园站\",\"latitude\":\"23.1612350\",\"longitude\":\"113.3675350\",\"created_at\":\"2026-03-14T11:30:22.000Z\",\"sequence\":8},{\"id\":46,\"name\":\"启林北桥头站\",\"latitude\":\"23.1622550\",\"longitude\":\"113.3689900\",\"created_at\":\"2026-03-14T11:30:58.000Z\",\"sequence\":9}]}');
/*!40000 ALTER TABLE `bus_line` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bus_line_stop`
--

DROP TABLE IF EXISTS `bus_line_stop`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bus_line_stop` (
  `id` int NOT NULL AUTO_INCREMENT,
  `line_id` int NOT NULL COMMENT '线路ID',
  `stop_id` int NOT NULL COMMENT '站点ID',
  `sequence` int NOT NULL COMMENT '顺序',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `uk_line_stop` (`line_id`,`stop_id`) USING BTREE,
  KEY `stop_id` (`stop_id`) USING BTREE,
  CONSTRAINT `bus_line_stop_ibfk_1` FOREIGN KEY (`line_id`) REFERENCES `bus_line` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `bus_line_stop_ibfk_2` FOREIGN KEY (`stop_id`) REFERENCES `bus_stop` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=75 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC COMMENT='线路-站点关联表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bus_line_stop`
--

LOCK TABLES `bus_line_stop` WRITE;
/*!40000 ALTER TABLE `bus_line_stop` DISABLE KEYS */;
INSERT INTO `bus_line_stop` VALUES (32,10,17,1),(33,10,30,2),(34,10,31,3),(35,10,32,4),(36,10,33,5),(37,10,34,6),(38,10,19,7),(39,10,35,8),(40,10,36,9),(41,10,37,10),(42,11,17,1),(43,11,1,2),(44,11,18,3),(45,11,38,4),(46,11,36,5),(47,11,39,6),(48,11,40,7),(49,11,41,8),(50,11,42,9),(51,11,43,10),(52,9,17,1),(53,9,1,2),(54,9,18,3),(55,9,19,4),(56,9,20,5),(57,9,21,6),(58,9,22,7),(59,9,23,8),(60,9,24,9),(61,9,25,10),(62,9,26,11),(63,9,27,12),(64,9,29,13),(65,9,28,14),(66,12,17,1),(67,12,1,2),(68,12,18,3),(69,12,19,4),(70,12,20,5),(71,12,21,6),(72,12,44,7),(73,12,45,8),(74,12,46,9);
/*!40000 ALTER TABLE `bus_line_stop` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bus_stop`
--

DROP TABLE IF EXISTS `bus_stop`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bus_stop` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '站点名称',
  `latitude` decimal(10,7) NOT NULL COMMENT '纬度',
  `longitude` decimal(10,7) NOT NULL COMMENT '经度',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  KEY `idx_location` (`latitude`,`longitude`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=47 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC COMMENT='校巴站点表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bus_stop`
--

LOCK TABLES `bus_stop` WRITE;
/*!40000 ALTER TABLE `bus_stop` DISABLE KEYS */;
INSERT INTO `bus_stop` VALUES (1,'湿地公园',23.1546950,113.3546880,'2026-02-08 11:55:54'),(17,'西南门站',23.1538500,113.3517060,'2026-03-14 09:58:32'),(18,'教六站',23.1546790,113.3557430,'2026-03-14 10:07:50'),(19,'田家炳站',23.1562700,113.3571700,'2026-03-14 10:09:13'),(20,'嵩山站',23.1580250,113.3587270,'2026-03-14 10:10:10'),(21,'生科院站',23.1594820,113.3597390,'2026-03-14 10:11:21'),(22,'科技楼站',23.1613060,113.3585740,'2026-03-14 10:15:34'),(23,'燕山一栋站',23.1621790,113.3572450,'2026-03-14 10:16:31'),(24,'国际交流生公寓',23.1622100,113.3542020,'2026-03-14 10:19:05'),(25,'音乐楼站',23.1615990,113.3526090,'2026-03-14 10:19:56'),(26,'艺术学院站',23.1596120,113.3525880,'2026-03-14 10:21:22'),(27,'华山八栋站',23.1598070,113.3495610,'2026-03-14 10:22:36'),(28,'教三站',23.1586150,113.3515460,'2026-03-14 10:23:29'),(29,'图书馆站',23.1567210,113.3527070,'2026-03-14 10:24:44'),(30,'绿榕园站',23.1567830,113.3545740,'2026-03-14 10:34:30'),(31,'宁荫湖站',23.1591360,113.3541100,'2026-03-14 11:10:28'),(32,'校医院站',23.1640920,113.3524980,'2026-03-14 11:11:21'),(33,'钢研所',23.1597470,113.3567590,'2026-03-14 11:12:50'),(34,'嵩山197站',23.1583640,113.3589260,'2026-03-14 11:14:00'),(35,'茶山小区站',23.1524120,113.3569960,'2026-03-14 11:15:31'),(36,'体育馆站',23.1530590,113.3590970,'2026-03-14 11:16:10'),(37,'人才公寓站',23.1505360,113.3593100,'2026-03-14 11:16:42'),(38,'牌坊站',23.1530810,113.3571500,'2026-03-14 11:21:43'),(39,'教四站',23.1526580,113.3664370,'2026-03-14 11:22:47'),(40,'汇景北站',23.1516710,113.3679810,'2026-03-14 11:23:31'),(41,'创客空间站',23.1516490,113.3689130,'2026-03-14 11:24:05'),(42,'泰山20栋站',23.1532080,113.3701310,'2026-03-14 11:24:42'),(43,'泰山24栋站',23.1539440,113.3719600,'2026-03-14 11:25:29'),(44,'教五广场站',23.1595700,113.3662620,'2026-03-14 11:29:49'),(45,'荷园站',23.1612350,113.3675350,'2026-03-14 11:30:22'),(46,'启林北桥头站',23.1622550,113.3689900,'2026-03-14 11:30:58');
/*!40000 ALTER TABLE `bus_stop` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `charging_plan_suggestion`
--

DROP TABLE IF EXISTS `charging_plan_suggestion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `charging_plan_suggestion` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL COMMENT '用户ID',
  `location_name` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '位置名称',
  `latitude` decimal(10,7) DEFAULT NULL COMMENT '纬度',
  `longitude` decimal(10,7) DEFAULT NULL COMMENT '经度',
  `reason` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci COMMENT '理由',
  `images` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin COMMENT '图片数组',
  `likes` int DEFAULT '0' COMMENT '点赞数',
  `comments` int DEFAULT '0' COMMENT '评论数',
  `status` tinyint DEFAULT '0' COMMENT '状态: 0待审核 1已采纳 2已拒绝',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  KEY `user_id` (`user_id`) USING BTREE,
  KEY `idx_status` (`status`) USING BTREE,
  CONSTRAINT `charging_plan_suggestion_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `charging_plan_suggestion_chk_1` CHECK (json_valid(`images`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC COMMENT='充电桩规划建议表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `charging_plan_suggestion`
--

LOCK TABLES `charging_plan_suggestion` WRITE;
/*!40000 ALTER TABLE `charging_plan_suggestion` DISABLE KEYS */;
/*!40000 ALTER TABLE `charging_plan_suggestion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `charging_record`
--

DROP TABLE IF EXISTS `charging_record`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `charging_record` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL COMMENT '用户ID',
  `station_id` int NOT NULL COMMENT '充电桩ID',
  `start_time` datetime NOT NULL COMMENT '开始时间',
  `end_time` datetime DEFAULT NULL COMMENT '结束时间',
  `duration` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '充电时长',
  `energy` decimal(10,2) DEFAULT NULL COMMENT '充电量(kWh)',
  `electricity` decimal(6,2) DEFAULT NULL COMMENT '用电量(度)',
  `cost` decimal(8,2) DEFAULT NULL COMMENT '费用(元)',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'completed' COMMENT '充电状态: completed-正常完成, cancelled-已取消',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  KEY `station_id` (`station_id`) USING BTREE,
  KEY `idx_user` (`user_id`) USING BTREE,
  CONSTRAINT `charging_record_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `charging_record_ibfk_2` FOREIGN KEY (`station_id`) REFERENCES `charging_station` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC COMMENT='充电记录表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `charging_record`
--

LOCK TABLES `charging_record` WRITE;
/*!40000 ALTER TABLE `charging_record` DISABLE KEYS */;
/*!40000 ALTER TABLE `charging_record` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `charging_reservation`
--

DROP TABLE IF EXISTS `charging_reservation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `charging_reservation` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL COMMENT '用户ID',
  `station_id` int NOT NULL COMMENT '充电桩ID',
  `start_time` datetime NOT NULL COMMENT '预约开始时间',
  `end_time` datetime DEFAULT NULL COMMENT '预约结束时间',
  `status` tinyint DEFAULT '1' COMMENT '状态: 1预约中 2充电中 3已完成 4已取消',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `duration` int DEFAULT '60' COMMENT '预计充电时长(分钟)',
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '联系电话',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  KEY `idx_user` (`user_id`) USING BTREE,
  KEY `idx_station` (`station_id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC COMMENT='充电预约表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `charging_reservation`
--

LOCK TABLES `charging_reservation` WRITE;
/*!40000 ALTER TABLE `charging_reservation` DISABLE KEYS */;
INSERT INTO `charging_reservation` VALUES (18,1,2,'2026-02-15 14:22:13',NULL,4,'2026-02-15 14:22:13',60,'13800138000','2026-02-25 02:26:58'),(19,1,3,'2026-02-15 14:23:46',NULL,4,'2026-02-15 14:23:46',60,'13800138000','2026-02-25 02:26:58'),(20,1,4,'2026-02-15 14:23:48',NULL,4,'2026-02-15 14:23:48',60,'13800138000','2026-02-25 02:26:58'),(21,3,2,'2026-02-15 14:25:23',NULL,3,'2026-02-15 14:25:23',60,'19879099190','2026-02-15 14:26:01'),(22,3,2,'2026-02-16 05:41:55',NULL,3,'2026-02-16 05:41:55',60,'19879099190','2026-02-16 08:21:43'),(23,3,2,'2026-02-16 08:27:44',NULL,3,'2026-02-16 08:27:44',60,'19879099190','2026-02-16 08:41:58'),(24,3,3,'2026-02-16 08:27:59',NULL,3,'2026-02-16 08:27:59',60,'19879099190','2026-02-16 11:52:55'),(25,3,2,'2026-02-16 08:42:07',NULL,3,'2026-02-16 08:42:07',60,'19879099190','2026-02-16 11:49:55'),(26,3,2,'2026-02-16 11:53:26',NULL,2,'2026-02-16 11:53:26',60,'19879099190','2026-02-16 12:25:54'),(27,3,3,'2026-02-17 11:35:56',NULL,2,'2026-02-17 11:35:56',60,'19879099190','2026-02-17 11:35:59'),(28,3,2,'2026-02-25 02:31:05',NULL,2,'2026-02-25 02:31:05',60,'19879099190','2026-02-25 02:31:07'),(29,3,2,'2026-02-25 12:00:00',NULL,3,'2026-02-25 12:23:19',13,'19879099190','2026-02-25 12:23:27'),(30,3,2,'2026-02-25 12:00:00',NULL,2,'2026-02-25 12:23:34',13,'19879099190','2026-02-25 12:23:46'),(31,3,2,'2026-02-25 01:00:00',NULL,3,'2026-02-25 12:41:31',60,'19879099190','2026-02-25 12:41:40'),(32,3,2,'2026-02-26 01:00:00',NULL,2,'2026-02-25 12:41:52',60,'19879099190','2026-02-25 12:42:01'),(33,3,2,'2026-02-25 12:42:34',NULL,2,'2026-02-25 12:42:34',60,'19879099190','2026-02-25 12:42:41'),(34,3,2,'2026-02-26 01:00:00',NULL,2,'2026-02-25 12:43:01',60,'19879099190','2026-02-25 12:43:06'),(35,3,2,'2026-02-26 01:01:00',NULL,3,'2026-02-25 12:43:41',60,'19879099190','2026-02-25 12:46:40'),(36,3,2,'2026-03-06 10:17:48',NULL,4,'2026-03-06 10:17:48',60,'19879099190','2026-03-06 10:18:48');
/*!40000 ALTER TABLE `charging_reservation` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `charging_station`
--

DROP TABLE IF EXISTS `charging_station`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `charging_station` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '名称',
  `location` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '位置描述',
  `latitude` decimal(10,7) NOT NULL COMMENT '纬度',
  `longitude` decimal(10,7) NOT NULL COMMENT '经度',
  `status` tinyint DEFAULT '0' COMMENT '状态: 0空闲 1充电中 2已预约 3故障',
  `power` int DEFAULT NULL COMMENT '功率(W)',
  `total_slots` int DEFAULT '1' COMMENT '总插槽数',
  `available_slots` int DEFAULT '1' COMMENT '可用插槽数',
  `price` decimal(6,2) DEFAULT NULL COMMENT '价格(元/度)',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  KEY `idx_status` (`status`) USING BTREE,
  KEY `idx_location` (`latitude`,`longitude`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC COMMENT='充电桩表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `charging_station`
--

LOCK TABLES `charging_station` WRITE;
/*!40000 ALTER TABLE `charging_station` DISABLE KEYS */;
INSERT INTO `charging_station` VALUES (14,'图书馆充电柜','位于图书馆附近',23.1569570,113.3537960,0,500,4,4,0.63,'2026-03-09 04:37:22','2026-03-09 04:37:22'),(15,'教三充电柜','位于教三附近',23.1585020,113.3518940,0,500,4,4,0.63,'2026-03-09 04:38:17','2026-03-09 04:43:20'),(16,'人文与法学院充电柜','人文与法学院附近',23.1581110,113.3495790,0,500,4,4,0.63,'2026-03-09 04:43:08','2026-03-09 04:43:08'),(17,'华山区7栋充电柜','位于华山区7栋附近',23.1600240,113.3478720,0,500,4,4,0.63,'2026-03-09 04:44:27','2026-03-09 04:44:27'),(18,'华山区12栋充电柜','位于华山区12栋附近',23.1606540,113.3481860,0,500,4,4,0.63,'2026-03-09 04:45:41','2026-03-09 04:45:41'),(19,'数学与信息学院充电柜','位于数学与信息学院附近',23.1611670,113.3510430,0,500,4,4,0.63,'2026-03-09 04:46:53','2026-03-09 04:46:53'),(20,'六一操场充电柜','位于六一操场附近',23.1631510,113.3549790,0,500,4,4,0.63,'2026-03-09 04:49:26','2026-03-09 04:49:26'),(21,'六一区33栋充电柜','位于六一区33栋楼下',23.1616910,113.3532440,0,500,4,4,0.63,'2026-03-09 04:50:26','2026-03-09 04:50:26'),(22,'六一区27栋充电柜','位于六一区27栋楼下',23.1616910,113.3532440,0,500,4,4,0.63,'2026-03-09 04:52:20','2026-03-09 04:52:20'),(23,'林风学院充电柜','位于林风学院附近',23.1596870,113.3620540,0,500,4,4,0.63,'2026-03-09 04:53:32','2026-03-09 04:53:32'),(24,'启林南36栋充电柜','位于启林南36栋楼下',23.1601280,113.3670350,0,500,4,4,0.63,'2026-03-09 04:54:46','2026-03-09 04:54:46');
/*!40000 ALTER TABLE `charging_station` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `flower_checkins`
--

DROP TABLE IF EXISTS `flower_checkins`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `flower_checkins` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL COMMENT '用户ID',
  `spot_id` int NOT NULL COMMENT '赏花点ID',
  `images` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci COMMENT '打卡图片(JSON)',
  `comment` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci COMMENT '打卡评论',
  `rating` int DEFAULT '5' COMMENT '评分',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  KEY `idx_user_id` (`user_id`) USING BTREE,
  KEY `idx_spot_id` (`spot_id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC COMMENT='赏花打卡表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `flower_checkins`
--

LOCK TABLES `flower_checkins` WRITE;
/*!40000 ALTER TABLE `flower_checkins` DISABLE KEYS */;
INSERT INTO `flower_checkins` VALUES (1,1,8,'[\"/images/flower/flower_1773069445362_3kv2su.jpeg\"]','',5,'2026-03-09 15:17:25');
/*!40000 ALTER TABLE `flower_checkins` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `flower_routes`
--

DROP TABLE IF EXISTS `flower_routes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `flower_routes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '路线名称',
  `duration` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '游览时长',
  `distance` int DEFAULT NULL COMMENT '路线距离(米)',
  `difficulty` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '难度等级',
  `spots` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci COMMENT '途经景点(JSON)',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci COMMENT '路线描述',
  `best_time` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '最佳时间',
  `tags` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci COMMENT '标签(JSON)',
  `highlights` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci COMMENT '路线亮点(JSON)',
  `tips` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci COMMENT '游玩贴士(JSON)',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC COMMENT='赏花路线表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `flower_routes`
--

LOCK TABLES `flower_routes` WRITE;
/*!40000 ALTER TABLE `flower_routes` DISABLE KEYS */;
INSERT INTO `flower_routes` VALUES (1,'热门赏花路径','1-2小时',2000,'简单','[{\"spot_id\":16,\"order\":1,\"duration\":\"30分钟\"},{\"spot_id\":17,\"order\":2,\"duration\":\"30分钟\"},{\"spot_id\":12,\"order\":3,\"duration\":\"20分钟\"},{\"spot_id\":11,\"order\":4,\"duration\":\"30分钟\"}]','热门精华路线，涵盖紫荆林、木兰园等最受欢迎的赏花点，适合快速游览','3月-4月','[\"热门\",\"精华\"]','[\"紫荆花海\",\"木兰芬芳\"]','[\"建议上午游览，光线最佳\",\"携带相机记录美景\",\"注意防晒和补水\"]','2026-03-08 15:21:03','2026-03-13 14:41:56'),(2,'完整赏花点路径','4-5小时',4000,'困难','[{\"spot_id\":16,\"order\":1,\"duration\":\"30分钟\"},{\"spot_id\":17,\"order\":2,\"duration\":\"30分钟\"},{\"spot_id\":15,\"order\":3,\"duration\":\"20分钟\"},{\"spot_id\":14,\"order\":4,\"duration\":\"30分钟\"},{\"spot_id\":13,\"order\":5,\"duration\":\"30分钟\"},{\"spot_id\":12,\"order\":6,\"duration\":\"20分钟\"},{\"spot_id\":11,\"order\":7,\"duration\":\"30分钟\"},{\"spot_id\":10,\"order\":8,\"duration\":\"30分钟\"},{\"spot_id\":9,\"order\":9,\"duration\":\"20分钟\"},{\"spot_id\":8,\"order\":10,\"duration\":\"20分钟\"}]','覆盖全部赏花点的深度游线路，适合周末全天游览，可以慢慢欣赏拍照','3月-4月','[\"深度游\",\"全景\"]','[\"十大赏花点全覆盖\",\"拍照圣地\"]','[\"建议全天游览，中午可在食堂用餐\",\"穿舒适运动鞋\",\"携带充足饮用水\",\"准备防晒用品\"]','2026-03-08 15:36:55','2026-03-13 14:41:56'),(3,'深度游玩','3-4小时',3000,'中等','[{\"spot_id\":16,\"order\":1,\"duration\":\"30分钟\"},{\"spot_id\":17,\"order\":2,\"duration\":\"30分钟\"},{\"spot_id\":15,\"order\":3,\"duration\":\"20分钟\"},{\"spot_id\":14,\"order\":4,\"duration\":\"30分钟\"},{\"spot_id\":13,\"order\":5,\"duration\":\"30分钟\"},{\"spot_id\":12,\"order\":6,\"duration\":\"20分钟\"},{\"spot_id\":11,\"order\":7,\"duration\":\"30分钟\"}]','精选7个赏花点的深度游线路，节奏适中，适合摄影爱好者','3月-4月','[\"深度游\",\"摄影\"]','[\"七大精选赏花点\",\"最佳摄影路线\"]','[\"建议半天游览\",\"上午光线适合拍照\",\"兰花园和茶花园值得多停留\"]','2026-03-08 15:42:58','2026-03-13 14:41:56');
/*!40000 ALTER TABLE `flower_routes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `flower_spots`
--

DROP TABLE IF EXISTS `flower_spots`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `flower_spots` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '赏花点名称',
  `type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '花卉类型',
  `latitude` decimal(10,7) NOT NULL COMMENT '纬度',
  `longitude` decimal(10,7) NOT NULL COMMENT '经度',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci COMMENT '简介',
  `detailed_description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci COMMENT '详细介绍',
  `images` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci COMMENT '图片列表(JSON)',
  `video_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '视频URL',
  `panorama_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '360全景URL',
  `live_stream_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '直播流URL',
  `best_time` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '最佳观赏时间',
  `peak_time` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '盛花期',
  `open_time` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '开放时间',
  `features` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci COMMENT '特色标签(JSON)',
  `rating` decimal(3,2) DEFAULT '0.00' COMMENT '评分',
  `view_count` int DEFAULT '0' COMMENT '浏览量',
  `favorite_count` int DEFAULT '0' COMMENT '收藏量',
  `checkin_count` int DEFAULT '0' COMMENT '打卡量',
  `status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'upcoming' COMMENT '状态: blooming/upcoming/ended',
  `bloom_progress` int DEFAULT '0' COMMENT '花期进度',
  `tips` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci COMMENT '游玩贴士(JSON)',
  `facilities` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci COMMENT '配套设施(JSON)',
  `transportation` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci COMMENT '交通指南(JSON)',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  KEY `idx_type` (`type`) USING BTREE,
  KEY `idx_status` (`status`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC COMMENT='赏花点表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `flower_spots`
--

LOCK TABLES `flower_spots` WRITE;
/*!40000 ALTER TABLE `flower_spots` DISABLE KEYS */;
INSERT INTO `flower_spots` VALUES (8,'温室训练馆旁赏花点','其他',23.1607560,113.3708780,'附件有匹克球运动场，篮球场，稻香园',NULL,'[\"/images/flower/flower_1772936355871_rhh945.jpg\"]',NULL,NULL,NULL,'',NULL,NULL,'[]',1.10,16,0,141,'upcoming',0,NULL,NULL,NULL,'2026-03-08 02:21:10','2026-04-08 09:48:12'),(9,'荷园后赏花点','其他',23.1609350,113.3682930,'附近有荷园食堂',NULL,'[\"/images/flower/flower_1772936773798_2p27x3.jpg\"]',NULL,NULL,NULL,'',NULL,NULL,'[]',2.10,1,0,72,'blooming',0,NULL,NULL,NULL,'2026-03-08 02:27:04','2026-03-15 09:42:06'),(10,'善境花园','其他',23.1596030,113.3606110,'',NULL,'[\"/images/flower/flower_1772937146203_bez88n.jpg\"]',NULL,NULL,NULL,'',NULL,NULL,'[]',3.70,7,0,24,'blooming',0,NULL,NULL,NULL,'2026-03-08 02:29:54','2026-03-15 09:42:06'),(11,'宫粉紫荆','紫荆花',23.1561930,113.3571660,'宫粉羊蹄甲（学名：Bauhinia variegata L.）是豆科、羊蹄甲属植物。落叶乔木；树皮暗褐色，近光滑。叶近革质，广卵形至近圆形。总状花序侧生或顶生，花瓣长4-5厘米，紫红色或淡红色，杂以黄绿色及暗紫色的斑纹。荚果带状，扁平；种子10-15颗。花期全年，3月最盛。原产于中国南部、印度、中南半岛，在热带、亚热带地区广泛栽培。为典型的阳性树种，喜温暖湿润气候。 ',NULL,'[\"/images/flower/flower_1772939288518_y4enr3.jpg\"]',NULL,NULL,NULL,'',NULL,NULL,'[]',3.90,3,0,347,'blooming',0,NULL,NULL,NULL,'2026-03-08 02:35:45','2026-03-15 10:18:24'),(12,'竹林餐厅赏花点','其他',23.1561930,113.3571660,'打卡热门点，三角梅，位于竹林餐厅后面',NULL,'[\"/images/flower/flower_1772939254232_zix3yx.jpg\",\"/images/flower/flower_1772939254252_s6vjyx.jpg\"]',NULL,NULL,NULL,'3月',NULL,NULL,'[]',5.00,1,0,8,'blooming',0,NULL,NULL,NULL,'2026-03-08 03:02:20','2026-03-15 09:42:06'),(13,'茶花园','其他',23.1567570,113.3491500,'茶花，山茶科山茶属常绿灌木或小乔木。嫩枝无毛，叶片椭圆形或倒卵状椭圆形；基部阔楔形；花顶生，红色，无柄；花瓣6~7片，倒卵圆形；子房无毛，花柱长2.5厘米，先端3裂；蒴果圆球形，2~3室，每室有种子1~2个；花期1~4月。',NULL,'[\"/images/flower/flower_1772939399967_wtgc4o.jpg\"]',NULL,NULL,NULL,'',NULL,NULL,'[]',3.90,1,0,116,'blooming',0,NULL,NULL,NULL,'2026-03-08 03:10:01','2026-03-15 09:42:06'),(14,'兰花园','其他',23.1576870,113.3478470,'兰花（学名：Cymbidium ssp.）：是单子叶植物纲、兰科、兰属植物通称。附生或地生草本，叶数枚至多枚，通常生于假鳞茎基部或下部节上，二列，带状或罕有倒披针形至狭椭圆形，基部一般有宽阔的鞘并围抱假鳞茎，有关节。总状花序具数花或多花，颜色有白、纯白、白绿、黄绿、淡黄、淡黄褐、黄、红、青、紫',NULL,'[\"/images/flower/flower_1772939502475_qo5j7p.jpg\"]',NULL,NULL,NULL,'',NULL,NULL,'[]',3.90,1,0,37,'blooming',0,NULL,NULL,NULL,'2026-03-08 03:11:59','2026-03-15 09:42:06'),(15,'柚木林','其他',23.1558320,113.3518740,'柚木（Tectona grandis L. f.），又称胭脂树、紫柚木、血树等， 是唇形科柚木属植物大乔木，树高达40-50米，胸径2-2.5米，干通直。树皮褐色或灰色，枝四棱形，被星状毛。叶对生，极大，卵形或椭圆形，背面密被灰黄色星状毛。圆锥花序阔大，秋季开花，花白色，芳香，果球形，深褐色，被细绒毛。花期8月，果期10月 [13]。',NULL,'[\"/images/flower/flower_1772940072195_5fhzuu.jpg\"]',NULL,NULL,NULL,'8月',NULL,NULL,'[]',3.90,2,0,10,'upcoming',0,NULL,NULL,NULL,'2026-03-08 03:21:14','2026-03-15 09:42:06'),(16,'紫荆林','紫荆花',23.1547370,113.3544420,'紫荆（学名：Cercis chinensis Bunge）是豆科紫荆属植物，又称紫珠、裸枝树、满条红、白花紫荆等。丛生或单生灌木 [1-2]。其树皮和小枝灰白色；叶纸质，近圆形或三角状圆形；花紫红色或粉红色，通常先于叶开放；龙骨瓣基部具深紫色斑纹；子房嫩绿色，花蕾时光亮无毛，后期则密被短柔毛；荚果扁狭长形，绿色；种子2-6颗，阔长圆形，黑褐色，光亮。花期3-4月，果期8-10月',NULL,'[\"/images/flower/flower_1772940348588_w3dvcw.jpg\",\"/images/flower/flower_1772940348608_p2jsyy.jpg\"]',NULL,NULL,NULL,'3-4月',NULL,NULL,'[]',5.00,1,0,316,'blooming',0,NULL,NULL,NULL,'2026-03-08 03:25:52','2026-03-15 09:42:06'),(17,'木兰园','其他',23.1566460,113.3547830,'木兰（学名：Magnoliaceae Juss.）是木兰目木兰科植物的统称。 [1]约340种。 [7]木本；叶互生、簇生或近轮生，单叶不分裂，罕分裂。花顶生、腋生、罕成为2-3朵的聚伞花序。花被片通常花瓣状；雄蕊多数，子房上位，心皮多数，离生，罕合生，虫媒传粉，胚珠着生于腹缝线，胚小、胚乳丰富。 [3]',NULL,'[\"/images/flower/flower_1772940780249_167tzf.jpg\",\"/images/flower/flower_1772940780258_p7p2eu.jpg\"]',NULL,NULL,NULL,'',NULL,NULL,'[]',5.00,5,0,80,'blooming',0,NULL,NULL,NULL,'2026-03-08 03:33:31','2026-03-15 10:18:08');
/*!40000 ALTER TABLE `flower_spots` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `frequent_route`
--

DROP TABLE IF EXISTS `frequent_route`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `frequent_route` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL COMMENT '用户ID',
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '路线名称',
  `from_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '起点名称',
  `from_latitude` decimal(10,7) DEFAULT NULL COMMENT '起点纬度',
  `from_longitude` decimal(10,7) DEFAULT NULL COMMENT '起点经度',
  `to_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '终点名称',
  `to_latitude` decimal(10,7) DEFAULT NULL COMMENT '终点纬度',
  `to_longitude` decimal(10,7) DEFAULT NULL COMMENT '终点经度',
  `mode` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '出行方式',
  `duration` int DEFAULT NULL COMMENT '时长(分钟)',
  `distance` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '距离',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  KEY `idx_user` (`user_id`) USING BTREE,
  CONSTRAINT `frequent_route_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC COMMENT='常用路线表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `frequent_route`
--

LOCK TABLES `frequent_route` WRITE;
/*!40000 ALTER TABLE `frequent_route` DISABLE KEYS */;
/*!40000 ALTER TABLE `frequent_route` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `news`
--

DROP TABLE IF EXISTS `news`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `news` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '标题',
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci COMMENT '内容',
  `image` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '封面图',
  `author` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '作者',
  `views` int DEFAULT '0' COMMENT '浏览量',
  `likes` int DEFAULT '0' COMMENT '点赞数',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC COMMENT='校园动态表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `news`
--

LOCK TABLES `news` WRITE;
/*!40000 ALTER TABLE `news` DISABLE KEYS */;
INSERT INTO `news` VALUES (1,'华农校园导航小程序正式上线','华农掌中行小程序今日正式上线,为师生提供智能导航服务...',NULL,'校园管理处',1523,89,'2026-02-08 11:55:54'),(2,'新增充电桩投入使用','为方便师生电动车充电,学校在多个区域新增充电桩...',NULL,'后勤处',981,56,'2026-02-08 11:55:54');
/*!40000 ALTER TABLE `news` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `parking_lot`
--

DROP TABLE IF EXISTS `parking_lot`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `parking_lot` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '名称',
  `location` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '位置描述',
  `latitude` decimal(10,7) NOT NULL COMMENT '纬度',
  `longitude` decimal(10,7) NOT NULL COMMENT '经度',
  `total_spots` int DEFAULT '0' COMMENT '总车位数',
  `available_spots` int DEFAULT '0' COMMENT '可用车位数',
  `type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '类型: bike/ebike/car',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  KEY `idx_location` (`latitude`,`longitude`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC COMMENT='停车点表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `parking_lot`
--

LOCK TABLES `parking_lot` WRITE;
/*!40000 ALTER TABLE `parking_lot` DISABLE KEYS */;
INSERT INTO `parking_lot` VALUES (1,'东区停车场','东区食堂东侧',23.1580000,113.3520000,200,120,'ebike','2026-02-08 11:55:54','2026-02-08 11:55:54'),(2,'图书馆停车场','图书馆南侧',23.1590000,113.3530000,150,80,'bike','2026-02-08 11:55:54','2026-02-08 11:55:54'),(3,'体育馆停车场','体育馆西侧',23.1570000,113.3510000,100,60,'ebike','2026-02-08 11:55:54','2026-02-08 11:55:54'),(4,'东区停车场','东区食堂东侧',23.1580000,113.3520000,200,120,'ebike','2026-02-12 07:55:19','2026-02-12 07:55:19'),(5,'图书馆停车场','图书馆南侧',23.1590000,113.3530000,150,80,'bike','2026-02-12 07:55:19','2026-02-12 07:55:19'),(6,'体育馆停车场','体育馆西侧',23.1570000,113.3510000,100,60,'ebike','2026-02-12 07:55:19','2026-02-12 07:55:19'),(7,'东区停车场','东区食堂东侧',23.1580000,113.3520000,200,120,'ebike','2026-02-12 07:55:42','2026-02-12 07:55:42'),(8,'图书馆停车场','图书馆南侧',23.1590000,113.3530000,150,80,'bike','2026-02-12 07:55:42','2026-02-12 07:55:42'),(9,'体育馆停车场','体育馆西侧',23.1570000,113.3510000,100,60,'ebike','2026-02-12 07:55:42','2026-02-12 07:55:42'),(10,'东区停车场','东区食堂东侧',23.1580000,113.3520000,200,120,'ebike','2026-02-12 07:56:01','2026-02-12 07:56:01'),(11,'图书馆停车场','图书馆南侧',23.1590000,113.3530000,150,80,'bike','2026-02-12 07:56:01','2026-02-12 07:56:01'),(12,'体育馆停车场','体育馆西侧',23.1570000,113.3510000,100,60,'ebike','2026-02-12 07:56:01','2026-02-12 07:56:01');
/*!40000 ALTER TABLE `parking_lot` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `poi`
--

DROP TABLE IF EXISTS `poi`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `poi` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '名称',
  `type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '类型: canteen/library/classroom/dormitory/scenic/sports/office/shop',
  `latitude` decimal(10,7) NOT NULL COMMENT '纬度',
  `longitude` decimal(10,7) NOT NULL COMMENT '经度',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci COMMENT '描述',
  `image` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '图片',
  `rating` decimal(3,2) DEFAULT '0.00' COMMENT '评分',
  `open_time` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '开放时间',
  `hot` tinyint DEFAULT '0' COMMENT '是否热门',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  KEY `idx_type` (`type`) USING BTREE,
  KEY `idx_location` (`latitude`,`longitude`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=359 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC COMMENT='兴趣点表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `poi`
--

LOCK TABLES `poi` WRITE;
/*!40000 ALTER TABLE `poi` DISABLE KEYS */;
INSERT INTO `poi` VALUES (3,'第一教学楼','classroom',23.1600000,113.3540000,'主要教学楼,承担大部分本科生课程',NULL,4.20,'06:00-23:00',0,'2026-02-08 11:55:54'),(5,'体育馆','sports',23.1570000,113.3510000,'综合体育馆,羽毛球、篮球等场地',NULL,4.30,'09:00-21:00',0,'2026-02-08 11:55:54'),(8,'荷园饭堂','canteen',23.1634778,113.3623385,'女生最多的饭堂，有自选餐厅',NULL,0.00,NULL,0,'2026-02-12 07:55:15'),(9,'芷园饭堂','canteen',23.1559913,113.3606275,'最好吃的饭堂',NULL,0.00,NULL,0,'2026-02-12 07:55:15'),(10,'东区食堂','canteen',23.1580000,113.3520000,'东区最大的食堂,三层楼提供多种美食',NULL,4.50,'07:00-21:00',1,'2026-02-12 07:55:19'),(11,'图书馆','library',23.1590000,113.3530000,'华农图书馆,藏书丰富,自习环境优良',NULL,4.80,'08:00-22:00',1,'2026-02-12 07:55:19'),(51,'西园饭堂','canteen',23.1640391,113.3416802,'最难吃的饭堂',NULL,0.00,NULL,0,'2026-02-12 11:03:43'),(61,'绿榕园','canteen',23.1588643,113.3495344,'图书馆旁，曾是教师饭堂，现正重建',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(62,'莘园','canteen',23.1657838,113.3519414,'研究生就餐区',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(63,'稻香园','canteen',23.1656354,113.3640164,'启林北学生就餐区',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(64,'教二','classroom',23.1613053,113.3418057,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(65,'教一','classroom',23.1616588,113.3448865,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(66,'教三','classroom',23.1607070,113.3462135,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(67,'教四','classroom',23.1546156,113.3605691,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(68,'教五','classroom',23.1633151,113.3601583,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(69,'图书馆','classroom',23.1600562,113.3481753,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(70,'华山宿舍20','dormitory',23.1609279,113.3394194,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(71,'华山宿舍21','dormitory',23.1606835,113.3394169,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(72,'华山宿舍22','dormitory',23.1603875,113.3394146,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(73,'华山宿舍23','dormitory',23.1601570,113.3394194,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(74,'华山宿舍24','dormitory',23.1599127,113.3394281,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(75,'华山宿舍1','dormitory',23.1622671,113.3403545,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(76,'华山宿舍2','dormitory',23.1626593,113.3411640,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(77,'华山宿舍3','dormitory',23.1626909,113.3421166,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(78,'华山宿舍4','dormitory',23.1618091,113.3402860,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(79,'华山宿舍5','dormitory',23.1621146,113.3409210,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(80,'华山宿舍6','dormitory',23.1623000,113.3416570,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(81,'华山宿舍7','dormitory',23.1622549,113.3423830,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(82,'华山宿舍8','dormitory',23.1621800,113.3433921,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(83,'华山宿舍9','dormitory',23.1624311,113.3433834,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(84,'华山宿舍10','dormitory',23.1627263,113.3431996,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(85,'华山宿舍11','dormitory',23.1629562,113.3430161,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(86,'华山宿舍12','dormitory',23.1632405,113.3426834,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(87,'华山宿舍13','dormitory',23.1634913,113.3425705,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(88,'华山宿舍14','dormitory',23.1638816,113.3428964,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(89,'华山宿舍15','dormitory',23.1640732,113.3426200,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(90,'华山宿舍16','dormitory',23.1642717,113.3423659,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(91,'华山宿舍17','dormitory',23.1645218,113.3420930,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(92,'华山宿舍18','dormitory',23.1647376,113.3418426,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(93,'华山宿舍区公寓管理中心','dormitory',23.1628236,113.3417179,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(94,'西门','dormitory',23.1658241,113.3407802,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(95,'北门','dormitory',23.1646261,113.3473220,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(96,'嵩山教工住宅区','dormitory',23.1604736,113.3509673,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(97,'校门口','dormitory',23.1555400,113.3463500,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(98,'华农大站','dormitory',23.1545531,113.3498570,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(99,'茶山宿舍茶山区教工住宅区','dormitory',23.1540215,113.3503024,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(100,'树木园','dormitory',23.1564417,113.3537967,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(101,'跃进北','dormitory',23.1649215,113.3632890,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(102,'跃进南','dormitory',23.1625125,113.3632706,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(103,'五山公寓管理中心','dormitory',23.1557830,113.3620618,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(104,'五山公寓1','dormitory',23.1543752,113.3611613,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(105,'五山公寓2','dormitory',23.1547072,113.3611634,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(106,'五山公寓3','dormitory',23.1550563,113.3611507,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(107,'五山公寓4','dormitory',23.1553883,113.3611454,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(108,'五山公寓5','dormitory',23.1543797,113.3622754,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(109,'五山公寓6','dormitory',23.1546980,113.3622702,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(110,'五山公寓7','dormitory',23.1550505,113.3622575,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(111,'五山公寓8','dormitory',23.1553893,113.3622447,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(112,'五山公寓9','dormitory',23.1558992,113.3622349,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(113,'五山公寓10','dormitory',23.1543860,113.3629861,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(114,'五山公寓11','dormitory',23.1547146,113.3629882,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(115,'五山公寓12','dormitory',23.1550637,113.3629829,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(116,'五山公寓13','dormitory',23.1553809,113.3630074,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(117,'五山公寓14','dormitory',23.1543159,113.3635885,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(118,'五山公寓15','dormitory',23.1547498,113.3637134,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(119,'五山公寓16','dormitory',23.1552419,113.3637062,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(120,'印刷厂','dormitory',23.1617765,113.3414211,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(121,'华山宿舍19','dormitory',23.1632599,113.3402938,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(122,'测试中心','dormitory',23.1597163,113.3457010,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(123,'启林南宿舍37','dormitory',23.1624014,113.3613423,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(124,'启林南宿舍38','dormitory',23.1624096,113.3618582,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(125,'启林南宿舍39','dormitory',23.1624078,113.3624119,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(126,'启林南宿舍36','dormitory',23.1619367,113.3620912,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(127,'启林南宿舍35','dormitory',23.1617116,113.3623891,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(128,'启林南宿舍34','dormitory',23.1617130,113.3618171,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(129,'启林南宿舍33','dormitory',23.1613310,113.3622188,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(130,'启林南宿舍32','dormitory',23.1611184,113.3622818,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(131,'启林南宿舍31','dormitory',23.1608683,113.3624799,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(132,'启林北宿舍55','dormitory',23.1651615,113.3639798,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(133,'启林北宿舍54','dormitory',23.1648730,113.3639500,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(134,'启林北宿舍49','dormitory',23.1645975,113.3639582,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(135,'启林北宿舍48','dormitory',23.1643347,113.3639560,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(136,'启林北宿舍57','dormitory',23.1651575,113.3645759,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(137,'启林北宿舍56','dormitory',23.1648788,113.3645876,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(138,'启林北宿舍51','dormitory',23.1645968,113.3645820,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(139,'启林北宿舍50','dormitory',23.1643340,113.3645625,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(140,'启林北宿舍53','dormitory',23.1646199,113.3655592,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(141,'启林北宿舍52','dormitory',23.1643188,113.3655641,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(142,'启林北宿舍47','dormitory',23.1640880,113.3655513,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(143,'启林北宿舍46','dormitory',23.1637901,113.3655596,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(144,'启林北宿舍45','dormitory',23.1635144,113.3655297,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(145,'六一区宿舍六一区35','dormitory',23.1644437,113.3480902,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(146,'六一区宿舍六一区34','dormitory',23.1641916,113.3479913,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(147,'六一区宿舍六一区33','dormitory',23.1639744,113.3478189,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(148,'六一区宿舍六一区32','dormitory',23.1636773,113.3476990,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(149,'六一区宿舍六一区31','dormitory',23.1634286,113.3476568,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(150,'六一区宿舍六一区30','dormitory',23.1631321,113.3476929,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(151,'六一区宿舍六一区39','dormitory',23.1641372,113.3483991,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(152,'六一区宿舍六一区38','dormitory',23.1638561,113.3482878,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(153,'六一区宿舍六一区37','dormitory',23.1635913,113.3482283,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(154,'六一区宿舍六一区36','dormitory',23.1633028,113.3482731,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(155,'六一区宿舍六一区14','dormitory',23.1633564,113.3495995,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(156,'六一区宿舍六一区15','dormitory',23.1635819,113.3498326,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(157,'六一区宿舍六一区13','dormitory',23.1632855,113.3499034,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(158,'六一区宿舍六一区12','dormitory',23.1631403,113.3496786,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(159,'六一区宿舍六一区10','dormitory',23.1629884,113.3497921,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(160,'六一区宿舍六一区11','dormitory',23.1631497,113.3500341,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(161,'六一区宿舍六一区8','dormitory',23.1628367,113.3499402,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(162,'六一区宿舍六一区9','dormitory',23.1629983,113.3502516,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(163,'六一区宿舍六一区6','dormitory',23.1624751,113.3490242,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(164,'六一区宿舍六一区7','dormitory',23.1626125,113.3495520,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(165,'六一区宿舍六一区1','dormitory',23.1622098,113.3489749,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(166,'六一区宿舍六一区2','dormitory',23.1622319,113.3492784,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(167,'六一区宿舍六一区3','dormitory',23.1623320,113.3496096,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(168,'六一区宿舍六一区5','dormitory',23.1625480,113.3503000,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(169,'研究生宿舍7','dormitory',23.1654127,113.3519490,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(170,'研究生宿舍2','dormitory',23.1649467,113.3520953,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(171,'研究生宿舍3','dormitory',23.1650419,113.3528985,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(172,'研究生宿舍4','dormitory',23.1650444,113.3535143,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(173,'研究生宿舍5','dormitory',23.1650471,113.3541516,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(174,'研究生宿舍6','dormitory',23.1650563,113.3547960,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(175,'研究生宿舍8','dormitory',23.1654855,113.3520873,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(176,'研究生宿舍9','dormitory',23.1654889,113.3529105,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(177,'基建处','dormitory',23.1619446,113.3516030,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(178,'嵩山住宅区44','dormitory',23.1614316,113.3492138,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(179,'嵩山住宅区43a','dormitory',23.1615527,113.3496858,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(180,'嵩山住宅区43b','dormitory',23.1617402,113.3501933,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(181,'嵩山住宅区42','dormitory',23.1618472,113.3504649,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(182,'嵩山住宅区41','dormitory',23.1611735,113.3492509,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(183,'嵩山住宅区40','dormitory',23.1612753,113.3498447,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(184,'嵩山住宅区39','dormitory',23.1615897,113.3506309,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(185,'嵩山公寓西楼','dormitory',23.1608358,113.3492382,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(186,'嵩山公寓东楼','dormitory',23.1609442,113.3498392,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(187,'嵩山住宅区38','dormitory',23.1612978,113.3505034,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(188,'嵩山住宅区37','dormitory',23.1613651,113.3507680,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(189,'嵩山住宅区36','dormitory',23.1611061,113.3505759,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(190,'嵩山住宅区35','dormitory',23.1611736,113.3508835,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(191,'嵩山住宅区48','dormitory',23.1605474,113.3499413,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(192,'嵩山住宅区13','dormitory',23.1608228,113.3508995,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(193,'嵩山住宅区12','dormitory',23.1605711,113.3508792,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(194,'嵩山住宅区29','dormitory',23.1612287,113.3514059,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(195,'嵩山住宅区34','dormitory',23.1612771,113.3518855,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(196,'嵩山住宅区57','dormitory',23.1613983,113.3523861,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(197,'嵩山住宅区28','dormitory',23.1609308,113.3514074,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(198,'嵩山住宅区33','dormitory',23.1610324,113.3519582,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(199,'嵩山住宅区52','dormitory',23.1611133,113.3523087,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(200,'嵩山住宅区56','dormitory',23.1612004,113.3525733,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(201,'嵩山住宅区64','dormitory',23.1620109,113.3532281,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(202,'嵩山住宅区62','dormitory',23.1617920,113.3531361,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(203,'嵩山住宅区60','dormitory',23.1615600,113.3530584,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(204,'嵩山住宅区61','dormitory',23.1615476,113.3532805,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(205,'嵩山住宅区59','dormitory',23.1612886,113.3530741,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(206,'嵩山住宅区58','dormitory',23.1610574,113.3532041,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(207,'嵩山住宅区27','dormitory',23.1606930,113.3515446,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(208,'嵩山住宅区32','dormitory',23.1608074,113.3519951,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(209,'嵩山住宅区51','dormitory',23.1608687,113.3523958,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(210,'嵩山住宅区55','dormitory',23.1609624,113.3526460,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(211,'嵩山住宅区47','dormitory',23.1602033,113.3499931,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(212,'嵩山住宅区46','dormitory',23.1602315,113.3504226,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(213,'嵩山住宅区11','dormitory',23.1603599,113.3510378,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(214,'嵩山住宅区26','dormitory',23.1604545,113.3515028,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(215,'嵩山住宅区31','dormitory',23.1605892,113.3520535,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(216,'嵩山住宅区50','dormitory',23.1606171,113.3524042,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(217,'嵩山住宅区54','dormitory',23.1607046,113.3527546,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(218,'嵩山住宅区45','dormitory',23.1600003,113.3505311,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(219,'嵩山住宅区49','dormitory',23.1603790,113.3524698,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(220,'嵩山住宅区53','dormitory',23.1604531,113.3527702,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(221,'嵩山住宅区30','dormitory',23.1603510,113.3520904,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(222,'嵩山住宅区9','dormitory',23.1597289,113.3505539,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(223,'嵩山住宅区10','dormitory',23.1598372,113.3511191,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(224,'嵩山住宅区22','dormitory',23.1599518,113.3516341,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(225,'嵩山住宅区23','dormitory',23.1600194,113.3519560,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(226,'嵩山住宅区24','dormitory',23.1601405,113.3524280,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(227,'嵩山住宅区7','dormitory',23.1595244,113.3507482,'',NULL,0.00,NULL,0,'2026-02-12 11:04:47'),(228,'嵩山住宅区8','dormitory',23.1595990,113.3511775,'',NULL,0.00,NULL,0,'2026-02-12 11:04:48'),(229,'嵩山住宅区19','dormitory',23.1597072,113.3517068,'',NULL,0.00,NULL,0,'2026-02-12 11:04:48'),(230,'嵩山住宅区20','dormitory',23.1597481,113.3519931,'',NULL,0.00,NULL,0,'2026-02-12 11:04:48'),(231,'嵩山住宅区21','dormitory',23.1598556,113.3523864,'',NULL,0.00,NULL,0,'2026-02-12 11:04:48'),(232,'嵩山住宅区5','dormitory',23.1593330,113.3508852,'',NULL,0.00,NULL,0,'2026-02-12 11:04:48'),(233,'嵩山住宅区6','dormitory',23.1594273,113.3512714,'',NULL,0.00,NULL,0,'2026-02-12 11:04:48'),(234,'嵩山住宅区17','dormitory',23.1595085,113.3516935,'',NULL,0.00,NULL,0,'2026-02-12 11:04:48'),(235,'嵩山住宅区18','dormitory',23.1595828,113.3520511,'',NULL,0.00,NULL,0,'2026-02-12 11:04:48'),(236,'嵩山住宅区3','dormitory',23.1591019,113.3510510,'',NULL,0.00,NULL,0,'2026-02-12 11:04:48'),(237,'嵩山住宅区4','dormitory',23.1591562,113.3513586,'',NULL,0.00,NULL,0,'2026-02-12 11:04:48'),(238,'嵩山住宅区15','dormitory',23.1592507,113.3517950,'',NULL,0.00,NULL,0,'2026-02-12 11:04:48'),(239,'嵩山住宅区16','dormitory',23.1593113,113.3520453,'',NULL,0.00,NULL,0,'2026-02-12 11:04:48'),(240,'嵩山住宅区1','dormitory',23.1589167,113.3510877,'',NULL,0.00,NULL,0,'2026-02-12 11:04:48'),(241,'嵩山住宅区2','dormitory',23.1589576,113.3513596,'',NULL,0.00,NULL,0,'2026-02-12 11:04:48'),(242,'嵩山住宅区14','dormitory',23.1590587,113.3518031,'',NULL,0.00,NULL,0,'2026-02-12 11:04:48'),(243,'嵩山住宅区63','dormitory',23.1618066,113.3533766,'',NULL,0.00,NULL,0,'2026-02-12 11:04:48'),(244,'茶山宿舍1','dormitory',23.1543242,113.3492955,'',NULL,0.00,NULL,0,'2026-02-12 11:04:48'),(245,'茶山宿舍2','dormitory',23.1542162,113.3500818,'',NULL,0.00,NULL,0,'2026-02-12 11:04:48'),(246,'茶山宿舍3','dormitory',23.1541670,113.3508607,'',NULL,0.00,NULL,0,'2026-02-12 11:04:48'),(247,'茶山宿舍4','dormitory',23.1539912,113.3494953,'',NULL,0.00,NULL,0,'2026-02-12 11:04:48'),(248,'茶山宿舍5','dormitory',23.1539372,113.3506848,'',NULL,0.00,NULL,0,'2026-02-12 11:04:48'),(249,'茶山宿舍6','dormitory',23.1536981,113.3498436,'',NULL,0.00,NULL,0,'2026-02-12 11:04:48'),(250,'茶山宿舍7','dormitory',23.1535901,113.3506511,'',NULL,0.00,NULL,0,'2026-02-12 11:04:48'),(251,'茶山宿舍8','dormitory',23.1532373,113.3508014,'',NULL,0.00,NULL,0,'2026-02-12 11:04:48'),(252,'培训楼','dormitory',23.1533059,113.3499729,'',NULL,0.00,NULL,0,'2026-02-12 11:04:48'),(253,'学思苑','dormitory',23.1528410,113.3499468,'',NULL,0.00,NULL,0,'2026-02-12 11:04:48'),(254,'茶山宿舍9','dormitory',23.1541830,113.3515614,'',NULL,0.00,NULL,0,'2026-02-12 11:04:48'),(255,'茶山宿舍10','dormitory',23.1539305,113.3522351,'',NULL,0.00,NULL,0,'2026-02-12 11:04:48'),(256,'茶山宿舍11','dormitory',23.1538028,113.3514287,'',NULL,0.00,NULL,0,'2026-02-12 11:04:48'),(257,'茶山宿舍12','dormitory',23.1537717,113.3518182,'',NULL,0.00,NULL,0,'2026-02-12 11:04:48'),(258,'茶山宿舍13','dormitory',23.1536097,113.3522225,'',NULL,0.00,NULL,0,'2026-02-12 11:04:48'),(259,'茶山宿舍14','dormitory',23.1534688,113.3513808,'',NULL,0.00,NULL,0,'2026-02-12 11:04:48'),(260,'茶山宿舍16','dormitory',23.1531744,113.3514176,'',NULL,0.00,NULL,0,'2026-02-12 11:04:48'),(261,'茶山宿舍15','dormitory',23.1532616,113.3519410,'',NULL,0.00,NULL,0,'2026-02-12 11:04:48'),(262,'茶山宿舍17','dormitory',23.1529534,113.3518009,'',NULL,0.00,NULL,0,'2026-02-12 11:04:48'),(263,'茶山宿舍22','dormitory',23.1531783,113.3523803,'',NULL,0.00,NULL,0,'2026-02-12 11:04:48'),(264,'茶山宿舍21','dormitory',23.1533502,113.3527900,'',NULL,0.00,NULL,0,'2026-02-12 11:04:48'),(265,'茶山宿舍20','dormitory',23.1536651,113.3529726,'',NULL,0.00,NULL,0,'2026-02-12 11:04:48'),(266,'五山邮局','dormitory',23.1541989,113.3520817,'',NULL,0.00,NULL,0,'2026-02-12 11:04:48'),(267,'西园站','dormitory',23.1635993,113.3417997,'',NULL,0.00,NULL,0,'2026-02-12 11:04:48'),(268,'新学活站','dormitory',23.1610717,113.3440055,'',NULL,0.00,NULL,0,'2026-02-12 11:04:48'),(269,'教一站','dormitory',23.1622064,113.3444694,'',NULL,0.00,NULL,0,'2026-02-12 11:04:48'),(270,'艺术学院站','dormitory',23.1616896,113.3472557,'',NULL,0.00,NULL,0,'2026-02-12 11:04:48'),(271,'三角市站','dormitory',23.1591945,113.3493331,'',NULL,0.00,NULL,0,'2026-02-12 11:04:48'),(272,'校医院站','dormitory',23.1586544,113.3517957,'',NULL,0.00,NULL,0,'2026-02-12 11:04:48'),(273,'紫荆桥站','dormitory',23.1556009,113.3516920,'',NULL,0.00,NULL,0,'2026-02-12 11:04:48'),(274,'芷园站','dormitory',23.1550789,113.3609982,'',NULL,0.00,NULL,0,'2026-02-12 11:04:48'),(275,'跃进南站','dormitory',23.1634196,113.3627229,'',NULL,0.00,NULL,0,'2026-02-12 11:04:48'),(276,'工程学院站','dormitory',23.1612387,113.3408516,'',NULL,0.00,NULL,0,'2026-02-12 11:04:48'),(277,'第四教学大楼','dormitory',23.1545698,113.3595861,'',NULL,0.00,NULL,0,'2026-02-12 11:04:48'),(278,'幼儿园','dormitory',23.1637857,113.3501894,'',NULL,0.00,NULL,0,'2026-02-12 11:04:48'),(279,'五山公寓18','dormitory',23.1548276,113.3642298,'',NULL,0.00,NULL,0,'2026-02-12 11:04:48'),(280,'五山公寓19','dormitory',23.1553104,113.3642319,'',NULL,0.00,NULL,0,'2026-02-12 11:04:48'),(281,'五山公寓20','dormitory',23.1559147,113.3646835,'',NULL,0.00,NULL,0,'2026-02-12 11:04:48'),(282,'五山公寓17','dormitory',23.1557419,113.3641719,'',NULL,0.00,NULL,0,'2026-02-12 11:04:48'),(283,'五山公寓21','dormitory',23.1560825,113.3651481,'',NULL,0.00,NULL,0,'2026-02-12 11:04:48'),(284,'五山公寓22','dormitory',23.1562908,113.3656423,'',NULL,0.00,NULL,0,'2026-02-12 11:04:48'),(285,'五山公寓23','dormitory',23.1565243,113.3660540,'',NULL,0.00,NULL,0,'2026-02-12 11:04:48'),(286,'五山公寓24','dormitory',23.1568332,113.3664595,'',NULL,0.00,NULL,0,'2026-02-12 11:04:48'),(287,'启林南宿舍40','dormitory',23.1626732,113.3618452,'',NULL,0.00,NULL,0,'2026-02-12 11:04:48'),(288,'华山运动场','sports',23.1625352,113.3394171,'',NULL,0.00,NULL,0,'2026-02-12 11:04:48'),(289,'华山游泳池','sports',23.1613269,113.3394399,'',NULL,0.00,NULL,0,'2026-02-12 11:04:48'),(290,'华山篮球场','sports',23.1614968,113.3389223,'',NULL,0.00,NULL,0,'2026-02-12 11:04:48'),(291,'华山网球场','sports',23.1630969,113.3388059,'',NULL,0.00,NULL,0,'2026-02-12 11:04:48'),(292,'六一运动场','sports',23.1657008,113.3502651,'',NULL,0.00,NULL,0,'2026-02-12 11:04:48'),(293,'黑山篮球场','sports',23.1568637,113.3478947,'',NULL,0.00,NULL,0,'2026-02-12 11:04:48'),(294,'嵩山篮球场','sports',23.1618519,113.3525408,'',NULL,0.00,NULL,0,'2026-02-12 11:04:48'),(295,'嵩山网球场','sports',23.1617664,113.3520632,'',NULL,0.00,NULL,0,'2026-02-12 11:04:48'),(296,'田家炳运动馆','sports',23.1577149,113.3521266,'',NULL,0.00,NULL,0,'2026-02-12 11:04:48'),(297,'五山运动场','sports',23.1566969,113.3590763,'',NULL,0.00,NULL,0,'2026-02-12 11:04:48'),(298,'五山游泳池','sports',23.1559885,113.3600485,'',NULL,0.00,NULL,0,'2026-02-12 11:04:48'),(299,'五山篮球场','sports',23.1567080,113.3607427,'',NULL,0.00,NULL,0,'2026-02-12 11:04:48'),(300,'五山网球场','sports',23.1566977,113.3599599,'',NULL,0.00,NULL,0,'2026-02-12 11:04:48'),(301,'启林南运动场','sports',23.1613673,113.3638727,'',NULL,0.00,NULL,0,'2026-02-12 11:04:48'),(302,'启林南篮球场','sports',23.1613846,113.3646167,'',NULL,0.00,NULL,0,'2026-02-12 11:04:48'),(303,'启林北网球场','sports',23.1656367,113.3654958,'',NULL,0.00,NULL,0,'2026-02-12 11:04:48'),(305,'人文学院','office',23.1603735,113.3421763,'',NULL,0.00,NULL,0,'2026-02-12 11:04:48'),(306,'人文学院','office',23.1603205,113.3414825,'',NULL,0.00,NULL,0,'2026-02-12 11:04:48'),(307,'兽医学院','office',23.1644802,113.3431685,'',NULL,0.00,NULL,0,'2026-02-12 11:04:48'),(308,'动物科学学院','office',23.1644075,113.3443509,'',NULL,0.00,NULL,0,'2026-02-12 11:04:48'),(309,'信息学院软件学院','office',23.1631299,113.3459009,'',NULL,0.00,NULL,0,'2026-02-12 11:04:48'),(310,'理学院','office',23.1635300,113.3458860,'',NULL,0.00,NULL,0,'2026-02-12 11:04:48'),(311,'艺术学院','office',23.1620169,113.3468468,'',NULL,0.00,NULL,0,'2026-02-12 11:04:48'),(312,'音乐楼','office',23.1621733,113.3453681,'',NULL,0.00,NULL,0,'2026-02-12 11:04:48'),(313,'食品学院','office',23.1614993,113.3464565,'',NULL,0.00,NULL,0,'2026-02-12 11:04:48'),(314,'公共管理学院','office',23.1596837,113.3464757,'',NULL,0.00,NULL,0,'2026-02-12 11:04:48'),(315,'校史馆','office',23.1597163,113.3442019,'',NULL,0.00,NULL,0,'2026-02-12 11:04:48'),(316,'农学院','office',23.1634110,113.3532767,'',NULL,0.00,NULL,0,'2026-02-12 11:04:48'),(317,'资源环境学院','office',23.1641408,113.3541414,'',NULL,0.00,NULL,0,'2026-02-12 11:04:48'),(318,'园艺学院','office',23.1637770,113.3551523,'',NULL,0.00,NULL,0,'2026-02-12 11:04:48'),(319,'林学院','office',23.1622508,113.3558159,'',NULL,0.00,NULL,0,'2026-02-12 11:04:48'),(320,'生命科学学院','office',23.1619013,113.3544689,'',NULL,0.00,NULL,0,'2026-02-12 11:04:48'),(321,'经济管理学院','office',23.1561060,113.3528281,'',NULL,0.00,NULL,0,'2026-02-12 11:04:48'),(322,'外国语学院','office',23.1627302,113.3600139,'',NULL,0.00,NULL,0,'2026-02-12 11:04:48'),(323,'工程技能训练中心','office',23.1591532,113.3396032,'',NULL,0.00,NULL,0,'2026-02-12 11:04:48'),(324,'奇康超市','shop',23.1595340,113.3497115,'三角市',NULL,0.00,NULL,0,'2026-02-12 11:04:48'),(325,'公寓超市','shop',23.1554116,113.3629745,'五山13宿舍楼下',NULL,0.00,NULL,0,'2026-02-12 11:04:48'),(326,'西园超市','shop',23.1627101,113.3412873,'华山2栋楼下',NULL,0.00,NULL,0,'2026-02-12 11:04:48'),(327,'华山超市','shop',23.1642195,113.3422404,'华山17栋一楼',NULL,0.00,NULL,0,'2026-02-12 11:04:48'),(328,'西二超市','shop',23.1605901,113.3391894,'华山22栋一楼',NULL,0.00,NULL,0,'2026-02-12 11:04:48'),(329,'五山一条街','shop',23.1545753,113.3632575,'五山10栋楼下',NULL,0.00,NULL,0,'2026-02-12 11:04:48'),(330,'启林南超市','shop',23.1620013,113.3620643,'启林南',NULL,0.00,NULL,0,'2026-02-12 11:04:48'),(331,'启林北超市','shop',23.1648204,113.3651348,'启林北',NULL,0.00,NULL,0,'2026-02-12 11:04:48'),(332,'国际交流处','office',23.1581907,113.3483876,'学校负责外事工作的职能部门',NULL,0.00,NULL,0,'2026-02-12 11:04:48'),(333,'档案馆','office',23.1604603,113.3485349,'学校科学研究、编史修志及工作查考档案史料的信息中心',NULL,0.00,NULL,0,'2026-02-12 11:04:48'),(334,'党委组织部','office',23.1580437,113.3481327,'组织实施经党委审批后的实施计划，指导、检查、督促各级党组织开展党内组织生活',NULL,0.00,NULL,0,'2026-02-12 11:04:48'),(335,'校长办公室','office',23.1582219,113.3482151,'负责检查、督促校行政各项决议、决定、重要工作部署和校长重要批示的贯彻执行情况，并向校长报告',NULL,0.00,NULL,0,'2026-02-12 11:04:48'),(336,'教材展销中心（印刷厂）','office',23.1617164,113.3438597,'教材展销中心是后勤服务集团属下的一个经济实体,负责全校教师用书和学生用书的订购、准备和发放',NULL,0.00,NULL,0,'2026-02-12 11:04:48'),(337,'学生公寓管理中心','office',23.1632573,113.3404118,'主要负责公寓对来访人员的接待、登记，水电维护、家具维修等日常管理工作',NULL,0.00,NULL,0,'2026-02-12 11:04:48'),(338,'现代教育技术中心','office',23.1614548,113.3445449,'包括服务部、网络部、CAI制作部、视听部等，负责校园网维护、管理，并负责学校一些多媒体软件的设计和制作',NULL,0.00,NULL,0,'2026-02-12 11:04:48'),(339,'公共基础课教学实验中心','office',23.1552997,113.3604064,'整合多个学院教学实验室建立的校级公共基础课实验教学中心',NULL,0.00,NULL,0,'2026-02-12 11:04:48'),(340,'大学生就业指导与服务中心','office',23.1616789,113.3436841,'全面负责毕业生相关工作的部门',NULL,0.00,NULL,0,'2026-02-12 11:04:48'),(341,'心理健康辅导中心','office',23.1615638,113.3438862,'开展学生心理测试辅导，负责学生心理工作的部门',NULL,0.00,NULL,0,'2026-02-12 11:04:48'),(342,'勤工助学管理服务中心','office',23.1616828,113.3444964,'推荐和指导学生参见校内外勤工助学工作，负责学生勤工助学资金的管理和发放',NULL,0.00,NULL,0,'2026-02-12 11:04:48'),(343,'二级单位核算中心','office',23.1593524,113.3497770,'负责全校二级单位会计核算管理工作',NULL,0.00,NULL,0,'2026-02-12 11:04:48'),(344,'校园卡核算管理中心','office',23.1593095,113.3497888,'负责校园卡各项核算管理业务，校园卡系统建设、升级及维护等',NULL,0.00,NULL,0,'2026-02-12 11:04:48'),(345,'财务处','office',23.1589679,113.3463265,'负责学校各项财务工作',NULL,0.00,NULL,0,'2026-02-12 11:04:48'),(346,'助学贷款科','office',23.1589692,113.3464644,'负责在校本科生的国家助学贷款业务，负责本科生各类助学金的发放',NULL,0.00,NULL,0,'2026-02-12 11:04:48'),(347,'招生办公室','office',23.1581841,113.3480914,'负责普通高考本科招生及新生录取工作',NULL,0.00,NULL,0,'2026-02-12 11:04:48'),(348,'思想教育科','office',23.1593327,113.3433349,'负责本科思想教育',NULL,0.00,NULL,0,'2026-02-12 11:04:48'),(349,'教务处','office',23.1581333,113.3482405,'全面负责学校的教务工作',NULL,0.00,NULL,0,'2026-02-12 11:04:48'),(350,'科技处','office',23.1581158,113.3480452,'负责拟定全校科技工作发展规划和年度计划，组织编写全校科技总结，负责各级各类科技项目的组织、申报、协调、监督、检查、验收等管理工作',NULL,0.00,NULL,0,'2026-02-12 11:04:48'),(351,'研究生处','office',23.1644085,113.3531368,'负责研究生教育的部门',NULL,0.00,NULL,0,'2026-02-12 11:04:48'),(352,'校医院','office',23.1587116,113.3502412,'负责学校医疗卫生服务、体检',NULL,0.00,NULL,0,'2026-02-12 11:04:48'),(353,'中国建设银行','shop',23.1596603,113.3497249,'三角市',NULL,0.00,NULL,0,'2026-02-12 11:04:48'),(354,'平安银行','shop',23.1596940,113.3489075,'图书馆楼下',NULL,0.00,NULL,0,'2026-02-12 11:04:48'),(355,'深圳发展银行','shop',23.1554306,113.3611434,'D4楼下',NULL,0.00,NULL,0,'2026-02-12 11:04:48'),(356,'中国光大银行','shop',23.1547738,113.3622141,'C1楼下',NULL,0.00,NULL,0,'2026-02-12 11:04:48'),(357,'民生银行','shop',23.1543883,113.3631477,'B2楼下',NULL,0.00,NULL,0,'2026-02-12 11:04:48');
/*!40000 ALTER TABLE `poi` ENABLE KEYS */;
UNLOCK TABLES;

ALTER TABLE `poi`
  ADD COLUMN `comment` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci COMMENT 'POI点评' AFTER `description`;

--
-- Table structure for table `user_favorites`
--

DROP TABLE IF EXISTS `user_favorites`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_favorites` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL COMMENT '用户ID',
  `poi_id` int NOT NULL COMMENT 'POI ID',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '收藏时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `unique_favorite` (`user_id`,`poi_id`) USING BTREE,
  KEY `idx_user_id` (`user_id`) USING BTREE,
  KEY `idx_poi_id` (`poi_id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC COMMENT='用户收藏表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_favorites`
--

LOCK TABLES `user_favorites` WRITE;
/*!40000 ALTER TABLE `user_favorites` DISABLE KEYS */;
INSERT INTO `user_favorites` VALUES (1,3,13,'2026-02-13 13:50:16'),(4,3,5,'2026-02-27 08:44:15'),(5,3,10,'2026-03-05 10:54:25');
/*!40000 ALTER TABLE `user_favorites` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `phone` varchar(11) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '手机号',
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '密码（加密）',
  `nickname` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT '用户' COMMENT '昵称',
  `avatar` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT '' COMMENT '头像URL',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '注册时间',
  `last_login_at` datetime DEFAULT NULL COMMENT '最后登录时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `phone` (`phone`) USING BTREE,
  KEY `idx_phone` (`phone`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC COMMENT='用户表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'13800138000','test123','测试用户','','2026-02-15 22:19:33',NULL),(3,'19879099190','$2b$10$W/LgIZvKOmKuCZ5faVox1uwNfY9H8UKIgIgCpg.lZOqFZ0gmKRqiC','用户9190','','2026-02-13 16:23:07','2026-03-23 16:17:25'),(4,'18979276719','$2b$10$ZWS4N.BrDu0MJOUxGuIYXOd4lzhrBrXmP0WwV/TJLuCRDUD4CZb22','用户6719','','2026-04-08 18:30:40','2026-04-08 18:30:46');
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

-- Dump completed on 2026-04-08 22:00:31
