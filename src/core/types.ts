export type SpecNode = {
  id: string;
  type: string;
  props?: Record<string, any>;
  children?: SpecNode[];
};
