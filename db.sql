CREATE DATABASE IF NOT EXISTS esl;
USE esl;

-- 👤 Usuarios
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  iracing_cust_id INT NULL,
  avatar_url TEXT,
  bio TEXT,
  role ENUM('superAdmin', 'admin', 'racer') NOT NULL DEFAULT 'racer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 🏁 Ligas
CREATE TABLE leagues (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  background_image VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 📥 Inscripciones a ligas
CREATE TABLE inscriptions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  league_id INT NOT NULL,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_id, league_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (league_id) REFERENCES leagues(id) ON DELETE CASCADE
);

-- 🏎️ Carreras
CREATE TABLE races (
  id INT AUTO_INCREMENT PRIMARY KEY,
  league_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  track_name VARCHAR(100),
  race_date DATE NOT NULL,
  race_time TIME,
  FOREIGN KEY (league_id) REFERENCES leagues(id) ON DELETE CASCADE
);

-- 🏆 Resultados por carrera
CREATE TABLE results (
  id INT AUTO_INCREMENT PRIMARY KEY,
  race_id INT NOT NULL,
  user_id INT NOT NULL,
  position INT,
  fastest_lap TIME,
  points INT,
  penalty TEXT,
  FOREIGN KEY (race_id) REFERENCES races(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 🏎️ Resultados individuales por sesión
CREATE TABLE session_results (
  id INT AUTO_INCREMENT PRIMARY KEY,
  session_id INT NOT NULL,
  user_id INT NOT NULL,
  finish_position INT,
  laps_complete INT,
  incidents INT,
  best_lap_time INT, -- milisegundos
  old_i_rating INT,
  new_i_rating INT,
  points_earned INT DEFAULT 0,
  FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 🧪 Sesiones dentro de cada evento (práctica / quali / carrera)
CREATE TABLE sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event_id INT NOT NULL,
  session_type ENUM('practice', 'qualify', 'race') NOT NULL,
  subsession_id BIGINT UNIQUE, -- el que viene en el JSON
  start_time DATETIME,
  end_time DATETIME,
  car_class VARCHAR(100),
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

-- 🗓️ Eventos (una fecha del campeonato, ej: Spa Week 1)
CREATE TABLE events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  league_id INT NOT NULL,
  name VARCHAR(100) NOT NULL, -- ej: "Imola GP"
  track_name VARCHAR(100),
  week_number INT,
  start_date DATE,
  FOREIGN KEY (league_id) REFERENCES leagues(id) ON DELETE CASCADE
);
