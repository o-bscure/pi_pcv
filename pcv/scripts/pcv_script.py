import cv2
import imutils
import numpy as np
import math
import sys
#from pathlib import Path
#from matplotlib import pyplot as plt
#from scipy.stats import median_abs_deviation
def show_images_3(tube_clone, tube_clone2, tube_image):
    cv2.imshow("All Contours", tube_clone)
    cv2.imshow("Final Bound", tube_clone2)
    cv2.imshow("Final final Bound", tube_image)
    cv2.waitKey(0)
    cv2.destroyAllWindows()
def show_images_2(tube_threshold, tube_open):
    cv2.imshow("Tube Gray Threshold ", tube_threshold)
    cv2.imshow("Tube Median Blur 2", tube_open)
def show_images_1(tube_image, tube_gray):
    #show first created images and pause for user. A key press moves the program forward
    cv2.imshow("Tube Gray Median Blur", tube_gray)
    cv2.imshow("Tube Original", tube_image)
    cv2.waitKey(0)
    cv2.destroyAllWindows()
def rescale(max_x, tube_clone2, cellmass_height):
    start_point_high = (0,20)
    end_point_high = (max_x,20)
    start_point_low = (0,plow_y)
    end_point_low = (max_x,plow_y)
    scaled_PCV = 5/(plow_y-20)*cellmass_height #consider replacing plow_y with just a set number since we're holding the top constant
    scaled_PCV = round(scaled_PCV,3)
    cv2.line(tube_clone2, start_point_high, end_point_high, (0,0,255))
    cv2.line(tube_clone2, start_point_low, end_point_low, (0,0,255))

    #cv2.imshow("picture", tube_clone2)
    name = str(sys.argv[1]).split(".")
    cv2.imwrite(name[0] + "_analyzed." + name[1], tube_clone2)

    print(scaled_PCV-0.3)
def draw_final(dy_avg, max_x, tube_clone2):
    #draw mid line
    start_point_mid = (0, dy_avg)
    end_point_mid = (max_x, dy_avg)
    cv2.line(tube_clone2, start_point_mid, end_point_mid, (0,0,255))
    cv2.line(tube_image, start_point_mid, end_point_mid, (0,0,255))
    #Draw high points
    for c in dy_max_xy:
        cv2.circle(tube_clone2, tuple(c), 4, (0,0,255))
    return start_point_mid, end_point_mid
def zscore_check(dy_max,dy_max_xy):
    gg = 0
    slope = np.zeros(len(dy_max))
    zscore = [True]*len(dy_max)
    while gg < 6:
        slope[gg] = abs((dy_max_xy[gg+1,1]-dy_max_xy[gg,1])/(dy_max_xy[gg+1,0]-dy_max_xy[gg,0]))
        if slope[gg] > 3:
            zscore[gg] = False
        gg += 1
    return all(zscore)
def slice_n_dice(x, w, cnt):
    #create vertical slices of contour
    divisions = 10
    division = math.ceil(w/divisions)
    dy_max = np.zeros(divisions)
    dy_max_xy = np.zeros((divisions,2))
    ##Use slices to approximate the slope of the cell mass
    d = 0
    while d < divisions:
        dx = cnt[np.where((cnt[:,:,0] < (x+(d+1)*division)) & (cnt[:,:,0] > (x+d*division)))]   #pick out points within each slice
        if not dx.size == 0:    #ensures that there are no slices without points
            #create array with y values along slope
            dy_max[d] = dx[dx[:,1].argmin()][1]
            dy_max_xy[d] = dx[dx[:,1].argmin()]
        d += 1
    #remove zero elements from array
    dy_max = dy_max[dy_max != 0]
    dy_max_xy = dy_max_xy[~np.all(dy_max_xy == 0, axis=1)]
    dy_max_xy = dy_max_xy.astype(int) #need to be int for future functions
    #find average y value along slope
    dy_avg = round(np.average(dy_max)) + 4  #+4 accounts for missing low points when getting points for upper curve
    #dy_med = np.median(dy_max)
    return dy_avg, dy_max, dy_max_xy
def thresh_n_prep(tube_gray, tube_image, threshold):
    #apply threshold
    (T, tube_threshold) = cv2.threshold(tube_gray, threshold, 255, cv2.THRESH_BINARY)
    #apply opening operation
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (5, 5))
    tube_open = cv2.morphologyEx(tube_threshold, cv2.MORPH_OPEN, kernel)
    #Median Blur
    tube_open = cv2.medianBlur(tube_open, 5)
    #find all contours and draw them
    contours = cv2.findContours(tube_open.copy(), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    contours = imutils.grab_contours(contours)
    tube_clone = tube_image.copy()
    cv2.drawContours(tube_clone, contours, -1, (255, 0, 0), 2)
    tube_clone2 = tube_image.copy()
    cv2.drawContours(tube_clone2, contours, -1, (255, 0, 0), 2)
    #generate bounding rectangles for contours
    for cnt in contours:    #show all contour rectangles
        x,y,w,h = cv2.boundingRect(cnt)
        cv2.rectangle(tube_clone,(x,y),(x+w,y+h),(0,255,0),2)
    #draw center line
    center_x = int(tube_clone.shape[1]/2)
    max_y = int(tube_clone.shape[0])
    max_x = int(tube_clone.shape[1])
    start_point_center = (center_x, 0)
    end_point_center = (center_x, max_y)
    cv2.line(tube_clone, start_point_center, end_point_center, (0,0,255))
    #show_images_2(tube_threshold, tube_open)
    return contours, center_x, tube_clone2, max_x, tube_clone
def prep_image(tube_image):
    max_x = len(tube_image[0,:])
    mid_x = max_x//2
    max_y = len(tube_image[:,0])
    top_y = int(max_y*0.10)
    bot_y = int(max_y-(max_y*0.15))
    #tube_image = tube_image[150:460, 540:740] #crop image to only get desired tube portion
    tube_image = tube_image[top_y:bot_y, mid_x-100:mid_x+100] #crop image to only get desired tube portion
    tube_gray = cv2.cvtColor(tube_image, cv2.COLOR_BGR2GRAY) #take grayscale of image
    #smooth image using median blur
    tube_gray = cv2.medianBlur(tube_gray, 5)
    return tube_image, tube_gray
## sys.argv takes inputs from command line and passes them through the script
## Path reads the whole path of everything in the given directory
file = str(sys.argv[1])
# read image and take first channel only. Determine size of image
tube_image = cv2.imread(file)
tube_image, tube_gray = prep_image(tube_image)
#show_images_1(tube_image, tube_gray)
#draw histogram
#plt.hist(tube_gray.ravel(), 256,[0, 256]); plt.show()
##Iterates values for thresholding to locate cell mass and determine height
#If no cell mass is found or there are weird points along contour then threshold is changed and function is rerun.
#Once a cell mass is found, the function iterates one more step. This is to remove any potential artifacts that got through. More thresholding is safer than less
#Set logic variables
cellmass_bool = False
zscore_bool = False
thresh_push = 0
threshold = 95
while (threshold <= 255) & (thresh_push < 2):
    #Increase threshold
    threshold += 5
    contours, center_x, tube_clone2, max_x, tube_clone = thresh_n_prep(tube_gray, tube_image, threshold)
    ##Locate contour for cell mass and determine height
    final_contours = 0 #setting up counter
    for cnt in contours:
        x,y,w,h = cv2.boundingRect(cnt) #reapply bounding rectangle
        low_y = y + h
        if w > 20 and w < 60 and low_y > 350:   #remove small and large contours
            center_rect = x+(w/2)
            if center_rect > (center_x-10) and center_rect < (center_x+10): #remove contours not aligned with center of image
                final_contours += 1
                cv2.rectangle(tube_clone2,(x,y),(x+w,y+h),(0,255,0),2)  #draw bounding rectangle
                #set aside coordinates and dimensions
                py = y
                plow_y = low_y
                ##Determine mid y-point to get height of cellmass
                dy_avg, dy_max, dy_max_xy = slice_n_dice(x, w, cnt)
                ##Checks slope of adjacent points for outliers
                zscore_bool = zscore_check(dy_max, dy_max_xy)
                cellmass_height = (y+h)-dy_avg
    #Check that there is only one cell mass contour
    if final_contours == 1:
        cellmass_bool = True
    else:
        cellmass_bool = False
    if (cellmass_bool is True) & (zscore_bool is True):
        thresh_push += 1
###
start_point_mid, end_point_mid = draw_final(dy_avg, max_x, tube_clone2)
rescale(max_x, tube_clone2, cellmass_height)
#show_images_3(tube_clone, tube_clone2, tube_image)    
