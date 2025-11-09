CREATE DATABASE IF NOT EXISTS holistic CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE holistic;

CREATE TABLE IF NOT EXISTS ev_station (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  lat DECIMAL(9,6) NOT NULL,
  lng DECIMAL(9,6) NOT NULL,
  plug_types JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO ev_station (name, lat, lng, plug_types)
VALUES ('Demo Station', 60.1699, 24.9384, JSON_ARRAY('CCS','Type2'));
