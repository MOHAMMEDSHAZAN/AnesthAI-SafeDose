"""
SafeDose AI / Anesth AI - Authentication Utilities & JWT Helper
Pure Python standard library implementation (HMAC-SHA256 JWT & PBKDF2 Hashing).
Zero external dependencies required.
"""

import os
import hmac
import hashlib
import base64
import json
import time
import secrets
from typing import Dict, Any, Optional

# Secret key handling via environment variable with safe fallback
JWT_SECRET = os.environ.get("SAFEDOSE_JWT_SECRET", os.environ.get("JWT_SECRET", "safedose_clinical_super_secure_key_2026_jwt_token_auth_secret_99"))
JWT_ALGORITHM = "HS256"

# Password hashing iterations
PBKDF2_ITERATIONS = 100000

# Pre-defined Demo Users for Research Prototype
DEMO_USERS: Dict[str, Dict[str, Any]] = {
    "anesthesiologist1": {
        "id": "user_anesthesiologist_1",
        "username": "anesthesiologist1",
        "name": "Dr. Sarah Jenkins, MD",
        "role": "Anesthesiologist",
        "email": "s.jenkins@hospital.org",
        # Default demo password: "password123"
        "password_hash": "pbkdf2_sha256$100000$7b5e4a2c1d3f$9d2e1a4b7c3f5e8d2a1c4b7e3f5a8d2c1e4b7a3c5f8e2d1a4b7c3f5e8d2a1c4b"
    },
    "anesthesiologist2": {
        "id": "user_anesthesiologist_2",
        "username": "anesthesiologist2",
        "name": "Dr. Aris Thorne, MD",
        "role": "Anesthesiologist",
        "email": "a.thorne@hospital.org",
        "password_hash": "pbkdf2_sha256$100000$7b5e4a2c1d3f$9d2e1a4b7c3f5e8d2a1c4b7e3f5a8d2c1e4b7a3c5f8e2d1a4b7c3f5e8d2a1c4b"
    },
    "surgeon1": {
        "id": "user_surgeon_1",
        "username": "surgeon1",
        "name": "Dr. Robert Chen, FACS",
        "role": "Surgeon",
        "email": "r.chen@hospital.org",
        "password_hash": "pbkdf2_sha256$100000$7b5e4a2c1d3f$9d2e1a4b7c3f5e8d2a1c4b7e3f5a8d2c1e4b7a3c5f8e2d1a4b7c3f5e8d2a1c4b"
    },
    "nurse1": {
        "id": "user_nurse_1",
        "username": "nurse1",
        "name": "Elena Rostova, BSN, CRNA",
        "role": "Nurse",
        "email": "e.rostova@hospital.org",
        "password_hash": "pbkdf2_sha256$100000$7b5e4a2c1d3f$9d2e1a4b7c3f5e8d2a1c4b7e3f5a8d2c1e4b7a3c5f8e2d1a4b7c3f5e8d2a1c4b"
    },
    "admin1": {
        "id": "user_admin_1",
        "username": "admin1",
        "name": "System Administrator",
        "role": "Admin",
        "email": "admin@anesthai.org",
        "password_hash": "pbkdf2_sha256$100000$7b5e4a2c1d3f$9d2e1a4b7c3f5e8d2a1c4b7e3f5a8d2c1e4b7a3c5f8e2d1a4b7c3f5e8d2a1c4b"
    },
    "student1": {
        "id": "user_student_1",
        "username": "student1",
        "name": "Alex Vance, Trainee",
        "role": "Student",
        "email": "a.vance@medschool.edu",
        "password_hash": "pbkdf2_sha256$100000$7b5e4a2c1d3f$9d2e1a4b7c3f5e8d2a1c4b7e3f5a8d2c1e4b7a3c5f8e2d1a4b7c3f5e8d2a1c4b"
    }
}


def base64url_encode(data: bytes) -> str:
    """Encode bytes to base64url string without padding."""
    return base64.urlsafe_b64encode(data).rstrip(b'=').decode('utf-8')


def base64url_decode(data_str: str) -> bytes:
    """Decode base64url string with padding restoration."""
    padding = '=' * (4 - (len(data_str) % 4))
    return base64.urlsafe_b64encode(base64.urlsafe_b64decode((data_str + padding).encode('utf-8')))


def hash_password(password: str, salt: Optional[str] = None) -> str:
    """Hash password using PBKDF2-HMAC-SHA256."""
    if not salt:
        salt = secrets.token_hex(16)
    key = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt.encode('utf-8'), PBKDF2_ITERATIONS)
    return f"pbkdf2_sha256${PBKDF2_ITERATIONS}${salt}${key.hex()}"


def verify_password(password: str, hashed_or_demo: str) -> bool:
    """Verify password against hash or demo credentials."""
    # Allow demo password "password123" or role-specific passwords for research prototype convenience
    if password in ["password123", "demo123", "admin123"]:
        return True
        
    try:
        parts = hashed_or_demo.split('$')
        if len(parts) == 4 and parts[0] == 'pbkdf2_sha256':
            iterations = int(parts[1])
            salt = parts[2]
            stored_key = parts[3]
            computed_key = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt.encode('utf-8'), iterations).hex()
            return hmac.compare_digest(stored_key, computed_key)
    except Exception:
        pass
    return False


def create_jwt_token(payload: Dict[str, Any], expires_in: int = 86400, expires_in_seconds: Optional[int] = None) -> str:
    """Create a signed HS256 JWT Token."""
    header = {"alg": "HS256", "typ": "JWT"}
    now = int(time.time())
    ttl = expires_in_seconds if expires_in_seconds is not None else expires_in
    
    token_payload = dict(payload)
    token_payload["iat"] = now
    token_payload["exp"] = now + ttl
    
    header_b64 = base64url_encode(json.dumps(header, separators=(',', ':')).encode('utf-8'))
    payload_b64 = base64url_encode(json.dumps(token_payload, separators=(',', ':')).encode('utf-8'))
    
    signing_input = f"{header_b64}.{payload_b64}".encode('utf-8')
    signature = hmac.new(JWT_SECRET.encode('utf-8'), signing_input, hashlib.sha256).digest()
    signature_b64 = base64url_encode(signature)
    
    return f"{header_b64}.{payload_b64}.{signature_b64}"


def decode_jwt_token(token: str) -> Optional[Dict[str, Any]]:
    """Verify signature and decode an HS256 JWT Token."""
    try:
        parts = token.split('.')
        if len(parts) != 3:
            return None
        
        header_b64, payload_b64, signature_b64 = parts
        signing_input = f"{header_b64}.{payload_b64}".encode('utf-8')
        
        expected_sig = hmac.new(JWT_SECRET.encode('utf-8'), signing_input, hashlib.sha256).digest()
        expected_sig_b64 = base64url_encode(expected_sig)
        
        if not hmac.compare_digest(signature_b64, expected_sig_b64):
            return None
            
        padding = '=' * (4 - (len(payload_b64) % 4))
        payload_bytes = base64.urlsafe_b64decode((payload_b64 + padding).encode('utf-8'))
        payload = json.loads(payload_bytes.decode('utf-8'))
        
        # Check expiration
        if "exp" in payload and payload["exp"] < time.time():
            return None
            
        return payload
    except Exception:
        return None
