document.addEventListener('deviceready', onDeviceReady, false);

const API_URL = 'https://api-notas-csu2.onrender.com/notas';
let veiculoAtual = null;

function onDeviceReady() {
    console.log('Device is ready');
    carregarVeiculo();
    
    document.getElementById('btnVoltar').addEventListener('click', function() {
        window.location.href = 'index.html';
    });
    
    document.getElementById('btnEditarVeiculo').addEventListener('click', editarVeiculo);
    document.getElementById('btnExcluirVeiculo').addEventListener('click', excluirVeiculo);
    document.getElementById('btnManutencao').addEventListener('click', showManutencao);
    document.getElementById('btnCatalogoProdutos').addEventListener('click', showCatalogoProdutos);
}

function adicionarProdutoAoVeiculo(catalogoProdutoId) {
    const form = `
        <form id="adicionarProdutoForm">
            <div class="mb-3">
                <label class="form-label">Veículo</label>
                <input type="text" class="form-control" value="${veiculoAtual.placa} - ${veiculoAtual.marca} ${veiculoAtual.modelo}" disabled>
            </div>
            <div class="mb-3">
                <label for="quantidadeProduto" class="form-label">Quantidade *</label>
                <input type="number" class="form-control" id="quantidadeProduto" required min="1" value="1">
            </div>
            <div class="mb-3">
                <label for="observacoesProduto" class="form-label">Observações</label>
                <textarea class="form-control" id="observacoesProduto" rows="2" placeholder="Opcional"></textarea>
            </div>
            <button type="submit" class="btn btn-primary">Adicionar ao Veículo</button>
        </form>
    `;
    
    showModal('Adicionar Produto ao Veículo', form);
    
    setTimeout(() => {
        const formElement = document.getElementById('adicionarProdutoForm');
        if (formElement) {
            formElement.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const produto = {
                    tipo: 'produto',
                    placaVeiculo: veiculoAtual.placa,
                    catalogoProdutoId: catalogoProdutoId,
                    quantidade: parseInt(document.getElementById('quantidadeProduto').value),
                    observacoes: document.getElementById('observacoesProduto').value
                };
                
                salvarDados(produto, 'Produto adicionado ao veículo com sucesso!');
            });
        }
    }, 100);
}

function showNovoProdutoCatalogo() {
    const form = `
        <form id="novoProdutoCatalogoForm">
            <div class="mb-3">
                <label for="tituloProduto" class="form-label">Título do Produto *</label>
                <input type="text" class="form-control" id="tituloProduto" required>
            </div>
            <div class="mb-3">
                <label for="descricaoProduto" class="form-label">Descrição</label>
                <textarea class="form-control" id="descricaoProduto" rows="3" placeholder="Descreva o produto..."></textarea>
            </div>
            <div class="mb-3">
                <label for="categoriaProduto" class="form-label">Categoria</label>
                <input type="text" class="form-control" id="categoriaProduto" placeholder="Ex: Lubrificantes, Filtros, etc.">
            </div>
            <button type="submit" class="btn btn-primary">Cadastrar Produto</button>
        </form>
    `;
    
    showModal('Novo Produto no Catálogo', form);
    
    setTimeout(() => {
        const formElement = document.getElementById('novoProdutoCatalogoForm');
        if (formElement) {
            formElement.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const produtoCatalogo = {
                    titulo: document.getElementById('tituloProduto').value,
                    descricao: document.getElementById('descricaoProduto').value,
                    categoria: document.getElementById('categoriaProduto').value
                };
                
                // Salvar no catálogo
                fetch(`${API_URL}/catalogo-produtos`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(produtoCatalogo)
                })
                .then(response => response.json())
                .then(data => {
                    showAlert('Produto cadastrado no catálogo com sucesso!', 'Sucesso');
                    const modal = bootstrap.Modal.getInstance(document.getElementById('myModal'));
                    if (modal) modal.hide();
                    showCatalogoProdutos(); // Recarregar catálogo
                })
                .catch(error => {
                    console.error('Erro ao cadastrar produto:', error);
                    showAlert('Erro ao cadastrar produto', 'Erro');
                });
            });
        }
    }, 100);
}

function showCatalogoProdutos() {
    fetch(`${API_URL}/catalogo-produtos`)
        .then(response => response.json())
        .then(produtos => {
            let content = `
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h5>Catálogo de Produtos</h5>
                    <button class="btn btn-sm btn-success" onclick="showNovoProdutoCatalogo()">
                        <i class="bi bi-plus"></i> Novo
                    </button>
                </div>
            `;

            if (produtos.length === 0) {
                content += `
                    <div class="text-center py-4">
                        <i class="bi bi-journal-x" style="font-size: 3rem;"></i>
                        <p class="mt-2">Nenhum produto no catálogo</p>
                    </div>
                `;
            } else {
                content += '<div class="list-group">';
                produtos.forEach(produto => {
                    content += `
                        <div class="list-group-item">
                            <div class="d-flex justify-content-between align-items-start">
                                <div>
                                    <h6 class="mb-1">${produto.titulo}</h6>
                                    ${produto.descricao ? `<p class="mb-1 small">${produto.descricao}</p>` : ''}
                                    ${produto.categoria ? `<span class="badge bg-secondary">${produto.categoria}</span>` : ''}
                                </div>
                                <div>
                                    <button class="btn btn-sm btn-outline-primary" onclick="adicionarProdutoAoVeiculo('${produto._id}')">
                                        <i class="bi bi-cart-plus"></i> Adicionar
                                    </button>
                                </div>
                            </div>
                        </div>
                    `;
                });
                content += '</div>';
            }

            showModal('Catálogo de Produtos', content);
        })
        .catch(error => {
            console.error('Erro ao carregar catálogo:', error);
            showAlert('Erro ao carregar catálogo de produtos', 'Erro');
        });
}

function carregarVeiculo() {
    const veiculoId = localStorage.getItem('veiculoSelecionado');
    
    if (!veiculoId) {
        showAlert('Veículo não selecionado', 'Erro');
        window.location.href = 'index.html';
        return;
    }
    
    fetch(`${API_URL}/veiculos`)
        .then(response => response.json())
        .then(veiculos => {
            veiculoAtual = veiculos.find(v => v._id === veiculoId);
            
            if (!veiculoAtual) {
                showAlert('Veículo não encontrado', 'Erro');
                window.location.href = 'index.html';
                return;
            }
            
            // Atualizar interface
            document.getElementById('tituloVeiculo').textContent = veiculoAtual.placa;
            document.getElementById('veiculoInfo').textContent = `${veiculoAtual.marca} ${veiculoAtual.modelo}`;
            document.getElementById('veiculoDetalhes').textContent = `Ano: ${veiculoAtual.ano} | Placa: ${veiculoAtual.placa}`;
            
            // Carregar contadores
            carregarContadores();
            carregarManutencoesRecentes();
            carregarProdutos();
        })
        .catch(error => {
            console.error('Erro ao carregar veículo:', error);
            showAlert('Erro ao carregar dados do veículo', 'Erro');
        });
}

function carregarContadores() {
    // Carregar contagem de manutenções
    fetch(`${API_URL}/manutencoes/${veiculoAtual.placa}`)
        .then(response => response.json())
        .then(manutencoes => {
            document.getElementById('contadorManutencoes').textContent = `${manutencoes.length} registros`;
        })
        .catch(error => {
            console.error('Erro ao carregar manutenções:', error);
        });
    
    // Carregar contagem de produtos
    fetch(`${API_URL}/produtos/${veiculoAtual.placa}`)
        .then(response => response.json())
        .then(produtos => {
            document.getElementById('contadorProdutos').textContent = `${produtos.length} itens`;
        })
        .catch(error => {
            console.error('Erro ao carregar produtos:', error);
        });

    fetch(`${API_URL}/produtos/${veiculoAtual.placa}`)
        .then(response => response.json())
        .then(produtos => {
            const totalItens = produtos.reduce((total, produto) => total + produto.quantidade, 0);
            document.getElementById('contadorProdutos').textContent = `${produtos.length} tipos | ${totalItens} itens`;
        })
        .catch(error => {
            console.error('Erro ao carregar produtos:', error);
        });
}

function carregarManutencoesRecentes() {
    fetch(`${API_URL}/manutencoes/${veiculoAtual.placa}`)
        .then(response => response.json())
        .then(manutencoes => {
            const listaManutencoes = document.getElementById('listaManutencoes');
            listaManutencoes.innerHTML = '';
            
            if (manutencoes.length === 0) {
                listaManutencoes.innerHTML = '<div class="text-center text-muted py-3">Nenhuma manutenção registrada</div>';
                return;
            }
            
            // Ordenar por data (mais recente primeiro)
            manutencoes.sort((a, b) => new Date(b.dataManutencao) - new Date(a.dataManutencao));
            
            // Mostrar apenas as 3 mais recentes
            const recentes = manutencoes.slice(0, 3);
            
            recentes.forEach(manutencao => {
                const data = new Date(manutencao.dataManutencao).toLocaleDateString();
                const item = `
                    <div class="list-group-item">
                        <div class="d-flex w-100 justify-content-between">
                            <h6 class="mb-1">${manutencao.titulo}</h6>
                            <small>${data}</small>
                        </div>
                        <p class="mb-1">${manutencao.descricao}</p>
                        <small class="text-muted">KM: ${manutencao.km} | Custo: R$ ${manutencao.custo || '0,00'}</small>
                    </div>
                `;
                listaManutencoes.innerHTML += item;
            });
            
            document.getElementById('manutencoesSection').style.display = 'block';
        })
        .catch(error => {
            console.error('Erro ao carregar manutenções:', error);
        });
}

function carregarProdutos() {
    fetch(`${API_URL}/produtos/${veiculoAtual.placa}`)
        .then(response => response.json())
        .then(async (produtos) => {
            const listaProdutos = document.getElementById('listaProdutos');
            listaProdutos.innerHTML = '';
            
            if (produtos.length === 0) {
                listaProdutos.innerHTML = '<div class="text-center text-muted py-3">Nenhum produto no veículo</div>';
                return;
            }
            
            // Buscar informações do catálogo para cada produto
            for (const produto of produtos) {
                try {
                    const response = await fetch(`${API_URL}/catalogo-produtos/${produto.catalogoProdutoId}`);
                    const produtoCatalogo = await response.json();
                    
                    const item = `
                        <div class="list-group-item">
                            <div class="d-flex w-100 justify-content-between">
                                <h6 class="mb-1">${produtoCatalogo.titulo}</h6>
                                <span class="badge bg-primary rounded-pill">${produto.quantidade}x</span>
                            </div>
                            ${produtoCatalogo.descricao ? `<p class="mb-1 small">${produtoCatalogo.descricao}</p>` : ''}
                            ${produto.observacoes ? `<small class="text-muted">Obs: ${produto.observacoes}</small>` : ''}
                        </div>
                    `;
                    listaProdutos.innerHTML += item;
                } catch (error) {
                    console.error('Erro ao carregar detalhes do produto:', error);
                }
            }
            
            document.getElementById('produtosSection').style.display = 'block';
        })
        .catch(error => {
            console.error('Erro ao carregar produtos:', error);
        });
}

function editarVeiculo() {
    const form = `
        <form id="editarVeiculoForm">
            <div class="mb-3">
                <label for="placa" class="form-label">Placa *</label>
                <input type="text" class="form-control" id="placa" value="${veiculoAtual.placa}" required maxlength="7">
            </div>
            <div class="mb-3">
                <label for="marca" class="form-label">Marca *</label>
                <input type="text" class="form-control" id="marca" value="${veiculoAtual.marca}" required>
            </div>
            <div class="mb-3">
                <label for="modelo" class="form-label">Modelo *</label>
                <input type="text" class="form-control" id="modelo" value="${veiculoAtual.modelo}" required>
            </div>
            <div class="mb-3">
                <label for="ano" class="form-label">Ano *</label>
                <input type="number" class="form-control" id="ano" value="${veiculoAtual.ano}" required min="1900" max="${new Date().getFullYear() + 1}">
            </div>
            <button type="submit" class="btn btn-primary">Salvar Alterações</button>
        </form>
    `;
    
    showModal('Editar Veículo', form);
    
    setTimeout(() => {
        const formElement = document.getElementById('editarVeiculoForm');
        if (formElement) {
            formElement.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const dadosAtualizados = {
                    tipo: 'veiculo',
                    placa: document.getElementById('placa').value.toUpperCase(),
                    marca: document.getElementById('marca').value,
                    modelo: document.getElementById('modelo').value,
                    ano: parseInt(document.getElementById('ano').value),
                    _id: veiculoAtual._id
                };
                
                // Para atualizar, vamos usar o método PUT (você precisará implementar no backend)
                fetch(`${API_URL}/veiculos/${veiculoAtual._id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(dadosAtualizados)
                })
                .then(response => response.json())
                .then(data => {
                    showAlert('Veículo atualizado com sucesso!', 'Sucesso');
                    const modal = bootstrap.Modal.getInstance(document.getElementById('myModal'));
                    if (modal) modal.hide();
                    carregarVeiculo(); // Recarregar dados
                })
                .catch(error => {
                    console.error('Erro ao atualizar veículo:', error);
                    showAlert('Erro ao atualizar veículo', 'Erro');
                });
            });
        }
    }, 100);
}

function excluirVeiculo() {
    if (confirm('Tem certeza que deseja excluir este veículo? Esta ação não pode ser desfeita.')) {
        fetch(`${API_URL}/veiculos/${veiculoAtual._id}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            showAlert('Veículo excluído com sucesso!', 'Sucesso');
            window.location.href = 'index.html';
        })
        .catch(error => {
            console.error('Erro ao excluir veículo:', error);
            showAlert('Erro ao excluir veículo', 'Erro');
        });
    }
}

function showManutencao() {
    const form = `
        <form id="manutencaoForm">
            <div class="mb-3">
                <label class="form-label">Veículo</label>
                <input type="text" class="form-control" value="${veiculoAtual.placa} - ${veiculoAtual.marca} ${veiculoAtual.modelo}" disabled>
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
                <input type="date" class="form-control" id="dataManutencao" value="${new Date().toISOString().split('T')[0]}">
            </div>
            <button type="submit" class="btn btn-primary">Registrar Manutenção</button>
        </form>
    `;
    
    showModal('Registrar Manutenção', form);
    
    setTimeout(() => {
        const formElement = document.getElementById('manutencaoForm');
        if (formElement) {
            formElement.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const manutencao = {
                    tipo: 'manutencao',
                    placaVeiculo: veiculoAtual.placa,
                    titulo: document.getElementById('tituloManutencao').value,
                    descricao: document.getElementById('descricaoManutencao').value,
                    km: parseInt(document.getElementById('kmManutencao').value),
                    custo: parseFloat(document.getElementById('custoManutencao').value) || 0,
                    dataManutencao: document.getElementById('dataManutencao').value || new Date()
                };
                
                salvarDados(manutencao, 'Manutenção registrada com sucesso!');
            });
        }
    }, 100);
}

function showProdutos() {
    const form = `
        <form id="produtoForm">
            <div class="mb-3">
                <label class="form-label">Veículo</label>
                <input type="text" class="form-control" value="${veiculoAtual.placa} - ${veiculoAtual.marca} ${veiculoAtual.modelo}" disabled>
            </div>
            <div class="mb-3">
                <label for="nomeProduto" class="form-label">Nome do Produto *</label>
                <input type="text" class="form-control" id="nomeProduto" required>
            </div>
            <div class="mb-3">
                <label for="quantidadeProduto" class="form-label">Quantidade *</label>
                <input type="number" class="form-control" id="quantidadeProduto" required min="1">
            </div>
            <div class="mb-3">
                <label for="descricaoProduto" class="form-label">Descrição</label>
                <textarea class="form-control" id="descricaoProduto" rows="2"></textarea>
            </div>
            <button type="submit" class="btn btn-primary">Adicionar Produto</button>
        </form>
    `;
    
    showModal('Adicionar Produto', form);
    
    setTimeout(() => {
        const formElement = document.getElementById('produtoForm');
        if (formElement) {
            formElement.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const produto = {
                    tipo: 'produto',
                    placaVeiculo: veiculoAtual.placa,
                    nome: document.getElementById('nomeProduto').value,
                    quantidade: parseInt(document.getElementById('quantidadeProduto').value),
                    descricao: document.getElementById('descricaoProduto').value
                };
                
                salvarDados(produto, 'Produto adicionado com sucesso!');
            });
        }
    }, 100);
}

function salvarDados(dados, mensagemSucesso) {
    fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(dados)
    })
    .then(response => response.json())
    .then(data => {
        showAlert(mensagemSucesso, 'Sucesso');
        const modal = bootstrap.Modal.getInstance(document.getElementById('myModal'));
        if (modal) modal.hide();
        
        // Recarregar os dados relevantes
        if (dados.tipo === 'manutencao') {
            carregarContadores();
            carregarManutencoesRecentes();
        } else if (dados.tipo === 'produto') {
            carregarContadores();
            carregarProdutos();
        }
    })
    .catch(error => {
        console.error('Erro ao salvar dados:', error);
        showAlert('Erro ao salvar. Verifique sua conexão.', 'Erro');
    });
}

function showModal(title, content) {
    const modalContainer = document.getElementById('modalContainer');
    
    const modalHTML = `
        <div class="modal fade" id="myModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">${title}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        ${content}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    modalContainer.innerHTML = modalHTML;
    
    const modalElement = document.getElementById('myModal');
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
    
    modalElement.addEventListener('hidden.bs.modal', function () {
        modalContainer.innerHTML = '';
    });
}

function showAlert(message, title = 'Aviso') {
    if (navigator.notification && navigator.notification.alert) {
        navigator.notification.alert(message, null, title);
    } else {
        alert(`${title}: ${message}`);
    }
}