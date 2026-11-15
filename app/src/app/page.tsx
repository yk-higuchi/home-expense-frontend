import { redirect } from "next/navigation";

/** トップは HOME を表示する（専用の画面は持たない） */
const RootPage = (): never => redirect("/home");

export default RootPage;
