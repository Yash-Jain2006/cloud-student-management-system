from app.db.database import engine
from sqlalchemy import text

try:
    with engine.connect() as conn:
        result = conn.execute(text('SELECT 1'))
        print(f"Success: {result.fetchone()}")
except Exception as e:
    print(f"Error: {e}")
