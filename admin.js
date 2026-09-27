// ✅ Simple products (only needed fields)
const products = [
  { id: 1, name: "Premium Brake Pads", stock: 2 },
  { id: 2, name: "Suspension Coil Springs", stock: 8 },
  { id: 3, name: "Engine Oil Filter", stock: 5 },
  { id: 4, name: "Transmission Fluid Kit", stock: 3 },
  { id: 5, name: "LED Headlight Set", stock: 7 },
  { id: 6, name: "Performance Exhaust System", stock: 1 }
];

// ✅ Load saved stock from localStorage
let savedStock = JSON.parse(localStorage.getItem("stockData")) || {};

products.forEach(p => {
  if (savedStock[p.id] !== undefined) {
    p.stock = savedStock[p.id];
  }
});

// ✅ Render products
document.addEventListener("DOMContentLoaded", () => {
  renderProducts();
});

// ✅ Function to display products
function renderProducts() {
  const container = document.getElementById("admin-products");
  container.innerHTML = "";

  products.forEach(product => {
    const div = document.createElement("div");

    div.style.marginBottom = "15px";

    div.innerHTML = `
      <h3>${product.name}</h3>
      <p><b>Stock:</b> ${product.stock}</p>

      <button onclick="increaseStock(${product.id})">➕</button>
      <button onclick="decreaseStock(${product.id})">➖</button>

      <hr>
    `;

    container.appendChild(div);
  });
}

// ✅ Increase stock
window.increaseStock = function(id) {
  let product = products.find(p => p.id === id);
  product.stock++;

  saveStock();
  renderProducts(); // 🔥 no reload
};

// ✅ Decrease stock
window.decreaseStock = function(id) {
  let product = products.find(p => p.id === id);

  if (product.stock > 0) {
    product.stock--;
  }

  saveStock();
  renderProducts(); // 🔥 no reload
};

// ✅ Save to localStorage
function saveStock() {
  let stockData = {};

  products.forEach(p => {
    stockData[p.id] = p.stock;
  });

  localStorage.setItem("stockData", JSON.stringify(stockData));
}