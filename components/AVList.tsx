
import React from "react";
import { List_AV_Type } from "../types/types";
import { AsyncLanguage } from "./AsyncLanguage";


async function AVList({ avList }: { avList: List_AV_Type[] }) {
  console.log(avList[0]['List_AV_Language'][0]['language_id']);
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
          {item.List_AV_Language.map((e) =>
            <AsyncLanguage languageId={e.language_id} key={e.language_id} />)}
        </div>
      ))}
    </div>
  );
}

export default AVList;
