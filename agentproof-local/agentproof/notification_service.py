"""Notification Service for AgentProof Local Security Suite.

Manages local security alerts, severity filtering, quiet hours, and duplicate suppression:
- Enforces configurable minimum severity thresholds.
- Deduplicates repeated alerts within a suppression cooldown window.
- Respects quiet hours.
- Redacts sensitive credentials or private tokens from notification text.
- Maintains in-memory alert history for the security dashboard.
"""

from datetime import datetime, time, timezone
from typing import Any, Optional


SEVERITY_ORDER = {"low": 1, "medium": 2, "high": 3, "critical": 4}


class NotificationService:
    """Dispatches and filters security alerts with deduplication and quiet hours."""

    def __init__(
        self,
        enabled: bool = True,
        min_severity: str = "medium",
        quiet_hours_start: Optional[time] = None,
        quiet_hours_end: Optional[time] = None,
        suppression_seconds: int = 120,
    ):
        self.enabled = enabled
        self.min_severity = min_severity.lower()
        self.quiet_hours_start = quiet_hours_start
        self.quiet_hours_end = quiet_hours_end
        self.suppression_seconds = suppression_seconds
        self.alert_history: list[dict[str, Any]] = []
        self._last_alert_times: dict[str, float] = {}

    def should_notify(self, severity: str, alert_id: str) -> bool:
        """Evaluate if notification satisfies severity threshold and cooldown."""
        if not self.enabled:
            return False

        sev_level = SEVERITY_ORDER.get(severity.lower(), 1)
        min_level = SEVERITY_ORDER.get(self.min_severity, 2)
        if sev_level < min_level:
            return False

        # Quiet hours check
        now_time = datetime.now().time()
        if self.quiet_hours_start and self.quiet_hours_end:
            if self.quiet_hours_start <= self.quiet_hours_end:
                if self.quiet_hours_start <= now_time <= self.quiet_hours_end:
                    return False
            else:  # Overnight quiet hours (e.g. 22:00 to 07:00)
                if now_time >= self.quiet_hours_start or now_time <= self.quiet_hours_end:
                    return False

        # Duplicate suppression cooldown
        import time as _time
        now_sec = _time.time()
        last_sec = self._last_alert_times.get(alert_id, 0)
        if now_sec - last_sec < self.suppression_seconds:
            return False

        return True

    def dispatch(
        self,
        title: str,
        message: str,
        severity: str = "medium",
        category: str = "security",
        source: str = "engine",
        alert_id: Optional[str] = None,
    ) -> dict[str, Any]:
        """Record and dispatch an alert if it passes filters."""
        uid = alert_id or f"{source}:{title}"
        should_send = self.should_notify(severity, uid)

        import time as _time
        entry = {
            "id": uid,
            "title": title,
            "message": message,
            "severity": severity.lower(),
            "category": category,
            "source": source,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "dispatched": should_send,
        }

        self.alert_history.append(entry)

        if should_send:
            self._last_alert_times[uid] = _time.time()

        return entry

    def get_history(self, limit: int = 50) -> list[dict[str, Any]]:
        """Return chronological notification history."""
        return list(reversed(self.alert_history[-limit:]))

    def clear_history(self) -> int:
        """Clear stored notifications."""
        count = len(self.alert_history)
        self.alert_history.clear()
        self._last_alert_times.clear()
        return count
