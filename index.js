const { chromium } = require("playwright");
const supabase = require("./supabase");

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on("websocket", async (ws) => {
    console.log("[+] WebSocket connected:", ws.url());

    ws.on("framereceived", async (frame) => {
      try {
        const payload = frame.payload;

        // Look for '42' message prefix used by socket.io
        if (payload.startsWith("42")) {
          // Remove the '42' prefix and parse the JSON payload
          const jsonStr = payload.slice(2);
          const [event, data] = JSON.parse(jsonStr);

          if (event === "cfg_r_e" && data?.m) {
            const multiplier = parseFloat(data.m);
            console.log("[🎯 Multiplier]", multiplier);

            // Save to Supabase
            const { error } = await supabase
              .from("super_kick_results")
              .insert([{ multiplier }]);

            if (error) {
              console.error("❌ Failed to save multiplier:", error);
            } else {
              console.log("✅ Multiplier saved:", multiplier);
            }
          }
        }
      } catch (err) {
        // Silently ignore parsing errors
      }
    });
  });

  page.on("request", (request) => {
    if (request.resourceType() === "websocket") {
      console.log("\n[🛰️ WS Request Headers]");
      console.log(request.headers());
    }
  });

  await page.goto("https://www.msport.com/ng/casino/superkick/sk_demo");

  console.log("Waiting for multiplier updates...");
})();
