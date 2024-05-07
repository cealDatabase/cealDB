import {
  ChartPieIcon,
  CursorArrowRaysIcon,
  TableCellsIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";

export const MainMenu = [
  {
    label: "About",
    href: "/about",
  },
  {
    label: "Libraries",
    href: "/libraries",
  },
];

export const StatisticsMenu = [
  {
    name: "Quick View",
    description: "A quick view on the statistics of all institutions.",
    href: "/statistics/quickview",
    icon: CursorArrowRaysIcon,
  },
  {
    name: "Table View",
    description: "Contains Basic view and Advanced view, to fetch all the data available in individual tables.",
    href: "/statistics/tableview",
    icon: TableCellsIcon,
  },
  {
    name: "Graph View",
    description: "Contains Basic view and Advanced view, to fetch all the data available in individual graphs.",
    href: "/statistics/graphview",
    icon: ChartPieIcon,
  },
  {
    name: "Published Statistics",
    description: "Published Statistics in PDFs",
    href: "/statistics/pdf",
    icon: DocumentTextIcon,
  },
];
