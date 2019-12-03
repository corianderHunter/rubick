# rubick

make hook-created-state shared between components
```js
npm install rubick-hook
```

## Demo

Custom Hook

```tsx
import createRubickHook from 'rubick-hook'

const useCount = () => {
  const [count, setCount] = useState(1);
  const [mark, setMark] = useState(10000);
  useEffect(() => {
    count > 4 && console.log("log count");
  }, [count]);
  const ins = () => {
    setCount(count + 1);
  };
  const des = () => {
    setCount(count - 1);
  };
  return { count, setCount, ins, des, mark, setMark };
};

export const stableCount = createRubickHook(useCount); //add type
```

use in components

```tsx
const TestPart1: React.FC = () => {
  const { count, setCount, ins, mark, setMark } = stableCount() as any; //add type
  return (
    <div
      style={{ margin: "20px 0" }}
      onClick={() => {
        setCount(count + 1);
      }}
    >
      test-part1:{count}
      mark-- :{mark}
    </div>
  );
};

const TestPart2: React.FC = () => {
  let { count, setCount, ins } = stableCount() as any; //add type
  return (
    <div
      style={{ margin: "20px 0" }}
      onClick={() => {
        setCount(count + 1);
      }}
    >
      test-part2:{count}
    </div>
  );
};
```
