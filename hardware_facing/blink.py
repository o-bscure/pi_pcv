from time import sleep
import RPi.GPIO as GPIO

GPIO.setwarnings(False)
GPIO.setmode(GPIO.BOARD)
GPIO.setup(32, GPIO.OUT, initial=GPIO.LOW)

i=1
while True:
    '''
    GPIO.output(PINNUM, GPIO.HIGH)
    sleep(1)
    GPIO.output(PINNUM, GPIO.LOW)
    sleep(1)
    '''
    GPIO.output(32, GPIO.HIGH)
    sleep(0.3)
    GPIO.output(32, GPIO.LOW)
    sleep(0.3)
    #print("start signal ", i)
    i+=1
    #f = open('./test.txt', 'a')
    #f.write("blinking..\n")
    #f.close()
