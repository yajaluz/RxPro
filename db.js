const {Pool} = require('pg');

const pool = new Pool({
    connectionString:  'postgres://vefwltpj:xiPiL3urWDLNFMq8046z7T05xcepot4A@motty.db.elephantsql.com/vefwltpj'
});

const query = (text, param) => {
    return pool.query(text, param);
}

module.exports = {query};