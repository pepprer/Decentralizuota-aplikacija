const SmartContract = artifacts.require("SmartContract");

module.exports = function(deployer, network, accounts){
    deployer.deploy(SmartContract, accounts[1]);
};