// DeepSwell – NSW rocky reef & kelp forest content (species + missions)
// Site: Illawarra coast near Woonona/Bellambi, NSW – temperate reef, 0–18 m, East Australian Current (EAC) influence.
// Data only. Australian English. IUCN statuses checked October 2026.
// Notes for teachers:
//  - Eastern blue groper: IUCN Near Threatened. It is the NSW state fish emblem. Spearfishing and commercial
//    fishing for it are banned in NSW, and line fishing has been prohibited since March 2024 (extended for three
//    years from 1 March 2025). Check current NSW DPI rules before quoting dates.
//  - Weedy (common) seadragon: reassessed by the IUCN as Vulnerable (assessed 2024, published 2025); it was
//    previously Least Concern. All seadragons, seahorses and pipefish are protected in NSW waters.
//  - Grey nurse shark: Critically Endangered globally (IUCN) and the east coast population is listed as
//    Critically Endangered under the EPBC Act.
//  - Blacklip abalone: IUCN Vulnerable (2021 assessment).
//  - Spotted wobbegong: IUCN Least Concern since 2015 (previously Near Threatened).
//  - Several common NSW reef fish (red morwong, mado, luderick, eastern blue devil) have not been evaluated by the IUCN.

export const species = [
  {
    id: 'bluegroper',
    common: 'Eastern blue groper',
    sci: 'Achoerodus viridis',
    group: 'fish',
    feeding: 'carnivore',
    trophic: 'Tertiary consumer',
    size: 'Up to about 1 m',
    depth: '1–60 m',
    status: 'Near Threatened (NSW state fish; spearfishing, commercial and line fishing banned in NSW)',
    statusCode: 'NT',
    role: 'A large reef predator that crunches sea urchins, crabs and molluscs, helping stop urchins from overgrazing the kelp.',
    interactions: [
      'Preys on long-spined sea urchins (Centrostephanus rodgersii), helping protect kelp forests',
      'Eats crabs, shrimps and molluscs, and also cunjevoi (Pyura praeputialis)',
      'Juveniles shelter in estuary seagrass beds before moving to the reef'
    ],
    didYouKnow: 'The eastern blue groper is the official fish emblem of New South Wales – and most gropers start life as brown or green females before some turn into blue males.',
    fieldNotes: 'Blue gropers are wrasses and protogynous hermaphrodites: every fish starts life as a female, and some change into males once they reach about 60 cm. Thick lips and strong peg-like teeth, plus a second set of grinding teeth in the throat, let them crush shells and spiny urchins. After heavy spearfishing in the 1960s, NSW banned spearing them in 1969, and they are now so used to divers that they often swim right up to have a look.',
    spot: 'Look for a big, curious blue or brown fish with thick lips that swims over and follows you around the reef – watch it crunch an urchin or crab.',
    threats: 'Historically overfished by spearfishers; slow growth and late sex change make it vulnerable to fishing pressure and warming seas.',
    sources: [
      'IUCN Red List – Achoerodus viridis (Near Threatened)',
      'NSW DPI – Eastern Blue Groper line fishing prohibition',
      'Australian Museum – Eastern Blue Groper'
    ]
  },
  {
    id: 'redmorwong',
    common: 'Red morwong',
    sci: 'Cheilodactylus fuscus',
    group: 'fish',
    feeding: 'carnivore',
    trophic: 'Secondary consumer',
    size: 'Up to 65 cm',
    depth: '1–30 m',
    status: 'Not Evaluated',
    statusCode: 'NE',
    role: 'A bottom-feeding predator that sifts invertebrates from the reef and sand, linking small animals to bigger predators.',
    interactions: [
      'Eats worms, crabs, amphipods, snails and small bivalves picked from the bottom',
      'Rests in groups on the same rocks day after day (site attachment)',
      'Preyed on by larger predators such as wobbegongs and grey nurse sharks'
    ],
    didYouKnow: 'Red morwong often rest propped up on their thick, finger-like lower pectoral fins, as if leaning on their elbows.',
    fieldNotes: 'Red morwong live in groups of a few to around 100 fish that break up at night, and they are most active at dawn and dusk. Adults have small home ranges and return to the same resting spots, so a local population can be fished out quickly. Males have bigger bony bumps on the head than females.',
    spot: 'Look for reddish-orange fish with pale stripes resting motionless on rocks and kelp edges – they only move off when you get very close.',
    threats: 'Spearfishing and line fishing; because they stay in one place and grow slowly, local populations are easily overfished.',
    sources: [
      'FishBase – Cheilodactylus fuscus',
      'Australian Museum – Red Morwong',
      'Reef Life Survey – Cheilodactylus fuscus'
    ]
  },
  {
    id: 'mado',
    common: 'Mado',
    sci: 'Atypichthys strigatus',
    group: 'fish',
    feeding: 'omnivore',
    trophic: 'Secondary consumer',
    size: 'Up to 25 cm',
    depth: '1–30 m',
    status: 'Not Evaluated',
    statusCode: 'NE',
    role: 'One of the most common fish on NSW reefs; it eats plankton and small invertebrates and is food for many predators.',
    interactions: [
      'Picks zooplankton and small invertebrates from the water and reef',
      'Schools with other small fish around boulders for safety in numbers',
      'Hunted by yellowtail kingfish, snapper and wobbegongs'
    ],
    didYouKnow: 'Mado are found only in the south-west Pacific – mainly south-eastern Australia, plus Lord Howe Island, Norfolk Island and northern New Zealand.',
    fieldNotes: 'Mado are easy to recognise by their yellow-and-black horizontal stripes and deep, flattened bodies. They hang around boulders, wharf pylons and ledges in loose groups. Because they eat both plankton and bottom-living animals, they are a flexible link in the reef food web.',
    spot: 'Look for loose schools of small yellow-and-black striped fish hovering around boulders.',
    threats: 'Generally common; affected by loss of reef habitat and pollution near cities.',
    sources: [
      'FishBase – Atypichthys strigatus',
      'Australian Museum – Mado',
      'Reef Life Survey – Atypichthys strigatus'
    ]
  },
  {
    id: 'luderick',
    common: 'Luderick (blackfish)',
    sci: 'Girella tricuspidata',
    group: 'fish',
    feeding: 'herbivore',
    trophic: 'Primary consumer (adults)',
    size: 'Up to about 70 cm, usually 30–40 cm',
    depth: '0–20 m',
    status: 'Not Evaluated',
    statusCode: 'NE',
    role: 'A grazer that crops algae off rocks, helping control seaweed growth on shallow reefs and in estuaries.',
    interactions: [
      'Grazes green and red algae from rocks (and seagrass in estuaries)',
      'Competes with sea urchins and other grazers for algae',
      'Hunted by kingfish, wobbegongs and other large predators'
    ],
    didYouKnow: 'Anglers catch luderick using green weed as bait – one of the few fish in Australia caught on a seaweed bait.',
    fieldNotes: 'Juvenile luderick eat small invertebrates, but adults switch mainly to algae – their small, three-pointed teeth (tricuspidata means "three points") are made for nipping seaweed. They move between estuaries and coastal reefs, and adults travel to ocean bars and headlands to spawn. Luderick can live for more than 20 years.',
    spot: 'Look for small schools of dark grey fish with thin vertical bars grazing algae off the rocks in the shallows.',
    threats: 'Fishing pressure and loss of estuary habitat such as seagrass beds.',
    sources: [
      'FishBase – Girella tricuspidata',
      'Australian Museum – Luderick',
      'NSW DPI – Luderick fishing guide'
    ]
  },
  {
    id: 'kingfish',
    common: 'Yellowtail kingfish',
    sci: 'Seriola lalandi',
    group: 'fish',
    feeding: 'carnivore',
    trophic: 'Tertiary consumer',
    size: 'Up to 2.5 m',
    depth: '3–300 m',
    status: 'Least Concern',
    statusCode: 'LC',
    role: 'A fast, schooling predator that hunts baitfish and squid along the reef edge.',
    interactions: [
      'Preys on small fish such as mado and yellowtail scad, plus squid',
      'Hunts in schools, herding prey together',
      'Large adults can be eaten by sharks'
    ],
    didYouKnow: 'Yellowtail kingfish are now farmed in sea cages in South Australia – an example of Australian aquaculture.',
    fieldNotes: 'Kingfish are powerful, streamlined fish in the same family as trevally (Carangidae), with a bright yellow tail and a gold stripe along the side. Young fish school tightly, while very large adults may roam alone or in small groups. They are a prized catch for recreational fishers, so NSW has size and bag limits to protect breeding stocks.',
    spot: 'Look out along the reef edge for a fast school of silver fish with bright yellow tails patrolling past you.',
    threats: 'Heavy recreational and commercial fishing; generally widespread and secure.',
    sources: [
      'IUCN Red List – Seriola lalandi',
      'FishBase – Seriola lalandi',
      'NSW DPI – Yellowtail kingfish'
    ]
  },
  {
    id: 'oldwife',
    common: 'Old wife',
    sci: 'Enoplosus armatus',
    group: 'fish',
    feeding: 'carnivore',
    trophic: 'Secondary consumer',
    size: 'Usually under 25 cm, up to 50 cm',
    depth: '1–90 m',
    status: 'Least Concern',
    statusCode: 'LC',
    role: 'Eats small crustaceans and worms around kelp and rocks, and is the only living member of its family.',
    interactions: [
      'Feeds on small crustaceans, worms and zooplankton',
      'Uses venomous dorsal spines to defend itself from predators',
      'Shelters in and around golden kelp (Ecklonia radiata)'
    ],
    didYouKnow: 'The old wife is the only living species in the family Enoplosidae, and it is found only in southern Australia.',
    fieldNotes: 'Its bold black-and-white bars help break up its outline among kelp stalks. The tall dorsal fins carry sharp spines with mild venom that can give a painful sting, so it should never be handled. Adults are often seen in pairs, while juveniles may form small groups.',
    spot: 'Look for pairs of black-and-white striped fish with tall fins hovering near the kelp.',
    threats: 'Habitat loss and occasional bycatch; generally secure.',
    sources: [
      'IUCN Red List 2019 – Enoplosus armatus',
      'FishBase – Enoplosus armatus',
      'Australian Museum – Old Wife'
    ]
  },
  {
    id: 'snapper',
    common: 'Australasian snapper',
    sci: 'Chrysophrys auratus',
    group: 'fish',
    feeding: 'carnivore',
    trophic: 'Tertiary consumer',
    size: 'Up to 1.3 m',
    depth: '0–200 m',
    status: 'Least Concern',
    statusCode: 'LC',
    role: 'A roaming predator of the sand–reef edge that eats crabs, urchins, molluscs and small fish.',
    interactions: [
      'Eats crabs, sea urchins, molluscs, worms and small fish',
      'Helps keep urchin numbers in check alongside gropers and lobsters',
      'Hunted when young by larger fish and sharks'
    ],
    didYouKnow: 'Snapper can live for around 40 years – scientists have confirmed their age using radiocarbon from 1950s–60s nuclear tests locked in their ear bones (otoliths).',
    fieldNotes: 'Snapper are pinkish-silver with bright blue spots that fade as they grow. Large old snapper develop a bulging hump on the forehead and fleshy lips. They are one of the most important recreational fish in Australia, so their populations are carefully managed with size and bag limits.',
    spot: 'Look for a pink fish with blue spots wandering slowly over the sand at the edge of the reef.',
    threats: 'Fishing pressure has depleted some stocks; managed with size and bag limits.',
    sources: [
      'IUCN Red List – Chrysophrys auratus',
      'FishBase – Chrysophrys auratus',
      'Status of Australian Fish Stocks – Snapper'
    ]
  },
  {
    id: 'easternbluedevil',
    common: 'Eastern blue devil',
    sci: 'Paraplesiops bleekeri',
    group: 'fish',
    feeding: 'carnivore',
    trophic: 'Secondary consumer',
    size: 'Up to 40 cm',
    depth: '3–30 m',
    status: 'Not Evaluated (protected in NSW – must not be taken)',
    statusCode: 'NE',
    role: 'A shy cave-dwelling predator that ambushes small fish and crustaceans in ledges and crevices.',
    interactions: [
      'Ambushes small fish and crustaceans near its shelter',
      'Shares caves and ledges with rock lobsters and Port Jackson sharks',
      'Hides deep in crevices from larger predators'
    ],
    didYouKnow: 'The eastern blue devil is found only along the coast of eastern Australia, and it is a protected species in NSW – it cannot be caught or collected.',
    fieldNotes: 'Its deep blue body with white bands and yellow-orange tail and fins make it one of the most colourful fish on NSW reefs. It is territorial and stays in or near the same cave or ledge for long periods. Its beauty once made it a target for aquarium collectors, which is one reason it was protected.',
    spot: 'Peer into dark ledges for a shy, bright blue fish with white bands – it slips back into the crevice if you get too close.',
    threats: 'Illegal collection for aquariums and disturbance of cave habitat.',
    sources: [
      'NSW DPI – Threatened and protected species: Eastern Blue Devil',
      'FishBase – Paraplesiops bleekeri',
      'Australian Museum – Eastern Blue Devilfish'
    ]
  },
  {
    id: 'weedyseadragon',
    common: 'Weedy (common) seadragon',
    sci: 'Phyllopteryx taeniolatus',
    group: 'fish',
    feeding: 'carnivore',
    trophic: 'Secondary consumer',
    size: 'Up to 46 cm',
    depth: '0–50 m',
    status: 'Vulnerable (IUCN 2025); protected in NSW',
    statusCode: 'VU',
    role: 'A small, slow predator that sucks up tiny crustaceans such as mysid shrimps among the kelp and weed.',
    interactions: [
      'Sucks up mysid shrimps and amphipods through its tube-shaped snout',
      'Relies on kelp and weed beds for camouflage and shelter',
      'Its leaf-like appendages mimic seaweed to avoid predators'
    ],
    didYouKnow: 'Like seahorses, it is the male seadragon that carries the eggs – stuck to a brood patch under his tail – until they hatch.',
    fieldNotes: 'Seadragons are found only in southern Australian waters. The female lays up to about 250 eggs onto the underside of the male\'s tail, where they develop for around a month before hatching. In 2025 the IUCN changed its status from Least Concern to Vulnerable because of declines linked to warming seas and loss of kelp and weed habitat.',
    spot: 'Search slowly through the kelp and weed for what looks like a drifting piece of seaweed – then notice it has an eye and a long snout.',
    threats: 'Loss of kelp and seagrass habitat, marine heatwaves, storms that wash animals ashore, and illegal collection.',
    sources: [
      'IUCN Red List – Phyllopteryx taeniolatus (Vulnerable)',
      'FishBase – Phyllopteryx taeniolatus',
      'Australian Museum – Weedy Seadragon'
    ]
  },
  {
    id: 'greynurse',
    common: 'Grey nurse shark',
    sci: 'Carcharias taurus',
    group: 'shark',
    feeding: 'carnivore',
    trophic: 'Apex / tertiary consumer',
    size: 'Up to 3.2 m',
    depth: '0–190 m (usually 10–40 m off NSW)',
    status: 'Critically Endangered (east coast population Critically Endangered under the EPBC Act)',
    statusCode: 'CR',
    role: 'A top predator that eats fish, rays, squid and smaller sharks, helping regulate the reef food web.',
    interactions: [
      'Preys on fish such as snapper and kingfish, plus rays, squid and smaller sharks',
      'Gathers in rocky gutters and caves, sharing them with other reef animals',
      'Accidentally hooked by fishers (bycatch) – a major threat'
    ],
    didYouKnow: 'Grey nurse sharks gulp air at the surface and hold it in their stomach so they can hover almost motionless in the water.',
    fieldNotes: 'Despite its ragged, protruding teeth, the grey nurse shark is docile and not considered dangerous to divers. Breeding is extremely slow: inside each of the mother\'s two uteruses the first embryo to develop eats its siblings, so only two pups are born, usually every two years. The east coast population fell by more than 90% after spearfishing and fishing in the mid-1900s, and key aggregation sites in NSW are now protected as critical habitat.',
    spot: 'Look in the rocky gutters for a big, bronze-grey shark with ragged teeth slowly patrolling and hovering almost still.',
    threats: 'Accidental hooking by line fishing, shark-control nets and very slow breeding.',
    sources: [
      'IUCN Red List – Carcharias taurus (Critically Endangered)',
      'DCCEEW – Carcharias taurus (east coast population) EPBC listing',
      'NSW DPI – Grey nurse shark'
    ]
  },
  {
    id: 'portjackson',
    common: 'Port Jackson shark',
    sci: 'Heterodontus portusjacksoni',
    group: 'shark',
    feeding: 'carnivore',
    trophic: 'Secondary consumer',
    size: 'Up to 1.65 m',
    depth: '0–275 m',
    status: 'Least Concern',
    statusCode: 'LC',
    role: 'A bottom-feeding shark that crushes sea urchins, crabs and molluscs, helping control urchin numbers.',
    interactions: [
      'Crushes sea urchins (including Centrostephanus rodgersii), crabs and molluscs',
      'Shares caves and gutters with wobbegongs and blue devils',
      'Its eggs are eaten by snails and other predators'
    ],
    didYouKnow: 'Port Jackson sharks lay spiral, corkscrew-shaped egg cases, which females wedge into rock crevices so they cannot wash away.',
    fieldNotes: 'Its front teeth are small and pointed for gripping, while the back teeth are flat plates for crushing shells and urchin spines. Unlike most sharks it can pump water over its gills while resting still on the bottom. Many adults return to the same reefs every winter and spring to breed, travelling hundreds of kilometres between seasons.',
    spot: 'Look in caves and gutters for a sandy-coloured shark with a harness-like dark pattern resting on the bottom.',
    threats: 'Bycatch in trawl and line fisheries; otherwise common and widespread.',
    sources: [
      'IUCN Red List 2015 – Heterodontus portusjacksoni',
      'Australian Museum – Port Jackson Shark',
      'FishBase – Heterodontus portusjacksoni'
    ]
  },
  {
    id: 'wobbegong',
    common: 'Spotted wobbegong',
    sci: 'Orectolobus maculatus',
    group: 'shark',
    feeding: 'carnivore',
    trophic: 'Tertiary consumer',
    size: 'Usually 1.5–1.8 m, up to about 3 m',
    depth: '0–220 m',
    status: 'Least Concern',
    statusCode: 'LC',
    role: 'An ambush predator that lies hidden on the reef and snaps up fish, octopus and crustaceans that come too close.',
    interactions: [
      'Ambushes fish such as luderick, plus octopus, crabs and rock lobsters',
      'Its camouflage relies on blending into rocks and weed',
      'Can bite divers who touch or step on it (defence)'
    ],
    didYouKnow: '"Wobbegong" is thought to come from an Aboriginal word meaning "shaggy beard" – describing the frilly skin flaps around its mouth.',
    fieldNotes: 'Its blotchy pattern and the fleshy lobes around its mouth break up its outline so well that prey swim right up to it. Wobbegongs mostly hunt at night, lunging with a sudden snap. Females give birth to around 20–37 live pups after a pregnancy of almost a year.',
    spot: 'Look very carefully at the rocks – a patterned, flattened shark lies perfectly still, camouflaged against the reef.',
    threats: 'Commercial and recreational fishing; it was assessed as Near Threatened until 2015, when better management led to Least Concern.',
    sources: [
      'IUCN Red List 2015 – Orectolobus maculatus',
      'Australian Museum – Spotted Wobbegong',
      'Huveneers et al. 2007 – Reproductive biology of wobbegong sharks in NSW'
    ]
  },
  {
    id: 'fiddlerray',
    common: 'Eastern fiddler ray',
    sci: 'Trygonorrhina fasciata',
    group: 'ray',
    feeding: 'carnivore',
    trophic: 'Secondary consumer',
    size: 'Up to about 1.2 m',
    depth: '0–180 m',
    status: 'Least Concern',
    statusCode: 'LC',
    role: 'Feeds on crabs, worms and molluscs buried in the sand at the reef edge, stirring up sediment as it hunts.',
    interactions: [
      'Digs crabs, worms, prawns and molluscs out of the sand',
      'Eaten by larger sharks such as wobbegongs and grey nurse sharks',
      'Fish follow it to snap up animals it disturbs'
    ],
    didYouKnow: 'Despite its name, the fiddler ray is more closely related to guitarfish than to stingrays – and it has no stinging spine.',
    fieldNotes: 'It is named for its violin-like shape and the bold pattern of brown and blue lines on its back. Like other rays it breathes through spiracles behind the eyes while lying on the sand. It is harmless to people and is found only in south-eastern Australia.',
    spot: 'Look on the sand next to the reef for a violin-shaped ray resting on the bottom – get too close and it glides away.',
    threats: 'Bycatch in prawn trawls and line fishing; generally common.',
    sources: [
      'IUCN Red List 2015 – Trygonorrhina fasciata',
      'Australian Museum – Eastern Fiddler Ray',
      'Reef Life Survey – Trygonorrhina fasciata'
    ]
  },
  {
    id: 'octopus',
    common: 'Gloomy octopus',
    sci: 'Octopus tetricus',
    group: 'invertebrate',
    feeding: 'carnivore',
    trophic: 'Secondary consumer',
    size: 'Arm span up to about 2 m',
    depth: '0–70 m',
    status: 'Least Concern',
    statusCode: 'LC',
    role: 'A clever predator of crabs, shellfish and lobsters, and itself food for sharks, gropers and seals.',
    interactions: [
      'Preys on crabs, abalone and other molluscs, drilling or prising them open',
      'Hunted by wobbegongs, blue gropers and fur seals',
      'Piles shells outside its den, creating habitat used by other animals'
    ],
    didYouKnow: 'In Jervis Bay, NSW, scientists discovered two sites nicknamed "Octopolis" and "Octlantis" where many gloomy octopuses live together in dens.',
    fieldNotes: 'Octopuses change colour and skin texture in a fraction of a second using thousands of pigment cells called chromatophores, controlled directly by nerves. They have three hearts and blue, copper-based blood. Gloomy octopuses grow fast and live only about one to two years; females die soon after their eggs hatch.',
    spot: 'Look for a pile of empty shells outside a crevice – an octopus will be sitting in its den, changing colour as you watch.',
    threats: 'Fishing (it is caught for bait and food); generally common.',
    sources: [
      'IUCN Red List – Octopus tetricus',
      'Scheel et al. 2017, Marine and Freshwater Behaviour and Physiology – Octlantis',
      'Australian Museum – Gloomy Octopus'
    ]
  },
  {
    id: 'urchin',
    common: 'Long-spined sea urchin',
    sci: 'Centrostephanus rodgersii',
    group: 'invertebrate',
    feeding: 'herbivore',
    trophic: 'Primary consumer',
    size: 'Body (test) up to about 12 cm across, plus long spines',
    depth: '0–50 m',
    status: 'Not Evaluated',
    statusCode: 'NE',
    role: 'A native grazer that, at high numbers, eats kelp down to bare rock and creates "urchin barrens".',
    interactions: [
      'Grazes golden kelp (Ecklonia radiata) and other seaweeds',
      'Eaten by eastern blue gropers, eastern rock lobsters and Port Jackson sharks',
      'Competes with abalone for food and space'
    ],
    didYouKnow: 'Carried south by the warming East Australian Current, this NSW urchin has spread to Tasmania, where millions now create barrens on reefs that were once kelp forest.',
    fieldNotes: 'By day the urchin hides in crevices; at night it comes out to graze, often returning to the same hole. In parts of NSW, barrens grazed bare by this urchin cover large areas of shallow reef, with only a pink crust of coralline algae left. Its larvae need water above about 12 °C to develop, so as the EAC has pushed warmer water south, the urchin has been able to settle further down the coast.',
    spot: 'Look for black urchins with very long spines grazing the kelp – and patches of bare pink rock where they have cleared it.',
    threats: 'Not threatened – it is itself a threat to kelp forests where its predators have been fished out.',
    sources: [
      'Ling et al. 2009, Global Change Biology – Climate-driven range extension of Centrostephanus rodgersii',
      'Redmap – Sea urchin overgrazing and ocean warming',
      'Andrew & O\'Neill 2000, Marine and Freshwater Research – Barrens habitat in NSW'
    ]
  },
  {
    id: 'abalone',
    common: 'Blacklip abalone',
    sci: 'Haliotis rubra',
    group: 'invertebrate',
    feeding: 'herbivore',
    trophic: 'Primary consumer',
    size: 'Shell up to about 20 cm',
    depth: '0–40 m',
    status: 'Vulnerable',
    statusCode: 'VU',
    role: 'Grazes drifting pieces of kelp and algae trapped against the rock.',
    interactions: [
      'Catches drift kelp and algae under its foot',
      'Competes with long-spined urchins for food and space',
      'Eaten by octopuses, rock lobsters and stingrays'
    ],
    didYouKnow: 'The row of holes in an abalone shell lets water flow out after it has passed over the gills – old holes close over as new ones form.',
    fieldNotes: 'An abalone clamps onto rock with a huge muscular foot so strong that it is very hard to prise off. It is a snail (gastropod) with a single, ear-shaped shell lined with shiny mother-of-pearl. Abalone are one of Australia\'s most valuable seafoods, so fishing is tightly controlled with quotas and size limits.',
    spot: 'Look closely at the rock surface for an oval, ear-shaped shell clinging tight, its black-edged foot frill showing around the rim.',
    threats: 'Overfishing and poaching, disease, marine heatwaves and loss of kelp to urchin barrens.',
    sources: [
      'IUCN Red List 2021 – Haliotis rubra (Vulnerable)',
      'Peters et al. 2024, PLOS ONE – Abalones at risk: a global Red List assessment',
      'NSW DPI – Abalone'
    ]
  },
  {
    id: 'rocklobster',
    common: 'Eastern rock lobster',
    sci: 'Sagmariasus verreauxi',
    group: 'invertebrate',
    feeding: 'omnivore',
    trophic: 'Secondary consumer',
    size: 'Up to about 60 cm body length',
    depth: '0–200 m',
    status: 'Least Concern',
    statusCode: 'LC',
    role: 'A large scavenger and predator of urchins, molluscs and crabs, helping keep urchin numbers under control.',
    interactions: [
      'Preys on sea urchins, abalone, crabs and other invertebrates',
      'Shelters in crevices alongside eastern blue devils and octopuses',
      'Eaten by octopuses, wobbegongs and blue gropers'
    ],
    didYouKnow: 'The eastern rock lobster may be the longest lobster in the world, and its larvae drift in the open ocean for many months before settling on a reef.',
    fieldNotes: 'It has no big claws – instead it defends itself with long, spiny antennae and can make a loud rasping sound by rubbing them. Adults hide in crevices by day and come out at night to feed. In NSW, rock lobsters are managed with size limits and catch quotas.',
    spot: 'Look into crevices for a pair of long, spiny antennae poking out – the lobster is hiding behind them.',
    threats: 'Fishing pressure; managed fishery in NSW.',
    sources: [
      'IUCN Red List – Sagmariasus verreauxi',
      'NSW DPI – Eastern rock lobster',
      'Australian Museum – Eastern Rock Lobster'
    ]
  },
  {
    id: 'cunjevoi',
    common: 'Cunjevoi (sea squirt)',
    sci: 'Pyura praeputialis',
    group: 'invertebrate',
    feeding: 'filter feeder',
    trophic: 'Primary consumer',
    size: 'Individuals up to about 15 cm tall; forms dense mats',
    depth: '0–5 m (intertidal and shallow subtidal)',
    status: 'Not Evaluated',
    statusCode: 'NE',
    role: 'Forms dense beds on rocky shores, filtering plankton from the water and providing shelter for small animals.',
    interactions: [
      'Filters phytoplankton and detritus from the water',
      'Its mats shelter worms, crabs and small molluscs',
      'Eaten by blue gropers; also collected by people for fishing bait'
    ],
    didYouKnow: 'Cunjevoi are chordates – their swimming larvae have a notochord, which makes them closer relatives of fish and humans than of sponges or corals.',
    fieldNotes: 'A cunjevoi is a type of sea squirt (ascidian). It sucks water in through one siphon, strains out food and pushes water out through another, and when squeezed it squirts water out of both. Its tough, leathery outer tunic protects it from waves and drying out at low tide.',
    spot: 'Touch the clumps of leathery lumps on the shallow rocks and watch them squirt jets of water.',
    threats: 'Collection for bait and trampling on rock platforms; collection is restricted in NSW protected areas.',
    sources: [
      'Australian Museum – Cunjevoi',
      'Rius & Teske 2011, Marine Biology Research – Pyura praeputialis taxonomy',
      'NSW DPI – Intertidal protected areas'
    ]
  },
  {
    id: 'kelp',
    common: 'Golden kelp',
    sci: 'Ecklonia radiata',
    group: 'algae',
    feeding: 'photosynthetic',
    trophic: 'Producer',
    size: 'Up to about 2 m tall',
    depth: '0–30 m (deeper in clear water)',
    status: 'Not Evaluated',
    statusCode: 'NE',
    role: 'The main habitat-forming kelp of the Great Southern Reef, creating forests that shelter and feed hundreds of species.',
    interactions: [
      'Grazed by long-spined sea urchins and herbivorous fish',
      'Drift pieces feed abalone and other grazers',
      'Its holdfast and canopy shelter fish, seadragons and invertebrates'
    ],
    didYouKnow: 'Australia\'s Great Southern Reef – the rocky kelp-covered reefs along the southern half of the country – stretches for more than 8000 km of coastline.',
    fieldNotes: 'Golden kelp is a brown alga that grips the rock with a root-like holdfast; it does not have true roots, so it gets nutrients from the water. Its canopy shades the reef below and calms the water, changing which species can live underneath. A marine heatwave in 2011 wiped out kelp along more than 100 km of Western Australia\'s coast, and warming has also reduced kelp in northern NSW.',
    spot: 'Swim through the forest of golden-brown kelp swaying back and forth in the surge.',
    threats: 'Marine heatwaves, urchin overgrazing and grazing by tropical fish moving south with warming waters.',
    sources: [
      'Bennett et al. 2016, Marine and Freshwater Research – The Great Southern Reef',
      'Wernberg et al. 2016, Science – Climate-driven regime shift of a temperate marine ecosystem',
      'Vergés et al. 2016, PNAS – Long-term empirical evidence of ocean warming leading to tropicalisation of fish communities'
    ]
  },
  {
    id: 'crayweed',
    common: 'Crayweed',
    sci: 'Phyllospora comosa',
    group: 'algae',
    feeding: 'photosynthetic',
    trophic: 'Producer',
    size: 'Up to about 3 m long',
    depth: '0–15 m',
    status: 'Not Evaluated',
    statusCode: 'NE',
    role: 'A large brown seaweed that forms shallow underwater forests, providing food and shelter for abalone, lobsters and fish.',
    interactions: [
      'Provides habitat for abalone, rock lobsters and reef fish',
      'Shares the shallow reef with golden kelp (Ecklonia radiata)',
      'Its drifting fronds feed grazers and beach food webs'
    ],
    didYouKnow: 'Crayweed disappeared from about 70 km of Sydney\'s coast in the 1980s – and nobody noticed for years. Scientists are now bringing it back through "Operation Crayweed".',
    fieldNotes: 'The loss of crayweed has been linked to poorly treated sewage released along Sydney\'s coast before deep ocean outfalls were built in the 1990s. Even after water quality improved, the crayweed did not return on its own. Since the 2010s scientists from UNSW and the Sydney Institute of Marine Science have transplanted fertile crayweed onto bare reefs, where it has reproduced and started new forests.',
    spot: 'Look in the shallows for long, bushy brown seaweed fronds swaying in the surge.',
    threats: 'Pollution, marine heatwaves and urchin grazing; it cannot easily recolonise lost reefs on its own.',
    sources: [
      'Coleman et al. 2008, Journal of Phycology – Absence of a large brown macroalga on urban reefs around Sydney',
      'Operation Crayweed – UNSW and Sydney Institute of Marine Science',
      'Campbell et al. 2014, PLOS ONE – Towards restoration of missing underwater forests'
    ]
  },
  {
    id: 'spongegarden',
    common: 'Sponge garden (demosponges)',
    sci: 'Class Demospongiae',
    group: 'invertebrate',
    feeding: 'filter feeder',
    trophic: 'Primary consumer',
    size: 'From a few centimetres to over 1 m',
    depth: '12–18 m on this reef (much deeper elsewhere)',
    status: 'Not Evaluated',
    statusCode: 'NE',
    role: 'Filters bacteria and plankton from huge volumes of water, recycling nutrients and creating colourful habitat on the deeper reef.',
    interactions: [
      'Filters bacteria and tiny plankton from the water',
      'Provides shelter for small fish, worms and crustaceans',
      'Eaten by some sea slugs (nudibranchs) and specialist fish'
    ],
    didYouKnow: 'Sponges are among the oldest groups of animals on Earth – they have no brain, nerves, muscles or true organs.',
    fieldNotes: 'Sponges pull water in through thousands of tiny pores using beating cells called choanocytes, trap food and release the filtered water through larger openings. They grow where light is too dim for kelp, so they dominate deeper reefs, forming "sponge gardens" in many colours and shapes. Many sponges make chemicals to deter predators, and some of these are studied as possible medicines.',
    spot: 'Swim down to the deeper reef and look for a garden of colourful sponges in all shapes – fans, cups, fingers and blobs – filtering the water.',
    threats: 'Physical damage from anchors and fishing gear, sediment and marine heatwaves.',
    sources: [
      'Australian Museum – Sponges',
      'Reef Life Survey – Sponge gardens',
      'Bell 2008, Estuarine, Coastal and Shelf Science – The functional roles of marine sponges'
    ]
  }
];

export const missions = [
  {
    id: 'read-the-beach',
    title: 'Read the beach',
    brief: 'Welcome to the Illawarra coast near Woonona and Bellambi. Before you surf or dive, read the beach: is this a beach break, where waves break over shifting sand, or a reef break, where they break over rock? Spot the rip currents, then catch a wave – and always swim between the red and yellow flags.',
    goal: { type: 'surf-ride', minScore: 300 },
    hint: 'Rips often look like calm, darker gaps between the breaking waves – avoid them, and position yourself where the swell starts to stand up.',
    questions: [
      {
        q: 'What is the main difference between a beach break and a reef break?',
        options: [
          'Beach breaks only happen at night',
          'Beach breaks form over sand that shifts, so waves change; reef breaks form over fixed rock, so waves break in a more consistent spot',
          'Reef breaks only happen in the tropics',
          'There is no difference – both break over sand'
        ],
        answer: 1,
        explain: 'Sandbanks move with storms and tides, so beach-break waves change from day to day. Rock reefs do not move, so reef-break waves tend to break in the same place and shape – but the shallow rock makes them more dangerous if you fall.'
      },
      {
        q: 'Which of these is a sign of a rip current?',
        options: [
          'A strip of darker, calmer-looking water with fewer breaking waves',
          'Lots of white breaking waves all along the beach',
          'Seagulls sitting on the sand',
          'Water that is clearer near the shore'
        ],
        answer: 0,
        explain: 'Rips are deeper channels where water flows back out to sea. They often look darker and calmer, with fewer breaking waves, and may carry foam, sand or debris out past the surf. That calm look tricks many swimmers into entering them.'
      },
      {
        q: 'You are caught in a rip. What should you do?',
        options: [
          'Swim hard straight back to the beach against it',
          'Stay calm, float, raise an arm to signal for help, or swim parallel to the beach',
          'Dive under and hold onto the sand',
          'Take off your swimmers so you are lighter'
        ],
        answer: 1,
        explain: 'Fighting a rip wears you out. Surf Life Saving Australia advises: relax and float, raise an arm to signal lifesavers, and swim parallel to the beach or towards the breaking waves to escape. Best of all, swim between the red and yellow flags, where lifesavers are watching.'
      }
    ]
  },
  {
    id: 'kelp-census',
    title: 'Kelp forest census',
    brief: 'Temperate reefs like this one are part of the Great Southern Reef, home to a huge number of species found nowhere else on Earth. Photograph five different fish species in the kelp forest and record how they make a living – grazers, plankton-pickers and predators.',
    goal: { type: 'photo-species', count: 5, filter: { group: 'fish' } },
    hint: 'Check the kelp canopy, the boulders, the dark ledges and the sand at the reef edge – each holds different fish.',
    questions: [
      {
        q: 'An "endemic" species is one that:',
        options: [
          'Is found everywhere in the world',
          'Is found naturally in only one region and nowhere else',
          'Has recently been introduced by humans',
          'Is endangered'
        ],
        answer: 1,
        explain: 'Endemic species live naturally in only one place. Southern Australia has been isolated for millions of years, so a high proportion of its reef species – such as seadragons, old wives and eastern blue devils – are found nowhere else.'
      },
      {
        q: 'Why do southern Australian temperate reefs have so many endemic species?',
        options: [
          'Because the water is warm like the tropics',
          'Because the region has been geographically isolated with a stable climate for tens of millions of years',
          'Because most species were brought by ships',
          'Because there are no predators'
        ],
        answer: 1,
        explain: 'Australia separated from Antarctica tens of millions of years ago, and its southern coast has been isolated with a relatively stable climate and geology. Over that time, many species evolved here and nowhere else.'
      },
      {
        q: 'Luderick graze algae, mado eat plankton and kingfish hunt other fish. Which one is a primary consumer?',
        options: ['Luderick', 'Mado', 'Kingfish', 'None of them'],
        answer: 0,
        explain: 'Primary consumers eat producers. Adult luderick eat algae (producers), so they are primary consumers. Mado eat animal plankton and invertebrates, and kingfish eat fish, so they are higher-level consumers.'
      }
    ]
  },
  {
    id: 'urchin-barrens',
    title: 'Urchin barrens',
    brief: 'Some NSW reefs that once held kelp forests are now bare rock covered in long-spined sea urchins – "urchin barrens". In the lab, change the number of urchin predators and watch what happens to the kelp. Can you work out how a barren forms?',
    goal: { type: 'lab', condition: 'barren' },
    hint: 'Try removing the urchins\' predators – blue gropers and rock lobsters – and watch the urchin numbers and the kelp.',
    questions: [
      {
        q: 'Fishers remove many rock lobsters and blue gropers from a reef. What is most likely to happen next?',
        options: [
          'Kelp grows thicker because there are fewer fish',
          'Urchin numbers increase and they graze the kelp down to bare rock',
          'Urchins die out because they have no food',
          'Nothing changes'
        ],
        answer: 1,
        explain: 'Lobsters and gropers eat urchins. With fewer predators, urchins multiply and overgraze the kelp, creating barrens. This chain of effects through several levels of a food web is called a trophic cascade.'
      },
      {
        q: 'Why has Centrostephanus rodgersii spread from NSW to Tasmania?',
        options: [
          'Fishers carried it there on purpose',
          'The warming, strengthening East Australian Current carries its larvae south and keeps water warm enough for them to survive',
          'Tasmanian kelp is sweeter',
          'It walked along the sea floor across Bass Strait'
        ],
        answer: 1,
        explain: 'The EAC has pushed warm water further south, and waters off eastern Tasmania have warmed faster than the global average. Urchin larvae need water above about 12 °C, so they can now survive and settle there, creating barrens on reefs that were once kelp forest.'
      },
      {
        q: 'Which action would best help a barren recover into a kelp forest?',
        options: [
          'Removing all the kelp',
          'Protecting urchin predators (for example in marine sanctuaries) and reducing urchin numbers',
          'Adding more urchins',
          'Increasing fishing for blue gropers'
        ],
        answer: 1,
        explain: 'Restoring predators such as large rock lobsters, combined with culling or harvesting urchins, can reduce grazing so kelp can regrow. Once a barren forms, though, it can be very hard to reverse – which is why prevention matters.'
      }
    ]
  },
  {
    id: 'seadragon-search',
    title: 'Seadragon search',
    brief: 'The weedy seadragon is one of the most remarkable fish on Earth – and one of the hardest to find. Its leaf-like skin flaps make it look like drifting seaweed. Search the kelp and photograph a seadragon using its camouflage.',
    goal: { type: 'photo-behaviour', behaviour: 'camouflage' },
    hint: 'Move slowly and look for "seaweed" that drifts against the surge, or has an eye and a long snout.',
    questions: [
      {
        q: 'How does camouflage help a weedy seadragon survive?',
        options: [
          'It makes the seadragon swim faster',
          'Its shape and colours blend with kelp and weed, hiding it from predators and helping it sneak up on prey',
          'It lets the seadragon breathe air',
          'It keeps the seadragon warm'
        ],
        answer: 1,
        explain: 'Camouflage is a structural and behavioural adaptation. The seadragon\'s leafy appendages and slow, swaying movement make it look like a piece of seaweed, so predators overlook it and tiny shrimps do not notice it approaching.'
      },
      {
        q: 'Which parent carries the seadragon\'s eggs until they hatch?',
        options: [
          'The female, inside her body',
          'The male, on a brood patch under his tail',
          'Neither – the eggs are left on the kelp',
          'Both parents take turns in their mouths'
        ],
        answer: 1,
        explain: 'The female lays up to about 250 eggs onto a brood patch under the male\'s tail. He carries them for around a month until they hatch, just as male seahorses carry their young.'
      },
      {
        q: 'In 2025 the IUCN reassessed the weedy seadragon. What is its status now?',
        options: ['Extinct', 'Least Concern', 'Vulnerable', 'Not Evaluated'],
        answer: 2,
        explain: 'The weedy seadragon was moved from Least Concern to Vulnerable because of declines linked to marine heatwaves and loss of kelp and weed habitat. In NSW, seadragons are protected – they must not be collected or harmed.'
      }
    ]
  },
  {
    id: 'cold-water-dive',
    title: 'Cold-water freediving',
    brief: 'NSW waters are much colder than the tropics, and the temperature can drop suddenly as you dive through a thermocline. Gear up in a wetsuit, check the visibility and dive to 8 metres. Learn how to stay warm and safe – and never dive alone.',
    goal: { type: 'depth', metres: 8 },
    hint: 'Equalise early on the way down, and watch for the sudden chill of the thermocline – your buddy stays on the surface watching you.',
    questions: [
      {
        q: 'What is a thermocline?',
        options: [
          'A type of wetsuit',
          'A layer where water temperature changes quickly with depth',
          'A current that flows along the beach',
          'A line of buoys marking a dive site'
        ],
        answer: 1,
        explain: 'Warm, less dense water sits on top of colder, denser water. The thermocline is the boundary between them, where you can feel the temperature drop by several degrees within a few metres. Upwelling of cold water is common along the NSW coast.'
      },
      {
        q: 'Why do divers lose body heat much faster in water than in air of the same temperature?',
        options: [
          'Water conducts heat away from the body about 25 times faster than air',
          'Water is always colder than air',
          'Salt draws heat out of the skin',
          'Divers breathe faster underwater'
        ],
        answer: 0,
        explain: 'Water conducts heat far better than air, so it steals body heat quickly and can cause hypothermia – when core body temperature drops below 35 °C. A wetsuit helps: its neoprene is full of tiny gas bubbles that insulate, and it holds a thin layer of water that your body warms up.'
      },
      {
        q: 'Why does a wetsuit keep you less warm (and less buoyant) as you dive deeper?',
        options: [
          'The neoprene gets wet and heavy',
          'Water pressure squashes the gas bubbles in the neoprene, making it thinner',
          'Deeper water is always warmer',
          'The wetsuit absorbs salt'
        ],
        answer: 1,
        explain: 'Every 10 m of seawater adds about 1 atmosphere of pressure, so at 8 m the pressure is about 1.8 atmospheres. The gas bubbles in the neoprene compress, so the suit insulates less and you become less buoyant. Combined with poor visibility and cold, this is why NSW divers should dive with a buddy, use a dive flag and know their limits.'
      }
    ]
  }
];
