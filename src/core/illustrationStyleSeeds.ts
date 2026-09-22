import type { IllustrationStyle } from "./illustrationStyle";

const PLACEHOLDER_PROMPT = "Placeholder prompt text — replace via the style's edit view once the real wording is ready.";

/**
 * Starting library entries. Four genres still carry placeholder prompt text pending
 * their own batch; Literary/Realistic, Historical/Vintage, Detective/Noir, and Adventure
 * carry the real wording the author supplied, six named variants each.
 */
export const BUILTIN_ILLUSTRATION_STYLES: IllustrationStyle[] = [
  {
    id: "builtin-storybook",
    name: "Bold flat-color storybook",
    promptText: PLACEHOLDER_PROMPT,
    genreTags: ["Children's book"],
    origin: "builtin"
  },
  {
    id: "builtin-fantasy",
    name: "Painterly epic fantasy",
    promptText: PLACEHOLDER_PROMPT,
    genreTags: ["Fantasy"],
    origin: "builtin"
  },
  {
    id: "builtin-scifi",
    name: "Neon-lit cyberpunk",
    promptText: PLACEHOLDER_PROMPT,
    genreTags: ["Sci-fi"],
    origin: "builtin"
  },
  {
    id: "builtin-horror",
    name: "Ink-wash gothic",
    promptText: PLACEHOLDER_PROMPT,
    genreTags: ["Horror/Gothic"],
    origin: "builtin"
  },
  {
    id: "builtin-literary-1",
    name: "Nordic realism & atmospheric nature",
    promptText:
      "Atmospheric Nordic realism book cover illustration, painterly oil painting style with visible textured brushstrokes, quiet reflective solitary figure standing by a foggy lake at dawn, muted earthy palette of moss green, slate gray, pale sky blue, and warm ochre light, melancholic introspective literary mood, textless, no text, no captions, no titles, no printed words, clean illustration without typography.",
    genreTags: ["Literary/Realistic"],
    origin: "builtin"
  },
  {
    id: "builtin-literary-2",
    name: "Contemporary quiet everyday realism",
    promptText:
      "Contemporary literary fiction cover artwork, loose expressive gouache painting style, sunlight streaming through a window onto a quiet dining table with coffee cup and open journal, soft warm sunlight, pastel palette of terracotta, sage, warm cream, and soft amber, intimate grounded realism aesthetic, textless, no text, no captions, no titles, no printed words, clean illustration without typography.",
    genreTags: ["Literary/Realistic"],
    origin: "builtin"
  },
  {
    id: "builtin-literary-3",
    name: "Impressionistic urban realism",
    promptText:
      "Impressionistic urban realism book illustration, soft textured oil paint on canvas, rainy city street scene at dusk with blurred reflections in puddles, solitary figure walking with an umbrella, rich deep palette of indigo blue, warm streetlamp yellow, burnt umber, and charcoal, emotional evocative narrative tone, textless, no text, no captions, no titles, no printed words, clean illustration without typography.",
    genreTags: ["Literary/Realistic"],
    origin: "builtin"
  },
  {
    id: "builtin-literary-4",
    name: "Magical realism & rural landscape",
    promptText:
      "Subtle magical realism illustration, detailed gouache and watercolor art, realistic rural landscape blending with dreamlike floating autumn leaves and glowing soft light, muted natural color palette of deep rust, sage green, dusty rose, and parchment cream, poetic haunting atmosphere, textless, no text, no captions, no titles, no printed words, clean illustration without typography.",
    genreTags: ["Literary/Realistic"],
    origin: "builtin"
  },
  {
    id: "builtin-literary-5",
    name: "Psychological drama & character study",
    promptText:
      "Psychological realism character study, moody portrait illustration in dry pastel and charcoal style, dramatic natural side lighting, expressive textured shading, desaturated tones of deep navy, ochre, soft gray, and warm beige, intimate character-driven drama atmosphere, textless, no text, no captions, no titles, no printed words, clean illustration without typography.",
    genreTags: ["Literary/Realistic"],
    origin: "builtin"
  },
  {
    id: "builtin-literary-6",
    name: "Pastoral memory prose & coming-of-age",
    promptText:
      "Pastoral literary realism book cover artwork, soft painterly impressionist style, quiet rural field under an overcast golden hour sky, subtle wind blowing through high grass, natural organic colors of wheat yellow, olive green, warm earth brown, and soft hazy white, nostalgic reflective mood, textless, no text, no captions, no titles, no printed words, clean illustration without typography.",
    genreTags: ["Literary/Realistic"],
    origin: "builtin"
  },
  {
    id: "builtin-historical-1",
    name: "Victorian woodcut & engraving (19th century)",
    promptText:
      "Victorian 19th-century historical period book illustration, fine black ink engraving and woodcut print style, intricate vertical hatching and cross-hatching shading techniques, monochrome black and white on aged cream paper backdrop, vintage periodical artwork aesthetic, highly detailed historical costume and domestic interior, quiet classic period drama atmosphere, textless, no text, no captions, no titles, no printed words, clean illustration without typography.",
    genreTags: ["Historical/Vintage"],
    origin: "builtin"
  },
  {
    id: "builtin-historical-2",
    name: "Hand-colored engraving & fairytale watercolor",
    promptText:
      "Classic 19th-century storybook illustration, hand-colored woodblock engraving and fine steel etching, intricate pen and ink cross-hatching, hand-tinted soft watercolor washes, vintage Victorian fairytale art style, muted palette of teal blue, ochre yellow, soft olive green, and warm ivory, whimsical historical fantasy aesthetic, vignette framing on aged parchment paper, textless, no text, no captions, no titles, no printed words, clean illustration without typography.",
    genreTags: ["Historical/Vintage"],
    origin: "builtin"
  },
  {
    id: "builtin-historical-3",
    name: "1930s lithographic poster & screen print",
    promptText:
      "Vintage 1930s travel poster illustration, WPA poster style, screen print art, flat color blocks, bold graphic silhouettes, clean defined linework, retro lithography aesthetic, muted classic color palette of deep forest green, navy blue, olive green, cream white, and warm amber accents, idyllic nostalgia, peaceful outdoor summer scene, textless, no text, no captions, no titles, no printed words, clean illustration without typography.",
    genreTags: ["Historical/Vintage"],
    origin: "builtin"
  },
  {
    id: "builtin-historical-4",
    name: "Edwardian pastoral storybook illustration",
    promptText:
      "Classic Edwardian pastoral storybook illustration, fine pen and ink cross-hatching with soft colored pencil shading, traditional vintage British children's book aesthetic, cozy winter woodland scene, cool icy blue snow contrasting with warm glowing doorway light, soft muted palette of snow white, moss green, slate blue, and warm golden amber, nostalgic timeless storybook mood, textless, no text, no captions, no titles, no printed words, clean illustration without typography.",
    genreTags: ["Historical/Vintage"],
    origin: "builtin"
  },
  {
    id: "builtin-historical-5",
    name: "Nordic Art Nouveau (John Bauer style)",
    promptText:
      "Scandinavian folklore fairytale illustration, John Bauer style, Art Nouveau fairytale aesthetic, Golden Age of Illustration, fine ink linework with soft muted watercolor wash, earthy organic palette of sepia brown, moss green, ochre yellow, and muted terracotta red, stylized mythical trolls and fairy tale figures, enchanted magical forest atmosphere, decorative line border frame, textless, no text, no captions, no titles, no printed words, clean illustration without typography.",
    genreTags: ["Historical/Vintage"],
    origin: "builtin"
  },
  {
    id: "builtin-historical-6",
    name: "Turn-of-the-century watercolor (Carl Larsson style)",
    promptText:
      "Scandinavian turn-of-the-century watercolor illustration, Carl Larsson style, Swedish National Romanticism, delicate pencil outlines with soft transparent watercolor washes, bright airy historic interior flooded with soft natural window daylight, lush blooming powder pink flowers, warm light wood tones and gentle greenery, cozy domestic period drama aesthetic, peaceful harmonious mood, textless, no text, no captions, no titles, no printed words, clean illustration without typography.",
    genreTags: ["Historical/Vintage"],
    origin: "builtin"
  },
  {
    id: "builtin-noir-1",
    name: "Classic film noir linocut",
    promptText:
      "Classic film noir detective illustration, high-contrast chiaroscuro lighting, dramatic silhouette of a figure in a trench coat and fedora on stairs, heavy grainy linocut and lithograph print texture, stark geometric shadows and steep angular perspective, highly desaturated palette of deep jet black, slate gray, cool charcoal, and a beam of pale cream light, hardboiled urban mystery aesthetic, tense cinematic atmosphere, textless, no text, no captions, no titles, no printed words, clean illustration without typography.",
    genreTags: ["Detective/Noir"],
    origin: "builtin"
  },
  {
    id: "builtin-noir-2",
    name: "Gritty rain-soaked comic noir",
    promptText:
      "Gritty graphic novel noir illustration, heavy black ink linework and stark monochrome contrast, private detective in trench coat and fedora standing under a single glowing streetlamp, heavy pouring rain with vertical rain streaks and wet reflective cobblestone street, curling cigarette smoke, dramatic overhead spotlighting, dark moody hardboiled detective aesthetic, textless, no text, no captions, no titles, no printed words, clean illustration without typography.",
    genreTags: ["Detective/Noir"],
    origin: "builtin"
  },
  {
    id: "builtin-noir-3",
    name: "Sleek neo-noir & femme fatale noir",
    promptText:
      "Sleek cinematic neo-noir illustration, photo-real digital art style, elegant female figure in a dark trench coat and fedora hat, misty nighttime retro city street with vintage cars and glowing streetlamps, desaturated cool monochromatic palette of steel blue, slate gray, charcoal, and deep obsidian black, atmospheric fog and subtle depth of field blur, sophisticated mysterious thriller aesthetic, textless, no text, no captions, no titles, no printed words, clean illustration without typography.",
    genreTags: ["Detective/Noir"],
    origin: "builtin"
  },
  {
    id: "builtin-noir-4",
    name: "Occult & supernatural noir",
    promptText:
      "Urban fantasy occult detective illustration, cinematic digital concept art, young man in heavy coat standing in shadowy atmosphere, backlit by glowing geometric magical sigils and ethereal runes, floating golden embers and glowing dust particles, warm sepia bronze and charcoal palette, dramatic rim lighting, moody supernatural mystery aesthetic, textless, no text, no captions, no titles, no printed words, clean illustration without typography.",
    genreTags: ["Detective/Noir"],
    origin: "builtin"
  },
  {
    id: "builtin-noir-5",
    name: "Dark underground thriller pop-art",
    promptText:
      "Dark comedy comic thriller illustration, underground comix and street art graffiti style, bold thick marker pen outlines, unhinged sinister cartoon caricature figure, vibrant neon pink halo outline, bold flat poster colors with neon magenta, bright yellow, cyan blue, and dripping blood red accents, paint splatter drips, stark white backdrop, edgy macabre thriller aesthetic, textless, no text, no captions, no speech bubbles, no titles, no printed words, clean illustration without typography.",
    genreTags: ["Detective/Noir"],
    origin: "builtin"
  },
  {
    id: "builtin-noir-6",
    name: "Police procedural crime scene",
    promptText:
      "Police procedural crime scene illustration, black and white graphic novel comic book style, high-contrast black ink brushwork and sharp linework, investigator standing over a woodland crime scene surrounded by caution tape, stark black shadows and clean white highlights, grim detective thriller aesthetic, textless, no text, no captions, no titles, no printed words, clean illustration without typography.",
    genreTags: ["Detective/Noir"],
    origin: "builtin"
  },
  {
    id: "builtin-adventure-1",
    name: "Alpine survival & high-altitude action",
    promptText:
      "Cinematic action adventure book cover illustration, epic high-altitude mountain climbing scene, dramatic steep cliff overhang with falling rocks and swirling snow mist, dynamic dizzying perspective, detailed digital concept art style, cold alpine color palette of icy blues, snow white, granite gray, contrasted with warm khaki and leather gear, perilous intense survival atmosphere, textless, no text, no captions, no titles, no printed words, clean illustration without typography.",
    genreTags: ["Adventure"],
    origin: "builtin"
  },
  {
    id: "builtin-adventure-2",
    name: "Retro wilderness emblem & woodcut",
    promptText:
      "Vintage retro outdoor adventure emblem illustration, linocut woodblock vector print style, distressed worn grunge texture with grainy patina, hiker with backpack gazing at majestic mountain peaks, retro horizontal striped background, 1970s color palette of sage green, mustard yellow, burnt orange, and warm cream against dark charcoal background, rustic wilderness wanderlust aesthetic, textless, no text, no captions, no titles, no printed words, clean illustration without typography.",
    genreTags: ["Adventure"],
    origin: "builtin"
  },
  {
    id: "builtin-adventure-3",
    name: "Pulp archaeological treasure hunt",
    promptText:
      "Classic pulp action adventure comic illustration, dynamic ink sketch art style, heroic archaeologist with fedora hat, leather jacket, and whip fleeing an ancient temple tomb, crawling giant spiders and flying debris particles, energetic motion lines and gray ink wash shading, monochrome black and white comic book artwork, high-octane perilous adventure mood, textless, no text, no captions, no titles, no printed words, clean illustration without typography.",
    genreTags: ["Adventure"],
    origin: "builtin"
  },
  {
    id: "builtin-adventure-4",
    name: "Magical storybook diorama & vector adventure",
    promptText:
      "Whimsical literary adventure illustration, vector art style with clean black line art outlines, an open magical storybook on a wooden desk with a fantasy landscape bursting out of its pages, towering mountains, winding river, miniature castle, starry night sky with crescent moon, surrounding vintage books and lantern, cozy warm color palette of midnight blue, mustard gold, parchment cream, and soft teal, magical sense of wonder aesthetic, textless, no text, no captions, no titles, no printed words, clean illustration without typography.",
    genreTags: ["Adventure"],
    origin: "builtin"
  },
  {
    id: "builtin-adventure-5",
    name: "Classic subterranean sci-fi (Jules Verne style)",
    promptText:
      "Classic subterranean science-fiction adventure book cover illustration, Jules Verne Journey to the Center of the Earth aesthetic, small explorer silhouettes standing on a dark cavernous rocky threshold framing a vast hidden underground ecosystem, giant prehistoric alien flora, towering glowing mushrooms and strange ancient trees, subterranean sea beneath a misty cavern dome, atmospheric cool palette of deep navy blue, teal green, cyan glow, and slate gray, epic scale, feeling of awe and discovery, textless, no text, no captions, no titles, no printed words, clean illustration without typography.",
    genreTags: ["Adventure"],
    origin: "builtin"
  },
  {
    id: "builtin-adventure-6",
    name: "Introspective coming-of-age journey & watercolor",
    promptText:
      "Contemplative personal journey adventure book cover illustration, fine black ink profile portrait with soft layered watercolor washes, delicate organic watercolor overlays, earthy warm palette of mustard yellow, terracotta orange, chestnut brown, sage green, and cream paper texture, coming-of-age introspective adventure aesthetic, quiet emotional mood, textless, no text, no captions, no titles, no printed words, clean illustration without typography.",
    genreTags: ["Adventure"],
    origin: "builtin"
  }
];
