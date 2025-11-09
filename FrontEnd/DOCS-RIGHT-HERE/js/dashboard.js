// ==========================================================
// CONFIGURAÇÃO
// ==========================================================
const API_BASE = "http://localhost:8080";

// ELEMENTOS DOM
const $cardsContainer = document.getElementById("cards"),
  $newCardBtn = document.getElementById("new-card"),
  $overlay = document.getElementById("cardModalOverlay"),
  $modal = document.getElementById("cardModal"),
  $modalTitle = document.getElementById("cardModalTitle"),
  $modalCreator = document.getElementById("cardModalCreator"),
  $modalFiles = document.getElementById("cardModalFiles"),
  $modalUploadInput = document.getElementById("cardModalUpload"),
  $modalEditBtn = document.getElementById("cardModalEdit"),
  $modalCloseTop = document.getElementById("cardModalClose"),
  $modalCloseFooter = document.getElementById("cardModalCloseFooter"),
  $modalIcon = document.getElementById("cardModalIcon"),
  $filterBtn = document.getElementById("cardModalFilterBtn"),
  $filterPanel = document.getElementById("cardModalFilterPanel"),
  $editOptionsContainer = document.getElementById("editOptionsContainer");

let currentCardId = null;
let currentFiles = [];
let currentFilter = "all";

// ==========================================================
// LOCAL STORAGE — SALVA ICON E COLOR
// ==========================================================
function saveCardStyle(id, data) {
  const saved = JSON.parse(localStorage.getItem("cardStyles") || "{}");
  saved[id] = { ...saved[id], ...data };
  localStorage.setItem("cardStyles", JSON.stringify(saved));
}

function getCardStyle(id) {
  const saved = JSON.parse(localStorage.getItem("cardStyles") || "{}");
  return saved[id] || {};
}

// ==========================================================
// FUNÇÕES AUXILIARES
// ==========================================================
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const fileExt = (name) =>
  name.lastIndexOf(".") >= 0
    ? name.substring(name.lastIndexOf(".") + 1)
    : "";

const badgeType = (ext) => {
  const t = (ext || "").toLowerCase();
  if (["pdf"].includes(t)) return "PDF";
  if (["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(t)) return "IMAGE";
  if (["xls", "xlsx", "csv"].includes(t)) return "EXCEL";
  if (["doc", "docx", "odt", "rtf", "txt", "md"].includes(t)) return "DOC";
  if (["ppt", "pptx"].includes(t)) return "PPT";
  return "FILE";
};

// ==========================================================
// FUNÇÃO EXTRA – ÍCONE DE ARQUIVO
// ==========================================================
function getFileLogo(ext) {
  const e = ext.toLowerCase();
  if (["pdf"].includes(e)) return "../img/PdfLogo.png";
  if (["doc", "docx", "odt", "rtf", "txt", "md"].includes(e))
    return "../img/wordLogo.png";
  if (["xls", "xlsx", "csv"].includes(e)) return "../img/ExcelLogo.png";
  if (["ppt", "pptx"].includes(e)) return "../img/PowerpointLogo.png";
  if (["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(e))
    return "../img/imageIcon.png";
  return "../img/fileIcon.png";
}

// ==========================================================
// API – CARDS
// ==========================================================
const apiGetCards = async () => {
  const r = await fetch(`${API_BASE}/api/card`);
  return r.status === 204 ? [] : r.json();
};
const apiGetCard = async (id) => {
  const r = await fetch(`${API_BASE}/api/card/${id}`);
  if (!r.ok) throw new Error("Card não encontrado");
  return r.json();
};
const apiCreateCard = async (data) => {
  const r = await fetch(`${API_BASE}/api/card`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!r.ok) throw new Error("Erro ao criar card");
  return r.json();
};
const apiUpdateCard = async (id, data) => {
  const r = await fetch(`${API_BASE}/api/card/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!r.ok) throw new Error("Erro ao atualizar card");
  return r.json();
};
const apiDeleteCard = async (id) => {
  const r = await fetch(`${API_BASE}/api/card/${id}`, { method: "DELETE" });
  if (!r.ok) throw new Error("Erro ao excluir card");
};

// ==========================================================
// API – FILES
// ==========================================================
const apiUploadFile = async (cardId, file) => {
  const fd = new FormData();
  fd.append("file", file);
  const r = await fetch(`${API_BASE}/api/file/${cardId}`, {
    method: "POST",
    body: fd,
  });
  if (!r.ok) throw new Error("Falha no upload");
  return r.json();
};

const apiDeleteFile = async (fileId) => {
  const r = await fetch(`${API_BASE}/api/file/${fileId}`, { method: "DELETE" });
  if (!r.ok && r.status !== 204) throw new Error("Erro ao excluir arquivo");
};

// ==========================================================
// RENDER – LISTA DE CARDS (com ícone e cor locais)
// ==========================================================
async function loadCards() {
  const lista = await apiGetCards();
  $cardsContainer.innerHTML = "";

  lista.forEach((card) => {
    const localStyle = getCardStyle(card.id);
    const color = localStyle.color || "#EFCB68";
    const icon = localStyle.icon;

    const $div = document.createElement("div");
    $div.className = "card";
    $div.dataset.cardId = card.id;

    $div.innerHTML = `
      <div class="icon" style="background:${color};">
        ${
          icon
            ? `<img src="../icones/${icon}.png" alt="${icon}">`
            : (card.title || "?").charAt(0).toUpperCase()
        }
      </div>
      <div class="info">
        <h4>${card.title || "Sem título"}</h4>
        <p>${card.author ? `por ${card.author}` : "por Maria Silva"}</p>
      </div>
      <div class="actions">
        <button class="ghost btn-excluir-card" data-id="${card.id}">Excluir</button>
        <button class="btn-abrir-card">Abrir</button>
        <span>${card.createdAt ? "agora" : "2 min atrás"}</span>
      </div>`;

    // Eventos
    $div
      .querySelector(".btn-abrir-card")
      .addEventListener("click", () => openCardModal(card.id));

    $div
      .querySelector(".btn-excluir-card")
      .addEventListener("click", async () => {
        await apiDeleteCard(card.id);
        localStorage.removeItem(`card_${card.id}`);
        await loadCards();
      });

    $cardsContainer.appendChild($div);
  });

  const $seeAll = document.createElement("a");
  $seeAll.href = "#";
  $seeAll.className = "see-all";
  $seeAll.textContent = "Ver todos cards";
  $cardsContainer.appendChild($seeAll);
}

// ==========================================================
// MODAL – ABRIR / POPULAR / FECHAR
// ==========================================================
async function openCardModal(cardId) {
  currentCardId = cardId;
  const card = await apiGetCard(cardId);
  const files = Array.isArray(card.files) ? card.files : [];
  const localStyle = getCardStyle(cardId);

  $modalTitle.textContent = card.title || "Sem título";
  $modalCreator.textContent = card.author
    ? `Criado por ${card.author}`
    : "Criado por ...";

  // Ícone e cor personalizados
  if (localStyle.icon) {
    $modalIcon.innerHTML = `<img src="../icones/${localStyle.icon}.png" alt="${localStyle.icon}" style="width:28px;height:28px;">`;
  } else {
    $modalIcon.textContent = (card.title || "D").trim().charAt(0).toUpperCase();
  }
  $modalIcon.style.background = localStyle.color || "#EFCB68";

  currentFiles = files.map((f) => ({
    id: f.id,
    name: f.originalFileName || f.name || `arquivo_${f.id}`,
    size: f.size || f.length || 0,
  }));

  renderFiles(currentFiles);
  showModal();
}

function showModal() {
  $overlay.style.display = "flex";
  setTimeout(() => {
    $overlay.classList.add("show");
    $modal.classList.add("show");
  }, 10);
}

async function closeCardModal() {
  $modal.classList.remove("show");
  $overlay.classList.remove("show");
  await sleep(300);
  $overlay.style.display = "none";
  document.body.style.overflow = "auto";
}

// ==========================================================
// MODAL – LISTAGEM DE ARQUIVOS
// ==========================================================
function renderFiles(list) {
  const filter = currentFilter.toLowerCase();
  const filteredList = list.filter((f) => {
    const ext = fileExt(f.name);
    if (filter === "all") return true;
    if (filter === "pdf") return ext === "pdf";
    if (filter === "image")
      return ["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(ext);
    if (filter === "excel") return ["xls", "xlsx", "csv"].includes(ext);
    if (filter === "doc") return ["doc", "docx"].includes(ext);
    return false;
  });

  $modalFiles.innerHTML = !filteredList.length
    ? `<p class="no-files">Nenhum arquivo encontrado para este filtro.</p>`
    : "";

  filteredList.forEach((f) => {
    const ext = fileExt(f.name);
    const logoPath = getFileLogo(ext);

    const $row = document.createElement("div");
    $row.className = "file-item";
    $row.innerHTML = `
      <span>
        <img src="${logoPath}" alt="${ext}" style="width:22px;height:22px;vertical-align:middle;margin-right:6px;">
        ${f.name}
      </span>
      <div>
        <span class="badge">${badgeType(ext)}</span>
        <a href="${API_BASE}/api/file/${f.id}" title="Baixar">
          <img src="../img/download.png" alt="Baixar" style="width:20px;height:20px;">
        </a>
        <button class="delete-file" data-id="${f.id}" title="Excluir" style="background:none;border:none;cursor:pointer;">
          <img src="../img/lixeirared.png" alt="Excluir" style="width:20px;height:20px;">
        </button>
      </div>`;

    $row.querySelector(".delete-file").addEventListener("click", async () => {
      await apiDeleteFile(f.id);
      const updated = await apiGetCard(currentCardId);
      currentFiles = (updated.files || []).map((ff) => ({
        id: ff.id,
        name: ff.originalFileName || ff.name || `arquivo_${ff.id}`,
        size: ff.size || ff.length || 0,
      }));
      renderFiles(currentFiles);
    });

    $modalFiles.appendChild($row);
  });
}

// ==========================================================
// UPLOAD DE ARQUIVOS
// ==========================================================
$modalUploadInput.addEventListener("change", async (e) => {
  if (!currentCardId) return;
  const files = Array.from(e.target.files || []);
  if (!files.length) return;

  for (const f of files) await apiUploadFile(currentCardId, f);

  const updated = await apiGetCard(currentCardId);
  currentFiles = (updated.files || []).map((ff) => ({
    id: ff.id,
    name: ff.originalFileName || ff.name || `arquivo_${ff.id}`,
    size: ff.size || ff.length || 0,
  }));

  renderFiles(currentFiles);
  e.target.value = "";
});

// ==========================================================
// EDIÇÃO DO CARD (TÍTULO + ÍCONE + COR)
// ==========================================================
$modalEditBtn.addEventListener("click", async () => {
  if (!currentCardId) return;

  // Alterna entre Editar / Salvar
  if ($modalEditBtn.dataset.mode !== "editing") {
    $modalEditBtn.dataset.mode = "editing";
    $modalEditBtn.textContent = "Salvar";

    const current = $modalTitle.textContent;
    $modalTitle.innerHTML = `<input id="editTitleInput" value="${current}" style="background:transparent;border:none;outline:none;color:var(--text);font:inherit;width:100%;">`;

    // Adiciona seletores de ícone e cor abaixo
    renderEditSelectors(currentCardId);

    // NOVO → mostra o container de opções
    document.getElementById("editOptionsContainer").style.display = "block";
  } else {
    const val =
      document.getElementById("editTitleInput").value.trim() || "Sem título";
    await apiUpdateCard(currentCardId, { title: val });
    $modalEditBtn.dataset.mode = "";
    $modalEditBtn.textContent = "Editar";
    $modalTitle.textContent = val;

    // NOVO → esconde novamente após salvar
    document.getElementById("editOptionsContainer").style.display = "none";
    document.getElementById("editOptionsContainer").innerHTML = "";

    await loadCards();
  }
});

function renderEditSelectors(cardId) {
  const localStyle = getCardStyle(cardId);
  const container = document.getElementById("editOptionsContainer");
  container.innerHTML = `
    <div class="icon-selection-edit">
      <p>Escolha um novo ícone:</p>
      <div class="icons-grid">
        ${["beca","calendarwhite","camera","cartawhite","IMGICON","livro","olho","paper","people","reuniaowhite"]
          .map(
            (icon) => `
          <img src="../icones/${icon}.png" data-icon="${icon}" 
          class="icon-option ${localStyle.icon === icon ? "selected" : ""}">
        `
          )
          .join("")}
      </div>

      <p>Escolha uma nova cor:</p>
      <div class="color-options">
        ${["#38d1a1","#EFCB68","#E74C3C","#3498DB","#9B59B6"]
          .map(
            (c) => `
          <button class="color-option" data-color="${c}" 
          style="background:${c};${localStyle.color === c ? "border:2px solid #fff;" : ""}"></button>
        `
          )
          .join("")}
      </div>
    </div>`;

  // Seletor de ícone
  container.querySelectorAll(".icon-option").forEach((el) => {
    el.addEventListener("click", () => {
      container.querySelectorAll(".icon-option").forEach((i) =>
        i.classList.remove("selected")
      );
      el.classList.add("selected");
      saveCardStyle(cardId, { icon: el.dataset.icon });
      const current = getCardStyle(cardId);
      $modalIcon.innerHTML = `<img src="../icones/${current.icon}.png" alt="${current.icon}" style="width:28px;height:28px;">`;
    });
  });

  // Seletor de cor
  container.querySelectorAll(".color-option").forEach((el) => {
    el.addEventListener("click", () => {
      container.querySelectorAll(".color-option").forEach((i) =>
        i.classList.remove("selected")
      );
      el.classList.add("selected");
      saveCardStyle(cardId, { color: el.dataset.color });
      const current = getCardStyle(cardId);
      $modalIcon.style.background = current.color;
    });
  });
}

// ==========================================================
// MODAL – FECHAR
// ==========================================================
$modalCloseTop.addEventListener("click", closeCardModal);
$modalCloseFooter.addEventListener("click", closeCardModal);
$overlay.addEventListener("click", (e) => {
  if (e.target === $overlay) closeCardModal();
});

// ==========================================================
// CRIAÇÃO DE NOVO CARD
// ==========================================================
const $newCardOverlay = document.getElementById("newCardOverlay"),
  $newCardTitleInput = document.getElementById("newCardTitleInput"),
  $createCardBtn = document.getElementById("createCardBtn"),
  $cancelCreateBtn = document.getElementById("cancelCreateBtn");

let selectedIcon = null;
let selectedColor = "#EFCB68";

// Seleção de ícone
document.querySelectorAll(".icon-option").forEach((el) => {
  el.addEventListener("click", () => {
    document.querySelectorAll(".icon-option").forEach((i) =>
      i.classList.remove("selected")
    );
    el.classList.add("selected");
    selectedIcon = el.dataset.icon;
  });
});

// Seleção de cor
document.querySelectorAll(".color-option").forEach((el) => {
  el.addEventListener("click", () => {
    document.querySelectorAll(".color-option").forEach((i) =>
      i.classList.remove("selected")
    );
    el.classList.add("selected");
    selectedColor = el.dataset.color;
  });
});

// Abrir modal de novo card
$newCardBtn.addEventListener("click", () => {
  $newCardOverlay.style.display = "flex";
  setTimeout(() => $newCardOverlay.classList.add("show"), 10);
  $newCardTitleInput.value = "";
  $newCardTitleInput.focus();
});

function closeNewCardModal() {
  $newCardOverlay.classList.remove("show");
  setTimeout(() => ($newCardOverlay.style.display = "none"), 250);
}
$cancelCreateBtn.addEventListener("click", closeNewCardModal);
$newCardOverlay.addEventListener("click", (e) => {
  if (e.target === $newCardOverlay) closeNewCardModal();
});

// Criar card
$createCardBtn.addEventListener("click", async () => {
  const title = $newCardTitleInput.value.trim();
  if (!title) return;
  try {
    const created = await apiCreateCard({ title });
    saveCardStyle(created.id, { icon: selectedIcon, color: selectedColor });
    closeNewCardModal();
    await loadCards();
    openCardModal(created.id);
  } catch (err) {
    alert("Erro ao criar card: " + err.message);
  }
});

// ==========================================================
// FILTRO DE TIPO DE ARQUIVO
// ==========================================================
if ($filterBtn && $filterPanel) {
  const hidePanel = () => {
    $filterPanel.style.display = "none";
    $filterBtn.setAttribute("aria-expanded", "false");
  };
  const showPanel = () => {
    $filterPanel.style.display = "block";
    $filterBtn.setAttribute("aria-expanded", "true");
  };

  hidePanel();

  $filterBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    const isOpen = $filterPanel.style.display === "block";
    isOpen ? hidePanel() : showPanel();
  });

  $filterPanel.querySelectorAll("li").forEach((li) => {
    li.addEventListener("click", () => {
      currentFilter = li.dataset.type || "all";
      $filterBtn.textContent = `${li.textContent} ▼`;
      hidePanel();
      renderFiles(currentFiles);
    });
  });

  document.addEventListener("click", (e) => {
    if (!$filterPanel.contains(e.target) && e.target !== $filterBtn) hidePanel();
  });
}

// ==========================================================
// INICIALIZAÇÃO
// ==========================================================
document.addEventListener("DOMContentLoaded", loadCards);
