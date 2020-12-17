const Deal  = artifacts.require("Deal");

contract("Deal", (accounts) => {

    const ORDER_PRICE            = 3;
    const ORDER_SAFEPAY          = 4;
    const ORDER_SHIPMENT_PRICE   = 5;

    const INVOICE_ORDERNO = 1;
    const INVOICE_COURIER = 3;

    const TYPE_ORDER    = 1;
    const TYPE_SHIPMENT = 2;

    let seller         = accounts[0];
    let buyer          = accounts[1];
    let courier        = accounts[2];
    let orderno        = 1;
    let invoiceno      = 1;
    let order_price    = 100000;
    let shipment_price = 50000;
    let price          = 150000;
    let goods          = "Iphone";
    let quantity       = 1;

    it("Ar sutartis priklauso pardavėjo sąskaitai?", () => {
        Deal.new(buyer, {from: seller}).then((instance) => {
            return instance.owner();
        }).then((owner) => {
            assert.equal(seller, owner);
        });

    });

    it("Ar pirkėjas yra antroji sąskaita?", () => {
        Deal.new(buyer, {from: seller}).then((instance) => {
            return instance.buyerAddr();
        }).then((buyer) => {
            assert.equal(accounts[1], buyer);
        });
    });

    it("Ar pirmasis užsakymas yra 1?", () => {
        let deal;

        Deal.new(buyer, {from: seller}).then((instance) => {
            deal = instance;
            return instance.sendOrder(goods, quantity, {from: buyer});
        }).then((transaction) => {
            return new Promise((resolve, reject) => {
                return web3.eth.getTransaction(transaction.tx, (err, tx) => {
                    if(err){
                        reject(err);
                    }
                    resolve(tx);
                });
            });
        }).then(() => {
            return deal.queryOrder(orderno);
        }).then((order) => {
            assert.notEqual(order, null);
        });
    });

    it("Ar nustatyta siuntos kaina?", () => {
        let deal;

        return Deal.new(buyer, {from: seller}).then((instance) => {
            deal = instance;
            return deal.sendOrder(goods, quantity, {from: buyer});
        }).then(() => {
            return deal.sendPrice(orderno, shipment_price, TYPE_SHIPMENT, {from: seller});
        }).then(() => {
            return deal.queryOrder(orderno);
        }).then((order) => {
            assert.equal(order[ORDER_SHIPMENT_PRICE].toString(), shipment_price);
        });
    });

    it("Ar nustatyta užsakymo kaina?", ()  => {
        var deal;

        return Deal.new(buyer, {from: seller}).then((instance) => {
            deal = instance;
            return deal.sendOrder(goods, quantity, {from: buyer});
        }).then(() => {
            return deal.sendPrice(orderno, order_price, TYPE_ORDER, {from: seller});
        }).then(() => {
            return deal.queryOrder(orderno);
        }).then((order) => {
            assert.equal(order[ORDER_PRICE].toString(), order_price);
        });
    });

    it("Ar saugus mokėjimas buvo teisingas?", () => {
        var deal;

        return Deal.new(buyer, {from: seller}).then((instance)  => {
            deal = instance;
            return deal.sendOrder(goods, quantity, {from: buyer});
        }).then(() => {
            return deal.sendPrice(orderno, order_price, TYPE_ORDER, {from: seller});
        }).then(() => {
            return deal.sendPrice(orderno, shipment_price, TYPE_SHIPMENT, {from: seller});
        }).then(() => {
            return deal.sendSafepay(orderno, {from: buyer, value: price});
        }).then(() => {
            return deal.queryOrder(orderno);
        }).then((order) => {
            assert.equal(order[ORDER_SAFEPAY].toString(), price);
        });
    });

    it("Ar teisingas sutarties balansas po saugaus apmokėjimo?", () => {
        var deal;

        return Deal.new(buyer, {from: seller}).then((instance) => {
            deal = instance;
            return deal.sendOrder(goods, quantity, {from: buyer});
        }).then(() => {
            return deal.sendPrice(orderno, order_price, TYPE_ORDER, {from: seller});
        }).then(() => {
            return deal.sendPrice(orderno, shipment_price, TYPE_SHIPMENT, {from: seller});
        }).then(() => {
            return deal.sendSafepay(orderno, {from: buyer, value: price});
        }).then(() => {
            return new Promise((resolve, reject) => {
                return web3.eth.getBalance(deal.address, (err, hash) => {
                    if(err){
                        reject(err);
                    }
                    resolve(hash);
                });
            });
        }).then((balance) => {
            assert.equal(balance.toString(), price);
        });
    });

    it("Ar pirmasis saskaita yra 1?", () => {
        var deal;

        return Deal.new(buyer, {from: seller}).then((instance) => {
            deal = instance;
            return deal.sendOrder(goods, quantity, {from: buyer});
        }).then(() => {
            return deal.sendPrice(orderno, price, TYPE_ORDER, {from: seller});
        }).then(() => {
            return deal.sendInvoice(orderno, 0, courier, {from: seller});
        }).then(() => {
            return deal.getInvoice(invoiceno);
        }).then((invoice) => {
            assert.notEqual(invoice, null);
        });
    });


    it("Ar 1 sąskaitos faktūra yra skirta 1 užsakymui?", () => {
        var deal;

        return Deal.new(buyer, {from: seller}).then((instance) => {
            deal = instance;
            return deal.sendOrder(goods, quantity, {from: buyer});
        }).then(() => {
            return deal.sendPrice(orderno, price, TYPE_ORDER, {from: seller});
        }).then(() => {
            return deal.sendInvoice(orderno, 0, courier, {from: seller});
        }).then(() => {
            return deal.getInvoice(invoiceno);
        }).then((invoice) => {
            assert.equal(invoice[INVOICE_ORDERNO].toString(), orderno);
        });
    });

    it("Ar kurjeris yra teisus?", () => {
        var deal;

        return Deal.new(buyer, {from: seller}).then((instance) => {
            deal = instance;
            return deal.sendOrder(goods, quantity, {from: buyer});
        }).then(() => {
            return deal.sendPrice(orderno, price, TYPE_ORDER, {from: seller});
        }).then(() => {
            return deal.sendInvoice(orderno, 0, courier, {from: seller});
        }).then(() => {
            return deal.getInvoice(invoiceno);
        }).then((invoice) => {
            assert.equal(invoice[INVOICE_COURIER].toString(), courier);
        });
    });

    it("Ar po pristatymo sutarties likutis yra teisingas?", () => {
        var deal;

        return Deal.new(buyer, {from: seller}).then((instance) => {
            deal = instance;
            return deal.sendOrder(goods, quantity, {from: buyer});
        }).then(() => {
            return deal.sendPrice(orderno, order_price, TYPE_ORDER, {from: seller});
        }).then(() => {
            return deal.sendPrice(orderno, shipment_price, TYPE_SHIPMENT, {from: seller});
        }).then(() => {
            return deal.sendSafepay(orderno, {from: buyer, value: price});
        }).then(() => {
            return deal.sendInvoice(orderno, 0, courier, {from: seller});
        }).then(() => {
            return deal.delivery(invoiceno, 0, {from: courier});
        }).then(() => {
            return new Promise((resolve, reject) => {
                return web3.eth.getBalance(deal.address, (err, hash) => {
                    if(err){
                        reject(err);
                    }
                    resolve(hash);
                });
            });
        }).then((balance) => {
            assert.equal(balance.toString(), 0);
        });
    });

});