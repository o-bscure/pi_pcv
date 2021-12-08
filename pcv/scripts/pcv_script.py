try:
    import cv2
    import imutils
    import numpy as np
    import math
    import sys
    #from pathlib import Path
    #from matplotlib import pyplot as plt
    #from scipy.stats import median_abs_deviation
    
    ## sys.argv takes inputs from command line and passes them through the script
    ## Path reads the whole path of everything in the given directory
    file = str(sys.argv[1])
    # read image and take first channel only. Determine size of image
    tube_image = cv2.imread(file)
    tube_gray = cv2.cvtColor(tube_image, cv2.COLOR_BGR2GRAY)
    #cv2.imshow("Tube Original", tube_image)
    #cv2.imshow("Tube Gray", tube_gray)
        
    # smooth image
    tube_gray = cv2.GaussianBlur(tube_gray, (7, 7), 0)
    #cv2.imshow("Tube Gray Smoothed 7 x 7", tube_gray)
        
    # draw histogram
    #plt.hist(tube_gray.ravel(), 256,[0, 256]); plt.show()
        
    ## Algorithm that iterates values for thresholding to locate cell mass and determine height
    ## If no cell mass is found or there are weird points along contour then threshold is changed and function is rerun.
    # Set logic variables
    cellmass_bool = False
    zscore_bool = False
    threshold = 100
    while ((cellmass_bool == False) | (zscore_bool == False)) & (threshold <= 255):
        
        # apply threshold
        (T, tube_threshold) = cv2.threshold(tube_gray, threshold, 255, cv2.THRESH_BINARY)
        #cv2.imshow("Tube Gray Threshold ", tube_threshold)
        
        # apply opening operation
        kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (5, 5))
        tube_open = cv2.morphologyEx(tube_threshold, cv2.MORPH_OPEN, kernel)
        #cv2.imshow("Tube Open 5 x 5", tube_open)
        
        # find all contours and draw them
        contours = cv2.findContours(tube_open.copy(), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
        contours = imutils.grab_contours(contours)
        tube_clone = tube_image.copy()
        cv2.drawContours(tube_clone, contours, -1, (255, 0, 0), 2)
        tube_clone2 = tube_image.copy()
        cv2.drawContours(tube_clone2, contours, -1, (255, 0, 0), 2)
        
        # draw center line
        center_x = int(tube_clone.shape[1]/2)
        max_y = int(tube_clone.shape[0])
        max_x = int(tube_clone.shape[1])
        start_point_center = (center_x, 0)
        end_point_center = (center_x, max_y)
        cv2.line(tube_clone, start_point_center, end_point_center, (0,0,255))
        
        # generate bounding rectangles for contours
        for cnt in contours:    # show all contour rectangles
            x,y,w,h = cv2.boundingRect(cnt) 
            cv2.rectangle(tube_clone,(x,y),(x+w,y+h),(0,255,0),2)
        
        ## Locate contour for cell mass and determine height
        final_contours = 0 # setting up counter
        for cnt in contours:
            x,y,w,h = cv2.boundingRect(cnt) #reapply bounding rectangle
            #print(x,y,w,h)
            if w > 20 and w < 60:   # remove small and large contours
                center_rect = x+(w/2)
                if center_rect > (center_x-10) and center_rect < (center_x+10): #remove contours not aligned with center of image
                    final_contours += 1
                    cv2.rectangle(tube_clone2,(x,y),(x+w,y+h),(0,255,0),2)  # draw bounding rectangle
                    
                    # set aside coordinates and dimensions
                    px = x
                    py = y
                    wid = w
                    hgt = h
                    
                    # create vertical slices of contour
                    divisions = 10
                    division = math.ceil(w/divisions)
                    dy_max = np.zeros(divisions)
                    dy_max_xy = np.zeros((divisions,2))
                    
                    ## Use slices to approximate the slope of the cell mass
                    d = 0
                    while d < divisions:
                        dx = cnt[np.where((cnt[:,:,0] < (x+(d+1)*division)) & (cnt[:,:,0] > (x+d*division)))]   # pick out points within each slice
                        if not dx.size == 0:    # ensures that there are no slices without points
                            # create array with y values along slope
                            dy_max[d] = dx[dx[:,1].argmin()][1]
                            dy_max_xy[d] = dx[dx[:,1].argmin()]
                        d += 1
                   
                    # remove zero elements from array
                    dy_max = dy_max[dy_max != 0]
                    dy_max_xy = dy_max_xy[~np.all(dy_max_xy == 0, axis=1)]
                    
                    # find average y value along slope
                    dy_avg = round(np.average(dy_max))
                    #dy_med = np.median(dy_max)
                    
                    # draw mid line
                    start_point_mid = (0, dy_avg)
                    end_point_mid = (max_x, dy_avg)
                    cv2.line(tube_clone2, start_point_mid, end_point_mid, (0,0,255))
                    
                    # Draw high points
                    dy_max_xy = dy_max_xy.astype(int)
                    for c in dy_max_xy:
                        cv2.circle(tube_clone2, tuple(c), 4, (0,0,255))
                    
                    ## Checks slope of adjacent points for outliers
                    gg = 0
                    slope = np.zeros(len(dy_max))
                    zscore = [True]*len(dy_max)
                    while gg < 7:
                        slope[gg] = abs((dy_max_xy[gg+1,1]-dy_max_xy[gg,1])/(dy_max_xy[gg+1,0]-dy_max_xy[gg,0]))
                        if slope[gg] > 3:
                            zscore[gg] = False
                        gg += 1
                    zscore_bool = all(zscore)
                    
                    cellmass_height = (py+hgt)-dy_avg
        # Check that there is only one cell mass contour
        if final_contours == 1:
            cellmass_bool = True
            
        # Increase threshold
        threshold += 5
        
    ## Find top of tube
    # apply threshold
    (T, tube_threshold_2) = cv2.threshold(tube_gray, 190, 255, cv2.THRESH_BINARY)
    #cv2.imshow("Tube Top Threshold ", tube_threshold_2)
        
    # apply opening operation
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (5, 5))
    tube_open_2 = cv2.morphologyEx(tube_threshold_2, cv2.MORPH_OPEN, kernel)
        
    # find all contours and draw them
    contours = cv2.findContours(tube_open_2.copy(), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    contours = imutils.grab_contours(contours)
    tube_clone_2 = tube_image.copy()
    cv2.drawContours(tube_clone_2, contours, -1, (255, 0, 0), 2)
        
        
    # generate bounding rectangles for contours and record width
    for cnt in contours:    # show all contour rectangles
        x,y,w,h = cv2.boundingRect(cnt) 
        cv2.rectangle(tube_clone_2,(x,y),(x+w,y+h),(0,255,0),2)
        
    sorted_contours = sorted(contours, key=cv2.contourArea, reverse= True)
    large_contour = sorted_contours[0]
    x,y,w,h = cv2.boundingRect(large_contour)
    cv2.rectangle(tube_clone_2,(x,y),(x+w,y+h),(0,0,255),2)
    tube_top_height = y+h-5
    #cv2.imshow("Tube top2", tube_clone_2)
        
    ## Use tube_top_height to create the upper bound and rescale height to typical PCV values
    tube_height = py+hgt-tube_top_height
    scaled_PCV = (cellmass_height/tube_height)*(5)-.6
    scaled_PCV = round(scaled_PCV,3)
    print(scaled_PCV)
        
    ###
    #cv2.imshow("All Contours", tube_clone)
    #cv2.imshow("Final Bound", tube_clone2)
        
    #cv2.waitKey(0)
    #cv2.destroyAllWindows()
    
    # Useful stuff
    
    # Use median absolute deviation to ensure there are no outlier points from an improper contour
    #                mad = median_abs_deviation(dy_max, scale=1)
    #                zscore = [True]*len(dy_max)
    #                q = 0
    #                for m in dy_max:
    #                    z = abs((m-dy_med)/mad)
    #                    if z > 5:
    #                        zscore[q] = False
    #                    q += 1
                #matrix_xy = cnt
                #maxTop = tuple(cnt[cnt[:, :, 1].argmin()][0])
                #maxRight = tuple(cnt[cnt[:, :, 0].argmax()][0])
                #maxLeft = tuple(cnt[cnt[:, :, 0].argmin()][0])
                #cv2.circle(tube_clone2, maxTop, 4, (0,0,255), -1)
                #cv2.circle(tube_clone2, maxRight, 4, (0,0,255), -1)
except:
    print(9.999)
