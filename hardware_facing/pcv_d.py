from subprocess import check_output
import time
import RPi.GPIO as GPIO
from picamera import PiCamera
from time import sleep

camera = PiCamera()

GPIO.setwarnings(False)
GPIO.setmode(GPIO.BOARD)
GPIO.setup(8, GPIO.IN, pull_up_down = GPIO.PUD_UP)
GPIO.setup(32, GPIO.OUT) #green
GPIO.setup(22, GPIO.OUT, initial=GPIO.LOW ) #red

print("listening...")
queue = []
buffer_num = 0

def callback_func(channel):
    print("request")
    global queue 
    global buffer_num

    #take picture to path
    GPIO.output(22, GPIO.HIGH)
    path = "/home/pi/pi_pcv/hardware_facing/pics/test{}.jpg".format(buffer_num)
    buffer_num += 1
    camera.capture(path)
    GPIO.output(22, GPIO.LOW)

    #push path onto queue
    queue.append(path)

    return

GPIO.add_event_detect(8, GPIO.FALLING, callback=callback_func, bouncetime=700)

while True:
    if len(queue) == 0:
        time.sleep(0.2)
    else:
        p = queue.pop(0)
        print("handling...\n")
        ans = check_output(['node', '/home/pi/pi_pcv/prepare_post_request.js', p, 'png'])
        print("\n".join((ans.decode('utf-8')).split("\n")))
