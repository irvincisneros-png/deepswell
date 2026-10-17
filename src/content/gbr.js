// DeepSwell – Great Barrier Reef content (species + missions)
// Data only. Australian English. IUCN statuses checked October 2026.
// Notes for teachers:
//  - Green turtle: IUCN global status changed from Endangered to Least Concern in Oct 2025;
//    it remains listed as Vulnerable in Australia under the EPBC Act, and several regional
//    populations are still threatened.
//  - Giant clam (Tridacna gigas): IUCN reassessed it as Critically Endangered in 2024
//    (previously Vulnerable, 1996 assessment).
//  - Table coral (Acropora hyacinthus): assessed Endangered in the 2023–24 global coral reassessment.

export const species = [
  {
    id: 'clownfish',
    common: 'Clown anemonefish',
    sci: 'Amphiprion percula',
    group: 'fish',
    feeding: 'omnivore',
    trophic: 'Secondary consumer',
    size: 'Up to 11 cm',
    depth: '1–15 m',
    status: 'Least Concern',
    statusCode: 'LC',
    role: 'Lives in partnership with host anemones, defending them from predators and fertilising them with its waste.',
    interactions: [
      'Mutualism with the magnificent sea anemone (Heteractis magnifica): shelter for the fish, protection and nutrients for the anemone',
      'Chases off anemone-eating butterflyfish',
      'Eats zooplankton and algae (predation and grazing)'
    ],
    didYouKnow: 'All clownfish hatch as males – if the dominant female dies, the largest male changes sex to replace her.',
    fieldNotes: 'A thick layer of mucus stops the anemone\'s stinging cells (nematocysts) from firing, so the fish can nestle safely among the tentacles. Each anemone holds a strict size hierarchy: one breeding female, one breeding male and several smaller non-breeders that stay small so they are not evicted. The male guards and fans eggs laid on rock beside the anemone until they hatch about a week later.',
    spot: 'Look for a small orange-and-white fish that never strays far from its anemone, darting back into the tentacles whenever you get close.',
    threats: 'Coral bleaching also bleaches host anemones, and collection for the aquarium trade reduces local populations.',
    sources: [
      'Australian Museum – Clown Anemonefish, Amphiprion percula',
      'IUCN Red List – Amphiprion percula',
      'FishBase – Amphiprion percula'
    ]
  },
  {
    id: 'anemone',
    common: 'Magnificent sea anemone',
    sci: 'Heteractis magnifica',
    group: 'invertebrate',
    feeding: 'mixotroph',
    trophic: 'Producer (via symbiotic algae) and consumer',
    size: 'Up to 1 m across',
    depth: '1–20 m',
    status: 'Not Evaluated',
    statusCode: 'NE',
    role: 'Provides a protected home for anemonefish and, like corals, gains energy from symbiotic algae living in its tissues.',
    interactions: [
      'Mutualism with clown anemonefish (Amphiprion percula)',
      'Symbiosis with zooxanthellae (Symbiodiniaceae algae) in its tentacles',
      'Stings and captures small prey with nematocysts'
    ],
    didYouKnow: 'One magnificent sea anemone species can host around a dozen different kinds of anemonefish across the Indo-Pacific.',
    fieldNotes: 'Its tentacles are loaded with nematocysts – microscopic harpoon-like stinging capsules – used to catch small animals. Most of its energy, though, comes from photosynthetic algae in its tissues, which is why it lives in sunlit water. Anemones can bleach under heat stress just like corals, and bleached anemones are linked to stressed, less successful clownfish.',
    spot: 'Watch for a large carpet of swaying tentacles on an exposed rock or bommie, with clownfish tucked inside.',
    threats: 'Marine heatwaves cause bleaching, and anemones are collected for the aquarium trade.',
    sources: [
      'Australian Museum – Magnificent Sea Anemone, Heteractis magnifica',
      'GBRMPA – Coral bleaching',
      'Reef Life Survey – Heteractis magnifica'
    ]
  },
  {
    id: 'bluetang',
    common: 'Blue tang (palette surgeonfish)',
    sci: 'Paracanthurus hepatus',
    group: 'fish',
    feeding: 'omnivore',
    trophic: 'Primary and secondary consumer',
    size: 'Up to 31 cm',
    depth: '2–40 m',
    status: 'Least Concern',
    statusCode: 'LC',
    role: 'Feeds on zooplankton and algae over the reef, helping link open-water food to reef food webs.',
    interactions: [
      'Shelters in branching corals such as staghorn (Acropora spp.)',
      'Preyed upon by larger fish such as coral trout and trevally',
      'Grazes algae, competing with other herbivorous fish'
    ],
    didYouKnow: 'Surgeonfish get their name from a scalpel-sharp spine on each side of the tail, which they can flick out in defence.',
    fieldNotes: 'Blue tangs feed mainly on zooplankton in the water column above the coral, and also graze algae. When threatened, a group dives into the branches of a coral head and wedges itself in. Juveniles are often bright yellow-bellied and stay very close to a single coral colony.',
    spot: 'Look for small groups of vivid blue fish with yellow tails hovering just above branching coral.',
    threats: 'Loss of branching coral habitat from bleaching, and collection for the aquarium trade.',
    sources: [
      'Australian Museum – Palette Surgeonfish, Paracanthurus hepatus',
      'IUCN Red List – Paracanthurus hepatus',
      'FishBase – Paracanthurus hepatus'
    ]
  },
  {
    id: 'moorishidol',
    common: 'Moorish idol',
    sci: 'Zanclus cornutus',
    group: 'fish',
    feeding: 'omnivore',
    trophic: 'Secondary consumer',
    size: 'Up to 23 cm',
    depth: '1–180 m',
    status: 'Least Concern',
    statusCode: 'LC',
    role: 'Browses on sponges, algae and small invertebrates, helping keep reef surfaces in balance.',
    interactions: [
      'Feeds mainly on sponges (predation on invertebrates)',
      'Grazes algae and picks small invertebrates from the reef',
      'Preyed on by larger reef predators'
    ],
    didYouKnow: 'The Moorish idol is the only living species in its entire family, Zanclidae.',
    fieldNotes: 'Its long, tube-like snout and bristle-like teeth let it reach into cracks to pluck sponges and other invertebrates. The long white streamer trailing from the dorsal fin is part of the fin itself. Its larvae drift in the open ocean for a long time and settle onto the reef at an unusually large size.',
    spot: 'Look for pairs of striped black, white and yellow fish with a long trailing fin, wandering slowly across the reef together.',
    threats: 'Habitat loss from coral decline; it rarely survives in aquariums, so collection is a local concern.',
    sources: [
      'Australian Museum – Moorish Idol, Zanclus cornutus',
      'IUCN Red List – Zanclus cornutus',
      'FishBase – Zanclus cornutus'
    ]
  },
  {
    id: 'cleanerwrasse',
    common: 'Bluestreak cleaner wrasse',
    sci: 'Labroides dimidiatus',
    group: 'fish',
    feeding: 'carnivore',
    trophic: 'Secondary consumer',
    size: 'Up to 14 cm',
    depth: '1–40 m',
    status: 'Least Concern',
    statusCode: 'LC',
    role: 'Removes parasites and dead tissue from other reef animals at cleaning stations, keeping fish populations healthy.',
    interactions: [
      'Cleaning mutualism with many reef fish and the reef manta ray (Mobula alfredi)',
      'Eats parasitic gnathiid isopods from client fish',
      'Mimicked by the false cleanerfish (Aspidontus taeniatus), a blenny that bites chunks from fish'
    ],
    didYouKnow: 'Cleaner wrasse are among the few fish shown in experiments to react to marks on their own bodies when looking in a mirror.',
    fieldNotes: 'A single cleaner can inspect over 2000 clients a day. It sometimes "cheats" by biting protective mucus instead of parasites, so clients swim off or chase it – cleaners behave better when other fish are watching. Like many wrasses it is a protogynous hermaphrodite: it starts life female and the dominant fish in a group can become male.',
    spot: 'Find the cleaning station and watch a small blue-and-black striped fish dart out to inspect bigger fish – and even a manta ray – that hover there to be cleaned.',
    threats: 'Collection for the aquarium trade, where it usually starves, and loss of reef habitat.',
    sources: [
      'Australian Museum – Bluestreak Cleaner Wrasse, Labroides dimidiatus',
      'IUCN Red List – Labroides dimidiatus',
      'Kohda et al. 2019, PNAS – Mirror test in cleaner wrasse'
    ]
  },
  {
    id: 'parrotfish',
    common: 'Steephead parrotfish',
    sci: 'Chlorurus microrhinos',
    group: 'fish',
    feeding: 'herbivore',
    trophic: 'Primary consumer',
    size: 'Up to 70 cm',
    depth: '1–50 m',
    status: 'Least Concern',
    statusCode: 'LC',
    role: 'Scrapes algae off dead coral and rock, clearing space for new coral and grinding reef rock into sand (bioerosion).',
    interactions: [
      'Grazes algae that would otherwise compete with and smother coral',
      'Preyed on by sharks and large groupers',
      'Competes with surgeonfish and rabbitfish for algae'
    ],
    didYouKnow: 'Studies on the Great Barrier Reef estimate a large steephead parrotfish can erode around a tonne of reef rock a year – much of it comes out the other end as white sand.',
    fieldNotes: 'Its teeth are fused into a beak, and plates in its throat (the pharyngeal mill) grind rock into fine sediment so it can digest the algae and microbes inside. Many parrotfish start life as females and later change into brightly coloured "terminal phase" males. At night many parrotfish rest in crevices, some inside a protective mucus cocoon.',
    spot: 'Listen and watch for a big fish with a steep forehead biting the coral and rock, leaving puffs of sand behind it.',
    threats: 'Overfishing (especially spearfishing at night) and loss of reef structure.',
    sources: [
      'Australian Museum – Steephead Parrotfish, Chlorurus microrhinos',
      'IUCN Red List – Chlorurus microrhinos',
      'Bellwood 1995, Marine Biology – Bioerosion by Chlorurus gibbus (now C. microrhinos) on the GBR'
    ]
  },
  {
    id: 'humpheadwrasse',
    common: 'Humphead (Māori) wrasse',
    sci: 'Cheilinus undulatus',
    group: 'fish',
    feeding: 'carnivore',
    trophic: 'Tertiary consumer',
    size: 'Up to 2 m',
    depth: '1–100 m',
    status: 'Endangered',
    statusCode: 'EN',
    role: 'A large predator that eats hard-shelled and toxic prey, including crown-of-thorns starfish, that few other animals can tackle.',
    interactions: [
      'Preys on crown-of-thorns starfish (Acanthaster cf. solaris)',
      'Eats toxic prey such as boxfish and sea hares without harm',
      'Crushes molluscs, sea urchins and crustaceans'
    ],
    didYouKnow: 'Humphead wrasse can live for 30 years or more, and big males grow the prominent hump on their forehead.',
    fieldNotes: 'It is a protogynous hermaphrodite: some females change sex into males after about 9 years. Thick lips and strong pharyngeal teeth let it crush shells and spiny prey. Because it grows slowly and matures late, populations take a long time to recover from fishing.',
    spot: 'Look for a huge green-blue fish with thick lips and a bulging forehead, slowly cruising the reef – it is often curious about divers.',
    threats: 'Overfishing for the live reef food fish trade; it is fully protected in Queensland waters.',
    sources: [
      'IUCN Red List – Cheilinus undulatus (Endangered)',
      'Australian Museum – Humphead Maori Wrasse',
      'GBRMPA – Protected species'
    ]
  },
  {
    id: 'coraltrout',
    common: 'Common coral trout (leopard coralgrouper)',
    sci: 'Plectropomus leopardus',
    group: 'fish',
    feeding: 'carnivore',
    trophic: 'Tertiary consumer',
    size: 'Up to 120 cm',
    depth: '3–100 m',
    status: 'Least Concern',
    statusCode: 'LC',
    role: 'A top reef predator that controls populations of smaller fish.',
    interactions: [
      'Ambushes small fish such as damselfish (e.g. Chromis viridis)',
      'Sometimes hunts alongside moray eels, which flush out prey (cooperative hunting)',
      'Visits cleaning stations to be cleaned by cleaner wrasse'
    ],
    didYouKnow: 'Coral trout can rapidly change colour and pattern – they flash brighter colours when signalling to other fish.',
    fieldNotes: 'Coral trout start life as females and some later change sex to male. They gather to spawn around the new moon in the warmer months, and these spawning periods are protected by seasonal fishing closures on the Great Barrier Reef. Studies of no-take green zones found more and bigger coral trout inside protected areas.',
    spot: 'Look for a red fish with tiny blue spots hovering motionless beside a bommie, ready to ambush passing fish.',
    threats: 'Heavy fishing pressure (a prized eating fish) and habitat loss from coral decline.',
    sources: [
      'IUCN Red List – Plectropomus leopardus',
      'Australian Museum – Common Coral Trout',
      'GBRMPA – Zoning and coral trout'
    ]
  },
  {
    id: 'chromis',
    common: 'Blue-green puller (blue-green chromis)',
    sci: 'Chromis viridis',
    group: 'fish',
    feeding: 'planktivore',
    trophic: 'Secondary consumer',
    size: 'Up to 10 cm',
    depth: '1–12 m',
    status: 'Least Concern',
    statusCode: 'LC',
    role: 'Eats plankton from the water and is itself food for many predators, moving energy from plankton into the reef food web.',
    interactions: [
      'Shelters in staghorn coral (Acropora spp.)',
      'Its waste nutrients help fertilise the coral colony it lives in',
      'Hunted by coral trout and trevally'
    ],
    didYouKnow: 'Fish waste from a school living in a coral colony can measurably boost that coral\'s growth.',
    fieldNotes: 'Males prepare a nest on the sand or rubble, and females lay eggs there for the male to guard. Schools feed in the current above their coral, picking tiny zooplankton from the water. Their colour shimmers from pale green to blue depending on the light angle.',
    spot: 'Find a big school of little blue-green fish hovering over staghorn coral – swim at them fast and they all vanish into the branches.',
    threats: 'Loss of branching coral from bleaching and storms, and collection for aquariums.',
    sources: [
      'Australian Museum – Blue-green Puller, Chromis viridis',
      'IUCN Red List – Chromis viridis',
      'Holbrook et al. 2008, Ecology – Fish nutrients and coral growth'
    ]
  },
  {
    id: 'trevally',
    common: 'Bigeye trevally',
    sci: 'Caranx sexfasciatus',
    group: 'fish',
    feeding: 'carnivore',
    trophic: 'Tertiary consumer',
    size: 'Up to 120 cm',
    depth: '0–150 m',
    status: 'Least Concern',
    statusCode: 'LC',
    role: 'A fast open-water predator that hunts small fish and crustaceans around the reef.',
    interactions: [
      'Preys on small fish such as chromis and other baitfish',
      'Large schools reduce each fish\'s risk from sharks (safety in numbers)',
      'Preyed on by reef sharks'
    ],
    didYouKnow: 'Bigeye trevally often school by day and spread out to hunt at night – those big eyes help them see in low light.',
    fieldNotes: 'Their streamlined, compressed bodies and forked tails are built for speed. A row of hard, keel-like scales (scutes) runs along the tail. Schools can number in the hundreds, wheeling together in tight, slow circles.',
    spot: 'Look into the blue beyond the reef edge for a tight silver school slowly circling in open water.',
    threats: 'Commercial and recreational fishing; generally widespread and secure.',
    sources: [
      'IUCN Red List – Caranx sexfasciatus',
      'FishBase – Caranx sexfasciatus',
      'Australian Museum – Bigeye Trevally'
    ]
  },
  {
    id: 'butterflyfish',
    common: 'Threadfin butterflyfish',
    sci: 'Chaetodon auriga',
    group: 'fish',
    feeding: 'omnivore',
    trophic: 'Secondary consumer',
    size: 'Up to 23 cm',
    depth: '1–40 m',
    status: 'Least Concern',
    statusCode: 'LC',
    role: 'Picks at coral polyps, worms and algae; butterflyfish numbers are used as indicators of coral health.',
    interactions: [
      'Eats coral polyps and anemone tentacles',
      'Feeds on polychaete worms and small crustaceans',
      'Chased away from anemones by clownfish'
    ],
    didYouKnow: 'The dark eyespot near its tail and the black band hiding its real eye may confuse predators about which end is the head.',
    fieldNotes: 'Butterflyfish often form long-term pairs that feed and defend territories together. Their small, pointed mouths act like tweezers for picking food from between coral branches. Adults of this species have a long thread trailing from the back of the dorsal fin.',
    spot: 'Look for a pair of white-and-yellow fish with a black eye stripe, side by side, picking at the coral.',
    threats: 'Coral loss from bleaching reduces food and shelter; also collected for aquariums.',
    sources: [
      'Australian Museum – Threadfin Butterflyfish, Chaetodon auriga',
      'IUCN Red List – Chaetodon auriga',
      'AIMS – Long-term monitoring of reef fish'
    ]
  },
  {
    id: 'angelfish',
    common: 'Regal angelfish',
    sci: 'Pygoplites diacanthus',
    group: 'fish',
    feeding: 'carnivore',
    trophic: 'Secondary consumer',
    size: 'Up to 25 cm',
    depth: '1–80 m',
    status: 'Least Concern',
    statusCode: 'LC',
    role: 'Feeds on sponges and sea squirts (tunicates), helping control their growth on the reef.',
    interactions: [
      'Preys on sponges and tunicates',
      'Shelters in caves and ledges from predators such as coral trout',
      'Competes with other angelfish for food and space'
    ],
    didYouKnow: 'Few animals can digest sponges, which are full of glass-like spicules and nasty chemicals – regal angelfish specialise in them.',
    fieldNotes: 'Angelfish have a strong spine on the lower edge of the gill cover, which separates them from butterflyfish. The bold orange, white and blue bars help break up its outline in the shadows. It rarely strays far from caves and overhangs.',
    spot: 'Peer under ledges and overhangs for a shy orange fish with blue-and-white bars that slips back into cover when you approach.',
    threats: 'Collection for the aquarium trade and loss of reef habitat.',
    sources: [
      'Australian Museum – Regal Angelfish, Pygoplites diacanthus',
      'IUCN Red List – Pygoplites diacanthus',
      'FishBase – Pygoplites diacanthus'
    ]
  },
  {
    id: 'boxfish',
    common: 'Yellow boxfish',
    sci: 'Ostracion cubicus',
    group: 'fish',
    feeding: 'omnivore',
    trophic: 'Secondary consumer',
    size: 'Up to 45 cm',
    depth: '1–45 m',
    status: 'Least Concern',
    statusCode: 'LC',
    role: 'Grazes algae and eats small invertebrates on the reef, with almost no predators thanks to its armour and toxin.',
    interactions: [
      'Eats algae, sponges, worms, molluscs and small crustaceans',
      'Its bright colour warns predators that it is toxic (aposematism)',
      'One of the few predators that can eat it is the humphead wrasse (Cheilinus undulatus)'
    ],
    didYouKnow: 'When stressed, a boxfish releases ostracitoxin from its skin – a poison strong enough to kill other fish in a small tank, including itself.',
    fieldNotes: 'Its body is encased in a rigid box of fused bony plates, so it swims by sculling its small fins rather than bending its body. Juveniles are bright yellow with black spots, while adults become duller and bluish-yellow. The box shape still turns out to be very stable in turbulent water.',
    spot: 'Look for a slow, hovering yellow box with black spots that paddles with tiny fins near the coral.',
    threats: 'Collected for the aquarium trade; otherwise widespread and secure.',
    sources: [
      'Australian Museum – Yellow Boxfish, Ostracion cubicus',
      'IUCN Red List 2023 – Ostracion cubicus',
      'FishBase – Ostracion cubicum'
    ]
  },
  {
    id: 'reefshark',
    common: 'Blacktip reef shark',
    sci: 'Carcharhinus melanopterus',
    group: 'shark',
    feeding: 'carnivore',
    trophic: 'Apex / tertiary consumer',
    size: 'Up to 1.8 m',
    depth: '0–75 m',
    status: 'Vulnerable',
    statusCode: 'VU',
    role: 'A reef predator that removes weak and sick fish, helping keep prey populations healthy.',
    interactions: [
      'Preys on reef fish such as trevally, parrotfish and mullet',
      'Visits cleaning stations to have parasites removed',
      'Remoras sometimes hitch rides (commensalism)'
    ],
    didYouKnow: 'Young blacktips use very shallow lagoons and reef flats as nurseries – sometimes in water so shallow their dorsal fin sticks out.',
    fieldNotes: 'Blacktip reef sharks give birth to live young: usually 2–5 pups after a pregnancy of around 10–16 months. They detect prey using smell, the lateral line (which senses vibrations) and electroreceptors called ampullae of Lorenzini. They are usually timid around divers.',
    spot: 'Watch the reef edge for a sleek grey shark with black-tipped fins swimming steady loops along its patrol route.',
    threats: 'Overfishing and accidental capture (bycatch); its slow breeding means populations recover slowly.',
    sources: [
      'IUCN Red List 2020 – Carcharhinus melanopterus (Vulnerable)',
      'Australian Museum – Blacktip Reef Shark',
      'GBRMPA – Sharks and rays'
    ]
  },
  {
    id: 'manta',
    common: 'Reef manta ray',
    sci: 'Mobula alfredi',
    group: 'ray',
    feeding: 'filter feeder',
    trophic: 'Secondary consumer',
    size: 'Up to 5 m wingspan',
    depth: '0–120 m',
    status: 'Vulnerable',
    statusCode: 'VU',
    role: 'Filters huge amounts of zooplankton and moves nutrients between open water and the reef.',
    interactions: [
      'Cleaning mutualism with cleaner wrasse (Labroides dimidiatus)',
      'Feeds on zooplankton such as copepods and krill',
      'Remoras ride along with it (commensalism)'
    ],
    didYouKnow: 'Each manta has a unique pattern of spots on its belly, so scientists can identify individuals from photos – just like you are doing.',
    fieldNotes: 'Mantas unroll two head fins (cephalic lobes) to funnel plankton-rich water into their wide mouths, where gill plates sieve out food. Females usually give birth to a single pup only every few years, so populations grow very slowly. Lady Elliot Island in the southern Great Barrier Reef is a well-known gathering site.',
    spot: 'Look for a huge dark-and-white ray cruising slowly overhead, then circling at the cleaning station to be cleaned.',
    threats: 'Targeted fishing for gill plates, bycatch, boat strikes and entanglement.',
    sources: [
      'IUCN Red List 2022 – Mobula alfredi (Vulnerable)',
      'Project Manta (University of Queensland) – Reef manta rays',
      'GBRMPA – Sharks and rays'
    ]
  },
  {
    id: 'bluespottedray',
    common: 'Bluespotted fantail ray',
    sci: 'Taeniura lymma',
    group: 'ray',
    feeding: 'carnivore',
    trophic: 'Secondary consumer',
    size: 'Up to 35 cm disc width',
    depth: '0–30 m',
    status: 'Least Concern',
    statusCode: 'LC',
    role: 'Hunts invertebrates buried in sand, stirring up sediment and helping recycle nutrients.',
    interactions: [
      'Preys on molluscs, worms, shrimps and crabs in the sand',
      'Hunted by large sharks such as hammerheads',
      'Fish sometimes follow it to snap up animals it disturbs'
    ],
    didYouKnow: 'It carries one or two venomous spines on its tail – a defence, not a weapon for hunting.',
    fieldNotes: 'Like all rays, its gill slits are on its underside, so it breathes through spiracles behind the eyes while resting on the sand. It often moves into shallow water with the rising tide to feed. Females give birth to live young.',
    spot: 'Look on the sand under ledges for a small ray covered in electric-blue spots – get too close and it glides away.',
    threats: 'Habitat loss and collection for aquariums; generally widespread.',
    sources: [
      'IUCN Red List 2021 – Taeniura lymma',
      'Australian Museum – Bluespotted Fantail Ray',
      'FishBase – Taeniura lymma'
    ]
  },
  {
    id: 'turtle',
    common: 'Green turtle',
    sci: 'Chelonia mydas',
    group: 'reptile',
    feeding: 'herbivore',
    trophic: 'Primary consumer (adults)',
    size: 'Up to 1.2 m shell length',
    depth: '0–40 m',
    status: 'Least Concern (global, 2025); Vulnerable in Australia',
    statusCode: 'LC',
    role: 'Grazes seagrass and algae, keeping seagrass meadows healthy and productive.',
    interactions: [
      'Grazes seagrass and algae',
      'Visits cleaning stations where fish such as surgeonfish graze algae from its shell',
      'Hatchlings are eaten by birds, crabs and fish'
    ],
    didYouKnow: 'Nest temperature sets a hatchling\'s sex – warmer sand produces more females, and almost all young turtles from the northern Great Barrier Reef are now female.',
    fieldNotes: 'Green turtles are named for the green colour of their body fat, from their plant diet – not their shell. Juveniles eat a mix of animals and plants, but adults are mostly herbivores. Females return to nest on the beach region where they hatched, and Raine Island hosts one of the largest green turtle nesting sites in the world.',
    spot: 'Watch a large turtle grazing on the bottom, then follow it as it swims up to the surface to breathe.',
    threats: 'Climate change (warmer sand, rising seas), plastic ingestion, boat strikes, fishing bycatch and loss of seagrass.',
    sources: [
      'IUCN Red List 2025 – Chelonia mydas (downlisted to Least Concern)',
      'GBRMPA – Marine turtles',
      'Jensen et al. 2018, Current Biology – Feminisation of green turtles on the northern GBR'
    ]
  },
  {
    id: 'giantclam',
    common: 'Giant clam',
    sci: 'Tridacna gigas',
    group: 'invertebrate',
    feeding: 'filter feeder',
    trophic: 'Primary consumer and producer (via symbiotic algae)',
    size: 'Up to 1.4 m',
    depth: '1–20 m',
    status: 'Critically Endangered',
    statusCode: 'CR',
    role: 'Filters plankton from the water and provides shelter and food for many small reef animals.',
    interactions: [
      'Symbiosis with zooxanthellae (Symbiodiniaceae algae) living in its mantle',
      'Filters phytoplankton from the water',
      'Small fish and shrimps shelter around and inside its shell'
    ],
    didYouKnow: 'Giant clams do not trap divers – the biggest ones cannot even close their shells completely.',
    fieldNotes: 'The colourful mantle is packed with symbiotic algae, and special cells reflect sunlight deep into the tissue like a solar farm, so the clam gets much of its food from photosynthesis. Giant clams can weigh over 200 kg and live for decades. They release eggs and sperm into the water to reproduce, starting life as males and later producing both.',
    spot: 'Swim close to a huge clam and watch it pull in its colourful mantle and close up its shell.',
    threats: 'Overharvesting for meat and shells has wiped out many populations; marine heatwaves cause clam bleaching.',
    sources: [
      'IUCN Red List 2024 – Tridacna gigas (Critically Endangered)',
      'Australian Museum – Giant Clam',
      'GBRMPA – Giant clams'
    ]
  },
  {
    id: 'cots',
    common: 'Crown-of-thorns starfish',
    sci: 'Acanthaster cf. solaris',
    group: 'invertebrate',
    feeding: 'corallivore',
    trophic: 'Primary consumer (eats coral tissue)',
    size: 'Usually 25–35 cm, up to 80 cm',
    depth: '1–30 m',
    status: 'Not Evaluated',
    statusCode: 'NE',
    role: 'A native coral predator that, in outbreaks, can strip large areas of reef of living coral.',
    interactions: [
      'Preys on hard corals, especially fast-growing Acropora',
      'Eaten by the giant triton snail and humphead wrasse',
      'Larvae survive better when nutrient runoff boosts phytoplankton'
    ],
    didYouKnow: 'It eats by pushing its stomach out through its mouth onto the coral and digesting the tissue outside its body.',
    fieldNotes: 'A single female can release tens of millions of eggs in one spawning season, which is why populations can explode. Its 7–23 arms are covered in sharp, toxic spines that cause painful wounds. The Pacific crown-of-thorns is now recognised as a separate species (Acanthaster cf. solaris) from the Indian Ocean form.',
    spot: 'Look for a large spiny starfish crawling over coral, leaving bright white scars of bare skeleton behind it.',
    threats: 'Not threatened – outbreaks are a major threat to the reef and are controlled by GBRMPA culling programs.',
    sources: [
      'GBRMPA – Crown-of-thorns starfish',
      'AIMS – Crown-of-thorns starfish',
      'Haszprunar et al. 2017, Zoosystematics and Evolution – Acanthaster species'
    ]
  },
  {
    id: 'seacucumber',
    common: 'Prickly redfish (sea cucumber)',
    sci: 'Thelenota ananas',
    group: 'invertebrate',
    feeding: 'detritivore',
    trophic: 'Decomposer / detritivore',
    size: 'Up to 70 cm',
    depth: '0–30 m',
    status: 'Endangered',
    statusCode: 'EN',
    role: 'Swallows sand, digests the organic matter and releases cleaner sediment and nutrients, recycling them for the reef.',
    interactions: [
      'Recycles nutrients that feed algae and seagrass',
      'Its digestion releases carbonate that helps buffer local seawater acidity',
      'Pearlfish can shelter inside sea cucumbers (commensalism)'
    ],
    didYouKnow: 'Some sea cucumbers breathe through their bottom, using a "respiratory tree" connected to the anus.',
    fieldNotes: 'Its body is covered in star-shaped, branching fleshy points (papillae), giving it a prickly look although it is soft. It uses tube feet to crawl and sticky feeding tentacles around its mouth to shovel sand. Sea cucumbers are echinoderms, related to sea stars and sea urchins.',
    spot: 'Look on the sand for a large orange-red sea cucumber slowly crawling along and leaving clean sand behind.',
    threats: 'Overharvesting for the bêche-de-mer (dried sea cucumber) trade.',
    sources: [
      'IUCN Red List – Thelenota ananas (Endangered)',
      'Australian Museum – Sea cucumbers',
      'Schneider et al. 2011, JGR – Sea cucumbers and reef carbonate chemistry'
    ]
  },
  {
    id: 'staghorn',
    common: 'Staghorn coral',
    sci: 'Acropora spp.',
    group: 'coral',
    feeding: 'mixotroph',
    trophic: 'Producer (via symbiotic algae) and consumer',
    size: 'Thickets many metres across',
    depth: '1–30 m',
    status: 'Varies by species',
    statusCode: 'NE',
    role: 'A fast-growing reef builder whose branches create shelter for small fish such as chromis.',
    interactions: [
      'Symbiosis with zooxanthellae (Symbiodiniaceae algae)',
      'Home to schooling damselfish such as Chromis viridis',
      'A favourite food of crown-of-thorns starfish'
    ],
    didYouKnow: 'Staghorn branches can grow 10–20 cm a year – very fast for a coral.',
    fieldNotes: 'Each branch is covered in tiny polyps that share tissue and build a calcium carbonate skeleton. Broken branches can re-attach and grow into new colonies (asexual fragmentation). Many Great Barrier Reef corals, including Acropora, reproduce in the annual mass spawning after the full moon in late spring.',
    spot: 'Look for thickets of antler-like branching coral with clouds of little blue-green fish hovering over them.',
    threats: 'Very sensitive to bleaching, cyclones and crown-of-thorns outbreaks.',
    sources: [
      'AIMS – Coral fact sheets: Acropora',
      'GBRMPA – Coral spawning',
      'Corals of the World (Veron) – Acropora'
    ]
  },
  {
    id: 'tablecoral',
    common: 'Table coral',
    sci: 'Acropora hyacinthus',
    group: 'coral',
    feeding: 'mixotroph',
    trophic: 'Producer (via symbiotic algae) and consumer',
    size: 'Tables up to 3 m across',
    depth: '1–25 m',
    status: 'Endangered',
    statusCode: 'EN',
    role: 'Builds wide flat plates that shade the reef below, creating shelter for fish and sharks.',
    interactions: [
      'Symbiosis with zooxanthellae (Symbiodiniaceae algae)',
      'Shelters fish underneath (including coral trout and reef sharks)',
      'Eaten by crown-of-thorns starfish'
    ],
    didYouKnow: 'The table shape works like a solar panel, catching sunlight for its algae while shading competitors below.',
    fieldNotes: 'The table grows from a single central stalk, with a lattice of fine branchlets forming the flat top. Because it grows quickly, it is often one of the first corals to recover after disturbance. Its large flat area also makes it vulnerable to breakage in cyclones.',
    spot: 'Look for broad flat coral plates on stalks, like tables, with fish sheltering in the shade beneath.',
    threats: 'Bleaching, cyclone damage and crown-of-thorns outbreaks.',
    sources: [
      'IUCN Red List 2023 – Acropora hyacinthus',
      'AIMS – Coral fact sheets',
      'Corals of the World (Veron) – Acropora hyacinthus'
    ]
  },
  {
    id: 'braincoral',
    common: 'Lesser valley coral (brain coral)',
    sci: 'Platygyra daedalea',
    group: 'coral',
    feeding: 'mixotroph',
    trophic: 'Producer (via symbiotic algae) and consumer',
    size: 'Colonies often 1–2 m across',
    depth: '1–30 m',
    status: 'Least Concern',
    statusCode: 'LC',
    role: 'A tough, slow-growing massive coral that adds long-lasting structure to the reef.',
    interactions: [
      'Symbiosis with zooxanthellae (Symbiodiniaceae algae)',
      'Polyps catch zooplankton at night',
      'Competes with neighbouring corals for space'
    ],
    didYouKnow: 'Its winding valleys are rows of polyps that share many mouths along each groove.',
    fieldNotes: 'Brain corals are massive and dome-shaped, making them more resistant to waves than branching corals. Each colony is hermaphrodite, releasing bundles of eggs and sperm during mass spawning. At night the polyps extend tentacles to catch plankton.',
    spot: 'Look for a rounded dome covered in maze-like grooves, like a giant brain.',
    threats: 'Bleaching during marine heatwaves and ocean acidification.',
    sources: [
      'IUCN Red List – Platygyra daedalea',
      'AIMS – Coral fact sheets',
      'Corals of the World (Veron) – Platygyra daedalea'
    ]
  },
  {
    id: 'porites',
    common: 'Massive boulder coral',
    sci: 'Porites spp.',
    group: 'coral',
    feeding: 'mixotroph',
    trophic: 'Producer (via symbiotic algae) and consumer',
    size: 'Up to 8 m across',
    depth: '1–30 m',
    status: 'Varies by species',
    statusCode: 'NE',
    role: 'Builds huge, long-lived boulders that form the backbone of the reef and record its history.',
    interactions: [
      'Symbiosis with zooxanthellae (Symbiodiniaceae algae)',
      'Christmas tree worms and other animals live embedded in it',
      'Parrotfish bite its surface, eroding it into sand'
    ],
    didYouKnow: 'Some Porites boulders on the Great Barrier Reef are over 400 years old.',
    fieldNotes: 'Porites grows only about 1 cm a year, laying down yearly density bands like tree rings. Scientists drill coral cores and read these bands – along with chemical signals such as strontium-to-calcium ratios and glowing flood bands – to reconstruct past sea temperatures and river runoff. Its hardiness means it often survives bleaching better than branching corals.',
    spot: 'Look for giant rounded boulders of coral, often covered in tiny colourful Christmas tree worms.',
    threats: 'Severe heatwaves can still kill even old colonies; also affected by sediment and acidification.',
    sources: [
      'AIMS – Coral cores and climate records',
      'GBRMPA – Coral bleaching',
      'Lough & Cooper 2011, Earth-Science Reviews – Coral records of the past'
    ]
  },
  {
    id: 'leathercoral',
    common: 'Leather soft coral',
    sci: 'Sarcophyton spp.',
    group: 'coral',
    feeding: 'mixotroph',
    trophic: 'Producer (via symbiotic algae) and consumer',
    size: 'Up to 1 m across',
    depth: '1–30 m',
    status: 'Varies by species',
    statusCode: 'NE',
    role: 'A soft coral that adds habitat and competes with hard corals for space using chemical defences.',
    interactions: [
      'Symbiosis with zooxanthellae (Symbiodiniaceae algae)',
      'Releases toxic terpenes that deter predators and nearby competitors',
      'Few animals eat it except specialists such as some cowries'
    ],
    didYouKnow: 'Leather corals sometimes shed a waxy skin to clean their surface of algae and sediment.',
    fieldNotes: 'Soft corals do not build a solid skeleton; instead they are supported by tiny calcium carbonate spicules (sclerites) in their tissue. Polyps on the mushroom-shaped top can be withdrawn, making the coral look smooth and leathery. Its flexibility lets it bend with the surge.',
    spot: 'Look for a mushroom-shaped soft coral swaying back and forth in the surge.',
    threats: 'Bleaching, though soft corals can also take over reefs where hard corals have died.',
    sources: [
      'Australian Museum – Soft corals',
      'AIMS – Soft coral fact sheets',
      'Fabricius & Alderslade 2001 – Soft Corals and Sea Fans (AIMS)'
    ]
  },
  {
    id: 'seafan',
    common: 'Giant sea fan (gorgonian)',
    sci: 'Annella mollis',
    group: 'coral',
    feeding: 'filter feeder',
    trophic: 'Secondary consumer',
    size: 'Up to 3 m across',
    depth: '5–50 m',
    status: 'Not Evaluated',
    statusCode: 'NE',
    role: 'Filters plankton from currents and provides perches and hiding places for small reef animals.',
    interactions: [
      'Feather stars and brittle stars perch on it to feed in the current (commensalism)',
      'Captures zooplankton with its polyps',
      'Hosts tiny camouflaged animals such as gobies and shrimps'
    ],
    didYouKnow: 'Unlike most corals here, Annella has no symbiotic algae – it relies entirely on catching food from the current.',
    fieldNotes: 'A sea fan grows as a flat net-like lattice held up by a flexible protein skeleton called gorgonin. It grows broadside to the prevailing current so the most water possible flows through its polyps. Because it does not need sunlight, it can grow in deeper, darker, current-swept places.',
    spot: 'Look for a huge net-like fan swaying gently, its broad face turned into the current.',
    threats: 'Physical damage from anchors and fishing gear, and warming seas.',
    sources: [
      'Fabricius & Alderslade 2001 – Soft Corals and Sea Fans (AIMS)',
      'Australian Museum – Sea fans (gorgonians)',
      'AIMS – Coral fact sheets'
    ]
  }
];

export const missions = [
  {
    id: 'read-the-waves',
    title: 'Read the waves',
    brief: 'Before we dive, we need to understand the ocean surface. Swell is energy from distant winds travelling across the sea – watch how it changes as it reaches the shallow reef. Catch a wave and see the physics for yourself.',
    goal: { type: 'surf-ride', minScore: 1 },
    hint: 'Waves get steeper as the water gets shallower – position yourself where the swell starts to stand up.',
    questions: [
      {
        q: 'What creates ocean swell?',
        options: [
          'Wind blowing over the sea surface, often far away',
          'The Moon pulling on the sea floor',
          'Fish swimming in large schools',
          'Rivers flowing into the ocean'
        ],
        answer: 0,
        explain: 'Wind transfers energy to the water. The longer, stronger and over a greater distance (fetch) it blows, the bigger the swell, which can then travel thousands of kilometres.'
      },
      {
        q: 'A 2 m wave is rolling towards a reef. Roughly what water depth will it break in?',
        options: ['About 0.5 m', 'About 2.6 m', 'About 10 m', 'About 20 m'],
        answer: 1,
        explain: 'Waves tend to break when the water depth is about 1.3 times the wave height (1.3 × 2 m ≈ 2.6 m). The bottom of the wave slows down while the top keeps going, so it tips over.'
      },
      {
        q: 'You are caught in a rip current. What is the safest thing to do?',
        options: [
          'Swim hard straight back to shore against it',
          'Stay calm, float, raise an arm for help, or swim parallel to the beach',
          'Dive to the bottom and hold on',
          'Take off your fins so you are lighter'
        ],
        answer: 1,
        explain: 'Rips are strong channels of water flowing out to sea. Fighting them wears you out; float to conserve energy, signal for help, or swim parallel to the shore to escape – and always swim between the red and yellow flags.'
      }
    ]
  },
  {
    id: 'reef-census',
    title: 'Reef census',
    brief: 'Marine scientists measure the health of a reef by counting what lives there. Your job is to photograph five different fish species and record what they eat. A healthy reef has a balance of herbivores, planktivores and predators.',
    goal: { type: 'photo-species', count: 5, filter: { group: 'fish' } },
    hint: 'Different fish live in different places – check the coral, the open water and under ledges.',
    questions: [
      {
        q: 'Why are herbivores like parrotfish so important to coral reefs?',
        options: [
          'They eat coral trout',
          'They graze algae that would otherwise smother and outcompete corals',
          'They produce oxygen by photosynthesis',
          'They clean parasites off sharks'
        ],
        answer: 1,
        explain: 'Without grazers, fast-growing algae can take over a reef and stop new corals settling. Parrotfish and other herbivores keep algae in check.'
      },
      {
        q: 'In the food chain phytoplankton → zooplankton → blue-green chromis → coral trout, what is the coral trout?',
        options: ['Producer', 'Primary consumer', 'Secondary consumer', 'Tertiary consumer'],
        answer: 3,
        explain: 'Phytoplankton are producers, zooplankton are primary consumers, chromis are secondary consumers, so the coral trout that eats them is a tertiary consumer.'
      },
      {
        q: 'What does "biodiversity" on a reef mean?',
        options: [
          'The total number of fish',
          'The variety of living things, including the number of different species',
          'The size of the largest animal',
          'How much coral is bleached'
        ],
        answer: 1,
        explain: 'Biodiversity is the variety of life – genes, species and ecosystems. Reefs with high biodiversity are usually more resilient to disturbances.'
      }
    ]
  },
  {
    id: 'cleaning-station',
    title: 'Cleaning station',
    brief: 'Somewhere on this reef is a cleaning station, where big animals line up to have parasites removed by tiny cleaner wrasse. Find it and photograph the cleaning in action. This is one of the best examples of mutualism in the ocean.',
    goal: { type: 'photo-behaviour', behaviour: 'cleaning' },
    hint: 'Watch for bigger fish – or a manta – hovering very still in one spot near a bommie.',
    questions: [
      {
        q: 'A cleaner wrasse eats parasites off a manta ray. Which type of symbiosis is this?',
        options: ['Parasitism', 'Commensalism', 'Mutualism', 'Competition'],
        answer: 2,
        explain: 'Both partners benefit: the wrasse gets food and the manta loses harmful parasites. That is mutualism.'
      },
      {
        q: 'A remora hitches a ride on a shark, eating scraps, while the shark is not affected. What is this?',
        options: ['Mutualism', 'Commensalism', 'Parasitism', 'Predation'],
        answer: 1,
        explain: 'In commensalism one species benefits and the other is neither helped nor harmed.'
      },
      {
        q: 'Gnathiid isopods feed on the blood of reef fish. What is their relationship with the fish?',
        options: ['Mutualism', 'Commensalism', 'Parasitism', 'Producer–consumer'],
        answer: 2,
        explain: 'Parasites benefit at the expense of their host. Cleaner wrasse control these parasites, which is why fish visit cleaning stations.'
      }
    ]
  },
  {
    id: 'reef-under-pressure',
    title: 'Reef under pressure',
    brief: 'The Great Barrier Reef has faced repeated mass bleaching events as oceans warm. In the lab, you will raise the water temperature and watch what happens inside a coral. Understanding bleaching helps us protect the reef and support its recovery.',
    goal: { type: 'lab', condition: 'bleaching' },
    hint: 'Watch the tiny algae inside the coral tissue as the temperature climbs.',
    questions: [
      {
        q: 'What actually happens when a coral bleaches?',
        options: [
          'The coral skeleton dissolves',
          'The coral expels its symbiotic algae (zooxanthellae), exposing its white skeleton',
          'The coral is covered in white sand',
          'The coral turns into a soft coral'
        ],
        answer: 1,
        explain: 'Heat stress damages the symbiosis, so the coral expels the algae that give it colour and most of its food. Bleached coral is still alive but starving, and may die if the heat lasts too long.'
      },
      {
        q: 'Scientists use "degree heating weeks" (DHW) to predict bleaching. What does it measure?',
        options: [
          'How many weeks a reef has been dived on',
          'How much and for how long water has been hotter than the usual summer maximum',
          'The number of hot days on land',
          'How deep the warm water reaches'
        ],
        answer: 1,
        explain: 'DHW adds up heat above the normal summer maximum over 12 weeks. Around 4 DHW, significant bleaching is likely; above about 8 DHW, severe bleaching and coral death are likely.'
      },
      {
        q: 'How can fertiliser running off farms lead to crown-of-thorns starfish outbreaks?',
        options: [
          'Fertiliser poisons the starfish\'s predators directly',
          'Extra nutrients boost phytoplankton, so more starfish larvae survive',
          'Fertiliser makes corals taste better',
          'Starfish eat the fertiliser'
        ],
        answer: 1,
        explain: 'Crown-of-thorns larvae feed on phytoplankton. Nutrient runoff causes phytoplankton blooms, helping many more larvae survive to become coral-eating adults.'
      }
    ]
  },
  {
    id: 'freedive-safe',
    title: 'Freediving physiology',
    brief: 'Freedivers explore on a single breath, helped by the mammalian dive reflex: cold water on your face slows your heart and shifts blood to your vital organs to save oxygen. Dive to 10 metres and feel the pressure change. Learn the rules that keep freedivers safe – starting with never diving alone.',
    goal: { type: 'depth', metres: 10 },
    hint: 'Equalise early and often on the way down – and dive with a buddy watching from the surface.',
    questions: [
      {
        q: 'At 10 m depth, the total pressure on your body is about:',
        options: ['The same as at the surface', '2 atmospheres – double the surface', '10 atmospheres', 'Half the surface pressure'],
        answer: 1,
        explain: 'Every 10 m of seawater adds about 1 atmosphere. With 1 atm of air above, the total at 10 m is about 2 atm, so air spaces in your lungs and ears are squeezed to half their volume.'
      },
      {
        q: 'Why do you become less buoyant (sink more easily) as you dive deeper?',
        options: [
          'Seawater gets lighter with depth',
          'The air in your lungs and the bubbles in your wetsuit are compressed by pressure',
          'Your weight belt gets heavier',
          'Cold water pulls you down'
        ],
        answer: 1,
        explain: 'Compressed air takes up less volume, so you displace less water and lose buoyancy. Below a certain depth, freedivers begin to sink without kicking.'
      },
      {
        q: 'What is shallow-water blackout, and how do freedivers stay safe from it?',
        options: [
          'Losing consciousness from low oxygen, usually near the surface – always dive with a buddy watching',
          'Getting dizzy from bright sunlight – wear dark goggles',
          'A cramp from cold water – wear a thicker wetsuit',
          'Ear pain from not equalising – dive faster'
        ],
        answer: 0,
        explain: 'As a diver ascends, falling pressure lowers oxygen in the lungs and they can black out with no warning, often in the last few metres. Never hyperventilate before a dive and never dive alone – one up, one down.'
      }
    ]
  }
];
