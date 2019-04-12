const quilt = require('@quilt/quilt');
const Mean = require('./mean');
const utils = require('./utils');
const WorkloadGen = require('./workload.js');
//const mongo = require('./../mongo/');
//const node = require('./../nodejs/');
//const haproxy = require('./../haproxy/');


// Replication to use for the node application
// and Mongo.
const count = 2;
const infrastructure = quilt.createDeployment(
    {namespace: "rachelresourcedeployment"}
);

const machine0 = new quilt.Machine({
    provider: 'Amazon',
    size: "m4.large",
    // region: "us-west-2",
    preemptible: true,
});

const machine1 = new quilt.Machine({ //workloadmachine
    provider: 'Amazon',
    size: "m4.large",
    // region: "us-west-2",
    preemptible: true,
    diskSize: 12,
});

const machine2 = new quilt.Machine({
    provider: 'Amazon',
    size: "m4.large",
    // region: "us-west-2",
    preemptible: true,
    diskSize: 13,
});


utils.addSshKey(machine0);
utils.addSshKey(machine1);
utils.addSshKey(machine2);

infrastructure.deploy(machine0.asMaster());

infrastructure.deploy(machine1.asWorker());
infrastructure.deploy(machine2.asWorker());

const nodeRepository = 'https://github.com/TsaiAnson/node-todo.git';
const mean = new Mean(count, nodeRepository);
const workload_count = 1;
const workload = new WorkloadGen(workload_count);

workload.cluster[0].placeOn({diskSize: 12});
workload.cluster[1].placeOn({diskSize: 12});

mean.proxy.allowFrom(workload.cluster, 80);

var mongo_placements = [machine2];
var node_placements = [machine2];
var haproxy_placements = [machine2];

mean.notexclusive_mongo(mongo_placements);
mean.notexclusive_node(node_placements);
mean.notexclusive_haproxy(haproxy_placements);

infrastructure.deploy(mean);
infrastructure.deploy(workload);

