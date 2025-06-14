// content.js

const animeSrc = chrome.runtime.getURL('images/gatcha2.png');

function sparkEffect() {
  const spark = document.createElement('div');
  Object.assign(spark.style, {
    position: 'fixed',
    top: 0, left: 0,
    width: '100vw', height: '100vh',
    pointerEvents: 'none',
    zIndex: 9998,
    // two soft blue glints
    background:
      'radial-gradient(circle at 25% 25%, rgba(0,200,255,0.6), transparent 50%),' +
      'radial-gradient(circle at 75% 75%, rgba(0,150,255,0.4), transparent 50%)',
    opacity: 0
  });
  document.body.appendChild(spark);

  // fade in & out
  requestAnimationFrame(() => spark.style.transition = 'opacity 0.4s ease-out');
  requestAnimationFrame(() => spark.style.opacity = 1);
  setTimeout(() => {
    spark.style.opacity = 0;
    spark.addEventListener('transitionend', () => spark.remove(), { once: true });
  }, 200);
}

function flashScreen() {
  const flash = document.createElement('div');
  Object.assign(flash.style, {
    position: 'fixed',
    top: 0, left: 0, width: '100vw', height: '100vh',
    background: 'rgba(0,180,255,0.2)',
    pointerEvents: 'none',
    zIndex: 9997,
    opacity: 0
  });
  document.body.appendChild(flash);

  requestAnimationFrame(() => flash.style.transition = 'opacity 0.3s ease-in');
  requestAnimationFrame(() => flash.style.opacity = 1);
  setTimeout(() => {
    flash.style.opacity = 0;
    flash.addEventListener('transitionend', () => flash.remove(), { once: true });
  }, 150);
}

function burstParticles(x, y) {
  const count = 12;
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    Object.assign(p.style, {
      position: 'fixed',
      width: '8px', height: '8px',
      background: 'rgba(0,200,255,0.8)',
      borderRadius: '50%',
      left: `${x}px`,
      top: `${y}px`,
      pointerEvents: 'none',
      zIndex: 9999,
      opacity: 1,
      transform: 'translate(0,0) scale(1)'
    });
    document.body.appendChild(p);

    // random direction & distance
    const angle = Math.random() * Math.PI * 2;
    const dist = 30 + Math.random() * 20;
    const dx = Math.cos(angle) * dist;
    const dy = Math.sin(angle) * dist;

    // animate with Web Animations API
    p.animate([
      { transform: 'translate(0,0) scale(1)', opacity: 1 },
      { transform: `translate(${dx}px, ${dy}px) scale(0.2)`, opacity: 0 }
    ], {
      duration: 600 + Math.random() * 200,
      easing: 'cubic-bezier(.2, .8, .2, 1)'
    }).onfinish = () => p.remove();
  }
}

function showAnimeGirl() {
  if (document.getElementById('gacha-anime-popup')) return;

  // 1) flash + spark
  flashScreen();
  sparkEffect();

  // 2) create & style container
  const container = document.createElement('div');
  container.id = 'gacha-anime-popup';
  Object.assign(container.style, {
    position: 'fixed',
    bottom: '0', left: '0',
    width: '1000px',
    zIndex: 10000,
    opacity: 0,
    transform: 'scale(0.5)',
    transition: 'opacity 0.4s ease-in, transform 0.4s ease-out',
    filter: 'drop-shadow(0 0 15px rgba(0,200,255,0.7))'
  });

  // 3) image
  const img = document.createElement('img');
  img.src = animeSrc;
  img.style.width = '100%';
  img.onload = () => {
    // pop in
    requestAnimationFrame(() => {
      container.style.opacity = 1;
      container.style.transform = 'scale(1.1)';
      // then settle back
      setTimeout(() => {
        container.style.transform = 'scale(1)';
      }, 250);
    });

    // burst particles from center of container
    const rect = container.getBoundingClientRect();
    const cx = rect.left + rect.width  / 2;
    const cy = rect.top  + rect.height / 2;
    burstParticles(cx, cy);
  };
  container.appendChild(img);
  document.body.appendChild(container);

  // 4) auto-remove
  setTimeout(() => {
    container.style.opacity = 0;
    container.addEventListener('transitionend', () => container.remove(), { once: true });
  }, 5000);
}

// Accepted detector
function checkForAccepted() {
  const span = document.querySelector('[data-e2e-locator="submission-result"]');
  if (span?.textContent.trim() === 'Accepted') {
    showAnimeGirl();
    observer.disconnect();
  }
}

const observer = new MutationObserver(muts => {
  for (const m of muts) {
    if ([...m.addedNodes].some(n =>
      n.nodeType === 1 &&
      n.querySelector?.('[data-e2e-locator="submission-result"]')
    )) {
      checkForAccepted();
      break;
    }
  }
});
observer.observe(document.body, { childList: true, subtree: true });
window.addEventListener('load', checkForAccepted);
