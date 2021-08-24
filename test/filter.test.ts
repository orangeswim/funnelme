import { Filter, FilterOperator, Funnel, ProcessFilter } from '../src';

interface Fruit {
  name: string;
}

describe('Funnel', () => {
  it('Bad Filter', () => {
    var filter: Filter<Fruit> = {
      operator: (-1 as unknown) as FilterOperator,
      nodes: [],
    };

    var results = () => {
      Funnel(filter);
    };
    expect(results).toThrow('Unimplemented operator');
  });
  it('Empty Filter', () => {
    var filter: Filter<Fruit> = {
      operator: FilterOperator.AND,
      nodes: [],
    };
    var fun = Funnel(filter);
    var data: Fruit[] = [{ name: 'Apple' }, { name: 'Banana' }];

    var results = data.filter(fun);
    expect(results).toEqual(data);
  });
  it('AND Filter', () => {
    var filter: Filter<Fruit> = {
      operator: FilterOperator.AND,
      nodes: [{ condition: val => val.name === 'Apple' }],
    };

    var data: Fruit[] = [{ name: 'Apple' }, { name: 'Banana' }];

    var fun = Funnel(filter);
    var results = data.filter(fun);

    expect(results).toHaveLength(1);
    expect(results[0]).toHaveProperty('name', 'Apple');
  });

  it('AND Filter multiple', () => {
    var filter: Filter<Fruit> = {
      operator: FilterOperator.AND,
      nodes: [{ condition: val => val.name.includes('a') }],
    };

    var data: Fruit[] = [
      { name: 'Apple' },
      { name: 'Banana' },
      { name: 'Nut' },
      { name: 'Orange' },
      { name: 'Strawberry' },
    ];

    var fun = Funnel(filter);
    var results = data.filter(fun);

    expect(results).toHaveLength(3);
    expect(results).toEqual(
      expect.arrayContaining([
        { name: 'Orange' },
        { name: 'Banana' },
        { name: 'Strawberry' },
      ])
    );
  });

  it('AND Filter multiple nodes', () => {
    var filter: Filter<Fruit> = {
      operator: FilterOperator.AND,
      nodes: [
        { condition: val => val.name.includes('a') },
        { condition: val => val.name.includes('n') },
      ],
    };

    var data: Fruit[] = [
      { name: 'Apple' },
      { name: 'Banana' },
      { name: 'Nut' },
      { name: 'Strawberry' },
      { name: 'Orange' },
    ];

    var fun = Funnel(filter);
    var results = data.filter(fun);

    expect(results).toHaveLength(2);
    expect(results).toEqual(
      expect.arrayContaining([{ name: 'Orange' }, { name: 'Banana' }])
    );
  });

  it('OR Filter multiple nodes', () => {
    var filter: Filter<Fruit> = {
      operator: FilterOperator.OR,
      nodes: [
        { condition: val => val.name.includes('a') },
        { condition: val => val.name.includes('n') },
      ],
    };

    var data: Fruit[] = [
      { name: 'Apple' },
      { name: 'Banana' },
      { name: 'Nut' },
      { name: 'Strawberry' },
      { name: 'Orange' },
    ];

    var fun = Funnel(filter);
    var results = data.filter(fun);

    expect(results).toHaveLength(3);
    expect(results).toEqual(
      expect.arrayContaining([
        { name: 'Banana' },
        { name: 'Strawberry' },
        { name: 'Orange' },
      ])
    );
  });

  it('NOT Filter multiple', () => {
    var filter: Filter<Fruit> = {
      operator: FilterOperator.NOT,
      nodes: [{ condition: val => val.name.includes('a') }],
    };

    var data: Fruit[] = [
      { name: 'Apple' },
      { name: 'Banana' },
      { name: 'Nut' },
      { name: 'Orange' },
      { name: 'Strawberry' },
    ];

    var fun = Funnel(filter);
    var results = data.filter(fun);

    expect(results).toHaveLength(2);
    expect(results).toEqual(
      expect.arrayContaining([{ name: 'Apple' }, { name: 'Nut' }])
    );
  });

  it('NOT Filter bad', () => {
    var filter: Filter<Fruit> = {
      operator: FilterOperator.NOT,
      nodes: [],
    };

    var results = () => {
      Funnel(filter);
    };

    expect(results).toThrow('NOT FilterNode has 0 nodes');
  });

  it('nested NOT AND Filter multiple', () => {
    var filterB: Filter<Fruit> = {
      operator: FilterOperator.AND,
      nodes: [{ condition: val => val.name.includes('a') }],
    };

    var filter: Filter<Fruit> = {
      operator: FilterOperator.NOT,
      nodes: [{ condition: ProcessFilter(filterB) }],
    };

    var data: Fruit[] = [
      { name: 'Apple' },
      { name: 'Banana' },
      { name: 'Nut' },
      { name: 'Orange' },
      { name: 'Strawberry' },
    ];

    var fun = Funnel(filter);
    var results = data.filter(fun);

    expect(results).toHaveLength(2);
    expect(results).toEqual(
      expect.arrayContaining([{ name: 'Apple' }, { name: 'Nut' }])
    );
  });

  it('nested NOT OR Filter multiple', () => {
    var filterB: Filter<Fruit> = {
      operator: FilterOperator.OR,
      nodes: [
        { condition: val => val.name.includes('a') },
        { condition: val => val.name.includes('t') },
      ],
    };

    var filter: Filter<Fruit> = {
      operator: FilterOperator.NOT,
      nodes: [{ condition: ProcessFilter(filterB) }],
    };

    var data: Fruit[] = [
      { name: 'Apple' },
      { name: 'Banana' },
      { name: 'Nut' },
      { name: 'Orange' },
      { name: 'Strawberry' },
    ];

    var fun = Funnel(filter);
    var results = data.filter(fun);

    expect(results).toHaveLength(1);
    expect(results).toEqual(expect.arrayContaining([{ name: 'Apple' }]));
  });
});
