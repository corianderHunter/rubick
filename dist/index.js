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
var react_1 = require("react");
var react_2 = require("react");
var emptyHookCount = 0;
var rubicks = [];
var rubicksProxy = null;
var doProxy = function (origin) {
    return new Proxy(origin, {
        get: function (target, property, receiver) {
            if (typeof target[property] === "function") {
                return new Proxy(target[property], {
                    apply: function (_target, thisArg, argumentsList) {
                        Reflect.apply(target[property], thisArg, argumentsList);
                    },
                });
            }
            return target[property];
        },
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
    var rst = {};
    (rubicksProxy || rubicks).push(react_1.createElement(Empty, {
        hook: hook,
        onUpdate: function (v) {
            rst = v;
            console.log("rst", rst);
            if (notifySetStateSet.size) {
                notifySetStateSet.forEach(function (ck) { return ck(renderCount++); });
            }
        },
    }));
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
exports.RubickStorage = function () {
    //保证初始化时只执行一次，这里不使用useEffect 避免有自定义hook 无法挂载顶层组件
    react_2.useState(function () {
        rubicksProxy = new Proxy(rubicks, {
            set: function (target, p, value) {
                Reflect.set(target, p, value);
                //这里因为数组更新机制，每次比预期中多更新一次
                setStep(step + 1);
                return true;
            },
        });
    });
    var _a = react_2.useState(0), step = _a[0], setStep = _a[1];
    return react_1.createElement(react_1.Fragment, null, (rubicksProxy || rubicks).map(function (v, idx) { return react_1.cloneElement(v, { key: idx }); }));
};
exports.default = createRubickHook;
