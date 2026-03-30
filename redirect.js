function updateClock() {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    const s = String(now.getSeconds()).padStart(2, '0');
    document.getElementById('clock').textContent = `${h}:${m}:${s}`;
}
updateClock();
setInterval(updateClock, 1000);

const searchBar = document.getElementById('searchBar');
searchBar.addEventListener('keydown', function(e) {
    if (e.key !== 'Enter') return;
    let v = searchBar.value.trim();
    if (!v) return;
    let url = '';
    if (v.startsWith('!d ')) url = 'https://duckduckgo.com/?q=' + encodeURIComponent(v.replace('!d ', '').trim());
    else if (v.startsWith('!y ')) url = 'https://www.youtube.com/results?search_query=' + encodeURIComponent(v.replace('!y ', '').trim());
    else if (v.startsWith('!w ')) url = 'https://ru.wikipedia.org/wiki/Special:Search?search=' + encodeURIComponent(v.replace('!w ', '').trim());
    else url = 'https://www.google.com/search?q=' + encodeURIComponent(v);
    window.location.href = url;
    searchBar.value = '';
});

function toggleSettings() {
    const bgInput = document.getElementById('bgInput');
    bgInput.style.display = (bgInput.style.display === 'block') ? 'none' : 'block';
    if (bgInput.style.display === 'block') bgInput.focus();
}

document.getElementById('bgInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && this.value) {
        document.body.style.backgroundImage = `url('${this.value}')`;
        localStorage.setItem('customBG', this.value);
        this.style.display = 'none';
    }
});

window.addEventListener('load', function() {
    const saved = localStorage.getItem('customBG');
    if (saved) document.body.style.backgroundImage = `url('${saved}')`;
});

let shortcuts = JSON.parse(localStorage.getItem('myShortcuts')) || [];
let pendingIconData = null;
let editingIndex = -1;

function getIconSrc(item) {
    return item.iconData || `https://www.google.com/s2/favicons?sz=64&domain=${item.url}`;
}

function renderShortcuts() {
    const container = document.getElementById('shortcuts');
    container.innerHTML = '';

    shortcuts.forEach((item, index) => {
        const a = document.createElement('a');
        a.href = item.url;
        a.className = 'shortcut';
        
        a.addEventListener('click', playClick);
        a.addEventListener('mouseenter', () => {
            const snd = document.getElementById('hoverSound');
            if (snd) { snd.currentTime = 0; snd.volume = 0.3; snd.play().catch(() => {}); }
        });

        const delBtn = document.createElement('button');
        delBtn.className = 'del-btn';
        delBtn.title = 'Delete';
        delBtn.textContent = '×';
        delBtn.addEventListener('click', (e) => deleteShortcut(e, index));

        const editBtn = document.createElement('button');
        editBtn.className = 'edit-btn';
        editBtn.title = 'Edit';
        editBtn.textContent = '✎';
        editBtn.addEventListener('click', (e) => openEditModal(e, index));

        const img = document.createElement('img');
        img.src = getIconSrc(item);
        img.alt = 'icon';

        const p = document.createElement('p');
        p.textContent = item.name;

        a.appendChild(delBtn);
        a.appendChild(editBtn);
        a.appendChild(img);
        a.appendChild(p);
        container.appendChild(a);
    });

    if (shortcuts.length < 27) {
        const addBtn = document.createElement('div');
        addBtn.className = 'shortcut add-btn';
        addBtn.id = 'addShortcutBtn';
        addBtn.innerHTML = '<div class="add-icon">+</div><p>Add</p>';
        addBtn.addEventListener('click', openAddModal);
        container.appendChild(addBtn);
    }
}

function openAddModal() {
    pendingIconData = null;
    document.getElementById('shortcutName').value = '';
    document.getElementById('shortcutUrl').value = '';
    document.getElementById('addIconUrl').value = '';
    resetIconPreview('add');
    document.getElementById('addModal').style.display = 'flex';
    document.getElementById('shortcutName').focus();
}

function closeAddModal() {
    document.getElementById('addModal').style.display = 'none';
    pendingIconData = null;
}

function saveShortcut() {
    let name = document.getElementById('shortcutName').value.trim();
    let url = document.getElementById('shortcutUrl').value.trim();
    if (!name || !url) return;
    if (!url.startsWith('http')) url = 'https://' + url;
    const item = { name, url };
    if (pendingIconData) item.iconData = pendingIconData;
    shortcuts.push(item);
    localStorage.setItem('myShortcuts', JSON.stringify(shortcuts));
    renderShortcuts();
    closeAddModal();
}

function openEditModal(e, index) {
    e.preventDefault();
    e.stopPropagation();
    editingIndex = index;
    pendingIconData = null;
    const item = shortcuts[index];
    document.getElementById('editName').value = item.name;
    document.getElementById('editUrl').value = item.url;
    document.getElementById('editIconUrl').value = '';
    const preview = document.getElementById('editIconPreview');
    preview.src = getIconSrc(item);
    preview.style.display = 'block';
    document.getElementById('editModal').style.display = 'flex';
    document.getElementById('editName').focus();
}

function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
    editingIndex = -1;
    pendingIconData = null;
}

function saveEdit() {
    if (editingIndex < 0) return;
    let name = document.getElementById('editName').value.trim();
    let url = document.getElementById('editUrl').value.trim();
    if (!name || !url) return;
    if (!url.startsWith('http')) url = 'https://' + url;
    shortcuts[editingIndex].name = name;
    shortcuts[editingIndex].url = url;
    if (pendingIconData) shortcuts[editingIndex].iconData = pendingIconData;
    localStorage.setItem('myShortcuts', JSON.stringify(shortcuts));
    renderShortcuts();
    closeEditModal();
}

function deleteShortcut(e, index) {
    e.preventDefault();
    e.stopPropagation();
    shortcuts.splice(index, 1);
    localStorage.setItem('myShortcuts', JSON.stringify(shortcuts));
    renderShortcuts();
}

function showIconPreview(mode, src) {
    const preview = document.getElementById(mode + 'IconPreview');
    preview.src = src;
    preview.style.display = 'block';
}

function resetIconPreview(mode) {
    const preview = document.getElementById(mode + 'IconPreview');
    preview.src = '';
    preview.style.display = 'none';
}

function playClick() {
    const sound = document.getElementById('clickSound');
    if (sound) { sound.currentTime = 0; sound.volume = 0.3; sound.play().catch(() => {}); }
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('settingsBtn').addEventListener('click', toggleSettings);

    document.getElementById('saveShortcutBtn').addEventListener('click', saveShortcut);
    document.getElementById('closeAddModalBtn').addEventListener('click', closeAddModal);
    document.getElementById('saveEditBtn').addEventListener('click', saveEdit);
    document.getElementById('closeEditModalBtn').addEventListener('click', closeEditModal);

    document.getElementById('applyAddIconBtn').addEventListener('click', () => {
        const val = document.getElementById('addIconUrl').value.trim();
        if (!val) return;
        pendingIconData = val;
        showIconPreview('add', val);
    });

    document.getElementById('applyEditIconBtn').addEventListener('click', () => {
        const val = document.getElementById('editIconUrl').value.trim();
        if (!val) return;
        pendingIconData = val;
        showIconPreview('edit', val);
    });

    document.getElementById('addIconFile').addEventListener('change', function() {
        const file = this.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => { pendingIconData = e.target.result; showIconPreview('add', pendingIconData); };
        reader.readAsDataURL(file);
    });

    document.getElementById('editIconFile').addEventListener('change', function() {
        const file = this.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => { pendingIconData = e.target.result; showIconPreview('edit', pendingIconData); };
        reader.readAsDataURL(file);
    });

    document.getElementById('shortcutName').addEventListener('keydown', e => { if (e.key === 'Enter') document.getElementById('shortcutUrl').focus(); });
    document.getElementById('shortcutUrl').addEventListener('keydown', e => { if (e.key === 'Enter') saveShortcut(); });
    document.getElementById('editName').addEventListener('keydown', e => { if (e.key === 'Enter') document.getElementById('editUrl').focus(); });
    document.getElementById('editUrl').addEventListener('keydown', e => { if (e.key === 'Enter') saveEdit(); });

    document.getElementById('addModal').addEventListener('click', function(e) { if (e.target === this) closeAddModal(); });
    document.getElementById('editModal').addEventListener('click', function(e) { if (e.target === this) closeEditModal(); });

    renderShortcuts();
});