"use client";

import { Library_Year_Type } from "@/types/types";
import { Table } from "antd";
import type { TableColumnsType } from "antd";

interface DataType {
  key: React.Key;
  GTMTotal_WOEbooks: any;
  GTMTotal_WEbooks: number;
  PVH_Previous: number;
  PVH_Added: number;
  PVH_Withdrawn: number;
  PVH_SubTotal: number;
  OMH_Microform: number;
  OMH_Cartographic: number;
  OMH_Audio: number;
  OMH_FilmVideo: number;
  OMH_DVD: number;
  OMH_SubTotal: number;
}

export default function LibYearSingle({
  libyear,
}: {
  libyear: Library_Year_Type[];
}) {
  const columns: TableColumnsType<DataType> = [
    {
      title: "Grand Total Materials",
      children: [
        {
          title: "Total (w/o ebooks)",
          dataIndex: "GTMTotal_WOEbooks",
          key: "GTMTotal_WOEbooks",
          width: 150,
        },
        {
          title: "Total (w ebooks)",
          dataIndex: "GTMTotal_WEbooks",
          key: "GTMTotal_WEbooks",
          width: 150,
        },
      ],
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      width: 100,
      fixed: "left",
    },
    {
      title: "Company",
      children: [
        {
          title: "Company Address",
          dataIndex: "companyAddress",
          key: "companyAddress",
          width: 200,
        },
        {
          title: "Company Name",
          dataIndex: "companyName",
          key: "companyName",
        },
      ],
    },
    {
      title: "Gender",
      dataIndex: "gender",
      key: "gender",
      width: 80,
      fixed: "right",
    },
  ];

  const data: DataType[] = [];

  for (let i = 0; i < 100; i++) {
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
        scroll={{ x: "calc(700px + 50%)", y: "100vh" }}
      />
    </main>
  );
}
