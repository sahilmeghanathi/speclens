import type { SpecNode } from "../core/types";


export const sampleSpec: SpecNode = {
  id: "root",
  type: "Card",
  props: { title: "Analytics Dashboard" },
  children: [
    {
      id: "grid",
      type: "Grid",
      props: { columns: 3 },
      children: [
        {
          id: "s1",
          type: "StatCard",
          props: {
            label: "Revenue",
            value: "$12,340",
            change: "+12%",
          },
        },
        {
          id: "s2",
          type: "StatCard",
          props: {
            label: "Users",
            value: "1,245",
            change: "+8%",
          },
        },
        {
          id: "s3",
          type: "StatCard",
          props: {
            label: "Orders",
            value: "320",
            change: "+5%",
          },
        },
      ],
    },
  ],
};
