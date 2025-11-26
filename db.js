const DATABASE_DELAY = 1000 * 1;
const DATABASE_SUCCESS_PROBABILITY = 0.5;

/**
 *
 * @returns {{isValid: boolean, message?: string}}
 */
async function dbCoinToss() {
  await sleep(DATABASE_DELAY);

  if (Math.random() < DATABASE_SUCCESS_PROBABILITY) {
    return {
      isValid: true,
    };
  }

  return {
    isValid: false,
    message: "Coin toss failed",
  };
}

/**
 *
 * @returns {{isAuthenticated: boolean, message?: string}}
 */
async function dbAuthentication({ pin }) {
  await sleep(DATABASE_DELAY);

  if (pin === "1234") {
    return {
      isAuthenticated: true,
    };
  }

  return {
    isAuthenticated: false,
    message: "Authentication failed",
  };
}
