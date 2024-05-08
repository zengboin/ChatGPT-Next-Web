import { NextRequest, NextResponse } from "next/server";
import { prettyObject } from "@/app/utils/format";

const LOGIN_URL =
  "https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyPassword?key=AIzaSyDsPi_DksHWxdaO8VQhKj5yUw0AOrj8RN0";
const REFESH_URL =
  "https://securetoken.googleapis.com/v1/token?key=AIzaSyDsPi_DksHWxdaO8VQhKj5yUw0AOrj8RN0";

async function handle(
  req: NextRequest,
  { params }: { params: { path: string[] } },
) {
  if (req.method === "OPTIONS") {
    return NextResponse.json({ body: "OK" }, { status: 200 });
  }
  try {
    const response = await request(req);
    return response;
  } catch (e) {
    console.error("[Anthropic] ", e);
    return NextResponse.json(prettyObject(e));
  }
}

export const POST = handle;

export const runtime = "edge";
export const preferredRegion = [
  "arn1",
  "bom1",
  "cdg1",
  "cle1",
  "cpt1",
  "dub1",
  "fra1",
  "gru1",
  "hnd1",
  "iad1",
  "icn1",
  "kix1",
  "lhr1",
  "pdx1",
  "sfo1",
  "sin1",
  "syd1",
];

async function request(req: NextRequest) {
  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => {
      controller.abort();
    },
    10 * 60 * 1000,
  );
  var fetchUrl = "";

  if (req.nextUrl.pathname === "/api/arc/verifyPassword") {
    fetchUrl = LOGIN_URL;
  } else if (req.nextUrl.pathname === "/api/arc/token") {
    fetchUrl = REFESH_URL;
  }

  const fetchOptions: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
    method: req.method,
    body: req.body,
    redirect: "manual",
    // @ts-ignore
    duplex: "half",
    signal: controller.signal,
  };
  try {
    const res = await fetch(fetchUrl, fetchOptions);

    console.log("[Arc response]", res.status, "   ", res.headers, res.url);
    // to prevent browser prompt for credentials
    const newHeaders = new Headers(res.headers);
    newHeaders.delete("www-authenticate");
    // to disable nginx buffering
    newHeaders.set("X-Accel-Buffering", "no");

    return new Response(res.body, {
      status: res.status,
      statusText: res.statusText,
      headers: newHeaders,
    });
  } finally {
    clearTimeout(timeoutId);
  }
}
