const CardModal = {
  state: {
    files: [],
    filter: "all",
    search: ""
  },

  open(cardData) {
    // Configura cabeçalho
    document.getElementById("cardModalIcon").textContent = cardData.initial || cardData.title[0].toUpperCase();
    document.getElementById("cardModalTitle").textContent = cardData.title;
    document.getElementById("cardModalCreator").textContent = `por ${cardData.creator || "Desconhecido"}`;

    // Carrega arquivos do backend
    this.state.files = cardData.files ?? [];
    this.render();

    // Mostrar modal
    const overlay = document.getElementById("cardModalOverlay");
    const modal = document.getElementById("cardModal");

    overlay.style.display = "flex";
    requestAnimationFrame(() => modal.classList.add("open"));
  },

  close() {
    const overlay = document.getElementById("cardModalOverlay");
    const modal = document.getElementById("cardModal");
    modal.classList.remove("open");
    setTimeout(() => overlay.style.display = "none", 280);
  },

  render() {
    const list = document.getElementById("cardModalFiles");
    list.innerHTML = "";

    const visible = this.state.files.filter(f =>
      (this.state.filter === "all" || f.type === this.state.filter) &&
      (!this.state.search || f.name.toLowerCase().includes(this.state.search.toLowerCase()))
    );

    visible.forEach(f => {
      const el = document.createElement("div");
      el.className = "file";
      el.innerHTML = `
        <div class="file-left">
          <div class="file-icon"></div>
          <div class="file-meta">
            <div class="file-name">${f.name}</div>
            <div class="file-sub">${(f.size/1024).toFixed(1)} KB</div>
          </div>
        </div>
      `;
      list.appendChild(el);
    });
  }
};

// Eventos globais do Modal
document.getElementById("cardModalClose").onclick = () => CardModal.close();
document.getElementById("cardModalCloseFooter").onclick = () => CardModal.close();
document.getElementById("cardModalSearch").oninput = (e) => { CardModal.state.search = e.target.value; CardModal.render(); };
document.getElementById("cardModalFilterPanel").onclick = (e) => {
  const item = e.target.closest(".filter-item");
  if(!item) return;
  CardModal.state.filter = item.dataset.type;
  document.getElementById("cardModalFilterBtn").textContent = item.textContent + " ▾";
  CardModal.render();
};

function openCardModal(cardData) { CardModal.open(cardData); }
