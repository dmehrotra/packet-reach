var exec = require('child_process').exec;
var _ = require("underscore")
var request = require('request');
var network_hops = []
var total = 0;
// Sniff on port 80
execute("tcpdump -n src port 80",function(output){
	// get the total amount of packets sent by splitting the tcpdump output 
	packet_length = output.split("length").length
	console.log("packets: " + packet_length)
	// perform traceroute to get the hops from my computer to the destination
	execute("traceroute www.theatlantic.com",function(tr){
		// loop through traceroute output and store each IP address in the IP variable
		_.each(tr.split(" "),function(x){
			if (x.match(/\((.*?)\)/)){
				build_network_hop(x.match(/\((.*?)\)/)[1])
			}
		})
		// this is a bad way to do this, but for now...
		setTimeout(function(){ 
			console.log(network_hops)
			_.each(network_hops,function(nh, i){	
				if (i>0){
					prev = network_hops[i-1] 
					d = distance(parseFloat(nh.lat), parseFloat(nh.lon), parseFloat(prev.lat), parseFloat(prev.lon), "M")
					total = d + total;
				}
				console.log("packet has now travelled: " + total +" miles")
			})
		}, 7000);

	})
})

execute("curl www.theatlantic.com",function(w){
	setTimeout(function(){ execute("killall tcpdump",function(p){}); }, 3000);
})

function execute(command, callback){
    exec(command, function(error, stdout, stderr){ callback(stdout); });
};

function build_network_hop(ip){
	var hop = {}
	request("http://ip-api.com/json/"+ip, function (error, response, body) {
	    if (!error && response.statusCode == 200) {
	        var json;
	        try{
	        	var json = JSON.parse(body)
	        }catch(err){
	        	return false;
	        } 
		    if(json && json.lat != undefined){
				
				hop.isp = json.isp;
				hop.lat = json.lat;
				hop.lon = json.lon;
				hop.zip = json.zip;
				hop.city = json.city;
				hop.country = json.country;
				
				console.log("------ hop ------");
				console.log("isp: " + hop.isp);
				console.log("lat/lng: " + hop.lat + "/" + hop.lon);
				console.log("city: " + hop.city);
				console.log("country: " + hop.country);
				console.log("zip: " + hop.zip);
				
				network_hops.push(hop)
				
				
			}else{
	    		return false;
	    	}
		}
	});
	
}

function distance(lat1, lon1, lat2, lon2, unit) {
	console.log(lat1)
	console.log(lat2)
	console.log(lon1)
	console.log(lon2)
	var radlat1 = Math.PI * lat1/180
	var radlat2 = Math.PI * lat2/180
	var theta = lon1-lon2
	var radtheta = Math.PI * theta/180
	var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
	dist = Math.acos(dist)
	dist = dist * 180/Math.PI
	dist = dist * 60 * 1.1515
	if (unit=="K") { dist = dist * 1.609344 }
	if (unit=="N") { dist = dist * 0.8684 }
	return dist
}


// ^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$