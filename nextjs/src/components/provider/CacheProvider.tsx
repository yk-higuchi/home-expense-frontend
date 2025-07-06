import {ReactNode} from "react";
import {AppRouterCacheProvider} from "@mui/material-nextjs/v15-appRouter";

const CacheProvider = ({
                           children,
                       }: Readonly<{
    children: ReactNode;
}>) => {
    return (
        <AppRouterCacheProvider>{children}</AppRouterCacheProvider>
    )
}
export default CacheProvider;