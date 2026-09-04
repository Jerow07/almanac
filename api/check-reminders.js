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

function parseTask(row) {
  let startTime = undefined;
  let endTime = undefined;
  if (row.time && typeof row.time === 'string') {
    if (row.time.includes(' - ')) {
      const parts = row.time.split(' - ');
      startTime = parts[0]?.trim();
      endTime = parts[1]?.trim();
    } else {
      startTime = row.time.trim();
    }
  }

  let recurrence = 'none';
  let recurrenceDays = undefined;
  if (row.recurrence && typeof row.recurrence === 'string') {
    if (row.recurrence.startsWith('weekly:')) {
      recurrence = 'weekly';
      recurrenceDays = row.recurrence
        .replace('weekly:', '')
        .split(',')
        .map((d) => parseInt(d, 10))
        .filter((n) => !isNaN(n));
    } else if (['daily', 'weekly', 'monthly', 'yearly'].includes(row.recurrence)) {
      recurrence = row.recurrence;
    }
  }

  return {
    id: row.id,
    title: row.title,
    date: row.date,
    time: startTime,
    endTime,
    allDay: Boolean(row.all_day),
    assignee: row.assignee,
    completed: Boolean(row.completed),
    recurrence,
    recurrenceDays,
    reminder: row.reminder || 'none',
  };
}

function isTaskOnDate(task, targetDateKey, targetDayOfWeek, targetDayOfMonth, targetMonth) {
  if (targetDateKey < task.date) return false;
  if (targetDateKey === task.date) return true;

  if (!task.recurrence || task.recurrence === 'none') return false;
  if (task.recurrence === 'daily') return true;

  if (task.recurrence === 'weekly') {
    if (task.recurrenceDays && task.recurrenceDays.length > 0) {
      return task.recurrenceDays.includes(targetDayOfWeek);
    }
    const taskStart = new Date(task.date + 'T12:00:00Z');
    return taskStart.getUTCDay() === targetDayOfWeek;
  }

  if (task.recurrence === 'monthly') {
    const taskStart = new Date(task.date + 'T12:00:00Z');
    return taskStart.getUTCDate() === targetDayOfMonth;
  }

  if (task.recurrence === 'yearly') {
    const taskStart = new Date(task.date + 'T12:00:00Z');
    return taskStart.getUTCMonth() === targetMonth && taskStart.getUTCDate() === targetDayOfMonth;
  }

  return false;
}

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

    const tasks = (rawTasks || [])
      .map(parseTask)
      .filter((t) => t.reminder && t.reminder !== 'none');

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
        message: 'No push subscriptions found in database.',
        tasksChecked: tasks.length,
        sent: 0,
      });
    }

    // 3. Fetch already sent reminders (only last 3 days so the query is always ultra-fast)
    const threeDaysAgoIso = new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString();
    let sentKeys = new Set(inMemorySentKeys);
    try {
      const { data: sentDb } = await supabase
        .from('almanac_reminders_sent')
        .select('id')
        .gte('reminded_at', threeDaysAgoIso);
      if (sentDb) {
        sentDb.forEach((row) => sentKeys.add(row.id));
      }

      // Auto-cleanup: purge records older than 14 days in background so table stays tiny forever
      const fourteenDaysAgoIso = new Date(Date.now() - 14 * 24 * 3600 * 1000).toISOString();
      supabase
        .from('almanac_reminders_sent')
        .delete()
        .lt('reminded_at', fourteenDaysAgoIso)
        .then(() => {})
        .catch(() => {});
    } catch {
      // Table might not exist yet
    }

    // Current date and time in Argentina (UTC-3)
    const now = new Date();
    // Argentina is UTC-3 all year
    const argentinaNow = new Date(now.getTime() - 3 * 3600 * 1000);
    const todayStr = argentinaNow.toISOString().split('T')[0];
    const currentDayOfWeek = argentinaNow.getUTCDay(); // 0 Sun ... 6 Sat
    const currentDayOfMonth = argentinaNow.getUTCDate();
    const currentMonth = argentinaNow.getUTCMonth();

    const remindersToSend = [];
    const debugTaskStatus = [];

    for (const task of tasks) {
      const occursToday = isTaskOnDate(
        task,
        todayStr,
        currentDayOfWeek,
        currentDayOfMonth,
        currentMonth
      );

      if (!occursToday) {
        debugTaskStatus.push({ id: task.id, title: task.title, occursToday: false });
        continue;
      }

      const reminderKey = `${task.id}_${todayStr}_${task.reminder}`;
      const alreadySent = sentKeys.has(reminderKey);

      // Parse start time (e.g. "18:00")
      const startTime = task.time || '09:00';
      const timeParts = startTime.split(':');
      const hours = parseInt(timeParts[0], 10);
      const minutes = parseInt(timeParts[1] || '0', 10);

      if (isNaN(hours) || isNaN(minutes)) {
        debugTaskStatus.push({ id: task.id, title: task.title, error: 'Invalid time format: ' + startTime });
        continue;
      }

      // Explicit Argentina timezone offset (-03:00) gives deterministic UTC timestamp
      const isoArgentina = `${todayStr}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00-03:00`;
      const taskTargetTimeMs = new Date(isoArgentina).getTime();

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

      const reminderTimeMs = taskTargetTimeMs - reminderOffsetMs;
      const diffMs = now.getTime() - reminderTimeMs;
      const diffMinutes = Math.round(diffMs / 60000);

      const isDue = diffMs >= 0 && diffMs <= 2 * 60 * 60 * 1000;

      debugTaskStatus.push({
        id: task.id,
        title: task.title,
        startTime,
        occursToday: true,
        reminder: task.reminder,
        diffMinutes,
        isDue,
        alreadySent,
      });

      if (isDue && !alreadySent) {
        remindersToSend.push({
          task,
          reminderKey,
          label,
          startTime,
        });
      }
    }

    if (remindersToSend.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No tasks due for reminder at this moment.',
        todayStr,
        checkedCount: tasks.length,
        subscriptionsCount: subscriptions.length,
        taskStatus: debugTaskStatus,
        sent: 0,
      });
    }

    let totalPushesSent = 0;

    for (const item of remindersToSend) {
      const { task, reminderKey, label, startTime } = item;

      // Filter target subscribers
      let targetSubs = subscriptions.filter((sub) => {
        if (task.assignee === 'both') return true;
        return sub.user_id === task.assignee || sub.user_id === 'both';
      });

      // Fallback: If no matching user, send to all subscriptions to guarantee delivery
      if (targetSubs.length === 0) {
        targetSubs = subscriptions;
      }

      const pushPayload = JSON.stringify({
        title: `⏰ ${label}: ${task.title}`,
        body: task.time
          ? `Programado a las ${startTime} hs.`
          : `Plan para hoy: ${task.title}`,
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

        const pushOptions = {
          TTL: 3600,
          urgency: 'high',
        };

        try {
          await webpush.sendNotification(pushSub, pushPayload, pushOptions);
          totalPushesSent++;
        } catch (err) {
          if (err.statusCode === 410 || err.statusCode === 404) {
            await supabase
              .from('almanac_push_subscriptions')
              .delete()
              .eq('endpoint', sub.endpoint);
          }
        }
      }

      // Mark as notified in memory and DB
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
      taskStatus: debugTaskStatus,
    });
  } catch (err) {
    console.error('Check reminders error:', err);
    return res.status(500).json({ error: err.message || 'Internal error checking reminders' });
  }
}
