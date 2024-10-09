
import React from "react";
import { List_AV_Type } from "../types/types";
import { AsyncLanguage } from "./AsyncLanguage";


async function AVList({ avList }: { avList: List_AV_Type[] }) {
  return (
    <div>
      {avList.map((item: List_AV_Type) => (
        <div key={item.id} className="grid gap-3">
          <span>{item.title}</span>
          <span>{item.type}</span>
          <span>{item.cjk_title}</span>
          <span>{item.romanized_title}</span>
          <span>{item.subtitle}</span>
          <span>{item.publisher}</span>
          <span>{item.description}</span>
          <span>{item.notes}</span>
          <span>{item.data_source}</span>
          <span>{item.updated_at.getDate()}</span>
          <span>{item.is_global?.valueOf()}</span>
          <span>Library Year ID: {item.libraryyear}</span>
          <span className="text-amber-800">{item.List_AV_Language.language_id}</span>
          <AsyncLanguage languageId={item.List_AV_Language.language_id} />
        </div>
      ))}
    </div>
  );
}

export default AVList;
