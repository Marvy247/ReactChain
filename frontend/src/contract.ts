// Deployed Stokvel contract address on Celo mainnet
// Update this after deployment
export const STOKVEL_ADDRESS = '0xd8b4875b61130D651409d26C47D49f57BEbC1780' as `0x${string}`;

export const STOKVEL_ABI = [
  {
    "inputs": [{"name":"name","type":"string"},{"name":"contributionAmount","type":"uint256"},{"name":"cycleDuration","type":"uint256"}],
    "name": "createGroup",
    "outputs": [{"name":"groupId","type":"uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name":"groupId","type":"uint256"}],
    "name": "joinGroup",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name":"groupId","type":"uint256"}],
    "name": "contribute",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [{"name":"groupId","type":"uint256"}],
    "name": "triggerPayout",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name":"groupId","type":"uint256"}],
    "name": "getGroup",
    "outputs": [
      {"name":"name","type":"string"},
      {"name":"admin","type":"address"},
      {"name":"contributionAmount","type":"uint256"},
      {"name":"cycleDuration","type":"uint256"},
      {"name":"cycleStart","type":"uint256"},
      {"name":"currentCycle","type":"uint256"},
      {"name":"memberCount","type":"uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name":"groupId","type":"uint256"}],
    "name": "getMembers",
    "outputs": [{"name":"","type":"address[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name":"groupId","type":"uint256"},{"name":"cycle","type":"uint256"},{"name":"member","type":"address"}],
    "name": "hasContributed",
    "outputs": [{"name":"","type":"bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name":"groupId","type":"uint256"},{"name":"cycle","type":"uint256"}],
    "name": "getCyclePool",
    "outputs": [{"name":"","type":"uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name":"groupId","type":"uint256"},{"name":"user","type":"address"}],
    "name": "isMember",
    "outputs": [{"name":"","type":"bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "groupCount",
    "outputs": [{"name":"","type":"uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name":"","type":"address"},{"name":"","type":"uint256"}],
    "name": "userGroups",
    "outputs": [{"name":"","type":"uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [{"indexed":true,"name":"groupId","type":"uint256"},{"indexed":false,"name":"name","type":"string"},{"indexed":false,"name":"admin","type":"address"},{"indexed":false,"name":"contributionAmount","type":"uint256"}],
    "name": "GroupCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [{"indexed":true,"name":"groupId","type":"uint256"},{"indexed":false,"name":"member","type":"address"}],
    "name": "MemberJoined",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [{"indexed":true,"name":"groupId","type":"uint256"},{"indexed":false,"name":"member","type":"address"},{"indexed":false,"name":"cycle","type":"uint256"},{"indexed":false,"name":"amount","type":"uint256"}],
    "name": "Contributed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [{"indexed":true,"name":"groupId","type":"uint256"},{"indexed":false,"name":"cycle","type":"uint256"},{"indexed":false,"name":"recipient","type":"address"},{"indexed":false,"name":"amount","type":"uint256"}],
    "name": "PayoutSent",
    "type": "event"
  }
] as const;
