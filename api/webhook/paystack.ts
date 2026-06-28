import * as crypto from "crypto";
import * as admin from "firebase-admin";

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
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) {
    console.error("PAYSTACK_SECRET_KEY is not set");
    return res.status(500).json({ error: "Server configuration error" });
  }

  // Verify signature
  // Note: JSON.stringify(req.body) might be fragile if the body was already parsed and keys reordered.
  // In a production Vercel environment, it's recommended to use the raw body.
  const hash = req.headers["x-paystack-signature"];
  const payload = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
  const expectedHash = crypto
    .createHmac("sha512", secret)
    .update(payload)
    .digest("hex");

  if (hash !== expectedHash) {
    console.error("Invalid Paystack signature. Received:", hash, "Expected:", expectedHash);
    // In some environments, we might need to use the raw body.
    // If this fails, we should check if req.body is already what we need.
    return res.status(401).json({ error: "Invalid signature" });
  }

  const event = req.body;

  if (event.event === "charge.success") {
    const data = event.data;
    const amount = data.amount / 100; // kobo to Naira
    const reference = data.reference;
    const email = data.customer.email;
    const metadata = data.metadata;
    const userIdFromMetadata = metadata?.user_id;

    console.log(`Processing Paystack payment: ${reference}, amount: ${amount}, email: ${email}, userId: ${userIdFromMetadata}`);

    try {
      let userId = userIdFromMetadata;

      // If no userId in metadata, try finding by email as fallback
      if (!userId) {
        const usersSnapshot = await db
          .collection("users")
          .where("email", "==", email)
          .limit(1)
          .get();

        if (!usersSnapshot.empty) {
          userId = usersSnapshot.docs[0].id;
        }
      }

      if (userId) {
        const userRef = db.collection("users").doc(userId);
        const paymentRef = db.collection("payments").doc(reference);

        await db.runTransaction(async (transaction) => {
          const paymentDoc = await transaction.get(paymentRef);

          if (paymentDoc.exists) {
            console.warn(`Payment ${reference} already processed`);
            return;
          }

          transaction.update(userRef, {
            balance: admin.firestore.FieldValue.increment(Number(amount)),
            lastDeposit: admin.firestore.FieldValue.serverTimestamp()
          });

          transaction.set(paymentRef, {
            userId,
            email,
            amount,
            reference,
            status: "success",
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            gateway: "paystack",
            metadata: metadata || {}
          });
        });

        console.log(`Successfully credited user ${userId} with ${amount}`);
      } else {
        console.error(`User not found for payment ${reference} (email: ${email})`);
      }
    } catch (error) {
      console.error("Error processing Paystack webhook:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  return res.status(200).json({ status: "success" });
}
