import { prisma } from "@/lib/db/prisma";
import { SimulatedRegistrar } from "./simulated.adapter";

// Singleton registrar instance
export const registrar = new SimulatedRegistrar(prisma);
