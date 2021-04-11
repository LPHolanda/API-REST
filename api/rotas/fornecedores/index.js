const roteador = require('express').Router();
const TabelaFornecedor = require('./TabelaFornecedor');
const Fornecedor = require('./Fornecedor');
const { SerializadorFornecedor } = require('../../Serializador');

roteador.options('/', (req, res) => {
    res.set('Access-Control-Allow-Methods', 'GET, POST');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.status(204);
    res.end();
});

roteador.get('/', async (req, res) => {
    const resultados = await TabelaFornecedor.listar();
    res.status(200);
    const serializador = new SerializadorFornecedor(
        res.getHeader('Content-Type'),
        ['empresa']
    );
    res.send(
        serializador.serializar(resultados)
    );
});

roteador.post('/', async (req, res, proximo) => {
    try{
        const dadosRecebidos = req.body;
        const fornecedor = new Fornecedor(dadosRecebidos);
        await fornecedor.criar();
        res.status(201);
        const serializador = new SerializadorFornecedor(
            res.getHeader('Content-Type'),
            ['empresa']
        );
        res.send(
            serializador.serializar(fornecedor)
        );

    } catch (erro) {
        proximo(erro);
    }
})

roteador.options('/:id', (req, res) => {
    res.set('Access-Control-Allow-Methods', 'GET, PUT, DELETE');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.status(204);
    res.end();
});

roteador.get('/:id', async (req, res, proximo) => {
    try {
        const id = req.params.id;
        const fornecedor = new Fornecedor({id: id});
        await fornecedor.carregar();
        res.status(200);
        const serializador = new SerializadorFornecedor(
            res.getHeader('Content-Type'),
            ['empresa', 'email', 'dataCriacao', 'dataAtualizacao', 'versao']
        );
        res.send(
            serializador.serializar(fornecedor)
        );

    } catch(erro) {
        proximo(erro);
    }
})

roteador.put('/:id', async (req, res, proximo) => {
    try {
        const id = req.params.id;
        const dadosRecebidos = req.body;
        const dados = Object.assign({}, dadosRecebidos, { id: id });
        const fornecedor = new Fornecedor(dados);
        await fornecedor.atualizar();
        res.status(204);
        res.end();

    } catch (erro) {
        proximo(erro);
    }
})

roteador.delete('/:id', async (req, res, proximo) => {
    try {
        const id = req.params.id;
        const fornecedor = new Fornecedor({ id: id })
        await fornecedor.carregar();
        await fornecedor.remover();
        res.status(204);
        res.end();
    } catch (erro) {
        proximo(erro);
    }
})

const roteadorProdutos = require('./produtos');

const verificarFornecedor = async (req, res, proximo) => {
    try {
        const id = req.params.idFornecedor;
        const fornecedor = new Fornecedor({ id: id });
        await fornecedor.carregar();
        req.fornecedor = fornecedor;
        proximo();

    } catch (erro) {
        proximo(erro);
    }
};

roteador.use('/:idFornecedor/produtos', verificarFornecedor, roteadorProdutos);

module.exports = roteador;