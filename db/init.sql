CREATE DATABASE IF NOT EXISTS holistic CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE holistic;

CREATE TABLE users (
    user_id VARCHAR(50) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ev_cars JSON,
    trip_history JSON
);

INSERT INTO users (user_id, email, name, ev_cars, trip_history)
VALUES (
    "448141881",
    'test@example.com',
    'Jane Doe',
    '["Tesla Model Y", "Nissan Leaf", "Rivian R1S"]',
    '[{"starting_points": "Riga", "ending_points": "Radio iela 8, Liepāja, LV-3401", "car_start_charging_timestamp": "2025-11-30 13:19:18", "expected_charging_time": 0}]'
);

CREATE TABLE ev_charger_analysis (
    ev_name VARCHAR(255) PRIMARY KEY NOT NULL,
    wltp_range NUMERIC(5, 2) NOT NULL,
    max_capacity NUMERIC(5, 2) NOT NULL,
    dc_max_charge_rate INTEGER NOT NULL,
    ac_max_charge_rate INTEGER NOT NULL,
    dc_default_charger_type VARCHAR(50),
    ac_default_charger_type VARCHAR(50),
    dc_charging_curve_data JSON
);

INSERT INTO ev_charger_analysis (
    ev_name,
    wltp_range,
    max_capacity,
    dc_max_charge_rate,
    ac_max_charge_rate,
    dc_default_charger_type,
    ac_default_charger_type,
    dc_charging_curve_data
)
VALUES (
    'BMW iX xDrive45 (11 kW AC)',
    14.45,
    94.8,
    175,
    11,
    'CCS2',
    'Type2',
    '{"charging_curve": [{"soc": 0, "speed": 50, "time": "00:00:00", "energy_charged": 0.0}, {"soc": 1, "speed": 80, "time": "00:00:56", "energy_charged": 0.9}, {"soc": 2, "speed": 100, "time": "00:01:37", "energy_charged": 1.9}, {"soc": 3, "speed": 121, "time": "00:02:10", "energy_charged": 2.8}, {"soc": 4, "speed": 155, "time": "00:02:37", "energy_charged": 3.8}, {"soc": 5, "speed": 156, "time": "00:03:00", "energy_charged": 4.7}, {"soc": 6, "speed": 157, "time": "00:03:24", "energy_charged": 5.7}, {"soc": 7, "speed": 170, "time": "00:03:46", "energy_charged": 6.6}, {"soc": 8, "speed": 171, "time": "00:04:08", "energy_charged": 7.6}, {"soc": 9, "speed": 171, "time": "00:04:29", "energy_charged": 8.5}, {"soc": 10, "speed": 171, "time": "00:04:50", "energy_charged": 9.5}, {"soc": 11, "speed": 171, "time": "00:05:12", "energy_charged": 10.4}, {"soc": 12, "speed": 171, "time": "00:05:33", "energy_charged": 11.4}, {"soc": 13, "speed": 171, "time": "00:05:55", "energy_charged": 12.3}, {"soc": 14, "speed": 171, "time": "00:06:16", "energy_charged": 13.3}, {"soc": 15, "speed": 171, "time": "00:06:38", "energy_charged": 14.2}, {"soc": 16, "speed": 172, "time": "00:06:59", "energy_charged": 15.2}, {"soc": 17, "speed": 172, "time": "00:07:21", "energy_charged": 16.1}, {"soc": 18, "speed": 172, "time": "00:07:42", "energy_charged": 17.1}, {"soc": 19, "speed": 172, "time": "00:08:03", "energy_charged": 18.0}, {"soc": 20, "speed": 171, "time": "00:08:25", "energy_charged": 19.0}, {"soc": 21, "speed": 171, "time": "00:08:46", "energy_charged": 19.9}, {"soc": 22, "speed": 171, "time": "00:09:07", "energy_charged": 20.9}, {"soc": 23, "speed": 171, "time": "00:09:29", "energy_charged": 21.8}, {"soc": 24, "speed": 171, "time": "00:09:50", "energy_charged": 22.8}, {"soc": 25, "speed": 171, "time": "00:10:12", "energy_charged": 23.7}, {"soc": 26, "speed": 172, "time": "00:10:33", "energy_charged": 24.6}, {"soc": 27, "speed": 172, "time": "00:10:55", "energy_charged": 25.6}, {"soc": 28, "speed": 172, "time": "00:11:16", "energy_charged": 26.5}, {"soc": 29, "speed": 172, "time": "00:11:37", "energy_charged": 27.5}, {"soc": 30, "speed": 172, "time": "00:11:59", "energy_charged": 28.4}, {"soc": 31, "speed": 173, "time": "00:12:20", "energy_charged": 29.4}, {"soc": 32, "speed": 173, "time": "00:12:41", "energy_charged": 30.3}, {"soc": 33, "speed": 173, "time": "00:13:02", "energy_charged": 31.3}, {"soc": 34, "speed": 173, "time": "00:13:24", "energy_charged": 32.2}, {"soc": 35, "speed": 173, "time": "00:13:45", "energy_charged": 33.2}, {"soc": 36, "speed": 173, "time": "00:14:06", "energy_charged": 34.1}, {"soc": 37, "speed": 174, "time": "00:14:27", "energy_charged": 35.1}, {"soc": 38, "speed": 174, "time": "00:14:48", "energy_charged": 36.0}, {"soc": 39, "speed": 174, "time": "00:15:09", "energy_charged": 37.0}, {"soc": 40, "speed": 175, "time": "00:15:30", "energy_charged": 37.9}, {"soc": 41, "speed": 175, "time": "00:15:51", "energy_charged": 38.9}, {"soc": 42, "speed": 173, "time": "00:16:12", "energy_charged": 39.8}, {"soc": 43, "speed": 165, "time": "00:16:34", "energy_charged": 40.8}, {"soc": 44, "speed": 164, "time": "00:16:56", "energy_charged": 41.7}, {"soc": 45, "speed": 158, "time": "00:17:19", "energy_charged": 42.7}, {"soc": 46, "speed": 156, "time": "00:17:43", "energy_charged": 43.6}, {"soc": 47, "speed": 157, "time": "00:18:06", "energy_charged": 44.6}, {"soc": 48, "speed": 157, "time": "00:18:29", "energy_charged": 45.5}, {"soc": 49, "speed": 148, "time": "00:18:53", "energy_charged": 46.5}, {"soc": 50, "speed": 149, "time": "00:19:18", "energy_charged": 47.4}, {"soc": 51, "speed": 149, "time": "00:19:43", "energy_charged": 48.3}, {"soc": 52, "speed": 143, "time": "00:20:08", "energy_charged": 49.3}, {"soc": 53, "speed": 143, "time": "00:20:34", "energy_charged": 50.2}, {"soc": 54, "speed": 134, "time": "00:21:00", "energy_charged": 51.2}, {"soc": 55, "speed": 135, "time": "00:21:27", "energy_charged": 52.1}, {"soc": 56, "speed": 135, "time": "00:21:55", "energy_charged": 53.1}, {"soc": 57, "speed": 128, "time": "00:22:22", "energy_charged": 54.0}, {"soc": 58, "speed": 129, "time": "00:22:51", "energy_charged": 55.0}, {"soc": 59, "speed": 130, "time": "00:23:19", "energy_charged": 55.9}, {"soc": 60, "speed": 130, "time": "00:23:48", "energy_charged": 56.9}, {"soc": 61, "speed": 131, "time": "00:24:16", "energy_charged": 57.8}, {"soc": 62, "speed": 126, "time": "00:24:44", "energy_charged": 58.8}, {"soc": 63, "speed": 127, "time": "00:25:13", "energy_charged": 59.7}, {"soc": 64, "speed": 126, "time": "00:25:42", "energy_charged": 60.7}, {"soc": 65, "speed": 122, "time": "00:26:12", "energy_charged": 61.6}, {"soc": 66, "speed": 122, "time": "00:26:42", "energy_charged": 62.6}, {"soc": 67, "speed": 118, "time": "00:27:13", "energy_charged": 63.5}, {"soc": 68, "speed": 117, "time": "00:27:44", "energy_charged": 64.5}, {"soc": 69, "speed": 114, "time": "00:28:16", "energy_charged": 65.4}, {"soc": 70, "speed": 113, "time": "00:28:48", "energy_charged": 66.4}, {"soc": 71, "speed": 111, "time": "00:29:21", "energy_charged": 67.3}, {"soc": 72, "speed": 109, "time": "00:29:54", "energy_charged": 68.3}, {"soc": 73, "speed": 109, "time": "00:30:28", "energy_charged": 69.2}, {"soc": 74, "speed": 107, "time": "00:31:02", "energy_charged": 70.2}, {"soc": 75, "speed": 105, "time": "00:31:36", "energy_charged": 71.1}, {"soc": 76, "speed": 100, "time": "00:32:12", "energy_charged": 72.0}, {"soc": 77, "speed": 93, "time": "00:32:50", "energy_charged": 73.0}, {"soc": 78, "speed": 93, "time": "00:33:30", "energy_charged": 73.9}, {"soc": 79, "speed": 79, "time": "00:34:12", "energy_charged": 74.9}, {"soc": 80, "speed": 88, "time": "00:34:56", "energy_charged": 75.8}, {"soc": 81, "speed": 80, "time": "00:35:40", "energy_charged": 76.8}, {"soc": 82, "speed": 80, "time": "00:36:26", "energy_charged": 77.7}, {"soc": 83, "speed": 80, "time": "00:37:12", "energy_charged": 78.7}, {"soc": 84, "speed": 80, "time": "00:37:57", "energy_charged": 79.6}, {"soc": 85, "speed": 80, "time": "00:38:43", "energy_charged": 80.6}, {"soc": 86, "speed": 80, "time": "00:39:29", "energy_charged": 81.5}, {"soc": 87, "speed": 65, "time": "00:40:20", "energy_charged": 82.5}, {"soc": 88, "speed": 69, "time": "00:41:15", "energy_charged": 83.4}, {"soc": 89, "speed": 68, "time": "00:42:08", "energy_charged": 84.4}, {"soc": 90, "speed": 69, "time": "00:43:02", "energy_charged": 85.3}, {"soc": 91, "speed": 69, "time": "00:43:55", "energy_charged": 86.3}, {"soc": 92, "speed": 69, "time": "00:44:48", "energy_charged": 87.2}, {"soc": 93, "speed": 69, "time": "00:45:41", "energy_charged": 88.2}, {"soc": 94, "speed": 68, "time": "00:46:35", "energy_charged": 89.1}, {"soc": 95, "speed": 59, "time": "00:47:33", "energy_charged": 90.1}, {"soc": 96, "speed": 63, "time": "00:48:33", "energy_charged": 91.0}, {"soc": 97, "speed": 63, "time": "00:49:31", "energy_charged": 92.0}, {"soc": 98, "speed": 64, "time": "00:50:29", "energy_charged": 92.9}, {"soc": 99, "speed": 36, "time": "00:51:42", "energy_charged": 93.9}, {"soc": 100, "speed": 5, "time": "00:54:41", "energy_charged": 94.8}]}'
);

INSERT INTO ev_charger_analysis (
    ev_name,
    wltp_range,
    max_capacity,
    dc_max_charge_rate,
    ac_max_charge_rate,
    dc_default_charger_type,
    ac_default_charger_type,
    dc_charging_curve_data
)
VALUES (
    'BMW iX xDrive45 (22 kW AC)',
    14.45,
    94.8,
    175,
    22,
    'CCS2',
    'Type2',
    '{"charging_curve": [{"soc": 0, "speed": 50, "time": "00:00:00", "energy_charged": 0.0}, {"soc": 1, "speed": 80, "time": "00:00:56", "energy_charged": 0.9}, {"soc": 2, "speed": 100, "time": "00:01:37", "energy_charged": 1.9}, {"soc": 3, "speed": 121, "time": "00:02:10", "energy_charged": 2.8}, {"soc": 4, "speed": 155, "time": "00:02:37", "energy_charged": 3.8}, {"soc": 5, "speed": 156, "time": "00:03:00", "energy_charged": 4.7}, {"soc": 6, "speed": 157, "time": "00:03:24", "energy_charged": 5.7}, {"soc": 7, "speed": 170, "time": "00:03:46", "energy_charged": 6.6}, {"soc": 8, "speed": 171, "time": "00:04:08", "energy_charged": 7.6}, {"soc": 9, "speed": 171, "time": "00:04:29", "energy_charged": 8.5}, {"soc": 10, "speed": 171, "time": "00:04:50", "energy_charged": 9.5}, {"soc": 11, "speed": 171, "time": "00:05:12", "energy_charged": 10.4}, {"soc": 12, "speed": 171, "time": "00:05:33", "energy_charged": 11.4}, {"soc": 13, "speed": 171, "time": "00:05:55", "energy_charged": 12.3}, {"soc": 14, "speed": 171, "time": "00:06:16", "energy_charged": 13.3}, {"soc": 15, "speed": 171, "time": "00:06:38", "energy_charged": 14.2}, {"soc": 16, "speed": 172, "time": "00:06:59", "energy_charged": 15.2}, {"soc": 17, "speed": 172, "time": "00:07:21", "energy_charged": 16.1}, {"soc": 18, "speed": 172, "time": "00:07:42", "energy_charged": 17.1}, {"soc": 19, "speed": 172, "time": "00:08:03", "energy_charged": 18.0}, {"soc": 20, "speed": 171, "time": "00:08:25", "energy_charged": 19.0}, {"soc": 21, "speed": 171, "time": "00:08:46", "energy_charged": 19.9}, {"soc": 22, "speed": 171, "time": "00:09:07", "energy_charged": 20.9}, {"soc": 23, "speed": 171, "time": "00:09:29", "energy_charged": 21.8}, {"soc": 24, "speed": 171, "time": "00:09:50", "energy_charged": 22.8}, {"soc": 25, "speed": 171, "time": "00:10:12", "energy_charged": 23.7}, {"soc": 26, "speed": 172, "time": "00:10:33", "energy_charged": 24.6}, {"soc": 27, "speed": 172, "time": "00:10:55", "energy_charged": 25.6}, {"soc": 28, "speed": 172, "time": "00:11:16", "energy_charged": 26.5}, {"soc": 29, "speed": 172, "time": "00:11:37", "energy_charged": 27.5}, {"soc": 30, "speed": 172, "time": "00:11:59", "energy_charged": 28.4}, {"soc": 31, "speed": 173, "time": "00:12:20", "energy_charged": 29.4}, {"soc": 32, "speed": 173, "time": "00:12:41", "energy_charged": 30.3}, {"soc": 33, "speed": 173, "time": "00:13:02", "energy_charged": 31.3}, {"soc": 34, "speed": 173, "time": "00:13:24", "energy_charged": 32.2}, {"soc": 35, "speed": 173, "time": "00:13:45", "energy_charged": 33.2}, {"soc": 36, "speed": 173, "time": "00:14:06", "energy_charged": 34.1}, {"soc": 37, "speed": 174, "time": "00:14:27", "energy_charged": 35.1}, {"soc": 38, "speed": 174, "time": "00:14:48", "energy_charged": 36.0}, {"soc": 39, "speed": 174, "time": "00:15:09", "energy_charged": 37.0}, {"soc": 40, "speed": 175, "time": "00:15:30", "energy_charged": 37.9}, {"soc": 41, "speed": 175, "time": "00:15:51", "energy_charged": 38.9}, {"soc": 42, "speed": 173, "time": "00:16:12", "energy_charged": 39.8}, {"soc": 43, "speed": 165, "time": "00:16:34", "energy_charged": 40.8}, {"soc": 44, "speed": 164, "time": "00:16:56", "energy_charged": 41.7}, {"soc": 45, "speed": 158, "time": "00:17:19", "energy_charged": 42.7}, {"soc": 46, "speed": 156, "time": "00:17:43", "energy_charged": 43.6}, {"soc": 47, "speed": 157, "time": "00:18:06", "energy_charged": 44.6}, {"soc": 48, "speed": 157, "time": "00:18:29", "energy_charged": 45.5}, {"soc": 49, "speed": 148, "time": "00:18:53", "energy_charged": 46.5}, {"soc": 50, "speed": 149, "time": "00:19:18", "energy_charged": 47.4}, {"soc": 51, "speed": 149, "time": "00:19:43", "energy_charged": 48.3}, {"soc": 52, "speed": 143, "time": "00:20:08", "energy_charged": 49.3}, {"soc": 53, "speed": 143, "time": "00:20:34", "energy_charged": 50.2}, {"soc": 54, "speed": 134, "time": "00:21:00", "energy_charged": 51.2}, {"soc": 55, "speed": 135, "time": "00:21:27", "energy_charged": 52.1}, {"soc": 56, "speed": 135, "time": "00:21:55", "energy_charged": 53.1}, {"soc": 57, "speed": 128, "time": "00:22:22", "energy_charged": 54.0}, {"soc": 58, "speed": 129, "time": "00:22:51", "energy_charged": 55.0}, {"soc": 59, "speed": 130, "time": "00:23:19", "energy_charged": 55.9}, {"soc": 60, "speed": 130, "time": "00:23:48", "energy_charged": 56.9}, {"soc": 61, "speed": 131, "time": "00:24:16", "energy_charged": 57.8}, {"soc": 62, "speed": 126, "time": "00:24:44", "energy_charged": 58.8}, {"soc": 63, "speed": 127, "time": "00:25:13", "energy_charged": 59.7}, {"soc": 64, "speed": 126, "time": "00:25:42", "energy_charged": 60.7}, {"soc": 65, "speed": 122, "time": "00:26:12", "energy_charged": 61.6}, {"soc": 66, "speed": 122, "time": "00:26:42", "energy_charged": 62.6}, {"soc": 67, "speed": 118, "time": "00:27:13", "energy_charged": 63.5}, {"soc": 68, "speed": 117, "time": "00:27:44", "energy_charged": 64.5}, {"soc": 69, "speed": 114, "time": "00:28:16", "energy_charged": 65.4}, {"soc": 70, "speed": 113, "time": "00:28:48", "energy_charged": 66.4}, {"soc": 71, "speed": 111, "time": "00:29:21", "energy_charged": 67.3}, {"soc": 72, "speed": 109, "time": "00:29:54", "energy_charged": 68.3}, {"soc": 73, "speed": 109, "time": "00:30:28", "energy_charged": 69.2}, {"soc": 74, "speed": 107, "time": "00:31:02", "energy_charged": 70.2}, {"soc": 75, "speed": 105, "time": "00:31:36", "energy_charged": 71.1}, {"soc": 76, "speed": 100, "time": "00:32:12", "energy_charged": 72.0}, {"soc": 77, "speed": 93, "time": "00:32:50", "energy_charged": 73.0}, {"soc": 78, "speed": 93, "time": "00:33:30", "energy_charged": 73.9}, {"soc": 79, "speed": 79, "time": "00:34:12", "energy_charged": 74.9}, {"soc": 80, "speed": 88, "time": "00:34:56", "energy_charged": 75.8}, {"soc": 81, "speed": 80, "time": "00:35:40", "energy_charged": 76.8}, {"soc": 82, "speed": 80, "time": "00:36:26", "energy_charged": 77.7}, {"soc": 83, "speed": 80, "time": "00:37:12", "energy_charged": 78.7}, {"soc": 84, "speed": 80, "time": "00:37:57", "energy_charged": 79.6}, {"soc": 85, "speed": 80, "time": "00:38:43", "energy_charged": 80.6}, {"soc": 86, "speed": 80, "time": "00:39:29", "energy_charged": 81.5}, {"soc": 87, "speed": 65, "time": "00:40:20", "energy_charged": 82.5}, {"soc": 88, "speed": 69, "time": "00:41:15", "energy_charged": 83.4}, {"soc": 89, "speed": 68, "time": "00:42:08", "energy_charged": 84.4}, {"soc": 90, "speed": 69, "time": "00:43:02", "energy_charged": 85.3}, {"soc": 91, "speed": 69, "time": "00:43:55", "energy_charged": 86.3}, {"soc": 92, "speed": 69, "time": "00:44:48", "energy_charged": 87.2}, {"soc": 93, "speed": 69, "time": "00:45:41", "energy_charged": 88.2}, {"soc": 94, "speed": 68, "time": "00:46:35", "energy_charged": 89.1}, {"soc": 95, "speed": 59, "time": "00:47:33", "energy_charged": 90.1}, {"soc": 96, "speed": 63, "time": "00:48:33", "energy_charged": 91.0}, {"soc": 97, "speed": 63, "time": "00:49:31", "energy_charged": 92.0}, {"soc": 98, "speed": 64, "time": "00:50:29", "energy_charged": 92.9}, {"soc": 99, "speed": 36, "time": "00:51:42", "energy_charged": 93.9}, {"soc": 100, "speed": 5, "time": "00:54:41", "energy_charged": 94.8}]}'
);

CREATE TABLE charger_reviews (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    google_charger_id VARCHAR(255) NOT NULL,
    rating TINYINT UNSIGNED NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review TEXT DEFAULT NULL,
    user_id VARCHAR(255) NOT NULL,     
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO charger_reviews (google_charger_id, rating, review, user_id)
VALUES 
    ('ChIJN1t_tDeuEmsRUsoyG83frY4', 5, 'Great spot!', '104598189720184254586');