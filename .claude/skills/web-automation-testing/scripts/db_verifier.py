#!/usr/bin/env python3
"""
Database Verifier
Connects to MySQL and executes SELECT queries for test verification.
"""

import os
import re
from typing import Dict, List, Any, Optional, Tuple
from contextlib import contextmanager

try:
    import pymysql
    from pymysql.cursors import DictCursor
    PYMYSQL_AVAILABLE = True
except ImportError:
    PYMYSQL_AVAILABLE = False


class DBVerifier:
    """Verifies database state by executing SELECT queries."""

    DEFAULT_TIMEOUT = 5

    def __init__(self, config: Optional[Dict[str, Any]] = None):
        """
        Initialize DB verifier.
        Config: host, port, database, user, password (optional).
        If None, reads from plan database field, then env (DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD).
        """
        self.config = self._resolve_config(config or {})

    def _resolve_config(self, plan_db: Dict[str, Any]) -> Dict[str, Any]:
        """Resolve config: plan database -> env -> defaults."""
        return {
            "host": (
                plan_db.get("host")
                or os.environ.get("DB_HOST")
                or "localhost"
            ),
            "port": int(
                plan_db.get("port")
                or os.environ.get("DB_PORT")
                or 3306
            ),
            "database": (
                plan_db.get("database")
                or os.environ.get("DB_NAME")
                or "heartsphere"
            ),
            "user": (
                plan_db.get("username")
                or plan_db.get("user")
                or os.environ.get("DB_USER")
                or "root"
            ),
            "password": (
                plan_db.get("password")
                or os.environ.get("DB_PASSWORD")
                or "123456"
            ),
        }

    @contextmanager
    def _connection(self, timeout: int = DEFAULT_TIMEOUT):
        if not PYMYSQL_AVAILABLE:
            raise RuntimeError("pymysql is not installed. Run: pip install pymysql")
        conn = pymysql.connect(
            host=self.config["host"],
            port=self.config["port"],
            user=self.config["user"],
            password=self.config["password"],
            database=self.config["database"],
            charset="utf8mb4",
            connect_timeout=timeout,
            cursorclass=DictCursor,
        )
        try:
            yield conn
        finally:
            conn.close()

    def execute_query(self, sql: str, timeout: int = DEFAULT_TIMEOUT) -> Tuple[bool, Optional[List[Dict]], Optional[str]]:
        """
        Execute a SELECT query. Returns (success, rows, error_message).
        Only SELECT is allowed (whitespace-stripped, case-insensitive).
        """
        sql_stripped = sql.strip()
        if not sql_stripped.upper().startswith("SELECT"):
            return False, None, "Only SELECT queries are allowed for verification"
        try:
            with self._connection(timeout=timeout) as conn:
                with conn.cursor() as cur:
                    cur.execute(sql)
                    rows = cur.fetchall()
                    # Convert to serializable format (e.g. datetime -> str)
                    out = []
                    for row in rows:
                        out.append({k: (v.isoformat() if hasattr(v, "isoformat") else v) for k, v in row.items()})
                    return True, out, None
        except Exception as e:
            return False, None, str(e)

    def verify(self, sql: str, expected: Any, timeout: int = DEFAULT_TIMEOUT) -> Dict[str, Any]:
        """
        Execute SQL and compare result to expected.
        expected: scalar (e.g. 1) or list of dicts for multi-row.
        Returns dict: success, actual, expected, error, sql.
        """
        ok, rows, err = self.execute_query(sql, timeout=timeout)
        if not ok:
            return {
                "success": False,
                "sql": sql,
                "actual": None,
                "expected": expected,
                "error": err,
            }
        # Normalize expected for comparison (e.g. "1" vs 1)
        if rows is None:
            rows = []
        if len(rows) == 1 and len(rows[0]) == 1:
            actual_scalar = list(rows[0].values())[0]
            exp = expected
            if isinstance(exp, str) and exp.isdigit():
                exp = int(exp)
            elif isinstance(exp, str) and exp.replace(".", "", 1).isdigit():
                exp = float(exp)
            match = actual_scalar == exp
            return {
                "success": match,
                "sql": sql,
                "actual": actual_scalar,
                "expected": expected,
                "error": None if match else f"Expected {expected}, got {actual_scalar}",
            }
        if len(rows) == 0:
            match = expected in (0, "0", None, [])
            return {
                "success": match,
                "sql": sql,
                "actual": None if not rows else rows,
                "expected": expected,
                "error": None if match else f"Expected {expected}, got no rows",
            }
        return {
            "success": rows == expected if isinstance(expected, list) else False,
            "sql": sql,
            "actual": rows,
            "expected": expected,
            "error": None if (rows == expected) else f"Result rows do not match expected",
        }


def parse_database_step(step: str) -> Optional[Tuple[str, Any]]:
    """
    Parse step like:
      verify database: SELECT COUNT(*) FROM users expect 1
      check database: SELECT name FROM users LIMIT 1 expect myuser
    Returns (sql, expected) or None if not a database step.
    """
    step_lower = step.strip().lower()
    if not (step_lower.startswith("verify database:") or step_lower.startswith("check database:")):
        return None
    rest = step.split(":", 1)[1].strip()
    # Expect "SELECT ... expect <value>" or "SELECT ..." with implicit expect 1 for COUNT
    if " expect " in rest:
        parts = rest.rsplit(" expect ", 1)
        sql = parts[0].strip()
        exp_str = parts[1].strip()
        if exp_str.isdigit():
            expected = int(exp_str)
        elif exp_str.replace(".", "", 1).isdigit():
            expected = float(exp_str)
        elif exp_str.lower() in ("true", "false"):
            expected = exp_str.lower() == "true"
        else:
            expected = exp_str.strip("'\"").strip()
        return sql, expected
    # No "expect" -> for single scalar (e.g. COUNT(*) ) assume expect 1
    return rest, 1


if __name__ == "__main__":
    import sys
    if len(sys.argv) < 2:
        print("Usage: python db_verifier.py 'SELECT 1' [expected_value]")
        sys.exit(1)
    sql = sys.argv[1]
    expected = int(sys.argv[2]) if len(sys.argv) > 2 and sys.argv[2].isdigit() else 1
    v = DBVerifier()
    r = v.verify(sql, expected)
    print("Success:", r["success"])
    print("Actual:", r["actual"])
    print("Expected:", r["expected"])
    if r.get("error"):
        print("Error:", r["error"])
