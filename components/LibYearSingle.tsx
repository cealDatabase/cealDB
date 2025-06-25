"use client";

import React, { useRef } from "react";
import { Library_Year_Type } from "@/types/types";
import { Table } from "antd";
import type { TableColumnsType } from "antd";
import { useDownloadExcel } from "react-export-table-to-excel";
import { Button } from "@/components/Button";
import { DataType } from "@/types/SingleLibraryYearOverviewType";

export default function LibYearSingle({
  libyear,
}: {
  libyear: Library_Year_Type[];
}) {
  const columns: TableColumnsType<DataType> = [
    {
      title: "Language",
      dataIndex: "Languages",
      key: "Languages",
      width: 85,
    },
    {
      title: "Grand Total Materials",
      children: [
        {
          title: "Total (w/o ebooks)",
          dataIndex: "GTMTotal_WOEbooks",
          key: "GTMTotal_WOEbooks",
          width: 95,
        },
        {
          title: "Total (w ebooks)",
          dataIndex: "GTMTotal_WEbooks",
          key: "GTMTotal_WEbooks",
          width: 95,
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
          width: 95,
        },
        {
          title: "Added",
          dataIndex: "PVH_Added",
          key: "PVH_Added",
          width: 95,
        },
        {
          title: "Withdrawn",
          dataIndex: "PVH_Withdrawn",
          key: "PVH_Withdrawn",
          width: 95,
        },
        {
          title: "Sub-Total",
          dataIndex: "PVH_SubTotal",
          key: "PVH_SubTotal",
          width: 95,
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
              width: 95,
            },
            {
              title: "Add",
              dataIndex: "EB_PT_Add",
              key: "EB_PT_Add",
              width: 95,
            },
            {
              title: "Subtotal",
              dataIndex: "EB_PT_Subtotal",
              key: "EB_PT_Subtotal",
              width: 95,
            },
            {
              title: "Non-Purchased Titles",
              dataIndex: "EB_PT_NPTitles",
              key: "EB_PT_NPTitles",
              width: 95,
            },
            {
              title: "Subscription Titles",
              dataIndex: "EB_PT_SubTitles",
              key: "EB_PT_SubTitles",
              width: 95,
            },
            {
              title: "Titles Total",
              dataIndex: "EB_PT_TitlesTotal",
              key: "EB_PT_TitlesTotal",
              width: 95,
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
              width: 95,
            },
            {
              title: "Add",
              dataIndex: "EB_PV_Add",
              key: "EB_PV_Add",
              width: 95,
            },
            {
              title: "Subtotal",
              dataIndex: "EB_PV_Subtotal",
              key: "EB_PV_Subtotal",
              width: 95,
            },
            {
              title: "Non-Purchased Titles",
              dataIndex: "EB_PV_NPTitles",
              key: "EB_PV_NPTitles",
              width: 95,
            },
            {
              title: "Subscription Titles",
              dataIndex: "EB_PV_SubTitles",
              key: "EB_PV_SubTitles",
              width: 95,
            },
            {
              title: "Volumes Total",
              dataIndex: "EB_PV_TitlesTotal",
              key: "EB_PV_TitlesTotal",
              width: 95,
            },
          ],
        },
      ],
    },
    {
      title: "Unprocessed/Backlog Materials",
      children: [
        {
          title: "Total",
          dataIndex: "UB_Mat_Total",
          key: "UB_Mat_Total",
          width: 95,
        },
      ],
    },
    {
      title: "Monograph Additions",
      children: [
        {
          title: "Volumes Purchased	",
          dataIndex: "",
          key: "",
          width: 95,
        },
        { title: "Volumes Non-Purchased	", dataIndex: "", key: "", width: 95 },
        { title: "Volumes Total	", dataIndex: "", key: "", width: 95 },
        { title: "Titles Purchased		", dataIndex: "", key: "", width: 95 },
        { title: "Titles Non-Purchased		", dataIndex: "", key: "", width: 95 },
        { title: "Titles Total", dataIndex: "", key: "", width: 95 },
      ],
    },
  ];

  function capitalizeFirstLetter(somestring: string) {
    return somestring.charAt(0).toUpperCase() + somestring.slice(1);
  }

  const data: DataType[] = [];
  const lanArr = ["CHN", "JPN", "KOR", "NonCJK", "Total"];
  const EB_PT_Previous_Arr: { [key: string]: number | null } = {
    CHN: libyear[0].Electronic_Books.ebooks_purchased_prev_titles_chinese,
    JPN: libyear[0].Electronic_Books.ebooks_purchased_prev_titles_japanese,
    KOR: libyear[0].Electronic_Books.ebooks_purchased_prev_titles_korean,
    NonCJK: libyear[0].Electronic_Books.ebooks_purchased_prev_titles_noncjk,
    Total: libyear[0].Electronic_Books.ebooks_purchased_prev_titles_subtotal,
  };
  const EB_PT_Add_Arr: { [key: string]: number | null } = {
    CHN: libyear[0].Electronic_Books.ebooks_purchased_add_titles_chinese,
    JPN: libyear[0].Electronic_Books.ebooks_purchased_add_titles_japanese,
    KOR: libyear[0].Electronic_Books.ebooks_purchased_add_titles_korean,
    NonCJK: libyear[0].Electronic_Books.ebooks_purchased_add_titles_noncjk,
    Total: libyear[0].Electronic_Books.ebooks_purchased_add_titles_subtotal,
  };

  function showLan() {
    lanArr.forEach((lan, index) => {
      data.push({
        key: index,
        Languages: capitalizeFirstLetter(lan),
        GTMTotal_WOEbooks: 0,
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
        EB_PT_Previous: Number(EB_PT_Previous_Arr[lan]),
        EB_PT_Add: Number(EB_PT_Add_Arr[lan]),
        EB_PT_Subtotal:
          Number(EB_PT_Previous_Arr[lan]) + Number(EB_PT_Add_Arr[lan]),
        EB_PT_NPTitles: 0,
        EB_PT_SubTitles: 0,
        EB_PT_TitlesTotal: 0,
        EB_PV_Previous: 0,
        EB_PV_Add: 0,
        EB_PV_Subtotal: 0,
        EB_PV_NPTitles: 0,
        EB_PV_SubTitles: 0,
        EB_PV_TitlesTotal: 0,
        UB_Mat_Total: 0,
        MGAdd_VolumesPurchased: 0,
        MGAdd_VolumesNonPurchased: 0,
        MGAdd_VolumesTotal: 0,
        MGAdd_TitlesPurchased: 0,
      });
    });
  }
  showLan();

  const tableRef = useRef(null);

  const { onDownload } = useDownloadExcel({
    currentTableRef: tableRef.current,
    filename: `${libyear[0].Library.library_name}-${libyear[0].year}`,
    sheet: `${libyear[0].year}`,
  });

  return (
    <>
      <h1>
        {libyear[0].Library.library_name}, {libyear[0].year}
      </h1>
      {/* {Object.entries(libyear[0].Library).toString()} */}
      {/* {Object.entries(libyear[0].Electronic).toString()} */}
      {/* {libyear[0].Electronic.etotal_expenditure_grandtotal?.toString()} */}
      <div className="place-self-start mb-4">
        <Button
          onClick={onDownload}
          variant="outline"
          color="orange"
          className="text-xs"
        >
          Export to Excel
        </Button>
      </div>
      <div ref={tableRef} className="w-full">
        <Table
          columns={columns}
          dataSource={data}
          bordered
          size="middle"
          pagination={false}
          scroll={{ x: "calc(700px + 50%)", y: "100vh" }}
        />
      </div>
    </>
  );
}
