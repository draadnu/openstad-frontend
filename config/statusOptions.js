const statusList = require("./enums/status").getStatusList();

exports.statusCheckboxValues = statusList.map((status) => {
  return {
    label: status,
    value: status,
  };
});
