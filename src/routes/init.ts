import type { Request, Response } from "express";
import { generatePages } from "../generate";

export async function init(_req: Request, res: Response) {
  await generatePages(() => res.redirect("/"));
}
