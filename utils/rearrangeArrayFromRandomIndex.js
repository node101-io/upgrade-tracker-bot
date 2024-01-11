module.exports = array => {
  const random_index = Math.floor(Math.random() * array.length);
  return array.slice(random_index).concat(array.slice(0, random_index));
};