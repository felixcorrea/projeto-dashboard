const express = require("express");
const cors = require("cors");
const path = require("path");
const db = require("./database/db");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.post("/api/respostas", (req, res) => {
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
    return res.status(400).json({ ok: false, mensagem: "dispositivo_id é obrigatório" });
  }

  const campos = [demanda, apoio, respeito, autonomia, equilibrio];

  const valoresValidos = campos.every(
    (valor) => Number.isInteger(valor) && valor >= 0 && valor <= 10
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
      dispositivo_id, criado_em, demanda, apoio, respeito, autonomia, equilibrio
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(
    sql,
    [dispositivo_id, criado_em, demanda, apoio, respeito, autonomia, equilibrio],
    function (err) {
      if (err) {
        console.error(err.message);
        return res.status(500).json({ ok: false, mensagem: "Erro ao salvar resposta" });
      }

      res.status(201).json({
        ok: true,
        mensagem: "Resposta salva com sucesso",
        id: this.lastID
      });
    }
  );
});

app.get("/api/resumo", (req, res) => {
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

  db.get(sql, [], (err, row) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ ok: false, mensagem: "Erro ao consultar resumo" });
    }

    const total = row.total_respostas || 0;

    const mediaDemanda = Number(row.media_demanda || 0);
    const mediaApoio = Number(row.media_apoio || 0);
    const mediaRespeito = Number(row.media_respeito || 0);
    const mediaAutonomia = Number(row.media_autonomia || 0);
    const mediaEquilibrio = Number(row.media_equilibrio || 0);

    const indiceGeral =
      total > 0
        ? (mediaDemanda + mediaApoio + mediaRespeito + mediaAutonomia + mediaEquilibrio) / 5
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
  });
});

app.get("/api/respostas", (req, res) => {
  const sql = `
    SELECT *
    FROM respostas
    ORDER BY datetime(criado_em) DESC
    LIMIT 50
  `;

  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ ok: false, mensagem: "Erro ao listar respostas" });
    }

    res.json({
      ok: true,
      total: rows.length,
      respostas: rows
    });
  });
});

app.get("/api/evolucao", (req, res) => {
  const sql = `
    SELECT
      substr(criado_em, 1, 10) AS data,
      COUNT(*) AS respostas,
      AVG((demanda + apoio + respeito + autonomia + equilibrio) / 5.0) AS indice_geral
    FROM respostas
    GROUP BY substr(criado_em, 1, 10)
    ORDER BY data ASC
  `;

  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ ok: false, mensagem: "Erro ao consultar evolução" });
    }

    const dados = rows.map((item) => ({
      data: item.data,
      respostas: item.respostas,
      indice_geral: Number(Number(item.indice_geral).toFixed(1))
    }));

    res.json({
      ok: true,
      pontos: dados
    });
  });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});