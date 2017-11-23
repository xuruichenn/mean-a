const quilt = require('@quilt/quilt');
const Mean = require('./mean');
const utils = require('./utils');

// Replication to use for the node application
// and Mongo.
const count = 2;
const infrastructure = quilt.createDeployment(
    {namespace: "ansonmean"}
);

const machine0 = new quilt.Machine({
    provider: 'Amazon',
    size: "m4.large",
    preemptible: true,
});

const machine1 = new quilt.Machine({
    provider: 'Amazon',
    size: "m4.large",
    preemptible: true,
    diskSize: 12,
});

const machine2 = new quilt.Machine({
    provider: 'Amazon',
    size: "m4.large",
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

var mongo_placements = [machine1,machine2];
var node_placements = [machine1,machine2];

mean.exclusive_mongo(mongo_placements);
mean.exclusive_node(node_placements);

infrastructure.deploy(mean);
