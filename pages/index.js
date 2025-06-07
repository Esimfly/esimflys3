import { useState, useEffect } from "react";

export default function Home() {
  const [tranNo, setTranNo] = useState("");
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState("");

  const handleCheck = async () => {
    setError("");
    setData(null);
    if (!tranNo.trim()) {
      setError("Please enter the transaction number.");
      return;
    }

    try {
      const res = await fetch("/api/checkUsage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ esimTranNo: tranNo.trim() }),
      });

      const json = await res.json();

      console.log("API response data:", json);

      // تعديل هنا: قراءة من esimUsageList.esimUsageList
      const list = json.obj?.esimUsageList?.esimUsageList;

      if (!list || !Array.isArray(list) || list.length === 0) {
        setError("No data found for this transaction number.");
        return;
      }

      setData(list[0]);
    } catch (err) {
      setError("Server error occurred.");
      console.error(err);
    }
  };

  useEffect(() => {
    if (!data) return;

    const lastUpdate = new Date(data.lastUpdateTime);
    const expiryTime = lastUpdate.getTime() + 30 * 24 * 60 * 60 * 1000;

    const updateCountdown = () => {
      const now = new Date().getTime();
      const distance = expiryTime - now;
      if (distance <= 0) {
        setCountdown("Expired");
        return;
      }
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setCountdown(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [data]);

  const toGB = (bytes) => (bytes / 1024 ** 3).toFixed(2);

  const getUsagePercentage = () => {
    if (!data) return 0;
    const used = parseFloat(toGB(data.dataUsage));
    const total = parseFloat(toGB(data.totalData));
    return total > 0 ? Math.min((used / total) * 100, 100).toFixed(2) : 0;
  };

  const getBarColor = (percentage) => {
    const p = parseFloat(percentage);
    if (p <= 50) return "#4caf50";
    if (p <= 80) return "#ffc110";
    return "#f44336";
  };

  return (
    <div
      style={{
        fontFamily: "Arial",
        backgroundColor: "#f4f4f4",
        padding: 20,
        textAlign: "center",
      }}
    >
      <div style={{ marginBottom: 20 }}>
        <img
          src="https://files.catbox.moe/s83b16.png"
          alt="Company Logo"
          style={{
            width: "150px",
            borderRadius: "10px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
            maxWidth: "100%",
            height: "auto",
          }}
        />
      </div>

      <div style={{ marginBottom: 15 }}>
        <a
          href="https://wa.me/97336636509"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 18px",
            backgroundColor: "#25D366",
            color: "white",
            borderRadius: 30,
            fontWeight: "bold",
            textDecoration: "none",
            marginRight: 10,
          }}
        >
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
            alt="WhatsApp"
            style={{ width: 20, height: 20 }}
          />
          WhatsApp
        </a>

        <a
          href="https://www.instagram.com/esim_fly?igsh=YXJlem8wcWE3YWtu"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 18px",
            backgroundColor: "#E1306C",
            color: "white",
            borderRadius: 30,
            fontWeight: "bold",
            textDecoration: "none",
          }}
        >
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png"
            alt="Instagram"
            style={{ width: 20, height: 20 }}
          />
          Instagram
        </a>
      </div>

      <div
        style={{
          background: "#fff",
          padding: 20,
          borderRadius: 12,
          maxWidth: 500,
          margin: "auto",
          boxShadow: "0 0 10px rgba(3, 143, 236, 0.3)",
          textAlign: "left",
        }}
      >
        <input
          value={tranNo}
          onChange={(e) => setTranNo(e.target.value)}
          placeholder="2505..... Enter TranNo"
          style={{
            width: "100%",
            padding: 12,
            fontSize: 16,
            margin: "10px 0",
            borderRadius: 8,
            border: "1px solid #ccc",
          }}
        />
        <div style={{ textAlign: "center" }}>
          <button
            onClick={handleCheck}
            style={{
              padding: "10px 20px",
              fontSize: 18,
              backgroundColor: "#0d94ee",
              color: "#fff",
              border: "none",
              borderRadius: 12,
              cursor: "pointer",
              marginTop: 10,
              display: "inline-block",
            }}
          >
            Check
          </button>
        </div>

        {error && <div style={{ color: "red", marginTop: 15 }}>{error}</div>}

        {data && (
          <div style={{ marginTop: 25, textAlign: "center" }}>
            <p>
              <strong>Transaction Number:</strong> {data.esimTranNo}
            </p>
            <p>
              <strong>Total Data:</strong> {toGB(data.totalData)} GB
            </p>
            <p>
              <strong>Used:</strong> {toGB(data.dataUsage)} GB
            </p>

            {(() => {
              const usage = getUsagePercentage();
              const color = getBarColor(usage);
              return (
                <div
                  className="progress-bar"
                  style={{
                    height: 20,
                    borderRadius: 10,
                    backgroundColor: "#e0e0e0",
                    overflow: "hidden",
                    margin: "10px 0",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${usage}%`,
                      backgroundColor: color,
                      transition: "width 0.5s",
                    }}
                  />
                </div>
              );
            })()}

            <p>
              <strong>Remaining:</strong>{" "}
              {(toGB(data.totalData) - toGB(data.dataUsage)).toFixed(2)} GB
            </p>
            <p>
              <strong>Last Update:</strong>{" "}
              {new Date(data.lastUpdateTime).toLocaleString("en-US")}
            </p>
            <p
              className="countdown"
              style={{ fontWeight: "bold", marginTop: 10 }}
            >
              <strong>Time Left:</strong> {countdown}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
