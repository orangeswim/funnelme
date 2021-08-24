import { Filter, FilterOperator, Funnel } from '../src';
import { JsonToFunnel } from '../src/JsonFilter';

interface Fruit {
  name: string;
  price: number;
}

describe('FilterTests', () => {
  it('Bad JSON', () => {
    var results = () => {
      var filter: Filter<Fruit> = JsonToFunnel('');
      Funnel(filter);
    };
    expect(results).toThrow('Unexpected end of JSON input');
  });

  it('Bad filter', () => {
    var results = () => {
      var filter: Filter<Fruit> = JsonToFunnel(`{ "op":"AND"}`);
      Funnel(filter);
    };
    expect(results).toThrow("Filter doesn't have any nodes");
  });

  it('simple parse inside', () => {
    var filter: Filter<Fruit> = JsonToFunnel({
      op: FilterOperator.AND,
      nodes: [{ op: 'EQ', val: 0, key: 'price' }],
    });
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

  it('simple JSON GT', () => {
    var filter: Filter<Fruit> = JsonToFunnel(
      `{ "op":"AND","nodes":[{"op":"GT","val":1,"key":"price"}]}`
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

    expect(result).toHaveLength(3);
    expect(result).toEqual(
      expect.arrayContaining([
        { name: 'Banana', price: 2 },
        { name: 'Nut', price: 3 },
        { name: 'Orange', price: 2 },
      ])
    );
  });

  it('simple JSON LT', () => {
    var filter: Filter<Fruit> = JsonToFunnel(
      `{ "op":"AND","nodes":[{"op":"LT","val":2,"key":"price"}]}`
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

    expect(result).toHaveLength(2);
    expect(result).toEqual(
      expect.arrayContaining([
        { name: 'Apple', price: 1 },
        { name: 'Strawberry', price: 0 },
      ])
    );
  });

  it('simple JSON HAS', () => {
    var filter: Filter<Fruit> = JsonToFunnel(
      `{ "op":"AND","nodes":[{"op":"HAS","val":"nana","key":"name"}]}`
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

    expect(result).toHaveLength(1);
    expect(result).toEqual(
      expect.arrayContaining([{ name: 'Banana', price: 2 }])
    );
  });

  it('simple JSON NOT', () => {
    var filter: Filter<Fruit> = JsonToFunnel(
      `{ "op":"AND","nodes":[{"op":"NOT","val":2,"key":"price"}]}`
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

    expect(result).toHaveLength(3);
    expect(result).toEqual(
      expect.arrayContaining([
        { name: 'Apple', price: 1 },
        { name: 'Nut', price: 3 },
        { name: 'Strawberry', price: 0 },
      ])
    );
  });

  it('simple JSON SW', () => {
    var filter: Filter<Fruit> = JsonToFunnel(
      `{ "op":"AND","nodes":[{"op":"SW","val":"Ap","key":"name"}]}`
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

    expect(result).toHaveLength(1);
    expect(result).toEqual(
      expect.arrayContaining([{ name: 'Apple', price: 1 }])
    );
  });

  it('multiple and', () => {
    var filter: Filter<Fruit> = JsonToFunnel({
      op: FilterOperator.AND,
      nodes: [
        { op: 'GT', val: 1, key: 'price' },
        { op: 'EQ', val: 'Orange', key: 'name' },
      ],
    });
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
      expect.arrayContaining([{ name: 'Orange', price: 2 }])
    );
  });

  it('nested and', () => {
    var filter: Filter<Fruit> = JsonToFunnel({
      op: FilterOperator.OR,
      nodes: [
        { op: 'GT', val: 2, key: 'price' },
        {
          op: FilterOperator.AND,
          nodes: [
            { op: 'HAS', val: 'a', key: 'name' },
            { op: 'NOT', val: 'Orange', key: 'name' },
          ],
        },
      ],
    });
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
      expect.arrayContaining([
        { name: 'Banana', price: 2 },
        { name: 'Nut', price: 3 },
        { name: 'Strawberry', price: 0 },
      ])
    );
  });
});
