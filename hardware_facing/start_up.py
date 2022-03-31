import RPi.GPIO as GPIO
import time

GPIO.setwarnings(False)
GPIO.setmode(GPIO.BOARD)
GPIO.setup(32, GPIO.OUT) #green
GPIO.setup(22, GPIO.OUT, initial=GPIO.LOW) #red

for _ in range(3):
    GPIO.output(32, GPIO.HIGH)
    time.sleep(0.1)
    GPIO.output(32, GPIO.LOW)
    time.sleep(0.1)
    GPIO.output(32, GPIO.HIGH)
    time.sleep(0.1)
    GPIO.output(32, GPIO.LOW)
    time.sleep(0.1)
    GPIO.output(22, GPIO.HIGH)
    time.sleep(0.1)
    GPIO.output(22, GPIO.LOW)
    time.sleep(0.1)
GPIO.output(32, GPIO.HIGH)
time.sleep(0.1)
GPIO.output(32, GPIO.LOW)
time.sleep(0.1)
GPIO.output(32, GPIO.HIGH)
time.sleep(0.1)
GPIO.output(32, GPIO.LOW)

