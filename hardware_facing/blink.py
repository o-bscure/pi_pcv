from time import sleep
'''
import RPi.GPIO as GPIO

GPIO.setwarnings(False)
GPIO.setmode(GPIO.BOARD)
GPIO.setup(PINNUMBERFROMCONFIGORSOMETHING, GPIO.OUT, initial=GPIO.LOW)
'''
i=1
while True:
    '''
    GPIO.output(PINNUM, GPIO.HIGH)
    sleep(1)
    GPIO.output(PINNUM, GPIO.LOW)
    sleep(1)
    '''
    #print("start signal ", i)
    i+=1
    #f = open('./test.txt', 'a')
    #f.write("blinking..\n")
    #f.close()