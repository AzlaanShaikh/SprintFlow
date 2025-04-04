import {Hono} from "hono";
import auth from "@/features/auth/server/route"
import {handle} from "hono/vercel";
import workspaces from "@/features/workspaces/server/route"
import members from "@/features/members/server/route"
import projects from "@/features/projects/server/route"


const app = new Hono().basePath("/api")
const routes=app
    .route("/auth",auth)
    .route("/workspaces",workspaces)
    .route("/members",members)
    .route("/projects",projects)

export const GET =handle(app);
export const POST=handle(app);
export const PATCH=handle(app);
export const DELETE= handle(app);

export type AppType=typeof routes






























// import {Hono} from "hono";
// import {handle} from "hono/vercel";

// import auth from "@/features/auth/server/route"

// const app = new Hono().basePath("/api");

// const routes=app
//     .route("/auth",auth)

// export const GET =handle(app);
// export const POST=handle(app);

// export type AppType =typeof routes;