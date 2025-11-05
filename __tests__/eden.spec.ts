import { describe, expect, expectTypeOf, it } from "bun:test";
import { treaty } from "@elysiajs/eden";
import Elysia from "elysia";
import { HttpError, httpProblemJsonPlugin } from "../src";

describe("@elysiajs/eden", () => {
  it("should generate types correctly", () => {
    const app = new Elysia()
      .use(httpProblemJsonPlugin())
      .get("/foo", () => ({ bar: "baz" }));

    type App = typeof app;

    const client = treaty<App>("");

    type FooResponse = Awaited<ReturnType<typeof client.foo.get>>;

    expectTypeOf<FooResponse["data"]>().toEqualTypeOf<{ bar: string } | null>();
    expectTypeOf<FooResponse["error"]>();
  });

  it("should work", async () => {
    const app = new Elysia()
      .use(httpProblemJsonPlugin())
      .get("/foo", () => ({ bar: "baz" }))
      .listen(0);

    const client = treaty<typeof app>(`http://localhost:${app.server?.port}`);

    const res = await client.foo.get();
    if (res.error) throw new Error("error should be null");
    expect(res.data).toEqual({ bar: "baz" });
    expectTypeOf(res.data).toEqualTypeOf<{ bar: string }>();
  });

  it("should type the error correctly", async () => {
    const app = new Elysia()
      .use(httpProblemJsonPlugin())
      .get("/error", () => {
        throw new HttpError.BadRequest("Bad request error");
      })
      .listen(0);

    const client = treaty<typeof app>(`http://localhost:${app.server?.port}`);

    const res = await client.error.get();
    expect(res.error).toBeDefined();
  });
});
