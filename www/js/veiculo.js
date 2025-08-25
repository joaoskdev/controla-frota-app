document.addEventListener("deviceready", onDeviceReady, false);

const API_URL = "https://api-notas-csu2.onrender.com/notas";
let veiculoAtual = null;

// -------------------- Inicialização --------------------

async function onDeviceReady() {
  console.log("Device is ready");
  await carregarVeiculo();

  document.getElementById("btnVoltar")?.addEventListener("click", () => {
    window.location.href = "index.html";
  });
  document
    .getElementById("btnEditarVeiculo")
    ?.addEventListener("click", editarVeiculo);
  document
    .getElementById("btnExcluirVeiculo")
    ?.addEventListener("click", excluirVeiculo);
  document
    .getElementById("btnManutencao")
    ?.addEventListener("click", showManutencao);
  document
    .getElementById("btnCatalogoProdutos")
    ?.addEventListener("click", showCatalogoProdutos);
}

// -------------------- Modais e Alertas --------------------

function showModal(title, content) {
  const modalContainer = document.getElementById("modalContainer");
  modalContainer.innerHTML = `
    <div class="modal fade" id="myModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">${title}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">${content}</div>
        </div>
      </div>
    </div>
  `;

  const modalElement = document.getElementById("myModal");
  const modal = new bootstrap.Modal(modalElement);

  modalElement.addEventListener("hidden.bs.modal", () => {
    modalContainer.innerHTML = "";
    document.body.classList.remove("modal-open");
    document.body.style.overflow = "";
    document.body.style.paddingRight = "";
    document.querySelectorAll(".modal-backdrop").forEach((b) => b.remove());
  });

  modal.show();
  return modalElement;
}

function showAlert(message, title = "Aviso") {
  if (navigator.notification && navigator.notification.alert) {
    navigator.notification.alert(message, null, title);
  } else {
    alert(`${title}: ${message}`);
  }
}

// -------------------- Veículo --------------------

async function carregarVeiculo() {
  const veiculoId = localStorage.getItem("veiculoSelecionado");

  if (!veiculoId) {
    showAlert("Veículo não selecionado", "Erro");
    window.location.href = "index.html";
    return;
  }

  try {
    const response = await fetch(`${API_URL}/veiculos`);
    const veiculos = await response.json();
    veiculoAtual = veiculos.find((v) => v._id === veiculoId);

    if (!veiculoAtual) {
      showAlert("Veículo não encontrado", "Erro");
      window.location.href = "index.html";
      return;
    }

    const tituloEl = document.getElementById("tituloVeiculo");
    if (tituloEl) tituloEl.textContent = veiculoAtual.placa;

    const infoEl = document.getElementById("veiculoInfo");
    if (infoEl)
      infoEl.textContent = `${veiculoAtual.marca} ${veiculoAtual.modelo}`;

    const detalhesEl = document.getElementById("veiculoDetalhes");
    if (detalhesEl)
      detalhesEl.textContent = `Ano: ${veiculoAtual.ano} | Placa: ${veiculoAtual.placa}`;

    await carregarContadores();
    await carregarManutencoesRecentes();
  } catch (error) {
    console.error("Erro ao carregar veículo:", error);
    showAlert("Erro ao carregar dados do veículo", "Erro");
  }
}

async function carregarContadores() {
  if (!veiculoAtual) return;

  try {
    const [manutencoesRes, produtosRes] = await Promise.all([
      fetch(`${API_URL}/manutencoes/${veiculoAtual.placa}`),
      fetch(`${API_URL}/produtos/${veiculoAtual.placa}`),
    ]);

    const manutencoes = await manutencoesRes.json();
    const produtos = await produtosRes.json();

    const manutencoesEl = document.getElementById("contadorManutencoes");
    if (manutencoesEl)
      manutencoesEl.textContent = `${manutencoes.length} registros`;

    const produtosEl = document.getElementById("contadorProdutos");
    if (produtosEl) {
      const totalItens = produtos.reduce((total, p) => total + p.quantidade, 0);
      produtosEl.textContent = `${produtos.length} tipos | ${totalItens} itens`;
    }
  } catch (error) {
    console.error("Erro ao carregar contadores:", error);
  }
}

// -------------------- Veículo: editar / excluir --------------------

function editarVeiculo() {
  if (!veiculoAtual) return;

  const form = `
    <form id="editarVeiculoForm">
      <div class="mb-3">
        <label class="form-label">Placa *</label>
        <input type="text" class="form-control" id="placaVeiculo" value="${veiculoAtual.placa}" required>
      </div>
      <div class="mb-3">
        <label class="form-label">Marca *</label>
        <input type="text" class="form-control" id="marcaVeiculo" value="${veiculoAtual.marca}" required>
      </div>
      <div class="mb-3">
        <label class="form-label">Modelo *</label>
        <input type="text" class="form-control" id="modeloVeiculo" value="${veiculoAtual.modelo}" required>
      </div>
      <div class="mb-3">
        <label class="form-label">Ano *</label>
        <input type="number" class="form-control" id="anoVeiculo" value="${veiculoAtual.ano}" required>
      </div>
      <button type="submit" class="btn btn-primary">Salvar Alterações</button>
    </form>
  `;

  const modalElement = showModal("Editar Veículo", form);

  modalElement.addEventListener("shown.bs.modal", () => {
    const formEl = document.getElementById("editarVeiculoForm");
    formEl.addEventListener("submit", async (e) => {
      e.preventDefault();
      const dadosAtualizados = {
        placa: document.getElementById("placaVeiculo").value,
        marca: document.getElementById("marcaVeiculo").value,
        modelo: document.getElementById("modeloVeiculo").value,
        ano: parseInt(document.getElementById("anoVeiculo").value),
      };
      try {
        await fetch(`${API_URL}/veiculos/${veiculoAtual._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dadosAtualizados),
        });
        showAlert("Veículo atualizado com sucesso!", "Sucesso");
        bootstrap.Modal.getInstance(modalElement).hide();
        carregarVeiculo();
      } catch (error) {
        console.error(error);
        showAlert("Erro ao atualizar veículo", "Erro");
      }
    });
  });
}

function excluirVeiculo() {
  if (!veiculoAtual) return;

  if (confirm(`Deseja realmente excluir o veículo ${veiculoAtual.placa}?`)) {
    fetch(`${API_URL}/veiculos/${veiculoAtual._id}`, { method: "DELETE" })
      .then(() => {
        showAlert("Veículo excluído com sucesso!", "Sucesso");
        window.location.href = "index.html";
      })
      .catch((err) => {
        console.error(err);
        showAlert("Erro ao excluir veículo", "Erro");
      });
  }
}

// -------------------- Manutenção --------------------

function showManutencao() {
  if (!veiculoAtual) return;

  const form = `
    <form id="manutencaoForm">
      <div class="mb-3">
        <label class="form-label">Veículo</label>
        <input type="text" class="form-control" value="${
          veiculoAtual.placa
        } - ${veiculoAtual.marca} ${veiculoAtual.modelo}" disabled>
      </div>
      <div class="mb-3">
        <label for="tituloManutencao" class="form-label">Título da Manutenção *</label>
        <input type="text" class="form-control" id="tituloManutencao" required>
      </div>
      <div class="mb-3">
        <label for="descricaoManutencao" class="form-label">Descrição *</label>
        <textarea class="form-control" id="descricaoManutencao" rows="3" required></textarea>
      </div>
      <div class="mb-3">
        <label for="kmManutencao" class="form-label">KM do Veículo *</label>
        <input type="number" class="form-control" id="kmManutencao" required min="0">
      </div>
      <div class="mb-3">
        <label for="custoManutencao" class="form-label">Custo (R$)</label>
        <input type="number" class="form-control" id="custoManutencao" step="0.01" min="0">
      </div>
      <div class="mb-3">
        <label for="dataManutencao" class="form-label">Data da Manutenção</label>
        <input type="date" class="form-control" id="dataManutencao" value="${
          new Date().toISOString().split("T")[0]
        }">
      </div>
      <button type="submit" class="btn btn-primary">Salvar Manutenção</button>
    </form>
  `;

  const modalElement = showModal("Nova Manutenção", form);

  modalElement.addEventListener("shown.bs.modal", () => {
    const formEl = document.getElementById("manutencaoForm");
    formEl.addEventListener("submit", async (e) => {
      e.preventDefault();
      const manutencao = {
        titulo: document.getElementById("tituloManutencao").value,
        descricao: document.getElementById("descricaoManutencao").value,
        km: parseInt(document.getElementById("kmManutencao").value),
        custo:
          parseFloat(document.getElementById("custoManutencao").value) || 0,
        dataManutencao:
          document.getElementById("dataManutencao").value ||
          new Date().toISOString(),
      };
      try {
        await fetch(
          `${API_URL}/veiculos/${veiculoAtual._id}/catalogo-produtos`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(manutencao),
          }
        );
        showAlert("Manutenção registrada com sucesso!", "Sucesso");
        bootstrap.Modal.getInstance(modalElement).hide();
        carregarContadores();
        carregarManutencoesRecentes();
      } catch (error) {
        console.error(error);
        showAlert("Erro ao salvar manutenção.", "Erro");
      }
    });
  });
}

async function carregarManutencoesRecentes() {
  if (!veiculoAtual) return;
  try {
    const response = await fetch(
      `${API_URL}/manutencoes/${veiculoAtual.placa}`
    );
    const manutencoes = await response.json();
    const listaManutencoes = document.getElementById("listaManutencoes");
    listaManutencoes.innerHTML = "";

    if (!manutencoes.length) {
      listaManutencoes.innerHTML =
        '<div class="text-center text-muted py-3">Nenhuma manutenção registrada</div>';
      return;
    }

    manutencoes.sort(
      (a, b) => new Date(b.dataManutencao) - new Date(a.dataManutencao)
    );
    manutencoes.slice(0, 3).forEach((m) => {
      const data = new Date(m.dataManutencao).toLocaleDateString();
      listaManutencoes.innerHTML += `
        <div class="list-group-item">
          <div class="d-flex w-100 justify-content-between">
            <h6 class="mb-1">${m.titulo}</h6>
            <small>${data}</small>
          </div>
          <p class="mb-1">${m.descricao}</p>
          <small class="text-muted">KM: ${m.km} | Custo: R$ ${
        m.custo || "0,00"
      }</small>
        </div>
      `;
    });

    document.getElementById("manutencoesSection").style.display = "block";
  } catch (error) {
    console.error("Erro ao carregar manutenções:", error);
  }
}

// -------------------- Catálogo de Produtos --------------------

async function showCatalogoProdutos() {
  if (!veiculoAtual) return;
  try {
    const response = await fetch(
      `${API_URL}/veiculos/${veiculoAtual._id}/catalogo-produtos`
    );
    const produtos = await response.json();

    let lista = produtos.map(p => `
      <div class="list-group-item d-flex justify-content-between align-items-center">
        <div>
          <h6>${p.titulo}</h6>
          ${p.descricao ? `<small>${p.descricao}</small>` : ""}
        </div>
        <button class="btn btn-sm btn-danger" onclick="excluirItemCatalogo('${p._id}')">Excluir</button>
      </div>
    `).join("");

    if (!produtos.length)
      lista =
        '<div class="text-center text-muted py-3">Nenhum produto cadastrado</div>';

    // botão para novo produto
    const botoes = `
      <div class="mt-3 text-end">
        <button class="btn btn-success btn-sm" onclick="showNovoProdutoForm()">
          <i class="bi bi-plus-lg"></i> Novo Produto
        </button>
      </div>
    `;

    showModal(
      "Catálogo de Produtos",
      `<div class="list-group">${lista}</div>${botoes}`
    );
  } catch (error) {
    console.error(error);
    showAlert("Erro ao carregar catálogo de produtos", "Erro");
  }
}

function showNovoProdutoForm() {
  showModal(
    "Novo Produto",
    `
    <form id="formNovoProduto">
      <div class="mb-3">
        <label class="form-label">Título</label>
        <input type="text" class="form-control" name="titulo" required>
      </div>
      <div class="mb-3">
        <label class="form-label">Descrição</label>
        <textarea class="form-control" name="descricao"></textarea>
      </div>
      <button type="submit" class="btn btn-success">Salvar</button>
    </form>
  `
  );

  document
    .getElementById("formNovoProduto")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = Object.fromEntries(new FormData(e.target).entries());

      try {
        const response = await fetch(
          `${API_URL}/veiculos/${veiculoAtual._id}/catalogo-produtos`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
          }
        );

        if (!response.ok) throw new Error("Erro ao salvar produto");
        await response.json();

        showAlert("Produto adicionado com sucesso!", "Sucesso");
        showCatalogoProdutos(); // recarrega lista
      } catch (error) {
        console.error(error);
        showAlert("Erro ao salvar produto", "Erro");
      }
    });
}

async function excluirItemCatalogo(catalogoProdutoId) {
  try {
    const resp = await fetch(`${API_URL}/catalogo-produtos/${catalogoProdutoId}`, {
      method: "DELETE",
    });

    if (!resp.ok) {
      const err = await resp.text();
      throw new Error(`DELETE falhou: ${resp.status} - ${err}`);
    }

    showAlert("Produto do catálogo excluído com sucesso!", "Sucesso");
    showCatalogoProdutos(); // recarrega a lista no modal
    carregarContadores();
  } catch (error) {
    console.error(error);
    showAlert("Erro ao excluir produto do catálogo", "Erro");
  }
}
