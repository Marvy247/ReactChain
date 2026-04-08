// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

/// @title Stokvel - On-chain rotating savings group
contract Stokvel {
    struct Group {
        string name;
        address admin;
        uint256 contributionAmount; // in wei (cUSD)
        uint256 cycleDuration;      // seconds per cycle
        uint256 cycleStart;
        uint256 currentCycle;
        address[] members;
        mapping(address => bool) isMember;
        mapping(uint256 => mapping(address => bool)) contributed; // cycle => member => paid
        mapping(uint256 => uint256) cyclePool;                    // cycle => total collected
        mapping(uint256 => address) cycleRecipient;               // cycle => who gets payout
        mapping(uint256 => bool) payoutDone;
    }

    uint256 public groupCount;
    mapping(uint256 => Group) private groups;

    // Track which groups a user belongs to
    mapping(address => uint256[]) public userGroups;

    event GroupCreated(uint256 indexed groupId, string name, address admin, uint256 contributionAmount);
    event MemberJoined(uint256 indexed groupId, address member);
    event Contributed(uint256 indexed groupId, address member, uint256 cycle, uint256 amount);
    event PayoutSent(uint256 indexed groupId, uint256 cycle, address recipient, uint256 amount);
    event CycleAdvanced(uint256 indexed groupId, uint256 newCycle);

    modifier onlyMember(uint256 groupId) {
        require(groups[groupId].isMember[msg.sender], "Not a member");
        _;
    }

    modifier onlyAdmin(uint256 groupId) {
        require(groups[groupId].admin == msg.sender, "Not admin");
        _;
    }

    /// @notice Create a new savings group
    function createGroup(
        string calldata name,
        uint256 contributionAmount,
        uint256 cycleDuration
    ) external returns (uint256 groupId) {
        require(contributionAmount > 0, "Amount must be > 0");
        require(cycleDuration >= 1 days, "Cycle too short");

        groupId = groupCount++;
        Group storage g = groups[groupId];
        g.name = name;
        g.admin = msg.sender;
        g.contributionAmount = contributionAmount;
        g.cycleDuration = cycleDuration;
        g.cycleStart = block.timestamp;
        g.currentCycle = 0;

        // Admin auto-joins
        g.members.push(msg.sender);
        g.isMember[msg.sender] = true;
        userGroups[msg.sender].push(groupId);

        emit GroupCreated(groupId, name, msg.sender, contributionAmount);
        emit MemberJoined(groupId, msg.sender);
    }

    /// @notice Join an existing group
    function joinGroup(uint256 groupId) external {
        Group storage g = groups[groupId];
        require(g.admin != address(0), "Group does not exist");
        require(!g.isMember[msg.sender], "Already a member");

        g.members.push(msg.sender);
        g.isMember[msg.sender] = true;
        userGroups[msg.sender].push(groupId);

        emit MemberJoined(groupId, msg.sender);
    }

    /// @notice Contribute to the current cycle
    function contribute(uint256 groupId) external payable onlyMember(groupId) {
        Group storage g = groups[groupId];
        uint256 cycle = g.currentCycle;

        require(msg.value == g.contributionAmount, "Wrong amount");
        require(!g.contributed[cycle][msg.sender], "Already contributed this cycle");

        g.contributed[cycle][msg.sender] = true;
        g.cyclePool[cycle] += msg.value;

        emit Contributed(groupId, msg.sender, cycle, msg.value);
    }

    /// @notice Admin triggers payout for current cycle and advances to next
    function triggerPayout(uint256 groupId) external onlyAdmin(groupId) {
        Group storage g = groups[groupId];
        uint256 cycle = g.currentCycle;

        require(!g.payoutDone[cycle], "Payout already done");
        require(block.timestamp >= g.cycleStart + g.cycleDuration, "Cycle not over");

        uint256 pool = g.cyclePool[cycle];
        require(pool > 0, "Nothing to pay out");

        // Rotate recipient: cycle % members.length
        address recipient = g.members[cycle % g.members.length];
        g.cycleRecipient[cycle] = recipient;
        g.payoutDone[cycle] = true;

        // Advance cycle
        g.currentCycle++;
        g.cycleStart = block.timestamp;

        (bool sent, ) = recipient.call{value: pool}("");
        require(sent, "Transfer failed");

        emit PayoutSent(groupId, cycle, recipient, pool);
        emit CycleAdvanced(groupId, g.currentCycle);
    }

    // ── View helpers ──────────────────────────────────────────────

    function getGroup(uint256 groupId) external view returns (
        string memory name,
        address admin,
        uint256 contributionAmount,
        uint256 cycleDuration,
        uint256 cycleStart,
        uint256 currentCycle,
        uint256 memberCount
    ) {
        Group storage g = groups[groupId];
        return (
            g.name,
            g.admin,
            g.contributionAmount,
            g.cycleDuration,
            g.cycleStart,
            g.currentCycle,
            g.members.length
        );
    }

    function getMembers(uint256 groupId) external view returns (address[] memory) {
        return groups[groupId].members;
    }

    function hasContributed(uint256 groupId, uint256 cycle, address member) external view returns (bool) {
        return groups[groupId].contributed[cycle][member];
    }

    function getCyclePool(uint256 groupId, uint256 cycle) external view returns (uint256) {
        return groups[groupId].cyclePool[cycle];
    }

    function isMember(uint256 groupId, address user) external view returns (bool) {
        return groups[groupId].isMember[user];
    }
}
