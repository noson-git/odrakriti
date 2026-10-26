/**
 * Odrakriti — Textile reference catalog (MODULAR / PILOT)
 * ------------------------------------------------------------------
 * SCOPE NOTE (do not silently change):
 *   The student has NOT locked the final two-or-three textile scope.
 *   All four traditions below are recorded as *candidates*.
 *   `featuredInPilot: true` is what decides what the buyer-facing
 *   catalog shows. The UI additionally renders a pilot notice because
 *   the selection is not final.
 *
 * PROVENANCE NOTE:
 *   Every reference below was supplied to this project as a
 *   source-matched citation from the Government of India, Ministry of
 *   Textiles Odisha weaver database PDF:
 *   https://handlooms.nic.in/assets/img/Weavers%20Database/Odisha637322660372253324.pdf
 *   Those page/entry references were provided by the student and are
 *   recorded here as supplied. The build environment could not reach
 *   handlooms.nic.in to re-open the PDF, so they are flagged
 *   `verifiedInBuild: false`.
 *
 *   A source-matched citation is NOT authentication and NOT a reuse
 *   licence. No photograph is reproduced anywhere in this prototype.
 */

/** The single source document every citation points at. */
export const SOURCE_PDF = {
  id: "mot-odisha-weavers-db",
  publisher: "Government of India, Ministry of Textiles — Office of the Development Commissioner for Handlooms",
  title: "Weavers Database — Odisha",
  url: "https://handlooms.nic.in/assets/img/Weavers%20Database/Odisha637322660372253324.pdf",
  reVerifiedInBuild: false,
  reVerifyNote:
    "Page and entry numbers were supplied as source-matched references. They were not independently re-opened during this build (handlooms.nic.in was unreachable from the build environment).",
};

/**
 * Textile traditions.
 *
 * `technique` and `motifs` hold ONLY what the cited entry describes.
 * Where the cited entry is silent, the field is an explicit "not stated"
 * string rather than a guess.
 */
export const TEXTILES = [
  {
    id: "sambalpuri-ikat",
    slug: "sambalpuri-ikat-bandha",
    name: "Sambalpuri Ikat (Bandha)",
    shortName: "Sambalpuri Ikat",
    /** Student has not locked the final 2–3 list. */
    candidate: true,
    featuredInPilot: true,
    region: "Bargarh area, Odisha (as named in the cited entry)",
    community: null, // not stated in the cited entry — do not assert
    communityNote: "Specific weaving community not stated in the cited entry; not asserted here.",
    fibre: "Cotton (as described in the cited entry)",
    technique: "Double ikat (Bandha) — warp and weft resist-dyed before weaving",
    techniqueDetail:
      "The cited entry describes a cotton double-ikat example carrying Bichitrapuri motifs.",
    motifs: "Bichitrapuri motifs (as described in this specific example)",
    motifCaveat:
      "Motifs are described for this one cited example only. They are not generalised to every Sambalpuri Ikat textile.",
    colorways: null, // not stated in the cited entry — do not assert
    colorwayNote: "Dye colours are not stated in the cited entry; no colour is claimed as traditional.",
    citation: {
      page: 12,
      entry: "Entry 3",
      attributedTo: "Shri Rajendra Meher (named in the cited database entry)",
    },
    permission: {
      status: "pending",
      label: "Permission not confirmed",
      detail:
        "No permission has been obtained from the artisan, cooperative, or rights holder. No photograph from the source PDF is reproduced in this prototype.",
    },
  },
  {
    id: "bomkai-sonepuri",
    slug: "bomkai-sonepuri",
    name: "Bomkai / Sonepuri",
    shortName: "Bomkai",
    candidate: true,
    featuredInPilot: true,
    region: "Odisha (as listed in the cited Odisha weaver database)",
    community: null,
    communityNote: "Specific weaving community not stated in the cited entry; not asserted here.",
    fibre: "Silk (the cited example is a 'Bomkai Silk Saree')",
    technique: "Extra-warp border work with extra-weft pallu work",
    techniqueDetail:
      "The cited 'Bomkai Silk Saree' example describes extra-warp border work and extra-weft pallu work.",
    motifs: "Not stated in the cited entry",
    motifCaveat:
      "Described for this one cited Bomkai silk example only, and not generalised to every Bomkai — variants differ, so do not assume every Bomkai looks the same.",
    colorways: null,
    colorwayNote: "Dye colours are not stated in the cited entry; no colour is claimed as traditional.",
    citation: {
      page: 14,
      entry: "'Bomkai Silk Saree' section",
      attributedTo: null,
    },
    permission: {
      status: "pending",
      label: "Permission not confirmed",
      detail:
        "No permission has been obtained from the artisan, cooperative, or rights holder. No photograph from the source PDF is reproduced in this prototype.",
    },
  },
  {
    id: "kotpad",
    slug: "kotpad",
    name: "Kotpad",
    shortName: "Kotpad",
    candidate: true,
    featuredInPilot: true,
    region: "Odisha (as listed in the cited Odisha weaver database)",
    community: null,
    communityNote:
      "Community is not named in the cited entry. Avoid labels such as 'tribal pattern' unless a community and source are clearly identified and permission is appropriate.",
    fibre: "Cotton, vegetable-dyed",
    technique: "Vegetable dyeing using Aal-root dye; solid border",
    techniqueDetail:
      "The cited entry describes vegetable-dyed cotton using Aal-root dye, a solid border, and traditional motifs.",
    motifs: "Traditional motifs (as described in the cited entry; specific motif names not listed)",
    motifCaveat:
      "The cited entry names no individual motifs, so none are named here.",
    colorways: null,
    colorwayNote:
      "The cited entry states Aal-root vegetable dye but does not enumerate specific shades; no exact colour is claimed.",
    citation: {
      page: 15,
      entry: "Entry for Shri Gobardhan Panika",
      attributedTo: "Shri Gobardhan Panika (named in the cited database entry)",
    },
    permission: {
      status: "pending",
      label: "Permission not confirmed",
      detail:
        "No permission has been obtained from the artisan, cooperative, or rights holder. No photograph from the source PDF is reproduced in this prototype.",
    },
  },
  {
    id: "berhampur-patta",
    slug: "berhampur-patta",
    name: "Berhampur Patta",
    shortName: "Berhampur Patta",
    candidate: true,
    featuredInPilot: true,
    region: "Odisha (as listed in the cited Odisha weaver database)",
    community: null,
    communityNote: "Specific weaving community not stated in the cited entry; not asserted here.",
    fibre: "Not stated in the cited entry (traditionally a silk weave; not asserted here)",
    technique: "Phoda Kumbha / temple-style border work with extra-weft 'Salari' anchal",
    techniqueDetail:
      "The cited entry describes Phoda Kumbha / temple-style border work and an extra-weft 'Salari' anchal.",
    motifs: "Phoda Kumbha (temple-style) border; 'Salari' anchal in extra weft",
    motifCaveat:
      "Described for this one cited example only; not generalised to all Berhampur Patta.",
    colorways: null,
    colorwayNote: "Dye colours are not stated in the cited entry; no colour is claimed as traditional.",
    citation: {
      page: 19,
      entry: "Entry 13",
      attributedTo: null,
    },
    permission: {
      status: "pending",
      label: "Permission not confirmed",
      detail:
        "No permission has been obtained from the artisan, cooperative, or rights holder. No photograph from the source PDF is reproduced in this prototype.",
    },
  },
];

export function getTextile(id) {
  return TEXTILES.find((t) => t.id === id) || null;
}

/** Buyer-facing list. Kept as a function so scope can be narrowed in one place. */
export function pilotTextiles() {
  return TEXTILES.filter((t) => t.featuredInPilot);
}

/** True while the student has not locked the final 2–3 textile scope. */
export const SCOPE_LOCKED = false;

export const PILOT_NOTICE =
  "Pilot demo catalog. The final selection of two or three handloom traditions is not locked; every entry below is a candidate reference, not a confirmed product line.";
