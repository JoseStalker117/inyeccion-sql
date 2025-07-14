IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'USUARIOS')
BEGIN
    CREATE DATABASE USUARIOS;
END
GO

USE USUARIOS;
GO

IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='USUARIOS' AND xtype='U')
BEGIN
    CREATE TABLE USUARIOS (
        id INT PRIMARY KEY IDENTITY(1,1),
        username NVARCHAR(50) NOT NULL,
        password NVARCHAR(50) NOT NULL
    );
END
GO

IF NOT EXISTS (SELECT TOP 1 1 FROM USUARIOS)
BEGIN
    INSERT INTO USUARIOS (username, password) VALUES
    ('jmaiv117','admin123'),
    ('anahis68','superduper'),
    ('josefriki23','sindromeimpostor'),
    ('landaverde','mainrakan'),
    ('izumi','mainsamira'),
    ('annotheralgo','mainxayah');
END
GO