const jwt = require('jsonwebtoken');
const conn = require('../db');
const secret = require('../segredo');

const verificaLogin = async (req, res, next) => {
    const {authorization} = req.headers;

    if(!authorization)
    {
        return res.status(400).json('Token não informado');
    }

    try {
        const token = authorization.replace('Bearer', '').trim();

        const { id } = jwt.verify(token, secret);

       const {rows, rowCount} = await conn.query('select * from cadastros where id = $1', [id]);

       if(rowCount === 0)
       {
           return res.status(404).json('Cadastro não encontrado no banco de dados');
       }

        const {password, ...dataUser} = rows[0];

        req.user = dataUser;

        next();

    } catch (error) {
        return res.status(400).json(error.message);
    }

}

module.exports = verificaLogin;