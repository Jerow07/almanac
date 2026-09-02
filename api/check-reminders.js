import webpush from 'web-push';
import { createClient } from '@supabase/supabase-js';

const VAPID_PUBLIC_KEY =
  process.env.VAPID_PUBLIC_KEY ||
  'BAUfOu3xA1LAVmZFr87Rei6JQYmVWYqGttyYD4O41InKrVO146DOyMCtXN0sO_ClT2_OcNw4iclQYiKTymwc0To';
const VAPID_PRIVATE_KEY =
  process.env.VAPID_PRIVATE_KEY || 'g4ckS4cKQ_FLTcJyeGHauwbI7HQaJ-NyJHfW4OYOx74';
const VAPID_SUBJECT = 'mailto:almanac.app@gmail.com';

webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

const DEFAULT_SUPABASE_URL = 'https://exxzytflpmmbwoshugrh.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4eHp5dGZscG1tYndvc2h1Z3JoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3MTgzMjMsImV4cCI6MjA5NDI5NDMyM30.qzrt58EbPLMUZnovpjF8igwrobRtB13YnIQNUbUO_2U';

// Fallback in-memory cache to prevent duplicate alerts if table not yet created
const inMemorySentKeys = new Set();

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const url =
      req.query?.supabaseUrl ||
      req.body?.supabaseUrl ||
      process.env.SUPABASE_URL ||
      process.env.VITE_SUPABASE_URL ||
      DEFAULT_SUPABASE_URL;

    const anonKey =
      req.query?.supabaseAnonKey ||
      req.body?.supabaseAnonKey ||
      process.env.SUPABASE_ANON_KEY ||
      process.env.VITE_SUPABASE_ANON_KEY ||
      DEFAULT_SUPABASE_ANON_KEY;

    const supabase = createClient(url, anonKey);

    // 1. Fetch uncompleted tasks that have reminders configured
    const { data: rawTasks, error: tasksError } = await supabase
      .from('almanac_tasks')
      .select('*')
      .eq('completed', false);

    if (tasksError) {
      return res.status(500).json({ error: tasksError.message });
    }

    const tasks = (rawTasks || []).filter(
      (t) => t.reminder && t.reminder !== 'none'
    );

    if (tasks.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No pending tasks with reminders found.',
        sent: 0,
      });
    }

    // 2. Fetch all registered push subscriptions
    const { data: subscriptions } = await supabase
      .from('almanac_push_subscriptions')
      .select('*');

    if (!subscriptions || subscriptions.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No push subscriptions found to deliver reminders.',
        sent: 0,
      });
    }

    // 3. Fetch already sent reminders
    let sentKeys = new Set(inMemorySentKeys);
    try {
      const { data: sentDb } = await supabase
        .from('almanac_reminders_sent')
        .select('id');
      if (sentDb) {
        sentDb.forEach((row) => sentKeys.add(row.id));
      }
    } catch {
      // Table might not exist yet
    }

    // Current date and time in Argentina (UTC-3)
    const now = new Date();
    // Argentina offset is -3 hours (-180 minutes)
    const argentinaOffsetMs = -3 * 60 * 60 * 1000;
    const nowArgentina = new Date(now.getTime() + argentinaOffsetMs + now.getTimezoneOffset() * 60 * 1000);
    const todayStr = nowArgentina.toISOString().split('T')[0];
    const currentDayOfWeek = nowArgentina.getDay(); // 0 Sun ... 6 Sat

    const remindersToSend = [];

    tasks.forEach((task) => {
      // Recurrence check
      let occursToday = false;
      if (task.date === todayStr) {
        occursToday = true;
      } else if (task.recurrence && task.recurrence !== 'none' && todayStr >= task.date) {
        if (task.recurrence === 'daily') {
          occursToday = true;
        } else if (task.recurrence === 'weekly') {
          if (task.recurrence_days && Array.isArray(task.recurrence_days) && task.recurrence_days.length > 0) {
            occursToday = task.recurrence_days.includes(currentDayOfWeek);
          } else {
            const taskStart = new Date(task.date + 'T12:00:00Z');
            occursToday = taskStart.getDay() === currentDayOfWeek;
          }
        } else if (task.recurrence === 'monthly') {
          occursToday = todayStr.slice(-2) === task.date.slice(-2);
        }
      }

      if (!occursToday) return;

      const reminderKey = `${task.id}_${todayStr}_${task.reminder}`;
      if (sentKeys.has(reminderKey)) return;

      // Calculate reminder datetime in Argentina time
      const taskTime = task.time || '09:00';
      const [hours, minutes] = taskTime.split(':').map(Number);
      const taskDateTime = new Date(nowArgentina.getFullYear(), nowArgentina.getMonth(), nowArgentina.getDate(), hours, minutes, 0);

      let reminderOffsetMs = 0;
      let label = 'A la hora programada';
      switch (task.reminder) {
        case '15_min':
          reminderOffsetMs = 15 * 60 * 1000;
          label = 'Comienza en 15 minutos';
          break;
        case '30_min':
          reminderOffsetMs = 30 * 60 * 1000;
          label = 'Comienza en 30 minutos';
          break;
        case '1_hour':
          reminderOffsetMs = 60 * 60 * 1000;
          label = 'Comienza en 1 hora';
          break;
        case '1_day':
          reminderOffsetMs = 24 * 60 * 60 * 1000;
          label = 'Es mañana';
          break;
        case 'at_time':
        default:
          reminderOffsetMs = 0;
          label = '¡Es ahora!';
          break;
      }

      const reminderDateTime = new Date(taskDateTime.getTime() - reminderOffsetMs);
      const diffMs = nowArgentina.getTime() - reminderDateTime.getTime();

      // Trigger if we are at or past reminder time, but within a 2-hour window and before task finishes
      if (diffMs >= 0 && diffMs <= 2 * 60 * 60 * 1000) {
        remindersToSend.push({
          task,
          reminderKey,
          label,
          taskTime,
        });
      }
    });

    if (remindersToSend.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No tasks due for reminder at this moment.',
        checkedCount: tasks.length,
        sent: 0,
      });
    }

    let totalPushesSent = 0;

    for (const item of remindersToSend) {
      const { task, reminderKey, label, taskTime } = item;

      // Filter target subscribers
      const targetSubs = subscriptions.filter((sub) => {
        if (task.assignee === 'both') return true;
        return sub.user_id === task.assignee || sub.user_id === 'both';
      });

      const pushPayload = JSON.stringify({
        title: `⏰ ${label}: ${task.title}`,
        body: task.time ? `Programado a las ${taskTime} hs.` : `Plan para hoy: ${task.title}`,
        tag: `reminder-${task.id}`,
        data: { taskId: task.id },
      });

      for (const sub of targetSubs) {
        const pushSub = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
        };

        try {
          await webpush.sendNotification(pushSub, pushPayload);
          totalPushesSent++;
        } catch (err) {
          if (err.statusCode === 410 || err.statusCode === 404) {
            await supabase.from('almanac_push_subscriptions').delete().eq('endpoint', sub.endpoint);
          }
        }
      }

      // Mark as notified
      inMemorySentKeys.add(reminderKey);
      try {
        await supabase.from('almanac_reminders_sent').upsert(
          {
            id: reminderKey,
            task_id: task.id,
            reminded_at: new Date().toISOString(),
          },
          { onConflict: 'id' }
        );
      } catch {
        // Table might not exist yet
      }
    }

    return res.status(200).json({
      success: true,
      remindersProcessed: remindersToSend.length,
      totalPushesSent,
      sentReminders: remindersToSend.map((r) => r.reminderKey),
    });
  } catch (err) {
    console.error('Check reminders error:', err);
    return res.status(500).json({ error: err.message || 'Internal error checking reminders' });
  }
}
