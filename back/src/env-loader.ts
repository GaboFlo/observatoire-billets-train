/* eslint-disable @typescript-eslint/no-require-imports */
require("./config");

const getEnvVar = (key: string, defaultValue = "") => {
  const envVar = process.env[key];

  if (!envVar) {
    return defaultValue;
  }
  return envVar;
};

const envToNumber = (key: string, defaultValue = 0): number => {
  const envVar = getEnvVar(key, defaultValue.toString());
  const res = typeof envVar === "number" ? envVar : parseInt(envVar, 10);

  if (Number.isNaN(res)) {
    return defaultValue;
  }
  return res;
};

export const env = Object.freeze({
  MONGO: {
    URL: getEnvVar("MONGO_URL", "mongodb://localhost:27017/train"),
    DB_NAME: getEnvVar("MONGO_DB_NAME", "DATABASE"),
    COLLECTION_NAME: getEnvVar("MONGO_COLLECTION_NAME", "COLLECTION_NAME"),
    SERVER_SELECTION_TIMEOUT: envToNumber(
      "MONGO_SERVER_SELECTION_TIMEOUT",
      5000
    ),
    SOCKET_TIMEOUT: envToNumber("MONGO_SOCKET_TIMEOUT", 45000),
  },
});
