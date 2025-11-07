// dashboard.js
// All interactions for dashboard + card expandido

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const abrirBtns = document.querySelectorAll('.abrir-btn');
  const excluirCardBtns = document.querySelectorAll('.card .actions .ghost');
  const overlay = document.getElementById('cardExpandido');
  const overlayContent = document.querySelector('.card-expandido-content');
  const fecharBtn = document.getElementById('fecharCard');
  const fecharRodape = document.getElementById('ce-close-bottom'); // not present, kept for future
  const ceTitle = document.getElementById('ce-title');
  const ceSub = document.getElementById('ce-sub');
  const ceTime = document.getElementById('ce-time');
  const ceIcon = document.getElementById('ce-icon');
  const ceSearch = document.getElementById('ce-search');
  const ceAttachBtn = document.getElementById('ce-attach');
  const ceEditTitleBtn = document.getElementById('ce-edit-title');
  const ceEditIconBtn = document.getElementById('ce-edit-icon');
  const ceFileList = document.getElementById('ce-file-list');
  const ceFileInput = document.getElementById('ce-file-input');
  const ceCloseBottom = document.getElementById('ce-close-bottom');

  // Data: store per-card files and metadata using Map keyed by cardId (data-id)
  const cardData = new Map();

  // init cardData for existing cards with sample files (no blobs)
  const cardElements = document.querySelectorAll('.card');
  cardElements.forEach(cardEl => {
    const id = cardEl.dataset.id || generateId();
    if (!cardEl.dataset.id) cardEl.dataset.id = id;

    // sample placeholder files (no blob)
    const sampleFiles = [
      { name: 'Documento_exemplo.pdf', type: 'pdf', fileObj: null },
      { name: 'Comprovante.jpg', type: 'image', fileObj: null }
    ];

    cardData.set(id, {
      files: [...sampleFiles],
      iconClass: getIconClassFromCard(cardEl), // doc/green/purple
    });
  });

  // Utility functions
  function generateId() {
    return 'card-' + Math.random().toString(36).slice(2, 9);
  }

  function getIconClassFromCard(cardEl) {
    const icon = cardEl.querySelector('.icon');
    if (!icon) return 'doc';
    if (icon.classList.contains('green')) return 'green';
    if (icon.classList.contains('purple')) return 'purple';
    return 'doc';
  }

  function setCardIconClass(cardEl, newClass) {
    const icon = cardEl.querySelector('.icon');
    if (!icon) return;
    icon.classList.remove('doc','green','purple');
    icon.classList.add(newClass);
  }

  // Render files for a given card id (with optional search filter)
  function renderFileList(cardId, filter = '') {
    const data = cardData.get(cardId);
    if (!data) return;
    const files = data.files.filter(f => f.name.toLowerCase().includes(filter.toLowerCase()));
    ceFileList.innerHTML = '';
    if (files.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'ce-file-item';
      empty.textContent = 'Nenhum arquivo encontrado';
      ceFileList.appendChild(empty);
      return;
    }

    files.forEach((file, index) => {
      const item = document.createElement('div');
      item.className = 'ce-file-item';

      const info = document.createElement('div');
      info.className = 'ce-file-info';
      const name = document.createElement('div');
      name.className = 'ce-file-name';
      name.textContent = file.name;
      const ftype = document.createElement('div');
      ftype.className = 'ce-file-type';
      ftype.textContent = file.type || '';

      info.appendChild(name);
      info.appendChild(ftype);

      const actions = document.createElement('div');
      actions.className = 'ce-file-actions';

      // download button
      const btnDownload = document.createElement('button');
      btnDownload.title = 'Baixar';
      btnDownload.innerHTML = '⬇️';
      btnDownload.addEventListener('click', () => handleDownload(cardId, file));

      // share (copy name)
      const btnShare = document.createElement('button');
      btnShare.title = 'Copiar nome/compartilhar';
      btnShare.innerHTML = '🔗';
      btnShare.addEventListener('click', () => {
        navigator.clipboard?.writeText(window.location.href + ' | ' + file.name)
          .then(() => alert('Link/nome copiado para a área de transferência.'))
          .catch(() => alert('Copiar indisponível; nome: ' + file.name));
      });

      // delete file
      const btnDelete = document.createElement('button');
      btnDelete.title = 'Excluir';
      btnDelete.innerHTML = '🗑️';
      btnDelete.addEventListener('click', () => {
        if (confirm(`Excluir "${file.name}"?`)) {
          // find real index in array
          const arr = data.files;
          const idx = arr.indexOf(file);
          if (idx > -1) {
            arr.splice(idx, 1);
            renderFileList(cardId, ceSearch.value);
          }
        }
      });

      actions.appendChild(btnDownload);
      actions.appendChild(btnShare);
      actions.appendChild(btnDelete);

      item.appendChild(info);
      item.appendChild(actions);
      ceFileList.appendChild(item);
    });
  }

  // Handle downloads: if File object exists, use blob URL, otherwise fallback to alert
  function handleDownload(cardId, file) {
    if (file.fileObj instanceof File) {
      const url = URL.createObjectURL(file.fileObj);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.fileObj.name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } else {
      alert(`Download não disponível para "${file.name}" (arquivo de exemplo).`);
    }
  }

  // OPEN card expandido
  let currentCardId = null;
  abrirBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const cardEl = e.target.closest('.card');
      if (!cardEl) return;
      const id = cardEl.dataset.id;
      currentCardId = id;

      // set title, author, time, icon
      const title = cardEl.dataset.title || cardEl.querySelector('h4')?.textContent || 'Sem título';
      const author = cardEl.dataset.author || cardEl.querySelector('.info p')?.textContent || '';
      const desc = cardEl.dataset.description || '';
      const timeText = cardEl.querySelector('.actions span')?.textContent || '';

      ceTitle.textContent = title;
      document.getElementById('ce-time').textContent = timeText;
      ceSub.textContent = author ? author : '';
      // icon
      const data = cardData.get(id);
      if (data && data.iconClass) {
        ceIcon.className = 'ce-icon ' + data.iconClass;
      } else {
        ceIcon.className = 'ce-icon doc';
      }

      // ensure overlay visible and accessible
      overlay.classList.add('ativo');
      overlay.setAttribute('aria-hidden', 'false');

      // render file list for this card
      renderFileList(id);
      ceSearch.value = '';
      // focus search input
      setTimeout(() => ceSearch.focus(), 120);
    });
  });

  // CLOSE overlay
  function closeOverlay() {
    overlay.classList.remove('ativo');
    overlay.setAttribute('aria-hidden', 'true');
    currentCardId = null;
  }
  fecharBtn.addEventListener('click', closeOverlay);
  if (ceCloseBottom) ceCloseBottom.addEventListener('click', closeOverlay);

  // click outside content to close
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeOverlay();
  });

  // DELETE card (ghost button)
  // Use event delegation because there might be multiple (or future) cards
  document.addEventListener('click', (e) => {
    if (e.target.matches('.card .actions .ghost') || e.target.closest('.card .actions .ghost')) {
      const btn = e.target.closest('.ghost');
      if (!btn) return;
      const cardEl = btn.closest('.card');
      const id = cardEl.dataset.id;
      if (confirm('Remover este card?')) {
        // remove DOM
        cardEl.remove();
        // remove data
        cardData.delete(id);
        // if overlay is showing this card, close it
        if (currentCardId === id) closeOverlay();
      }
    }
  });

  // Attach files (button triggers hidden input)
  ceAttachBtn.addEventListener('click', () => {
    ceFileInput.click();
  });

  ceFileInput.addEventListener('change', (e) => {
    const files = Array.from(e.target.files);
    if (!currentCardId) {
      alert('Nenhum card selecionado.');
      return;
    }
    const data = cardData.get(currentCardId);
    if (!data) {
      cardData.set(currentCardId, { files: [], iconClass: 'doc' });
    }

    files.forEach(f => {
      data.files.push({
        name: f.name,
        type: f.type || f.name.split('.').pop(),
        fileObj: f
      });
    });

    renderFileList(currentCardId, ceSearch.value);
    // clear input so same file can be uploaded again if needed
    ceFileInput.value = '';
  });

  // Search inside card files
  ceSearch.addEventListener('input', (e) => {
    if (!currentCardId) return;
    renderFileList(currentCardId, e.target.value);
  });

  // Edit title
  ceEditTitleBtn.addEventListener('click', () => {
    if (!currentCardId) return;
    const current = ceTitle.textContent || '';
    const novo = prompt('Editar título do card:', current);
    if (novo === null) return;
    ceTitle.textContent = novo;

    // Update the original card DOM and data-* attribute so it persists visually
    const originalCard = document.querySelector(`.card[data-id="${currentCardId}"]`);
    if (originalCard) {
      originalCard.dataset.title = novo;
      const h4 = originalCard.querySelector('h4');
      if (h4) h4.textContent = novo;
    }
  });

  // Edit icon: toggles between doc, green, purple
  ceEditIconBtn.addEventListener('click', () => {
    if (!currentCardId) return;
    const data = cardData.get(currentCardId) || { iconClass: 'doc' };
    const classes = ['doc','green','purple'];
    const currentIdx = classes.indexOf(data.iconClass) >= 0 ? classes.indexOf(data.iconClass) : 0;
    const nextIdx = (currentIdx + 1) % classes.length;
    data.iconClass = classes[nextIdx];
    cardData.set(currentCardId, data);

    // update overlay icon
    ceIcon.className = 'ce-icon ' + data.iconClass;

    // update original card icon
    const originalCard = document.querySelector(`.card[data-id="${currentCardId}"]`);
    if (originalCard) {
      setCardIconClass(originalCard, data.iconClass);
    }
  });

  // Initialize accessibility: pressing ESC closes
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('ativo')) {
      closeOverlay();
    }
  });

  // If there are cards added later dynamically, you may need to re-run binding for abrirBtns;
  // helper to attach to new .abrir-btns
  function bindNewOpenButtons() {
    document.querySelectorAll('.abrir-btn').forEach(btn => {
      if (!btn._ceBound) {
        btn.addEventListener('click', (e) => {
          // delegate to the same open logic above
          const cardEl = e.target.closest('.card');
          if (!cardEl) return;
          const id = cardEl.dataset.id || (cardEl.dataset.id = generateId());
          currentCardId = id;
          const title = cardEl.dataset.title || cardEl.querySelector('h4')?.textContent || 'Sem título';
          const author = cardEl.dataset.author || cardEl.querySelector('.info p')?.textContent || '';
          const timeText = cardEl.querySelector('.actions span')?.textContent || '';
          ceTitle.textContent = title;
          ceSub.textContent = author;
          document.getElementById('ce-time').textContent = timeText;
          const data = cardData.get(id) || { iconClass: getIconClassFromCard(cardEl) };
          cardData.set(id, data);
          ceIcon.className = 'ce-icon ' + (data.iconClass || 'doc');
          overlay.classList.add('ativo');
          renderFileList(id);
        });
        btn._ceBound = true;
      }
    });
  }

  // run once
  bindNewOpenButtons();

  // expose some helpers for debugging (optional)
  window._DOCS_CARD_DATA = cardData;
});
