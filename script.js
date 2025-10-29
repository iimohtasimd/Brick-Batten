/* ===== Helpers ===== */
const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
const formatINR = n => '₹' + n.toLocaleString('en-IN');

/* ===== Product catalog (12 items) - prices in INR ===== */
const PRODUCTS = [
  { id: 1, title: "MATTE BLACK CENTURY EXTERIOR LEVER WITH DEADBOLT ENTRY SET", price: 2436, image: "first.jpeg" },
  { id: 2, title: "AGED BRONZE MISSION DOOR", price: 6636, image: "second.jpeg" },
  { id: 3, title: "Modern AVALOON DOOR KNOCKER", price: 12516, image: "third.jpeg" },
  { id: 4, title: "ACORN SMOOTH S SHUTTER HOLDBACK", price: 3276, image: "fouth.jpeg" },
  { id: 5, title: "NEUTRA HOUSE NUMBER", price: 9144, image: "5th.jpeg" },
  { id: 6, title: "WELCOME HOME YARD SIGN", price: 2100, image: "sixth.jpeg" },
  { id: 7, title: "MALONE POST-MOUNTED MAILBOX OPTIONAL POLE", price: 7476, image: "seventh.jpeg" },
  { id: 8, title: "CUBBY WALL-MOUNTED MAILBOX", price: 1596, image: "8th.jpeg" },
  { id: 9, title: "MODERN OBELISK MEDIUM SCONCE", price: 8320, image: "9th.jpeg" },
  { id: 10, title: "LAKEIEW ELYSIAN 36-INCH ROUND PROPANE FIRE TABLE", price: 2800, image: "10th.png" },
  { id: 11, title: "HULA SIDE TABLE", price: 6200, image: "11th.jpeg" },
  { id: 12, title: "HANGING RATTAN BENCH", price: 5200, image: "12th.png" },
  { id: 13, title: "PVC CELLING PANEL PIECE", price: 120, image: "13th.jpg" },
  { id: 14, title: "VOX PVC CELLING", price: 300, image: "14th.webp" },
  { id: 15, title: "CORRUGATED ROOFING SHEET/PIECE", price: 500, image: "15th.webp" },
  { id: 16, title: "SATINWOOD D5 CLAPBOARD/SQUARE FOOT", price: 1140, image: "16th.webp" },
  { id: 17, title: "BROWN RATTAN GARDEN SWING BENCH", price: 8000, image: "17th.webp" },
  { id: 18, title: "MODERN LED PENDANT LIGHT FIXTURE", price: 45955, image: "modern chandalier lkjjl.jpg" },
  { id: 19, title: "CASCADING RING LED PENDANT CHANDALIER", price: 55000, image: "chandalier.webp" },
  { id: 20, title: "MODERN OUTDOOR PATIO GARDEN RATTAN", price: 7500, image: "modernoutdoorpatiogardenRattan.jpg" },

];

/* ===== Cart (persisted) ===== */
let CART = JSON.parse(localStorage.getItem('bb_cart_v2') || '[]');

function saveCart(){ localStorage.setItem('bb_cart_v2', JSON.stringify(CART)); }

/* ===== Render product grid into #productGrid ===== */
function renderProducts(){
  const grid = document.getElementById('productSlider');
  grid.innerHTML = '';
  PRODUCTS.forEach(p => {
    const card = document.createElement('div');
    card.className = 'product';
    card.innerHTML = `
      <img src="${p.image}" alt="${escape(p.title)}">
      <div class="product-info">
        <strong>${escape(p.title)}</strong>
        <span>${formatINR(p.price)}</span>
      </div>
      <button class="btn-product" data-id="${p.id}">Add to Cart</button>
    `;
    grid.appendChild(card);
  });

  // hook add-to-cart
  $$('.btn-product').forEach(b => b.addEventListener('click', (e)=>{
    const id = parseInt(e.currentTarget.dataset.id,10);
    addToCart(id);
  }));
}

function initProductSlider(){
  const slider = document.getElementById('productSlider');
  const nextBtn = document.querySelector('.store-next');
  const prevBtn = document.querySelector('.store-prev');

  nextBtn.addEventListener('click', () => {
    slider.scrollBy({ left: 300, behavior: 'smooth' });
  });

  prevBtn.addEventListener('click', () => {
    slider.scrollBy({ left: -300, behavior: 'smooth' });
  });
}

/* ===== Add to cart logic ===== */
function addToCart(id){
  const p = PRODUCTS.find(x=>x.id===id);
  if(!p) return;
  const existing = CART.find(i => i.id === id);
  if(existing) existing.qty++;
  else CART.push({ id:p.id, title:p.title, price:p.price, image:p.image, qty:1 });
  saveCart();
  renderCart();
  showToast(`Added "${p.title}" to cart`);
  updateCartCount();
  openCart();
}

/* ===== Render cart drawer ===== */
function renderCart(){
  const container = $('#cartItems');
  container.innerHTML = '';
  if(CART.length === 0){ container.innerHTML = '<p class="muted">Your cart is empty.</p>'; $('#cartSubtotal').textContent = formatINR(0); return; }
  let subtotal = 0;
  CART.forEach(item => {
    subtotal += item.price * item.qty;
    const el = document.createElement('div');
    el.className = 'cart-item';
    el.innerHTML = `
      <img src="${item.image}" alt="${escape(item.title)}">
      <div style="flex:1">
        <div style="font-weight:700">${escape(item.title)}</div>
        <div class="muted">₹${item.price.toLocaleString('en-IN')} × 
          <input type="number" class="qty-input" data-id="${item.id}" value="${item.qty}" min="1" style="width:56px">
        </div>
      </div>
      <div style="text-align:right">
        <div style="font-weight:700">${formatINR(item.price * item.qty)}</div>
        <button class="btn ghost remove-item" data-id="${item.id}">Remove</button>
      </div>
    `;
    container.appendChild(el);
  });

  // qty handlers
  $$('.qty-input').forEach(inp => inp.addEventListener('change', (e)=>{
    const id = parseInt(e.currentTarget.dataset.id,10);
    const val = Math.max(1, parseInt(e.currentTarget.value,10) || 1);
    const it = CART.find(c=>c.id===id);
    if(it){ it.qty = val; saveCart(); renderCart(); updateCartCount(); }
  }));

  // remove handlers
  $$('.remove-item').forEach(b => b.addEventListener('click', (e)=>{
    const id = parseInt(e.currentTarget.dataset.id,10);
    CART = CART.filter(c => c.id !== id);
    saveCart(); renderCart(); updateCartCount();
  }));

  $('#cartSubtotal').textContent = formatINR(subtotal);
}

/* ===== Cart UI controls ===== */
function openCart(){
  const drawer = $('#cartDrawer');
  const backdrop = $('#cartBackdrop');
  drawer.classList.add('open'); drawer.setAttribute('aria-hidden','false');
  backdrop.classList.add('show'); backdrop.hidden = false;
}
function closeCart(){
  const drawer = $('#cartDrawer');
  const backdrop = $('#cartBackdrop');
  drawer.classList.remove('open'); drawer.setAttribute('aria-hidden','true');
  backdrop.classList.remove('show'); backdrop.hidden = true;
}
function updateCartCount(){
  const count = CART.reduce((s,i)=> s + i.qty, 0);
  $('#cartCount').textContent = count;
}

/* ===== Small UI pieces ===== */
function showToast(msg){
  const t = document.createElement('div'); t.className = 'toast'; t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(()=> t.classList.add('visible'), 10);
  setTimeout(()=> { t.classList.remove('visible'); setTimeout(()=> t.remove(), 300); }, 2600);
}
function escape(s){ return (s+'').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

/* ===== Before/After initializer ===== */
function initBeforeAfter(){
  const wrap = $('#baWrap'), after = $('#baAfter'), handle = $('#baHandle');
  if(!wrap||!after||!handle) return;
  let dragging=false;
  const setPos = x => {
    const rect = wrap.getBoundingClientRect();
    let pct = ((x - rect.left)/rect.width)*100; pct = Math.max(0,Math.min(100,pct));
    after.style.width = pct + '%';
    handle.style.left = pct + '%';
  };
  handle.addEventListener('pointerdown', e => { dragging=true; handle.setPointerCapture(e.pointerId); });
  window.addEventListener('pointerup', ()=> dragging=false);
  window.addEventListener('pointermove', e => { if(dragging) setPos(e.clientX); });
  wrap.addEventListener('touchmove', e => setPos(e.touches[0].clientX), { passive:true });
}

/* ===== Hero layered rotation & toggle ===== */
function initHero(){
  const layers = $$('.hero-layers .layer');
  if(layers.length){
    let idx=0;
    setInterval(()=> { layers.forEach((l,i)=> l.classList.toggle('active', i===idx)); idx=(idx+1)%layers.length; }, 7000);
  }
  const vid = $('#heroVideo'), btn = $('#toggleHeroBtn');
  if(vid && btn){ btn.addEventListener('click', ()=> { if(vid.paused){ vid.play(); btn.textContent='Pause'; } else { vid.pause(); btn.textContent='Play'; } }); }
}

/* ===== Testimonials rotate ===== */
function initTestimonials(){
  const quotes = document.querySelectorAll('#quotes .quote');
  const dotsContainer = document.getElementById('testimonialDots');
  if(!quotes.length) return;

  // create dots
  quotes.forEach((_,i)=>{
    const dot = document.createElement('div');
    dot.className = 'dot' + (i===0?' active':'');
    dot.addEventListener('click', ()=> show(i));
    dotsContainer.appendChild(dot);
  });

  let i=0;
  function show(idx){
    quotes.forEach((q,qi)=> q.classList.toggle('active', qi===idx));
    document.querySelectorAll('#testimonialDots .dot').forEach((d,di)=> d.classList.toggle('active', di===idx));
    i=idx;
  }

  setInterval(()=> show((i+1)%quotes.length), 5000);
}


/* ===== Tilt effect for service cards ===== */
function initTilt(){
  $$('[data-tilt]').forEach(card=>{
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left)/r.width; const y = (e.clientY - r.top)/r.height;
      const rx = (y - 0.5) * -8; const ry = (x - 0.5) * 10;
      card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.02)`;
      card.style.transition = 'transform 0.05s';
    });
    card.addEventListener('mouseleave', ()=> { card.style.transform=''; card.style.transition='transform .4s ease'; });
  });
}

/* ===== Nav Scroll Spy (active link) ===== */
function initScrollSpy(){
  const links = $$('.main-nav .nav-link');
  const sections = links.map(a => document.querySelector(a.getAttribute('href')));
  const io = new IntersectionObserver(entries => {
    entries.forEach(ent=>{
      if(ent.isIntersecting) links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + ent.target.id));
    });
  }, { threshold: 0.45 });
  sections.forEach(s=> s && io.observe(s));
}

/* ===== Mobile nav toggle ===== */
function initMobileNav(){
  $('#mobileToggle')?.addEventListener('click', ()=> {
    const nav = document.querySelector('.main-nav');
    nav.style.display = (nav.style.display === 'flex') ? '' : 'flex';
  });
}

/* ===== Contact form (demo) ===== */
function initContactForm(){
  const form = $('#contactForm'), status = $('#formStatus');
  form?.addEventListener('submit', e => {
    e.preventDefault();
    const name = $('#cf-name').value.trim(); const email = $('#cf-email').value.trim();
    if(!name || !email){ status.textContent = 'Please enter name and email.'; return; }
    status.textContent = 'Thanks — we received your request (demo).';
    form.reset();
  });
}

/* ===== Init everything ===== */
document.addEventListener('DOMContentLoaded', ()=>{
  document.getElementById('year').textContent = new Date().getFullYear();
  renderProducts(); renderCart(); updateCartCount();
  initHero(); initBeforeAfter(); initTilt(); initTestimonials(); initScrollSpy(); initMobileNav(); initContactForm(); initProductSlider();

  // cart open/close handlers
  $('#openCartBtn').addEventListener('click', openCart);
  $('#closeCartBtn').addEventListener('click', closeCart);
  $('#cartBackdrop')?.addEventListener('click', closeCart);
// Pay Now handler (mock payment)
$('#payNowBtn')?.addEventListener('click', ()=> {
  if (CART.length === 0) {
    alert('Your cart is empty!');
    return;
  }
  const total = CART.reduce((sum, i) => sum + i.price * i.qty, 0);
  alert(`✅ Payment Successful!\nAmount Charged: ${formatINR(total)}\n(Here you can integrate Stripe/PayPal)`);
  CART = [];
  saveCart();
  renderCart();
  updateCartCount();
  closeCart();
});
});

// contact

function initContactForm(){
  const form = $('#contactForm');
  const status = $('#formStatus');

  form?.addEventListener('submit', e => {
    e.preventDefault();

    // Get field values
    const name = $('#cf-name');
    const email = $('#cf-email');
    const phone = $('#cf-phone');
    const notes = $('#cf-notes');

    // Reset error states
    [name, email, phone, notes].forEach(f => f.classList.remove('error'));

    // Basic validation
    let valid = true;
    if (!name.value.trim()) {
      name.classList.add('error');
      valid = false;
    }
    if (!email.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
      email.classList.add('error');
      valid = false;
    }

    if (!valid) {
      status.textContent = "⚠️ Please fill out required fields correctly.";
      status.className = "form-status error";
      return;
    }

    // Success message (demo only)
    status.textContent = "✅ Thanks, we’ve received your request!";
    status.className = "form-status success";
    form.reset();

    // Hide after 4s
    setTimeout(() => {
      status.textContent = "";
      status.className = "form-status";
    }, 4000);
  });
}



// add payment handling
function initCheckout(){
  const checkoutBtn = $('#checkoutBtn');
  const checkoutForm = $('#checkoutForm');
  const payBtn = $('#payBtn');

  checkoutBtn?.addEventListener('click', () => {
    if(CART.length === 0){
      showToast("Your cart is empty!");
      return;
    }
    checkoutForm.hidden = !checkoutForm.hidden;
  });

  payBtn?.addEventListener('click', () => {
    const name = $('#co-name').value.trim();
    const email = $('#co-email').value.trim();
    const address = $('#co-address').value.trim();

    if(!name || !email || !address){
      showToast("⚠️ Please fill out all checkout fields.");
      return;
    }

    // Payment success (demo)
    alert(`✅ Payment Successful!\nThank you, ${name}. Your items will be shipped to:\n${address}`);

    // Clear cart
    CART = [];
    saveCart();
    renderCart();
    updateCartCount();
    checkoutForm.hidden = true;
    closeCart();
  });
}

// Call directly since script is loaded at the end of <body>
initCheckout();

// Hero slideshow
let currentSlide = 0;
const slides = document.querySelectorAll('.hero-slideshow .slide');

function showSlide(idx) {
  slides.forEach((s, i) => s.classList.toggle('active', i === idx));
}

function nextSlide() {
  currentSlide = (currentSlide + 1) % slides.length;
  showSlide(currentSlide);
}

// auto slide every 5s
setInterval(nextSlide, 5000);


// Sticky header effect
window.addEventListener("scroll", () => {
  const header = document.querySelector(".site-header");
  header.classList.toggle("scrolled", window.scrollY > 50);
});

// Mobile menu toggle
const mobileToggle = document.getElementById("mobileToggle");
const mainNav = document.getElementById("mainNav");

mobileToggle.addEventListener("click", () => {
  mainNav.classList.toggle("open");
});


// for create slide for multiple before/after image

// Initialize all before/after sliders
// Before/After drag logic for each slider
// Function to enable dragging for each slider
// Initialize each slider's drag functionality
// Enable dragging inside each slider
(() => {
  const slides = Array.from(document.querySelectorAll('[data-bfa="slide"]'));
  const progressContainer = document.querySelector('[data-bfa="progress"]');

  let current = slides.findIndex(s => s.classList.contains('is-active'));
  if (current === -1) current = 0;

  // Generate progress dots
  slides.forEach((slide, index) => {
    const dot = document.createElement('div');
    dot.classList.add('dot');
    dot.addEventListener('click', () => {
      current = index;
      show(current);
    });
    progressContainer.appendChild(dot);
  });

  function updateDots() {
    const dots = progressContainer.querySelectorAll('.dot');
    dots.forEach((dot, i) => dot.classList.toggle('active', i === current));
  }

  // Show slide
  function show(idx) {
    slides.forEach((s, i) => s.classList.toggle('is-active', i === idx));
    updateDots();
  }

  // Initialize drag for each slide
  slides.forEach((slide, index) => initSlide(slide, index));

  // Next/Prev buttons
  document.getElementById('bfaNext')?.addEventListener('click', () => {
    current = (current + 1) % slides.length;
    show(current);
  });
  document.getElementById('bfaPrev')?.addEventListener('click', () => {
    current = (current - 1 + slides.length) % slides.length;
    show(current);
  });

  show(current);

  // Initialize drag handle logic
  function initSlide(slide, slideIndex) {
    const after = slide.querySelector('[data-bfa="after"]');
    const handle = slide.querySelector('[data-bfa="handle"]');
    const toBeforeBtn = slide.querySelector('[data-bfa="to-before"]');
    const toAfterBtn = slide.querySelector('[data-bfa="to-after"]');

    after.style.width = '50%';
    handle.style.left = '50%';

    let dragging = false;

    const onMove = (clientX) => {
      const rect = slide.getBoundingClientRect();
      const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      after.style.width = `${pct * 100}%`;
      handle.style.left = `${pct * 100}%`;

      // Drag-sensitive dot animation
      const dots = document.querySelectorAll('.progress-dots .dot');
      if (dots[slideIndex]) {
        dots[slideIndex].style.transform = `scale(${1 + 0.3 * pct})`;
        dots[slideIndex].style.background = `rgba(230, 57, 70, ${0.5 + 0.5 * pct})`;
      }
    };

    const onMouseMove = e => dragging && onMove(e.clientX);
    const onTouchMove = e => {
      if (!dragging) return;
      const t = e.touches[0];
      if (t) onMove(t.clientX);
    };

    handle.addEventListener('mousedown', () => dragging = true);
    window.addEventListener('mouseup', () => { dragging = false; resetDot(slideIndex); });
    window.addEventListener('mousemove', onMouseMove);

    handle.addEventListener('touchstart', () => dragging = true, { passive: true });
    window.addEventListener('touchend', () => { dragging = false; resetDot(slideIndex); }, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });

    // Quick view buttons
    if (toBeforeBtn) toBeforeBtn.addEventListener('click', () => {
      after.style.transition = 'width 0.5s ease';
      handle.style.transition = 'left 0.5s ease';
      after.style.width = '0%';
      handle.style.left = '0%';
      setTimeout(() => { after.style.transition = ''; handle.style.transition = ''; resetDot(slideIndex); }, 500);
    });

    if (toAfterBtn) toAfterBtn.addEventListener('click', () => {
      after.style.transition = 'width 0.5s ease';
      handle.style.transition = 'left 0.5s ease';
      after.style.width = '100%';
      handle.style.left = '100%';
      setTimeout(() => { after.style.transition = ''; handle.style.transition = ''; resetDot(slideIndex); }, 500);
    });

    function resetDot(index) {
      const dots = document.querySelectorAll('.progress-dots .dot');
      dots[index].style.transform = '';
      dots[index].style.background = '';
    }
  }
})();


function initFadeSections(){
  const faders = document.querySelectorAll('.fade-section');
  const options = { threshold: 0.2 };

  const observer = new IntersectionObserver((entries, obs)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add('visible');
        obs.unobserve(entry.target); // trigger only once
      }
    });
  }, options);

  faders.forEach(sec=> observer.observe(sec));
}

document.addEventListener('DOMContentLoaded', ()=>{
  initFadeSections();
});



function initAboutSlider(){
  const aboutImg = document.querySelector('.about-img');
  if(!aboutImg) return;

  // Array of images to cycle through
  const images = [
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?fm=jpg&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bW9kZXJuJTIwaG91c2UlMjBleHRlcmlvcnxlbnwwfHwwfHx8MA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000",
    "https://plus.unsplash.com/premium_photo-1661883964999-c1bcb57a7357?fm=jpg&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8bW9kZXJuJTIwaG91c2UlMjBleHRlcmlvcnxlbnwwfHwwfHx8MA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000"
  ];

  let i = 0;
  aboutImg.style.backgroundImage = `url(${images[i]})`;

  setInterval(()=>{
    i = (i + 1) % images.length;
    aboutImg.style.opacity = 0;
    setTimeout(()=>{
      aboutImg.style.backgroundImage = `url(${images[i]})`;
      aboutImg.style.opacity = 1;
    }, 500);
  }, 5000); // change every 5 seconds
}

document.addEventListener('DOMContentLoaded', ()=>{
  initAboutSlider();
});
