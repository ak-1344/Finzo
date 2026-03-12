import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Reminder } from '../types';
import { asyncStorageAdapter } from '../lib/storage';
import { generateId } from '../lib/utils';

interface ReminderStore {
  reminders: Reminder[];

  addReminder: (data: Omit<Reminder, 'id' | 'isDeleted' | 'createdAt'>) => Reminder;
  updateReminder: (id: string, update: Partial<Reminder>) => void;
  deleteReminder: (id: string) => void; // soft-delete
  toggleReminder: (id: string) => void;
  getActiveReminders: () => Reminder[];
  getReminderById: (id: string) => Reminder | undefined;
}

export const useReminderStore = create<ReminderStore>()(
  persist(
    (set, get) => ({
      reminders: [],

      addReminder: (data) => {
        const reminder: Reminder = {
          ...data,
          id: generateId(),
          isDeleted: false,
          createdAt: Date.now(),
        };
        set((state) => ({
          reminders: [reminder, ...state.reminders],
        }));
        return reminder;
      },

      updateReminder: (id, update) =>
        set((state) => ({
          reminders: state.reminders.map((r) =>
            r.id === id ? { ...r, ...update } : r
          ),
        })),

      deleteReminder: (id) =>
        set((state) => ({
          reminders: state.reminders.map((r) =>
            r.id === id ? { ...r, isDeleted: true } : r
          ),
        })),

      toggleReminder: (id) =>
        set((state) => ({
          reminders: state.reminders.map((r) =>
            r.id === id ? { ...r, isActive: !r.isActive } : r
          ),
        })),

      getActiveReminders: () =>
        get().reminders.filter((r) => !r.isDeleted),

      getReminderById: (id) =>
        get().reminders.find((r) => r.id === id),
    }),
    {
      name: 'finzo-reminders',
      storage: createJSONStorage(() => asyncStorageAdapter),
    }
  )
);
