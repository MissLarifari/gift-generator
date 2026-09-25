import {
  AlignVerticalJustifyCenter, ArrowDown, ArrowRightLeft, Bird, Cake, Cat, Church, Clock, Clover,
  Columns2, Crown, Drumstick, Egg, Eye, Feather, Flame, Flower, Flower2, Frame, Ghost, Gift,
  HandHeart, Heart, HeartHandshake, Infinity as InfinityIcon, Laugh, Moon, NotebookPen, PartyPopper, Quote,
  Rainbow, Smile, Sparkle, Sparkles, Sprout, Star, StickyNote, Thermometer, Tornado, TreePine,
  Users, VenetianMask, Wine, Zap, type LucideIcon,
} from 'lucide-react';

/**
 * One small picture per category, for the headings in the gift list.
 *
 * A column of thirty names in the same weight reads as a wall; a picture in
 * front of each gives the eye something to aim at, and half of them are
 * recognised before the word is. Nothing depends on them — they are decoration
 * over a label that already says the same thing, so an unmapped category just
 * gets the gift box.
 *
 * Repeats are allowed on purpose: a layout and its variant are the same idea
 * twice, and so are Blütenband and Blütenband · Mini.
 */
const BY_LOOK: Record<string, LucideIcon> = {
  heartSmile: Flower2, favoriteTrouble: Flower2,
  sweetTemptation: Sparkles, littleMagic: Sparkles,
  homeIsYou: ArrowDown, alwaysYou: ArrowDown,
  sneakyHeart: Quote, stolenHeart: Quote,
  littleDetour: ArrowRightLeft, bestDetour: ArrowRightLeft,
  happyPlace: Frame, oneMoreKiss: Frame,
  flyingHug: Bird,
  guiltyCute: AlignVerticalJustifyCenter,
};

const BY_LABEL: Record<string, LucideIcon> = {
  'Little Notes': StickyNote,
  'Cute Notes': NotebookPen,
  'Two Parts': Columns2,
  'Friends': Users,
  'Friends / Roast': Zap,
  'Romance': Heart,
  'Cute': Cat,
  'Funny': Laugh,
  'Funny / Chaotic': Tornado,
  'Flirty bold': Sparkle,
  'Wicked': VenetianMask,
  'Spicy': Flame,
  'Dominant': Crown,
  'Submissive': Feather,
  'Voyeur': Eye,
  'Aftercare': HandHeart,
  'Horny': Thermometer,
  'That Was Insane': Star,
  'Still Thinking': Clock,
  'Tease': Smile,
  'Goth / Dark': Moon,
  'Drunk vibes': Wine,
  'Soft / Cottagecore': Sprout,
  'Pride': Rainbow,
  'Valentine': HeartHandshake,
  'Womens Day': Flower,
  'St Patricks': Clover,
  'Easter': Egg,
  '4th of July': Sparkles,
  'Halloween': Ghost,
  'Thanksgiving': Drumstick,
  'Hanukkah': Star,
  'Christmas': TreePine,
  'New Year': PartyPopper,
  'Birthday': Cake,
  'Wedding': Church,
  'Anniversary': InfinityIcon,
};

/** The picture for a category — by its layout where it has one, else by name. */
export const categoryIcon = (label: string, lookId?: string): LucideIcon =>
  (lookId && BY_LOOK[lookId]) || BY_LABEL[label] || Gift;
