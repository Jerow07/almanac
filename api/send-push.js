import webpush from 'web-push';
import { createClient } from '@supabase/supabase-js';

const VAPID_PUBLIC_KEY =
  process.env.VAPID_PUBLIC_KEY ||
  'BAUfOu3xA1LAVmZFr87Rei6JQYmVWYqGttyYD4O41InKrVO146DOyMCtXN0sO_ClT2_OcNw4iclQYiKTymwc0To';
const VAPID_PRIVATE_KEY =
  process.env.VAPID_PRIVATE_KEY || 'g4ckS4cKQ_FLTcJyeGHauwbI7HQaJ-NyJHfW4OYOx74';
const VAPID_SUBJECT = 'mailto:almanac.app@gmail.com';

webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      targetUser,
      title,
      body,
      tag,
      data,
      directSubscription,
      supabaseUrl,
      supabaseAnonKey,
    } = req.body || {};

    const payload = JSON.stringify({
      title: title || 'Almanac 💖',
      body: body || 'Nuevo movimiento en tu calendario.',
      tag: tag || 'almanac-update',
      data: data || {},
    });

    // 1. Direct Push (Immediate Test Push without DB query)
    if (directSubscription && directSubscription.endpoint) {
      try {
        await webpush.sendNotification(directSubscription, payload);
        return res.status(200).json({ success: true, direct: true });
      } catch (err) {
        console.warn('Direct push failed:', err.statusCode, err.message);
        return res.status(200).json({
          success: false,
          error: err.message,
          statusCode: err.statusCode,
        });
      }
    }

    // 2. Query Subscriptions from Supabase
    const url = supabaseUrl || process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const anonKey = supabaseAnonKey || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

    if (!url || !anonKey) {
      return res.status(400).json({ error: 'Supabase credentials not provided' });
    }

    const supabase = createClient(url, anonKey);

    let query = supabase.from('almanac_push_subscriptions').select('*');
    if (targetUser && targetUser !== 'both') {
      query = query.eq('user_id', targetUser);
    }

    const { data: subscriptions, error } = await query;

    if (error) {
      console.warn('Query subscriptions error:', error.message);
      return res.status(200).json({
        success: false,
        sent: 0,
        warning: 'Table almanac_push_subscriptions query failed: ' + error.message,
      });
    }

    if (!subscriptions || subscriptions.length === 0) {
      return res.status(200).json({
        success: true,
        sent: 0,
        total: 0,
        message: `No active push subscriptions registered for ${targetUser}`,
      });
    }

    let sentCount = 0;
    const errors = [];

    // Send push in parallel to all target devices
    await Promise.allSettled(
      subscriptions.map(async (sub) => {
        const pushSub = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
        };

        try {
          await webpush.sendNotification(pushSub, payload);
          sentCount++;
        } catch (err) {
          // 404 or 410 means subscription expired or uninstalled -> clean up
          if (err.statusCode === 410 || err.statusCode === 404) {
            console.log(`Cleaning up expired subscription: ${sub.id}`);
            await supabase.from('almanac_push_subscriptions').delete().eq('endpoint', sub.endpoint);
          } else {
            errors.push({ id: sub.id, error: err.message, status: err.statusCode });
          }
        }
      })
    );

    return res.status(200).json({
      success: true,
      sent: sentCount,
      total: subscriptions.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (err) {
    console.error('Send push error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
