import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { getStorage } from 'firebase-admin/storage';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

export function initFirebaseAdmin() {
  const apps = admin.getApps();
  if (apps.length > 0) {
    return admin.getApp();
  }

  try {
    let serviceAccount = null;

    // 1. Check if passed via raw JSON string in environment variable (Recommended for Netlify Production)
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      try {
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      } catch (err) {
        if (fs.existsSync(process.env.FIREBASE_SERVICE_ACCOUNT)) {
          serviceAccount = JSON.parse(fs.readFileSync(path.resolve(process.env.FIREBASE_SERVICE_ACCOUNT), 'utf-8'));
        }
      }
    }

    // 2. Check for serviceAccountKey.json in project root
    const defaultKeyPath = path.resolve(process.cwd(), 'serviceAccountKey.json');
    if (!serviceAccount && fs.existsSync(defaultKeyPath)) {
      serviceAccount = JSON.parse(fs.readFileSync(defaultKeyPath, 'utf-8'));
    }

    // 3. Check for custom configured path (e.g. process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
    if (!serviceAccount && process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      const customKeyPath = path.resolve(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      if (fs.existsSync(customKeyPath)) {
        serviceAccount = JSON.parse(fs.readFileSync(customKeyPath, 'utf-8'));
      }
    }

    if (serviceAccount) {
      admin.initializeApp({
        credential: admin.cert(serviceAccount),
        storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || (serviceAccount.project_id ? `${serviceAccount.project_id}.appspot.com` : undefined)
      });
      console.log('Firebase Admin SDK initialized successfully with service account.');
    } else {
      console.warn('Firebase Admin SDK: No serviceAccountKey.json or FIREBASE_SERVICE_ACCOUNT env variable found. Operating in fallback mode.');
    }
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);
  }

  return admin;
}

// Initial attempt
initFirebaseAdmin();

export function getDb() {
  initFirebaseAdmin();
  return admin.getApps().length > 0 ? getFirestore() : null;
}

export function getAuthAdmin() {
  initFirebaseAdmin();
  return admin.getApps().length > 0 ? getAuth() : null;
}

export function getStorageAdmin() {
  initFirebaseAdmin();
  return admin.getApps().length > 0 ? getStorage() : null;
}

export function isInitialized() {
  return admin.getApps().length > 0;
}

export { admin };
