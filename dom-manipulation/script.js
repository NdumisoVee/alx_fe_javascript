const SERVER_URL = "https://jsonplaceholder.typicode.com/posts"; // Simulated server
let quotes = [];
let syncInterval = null;

// DOM Elements
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteButton = document.getElementById("newQuote");
const categorySelect = document.getElementById("categorySelect");
const categoryFilter = document.getElementById("categoryFilter");
const addQuoteFormContainer = document.getElementById("addQuoteFormContainer");
const filteredQuotesDiv = document.getElementById("filteredQuotes");
const notification = document.getElementById("notification");

// === Local Storage ===
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

function loadQuotes() {
  const stored = localStorage.getItem("quotes");
  if (stored) {
    quotes = JSON.parse(stored);
  } else {
    quotes = [
      { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Motivational" },
      { text: "Life is what happens when you're busy making other plans.", category: "Life" },
      { text: "Success is not in what you have, but who you are.", category: "Success" }
    ];
    saveQuotes();
  }
}

// === UI Helpers ===
function showNotification(message) {
  notification.textContent = message;
  notification.style.display = "block";
  setTimeout(() => {
    notification.style.display = "none";
  }, 4000);
}

// === Quotes Display ===
function populateCategories() {
  const categories = [...new Set(quotes.map(q => q.category))];
  const lastFilter = localStorage.getItem("lastCategoryFilter") || "all";

  [categorySelect, categoryFilter].forEach(select => {
    select.innerHTML = `<option value="all">All Categories</option>`;
    categories.forEach(cat => {
      const opt = document.createElement("option");
      opt.value = cat;
      opt.textContent = cat;
      select.appendChild(opt);
    });

    if (select === categoryFilter) select.value = lastFilter;
  });
}

function showRandomQuote() {
  const category = categorySelect.value;
  const filtered = category === "all" ? quotes : quotes.filter(q => q.category === category);

  if (filtered.length === 0) {
    quoteDisplay.textContent = "No quotes available.";
    return;
  }

  const q = filtered[Math.floor(Math.random() * filtered.length)];
  quoteDisplay.textContent = `"${q.text}" — ${q.category}`;

  sessionStorage.setItem("lastQuote", JSON.stringify(q));
}

function filterQuotes() {
  const selected = categoryFilter.value;
  localStorage.setItem("lastCategoryFilter", selected);

  const filtered = selected === "all" ? quotes : quotes.filter(q => q.category === selected);
  filteredQuotesDiv.innerHTML = "";

  if (filtered.length === 0) {
    filteredQuotesDiv.textContent = "No quotes in this category.";
    return;
  }

  filtered.forEach(q => {
    const p = document.createElement("p");
    p.textContent = `"${q.text}" — ${q.category}`;
    filteredQuotesDiv.appendChild(p);
  });
}

// === Add Quote Form ===
function createAddQuoteForm() {
  const title = document.createElement("h3");
  title.textContent = "Add a New Quote";

  const quoteInput = document.createElement("input");
  quoteInput.id = "newQuoteText";
  quoteInput.type = "text";
  quoteInput.placeholder = "Enter a new quote";

  const categoryInput = document.createElement("input");
  categoryInput.id = "newQuoteCategory";
  categoryInput.type = "text";
  categoryInput.placeholder = "Enter quote category";

  const addButton = document.createElement("button");
  addButton.textContent = "Add Quote";
  addButton.onclick = addQuote;

  const form = document.createElement("div");
  form.appendChild(quoteInput);
  form.appendChild(categoryInput);
  form.appendChild(addButton);

  addQuoteFormContainer.appendChild(title);
  addQuoteFormContainer.appendChild(form);
}

function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();

  if (!text || !category) {
    alert("Please enter both quote and category.");
    return;
  }

  const newQuote = { text, category };
  quotes.push(newQuote);
  saveQuotes();
  populateCategories();
  filterQuotes();

  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";

  showNotification("Quote added!");
  postQuoteToServer(newQuote); // Send to server
}

// === JSON Import/Export ===
function exportToJsonFile() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function importFromJsonFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = async function(e) {
    try {
      const imported = JSON.parse(e.target.result);
      if (!Array.isArray(imported)) throw new Error("Invalid format");

      imported.forEach(q => {
        if (q.text && q.category) quotes.push(q);
      });

      saveQuotes();
      populateCategories();
      filterQuotes();
      showNotification("Quotes imported.");
    } catch (err) {
      showNotification("Import failed: " + err.message);
    }
  };

  reader.readAsText(file);
}

// === Server Sync ===
function startServerSync() {
  syncInterval = setInterval(fetchQuotesFromServer, 60000); // every 60s
  fetchQuotesFromServer(); // initial call
}

async function fetchQuotesFromServer() {
  try {
    const response = await fetch(SERVER_URL);
    const data = await response.json();

    const serverQuotes = data.slice(0, 10).map(post => ({
      text: post.title,
      category: "Server"
    }));

    await handleSync(serverQuotes);
  } catch (error) {
    console.error("Sync failed:", error);
    showNotification("Failed to sync with server.");
  }
}

async function postQuoteToServer(quote) {
  try {
    const response = await fetch(SERVER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(quote)
    });

    const data = await response.json();
    console.log("Posted to server:", data);
    showNotification("Quote sent to server.");
  } catch (error) {
    console.error("Failed to post quote:", error);
    showNotification("Failed to post quote to server.");
  }
}

async function handleSync(serverQuotes) {
  const local = JSON.parse(localStorage.getItem("quotes") || "[]");
  let updated = false;

  serverQuotes.forEach(sq => {
    const exists = local.some(lq => lq.text === sq.text && lq.category === sq.category);
    if (!exists) {
      local.push(sq);
      updated = true;
    }
  });

  if (updated) {
    quotes = local;
    saveQuotes();
    populateCategories();
    filterQuotes();
    showNotification("Quotes synced with server!");
  }
}

async function syncQuotes() {
  await fetchQuotesFromServer();
  if (quotes.length > 0) {
    await postQuoteToServer(quotes[quotes.length - 1]);
  }
  showNotification("Sync complete.");
}

// === App Init ===
loadQuotes();
populateCategories();
showRandomQuote();
createAddQuoteForm();
filterQuotes();
startServerSync();

// Restore last viewed quote
const lastQuote = sessionStorage.getItem("lastQuote");
if (lastQuote) {
  const parsed = JSON.parse(lastQuote);
  quoteDisplay.textContent = `"${parsed.text}" — ${parsed.category}`;
}

newQuoteButton.addEventListener("click", showRandomQuote);
categorySelect.addEventListener("change", showRandomQuote);
