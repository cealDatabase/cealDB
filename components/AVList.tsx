
import React from "react";
import { List_AV_Type } from "../types/types";
import { AsyncLanguage } from "./AsyncLanguage";

async function AVList({ item }: { item: List_AV_Type | null }) {
  if (!item) {
    return null;
  }

  return (
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
    </div>
  );
}

export default AVList;
