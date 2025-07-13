CREATE DATABASE IF NOT EXISTS USUARIOS;
GO

USE USUARIOS;
GO


CREATE TABLE IF NOT EXISTS USUARIOS (
    id INT PRIMARY KEY IDENTITY(1,1),
    username NVARCHAR(50) NOT NULL,
    password NVARCHAR(50) NOT NULL
);
GO

INSERT INTO USUARIOS (username, password) VALUES
('jmaiv117','admin123'),
('anahis68','superduper'),
('josefriki23','sindromeimpostor'),
('landaverde','mainrakan'),
('izumi','mainsamira'),
('annotheralgo','mainxayah');
GO