from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pyodbc
import os
from typing import Optional
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Login API", description="API sencilla para autenticación con MSSQL")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción, especifica los dominios permitidos
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Pydantic models
class LoginRequest(BaseModel):
    username: str
    password: str

class LoginResponse(BaseModel):
    success: bool
    message: str
    user_id: Optional[int] = None
    username: Optional[str] = None

# Database configuration
DB_CONFIG = {
    'server': 'ms-express',  # Docker service name
    'database': 'USUARIOS',  # Your database name
    'username': 'sa',
    'password': 'Apocalypse117',
    'driver': 'FreeTDS'
}

def get_db_connection():
    """Create database connection"""
    try:
        connection_string = (
            f"DRIVER={{FreeTDS}};"
            f"SERVER={DB_CONFIG['server']};"
            f"PORT=1433;"
            f"DATABASE={DB_CONFIG['database']};"
            f"UID={DB_CONFIG['username']};"
            f"PWD={DB_CONFIG['password']};"
            "TDS_Version=8.0;"
        )
        conn = pyodbc.connect(connection_string)
        return conn
    except Exception as e:
        logger.error(f"Database connection error: {e}")
        raise HTTPException(status_code=500, detail="Error de conexión a la base de datos")

def init_database():
    """Test database connection"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Test query to check if USUARIOS table exists
        test_query = "SELECT COUNT(*) FROM USUARIOS"
        cursor.execute(test_query)
        count = cursor.fetchone()[0]
        
        conn.close()
        logger.info(f"Database connection successful. Found {count} users in USUARIOS table.")
        
    except Exception as e:
        logger.error(f"Database initialization error: {e}")
        raise HTTPException(status_code=500, detail="Error inicializando la base de datos")

@app.on_event("startup")
async def startup_event():
    """Initialize database on startup"""
    logger.info("Starting up API...")
    try:
        init_database()
        logger.info("API started successfully")
    except Exception as e:
        logger.error(f"Startup error: {e}")

@app.get("/")
async def root():
    """Health check endpoint"""
    return {"message": "Login API is running", "status": "healthy"}

@app.get("/api/test")
async def test_connection():
    """Test endpoint for frontend connection"""
    return {"message": "API connection successful", "timestamp": "2024-01-01T00:00:00"}

@app.post("/api/login", response_model=LoginResponse)
async def login(login_data: LoginRequest):
    """
    Authenticate user with username and password
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Query to check user credentials in USUARIOS table
        query = """
        SELECT id, username 
        FROM USUARIOS 
        WHERE username = ? AND password = ?
        """
        
        cursor.execute(query, (login_data.username, login_data.password))
        user = cursor.fetchone()
        
        conn.close()
        
        if user:
            return LoginResponse(
                success=True,
                message="Login exitoso",
                user_id=user[0],
                username=user[1]
            )
        else:
            return LoginResponse(
                success=False,
                message="Usuario o contraseña incorrectos"
            )
            
    except Exception as e:
        logger.error(f"Login error: {e}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")

@app.get("/api/users")
async def get_users():
    """
    Get all users (for testing purposes)
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        query = "SELECT id, username FROM USUARIOS"
        cursor.execute(query)
        users = cursor.fetchall()
        
        conn.close()
        
        return {
            "users": [
                {
                    "id": user[0],
                    "username": user[1]
                }
                for user in users
            ]
        }
        
    except Exception as e:
        logger.error(f"Get users error: {e}")
        raise HTTPException(status_code=500, detail="Error obteniendo usuarios")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
