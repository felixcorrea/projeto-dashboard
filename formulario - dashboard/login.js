const usuarios = {
  rh: {
    senha: 'rh123',
    perfil: 'rh',
    destino: 'index.html'
  },
  colaborador: {
    senha: 'colab123',
    perfil: 'colaborador',
    destino: 'formulario.html'
  }
}

document
  .getElementById('loginForm')
  .addEventListener('submit', function (evento) {

    evento.preventDefault()

    const usuario = document
      .getElementById('usuario')
      .value
      .toLowerCase()
      .trim()

    const senha = document
      .getElementById('senha')
      .value

    if (
      usuarios[usuario] &&
      usuarios[usuario].senha === senha
    ) {
      localStorage.setItem('perfil', usuarios[usuario].perfil)
      localStorage.setItem('usuario', usuario)

      window.location.href = usuarios[usuario].destino
    } else {
      document.getElementById('mensagem').innerText =
        'Usuário ou senha inválidos'
    }
  })