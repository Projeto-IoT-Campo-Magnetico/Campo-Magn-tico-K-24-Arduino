#include <ESP8266HTTPClient.h>
#include <WiFiClient.h>

// Configurações de WiFi
const char* ssid = "POCOIoT";
const char* password = "teste123";

// Configurações do servidor
const char* serverUrl = "http://192.168.22.25:3000/leituras";
const int sensorPin = A0;    // KY-024 no pino analógico
const int ledPin = 16;       // LED no GPIO16 (D0)
const int threshold = 874;   // Valor limite ajustado

void setup() {
  Serial.begin(115200);
  pinMode(ledPin, OUTPUT);
  digitalWrite(ledPin, LOW);
  
  // Conecta ao WiFi
  WiFi.begin(ssid, password);
  Serial.println("Conectando ao WiFi...");
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  Serial.println("");
  Serial.println("WiFi conectado");
  Serial.println("Endereço IP: ");
  Serial.println(WiFi.localIP());
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    int valorSensor = analogRead(sensorPin);
    bool imaDetectado = valorSensor > threshold;
    
    // Adicionado: Print dos valores no Serial Monitor
    Serial.print("Valor do sensor: ");
    Serial.print(valorSensor);
    Serial.print(" | Estado: ");
    Serial.println(imaDetectado ? "IMÃ DETECTADO" : "SEM IMÃ");
    
    // Controle do LED
    digitalWrite(ledPin, imaDetectado ? HIGH : LOW);
    
    // Envia dados para o servidor
    WiFiClient client;
    HTTPClient http;
    
    http.begin(client, serverUrl);
    http.addHeader("Content-Type", "application/json");
    
    // Cria o JSON com os dados
    String jsonPayload = "{\"valor\":" + String(valorSensor) + 
                         ",\"estado\":\"" + (imaDetectado ? "IMÃ_DETECTADO" : "SEM_IMÃ") + 
                         "\"}";
    
    // Print do JSON que será enviado
    //Serial.print("Enviando JSON: ");
    Serial.println(jsonPayload);
    
    // Envia a requisição POST
    int httpResponseCode = http.POST(jsonPayload);
    
    if (httpResponseCode > 0) {
      Serial.print("Dados enviados. Resposta HTTP: ");
      Serial.println(httpResponseCode);
    } else {
      Serial.print("Erro no envio. Código: ");
      Serial.print(httpResponseCode);
      Serial.print(" | Descrição: ");
      Serial.println(http.errorToString(httpResponseCode));
    }
    
    http.end();
  } else {
    Serial.println("Conexão WiFi perdida");
  }
  
  delay(2000);  // Intervalo entre leituras
}