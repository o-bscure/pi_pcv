from subprocess import check_output
import time
import RPi.GPIO as GPIO
from picamera import PiCamera
from time import sleep
from ctypes import *
try:
    camera = PiCamera()
    has_cam = True
    arducam_vcm= CDLL('./libarducam_vcm.so')
except:
    has_cam = False

GPIO.setwarnings(False)
GPIO.setmode(GPIO.BOARD)
GPIO.setup(8, GPIO.IN, pull_up_down = GPIO.PUD_UP)
GPIO.setup(32, GPIO.OUT) #green
GPIO.setup(22, GPIO.OUT, initial=GPIO.LOW ) #red
GPIO.setup(16, GPIO.OUT) #white
GPIO.setup(36, GPIO.OUT) #white


print("listening...")
queue = []
buffer_num = 0

def focusing(val):
    arducam_vcm.vcm_write(val)
    
def callback_func(channel):
    print("request")
    global queue 
    global buffer_num

    if has_cam:
        #take picture to path
        GPIO.output(22, GPIO.HIGH)
        GPIO.output(16, GPIO.HIGH)
        GPIO.output(36, GPIO.HIGH)
        #gpio output a white LED
        path = "/home/pi/pi_pcv/hardware_facing/pics/test{}.jpg".format(buffer_num)
        buffer_num += 1
        arducam_vcm.vcm_init()
        focusing(int(512))
        time.sleep(1)
        camera.capture(path)
        GPIO.output(16, GPIO.LOW)
        GPIO.output(22, GPIO.LOW)
        GPIO.output(36, GPIO.LOW)

        #push path onto queue
        queue.append(path)
    else:
        print("no cam")
        for _ in range(3):
            GPIO.output(22, GPIO.HIGH)
            time.sleep(0.1)
            GPIO.output(22, GPIO.LOW)
            time.sleep(0.1)


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
