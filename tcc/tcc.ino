#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>

#include <BluetoothSerial.h>
#include <Preferences.h>

#include <SPI.h>
#include <Adafruit_GFX.h>
#include <Adafruit_ST7735.h>



// =========================
// DISPLAY
// =========================

#define TFT_CS   25
#define TFT_DC   26
#define TFT_RST  27
#define TFT_SCLK 14
#define TFT_MOSI 13

Adafruit_ST7735 tft =
Adafruit_ST7735(
  TFT_CS,
  TFT_DC,
  TFT_MOSI,
  TFT_SCLK,
  TFT_RST
);

// =========================
// LEDS
// =========================

#define LED_VERMELHO 15
#define LED_AMARELO  4
#define LED_VERDE    5

// =========================
// BUZZER
// =========================

#define BUZZER 18

// =========================
// ENCODER
// =========================

#define ENC_CLK 32
#define ENC_DT 33
#define ENC_SW 19

// =========================
// API
// =========================

const char* serverUrl =
"https://api-tcc-kozs.onrender.com/api/respostas";

// =========================
// BT / WIFI
// =========================

BluetoothSerial SerialBT;
Preferences preferences;

String ssid = "";
String password = "";

bool wifiConectado = false;

// =========================
// FORM
// =========================

String perguntas[5][2] = {
  {"DEMANDA", "do trabalho"},
  {"APOIO", "da equipe"},
  {"RESPEITO", "no ambiente"},
  {"AUTONOMIA", "no trabalho"},
  {"EQUILIBRIO", "emocional"}
};


int respostas[5] = {5,5,5,5,5};

int perguntaAtual = 0;

int valorAtual = 5;

int ultimoCLK;

// =========================
// BEEP
// =========================

void beep(int freq = 2000, int tempo = 60) {

  ledcAttach(BUZZER, freq, 8);

  ledcWrite(BUZZER, 128);

  delay(tempo);

  ledcWrite(BUZZER, 0);

  ledcDetach(BUZZER);
}

// =========================
// LEDS
// =========================

void desligarLeds() {

  digitalWrite(LED_VERMELHO, LOW);
  digitalWrite(LED_AMARELO, LOW);
  digitalWrite(LED_VERDE, LOW);
}

// =========================
// TELAS WIFI
// =========================

void telaAguardandoWiFi() {

  tft.fillScreen(ST77XX_BLACK);

  tft.setTextColor(ST77XX_CYAN);

  tft.setTextSize(2);

  tft.setCursor(5, 10);
  tft.println("WiFi");

  tft.setTextSize(1);

  tft.setTextColor(ST77XX_WHITE);

  tft.setCursor(5, 40);
  tft.println("Bluetooth:");

  tft.setTextColor(ST77XX_YELLOW);

  tft.setCursor(5, 55);
  tft.println("ESP32_PESQUISA");

  tft.setTextColor(ST77XX_WHITE);

  tft.setCursor(5, 85);
  tft.println("Envie:");

  tft.setTextColor(ST77XX_GREEN);

  tft.setCursor(5, 100);
  tft.println("WIFI:rede");

  tft.setCursor(5, 115);
  tft.println(";SENHA:senha");
}

void telaConectandoWiFi() {

  tft.fillScreen(ST77XX_BLACK);

  tft.setTextColor(ST77XX_YELLOW);

  tft.setTextSize(2);

  tft.setCursor(10, 50);

  tft.println("Conectando");
}

void telaWiFiOK() {

  tft.fillScreen(ST77XX_BLACK);

  tft.setTextColor(ST77XX_GREEN);

  tft.setTextSize(2);

  tft.setCursor(20, 50);

  tft.println("WiFi OK");
}

void telaWiFiErro() {

  tft.fillScreen(ST77XX_BLACK);

  tft.setTextColor(ST77XX_RED);

  tft.setTextSize(2);

  tft.setCursor(20, 50);

  tft.println("Erro WiFi");
}


// =========================
// CENTRALIZAR TEXTO
// =========================


void textoCentralizado(
  String texto,
  int y,
  int tamanho,
  uint16_t cor
) {

  int16_t x1, y1;
  uint16_t w, h;

  tft.setTextSize(tamanho);

  tft.getTextBounds(
    texto,
    0,
    y,
    &x1,
    &y1,
    &w,
    &h
  );

  int x = (160 - w) / 2;

  tft.setCursor(x, y);

  tft.setTextColor(cor);

  tft.print(texto);
}

// =========================
// FORMULARIO
// =========================

void desenharTela() {

  tft.fillScreen(ST77XX_BLACK);

  tft.setTextWrap(true);

  // PERGUNTA
textoCentralizado(
  perguntas[perguntaAtual][0],
  10,
  2,
  ST77XX_CYAN
);

textoCentralizado(
  perguntas[perguntaAtual][1],
  35,
  1,
  ST77XX_WHITE
);

  // COR DA NOTA
  uint16_t corNota;

  if (valorAtual <= 3) {

    corNota = ST77XX_RED;

  } else if (valorAtual <= 7) {

    corNota = ST77XX_YELLOW;

  } else {

    corNota = ST77XX_GREEN;
  }

  // NOTA
  textoCentralizado(
    String(valorAtual)+ "/10",
    55,
    5,
    corNota
  );

  // RODAPE
  textoCentralizado(
    "Gire para alterar",
    100,
    1,
    ST77XX_YELLOW
  );

  textoCentralizado(
    "Clique confirma",
    115,
    1,
    ST77XX_GREEN
  );
}

// =========================
// PREFERENCES
// =========================

void carregarCredenciais() {

  preferences.begin("wifi", true);

  ssid = preferences.getString("ssid", "");

  password = preferences.getString("pass", "");

  preferences.end();
}

void salvarCredenciais(
  String novoSSID,
  String novaSenha
) {

  preferences.begin("wifi", false);

  preferences.putString("ssid", novoSSID);

  preferences.putString("pass", novaSenha);

  preferences.end();

  ssid = novoSSID;

  password = novaSenha;
}

// =========================
// WIFI
// =========================

bool conectarWiFi() {

  if (ssid.isEmpty()) return false;

  desligarLeds();

  digitalWrite(LED_AMARELO, HIGH);

  telaConectandoWiFi();

  WiFi.mode(WIFI_STA);

  WiFi.begin(
    ssid.c_str(),
    password.c_str()
  );

  int tentativas = 0;

  while (
    WiFi.status() != WL_CONNECTED &&
    tentativas < 20
  ) {

    delay(500);

    tentativas++;
  }

  if (WiFi.status() == WL_CONNECTED) {

    wifiConectado = true;

    desligarLeds();

    digitalWrite(LED_VERDE, HIGH);

    beep();

    telaWiFiOK();

    delay(1000);

    return true;
  }

  wifiConectado = false;

  desligarLeds();

  digitalWrite(LED_VERMELHO, HIGH);

  telaWiFiErro();

  return false;
}

// =========================
// BLUETOOTH
// =========================

void iniciarBluetooth() {

  SerialBT.begin("ESP32_PESQUISA");

  SerialBT.println("ESP32 pronto");

  SerialBT.println(
    "WIFI:rede;SENHA:senha"
  );
}

void processarBluetooth() {

  if (!SerialBT.available()) return;

  String comando =
    SerialBT.readStringUntil('\n');

  comando.trim();

  if (comando.startsWith("WIFI:")) {

    int idxSenha =
      comando.indexOf(";SENHA:");

    if (idxSenha > 5) {

      String novoSSID =
        comando.substring(5, idxSenha);

   String novaSenha =
  comando.substring(idxSenha + 7);

      salvarCredenciais(
        novoSSID,
        novaSenha
      );

      SerialBT.println("Salvo");

      if (conectarWiFi()) {

        SerialBT.println("WiFi OK");

        desenharTela();
      }
    }
  }
}

// =========================
// API
// =========================

void enviarRespostas() {

  if (WiFi.status() != WL_CONNECTED) {
    tft.fillScreen(ST77XX_RED);
    tft.setTextColor(ST77XX_WHITE);
    tft.setTextSize(2);
    tft.setCursor(10, 50);
    tft.println("Sem WiFi");
    delay(2000);
    desenharTela();
    return;
  }

  // libera memoria antes do HTTPS
  Serial.println("Desligando Bluetooth...");
  SerialBT.end();
  btStop();
  delay(500);

  desligarLeds();
  digitalWrite(LED_AMARELO, HIGH);

  tft.fillScreen(ST77XX_BLACK);
  tft.setTextColor(ST77XX_YELLOW);
  tft.setTextSize(2);
  tft.setCursor(10, 40);
  tft.println("Enviando");

  Serial.println("Iniciando envio HTTPS...");

  WiFiClientSecure client;
  client.setInsecure();

  HTTPClient http;
  http.setTimeout(30000);
  http.setReuse(false);

  bool ok = http.begin(client, serverUrl);

  if (!ok) {
    Serial.println("Falha http.begin");
    tft.fillScreen(ST77XX_RED);
    tft.setCursor(10, 50);
    tft.println("HTTP FAIL");
    delay(3000);
    desenharTela();
    iniciarBluetooth();
    return;
  }

  http.addHeader("Content-Type", "application/json");
  http.addHeader("Connection", "close");

  String body = "{";
  body += "\"dispositivo_id\":\"ESP32_01\",";
  body += "\"demanda\":" + String(respostas[0]) + ",";
  body += "\"apoio\":" + String(respostas[1]) + ",";
  body += "\"respeito\":" + String(respostas[2]) + ",";
  body += "\"autonomia\":" + String(respostas[3]) + ",";
  body += "\"equilibrio\":" + String(respostas[4]);
  body += "}";

  Serial.println(body);

  int httpCode = http.POST(body);

  Serial.print("HTTP CODE: ");
  Serial.println(httpCode);

  String respostaServidor = http.getString();
  Serial.println(respostaServidor);

  http.end();
  client.stop();

  if (httpCode == 201 || httpCode == 200) {
    desligarLeds();
    digitalWrite(LED_VERDE, HIGH);

    tft.fillScreen(ST77XX_BLACK);
    tft.setTextColor(ST77XX_GREEN);
    tft.setTextSize(2);
    tft.setCursor(10, 30);
    tft.println("ENVIADO");

    delay(3000);

    perguntaAtual = 0;
    valorAtual = 5;

    for (int i = 0; i < 5; i++) {
      respostas[i] = 5;
    }

    desenharTela();

  } else {
    desligarLeds();
    digitalWrite(LED_VERMELHO, HIGH);

    tft.fillScreen(ST77XX_BLACK);
    tft.setTextColor(ST77XX_RED);
    tft.setTextSize(2);
    tft.setCursor(10, 20);
    tft.println("ERRO");

    tft.setCursor(10, 60);
    tft.print(httpCode);

    delay(5000);
    desenharTela();
  }

  iniciarBluetooth();
}
// =========================
// SETUP
// =========================

void setup() {

  Serial.begin(115200);

  pinMode(LED_VERMELHO, OUTPUT);
  pinMode(LED_AMARELO, OUTPUT);
  pinMode(LED_VERDE, OUTPUT);

  desligarLeds();

  pinMode(ENC_CLK, INPUT);
  pinMode(ENC_DT, INPUT);
  pinMode(ENC_SW, INPUT_PULLUP);

  ultimoCLK = digitalRead(ENC_CLK);

  tft.initR(INITR_BLACKTAB);

  tft.setRotation(1);

  iniciarBluetooth();

  carregarCredenciais();

  if (!conectarWiFi()) {

    telaAguardandoWiFi();

  } else {

    desenharTela();
  }
}

// =========================
// LOOP
// =========================

void loop() {

  processarBluetooth();

if (WiFi.status() != WL_CONNECTED) {
  wifiConectado = false;
  conectarWiFi();
  return;
}

  int estadoCLK = digitalRead(ENC_CLK);

  if (
    estadoCLK != ultimoCLK &&
    estadoCLK == LOW
  ) {

    if (
      digitalRead(ENC_DT) != estadoCLK
    ) {

      valorAtual++;

    } else {

      valorAtual--;
    }

    valorAtual =
      constrain(valorAtual, 0, 10);

    desenharTela();
  }

  ultimoCLK = estadoCLK;

  if (digitalRead(ENC_SW) == LOW) {

    beep();

    respostas[perguntaAtual] =
      valorAtual;

    perguntaAtual++;

    delay(300);

    if (perguntaAtual >= 5) {

      enviarRespostas();

    } else {

      valorAtual =
        respostas[perguntaAtual];

      desenharTela();
    }
  }
}