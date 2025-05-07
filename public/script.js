async function carregarLeituras() {
    const resposta = await fetch('/leituras');
    const leituras = await resposta.json();
    const lista = document.getElementById('leituras-lista'); // Removido o operador "!"
    
    if (!lista) return; // Verificação de segurança para evitar erros de runtime
    
    lista.innerHTML = '';
    
    leituras.forEach((leitura) => { // Removida a tipagem incorreta "guy"
        const li = document.createElement('li');
        li.textContent = `${new Date(leitura.timestamp).toLocaleString()} - ${leitura.estado ? 'Ímã Detectado' : 'Sem Ímã'}`; // String corrigida
        lista.appendChild(li);
    });
}

// Atualizar a cada 5 segundos
setInterval(carregarLeituras, 5000);
carregarLeituras();