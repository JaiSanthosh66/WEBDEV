// Basic DOM utilities
const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

const state = {
  nextId: 1,
  cards: [],
};

function updateMeta() {
  const count = state.cards.length;
  const metaText = $("#meta-text");
  metaText.textContent = `${count} ${count === 1 ? "card" : "cards"} • theme: `;
  const themeName = $("#theme-name");
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  themeName.textContent = prefersDark ? 'dark' : 'light';
}

function syncEmptyState() {
  const empty = $("#empty-state");
  empty.classList.toggle('hidden', state.cards.length > 0);
}

function createCardElement({ id, title, content, featured = false }) {
  const template = $("#card-template");
  const article = template.content.firstElementChild.cloneNode(true);

  article.dataset.id = String(id);
  article.setAttribute('aria-label', title || `Card ${id}`);
  article.toggleAttribute('data-featured', featured);
  if (featured) article.setAttribute('data-featured', 'true');

  $("h3", article).textContent = title || `Untitled #${id}`;
  $("p", article).textContent = content || "This card was created dynamically.";
  const tag = $(".tag", article);
  tag.classList.toggle('hidden', !featured);

  article.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const action = target.dataset.action;
    if (!action) return;
    event.stopPropagation();
    if (action === 'feature') toggleFeatured(article);
    if (action === 'rename') renameCard(article);
    if (action === 'remove') removeCard(article);
  });


  article.addEventListener('mouseenter', () => {
    article.style.background = '#2b7cff10';
  });
  article.addEventListener('mouseleave', () => {
    article.style.background = '';
  });

  return article;
}

function addCard({ title, content, featured = false } = {}) {
  const id = state.nextId++;
  const card = { id, title, content, featured };
  state.cards.push(card);
  const el = createCardElement(card);
  $("#card-grid").appendChild(el);
  updateMeta();
  syncEmptyState();
}

function toggleFeatured(article) {
  const id = Number(article.dataset.id);
  const card = state.cards.find(c => c.id === id);
  if (!card) return;
  card.featured = !card.featured;
  article.setAttribute('data-featured', String(card.featured));
  $(".tag", article).classList.toggle('hidden', !card.featured);
}

function renameCard(article) {
  const id = Number(article.dataset.id);
  const card = state.cards.find(c => c.id === id);
  if (!card) return;
  const newTitle = prompt('Enter new title:', card.title || `Untitled #${id}`);
  if (newTitle == null) return;
  card.title = newTitle.trim() || card.title;
  $("h3", article).textContent = card.title;
}

function removeCard(article) {
  const id = Number(article.dataset.id);
  const idx = state.cards.findIndex(c => c.id === id);
  if (idx === -1) return;
  state.cards.splice(idx, 1);
  article.remove();
  updateMeta();
  syncEmptyState();
}

function clearAll() {
  state.cards = [];
  $("#card-grid").innerHTML = '';
  updateMeta();
  syncEmptyState();
}

function toggleEmpty() {
  $("#empty-state").classList.toggle('hidden');
}

function bootstrap() {
  $("#add-card").addEventListener('click', () => {
    const title = $("#title-input").value.trim();
    const content = $("#content-input").value.trim();
    addCard({ title: title || undefined, content: content || undefined });
  });
  $("#add-featured").addEventListener('click', () => {
    const title = $("#title-input").value.trim();
    const content = $("#content-input").value.trim();
    addCard({ title: title || undefined, content: content || undefined, featured: true });
  });
  $("#toggle-empty").addEventListener('click', toggleEmpty);
  $("#clear-all").addEventListener('click', clearAll);

 
  addCard({ title: 'Welcome', content: 'Use the controls to add more cards.' });
  addCard({ title: 'Dynamic Element', content: 'This was created from JavaScript.', featured: true });

  
  const meta = $("#meta-text");
  meta.setAttribute('data-bootstrapped', 'true');
  meta.style.transition = 'opacity 200ms';
  meta.style.opacity = '0.8';

  updateMeta();
  syncEmptyState();
}
document.addEventListener('DOMContentLoaded', bootstrap);