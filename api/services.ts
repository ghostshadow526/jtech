import axios from "axios";
import https from "https";

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

const SMM_API_URL = "https://smexploits.com/api/v2";
const SMM_API_KEY = process.env.SMM_API_KEY;

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!SMM_API_KEY) {
    return res.status(500).json({ error: "SMM API key is not configured" });
  }

  try {
    const params = new URLSearchParams();
    params.append("key", SMM_API_KEY);
    params.append("action", "services");

    const response = await axios.post(SMM_API_URL, params.toString(), {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      timeout: 60000,
      httpsAgent,
    });

    const services = response.data;
    if (!Array.isArray(services)) {
      console.error("Invalid response from SMM API. Response type:", typeof services, "Data:", services);
      // If panel returned a JSON error, surface it to the client for easier debugging
      if (services && typeof services === "object" && (services as any).error) {
        return res.status(500).json({ error: (services as any).error });
      }
      return res
        .status(500)
        .json({ error: "The service catalog is currently unavailable. Please try again later." });
    }

    const grouped = services.reduce((acc: any, service: any) => {
      const category = service.category || "Other";
      if (!acc[category]) acc[category] = [];
      acc[category].push(service);
      return acc;
    }, {} as Record<string, any[]>);

    return res.status(200).json(grouped);
  } catch (error: any) {
    console.error("Error fetching services:", error?.response?.data || error.message || error);
    // If upstream API included an error message, return it
    const upstreamError = error?.response?.data?.error;
    return res.status(500).json({ error: upstreamError || (error.message || "Failed to fetch services") });
  }
}
