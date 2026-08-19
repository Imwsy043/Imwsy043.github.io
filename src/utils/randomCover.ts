import covers from "../covers";

let currentIndex = 0;

export default () => {
  if (!covers || covers.length === 0) {
    return null;
  }

  const cover = covers[currentIndex % covers.length];
  currentIndex++;

  return cover;
};
