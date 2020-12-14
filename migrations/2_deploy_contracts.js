const JobList = artifacts.require("JobList");

module.exports = function (deployer) {
    deployer.deploy(JobList);
};
