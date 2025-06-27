let quotes = [
  { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Motivational" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "Success is not in what you have, but who you are.", category: "Success" }
];

const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteButton = document.getElementById("newQuote");
const categorySelect = document.getElementById("categorySelect");
const addQuoteFormContainer = document.getElementById("addQuoteFormContainer");

function populateCategories() {
  const categories = [...new Set(quotes.map(q => q.category))];
  categorySelect.innerHTML = `<option value="all">All</option>`;
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categorySelect.appendChild(option);
  });
}

function showRandomQuote() {
  const selectedCategory = categorySelect.value;
  const filteredQuotes = selectedCategory === "all"
    ? quotes
    : quotes.filter(q => q.category === selectedCategory);

  if (filteredQuotes.length === 0) {
    quoteDisplay.textContent = "No quotes available in this category.";
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  quoteDisplay.textContent = `"${filteredQuotes[randomIndex].text}" — ${filteredQuotes[randomIndex].category}`;
}

// ✅ Dynamically create form and add it to the DOM
function createAddQuoteForm() {
  const formTitle = document.createElement("h3");
  formTitle.textContent = "Add a New Quote";

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
  addButton.addEventListener("click", addQuote);

  const formDiv = document.createElement("div");
  formDiv.appendChild(quoteInput);
  formDiv.appendChild(categoryInput);
  formDiv.appendChild(addButton);

  addQuoteFormContainer.appendChild(formTitle);
  addQuoteFormContainer.appendChild(formDiv);
}

function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();

  if (!text || !category) {
    alert("Please enter both quote text and category.");
    return;
  }

  quotes.push({ text, category });
  populateCategories(); // Refresh dropdown
  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";
  alert("Quote added successfully!");
}

newQuoteButton.addEventListener("click", showRandomQuote);
categorySelect.addEventListener("change", showRandomQuote);

// Initial setup
populateCategories();
showRandomQuote();
createAddQuoteForm(); // Call to generate the form dynamically
