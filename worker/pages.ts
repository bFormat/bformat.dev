import worker from "../dist/server/index.js";

interface PagesEnv {
  ASSETS: Fetcher;
}

const pagesWorker = {
  async fetch(request: Request, env: PagesEnv, ctx: ExecutionContext) {
    const asset = await env.ASSETS.fetch(request);
    if (asset.status !== 404) return asset;

    return worker.fetch(request, env, ctx);
  },
};

export default pagesWorker;
