from time import sleep
import RPi.GPIO as GPIO

GPIO.setwarnings(False)
GPIO.setmode(GPIO.BOARD)
GPIO.setup(22, GPIO.OUT, initial=GPIO.LOW)

for _ in range(8):
    '''
    gpio.output(pinnum, gpio.high)
    sleep(1)
    gpio.output(pinnum, gpio.low)
    sleep(1)
    '''
    GPIO.output(22, GPIO.HIGH)
    sleep(0.1)
    GPIO.output(22, GPIO.LOW)
    sleep(0.1)
