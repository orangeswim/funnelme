import { Filter, FilterOperator, ProcessFilter } from '.';

//export type FilterJsonOp = 'AND' | 'OR' | 'NOT';
export type FilterJsonRuleOp =
  | 'GT'
  | 'LT'
  | 'HAS'
  | 'EQ'
  | 'NOT'
  | 'SW'
  | 'HASNOT';
export interface FilterJsonRule {
  op: FilterJsonRuleOp;
  key: string;
  val: string | number;
  type?: 'node' | 'rule';
}
export interface FilterJsonNode {
  op: FilterOperator;
  nodes: (FilterJsonNode | FilterJsonRule)[];
  type?: 'node' | 'rule';
}

export interface FilterObject {
  [key: string]: string | number;
}

export const JsonToFilter = <Type>(parsedInput: FilterJsonNode) => {
  var filter: Filter<Type> = { operator: parsedInput.op, nodes: [] };
  if (Array.isArray(parsedInput.nodes) == false) {
    throw new Error("Filter doesn't have any nodes");
  }
  for (var i = 0; i < parsedInput.nodes.length; i++) {
    var node = parsedInput.nodes[i];
    if ((node as FilterJsonRule).val != undefined) {
      //Treat as Rule
      node.type = 'rule';
      FilterJsonRuleToFilter<Type>(node as FilterJsonRule, filter);
    } else {
      node.type = 'node';
      FilterJsonNodeToFilter<Type>(node as FilterJsonNode, filter);
    }
  }
  return filter;
};

export const FilterJsonNodeToFilter = <Type>(
  node: FilterJsonNode,
  filter: Filter<Type>
) => {
  filter.nodes.push({ condition: ProcessFilter(JsonToFilter(node)) });
};

export const FilterJsonRuleToFilter = <Type>(
  node: FilterJsonRule,
  filter: Filter<Type>
) => {
  switch (node.op) {
    case 'GT':
      filter.nodes.push({
        condition: val => {
          return ((val as unknown) as FilterObject)[node.key] > node.val;
        },
      });
      break;
    case 'LT':
      filter.nodes.push({
        condition: val => {
          return ((val as unknown) as FilterObject)[node.key] < node.val;
        },
      });
      break;
    case 'EQ':
      filter.nodes.push({
        condition: val => {
          return ((val as unknown) as FilterObject)[node.key] === node.val;
        },
      });
      break;
    case 'HAS':
      filter.nodes.push({
        condition: val => {
          return ((val as unknown) as FilterObject)[node.key]
            ?.toString()
            .includes(node.val.toString());
        },
      });
      break;
    case 'HASNOT':
      filter.nodes.push({
        condition: val => {
          return !((val as unknown) as FilterObject)[node.key]
            ?.toString()
            .includes(node.val.toString());
        },
      });
      break;
    case 'NOT':
      filter.nodes.push({
        condition: val => {
          return ((val as unknown) as FilterObject)[node.key] != node.val;
        },
      });
      break;
    case 'SW':
      filter.nodes.push({
        condition: val => {
          return ((val as unknown) as FilterObject)[node.key]
            ?.toString()
            .startsWith(node.val.toString());
        },
      });
      break;
  }
};

export const JsonToFunnel = <T>(input: string | FilterJsonNode) => {
  var parsedInput: FilterJsonNode;
  if (typeof input == 'string') {
    parsedInput = JSON.parse(input);
  } else {
    parsedInput = input;
  }

  //   if (
  //     [FilterOperator.AND, FilterOperator.OR, FilterOperator.NOT].includes(
  //       parsedInput.op
  //     ) == false
  //   ) {
  //     throw new Error('Unimplemented filter operator in JSON');
  //   }
  var filter = JsonToFilter<T>(parsedInput);
  return filter;
};
