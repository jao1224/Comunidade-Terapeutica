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
    
    // Inicializar integração com Getnet
    let getnet;
    try {
        getnet = new GetnetIntegration();
    } catch (error) {
        console.error('Erro ao inicializar Getnet:', error);
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
        console.log('Abrindo modal com valor:', valor);
        valorAtual = valor;
        
        if (!valorExibicao) {
            console.error('Elemento valor-exibicao não encontrado');
            return;
        }
        
        if (!modalPagamento) {
            console.error('Modal de pagamento não encontrado');
            return;
        }
        
        valorExibicao.textContent = formatarValor(valor);
        modalPagamento.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        console.log('Modal aberto com sucesso');
        
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
        botao.addEventListener('click', function(e) {
            e.preventDefault(); // Prevenir comportamento padrão
            const valor = parseInt(this.getAttribute('data-valor'));
            console.log('Botão clicado, valor:', valor);
            
            if (!valor || isNaN(valor)) {
                console.error('Valor inválido:', valor);
                return;
            }
            
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
            if (!getnet) {
                showNotification('Getnet não inicializado. Verifique a configuração.', 'error');
                return;
            }
            
            try {
                this.textContent = 'Gerando...';
                this.disabled = true;
                
                // Gerar QR Code PIX usando Getnet
                const pixData = await getnet.processPixPayment(valorAtual, {
                    email: 'doador@example.com',
                    first_name: 'Doador',
                    last_name: 'Anônimo',
                    document_number: '00000000000'
                });
                
                // Exibir QR Code
                const qrContainer = document.getElementById('qr-code-container');
                if (pixData.qr_code_base64) {
                    qrContainer.innerHTML = `
                        <div class="qr-code">
                            <img src="data:image/png;base64,${pixData.qr_code_base64}" alt="QR Code PIX" style="width: 200px; height: 200px;">
                            <p><strong>Valor:</strong> ${formatarValor(valorAtual)}</p>
                        </div>
                    `;
                } else if (pixData.qr_code_url) {
                    qrContainer.innerHTML = `
                        <div class="qr-code">
                            <img src="${pixData.qr_code_url}" alt="QR Code PIX" style="width: 200px; height: 200px;">
                            <p><strong>Valor:</strong> ${formatarValor(valorAtual)}</p>
                        </div>
                    `;
                }
                
                // Exibir código PIX para copiar
                const pixCopyCode = document.getElementById('pix-copy-code');
                const pixCodeText = document.getElementById('pix-code-text');
                const copiarPixCode = document.getElementById('copiar-pix-code');
                
                if (pixCopyCode && pixCodeText && copiarPixCode && pixData.qr_code) {
                    pixCodeText.value = pixData.qr_code;
                    copiarPixCode.setAttribute('data-text', pixData.qr_code);
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
    
    // Função para processar pagamento com cartão usando Getnet
    async function processarPagamentoCartao(valor, dadosCartao) {
        try {
            if (!getnet) {
                throw new Error('Getnet não inicializado');
            }
            
            // Tokenizar cartão primeiro
            const tokenResult = await getnet.tokenizeCard({
                number: dadosCartao.numero.replace(/\s/g, ''),
                customer_id: 'customer_' + Date.now(),
                expiration_month: dadosCartao.validade.split('/')[0],
                expiration_year: '20' + dadosCartao.validade.split('/')[1],
                security_code: dadosCartao.cvv,
                cardholder_name: dadosCartao.nome
            });
            
            // Processar pagamento com o token
            const paymentData = {
                amount: valor,
                installments: 1,
                customer: {
                    customer_id: 'customer_' + Date.now(),
                    first_name: dadosCartao.nome.split(' ')[0],
                    last_name: dadosCartao.nome.split(' ').slice(1).join(' ') || 'Silva',
                    name: dadosCartao.nome,
                    email: 'doador@example.com',
                    document_type: 'CPF',
                    document_number: dadosCartao.documento || '00000000000',
                    phone_number: '5511999999999'
                },
                card: {
                    number_token: tokenResult.number_token,
                    cardholder_name: dadosCartao.nome,
                    security_code: dadosCartao.cvv,
                    brand: 'Mastercard'
                }
            };
            
            const result = await getnet.processCreditCardPayment(paymentData);
            
            if (result.status === 'APPROVED') {
                window.location.href = '/sucesso';
            } else if (result.status === 'PENDING') {
                window.location.href = '/pendente';
            } else {
                window.location.href = '/erro';
            }
            
        } catch (error) {
            console.error('Erro ao processar pagamento:', error);
            throw error;
        }
    }

    // Adicionar evento ao botão de pagamento com cartão
    const btnPagarCartao = document.querySelector('.btn-pagar-cartao');
    if (btnPagarCartao) {
        btnPagarCartao.addEventListener('click', async function() {
            const dadosCartao = {
                numero: numeroCartao?.value || '',
                validade: validadeCartao?.value || '',
                cvv: cvvCartao?.value || '',
                nome: document.getElementById('form-checkout__cardholderName')?.value || '',
                documento: identificationNumber?.value.replace(/\D/g, '') || ''
            };
            
            try {
                await processarPagamentoCartao(valorAtual, dadosCartao);
            } catch (error) {
                showNotification('Erro ao processar pagamento. Tente novamente.', 'error');
            }
        });
    }
    

    
    // Evento para botão 'Pagar com Cartão'
    const btnContinuarCartao = document.querySelector('.btn-continuar-cartao');
    if (btnContinuarCartao) {
        btnContinuarCartao.addEventListener('click', async function() {
            console.log('Valor selecionado:', valorAtual);
            
            if (!valorAtual || valorAtual <= 0) {
                showNotification('Selecione um valor válido para doar.', 'error');
                return;
            }
            
            try {
                // Mostrar loading
                const textoOriginal = this.textContent;
                this.textContent = '⏳ Gerando link de pagamento...';
                this.disabled = true;
                
                console.log('Criando link de pagamento para:', valorAtual);
                
                // Criar link de pagamento na Getnet
                const result = await getnet.createPaymentLink(valorAtual, 'Doação para Passo a Passo');
                
                console.log('Resultado:', result);
                
                // Verificar se precisa usar PIX manual
                if (result.use_manual_pix) {
                    this.textContent = textoOriginal;
                    this.disabled = false;
                    
                    showNotification('Erro ao processar pagamento com cartão. Por favor, use o botão "Pagar com PIX".', 'error');
                    return;
                }
                
                // Redirecionar para a página de pagamento da Getnet
                if (result.payment_url) {
                    console.log('Redirecionando para:', result.payment_url);
                    window.location.href = result.payment_url;
                } else {
                    throw new Error('Link de pagamento não foi gerado');
                }
                
            } catch (error) {
                console.error('Erro ao criar link de pagamento:', error);
                showNotification('Erro ao processar pagamento com cartão. Por favor, use o botão "Pagar com PIX".', 'error');
                this.textContent = '💳 Pagar com Cartão';
                this.disabled = false;
            }
        });
    }
    
    // Evento para botão 'Pagar com PIX Manual'
    const btnPixManual = document.querySelector('.btn-pix-manual');
    if (btnPixManual) {
        btnPixManual.addEventListener('click', function() {
            if (!valorAtual || valorAtual <= 0) {
                showNotification('Selecione um valor válido para doar.', 'error');
                return;
            }
            
            // Mostrar instruções PIX
            const chavePix = '52.853.543/0001-55';
            const mensagem = `
                <div style="text-align: left;">
                    <h3 style="color: #9c27b0; margin-bottom: 15px;">Pagamento via PIX</h3>
                    <p><strong>Valor:</strong> ${formatarValor(valorAtual)}</p>
                    <p><strong>Chave PIX (CNPJ):</strong></p>
                    <input type="text" value="${chavePix}" readonly style="width: 100%; padding: 10px; margin: 10px 0; border: 2px solid #9c27b0; border-radius: 5px; font-size: 16px;" id="chavePixCopy">
                    <button onclick="document.getElementById('chavePixCopy').select(); document.execCommand('copy'); alert('Chave PIX copiada!');" style="width: 100%; padding: 12px; background: #9c27b0; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; margin-bottom: 15px;">Copiar Chave PIX</button>
                    <h4 style="color: #333; margin: 20px 0 10px 0;">Como pagar:</h4>
                    <ol style="margin-left: 20px; color: #555;">
                        <li>Abra o app do seu banco</li>
                        <li>Escolha "Pagar com PIX"</li>
                        <li>Cole a chave PIX copiada</li>
                        <li>Confirme o valor de <strong>${formatarValor(valorAtual)}</strong></li>
                        <li>Finalize o pagamento</li>
                    </ol>
                    <p style="margin-top: 20px; color: #666; font-size: 14px;">
                        <strong>Beneficiário:</strong> Comunidade Terapêutica Passo a Passo<br>
                        <strong>CNPJ:</strong> 52.853.543/0001-55
                    </p>
                </div>
            `;
            
            // Criar modal customizado
            const modalCustom = document.createElement('div');
            modalCustom.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 10000;';
            modalCustom.innerHTML = `
                <div style="background: white; padding: 30px; border-radius: 15px; max-width: 500px; width: 90%; max-height: 90vh; overflow-y: auto;">
                    ${mensagem}
                    <button onclick="this.closest('div').parentElement.remove();" style="width: 100%; padding: 12px; background: #666; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; margin-top: 20px;">Fechar</button>
                </div>
            `;
            document.body.appendChild(modalCustom);
            
            // Fechar modal principal
            fecharModal();
        });
    }
    
    // Outro valor de doação em modal
    const btnOutroValor = document.getElementById('btn-valor-outro');
    const modalOutroValor = document.getElementById('modal-outro-valor');
    const inputOutroValor = document.getElementById('input-outro-valor');
    const btnConfirmarOutroValor = document.getElementById('confirmar-outro-valor');
    const btnCloseOutroValor = document.querySelector('.modal-close-outro-valor');

    if (btnOutroValor && modalOutroValor && inputOutroValor && btnConfirmarOutroValor && btnCloseOutroValor) {
        btnOutroValor.addEventListener('click', function() {
            modalOutroValor.classList.add('active');
            inputOutroValor.value = '';
            inputOutroValor.focus();
            document.body.style.overflow = 'hidden';
        });
        function fecharModalOutroValor() {
            modalOutroValor.classList.remove('active');
            document.body.style.overflow = 'auto';
            // Fechar também o modal de finalizar doação, se estiver aberto
            if (modalPagamento.classList.contains('active')) {
                modalPagamento.classList.remove('active');
            }
        }
        btnCloseOutroValor.addEventListener('click', fecharModalOutroValor);
        modalOutroValor.addEventListener('click', function(e) {
            if (e.target === modalOutroValor) {
                fecharModalOutroValor();
            }
        });
        inputOutroValor.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                btnConfirmarOutroValor.click();
            }
        });
        btnConfirmarOutroValor.addEventListener('click', function() {
            const valor = parseFloat(inputOutroValor.value.replace(',', '.'));
            if (!valor || valor <= 0) {
                showNotification('Digite um valor válido para doar.', 'error');
                inputOutroValor.focus();
                return;
            }
            modalOutroValor.classList.remove('active');
            document.body.style.overflow = 'auto';
            abrirModal(valor);
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
            
            if (!getnet) {
                showNotification('Getnet não inicializado. Verifique a configuração.', 'error');
                return;
            }
            
            try {
                const submitBtn = this.querySelector('button[type="submit"]');
                submitBtn.textContent = 'Processando...';
                submitBtn.disabled = true;
                
                const dadosCartao = {
                    numero: numeroCartao?.value || '',
                    validade: validadeCartao?.value || '',
                    cvv: cvvCartao?.value || '',
                    nome: document.getElementById('form-checkout__cardholderName')?.value || '',
                    documento: identificationNumber?.value.replace(/\D/g, '') || ''
                };
                
                await processarPagamentoCartao(valorAtual, dadosCartao);
                
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
    
    // Botão de copiar chave Pix
    const btnCopiarPix = document.getElementById('copiar-pix');
    const chavePix = document.getElementById('chave-pix');
    if (btnCopiarPix && chavePix) {
        btnCopiarPix.addEventListener('click', function() {
            navigator.clipboard.writeText(chavePix.textContent.trim()).then(() => {
                showNotification('Chave Pix copiada!', 'success');
            }).catch(() => {
                showNotification('Erro ao copiar a chave Pix.', 'error');
            });
        });
    }
    
    console.log('Site CACVI carregado com sucesso! 🚀');
}); 