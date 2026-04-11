const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.join(__dirname, "psicossocial.db");

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Erro ao conectar no SQLite:", err.message);
  } else {
    console.log("SQLite conectado com sucesso.");
  }
});

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS respostas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      dispositivo_id TEXT NOT NULL,
      criado_em TEXT NOT NULL,
      demanda INTEGER NOT NULL,
      apoio INTEGER NOT NULL,
      respeito INTEGER NOT NULL,
      autonomia INTEGER NOT NULL,
      equilibrio INTEGER NOT NULL
    )
  `);
});

module.exports = db;