var exec = require('child_process').exec;
var _ = require("underscore")
var request = require('request');
var network_hops = []
var total = 0;
var prompt = require('prompt');


prompt.start();

prompt.get(['please enter a website'], function (err, result) {
	if (err) { return onErr(err); }
	website = result['please enter a website']
	console.log("--------------------------------")
	console.log("sniffing packets sent to "+ website)
	console.log("--------------------------------")
	
	execute("tcpdump -n src port 80",function(output){
		// get the total amount of packets sent by splitting the tcpdump output 
		packet_length = output.split("length").length
		console.log("--------------------------------")
		console.log("total packets: " + packet_length)
		console.log("--------------------------------")

		console.log("--------------------------------")
		console.log("----determining network hops----")
		console.log("--------------------------------")
		console.log("s-o-m-e-t-i-m-e-s--t-h-i-s--t-a-k-e-s--a--w-h-i-l-e-")
		// perform traceroute to get the hops from my computer to the destination

		execute("traceroute -w 1 -q 1 -m 16 "+website,function(tr){
			// loop through traceroute output and store each IP address in the IP variable
			_.each(tr.split(" "),function(x){
				if (x.match(/\((.*?)\)/)){
					build_network_hop(x.match(/\((.*?)\)/)[1])
				}
			})
			// this is a bad way to do this, but for now...
			
			setTimeout(function(){ 
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

	execute("curl "+website,function(w){
		setTimeout(function(){ console.log("stopping tcp"); execute("killall tcpdump",function(p){}); }, 3000);
	})

});

function onErr(err) {
	console.log(err);
	return 1;
}


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