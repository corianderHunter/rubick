import React from "react";
import { SimpleObject } from "./types";

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

export default Empty;
