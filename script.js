let historicoGeral = [];
let totaisPorCategoria = {
    dinheiro: 0,
    pix: 0,
    debito: 0,
    credito: 0
};
let chavePix = "";
let saldoTotal = 0.00;
let valorDigitado = "";
let tipoTransacao = "";
let metodoSelecionado = "";

atualizarInterfaceCadastro();

function salvarChavePix() {
    const input = document.getElementById('input-nova-chave');
    const valor = input.value.trim();

    if (valor !== "") {
        chavePix = valor;
        input.value = ""; 
        atualizarInterfaceCadastro();
    } else {
    }
}

function atualizarInterfaceCadastro() {
    const display = document.getElementById('exibicao-chave');
    
    if (chavePix === "") {
        display.innerText = "XXXXXXXXXXXXXX";
    } else {
        display.innerText = chavePix;
    }
}

function digitar(num) {
    if (num === '⌫') {
        valorDigitado = valorDigitado.slice(0, -1);
    } else if (num === ',') {
        if (!valorDigitado.includes('.')) valorDigitado += '.';
    } else {
        valorDigitado += num;
    }
    atualizarDisplayTeclado();
}

function atualizarDisplayTeclado() {
const display = document.querySelector('.display-digito strong');
if (display) {
    display.innerText = valorDigitado.replace('.', ',') || "0,00";
}

const btnOk = document.querySelector('.btn-ok');
if (btnOk) {
    let valorNum = parseFloat(valorDigitado) || 0;

    if (valorNum <= 0) {
        btnOk.style.opacity = "0.3";
        btnOk.style.pointerEvents = "none";
    } else {
        btnOk.style.opacity = "1";
        btnOk.style.pointerEvents = "auto";
    }
}
}

function iniciarFluxo(tipo) {
    tipoTransacao = tipo; 
    valorDigitado = ""; 
    atualizarDisplayTeclado();
    navegar('tela-teclado');
}

function selecionarMetodo(elemento, metodo) {
    document.querySelectorAll('.card-cat').forEach(card => card.classList.remove('selecionado'));
    
    elemento.classList.add('selecionado');
    metodoSelecionado = metodo;

    document.getElementById('btn-confirmar-cat').style.display = 'flex';
}

function resetarCategoria() {
    metodoSelecionado = "";

    document.querySelectorAll('.card-cat').forEach(card => {
        card.classList.remove('selecionado');
    });

    const btnConfirmar = document.getElementById('btn-confirmar-cat');
    if (btnConfirmar) {
        btnConfirmar.style.display = 'none';
    }
}

function processarConfirmacao() {
    if (metodoSelecionado === 'pix' && tipoTransacao === 'venda') {
        const valorFormatado = parseFloat(valorDigitado) || 0;
        document.getElementById('valor-pix-qr').innerText = `R$ ${valorFormatado.toFixed(2).replace('.', ',')}`;
        
        navegar('tela-qrcode');
    } else {
        finalizarRegistro();
    }
}

function confirmarValor() {
    let valorNum = parseFloat(valorDigitado) || 0;

    if (valorNum <= 0) return;

    navegar('tela-categoria');
}

function finalizarRegistro() {
    let valorNum = parseFloat(valorDigitado) || 0;
    let agora = new Date();
    let horario = agora.getHours() + ":" + agora.getMinutes().toString().padStart(2, '0');

    historicoGeral.push({
        tipo: tipoTransacao,
        categoria: metodoSelecionado,
        valor: valorNum,
        hora: horario
    });

    if (tipoTransacao === 'venda') {
        saldoTotal += valorNum;
        totaisPorCategoria[metodoSelecionado] += valorNum;
        navegar('tela-sucesso-venda');
    } else {
        saldoTotal -= valorNum;
        totaisPorCategoria[metodoSelecionado] -= valorNum;
        navegar('tela-sucesso-gasto');
    }

    valorDigitado = ""; 
    atualizarDisplayTeclado();
    atualizarInterfaceSaldo();
    atualizarInterfaceResumo();
    resetarCategoria();

    setTimeout(() => { navegar('tela-dashboard'); }, 2000);
}

function abrirHistorico(cat) {
    const container = document.getElementById('container-historico');
    const titulo = document.getElementById('titulo-historico');
    
    const nomesFormatados = {
        'dinheiro': 'Dinheiro',
        'pix': 'PIX',
        'debito': 'Débito',
        'credito': 'Crédito'
    };

    titulo.innerText = nomesFormatados[cat] || cat;
    
    container.innerHTML = ""; 

    const filtrados = historicoGeral.filter(t => t.categoria === cat);

    if (filtrados.length === 0) {
        container.innerHTML = "<p style='font-size: 1.2rem; text-align:center; color:#555; margin-top:20px;'>Nenhuma transação encontrada.</p>";
    } else {
        [...filtrados].reverse().forEach(t => {
            const div = document.createElement('div');
            div.className = `item-historico ${t.tipo === 'venda' ? 'venda-style' : 'gasto-style'}`;
            div.innerHTML = `
                <div>
                    <div style="font-weight:bold; color: #fff;">${t.tipo === 'venda' ? 'VENDA' : 'GASTO'}</div>
                    <div class="data-hora">${t.hora}</div>
                </div>
                <div style="font-size: 1.5rem; font-weight: bold; color: ${t.tipo === 'venda' ? '#4CAF50' : '#FF5252'};">
                    ${t.tipo === 'venda' ? '+' : '-'} R$ ${t.valor.toFixed(2).replace('.', ',')}
                </div>
            `;
            container.appendChild(div);
        });
    }
    navegar('tela-historico');
}

function atualizarInterfaceResumo() {
    document.getElementById('total-dinheiro').innerText = `R$ ${totaisPorCategoria.dinheiro.toFixed(2).replace('.', ',')}`;
    document.getElementById('total-pix').innerText = `R$ ${totaisPorCategoria.pix.toFixed(2).replace('.', ',')}`;
    document.getElementById('total-debito').innerText = `R$ ${totaisPorCategoria.debito.toFixed(2).replace('.', ',')}`;
    document.getElementById('total-credito').innerText = `R$ ${totaisPorCategoria.credito.toFixed(2).replace('.', ',')}`;
}

function atualizarInterfaceSaldo() {
    document.querySelector('.saldo-txt').innerText = `R$ ${saldoTotal.toFixed(2).replace('.', ',')}`;
}

function navegar(idDestino) {
    document.querySelectorAll('.tela').forEach(tela => {
        tela.classList.remove('ativa');
    });
    const destino = document.getElementById(idDestino);
    if (destino) {
        destino.classList.add('ativa');
    }
}