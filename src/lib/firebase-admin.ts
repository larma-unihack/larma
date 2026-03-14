import * as admin from 'firebase-admin';

if (!admin.apps.length) {
    try {
        const serviceAccountStr = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
        if (!serviceAccountStr) {
            console.warn("FIREBASE_SERVICE_ACCOUNT_KEY is not set. Admin SDK may fail to authenticate.");
        }

        admin.initializeApp({
            credential: serviceAccountStr ? admin.credential.cert(JSON.parse(serviceAccountStr)) : admin.credential.applicationDefault()
        });
    } catch (error) {
        console.error("Firebase Admin initialization error", error);
    }
}

export const adminDb = admin.firestore();
