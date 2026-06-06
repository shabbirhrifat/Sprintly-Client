import { Badge } from "@/components/ui/Badge";
import { Panel } from "@/components/ui/Panel";
import { formatDate } from "@/lib/format";
import { Activity, Notification } from "../types";

type ActivityPanelProps = {
  activities: Activity[];
  notifications: Notification[];
  onReadNotification: (id: string) => void;
};

export function ActivityPanel({ activities, notifications, onReadNotification }: ActivityPanelProps) {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <Panel>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">Recent Activities</h3>
          <Badge>{activities.length}</Badge>
        </div>
        <div className="mt-5 grid gap-3">
          {activities.length === 0 && <p className="text-sm text-[var(--muted)]">No activity yet.</p>}
          {activities.slice(0, 10).map((activity) => (
            <div key={activity._id} className="rounded-[14px] border border-[var(--border)] px-4 py-3">
              <p className="text-sm font-semibold">{activity.message}</p>
              <p className="mt-1 text-xs text-[var(--muted)]">{formatDate(activity.createdAt)}</p>
            </div>
          ))}
        </div>
      </Panel>
      <Panel>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">Notifications</h3>
          <Badge>{notifications.filter((item) => !item.readAt).length} unread</Badge>
        </div>
        <div className="mt-5 grid gap-3">
          {notifications.length === 0 && <p className="text-sm text-[var(--muted)]">No notifications yet.</p>}
          {notifications.slice(0, 8).map((notification) => (
            <button
              key={notification._id}
              type="button"
              onClick={() => onReadNotification(notification._id)}
              className="rounded-[14px] border border-[var(--border)] px-4 py-3 text-left transition hover:bg-[var(--surface-muted)]"
            >
              <p className="text-sm font-semibold">{notification.message}</p>
              <p className="mt-1 text-xs text-[var(--muted)]">
                {notification.readAt ? "Read" : "Unread"} · {formatDate(notification.createdAt)}
              </p>
            </button>
          ))}
        </div>
      </Panel>
    </div>
  );
}
