"use strict";
/*
 * Created by Zubin on 2017-10-17 11:32:58
 */
exports.__esModule = true;
var amqp = require("amqp");
/**
 * mq类
 */
var MQ = /** @class */ (function () {
    function MQ(connOptions, _a) {
        var exchangeName = _a.exchangeName, exchangeOption = _a.exchangeOption, queueName = _a.queueName, queueOption = _a.queueOption;
        var that = this;
        var conn = amqp.createConnection(connOptions);
        conn.on('close', function () {
            that.ready = false;
            console.info('rabbitMQ has closed...');
        });
        conn.on('ready', function () {
            that.exchangeSubmit = conn.exchange(exchangeName, exchangeOption);
            that.exchangeSubmit.on('open', function () {
                that.ready = true;
                var queue = conn.queue(queueName, queueOption, function (_queue) {
                    queue.bind(exchangeName, '', function () {
                        that.ready = true;
                        that.queue = queue;
                        console.info('rabbitMQ connection success!');
                    });
                });
            });
        });
        conn.on('error', function (err) {
            that.ready = false;
            console.log(err);
            console.info("rabbitMQ error," + err.toString());
        });
        conn.on('disconnect', function () {
            that.ready = false;
            console.info('rabbitMQ disconnect');
        });
    }
    /**
     * 发布消息
     *
     * @param {any} body
     * @param {any} [options={}]
     * @returns
     * @memberof MQ
     */
    MQ.prototype.publishMsg = function (body, options) {
        var _this = this;
        if (options === void 0) { options = {}; }
        // console.log('publish', this.ready);
        var that = this;
        return new Promise((function (resolve, reject) {
            if (!_this.ready || !_this.exchangeSubmit) {
                setTimeout(function () {
                    resolve(that.publishMsg(body, options));
                }, 1000);
            }
            else {
                _this.exchangeSubmit.publish('', body, options || {}, function (ret, err) {
                    if (err) {
                        return reject(err);
                    }
                    return resolve(!ret);
                });
            }
        }));
    };
    /**
     * 接收消息
     *
     * @param {any} options
     * @param {any} callback
     * @memberof MQ
     */
    MQ.prototype.subscribe = function (options, callback) {
        var that = this;
        if (that.queue) {
            that.queue.subscribe(options, callback);
        }
        else {
            setTimeout(function () {
                that.subscribe(options, callback);
            }, 1000);
        }
    };
    return MQ;
}());
exports["default"] = MQ;
//# sourceMappingURL=rabbitmq_core.js.map