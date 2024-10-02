import React from "react";
import { List_AV_Type } from "../types/types";
import db from "../lib/db";

// Get language
const getLanguageById = async (id: number) => {
  try {
    const language = await db.language.findUnique({ where: { id } });
    return language?.short;
  } catch {
    return null;
  }
};
// Get counts
const getCountsById = async (id: number) => {
  try {
    const counts = await db.list_AV_Counts.findUnique({ where: { id } });
    return counts;
  } catch {
    return null;
  }
};

function AVList({ avList }) {
  return (
    <div>
      {avList.map(async (item: List_AV_Type, index) => (
        <div key={item.id} className="grid gap-3">
          {index}
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
          <span>{item.libraryyear}</span>
          <span>
            {await Promise.all(
              item.List_AV_Language.map(async (e) => {
                const language = await getLanguageById(e.language_id);
                return <span key={e.language_id}>{language}</span>;
              })
            )}
          </span>
          <span>
            {await Promise.all(
              item.List_AV_Counts.map(async (e) => {
                const counts = await getCountsById(e.id);
                return <span key={e.id} className="p-4">{counts?.titles}</span>;
              })
            )}
          </span>
        </div>
      ))}
    </div>
  );
}

export default AVList;
