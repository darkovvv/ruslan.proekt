/* статические данные поездок */
const staticTrips = [
  { id: 't1', from: 'Саранск', to: 'Москва', date: '2026-05-15', basePrice: 4000, maxSeats: 48 },
  { id: 't2', from: 'Саранск', to: 'Казань', date: '2026-05-22', basePrice: 3500, maxSeats: 48 },
  { id: 't3', from: 'Саранск', to: 'Нижний Новгород', date: '2026-06-05', basePrice: 3800, maxSeats: 48 },
  { id: 't4', from: 'Саранск', to: 'Волгоград', date: '2026-06-12', basePrice: 4200, maxSeats: 48 },
];

/* 25 лотов: 15 белых скидок, 8 серых "Ничего", 2 зеленых "Билет" */
const w = { color: '#ffffff', textColor: '#000000' };
const b = { color: '#1f1f22', textColor: '#ffffff' };
const g = { color: '#a7f3d0', textColor: '#064e3b' }; 

const prizes = [
  { label: '-100 RUB', val: 100, type: 'discount', ...w },
  { label: 'EMPTY', val: 0, type: 'none', ...b },
  { label: '-150 RUB', val: 150, type: 'discount', ...w },
  { label: 'EMPTY', val: 0, type: 'none', ...b },
  { label: '-200 RUB', val: 200, type: 'discount', ...w },
  { label: '-500 RUB', val: 500, type: 'discount', ...w },
  { label: 'EMPTY', val: 0, type: 'none', ...b },
  { label: '-1000 RUB', val: 1000, type: 'discount', ...w },
  { label: 'TICKET', val: 1, type: 'free', ...g },
  { label: '-100 RUB', val: 100, type: 'discount', ...w },
  { label: 'EMPTY', val: 0, type: 'none', ...b },
  { label: '-150 RUB', val: 150, type: 'discount', ...w },
  { label: '-200 RUB', val: 200, type: 'discount', ...w },
  { label: 'EMPTY', val: 0, type: 'none', ...b },
  { label: '-500 RUB', val: 500, type: 'discount', ...w },
  { label: '-1000 RUB', val: 1000, type: 'discount', ...w },
  { label: 'EMPTY', val: 0, type: 'none', ...b },
  { label: '-100 RUB', val: 100, type: 'discount', ...w },
  { label: '-150 RUB', val: 150, type: 'discount', ...w },
  { label: 'TICKET', val: 1, type: 'free', ...g },
  { label: 'EMPTY', val: 0, type: 'none', ...b },
  { label: '-200 RUB', val: 200, type: 'discount', ...w },
  { label: '-500 RUB', val: 500, type: 'discount', ...w },
  { label: 'EMPTY', val: 0, type: 'none', ...b },
  { label: '-1000 RUB', val: 1000, type: 'discount', ...w },
];

let currentUser = null;
let currentBookingTrip = null;
let selectedSeatsArray = [];
let isDiscountApplied = false;

/* формат цены */
const formatPrice = (price) => `${Math.max(0, Math.round(price)).toLocaleString('ru-RU')} RUB`;

/* расчет динамической скидки */
const calculateDynamicPrice = (base, fullPct) => base * (1 - (fullPct / 100) * 0.35);

/* функция цвета */
const getDynamicColor = (pct) => {
  let hue, lightness;
  if (pct <= 20) {
    hue = 0; lightness = 30 + (pct / 20) * 25;
  } else if (pct <= 60) {
    hue = 30; lightness = 35 + ((pct - 20) / 40) * 20;
  } else {
    hue = 120; lightness = 25 + ((pct - 60) / 40) * 35;
  }
  return `hsl(${hue}, 90%, ${lightness}%)`;
};

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initAuth();
  initDynamicDemo();
  renderTrips();
  initModals();
  buildRoulette();
  initBookingSystem();
  initScrollAnimations();
  initInteractiveMap();
});

function initMobileMenu() {
  const burger = document.getElementById('burgerBtn');
  const navLinks = document.getElementById('navLinks');
  if (!burger) return;
  burger.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    burger.textContent = navLinks.classList.contains('active') ? '✕' : '☰';
  });
}

function initAuth() {
  const savedUser = localStorage.getItem('fanTripUser');
  if (savedUser) currentUser = JSON.parse(savedUser);
  updateNavUI();

  document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    currentUser = { name: 'С возвращением, Фанат!', played: false, prize: null, birth: '2000-01-01' };
    localStorage.setItem('fanTripUser', JSON.stringify(currentUser));
    updateNavUI();
    document.getElementById('loginModal').classList.remove('open');
    e.target.reset();
  });

  document.getElementById('regForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const inputName = document.getElementById('regName').value.trim();
    const inputDate = document.getElementById('regDate').value;
    currentUser = { name: inputName, birth: inputDate, played: false, prize: null };
    localStorage.setItem('fanTripUser', JSON.stringify(currentUser));
    updateNavUI();
    document.getElementById('regModal').classList.remove('open');
    e.target.reset();
  });

  document.getElementById('logoutBtn').addEventListener('click', (e) => {
    e.preventDefault();
    currentUser = null;
    localStorage.removeItem('fanTripUser');
    updateNavUI();
  });
}

function updateNavUI() {
  const authGroup = document.querySelector('.auth-group');
  const userMenu = document.querySelector('.user-menu');
  const userName = document.getElementById('userNameDisplay');
  if (currentUser) {
    authGroup.style.display = 'none';
    userMenu.style.display = 'flex';
    userName.textContent = currentUser.name;
  } else {
    authGroup.style.display = 'flex';
    userMenu.style.display = 'none';
  }
}

function initDynamicDemo() {
  const slider = document.getElementById('demoFill');
  const seatsVal = document.getElementById('demoSeats');
  const priceVal = document.getElementById('demoPrice');
  const bar = document.getElementById('demoBar');
  const percentVal = document.getElementById('demoPercent');
  if(!slider) return;

  const updateDemo = () => {
    const fill = slider.value;
    const fullPct = (fill / 48) * 100;
    const color = getDynamicColor(fullPct);
    seatsVal.textContent = `${fill} / 48`;
    percentVal.textContent = `${Math.round(fullPct)}%`;
    percentVal.style.color = color;
    bar.style.width = `${fullPct}%`;
    bar.style.backgroundColor = color;
    priceVal.textContent = formatPrice(calculateDynamicPrice(4000, fullPct));
  };
  slider.addEventListener('input', updateDemo);
  updateDemo();
}

function renderTrips() {
  const grid = document.getElementById('tripsGrid');
  grid.innerHTML = staticTrips.map((trip, idx) => {
    const fill = Math.floor(Math.random() * 35) + 10;
    const fullPct = (fill / trip.maxSeats) * 100;
    const price = calculateDynamicPrice(trip.basePrice, fullPct);
    const color = getDynamicColor(fullPct);
    
    return `
      <article class="card trip-card animate-up" id="card-${trip.id}" style="transition-delay: ${idx * 0.1}s">
        <div class="trip-head"><h3>${trip.from} — ${trip.to}</h3></div>
        <div>
          <p style="margin-bottom: 8px">Дата: <strong>${trip.date}</strong></p>
          <div class="progress-bg"><div class="progress-bar" style="width: ${fullPct}%; background-color: ${color}; box-shadow: 0 0 10px ${color}"></div></div>
        </div>
        <div class="trip-footer">
          <div class="trip-price" style="color: ${color}">${formatPrice(price)}</div>
          <button class="btn btn-primary" onclick="openBooking('${trip.id}', ${price}, ${fill})">Выбрать места</button>
        </div>
      </article>
    `;
  }).join('');
}

function initBookingSystem() {
  const countInput = document.getElementById('ticketCountInput');
  const countDisplay = document.getElementById('ticketCountDisplay');
  const seatMap = document.getElementById('seatMap');
  const applyPrizeBtn = document.getElementById('applyPrizeBtn');
  const confirmBtn = document.getElementById('confirmBookingBtn');

  countInput.addEventListener('input', () => {
    countDisplay.textContent = countInput.value;
    while(selectedSeatsArray.length > countInput.value) {
      const removed = selectedSeatsArray.pop();
      document.querySelector(`[data-seat="${removed}"]`).classList.remove('selected');
    }
    updateBookingTotal();
  });

  applyPrizeBtn.addEventListener('click', () => {
    isDiscountApplied = true;
    applyPrizeBtn.style.display = 'none';
    updateBookingTotal();
  });

  confirmBtn.addEventListener('click', () => {
    if (selectedSeatsArray.length < countInput.value) {
      alert(`Выберите еще мест: ${countInput.value - selectedSeatsArray.length}`);
      return;
    }
    alert(`Успешно оформлено! Сумма: ${document.getElementById('bookingTotal').textContent}. Места: ${selectedSeatsArray.join(', ')}`);
    document.getElementById('bookingModal').classList.remove('open');
  });

  seatMap.addEventListener('click', (e) => {
    if (e.target.classList.contains('free')) {
      const seatId = e.target.dataset.seat;
      if (selectedSeatsArray.includes(seatId)) {
        selectedSeatsArray = selectedSeatsArray.filter(s => s !== seatId);
        e.target.classList.remove('selected');
      } else {
        if (selectedSeatsArray.length < countInput.value) {
          selectedSeatsArray.push(seatId);
          e.target.classList.add('selected');
        }
      }
      updateBookingTotal();
    }
  });
}

function openBooking(tripId, currentPrice, currentFill) {
  if (!currentUser) { alert('Необходим вход в профиль'); return; }
  currentBookingTrip = { id: tripId, price: currentPrice, fill: currentFill };
  selectedSeatsArray = [];
  isDiscountApplied = false;
  document.getElementById('ticketCountInput').value = 1;
  document.getElementById('ticketCountDisplay').textContent = 1;
  const seatMap = document.getElementById('seatMap');
  seatMap.innerHTML = '';
  for (let i = 1; i <= 48; i++) {
    const isTaken = i <= currentFill;
    const div = document.createElement('div');
    div.className = `seat ${isTaken ? 'taken' : 'free'}`;
    div.dataset.seat = i;
    div.textContent = i;
    seatMap.appendChild(div);
  }
  const prizeBtn = document.getElementById('applyPrizeBtn');
  if (currentUser.prize && currentUser.prize.type !== 'none') {
    prizeBtn.style.display = 'inline-flex';
    prizeBtn.textContent = `Применить: ${currentUser.prize.label}`;
  } else {
    prizeBtn.style.display = 'none';
  }
  updateBookingTotal();
  document.getElementById('bookingModal').classList.add('open');
}

function updateBookingTotal() {
  if (!currentBookingTrip) return;
  const count = parseInt(document.getElementById('ticketCountInput').value);
  let total = currentBookingTrip.price * count;
  if (isDiscountApplied && currentUser.prize) {
    if (currentUser.prize.type === 'discount') total -= currentUser.prize.val;
    else if (currentUser.prize.type === 'free') total -= currentBookingTrip.price;
  }
  document.getElementById('bookingTotal').textContent = formatPrice(total);
}

function buildRoulette() {
  const wheel = document.getElementById('rouletteWheel');
  const spinBtn = document.getElementById('spinBtn');
  if(!wheel) return;
  const sliceDeg = 360 / prizes.length;
  let gradientParts = [];
  prizes.forEach((prize, i) => {
    const startAngle = i * sliceDeg;
    const endAngle = (i + 1) * sliceDeg;
    gradientParts.push(`${prize.color} ${startAngle}deg ${endAngle}deg`);
    const item = document.createElement('div');
    item.className = 'wheel-item';
    const centerAngle = startAngle + (sliceDeg / 2);
    item.style.transform = `rotate(${centerAngle - 90}deg)`;
    const span = document.createElement('span');
    span.textContent = prize.label;
    span.style.color = prize.textColor;
    item.appendChild(span);
    wheel.appendChild(item);
  });
  wheel.style.background = `conic-gradient(${gradientParts.join(', ')})`;
  document.getElementById('openRouletteBtn').addEventListener('click', (e) => {
    e.preventDefault();
    if (!currentUser) { alert('Войдите, чтобы участвовать'); return; }
    if (currentUser.played) { alert('Попытка уже использована'); return; }
    document.getElementById('rouletteModal').classList.add('open');
  });
  spinBtn.addEventListener('click', () => {
    if (currentUser.played) return;
    const targetIdx = Math.floor(Math.random() * prizes.length);
    const targetAngle = (targetIdx * sliceDeg) + (sliceDeg / 2);
    const finalRot = (5 * 360) - targetAngle;
    wheel.style.transform = `rotate(${finalRot}deg)`;
    setTimeout(() => {
      currentUser.played = true;
      currentUser.prize = prizes[targetIdx];
      localStorage.setItem('fanTripUser', JSON.stringify(currentUser));
      alert(`Результат: ${prizes[targetIdx].label}`);
      document.getElementById('rouletteModal').classList.remove('open');
    }, 4500);
  });
}

function initModals() {
  const closes = document.querySelectorAll('.close-modal');
  closes.forEach(btn => btn.addEventListener('click', () => {
    document.querySelectorAll('.modal').forEach(m => m.classList.remove('open'));
  }));
  document.querySelectorAll('[data-modal]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById(btn.dataset.modal).classList.add('open');
    });
  });
}

function initScrollAnimations() {
  const obs = new IntersectionObserver(e => e.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  }), { threshold: 0.1 });
  document.querySelectorAll('.animate-up').forEach(el => obs.observe(el));
}

/* Интерактивная карта */
function initInteractiveMap() {
  const points = document.querySelectorAll('.city-point[data-target]');
  const lines = {
    't1': document.getElementById('path-moscow'),
    't2': document.getElementById('path-kazan'),
    't3': document.getElementById('path-nizhny'),
    't4': document.getElementById('path-volgograd')
  };

  points.forEach(point => {
    point.addEventListener('mouseenter', () => {
      const id = point.dataset.target;
      if (lines[id]) lines[id].classList.add('active');
    });

    point.addEventListener('mouseleave', () => {
      const id = point.dataset.target;
      if (lines[id]) lines[id].classList.remove('active');
    });

    point.addEventListener('click', () => {
      const tripId = point.dataset.target;
      const targetCard = document.getElementById(`card-${tripId}`);
      const targetSection = document.getElementById('trips');
      
      targetSection.scrollIntoView({ behavior: 'smooth' });
      
      if (targetCard) {
        // Кратковременная подсветка карточки при переходе с карты
        setTimeout(() => {
          targetCard.style.borderColor = '#fff';
          targetCard.style.boxShadow = '0 0 30px rgba(255,255,255,0.2)';
          setTimeout(() => {
            targetCard.style.borderColor = 'var(--border)';
            targetCard.style.boxShadow = '';
          }, 2000);
        }, 500);
      }
    });
  });
}
