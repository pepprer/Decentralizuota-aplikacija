const Deal = artifacts.require("Deal");

module.exports = function(deployer, network, accounts){
    deployer.deploy(Deal, accounts[1]);
};