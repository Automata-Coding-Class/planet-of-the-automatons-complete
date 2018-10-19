const { createLogger, format, transports } = require('winston');
require('winston-daily-rotate-file');
const path = require('path');
const { combine, /*timestamp,*/ label, printf } = format;


Date.prototype.toLocalizedISOString = function () {
    const tzo = -this.getTimezoneOffset(),
        dif = tzo >= 0 ? '+' : '-',
        pad = function (num) {
            const norm = Math.floor(Math.abs(num));
            return (norm < 10 ? '0' : '') + norm;
        };
    return this.getFullYear() +
        '-' + pad(this.getMonth() + 1) +
        '-' + pad(this.getDate()) +
        'T' + pad(this.getHours()) +
        ':' + pad(this.getMinutes()) +
        ':' + pad(this.getSeconds()) +
        dif + pad(tzo / 60) +
        ':' + pad(tzo % 60);
};

const myFormat = printf(info => {
    return `${info.timestamp} [${info.label}] ${process.pid} ${info.level}: ${info.message}`;
});


const customizedTimeStamp = format((info, opts) => {
    if (opts.localTime) {
        info.timestamp = (new Date()).toLocalizedISOString();
    } else {
        info.timestamp = (new Date()).toISOString();
    }
    return info;
});

const combinedFormat = combine(
    label({label: process.env.SERVICE_ID || 'socket-spike-server'}),
    customizedTimeStamp({localTime: true}),
    myFormat
);

const fileDateStampPattern = 'YYYY-MM-DD'; // 'YYYY-MM-DDTHH' or 'YYYY-MM-DDTHH:mm' also feasible

const logger = createLogger({
    level: 'info',
    format: combinedFormat,
    transports: [
        //
        // - Write to all logs with level `info` and below to `combined.log`
        // - Write all logs error (and below) to `error.log`.
        new transports.DailyRotateFile({
            name: 'file',
            datePattern: fileDateStampPattern,
            filename: path.join(__dirname, '/../logs/', '%DATE%.combined.log'),
            maxFiles: '7d'
        }),
        new transports.DailyRotateFile({
            name: 'file',
            datePattern: fileDateStampPattern,
            filename: path.join(__dirname, '/../logs/', '%DATE%.error.log'),
            maxFiles: '7d',
            level: 'error'
        })
    ]
});

// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `

logger.info(`NODE_ENV=${process.env.NODE_ENV}`);
if (process.env.NODE_ENV !== 'production') {
    logger.add(new transports.Console({
        format: combinedFormat, // format.simple(),
        colorize: true
    }));
}

module.exports = logger;
module.exports.stream = {
    write: function(message/*, encoding*/){
        if(process.env.NODE_ENV === 'production') {
            logger.info(message.replace(/\s*\n+\s*/, ' '));
        } else {
            logger.verbose(message.replace(/\s*\n+\s*/, ' '));
        }
    }
};
