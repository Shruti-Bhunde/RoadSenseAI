import pymysql
from app.config.settings import settings


def get_connection():
    return pymysql.connect(
        host=settings.MYSQL_HOST,
        port=settings.MYSQL_PORT,
        user=settings.MYSQL_USER,
        password=settings.MYSQL_PASSWORD,
        database=settings.MYSQL_DB,
        charset=settings.MYSQL_CHARSET,
        cursorclass=pymysql.cursors.DictCursor,
        autocommit=False,
    )


def get_db():
    connection = get_connection()
    try:
        yield connection
    finally:
        connection.close()


def init_db():
    try:
        connection = get_connection()
    except Exception as exc:
        print(f"Database connection failed during initialization: {exc}")
        return

    if settings.MYSQL_DB.lower() == "sys":
        print("WARNING: You are using the MySQL 'sys' system database. Table creation may be denied. Use a dedicated application database instead.")

    try:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                CREATE TABLE IF NOT EXISTS incidents (
                    id BIGINT PRIMARY KEY AUTO_INCREMENT,
                    incident_type VARCHAR(100) NOT NULL,
                    description TEXT,
                    ai_summary TEXT,
                    severity VARCHAR(50),
                    traffic_impact VARCHAR(50),
                    latitude DOUBLE,
                    longitude DOUBLE,
                    media_type VARCHAR(50),
                    media_url VARCHAR(500),
                    confidence DOUBLE,
                    reported_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
                """
            )
        connection.commit()
        print("MySQL table 'incidents' is ready.")
    except Exception as exc:
        print(f"Database initialization failed: {exc}")
        if "CREATE command denied" in str(exc):
            print("  -> Permission denied while creating the table. Check the database user privileges or switch MYSQL_DB to a writable database.")
    finally:
        connection.close()
