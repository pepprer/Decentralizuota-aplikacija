const JobList = artifacts.require('./JobList.sol')

contract('TodoList', (accounts) => {
    before(async () => {
        this.jobList = await JobList.deployed()
    });

    it('deploys successfully', async () => {
        const address = await this.jobList.address;
        assert.notEqual(address, 0x0);
        assert.notEqual(address, '');
        assert.notEqual(address, null);
        assert.notEqual(address, undefined)
    })

    it('lists tasks', async () => {
        const count = await this.jobList.count();
        const job = await this.jobList.jobs(count);
        assert.equal(job.id.toNumber(), count.toNumber());
        assert.equal(job.description, 'Pirmoji užduotis yra auto')
        assert.equal(job.done, false)
        assert.equal(count.toNumber(), 1)
    })

    it('creates tasks', async () => {
        const result = await this.jobList.createJob('A new task');
        const count = await this.jobList.count();
        assert.equal(count, 2);
        const event = result.logs[0].args;
        assert.equal(event.id.toNumber(), 2);
        assert.equal(event.description, 'A new task');
        assert.equal(event.done, false)
    })

    it('toggles task completion', async () => {
        const result = await this.jobList.toggleDone(1);
        const job = await this.jobList.jobs(1);
        assert.equal(job.done, true);
        const event = result.logs[0].args;
        assert.equal(event.id.toNumber(), 1);
        assert.equal(event.done, true)
    })
})