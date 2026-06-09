import express from "express";
import cors from "cors";
import axios from "axios";
import https from "https";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import admin from "firebase-admin";

dotenv.config();

const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin
// In Cloud Run, it can use the default service account.
// For local dev, you might need a service account key.
if (!admin.apps.length) {
  admin.initializeApp({
    // Use your project ID from the config
    projectId: "jtech-99b8b",
  });
}

const db = admin.firestore();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const SMM_API_URL = "https://followersandviews.com/api/v2";
const SMM_API_KEY = process.env.SMM_API_KEY;

if (!SMM_API_KEY) {
  console.error("SMM_API_KEY is not set in the environment. Please configure it in your .env or hosting environment.");
  process.exit(1);
}

// API Endpoints

// 1. Fetch Services
app.get("/api/services", async (req, res) => {
  try {
    const params = new URLSearchParams();
    params.append('key', SMM_API_KEY);
    params.append('action', 'services');

    const response = await axios.post(SMM_API_URL, params.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      timeout: 60000,
      httpsAgent
    });
    
    // Group by category
    const services = response.data;
    if (!Array.isArray(services)) {
      console.error("Invalid response from SMM API. Response type:", typeof services, "Data:", services);
      return res.status(500).json({ error: "The service catalog is currently unavailable. Please try again later." });
    }

    const grouped = services.reduce((acc: any, service: any) => {
      const category = service.category || "Other";
      if (!acc[category]) acc[category] = [];
      
      // Apply 20% price markup to the service rate
      const markupMultiplier = 1.2;
      const originalRate = parseFloat(service.rate) || 0;
      const newRate = originalRate * markupMultiplier;
      
      // Log for debugging
      console.log(`Service: ${service.name}, Original: ${originalRate}, Marked Up: ${newRate}`);
      
      acc[category].push({
        ...service,
        rate: newRate.toString(), // Keep as string for API consistency
        originalRate: service.rate,
        markup: (newRate - originalRate).toFixed(2) // Show markup amount
      });
      return acc;
    }, {});

    res.json(grouped);
  } catch (error: any) {
    console.error("Error fetching services:", error.message);
    res.status(500).json({ error: "Failed to fetch services" });
  }
});

// 2. Check User Balance (Firestore)
app.get("/api/user/balance/:uid", async (req, res) => {
  try {
    const { uid } = req.params;
    const userDoc = await db.collection("users").doc(uid).get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ balance: userDoc.data()?.balance || 0 });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 2a. Test endpoint - verify price markup
app.get("/api/test/markup", async (req, res) => {
  try {
    const params = new URLSearchParams();
    params.append('key', SMM_API_KEY);
    params.append('action', 'services');

    const response = await axios.post(SMM_API_URL, params.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      timeout: 60000,
      httpsAgent
    });

    const services = response.data;
    if (!Array.isArray(services)) {
      return res.status(500).json({ error: "Invalid response" });
    }

    // Take first 5 services to show the markup
    const testServices = services.slice(0, 5).map((service: any) => {
      const originalRate = parseFloat(service.rate);
      const markedUpRate = originalRate * 1.2;
      return {
        name: service.name,
        originalRate,
        markedUpRate,
        markupAmount: (markedUpRate - originalRate).toFixed(2),
        markupPercentage: "20%"
      };
    });

    res.json({ 
      message: "Price markup is being applied correctly",
      examples: testServices 
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Place Order
app.post("/api/order", async (req, res) => {
  try {
    const { uid, service_id, quantity, link } = req.body;

    // 1. Validate input
    if (!uid || !service_id || !quantity || !link) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // 2. Get user balance from Firestore
    const userRef = db.collection("users").doc(uid);
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
    orderParams.append('quantity', quantity);

    const orderRes = await axios.post(SMM_API_URL, orderParams.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      httpsAgent
    });

    if (orderRes.data.error) {
      return res.status(400).json({ error: orderRes.data.error });
    }

    const smm_order_id = orderRes.data.order;

    // 7. Update user balance in Firestore and store order
    await db.runTransaction(async (transaction) => {
      transaction.update(userRef, {
        balance: admin.firestore.FieldValue.increment(-cost)
      });

      const orderRef = db.collection("orders").doc();
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

    res.json({ success: true, order_id: smm_order_id, cost: cost });
  } catch (error: any) {
    console.error("Order error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// 4. Check Order Status
app.get("/api/order/status/:order_id", async (req, res) => {
  try {
    const { order_id } = req.params;
    const params = new URLSearchParams();
    params.append('key', SMM_API_KEY);
    params.append('action', 'status');
    params.append('order', order_id);

    const response = await axios.post(SMM_API_URL, params.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      httpsAgent
    });
    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 4a. Check and update all pending orders from Firestore
app.post("/api/orders/check-status", async (req, res) => {
  try {
    const { uid } = req.body; // Optional - if provided, only check user's orders
    
    // Get all pending orders
    let query = db.collection("orders").where("status", "in", ["pending", "processing"]);
    if (uid) {
      query = query.where("user_id", "==", uid);
    }
    
    const ordersSnapshot = await query.get();
    const updates: any[] = [];

    for (const orderDoc of ordersSnapshot.docs) {
      const order = orderDoc.data();
      const smm_order_id = order.smm_order_id;

      try {
        // Check status from SMM API
        const params = new URLSearchParams();
        params.append('key', SMM_API_KEY);
        params.append('action', 'status');
        params.append('order', smm_order_id);

        const response = await axios.post(SMM_API_URL, params.toString(), {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          httpsAgent,
          timeout: 10000
        });

        const statusData = response.data;
        
        // SMM API returns status as a number where 0 or similar might mean completed
        // Typically: charge = in progress, empty/done = completed
        // Parse based on what the API returns
        let newStatus = order.status;
        let isComplete = false;

        // If the order status shows "Completed" or charge is 0 or the order completed_at is set
        if (statusData.status === 'Completed' || 
            statusData.charge === 0 || 
            statusData.charge === "0" ||
            statusData.remains === 0 ||
            statusData.remains === "0") {
          isComplete = true;
          newStatus = 'completed';
        }

        if (isComplete && order.status !== 'completed') {
          console.log(`Order ${smm_order_id} is complete, updating status...`);
          updates.push({
            docRef: orderDoc.ref,
            newStatus: newStatus
          });
        }
      } catch (orderError: any) {
        console.error(`Error checking order ${smm_order_id}:`, orderError.message);
        // Continue with next order if one fails
      }
    }

    // Update all completed orders in Firestore
    for (const update of updates) {
      await update.docRef.update({
        status: update.newStatus,
        completedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    res.json({ 
      success: true, 
      message: `Checked ${ordersSnapshot.size} orders, updated ${updates.length}`,
      updatedCount: updates.length
    });
  } catch (error: any) {
    console.error("Error checking orders:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// 5. Paystack Webhook
app.post("/api/webhook/paystack", async (req, res) => {
  try {
    const hash = req.headers['x-paystack-signature'];
    const secret = process.env.PAYSTACK_SECRET_KEY;

    if (!secret) {
      console.error("PAYSTACK_SECRET_KEY is not set");
      return res.status(500).json({ error: "Webhook verification failed" });
    }

    // Verify the signature
    const crypto = await import('crypto');
    const expectedHash = crypto.createHmac('sha512', secret)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (hash !== expectedHash) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const event = req.body;

    // Handle successful payment event
    if (event.event === 'charge.success') {
      const { authorization, customer } = event.data;
      const amount = event.data.amount / 100; // Convert from kobo to Naira
      const reference = event.data.reference;
      const email = customer.email;

      console.log(`Payment successful - Amount: ${amount}, Reference: ${reference}, Email: ${email}`);

      try {
        // Find user by email
        const usersSnapshot = await db.collection('users')
          .where('email', '==', email)
          .limit(1)
          .get();

        if (!usersSnapshot.empty) {
          const userId = usersSnapshot.docs[0].id;
          const userRef = db.collection('users').doc(userId);

          // Record payment transaction and update balance in a transaction
          await db.runTransaction(async (transaction) => {
            // Update user balance
            transaction.update(userRef, {
              balance: admin.firestore.FieldValue.increment(amount)
            });

            // Record payment transaction
            const paymentRef = db.collection('payments').doc();
            transaction.set(paymentRef, {
              userId: userId,
              email: email,
              amount: amount,
              currency: 'NGN',
              reference: reference,
              status: 'completed',
              description: 'Fund deposit via Paystack',
              createdAt: admin.firestore.FieldValue.serverTimestamp(),
              paystackData: {
                authorization: authorization,
                customer: customer,
              }
            });
          });

          console.log(`Payment recorded and balance updated - User: ${userId}, Amount: ${amount}`);
        } else {
          console.warn(`User not found for email: ${email}`);
        }
      } catch (recordError) {
        console.error('Error recording payment transaction:', recordError);
        // Don't fail the webhook response - payment was successful on Paystack side
      }
    }

    res.json({ success: true });
  } catch (error: any) {
    console.error("Webhook error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Background job to check pending orders periodically
async function checkPendingOrders() {
  try {
    const query = db.collection("orders").where("status", "in", ["pending", "processing"]);
    const ordersSnapshot = await query.get();

    for (const orderDoc of ordersSnapshot.docs) {
      const order = orderDoc.data();
      const smm_order_id = order.smm_order_id;

      try {
        const params = new URLSearchParams();
        params.append('key', SMM_API_KEY);
        params.append('action', 'status');
        params.append('order', smm_order_id);

        const response = await axios.post(SMM_API_URL, params.toString(), {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          httpsAgent,
          timeout: 10000
        });

        const statusData = response.data;

        if (statusData.status === 'Completed' || 
            statusData.charge === 0 || 
            statusData.charge === "0" ||
            statusData.remains === 0 ||
            statusData.remains === "0") {
          
          console.log(`[Auto-check] Order ${smm_order_id} is complete, updating status...`);
          await orderDoc.ref.update({
            status: 'completed',
            completedAt: admin.firestore.FieldValue.serverTimestamp()
          });
        }
      } catch (orderError: any) {
        console.error(`[Auto-check] Error checking order ${smm_order_id}:`, orderError.message);
      }
    }
  } catch (error: any) {
    console.error("[Auto-check] Error in background job:", error.message);
  }
}

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  // Start background job to check pending orders every 30 seconds
  setInterval(checkPendingOrders, 30000);
  console.log("Background order status checker started (checking every 30 seconds)");
}

startServer();
