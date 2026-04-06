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
    projectId: "ai-studio-applet-webapp-a5612",
  });
}

const db = admin.firestore();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const SMM_API_URL = "https://smexploits.com/api/v2";
const SMM_API_KEY = process.env.SMM_API_KEY || "0d40b5c2dae730babbee213e663bded5";

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
      
      acc[category].push(service);
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

    const rate = parseFloat(service.rate);
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
}

startServer();
