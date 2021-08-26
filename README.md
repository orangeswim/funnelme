# Funnelme

This is a typescript/javascript library to dynamically create array filters.

## Usage

See test below from jsonFilter.test.ts

```typescript
it('simple JSON EQ', () => {
  var filter: Filter<Fruit> = JsonToFunnel(
    `{ "op":"AND","nodes":[{"op":"EQ","val":0,"key":"price"}]}`
  );
  var fun = Funnel(filter);
  var data: Fruit[] = [
    { name: 'Apple', price: 1 },
    { name: 'Banana', price: 2 },
    { name: 'Nut', price: 3 },
    { name: 'Orange', price: 2 },
    { name: 'Strawberry', price: 0 },
  ];
  var result = data.filter(fun);

  expect(result).toEqual(
    expect.arrayContaining([{ name: 'Strawberry', price: 0 }])
  );
});
```
