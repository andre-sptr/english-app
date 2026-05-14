import { checkAndIncrementSession } from "@/lib/firebase";

export async function POST(request: Request) {
  const { uid, type } = await request.json() as {
    uid: string;
    type: "speaking" | "writing";
  };

  if (!uid || !type) {
    return Response.json({ error: "Missing uid or type" }, { status: 400 });
  }

  const result = await checkAndIncrementSession(uid, type);
  return Response.json(result);
}
