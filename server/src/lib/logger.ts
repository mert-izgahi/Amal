import dayjs from "dayjs";
import logger from "pino";

const loggerInstance = logger({
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
      translateTime: true,
      ignore: "pid,hostname",
    },
  },
  base: {
    pid: false,
  },

  timestamp: () => `,"time":"${dayjs().format("YYYY-MM-DD HH:mm:ss")}"`,
});


export { loggerInstance as logger };