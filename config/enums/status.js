const StatusEnum = {
  OPEN: 'OPEN',
  CLOSED: 'CLOSED',
  DENIED: 'DENIED',
  ACCEPTED: 'ACCEPTED',
  BUSY: 'BUSY',
  DONE: 'DONE',
};

getStatusList = () => {
  return Object.values(StatusEnum);
};

module.exports = {
  StatusEnum,
  getStatusList
};
