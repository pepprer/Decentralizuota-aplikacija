pragma solidity >=0.4.22 <0.8.0;

contract JobList {
    uint public count = 0;

    struct Job {
        uint id;
        string description;
        bool done;
    }

    mapping (uint => Job) public jobs;

    event JobCreated(
        uint id,
        string description,
        bool done
    );

    event JobDone(
        uint id,
        bool done
    );

    constructor() public {
        createJob("Pirmoji užduotis yra auto");
    }

    function createJob(string memory _description) public {
        count ++;
        jobs[count] = Job(count, _description, false);
        emit JobCreated(count, _description, false);
    }

    function toggleDone(uint _id) public {
        Job memory _job = jobs[_id];
        _job.done = !_job.done;
        jobs[_id] = _job;
        emit JobDone(_id, _job.done);
    }
}