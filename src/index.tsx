import ReactDOM from "react-dom";
import React, { Dispatch } from "react";
import { useState, useEffect } from "react";
import { HookFunctionType, SimpleObject } from "./types";

interface EmptyPropsType {
  onUpdate(v: SimpleObject): void;
  hook: any;
}

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
  return <></>;
};

const createRubickHook = (hook: HookFunctionType) => {
  if (typeof window === "undefined") return;
  let notifySetStateSet = new Set<Dispatch<any>>();
  let renderCount = 0;
  let rst: SimpleObject;
  const dom = document.createElement("div");
  ReactDOM.render(
    <Empty
      hook={hook}
      onUpdate={v => {
        rst = v;
        if (notifySetStateSet.size) {
          notifySetStateSet.forEach(ck => ck(renderCount++));
        }
      }}
    ></Empty>,
    dom
  );
  return () => {
    const [, setState] = useState();
    useEffect(() => {
      notifySetStateSet.add(setState);
      return () => {
        notifySetStateSet.delete(setState);
      };
    }, []);

    return rst;
  };
};

export default createRubickHook;
