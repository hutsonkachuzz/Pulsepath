import sys
import io
import requests

BASE_URL = "http://127.0.0.1:8000/api"

def run_tests():
    print("--- Starting PulsePath API End-to-End Test Suite ---")
    session = requests.Session()

    # 1. Health check
    res = session.get(f"{BASE_URL}/health")
    assert res.status_code == 200, f"Health check failed: {res.text}"
    print("[PASS] 1. Health check")

    # 2. Register User One (Alex)
    alex_email = "alex_test_unique@pulsepath.love"
    res = session.post(f"{BASE_URL}/auth/register", json={
        "email": alex_email,
        "password": "Password123!",
        "name": "Alex"
    })
    # If user already exists from previous run, login instead
    if res.status_code == 400:
        res = session.post(f"{BASE_URL}/auth/login", json={
            "email": alex_email,
            "password": "Password123!"
        })
    assert res.status_code == 200, f"Alex registration/login failed: {res.text}"
    alex_data = res.json()
    alex_token = alex_data["access_token"]
    alex_headers = {"Authorization": f"Bearer {alex_token}"}
    print("[PASS] 2. User registration & JWT generation (Alex)")

    # 3. Create Couple Space
    res = session.post(f"{BASE_URL}/couples/create", json={
        "relationship_start_date": "2023-01-01T00:00:00.000Z",
        "nickname": "Alex & Sam",
        "description": "Our sacred bond."
    }, headers=alex_headers)
    assert res.status_code == 200, f"Create couple failed: {res.text}"
    couple_data = res.json()
    couple_id = couple_data["id"]
    couple_code = couple_data["couple_code"]
    assert couple_code.startswith("PULSE-"), f"Unexpected couple code: {couple_code}"
    print(f"[PASS] 3. Couple space created: {couple_code}")

    # 4. Register User Two (Sam) and Join Couple Space
    sam_email = "sam_test_unique@pulsepath.love"
    res = session.post(f"{BASE_URL}/auth/register", json={
        "email": sam_email,
        "password": "Password123!",
        "name": "Sam"
    })
    if res.status_code == 400:
        res = session.post(f"{BASE_URL}/auth/login", json={
            "email": sam_email,
            "password": "Password123!"
        })
    assert res.status_code == 200, f"Sam registration/login failed: {res.text}"
    sam_token = res.json()["access_token"]
    sam_headers = {"Authorization": f"Bearer {sam_token}"}

    res = session.post(f"{BASE_URL}/couples/join", json={
        "couple_code": couple_code
    }, headers=sam_headers)
    assert res.status_code == 200, f"Sam join couple failed: {res.text}"
    assert res.json()["user_two_name"] == "Sam", "Partner name not linked"
    print("[PASS] 4. Partner joined couple space successfully")

    # 5. Add Memory & Retrieve
    res = session.post(f"{BASE_URL}/memories/", json={
        "title": "First Coffee at Dawn",
        "description": "Sitting by the misty window sipping hot espresso.",
        "date": "2024-02-14",
        "mood": "Romantic",
        "mood_emoji": "🥰",
        "tags": ["Coffee", "Dawn", "Quiet"],
        "is_favorite": True
    }, headers=alex_headers)
    assert res.status_code == 200, f"Create memory failed: {res.text}"
    memory_id = res.json()["id"]

    res = session.get(f"{BASE_URL}/memories/", headers=sam_headers)
    assert res.status_code == 200
    mems = res.json()
    assert any(m["id"] == memory_id for m in mems), "Sam could not see Alex's shared memory"
    print("[PASS] 5. Shared memory created and synchronized across partners")

    # 6. Chat messaging & Reaction
    res = session.post(f"{BASE_URL}/chat/messages", json={
        "content": "Good morning my sweetheart ❤️"
    }, headers=alex_headers)
    assert res.status_code == 200
    msg_id = res.json()["id"]

    res = session.post(f"{BASE_URL}/chat/messages/{msg_id}/reaction", json={
        "emoji": "❤️"
    }, headers=sam_headers)
    assert res.status_code == 200
    assert "❤️" in res.json()["reactions"], "Reaction not recorded"

    # Mark seen
    res = session.post(f"{BASE_URL}/chat/messages/seen", headers=sam_headers)
    assert res.status_code == 200
    print("[PASS] 6. Chat messaging, emoji reactions, and read receipts")

    # 7. Save message as memory
    res = session.post(f"{BASE_URL}/chat/messages/{msg_id}/save-memory", json={
        "custom_title": "Morning Love Note"
    }, headers=sam_headers)
    assert res.status_code == 200
    assert res.json()["title"] == "Morning Love Note", "Failed to save message as memory"
    print("[PASS] 7. Save chat note as eternal memory")

    # 8. Love Thoughts & Privacy Isolation
    # Alex creates private thought
    res = session.post(f"{BASE_URL}/thoughts/", json={
        "content": "Secret surprise plan for our anniversary.",
        "visibility": "private"
    }, headers=alex_headers)
    assert res.status_code == 200
    private_thought_id = res.json()["id"]

    # Alex creates shared thought
    res = session.post(f"{BASE_URL}/thoughts/", json={
        "content": "You are my peace.",
        "visibility": "shared"
    }, headers=alex_headers)
    assert res.status_code == 200
    shared_thought_id = res.json()["id"]

    # Sam fetches thoughts -> MUST NOT see private thought
    res = session.get(f"{BASE_URL}/thoughts/", headers=sam_headers)
    assert res.status_code == 200
    sam_thoughts = res.json()
    assert any(t["id"] == shared_thought_id for t in sam_thoughts), "Sam should see shared thought"
    assert not any(t["id"] == private_thought_id for t in sam_thoughts), "SECURITY BREACH: Sam saw Alex's private thought!"
    print("[PASS] 8. Love thoughts with strict privacy isolation (Private vs Shared)")

    # 9. Love Letter & Opening
    res = session.post(f"{BASE_URL}/letters/", json={
        "title": "A Letter for Sam",
        "content": "Every sunrise reminds me of you."
    }, headers=alex_headers)
    assert res.status_code == 200
    letter_id = res.json()["id"]
    assert res.json()["opened_at"] is None

    res = session.put(f"{BASE_URL}/letters/{letter_id}/open", headers=sam_headers)
    assert res.status_code == 200
    assert res.json()["opened_at"] is not None
    print("[PASS] 9. Cinematic love letter created and sealed/opened")

    # 10. Special Dates & Countdown
    res = session.post(f"{BASE_URL}/dates/", json={
        "title": "Paris Getaway",
        "date": "2026-12-31T23:59:00.000Z",
        "category": "trip",
        "description": "Celebrating New Year under the Eiffel Tower."
    }, headers=alex_headers)
    assert res.status_code == 200
    date_id = res.json()["id"]

    res = session.get(f"{BASE_URL}/dates/", headers=sam_headers)
    assert res.status_code == 200
    assert any(d["id"] == date_id for d in res.json())
    print("[PASS] 10. Special date countdown created and synced")

    # 11. Daily Question & Answer
    res = session.get(f"{BASE_URL}/daily/today", headers=alex_headers)
    assert res.status_code == 200
    today_q = res.json()
    assert today_q["question"] != ""

    res = session.post(f"{BASE_URL}/daily/answer", json={
        "answer_text": "Cooking pasta together while it poured outside."
    }, headers=alex_headers)
    assert res.status_code == 200
    assert len(res.json()["answers"]) >= 1
    print("[PASS] 11. Daily ritual question and couple answers")

    # 12. Moods
    res = session.post(f"{BASE_URL}/moods/", json={
        "mood": "Romantic",
        "emoji": "🥰",
        "note": "Can't stop thinking about you!"
    }, headers=alex_headers)
    assert res.status_code == 200

    res = session.get(f"{BASE_URL}/moods/", headers=sam_headers)
    assert res.status_code == 200
    assert res.json()[alex_data["user"]["id"]]["mood"] == "Romantic"
    print("[PASS] 12. Real-time mood synchronizer")

    # 13. File Upload
    fake_img = io.BytesIO(b"GIF89a\x01\x00\x01\x00\x80\x00\x00\xff\xff\xff\x00\x00\x00!\xf9\x04\x01\x00\x00\x00\x00,\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02D\x01\x00;")
    res = session.post(f"{BASE_URL}/uploads/", files={"file": ("memory_snapshot.gif", fake_img, "image/gif")}, headers=alex_headers)
    assert res.status_code == 200, f"Upload failed: {res.text}"
    uploaded_url = res.json()["url"]
    assert uploaded_url.startswith("/uploads/"), f"Unexpected upload URL: {uploaded_url}"
    print(f"[PASS] 13. File upload validated and stored: {uploaded_url}")

    # 14. Couple Isolation & Security Check
    # Register Stranger
    stranger_email = "stranger_unique@pulsepath.love"
    res = session.post(f"{BASE_URL}/auth/register", json={
        "email": stranger_email,
        "password": "Password123!",
        "name": "Stranger"
    })
    if res.status_code == 400:
        res = session.post(f"{BASE_URL}/auth/login", json={
            "email": stranger_email,
            "password": "Password123!"
        })
    stranger_headers = {"Authorization": f"Bearer {res.json()['access_token']}"}

    # Stranger tries to fetch Alex & Sam's memories -> MUST be 400 Bad Request (no couple) or forbidden
    res = session.get(f"{BASE_URL}/memories/", headers=stranger_headers)
    assert res.status_code in (400, 403, 404), f"Security breach: Stranger got: {res.status_code}"
    print("[PASS] 14. Cross-couple data isolation security verified")

    print("\n--- ALL 14 TEST SUITES PASSED FLAWLESSLY! ---")

if __name__ == "__main__":
    run_tests()
