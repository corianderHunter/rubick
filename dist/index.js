"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_dom_1 = require("react-dom");
var server_1 = require("react-dom/server");
var react_1 = require("react");
var react_2 = require("react");
var ENV;
(function (ENV) {
    ENV[ENV["BROWSER"] = 0] = "BROWSER";
    ENV[ENV["NODEJS"] = 1] = "NODEJS";
    ENV[ENV["RN"] = 2] = "RN";
})(ENV || (ENV = {}));
var emptyHookCount = 0;
var getENV = function () {
    if (typeof window !== "undefined") {
        if (window.navigator.product !== "ReactNative") {
            return ENV.BROWSER;
        }
        else {
            return ENV.RN;
        }
    }
    else {
        return ENV.NODEJS;
    }
};
var doProxy = function (origin) {
    return new Proxy(origin, {
        get: function (target, property, receiver) {
            if (typeof target[property] === "function") {
                return new Proxy(target[property], {
                    apply: function (_target, thisArg, argumentsList) {
                        Reflect.apply(target[property], thisArg, argumentsList);
                    }
                });
            }
            return target[property];
        }
    });
};
var Empty = function (_a) {
    var hook = _a.hook, onUpdate = _a.onUpdate;
    var origin = hook();
    onUpdate(doProxy(__assign({}, origin)));
    return react_1.createElement(react_1.Fragment);
};
var createRubickHook = function (hook) {
    var notifySetStateSet = new Set();
    var renderCount = 0;
    var rst;
    var env = getENV();
    if (env === ENV.BROWSER) {
        var dom = document.createElement("div");
        react_dom_1.default.render(react_1.createElement(Empty, {
            hook: hook,
            onUpdate: function (v) {
                rst = v;
                if (notifySetStateSet.size) {
                    notifySetStateSet.forEach(function (ck) { return ck(renderCount++); });
                }
            }
        }), dom);
    }
    else if (env === ENV.NODEJS) {
        //wait for testing
        server_1.default.renderToString(react_1.createElement(Empty, {
            hook: hook,
            onUpdate: function (v) {
                rst = v;
                if (notifySetStateSet.size) {
                    notifySetStateSet.forEach(function (ck) { return ck(renderCount++); });
                }
            }
        }));
    }
    else if (env === ENV.RN) {
        var AppRegistry = require("react-native").AppRegistry;
        AppRegistry.registerComponent("ForEmptyHooK" + emptyHookCount, function () {
            return react_1.createElement(Empty, {
                hook: hook,
                onUpdate: function (v) {
                    rst = v;
                    if (notifySetStateSet.size) {
                        notifySetStateSet.forEach(function (ck) { return ck(renderCount++); });
                    }
                }
            });
        });
    }
    else {
        throw new Error("can not detect current environment");
    }
    emptyHookCount++;
    return (function () {
        var _a = react_2.useState(), setState = _a[1];
        react_2.useEffect(function () {
            notifySetStateSet.add(setState);
            return function () {
                notifySetStateSet.delete(setState);
            };
        }, []);
        return rst;
    });
};
exports.default = createRubickHook;
