// Código Gerado pelo Robôblocks

#include <Servo.h>
Servo servo_9;

void setup() {
  servo_9.attach(9);
}

void loop() {
while (true) {
  servo_9.write(0);
  delay((1000) * 1000);
  servo_9.write(180);
  delay((1000) * 1000);
}
}