import { createClient } from '@supabase/supabase-js';

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
    const { user, subscription, supabaseUrl, supabaseAnonKey } = req.body || {};

    if (!user || !subscription || !subscription.endpoint || !subscription.keys) {
      return res.status(400).json({ error: 'Missing required subscription fields' });
    }

    const url = supabaseUrl || process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const anonKey = supabaseAnonKey || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

    if (!url || !anonKey) {
      return res.status(400).json({ error: 'Supabase credentials not provided' });
    }

    const supabase = createClient(url, anonKey);

    // Deterministic ID based on user and endpoint tail
    const subId = `${user}_${Buffer.from(subscription.endpoint).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(-32)}`;

    const { error } = await supabase.from('almanac_push_subscriptions').upsert(
      {
        id: subId,
        user_id: user,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'endpoint' }
    );

    if (error) {
      console.warn('Subscription upsert error:', error.message);
      return res.status(200).json({
        success: false,
        warning: 'Table almanac_push_subscriptions may need to be created in Supabase SQL editor.',
        error: error.message,
      });
    }

    return res.status(200).json({ success: true, id: subId });
  } catch (err) {
    console.error('Subscribe endpoint error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
