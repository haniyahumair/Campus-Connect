export function showModal(title, message, type = 'success', options = {}) {
    // Remove existing modal if any
    const existingModal = document.getElementById('customModal')
    if (existingModal) {
        existingModal.remove()
    }

    // Create modal HTML
    const modal = document.createElement('div')
    modal.id = 'customModal'
    modal.className = 'modal-overlay'
    
    const icon = getIcon(type)
    const color = getColor(type)
    
    modal.innerHTML = `
        <div class="modal-container" style="animation: slideIn 0.3s ease-out;">
            <div class="modal-icon" style="color: ${color};">${icon}</div>
            <h2 class="modal-title">${title}</h2>
            <p class="modal-message">${message}</p>
            ${options.showButton !== false ? `
                <button class="modal-btn" style="background: ${color};" onclick="closeModal()">
                    ${options.buttonText || 'OK'}
                </button>
            ` : ''}
        </div>
    `
    
    document.body.appendChild(modal)
    
    // Auto-close after delay if specified
    if (options.autoClose) {
        setTimeout(() => {
            closeModal()
            if (options.onClose) options.onClose()
        }, options.autoClose)
    }
    
    // Add click outside to close
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal()
        }
    })
}

function getIcon(type) {
    const icons = {
        success: '../../assets/icons/Tick.png',
        error: '../../assets/icons/Cross.png',
        warning: '⚠️',
        info: 'ℹ️',
        loading: '⏳'
    }
    return icons[type] || icons.info
}

function getColor(type) {
    const colors = {
        success: '#ffffff',  
        error: '#dc3545',    
        warning: '#ffc107',  
        info: '#2563eb',     
        loading: '#6c757d'
    }
    return colors[type] || colors.info
}

window.closeModal = function() {
    const modal = document.getElementById('customModal')
    if (modal) {
        modal.classList.add('fade-out')
        setTimeout(() => modal.remove(), 300)
    }
}

//CSS
const style = document.createElement('style')
style.textContent = `
    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
        animation: fadeIn 0.3s ease-out;
    }

    .modal-container {
        background: white;
        padding: 40px;
        border-radius: 20px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        text-align: center;
        max-width: 500px;
        width: 90%;
        position: relative;
    }

    .modal-icon {
        font-size: 64px;
        margin-bottom: 20px;
        animation: scaleIn 0.5s ease-out;
    }

    .modal-title {
        color: #333;
        font-size: 28px;
        margin-bottom: 15px;
        font-weight: 600;
    }

    .modal-message {
        color: #666;
        font-size: 16px;
        line-height: 1.6;
        margin-bottom: 30px;
    }

    .modal-btn {
        padding: 14px 40px;
        color: white;
        border: none;
        border-radius: 8px;
        font-weight: 600;
        font-size: 16px;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 4px 15px rgba(13, 115, 119, 0.3);
    }

    .modal-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(13, 115, 119, 0.5);
    }

    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }

    @keyframes slideIn {
        from { 
            transform: translateY(-50px);
            opacity: 0;
        }
        to { 
            transform: translateY(0);
            opacity: 1;
        }
    }

    @keyframes scaleIn {
        0% { transform: scale(0); }
        50% { transform: scale(1.1); }
        100% { transform: scale(1); }
    }

    .fade-out {
        animation: fadeOut 0.3s ease-out;
    }

    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
`
document.head.appendChild(style)