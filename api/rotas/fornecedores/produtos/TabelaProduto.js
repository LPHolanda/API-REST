const Modelo = require('./ModeloTabelaProduto');
const instancia = require('../../../banco-de-dados');
const NaoEncontrado = require('../../../erros/NaoEncontrado');

module.exports = {
    listar(idFornecedor) {
        return Modelo.findAll({
            where: {
                fornecedor: idFornecedor
            },
            raw: true
        });
    },

    inserir(dados) {
        return Modelo.create(dados);
    },

    remover(idProduto, idFornecedor) {
        return Modelo.destroy({
            where: {
                id: idProduto,
                fornecedor: idFornecedor
            }
        });
    },

    async buscarPorId(idProduto, idFornecedor) {
        const produtoEncontrado = await Modelo.findOne({
            where: {
                id: idProduto,
                fornecedor: idFornecedor
            },
            raw: true
        });

        if (!produtoEncontrado) {
            throw new NaoEncontrado('Produto');
        }

        return produtoEncontrado;
    },

    atualizar(dadosDoProduto, dadosParaAtualizar) {
        return Modelo.update(
            dadosParaAtualizar,
            {
                where: dadosDoProduto
            }
        );
    },

    subtrair(idProduto, idFornecedor, campo, quantidade) {
        return instancia.transaction(async transacao => {
            const produto = await Modelo.findOne({
                where: {
                    id: idProduto,
                    fornecedor: idFornecedor
                }
            });

            produto[campo] = quantidade;

            await produto.save();

            return produto;
        });
    }
}