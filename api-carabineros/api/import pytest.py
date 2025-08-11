import pytest
from fastapi.testclient import TestClient
from unittest.mock import Mock, patch, MagicMock
from sqlalchemy.orm import Session
from api.app import app, get_db, EncargoPatenteModel, EncargoPatente

# Create test client
client = TestClient(app)

# Mock database dependency
def override_get_db():
    db = Mock(spec=Session)
    try:
        yield db
    finally:
        pass

app.dependency_overrides[get_db] = override_get_db

class TestRootEndpoint:
    """Tests for the root endpoint"""
    
    def test_read_root_success(self):
        response = client.get("/")
        assert response.status_code == 200
        assert response.json() == {"message": "API de carabineros"}

class TestHealthCheckEndpoint:
    """Tests for the health check endpoint"""
    
    @patch('api.app.SessionLocal')
    def test_health_check_success(self, mock_session):
        mock_db = Mock()
        mock_session.return_value = mock_db
        mock_db.execute.return_value = None
        
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json() == {"status": "healthy", "database": "connected"}
        mock_db.execute.assert_called_once_with("SELECT 1")
        mock_db.close.assert_called_once()
    
    @patch('api.app.SessionLocal')
    def test_health_check_database_error(self, mock_session):
        mock_session.side_effect = Exception("Database connection failed")
        
        response = client.get("/health")
        assert response.status_code == 200
        response_json = response.json()
        assert response_json["status"] == "unhealthy"
        assert response_json["database"] == "disconnected"
        assert "Database connection failed" in response_json["error"]

class TestEncargoEndpoint:
    """Tests for the encargo patente endpoint"""
    
    @patch('api.app.validar_patente')
    def test_get_encargo_patente_success(self, mock_validar_patente):
        # Setup mocks
        mock_validar_patente.return_value = True
        mock_db = Mock(spec=Session)
        mock_encargo = Mock()
        mock_encargo.id = 1
        mock_encargo.ppu = "AA1234"
        mock_encargo.encargo = True
        
        mock_db.query.return_value.filter.return_value.first.return_value = mock_encargo
        
        # Override dependency for this test
        def override_get_db_success():
            yield mock_db
        
        app.dependency_overrides[get_db] = override_get_db_success
        
        response = client.get("/encargo_patente/AA1234")
        assert response.status_code == 200
        assert response.json() == {"id": 1, "ppu": "AA1234", "encargo": True}
    
    @patch('api.app.validar_patente')
    def test_get_encargo_patente_invalid_format(self, mock_validar_patente):
        mock_validar_patente.return_value = False
        
        response = client.get("/encargo_patente/INVALID")
        assert response.status_code == 400
        assert response.json()["detail"] == "Formato de PPU inválido"
    
    @patch('api.app.validar_patente')
    def test_get_encargo_patente_not_found(self, mock_validar_patente):
        mock_validar_patente.return_value = True
        mock_db = Mock(spec=Session)
        mock_db.query.return_value.filter.return_value.first.return_value = None
        
        def override_get_db_not_found():
            yield mock_db
        
        app.dependency_overrides[get_db] = override_get_db_not_found
        
        response = client.get("/encargo_patente/BB5678")
        assert response.status_code == 404
        assert response.json()["detail"] == "Encargo no encontrado"
    
    @patch('api.app.validar_patente')
    def test_get_encargo_patente_database_error(self, mock_validar_patente):
        mock_validar_patente.return_value = True
        mock_db = Mock(spec=Session)
        mock_db.query.side_effect = Exception("Database error")
        
        def override_get_db_error():
            yield mock_db
        
        app.dependency_overrides[get_db] = override_get_db_error
        
        response = client.get("/encargo_patente/CC9999")
        assert response.status_code == 500
        assert "Error de base de datos" in response.json()["detail"]

    @patch('api.app.validar_patente')
    def test_get_encargo_patente_validation_exception(self, mock_validar_patente):
        mock_validar_patente.side_effect = Exception("Validation service error")
        
        response = client.get("/encargo_patente/DD1111")
        assert response.status_code == 500
        assert "Error de base de datos" in response.json()["detail"]