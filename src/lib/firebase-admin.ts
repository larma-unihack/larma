import { applicationDefault, cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

if (!getApps().length) {
  try {
    const serviceAccountStr = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (!serviceAccountStr) {
      console.warn(
        "FIREBASE_SERVICE_ACCOUNT_KEY is not set. Admin SDK may fail to authenticate."
      );
    }

    initializeApp({
      credential: serviceAccountStr
        ? cert(JSON.parse(serviceAccountStr))
        : applicationDefault(),
    });
  } catch (error) {
    console.error("Firebase Admin initialization error", error);
  }
}

export const adminDb = getFirestore();
