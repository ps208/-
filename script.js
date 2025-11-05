const stickers = document.querySelectorAll('.sticker');
const dropzones = document.querySelectorAll('.dropzone');
const stickerPalette = document.querySelector('.stickers');
const resetBtn = document.querySelector('.reset');
let dragClone = null, draggedSticker = null, offsetX = 0, offsetY = 0;

// === 스티커 드래그 & 드롭 ===
stickers.forEach(sticker => {
  sticker.addEventListener('mousedown', e => {
    draggedSticker = sticker;
    const rect = sticker.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;

    dragClone = sticker.cloneNode(true);
    dragClone.classList.add('drag-clone');
    dragClone.style.position = 'absolute';
    dragClone.style.pointerEvents = 'none';
    dragClone.style.zIndex = 1000;
    dragClone.style.left = e.pageX - offsetX + 'px';
    dragClone.style.top = e.pageY - offsetY + 'px';
    document.body.appendChild(dragClone);
  });
});

document.addEventListener('mousemove', e => {
  if (dragClone) {
    dragClone.style.left = e.pageX - offsetX + 'px';
    dragClone.style.top = e.pageY - offsetY + 'px';
  }
  dropzones.forEach(zone => {
    const r = zone.getBoundingClientRect();
    const inside = e.clientX > r.left && e.clientX < r.right && e.clientY > r.top && e.clientY < r.bottom;
    zone.classList.toggle('_active', inside);
  });
});

document.addEventListener('mouseup', e => {
  if (!dragClone || !draggedSticker) return;
  let dropped = false;
  dropzones.forEach(zone => {
    const r = zone.getBoundingClientRect();
    if (e.clientX > r.left && e.clientX < r.right && e.clientY > r.top && e.clientY < r.bottom) {
      zone.querySelector('.drop-content').appendChild(draggedSticker);
      dropped = true;
    }
    zone.classList.remove('_active');
  });
  if (!dropped) stickerPalette.appendChild(draggedSticker);
  dragClone.remove();
  dragClone = null;
  draggedSticker = null;
  updateTotal();
});

function updateTotal() {
  dropzones.forEach(zone => {
    const s = zone.querySelectorAll('.drop-content .sticker');
    let t = 0;
    s.forEach(e => t += Number(e.dataset.price));
    zone.querySelector('.total').textContent = `총합: ₩${t.toLocaleString()}`;
  });
}

// === 초기화 버튼 ===
resetBtn.addEventListener('click', () => {
  const all = document.querySelectorAll('.sticker');
  all.forEach(s => stickerPalette.appendChild(s));
  updateTotal();

  calcValue = '';
  calcDisplay.value = '';
  answerInput.value = '';
});

// 스티커 가격 표시 천 단위 구분
document.querySelectorAll('.sticker').forEach(sticker => {
  const price = Number(sticker.dataset.price);
  const formatted = price.toLocaleString();
  sticker.innerHTML = `${sticker.dataset.value}<br>₩${formatted}`;
});

// === 계산기 ===
const calcDisplay = document.querySelector('.calc-display');
const calcButtons = document.querySelectorAll('.calc-btn');
let calcValue = '';

calcButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    let val = btn.dataset.value;

    if (val === 'C') {
      calcValue = '';
    } else if (val === '=') {
      try {
        calcValue = eval(calcValue.replace(/÷/g, '/').replace(/×/g, '*')).toString();
      } catch {
        calcValue = 'Error';
      }
    } else {
      calcValue += val;
    }

    if (!isNaN(Number(calcValue.replace(/,/g, '')))) {
      const num = Number(calcValue.replace(/,/g, ''));
      calcDisplay.value = num.toLocaleString();
    } else {
      calcDisplay.value = calcValue;
    }
  });
});

// === 정답 체크 ===
const answerInput = document.querySelector('.answer-input');
const checkBtn = document.querySelector('.check-btn');

checkBtn.addEventListener('click', () => {
  if (answerInput.value === '9999') {
    createFireworks();
    showCorrectText();
  }
});

// === 폭죽 효과 (화면 사방 랜덤 위치) ===
function createFireworks() {
  const numFireworks = 7;
  for (let i = 0; i < numFireworks; i++) {
    const fw = document.createElement('div');
    fw.classList.add('firework');

    // 화면 랜덤 위치
    fw.style.left = `${Math.random() * window.innerWidth}px`;
    fw.style.top = `${Math.random() * window.innerHeight}px`;

    document.body.appendChild(fw);

    const color = `hsl(${Math.random() * 360}, 100%, 60%)`;
    for (let j = 0; j < 40; j++) {
      const particle = document.createElement('span');
      particle.classList.add('particle');
      const angle = (Math.PI * 2 * j) / 40;
      const distance = 100 + Math.random() * 70;
      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance;
      particle.style.setProperty('--x', `${x}px`);
      particle.style.setProperty('--y', `${y}px`);
      particle.style.background = color;
      particle.style.boxShadow = `0 0 12px ${color}`;
      fw.appendChild(particle);
    }

    fw.animate(
      [{ transform: 'scale(1)', opacity: 1 }, { transform: 'scale(0.3)', opacity: 0 }],
      { duration: 1500, easing: 'ease-out' }
    );

    setTimeout(() => fw.remove(), 1500);
  }
}

// === 중앙 "정답" 표시 (흰색 글씨 + 청록 네온) ===
function showCorrectText() {
  const text = document.createElement('div');
  text.textContent = '정답';
  text.style.position = 'fixed';
  text.style.top = '50%';
  text.style.left = '50%';
  text.style.transform = 'translate(-50%, -50%)';
  text.style.fontSize = '120px';
  text.style.fontWeight = '900';
  text.style.color = '#ffffff'; // 흰색
  text.style.textShadow = '0 0 25px #00e6b8, 0 0 50px #00ffee, 0 0 80px #00bfa5';
  text.style.opacity = '0';
  text.style.transition = 'opacity 0.5s';
  text.style.zIndex = 9999;
  document.body.appendChild(text);

  requestAnimationFrame(() => {
    text.style.opacity = '1';
  });

  setTimeout(() => {
    text.style.opacity = '0';
    setTimeout(() => text.remove(), 500);
  }, 2000);
}

// === 폭죽 스타일 ===
const style = document.createElement('style');
style.textContent = `
.firework {
  position: fixed;
  pointer-events: none;
  width: 8px;
  height: 8px;
  transform: translate(-50%, -50%);
}
.firework .particle {
  position: absolute;
  top: 0;
  left: 0;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  transform: translate(0, 0);
  animation: particleMove 1.5s ease-out forwards;
}
@keyframes particleMove {
  to {
    transform: translate(var(--x), var(--y)) scale(0.2);
    opacity: 0;
  }
}
`;
document.head.appendChild(style);

