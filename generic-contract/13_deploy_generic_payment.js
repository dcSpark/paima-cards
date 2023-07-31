const genericPayment = artifacts.require("GenericPayment");
const deployConfig = require("../deploy-config.json");
const utils = require("../scripts/utils.js");

const { addAddress, getAddress, getOptions } = utils;

module.exports = async function (deployer, network, accounts) {
    const networkConfig = deployConfig[network];
    const { owner } = networkConfig["GenericPayment"];

    await deployer.deploy(genericPayment);
    const genericPaymentInstance = await genericPayment.deployed();
    const genericPaymentAddress = genericPaymentInstance.address;

    addAddress(network, "GenericPayment", genericPaymentAddress);
};
