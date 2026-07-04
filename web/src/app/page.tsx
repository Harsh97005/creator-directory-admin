import { Suspense } from "react";
import { CreatorsScreen } from "@/components/creators/CreatorsScreen";

export default function Home() {
  return (
    // useSearchParams (used for URL-synced filters/sort/pagination) requires a Suspense boundary.
    <Suspense fallback={null}>
      <CreatorsScreen />
    </Suspense>
  );
}
