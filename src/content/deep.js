// DeepSwell – Deep sea: Tasmanian seamounts content (species + missions)
// Data only. Australian English. IUCN statuses checked October 2026.
// Setting: the twilight (mesopelagic) zone and a deep-water coral seamount south of Tasmania,
// inside the Huon and Tasman Fracture Australian Marine Parks, explored by research submersible (200–1200 m).
// Notes for teachers:
//  - Humans cannot freedive here: pressure rises about 1 atmosphere every 10 m, so at 1000 m it is
//    roughly 100 atm. Deep-sea research uses crewed submersibles, ROVs and towed cameras.
//  - Orange roughy has no global IUCN assessment (it is Vulnerable on the European regional list); in
//    Australia it was listed as Conservation Dependent under the EPBC Act in 2006 after severe overfishing.
//  - Bathynomus giant isopods in Australia are mostly known from warmer slope waters further north
//    (e.g. B. kensleyi in the Coral Sea, 590–1000 m); they are included here as a representative deep-sea scavenger.
//  - Many deep-sea invertebrates (jellies, corals, sponges) have never been assessed by the IUCN (Not Evaluated).

export const species = [
  {
    id: 'lanternfish',
    common: 'Lanternfish',
    sci: 'Myctophidae (e.g. Diaphus spp.)',
    group: 'fish',
    feeding: 'planktivore',
    trophic: 'Secondary consumer',
    size: 'Usually 2–15 cm',
    depth: '0–1000 m (deep by day, near the surface at night)',
    status: 'Least Concern (most assessed species)',
    statusCode: 'LC',
    role: 'Huge numbers of lanternfish carry energy from surface plankton down into the deep sea and feed many larger predators.',
    interactions: [
      'Eats copepods, krill and other zooplankton near the surface at night',
      'Preyed on by orange roughy, oreos, squid, seabirds, seals and tuna',
      'Its daily migration transports carbon from the surface into deep water (the biological pump)'
    ],
    didYouKnow: 'Lanternfish may be among the most abundant vertebrates on Earth – there could be hundreds of millions of tonnes of them in the world\'s oceans.',
    fieldNotes: 'Rows of light organs called photophores along the belly and sides glow blue-green, and the pattern is different for each species, helping them recognise each other in the dark. Each evening lanternfish swim hundreds of metres up to feed in the plankton-rich surface waters, then sink back to the twilight zone before dawn to hide from predators. This diel vertical migration, repeated by many animals every day, is often called the largest migration on Earth.',
    spot: 'Look for small silvery fish speckled with rows of glowing dots – watch the school rise towards the surface when night falls in the diel vertical migration.',
    threats: 'Few direct threats yet, but there is growing interest in fishing the twilight zone for fishmeal, and ocean warming may change where they live.',
    sources: [
      'Australian Museum – Lanternfishes, family Myctophidae',
      'FishBase – Myctophidae',
      'Irigoien et al. 2014, Nature Communications – Mesopelagic fish biomass'
    ]
  },
  {
    id: 'hatchetfish',
    common: 'Silver hatchetfish',
    sci: 'Argyropelecus spp.',
    group: 'fish',
    feeding: 'planktivore',
    trophic: 'Secondary consumer',
    size: 'Up to about 8 cm',
    depth: '100–1000 m (mostly 200–600 m)',
    status: 'Least Concern (assessed species)',
    statusCode: 'LC',
    role: 'A small, abundant twilight-zone fish that eats zooplankton and is food for larger deep-sea predators.',
    interactions: [
      'Eats copepods, ostracods and other small zooplankton',
      'Preyed on by dragonfish, squid and larger fish',
      'Hides from predators looking up from below by matching the faint light from the surface'
    ],
    didYouKnow: 'Hatchetfish can tune the brightness of their belly lights to match the light coming down from above, so their silhouette disappears.',
    fieldNotes: 'Its very thin, mirror-like body is shaped like the blade of a hatchet. Photophores along the underside point downwards and glow to cancel out the fish\'s shadow – a camouflage trick called counter-illumination. Large tubular eyes point upwards, searching for the silhouettes of prey against the dim light above.',
    spot: 'Look below a hatchetfish – its belly glows to match the faint light from above, so watch for a thin silver fish that seems to vanish when seen from underneath.',
    threats: 'No major threats known; potential future twilight-zone fisheries and ocean change.',
    sources: [
      'Australian Museum – Hatchetfishes, family Sternoptychidae',
      'FishBase – Argyropelecus',
      'Widder 2010, Science – Bioluminescence in the ocean'
    ]
  },
  {
    id: 'anglerfish',
    common: 'Humpback anglerfish (black seadevil)',
    sci: 'Melanocetus johnsonii',
    group: 'fish',
    feeding: 'carnivore',
    trophic: 'Tertiary consumer',
    size: 'Females up to about 18 cm; males about 3 cm',
    depth: '100–1500 m (sometimes deeper)',
    status: 'Least Concern',
    statusCode: 'LC',
    role: 'A sit-and-wait predator that lures prey to it in the dark, saving precious energy where food is scarce.',
    interactions: [
      'Symbiosis with bioluminescent bacteria that live in its lure (mutualism)',
      'Eats fish, squid and crustaceans attracted to the lure',
      'Its large stretchy stomach lets it swallow prey bigger than itself'
    ],
    didYouKnow: 'The glow of the anglerfish\'s lure is not made by the fish itself – it comes from millions of bioluminescent bacteria living inside it.',
    fieldNotes: 'Only females have the fishing-rod lure (the illicium), a modified dorsal fin spine with a glowing tip called the esca. Males are tiny and have no lure; in this species they find a female by smell and attach only temporarily to mate, unlike some anglerfish whose males fuse to the female for life. Its black skin absorbs light, so it is almost invisible apart from the lure.',
    spot: 'Watch for a small glowing light bobbing in the dark – it is the lure of a black, big-mouthed anglerfish waiting motionless below it.',
    threats: 'Rarely caught; no major threats known apart from deep-sea trawl bycatch.',
    sources: [
      'IUCN Red List – Melanocetus johnsonii',
      'Australian Museum – Humpback Anglerfish, Melanocetus johnsonii',
      'Pietsch 2009 – Oceanic Anglerfishes (University of California Press)'
    ]
  },
  {
    id: 'vampiresquid',
    common: 'Vampire squid',
    sci: 'Vampyroteuthis infernalis',
    group: 'invertebrate',
    feeding: 'detritivore',
    trophic: 'Detritivore (eats marine snow)',
    size: 'Up to about 30 cm',
    depth: '600–1200 m (sometimes deeper)',
    status: 'Least Concern',
    statusCode: 'LC',
    role: 'Collects and eats marine snow – sinking dead material – recycling food that falls from the surface.',
    interactions: [
      'Catches marine snow with long sticky filaments and rolls it into mucus balls to eat',
      'Preyed on by deep-diving fish, whales and seals',
      'Flashes glowing arm tips and releases glowing mucus to confuse predators'
    ],
    didYouKnow: 'Despite its scary name, the vampire squid does not suck blood – it eats sinking flakes of marine snow.',
    fieldNotes: 'It is neither a true squid nor an octopus, but the only living member of its own order (Vampyromorphida). It lives in the oxygen minimum zone, where little oxygen is dissolved, using blue blood with haemocyanin that grabs oxygen efficiently. When threatened it pulls its webbed arms back over its body, turning itself inside out into a spiny "pineapple" shape, and it can release a cloud of glowing mucus instead of ink.',
    spot: 'Watch the glowing tips of its arms flash, then get close and see it turn its webbed cape inside out into the spiky "pineapple" defence posture.',
    threats: 'No major threats known; expanding low-oxygen zones and ocean warming may change its habitat.',
    sources: [
      'IUCN Red List – Vampyroteuthis infernalis',
      'Robison et al. 2003, Biological Bulletin – Light production by the arm tips of the vampire squid',
      'Hoving & Robison 2012, Proc. Royal Society B – Vampire squid feeding on marine snow'
    ]
  },
  {
    id: 'gulpereel',
    common: 'Gulper eel (pelican eel)',
    sci: 'Eurypharynx pelecanoides',
    group: 'fish',
    feeding: 'carnivore',
    trophic: 'Secondary consumer',
    size: 'Up to about 1 m',
    depth: '500–3000 m',
    status: 'Least Concern',
    statusCode: 'LC',
    role: 'A deep-water predator that scoops up small animals with an enormous mouth, making the most of rare meals.',
    interactions: [
      'Eats small crustaceans, fish and squid',
      'Preyed on by larger deep-sea fish',
      'May use a glowing organ on its tail tip to attract prey'
    ],
    didYouKnow: 'The gulper eel\'s loosely hinged mouth is much bigger than the rest of its body and can open like a huge net.',
    fieldNotes: 'Its jaws are long and loosely hinged, and the mouth balloons open like a pelican\'s pouch to engulf prey and water, which is then pushed out through the gills. Despite its big mouth it has tiny teeth and mostly eats small crustaceans. Its long, whip-like tail ends in a small light organ that glows pink and red.',
    spot: 'Look for a long black eel-like fish with a whip tail – watch it open its huge mouth like a balloon to gulp prey.',
    threats: 'No major threats known apart from occasional deep-sea trawl bycatch.',
    sources: [
      'IUCN Red List – Eurypharynx pelecanoides',
      'FishBase – Eurypharynx pelecanoides',
      'Australian Museum – Gulper eels'
    ]
  },
  {
    id: 'orangeroughy',
    common: 'Orange roughy',
    sci: 'Hoplostethus atlanticus',
    group: 'fish',
    feeding: 'carnivore',
    trophic: 'Tertiary consumer',
    size: 'Up to about 75 cm',
    depth: '500–1500 m',
    status: 'Not Evaluated globally (Vulnerable in Europe; Conservation Dependent in Australia under the EPBC Act)',
    statusCode: 'NE',
    role: 'Gathers in large schools over seamounts to feed and spawn, linking twilight-zone prey to the seamount food web.',
    interactions: [
      'Eats lanternfish, prawns and squid that drift over the seamount',
      'Preyed on by deep-sea sharks such as sixgills',
      'Bottom trawling for orange roughy damaged seamount coral reefs'
    ],
    didYouKnow: 'Orange roughy can live for more than 100 years – some have been estimated at over 200 years old – and they do not breed until they are about 30.',
    fieldNotes: 'Huge schools gather over seamounts and hills off Tasmania, where currents bring a steady supply of food and where they spawn each winter. Because they grow very slowly and mature late, heavy fishing in the 1980s and 1990s removed fish far faster than they could be replaced, and Australia listed the species as Conservation Dependent in 2006. Its bright orange colour looks black in the deep sea because red light does not reach these depths.',
    spot: 'Look above the seamount for a dense school of bright orange fish circling over the coral – your submersible lights reveal colours that are invisible in the dark.',
    threats: 'Historic overfishing by bottom trawling; strict catch limits and closed areas now manage the fishery.',
    sources: [
      'DCCEEW – Orange roughy (Hoplostethus atlanticus), EPBC Act Conservation Dependent',
      'CSIRO – Orange roughy ageing and stock assessment',
      'FishBase – Hoplostethus atlanticus'
    ]
  },
  {
    id: 'oreodory',
    common: 'Black oreo (oreo dory)',
    sci: 'Allocyttus niger',
    group: 'fish',
    feeding: 'planktivore',
    trophic: 'Secondary consumer',
    size: 'Up to about 45 cm',
    depth: '560–1300 m',
    status: 'Not Evaluated',
    statusCode: 'NE',
    role: 'A deep-bodied seamount fish that eats drifting plankton such as salps and crustaceans.',
    interactions: [
      'Eats salps, prawns, small fish and other zooplankton',
      'Schools alongside orange roughy over seamounts',
      'Preyed on by deep-sea sharks'
    ],
    didYouKnow: 'Like orange roughy, black oreo grow very slowly – scientists have estimated some to be more than 100 years old.',
    fieldNotes: 'Black oreo are found in cold southern waters around southern Australia and New Zealand. They have a tall, flattened body, large eyes and a mouth that shoots forward to suck in prey. Like orange roughy they grow slowly and mature late, so they are easily overfished, and they were taken as part of the same deepwater trawl fisheries.',
    spot: 'Look near the seamount for schools of dark, saucer-shaped fish with big eyes, hovering close to the slope.',
    threats: 'Deepwater trawl fishing and bycatch; slow growth makes recovery slow.',
    sources: [
      'FishBase – Allocyttus niger',
      'Australian Fisheries Management Authority – Oreodories',
      'Gomon et al. 2008 – Fishes of Australia\'s Southern Coast'
    ]
  },
  {
    id: 'dragonfish',
    common: 'Stoplight loosejaw (dragonfish)',
    sci: 'Malacosteus niger',
    group: 'fish',
    feeding: 'carnivore',
    trophic: 'Tertiary consumer',
    size: 'Up to about 25 cm',
    depth: '500–2000 m',
    status: 'Least Concern',
    statusCode: 'LC',
    role: 'A deep-sea predator with a secret red "searchlight" that lets it see prey that cannot see it.',
    interactions: [
      'Eats copepods, prawns and small fish',
      'Uses red light that most deep-sea animals cannot detect',
      'Preyed on by larger deep-sea fish and sharks'
    ],
    didYouKnow: 'The stoplight loosejaw makes red light – almost every other deep-sea animal is blind to red, so it is like hunting with an invisible torch.',
    fieldNotes: 'Below each eye it has a large photophore that glows red and a smaller one that glows blue-green. To see its own red light it uses a chemical made from chlorophyll, probably taken from the copepods it eats. Its jaw has no floor – just a frame of bone – so it can snap shut quickly with less water resistance.',
    spot: 'Look for a black fish with a red glowing light beneath its eye sweeping the dark like a searchlight – red bioluminescence most prey cannot see.',
    threats: 'No major threats known apart from occasional trawl bycatch.',
    sources: [
      'IUCN Red List – Malacosteus niger',
      'Douglas et al. 1998, Nature – Chlorophyll-based visual pigment in Malacosteus niger',
      'Australian Museum – Dragonfishes, family Stomiidae'
    ]
  },
  {
    id: 'atolla',
    common: 'Crown jelly (Atolla jellyfish)',
    sci: 'Atolla wyvillei',
    group: 'invertebrate',
    feeding: 'carnivore',
    trophic: 'Secondary consumer',
    size: 'Bell up to about 15 cm across',
    depth: '500–4000 m',
    status: 'Not Evaluated',
    statusCode: 'NE',
    role: 'A deep-sea jellyfish that eats small drifting animals and is food for fish and other jellies.',
    interactions: [
      'Catches crustaceans and other zooplankton with its tentacles',
      'Eaten by deep-sea fish and turtles that dive deep',
      'Its flashing lights may attract bigger predators to whatever is attacking it'
    ],
    didYouKnow: 'Scientists built a fake glowing jellyfish called the "e-jelly" that copies Atolla\'s alarm – and it attracted a giant squid that was filmed for the first time in its deep-sea home.',
    fieldNotes: 'When attacked, Atolla sends rings of blue light spinning around its bell. This "burglar alarm" display may attract a bigger predator that will attack its attacker. Its deep red bell is almost invisible in the deep sea, because red light from the surface does not reach this far down.',
    spot: 'Brush close to a deep-red jellyfish and watch it fire spinning rings of blue light – its "burglar alarm" flashes.',
    threats: 'No known threats; ocean warming and deoxygenation may affect deep-sea jellies.',
    sources: [
      'Widder 2010, Science – Bioluminescence in the ocean',
      'Widder et al. – The e-jelly and the 2012 giant squid footage (Ocean Research & Conservation Association)',
      'Smithsonian Ocean – Atolla jellyfish'
    ]
  },
  {
    id: 'siphonophore',
    common: 'Giant siphonophore',
    sci: 'Praya dubia',
    group: 'invertebrate',
    feeding: 'carnivore',
    trophic: 'Secondary consumer',
    size: 'Colonies up to about 40 m long',
    depth: '300–1000 m',
    status: 'Not Evaluated',
    statusCode: 'NE',
    role: 'A long drifting colony that acts like a living drift net, catching small animals in the twilight zone.',
    interactions: [
      'Catches copepods, krill and small fish with stinging tentacles',
      'Competes with fish for zooplankton',
      'Can produce blue bioluminescence when disturbed'
    ],
    didYouKnow: 'Some siphonophores are among the longest animals on Earth – longer than a blue whale.',
    fieldNotes: 'A siphonophore is not one animal but a colony of many specialised units called zooids, all cloned from one starting individual. Some zooids swim, some catch food, some digest and others reproduce, working together like organs in one body. It drifts slowly with long curtains of stinging tentacles spread out to catch prey.',
    spot: 'Follow a long, see-through string drifting through the water – a whole colony of zooids trailing a curtain of fishing tentacles.',
    threats: 'No known threats; fragile and rarely studied.',
    sources: [
      'MBARI – Siphonophores',
      'Smithsonian Ocean – Siphonophores',
      'Haddock et al. 2005, Science – Siphonophore bioluminescence'
    ]
  },
  {
    id: 'combjelly',
    common: 'Comb jelly',
    sci: 'Beroe sp.',
    group: 'invertebrate',
    feeding: 'carnivore',
    trophic: 'Secondary consumer',
    size: 'Up to about 15 cm',
    depth: '0–1000 m+',
    status: 'Not Evaluated',
    statusCode: 'NE',
    role: 'A drifting predator that mainly eats other comb jellies, helping control their numbers.',
    interactions: [
      'Swallows other comb jellies whole',
      'Eaten by fish and turtles',
      'Competes with jellyfish for space and food'
    ],
    didYouKnow: 'The rainbow colours travelling along a comb jelly are not bioluminescence – they are light scattered by its beating cilia, just like a rainbow on a soap bubble.',
    fieldNotes: 'Comb jellies (ctenophores) are not true jellyfish and do not sting. They swim using eight rows of tiny hair-like cilia (comb rows) that beat in waves, scattering light into flickering rainbow colours when lit up. Beroe has a huge mouth that can open wide to swallow prey almost as big as itself; many ctenophores can also glow blue-green when disturbed, which is a separate effect.',
    spot: 'Shine your lights on a clear, thimble-shaped jelly and watch rainbow colours ripple along its comb rows – that is light scattering from cilia, not bioluminescence.',
    threats: 'No known threats.',
    sources: [
      'Australian Museum – Comb jellies (Ctenophora)',
      'MBARI – Ctenophores',
      'Haddock & Case 1995 – Not all ctenophores are bioluminescent: Pleurobrachia'
    ]
  },
  {
    id: 'giantisopod',
    common: 'Giant isopod',
    sci: 'Bathynomus spp. (e.g. Bathynomus kensleyi)',
    group: 'invertebrate',
    feeding: 'scavenger',
    trophic: 'Scavenger / decomposer',
    size: 'Up to about 30 cm (some species 50 cm)',
    depth: '200–2000 m',
    status: 'Not Evaluated',
    statusCode: 'NE',
    role: 'Cleans up the sea floor by eating dead animals that sink from above, recycling nutrients.',
    interactions: [
      'Scavenges on dead fish, squid and whale falls',
      'Also catches slow-moving animals such as sea cucumbers',
      'Preyed on by deep-sea sharks and large fish'
    ],
    didYouKnow: 'Giant isopods are relatives of the slaters (woodlice) in your garden, but can grow as long as a ruler.',
    fieldNotes: 'Giant isopods can go for months without eating, then gorge on a food fall until they can barely move. Australian waters have their own species: Bathynomus kensleyi lives on the continental slope of the Coral Sea, and other Australian species are found off the north and west coasts. Like slaters, they can roll partly into a ball for protection.',
    spot: 'Check the bottom near the seamount for a giant armoured slater crawling over to scavenge on a dead fish.',
    threats: 'Bycatch in deep-sea trawls and traps; little is known about population sizes.',
    sources: [
      'Australian Faunal Directory – Bathynomus kensleyi Lowry & Dempsey, 2006',
      'Huang & Bruce 2024 – Review of Bathynomus species',
      'Australian Museum – Giant isopods'
    ]
  },
  {
    id: 'seamountcoral',
    common: 'Deep-sea reef coral',
    sci: 'Solenosmilia variabilis',
    group: 'coral',
    feeding: 'filter feeder',
    trophic: 'Primary consumer (eats plankton and marine snow)',
    size: 'Reef frameworks many metres thick',
    depth: '600–1500 m (Tasmanian seamounts mostly 950–1450 m)',
    status: 'Not Evaluated',
    statusCode: 'NE',
    role: 'Builds a branching, bush-like reef on seamount tops that gives shelter to hundreds of other species.',
    interactions: [
      'Catches plankton and marine snow from the current with its tentacles',
      'Brittle stars, sponges and other animals live among its branches',
      'Destroyed in large areas by bottom trawling for orange roughy'
    ],
    didYouKnow: 'Living colonies on Tasmanian seamounts are about 120 years old, and the reef framework beneath them has been building up for over a thousand years.',
    fieldNotes: 'Unlike shallow tropical corals, this coral has no symbiotic algae (zooxanthellae), because there is no sunlight at these depths for photosynthesis. Instead its polyps catch food drifting in the current. It grows only about 1 mm a year, so the reef builds up extremely slowly – and on heavily trawled seamounts off Tasmania it has largely disappeared.',
    spot: 'Look over the seamount summit for a pale, bushy thicket of branching coral – a slow-growing deep-sea reef with no algae, catching food from the current.',
    threats: 'Bottom trawling, which breaks the reef; ocean acidification, which makes it harder to build a skeleton.',
    sources: [
      'Fallon et al. 2014, Deep-Sea Research I – Age and growth of Solenosmilia variabilis on SW Pacific seamounts',
      'Althaus et al. 2009, Marine Ecology Progress Series – Impacts of bottom trawling on seamount corals off Tasmania',
      'Parks Australia – Huon Marine Park'
    ]
  },
  {
    id: 'bamboocoral',
    common: 'Bamboo coral',
    sci: 'Keratoisis sp. (family Isididae)',
    group: 'coral',
    feeding: 'filter feeder',
    trophic: 'Primary consumer (eats plankton and marine snow)',
    size: 'Colonies up to about 1–2 m tall',
    depth: '500–2000 m+',
    status: 'Not Evaluated',
    statusCode: 'NE',
    role: 'A tall, branching coral that provides perches for filter-feeding animals and records ocean history in its skeleton.',
    interactions: [
      'Catches plankton and marine snow with its eight-tentacled polyps',
      'Brittle stars and crinoids climb its branches to feed in the current',
      'Easily snapped by trawl nets and fishing lines'
    ],
    didYouKnow: 'Bamboo corals can live for centuries, and scientists read growth rings in their skeletons to work out how the deep ocean has changed.',
    fieldNotes: 'Its skeleton alternates between hard white segments of calcium carbonate and dark flexible joints made of a protein called gorgonin, so it looks like stalks of bamboo. It is an octocoral, with eight feathery tentacles on each polyp. Like other deep-sea corals it has no symbiotic algae and relies on food drifting past.',
    spot: 'Look for a tall, whip-like coral with white segments and dark joints, like bamboo, rising from the seamount slope.',
    threats: 'Bottom trawling and other fishing gear; ocean acidification.',
    sources: [
      'Thresher et al. 2004, Marine Ecology Progress Series – Age and growth of bamboo corals off Tasmania',
      'CSIRO – Deep-sea corals of the Tasmanian seamounts',
      'NOAA Ocean Exploration – Bamboo corals'
    ]
  },
  {
    id: 'glasssponge',
    common: 'Glass sponge',
    sci: 'Hexactinellida',
    group: 'invertebrate',
    feeding: 'filter feeder',
    trophic: 'Primary consumer (eats bacteria and fine particles)',
    size: 'Up to about 1 m tall',
    depth: '200–6000 m',
    status: 'Not Evaluated',
    statusCode: 'NE',
    role: 'Filters huge volumes of seawater and builds delicate structures that shelter small animals.',
    interactions: [
      'Filters bacteria and tiny particles of marine snow from the water',
      'Shrimps and brittle stars shelter inside and on it',
      'Crushed by bottom trawls'
    ],
    didYouKnow: 'Glass sponges build their skeletons from silica – the same material as glass – and some may live for thousands of years.',
    fieldNotes: 'The skeleton is made of six-rayed glass spicules (hexactines), which give the group its name. Water is drawn in through tiny pores in the walls and pumped out through a large opening at the top, and bacteria are filtered out on the way. Glass sponges are among the simplest animals, with no organs, nerves or muscles.',
    spot: 'Look on the seamount rock for a pale, lacy vase or tube that looks like it is made of spun glass.',
    threats: 'Bottom trawling, which shatters the fragile skeleton; very slow to recover.',
    sources: [
      'Australian Museum – Glass sponges',
      'CSIRO – Seamount fauna of the Tasman Fracture region',
      'Leys et al. 2007, Advances in Marine Biology – Biology of glass sponges'
    ]
  },
  {
    id: 'brittlestar',
    common: 'Coral brittle star',
    sci: 'Ophiuroidea',
    group: 'invertebrate',
    feeding: 'filter feeder',
    trophic: 'Primary consumer and detritivore',
    size: 'Arms up to about 30 cm across',
    depth: '200–1500 m (on seamount corals)',
    status: 'Not Evaluated',
    statusCode: 'NE',
    role: 'Lives on deep-sea corals, catching food from the current and keeping the coral surface clean.',
    interactions: [
      'Clings to coral branches to reach food in the current (commensalism)',
      'Catches marine snow and tiny animals with its arms',
      'Preyed on by fish and sea stars'
    ],
    didYouKnow: 'Brittle stars can drop an arm to escape a predator and grow a new one.',
    fieldNotes: 'Brittle stars are echinoderms, related to sea stars and sea urchins, but their long, thin arms bend and snap quickly, giving them their name. On seamount corals some species wrap their arms around branches and hold them up into the current to catch passing food. They were among the most common animals on untrawled Tasmanian seamounts.',
    spot: 'Look closely at the coral branches for thin, wriggling arms – brittle stars clinging on and holding their arms out into the current.',
    threats: 'Loss of coral habitat to bottom trawling.',
    sources: [
      'Australian Museum – Brittle stars',
      'Museums Victoria – Ophiuroids of the Tasmanian seamounts (O\'Hara)',
      'Althaus et al. 2009, Marine Ecology Progress Series'
    ]
  },
  {
    id: 'sixgill',
    common: 'Bluntnose sixgill shark',
    sci: 'Hexanchus griseus',
    group: 'shark',
    feeding: 'carnivore',
    trophic: 'Apex / tertiary consumer',
    size: 'Up to about 4.8 m',
    depth: '0–2500 m (mostly below 200 m)',
    status: 'Near Threatened',
    statusCode: 'NT',
    role: 'A large deep-sea predator and scavenger that helps control numbers of fish, squid and other prey.',
    interactions: [
      'Eats fish, squid, crabs, other sharks and seals',
      'Scavenges on whale falls and dead animals',
      'May eat orange roughy and oreos around seamounts'
    ],
    didYouKnow: 'Most sharks have five gill slits – the sixgill has six, a feature of an ancient shark family with fossil relatives from about 200 million years ago.',
    fieldNotes: 'Sixgill sharks spend the day in deep water and often rise towards shallower water at night to feed. They have a single dorsal fin set far back on the body and large green eyes adapted for low light. Females give birth to large litters of live young, sometimes more than 100 pups.',
    spot: 'Watch for a huge, dark shark cruising slowly past the seamount with steady, lazy tail beats and glowing green eyes.',
    threats: 'Bycatch and targeted fishing; slow growth and late maturity make it vulnerable.',
    sources: [
      'IUCN Red List 2020 – Hexanchus griseus (Near Threatened)',
      'FishBase – Hexanchus griseus',
      'Australian Museum – Bluntnose Sixgill Shark'
    ]
  },
  {
    id: 'grenadier',
    common: 'Grenadier (rattail)',
    sci: 'Coryphaenoides spp. (family Macrouridae)',
    group: 'fish',
    feeding: 'carnivore',
    trophic: 'Secondary consumer and scavenger',
    size: 'Usually 30–100 cm',
    depth: '200–6000 m',
    status: 'Varies by species',
    statusCode: 'NE',
    role: 'One of the most common deep-sea bottom fish, eating small animals and scavenging food that falls to the sea floor.',
    interactions: [
      'Eats small crustaceans, worms and fish on the bottom',
      'Quickly arrives at food falls to scavenge',
      'Preyed on by deep-sea sharks'
    ],
    didYouKnow: 'Male grenadiers can drum special muscles against their swim bladder to make sounds in the dark.',
    fieldNotes: 'Grenadiers have a big head, large eyes and a long body that tapers to a thin rat-like tail with no tail fin. They swim with the head tilted down, searching the bottom with a sensitive chin barbel and a snout that can detect prey. Some grenadiers are long-lived and have been heavily fished in other parts of the world.',
    spot: 'Look just above the bottom for a fish with a long rat-like tail swimming head-down, nose to the sea floor.',
    threats: 'Deep-sea trawl bycatch and targeted fishing in some regions.',
    sources: [
      'Australian Museum – Grenadiers (whiptails), family Macrouridae',
      'FishBase – Coryphaenoides',
      'Gomon et al. 2008 – Fishes of Australia\'s Southern Coast'
    ]
  },
  {
    id: 'snailfish',
    common: 'Deep-sea snailfish',
    sci: 'Liparidae (e.g. Careproctus spp.)',
    group: 'fish',
    feeding: 'carnivore',
    trophic: 'Secondary consumer',
    size: 'Usually 10–30 cm',
    depth: '0–8000 m+ (this one 1000+ m)',
    status: 'Not Evaluated',
    statusCode: 'NE',
    role: 'A soft-bodied bottom fish that eats small crustaceans, and the group that holds the record for the deepest-living fish.',
    interactions: [
      'Eats amphipods, small prawns and worms',
      'Preyed on by larger fish',
      'Some species lay their eggs inside crabs'
    ],
    didYouKnow: 'Snailfish hold the record for the deepest fish ever seen – but the famous Mariana snailfish (Pseudoliparis swirei) lives over 7000 m down in the Mariana Trench, not here.',
    fieldNotes: 'Snailfish have soft, jelly-like bodies without scales, which helps them cope with crushing pressure. Their bodies contain a molecule called TMAO that helps protect proteins from being squashed by pressure. Many species have a sucker-like disc on the belly made from their pelvic fins.',
    spot: 'Look low on the sea floor for a pale, tadpole-shaped fish with a jelly-like body slowly wriggling along.',
    threats: 'Little known; occasional bycatch in deep-sea trawls.',
    sources: [
      'Gerringer et al. 2017, Zootaxa – Description of Pseudoliparis swirei from the Mariana Trench',
      'Australian Museum – Snailfishes, family Liparidae',
      'Yancey et al. 2014, PNAS – TMAO and the depth limit of fishes'
    ]
  }
];

export const missions = [
  {
    id: 'into-the-twilight',
    title: 'Into the twilight',
    brief: 'South of Tasmania, the sea floor rises into underwater mountains called seamounts. They are far too deep to freedive – at 1000 m the pressure is about 100 times that at the surface – so we will explore in a research submersible. Descend to 200 m and watch the sunlight fade as you enter the twilight zone.',
    goal: { type: 'depth', metres: 200 },
    hint: 'Watch the colours disappear as you descend – red goes first, and by 200 m only dim blue light remains.',
    questions: [
      {
        q: 'The twilight (mesopelagic) zone lies between about which depths?',
        options: ['0–200 m', '200–1000 m', '1000–4000 m', '4000–6000 m'],
        answer: 1,
        explain: 'The sunlit (epipelagic) zone is 0–200 m, where there is enough light for photosynthesis. The twilight (mesopelagic) zone is 200–1000 m, with only faint light. Below 1000 m is the midnight (bathypelagic) zone, where the only light comes from living things.'
      },
      {
        q: 'Pressure increases by about 1 atmosphere for every 10 m of seawater. What is the total pressure at 1000 m?',
        options: ['About 2 atm', 'About 11 atm', 'About 101 atm', 'About 1000 atm'],
        answer: 2,
        explain: '1000 m ÷ 10 m = 100 atm from the water, plus 1 atm of air above the sea, gives about 101 atm – like having a small car pressing on every postage-stamp-sized patch of your body.'
      },
      {
        q: 'Why do scientists explore the seamounts in a submersible instead of by freediving or scuba?',
        options: [
          'Because the water is too salty for divers',
          'Because the huge pressure, cold and darkness would kill a human diver, so a strong pressure hull keeps people at 1 atm inside',
          'Because seamount animals are dangerous to touch',
          'Because submersibles are cheaper than divers'
        ],
        answer: 1,
        explain: 'Air spaces in a diver\'s lungs and ears would be crushed, and breathing gases become toxic under extreme pressure. A submersible has a thick hull that keeps the crew at surface pressure, with lights, cameras and robotic arms to study the deep.'
      }
    ]
  },
  {
    id: 'living-light',
    title: 'Living light',
    brief: 'Below the reach of sunlight, most animals make their own light – this is bioluminescence. Find an animal using its light and photograph it in action. Is it hunting, hiding or calling for help?',
    goal: { type: 'photo-behaviour', behaviour: 'bioluminescence' },
    hint: 'Switch off your submersible lights for a moment and watch for glowing lures, flashing bells and shining bellies.',
    questions: [
      {
        q: 'In bioluminescence, what reaction produces the light?',
        options: [
          'Sunlight stored during the day is released at night',
          'A chemical called luciferin reacts with oxygen, helped by an enzyme called luciferase',
          'Electricity from the animal\'s nerves heats a filament',
          'Radioactive minerals in the water glow'
        ],
        answer: 1,
        explain: 'Bioluminescence is a chemical reaction: luciferase speeds up the reaction of luciferin with oxygen, releasing energy as light with very little heat. Some animals, like the anglerfish, borrow glowing bacteria instead.'
      },
      {
        q: 'A hatchetfish glows on its belly to match the faint light from above. What is this called?',
        options: ['A lure', 'Counter-illumination', 'A burglar alarm', 'Photosynthesis'],
        answer: 1,
        explain: 'Counter-illumination hides the fish\'s silhouette from predators looking up from below. It is camouflage made of light.'
      },
      {
        q: 'When attacked, the crown jelly Atolla flashes spinning rings of blue light. What is the most likely reason?',
        options: [
          'To attract a bigger predator that may attack its attacker',
          'To help it photosynthesise',
          'To warm itself up',
          'To find food in the dark'
        ],
        answer: 0,
        explain: 'This is called a "burglar alarm" display. By lighting up the scene, the jelly may attract a larger predator that will go after the animal attacking it, giving the jelly a chance to escape.'
      }
    ]
  },
  {
    id: 'seamount-census',
    title: 'Seamount census',
    brief: 'Seamounts are oases in the deep sea: currents sweep food past their slopes, attracting schools of fish and the sharks that hunt them. Photograph five different fish or shark species living around this Tasmanian seamount to help scientists record what lives here.',
    goal: { type: 'photo-species', count: 5, filter: { group: ['fish', 'shark'] } },
    hint: 'Check different places – the open water above the seamount, the coral on the summit and the sea floor around its base.',
    questions: [
      {
        q: 'Why do seamounts often have more fish than the surrounding deep sea?',
        options: [
          'They are warmer because of volcanic heat',
          'Currents flowing around them bring more food, and they provide hard surfaces and shelter',
          'Sunlight reaches the seamount top',
          'Fish are attracted to the magnetic rocks'
        ],
        answer: 1,
        explain: 'Seamounts change the flow of ocean currents, concentrating plankton and twilight-zone animals near their slopes. Corals and sponges grow on the hard rock, creating habitat – so seamounts act like oases in the deep sea.'
      },
      {
        q: 'Some species are found on Tasmanian seamounts and nowhere else on Earth. What are these species called?',
        options: ['Invasive', 'Endemic', 'Extinct', 'Migratory'],
        answer: 1,
        explain: 'Endemic species are found only in one place. Isolated seamounts can have many endemic species, so damaging one seamount could wipe out species that live nowhere else.'
      },
      {
        q: 'Orange roughy can live for over 100 years and only start breeding at about 30. Why does this make them easy to overfish?',
        options: [
          'Old fish taste better',
          'Fish are caught faster than new ones can grow up and breed to replace them',
          'They live too deep to be caught',
          'Long-lived fish lay more eggs, so there are too many'
        ],
        answer: 1,
        explain: 'Slow growth and late maturity mean a population can only replace itself very slowly. In the 1980s and 1990s fishing removed orange roughy much faster than this, and stocks collapsed.'
      }
    ]
  },
  {
    id: 'trawl-scars',
    title: 'Trawl scars',
    brief: 'In the 1980s and 1990s, heavy nets were dragged over Tasmanian seamounts to catch orange roughy, smashing the coral reefs on their summits. In the lab, compare a trawled seamount with an untouched one and see how much life was lost – and why marine parks now protect these places.',
    goal: { type: 'lab', condition: 'trawled' },
    hint: 'Compare the coral cover and the number of animals living on the reef before and after trawling.',
    questions: [
      {
        q: 'Deep-sea reef coral on Tasmanian seamounts grows about 1 mm per year. Roughly how long might it take to regrow a 1 m tall reef framework?',
        options: ['About 1 year', 'About 10 years', 'About 100 years', 'About 1000 years'],
        answer: 3,
        explain: '1 m = 1000 mm, and at about 1 mm per year (or slower for the whole reef) that takes around 1000 years. Studies found no clear sign of recovery on seamounts years after trawling stopped – recovery will take centuries.'
      },
      {
        q: 'What is bottom trawling?',
        options: [
          'Fishing with a single hook and line',
          'Dragging a heavy net along the sea floor to catch fish living near the bottom',
          'Collecting fish by hand with a submersible',
          'Using sound to herd fish into a trap'
        ],
        answer: 1,
        explain: 'Bottom trawl nets and their heavy gear scrape and crush everything in their path. On seamounts this broke apart coral reefs that had taken thousands of years to build.'
      },
      {
        q: 'How do the Huon and Tasman Fracture Australian Marine Parks help protect seamounts?',
        options: [
          'They warm the water so corals grow faster',
          'They restrict damaging activities such as bottom trawling, including in no-take zones, so habitats can recover',
          'They replant corals using submersibles every year',
          'They remove all predators from the seamounts'
        ],
        answer: 1,
        explain: 'Marine parks set rules about what activities are allowed. Banning bottom trawling over the seamounts protects the remaining coral and gives damaged areas the chance to recover – very slowly.'
      }
    ]
  },
  {
    id: 'marine-snow',
    title: 'Marine snow',
    brief: 'No sunlight reaches the seamount, so no plants or algae can photosynthesise here. Instead, food drifts down from above as "marine snow". Photograph two different corals that catch this falling food and find out how life survives in the dark.',
    goal: { type: 'photo-species', count: 2, filter: { group: 'coral' } },
    hint: 'Look on the summit and slopes of the seamount where the current flows fastest – that is where filter feeders gather.',
    questions: [
      {
        q: 'What is marine snow?',
        options: [
          'Frozen seawater from Antarctica',
          'Flakes of dead plankton, faeces and other organic material sinking from the surface',
          'White sand stirred up by currents',
          'Bubbles from underwater volcanoes'
        ],
        answer: 1,
        explain: 'Marine snow is made of dead plankton, faecal pellets, mucus and other bits sinking from the sunlit zone. It is the main food supply for many deep-sea animals.'
      },
      {
        q: 'Why do deep-sea corals have no symbiotic algae (zooxanthellae), unlike tropical reef corals?',
        options: [
          'The water is too salty for algae',
          'There is no sunlight for algae to photosynthesise',
          'The algae are eaten by fish',
          'Deep-sea corals are not really corals'
        ],
        answer: 1,
        explain: 'Zooxanthellae need light for photosynthesis. Below about 200 m there is too little light, so deep-sea corals are filter feeders, catching plankton and marine snow with their tentacles.'
      },
      {
        q: 'Where does the energy in a deep-sea seamount food web originally come from?',
        options: [
          'Photosynthesis by plants growing on the seamount',
          'Photosynthesis by phytoplankton in the sunlit surface water far above',
          'Heat from the Earth\'s core',
          'The submersible\'s lights'
        ],
        answer: 1,
        explain: 'Phytoplankton capture sunlight near the surface. Their energy reaches the deep as marine snow and through migrating animals like lanternfish, feeding the filter feeders and predators of the seamount.'
      }
    ]
  }
];
