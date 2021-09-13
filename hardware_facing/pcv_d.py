from subprocess import check_output
import time
import RPi.GPIO as GPIO

GPIO.setwarnings(False)
GPIO.setmode(GPIO.BOARD)
GPIO.setup(8, GPIO.IN, pull_up_down = GPIO.PUD_UP)

print("listening...")
queue = []

def callback_func(channel):
    print("request...")
    global queue 

    #take picture to path
    path = '/home/pi/pi_pcv/hardware_facing/image.png'
    #push path onto queue
    queue.append(path)

    return

GPIO.add_event_detect(8, GPIO.FALLING, callback=callback_func, bouncetime=200)

while True:
    if len(queue) == 0:
        time.sleep(0.2)
    else:
        p = queue.pop(0)
        print("handling...\n")
        ans = check_output(['node', '/home/pi/pi_pcv/prepare_post_request.js', p, 'png'])
        print("\n".join((ans.decode('utf-8')).split("\n")))
