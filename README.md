# rubick

make hook-created-state shared between components

## Demo

Use in Root Node

```tsx
<App>
  <RubickStorage></RubickStorage>
  {others...}
</App>
```

Custom Hook

```tsx
interface DustHookType {
  count: number;
  setCount: Dispatch<number>;
  ins(): void;
  des(): void;
}

export const useDust = (): DustHookType => {
  const [count, setCount] = useState<number>(0);
  const ins = () => {
    setCount(count + 1);
  };
  const des = () => {
    setCount(count - 1);
  };
  return { count, setCount, ins, des };
};

export const cacheDust = createRubickHook(useDust);
```

use in components

```tsx
const TestPart1: React.FC = () => {
  const { count, setCount, ins, des } = cacheDust();
  return (
    <div
      style={{ margin: "20px 0" }}
      onClick={() => {
        setCount(count + 1);
      }}
    >
      test-part1:{count}
    </div>
  );
};

const TestPart2: React.FC = () => {
  const { count, setCount, ins, des } = cacheDust();
  return (
    <div
      style={{ margin: "20px 0" }}
      onClick={() => {
        ins();
      }}
    >
      test-part2:{count}
    </div>
  );
};
```
