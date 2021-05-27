function parseTemp(data) {
  const temp = Number.parseFloat(data);

  if (Number.isNaN(temp)) {
    console.error('Unable to parse incoming temp: ', data);
    return;
  }

  return {
    temp,
  };
}

module.exports = {
  parseTemp,
};
