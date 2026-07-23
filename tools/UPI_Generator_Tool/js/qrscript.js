let qrCodeInstance;

// Per-field validation. Each returns "" when valid, or an error message.
const validators = {
  upiId: function (v) {
    if (!v) return "UPI ID is required.";
    if (!/^[A-Za-z0-9._-]{2,256}@[A-Za-z][A-Za-z0-9.-]{1,64}$/.test(v))
      return "Enter a valid UPI ID like name@bank (letters, digits and . _ - before the @).";
    return "";
  },
  payeeName: function (v) {
    if (!v) return "Payee name is required.";
    if (v.length > 100) return "Payee name must be 100 characters or fewer.";
    if (!/^[A-Za-z][A-Za-z .'&-]*$/.test(v))
      return "Payee name can only contain letters, spaces and . ' & -";
    return "";
  },
  transactionAmount: function (v) {
    if (!v) return ""; // optional
    if (!/^\d+(\.\d{1,2})?$/.test(v))
      return "Amount must be a positive number with up to 2 decimal places.";
    const n = parseFloat(v);
    if (n <= 0) return "Amount must be greater than 0.";
    if (n > 100000) return "Amount cannot exceed the ₹1,00,000 UPI limit.";
    return "";
  },
  paymentNote: function (v) {
    if (!v) return ""; // optional
    if (v.length > 50) return "Note must be 50 characters or fewer.";
    if (!/^[A-Za-z0-9 .,!?'()&_-]*$/.test(v))
      return "Note can only contain letters, digits, spaces and . , ! ? ' ( ) & _ -";
    return "";
  },
};

// Only show a field's error after the user has interacted with that field,
// so untouched fields don't light up red while typing in the first one.
const touched = {};

function setFieldError(id, message) {
  const input = document.getElementById(id);
  const errorEl = document.getElementById(id + "-error");
  if (touched[id] && message) {
    input.classList.add("invalid");
    errorEl.textContent = message;
  } else {
    input.classList.remove("invalid");
    errorEl.textContent = "";
  }
}

function generateQRCode() {
  const values = {
    upiId: document.getElementById("upiId").value.trim(),
    payeeName: document.getElementById("payeeName").value.trim(),
    transactionAmount: document.getElementById("transactionAmount").value.trim(),
    paymentNote: document.getElementById("paymentNote").value.trim(),
  };

  let hasError = false;
  for (const id in validators) {
    const message = validators[id](values[id]);
    setFieldError(id, message);
    if (message) hasError = true;
  }

  const qrCodeDiv = document.getElementById("qrcode");
  const downloadBtn = document.getElementById("download-btn");

  if (hasError) {
    qrCodeDiv.innerHTML =
      !values.upiId || !values.payeeName
        ? "Please provide UPI ID and Payee Name."
        : "Please fix the highlighted fields.";
    downloadBtn.style.display = "none";
    return;
  }

  // Construct UPI payment URL (URL-encode free-text params; spaces are kept)
  let upiURL =
    "upi://pay?pa=" +
    encodeURIComponent(values.upiId) +
    "&pn=" +
    encodeURIComponent(values.payeeName);
  if (values.transactionAmount) {
    upiURL += "&am=" + encodeURIComponent(values.transactionAmount);
  }
  if (values.paymentNote) {
    upiURL += "&tn=" + encodeURIComponent(values.paymentNote);
  }
  upiURL += "&cu=INR";

  qrCodeDiv.innerHTML = "";
  qrCodeInstance = new QRCode(qrCodeDiv, {
    text: upiURL,
    width: 256,
    height: 256,
  });

  downloadBtn.style.display = "block";
}

function downloadQRCode() {
  const qrCanvas = document.querySelector("#qrcode canvas");
  const qrImg = document.querySelector("#qrcode img");
  const qrDataURL = qrCanvas ? qrCanvas.toDataURL("image/png") : qrImg && qrImg.src;
  if (!qrDataURL) return;
  const downloadLink = document.createElement("a");
  downloadLink.href = qrDataURL;
  downloadLink.download = "upi_qr_code.png";
  downloadLink.click();
}

// Wire up live validation + generation
["upiId", "payeeName", "transactionAmount", "paymentNote"].forEach(function (id) {
  const input = document.getElementById(id);
  input.addEventListener("input", function () {
    touched[id] = true;
    generateQRCode();
  });
  // catch fields left invalid on blur too (e.g. tabbing past a required field)
  input.addEventListener("blur", function () {
    if (input.value !== "") touched[id] = true;
    generateQRCode();
  });
});
