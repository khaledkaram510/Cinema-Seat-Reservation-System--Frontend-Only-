import { Suspense } from "react";
import Main from "./Main";
import { getLayout } from "@/lib/utils";
import Loading from "@/components/custom/Loading";
export default function Home() {
  return (
    <Suspense fallback={<Loading />}>
      <Main getLayout={getLayout()} />{" "}
    </Suspense>
  );
}
