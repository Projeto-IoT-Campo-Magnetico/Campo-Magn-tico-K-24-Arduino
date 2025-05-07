#include <ESP8266WiFi.h>

const int sensorPin = A0;    // KY-024 no pino analógico
const int ledPin = 16;       // LED no GPIO16 (D0)
const int threshold = 874;    // Valor limite ajustado

void setup() {
  Serial.begin(115200);
  pinMode(ledPin, OUTPUT);
  digitalWrite(ledPin, LOW);
  Serial.println("Sistema iniciado - Threshold: 874");
}

void loop() {
  int valorSensor = analogRead(sensorPin);
  bool imaDetectado = valorSensor > threshold;
  
  // Controle do LED
  digitalWrite(ledPin, imaDetectado ? HIGH : LOW);
  
  // Envia dados formatados para o Serial
  Serial.print("VALOR:");
  Serial.print(valorSensor);
  Serial.print(",ESTADO:");
  Serial.println(imaDetectado ? "IMÃ_DETECTADO" : "SEM_IMÃ");
  
  delay(300);  // Intervalo entre leituras
}