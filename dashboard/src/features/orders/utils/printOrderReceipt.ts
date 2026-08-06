export interface PrintOrderReceiptOptions {
  onAfterPrint?: () => void;
}

function waitForImage(image: HTMLImageElement): Promise<void> {
  if (image.complete) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    const handleComplete = () => {
      image.removeEventListener("load", handleComplete);
      image.removeEventListener("error", handleComplete);
      resolve();
    };

    image.addEventListener("load", handleComplete, { once: true });
    image.addEventListener("error", handleComplete, { once: true });
  });
}

export async function printOrderReceipt(
  receipt: HTMLElement | null,
  options: PrintOrderReceiptOptions = {},
): Promise<void> {
  if (typeof window === "undefined" || typeof document === "undefined") {
    throw new Error("Printing is only available in a browser.");
  }

  if (!receipt || typeof window.print !== "function") {
    throw new Error("The order receipt is not ready to print.");
  }

  await Promise.all(
    Array.from(receipt.querySelectorAll<HTMLImageElement>("img")).map(
      waitForImage,
    ),
  );

  await new Promise<void>((resolve) => {
    window.setTimeout(resolve, 0);
  });

  if (!receipt.isConnected) {
    throw new Error("The order receipt is no longer available.");
  }

  const cleanup = () => {
    receipt.removeAttribute("data-print-target");
    document.body.classList.remove("receipt-printing");
    window.removeEventListener("afterprint", cleanup);
    options.onAfterPrint?.();
  };

  receipt.setAttribute("data-print-target", "true");
  document.body.classList.add("receipt-printing");
  window.addEventListener("afterprint", cleanup, { once: true });

  try {
    window.print();
  } catch (error) {
    cleanup();
    throw error;
  }
}
