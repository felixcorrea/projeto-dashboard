const perfil = localStorage.getItem('perfil')

if (perfil !== 'colaborador' && perfil !== 'rh') {
  window.location.href = 'login.html'
}

const API_URL =
  'https://api-tcc-kozs.onrender.com/api/respostas'

const formulario =
  document.getElementById('formulario')

formulario.addEventListener('submit', enviarFormulario)

async function enviarFormulario(evento) {

  evento.preventDefault()

  const dados = {

    dispositivo_id:
      document.getElementById('dispositivo_id').value,

    demanda:
      Number(document.getElementById('demanda').value),

    apoio:
      Number(document.getElementById('apoio').value),

    respeito:
      Number(document.getElementById('respeito').value),

    autonomia:
      Number(document.getElementById('autonomia').value),

    equilibrio:
      Number(document.getElementById('equilibrio').value)
  }

  try {

    const response = await fetch(API_URL, {

      method: 'POST',

      headers: {
        'Content-Type': 'application/json'
      },

      body: JSON.stringify(dados)
    })

    if (!response.ok) {
      throw new Error('Erro ao salvar')
    }

    document.getElementById('mensagem').innerText =
      'Registro salvo com sucesso!'

    formulario.reset()

  } catch (erro) {

    console.error(erro)

    document.getElementById('mensagem').innerText =
      'Erro ao salvar registro'
  }
}

function sair() {
  localStorage.removeItem('perfil')
  window.location.href = 'login.html'
}