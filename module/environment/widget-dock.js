/**
 * Общая обвязка плавающих панелей.
 *
 * Панель висит в `document.body`, а не в `#ui-top`: в верхней полосе она
 * налезала на соседние элементы и уезжала за край экрана. ГМ ставит её сам,
 * и место переживает перезагрузку.
 */

const store = (key, value) => {
  try { localStorage.setItem(key, value); } catch { /* приватный режим */ }
};
const read = key => {
  try { return localStorage.getItem(key); } catch { return null; }
};

export function restorePosition(element, key, fallback = { left: 12, top: 76 }) {
  let position = fallback;
  try {
    const saved = JSON.parse(read(`${key}.pos`) ?? "null");
    if (saved && Number.isFinite(saved.left) && Number.isFinite(saved.top)) position = saved;
  } catch { /* повреждённая запись — берём место по умолчанию */ }
  // Панель могла остаться за краем после смены разрешения.
  const left = Math.min(Math.max(0, position.left), Math.max(0, window.innerWidth - 80));
  const top = Math.min(Math.max(0, position.top), Math.max(0, window.innerHeight - 40));
  element.style.left = `${left}px`;
  element.style.top = `${top}px`;
}

export function makeDraggable(element, handle, key) {
  let origin = null;
  handle.addEventListener("pointerdown", event => {
    if (event.button !== 0) return;
    origin = { x: event.clientX, y: event.clientY, left: parseFloat(element.style.left) || 0, top: parseFloat(element.style.top) || 0 };
    handle.setPointerCapture?.(event.pointerId);
    event.preventDefault();
  });
  handle.addEventListener("pointermove", event => {
    if (!origin) return;
    element.style.left = `${origin.left + event.clientX - origin.x}px`;
    element.style.top = `${origin.top + event.clientY - origin.y}px`;
  });
  const drop = () => {
    if (!origin) return;
    origin = null;
    store(`${key}.pos`, JSON.stringify({ left: parseFloat(element.style.left), top: parseFloat(element.style.top) }));
  };
  handle.addEventListener("pointerup", drop);
  handle.addEventListener("pointercancel", drop);
}
