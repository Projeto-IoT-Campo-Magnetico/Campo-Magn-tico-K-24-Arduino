const int sensorPin = A0;
const int ledPin = 13;
const int threshold = 874;

void setup() {
  Serial.begin(9600);
  pinMode(ledPin, OUTPUT);
  // Remova a mensagem inicial para evitar problemas
}

void loop() {
  int valorSensor = analogRead(sensorPin);
  bool imaDetectado = valorSensor > threshold;
  
  digitalWrite(ledPin, imaDetectado ? HIGH : LOW);
  
  // Envia APENAS o JSON, sem mensagens adicionais
  Serial.print("{\"valor\":");
  Serial.print(valorSensor);
  Serial.print(",\"estado\":\"");
  Serial.print(imaDetectado ? "IMÃ_DETECTADO" : "SEM_IMÃ");
  Serial.println("\"}");
  
  delay(2000);
}