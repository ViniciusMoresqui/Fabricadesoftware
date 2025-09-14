document.addEventListener("DOMContentLoaded", () => {
  const fileIcons = {
    pdf: "/DOCS RIGHT HERE/img/PdfLogo.png",
    doc: "/DOCS RIGHT HERE/img/wordLogo.png",
    docx: "/DOCS RIGHT HERE/img/wordLogo.png",
    xls: "/DOCS RIGHT HERE/img/ExcelLogo.png",
    xlsx: "/DOCS RIGHT HERE/img/ExcelLogo.png",
    ppt: "/DOCS RIGHT HERE/img/PowerpointLogo.png",
    pptx: "/DOCS RIGHT HERE/img/PowerpointLogo.png"
  };

  const cards = document.querySelectorAll(".card");

  document.addEventListener("click", (e) => {
    const expandedCard = document.querySelector(".card.expanded");
    if (
      expandedCard &&
      !expandedCard.contains(e.target)
    ) {
      closeExpandedCard(expandedCard);
    }
  });

  cards.forEach((card) => {
    const content = card.querySelector(".card-content");
    const attachArea = card.querySelector(".attachments-area");
    const selectBox = card.querySelector(".card-select");

    card.addEventListener("click", (e) => {
      if (!card.classList.contains("expanded")) expandCard(card);
    });

    if (selectBox) {
      selectBox.addEventListener("change", () => {
        const attachments = attachArea.querySelectorAll(".attachment");
        if (selectBox.checked) {
          attachments.forEach((att) => {
            let checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.className = "attachment-select";
            att.insertBefore(checkbox, att.firstChild);
          });

          if (!card.querySelector(".delete-files-btn")) {
            const deleteBtn = document.createElement("button");
            deleteBtn.className = "delete-files-btn";
            deleteBtn.textContent = "Excluir arquivos selecionados";

            deleteBtn.addEventListener("click", () => {
              attachArea.querySelectorAll(".attachment-select:checked").forEach((cb) => {
                cb.parentElement.remove();
              });
              deleteBtn.remove();
              shareBtn?.remove();
              selectBox.checked = false;
            });

            const shareBtn = document.createElement("button");
            shareBtn.className = "share-files-btn";
            shareBtn.textContent = "Compartilhar arquivos selecionados";

            shareBtn.addEventListener("click", () => {
              const selected = [];
              attachArea.querySelectorAll(".attachment-select:checked").forEach((cb) => {
                selected.push(cb.parentElement.querySelector("a").href);
              });
              if (selected.length) {
                alert("Links para compartilhar:\n" + selected.join("\n"));
              }
            });

            attachArea.appendChild(deleteBtn);
            attachArea.appendChild(shareBtn);
          }
        } else {
          attachArea.querySelectorAll(".attachment-select").forEach((cb) => cb.remove());
          card.querySelector(".delete-files-btn")?.remove();
          card.querySelector(".share-files-btn")?.remove();
        }
      });
    }

    if (!card.querySelector(".clip-fixed")) {
      const clipBtn = document.createElement("button");
      clipBtn.className = "clip-fixed";
      clipBtn.innerHTML = `<img src="/DOCS RIGHT HERE/img/ClipeAnexo.png" alt="Anexar" />`;
      clipBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx";
        input.addEventListener("change", () => {
          const file = input.files[0];
          if (file) {
            const ext = file.name.split(".").pop().toLowerCase();
            const icon = fileIcons[ext] || "/DOCS RIGHT HERE/img/default.png";

            const wrapper = document.createElement("div");
            wrapper.className = "attachment";

            const img = document.createElement("img");
            img.src = icon;
            img.alt = "icon";
            img.className = "attachment-icon";

            const link = document.createElement("a");
            link.href = URL.createObjectURL(file);
            link.textContent = file.name;
            link.target = "_blank";
            link.setAttribute("download", file.name);

            wrapper.appendChild(img);
            wrapper.appendChild(link);

            attachArea.appendChild(wrapper);
          }
        });
        input.click();
      });
      card.appendChild(clipBtn);
    }
  });

  function expandCard(card) {
    card.classList.add("expanded");
    document.querySelectorAll(".card").forEach((c) => {
      if (c !== card) c.classList.add("blur-background");
    });
    if (!card.querySelector(".close-button")) {
      const closeBtn = document.createElement("button");
      closeBtn.classList.add("close-button");
      closeBtn.innerHTML = "✖";
      closeBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        closeExpandedCard(card);
      });
      card.appendChild(closeBtn);
    }
  }

  function closeExpandedCard(card) {
    card.classList.remove("expanded");
    document.querySelectorAll(".card").forEach((c) =>
      c.classList.remove("blur-background")
    );
    const closeBtn = card.querySelector(".close-button");
    if (closeBtn) closeBtn.remove();

    const selectBox = card.querySelector(".card-select");
    if (selectBox) {
      selectBox.checked = false;
      card.querySelectorAll(".attachment-select").forEach((cb) => cb.remove());
      card.querySelector(".delete-files-btn")?.remove();
      card.querySelector(".share-files-btn")?.remove();
    }
  }
});
