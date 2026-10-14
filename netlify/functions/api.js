import { getDb, isInitialized } from './firebaseAdmin.js';

export const handler = async (event, context) => {
  const path = event.path.replace('/.netlify/functions/api', '').replace('/api', '') || '/';
  const method = event.httpMethod;

  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
  };

  if (method === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const db = getDb();

    // 1. Health check endpoint
    if (path === '/health' || path === '/') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          status: 'healthy',
          platform: 'Netlify Serverless',
          database: 'Firebase Cloud Firestore',
          firebase_admin_connected: isInitialized(),
          timestamp: new Date().toISOString()
        })
      };
    }

    // 2. Demo login endpoint
    if (path === '/auth/demo' && method === 'POST') {
      let body = {};
      try {
        body = JSON.parse(event.body || '{}');
      } catch {}

      const role = (body.role || 'eren').toLowerCase();
      const isEren = role === 'eren' || role === 'leo';
      const name = isEren ? 'Eren' : 'Mikasa';
      const email = isEren ? 'eren@pulsepath.love' : 'mikasa@pulsepath.love';

      // If Firestore is connected, check or create demo user document
      if (db) {
        const userRef = db.collection('users').doc(isEren ? 'user_eren_101' : 'user_mikasa_202');
        await userRef.set({
          id: userRef.id,
          name,
          email,
          nickname: `${name} ❤️`,
          avatar: isEren
            ? 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80'
            : 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
          couple_id: 'demo_couple_123',
          updated_at: new Date().toISOString()
        }, { merge: true });
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          access_token: `demo_token_${role}_${Date.now()}`,
          token_type: 'bearer',
          user: {
            id: isEren ? 'user_eren_101' : 'user_mikasa_202',
            name,
            email,
            nickname: `${name} ❤️`,
            couple_id: 'demo_couple_123'
          }
        })
      };
    }

    // 3. Current User endpoint
    if (path === '/auth/me' && method === 'GET') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          id: 'user_eren_101',
          name: 'Eren',
          email: 'eren@pulsepath.love',
          nickname: 'Eren ❤️',
          couple_id: 'demo_couple_123'
        })
      };
    }

    // Default 404 response
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Endpoint not found on Netlify serverless function', path })
    };
  } catch (error) {
    console.error('Netlify Function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message || 'Internal server error' })
    };
  }
};
