-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:4306
-- Generation Time: May 19, 2025 at 03:18 PM
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
-- Database: `hcss`
--

-- --------------------------------------------------------

--
-- Table structure for table `appointments`
--

CREATE TABLE `appointments` (
  `Pname` varchar(40) NOT NULL,
  `Date` date NOT NULL,
  `Time` time NOT NULL,
  `CaseType` varchar(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `doctor`
--

CREATE TABLE `doctor` (
  `ID` int(7) NOT NULL,
  `Dname` varchar(40) NOT NULL,
  `Speciality` varchar(30) NOT NULL,
  `password` varchar(60) NOT NULL,
  `Status` int(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `doctor`
--

INSERT INTO `doctor` (`ID`, `Dname`, `Speciality`, `password`, `Status`) VALUES
(2301212, 'Dr. Carol', 'Cardiologist', '10081987', 1),
(2301214, 'Dr. Bob', 'Physician', '22101998', 1),
(2301215, 'Dr. Peter', 'Neurologist', '31042001', 1),
(2301217, 'Dr. Alice', 'Physician', '16091990', 1),
(2301219, 'Dr. Dave', 'Cardiologist', '03121988', 1),
(2301226, 'Dr. Nitin', 'Neurologist', '23122000', 1);

-- --------------------------------------------------------

--
-- Table structure for table `patients`
--

CREATE TABLE `patients` (
  `Pname` varchar(50) NOT NULL,
  `EmailID` varchar(60) NOT NULL,
  `PhoneNo` int(10) NOT NULL,
  `AppointmentDate` date NOT NULL,
  `Gender` varchar(1) NOT NULL,
  `SpecialistDoc` varchar(40) NOT NULL,
  `CaseType` varchar(1) NOT NULL,
  `Allottedtime` time(5) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `doctor`
--
ALTER TABLE `doctor`
  ADD PRIMARY KEY (`ID`);

--
-- Indexes for table `patients`
--
ALTER TABLE `patients`
  ADD PRIMARY KEY (`Pname`,`EmailID`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
