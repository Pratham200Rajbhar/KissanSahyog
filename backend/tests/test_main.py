import pytest
from fastapi.testclient import TestClient
from app.main import app
import json

client = TestClient(app)

def test_read_main():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"
    assert "api_version" in response.json()

def test_liveness():
    response = client.get("/health/live")
    assert response.status_code == 200
    assert response.json() == {"status": "alive"}

def test_readiness():
    response = client.get("/health/ready")
    assert response.status_code == 200
    assert response.json()["status"] == "ready"

def test_yield_prediction_unauthenticated():
    # Attempting to access prediction without auth should fail
    response = client.post("/api/v1/predict/yield", json={})
    assert response.status_code == 401
