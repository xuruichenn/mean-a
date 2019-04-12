const haproxy = require('@quilt/haproxy');
const Mongo = require('@quilt/mongo');
const Node = require('@quilt/nodejs');

const { publicInternet, Container } = require('@quilt/quilt');

function Mean(count, nodeRepo) {
    const port = 80;
    this.instance_number = count
    
    this.mongo = new Mongo(count);
    this.app = new Node({
	nWorker: count,
	repo: nodeRepo,
	env:{
	    PORT: port.toString(),
	    MONGO_URI: this.mongo.uri('mean-example'),
		},
	});
	
    
    this.proxy = haproxy.simpleLoadBalancer(this.app.cluster);
    
    this.mongo.allowFrom(this.app.cluster, this.mongo.port);
    this.proxy.allowFrom(publicInternet, haproxy.exposedPort);

    this.exclusive_mongo = function exclusive_mongo(mongo_disk) {
		for ( i = 0; i < this.instance_number; i++) {
		    //this.mongo.cluster[i].placeOn({diskSize: mongo_disk[i]});
		    this.mongo.cluster[i].placeOn(mongo_disk[i]);
		}
    }

    this.exclusive_node = function exclusive_node(node_disk) {
		for (i = 0; i < this.instance_number; i++) {
		    //this.app.cluster[i].placeOn({diskSize: node_disk[i]});
		    this.app.cluster[i].placeOn(node_disk[i]);
		}
	}

	this.notexclusive_mongo = function notexclusive_mongo(mongo_disk) {
		for ( i = 0; i < this.instance_number; i++) {
		    //this.mongo.cluster[i].placeOn({diskSize: mongo_disk[i]});
			this.mongo.cluster[i].placeOn(mongo_disk[0]);
		
		}
    }

    this.notexclusive_node = function notexclusive_node(node_disk) {
		for (i = 0; i < this.instance_number; i++) {
		    //this.app.cluster[i].placeOn({diskSize: node_disk[i]});
			this.app.cluster[i].placeOn(node_disk[0]);
			console.log(this.app.cluster[i]);
			
		}
	}
	
	this.notexclusive_haproxy = function notexclusive_haproxy(haproxy_disk) {
		//for (i = 0; i < 1; i++) {
			//console.log(this.proxy.cluster);
			this.proxy.placeOn(haproxy_disk[0]);
		//}
	}
					  
    
    this.deploy = function deploy(deployment) {
	deployment.deploy([this.app, this.mongo, this.proxy]);
    };
}

module.exports = Mean;
