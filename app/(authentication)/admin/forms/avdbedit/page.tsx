import React, { Suspense } from "react";
import { List_AV_Type } from "../../../../../types/types";
import { Container } from "../../../../../components/Container";
import { getAllAVList } from "../../../../../data/fetchPrisma";
import AVList from "../../../../../components/AVList";

async function AVListComponent(): Promise<JSX.Element> {
  const avlist = await getAllAVList();
  return <AVList avList={avlist as unknown as List_AV_Type[]} />;
}

export default function AvdbEditPage() {
  return (
    <main>
      <h1>2024 Audio/Visual Database by Subscription</h1>
      <Container>
        <p className="text-sm">
          Please check the boxes next to each subscription your library has, for
          each language Chinese, Japanese, Korean, and Non-CJK. Data in this
          list is linked to Form 4: Holdings of Other Materials and Form 9:
          Electronic Resources. If you subscribe to a subset of one of these
          collections, click "customize", and then enter the appropriate counts
          in each of the fields.
        </p>
        <Suspense fallback={<div>Loading...</div>}>
          <AVListComponent />
        </Suspense>
      </Container>
    </main>
  );
}
