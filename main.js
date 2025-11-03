const API = "https://69080b1eb49bea95fbf23575.mockapi.io/api/v1/products";

const productsContainer = document.getElementById("products");
const likedContainer = document.getElementById("likedProducts");
const cartContainer = document.getElementById("cartProducts");
const addForm = document.getElementById("addForm");

let liked = JSON.parse(localStorage.getItem("liked")) || [];
let cart = JSON.parse(localStorage.getItem("cart")) || [];

let editMode = false;
let editId = null;

// 🧩 Like va Cart counter
function updateCounters() {
  const likeCount = document.getElementById("likeCount");
  const cartCount = document.getElementById("cartCount");
  if (likeCount) likeCount.textContent = liked.length;
  if (cartCount) cartCount.textContent = cart.length;
}

// ---------------- MAHSULOTLARNI O‘QISH ----------------
async function getProducts() {
  try {
    const res = await fetch(API);
    const data = await res.json();
    renderProducts(data);
    renderLiked(data);
    renderCart(data);
  } catch (err) {
    console.error("Xatolik:", err);
  }
}

// ---------------- MAHSULOTLARNI CHIZISH ----------------
function renderProducts(data) {
  if (!productsContainer) return;
  productsContainer.innerHTML = "";

  data.forEach((item) => {
    const img = item.image || "https://via.placeholder.com/200";
    const name = item.name;
    const price = item.price;
    const isLiked = liked.includes(item.id);
    const inCart = cart.includes(item.id);

    const card = document.createElement("div");
    card.className =
      "bg-white rounded-xl shadow-md p-4 flex flex-col justify-between hover:shadow-lg";

    if (addForm) {
      // ADMIN PANEL
      card.innerHTML = `
        <img src="${item.img}" class="w-full h-48 object-contain bg-gray-50 mb-3" />
        <h2 class="text-lg font-semibold">${name}</h2>
        <p class="text-gray-600 mb-3">${price} so'm</p>
        <div class="flex gap-2">
          <button onclick="startEdit('${item.id}','${name}','${img}','${price}')" class="bg-yellow-500 text-white px-3 py-1 rounded">✏️ Edit</button>
          <button onclick="deleteProduct('${item.id}')" class="bg-red-500 text-white px-3 py-1 rounded">🗑️ Delete</button>
        </div>
      `;
    } else {
      // ASOSIY SAHIFA
      card.innerHTML = `
        <img src="${item.img}" class="w-full h-48 object-contain bg-gray-50 mb-3" />
        <h2 class="text-lg font-semibold">${name}</h2>
        <p class="text-gray-600 mb-3">${price} so'm</p>
        <div class="flex justify-between items-center">
          <button onclick="toggleLike('${item.id}')" class="text-2xl ${isLiked ? 'text-red-500' : 'text-gray-400'}">❤️</button>
          <button onclick="addToCart('${item.id}')" class="bg-blue-500 text-white px-3 py-1 rounded">${inCart ? '✅ Savatda' : '🛒 Savatga'}</button>
        </div>
      `;
    }

    productsContainer.appendChild(card);
  });
  updateCounters();
}

// ---------------- LIKE VA SAVAT SAHIFALARI ----------------
function renderLiked(data) {
  if (!likedContainer) return;
  likedContainer.innerHTML = "";

  const likedItems = data.filter((x) => liked.includes(x.id));
  if (likedItems.length === 0) {
    likedContainer.innerHTML =
      "<p class='text-gray-600 col-span-full'>❤️ Hozircha yoqtirilgan mahsulot yo‘q.</p>";
    return;
  }

  likedItems.forEach((item) => {
    likedContainer.innerHTML += `
      <div class="bg-white p-4 rounded-xl shadow">
        <img src="${item.img}" class="w-full h-48 object-contain mb-3" />
        <h2 class="font-semibold">${item.name}</h2>
        <p>${item.price} so'm</p>
      </div>
    `;
  });
}

function renderCart(data) {
  if (!cartContainer) return;
  cartContainer.innerHTML = "";

  const cartItems = data.filter((x) => cart.includes(x.id));
  if (cartItems.length === 0) {
    cartContainer.innerHTML =
      "<p class='text-gray-600 col-span-full'>🛒 Savat bo‘sh.</p>";
    return;
  }

  cartItems.forEach((item) => {
    cartContainer.innerHTML += `
      <div class="bg-white p-4 rounded-xl shadow">
        <img src="${item.image}" class="w-full h-48 object-contain mb-3" />
        <h2 class="font-semibold">${item.name}</h2>
        <p>${item.price} so'm</p>
      </div>
    `;
  });
}

// ---------------- LIKE & SAVAT FUNKSIYALARI ----------------
function toggleLike(id) {
  if (liked.includes(id)) liked = liked.filter((x) => x !== id);
  else liked.push(id);
  localStorage.setItem("liked", JSON.stringify(liked));
  getProducts();
}

function addToCart(id) {
  if (!cart.includes(id)) cart.push(id);
  else alert("Bu mahsulot allaqachon savatda!");
  localStorage.setItem("cart", JSON.stringify(cart));
  getProducts();
}

// ---------------- ADMIN PANEL FUNKSIYALARI ----------------
if (addForm) {
  addForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("name").value.trim();
    const image = document.getElementById("image").value.trim();
    const price = document.getElementById("price").value.trim();

    if (!name || !image || !price) return alert("Barcha maydon to‘ldirilsin!");

    const newProduct = { name, image, price };
    if (editMode) {
      await fetch(`${API}/${editId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProduct),
      });
      editMode = false;
      editId = null;
    } else {
      await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProduct),
      });
    }

    addForm.reset();
    getProducts();
  });
}

function startEdit(id, name, image, price) {
  document.getElementById("name").value = name;
  document.getElementById("image").value = image;
  document.getElementById("price").value = price;
  editMode = true;
  editId = id;
}

async function deleteProduct(id) {
  if (confirm("Haqiqatan ham o‘chirmoqchimisiz?")) {
    await fetch(`${API}/${id}`, { method: "DELETE" });
    getProducts();
  }
}

// ---------------- SAHIFA YUKLANGANDA ----------------
getProducts();
updateCounters();
