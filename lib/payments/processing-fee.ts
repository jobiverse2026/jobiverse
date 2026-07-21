const DEFAULT_PAYMENT_PROCESSING_FEE_PERCENT = 2.36;

function safeAmount(amount: number) {
  return Number.isFinite(amount) ? Math.max(0, amount) : 0;
}

export function paymentProcessingRate() {
  const configured = Number(process.env.PAYMENT_PROCESSING_FEE_PERCENT);
  const percent =
    Number.isFinite(configured) && configured >= 0 && configured < 25
      ? configured
      : DEFAULT_PAYMENT_PROCESSING_FEE_PERCENT;

  return percent / 100;
}

export function amountWithPaymentProcessing(baseAmount: number) {
  const base = safeAmount(baseAmount);
  if (base <= 0) return 0;

  const rate = paymentProcessingRate();
  if (rate <= 0) return Math.ceil(base);

  return Math.ceil(base / (1 - rate));
}

export function paymentProcessingFeeFor(baseAmount: number) {
  const base = safeAmount(baseAmount);
  return Math.max(0, amountWithPaymentProcessing(base) - base);
}

