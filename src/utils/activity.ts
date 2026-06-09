export interface ActivityEvent {
  id: string; type: string; title: string; description: string; person: string; time: string; timestamp: string;
}

function getUserName(): string {
  try {
    const info = localStorage.getItem("user_info");
    if (info) {
      const parsed = JSON.parse(info);
      return parsed.name || parsed.email || "System";
    }
  } catch { /* ignore */ }
  return "System";
}

export function addActivityEntry(title: string, description: string, type: string = "task") {
  try {
    const raw = localStorage.getItem("pipeline_activity");
    const events: ActivityEvent[] = raw ? JSON.parse(raw) : [];
    const now = new Date();
    const timeLabel = `${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}`;
    const newEvent: ActivityEvent = {
      id: String(Date.now()),
      type,
      title,
      description,
      person: getUserName(),
      time: timeLabel,
      timestamp: now.toISOString(),
    };
    localStorage.setItem("pipeline_activity", JSON.stringify([newEvent, ...events]));
  } catch { /* ignore */ }
}
