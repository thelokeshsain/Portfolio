import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth";
import Portfolio from "@/models/Portfolio";
import toPublicPortfolio from "@/utils/publicPortfolio";
import cache from "@/utils/responseCache";
import { isSafeUrl } from "@/utils/validate";

function stripMongoFields(payload) {
  if (Array.isArray(payload)) {
    return payload.map((item) => {
      if (item && typeof item === "object") {
        const { _id, __v, ...rest } = item;
        const cleaned = {};
        for (const [k, v] of Object.entries(rest)) {
          cleaned[k] = Array.isArray(v)
            ? v.map((x) =>
                x && typeof x === "object"
                  ? (({ _id: _a, __v: _b, ...r }) => r)(x)
                  : x
              )
            : v;
        }
        return cleaned;
      }
      return item;
    });
  }
  if (payload && typeof payload === "object") {
    const { _id, __v, ...rest } = payload;
    return rest;
  }
  return payload;
}

function validateBase64Image(dataUrl) {
  if (!dataUrl) return { ok: true };
  if (typeof dataUrl !== "string")
    return { ok: false, msg: "Image must be a string" };

  const match = dataUrl.match(/^data:(image\/(jpeg|png|webp|gif));base64,/);
  if (!match)
    return {
      ok: false,
      msg: "Image must be JPEG, PNG, WebP, or GIF (not SVG or other formats)",
    };

  const b64 = dataUrl.split(",")[1];
  if (!b64) return { ok: false, msg: "Invalid image data" };

  const approxBytes = Math.ceil(b64.length * 0.75);
  if (approxBytes > 2 * 1024 * 1024)
    return { ok: false, msg: "Image must be under 2MB" };

  const bytes = Buffer.from(b64.slice(0, 16), "base64");
  const hex = bytes.toString("hex");

  const MAGIC = {
    ffd8ff: "jpeg",
    "89504e47": "png",
    52494646: "webp",
    47494638: "gif",
  };

  const matchesMagic = Object.keys(MAGIC).some((magic) =>
    hex.startsWith(magic)
  );
  if (!matchesMagic)
    return {
      ok: false,
      msg: "Image content does not match its declared format",
    };

  return { ok: true };
}

function recursivelyValidateUrls(obj, path = "") {
  if (!obj) return { ok: true };

  if (typeof obj === "string") {
    const looksLikeUrl = obj.includes("://") || obj.startsWith("/");
    if (looksLikeUrl && !isSafeUrl(obj)) {
      return {
        ok: false,
        msg: `Invalid URL detected at ${path}: protocol must be http:// or https://`,
      };
    }
    return { ok: true };
  }

  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      const res = recursivelyValidateUrls(obj[i], `${path}[${i}]`);
      if (!res.ok) return res;
    }
    return { ok: true };
  }

  if (typeof obj === "object") {
    for (const [key, val] of Object.entries(obj)) {
      const res = recursivelyValidateUrls(val, path ? `${path}.${key}` : key);
      if (!res.ok) return res;
    }
  }

  return { ok: true };
}

export const PUT = withAuth(async (request, context) => {
  try {
    // Next.js passes context as second argument, we can await params in Next.js 14/15
    const params = await context.params;
    const section = params.section;

    const ALLOWED = new Set([
      "hero",
      "stats",
      "about",
      "education",
      "achievements",
      "experience",
      "projects",
      "skills",
      "coreStack",
      "sections",
    ]);

    if (!ALLOWED.has(section)) {
      return NextResponse.json(
        { message: `Unknown section: ${section}` },
        { status: 400 }
      );
    }

    const body = await request.json();
    const cleanPayload = stripMongoFields(body);

    const protocolCheck = recursivelyValidateUrls(cleanPayload);
    if (!protocolCheck.ok) {
      return NextResponse.json({ message: protocolCheck.msg }, { status: 422 });
    }

    if (section === "hero" && cleanPayload?.image) {
      const imgCheck = validateBase64Image(cleanPayload.image);
      if (!imgCheck.ok) {
        return NextResponse.json({ message: imgCheck.msg }, { status: 422 });
      }
    }
    
    if (section === "projects" && Array.isArray(cleanPayload)) {
      for (const p of cleanPayload) {
        if (p.image) {
          const imgCheck = validateBase64Image(p.image);
          if (!imgCheck.ok) {
            return NextResponse.json({ message: imgCheck.msg }, { status: 422 });
          }
        }
      }
    }

    const updatedPortfolio = await Portfolio.findOneAndUpdate(
      {},
      { $set: { [section]: cleanPayload } },
      { new: true, upsert: true, runValidators: true }
    ).lean();

    cache.set("portfolio", toPublicPortfolio(updatedPortfolio), 300);

    return NextResponse.json({
      message: "Updated successfully",
      [section]: updatedPortfolio[section],
    });
  } catch (err) {
    console.error("[UpdateSection]", err.message);
    return NextResponse.json(
      { message: "Update failed — please try again" },
      { status: 500 }
    );
  }
});
