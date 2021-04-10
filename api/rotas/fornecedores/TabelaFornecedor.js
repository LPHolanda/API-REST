const Modelo = require('./ModeloTabelaFornecedor');
const NaoEncontrado = require('../../erros/NaoEncontrado');

module.exports = {
    listar() {
        return Modelo.findAll({ raw: true });
    },

    inserir(fornecedor) {
        return Modelo.create(fornecedor);
    },

    async buscarPorId(id) {
        const fornecedorEncontrado = await Modelo.findOne({
            where: {
                id: id
            }
        });

        if (!fornecedorEncontrado) {
            throw new NaoEncontrado();
        }

        return fornecedorEncontrado;
    },

    atualizar(id, dadosParaAtualizar) {
        return Modelo.update(
            dadosParaAtualizar,
            {
                where: { id: id }
            }
        );
    },

    remover(id) {
        return Modelo.destroy({
            where: {
                id: id
            }
        })
    }
}