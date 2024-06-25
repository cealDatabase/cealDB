import { Suspense } from "react";
import TablePlaceholder from "@/components/RenderPlaceholder";
import UserList from "@/components/UserList";
import LibraryList from "@/components/LibraryList";
const StatisticsPage = () => {
  return (
    <main>
      <h1>Statistics Guide</h1>
      <Suspense fallback={<TablePlaceholder />}>
        <div className="grid grid-cols-2">
          <UserList />
          <LibraryList />
        </div>
      </Suspense>
    </main>
  );
};

export default StatisticsPage;
