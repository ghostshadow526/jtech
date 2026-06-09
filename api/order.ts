import axios from "axios";
import https from "https";
import admin from "firebase-admin";

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

const SMM_API_URL = process.env.SMM_API_URL || "https://followersandviews.com/api/v2";
const SMM_API_KEY = process.env.SMM_API_KEY;

// Initialize Firebase Admin
let db: admin.firestore.Firestore;

function initializeFirebase() {
  if (admin.apps.length === 0) {
    try {
      // Try using FIREBASE_SERVICE_ACCOUNT environment variable (base64 encoded JSON)
      if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        const serviceAccountJson = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT, 'base64').toString('utf-8');
        const serviceAccount = JSON.parse(serviceAccountJson);
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          projectId: "jtech-99b8b",
        });
      } else {
        // For Cloud Run or environments with default credentials
        admin.initializeApp({
          projectId: "jtech-99b8b",
        });
      }
    } catch (error) {
      console.error("Firebase initialization error:", error);
      throw error;
    }
  }
  return admin.firestore();
}

export default async function handler(req: any, res: any) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader("Access-Control-Allow-Headers", "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version");
  
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!SMM_API_KEY) {
    return res.status(500).json({ error: "SMM API key is not configured" });
  }

  try {
    // Initialize Firebase
    const database = initializeFirebase();
    
    const { uid, service_id, quantity, link } = req.body;

    // 1. Validate input
    if (!uid || !service_id || !quantity || !link) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // 2. Get user balance from Firestore
    const userRef = database.collection("users").doc(uid);
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: "User not found" });
    }
    const userBalance = userDoc.data()?.balance || 0;

    // 3. Get service rate from SMM API
    const params = new URLSearchParams();
    params.append('key', SMM_API_KEY);
    params.append('action', 'services');

    const servicesRes = await axios.post(SMM_API_URL, params.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      timeout: 60000,
      httpsAgent
    });
    const service = servicesRes.data.find((s: any) => s.service === service_id);
    if (!service) {
      return res.status(404).json({ error: "Service not found" });
    }

    // Apply 20% price markup to the service rate
    const originalRate = parseFloat(service.rate);
    const markupMultiplier = 1.2;
    const rate = originalRate * markupMultiplier;
    const cost = (rate / 1000) * quantity;

    // 4. Check user balance
    if (userBalance < cost) {
      return res.status(400).json({ error: "Insufficient user balance" });
    }

    // 5. Check SMM API balance
    const balanceParams = new URLSearchParams();
    balanceParams.append('key', SMM_API_KEY);
    balanceParams.append('action', 'balance');

    const balanceRes = await axios.post(SMM_API_URL, balanceParams.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      timeout: 60000,
      httpsAgent
    });
    const smmBalance = parseFloat(balanceRes.data.balance);
    if (smmBalance < cost) {
      return res.status(500).json({ error: "System balance low, please try again later" });
    }

    // 6. Place order on SMM API
    const orderParams = new URLSearchParams();
    orderParams.append('key', SMM_API_KEY);
    orderParams.append('action', 'add');
    orderParams.append('service', service_id);
    orderParams.append('link', link);
    orderParams.append('quantity', String(quantity));

    const orderRes = await axios.post(SMM_API_URL, orderParams.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      timeout: 60000,
      httpsAgent
    });

    if (orderRes.data.error) {
      return res.status(400).json({ error: orderRes.data.error });
    }

    const smm_order_id = orderRes.data.order;

    // 7. Update user balance in Firestore and store order
    await database.runTransaction(async (transaction) => {
      transaction.update(userRef, {
        balance: admin.firestore.FieldValue.increment(-cost)
      });

      const orderRef = database.collection("orders").doc();
      transaction.set(orderRef, {
        user_id: uid,
        service_id,
        quantity,
        link,
        smm_order_id,
        status: "pending",
        cost: cost,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    });

    return res.status(200).json({ success: true, order_id: smm_order_id, cost: cost });
  } catch (error: any) {
    console.error("Order error:", error?.message || error);
    console.error("Full error:", error);
    return res.status(500).json({ error: error?.message || "Failed to place order" });
  }
}
