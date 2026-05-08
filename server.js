const express = require("express");
const cors = require("cors");
const path = require("path");
const db = require("./database/db");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));


// =========================
// POST - salvar respostas
// =========================
app.post("/api/respostas", async (req, res) => {
  console.log("POST RECEBIDO");

  const {
    dispositivo_id,
    demanda,
    apoio,
    respeito,
    autonomia,
    equilibrio
  } = req.body;

  if (!dispositivo_id) {
    return res.status(400).json({
      ok: false,
      mensagem: "dispositivo_id é obrigatório"
    });
  }

  const campos = [
    demanda,
    apoio,
    respeito,
    autonomia,
    equilibrio
  ];

  const valoresValidos = campos.every(
    (valor) =>
      Number.isInteger(valor) &&
      valor >= 0 &&
      valor <= 10
  );

  if (!valoresValidos) {
    return res.status(400).json({
      ok: false,
      mensagem: "Todas as métricas devem ser inteiros entre 0 e 10"
    });
  }

  const criado_em = new Date().toISOString();

  const sql = `
    INSERT INTO respostas (
      dispositivo_id,
      criado_em,
      demanda,
      apoio,
      respeito,
      autonomia,
      equilibrio
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING id
  `;

  try {
    const result = await db.query(sql, [
      dispositivo_id,
      criado_em,
      demanda,
      apoio,
      respeito,
      autonomia,
      equilibrio
    ]);

    res.status(201).json({
      ok: true,
      mensagem: "Resposta salva com sucesso",
      id: result.rows[0].id
    });

  } catch (err) {
    console.error(err.message);

    res.status(500).json({
      ok: false,
      mensagem: "Erro ao salvar resposta"
    });
  }
});


// =========================
// API online
// =========================
app.get("/", (req, res) => {
  res.send("API online");
});


// =========================
// Resumo
// =========================
app.get("/api/resumo", async (req, res) => {

  const sql = `
    SELECT
      COUNT(*) AS total_respostas,
      AVG(demanda) AS media_demanda,
      AVG(apoio) AS media_apoio,
      AVG(respeito) AS media_respeito,
      AVG(autonomia) AS media_autonomia,
      AVG(equilibrio) AS media_equilibrio
    FROM respostas
  `;

  try {

    const result = await db.query(sql);

    const row = result.rows[0];

    const total = Number(row.total_respostas || 0);

    const mediaDemanda = Number(row.media_demanda || 0);
    const mediaApoio = Number(row.media_apoio || 0);
    const mediaRespeito = Number(row.media_respeito || 0);
    const mediaAutonomia = Number(row.media_autonomia || 0);
    const mediaEquilibrio = Number(row.media_equilibrio || 0);

    const indiceGeral =
      total > 0
        ? (
            mediaDemanda +
            mediaApoio +
            mediaRespeito +
            mediaAutonomia +
            mediaEquilibrio
          ) / 5
        : 0;

    res.json({
      ok: true,
      total_respostas: total,
      indice_geral: Number(indiceGeral.toFixed(1)),
      metricas: {
        demanda: Number(mediaDemanda.toFixed(1)),
        apoio: Number(mediaApoio.toFixed(1)),
        respeito: Number(mediaRespeito.toFixed(1)),
        autonomia: Number(mediaAutonomia.toFixed(1)),
        equilibrio: Number(mediaEquilibrio.toFixed(1))
      }
    });

  } catch (err) {

    console.error(err.message);

    res.status(500).json({
      ok: false,
      mensagem: "Erro ao consultar resumo"
    });
  }
});


// =========================
// Últimas respostas
// =========================
app.get("/api/respostas", async (req, res) => {

  const sql = `
    SELECT *
    FROM respostas
    ORDER BY criado_em DESC
    LIMIT 50
  `;

  try {

    const result = await db.query(sql);

    res.json({
      ok: true,
      total: result.rows.length,
      respostas: result.rows
    });

  } catch (err) {

    console.error(err.message);

    res.status(500).json({
      ok: false,
      mensagem: "Erro ao listar respostas"
    });
  }
});


// =========================
// Evolução
// =========================
app.get("/api/evolucao", async (req, res) => {

  const sql = `
    SELECT
      DATE(criado_em) AS data,
      COUNT(*) AS respostas,
      AVG(
        (
          demanda +
          apoio +
          respeito +
          autonomia +
          equilibrio
        ) / 5.0
      ) AS indice_geral
    FROM respostas
    GROUP BY DATE(criado_em)
    ORDER BY data ASC
  `;

  try {

    const result = await db.query(sql);

    const dados = result.rows.map((item) => ({
      data: item.data,
      respostas: Number(item.respostas),
      indice_geral: Number(
        Number(item.indice_geral).toFixed(1)
      )
    }));

    res.json({
      ok: true,
      pontos: dados
    });

  } catch (err) {

    console.error(err.message);

    res.status(500).json({
      ok: false,
      mensagem: "Erro ao consultar evolução"
    });
  }
});


// =========================
// Inicialização
// =========================
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});