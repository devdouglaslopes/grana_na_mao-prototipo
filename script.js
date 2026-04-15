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
let valorRecebidoTroco = "";

carregarDados();

atualizarInterfaceCadastro();

function carregarDados() {
    const dadosSalvos = localStorage.getItem('dados_financeiros');
    if (dadosSalvos) {
        const dados = JSON.parse(dadosSalvos);
        
        saldoTotal = dados.saldo || 0;
        historicoGeral = dados.historico || [];    
        totaisPorCategoria = dados.totais || { dinheiro: 0, pix: 0, debito: 0, credito: 0 };
        chavePix = dados.chave || "";
        
        atualizarInterfaceSaldo();
        atualizarInterfaceResumo();
        atualizarInterfaceCadastro();
        verificarChavePix()
    }
}

function digitarTroco(num) {
    if (num === '⌫') {
        valorRecebidoTroco = valorRecebidoTroco.slice(0, -1);
    } else if (num === ',') {
        if (valorRecebidoTroco === "") valorRecebidoTroco = "0";
        if (!valorRecebidoTroco.includes('.')) valorRecebidoTroco += '.';
    } else {
        valorRecebidoTroco += num;
    }
    atualizarDisplayTroco();
}

function atualizarDisplayTroco() {
    const display = document.getElementById('display-recebido');
    const displayResultado = document.getElementById('display-resultado-troco');
    
    let textoExibir = valorRecebidoTroco === "" ? "0" : valorRecebidoTroco;
    display.innerText = "R$ " + textoExibir.replace('.', ',');
    
    let recebido = parseFloat(valorRecebidoTroco) || 0;
    let totalVenda = parseFloat(valorDigitado) || 0;
    let troco = recebido - totalVenda;

    if (valorRecebidoTroco === "") {
        displayResultado.innerText = "TROCO: R$ 0,00";
        displayResultado.style.color = "#4CAF50";
    } else if (troco > 0) {
        displayResultado.innerText = `TROCO: R$ ${troco.toFixed(2).replace('.', ',')}`;
        displayResultado.style.color = "#4CAF50";
    } else if (troco < 0) {
        displayResultado.innerText = `FALTAM: R$ ${Math.abs(troco).toFixed(2).replace('.', ',')}`;
        displayResultado.style.color = "#FF5252";
    } else {
        displayResultado.innerText = "SEM TROCO";
        displayResultado.style.color = "#fff";
    }
}

function salvarChavePix() {
    const input = document.getElementById('input-nova-chave');
    const valor = input.value.trim();

    if (valor !== "") {
        chavePix = valor;
        input.value = ""; 
        
        salvarDados();
        
        atualizarInterfaceCadastro();
    } else {
    }
    verificarChavePix()
}

function atualizarInterfaceCadastro() {
    const display = document.getElementById('exibicao-chave');
    
    if (chavePix === "") {
        display.innerText = "Nenhuma chave cadastrada";
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
    } 
    else if (metodoSelecionado === 'dinheiro' && tipoTransacao === 'venda') {
        valorRecebidoTroco = "";
        atualizarDisplayTroco();
        navegar('tela-pergunta-troco');
    } 
    else {
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
    salvarDados();

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

function salvarDados() {
    const dados = {
        saldo: saldoTotal,
        historico: historicoGeral,
        totais: totaisPorCategoria,
        chave: chavePix
    };
    localStorage.setItem('dados_financeiros', JSON.stringify(dados));
}

function atualizarInterfaceSaldo() {
    document.querySelector('.saldo-txt').innerText = `R$ ${saldoTotal.toFixed(2).replace('.', ',')}`;
}

function verificarChavePix() {
    const cards = document.querySelectorAll('.card-cat');
    let cardPix = null;

    // Localiza o card do PIX
    cards.forEach(card => {
        if (card.innerText.includes('PIX')) cardPix = card;
    });

    if (!cardPix) return;

    const chaveExiste = typeof chavePix !== 'undefined' && chavePix !== null && chavePix.trim() !== "";

    if (!chaveExiste) {
        // Estado Desativado
        cardPix.style.opacity = "0.5";
        cardPix.style.pointerEvents = "none";
        cardPix.style.filter = "grayscale(100%)";

        const img = cardPix.querySelector('img');
        cardPix.innerHTML = ''; 
        if (img) cardPix.appendChild(img);

        const msg = document.createElement('span');
        msg.innerText = "Cadastre uma Chave PIX para liberar";
        msg.style.fontSize = "0.70rem";
        msg.style.marginTop = "8px";
        msg.style.display = "block";
        msg.style.lineHeight = "1.2";
        
        cardPix.appendChild(msg);
    } else {  
        cardPix.style.opacity = "1";
        cardPix.style.pointerEvents = "auto";
        cardPix.style.filter = "none";

        const img = cardPix.querySelector('img');
        cardPix.innerHTML = ''; 
        if (img) cardPix.appendChild(img);
        cardPix.append("PIX");
    }
}

function navegar(idDestino) {
    
    document.querySelectorAll('.tela').forEach(tela => {
        tela.classList.remove('ativa');
    });

    
    const destino = document.getElementById(idDestino);
    if (destino) {
        destino.classList.add('ativa');
    }

    
    if (idDestino === 'tela-categoria') {
        verificarChavePix();
    }
}
