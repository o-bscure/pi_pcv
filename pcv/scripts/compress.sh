#!/bin/bash

if [ "$EUID" -ne 0 ]
	then echo "Please run as root\nRequires compressing and deleteing files"
	exit
fi

if  cd /home/pi/pi_pcv/pcv/public
then

for file in *; do
	if [ -f "$file" ] && [ -f "${file//./_analyzed.}" ]
	then
	rm "$file"
	echo "$file" deleted
	fi
done
fi

exit
