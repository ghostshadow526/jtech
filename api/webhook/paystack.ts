import { Buffer } from 'buffer';
import * as crypto from 'crypto';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin
if (admin.apps.length === 0) {
  try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      const serviceAccountJson = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT, 'base64').toString('utf-8');
      const serviceAccount = JSON.parse(serviceAccountJson);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: "jtech-99b8b",
      });
    } else {
      admin.initializeApp({
        projectId: "jtech-99b8b",
      });
    }
  } catch (error) {
    console.error("Firebase initialization error:", error);
  }
}

const db = admin.firestore();

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const hash = req.headers['x-paystack-signature'];
  const secret = process.env.PAYSTACK_SECRET_KEY;

  if (!secret) {
    console.error("PAYSTACK_SECRET_KEY is not set");
    return res.status(500).json({ error: "Webhook verification failed" });
  }

  // Verify the signature
  const expectedHash = crypto.createHmac('sha512', secret)
    .update(JSON.stringify(req.body))
    .digest('hex');

  if (hash !== expectedHash) {
    console.error("Invalid Paystack signature");
    return res.status(401).json({ error: "Unauthorized" });
  }

  const event = req.body;
  console.log(`Received Paystack event: ${event.event}`);

  // Handle successful payment event
  if (event.event === 'charge.success') {
    const { amount, reference, customer, metadata, authorization } = event.data;
    const actualAmount = amount / 100; // Convert from kobo to Naira
    const email = customer.email;
    const userIdFromMetadata = metadata?.user_id || metadata?.userId;

    console.log(`Processing successful payment: Ref=${reference}, Amount=${actualAmount}, Email=${email}, UID=${userIdFromMetadata}`);

    try {
      let userId = userIdFromMetadata;

      // If UID not in metadata, try to find user by email
      if (!userId) {
        console.log(`UID not found in metadata, searching by email: ${email}`);
        const usersSnapshot = await db.collection('users')
          .where('email', '==', email)
          .limit(1)
          .get();

        if (!usersSnapshot.empty) {
          userId = usersSnapshot.docs[0].id;
          console.log(`Found user by email: ${userId}`);
        }
      }

      if (userId) {
        const userRef = db.collection('users').doc(userId);

        // Use a transaction to update balance and record payment
        await db.runTransaction(async (transaction) => {
          const userDoc = await transaction.get(userRef);

          // Check if this payment was already processed (idempotency)
          const paymentCheck = await db.collection('payments')
            .where('reference', '==', reference)
            .limit(1)
            .get();

          if (!paymentCheck.empty) {
            console.log(`Payment with reference ${reference} already processed. Skipping.`);
            return;
          }

          if (userDoc.exists) {
            // Update user balance - ensure amount is a number
            transaction.update(userRef, {
              balance: admin.firestore.FieldValue.increment(Number(actualAmount))
            });
            console.log(`Incrementing balance for user ${userId} by ${actualAmount}`);
          } else {
            // If user doc doesn't exist but we have a UID, create it?
            // Better to log error for now as they should exist
            console.error(`User document ${userId} does not exist even though we have a UID.`);
            throw new Error(`User document ${userId} not found`);
          }

          // Record payment transaction
          const paymentRef = db.collection('payments').doc();
          transaction.set(paymentRef, {
            userId: userId,
            email: email,
            amount: Number(actualAmount),
            currency: 'NGN',
            reference: reference,
            status: 'completed',
            description: 'Fund deposit via Paystack',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            processedAt: admin.firestore.FieldValue.serverTimestamp(),
            paystackData: {
              authorization: authorization,
              customer: customer,
              metadata: metadata
            }
          });
        });

        console.log(`Payment successfully processed and balance updated for user: ${userId}`);
      } else {
        console.warn(`User not found for payment: ${reference} (Email: ${email})`);
        // We still return 200 to Paystack to acknowledge receipt
      }
    } catch (recordError: any) {
      console.error('Error processing payment transaction:', recordError);
      // We return 500 so Paystack might retry if it was a transient error
      return res.status(500).json({ error: recordError.message });
    }
  }

  return res.status(200).json({ success: true });
}
