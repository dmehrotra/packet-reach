# packet-reach
A script that measures the distance in miles that your data travels on the internet to get to its intended destination. 
It must be run with sudo and you must have tcpdump installed.  

## HOW TO
1. git clone https://github.com/dmehrotra/packet-reach.git
2. cd into the directory
3. npm install
4. sudo node get-distance.js

The script first listens on port 80 for outbound traffic to an inputted destination to determine how many packets were sent.
It then performs a basic trace route to get the IP addresses of the network hops along the way.
Finally the script will geolocate those IP addresses and measure the distance between them.

It is a bit slow...so be patient
