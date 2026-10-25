// 1. Create the button
const btn = document.createElement('div');
btn.innerHTML =
  '<svg xmlns="http://www.w3.org/2000/svg" height="19px" viewBox="0 -960 960 960" width="19px" fill="#0e0e0e"><path d="M784-120 532-372q-30 24-69 38t-83 14q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l252 252-56 56ZM380-400q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z"/></svg>';

btn.style =
  'cursor:pointer; width:35px; height:35px; display:flex; align-items:center; justify-content:center; user-select:none; border-radius:50%; ';

btn.onmouseover = () => {
  btn.style.background = '#e8ebee';
};
btn.onmouseout = () => {
  btn.style.background = 'transparent';
};

// 2. Change the native buttons bar styles to accept more buttons
const nativeSheetButtons = document.querySelector('.docs-sheet-button-bar');
if (nativeSheetButtons) {
  nativeSheetButtons.style.display = 'flex';
}

// 3. Add the search button to the UI before the List button
const nativeSheetListButton = document.querySelector('.docs-sheet-menu-button');

if (nativeSheetListButton) {
  nativeSheetListButton.before(btn);
} else {
  btn.style =
    'position:fixed; bottom:3px; left:10px; z-index:10000; background:#fff; border:1px solid #ccc; padding:12px; border-radius:8px; display:none; width:280px; box-shadow:0 4px 20px rgba(0,0,0,0.2); font-family:sans-serif;';
  document.body.appendChild(btn);
}

// 4. Create the search box
const box = document.createElement('div');

box.id = 'customSheetSearchBox';

box.style =
  'position:fixed; bottom:70px; left:10px; z-index:10000; background:#fff; border:1px solid #ccc; padding:12px; border-radius:8px; display:none; width:280px; box-shadow:0 4px 20px rgba(0,0,0,0.2); font-family:sans-serif;';
box.innerHTML = `
    <input type="text" id="sheetSearchInput" placeholder="Buscar pestaña..." style="width:100%; padding:10px; box-sizing:border-box; border:1px solid #4285f4; border-radius:4px; outline:none; font-size:14px;">
    <div id="sheetResults" style="max-height:300px; overflow-y:auto; margin-top:8px; border-top:1px solid #eee;"></div>
`;
document.body.appendChild(box);

// Keep direct references to avoid repeated DOM lookups.
const input = box.querySelector('#sheetSearchInput');
const results = box.querySelector('#sheetResults');

let selectedIndex = 0;
let lastTerm = null;

// 5. Toggle box visibility
const toggleBox = () => {
  const isHidden = box.style.display === 'none';
  box.style.display = isHidden ? 'block' : 'none';
  if (isHidden) {
    input.value = '';
    input.focus();
    selectedIndex = 0;
    lastTerm = null;
    actualizarLista('');
  }
};

btn.onclick = toggleBox;

// 6. Search logic and jump
function actualizarLista(term) {
  // Search for tab names in Google Sheets data model
  const tabs = Array.from(document.querySelectorAll('.docs-sheet-tab-name'));
  results.innerHTML = '';

  // Reset the selection only when the search term actually changes.
  if (term !== lastTerm) {
    selectedIndex = 0;
    lastTerm = term;
  }

  const filtrados = tabs.filter((t) => t.innerText.toLowerCase().includes(term.toLowerCase()));

  // Keep the selected index within the current result range.
  if (filtrados.length === 0) {
    selectedIndex = 0;
  } else {
    selectedIndex = Math.min(selectedIndex, filtrados.length - 1);
  }

  filtrados.forEach((t, i) => {
    const item = document.createElement('div');
    item.innerText = t.innerText;
    item.className = 'sheet-item-result';
    item.style = `padding:10px; cursor:pointer; border-bottom:1px solid #eee; font-size:13px; ${
      i === selectedIndex ? 'background:#e8f0fe; color:#1a73e8; font-weight:bold;' : ''
    }`;

    item.onclick = () => {
      // Forcing mouse events to Google Sheets to respond
      const mouseDown = new MouseEvent('mousedown', { bubbles: true, cancelable: true, view: window });
      const mouseUp = new MouseEvent('mouseup', { bubbles: true, cancelable: true, view: window });
      t.dispatchEvent(mouseDown);
      t.dispatchEvent(mouseUp);
      box.style.display = 'none';
    };
    results.appendChild(item);
  });
}

// 7. Handle keyboard navigation
input.onkeyup = (e) => {
  if (e.key === 'Enter') {
    const items = results.querySelectorAll('.sheet-item-result');
    if (items[selectedIndex]) items[selectedIndex].click();
    return;
  }
  if (e.key === 'ArrowDown') selectedIndex++;
  if (e.key === 'ArrowUp') selectedIndex--;

  actualizarLista(e.target.value);
};

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && document.querySelector('#customSheetSearchBox').style.display === 'block') {
    document.querySelector('#customSheetSearchBox').style.display = 'none';
    document.querySelector('#sheetSearchInput').value = '';
  }
});

document.addEventListener('click', (e) => {
  const searchBox = document.querySelector('#customSheetSearchBox');
  if (!searchBox.contains(e.target) && !btn.contains(e.target) && searchBox.style.display === 'block') {
    searchBox.style.display = 'none';
    document.querySelector('#sheetSearchInput').value = '';
  }
});

// Preserve any previously assigned keydown handler instead of replacing it outright.
const previousOnKeyDown = document.onkeydown;
document.onkeydown = (e) => {
  if (e.altKey && e.key.toLowerCase() === 's') {
    toggleBox();
  }
  if (typeof previousOnKeyDown === 'function') {
    previousOnKeyDown(e);
  }
};