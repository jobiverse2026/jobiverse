const PROCESS_URL = "https://jobiverse.in/api/internal/email/process";

async function processQueue(env) {
  const response = await fetch(PROCESS_URL, {
    method: "POST",
    headers: { authorization: `Bearer ${env.EMAIL_WORKER_SECRET}` },
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Email queue processor returned ${response.status}: ${detail.slice(0, 500)}`);
  }
}

const worker = {
  fetch() {
    return Response.json({ status: "healthy", service: "jobiverse-email-worker" });
  },

  scheduled(_controller, env, ctx) {
    ctx.waitUntil(processQueue(env));
  },
};

export default worker;
