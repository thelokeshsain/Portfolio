async function pollDeployment() {
  console.log("Checking Vercel production deployment status for commit d439ec6...");
  for (let i = 0; i < 8; i++) {
    try {
      const res = await fetch("https://lokeshsain.vercel.app/blog/react-error-130-turbopack-postmortem", {
        headers: { "Cache-Control": "no-cache, no-store", "Pragma": "no-cache" }
      });
      const html = await res.text();
      const hasNewStandards = html.includes("Technical Standards");
      const hasOldBoilerplate = html.includes("immigration counsel");
      console.log("Attempt " + (i + 1) + ": HTTP " + res.status + " | hasNewStandards: " + hasNewStandards + " | hasOldBoilerplate: " + hasOldBoilerplate);
      if (hasNewStandards && !hasOldBoilerplate) {
        console.log("\n>>> SUCCESS: Commit d439ec6 is fully deployed and verified live on production! <<<");
        return true;
      }
    } catch (err) {
      console.log("Poll error:", err.message);
    }
    await new Promise((r) => setTimeout(r, 6000));
  }
  return false;
}

pollDeployment().then((success) => {
  if (!success) {
    console.log("Deployment is still building or propagating CDN cache. Will check again.");
  }
  process.exit(success ? 0 : 1);
});
