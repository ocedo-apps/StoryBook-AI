import type { IllustrationStyle } from "./illustrationStyle";

/**
 * Starting library entries, all carrying the author's real wording. Nine genres,
 * six or seven named variants each.
 *
 * Deliberately style-only: medium, technique, palette, lighting quality, and mood —
 * never a specific scene, character, action, location, or time of day. Those come from
 * the passage being illustrated; if the style itself bakes in a scene, the composed
 * prompt drags that scene into every illustration regardless of what the passage
 * actually describes.
 */
export const BUILTIN_ILLUSTRATION_STYLES: IllustrationStyle[] = [
  {
    id: "builtin-storybook-1",
    name: "Graphic retro picture book",
    promptText:
      "Whimsical storybook illustration, thick black outlines, flat poster-like color blocks, high-contrast primary red and bright blue palette, minimal shading, whimsically exaggerated character proportions, retro picture book style, textless, no text, no captions, no titles, no printed words, clean illustration without typography.",
    genreTags: ["Children's book"],
    origin: "builtin"
  },
  {
    id: "builtin-storybook-2",
    name: "Classic pen-and-ink sketch",
    promptText:
      "Vintage pen-and-ink sketch, loose cross-hatched linework, no color, sketchy and expressive, naturalistic-but-whimsical character design, monochrome on aged cream paper, warm nostalgic storybook feel, textless, no text, no captions, no titles, no printed words, clean illustration without typography.",
    genreTags: ["Children's book"],
    origin: "builtin"
  },
  {
    id: "builtin-storybook-3",
    name: "Gouache & naive storybook",
    promptText:
      "Expressionistic painterly gouache storybook illustration, loose brushy texture, raw black ink outlines, muted earthy tones with pops of saturated yellow and red, naive stylized perspective, textless, no text, no captions, no titles, no printed words, clean illustration without typography.",
    genreTags: ["Children's book"],
    origin: "builtin"
  },
  {
    id: "builtin-storybook-4",
    name: "Ethereal fairytale illustration (Golden Age)",
    promptText:
      "Golden age fairytale illustration, fine intricate pen detail, delicate sepia and muted sage watercolor wash, elongated ethereal figure style, gentle gothic whimsy, intricate fine linework, vintage parchment paper aesthetic, textless, no text, no captions, no titles, no printed words, clean illustration without typography.",
    genreTags: ["Children's book"],
    origin: "builtin"
  },
  {
    id: "builtin-storybook-5",
    name: "Dense ink cross-hatch storybook",
    promptText:
      "Dense pen-and-ink cross-hatching, rich tactile texture, muted atmospheric color wash in steel blue and earthy gray, detailed textured rendering, layered depth, classic storybook style, textless, no text, no captions, no titles, no printed words, clean illustration without typography.",
    genreTags: ["Children's book"],
    origin: "builtin"
  },
  {
    id: "builtin-storybook-6",
    name: "Modern digital picture book",
    promptText:
      "Modern digital children's book illustration, soft rounded vector-like shapes, warm ambient lighting, muted-but-saturated palette, simple geometric character design with minimal facial features, soft cinematic depth, textless, no text, no captions, no titles, no printed words, clean illustration without typography.",
    genreTags: ["Children's book"],
    origin: "builtin"
  },
  {
    id: "builtin-fantasy-1",
    name: "High fantasy painterly epic",
    promptText:
      "Epic High Fantasy illustration, grand oil painting style with rich brushwork, vibrant magical aura and glow effects, rich color palette of royal purple, sapphire blue, and shimmering gold, heroic sense of wonder, textless, no text, no captions, no titles, no printed words, clean illustration without typography.",
    genreTags: ["Fantasy"],
    origin: "builtin"
  },
  {
    id: "builtin-fantasy-2",
    name: "Dark fantasy shadow & grit",
    promptText:
      "Gritty Dark Fantasy artwork, heavy charcoal and dark oil paint texture, desaturated color palette of deep crimson, pitch black, bone white, and tarnished silver, oppressive macabre fantasy atmosphere, textless, no text, no captions, no titles, no printed words, clean illustration without typography.",
    genreTags: ["Fantasy"],
    origin: "builtin"
  },
  {
    id: "builtin-fantasy-3",
    name: "Mythic ethereal fantasy (Alan Lee style)",
    promptText:
      "Ethereal mythic fantasy illustration, Alan Lee style, delicate pen ink linework with soft watercolor washes, muted natural palette of moss green, twilight blue, soft silver, and parchment ivory, enchanted nostalgic atmosphere, textless, no text, no captions, no titles, no printed words, clean illustration without typography.",
    genreTags: ["Fantasy"],
    origin: "builtin"
  },
  {
    id: "builtin-fantasy-4",
    name: "Pulp sword & sorcery (Frazetta style)",
    promptText:
      "Vintage 1970s sword and sorcery pulp fantasy illustration, Frank Frazetta style, bold expressive oil brushstrokes, dramatic chiaroscuro lighting, intense palette of warm ember orange, deep shadow brown, and fiery yellow, high-action primal energy, textless, no text, no captions, no titles, no printed words, clean illustration without typography.",
    genreTags: ["Fantasy"],
    origin: "builtin"
  },
  {
    id: "builtin-fantasy-5",
    name: "Cozy everyday fantasy",
    promptText:
      "Cozy fantasy illustration, soft gouache and digital painting style, warm palette of amber, honey yellow, sage green, and soft cinnamon brown, gentle comforting mood, textless, no text, no captions, no titles, no printed words, clean illustration without typography.",
    genreTags: ["Fantasy"],
    origin: "builtin"
  },
  {
    id: "builtin-fantasy-6",
    name: "Modern fantasy concept art",
    promptText:
      "Modern digital fantasy concept art, sharp crisp lighting and polished rendering, dramatic radiant particle lighting effects, deep contrast palette of cyan blue, magenta, and dark obsidian, cinematic blockbuster fantasy aesthetic, textless, no text, no captions, no titles, no printed words, clean illustration without typography.",
    genreTags: ["Fantasy"],
    origin: "builtin"
  },
  {
    id: "builtin-scifi-1",
    name: "Cyberpunk neon noir",
    promptText:
      "Gritty cyberpunk sci-fi illustration, sleek digital realism, neon holographic lighting accents, color palette of electric cyan, magenta, deep dark navy, and wet asphalt reflections, moody high-tech noir atmosphere, textless, no text, no captions, no titles, no printed words, clean illustration without typography.",
    genreTags: ["Sci-fi"],
    origin: "builtin"
  },
  {
    id: "builtin-scifi-2",
    name: "Retro-futurist 70s space art (Chris Foss style)",
    promptText:
      "Classic 1970s retro sci-fi artwork, Chris Foss airbrush style, bold geometric primary color stripe patterns, color palette of bright yellow, orange, turquoise, and deep space black, nostalgic golden age science fiction aesthetic, textless, no text, no captions, no titles, no printed words, clean illustration without typography.",
    genreTags: ["Sci-fi"],
    origin: "builtin"
  },
  {
    id: "builtin-scifi-3",
    name: "Hard sci-fi realistic space exploration",
    promptText:
      "Hard science fiction concept art, realistic photographic rendering, stark directional lighting with harsh shadows, clean sterile textures, palette of crisp titanium white, solar panel blue, carbon black, and bright highlights, grounded awe-inspiring realism, textless, no text, no captions, no titles, no printed words, clean illustration without typography.",
    genreTags: ["Sci-fi"],
    origin: "builtin"
  },
  {
    id: "builtin-scifi-4",
    name: "Epic space opera",
    promptText:
      "Epic space opera illustration, cinematic digital painting, epic dramatic scale, vibrant palette of deep violet, fiery crimson, cosmic gold, and starry black, thrilling interstellar adventure mood, textless, no text, no captions, no titles, no printed words, clean illustration without typography.",
    genreTags: ["Sci-fi"],
    origin: "builtin"
  },
  {
    id: "builtin-scifi-5",
    name: "Biopunk organic sci-fi (Moebius/Giger fusion)",
    promptText:
      "Biopunk science fiction illustration, Moebius and H.R. Giger fusion, intricate line art with alien organic biomechanical texture patterns, palette of muted bone gray, alien green, pale turquoise, and deep shadow purple, surreal unsettling alien world aesthetic, textless, no text, no captions, no titles, no printed words, clean illustration without typography.",
    genreTags: ["Sci-fi"],
    origin: "builtin"
  },
  {
    id: "builtin-scifi-6",
    name: "Solarpunk utopian future",
    promptText:
      "Solarpunk optimistic sci-fi artwork, vibrant digital painting style, bright color palette of emerald green, clean white, azure blue, and warm golden light, hopeful harmonious future tone, textless, no text, no captions, no titles, no printed words, clean illustration without typography.",
    genreTags: ["Sci-fi"],
    origin: "builtin"
  },
  {
    id: "builtin-horror-1",
    name: "Victorian gothic classic horror",
    promptText:
      "Classic Victorian gothic horror book illustration, fine pen-and-ink with dark charcoal wash, monochromatic palette of charcoal black, ash gray, and cold moonlight ivory, eerie haunting Victorian gloom, textless, no text, no captions, no titles, no printed words, clean illustration without typography.",
    genreTags: ["Horror/Gothic"],
    origin: "builtin"
  },
  {
    id: "builtin-horror-2",
    name: "Cosmic Lovecraftian horror",
    promptText:
      "Cosmic Lovecraftian horror artwork, dark surrealist watercolor and ink style, unsettling palette of abyssal sea green, sickly violet, pitch black, and murky gray, terrifying cosmic dread atmosphere, textless, no text, no captions, no titles, no printed words, clean illustration without typography.",
    genreTags: ["Horror/Gothic"],
    origin: "builtin"
  },
  {
    id: "builtin-horror-3",
    name: "Folk horror rural macabre",
    promptText:
      "Folk horror illustration, rustic woodcut print style, desaturated earthy palette of burnt umber, muted straw yellow, twilight indigo, and crimson red, unsettling pagan mystery tone, textless, no text, no captions, no titles, no printed words, clean illustration without typography.",
    genreTags: ["Horror/Gothic"],
    origin: "builtin"
  },
  {
    id: "builtin-horror-4",
    name: "Surrealist dream horror (Beksiński style)",
    promptText:
      "Dystopian surrealist horror art, Zdzisław Beksiński style, textured oil painting, palette of rusted orange, decayed brown, muted bone white, and dark shadows, haunting nightmare aesthetic, textless, no text, no captions, no titles, no printed words, clean illustration without typography.",
    genreTags: ["Horror/Gothic"],
    origin: "builtin"
  },
  {
    id: "builtin-horror-5",
    name: "Psychological clinical horror",
    promptText:
      "Modern psychological horror illustration, stark desaturated digital realism, unsettling distorted shadow play, desaturated palette of sickly greenish-gray, shadow black, dull beige, and pale white light, claustrophobic tense psychological dread, textless, no text, no captions, no titles, no printed words, clean illustration without typography.",
    genreTags: ["Horror/Gothic"],
    origin: "builtin"
  },
  {
    id: "builtin-horror-6",
    name: "Retro 80s pulp creature feature",
    promptText:
      "Retro 1980s horror comic artwork, heavy black ink brushwork with vivid pulp coloring, dramatic neon lighting, color palette of deep magenta, slime green, electric purple, and pitch black, edgy macabre thriller mood, textless, no text, no captions, no titles, no printed words, clean illustration without typography.",
    genreTags: ["Horror/Gothic"],
    origin: "builtin"
  },
  {
    id: "builtin-literary-1",
    name: "Nordic realism & atmospheric nature",
    promptText:
      "Atmospheric Nordic realism illustration, painterly oil painting style with visible textured brushstrokes, muted earthy palette of moss green, slate gray, pale sky blue, and warm ochre light, melancholic introspective literary mood, textless, no text, no captions, no titles, no printed words, clean illustration without typography.",
    genreTags: ["Literary/Realistic"],
    origin: "builtin"
  },
  {
    id: "builtin-literary-2",
    name: "Contemporary quiet everyday realism",
    promptText:
      "Contemporary literary fiction artwork, loose expressive gouache painting style, soft warm directional lighting, pastel palette of terracotta, sage, warm cream, and soft amber, intimate grounded realism aesthetic, textless, no text, no captions, no titles, no printed words, clean illustration without typography.",
    genreTags: ["Literary/Realistic"],
    origin: "builtin"
  },
  {
    id: "builtin-literary-3",
    name: "Impressionistic urban realism",
    promptText:
      "Impressionistic urban realism book illustration, soft textured oil paint on canvas, blurred impressionistic reflections and soft edges, rich deep palette of indigo blue, warm streetlamp yellow, burnt umber, and charcoal, emotional evocative narrative tone, textless, no text, no captions, no titles, no printed words, clean illustration without typography.",
    genreTags: ["Literary/Realistic"],
    origin: "builtin"
  },
  {
    id: "builtin-literary-4",
    name: "Magical realism & rural landscape",
    promptText:
      "Subtle magical realism illustration, detailed gouache and watercolor art, dreamlike floating elements and glowing soft light blended into a grounded realistic scene, muted natural color palette of deep rust, sage green, dusty rose, and parchment cream, poetic haunting atmosphere, textless, no text, no captions, no titles, no printed words, clean illustration without typography.",
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
      "Pastoral literary realism artwork, soft painterly impressionist style, natural organic colors of wheat yellow, olive green, warm earth brown, and soft hazy white, nostalgic reflective mood, textless, no text, no captions, no titles, no printed words, clean illustration without typography.",
    genreTags: ["Literary/Realistic"],
    origin: "builtin"
  },
  {
    id: "builtin-literary-7",
    name: "Raw scribble portrait",
    promptText:
      "Expressive literary fiction portrait illustration, chaotic scribble art and gestural pen sketch technique, fine black ink lines building raw facial contours and dense energetic shading, realistic anatomical structure beneath loose scribble art, textured off-white cream paper grain backdrop, monochromatic black and ivory palette, raw introspective emotional mood, textless, no text, no captions, no titles, no printed words, clean illustration without typography.",
    genreTags: ["Literary/Realistic"],
    origin: "builtin"
  },
  {
    id: "builtin-historical-1",
    name: "Victorian woodcut & engraving (19th century)",
    promptText:
      "Victorian 19th-century historical period book illustration, fine black ink engraving and woodcut print style, intricate vertical hatching and cross-hatching shading techniques, monochrome black and white on aged cream paper backdrop, vintage periodical artwork aesthetic, quiet classic period drama atmosphere, textless, no text, no captions, no titles, no printed words, clean illustration without typography.",
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
      "Vintage 1930s travel poster illustration, WPA poster style, screen print art, flat color blocks, bold graphic silhouettes, clean defined linework, retro lithography aesthetic, muted classic color palette of deep forest green, navy blue, olive green, cream white, and warm amber accents, idyllic nostalgic mood, textless, no text, no captions, no titles, no printed words, clean illustration without typography.",
    genreTags: ["Historical/Vintage"],
    origin: "builtin"
  },
  {
    id: "builtin-historical-4",
    name: "Edwardian pastoral storybook illustration",
    promptText:
      "Classic Edwardian pastoral storybook illustration, fine pen and ink cross-hatching with soft colored pencil shading, traditional vintage British children's book aesthetic, cool-warm lighting contrast, soft muted palette of snow white, moss green, slate blue, and warm golden amber, nostalgic timeless storybook mood, textless, no text, no captions, no titles, no printed words, clean illustration without typography.",
    genreTags: ["Historical/Vintage"],
    origin: "builtin"
  },
  {
    id: "builtin-historical-5",
    name: "Nordic Art Nouveau (John Bauer style)",
    promptText:
      "Scandinavian folklore fairytale illustration, John Bauer style, Art Nouveau fairytale aesthetic, Golden Age of Illustration, fine ink linework with soft muted watercolor wash, earthy organic palette of sepia brown, moss green, ochre yellow, and muted terracotta red, stylized mythical trolls and fairy tale figure design, enchanted mysterious atmosphere, decorative line border frame, textless, no text, no captions, no titles, no printed words, clean illustration without typography.",
    genreTags: ["Historical/Vintage"],
    origin: "builtin"
  },
  {
    id: "builtin-historical-6",
    name: "Turn-of-the-century watercolor (Carl Larsson style)",
    promptText:
      "Scandinavian turn-of-the-century watercolor illustration, Carl Larsson style, Swedish National Romanticism, delicate pencil outlines with soft transparent watercolor washes, soft natural directional lighting, warm light wood-tone palette accents, cozy domestic period drama aesthetic, peaceful harmonious mood, textless, no text, no captions, no titles, no printed words, clean illustration without typography.",
    genreTags: ["Historical/Vintage"],
    origin: "builtin"
  },
  {
    id: "builtin-noir-1",
    name: "Classic film noir linocut",
    promptText:
      "Classic film noir detective illustration, high-contrast chiaroscuro lighting, heavy grainy linocut and lithograph print texture, stark geometric shadows and steep angular perspective, highly desaturated palette of deep jet black, slate gray, cool charcoal, and a beam of pale cream light, hardboiled urban mystery aesthetic, tense cinematic atmosphere, textless, no text, no captions, no titles, no printed words, clean illustration without typography.",
    genreTags: ["Detective/Noir"],
    origin: "builtin"
  },
  {
    id: "builtin-noir-2",
    name: "Gritty rain-soaked comic noir",
    promptText:
      "Gritty graphic novel noir illustration, heavy black ink linework and stark monochrome contrast, dramatic overhead spotlighting, dark moody hardboiled detective aesthetic, textless, no text, no captions, no titles, no printed words, clean illustration without typography.",
    genreTags: ["Detective/Noir"],
    origin: "builtin"
  },
  {
    id: "builtin-noir-3",
    name: "Sleek neo-noir & femme fatale noir",
    promptText:
      "Sleek cinematic neo-noir illustration, photo-real digital art style, desaturated cool monochromatic palette of steel blue, slate gray, charcoal, and deep obsidian black, atmospheric fog and subtle depth of field blur, sophisticated mysterious thriller aesthetic, textless, no text, no captions, no titles, no printed words, clean illustration without typography.",
    genreTags: ["Detective/Noir"],
    origin: "builtin"
  },
  {
    id: "builtin-noir-4",
    name: "Occult & supernatural noir",
    promptText:
      "Urban fantasy occult detective illustration, cinematic digital concept art, dramatic rim lighting, warm sepia bronze and charcoal palette, moody supernatural mystery aesthetic, textless, no text, no captions, no titles, no printed words, clean illustration without typography.",
    genreTags: ["Detective/Noir"],
    origin: "builtin"
  },
  {
    id: "builtin-noir-5",
    name: "Dark underground thriller pop-art",
    promptText:
      "Dark comedy comic thriller illustration, underground comix and street art graffiti style, bold thick marker pen outlines, vibrant neon halo outline effect, bold flat poster colors with neon magenta, bright yellow, cyan blue, and dripping blood red accents, paint splatter drips, stark white backdrop, edgy macabre thriller aesthetic, textless, no text, no captions, no speech bubbles, no titles, no printed words, clean illustration without typography.",
    genreTags: ["Detective/Noir"],
    origin: "builtin"
  },
  {
    id: "builtin-noir-6",
    name: "Police procedural crime scene",
    promptText:
      "Police procedural crime scene illustration, black and white graphic novel comic book style, high-contrast black ink brushwork and sharp linework, stark black shadows and clean white highlights, grim detective thriller aesthetic, textless, no text, no captions, no titles, no printed words, clean illustration without typography.",
    genreTags: ["Detective/Noir"],
    origin: "builtin"
  },
  {
    id: "builtin-adventure-1",
    name: "Alpine survival & high-altitude action",
    promptText:
      "Cinematic action adventure illustration, dynamic dizzying perspective, detailed digital concept art style, cold alpine color palette of icy blues, snow white, granite gray, and warm khaki accents, perilous intense survival atmosphere, textless, no text, no captions, no titles, no printed words, clean illustration without typography.",
    genreTags: ["Adventure"],
    origin: "builtin"
  },
  {
    id: "builtin-adventure-2",
    name: "Retro wilderness emblem & woodcut",
    promptText:
      "Vintage retro outdoor adventure emblem illustration, linocut woodblock vector print style, distressed worn grunge texture with grainy patina, retro horizontal striped graphic composition, 1970s color palette of sage green, mustard yellow, burnt orange, and warm cream against dark charcoal background, rustic wilderness wanderlust aesthetic, textless, no text, no captions, no titles, no printed words, clean illustration without typography.",
    genreTags: ["Adventure"],
    origin: "builtin"
  },
  {
    id: "builtin-adventure-3",
    name: "Pulp archaeological treasure hunt",
    promptText:
      "Classic pulp action adventure comic illustration, dynamic ink sketch art style, energetic motion lines and gray ink wash shading, monochrome black and white comic book artwork, high-octane perilous adventure mood, textless, no text, no captions, no titles, no printed words, clean illustration without typography.",
    genreTags: ["Adventure"],
    origin: "builtin"
  },
  {
    id: "builtin-adventure-4",
    name: "Magical storybook diorama & vector adventure",
    promptText:
      "Whimsical literary adventure illustration, vector art style with clean black line art outlines, warm color palette of midnight blue, mustard gold, parchment cream, and soft teal, magical sense of wonder aesthetic, textless, no text, no captions, no titles, no printed words, clean illustration without typography.",
    genreTags: ["Adventure"],
    origin: "builtin"
  },
  {
    id: "builtin-adventure-5",
    name: "Classic subterranean sci-fi (Jules Verne style)",
    promptText:
      "Classic subterranean science-fiction adventure illustration, Jules Verne Journey to the Center of the Earth aesthetic, atmospheric cool palette of deep navy blue, teal green, cyan glow, and slate gray, epic scale, feeling of awe and discovery, textless, no text, no captions, no titles, no printed words, clean illustration without typography.",
    genreTags: ["Adventure"],
    origin: "builtin"
  },
  {
    id: "builtin-adventure-6",
    name: "Introspective coming-of-age journey & watercolor",
    promptText:
      "Contemplative personal journey adventure illustration, fine black ink linework with soft layered watercolor washes, delicate organic watercolor overlays, earthy warm palette of mustard yellow, terracotta orange, chestnut brown, sage green, and cream paper texture, coming-of-age introspective adventure aesthetic, quiet emotional mood, textless, no text, no captions, no titles, no printed words, clean illustration without typography.",
    genreTags: ["Adventure"],
    origin: "builtin"
  },
  {
    id: "builtin-romance-1",
    name: "Vintage pulp romance painting",
    promptText:
      "Vintage romantic illustration style, classic mid-20th-century magazine or pulp paperback art, gouache and oil painting on textured paper, hand-painted aesthetic with visible paint and paper texture, soft warm atmospheric chiaroscuro lighting with deep but soft shadows, limited muted earthy color palette dominated by brown, sepia, ochre, and aged peach-terracotta accents, detailed painterly soft-focus rendering of figures and fabrics, textless, no text, no captions, no titles, no printed words, clean illustration without typography.",
    genreTags: ["Romance"],
    origin: "builtin"
  },
  {
    id: "builtin-romance-2",
    name: "1980s romance painterly illustration",
    promptText:
      "Classic 1980s romance illustration painting, rich oil painting on canvas, smooth painterly rendering, soft dreamy lighting with warm highlights, romantic palette of blooming rose crimson, magenta, rose pink, pastel lavender, and sky blue, dramatic high-romance aesthetic, textless, no text, no captions, no titles, no printed words, clean illustration without typography.",
    genreTags: ["Romance"],
    origin: "builtin"
  },
  {
    id: "builtin-romance-3",
    name: "Romantic suspense cel-shaded noir",
    promptText:
      "Dramatic romantic suspense graphic illustration, high-contrast cel-shaded vector art style, stark pitch-black shadows with clean hard-edged silhouettes, extreme chiaroscuro lighting, limited color palette of deep crimson red, rich black, and smooth warm cream skin tones, sleek modern pop-art graphic novel aesthetic, intense emotional mood, textless, no text, no captions, no titles, no printed words, clean illustration without typography.",
    genreTags: ["Romance"],
    origin: "builtin"
  },
  {
    id: "builtin-romance-4",
    name: "Regency period pen-and-ink romance",
    promptText:
      "Classic 19th-century Regency period romance book illustration, fine black pen and ink drawing, delicate line art, detailed cross-hatching shading techniques, clean monochrome black and white on off-white paper background, elegant historical period drama aesthetic, soft natural daylighting, quiet intimate subtle romance, traditional vintage etched bookplate style, textless, no text, no captions, no titles, no printed words, clean illustration without typography.",
    genreTags: ["Romance"],
    origin: "builtin"
  },
  {
    id: "builtin-romance-5",
    name: "Modern chick-lit romance",
    promptText:
      "Modern chick-lit romance illustration, stylish fashion graphic illustration, clean refined linework, smooth cel-shading, soft blush pink watercolor swatch background composition on an off-white cream backdrop, rich burgundy and deep rose palette, minimalist contemporary romance aesthetic, chic glamorous mood, textless, no text, no captions, no titles, no printed words, clean illustration without typography.",
    genreTags: ["Romance"],
    origin: "builtin"
  },
  {
    id: "builtin-romance-6",
    name: "Webtoon & manhwa romance",
    promptText:
      "Modern webtoon and manhwa digital romance illustration, clean anime-inspired character design with soft blush highlights, crisp linework with soft gradient shading, warm soft glowing lighting, vibrant pastel palette of coral pink, warm gold, peach, and navy blue, sweet youthful YA romance aesthetic, soft blurred background bokeh, textless, no text, no captions, no titles, no printed words, clean illustration without typography.",
    genreTags: ["Romance"],
    origin: "builtin"
  }
];

/**
 * Example-image source for a builtin style, served as a static asset under public/ and
 * fetched into a Blob at seed time (a Blob can't be a static import, so it can't live
 * directly on BUILTIN_ILLUSTRATION_STYLES above). Keyed by style id; a style with no
 * entry here just seeds without an example image, same as before this existed.
 */
export const BUILTIN_EXAMPLE_IMAGE_PATHS: Record<string, string> = {
  "builtin-storybook-1": "/illustration-examples/builtin-storybook-1.jpg",
  "builtin-storybook-2": "/illustration-examples/builtin-storybook-2.jpg",
  "builtin-storybook-3": "/illustration-examples/builtin-storybook-3.jpg",
  "builtin-storybook-4": "/illustration-examples/builtin-storybook-4.jpg",
  "builtin-storybook-5": "/illustration-examples/builtin-storybook-5.jpg",
  "builtin-storybook-6": "/illustration-examples/builtin-storybook-6.jpg",
  "builtin-scifi-1": "/illustration-examples/builtin-scifi-1.jpg",
  "builtin-scifi-2": "/illustration-examples/builtin-scifi-2.jpg",
  "builtin-scifi-3": "/illustration-examples/builtin-scifi-3.jpg",
  "builtin-scifi-4": "/illustration-examples/builtin-scifi-4.jpg",
  "builtin-scifi-5": "/illustration-examples/builtin-scifi-5.jpg",
  "builtin-scifi-6": "/illustration-examples/builtin-scifi-6.jpg",
  "builtin-historical-3": "/illustration-examples/builtin-historical-3.jpg",
  "builtin-historical-4": "/illustration-examples/builtin-historical-4.jpg",
  "builtin-historical-2": "/illustration-examples/builtin-historical-2.jpg",
  "builtin-historical-5": "/illustration-examples/builtin-historical-5.jpg",
  "builtin-historical-6": "/illustration-examples/builtin-historical-6.jpg",
  "builtin-historical-1": "/illustration-examples/builtin-historical-1.jpg",
  "builtin-literary-1": "/illustration-examples/builtin-literary-1.jpg",
  "builtin-literary-2": "/illustration-examples/builtin-literary-2.jpg",
  "builtin-literary-3": "/illustration-examples/builtin-literary-3.jpg",
  "builtin-literary-4": "/illustration-examples/builtin-literary-4.jpg",
  "builtin-literary-5": "/illustration-examples/builtin-literary-5.jpg",
  "builtin-literary-6": "/illustration-examples/builtin-literary-6.jpg",
  "builtin-literary-7": "/illustration-examples/builtin-literary-7.jpg",
  "builtin-romance-2": "/illustration-examples/builtin-romance-2.jpg",
  "builtin-romance-5": "/illustration-examples/builtin-romance-5.jpg"
};
