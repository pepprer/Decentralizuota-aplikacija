App = {
    contracts: {},
};

var app = new Vue({
    el: '#app',

    data() {
        return {
            owner: "",
            orders: [],
            invoices: [],
            name: "",
            quantity: 1,
            ordersCount: 0,
            invoicesCount: 0,
            orderNo: null,
            price: 1,
        }
    },

    async created() {
        await this.loadWeb3();
        await this.loadAccount();
        await this.loadContract();
        await this.getOrders();
        await this.getInvoices();
    },

    methods: {
        async loadWeb3() {
            if (typeof web3 !== 'undefined') {
                App.web3Provider = web3.currentProvider;
                web3 = new Web3(web3.currentProvider)
            } else {
                window.alert("Please connect to Metamask.")
            }
            if (window.ethereum) {
                window.web3 = new Web3(ethereum);
                try {
                    await ethereum.enable();
                    web3.eth.sendTransaction({ /* ... */})
                } catch (error) {
                }
            } else if (window.web3) {
                App.web3Provider = web3.currentProvider;
                window.web3 = new Web3(web3.currentProvider);
                web3.eth.sendTransaction({ /* ... */})
            } else {
                console.log('Non-Ethereum browser detected. You should consider trying MetaMask!')
            }
        },

        async loadAccount() {
            this.owner = web3.eth.accounts[0];
        },

        async loadContract() {
            const deal = await $.getJSON('http://localhost:63342/solid/build/contracts/Deal.json');
            App.contracts.Deal = TruffleContract(deal);
            App.contracts.Deal.setProvider(App.web3Provider);
            App.Deal = await App.contracts.Deal.deployed();
            this.ordersCount = await App.Deal.orderseq();
            this.invoicesCount = await App.Deal.invoiceseq();
        },

        async getOrders() {
            this.orders = [];
            for (let i = 1; i <= this.ordersCount; i++) {
                let task = await App.Deal.queryOrder(i);
                task[3] = JSON.parse(JSON.stringify(task[3]));
                task[4] = JSON.parse(JSON.stringify(task[4]));
                task[5] = JSON.parse(JSON.stringify(task[5]));
                let task2 = await App.Deal.queryOrder2(i);
                task2 = JSON.parse(JSON.stringify(task2));
                task.push(task2);
                this.orders.push(task);
            }
        },

        async getInvoices() {
            this.invoices = [];
            for (let i = 1; i <= this.invoicesCount; i++) {
                let task = await App.Deal.getInvoice(i);
                task[2] = JSON.parse(JSON.stringify(task[2]));
                task[4] = JSON.parse(JSON.stringify(task[4]));
                task[5] = JSON.parse(JSON.stringify(task[5]));
                this.invoices.push(task);
            }
        },

        async createOrder(e) {
            e.preventDefault();
            await App.Deal.sendOrder(this.name, this.quantity);
            this.name = "";
            this.quantity = 1;
            this.ordersCount++;
            this.getOrders();
            document.getElementById("closeModal").click();
        },

        async setPrice(e) {
            e.preventDefault();
            let which = this.orders[this.orderNo - 1][3] <= 0 ? 1 : 2;
            await App.Deal.sendPrice(this.orderNo, this.price, which);
            this.getOrders();
            this.orderNo = null;
            this.price = 1;
            document.getElementById("closeModal2").click();
        },

        async pay(nr) {
            await App.Deal.sendSafepay(nr);
            this.getOrders();
        },

        async sendInvoice(nr) {
            await App.Deal.sendInvoice(nr, parseInt(new Date().getTime()/1000), '0x558669A7d5D8936bBD07c073860a331DcDE234Ac');
            this.getOrders();
        },

        async delivery(nr) {
            await App.Deal.delivery(nr, parseInt(new Date().getTime()/1000));
            this.getInvoices();
        }
    }
});
