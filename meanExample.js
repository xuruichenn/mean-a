const quilt = require('@quilt/quilt');
const Mean = require('./mean.js');
const utils = require('./utils.js');

// Replication to use for the node application
// and Mongo.
const count = 2;
const infrastructure = quilt.createDeployment(
{namespace: "tsaianson-mean"}
);

const machine = new quilt.Machine({
  provider: 'Amazon',
  size: "m4.large",
  preemptible: true,
  sshKeys: quilt.githubKeys("TsaiAnson")
});

utils.addSshKey(machine);

infrastructure.deploy(machine.asMaster());
infrastructure.deploy(machine.asWorker().replicate(count));

const nodeRepository = 'https://github.com/TsaiAnson/node-todo.git';
const mean = new Mean(count, nodeRepository);
infrastructure.deploy(mean);
