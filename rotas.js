const express = require('express');
const rotas = express();
const chamada = require('./controle/req');
const verify = require('./Auxiliares/verifyLogin');

rotas.post('/logar', chamada.logar);
rotas.post('/cadastrar', chamada.cadastrar);
rotas.get('/listar', chamada.listarTudo);
rotas.put('/editar/:id', verify, chamada.editar);
rotas.delete('/deletar/:id', chamada.deletar);

module.exports = rotas;