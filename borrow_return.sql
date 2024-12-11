-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Dec 09, 2024 at 11:08 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `borrow_return`
--

-- --------------------------------------------------------

--
-- Table structure for table `borrow_records`
--

CREATE TABLE `borrow_records` (
  `record_id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `equipment_id` int(11) DEFAULT NULL,
  `borrow_date` datetime NOT NULL DEFAULT current_timestamp(),
  `return_date` datetime DEFAULT NULL,
  `status` enum('Borrowed','Returned','Overdue') DEFAULT 'Borrowed',
  `image` varchar(255) NOT NULL,
  `image_return` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `borrow_records`
--

INSERT INTO `borrow_records` (`record_id`, `user_id`, `equipment_id`, `borrow_date`, `return_date`, `status`, `image`, `image_return`) VALUES
(33, 12, 24, '2024-11-29 00:00:00', '2024-12-05 00:00:00', 'Borrowed', '', ''),
(40, 12, 24, '2024-11-29 00:00:00', '2024-12-05 00:00:00', 'Borrowed', '', ''),
(41, 12, 24, '2024-11-29 00:00:00', '2024-12-05 00:00:00', 'Borrowed', '', ''),
(44, 12, 24, '2024-11-29 00:00:00', '2024-12-05 00:00:00', 'Borrowed', '', ''),
(47, 12, 24, '2024-11-29 00:00:00', '2024-12-05 00:00:00', 'Borrowed', '', ''),
(48, 12, 24, '2024-11-29 00:00:00', '2024-12-05 00:00:00', 'Borrowed', '', ''),
(53, 12, 24, '2024-11-29 00:00:00', '2024-12-05 00:00:00', 'Borrowed', '', ''),
(54, 12, 25, '2024-11-29 00:00:00', '2024-12-05 00:00:00', 'Borrowed', '', ''),
(55, 12, 25, '2024-11-29 00:00:00', '2024-12-05 00:00:00', 'Borrowed', '', ''),
(56, 12, 25, '2024-11-29 00:00:00', '2024-12-05 00:00:00', 'Borrowed', '', ''),
(59, 12, 26, '2024-11-29 00:00:00', '2024-12-05 00:00:00', 'Borrowed', '', '');

-- --------------------------------------------------------

--
-- Table structure for table `equipment`
--

CREATE TABLE `equipment` (
  `equipment_id` int(11) NOT NULL,
  `equipment_name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `quantity` int(11) NOT NULL,
  `status` enum('Available','Unavailable','Maintenance') DEFAULT 'Available',
  `image` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `equipment`
--

INSERT INTO `equipment` (`equipment_id`, `equipment_name`, `description`, `quantity`, `status`, `image`) VALUES
(24, 'a', 'ss', 91, 'Available', 'compressed-1731658303189.jpg'),
(25, 'b', 'ss', 108, 'Available', 'compressed-1731896818230.jpg'),
(26, 'c', 'ss', 110, 'Available', 'compressed-1731896842913.jpg');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `student_id` varchar(20) NOT NULL,
  `student_name` varchar(100) NOT NULL,
  `year_of_study` varchar(11) NOT NULL,
  `student_email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `phone` int(255) NOT NULL,
  `role` enum('admin','user') DEFAULT 'user'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `student_id`, `student_name`, `year_of_study`, `student_email`, `password`, `phone`, `role`) VALUES
(12, '11111111111', 'ssssssss', 'TEC3R', 'ssss@rmuti.ac.th', '$2a$10$9eSedED6PuiIMFRs8DmtXOyc7ySoR4bLun6w5oSBs8XvK0WOmc/6i', 123456, 'user');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `borrow_records`
--
ALTER TABLE `borrow_records`
  ADD PRIMARY KEY (`record_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `equipment_id` (`equipment_id`);

--
-- Indexes for table `equipment`
--
ALTER TABLE `equipment`
  ADD PRIMARY KEY (`equipment_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `student_id` (`student_id`),
  ADD UNIQUE KEY `student_email` (`student_email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `borrow_records`
--
ALTER TABLE `borrow_records`
  MODIFY `record_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=63;

--
-- AUTO_INCREMENT for table `equipment`
--
ALTER TABLE `equipment`
  MODIFY `equipment_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `borrow_records`
--
ALTER TABLE `borrow_records`
  ADD CONSTRAINT `borrow_records_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`),
  ADD CONSTRAINT `borrow_records_ibfk_2` FOREIGN KEY (`equipment_id`) REFERENCES `equipment` (`equipment_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
