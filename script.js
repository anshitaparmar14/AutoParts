

// 🔥 Firebase Setup
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBBgKgDmd36zo0pRXRczMcBSzArK7OEJDo",
  authDomain: "autoparts-7f16a.firebaseapp.com",
  projectId: "autoparts-7f16a",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// 🔐 Protect page
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "auth.html";
  }
});

// 🔓 Logout
window.logout = async function () {
  await signOut(auth);
  window.location.href = "auth.html";
};
// Initialize cart array
let cart = JSON.parse(localStorage.getItem("cart")) || [];
let currentOrderId = "APH" + new Date().toISOString().slice(0,10).replace(/-/g, '') + "00001";

// Sample products data
/* =========================
   DEFAULT PRODUCTS
========================= */

const defaultProducts = [

  {
    id: 1,
    name: "Premium Brake Pads",
    category: "brakes",
    price: 1499,
    image: "./img/breakpad.png",
    description: "High-performance ceramic brake pads for improved stopping power and reduced brake dust.",
    stock: 2
  },

  {
    id: 2,
    name: "Suspension Coil Springs",
    category: "suspension",
    price: 2999,
    image: "./img/Suspension.png",
    description: "Heavy-duty coil springs designed for durability and a smooth ride on all terrains.",
    stock: 8
  },

  {
    id: 3,
    name: "Engine Oil Filter",
    category: "engine",
    price: 399,
    image: "./img/oilfilter.png",
    description: "Premium quality oil filter that removes contaminants and extends engine life.",
    stock: 5
  },

  {
    id: 4,
    name: "Transmission Fluid Kit",
    category: "transmission",
    price: 1799,
    image: "./img/oilkit.jpg",
    description: "Complete transmission fluid replacement kit with high-quality synthetic fluid.",
    stock: 3
  },

  {
    id: 5,
    name: "LED Headlight Set",
    category: "lighting",
    price: 3499,
    image: "./img/sp.png",
    description: "Ultra-bright LED headlights with extended lifespan and improved visibility.",
    stock: 7
  },

  {
    id: 6,
    name: "Performance Exhaust System",
    category: "exhaust",
    price: 8999,
    image: "./img/exhaust.png",
    description: "Stainless steel performance exhaust system for improved flow and engine sound.",
    stock: 1
  }

];

/* =========================
   LOAD PRODUCTS
========================= */

let products = JSON.parse(localStorage.getItem("products"));

/* FIRST TIME */

if(!products){

  products = defaultProducts;

  localStorage.setItem(
    "products",
    JSON.stringify(products)
  );

}

/* =========================
   SAVE PRODUCTS
========================= */

function saveProducts(){

  localStorage.setItem(
    "products",
    JSON.stringify(products)
  );

}

// DOM loaded event   
document.addEventListener('DOMContentLoaded', function() {

  displayProducts();
  setupEventListeners();

  document.querySelectorAll('.payment-details').forEach(details => {
    details.style.display = 'none';
  });

  const codDetails = document.getElementById('cod-details');
  if (codDetails) {
    codDetails.style.display = 'block';
  }

  preloadImages();
  displayCart();
  updateCartBadge();

  // ✅ SAFE CART CLICK FIX
  const cartLink = document.getElementById("cart-link");

  if (cartLink) {
    cartLink.addEventListener("click", function(e) {
      e.preventDefault();

      document.getElementById("products")?.classList.add("hide-section");
      document.getElementById("checkout")?.classList.add("hide-section");
      document.getElementById("payment")?.classList.add("hide-section");

      document.getElementById("cart")?.classList.remove("hide-section");

      displayCart();
    });
  }

});

  // ✅ ADD THIS (MISSING PART)

// Preload images to check validity and cache them
function preloadImages() {
  products.forEach(product => {
    const img = new Image();
    img.onerror = function() {
      console.warn(`Failed to load image for ${product.name}. Using fallback.`);
      // Try alternative paths if the original fails
      tryAlternativePaths(product);
    };
    img.src = product.image;
  });
}

// Try alternative paths for images
function tryAlternativePaths(product) {
  // Array of possible paths to try
  const possiblePaths = [
    product.image,
    product.image.replace('./', '/'),
    product.image.replace('./img', 'img'),
    product.image.replace('./img', '/img'),
    product.image.replace('./img', '../img'),
    product.image.replace('.png', '.jpg'),
    product.image.replace('.jpg', '.png')
  ];
  
  // Try each path
  for (const path of possiblePaths) {
    const img = new Image();
    img.onload = function() {
      console.log(`Found working path for ${product.name}: ${path}`);
      product.image = path; // Update the product's image path
      updateProductImages(product.id, path);
    };
    img.src = path;
  }
}

// Update product images in the DOM
function updateProductImages(productId, newPath) {
  document.querySelectorAll(`.product-card[data-product-id="${productId}"] img`).forEach(img => {
    img.src = newPath;
  });
}

// Display products in the products grid
function displayProducts() {
  const productsGrid = document.getElementById('products-grid');
  if (!productsGrid) return;
  
  let tag = "";


  productsGrid.innerHTML = '';
  
 products.forEach(product => {
    const productCard = document.createElement('div');
    productCard.className = 'product-card';
    productCard.setAttribute('data-product-id', product.id);
    
    productCard.innerHTML = `
    <p style="font-size:12px; margin-top:5px; font-weight:600;">${tag}</p>
      <div class="product-image">
        <img src="${product.image}" alt="${product.name}" 
             onerror="this.onerror=null; this.src='/api/placeholder/150/150'; console.log('Using placeholder for ${product.name}');">
      </div>
      <div class="product-info">
        <h3>${product.name}</h3>
        <p class="product-description">${product.description}</p>
  <div class="product-price">₹${product.price.toLocaleString()}</div>

<p class="stock ${
  product.stock === 0 ? 'out-stock' : product.stock <= 3 ? 'low-stock' : 'in-stock'
}">
  ${
    product.stock === 0
      ? "❌ Out of Stock"
      : product.stock <= 3
      ? `⚠ Only ${product.stock} left`
      : `✔ ${product.stock} in stock`
  }
</p>

<button class="btn add-to-cart" data-product-id="${product.id}"
  ${product.stock === 0 ? "disabled" : ""}>
  <i class="fas fa-cart-plus"></i> 
  ${product.stock === 0 ? "Out of Stock" : "Add to Cart"}
</button>
    `;
    
    productsGrid.appendChild(productCard);
  }); 

}

// Setup all event listeners
function setupEventListeners() {
  // Add to cart buttons
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('add-to-cart') || 
        e.target.parentElement.classList.contains('add-to-cart')) {
      const button = e.target.classList.contains('add-to-cart') ? 
                     e.target : e.target.parentElement;
      const productId = parseInt(button.getAttribute('data-product-id'));
      addToCart(productId);
      showModal('Success', 'Item added to cart!', 'success');
    }
  });
  
  // Category cards
  document.querySelectorAll('.category-card').forEach(card => {
    card.addEventListener('click', function() {
      const category = this.getAttribute('data-category');
      filterProductsByCategory(category);
    });
  });
  
  // Payment method selection
  document.querySelectorAll('input[name="payment-method"]').forEach(input => {
    input.addEventListener('change', function() {
      document.querySelectorAll('.payment-details').forEach(details => {
        details.style.display = 'none';
      });
      
      const method = this.value;
      document.getElementById(`${method}-details`).style.display = 'block';
    });
  });
  
  // Form submissions
  document.getElementById('shipping-form').addEventListener('submit', function(e) {
    e.preventDefault();
    proceedToPayment();
  });
  
  document.getElementById('payment-form').addEventListener('submit', function(e) {
    e.preventDefault();
    placeOrder();
  });
  
  // Back button in payment
  document.getElementById('payment-back-btn').addEventListener('click', function() {
    document.getElementById('payment').classList.add('hide-section');
    document.getElementById('checkout').classList.remove('hide-section');
  });
  
  // Download invoice
  document.getElementById('download-invoice').addEventListener('click', function() {
    generatePDF();
  });
  
  // Modal close
  document.querySelector('.modal-close').addEventListener('click', function() {
    document.getElementById('modal').style.display = 'none';
  });
  
  document.getElementById('modal-button').addEventListener('click', function() {
    document.getElementById('modal').style.display = 'none';
  });
  
  // Checkout button
  document.getElementById('checkout-btn').addEventListener('click', function() {
    if (cart.length === 0) {
      showModal('Error', 'Your cart is empty!', 'error');
      return;
    }

    
    document.getElementById('cart').classList.add('hide-section');
    document.getElementById('checkout').classList.remove('hide-section');
    window.location.hash = 'checkout';
  });
}

// Filter products by category
function filterProductsByCategory(category) {
  const productsGrid = document.getElementById('products-grid');
  productsGrid.innerHTML = '';
  
  const filteredProducts = category === 'all' ? 
                          products : 
                          products.filter(product => product.category === category);
  
  filteredProducts.forEach(product => {
    const productCard = document.createElement('div');
    productCard.className = 'product-card';
    productCard.setAttribute('data-product-id', product.id);

    let tag = "";

    
    productCard.innerHTML = `
      <div class="product-image">
        <img src="${product.image}" alt="${product.name}" 
             onerror="this.onerror=null; this.src='/api/placeholder/150/150'; console.log('Using placeholder for ${product.name}');">
      </div>
      <div class="product-info">
        <h3>${product.name}</h3>
        <p class="product-description">${product.description}</p>
        <div class="product-price">₹${product.price.toLocaleString()}</div>
        <button class="btn add-to-cart" data-product-id="${product.id}">
          <i class="fas fa-cart-plus"></i> Add to Cart
        </button>
      </div>
    `;
    
    productsGrid.appendChild(productCard);
  });
  
  // Scroll to products section
  document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
}

// Add product to cart
function addToCart(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return;

  const existingItem = cart.find(item => item.id === productId);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1
    });
  }

  // 🔥 SAVE TO STORAGE
  localStorage.setItem("cart", JSON.stringify(cart));

  updateCartBadge();
  displayCart();
}

// Update cart badge
function updateCartBadge() {
  const cartBadge = document.getElementById('cart-badge');
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
  cartBadge.textContent = totalItems;
}

// Display cart items
function displayCart() {
  const cartItemsContainer = document.getElementById('cart-items');
  const cartTotal = document.getElementById('cart-total');
  
  if (!cartItemsContainer || !cartTotal) return;
  
   cartItemsContainer.innerHTML = '';
  
  if (cart.length === 0) {
    cartItemsContainer.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
    cartTotal.textContent = 'Total: ₹0';
    return;
  }
  
  let totalAmount = 0;
  
  cart.forEach(item => {
    const itemTotal = item.price * item.quantity;
    totalAmount += itemTotal;
    
    const cartItem = document.createElement('div');
    cartItem.className = 'cart-item';
    
    cartItem.innerHTML = `
      <div class="cart-item-image">
        <img src="${item.image}" alt="${item.name}" 
             onerror="this.onerror=null; this.src='/api/placeholder/80/80'; console.log('Using placeholder in cart for ${item.name}');">
      </div>
      <div class="cart-item-details">
        <h4>${item.name}</h4>
        <div class="cart-item-price">₹${item.price.toLocaleString()}</div>
      </div>
      <div class="cart-item-quantity">
        <button class="quantity-btn decrease" data-product-id="${item.id}">-</button>
        <span>${item.quantity}</span>
        <button class="quantity-btn increase" data-product-id="${item.id}">+</button>
      </div>
      <div class="cart-item-total">
        ₹${itemTotal.toLocaleString()}
      </div>
      <button class="remove-item" data-product-id="${item.id}">
        <i class="fas fa-trash"></i>
      </button>
    `;
    
    cartItemsContainer.appendChild(cartItem);
    
    // Add event listeners for quantity buttons
    
  cartItem.querySelector('.decrease').addEventListener('click', function() {
  const id = parseInt(this.getAttribute("data-product-id"));
  updateQuantity(id, -1);
});

cartItem.querySelector('.increase').addEventListener('click', function() {
  const id = parseInt(this.getAttribute("data-product-id"));
  updateQuantity(id, 1);
});

cartItem.querySelector('.remove-item').addEventListener('click', function() {
  const id = parseInt(this.getAttribute("data-product-id"));
  removeItem(id);
});
  });
  
  cartTotal.textContent = `Total: ₹${totalAmount.toLocaleString()}`;
  
  // Update order summary in payment section
  updateOrderSummary();
}

// Update item quantity
function updateQuantity(productId, change) {
  const itemIndex = cart.findIndex(item => item.id === productId);
  
  if (itemIndex === -1) return;
  
  cart[itemIndex].quantity += change;
  
  if (cart[itemIndex].quantity <= 0) {
    cart.splice(itemIndex, 1);
  }

  // 🔥 ADD THIS LINE
  localStorage.setItem("cart", JSON.stringify(cart));

  updateCartBadge();
  displayCart();
}
// Remove item from cart
function removeItem(productId) {
  cart = cart.filter(item => item.id !== productId);

  // 🔥 ADD THIS LINE
  localStorage.setItem("cart", JSON.stringify(cart));

  updateCartBadge();
  displayCart();
}

// Update order summary
function updateOrderSummary() {
  const orderItems = document.getElementById('order-items');
  const orderSubtotal = document.getElementById('order-subtotal');
  const orderTax = document.getElementById('order-tax');
  const orderFinalTotal = document.getElementById('order-final-total');
  
  if (!orderItems || !orderSubtotal || !orderTax || !orderFinalTotal) return;
  
  orderItems.innerHTML = '';
  
  let subtotal = 0;
  
  cart.forEach(item => {
    const itemTotal = item.price * item.quantity;
    subtotal += itemTotal;
    
    const orderItem = document.createElement('div');
    orderItem.className = 'order-item';
    
    orderItem.innerHTML = `
      <div class="order-item-name">
        ${item.name} x ${item.quantity}
      </div>
      <div class="order-item-price">
        ₹${itemTotal.toLocaleString()}
      </div>
    `;
    
    orderItems.appendChild(orderItem);
  });
  
  const tax = Math.round(subtotal * 0.18);
  const shipping = 100;
  const total = subtotal + tax + shipping;
  
  orderSubtotal.textContent = `₹${subtotal.toLocaleString()}`;
  orderTax.textContent = `₹${tax.toLocaleString()}`;
  orderFinalTotal.textContent = `₹${total.toLocaleString()}`;
}

// Proceed to payment section
function proceedToPayment() {
  // Save shipping details
  const shippingDetails = {
    fullName: document.getElementById('full-name').value,
    email: document.getElementById('email').value,
    phone: document.getElementById('phone').value,
    address: document.getElementById('address').value,
    city: document.getElementById('city').value,
    state: document.getElementById('state').value,
    pincode: document.getElementById('pincode').value,
    country: document.getElementById('country').value
  };
  
  // Save to session storage
  sessionStorage.setItem('shippingDetails', JSON.stringify(shippingDetails));
  
  // Hide checkout section and show payment section
  document.getElementById('checkout').classList.add('hide-section');
  document.getElementById('payment').classList.remove('hide-section');
  
  // Update order summary
  updateOrderSummary();
  
  // Scroll to payment section
  window.location.hash = 'payment';
}

// Place order
function placeOrder() {
  // Get payment method
  const paymentMethod = document.querySelector('input[name="payment-method"]:checked').value;
  
  // Get shipping details from session storage
  const shippingDetails = JSON.parse(sessionStorage.getItem('shippingDetails'));
  
  // Create order object
const orderId = "ORD" + Date.now();

const order = {
  id: orderId,
  date: new Date().toLocaleDateString('en-IN', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }),
  customer: shippingDetails,
  items: cart,
  paymentMethod: getPaymentMethodName(paymentMethod),
  subtotal: cart.reduce((total, item) => total + (item.price * item.quantity), 0),
  shipping: 100,
  tax: Math.round(cart.reduce((total, item) => total + (item.price * item.quantity), 0) * 0.18)
};
  
  // Calculate total
  order.total = order.subtotal + order.shipping + order.tax;
  
  // Save order to session storage
  sessionStorage.setItem('currentOrder', JSON.stringify(order));
  
  // Save order to Firebase
  saveOrderToFirebase(order);
  
  // Update confirmation page
  updateConfirmationPage(order);
  
  // Hide payment section and show confirmation section
  document.getElementById('payment').classList.add('hide-section');
  document.getElementById('order-confirmation').classList.remove('hide-section');
  
  // Clear cart
 cart = [];

// 🔥 CLEAR STORAGE ALSO
localStorage.removeItem("cart");

updateCartBadge();
displayCart();
  
  // Scroll to confirmation section
  window.location.hash = 'order-confirmation';
  
  // Show success modal
  showModal('Success', 'Your order has been placed successfully!', 'success');
}

// Get payment method name
function getPaymentMethodName(method) {
  switch(method) {
    case 'upi':
      return 'UPI';
    case 'credit-card':
      return 'Credit/Debit Card';
    case 'net-banking':
      return 'Net Banking';
    case 'cod':
      return 'Cash on Delivery';
    default:
      return 'Unknown';
  }
}

// Save order to Firebase
async function saveOrderToFirebase(order) {
  try {
    await addDoc(collection(db, "orders"), order);
    console.log("Order saved successfully");
  } catch (error) {
    console.error("Error saving order:", error);
  }
}
    
    // Reference to collections
   

// Update confirmation page
function updateConfirmationPage(order) {
  // Update order info
  document.getElementById('order-id').textContent = order.id;
  document.getElementById('order-date').textContent = order.date;
  document.getElementById('conf-payment-method').textContent = order.paymentMethod;
  
  // Update customer info
  document.getElementById('conf-name').textContent = order.customer.fullName;
  document.getElementById('conf-email').textContent = order.customer.email;
  document.getElementById('conf-phone').textContent = order.customer.phone;
  
  // Update shipping address
  document.getElementById('conf-address').textContent = `${order.customer.address}, ${order.customer.city}, ${order.customer.state}, ${order.customer.pincode}, ${order.customer.country}`;
  
  // Update invoice items
  const invoiceItems = document.getElementById('invoice-items');
  invoiceItems.innerHTML = '';
  
  order.items.forEach(item => {
    const itemTotal = item.price * item.quantity;
    
    const invoiceItem = document.createElement('div');
    invoiceItem.className = 'invoice-item invoice-row';
    
    invoiceItem.innerHTML = `
      <span>${item.name} x ${item.quantity}</span>
      <span>₹${itemTotal.toLocaleString()}</span>
    `;
    
    invoiceItems.appendChild(invoiceItem);
  });
  
  // Update invoice totals
  document.getElementById('invoice-subtotal').textContent = `₹${order.subtotal.toLocaleString()}`;
  document.getElementById('invoice-shipping').textContent = `₹${order.shipping.toLocaleString()}`;
  document.getElementById('invoice-tax').textContent = `₹${order.tax.toLocaleString()}`;
  document.getElementById('invoice-total').textContent = `₹${order.total.toLocaleString()}`;
  
  // Update invoice template
  updateInvoiceTemplate(order);
}

// Update invoice template for PDF generation
function updateInvoiceTemplate(order) {
  // Update invoice number and date
  document.getElementById('invoice-number').textContent = order.id;
  document.getElementById('invoice-date').textContent = order.date;
  
  // Update customer info
  document.getElementById('invoice-customer-name').textContent = order.customer.fullName;
  document.getElementById('invoice-customer-address').textContent = `${order.customer.address}, ${order.customer.city}, ${order.customer.state}, ${order.customer.pincode}, ${order.customer.country}`;
  document.getElementById('invoice-customer-phone').textContent = order.customer.phone;
  document.getElementById('invoice-customer-email').textContent = order.customer.email;
  
  // Update payment info
  document.getElementById('invoice-payment-method').textContent = order.paymentMethod;
  document.getElementById('invoice-order-date').textContent = order.date;
  document.getElementById('invoice-order-id').textContent = order.id;
  
  // Update invoice items
  const invoiceItemsList = document.getElementById('invoice-items-list');
  invoiceItemsList.innerHTML = '';
  
  order.items.forEach(item => {
    const itemTotal = item.price * item.quantity;
    
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${item.name}</td>
      <td>₹${item.price.toLocaleString()}</td>
      <td>${item.quantity}</td>
      <td>₹${itemTotal.toLocaleString()}</td>
    `;
    
    invoiceItemsList.appendChild(tr);
  });
  
  // Update invoice totals
  document.getElementById('invoice-template-subtotal').textContent = `₹${order.subtotal.toLocaleString()}`;
  document.getElementById('invoice-template-shipping').textContent = `₹${order.shipping.toLocaleString()}`;
  document.getElementById('invoice-template-tax').textContent = `₹${order.tax.toLocaleString()}`;
  document.getElementById('invoice-template-total').textContent = `₹${order.total.toLocaleString()}`;
}

// Generate PDF invoice
function generatePDF() {
  // Check if jsPDF is available
  if (typeof window.jspdf === 'undefined') {
    console.error("jsPDF is not loaded. Cannot generate PDF.");
    showModal('Error', 'PDF generation failed. jsPDF library not loaded.', 'error');
    return;
  }
  
  const { jsPDF } = window.jspdf;
  
  // Get the invoice template
  const invoiceElement = document.getElementById('invoice-template');
  
  // Show the invoice template temporarily
  invoiceElement.style.display = 'block';
  
  // Generate PDF
  html2canvas(invoiceElement, {
    scale: 2,
    logging: false,
    useCORS: true
  }).then(canvas => {
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    
    // Download PDF
    pdf.save(`invoice-${currentOrderId}.pdf`);
    
    // Hide the invoice template again
    invoiceElement.style.display = 'none';
  }).catch(err => {
    console.error("Error generating PDF:", err);
    showModal('Error', 'PDF generation failed. Please try again.', 'error');
    // Hide the invoice template in case of error
    invoiceElement.style.display = 'none';
  });
}

// Show modal
function showModal(title, message, type) {
  const modal = document.getElementById('modal');
  const modalTitle = document.getElementById('modal-title');
  const modalMessage = document.getElementById('modal-message');
  const successIcon = document.querySelector('.success-icon');
  const errorIcon = document.querySelector('.error-icon');
  
  modalTitle.textContent = title;
  modalMessage.textContent = message;
  
  if (type === 'success') {
    successIcon.style.display = 'block';
    errorIcon.style.display = 'none';
  } else {
    successIcon.style.display = 'none';
    errorIcon.style.display = 'block';
  }
  
  modal.style.display = 'flex';
  
  // Auto close after 3 seconds
  setTimeout(() => {
    modal.style.display = 'none';
  }, 3000);
}  

// Toggle chat
window.toggleChat = function () {
  const chat = document.getElementById("chatbot");

  if (chat.classList.contains("hidden")) {
    chat.classList.remove("hidden");
  } else {
    chat.classList.add("hidden");
  }
};

window.sendMessage = function (text) {
  const chatBody = document.getElementById("chat-body");

  // User message
  const userMsg = document.createElement("div");
  userMsg.className = "user-msg";
  userMsg.innerText = text;
  chatBody.appendChild(userMsg);

  // Bot reply
  const botMsg = document.createElement("div");
  botMsg.className = "bot-msg";

  if (text.includes("Where")) {
    botMsg.innerText = "📦 Your order is being processed and will arrive soon.";
  } else if (text.includes("late")) {
    botMsg.innerText = "⏳ Your order may be delayed by 1-2 days.";
  } else if (text.includes("Cancel")) {
    botMsg.innerText = "❌ You can cancel your order from your profile.";
  } else if (text.includes("Payment")) {
    botMsg.innerText = "💳 Please try again or use Cash on Delivery.";
  } else {
    botMsg.innerText = "🤖 Sorry, I didn’t understand.";
  }

  chatBody.appendChild(botMsg);

  // Auto scroll
  chatBody.scrollTop = chatBody.scrollHeight;
};

window.saveVehicle = function(){
  const input = document.getElementById("vehicle-input").value.toLowerCase();

  if(!input){
    alert("Please enter your vehicle");
    return;
  }

  userVehicle = input;
  localStorage.setItem("vehicle", userVehicle);

  alert("Vehicle saved! Showing best matches 🚗");

  displayProducts(); // refresh products
};  


// 🚗 Open/Close Modal
window.openCarHelper = function () {
  document.getElementById("car-helper-modal").style.display = "flex";
};

window.closeCarHelper = function () {
  document.getElementById("car-helper-modal").style.display = "none";
};

// 🚗 Apply selection
window.applyCarSelection = function () {

  const car = document.getElementById("car-select").value;

  if (!car) {
    showModal("Error", "Please select your car!", "error");
    return;
  }

  // Get selected products
  const selected = [];
  document.querySelectorAll('#product-options input:checked').forEach(cb => {
    selected.push(parseInt(cb.value));
  });

  if (selected.length === 0) {
    showModal("Error", "Please select at least one product!", "error");
    return;
  }

  // Filter and show selected products
  const productsGrid = document.getElementById('products-grid');
  productsGrid.innerHTML = '';

  const filtered = products.filter(p => selected.includes(p.id));

  filtered.forEach(product => {
    const productCard = document.createElement('div');
    productCard.className = 'product-card';

    productCard.innerHTML = `
      <div class="product-image">
        <img src="${product.image}">
      </div>
      <div class="product-info">
        <h3>${product.name}</h3>
        <p>${product.description}</p>
        <div class="product-price">₹${product.price}</div>

        <button class="btn add-to-cart" data-product-id="${product.id}">
          Add to Cart
        </button>
      </div>
    `;

    productsGrid.appendChild(productCard);
  });

  // Scroll to products
  document.getElementById('products').scrollIntoView({ behavior: 'smooth' });

  // Close modal
  closeCarHelper();

  // 🎯 Show recommendation popup
  showModal(
    "Recommended",
    `These products are recommended for your ${car.toUpperCase()} 🚗`,
    "success"
  );
};