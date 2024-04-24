import { Suspense } from "react";
import TablePlaceholder from "@/components/RenderPlaceholder";
import UserList from "@/components/UserList";
const StatisticsPage = () => {
  return (
    <main>
      <h1>Statistics Guide</h1>
      <Suspense fallback={<TablePlaceholder />}>
        <UserList />
      </Suspense>
    </main>
  );
};

export default StatisticsPage;
