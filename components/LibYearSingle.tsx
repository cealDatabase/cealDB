"use client";

import { Library_Year_Type } from "@/types/types";
import { Table } from "antd";
import type { TableColumnsType } from "antd";

interface DataType {
  key: React.Key;
  GTMTotal_WOEbooks: any | null;
  GTMTotal_WEbooks: number | null;
  PVH_Previous: number | null;
  PVH_Added: number | null;
  PVH_Withdrawn: number | null;
  PVH_SubTotal: number | null;
  OMH_Microform: number | null;
  OMH_Cartographic: number | null;
  OMH_Audio: number | null;
  OMH_FilmVideo: number | null;
  OMH_DVD: number | null;
  OMH_SubTotal: number | null;
  EB_PT_Previous: number | null;
  EB_PT_Add: number | null;
  EB_PT_Subtotal: number | null;
  EB_PT_NPTitles: number | null;
  EB_PT_SubTitles: number | null;
  EB_PT_TitlesTotal: number | null;
  EB_PV_Previous: number | null;
  EB_PV_Add: number | null;
  EB_PV_Subtotal: number | null;
  EB_PV_NPTitles: number | null;
  EB_PV_SubTitles: number | null;
  EB_PV_TitlesTotal: number | null;
}
export default function LibYearSingle({
  libyear,
}: {
  libyear: Library_Year_Type[];
}) {
  const columns: TableColumnsType<DataType> = [
    {
      title: "Language",
    },
    {
      title: "Grand Total Materials",
      children: [
        {
          title: "Total (w/o ebooks)",
          dataIndex: "GTMTotal_WOEbooks",
          key: "GTMTotal_WOEbooks",
          width: 80,
        },
        {
          title: "Total (w ebooks)",
          dataIndex: "GTMTotal_WEbooks",
          key: "GTMTotal_WEbooks",
          width: 80,
        },
      ],
    },
    {
      title: "Physical Volumes Held (*1)",
      children: [
        {
          title: "Previous",
          dataIndex: "PVH_Previous",
          key: "PVH_Previous",
          width: 80,
        },
        {
          title: "Previous",
          dataIndex: "PVH_Added",
          key: "PVH_Added",
          width: 80,
        },
        {
          title: "Previous",
          dataIndex: "PVH_Withdrawn",
          key: "PVH_Withdrawn",
          width: 80,
        },
        {
          title: "Previous",
          dataIndex: "PVH_SubTotal",
          key: "PVH_SubTotal",
          width: 80,
        },
      ],
    },
    {
      title: "Electronic Books",
      children: [
        {
          title: "Purchased Titles",
          children: [
            {
              title: "Previous",
              dataIndex: "EB_PT_Previous",
              key: "EB_PT_Previous",
              width: 80,
            },
            {
              title: "Add",
              dataIndex: "EB_PT_Add",
              key: "EB_PT_Add",
              width: 80,
            },
            {
              title: "Subtotal",
              dataIndex: "EB_PT_Subtotal",
              key: "EB_PT_Subtotal",
              width: 80,
            },
            {
              title: "Non-Purchased Titles",
              dataIndex: "EB_PT_NPTitles",
              key: "EB_PT_NPTitles",
              width: 80,
            },
            {
              title: "Subscription Titles",
              dataIndex: "EB_PT_SubTitles",
              key: "EB_PT_SubTitles",
              width: 80,
            },
            {
              title: "Titles Total",
              dataIndex: "EB_PT_TitlesTotal",
              key: "EB_PT_TitlesTotal",
              width: 80,
            },
          ],
        },
        {
          title: "Purchased Volume",
          children: [
            {
              title: "Previous",
              dataIndex: "EB_PV_Previous",
              key: "EB_PV_Previous",
              width: 80,
            },
            {
              title: "Add",
              dataIndex: "EB_PV_Add",
              key: "EB_PV_Add",
              width: 80,
            },
            {
              title: "Subtotal",
              dataIndex: "EB_PV_Subtotal",
              key: "EB_PV_Subtotal",
              width: 80,
            },
            {
              title: "Non-Purchased Titles",
              dataIndex: "EB_PV_NPTitles",
              key: "EB_PV_NPTitles",
              width: 80,
            },
            {
              title: "Subscription Titles",
              dataIndex: "EB_PV_SubTitles",
              key: "EB_PV_SubTitles",
              width: 80,
            },
            {
              title: "Volumes Total",
              dataIndex: "EB_PV_TitlesTotal",
              key: "EB_PV_TitlesTotal",
              width: 80,
            },
          ],
        },
      ],
    },
  ];

  const data: DataType[] = [];

  for (let i = 0; i < 5; i++) {
    data.push({
      key: i,
      GTMTotal_WOEbooks: `${libyear[0].Electronic.etotal_expenditure_grandtotal}`,
      GTMTotal_WEbooks: 0,
      PVH_Previous: 0,
      PVH_Added: 0,
      PVH_Withdrawn: 0,
      PVH_SubTotal: 0,
      OMH_Microform: 0,
      OMH_Cartographic: 0,
      OMH_Audio: 0,
      OMH_FilmVideo: 0,
      OMH_DVD: 0,
      OMH_SubTotal: 0,
      EB_PT_Previous: 0,
      EB_PT_Add: 0,
      EB_PT_Subtotal: 0,
      EB_PT_NPTitles: 0,
      EB_PT_SubTitles: 0,
      EB_PT_TitlesTotal: 0,
      EB_PV_Previous: 0,
      EB_PV_Add: 0,
      EB_PV_Subtotal: 0,
      EB_PV_NPTitles: 0,
      EB_PV_SubTitles: 0,
      EB_PV_TitlesTotal: 0,
    });
  }

  return (
    <main>
      <h2>
        {libyear[0].Library.library_name}, {libyear[0].year}
      </h2>
      {/* {Object.entries(libyear[0].Library).toString()} */}
      {/* {Object.entries(libyear[0].Electronic).toString()} */}
      function:{" "}
      {libyear[0].Electronic.etotal_expenditure_grandtotal?.toString()}
      <Table
        columns={columns}
        dataSource={data}
        bordered
        size="middle"
        pagination={false}
        scroll={{ x: "calc(700px + 50%)", y: "100vh" }}
      />
    </main>
  );
}
