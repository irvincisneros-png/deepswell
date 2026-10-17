// DeepSwell – Open ocean (pelagic) content: blue water off the NSW continental shelf
// Data only. Australian English. IUCN statuses checked October 2026.
// Notes for teachers:
//  - Humpback whale: IUCN Least Concern since 2018. The east Australian population recovered from a few
//    hundred animals when whaling ended in 1962–63 to tens of thousands, and the species was removed from the
//    EPBC Act threatened list (Feb 2022) and the NSW BC Act Vulnerable list (Nov 2022). Whales are still
//    protected, and NSW approach distances still apply.
//  - Bottlenose dolphin: Tursiops truncatus (common/offshore bottlenose, LC) is used because this is blue water
//    off the shelf. The Indo-Pacific bottlenose (T. aduncus, Near Threatened) is the inshore species found in
//    NSW bays and estuaries such as Port Stephens and Jervis Bay.
//  - Sunfish: Mola alexandrini (bump-head sunfish) is the species the Australian Museum documents in NSW
//    temperate waters; Mola mola (Vulnerable) and the hoodwinker sunfish (Mola tecta) also reach south-eastern
//    Australia. M. alexandrini has not yet had its own IUCN assessment (Not Evaluated) – the IUCN sunfish review
//    panel has recommended one.
//  - Bluebottle: a 2025 genomic study (Church et al., Current Biology) split Physalia into several species.
//    The Atlantic Portuguese man o' war is P. physalis; the Indo-Pacific bluebottle on NSW beaches is usually
//    called P. utriculus, but P. megalista and the newly described little bluebottle (P. minuta) also occur in
//    the south-west Pacific, so beach-cast bluebottles may not all be the same species.
//  - Moon jelly: Australian "Aurelia aurita" belongs to a species complex that genetic work is still sorting out.
//  - Loggerhead turtle: Vulnerable globally, but the South Pacific subpopulation (which nests mainly in
//    south-east Queensland and feeds off NSW) is Critically Endangered; Endangered under the EPBC Act and NSW BC Act.

export const species = [
  {
    id: 'humpback',
    common: 'Humpback whale',
    sci: 'Megaptera novaeangliae',
    group: 'mammal',
    feeding: 'filter feeder',
    trophic: 'Secondary consumer',
    size: 'Up to 16 m and about 40 tonnes',
    depth: '0–200 m (usually near the surface)',
    status: 'Least Concern (removed from Australian and NSW threatened lists in 2022)',
    statusCode: 'LC',
    role: 'A huge migrating filter feeder that moves nutrients across oceans – feeding in Antarctica and fertilising surface waters with nutrient-rich faeces.',
    interactions: [
      'Filter-feeds on Antarctic krill in summer, using baleen plates instead of teeth',
      'Calves can be attacked by orcas during migration (predation)',
      'Hosts barnacles and whale lice on its skin (commensalism and parasitism)'
    ],
    didYouKnow: 'Male humpbacks sing long, complex songs – and new songs from east Australian whales have been tracked spreading across the Pacific to French Polynesia within two years.',
    fieldNotes: 'East Australian humpbacks swim about 5000 km each way between Antarctic feeding grounds and calving grounds in the warm waters of the Great Barrier Reef, passing NSW heading north from about May to August and south from September to November. Whaling stations at Byron Bay and Tangalooma reduced the east coast population to a few hundred animals before whaling stopped in 1962–63. Since then the population has grown by around 10 % a year and is now estimated in the tens of thousands – one of the great conservation recoveries.',
    spot: 'Watch for a slow-moving giant passing through the blue, rising to the surface to breathe – look for the bushy spout of its blow and the long white flippers.',
    threats: 'Entanglement in fishing gear and shark nets, ship strikes, ocean noise, and warming that may reduce Antarctic krill.',
    sources: [
      'IUCN Red List – Megaptera novaeangliae',
      'NSW Threatened Species Scientific Committee 2022 – Humpback whale delisting determination',
      'Garland et al. 2011, Current Biology – Song transmission across the South Pacific'
    ]
  },
  {
    id: 'bottlenose',
    common: 'Common (offshore) bottlenose dolphin',
    sci: 'Tursiops truncatus',
    group: 'mammal',
    feeding: 'carnivore',
    trophic: 'Tertiary consumer',
    size: 'Up to about 3.8 m',
    depth: '0–500 m',
    status: 'Least Concern',
    statusCode: 'LC',
    role: 'An intelligent top predator of fish and squid that helps regulate prey populations in open water.',
    interactions: [
      'Hunts schooling fish and squid, often cooperating with its pod',
      'Feeds alongside common dolphins, tuna and seabirds at bait balls',
      'Large sharks such as tiger sharks prey on it, especially on calves'
    ],
    didYouKnow: 'Each bottlenose dolphin develops its own "signature whistle", which other dolphins copy to call it – a bit like a name.',
    fieldNotes: 'Offshore bottlenose dolphins are larger and more robust than the inshore Indo-Pacific bottlenose dolphin (Tursiops aduncus) found in NSW bays, an adaptation for deeper, colder water. They find prey by echolocation, sending out clicks and listening for echoes. Pods are often curious and may circle and play around divers, but swimmers must not approach closer than 30 m in NSW.',
    spot: 'Look for a playful pod of grey dolphins that loops around you, riding the swell and circling divers before racing off.',
    threats: 'Bycatch in fishing nets, entanglement, pollution that builds up in their bodies, and disturbance from boats.',
    sources: [
      'IUCN Red List – Tursiops truncatus',
      'Möller et al. 2008, Molecular Ecology – Tursiops species in eastern Australia',
      'NSW NPWS – Approach distances for whales, dolphins and dugongs'
    ]
  },
  {
    id: 'commondolphin',
    common: 'Short-beaked common dolphin',
    sci: 'Delphinus delphis',
    group: 'mammal',
    feeding: 'carnivore',
    trophic: 'Tertiary consumer',
    size: 'Up to about 2.5 m',
    depth: '0–300 m',
    status: 'Least Concern',
    statusCode: 'LC',
    role: 'A fast, social predator that works in groups to herd small schooling fish such as sardines into tight bait balls.',
    interactions: [
      'Cooperatively herds Australian sardines into bait balls (predation)',
      'Its herding helps shearwaters, tuna and sharks reach the trapped fish',
      'Preyed on by large sharks and orcas'
    ],
    didYouKnow: 'Common dolphins sometimes travel in "super-pods" of hundreds or even thousands of animals.',
    fieldNotes: 'Common dolphins are recognised by the hourglass pattern of yellow-tan and grey on their sides. When hunting, they surround a school of fish, blow bubbles and charge from below to push the fish into a tight ball against the surface, then take turns to dart through and feed. They are among the most abundant dolphins off NSW.',
    spot: 'Watch the dolphins with yellow-and-grey sides circling the bait ball, blowing bubbles and charging from below to herd the sardines tighter.',
    threats: 'Bycatch in trawl and gillnet fisheries, and overfishing of the small fish they rely on.',
    sources: [
      'IUCN Red List – Delphinus delphis',
      'Australian Museum – Common Dolphin, Delphinus delphis',
      'Neumann & Orams 2003, Aquatic Mammals – Feeding behaviours of common dolphins'
    ]
  },
  {
    id: 'sardine',
    common: 'Australian sardine (pilchard)',
    sci: 'Sardinops sagax',
    group: 'fish',
    feeding: 'planktivore',
    trophic: 'Primary and secondary consumer',
    size: 'Up to about 24 cm',
    depth: '0–200 m',
    status: 'Least Concern',
    statusCode: 'LC',
    role: 'A "forage fish" that turns plankton into food for almost every larger predator in the open ocean.',
    interactions: [
      'Filters phytoplankton and zooplankton such as krill from the water',
      'Eaten by dolphins, tuna, sharks, shearwaters and many other predators',
      'Schooling with thousands of others is its main defence (safety in numbers)'
    ],
    didYouKnow: 'A bait ball can contain tens of thousands of sardines that twist and turn together as if they were one animal.',
    fieldNotes: 'Sardines feed by swimming with their mouths open and straining plankton through comb-like gill rakers. Each fish follows simple rules – keep close to your neighbours and match their direction – which creates the flowing shapes of the school and confuses predators. When attacked from below they bunch into a tight ball near the surface, which helps against dolphins but makes them easy targets for diving seabirds.',
    spot: 'Find the shimmering, tightly packed ball of silver fish that pulses and splits apart whenever a predator charges through it.',
    threats: 'Fishing pressure (they are caught for bait and aquaculture feed) and changes in plankton caused by warming seas.',
    sources: [
      'IUCN Red List – Sardinops sagax',
      'Fishes of Australia – Australian Sardine, Sardinops sagax',
      'NSW DPI – Status of Australian fish stocks: Australian sardine'
    ]
  },
  {
    id: 'yellowfin',
    common: 'Yellowfin tuna',
    sci: 'Thunnus albacares',
    group: 'fish',
    feeding: 'carnivore',
    trophic: 'Tertiary consumer',
    size: 'Up to about 2.4 m and 200 kg',
    depth: '0–250 m',
    status: 'Least Concern',
    statusCode: 'LC',
    role: 'A fast, schooling open-ocean predator that links small fish and squid to the very top predators.',
    interactions: [
      'Hunts sardines, flyingfish and squid, often driving bait balls to the surface',
      'Preyed on by shortfin makos, large billfish and toothed whales',
      'Caught in commercial longline and recreational fisheries'
    ],
    didYouKnow: 'Tuna can keep their swimming muscles warmer than the surrounding water, which helps them sprint and hunt in cooler seas.',
    fieldNotes: 'Yellowfin tuna are built for speed: a torpedo-shaped body, a stiff crescent tail and fins that fold into grooves to reduce drag. They must keep swimming to push water over their gills (ram ventilation). Many arrive off NSW in summer and autumn, riding the warm water of the East Australian Current.',
    spot: 'Watch for a fast school of silver fish with bright yellow fins slashing straight through the bait ball.',
    threats: 'Overfishing, including catching juveniles near floating objects, and bycatch management in longline fisheries.',
    sources: [
      'IUCN Red List – Thunnus albacares (reassessed 2021)',
      'Fishes of Australia – Yellowfin Tuna, Thunnus albacares',
      'AFMA – Eastern Tuna and Billfish Fishery'
    ]
  },
  {
    id: 'bronzewhaler',
    common: 'Bronze whaler (copper shark)',
    sci: 'Carcharhinus brachyurus',
    group: 'shark',
    feeding: 'carnivore',
    trophic: 'Tertiary consumer',
    size: 'Up to about 3.3 m',
    depth: '0–100 m',
    status: 'Vulnerable',
    statusCode: 'VU',
    role: 'A large predator that follows schools of small fish, keeping prey populations healthy by taking weak and slow individuals.',
    interactions: [
      'Patrols and feeds on sardine schools and bait balls (predation)',
      'Competes with dolphins and tuna for the same prey',
      'Its young are eaten by larger sharks'
    ],
    didYouKnow: 'In South Africa, bronze whalers follow the famous "sardine run" up the coast in their thousands.',
    fieldNotes: 'Bronze whalers have a metallic bronze-grey back and no ridge between their dorsal fins, which helps tell them apart from similar whaler sharks. They give birth to live young (viviparity) after a pregnancy of about a year, and only breed every two years, so populations recover slowly from fishing. They are common in temperate coastal and shelf waters off southern Australia.',
    spot: 'Look for a bronze-coloured shark cruising slowly around the edge of the bait ball, patrolling for a chance to strike.',
    threats: 'Overfishing in commercial and recreational fisheries, made worse by its slow growth and low birth rate.',
    sources: [
      'IUCN Red List 2020 – Carcharhinus brachyurus',
      'Fishes of Australia – Bronze Whaler, Carcharhinus brachyurus',
      'CSIRO – Sharks and Rays of Australia (Last & Stevens)'
    ]
  },
  {
    id: 'mako',
    common: 'Shortfin mako shark',
    sci: 'Isurus oxyrinchus',
    group: 'shark',
    feeding: 'carnivore',
    trophic: 'Quaternary (apex) consumer',
    size: 'Up to about 4 m',
    depth: '0–500 m',
    status: 'Endangered',
    statusCode: 'EN',
    role: 'An apex predator of the open ocean that hunts fast fish such as tuna, helping keep the food web in balance.',
    interactions: [
      'Hunts tuna, other fast fish and squid (predation)',
      'Few natural predators other than orcas and larger sharks',
      'Often caught as bycatch on tuna longlines'
    ],
    didYouKnow: 'The shortfin mako is the fastest shark known, with bursts estimated at over 70 km/h, and it can leap several metres out of the water.',
    fieldNotes: 'Makos have a pointed snout, large dark eyes and a nearly symmetrical crescent tail – the same speed design as tuna, an example of convergent evolution. Like tuna, they keep their muscles and eyes warmer than the water (regional endothermy). Females may not breed until they are around 18–20 years old, which is why fishing has hit them so hard.',
    spot: 'Look for a sleek, metallic-blue shark that makes one very fast pass and disappears into the blue.',
    threats: 'Overfishing and bycatch on longlines; it is valued for meat and fins. Listed as a migratory species under Australian law (EPBC Act).',
    sources: [
      'IUCN Red List 2019 – Isurus oxyrinchus (Endangered)',
      'DCCEEW – Shortfin mako, Species Profile and Threats Database',
      'Fishes of Australia – Shortfin Mako, Isurus oxyrinchus'
    ]
  },
  {
    id: 'oceanicmanta',
    common: 'Giant oceanic manta ray',
    sci: 'Mobula birostris',
    group: 'ray',
    feeding: 'filter feeder',
    trophic: 'Secondary consumer',
    size: 'Wingspan up to about 7 m',
    depth: '0–1000 m',
    status: 'Endangered',
    statusCode: 'EN',
    role: 'A giant filter feeder that eats zooplankton and moves nutrients between the deep and the surface as it dives and rises.',
    interactions: [
      'Filter-feeds on krill and other zooplankton',
      'Visits cleaning stations where small fish remove parasites (mutualism)',
      'Remoras often ride on it (commensalism)'
    ],
    didYouKnow: 'Manta rays have one of the largest brains for their body size of any fish.',
    fieldNotes: 'The giant oceanic manta is larger than the reef manta (Mobula alfredi) and lives mostly offshore, travelling long distances and diving to great depths. It feeds by unrolling the fleshy cephalic fins beside its mouth to funnel plankton-rich water through its gills, often swimming in slow loops or somersaults through a plankton patch. Females usually give birth to a single pup every two to three years.',
    spot: 'Watch for a huge dark-backed ray gliding in slow loops near the surface with its mouth wide open, filter feeding.',
    threats: 'Targeted fishing for gill plates, bycatch in nets and longlines, and boat strikes; its slow breeding makes recovery hard.',
    sources: [
      'IUCN Red List 2020 – Mobula birostris (Endangered)',
      'Marshall et al. 2009, Zootaxa – Reef and oceanic manta species',
      'DCCEEW – Giant manta ray, Species Profile and Threats Database'
    ]
  },
  {
    id: 'sunfish',
    common: 'Bump-head sunfish (giant sunfish)',
    sci: 'Mola alexandrini',
    group: 'fish',
    feeding: 'carnivore',
    trophic: 'Secondary and tertiary consumer',
    size: 'Up to about 3.3 m and over 2 tonnes',
    depth: '0–600 m',
    status: 'Not Evaluated (no separate IUCN assessment yet; the related Mola mola is Vulnerable)',
    statusCode: 'NE',
    role: 'One of the main predators of jellyfish, salps and other gelatinous animals in the open ocean.',
    interactions: [
      'Eats salps, jellyfish and siphonophores (predation)',
      'Lets seabirds and small fish pick parasites off its skin while basking (mutualism)',
      'Caught as bycatch on longlines'
    ],
    didYouKnow: 'A bump-head sunfish found off the Azores in 2021 weighed 2744 kg – the heaviest bony fish ever recorded.',
    fieldNotes: 'Sunfish have no proper tail; instead they flap their tall dorsal and anal fins together like wings. They dive into deep, cold water to feed and then lie on their side at the surface to warm up in the sun, which is where they get their name. The bump-head sunfish was long confused with the ocean sunfish (Mola mola) and was only properly redescribed in 2018.',
    spot: 'Look near the surface for a huge, flat, disc-shaped fish lying on its side to bask, with a tall fin occasionally flopping out of the water.',
    threats: 'Bycatch in longline and drift-net fisheries, swallowing plastic bags mistaken for jellyfish, and boat strikes.',
    sources: [
      'Australian Museum – Bump-head Sunfish, Mola alexandrini',
      'Sawai et al. 2018, Ichthyological Research – Redescription of Mola alexandrini',
      'Sawai et al. 2022, Journal of Fish Biology – Heaviest bony fish record'
    ]
  },
  {
    id: 'loggerhead',
    common: 'Loggerhead turtle',
    sci: 'Caretta caretta',
    group: 'reptile',
    feeding: 'carnivore',
    trophic: 'Secondary and tertiary consumer',
    size: 'Shell up to about 1 m; over 100 kg',
    depth: '0–200 m',
    status: 'Vulnerable (global); South Pacific subpopulation Critically Endangered (Endangered in Australia and NSW)',
    statusCode: 'VU',
    role: 'A long-lived predator that crunches shellfish as an adult and eats jellyfish and bluebottles while drifting in the open ocean as a juvenile.',
    interactions: [
      'Juveniles eat bluebottles, jellyfish and salps in open water',
      'Adults crush crabs and molluscs with powerful jaws',
      'Barnacles and algae grow on its shell (commensalism)'
    ],
    didYouKnow: 'The temperature of the sand decides a loggerhead hatchling\'s sex – warmer nests produce mostly females.',
    fieldNotes: 'Most South Pacific loggerheads hatch on beaches in south-east Queensland, such as Mon Repos near Bundaberg. Hatchlings are swept south by the East Australian Current and spend many years drifting across the South Pacific before returning to coastal feeding grounds. As reptiles they breathe air, so they must surface regularly, but they can hold their breath for long periods while resting.',
    spot: 'Look for a large turtle with a reddish-brown shell and big head cruising steadily, then rising to the surface to breathe.',
    threats: 'Bycatch in longlines and trawls, swallowing plastic, fox predation on nests, light pollution near nesting beaches, and rising sand temperatures.',
    sources: [
      'IUCN Red List 2015 – Caretta caretta, South Pacific subpopulation (Critically Endangered)',
      'DCCEEW – Recovery Plan for Marine Turtles in Australia',
      'Queensland Government – Mon Repos turtle nesting'
    ]
  },
  {
    id: 'shearwater',
    common: 'Short-tailed shearwater (muttonbird)',
    sci: 'Ardenna tenuirostris',
    group: 'bird',
    feeding: 'carnivore',
    trophic: 'Secondary and tertiary consumer',
    size: 'About 42 cm long; wingspan about 1 m',
    depth: 'Surface; dives to around 20 m (occasionally deeper)',
    status: 'Least Concern',
    statusCode: 'LC',
    role: 'A seabird that links ocean food webs to the land, feeding at sea and bringing nutrients back to its breeding islands.',
    interactions: [
      'Plunges into bait balls to catch small fish and krill (predation)',
      'Benefits when dolphins and tuna drive prey to the surface',
      'Its burrows and droppings fertilise breeding islands in Tasmania and south-east Australia'
    ],
    didYouKnow: 'Each year short-tailed shearwaters fly a giant figure-of-eight around the Pacific – from Tasmania to the Bering Sea near Alaska and back.',
    fieldNotes: 'Shearwaters get their name from the way they skim low over the waves on stiff wings, almost "shearing" the water. They dive from the surface and use their wings to "fly" underwater after prey. Huge flocks pass along the NSW coast during migration, and after long flights or marine heatwaves exhausted birds sometimes wash up dead in "wrecks".',
    spot: 'Watch the surface above the bait ball: brown seabirds plunge-dive into the water and swim down after the fish.',
    threats: 'Starvation linked to warming seas and changes in prey, plastic ingestion, bycatch on longlines, and introduced predators at colonies.',
    sources: [
      'BirdLife International – Ardenna tenuirostris (IUCN Least Concern)',
      'Carey et al. 2014, Emu – Trans-equatorial migration of short-tailed shearwaters',
      'Australian Museum – Short-tailed Shearwater'
    ]
  },
  {
    id: 'bluebottle',
    common: 'Bluebottle (Indo-Pacific man o\' war)',
    sci: 'Physalia utriculus',
    group: 'invertebrate',
    feeding: 'carnivore',
    trophic: 'Secondary consumer',
    size: 'Float up to about 15 cm; tentacles several metres long',
    depth: 'Surface',
    status: 'Not Evaluated',
    statusCode: 'NE',
    role: 'A drifting predator that catches small fish and larvae at the surface, and is food for turtles, sunfish and blue sea slugs.',
    interactions: [
      'Stings and eats small fish and larvae (predation)',
      'Eaten by loggerhead turtles and the blue sea slug (Glaucus atlanticus), which stores its stinging cells',
      'Small fish shelter among its tentacles (commensalism)'
    ],
    didYouKnow: 'A bluebottle is not one animal but a colony of specialised zooids – some for floating, some for stinging, some for digesting and some for reproducing.',
    fieldNotes: 'Bluebottles are siphonophores, relatives of jellyfish. The gas-filled float acts as a sail, so the colony is pushed by the wind – which is why onshore winds bring mass strandings to NSW beaches in summer. For years the Atlantic Portuguese man o\' war (Physalia physalis) and the Australian bluebottle were treated as one species, but a 2025 genetic study confirmed several species, including P. utriculus and the newly described little bluebottle (P. minuta).',
    spot: 'Look up at the surface for small blue, balloon-like floats drifting with the wind, trailing long blue stinging tentacles below.',
    threats: 'Not considered threatened; numbers vary hugely with winds and currents.',
    sources: [
      'Church et al. 2025, Current Biology – Population genomics of Physalia',
      'Australian Museum – Bluebottle',
      'Surf Life Saving NSW – Bluebottle stings and first aid'
    ]
  },
  {
    id: 'salp',
    common: 'Salp',
    sci: 'Thalia democratica',
    group: 'invertebrate',
    feeding: 'filter feeder',
    trophic: 'Primary consumer',
    size: 'Individuals 1–2 cm; chains up to tens of centimetres',
    depth: '0–200 m',
    status: 'Not Evaluated',
    statusCode: 'NE',
    role: 'A fast-growing gelatinous grazer that filters phytoplankton and sends carbon to the deep sea in its sinking faeces.',
    interactions: [
      'Filters phytoplankton such as diatoms (grazing)',
      'Eaten by sunfish, turtles and some fish',
      'Competes with krill for phytoplankton'
    ],
    didYouKnow: 'Although they look like jellyfish, salps are tunicates – more closely related to animals with backbones than to jellyfish.',
    fieldNotes: 'Salps swim by jet propulsion, pumping water through their barrel-shaped bodies and filtering food on a mucus net at the same time. Their life cycle alternates between a solitary stage that buds off long chains of clones and a chained stage that reproduces sexually. When food is plentiful they can multiply extremely fast, forming huge swarms off NSW.',
    spot: 'Look for transparent, jelly-like chains of linked barrels drifting slowly through the blue.',
    threats: 'Not considered threatened; their swarms may become more common as oceans warm.',
    sources: [
      'Henschke et al. 2014, Journal of Plankton Research – Salp blooms off eastern Australia',
      'Australian Museum – Salps',
      'IMOS – Australian Continuous Plankton Recorder'
    ]
  },
  {
    id: 'krill',
    common: 'Coastal krill',
    sci: 'Nyctiphanes australis',
    group: 'invertebrate',
    feeding: 'omnivore',
    trophic: 'Primary consumer',
    size: 'Up to about 2 cm',
    depth: '0–200 m',
    status: 'Not Evaluated',
    statusCode: 'NE',
    role: 'A key zooplankton species that passes energy from phytoplankton up to fish, seabirds and whales.',
    interactions: [
      'Grazes phytoplankton such as diatoms',
      'Eaten by sardines, shearwaters, manta rays and many other predators',
      'Competes with salps for phytoplankton'
    ],
    didYouKnow: 'Krill have light-producing organs and can glow blue-green in the dark sea.',
    fieldNotes: 'Krill are small crustaceans, related to prawns and crabs. Nyctiphanes australis is the most common krill in shelf waters of south-eastern Australia and can form dense surface swarms where nutrients are high. Many zooplankton migrate up towards the surface at night to feed and down into darker water by day to avoid predators.',
    spot: 'Look for shimmering clouds of tiny pinkish specks drifting in the water column.',
    threats: 'Warming and stratifying seas can reduce the phytoplankton they depend on.',
    sources: [
      'Australian Antarctic Division – Krill biology',
      'IMOS – Australian Continuous Plankton Recorder',
      'Ritz & Hosie 1982, Australian Journal of Marine and Freshwater Research – Nyctiphanes australis'
    ]
  },
  {
    id: 'phytoplankton',
    common: 'Diatoms (phytoplankton)',
    sci: 'Chaetoceros spp.',
    group: 'algae',
    feeding: 'photosynthetic',
    trophic: 'Producer',
    size: 'Cells 0.01–0.05 mm, often in chains',
    depth: '0–100 m (sunlit zone)',
    status: 'Not Evaluated',
    statusCode: 'NE',
    role: 'The base of the open-ocean food web, turning sunlight and nutrients into food and producing a large share of the oxygen we breathe.',
    interactions: [
      'Eaten by krill, salps, sardines and other grazers',
      'Needs nutrients brought up by upwelling and eddies',
      'Competes with other phytoplankton for light and nutrients'
    ],
    didYouKnow: 'Phytoplankton produce about half of all the oxygen made by photosynthesis on Earth.',
    fieldNotes: 'Diatoms are single-celled algae enclosed in a glassy shell of silica. Chaetoceros cells link into chains with long spines that help them stay suspended in sunlit water. When cold, nutrient-rich water is pushed up by upwelling or swirling eddies of the East Australian Current, diatoms can bloom rapidly, turning the water green and feeding the whole food web.',
    spot: 'Look for a glittering haze of tiny green-gold particles in the sunlit water – a phytoplankton bloom.',
    threats: 'Warming makes the surface layer more stratified, which blocks nutrient supply from below and can reduce blooms.',
    sources: [
      'IMOS – Australian Phytoplankton Database',
      'Field et al. 1998, Science – Global primary production',
      'CSIRO – East Australian Current and ocean productivity'
    ]
  },
  {
    id: 'moonjelly',
    common: 'Moon jellyfish',
    sci: 'Aurelia aurita (species complex)',
    group: 'invertebrate',
    feeding: 'carnivore',
    trophic: 'Secondary consumer',
    size: 'Bell up to about 40 cm',
    depth: '0–50 m',
    status: 'Not Evaluated',
    statusCode: 'NE',
    role: 'A drifting predator of zooplankton and fish larvae that can bloom in huge numbers, changing food webs.',
    interactions: [
      'Catches zooplankton and fish eggs with stinging cells (predation)',
      'Eaten by sunfish and turtles',
      'Competes with small fish for zooplankton'
    ],
    didYouKnow: 'Jellyfish have no brain, heart or bones – and their bodies are about 95 % water.',
    fieldNotes: 'You can recognise moon jellies by the four horseshoe-shaped reproductive organs (gonads) seen through the clear bell. Their life cycle alternates between a free-swimming medusa and a tiny polyp that sticks to hard surfaces and buds off baby jellyfish. Their sting is mild for humans. Scientists now know "Aurelia aurita" is a group of similar-looking species, and the Australian ones are still being sorted out.',
    spot: 'Look for a clear, saucer-shaped jellyfish with four pale rings in its bell, slowly pulsing as it drifts.',
    threats: 'Not considered threatened; overfishing and warming can actually favour jellyfish blooms.',
    sources: [
      'Australian Museum – Moon Jellyfish, Aurelia aurita',
      'Dawson & Jacobs 2001, Biological Bulletin – Molecular evidence for cryptic Aurelia species',
      'Richardson et al. 2009, Trends in Ecology & Evolution – The jellyfish joyride'
    ]
  },
  {
    id: 'flyingfish',
    common: 'Australasian (tallfin) flyingfish',
    sci: 'Cheilopogon pinnatibarbatus melanocercus',
    group: 'fish',
    feeding: 'planktivore',
    trophic: 'Secondary consumer',
    size: 'Up to about 45 cm',
    depth: '0–10 m',
    status: 'Least Concern',
    statusCode: 'LC',
    role: 'A surface-dwelling fish that eats zooplankton and is important prey for tuna, dolphins and seabirds.',
    interactions: [
      'Feeds on zooplankton near the surface',
      'Chased by tuna, mahi-mahi and dolphins (predation)',
      'Escapes underwater predators by gliding out of the water, where seabirds may still catch it'
    ],
    didYouKnow: 'Flyingfish can glide for over 200 m by touching their tail back into the water to "taxi" and take off again.',
    fieldNotes: 'Flyingfish do not flap their fins. They swim fast towards the surface, launch into the air and spread their huge wing-like pectoral and pelvic fins to glide. The lower lobe of the tail is longer, so it can be beaten in the water to gain speed for another glide. The Australasian subspecies was first described from a specimen caught in Middle Harbour, Sydney.',
    spot: 'Watch the surface when predators attack: silvery fish burst out of the water and glide away on wing-like fins.',
    threats: 'Not considered threatened; may be affected by changes in plankton and surface temperatures.',
    sources: [
      'Fishes of Australia – Tallfin Flyingfish, Cheilopogon pinnatibarbatus',
      'IUCN Red List – Cheilopogon pinnatibarbatus',
      'Australian Museum – Flying without wings (flyingfishes)'
    ]
  }
];

export const missions = [
  {
    id: 'bait-ball',
    title: 'Bait ball',
    brief: 'Out in the blue, food is patchy – and when a school of sardines is found, everything comes to feed. Dolphins herd the fish into a tight ball, tuna and sharks charge through it and shearwaters dive in from above. Photograph a predator hunting the bait ball.',
    goal: { type: 'photo-behaviour', behaviour: 'hunting' },
    hint: 'Follow the dolphins and the diving seabirds – the bait ball is usually just below them, near the surface.',
    questions: [
      {
        q: 'Why do sardines swim in tight schools?',
        options: [
          'To keep warm',
          'Schooling confuses predators and lowers each fish\'s chance of being eaten',
          'So they can photosynthesise together',
          'Because they cannot see each other otherwise'
        ],
        answer: 1,
        explain: 'Thousands of fish moving together make it hard for a predator to single one out (the confusion effect), and each individual has a smaller chance of being caught – safety in numbers.'
      },
      {
        q: 'Common dolphins herd sardines into a ball, then shearwaters and tuna also feed on it. What does this show?',
        options: [
          'Predators can benefit from each other\'s hunting, even across species',
          'Shearwaters are parasites of dolphins',
          'Sardines are producers',
          'Dolphins and tuna never compete'
        ],
        answer: 0,
        explain: 'Dolphins cooperate to trap the fish against the surface, which also makes them easy for other predators. Different predators gain from the herding, although they still compete for the same food.'
      },
      {
        q: 'In the food chain diatoms → krill → sardine → yellowfin tuna → shortfin mako, which organism is the tertiary consumer?',
        options: ['Krill', 'Sardine', 'Yellowfin tuna', 'Shortfin mako'],
        answer: 2,
        explain: 'Diatoms are producers, krill are primary consumers, sardines are secondary consumers, so the tuna is the tertiary consumer and the mako at the top is a quaternary (apex) consumer.'
      }
    ]
  },
  {
    id: 'blue-water-census',
    title: 'Blue-water census',
    brief: 'Open-ocean animals live very differently from reef animals – there is nowhere to hide, and food may be hundreds of kilometres away. Photograph four different fish, sharks or rays and look at how their bodies are built for life in the blue.',
    goal: { type: 'photo-species', count: 4, filter: { group: ['fish', 'shark', 'ray'] } },
    hint: 'Fast swimmers gather around the bait ball, while the slow giants – the sunfish and manta – are found near the surface or looping through plankton.',
    questions: [
      {
        q: 'Tuna and mako sharks both have a torpedo-shaped body and a crescent-shaped tail. Why?',
        options: [
          'They are closely related',
          'Both shapes are adaptations for fast, efficient swimming in open water',
          'It helps them hide in coral',
          'It helps them walk on the sea floor'
        ],
        answer: 1,
        explain: 'Tuna are bony fish and makos are sharks, so they are not close relatives. They evolved similar streamlined shapes because they face the same challenge – chasing fast prey across open water. This is convergent evolution.'
      },
      {
        q: 'Many open-ocean fish are dark blue on top and silver-white underneath. What is this colouring for?',
        options: [
          'Attracting mates on the reef',
          'Countershading – camouflage from predators and prey above and below',
          'Absorbing heat from the sun',
          'Warning other fish that they are poisonous'
        ],
        answer: 1,
        explain: 'Seen from above, a dark back blends with the deep blue water; seen from below, a pale belly blends with the bright surface. With no reef to hide in, countershading is one of the best defences in open water.'
      },
      {
        q: 'Why are sharks such as the shortfin mako especially threatened by overfishing?',
        options: [
          'They lay millions of eggs every year',
          'They grow slowly, mature late and have few young',
          'They only live for about two years',
          'They cannot swim away from boats'
        ],
        answer: 1,
        explain: 'Female makos may not breed until they are about 18–20 years old and have only a small number of pups every few years, so populations take a long time to recover when too many are caught.'
      }
    ]
  },
  {
    id: 'whale-highway',
    title: 'Whale highway',
    brief: 'Every winter tens of thousands of humpback whales swim north past NSW on the "humpback highway". Photograph two different marine mammals – but remember, they are wild animals, and NSW law sets how close you can get.',
    goal: { type: 'photo-species', count: 2, filter: { group: 'mammal' } },
    hint: 'Look and listen for blows at the surface, and check around the bait ball for dolphins.',
    questions: [
      {
        q: 'Whales and dolphins must come to the surface regularly. Why?',
        options: [
          'To warm up in the sun',
          'They are mammals and breathe air using lungs',
          'To drink fresh rainwater',
          'To clean their gills'
        ],
        answer: 1,
        explain: 'Marine mammals have lungs, not gills. They breathe through a blowhole on top of the head – the "blow" you see is warm, moist air being breathed out.'
      },
      {
        q: 'The east Australian humpback population was reduced to a few hundred animals by whaling. What happened after whaling stopped in the early 1960s?',
        options: [
          'The population kept falling and they are now extinct',
          'The population stayed the same',
          'The population recovered strongly and is now estimated in the tens of thousands',
          'They stopped migrating past NSW'
        ],
        answer: 2,
        explain: 'Protected from hunting, the population grew by around 10 % a year. In 2022 humpbacks were removed from the Australian and NSW threatened species lists – although they are still protected and face threats like entanglement and ship strikes.'
      },
      {
        q: 'Under NSW rules, how close can a boat (including a surfboard or kayak) approach an adult humpback whale?',
        options: ['10 m', '30 m', '100 m', '1 km'],
        answer: 2,
        explain: 'Vessels must stay at least 100 m from a whale (300 m if a calf is present) and 50 m from a dolphin. Swimmers must not approach closer than 30 m, and any mostly-white whale must be given 500 m.'
      }
    ]
  },
  {
    id: 'plankton-power',
    title: 'Plankton power',
    brief: 'The open ocean is often called a "blue desert" because clear blue water is low in nutrients. But where swirling eddies of the East Australian Current lift cold, nutrient-rich water into the light, phytoplankton bloom. Use the lab to create a bloom and trace where that energy goes.',
    goal: { type: 'lab', condition: 'bloom' },
    hint: 'Phytoplankton need both sunlight and nutrients – try bringing deep, cold water up towards the surface.',
    questions: [
      {
        q: 'Why does upwelling cause phytoplankton to bloom?',
        options: [
          'It makes the water warmer',
          'It brings nutrients from deep water up into the sunlit zone',
          'It pushes predators away',
          'It adds salt to the water'
        ],
        answer: 1,
        explain: 'Dead material sinks and is broken down at depth, so deep water is rich in nutrients such as nitrate. When that water rises into sunlight, phytoplankton have everything they need to photosynthesise and multiply.'
      },
      {
        q: 'A bloom of diatoms is followed weeks later by more krill, then more sardines, then more dolphins and tuna. What does this show?',
        options: [
          'Energy flows from producers up through consumers in a food web',
          'Dolphins produce food for diatoms',
          'Krill are producers',
          'Energy increases at each step of the food chain'
        ],
        answer: 0,
        explain: 'Producers capture energy from sunlight, and it passes up to consumers when they are eaten. Only about 10 % of the energy is passed on at each step, which is why there are far fewer top predators than plankton.'
      },
      {
        q: 'As the ocean warms, the surface layer becomes more stratified (layered). How might this affect the food web?',
        options: [
          'More nutrients reach the surface, so plankton increase',
          'Warm surface water floats on top and blocks nutrients from mixing up, so plankton can decline',
          'It has no effect on plankton',
          'It turns phytoplankton into krill'
        ],
        answer: 1,
        explain: 'Warm water is less dense, so a warm surface layer resists mixing with the cold, nutrient-rich water below. Fewer nutrients reach the light, which can reduce phytoplankton and everything that depends on them. The Tasman Sea is warming several times faster than the global average.'
      }
    ]
  },
  {
    id: 'blue-water-safety',
    title: 'Blue-water freediving',
    brief: 'In open water there is no reef and no sea floor to look at – just blue in every direction. Freedivers call this "blue orientation", and it makes it easy to lose track of depth. Dive safely to 15 m and learn how freedivers stay safe in the blue.',
    goal: { type: 'depth', metres: 15 },
    hint: 'Watch your depth gauge rather than the water around you, equalise your ears early and often, and always dive with your buddy watching from the surface.',
    questions: [
      {
        q: 'Why do blue-water freedivers often dive down a weighted line and wear a lanyard attached to it?',
        options: [
          'To go faster',
          'The line gives a visual reference and the lanyard stops them drifting away or sinking too deep',
          'To catch fish',
          'Because it is warmer near the line'
        ],
        answer: 1,
        explain: 'Without a sea floor, divers can lose track of direction and depth. A line gives a fixed reference, and a lanyard keeps the diver attached so they cannot sink out of reach or drift away in a current.'
      },
      {
        q: 'A freediver takes a breath at the surface. At 10 m depth the water pressure has doubled. What happens to the air in their lungs?',
        options: [
          'It doubles in volume',
          'It stays the same',
          'It is squeezed to about half its volume',
          'It turns into liquid'
        ],
        answer: 2,
        explain: 'Pressure increases by about 1 atmosphere every 10 m. At 10 m the pressure is 2 atmospheres, so the air in the lungs is compressed to about half its surface volume (Boyle\'s law). This is why ears and masks need equalising.'
      },
      {
        q: 'Below about 10–15 m, freedivers often stop swimming and sink without effort. Why?',
        options: [
          'The water gets less salty',
          'The compressed air in their lungs and wetsuit makes them denser than the water, so they become negatively buoyant',
          'Sharks pull them down',
          'They are breathing out bubbles'
        ],
        answer: 1,
        explain: 'As air spaces shrink, the diver displaces less water and becomes negatively buoyant, so they "freefall". This saves oxygen on the way down but means they must swim harder on the way up – one reason freedivers always dive "one up, one down" with a buddy watching.'
      }
    ]
  }
];
