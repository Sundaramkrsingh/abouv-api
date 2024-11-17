export function getRandomNumber(lowerLimit = 0, upperLimit?: number) {
  if (upperLimit === undefined) {
    upperLimit = lowerLimit;
    lowerLimit = 0;
  }
  return Math.floor(Math.random() * (upperLimit - lowerLimit)) + lowerLimit;
}

export function getRandomBoolean() {
  return Math.random() < 0.5;
}

export function repeatArray(arr: any[], length: number) {
  return arr.flatMap((value) => Array.from({ length }, () => value));
}

export function shuffle(arr: any[]) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  return arr;
}

export const shuffleWithStick = (options: any[], stick) => {
  shuffle(options);
  //assign positions
  options = options.map((option, index) => ({
    ...option,
    position: index + 1,
  }));

  if (!stick || stick < 1 || stick > options.length) {
    return options;
  }

  const stickyOption = options.find((option) => option.position === stick);
  let optionsToShuffle = options.filter((option) => option.position !== stick);
  optionsToShuffle = shuffle(optionsToShuffle);

  if (stickyOption) {
    optionsToShuffle.splice(stick - 1, 0, stickyOption);
  }

  //reassign positions(only stick is left at original position)
  optionsToShuffle = optionsToShuffle.map((option, index) => ({
    ...option,
    position: index + 1,
  }));

  return optionsToShuffle;
};
