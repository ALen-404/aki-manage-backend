// firestore.config.ts
import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import serviceAccount from './common/firebase/aki-dev';

@Injectable()
export class FirestoreConfig {
  private readonly firestore: admin.firestore.Firestore;

  constructor() {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as any),
    });

    this.firestore = admin.firestore();
  }

  getFirestore(): admin.firestore.Firestore {
    return this.firestore;
  }
}
