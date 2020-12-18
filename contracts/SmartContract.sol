pragma solidity >=0.4.22 <0.8.0;

contract SmartContract {

    address payable public owner;
    address public buyerAddr;

    struct Shipment {
        address payable courier;
        uint price;
        uint safepay;
        address payer;
        uint date;
        uint real_date;

        bool init;
    }

    struct Order {
        string product;
        uint quantity;
        uint number;
        uint price;
        uint safepay;
        Shipment shipment;

        bool init;
    }

    struct Invoice {
        uint orderno;
        uint number;

        bool init;
    }

    mapping(uint => Order)  orders;
    mapping(uint => Invoice) invoices;
    uint public orderseq;
    uint public invoiceseq;

    event OrderSent(address buyer, string product, uint quantity, uint orderno);
    event PriceSent(address buyer, uint orderno, uint price, int8 ttype);
    event SafepaySent(address buyer, uint orderno, uint value, uint now);
    event InvoiceSent(address buyer, uint invoiceno, uint orderno, uint delivery_date, address courier);
    event OrderDelivered(address buyer, uint invoiceno, uint orderno, uint real_delivey_date, address courier);

    constructor(address _buyerAddr) public{
        owner = msg.sender;
        buyerAddr = _buyerAddr;
    }

    function sendOrder(string memory product, uint quantity) public {
        require(msg.sender == buyerAddr);
        orderseq++;
        orders[orderseq] = Order(product, quantity, orderseq, 0, 0, Shipment(address(0), 0, 0, address(0), 0, 0, false), true);
        emit OrderSent(msg.sender, product, quantity, orderseq);
    }

    function queryOrder(uint number) view public returns (address buyer, string memory product, uint quantity, uint price, uint safepay, uint delivery_price, uint delivey_safepay) {
        require(orders[number].init);
        return (buyerAddr, orders[number].product, orders[number].quantity, orders[number].price, orders[number].safepay, orders[number].shipment.price, orders[number].shipment.safepay);
    }

    function queryOrder2(uint number) view public returns (uint date) {
        require(orders[number].init);
        return (orders[number].shipment.date);
    }

    function sendPrice(uint orderno, uint price, int8 ttype) payable public {
        require(msg.sender == owner);
        require(orders[orderno].init);
        require(ttype == 1 || ttype == 2);
        if (ttype == 1) {
            orders[orderno].price = price;
        } else {
            orders[orderno].shipment.price = price;
            orders[orderno].shipment.init = true;
        }
        emit PriceSent(buyerAddr, orderno, price, ttype);
    }

    function sendSafepay(uint orderno) payable public {
        require(orders[orderno].init);
        require(buyerAddr == msg.sender);
//        require((orders[orderno].price + orders[orderno].shipment.price) <= msg.value); //for test
        orders[orderno].safepay = orders[orderno].price + orders[orderno].shipment.price;
//        orders[orderno].safepay = msg.value; // for test

    emit SafepaySent(msg.sender, orderno, orders[orderno].safepay, now);
    }

    function sendInvoice(uint orderno, uint delivery_date, address payable courier) payable public {
        require(orders[orderno].init);
        require(owner == msg.sender);
        invoiceseq++;
        invoices[invoiceseq] = Invoice(orderno, invoiceseq, true);
        orders[orderno].shipment.date = delivery_date;
        orders[orderno].shipment.courier = courier;
        emit InvoiceSent(buyerAddr, invoiceseq, orderno, delivery_date, courier);
    }

    function getInvoice(uint invoiceno) view public returns (address buyer, uint orderno, uint delivery_date, address courier, uint safepay, uint date){
        require(invoices[invoiceno].init);
        Invoice memory _invoice = invoices[invoiceno];
        Order memory _order = orders[_invoice.orderno];
        return (buyerAddr, _order.number, _order.shipment.date, _order.shipment.courier, _order.shipment.safepay, _order.shipment.real_date);
    }

    function delivery(uint invoiceno, uint timestamp) payable public {
        require(invoices[invoiceno].init);
        Invoice memory _invoice = invoices[invoiceno];
        Order memory _order = orders[_invoice.orderno];
        require(_order.shipment.courier == msg.sender);
        emit OrderDelivered(buyerAddr, invoiceno, _order.number, timestamp, _order.shipment.courier);
        orders[_invoice.orderno].shipment.real_date = now;
//        owner.transfer(_order.safepay);  //for test
//        _order.shipment.courier.transfer(_order.shipment.safepay);  //for test
    }
}