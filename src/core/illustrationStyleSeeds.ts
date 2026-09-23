import type { IllustrationStyle } from "./illustrationStyle";

/**
 * Starting library entries, all carrying the author's real wording. Nine genres,
 * six or seven named variants each.
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
      "Expressionistic painterly gouache storybook illustration, loose brushy texture, raw black ink outlines, muted earthy tones with pops of saturated yellow and red, simplified geometric architecture, decorative pattern-like foliage, naive perspective, textless, no text, no captions, no titles, no printed words, clean illustration without typography.",
    genreTags: ["Children's book"],
    origin: "builtin"
  },
  {
    id: "builtin-storybook-4",
    name: "Ethereal fairytale illustration (Golden Age)",
    promptText:
      "Golden age fairytale illustration, fine intricate pen detail, delicate sepia and muted sage watercolor wash, elongated ethereal figures, gentle gothic whimsy, intricate linework in natural elements, vintage parchment paper aesthetic, textless, no text, no captions, no titles, no printed words, clean illustration without typography.",
    genreTags: ["Children's book"],
    origin: "builtin"
  },
  {
    id: "builtin-storybook-5",
    name: "Dense ink cross-hatch storybook",
    promptText:
      "Dense pen-and-ink cross-hatching, rich tactile texture, muted atmospheric color wash in steel blue and earthy gray, expressive creature design, detailed fur and skin rendering, lush layered background, classic storybook style, textless, no text, no captions, no titles, no printed words, clean illustration without typography.",
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
      "Epic High Fantasy book cover illustration, grand oil painting style with rich brushwork, majestic wizard or knight atop a rocky cliff overlooking a glowing mystical valley, floating crystalline spires, vibrant magical aura, rich color palette of royal purple, sapphire blue, and shimmering gold, heroic sense of wonder, textless, no text, no captions, no titles, no printed words, clean illustration without typography.",
    genreTags: ["Fantasy"],
    origin: "builtin"
  },
  {
    id: "builtin-fantasy-2",
    name: "Dark fantasy shadow & grit",
    promptText:
      "Gritty Dark Fantasy artwork, heavy charcoal and dark oil paint texture, ominous ruined castle beneath a stormy blood-moon sky, lone armored warrior surrounded by shadows and eerie wisps, desaturated color palette of deep crimson, pitch black, bone white, and tarnished silver, oppressive macabre fantasy atmosphere, textless, no text, no captions, no titles, no printed words, clean illustration without typography.",
    genreTags: ["Fantasy"],
    origin: "builtin"
  },
  {
    id: "builtin-fantasy-3",
    name: "Mythic ethereal fantasy (Alan Lee style)",
    promptText:
      "Ethereal mythic fantasy illustration, Alan Lee style, delicate pen ink linework with soft watercolor washes, ancient elven ruins entwined with ancient roots, glowing woodland spirits, muted natural palette of moss green, twilight blue, soft silver, and parchment ivory, enchanted nostalgic atmosphere, textless, no text, no captions, no titles, no printed words, clean illustration without typography.",
    genreTags: ["Fantasy"],
    origin: "builtin"
  },
  {
    id: "builtin-fantasy-4",
    name: "Pulp sword & sorcery (Frazetta style)",
    promptText:
      "Vintage 1970s sword and sorcery pulp fantasy illustration, Frank Frazetta style, bold expressive oil brushstrokes, muscular barbarian hero facing a giant mythical beast in a cavern, dramatic chiaroscuro lighting, intense palette of warm ember orange, deep shadow brown, and fiery yellow, high-action primal energy, textless, no text, no captions, no titles, no printed words, clean illustration without typography.",
    genreTags: ["Fantasy"],
    origin: "builtin"
  },
  {
    id: "builtin-fantasy-5",
    name: "Cozy everyday fantasy",
    promptText:
      "Cozy fantasy book cover illustration, soft gouache and digital painting style, warm inviting interior of a magical potion shop or tavern, potion bottles glowing on wooden shelves, friendly mythical creature sleeping near a hearth, warm palette of amber, honey yellow, sage green, and soft cinnamon brown, gentle comforting mood, textless, no text, no captions, no titles, no printed words, clean illustration without typography.",
    genreTags: ["Fantasy"],
    origin: "builtin"
  },
  {
    id: "builtin-fantasy-6",
    name: "Modern fantasy concept art",
    promptText:
      "Modern digital fantasy concept art, sharp crisp lighting and polished rendering, elemental spellcaster summoning swirling arcane magic energy, dramatic spell effects with radiant particle lighting, deep contrast palette of cyan blue, magenta, and dark obsidian, cinematic blockbuster fantasy aesthetic, textless, no text, no captions, no titles, no printed words, clean illustration without typography.",
    genreTags: ["Fantasy"],
    origin: "builtin"
  },
  {
    id: "builtin-scifi-1",
    name: "Cyberpunk neon noir",
    promptText:
      "Gritty cyberpunk sci-fi illustration, sleek digital realism, rain-slicked futuristic metropolis street at night, towering skyscrapers with glowing neon holographic advertisements, lone cybernetic figure under an umbrella, color palette of electric cyan, magenta, deep dark navy, and wet asphalt reflections, moody high-tech noir atmosphere, textless, no text, no captions, no titles, no printed words, clean illustration without typography.",
    genreTags: ["Sci-fi"],
    origin: "builtin"
  },
  {
    id: "builtin-scifi-2",
    name: "Retro-futurist 70s space art (Chris Foss style)",
    promptText:
      "Classic 1970s retro sci-fi book cover artwork, Chris Foss airbrush style, massive industrial starship with bold geometric primary color stripes orbiting a ringed gas giant planet, vibrant cosmic nebula background, color palette of bright yellow, orange, turquoise, and deep space black, nostalgic golden age science fiction aesthetic, textless, no text, no captions, no titles, no printed words, clean illustration without typography.",
    genreTags: ["Sci-fi"],
    origin: "builtin"
  },
  {
    id: "builtin-scifi-3",
    name: "Hard sci-fi realistic space exploration",
    promptText:
      "Hard science fiction concept art, realistic photographic rendering, solitary astronaut inspecting a sleek metallic space station module in deep orbit above Earth, stark sunlight and harsh void shadows, clean sterile textures, palette of crisp titanium white, solar panel blue, carbon black, and bright sunlight, grounded awe-inspiring realism, textless, no text, no captions, no titles, no printed words, clean illustration without typography.",
    genreTags: ["Sci-fi"],
    origin: "builtin"
  },
  {
    id: "builtin-scifi-4",
    name: "Epic space opera",
    promptText:
      "Epic space opera illustration, cinematic digital painting, colossal fleet of starships warping near a dying star, swirling cosmic dust clouds and distant galaxies, epic dramatic scale, vibrant palette of deep violet, fiery crimson, cosmic gold, and starry black, thrilling interstellar adventure mood, textless, no text, no captions, no titles, no printed words, clean illustration without typography.",
    genreTags: ["Sci-fi"],
    origin: "builtin"
  },
  {
    id: "builtin-scifi-5",
    name: "Biopunk organic sci-fi (Moebius/Giger fusion)",
    promptText:
      "Biopunk science fiction illustration, Moebius and H.R. Giger fusion, intricate line art with alien organic structures, biomechanical architecture with glowing bioluminescent spores, strange explorer figure in an organic suit, palette of muted bone gray, alien green, pale turquoise, and deep shadow purple, surreal unsettling alien world aesthetic, textless, no text, no captions, no titles, no printed words, clean illustration without typography.",
    genreTags: ["Sci-fi"],
    origin: "builtin"
  },
  {
    id: "builtin-scifi-6",
    name: "Solarpunk utopian future",
    promptText:
      "Solarpunk optimistic sci-fi artwork, vibrant digital painting style, futuristic eco-city with sleek white curved towers integrated with lush vertical gardens and solar sails, clear blue sky and flying solar transports, bright color palette of emerald green, clean white, azure blue, and warm golden sunlight, hopeful harmonious future tone, textless, no text, no captions, no titles, no printed words, clean illustration without typography.",
    genreTags: ["Sci-fi"],
    origin: "builtin"
  },
  {
    id: "builtin-horror-1",
    name: "Victorian gothic classic horror",
    promptText:
      "Classic Victorian gothic horror book illustration, fine pen-and-ink with dark charcoal wash, sprawling dilapidated gothic manor on a desolate hill under a foggy full moon, stark bare trees and a lone shadowy figure in the courtyard, monochromatic palette of charcoal black, ash gray, and cold moonlight ivory, eerie haunting Victorian gloom, textless, no text, no captions, no titles, no printed words, clean illustration without typography.",
    genreTags: ["Horror/Gothic"],
    origin: "builtin"
  },
  {
    id: "builtin-horror-2",
    name: "Cosmic Lovecraftian horror",
    promptText:
      "Cosmic Lovecraftian horror artwork, dark surrealist watercolor and ink style, colossal ancient eldritch entity rising from a stormy dark ocean beneath chaotic swirling skies, non-Euclidean ruins, unsettling palette of abyssal sea green, sickly violet, pitch black, and murky gray, terrifying cosmic dread atmosphere, textless, no text, no captions, no titles, no printed words, clean illustration without typography.",
    genreTags: ["Horror/Gothic"],
    origin: "builtin"
  },
  {
    id: "builtin-horror-3",
    name: "Folk horror rural macabre",
    promptText:
      "Folk horror book cover illustration, rustic woodcut print style, ominous wooden effigy standing in a twilight cornfield, shadowy village folk gathered in a circle, desaturated earthy palette of burnt umber, muted straw yellow, twilight indigo, and crimson red, unsettling pagan mystery tone, textless, no text, no captions, no titles, no printed words, clean illustration without typography.",
    genreTags: ["Horror/Gothic"],
    origin: "builtin"
  },
  {
    id: "builtin-horror-4",
    name: "Surrealist dream horror (Beksiński style)",
    promptText:
      "Dystopian surrealist horror art, Zdzisław Beksiński style, textured oil painting, eerie skeletal structures and towering desolate bone monoliths in a dusty wasteland, mist and subtle embers, palette of rusted orange, decayed brown, muted bone white, and dark shadows, haunting nightmare aesthetic, textless, no text, no captions, no titles, no printed words, clean illustration without typography.",
    genreTags: ["Horror/Gothic"],
    origin: "builtin"
  },
  {
    id: "builtin-horror-5",
    name: "Psychological clinical horror",
    promptText:
      "Modern psychological horror illustration, stark desaturated digital realism, long empty dim-lit corridor with unsettling distorted shadows, cold atmospheric haze, desaturated palette of sickly greenish-gray, shadow black, dull beige, and pale white light, claustrophobic tense psychological dread, textless, no text, no captions, no titles, no printed words, clean illustration without typography.",
    genreTags: ["Horror/Gothic"],
    origin: "builtin"
  },
  {
    id: "builtin-horror-6",
    name: "Retro 80s pulp creature feature",
    promptText:
      "Retro 1980s horror comic artwork, heavy black ink brushwork with vivid pulp coloring, terrifying monster lurking in the shadows of an urban alleyway, dramatic neon lighting, color palette of deep magenta, slime green, electric purple, and pitch black, edgy macabre thriller mood, textless, no text, no captions, no titles, no printed words, clean illustration without typography.",
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
  },
  {
    id: "builtin-romance-1",
    name: "Vintage pulp romance painting",
    promptText:
      "Vintage romantic illustration style, classic mid-20th-century magazine or pulp paperback art, gouache and oil painting on textured paper, hand-painted aesthetic with visible paint and paper texture, intimate scene focused on a tender or dramatic embrace, soft warm atmospheric chiaroscuro lighting, often from a side source like a window or doorway, creating deep but soft shadows, limited muted earthy color palette dominated by brown, sepia, ochre, and aged peach-terracotta accents, detailed rendering of figures and fabrics with a painterly soft focus, close and personal composition, textless, no text, no captions, no titles, no printed words, clean illustration without typography.",
    genreTags: ["Romance"],
    origin: "builtin"
  },
  {
    id: "builtin-romance-2",
    name: "1980s romance novel cover",
    promptText:
      "Classic 1980s romance novel cover painting, rich oil painting on canvas, smooth painterly rendering, passionate cinematic embrace, windblown flowing hair, framed by lush oversized blooming roses in vibrant crimson, magenta, and rose pink, soft dreamy lighting with warm highlights on soft skin tones, romantic pastel lavender and sky blue background, dramatic high-romance aesthetic, textless, no text, no captions, no titles, no printed words, clean illustration without typography.",
    genreTags: ["Romance"],
    origin: "builtin"
  },
  {
    id: "builtin-romance-3",
    name: "Romantic suspense cel-shaded noir",
    promptText:
      "Dramatic romantic suspense graphic illustration, high-contrast cel-shaded vector art style, stark pitch-black shadows with clean hard-edged silhouettes, extreme chiaroscuro lighting, intimate close-up embrace, limited color palette of deep crimson red, rich black, and smooth warm cream skin tones, sleek modern pop-art graphic novel aesthetic, intense emotional mood, textless, no text, no captions, no titles, no printed words, clean illustration without typography.",
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
      "Modern chick-lit romance book cover illustration, stylish fashion graphic illustration, clean refined linework, smooth cel-shading, elegant female silhouette holding a love letter, framed by a soft blush pink watercolor swatch background on an off-white cream backdrop, rich burgundy and deep rose palette, minimalist contemporary romance aesthetic, chic glamorous mood, textless, no text, no captions, no titles, no printed words, clean illustration without typography.",
    genreTags: ["Romance"],
    origin: "builtin"
  },
  {
    id: "builtin-romance-6",
    name: "Webtoon & manhwa romance",
    promptText:
      "Modern webtoon and manhwa digital romance illustration, clean anime-inspired character design with soft blush highlights, crisp linework with soft gradient shading, warm golden hour sunset lighting, glowing hanging fairy lights, vibrant pastel palette of coral pink, warm gold, peach, and navy blue, sweet youthful YA romance aesthetic, soft blurred background with blooming flowers, textless, no text, no captions, no titles, no printed words, clean illustration without typography.",
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
  "builtin-storybook-1": "/illustration-examples/builtin-storybook-1.jpg"
};
