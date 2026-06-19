const perfil = localStorage.getItem('perfil')

if (perfil !== 'rh') {
  window.location.href = 'login.html'
}

const API_URL =  'https://api-tcc-kozs.onrender.com/api/respostas'

let dadosGlobais = []

async function carregarDados() {

  try {

    const response = await fetch(API_URL)

    const json = await response.json()


    const dados = json.respostas

    dadosGlobais = dados
    
    preencherCards(dados)

    preencherTabela(dados)

    criarGraficos(dados)

  } catch (erro) {

    console.error(erro)

    alert('Erro ao carregar dados da API')
  }
}

function preencherCards(dados) {

  document.getElementById('totalRespostas').innerText =
    dados.length

  const ultimo = dados[0]

  document.getElementById('ultimoDispositivo').innerText =
    ultimo?.dispositivo_id || '-'

  let soma = 0
  let totalCampos = 0

  dados.forEach(item => {

    soma += item.demanda
    soma += item.apoio
    soma += item.respeito
    soma += item.autonomia
    soma += item.equilibrio

    totalCampos += 5
  })

const media =
  totalCampos > 0
    ? Number((soma / totalCampos).toFixed(1))
    : 0

  const mediaEl =
  document.getElementById('mediaGeral')

mediaEl.innerText = media

mediaEl.classList.remove(
  'nota-ruim',
  'nota-media',
  'nota-boa'
)

if (media <= 3) {

  mediaEl.classList.add('nota-ruim')

} else if (media <= 7) {

  mediaEl.classList.add('nota-media')

} else {

  mediaEl.classList.add('nota-boa')
}  
    
    
    
}

function preencherTabela(dados) {

  const tabela =
    document.getElementById('tabelaRespostas')

  tabela.innerHTML = ''

  dados.slice(0, 10).forEach(item => {

    tabela.innerHTML += `
      <tr>
        <td>${item.id}</td>
        <td>${item.dispositivo_id}</td>
        <td>${item.demanda}</td>
        <td>${item.apoio}</td>
        <td>${item.respeito}</td>
        <td>${item.autonomia}</td>
        <td>${item.equilibrio}</td>
      </tr>
    `
  })
}

function calcularMedias(dados) {

  const total = dados.length

  if (total === 0) {
    return {
      demanda: 0,
      apoio: 0,
      respeito: 0,
      autonomia: 0,
      equilibrio: 0
    }
  }

  let demanda = 0
  let apoio = 0
  let respeito = 0
  let autonomia = 0
  let equilibrio = 0

  dados.forEach(item => {

    demanda += item.demanda
    apoio += item.apoio
    respeito += item.respeito
    autonomia += item.autonomia
    equilibrio += item.equilibrio
  })

  return {
    demanda: Number((demanda / total).toFixed(1)),
    apoio: Number((apoio / total).toFixed(1)),
    respeito: Number((respeito / total).toFixed(1)),
    autonomia: Number((autonomia / total).toFixed(1)),
    equilibrio: Number((equilibrio / total).toFixed(1))
  }
}

let graficoBarra = null
let graficoRadar = null

function criarGraficos(dados) {

  const medias = calcularMedias(dados)

  const labels = [
    'Demanda',
    'Apoio',
    'Respeito',
    'Autonomia',
    'Equilíbrio'
  ]

  const valores = [
    medias.demanda,
    medias.apoio,
    medias.respeito,
    medias.autonomia,
    medias.equilibrio
  ]

  // DESTROI gráficos antigos

  if (graficoBarra) {
    graficoBarra.destroy()
  }

  if (graficoRadar) {
    graficoRadar.destroy()
  }

  // GRÁFICO BARRAS

  graficoBarra = new Chart(
    document.getElementById('graficoBarras'),
    {

      type: 'bar',

      data: {

        labels,

        datasets: [{

  label: 'Média Geral',

  data: valores,

  borderRadius: 10,

  backgroundColor: [
    '#dc2626',
    '#f59e0b',
    '#22c55e',
    '#3b82f6',
    '#8b5cf6'
  ]
}]
      },

     options: {

  responsive: true,

  maintainAspectRatio: false,

  plugins: {

    legend: {
      display: false
    }
  },

  scales: {

    y: {

      beginAtZero: true,

      max: 10,

      ticks: {
        stepSize: 2
      },

      grid: {
        color: '#e5e7eb'
      }
    },

    x: {

      grid: {
        display: false
      }
    }
  }
}
    }
  )

  // GRÁFICO RADAR

  graficoRadar = new Chart(
    document.getElementById('graficoRadar'),
    {

      type: 'radar',

      data: {

        labels,

       datasets: [{

  label: 'Bem-estar',

  data: valores,

  backgroundColor: 'rgba(37,99,235,0.2)',

  borderColor: '#2563eb',

  borderWidth: 3,

  pointBackgroundColor: '#2563eb',

  pointBorderColor: '#ffffff',

  pointRadius: 5
}]
      },

      options: {
        responsive: true,

        maintainAspectRatio: false,

      scales: {
  r: {

    min: 0,

    max: 10,

    ticks: {
      stepSize: 2,
      backdropColor: 'transparent'
    },

    grid: {
      color: '#d1d5db'
    },

    angleLines: {
      color: '#d1d5db'
    },

    pointLabels: {
      color: '#374151',
      font: {
        size: 14,
        weight: 'bold'
      }
    }
  }
}
        
        
      }
    }
  )
}

carregarDados()

document
  .getElementById('filtroDispositivo')
  .addEventListener('input', filtrarTabela)

function filtrarTabela(evento) {

  const valor =
    evento.target.value.toLowerCase()

  const filtrados = dadosGlobais.filter(item => {

    return (item.dispositivo_id || '')
  .toLowerCase()
  .includes(valor)
  })

  preencherTabela(filtrados)
}

function sair() {
  localStorage.removeItem('perfil')
  window.location.href = 'login.html'
}