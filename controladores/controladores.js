const dados = require("../src/bancodedados");
const format = require("date-fns/format")
const locale = require("date-fns/locale/pt-BR");


let proximoNumeroConta = 1;


async function listarConta (req, res){
    if (!req.query.senha_banco){
        return res.status(400).json({
            mensagem: 'A senha do banco não foi informada'
        })
    } else if (req.query.senha_banco !== "Cubos123Bank"){
        return res.status(404).json({
            mensagem: 'A senha do banco está incorreta'
        })
    }

    res.status(200).json(dados.contas)
}

async function criarConta (req, res){

    const dadosUsuario = req.body

    if (!dadosUsuario){
        res.status(400).json({ mensagem: "Os dados devem ser informados." });
        return;
    }

    if (!dadosUsuario.nome){
        res.status(400).json({ mensagem: "O nome deve ser informado." });
        return;
    }

    if (!dadosUsuario.cpf){
        res.status(400).json({ mensagem: "O cpf deve ser informado." });
        return;
    }

    if (!dadosUsuario.data_nascimento){
        res.status(400).json({ mensagem: "A data de nascimento deve ser informada" });
        return;
    }

    if (!dadosUsuario.telefone){
        res.status(400).json({ mensagem: "O telefone deve ser informado." });
        return;
    }

    if (!dadosUsuario.email){
        res.status(400).json({ mensagem: "O email deve ser informado" });
        return;
    }
    if (!dadosUsuario.senha){
        res.status(400).json({ mensagem: "Uma senha deve ser informada" });
        return;
    }

    if (dados.contas.find(x => x.usuario.cpf === dadosUsuario.cpf)){
        return res.status(400).json({ mensagem: "Esse cpf já foi informado" });
    }
  

    if (dados.contas.find(x => x.usuario.email === dadosUsuario.email)){
        return res.status(400).json({ mensagem: "Esse email já foi informado" });
        
    }

    const novoUsuario = {
        numero: proximoNumeroConta,
        saldo: 0,
        usuario: {
            nome: dadosUsuario.nome,
            cpf: dadosUsuario.cpf,
            data_nascimento: dadosUsuario.data_nascimento,
            telefone: dadosUsuario.telefone,
            email: dadosUsuario.email,
            senha: dadosUsuario.senha
        }
    }
    
    proximoNumeroConta++;
    dados.contas.push(novoUsuario)
    res.status(201).json(novoUsuario)
}

async function atualizarUsuarioConta (req, res){
    const novosDados = req.body;
    const params = Number(req.params.numeroConta);
    const {contas} = dados
    
    if (!novosDados){
        return res.status(400).json({mensagem: "Alguma informação tem que ser passada"})
    }

    if(!params){
        return res.status(400).json({mensagem: "O número da conta deve ser informado"})
    }

    const conta = contas.find(x => x.numero === params)


    if (conta === undefined){
        return res.status(404).json({mensagem: "Não existe nenhum usuario com essa conta"})
    }

    if (novosDados.cpf){
        if(dados.contas.find(x => x.usuario.cpf === novosDados.cpf)){
            return res.status(400).json({ mensagem: "Esse cpf já foi informado" });
        } else {
            conta.usuario.cpf = novosDados.cpf
        }
    }

    if (novosDados.email){
        if (dados.contas.find(x => x.usuario.email === novosDados.email)){
            return res.status(400).json({ mensagem: "Esse email já foi informado" });
        } else {
            conta.usuario.email = novosDados.email
        }
    }
    
    if (novosDados.nome){
        conta.usuario.nome = novosDados.nome 
    }   
    
    if (novosDados.data_nascimento){
        conta.usuario.data_nascimento = novosDados.data_nascimento
    }

    if (novosDados.telefone){
        conta.usuario.telefone = novosDados.telefone
    } 

    if (novosDados.senha){
        conta.usuario.senha = novosDados.senha
    }

    res.status(200).json({mensagem: "Conta atualizada com sucesso!"});
}

async function excluirConta (req, res){

    const params = Number(req.params.numeroConta);

    if(!params){
        return res.status(400).json({mensagem: "O número da conta deve ser informado"})
    }

    const conta = dados.contas.find(x => x.numero === params)

    if (conta === undefined){
        return res.status(404).json({mensagem: "Não existe nenhum usuario com essa conta"})
    }

    if (conta.saldo !== 0){
        return res.status(404).json({mensagem: "A conta deve estar zerada"})
    }
     
    let contaExcluida;
    const indiceConta = dados.contas.findIndex(x => x.numero === params)

    contaExcluida = dados.contas.splice(indiceConta, 1)[0];

    
    res.status(200).json({mensagem: "Conta excluída com sucesso!"})
}

async function depositar(req, res){

    const body = req.body

    if (!body.numero_conta){
        return res.status(400).json({mensagem: "O número da conta deve ser informado"})
    }

    if (!body.valor){
        return res.status(400).json({mensagem: "O valor deve ser informado"})
    }

    const conta = dados.contas.find(x => x.numero === Number(body.numero_conta))

    if (!conta){
        return res.status(404).json({mensagem: "informe uma conta valida"})
    }

    if (body.valor <= 0){
        return res.status(400).json({mensagem: "informe um saldo valido"})
    }

    conta.saldo += body.valor

    res.status(200).json({mensagem: "Depósito realizado com sucesso!"})

    let data = new Date()
    const dataFormatada = format(data, "yyyy-MM-dd HH:mm:ss", {locale:locale})

    let deposito = {
        data: dataFormatada,
        numero_conta: body.numero_conta,
        valor: body.valor
    }

    dados.depositos.push(deposito)
  
}

async function sacar(req, res){
    const body = req.body

    if (!body.numero_conta){
        return res.status(400).json({mensagem: "O número da conta deve ser informado"})
    }

    if (!body.valor){
        return res.status(400).json({mensagem: "O valor deve ser informado"})
    }

    if (!body.senha){
        return res.status(400).json({mensagem: "A senha deve ser informado"})
    }

    const conta = dados.contas.find(x => x.numero === Number(body.numero_conta))

    if (!conta){
        return res.status(404).json({mensagem: "informe uma conta valida"})
    }

    if (conta.usuario.senha !== body.senha){
        return res.status(404).json({mensagem: "Senha incorreta"})
    }

    if (conta.saldo < body.valor){
        return res.status(404).json({mensagem: "Saldo insuficiente"})
    }

    conta.saldo -= body.valor

    res.status(200).json({mensagem: "Saque realizado com sucesso!"})

    let data = new Date()
    const dataFormatada = format(data, "yyyy-MM-dd HH:mm:ss", {locale:locale})

    let saque = {
        data: dataFormatada,
        numero_conta: body.numero_conta,
        valor: body.valor
    }

    dados.saques.push(saque)
  
}

async function tranferir(req, res){
    const body = req.body

    if(!body.numero_conta_origem){
        return res.status(400).json({mensagem: "O número da conta de origem deve ser informado"})
    }

    if(!body.numero_conta_destino){
        return res.status(400).json({mensagem: "O número da conta de destino deve ser informado"})
    }

    if(!body.senha_conta_origem){
        return res.status(400).json({mensagem: "A senha deve ser informada"})
    }

    if(!body.valor){
        return res.status(400).json({mensagem: "O valor da transferencia deve ser informado"})
    }

    const contaOrigem = dados.contas.find(x => x.numero === Number(body.numero_conta_origem))
    const contaDestino = dados.contas.find(x => x.numero === Number(body.numero_conta_destino))

    if (contaOrigem.usuario.senha !== body.senha_conta_origem){
        return res.status(404).json({mensagem: "Senha incorreta"})
    }

    if (contaOrigem.saldo < body.valor){
        return res.status(404).json({mensagem: "Saldo insuficiente"})
    }

    contaOrigem.saldo -= body.valor;
    contaDestino.saldo += body.valor;

    let data = new Date()
    const dataFormatada = format(data, "yyyy-MM-dd HH:mm:ss", {locale:locale})

    let transferencia = {
        data: dataFormatada,
        numero_conta_origem: body.numero_conta_origem,
        numero_conta_destino: body.numero_conta_destino,
        valor: body.valor
    }

    dados.transferencias.push(transferencia)

    res.status(200).json({mensagem: "transferencia realizado com sucesso!"})

}

async function saldo(req, res){
    const params = req.query

    if (!params){
        return res.status(400).json({mensagem: "O numero da conta e asenha devem ser informados"})
    }

    if (!params.numero_conta){
        return res.status(400).json({mensagem: "O número da conta deve ser informado"})
    }

    if (!params.senha){
        return res.status(400).json({mensagem: "O senha deve ser informada"})
    }

    const conta = dados.contas.find(x => x.numero === Number(params.numero_conta))

    if (!conta){
        return res.status(404).json({mensagem: "O número da conta não foi encontrado"})
    }

    if (conta.usuario.senha !== params.senha){
        return res.status(404).json({mensagem: "Senha incorreta"})
    }

    res.status(200).json({saldo:conta.saldo})

}

async function extrato(req, res){
    const params = req.query

    if (!params){
        return res.status(400).json({mensagem: "O numero da conta e asenha devem ser informados"})
    }

    if (!params.numero_conta){
        return res.status(400).json({mensagem: "O número da conta deve ser informado"})
    }

    if (!params.senha){
        return res.status(400).json({mensagem: "O senha deve ser informada"})
    }

    const conta = dados.contas.find(x => x.numero === Number(params.numero_conta))

    if (!conta){
        return res.status(404).json({mensagem: "O número da conta não foi encontrado"})
    }

    if (conta.usuario.senha !== params.senha){
        return res.status(404).json({mensagem: "Senha incorreta"})
    }

    const transferenciaRecebida = dados.transferencias.filter(x => x.numero_conta_destino == conta.numero)
    const transferenciaEnviada = dados.transferencias.filter(x => x.numero_conta_origem == conta.numero)
    const depositos = dados.depositos.filter(x => x.numero_conta == conta.numero)
    const saques = dados.saques.filter(x => x.numero_conta == conta.numero)

    res.status(200).json({
        depositos: depositos,
        saques: saques,
        transferenciaRecebida: transferenciaRecebida,
        transferenciaEnviada: transferenciaEnviada
    })
}

module.exports = {
    listarConta,
    criarConta,
    atualizarUsuarioConta,
    excluirConta, 
    depositar,
    sacar,
    tranferir,
    saldo,
    extrato
}