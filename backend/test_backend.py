from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health():
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"
    print("[PASSED] GET /health")

def test_register_and_login():
    # Register test user if not exists
    client.post("/api/auth/register", json={
        "email": "testuser@example.com",
        "username": "testuser",
        "password": "Password123!",
        "password_confirm": "Password123!",
        "first_name": "Test",
        "last_name": "User"
    })

    res = client.post("/api/auth/login", json={"email": "testuser@example.com", "password": "Password123!"})
    assert res.status_code == 200, f"Login failed: {res.text}"
    data = res.json()
    assert "access_token" in data
    print("[PASSED] POST /api/auth/login")
    return data["access_token"]

def test_authenticated_endpoints(token):
    headers = {"Authorization": f"Bearer {token}"}
    
    # 1. Analytics
    res = client.get("/api/analytics/summary", headers=headers)
    assert res.status_code == 200, f"Analytics summary failed: {res.status_code} - {res.text}"
    print("[PASSED] GET /api/analytics/summary")

    # 2. Transactions
    res = client.get("/api/transactions", headers=headers)
    assert res.status_code == 200, f"Transactions failed: {res.status_code} - {res.text}"
    print("[PASSED] GET /api/transactions")

    # 3. Categories
    res = client.get("/api/categories", headers=headers)
    assert res.status_code == 200
    print("[PASSED] GET /api/categories")

    # 4. Payment Methods
    res = client.get("/api/payment-methods", headers=headers)
    assert res.status_code == 200
    print("[PASSED] GET /api/payment-methods")

    # 5. Notifications
    res = client.get("/api/notifications", headers=headers)
    assert res.status_code == 200
    print("[PASSED] GET /api/notifications")

    res = client.get("/api/notifications/unread-count", headers=headers)
    assert res.status_code == 200
    print("[PASSED] GET /api/notifications/unread-count")

    # 6. Reports
    res = client.get("/api/reports/summary?period=monthly", headers=headers)
    assert res.status_code == 200
    print("[PASSED] GET /api/reports/summary")

    res = client.get("/api/reports/export/transactions?format=csv", headers=headers)
    assert res.status_code == 200
    print("[PASSED] GET /api/reports/export/transactions")

if __name__ == "__main__":
    test_health()
    token = test_register_and_login()
    test_authenticated_endpoints(token)
    print("\n[SUCCESS] ALL BACKEND FEATURES AND NEW ENDPOINTS TESTED SUCCESSFULLY!")
