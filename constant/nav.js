import {
  MousePointer,
  Table,
  FileText,
  PieChart,
} from "lucide-react";

export const MainMenu = [
  {
    label: "Institutions",
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
    description: "Fetch all the data available in individual tables, filtered by year and institution.",
    href: "/statistics/tableview",
    icon: Table,
  },
  {
    name: "Graph View",
    description: "Visualize the data as customizable graphs, filtered by year and institution.",
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
