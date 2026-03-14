// @ts-ignore `.open-next/worker.js` is generated at build time.
import { default as handler } from "./.open-next/worker.js";

export default {
  fetch: handler.fetch,

  async scheduled(controller, env: any, ctx) {
    console.log(`Scheduled job triggered for cron: ${controller.cron}`);

    ctx.waitUntil(
      (async () => {
        try {
          const req = new Request("http://localhost/api/trigger", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${env.CRON_SECRET || env.BLAND_API_KEY || process.env.BLAND_API_KEY || ""}`,
            },
          });
          const res = await handler.fetch(req, env, ctx);
          if (!res.ok) {
            console.error("Cron trigger failed:", await res.text());
          } else {
            console.log("Cron trigger succeeded. Triggered:", await res.json());
          }
        } catch (err) {
          console.error("Cron trigger error:", err);
        }
      })()
    );
  },
} satisfies ExportedHandler<CloudflareEnv>;
