import React, { Dispatch, createElement, Fragment, cloneElement } from "react";
import { useState, useEffect } from "react";
import { HookFunctionType, SimpleObject, EmptyPropsType } from "./types";

export * from "./types";

let emptyHookCount = 0;

let rubicks = [];
let rubicksProxy = null;

const doProxy = (origin) =>
  new Proxy(origin, {
    get(target, property, receiver) {
      if (typeof target[property] === "function") {
        return new Proxy(target[property], {
          apply(_target, thisArg, argumentsList) {
            Reflect.apply(target[property], thisArg, argumentsList);
          },
        });
      }
      return target[property];
    },
  });

const Empty: React.FC<EmptyPropsType> = ({ hook, onUpdate }) => {
  const origin = hook();
  onUpdate(doProxy({ ...origin }));
  return createElement(Fragment);
};

const createRubickHook = <T>(hook: HookFunctionType<T>): (() => T) => {
  let notifySetStateSet = new Set<Dispatch<any>>();
  let renderCount = 0;
  let rst: SimpleObject = {};
  (rubicksProxy || rubicks).push(
    createElement(Empty, {
      hook,
      onUpdate(v) {
        rst = v;
        if (notifySetStateSet.size) {
          notifySetStateSet.forEach((ck) => ck(renderCount++));
        }
      },
    })
  );
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

export const RubickStorage = () => {
  //保证初始化时只执行一次，这里不使用useEffect 避免有自定义hook 无法挂载顶层组件
  useState(() => {
    rubicksProxy = new Proxy(rubicks, {
      set(target, p, value) {
        Reflect.set(target, p, value);
        //这里因为数组更新机制，每次比预期中多更新一次
        setStep(step + 1);
        return true;
      },
    });
  });

  const [step, setStep] = useState(0);

  return createElement(
    Fragment,
    null,
    (rubicksProxy || rubicks).map((v, idx) => cloneElement(v, { key: idx }))
  );
};

export default createRubickHook;
