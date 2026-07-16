import assert from "node:assert/strict";
import test from "node:test";

const codexPreviewMeta = /<meta[^>]*\bname=["']codex-preview["'][^>]*>/i;

test("renders production HTML with deployable font URLs", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  const response = await worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );

  assert.equal(response.status, 200);
  assert.match(
    response.headers.get("content-type") ?? "",
    /^text\/html\b/i,
  );
  const html = await response.text();
  assert.match(html, /<title>bformat\.dev — 전승민<\/title>/i);
  assert.match(html, /\/assets\/_vinext_fonts\//);
  assert.doesNotMatch(html, /\/workspace\/sites\/bformat-dev\//);
  assert.doesNotMatch(html, codexPreviewMeta);
});
