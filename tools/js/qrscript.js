let qrCodeInstance;

function generateQRCode() {
  const upiId = document.getElementById("upiId").value.trim();
  const payeeName = document.getElementById("payeeName").value.trim();
  const transactionAmount = document
    .getElementById("transactionAmount")
    .value.trim();
  const paymentNote = document.getElementById("paymentNote").value.trim();

  // Construct UPI payment URL
  if (!upiId || !payeeName) {
    document.getElementById("qrcode").innerHTML =
      "Please provide UPI ID and Payee Name.";
    document.getElementById("download-btn").style.display = "none";
    return;
  }

  let upiURL = `upi://pay?pa=${upiId.replace(/ /g, "")}&pn=${payeeName.replace(
    / /g,
    ""
  )}`;
  if (transactionAmount) {
    upiURL += `&am=${transactionAmount.replace(/ /g, "")}`;
  }
  if (paymentNote) {
    upiURL += `&tn=${paymentNote.replace(/ /g, "")}`;
  }
  upiURL += `&cu=INR`;

  // Generate QR Code
  const qrCodeDiv = document.getElementById("qrcode");
  qrCodeDiv.innerHTML = ""; // Clear any existing QR code
  qrCodeInstance = new QRCode(qrCodeDiv, {
    text: upiURL,
    width: 256,
    height: 256,
  });

  // Show download button
  document.getElementById("download-btn").style.display = "block";
}

function downloadQRCode() {
  const qrCanvas = document.querySelector("#qrcode canvas");
  const qrDataURL = qrCanvas.toDataURL("image/png");
  const downloadLink = document.createElement("a");
  downloadLink.href = qrDataURL;
  downloadLink.download = "upi_qr_code.png";
  downloadLink.click();
}
