import {
  MousePointer,
  Table,
  FileText,
  PieChart,
} from "lucide-react";

export const MainMenu = [
  {
    label: "Libraries",
    href: "/libraries",
  }
];

export const StatisticsMenu = [
  {
    name: "Quick View",
    description: "A quick view on the statistics of all institutions.",
    href: "/statistics/quickview",
    icon: MousePointer,
  },
  {
    name: "Table View",
    description: "Contains Basic view and Advanced view, to fetch all the data available in individual tables.",
    href: "/statistics/tableview",
    icon: Table,
  },
  {
    name: "Graph View",
    description: "Contains Basic view and Advanced view, to fetch all the data available in individual graphs.",
    href: "/statistics/graphview",
    icon: PieChart,
  },
  {
    name: "Published Statistics",
    description: "Published Statistics in PDFs",
    href: "/statistics/pdf",
    icon: FileText,
  },
];
