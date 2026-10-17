// Ecosystem registry. Each entry is a full ecosystem definition (see gbr.js for the shape).
import { gbr } from './gbr.js';

export const ECOSYSTEMS = [gbr];
export const PLANNED = [
  { id: 'rocky', name: 'NSW rocky reef & kelp', place: 'Illawarra, NSW', blurb: 'Cool, green water, kelp forests, blue gropers and weedy seadragons.' },
  { id: 'seagrass', name: 'Seagrass & mangroves', place: 'Estuary nursery', blurb: 'Nursery habitats for juvenile fish, rays and dugongs.' },
  { id: 'pelagic', name: 'Open ocean', place: 'Continental shelf edge', blurb: 'Bait balls, sharks, mantas and migrating humpback whales.' },
  { id: 'deep', name: 'Deep sea', place: 'Twilight zone, by submersible', blurb: 'Bioluminescence and life under crushing pressure.' },
];
export const ecoById = id => ECOSYSTEMS.find(e => e.id === id);
