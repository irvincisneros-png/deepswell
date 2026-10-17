# Content brief for DeepSwell ecosystem files (for content-writing agents)

Write ONE ES module `src/content/<eco>.js` exporting `species` and `missions`, exactly in the shape of the existing reference file
`src/content/gbr.js` (read it first and match field names, tone, length and Australian English spelling).

Species object fields (all required, non-empty): id, common, sci, group (fish | shark | ray | reptile | mammal | bird | invertebrate | coral | algae | plant), feeding
(herbivore | carnivore | omnivore | planktivore | corallivore | detritivore | filter feeder | mixotroph | photosynthetic | scavenger),
trophic, size, depth, status (IUCN text; add national/NSW listing in brackets if notable), statusCode (LC NT VU EN CR DD NE),
role, interactions (1–3 strings), didYouKnow, fieldNotes (2–4 sentences), spot (must match the in-game behaviour listed), threats, sources (1–3 short citations).

Mission objects: { id, title, brief, goal, hint, questions: [ {q, options[4], answer (index), explain} ×3 ] }.
Keep each `goal` object EXACTLY as given in the per-ecosystem list. Allowed goal types: 'surf-ride' {minScore},
'photo-species' {count, filter:{group: '<group>' | [..groups]}} , 'photo-behaviour' {behaviour}, 'lab' {condition}, 'depth' {metres}.

Accuracy is critical — a teacher will use this with 14–16 year-olds. Verify IUCN statuses and any numbers with web search.
After writing, run: node -e "import('./src/content/<eco>.js').then(m=>console.log(m.species.length, m.missions.length))"
from the repo root (/Users/irvincisneros/Documents/Local Projects/Science Simulator Website/deepswell) and also `npm test`.
Report back only the counts and any facts you were unsure about. Do not edit any other file.
