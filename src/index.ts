import ReactDOM from "react-dom";
import ReactDOMServer from "react-dom/server";
import React, { Dispatch, createElement, Fragment } from "react";
import { useState, useEffect } from "react";
import { HookFunctionType, SimpleObject, EmptyPropsType } from "./types";

export * from "./types";

enum ENV {
  BROWSER,
  NODEJS,
  RN
}

let emptyHookCount = 0;

const getENV = () => {
  if (typeof window !== "undefined") {
    if (window.navigator.product !== "ReactNative") {
      return ENV.BROWSER;
    } else {
      return ENV.RN;
    }
  } else {
    return ENV.NODEJS;
  }
};

const doProxy = origin =>
  new Proxy(origin, {
    get(target, property, receiver) {
      if (typeof target[property] === "function") {
        return new Proxy(target[property], {
          apply(_target, thisArg, argumentsList) {
            Reflect.apply(target[property], thisArg, argumentsList);
          }
        });
      }
      return target[property];
    }
  });

const Empty: React.FC<EmptyPropsType> = ({ hook, onUpdate }) => {
  const origin = hook();
  onUpdate(doProxy({ ...origin }));
  return createElement(Fragment);
};

const createRubickHook = <T>(hook: HookFunctionType<T>): (() => T) => {
  let notifySetStateSet = new Set<Dispatch<any>>();
  let renderCount = 0;
  let rst: SimpleObject;
  const env = getENV();
  if (env === ENV.BROWSER) {
    const dom = document.createElement("div");
    ReactDOM.render(
      createElement(Empty, {
        hook,
        onUpdate(v) {
          rst = v;
          if (notifySetStateSet.size) {
            notifySetStateSet.forEach(ck => ck(renderCount++));
          }
        }
      }),
      dom
    );
  } else if (env === ENV.NODEJS) {
    //wait for testing
    ReactDOMServer.renderToString(
      createElement(Empty, {
        hook,
        onUpdate(v) {
          rst = v;
          if (notifySetStateSet.size) {
            notifySetStateSet.forEach(ck => ck(renderCount++));
          }
        }
      })
    );
  } else if (env === ENV.RN) {
    const { AppRegistry } = require("react-native");
    AppRegistry.registerComponent("ForEmptyHooK" + emptyHookCount, () =>
      createElement(Empty, {
        hook,
        onUpdate(v) {
          rst = v;
          if (notifySetStateSet.size) {
            notifySetStateSet.forEach(ck => ck(renderCount++));
          }
        }
      })
    );
  } else {
    throw new Error("can not detect current environment");
  }
  emptyHookCount++;
  return (() => {
    const [, setState] = useState();
    useEffect(() => {
      notifySetStateSet.add(setState);
      return () => {
        notifySetStateSet.delete(setState);
      };
    }, []);

    return rst;
  }) as () => T;
};

export default createRubickHook;
