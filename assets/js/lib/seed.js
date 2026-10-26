/**
 * Odrakriti — demo seed data.
 *
 * One clearly-labelled demo request so the artisan portal is never an
 * empty screen. It carries no price, because the whole point is that a
 * price cannot exist before review.
 */

import { createRequest } from "./requests.js";
import { TEXTILES } from "../data/textiles.js";
import { DESIGN_ASSETS, ASSET_KIND } from "../data/assets.js";

export function makeDemoSeed() {
  const textile = TEXTILES[0];
  if (!textile) return null;

  const asset =
    DESIGN_ASSETS.find((a) => a.kind === ASSET_KIND.PLAIN) || DESIGN_ASSETS[0] || null;

  const request = createRequest(
    {
      textileId: textile.id,
      garmentId: "kurti",
      styleId: "minimal",
      designPath: "curated",
      assetId: asset ? asset.id : null,
      concept: null,
      colourwayId: "ivory",
      placementId: "hem-border",
      fabricPreference: "artisan-to-advise",
      sizeOrMeasurement: "chart",
      size: "M",
      measurements: null,
      buyerName: "Demo Buyer",
      buyerContact: "demo.buyer@example.invalid",
      notes:
        "Demo request. Looking for a plain everyday kurti with a narrow accent at the hem. Happy for the artisan to advise on the best production method.",
    },
    { id: "ODK-DEMO-0001", now: new Date() }
  );

  request.demoSeed = true;
  return request;
}
