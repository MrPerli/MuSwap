import { Asset } from "@Mu/pages/portfolio/Portfolio";
import { Explor } from "@Mu/pages/explor/Explor";
import { Home } from "@MuPages/Home";
import { NotFound } from "@MuPages/NotFound";
import { createBrowserRouter } from "react-router-dom";

// 定义路由
const routes = [
    {
        path: '/',
        element: <Home />,
    },
    {
        path: '/Asset',
        element: <Asset />,
    },
    {
        path: '/Explor',
        element: <Explor />,
    },
    {
        path: '*',
        element: <NotFound />,
    },
]

export const MuRouter = createBrowserRouter(routes)