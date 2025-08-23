document.addEventListener('deviceready', onDeviceReady, false);

const API_URL = 'https://api-notas-csu2.onrender.com/notas';

function onDeviceReady() {
    console.log('Device is ready');
    carregarVeiculos();
    
    document.getElementById('btnNovoVeiculo').addEventListener('click', showCadastroVeiculo);
}

function carregarVeiculos() {
    fetch(`${API_URL}/veiculos`)
        .then(response => response.json())
        .then(veiculos => {
            document.getElementById('loading').style.display = 'none';
            
            if (veiculos.length === 0) {
                document.getElementById('semVeiculos').style.display = 'block';
                return;
            }
            
            const listaContainer = document.getElementById('listaVeiculos');
            listaContainer.innerHTML = '';
            
            veiculos.forEach(veiculo => {
                const veiculoCard = `
                    <div class="col-md-6 col-lg-4 mb-3">
                        <div class="card veiculo-card" data-id="${veiculo._id}">
                            <div class="card-body">
                                <h5 class="card-title veiculo-placa">${veiculo.placa}</h5>
                                <h6 class="card-subtitle mb-2 text-muted">${veiculo.marca} ${veiculo.modelo}</h6>
                                <p class="card-text">Ano: ${veiculo.ano}</p>
                                <small class="text-muted">Cadastrado em: ${new Date(veiculo.createdAt).toLocaleDateString()}</small>
                            </div>
                        </div>
                    </div>
                `;
                listaContainer.innerHTML += veiculoCard;
            });
            
            // Adicionar event listeners aos cards
            document.querySelectorAll('.veiculo-card').forEach(card => {
                card.addEventListener('click', function() {
                    const veiculoId = this.getAttribute('data-id');
                    abrirDetalhesVeiculo(veiculoId);
                });
            });
        })
        .catch(error => {
            console.error('Erro ao carregar veículos:', error);
            document.getElementById('loading').innerHTML = `
                <div class="alert alert-danger">
                    Erro ao carregar veículos. Verifique sua conexão.
                </div>
                <button class="btn btn-primary mt-2" onclick="carregarVeiculos()">Tentar Novamente</button>
            `;
        });
}

function abrirDetalhesVeiculo(veiculoId) {
    localStorage.setItem('veiculoSelecionado', veiculoId);
    window.location.href = 'veiculo.html';
}

function showCadastroVeiculo() {
    const form = `
        <form id="veiculoForm">
            <div class="mb-3">
                <label for="placa" class="form-label">Placa *</label>
                <input type="text" class="form-control" id="placa" required maxlength="7">
            </div>
            <div class="mb-3">
                <label for="marca" class="form-label">Marca *</label>
                <input type="text" class="form-control" id="marca" required>
            </div>
            <div class="mb-3">
                <label for="modelo" class="form-label">Modelo *</label>
                <input type="text" class="form-control" id="modelo" required>
            </div>
            <div class="mb-3">
                <label for="ano" class="form-label">Ano *</label>
                <input type="number" class="form-control" id="ano" required min="1900" max="${new Date().getFullYear() + 1}">
            </div>
            <button type="submit" class="btn btn-primary">Salvar Veículo</button>
        </form>
    `;
    
    showModal('Cadastrar Novo Veículo', form);
    
    setTimeout(() => {
        const formElement = document.getElementById('veiculoForm');
        if (formElement) {
            formElement.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const veiculo = {
                    tipo: 'veiculo',
                    placa: document.getElementById('placa').value.toUpperCase(),
                    marca: document.getElementById('marca').value,
                    modelo: document.getElementById('modelo').value,
                    ano: parseInt(document.getElementById('ano').value)
                };
                
                salvarDados(veiculo, 'Veículo cadastrado com sucesso!');
            });
        }
    }, 100);
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
        carregarVeiculos();
    })
    .catch(error => {
        console.error('Erro ao salvar dados:', error);
        showAlert('Erro ao salvar. Verifique sua conexão.', 'Erro');
    });
}

function showAlert(message, title = 'Aviso') {
    if (navigator.notification && navigator.notification.alert) {
        navigator.notification.alert(message, null, title);
    } else {
        alert(`${title}: ${message}`);
    }
}

// Função global para recarregar veículos
window.carregarVeiculos = carregarVeiculos;