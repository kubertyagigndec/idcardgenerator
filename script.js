
let templateImage = null;
let dataRows = [];
let defaultLeft = 0;
let defaultTop = 0;
let defaultFontSize = 35;
const cardWrappers = [];

// Handle template image upload
document.getElementById("templateUpload").addEventListener("change", function (e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (event) {
    templateImage = new Image();
    templateImage.src = event.target.result;

    templateImage.onload = () => {
      document.getElementById("template-img").src = templateImage.src;
      document.getElementById("template-container").style.display = "block";
    };
  };
  reader.readAsDataURL(file);
});

// Handle Excel or CSV data upload
document.getElementById("dataUpload").addEventListener("change", async function (e) {
  const file = e.target.files[0];
  if (!file) {
    console.log("❌ No file selected");
    return;
  }

  console.log("📁 File selected:", file.name);

  try {
    const data = await file.arrayBuffer();
    console.log("🔄 ArrayBuffer loaded");

    const workbook = XLSX.read(data, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    dataRows = XLSX.utils.sheet_to_json(sheet);

    console.log("✅ Data rows parsed:", dataRows);
  } catch (err) {
    console.error("❌ Failed to read Excel/CSV:", err);
  }
});

// Apply default position & font size to all cards
document.getElementById("applyDefault").addEventListener("click", () => {
  defaultLeft = parseInt(document.getElementById("defaultLeft").value) || 0;
  defaultTop = parseInt(document.getElementById("defaultTop").value) || 0;
  defaultFontSize = parseInt(document.getElementById("defaultFontSize").value) || 35;

  cardWrappers.forEach(({ wrapper }) => {
    const entryBlock = wrapper.querySelector(".entry-block");
    entryBlock.style.left = defaultLeft + "px";
    entryBlock.style.top = defaultTop + "px";
    entryBlock.style.fontSize = defaultFontSize + "px";

    wrapper.querySelector(".left-control").value = defaultLeft;
    wrapper.querySelector(".top-control").value = defaultTop;
    wrapper.querySelector(".size-control").value = defaultFontSize;
  });
});

// Generate cards from uploaded data
document.getElementById("generateBtn").addEventListener("click", () => {
  const preview = document.getElementById("preview");
  preview.innerHTML = "";
  cardWrappers.length = 0;

  console.log("🟢 Generate button clicked. Template:", templateImage, "Data:", dataRows);

  if (!templateImage) return alert("Please upload a template image.");
  if (!dataRows.length) return alert("Please upload a CSV or Excel file.");

  const width = templateImage.naturalWidth;
  const height = templateImage.naturalHeight;

  const color = document.getElementById("textColorPicker").value;

  dataRows.forEach((entry) => {
    const wrapper = document.createElement("div");
    wrapper.className = "card-wrapper";

    const card = document.createElement("div");
    card.className = "card";
    card.style.width = width + "px";
    card.style.height = height + "px";
    card.style.backgroundImage = `url(${templateImage.src})`;
    card.style.backgroundSize = "cover";
    card.style.backgroundPosition = "center";

    const entryBlock = document.createElement("div");
    entryBlock.className = "entry-block";
    entryBlock.style.left = defaultLeft + "px";
    entryBlock.style.top = defaultTop + "px";
    entryBlock.style.fontSize = defaultFontSize + "px";
    entryBlock.style.color = color;

    Object.keys(entry).forEach((key) => {
      const row = document.createElement("div");
      row.className = "entry-row";

      const label = document.createElement("div");
      label.className = "entry-label";
      label.textContent = key;
      label.contentEditable = "true";
      label.spellcheck = false;

      const colon = document.createElement("div");
      colon.className = "entry-colon";
      colon.textContent = ":";

      const value = document.createElement("div");
      value.className = "entry-value";
      value.textContent = entry[key];
      value.contentEditable = "true";
      value.spellcheck = false;

      row.appendChild(label);
      row.appendChild(colon);
      row.appendChild(value);
      entryBlock.appendChild(row);
    });

    card.appendChild(entryBlock);
    wrapper.appendChild(card);

    const controls = document.createElement("div");
    controls.className = "controls";
    controls.innerHTML = `
      <label>Left: <input type="number" value="${defaultLeft}" class="left-control"></label>
      <label>Top: <input type="number" value="${defaultTop}" class="top-control"></label>
      <label>Size: <input type="number" value="${defaultFontSize}" class="size-control"></label>
    `;

    controls.querySelector(".left-control").addEventListener("input", (e) => {
      entryBlock.style.left = e.target.value + "px";
    });
    controls.querySelector(".top-control").addEventListener("input", (e) => {
      entryBlock.style.top = e.target.value + "px";
    });
    controls.querySelector(".size-control").addEventListener("input", (e) => {
      entryBlock.style.fontSize = e.target.value + "px";
    });

    wrapper.appendChild(controls);
    preview.appendChild(wrapper);

    cardWrappers.push({ wrapper, entry });
  });

  document.getElementById("downloadBtn").style.display = "inline-block";
});

// Update text color dynamically
document.getElementById("textColorPicker").addEventListener("input", (e) => {
  const color = e.target.value;

  document.querySelectorAll(".entry-label, .entry-colon, .entry-value").forEach(el => {
    el.style.color = color;
  });
});

// Download all cards as PNG in a ZIP
document.getElementById("downloadBtn").addEventListener("click", async () => {
  const zip = new JSZip();
  const width = templateImage.naturalWidth;
  const height = templateImage.naturalHeight;

  for (let i = 0; i < cardWrappers.length; i++) {
    const { wrapper, entry } = cardWrappers[i];
    const card = wrapper.querySelector(".card");

    card.style.width = width + "px";
    card.style.height = height + "px";

    const clone = card.cloneNode(true);
    clone.style.position = "absolute";
    clone.style.left = "-9999px";
    clone.style.top = "0";
    clone.style.zIndex = "-999";

    document.body.appendChild(clone);

    const canvas = await html2canvas(clone, {
      width,
      height,
      windowWidth: width,
      windowHeight: height,
    });

    const blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/png")
    );

    const fileName = (entry.Name || "card_" + i).replace(/\s+/g, "_");
    zip.file(`${fileName}.png`, blob);

    clone.remove();
  }

  const zipBlob = await zip.generateAsync({ type: "blob" });

  const a = document.createElement("a");
  a.href = URL.createObjectURL(zipBlob);
  a.download = "ID_Cards.zip";
  a.click();
});

  const allowedTokenList = ['client123', 'client456']; // Replace with your valid tokens

  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');

  if (!token || !allowedTokenList.includes(token)) {
    document.body.innerHTML = "<h1>Access Denied</h1><p>Invalid token.</p>";
    throw new Error("Token invalid");
  }

  // Step 1: Get current IP
  fetch("https://api.ipify.org?format=json")
    .then(res => res.json())
    .then(data => {
      const userIP = data.ip;

      // Step 2: Send to Google Script
      fetch("https://script.google.com/macros/s/AKfycbyR8h_7RqY-1mBW7w5mo4YjrLmsuX4wqTond5j1cnaz1CH76jQQIRWDx0H3LlgGMT0n/exec", {
        method: "POST",
        body: JSON.stringify({ token, ip: userIP }),
        headers: { "Content-Type": "application/json" }
      })
      .then(res => res.json())
      .then(result => {
        if (!result.allowed) {
          document.body.innerHTML = "<h1>Access Denied</h1><p>IP mismatch for this token.</p>";
        }
      });
    });

