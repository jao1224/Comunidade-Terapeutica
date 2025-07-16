// JavaScript para o site CACVI - Versão Simplificada

document.addEventListener('DOMContentLoaded', function() {
    
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
    
    // Adicionar funcionalidade aos botões de valores de doação
    const botoesValor = document.querySelectorAll('.btn-valor');
    
    botoesValor.forEach(botao => {
        botao.addEventListener('click', function() {
            const valor = this.textContent;
            showNotification(`Obrigado! Você escolheu doar ${valor}. Entre em contato conosco para finalizar a doação.`, 'success');
            
            // Efeito visual de clique
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'translateY(-3px)';
            }, 150);
        });
    });
    
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