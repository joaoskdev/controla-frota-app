document.addEventListener('deviceready', onDeviceReady, false);

const API_URL = 'https://api-notas-csu2.onrender.com/notas';

function onDeviceReady() {
    console.log('Device is ready');
    
    // Event listeners para os botões
    document.getElementById('btnCadastrarVeiculo').addEventListener('click', showCadastroVeiculo);
    document.getElementById('btnListarVeiculos').addEventListener('click', showListaVeiculos);
    document.getElementById('btnCadastrarProduto').addEventListener('click', showCadastroProduto);
    document.getElementById('btnRegistrarManutencao').addEventListener('click', showRegistroManutencao);
}

// Função para mostrar modal (sem jQuery)
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
    
    // Limpar modal quando fechar
    modalElement.addEventListener('hidden.bs.modal', function () {
        modalContainer.innerHTML = '';
    });
}

// Função para mostrar alerta
function showAlert(message, title = 'Aviso') {
    if (navigator.notification && navigator.notification.alert) {
        navigator.notification.alert(message, null, title);
    } else {
        alert(`${title}: ${message}`);
    }
}

// Cadastro de Veículo
function showCadastroVeiculo() {
    const form = `
        <form id="veiculoForm">
            <div class="mb-3">
                <label for="placa" class="form-label">Placa</label>
                <input type="text" class="form-control" id="placa" required>
            </div>
            <div class="mb-3">
                <label for="marca" class="form-label">Marca</label>
                <input type="text" class="form-control" id="marca" required>
            </div>
            <div class="mb-3">
                <label for="modelo" class="form-label">Modelo</label>
                <input type="text" class="form-control" id="modelo" required>
            </div>
            <div class="mb-3">
                <label for="ano" class="form-label">Ano</label>
                <input type="number" class="form-control" id="ano" required>
            </div>
            <button type="submit" class="btn btn-primary">Salvar</button>
        </form>
    `;
    
    showModal('Cadastrar Veículo', form);
    
    // Adicionar event listener ao formulário
    setTimeout(() => {
        const formElement = document.getElementById('veiculoForm');
        if (formElement) {
            formElement.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const veiculo = {
                    tipo: 'veiculo',
                    placa: document.getElementById('placa').value,
                    marca: document.getElementById('marca').value,
                    modelo: document.getElementById('modelo').value,
                    ano: document.getElementById('ano').value,
                    timestamp: new Date()
                };
                
                salvarDados(veiculo, 'Veículo cadastrado com sucesso!');
            });
        }
    }, 100);
}

// Cadastro de Produto
function showCadastroProduto() {
    const form = `
        <form id="produtoForm">
            <div class="mb-3">
                <label for="placaVeiculo" class="form-label">Placa do Veículo</label>
                <input type="text" class="form-control" id="placaVeiculo" required>
            </div>
            <div class="mb-3">
                <label for="nomeProduto" class="form-label">Nome do Produto</label>
                <input type="text" class="form-control" id="nomeProduto" required>
            </div>
            <div class="mb-3">
                <label for="quantidade" class="form-label">Quantidade</label>
                <input type="number" class="form-control" id="quantidade" required>
            </div>
            <button type="submit" class="btn btn-primary">Salvar</button>
        </form>
    `;
    
    showModal('Cadastrar Produto', form);
    
    // Adicionar event listener ao formulário
    setTimeout(() => {
        const formElement = document.getElementById('produtoForm');
        if (formElement) {
            formElement.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const produto = {
                    tipo: 'produto',
                    placaVeiculo: document.getElementById('placaVeiculo').value,
                    nome: document.getElementById('nomeProduto').value,
                    quantidade: document.getElementById('quantidade').value,
                    timestamp: new Date()
                };
                
                salvarDados(produto, 'Produto cadastrado com sucesso!');
            });
        }
    }, 100);
}

// Registro de Manutenção
function showRegistroManutencao() {
    const form = `
        <form id="manutencaoForm">
            <div class="mb-3">
                <label for="placaVeiculoManutencao" class="form-label">Placa do Veículo</label>
                <input type="text" class="form-control" id="placaVeiculoManutencao" required>
            </div>
            <div class="mb-3">
                <label for="tituloManutencao" class="form-label">Título da Manutenção</label>
                <input type="text" class="form-control" id="tituloManutencao" required>
            </div>
            <div class="mb-3">
                <label for="descricaoManutencao" class="form-label">Descrição</label>
                <textarea class="form-control" id="descricaoManutencao" rows="3" required></textarea>
            </div>
            <div class="mb-3">
                <label for="kmManutencao" class="form-label">KM do Veículo</label>
                <input type="number" class="form-control" id="kmManutencao" required>
            </div>
            <button type="submit" class="btn btn-primary">Salvar</button>
        </form>
    `;
    
    showModal('Registrar Manutenção', form);
    
    // Adicionar event listener ao formulário
    setTimeout(() => {
        const formElement = document.getElementById('manutencaoForm');
        if (formElement) {
            formElement.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const manutencao = {
                    tipo: 'manutencao',
                    placaVeiculo: document.getElementById('placaVeiculoManutencao').value,
                    titulo: document.getElementById('tituloManutencao').value,
                    descricao: document.getElementById('descricaoManutencao').value,
                    km: document.getElementById('kmManutencao').value,
                    timestamp: new Date()
                };
                
                salvarDados(manutencao, 'Manutenção registrada com sucesso!');
            });
        }
    }, 100);
}

// Listar Veículos
function showListaVeiculos() {
    fetch(API_URL)
        .then(response => response.json())
        .then(data => {
            let content = '<h4>Veículos Cadastrados</h4>';
            
            if (data.veiculos && data.veiculos.length > 0) {
                content += '<ul class="list-group">';
                data.veiculos.forEach(veiculo => {
                    content += `
                        <li class="list-group-item">
                            <strong>${veiculo.placa}</strong> - ${veiculo.marca} ${veiculo.modelo} (${veiculo.ano})
                        </li>
                    `;
                });
                content += '</ul>';
            } else {
                content += '<p>Nenhum veículo cadastrado.</p>';
            }
            
            showModal('Lista de Veículos', content);
        })
        .catch(error => {
            console.error('Erro ao buscar veículos:', error);
            showAlert('Erro ao carregar veículos. Verifique sua conexão.', 'Erro');
        });
}

// Função para salvar dados no backend
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
        // Fechar o modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('myModal'));
        if (modal) {
            modal.hide();
        }
    })
    .catch(error => {
        console.error('Erro ao salvar dados:', error);
        showAlert('Erro ao salvar. Verifique sua conexão.', 'Erro');
    });
}