export interface SpecTemplate {
  name: string;
  description: string;
  spec: Record<string, any>;
}

export const SPEC_TEMPLATES: SpecTemplate[] = [
  {
    name: 'Empty Spec',
    description: 'Start with an empty spec',
    spec: {
      type: 'Grid',
      props: { columns: 1 },
      children: [],
    },
  },
  {
    name: 'Grid Layout',
    description: '3-column grid with cards',
    spec: {
      type: 'Grid',
      id: 'root-grid',
      props: { columns: 3, gap: 16 },
      children: [
        {
          type: 'Card',
          id: 'card-1',
          props: {
            title: 'Card 1',
            description: 'This is the first card',
          },
        },
        {
          type: 'Card',
          id: 'card-2',
          props: {
            title: 'Card 2',
            description: 'This is the second card',
          },
        },
        {
          type: 'Card',
          id: 'card-3',
          props: {
            title: 'Card 3',
            description: 'This is the third card',
          },
        },
      ],
    },
  },
  {
    name: 'Dashboard',
    description: 'Dashboard with metrics',
    spec: {
      type: 'Grid',
      id: 'dashboard-grid',
      props: { columns: 4, gap: 16 },
      children: [
        {
          type: 'StatCard',
          id: 'stat-1',
          props: {
            value: 1200,
            label: 'Total Users',
            trend: 'up',
          },
        },
        {
          type: 'StatCard',
          id: 'stat-2',
          props: {
            value: 420,
            label: 'Revenue ($k)',
            trend: 'up',
          },
        },
        {
          type: 'StatCard',
          id: 'stat-3',
          props: {
            value: 89,
            label: 'Growth (%)',
            trend: 'down',
          },
        },
        {
          type: 'StatCard',
          id: 'stat-4',
          props: {
            value: 12,
            label: 'Active Projects',
            trend: 'up',
          },
        },
      ],
    },
  },
  {
    name: 'Card Hierarchy',
    description: 'Nested cards with groups',
    spec: {
      type: 'Grid',
      id: 'main-group',
      props: { columns: 2, gap: 16 },
      children: [
        {
          type: 'Card',
          id: 'group-1',
          props: { title: 'Group 1' },
          children: [
            {
              type: 'Card',
              id: 'nested-1-1',
              props: { title: 'Nested Card 1', description: 'Content here' },
            },
            {
              type: 'Card',
              id: 'nested-1-2',
              props: { title: 'Nested Card 2', description: 'More content' },
            },
          ],
        },
        {
          type: 'Card',
          id: 'group-2',
          props: { title: 'Group 2' },
          children: [
            {
              type: 'Card',
              id: 'nested-2-1',
              props: { title: 'Nested Card 3', description: 'Additional info' },
            },
            {
              type: 'Card',
              id: 'nested-2-2',
              props: { title: 'Nested Card 4', description: 'Final content' },
            },
          ],
        },
      ],
    },
  },
];

/**
 * Get all available templates.
 */
export function getTemplates(): SpecTemplate[] {
  return SPEC_TEMPLATES;
}

/**
 * Get template by name.
 */
export function getTemplateByName(name: string): SpecTemplate | undefined {
  return SPEC_TEMPLATES.find((t) => t.name === name);
}

/**
 * Convert template to JSON string.
 */
export function templateToJSON(template: SpecTemplate): string {
  return JSON.stringify(template.spec, null, 2);
}
