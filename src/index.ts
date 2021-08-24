export enum FilterOperator {
  AND = 'AND',
  OR = 'OR',
  NOT = 'NOT',
}

export type FilterCallback<Type> = (
  value: Type,
  index: number,
  arr: Type[]
) => boolean;

export interface FilterNode<Type> {
  condition: FilterCallback<Type>;
}
export interface Filter<Type> {
  operator: FilterOperator;
  nodes: FilterNode<Type>[];
}

export const ProcessFilter: <Type>(
  filter: Filter<Type>
) => FilterCallback<Type> = <Type>(filter: Filter<Type>) => {
  switch (filter.operator) {
    case FilterOperator.AND:
      return (value: Type, index: number, arr: Type[]) => {
        var res = false;
        for (var i = 0; i < filter.nodes.length; i++) {
          res = filter.nodes[i].condition(value, index, arr);
          if (!res) {
            return false;
          }
        }
        return true;
      };
    case FilterOperator.OR:
      return (value: Type, index: number, arr: Type[]) => {
        var res = false;
        for (var i = 0; i < filter.nodes.length; i++) {
          res = filter.nodes[i].condition(value, index, arr);
          if (res) {
            return true;
          }
        }
        return false;
      };
    case FilterOperator.NOT:
      if (filter.nodes.length === 0) {
        throw new Error('NOT FilterNode has 0 nodes');
      }
      return (value: Type, index: number, arr: Type[]) => {
        var res = filter.nodes[0].condition(value, index, arr);
        return !res;
      };
    default:
      throw new Error('Unimplemented operator');
  }
};

export const Funnel = <Type>(filter: Filter<Type>) => {
  var finalFilter = ProcessFilter(filter);
  return finalFilter;
};
