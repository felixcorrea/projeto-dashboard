Sistema de Monitoramento de Fatores Psicossociais
Apresentação

Este repositório se trata do código-fonte de uma solução para coleta, armazenamento e visualização de indicadores relacionados aos fatores psicossociais em ambientes de trabalho.

Esse protótipo foi desenvolvido utilizando tecnologias web, banco de dados, API REST e um dispositivo embarcado baseado em ESP32, permitindo que colaboradores respondam rapidamente a um questionário eletrônico e que o setor de Recursos Humanos (RH) acompanhe os resultados de forma centralizada.

Estrutura do Projeto


API

Responsável por receber, validar e armazenar as respostas enviadas pelos dispositivos e pelo formulário web.

Principais funções:

Receber respostas dos questionários;
Validar os dados recebidos;
Armazenar os registros no banco de dados PostgreSQL;
Disponibilizar endpoints para consulta de indicadores e relatórios.

Tecnologias utilizadas:

Node.js
Express
PostgreSQL


ESP32

Código-fonte do dispositivo utilizado para coleta das respostas dos colaboradores.

Principais funções:

Exibir perguntas em uma interface local;
Permitir a navegação e seleção das respostas;
Conectar-se à rede Wi-Fi;
Enviar os dados para a API através de requisições HTTPS;
Fornecer feedback visual ao usuário durante o processo de envio.

Tecnologias utilizadas:

ESP32
Arduino Framework
WiFiClientSecure
Display TFT_eSPI
Interface Web


Aplicação web 

Possui dois perfis de acesso:

Colaborador
Preenchimento do questionário;
Envio das respostas para a API.
RH
Visualização de indicadores;
Consulta de resultados consolidados;
Acompanhamento dos dados coletados.

Tecnologias utilizadas:

HTML
CSS
JavaScript
Objetivo Acadêmico

Este projeto foi desenvolvido como parte das atividades de conclusão de curso e tem finalidade educacional e de pesquisa, demonstrando a integração entre sistemas embarcados, aplicações web e banco de dados para apoio à gestão organizacional.
