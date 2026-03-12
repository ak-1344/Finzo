import { useMemo, useEffect, useCallback, useRef } from 'react';
import { AppState, AppStateStatus, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useReminderStore } from '../store/reminderStore';
import { Reminder } from '../types';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Request notification permissions.
 */
async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === 'granted';
}

/**
 * Schedule a local notification for a reminder.
 */
async function scheduleReminderNotification(
  reminder: Reminder
): Promise<string | null> {
  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) return null;

  // Cancel existing notification for this reminder if any
  if (reminder.notificationId) {
    try {
      await Notifications.cancelScheduledNotificationAsync(reminder.notificationId);
    } catch {
      // ignore
    }
  }

  const triggerDate = new Date(reminder.triggerAt);
  const now = new Date();

  // Don't schedule if trigger date is in the past (for one-time)
  if (reminder.recurring === 'none' && triggerDate <= now) {
    return null;
  }

  let trigger: Notifications.NotificationTriggerInput;

  if (reminder.recurring === 'weekly') {
    // Weekly: use weekday + hour + minute
    trigger = {
      type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
      weekday: triggerDate.getDay() + 1, // 1-7, Sunday=1
      hour: triggerDate.getHours(),
      minute: triggerDate.getMinutes(),
    };
  } else if (reminder.recurring === 'monthly') {
    // Monthly: use day + hour + minute (expo doesn't support monthly natively,
    // so we schedule next occurrence and reschedule on trigger)
    trigger = {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: getNextMonthlyDate(triggerDate),
    };
  } else {
    // One-time
    trigger = {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: triggerDate,
    };
  }

  try {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: '🔔 FINZO Reminder',
        body: reminder.message,
        data: { reminderId: reminder.id },
        sound: true,
      },
      trigger,
    });
    return notificationId;
  } catch {
    return null;
  }
}

/**
 * Get the next monthly occurrence of a date.
 */
function getNextMonthlyDate(baseDate: Date): Date {
  const now = new Date();
  const next = new Date(baseDate);

  // Set to current or next month
  next.setFullYear(now.getFullYear());
  next.setMonth(now.getMonth());

  // If the day has already passed this month, go to next month
  if (next <= now) {
    next.setMonth(next.getMonth() + 1);
  }

  return next;
}

/**
 * Cancel a scheduled notification.
 */
async function cancelReminderNotification(notificationId: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch {
    // ignore
  }
}

/**
 * Hook for managing reminders with notification scheduling.
 */
export function useReminders() {
  const {
    reminders,
    addReminder: storeAdd,
    updateReminder: storeUpdate,
    deleteReminder: storeDelete,
    toggleReminder: storeToggle,
    getActiveReminders,
    getReminderById,
  } = useReminderStore();

  /** All non-deleted reminders, sorted by trigger date */
  const activeReminders = useMemo(
    () =>
      reminders
        .filter((r) => !r.isDeleted)
        .sort((a, b) => a.triggerAt - b.triggerAt),
    [reminders]
  );

  /** Upcoming reminders (triggerAt >= now, active only) */
  const upcomingReminders = useMemo(
    () =>
      activeReminders.filter(
        (r) => r.isActive && (r.triggerAt > Date.now() || r.recurring !== 'none')
      ),
    [activeReminders]
  );

  /** Past reminders (one-time, already triggered) */
  const pastReminders = useMemo(
    () =>
      activeReminders.filter(
        (r) => r.recurring === 'none' && r.triggerAt <= Date.now()
      ),
    [activeReminders]
  );

  /**
   * Add a reminder and schedule its notification.
   */
  const addReminder = useCallback(
    async (data: Omit<Reminder, 'id' | 'isDeleted' | 'createdAt' | 'notificationId'>) => {
      const reminder = storeAdd({ ...data, notificationId: undefined });

      if (reminder.isActive) {
        const notificationId = await scheduleReminderNotification(reminder);
        if (notificationId) {
          storeUpdate(reminder.id, { notificationId });
        }
      }

      return reminder;
    },
    [storeAdd, storeUpdate]
  );

  /**
   * Update a reminder and reschedule notification.
   */
  const updateReminder = useCallback(
    async (id: string, update: Partial<Reminder>) => {
      const existing = getReminderById(id);
      if (!existing) return;

      // Cancel old notification
      if (existing.notificationId) {
        await cancelReminderNotification(existing.notificationId);
      }

      storeUpdate(id, { ...update, notificationId: undefined });

      // Reschedule if active
      const updated = { ...existing, ...update };
      if (updated.isActive) {
        const notificationId = await scheduleReminderNotification(updated as Reminder);
        if (notificationId) {
          storeUpdate(id, { notificationId });
        }
      }
    },
    [storeUpdate, getReminderById]
  );

  /**
   * Delete a reminder and cancel its notification.
   */
  const deleteReminder = useCallback(
    async (id: string) => {
      const existing = getReminderById(id);
      if (existing?.notificationId) {
        await cancelReminderNotification(existing.notificationId);
      }
      storeDelete(id);
    },
    [storeDelete, getReminderById]
  );

  /**
   * Toggle a reminder's active state and schedule/cancel notification.
   */
  const toggleReminder = useCallback(
    async (id: string) => {
      const existing = getReminderById(id);
      if (!existing) return;

      storeToggle(id);

      if (existing.isActive && existing.notificationId) {
        // Was active, now inactive — cancel notification
        await cancelReminderNotification(existing.notificationId);
        storeUpdate(id, { notificationId: undefined });
      } else if (!existing.isActive) {
        // Was inactive, now active — schedule notification
        const toggled = { ...existing, isActive: true };
        const notificationId = await scheduleReminderNotification(toggled);
        if (notificationId) {
          storeUpdate(id, { notificationId });
        }
      }
    },
    [storeToggle, storeUpdate, getReminderById]
  );

  return {
    activeReminders,
    upcomingReminders,
    pastReminders,
    addReminder,
    updateReminder,
    deleteReminder,
    toggleReminder,
    getReminderById,
  };
}
