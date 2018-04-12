const quilt = require('@quilt/quilt');
const Mean = require('./mean');
const utils = require('./utils');

// Replication to use for the node application
// and Mongo.
const count = 4;
const infrastructure = quilt.createDeployment(
    {namespace: "ansonmean"}
);

const machine0 = new quilt.Machine({
    provider: 'Amazon',
    size: "m4.large",
    // region: "us-west-2",
    preemptible: true,
});

const machine1 = new quilt.Machine({
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

const machine3 = new quilt.Machine({
    provider: 'Amazon',
    size: "m4.large",
    // region: "us-west-2",
    preemptible: true,
    diskSize: 14,
});

const machine4 = new quilt.Machine({
    provider: 'Amazon',
    size: "m4.large",
    // region: "us-west-2",
    preemptible: true,
    diskSize: 15,
});

utils.addSshKey(machine0);
utils.addSshKey(machine1);
utils.addSshKey(machine2);
utils.addSshKey(machine3);
utils.addSshKey(machine4);

infrastructure.deploy(machine0.asMaster());

infrastructure.deploy(machine1.asWorker());
infrastructure.deploy(machine2.asWorker());
infrastructure.deploy(machine3.asWorker());
infrastructure.deploy(machine4.asWorker());

const nodeRepository = 'https://github.com/TsaiAnson/node-todo.git';
const mean = new Mean(count, nodeRepository);

var mongo_placements = [machine1,machine2,machine3,machine4];
var node_placements = [machine1,machine2,machine3,machine4];

mean.exclusive_mongo(mongo_placements);
mean.exclusive_node(node_placements);

infrastructure.deploy(mean);
