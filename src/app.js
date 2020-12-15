App = {
    loading: false,
    contracts: {},

    load: async() => {
        await App.loadWeb3()
        await App.loadAccount()
        await App.loadContract()
        await App.render()
    },

    loadWeb3: async() => {
        if (typeof web3 !== 'undefined') {
            App.web3Provider = web3.currentProvider
            web3 = new Web3(web3.currentProvider)
        } else {
            window.alert("Please connect to Metamask.")
        }
        if (window.ethereum) {
            window.web3 = new Web3(ethereum)
            try {
                await ethereum.enable()
                web3.eth.sendTransaction({ /* ... */ })
            } catch (error) {
            }
        }
        else if (window.web3) {
            App.web3Provider = web3.currentProvider
            window.web3 = new Web3(web3.currentProvider)
            web3.eth.sendTransaction({ /* ... */ })
        }
        else {
            console.log('Non-Ethereum browser detected. You should consider trying MetaMask!')
        }
    },

    loadAccount: async() => {
        App.account = web3.eth.accounts[0]
    },

    loadContract: async() => {
        const jobList = await $.getJSON('JobList.json')
        App.contracts.JobList = TruffleContract(jobList)
        App.contracts.JobList.setProvider(App.web3Provider)

        App.JobList = await App.contracts.JobList.deployed()
    },

    render: async() => {
        if (App.loading) {
            return
        }
        App.setLoading(true)

        $('#account').html(App.account)

        await App.renderJobs()

        App.setLoading(false)

    },

    createJob: async() => {
        App.setLoading(true)
        const content = $('#newTask').val()
        await App.JobList.createJob(content);
        window.location.reload()
    },

    toggleDone: async(e) => {
        App.setLoading(true)
        const taskId = e.target.name
        await App.JobList.toggleDone(taskId)
        window.location.reload()
    },

    renderJobs: async() => {
        const taskCount = await App.JobList.count()
        const $taskTemplate = $('.taskTemplate')
        for (var i = 1; i <= taskCount; i++) {
            const task = await App.JobList.jobs(i)
            const taskId = task[0].toNumber()
            const taskContent = task[1]
            const taskCompleted = task[2]

            const $newTaskTemplate = $taskTemplate.clone()
            $newTaskTemplate.find('.content').html(taskContent)
            $newTaskTemplate.find('input')
                .prop('name', taskId)
                .prop('checked', taskCompleted)
                .on('click', App.toggleDone)

            if (taskCompleted) {
                $('#completedTaskList').append($newTaskTemplate)
            } else {
                $('#taskList').append($newTaskTemplate)
            }
            $newTaskTemplate.show()
        }
    },

    setLoading: (boolean) => {
        App.loading = boolean
        const loader = $('#loader')
        const content = $('#content')
        if (boolean) {
            loader.show()
            content.hide()
        } else {
            loader.hide()
            content.show()
        }
    }
}

$(() => {
    $(window).load(() => {
        App.load()
    })
})