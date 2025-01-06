export const formatTime = (best: number) => {
  const totalSeconds = best / 100;

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  const milliseconds = Math.floor(best % 100);

  if (hours > 0) {
    return `${String(hours)}:${String(minutes).padStart(2, "0")}:${String(
      seconds
    ).padStart(2, "0")}.${String(milliseconds).padStart(2, "0")}`;
  } else if (minutes > 0) {
    return `${String(minutes)}:${String(seconds).padStart(2, "0")}.${String(
      milliseconds
    ).padStart(2, "0")}`;
  } else {
    return `${String(seconds)}.${String(milliseconds).padStart(2, "0")}`;
  }
};

export const process333mbfData = (data: number) => {
  if (data < 0 || data > 999999999) {
    throw new Error(
      "Invalid input format. Expected a number in the range of 000000000 to 999999999."
    );
  }

  const DD = Math.floor(data / 10000000);
  const TTTTT = Math.floor((data % 10000000) / 100);
  const MM = data % 100;

  const difference = 99 - DD;

  const timeInSeconds = TTTTT === 99999 ? "Unknown" : TTTTT;

  const solved = difference + MM;
  const attempted = solved + MM;

  return {
    difference,
    timeInSeconds,
    missed: MM,
    solved,
    attempted,
  };
};
