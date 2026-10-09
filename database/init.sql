-- -- database/init.sql

-- database/init.sql
-- Este archivo solo se ejecuta la PRIMERA vez que se crea la DB.
-- Las tablas las crea Django con 'manage.py migrate'.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -- 0. Crear los tipos ENUM para los estados (como en tu diagrama)
-- CREATE TYPE estado_habitacion AS ENUM ('LIBRE', 'OCUPADA', 'SUCIA');
-- CREATE TYPE estado_reserva AS ENUM ('PENDIENTE', 'CHECKIN', 'CHECKOUT', 'CANCELADA');
-- CREATE TYPE tipo_transaccion AS ENUM ('CARGO', 'PAGO');

-- -- 1. Tabla de ADMIN (Para el login y gestión de usuarios)
-- CREATE TABLE admin (
--     id SERIAL PRIMARY KEY,
--     username VARCHAR(50) UNIQUE NOT NULL,
--     password_hash VARCHAR(255) NOT NULL,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- -- 2. Tabla de Habitaciones (El corazón del Room Engine)
-- CREATE TABLE habitaciones (
--     id SERIAL PRIMARY KEY,
--     numero VARCHAR(10) UNIQUE NOT NULL,
--     tipo VARCHAR(50) NOT NULL, -- Ej: 'Simple', 'Doble', 'Suite'
--     estado estado_habitacion DEFAULT 'LIBRE',
--     precio_base DECIMAL(10, 2) NOT NULL -- Simple: 50.00, Doble: 80.00, Suite: 150.00
-- );

-- -- 3. Tabla de Huéspedes
-- CREATE TABLE huespedes (
--     id SERIAL PRIMARY KEY,
--     nombre_completo VARCHAR(100) NOT NULL,
--     documento_identidad VARCHAR(20) UNIQUE NOT NULL,
--     telefono VARCHAR(20),
--     email VARCHAR(100)
-- );

-- -- 4. Tabla de Usuarios (Recepcionistas/Cajeros)
-- CREATE TABLE usuarios (
--     id SERIAL PRIMARY KEY,
--     nombre VARCHAR(100) NOT NULL,
--     rol VARCHAR(20) DEFAULT 'RECEPCIONISTA'
-- );

-- -- 5. Tabla de Turnos de Caja (Para el "Abrir/Cerrar turno de caja")
-- CREATE TABLE turnos_caja (
--     id SERIAL PRIMARY KEY,
--     usuario_id INT REFERENCES usuarios(id),
--     fecha_apertura TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     fecha_cierre TIMESTAMP,
--     monto_inicial DECIMAL(10, 2) DEFAULT 0,
--     monto_esperado DECIMAL(10, 2),
--     monto_contado DECIMAL(10, 2),
--     estado VARCHAR(20) DEFAULT 'ABIERTO'
-- );

-- -- 6. Tabla de Reservas
-- CREATE TABLE reservas (
--     id SERIAL PRIMARY KEY,
--     huesped_id INT REFERENCES huespedes(id),
--     habitacion_id INT REFERENCES habitaciones(id),
--     fecha_entrada DATE NOT NULL,
--     fecha_salida DATE NOT NULL,
--     estado estado_reserva DEFAULT 'PENDIENTE',
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- -- 7. Tabla de Transacciones (Cargos y Pagos)
-- CREATE TABLE transacciones (
--     id SERIAL PRIMARY KEY,
--     turno_id INT REFERENCES turnos_caja(id),
--     reserva_id INT REFERENCES reservas(id),
--     tipo tipo_transaccion NOT NULL,
--     monto DECIMAL(10, 2) NOT NULL,
--     descripcion VARCHAR(255),
--     fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- -- 8. Insertar datos de prueba (Seeders)
-- INSERT INTO habitaciones (numero, tipo, precio_base) VALUES 
-- ('101', 'Simple', 50.00),
-- ('102', 'Doble', 80.00),
-- ('201', 'Suite', 150.00);

-- INSERT INTO usuarios (nombre, rol) VALUES ('Admin Test', 'ADMIN');