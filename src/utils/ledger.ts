type LedgerRow = {
  entryType: "credit" | "debit";
  amountPaise: number;
};

export function summarizeLedger(entries: LedgerRow[]) {
  let totalCreditPaise = 0;
  let totalDebitPaise = 0;

  for (const entry of entries) {
    if (entry.entryType === "credit") {
      totalCreditPaise += entry.amountPaise;
    } else {
      totalDebitPaise += entry.amountPaise;
    }
  }

  return {
    totalCreditPaise,
    totalDebitPaise,
    balancePaise: totalCreditPaise - totalDebitPaise,
  };
}