const query = document.querySelector('#query');
const list = document.querySelector('#results');
const state = document.querySelector('#state');
let selected = 0, items = [], revision = 0, running = false;
function message(text, error = false) { state.textContent = text; state.classList.toggle('error', error); }
function paint() {
  list.replaceChildren();
  items.forEach((item, index) => {
    const row = document.createElement('li'); row.className = index === selected ? 'selected' : '';
    row.setAttribute('role', 'option'); row.setAttribute('aria-selected', String(index === selected));
    const mark = document.createElement('span'); mark.className = 'mark'; mark.textContent = item.kind === 'calc' ? '=' : item.kind === 'workflow' ? '>' : item.name.slice(0, 1);
    const label = document.createElement('div'); label.className = 'label';
    const title = document.createElement('strong'); title.textContent = item.name;
    const detail = document.createElement('small'); detail.textContent = item.detail;
    label.append(title, detail); row.append(mark, label);
    row.addEventListener('click', () => { selected = index; paint(); void execute(); });
    list.append(row);
  });
}
async function search() {
  const current = ++revision; selected = 0;
  try { const found = await window.launcher.search(query.value); if (current !== revision) return; items = found; paint(); message(query.value && !items.length ? 'No results' : ''); }
  catch (error) { if (current !== revision) return; items = []; paint(); message(error.message, true); }
}
async function execute() {
  if (running || !items[selected]) return;
  running = true; query.disabled = true; message('Running...');
  try { const result = await window.launcher.execute(query.value, items[selected].id); message(result.message || result.output || 'Done'); }
  catch (error) { message(error.message, true); }
  finally { running = false; query.disabled = false; query.focus(); }
}
query.addEventListener('input', search);
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') { event.preventDefault(); void window.launcher.dismiss(); }
  if (running) return;
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); selected = Math.max(0, Math.min(items.length - 1, selected + (event.key === 'ArrowDown' ? 1 : -1))); paint(); list.children[selected]?.scrollIntoView({ block: 'nearest' }); }
  if (event.key === 'Enter') { event.preventDefault(); void execute(); }
});
window.launcher.onFocus(() => { query.focus(); query.select(); });
window.launcher.onNotice(text => message(text, true));
