const roteador = require('express').Router({ mergeParams: true });
const Produto = require('./Produto');
const TabelaProduto = require('./TabelaProduto');
const Serializador = require('../../../Serializador').SerializadorProduto;

roteador.options('/', (req, res) => {
    res.set('Access-Control-Allow-Methods', 'GET, POST');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.status(204);
    res.end();
});

roteador.get('/', async (req, res) => {
    const produtos = await TabelaProduto.listar(req.fornecedor.id);
    const serializador = new Serializador(res.getHeader('Content-Type'));

    res.set('X-Powered-by', 'Gatito');

    res.send(
        serializador.serializar(produtos)
    );
});

roteador.post('/', async (req, res, proximo) => {
    try{
        const idFornecedor = req.fornecedor.id;
        const corpo = req.body;
        const dados = Object.assign({}, corpo, { fornecedor: idFornecedor })
        const produto = new Produto(dados);
        await produto.criar();
        
        const serializador = new Serializador(res.getHeader('Content-Type'));

        res.set('ETag', produto.versao);
        const timestamp =  (new Date(produto.dataAtualizacao)).getTime();
        res.set('Last-Modified', timestamp);
        res.set('Location', `/api/fornecedores/${produto.fornecedor}/produtos/${produto.id}`);
        res.set('X-Powered-by', 'Gatito');

        res.status(201);
        res.send(
            serializador.serializar(produto)
        );

    } catch (erro) {
        proximo(erro);
    }
});

roteador.options('/:id', (req, res) => {
    res.set('Access-Control-Allow-Methods', 'GET, PUT, DELETE, HEAD');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.status(204);
    res.end();
});

roteador.delete('/:id', async (req, res) => {
    const dados = {
        id: req.params.id,
        fornecedor: req.fornecedor.id
    }

    const produto = new Produto(dados);
    await produto.apagar();

    res.set('X-Powered-by', 'Gatito');
    res.status(204);
    res.end();
});

roteador.get('/:id', async (req, res, proximo) => {
    try {
        const dados = {
            id: req.params.id,
            fornecedor: req.fornecedor.id
        }
    
        const produto = new Produto(dados);
        await produto.carregar();
    
        const serializador = new Serializador(
            res.getHeader('Content-Type'), 
            ['preco', 'estoque', 'fornecedor', 'dataCriacao', 'dataAtualizacao', 'versao']
        );

        res.set('ETag', produto.versao);
        const timestamp =  (new Date(produto.dataAtualizacao)).getTime();
        res.set('Last-Modified', timestamp);
        res.set('X-Powered-by', 'Gatito');

        res.status(200);
        res.send(
            serializador.serializar(produto)
        );
    
    } catch (erro) {
        proximo(erro);
    }
});

roteador.head('/:id', async (req, res, proximo) => {
    try {
        const dados = {
            id: req.params.id,
            fornecedor: req.fornecedor.id
        }
    
        const produto = new Produto(dados);
        await produto.carregar();

        res.set('ETag', produto.versao);
        const timestamp =  (new Date(produto.dataAtualizacao)).getTime();
        res.set('Last-Modified', timestamp);
        res.set('X-Powered-by', 'Gatito');
        res.status(200);
        res.end();
  
    } catch (erro) {
        proximo(erro);
    }
});

roteador.put('/:id', async (req, res, proximo) => {
    try {
        const dados = Object.assign(
            {},
            req.body,
            {
                id: req.params.id,
                fornecedor: req.fornecedor.id
            }
        );
    
        const produto = new Produto(dados);
        await produto.atualizar();
        await produto.carregar();

        res.set('ETag', produto.versao);
        const timestamp =  (new Date(produto.dataAtualizacao)).getTime();
        res.set('Last-Modified', timestamp);
        res.set('X-Powered-by', 'Gatito');

        res.status(204);
        res.end();

    } catch (erro) {
        proximo(erro);
    }
});

roteador.options('/:id/diminuir-estoque', (req, res) => {
    res.set('Access-Control-Allow-Methods', 'POST');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.status(204);
    res.end();
});

roteador.post('/:id/diminuir-estoque', async (req, res, proximo) => {
    try {
        const produto = new Produto({
            id: req.params.id,
            fornecedor: req.fornecedor.id
        });
    
        await produto.carregar();
        produto.estoque = produto.estoque - req.body.quantidade;
        await produto.diminuirEstoque();
        await produto.carregar();

        res.set('ETag', produto.versao);
        const timestamp =  (new Date(produto.dataAtualizacao)).getTime();
        res.set('Last-Modified', timestamp);
        res.set('X-Powered-by', 'Gatito');

        res.status(204);
        res.end();
        
    } catch (erro) {
        proximo(erro);
    }

});

module.exports = roteador;