// thread.worker.js
self.addEventListener("message", ({ data }) => {
  let { type, payload } = data;
  if (type === "UPDATE") {
    console.log(`WORKER 1: ${Date.now()}`);
    const result =
      payload.transactions
        ?.filter(
          (transaction) =>
            !payload.merchants ||
            payload.merchants.indexOf(transaction.Description) !== -1
        )
        ?.filter((transaction) => transaction.Debit && transaction.Debit < 0)
        .map((transaction) => ({
          x: transaction["Transaction Date"].toLocaleDateString("default", {
            month: "2-digit",
            day: "2-digit",
            year: "numeric",
          }),
          y: transaction.Debit ?? 0,
        })) || [];
    self.postMessage({ type: "UPDATE_SUCCESS", payload: result });
    console.log(`WORKER 2: ${Date.now()}`);
  }
});

self.addEventListener(
  "exit",
  () => {
    process.exit(0);
  },
  false
);
