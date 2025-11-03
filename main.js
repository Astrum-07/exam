

const API = "https://69080b1eb49bea95fbf23575.mockapi.io/api/v1/products";

const productsContainer = document.getElementById("products");
const likedContainer = document.getElementById("likedProducts");
const cartContainer = document.getElementById("cartProducts");
const addForm = document.getElementById("addForm");

let liked = JSON.parse(localStorage.getItem("liked")) || [];
let cart = JSON.parse(localStorage.getItem("cart")) || [];

let editMode = false;
let editId = null;


function updateCounters() {
  const likeCount = document.getElementById("likeCount");
  const cartCount = document.getElementById("cartCount");
  const totalItems = cart.reduce((sum, item) => sum + item.count, 0);

  if (likeCount) likeCount.textContent = liked.length;
  if (cartCount) cartCount.textContent = totalItems;
}


function getCartItem(id) {
  return cart.find(item => String(item.id) === String(id));
}


async function getProducts() {
  try {
    const res = await fetch(API);
    const data = await res.json();
    renderProducts(data);
    renderLiked(data);
    renderCart(data);
    updateCounters();
  } catch (err) {
    console.error("API xatosi:", err);
  }
}


function toggleLike(id) {
  const idStr = String(id);
  liked = liked.includes(idStr)
    ? liked.filter(x => x !== idStr)
    : [...liked, idStr];
  localStorage.setItem("liked", JSON.stringify(liked));
  getProducts();
}


function addToCart(id) {
  const idStr = String(id);
  const item = getCartItem(idStr);
  if (item) {
    item.count += 1;
  } else {
    cart.push({ id: idStr, count: 1 });
  }
  localStorage.setItem("cart", JSON.stringify(cart));
  getProducts();
}

function increaseCart(id) {
  const idStr = String(id);
  const item = getCartItem(idStr);
  if (item) {
    item.count += 1;
    localStorage.setItem("cart", JSON.stringify(cart));
    getProducts();
  }
}

function decreaseCart(id) {
  const idStr = String(id);
  const item = getCartItem(idStr);
  if (item && item.count > 1) {
    item.count -= 1;
  } else {
    cart = cart.filter(x => String(x.id) !== idStr);
  }
  localStorage.setItem("cart", JSON.stringify(cart));
  getProducts();
}

function removeFromCart(id) {
  const idStr = String(id);
  if (confirm("Savatdan o‘chirishni xohlaysizmi?")) {
    cart = cart.filter(x => String(x.id) !== idStr);
    localStorage.setItem("cart", JSON.stringify(cart));
    getProducts();
  }
}


function renderProducts(data) {
  if (!productsContainer) return;
  productsContainer.innerHTML = "";

  data.forEach(item => {
    const id = String(item.id);
    const name = item.name || "Noma'lum mahsulot";
    const price = item.price || 0;
    const img = (item.img || item.image || "https://via.placeholder.com/200").trim();

    const isLiked = liked.includes(id);
    const cartItem = getCartItem(id);
    const cartCount = cartItem ? cartItem.count : 0;

    const card = document.createElement("div");
    card.className = "bg-white rounded-xl shadow-md p-4 flex flex-col justify-between hover:shadow-lg transition";

    if (addForm) {

      card.innerHTML = `
        <img src="${item.img}" class="w-full h-48 object-contain bg-gray-50 mb-3 rounded" alt="${name}" />
        <h2 class="text-lg font-semibold truncate">${item.name}</h2>
        <p class="text-gray-600 mb-3">${item.price.toLocaleString()} so'm</p>
        <div class="flex gap-2">
          <button onclick="startEdit('${item.id}','${name.replace(/'/g, "\\'")}','${img.replace(/'/g, "\\'")}','${price}')" class="bg-yellow-500 text-white px-3 py-1 rounded text-sm">Edit</button>
          <button onclick="deleteProduct('${id}')" class="bg-red-500 text-white px-3 py-1 rounded text-sm">Delete</button>
        </div>
      `;
    } else {

      card.innerHTML = `
        <img src="${img}" class="w-full h-48 object-contain bg-gray-50 mb-3 rounded" alt="${name}" />
        <h2 class="text-lg font-semibold truncate">${name}</h2>
        <p class="text-gray-600 mb-3">${price.toLocaleString()} so'm</p>
        <div class="flex justify-between items-center gap-4">
          <button onclick="toggleLike('${id}')" class="text-2xl ${isLiked ? 'text-red-500' : 'text-gray-400'} hover:scale-110 transition">❤️</button>
          <div class="flex items-center gap-2">
            ${cartCount > 0 ? `
              <button onclick="decreaseCart('${id}')" class="bg-gray-200 text-sm px-2 py-1 rounded-l hover:bg-gray-300">−</button>
              <span class="bg-gray-100 px-3 py-1 text-sm font-medium">${cartCount}</span>
              <button onclick="increaseCart('${id}')" class="bg-gray-200 text-sm px-2 py-1 rounded-r hover:bg-gray-300">+</button>
            ` : `
              <button onclick="addToCart('${id}')" class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition text-sm flex items-center gap-1">
                <i class="fa-solid fa-cart-shopping"></i> Savatga
              </button>
            `}
          </div>
        </div>
      `;
    }
    productsContainer.appendChild(card);
  });
}


function renderLiked(data) {
  if (!likedContainer) return;
  likedContainer.innerHTML = "";

  const likedItems = data.filter(x => liked.includes(String(x.id)));
  if (likedItems.length === 0) {
    likedContainer.innerHTML = `
      <div class="col-span-full bg-white rounded-xl p-12 text-center shadow-md">
        <i class="fa-solid fa-heart text-6xl text-gray-300 mb-4"></i>
        <h3 class="text-xl font-semibold text-gray-600 mb-2">Yoqtirilganlar bo'sh</h3>
        <p class="text-gray-500">Birinchi mahsulotni yoqtirib ko'ring!</p>
      </div>
    `;
    return;
  }

  likedItems.forEach(item => {
    const id = String(item.id);
    const name = item.name || "Noma'lum";
    const price = item.price || 0;
    const img = (item.img || item.image || "https://via.placeholder.com/200").trim();

    likedContainer.innerHTML += `
      <div class="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
        <img src="${img}" class="w-full h-48 object-contain bg-gray-50 rounded-lg mb-4" alt="${name}" />
        <h3 class="font-semibold text-lg mb-2 truncate">${name}</h3>
        <p class="text-blue-600 font-medium">${price.toLocaleString()} so'm</p>
        <button onclick="toggleLike('${id}')" class="mt-4 w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition">
          Yoqtirilganlardan olib tashlash
        </button>
      </div>
    `;
  });
}


function renderCart(data) {
  if (!cartContainer) return;
  cartContainer.innerHTML = "";

  let totalPrice = 0;
  let totalItems = 0;

  if (cart.length === 0) {
    cartContainer.innerHTML = `
      <div class="col-span-full bg-white rounded-2xl p-16 text-center shadow-xl border-2 border-dashed border-gray-200">
        <i class="fa-solid fa-cart-shopping text-8xl text-gray-200 mb-6"></i>
        <h3 class="text-2xl font-bold text-gray-700 mb-3">Savat bo'sh</h3>
        <p class="text-gray-500 text-lg mb-8">Birinchi mahsulotni savatga qo'shing!</p>
        <a href="index.html" class="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-bold hover:shadow-lg transition-all">
          Xarid qilish
        </a>
      </div>
    `;
  } else {
    cart.forEach(cartItem => {
      const product = data.find(p => String(p.id) === String(cartItem.id));
      if (!product) {
        console.warn("Mahsulot topilmadi savatda:", cartItem.id);
        return;
      }

      const id = String(product.id);
      const name = product.name || "Noma'lum";
      const price = product.price || 0;
      const img = (product.img || product.image || "https://via.placeholder.com/100").trim();

      const itemTotal = price * cartItem.count;
      totalPrice += itemTotal;
      totalItems += cartItem.count;

      cartContainer.innerHTML += `
        <div class="bg-white rounded-2xl shadow-md p-4 hover:shadow-xl hover:-translate-y-1 transition-all border border-gray-100 flex flex-col h-full">
          <div class="w-full h-28 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl mb-3 flex items-center justify-center overflow-hidden">
            <img src="${img}" class="w-20 h-20 object-contain hover:scale-110 transition-transform" alt="${name}" />
          </div>
          <div class="space-y-2 flex-1">
            <h3 class="font-bold text-sm line-clamp-2 leading-tight">${name}</h3>
            <p class="text-xs text-gray-500">${price.toLocaleString()} so'm × ${cartItem.count}</p>
            <p class="text-lg font-bold text-blue-600">${itemTotal.toLocaleString()} so'm</p>
          </div>
          <div class="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
            <div class="flex items-center gap-1 bg-gray-50 p-1 rounded-lg">
              <button onclick="decreaseCart('${id}')" class="w-7 h-7 bg-white rounded-md shadow-sm hover:bg-gray-100 text-sm font-bold">−</button>
              <span class="w-7 text-center text-sm font-bold">${cartItem.count}</span>
              <button onclick="increaseCart('${id}')" class="w-7 h-7 bg-white rounded-md shadow-sm hover:bg-gray-100 text-sm font-bold">+</button>
            </div>
            <button onclick="removeFromCart('${id}')" class="text-red-500 hover:text-red-700 text-sm">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </div>
      `;
    });
  }


  const totalEl = document.getElementById("totalPrice");
  if (totalEl) {
    totalEl.classList.toggle("hidden", cart.length === 0);
    totalEl.innerHTML = `
      <div class="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl shadow-lg border">
        <div class="flex justify-between items-center mb-4">
          <span class="text-lg font-semibold">Jami (${totalItems} ta):</span>
          <span class="text-3xl font-bold text-blue-600">${totalPrice.toLocaleString()} so'm</span>
        </div>
        <button class="w-full  from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-bold hover:shadow-xl transition-all flex items-center justify-center gap-2">
          To'lovga o'tish
        </button>
      </div>
    `;
  }
}


if (addForm) {
  addForm.addEventListener("submit", async e => {
    e.preventDefault();
    const name = document.getElementById("name").value.trim();
    const image = document.getElementById("image").value.trim();
    const price = document.getElementById("price").value.trim();

    if (!name || !image || !price) return alert("Barcha maydonlar to'ldirilsin!");

    const product = { name, img: image, price: +price };
    if (editMode && editId) {
      await fetch(`${API}/${editId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product)
      });
      editMode = false;
      editId = null;
      document.getElementById("addBtn").textContent = "Yangi qo'shish";
    } else {
      await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product)
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
  document.getElementById("addBtn").textContent = "Saqlash";
}

async function deleteProduct(id) {
  if (confirm("O'chirishni xohlaysizmi?")) {
    await fetch(`${API}/${id}`, { method: "DELETE" });
    getProducts();
  }
}


getProducts();