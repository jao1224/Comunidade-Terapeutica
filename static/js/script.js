// JavaScript para o site CACVI - Versão Simplificada

document.addEventListener('DOMContentLoaded', function() {
    
    // Menu Mobile
    const menuToggle = document.getElementById('menu-toggle');
    const navList = document.getElementById('nav-list');
    
    if (menuToggle && navList) {
        menuToggle.addEventListener('click', function() {
            menuToggle.classList.toggle('active');
            navList.classList.toggle('active');
        });
        
        // Fechar menu ao clicar em um link
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                menuToggle.classList.remove('active');
                navList.classList.remove('active');
            });
        });
        
        // Fechar menu ao clicar fora
        document.addEventListener('click', function(e) {
            if (!menuToggle.contains(e.target) && !navList.contains(e.target)) {
                menuToggle.classList.remove('active');
                navList.classList.remove('active');
            }
        });
    }
    
    // Inicializar integração com Mercado Pago
    let mercadoPago;
    try {
        mercadoPago = new MercadoPagoIntegration();
    } catch (error) {
        console.error('Erro ao inicializar Mercado Pago:', error);
    }
    
    // Smooth scroll para links internos
    const internalLinks = document.querySelectorAll('a[href^="#"]');
    
    internalLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetSection.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Adicionar funcionalidade de copiar dados bancários
    const bankInfo = document.querySelectorAll('.dados-bancarios p');
    
    bankInfo.forEach(info => {
        info.style.cursor = 'pointer';
        info.addEventListener('click', function() {
            const text = this.textContent;
            navigator.clipboard.writeText(text).then(() => {
                showNotification('Informação copiada para a área de transferência!', 'success');
            }).catch(() => {
                showNotification('Erro ao copiar. Tente selecionar e copiar manualmente.', 'error');
            });
        });
        
        // Adicionar tooltip
        info.title = 'Clique para copiar';
    });
    
    // Sistema de notificações simples
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;
        
        // Estilos inline para a notificação
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #fff;
            border-radius: 5px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            z-index: 10000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 300px;
            border-left: 4px solid ${type === 'success' ? '#27ae60' : type === 'error' ? '#9c27b0' : '#3498db'};
        `;
        
        document.body.appendChild(notification);
        
        // Mostrar notificação
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Fechar notificação
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                notification.remove();
            }, 300);
        });
        
        // Auto-remover após 3 segundos
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.transform = 'translateX(100%)';
                setTimeout(() => {
                    notification.remove();
                }, 300);
            }
        }, 3000);
    }
    
    // Modal de Pagamento
    const modalPagamento = document.getElementById('modal-pagamento');
    const modalClose = document.querySelector('.modal-close');
    const valorExibicao = document.getElementById('valor-exibicao');
    let valorAtual = 0;
    
    // Função para formatar valor em reais
    function formatarValor(valor) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(valor);
    }
    
    // Função para abrir modal
    function abrirModal(valor) {
        valorAtual = valor;
        valorExibicao.textContent = formatarValor(valor);
        modalPagamento.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Ativar primeiro método de pagamento (PIX)
        ativarMetodoPagamento('pix');
    }
    
    // Função para fechar modal
    function fecharModal() {
        modalPagamento.classList.remove('active');
        document.body.style.overflow = 'auto';
        
        // Limpar QR Code e código PIX
        const qrContainer = document.getElementById('qr-code-container');
        const pixCopyCode = document.getElementById('pix-copy-code');
        
        if (qrContainer) {
            qrContainer.innerHTML = `
                <div class="qr-placeholder">
                    <p>QR Code PIX</p>
                    <small>Escaneie com seu app bancário</small>
                </div>
            `;
        }
        
        if (pixCopyCode) {
            pixCopyCode.style.display = 'none';
        }
    }
    
    // Fechar modal com botão X
    modalClose.addEventListener('click', fecharModal);
    
    // Fechar modal clicando fora
    modalPagamento.addEventListener('click', function(e) {
        if (e.target === modalPagamento) {
            fecharModal();
        }
    });
    
    // Fechar modal com ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modalPagamento.classList.contains('active')) {
            fecharModal();
        }
    });
    
    // Seleção de métodos de pagamento
    const metodosPagamento = document.querySelectorAll('input[name="metodo"]');
    const secoesMetodo = document.querySelectorAll('.metodo-pagamento');
    
    function ativarMetodoPagamento(metodoId) {
        // Remover classe active de todas as seções
        secoesMetodo.forEach(secao => {
            secao.classList.remove('active');
        });
        
        // Ativar seção selecionada
        const secaoAtiva = document.getElementById(`${metodoId}-section`);
        if (secaoAtiva) {
            secaoAtiva.classList.add('active');
        }
    }
    
    metodosPagamento.forEach(radio => {
        radio.addEventListener('change', function() {
            ativarMetodoPagamento(this.value);
        });
    });
    
    // Funcionalidade dos botões de valores
    const botoesValor = document.querySelectorAll('.btn-valor');
    
    botoesValor.forEach(botao => {
        botao.addEventListener('click', function() {
            const valor = parseInt(this.getAttribute('data-valor'));
            abrirModal(valor);
            
            // Efeito visual de clique
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'translateY(-3px)';
            }, 150);
        });
    });
    
    // Funcionalidade dos botões copiar
    const botoesCopiar = document.querySelectorAll('.btn-copiar');
    
    botoesCopiar.forEach(botao => {
        botao.addEventListener('click', function() {
            const texto = this.getAttribute('data-text');
            if (texto) {
                navigator.clipboard.writeText(texto).then(() => {
                    showNotification('Informação copiada para a área de transferência!', 'success');
                    
                    // Efeito visual
                    const textoOriginal = this.textContent;
                    this.textContent = 'Copiado!';
                    this.style.background = '#27ae60';
                    
                    setTimeout(() => {
                        this.textContent = textoOriginal;
                        this.style.background = '';
                    }, 2000);
                }).catch(() => {
                    showNotification('Erro ao copiar. Tente selecionar e copiar manualmente.', 'error');
                });
            }
        });
    });
    
    // Gerar QR Code PIX
    const gerarPixBtn = document.getElementById('gerar-pix-btn');
    if (gerarPixBtn) {
        gerarPixBtn.addEventListener('click', async function() {
            if (!mercadoPago) {
                showNotification('Mercado Pago não inicializado. Verifique a configuração.', 'error');
                return;
            }
            
            try {
                this.textContent = 'Gerando...';
                this.disabled = true;
                
                // Simular geração de QR Code (em produção, usar API real)
                const pixData = await gerarPixSimulado(valorAtual);
                
                // Exibir QR Code
                const qrContainer = document.getElementById('qr-code-container');
                qrContainer.innerHTML = `
                    <div class="qr-code">
                        <img src="${pixData.qr_code}" alt="QR Code PIX" style="width: 200px; height: 200px;">
                        <p><strong>Valor:</strong> ${formatarValor(valorAtual)}</p>
                    </div>
                `;
                
                // Exibir código PIX para copiar
                const pixCopyCode = document.getElementById('pix-copy-code');
                const pixCodeText = document.getElementById('pix-code-text');
                const copiarPixCode = document.getElementById('copiar-pix-code');
                
                if (pixCopyCode && pixCodeText && copiarPixCode) {
                    pixCodeText.value = pixData.qr_code_text;
                    copiarPixCode.setAttribute('data-text', pixData.qr_code_text);
                    pixCopyCode.style.display = 'block';
                }
                
                showNotification('QR Code PIX gerado com sucesso!', 'success');
                
            } catch (error) {
                console.error('Erro ao gerar QR Code PIX:', error);
                showNotification('Erro ao gerar QR Code PIX. Tente novamente.', 'error');
            } finally {
                this.textContent = 'Gerar QR Code PIX';
                this.disabled = false;
            }
        });
    }
    
    // Função simulada para gerar PIX (substituir por API real)
    async function gerarPixSimulado(valor) {
        // Simular delay da API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        return {
            qr_code: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==`,
            qr_code_text: `00020126580014br.gov.bcb.pix0136123e4567-e12b-12d1-a456-426614174000520400005303986540510.005802BR5913Teste PIX6008Brasilia62070503***6304E2CA`
        };
    }
    
    // Função para criar preferência e redirecionar para o Mercado Pago
    async function criarPreferenciaMercadoPago(valor) {
        try {
            const response = await fetch('/api/create-preference', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: [{
                        id: "1",
                        title: "Doação",
                        quantity: 1,
                        currency_id: "BRL",
                        unit_price: valor
                    }],
                    back_urls: {
                        success: window.location.origin + "/sucesso",
                        pending: window.location.origin + "/pendente",
                        failure: window.location.origin + "/erro"
                    },
                    external_reference: "doacao_frontend"
                })
            });
            const data = await response.json();
            if (data.init_point) {
                window.location.href = data.init_point;
            } else {
                alert('Erro ao criar preferência de pagamento.');
            }
        } catch (error) {
            alert('Erro ao conectar com o servidor.');
        }
    }

    // Adicionar evento ao botão de pagamento com cartão
    const btnPagarCartao = document.querySelector('.btn-pagar-cartao');
    if (btnPagarCartao) {
        btnPagarCartao.addEventListener('click', function() {
            criarPreferenciaMercadoPago(valorAtual);
        });
    }
    
    // Evento para botão 'Continuar (Cartão/Mercado Pago)'
    const btnContinuarCartao = document.querySelector('.btn-continuar-cartao');
    if (btnContinuarCartao) {
        btnContinuarCartao.addEventListener('click', function() {
            console.log('Valor selecionado:', valorAtual);
            criarPreferenciaMercadoPago(valorAtual);
        });
    }
    
    // Formatação de campos do formulário de cartão
    const numeroCartao = document.getElementById('form-checkout__cardNumber');
    const validadeCartao = document.getElementById('form-checkout__expirationDate');
    const cvvCartao = document.getElementById('form-checkout__securityCode');
    const identificationNumber = document.getElementById('form-checkout__identificationNumber');
    
    // Formatar número do cartão
    if (numeroCartao) {
        numeroCartao.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
            e.target.value = value;
        });
    }
    
    // Formatar validade
    if (validadeCartao) {
        validadeCartao.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = value.substring(0, 2) + '/' + value.substring(2, 4);
            }
            e.target.value = value;
        });
    }
    
    // Formatar CVV
    if (cvvCartao) {
        cvvCartao.addEventListener('input', function(e) {
            e.target.value = e.target.value.replace(/\D/g, '');
        });
    }
    
    // Formatar número do documento
    if (identificationNumber) {
        identificationNumber.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            const identificationType = document.getElementById('form-checkout__identificationType').value;
            
            if (identificationType === 'CPF') {
                value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
            } else if (identificationType === 'CNPJ') {
                value = value.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
            }
            
            e.target.value = value;
        });
    }
    
    // Submissão do formulário de cartão
    const formCartao = document.getElementById('form-checkout');
    if (formCartao) {
        formCartao.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            if (!mercadoPago) {
                showNotification('Mercado Pago não inicializado. Verifique a configuração.', 'error');
                return;
            }
            
            try {
                const submitBtn = this.querySelector('button[type="submit"]');
                submitBtn.textContent = 'Processando...';
                submitBtn.disabled = true;
                
                // Simular processamento de pagamento
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                showNotification('Pagamento processado com sucesso!', 'success');
                fecharModal();
                
            } catch (error) {
                console.error('Erro ao processar pagamento:', error);
                showNotification('Erro ao processar pagamento. Tente novamente.', 'error');
            } finally {
                const submitBtn = this.querySelector('button[type="submit"]');
                submitBtn.textContent = 'Pagar com Cartão';
                submitBtn.disabled = false;
            }
        });
    }
    
    // Adicionar hover effect simples nos cards de atividades
    const atividades = document.querySelectorAll('.atividade');
    
    atividades.forEach(atividade => {
        atividade.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
            this.style.boxShadow = '0 5px 20px rgba(0,0,0,0.15)';
        });
        
        atividade.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
        });
    });
    
    console.log('Site CACVI carregado com sucesso! 🚀');
}); 