import sys
import random
import time

random.seed(sys.argv[1] + sys.argv[2])
time.sleep(2)
print(random.random()*1)
#print(sys.argv)
