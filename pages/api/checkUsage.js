import crypto from "crypto";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, errorMsg: "Method Not Allowed" });
  }

  const { esimTranNo } = req.body;

  if (!esimTranNo) {
    return res.status(400).json({ success: false, errorMsg: "Transaction number is required." });
  }

  const ACCESS_CODE = "c1b7f81b90f04f2c95312ab29a34cb1f";

  try {
    const response = await fetch("https://api.esimaccess.com/api/v1/open/esim/usage/query", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "RT-AccessCode": ACCESS_CODE,
      },
      body: JSON.stringify({
        esimTranNoList: [esimTranNo], // API expects a list
      }),
    });

    const data = await response.json();

    console.log("API response data:", JSON.stringify(data, null, 2));

    if (!data.success || !data.obj || data.obj.length === 0) {
      return res.status(404).json({ success: false, errorMsg: "Usage data not found." });
    }

    // Return the full list under esimUsageList so front end can use esimUsageList[0]
    return res.status(200).json({ success: true, obj: { esimUsageList: data.obj } });

  } catch (error) {
    console.error("Error in API handler:", error);
    return res.status(500).json({ success: false, errorMsg: "Server error." });
  }
}
