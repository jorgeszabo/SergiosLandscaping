/* ---------------------------------------------------------------------------
   Integration seam — "customer in" (Code handoff §7, requirements §9).
   Customers can be created in this app OR received from an external system.
   This adapter maps an external customer record into our Customer shape, so the
   app never assumes it is the sole owner of customer identity.
   --------------------------------------------------------------------------- */
import type { Customer } from "@/lib/data/types";
import { uid } from "@/lib/data/id";

/** The minimal shape we expect from a partner platform's customer feed. */
export interface ExternalCustomer {
  id: string;
  source: string;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  contact?: string;
}

export function fromExternalCustomer(ext: ExternalCustomer): Customer {
  const cityLine = [ext.city, ext.state, ext.zip].filter(Boolean).join(", ");
  return {
    id: uid(),
    name: ext.name,
    address: ext.address || "",
    city: cityLine,
    contact: ext.contact,
    externalId: ext.id,
    externalSource: ext.source,
  };
}
