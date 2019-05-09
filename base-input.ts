import { Input, GetValue } from '../types';
import { TerseError } from '../terse-error';

export type Spec<V, R extends boolean = boolean> = Partial<{
  description: string;
  placeholder: string;
  hidden: boolean;
  getValue: GetValue<V, R>;
  required: R;
}>;

function defaultGetValue() {
  throw new TerseError('This feature has not yet been implemented');
}

export function createInput<V, R extends boolean = boolean>(spec: Spec<V, R>) {
  const input: Input<V, R> = {
    required: (spec.required || false) as R,
    hidden: spec.hidden || false,
    placeholder: spec.placeholder || '<value>',
    getValue: spec.getValue || ((defaultGetValue as unknown) as GetValue<V, R>),
    getDescription() {
      return spec.description;
    },
  };
  return input;
}
