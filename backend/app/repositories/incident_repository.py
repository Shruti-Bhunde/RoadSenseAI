from typing import Any
from zoneinfo import ZoneInfo
from datetime import datetime
from app.schemas.incident import IncidentCreate


class IncidentRepository:
    @staticmethod
    def create(db: Any, incident: IncidentCreate) -> dict:
        with db.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO incidents (
                    incident_type, description, ai_summary, severity, traffic_impact,
                    latitude, longitude, media_type, media_url, confidence, reported_at
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """,
                (
                    incident.incident_type,
                    incident.description,
                    incident.ai_summary,
                    incident.severity,
                    incident.traffic_impact,
                    incident.latitude,
                    incident.longitude,
                    incident.media_type,
                    incident.media_url,
                    incident.confidence,
                    incident.reported_at,
                ),
            )
            incident_id = cursor.lastrowid

        db.commit()
        return IncidentRepository.get_by_id(db, incident_id)

    @staticmethod
    def get_all(db: Any, skip: int = 0, limit: int = 100):
        with db.cursor() as cursor:
            cursor.execute(
                "SELECT * FROM incidents ORDER BY reported_at DESC LIMIT %s OFFSET %s",
                (limit, skip),
            )
            rows = cursor.fetchall()
            # Attach IST timezone info to reported_at for API responses
            for r in rows:
                if r.get('reported_at') and isinstance(r.get('reported_at'), datetime):
                    r['reported_at'] = r['reported_at'].replace(tzinfo=ZoneInfo('Asia/Kolkata'))
            return rows

    @staticmethod
    def get_by_id(db: Any, incident_id: int):
        with db.cursor() as cursor:
            cursor.execute("SELECT * FROM incidents WHERE id = %s", (incident_id,))
            row = cursor.fetchone()
            if row and row.get('reported_at') and isinstance(row.get('reported_at'), datetime):
                row['reported_at'] = row['reported_at'].replace(tzinfo=ZoneInfo('Asia/Kolkata'))
            return row

    @staticmethod
    def delete(db: Any, incident_id: int) -> bool:
        with db.cursor() as cursor:
            cursor.execute("DELETE FROM incidents WHERE id = %s", (incident_id,))
            deleted = cursor.rowcount
        db.commit()
        return deleted > 0
