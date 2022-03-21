const { uuid } = require('uuidv4');
const bc = require('bcrypt');
const conn = require('../db');
const secret = require('../segredo');
const jwt = require('jsonwebtoken');

const cadastrar = async (req, res) => {
    const {nome, usernick, password} = req.body;

    if(!nome)
    {
        return res.status(400).json('O campo nome é obrigatório');
    }
    
    if(!usernick)
    {
        return res.status(400).json('O campo usernick é obrigatório');
    }
    
    if(!password)
    {
        return res.status(400).json('O campo password é obrigatório');
    }

    try 
    {
        const verify = await conn.query('select * from cadastros where usernick = $1', [usernick]);
        
        if(verify > 0)
        {
            return res.status(400).json('O usuário informado já existe');
        }

       const crypt = await bc.hash(password, 10);
       const insert = await conn.query('insert into cadastros(id, nome,usernick, password) values($1, $2, $3, $4)', [uuid() ,nome, usernick, crypt]);

       if(insert === 0)
       {
        return res.status(400).json('Não foi possível cadastrar o usuário');
       }

    } catch (error) {
        return res.status(400).json(error.message);
    }

    return res.status(200).json('Cadastro criado com sucesso');
}

const logar = async (req, res) => {
    const {usernick, password} = req.body;
    
    if(!usernick || !password)
    {
        return res.status(400).json('Usuário e senha são campos obrigatórios');
    }

    try 
    {
        const {rows, rowsCount} = await conn.query('select * from cadastros where usernick = $1', [usernick]);
        
        if(rowsCount === 0)
        {
            return res.status(400).json('Usuário não encontrado');
        }

        const user = rows[0];

        const passVerify = await bc.compare(password, user.password);

        if(!passVerify)
        {
            return res.status(400).json('Usuário e senha não conferem');
        }

        const token = jwt.sign({id: user.id}, secret, {expiresIn: '3h'});

        return res.status(200).json({
            usernick,
            token});

    } catch (error) {
        return res.status(400).json(error.message);
    }
}

const editar = async (req, res) => {
    const {id: idInput} = req.params;
    const {nome, usernick, password} = req.body;
    const {user} = req;

    if(!nome)
    {
        return res.status(400).json('O campo nome é obrigatório');
    }
    
    if(!usernick)
    {
        return res.status(400).json('O campo usernick é obrigatório');
    }
    
    if(!password)
    {
        return res.status(400).json('O campo password é obrigatório');
    }
 
    try 
    {
       const exists = await conn.query('select * from cadastros where id = $1 and usernick = $2', [idInput, user.usernick]);

       if(exists.rowCount === 0)
       {
           return res.status(404).json('Cadastro não encontrado');
       }

       const crypt = await bc.hash(password, 10);
       const up = await conn.query('update cadastros set nome = $1, usernick = $2, password = $3 where id = $4', [nome, usernick, crypt, user.id]);

       if(up.rowCount === 0)
       {
        return res.status(400).json('Não foi possível atualizar o usuário');
       }

    } catch (error) {
        return res.status(400).json(error.message);
    }

    return res.status(200).json('Cadastro atualizado com sucesso');
}

const deletar = async (req, res) => {
    const {id} = req.params;
 
    const search = await conn.query('select * from cadastros where id = $1', [id]);

    if(search.rows === 0)
    {
        return res.status(400).json('Cadastro não encontrado');
    }

    try 
    {
       await conn.query('delete from cadastros where id = $1', [id]);
    } catch (error) {
        return res.status(400).json(error.message);
    }

    return res.status(200).json('Cadastro deletado com sucesso');
}

const listarTudo = async (req, res) => {
    const arr = await conn.query('select * from cadastros');
    return res.json(arr.rows);
}

module.exports = {
    cadastrar,
    logar,
    editar,
    listarTudo,
    deletar
}