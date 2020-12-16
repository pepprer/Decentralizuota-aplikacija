pragma solidity >=0.4.22 <0.8.0;

contract Deal {

    /// The seller's address
    address payable public owner;

    /// The buyer's address part on this contract
    address public buyerAddr;

    /// The Buyer struct
    struct Buyer {
        address addr;
        string name;

        bool init;
    }

    /// The Shipment struct
    struct Shipment {
        address payable courier;
        uint price;
        uint safepay;
        address payer;
        uint date;
        uint real_date;

        bool init;
    }

    /// The Order struct
    struct Order {
        string goods;
        uint quantity;
        uint number;
        uint price;
        uint safepay;
        Shipment shipment;

        bool init;
    }

    /// The Invoice struct
    struct Invoice {
        uint orderno;
        uint number;

        bool init;
    }

    /// The mapping to store orders
    mapping (uint => Order)  orders;

    /// The mapping to store invoices
    mapping (uint => Invoice) invoices;

    /// The sequence number of orders
    uint public orderseq;

    /// The sequence number of invoices
    uint public invoiceseq;

    /// Event triggered for every registered buyer
    event BuyerRegistered(address buyer, string name);

    event OrderSent(address buyer, string goods, uint quantity, uint orderno);

    event PriceSent(address buyer, uint orderno, uint price, int8 ttype);

    event SafepaySent(address buyer, uint orderno, uint value, uint now);

    event InvoiceSent(address buyer, uint invoiceno, uint orderno, uint delivery_date, address courier);

    event OrderDelivered(address buyer, uint invoiceno, uint orderno, uint real_delivey_date, address courier);

    constructor(address _buyerAddr) public{
        owner = msg.sender;
        buyerAddr = _buyerAddr;
    }

    function sendOrder(string memory goods, uint quantity) public {
        require(msg.sender == buyerAddr);
        orderseq++;
        orders[orderseq] = Order(goods, quantity, orderseq, 0, 0, Shipment(address(0), 0, 0, address(0), 0, 0, false), true);
        emit OrderSent(msg.sender, goods, quantity, orderseq);
    }

    function queryOrder(uint number) view public returns (address buyer, string memory goods, uint quantity, uint price, uint safepay, uint delivery_price, uint delivey_safepay) {
        require(orders[number].init);
        return(buyerAddr, orders[number].goods, orders[number].quantity, orders[number].price, orders[number].safepay, orders[number].shipment.price, orders[number].shipment.safepay);
    }

    function sendPrice(uint orderno, uint price, int8 ttype) payable public {
        require(msg.sender == owner);
        require(orders[orderno].init);
        require(ttype == 1 || ttype == 2);
        if(ttype == 1){/// Price for Order
            orders[orderno].price = price;
        } else {/// Price for Shipment
            orders[orderno].shipment.price = price;
            orders[orderno].shipment.init  = true;
        }
        emit PriceSent(buyerAddr, orderno, price, ttype);
    }

    function sendSafepay(uint orderno) payable public {
        require(orders[orderno].init);
        require(buyerAddr == msg.sender);
        require((orders[orderno].price + orders[orderno].shipment.price) == msg.value);
        orders[orderno].safepay = msg.value;
        emit SafepaySent(msg.sender, orderno, msg.value, now);
    }

    /// The function to send the invoice data
    ///  requires fee
    function sendInvoice(uint orderno, uint delivery_date, address payable courier) payable public {

        /// Validate the order number
        require(orders[orderno].init);

        /// Just the seller can send the invoice
        require(owner == msg.sender);

        invoiceseq++;

        /// Create then Invoice instance and store it
        invoices[invoiceseq] = Invoice(orderno, invoiceseq, true);

        /// Update the shipment data
        orders[orderno].shipment.date    = delivery_date;
        orders[orderno].shipment.courier = courier;

        /// Trigger the event
        emit InvoiceSent(buyerAddr, invoiceseq, orderno, delivery_date, courier);
    }

    /// The function to get the sent invoice
    ///  requires no fee
    function getInvoice(uint invoiceno) view public returns (address buyer, uint orderno, uint delivery_date, address courier){

        /// Validate the invoice number
        require(invoices[invoiceno].init);

        Invoice memory  _invoice = invoices[invoiceno];
        Order memory  _order     = orders[_invoice.orderno];

        return (buyerAddr, _order.number, _order.shipment.date, _order.shipment.courier);
    }

    /// The function to mark an order as delivered
    function delivery(uint invoiceno, uint timestamp) payable public {

        /// Validate the invoice number
        require(invoices[invoiceno].init);

        Invoice memory _invoice = invoices[invoiceno];
        Order memory _order = orders[_invoice.orderno];

        /// Just the courier can call this function
        require(_order.shipment.courier == msg.sender);

        emit OrderDelivered(buyerAddr, invoiceno, _order.number, timestamp, _order.shipment.courier);

        /// Payout the Order to the seller
        owner.transfer(_order.safepay);

        /// Payout the Shipment to the courier
        _order.shipment.courier.transfer(_order.shipment.safepay);
    }

    function health() pure public returns (string memory) {
        return "running";
    }
}