const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

pool.connect()
  .then(() => {
    console.log("PostgreSQL conectado com sucesso.");
  })
  .catch((err) => {
    console.error("Erro ao conectar no PostgreSQL:", err.message);
  });

const criarTabela = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS respostas (
        id SERIAL PRIMARY KEY,
        dispositivo_id TEXT NOT NULL,
        criado_em TIMESTAMP NOT NULL,
        demanda INTEGER NOT NULL,
        apoio INTEGER NOT NULL,
        respeito INTEGER NOT NULL,
        autonomia INTEGER NOT NULL,
        equilibrio INTEGER NOT NULL
      )
    `);

    console.log("Tabela respostas pronta.");
  } catch (err) {
    console.error("Erro ao criar tabela:", err.message);
  }
};

criarTabela();

module.exports = pool;
