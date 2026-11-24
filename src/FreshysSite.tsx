/**
 * Freshy's: concept website for the Freshy's case study (prototype by Tonči Hrgović).
 * Home with a daily-needs scale (AAHA 2021 guidelines), 342 recipes in metric with search and filters,
 * ingredient filters (what you have at home, what the dog can't have), a meal builder with raw grams (USDA SR28 calories),
 * a shopping list with where to buy, recipe pages and a four-step order flow with a live receipt. English and Croatian
 * (recipes translated line by line, the original English one tap away; unsafe ingredients such as garlic are flagged).
 * Recipes and food photos: mydogrecipe.com, used with permission.
 */
import * as React from "react"
import { useEffect, useMemo, useRef, useState } from "react"
import { addPropertyControls, ControlType, RenderTarget } from "framer"

type Lang = "en" | "hr"
type LS = { en: string; hr: string }
type Ing = { q?: number; q2?: number; u?: "g" | "ml" | "mg" | "tsp" | "tbsp" | "pc"; n: LS; n2?: LS; w?: LS; s?: LS; opt?: boolean }
type Rec = {
    id: string
    kind: "topper" | "treat" | "bland"
    t: LS
    img: string
    pos?: string
    min: number
    time?: LS
    makes: LS
    batch?: number
    /* finished weight of one batch in grams and its kcal (USDA SR28): amounts are given in grams */
    fw?: number
    tk?: number
    kc: { v: number; per: LS; g?: number; pc?: number }
    pcw?: { en: [string, string]; hr: [string, string, string] }
    store: LS[]
    al: string[]
    tags: string[]
    tex?: "frozen" | "crunchy" | "soft"
    cw?: LS
    ing: Ing[]
    steps: LS[]
    qa: [LS, LS][]
    src: string
    pouch?: string
}

const IMG = "https://framerusercontent.com/images/"
const NOGARLIC: LS = { en: "Check the label: no onion or garlic.", hr: "Provjeri sastav: bez luka i češnjaka." }
const XYL: LS = { en: "No xylitol. It can also be listed as birch sugar.", hr: "Bez ksilitola. Može pisati i kao brezin šećer." }
const PLAIN: LS = { en: "No sugar or sweeteners.", hr: "Bez šećera i zaslađivača." }
const ML240: LS = { en: "240 ml", hr: "240 ml" }
const F = (en: string, hr: string): LS => ({ en: "Fridge: " + en, hr: "Hladnjak: " + hr })
const Z = (en: string, hr: string): LS => ({ en: "Freezer: " + en, hr: "Zamrzivač: " + hr })
const EVERY: LS = { en: "Can my dog eat this every day?", hr: "Smije li pas ovo jesti svaki dan?" }

const RECIPES: Rec[] = [
    {
        id: "turkey-apple",
        kind: "topper",
        pouch: "turkey-apple",
        t: { en: "Turkey & apple stew", hr: "Varivo s puretinom i jabukom" },
        img: IMG + "pQv4lW5UOetCry6Vg9cO0eTwUw.webp",
        min: 35,
        makes: { en: "About {1.3} kg, {4}–{6} servings", hr: "Oko {1.3} kg, {4}–{6} porcija" },
        batch: 1300,
        fw: 1300,
        tk: 1137,
        kc: { v: 218, per: ML240, g: 0.91 },
        store: [F("3–4 days", "3–4 dana"), Z("2–3 months", "2–3 mjeseca")],
        al: ["turkey", "grains"],
        tags: [],
        ing: [
            { q: 450, u: "g", n: { en: "lean turkey mince (at least 93% lean)", hr: "nemasne mljevene puretine (najviše 7 % masti)" } },
            { q: 195, u: "g", n: { en: "cooked brown rice", hr: "kuhane smeđe riže" }, s: { en: "White rice works too, and some dogs digest it more easily.", hr: "Može i bijela riža, nekim psima je lakša za probavu." } },
            { q: 1, u: "pc", n: { en: "carrot (about {70} g), chopped", hr: "mrkva (oko {70} g), nasjeckana" }, n2: { en: "carrots (about {70} g), chopped", hr: "mrkve (oko {70} g), nasjeckane" } },
            { q: 1, u: "pc", n: { en: "small apple (about {150} g), peeled and diced", hr: "manja jabuka (oko {150} g), oguljena i narezana na kockice" }, n2: { en: "small apples (about {150} g), peeled and diced", hr: "manje jabuke (oko {150} g), oguljene i narezane na kockice" }, w: { en: "Core and seeds out.", hr: "Izvadi sredinu sa sjemenkama." } },
            { q: 600, u: "ml", n: { en: "low-salt chicken or turkey broth", hr: "juhe od piletine ili puretine s malo soli" }, w: NOGARLIC },
            { q: 15, u: "ml", n: { en: "olive oil", hr: "maslinova ulja" } },
            { q: 1, u: "tsp", n: { en: "dried parsley", hr: "suhog peršina" }, opt: true },
            { q: 60, u: "g", n: { en: "green beans, chopped", hr: "mahuna, nasjeckanih" }, opt: true },
        ],
        steps: [
            { en: "Peel and dice the apple, and chop the carrot and green beans. Cook the rice separately and set it aside.", hr: "Oguli jabuku i nareži je na kockice, a mrkvu i mahune nasjeckaj. Rižu skuhaj posebno i ostavi sa strane." },
            { en: "Heat the oil in a medium pot over medium heat. Add the turkey and cook until it is browned all over.", hr: "U srednjem loncu na srednjoj vatri zagrij ulje. Dodaj puretinu i prži dok sva ne posmeđi." },
            { en: "Stir in the carrot and apple. Pour in the broth and bring it to a gentle simmer.", hr: "Umiješaj mrkvu i jabuku. Ulij juhu i pusti da lagano zakuha." },
            { en: "Cook for 15 minutes, until the vegetables are soft.", hr: "Kuhaj 15 minuta, dok povrće ne omekša." },
            { en: "Add the rice, parsley and green beans. Simmer for another 5–10 minutes.", hr: "Dodaj rižu, peršin i mahune. Kuhaj još 5 do 10 minuta na laganoj vatri." },
            { en: "Take it off the heat and let it cool until it is just warm.", hr: "Makni s vatre i ostavi da se ohladi dok ne bude tek mlako." },
        ],
        qa: [
            [{ en: "Can I use white rice instead?", hr: "Mogu li umjesto smeđe staviti bijelu rižu?" }, { en: "Yes. Fully cooked white rice works, and some dogs digest it more easily.", hr: "Da. Dobro kuhana bijela riža također ide, a nekim psima je lakša za probavu." }],
            [EVERY, { en: "As a topper, yes. As a whole meal it would need a vet nutritionist to balance it.", hr: "Kao dodatak, da. Kao cijeli obrok morao bi ga uravnotežiti veterinarski nutricionist." }],
        ],
        src: "https://mydogrecipe.com/turkey-apple-soothing-stew-for-dogs/",
    },
    {
        id: "salmon-sweet-potato",
        kind: "topper",
        pouch: "salmon-sweet-potato",
        t: { en: "One-pan salmon & sweet potato", hr: "Losos i batat iz jedne tave" },
        img: IMG + "FWI9btqz9LMDB8xQWNc6wESN1Vc.webp",
        min: 31,
        makes: { en: "About {1.4} kg", hr: "Oko {1.4} kg" },
        batch: 1400,
        fw: 1400,
        tk: 926,
        kc: { v: 11, per: { en: "15 ml (1 tbsp)", hr: "15 ml (1 žlica)" }, g: 0.72 },
        store: [F("3 days", "3 dana"), Z("2 months", "2 mjeseca")],
        al: ["fish", "eggs"],
        tags: [],
        ing: [
            { q: 450, u: "g", n: { en: "wild salmon fillet, boneless and skinless", hr: "fileta divljeg lososa, bez kože i kostiju" }, w: { en: "Check for small bones.", hr: "Provjeri ima li sitnih kostiju." } },
            { q: 2, u: "pc", n: { en: "medium sweet potatoes (about {400} g), peeled and diced small", hr: "srednja batata (oko {400} g), oguljena i narezana na sitne kockice" }, n2: { en: "medium sweet potatoes (about {400} g), peeled and diced small", hr: "srednja batata (oko {400} g), oguljena i narezana na sitne kockice" } },
            { q: 110, u: "g", n: { en: "green beans, chopped", hr: "mahuna, nasjeckanih" } },
            { q: 30, u: "g", n: { en: "fresh spinach, chopped", hr: "svježeg špinata, nasjeckanog" } },
            { q: 15, u: "ml", n: { en: "olive or coconut oil", hr: "maslinova ili kokosova ulja" } },
            { q: 360, u: "ml", n: { en: "water", hr: "vode" } },
            { q: 0.5, u: "tsp", n: { en: "finely ground eggshell powder (calcium)", hr: "fino mljevenih ljuski jaja (kalcij)" } },
        ],
        steps: [
            { en: "Peel and dice the sweet potatoes. Chop the green beans and spinach, and check the salmon for bones.", hr: "Oguli batat i nareži ga na sitne kockice. Nasjeckaj mahune i špinat, a losos provjeri ima li kostiju." },
            { en: "Put the sweet potatoes and the water in a pan with a lid. Simmer for 12 minutes.", hr: "Stavi batat i vodu u tavu s poklopcem. Kuhaj 12 minuta na laganoj vatri." },
            { en: "Add the salmon, green beans and oil. Cover and simmer for 8 minutes, until the salmon reaches 63 °C and flakes easily.", hr: "Dodaj losos, mahune i ulje. Poklopi i kuhaj 8 minuta, dok losos ne dosegne 63 °C i ne počne se lako listati." },
            { en: "Add the spinach and cook for 1 minute, until it wilts. Flake the salmon well and pick out any small bones.", hr: "Dodaj špinat i kuhaj još minutu, dok ne uvene. Losos dobro usitni i izvadi sve sitne kosti." },
            { en: "Let it cool completely, then stir in the eggshell powder until it is evenly mixed.", hr: "Ostavi da se potpuno ohladi, pa umiješaj ljuske jaja dok se ravnomjerno ne rasporede." },
        ],
        qa: [
            [{ en: "Can dogs eat salmon skin?", hr: "Smije li pas jesti kožu lososa?" }, { en: "Cooked skin is edible but fatty. Leave it out here, especially for dogs on a low-fat diet.", hr: "Kuhana koža je jestiva, ali masna. Ovdje je izostavi, pogotovo ako pas mora jesti manje masno." }],
            [{ en: "Is it good for a sensitive stomach?", hr: "Je li dobar za osjetljiv želudac?" }, { en: "Only your vet can tell, because it depends on why the stomach is sensitive. Salmon is fatty.", hr: "To može reći samo veterinar, jer ovisi o tome zašto je želudac osjetljiv. Losos je mastan." }],
        ],
        src: "https://mydogrecipe.com/salmon-and-sweet-potato-dog-food/",
    },
    {
        id: "beef-sweet-potato",
        kind: "topper",
        pouch: "beef-sweet-potato",
        t: { en: "Beef & sweet potato stew", hr: "Varivo s govedinom i batatom" },
        img: IMG + "4TgOXghkadM8Y7uupWUIzGYboQ.webp",
        pos: "50% 55%",
        min: 30,
        makes: { en: "About {750} g, {2}–{3} servings", hr: "Oko {750} g, {2}–{3} porcije" },
        batch: 750,
        fw: 750,
        tk: 525,
        kc: { v: 182, per: ML240, g: 0.76 },
        store: [F("3–4 days", "3–4 dana"), Z("2–3 months", "2–3 mjeseca")],
        al: ["beef"],
        tags: ["quick"],
        ing: [
            { q: 480, u: "ml", n: { en: "water or unsalted beef broth", hr: "vode ili neslane goveđe juhe" }, w: NOGARLIC },
            { q: 225, u: "g", n: { en: "lean beef mince (90–93% lean)", hr: "nemasne mljevene govedine (7–10 % masti)" } },
            { q: 1, u: "pc", n: { en: "medium sweet potato (about {200} g), peeled, in 1 cm cubes", hr: "srednji batat (oko {200} g), oguljen i narezan na kockice od 1 cm" }, n2: { en: "medium sweet potatoes (about {200} g), peeled, in 1 cm cubes", hr: "srednja batata (oko {200} g), oguljena i narezana na kockice od 1 cm" } },
            { q: 55, u: "g", n: { en: "green beans, trimmed, in 2–3 cm pieces", hr: "mahuna, očišćenih i narezanih na komade od 2–3 cm" } },
        ],
        steps: [
            { en: "Peel the sweet potato and cut it into 1 cm cubes. Wash and trim the green beans and cut them into 2–3 cm pieces.", hr: "Oguli batat i nareži ga na kockice od 1 cm. Mahune operi, očisti im krajeve i nareži na komade od 2–3 cm." },
            { en: "Heat a splash of water or broth in a pan and add the beef. Cook it, breaking it up, until it is no longer pink.", hr: "U tavi zagrij malo vode ili juhe i dodaj govedinu. Kuhaj je i usitnjavaj dok više nije ružičasta." },
            { en: "Add the sweet potato and green beans, then pour in the water or broth.", hr: "Dodaj batat i mahune, pa ulij vodu ili juhu." },
            { en: "Bring to a simmer, lower the heat and cover. Cook for 15–20 minutes, stirring now and then, until the sweet potato is soft.", hr: "Pusti da zakuha, smanji vatru i poklopi. Kuhaj 15 do 20 minuta, povremeno promiješaj, dok batat ne omekša." },
            { en: "Take it off the heat and let the stew cool completely before serving.", hr: "Makni s vatre i ostavi da se varivo potpuno ohladi prije posluživanja." },
        ],
        qa: [
            [{ en: "Can I freeze it?", hr: "Mogu li ga zamrznuti?" }, { en: "Yes, in portion-sized boxes for 2–3 months. Thaw it in the fridge.", hr: "Da, u posudicama po jednu porciju, 2–3 mjeseca. Odmrzavaj ga u hladnjaku." }],
            [EVERY, { en: "As an extra on top of a balanced diet. On its own it is not a complete meal.", hr: "Kao dodatak uravnoteženoj prehrani. Sam za sebe nije potpun obrok." }],
        ],
        src: "https://mydogrecipe.com/beef-sweet-potato-comfort-stew-for-dogs/",
    },
    {
        id: "turkey-spinach",
        kind: "topper",
        pouch: "turkey-spinach",
        t: { en: "Turkey, sweet potato & spinach", hr: "Puretina, batat i špinat" },
        img: IMG + "REtmpRDhmeJ4ipD8TlBAtyf9MHs.webp",
        pos: "50% 70%",
        min: 50,
        makes: { en: "About {2.7} kg, {12} servings", hr: "Oko {2.7} kg, {12} porcija" },
        batch: 2700,
        fw: 2700,
        tk: 2536,
        kc: { v: 225, per: ML240, g: 0.94 },
        store: [F("4 days", "4 dana"), Z("2 months", "2 mjeseca")],
        al: ["turkey", "eggs"],
        tags: [],
        ing: [
            { q: 1360, u: "g", n: { en: "lean turkey mince, raw (at least 93% lean)", hr: "nemasne mljevene puretine, sirove (najviše 7 % masti)" } },
            { q: 300, u: "g", n: { en: "sweet potato, peeled and diced", hr: "batata, oguljenog i narezanog na kockice" } },
            { q: 150, u: "g", n: { en: "butternut squash, peeled and diced", hr: "muškatne tikve, oguljene i narezane na kockice" } },
            { q: 130, u: "g", n: { en: "carrots, chopped", hr: "mrkve, nasjeckane" } },
            { q: 180, u: "g", n: { en: "green beans, chopped", hr: "mahuna, nasjeckanih" } },
            { q: 120, u: "g", n: { en: "courgette, chopped", hr: "tikvica, nasjeckanih" } },
            { q: 180, u: "g", n: { en: "spinach, chopped", hr: "špinata, nasjeckanog" } },
            { q: 85, u: "g", n: { en: "black beans, no added salt, rinsed", hr: "crnog graha bez dodane soli, ispranog" } },
            { q: 85, u: "g", n: { en: "kidney beans, no added salt, rinsed", hr: "crvenog graha bez dodane soli, ispranog" } },
            { q: 85, u: "g", n: { en: "chickpeas, no added salt, rinsed", hr: "slanutka bez dodane soli, ispranog" }, s: { en: "No beans? Use more green beans or courgette.", hr: "Bez graha? Stavi više mahuna ili tikvica." } },
            { q: 240, u: "ml", n: { en: "water", hr: "vode" } },
            { q: 7, u: "g", n: { en: "finely ground eggshell powder ({1.5} tsp)", hr: "fino mljevenih ljuski jaja ({1.5} žličice)" } },
            { n: { en: "Complete vitamin and mineral supplement for dogs, as the label says", hr: "Potpuni vitaminsko-mineralni dodatak za pse, prema uputi" }, opt: true },
        ],
        steps: [
            { en: "Brown the turkey in a large pot over medium heat, breaking it into small pieces. Drain extra fat if needed.", hr: "U velikom loncu na srednjoj vatri prži puretinu dok ne posmeđi i razdvajaj je na sitne komadiće. Po potrebi ocijedi višak masnoće." },
            { en: "Add the sweet potato, squash, carrots, green beans, courgette and water. Stir well and cover.", hr: "Dodaj batat, tikvu, mrkvu, mahune, tikvice i vodu. Dobro promiješaj i poklopi." },
            { en: "Simmer on low heat for 20–25 minutes, until the vegetables are tender.", hr: "Kuhaj na laganoj vatri 20 do 25 minuta, dok povrće ne omekša." },
            { en: "Stir in the spinach, beans and chickpeas. Cook for another 5–7 minutes.", hr: "Umiješaj špinat, grah i slanutak. Kuhaj još 5 do 7 minuta." },
            { en: "Mix well, so it is evenly chunky and moist.", hr: "Dobro promiješaj, da sve bude ravnomjerno sočno i u komadićima." },
            { en: "Let it cool to room temperature. Stir in the eggshell powder and the supplement, if you use it, before portioning.", hr: "Ostavi da se ohladi na sobnu temperaturu. Prije porcioniranja umiješaj ljuske jaja i dodatak, ako ga koristiš." },
        ],
        qa: [
            [{ en: "Can I leave out the beans?", hr: "Mogu li izostaviti grah?" }, { en: "Yes. Use more green beans or courgette instead. The nutrition changes a little.", hr: "Da. Umjesto njega stavi više mahuna ili tikvica. Hranjive vrijednosti se malo promijene." }],
            [{ en: "Is it grain-free?", hr: "Je li bez žitarica?" }, { en: "Yes. Most dogs don't need grain-free food, though, so ask your vet if in doubt.", hr: "Da. Ipak, većini pasa ne treba hrana bez žitarica, pa u nedoumici pitaj veterinara." }],
        ],
        src: "https://mydogrecipe.com/hearty-turkey-sweet-potato-spinach-dog-recipe/",
    },
    {
        id: "chicken-rice",
        kind: "bland",
        t: { en: "Chicken & white rice (bland meal)", hr: "Piletina i bijela riža (blagi obrok)" },
        img: IMG + "ZsyVNiEI2mO1n8m2DZfExntGg.webp",
        min: 53,
        makes: { en: "About {1} kg", hr: "Oko {1} kg" },
        batch: 1000,
        fw: 1000,
        tk: 1234,
        kc: { v: 296, per: ML240, g: 1.23 },
        store: [F("3 days", "3 dana"), Z("2 months", "2 mjeseca")],
        al: ["chicken", "grains"],
        tags: ["stomach"],
        ing: [
            { q: 450, u: "g", n: { en: "chicken breast, boneless and skinless", hr: "pilećih prsa, bez kože i kostiju" } },
            { q: 190, u: "g", n: { en: "plain white rice, uncooked", hr: "bijele riže, nekuhane" } },
            { q: 960, u: "ml", n: { en: "water, split between the chicken and the rice", hr: "vode, podijeljeno za piletinu i rižu" } },
        ],
        steps: [
            { en: "Put the chicken in a pot with enough of the water to cover it. Never add oil, butter, salt, onion, garlic or seasoning.", hr: "Stavi piletinu u lonac s toliko vode da je prekrije. Nikad ne dodaji ulje, maslac, sol, luk, češnjak ni začine." },
            { en: "Boil gently for 12–15 minutes, or longer, until the thickest part reaches 74 °C.", hr: "Kuhaj lagano 12 do 15 minuta, ili dulje, dok najdeblji dio ne dosegne 74 °C." },
            { en: "Simmer the rice in the rest of the plain water until it is very soft.", hr: "Rižu kuhaj u ostatku obične vode dok ne bude jako mekana." },
            { en: "Shred the chicken finely. Mix two parts cooked rice with one part chicken.", hr: "Piletinu sitno usitni. Pomiješaj dva dijela kuhane riže i jedan dio piletine." },
            { en: "Cool it completely before feeding. If it is for an upset stomach, your vet decides how much and how often.", hr: "Prije hranjenja potpuno ohladi. Ako ga daješ zbog želuca, koliko i koliko često određuje veterinar." },
        ],
        qa: [
            [{ en: "How long can my dog eat this?", hr: "Koliko dugo pas smije jesti ovo?" }, { en: "As long as your vet says. Your vet also tells you how to go back to the usual food.", hr: "Koliko kaže veterinar. On ti kaže i kako se vratiti na uobičajenu hranu." }],
            [{ en: "Can puppies eat it?", hr: "Smiju li ovo štenci?" }, { en: "Ask your vet first. Puppies need balanced food and can dehydrate quickly.", hr: "Prvo pitaj veterinara. Štencima treba uravnotežena hrana, a brzo mogu dehidrirati." }],
        ],
        src: "https://mydogrecipe.com/boiled-chicken-and-rice-for-dogs/",
    },
    {
        id: "chicken-oat",
        kind: "topper",
        t: { en: "Chicken & oat stew", hr: "Varivo s piletinom i zobi" },
        img: IMG + "h5qqqpRrf3XR4ixHYEdBOTSCZQU.webp",
        min: 25,
        makes: { en: "About {700} g", hr: "Oko {700} g" },
        batch: 700,
        fw: 700,
        tk: 329,
        kc: { v: 56, per: { en: "120 ml", hr: "120 ml" }, g: 0.47 },
        store: [F("3–4 days", "3–4 dana"), Z("2 months", "2 mjeseca")],
        al: ["chicken", "grains"],
        tags: ["quick"],
        ing: [
            { q: 480, u: "ml", n: { en: "water or unsalted chicken broth", hr: "vode ili neslane pileće juhe" }, w: NOGARLIC },
            { q: 140, u: "g", n: { en: "cooked chicken breast, finely chopped (no skin, bones or seasoning)", hr: "kuhanih pilećih prsa, sitno nasjeckanih (bez kože, kostiju i začina)" } },
            { q: 20, u: "g", n: { en: "plain rolled oats", hr: "običnih zobenih pahuljica" } },
            { q: 55, u: "g", n: { en: "carrot, peeled and finely grated", hr: "mrkve, oguljene i sitno naribane" } },
        ],
        steps: [
            { en: "Bring the water or broth to a gentle boil in a small pot over medium heat.", hr: "U manjem loncu na srednjoj vatri zakuhaj vodu ili juhu." },
            { en: "Stir in the oats and the grated carrot.", hr: "Umiješaj zobene pahuljice i naribanu mrkvu." },
            { en: "Lower the heat and simmer for 10 minutes, stirring now and then, until the oats soften.", hr: "Smanji vatru i kuhaj 10 minuta, povremeno promiješaj, dok pahuljice ne omekšaju." },
            { en: "Add the shredded chicken.", hr: "Dodaj usitnjenu piletinu." },
            { en: "Simmer for another 5–10 minutes, until everything is soft and well mixed.", hr: "Kuhaj još 5 do 10 minuta, dok se sve ne sjedini i omekša." },
            { en: "Let the stew cool completely before serving.", hr: "Ostavi da se varivo potpuno ohladi prije posluživanja." },
        ],
        qa: [
            [{ en: "Can I use broth instead of water?", hr: "Mogu li umjesto vode staviti juhu?" }, { en: "Yes, unsalted chicken broth with no onion, garlic or spices.", hr: "Da, neslanu pileću juhu bez luka, češnjaka i začina." }],
            [EVERY, { en: "Not as its only food, because it is not a complete meal. Use it as a topper.", hr: "Ne kao jedinu hranu, jer nije potpun obrok. Daj ga kao dodatak." }],
        ],
        src: "https://mydogrecipe.com/chicken-and-oat-healing-stew-for-dogs/",
    },
    {
        id: "fruit-rings",
        kind: "treat",
        t: { en: "Frozen fruit rings", hr: "Smrznuti kolutići od voća" },
        img: IMG + "fe4nxIzBsEzIMqFQM7c2OJUjyU.webp",
        pos: "50% 30%",
        min: 360,
        time: { en: "6 h, mostly in the freezer", hr: "6 h, većinom u zamrzivaču" },
        makes: { en: "{6} rings", hr: "{6} kolutića" },
        kc: { v: 48, per: { en: "1 ring", hr: "1 kolutić" }, pc: 47.9 },
        pcw: { en: ["ring", "rings"], hr: ["kolutić", "kolutića", "kolutića"] },
        store: [Z("up to 2 months", "do 2 mjeseca")],
        al: ["dairy"],
        tags: ["frozen"],
        tex: "frozen",
        ing: [
            { q: 75, u: "g", n: { en: "strawberries, chopped", hr: "jagoda, nasjeckanih" } },
            { q: 75, u: "g", n: { en: "blueberries", hr: "borovnica" } },
            { q: 75, u: "g", n: { en: "banana, diced", hr: "banane, narezane na kockice" } },
            { q: 60, u: "g", n: { en: "apple, peeled and diced", hr: "jabuke, oguljene i narezane na kockice" }, w: { en: "No seeds.", hr: "Bez sjemenki." } },
            { q: 40, u: "g", n: { en: "fresh pineapple, chopped", hr: "svježeg ananasa, nasjeckanog" } },
            { q: 60, u: "g", n: { en: "plain Greek yogurt", hr: "običnog grčkog jogurta" }, w: PLAIN },
            { q: 1, u: "tbsp", n: { en: "chia seeds (about {10} g)", hr: "chia sjemenki (oko {10} g)" } },
            { q: 480, u: "ml", n: { en: "water", hr: "vode" } },
        ],
        steps: [
            { en: "Wash all the fruit and chop the strawberries, banana, apple and pineapple into small pieces.", hr: "Operi svo voće i nasjeckaj jagode, bananu, jabuku i ananas na sitne komadiće." },
            { en: "Take out the apple core and seeds.", hr: "Jabuci izvadi sredinu i sjemenke." },
            { en: "Spread the fruit evenly in silicone ring or doughnut moulds.", hr: "Rasporedi voće u silikonske kalupe za kolutiće ili krafne." },
            { en: "Add a small spoonful of yogurt to each mould.", hr: "U svaki kalup dodaj malu žličicu jogurta." },
            { en: "Sprinkle a pinch of chia seeds into each.", hr: "U svaki pospi prstohvat chia sjemenki." },
            { en: "Pour water into each mould until the fruit is covered.", hr: "Ulij vode dok ne prekrije voće." },
            { en: "Freeze for 4–6 hours, until solid.", hr: "Zamrzni 4 do 6 sati, dok se potpuno ne stvrdne." },
            { en: "Pop the rings out of the moulds and serve straight away.", hr: "Izvadi kolutiće iz kalupa i odmah posluži." },
        ],
        qa: [
            [{ en: "Which yogurt should I use?", hr: "Koji jogurt koristiti?" }, { en: "Plain Greek yogurt with no sugar or sweeteners, if your dog handles dairy.", hr: "Običan grčki jogurt bez šećera i zaslađivača, ako pas podnosi mliječne proizvode." }],
            [{ en: "Can puppies have them?", hr: "Smiju li ih štenci?" }, { en: "Tiny, softened pieces, once they eat solid food. Stay with them while they eat.", hr: "Sitne, omekšane komadiće, kad već jedu krutu hranu. Budi uz njih dok jedu." }],
        ],
        src: "https://mydogrecipe.com/frozen-fruit-rings-for-dogs-recipe/",
    },
    {
        id: "pb-banana",
        kind: "treat",
        t: { en: "Peanut butter & banana treats", hr: "Keksi s kikirikijem i bananom" },
        img: IMG + "4WzKbZ0D1wOj9zrmLZuI5VSW7M.webp",
        min: 28,
        makes: { en: "{18} treats", hr: "{18} keksića" },
        kc: { v: 75, per: { en: "1 treat", hr: "1 keksić" }, pc: 75.3 },
        pcw: { en: ["treat", "treats"], hr: ["keksić", "keksića", "keksića"] },
        store: [F("up to 5 days", "do 5 dana"), Z("up to 2 months", "do 2 mjeseca")],
        al: ["peanuts", "eggs", "grains"],
        tags: ["quick"],
        cw: { en: "Peanut butter without xylitol.", hr: "Maslac od kikirikija bez ksilitola." },
        ing: [
            { q: 2, u: "pc", n: { en: "ripe bananas (about {240} g peeled), mashed", hr: "zrele banane (oko {240} g bez kore), zgnječene" }, n2: { en: "ripe bananas (about {240} g peeled), mashed", hr: "zrele banane (oko {240} g bez kore), zgnječene" } },
            { q: 90, u: "g", n: { en: "rolled oats", hr: "zobenih pahuljica" } },
            { q: 85, u: "g", n: { en: "natural peanut butter", hr: "prirodnog maslaca od kikirikija" }, w: XYL },
            { q: 60, u: "g", n: { en: "unsweetened apple purée", hr: "nezaslađenog pirea od jabuke" } },
            { q: 1, u: "pc", n: { en: "large egg", hr: "veliko jaje" }, n2: { en: "large eggs", hr: "velika jaja" } },
            { q: 1, u: "tbsp", n: { en: "ground flaxseed (about {7} g)", hr: "mljevenog lanenog sjemena (oko {7} g)" } },
            { q: 1, u: "tbsp", n: { en: "coconut oil, melted", hr: "otopljenog kokosova ulja" } },
            { q: 0.5, u: "tsp", n: { en: "cinnamon", hr: "cimeta" } },
        ],
        steps: [
            { en: "Heat the oven to 175 °C and line a baking tray with baking paper.", hr: "Zagrij pećnicu na 175 °C i obloži lim papirom za pečenje." },
            { en: "Mash the bananas in a bowl until they are mostly smooth.", hr: "U zdjeli zgnječi banane dok ne budu gotovo glatke." },
            { en: "Stir in the peanut butter, apple purée, egg and coconut oil.", hr: "Umiješaj maslac od kikirikija, pire od jabuke, jaje i kokosovo ulje." },
            { en: "Add the oats, flaxseed and cinnamon.", hr: "Dodaj zobene pahuljice, laneno sjeme i cimet." },
            { en: "Mix until a thick dough forms.", hr: "Miješaj dok ne dobiješ gusto tijesto." },
            { en: "Scoop small portions onto the tray and flatten them a little.", hr: "Žlicom stavljaj male hrpice na lim i malo ih spljošti." },
            { en: "Bake for 16–18 minutes, until the edges are lightly golden.", hr: "Peci 16 do 18 minuta, dok rubovi ne porumene." },
            { en: "Let them cool completely before serving.", hr: "Prije posluživanja ostavi da se potpuno ohlade." },
        ],
        qa: [
            [{ en: "Is any peanut butter OK?", hr: "Smije li bilo koji maslac od kikirikija?" }, { en: "Only one without xylitol, which is poisonous to dogs. Read the label: it is sometimes called birch sugar.", hr: "Samo onaj bez ksilitola, koji je psima otrovan. Pročitaj sastav: ponekad piše brezin šećer." }],
            [{ en: "Can I make them ahead?", hr: "Mogu li ih napraviti unaprijed?" }, { en: "Yes. Keep them in a closed box in the fridge, or freeze them in portions.", hr: "Da. Čuvaj ih u zatvorenoj posudi u hladnjaku ili ih zamrzni u porcijama." }],
        ],
        src: "https://mydogrecipe.com/easy-dog-treats-peanut-butter-banana-dog-treats-recipe/",
    },
    {
        id: "blueberry-carrot",
        kind: "treat",
        t: { en: "Blueberry & carrot soft chews", hr: "Mekani zalogaji od borovnice i mrkve" },
        img: IMG + "embhzh6TnYuPiRdW5AS5fN85A.webp",
        min: 195,
        time: { en: "3 h 15 min, mostly in the fridge", hr: "3 h 15 min, većinom u hladnjaku" },
        makes: { en: "{40} small chews", hr: "{40} malih zalogaja" },
        kc: { v: 13, per: { en: "1 chew", hr: "1 zalogaj" }, pc: 13 },
        pcw: { en: ["chew", "chews"], hr: ["zalogaj", "zalogaja", "zalogaja"] },
        store: [F("3–4 days", "3–4 dana"), Z("up to 3 months", "do 3 mjeseca")],
        al: ["peanuts", "grains"],
        tags: [],
        tex: "soft",
        cw: { en: "Peanut butter without xylitol.", hr: "Maslac od kikirikija bez ksilitola." },
        ing: [
            { q: 150, u: "g", n: { en: "fresh blueberries", hr: "svježih borovnica" } },
            { q: 55, u: "g", n: { en: "carrot, finely grated", hr: "mrkve, sitno naribane" } },
            { q: 120, u: "g", n: { en: "pumpkin purée", hr: "pirea od bundeve" }, w: { en: "Just pumpkin: no sugar or spices.", hr: "Samo bundeva, bez šećera i začina." } },
            { q: 25, u: "g", n: { en: "oat flour", hr: "zobenog brašna" } },
            { q: 1, u: "tbsp", n: { en: "ground flaxseed (about {7} g)", hr: "mljevenog lanenog sjemena (oko {7} g)" } },
            { q: 1, u: "tbsp", n: { en: "unflavoured gelatine (about {9} g)", hr: "želatine u prahu, bez okusa (oko {9} g)" } },
            { q: 1, u: "tbsp", n: { en: "coconut oil", hr: "kokosova ulja" } },
            { q: 1, u: "tbsp", n: { en: "natural peanut butter (about {16} g)", hr: "prirodnog maslaca od kikirikija (oko {16} g)" }, w: XYL },
            { q: 15, q2: 30, u: "ml", n: { en: "water, as needed", hr: "vode, po potrebi" } },
            { q: 500, u: "mg", n: { en: "finely ground eggshell powder", hr: "fino mljevenih ljuski jaja" }, opt: true },
            { q: 1, u: "tsp", n: { en: "nutritional yeast", hr: "nutritivnog kvasca" }, opt: true },
        ],
        steps: [
            { en: "Blend the blueberries, grated carrot, pumpkin, peanut butter and coconut oil until smooth.", hr: "Izmiksaj borovnice, naribanu mrkvu, bundevu, maslac od kikirikija i kokosovo ulje dok ne bude glatko." },
            { en: "Mix in the oat flour, flaxseed and, if you use them, the eggshell powder and yeast.", hr: "Umiješaj zobeno brašno, laneno sjeme i, ako ih koristiš, ljuske jaja i kvasac." },
            { en: "Soak the gelatine in {30} ml of warm water, then stir until it dissolves.", hr: "Želatinu namoči u {30} ml tople vode, pa miješaj dok se ne otopi." },
            { en: "Add the gelatine to the mixture and stir well.", hr: "Dodaj želatinu u smjesu i dobro promiješaj." },
            { en: "If needed, add a little water for a thick but spreadable mixture.", hr: "Po potrebi dodaj malo vode, da smjesa bude gusta, ali mazljiva." },
            { en: "Line a 20 cm square tin with baking paper.", hr: "Kalup od 20 × 20 cm obloži papirom za pečenje." },
            { en: "Spread the mixture evenly, about 1 cm thick.", hr: "Ravnomjerno razmaži smjesu, debljine oko 1 cm." },
            { en: "Chill for 2–3 hours, until firm.", hr: "Stavi u hladnjak na 2 do 3 sata, dok se ne stvrdne." },
            { en: "Lift it out of the tin and cut it into small cubes.", hr: "Izvadi iz kalupa i nareži na male kockice." },
            { en: "Keep in the fridge or freezer until serving.", hr: "Čuvaj u hladnjaku ili zamrzivaču do posluživanja." },
        ],
        qa: [
            [{ en: "Are they good for older dogs?", hr: "Jesu li dobri za starije pse?" }, { en: "Yes. They are soft, so they suit dogs that struggle with hard biscuits.", hr: "Da. Mekani su, pa odgovaraju psima kojima su tvrdi keksi teški za žvakanje." }],
            [{ en: "Can I freeze them?", hr: "Mogu li ih zamrznuti?" }, { en: "Yes, in a closed box. Thaw them in the fridge before serving.", hr: "Da, u zatvorenoj posudi. Prije posluživanja odmrzni ih u hladnjaku." }],
        ],
        src: "https://mydogrecipe.com/blueberry-and-carrot-soft-chews-for-dogs/",
    },
    {
        id: "watermelon",
        kind: "treat",
        t: { en: "Watermelon ice cream", hr: "Sladoled od lubenice" },
        img: IMG + "IvvKFYL0fUyQBlZXQGpLfgA9Tk.webp",
        min: 250,
        time: { en: "4 h 10 min, mostly in the freezer", hr: "4 h 10 min, većinom u zamrzivaču" },
        makes: { en: "{12} small servings", hr: "{12} malih porcija" },
        kc: { v: 38, per: { en: "1 serving", hr: "1 porcija" }, pc: 38.1 },
        pcw: { en: ["serving", "servings"], hr: ["porcija", "porcije", "porcija"] },
        store: [Z("up to 2 months", "do 2 mjeseca")],
        al: ["dairy"],
        tags: ["frozen"],
        tex: "frozen",
        ing: [
            { q: 250, u: "g", n: { en: "plain Greek yogurt", hr: "običnog grčkog jogurta" }, w: PLAIN },
            { q: 240, u: "ml", n: { en: "seedless watermelon, puréed", hr: "pirea od lubenice bez sjemenki" } },
            { q: 1, u: "pc", n: { en: "ripe banana (about {120} g)", hr: "zrela banana (oko {120} g)" }, n2: { en: "ripe bananas (about {120} g)", hr: "zrele banane (oko {120} g)" } },
            { q: 60, u: "g", n: { en: "pumpkin purée", hr: "pirea od bundeve" } },
            { q: 40, u: "g", n: { en: "blueberries", hr: "borovnica" } },
            { q: 1, u: "tbsp", n: { en: "honey", hr: "meda" } },
            { q: 0.5, u: "tsp", n: { en: "fresh mint, finely chopped", hr: "svježe metvice, sitno nasjeckane" }, opt: true },
            { q: 30, u: "ml", n: { en: "water", hr: "vode" } },
        ],
        steps: [
            { en: "Put the yogurt, watermelon, banana, pumpkin, blueberries, honey, mint and water in a blender.", hr: "U blender stavi jogurt, lubenicu, bananu, bundevu, borovnice, med, metvicu i vodu." },
            { en: "Blend until completely smooth and creamy.", hr: "Miksaj dok ne bude potpuno glatko i kremasto." },
            { en: "Check the texture and add a little water if needed.", hr: "Provjeri gustoću i po potrebi dodaj malo vode." },
            { en: "Pour into silicone moulds, ice cube trays or freezer boxes.", hr: "Ulij u silikonske kalupe, posude za led ili posude za zamrzivač." },
            { en: "Tap the moulds lightly to get rid of air bubbles.", hr: "Lagano lupni kalupima da izađu mjehurići zraka." },
            { en: "Freeze for 4–6 hours, until firm.", hr: "Zamrzni 4 do 6 sati, dok se ne stvrdne." },
            { en: "Pop them out of the moulds and serve.", hr: "Izvadi iz kalupa i posluži." },
        ],
        qa: [
            [{ en: "Can I make it without yogurt?", hr: "Može li bez jogurta?" }, { en: "Yes. Blend watermelon with banana and freeze it. It will be icier, not creamy.", hr: "Može. Izmiksaj lubenicu s bananom i zamrzni. Bit će više kao led nego kremasto." }],
            [{ en: "Can puppies have it?", hr: "Smiju li ga štenci?" }, { en: "Ask your vet first: yogurt and honey can upset a young stomach.", hr: "Prvo pitaj veterinara: jogurt i med mogu smetati mladom želucu." }],
        ],
        src: "https://mydogrecipe.com/dog-ice-cream-recipe/",
    },
    {
        id: "carrot-chips",
        kind: "treat",
        t: { en: "Crunchy carrot chips", hr: "Hrskavi čips od mrkve" },
        img: IMG + "o01CZRGbJBnT9GOV7GKDDPO5aA.webp",
        min: 160,
        time: { en: "2 h 40 min, mostly in the oven", hr: "2 h 40 min, većinom u pećnici" },
        makes: { en: "About {40}–{50} chips", hr: "Oko {40}–{50} komada" },
        kc: { v: 15, per: { en: "5 chips", hr: "5 komada" }, pc: 3 },
        pcw: { en: ["chip", "chips"], hr: ["komad", "komada", "komada"] },
        store: [{ en: "Closed box: up to a week", hr: "Zatvorena posuda: do tjedan dana" }],
        al: [],
        tags: [],
        tex: "crunchy",
        ing: [
            { q: 3, q2: 4, u: "pc", n: { en: "large carrots (about {500} g)", hr: "velike mrkve (oko {500} g)" }, n2: { en: "large carrots (about {500} g)", hr: "velikih mrkvi (oko {500} g)" } },
            { q: 1, u: "tsp", n: { en: "coconut oil", hr: "kokosova ulja" }, opt: true },
            { n: { en: "A pinch of cinnamon", hr: "Prstohvat cimeta" }, opt: true },
        ],
        steps: [
            { en: "Heat the oven to 120 °C and line a baking tray with baking paper or a silicone mat.", hr: "Zagrij pećnicu na 120 °C i obloži lim papirom za pečenje ili silikonskom podlogom." },
            { en: "Wash, peel and slice the carrots into thin rounds, about 3 mm, with a mandoline or a sharp knife.", hr: "Mrkve operi, oguli i nareži na tanke kolutove, oko 3 mm, ribežom ili oštrim nožem." },
            { en: "If you like, toss the slices in melted coconut oil and add a tiny pinch of cinnamon.", hr: "Po želji kolutove promiješaj s otopljenim kokosovim uljem i dodaj malo cimeta." },
            { en: "Lay them on the tray in one layer, without overlapping.", hr: "Složi ih na lim u jednom sloju, da se ne preklapaju." },
            { en: "Bake for 2½–3 hours, turning them halfway. Start checking at 2 hours.", hr: "Peci 2,5 do 3 sata, na pola vremena ih okreni. Provjeravaj od drugog sata." },
            { en: "Let the chips cool completely before serving or storing.", hr: "Ostavi da se čips potpuno ohladi prije posluživanja ili spremanja." },
        ],
        qa: [
            [{ en: "Can I use a dehydrator?", hr: "Mogu li koristiti sušilicu?" }, { en: "Yes, without any oil. Drying times vary, so check that the chips snap.", hr: "Da, bez ulja. Vrijeme sušenja je različito, pa provjeri pucaju li komadići kad ih slomiš." }],
            [{ en: "Can puppies have them?", hr: "Smiju li ih štenci?" }, { en: "Older puppies can have tiny, softened pieces. Hard chips can be a choking risk.", hr: "Stariji štenci mogu dobiti sitne, omekšane komadiće. Tvrdi čips može zapeti u grlu." }],
        ],
        src: "https://mydogrecipe.com/carrot-chip-dog-treat-recipe/",
    },
    {
        id: "christmas",
        kind: "treat",
        t: { en: "Christmas biscuits", hr: "Božićni keksi" },
        img: IMG + "AbdhPBiPfWDwigCFEyEbgNng.webp",
        pos: "50% 40%",
        min: 40,
        makes: { en: "About {30} biscuits", hr: "Oko {30} keksića" },
        kc: { v: 69, per: { en: "1 biscuit", hr: "1 keksić" }, pc: 69.2 },
        pcw: { en: ["biscuit", "biscuits"], hr: ["keksić", "keksića", "keksića"] },
        store: [{ en: "Closed jar: 7 days", hr: "Zatvorena posuda: 7 dana" }, F("2 weeks", "2 tjedna"), Z("3 months", "3 mjeseca")],
        al: ["peanuts", "eggs", "grains"],
        tags: [],
        tex: "crunchy",
        cw: { en: "Peanut butter without xylitol.", hr: "Maslac od kikirikija bez ksilitola." },
        ing: [
            { q: 180, u: "g", n: { en: "unsweetened apple purée", hr: "nezaslađenog pirea od jabuke" }, w: { en: "No added sugar or nutmeg.", hr: "Bez dodanog šećera i muškatnog oraščića." } },
            { q: 130, u: "g", n: { en: "smooth unsalted peanut butter", hr: "glatkog neslanog maslaca od kikirikija" }, w: XYL },
            { q: 1, u: "pc", n: { en: "large egg", hr: "veliko jaje" }, n2: { en: "large eggs", hr: "velika jaja" } },
            { q: 0.5, q2: 1, u: "tsp", n: { en: "beetroot powder, for red", hr: "cikle u prahu, za crvenu boju" } },
            { q: 0.5, q2: 1, u: "tsp", n: { en: "spinach powder, for green", hr: "špinata u prahu, za zelenu boju" } },
            { q: 280, u: "g", n: { en: "plain flour, plus a little for dusting", hr: "glatkog brašna, i malo za podlogu" } },
            { q: 30, u: "g", n: { en: "rolled oats", hr: "zobenih pahuljica" } },
        ],
        steps: [
            { en: "Heat the oven to 175 °C and line two baking trays. Whisk the apple purée, peanut butter and egg until smooth.", hr: "Zagrij pećnicu na 175 °C i obloži dva lima. Izmiješaj pire od jabuke, maslac od kikirikija i jaje dok ne bude glatko." },
            { en: "Stir in the oats, then add the flour bit by bit until the dough is soft and no longer sticky.", hr: "Umiješaj zobene pahuljice, pa postupno dodaji brašno dok tijesto ne bude mekano i prestane se lijepiti." },
            { en: "Split the dough into three balls. Leave one plain, knead beetroot powder into the second and spinach powder into the third.", hr: "Podijeli tijesto na tri kugle. Jednu ostavi kakva jest, u drugu umijesi ciklu u prahu, a u treću špinat u prahu." },
            { en: "Roll each piece about 6 mm thick on a floured surface. Cut out trees, gingerbread shapes and little wreaths.", hr: "Svaki dio razvaljaj na oko 6 mm na pobrašnjenoj podlozi. Izreži borove, medenjake i male vjenčiće." },
            { en: "Bake for 18–22 minutes, until firm and golden underneath. Cool completely on a rack.", hr: "Peci 18 do 22 minute, dok ne očvrsnu i ne porumene odozdo. Potpuno ohladi na rešetki." },
        ],
        qa: [
            [{ en: "Which colouring is safe?", hr: "Koje boje su sigurne?" }, { en: "Skip shop-bought dyes. Beetroot powder makes red and spinach powder makes green.", hr: "Preskoči kupovne boje. Cikla u prahu daje crvenu, a špinat u prahu zelenu." }],
            [{ en: "Can I make the dough ahead?", hr: "Mogu li tijesto pripremiti unaprijed?" }, { en: "Yes. Wrap it and keep it in the fridge for up to 48 hours. Let it rest 10–15 minutes before rolling.", hr: "Da. Zamotaj ga i čuvaj u hladnjaku do 48 sati. Prije valjanja neka odstoji 10–15 minuta." }],
        ],
        src: "https://mydogrecipe.com/christmas-dog-treats/",
    },
]

type Pouch = { id: string; n: LS; l1: LS; l2: LS; c: string; al: string[] }
const POUCHES: Pouch[] = [
    { id: "turkey-apple", n: { en: "Turkey & apple", hr: "Puretina i jabuka" }, l1: { en: "Turkey &", hr: "Puretina" }, l2: { en: "apple", hr: "i jabuka" }, c: "#5BA7D9", al: ["turkey", "grains"] },
    { id: "beef-sweet-potato", n: { en: "Beef & sweet potato", hr: "Govedina i batat" }, l1: { en: "Beef &", hr: "Govedina" }, l2: { en: "sweet potato", hr: "i batat" }, c: "#ED8824", al: ["beef"] },
    { id: "salmon-sweet-potato", n: { en: "Salmon & sweet potato", hr: "Losos i batat" }, l1: { en: "Salmon &", hr: "Losos" }, l2: { en: "sweet potato", hr: "i batat" }, c: "#E0715A", al: ["fish"] },
    { id: "turkey-spinach", n: { en: "Turkey & spinach", hr: "Puretina i špinat" }, l1: { en: "Turkey &", hr: "Puretina" }, l2: { en: "spinach", hr: "i špinat" }, c: "#3E7A4C", al: ["turkey"] },
]

/* ------------------------------------------------------------------ assets */

const IMGS = "https://framerusercontent.com/images/"
const ASSETS = "https://framerusercontent.com/assets/"
const ART = {
    bronx: IMGS + "ltKGbEBmytPFFspzgFBjJn1XacY.webp",
    wmG: IMGS + "MxEwnPai1gwSxXBU4XGsMxSmOaw.png",
    wmW: IMGS + "PvniTJPlT2Ait9hTuzsotFMMmKk.png",
    badge: IMGS + "EWqPQZUtPcdZBToVbLYiWsvQzE.png",
    fLetter: IMGS + "QQJNEYTgnj6NH5Sztc02ofXyI.png",
    bis1: IMGS + "Nn5wowMfYhAoESdEF62EqQgKMno.png",
    bis2: IMGS + "iGliucKopUyyV2VNXdn5YC78buA.png",
}
/* the Freshy's seal from the portfolio (the name around, the script F from the logo in the middle, centred on the letter itself),
   drawn as lines only, in the page's beige a little darker and see-through, so it stays quiet next to the questions; the ring turns slowly */
const FzSeal = () => (
    <svg viewBox="0 0 100 100" aria-hidden="true" focusable="false">
        <defs>
            <path id="fz-seal-ring" d="M50 50m-34 0a34 34 0 1 1 68 0a34 34 0 1 1-68 0" />
            <mask id="fz-seal-f" style={{ maskType: "alpha" }}>
                <image href={ART.fLetter} x="38.7" y="37.5" width="22" height="34" />
            </mask>
            {/* printed ink: the paper shows through in small specks, like a rubber stamp */}
            <filter id="fz-seal-ink" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
                <feTurbulence type="fractalNoise" baseFrequency="1.3" numOctaves="2" seed="7" result="n" />
                <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.2 1.75" result="a" />
                <feComposite in="SourceGraphic" in2="a" operator="in" />
            </filter>
        </defs>
        <g className="fz-sealink" filter="url(#fz-seal-ink)">
        <g className="fz-sealr">
            <circle className="fz-seall" cx="50" cy="50" r="41" fill="none" strokeWidth="1.6" />
            <circle className="fz-seall" cx="50" cy="50" r="27" fill="none" strokeWidth="1.2" strokeDasharray="2 3" />
            <text className="fz-sealt" fontFamily="FzInter,Inter,system-ui,sans-serif" fontWeight={700} fontSize="7.6" letterSpacing="1.25">
                <textPath href="#fz-seal-ring">FRESHY'S · FRESH DOG FOOD · OSIJEK ·</textPath>
            </text>
        </g>
        <rect className="fz-sealt" x="38" y="36.5" width="24" height="36" mask="url(#fz-seal-f)" />
        </g>
    </svg>
)
const UR_L = "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD"
const UR_X = "U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C4,U+2113,U+2C60-2C7F,U+A720-A7FF"
const face = (fam: string, file: string, w: string, ur: string) => `@font-face{font-family:${fam};font-style:normal;font-weight:${w};font-display:swap;src:url(${ASSETS}${file}) format("woff2");unicode-range:${ur}}`
const FONTS =
    face("FzInter", "VOdzGNKCk9El4KYY0X0KVcIqI.woff2", "100 900", UR_L) +
    face("FzInter", "uelJbsdo7YzSUPVJRa6KOw7QG6Y.woff2", "100 900", UR_X) +
    face("FzHand", "igFGesmeDRDLqZwcoVnxE9a7Fps.woff2", "400 700", UR_L) +
    face("FzHand", "W1mcsuuohtPFAdUeGWDwH7mU.woff2", "400 700", UR_X)

/* -------------------------------------------------------------------- text */

const X = (en: string, hr: string): LS => ({ en, hr })
/* Ordering is not open yet: Freshy's has no kitchen or shop for it. Until SHOP is true, the site is recipes and amounts only,
   and every order button leads to the "Coming soon" page. The order flow below stays in the code for later. */
const SHOP = false
const T = {
    proto: X("Concept website · prototype", "Koncept web stranice · prototip"),
    recipes: X("Recipes", "Recepti"),
    order: X("Order", "Narudžba"),
    how: X("How it works", "Kako radi"),
    story: X("Our story", "Naša priča"),
    orderBtn: X("Order", "Naruči"),
    menu: X("Menu", "Izbornik"),
    close: X("Close", "Zatvori"),
    eb: X("Fresh dog food", "Svježa hrana za pse"),
    h1a: X("Real food.", "Real food."),
    h1b: X("Real good.", "Real good."),
    sub: X("Recipes in grams, with the right amount for your dog. No time to cook? Order fresh meals instead.", "Recepti u gramima, s pravom količinom za tvog psa. Nemaš vremena kuhati? Naruči svježe obroke."),
    cta1: X("Order fresh food", "Naruči svježu hranu"),
    cta2: X("Find a recipe", "Pronađi recept"),
    heroNote: X("the reason we cook", "zbog njih kuhamo"),
    calcH: X("How much does your dog need a day?", "Koliko tvom psu treba dnevno?"),
    calcSub: X("Enter your dog's weight. We'll show how much your dog needs a day and how many days one batch lasts.", "Upiši koliko teži tvoj pas. Pokazat ćemo koliko mu treba dnevno i za koliko dana je dovoljan jedan recept."),
    weight: X("Weight", "Težina"),
    active: X("How active?", "Koliko se kreće?"),
    acts: [X("Not much", "Malo"), X("Normal", "Uobičajeno"), X("Sport or work", "Sport ili rad")],
    actHint: [
        X("Also for dogs that gain weight easily.", "I za pse koji se lako debljaju."),
        X("Daily walks and play.", "Svakodnevne šetnje i igra."),
        X("Light work or regular sport. For hard work, such as herding or sledding, ask your vet.", "Lagan rad ili redovan sport. Za težak rad, npr. čuvanje stada ili vuču saonica, pitaj veterinara."),
    ],
    neut: X("Neutered or spayed?", "Kastriran ili sterilizirana?"),
    yesNo: [X("Yes", "Da"), X("No", "Ne")],
    foodK: X("Food", "Hrana"),
    foods: [X("Fresh", "Svježa"), X("Dry", "Suha"), X("Wet", "Mokra")],
    per100: X("kcal per 100 g", "kcal na 100 g"),
    foodHint: X("The pack says how many kcal are in 100 g. If it says kcal/kg, divide by 10. The numbers for fresh, dry and wet food are only examples.", "Na pakiranju piše koliko kcal ima 100 g. Ako piše kcal/kg, podijeli s 10. Brojevi za svježu, suhu i mokru hranu samo su primjer."),
    kcalBad: X("Check the number: food usually has between 70 and 450 kcal per 100 g.", "Provjeri broj: hrana obično ima između 70 i 450 kcal na 100 g."),
    needK: X("Energy a day", "Energija dnevno"),
    restE: X("At rest", "U mirovanju"),
    foodDay: X("Food a day", "Hrane dnevno"),
    foodDayNo: X("Enter the energy of the food.", "Upiši energiju hrane."),
    treatK: X("Treats and toppers", "Poslastice i dodaci"),
    treatD: X("10% of daily calories. On days you give them, give that much less food.", "10 % dnevnih kalorija. Kad ih daješ, daj toliko manje hrane."),
    startT: X(
        "This is a starting amount. Dogs of the same weight can need more or less, so watch your dog's weight and shape: if it gains weight, give a little less; if it loses weight, a little more. For puppies, pregnant or nursing dogs, and dogs that are overweight, underweight or ill, decide the amount with your vet.",
        "Ovo je početna količina. Psi iste težine mogu trebati više ili manje, pa prati težinu i izgled psa: ako se deblja, daj malo manje, a ako mršavi, malo više. Za štence, skotne ili dojeće kuje te pse koji su predebeli, premršavi ili bolesni količinu odredi s veterinarom."
    ),
    calcHowH: X("How we calculate", "Kako računamo"),
    how1: X("Energy at rest (RER) = 70 × weight in kg", "Energija u mirovanju (RER) = 70 × težina u kg"),
    how2: X("Energy a day = RER × factor", "Energija dnevno = RER × faktor"),
    how3: X("Grams = energy a day ÷ energy of the food", "Grami = energija dnevno ÷ energija hrane"),
    facH: X("Factors for dogs", "Faktori za pse"),
    facW: X("Moderate or hard work: ask your vet", "Umjeren ili težak rad: pitaj veterinara"),
    facRows: {
        n: X("Neutered adult", "Kastriran odrasli pas"),
        i: X("Intact adult", "Nekastriran odrasli pas"),
        l: X("Not very active, or gains weight easily", "Malo se kreće ili se lako deblja"),
        a: X("Light work or sport", "Lagan rad ili sport"),
        p0: X("Puppy under 4 months", "Štene do 4 mjeseca"),
        p1: X("Puppy from 4 months to adult", "Štene od 4 mjeseca do odrasle dobi"),
    } as Record<string, LS>,
    srcT: X("Source", "Izvor"),
    checkT: X("Check", "Provjera"),
    checkA: X("a 4.5 kg dog needs", "pas od 4,5 kg treba"),
    checkB: X("kcal at rest; with factor 1.4, that is", "kcal u mirovanju; uz faktor 1,4 to je"),
    checkC: X("kcal a day.", "kcal dnevno."),
    less: X("Less", "Manje"),
    more: X("More", "Više"),
    mlDay: X("ml a day", "ml dnevno"),
    onScale: X("Change age and neutering on the scale", "Dob i kastraciju promijeni na vagi"),
    full: X("Freshy's complete meals", "Cijeli Freshy's obroci"),
    gDay: X("g a day", "g dnevno"),
    topper: X("Home-cooked stew as a topper", "Domaće varivo kao dodatak"),
    upTo: X("up to", "do"),
    topperD: X("Toppers stay under 10% of daily calories.", "Dodatak ostaje ispod 10 % dnevnih kalorija."),
    est: X("A starting amount from the AAHA guidelines, for food with 120 kcal per 100 g (example). Your vet knows your dog best.", "Početna količina prema smjernicama AAHA, za hranu sa 120 kcal na 100 g (primjer). Veterinar najbolje poznaje tvog psa."),
    calcNote: X("every dog is different!", "svaki pas je drugačiji!"),
    weekH: X("This week's recipes", "Recepti ovog tjedna"),
    weekSub: X("Cook them at home, or order the complete version.", "Skuhaj ih kod kuće ili naruči cijeli obrok."),
    allR: X("All recipes", "Svi recepti"),
    cook: X("Cook", "Skuhaj"),
    twoH: X("Cook it yourself, or we cook it.", "Skuhaj ga ti ili ga skuhamo mi."),
    twoSub: X("The same dishes, two ways. At home they are toppers. From our kitchen they are complete meals.", "Ista jela, na dva načina. Kod kuće su dodatak. Iz naše kuhinje su cijeli obroci."),
    cookT: X("Cook it at home", "Skuhaj kod kuće"),
    cookD: X("Free recipes in grams and millilitres, with warnings right in the ingredient list.", "Besplatni recepti u gramima i mililitrima, s upozorenjima odmah uz sastojke."),
    cookL: [X("More than 300 recipes, meals and treats", "Više od 300 recepata, obroci i poslastice"), X("A portion for your dog on every recipe", "Porcija za tvog psa uz svaki recept"), X("Filters for allergies", "Filtri za alergije")],
    cookB: X("Browse recipes", "Pogledaj recepte"),
    readyT: X("Order it ready", "Naruči gotovo"),
    readyD: X("Complete meals portioned for your dog, cooked in small batches, frozen and delivered in a cool box.", "Cijeli obroci odmjereni za tvog psa, kuhani u malim količinama, smrznuti i dostavljeni u termo kutiji."),
    readyL: [X("Portions by weight and activity", "Porcije prema težini i aktivnosti"), X("A trial box, no subscription", "Probni paket, bez pretplate"), X("Skip or stop any time", "Preskoči ili prekini kad hoćeš")],
    makePlan: X("Make a plan", "Napravi plan"),
    howH: X("How ordering works", "Kako radi narudžba"),
    hows: [
        [X("Tell us about your dog", "Reci nam nešto o psu"), X("Weight, age, how active, and what they can't eat.", "Težina, dob, koliko je aktivan i što ne smije jesti.")],
        [X("We cook and freeze", "Mi kuhamo i zamrzavamo"), X("Small batches, one pouch for each meal.", "Male količine, jedna vrećica za jedan obrok.")],
        [X("It arrives in a cool box", "Stiže u termo kutiji"), X("Thaw a pouch in the fridge overnight, then pour it into the bowl.", "Vrećicu preko noći odmrzni u hladnjaku, pa je istresi u zdjelu.")],
    ] as [LS, LS][],
    storyH: X("Meet Bronx.", "Ovo je Bronx."),
    storyP1: X("Bronx is the reason Freshy's exists. He had a problem with his anal glands, and the vet who helped him told us it is common in dogs.", "Bronx je razlog zašto postoji Freshy's. Imao je problem s analnim žlijezdama, a veterinar koji mu je pomogao rekao nam je da je to kod pasa često."),
    storyP2: X("That made me wonder how many dogs simply don't eat well. So I started reading about dog food. I found people sharing recipes and asking how much to feed, and fresh food delivered from Zagreb, but only if you ordered a lot. In Osijek, there was nothing like it.", "Tad sam se zapitao koliko pasa jednostavno ne jede dobru hranu. Počeo sam čitati o hrani za pse. Našao sam ljude koji dijele recepte i pitaju koliko dati psu, i svježu hranu koja se dostavlja iz Zagreba, ali samo ako naručiš puno. U Osijeku nije bilo ničeg sličnog."),
    storyP3: X("Freshy's started on Instagram in November 2025. This website is the next step: recipes with the amounts written down, and fresh meals you can order in Osijek.", "Freshy's je krenuo na Instagramu u studenom 2025. Ova stranica je sljedeći korak: recepti sa zapisanim količinama i svježi obroci koje možeš naručiti u Osijeku."),
    storySign: X("— Tonči & Bronx", "— Tonči i Bronx"),
    storyNote: X("hi, it's me", "bok, to sam ja"),
    ig: X("Freshy's on Instagram", "Freshy's na Instagramu"),
    faqH: X("Questions people ask", "Pitanja koja ljudi postavljaju"),
    faqSub: X("We read over a hundred comments under dog food recipes. These questions kept coming back.", "Pročitali smo više od stotinu komentara ispod recepata za pse. Ova pitanja su se stalno vraćala."),
    faq: [
        [X("How much should my dog eat?", "Koliko bi moj pas trebao jesti?"), X("The scale above shows how many grams of each dish your dog needs a day. It is an estimate, so check with your vet.", "Vaga gore pokazuje koliko grama kojeg jela tvom psu treba dnevno. To je procjena, pa provjeri s veterinarom.")],
        [X("How much does one recipe make?", "Koliko hrane daje jedan recept?"), X("Every recipe says how much it makes, and how many days that lasts for your dog.", "Uz svaki recept piše koliko hrane daje i za koliko dana je dovoljno tvom psu.")],
        [X("Is peanut butter safe for dogs?", "Je li maslac od kikirikija siguran za pse?"), X("Only without xylitol, which is poisonous to dogs. On the label it can also be listed as E967 or birch sugar, so read the ingredients. Every recipe with peanut butter warns you.", "Samo bez ksilitola, koji je psima otrovan. Na sastavu može pisati i kao E967 ili brezov šećer, pa pročitaj sastav. Svaki recept s maslacem od kikirikija na to upozorava.")],
        [X("Can I use shop-bought broth?", "Smijem li koristiti kupovnu juhu?"), X("Yes, if the label has no onion or garlic. Many low-salt broths still contain them.", "Da, ako u sastavu nema luka ni češnjaka. Mnoge juhe s malo soli ih ipak sadrže.")],
        [X("My dog can't eat eggs or grains. What now?", "Moj pas ne smije jaja ili žitarice. Što sad?"), X("On the recipes page, choose “Dog can't have” and tap what your dog can't eat. When you order, tick the same.", "Na stranici s receptima odaberi „Pas ne smije” i dodirni što pas ne smije jesti. Kod narudžbe označi isto.")],
        [X("Can I print a recipe?", "Mogu li isprintati recept?"), X("Yes. Every recipe has a Print button.", "Da. Svaki recept ima gumb Ispiši.")],
        [X("Can I just order the food?", "Mogu li jednostavno naručiti hranu?"), X("Yes. That is the other half of Freshy's: make a plan and we cook complete meals for your dog.", "Da. To je druga polovica Freshy'sa: napravi plan, a mi kuhamo cijele obroke za tvog psa.")],
    ] as [LS, LS][],
    faqNow: [] as [LS, LS][],
    tagline: X("Real food. Real good.", "Real food. Real good."),
    footShop: X("Shop", "Trgovina"),
    footAbout: X("About", "O nama"),
    credit: X("Amounts converted to grams and millilitres.", "Količine su preračunate u grame i mililitre."),
    protoFoot: X("A concept website by Tonči Hrgović. Prices are examples and nothing is actually sold.", "Koncept web stranice: Tonči Hrgović. Cijene su primjeri i ništa se stvarno ne prodaje."),
    // recipes page
    rSubAll: X("All the recipes", "Svi recepti"),
    rSubFrom: X("to cook at home", "za kuhanje kod kuće"),
    rSub: X(", in grams and millilitres. Tap what you have at home, and we'll show what you can cook with it.", ", u gramima i mililitrima. Dodirni što imaš doma, a mi ćemo pokazati što od toga možeš skuhati."),
    search: X("Search a recipe or ingredient, e.g. pumpkin", "Traži recept ili sastojak, npr. bundeva"),
    clear: X("Clear search", "Očisti pretragu"),
    cats: [["all", X("All", "Svi")], ["daily", X("Whole-day meals", "Cjelodnevni obroci")], ["top", X("Toppers", "Dodaci")], ["treats", X("Treats", "Poslastice")], ["stomach", X("Bland meals", "Blagi obroci")]] as [string, LS][],
    none: X("Nothing matches. Try another word, or remove a filter.", "Ništa ne odgovara. Probaj drugu riječ ili makni filtar."),
    noneNote: X("now I'm hungry", "sad sam gladan"),
    showAll: X("Show all recipes", "Prikaži sve recepte"),
    wish: X("my wish list ↓", "moj popis želja ↓"),
    // kinds
    kTopper: X("Topper", "Dodatak"),
    kMeal: X("Whole-day meal", "Cjelodnevni obrok"),
    kTreat: X("Treat", "Poslastica"),
    kBland: X("Bland diet", "Blaga dijeta"),
    tex: { frozen: X("Frozen", "Smrznuto"), crunchy: X("Crunchy", "Hrskavo"), soft: X("Soft", "Mekano") } as Record<string, LS>,
    // recipe page
    makes: X("Makes", "Količina"),
    ingH: X("Ingredients", "Sastojci"),
    tick: X("Tick them off as you go.", "Označi sastojak kad ga pripremiš."),
    batch: [X("Normal", "Obična"), X("Double", "Dvostruka")],
    batchL: X("Batch", "Količina"),
    method: X("Method", "Priprema"),
    optional: X("optional", "po želji"),
    forDog: X("How much for your dog?", "Koliko smije tvoj pas?"),
    // a recipe that is a meal: the owner chooses how it is fed, and the amount is in litres, pieces or days, never "1/20 of the recipe"
    forDogM: X("How much for your dog?", "Koliko za tvog psa?"),
    cookK: X("How many days are you cooking for?", "Za koliko dana kuhaš?"),
    cookO: [X("1 recipe", "1 recept"), X("7 days", "7 dana"), X("30 days", "30 dana"), X("Other", "Drugo")],
    cookAny: X("Type any number of days.", "Upiši bilo koji broj dana."),
    cookSteps: X("The amounts in the steps are for one recipe.", "Količine u koracima vrijede za jedan recept."),
    dailyHint: X("Dishes with enough calories for the whole day. Dishes with fewer calories, such as soups, are under Toppers: a dog would have to eat more of them for the whole day. Cook for a week, split it into daily portions and freeze them. On a recipe, pick how many days you're cooking for and the amounts are worked out for your dog.", "Jela s dovoljno kalorija za cijeli dan. Jela s manje kalorija, poput juha, su u Dodacima: od njih bi pas za cijeli dan morao pojesti više. Skuhaj za tjedan, podijeli na dnevne porcije i zamrzni. Na receptu odaberi za koliko dana kuhaš i količine se izračunaju za tvog psa."),
    batch3: [X("Normal", "Obična"), X("Double", "Dvostruka"), X("More", "Više")],
    batchN: X("How many times the recipe", "Koliko puta recept"),
    vnK: X("Because of an upset stomach?", "Zbog želuca?"),
    vnP: X("If your vet recommended a bland meal, the vet decides how much and for how long. Write down what they said, so it's in one place.", "Ako ti je blagi obrok preporučio veterinar, on određuje koliko i koliko dugo. Zapiši što je rekao, da ti je na jednom mjestu."),
    vnAdd: X("Write down what the vet said", "Zapiši što je rekao veterinar"),
    vnDays: X("For how many days", "Koliko dana"),
    vnAmt: X("How much a day, as the vet said", "Koliko na dan, kako je rekao veterinar"),
    vnAmtPh: X("e.g. 3 × 150 g", "npr. 3 × 150 g"),
    vnSave: X("Save", "Spremi"),
    vnCancel: X("Cancel", "Odustani"),
    vnEdit: X("Change", "Promijeni"),
    vnDel: X("Remove", "Ukloni"),
    vnDel2: X("Really remove?", "Stvarno ukloni?"),
    vnHead: X("Your vet recommended", "Veterinar je preporučio"),
    vnFine: X("Your own note of what the vet said. It isn't a prescription or a report.", "Tvoja bilješka onoga što je rekao veterinar. Nije recept ni nalaz."),
    vnOver: X("The days the vet gave have passed.", "Dani koje je rekao veterinar su prošli."),
    vnWhile: X("While the vet's recommendation lasts, the vet's amount is the one that counts.", "Dok traje preporuka veterinara, vrijedi količina koju je on rekao."),
    feedL: X("How will you feed it?", "Kako ga želiš hraniti?"),
    feedO: [X("Only this food", "Samo ova hrana"), X("Half and half", "Pola-pola"), X("With kibble", "Uz granule")],
    feedD: [X("Only home-cooked food", "Samo domaća hrana"), X("Half home-cooked, half kibble", "Pola domaće hrane, pola granula"), X("A little home-cooked food on top of the kibble", "Malo domaće hrane na granule")],
    actS: [X("not very active", "malo se kreće"), X("normally active", "uobičajeno se kreće"), X("sport or work", "sport ili rad")],
    chg: X("Change", "Promijeni"),
    howK: X("How we worked it out", "Kako smo izračunali"),
    vetDay: X("This recipe hasn't been checked as a complete diet: if your dog eats it every day, ask your vet about vitamins and minerals.", "Recept nije provjeren kao cjelovita prehrana: ako ga pas jede svaki dan, pitaj veterinara za vitamine i minerale."),
    onTop: X("On top of the food your dog usually eats.", "Uz hranu koju inače jede."),
    dayL: X("Dishes for the whole day", "Jela za cijeli dan"),
    dayAll: X("All whole-day dishes", "Sva jela za cijeli dan"),
    dayPup: X("For a puppy: the amount on top of puppy food.", "Za štene: količina uz hranu za štence."),
    kibQ: X("Feeding kibble only? Work it out from the pack", "Hraniš samo granulama? Izračunaj s pakiranja"),
    kcMid: X("We work with the middle:", "Računamo sa sredinom:"),
    halfRest: X("The other half is the usual food: give half as much of it as usual.", "Druga polovica je uobičajena hrana: daj je upola manje nego inače."),
    pfMixK: X("Home-cooked food", "Domaća hrana"),
    pfMixH: X("Only home-cooked food, half and half, or a little home-cooked food on top of the kibble. Recipes and Make a meal work out the amounts from this.", "Samo domaća hrana, pola-pola ili malo domaće hrane na granule. Recepti i Složi obrok po tome računaju količine."),
    about: X("about", "oko"),
    recDay: X("of the recipe a day", "recepta dnevno"),
    recsDay: X("recipes a day", "recepta dnevno"),
    wholeRec: X("the whole recipe", "cijeli recept"),
    daysOne: X("days from one recipe", "dana traje jedan recept"),
mealNote: X("This recipe hasn't been checked as a complete diet. If your dog eats this much of it every day, agree a vitamin and mineral supplement with your vet.", "Ovaj recept nije provjeren kao cjelovita prehrana. Ako ga pas jede ovoliko svaki dan, s veterinarom dogovori dodatak vitamina i minerala."),
    mealWhy: X("why", "zašto"),
    mealPup: X("Puppies are still growing and need exact amounts of calcium and phosphorus, so a home-cooked recipe as their only food is something to agree with your vet. This is the amount on top of puppy food.", "Štenci rastu i trebaju točno odmjeren kalcij i fosfor, pa domaći recept kao jedinu hranu dogovori s veterinarom. Ovo je količina uz hranu za štence."),
    needsSrc: X("AAHA guidelines", "smjernice AAHA"),
    usual: X("on top of the usual food", "uz uobičajenu hranu"),
    treatsAll: X("All treats together stay under 10% of daily calories.", "Sve poslastice zajedno ostaju ispod 10 % dnevnih kalorija."),
    treatZero: X("Less than one a day: break one into small pieces.", "Manje od jednog dnevno: razlomi ga na komadiće."),
    bland: X("Give a bland meal only when your vet recommends it. Your vet decides how much and for how long.", "Blagi obrok daj samo kad ga preporuči veterinar. Koliko i koliko dugo, određuje veterinar."),
    blandVet: X("Bland meals are for when your vet recommends one. Freshy's doesn't advise on treatment.", "Blagi obroci su za kad ih preporuči veterinar. Freshy's ne savjetuje liječenje."),
    keeps: X("Keeps", "Čuvanje"),
    kcal: X("Calories", "Kalorije"),
    kcSrc: X("worked out from the ingredients (USDA)", "izračunato iz sastojaka (USDA)"),
    myDog: X("My pets", "Moji ljubimci"),
    pfH: X("My pets", "Moji ljubimci"),
    pfLead: X("A few questions about your pet. Then this page keeps track of weight and health, and for a dog the scale and every recipe show amounts just for them.", "Nekoliko pitanja o tvom ljubimcu. Nakon toga ova stranica prati težinu i zdravlje, a za psa vaga i svi recepti pokazuju količine baš za njega."),
    pfLeadDog: X("A few questions about your dog. Then this page keeps track of weight and health, and the scale and every recipe show amounts just for them.", "Nekoliko pitanja o tvom psu. Nakon toga ova stranica prati težinu i zdravlje, a vaga i svi recepti pokazuju količine baš za njega."),
    pfSaved: X("Saved only in this browser. Nothing is sent anywhere.", "Spremljeno samo u ovom pregledniku. Nigdje se ne šalje."),
    pfStep: X("of", "od"),
    pfBack: X("Back", "Natrag"),
    pfNext: X("Next", "Dalje"),
    pfDone: X("Done", "Gotovo"),
    pfSkip: X("Skip", "Preskoči"),
    pfEdit: X("Edit", "Uredi"),
    pfCard: X("Dog ID card", "Pseća iskaznica"),
    pfDel: X("Delete profile", "Obriši profil"),
    pfDelSure: X("Delete it for good", "Obriši zauvijek"),
    pfNew: X("Start again", "Kreni ispočetka"),
    pfSeeRec: X("See recipes", "Pogledaj recepte"),
    pfToRes: X("Result", "Rezultat"),
    pfYourDog: X("Your dog", "Tvoj pas"),
    pfSex: X("Boy or girl?", "Pas ili kuja?"),
    pfSexes: [X("Male", "Mužjak"), X("Female", "Ženka")],
    pfName: X("Name", "Ime"),
    pfNeutK: [X("Neutered", "Kastriran"), X("Spayed", "Sterilizirana")],
    pfNeutHint: X("Neutered dogs need fewer calories.", "Kastriranim i steriliziranim psima treba manje kalorija."),
    pfBornK: [X("Born", "Rođen"), X("Born", "Rođena")],
    pfMonth: X("Month", "Mjesec"),
    pfYear: X("Year", "Godina"),
    pfMonths: [X("January", "siječanj"), X("February", "veljača"), X("March", "ožujak"), X("April", "travanj"), X("May", "svibanj"), X("June", "lipanj"), X("July", "srpanj"), X("August", "kolovoz"), X("September", "rujan"), X("October", "listopad"), X("November", "studeni"), X("December", "prosinac")],
    pfRough: X("Roughly is fine.", "Otprilike je u redu."),
    pfNoBorn: X("I don't know", "Ne znam"),
    pfKnowBorn: X("I know roughly when", "Znam otprilike kad"),
    pfBreedK: X("Breed", "Pasmina"),
    pfBk: [X("Purebred", "Čistokrvan"), X("Mixed", "Mješanac"), X("Not sure", "Ne znam")],
    pfFind: X("Type a breed", "Upiši pasminu"),
    pfFind2: X("Second breed, if you know it", "Druga pasmina, ako je znaš"),
    pfMixHint: X("Pick the breeds if you know them. If not, pick the size.", "Odaberi pasmine ako ih znaš. Ako ne, odaberi veličinu."),
    pfSizeK: X("Size when grown", "Veličina kad odraste"),
    pfSizes: [X("Small, up to 10 kg", "Mali, do 10 kg"), X("Medium, 10–25 kg", "Srednji, 10–25 kg"), X("Large, 25–45 kg", "Veliki, 25–45 kg"), X("Giant, over 45 kg", "Divovski, više od 45 kg")],
    pfSizeNo: X("Don't know", "Ne znam"),
    pfNoHit: [X("That breed isn't on the FCI list. Try the English name, or pick Mixed.", "Te pasmine nema na popisu FCI-ja. Probaj engleski naziv ili odaberi Mješanac."), X("That breed isn't on the FCI list. Try the English name, or just pick the size.", "Te pasmine nema na popisu FCI-ja. Probaj engleski naziv ili samo odaberi veličinu.")],
    pfLoading: X("Loading breeds…", "Učitavam pasmine…"),
    pfLoadErr: X("Breeds didn't load. Check the connection and try again.", "Pasmine se nisu učitale. Provjeri vezu i pokušaj ponovno."),
    pfStd: X("Breed standard (FCI)", "Standard pasmine (FCI)"),
    pfStdNoW: X("The breed standard doesn't give a weight.", "Standard pasmine ne navodi težinu."),
    pfMixW: X("For this mix", "Za ovaj križanac"),
    pfSizeW: X("For this size", "Za ovu veličinu"),
    pfMales: X("males", "mužjaci"),
    pfFemales: X("females", "ženke"),
    pfAbout: X("about", "oko"),
    pfAtLeast: X("at least", "najmanje"),
    pfUpTo: X("up to", "do"),
    pfScaleHint: [X("Step on the scale alone, then holding him. The difference is his weight.", "Stani na vagu sam, pa s njim u naručju. Razlika je njegova težina."), X("Step on the scale alone, then holding her. The difference is her weight.", "Stani na vagu sam, pa s njom u naručju. Razlika je njezina težina.")],
    pfGrow: X("Still growing?", "Još raste?"),
    pfGrowHint: X("Large breeds keep growing after their first birthday. A growing dog needs more.", "Velike pasmine rastu i nakon prve godine. Psu koji raste treba više."),
    pfBodyK: X("Shape from above", "Izgled odozgo"),
    pfBodyHint: X("Look from above and feel the ribs with your palm.", "Pogledaj ga odozgo i opipaj rebra dlanom."),
    pfBodies: [
        [X("Too thin", "Premršav"), X("Too thin", "Premršava")],
        [X("Just right", "Taman"), X("Just right", "Taman")],
        [X("Chubby", "Bucmast"), X("Chubby", "Bucmasta")],
        [X("Fat", "Debeo"), X("Fat", "Debela")],
    ] as LS[][],
    pfBodyD: [
        X("Ribs, spine and hip bones show. No fat to feel.", "Vide se rebra, kralježnica i kukovi. Masnoće nema."),
        X("Ribs are easy to feel. The waist shows from above.", "Rebra se lako napipaju. Struk se vidi odozgo."),
        X("Ribs are hard to feel. The waist barely shows.", "Rebra se teško napipaju. Struk se jedva vidi."),
        X("You can't feel the ribs. No waist, and the belly hangs.", "Rebra se ne mogu napipati. Struka nema, a trbuh visi."),
    ],
    pfIdeal: X("Target weight, if your vet gave you one", "Ciljna težina, ako ti ju je rekao veterinar"),
    pfThin: X("A dog that's too thin should see a vet first, to find out why.", "Premršavog psa prvo pregledaj kod veterinara, da se vidi zašto."),
    pfHealthK: X("Health", "Zdravlje"),
    pfHealths: [[X("Healthy", "Zdrav"), X("Healthy", "Zdrava")], [X("Illness or a special diet", "Bolest ili posebna dijeta"), X("Illness or a special diet", "Bolest ili posebna dijeta")], [X("Pregnant or nursing", "Skotna ili doji"), X("Pregnant or nursing", "Skotna ili doji")]] as LS[][],
    pfVet: X("Then the vet decides how much to feed. The recipes are still here for you.", "Tada količinu hrane određuje veterinar. Recepti su ti i dalje tu."),
    pfFoodK: X("Eats now", "Jede sada"),
    pfFoods: [X("Dry food", "Suha hrana"), X("Wet food", "Mokra hrana"), X("Cooked at home", "Kuhano doma"), X("Something else", "Nešto drugo")],
    pfKc: X("kcal per 100 g, from the bag", "kcal na 100 g, s vrećice"),
    pfGday: X("Grams a day now", "Grama dnevno sada"),
    pfTreatsK: X("Treats", "Poslastice"),
    pfTreats: [X("No", "Ne"), X("Sometimes", "Ponekad"), X("Every day", "Svaki dan")],
    pfNoHint: X("If there's nothing, just go on.", "Ako nema ničega, samo idi dalje."),
    pfAges: [X("puppy under 4 months", "štene do 4 mjeseca"), X("puppy", "štene"), X("adult", "odrasli")],
    pfKcalDay: X("kcal a day", "kcal dnevno"),
    pfLose: X("For losing weight: energy at rest for the target weight of", "Za mršavljenje: energija u mirovanju za ciljnu težinu od"),
    pfLoseVet: X("Agree the weight-loss plan with your vet.", "Plan mršavljenja dogovori s veterinarom."),
    pfMaint: X("Energy at rest × factor for age and activity (AAHA).", "Energija u mirovanju × faktor za dob i kretanje (AAHA)."),
    pfWeightK: X("Weight", "Težina"),
    pfJustRight: X("The shape is just right, so the weight is right for this dog too.", "Izgled je taman, pa je i težina dobra za ovog psa."),
    pfOver: X("Target weight: about", "Ciljna težina: oko"),
    pfOverHow: X("Worked out from the shape: each step above just right is about 10 % extra weight. Your vet can give the exact target.", "Procjena prema izgledu: svaki stupanj iznad idealnog je oko 10 % viška težine. Točan cilj zna veterinar."),
    pfBelow: X("is below that range", "je ispod tog raspona"),
    pfIn: X("is within that range", "je unutar tog raspona"),
    pfAbove: X("is above that range", "je iznad tog raspona"),
    pfShapeWins: X(", but the body shape matters more than the scale", ", ali je izgled tijela važniji od vage"),
    pfTheDog: X("Your dog", "Tvoj pas"),
    pfFoodNow: X("Current food", "Sadašnja hrana"),
    pfGrams: X("g a day", "g dnevno"),
    pfMore: X("more than the top of the range", "više od gornje granice"),
    pfLess: X("less than the bottom of the range", "manje od donje granice"),
    pfNowGive: X("Now you give", "Sada daješ"),
    pfFits: X("That fits.", "To odgovara."),
    pfTreatT: X("Treats", "Poslastice"),
    pfTreatD: X("That's 10 % of the day. On treat days, give that much less of the main food.", "To je 10 % dana. Na dan poslastica daj toliko manje glavne hrane."),
    pfRecT: X("Recipes", "Recepti"),
    pfRecD: X("Every recipe now shows amounts for your dog.", "Svi recepti sada pokazuju količine za tvog psa."),
    pfSrc: X("Sources", "Izvori"),
    pfIll: X("For a dog with an illness or a special diet, the vet decides how much to feed.", "Za psa s bolešću ili posebnom dijetom količinu hrane određuje veterinar."),
    pfPreg: X("For a pregnant or nursing dog, the vet decides how much to feed.", "Za skotnu ili dojeću kuju količinu hrane određuje veterinar."),
    pfPupFat: X("Only a vet can put a puppy on a diet. If you think it's too heavy, ask your vet.", "Dijetu štenetu može odrediti samo veterinar. Ako misliš da je preteško, pitaj veterinara."),
    pfMake: X("Make a profile for your dog and every amount on this site will be for your dog.", "Napravi profil svog psa i sve količine na stranici bit će za njega."),
    pfMakeB: X("Make a profile", "Napravi profil"),
    pfFor: X("Worked out for", "Računamo za"),
    pfMonthsW: X("mo", "mj."),
    pfYearsW: X("yrs", "god."),
    pfBNote: [X("not a gram more. — B.", "ni grama više. — B."), X("welcome! — B.", "dobro došao! — B."), X("welcome! — B.", "dobro došla! — B.")],
    pfNeutS: [
        [X("neutered", "kastriran"), X("spayed", "sterilizirana")],
        [X("not neutered", "nekastriran"), X("not spayed", "nesterilizirana")],
    ] as LS[][],
    pfMixed: X("mixed breed", "mješanac"),
    pfBackTo: X("Use the profile again", "Vrati na profil"),
    pfManual: X("The scale was changed by hand.", "Vaga je promijenjena ručno."),
    pfAAHA: X("AAHA guidelines", "smjernice AAHA"),
    pfWSAVA: X("WSAVA body shape chart", "WSAVA ljestvica izgleda tijela"),
    pfFCI: X("FCI breed standards", "standardi pasmina FCI"),
    pfHKS: X("Croatian names: HKS", "hrvatska imena: HKS"),
    ptSexQ: [X("Boy or girl?", "Pas ili kuja?"), X("Male or female?", "Mačak ili mačka?"), X("Male or female?", "Mužjak ili ženka?")],
    ptAdd: X("Add a pet", "Dodaj ljubimca"),
    ptTabs: [X("Overview", "Pregled"), X("Journal", "Dnevnik")],
    ptVetB: X("For the vet", "Za veterinara"),
    ptLogB: X("Add entry", "Zapiši"),
    ptSpQ: X("Who are you adding?", "Koga dodaješ?"),
    ptSpK: X("Species", "Vrsta"),
    ptSps: [X("A dog", "Psa"), X("A cat", "Mačku"), X("Another pet", "Nekog drugog")],
    ptSpN: [X("dog", "pas"), X("cat", "mačka"), X("pet", "ljubimac")],
    ptSpSeg: [X("Dog", "Pas"), X("Cat", "Mačka"), X("Other", "Drugo")],
    ptSpD: [
        X("Weight, body shape and health. Plus calories and grams of food for every recipe.", "Težina, izgled i zdravlje. Uz to kalorije i grami hrane za svaki recept."),
        X("Weight, body shape and health. The recipes on this site are for dogs.", "Težina, izgled i zdravlje. Recepti na stranici su za pse."),
        X("Rabbit, bird, hamster… Weight and a health journal.", "Zec, ptica, hrčak… Težina i dnevnik zdravlja."),
    ],
    ptKind: X("What animal?", "Koja životinja?"),
    ptKindPh: X("e.g. rabbit", "npr. zec"),
    ptCatSex: [X("Male", "Mačak"), X("Female", "Mačka")],
    ptYour: [X("Your dog", "Tvoj pas"), X("Your cat", "Tvoja mačka"), X("Your pet", "Tvoj ljubimac")],
    ptCard: [X("Dog ID card", "Pseća iskaznica"), X("Cat ID card", "Mačja iskaznica"), X("Pet ID card", "Iskaznica ljubimca")],
    ptW: X("Weight", "Težina"),
    ptWAdd: X("+ Weigh-in", "+ Vaganje"),
    ptSince: X("since", "od"),
    ptWk: X("a week", "tjedno"),
    ptPace: [X("slower than advised", "sporije od preporuke"), X("a safe pace", "siguran tempo"), X("too fast", "prebrzo")],
    ptNoDrop: X("weight isn't dropping", "težina ne pada"),
    ptGoal: X("Target", "Cilj"),
    ptGoalL: X("target", "cilj"),
    ptPaceSrc: [X("Dogs should lose 1–2 % of their weight a week. Faster isn't good.", "Psi bi trebali gubiti 1–2 % težine tjedno. Brže nije dobro."), X("Cats should lose 0.5–2 % of their weight a week. Faster isn't good.", "Mačke bi trebale gubiti 0,5–2 % težine tjedno. Brže nije dobro.")],
    ptAahaWm: X("AAHA weight guidelines", "smjernice AAHA za težinu"),
    ptFast: X("Losing faster than the guidelines advise. Show the chart to your vet.", "Gubi brže nego što preporučuju smjernice. Pokaži graf veterinaru."),
    ptSlow: X("Losing slower than the guidelines advise. Show the chart to your vet.", "Gubi sporije nego što preporučuju smjernice. Pokaži graf veterinaru."),
    ptFlat: X("The weight isn't dropping. Show the chart to your vet.", "Težina ne pada. Pokaži graf veterinaru."),
    ptOneW: X("After the next weigh-in, the chart shows where the weight is heading.", "Nakon sljedećeg vaganja graf pokazuje kamo ide težina."),
    ptLastW: X("last", "zadnje"),
    ptGrow: X("Still growing, so there is no target weight.", "Još raste, pa nema ciljne težine."),
    ptBody: X("Body shape", "Izgled tijela"),
    ptCheck: X("Check", "Provjeri"),
    ptBodyHint: X("Body shape changes more slowly than weight. Checking once a month is enough.", "Izgled se mijenja sporije od vage. Dovoljno ga je provjeriti jednom mjesečno."),
    ptPics: X("Photos from above", "Slike odozgo"),
    ptPicAdd: X("+ Photo", "+ Slika"),
    ptPicHint: X("One photo from above each month, so you can see the change even when the scale is slow.", "Slika odozgo svaki mjesec, pa se razlika vidi i kad je vaga spora."),
    ptBodyDC: [
        X("Ribs, spine and hip bones are easy to see. No fat to feel.", "Rebra, kralježnica i kukovi se lako vide. Masnoće nema."),
        X("Ribs are easy to feel under a thin layer of fat. A waist shows behind the ribs.", "Rebra se napipaju ispod tankog sloja masti. Iza rebara se vidi struk."),
        X("Ribs are hard to feel. The waist barely shows and the belly is rounded.", "Rebra se teško napipaju. Struk se jedva vidi, a trbuh je zaobljen."),
        X("You can't feel the ribs. No waist, and the belly hangs.", "Rebra se ne mogu napipati. Struka nema, a trbuh visi."),
    ],
    ptFood: X("Food today", "Hrana danas"),
    ptChange: X("Change", "Promijeni"),
    ptLoseAs: X("For weight loss, worked out as for a dog of", "Za mršavljenje računamo kao za psa od"),
    ptTreatsTo: X("Treats: up to", "Poslastice: do"),
    ptADay: X("a day", "dnevno"),
    ptNotDog: [
        X("The recipes and food amounts on Freshy's are for dogs. Here you keep track of weight, body shape and health.", "Recepti i količine hrane na Freshy'su su za pse. Ovdje se bilježe težina, izgled i zdravlje."),
        X("The recipes and food amounts on Freshy's are for dogs. Here you keep track of weight and health.", "Recepti i količine hrane na Freshy'su su za pse. Ovdje se bilježe težina i zdravlje."),
    ],
    ptCkK: [X("Appetite", "Apetit"), X("Energy", "Energija"), X("Digestion", "Probava")],
    ptCkV: [
        [X("Good", "Dobar"), X("Poor", "Slab"), X("Not eating", "Ne jede")],
        [X("Lots", "Puno"), X("Normal", "Normalno"), X("Low", "Malo")],
        [X("Normal", "Normalno"), X("Soft", "Mekano"), X("Diarrhoea", "Proljev")],
    ] as LS[][],
    ptLast7: X("last 7 days", "zadnjih 7 dana"),
    ptSavedAt: X("Saved at", "Spremljeno u"),
    ptCkBad: [X("Appetite was poorer", "Apetit je bio slabiji"), X("Energy was lower", "Energija je bila slabija"), X("Digestion wasn't normal", "Probava nije bila uredna")],
    ptCkAll: X("All normal in the last 7 days.", "Zadnjih 7 dana sve uredno."),
    ptCkVet: X("This is only a record. If something worries you, contact your vet.", "Ovdje se samo bilježi. Ako te nešto brine, javi se veterinaru."),
    ptBound: X("Freshy's keeps your notes and shows them back to you. It doesn't diagnose and doesn't advise on treatment. If something worries you, contact your vet.", "Freshy's čuva tvoje zapise i pokazuje ti ih. Ne postavlja dijagnozu i ne savjetuje liječenje. Ako te nešto brine, javi se veterinaru."),
    ptCkTap: X("One tap for each, saved straight away. Tap again to clear.", "Jedan dodir za svako, sprema se odmah. Ponovni dodir briše."),
    ptHealth: X("Health", "Zdravlje"),
    ptAll: X("All entries", "Svi zapisi"),
    ptNoH: X("No entries yet. Injuries, illnesses, vet visits and vaccinations go here.", "Još nema zapisa. Ovdje idu ozljede, bolesti, posjeti veterinaru i cijepljenja."),
    ptTy: {
        start: X("Start", "Početak"),
        w: X("Weigh-in", "Vaganje"),
        b: X("Body shape", "Izgled"),
        inj: X("Injury", "Ozljeda"),
        ill: X("Illness or symptom", "Bolest ili simptom"),
        vet: X("Vet", "Veterinar"),
        vac: X("Vaccination", "Cijepljenje"),
        par: X("Parasite protection", "Zaštita od parazita"),
        med: X("Medicine", "Lijek"),
        note: X("Note", "Bilješka"),
    } as Record<string, LS>,
    ptInjSt: [X("New", "Novo"), X("Healing", "Zacjeljuje"), X("Healed", "Zacijelilo")],
    ptIllSt: [X("Ongoing", "Traje"), X("Over", "Prošlo")],
    ptNxL: { vac: X("next", "sljedeće"), par: X("next", "sljedeća"), vet: X("check-up", "kontrola"), inj: X("check-up", "kontrola"), ill: X("check-up", "kontrola"), med: X("until", "do") } as Record<string, LS>,
    ptOnScale: X("on the vet's scale", "na vagi kod veterinara"),
    ptUp: X("Coming up", "Uskoro"),
    ptCal: X("To calendar", "U kalendar"),
    ptRemK: X("Remind me", "Podsjeti me"),
    ptRemO: [X("1 day", "1 dan"), X("3 days", "3 dana"), X("7 days", "7 dana")],
    ptRemT: X("before, and on the day at 9:00.", "prije, i na sam dan u 9:00."),
    ptRemTom: X("Tomorrow: ", "Sutra: "),
    ptVetK: X("Vet", "Veterinar"),
    ptVetPick: X("Choose a vet clinic", "Odaberi ambulantu"),
    ptVetOwnH: X("Add a clinic", "Upiši ambulantu"),
    ptVetLead: [X("Choose the clinic ", "Odaberi ambulantu u koju ide "), X(" goes to. The summary for the vet and the reminders then know who they are for.", ". Papir za veterinara i podsjetnici onda znaju kome idu.")],
    ptVetPlace: X("Town, place or clinic name", "Grad, mjesto ili ime ambulante"),
    ptVetPlacePh: X("e.g. Osijek", "npr. Osijek"),
    ptVetLoading: X("Loading the list…", "Učitavam popis…"),
    ptVetNone: X("Nothing found. Check the place name or add the clinic yourself.", "Nismo je našli. Provjeri ime mjesta ili upiši ambulantu sam."),
    ptVetErr: X("The list can't be loaded right now. Add the clinic yourself.", "Popis se sada ne može učitati. Upiši ambulantu sam."),
    ptVetOff: X("Clinics are listed under their official company names, so the address is often easier to recognise.", "Ambulante su upisane službenim imenom tvrtke, pa ih je lakše prepoznati po adresi."),
    ptVetSrc: X("List: Ministry of Agriculture, Forestry and Fisheries, registers of veterinary organisations, as of February 2026", "Popis: Ministarstvo poljoprivrede, šumarstva i ribarstva, upisnici veterinarskih organizacija, stanje veljača 2026."),
    ptVetSrcL: X("data.gov.hr, Open Licence", "data.gov.hr, Otvorena dozvola"),
    ptVetOwn: X("Not on the list? Add it yourself", "Nema je na popisu? Upiši sam"),
    ptVetBackList: X("Back to the search", "Natrag na pretragu"),
    ptPickB: X("Choose", "Odaberi"),
    ptPicked: X("Chosen", "Odabrano"),
    ptVetMore: X("Show more", "Pokaži još"),
    ptVetNarrow: X("Add a street or a name for a shorter list.", "Dodaj ulicu ili ime za kraći popis."),
    ptVetN: X("Clinic name", "Ime ambulante"),
    ptVetA: X("Address and place", "Adresa i mjesto"),
    ptVetT: X("Phone", "Telefon"),
    ptVetE: X("Clinic email", "E-mail ambulante"),
    ptVetIfKnown: X("add it if you know it", "upiši ako ga znaš"),
    ptVetNeedN: X("Type the clinic's name.", "Upiši ime ambulante."),
    ptVetChg: X("Change", "Promijeni"),
    ptSaveB: X("Save", "Spremi"),
    ptCall: X("Call", "Nazovi"),
    ptGoogle: X("Reviews and photos on Google Maps", "Ocjene i slike na Google kartama"),
    ptBook: X("Book a visit", "Naruči termin"),
    ptBookS: X("Book", "Naruči"),
    ptSendSum: X("Vet visits", "Pregledi"),
    ptForVet: X("For", "Za"),
    ptBookSubj: X(" – appointment request", " – molim termin za pregled"),
    ptBookHi: X("Hello,\nI would like to book an appointment.", "Pozdrav,\nmolim termin za pregled."),
    ptBookPet: X("Pet", "Ljubimac"),
    ptBookWhy: X("Reason", "Razlog"),
    ptBookWhen: X("What suits me", "Odgovara mi"),
    ptBookRec: X("From my notes", "Iz mojih zapisa"),
    ptSwitch: X("Changing food? Do it gradually, over 7 days: start by replacing a quarter of the old food with the new one.", "Mijenjaš hranu? Postupno, kroz 7 dana: prvo zamijeni četvrtinu stare hrane novom."),
    ptSwitchSrc: X("AAHA, changing to a new food", "AAHA, prelazak na novu hranu"),
    ptSwitchVet: X("Agree any change of food with your vet.", "Promjenu hrane dogovori s veterinarom."),
    ptMcK: X("Monthly check", "Mjesečna provjera"),
    ptMcSw: X("Monthly check reminder", "Podsjetnik za mjesečnu provjeru"),
    ptMcOffH: X("Two minutes once a month", "Dvije minute jednom mjesečno"),
    ptMcOffD: X("Weigh, look from above and take a photo. The chart and photos are then always ready for the vet.", "Vaganje, izgled odozgo i slika. Graf i slike su tako uvijek spremni za veterinara."),
    ptMcOnD: X("Two minutes once a month. Your calendar reminds you on the 1st.", "Dvije minute jednom mjesečno. Kalendar te podsjeti 1. u mjesecu."),
    ptMcLeft: [X("all done", "sve je gotovo"), X("one more thing", "još jedna stvar"), X("two more things", "još dvije stvari"), X("three things", "tri stvari")],
    ptMcItems: [X("Weigh-in", "Vaganje"), X("Look from above", "Izgled odozgo"), X("Photo from the side", "Slika sa strane")],
    ptMcAct: [X("+ Weigh-in", "+ Vaganje"), X("Check", "Provjeri"), X("+ Photo", "+ Slika")],
    ptMcCal: X("Monthly check: weigh-in, body shape, photo", "Mjesečna provjera: vaganje, izgled, slika"),
    ptNoUp: X("Nothing planned. When you add a vaccination or parasite protection, the next date shows up here.", "Ništa nije zakazano. Kad upišeš cijepljenje ili zaštitu od parazita, ovdje se pojavi sljedeći datum."),
    ptUpT: { vac: X("Vaccination", "Cijepljenje"), par: X("Parasite protection", "Zaštita od parazita"), vet: X("Vet check-up", "Kontrola kod veterinara"), ctl: X("Check-up", "Kontrola"), med: X("Last day of medicine", "Zadnji dan lijeka") } as Record<string, LS>,
    ptTodayW: X("today", "danas"),
    ptTomorrow: X("tomorrow", "sutra"),
    ptEditId: X("Edit ID card", "Uredi iskaznicu"),
    ptRedo: X("Answer the questions again", "Ponovi pitanja"),
    ptDelPet: X("Delete pet", "Obriši ljubimca"),
    ptDelSure: X("Delete with all entries", "Obriši sa svim zapisima"),
    ptExp: X("Save a copy", "Spremi kopiju"),
    ptImp: X("Load a copy", "Učitaj kopiju"),
    ptImpGo: X("Load and replace", "Učitaj i zamijeni"),
    ptCancel: X("Cancel", "Odustani"),
    ptImpBad: X("This isn't a Freshy's copy.", "Ovo nije Freshy's kopija."),
    ptImpOk: X("Loaded.", "Učitano."),
    ptSaveErr: X("Not saved: the browser is out of room. Save a copy and remove a few photos.", "Nije spremljeno: pregledniku je ponestalo mjesta. Spremi kopiju i makni koju sliku."),
    ptBusy: X("Preparing the copy…", "Pripremam kopiju…"),
    ptFilt: [X("All", "Sve"), X("Weight", "Težina"), X("Health", "Zdravlje"), X("Vet", "Veterinar"), X("Notes", "Bilješke")],
    ptEdit: X("Edit", "Uredi"),
    ptNoLog: X("Nothing here yet.", "Ovdje još nema ničega."),
    ptStartT: X("Start: the profile was made", "Početak: napravljen je profil"),
    ptNewE: X("New entry", "Novi zapis"),
    ptEditE: X("Edit entry", "Uredi zapis"),
    ptWhat: X("What are you adding?", "Što zapisuješ?"),
    ptDate: X("Date", "Datum"),
    ptKgSmall: X("Under a kilo? Type e.g. 0.045 (that's 45 g).", "Manje od kilograma? Upiši npr. 0,045 (to je 45 g)."),
    ptBodyOpt: X("Body shape (optional)", "Izgled tijela (nije obavezno)"),
    ptTiL: { inj: X("What happened?", "Što se dogodilo?"), ill: X("What did you notice?", "Što je primijećeno?"), vet: X("Reason for the visit", "Razlog posjeta"), vac: X("Against what", "Protiv čega"), par: X("What", "Što"), med: X("Medicine", "Lijek") } as Record<string, LS>,
    ptTiPh: { inj: X("e.g. cut on a paw", "npr. posjekotina na šapi"), ill: X("e.g. vomiting", "npr. povraćanje"), vet: X("e.g. weight check", "npr. kontrola težine"), vac: X("e.g. rabies", "npr. bjesnoća"), par: X("e.g. tick and flea tablet", "npr. tableta protiv krpelja i buha"), med: X("name of the medicine", "ime lijeka") } as Record<string, LS>,
    ptIllPick: [X("Vomiting", "Povraćanje"), X("Diarrhoea", "Proljev"), X("Limping", "Šepanje"), X("Itching", "Svrbež"), X("Coughing", "Kašalj"), X("Not eating", "Ne jede")],
    ptVetKg: X("Weight on the vet's scale (optional)", "Težina na vagi kod veterinara (nije obavezno)"),
    ptTxL: { vet: X("What the vet advised", "Što je savjetovao veterinar"), med: X("Dose and how it's given", "Doza i kako se daje"), note: X("Note", "Bilješka") } as Record<string, LS>,
    ptTxOpt: X("Note (optional)", "Bilješka (nije obavezno)"),
    ptSt: X("Status", "Stanje"),
    ptNxF: { vac: X("Next vaccination", "Sljedeće cijepljenje"), par: X("Next dose", "Sljedeća doza"), vet: X("Next check-up (optional)", "Sljedeća kontrola (nije obavezno)"), inj: X("Vet check-up (optional)", "Kontrola kod veterinara (nije obavezno)"), ill: X("Vet check-up (optional)", "Kontrola kod veterinara (nije obavezno)"), med: X("Given until", "Daje se do") } as Record<string, LS>,
    ptIn: [X("in 1 month", "za 1 mj."), X("in 3 months", "za 3 mj."), X("in 1 year", "za 1 god.")],
    ptPhotos: X("Photos", "Slike"),
    ptPhAdd: X("Add a photo", "Dodaj sliku"),
    ptPhBusy: X("Saving the photo…", "Spremam sliku…"),
    ptPhErr: X("The photo wasn't saved.", "Slika se nije spremila."),
    ptPhDel: X("Remove photo", "Makni sliku"),
    ptSerious: X("If it looks serious, call your vet. This is only a record.", "Ako ti se čini ozbiljno, nazovi veterinara. Ovdje se samo bilježi."),
    ptSave: X("Save", "Spremi"),
    ptDelE: X("Delete", "Obriši"),
    ptDelESure: X("Delete for good", "Obriši zauvijek"),
    ptNeed: { w: X("Type the weight.", "Upiši težinu."), b: X("Pick the body shape.", "Odaberi izgled."), ti: X("Type what happened.", "Upiši što se dogodilo."), med: X("Type the medicine.", "Upiši lijek."), note: X("Write the note.", "Napiši bilješku.") } as Record<string, LS>,
    ptClose: X("Close", "Zatvori"),
    ptVetH: X("Summary for the vet", "Papir za veterinara"),
    ptPrint: X("Save as PDF (A4) or print", "Spremi kao PDF (A4) ili ispiši"),
    ptBack: X("Back", "Natrag"),
    ptVetFoot: X("Entered by the owner in Freshy's. This is not a vet's report.", "Upisao vlasnik u Freshy's. Ovo nije veterinarski nalaz."),
    ptVetSec: [X("Details", "Podaci"), X("Weight", "Težina"), X("Health, last 6 months", "Zdravlje, zadnjih 6 mjeseci"), X("Vaccinations and parasite protection", "Cijepljenja i zaštita od parazita"), X("Medicines", "Lijekovi"), X("Daily check-in, last 14 days", "Dnevno pitanje, zadnjih 14 dana")],
    ptVetRow: [X("Species", "Vrsta"), X("Sex", "Spol"), X("Age", "Dob"), X("Breed", "Pasmina"), X("Weight now", "Težina sada"), X("Target", "Cilj"), X("Body shape", "Izgled tijela"), X("Health", "Zdravlje")],
    ptGoalSrc: [X("from the vet", "od veterinara"), X("estimated from body shape", "procjena prema izgledu")],
    ptNone: X("Nothing recorded.", "Ništa nije upisano."),
    ptAnswered: X("days answered", "upisanih dana"),
    ptAlways: X("always", "uvijek"),
    ptSum: X("Record", "Karton"),
    ptChg: X("Change", "Promjena"),
    ptEntries: X("Entries", "Zapisa"),
    ptLastWk: X("Last weigh-in", "Zadnje vaganje"),
    ptPerK: X("Period", "Razdoblje"),
    ptPer: [X("Last 30 days", "Zadnjih 30 dana"), X("Last 6 months", "Zadnjih 6 mjeseci"), X("Everything", "Sve")],
    ptSendMail: X("Send by email", "Pošalji e-mailom"),
    ptShareF: X("Share the file", "Podijeli datoteku"),
    ptDlF: X("Download the file", "Preuzmi datoteku"),
    ptPdfHint: X("For a PDF, choose “Save as PDF” in the print window and attach it to the email. The file opens in any browser and has the chart and photos.", "Za PDF u prozoru za ispis odaberi „Spremi kao PDF” i priloži ga e-mailu. Datoteka se otvara u svakom pregledniku i ima graf i slike."),
    ptVetMail: X("Vet's email (optional, stays in this browser)", "E-mail veterinara (nije obavezno, ostaje u ovom pregledniku)"),
    ptVetMailPh: X("clinic email", "e-mail ambulante"),
    ptMailIntro: X("Hello, here are the notes I keep for my pet in Freshy's.", "Pozdrav, šaljem zapise koje vodim za svog ljubimca u Freshy'su."),
    ptShareFail: X("Sharing didn't work here. Download the file and attach it to the email.", "Dijeljenje ovdje ne radi. Preuzmi datoteku i priloži je e-mailu."),
    ptWhere: X("Where was it weighed?", "Gdje je vagano?"),
    ptWhereO: [X("At home", "Kod kuće"), X("At the vet", "Kod veterinara")],
    ptHowW: X("At home: step on the scale alone, then holding your pet. The difference is their weight. Always use the same scale.", "Kod kuće: stani na vagu sam, pa s ljubimcem u naručju. Razlika je njegova težina. Važi uvijek na istoj vagi."),
    ptAtVet: X("at the vet", "kod veterinara"),
    ptTr: [
        X("Cuddly", "Mazan"),
        X("Playful", "Razigran"),
        X("Calm", "Miran"),
        X("Curious", "Znatiželjan"),
        X("Brave", "Hrabar"),
        X("Shy", "Sramežljiv"),
        X("Loves food", "Proždrljivac"),
        X("Sleepyhead", "Pospanko"),
        X("Talkative", "Brbljavac"),
        X("Independent", "Svojeglav"),
    ],
    ptTrF: [
        X("Cuddly", "Mazna"),
        X("Playful", "Razigrana"),
        X("Calm", "Mirna"),
        X("Curious", "Znatiželjna"),
        X("Brave", "Hrabra"),
        X("Shy", "Sramežljiva"),
        X("Loves food", "Proždrljivica"),
        X("Sleepyhead", "Pospanka"),
        X("Talkative", "Brbljavica"),
        X("Independent", "Svojeglava"),
    ],
    ptTrHint: X("Pick up to three.", "Odaberi do tri."),
    ptFav: X("What do they love most?", "Što najviše voli?"),
    ptFavPh: X("e.g. the ball, the sofa, carrots", "npr. lopticu, kauč, mrkvu"),
    ptPicAddP: X("Add a photo", "Dodaj sliku"),
    ptPicChg: X("Change the photo", "Promijeni sliku"),
    ptPicDel: X("Remove the photo", "Makni sliku"),
    ptPicNote: X("The photo stays only in this browser.", "Slika ostaje samo u ovom pregledniku."),
    ptPicSkip: X("You can add it later too.", "Možeš je dodati i kasnije."),
    ptSinceK: X("With you since", "S tobom od"),
    ptSinceH: X("Month and year. If you don't remember exactly, roughly is fine.", "Mjesec i godina. Ako se ne sjećaš točno, otprilike je dovoljno."),
    ptBdayK: X("Birthday (day of the month)", "Rođendan (dan u mjesecu)"),
    ptBdayH: X("Only if you know it. Then you'll see how many days are left.", "Samo ako ga znaš. Tada vidiš koliko je dana ostalo."),
    ptQK: X("If they could say one thing, what would it be?", "Da može nešto reći, što bi rekao?"),
    ptQPh: X("e.g. One more walk?", "npr. Još jedna šetnja?"),
    ptWithYou: X("with you for", "s tobom"),
    ptWithNew: X("with you since this month", "s tobom od ovog mjeseca"),
    ptBdayIn: X("Birthday in", "Rođendan za"),
    ptBdayToday: X("Happy birthday!", "Sretan rođendan!"),
    ptBdayTmr: X("Birthday tomorrow", "Rođendan je sutra"),
    ptLoves: X("Loves", "Najviše voli"),
    ptEditPr: X("Edit profile", "Uredi profil"),
    ptAddMore: X("Add a photo and a few words about them", "Dodaj sliku i nekoliko riječi o njemu"),
    ptHi: X("Hi", "Bok"),
    ptHiT: [
        X("is now on Freshy's. Here you'll keep their weight and food, and see how they're doing.", "je sada u Freshy'su. Ovdje ćeš pratiti težinu i hranu i vidjeti kako je."),
        X("is now on Freshy's. Here you'll keep their weight and see how they're doing.", "je sada u Freshy'su. Ovdje ćeš pratiti težinu i vidjeti kako je."),
    ],
    ptHiOk: X("Let's go", "Krenimo"),
    plus: X("Plus", "Plus"),
    plusEb: X("Freshy's Plus", "Freshy's Plus"),
    plusH: X("For people who keep an eye on every day.", "Za one koji prate svaki dan."),
    plusLead: X(
        "Recipes, the scale and your pet's profile stay free, for good. Plus is for when you want to follow more: how the weight changes, meals and walks, health, medicines, reminders and vet visits.",
        "Recepti, vaga i profil ljubimca ostaju besplatni, zauvijek. Plus je za kad želiš pratiti više: kako se mijenja težina, obroke i šetnje, zdravlje, lijekove, podsjetnike i preglede kod veterinara."
    ),
    plusFreeH: X("Free, for good", "Besplatno, zauvijek"),
    plusFree: [
        X("Your pet's profile", "Profil ljubimca"),
        X("Calories and grams of food for your dog", "Kalorije i grami hrane za tvog psa"),
        X("All recipes and Build a meal", "Svi recepti i Složi obrok"),
        X("Shopping list", "Popis za kupnju"),
        X("Weight and weigh-ins", "Težina i vaganja"),
    ],
    plusPlusH: X("Plus", "Plus"),
    plusPrice: X("€3 a month or €33 a year", "3 € mjesečno ili 33 € godišnje"),
    plusPlus: [
        X("Weight curve and a safe pace (AAHA)", "Krivulja težine i siguran tempo (AAHA)"),
        X("Daily question: appetite, energy, digestion", "Dnevno pitanje: apetit, energija, probava"),
        X("Body shape and photos over time", "Izgled tijela i slike kroz vrijeme"),
        X("Health: injuries, illness, vaccinations, medicines as your vet prescribed them", "Zdravlje: ozljede, bolesti, cijepljenja, lijekovi kako ih je propisao veterinar"),
        X("Meals and walks, written down by you", "Obroci i šetnje, kako ih zapišeš"),
        X("Medicine times with a tick when given", "Vremena lijekova i kvačica kad je dano"),
        X("Days to remember", "Dani za pamćenje"),
        X("Reminders and calendar", "Podsjetnici i kalendar"),
        X("Vet visits: your questions, a summary for the vet and the vet's own instructions", "Pregledi: tvoja pitanja, papir za veterinara i upute koje veterinar upiše sam"),
        X("More than one pet", "Više ljubimaca"),
    ],
    plusTry: X("Try it free for 30 days", "Isprobaj 30 dana besplatno"),
    plusTryN: X("No card. Nothing is charged by itself: when the trial ends, you decide.", "Bez kartice. Ništa se ne naplaćuje samo od sebe: kad proba završi, ti odlučuješ."),
    plusStay: X("I'll stay on free", "Ostajem na besplatnom"),
    plusBack: X("Back to my pets", "Natrag na ljubimce"),
    plusProm: [
        X("Everything you write down stays yours. You can see it and copy it out without Plus too.", "Sve što zapišeš ostaje tvoje. Vidiš ga i izvoziš i bez Plusa."),
        X("Your notes stay in this browser. We don't sell data and there are no ads.", "Zapisi ostaju u tvom pregledniku. Ne prodajemo podatke i nema oglasa."),
        X("Plus doesn't replace the vet. It helps you bring them the whole picture.", "Plus ne zamjenjuje veterinara. Pomaže ti da mu doneseš cijelu sliku."),
    ],
    plusOn: X("Plus is on", "Plus je uključen"),
    plusLeftT: X("days of the free trial left", "dana besplatne probe"),
    plusGift: X("Thank you for being with us from the start. Plus is on for you for 30 days, free.", "Hvala što si s nama od početka. Plus ti je uključen 30 dana, besplatno."),
    plusEnded: X("The free trial has ended. Everything you wrote down is still here. Paying for Plus isn't open on this site yet.", "Besplatna proba je završila. Sve što si zapisao i dalje je tu. Plaćanje Plusa na ovoj stranici još nije otvoreno."),
    plusTeaseT: X("Weight curve, daily question, health, meals and walks, medicines, days to remember, vet visits and more pets.", "Krivulja težine, dnevno pitanje, zdravlje, obroci i šetnje, lijekovi, dani za pamćenje, pregledi kod veterinara i više ljubimaca."),
    plusTeaseB: X("See what's in Plus", "Pogledaj što je u Plusu"),
    plusFree30: X("30 days free, no card.", "30 dana besplatno, bez kartice."),
    plusCurve: X("The weight curve and pace are in Plus.", "Krivulja težine i tempo su u Plusu."),
    plusMoreTy: X("Health, medicines and other entries are in Plus.", "Zdravlje, lijekovi i ostali zapisi su u Plusu."),
    plusAll: X("Everything that's free, and:", "Sve što je besplatno, i:"),
    ptTrK: X("Character", "Karakter"),
    /* Plus, second build: sidebar, meals, walks, medicines, days to remember; third build: the record for the vet */
    ptNav: { dash: X("Overview", "Pregled"), log: X("Journal", "Dnevnik"), meal: X("Meals", "Obroci"), walk: X("Walks", "Šetnje"), med: X("Medicines", "Lijekovi"), day: X("Days to remember", "Dani za pamćenje"), vet: X("Vet visits", "Pregledi") } as Record<string, LS>,
    ptNavK: X("Sections", "Dijelovi"),
    ptPetsK: X("Pets", "Ljubimci"),
    ptRm: X("Remove", "Ukloni"),
    ptRmY: X("Yes, remove", "Da, ukloni"),
    ptToday2: X("Today", "Danas"),
    ptTdMl0: X("No meals written down yet", "Još nema zapisanih obroka"),
    ptTdWk0: X("No walks this week yet", "Ovaj tjedan još nema šetnji"),
    ptTdWkK: X("This week", "Ovaj tjedan"),
    ptTdMdAll: X("All of today's medicines are ticked", "Svi današnji lijekovi su označeni"),
    ptTdMdAt: X("Medicine at", "Lijek u"),
    ptTdDay: X("Next day to remember", "Sljedeći dan za pamćenje"),
    ptMlLead: X("Pick what they ate and how much. The kcal come from our recipes or from your food's pack, so you don't count them.", "Odaberi što je jeo i koliko. Kalorije se računaju iz naših recepata ili s pakiranja tvoje hrane, ne moraš ih brojati."),
    ptMlTabs: [X("My food", "Moja hrana"), X("Freshy's recipes", "Freshy's recepti"), X("Something else", "Nešto drugo")],
    ptMlAgain: X("Same as before", "Kao i prije"),
    ptMlPickF: X("Pick a food or a recipe first.", "Prvo odaberi hranu ili recept."),
    ptMlQ: X("How much", "Koliko"),
    ptMlQBad: X("Write how much, for example 150.", "Upiši koliko, na primjer 150."),
    ptMlNoKcF: X("This one has no kcal, so only the amount is written down.", "Ovo nema kcal, pa se zapisuje samo količina."),
    ptMlFind: X("Find a recipe", "Potraži recept"),
    ptMlFindPh: X("e.g. pumpkin", "npr. bundeva"),
    ptMlLoading: X("Loading all the recipes…", "Učitavam sve recepte…"),
    ptMlNoRes: X("No recipe with that name.", "Nema recepta s tim imenom."),
    ptMlMore: X("Show all Freshy's recipes", "Prikaži sve Freshy's recepte"),
    ptMlOtherPh: X("e.g. A piece of carrot", "npr. Komadić mrkve"),
    ptFdAdd: X("+ Add a food", "+ Dodaj hranu"),
    ptFdNamePh: X("e.g. Dry food for adult dogs", "npr. Suha hrana za odrasle pse"),
    ptFdKc: X("kcal per 100 g, from the pack", "kcal na 100 g, s pakiranja"),
    ptFdT: [X("Dry", "Suha"), X("Wet", "Mokra"), X("Fresh", "Svježa"), X("Treat", "Poslastica"), X("From Build a meal", "Iz Složi obrok")],
    ptFdTK: X("Kind", "Vrsta"),
    ptFdHint: X("If the pack gives the energy, write it here (kcal per 100 g; if it says kcal/kg, divide by 10). If it doesn't, leave it empty: only the grams are written down and nothing is guessed.", "Ako na pakiranju piše energija, upiši je ovdje (kcal na 100 g; ako piše kcal/kg, podijeli s 10). Ako ne piše, ostavi prazno: zapisuju se samo grami i ništa se ne procjenjuje."),
    ptVfOpen: X("Let the vet write", "Neka veterinar upiše"),
    ptVfLead: X("At the visit, hand your phone to the vet. What they write goes into Medicines, reminders and the next summary for the vet.", "Na pregledu daj mobitel veterinaru. Što upiše, ide u Lijekove, podsjetnike i na sljedeći papir za veterinara."),
    ptVfH: X("Instructions from the vet", "Upute veterinara"),
    ptVfIntro: X("Please write what the owner should follow until the next visit. It stays only on this phone, in the owner's Freshy's. It is not a prescription or a medical report.", "Molimo upišite što vlasnik treba pratiti do sljedećeg pregleda. Ostaje samo na ovom mobitelu, u vlasnikovom Freshy'su. Nije recept ni nalaz."),
    ptVfDate: X("Date of the visit", "Datum pregleda"),
    ptVfBy: X("Clinic or vet", "Ambulanta ili veterinar"),
    ptVfKg: X("Weight on the clinic's scale (kg)", "Težina na vagi u ambulanti (kg)"),
    ptVfGoal: X("Target weight (kg), if you set one", "Ciljna težina (kg), ako je zadajete"),
    ptVfFood: X("Food a day", "Hrana na dan"),
    ptVfFq: X("Amount", "Količina"),
    ptVfFn: X("Which food", "Koja hrana"),
    ptVfFnPh: X("e.g. the current dry food", "npr. trenutna suha hrana"),
    ptVfDiet: X("Special diet", "Posebna prehrana"),
    ptVfDietPh: X("e.g. bland diet: boiled chicken and rice", "npr. blaga prehrana: kuhana piletina i riža"),
    ptVfDto: X("Until", "Do"),
    ptVfMd: X("Medicines", "Lijekovi"),
    ptVfMdAdd: X("+ Add a medicine", "+ Dodaj lijek"),
    ptVfMdRm: X("Remove this medicine", "Ukloni ovaj lijek"),
    ptVfNx: X("Next check-up", "Sljedeća kontrola"),
    ptVfNxr: X("Reason", "Razlog"),
    ptVfNxrPh: X("e.g. check the paw", "npr. pregled šape"),
    ptVfWatch: X("What to watch for, and when to come back at once", "Na što paziti i kada odmah doći"),
    ptVfWatchPh: X("e.g. if he vomits more than twice in a day", "npr. ako povrati više od dva puta u danu"),
    ptVfNote: X("Other notes", "Ostale napomene"),
    ptVfSave: X("Save instructions", "Spremi upute"),
    ptVfNeed: X("Please write at least one instruction.", "Molimo upišite barem jednu uputu."),
    ptVfBad: X("Please check the numbers.", "Molimo provjerite brojeve."),
    ptVfMdNeed: X("Each medicine needs a name and how to give it.", "Svaki lijek treba naziv i kako ga davati."),
    ptVfDone: X("Saved. You can give the phone back to the owner.", "Spremljeno. Mobitel možete vratiti vlasniku."),
    ptVfSeeIt: X("See the instructions", "Pogledaj upute"),
    ptVi: X("From the vet", "Upute veterinara"),
    ptViBy: X("written at the visit", "upisano na pregledu"),
    ptViGoal: X("Target weight", "Ciljna težina"),
    ptViFood: X("Food a day", "Hrana na dan"),
    ptViDiet: X("Special diet", "Posebna prehrana"),
    ptViNx: X("Next check-up", "Sljedeća kontrola"),
    ptViWatch: X("Watch for", "Na što paziti"),
    ptViNote: X("Note", "Napomena"),
    ptViPer: X("per the vet", "prema veterinaru"),
    ptViLast: X("Last instructions from the vet", "Zadnje upute veterinara"),
    ptSoonK: X("Vet visit", "Pregled kod veterinara"),
    ptSoonQ: X("Anything to ask the vet? Write it here, one question a line. It goes on the summary for the vet.", "Imaš li pitanja za veterinara? Zapiši ih ovdje, svako u svoj red. Idu na papir za veterinara."),
    ptSoonCal: X("Vet visit in 2 days. Anything to ask the vet? Write it in Freshy's, it goes on the summary for the vet.", "Pregled za 2 dana. Sjeti se: imaš li nešto za pitati veterinara? Zapiši u Freshy's, ide na papir za veterinara."),
    ptSoonToday: X("Today: tap Show the vet and hand them your phone.", "Danas: dodirni Pokaži veterinaru i daj mu mobitel."),
    ptTipsK: X("Before the visit", "Prije pregleda"),
    ptTips: [
        X("Write down when it started and how often it happens.", "Zapiši kada je počelo i koliko se često događa."),
        X("If it doesn't happen all the time, take a photo or a short video.", "Ako se ne događa stalno, slikaj ili snimi kratki video."),
        X("Bring the medicines and the food you give, or a photo of the label.", "Ponesi lijekove i hranu koju daješ, ili sliku deklaracije."),
        X("Send the summary to the clinic or bring it printed.", "Pošalji papir ambulanti ili ga ponesi ispisanog."),
        X("At the visit, the vet can write the instructions straight into Freshy's.", "Na pregledu veterinar može upisati upute izravno u Freshy's."),
    ],
    ptKtTop: X("For this visit", "Za ovaj pregled"),
    ptKtVisit: X("Visit", "Pregled"),
    ptKt30: X("Changes, last 30 days", "Promjene, zadnjih 30 dana"),
    ptKtEv: X("New problems", "Novi problemi"),
    ptKtMdNow: X("Medicines now", "Lijekovi sada"),
    ptKtNoth: X("Nothing out of the ordinary written down.", "Ništa neuobičajeno nije zapisano."),
    ptKtVetTip: X("For the vet: at the visit you can write the instructions straight into the owner's Freshy's (Vet visits → Show the vet → Write the instructions).", "Za veterinara: na pregledu upute možete upisati izravno u vlasnikov Freshy's (Pregledi → Pokaži veterinaru → Upišite upute)."),
    pvNext: X("Next visit", "Sljedeći pregled"),
    pvNoNext: X("Vet visit", "Pregled"),
    pvNoNextT: X("No visit planned", "Nema zakazanog pregleda"),
    pvNoNextD: X("Write the date in when the clinic gives it to you, and a reminder comes 2 days before.", "Upiši datum kad ti ga ambulanta da, a podsjetnik stiže 2 dana prije."),
    pvPlan: X("Add an appointment", "Upiši termin"),
    pvPlanD: X("Date of the appointment", "Datum termina"),
    pvPlanWhy: X("Reason (optional)", "Razlog (nije obavezno)"),
    pvPlanWhyPh: X("e.g. check the paw", "npr. kontrola šape"),
    pvPlanSave: X("Save the appointment", "Spremi termin"),
    pvPlanBad: X("Pick a date from today on.", "Odaberi datum od danas nadalje."),
    pvPlanRm: X("Remove the appointment", "Ukloni termin"),
    pvPlanRmY: X("Yes, remove it", "Da, ukloni ga"),
    pvQs: X("Questions", "Pitanja"),
    pvSinceD: X("Since", "Od"),
    pvLastSaid: X("Last time", "Zadnji put"),
    pvShow: X("Show the vet", "Pokaži veterinaru"),
    pvShowN: X("At the visit: tap it and hand the phone to the vet.", "Na pregledu: dodirni i daj mobitel veterinaru."),
    pvForVet: X("For the vet", "Za veterinara"),
    pvClose: X("Close", "Zatvori"),
    pvSaid: X("Last time you said", "Zadnji put ste rekli"),
    pvNow: X("Until today", "Do danas"),
    pvCtl: X("check-up agreed for", "kontrola dogovorena za"),
    pvFirst: X("No instructions from an earlier visit are written in Freshy's yet. Below is what the owner wrote down.", "Upute s ranijeg pregleda još nisu upisane u Freshy's. Ispod je ono što je vlasnik zapisao."),
    pvNews: X("New since", "Novo od"),
    pvNews30: X("New in the last 30 days", "Novo u zadnjih 30 dana"),
    pvWrite: X("Write the instructions", "Upišite upute"),
    pvLast: X("Last visit", "Zadnji pregled"),
    pvStamp: X("WRITTEN AT THE VISIT", "UPISANO NA PREGLEDU"),
    pvPast: X("Earlier visits", "Prošli pregledi"),
    pvIns: X("instructions", "upute"),
    pvSame: X("same", "isto"),
    pvNew: X("new", "novo"),
    pvChg: X("changed", "promjena"),
    pvWas: X("before:", "prije:"),
    pvPrefill: X("The fields hold the instructions from", "Polja su popunjena uputama od"),
    pvPrefill2: X("Change only what is new.", "Promijenite samo ono što je novo."),
    pvGoalS: X("target", "cilj"),
    pvThen: X("then", "tada"),
    pvAvg7: X("average a day, last 7 days", "prosjek na dan, zadnjih 7 dana"),
    pvNotLogged: X("not written down", "nije upisano"),
    pvEnded: X("ended", "završila"),
    pvOngoing: X("still on", "još traje"),
    pvGiven: X("given", "dano"),
    pvOf: X("of", "od"),
    pvNoTicks: X("no ticks", "bez oznaka"),
    pvNothing: X("Nothing written down since.", "Od tada ništa nije zapisano."),
    pvNowMd: X("Now", "Sada"),
    pvSee: X("See the summary", "Pogledaj papir"),
    pvHide: X("Hide the summary", "Sakrij papir"),
    pvPaperK: X("Summary and clinic", "Papir i ambulanta"),
    pvVetLines: X("Instructions from the vet (can be written by hand)", "Upute veterinara (mogu i rukom)"),
    pvBack: X("Back to vet visits", "Natrag na preglede"),
    pvLeft: X("to go", "još"),
    pvFoodT: X("Food today", "Hrana danas"),
    pvTonight: X("next at", "sljedeće u"),
    pvAllDone: X("all ticked today", "danas sve označeno"),
    pvDaysLeft: X("days left", "dana još"),
    pvUntilD: X("until", "do"),
    pvEntries: X("entries", "zapisa"),
    pvOffDays: X("days a bit off", "dana nešto nije bilo kako treba"),
    pvSinceW: X("since", "od"),
    pvVisitK: X("Visit", "Pregled"),
    pvVetAmt: X("The vet's amount", "Količina od veterinara"),
    pvSaidS: X("You said", "Rekli ste"),
    pvAvg7Cur: X("current food, average a day, last 7 days", "trenutna hrana, prosjek na dan, zadnjih 7 dana"),
    pvQsAsked: X("Questions asked", "Pitanja s pregleda"),
    pvInsIn: X("the instructions are in Vet visits", "upute su u Pregledima"),
    pvCal: X("Reminder to my calendar", "Podsjetnik u kalendar"),
    pvCalN: X("The calendar reminds you 2 days before, so you have time to write your questions down.", "Kalendar te podsjeti 2 dana prije, da stigneš zapisati pitanja."),
    pvInsRm: X("Remove these instructions", "Ukloni ove upute"),
    pvInsRmY: X("Yes, remove them", "Da, ukloni ih"),
    pvInsNote: X("Written by the vet at the visit. It is not a prescription or a medical report.", "Upisao veterinar na pregledu. Nije recept ni veterinarski nalaz."),
    ptMlSrcN: X("The kcal are approximate: for our recipes they are worked out from the ingredients (USDA), for bought food they are what the pack says. Food without kcal on the pack only counts in grams.", "Kalorije su približne: za naše recepte izračunate su iz sastojaka (USDA), a za kupovnu hranu su onoliko koliko piše na pakiranju. Hrana bez kcal na pakiranju broji se samo u gramima."),
    ptFdSave: X("Save food", "Spremi hranu"),
    ptFdNeed: X("Write the name of the food.", "Upiši naziv hrane."),
    ptFdKcBad: X("Check the number: between 20 and 900 kcal per 100 g.", "Provjeri broj: između 20 i 900 kcal na 100 g."),
    ptFdNoKc: X("kcal not entered", "kcal nije upisan"),
    ptFdNone: X("Save the food you give, with the kcal from the pack, and next time just pick it.", "Spremi hranu koju daješ, s kcal s pakiranja, i sljedeći put je samo odaberi."),
    ptFdProf: X("from the profile", "iz profila"),
    ptKbLog: X("Log as a meal", "Zapiši kao obrok"),
    ptMlK: [X("Current food", "Trenutna hrana"), X("A Freshy's recipe", "Freshy's recept"), X("Other food", "Druga hrana"), X("Treat", "Poslastica")],
    ptMlName: X("Name", "Naziv"),
    ptMlKcBad: X("Check the kcal: a number, for example 320.", "Provjeri kcal: broj, na primjer 320."),
    ptMlG: X("Grams", "Grami"),
    ptMlKc: X("kcal, if you know", "kcal, ako znaš"),
    ptMlTm: X("Time", "Vrijeme"),
    ptMlAdd: X("Add meal", "Dodaj obrok"),
    ptMlNeed: X("Write the grams, for example 150.", "Upiši grame, na primjer 150."),
    ptMlOf: X("of about", "od otprilike"),
    ptMlScale: X("the amount from the scale (AAHA)", "količina s vage (AAHA)"),
    ptMlNoT: X("For cats and other pets Freshy's doesn't work out an amount. This is a record for you and your vet.", "Za mačke i druge ljubimce Freshy's ne računa količinu. Ovo je zapis za tebe i veterinara."),
    ptMlAsk: X("Ask your vet how much. This is a record for both of you.", "Koliko, pitaj veterinara. Ovo je zapis za oboje."),
    ptMlNone: X("No meals written down for this day.", "Za ovaj dan nema zapisanih obroka."),
    ptMl7: X("Last 7 days", "Zadnjih 7 dana"),
    ptMlAvg: X("Average on days with meals", "Prosjek u danima s obrocima"),
    ptWkLead: X("Tap when you've been for a walk. Kilometres and minutes are optional.", "Dodirni kad ste bili u šetnji. Kilometri i minute nisu obavezni."),
    ptWkNow: X("We went for a walk", "Prošetali smo"),
    ptWkKm: X("km (optional)", "km (po želji)"),
    ptWkMin: X("minutes (optional)", "minute (po želji)"),
    ptWkDay: X("Day", "Dan"),
    ptWkBad: X("Check the numbers: up to 100 km and 600 minutes.", "Provjeri brojeve: najviše 100 km i 600 minuta."),
    ptWk4: X("Last 4 weeks", "Zadnja 4 tjedna"),
    ptWkList: X("Recent walks", "Zadnje šetnje"),
    ptWkNone: X("No walks written down yet.", "Još nema zapisanih šetnji."),
    ptWkThis: X("this week", "ovaj tjedan"),
    ptMdLead: X("Write each medicine exactly as your vet prescribed it. Freshy's never suggests a dose.", "Upiši svaki lijek točno kako ga je propisao veterinar. Freshy's nikad ne predlaže dozu."),
    ptMdName: X("Medicine", "Lijek"),
    ptMdNamePh: X("Name from the box", "Ime s kutije"),
    ptMdRx: X("As the vet prescribed it", "Kako ga je propisao veterinar"),
    ptMdRxPh: X("e.g. 1 tablet twice a day, with food", "npr. 1 tableta dvaput dnevno, uz hranu"),
    ptMdFrom: X("From", "Od"),
    ptMdTo: X("Until (if the vet said)", "Do (ako je veterinar rekao)"),
    ptMdTimes: X("Times of day", "U koliko sati"),
    ptMdTimeN: X("Time", "Vrijeme"),
    ptMdAddTm: X("+ Add a time", "+ Dodaj vrijeme"),
    ptMdRmTm: X("Remove this time", "Ukloni ovo vrijeme"),
    ptMdNoTm: X("No set times, for example when needed.", "Bez stalnih sati, na primjer po potrebi."),
    ptMdSave: X("Save medicine", "Spremi lijek"),
    ptMdNew: X("Add a medicine", "Dodaj lijek"),
    ptMdNeed: X("Fill in the medicine and how the vet prescribed it.", "Upiši lijek i kako ga je propisao veterinar."),
    ptMdNow: X("Current", "Trenutni"),
    ptMdPast: X("Earlier", "Prije"),
    ptMdToday: X("Today", "Danas"),
    ptMdGiven: X("given", "dano"),
    ptMdNot: X("not yet", "još nije"),
    ptMdTick: X("Tick when given", "Označi kad je dano"),
    ptMdSince: X("since", "od"),
    ptMdStarts: X("starts", "počinje"),
    ptMdUntil: X("until", "do"),
    ptMdNoEnd: X("no end date", "bez kraja"),
    ptMdStop: X("Finished", "Završeno"),
    ptMdStopQ: X("Yes, finished today", "Da, završeno danas"),
    ptMdNone: X("No medicines written down.", "Nema zapisanih lijekova."),
    ptMdCalT: X("Each time goes into the calendar as a daily reminder, until the last day.", "Svako vrijeme ide u kalendar kao dnevni podsjetnik, do zadnjeg dana."),
    ptDyLead: X("Birthdays, the day they came home, anything you don't want to forget.", "Rođendan, dan dolaska kući, sve što ne želiš zaboraviti."),
    ptDyBday: X("Birthday", "Rođendan"),
    ptDySince: X("Together since", "Zajedno od"),
    ptDyYrs: X("together", "zajedno"),
    ptDyName: X("Name", "Naziv"),
    ptDyNamePh: X("e.g. The day we brought her home", "npr. Dan kad je došla kući"),
    ptDyDate: X("Date", "Datum"),
    ptDyYearly: X("Every year", "Svake godine"),
    ptDyAdd: X("Add day", "Dodaj dan"),
    ptDyNeed: X("Write a name and pick a date.", "Upiši naziv i odaberi datum."),
    ptDyToday: X("Today!", "Danas!"),
    ptDyCal: X("All in the calendar", "Sve u kalendar"),
    ptDyNone: X("No days added yet.", "Još nema dodanih dana."),
    ptDyFromP: X("From the profile", "Iz profila"),
    ptDyOnce: X("once", "jednom"),
    ptDyPast: X("passed", "prošlo"),
    ptMlUnk: X("Meals without kcal aren't in the total.", "Obroci bez kcal nisu u zbroju."),
    ptMlDay: X("Day", "Dan"),
    ptMlPick: X("Tap a day to see its meals.", "Dodirni dan da vidiš njegove obroke."),
    ptMlKcU: X("kcal a day", "kcal na dan"),
    ptMlGU: X("grams a day", "grama na dan"),
    ptWkKmT: X("km together", "km ukupno"),
    ptWkMinT: X("min together", "min ukupno"),
    ptMdBadEnd: X("The last day can't be before the first.", "Zadnji dan ne može biti prije prvog."),
    ptMdTmBad: X("Check the times.", "Provjeri vremena."),
    ptMdCal: X("Times to calendar", "Vremena u kalendar"),
    ptMdFin: X("finished", "završeno"),
    ptMdNoTmS: X("no set times", "bez stalnih sati"),
    ptDyYear: X("year", "godina"),
    ptKt: X("Pet record", "Karton ljubimca"),
    ptVetMd: X("Medicines, as prescribed", "Lijekovi, kako su propisani"),
    ptVetFood: X("Food, last 7 days", "Hrana, zadnjih 7 dana"),
    ptVetWalk: X("Walks, last 30 days", "Šetnje, zadnjih 30 dana"),
    ptVetQ: X("Questions for the visit", "Pitanja za pregled"),
    ptVetQPh: X("Write what you want to ask. It goes on the summary for the vet.", "Napiši što želiš pitati. Ide na papir za veterinara."),
    ptVetAvgDay: X("on average a day", "prosječno na dan"),
    ptVetDaysW: X("days written down", "zapisanih dana"),
    ptVetCurFood: X("Current food", "Trenutna hrana"),
    noCook: X("Don't feel like cooking?", "Ne da ti se kuhati?"),
    print: X("Print", "Ispiši"),
    qaH: X("Questions about this recipe", "Pitanja o ovom receptu"),
    favH: X("Bronx's favourites", "Bronxovi favoriti"),
    allH: X("All recipes", "Svi recepti"),
    moreR: X("Show more", "Prikaži još"),
    loadingR: X("Loading recipes…", "Učitavam recepte…"),
    catErr: X("The recipes didn't load. Check your connection and try again.", "Recepti se nisu učitali. Provjeri vezu i pokušaj ponovno."),
    retry: X("Try again", "Pokušaj ponovno"),
    notFound: X("We couldn't find this recipe.", "Ovaj recept nismo našli."),
    enNote: X("", "Recept smo preveli s engleskog, a mjere preračunali u grame, mililitre i °C."),
    origNote: X("", "Ovo je recept na engleskom, s mjerama preračunatima u grame, mililitre i °C."),
    showOrig: X("Show in English", "Prikaži na engleskom"),
    showTr: X("Show the translation", "Prikaži prijevod"),
    warnC: {
        garlic: X("Garlic can harm dogs: it can damage their red blood cells. Leave it out.", "Češnjak može naštetiti psu: može oštetiti crvene krvne stanice. Izostavi ga."),
        vanilla: X("Vanilla extract usually contains alcohol, which isn't safe for dogs. Leave it out or use an alcohol-free one.", "Ekstrakt vanilije obično sadrži alkohol, koji nije siguran za pse. Izostavi ga ili uzmi onaj bez alkohola."),
        xylitol: X("Use peanut butter without xylitol. It's poisonous to dogs and can also be listed as E967 or birch sugar.", "Uzmi maslac od kikirikija bez ksilitola. Psima je otrovan, a na sastavu može pisati i kao E967 ili brezov šećer."),
        salt: X("Dogs don't need added salt. Leave it out.", "Psu ne treba dodana sol. Izostavi je."),
        bacon: X("Bacon is salty and fatty. Leave it out, or use a little plain cooked lean meat.", "Slanina je slana i masna. Izostavi je ili stavi malo kuhanog nemasnog mesa bez začina."),
    } as Record<string, LS>,
    suppH: X("This is a supplement, not a meal or a treat.", "Ovo je dodatak, a ne obrok ni poslastica."),
    suppP: X("Ask your vet how much to give, and whether your dog should have it at all.", "Koliko ga davati i treba li ga tvoj pas uopće, pitaj veterinara."),
    noKc: X("This recipe doesn't give calories per portion, so we can't work out how much your dog can have.", "Ovaj recept ne navodi kalorije po porciji, pa ne možemo izračunati koliko smije tvoj pas."),
    budget: X("All treats and toppers together: up to", "Sve poslastice i dodaci zajedno: do"),
    ofRecipe: X("of the recipe", "recepta"),
    wholeR: X("The whole recipe", "Cijeli recept"),
    notMeal: X("Not a complete diet: give it on top of your dog's usual food.", "Nije cijela prehrana: daje se uz uobičajenu hranu."),
    contains: X("Contains", "Sadrži"),
    alc: { chicken: X("chicken", "piletinu"), turkey: X("turkey", "puretinu"), beef: X("beef", "govedinu"), fish: X("fish", "ribu"), eggs: X("eggs", "jaja"), peanuts: X("peanuts", "kikiriki"), grains: X("grains", "žitarice"), dairy: X("dairy", "mliječne proizvode") } as Record<string, LS>,
    yieldL: X("Makes", "Količina"),
    srcL: X("Amounts converted to grams and millilitres.", "Količine su preračunate u grame i mililitre."),
    prev: X("Previous recipe", "Prethodni recept"),
    next: X("Next recipe", "Sljedeći recept"),
    noteTopper: X("on top, not instead!", "uz hranu, ne umjesto nje!"),
    noteMeal: X("worth the wait.", "vrijedilo je čekati."),
    noteTreat: X("one a day. ok, two.", "jedan dnevno. dobro, dva."),
    noteBland: X("get well soon, buddy", "brzo ozdravi, prijatelju"),
    // ingredients and filters (recipes page)
    haveH: X("What do you have at home?", "Što imaš doma?"),
    noH: X("What can't your dog have?", "Što pas ne smije?"),
    ipHint: X("Tap the ingredients. Green means you have it, orange means your dog can't have it.", "Dodirni sastojke. Zeleno znači da ga imaš, narančasto da ga pas ne smije."),
    ipModeL: X("What a tap marks", "Što dodir označava"),
    mHave: X("I have it", "Imam doma"),
    mNo: X("Dog can't have", "Pas ne smije"),
    youHave: X("You have:", "Imaš:"),
    dogNo: X("Dog can't have:", "Pas ne smije:"),
    clearIng: X("Clear", "Očisti"),
    hvTag: X("you have:", "imaš:"),
    stHave: X("you have it", "imaš ga"),
    stNo: X("your dog can't have it", "pas ga ne smije"),
    prepL: X("Method:", "Priprema:"),
    quickL: X("Quick:", "Brzo:"),
    prep: { nobake: X("No oven", "Bez pećnice"), oven: X("Oven", "Pećnica"), frozen: X("Freezer", "Zamrzivač") } as Record<string, LS>,
    prepPh: { nobake: X("no oven", "bez pećnice"), oven: X("for the oven", "za pećnicu"), frozen: X("for the freezer", "za zamrzivač") } as Record<string, LS>,
    q30: X("30 min or less", "Do 30 min"),
    few: X("5 ingredients or fewer", "Do 5 sastojaka"),
    shopOk: X("All from a regular shop", "Sve iz obične trgovine"),
    q30Ph: X("30 min or less", "do 30 min"),
    fewPh: X("5 ingredients or fewer", "do 5 sastojaka"),
    shopPh: X("all from a regular shop", "sve iz obične trgovine"),
    fromHave: X("Make a meal from this", "Složi obrok od toga"),
    // meal builder
    build: X("Make a meal", "Složi obrok"),
    newB: X("new", "novo"),
    bLead: X("Pick what you have. We work out how many grams your dog needs, and if a recipe like it already exists, we show it.", "Odaberi što imaš. Izračunat ćemo koliko grama treba tvom psu, a ako takav recept već postoji, pokazat ćemo ga."),
    bS1: X("Meat, fish or eggs", "Meso, riba ili jaja"),
    bS2: X("Side", "Prilog"),
    bS3: X("Vegetables", "Povrće"),
    bOpt: X("optional", "po želji"),
    bOpt2: X("optional, one or two", "po želji, jedno ili dva"),
    bNoTile: X("Your dog can't have this. It's marked on the recipes page.", "Pas ovo ne smije. Tako je označeno kod recepata."),
    bModes: [X("Meal", "Obrok"), X("Bland meal", "Blagi obrok")],
    bModeL: X("Kind of meal", "Vrsta obroka"),
    bDaysL: X("Cook for", "Kuham za"),
    bDayOpts: [X("Today", "Danas"), X("3 days", "3 dana"), X("7 days", "7 dana"), X("Other", "Drugo")],
    bDaysN: X("Number of days", "Broj dana"),
    bRaw: X("Raw, weighed before cooking", "Sirovo, izvagano prije kuhanja"),
    bTotal: X("Total", "Ukupno"),
    bPickP: X("Pick meat, fish or eggs.", "Odaberi meso, ribu ili jaja."),
    bKcal: X("Calories per 100 g raw", "Kalorije na 100 g sirove namirnice"),
    bWhy: X("Cooking changes the weight, not the calories, so the amounts are raw.", "Kuhanjem se mijenja težina, a kalorije ostaju iste, zato su količine sirove."),
    bHow: X("How", "Kako"),
    bMix: [
        X("Mix everything and let it cool before serving.", "Sve izmiješaj i prije posluživanja ohladi."),
        X("Mix everything and split it into 3 portions. It keeps in the fridge for up to 3 days.", "Sve izmiješaj i podijeli na 3 porcije. U hladnjaku stoji do 3 dana."),
        X("Mix everything and split it into 7 portions. Keep 3 in the fridge and freeze the rest. Thaw each one in the fridge overnight.", "Sve izmiješaj i podijeli na 7 porcija. Tri stavi u hladnjak, a ostale zamrzni. Svaku odmrzni preko noći u hladnjaku."),
    ],
    bWarn: X("This isn't a complete diet. A dog that eats only home-cooked food needs a recipe with vitamins and minerals, put together by a veterinary nutritionist.", "Ovo nije cijela prehrana. Za psa koji jede samo domaću hranu treba recept s vitaminima i mineralima, koji složi veterinar nutricionist."),
    bSimAll: X("See them all", "Pogledaj sve"),
    bBland: X("When your vet recommends a bland meal: only chicken and white rice, with no fat, seasoning or vegetables.", "Kad veterinar preporuči blagi obrok: samo piletina i bijela riža, bez masnoće, začina i povrća."),
    bBlandR: X("Open the recipe", "Otvori recept"),
    // shopping list
    addList: X("Add to shopping list", "Dodaj na popis za kupnju"),
    onList: X("On the shopping list", "Na popisu za kupnju"),
    updList: X("Update the shopping list", "Ažuriraj popis za kupnju"),
    list: X("Shopping list", "Popis za kupnju"),
    lLead: X("What to buy, and where. The list is saved only in this browser.", "Što kupiti i gdje. Popis se sprema samo u ovom pregledniku."),
    lFor: X("For", "Za"),
    lEmpty: X("The list is empty.", "Popis je prazan."),
    lEmptyP: X("Add a recipe or make a meal, and everything you need to buy shows up here.", "Dodaj recept ili složi obrok, pa se ovdje pojavi sve što treba kupiti."),
    lSecs: { m: X("Meat and fish", "Meso i riba"), v: X("Vegetables and fruit", "Povrće i voće"), d: X("Eggs and dairy", "Jaja i mliječno"), p: X("Pantry", "Ostalo"), s: X("Special items", "Posebne namirnice") } as Record<string, LS>,
    lWhere: { m: X("a butcher or the meat counter", "mesnica ili odjel mesa u trgovini"), v: X("a market or any shop", "tržnica ili svaka trgovina"), d: X("any shop", "svaka trgovina"), p: X("any shop", "svaka trgovina"), s: X("a health food shop or a pet shop", "dućan zdrave hrane ili trgovina za kućne ljubimce") } as Record<string, LS>,
    lWhereL: X("Where:", "Gdje:"),
    lShare: X("Send to phone", "Pošalji na mobitel"),
    lCopy: X("Copy the list", "Kopiraj popis"),
    lCopied: X("Copied", "Kopirano"),
    lClear: X("Clear the list", "Očisti popis"),
    lClear2: X("Tap again to clear", "Dodirni opet za brisanje"),
    lRemove: X("Remove", "Makni"),
    lChange: X("Change", "Promijeni"),
    lRecipe: X("Recipe", "Recept"),
    lReadyH: X("No time to cook?", "Nemaš vremena kuhati?"),
    lReadyP: X("We cook ready meals, portioned for your dog, and deliver them in a cool box.", "Gotove obroke kuhamo mi, u porcijama za tvog psa, i dostavimo u termo kutiji."),
    lWhereH: X("Where to buy", "Gdje kupiti"),
    lWhereList: [
        [X("Regular shop:", "Obična trgovina:"), X("meat, rice, oats, eggs, vegetables, yogurt.", "meso, riža, zob, jaja, povrće, jogurt.")],
        [X("Market:", "Tržnica:"), X("fresh vegetables and fruit.", "svježe povrće i voće.")],
        [X("Health food shop:", "Dućan zdrave hrane:"), X("rarer things, such as carob or coconut flour.", "rjeđe stvari, npr. rogač ili kokosovo brašno.")],
    ] as [LS, LS][],
    lWhereFine: X("We don't say which shop has what on its shelves, because we don't know.", "Ne pišemo koja trgovina ima što na policama, jer to ne znamo."),
    // order
    oH: X("Make a plan for your dog.", "Napravi paket za svog psa."),
    oSub: X("Four steps. At the end you see how much food you get and what it costs.", "Četiri koraka. Na kraju vidiš koliko hrane dobiješ i koliko to košta."),
    steps: [X("Who's eating?", "Tko jede?"), X("The plan", "Plan"), X("How often?", "Koliko često?"), X("Delivery", "Dostava")],
    dogName: X("Dog's name", "Ime psa"),
    namePh: X("e.g. Max", "npr. Max"),
    age: X("Age", "Dob"),
    ages: [X("Puppy <4 mo", "Štene <4 mj."), X("Puppy 4+ mo", "Štene 4+ mj."), X("Adult", "Odrasli")],
    puppy: X("Puppies need food made for growth. The amount changes as they grow, so weigh your puppy often and ask your vet.", "Štencima treba hrana za rast. Količina se mijenja kako raste, pa ga često važi i pitaj veterinara."),
    neutS: [X("neutered", "kastriran"), X("not neutered", "nekastriran")],
    cant: X("Can't eat", "Ne smije jesti"),
    noPre: X("no", "bez"),
    noGen: { chicken: X("chicken", "piletine"), turkey: X("turkey", "puretine"), beef: X("beef", "govedine"), fish: X("fish", "ribe"), grains: X("grains", "žitarica") } as Record<string, LS>,
    ocal: [["chicken", X("Chicken", "Piletina")], ["turkey", X("Turkey", "Puretina")], ["beef", X("Beef", "Govedina")], ["fish", X("Fish", "Riba")], ["grains", X("Grains", "Žitarice")]] as [string, LS][],
    noChicken: X("None of our meals contain chicken, so nothing changes.", "Nijedan naš obrok nema piletinu, pa se ništa ne mijenja."),
    cont: X("Continue", "Dalje"),
    edit: X("Edit", "Uredi"),
    heavier: X("I'm heavier. who's counting", "ja sam teži. tko broji"),
    inBox: X("In the box", "U paketu"),
    notChosen: X("Tap to add", "Dodirni za dodati"),
    notFor: X("Not for this dog", "Nije za ovog psa"),
    pickOne: X("Choose at least one recipe.", "Odaberi barem jedan recept."),
    noneFit: X("None of our meals fit these choices yet. Change what your dog can't eat?", "Nijedan naš obrok zasad ne odgovara. Promijeni što pas ne smije jesti?"),
    noted: X("noted!", "zapisano!"),
    plans: [
        [X("Trial box", "Probni paket"), X("7 days, once. No subscription.", "7 dana, jednom. Bez pretplate.")],
        [X("Every 2 weeks", "Svaka 2 tjedna"), X("14 days of food, arrives by itself.", "14 dana hrane, stiže sama.")],
        [X("Every month", "Svaki mjesec"), X("30 days of food, arrives by itself.", "30 dana hrane, stiže sama.")],
    ] as [LS, LS][],
    best: X("Best value", "Najpovoljnije"),
    noTie: X("No commitment: skip a delivery or stop whenever you like.", "Bez obveze: preskoči isporuku ili prekini kad hoćeš."),
    street: X("Street and number", "Ulica i broj"),
    streetPh: X("e.g. Županijska 9", "npr. Županijska 9"),
    city: X("City", "Grad"),
    zip: X("Postcode", "Poštanski broj"),
    when: X("Delivery day", "Dan dostave"),
    frozen: X("Arrives frozen, in a cool box.", "Stiže smrznuto, u termo kutiji."),
    boxFor: X("Box for", "Paket za psa"),
    boxAnon: X("Your dog's box", "Paket za tvog psa"),
    rRecipes: X("Recipes", "Recepti"),
    rDaily: X("Daily", "Dnevno"),
    rBox: X("Box", "Paket"),
    rFood: X("Food in total", "Hrane ukupno"),
    rPouches: X("Pouches", "Vrećice"),
    rDelivery: X("Delivery", "Dostava"),
    total: X("Total", "Ukupno"),
    examples: X("example prices", "primjer cijena"),
    aDay: X("a day", "dnevno"),
    protoNo: X("Prototype: nothing is actually ordered.", "Prototip: ništa se stvarno ne naručuje."),
    need: X("To order, add", "Za narudžbu dodaj"),
    needRec: X("a recipe", "recept"),
    needAddr: X("an address", "adresu"),
    needZip: X("a 5-digit postcode", "poštanski broj od 5 znamenki"),
    needDay: X("a delivery day", "dan dostave"),
    thanks: X("Thank you!", "Hvala!"),
    again: X("Start again", "Kreni ispočetka"),
    seeBox: X("See the box", "Pogledaj paket"),
    days: X("days", "dana"),
    meals2: X("Two meals of", "Dva obroka po"),
    word: X("fresh", "svježe"),
    // the 10% share on recipe pages (AAHA 2021: everything outside the main diet stays at or under 10% of daily calories)
    shRec: X("this recipe", "ovaj recept"),
    shTreat: X("treats", "poslastice"),
    shFood: X("usual food", "uobičajena hrana"),
    shWhyR: X("This recipe isn't a complete diet, so it gives at most 10% of that. The other 90% comes from your dog's usual, complete food.", "Recept nije cjelovita prehrana, pa daje najviše 10 % toga. Ostalih 90 % daje uobičajena, cjelovita hrana."),
    shWhyT: X("All treats together give at most 10% of that. The other 90% comes from your dog's usual, complete food.", "Sve poslastice zajedno daju najviše 10 % toga. Ostalih 90 % daje uobičajena, cjelovita hrana."),
    shSrc: X("AAHA guidelines", "smjernice AAHA"),
    // very light food: calories don't limit the amount, so no number is shown
    lowK: X("Calories aren't the limit here", "Kalorije ovdje nisu granica"),
    lowPc: X("For a dog this size, these have so few calories that they don't limit the amount. New food can upset the stomach, though, so start with a few pieces and give more only if your dog handles them well.", "Za psa ove veličine ovo ima tako malo kalorija da one ne ograničavaju količinu. Nova hrana ipak može poremetiti probavu, pa počni s nekoliko komada i daj više tek ako ih pas dobro podnosi."),
    lowMl: X("It has so few calories that they don't limit the amount. New food can upset the stomach, though, so start with a few spoonfuls and give more only if your dog handles it well.", "Ima tako malo kalorija da one ne ograničavaju količinu. Nova hrana ipak može poremetiti probavu, pa počni s nekoliko žlica i daj više tek ako ga pas dobro podnosi."),
    brothP: X("Broth has no official amount. A common rule of thumb from vets is up to 30 ml per 4.5 kg of body weight a day, starting with less.", "Za temeljac nema službene mjere. Često pravilo veterinara je do 30 ml na 4,5 kg težine dnevno, a za početak manje."),
    brothSrc: X("source", "izvor"),
    wholeB: X("the whole batch", "cijelog recepta"),
    countOnce: X("You don't have to count them every day: count once and remember how many fit in a small bowl.", "Ne moraš ih brojati svaki dan: odbroji ih jednom i zapamti koliko ih stane u posudicu."),
    // while ordering is closed (SHOP = false)
    meals: X("Fresh meals", "Svježi obroci"),
    soonB: X("soon", "uskoro"),
    subNow: X("Because quality starts in the bowl.", "Jer kvaliteta počinje iz zdjele."),
    ctaCalc: X("How much to feed?", "Koliko hrane?"),
    planCta: X("Plan for the week", "Plan za tjedan"),
    planH: X("Plan for the week", "Plan za tjedan"),
    planLead: X("Pick one dish, get the shopping list and cook once for the whole week.", "Odaberi jedno jelo, dobij popis za kupnju i skuhaj jednom za cijeli tjedan."),
    planS1: X("Your dog", "Tvoj pas"),
    planS2: X("Pick a dish", "Odaberi jelo"),
    planS3: X("Shopping list", "Popis za kupnju"),
    planS4: X("Cooking", "Kuhanje"),
    planPup: X("The plan for the week is for adult dogs.", "Plan za tjedan je za odrasle pse."),
    planFeedQ: X("The plan is for a dog that eats only home-cooked food, or half and half. Choose one:", "Plan je za psa koji jede samo domaću hranu ili pola-pola. Odaberi:"),
    planPick: X("Pick a dish and the shopping list and cooking show up below.", "Odaberi jelo, pa se ispod pojave popis za kupnju i kuhanje."),
    planMult: X(" The amounts below are already multiplied.", " Količine ispod su već pomnožene."),
    planOpenL: X("Open the shopping list", "Otvori popis za kupnju"),
    planWhen: X("Cook on one day of the week, for example on Sunday.", "Kuhaj jedan dan u tjednu, na primjer u nedjelju."),
    planOpen: X("Open the recipe with the steps", "Otvori recept s koracima"),
    planVet: X("These dishes haven't been checked as a complete diet: if your dog eats them every day, ask your vet about vitamins and minerals.", "Ova jela nisu provjerena kao cjelovita prehrana: ako ih pas jede svaki dan, pitaj veterinara za vitamine i minerale."),
    weekSubNow: X("Cook them at home. Each recipe says how much your dog can have.", "Skuhaj ih kod kuće. Uz svaki recept piše koliko smije tvoj pas."),
    twoHNow: X("Cook it at home. Soon, we can cook it for you.", "Skuhaj kod kuće. Uskoro možemo kuhati i mi."),
    twoSubNow: X("At home, these dishes are toppers. The ones from our kitchen will be complete meals.", "Kod kuće su ova jela dodatak hrani. Ona iz naše kuhinje bit će cijeli obroci."),
    readyNowT: X("Ready meals", "Gotovi obroci"),
    readyNowD: X("Complete meals, portioned for your dog. We're still getting the kitchen ready, so you can't order yet.", "Cijeli obroci, odmjereni za tvog psa. Kuhinju još pripremamo, pa se zasad ne može naručiti."),
    soonPill: X("Coming soon", "Uskoro"),
    howNowH: X("How it works", "Kako radi"),
    howsNow: [
        [X("Weigh your dog", "Izvaži psa"), X("The scale gives calories and grams a day, from the AAHA guidelines.", "Vaga daje kalorije i grame dnevno, prema smjernicama AAHA.")],
        [X("Find a recipe", "Pronađi recept"), X("Tap what you have at home and what your dog can't eat. The list keeps only the recipes that fit.", "Dodirni što imaš doma i što pas ne smije. Na popisu ostaju samo recepti koji odgovaraju.")],
        [X("Cook and shop", "Kuhaj i kupi"), X("Each recipe says how much your dog can have, and the shopping list says what to buy and where.", "Uz svaki recept piše koliko smije tvoj pas, a popis za kupnju kaže što kupiti i gdje.")],
    ] as [LS, LS][],
    storyP3Live: X("Freshy's started on Instagram in November 2025. Then we went quiet for a while: we searched, read and tried things out. The first step is this cookbook: recipes with the amounts written down, so you can cook for your dog at home. A Freshy's kitchen in Osijek? One day.", "Freshy's je krenuo na Instagramu u studenom 2025. Onda nas neko vrijeme nije bilo: tražili smo, čitali i isprobavali. Prvi korak je ova kuharica: recepti sa zapisanim količinama, da možeš kuhati za svog psa kod kuće. Freshy's kuhinja u Osijeku? Jednog dana."),
    liveFoot: X("Freshy's · Osijek", "Freshy's · Osijek"),
    storyP3Now: X("Freshy's started on Instagram in November 2025. This website is the next step: recipes with the amounts written down. Fresh meals to order in Osijek will come later, once the kitchen is ready.", "Freshy's je krenuo na Instagramu u studenom 2025. Ova stranica je sljedeći korak: recepti sa zapisanim količinama. Svježi obroci za narudžbu u Osijeku stižu kasnije, kad kuhinja bude spremna."),
    protoFootNow: X("A concept website by Tonči Hrgović. Nothing is sold here yet.", "Koncept web stranice: Tonči Hrgović. Ovdje se zasad ništa ne prodaje."),
    soonEb: X("Fresh meals", "Svježi obroci"),
    soonH: X("Coming soon.", "Uskoro."),
    soonP: X("We want to cook complete meals for dogs in Osijek, portioned for each dog. A kitchen for dog food needs its own space and official approval, so ordering isn't open yet.", "Želimo kuhati cijele obroke za pse u Osijeku, odmjerene za svakog psa. Kuhinja za pseću hranu treba vlastiti prostor i službena odobrenja, pa narudžbe još nisu otvorene."),
    soonP2: X("Until then, cook at home: every recipe is in grams, and the scale tells you how much your dog needs.", "Dotad kuhaj kod kuće: svaki recept je u gramima, a vaga ti kaže koliko treba tvom psu."),
}

T.faqNow = T.faq.map(([q, a], i): [LS, LS] =>
    i === 4
        ? [q, X("On the recipes page, choose “Dog can't have” and tap what your dog can't eat.", "Na stranici s receptima odaberi „Pas ne smije” i dodirni što pas ne smije jesti.")]
        : i === 6
          ? [X("Can I order the food ready?", "Mogu li naručiti gotovu hranu?"), X("Not yet. Ready meals are coming soon. Until then, every recipe says how much your dog can have.", "Još ne. Gotovi obroci stižu uskoro. Dotad uz svaki recept piše koliko smije tvoj pas.")]
          : [q, a]
)

/* ----------------------------------------------------------------- helpers */

/* age: 0 puppy under 4 months, 1 puppy 4 months to adult, 2 adult. act: 0 not much / gains weight easily, 1 normal, 2 light work or sport */
type Dog = { name: string; kg: number; age: number; neut: boolean; act: number; no: string[]; lose?: boolean }
type Ord = { step: number; sel: Record<string, boolean>; plan: number; street: string; city: string; zip: string; day: number; done: boolean }
type Page = { p: "home" | "recipes" | "recipe" | "order" | "build" | "list" | "dog" | "plus" | "acct" | "privacy" | "plan"; id?: string }

/* Dog profile ("Moj pas"). Kept only in this browser. Breeds: FCI nomenclature, Croatian names from HKS,
   weights only where the FCI breed standard gives them. Body shape: WSAVA body condition score in four groups. */
type Breed = { n: number; hr: string; en: string; o?: string; a?: string; w?: (number | null)[] }
type Prof = {
    name: string
    sex: number
    neut: boolean
    by: number
    bm: number
    ageG: number
    grow: boolean
    bk: number
    b1: number
    b2: number
    size: number
    kg: number
    body: number
    ideal: number
    act: number
    health: number
    food: number
    /* how much of the day's food is home-cooked: 0 all, 1 half, 2 ten per cent on top of the usual food */
    mix: number
    kc100: string
    gday: string
    treats: number
    no: string[]
}
const PROF_KEY = "fz-dog"
const BREEDS_URL = "https://framerusercontent.com/assets/HlNXPTFb318QyAefhuuHkseZw.json"
const FCI_URL = "https://www.fci.be/en/nomenclature/"
const HKS_URL = "https://www.hks.hr/hr/standardi"
const WSAVA_URL = "https://wsava.org/wp-content/uploads/2020/01/Body-Condition-Score-Dog.pdf"
const P0: Prof = { name: "", sex: 0, neut: true, by: 0, bm: 0, ageG: 2, grow: false, bk: 0, b1: 0, b2: 0, size: -1, kg: 20, body: 1, ideal: 0, act: 1, health: 0, food: 0, mix: 0, kc100: "", gday: "", treats: 1, no: [] }
/* adult weight for a mixed dog of unknown breeds, by size the owner picks */
const SIZE_W: [number, number][] = [
    [1, 10],
    [10, 25],
    [25, 45],
    [45, 90],
]
/* overweight: each step above ideal on the 9-point body condition scale is about 10 % over ideal weight (AAHA);
   "chubby" is about 6-7 of 9, "fat" about 8-9 of 9 */
const OVER = [1, 1, 1.15, 1.35]
let breedCache: Breed[] | null = null
let breedLoad: Promise<Breed[]> | null = null
const loadBreeds = () =>
    breedLoad ||
    (breedLoad = fetch(BREEDS_URL)
        .then((r) => {
            if (!r.ok) throw new Error("HTTP " + r.status)
            return r.json()
        })
        .then((d: Breed[]) => (breedCache = d))
        .catch((e) => {
            breedLoad = null
            throw e
        }))
const readProf = (): Prof | null => {
    try {
        const v = JSON.parse(window.localStorage.getItem(PROF_KEY) || "null")
        if (!v || typeof v !== "object" || typeof v.kg !== "number") return null
        return { ...P0, ...v, no: Array.isArray(v.no) ? v.no.filter((x: unknown) => typeof x === "string") : [] }
    } catch (e) {
        return null
    }
}
const monthsOf = (p: Prof, now: Date) => (p.by ? (now.getFullYear() - p.by) * 12 + (now.getMonth() + 1 - (p.bm || 6)) : null)
const ageGrpOf = (p: Prof, now: Date) => {
    const m = monthsOf(p, now)
    if (m === null) return p.ageG
    return m < 4 ? 0 : m < 12 ? 1 : p.grow && m < 24 ? 1 : 2
}
const r05 = (v: number) => Math.round(v * 2) / 2
const targetOf = (p: Prof & { goal?: number; sp?: number }) =>
    p.ideal > 0 && p.ideal < p.kg ? p.ideal : p.goal && p.goal > 0 && p.goal < p.kg ? p.goal : p.sp === 1 ? Math.round((p.kg / OVER[p.body]) * 10) / 10 : r05(p.kg / OVER[p.body])
const losing = (p: Prof, now: Date) => ageGrpOf(p, now) === 2 && p.body >= 2 && p.health === 0
const dogOf = (p: Prof, now: Date): Dog => {
    const lose = losing(p, now)
    return { name: p.name, kg: lose ? targetOf(p) : p.kg, age: ageGrpOf(p, now), neut: p.neut, act: p.act, no: p.no, lose }
}
/* [low, high] for one sex from a breed; null bound = open ("at least" / "up to") */
const bW = (b: Breed | undefined, sex: number): [number | null, number | null] | null => {
    if (!b || !b.w) return null
    const lo = b.w[sex * 2],
        hi = b.w[sex * 2 + 1]
    return lo === null && hi === null ? null : [lo, hi]
}
/* My pets: dashboard data, kept only in this browser (localStorage; photos in IndexedDB).
   Species: 0 dog, 1 cat, 2 other. Weight loss pace: 2014 AAHA Weight Management Guidelines
   (dogs 1–2 %, cats 0.5–2 % of body weight a week). */
type Pet = Prof & { id: string; sp: number; kind: string; goal: number; gb: number; made: string; vm: string; vn: string; va: string; vt: string; mc: boolean; pic: string; tr: string[]; fav: string; since: string; bday: number; q: string; vq: string }
type Ent = { id: string; pet: string; t: string; d: string; at: number; kg?: number; wh?: number; body?: number; ti?: string; tx?: string; st?: number; nx?: string; ph?: string[] }
type Ck = { pet: string; d: string; a: number; e: number; p: number; at: number }
/* Plus, second build. Meals and walks are what the owner writes down: nothing is tracked and no calories are estimated for walks.
   Medicines are written exactly as the vet prescribed them (Freshy's never suggests a dose); a Dose is one time a dose was given.
   k (meal): 0 current food, 1 a Freshy's recipe, 2 other food, 3 treat; kc: kcal, 0 = not known.
   A meal comes from src: "cur" (the profile's food), "fd:<id>" (a saved food), "r:<id>" (a Freshy's recipe) or "c:mdr-<n>" (the full list);
   u is the unit of q: g, pc (pieces), ml or por (portions); g is the weight when u is g. kcal are worked out from the source, never guessed. */
type Meal = { id: string; pet: string; d: string; tm: string; at: number; k: number; ti: string; g: number; kc: number; u: string; q: number; src: string }
/* a food the owner gives often. t: 0 dry, 1 wet, 2 fresh, 3 treat, 4 a portion from the meal builder; kc: kcal per 100 g (u "g") or per portion (u "por"), 0 = not known */
type Food = { id: string; n: string; t: number; kc: number; u: string; at: number }
type Walk = { id: string; pet: string; d: string; at: number; km: number; min: number }
type Med = { id: string; pet: string; ti: string; rx: string; d0: string; d1: string; tms: string[]; at: number; vi: string }
/* what the vet wrote at a visit, on the owner's phone. Freshy's only keeps and shows it; it never advises.
   goal: target kg; fq + fu: food a day ("g" or "kcal") of fn; diet until dto; nx + nxr: next check-up; ent: the journal entry of the visit;
   q: the owner's questions for that visit, kept with it (the question box is emptied for the next one) */
type VetIns = { id: string; pet: string; d: string; by: string; goal: number; fq: number; fu: string; fn: string; diet: string; dto: string; watch: string; note: string; nx: string; nxr: string; ent: string; at: number; q: string }
/* an appointment the owner wrote in (the date the clinic gave them); why is optional */
type Visit = { id: string; pet: string; d: string; why: string; at: number }
type Dose = { med: string; d: string; tm: string; at: number }
type Day = { id: string; pet: string; ti: string; d: string; y: number; at: number }
/* dashboard sections (Plus has all of them; free shows dash and log) */
type PV = "dash" | "log" | "vet" | "meal" | "walk" | "med" | "day"
type MdForm = { id: string; isNew: boolean; ti: string; rx: string; d0: string; d1: string; tms: string[] }
type VForm = { d: string; by: string; kg: string; goal: string; fq: string; fu: number; fn: string; diet: string; dto: string; md: { ti: string; rx: string; d0: string; d1: string; tms: string[] }[]; nx: string; nxr: string; watch: string; note: string }
/* pt: the day a free 30-day Plus trial started ("" = never); pg: 1 when the trial was a thank-you to someone who used the dashboard before Plus existed */
type PStore = { v: 1; pets: Pet[]; cur: string; log: Ent[]; ck: Ck[]; rem: number; pt: string; pg: number; ml?: Meal[]; wk?: Walk[]; md?: Med[]; dz?: Dose[]; dy?: Day[]; fd?: Food[]; vi?: VetIns[]; vz?: Visit[] }
type EForm = { id: string; isNew: boolean; t: string; d: string; kg: string; wh: number; body: number; ti: string; tx: string; st: number; nx: string; ph: string[]; ph0: string[] }
type Pt = { d: string; kg: number; at: number; v?: boolean }
const PETS_KEY = "fz-pets"
const ENT_T = ["start", "w", "b", "inj", "ill", "vet", "vac", "par", "med", "note"]
const HEALTH_T = ["inj", "ill", "vet", "vac", "par", "med", "note"]
const PACE: [number, number][] = [
    [1, 2],
    [0.5, 2],
]
const AAHA_WM_URL = "https://doi.org/10.5326/JAAHA-MS-6331"
const AAHA_SWITCH_URL = "https://www.aaha.org/wp-content/uploads/globalassets/05-pet-health-resources/nutritionalresources/petparent/aaha-tips-and-timelines.pdf"
const DAY = 86400000
const pad2 = (n: number) => (n < 10 ? "0" : "") + n
const ymd = (d: Date) => d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate())
const dOf = (s: string) => {
    const [y, m, d] = s.split("-").map(Number)
    return new Date(y, m - 1, d, 12)
}
const isYmd = (s: unknown): s is string => typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(dOf(s).getTime())
const daysTo = (s: string, now: Date) => Math.round((dOf(s).getTime() - dOf(ymd(now)).getTime()) / DAY)
const addDays = (s: string, n: number) => {
    const d = dOf(s)
    d.setDate(d.getDate() + n)
    return ymd(d)
}
const addMonths = (s: string, n: number) => {
    const d = dOf(s),
        day = d.getDate()
    d.setDate(1)
    d.setMonth(d.getMonth() + n)
    d.setDate(Math.min(day, new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()))
    return ymd(d)
}
const REM_OPTS = [1, 3, 7]
/* Monday of the week of s, and "HH:MM" now */
const weekStart = (s: string) => {
    const d = dOf(s)
    return addDays(s, -((d.getDay() + 6) % 7))
}
const hmNow = (d: Date) => pad2(d.getHours()) + ":" + pad2(d.getMinutes())
/* a medicine is current on day s when it has started and not ended */
const medOn = (m: Med, s: string) => m.d0 <= s && (!m.d1 || m.d1 >= s)
/* next yearly date on or after s for a date ymd (29 Feb falls on 28 Feb in other years) */
const nextYearly = (d: string, s: string) => {
    const [, m, dd] = d.split("-").map(Number)
    const y0 = Number(s.slice(0, 4))
    for (const y of [y0, y0 + 1]) {
        const last = new Date(y, m, 0).getDate()
        const c = y + "-" + pad2(m) + "-" + pad2(Math.min(dd, last))
        if (c >= s) return c
    }
    return d
}
/* Freshy's Plus: price shown on the Plus page; nothing is charged on this site */
const PLUS_DAYS = 30
const TRAITS = ["cuddly", "playful", "calm", "curious", "brave", "shy", "greedy", "sleepy", "talkative", "independent"]
/* days of the trial left (0 = no Plus now) */
const plusLeft = (s: PStore | null, now: Date) => (s && s.pt ? Math.max(0, PLUS_DAYS - Math.round((dOf(ymd(now)).getTime() - dOf(s.pt).getTime()) / DAY)) : 0)
/* how long the pet has been with you, from "YYYY-MM" */
const sinceOf = (since: string, now: Date) => {
    if (!since) return null
    const [y, m] = since.split("-").map(Number)
    const n = (now.getFullYear() - y) * 12 + (now.getMonth() + 1 - m)
    return n >= 0 ? { y: Math.floor(n / 12), m: n % 12 } : null
}
/* next birthday: needs the birth month (by, bm) and, for a countdown, the day */
const bdayOf = (p: { by: number; bm: number; bday: number }, now: Date) => {
    if (!p.bm || !p.bday) return null
    const t = dOf(ymd(now))
    let d = new Date(t.getFullYear(), p.bm - 1, Math.min(p.bday, new Date(t.getFullYear(), p.bm, 0).getDate()), 12)
    if (d.getTime() < t.getTime()) d = new Date(t.getFullYear() + 1, p.bm - 1, Math.min(p.bday, new Date(t.getFullYear() + 1, p.bm, 0).getDate()), 12)
    return { d: ymd(d), n: Math.round((d.getTime() - t.getTime()) / DAY), age: p.by ? d.getFullYear() - p.by : 0 }
}
const newId = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-5)
const numIn = (v: unknown, lo: number, hi: number, dflt: number) => (typeof v === "number" && isFinite(v) && v >= lo && v <= hi ? v : dflt)
const strIn = (v: unknown, max: number) => (typeof v === "string" ? v.slice(0, max) : "")
const byT = (a: { d: string; at: number }, b: { d: string; at: number }) => (a.d < b.d ? -1 : a.d > b.d ? 1 : a.at - b.at)
const petClean = (v: any): Pet | null => {
    if (!v || typeof v !== "object" || typeof v.id !== "string" || !v.id) return null
    const p = { ...P0, ...v } as Pet
    return {
        ...p,
        id: v.id.slice(0, 24),
        sp: numIn(v.sp, 0, 2, 0),
        kind: strIn(v.kind, 30),
        mix: numIn(v.mix, 0, 2, 0),
        goal: numIn(v.goal, 0, 300, 0),
        gb: numIn(v.gb, 0, 3, 0),
        made: isYmd(v.made) ? v.made : ymd(new Date()),
        vm: strIn(v.vm, 120),
        vn: strIn(v.vn, 120),
        va: strIn(v.va, 160),
        vt: strIn(v.vt, 40),
        mc: v.mc === true,
        pic: typeof v.pic === "string" ? v.pic.slice(0, 24) : "",
        tr: Array.isArray(v.tr) ? v.tr.filter((x: unknown) => typeof x === "string" && TRAITS.includes(x as string)).slice(0, 6) : [],
        fav: strIn(v.fav, 60),
        vq: strIn(v.vq, 600),
        since: typeof v.since === "string" && /^\d{4}-\d{2}$/.test(v.since) ? v.since : "",
        bday: numIn(v.bday, 0, 31, 0),
        q: strIn(v.q, 90),
        name: strIn(p.name, 18),
        sex: numIn(p.sex, 0, 1, 0),
        kg: numIn(p.kg, 0.005, 300, 20),
        body: numIn(p.body, 0, 3, 1),
        ideal: numIn(p.ideal, 0, 300, 0),
        health: numIn(p.health, 0, 2, 0),
        no: Array.isArray(v.no) ? v.no.filter((x: unknown) => typeof x === "string") : [],
    }
}
const entClean = (v: any): Ent | null => {
    if (!v || typeof v !== "object" || typeof v.id !== "string" || typeof v.pet !== "string" || !ENT_T.includes(v.t) || !isYmd(v.d)) return null
    const e: Ent = { id: v.id.slice(0, 24), pet: v.pet.slice(0, 24), t: v.t, d: v.d, at: numIn(v.at, 0, 1e14, 0) }
    if (typeof v.kg === "number" && v.kg > 0 && v.kg <= 300) e.kg = v.kg
    if (v.wh === 1) e.wh = 1
    if (typeof v.body === "number" && v.body >= 0 && v.body <= 3) e.body = v.body
    if (v.ti) e.ti = strIn(v.ti, 80)
    if (v.tx) e.tx = strIn(v.tx, 1200)
    if (typeof v.st === "number" && v.st >= 0 && v.st <= 2) e.st = v.st
    if (isYmd(v.nx)) e.nx = v.nx
    if (Array.isArray(v.ph)) e.ph = v.ph.filter((x: unknown) => typeof x === "string").slice(0, 6)
    return e
}
const isTm = (s: unknown): s is string => typeof s === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(s)
const idOk = (v: any) => !!v && typeof v === "object" && typeof v.id === "string" && !!v.id && typeof v.pet === "string"
const M_UNITS = ["g", "pc", "ml", "por"]
const mealClean = (v: any): Meal | null =>
    idOk(v) && isYmd(v.d)
        ? {
              id: v.id.slice(0, 24),
              pet: v.pet.slice(0, 24),
              d: v.d,
              tm: isTm(v.tm) ? v.tm : "",
              at: numIn(v.at, 0, 1e14, 0),
              k: numIn(v.k, 0, 3, 2),
              ti: strIn(v.ti, 60),
              g: numIn(v.g, 0, 5000, 0),
              kc: numIn(v.kc, 0, 20000, 0),
              u: M_UNITS.includes(v.u) ? v.u : "g",
              q: numIn(v.q, 0, 5000, numIn(v.g, 0, 5000, 0)),
              src: strIn(v.src, 40),
          }
        : null
const foodClean = (v: any): Food | null =>
    v && typeof v === "object" && typeof v.id === "string" && v.id && typeof v.n === "string" && v.n.trim()
        ? { id: v.id.slice(0, 24), n: strIn(v.n, 60), t: numIn(v.t, 0, 4, 0), kc: numIn(v.kc, 0, 5000, 0), u: v.u === "por" ? "por" : "g", at: numIn(v.at, 0, 1e14, 0) }
        : null
const walkClean = (v: any): Walk | null => (idOk(v) && isYmd(v.d) ? { id: v.id.slice(0, 24), pet: v.pet.slice(0, 24), d: v.d, at: numIn(v.at, 0, 1e14, 0), km: numIn(v.km, 0, 100, 0), min: numIn(v.min, 0, 600, 0) } : null)
const medClean = (v: any): Med | null =>
    idOk(v) && isYmd(v.d0) && typeof v.ti === "string" && v.ti.trim()
        ? { id: v.id.slice(0, 24), pet: v.pet.slice(0, 24), ti: strIn(v.ti, 60), rx: strIn(v.rx, 300), d0: v.d0, d1: isYmd(v.d1) && v.d1 >= v.d0 ? v.d1 : "", tms: Array.isArray(v.tms) ? Array.from(new Set(v.tms.filter(isTm) as string[])).sort().slice(0, 4) : [], at: numIn(v.at, 0, 1e14, 0), vi: strIn(v.vi, 24) }
        : null
const vetInsClean = (v: any): VetIns | null =>
    idOk(v) && isYmd(v.d)
        ? {
              id: v.id.slice(0, 24),
              pet: v.pet.slice(0, 24),
              d: v.d,
              by: strIn(v.by, 120),
              goal: numIn(v.goal, 0, 300, 0),
              fq: numIn(v.fq, 0, 20000, 0),
              fu: v.fu === "kcal" ? "kcal" : "g",
              fn: strIn(v.fn, 80),
              diet: strIn(v.diet, 300),
              dto: isYmd(v.dto) ? v.dto : "",
              watch: strIn(v.watch, 600),
              note: strIn(v.note, 600),
              nx: isYmd(v.nx) ? v.nx : "",
              nxr: strIn(v.nxr, 80),
              ent: strIn(v.ent, 24),
              at: numIn(v.at, 0, 1e14, 0),
              q: strIn(v.q, 600),
          }
        : null
const visitClean = (v: any): Visit | null => (idOk(v) && isYmd(v.d) ? { id: v.id.slice(0, 24), pet: v.pet.slice(0, 24), d: v.d, why: strIn(v.why, 80), at: numIn(v.at, 0, 1e14, 0) } : null)
const doseClean = (v: any): Dose | null => (v && typeof v === "object" && typeof v.med === "string" && isYmd(v.d) && isTm(v.tm) ? { med: v.med.slice(0, 24), d: v.d, tm: v.tm, at: numIn(v.at, 0, 1e14, 0) } : null)
const dayClean = (v: any): Day | null => (idOk(v) && isYmd(v.d) && typeof v.ti === "string" && v.ti.trim() ? { id: v.id.slice(0, 24), pet: v.pet.slice(0, 24), ti: strIn(v.ti, 60), d: v.d, y: v.y === 0 ? 0 : 1, at: numIn(v.at, 0, 1e14, 0) } : null)
const ckClean = (v: any): Ck | null =>
    v && typeof v === "object" && typeof v.pet === "string" && isYmd(v.d) ? { pet: v.pet, d: v.d, a: numIn(v.a, -1, 2, -1), e: numIn(v.e, -1, 2, -1), p: numIn(v.p, -1, 2, -1), at: numIn(v.at, 0, 1e14, 0) } : null
const storeClean = (v: any): PStore | null => {
    if (!v || typeof v !== "object" || v.v !== 1 || !Array.isArray(v.pets)) return null
    const pets = v.pets.map(petClean).filter((p: Pet | null): p is Pet => !!p)
    const ids = new Set(pets.map((p: Pet) => p.id))
    const log = (Array.isArray(v.log) ? v.log.map(entClean) : []).filter((e: Ent | null): e is Ent => !!e && ids.has(e.pet))
    const ck = (Array.isArray(v.ck) ? v.ck.map(ckClean) : []).filter((c: Ck | null): c is Ck => !!c && ids.has(c.pet))
    const arr = <X extends { pet: string }>(a: unknown, f: (x: any) => X | null, max: number): X[] => (Array.isArray(a) ? a.map(f).filter((x): x is X => !!x && ids.has(x.pet)).slice(-max) : [])
    const md = arr(v.md, medClean, 200)
    const mids = new Set(md.map((m) => m.id))
    /* a store saved before Plus existed has no pt: its owner gets the 30-day trial as a thank-you, from today */
    const legacy = !("pt" in v)
    return {
        v: 1,
        pets,
        cur: ids.has(v.cur) ? v.cur : pets[0] ? pets[0].id : "",
        log,
        ck,
        rem: REM_OPTS.includes(v.rem) ? v.rem : 3,
        pt: legacy ? ymd(new Date()) : isYmd(v.pt) ? v.pt : "",
        pg: legacy ? 1 : v.pg === 1 ? 1 : 0,
        ml: arr(v.ml, mealClean, 3000),
        wk: arr(v.wk, walkClean, 2000),
        md,
        dz: (Array.isArray(v.dz) ? v.dz.map(doseClean) : []).filter((x: Dose | null): x is Dose => !!x && mids.has(x.med)).slice(-4000),
        dy: arr(v.dy, dayClean, 200),
        fd: (Array.isArray(v.fd) ? v.fd.map(foodClean) : []).filter((x: Food | null): x is Food => !!x).slice(-60),
        vi: arr(v.vi, vetInsClean, 100),
        vz: arr(v.vz, visitClean, 100),
    }
}
/* a target weight is set once, when the pet is first marked as overweight, so it does not slide down as the pet loses weight */
const withGoal = (p: Pet, now: Date): Pet => {
    if (p.sp === 2 || ageGrpOf(p, now) !== 2 || p.body < 2) return p.goal || p.gb ? { ...p, goal: 0, gb: 0 } : p
    if (p.goal > 0 && p.goal < p.kg && p.body <= p.gb) return p
    return { ...p, goal: p.sp === 1 ? Math.round((p.kg / OVER[p.body]) * 10) / 10 : r05(p.kg / OVER[p.body]), gb: p.body }
}
/* target weight to show: the vet's, the stored one, or none */
const goalOf = (p: Pet, now: Date) => {
    if (p.ideal > 0 && p.ideal < p.kg) return p.ideal
    if (p.sp === 2 || ageGrpOf(p, now) !== 2 || p.body < 2) return 0
    return targetOf(p)
}
const wPts = (log: Ent[], pet: string): Pt[] => {
    const m = new Map<string, Pt>()
    log.filter((e) => e.pet === pet && e.kg && (e.t === "w" || e.t === "start" || e.t === "vet"))
        .sort(byT)
        .forEach((e) => m.set(e.d, { d: e.d, kg: e.kg as number, at: e.at, v: e.t === "vet" || e.wh === 1 }))
    return Array.from(m.values())
}
const lastBody = (log: Ent[], pet: string) => log.filter((e) => e.pet === pet && typeof e.body === "number").sort(byT).pop()
/* kg lost a week over about the last five weeks; pct of the starting weight of that stretch */
const paceOf = (pts: Pt[]) => {
    if (pts.length < 2) return null
    const last = pts[pts.length - 1],
        lt = dOf(last.d).getTime()
    let first = pts.find((p) => lt - dOf(p.d).getTime() <= 35 * DAY)
    if (!first || lt - dOf(first.d).getTime() < 6.5 * DAY) {
        const older = pts.filter((p) => lt - dOf(p.d).getTime() >= 6.5 * DAY)
        if (!older.length) return null
        first = older[older.length - 1]
    }
    const wks = (lt - dOf(first.d).getTime()) / (7 * DAY)
    const wk = (first.kg - last.kg) / wks
    return { wk, pct: Math.round(((wk / first.kg) * 100) * 10) / 10, from: first.d }
}
const paceCls = (sp: number, pct: number) => (sp > 1 ? -1 : pct > PACE[sp][1] ? 2 : pct >= PACE[sp][0] ? 1 : 0)
const projOf = (last: Pt, wk: number, goal: number) => {
    if (!(wk > 0) || !(goal > 0) || last.kg <= goal) return null
    const weeks = (last.kg - goal) / wk
    return weeks > 78 ? null : addDays(last.d, Math.round(weeks * 7))
}
const MON_HR_G = ["siječnja", "veljače", "ožujka", "travnja", "svibnja", "lipnja", "srpnja", "kolovoza", "rujna", "listopada", "studenoga", "prosinca"]
const MON_EN = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
const MON_HR_S = ["sij", "velj", "ožu", "tra", "svi", "lip", "srp", "kol", "ruj", "lis", "stu", "pro"]
const MON_HR_N = ["Siječanj", "Veljača", "Ožujak", "Travanj", "Svibanj", "Lipanj", "Srpanj", "Kolovoz", "Rujan", "Listopad", "Studeni", "Prosinac"]
const DOW_HR = ["nedjelja", "ponedjeljak", "utorak", "srijeda", "četvrtak", "petak", "subota"]
const DOW_EN = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
const dTxt = (s: string, lang: Lang, now: Date, yr?: boolean) => {
    const d = dOf(s),
        y = d.getFullYear() !== now.getFullYear() || !!yr
    return lang === "en" ? d.getDate() + " " + MON_EN[d.getMonth()].slice(0, 3) + (y ? " " + d.getFullYear() : "") : d.getDate() + ". " + (d.getMonth() + 1) + "." + (y ? " " + d.getFullYear() + "." : "")
}
const whenTxt = (s: string, lang: Lang, now: Date) => {
    const d = dOf(s),
        part = d.getDate() <= 10 ? 0 : d.getDate() <= 20 ? 1 : 2,
        y = d.getFullYear() !== now.getFullYear()
    return lang === "en"
        ? ["early ", "mid-", "late "][part] + MON_EN[d.getMonth()] + (y ? " " + d.getFullYear() : "")
        : ["početkom ", "sredinom ", "krajem "][part] + MON_HR_G[d.getMonth()] + (y ? " " + d.getFullYear() + "." : "")
}
/* "18. i 19. 11." / "18 and 19 Nov" */
const dList = (ds: string[], lang: Lang, now: Date) => {
    if (!ds.length) return ""
    const and = lang === "en" ? " and " : " i "
    const join = (a: string[]) => (a.length < 2 ? a[0] : a.slice(0, -1).join(", ") + and + a[a.length - 1])
    const sameM = ds.every((s) => s.slice(0, 7) === ds[0].slice(0, 7))
    if (!sameM) return join(ds.map((s) => dTxt(s, lang, now)))
    const d0 = dOf(ds[0])
    return lang === "en" ? join(ds.map((s) => String(dOf(s).getDate()))) + " " + MON_EN[d0.getMonth()].slice(0, 3) : join(ds.map((s) => dOf(s).getDate() + ".")) + " " + (d0.getMonth() + 1) + "."
}
const icsEsc = (s: string) => s.replace(/\\/g, "\\\\").replace(/([,;])/g, "\\$1").replace(/\r?\n/g, "\\n")
/* reminder: n days before at 9:00 (time to book a visit) and on the day at 9:00; the monthly check repeats on the 1st */
const icsOf = (items: { id: string; d: string; t: string; q?: string }[], n: number, early: string, monthly: { id: string; t: string }[]) => {
    const now = new Date()
    const stamp = now.toISOString().replace(/[-:]/g, "").replace(/\.\d+Z$/, "Z")
    const out = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Freshys//My pets//EN", "CALSCALE:GREGORIAN", "METHOD:PUBLISH"]
    for (const it of items) {
        out.push(
            "BEGIN:VEVENT",
            "UID:" + it.id + "-" + it.d + "@freshys",
            "DTSTAMP:" + stamp,
            "DTSTART;VALUE=DATE:" + it.d.replace(/-/g, ""),
            "DTEND;VALUE=DATE:" + addDays(it.d, 1).replace(/-/g, ""),
            "SUMMARY:" + icsEsc(it.t),
            ...(daysTo(it.d, now) > n ? ["BEGIN:VALARM", "ACTION:DISPLAY", "DESCRIPTION:" + icsEsc(early + it.t), "TRIGGER:" + (n > 1 ? "-P" + (n - 1) + "DT15H" : "-PT15H"), "END:VALARM"] : []),
            ...(it.q && daysTo(it.d, now) > 2 ? ["BEGIN:VALARM", "ACTION:DISPLAY", "DESCRIPTION:" + icsEsc(it.q), "TRIGGER:-P1DT15H", "END:VALARM"] : []),
            "BEGIN:VALARM",
            "ACTION:DISPLAY",
            "DESCRIPTION:" + icsEsc(it.t),
            "TRIGGER:PT9H",
            "END:VALARM",
            "END:VEVENT"
        )
    }
    const m1 = ymd(new Date(now.getFullYear(), now.getMonth() + 1, 1, 12))
    for (const m of monthly) {
        out.push(
            "BEGIN:VEVENT",
            "UID:mc-" + m.id + "@freshys",
            "DTSTAMP:" + stamp,
            "DTSTART;VALUE=DATE:" + m1.replace(/-/g, ""),
            "DTEND;VALUE=DATE:" + addDays(m1, 1).replace(/-/g, ""),
            "RRULE:FREQ=MONTHLY;BYMONTHDAY=1",
            "SUMMARY:" + icsEsc(m.t),
            "BEGIN:VALARM",
            "ACTION:DISPLAY",
            "DESCRIPTION:" + icsEsc(m.t),
            "TRIGGER:PT9H",
            "END:VALARM",
            "END:VEVENT"
        )
    }
    out.push("END:VCALENDAR")
    return out.join("\r\n") + "\r\n"
}
/* medicines: one daily event for each time, from the first day to the last (no end = every day);
   days to remember: all-day events, every year or once. Times are local ("floating"), so they follow the phone's time zone. */
const icsTimed = (doses: { id: string; d0: string; d1: string; tm: string; t: string }[], days: { id: string; d: string; y: number; t: string }[]) => {
    const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+Z$/, "Z")
    const out = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Freshys//My pets//EN", "CALSCALE:GREGORIAN", "METHOD:PUBLISH"]
    for (const x of doses) {
        const [h, m] = x.tm.split(":").map(Number)
        const end = pad2(Math.floor((h * 60 + m + 15) / 60) % 24) + pad2((m + 15) % 60)
        out.push(
            "BEGIN:VEVENT",
            "UID:md-" + x.id + "-" + x.tm.replace(":", "") + "@freshys",
            "DTSTAMP:" + stamp,
            "DTSTART:" + x.d0.replace(/-/g, "") + "T" + x.tm.replace(":", "") + "00",
            "DTEND:" + x.d0.replace(/-/g, "") + "T" + (h * 60 + m + 15 >= 1440 ? "2359" : end) + "00",
            "RRULE:FREQ=DAILY" + (x.d1 ? ";UNTIL=" + x.d1.replace(/-/g, "") + "T235959" : ""),
            "SUMMARY:" + icsEsc(x.t),
            "BEGIN:VALARM",
            "ACTION:DISPLAY",
            "DESCRIPTION:" + icsEsc(x.t),
            "TRIGGER:PT0M",
            "END:VALARM",
            "END:VEVENT"
        )
    }
    for (const x of days) {
        out.push(
            "BEGIN:VEVENT",
            "UID:day-" + x.id + "@freshys",
            "DTSTAMP:" + stamp,
            "DTSTART;VALUE=DATE:" + x.d.replace(/-/g, ""),
            "DTEND;VALUE=DATE:" + addDays(x.d, 1).replace(/-/g, ""),
            ...(x.y ? ["RRULE:FREQ=YEARLY"] : []),
            "SUMMARY:" + icsEsc(x.t),
            "BEGIN:VALARM",
            "ACTION:DISPLAY",
            "DESCRIPTION:" + icsEsc(x.t),
            "TRIGGER:PT9H",
            "END:VALARM",
            "END:VEVENT"
        )
    }
    out.push("END:VCALENDAR")
    return out.join("\r\n") + "\r\n"
}
const saveFile = (name: string, data: BlobPart, type: string) => {
    const u = URL.createObjectURL(new Blob([data], { type }))
    const a = document.createElement("a")
    a.href = u
    a.download = name
    document.body.appendChild(a)
    a.click()
    a.remove()
    setTimeout(() => URL.revokeObjectURL(u), 5000)
}
const readStore = (now: Date): PStore | null => {
    try {
        const s = storeClean(JSON.parse(window.localStorage.getItem(PETS_KEY) || "null"))
        if (s && s.pets.length) return s
        const old = readProf()
        if (old) {
            const pet = withGoal({ ...old, id: newId(), sp: 0, kind: "", goal: 0, gb: 0, made: ymd(now), vm: "", vn: "", va: "", vt: "", mc: false, pic: "", tr: [], fav: "", since: "", bday: 0, q: "", vq: "" }, now)
            return { v: 1, pets: [pet], cur: pet.id, log: [{ id: newId(), pet: pet.id, t: "start", d: ymd(now), at: now.getTime(), kg: old.kg, body: old.body }], ck: [], rem: 3, pt: ymd(now), pg: 1 }
        }
    } catch (e) {}
    return null
}
const writeStore = (s: PStore) => {
    try {
        window.localStorage.setItem(PETS_KEY, JSON.stringify(s))
        window.localStorage.removeItem(PROF_KEY)
        return true
    } catch (e) {
        return false
    }
}
/* ---------- account: Firebase Authentication + Firestore over their REST APIs (no SDK) ----------
   Pets and photos stay on the device exactly as before (localStorage + IndexedDB); when someone is signed in,
   the same store is also kept in Firestore users/{uid} (s: the store as JSON, t: when it was saved) and each photo in
   users/{uid}/photos/{id} (d: the photo as a data URL). The web config below is public by design: access is limited by
   the Firestore rules (a signed-in user reads and writes only their own documents). No cookies: the session is in localStorage. */
const FB_KEY = "AIzaSyCHFx1D_rrV5EfaUB_5uHh03ozZ8UHxrCA"
const FB_PROJ = "freshys"
const FB_AUTH = "https://identitytoolkit.googleapis.com/v1/accounts:"
const FB_TOK = "https://securetoken.googleapis.com/v1/token?key=" + FB_KEY
const FB_DOC = "https://firestore.googleapis.com/v1/projects/" + FB_PROJ + "/databases/(default)/documents/users/"
const ACCT_KEY = "fz-acct"
const SYNC_KEY = "fz-sync"
const GUEST_KEY = "fz-guest"
const INV_KEY = "fz-inv"
const PW_MIN = 8
/* uid, e-mail, name, ID token, refresh token, when the ID token expires, e-mail confirmed */
type Acct = { uid: string; em: string; nm: string; tok: string; rt: string; exp: number; ver: boolean }
/* the account this device's copy belongs to, the save time of the account copy it was last in step with,
   changes not yet sent, and photos already in the account */
type SyncSt = { uid: string; base: number; dirty: boolean; ph: string[] }
class FbErr extends Error {
    code: string
    constructor(c: string) {
        super(c)
        this.code = c
    }
}
const fbCode = (j: any, st: number) => String((j && j.error && j.error.message) || "HTTP_" + st).split(" ")[0].split(":")[0]
const fbFetch = async (url: string, init: RequestInit): Promise<{ st: number; j: any }> => {
    let r: Response
    try {
        r = await fetch(url, init)
    } catch (e) {
        throw new FbErr("NET")
    }
    const j = await r.json().catch(() => ({}))
    return { st: r.status, j }
}
const fbPost = async (op: string, body: object, lang?: string) => {
    const h: Record<string, string> = { "Content-Type": "application/json" }
    if (lang) h["X-Firebase-Locale"] = lang
    const { st, j } = await fbFetch(FB_AUTH + op + "?key=" + FB_KEY, { method: "POST", headers: h, body: JSON.stringify(body) })
    if (st < 200 || st >= 300) throw new FbErr(fbCode(j, st))
    return j
}
const lsGet = <X,>(k: string): X | null => {
    try {
        return JSON.parse(window.localStorage.getItem(k) || "null")
    } catch (e) {
        return null
    }
}
const lsSet = (k: string, v: unknown) => {
    try {
        if (v === null) window.localStorage.removeItem(k)
        else window.localStorage.setItem(k, JSON.stringify(v))
    } catch (e) {}
}
const acctRead = (): Acct | null => {
    const a = lsGet<any>(ACCT_KEY)
    return a && typeof a.uid === "string" && a.uid && typeof a.rt === "string" && a.rt
        ? { uid: a.uid, em: strIn(a.em, 200), nm: strIn(a.nm, 60), tok: strIn(a.tok, 4000), rt: a.rt, exp: numIn(a.exp, 0, 1e15, 0), ver: a.ver === true }
        : null
}
const acctSave = (a: Acct | null) => lsSet(ACCT_KEY, a)
const acctOf = (j: any, ver: boolean, nm?: string): Acct => ({
    uid: String(j.localId || ""),
    em: String(j.email || ""),
    nm: nm !== undefined ? nm : String(j.displayName || ""),
    tok: String(j.idToken || ""),
    rt: String(j.refreshToken || ""),
    exp: Date.now() + (parseInt(String(j.expiresIn || "3600"), 10) - 120) * 1000,
    ver,
})
/* a fresh ID token (they last an hour); a refresh the server refuses means the account is gone or was signed out elsewhere */
const acctTok = async (a: Acct): Promise<Acct> => {
    if (a.tok && a.exp > Date.now()) return a
    const { st, j } = await fbFetch(FB_TOK, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: "grant_type=refresh_token&refresh_token=" + encodeURIComponent(a.rt) })
    if (st < 200 || st >= 300) throw new FbErr(fbCode(j, st))
    const n = { ...a, tok: String(j.id_token), rt: String(j.refresh_token), exp: Date.now() + (parseInt(String(j.expires_in || "3600"), 10) - 120) * 1000 }
    acctSave(n)
    return n
}
const fbLookup = async (a: Acct) => {
    const j = await fbPost("lookup", { idToken: a.tok })
    const u = j && j.users && j.users[0]
    if (!u) throw new FbErr("USER_NOT_FOUND")
    return { ver: u.emailVerified === true, nm: String(u.displayName || ""), em: String(u.email || a.em) }
}
const fbSignIn = async (em: string, pw: string) => {
    const j = await fbPost("signInWithPassword", { email: em, password: pw, returnSecureToken: true })
    const a = acctOf(j, false)
    const u = await fbLookup(a)
    return { ...a, ver: u.ver, nm: u.nm, em: u.em }
}
/* after the link in the e-mail, Firebase's own page offers a way back to the site */
const FB_BACK = "https://www.freshysfoods.com/#/racun"
const fbSendVerify = (a: Acct, lang: string) => fbPost("sendOobCode", { requestType: "VERIFY_EMAIL", idToken: a.tok, continueUrl: FB_BACK }, lang)
const fbSignUp = async (nm: string, em: string, pw: string, lang: string) => {
    const j = await fbPost("signUp", { email: em, password: pw, returnSecureToken: true })
    let a = acctOf(j, false, "")
    if (nm) {
        const u = await fbPost("update", { idToken: a.tok, displayName: nm, returnSecureToken: true })
        a = { ...acctOf({ ...u, localId: a.uid, email: a.em }, false, nm), tok: String(u.idToken || a.tok), rt: String(u.refreshToken || a.rt) }
    }
    try {
        await fbSendVerify(a, lang)
    } catch (e) {} // the account is made; the e-mail can be sent again from the banner
    return a
}
/* Firestore: the account copy of the store and of each photo */
const fsHead = (a: Acct) => ({ Authorization: "Bearer " + a.tok, "Content-Type": "application/json" })
const fsGetStore = async (a: Acct): Promise<{ s: PStore | null; t: number } | null> => {
    const { st, j } = await fbFetch(FB_DOC + encodeURIComponent(a.uid), { headers: fsHead(a) })
    if (st === 404) return null
    if (st < 200 || st >= 300) throw new FbErr(fbCode(j, st))
    const f = (j && j.fields) || {}
    let s: PStore | null = null
    try {
        s = storeClean(JSON.parse((f.s && f.s.stringValue) || "null"))
    } catch (e) {}
    return { s, t: parseInt((f.t && f.t.integerValue) || "0", 10) || 0 }
}
const fsPutStore = async (a: Acct, s: PStore, t: number) => {
    const { st, j } = await fbFetch(FB_DOC + encodeURIComponent(a.uid), { method: "PATCH", headers: fsHead(a), body: JSON.stringify({ fields: { s: { stringValue: JSON.stringify(s) }, t: { integerValue: String(t) } } }) })
    if (st < 200 || st >= 300) throw new FbErr(fbCode(j, st))
}
const fsPhUrl = (a: Acct, id: string) => FB_DOC + encodeURIComponent(a.uid) + "/photos/" + encodeURIComponent(id)
const fsPutPh = async (a: Acct, id: string, d: string) => {
    const { st, j } = await fbFetch(fsPhUrl(a, id), { method: "PATCH", headers: fsHead(a), body: JSON.stringify({ fields: { d: { stringValue: d } } }) })
    if (st < 200 || st >= 300) throw new FbErr(fbCode(j, st))
}
const fsGetPh = async (a: Acct, id: string): Promise<string | null> => {
    const { st, j } = await fbFetch(fsPhUrl(a, id), { headers: fsHead(a) })
    if (st === 404) return null
    if (st < 200 || st >= 300) throw new FbErr(fbCode(j, st))
    const d = j && j.fields && j.fields.d && j.fields.d.stringValue
    return typeof d === "string" && d.startsWith("data:image/") ? d : null
}
const fsDelPh = async (a: Acct, id: string) => {
    const { st, j } = await fbFetch(fsPhUrl(a, id), { method: "DELETE", headers: fsHead(a) })
    if (st !== 404 && (st < 200 || st >= 300)) throw new FbErr(fbCode(j, st))
}
const fsListPh = async (a: Acct): Promise<string[]> => {
    const out: string[] = []
    let tok = ""
    for (let i = 0; i < 50; i++) {
        const { st, j } = await fbFetch(FB_DOC + encodeURIComponent(a.uid) + "/photos?pageSize=100&mask.fieldPaths=x" + (tok ? "&pageToken=" + encodeURIComponent(tok) : ""), { headers: fsHead(a) })
        if (st < 200 || st >= 300) throw new FbErr(fbCode(j, st))
        ;((j && j.documents) || []).forEach((d: any) => out.push(decodeURIComponent(String(d.name).split("/").pop() || "")))
        tok = (j && j.nextPageToken) || ""
        if (!tok) break
    }
    return out.filter(Boolean)
}
const fsDelStore = async (a: Acct) => {
    const { st, j } = await fbFetch(FB_DOC + encodeURIComponent(a.uid), { method: "DELETE", headers: fsHead(a) })
    if (st !== 404 && (st < 200 || st >= 300)) throw new FbErr(fbCode(j, st))
}
const phIds = (s: PStore) => Array.from(new Set(s.log.flatMap((e) => e.ph || []).concat(s.pets.map((p) => p.pic).filter(Boolean))))
/* a Firestore document holds at most 1 MiB: a photo that would not fit is made smaller (photos are kept at up to 1280 px) */
const phData = async (b: Blob): Promise<string> => {
    let d = await toDataUrl(b)
    for (const px of [960, 720, 520]) {
        if (d.length <= 900000) break
        const sm = await new Promise<Blob>((res, rej) => {
            const u = URL.createObjectURL(b),
                img = new Image()
            img.onload = () => {
                const k = Math.min(1, px / Math.max(img.naturalWidth, img.naturalHeight))
                const c = document.createElement("canvas")
                c.width = Math.max(1, Math.round(img.naturalWidth * k))
                c.height = Math.max(1, Math.round(img.naturalHeight * k))
                const g = c.getContext("2d")
                URL.revokeObjectURL(u)
                if (!g) return rej(new Error("canvas"))
                g.drawImage(img, 0, 0, c.width, c.height)
                c.toBlob((x) => (x ? res(x) : rej(new Error("blob"))), "image/jpeg", 0.8)
            }
            img.onerror = () => {
                URL.revokeObjectURL(u)
                rej(new Error("img"))
            }
            img.src = u
        })
        d = await toDataUrl(sm)
    }
    if (d.length > 1000000) throw new FbErr("PHOTO_TOO_BIG")
    return d
}
/* two copies changed apart (two devices, or this device's pets before signing in): keep everything from both, matched by id;
   where both have the same item, this device's copy wins */
const storeMerge = (acc: PStore, dev: PStore): PStore => {
    const byKey = <X,>(a: X[] | undefined, b: X[] | undefined, k: (x: X) => string): X[] => {
        const m = new Map<string, X>()
        ;(a || []).forEach((x) => m.set(k(x), x))
        ;(b || []).forEach((x) => m.set(k(x), x))
        return Array.from(m.values())
    }
    const id = (x: any) => String(x.id)
    const out: any = { ...acc, ...dev }
    out.pets = byKey(acc.pets, dev.pets, id)
    out.log = byKey(acc.log, dev.log, id).sort((x, y) => x.at - y.at)
    out.ck = byKey(acc.ck, dev.ck, (x) => x.pet + "|" + x.d)
    for (const k of ["ml", "wk", "md", "dy", "fd", "vi", "vz"]) out[k] = byKey((acc as any)[k], (dev as any)[k], id)
    out.dz = byKey(acc.dz, dev.dz, (x) => x.med + "|" + x.d + "|" + x.tm)
    if (!out.pets.some((p: Pet) => p.id === out.cur)) out.cur = out.pets[0] ? out.pets[0].id : ""
    return storeClean(out) || dev
}

/* texts for the account (log in, sign up, password, account page, privacy) */
const TA = {
    login: X("Log in", "Prijava"),
    myAcct: X("My account", "Moj račun"),
    inLead: X("Your pets on your phone, tablet and computer.", "Tvoji ljubimci na mobitelu, tabletu i računalu."),
    em: X("E-mail", "E-mail"),
    pw: X("Password", "Lozinka"),
    show: X("Show password", "Pokaži lozinku"),
    hide: X("Hide password", "Sakrij lozinku"),
    inBtn: X("Log in", "Prijavi se"),
    forgotQ: X("Forgotten password?", "Zaboravljena lozinka?"),
    or: X("or", "ili"),
    newAcct: X("Create new account", "Izradi novi račun"),
    guest: X("Continue without an account", "Nastavi bez računa"),
    guestN: X("Your pets will be on this device only.", "Ljubimci će biti samo na ovom uređaju."),
    upH: X("Create account", "Izradi račun"),
    upLead: X("It's free. Right after, you add your pet.", "Besplatno je. Odmah zatim upisuješ ljubimca."),
    nm: X("Name", "Ime"),
    pwMin: X("At least 8 characters.", "Najmanje 8 znakova."),
    upNote: X("We use your e-mail only to log you in and to send you a new password if you forget it.", "E-mail služi samo za prijavu i za novu lozinku ako je zaboraviš."),
    privacy: X("Privacy policy", "Pravila privatnosti"),
    haveQ: X("Already have an account?", "Već imaš račun?"),
    fgH: X("Forgotten password", "Zaboravljena lozinka"),
    fgP: X("Type the e-mail of your account. We'll send you a link for a new password.", "Upiši e-mail svog računa. Poslat ćemo ti poveznicu za novu lozinku."),
    fgBtn: X("Send link", "Pošalji poveznicu"),
    fgTip: X("The link opens our site, where you type a new password. Can't see the e-mail? Check the Spam folder too.", "Poveznica otvara našu stranicu, gdje upišeš novu lozinku. Ne vidiš e-mail? Pogledaj i u Neželjenu poštu (Spam)."),
    fgSent: X("If there is an account with this e-mail, we've sent a link for a new password to it.", "Ako postoji račun s tom adresom, poslali smo na nju poveznicu za novu lozinku."),
    back: X("Back to log in", "Natrag na prijavu"),
    rsH: X("New password", "Nova lozinka"),
    rsBtn: X("Save new password", "Spremi novu lozinku"),
    rsOk: X("Your password has been changed. Log in with the new one.", "Lozinka je promijenjena. Prijavi se novom lozinkom."),
    vfOk: X("Your e-mail is confirmed.", "E-mail je potvrđen."),
    verH: X("Confirm your e-mail", "Potvrdi e-mail"),
    verP: X("We've sent a link to ", "Poslali smo ti poveznicu na "),
    verP2: X(". Open the e-mail and tap the link in it.", ". Otvori e-mail i stisni poveznicu u njemu."),
    verAgain: X("Send again", "Pošalji ponovno"),
    verSent: X("Sent. Check the Spam folder too.", "Poslano. Pogledaj i u Neželjenu poštu."),
    saved: X("Saved in your account", "Spremljeno u tvom računu"),
    savedFoot: X("Saved in your account. You see it on all your devices.", "Spremljeno u tvom računu. Vidi se na svim tvojim uređajima."),
    syncOff: X("Not in your account yet: no connection. It will be saved when you're back online.", "Još nije spremljeno u račun jer nema veze. Spremit će se kad se veza vrati."),
    invOne: X(" is saved only on this device", " je spremljen samo na ovom uređaju"),
    invMany: X(" are saved only on this device", " su spremljeni samo na ovom uređaju"),
    invP1: X("Save it to your account: then it's on all your devices and isn't lost when you change phones.", "Spremi u svoj račun: tako je na svim tvojim uređajima i ne gubi se kad promijeniš mobitel."),
    invP: X("Save them to your account: then they're on all your devices and aren't lost when you change phones.", "Spremi ih u svoj račun: tako su na svim tvojim uređajima i ne gube se kad promijeniš mobitel."),
    invBtn: X("Save to my account", "Spremi u račun"),
    notNow: X("Not now", "Ne sada"),
    and: X(" and ", " i "),
    verYes: X("confirmed", "potvrđen"),
    verNo: X("not confirmed", "nije potvrđen"),
    pets: X("Pets", "Ljubimci"),
    noPets: X("None yet", "Još nijedan"),
    allSaved: X("Everything is saved.", "Sve je spremljeno."),
    saving: X("Saving…", "Spremam…"),
    chPw: X("Change password", "Promijeni lozinku"),
    curPw: X("Current password", "Sadašnja lozinka"),
    newPw: X("New password", "Nova lozinka"),
    chPwOk: X("Password changed.", "Lozinka je promijenjena."),
    out: X("Log out", "Odjava"),
    outNote: X("After you log out, your pets stay in your account. You'll see them on this device again when you log in.", "Nakon odjave ljubimci ostaju u računu. Na ovom uređaju opet ih vidiš kad se prijaviš."),
    outUnsaved: X("Some changes aren't in your account yet. Connect to the internet, then log out.", "Neke promjene još nisu u računu. Spoji se na internet pa se odjavi."),
    expAcct: X("Download a copy of your data", "Preuzmi kopiju svojih podataka"),
    delL: X("Delete account and all data", "Izbriši račun i sve podatke"),
    delP: X("This deletes your account, your pets, all entries and photos. It can't be undone. Type your password to confirm.", "Ovo briše tvoj račun, ljubimce, sve zapise i slike. Ne može se vratiti. Za potvrdu upiši lozinku."),
    delBtn: X("Delete everything", "Izbriši sve"),
    delOk: X("Your account and all its data have been deleted.", "Račun i svi podaci su izbrisani."),
    cancel: X("Cancel", "Odustani"),
    save: X("Save", "Spremi"),
    eNet: X("No connection. Check the internet and try again.", "Nema veze. Provjeri internet i pokušaj ponovno."),
    eExists: X("There's already an account with this e-mail. Log in, or use Forgotten password.", "S ovom adresom već postoji račun. Prijavi se ili otvori Zaboravljena lozinka."),
    eCred: X("Wrong e-mail or password.", "Pogrešan e-mail ili lozinka."),
    ePw: X("Wrong password.", "Pogrešna lozinka."),
    eEmail: X("That doesn't look like an e-mail address.", "To ne izgleda kao e-mail adresa."),
    eWeak: X("The password needs at least 8 characters.", "Lozinka treba imati najmanje 8 znakova."),
    eMany: X("Too many tries. Wait a few minutes and try again.", "Previše pokušaja. Pričekaj nekoliko minuta pa pokušaj ponovno."),
    eDis: X("This account has been turned off.", "Ovaj račun je isključen."),
    eOob: X("This link has expired or was already used. Ask for a new one.", "Ova poveznica je istekla ili je već iskorištena. Zatraži novu."),
    eMiss: X("Fill in the e-mail and password.", "Upiši e-mail i lozinku."),
    eGen: X("Something went wrong. Try again.", "Nešto nije u redu. Pokušaj ponovno."),
}

/* privacy policy: who answers for the data (filled in by the owner before the account goes live) */
const PRIV_WHO = "Tonči Hrgović"
const PRIV_MAIL = "freshys.osijek@gmail.com"
const PRIV_DATE = X("23 November 2026", "23. 11. 2026.")

/* photos: IndexedDB, one blob per photo */
let phDb: Promise<IDBDatabase> | null = null
const phOpen = () =>
    phDb ||
    (phDb = new Promise<IDBDatabase>((res, rej) => {
        const r = indexedDB.open("fz-pets-ph", 1)
        r.onupgradeneeded = () => {
            r.result.createObjectStore("ph")
        }
        r.onsuccess = () => res(r.result)
        r.onerror = () => {
            phDb = null
            rej(r.error)
        }
    }))
const phTx = <R,>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<R> | void): Promise<R | undefined> =>
    phOpen().then(
        (db) =>
            new Promise<R | undefined>((res, rej) => {
                const tx = db.transaction("ph", mode)
                const q = fn(tx.objectStore("ph"))
                tx.oncomplete = () => res(q ? q.result : undefined)
                tx.onerror = () => rej(tx.error)
                tx.onabort = () => rej(tx.error)
            })
    )
const phPut = (id: string, b: Blob) => phTx("readwrite", (s) => void s.put(b, id))
const phGet = (id: string) => phTx<Blob>("readonly", (s) => s.get(id))
const phDel = (ids: string[]) => (ids.length ? phTx("readwrite", (s) => void ids.forEach((i) => s.delete(i))) : Promise.resolve(undefined))
const phClear = () => phTx("readwrite", (s) => void s.clear())
const phUrls = new Map<string, string>()
const shrink = (f: File): Promise<Blob> =>
    new Promise((res, rej) => {
        const u = URL.createObjectURL(f),
            img = new Image()
        img.onload = () => {
            const s = Math.min(1, 1280 / Math.max(img.naturalWidth, img.naturalHeight))
            const c = document.createElement("canvas")
            c.width = Math.max(1, Math.round(img.naturalWidth * s))
            c.height = Math.max(1, Math.round(img.naturalHeight * s))
            const g = c.getContext("2d")
            if (!g) {
                URL.revokeObjectURL(u)
                rej(new Error("canvas"))
                return
            }
            g.drawImage(img, 0, 0, c.width, c.height)
            URL.revokeObjectURL(u)
            c.toBlob((b) => (b ? res(b) : rej(new Error("blob"))), "image/jpeg", 0.82)
        }
        img.onerror = () => {
            URL.revokeObjectURL(u)
            rej(new Error("img"))
        }
        img.src = u
    })
const toDataUrl = (b: Blob) =>
    new Promise<string>((res, rej) => {
        const r = new FileReader()
        r.onload = () => res(String(r.result))
        r.onerror = () => rej(r.error)
        r.readAsDataURL(b)
    })
function PhImg({ id, alt, className }: { id: string; alt: string; className?: string }) {
    const [u, setU] = useState<string | null>(phUrls.get(id) || null)
    useEffect(() => {
        if (u) return
        let live = true
        phGet(id)
            .then((b) => {
                if (!b || !live) return
                const x = URL.createObjectURL(b)
                phUrls.set(id, x)
                setU(x)
            })
            .catch(() => {})
        return () => {
            live = false
        }
    }, [id])
    return u ? <img className={className} src={u} alt={alt} decoding="async" data-ph={id} /> : <span className={(className || "") + " fz-pt-phx"} role="img" aria-label={alt} data-ph={id} />
}
/* weight chart, drawn at the real width of its box so the labels stay readable on a phone */
function WChart({ pts, goal, proj, lang, now, label, goalTxt, projTxt, h = 230, mini = false }: { pts: Pt[]; goal: number; proj: string | null; lang: Lang; now: Date; label: string; goalTxt: string; projTxt: string; h?: number; mini?: boolean }) {
    const ref = useRef<HTMLDivElement>(null)
    const [w, setW] = useState(0)
    useEffect(() => {
        const el = ref.current
        if (!el) return
        const set = () => {
            const x = Math.round(el.getBoundingClientRect().width)
            if (x > 0) setW(Math.max(200, x))
        }
        set()
        if (typeof ResizeObserver === "undefined") return
        const ro = new ResizeObserver(set)
        ro.observe(el)
        return () => ro.disconnect()
    }, [])
    if (!pts.length || !w) return <div ref={ref} className="fz-pt-chart" style={{ height: pts.length ? h : 0 }} />
    const g = pts.every((p) => p.kg < 1) && (!goal || goal < 1)
    const f = (kg: number) => (g ? kg * 1000 : kg)
    const unit = g ? "g" : "kg"
    const vals = pts.map((p) => f(p.kg)).concat(goal ? [f(goal)] : [])
    let lo = Math.min(...vals),
        hi = Math.max(...vals)
    const span0 = hi - lo
    const steps = [0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50, 100, 200, 500]
    const minSpan = g ? 10 : lo < 10 ? 0.5 : 2
    if (span0 < minSpan) {
        lo -= (minSpan - span0) / 2
        hi += (minSpan - span0) / 2
    }
    const step = steps.find((s) => (hi - lo) / s <= (mini ? 2 : 4)) || 1000
    lo = Math.floor(lo / step) * step
    hi = Math.ceil(hi / step) * step
    if (hi === lo) hi = lo + step
    const pl = mini ? 4 : g ? 52 : 40,
        pr = mini ? 8 : 16,
        pt = mini ? 10 : 18,
        pb = mini ? 8 : 30
    const t0 = dOf(pts[0].d).getTime(),
        tEnd = proj ? dOf(proj).getTime() : dOf(pts[pts.length - 1].d).getTime()
    const tSpan = Math.max(DAY, tEnd - t0)
    const X = (s: string) => (pts.length === 1 && !proj ? (pl + w - pr) / 2 : pl + ((w - pl - pr) * (dOf(s).getTime() - t0)) / tSpan)
    const Y = (v: number) => pt + ((h - pt - pb) * (hi - v)) / (hi - lo)
    const P = pts.map((p) => [X(p.d), Y(f(p.kg))] as [number, number])
    const line = P.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ")
    const ticks: number[] = []
    for (let v = lo; v <= hi + 1e-9; v += step) ticks.push(Math.round(v * 100) / 100)
    const nfx = (v: number) => nf(v, lang, Math.abs(v % 1) > 1e-9 ? (step < 1 ? 1 : 0) : 0)
    const last = P[P.length - 1]
    const xl: [number, string, "start" | "middle" | "end"][] = []
    if (!mini) {
        xl.push([P[0][0], dTxt(pts[0].d, lang, now), "start"])
        const lx = X(pts[pts.length - 1].d)
        if (pts.length > 1 && lx - P[0][0] > 80 && (!proj || X(proj) - lx > 90)) xl.push([lx, dTxt(pts[pts.length - 1].d, lang, now), proj ? "middle" : "end"])
        if (proj) xl.push([X(proj), projTxt, "end"])
    }
    const gid = "fzg" + (mini ? "m" : "b")
    return (
        <div ref={ref} className="fz-pt-chart">
            <svg width={w} height={h} viewBox={"0 0 " + w + " " + h} role="img" aria-label={label}>
                <defs>
                    <linearGradient id={gid} x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0" stopColor="#2F5D3A" stopOpacity=".17" />
                        <stop offset="1" stopColor="#2F5D3A" stopOpacity="0" />
                    </linearGradient>
                </defs>
                {!mini &&
                    ticks.map((v) => (
                        <g key={v}>
                            <line x1={pl} x2={w - pr} y1={Y(v)} y2={Y(v)} stroke="rgba(29,29,31,.08)" />
                            <text x={pl - 9} y={Y(v) + 4} textAnchor="end" fontSize="12" fill="#5F5E63">
                                {nfx(v) + (g && v === ticks[ticks.length - 1] ? " " + unit : "")}
                            </text>
                        </g>
                    ))}
                {goal > 0 && (
                    <>
                        <line x1={pl} x2={w - pr} y1={Y(f(goal))} y2={Y(f(goal))} stroke="#2F5D3A" strokeWidth="1.6" strokeDasharray="5 5" />
                        {!mini && (
                            <text x={w - pr} y={Y(f(goal)) + (Y(f(goal)) > h - pb - 22 ? -8 : 17)} textAnchor="end" fontSize="12.5" fontWeight="700" fill="#2F5D3A">
                                {goalTxt}
                            </text>
                        )}
                    </>
                )}
                {P.length > 1 && <path d={line + " L" + last[0] + " " + (h - pb) + " L" + P[0][0] + " " + (h - pb) + " Z"} fill={"url(#" + gid + ")"} />}
                <path d={line} fill="none" stroke="#2F5D3A" strokeWidth={mini ? 2.4 : 2.6} strokeLinejoin="round" strokeLinecap="round" />
                {proj && goal > 0 && (
                    <>
                        <path d={"M" + last[0] + " " + last[1] + " L" + X(proj) + " " + Y(f(goal))} stroke="#2F5D3A" strokeWidth="2.2" strokeDasharray="1 6" strokeLinecap="round" fill="none" />
                        <circle cx={X(proj)} cy={Y(f(goal))} r="5" fill="#FFFEFA" stroke="#2F5D3A" strokeWidth="2" strokeDasharray="2 2.4" />
                    </>
                )}
                {(mini ? [last] : P).map((p, i, a) => {
                    const lastOne = i === a.length - 1,
                        vet = !mini && pts[i] && pts[i].v,
                        r = lastOne ? (mini ? 4 : 5.5) : 3.6
                    return vet ? (
                        <rect key={i} x={p[0] - r} y={p[1] - r} width={r * 2} height={r * 2} rx="1.5" fill={lastOne ? "#2F5D3A" : "#FFFEFA"} stroke="#2F5D3A" strokeWidth="2" />
                    ) : (
                        <circle key={i} cx={p[0]} cy={p[1]} r={r} fill={lastOne ? "#2F5D3A" : "#FFFEFA"} stroke="#2F5D3A" strokeWidth="2" />
                    )
                })}
                {!mini && (
                    <text x={Math.min(w - pr - 14, Math.max(pl + 14, last[0]))} y={last[1] - 13} textAnchor="middle" fontSize="12.5" fontWeight="700" fill="#1D1D1F">
                        {nf(f(pts[pts.length - 1].kg), lang, g ? 0 : f(pts[pts.length - 1].kg) % 1 ? 1 : 0)}
                    </text>
                )}
                {xl.map(([x, t, a], i) => (
                    <text key={i} x={x} y={h - 9} textAnchor={a} fontSize="12" fill="#5F5E63">
                        {t}
                    </text>
                ))}
            </svg>
        </div>
    )
}
const PD0: Pet = { ...P0, id: "", sp: 0, kind: "", goal: 0, gb: 0, made: "", vm: "", vn: "", va: "", vt: "", mc: false, pic: "", tr: [], fav: "", since: "", bday: 0, q: "", vq: "" }
type Up = { id: string; d: string; t: string; ti: string; late: boolean }
/* next dates: the newest entry of each series (type + title) decides; missed vaccinations and parasite doses stay for 60 days */
const upOf = (log: Ent[], pet: string, now: Date): Up[] => {
    const today = ymd(now)
    const last = new Map<string, Ent>()
    log.filter((e) => e.pet === pet && HEALTH_T.includes(e.t))
        .sort(byT)
        .forEach((e) => last.set(e.t + "|" + (e.ti || "").trim().toLowerCase(), e))
    const out: Up[] = []
    last.forEach((e) => {
        if (!e.nx) return
        if ((e.t === "inj" || e.t === "ill") && e.st === 2) return
        const late = e.nx < today
        if (late && (!(e.t === "vac" || e.t === "par") || daysTo(e.nx, now) < -60)) return
        out.push({ id: e.id, d: e.nx, t: e.t, ti: e.ti || "", late })
    })
    return out.sort((a, b) => (a.d < b.d ? -1 : a.d > b.d ? 1 : 0))
}
const ckDays = (ck: Ck[], pet: string, now: Date, n: number) => {
    const m = new Map<string, Ck>()
    ck.filter((c) => c.pet === pet).forEach((c) => m.set(c.d, c))
    return Array.from({ length: n }, (_, i) => {
        const d = ymd(new Date(now.getFullYear(), now.getMonth(), now.getDate() - (n - 1) + i, 12))
        return { d, c: m.get(d) }
    })
}
/* 0 fine, 1 a bit off, 2 bad; energy "lots" and "normal" are both fine */
const ckLvl = (k: number, v: number) => (v < 0 ? -1 : k === 1 ? (v === 2 ? 1 : 0) : v)
const CK_K: ("a" | "e" | "p")[] = ["a", "e", "p"]
const PT_IC: Record<string, string> = {
    mail: '<rect x="2.5" y="5" width="19" height="14" rx="3"/><path d="m3.5 7 8.5 6 8.5-6"/>',
    phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2Z"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    start: '<path d="M4 22V4M4 4h12l-2 4 2 4H4"/>',
    w: '<rect x="3" y="4" width="18" height="16" rx="4"/><path d="M8.5 10.5a3.5 3.5 0 0 1 7 0"/><path d="M12 10.5l1.7-1.7"/>',
    b: '<circle cx="12" cy="6" r="3"/><path d="M12 9c3.5 0 4.5 3 4 6.5S14 21 12 21s-4.5-2-5-5.5S8.5 9 12 9Z"/>',
    inj: '<rect x="2.5" y="8" width="19" height="8" rx="4" transform="rotate(-38 12 12)"/><path d="M10.7 10.7h.01M13.3 13.3h.01M10.7 13.3h.01M13.3 10.7h.01"/>',
    ill: '<path d="M14 14.8V5a2 2 0 0 0-4 0v9.8a4 4 0 1 0 4 0Z"/><path d="M12 9v8"/>',
    vet: '<path d="M6 3v5a4 4 0 0 0 8 0V3"/><path d="M10 12v2a5 5 0 0 0 10 0v-2"/><circle cx="20" cy="10" r="2"/>',
    vac: '<path d="m18 2 4 4M17 7l3-3M19 9 8.7 19.3a2.4 2.4 0 0 1-3.4 0l-.6-.6a2.4 2.4 0 0 1 0-3.4L15 5M9 11l4 4M5 19l-3 3M14 4l6 6"/>',
    par: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/>',
    med: '<path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/>',
    note: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
    cal: '<rect x="3" y="4" width="18" height="18" rx="3"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    print: '<path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8" rx="1"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    cam: '<path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z"/><circle cx="12" cy="13.5" r="3.5"/>',
    dog: '<circle cx="6.5" cy="10" r="2"/><circle cx="10" cy="5.5" r="2"/><circle cx="14" cy="5.5" r="2"/><circle cx="17.5" cy="10" r="2"/><path d="M8 17.5c0-3 1.8-5.5 4-5.5s4 2.5 4 5.5c0 1.9-1.6 2.5-4 2.5s-4-.6-4-2.5Z"/>',
    cat: '<path d="M5 3.5l3.5 4.5h7L19 3.5V13a7 7 0 0 1-14 0Z"/><path d="M9.5 13h.01M14.5 13h.01M10.5 16.5c1 .7 2 .7 3 0"/>',
    other: '<path d="M9.2 9.5C8.2 5.5 8.3 2 9.6 2s2.2 3.7 1.9 7.5M14.8 9.5c1-4 .9-7.5-.4-7.5s-2.2 3.7-1.9 7.5"/><circle cx="12" cy="15.5" r="6"/>',
    /* Plus sections; footprints and bone after Lucide (ISC) */
    grid: '<rect x="3.5" y="3.5" width="7" height="7" rx="2"/><rect x="13.5" y="3.5" width="7" height="7" rx="2"/><rect x="3.5" y="13.5" width="7" height="7" rx="2"/><rect x="13.5" y="13.5" width="7" height="7" rx="2"/>',
    book: '<path d="M5 4.5A1.5 1.5 0 0 1 6.5 3H19v14H6.5A1.5 1.5 0 0 0 5 18.5Z"/><path d="M5 18.5A1.5 1.5 0 0 0 6.5 20H19v-3"/><path d="M9 7.5h6"/>',
    bowl: '<path d="M3 12.5h18"/><path d="M4.5 12.5l1.3 5.6a2 2 0 0 0 1.9 1.5h8.6a2 2 0 0 0 1.9-1.5l1.3-5.6"/><path d="M7.5 12.5c.6-2.6 2.4-4.3 4.5-4.3s3.9 1.7 4.5 4.3"/>',
    walk: '<path d="M4 16v-2.4C4 11.5 3 10.5 3 8c0-2.7 1.5-6 4.5-6C9.4 2 10 3.8 10 5.5c0 3.1-2 5.7-2 8.7V16a2 2 0 1 1-4 0Z"/><path d="M20 20v-2.4c0-2.1 1-3.1 1-5.6 0-2.7-1.5-6-4.5-6C14.6 6 14 7.8 14 9.5c0 3.1 2 5.7 2 8.7V20a2 2 0 1 0 4 0Z"/><path d="M16 17h4M4 13h4"/>',
    treat: '<path d="M17 10c.7-.7 1.7 0 2.5 0a2.5 2.5 0 1 0 0-5 .5.5 0 0 1-.5-.5 2.5 2.5 0 1 0-5 0c0 .8.7 1.8 0 2.5l-7 7c-.7.7-1.7 0-2.5 0a2.5 2.5 0 0 0 0 5c.3 0 .5.2.5.5a2.5 2.5 0 1 0 5 0c0-.8-.7-1.8 0-2.5Z"/>',
    star: '<path d="M12 3.2l2.6 5.4 5.9.8-4.3 4.1 1.1 5.9L12 16.6l-5.3 2.8 1.1-5.9-4.3-4.1 5.9-.8Z"/>',
    cake: '<path d="M5 21v-7.5A1.5 1.5 0 0 1 6.5 12h11a1.5 1.5 0 0 1 1.5 1.5V21"/><path d="M5 16c1.2 0 1.8-1 3.5-1s2.3 1 3.5 1 1.8-1 3.5-1 2.3 1 3.5 1"/><path d="M3 21h18M12 12V8.5"/><path d="M12 6.5c-.9-.6-1.2-1.6-.4-2.7l.4-.6.4.6c.8 1.1.5 2.1-.4 2.7Z"/>',
    home: '<path d="M3.5 10.5 12 3.5l8.5 7"/><path d="M5.5 9v10.5a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1V9"/><path d="M10 20.5V15h4v5.5"/>',
    kt: '<rect x="5" y="4.5" width="14" height="17" rx="2.5"/><path d="M9 4.5V3h6v1.5M8.5 10h7M8.5 13.5h7M8.5 17h4"/>',
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    dry: '<circle cx="8" cy="8.5" r="3"/><circle cx="16.2" cy="7.8" r="2.6"/><circle cx="12.4" cy="15.2" r="3.2"/><circle cx="5.8" cy="16.8" r="2"/><circle cx="18.4" cy="15.4" r="2.2"/>',
    can: '<ellipse cx="12" cy="6" rx="7" ry="2.5"/><path d="M5 6v12c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5V6"/><path d="M5 10.5c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5"/>',
    pot: '<path d="M4 10h16v6a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4Z"/><path d="M2 10h2M20 10h2M9.5 7c0-1.2 1-1.6 1-2.8M13.5 7c0-1.2 1-1.6 1-2.8"/>',
}
const PT_C: Record<string, string> = { start: "g", w: "n", b: "n", inj: "o", ill: "r", vet: "s", vac: "v", par: "g", med: "s", note: "n" }
const ptIco = (k: string, s = 21) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" dangerouslySetInnerHTML={{ __html: PT_IC[k] || "" }} />

/* stand-alone report for the vet: the summary sheet as one HTML file with the chart and photos inside */
const SHEET_CSS =
    'body{margin:0;padding:32px;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;color:#1D1D1F;background:#fff;line-height:1.45}' +
    ".fz-pt-sheet{max-width:820px;margin:0 auto}.fz-pt-sheet header{border-bottom:2px solid #1D1D1F;padding-bottom:12px}.fz-pt-sheet h2{font-size:30px;margin:0;letter-spacing:-.02em}" +
    ".fz-pt-sheet header p{font-size:15px;color:#5F5E63;margin:4px 0 0}.fz-pt-sheet h3{font-size:13px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#5F5E63;margin:22px 0 8px}" +
    ".fz-pt-sheet dl{display:grid;grid-template-columns:1fr 1fr;gap:4px 24px;margin:0}.fz-pt-sheet dl div{display:flex;gap:10px;padding:6px 0;border-bottom:1px solid #E5E2DC;font-size:15px}" +
    ".fz-pt-sheet dt{width:120px;flex:none;color:#5F5E63}.fz-pt-sheet dd{margin:0;font-weight:600}.fz-pt-sheet p{font-size:15px;margin:0}.fz-pt-wl{font-size:13.5px!important;color:#4A4740;margin-top:6px!important;line-height:1.6}" +
    ".fz-pt-vl{list-style:none;margin:0;padding:0}.fz-pt-vl li{display:flex;gap:14px;padding:7px 0;border-bottom:1px solid #E5E2DC;font-size:15px}.fz-pt-vl li>span{width:110px;flex:none;color:#5F5E63}" +
    ".fz-pt-vpics{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}.fz-pt-vpics figure{margin:0}.fz-pt-vpics img{width:100%;aspect-ratio:1/1;object-fit:cover;border-radius:10px;display:block}" +
    ".fz-pt-vpics figcaption{font-size:12.5px;color:#5F5E63;margin-top:4px}.fz-pt-chart svg{max-width:100%;height:auto;display:block}.fz-pt-leg{font-size:13px;color:#5F5E63;margin-top:4px!important}" +
    ".fz-pt-leg i{display:inline-block;width:9px;height:9px;border:2px solid #2F5D3A;border-radius:2px;margin-right:6px;vertical-align:-1px}.fz-pt-sheet footer{margin-top:24px;font-size:13px;color:#5F5E63}" +
    ".fz-pt-kt{display:block;font-size:12.5px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#2F5D3A;margin-bottom:6px}.fz-pt-vl li>div b{font-weight:700}" +
    ".fz-pt-vqs{white-space:pre-wrap;padding:10px 14px;border-left:3px solid #2F5D3A;background:#F7F5EF;border-radius:0 10px 10px 0;line-height:1.5}" +
    ".fz-pxv-shh{display:flex;justify-content:space-between;align-items:flex-end;gap:18px;border-bottom:0!important;background:#2F5D3A;color:#fff;border-radius:16px;padding:18px 22px!important;-webkit-print-color-adjust:exact;print-color-adjust:exact}.fz-pxv-shh .fz-pt-kt{color:#fff;opacity:.88}.fz-pxv-shh h2{color:#fff}.fz-pxv-shh p{color:rgba(255,255,255,.9)!important}" +
    ".fz-pxv-shr{text-align:right;font-size:14px;display:flex;flex-direction:column;gap:2px}.fz-pxv-shr b{font-size:18px}.fz-pxv-shc{border:1.5px solid #2F5D3A;border-radius:14px;padding:2px 16px 12px;margin-top:18px}.fz-pxv-shc h3{color:#2F5D3A!important;margin-top:14px!important}" +
    ".fz-pxv-ct{width:100%;border-collapse:collapse;font-size:14.5px;line-height:1.4}.fz-pxv-ct th,.fz-pxv-ct td{text-align:left;vertical-align:top;padding:7px 10px 7px 0;border-bottom:1px solid #E5E2DC}.fz-pxv-ct thead th{font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:#5F5E63}.fz-pxv-ct tbody th{font-weight:600;color:#5F5E63;width:22%}.fz-pxv-ct td:last-child{width:36%}" +
    ".fz-pxv-qs{margin:6px 0 0;padding-left:22px}.fz-pxv-qs li{font-size:16px;font-weight:600;margin-top:6px}.fz-pxv-ctl{font-size:14.5px;color:#4A4740;margin-top:10px!important}" +
    ".fz-pxv-lines{margin-top:6px;border-top:2px dashed #D8D3C9}.fz-pxv-ln i{display:block;height:31px;border-bottom:1px solid #D8D3C9}.fz-pxv-rest{margin-top:22px;border-top:2px solid #1D1D1F}.fz-pxv-oth{font-size:14px!important;color:#4A4740;margin-top:8px!important}" +
    "@page{size:A4;margin:14mm 14mm 16mm}@media print{body{padding:0}.fz-pt-sheet h3{break-after:avoid}.fz-pt-vl li,.fz-pt-sheet dl div,.fz-pt-chart,.fz-pt-vqs{break-inside:avoid}.fz-pt-vqs{background:none}.fz-pt-sheet h3{margin:16px 0 6px}.fz-pt-vl li{padding:5px 0}.fz-pt-sheet dl div{padding:4px 0}.fz-pt-sheet footer{margin-top:14px}}" +
    "@media (max-width:600px){body{padding:16px}.fz-pt-sheet dl{grid-template-columns:1fr}.fz-pt-vl li{flex-direction:column;gap:2px}.fz-pt-vpics{grid-template-columns:repeat(2,1fr)}}"
const escH = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
const reportHtml = async (title: string, lang: Lang) => {
    const el = document.getElementById("fz-pt-sheet")
    if (!el) return null
    const clone = el.cloneNode(true) as HTMLElement
    /* on screen the paper can be hidden until it is asked for; the file never is */
    clone.removeAttribute("aria-hidden")
    clone.classList.remove("is-off")
    for (const n of Array.from(clone.querySelectorAll("[data-ph]")) as HTMLElement[]) {
        let src = ""
        try {
            const b = await phGet(n.getAttribute("data-ph") || "")
            if (b) src = await toDataUrl(b)
        } catch (e) {}
        if (!src) {
            n.remove()
            continue
        }
        const img = document.createElement("img")
        img.src = src
        img.alt = n.getAttribute("alt") || n.getAttribute("aria-label") || ""
        n.replaceWith(img)
    }
    return '<!doctype html><html lang="' + lang + '"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>' + escH(title) + "</title><style>" + SHEET_CSS + "</style></head><body>" + clone.outerHTML + "</body></html>"
}
const isMail = (s: string) => /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/.test(s)
const slug = (s: string) =>
    s
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")

/* vet clinics: the official registers of the Ministry of Agriculture, Forestry and Fisheries (data.gov.hr, Open Licence),
   February 2026: practices, stations, clinics, hospitals and ambulances, one row per place.
   Row: name, street and number, town, postcode, county, phone, email, kind. Searched in the browser; nothing is sent. */
const CLINICS_URL = "https://framerusercontent.com/assets/DCz1VSWHyNRxFFUJDaDFw82LKrc.json"
const CLINICS_SRC = "https://data.gov.hr/ckan/dataset/upisnik-veterinarskih-sluzbi"
type Clinic = { n: string; a: string; t: string; e: string }
type ClinicRow = string[]
type VPick = { q: string; more: boolean; own: boolean; n: string; a: string; t: string; e: string; oe: string }
let clinicsP: Promise<ClinicRow[]> | null = null
const loadClinics = () =>
    clinicsP ||
    (clinicsP = fetch(CLINICS_URL)
        .then((r) => {
            if (!r.ok) throw new Error("http " + r.status)
            return r.json()
        })
        .then((d) => (d && Array.isArray(d.c) ? (d.c as ClinicRow[]).filter((x) => Array.isArray(x) && typeof x[0] === "string") : []))
        .catch((e) => {
            clinicsP = null
            throw e
        }))
const fold = (s: string) =>
    String(s || "")
        .toLowerCase()
        .replace(/đ/g, "d")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
const clinicFind = (rows: ClinicRow[], q: string): Clinic[] => {
    const toks = fold(q).split(/[\s,]+/).filter(Boolean)
    if (!toks.length) return []
    const hits = rows.filter((r) => {
        const h = fold(r.slice(0, 7).join(" "))
        return toks.every((t) => h.includes(t))
    })
    const t0 = toks[0]
    const town = (r: ClinicRow) => (fold(r[2]).startsWith(t0) ? 0 : 1)
    hits.sort((a, b) => town(a) - town(b) || a[0].localeCompare(b[0], "hr"))
    return hits.map((r) => ({ n: String(r[0]).slice(0, 120), a: [r[1], r[2]].filter(Boolean).join(", ").slice(0, 160), t: String(r[5] || "").slice(0, 40), e: String(r[6] || "").slice(0, 120) }))
}
/* Google Maps link (Maps URLs, no key): reviews and photos stay on Google; nothing is copied or stored here */
const gmapsOf = (n: string, a: string) => "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent([n, a].filter(Boolean).join(", "))
const telOf = (s: string) => {
    const t = s.replace(/[^\d+]/g, "")
    return t.replace(/\D/g, "").length >= 6 ? t : ""
}
const SEL_ALL: Record<string, boolean> = Object.fromEntries(POUCHES.map((p) => [p.id, true]))
const ORD0: Ord = { step: 1, sel: SEL_ALL, plan: 2, street: "", city: "Osijek", zip: "31000", day: -1, done: false }
const PLAN_DAYS = [7, 14, 30]
const PLAN_RATE = [1.0, 0.95, 0.9] // example: € per 100 g
const ROT = [-0.8, 0.6, -0.4, 0.9, 0.5, -0.7, 0.8, -0.5, -0.6, 0.7, -0.3, 0.6]

const nf = (n: number, lang: Lang, d = 0) => {
    let s = n.toFixed(d)
    if (Math.abs(n) >= 1000) s = s.replace(/^(-?\d+)(\d{3})/, "$1 $2")
    return (lang === "hr" ? s.replace(".", ",") : s).replace(" ", lang === "hr" ? "." : ",")
}
const eur = (n: number, lang: Lang) => (lang === "hr" ? nf(n, lang, 2) + " €" : "€" + nf(n, lang, 2))
const plHr = (n: number, f: [string, string, string]) => {
    const a = Math.abs(Math.round(n)),
        m10 = a % 10,
        m100 = a % 100
    if (m10 === 1 && m100 !== 11) return f[0]
    if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return f[1]
    return f[2]
}
const pl = (lang: Lang, n: number, en: [string, string], hr: [string, string, string]) => (lang === "en" ? (n === 1 ? en[0] : en[1]) : plHr(n, hr))
const frac = (n: number, lang: Lang) => {
    const w = Math.floor(n + 1e-9),
        r = n - w
    const map: [number, string][] = [[0.25, "¼"], [1 / 3, "⅓"], [0.5, "½"], [2 / 3, "⅔"], [0.75, "¾"]]
    for (const [v, s] of map) if (Math.abs(r - v) < 0.02) return (w ? String(w) : "") + s
    return r < 0.02 ? String(w) : nf(n, lang, 1)
}
const tok = (s: string, k: number, lang: Lang) =>
    s.replace(/\{([\d.]+)\}/g, (_, v) => {
        const x = parseFloat(v) * k
        if (Number.isInteger(x)) return String(x)
        if (Number.isInteger(x * 4) && x < 10 && !/\.\d{2}/.test(v)) return frac(x, lang)
        return nf(x, lang, 1)
    })
const plain = (s: string) => s.replace(/\{([\d.]+)\}/g, "$1")
const spoon = (lang: Lang, n: number, u: "tsp" | "tbsp") => {
    if (lang === "en") return u
    const f: [string, string, string] = u === "tsp" ? ["žličica", "žličice", "žličica"] : ["žlica", "žlice", "žlica"]
    if (n < 1 || !Number.isInteger(n)) return f[1]
    return plHr(n, f)
}
const qty = (i: Ing, k: number, lang: Lang) => {
    if (i.q == null) return ""
    const a = i.q * k,
        b = i.q2 != null ? i.q2 * k : null
    const u = i.u
    const small = u === "tsp" || u === "tbsp" || u === "pc"
    const num = (v: number) => (small ? frac(v, lang) : nf(v, lang, 0))
    if ((u === "g" || u === "ml") && b == null && a >= 1000) {
        let s = nf(a / 1000, lang, 2)
        s = s.replace(/([.,]\d*?)0+$/, "$1").replace(/[.,]$/, "")
        return s + (u === "g" ? " kg" : " l")
    }
    const r = b != null ? num(a) + "–" + num(b) : num(a)
    if (u === "pc") return r
    if (u === "tsp" || u === "tbsp") return r + " " + spoon(lang, b ?? a, u)
    return r + " " + u
}
const ingText = (i: Ing, k: number, lang: Lang) => tok((k > 1 && i.n2 ? i.n2 : i.n)[lang], k, lang)
/* ---- cooking ahead: a catalogue recipe made k times. Its ingredient lines are text, so only a leading amount in a real
   measure (g, kg, ml, l, spoons) is multiplied; any other line that has a number gets "k ×" in front, so nothing is ever
   half-multiplied (a tin with its weight in brackets, an egg, milligrams of calcium). ---- */
const COOK_MAX = 30
const GLY: Record<string, number> = { "¼": 0.25, "½": 0.5, "¾": 0.75, "⅓": 1 / 3, "⅔": 2 / 3, "⅛": 0.125 }
const QN = "(?:\\d+(?:[.,]\\d+)?\\s?[¼½¾⅓⅔⅛]?|[¼½¾⅓⅔⅛])"
const SC_RE = new RegExp("^(" + QN + ")(?:\\s?[–-]\\s?(" + QN + "))?\\s?(kg|g|ml|l|tbsp|tsp|žlica|žlice|žličica|žličice)(?![a-zA-Zčćžšđ])")
const qNum = (v: string) => {
    const g = v.match(/[¼½¾⅓⅔⅛]/)
    return (parseFloat(v.replace(",", ".")) || 0) + (g ? GLY[g[0]] : 0)
}
const hasAmt = (t: string) => /\d|[¼½¾⅓⅔⅛]/.test(t.replace(/\d+(?:[.,]\d+)?\s?%/g, ""))
const trimNum = (v: string) => v.replace(/([.,]\d*?)0+$/, "$1").replace(/[.,]$/, "")
const scaleLine = (s: string, k: number, lang: Lang): string => {
    if (k === 1) return s
    const m = SC_RE.exec(s)
    if (!m) return /^\s*(\d|[¼½¾⅓⅔⅛])/.test(s) ? k + " × " + s : hasAmt(s) ? s + " (× " + k + ")" : s
    let rest = s.slice(m[0].length)
    if (hasAmt(rest.replace(/\([^)]*\)/g, ""))) return k + " × " + s
    rest = rest.replace(/\(([^)]*)\)/g, (all, inner: string) =>
        "(" + inner.replace(/(\d{1,3}(?:[.,]\d{3})+|\d+)(?:[.,](\d+))?(\s?(?:mg|g|ml|kg|l)\b)/g, (x: string, a: string, b: string | undefined, u: string) => {
            const v = parseFloat(a.replace(/[.,](?=\d{3}\b)/g, "") + (b ? "." + b : "")) * k
            return nf(Math.round(v), lang) + u
        }) + ")"
    )
    const u = m[3]
    const a = qNum(m[1]) * k
    const b = m[2] ? qNum(m[2]) * k : null
    if (u === "g" || u === "kg" || u === "ml" || u === "l") {
        const f = u === "kg" || u === "l" ? 1000 : 1
        const base = u === "g" || u === "kg" ? "g" : "ml"
        const one = (v: number): [string, string] => {
            const x = v * f
            return x >= 1000 ? [trimNum(nf(Math.round(x / 50) / 20, lang, 2)), base === "g" ? "kg" : "l"] : [nf(Math.round(x), lang), base]
        }
        const [na, ua] = one(a)
        if (b == null) return na + " " + ua + rest
        const [nb, ub] = one(b)
        return (ua === ub ? na + "–" + nb + " " + ub : na + " " + ua + "–" + nb + " " + ub) + rest
    }
    const tsp = /tsp|žlič/.test(u)
    if (tsp && (b ?? a) >= 6) {
        const h = (v: number) => Math.round((v / 3) * 2) / 2
        const nt = b != null ? frac(h(a), lang) + "–" + frac(h(b), lang) : frac(h(a), lang)
        return nt + " " + (lang === "en" ? "tbsp" : spoon("hr", h(b ?? a), "tbsp")) + rest
    }
    const num = b != null ? frac(a, lang) + "–" + frac(b, lang) : frac(a, lang)
    return num + " " + (lang === "en" ? u : spoon("hr", b ?? a, tsp ? "tsp" : "tbsp")) + rest
}
/* kcal in the whole recipe (USDA SR28, from the ingredients) for catalogue meals whose yield is given in servings, not as a volume:
   with it the page can say how many times to make the recipe for a number of days. */
const WHOLE_KCAL: Record<number, number> = { 284: 532, 384: 1735, 490: 1583, 501: 1242, 669: 779, 813: 1926, 877: 1258, 925: 1057, 1033: 949, 1086: 784, 1425: 1554, 1435: 379, 1567: 1176, 1639: 1506, 1682: 1308, 2189: 1099, 2304: 639, 2352: 1410, 2560: 997, 2635: 1097, 2653: 468, 2672: 967, 2836: 23143, 2852: 5938, 2997: 375, 3045: 481, 3091: 9811, 3385: 384, 3535: 1399, 3805: 771, 3815: 5311 }
/* what one recipe gives for this dog: d1 days it lasts, and the day's portion by volume (ml of tot) or in pieces (n of pcs) */
type CookI = { d1: number; ml?: number; tot?: number; n?: number; pcs?: number; word?: (k: number) => string; wt?: boolean }
const norm = (s: string) =>
    s
        .toLowerCase()
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/đ/g, "d")
const r10 = (v: number) => Math.max(10, Math.round(v / 10) * 10)
/* Daily energy for dogs: AAHA 2021 Nutrition and Weight Management Guidelines for Dogs and Cats, Box 1.
   RER = 70 × kg^0.75 (energy at rest), energy a day = RER × factor. */
const AAHA_URL = "https://www.aaha.org/globalassets/02-guidelines/2021-nutrition-and-weight-management/resourcepdfs/nutritiongl_box1.pdf"
const AAHA_10_URL = "https://www.aaha.org/resources/2021-aaha-nutrition-and-weight-management-guidelines/prevention-of-obesity/"
/* Very light food (steamed vegetables, veg chips, broth): 10% of the calories would allow absurd amounts, such as 4 litres
   of steamed zucchini for a big dog. Above these limits no number is shown. Broth gets a vet rule of thumb instead
   (about 30 ml per 4.5 kg a day, quoted on Chewy's vet-reviewed page). */
const LIGHT_KCAL_ML = 0.2
const BROTH_ML_KG = 30 / 4.536
/* Up to this many pieces a day are counted. Above it the batch is split into equal parts, so nobody counts 74 cubes. */
const COUNT_MAX = 20
const maxNum = (s: string) => {
    const m = s.replace(/[{}]/g, "").replace(/(\d),(\d)/g, "$1.$2").match(/\d+(?:\.\d+)?/g)
    return m ? Math.max(...m.map(Number)) : 0
}
const volOf = (s: string) => {
    const m = s.toLowerCase().replace(/(\d),(\d)/g, "$1.$2").match(/(\d+(?:\.\d+)?)\s*(?:[–-]\s*(\d+(?:\.\d+)?))?\s*(l|ml|kg|g)\b/)
    if (!m) return 0
    const v = parseFloat(m[2] || m[1])
    return m[3] === "l" || m[3] === "kg" ? v * 1000 : v
}
const BROTH_URL = "https://www.chewy.com/education/dog/food-and-nutrition/bone-broth-for-dogs"
/* Whole meal or on top of the usual food. A dish can be the whole day's food when 100 g of it gives at least 110 kcal (rounded),
   as fresh dog food sold for the whole day does (about 111–136 kcal per 100 g). Lighter stews and soups would mean well over
   a kilo a day for a 20 kg dog, so they go on top of the usual food and point to a similar whole-day dish. Pieces (patties,
   loaves) whose cooked weight isn't known yet aren't whole-day dishes. None of the recipes is formulated as a complete diet:
   in a UC Davis study of 200 home-prepared dog food recipes, 95% lacked at least one essential nutrient (Stockman et al. 2013,
   JAVMA), so the whole-meal view always says so and points to the vet for the supplement. */
const DAY_KCAL_G = 1.095
/* Pastes with turmeric and ginger (Golden Paste, Carrot, Ginger & Turmeric Paste) are supplements, not food: the 10 % calorie limit
   would give 40–140 g of paste a day, which is no portion of a supplement, and how much to give is the vet's call (we never give doses). */
const SUPP = new Set([2425, 2698])
const HOME_URL = "https://www.ucdavis.edu/news/homemade-dog-food-recipes-can-be-risky-business-study-finds"
/* Smallest and largest volume in a yield such as "About 1.9–2.15 l" (ml), or null when the yield isn't a volume. */
const volRange = (s: string): [number, number] | null => {
    const m = s.toLowerCase().replace(/(\d),(\d)/g, "$1.$2").match(/(\d+(?:\.\d+)?)\s*(?:[–-]\s*(\d+(?:\.\d+)?))?\s*(l|ml|kg|g)\b/)
    if (!m) return null
    const f = m[3] === "l" || m[3] === "kg" ? 1000 : 1
    const a = parseFloat(m[1]) * f, b = m[2] ? parseFloat(m[2]) * f : a
    return [Math.min(a, b), Math.max(a, b)]
}
/* Middle of the first number or range in a yield such as "8-10 small patties" (for how long a batch lasts). */
const midNum = (s: string) => {
    const m = s.replace(/[{}]/g, "").replace(/(\d),(\d)/g, "$1.$2").match(/(\d+(?:\.\d+)?)(?:\s*[–-]\s*(\d+(?:\.\d+)?))?/)
    return m ? (parseFloat(m[1]) + parseFloat(m[2] || m[1])) / 2 : 0
}
/* kcal per gram of the cooked dish, rounded to whole kcal per 100 g: the number the page shows ("100 g ≈ 154 kcal") is the one every amount uses */
const kpgOf = (tk: number, fw: number) => Math.round((tk / fw) * 100) / 100
const kpgC = (r: CRec) => (r.fw && r.tk ? kpgOf(r.tk, r.fw) : 0)
const kpgR = (r: Rec) => (r.fw && r.tk ? kpgOf(r.tk, r.fw) : 0)
const cMealOk = (r: CRec) => r.k === "m" && !!r.kc && !/\bbroth\b/i.test(r.t) && r.kc.p !== "pc" && kpgC(r) >= DAY_KCAL_G
const recMealOk = (r: Rec) => (r.kind === "topper" || r.kind === "bland") && !r.kc.pc && (kpgR(r) || r.kc.g || 0) >= DAY_KCAL_G
/* a light dish that people might cook as the whole day's food: kcal per gram known, but under the whole-day line */
const cLight = (r: CRec) => r.k === "m" && !!r.kc && !/\bbroth\b/i.test(r.t) && r.kc.p !== "pc" && kpgC(r) > 0 && !cMealOk(r)
const recLight = (r: Rec) => r.kind === "topper" && !r.kc.pc && kpgR(r) > 0 && !recMealOk(r)
/* Whole-day dishes from the recipe list that the scale on the home page shows and light dishes point to
   (copied from the recipe list, cat-v3): id -> [English title, Croatian title, photo, kcal of the whole recipe, cooked weight in g, allergens,
   minutes, number of ingredients, 1 when it goes in the oven] */
const DAYC: Record<number, [string, string, string, number, number, string[], number, number, number]> = {
    284: ["Chicken, Brown Rice & Egg Fried Rice", "Pržena riža s piletinom i jajetom", "09EMgjNzAIK8z7OMfr04jRpqLc.webp", 586, 370, ["chicken", "eggs", "grains"], 20, 5, 0],
    501: ["Turkey, Pumpkin & Brown Rice Meal", "Puretina s bundevom i smeđom rižom", "fE2nIXfHuMp3ESBiucoHxPjRhzU.webp", 1242, 930, ["turkey", "grains"], 40, 7, 0],
    533: ["Turkey & Green Bean Bowl", "Zdjela puretine i mahuna", "AhRPW2pp0xM9EGMedhUhDPHPHlc.webp", 704, 430, ["turkey"], 30, 2, 0],
    669: ["Salmon, Brown Rice & Veggie Meal", "Losos sa smeđom rižom i povrćem", "c4pkTFseyvqtZ5iZcqcjNe9jo.webp", 779, 420, ["fish", "grains"], 30, 5, 0],
    813: ["Beef, Pumpkin & Green Bean Bowl", "Zdjela govedine, bundeve i mahuna", "osAtgUArURNEff25FtGG0WHSQ7M.webp", 1926, 1220, ["beef"], 25, 6, 0],
    1033: ["Turkey, Sweet Potato & Pea Mash", "Pire od puretine, batata i graška", "2jeluUZ40M83wKwrHSNe48ZFM.webp", 1035, 660, ["turkey"], 30, 4, 0],
    1219: ["Sweet Potato & Chicken Meatloaf", "Mesna štruca od batata i piletine", "lrCxZnbfl2MCHraAVk0C8Zs.webp", 1484, 920, ["chicken", "turkey", "eggs", "grains"], 65, 7, 1],
    1306: ["Salmon & Sweet Potato Loaf", "Štruca od lososa i batata", "qvtIEfJ8TGtzCBSW2C1SO0NICM.png", 1347, 730, ["fish", "eggs", "grains"], 45, 7, 1],
    1639: ["Beef, Rice & Green Bean Casserole", "Složenac od govedine, riže i mahuna", "yQBESSfvxCRwqtP5JLRccsqNqU4.webp", 1506, 860, ["beef", "grains"], 60, 6, 1],
    2181: ["Turkey, Spinach, and Rice Loaf", "Štruca od puretine, špinata i riže", "iBf9RFqnaiEzSwPtuPEt38CKS9Y.webp", 1249, 820, ["turkey", "eggs", "grains", "dairy"], 65, 6, 1],
    2189: ["Beef, Spinach, and Sweet Potato Stew", "Varivo od govedine, špinata i batata", "dw99xAo8YrljJ9JUcDbwChq1Q.webp", 1099, 1000, ["beef"], 35, 6, 0],
    2352: ["Beef, Carrot & Brown Rice Meal", "Govedina s mrkvom i smeđom rižom", "drjCoYQHW6VFLPfyjtcCkMmb1Wc.webp", 1410, 1190, ["beef", "grains"], 30, 7, 0],
    2560: ["Beef, Apple, and Veggie Bowl", "Zdjela govedine, jabuke i povrća", "H6xZ8jD9fOAAw3jgELexNLagIXw.webp", 1027, 830, ["beef"], 20, 6, 0],
    2836: ["Batch-Prep Meal with Poultry, Beef & Fish", "Velika tura hrane od peradi, govedine i ribe", "FXcWrt0PtDjTmSApJau5rHC9lM.webp", 23164, 16150, ["chicken", "turkey", "fish", "eggs"], 90, 33, 1],
    2852: ["Turkey, Quinoa & Pumpkin Meal", "Puretina s kvinojom i bundevom", "XgGAYUgnpAb5P0DECuLkPgrl4.webp", 5938, 4070, ["turkey"], 40, 9, 0],
    3091: ["Hearty Beef & Veggie Meal", "Velika tura govedine i povrća", "Z6gxQ4rG3OwVPybFpcKh0gtgRvI.webp", 10370, 6980, ["beef", "grains"], 60, 8, 0],
    3102: ["Turkey, Pumpkin & Veggie Meatloaf", "Mesna štruca od puretine, bundeve i povrća", "Wgi7FDuD5yVlJpj959rcArAlBxo.webp", 1136, 850, ["turkey", "beef", "eggs", "grains"], 65, 10, 1],
    3535: ["Beef, Carrot & Oat Roll", "Rolada od govedine, mrkve i zobi", "0z1bPszABEjT8K4QCZEMq5xs9g.webp", 1399, 1040, ["beef", "eggs", "grains"], 30, 6, 0],
    3628: ["Chicken, Rice & Veggie Meal", "Piletina s rižom i povrćem", "7Xx8MQQIu3B16Ifh1SR26lhK2bE.jpg", 1889, 1340, ["chicken", "grains"], 50, 5, 0],
    3815: ["Turkey, Sweet Potato & Quinoa Meal Prep", "Puretina, batat i kvinoja za cijeli tjedan", "T8XGqa1Mm09DPI3juTa4ZpdDOMU.jpg", 5311, 4460, ["chicken", "turkey", "fish"], 50, 9, 0],
    4927: ["Chicken & Green Beans", "Piletina s mahunama", "YeByN39ky4UUpWa56MHsAxejk.jpg", 1438, 1170, ["chicken", "eggs", "grains"], 50, 7, 0],
    4941: ["Turkey, Rice & Liver Meal", "Puretina s rižom, jetrom i ljuskama jaja", "rnloYrEXSNaMW7058rINCRFcY0.jpg", 2375, 1540, ["turkey", "beef", "fish", "eggs", "grains"], 60, 8, 0],
}
const DAY_HOME = [4941, 3091, 3628, 669, 2852, 813]
/* the week's plan: five whole-day dishes without the oven (chicken, beef, turkey with liver, and two big batches: turkey and beef);
   when the dog can't have one, the next from the list */
const WPLAN_POOL = [3628, 813, 4941, 2852, 3091, 501, 4927, 2352, 1033, 2560, 2189, 1306, 669, 533, 284]
const WPLAN_DAYS = 7
/* Lighter dishes (soups, stews, mashes): whole-day dishes to cook instead, best first. The kind of dish comes first, then the meat and
   vegetables: soups and stews point to dishes cooked in one pot (stews, rice or quinoa simmered with meat and vegetables), mashes to the
   mash, never to a loaf, roll or bake (a soup and a meatloaf are not alike even with the same ingredients). */
const DAY_SWAP: Record<string, number[]> = {
    "turkey-apple": [501, 533, 4941, 1033],
    "salmon-sweet-potato": [669, 2836],
    "beef-sweet-potato": [2189, 2352, 813],
    "turkey-spinach": [3815, 2852, 1033],
    "chicken-oat": [3628, 4927, 284],
    3859: [2852, 501, 813],
    3805: [3815, 2852, 1033],
    3385: [2560, 669, 3628],
    3045: [1033, 3628, 4927],
    2997: [1033, 3628, 4927],
    2672: [2852, 501, 533],
    2635: [3628, 4927, 284],
    1567: [2189, 2352, 813, 3091],
    1435: [1033, 813, 2189],
    1351: [2189, 2352, 813],
    1086: [3628, 4927, 284],
    925: [2189, 813, 2352],
    877: [3628, 284, 1639],
    860: [3628, 2852, 4927],
    490: [3628, 2852, 4927],
    384: [3628, 4927, 284],
    2653: [669, 2836],
}
/* Recipes a day in words people use: ¼, ⅓, ½, ⅔, ¾, then 1, 1½, 2… */
const FRACS: [number, string][] = [[0.25, "¼"], [1 / 3, "⅓"], [0.5, "½"], [2 / 3, "⅔"], [0.75, "¾"], [1, "1"]]
const fracTxt = (f: number) => {
    if (f > 1.12) { const h = Math.round(f * 2) / 2; return (Math.floor(h) || "") + (h % 1 ? "½" : "") }
    let best = FRACS[0]
    for (const x of FRACS) if (Math.abs(x[0] - f) < Math.abs(best[0] - f)) best = x
    return best[1]
}
const KG_MIN = 1
/* Top of the scale for each age (0 puppy under 4 months, 1 puppy 4 months to adult, 2 adult).
   Under 4 months even the heaviest breeds, such as the English Mastiff, weigh about 25–36 kg.
   Giant breeds stay puppies until 18–24 months, and an English Mastiff can weigh 68–91 kg at a year, so 4+ months keeps 80 kg. */
const KG_MAXES = [35, 80, 80]
const kgMaxOf = (age: number) => KG_MAXES[age] || 80
const rerOf = (kg: number) => 70 * Math.pow(kg, 0.75)
const FAC: Record<string, [number, number]> = { n: [1.4, 1.6], i: [1.6, 1.8], l: [1.0, 1.2], a: [1.6, 2.0], p0: [3, 3], p1: [2, 2], w: [1, 1] }
const facKey = (d: Dog) => (d.age === 0 ? "p0" : d.age === 1 ? "p1" : d.lose ? "w" : d.act === 0 ? "l" : d.act === 2 ? "a" : d.neut ? "n" : "i")
const kcalRange = (d: Dog): [number, number] => {
    const r = rerOf(d.kg),
        [a, b] = FAC[facKey(d)]
    return [r * a, r * b]
}
const FRESH_KCAL_G = 1.2 // example: a fresh meal with 120 kcal per 100 g
const FOODS = [120, 360, 90] // examples only (kcal per 100 g): fresh, dry, wet
const rK = (v: number) => Math.round(v / 10) * 10
const rG = (v: number) => (v < 100 ? Math.round(v / 5) * 5 : Math.round(v / 10) * 10)
const fl5 = (v: number) => Math.floor(v / 5) * 5

/* All other recipes from mydogrecipe.com (used with permission), amounts converted to metric.
   Loaded only when the recipes page or one of these recipes is opened. */
const CAT_URL = "https://framerusercontent.com/assets/z9XCcHe2cNTUqWF0m7JZtSOSlJU.json"
const IMG_BASE = "https://framerusercontent.com/images/"
type CKc = { p: "ml" | "pc" | "batch"; a: number; k: number; w?: string; we?: [string, string]; s?: "u" }
type CRec = {
    id: number
    s: string
    t: string
    th: string
    img: string
    k: "t" | "m" | "b"
    g: string[]
    m: number | null
    y: string | null
    i: string[]
    p: string[]
    /* Croatian ingredients, steps and yield (translated line by line) */
    ih: string[]
    ph: string[]
    yh: string | null
    /* ingredients that aren't safe for dogs: warning key -> ingredient lines */
    w?: Record<string, number[]>
    al: string[]
    st: { fridge?: string; freezer?: string; room?: string }
    src: string
    kc: CKc | null
    kt: string
    /* finished weight of the whole recipe in grams (USDA cooked yields) and its kcal (USDA SR28) */
    fw?: number
    tk?: number
}
let catCache: CRec[] | null = null
let catLoad: Promise<CRec[]> | null = null
const loadCatalog = () =>
    catLoad ||
    (catLoad = fetch(CAT_URL)
        .then((r) => {
            if (!r.ok) throw new Error("HTTP " + r.status)
            return r.json()
        })
        .then((d: CRec[]) => (catCache = d))
        .catch((e) => {
            catLoad = null
            throw e
        }))
const cImg = (r: { img: string }, w = 512) => IMG_BASE + r.img + "?scale-down-to=" + w
const cId = (r: CRec) => "mdr-" + r.id
const PC_HR: Record<string, [string, string, string]> = {
    treat: ["poslastica", "poslastice", "poslastica"],
    chew: ["žvakalica", "žvakalice", "žvakalica"],
    biscuit: ["keks", "keksa", "keksa"],
    bite: ["zalogajčić", "zalogajčića", "zalogajčića"],
    muffin: ["muffin", "muffina", "muffina"],
    ball: ["kuglica", "kuglice", "kuglica"],
    scoop: ["kuglica", "kuglice", "kuglica"],
    stick: ["štapić", "štapića", "štapića"],
    slice: ["kriška", "kriške", "kriški"],
    cookie: ["kolačić", "kolačića", "kolačića"],
    cupcake: ["kolačić", "kolačića", "kolačića"],
    chip: ["komadić čipsa", "komadića čipsa", "komadića čipsa"],
    patty: ["pljeskavica", "pljeskavice", "pljeskavica"],
    burger: ["pljeskavica", "pljeskavice", "pljeskavica"],
    square: ["kockica", "kockice", "kockica"],
    cube: ["kockica", "kockice", "kockica"],
    donut: ["krafna", "krafne", "krafni"],
    piece: ["komad", "komada", "komada"],
    gummy: ["bombon", "bombona", "bombona"],
    pupsicle: ["lizalica", "lizalice", "lizalica"],
    pawsicle: ["lizalica", "lizalice", "lizalica"],
    popsicle: ["lizalica", "lizalice", "lizalica"],
    pop: ["lizalica", "lizalice", "lizalica"],
    bone: ["kost", "kosti", "kostiju"],
    pancake: ["palačinka", "palačinke", "palačinki"],
    meatball: ["okruglica", "okruglice", "okruglica"],
    serving: ["porcija", "porcije", "porcija"],
    bar: ["pločica", "pločice", "pločica"],
    twist: ["pletenica", "pletenice", "pletenica"],
    strip: ["traka", "trake", "traka"],
    jerky: ["traka", "trake", "traka"],
    drop: ["kapljica", "kapljice", "kapljica"],
    mold: ["smrznuta poslastica", "smrznute poslastice", "smrznutih poslastica"],
    cracker: ["kreker", "krekera", "krekera"],
    wafer: ["vafl", "vafla", "vafla"],
    cake: ["kolač", "kolača", "kolača"],
    fritter: ["uštipak", "uštipka", "uštipaka"],
    tart: ["pitica", "pitice", "pitica"],
    smoothie: ["smoothie", "smoothieja", "smoothieja"],
}
/* Croatian search words (shortened like the query) → English words in the original ingredient lists */
const SYN: Record<string, string> = {
    piletin: "chicken", puretin: "turkey", govedin: "beef", rib: "fish", loso: "salmon", jaj: "egg", bundev: "pumpkin", bata: "sweet potato",
    mrkv: "carrot", jabuk: "apple", borovnic: "blueberr", jagod: "strawberr", zob: "oat", riz: "rice", sir: "cheese", jogur: "yogurt",
    kikirik: "peanut", med: "honey", spina: "spinach", brokul: "broccoli", mahun: "green bean", tikvic: "zucchini", lubenic: "watermelon",
    koko: "coconut", cime: "cinnamon", kurkum: "turmeric", krumpi: "potato", grasa: "pea", jetric: "liver", slanin: "bacon", krusk: "pear",
    malin: "raspberr", kupin: "blackberr", anana: "pineapple", metvic: "mint", persi: "parsley", dumbi: "ginger", smrznut: "frozen", keks: "biscuit",
}
const timeTxt = (r: Rec, lang: Lang) => {
    if (r.time) return r.time[lang]
    if (r.min < 60) return r.min + " min"
    const h = Math.floor(r.min / 60),
        m = r.min % 60
    return h + " h" + (m ? " " + m + " min" : "")
}
const ingCount = (r: Rec, lang: Lang) => {
    const n = r.ing.length
    return n + " " + pl(lang, n, ["ingredient", "ingredients"], ["sastojak", "sastojka", "sastojaka"])
}
const WD = { en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], hr: ["ned", "pon", "uto", "sri", "čet", "pet", "sub"] }
const MO = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
const dayParts = (d: Date, lang: Lang): [string, string] => (lang === "en" ? [WD.en[d.getDay()], d.getDate() + " " + MO[d.getMonth()]] : [WD.hr[d.getDay()], d.getDate() + ". " + (d.getMonth() + 1) + "."])
const nextDays = (now: Date) => {
    const out: Date[] = []
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    d.setDate(d.getDate() + 2)
    while (out.length < 4) {
        const w = d.getDay()
        if (w === 1 || w === 3 || w === 5) out.push(new Date(d))
        d.setDate(d.getDate() + 1)
    }
    return out
}
const parseHash = (h: string): Page | null => {
    if (!h.startsWith("#/")) return null
    const s = h.slice(2)
    if (s === "" || s === "home") return { p: "home" }
    if (s === "recipes") return { p: "recipes" }
    if (s === "order") return { p: "order" }
    if (s === "build" || s === "slozi") return { p: "build" }
    if (s === "list" || s === "popis") return { p: "list" }
    if (s === "plan" || s === "tjedan" || s === "plan-za-tjedan") return { p: "plan" }
    if (s === "dog" || s === "moj-pas" || s === "pets" || s === "ljubimci") return { p: "dog" }
    if (s === "plus") return { p: "plus" }
    if (s === "racun" || s === "account" || s === "prijava" || s === "login") return { p: "acct" }
    if (s === "privatnost" || s === "privacy") return { p: "privacy" }
    if (s.startsWith("recipe/")) {
        const id = s.slice(7)
        return RECIPES.some((r) => r.id === id) || /^mdr-\d+$/.test(id) ? { p: "recipe", id } : { p: "recipes" }
    }
    return null
}
const toHash = (pg: Page) => (pg.p === "home" ? "#/" : pg.p === "recipe" ? "#/recipe/" + pg.id : pg.p === "dog" ? "#/pets" : pg.p === "acct" ? "#/racun" : pg.p === "privacy" ? "#/privatnost" : "#/" + pg.p)
const SEARCH_IDX: Record<string, string> = Object.fromEntries(
    RECIPES.map((r) => [r.id, norm([r.t.en, r.t.hr, ...r.ing.map((i) => plain(i.n.en) + " " + plain(i.n.hr))].join(" "))])
)

function useTween(v: number) {
    const [shown, setShown] = useState(v)
    const cur = useRef(v)
    useEffect(() => {
        const from = cur.current,
            to = v
        if (from === to) return
        const reduce = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches
        if (reduce || typeof requestAnimationFrame === "undefined") {
            cur.current = to
            setShown(to)
            return
        }
        let raf = 0
        const t0 = performance.now()
        const tick = (t: number) => {
            const p = Math.min(1, (t - t0) / 260),
                e = 1 - Math.pow(1 - p, 3)
            cur.current = from + (to - from) * e
            setShown(cur.current)
            if (p < 1) raf = requestAnimationFrame(tick)
        }
        raf = requestAnimationFrame(tick)
        return () => cancelAnimationFrame(raf)
    }, [v])
    return shown
}
function Num({ v, lang, d = 0 }: { v: number; lang: Lang; d?: number }) {
    const s = useTween(v)
    return <>{nf(d ? s : Math.round(s), lang, d)}</>
}

/* ------------------------------------------------------------------- art */

const shade = (hex: string, amt: number) => {
    const n = parseInt(hex.slice(1), 16)
    const f = (c: number) => Math.round(c * (1 - amt))
    return "#" + ((1 << 24) + (f(n >> 16) << 16) + (f((n >> 8) & 255) << 8) + f(n & 255)).toString(16).slice(1)
}
const POUCH_D = "M22 22 H178 L186 258 Q187 284 161 284 H39 Q13 284 14 258 Z"
function PouchArt({ p, lang, size, w = 120, uid }: { p: Pouch; lang: Lang; size: string; w?: number; uid: string }) {
    return (
        <svg viewBox="0 0 200 290" width={w} height={Math.round(w * 1.45)} aria-hidden="true" style={{ overflow: "visible", display: "block", margin: "0 auto" }}>
            <defs>
                <linearGradient id={uid + "g"} x1="0" x2="1">
                    <stop offset="0" stopColor="#fff" stopOpacity=".26" />
                    <stop offset=".28" stopColor="#fff" stopOpacity=".05" />
                    <stop offset=".72" stopColor="#000" stopOpacity="0" />
                    <stop offset="1" stopColor="#000" stopOpacity=".16" />
                </linearGradient>
                <linearGradient id={uid + "v"} x1="0" y1="0" x2="0" y2="1">
                    <stop offset=".8" stopColor="#000" stopOpacity="0" />
                    <stop offset="1" stopColor="#000" stopOpacity=".14" />
                </linearGradient>
                <filter id={uid + "s"} x="-30%" y="-20%" width="160%" height="150%">
                    <feDropShadow dx="0" dy="14" stdDeviation="11" floodColor="#4a3418" floodOpacity=".22" />
                </filter>
            </defs>
            <path d={POUCH_D} fill={p.c} filter={`url(#${uid}s)`} />
            <path d={POUCH_D} fill={`url(#${uid}g)`} />
            <path d={POUCH_D} fill={`url(#${uid}v)`} />
            <path d="M18 4 H182 L180 30 H20 Z" fill={shade(p.c, 0.12)} />
            <path d="M20 30 H180" stroke="#000" strokeOpacity=".12" strokeWidth="2" />
            <path d="M30 12 H170" stroke="#fff" strokeOpacity=".35" strokeWidth="1.5" strokeDasharray="3 4" />
            <rect x="36" y="56" width="128" height="176" rx="16" fill="#fff" fillOpacity=".12" />
            <image href={ART.wmW} x="44" y="70" width="112" height="45" />
            <text x="100" y="140" fontFamily="FzHand, cursive" fontWeight="700" fontSize="24" fill="#fff" fillOpacity=".92" textAnchor="middle">
                {T.word[lang]}
            </text>
            <text x="100" y="174" fontFamily="FzInter, Inter, sans-serif" fontWeight="700" fontSize="16" fill="#fff" textAnchor="middle">
                {p.l1[lang]}
            </text>
            <text x="100" y="194" fontFamily="FzInter, Inter, sans-serif" fontWeight="700" fontSize="16" fill="#fff" textAnchor="middle">
                {p.l2[lang]}
            </text>
            <text x="100" y="217" fontFamily="FzInter, Inter, sans-serif" fontWeight="500" fontSize="11.5" fill="#fff" fillOpacity=".85" textAnchor="middle">
                {size}
            </text>
        </svg>
    )
}
const Paw = ({ s = 56 }: { s?: number }) => (
    <svg width={s} height={s * 0.92} viewBox="0 0 100 92" aria-hidden="true" style={{ display: "block" }}>
        <g fill="currentColor">
            <path d="M50 48c-15 0-29 15-29 27 0 9 7 14 15 14 6 0 9-3 14-3s8 3 14 3c8 0 15-5 15-14 0-12-14-27-29-27z" />
            <ellipse cx="17" cy="40" rx="9" ry="12" transform="rotate(-22 17 40)" />
            <ellipse cx="37" cy="20" rx="9.5" ry="12.5" transform="rotate(-8 37 20)" />
            <ellipse cx="63" cy="20" rx="9.5" ry="12.5" transform="rotate(8 63 20)" />
            <ellipse cx="83" cy="40" rx="9" ry="12" transform="rotate(22 83 40)" />
        </g>
    </svg>
)
const HandArrow = ({ w = 52, down = false }: { w?: number; down?: boolean }) => (
    <svg width={w} height={w * 0.5} viewBox="0 0 48 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ display: "inline-block", verticalAlign: "middle", transform: down ? "rotate(90deg)" : undefined }}>
        <path d="M3 15c9-6 22-9 39-6" />
        <path d="M35 3l8 6-7 7" />
    </svg>
)
const Ico = ({ d, s = 18, w = 2 }: { d: string; s?: number; w?: number }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flex: "none" }}>
        <path d={d} />
    </svg>
)
const I = {
    clock: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2",
    list: "M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01",
    scale: "M4 10h16v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5zM2 10h20M9 6.5c0-1 1-1.5 1-2.5M14 6.5c0-1 1-1.5 1-2.5",
    search: "M10.5 18a7.5 7.5 0 1 0 0-15 7.5 7.5 0 0 0 0 15zM16 16l5 5",
    x: "M6 6l12 12M18 6L6 18",
    print: "M7 9V3h10v6M7 17H4v-7a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v7h-3M7 14h10v7H7z",
    left: "M15 5l-7 7 7 7",
    right: "M9 5l7 7-7 7",
    down: "M5 9l7 7 7-7",
    menu: "M4 7h16M4 12h16M4 17h16",
    check: "M5 12.5l4.5 4.5L19 7",
    snow: "M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9",
    fridge: "M7 3h10a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM6 10h12M9 6v2M9 13v3",
    ext: "M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5",
    box: "M3 8l9-5 9 5v9l-9 5-9-5zM3 8l9 5 9-5M12 13v9",
    ban: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM5.6 5.6l12.8 12.8",
    cart: "M3 4h2.2l2.3 11h10.3l2.2-8H6.6M9.5 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2zM17 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2z",
    share: "M12 15V3M8 7l4-4 4 4M5 12v7a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-7",
    copy: "M9 9h10a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V10a1 1 0 0 1 1-1zM5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1",
    trash: "M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3",
    warn: "M12 3l10 18H2zM12 10v5M12 18h.01",
}

/* Ingredient pictures: Fluent Emoji Flat, Copyright (c) Microsoft Corporation, MIT License, https://github.com/microsoft/fluentui-emoji
   (Bundeva is the jack-o-lantern without the face.) MIT License: Permission is hereby granted, free of charge, to any person obtaining a copy
   of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation
   the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the
   Software is furnished to do so, subject to the following conditions: The above copyright notice and this permission notice shall be included in all
   copies or substantial portions of the Software. THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT
   NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
   HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
   CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE. */
const EM: Record<string, string> = {
    "poultry-leg": "<svg viewBox=\"0 0 32 32\" aria-hidden=\"true\"><g fill=\"none\"><path fill=\"#d3d3d3\" d=\"M2.987 10.459c1.07.94 2.71.94 3.79 0c.21-.19.53-.19.73.01l5.94 5.89l2.95-2.98l-5.94-5.89c-.2-.2-.21-.52-.02-.73a2.9 2.9 0 0 0-.03-3.79a2.885 2.885 0 0 0-5.04 1.88c0 .3-.25.55-.55.55c-.72.01-1.45.3-2 .85c-1.14 1.18-1.09 3.11.17 4.21\"/><path fill=\"#d3883e\" d=\"M15.067 27.459c3.51 3.48 9.21 3.41 12.63-.2c3.26-3.45 3.19-8.93-.16-12.3a8.82 8.82 0 0 0-7.9-2.44c-1.13.21-2.29-.12-3.11-.93l-1.66-1.65c-.93-.93-2.44-.92-3.36.01l-1.53 1.54c-.93.93-.92 2.44.01 3.36l1.62 1.61c.84.83 1.19 2.02.98 3.18c-.48 2.76.34 5.7 2.48 7.82\"/><path fill=\"#a56953\" d=\"M23.667 16.759a1.2 1.2 0 1 0 0-2.4a1.2 1.2 0 0 0 0 2.4m2.84 5.649a1.95 1.95 0 1 0 0-3.9a1.95 1.95 0 0 0 0 3.9m-2.98-3.39a.86.86 0 1 1-1.72 0a.86.86 0 0 1 1.72 0\" opacity=\".7\"/></g></svg>",
    "turkey": "<svg viewBox=\"0 0 32 32\" aria-hidden=\"true\"><g fill=\"none\"><path fill=\"#9b9b9b\" d=\"m11.79 29l.6-4.312h1.641L13.384 29h2.39l.601-4.312h1.64L17.37 29h1.537c.389 0 .945.218 1.08.745c.034.133-.082.247-.22.247h-11.5c-.138 0-.254-.113-.229-.249c.076-.413.361-.743 1.01-.743z\"/><path fill=\"#f3ad61\" d=\"M27.703 2h.594a1.703 1.703 0 0 1 .559 3.313a1.704 1.704 0 0 1-.56 3.312a1.703 1.703 0 0 1 .661 3.273a1.704 1.704 0 0 1-.262 3.227a1.704 1.704 0 0 1 .137 3.273a1.704 1.704 0 0 1-.535 3.32h.062a1.64 1.64 0 1 1 0 3.282h-4.14v-3.281h3.062v-16.5h.422z\"/><path fill=\"#f70a8d\" d=\"M2.031 14.594V18.5h3.266l2.937-9.281c.516-1.39 1.063-4.203-1.609-4.203c-2.281 0-1.776 2.817-1.234 4.203c.453 1.156.484 2.64-.766 2.797c-2.109.263-2.583 1.713-2.594 2.578\"/><path fill=\"#f9c23c\" d=\"M2.88 7.145L4.5 5.953v2.813l-1.622-1.22a.25.25 0 0 1 .002-.401\"/><path fill=\"#ff6dc6\" d=\"M4.297 6.078a.5.5 0 1 1 1 0V9.5a.5.5 0 0 1-1 0z\"/><path fill=\"#1c1c1c\" d=\"M7.031 6.523a.5.5 0 1 1-1 0a.5.5 0 0 1 1 0\"/><path fill=\"#6d4534\" d=\"M8.091 25C6.04 24.854 2 23.571 2 18.077c0-3.073 2.355-4.741 4.663-5.934c.693-.359.867-.565 1.02-.99C8.543 8.762 11.671 5 17.04 5c1.085 0 2.097.186 3.033.518c.333-1.232 1.713-2.174 2.385-2.61C23.595 2.172 25.608 2 28 2v17.266c0 .822-.08 1.77-.291 2.656c-.302 1.417-.91 2.598-2.134 2.962q-.35.114-.769.116z\"/><path fill=\"#d3883e\" d=\"M21.852 16.564a278 278 0 0 1 4.653 4.36c1.206 1.204.873 2.37.568 2.848C26.52 24.638 25.56 25 25.118 25h-8.921q-.365 0-.74-.015z\"/><path fill=\"#a56953\" d=\"M21.853 16.563a120 120 0 0 0-2.788-2.485C17.061 12.363 15.015 12 14.085 12C9.418 12 8 16.375 8 17.95c0 5.676 4.025 6.896 7.456 7.035a7 7 0 0 0 6.397-8.422\"/></g></svg>",
    "cut-of-meat": "<svg viewBox=\"0 0 32 32\" aria-hidden=\"true\"><g fill=\"none\"><path fill=\"#fbb8ab\" d=\"M27.813 16.775c-.9.91-1.46 2.11-1.57 3.38c-.22 2.54-1.33 4.93-3.13 6.73c-4.16 4.15-10.92 4.15-15.07 0l-3.15-3.15l1.6-1.59c-.39-3.15.62-6.45 3.03-8.86c1.8-1.8 4.19-2.91 6.73-3.13a5 5 0 0 0 .235-.026a3.53 3.53 0 0 1 .882-3.532a3.55 3.55 0 0 1 4.831-.17l2.642-2.642l3.15 3.15c2.66 2.66 2.66 7 0 9.66z\"/><path fill=\"#f4f4f4\" fill-rule=\"evenodd\" d=\"M24.873 13.835c-.9.91-1.46 2.11-1.57 3.38a10.9 10.9 0 0 1-3.12 6.74c-4.16 4.15-10.92 4.16-15.07 0s-4.15-10.92 0-15.07c1.8-1.8 4.19-2.91 6.72-3.14a5.47 5.47 0 0 0 3.38-1.57l.18-.18c2.66-2.66 7-2.66 9.66 0s2.66 7 0 9.66zm-6.21-5.95c-.67.67-.67 1.75 0 2.42s1.76.67 2.43.01c.67-.67.67-1.76 0-2.43a1.72 1.72 0 0 0-2.43 0\" clip-rule=\"evenodd\"/><path fill=\"#f8312f\" d=\"M7.676 8.794c-.656.52-.557 1.578.226 1.941l4.92 2.33q.008.001.016.005t.014.005c.97.45 2.11.28 2.87-.48l.74-.74c.47-.47.65-1.16.46-1.79a3.14 3.14 0 0 1 .78-3.12a3.11 3.11 0 0 1 4.55.15c1.03 1.16 1.03 2.94 0 4.11c-.85.96-2.13 1.27-3.25.93a1.79 1.79 0 0 0-1.8.45l-.73.73c-.76.76-.93 1.91-.47 2.88q0 .007.006.01q.004.003.005.01l2.34 4.91a1.148 1.148 0 0 0 1.91.256a9.3 9.3 0 0 0 1.49-4.296c.14-1.64.86-3.18 2.02-4.35l.18-.18a5.26 5.26 0 0 0 1.544-3.804a5.25 5.25 0 0 0-1.851-3.93c-2.084-1.772-5.228-1.618-7.19.33l-.133.134a7 7 0 0 1-4.35 2.02a9.3 9.3 0 0 0-4.297 1.489\"/><path fill=\"#f8312f\" d=\"M4.948 11.566c.318-.47.929-.635 1.444-.401l6.01 2.82c1.17.55 2.12 1.5 2.68 2.66l2.85 5.98c.25.53.06 1.16-.43 1.47a9 9 0 0 1-3.019 1.225a9.09 9.09 0 0 1-8.27-2.475c-3.062-3.061-3.483-7.766-1.265-11.28\"/></g></svg>",
    "fish": "<svg viewBox=\"0 0 32 32\" aria-hidden=\"true\"><g fill=\"none\"><path fill=\"#00a6ed\" d=\"M16.406 5.866c-2.686 0-3.792 2.517-3.842 4.822h-.908a8.66 8.66 0 0 0-8.315 6.242a1.055 1.055 0 0 0-.622 2.015a1.055 1.055 0 0 0 .438 2.05a8.66 8.66 0 0 0 8.5 7.005h1.783c.036.965.51 1.997 1.631 1.997h2.205c.106.018.308-.046.265-.45c-.043-.407-.231-1.236-1.233-1.547h.036a8.66 8.66 0 0 0 8.578-7.488v4.176c0 2.25 4.922 4.625 4.922 2.437v-4.5c0-1.205-2.039-3.26-3.304-3.281c1.265-.021 3.304-2.076 3.304-3.282v-4.5c0-2.187-4.922.188-4.922 2.438v4.176a8.66 8.66 0 0 0-7.03-7.35c3.617-.276 4.209-2.776 4.327-3.9c.1-.95-.375-1.103-.625-1.06z\"/><path fill=\"#0074ba\" d=\"M11.726 13.804a.5.5 0 0 1 .704-.062c3.05 2.555 3.211 7.049.043 10.398a.5.5 0 1 1-.727-.687c2.832-2.994 2.587-6.812.042-8.945a.5.5 0 0 1-.062-.704\"/><path fill=\"#1c1c1c\" d=\"M9.078 17.5a.61.61 0 1 1-1.219 0a.61.61 0 0 1 1.22 0\"/></g></svg>",
    "egg": "<svg viewBox=\"0 0 32 32\" aria-hidden=\"true\"><path fill=\"#f3ad61\" d=\"M16.331 2c-2.57 0-4.98 1.28-6.42 3.4l-.13.19A21.92 21.92 0 0 0 6.101 20l.08.8c.5 5.21 4.88 9.18 10.11 9.18c5.25 0 9.63-3.99 10.11-9.22l.09-.93a21.9 21.9 0 0 0-3.78-14.48A7.77 7.77 0 0 0 16.331 2\"/></svg>",
    "cooked-rice": "<svg viewBox=\"0 0 32 32\" aria-hidden=\"true\"><g fill=\"none\"><path fill=\"#f8312f\" d=\"M18.65 30.008h-5.39c-6.21 0-11.25-5.04-11.25-11.25v-5.26H29.9v5.26c0 6.21-5.04 11.25-11.25 11.25\"/><path fill=\"#ca0b4a\" d=\"M21.92 7.728c3.18 0 5.77 2.59 5.77 5.77s-2.59 5.77-5.77 5.77H9.98c-3.18 0-5.77-2.59-5.77-5.77s2.59-5.77 5.77-5.77zm0-2.21H9.98c-4.41 0-7.98 3.57-7.98 7.98s3.57 7.98 7.98 7.98h11.93c4.41 0 7.98-3.57 7.98-7.98c.01-4.4-3.57-7.98-7.97-7.98\"/><path fill=\"#bebebe\" d=\"m4.234 12.283l-.018-.169c-.02-.193-.052-.39-.088-.613l-.011-.066c-.088-.54-.21-1.281-.005-2l.1-.367c.133-.499.2-.749.347-.896l-.002-.008c.147-.188.269-.357.367-.526c.157-.274.282-.59.439-.995l.026-.068c.225-.584.535-1.386 1.144-1.994c.6-.6 1.387-.91 1.958-1.134l.067-.026c.412-.162.729-.29.997-.45l.008-.005l.007-.004c.26-.15.518-.356.85-.626l.057-.046c.488-.395 1.165-.944 2.015-1.168c.815-.221 1.656-.09 2.267.005l.075.012c.434.067.78.119 1.106.119s.672-.052 1.106-.12l.075-.01c.611-.096 1.452-.227 2.267-.006c.85.224 1.527.773 2.015 1.168l.056.046c.333.27.59.475.85.625c.274.158.591.283.995.44l.069.026c.583.225 1.385.535 1.994 1.144c.607.606.916 1.409 1.14 1.99l.027.068c.158.409.283.726.44.995l.002.003c.117.203.267.403.454.639v.004c.258.383.267.415.355.766c.026.099.058.224.103.39c.204.719.083 1.46-.005 2l-.01.066c-.038.226-.07.426-.09.62l-.016.157C27.633 15.451 24.88 18 21.517 18H10.483c-3.359 0-6.109-2.543-6.25-5.717\"/><path fill=\"#f4f4f4\" d=\"M27.81 12.739c-.038.252-.078.505-.103.757h-.017v.002c0 3.18-2.59 5.77-5.77 5.77H9.98c-3.18 0-5.77-2.59-5.77-5.77v-.002h-.018a14 14 0 0 0-.103-.747c-.103-.667-.205-1.324-.039-1.931c.168-.64.599-1.173 1.026-1.7c.26-.321.517-.64.714-.98c.203-.352.354-.743.505-1.134c.245-.63.488-1.26.945-1.716c.45-.45 1.067-.694 1.684-.937c.397-.156.794-.312 1.146-.523c.34-.197.66-.455.98-.715c.527-.427 1.06-.857 1.7-1.025c.608-.166 1.265-.064 1.931.04c.42.064.842.13 1.259.13s.84-.066 1.259-.13c.666-.104 1.323-.206 1.931-.04c.64.168 1.173.598 1.7 1.025c.32.26.64.518.98.715c.352.202.743.354 1.134.505c.63.244 1.259.488 1.716.945c.455.455.698 1.084.942 1.712c.152.394.304.787.508 1.138c.197.34.455.659.715.98c.426.527.857 1.06 1.025 1.7c.166.607.064 1.264-.04 1.93\"/><path fill=\"#bebebe\" d=\"m15.05 4.478l.95 1.64c.21.37.09.83-.28 1.04s-.83.08-1.04-.28l-.95-1.64a.764.764 0 0 1 .28-1.04c.37-.21.83-.08 1.04.28m4.35 3.45l.35-1.86c.08-.41.48-.68.89-.61c.42.08.69.48.61.89l-.35 1.86a.76.76 0 0 1-.89.61a.76.76 0 0 1-.61-.89m-6.48 4.71l-.77-1.73c-.17-.39 0-.83.38-1s.83 0 1 .38l.77 1.73c.17.38 0 .83-.38 1s-.83 0-1-.38m-3.69 4.36l.35-1.86a.75.75 0 0 1 .89-.61c.42.08.69.48.61.89l-.35 1.86a.76.76 0 0 1-.89.61a.76.76 0 0 1-.61-.89m-1.41-5.54l-1.68.88a.75.75 0 0 0-.32 1.02c.19.37.65.52 1.02.32l1.68-.88a.75.75 0 0 0 .32-1.02a.76.76 0 0 0-1.02-.32m1.22-5.09l-1.13 1.52c-.25.34-.18.81.16 1.06s.81.18 1.06-.16l1.13-1.52c.25-.34.18-.81-.16-1.06a.755.755 0 0 0-1.06.16m5.89 10.2l1.13-1.52c.25-.33.72-.4 1.06-.16c.34.25.41.72.16 1.06l-1.13 1.52c-.25.34-.72.41-1.06.16a.754.754 0 0 1-.16-1.06m8.59-5.56l1.23 1.44a.76.76 0 0 0 1.16-.98l-1.23-1.44a.76.76 0 0 0-1.16.98m.52 5.54l-.95-1.64a.764.764 0 0 0-1.04-.28c-.36.21-.49.67-.28 1.04l.95 1.64c.21.36.67.49 1.04.28c.36-.21.49-.67.28-1.04m-5.56-6l1.74.75c.38.16.56.61.4 1c-.17.39-.62.57-1 .4l-1.74-.75a.76.76 0 0 1-.4-1c.17-.39.62-.57 1-.4\"/></g></svg>",
    "sheaf-of-rice": "<svg viewBox=\"0 0 32 32\" aria-hidden=\"true\"><g fill=\"none\"><path fill=\"#44911b\" d=\"M13.26 30h.49c.14 0 .25-.11.25-.26V11h-1v14h-2v-7.01c0-2.05-1.54-3.74-3.53-3.97a.416.416 0 0 0-.47.41v7.55c0 2.21 1.79 4 4 4h2v3.76c0 .15.11.26.26.26M16 16h1v13h2.03v-4.14c0-2.05 1.54-3.74 3.53-3.97c.25-.03.47.16.47.41V26c0 2.21-1.79 4-4 4h-2.7c-.18 0-.33-.15-.33-.33z\"/><path fill=\"#f9c23c\" d=\"M18.23 8c.41 0 .76.32.77.74s-.33.76-.75.76h-3.06c-.52 0-.94.42-.94.94v1.8c0 .42-.34.76-.76.75c-.42 0-.74-.36-.74-.77V6.06c0-2.24 1.82-4.06 4.06-4.06h4.44c.42 0 .76.34.75.76c0 .42-.36.74-.77.74h-4.4c-.42 0-.76.34-.75.76s.36.74.77.74h3.4c.42 0 .76.34.75.76c0 .42-.36.74-.77.74h-4.4c-.42 0-.76.34-.75.76s.36.74.77.74zm3 9c.41 0 .76.32.78.73c.01.42-.33.76-.75.76H18.2c-.52 0-.94.42-.94.94v1.81c0 .42-.34.76-.76.75c-.42 0-.74-.36-.74-.77v-6.16c0-2.24 1.82-4.06 4.06-4.06h4.43c.42 0 .76.34.75.76c0 .42-.36.74-.77.74h-4.21c-.42 0-.76.34-.75.76c0 .42.36.74.77.74h3.21c.42 0 .76.34.75.76c0 .42-.36.74-.77.74h-4.21c-.42 0-.76.34-.75.76c0 .42.36.74.77.74z\"/></g></svg>",
    "roasted-sweet-potato": "<svg viewBox=\"0 0 32 32\" aria-hidden=\"true\"><g fill=\"none\"><path fill=\"#f92f60\" d=\"M24.271 10.725c-1.948-3.241-6.157-6.112-8.018-7.142C11.482 6.841 2.157 13.85 3.03 15.82c1.092 2.464 4.702 6.515 7.724 8.645s9.99 4.51 12.803 5.178s4.576.418 5.751-.919s.63-3.34 0-5.972c-.63-2.63-2.602-7.976-5.037-12.027\"/><path fill=\"#ca0b4a\" d=\"M28.443 19.877c-.09.918-.41 1.814-.81 2.599c-.477.938-1.05 1.686-1.422 2.078a.416.416 0 0 0 .018.59a.42.42 0 0 0 .593-.017c.427-.45 1.047-1.264 1.56-2.274c.217-.426.417-.893.576-1.386a41 41 0 0 0-.515-1.59M13.44 25.986a12.9 12.9 0 0 0 3.947-1.165c1.69-.82 2.937-1.937 3.536-3.015a.416.416 0 0 0-.164-.568a.42.42 0 0 0-.57.164c-.492.885-1.585 1.898-3.17 2.67c-1.353.657-3.045 1.128-4.979 1.19c.434.242.904.484 1.4.723m9.752-16.768c.326.394.626.798.892 1.208c.002.409-.012.837-.047 1.273c-.111 1.395-.442 2.915-1.223 4.064a.42.42 0 0 1-.583.111a.416.416 0 0 1-.113-.58c.663-.973.976-2.324 1.082-3.661c.07-.876.05-1.724-.008-2.415\"/><path fill=\"#ff822d\" d=\"M17.408 18.242c-5.952 4.978-11.103 1.524-13.832-1.483C1.792 14.254.575 7.342 5.36 3.917c4.786-3.424 9.361-1.607 12.048.397s5.667 9.188 0 13.928\"/></g></svg>",
    "potato": "<svg viewBox=\"0 0 32 32\" aria-hidden=\"true\"><g fill=\"none\"><path fill=\"#f3ad61\" d=\"M23.257 2.926c-4.2-1.98-9.22-.7-11.96 3.04l-5.24 7.14c-3.95 5.38-2 13.03 4.04 15.87c5.33 2.51 11.67.19 14.14-5.15l3.71-8.04c2.23-4.84.14-10.58-4.69-12.86\"/><path fill=\"#d3883e\" d=\"M21.367 6.546a1.4 1.4 0 1 1-2.8 0a1.4 1.4 0 0 1 2.8 0m-2.87 8.78a1.83 1.83 0 1 0 0-3.66a1.83 1.83 0 0 0 0 3.66m-8.5 5.36a1.68 1.68 0 1 0 0-3.36a1.68 1.68 0 0 0 0 3.36m2.47 3.19a1.16 1.16 0 1 1-2.32 0a1.16 1.16 0 0 1 2.32 0m12.03-8.06a1.16 1.16 0 1 0 0-2.32a1.16 1.16 0 0 0 0 2.32\"/></g></svg>",
    "pumpkin": "<svg viewBox=\"0 0 32 32\" aria-hidden=\"true\"><g fill=\"none\"><path fill=\"#86d72f\" d=\"M13.743 8h3.507c.407 0 .75-.272.75-.614V4.612c0-.535-.793-.816-1.265-.439l-3.506 2.783c-.483.377-.15 1.044.514 1.044\"/><path fill=\"#ff8257\" d=\"M21.438 29h-10.87c-5.718 0-9.83-5.574-8.215-11.137l1.344-4.628C4.77 9.543 8.11 7 11.91 7h8.234c3.83 0 7.2 2.583 8.243 6.337l1.284 4.627C31.216 23.508 27.115 29 21.438 29\"/><path d=\"M12.6 10.2c-1.9 4.6-1.9 12.6.4 17.6M19.4 10.2c1.9 4.6 1.9 12.6-.4 17.6\" stroke=\"#e8653d\" stroke-width=\"1.1\" stroke-linecap=\"round\" fill=\"none\"/></g></svg>",
    "carrot": "<svg viewBox=\"0 0 32 32\" aria-hidden=\"true\"><g fill=\"none\"><path fill=\"#00d26a\" d=\"m28.902 8.361l-.01.01a3.733 3.733 0 0 1-.24 5.01a3.72 3.72 0 0 1-5.27 0a3.72 3.72 0 0 1-1.078-2.278L20.5 12.908l-1.415-1.414l1.746-1.745a3.7 3.7 0 0 1-2.139-1.058a3.72 3.72 0 0 1 0-5.27a3.73 3.73 0 0 1 4.92-.31l.02-.02c1.45-1.46 3.81-1.45 5.27 0a3.72 3.72 0 0 1 0 5.27\"/><path fill=\"#ff822d\" d=\"m4.642 29.891l15.75-5.1c4.51-1.46 5.88-7.17 2.53-10.52l-5.2-5.2c-3.35-3.35-9.06-1.97-10.52 2.53l-5.1 15.75c-.51 1.57.97 3.05 2.54 2.54\"/><path fill=\"#ff6723\" d=\"M12.373 19.411c.49-.49.49-1.28 0-1.78l-5.38-5.38l-.87 2.68l4.47 4.47c.49.5 1.29.5 1.78.01m-3.78 4.55c-.49.49-.49 1.28 0 1.78l2.17 2.17l2.68-.87l-3.08-3.08a1.25 1.25 0 0 0-1.77 0m7.66-4.98c-.49-.5-.49-1.29 0-1.78s1.28-.49 1.78.01l5.43 5.43c-.5.66-1.14 1.22-1.9 1.65z\"/></g></svg>",
    "leafy-green": "<svg viewBox=\"0 0 32 32\" aria-hidden=\"true\"><g fill=\"none\"><path fill=\"#008463\" d=\"M12.122 5.389c-2.59-1.35-5.81-.41-7.24 2.16c-.9 1.62-.89 3.51-.11 5.05c-.84.39-1.56 1.04-2.04 1.9a4.57 4.57 0 0 0-.13 4.22c.8 1.68.79 3.64-.12 5.26a3.794 3.794 0 0 0 .83 4.72a3.794 3.794 0 0 0 4.72.83c1.62-.91 3.58-.92 5.26-.12c1.3.62 2.87.63 4.22-.13c.86-.48 1.51-1.2 1.9-2.04c1.54.78 3.43.79 5.05-.11c2.57-1.43 3.51-4.65 2.16-7.24c.48-.13.96-.34 1.4-.64a4.58 4.58 0 0 0 1.55-5.73a4.575 4.575 0 0 0-7.28-1.37a5.4 5.4 0 0 0-1.105-1.325a5.4 5.4 0 0 0-1.325-1.105a4.575 4.575 0 0 0-1.37-7.28a4.58 4.58 0 0 0-5.73 1.55c-.3.44-.51.92-.64 1.4\"/><path fill=\"#86d72f\" d=\"M23.962 22.069a5.413 5.413 0 0 0 .1-7.55c.43-.26.83-.59 1.17-1c1.43-1.71 1.4-4.25-.07-5.93a4.573 4.573 0 0 0-6.68-.23c-.27.27-.5.57-.69.89a5.413 5.413 0 0 0-7.55.1a5.4 5.4 0 0 0-1.49 4.82c-.91.15-1.78.58-2.48 1.28a4.52 4.52 0 0 0-1.27 4.01c.32 1.83-.23 3.71-1.54 5.03a3.79 3.79 0 0 0 5.36 5.36c1.32-1.32 3.19-1.86 5.03-1.54a4.56 4.56 0 0 0 4.02-1.27c.7-.7 1.12-1.57 1.28-2.48c1.69.31 3.5-.18 4.81-1.49\"/><path fill=\"#c3ef3c\" d=\"M13.864 11.481a.5.5 0 0 1 .626.33l1.254 4.039l4.245-4.245a.5.5 0 0 1 .707.707l-4.244 4.244l4.048 1.255a.5.5 0 0 1-.296.955l-4.552-1.41l-4.06 4.06l2.848.885a.5.5 0 1 1-.296.955l-3.352-1.04l-2.226 2.226a.5.5 0 1 1-.707-.707l2.226-2.226l-1.04-3.352A.5.5 0 0 1 10 17.86l.884 2.85l4.061-4.062l-1.41-4.541a.5.5 0 0 1 .329-.626\"/></g></svg>",
    "cucumber": "<svg viewBox=\"0 0 32 32\" aria-hidden=\"true\"><g fill=\"none\"><path fill=\"#44911b\" d=\"M29.6 13.6c0-.48-.24-.9-.6-1.15c.32-1.47.48-2.99.48-4.55c0-3.26-2.64-5.9-5.9-5.9s-5.9 2.64-5.9 5.9c0 .83-.1 1.64-.3 2.41c-.74.04-1.33.65-1.33 1.4c0 .37.15.71.39.97a9.85 9.85 0 0 1-3.86 3.82a1.408 1.408 0 0 0-2.55.83c0 .04 0 .09.01.13c-.69.15-1.4.24-2.14.24c-3.26 0-5.9 2.64-5.9 5.9s2.64 5.9 5.9 5.9c1.13 0 2.24-.09 3.33-.26c.23.44.7.75 1.24.75c.76 0 1.38-.6 1.4-1.36a21.5 21.5 0 0 0 8.02-4.33a1.408 1.408 0 0 0 1.86-1.79A21.8 21.8 0 0 0 28.27 15c.74-.04 1.33-.65 1.33-1.4\"/><path fill=\"#86d72f\" d=\"M23.49 12.35a1.14 1.14 0 1 1-2.28 0a1.14 1.14 0 0 1 2.28 0m-4.83 8.2a1.14 1.14 0 1 0 0-2.28a1.14 1.14 0 0 0 0 2.28m-6.81 4a1.14 1.14 0 1 0 0-2.28a1.14 1.14 0 0 0 0 2.28\"/></g></svg>",
    "pea-pod": "<svg viewBox=\"0 0 32 32\" aria-hidden=\"true\"><g fill=\"none\"><path fill=\"#5ab557\" d=\"M8.5 12.5c-4.953 5.282-6.132 11.512-6.413 14.18c-.089.846.25 1.658.851 2.259c.673.672 1.606 1.012 2.546.864C8.69 29.298 16.348 27.652 21 23c7-7 7-18 7-18l-1-1S15 5.567 8.5 12.5\"/><path fill=\"#276038\" d=\"M9.5 14c-3.878 4.46-5.049 9.22-5.38 11.132c-.094.55.107 1.095.501 1.49c.756.755 1.986.74 2.724-.034L26 7l-1-1S14.5 8.25 9.5 14\"/><path fill=\"#8dd753\" fill-rule=\"evenodd\" d=\"M30 5a3 3 0 0 1-.794 2.033l.339 1.692a6 6 0 0 1-.739 4.264l-.949 1.582a1 1 0 0 1-1.715 0l-.949-1.582a6 6 0 0 1-.738-4.264l.295-1.475l-1.476.295a6 6 0 0 1-4.263-.738l-1.582-.95a1 1 0 0 1 0-1.714l1.582-.95a6 6 0 0 1 4.263-.738l1.693.338A3 3 0 0 1 30 5\" clip-rule=\"evenodd\"/><path fill=\"#7dd74e\" fill-rule=\"evenodd\" d=\"M21.377 11.855a4 4 0 1 0-5.355 5.623zm-6.872 7.215a4 4 0 1 0-5.261 5.524z\" clip-rule=\"evenodd\"/></g></svg>",
    "red-apple": "<svg viewBox=\"0 0 32 32\" aria-hidden=\"true\"><g fill=\"none\"><path fill=\"#00d26a\" d=\"M10.25 2H4.22a5.92 5.92 0 0 0 5.92 5.92h6.03C16.18 4.66 13.52 2 10.25 2\"/><path fill=\"#f8312f\" d=\"M18.09 7.38c-1.34.57-2.86.57-4.2 0c-4.2-1.77-9.04.26-10.72 4.51a16.72 16.72 0 0 0 0 12.29a9.227 9.227 0 0 0 11.06 5.49c1.15-.32 2.37-.32 3.52 0a9.203 9.203 0 0 0 11.06-5.49c1.56-3.95 1.56-8.34 0-12.29c-1.67-4.25-6.51-6.28-10.72-4.51\"/></g></svg>",
    "banana": "<svg viewBox=\"0 0 32 32\" aria-hidden=\"true\"><g fill=\"none\"><path fill=\"#f3ad61\" d=\"M2 26.431c0-.73.592-1.321 1.322-1.321h.99a1.322 1.322 0 0 1 0 2.643h-.99c-.73 0-1.322-.592-1.322-1.322\"/><path fill=\"#f9c23c\" d=\"M19.783 18h9.435c.695 0 1.045-.876.55-1.392l-2.178-2.272a4.244 4.244 0 0 0-6.181 0l-2.179 2.272c-.492.514-.142 1.392.553 1.392m-15 0h9.434c.695 0 1.045-.878.553-1.392l-2.18-2.272a4.243 4.243 0 0 0-6.182 0L4.23 16.608c-.492.514-.142 1.392.553 1.392\"/><path fill=\"#feefc2\" d=\"M16.7 2.029c4.92-.708 7.96 11.897 5.745 16.99c-2.215 5.094-6.997 6.21-12.07 8.204a4.7 4.7 0 0 1-1.705.325c-1.924 0-2.97 1.582-3.7-.375c-.942-2.535.293-5.376 2.76-6.344c2.684-1.053 4.111-3.077 5.185-5.818c1.096-2.795 1.17-3.941 1.166-6.988c-.005-2.437-.165-5.594 2.619-5.994\"/><path fill=\"#fcd53f\" d=\"m22.445 19.02l-9.46-4.344c-1.086 2.498-3.053 4.411-5.54 5.39c-2.881 1.132-4.807 4.23-3.23 7.386c3.151 6.304 18.23-.066 18.23-8.433\"/><path fill=\"#f9c23c\" fill-rule=\"evenodd\" d=\"M18.24 16.482a.75.75 0 0 1 .486.942c-1.98 6.201-7.756 9.065-12.918 9.33a.75.75 0 0 1-.077-1.498c4.738-.243 9.83-2.852 11.566-8.288a.75.75 0 0 1 .943-.486\" clip-rule=\"evenodd\"/><path fill=\"#fff478\" d=\"m23.24 26.467l-10.197-11.78h9.004c2.126.107 3.794 1.91 3.794 4.097v7.552c0 1.33-1.197 1.736-2.6.131\"/></g></svg>",
    "blueberries": "<svg viewBox=\"0 0 32 32\" aria-hidden=\"true\"><g fill=\"none\"><path fill=\"#6b438b\" d=\"M26.394 2.063c-.55.01-.818.448-.852.672l2.22 1.67l1.535 2.096c.285-.106.566-.375.616-.644c.079-.521-.061-.751-.258-.947c-.196-.196-.358-.247-.88-.253c.438-.252.718-.711.6-1.266c0 0-.123-.56-.69-.723c-.487-.151-1.019 0-1.338.588c.022-.269-.05-.627-.107-.706s-.297-.498-.846-.487\"/><circle cx=\"22.5\" cy=\"9.5\" r=\"7.5\" fill=\"#8d65c5\"/><circle cx=\"10\" cy=\"11\" r=\"8\" fill=\"#6b438b\"/><path fill=\"#aa7de5\" d=\"M9.253 5.284c-1.053-.574-2.003.188-2.264.24s-1.262-.407-2.066.47c-.803.876-.417 1.731-.427 2.097s-.741 1.335-.157 2.212c.584.876 1.67.876 1.962 1.053c.292.178.584.908 1.836.793s1.45-1.262 1.648-1.47c.199-.21 1.409-.71 1.409-1.837s-.887-1.555-.98-1.795c-.095-.24.093-1.19-.96-1.763\"/><circle cx=\"7.55\" cy=\"8.545\" r=\"2.25\" fill=\"#533566\"/><circle cx=\"19\" cy=\"21\" r=\"9\" fill=\"#8d65c5\"/><path fill=\"#bca4eb\" d=\"M23.852 14.838c-.562-.404-1.09-1.862-2.829-1.845s-2.073 1.195-2.618 1.652s-2.214.58-2.636 2.179s.51 2.267.808 3.11c.299.844-.088 1.828 1.037 2.864c1.124 1.037 2.653.3 3.409.3s2.32.755 3.304-.194s.896-2.372 1.124-2.97c.229-.597 1.67-1.933.72-3.514c-.948-1.582-1.756-1.178-2.319-1.582\"/><circle cx=\"21.01\" cy=\"18.49\" r=\"3.4\" fill=\"#533566\"/></g></svg>",
    "peanuts": "<svg viewBox=\"0 0 32 32\" aria-hidden=\"true\"><g fill=\"none\"><path fill=\"#f3ad61\" d=\"M7.813 29.736c-1.37-.326-2.905-1.322-3.514-1.885c-.914-.987-2.003-2.784-2.25-5.18c-.245-2.396.457-3.523 1.336-5.214s3.318-3.372 5.557-3.493c2.224-.12 2.97-.589 3.797-1.485c.874-.948 1.127-2.02 1.268-3.641c.14-1.621 1.033-3.616 2.828-5.055c1.581-1.268 3.882-2.342 7.326-1.461c3.444.88 4.842 3.578 5.404 5.058s.828 4.305-.788 7.018s-4.288 3.602-5.94 3.673c-1.651.07-2.9.795-3.674 1.711c-.773.916-.913 1.656-1.054 3.277c-.14 1.62-.931 3.646-3.25 5.443s-5.32 1.644-7.046 1.234\"/><path fill=\"#d3883e\" d=\"M21.573 2.312c.204.147.39.299.337.406s-.27.227-.657.347s-1.16.468-1.431.638s-.667.28-.863.12a5 5 0 0 1-.274-.247a2 2 0 0 0-.206-.18c-.093-.063-.133-.152 0-.281c.134-.13.943-.562 1.205-.682s.933-.326 1.213-.339s.471.071.676.218m3.549 3.215c-.3-.238-.647-.319-.879-.08c-.343.33-1.063 1.031-1.203 1.208c-.176.22-.378.537-.115.801c.264.265 1.292 1.295 1.555 1.568c.264.273.606.23.8.044c.193-.185 1.036-1.013 1.212-1.224l.02-.024c.172-.206.381-.456.068-.804a62 62 0 0 0-1.458-1.489m4.188 5.03c.057-.194.272-.08.4.061c.099.09.21.296.153.626s-.175.775-.334 1.176c-.158.4-.57 1.176-.619 1.26c-.048.083-.119.118-.224.043c-.084-.06-.231-.242-.294-.325a.46.46 0 0 1-.035-.542c.034-.056.11-.218.198-.406c.093-.199.199-.427.285-.59c.167-.317.413-1.11.47-1.303m-5.256 1.79c-.276-.245-.57-.386-.924-.116c-.184.141-.323.254-.446.354c-.113.092-.213.174-.324.257c-.116.088-.271.19-.419.287a7 7 0 0 0-.37.254c-.173.135-.36.418-.18.63s1.117 1.139 1.303 1.267c.186.129.571.393 1.065.039l.261-.186c.468-.332 1.028-.73 1.19-.908c.192-.212.34-.457.07-.701s-.93-.888-1.226-1.177m-6.409-5.499c.316-.334.562-.132.834.168c.216.243.588.612.891.913l.251.25c.317.317-.008.783-.228 1.012c-.22.23-.72.996-.993 1.419c-.248.385-.496.17-.698-.004l-.057-.05a10 10 0 0 1-.576-.595c-.21-.228-.426-.46-.566-.593c-.3-.282-.159-.75 0-1.022c.158-.273.825-1.163 1.142-1.498M8.833 18.994c.276.244.57.386.924.116c.184-.141.322-.254.446-.354c.113-.092.213-.174.324-.257c.116-.088.271-.19.419-.287c.146-.096.284-.187.37-.254c.173-.135.359-.418.18-.63c-.18-.212-1.117-1.139-1.303-1.267c-.186-.13-.571-.393-1.065-.039l-.261.186c-.468.332-1.028.73-1.19.908c-.192.212-.34.456-.07.7c.27.245.93.889 1.226 1.178m-6.028 1.99c-.057.194-.272.08-.4-.061c-.099-.09-.21-.295-.153-.626c.057-.33.176-.775.334-1.176s.57-1.175.62-1.26c.047-.083.118-.118.223-.043c.084.06.231.242.294.326a.46.46 0 0 1 .036.541c-.035.056-.11.218-.199.407c-.092.198-.199.426-.285.589c-.167.317-.413 1.11-.47 1.303m4.49 5.158c.298.238.646.319.878.08c.343-.33 1.063-1.032 1.204-1.208c.175-.22.377-.537.114-.801a259 259 0 0 1-1.555-1.568c-.264-.273-.606-.23-.8-.044c-.193.185-1.036 1.013-1.212 1.224l-.02.024c-.172.206-.38.456-.068.804c.26.29 1.08 1.113 1.459 1.489m3.697 3.438c-.205-.147-.392-.299-.338-.406s.27-.227.658-.347c.386-.12 1.16-.468 1.43-.638c.272-.169.667-.28.863-.12c.096.079.191.169.274.247c.086.08.159.15.206.18c.093.063.133.152 0 .282s-.942.561-1.205.681c-.262.12-.933.326-1.213.339s-.471-.071-.675-.218m3.884-5.147c-.316.335-.562.132-.834-.167c-.216-.244-.588-.612-.891-.913l-.252-.25c-.316-.317.01-.784.229-1.013c.22-.23.72-.995.993-1.418c.248-.386.496-.17.698.003l.057.05c.112.093.34.34.576.596c.21.227.425.46.566.593c.299.282.158.748 0 1.021c-.158.274-.825 1.163-1.142 1.498m.817-6.835c.308.29.72.352.958.114c.237-.238 1.168-1.171 1.353-1.348c.184-.176.448-.58.131-.916l-.265-.284c-.37-.4-.898-.968-1.131-1.16c-.3-.247-.668-.344-.923-.097a49 49 0 0 0-1.353 1.365c-.21.238-.483.582-.131.952c.277.292.74.754 1.1 1.114q.146.144.261.26\"/></g></svg>",
    "bowl-with-spoon": "<svg viewBox=\"0 0 32 32\" aria-hidden=\"true\"><g fill=\"none\"><path fill=\"#00a6ed\" d=\"M18.5 29.041h-5.02C7.69 29.041 3 24.351 3 18.561v-4.9h25.98v4.9c0 5.79-4.69 10.48-10.48 10.48\"/><path fill=\"#26eafc\" d=\"M21.55 6.231H10.43c-4.1 0-7.43 3.33-7.43 7.43s3.33 7.43 7.43 7.43h11.12c4.1 0 7.43-3.33 7.43-7.43s-3.32-7.43-7.43-7.43\"/><path fill=\"#0074ba\" d=\"M21.865 7.871c3.1 0 5.626 2.6 5.626 5.79s-2.527 5.79-5.626 5.79h-2.51l-4.51-1.857l-4.51 1.857h-.111c-3.1 0-5.626-2.6-5.626-5.79s2.526-5.79 5.626-5.79z\"/><path fill=\"#d3d3d3\" d=\"m26.393 3.05l-7.161 12.194a2.43 2.43 0 0 0-.16 2.104c.24.632.343 1.35.303 2.103h-9.061q.227-.63.584-1.242c1.048-1.784 2.68-2.925 4.268-3.163a2.42 2.42 0 0 0 1.756-1.158L24.1 1.665a1.333 1.333 0 0 1 1.866-.442c.617.393.79 1.207.427 1.826\"/><path fill=\"#9b9b9b\" d=\"M11.48 19.451h6.725c0-1.179-.476-2.217-1.383-2.75c-1.555-.913-3.792.006-4.994 2.054q-.201.344-.348.696\"/></g></svg>",
    "cheese-wedge": "<svg viewBox=\"0 0 32 32\" aria-hidden=\"true\"><g fill=\"none\"><path fill=\"#fcd53f\" d=\"M29 15.075c-1.27 0-2.38-1.03-2.38-2.31c0-1.314 1.096-2.31 2.38-2.31v-2.03c0-.87-.8-1.52-1.65-1.33l-10.94-.717l-11.34 5.627c-.62.14-1.07.69-1.07 1.33v9.01a2.121 2.121 0 0 1 0 4.24v2.01c0 .87.8 1.52 1.65 1.33l22.28-4.91c.62-.14 1.07-.69 1.07-1.33z\"/><path fill=\"#ffb02e\" d=\"m15.74 2.565l-11.02 9.56l23.35-4.99l-9.78-4.89c-.84-.42-1.84-.29-2.55.32m8.74 13.87a3.67 3.67 0 1 1-7.34 0a3.67 3.67 0 0 1 7.34 0m-11.87 5.55a2.12 2.12 0 1 0 0-4.24a2.12 2.12 0 0 0 0 4.24m6.35 1.14a1.14 1.14 0 1 1-2.28 0a1.14 1.14 0 0 1 2.28 0\"/></g></svg>",
    "coconut": "<svg viewBox=\"0 0 32 32\" aria-hidden=\"true\"><g fill=\"none\"><path fill=\"#6d4534\" d=\"m26.219 8.156l-3.32-3.33l-18.08 18.08l3.33 3.33c4.99 4.99 13.08 4.99 18.07 0c4.99-5 4.99-13.09 0-18.08\"/><path fill=\"#a56953\" d=\"M23.619 20.206c.04-.79.22-1.58.61-2.33c2.33-4.52 1.96-9.76-1.33-13.05c-2.79-2.79-6.97-3.48-10.93-2.22a4.1 4.1 0 0 0-2.4 2.05c-.3.61-.85 1.29-1.57 1.9c-.72.62-1.48 1.05-2.1 1.24c-1.02.3-1.9 1.07-2.4 2.04c-2.34 4.52-1.97 9.77 1.32 13.07c1.57 1.57 3.59 2.48 5.75 2.74c.7.09 1.34.35 1.89.73c.34.23.87.33 1.46.23c.57-.1 1.08-.36 1.42-.7c.57-.56 1.21-1.05 1.92-1.37c.08-.04.15-.07.23-.11c.76-.36 1.56-.52 2.34-.53c.76 0 1.72-.45 2.53-1.26c.78-.77 1.23-1.69 1.26-2.43\"/><path fill=\"#d3d3d3\" d=\"M22.609 18.836c0-.52.12-1.05.37-1.55c1.99-3.93 1.65-8.48-1.21-11.34c-2.51-2.51-6.32-3.08-9.88-1.83c-.53.2-.97.66-1.12 1.2c-.19.68-.83 1.58-1.75 2.37c-.94.8-1.92 1.28-2.61 1.33c-.55.04-1.09.38-1.38.9c-2.3 4.05-2.06 8.87.93 11.86c1.46 1.46 3.37 2.27 5.4 2.44c.52.04.97.26 1.36.55c.35.27.94.36 1.59.22c.63-.14 1.17-.48 1.48-.88c.33-.42.75-.76 1.23-.98l.24-.12c.5-.25 1.03-.39 1.55-.38c.76.01 1.73-.45 2.54-1.26c.8-.81 1.25-1.77 1.26-2.53\"/><path fill=\"#9b9b9b\" d=\"M21.519 17.326c-.08-.26-.05-.55.08-.83c1.54-3.24 1.22-6.93-1.12-9.27c-1.95-1.95-4.83-2.5-7.61-1.74c-.54.15-.97.61-1.1 1.15c-.17.69-.82 1.6-1.76 2.41c-.94.8-1.94 1.29-2.62 1.33c-.57.04-1.1.4-1.34.93c-1.49 3.21-1.14 6.85 1.17 9.16c1.28 1.28 2.95 1.95 4.74 2.06c.26.01.48.11.65.29c.33.34.98.48 1.71.32c.7-.16 1.28-.55 1.57-1.01c.15-.23.36-.42.6-.53h.01c.27-.13.56-.15.82-.07c.79.26 2.02-.2 3.01-1.19c.99-1 1.44-2.22 1.19-3.01\"/></g></svg>",
    "honey-pot": "<svg viewBox=\"0 0 32 32\" aria-hidden=\"true\"><g fill=\"none\"><path fill=\"#d3883e\" d=\"M6 8a1 1 0 0 1 1-1h2.05l.048.047H22.93L22.988 7H25a1 1 0 1 1 0 2l-9 2l-9-2a1 1 0 0 1-1-1\"/><path fill=\"#b97028\" d=\"M4 16c-1-4.5 2-7 4-7l.059-.04H23.91L24 9c2 0 5 2.5 4 7l-.288 1l-.087.055l-11.627 4l-11.627-4L4.288 17zm2.452 8.5L7.75 29S8 30 9 30h14c1 0 1.25-1 1.25-1l1.298-4.5l-.167-.113l-9.398-3l-9.398 3z\"/><path fill=\"#8c5543\" d=\"M27.712 17H4.288l2.164 7.5h19.096z\"/><path fill=\"#6d4534\" d=\"M19.683 3.273a.75.75 0 0 1 .544.91l-.998 3.96a.75.75 0 1 1-1.454-.367l.998-3.96a.75.75 0 0 1 .91-.543\"/><path fill=\"#8c5543\" d=\"M21.5 4.002a2 2 0 1 1-4 0a2 2 0 0 1 4 0\"/><path fill=\"#f9c23c\" d=\"M9.047 7c1.04 6.128 4.452 5.73 4.452 5.73c2.321 0 2.776-1.122 3.206-2.18c.127-.313.252-.62.422-.892c.657-.986 1.77-.265 2.022 0c.645.695 1.353.569 1.353.569c1.61-.033 2.332-2.603 2.484-3.227zm12.599 5.632s-.355-.987-1.408-.96c-.222.019-.919.253-.815 1.315c.038.43.136 1.695 1.741 1.287c.638-.162.772-.879.482-1.642\"/></g></svg>",
    "bread": "<svg viewBox=\"0 0 32 32\" aria-hidden=\"true\"><g fill=\"none\"><path fill=\"#f3ad61\" d=\"M27.34 25.593L15 30V16.5L29 13v10.238a2.5 2.5 0 0 1-1.66 2.355\"/><path fill=\"#e19747\" d=\"M14.59 3.262L3.202 7.556L17 19l10.98-3.8A3 3 0 0 0 30 12.364v-.904a5 5 0 0 0-3.239-4.679l-9.35-3.52a4 4 0 0 0-2.821 0\"/><path fill=\"#ffdea7\" d=\"M3 13.5v9.955a3 3 0 0 0 1.903 2.793l9.366 3.679A2 2 0 0 0 17 28.065V19l.157-.235a5.02 5.02 0 0 0-2.415-7.487L4.702 7.513A2 2 0 0 0 2 9.386v1.403a4 4 0 0 0 .672 2.219z\"/><path fill=\"#e19747\" d=\"M8 13.5a.5.5 0 1 1-1 0a.5.5 0 0 1 1 0m-2 1a.5.5 0 1 1-1 0a.5.5 0 0 1 1 0M7.5 17a.5.5 0 1 0 0-1a.5.5 0 0 0 0 1m-1.5.5a.5.5 0 1 1-1 0a.5.5 0 0 1 1 0M9.5 16a.5.5 0 1 0 0-1a.5.5 0 0 0 0 1m2.5-1.5a.5.5 0 1 1-1 0a.5.5 0 0 1 1 0m1.5 3.5a.5.5 0 1 0 0-1a.5.5 0 0 0 0 1m-1.5.5a.5.5 0 1 1-1 0a.5.5 0 0 1 1 0M9.5 20a.5.5 0 1 0 0-1a.5.5 0 0 0 0 1m-1.5.5a.5.5 0 1 1-1 0a.5.5 0 0 1 1 0M5.5 22a.5.5 0 1 0 0-1a.5.5 0 0 0 0 1m4.5 1.5a.5.5 0 1 1-1 0a.5.5 0 0 1 1 0m1.5-.5a.5.5 0 1 0 0-1a.5.5 0 0 0 0 1m2.5-1.5a.5.5 0 1 1-1 0a.5.5 0 0 1 1 0m-.5 3.5a.5.5 0 1 0 0-1a.5.5 0 0 0 0 1\"/></g></svg>",
    "glass-of-milk": "<svg viewBox=\"0 0 32 32\" aria-hidden=\"true\"><g fill=\"none\"><path fill=\"#aeddff\" d=\"m4.01 3.066l3.78 26.127a.95.95 0 0 0 .937.807h14.546a.934.934 0 0 0 .937-.807l3.78-26.127A.942.942 0 0 0 27.054 2H4.947a.942.942 0 0 0-.938 1.066\"/><path fill=\"#f3eef8\" d=\"m6.51 9.295l2.461 17.167c.04.309.31.538.62.538h12.806c.31 0 .58-.229.62-.538l2.47-17.167c.1-.688-.43-1.295-1.13-1.295H7.64c-.69 0-1.22.617-1.13 1.295\"/><path fill=\"#fff\" d=\"M24.856 5.215a1 1 0 1 0-1.98-.284L19.713 27h2.02z\"/></g></svg>",
    "pot-of-food": "<svg viewBox=\"0 0 32 32\" aria-hidden=\"true\"><g fill=\"none\"><path fill=\"#b4acbc\" d=\"M6 13a4 4 0 0 0 0 8h20a4 4 0 0 0 0-8zm-2 4a2 2 0 0 1 2-2h4v4H6a2 2 0 0 1-2-2m22 2h-4v-4h4a2 2 0 1 1 0 4\"/><path fill=\"#cdc4d6\" d=\"M7 14h18v7a9 9 0 1 1-18 0z\"/><path fill=\"#e1d8ec\" d=\"M25 14a9 9 0 1 1-18 0a9 9 0 0 1 18 0\"/><path fill=\"#ff6723\" d=\"M24 14a8 8 0 1 1-16 0a8 8 0 0 1 16 0\"/><path fill=\"#fcd53f\" d=\"M18 18a2 2 0 1 1 4 0zm-7 1a1 1 0 1 1 2 0z\"/><path fill=\"#00d26a\" d=\"M20 10a2 2 0 0 0-2 2a1 1 0 1 0-2 0h6a2 2 0 0 0-2-2m-6 11a2 2 0 1 1 4 0z\"/><path fill=\"#990838\" d=\"M15.75 9a.75.75 0 1 1-1.5 0a.75.75 0 0 1 1.5 0m-5 7a.75.75 0 1 1-1.5 0a.75.75 0 0 1 1.5 0M21 14.75a.75.75 0 1 0 0-1.5a.75.75 0 0 0 0 1.5\"/><path fill=\"#7d4533\" d=\"M12.561 10.976c.967 0 1.75.783 1.75 1.75c0 .55.446.995.995.995a1.75 1.75 0 1 1 0 3.5a4.495 4.495 0 0 1-4.495-4.495c0-.967.784-1.75 1.75-1.75\"/></g></svg>",
    "fire": "<svg viewBox=\"0 0 32 32\" aria-hidden=\"true\"><g fill=\"none\"><path fill=\"#ff6723\" d=\"M26 19.34c0 6.1-5.05 11.005-11.15 10.641c-6.269-.374-10.56-6.403-9.752-12.705c.489-3.833 2.286-7.12 4.242-9.67c.34-.445.689 3.136 1.038 2.742c.35-.405 3.594-6.019 4.722-7.991a.694.694 0 0 1 1.028-.213C18.394 3.854 26 10.277 26 19.34\"/><path fill=\"#ffb02e\" d=\"M23 21.851c0 4.042-3.519 7.291-7.799 7.144c-4.62-.156-7.788-4.384-7.11-8.739C9.07 14.012 15.48 10 15.48 10S23 14.707 23 21.851\"/></g></svg>",
    "snowflake": "<svg viewBox=\"0 0 32 32\" aria-hidden=\"true\"><path fill=\"#00a6ed\" d=\"m23.564 18.9l5.112-1.36c.553-.15 1.137.15 1.288.71c.15.56-.182 1.12-.735 1.27l-3.11.83l2.224 1.27c.483.28.655.89.373 1.37s-.896.65-1.379.37l-2.224-1.27l.836 3.09c.15.56-.171 1.12-.735 1.27a1.04 1.04 0 0 1-1.278-.73l-1.368-5.08l-2.315-1.33a5.07 5.07 0 0 1-2.747 1.59v2.63l3.744 3.72c.402.4.402 1.06 0 1.46c-.403.4-1.067.4-1.47 0l-2.274-2.26V29a1.006 1.006 0 0 1-2.012 0v-2.54l-2.274 2.26c-.403.4-1.067.4-1.47 0a1.034 1.034 0 0 1 0-1.46l3.744-3.72v-2.63c-1.097-.22-2.033-.8-2.747-1.59l-2.305 1.32l-1.368 5.08c-.151.55-.725.88-1.278.73a1.04 1.04 0 0 1-.735-1.27l.836-3.09l-2.224 1.28A1.02 1.02 0 0 1 4.294 23a.976.976 0 0 1 .363-1.35l2.223-1.28l-3.109-.83a1.04 1.04 0 0 1-.735-1.27c.151-.55.725-.88 1.278-.73l5.112 1.36l2.315-1.33a4.8 4.8 0 0 1-.282-1.57c0-.55.11-1.08.282-1.55l-2.315-1.33l-5.112 1.36a1.04 1.04 0 0 1-1.278-.73c-.15-.56.182-1.12.735-1.27l3.11-.83l-2.224-1.28A1.004 1.004 0 0 1 4.294 9c.272-.48.896-.64 1.369-.37l2.234 1.28l-.836-3.09c-.15-.55.182-1.11.735-1.26s1.117.18 1.268.73l1.368 5.08l2.305 1.32a5.07 5.07 0 0 1 2.747-1.59V8.47L11.74 4.75a1.034 1.034 0 0 1 0-1.46a1.05 1.05 0 0 1 1.469 0l2.274 2.26V3a1.006 1.006 0 0 1 2.012 0v2.55l2.274-2.26a1.05 1.05 0 0 1 1.47 0c.402.4.402 1.06 0 1.46l-3.744 3.72v2.63a5.05 5.05 0 0 1 2.737 1.58l2.314-1.33l1.369-5.08c.151-.55.724-.88 1.278-.73c.553.15.886.72.735 1.27l-.836 3.09l2.224-1.27a1.02 1.02 0 0 1 1.379.37a1 1 0 0 1-.363 1.36l-2.223 1.27l3.109.83c.553.15.885.72.734 1.27c-.15.55-.724.88-1.277.73l-5.112-1.36l-2.314 1.33c.17.49.281 1.02.281 1.57s-.11 1.07-.281 1.57zM19.509 16c0-1.657-1.352-3-3.019-3a3.01 3.01 0 0 0-3.019 3c0 1.657 1.352 3 3.019 3a3.01 3.01 0 0 0 3.019-3\"/></svg>",
    "stopwatch": "<svg viewBox=\"0 0 32 32\" aria-hidden=\"true\"><g fill=\"none\"><path fill=\"#d3d3d3\" d=\"m18.015 6l-2-1l-2 1v3h4zm-7.37 5.19l-2.45 2.45c-.5.5-1.3.5-1.79 0l-1.03-1.03c-.5-.5-.5-1.3 0-1.79l2.45-2.45c.5-.5 1.3-.5 1.79 0l1.04 1.04c.49.48.49 1.29-.01 1.78m13.18 2.45l-2.45-2.45c-.5-.49-.5-1.3 0-1.79l1.04-1.04c.49-.5 1.29-.5 1.79 0l2.45 2.45c.5.49.5 1.29 0 1.79l-1.04 1.04c-.49.5-1.29.5-1.79 0\"/><path fill=\"#636363\" d=\"M13.275 6h5.47c.7 0 1.27-.57 1.26-1.27V3.27c0-.7-.57-1.27-1.27-1.27h-5.46c-.7 0-1.26.57-1.27 1.27v1.46c0 .7.57 1.27 1.27 1.27m13.74 13c0 6.075-4.925 11-11 11s-11-4.925-11-11s4.925-11 11-11s11 4.925 11 11\"/><path fill=\"#fff\" d=\"M16.015 28a9 9 0 1 0 0-18a9 9 0 0 0 0 18\"/><path fill=\"#9b9b9b\" d=\"m19.545 14.05l.71-.71a.996.996 0 1 1 1.41 1.41l-.71.71a.996.996 0 1 1-1.41-1.41\"/><path fill=\"#d3d3d3\" d=\"M15.015 13v-1c0-.55.45-1 1-1s1 .45 1 1v1c0 .55-.45 1-1 1c-.56 0-1-.45-1-1m0 13v-1c0-.55.45-1 1-1s1 .45 1 1v1c0 .55-.45 1-1 1c-.56 0-1-.45-1-1m8-8h-1c-.56 0-1 .45-1 1s.45 1 1 1h1c.55 0 1-.45 1-1s-.45-1-1-1m-14 0h1c.55 0 1 .45 1 1s-.45 1-1 1h-1c-.55 0-1-.45-1-1s.44-1 1-1m12.66 5.25l-.71-.71a.996.996 0 1 0-1.41 1.41l.71.71a.996.996 0 1 0 1.41-1.41m-9.91-9.9l.71.71a.996.996 0 1 1-1.41 1.41l-.71-.71a.996.996 0 0 1 0-1.41c.39-.4 1.02-.4 1.41 0m-.7 9.18l-.71.71a.996.996 0 1 0 1.41 1.41l.71-.71a.996.996 0 1 0-1.41-1.41\"/><path fill=\"#f8312f\" d=\"M15.305 19.71a.996.996 0 0 1 0-1.41l4.95-4.95a.996.996 0 1 1 1.41 1.41l-4.95 4.95a.996.996 0 0 1-1.41 0\"/></g></svg>",
    "basket": "<svg viewBox=\"0 0 32 32\" aria-hidden=\"true\"><g fill=\"none\"><path fill=\"#f3ad61\" d=\"M3 12a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h.3l3.559 11.862A3 3 0 0 0 9.732 30h12.536a3 3 0 0 0 2.873-2.138L28.7 16h.3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1H11l-1-.5l-1 .5z\"/><path fill=\"#d3883e\" d=\"m3.678 16l-.29.29l.326 1.088l1.296-1.297l1.415 1.415L5.01 18.91l-1.196-1.197l.879 2.929l.317-.318l1.415 1.414l-1.08 1.08l.893 2.977l.187.186l-.1.1l.326 1.088l.48-.48l1.415 1.413l-.977.977c.236.245.51.448.814.6l.87-.87L10.443 30h1.862l1.19-1.19L14.687 30h1.862l1.19-1.19L18.93 30h1.861l1.191-1.19l1.083 1.083c.346-.096.67-.252.957-.458l-1.333-1.333l1.414-1.414l1.061 1.06l.018-.017l.318-1.06l-.69-.69l1.28-1.28l.607-2.02l-.472.471l-1.415-1.414l1.415-1.414l.907.907l.326-1.088l-.526-.526l.977-.977l.606-2.02l-.169.169l-.789-.789h-2.665l-.789.789l-.788-.789h-2.666l-.788.789L19.07 16h-2.665l-.789.789l-.789-.789h-2.665l-.789.789l-.788-.789H7.92l-.788.789L6.343 16zm2.04 3.617l1.414-1.414l1.414 1.414l-1.414 1.414zm2.12 2.121l1.415-1.414l1.414 1.414l-1.414 1.415zm2.122-2.121l1.414-1.414l1.415 1.414l-1.415 1.414zm0 4.243l1.414-1.415l1.415 1.415l-1.415 1.414zm4.95-2.122l-1.414 1.415l-1.414-1.415l1.414-1.414zm-2.828 4.243l1.414-1.414l1.414 1.414l-1.414 1.414zm2.12-2.121l1.415-1.415l1.414 1.415l-1.414 1.414zm0 4.242l1.415-1.414l1.414 1.414l-1.414 1.415zm5.658 1.415l-1.415-1.415l1.415-1.414l1.414 1.414zm-3.536-3.536l1.414-1.414l1.415 1.414l-1.415 1.414zm5.657 1.414l-1.414-1.414l1.414-1.414l1.414 1.414zm2.121-2.121l-1.414-1.414l1.414-1.415l1.415 1.415zm-2.12-2.121l-1.415-1.415l1.414-1.414l1.414 1.414zm3.535-3.536l-1.415 1.414l-1.414-1.414l1.414-1.414zm-2.122-2.121l-1.414 1.414l-1.414-1.414l1.414-1.415zm-5.657-1.415l1.415 1.415l-1.415 1.414l-1.414-1.414zm2.122 2.122l1.414 1.414l-1.414 1.414l-1.415-1.414zm-4.243 0l1.414 1.414l-1.414 1.414l-1.414-1.414zm2.121 2.121l1.415 1.414l-1.415 1.415l-1.414-1.415zm2.122 4.95l-1.415-1.414l1.415-1.415l1.414 1.415zm7.778-7.778l-1.414 1.414l-1.415-1.414l1.415-1.415zm-16.264 9.192l1.415 1.414l-1.415 1.415l-1.414-1.415zm3.536-9.192l-1.414 1.414l-1.414-1.414l1.414-1.415zm-4.243 8.485l-1.414 1.414l-1.414-1.414l1.414-1.414zM8.546 23.86l-1.414 1.414l-1.414-1.414l1.414-1.415zm.707-4.95L7.84 17.496l1.414-1.415l1.414 1.415z\"/><path fill=\"#e19747\" d=\"M13 2c-2.5 0-4 2-4 4v6h2V6c0-2.5 1.5-3 3-3h4c1.5 0 3 .5 3 3v8a1 1 0 1 0 2 0V6c0-2-1.5-4-4-4z\"/></g></svg>",
    "shopping-cart": "<svg viewBox=\"0 0 32 32\" aria-hidden=\"true\"><g fill=\"none\"><path fill=\"#9b9b9b\" d=\"M7.17 21.757L22.94 23l1.042-4h.536c1.372 0 2.494 1.34 2.494 2.885V22c0 1.608-1.203 3-2.634 3H3c-.547 0-1 .382-1 .956S2.447 27 2.994 27h21.425C26.943 27 29 24.756 29 22v-.115C29 19.192 26.993 17 24.518 17h-.015l.004-.012a.495.495 0 0 0 .393-.469v-.038a.47.47 0 0 0-.168-.359L27.37 6H5.2C3.44 6 2 7.432 2 9.253l.52 8.495c.15 2.517 2.52 3.84 4.65 4.009M21.616 16H20v-4h2.605zm1.236-5H20V8.007l1.95.002c.84 0 1.45.776 1.25 1.582zM19 8.006V11h-4.38V8zm-5.38-.007V11h-4.6V7.994zm-5.6-.006V11H4.111L4 9.193c0-.666.54-1.204 1.21-1.204zM4.173 12H8.02v4h-3.6zm.308 5H8.02v2.83l-.68-.053c-1.34-.11-2.74-.875-2.82-2.149zm4.539 2.91V17h4.6v3.272zm5.6.44V17H19v3.62q0 .039.006.076zm5.38.25V17h1.369l-.679 2.747a1.28 1.28 0 0 1-.69.853M14.62 12H19v4h-4.38zm-5.6 0h4.6v4h-4.6z\"/><path fill=\"#bebebe\" d=\"M22.804 23.97c-.562-.131-.912-.688-.774-1.225l4.884-18.977c.138-.537.721-.871 1.282-.74c.562.132.912.69.774 1.227L24.086 23.23c-.138.547-.71.871-1.282.74\"/><path fill=\"#0084ce\" d=\"M27 5h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1M5.5 30a1.5 1.5 0 1 0 0-3a1.5 1.5 0 0 0 0 3m18 0a1.5 1.5 0 1 0 0-3a1.5 1.5 0 0 0 0 3\"/></g></svg>",
    "check-mark-button": "<svg viewBox=\"0 0 32 32\" aria-hidden=\"true\"><g fill=\"none\"><path fill=\"#00d26a\" d=\"M2 6a4 4 0 0 1 4-4h20a4 4 0 0 1 4 4v20a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4z\"/><path fill=\"#f4f4f4\" d=\"M13.242 23c-.383 0-.766-.143-1.059-.43l-5.744-5.642a1.453 1.453 0 0 1 0-2.08a1.517 1.517 0 0 1 2.118 0l4.685 4.601L23.443 9.431a1.517 1.517 0 0 1 2.118 0a1.45 1.45 0 0 1 0 2.08l-11.26 11.058a1.5 1.5 0 0 1-1.059.431\"/></g></svg>",
    "jar": "<svg viewBox=\"0 0 32 32\" aria-hidden=\"true\"><g fill=\"none\"><path fill=\"#9b9b9b\" d=\"m22 5l-6-1.141L10 5v1l6 1.394L22 6z\"/><path fill=\"#aeddff\" d=\"M7.895 6C6.296 6 5 7.226 5 8.738v18.524C5 28.774 6.296 30 7.895 30h16.21C25.704 30 27 28.774 27 27.262V8.738C27 7.226 25.704 6 24.105 6z\"/><path fill=\"#bebebe\" d=\"M8 3.5A1.5 1.5 0 0 1 9.5 2h13a1.5 1.5 0 0 1 0 3h-13A1.5 1.5 0 0 1 8 3.5\"/><rect width=\"2\" height=\"20\" x=\"22\" y=\"8\" fill=\"#fff\" rx=\"1\"/><path fill=\"#9b9b9b\" d=\"M9.999 14A1 1 0 0 0 9 15v5a1 1 0 0 0 .999 1H22a1 1 0 0 0 1-1v-5a1 1 0 0 0-.999-1z\"/></g></svg>",
}
const Em = ({ n }: { n: string }) => <i className="fz-em" aria-hidden="true" dangerouslySetInnerHTML={{ __html: EM[n] || "" }} />
const PREP_EM: Record<string, string> = { nobake: "pot-of-food", oven: "fire", frozen: "snowflake" }


/* ------------------------------------------------- ingredients: filters, meal builder, shopping list */

type IngDef = { k: string; em: string; n: LS; ins: LS; gen: LS; rx?: RegExp; strip?: RegExp; al?: string }
/* name, "s ..." (instrumental) and "bez ..." (genitive); EN uses the lower-case name */
const ING_DEFS: IngDef[] = [
    { k: "piletina", em: "poultry-leg", n: X("Chicken", "Piletina"), ins: X("chicken", "piletinom"), gen: X("chicken", "piletine"), rx: /\bchicken\b/i, strip: /\bchicken\b(?:[\s,/]+(?:or\s+)?[\w-]+){0,3}?[\s-]+(?:broth|stock)\b/gi },
    { k: "puretina", em: "turkey", n: X("Turkey", "Puretina"), ins: X("turkey", "puretinom"), gen: X("turkey", "puretine"), rx: /\bturkey\b/i, strip: /\bturkey\b(?:[\s,/]+(?:or\s+)?[\w-]+){0,3}?[\s-]+(?:broth|stock)\b/gi },
    { k: "govedina", em: "cut-of-meat", n: X("Beef", "Govedina"), ins: X("beef", "govedinom"), gen: X("beef", "govedine"), rx: /\bbeef\b/i, strip: /\bbeef\b(?:[\s,/]+(?:or\s+)?[\w-]+){0,3}?[\s-]+(?:broth|stock)\b/gi },
    { k: "riba", em: "fish", n: X("Fish", "Riba"), ins: X("fish", "ribom"), gen: X("fish", "ribe"), rx: /\b(?:salmon|tuna|sardines?|cod|fish|mackerel|whitefish|tilapia|trout|pollock|hake)\b/i, strip: /\b(?:fish|salmon|cod liver)\s+oil\b/gi },
    { k: "jaja", em: "egg", n: X("Eggs", "Jaja"), ins: X("eggs", "jajima"), gen: X("eggs", "jaja"), rx: /\beggs?\b/i, strip: /\b(?:flax|chia)(?:seed)?(?:\s+meal)?\s+eggs?\b/gi },
    { k: "riza", em: "cooked-rice", n: X("Rice", "Riža"), ins: X("rice", "rižom"), gen: X("rice", "riže"), rx: /\brice\b/i, strip: /\brice\s+(?:flour|cereal|cakes?)\b/gi },
    { k: "zob", em: "sheaf-of-rice", n: X("Oats", "Zob"), ins: X("oats", "zobi"), gen: X("oats", "zobi"), rx: /\b(?:oats?|oatmeal)\b/i },
    { k: "batat", em: "roasted-sweet-potato", n: X("Sweet potato", "Batat"), ins: X("sweet potato", "batatom"), gen: X("sweet potato", "batata"), rx: /\bsweet\s+potato(?:es)?\b|\byams?\b/i },
    { k: "krumpir", em: "potato", n: X("Potato", "Krumpir"), ins: X("potato", "krumpirom"), gen: X("potato", "krumpira"), rx: /\bpotato(?:es)?\b/i, strip: /\bsweet\s+potato(?:es)?\b/gi },
    { k: "bundeva", em: "pumpkin", n: X("Pumpkin", "Bundeva"), ins: X("pumpkin", "bundevom"), gen: X("pumpkin", "bundeve"), rx: /\bpumpkin\b/i, strip: /\bpumpkin\s+seeds?\b/gi },
    { k: "mrkva", em: "carrot", n: X("Carrot", "Mrkva"), ins: X("carrot", "mrkvom"), gen: X("carrot", "mrkve"), rx: /\bcarrots?\b/i },
    { k: "spinat", em: "leafy-green", n: X("Spinach", "Špinat"), ins: X("spinach", "špinatom"), gen: X("spinach", "špinata"), rx: /\bspinach\b/i },
    { k: "tikvica", em: "cucumber", n: X("Zucchini", "Tikvica"), ins: X("zucchini", "tikvicom"), gen: X("zucchini", "tikvice"), rx: /\b(?:zucchinis?|courgettes?)\b/i },
    { k: "grasak", em: "pea-pod", n: X("Peas", "Grašak"), ins: X("peas", "graškom"), gen: X("peas", "graška"), rx: /\bpeas\b/i },
    { k: "jabuka", em: "red-apple", n: X("Apple", "Jabuka"), ins: X("apple", "jabukom"), gen: X("apple", "jabuke"), rx: /\bapples?\b|applesauce|apple\s+sauce/i, strip: /\bapple\s+cider(?:\s+vinegar)?\b/gi },
    { k: "banana", em: "banana", n: X("Banana", "Banana"), ins: X("banana", "bananom"), gen: X("banana", "banane"), rx: /\bbananas?\b/i },
    { k: "borovnice", em: "blueberries", n: X("Blueberries", "Borovnice"), ins: X("blueberries", "borovnicama"), gen: X("blueberries", "borovnica"), rx: /blueberr/i },
    { k: "kikiriki", em: "peanuts", n: X("Peanuts", "Kikiriki"), ins: X("peanuts", "kikirikijem"), gen: X("peanuts", "kikirikija"), rx: /\bpeanuts?\b|peanut\s+butter/i },
    { k: "jogurt", em: "bowl-with-spoon", n: X("Yogurt", "Jogurt"), ins: X("yogurt", "jogurtom"), gen: X("yogurt", "jogurta"), rx: /\byogh?urt\b/i },
    { k: "sir", em: "cheese-wedge", n: X("Cheese", "Sir"), ins: X("cheese", "sirom"), gen: X("cheese", "sira"), rx: /\b(?:cheese|cheddar|mozzarella|parmesan|cottage)\b/i },
    { k: "kokos", em: "coconut", n: X("Coconut", "Kokos"), ins: X("coconut", "kokosom"), gen: X("coconut", "kokosa"), rx: /\bcoconut\b/i },
    { k: "med", em: "honey-pot", n: X("Honey", "Med"), ins: X("honey", "medom"), gen: X("honey", "meda"), rx: /\bhoney\b/i },
    { k: "zitarice", em: "bread", n: X("Grains", "Žitarice"), ins: X("grains", "žitaricama"), gen: X("grains", "žitarica"), al: "grains" },
    { k: "mlijecno", em: "glass-of-milk", n: X("Dairy", "Mliječno"), ins: X("dairy", "mliječnim proizvodima"), gen: X("dairy", "mliječnih proizvoda"), al: "dairy" },
]
const ING: Record<string, IngDef> = Object.fromEntries(ING_DEFS.map((d) => [d.k, d]))

/* "no onion or garlic", "no onion/garlic", "zero garlic", "garlic-free": the line says the dog should NOT get it */
const negOf = (src: string, line: string) => {
    const p = "(?:" + src + ")"
    const sep = "(?:\\s*[,/]\\s*|\\s+(?:or|and)\\s+|\\s+)"
    return (
        new RegExp("\\b(?:no|without|zero|never)\\s+(?:[\\w'-]+" + sep + "){0,4}?" + p, "i").test(line) ||
        new RegExp(p + "(?:" + sep + "[\\w-]+)?-free\\b", "i").test(line) ||
        new RegExp(p + "[^,;()]{0,20}\\bfree\\b", "i").test(line)
    )
}
const hasIng = (d: IngDef, lines: string[]) =>
    !!d.rx &&
    lines.some((raw) => {
        const line = d.strip ? raw.replace(d.strip, " ") : raw
        return d.rx!.test(line) && !negOf(d.rx!.source, line)
    })
const OVEN_RX = /\b(?:bake|baked|baking|oven|preheat|roast|roasted)\b/i
/* things a regular supermarket usually doesn't stock (our own list) */
const SPECIAL_RX = /carob|coconut flour|almond flour|chickpea flour|tapioca|cassava|nutritional yeast|spirulina|kelp|goat'?s? milk|psyllium|brewer|collagen|fish oil|salmon oil|krill|green.lipped|bee pollen|matcha/i
/* "has": the recipe uses it (for "I have it"). "no": a dog that must not have it must not get this recipe, so it is wider:
   broth counts as chicken, fish oil as fish, rice flour as rice, plus the allergens of the recipe (al).
   A flax egg still isn't egg and sweet potato isn't potato. */
type RMeta = { has: Set<string>; no: Set<string>; oven: boolean; frozen: boolean; n: number; shop: boolean; min: number | null }
const AL_ING: Record<string, string> = { chicken: "piletina", turkey: "puretina", beef: "govedina", fish: "riba", eggs: "jaja", peanuts: "kikiriki", grains: "zitarice", dairy: "mlijecno" }
const NO_STRIP: Record<string, boolean> = { jaja: true, krumpir: true }
const metaOf = (ings: string[], steps: string[], frozen: boolean, al: string[], min: number | null): RMeta => {
    const has = new Set<string>()
    const no = new Set<string>()
    for (const d of ING_DEFS) {
        if (d.al ? al.includes(d.al) : hasIng(d, ings)) has.add(d.k)
        if (
            d.rx &&
            ings.some((raw) => {
                const line = NO_STRIP[d.k] && d.strip ? raw.replace(d.strip, " ") : raw
                return d.rx!.test(line) && !negOf(d.rx!.source, line)
            })
        )
            no.add(d.k)
    }
    has.forEach((k) => no.add(k))
    for (const a of al) if (AL_ING[a]) no.add(AL_ING[a])
    return { has, no, oven: steps.some((s) => OVEN_RX.test(s)), frozen, n: ings.length, shop: !ings.some((l) => SPECIAL_RX.test(l)), min }
}
const ingEn = (i: Ing) => plain(i.n.en) + (i.n2 ? " " + plain(i.n2.en) : "")
const RMETA: Record<string, RMeta> = Object.fromEntries(
    RECIPES.map((r) => [r.id, metaOf(r.ing.map(ingEn), r.steps.map((s) => s.en), r.tags.includes("frozen"), r.al, r.min)])
)
/* Croatian "s" becomes "sa" before s, š, z, ž */
const sHr = (w: string) => (/^[sšzž]/i.test(w) ? "sa " : "s ") + w
const andList = (xs: string[], lang: Lang) => (xs.length < 2 ? xs.join("") : xs.slice(0, -1).join(", ") + (lang === "hr" ? " i " : " and ") + xs[xs.length - 1])

/* Meal builder. Amounts are raw (weighed before cooking): cooking changes the weight, not the calories.
   kcal per 100 g raw from USDA National Nutrient Database for Standard Reference, Release 28 (NDB numbers below).
   Parts by raw weight: meat 4, rice or oats 1, sweet potato or potato 3, vegetables 2 together. */
type BIng = { k: string; g: 0 | 1 | 2; kc: number; ndb: string; parts: number; waste: number; sec: "m" | "v" | "d" | "p"; n: LS; note?: LS; cook: LS }
const BUILD: BIng[] = [
    { k: "piletina", g: 0, kc: 120, ndb: "05062", parts: 4, waste: 1, sec: "m", n: X("Chicken breast, skinless", "Pileća prsa, bez kože"), note: X("fresh or frozen", "svježa ili smrznuta"), cook: X("Simmer the chicken in unsalted water with no seasoning until the thickest part reaches 74 °C, about 15–20 minutes. Cool it and shred it.", "Kuhaj piletinu u vodi bez soli i začina dok najdeblji dio ne dosegne 74 °C, oko 15–20 minuta. Ohladi je i usitni.") },
    { k: "puretina", g: 0, kc: 114, ndb: "05710", parts: 4, waste: 1, sec: "m", n: X("Turkey breast, skinless", "Pureća prsa, bez kože"), note: X("fresh or frozen", "svježa ili smrznuta"), cook: X("Simmer the turkey in unsalted water with no seasoning until the thickest part reaches 74 °C, about 20–25 minutes. Cool it and shred it.", "Kuhaj puretinu u vodi bez soli i začina dok najdeblji dio ne dosegne 74 °C, oko 20–25 minuta. Ohladi je i usitni.") },
    { k: "govedina", g: 0, kc: 176, ndb: "23562", parts: 4, waste: 1, sec: "m", n: X("Lean beef mince, 10% fat", "Mljevena govedina, 10 % masti"), cook: X("Brown the mince in a pan without oil, breaking it up, until no pink is left. Pour off the fat.", "Peci mljevenu govedinu u tavi bez ulja, usitnjavajući je, dok ne nestane ružičaste boje. Ocijedi masnoću.") },
    { k: "riba", g: 0, kc: 208, ndb: "15236", parts: 4, waste: 1, sec: "m", n: X("Salmon fillet", "File lososa"), note: X("fresh or frozen, without bones", "svježi ili smrznuti, bez kostiju"), cook: X("Steam or poach the salmon for 10–12 minutes, until it flakes. Take out every bone.", "Kuhaj lososa na pari ili u malo vode 10–12 minuta, dok se ne razdvaja na listiće. Izvadi sve kosti.") },
    { k: "jaja", g: 0, kc: 143, ndb: "01123", parts: 4, waste: 1, sec: "d", n: X("Eggs, without the shell", "Jaja, bez ljuske"), cook: X("Hard-boil the eggs for 10 minutes, then peel and chop them.", "Skuhaj jaja tvrdo, 10 minuta, pa ih oguli i nasjeckaj.") },
    { k: "riza", g: 1, kc: 365, ndb: "20044", parts: 1, waste: 1, sec: "p", n: X("White rice, uncooked", "Bijela riža, nekuhana"), cook: X("Cook the rice in unsalted water until it is soft.", "Skuhaj rižu u vodi bez soli dok ne omekša.") },
    { k: "zob", g: 1, kc: 379, ndb: "08120", parts: 1, waste: 1, sec: "p", n: X("Rolled oats", "Zobene pahuljice"), cook: X("Cook the oats in unsalted water into a porridge, about 5 minutes.", "Skuhaj zobene pahuljice u vodi bez soli u kašu, oko 5 minuta.") },
    { k: "batat", g: 1, kc: 86, ndb: "11507", parts: 3, waste: 1.15, sec: "v", n: X("Sweet potato, peeled", "Batat, oguljen"), cook: X("Peel and dice the sweet potato and boil it for about 15 minutes, until soft.", "Oguli batat, nareži ga na kockice i kuhaj oko 15 minuta, dok ne omekša.") },
    { k: "krumpir", g: 1, kc: 77, ndb: "11352", parts: 3, waste: 1.15, sec: "v", n: X("Potato, peeled", "Krumpir, oguljen"), cook: X("Peel and dice the potato and boil it for 15–20 minutes, until soft. Never give raw or green potato.", "Oguli krumpir, nareži ga na kockice i kuhaj 15–20 minuta, dok ne omekša. Nikad ne daj sirov ni zelen krumpir.") },
    { k: "mrkva", g: 2, kc: 41, ndb: "11124", parts: 2, waste: 1.1, sec: "v", n: X("Carrot, peeled", "Mrkva, oguljena"), cook: X("Peel and dice the carrot and steam it for 8–10 minutes.", "Oguli mrkvu, nareži je na kockice i kuhaj na pari 8–10 minuta.") },
    { k: "tikvica", g: 2, kc: 17, ndb: "11477", parts: 2, waste: 1.05, sec: "v", n: X("Zucchini", "Tikvica"), cook: X("Dice the zucchini and steam it for about 5 minutes.", "Nareži tikvicu na kockice i kuhaj na pari oko 5 minuta.") },
    { k: "spinat", g: 2, kc: 29, ndb: "11463", parts: 2, waste: 1, sec: "v", n: X("Frozen spinach", "Smrznuti špinat"), cook: X("Cook the frozen spinach in a little water for a few minutes, then drain it.", "Smrznuti špinat kuhaj nekoliko minuta u malo vode, pa ga ocijedi.") },
    { k: "grasak", g: 2, kc: 77, ndb: "11312", parts: 2, waste: 1, sec: "v", n: X("Frozen peas", "Smrznuti grašak"), cook: X("Boil the frozen peas for 3–4 minutes and drain them.", "Smrznuti grašak kuhaj 3–4 minute, pa ga ocijedi.") },
    { k: "bundeva", g: 2, kc: 26, ndb: "11422", parts: 2, waste: 1.4, sec: "v", n: X("Pumpkin, peeled, without seeds", "Bundeva, oguljena, bez sjemenki"), cook: X("Peel the pumpkin, take out the seeds, dice it and steam it for 10–15 minutes.", "Oguli bundevu, izvadi sjemenke, nareži je na kockice i kuhaj na pari 10–15 minuta.") },
]
const BI: Record<string, BIng> = Object.fromEntries(BUILD.map((b) => [b.k, b]))
const B_DAYS = [1, 3, 7]
const B_MAX = 30
const EGG_G = 50 // one large egg without the shell (USDA)
/* raw grams for a batch: total kcal = budget × days; ≥ 20 g rounds down to 5 g, smaller amounts to 1 g (at least 1 g), then the meat is trimmed until the portion is not over the budget */
const buildGrams = (keys: string[], days: number, budget: number) => {
    const items = keys.map((k) => BI[k]).filter(Boolean)
    const vegN = items.filter((b) => b.g === 2).length
    const w = items.map((b) => (b.g === 2 ? 2 / vegN : b.parts))
    const sw = w.reduce((a, b) => a + b, 0)
    const kcPerG = items.reduce((s, b, i) => s + (w[i] / sw) * (b.kc / 100), 0)
    const total = (budget * days) / kcPerG
    const g = items.map((b, i) => {
        const v = (total * w[i]) / sw
        return Math.max(1, v >= 20 ? Math.floor(v / 5) * 5 : Math.floor(v))
    })
    const kcOf = () => items.reduce((s, b, i) => s + (g[i] * b.kc) / 100, 0)
    while (kcOf() > budget * days && g[0] > 1) g[0] -= g[0] > 20 ? 5 : 1
    return { items, g, kcal: kcOf() / days }
}
/* shopping amount: vegetables get a little extra for the peel */
const buyAmount = (b: BIng, g: number, lang: Lang) =>
    b.k === "jaja" ? (lang === "en" ? Math.ceil(g / EGG_G) + (Math.ceil(g / EGG_G) === 1 ? " egg" : " eggs") : Math.ceil(g / EGG_G) + " " + plHr(Math.ceil(g / EGG_G), ["jaje", "jaja", "jaja"])) : (lang === "en" ? "about " : "oko ") + nf(Math.ceil((g * b.waste) / 10) * 10, lang) + " g"

/* shopping list kept in this browser only */
type LItem = { id: string; t: "b"; keys: string[]; days: number; g: number[] } | { id: string; t: "r"; rid: string; m?: number }
type LItemR = Extract<LItem, { t: "r" }>
const LIST_M_MAX = 999
type LState = { items: LItem[]; done: Record<string, boolean> }
const LIST_KEY = "fz-list"
const readList = (): LState => {
    try {
        const v = JSON.parse(window.localStorage.getItem(LIST_KEY) || "null")
        if (v && Array.isArray(v.items)) {
            const ok = (it: any) =>
                it &&
                typeof it.id === "string" &&
                ((it.t === "r" && typeof it.rid === "string" && (it.m === undefined || (Number.isInteger(it.m) && it.m >= 1 && it.m <= LIST_M_MAX))) ||
                    (it.t === "b" && Array.isArray(it.keys) && it.keys.length > 0 && it.keys.every((k: string) => !!BI[k]) && Array.isArray(it.g) && it.g.length === it.keys.length && Number.isInteger(it.days) && it.days >= 1 && it.days <= B_MAX))
            return { items: v.items.filter(ok), done: v.done && typeof v.done === "object" ? v.done : {} }
        }
    } catch (e) {}
    return { items: [], done: {} }
}
const writeList = (s: LState) => {
    try {
        window.localStorage.setItem(LIST_KEY, JSON.stringify(s))
    } catch (e) {}
}
/* shop section of a recipe line (English text) */
const WATER_RX = /^[\d\s.,/½¼¾⅓⅔–-]*(?:ml|l|g|tbsp|tsp|cups?|tablespoons?|teaspoons?)?\s*(?:of\s+)?(?:warm\s+|cold\s+|filtered\s+|hot\s+|boiling\s+)?water\b(?!.*\bor\b)/i
const MEAT_RX = /\b(?:chicken|turkey|beef|pork|lamb|duck|venison|bison|veal|rabbit|liver|hearts?|gizzards?|kidneys?|salmon|tuna|sardines?|cod|fish|mackerel|whitefish|tilapia|trout|pollock|hake|shrimp|bacon|ham|meat|mince)\b/i
const BROTH_RX = /\b(?:broth|stock|oil)\b/i
const DAIRY_RX = /\b(?:eggs?|yogh?urt|cheese|cheddar|mozzarella|parmesan|cottage|kefir|milk|butter)\b/i
const NOTDAIRY_RX = /\b(?:peanut|almond|nut|seed|sunflower|cashew|apple|pumpkin|coconut|oat|rice|soy)\s+(?:butter|milk)\b|\b(?:flax|chia)(?:seed)?\s+eggs?\b/gi
const VEG_RX = /\b(?:carrots?|apples?|bananas?|blueberr\w*|strawberr\w*|raspberr\w*|blackberr\w*|cranberr\w*|cherr\w*|pumpkin|sweet\s+potato(?:es)?|potato(?:es)?|yams?|spinach|kale|zucchinis?|courgettes?|peas|green\s+beans?|broccoli|cauliflower|celery|cucumbers?|parsley|mint|basil|watermelon|melon|pears?|mango(?:es)?|kiwis?|beets?|squash|lettuce|cabbage|tomato(?:es)?|peach(?:es)?|pineapple)\b/i
const lineSec = (en: string): "m" | "v" | "d" | "p" | "s" | null => {
    if (WATER_RX.test(en)) return null
    if (SPECIAL_RX.test(en)) return "s"
    if (MEAT_RX.test(en) && !BROTH_RX.test(en)) return "m"
    if (DAIRY_RX.test(en.replace(NOTDAIRY_RX, " "))) return "d"
    if (/\b(?:applesauce|apple\s+sauce|dried)\b/i.test(en)) return "p"
    if (VEG_RX.test(en)) return "v"
    return "p"
}
const iconOf = (en: string) => {
    for (const d of ING_DEFS) if (d.rx && hasIng(d, [en])) return d.em
    return null
}
const L_SECS: ("m" | "v" | "d" | "p" | "s")[] = ["m", "v", "d", "p", "s"]

/* --------------------------------------------------------------------- css */

const CSS = `${FONTS}
.fz{--g:#2F5D3A;--g2:#264D30;--g0:#E7EFE7;--sky:#98CFE7;--sky0:#E6F3FA;--skyInk:#1F6A94;--or:#ED8824;--or0:#FDEBD8;--orInk:#9A520A;--ink:#1D1D1F;--ink2:#5F5E63;--ink3:#4A4740;--line:rgba(29,29,31,.1);--bg:#FBF7EF;--bg2:#F4EEE2;--card:#FFFEFA;--sh:0 1px 2px rgba(0,0,0,.04),0 18px 40px -26px rgba(60,40,20,.32);
position:relative;width:100%;overflow-x:clip;background:var(--bg);color:var(--ink);font-family:FzInter,Inter,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;font-size:17px;line-height:1.45;font-optical-sizing:auto;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;text-align:left;overflow-wrap:break-word}
:where(.fz) *,:where(.fz) *::before,:where(.fz) *::after{box-sizing:border-box;margin:0;padding:0}
:where(.fz) button,:where(.fz) a,:where(.fz) summary,:where(.fz) label{touch-action:manipulation}
:where(.fz) button{font:inherit;color:inherit;background:none;border:0;cursor:pointer;text-align:inherit;-webkit-tap-highlight-color:transparent}
:where(.fz) a{color:inherit;text-decoration:none}
:where(.fz) img{display:block;max-width:100%}
:where(.fz) input{font:inherit;color:inherit}
:where(.fz) ul,:where(.fz) ol{list-style:none}
.fz :focus-visible{outline:3px solid #6FA9DD;outline-offset:2px;border-radius:6px}
.fz-in{container-type:inline-size;container-name:fz}
.fz-wrap{width:100%;max-width:1168px;margin:0 auto;padding:0 24px;position:relative}
.fz-hand{font-family:FzHand,"Segoe Print","Bradley Hand",cursive;font-weight:700}
.fz-page{animation:fzIn .4s cubic-bezier(.2,.7,.2,1) both}
@keyframes fzIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
/* bar */
.fz-bar{background:#1D1D1F;color:#D2D2D7;font-size:13px}
.fz-bar .fz-wrap{min-height:34px;display:flex;align-items:center;justify-content:space-between;gap:12px}
.fz-bar a{color:#fff;font-weight:600;display:inline-flex;align-items:center;gap:4px;min-height:28px}
@media (hover:hover){.fz-bar a:hover{text-decoration:underline}}
/* nav */
.fz-nav{position:sticky;top:0;z-index:20;background:rgba(251,247,239,.84);-webkit-backdrop-filter:saturate(180%) blur(18px);backdrop-filter:saturate(180%) blur(18px);border-bottom:1px solid var(--line)}
.fz-nav .fz-wrap{height:64px;display:flex;align-items:center;justify-content:space-between;gap:20px}
.fz-nl{display:flex;align-items:center;gap:40px;min-width:0}
.fz-logo{display:block;flex:none}
.fz-logo img{height:34px;width:auto}
.fz-links{display:flex;gap:28px;font-size:15px;color:var(--ink2)}
@media (hover:hover){.fz-links button:hover{color:var(--ink)}}
.fz-links button[aria-current="page"]{color:var(--ink);font-weight:600}
.fz-nr{display:flex;align-items:center;gap:12px;flex:none}
.fz-lang{display:flex;padding:3px;border-radius:999px;background:var(--bg2)}
.fz-lang button{padding:5px 11px;border-radius:999px;font-size:13px;font-weight:600;color:var(--ink2);line-height:1.2}
.fz-lang button[aria-pressed="true"]{background:#fff;color:var(--ink);box-shadow:0 1px 2px rgba(0,0,0,.14)}
.fz-burger{display:none;width:40px;height:40px;border-radius:12px;align-items:center;justify-content:center}
@media (hover:hover){.fz-burger:hover{background:var(--bg2)}}
.fz-drop{border-top:1px solid var(--line);padding:8px 0 16px}
.fz-drop button{display:flex;width:100%;padding:14px 0;font-size:20px;font-weight:600;letter-spacing:-.01em;border-bottom:1px solid var(--line)}
.fz-drop .fz-btn{margin-top:16px;width:100%;border:0}
/* buttons */
.fz-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;height:48px;padding:0 24px;border-radius:999px;font-size:16px;font-weight:600;white-space:nowrap;transition:transform .15s ease,background-color .2s ease,box-shadow .2s ease,opacity .2s}
.fz-btn:active{transform:scale(.97)}
.fz-btn--p{background:var(--g);color:#fff}
@media (hover:hover){.fz-btn--p:hover{background:var(--g2)}}
.fz-btn--g{color:var(--g);box-shadow:inset 0 0 0 1.5px var(--g)}
@media (hover:hover){.fz-btn--g:hover{background:var(--g0)}}
.fz-btn--w{background:#fff;color:var(--g)}
@media (hover:hover){.fz-btn--w:hover{background:#F2F7F2}}
.fz-btn--sm{height:36px;padding:0 15px;font-size:14px}
.fz-btn[disabled]{opacity:.42;cursor:not-allowed;transform:none}
.fz-link{color:var(--g);font-weight:600;display:inline-flex;align-items:center;gap:6px;min-height:24px}
@media (hover:hover){.fz-link:hover{text-decoration:underline}}
/* type */
.fz-eb{font-size:15px;font-weight:600;color:var(--g);letter-spacing:.005em}
.fz-h1{font-size:72px;line-height:1;letter-spacing:-.04em;font-weight:700;text-wrap:balance}
.fz-h2{font-size:52px;line-height:1.04;letter-spacing:-.035em;font-weight:700;text-wrap:balance}
.fz-h3{font-size:24px;line-height:1.2;letter-spacing:-.02em;font-weight:700}
.fz-lead{font-size:20px;line-height:1.45;color:var(--ink3);margin-top:14px;max-width:640px}
.fz-sec{padding:96px 0;scroll-margin-top:72px}
.fz-sec--2{background:var(--bg2)}
.fz-ruled{background-image:repeating-linear-gradient(to bottom,transparent 0 39px,rgba(61,143,214,.11) 39px 40px)}
/* notebook bits */
.fz-tape{position:absolute;height:32px;background:rgba(150,196,238,.78);background-image:repeating-linear-gradient(45deg,rgba(255,255,255,.28) 0 7px,transparent 7px 14px);clip-path:polygon(3% 0,97% 0,100% 16%,97% 32%,100% 50%,97% 68%,100% 84%,97% 100%,3% 100%,0 84%,3% 68%,0 50%,3% 32%,0 16%);z-index:4;pointer-events:none}
.fz-tape--o{background-color:rgba(247,196,160,.86)}
.fz-tape--g{background-color:rgba(196,210,160,.88)}
.fz-pol{position:relative;background:#fff;padding:14px 14px 62px;box-shadow:0 26px 44px -18px rgba(60,40,20,.36),0 2px 6px rgba(60,40,20,.12)}
.fz-pol img{width:100%;height:auto;aspect-ratio:3/4;object-fit:cover}
.fz-cap{position:absolute;left:0;right:0;bottom:12px;text-align:center;font-size:32px;line-height:1}
.fz-note{position:absolute;z-index:6;padding:16px 18px;font-size:26px;line-height:1.05;color:#3a3226;box-shadow:0 16px 22px -12px rgba(80,50,20,.35),0 1px 2px rgba(80,50,20,.1);pointer-events:none}
.fz-note small{display:block;font-size:21px;margin-top:4px}
.fz-scrib{position:absolute;z-index:6;color:var(--g);font-size:28px;line-height:1.05;pointer-events:none;display:flex;align-items:center;gap:6px;white-space:nowrap}
/* hero */
.fz-hero{padding:64px 0 80px}
.fz-hero .fz-wrap{display:grid;grid-template-columns:minmax(0,1fr) 400px;gap:72px;align-items:center}
.fz-hero .fz-h1{margin-top:16px}
.fz-sub{font-size:21px;line-height:1.45;color:var(--ink3);margin-top:22px;max-width:540px}
.fz-ctas{display:flex;gap:12px;margin-top:32px;flex-wrap:wrap}
.fz-hp{position:relative;justify-self:center;width:380px;transform:rotate(3deg)}
.fz-hp .fz-scrib{left:-200px;top:44%;transform:rotate(-6deg)}
.fz-hp .fz-hs2{display:none}
/* calculator */
.fz-calc{position:relative;margin-top:40px;border-radius:32px;background:var(--card);padding:40px 44px;display:grid;grid-template-columns:1fr 1fr;gap:48px;box-shadow:var(--sh)}
.fz-lbl{display:block;font-size:14px;font-weight:600;color:var(--ink2);margin-bottom:10px}
.fz-kg{font-size:64px;font-weight:700;letter-spacing:-.04em;line-height:1;font-variant-numeric:tabular-nums}
.fz-kg small{font-size:26px;font-weight:600;margin-left:6px;color:var(--ink2);letter-spacing:-.01em}
.fz-range{-webkit-appearance:none;appearance:none;display:block;width:100%;height:28px;background:transparent;margin:14px 0 26px;cursor:pointer;touch-action:pan-y}
.fz-range::-webkit-slider-runnable-track{height:8px;border-radius:99px;background:linear-gradient(var(--g),var(--g)) 0/var(--p,30%) 100% no-repeat,rgba(29,29,31,.1)}
.fz-range::-webkit-slider-thumb{-webkit-appearance:none;width:28px;height:28px;margin-top:-10px;border-radius:50%;background:#fff;border:0;box-shadow:0 2px 8px rgba(0,0,0,.25),0 0 0 .5px rgba(0,0,0,.06)}
.fz-range::-moz-range-track{height:8px;border-radius:99px;background:rgba(29,29,31,.1)}
.fz-range::-moz-range-progress{height:8px;border-radius:99px;background:var(--g)}
.fz-range::-moz-range-thumb{width:28px;height:28px;border:0;border-radius:50%;background:#fff;box-shadow:0 2px 8px rgba(0,0,0,.25)}
.fz-seg{display:inline-flex;flex-wrap:wrap;padding:4px;border-radius:14px;background:var(--bg2);gap:4px}
.fz-seg button{padding:9px 16px;border-radius:10px;font-size:15px;font-weight:500;color:var(--ink2);transition:background-color .2s,color .2s}
@media (hover:hover){.fz-seg button:hover{color:var(--ink)}}
.fz-seg button[aria-pressed="true"]{background:#fff;color:var(--ink);font-weight:600;box-shadow:0 1px 3px rgba(0,0,0,.13)}
.fz-est{font-size:13.5px;color:var(--ink2);margin-top:16px;max-width:380px}
.fz-res{display:flex;flex-direction:column;gap:14px}
.fz-tile{border-radius:22px;padding:22px 24px;background:var(--g0)}
.fz-tile--o{background:var(--or0)}
.fz-tile .k{font-size:14px;font-weight:600;color:var(--g)}
.fz-tile--o .k{color:var(--orInk)}
.fz-tile .v{font-size:46px;font-weight:700;letter-spacing:-.035em;line-height:1.05;margin-top:8px;font-variant-numeric:tabular-nums}
.fz-tile .v small{font-size:19px;font-weight:600;color:var(--ink2);margin-left:5px;letter-spacing:-.01em}
.fz-tile .v em{font-style:normal;font-size:19px;font-weight:600;color:var(--ink2);margin-right:6px;letter-spacing:-.01em}
.fz-tile .d{font-size:15px;color:var(--ink2);margin-top:6px}
.fz-calc .fz-note{right:-18px;top:-30px;width:196px;background:#E3EAC6;transform:rotate(5deg)}
.fz-kgrow{display:flex;align-items:center;gap:14px}
.fz-kgrow .fz-kg{min-width:150px;text-align:center}
.fz-step{width:44px;height:44px;flex:none;border-radius:50%;background:var(--bg2);font-size:24px;font-weight:600;line-height:1;display:grid;place-items:center;color:var(--ink);transition:background-color .2s,opacity .2s}
@media (hover:hover){.fz-step:hover{background:#ECE4D4}}
.fz-step:disabled{opacity:.35;cursor:default}
.fz-gap2{height:18px}
.fz-kcin{display:flex;align-items:center;gap:12px;margin-top:12px}
.fz-kcin .fz-inp{width:104px;text-align:center}
.fz-kcin span{font-size:15px;font-weight:600;color:var(--ink2)}
.fz-tile--s{background:var(--sky0)}
.fz-tile--s .k{color:var(--skyInk)}
.fz-cx{margin-top:24px;display:grid;grid-template-columns:minmax(0,5fr) minmax(0,7fr);gap:16px;align-items:start}
.fz-start{font-size:16px;line-height:1.55;color:var(--ink3);padding:20px 24px;border-radius:22px;background:var(--card);box-shadow:var(--sh)}
.fz-det{border-radius:22px;background:var(--card);box-shadow:var(--sh);padding:0 24px}
.fz-det[open]{padding-bottom:24px}
.fz-det summary{list-style:none;cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:20px 0;font-size:18px;font-weight:700}
.fz-det summary::-webkit-details-marker{display:none}
.fz-det summary svg{flex:none;color:var(--ink2);transition:transform .25s}
.fz-det[open] summary svg{transform:rotate(180deg)}
.fz-calcs{list-style:none;counter-reset:c;display:grid;gap:14px}
.fz-calcs li{counter-increment:c;position:relative;padding-left:40px;display:grid;gap:3px}
.fz-calcs li::before{content:counter(c);position:absolute;left:0;top:-2px;width:28px;height:28px;border-radius:50%;background:var(--g0);color:var(--g);font-size:14px;font-weight:700;display:grid;place-items:center}
.fz-calcs b{font-size:16px;font-weight:600}
.fz-calcs span{font-size:16px;color:var(--ink3);font-variant-numeric:tabular-nums}
.fz-calcs sup,.fz-csrc sup{font-size:.68em;line-height:0}
.fz-fac{margin-top:20px;border-radius:16px;background:var(--bg2);padding:4px 16px}
.fz-fac .h{font-size:14px;font-weight:600;color:var(--ink2);padding:10px 0 8px}
.fz-fac .r{display:flex;justify-content:space-between;align-items:baseline;gap:16px;padding:10px 0;border-top:1px solid var(--line);font-size:15px}
.fz-fac .r b{font-weight:600;font-variant-numeric:tabular-nums;white-space:nowrap}
.fz-fac .r[aria-current]{color:var(--g)}
.fz-fac .r[aria-current] span{font-weight:700}
.fz-fac .r[aria-current] span::before{content:"";display:inline-block;width:8px;height:8px;border-radius:50%;background:var(--g);margin-right:8px;vertical-align:1px}
.fz-csrc{font-size:14px;line-height:1.5;color:var(--ink2);margin-top:14px}
.fz-csrc a{color:var(--g);text-decoration:underline;text-underline-offset:2px}
.fz-box .fz-hint .fz-link{font-size:14px}
.fz-sech{display:flex;align-items:baseline;gap:10px;font-size:26px;font-weight:700;letter-spacing:-.02em;margin:44px 0 20px}
.fz-sech small{font-size:16px;font-weight:600;color:var(--ink2);font-variant-numeric:tabular-nums}
.fz-count + .fz-sech{margin-top:26px}
.fz-skel{border-radius:24px;background:var(--card);box-shadow:var(--sh);aspect-ratio:4/5;animation:fzpulse 1.3s ease-in-out infinite alternate}
@keyframes fzpulse{from{opacity:1}to{opacity:.55}}
.fz-hrnote{font-size:15px;line-height:1.5;color:var(--ink3);background:var(--sky0);border-radius:16px;padding:14px 18px;margin:72px 0 -28px}
.fz-alc{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}
/* recipe cards */
.fz-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:32px 26px;margin-top:40px}
.fz-grid--4{grid-template-columns:repeat(4,minmax(0,1fr));gap:30px 22px}
.fz-rc{position:relative;background:#fff;padding:10px 10px 0;border-radius:6px;box-shadow:0 1px 2px rgba(0,0,0,.05),0 18px 34px -24px rgba(60,40,20,.38);transform:rotate(var(--r,0deg));transition:transform .3s cubic-bezier(.2,.7,.2,1),box-shadow .3s;display:flex;flex-direction:column}
@media (hover:hover){.fz-rc:hover{transform:rotate(0deg) translateY(-4px);box-shadow:0 1px 2px rgba(0,0,0,.05),0 26px 40px -22px rgba(60,40,20,.42)}}
.fz-rc .im{display:block;width:100%;aspect-ratio:4/3;overflow:hidden;border-radius:2px;background:var(--bg2)}
.fz-rc .im img{width:100%;height:100%;object-fit:cover;transition:transform .5s cubic-bezier(.2,.7,.2,1)}
@media (hover:hover){.fz-rc:hover .im img{transform:scale(1.03)}}
.fz-rc .b{padding:14px 8px 16px;display:flex;flex-direction:column;flex:1}
.fz-rc h3{font-size:19px;line-height:1.25;letter-spacing:-.015em;font-weight:700}
@media (hover:hover){.fz-rc h3 button:hover{text-decoration:underline;text-decoration-thickness:1.5px;text-underline-offset:3px}}
.fz-rc .m{font-size:14px;color:var(--ink2);margin-top:6px}
.fz-rc .w{font-size:13px;color:var(--orInk);margin-top:6px}
.fz-rc .row{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:auto;padding-top:14px;flex-wrap:wrap}
.fz-rc .tags{display:flex;gap:6px;flex-wrap:wrap}
.fz-rc .bb{display:flex;gap:6px}
.fz-tag{display:inline-flex;align-items:center;gap:4px;padding:4px 10px;border-radius:999px;font-size:12.5px;font-weight:700;line-height:1.3}
.fz-tag--t{background:var(--or0);color:var(--orInk)}
.fz-tag--p{background:var(--sky0);color:var(--skyInk)}
.fz-tag--b{background:var(--g0);color:var(--g)}
.fz-tag--x{background:var(--bg2);color:var(--ink2)}
.fz-center{display:flex;justify-content:center;margin-top:44px}
/* two ways */
.fz-two{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-top:40px}
.fz-way{position:relative;border-radius:30px;padding:34px 34px 32px;background:var(--card);box-shadow:var(--sh);display:flex;flex-direction:column;gap:14px;overflow:hidden}
.fz-way--g{background:var(--g);color:#fff}
.fz-way p{font-size:17px;color:var(--ink3);max-width:440px}
.fz-way--g p{color:rgba(255,255,255,.84)}
.fz-way ul{display:flex;flex-direction:column;gap:10px;margin:6px 0 10px}
.fz-way li{display:flex;gap:10px;align-items:flex-start;font-size:16px;font-weight:500}
.fz-way li svg{margin-top:2px;color:var(--g)}
.fz-way--g li svg{color:var(--sky)}
.fz-way .fz-btn{align-self:flex-start;margin-top:auto}
.fz-way .bis{position:absolute;right:-20px;bottom:-18px;width:150px;transform:rotate(-18deg);opacity:.95;pointer-events:none}
.fz-way .pou{position:absolute;right:26px;bottom:-34px;transform:rotate(8deg);pointer-events:none}
/* how */
.fz-how{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;margin-top:40px;counter-reset:h}
.fz-hw{border-radius:26px;padding:28px;background:var(--card);box-shadow:var(--sh)}
.fz-hw .n{width:40px;height:40px;border-radius:50%;background:var(--g);color:#fff;font-weight:700;display:flex;align-items:center;justify-content:center;font-size:17px}
.fz-hw h3{margin-top:18px}
.fz-hw p{color:var(--ink3);margin-top:8px;font-size:16px}
/* story */
.fz-story{display:grid;grid-template-columns:minmax(0,1fr) 420px;gap:64px;align-items:center}
.fz-story p{font-size:19px;line-height:1.55;color:var(--ink3);margin-top:18px;max-width:560px}
.fz-sign{font-size:30px;line-height:1.1;color:var(--g);margin-top:14px}
.fz-story .ig{display:flex;align-items:center;gap:14px;margin-top:24px}
.fz-badge{display:flex;align-items:center;justify-content:center;border-radius:50%;background:#98CFE7;flex:none}
.fz-badge img{width:74%;height:auto}
.fz-story .ig .av{width:52px;height:52px}
.fz-story .ig b{display:block;font-size:16px}
.fz-story .ig span{font-size:14px;color:var(--ink2)}
.fz-board{position:relative;height:380px}
.fz-board .b1{position:absolute;left:20px;top:30px;width:190px;transform:rotate(-12deg)}
.fz-board .b2{position:absolute;right:30px;top:120px;width:170px;transform:rotate(16deg)}
.fz-board .lg{position:absolute;left:120px;top:150px;width:170px;height:170px;box-shadow:0 22px 34px -16px rgba(60,40,20,.4);transform:rotate(-4deg)}
.fz-board .fz-note{left:240px;top:6px;width:170px;background:#FCE9A6;transform:rotate(4deg)}
/* faq */
.fz-faq{margin-top:36px;max-width:860px}
.fz-faqseal{position:absolute;right:calc(24px - max(0px,min(104px,(100cqw - 100%) / 2 - 16px)));bottom:-6px;width:min(210px,calc(100% - 948px));aspect-ratio:1;transform:rotate(14deg);pointer-events:none}
.fz-faqseal svg{display:block;width:100%;height:100%;mix-blend-mode:multiply}
.fz-sealink{opacity:.3}.fz-seall{stroke:#A8803F}.fz-sealt{fill:#A8803F}
@container fz (max-width:1090px){.fz-faqseal{display:none}}
.fz-faq details{border-bottom:1px solid var(--line)}
.fz-faq summary{list-style:none;display:flex;justify-content:space-between;align-items:center;gap:16px;padding:20px 0;font-size:19px;font-weight:600;letter-spacing:-.01em;cursor:pointer}
.fz-faq summary::-webkit-details-marker{display:none}
.fz-faq summary i{flex:none;width:28px;height:28px;border-radius:50%;background:var(--bg2);position:relative;transition:transform .25s ease}
.fz-faq summary i::before,.fz-faq summary i::after{content:"";position:absolute;left:8px;right:8px;top:13px;height:2px;border-radius:2px;background:var(--ink)}
.fz-faq summary i::after{transform:rotate(90deg);transition:transform .25s ease}
.fz-faq details[open] summary i::after{transform:rotate(0)}
.fz-faq details p{padding:0 44px 22px 0;color:var(--ink3);font-size:17px;max-width:720px}
/* footer */
.fz-foot{background:var(--g);color:rgba(247,242,231,.85);padding:60px 0 40px;font-size:15px}
.fz-foot .top{display:grid;grid-template-columns:1.4fr 1fr 1fr;gap:40px}
.fz-foot .wm{height:42px;width:auto}
.fz-foot .tg{font-size:13px;font-weight:700;letter-spacing:.14em;color:#fff;margin-top:14px}
.fz-foot h2{font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--sky);margin-bottom:12px}
.fz-foot li{margin-bottom:4px}
.fz-foot li button,.fz-foot li a{display:inline-flex;align-items:center;min-height:28px}
@media (hover:hover){.fz-foot li button:hover,.fz-foot li a:hover{color:#fff;text-decoration:underline}}
.fz-foot .small{border-top:1px solid rgba(255,255,255,.18);margin-top:40px;padding-top:22px;font-size:13px;line-height:1.55;color:rgba(247,242,231,.75);display:flex;flex-direction:column;gap:4px}
/* recipes page */
.fz-ph{padding:52px 0 30px}
.fz-ph .fz-h1{font-size:68px}
.fz-search{display:flex;align-items:center;gap:12px;height:58px;border-radius:18px;background:#fff;padding:0 8px 0 20px;margin-top:30px;max-width:760px;box-shadow:0 1px 2px rgba(0,0,0,.05),0 10px 24px -18px rgba(0,0,0,.28);color:var(--ink2)}
.fz-search:focus-within{box-shadow:0 0 0 3px rgba(47,93,58,.25),0 10px 24px -18px rgba(0,0,0,.28)}
.fz-search input{flex:1;min-width:0;height:100%;border:0;outline:0;background:transparent;font-size:17px;color:var(--ink)}
.fz-search input::placeholder{color:#8E8A82}
.fz-search button{width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:var(--bg2)}
.fz-filters{display:flex;gap:8px;flex-wrap:wrap;margin-top:16px;align-items:center}
.fz-filters .lb{font-size:14px;font-weight:600;color:var(--ink2);margin-right:4px}
.fz-chip{display:inline-flex;align-items:center;gap:6px;padding:9px 15px;border-radius:999px;font-size:15px;font-weight:600;background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.06);transition:background-color .2s,color .2s}
@media (hover:hover){.fz-chip:hover{background:#F7F3EA}}
.fz-chip[aria-pressed="true"]{background:var(--g);color:#fff}
.fz-chip--no[aria-pressed="true"]{background:var(--or0);color:var(--orInk);box-shadow:inset 0 0 0 1.5px rgba(154,82,10,.35);text-decoration:line-through;text-decoration-thickness:2px}
.fz-count{display:flex;justify-content:space-between;align-items:center;gap:12px;margin:34px 0 0;font-size:15px;color:var(--ink2)}
.fz-count b{color:var(--ink)}
.fz-empty{text-align:center;padding:60px 0 20px;position:relative}
.fz-empty p{font-size:19px;color:var(--ink3)}
.fz-empty .fz-hand{font-size:30px;color:var(--g);margin-top:8px}
.fz-src{font-size:13.5px;color:var(--ink2);text-align:center;margin:56px 0 96px}
.fz-ph .fz-note{right:12px;top:58px;width:184px;background:#E3EAC6;transform:rotate(5deg)}
/* recipe page */
.fz-rp{padding:36px 0 96px}
.fz-crumb{display:flex;align-items:center;gap:6px;font-size:15px;color:var(--ink2)}
.fz-crumb button{display:inline-flex;align-items:center;gap:4px;font-weight:600;color:var(--g);min-height:28px}
@media (hover:hover){.fz-crumb button:hover{text-decoration:underline}}
.fz-rp .fz-h1{font-size:60px;line-height:1.02;margin-top:12px;max-width:900px}
.fz-chips{display:flex;gap:8px;flex-wrap:wrap;margin-top:18px;align-items:center}
.fz-ch{display:inline-flex;align-items:center;gap:6px;padding:7px 13px;border-radius:999px;font-size:14px;font-weight:600;background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.06)}
.fz-ch.pr{margin-left:auto}
@media (hover:hover){.fz-ch.pr:hover{background:#F7F3EA}}
.fz-rpg{display:grid;grid-template-columns:minmax(0,1fr) 360px;grid-template-areas:"ph side" "bd side";column-gap:48px;row-gap:0;margin-top:32px;align-items:start}
.fz-rpg>.ph{grid-area:ph;min-width:0}
.fz-rpg>.bd{grid-area:bd;min-width:0}
.fz-photo{position:relative;background:#fff;padding:12px;border-radius:4px;box-shadow:0 22px 40px -22px rgba(60,40,20,.35),0 1px 3px rgba(60,40,20,.1);transform:rotate(-.6deg)}
.fz-photo img{width:100%;height:440px;object-fit:cover;border-radius:2px}
.fz-photo .fz-scrib{right:-6px;bottom:-40px;transform:rotate(-3deg)}
.fz-cols{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:44px;margin-top:64px}
.fz-colh{display:flex;align-items:flex-end;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:6px}
.fz-colh p{font-size:13.5px;color:var(--ink2);margin-top:4px}
.fz-bt{display:flex;align-items:center;gap:8px;font-size:13px;color:var(--ink2);font-weight:600}
.fz-bt .fz-seg button{padding:6px 11px;font-size:13.5px}
.fz-ing li{border-bottom:1px solid var(--line)}
.fz-ing label{display:flex;gap:12px;padding:12px 0;font-size:16px;line-height:1.4;cursor:pointer;align-items:flex-start}
.fz-ing input{position:absolute;opacity:0;width:1px;height:1px}
.fz-ing .bx{flex:none;width:22px;height:22px;border-radius:50%;box-shadow:inset 0 0 0 1.75px rgba(29,29,31,.28);display:flex;align-items:center;justify-content:center;color:#fff;margin-top:1px;transition:background-color .15s,box-shadow .15s}
.fz-ing input:checked+.bx{background:var(--g);box-shadow:none}
.fz-ing input:focus-visible+.bx{outline:3px solid #6FA9DD;outline-offset:2px}
.fz-ing .q{flex:none;min-width:74px;font-weight:700;font-variant-numeric:tabular-nums}
.fz-ing .t{flex:1;min-width:0}
.fz-ing input:checked~.q,.fz-ing input:checked~.t>span:first-child{color:var(--ink2);text-decoration:line-through}
.fz-ing .nt{display:block;font-size:13.5px;margin-top:4px;line-height:1.35}
.fz-ing .nt--w{color:var(--orInk)}
.fz-ing .nt--s{color:var(--g)}
.fz-ing .op{color:var(--ink2);font-weight:500}
.fz-steps{counter-reset:s;margin-top:14px}
.fz-steps li{position:relative;padding:0 0 18px 42px;font-size:16px;line-height:1.55;color:#33322F}
.fz-steps li::before{counter-increment:s;content:counter(s);position:absolute;left:0;top:0;width:28px;height:28px;border-radius:50%;background:var(--g0);color:var(--g);font-weight:700;font-size:14px;display:flex;align-items:center;justify-content:center}
.fz-side{grid-area:side;align-self:start;position:sticky;top:88px;display:flex;flex-direction:column;gap:16px}
.fz-box{position:relative;border-radius:24px;padding:22px 22px 24px;background:var(--card);box-shadow:var(--sh)}
.fz-box--g{background:var(--g);color:#fff}
.fz-box .k{font-size:12.5px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:var(--ink2)}
.fz-box--g .k{color:var(--sky)}
.fz-box .big{font-size:40px;font-weight:700;letter-spacing:-.035em;line-height:1.05;margin-top:10px;font-variant-numeric:tabular-nums}
.fz-box .big small{font-size:17px;font-weight:600;color:var(--ink2);margin-left:4px;letter-spacing:-.01em}
.fz-box .big .w{font-size:26px;letter-spacing:-.02em}
.fz-box .big em{font-style:normal;font-size:17px;font-weight:600;color:var(--ink2);margin-right:6px;letter-spacing:-.01em}
.fz-box .t{font-size:15px;line-height:1.45;color:var(--ink3);margin-top:8px}
.fz-mnote{font-size:14px;line-height:1.45;color:var(--ink2);margin-top:12px;padding:10px 12px;border-radius:12px;background:var(--bg2)}
.fz-mnote .fz-link{display:inline;font-weight:600;padding:4px 0}
.fz-feed{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-top:14px}
.fz-feed>span{font-size:14px;font-weight:600;color:var(--ink2)}
.fz-cook{margin-top:18px;padding-top:16px;border-top:1px dashed var(--line)}
.fz-cookd{display:flex;align-items:center;justify-content:space-between;gap:14px}
.fz-cookd .v{font-size:22px;font-weight:700;color:var(--ink);font-variant-numeric:tabular-nums}
.fz-cook .fz-cookr{margin:14px 0 8px}
.fz-cook .k2,.fz-vn .k2{font-size:15px;font-weight:700;color:var(--ink);margin-bottom:10px}
.fz-cook-p{margin-top:14px}
.fz-cook-p p{font-size:15px;line-height:1.45;color:var(--ink3);margin-top:8px}
.fz-cook-p p b{color:var(--ink);font-weight:700}
.fz-xk{display:inline-flex;align-items:center;height:30px;padding:0 12px;border-radius:99px;background:var(--g);color:#fff;font-size:15px;font-weight:700;font-variant-numeric:tabular-nums}
.fz-bstep{display:inline-flex;align-items:center;gap:8px}
.fz-bstep .fz-step{width:36px;height:36px;font-size:20px}
.fz-bstep output{min-width:34px;text-align:center;font-size:16px;font-weight:700;color:var(--ink);font-variant-numeric:tabular-nums}
.fz-vn{margin-top:18px;padding:14px 16px 16px;border-radius:16px;background:var(--bg2)}
.fz-vn.on{background:var(--g0)}
.fz-vn .t{font-size:14.5px;line-height:1.45;color:var(--ink2);margin-top:6px}
.fz-vn .v{font-size:19px;font-weight:700;color:var(--ink);letter-spacing:-.01em;overflow-wrap:anywhere}
.fz-vn .fine2{font-size:13px;line-height:1.4;color:var(--ink2);margin-top:8px}
.fz-vn-b{display:flex;align-items:center;gap:18px;flex-wrap:wrap;margin-top:12px}
.fz-vn .fz-inp{background:#fff;font-size:16px;font-weight:500;height:48px}
.fz-vn .fz-lbl{margin-bottom:6px}
.fz-low{font-size:22px;font-weight:700;letter-spacing:-.02em;line-height:1.2;margin-top:10px;color:var(--ink)}
.fz-share{display:flex;height:10px;border-radius:99px;background:var(--bg2);overflow:hidden;margin-top:14px}
.fz-share i{width:10%;background:var(--g);border-radius:99px 0 0 99px}
.fz-share-l{display:flex;justify-content:space-between;gap:8px;margin-top:6px;font-size:13px;color:var(--ink2)}
.fz-share-l b{color:var(--ink);font-weight:700}
.fz-share-l span:first-child b{color:var(--g)}
.fz-box .t .fz-link{display:inline;font-weight:600}
.fz-box--g .t{color:rgba(255,255,255,.84)}
.fz-box .mini{display:flex;align-items:center;gap:12px;margin-top:14px;font-size:15px;font-weight:700}
.fz-box .mini .fz-range{margin:0;flex:1}
.fz-box .mini span{min-width:52px;text-align:right;font-variant-numeric:tabular-nums}
.fz-box .fz-seg{margin-top:10px}
.fz-box .fz-seg button{padding:7px 12px;font-size:14px}
.fz-feed{container-type:inline-size}
.fz-feed .fz-seg{display:grid;grid-template-columns:repeat(3,1fr);width:100%}
.fz-feed .fz-seg button,.fz-box .fz-feed .fz-seg button{justify-content:center;text-align:center;line-height:1.25;padding:9px 8px}
@container (max-width:419px){.fz-feed .fz-seg{grid-template-columns:1fr}.fz-feed .fz-seg button,.fz-box .fz-feed .fz-seg button{justify-content:flex-start;text-align:left;padding:10px 14px;font-size:15px}}
.fz-box .ln{display:flex;align-items:center;gap:10px;font-size:15px;padding:9px 0;border-bottom:1px solid var(--line)}
.fz-box .ln:last-child{border-bottom:0;padding-bottom:0}
.fz-box .fine{font-size:13px;color:var(--ink2);margin-top:12px;padding-top:12px;border-top:1px solid var(--line)}
/* amounts, the simple way */
.fz-dsum{margin-top:8px}
.fz-dsum .fz-link{margin-left:2px}
.fz-ded{margin-top:12px;padding:14px 14px 4px;border-radius:16px;background:var(--bg2)}
.fz-ded .fz-lbl{margin:0 0 8px}
.fz-ded .fz-seg{background:#fff;margin-bottom:14px}
.fz-ded .fz-seg button[aria-pressed="true"]{background:var(--g0);color:var(--g);box-shadow:none}
.fz-ded .fz-hint{margin:-6px 0 12px}
.fz-feedr{display:grid;gap:8px}
.fz-wk{display:grid;gap:18px;max-width:760px;margin:0 auto 72px}
.fz-pstep{position:relative;border-radius:28px;padding:26px 26px 28px;background:var(--card);box-shadow:var(--sh)}
.fz-pstep>h2{display:flex;align-items:center;gap:12px;font-size:21px;font-weight:700;letter-spacing:-.01em;line-height:1.2;color:var(--ink);margin:0 0 18px}
.fz-pstep>h2 .n{flex:none;width:32px;height:32px;border-radius:50%;display:grid;place-items:center;background:var(--g);color:#fff;font-size:15px;font-weight:700}
.fz-pstep .fz-pf-ban{margin:0 0 18px}
.fz-wk-q{margin:2px 0 10px}
.fz-ppick{display:grid;gap:8px}
.fz-ppk.fz-dayr{padding:10px 12px;border-top:0;border-radius:18px;background:#fff;box-shadow:inset 0 0 0 1.5px var(--line);transition:box-shadow .2s,background-color .2s}
.fz-ppk.fz-dayr[aria-checked="true"]{box-shadow:inset 0 0 0 2px var(--g);background:#F6FAF6}
.fz-ppk>i{flex:none;width:22px;height:22px;border-radius:50%;box-shadow:inset 0 0 0 2px #B9B2A4;transition:box-shadow .2s}
.fz-ppk[aria-checked="true"]>i{box-shadow:inset 0 0 0 7px var(--g)}
.fz-wk-p{font-size:16px;line-height:1.5;color:var(--ink3);margin:0 0 10px}
.fz-wk-p b{color:var(--ink);font-weight:700}
.fz-wk-p.w{color:var(--orInk)}
.fz-wk-hint{text-align:center;margin:0}
.fz-wk-half{margin:14px 0 0;font-size:15px}
.fz-wk .fz-grp:last-of-type{border-bottom:0}
.fz-pl{list-style:none;margin:8px 0 0;padding:0}
.fz-pl li{display:flex;align-items:flex-start;gap:10px;padding:9px 0;border-top:1px solid var(--line);font-size:15.5px;line-height:1.4;color:var(--ink)}
.fz-pl li:first-child{border-top:0}
.fz-pl .fz-em{flex:none;width:22px;height:22px}
.fz-pl .dot{flex:none;width:6px;height:6px;border-radius:50%;background:#B9B2A4;margin:8px 8px 0}
.fz-pl .nt{display:block;font-size:13.5px;margin-top:3px;line-height:1.35}
.fz-pl .nt--w{color:var(--orInk)}
.fz-wk .fz-btns .fz-btn{display:inline-flex;align-items:center;gap:8px}
@media (max-width:560px){.fz-pstep{padding:22px 18px 24px;border-radius:24px}.fz-pstep>h2{font-size:19px}}
.fz-feedr button{display:flex;align-items:center;gap:12px;text-align:left;padding:12px 14px;border-radius:16px;background:#fff;box-shadow:inset 0 0 0 1.5px var(--line);transition:box-shadow .2s,background-color .2s}
.fz-feedr button i{flex:none;width:20px;height:20px;border-radius:50%;box-shadow:inset 0 0 0 2px #B9B2A4;transition:box-shadow .2s}
.fz-feedr button[aria-checked="true"]{box-shadow:inset 0 0 0 2px var(--g);background:#F6FAF6}
.fz-feedr button[aria-checked="true"] i{box-shadow:inset 0 0 0 6px var(--g)}
.fz-feedr b{display:block;font-size:16px;font-weight:700;color:var(--ink)}
.fz-feedr small{display:block;font-size:14px;color:var(--ink2);margin-top:1px}
@media (hover:hover){.fz-feedr button:hover{background:#FAF8F3}}
.fz-dlist{border-radius:22px;padding:18px 18px 12px;background:var(--g0)}
.fz-dlist .k{font-size:14px;font-weight:600;color:var(--g);margin-bottom:6px}
.fz-dlist .t{font-size:14px;color:var(--ink3);margin:0 0 6px}
.fz-dayr{display:flex;align-items:center;gap:12px;width:100%;text-align:left;padding:10px 0;border-top:1px solid rgba(47,93,58,.14);color:var(--ink)}
.fz-dlist .k + .fz-dayr,.fz-dlist .t + .fz-dayr{border-top:0}
.fz-dayr img{width:58px;height:58px;flex:none;border-radius:14px;object-fit:cover;background:var(--bg2)}
.fz-dayr>span{flex:1;min-width:0}
.fz-dayr b{display:block;font-size:15.5px;font-weight:700;line-height:1.25}
.fz-dayr small{display:block;font-size:14px;color:var(--ink2);margin-top:3px;line-height:1.35}
.fz-dayr svg{flex:none;color:#A79F8F}
@media (hover:hover){.fz-dayr:hover b{text-decoration:underline;text-underline-offset:2px}}
.fz-dall{display:inline-flex;align-items:center;gap:4px;margin-top:6px;font-size:15px;font-weight:600;padding:6px 0}
.fz-kib{border-radius:22px;background:var(--bg2);padding:0 18px}
.fz-kib[open]{padding-bottom:18px}
.fz-kib summary{list-style:none;cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:16px 0;font-size:15.5px;font-weight:600;color:var(--ink)}
.fz-kib summary::-webkit-details-marker{display:none}
.fz-kib summary svg{flex:none;color:var(--ink2);transition:transform .25s}
.fz-kib[open] summary svg{transform:rotate(180deg)}
.fz-kib .fz-seg{background:#fff}
.fz-kibr{margin-top:16px}
.fz-kibr .fz-tile{background:#fff}
.fz-swap{margin-top:14px;padding:14px;border-radius:16px;background:var(--or0)}
.fz-swap p{font-size:14.5px;line-height:1.45;color:#5A3208}
.fz-swap .fz-dayr{margin-top:10px;padding:8px 10px;border:0;border-radius:14px;background:#fff}
.fz-swap .fz-dayr img{width:52px;height:52px;border-radius:12px}
.fz-calcd{margin-top:14px;border-top:1px solid var(--line)}
.fz-calcd summary{list-style:none;cursor:pointer;display:flex;align-items:center;gap:8px;padding:14px 0 2px;font-size:14px;font-weight:600;color:var(--ink2)}
.fz-calcd summary::-webkit-details-marker{display:none}
.fz-calcd summary svg{transition:transform .25s}
.fz-calcd[open] summary svg{transform:rotate(180deg)}
.fz-calcd .t{font-size:14px;margin-top:8px}
.fz-calcd .fz-share{margin-top:12px}
.fz-sum{font-variant-numeric:tabular-nums;color:var(--ink)!important;font-weight:600}
.fz-box--g .fz-btn{width:100%;margin-top:18px}
.fz-box--g .pou{display:flex;align-items:center;gap:14px;margin-top:14px}
.fz-qa{margin-top:56px;max-width:860px}
.fz-qa>div{padding:18px 0;border-bottom:1px solid var(--line)}
.fz-qa b{display:block;font-size:17px}
.fz-qa p{font-size:16px;line-height:1.5;color:var(--ink3);margin-top:6px}
.fz-srcl{display:flex;justify-content:space-between;align-items:center;gap:16px;flex-wrap:wrap;margin-top:36px;font-size:13.5px;color:var(--ink2)}
.fz-pn{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:40px}
.fz-pn button{display:flex;align-items:center;gap:14px;padding:14px;border-radius:20px;background:var(--card);box-shadow:var(--sh);text-align:left;transition:transform .2s}
@media (hover:hover){.fz-pn button:hover{transform:translateY(-2px)}}
.fz-pn img{width:64px;height:64px;border-radius:12px;object-fit:cover;flex:none}
.fz-pn small{display:block;font-size:13px;color:var(--ink2)}
.fz-pn b{display:block;font-size:16px;line-height:1.3}
.fz-pn .nx{justify-content:flex-end;text-align:right}
/* order */
.fz-oh{padding:48px 0 8px}
.fz-oh .fz-h1{font-size:62px}
.fz-stepper{display:flex;gap:10px;margin-top:28px;flex-wrap:wrap}
.fz-stepper span{display:flex;align-items:center;gap:8px;padding:8px 16px 8px 9px;border-radius:999px;background:#fff;font-size:15px;font-weight:600;color:var(--ink2);box-shadow:0 1px 2px rgba(0,0,0,.05)}
.fz-stepper i{font-style:normal;width:24px;height:24px;border-radius:50%;background:var(--bg2);display:flex;align-items:center;justify-content:center;font-size:13px}
.fz-stepper .done i,.fz-stepper .on i{background:var(--g);color:#fff}
.fz-stepper .on{color:var(--ink);box-shadow:inset 0 0 0 2px var(--g)}
.fz-og{display:grid;grid-template-columns:minmax(0,1fr) 380px;gap:44px;align-items:start;padding:30px 0 110px}
.fz-st{position:relative;background:var(--card);border-radius:28px;padding:26px 32px;box-shadow:var(--sh);transition:opacity .2s}
.fz-st+.fz-st{margin-top:18px}
.fz-st.lock{opacity:.55}
.fz-sth{display:flex;align-items:center;gap:12px;min-height:34px}
.fz-sth h2{font-size:26px;letter-spacing:-.025em;font-weight:700;line-height:1.2}
.fz-sth .n{flex:none;width:32px;height:32px;border-radius:50%;background:var(--bg2);color:var(--ink2);font-size:15px;font-weight:700;display:flex;align-items:center;justify-content:center}
.fz-st.on .fz-sth .n,.fz-st.done .fz-sth .n{background:var(--g);color:#fff}
.fz-sth .sum{margin-left:auto;display:flex;align-items:center;gap:14px;font-size:15px;color:var(--ink2);text-align:right}
.fz-sth .sum button{color:var(--g);font-weight:600}
@media (hover:hover){.fz-sth .sum button:hover{text-decoration:underline}}
.fz-stb{margin-top:22px}
.fz-row{display:grid;grid-template-columns:1fr 1fr;gap:28px}
.fz-inp{display:block;width:100%;height:52px;border-radius:14px;background:var(--bg2);border:0;outline:0;padding:0 16px;font-size:18px;font-weight:600;transition:box-shadow .2s}
.fz-inp:focus{box-shadow:0 0 0 3px rgba(47,93,58,.28)}
.fz-inp::placeholder{color:#9C978C;font-weight:500}
.fz-kg2{font-size:46px;font-weight:700;letter-spacing:-.035em;line-height:1;font-variant-numeric:tabular-nums}
.fz-kg2 small{font-size:20px;font-weight:600;margin-left:4px;color:var(--ink2)}
.fz-stb .fz-range{margin:12px 0 4px}
.fz-gap{height:22px}
.fz-chips2{display:flex;gap:8px;flex-wrap:wrap}
.fz-chips2 .fz-chip{background:var(--bg2);box-shadow:none}
@media (hover:hover){.fz-chips2 .fz-chip:hover{background:#ECE4D4}}
.fz-chips2 .fz-chip[aria-pressed="true"]{background:var(--or0);color:var(--orInk);text-decoration:line-through;text-decoration-thickness:2px;box-shadow:inset 0 0 0 1.5px rgba(154,82,10,.3)}
.fz-hint{font-size:14px;color:var(--ink2);margin-top:10px}
.fz-hint--w{color:var(--orInk)}
.fz-next{display:flex;justify-content:flex-end;margin-top:24px}
.fz-bigd{display:flex;align-items:flex-end;gap:24px;flex-wrap:wrap}
.fz-bigd .big{font-size:56px;font-weight:700;letter-spacing:-.04em;line-height:1;font-variant-numeric:tabular-nums}
.fz-bigd .big small{font-size:22px;font-weight:600;color:var(--ink2);margin-left:6px;letter-spacing:-.01em}
.fz-pouches{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px;margin-top:22px}
.fz-po{position:relative;border-radius:22px;padding:16px 10px 14px;background:var(--bg);text-align:center;box-shadow:inset 0 0 0 1.5px transparent;transition:box-shadow .2s,opacity .2s,transform .2s;display:flex;flex-direction:column;align-items:center}
.fz-po[aria-pressed="true"]{background:#fff;box-shadow:inset 0 0 0 2px var(--g)}
@media (hover:hover){.fz-po:not([disabled]):hover{transform:translateY(-2px)}}
.fz-po[disabled]{opacity:.45;cursor:not-allowed}
.fz-po .nm{font-size:15px;font-weight:700;margin-top:12px;line-height:1.25}
.fz-po .st{display:inline-flex;align-items:center;gap:5px;margin-top:8px;font-size:12.5px;font-weight:700;padding:5px 10px;border-radius:999px;background:var(--bg2);color:var(--ink2)}
.fz-po[aria-pressed="true"] .st{background:var(--g0);color:var(--g)}
.fz-po[disabled] .st{background:var(--or0);color:var(--orInk)}
.fz-st .fz-scrib{right:30px;top:24px;transform:rotate(4deg);font-size:26px}
.fz-st .fz-note{right:-14px;top:-24px;width:178px;background:#E3EAC6;transform:rotate(5deg);font-size:24px}
.fz-plans{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
.fz-plan{border-radius:20px;padding:18px;background:var(--bg);box-shadow:inset 0 0 0 1.5px transparent;transition:box-shadow .2s,background-color .2s;text-align:left;display:flex;flex-direction:column;align-items:flex-start}
@media (hover:hover){.fz-plan:hover{background:#F7F2E7}}
.fz-plan[aria-pressed="true"]{background:#fff;box-shadow:inset 0 0 0 2px var(--g)}
.fz-plan b{display:block;font-size:18px}
.fz-plan span{display:block;font-size:14px;color:var(--ink2);margin-top:4px;line-height:1.35}
.fz-plan em{display:inline-block;font-style:normal;margin-top:10px;font-size:12.5px;font-weight:700;color:var(--g);background:var(--g0);padding:4px 9px;border-radius:999px}
.fz-plan .pr{margin-top:12px;font-size:15px;font-weight:700;color:var(--ink)}
.fz-three{display:grid;grid-template-columns:2fr 1fr 1fr;gap:14px}
.fz-days{display:flex;gap:10px;flex-wrap:wrap}
.fz-day{padding:10px 16px;border-radius:14px;background:var(--bg2);font-size:15px;font-weight:600;text-align:center;line-height:1.2;transition:background-color .2s,color .2s}
@media (hover:hover){.fz-day:hover{background:#ECE4D4}}
.fz-day small{display:block;font-size:12.5px;font-weight:500;color:var(--ink2);margin-top:2px}
.fz-day[aria-pressed="true"]{background:var(--g);color:#fff}
.fz-day[aria-pressed="true"] small{color:rgba(255,255,255,.82)}
.fz-rec{position:sticky;top:88px;background:#FFFDF8;padding:34px 30px 30px;box-shadow:0 26px 44px -18px rgba(60,40,20,.35),0 2px 4px rgba(60,40,20,.12);transform:rotate(1.2deg);scroll-margin-top:90px}
.fz-rec::after{content:"";position:absolute;left:0;right:0;bottom:-10px;height:12px;background:radial-gradient(circle at 8px -2px,transparent 8px,#FFFDF8 8.5px) 0 0/16px 12px repeat-x}
.fz-rec .for{font-size:13px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:var(--ink2)}
.fz-rec h3{font-size:44px;line-height:1;margin-top:2px;padding-right:64px;min-height:44px}
.fz-rec h3.anon{font-size:36px}
.fz-rec .stamp{position:absolute;right:24px;top:22px;color:var(--g);opacity:.85;transform:rotate(16deg)}
.fz-rec .ln{display:flex;justify-content:space-between;gap:16px;padding:11px 0;border-bottom:1.5px dashed rgba(45,42,38,.2);font-size:15px}
.fz-rec .ln:first-of-type{margin-top:14px}
.fz-rec .ln b{font-weight:700;text-align:right}
.fz-rec .ln b.mut{color:var(--ink2);font-weight:500}
.fz-rec .tot{display:flex;justify-content:space-between;align-items:baseline;margin-top:16px}
.fz-rec .tot>span{font-size:15px;font-weight:600}
.fz-rec .tot b{font-size:34px;letter-spacing:-.03em;font-variant-numeric:tabular-nums}
.fz-rec .ex{font-size:12.5px;color:var(--ink2);margin-top:4px;text-align:right}
.fz-rec .fz-btn{width:100%;margin-top:20px}
.fz-rec .need{font-size:13px;color:var(--orInk);text-align:center;margin-top:10px}
.fz-rec .proto{font-size:12.5px;color:var(--ink2);text-align:center;margin-top:10px}
.fz-rec .ty{text-align:center;padding:14px 0 6px}
.fz-rec .ty .pw{display:flex;justify-content:center;color:var(--g);margin:10px 0 14px}
.fz-rec .ty h3{padding:0;font-size:46px}
.fz-rec .ty p{font-size:15px;color:var(--ink3);margin-top:12px}
/* ingredient pictures and filters */
.fz-em{display:inline-flex;flex:none;width:20px;height:20px}
.fz-em svg{display:block;width:100%;height:100%}
.fz-vh{position:absolute!important;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);clip-path:inset(50%);white-space:nowrap}
.fz-k{font-size:12.5px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:var(--ink2)}
.fz-seg button{display:inline-flex;align-items:center;gap:7px}
.fz-seg .fz-em{width:18px;height:18px}
.fz-chip .fz-em{width:19px;height:19px;margin-left:-3px}
.fz-ip{position:relative;margin-top:22px;border-radius:24px;background:var(--card);box-shadow:var(--sh);padding:22px 24px 18px}
.fz-ip-h{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;flex-wrap:wrap}
.fz-ip-h p{font-size:14.5px;color:var(--ink2);margin-top:4px}
.fz-ig{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:6px;margin-top:16px}
.fz-it{display:flex;flex-direction:column;align-items:center;gap:7px;padding:8px 2px 6px;border-radius:16px;position:relative;min-width:0;transition:background-color .2s}
@media (hover:hover){.fz-it:hover{background:rgba(29,29,31,.04)}}
.fz-it .c{width:58px;height:58px;border-radius:50%;background:var(--bg2);display:flex;align-items:center;justify-content:center;position:relative;flex:none;transition:box-shadow .2s,background-color .2s}
.fz-it .c .fz-em{width:34px;height:34px}
.fz-it .l{font-size:13px;font-weight:600;color:var(--ink3);line-height:1.2;text-align:center;max-width:100%;overflow-wrap:anywhere}
.fz-it .b{position:absolute;right:-3px;top:-3px;width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:13px;font-weight:800;line-height:1;border:2.5px solid var(--card)}
.fz-it[data-s="have"] .c{background:var(--g0);box-shadow:inset 0 0 0 2.5px var(--g)}
.fz-it[data-s="have"] .b{background:var(--g)}
.fz-it[data-s="have"] .l{color:var(--g)}
.fz-it[data-s="no"] .c{background:var(--or0);box-shadow:inset 0 0 0 2.5px rgba(154,82,10,.55)}
.fz-it[data-s="no"] .c .fz-em{opacity:.45;filter:grayscale(.6)}
.fz-it[data-s="no"] .b{background:var(--orInk)}
.fz-it[data-s="no"] .l{color:var(--orInk);text-decoration:line-through;text-decoration-thickness:2px}
.fz-it[disabled]{cursor:not-allowed}
@media (hover:hover){.fz-it[disabled]:hover{background:none}}
.fz-ip-s{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-top:14px;padding-top:14px;border-top:1px solid var(--line);font-size:15px;color:var(--ink2)}
.fz-ip-s b{color:var(--ink);font-weight:600}
.fz-ip-s b.no{color:var(--orInk)}
.fz-ip-s button{font-weight:600;color:var(--g);font-size:15px}
@media (hover:hover){.fz-ip-s button:hover{text-decoration:underline}}
.fz-filters .sp{width:14px;flex:none}
.fz-have{display:flex;flex-wrap:wrap;gap:5px;margin-top:10px}
.fz-hv{display:inline-flex;align-items:center;gap:4px;padding:3px 9px 3px 4px;border-radius:999px;font-size:12.5px;font-weight:700;background:var(--g0);color:var(--g)}
.fz-hv .fz-em{width:17px;height:17px}
.fz-tag .fz-em{width:15px;height:15px;margin-left:-2px}
.fz-tag--m{background:var(--bg2);color:var(--ink3)}
.fz-ch .fz-em{width:17px;height:17px}
.fz-ch.fz-ch--add{background:var(--g);color:#fff}
@media (hover:hover){.fz-ch.fz-ch--add:hover{background:var(--g2)}}
.fz-ch.fz-ch--on{background:var(--g0);color:var(--g)}
@media (hover:hover){.fz-ch.fz-ch--on:hover{background:#DCE8DC}}
@media (hover:hover){.fz-ch.pr2:hover{background:#F7F3EA}}
.fz-drop .fz-nw{align-self:center}
/* nav extras */
.fz-soonpill{align-self:flex-start;margin-top:auto;display:inline-flex;align-items:center;height:32px;padding:0 14px;border-radius:999px;background:rgba(255,255,255,.16);color:#fff;font-size:14px;font-weight:700;letter-spacing:.02em}
.fz-soonpill--o{position:absolute;right:6px;top:34px;height:34px;padding:0 14px;background:var(--or);color:var(--ink);box-shadow:none;transform:rotate(7deg);font-size:14px}
.fz-soon .fz-wrap{display:grid;grid-template-columns:1.25fr .75fr;gap:48px;align-items:center;padding-bottom:72px}
.fz-soon .fz-lead{max-width:600px}
.fz-soon .fz-lead+.fz-lead{margin-top:14px}
.fz-soon .fz-ctas{margin-top:30px}
.fz-soon__art{position:relative;justify-self:center;padding:18px 26px 0;transform:rotate(-3deg)}
.fz-nw{display:inline-block;margin-left:5px;padding:1px 6px;border-radius:99px;background:var(--or);color:#fff;font-size:10.5px;font-weight:700;letter-spacing:.02em;line-height:1.4;vertical-align:5px;transform:rotate(6deg)}
.fz-nw--s{background:var(--sky0);color:var(--skyInk);transform:rotate(-4deg)}
.fz-cart{position:relative;width:40px;height:40px;border-radius:12px;display:flex;align-items:center;justify-content:center;color:var(--ink);flex:none}
.fz-cart[aria-current="page"]{background:var(--bg2)}@media (hover:hover){.fz-cart:hover{background:var(--bg2)}}
.fz-cart .n{position:absolute;right:0;top:0;min-width:18px;height:18px;padding:0 5px;border-radius:99px;background:var(--or);color:#fff;font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center;line-height:1}
.fz-btn--x{color:var(--ink2);box-shadow:inset 0 0 0 1.5px var(--line)}
@media (hover:hover){.fz-btn--x:hover{color:var(--ink);background:var(--bg2)}}
/* meal builder */
.fz-bl{display:grid;grid-template-columns:minmax(0,1fr) 420px;gap:40px;margin-top:34px;align-items:start;padding-bottom:96px}
.fz-bl>*{min-width:0}
.fz-bst{border-radius:24px;background:var(--card);box-shadow:var(--sh);padding:20px 22px 14px}
.fz-bst+.fz-bst{margin-top:16px}
.fz-bst-h{display:flex;align-items:center;gap:12px}
.fz-bst-h .n{width:32px;height:32px;border-radius:50%;background:var(--g);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:16px;flex:none}
.fz-bst-h small{font-size:14px;color:var(--ink2);font-weight:500;margin-left:8px;letter-spacing:0}
.fz-ig--b{grid-template-columns:repeat(6,minmax(0,1fr));margin-top:12px}
.fz-sim{margin-top:24px}
.fz-sim .row{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin-top:12px}
.fz-sim .rr{display:flex;align-items:center;gap:10px;background:#fff;border-radius:14px;padding:6px 12px 6px 6px;box-shadow:0 1px 2px rgba(0,0,0,.06);font-size:14px;font-weight:600;line-height:1.25;min-width:0;text-align:left;transition:transform .2s}
@media (hover:hover){.fz-sim .rr:hover{transform:translateY(-2px)}}
.fz-sim .rr img{width:52px;height:42px;object-fit:cover;border-radius:8px;flex:none}
.fz-sim .rr span{min-width:0;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.fz-sim .fz-link{margin-top:12px;font-size:15px}
.fz-res{position:sticky;top:88px}
.fz-res-o{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-top:16px}
.fz-res-o .lb{font-size:14px;font-weight:600;color:var(--ink2)}
.fz-box .fz-res-o .fz-seg{margin-top:0}
.fz-dstep{display:flex;align-items:center;gap:14px;margin-top:12px}
.fz-dstep .v{min-width:96px;text-align:center;font-size:20px;font-weight:700;color:var(--ink);font-variant-numeric:tabular-nums}
.fz-dstep label.v{display:inline-flex;align-items:center;justify-content:center;gap:10px;min-width:0}
.fz-dn{width:84px;height:44px;padding:0 8px;text-align:center;font-size:20px;font-weight:700;background:#fff;box-shadow:inset 0 0 0 1.5px var(--line);font-variant-numeric:tabular-nums}
.fz-cook-p p.w{color:var(--orInk);font-weight:600}
.fz-res .rawh{margin-top:20px}
.fz-tb{width:100%;border-collapse:collapse;margin-top:6px;font-size:16px}
.fz-tb td{padding:9px 0;border-bottom:1px solid var(--line);vertical-align:middle}
.fz-tb .nm{display:flex;align-items:center;gap:10px}
.fz-tb .fz-em{width:26px;height:26px}
.fz-tb td.g{text-align:right;font-weight:700;font-variant-numeric:tabular-nums;white-space:nowrap;padding-left:12px}
.fz-tb tr.sum td{border-bottom:0;font-weight:700;padding-top:11px}
.fz-tb tr.sum .nm{padding-left:36px}
.fz-res-p{font-size:15.5px;line-height:1.5;color:var(--ink);margin-top:10px;font-weight:500}
.fz-how2{margin-top:16px;padding-top:14px;border-top:1px solid var(--line)}
.fz-how2 ol{list-style:none;counter-reset:s;margin-top:10px;display:flex;flex-direction:column;gap:9px}
.fz-how2 li{counter-increment:s;display:flex;gap:10px;font-size:15px;line-height:1.45;color:var(--ink3)}
.fz-how2 li::before{content:counter(s);flex:none;width:24px;height:24px;border-radius:50%;background:var(--g0);color:var(--g);font-weight:700;font-size:13px;display:flex;align-items:center;justify-content:center;margin-top:1px}
.fz-btns{display:flex;gap:10px;flex-wrap:wrap;margin-top:18px}
.fz-warnb{margin-top:16px;padding:12px 14px;border-radius:14px;background:var(--or0);color:var(--orInk);font-size:14px;line-height:1.45;display:flex;gap:9px}
.fz-warnb svg{margin-top:1px}
.fz-bland{display:flex;gap:14px;align-items:center;margin-top:14px;padding:10px;border-radius:16px;background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.08);text-align:left;width:100%;transition:transform .2s}
@media (hover:hover){.fz-bland:hover{transform:translateY(-2px)}}
.fz-bland img{width:76px;height:60px;border-radius:10px;object-fit:cover;flex:none}
.fz-bland b{display:block;font-size:15px;line-height:1.3}
.fz-bland .go{display:block;font-size:13.5px;color:var(--g);font-weight:600;margin-top:3px}
/* shopping list */
.fz-shl{display:grid;grid-template-columns:minmax(0,1fr) 360px;gap:40px;margin-top:34px;align-items:start;padding-bottom:96px}
.fz-shl>*{min-width:0}
.fz-sl{border-radius:24px;background:var(--card);box-shadow:var(--sh);padding:22px 24px 6px}
.fz-lempty{padding:6px 0 22px}
.fz-lempty p{color:var(--ink3);margin-top:8px;max-width:520px}
.fz-lfor{padding-bottom:14px;border-bottom:1px solid var(--line)}
.fz-lfor ul{display:flex;flex-direction:column;gap:8px;margin-top:10px}
.fz-lfor li{display:flex;align-items:center;gap:12px;font-size:16px;font-weight:600;line-height:1.3}
.fz-lfor li img,.fz-lfor li .ic{width:44px;height:36px;border-radius:8px;object-fit:cover;flex:none}
.fz-lfor li .ic{background:var(--g0);display:flex;align-items:center;justify-content:center}
.fz-lfor li .ic .fz-em{width:24px;height:24px}
.fz-lfor li .tt{flex:1;min-width:0}
.fz-lfor li .tt button{text-align:left}
@media (hover:hover){.fz-lfor li .tt button:hover{text-decoration:underline}}
.fz-lfor li small{display:block;font-size:13px;color:var(--ink2);font-weight:500;margin-top:1px}
.fz-lfor li .ch{font-size:14px;flex:none}
.fz-lfor li .x{width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:var(--ink2);flex:none}
@media (hover:hover){.fz-lfor li .x:hover{background:var(--bg2);color:var(--ink)}}
.fz-grp{padding:16px 0 4px;border-bottom:1px solid var(--line)}
.fz-grp-h{display:flex;align-items:baseline;justify-content:space-between;gap:4px 12px;flex-wrap:wrap}
.fz-grp-h .w{font-size:14px;color:var(--ink2)}
.fz-grp-h .w b{color:var(--ink3);font-weight:600}
.fz-li{display:flex;align-items:center;gap:12px;padding:11px 0;width:100%;text-align:left}
.fz-li .bx{width:22px;height:22px;border-radius:50%;box-shadow:inset 0 0 0 1.75px rgba(29,29,31,.28);flex:none;display:flex;align-items:center;justify-content:center;color:#fff;transition:background-color .15s,box-shadow .15s}
.fz-li[aria-checked="true"] .bx{background:var(--g);box-shadow:none}
.fz-li .fz-em{width:28px;height:28px}
.fz-li .dot{width:28px;height:28px;display:flex;align-items:center;justify-content:center;flex:none}
.fz-li .dot::before{content:"";width:8px;height:8px;border-radius:50%;background:rgba(29,29,31,.18)}
.fz-li .t{flex:1;min-width:0;font-size:16px;line-height:1.4}
.fz-li .t small{display:block;font-size:13px;color:var(--ink2);margin-top:1px}
.fz-li .q{font-weight:700;font-variant-numeric:tabular-nums;font-size:16px;white-space:nowrap}
.fz-li[aria-checked="true"] .t>span,.fz-li[aria-checked="true"] .q{color:var(--ink2);text-decoration:line-through}
.fz-lwait{font-size:14px;color:var(--ink2);padding:14px 0}
.fz-lbtns{display:flex;gap:10px;flex-wrap:wrap;padding:16px 0 18px}
.fz-lside{display:flex;flex-direction:column;gap:16px;position:sticky;top:88px}
.fz-gc{position:relative;overflow:hidden;border-radius:24px;background:var(--g);color:#fff;padding:24px;box-shadow:var(--sh)}
.fz-gc p{color:rgba(255,255,255,.84);font-size:15.5px;margin-top:8px;max-width:220px}
.fz-gc .fz-btn{margin-top:16px}
.fz-gc img{position:absolute;right:-12px;bottom:-16px;width:118px;transform:rotate(-12deg);pointer-events:none}
.fz-wb ul{display:flex;flex-direction:column;gap:10px;margin-top:12px}
.fz-wb li{display:flex;gap:10px;font-size:15px;color:var(--ink3);line-height:1.4}
.fz-wb li .fz-em{width:24px;height:24px}
.fz-wb li b{color:var(--ink)}
@media print{.fz-shl{display:block}.fz-lside,.fz-lbtns,.fz-lfor .x,.fz-lfor .ch{display:none!important}.fz-sl{box-shadow:none;padding:0}}
.fz-obar{display:none}
@media (prefers-reduced-motion:reduce){.fz *,.fz *::before,.fz *::after{animation:none!important;transition:none!important}}
@media print{.fz-bar,.fz-nav,.fz-foot,.fz-side,.fz-noprint,.fz-scrib,.fz-note,.fz-tape{display:none!important}.fz,.fz-page{background:#fff!important;animation:none!important}.fz-rpg{display:block}.fz-photo{transform:none;box-shadow:none;padding:0;max-width:420px}.fz-photo img{height:260px}.fz-cols{margin-top:24px}}
/* ---------- responsive ---------- */
@container fz (max-width:1120px){
.fz-h1{font-size:62px}.fz-h2{font-size:46px}
.fz-hero .fz-wrap{grid-template-columns:minmax(0,1fr) 340px;gap:56px}
.fz-hp{width:330px}
.fz-hp .fz-scrib{left:-150px;font-size:25px}
.fz-calc{padding:34px 34px;gap:36px}
.fz-grid--4{grid-template-columns:repeat(3,minmax(0,1fr))}
.fz-rpg{grid-template-columns:minmax(0,1fr) 320px;column-gap:36px}
.fz-rp .fz-h1{font-size:52px}
.fz-og{grid-template-columns:minmax(0,1fr) 340px;gap:32px}
.fz-story{grid-template-columns:minmax(0,1fr) 360px;gap:40px}
.fz-board .b1{width:160px}.fz-board .b2{width:140px}.fz-board .lg{left:90px}.fz-board .fz-note{left:190px}
.fz-nl{gap:28px}.fz-links{gap:20px}
.fz-ig{grid-template-columns:repeat(8,minmax(0,1fr))}
.fz-ig--b{grid-template-columns:repeat(5,minmax(0,1fr))}
.fz-bl{grid-template-columns:minmax(0,1fr) 380px;gap:32px}
.fz-shl{grid-template-columns:minmax(0,1fr) 320px;gap:32px}
}
@container fz (max-width:900px){
.fz-links{display:none}.fz-burger{display:flex}.fz-nr>.fz-btn{display:none}.fz-ac-nav{display:none}
.fz-sec{padding:76px 0}
.fz-h1{font-size:54px}.fz-h2{font-size:40px}.fz-lead{font-size:18px}
.fz-hero{padding:44px 0 64px}
.fz-hero .fz-wrap{grid-template-columns:1fr;gap:56px}
.fz-hp{width:300px;transform:rotate(2.5deg)}
.fz-hp .fz-hs1{display:none}.fz-hp .fz-hs2{display:flex;left:auto;right:-120px;top:-6px;transform:rotate(8deg)}
.fz-calc{grid-template-columns:1fr;gap:28px;padding:30px}
.fz-calc .fz-note{right:-8px;top:-34px;width:170px;font-size:23px}
.fz-grid,.fz-grid--4{grid-template-columns:repeat(2,minmax(0,1fr));gap:28px 20px}
.fz-two{grid-template-columns:1fr}
.fz-soon .fz-wrap{grid-template-columns:1fr;gap:28px;padding-bottom:48px}
.fz-soon__art svg{width:140px;height:203px}
.fz-soonpill--o{top:22px;right:-6px}
.fz-how{grid-template-columns:1fr;gap:14px}
.fz-cx{grid-template-columns:1fr}
.fz-hw{display:grid;grid-template-columns:40px 1fr;column-gap:18px;align-items:start}
.fz-hw h3{margin-top:4px}.fz-hw p{grid-column:2}
.fz-story{grid-template-columns:1fr;gap:20px}
.fz-board{height:330px;max-width:420px}
.fz-foot .top{grid-template-columns:1fr 1fr;gap:30px}.fz-foot .top>div:first-child{grid-column:1/-1}
.fz-ph .fz-h1{font-size:54px}.fz-ph .fz-note{display:none}
.fz-rpg{grid-template-columns:minmax(0,1fr);grid-template-areas:"ph" "side" "bd";row-gap:56px}
.fz-side{position:static}
.fz-photo img{height:380px}
.fz-cols{grid-template-columns:1fr;gap:40px;margin-top:40px}
.fz-rp .fz-h1{font-size:44px}
.fz-og{grid-template-columns:1fr;gap:30px;padding-bottom:40px}
.fz-rec{position:relative;top:auto;transform:rotate(.6deg);max-width:520px;width:100%;justify-self:center}
.fz-oh .fz-h1{font-size:50px}
.fz-st .fz-note{right:14px;top:-30px}
.fz-obar{display:flex;position:sticky;bottom:14px;z-index:15;margin:22px 0 0;align-items:center;justify-content:space-between;gap:14px;padding:10px 10px 10px 22px;border-radius:999px;background:rgba(29,29,31,.92);color:#fff;-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);box-shadow:0 16px 34px -14px rgba(0,0,0,.45)}
.fz-obar b{font-size:20px;letter-spacing:-.02em;font-variant-numeric:tabular-nums}
.fz-obar span{font-size:13px;color:rgba(255,255,255,.72);margin-left:8px}
.fz-obar .fz-btn{height:42px;padding:0 18px;font-size:15px}
.fz-ig{grid-template-columns:repeat(6,minmax(0,1fr))}
.fz-ig--b{grid-template-columns:repeat(5,minmax(0,1fr))}
.fz-bl,.fz-shl{grid-template-columns:minmax(0,1fr);gap:24px;padding-bottom:64px}
.fz-res,.fz-lside{position:static}
.fz-sim .row{grid-template-columns:minmax(0,1fr)}
}
@container fz (max-width:600px){
.fz-wrap{padding:0 16px}
.fz-bar .hide-s{display:none}
.fz-nav .fz-wrap{height:58px}
.fz-logo img{height:30px}
.fz-sec{padding:60px 0}
.fz-h1{font-size:42px;letter-spacing:-.035em}.fz-h2{font-size:33px}.fz-h3{font-size:21px}
.fz-sub{font-size:18px}
.fz-ctas .fz-btn{flex:1 1 auto}
.fz-hp{width:250px}
.fz-hp .fz-hs2{right:-34px;top:-40px;font-size:22px}
.fz-grid--week{display:flex;overflow-x:auto;scroll-snap-type:x mandatory;gap:16px;margin:28px -16px 0;padding:8px 16px 22px;scrollbar-width:none;-webkit-overflow-scrolling:touch}
.fz-grid--week::-webkit-scrollbar{display:none}
.fz-grid--week>.fz-rc{flex:0 0 80%;scroll-snap-align:center}
.fz-grid--week + .fz-center{margin-top:22px}
.fz-calc{padding:24px 20px;border-radius:26px}
.fz-calc .fz-note{display:none}
.fz-kgrow .fz-kg{min-width:118px}
.fz-start{padding:18px}
.fz-det{padding:0 18px}
.fz-kg{font-size:52px}
.fz-tile .v{font-size:38px}
.fz-seg button{padding:8px 12px;font-size:14px}
.fz-grid,.fz-grid--4{grid-template-columns:1fr;gap:26px}
.fz-way{padding:26px 22px 24px;border-radius:26px}
.fz-way .bis{width:110px}
.fz-faq summary{font-size:17px}
.fz-faq details p{padding-right:0;font-size:16px}
.fz-foot .top{grid-template-columns:1fr 1fr;gap:26px}
.fz-ph{padding:36px 0 20px}.fz-ph .fz-h1{font-size:44px}
.fz-search{height:52px;padding-left:16px}
.fz-filters{flex-wrap:nowrap;overflow-x:auto;margin-left:-16px;margin-right:-16px;padding:2px 16px 4px;scrollbar-width:none}
.fz-filters::-webkit-scrollbar{display:none}
.fz-filters>*{flex:none}
.fz-rp .fz-h1{font-size:36px}
.fz-ch.pr{margin-left:0}
.fz-photo img{height:280px}
.fz-photo .fz-scrib{display:none}
.fz-hrnote{margin:0 0 -24px}
.fz-pn{grid-template-columns:1fr;gap:12px}
.fz-oh .fz-h1{font-size:40px}
.fz-stepper span{font-size:13px;padding:6px 12px 6px 7px}
.fz-stepper i{width:22px;height:22px;font-size:12px}
.fz-st{padding:22px 18px;border-radius:24px}
.fz-sth h2{font-size:22px}
.fz-sth{flex-wrap:wrap}.fz-sth .sum{margin-left:44px;width:100%;justify-content:space-between;text-align:left}
.fz-row{grid-template-columns:1fr;gap:22px}
.fz-st .fz-note{display:none}.fz-st .fz-scrib{display:none}
.fz-pouches{grid-template-columns:repeat(2,minmax(0,1fr))}
.fz-plans{grid-template-columns:1fr}
.fz-three{grid-template-columns:1fr 1fr}.fz-three>div:first-child{grid-column:1/-1}
.fz-bigd .big{font-size:46px}
.fz-rec{padding:30px 22px 26px}
.fz-rec h3{font-size:38px}
.fz-board{height:300px}.fz-board .b1{width:130px;left:0}.fz-board .b2{width:120px;right:0}.fz-board .lg{width:140px;height:140px;left:70px;top:140px}.fz-board .fz-note{left:150px;width:150px;font-size:22px}
.fz-ip{padding:18px 16px 14px;border-radius:22px}
.fz-ip-h .fz-seg{width:100%}
.fz-ip-h .fz-seg button{flex:1;justify-content:center;padding:9px 8px}
.fz-ig{grid-auto-flow:column;grid-template-rows:repeat(2,auto);grid-template-columns:none;grid-auto-columns:74px;overflow-x:auto;margin:14px -16px 0;padding:2px 16px 4px;scrollbar-width:none;-webkit-mask-image:linear-gradient(90deg,#000 86%,transparent);mask-image:linear-gradient(90deg,#000 86%,transparent)}
.fz-ig::-webkit-scrollbar{display:none}
.fz-ig--b{grid-auto-flow:row;grid-template-rows:none;grid-template-columns:repeat(5,minmax(0,1fr));grid-auto-columns:auto;gap:4px;overflow:visible;margin:12px 0 0;padding:0;-webkit-mask-image:none;mask-image:none}
.fz-it .c{width:54px;height:54px}
.fz-it .c .fz-em{width:31px;height:31px}
.fz-ig--b .fz-it{padding:6px 0 4px}
.fz-ig--b .fz-it .c{width:50px;height:50px}
.fz-ig--b .fz-it .c .fz-em{width:29px;height:29px}
.fz-ig--b .fz-it .l{font-size:12px}
.fz-bst{padding:18px 14px 12px;border-radius:22px}
.fz-bst-h small{display:block;margin:2px 0 0}
.fz-sl{padding:18px 16px 4px;border-radius:22px}
.fz-gc p{max-width:200px}
.fz-tb{font-size:15px}
.fz-lfor li{font-size:15px}
}
.fz-pf-ban{display:flex;flex-wrap:wrap;align-items:center;gap:10px 14px;padding:12px 16px;border-radius:16px;background:var(--g0);color:var(--ink);margin:0 0 22px;font-size:15px}
.fz-pf-ban b{font-weight:700}
.fz-pf-wiz{max-width:640px;border-radius:28px;background:var(--card);box-shadow:var(--sh);padding:28px 30px 26px;margin-top:22px}
.fz-pf-prog{display:flex;gap:6px}
.fz-pf-prog i{flex:1;height:5px;border-radius:9px;background:var(--bg2)}
.fz-pf-prog i.on{background:var(--g)}
.fz-pf-step{margin-top:18px;font-size:13px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--g)}
.fz-pf-q{font-size:30px;line-height:1.1;letter-spacing:-.03em;font-weight:700;margin:8px 0 14px;outline:0}
.fz-pf-bnote{display:inline-block;padding:6px 12px 4px;background:#E3EAC6;color:#2B3A22;font-size:21px;line-height:1.1;transform:rotate(-2deg);box-shadow:0 8px 16px -10px rgba(60,40,20,.45);margin:0 0 12px}
.fz-pf-f{margin-top:6px}
.fz-pf-nav{display:flex;justify-content:space-between;gap:12px;margin-top:26px}
.fz-pf-h0{margin-top:0!important;margin-bottom:12px}
.fz-pf-gap{height:10px}
.fz-pf-opts{display:grid;gap:10px}
.fz-pf-opt{display:flex;align-items:center;gap:14px;text-align:left;padding:12px 16px;border-radius:18px;background:var(--bg2);color:var(--ink3);border:0;transition:background-color .2s,box-shadow .2s}
.fz-pf-opt[aria-checked="true"]{background:#fff;box-shadow:inset 0 0 0 2px var(--g);color:var(--g)}
.fz-pf-opt svg{flex:none}
.fz-pf-opt b{display:block;font-size:17px;color:var(--ink)}
.fz-pf-opt small{display:block;font-size:14px;line-height:1.35;color:var(--ink2);margin-top:2px}
.fz-pf-pick .fz-hint{margin-top:10px}
.fz-pf-hits{margin-top:8px;display:grid;gap:2px;max-height:330px;overflow:auto;background:#fff;border-radius:14px;box-shadow:var(--sh);padding:6px}
.fz-pf-hits button{display:flex;flex-direction:column;align-items:flex-start;text-align:left;padding:10px 12px;border-radius:10px;font-size:16px;font-weight:600;background:transparent;color:var(--ink)}
.fz-pf-hits button:focus-visible{background:var(--g0)}@media (hover:hover){.fz-pf-hits button:hover{background:var(--g0)}}
.fz-pf-hits small{font-size:13px;font-weight:500;color:var(--ink2);margin-top:1px}
.fz-pf-sel{display:inline-flex;align-items:center;gap:10px;padding:8px 8px 8px 16px;border-radius:999px;background:var(--g0);color:var(--g);font-size:16px}
.fz-pf-sel button{width:30px;height:30px;border-radius:50%;background:#fff;color:var(--g);font-size:19px;line-height:1;display:grid;place-items:center}
.fz-pf-born,.fz-pf-two{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.fz-pf-two{margin-top:16px}
.fz-pf-born .fz-lbl,.fz-pf-two .fz-lbl{margin:0}
.fz-pf-born .fz-inp,.fz-pf-two .fz-inp{margin-top:8px}
.fz-pf-one{max-width:640px;margin-top:22px}
.fz-pf-res{display:grid;gap:12px}
.fz-pf-rh{display:flex;flex-wrap:wrap;align-items:center;gap:8px 16px}
.fz-pf-rh h2{font-size:32px;letter-spacing:-.03em;font-weight:700;line-height:1.1}
.fz-pf-rh .fz-pf-bnote{margin:0}
.fz-pf-tags{display:flex;flex-wrap:wrap;gap:6px}
.fz-pf-t{padding:18px 20px}
.fz-pf-t .v{font-size:40px}
.fz-pf-t .d+.d{margin-top:8px}
.fz-pf-src{font-size:13px;line-height:1.5;color:var(--ink2)}
.fz-pf-acts{display:flex;flex-wrap:wrap;align-items:center;gap:10px;margin:18px 0}
.fz-pf-del{background:#B3261E;color:#fff}
.fz-pf-acts .fz-link{font-size:15px}
.fz-pf-saved{font-size:14px;color:var(--ink2);margin-top:18px}
.fz-pf-ed{display:grid;grid-template-columns:minmax(0,1fr) 400px;gap:28px;align-items:start}
.fz-pf-id{border-radius:26px;background:var(--card);box-shadow:var(--sh);overflow:hidden}
.fz-pf-idh{display:flex;align-items:center;gap:14px;padding:18px 22px;background:var(--g);color:#fff}
.fz-pf-idh .av{width:52px;height:52px;border-radius:50%;background:var(--g0);color:var(--g);display:grid;place-items:center;font-size:24px;font-weight:700;flex:none}
.fz-pf-idh small{display:block;font-size:12px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;opacity:.85}
.fz-pf-idh b{display:block;font-size:24px;letter-spacing:-.02em}
.fz-pf-row{display:grid;grid-template-columns:150px minmax(0,1fr);gap:16px;padding:16px 22px;border-top:1px dashed rgba(29,29,31,.13)}
.fz-pf-row:first-of-type{border-top:0}
.fz-pf-rl{font-size:13px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--ink2);padding-top:12px}
.fz-pf-live{position:sticky;top:90px}
.fz-pf-bar{display:none}
@container fz (max-width:900px){
.fz-pf-ed{grid-template-columns:1fr;padding-bottom:84px}
.fz-pf-live{position:static}
.fz-pf-bar{display:flex;position:fixed;left:12px;right:12px;bottom:12px;z-index:40;align-items:center;justify-content:space-between;gap:12px;padding:10px 10px 10px 16px;border-radius:20px;background:rgba(255,254,250,.97);box-shadow:0 12px 30px -10px rgba(0,0,0,.35),0 0 0 1px rgba(0,0,0,.06)}
.fz-pf-bar b{display:block;font-size:18px;letter-spacing:-.01em}
.fz-pf-bar small{display:block;font-size:13px;color:var(--ink2)}
}
@container fz (max-width:600px){
.fz-pf-wiz{padding:22px 18px 20px}
.fz-pf-q{font-size:26px}
.fz-pf-row{grid-template-columns:1fr;gap:6px;padding:14px 16px}
.fz-pf-rl{padding-top:0}
.fz-pf-born,.fz-pf-two{grid-template-columns:1fr}
.fz-pf-t .v{font-size:34px}
}
.fz-pt{--rose0:#FBE6E2;--roseInk:#9B2F25;--vio0:#ECE8F7;--vioInk:#4E3F8F}
.fz-pt .c-g{background:var(--g0);color:var(--g)}
.fz-pt .c-o{background:var(--or0);color:var(--orInk)}
.fz-pt .c-s{background:var(--sky0);color:var(--skyInk)}
.fz-pt .c-r{background:var(--rose0);color:var(--roseInk)}
.fz-pt .c-v{background:var(--vio0);color:var(--vioInk)}
.fz-pt .c-n{background:var(--bg2);color:var(--ink3)}
.fz-pt-head{display:flex;flex-wrap:wrap;align-items:flex-end;justify-content:space-between;gap:14px 20px}
.fz-pt-acts{display:flex;flex-wrap:wrap;gap:10px}
.fz-pt-acts .fz-btn svg,.fz-pt-btns .fz-btn svg,.fz-pt-vbar .fz-btn svg{flex:none}
.fz-pt-pets{display:flex;flex-wrap:wrap;gap:10px;margin-top:22px}
.fz-pt-pet{display:inline-flex;align-items:center;gap:10px;padding:6px 18px 6px 6px;min-height:48px;border-radius:999px;background:var(--card);box-shadow:var(--sh);font-size:16px;color:var(--ink);border:0;transition:box-shadow .2s,background-color .2s}
.fz-pt-pet b{font-weight:600}
.fz-pt-pet small{font-size:14px;color:var(--ink2)}
.fz-pt-pet[aria-pressed="true"]{background:#fff;box-shadow:inset 0 0 0 2px var(--g),var(--sh)}
.fz-pt-pet.add{padding:0 18px;color:var(--g);font-weight:600;background:transparent;box-shadow:inset 0 0 0 1.5px rgba(47,93,58,.4)}
.fz-pt-av{width:36px;height:36px;border-radius:50%;display:grid;place-items:center;font-weight:700;font-size:16px;color:#fff;background:var(--g);flex:none}
.fz-pt-av.sp1{background:var(--skyInk)}
.fz-pt-av.sp2{background:#7A5A2E}
.fz-pt-av.lg{width:60px;height:60px;font-size:26px}
.fz-pt-note{margin-top:16px;padding:12px 16px;border-radius:16px;background:var(--sky0);color:var(--skyInk);font-size:15px;line-height:1.45;max-width:760px}
.fz-pt-tabs{margin-top:20px}
.fz-pt-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px;margin-top:20px}
.fz-pt-w2{grid-column:span 2}
.fz-pt-w3{grid-column:1/-1}
.fz-pt-card{background:var(--card);border-radius:24px;box-shadow:var(--sh);padding:22px 24px;min-width:0}
.fz-pt-kh{display:flex;align-items:center;justify-content:space-between;gap:12px}
.fz-pt-kh .fz-link{font-size:15px;white-space:nowrap}
.fz-pt-k{font-size:12.5px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--ink2)}
.fz-pt-k7{text-align:right}
.fz-pt-d{font-size:15px;line-height:1.45;color:var(--ink3);margin-top:8px}
.fz-pt-wt{display:flex;flex-wrap:wrap;align-items:flex-end;gap:10px 14px;margin-top:12px}
.fz-pt-big{font-size:56px;font-weight:700;letter-spacing:-.05em;line-height:1}
.fz-pt-big small,.fz-pt-mid small{font-size:20px;color:var(--ink2);font-weight:600;letter-spacing:-.01em;margin-left:5px}
.fz-pt-mid{font-size:38px;font-weight:700;letter-spacing:-.045em;line-height:1.05;margin-top:12px}
.fz-pt-chips{display:flex;flex-wrap:wrap;gap:8px;padding-bottom:6px}
.fz-pt-chip{display:inline-flex;align-items:center;gap:6px;padding:5px 11px;border-radius:999px;font-size:13.5px;font-weight:600;line-height:1.3;border:0}
.fz-pt-goal{font-size:16px;margin-top:10px;color:var(--ink)}
.fz-pt-chart{width:100%;min-width:0;margin-top:10px;overflow:hidden}
.fz-pt-chart svg{display:block;max-width:100%}
.fz-pt-ft{display:flex;flex-wrap:wrap;justify-content:space-between;gap:6px 16px;margin-top:6px;font-size:13px;line-height:1.45;color:var(--ink2)}
.fz-pt-ft .fz-link{display:inline;font-size:13px}
.fz-pt-bs{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin-top:16px}
.fz-pt-b{display:flex;flex-direction:column;align-items:center;gap:6px;padding:12px 2px 10px;border-radius:16px;background:var(--bg2);color:var(--ink3);font-size:13px;font-weight:600;text-align:center}
.fz-pt-b small{font-size:12.5px;line-height:1.2}
.fz-pt-b.on{background:#fff;box-shadow:inset 0 0 0 2px currentColor}
.fz-pt-b.on.b0,.fz-pt-b.on.b2,.fz-pt-b.on.b3{color:var(--orInk)}
.fz-pt-b.on.b1{color:var(--g)}
.fz-pt-pics{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-top:10px}
.fz-pt-pic{position:relative;aspect-ratio:1/1;border-radius:14px;overflow:hidden;background:var(--bg2);border:0;padding:0}
.fz-pt-pic img,.fz-pt-pic .fz-pt-phx{width:100%;height:100%;object-fit:cover;display:block}
.fz-pt-pic small{position:absolute;left:6px;bottom:6px;padding:2px 7px;border-radius:999px;background:rgba(255,254,250,.92);font-size:12px;font-weight:600;color:var(--ink)}
.fz-pt-phx{display:block;background:repeating-linear-gradient(135deg,#F1EADD 0 10px,#EDE5D6 10px 20px)}
.fz-pt-food{margin-top:14px;border-radius:16px;background:var(--bg2);padding:13px 15px}
.fz-pt-food .fz-pt-mid{margin-top:6px}
.fz-pt-ck .fz-pt-kh{align-items:flex-start}
.fz-pt-ckq{font-size:24px;letter-spacing:-.03em;margin-top:6px;line-height:1.15}
.fz-pt-ckg{display:grid;gap:10px;margin-top:14px}
.fz-pt-ckr{display:grid;grid-template-columns:96px minmax(0,1fr) auto;align-items:center;gap:8px 14px}
.fz-pt-ckl{font-size:15px;font-weight:600;color:var(--ink3)}
.fz-pt-seg{justify-self:start}
.fz-pt-seg button{padding:8px 12px;font-size:14.5px}
.fz-pt-ck .fz-pt-kh{flex-wrap:wrap}
.fz-pt-k7{white-space:nowrap}
.fz-pt-ck--n .fz-pt-ckq{font-size:21px}
.fz-pt-ck--n .fz-pt-ckr{grid-template-columns:1fr;gap:6px}
.fz-pt-ck--n .fz-pt-ckr+.fz-pt-ckr{margin-top:6px}
.fz-pt-ck--n .fz-pt-seg{width:100%;justify-self:stretch}
.fz-pt-ck--n .fz-pt-seg button{flex:1;padding:8px 6px}
.fz-pt-ck--n .fz-pt-dots{grid-column:auto}
.fz-pt-dots{display:flex;gap:5px}
.fz-pt-dots i{width:16px;height:16px;border-radius:5px;background:transparent;box-shadow:inset 0 0 0 1.5px rgba(29,29,31,.14)}
.fz-pt-dots i.l0{background:#BFD9C0;box-shadow:none}
.fz-pt-dots i.l1{background:#F5C99A;box-shadow:none}
.fz-pt-dots i.l2{background:#EDA79C;box-shadow:none}
.fz-pt-dots i.t{outline:2px solid var(--ink);outline-offset:1px}
.fz-pt-rows{list-style:none;margin-top:6px}
.fz-pt-rows li+li{border-top:1px solid var(--line)}
.fz-pt-row{display:flex;gap:13px;align-items:flex-start;width:100%;padding:12px 0;text-align:left;background:transparent;border:0;color:var(--ink);border-radius:12px}
@media (hover:hover){.fz-pt-row:hover .fz-pt-rb b{text-decoration:underline;text-underline-offset:3px}}
.fz-pt-up{display:flex;gap:13px;align-items:center;padding:12px 0}
.fz-pt-rb{display:flex;flex-direction:column;align-items:flex-start;gap:3px;min-width:0;flex:1}
.fz-pt-rb b{font-size:16px;font-weight:600;line-height:1.3}
.fz-pt-rb small{font-size:14px;color:var(--ink3);line-height:1.4}
.fz-pt-rb small.late{color:var(--orInk);font-weight:600}
.fz-pt-rb .fz-pt-chip{margin-top:4px}
.fz-pt-when{margin-left:auto;font-size:13px;color:var(--ink2);white-space:nowrap;padding-top:2px}
.fz-pt-ic{width:38px;height:38px;border-radius:12px;display:grid;place-items:center;flex:none}
.fz-pt-date{display:flex;flex-direction:column;align-items:center;justify-content:center;width:52px;height:56px;border-radius:14px;background:var(--bg2);flex:none}
.fz-pt-date b{font-size:21px;letter-spacing:-.03em;line-height:1}
.fz-pt-date span{font-size:11.5px;font-weight:700;color:var(--ink2);text-transform:uppercase;letter-spacing:.04em;margin-top:3px}
.fz-pt-date.late{background:var(--or0)}
.fz-pt-date.late b,.fz-pt-date.late span{color:var(--orInk)}
.fz-pt-strip{display:flex;flex-wrap:wrap;align-items:center;gap:14px 16px}
.fz-pt-sb{flex:1;min-width:220px}
.fz-pt-sb b{font-size:18px}
.fz-pt-sb .fz-pf-tags{margin-top:6px}
.fz-pt-tag{background:var(--bg2);color:var(--ink3)}
.fz-pt-foot{display:flex;flex-wrap:wrap;align-items:center;gap:6px 16px;margin-top:18px}
.fz-pt-foot .fz-pf-saved{margin:0}
.fz-pt-foot .fz-link{font-size:14px}
.fz-ac{max-width:520px}
.fz-ac-lead{margin-top:10px}
.fz-ac-card{display:block;background:var(--card);border-radius:24px;box-shadow:var(--sh);padding:22px 20px;margin-top:20px}
.fz-ac-card .fz-lbl{margin:0 0 8px}
.fz-ac .fz-ac-l2{margin-top:16px}
.fz-ac-pw{position:relative}
.fz-ac-pw .fz-inp{padding-right:54px}
.fz-ac-eye{position:absolute;right:5px;top:50%;transform:translateY(-50%);width:44px;height:44px;display:grid;place-items:center;color:var(--ink2);border-radius:12px}
.fz-ac-wide{width:100%;margin-top:18px}
.fz-ac-c{text-align:center;margin-top:14px}
.fz-ac-c .fz-link,.fz-ac-alt .fz-link,.fz-ac-s .fz-link{display:inline}
.fz-ac-or{display:flex;align-items:center;gap:12px;margin-top:18px;color:var(--ink2);font-size:14px}
.fz-ac-or:before,.fz-ac-or:after{content:"";flex:1;height:1px;background:var(--line)}
.fz-ac-or+.fz-ac-wide{margin-top:16px}
.fz-ac-alt{text-align:center;margin-top:18px;font-size:15px;line-height:1.5;color:var(--ink2)}
.fz-ac-s{font-size:14px;line-height:1.45;margin-top:10px;color:var(--ink2)}
.fz-ac-p{font-size:16.5px;line-height:1.45;color:var(--ink3);margin:0 0 16px}
.fz-ac-tip{margin-top:16px;background:var(--bg2);border-radius:16px;padding:12px 14px;font-size:14.5px;line-height:1.45;color:var(--ink3)}
.fz-ac-msg{margin-top:14px;font-size:15px;line-height:1.45;font-weight:600;color:var(--g)}
.fz-ac-msg.is-err{color:#B3261E}
.fz-ac-ver{background:var(--sky0);border-radius:20px;padding:14px 16px;margin-top:16px;max-width:640px}
.fz-ac-ver b{color:var(--skyInk);font-size:16px}
.fz-ac-ver p{font-size:15px;line-height:1.45;color:var(--ink3);margin:4px 0 6px;overflow-wrap:anywhere}
.fz-ac-ok{display:flex;gap:7px;align-items:center;margin:14px 0 2px;font-size:15px;font-weight:600;color:var(--g)}
.fz-ac-ok.is-off{color:var(--orInk);font-weight:500}
.fz-ac-inv{background:var(--g0);border-radius:22px;padding:16px 18px 14px;margin:16px 0 6px;max-width:640px}
.fz-ac-inv b{display:block;font-size:17px;line-height:1.3}
.fz-ac-inv p{font-size:15px;line-height:1.45;color:var(--ink3);margin:6px 0 12px}
.fz-ac-invb{display:flex;align-items:center;gap:18px;flex-wrap:wrap}
.fz-ac-row{padding:11px 0;border-top:1px solid var(--line)}
.fz-ac-row:first-child{border-top:0;padding-top:0}
.fz-ac-row .fz-lbl{margin:0 0 2px;font-size:13.5px}
.fz-ac-row b{font-size:18px;font-weight:600;overflow-wrap:anywhere}
.fz-ac-row em{font-style:normal;font-size:13.5px;font-weight:600;color:var(--g);margin-left:8px;white-space:nowrap}
.fz-ac-row em.is-no{color:var(--orInk)}
.fz-ac-again{margin-left:8px;font-size:13.5px}
.fz-ac-two{display:flex;gap:10px;margin-top:14px;align-items:center;flex-wrap:wrap}
.fz-ac-two .fz-btn--g{flex:1 1 140px;padding:0 12px}
.fz-ac-sub{margin-top:14px}
.fz-ac-exp{margin-top:14px}
.fz-ac-exp .fz-link{font-size:15px}
.fz-ac-dl{margin-top:22px}
.fz-ac-dl .fz-link{color:#B3261E;font-size:15px}
.fz-ac-del{background:#FCEDEC;box-shadow:none;margin-top:10px}
.fz-ac-del p{font-size:15px;line-height:1.45;color:#5C2622;margin:0 0 12px}
.fz-ac-del .fz-inp{background:#fff}
.fz-ac-nav{font-size:15px;font-weight:600;padding:0 6px;color:var(--ink)}
.fz-ac-nav[aria-current=page]{color:var(--g)}
.fz-priv{max-width:720px}
.fz-priv h2{font-size:21px;font-weight:700;letter-spacing:-.01em;margin:26px 0 6px}
.fz-priv p{font-size:16.5px;line-height:1.55;color:var(--ink3)}
.fz-priv .fz-priv-d{margin-top:10px;font-size:14px;color:var(--ink2)}
.fz-priv .fz-link{display:inline}
.fz-pt-imp{position:relative;cursor:pointer}
.fz-pt-file{position:absolute;width:1px;height:1px;opacity:0;overflow:hidden;clip:rect(0 0 0 0)}
.fz-pt-imp:focus-within,.fz-pt-phadd:focus-within{outline:2px solid var(--g);outline-offset:2px;border-radius:6px}
.fz-pt-impq{display:flex;flex-wrap:wrap;align-items:center;gap:10px 14px;margin-top:12px;padding:12px 16px;border-radius:16px;background:var(--or0);font-size:15px}
.fz-pt-lay{display:grid;grid-template-columns:360px minmax(0,1fr);gap:22px;margin-top:20px;align-items:start}
.fz-pt-side{display:flex;flex-direction:column;gap:16px;position:sticky;top:90px;min-width:0}
.fz-pt-who{display:flex;gap:14px;align-items:center}
.fz-pt-who h3{font-size:28px;letter-spacing:-.04em;line-height:1.05}
.fz-pt-who p{font-size:14px;color:var(--ink2);margin-top:5px;line-height:1.4}
.fz-pt-stats{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:16px}
.fz-pt-st{border-radius:16px;background:var(--bg2);padding:11px 13px;min-width:0}
.fz-pt-st .fz-pt-k{font-size:11px}
.fz-pt-st b{display:block;font-size:21px;letter-spacing:-.035em;margin-top:5px;font-weight:700;line-height:1.15}
.fz-pt-st b.g{color:var(--g)}
.fz-pt-st b.o{color:var(--orInk)}
.fz-pt-st span{display:block;font-size:12.5px;color:var(--ink2);margin-top:2px}
.fz-pt-btns{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px}
.fz-pt-main{min-width:0}
.fz-pt-qa{display:flex;flex-wrap:wrap;gap:8px;margin-top:16px}
.fz-pt-q{display:inline-flex;align-items:center;gap:6px;min-height:40px;padding:0 14px;border-radius:999px;background:var(--card);box-shadow:inset 0 0 0 1.5px var(--line);font-size:14.5px;font-weight:600;color:var(--ink);border:0}
.fz-pt-q em{font-style:normal;color:var(--g);font-size:17px;font-weight:700}
@media (hover:hover){.fz-pt-q:hover{box-shadow:inset 0 0 0 1.5px var(--g)}}
.fz-pt-flt{display:flex;flex-wrap:wrap;gap:6px;margin-top:18px}
.fz-pt-flt button{min-height:36px;padding:0 14px;border-radius:999px;font-size:14px;font-weight:600;color:var(--ink2);background:transparent;border:0}
.fz-pt-flt button[aria-pressed="true"]{background:var(--ink);color:#fff}
.fz-pt-mo{font-size:20px;letter-spacing:-.03em;margin:26px 0 6px;display:flex;align-items:center;gap:12px}
.fz-pt-mo:after{content:"";flex:1;border-top:1px solid var(--line)}
.fz-pt-tl{list-style:none;position:relative;padding-left:96px}
.fz-pt-tl:before{content:"";position:absolute;left:79px;top:14px;bottom:10px;width:2px;background:rgba(29,29,31,.08)}
.fz-pt-it{position:relative;margin-top:12px}
.fz-pt-dt{position:absolute;left:-96px;top:16px;width:66px;text-align:right;font-size:14px;font-weight:700;color:var(--ink3);line-height:1.2}
.fz-pt-dt small{display:block;font-size:12px;font-weight:500;color:var(--ink2)}
.fz-pt-pin{position:absolute;left:-23px;top:18px;width:12px;height:12px;border-radius:50%;background:var(--card);box-shadow:0 0 0 2px var(--g)}
.fz-pt-it.c-o .fz-pt-pin{box-shadow:0 0 0 2px var(--orInk)}
.fz-pt-it.c-r .fz-pt-pin{box-shadow:0 0 0 2px var(--roseInk)}
.fz-pt-it.c-s .fz-pt-pin{box-shadow:0 0 0 2px var(--skyInk)}
.fz-pt-it.c-v .fz-pt-pin{box-shadow:0 0 0 2px var(--vioInk)}
.fz-pt-it.c-n .fz-pt-pin{box-shadow:0 0 0 2px #9A968C}
.fz-pt .fz-pt-it{background:transparent;color:var(--ink)}
.fz-pt-ec{display:flex;gap:14px;align-items:flex-start;padding:16px 18px;border-radius:20px;background:var(--card);box-shadow:var(--sh)}
.fz-pt-ec.acc{box-shadow:inset 3px 0 0 var(--or),var(--sh)}
.fz-pt-ec.acc.r{box-shadow:inset 3px 0 0 #D9776A,var(--sh)}
.fz-pt-eb{flex:1;min-width:0}
.fz-pt-eb h4{font-size:16.5px;font-weight:600;letter-spacing:-.01em;line-height:1.3}
.fz-pt-steps{display:flex;flex-wrap:wrap;align-items:center;gap:6px;margin-top:10px}
.fz-pt-steps .fz-pt-chip{cursor:pointer;min-height:30px}
.fz-pt-steps .fz-pt-chip[aria-pressed="false"]{opacity:.75}
.fz-pt-ar{color:var(--ink2);font-size:13px}
.fz-pt-phs{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}
.fz-pt-ph{position:relative;width:86px;height:86px;border-radius:14px;overflow:hidden;background:var(--bg2);border:0;padding:0;flex:none}
.fz-pt-ph img,.fz-pt-ph .fz-pt-phx{width:100%;height:100%;object-fit:cover;display:block}
.fz-pt-phadd{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;background:transparent;box-shadow:inset 0 0 0 1.5px var(--line);color:var(--ink2);cursor:pointer;text-align:center}
.fz-pt-phadd small{font-size:12px;font-weight:600;line-height:1.2;padding:0 4px}
.fz-pt-phd{position:absolute;top:4px;right:4px;width:28px;height:28px;border-radius:50%;background:rgba(29,29,31,.72);color:#fff;font-size:18px;line-height:1;display:grid;place-items:center;border:0}
.fz-pt-msum{padding:16px 18px}
.fz-pt-ov{position:fixed;inset:0;z-index:60;background:rgba(29,29,31,.42);display:flex;align-items:center;justify-content:center;padding:20px}
.fz-pt-dlg{width:100%;max-width:580px;max-height:calc(100vh - 40px);overflow:auto;border-radius:26px;background:var(--bg);box-shadow:0 30px 80px -20px rgba(0,0,0,.45);padding:22px 24px 0}
.fz-pt-dlg h2{font-size:26px;letter-spacing:-.03em;outline:0}
.fz-pt-dlg>.fz-lbl{margin-top:16px}
.fz-pt-x{width:40px;height:40px;border-radius:50%;background:var(--bg2);color:var(--ink);font-size:24px;line-height:1;display:grid;place-items:center;border:0;flex:none}
.fz-pt-types{display:flex;flex-wrap:wrap;gap:8px}
.fz-pt-types button{display:inline-flex;align-items:center;gap:7px;min-height:40px;padding:0 13px;border-radius:999px;background:var(--card);box-shadow:inset 0 0 0 1.5px var(--line);font-size:14.5px;font-weight:600;color:var(--ink);border:0}
.fz-pt-types button[aria-pressed="true"]{background:var(--g);color:#fff;box-shadow:none}
.fz-pt-fs{display:grid;gap:16px;margin-top:18px}
.fz-pt-fs .fz-lbl{margin:0}
.fz-pt-fs .fz-lbl .fz-inp,.fz-pt-fs .fz-lbl .fz-kcin{margin-top:8px}
.fz-pt-fs .fz-kcin .fz-inp{margin-top:0}
.fz-pt-fs .fz-hint{display:block;margin-top:6px;font-weight:400}
.fz-pt-fs .fz-chips2{margin-top:-6px}
.fz-pt-ta{height:auto;min-height:88px;padding:12px 16px;font-size:16px;font-weight:500;line-height:1.45;resize:vertical;font-family:inherit}
.fz-pt-bopts{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}
.fz-pt-bopts button{display:flex;flex-direction:column;align-items:center;gap:4px;padding:10px 2px 8px;border-radius:14px;background:var(--bg2);font-size:13px;font-weight:600;color:var(--ink3);border:0}
.fz-pt-bopts button[aria-checked="true"]{background:#fff;box-shadow:inset 0 0 0 2px var(--g);color:var(--g)}
.fz-pt-dbar{position:sticky;bottom:0;display:flex;flex-wrap:wrap;align-items:center;gap:10px;margin:20px -24px 0;padding:14px 24px 18px;background:linear-gradient(rgba(251,247,239,0),var(--bg) 26%)}
.fz-pt-lb{background:rgba(0,0,0,.82)}
.fz-pt-lb img{max-width:100%;max-height:calc(100vh - 100px);border-radius:12px;display:block}
.fz-pt-lb .fz-pt-x{position:absolute;top:16px;right:16px;background:#fff}
.fz-pt-spi{width:46px;height:46px;border-radius:14px;display:grid;place-items:center;flex:none;background:var(--g0);color:var(--g)}
.fz-pt-spi.sp1{background:var(--sky0);color:var(--skyInk)}
.fz-pt-spi.sp2{background:var(--bg2);color:#7A5A2E}
.fz-pf-opt[aria-checked="true"] .fz-pt-spi{background:var(--g);color:#fff}
.fz-pt-vbar{display:flex;flex-wrap:wrap;gap:10px;margin-top:20px}
.fz-pt-sheet{margin-top:18px;max-width:820px;background:#fff;border-radius:22px;box-shadow:var(--sh);padding:30px 34px}
.fz-pt-sheet header{border-bottom:2px solid var(--ink);padding-bottom:12px}
.fz-pt-sheet h2{font-size:32px;letter-spacing:-.03em}
.fz-pt-sheet header p{font-size:15px;color:var(--ink2);margin-top:4px}
.fz-pt-sheet h3{font-size:13px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--ink2);margin:22px 0 8px}
.fz-pt-sheet dl{display:grid;grid-template-columns:1fr 1fr;gap:4px 24px}
.fz-pt-sheet dl div{display:flex;gap:10px;padding:6px 0;border-bottom:1px solid var(--line);font-size:15px}
.fz-pt-sheet dt{width:120px;flex:none;color:var(--ink2)}
.fz-pt-sheet dd{font-weight:600}
.fz-pt-sheet p{font-size:15px}
.fz-pt-wl{font-size:13.5px!important;color:var(--ink3);margin-top:6px;line-height:1.6}
.fz-pt-vl{list-style:none}
.fz-pt-vl li{display:flex;gap:14px;padding:7px 0;border-bottom:1px solid var(--line);font-size:15px;line-height:1.45}
.fz-pt-vl li>span{width:110px;flex:none;color:var(--ink2)}
.fz-pt-sheet footer{margin-top:24px;font-size:13px;color:var(--ink2)}
.fz-pt-bico{display:inline-flex}
.fz-pt-clin{display:flex;gap:12px;align-items:flex-start;margin-top:12px}
.fz-pt-clin>div{min-width:0;flex:1}
.fz-pt-clin b{font-size:17px;font-weight:700;display:block;line-height:1.25;overflow-wrap:anywhere}
.fz-pt-clin small{font-size:14px;color:var(--ink2);display:block;margin-top:3px}
.fz-pt-clin .fz-link{flex:none}
.fz-pt-clin .fz-pt-gm{display:inline-block;margin-top:6px;font-size:14.5px}
.fz-pt-send .fz-pt-clin{margin-top:0}
.fz-pt-pickl{justify-self:start}
.fz-pt-vf{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-top:14px}
.fz-pt-vf .fz-lbl{margin:0}
.fz-pt-vf .fz-inp{margin-top:6px;width:100%}
.fz-pt-rem{display:flex;align-items:center;justify-content:space-between;gap:8px 10px;flex-wrap:wrap;margin-top:12px;padding-top:12px;border-top:1px solid var(--line)}
.fz-pt-rem>span{font-size:14.5px;font-weight:600;color:var(--ink3)}
.fz-pt-rem+.fz-hint{margin-top:6px}
.fz-pt .fz-pt-up small.soon{color:var(--orInk);font-weight:600}
.fz-pt-go{margin-left:auto;align-self:center;font-size:14.5px;font-weight:600;color:var(--g);white-space:nowrap;text-decoration:none;padding:10px 0 10px 10px}
@media (hover:hover){.fz-pt-go:hover{text-decoration:underline}}
.fz-pt-sw{width:52px;height:32px;border-radius:999px;background:rgba(29,29,31,.2);border:0;position:relative;flex:none;cursor:pointer;transition:background .2s;padding:0}
.fz-pt-sw:after{content:"";position:absolute;left:3px;top:3px;width:26px;height:26px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.25);transition:transform .2s}
.fz-pt-sw.on{background:var(--g)}
.fz-pt-sw.on:after{transform:translateX(20px)}
.fz-pt-mct{font-size:20px;font-weight:700;letter-spacing:-.03em;line-height:1.2;margin-top:10px;color:var(--ink)}
.fz-pt-mc .fz-pt-d{margin-top:6px}
.fz-pt-inl{display:inline;padding:0;font-size:inherit}
.fz-pt-bar{height:7px;border-radius:9px;background:var(--bg2);margin-top:14px;overflow:hidden}
.fz-pt-bar i{display:block;height:100%;background:var(--g);border-radius:9px;transition:width .3s}
.fz-pt-chk{list-style:none;margin:12px 0 0;padding:0;display:flex;flex-direction:column;gap:6px}
.fz-pt-chk li{display:flex;align-items:center;gap:11px;font-size:15.5px;font-weight:600;min-height:36px;color:var(--ink)}
.fz-pt-chk li>i{width:26px;height:26px;border-radius:50%;display:grid;place-items:center;flex:none;box-shadow:inset 0 0 0 2px rgba(29,29,31,.28);color:#fff}
.fz-pt-chk li.y>i{background:var(--g);box-shadow:none}
.fz-pt-chk small{margin-left:auto;font-size:13.5px;color:var(--ink2);font-weight:500}
.fz-pt-chk .fz-link{margin-left:auto}
.fz-pt-vsr{position:relative;margin-top:8px}
.fz-pt-vsr .fz-inp{width:100%;margin:0;padding-left:44px}
.fz-pt-vsi{position:absolute;left:15px;top:50%;transform:translateY(-50%);display:flex;color:var(--ink2);pointer-events:none}
.fz-pt-vs{margin-top:14px}
.fz-pt-vres{list-style:none;margin:10px 0 0;padding:0}
.fz-pt-vres button{width:100%;display:flex;align-items:center;gap:12px;text-align:left;padding:12px 10px;border:0;border-top:1px solid var(--line);background:transparent;border-radius:0;color:var(--ink);cursor:pointer;font:inherit}
.fz-pt-vres li:first-child button{border-top:0}
.fz-pt-vres button>span{min-width:0}
.fz-pt-vres button b{font-size:16px;font-weight:600;display:block;line-height:1.25;overflow-wrap:anywhere}
.fz-pt-vres button small{font-size:13.5px;color:var(--ink2);display:block;margin-top:2px}
.fz-pt-vres button em{margin-left:auto;font-style:normal;font-size:14.5px;font-weight:600;color:var(--g);white-space:nowrap}
.fz-pt-vres button.on{background:var(--g0);border-radius:12px}
@media (hover:hover){.fz-pt-vres button:hover{background:rgba(47,93,58,.06)}}
.fz-pt-src{font-size:12.5px;color:var(--ink2);margin-top:12px;line-height:1.45}
.fz-pt-src .fz-link{font-size:inherit;display:inline;padding:0}
.fz-pt-vown{display:grid;gap:12px;margin-top:14px}
.fz-pt-vown .fz-lbl{margin:0}
.fz-pt-vown .fz-inp{margin-top:6px;width:100%}
.fz-pt-bound{margin-top:22px;font-size:14px;line-height:1.45;color:var(--ink3);max-width:760px}
.fz-pt-leg{font-size:13px;color:var(--ink2);margin-top:4px}
.fz-pt-leg i{display:inline-block;width:9px;height:9px;border:2px solid var(--g);border-radius:2px;margin-right:6px;vertical-align:-1px}
.fz-pt-send{margin-top:16px;max-width:820px;display:grid;gap:12px;padding:18px 20px;border-radius:20px;background:var(--card);box-shadow:var(--sh)}
.fz-pt-send .fz-lbl{margin:0}
.fz-pt-send .fz-inp{margin-top:8px;max-width:420px}
.fz-pt-send .fz-hint{margin-top:0}
.fz-pt-sendb{display:flex;flex-wrap:wrap;align-items:center;gap:10px}
.fz-pt-vpics{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}
.fz-pt-vpics figure{margin:0}
.fz-pt-vpics img,.fz-pt-vpics .fz-pt-phx{width:100%;aspect-ratio:1/1;object-fit:cover;border-radius:10px;display:block}
.fz-pt-vpics figcaption{font-size:12.5px;color:var(--ink2);margin-top:4px;line-height:1.35}
@media print{.fz-pt-sheet{box-shadow:none;padding:0;max-width:none;border-radius:0}.fz-pt-ov{display:none!important}.fz-pt-vpics{grid-template-columns:repeat(4,1fr)}.fz-pt-vpics figure{break-inside:avoid}}
@container fz (max-width:1100px){
.fz-pt-lay{grid-template-columns:320px minmax(0,1fr)}
.fz-pt-ckr{grid-template-columns:84px minmax(0,1fr)}
.fz-pt-dots{grid-column:2}
}
@container fz (max-width:900px){
.fz-pt-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
.fz-pt-w2,.fz-pt-w3{grid-column:1/-1}
.fz-pt-mc{grid-column:1/-1}
.fz-pt-lay{grid-template-columns:minmax(0,1fr)}
.fz-pt-side{position:static}
}
@container fz (max-width:600px){
.fz-pt-grid{grid-template-columns:minmax(0,1fr);gap:12px}
.fz-pt-card{padding:18px 16px;border-radius:22px}
.fz-pt-big{font-size:46px}
.fz-pt-mid{font-size:32px}
.fz-pt-acts{width:100%}
.fz-pt-acts .fz-btn{flex:1}
.fz-pt-pets{gap:8px;margin-top:16px}
.fz-pt-pet{min-height:44px;padding:5px 14px 5px 5px;font-size:15px}
.fz-pt-pet small{display:none}
.fz-pt-ckr{grid-template-columns:1fr;gap:6px}
.fz-pt-dots{grid-column:auto}
.fz-pt-seg{width:100%}
.fz-pt-seg button{flex:1;padding:8px 6px}
.fz-pt-tl{padding-left:22px}
.fz-pt-tl:before{left:5px}
.fz-pt-dt{position:static;display:flex;gap:6px;align-items:baseline;text-align:left;width:auto;margin:0 0 6px 2px}
.fz-pt-dt small{display:inline}
.fz-pt-pin{left:-22px;top:4px}
.fz-pt-ec{padding:14px 14px;gap:12px}
.fz-pt-ov{align-items:flex-end;padding:0}
.fz-pt-dlg{max-width:none;max-height:92vh;border-radius:24px 24px 0 0;padding:18px 16px 0}
.fz-pt-dbar{margin:18px -16px 0;padding:12px 16px 18px}
.fz-pt-sheet{padding:20px 16px}
.fz-pt-sheet dl{grid-template-columns:1fr}
.fz-pt-vl li{flex-direction:column;gap:2px}
.fz-pt-vl li>span{width:auto}
.fz-pt-ph{width:76px;height:76px}
.fz-pt-vpics{grid-template-columns:repeat(2,minmax(0,1fr))}
.fz-pt-send{padding:16px}
.fz-pt-vf{grid-template-columns:minmax(0,1fr)}
}
.fz-pseal{position:relative;display:inline-block;flex:none;width:28px;height:28px;border-radius:50%;background:var(--g);vertical-align:middle}
.fz-pseal i{position:absolute;border-radius:50%}
.fz-pseal .r1{inset:9%;border:1.5px solid rgba(255,255,255,.5)}
.fz-pseal .r2{inset:23%;border:1px dashed rgba(255,255,255,.42)}
.fz-pseal .f{left:38.7%;top:37.5%;width:22%;height:34%;border-radius:0;background:#fff;-webkit-mask-size:100% 100%;mask-size:100% 100%;-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat}
.fz-pseal.xs{width:22px;height:22px}.fz-pseal.xs .r2{display:none}.fz-pseal.xs .r1{border-width:1px}
.fz-pseal.sm{width:30px;height:30px}
.fz-pseal.md{width:52px;height:52px}
.fz-pseal.xl{width:92px;height:92px;box-shadow:0 14px 30px -18px rgba(29,57,37,.7)}
.fz-pseal.xl .r1{border-width:2px}
.fz-pluspill{display:inline-flex!important;align-items:center;gap:7px;padding:6px 14px!important;border-radius:999px;background:var(--g0);color:var(--g)!important;font-weight:650!important}
@media (hover:hover){.fz-pluspill:hover{background:#DCE9DC}}
.fz-pluspill[aria-current="page"]{background:var(--g);color:#fff!important}
.fz-pluspill[aria-current="page"] .fz-pseal{background:#fff}.fz-pluspill[aria-current="page"] .fz-pseal .f{background:var(--g)}.fz-pluspill[aria-current="page"] .fz-pseal .r1{border-color:rgba(47,93,58,.4)}
/* avatar with a photo */
.fz-pt-av.ph{background:var(--bg2);overflow:hidden}
.fz-pt-av.ph img,.fz-pt-av.ph .fz-pt-phx{width:100%;height:100%;object-fit:cover;display:block}
.fz-pt-av.xl{width:96px;height:96px;font-size:40px}
.fz-pt-av.hero{width:132px;height:132px;font-size:54px;border-radius:30px}
/* warm profile */
.fz-pt-hero{display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:22px;align-items:start}
.fz-pt-heb h2{font-size:34px;font-weight:700;letter-spacing:-.03em;line-height:1.1}
.fz-pt-hes{color:var(--ink2);font-size:15.5px;margin-top:6px}
.fz-pt-heb .fz-pt-chips{margin-top:12px}
.fz-pt-heb .fz-pf-tags{margin-top:10px}
.fz-pt-fav{margin-top:10px;font-size:15.5px;color:var(--ink3)}
.fz-pt-q{margin-top:10px;font-size:23px;line-height:1.25;color:#2B3A22}
.fz-pt-heb>.fz-link{margin-top:12px}
.fz-pt-hi{display:flex;gap:18px;align-items:flex-start;background:linear-gradient(135deg,#EAF2E8,#FFFEFA 60%)}
.fz-pt-hi h2{font-size:28px;font-weight:700;letter-spacing:-.025em}
.fz-pt-hi p{margin-top:6px;color:var(--ink3);font-size:16px;line-height:1.5;max-width:640px}
.fz-pt-hip{display:flex;gap:10px;align-items:flex-start;margin-top:12px!important;padding:12px 14px;border-radius:16px;background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.05)}
.fz-pt-hip b{color:var(--g)}
.fz-pt-pbar{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-top:18px;padding:10px 16px 10px 10px;border-radius:18px;background:var(--g0);color:var(--ink3);font-size:15px}
.fz-pt-pbar>span:not(.fz-pseal){flex:1;min-width:200px}
.fz-pt-pbar.end{background:var(--bg2)}
.fz-pt-tease{background:linear-gradient(160deg,#EAF2E8,#FFFEFA 70%);display:flex;flex-direction:column;align-items:flex-start;gap:10px}
.fz-pt-tease h3{font-size:20px;font-weight:700;letter-spacing:-.02em}
.fz-pt-tease p{color:var(--ink3);font-size:15px;line-height:1.5}
.fz-pt-tease .fz-btn{margin-top:auto}
.fz-pt-tp b{color:var(--g)}
.fz-pt-plusl{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-top:16px;padding:12px 14px;border-radius:16px;background:var(--bg2);font-size:15px;color:var(--ink3)}
.fz-pseal.fz-sealw{width:26px;height:26px}
/* profile fields */
.fz-pt-picf{display:flex;gap:16px;align-items:center}
.fz-pt-picf>div{display:flex;flex-direction:column;align-items:flex-start;gap:8px}
.fz-pt-picb{position:relative;cursor:pointer}
.fz-pt-trs{display:flex;flex-wrap:wrap;gap:8px}
.fz-pt-trs .fz-chip[aria-pressed="true"]{background:var(--g);color:#fff}
.fz-pt-trs .fz-chip:disabled{opacity:.45;cursor:default}
.fz-pt-mon{max-width:240px}.fz-pt-day{max-width:120px}
/* Plus page */
.fz-plus-top{text-align:center;display:flex;flex-direction:column;align-items:center}
.fz-plus-top .fz-eb{margin-top:18px}
.fz-plus-top .fz-h2{margin-top:8px;max-width:760px}
.fz-plus-top .fz-lead{margin-left:auto;margin-right:auto}
.fz-plus-st{margin:26px auto 0;max-width:640px;text-align:center;padding:12px 18px;border-radius:16px;background:var(--g0);color:var(--ink3);font-size:15.5px}
.fz-plus-st.end{background:var(--bg2)}
.fz-plus-cmp{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.15fr);gap:20px;max-width:940px;margin:40px auto 0;align-items:start}
.fz-plus-c{background:var(--card);border-radius:28px;box-shadow:var(--sh);padding:28px 30px}
.fz-plus-c.p{box-shadow:0 0 0 2px var(--g),var(--sh)}
.fz-plus-c h2{display:flex;align-items:center;gap:10px;font-size:22px;font-weight:700;letter-spacing:-.02em}
.fz-plus-pr{margin-top:8px;font-size:17px;font-weight:650;color:var(--g)}
.fz-plus-all{margin-top:16px;font-size:14.5px;color:var(--ink2);font-weight:600}
.fz-plus-c ul{list-style:none;margin:14px 0 0;padding:0;display:flex;flex-direction:column;gap:10px}
.fz-plus-c li{display:flex;gap:10px;align-items:flex-start;font-size:15.5px;line-height:1.4;color:var(--ink)}
.fz-plus-c li svg{flex:none;color:var(--g);margin-top:1px}
.fz-plus-c .fz-hint{margin-top:16px}
.fz-plus-go{width:100%;margin-top:20px}
.fz-plus-n{margin-top:10px;font-size:14px;line-height:1.45;color:var(--ink2);text-align:center}
.fz-plus-prom{list-style:none;padding:0;margin:36px auto 0;max-width:940px;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px}
.fz-plus-prom li{display:flex;gap:10px;align-items:flex-start;font-size:15px;line-height:1.5;color:var(--ink3)}
.fz-plus-prom svg{flex:none;color:var(--g);margin-top:2px}
.fz-plus-back{text-align:center;margin-top:30px}
@container fz (max-width:900px){
.fz-plus-cmp{grid-template-columns:minmax(0,1fr)}
.fz-plus-prom{grid-template-columns:minmax(0,1fr);gap:12px}
.fz-pt-hero{grid-template-columns:auto minmax(0,1fr)}
.fz-pt-hee{grid-column:1/-1;justify-self:start}
}
@container fz (max-width:600px){
.fz-pt-hero{grid-template-columns:minmax(0,1fr);gap:14px}
.fz-pt-av.hero{width:104px;height:104px;font-size:44px;border-radius:26px}
.fz-pt-heb h2{font-size:28px}
.fz-pt-hi{flex-direction:column}
.fz-plus-c{padding:22px 20px;border-radius:24px}
.fz-pt-picf{align-items:flex-start}
}
.fz-links button{white-space:nowrap}
.fz-pluspill{white-space:nowrap;font-size:15px}
@container fz (max-width:600px){.fz-pluspill{padding:5px 11px!important;font-size:14px}}
.fz-logo.is-plus{display:inline-flex;align-items:center;gap:8px}
.fz-logo-plus{display:inline-block;padding:4px 8px 3px;border-radius:999px;background:var(--g);color:#fff;font-family:inherit;font-size:11.5px;font-weight:700;line-height:1;letter-spacing:.08em;text-transform:uppercase;white-space:nowrap}
.fz-nav .fz-nl{gap:26px}.fz-nav .fz-links{gap:20px}
@container fz (max-width:980px){.fz-links button:nth-last-child(-n+3){display:none}}
@container fz (max-width:1200px){.fz-links button:nth-last-child(-n+2){display:none}}
/* inline text links in sentences: a taller hit area (24 px or more) without moving the text */
.fz-pt-ft .fz-link,.fz-pt-src .fz-link{padding:4px 0}
.fz-box .t .fz-link{padding:3px 0}
/* ---------- Plus, second build: sidebar (izgled 3), Today, meals, walks, medicines, days to remember ---------- */
.fz-pt--px .fz-wrap{max-width:1480px}
.fz-px{display:grid;grid-template-columns:224px minmax(0,1fr);gap:32px;margin-top:24px;align-items:start}
.fz-px-side{position:sticky;top:92px;display:flex;flex-direction:column;min-width:0;max-height:calc(100vh - 110px);overflow-y:auto;padding:3px;margin:-3px;scrollbar-width:thin}
.fz-px-k{font-size:12.5px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--ink2);padding:0 12px;margin:20px 0 6px;line-height:1.3;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.fz-px-k:first-child{margin-top:4px}
.fz-px-pets,.fz-px-nav{display:flex;flex-direction:column;gap:3px}
.fz-px-it{display:flex;align-items:center;gap:12px;width:100%;min-height:46px;padding:6px 12px;border:0;border-radius:14px;background:transparent;color:var(--ink);font-size:16px;font-weight:500;line-height:1.25;text-align:left;transition:background-color .2s,color .2s}
@media (hover:hover){.fz-px-it:hover{background:rgba(47,93,58,.08)}}
.fz-px-it b{font-weight:600;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.fz-px-it small{margin-left:auto;padding-left:8px;font-size:13.5px;color:var(--ink2)}
.fz-px-it .fz-pt-av{width:30px;height:30px;font-size:13px}
.fz-px-it>svg{flex:none;color:var(--g)}
.fz-px-it.add{color:var(--g);font-weight:600}
.fz-px-pets .fz-px-it[aria-pressed="true"]{background:var(--g0)}
.fz-px-nav .fz-px-it[aria-current="page"]{background:var(--g);color:#fff;font-weight:600}
.fz-px-nav .fz-px-it[aria-current="page"]>svg{color:#fff}
.fz-px-main{min-width:0}
.fz-px-h{display:flex;align-items:baseline;flex-wrap:wrap;gap:4px 14px;margin:0 0 14px}
.fz-px-h h2{font-size:34px;font-weight:700;letter-spacing:-.035em;line-height:1.1;outline:none}
.fz-px-h span{font-size:16px;color:var(--ink2)}
.fz-px-lead{font-size:16px;line-height:1.5;color:var(--ink3);margin:-4px 0 18px;max-width:64ch}
.fz-px .fz-pt-pbar{margin:0 0 16px}
.fz-px .fz-pt-note{margin:0 0 16px}
.fz-px .fz-pt-grid{margin-top:0}
.fz-px .fz-pt-lay{grid-template-columns:300px minmax(0,1fr);margin-top:0}
.fz-px .fz-pt-side{top:92px}
.fz-px-cols{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px;align-items:start}
.fz-px-full{grid-column:1/-1}
.fz-px-sr{position:absolute;width:1px;height:1px;margin:-1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
.fz-px-list{margin-top:8px}
.fz-px-rm{flex:none;font-size:14.5px;padding:6px 0}
.fz-px-rmq{display:inline-flex;align-items:center;gap:12px;flex:none;flex-wrap:wrap;justify-content:flex-end}
.fz-px-go{margin-top:16px}
.fz-px-f{margin:14px 0 0}
.fz-px-f2,.fz-px-f3{display:grid;gap:12px;margin-top:14px}
.fz-px-f2{grid-template-columns:repeat(2,minmax(0,1fr))}
.fz-px-f3{grid-template-columns:minmax(0,1fr) minmax(0,1fr) minmax(150px,1.3fr);align-items:end}
.fz-px-f3w{grid-template-columns:minmax(0,2fr) minmax(0,1.3fr) auto;align-items:end}
.fz-px-f2 .fz-lbl,.fz-px-f3 .fz-lbl{margin:0}
.fz-px-f2 .fz-inp,.fz-px-f3 .fz-inp,.fz-px-f .fz-inp{margin-top:8px;font-size:17px}
.fz-px-chips{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}
.fz-px-chips .fz-chip{min-height:40px;box-shadow:inset 0 0 0 1px var(--line)}
.fz-px-chk{display:inline-flex;align-items:center;gap:10px;min-height:52px;font-size:16px;font-weight:600;color:var(--ink3);white-space:nowrap}
.fz-px-chk input{width:22px;height:22px;accent-color:var(--g);margin:0}
.fz-px-avg{font-size:14px;color:var(--ink2)}
.fz-px-avg b{color:var(--ink);font-weight:700}
.fz-px-meter{position:relative;height:12px;border-radius:999px;background:var(--bg2);margin-top:12px;overflow:hidden}
.fz-px-meter i{position:absolute;left:0;top:3px;bottom:3px;border-radius:999px;background:var(--g)}
.fz-px-mband{position:absolute;top:0;bottom:0;background:#C9DCCB}
.fz-px-mband.line{width:3px!important;margin-left:-1px;background:var(--ink3);z-index:1}
.fz-px-note{margin-top:14px}
/* bars */
.fz-px-bars{display:flex;align-items:stretch;gap:8px;margin-top:14px;height:178px}
.fz-px-bar{flex:1;min-width:0;display:flex;flex-direction:column;align-items:stretch;gap:6px;padding:4px 2px 2px;border:0;border-radius:12px;background:transparent;color:var(--ink);font:inherit;transition:background-color .2s}
@media (hover:hover){button.fz-px-bar:hover{background:var(--bg2)}}
.fz-px-bar[aria-pressed="true"]{background:var(--g0)}
.fz-px-bv{font-size:12.5px;font-weight:700;text-align:center;color:var(--ink3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.fz-px-bt{position:relative;flex:1;display:flex;align-items:flex-end;justify-content:center}
.fz-px-bt i{display:block;width:min(30px,72%);border-radius:4px 4px 2px 2px;background:#5E8C68;position:relative}
.fz-px-bar[aria-pressed="true"] .fz-px-bt i{background:var(--g)}
.fz-px-band{position:absolute;left:0;right:0;background:rgba(47,93,58,.12);border-top:1px dashed rgba(47,93,58,.45);border-bottom:1px dashed rgba(47,93,58,.45)}
.fz-px-bl{font-size:12.5px;text-align:center;color:var(--ink2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.fz-px-bar[aria-pressed="true"] .fz-px-bl{color:var(--ink);font-weight:700}
.fz-px-leg{display:flex;align-items:center;gap:8px;margin-top:10px;font-size:13.5px;color:var(--ink2)}
.fz-px-leg i{width:18px;height:10px;border-radius:2px;background:rgba(47,93,58,.12);border-top:1px dashed rgba(47,93,58,.45);border-bottom:1px dashed rgba(47,93,58,.45);flex:none}
.fz-px-leg i.line{height:0;border-bottom:0}
.fz-px-k2{margin-top:18px}
/* walks */
.fz-px-big{width:100%;height:60px;font-size:18px;gap:10px}
/* medicines */
.fz-px-acts{display:flex;flex-wrap:wrap;gap:8px;justify-content:flex-end}
.fz-px-acts .fz-btn svg{flex:none}
.fz-px-meds{list-style:none;margin-top:6px}
.fz-px-meds>li{padding:16px 0}
.fz-px-meds>li+li{border-top:1px solid var(--line)}
.fz-px-mh{display:flex;gap:13px;align-items:flex-start}
.fz-px-rx{font-size:15.5px;line-height:1.4;color:var(--ink3)}
.fz-px-doses{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin:12px 0 0 51px}
.fz-px-dk{font-size:12.5px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--ink2);margin-right:4px}
.fz-px-dose{display:inline-flex;align-items:center;gap:8px;min-height:44px;padding:6px 14px 6px 8px;border:0;border-radius:999px;background:var(--bg2);color:var(--ink);font:inherit;font-size:15px;transition:background-color .2s}
.fz-px-dose b{font-weight:700}
.fz-px-dose small{font-size:13px;color:var(--ink2)}
.fz-px-dose.ok{background:var(--g0)}
.fz-px-dose.ok small{color:var(--g);font-weight:600}
.fz-px-box{width:24px;height:24px;border-radius:8px;display:grid;place-items:center;background:#fff;box-shadow:inset 0 0 0 1.5px #8C877C;color:#fff}
.fz-px-dose.ok .fz-px-box{background:var(--g);box-shadow:none}
.fz-px-mact{display:flex;flex-wrap:wrap;align-items:center;gap:6px 20px;margin:10px 0 0 51px}
.fz-px-mact .fz-link{font-size:14.5px;padding:6px 0}
.fz-px-form{box-shadow:inset 0 0 0 2px var(--g),var(--sh)}
.fz-px-tms{border:0;padding:0;margin:16px 0 0;min-width:0}
.fz-px-tms legend{padding:0;margin-bottom:8px}
.fz-px-tmr{display:flex;flex-wrap:wrap;align-items:center;gap:10px}
.fz-px-tm{display:inline-flex;align-items:center;gap:4px}
.fz-px-tm .fz-inp{width:150px;height:46px;font-size:17px}
.fz-px-x{width:40px;height:40px;border:0;border-radius:50%;background:transparent;font-size:24px;line-height:1;color:var(--ink2)}
@media (hover:hover){.fz-px-x:hover{background:var(--bg2);color:var(--ink)}}
.fz-px-fbar{display:flex;justify-content:flex-end;gap:10px;margin-top:18px}
/* days */
.fz-px-ric{display:inline-flex;vertical-align:-2px;margin-right:6px;color:var(--orInk)}
.fz-px-now .fz-pt-date{background:var(--g);}
.fz-px-now .fz-pt-date b,.fz-px-now .fz-pt-date span{color:#fff}
.fz-pt-rb small.fz-px-tday{color:var(--g);font-weight:600}
.fz-pt-date.fz-px-past{opacity:.6}
/* Today on the overview */
.fz-px-tiles{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:10px;margin-top:12px}
.fz-px-tile{display:flex;flex-direction:column;align-items:flex-start;gap:4px;min-width:0;padding:14px 16px;border:0;border-radius:18px;background:var(--bg2);color:var(--ink);font:inherit;text-align:left;transition:background-color .2s,box-shadow .2s}
@media (hover:hover){.fz-px-tile:hover{background:#EEE6D6}}
.fz-px-tk{display:inline-flex;align-items:center;gap:7px;font-size:13px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:var(--g)}
.fz-px-tile b{font-size:24px;font-weight:700;letter-spacing:-.03em;line-height:1.15;color:var(--ink);display:flex;align-items:center;min-height:30px}
.fz-px-tile b svg{color:var(--g)}
.fz-px-tile small{font-size:14px;line-height:1.35;color:var(--ink3);max-width:100%;overflow-wrap:anywhere;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
@media print{.fz-px{display:block}}
@container fz (max-width:1100px){
.fz-px{grid-template-columns:206px minmax(0,1fr);gap:24px}
.fz-px .fz-pt-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
.fz-px .fz-pt-w2,.fz-px .fz-pt-w3{grid-column:1/-1}
.fz-px .fz-pt-lay{grid-template-columns:minmax(0,1fr)}
.fz-px .fz-pt-side{position:static}
.fz-px-cols{grid-template-columns:minmax(0,1fr)}
.fz-px-it small{display:none}
}
@container fz (max-width:900px){
.fz-px{grid-template-columns:minmax(0,1fr);gap:14px;margin-top:18px}
.fz-px-side{position:static;max-height:none;overflow:visible;padding:0;margin:0;gap:10px}
.fz-px-k{display:none}
.fz-px-pets,.fz-px-nav{flex-direction:row;overflow-x:auto;gap:8px;padding:3px 3px 6px;margin:0 -3px;scrollbar-width:none}
.fz-px-pets::-webkit-scrollbar,.fz-px-nav::-webkit-scrollbar{display:none}
.fz-px-pets,.fz-px-nav{padding-right:36px;-webkit-mask-image:linear-gradient(90deg,#000 calc(100% - 36px),transparent);mask-image:linear-gradient(90deg,#000 calc(100% - 36px),transparent)}
.fz-px-it{width:auto;flex:none;min-height:44px;padding:6px 16px 6px 12px;border-radius:999px;background:var(--card);box-shadow:var(--sh);font-size:15px}
.fz-px-pets .fz-px-it{padding-left:6px}
.fz-px-pets .fz-px-it[aria-pressed="true"]{background:#fff;box-shadow:inset 0 0 0 2px var(--g),var(--sh)}
.fz-px-h h2{font-size:28px}
}
@container fz (max-width:600px){
.fz-px .fz-pt-grid{grid-template-columns:minmax(0,1fr)}
.fz-px-f2,.fz-px-f3,.fz-px-f3w{grid-template-columns:minmax(0,1fr)}
.fz-px-f3:not(.fz-px-f3w){grid-template-columns:repeat(2,minmax(0,1fr))}
.fz-px-f3:not(.fz-px-f3w) .fz-lbl:last-child{grid-column:1/-1}
.fz-px-doses,.fz-px-mact{margin-left:0}
.fz-px-tiles{grid-template-columns:repeat(2,minmax(0,1fr))}
.fz-px-tile{padding:12px 13px}
.fz-px-tile b{font-size:20px}
.fz-px-bars{gap:4px;height:160px}
.fz-px-bv,.fz-px-bl{font-size:11.5px}
.fz-px-fbar .fz-btn{flex:1}
}
/* meals from the kitchen */
.fz-px-tabs{display:flex;margin-top:12px}
.fz-px-tabs button{flex:1;min-height:40px;padding:8px 10px}
.fz-px-pick{display:flex;flex-direction:column;gap:6px;margin-top:12px}
.fz-px-optw{display:flex;align-items:center;gap:10px}
.fz-px-opt{flex:1;min-width:0;display:flex;align-items:center;gap:11px;padding:9px 12px;border:0;border-radius:16px;background:var(--bg2);color:var(--ink);font:inherit;text-align:left;transition:background-color .2s,box-shadow .2s}
@media (hover:hover){.fz-px-opt:hover{background:#EEE6D6}}
.fz-px-opt[aria-pressed="true"]{background:var(--g0);box-shadow:inset 0 0 0 2px var(--g)}
.fz-px-opt .fz-pt-ic{width:34px;height:34px;border-radius:11px}
.fz-px-opt .fz-pt-rb b{font-size:15.5px}
.fz-px-opt .fz-pt-rb small{font-size:13.5px}
.fz-px-rad{width:20px;height:20px;border-radius:50%;flex:none;box-shadow:inset 0 0 0 2px #8C877C;background:#fff}
.fz-px-opt[aria-pressed="true"] .fz-px-rad{box-shadow:inset 0 0 0 6px var(--g)}
.fz-px-fdadd{display:flex;width:fit-content;margin-top:12px;padding:4px 0}
.fz-px-ff{margin-top:12px;padding:14px;border-radius:18px;background:var(--bg2)}
.fz-px-ff .fz-px-f2{margin-top:0;grid-template-columns:minmax(0,1.5fr) minmax(0,1fr);align-items:end}
.fz-px-ff .fz-inp{background:#fff}
.fz-px-f2a{grid-template-columns:minmax(0,1fr) minmax(150px,1fr);align-items:end}
.fz-px-prev{font-weight:600;color:var(--g)}
.fz-px-again{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin-top:12px}
.fz-px-agb{display:inline-flex;align-items:center;gap:6px;min-height:40px;max-width:100%;padding:6px 14px 6px 10px;border:0;border-radius:999px;background:var(--g0);color:var(--g2);font:inherit;font-size:14.5px;font-weight:600;transition:background-color .2s}
.fz-px-agb span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
@media (hover:hover){.fz-px-agb:hover{background:#D9E6DA}}
.fz-px-agb svg{flex:none}
.fz-px-kb{margin-top:14px}
.fz-px-kbb svg{flex:none}
@container fz (max-width:600px){
.fz-px-f2a{grid-template-columns:minmax(0,1fr) minmax(0,1fr)}
.fz-px-tabs button{padding:8px 6px;font-size:14px}
}
.fz-px-th{width:44px;height:44px;border-radius:12px;object-fit:cover;flex:none;background:var(--bg2);display:block}
.fz-px-th.sm{width:24px;height:24px;border-radius:7px}
.fz-px-tic{width:44px;height:44px;border-radius:12px}
.fz-px-tic.sm{width:24px;height:24px;border-radius:7px}
.fz-px-opt .fz-px-th,.fz-px-opt .fz-px-tic{width:46px;height:46px}
.fz-px-agb{padding-left:6px}
.fz-px-kbp{display:inline-block;margin-left:2px;padding:3px 7px 2px;border-radius:999px;background:var(--g);color:#fff;font-size:10.5px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;line-height:1.1}
/* the record for the vet (third build): brand line, questions, A4 when printed or saved as PDF */
.fz-pt-kt{display:block;font-size:12.5px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--g);margin-bottom:6px}
.fz-pt-vqs{white-space:pre-wrap;padding:10px 14px;border-left:3px solid var(--g);background:#F7F5EF;border-radius:0 10px 10px 0;line-height:1.5}
.fz-pt-vqf{margin-top:16px}
.fz-ta{height:auto;min-height:92px;margin-top:8px;padding:12px 16px;font-family:inherit;font-size:16px;font-weight:500;line-height:1.45;resize:vertical}
.fz-pt-vl li>div b{font-weight:700}
@page{size:A4;margin:14mm 14mm 16mm}
@media print{
.fz-pt-sheet{font-size:11pt;margin:0}
.fz-pt-sheet h3{break-after:avoid;page-break-after:avoid}
.fz-pt-vl li,.fz-pt-sheet dl div,.fz-pt-chart,.fz-pt-vqs{break-inside:avoid;page-break-inside:avoid}
.fz-pt-vqs{background:none}
.fz-pt-sheet h3{margin:16px 0 6px}
.fz-pt-vl li{padding:5px 0}
.fz-pt-sheet dl div{padding:4px 0}
.fz-pt-sheet footer{margin-top:14px}
}
@media print{
html,body,.fz,.fz-in,.fz-sec.fz-pt{background:#fff!important}
.fz-sec.fz-pt{padding:0!important}
.fz-px{margin:0!important}
.fz-pt .fz-wrap{padding:0!important;max-width:none!important}
}
/* vet visits (Pregledi): the next visit as a card, the vet's view and form, the paper */
.fz-pxv-cols{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,1fr);gap:18px;align-items:start}
.fz-pxv-col{display:flex;flex-direction:column;gap:18px;min-width:0}
.fz-pxv-pass{position:relative;background:var(--card);border-radius:24px;box-shadow:var(--sh);overflow:hidden}
.fz-pxv-pb{display:flex;justify-content:space-between;align-items:flex-start;gap:14px;background:var(--g);color:#fff;padding:18px 20px 20px}
.fz-pxv-pk{display:block;font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;opacity:.82}
.fz-pxv-pb h3{font-size:28px;font-weight:700;letter-spacing:-.035em;line-height:1.12;margin-top:4px;color:#fff;outline:none}
.fz-pxv-pb p{font-size:15px;opacity:.92;margin-top:4px;line-height:1.4}
.fz-pxv-pic{flex:none;width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,.16);display:grid;place-items:center;color:#fff}
.fz-pxv-perf{position:relative;height:20px;background:var(--card)}
.fz-pxv-perf:after{content:"";position:absolute;left:22px;right:22px;top:9px;border-top:2px dashed #DDD5C6}
.fz-pxv-perf i{position:absolute;top:0;width:20px;height:20px;border-radius:50%;background:var(--bg)}
.fz-pxv-perf i:first-child{left:-10px}
.fz-pxv-perf i:last-child{right:-10px}
.fz-pxv-body{padding:2px 20px 20px}
.fz-pxv-rows{list-style:none;margin:0;padding:0}
.fz-pxv-rows li{display:flex;justify-content:space-between;align-items:baseline;gap:14px;padding:10px 0;border-top:1px solid var(--line);font-size:15px;line-height:1.4}
.fz-pxv-rows li:first-child{border-top:0}
.fz-pxv-rows li span{color:var(--ink2);flex:none;max-width:46%}
.fz-pxv-rows li b{font-weight:600;text-align:right;min-width:0;overflow-wrap:anywhere}
.fz-pxv-rows li.warn{background:var(--or0);margin:6px -10px 0;padding:10px;border-radius:12px;border-top:0}
.fz-pxv-rows li.warn b{color:var(--orInk)}
.fz-pxv-rows.sm{margin-top:6px}
.fz-pxv-rows.sm li{font-size:14px;padding:7px 0}
.fz-pxv-q{display:block;margin-top:12px}
.fz-pxv-acts{margin-top:16px}
.fz-pxv-acts .fz-btn{width:100%}
.fz-pxv-acts .fz-hint{text-align:center;margin-top:8px}
.fz-pxv-links{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:8px 20px;margin-top:12px}
.fz-pxv-links>.fz-link,.fz-pxv-links a.fz-link{display:inline-flex;align-items:center;gap:6px;min-height:24px}
.fz-pxv-plan{margin-top:14px;padding-top:4px;border-top:1px solid var(--line)}
.fz-pxv-pass.none{background:transparent;box-shadow:none;border:2px dashed #CDBFA6}
.fz-pxv-pass.none .fz-pxv-pb{background:transparent;color:var(--ink)}
.fz-pxv-pass.none .fz-pxv-pb h3{color:var(--ink)}
.fz-pxv-pass.none .fz-pxv-pb p{color:var(--ink3);opacity:1}
.fz-pxv-pass.none .fz-pxv-pk{color:var(--g);opacity:1}
.fz-pxv-pass.none .fz-pxv-pic{background:var(--g0);color:var(--g)}
.fz-pxv-pass.none .fz-pxv-perf{background:transparent}
.fz-pxv-pass.none .fz-pxv-perf i{display:none}
.fz-pxv-stamp{flex:none;color:#fff;transform:rotate(-13deg);opacity:.92;margin:-8px -6px -12px 0}
.fz-px-vfok{display:flex;flex-wrap:wrap;align-items:center;gap:10px 12px;background:var(--g0);border-radius:18px;padding:14px 16px;margin-bottom:18px}
.fz-px-vfok b{flex:1;min-width:200px;font-size:16px;color:var(--g2);outline:none}
.fz-px-tips{margin-top:14px;background:var(--bg2);border-radius:16px;padding:12px 14px}
.fz-px-tips>b{font-size:12.5px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--ink2)}
.fz-px-tips ul{list-style:none;margin:4px 0 0;padding:0}
.fz-px-tips li{display:flex;gap:8px;align-items:flex-start;font-size:14.5px;line-height:1.4;margin-top:6px;color:var(--ink3)}
.fz-px-tips li svg{flex:none;color:var(--g);margin-top:2px}
.fz-px-insby{font-size:13px;color:var(--ink2);text-align:right}
/* the card opened for the vet */
.fz-px.fz-px--focus{grid-template-columns:minmax(0,1fr)}
.fz-px--focus .fz-px-side{display:none}
.fz-px--focus .fz-px-main{max-width:780px;width:100%;margin:0 auto}
.fz-pxv-band{background:var(--g);color:#fff;border-radius:24px;padding:16px 22px 22px}
.fz-pxv-btop{display:flex;justify-content:space-between;align-items:center;gap:12px}
.fz-pxv-pill{font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;background:rgba(255,255,255,.16);border-radius:999px;padding:6px 12px}
.fz-pxv-x{border:0;background:rgba(255,255,255,.18);color:#fff;font:inherit;font-size:15px;font-weight:600;border-radius:999px;padding:8px 16px;min-height:40px;cursor:pointer}
@media (hover:hover){.fz-pxv-x:hover{background:rgba(255,255,255,.28)}}
.fz-pxv-band h2{font-size:44px;font-weight:700;letter-spacing:-.045em;line-height:1;margin-top:16px;color:#fff;outline:none}
.fz-pxv-band p{font-size:16px;color:rgba(255,255,255,.9);margin-top:8px;line-height:1.4}
.fz-pxv-vb{display:flex;flex-direction:column;gap:14px;margin-top:14px}
.fz-pxv-vb .fz-pt-note{margin-top:0}
.fz-pxv-cr{padding:12px 0;border-top:1px solid var(--line)}
.fz-pxv-cmp .fz-pt-kh+.fz-pxv-cr{border-top:0}
.fz-pxv-crk{display:block;font-size:13px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:var(--ink2)}
.fz-pxv-crg{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-top:8px}
.fz-pxv-crg>div{border-radius:14px;padding:9px 12px 10px;background:var(--bg2);min-width:0}
.fz-pxv-crg>div:last-child{background:var(--g0)}
.fz-pxv-crg small{display:block;font-size:12px;font-weight:600;color:var(--ink2)}
.fz-pxv-crg span,.fz-pxv-crg b{display:block;font-size:17px;line-height:1.3;margin-top:2px;overflow-wrap:anywhere}
.fz-pxv-crg span{font-weight:500}
.fz-pxv-crg b{font-weight:700}
.fz-pxv-crg em{display:block;font-style:normal;font-size:13px;color:var(--ink2);margin-top:2px}
.fz-pxv-ctl{font-size:14.5px;color:var(--ink3);margin-top:10px}
.fz-pxv-qs{list-style:none;counter-reset:q;margin:6px 0 0;padding:0}
.fz-pxv-qs li{counter-increment:q;display:flex;gap:10px;font-size:18px;font-weight:600;line-height:1.4;margin-top:8px}
.fz-pxv-qs li:before{content:counter(q);flex:none;width:24px;height:24px;border-radius:50%;background:var(--g);color:#fff;font-size:13px;font-weight:700;display:grid;place-items:center;margin-top:2px}
.fz-pxv-nl{list-style:none;margin:6px 0 0;padding:0}
.fz-pxv-nl li{display:flex;gap:12px;padding:9px 0;border-top:1px solid var(--line);font-size:16px;line-height:1.4}
.fz-pxv-nl li:first-child{border-top:0}
.fz-pxv-nl li>span{flex:none;width:116px;color:var(--ink2);font-size:14px;padding-top:2px}
.fz-pxv-nl li>div{min-width:0;overflow-wrap:anywhere}
.fz-pxv-dock{position:sticky;bottom:12px;margin-top:16px;z-index:3}
.fz-pxv-dock .fz-btn{width:100%;height:56px;font-size:17px;box-shadow:0 12px 26px -14px rgba(47,93,58,.75)}
/* the vet's form: same, new or changed against last time */
.fz-px-vf{max-width:780px}
.fz-px-vf h2{font-size:30px;font-weight:700;letter-spacing:-.03em;line-height:1.15;margin-top:2px;outline:none}
.fz-px-f2w{grid-template-columns:minmax(0,1.6fr) minmax(0,1fr)}
.fz-px-vfood{display:grid;grid-template-columns:minmax(0,1fr) auto minmax(0,1.6fr);gap:12px;align-items:end}
.fz-px-vmd{padding:4px 0 10px;border-bottom:1px solid var(--line);margin-bottom:12px}
.fz-px-vmd .fz-px-tmr{margin-top:12px}
.fz-px-vmrm{margin-top:10px}
.fz-px-f{display:block;margin-top:14px}
.fz-pxv-pre{display:flex;gap:8px;align-items:flex-start;font-size:14.5px;line-height:1.4;color:var(--g2);background:var(--g0);border-radius:12px;padding:10px 12px;margin-top:12px;font-weight:600}
.fz-pxv-pre svg{flex:none;margin-top:2px}
.fz-pxv-lt{display:flex;flex-wrap:wrap;align-items:center;gap:6px 8px}
.fz-pxv-tagw{display:inline-flex;flex-wrap:wrap;align-items:center;gap:6px 8px}
.fz-pxv-tag{font-size:12px;font-weight:700;letter-spacing:.02em;border-radius:999px;padding:3px 9px;line-height:1.2;background:var(--bg2);color:var(--ink2)}
.fz-pxv-tag.new,.fz-pxv-tag.chg{background:var(--or0);color:var(--orInk)}
.fz-pxv-was{font-size:12.5px;color:var(--ink2);font-weight:500}
.fz-pxv-cur{list-style:none;margin:0 0 12px;padding:0}
.fz-pxv-cur li{display:flex;gap:10px;align-items:baseline;font-size:14.5px;line-height:1.4;padding:5px 0;color:var(--ink3)}
.fz-pxv-cur li>span{flex:none;font-size:12px;font-weight:700;color:var(--g);background:var(--g0);border-radius:999px;padding:2px 8px}
.fz-pxv-vchip{margin-top:6px;width:fit-content}
/* on the overview */
.fz-pxv-soon{box-shadow:inset 0 0 0 2px var(--g),var(--sh)}
.fz-pxv-sb{display:flex;gap:14px;align-items:center}
.fz-pxv-sb .fz-pxv-pic{background:var(--g);color:#fff}
.fz-pxv-sb .fz-pxv-pk{color:var(--g);opacity:1}
.fz-pxv-sb h3{font-size:22px;font-weight:700;letter-spacing:-.025em;line-height:1.2;margin-top:2px}
.fz-pxv-sb p{font-size:14.5px;color:var(--ink3);margin-top:2px}
.fz-pxv-sg{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:16px;margin-top:14px;align-items:start}
.fz-pxv-sg .fz-px-tips{margin-top:0}
.fz-pxv-prog{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:0 28px;margin-top:6px}
.fz-pxv-pg{padding:11px 0;border-top:1px solid var(--line);min-width:0}
.fz-pxv-pgh{display:flex;justify-content:space-between;align-items:baseline;gap:10px;font-size:15px}
.fz-pxv-pgh span{color:var(--ink2)}
.fz-pxv-pgh b{font-weight:600;text-align:right;overflow-wrap:anywhere}
.fz-pxv-bar{height:8px;border-radius:99px;background:var(--bg2);overflow:hidden;margin:8px 0 4px}
.fz-pxv-bar i{display:block;height:100%;background:var(--g);border-radius:99px}
.fz-pxv-pg small{display:block;font-size:13px;color:var(--ink2);margin-top:2px}
.fz-pxv-warn{font-size:15px;font-weight:600;line-height:1.4;color:var(--orInk);background:var(--or0);border-radius:14px;padding:10px 14px;margin-top:12px}
.fz-pxv-nt{margin-top:10px}
.fz-pxv-ft{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:8px 16px;margin-top:12px}
.fz-pxv-ft .fz-hint{margin:0}
/* earlier visits, the paper and the clinic */
.fz-pxv-pl{list-style:none;margin:8px 0 0;padding:0}
.fz-pxv-pl li{display:flex;gap:12px;align-items:flex-start;padding:10px 0;border-top:1px solid var(--line)}
.fz-pxv-pl li:first-child{border-top:0}
.fz-pxv-pt{flex:1;min-width:0}
.fz-pxv-pt>b{display:block;font-size:15.5px}
.fz-pxv-pt>small{display:block;font-size:13.5px;color:var(--ink2);line-height:1.4;margin-top:2px}
.fz-pxv-pt>.fz-link{display:inline-flex;align-items:center;gap:5px;margin-top:6px;font-size:14px;min-height:24px}
.fz-pt-send.fz-pxv-send{display:block;margin-top:0;max-width:none;padding:22px 24px;border-radius:24px}
.fz-pxv-send .fz-pt-clin{margin-top:10px}
.fz-pxv-send .fz-lbl{display:block;margin-top:14px}
.fz-pxv-send .fz-pt-sendb{margin-top:14px}
.fz-pxv-per{display:flex;flex-wrap:wrap;align-items:center;gap:8px 12px;margin-top:14px}
.fz-pxv-per>span{font-size:14px;color:var(--ink2)}
.fz-pxv-tog{margin-top:14px}
.fz-pxv-sheet.is-off{position:absolute;left:-12000px;top:0;width:820px;height:0;overflow:hidden;visibility:hidden}
.fz-pt-sheet header.fz-pxv-shh{display:flex;justify-content:space-between;align-items:flex-end;gap:18px;border-bottom:0;background:var(--g);color:#fff;border-radius:16px;padding:18px 22px;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.fz-pxv-shh .fz-pt-kt{color:#fff;opacity:.88}
.fz-pt-sheet .fz-pxv-shh h2{color:#fff}
.fz-pt-sheet .fz-pxv-shh p{color:rgba(255,255,255,.9)}
.fz-pxv-shr{text-align:right;font-size:14px;display:flex;flex-direction:column;gap:2px;flex:none;max-width:44%}
.fz-pxv-shr b{font-size:18px}
.fz-pxv-shc{border:1.5px solid var(--g);border-radius:14px;padding:2px 16px 12px;margin-top:18px}
.fz-pt-sheet .fz-pxv-shc h3{color:var(--g);margin-top:14px}
.fz-pxv-ct{width:100%;border-collapse:collapse;font-size:14.5px;line-height:1.4}
.fz-pxv-ct th,.fz-pxv-ct td{text-align:left;vertical-align:top;padding:7px 10px 7px 0;border-bottom:1px solid var(--line)}
.fz-pxv-ct thead th{font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--ink2)}
.fz-pxv-ct tbody th{font-weight:600;color:var(--ink2);width:22%}
.fz-pxv-ct td:last-child{width:36%}
.fz-pt-sheet .fz-pxv-qs li{font-size:16px}
.fz-pxv-ln i{display:block;height:31px;border-bottom:1px solid #D8D3C9}
.fz-pxv-lines{margin-top:6px;padding-top:2px;border-top:2px dashed #D8D3C9}
.fz-pxv-rest{margin-top:22px;padding-top:2px;border-top:2px solid var(--ink)}
.fz-pt-sheet .fz-pxv-oth{font-size:14px;color:var(--ink3);margin-top:8px}
@media print{
.fz-pxv-sheet.is-off{position:static!important;left:auto!important;width:auto!important;height:auto!important;overflow:visible!important;visibility:visible!important}
.fz-pxv-shc,.fz-pxv-ct tr,.fz-pt-sheet .fz-pxv-qs li,.fz-pxv-lines{break-inside:avoid;page-break-inside:avoid}
.fz-pt-sheet .fz-pxv-shc h3{margin-top:10px}
.fz-pxv-ln i{height:28px}
.fz-pt-sheet .fz-pxv-qs li:before{background:none;color:var(--g);border:1.5px solid var(--g);box-sizing:border-box}
}
@container fz (max-width:1100px){
.fz-pxv-cols{grid-template-columns:minmax(0,1fr)}
}
@container fz (max-width:600px){
.fz-pxv-pb{padding:16px 16px 18px}
.fz-pxv-pb h3{font-size:24px}
.fz-pxv-body{padding:2px 16px 18px}
.fz-pxv-band{padding:14px 18px 20px}
.fz-pxv-band h2{font-size:36px}
.fz-pxv-crg span,.fz-pxv-crg b{font-size:16px}
.fz-pxv-qs li{font-size:17px}
.fz-pxv-nl li{flex-direction:column;gap:2px}
.fz-pxv-nl li>span{width:auto}
.fz-px-vfood{grid-template-columns:minmax(0,1fr) auto}
.fz-px-vfood .fz-lbl:last-child{grid-column:1/-1}
.fz-px-f2w{grid-template-columns:minmax(0,1fr)}
.fz-pxv-sg{grid-template-columns:minmax(0,1fr)}
.fz-pt-sheet header.fz-pxv-shh{flex-direction:column;align-items:flex-start}
.fz-pxv-shr{text-align:left;max-width:none}
.fz-pxv-ct{font-size:13.5px}
.fz-pxv-rows li span{max-width:50%}
}
@container fz (max-width:600px){.fz-pt-send.fz-pxv-send{padding:18px 16px;border-radius:22px}}
.fz-pxv-caln{flex-basis:100%;text-align:center;margin:0}
.fz-pxv-pl .fz-px-rm,.fz-pxv-pl .fz-px-rmq{margin-top:8px}
`

/* -------------------------------------------------------------- component */

interface Props {
    style?: React.CSSProperties
    language?: "en" | "hr"
    startPage?: "home" | "recipes" | "order"
    backLink?: string
    backLabel?: string
    site?: "concept" | "live"
}

/**
 * Freshy's concept website (prototype): home, recipes, recipe pages and ordering, EN/HR.
 *
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight auto
 * @framerIntrinsicWidth 1200
 * @framerIntrinsicHeight 4000
 */
export default function FreshysSite(props: Props) {
    const { style, language = "en", startPage = "home", backLink = "/", backLabel = "Tonči Hrgović · Portfolio", site = "concept" } = props
    const LIVE = site === "live"
    /* accounts (Firebase) only on freshysfoods.com: the portfolio copy never signs anyone up */
    const ACCT = LIVE
    const isCanvas = RenderTarget.current() === RenderTarget.canvas
    const [lang, setLangState] = useState<Lang>(language === "hr" ? "hr" : "en")
    const [page, setPage] = useState<Page>({ p: startPage })
    const [menu, setMenu] = useState(false)
    const [dog, setDog] = useState<Dog>({ name: "", kg: 20, age: 2, neut: true, act: 1, no: [] })
    const [kcTxt, setKcTxt] = useState("120")
    const [ord, setOrd] = useState<Ord>(ORD0)
    const [q, setQ] = useState("")
    const [cat, setCat] = useState("all")
    const [batch, setBatch] = useState(1)
    const [feed, setFeedS] = useState(0) // home-cooked food is 0 all of the day's food, 1 half, 2 ten per cent
    const [cook, setCookS] = useState(1) // cooking ahead for this many days (1–30)
    const [planId, setPlanIdS] = useState<number | null>(null) // the dish picked in the week's plan
    const [cookOth, setCookOth] = useState(false)
    const [cookIn, setCookIn] = useState<string | null>(null) // the days field while it is being typed in
    const [bOther, setBOther] = useState(false) // own recipes: "More" than a double batch
    const [vn, setVnS] = useState<{ d: number; a: string; t: number } | null>(null) // what the vet said about the bland meal
    const [vnEd, setVnEd] = useState<{ d: number; a: string } | null>(null)
    const [vnRm, setVnRm] = useState(false)
    const [ticks, setTicks] = useState<Record<string, boolean>>({})
    const [origEn, setOrigEn] = useState(false)
    const [days, setDays] = useState<Date[] | null>(null)
    const [sec, setSec] = useState<string | null>(null)
    const [catalog, setCatalog] = useState<CRec[] | null>(catCache)
    const [catErr, setCatErr] = useState(false)
    const [catTry, setCatTry] = useState(0)
    const [shown, setShown] = useState(24)
    const [have, setHave] = useState<string[]>([])
    const [noIng, setNoIng] = useState<string[]>([])
    const [imode, setImode] = useState(0)
    const [prep, setPrep] = useState("")
    const [q30, setQ30] = useState(false)
    const [few, setFew] = useState(false)
    const [shopOk, setShopOk] = useState(false)
    const [bp, setBp] = useState<string | null>("piletina")
    const [bc, setBc] = useState<string | null>("riza")
    const [bv, setBv] = useState<string[]>(["mrkva"])
    const [bdays, setBdays] = useState(3)
    const [bOth, setBOth] = useState(false)
    const [bmode, setBmode] = useState(0)
    const [lst, setLst] = useState<LState>({ items: [], done: {} })
    const [copied, setCopied] = useState(false)
    const [clr, setClr] = useState(false)
    // dog profile, kept in this browser only
    const [ps, setPs] = useState<PStore | null>(null)
    const [pd, setPd] = useState<Pet>(PD0)
    const [pstep, setPstep] = useState(0)
    const [pmode, setPmode] = useState<"wiz" | "res" | "edit">("wiz")
    const [breeds, setBreeds] = useState<Breed[] | null>(breedCache)
    const [brErr, setBrErr] = useState(false)
    const [bq, setBq] = useState<string[]>(["", ""])
    const [pdel, setPdel] = useState(false)
    const [noBorn, setNoBorn] = useState(false)
    const [newPet, setNewPet] = useState(true)
    const [pv, setPv] = useState<PV>("dash")
    const [ef, setEf] = useState<EForm | null>(null)
    const [efDel, setEfDel] = useState(false)
    const [efBusy, setEfBusy] = useState(false)
    const [efMsg, setEfMsg] = useState("")
    const [lf, setLf] = useState(0)
    const [lOpen, setLOpen] = useState<string[]>([])
    const [imp, setImp] = useState<{ s?: PStore; ph?: Record<string, string>; at?: string; err?: string; ok?: string } | null>(null)
    const [saveErr, setSaveErr] = useState(false)
    const [expBusy, setExpBusy] = useState(false)
    const [lb, setLb] = useState<string | null>(null)
    const [vp, setVp] = useState(1)
    const [vmsg, setVmsg] = useState("")
    const [vpk, setVpk] = useState<VPick | null>(null)
    const [vrows, setVrows] = useState<ClinicRow[] | null>(null)
    const [vload, setVload] = useState("")
    const [hi, setHi] = useState("")
    const [plusWant, setPlusWant] = useState(false)
    const [mf, setMf] = useState<{ tab: number; src: string; q: string; tm: string; ti: string; kc: string; qs: string; more?: boolean }>({ tab: 0, src: "", q: "", tm: "", ti: "", kc: "", qs: "" })
    const [ff, setFf] = useState<{ n: string; t: number; kc: string } | null>(null)
    const [mday, setMday] = useState("")
    const [wf, setWf] = useState<{ d: string; km: string; min: string }>({ d: "", km: "", min: "" })
    const [mdf, setMdf] = useState<MdForm | null>(null)
    const [dyf, setDyf] = useState<{ ti: string; d: string; y: boolean }>({ ti: "", d: "", y: true })
    const [rmId, setRmId] = useState("")
    const [fmsg, setFmsg] = useState("")
    const [vf, setVf] = useState<VForm | null>(null)
    const [vfDone, setVfDone] = useState(false)
    /* vet visits: the card opened for the vet, the appointment form, the paper preview and an earlier visit that is open */
    const [vv, setVv] = useState(false)
    const [vzf, setVzf] = useState<{ d: string; why: string } | null>(null)
    const [ppv, setPpv] = useState(false)
    const [vpo, setVpo] = useState("")
    const [dEd, setDEd] = useState(false) // the dog's age, neutering and activity, open under its one-line summary
    const prof: Pet | null = ps ? ps.pets.find((x) => x.id === ps.cur) || ps.pets[0] || null : null
    useEffect(() => {
        if (isCanvas || typeof window === "undefined") return
        const now = new Date()
        const s = readStore(now)
        if (s) {
            setPs(s)
            setPmode("res")
            setNewPet(false)
            writeStore(s)
            const c = s.pets.find((x) => x.id === s.cur)
            const fp = c && c.sp === 0 ? c : s.pets.find((x) => x.sp === 0)
            if (fp) {
                setDog(dogOf(fp, now))
                setFeedS(numIn(fp.mix, 0, 2, 0))
            }
        }
    }, [])
    useEffect(() => {
        if (breeds || page.p !== "dog") return
        let live = true
        setBrErr(false)
        loadBreeds()
            .then((d) => live && setBreeds(d))
            .catch(() => live && setBrErr(true))
        return () => {
            live = false
        }
    }, [page.p, breeds])
    const isCat = page.p === "recipe" && !!page.id && page.id.startsWith("mdr-")
    useEffect(() => {
        if (catalog || (page.p !== "recipes" && page.p !== "build" && page.p !== "list" && page.p !== "plan" && !isCat && !(page.p === "dog" && pv === "meal"))) return
        let live = true
        setCatErr(false)
        loadCatalog()
            .then((d) => live && setCatalog(d))
            .catch(() => live && setCatErr(true))
        return () => {
            live = false
        }
    }, [page.p, isCat, catalog, catTry, pv])
    useEffect(() => setShown(24), [q, cat, have, noIng, prep, q30, few, shopOk])
    const cIdx = useMemo(() => (catalog ? catalog.map((r) => norm(r.t + " " + r.th + " " + r.i.join(" ") + " " + r.ih.join(" "))) : []), [catalog])
    const cMeta = useMemo(() => {
        const m = new Map<number, RMeta>()
        if (catalog) catalog.forEach((r) => m.set(r.id, metaOf(r.i, r.p, r.g.includes("frozen"), r.al, r.m)))
        return m
    }, [catalog])
    const rootRef = useRef<HTMLDivElement>(null)
    const recRef = useRef<HTMLElement>(null)
    const L = (s: LS) => s[lang]

    useEffect(() => setLangState(language === "hr" ? "hr" : "en"), [language])
    useEffect(() => setPage({ p: startPage }), [startPage])
    useEffect(() => {
        setDays(nextDays(new Date()))
        if (isCanvas || typeof window === "undefined") return
        try {
            const s = window.localStorage.getItem("fz-lang")
            if (s === "en" || s === "hr") setLangState(s)
            /* ?lang=en from a link (the portfolio): that language, remembered like the switch, and the parameter leaves the address */
            const ql = new URLSearchParams(window.location.search).get("lang")
            if (ql === "en" || ql === "hr") {
                setLangState(ql)
                const u = new URL(window.location.href)
                u.searchParams.delete("lang")
                window.history.replaceState(window.history.state, "", u.pathname + u.search + u.hash)
                window.localStorage.setItem("fz-lang", ql)
            }
            const fd = window.localStorage.getItem("fz-feed")
            if (fd === "1" || fd === "2") setFeedS(+fd)
            const ck = parseInt(window.localStorage.getItem("fz-cook") || "0", 10)
            if (ck >= 1) setCookS(Math.min(COOK_MAX, ck))
            const pl = parseInt(window.localStorage.getItem("fz-plan") || "0", 10)
            if (DAYC[pl]) setPlanIdS(pl)
            const vr0 = JSON.parse(window.localStorage.getItem("fz-vetnote") || "null")
            if (vr0 && Number.isInteger(vr0.d) && vr0.d >= 1 && vr0.d <= 14 && typeof vr0.a === "string" && typeof vr0.t === "number") setVnS({ d: vr0.d, a: vr0.a.slice(0, 60), t: vr0.t })
        } catch (e) {}
        setLst(readList())
        const read = () => {
            const pg = parseHash(window.location.hash)
            if (pg) setPage(pg)
        }
        read()
        window.addEventListener("hashchange", read)
        return () => window.removeEventListener("hashchange", read)
    }, [])
    useEffect(() => {
        setBatch(1)
        setBOther(false)
        setVnEd(null)
        setVnRm(false)
        setTicks({})
    }, [page.p, page.id])
    useEffect(() => {
        if (!sec || page.p !== "home" || typeof document === "undefined") return
        const el = document.getElementById("fz-" + sec)
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" })
        setSec(null)
    }, [sec, page])

    const setFeed = (i: number, local?: boolean) => {
        const v = i === 1 || i === 2 ? i : 0
        setFeedS(v)
        try {
            window.localStorage.setItem("fz-feed", String(v))
        } catch (e) {}
        // the dog the amounts are for has a profile: keep the choice there too
        if (!local && ps && feedPet && feedPet.mix !== v) commit({ ...ps, pets: ps.pets.map((x) => (x.id === feedPet.id ? { ...x, mix: v } : x)) })
    }
    const setCook = (n: number) => {
        const v = Math.min(COOK_MAX, Math.max(1, Math.round(n)))
        setCookS(v)
        try {
            window.localStorage.setItem("fz-cook", String(v))
        } catch (e) {}
    }
    const setPlanId = (id: number) => {
        setPlanIdS(id)
        try {
            window.localStorage.setItem("fz-plan", String(id))
        } catch (e) {}
    }
    const setVn = (v: { d: number; a: string; t: number } | null) => {
        setVnS(v)
        try {
            if (v) window.localStorage.setItem("fz-vetnote", JSON.stringify(v))
            else window.localStorage.removeItem("fz-vetnote")
        } catch (e) {}
    }
    const setLang = (l: Lang) => {
        setLangState(l)
        try {
            window.localStorage.setItem("fz-lang", l)
        } catch (e) {}
    }
    const go = (pg: Page) => {
        setPage(pg)
        setMenu(false)
        setDEd(false)
        if (isCanvas || typeof window === "undefined") return
        try {
            window.history.replaceState(window.history.state, "", window.location.pathname + window.location.search + toHash(pg))
        } catch (e) {}
        const el = rootRef.current
        if (el) window.scrollTo({ top: Math.max(0, el.getBoundingClientRect().top + window.scrollY), behavior: "instant" as ScrollBehavior })
    }
    const goSec = (id: string) => {
        setMenu(false)
        if (page.p !== "home") go({ p: "home" })
        setSec(id)
    }
    const orderPouch = (pid?: string) => {
        setOrd((o) => ({ ...o, step: 1, done: false, sel: pid ? Object.fromEntries(POUCHES.map((p) => [p.id, p.id === pid])) : o.sel }))
        go({ p: "order" })
    }

    // shopping list, kept in this browser only
    const saveList = (s: LState) => {
        setLst(s)
        writeList(s)
    }
    const lCount = lst.items.length
    const listR = (rid: string) => lst.items.find((it): it is LItemR => it.t === "r" && it.rid === rid)
    /* a recipe on the list keeps the multiplier it was added with (cooking ahead); a new multiplier replaces it and clears that recipe's ticks */
    const addR = (rid: string, m = 1) => {
        const cur = listR(rid)
        const it: LItemR = m > 1 ? { id: "r" + rid, t: "r", rid, m } : { id: "r" + rid, t: "r", rid }
        if (!cur) saveList({ items: [...lst.items, it], done: lst.done })
        else if ((cur.m || 1) !== m) {
            const pre = "r:" + rid + ":"
            saveList({ items: lst.items.map((x) => (x === cur ? it : x)), done: Object.fromEntries(Object.entries(lst.done).filter(([k]) => !k.startsWith(pre))) })
        }
    }
    /* list state of a recipe for this multiplier: not on the list, on it with these amounts, or on it with other amounts */
    const listSt = (rid: string, m = 1): "add" | "on" | "upd" => {
        const cur = listR(rid)
        return !cur ? "add" : (cur.m || 1) === m ? "on" : "upd"
    }
    const listBtn = (rid: string, m = 1) => {
        const st = listSt(rid, m)
        const on = st === "on"
        return (
            <button type="button" className={"fz-ch pr fz-noprint " + (on ? "fz-ch--on" : "fz-ch--add")} onClick={() => (on ? go({ p: "list" }) : addR(rid, m))}>
                <Ico d={on ? I.check : I.cart} s={16} w={on ? 2.6 : 2} />
                {L(on ? T.onList : st === "upd" ? T.updList : T.addList)}
            </button>
        )
    }
    // how a recipe is made: frozen, baked or neither
    const methodOf = (m?: RMeta) => (!m ? "" : m.frozen ? "frozen" : m.oven ? "oven" : "nobake")
    const methodTag = (m?: RMeta) => {
        const k = methodOf(m)
        return k ? (
            <span className="fz-tag fz-tag--m">
                <Em n={PREP_EM[k]} />
                {L(T.prep[k])}
            </span>
        ) : null
    }
    const methodChip = (m?: RMeta) => {
        const k = methodOf(m)
        return k ? (
            <span className="fz-ch">
                <Em n={PREP_EM[k]} />
                {L(T.prep[k])}
            </span>
        ) : null
    }
    // "you have: chicken" on cards, while "I have it" ingredients are picked
    const haveIn = (m?: RMeta) => {
        const ks = m ? have.filter((k) => m.has.has(k)) : []
        return ks.length ? (
            <div className="fz-have">
                {ks.map((k) => (
                    <span key={k} className="fz-hv">
                        <Em n={ING[k].em} />
                        {L(T.hvTag)} {L(ING[k].n).toLowerCase()}
                    </span>
                ))}
            </div>
        ) : null
    }
    const ingTile = (k: string, s: "" | "have" | "no", on: () => void, pressed: boolean, dis = false, title?: string) => (
        <button key={k} type="button" className="fz-it" data-s={s || undefined} aria-pressed={pressed} disabled={dis} title={title} onClick={on}>
            <span className="c">
                <Em n={ING[k].em} />
                {s && (
                    <span className="b" aria-hidden="true">
                        {s === "have" ? "✓" : "–"}
                    </span>
                )}
            </span>
            <span className="l">{L(ING[k].n)}</span>
            {s && <span className="fz-vh">, {L(s === "have" ? T.stHave : T.stNo)}</span>}
        </button>
    )

    // dog maths (AAHA 2021, Box 1)
    const rer = rerOf(dog.kg)
    const fk = facKey(dog)
    const [kLo, kHi] = kcalRange(dog)
    const kc100 = parseFloat(kcTxt.replace(",", "."))
    const kcOk = kc100 >= 20 && kc100 <= 900
    const kcOdd = kcOk && (kc100 < 70 || kc100 > 450)
    const foodI = FOODS.indexOf(kc100)
    const gLo = kcOk ? kLo / (kc100 / 100) : 0,
        gHi = kcOk ? kHi / (kc100 / 100) : 0
    const fullG = r10((kLo + kHi) / 2 / FRESH_KCAL_G)
    const ageW = [X("puppy", "štene"), X("puppy", "štene"), X("adult", "odrasli")][dog.age]
    const kgMax = kgMaxOf(dog.age)
    const setKg = (v: number) => setDog((d) => ({ ...d, lose: false, kg: Math.min(kgMaxOf(d.age), Math.max(KG_MIN, Math.round(v * 2) / 2)) }))
    const setAge = (i: number) => setDog((d) => ({ ...d, lose: false, age: i, kg: Math.min(d.kg, kgMaxOf(i)) }))
    const fx = (a: number, b: number) => (a === b ? nf(a, lang, 1) : nf(a, lang, 1) + "–" + nf(b, lang, 1))
    const kgTxt = nf(dog.kg, lang, dog.kg % 1 ? 1 : 0)

    /* ---------- shared pieces ---------- */

    const weightSlider = (id: string, cls = "fz-range") => (
        <input
            id={id}
            className={cls}
            type="range"
            min={KG_MIN}
            max={kgMax}
            step={0.5}
            value={dog.kg}
            aria-label={L(T.weight)}
            aria-valuetext={kgTxt + " kg"}
            style={{ ["--p" as any]: ((dog.kg - KG_MIN) / (kgMax - KG_MIN)) * 100 + "%" } as React.CSSProperties}
            onChange={(e) => setKg(+e.target.value)}
        />
    )
    const seg = (opts: LS[], val: number, set: (i: number) => void, label: LS) => (
        <div className="fz-seg" role="group" aria-label={L(label)}>
            {opts.map((o, i) => (
                <button key={i} type="button" aria-pressed={val === i} onClick={() => set(i)}>
                    {L(o)}
                </button>
            ))}
        </div>
    )
    const kindTag = (r: Rec) =>
        r.kind === "treat" ? <span className="fz-tag fz-tag--p">{L(T.kTreat)}</span> : r.kind === "bland" ? <span className="fz-tag fz-tag--b">{L(T.kBland)}</span> : <span className="fz-tag fz-tag--t">{L(recMealOk(r) ? T.kMeal : T.kTopper)}</span>
    const card = (r: Rec, i: number) => (
        <article key={r.id} className="fz-rc" style={{ ["--r" as any]: ROT[i % ROT.length] + "deg" } as React.CSSProperties}>
            <button className="im" type="button" tabIndex={-1} aria-hidden="true" onClick={() => go({ p: "recipe", id: r.id })}>
                <img src={r.img} alt="" loading="lazy" decoding="async" style={{ objectPosition: r.pos || "50% 50%" }} />
            </button>
            <div className="b">
                <h3>
                    <button type="button" onClick={() => go({ p: "recipe", id: r.id })}>
                        {L(r.t)}
                    </button>
                </h3>
                <div className="m">
                    {timeTxt(r, lang)} · {ingCount(r, lang)}
                </div>
                {r.cw && <div className="w">⚠ {L(r.cw)}</div>}
                {haveIn(RMETA[r.id])}
                <div className="row">
                    <span className="tags">
                        {kindTag(r)}
                        {methodTag(RMETA[r.id])}
                        {r.tex && r.tex !== "frozen" && <span className="fz-tag fz-tag--x">{L(T.tex[r.tex])}</span>}
                    </span>
                    <span className="bb">
                        <button type="button" className="fz-btn fz-btn--sm fz-btn--g" onClick={() => go({ p: "recipe", id: r.id })}>
                            {L(T.cook)}
                        </button>
                        {SHOP && r.pouch && (
                            <button type="button" className="fz-btn fz-btn--sm fz-btn--p" onClick={() => orderPouch(r.pouch)}>
                                {L(T.orderBtn)}
                            </button>
                        )}
                    </span>
                </div>
            </div>
        </article>
    )

    /* ---------- dog profile ---------- */

    type PSet = (patch: Partial<Pet>) => void
    const NOW = new Date()
    const kgN = (x: number) => nf(x, lang, x % 1 ? 1 : 0)
    const pfNm = (p: Prof) => p.name.trim()
    const bById = (n: number) => (breeds && n ? breeds.find((b) => b.n === n) : undefined)
    const bName = (b: Breed) => (lang === "hr" ? b.hr : b.en)
    const wTxt = (r: [number | null, number | null]) => {
        const [lo, hi] = r
        if (lo !== null && hi !== null) return lo === hi ? L(T.pfAbout) + " " + kgN(lo) + " kg" : kgN(lo) + "–" + kgN(hi) + " kg"
        if (lo !== null) return L(T.pfAtLeast) + " " + kgN(lo) + " kg"
        return L(T.pfUpTo) + " " + kgN(hi as number) + " kg"
    }
    /* expected adult weight for this dog's sex: breed standard, the two breeds of a mix, or the size the owner picked */
    const adultRange = (p: Prof): { r: [number | null, number | null]; src: "std" | "mix" | "size" } | null => {
        if (p.bk === 0) {
            const r = bW(bById(p.b1), p.sex)
            return r ? { r, src: "std" } : null
        }
        if (p.bk === 1 && p.b1 && p.b2) {
            const a = bW(bById(p.b1), p.sex),
                b = bW(bById(p.b2), p.sex)
            if (a && b) {
                const los = [a[0], b[0]].filter((x): x is number => x !== null)
                const hi = a[1] === null || b[1] === null ? null : Math.max(a[1], b[1])
                const lo = los.length ? Math.min(...los) : null
                if (lo !== null || hi !== null) return { r: [lo, hi], src: "mix" }
            }
        }
        if (p.bk !== 0 && p.size >= 0) return { r: SIZE_W[p.size], src: "size" }
        return null
    }
    const relTxt = (p: Prof, r: [number | null, number | null]) => {
        const [lo, hi] = r
        const one = lo !== null && lo === hi
        const rel = lo !== null && p.kg < lo * (one ? 0.9 : 1) ? T.pfBelow : hi !== null && p.kg > hi * (one ? 1.1 : 1) ? T.pfAbove : T.pfIn
        return (pfNm(p) || L(T.pfTheDog)) + " " + L(rel) + (rel !== T.pfIn && p.body === 1 ? L(T.pfShapeWins) : "") + "."
    }
    const pfQ = (id: string, p: Pet) => {
        const n = pfNm(p),
            f = p.sex === 1,
            en = lang === "en",
            yo = ["your dog", "your cat", "your pet"][p.sp] || "your pet"
        switch (id) {
            case "sp":
                return L(T.ptSpQ)
            case "name":
                return en ? `What's ${yo} called?` : ["Kako se zove tvoj pas?", "Kako se zove tvoja mačka?", "Kako se zove tvoj ljubimac?"][p.sp]
            case "pic":
                return en ? (n ? `A photo of ${n}` : "A photo for the profile") : n ? `Slika za profil: ${n}` : "Slika za profil"
            case "tr":
                return en ? `What is ${n || yo} like?` : `${f ? "Kakva" : "Kakav"} je ${n || (["tvoj pas", "tvoja mačka", "tvoj ljubimac"][p.sp] || "")}?`
            case "since":
                return en ? `Since when has ${n || yo} been with you?` : n ? `Od kad je ${n} s tobom?` : "Od kad je s tobom?"
            case "neut":
                return en ? (n ? `Is ${n} ${f ? "spayed" : "neutered"}?` : `Is ${yo} ${f ? "spayed" : "neutered"}?`) : `Je li ${n ? n + " " : ""}${f ? "sterilizirana" : "kastriran"}?`
            case "born":
                return en ? `When was ${n || yo} born?` : `Kad je ${n ? n + " " : ""}${f ? "rođena" : "rođen"}?`
            case "breed":
                return en ? `What breed is ${n || yo}?` : n ? `Koje je pasmine ${n}?` : "Koje je pasmine?"
            case "kg":
                return en ? `How much does ${n || yo} weigh?` : n ? `Koliko ${n} teži?` : "Koliko teži?"
            case "body":
                return en ? `What does ${n || yo} look like from above?` : n ? `Kako ${n} izgleda odozgo?` : "Kako izgleda odozgo?"
            case "act":
                return en ? `How active is ${n || yo}?` : n ? `Koliko se ${n} kreće?` : "Koliko se kreće?"
            case "health":
                return en ? `Is ${n || yo} healthy?` : `Je li ${n ? n + " " : ""}${f ? "zdrava" : "zdrav"}?`
            case "food":
                return en ? `What does ${n || yo} eat now?` : n ? `Što ${n} jede sada?` : "Što jede sada?"
            case "treats":
                return en ? `Does ${n || yo} get treats?` : n ? `Dobiva li ${n} poslastice?` : "Dobiva li poslastice?"
            default:
                return en ? `Anything ${n || yo} can't eat?` : n ? `Što ${n} ne smije jesti?` : "Što ne smije jesti?"
        }
    }
    useEffect(() => {
        if (page.p !== "dog" || pmode !== "wiz" || typeof document === "undefined") return
        const el = document.getElementById("fz-pf-q")
        if (el && pstep > 0) el.focus({ preventScroll: true } as FocusOptions)
    }, [pstep])

    const bodySvg = (i: number, cat = false, w = 46) => {
        const P = [
            "M27 17C33 17 35 22 34 29C33 35 30 38 30 42C30 47 33 50 33 55C33 60 30 63 27 63C24 63 21 60 21 55C21 50 24 47 24 42C24 38 21 35 20 29C19 22 21 17 27 17Z",
            "M27 17C35 17 38 22 37 30C36 36 33 38 33 42C33 47 37 50 37 55C37 60 32 63 27 63C22 63 17 60 17 55C17 50 21 47 21 42C21 38 18 36 17 30C16 22 19 17 27 17Z",
            "M27 17C37 17 40 23 40 31C40 38 38 41 38 44C38 49 41 51 41 56C41 61 35 64 27 64C19 64 13 61 13 56C13 51 16 49 16 44C16 41 14 38 14 31C14 23 17 17 27 17Z",
            "M27 17C39 17 44 24 44 33C44 42 46 48 45 55C44 61 37 65 27 65C17 65 10 61 9 55C8 48 10 42 10 33C10 24 15 17 27 17Z",
        ]
        const F = ["#EFE5D3", "#D7E6D7", "#F7DFC6", "#F4CDB0"][i]
        return (
            <svg width={w} height={Math.round((w * 74) / 54)} viewBox="0 0 54 74" aria-hidden="true" focusable="false">
                {cat ? (
                    <>
                        <path d="M21 9.5L20.4 1.8L25.8 5.4Z" fill={F} stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                        <path d="M33 9.5L33.6 1.8L28.2 5.4Z" fill={F} stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                    </>
                ) : (
                    <>
                        <ellipse cx="20" cy="12.5" rx="3.2" ry="6" transform="rotate(18 20 12.5)" fill={F} stroke="currentColor" strokeWidth="2" />
                        <ellipse cx="34" cy="12.5" rx="3.2" ry="6" transform="rotate(-18 34 12.5)" fill={F} stroke="currentColor" strokeWidth="2" />
                    </>
                )}
                <ellipse cx="27" cy="10.5" rx={cat ? 7 : 6.5} ry={cat ? 6.8 : 7.5} fill={F} stroke="currentColor" strokeWidth="2" />
                <path d={cat ? "M27 62c0 5 3 8 8 10" : "M27 63v9"} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
                <path d={P[i]} fill={F} stroke="currentColor" strokeWidth="2" />
                {i === 0 && <path d="M22.5 26h9M22 30h10M23 34h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />}
            </svg>
        )
    }

    /* ---------- fields (shared by the steps and the ID card) ---------- */

    const fNameIn = (v: Prof, set: PSet, id: string) => (
        <input id={id} className="fz-inp" value={v.name} maxLength={18} placeholder={L(T.namePh)} autoComplete="off" onChange={(e) => set({ name: e.target.value })} aria-label={L(T.pfName)} />
    )
    const fSex = (v: Pet, set: PSet) => seg(v.sp === 1 ? T.ptCatSex : T.pfSexes, v.sex, (i) => set({ sex: i, health: i === 0 && v.health === 2 ? 0 : v.health }), T.ptSexQ[v.sp])
    const fNeut = (v: Pet, set: PSet) => (
        <>
            {seg(T.yesNo, v.neut ? 0 : 1, (i) => set({ neut: i === 0, health: i === 0 && v.health === 2 ? 0 : v.health }), T.pfNeutK[v.sex])}
            {v.sp === 0 && <p className="fz-hint">{L(T.pfNeutHint)}</p>}
        </>
    )
    const fSp = (v: Pet, set: PSet, id: string) => (
        <>
            <div className="fz-pf-opts" role="radiogroup" aria-label={L(T.ptSpK)}>
                {(v.sp === 2 ? [0, 1, 2] : [0, 1]).map((i) => (
                    <button
                        key={i}
                        type="button"
                        role="radio"
                        aria-checked={v.sp === i}
                        className="fz-pf-opt"
                        onClick={() => set({ sp: i, ...(newPet && v.sp !== i ? { kg: [20, 4, 1][i], body: 1, bk: 0, b1: 0, b2: 0, size: -1, ideal: 0 } : {}) })}
                    >
                        <span className={"fz-pt-spi sp" + i}>{ptIco(["dog", "cat", "other"][i], 24)}</span>
                        <span>
                            <b>{L(T.ptSps[i])}</b>
                            <small>{L(T.ptSpD[i])}</small>
                        </span>
                    </button>
                ))}
            </div>
            {v.sp === 2 && (
                <>
                    <div className="fz-gap2" />
                    <label className="fz-lbl" htmlFor={id}>
                        {L(T.ptKind)}
                    </label>
                    <input id={id} className="fz-inp" value={v.kind} maxLength={30} placeholder={L(T.ptKindPh)} autoComplete="off" onChange={(e) => set({ kind: e.target.value })} />
                </>
            )}
        </>
    )
    const yNow = NOW.getFullYear()
    const fBorn = (v: Prof, set: PSet, id: string) =>
        !v.by && noBorn ? (
            <>
                {seg(T.ages, v.ageG, (i) => set({ ageG: i }), T.age)}
                <p className="fz-hint">
                    <button type="button" className="fz-link" onClick={() => (setNoBorn(false), set({ by: yNow - 3, bm: 0 }))}>
                        {L(T.pfKnowBorn)}
                    </button>
                </p>
            </>
        ) : (
            <>
                <div className="fz-pf-born">
                    <label className="fz-lbl" htmlFor={id + "m"}>
                        {L(T.pfMonth)}
                        <select id={id + "m"} className="fz-inp" value={v.bm} onChange={(e) => set({ bm: +e.target.value })}>
                            <option value={0}>–</option>
                            {T.pfMonths.map((m, i) => (
                                <option key={i} value={i + 1}>
                                    {L(m)}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label className="fz-lbl" htmlFor={id + "y"}>
                        {L(T.pfYear)}
                        <select id={id + "y"} className="fz-inp" value={v.by} onChange={(e) => set({ by: +e.target.value })}>
                            <option value={0}>–</option>
                            {Array.from({ length: 21 }, (_, k) => yNow - k).map((y) => (
                                <option key={y} value={y}>
                                    {y}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>
                <p className="fz-hint">
                    {L(T.pfRough)}{" "}
                    <button type="button" className="fz-link" onClick={() => (setNoBorn(true), set({ by: 0, bm: 0 }))}>
                        {L(T.pfNoBorn)}
                    </button>
                </p>
            </>
        )
    const stdLine = (b: Breed) => {
        if (!b.w) return L(T.pfStdNoW)
        const m = bW(b, 0),
            f = bW(b, 1)
        const parts = [m ? L(T.pfMales) + " " + wTxt(m) : "", f ? L(T.pfFemales) + " " + wTxt(f) : ""].filter(Boolean)
        return L(T.pfStd) + ": " + parts.join(", ") + "."
    }
    const breedPick = (slot: number, v: Prof, set: PSet, id: string) => {
        const cur = slot === 0 ? v.b1 : v.b2
        const b = bById(cur)
        if (cur && b)
            return (
                <div className="fz-pf-pick">
                    <div className="fz-pf-sel">
                        <b>{bName(b)}</b>
                        <button type="button" aria-label={L(T.close) + ": " + bName(b)} onClick={() => set(slot === 0 ? { b1: 0 } : { b2: 0 })}>
                            ×
                        </button>
                    </div>
                    {v.bk === 0 && <p className="fz-hint">{stdLine(b)}</p>}
                </div>
            )
        const q = bq[slot]
        const nq = norm(q.trim())
        const hits =
            breeds && nq.length >= 2
                ? breeds
                      .map((x) => {
                          const all = norm(x.hr + " | " + x.en + " | " + (x.o || "") + " | " + (x.a || ""))
                          const k = all.indexOf(nq)
                          return { x, k: k < 0 ? -1 : norm(bName(x)).startsWith(nq) ? 0 : 1 }
                      })
                      .filter((h) => h.k >= 0)
                      .sort((a, c) => a.k - c.k || bName(a.x).localeCompare(bName(c.x)))
                      .slice(0, 8)
                : []
        const lbl = L(slot === 0 ? T.pfFind : T.pfFind2)
        return (
            <div className="fz-pf-pick">
                <input id={id} className="fz-inp" value={q} placeholder={lbl} aria-label={lbl} autoComplete="off" onChange={(e) => setBq(slot === 0 ? [e.target.value, bq[1]] : [bq[0], e.target.value])} />
                {!breeds && !brErr && <p className="fz-hint">{L(T.pfLoading)}</p>}
                {brErr && <p className="fz-hint fz-hint--w">{L(T.pfLoadErr)}</p>}
                {hits.length > 0 && (
                    <div className="fz-pf-hits">
                        {hits.map(({ x }) => (
                            <button
                                key={x.n}
                                type="button"
                                onClick={() => {
                                    set(slot === 0 ? { b1: x.n } : { b2: x.n })
                                    setBq(slot === 0 ? ["", bq[1]] : [bq[0], ""])
                                }}
                            >
                                {bName(x)}
                                {lang === "hr" && x.en.toLowerCase() !== x.hr.toLowerCase() ? <small>{x.en}</small> : lang === "en" && x.o ? <small>{x.o}</small> : null}
                            </button>
                        ))}
                    </div>
                )}
                {breeds && nq.length >= 2 && hits.length === 0 && <p className="fz-hint">{L(T.pfNoHit[v.bk === 1 ? 1 : 0])}</p>}
            </div>
        )
    }
    const fBreed = (v: Prof, set: PSet, id: string) => (
        <>
            {seg(T.pfBk, v.bk, (i) => set({ bk: i, b1: i === 2 ? 0 : v.b1, b2: i === 1 ? v.b2 : 0 }), T.pfBreedK)}
            <div className="fz-gap2" />
            {v.bk === 1 && <p className="fz-hint fz-pf-h0">{L(T.pfMixHint)}</p>}
            {v.bk !== 2 && breedPick(0, v, set, id + "1")}
            {v.bk === 1 && (
                <>
                    <div className="fz-pf-gap" />
                    {breedPick(1, v, set, id + "2")}
                </>
            )}
            {(v.bk === 2 || (v.bk === 1 && !(adultRange(v)?.src === "mix"))) && (
                <>
                    <div className="fz-gap2" />
                    <span className="fz-lbl">{L(T.pfSizeK)}</span>
                    {seg([...T.pfSizes, T.pfSizeNo], v.size < 0 ? 4 : v.size, (i) => set({ size: i === 4 ? -1 : i }), T.pfSizeK)}
                </>
            )}
        </>
    )
    const fKg = (v: Pet, set: PSet, id: string) => {
        if (v.sp === 2)
            return (
                <>
                    <div className="fz-kcin">
                        <input
                            key={(v.id || "new") + "-kg"}
                            id={id}
                            className="fz-inp"
                            type="number"
                            inputMode="decimal"
                            step="any"
                            min={0.005}
                            max={300}
                            defaultValue={v.kg}
                            aria-label={L(T.weight)}
                            onChange={(e) => {
                                const x = parseFloat(e.target.value.replace(",", "."))
                                if (x > 0 && x <= 300) set({ kg: Math.round(x * 1000) / 1000 })
                            }}
                        />
                        <span>kg</span>
                    </div>
                    <p className="fz-hint">{L(T.ptKgSmall)}</p>
                </>
            )
        const cat = v.sp === 1
        const mn = cat ? 0.5 : 1
        const mx = cat ? 15 : ageGrpOf(v, NOW) === 0 ? 35 : 80
        const st = cat ? 0.1 : 0.5
        const k = Math.min(Math.max(v.kg, mn), mx)
        const setK = (x: number) => set({ kg: Math.min(mx, Math.max(mn, cat ? Math.round(x * 10) / 10 : Math.round(x * 2) / 2)) })
        const ar = cat ? null : adultRange(v)
        const m = monthsOf(v, NOW)
        const mid = ar ? ((ar.r[0] ?? ar.r[1] ?? 0) + (ar.r[1] ?? ar.r[0] ?? 0)) / 2 : 0
        const growQ = !cat && m !== null && m >= 12 && m < 24 && mid >= 25
        return (
            <>
                <div className="fz-kgrow">
                    <button type="button" className="fz-step" aria-label={L(T.less)} disabled={k <= mn} onClick={() => setK(k - st)}>
                        −
                    </button>
                    <div className="fz-kg">
                        {kgN(k)}
                        <small>kg</small>
                    </div>
                    <button type="button" className="fz-step" aria-label={L(T.more)} disabled={k >= mx} onClick={() => setK(k + st)}>
                        +
                    </button>
                </div>
                <input
                    id={id}
                    className="fz-range"
                    type="range"
                    min={mn}
                    max={mx}
                    step={st}
                    value={k}
                    aria-label={L(T.weight)}
                    aria-valuetext={kgN(k) + " kg"}
                    style={{ ["--p" as any]: ((k - mn) / (mx - mn)) * 100 + "%" } as React.CSSProperties}
                    onChange={(e) => setK(+e.target.value)}
                />
                <p className="fz-hint">{L(T.pfScaleHint[v.sex])}</p>
                {ar && (
                    <p className="fz-hint">
                        {ar.src === "std" ? L(T.pfStd) + ", " + L(v.sex ? T.pfFemales : T.pfMales) : L(ar.src === "mix" ? T.pfMixW : T.pfSizeW)}: {wTxt(ar.r)}
                    </p>
                )}
                {growQ && (
                    <>
                        <div className="fz-gap2" />
                        <span className="fz-lbl">{L(T.pfGrow)}</span>
                        {seg(T.yesNo, v.grow ? 0 : 1, (i) => set({ grow: i === 0 }), T.pfGrow)}
                        <p className="fz-hint">{L(T.pfGrowHint)}</p>
                    </>
                )}
            </>
        )
    }
    const fBody = (v: Pet, set: PSet, id: string) => {
        const adult = ageGrpOf(v, NOW) === 2
        return (
            <>
                <p className="fz-hint fz-pf-h0">{L(T.pfBodyHint)}</p>
                <div className="fz-pf-opts" role="radiogroup" aria-label={L(T.pfBodyK)}>
                    {[0, 1, 2, 3].map((i) => (
                        <button key={i} type="button" role="radio" aria-checked={v.body === i} className="fz-pf-opt" onClick={() => set({ body: i })}>
                            {bodySvg(i, v.sp === 1)}
                            <span>
                                <b>{L(T.pfBodies[i][v.sex])}</b>
                                <small>{L(v.sp === 1 ? T.ptBodyDC[i] : T.pfBodyD[i])}</small>
                            </span>
                        </button>
                    ))}
                </div>
                {v.body >= 2 && adult && (
                    <>
                        <div className="fz-gap2" />
                        <label className="fz-lbl" htmlFor={id}>
                            {L(T.pfIdeal)}
                        </label>
                        <div className="fz-kcin">
                            <input id={id} className="fz-inp" type="number" min={v.sp === 1 ? 0.5 : 1} max={v.kg} step={v.sp === 1 ? 0.1 : 0.5} value={v.ideal || ""} placeholder={kgN(v.sp === 1 ? Math.round((v.kg / OVER[v.body]) * 10) / 10 : r05(v.kg / OVER[v.body]))} onChange={(e) => set({ ideal: Math.max(0, +e.target.value || 0) })} />
                            <span>kg</span>
                        </div>
                        <p className="fz-hint">{L(T.pfOverHow)}</p>
                    </>
                )}
                {v.body >= 2 && !adult && <p className="fz-hint fz-hint--w">{L(T.pfPupFat)}</p>}
                {v.body === 0 && <p className="fz-hint fz-hint--w">{L(T.pfThin)}</p>}
            </>
        )
    }
    const fAct = (v: Prof, set: PSet) => (
        <>
            {seg(T.acts, v.act, (i) => set({ act: i }), T.active)}
            <p className="fz-hint">{L(T.actHint[v.act])}</p>
        </>
    )
    const fHealth = (v: Prof, set: PSet) => {
        const n = v.sex === 1 && !v.neut ? 3 : 2
        return (
            <>
                {seg(
                    T.pfHealths.slice(0, n).map((h) => h[v.sex]),
                    Math.min(v.health, n - 1),
                    (i) => set({ health: i }),
                    T.pfHealthK
                )}
                {v.health > 0 && <p className="fz-hint fz-hint--w">{L(T.pfVet)}</p>}
            </>
        )
    }
    const fFood = (v: Prof, set: PSet, id: string) => (
        <>
            {seg(T.pfFoods, v.food, (i) => set({ food: i }), T.pfFoodK)}
            <p className="fz-lbl" style={{ marginTop: 16 }}>{L(T.pfMixK)}</p>
            {seg(T.feedO, numIn(v.mix, 0, 2, 0), (i) => { set({ mix: i }); setFeed(i, true) }, T.feedL)}
            <p className="fz-hint">{L(T.pfMixH)}</p>
            <div className="fz-pf-two">
                <label className="fz-lbl" htmlFor={id + "k"}>
                    {L(T.pfKc)}
                    <input id={id + "k"} className="fz-inp" inputMode="decimal" value={v.kc100} maxLength={5} autoComplete="off" onChange={(e) => set({ kc100: e.target.value.replace(/[^\d.,]/g, "") })} />
                </label>
                <label className="fz-lbl" htmlFor={id + "g"}>
                    {L(T.pfGday)}
                    <input id={id + "g"} className="fz-inp" inputMode="numeric" value={v.gday} maxLength={4} autoComplete="off" onChange={(e) => set({ gday: e.target.value.replace(/[^\d]/g, "") })} />
                </label>
            </div>
        </>
    )
    const fTreats = (v: Prof, set: PSet) => seg(T.pfTreats, v.treats, (i) => set({ treats: i }), T.pfTreatsK)
    const fNo = (v: Prof, set: PSet) => (
        <>
            <div className="fz-chips2" role="group" aria-label={L(T.cant)}>
                {T.ocal.map(([cid, t]) => {
                    const on = v.no.includes(cid)
                    return (
                        <button key={cid} type="button" className="fz-chip" aria-pressed={on} onClick={() => set({ no: on ? v.no.filter((x) => x !== cid) : [...v.no, cid] })}>
                            {L(t)}
                        </button>
                    )
                })}
            </div>
            <p className="fz-hint">{L(T.pfNoHint)}</p>
        </>
    )
    const pfSteps = (v: Pet) => [
        ...(newPet && catsOk ? ["sp"] : []),
        "name",
        "pic",
        "tr",
        ...(v.sp !== 2 ? ["neut"] : []),
        "born",
        "since",
        ...(v.sp === 0 ? ["breed"] : []),
        "kg",
        ...(v.sp !== 2 ? ["body"] : []),
        ...(v.sp === 0 && ageGrpOf(v, NOW) === 2 ? ["act"] : []),
        ...(v.sp !== 2 ? ["health"] : []),
        ...(v.sp === 0 ? ["food", "treats", "no"] : []),
    ]
    const pfField = (sid: string, v: Pet, set: PSet, pre: string) =>
        sid === "sp" ? (
            fSp(v, set, pre + "k")
        ) : sid === "pic" ? (
            <>
                {fPic(v, set, false)}
                <p className="fz-hint">{L(T.ptPicSkip)}</p>
            </>
        ) : sid === "tr" ? (
            fTr(v, set, pre)
        ) : sid === "since" ? (
            fSince(v, set, pre)
        ) : sid === "name" ? (
            <>
                {fNameIn(v, set, pre + "n")}
                <div className="fz-gap2" />
                <span className="fz-lbl">{L(T.ptSexQ[v.sp])}</span>
                {fSex(v, set)}
            </>
        ) : sid === "neut" ? (
            fNeut(v, set)
        ) : sid === "born" ? (
            fBorn(v, set, pre + "b")
        ) : sid === "breed" ? (
            fBreed(v, set, pre + "r")
        ) : sid === "kg" ? (
            fKg(v, set, pre + "w")
        ) : sid === "body" ? (
            fBody(v, set, pre + "i")
        ) : sid === "act" ? (
            fAct(v, set)
        ) : sid === "health" ? (
            fHealth(v, set)
        ) : sid === "food" ? (
            fFood(v, set, pre + "f")
        ) : sid === "treats" ? (
            fTreats(v, set)
        ) : (
            fNo(v, set)
        )

    /* ---------- result ---------- */

    const pfResult = (p: Pet, note: boolean) => {
        const d = dogOf(p, NOW)
        const [lo, hi] = kcalRange(d)
        const ag = ageGrpOf(p, NOW)
        const m = monthsOf(p, NOW)
        const ageTxt = m !== null ? (m < 24 ? Math.max(0, m) + " " + L(T.pfMonthsW) : Math.floor(m / 12) + " " + L(T.pfYearsW)) : L(T.pfAges[ag])
        const b1 = bById(p.b1)
        const breedTxt = p.bk === 0 && b1 ? bName(b1) : p.bk === 1 ? L(T.pfMixed) + (b1 ? " · " + bName(b1) + (bById(p.b2) ? " × " + bName(bById(p.b2) as Breed) : "") : "") : null
        const tags = [L(T.pfSexes[p.sex]).toLowerCase() + (ag === 2 ? ", " + L(T.pfNeutS[p.neut ? 0 : 1][p.sex]) : ""), ageTxt, breedTxt, kgN(p.kg) + " kg, " + L(T.pfBodies[p.body][p.sex]).toLowerCase(), ag === 2 ? L(T.acts[p.act]).toLowerCase() : null].filter(Boolean) as string[]
        const kc = parseFloat(p.kc100.replace(",", "."))
        const kcOk = kc >= 20 && kc <= 900
        const gLo = kcOk ? rG(lo / (kc / 100)) : 0,
            gHi = kcOk ? rG(hi / (kc / 100)) : 0
        const gNow = +p.gday || 0
        const ar = adultRange(p)
        const lose = d.lose
        const budget = Math.max(5, fl5(lo * 0.1))
        return (
            <div className="fz-pf-res">
                <div className="fz-pf-rh">
                    <h2>{pfNm(p) || L(T.pfYourDog)}</h2>
                    {note && pfNm(p) && <span className="fz-pf-bnote fz-hand">{L(T.pfBNote[p.sex === 1 ? 2 : 1])}</span>}
                </div>
                <div className="fz-pf-tags">
                    {tags.map((t, i) => (
                        <span key={i} className="fz-tag fz-tag--t">
                            {t}
                        </span>
                    ))}
                </div>
                {p.health > 0 ? (
                    <div className="fz-tile fz-tile--o fz-pf-t">
                        <div className="d" style={{ color: "var(--ink)", fontSize: 16 }}>
                            {L(p.health === 2 ? T.pfPreg : T.pfIll)}
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="fz-tile fz-pf-t">
                            <div className="k">{L(T.pfKcalDay)}</div>
                            <div className="v">
                                <Num v={rK(lo)} lang={lang} />
                                {rK(hi) > rK(lo) && (
                                    <>
                                        –<Num v={rK(hi)} lang={lang} />
                                    </>
                                )}
                                <small>kcal</small>
                            </div>
                            <div className="d">{lose ? L(T.pfLose) + " " + kgN(targetOf(p)) + " kg (AAHA). " + L(T.pfLoseVet) : L(T.pfMaint)}</div>
                        </div>
                        <div className="fz-tile fz-tile--s fz-pf-t">
                            <div className="k">{L(T.pfWeightK)}</div>
                            <div className="d" style={{ color: "var(--ink)" }}>
                                {p.body === 1 && ag === 2 ? L(T.pfJustRight) : p.body >= 2 && ag === 2 ? L(T.pfOver) + " " + kgN(targetOf(p)) + " kg. " + (p.ideal > 0 && p.ideal < p.kg ? "" : L(T.pfOverHow)) : p.body === 0 ? L(T.pfThin) : p.body >= 2 ? L(T.pfPupFat) : ""}
                            </div>
                            {ar && (
                                <div className="d">
                                    {ar.src === "std" ? L(T.pfStd) + ", " + L(p.sex ? T.pfFemales : T.pfMales) : L(ar.src === "mix" ? T.pfMixW : T.pfSizeW)}: {wTxt(ar.r)}. {ag === 2 ? relTxt(p, ar.r) : ""}
                                </div>
                            )}
                            {p.bk === 0 && b1 && !b1.w && <div className="d">{L(T.pfStdNoW)}</div>}
                        </div>
                        {kcOk && (
                            <div className="fz-tile fz-pf-t" style={{ background: "var(--bg2)" }}>
                                <div className="k" style={{ color: "var(--ink2)" }}>
                                    {L(T.pfFoodNow)} · {nf(kc, lang, kc % 1 ? 1 : 0)} {L(T.per100)}
                                </div>
                                <div className="v">
                                    <Num v={gLo} lang={lang} />
                                    {gHi > gLo && (
                                        <>
                                            –<Num v={gHi} lang={lang} />
                                        </>
                                    )}
                                    <small>{L(T.pfGrams)}</small>
                                </div>
                                {gNow > 0 && (
                                    <div className="d">
                                        {L(T.pfNowGive)} {nf(gNow, lang)} g. {gNow > gHi * 1.05 ? nf(gNow - gHi, lang) + " g " + L(T.pfMore) + "." : gNow < gLo * 0.95 ? nf(gLo - gNow, lang) + " g " + L(T.pfLess) + "." : L(T.pfFits)}
                                    </div>
                                )}
                            </div>
                        )}
                        {p.treats > 0 && (
                            <div className="fz-tile fz-tile--o fz-pf-t">
                                <div className="k" style={{ color: "var(--orInk)" }}>
                                    {L(T.pfTreatT)} · {L(T.pfTreats[p.treats]).toLowerCase()}
                                </div>
                                <div className="v">
                                    <em>{L(T.upTo)}</em>
                                    <Num v={budget} lang={lang} />
                                    <small>kcal</small>
                                </div>
                                <div className="d">
                                    {kcOk
                                        ? lang === "en"
                                            ? `That's 10 % of the day. On treat days, give ${nf(Math.max(5, Math.round(budget / (kc / 100) / 5) * 5), lang)} g less of the current food.`
                                            : `To je 10 % dana. Na dan poslastica daj ${nf(Math.max(5, Math.round(budget / (kc / 100) / 5) * 5), lang)} g manje sadašnje hrane.`
                                        : L(T.pfTreatD)}
                                </div>
                            </div>
                        )}
                    </>
                )}
                <div className="fz-tile fz-pf-t" style={{ background: "var(--sky0)" }}>
                    <div className="k" style={{ color: "var(--skyInk)" }}>
                        {L(T.pfRecT)}
                    </div>
                    <div className="d" style={{ color: "var(--ink)" }}>
                        {L(T.pfRecD)}
                    </div>
                    <button type="button" className="fz-btn fz-btn--p fz-btn--sm" style={{ marginTop: 12 }} onClick={() => go({ p: "recipes" })}>
                        {L(T.pfSeeRec)}
                    </button>
                </div>
                <p className="fz-pf-src">
                    {L(T.pfSrc)}:{" "}
                    <a className="fz-link" href={AAHA_URL} target="_blank" rel="noopener noreferrer">
                        {L(T.pfAAHA)}
                    </a>
                    {" · "}
                    <a className="fz-link" href={WSAVA_URL} target="_blank" rel="noopener noreferrer">
                        {L(T.pfWSAVA)}
                    </a>
                    {" · "}
                    <a className="fz-link" href={FCI_URL} target="_blank" rel="noopener noreferrer">
                        {L(T.pfFCI)}
                    </a>
                    {" · "}
                    <a className="fz-link" href={HKS_URL} target="_blank" rel="noopener noreferrer">
                        {L(T.pfHKS)}
                    </a>
                </p>
            </div>
        )
    }

    /* ---------- A: one question at a time (first visit) ---------- */

    const pfWizard = () => {
        const st = pfSteps(pd)
        const i = Math.min(pstep, st.length - 1)
        const sid = st[i]
        const setD: PSet = (patch) => setPd((d) => ({ ...d, ...patch }))
        const last = i === st.length - 1
        return (
            <div className="fz-pf-wiz">
                <div className="fz-pf-prog" aria-hidden="true">
                    {st.map((_, k) => (
                        <i key={k} className={k <= i ? "on" : ""} />
                    ))}
                </div>
                <div className="fz-pf-step">
                    {i + 1} {L(T.pfStep)} {st.length}
                </div>
                <h2 className="fz-pf-q" id="fz-pf-q" tabIndex={-1}>
                    {pfQ(sid, pd)}
                </h2>
                {sid === "kg" && pd.sp === 0 && <p className="fz-pf-bnote fz-hand">{L(T.pfBNote[0])}</p>}
                <div className="fz-pf-f">{pfField(sid, pd, setD, "fz-pw-")}</div>
                <div className="fz-pf-nav">
                    {i > 0 ? (
                        <button type="button" className="fz-btn fz-btn--g" onClick={() => setPstep(i - 1)}>
                            {L(T.pfBack)}
                        </button>
                    ) : ps && ps.pets.length ? (
                        <button
                            type="button"
                            className="fz-btn fz-btn--g"
                            onClick={() => {
                                setNewPet(false)
                                setPmode("res")
                                setPv("dash")
                            }}
                        >
                            {L(T.ptCancel)}
                        </button>
                    ) : (
                        <span />
                    )}
                    <button
                        type="button"
                        className="fz-btn fz-btn--p"
                        onClick={() => {
                            if (!last) setPstep(i + 1)
                            else {
                                if (newPet || !pd.id) addPet(pd)
                                else saveProf(pd)
                                setNewPet(false)
                                setPmode("res")
                                setPv("dash")
                                setPstep(0)
                            }
                        }}
                    >
                        {last ? L(T.pfDone) : L(T.pfNext)}
                    </button>
                </div>
            </div>
        )
    }

    /* ---------- B: everything on one card (editing) ---------- */

    const pfCardEd = (v: Pet) => {
        const setE: PSet = (patch) => saveProf({ ...v, ...patch })
        const ag = ageGrpOf(v, NOW)
        const dogp = v.sp === 0
        const row = (label: LS, body: React.ReactNode, k: string) => (
            <div className="fz-pf-row" key={k}>
                <span className="fz-pf-rl">{L(label)}</span>
                <div className="fz-pf-rb">{body}</div>
            </div>
        )
        const [lo, hi] = kcalRange(dogOf(v, NOW))
        return (
            <>
                <div className="fz-pf-acts">
                    <button type="button" className="fz-btn fz-btn--p fz-btn--sm" onClick={() => setPmode("res")}>
                        {L(T.pfDone)}
                    </button>
                    <button
                        type="button"
                        className="fz-btn fz-btn--g fz-btn--sm"
                        onClick={() => {
                            setPd(v)
                            setPstep(0)
                            setNewPet(false)
                            setPmode("wiz")
                        }}
                    >
                        {L(T.ptRedo)}
                    </button>
                    {!pdel ? (
                        <button type="button" className="fz-link" onClick={() => setPdel(true)}>
                            {L(T.ptDelPet)}
                        </button>
                    ) : (
                        <button type="button" className="fz-btn fz-btn--sm fz-pf-del" onClick={() => delPet(v.id)}>
                            {L(T.ptDelSure)}
                        </button>
                    )}
                </div>
                <div className="fz-pf-ed">
                    <div className="fz-pf-id">
                        <div className="fz-pf-idh">
                            {avOf(v, "av")}
                            <div>
                                <small>{L(T.ptCard[v.sp])}</small>
                                <b>{yourPet(v)}</b>
                            </div>
                        </div>
                        {(catsOk || v.sp !== 0) &&
                            row(
                                T.ptSpK,
                                <>
                                    {seg(v.sp === 2 ? T.ptSpSeg : T.ptSpSeg.slice(0, 2), v.sp, (i) => setE({ sp: i }), T.ptSpK)}
                                    {v.sp === 2 && <input className="fz-inp" style={{ marginTop: 10 }} value={v.kind} maxLength={30} placeholder={L(T.ptKindPh)} aria-label={L(T.ptKind)} onChange={(e) => setE({ kind: e.target.value })} />}
                                </>,
                                "sp"
                            )}
                        {row(T.pfName, fNameIn(v, setE, "fz-pe-n"), "n")}
                        {row(T.ptPhotos, fPic(v, setE, true), "pic")}
                        {row(T.ptTrK, fTr(v, setE, "fz-pe-"), "tr")}
                        {row(T.ptSinceK, fSince(v, setE, "fz-pe-"), "since")}
                        {row(T.ptQK, fQ(v, setE, "fz-pe-q"), "q")}
                        {row(T.ptSexQ[v.sp], fSex(v, setE), "s")}
                        {v.sp !== 2 && row(T.pfNeutK[v.sex], fNeut(v, setE), "c")}
                        {row(T.pfBornK[v.sex], fBorn(v, setE, "fz-pe-b"), "b")}
                        {dogp && row(T.pfBreedK, fBreed(v, setE, "fz-pe-r"), "r")}
                        {row(T.pfWeightK, fKg(v, setE, "fz-pe-w"), "w")}
                        {v.sp !== 2 && row(T.pfBodyK, fBody(v, setE, "fz-pe-i"), "i")}
                        {dogp && ag === 2 && row(T.active, fAct(v, setE), "a")}
                        {v.sp !== 2 && row(T.pfHealthK, fHealth(v, setE), "h")}
                        {dogp && row(T.pfFoodK, fFood(v, setE, "fz-pe-f"), "f")}
                        {dogp && row(T.pfTreatsK, fTreats(v, setE), "t")}
                        {dogp && row(T.cant, fNo(v, setE), "x")}
                    </div>
                    <aside className="fz-pf-live" id="fz-pf-res">
                        {dogp ? (
                            pfResult(v, false)
                        ) : (
                            <div className="fz-pf-res">
                                <div className="fz-pf-rh">
                                    <h2>{yourPet(v)}</h2>
                                </div>
                                <div className="fz-pf-tags">
                                    {tagsOf(v).map((t, i) => (
                                        <span key={i} className="fz-tag fz-tag--t">
                                            {t}
                                        </span>
                                    ))}
                                </div>
                                <p className="fz-pt-note">{L(T.ptNotDog[v.sp === 2 ? 1 : 0])}</p>
                            </div>
                        )}
                    </aside>
                    {dogp && v.health === 0 && (
                        <div className="fz-pf-bar">
                            <span>
                                <b>
                                    {nf(rK(lo), lang)}
                                    {rK(hi) > rK(lo) ? "–" + nf(rK(hi), lang) : ""} kcal
                                </b>
                                <small>{L(T.pfKcalDay)}</small>
                            </span>
                            <button
                                type="button"
                                className="fz-btn fz-btn--p fz-btn--sm"
                                onClick={() => {
                                    const el = document.getElementById("fz-pf-res")
                                    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" })
                                }}
                            >
                                {L(T.pfToRes)}
                            </button>
                        </div>
                    )}
                </div>
            </>
        )
    }

    /* ---------- my pets: store actions ---------- */

    /* Freshy's Plus: days of the free trial left; free users go to the Plus page for the extras */
    const plusN = plusLeft(ps, NOW)
    const isPlus = !LIVE && plusN > 0
    /* cats only in Plus: the food site is for dogs, so without Plus a new pet is a dog (a cat added earlier stays) */
    const catsOk = isPlus
    /* live site (freshysfoods.com): no Freshy's Plus until the apps; only the free part of My pets */
    const goPlus = () => { if (!LIVE) go({ p: "plus" }) }
    const vetOk = isPlus || !LIVE
    const qt = (x: string) => (lang === "en" ? "\u201c" + x + "\u201d" : "\u201e" + x + "\u201d")
    const openVet = () => (isPlus ? setPv("vet") : goPlus())

    const feedPet: Pet | null = prof && prof.sp === 0 ? prof : ps ? ps.pets.find((p) => p.sp === 0) || null : null
    const pfDg = feedPet ? dogOf(feedPet, NOW) : null
    const pfOff = !!pfDg && (pfDg.kg !== dog.kg || pfDg.age !== dog.age || pfDg.neut !== dog.neut || pfDg.act !== dog.act || !!pfDg.lose !== !!dog.lose)
    const wFmt = (kg: number) => (kg < 1 ? nf(Math.round(kg * 1000), lang) + " g" : kgN(Math.round(kg * 10) / 10) + " kg")
    const kgIn = (x: number) => (lang === "hr" ? String(x).replace(".", ",") : String(x))
    const commit = (s: PStore) => {
        setPs(s)
        setSaveErr(!writeStore(s))
        if (acctRef.current) syncLater()
    }
    const syncDog = (s: PStore) => {
        const c = s.pets.find((p) => p.id === s.cur)
        const fp = c && c.sp === 0 ? c : s.pets.find((p) => p.sp === 0)
        if (fp) {
            setDog(dogOf(fp, new Date()))
            setFeedS(numIn(fp.mix, 0, 2, 0))
        }
    }
    const upsertDay = (log: Ent[], pet: string, t: string, d: string, patch: Partial<Ent>) => {
        const i = log.findIndex((e) => e.pet === pet && e.d === d && (e.t === t || e.t === "start") && !(e.ph && e.ph.length) && !e.tx)
        if (i >= 0) return log.map((e, k) => (k === i ? { ...e, ...patch } : e))
        return [...log, { id: newId(), pet, t, d, at: Date.now(), ...patch }]
    }
    const saveProf = (p0: Pet) => {
        if (!ps) return
        const now = new Date()
        const old = ps.pets.find((x) => x.id === p0.id)
        if (!old) return
        const p = withGoal(p0, now)
        let log = ps.log
        if (old.kg !== p.kg) log = upsertDay(log, p.id, "w", ymd(now), { kg: p.kg })
        if (old.body !== p.body && p.sp !== 2) log = upsertDay(log, p.id, "b", ymd(now), { body: p.body })
        const s = { ...ps, pets: ps.pets.map((x) => (x.id === p.id ? p : x)), log }
        commit(s)
        syncDog(s)
    }
    const addPet = (d: Pet) => {
        const now = new Date(),
            id = newId()
        const pet = withGoal({ ...d, id, made: ymd(now), goal: 0, gb: 0, kind: d.sp === 2 ? d.kind.trim().slice(0, 30) : "" }, now)
        const s0: PStore = ps || { v: 1, pets: [], cur: "", log: [], ck: [], rem: 3, pt: plusWant ? ymd(now) : "", pg: 0 }
        const start: Ent = { id: newId(), pet: id, t: "start", d: ymd(now), at: now.getTime(), kg: pet.kg }
        if (pet.sp !== 2) start.body = pet.body
        const s: PStore = { ...s0, pets: [...s0.pets, pet], cur: id, log: [...s0.log, start], pt: plusWant && !s0.pt ? ymd(now) : s0.pt }
        commit(s)
        syncDog(s)
        setPlusWant(false)
        setHi(id)
    }
    const startTrial = () => {
        if (!ps || !ps.pets.length) {
            setPlusWant(true)
            go({ p: "dog" })
            return
        }
        if (!ps.pt) commit({ ...ps, pt: ymd(new Date()), pg: 0 })
        setPmode("res")
        setPv("dash")
        go({ p: "dog" })
    }
    const selPet = (id: string) => {
        if (!ps) return
        if (ps.cur !== id) {
            const s = { ...ps, cur: id }
            commit(s)
            syncDog(s)
        }
        setPmode("res")
        setPv((v) => (isPlus ? v : "dash"))
        setPdel(false)
        setRmId("")
        setMdf(null)
        setMday("")
        setFmsg("")
        setVv(false)
        setVf(null)
        setVzf(null)
        setVfDone(false)
        setVpo("")
    }
    const startAdd = () => {
        if (ps && ps.pets.length && !isPlus) return goPlus()
        setPd(PD0)
        setPstep(0)
        setNewPet(true)
        setPmode("wiz")
        setPdel(false)
        setNoBorn(false)
    }
    const delPet = (id: string) => {
        if (!ps) return
        const gone = ps.pets.find((p) => p.id === id)
        phDel(ps.log.filter((e) => e.pet === id).flatMap((e) => e.ph || []).concat(gone && gone.pic ? [gone.pic] : [])).catch(() => {})
        const pets = ps.pets.filter((p) => p.id !== id)
        const mids = new Set((ps.md || []).filter((m) => m.pet === id).map((m) => m.id))
        const s: PStore = {
            ...ps,
            pets,
            cur: pets[0] ? pets[0].id : "",
            log: ps.log.filter((e) => e.pet !== id),
            ck: ps.ck.filter((c) => c.pet !== id),
            ml: (ps.ml || []).filter((x) => x.pet !== id),
            wk: (ps.wk || []).filter((x) => x.pet !== id),
            md: (ps.md || []).filter((x) => x.pet !== id),
            dz: (ps.dz || []).filter((z) => !mids.has(z.med)),
            dy: (ps.dy || []).filter((x) => x.pet !== id),
            vi: (ps.vi || []).filter((x) => x.pet !== id),
            vz: (ps.vz || []).filter((x) => x.pet !== id),
        }
        commit(s)
        setPdel(false)
        setPv("dash")
        if (pets.length) {
            setPmode("res")
            syncDog(s)
        } else {
            startAdd()
            setDog((d) => ({ ...d, lose: false }))
        }
    }
    /* after any change to the journal, the pet's weight and body shape follow the newest entries */
    const afterLog = (log: Ent[], patch?: Partial<PStore>) => {
        if (!ps || !prof) return
        const now = new Date()
        let pet = prof
        const pts = wPts(log, pet.id)
        if (pts.length) pet = { ...pet, kg: pts[pts.length - 1].kg }
        const lb = lastBody(log, pet.id)
        if (lb && pet.sp !== 2) pet = { ...pet, body: lb.body as number }
        pet = withGoal(pet, now)
        const s = { ...ps, ...patch, log, pets: ps.pets.map((p) => (p.id === pet.id ? pet : p)) }
        commit(s)
        syncDog(s)
    }
    /* without the instructions of a visit: its medicines stay, no longer marked as written at the visit */
    const noIns = (ids: Set<string>): Partial<PStore> | undefined =>
        ps && ids.size ? { vi: (ps.vi || []).filter((x) => !ids.has(x.id)), md: (ps.md || []).map((m) => (ids.has(m.vi) ? { ...m, vi: "" } : m)) } : undefined
    const rmIns = (x: VetIns) => {
        if (ps) afterLog(ps.log.filter((e) => e.id !== x.ent), noIns(new Set([x.id])))
    }
    const openEnt = (t0: string, e?: Ent) => {
        if (!prof) return
        if (!e && !isPlus && t0 && t0 !== "w") return goPlus()
        const t = !e && !isPlus ? "w" : t0
        const today = ymd(new Date())
        setEfDel(false)
        setEfMsg("")
        setEf(
            e
                ? { id: e.id, isNew: false, t: e.t, d: e.d, kg: e.kg ? kgIn(e.kg) : "", wh: e.wh || 0, body: typeof e.body === "number" ? e.body : -1, ti: e.ti || "", tx: e.tx || "", st: e.st || 0, nx: e.nx || "", ph: e.ph || [], ph0: e.ph || [] }
                : { id: newId(), isNew: true, t, d: today, kg: t === "w" ? kgIn(prof.kg) : "", wh: 0, body: t === "b" ? prof.body : -1, ti: "", tx: "", st: 0, nx: t === "vac" ? addMonths(today, 12) : "", ph: [], ph0: [] }
        )
    }
    const closeEnt = () => {
        if (ef) phDel(ef.ph.filter((x) => !ef.ph0.includes(x))).catch(() => {})
        setEf(null)
        setEfDel(false)
    }
    const saveEnt = () => {
        if (!ps || !prof || !ef) return
        const kg = parseFloat(ef.kg.replace(",", "."))
        const hasKg = isFinite(kg) && kg > 0 && kg <= 300
        const need =
            (ef.t === "w" || ef.t === "start") && !hasKg ? "w" : ef.t === "b" && ef.body < 0 ? "b" : (ef.t === "inj" || ef.t === "ill") && !ef.ti.trim() ? "ti" : ef.t === "med" && !ef.ti.trim() ? "med" : ef.t === "note" && !ef.tx.trim() && !ef.ph.length ? "note" : ""
        if (need) {
            setEfMsg(L(T.ptNeed[need]))
            return
        }
        const now = new Date()
        const old = ps.log.find((x) => x.id === ef.id)
        const e: Ent = { id: ef.id, pet: prof.id, t: ef.t, d: isYmd(ef.d) && ef.d <= ymd(now) ? ef.d : ymd(now), at: old ? old.at : now.getTime() }
        if ((ef.t === "w" || ef.t === "start" || ef.t === "vet") && hasKg) e.kg = Math.round(kg * 1000) / 1000
        if ((ef.t === "w" || ef.t === "start") && hasKg && ef.wh === 1) e.wh = 1
        if ((ef.t === "w" || ef.t === "b" || ef.t === "start") && ef.body >= 0 && prof.sp !== 2) e.body = ef.body
        if (ef.ti.trim()) e.ti = ef.ti.trim().slice(0, 80)
        if (ef.tx.trim()) e.tx = ef.tx.trim().slice(0, 1200)
        if (ef.t === "inj" || ef.t === "ill") e.st = ef.t === "ill" && ef.st === 1 ? 0 : ef.st
        if (isYmd(ef.nx) && ["vet", "vac", "par", "inj", "ill", "med"].includes(ef.t)) e.nx = ef.nx
        if (ef.ph.length) e.ph = ef.ph
        if (old && old.ph) phDel(old.ph.filter((x) => !ef.ph.includes(x))).catch(() => {})
        afterLog(old ? ps.log.map((x) => (x.id === e.id ? e : x)) : [...ps.log, e])
        setEf(null)
    }
    const delEnt = () => {
        if (!ps || !ef) return
        const old = ps.log.find((x) => x.id === ef.id)
        phDel(Array.from(new Set(ef.ph.concat(old && old.ph ? old.ph : [])))).catch(() => {})
        afterLog(ps.log.filter((x) => x.id !== ef.id), noIns(new Set((ps.vi || []).filter((x) => x.ent === ef.id).map((x) => x.id))))
        setEf(null)
        setEfDel(false)
    }
    const setSt = (e: Ent, st: number) => {
        if (ps) afterLog(ps.log.map((x) => (x.id === e.id ? { ...x, st } : x)))
    }
    const addPhotos = async (files: FileList | null) => {
        if (!files || !ef) return
        const room = 6 - ef.ph.length
        setEfBusy(true)
        setEfMsg("")
        const ids: string[] = []
        try {
            for (const f of Array.from(files).slice(0, Math.max(0, room))) {
                if (!f.type.startsWith("image/")) continue
                const b = await shrink(f)
                const id = newId()
                await phPut(id, b)
                ids.push(id)
            }
        } catch (err) {
            setEfMsg(L(T.ptPhErr))
        }
        setEfBusy(false)
        if (ids.length) setEf((x) => (x ? { ...x, ph: [...x.ph, ...ids] } : x))
    }
    const setCk = (k: "a" | "e" | "p", v: number) => {
        if (!ps || !prof) return
        const today = ymd(new Date())
        const c: Ck = ps.ck.find((x) => x.pet === prof.id && x.d === today) || { pet: prof.id, d: today, a: -1, e: -1, p: -1, at: 0 }
        const n: Ck = { ...c, [k]: c[k] === v ? -1 : v, at: Date.now() }
        const ck = [...ps.ck.filter((x) => !(x.pet === prof.id && x.d === today)), n].filter((x) => x.a >= 0 || x.e >= 0 || x.p >= 0).slice(-1500)
        commit({ ...ps, ck })
    }
    const expCopy = async () => {
        if (!ps || expBusy) return
        setExpBusy(true)
        const ph: Record<string, string> = {}
        try {
            for (const id of ps.log.flatMap((e) => e.ph || []).concat(ps.pets.map((p) => p.pic).filter(Boolean))) {
                const b = await phGet(id)
                if (b) ph[id] = await toDataUrl(b)
            }
        } catch (e) {}
        saveFile("freshys-" + (lang === "hr" ? "ljubimci" : "pets") + "-" + ymd(new Date()) + ".json", JSON.stringify({ app: "freshys-pets", v: 1, at: new Date().toISOString(), store: ps, ph }), "application/json")
        setExpBusy(false)
    }
    const impPick = (f: File | undefined) => {
        if (!f) return
        f.text()
            .then((t) => {
                let j: any = null
                try {
                    j = JSON.parse(t)
                } catch (e) {}
                const s = j && j.app === "freshys-pets" ? storeClean(j.store) : null
                if (!s || !s.pets.length) {
                    setImp({ err: L(T.ptImpBad) })
                    return
                }
                const ph: Record<string, string> = {}
                if (j.ph && typeof j.ph === "object") Object.keys(j.ph).forEach((k) => typeof j.ph[k] === "string" && j.ph[k].startsWith("data:image/") && (ph[k] = j.ph[k]))
                setImp({ s, ph, at: typeof j.at === "string" && isYmd(j.at.slice(0, 10)) ? j.at.slice(0, 10) : "" })
            })
            .catch(() => setImp({ err: L(T.ptImpBad) }))
    }
    const impGo = async () => {
        if (!imp || !imp.s) return
        const s = imp.s,
            ph = imp.ph || {}
        try {
            await phClear()
            for (const k of Object.keys(ph)) await phPut(k, await (await fetch(ph[k])).blob())
        } catch (e) {}
        phUrls.forEach((u) => URL.revokeObjectURL(u))
        phUrls.clear()
        commit(s)
        syncDog(s)
        setPmode("res")
        setPv("dash")
        setImp({ ok: L(T.ptImpOk) })
    }
    /* ---------- account: state, saving to the account, forms ---------- */
    const [acct, setAcctS] = useState<Acct | null>(null)
    const acctRef = useRef<Acct | null>(null)
    const setAcct = (a: Acct | null) => {
        acctRef.current = a
        setAcctS(a)
        acctSave(a)
    }
    const [syncSt, setSyncSt] = useState<"" | "busy" | "ok" | "off">("")
    type AuM = "in" | "up" | "forgot" | "sent" | "reset"
    const au0 = { m: "in" as AuM, nm: "", em: "", pw: "", show: false, busy: false, err: "", ok: "", oob: "" }
    const [au, setAu] = useState(au0)
    const auSet = (p: Partial<typeof au0>) => setAu((x) => ({ ...x, err: "", ...p }))
    const [guest, setGuestS] = useState(false)
    const [invOff, setInvOff] = useState(false)
    const [delQ, setDelQ] = useState<{ pw: string; busy: boolean; err: string } | null>(null)
    const [cpw, setCpw] = useState<{ cur: string; nw: string; busy: boolean; err: string } | null>(null)
    const [acMsg, setAcMsg] = useState("")
    const [verMsg, setVerMsg] = useState("")
    const psRef = useRef<PStore | null>(null)
    psRef.current = ps
    const syncT = useRef<ReturnType<typeof setTimeout> | null>(null)
    const syncRun = useRef(false)
    const syncMore = useRef(false)
    const syncGet = (uid: string): SyncSt => {
        const s = lsGet<any>(SYNC_KEY)
        return s && s.uid === uid ? { uid, base: numIn(s.base, 0, 1e15, 0), dirty: s.dirty === true, ph: Array.isArray(s.ph) ? s.ph.filter((x: unknown) => typeof x === "string") : [] } : { uid, base: 0, dirty: false, ph: [] }
    }
    const auErr = (e: unknown) => {
        const c = e instanceof FbErr ? e.code : ""
        return L(
            c === "NET"
                ? TA.eNet
                : c === "EMAIL_EXISTS"
                ? TA.eExists
                : c === "INVALID_LOGIN_CREDENTIALS" || c === "INVALID_PASSWORD" || c === "EMAIL_NOT_FOUND"
                ? TA.eCred
                : c === "INVALID_EMAIL" || c === "MISSING_EMAIL"
                ? TA.eEmail
                : c === "WEAK_PASSWORD"
                ? TA.eWeak
                : c === "TOO_MANY_ATTEMPTS_TRY_LATER"
                ? TA.eMany
                : c === "USER_DISABLED"
                ? TA.eDis
                : c === "EXPIRED_OOB_CODE" || c === "INVALID_OOB_CODE"
                ? TA.eOob
                : TA.eGen
        )
    }
    const gone = (e: unknown) => e instanceof FbErr && ["TOKEN_EXPIRED", "USER_NOT_FOUND", "USER_DISABLED", "INVALID_REFRESH_TOKEN"].includes(e.code)
    /* the device copy and the account copy brought into step: the newer one is taken, two that changed apart are merged */
    const syncNow = async (): Promise<boolean> => {
        if (!acctRef.current) return false
        if (syncRun.current) {
            syncMore.current = true
            return false
        }
        syncRun.current = true
        setSyncSt("busy")
        let ok = false
        try {
            const a = await acctTok(acctRef.current)
            acctRef.current = a
            const st = syncGet(a.uid)
            const rem = await fsGetStore(a)
            let local = psRef.current && psRef.current.pets.length ? psRef.current : null
            let send = st.dirty || (!rem && !!local)
            if (rem && rem.s && rem.t > st.base) {
                st.ph = Array.from(new Set(st.ph.concat(phIds(rem.s))))
                if (local && (st.dirty || st.base === 0)) {
                    local = storeMerge(rem.s, local)
                    send = JSON.stringify(local) !== JSON.stringify(rem.s)
                } else {
                    local = rem.s
                    send = false
                }
                for (const id of phIds(local)) {
                    if (await phGet(id).catch(() => undefined)) continue
                    const d = await fsGetPh(a, id)
                    if (d) await phPut(id, await (await fetch(d)).blob())
                }
                if (!psRef.current || JSON.stringify(psRef.current) !== JSON.stringify(local)) {
                    psRef.current = local
                    setPs(local)
                    writeStore(local)
                    syncDog(local)
                    setPmode("res")
                    setNewPet(false)
                }
                if (!send) lsSet(SYNC_KEY, { uid: a.uid, base: rem.t, dirty: false, ph: st.ph })
            }
            if (send && local) {
                const want = phIds(local)
                for (const id of want) {
                    if (st.ph.includes(id)) continue
                    const b = await phGet(id).catch(() => undefined)
                    if (!b) continue
                    await fsPutPh(a, id, await phData(b))
                    st.ph.push(id)
                }
                const t = Date.now()
                await fsPutStore(a, local, t)
                for (const id of st.ph.filter((x) => !want.includes(x))) await fsDelPh(a, id)
                /* a change made while this was sending is sent on the next round */
                lsSet(SYNC_KEY, { uid: a.uid, base: t, dirty: syncMore.current, ph: st.ph.filter((x) => want.includes(x)) })
            } else if (!rem || rem.t <= st.base) lsSet(SYNC_KEY, { ...st, dirty: false })
            ok = true
            setSyncSt("ok")
        } catch (e) {
            if (gone(e)) setAcct(null)
            setSyncSt("off")
        } finally {
            syncRun.current = false
            if (syncMore.current) {
                syncMore.current = false
                syncLater(300)
            }
        }
        return ok
    }
    const syncLater = (ms = 1500) => {
        const a = acctRef.current
        if (!a) return
        const st = syncGet(a.uid)
        if (!st.dirty) lsSet(SYNC_KEY, { ...st, dirty: true })
        if (syncT.current) clearTimeout(syncT.current)
        syncT.current = setTimeout(() => void syncNow(), ms)
    }
    const verCheck = async () => {
        const a0 = acctRef.current
        if (!a0 || a0.ver) return
        try {
            const a = await acctTok(a0)
            const u = await fbLookup(a)
            if (u.ver && acctRef.current) setAcct({ ...acctRef.current, ...a, ver: true, nm: u.nm || a.nm })
        } catch (e) {
            if (gone(e)) setAcct(null)
        }
    }
    useEffect(() => {
        if (isCanvas || typeof window === "undefined") return
        const a = acctRead()
        if (a) {
            acctRef.current = a
            setAcctS(a)
            void syncNow()
            void verCheck()
        }
        setGuestS(lsGet(GUEST_KEY) === 1)
        const io = lsGet<number>(INV_KEY)
        setInvOff(typeof io === "number" && Date.now() - io < 30 * 864e5)
        /* links from the e-mails Firebase sends: ?mode=verifyEmail|resetPassword&oobCode=… */
        const q = new URLSearchParams(window.location.search)
        const mode = q.get("mode"),
            oob = q.get("oobCode")
        if ((mode === "verifyEmail" || mode === "resetPassword") && oob) {
            try {
                window.history.replaceState(window.history.state, "", window.location.pathname + "#/racun")
            } catch (e) {}
            setPage({ p: "acct" })
            if (mode === "resetPassword") setAu({ ...au0, m: "reset", oob })
            else
                fbPost("update", { oobCode: oob })
                    .then(() => {
                        setVerMsg(L(TA.vfOk))
                        if (acctRef.current) setAcct({ ...acctRef.current, ver: true })
                    })
                    .catch((e) => setVerMsg(auErr(e)))
        }
        const back = () => {
            if (document.visibilityState !== "visible" || !acctRef.current) return
            void syncNow()
            void verCheck()
        }
        document.addEventListener("visibilitychange", back)
        window.addEventListener("online", back)
        return () => {
            document.removeEventListener("visibilitychange", back)
            window.removeEventListener("online", back)
        }
    }, [])
    const emOk = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim())
    const signedIn = (a: Acct) => {
        setAcct(a)
        setAu(au0)
        setGuestS(false)
        lsSet(GUEST_KEY, null)
        setAcMsg("")
        void syncNow()
        go({ p: "dog" })
    }
    const doIn = async () => {
        const em = au.em.trim()
        if (!em || !au.pw) return auSet({ err: L(TA.eMiss) })
        auSet({ busy: true })
        try {
            signedIn(await fbSignIn(em, au.pw))
        } catch (e) {
            setAu((x) => ({ ...x, busy: false, err: auErr(e) }))
        }
    }
    const doUp = async () => {
        const em = au.em.trim()
        if (!emOk(em)) return auSet({ err: L(TA.eEmail) })
        if (au.pw.length < PW_MIN) return auSet({ err: L(TA.eWeak) })
        auSet({ busy: true })
        try {
            signedIn(await fbSignUp(au.nm.trim().slice(0, 60), em, au.pw, lang))
        } catch (e) {
            setAu((x) => ({ ...x, busy: false, err: auErr(e) }))
        }
    }
    const doForgot = async () => {
        const em = au.em.trim()
        if (!emOk(em)) return auSet({ err: L(TA.eEmail) })
        auSet({ busy: true })
        try {
            await fbPost("sendOobCode", { requestType: "PASSWORD_RESET", email: em, continueUrl: FB_BACK }, lang)
            setAu((x) => ({ ...x, busy: false, m: "sent", pw: "" }))
        } catch (e) {
            setAu((x) => ({ ...x, busy: false, err: auErr(e) }))
        }
    }
    const doReset = async () => {
        if (au.pw.length < PW_MIN) return auSet({ err: L(TA.eWeak) })
        auSet({ busy: true })
        try {
            const j = await fbPost("resetPassword", { oobCode: au.oob, newPassword: au.pw })
            setAu({ ...au0, em: String(j.email || ""), ok: L(TA.rsOk) })
        } catch (e) {
            setAu((x) => ({ ...x, busy: false, err: auErr(e) }))
        }
    }
    const resendVer = async () => {
        if (!acctRef.current) return
        try {
            const a = await acctTok(acctRef.current)
            await fbSendVerify(a, lang)
            setVerMsg(L(TA.verSent))
        } catch (e) {
            setVerMsg(auErr(e))
        }
    }
    /* this device forgets the account and its copy of the pets (they stay in the account) */
    const forget = async () => {
        if (syncT.current) clearTimeout(syncT.current)
        setAcct(null)
        lsSet(SYNC_KEY, null)
        try {
            window.localStorage.removeItem(PETS_KEY)
        } catch (e) {}
        await phClear().catch(() => {})
        phUrls.forEach((u) => URL.revokeObjectURL(u))
        phUrls.clear()
        setPs(null)
        psRef.current = null
        setPmode("wiz")
        setNewPet(true)
        setPstep(0)
        setCpw(null)
        setDelQ(null)
    }
    const doOut = async () => {
        const a = acctRef.current
        if (!a) return
        if (syncGet(a.uid).dirty && !(await syncNow())) return setAcMsg(L(TA.outUnsaved))
        if (syncGet(a.uid).dirty) return setAcMsg(L(TA.outUnsaved))
        await forget()
        setAu(au0)
        setAcMsg("")
        go({ p: "dog" })
    }
    const doChPw = async () => {
        const a0 = acctRef.current
        if (!a0 || !cpw) return
        if (cpw.nw.length < PW_MIN) return setCpw({ ...cpw, err: L(TA.eWeak) })
        setCpw({ ...cpw, busy: true, err: "" })
        try {
            const a = await fbSignIn(a0.em, cpw.cur)
            const j = await fbPost("update", { idToken: a.tok, password: cpw.nw, returnSecureToken: true })
            setAcct({ ...a, tok: String(j.idToken || a.tok), rt: String(j.refreshToken || a.rt), exp: Date.now() + (parseInt(String(j.expiresIn || "3600"), 10) - 120) * 1000 })
            setCpw(null)
            setAcMsg(L(TA.chPwOk))
        } catch (e) {
            const c = e instanceof FbErr ? e.code : ""
            setCpw((x) => (x ? { ...x, busy: false, err: c === "INVALID_LOGIN_CREDENTIALS" || c === "INVALID_PASSWORD" ? L(TA.ePw) : auErr(e) } : x))
        }
    }
    const doDel = async () => {
        const a0 = acctRef.current
        if (!a0 || !delQ) return
        setDelQ({ ...delQ, busy: true, err: "" })
        try {
            const a = await fbSignIn(a0.em, delQ.pw)
            for (const id of await fsListPh(a)) await fsDelPh(a, id)
            await fsDelStore(a)
            await fbPost("delete", { idToken: a.tok })
            await forget()
            setAu(au0)
            setAcMsg(L(TA.delOk))
        } catch (e) {
            const c = e instanceof FbErr ? e.code : ""
            setDelQ((x) => (x ? { ...x, busy: false, err: c === "INVALID_LOGIN_CREDENTIALS" || c === "INVALID_PASSWORD" ? L(TA.ePw) : auErr(e) } : x))
        }
    }
    const beGuest = () => {
        setGuestS(true)
        lsSet(GUEST_KEY, 1)
        go({ p: "dog" })
    }
    const eye = (on: boolean) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
            <circle cx="12" cy="12" r="3" />
            {on && <path d="M4 20L20 4" />}
        </svg>
    )
    const okIco = (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="9.5" />
            <path d="M8 12.3l2.6 2.6L16 9.6" />
        </svg>
    )
    const pwIn = (id: string, v: string, set: (s: string) => void, ac: string, show: boolean, tog?: () => void) => (
        <div className="fz-ac-pw">
            <input id={id} className="fz-inp" type={show ? "text" : "password"} value={v} autoComplete={ac} onChange={(e) => set(e.target.value)} />
            {tog && (
                <button type="button" className="fz-ac-eye" aria-label={L(show ? TA.hide : TA.show)} aria-pressed={show} onClick={tog}>
                    {eye(show)}
                </button>
            )}
        </div>
    )
    const auMsg = (au.err || au.ok) && (
        <p className={"fz-ac-msg" + (au.err ? " is-err" : "")} role={au.err ? "alert" : "status"}>
            {au.err || au.ok}
        </p>
    )
    const sub = (f: () => void) => (e: React.FormEvent) => {
        e.preventDefault()
        if (!au.busy) f()
    }
    /* log in / sign up / forgotten / new password: the same card on the account page and on My pets */
    const authBox = () => {
        const m = au.m
        const h = m === "up" ? TA.upH : m === "forgot" || m === "sent" ? TA.fgH : m === "reset" ? TA.rsH : TA.login
        return (
            <div className="fz-ac">
                <h1 className="fz-h2">{L(h)}</h1>
                {m === "in" && <p className="fz-lead fz-ac-lead">{L(TA.inLead)}</p>}
                {m === "up" && <p className="fz-lead fz-ac-lead">{L(TA.upLead)}</p>}
                {verMsg && <p className="fz-ac-msg" role="status">{verMsg}</p>}
                {m === "in" && (
                    <form className="fz-ac-card" onSubmit={sub(doIn)} noValidate>
                        <label className="fz-lbl" htmlFor="fz-ac-em">{L(TA.em)}</label>
                        <input id="fz-ac-em" className="fz-inp" type="email" inputMode="email" autoComplete="email" value={au.em} onChange={(e) => auSet({ em: e.target.value })} />
                        <label className="fz-lbl fz-ac-l2" htmlFor="fz-ac-pw">{L(TA.pw)}</label>
                        {pwIn("fz-ac-pw", au.pw, (s) => auSet({ pw: s }), "current-password", au.show, () => auSet({ show: !au.show }))}
                        {auMsg}
                        <button type="submit" className="fz-btn fz-btn--p fz-ac-wide" disabled={au.busy}>{L(TA.inBtn)}</button>
                        <p className="fz-ac-c">
                            <button type="button" className="fz-link" onClick={() => setAu({ ...au0, m: "forgot", em: au.em })}>{L(TA.forgotQ)}</button>
                        </p>
                        <div className="fz-ac-or">{L(TA.or)}</div>
                        <button type="button" className="fz-btn fz-btn--g fz-ac-wide" onClick={() => setAu({ ...au0, m: "up", em: au.em })}>{L(TA.newAcct)}</button>
                    </form>
                )}
                {m === "up" && (
                    <form className="fz-ac-card" onSubmit={sub(doUp)} noValidate>
                        <label className="fz-lbl" htmlFor="fz-ac-nm">{L(TA.nm)}</label>
                        <input id="fz-ac-nm" className="fz-inp" autoComplete="given-name" maxLength={60} value={au.nm} onChange={(e) => auSet({ nm: e.target.value })} />
                        <label className="fz-lbl fz-ac-l2" htmlFor="fz-ac-em">{L(TA.em)}</label>
                        <input id="fz-ac-em" className="fz-inp" type="email" inputMode="email" autoComplete="email" value={au.em} onChange={(e) => auSet({ em: e.target.value })} />
                        <label className="fz-lbl fz-ac-l2" htmlFor="fz-ac-pw">{L(TA.pw)}</label>
                        {pwIn("fz-ac-pw", au.pw, (s) => auSet({ pw: s }), "new-password", au.show, () => auSet({ show: !au.show }))}
                        <p className="fz-ac-s">{L(TA.pwMin)}</p>
                        {auMsg}
                        <button type="submit" className="fz-btn fz-btn--p fz-ac-wide" disabled={au.busy}>{L(TA.upH)}</button>
                        <p className="fz-ac-s">
                            {L(TA.upNote)}{" "}
                            <button type="button" className="fz-link" onClick={() => go({ p: "privacy" })}>{L(TA.privacy)}</button>
                        </p>
                    </form>
                )}
                {(m === "forgot" || m === "sent") && (
                    <form className="fz-ac-card" onSubmit={sub(doForgot)} noValidate>
                        {m === "sent" ? (
                            <p className="fz-ac-p" role="status">{L(TA.fgSent)}</p>
                        ) : (
                            <>
                                <p className="fz-ac-p">{L(TA.fgP)}</p>
                                <label className="fz-lbl" htmlFor="fz-ac-em">{L(TA.em)}</label>
                                <input id="fz-ac-em" className="fz-inp" type="email" inputMode="email" autoComplete="email" value={au.em} onChange={(e) => auSet({ em: e.target.value })} />
                                {auMsg}
                                <button type="submit" className="fz-btn fz-btn--p fz-ac-wide" disabled={au.busy}>{L(TA.fgBtn)}</button>
                            </>
                        )}
                        <div className="fz-ac-tip">{L(TA.fgTip)}</div>
                    </form>
                )}
                {m === "reset" && (
                    <form className="fz-ac-card" onSubmit={sub(doReset)} noValidate>
                        <label className="fz-lbl" htmlFor="fz-ac-pw">{L(TA.newPw)}</label>
                        {pwIn("fz-ac-pw", au.pw, (s) => auSet({ pw: s }), "new-password", au.show, () => auSet({ show: !au.show }))}
                        <p className="fz-ac-s">{L(TA.pwMin)}</p>
                        {auMsg}
                        <button type="submit" className="fz-btn fz-btn--p fz-ac-wide" disabled={au.busy}>{L(TA.rsBtn)}</button>
                    </form>
                )}
                <p className="fz-ac-alt">
                    {m === "in" ? (
                        <>
                            <button type="button" className="fz-link" onClick={beGuest}>{L(TA.guest)}</button>
                            <br />
                            {L(TA.guestN)}
                        </>
                    ) : m === "up" ? (
                        <>
                            {L(TA.haveQ)}{" "}
                            <button type="button" className="fz-link" onClick={() => setAu({ ...au0, em: au.em })}>{L(TA.inBtn)}</button>
                        </>
                    ) : (
                        <button type="button" className="fz-link" onClick={() => setAu({ ...au0, em: au.em })}>{L(TA.back)}</button>
                    )}
                </p>
            </div>
        )
    }
    const petNames = (s: PStore) => {
        const n = s.pets.map((p) => p.name || L(T.ptSpN[p.sp]))
        return n.length < 2 ? n[0] || "" : n.slice(0, -1).join(", ") + L(TA.and) + n[n.length - 1]
    }
    /* under the title of My pets: confirm the e-mail, saved in the account, or the offer to save pets that are only on this device */
    const acctBar = () => {
        if (!ACCT) return null
        if (acct)
            return (
                <>
                    {!acct.ver && (
                        <div className="fz-ac-ver fz-noprint">
                            <b>{L(TA.verH)}</b>
                            <p>
                                {L(TA.verP)}
                                {acct.em}
                                {L(TA.verP2)}
                            </p>
                            {verMsg ? <p className="fz-ac-s" role="status">{verMsg}</p> : <button type="button" className="fz-link" onClick={resendVer}>{L(TA.verAgain)}</button>}
                        </div>
                    )}
                    {ps && ps.pets.length > 0 && pmode !== "wiz" && (
                        <p className={"fz-ac-ok fz-noprint" + (syncSt === "off" ? " is-off" : "")} role="status">
                            {syncSt === "off" ? L(TA.syncOff) : <>{okIco}{L(TA.saved)}</>}
                        </p>
                    )}
                </>
            )
        if (!ps || !ps.pets.length || invOff || pmode === "wiz") return null
        const one = ps.pets.length === 1
        return (
            <div className="fz-ac-inv fz-noprint">
                <b>
                    {petNames(ps)}
                    {L(one ? TA.invOne : TA.invMany)}
                </b>
                <p>{L(one ? TA.invP1 : TA.invP)}</p>
                <div className="fz-ac-invb">
                    <button type="button" className="fz-btn fz-btn--p fz-btn--sm" onClick={() => (setAu({ ...au0, m: "up" }), go({ p: "acct" }))}>{L(TA.invBtn)}</button>
                    <button
                        type="button"
                        className="fz-link"
                        onClick={() => {
                            setInvOff(true)
                            lsSet(INV_KEY, Date.now())
                        }}
                    >
                        {L(TA.notNow)}
                    </button>
                </div>
            </div>
        )
    }
    /* My account: name, e-mail, pets, password, log out, a copy of the data, and deleting the account (two steps, with the password) */
    const acctPage = (
        <section className="fz-sec fz-pf fz-ac-sec">
            <div className="fz-wrap">
                {acMsg && !acct && <p className="fz-ac-msg" role="status">{acMsg}</p>}
                {!acct || au.m === "reset" ? (
                    authBox()
                ) : (
                    <div className="fz-ac">
                        <h1 className="fz-h2">{L(TA.myAcct)}</h1>
                        {verMsg && <p className="fz-ac-msg" role="status">{verMsg}</p>}
                        <div className="fz-ac-card">
                            {acct.nm && (
                                <div className="fz-ac-row">
                                    <span className="fz-lbl">{L(TA.nm)}</span>
                                    <b>{acct.nm}</b>
                                </div>
                            )}
                            <div className="fz-ac-row">
                                <span className="fz-lbl">{L(TA.em)}</span>
                                <b>{acct.em}</b>
                                <em className={acct.ver ? "" : "is-no"}>{L(acct.ver ? TA.verYes : TA.verNo)}</em>
                                {!acct.ver && (verMsg ? null : <button type="button" className="fz-link fz-ac-again" onClick={resendVer}>{L(TA.verAgain)}</button>)}
                            </div>
                            <div className="fz-ac-row">
                                <span className="fz-lbl">{L(TA.pets)}</span>
                                <b>{ps && ps.pets.length ? petNames(ps) : L(TA.noPets)}</b>
                            </div>
                            <p className={"fz-ac-ok" + (syncSt === "off" ? " is-off" : "")} role="status">
                                {syncSt === "off" ? L(TA.syncOff) : syncSt === "busy" ? L(TA.saving) : <>{okIco}{L(TA.allSaved)}</>}
                            </p>
                            {acMsg && <p className="fz-ac-msg" role="status">{acMsg}</p>}
                            {cpw ? (
                                <form className="fz-ac-sub" onSubmit={(e) => (e.preventDefault(), !cpw.busy && doChPw())} noValidate>
                                    <label className="fz-lbl" htmlFor="fz-ac-cur">{L(TA.curPw)}</label>
                                    {pwIn("fz-ac-cur", cpw.cur, (s) => setCpw({ ...cpw, cur: s, err: "" }), "current-password", false)}
                                    <label className="fz-lbl fz-ac-l2" htmlFor="fz-ac-nw">{L(TA.newPw)}</label>
                                    {pwIn("fz-ac-nw", cpw.nw, (s) => setCpw({ ...cpw, nw: s, err: "" }), "new-password", false)}
                                    <p className="fz-ac-s">{L(TA.pwMin)}</p>
                                    {cpw.err && <p className="fz-ac-msg is-err" role="alert">{cpw.err}</p>}
                                    <div className="fz-ac-two">
                                        <button type="submit" className="fz-btn fz-btn--p" disabled={cpw.busy}>{L(TA.save)}</button>
                                        <button type="button" className="fz-link" onClick={() => setCpw(null)}>{L(TA.cancel)}</button>
                                    </div>
                                </form>
                            ) : (
                                <div className="fz-ac-two">
                                    <button type="button" className="fz-btn fz-btn--g" onClick={() => (setAcMsg(""), setCpw({ cur: "", nw: "", busy: false, err: "" }))}>{L(TA.chPw)}</button>
                                    <button type="button" className="fz-btn fz-btn--g" onClick={doOut}>{L(TA.out)}</button>
                                </div>
                            )}
                            <p className="fz-ac-s">{L(TA.outNote)}</p>
                            {ps && ps.pets.length > 0 && (
                                <p className="fz-ac-exp">
                                    <button type="button" className="fz-link" onClick={expCopy} disabled={expBusy}>{expBusy ? L(T.ptBusy) : L(TA.expAcct)}</button>
                                </p>
                            )}
                        </div>
                        <p className="fz-ac-dl">
                            <button type="button" className="fz-link" aria-expanded={!!delQ} onClick={() => setDelQ(delQ ? null : { pw: "", busy: false, err: "" })}>{L(TA.delL)}</button>
                        </p>
                        {delQ && (
                            <form className="fz-ac-card fz-ac-del" onSubmit={(e) => (e.preventDefault(), !delQ.busy && delQ.pw && doDel())} noValidate>
                                <p>{L(TA.delP)}</p>
                                {pwIn("fz-ac-delpw", delQ.pw, (s) => setDelQ({ ...delQ, pw: s, err: "" }), "current-password", false)}
                                {delQ.err && <p className="fz-ac-msg is-err" role="alert">{delQ.err}</p>}
                                <div className="fz-ac-two">
                                    <button type="submit" className="fz-btn fz-pf-del" disabled={delQ.busy || !delQ.pw}>{L(TA.delBtn)}</button>
                                    <button type="button" className="fz-link" onClick={() => setDelQ(null)}>{L(TA.cancel)}</button>
                                </div>
                            </form>
                        )}
                    </div>
                )}
            </div>
        </section>
    )
    const needAuth = ACCT && !acct && !guest && !(ps && ps.pets.length)

    /* Privacy policy: what the account keeps, where and why (Firebase: Authentication and Firestore in Frankfurt; Vercel serves the site) */
    const privPage = (
        <section className="fz-sec fz-pf fz-ac-sec">
            <div className="fz-wrap fz-priv">
                <h1 className="fz-h2">{L(TA.privacy)}</h1>
                {lang === "hr" ? (
                    <>
                        <p className="fz-priv-d">Vrijedi od {PRIV_DATE.hr}.</p>
                        <h2>Tko je odgovoran</h2>
                        <p>
                            Freshy's, {PRIV_WHO}. Pitanja o podacima: <a className="fz-link" href={"mailto:" + PRIV_MAIL}>{PRIV_MAIL}</a>.
                        </p>
                        <h2>Bez računa</h2>
                        <p>Ljubimci, zapisi i slike spremaju se samo u tvom pregledniku, na tom uređaju. Ništa od toga ne šaljemo nikamo.</p>
                        <h2>S računom</h2>
                        <p>
                            Spremamo tvoj e-mail, ime ako ga upišeš i sve što upišeš u Moji ljubimci: ljubimce, zapise i slike. Lozinku sprema Google samo kao šifrirani zapis. Mi je ne vidimo i ne spremamo.
                        </p>
                        <h2>Zašto</h2>
                        <p>
                            Da se možeš prijaviti i da su ti ljubimci na svakom tvom uređaju. E-mail koristimo samo za prijavu, potvrdu adrese i novu lozinku. Ne šaljemo reklame i ne prodajemo podatke. Pravna osnova je pružanje usluge koju koristiš (čl. 6. st. 1. t. b) Opće uredbe o zaštiti podataka).
                        </p>
                        <h2>Gdje su podaci</h2>
                        <p>
                            Račune i podatke za nas čuva Google, u usluzi Firebase: prijava je u Firebase Authentication, a ljubimci, zapisi i slike u bazi Cloud Firestore na poslužitelju u Frankfurtu. Google podatke obrađuje po našem nalogu. Dio podataka može obrađivati i izvan Europske unije, uz zaštitu koju propisuje EU. Stranicu poslužuje Vercel, koji kao svaki poslužitelj prima tehničke podatke o posjetu, na primjer IP adresu.
                        </p>
                        <h2>Koliko dugo</h2>
                        <p>Dok imaš račun. Kad ga izbrišeš (Moj račun, Izbriši račun i sve podatke), brišemo račun, ljubimce, zapise i slike.</p>
                        <h2>Tvoja prava</h2>
                        <p>
                            Možeš vidjeti, ispraviti i izbrisati svoje podatke, preuzeti kopiju (Moj račun, Preuzmi kopiju svojih podataka) i uložiti prigovor. Ako misliš da podatke obrađujemo protivno propisima, možeš se obratiti Agenciji za zaštitu osobnih podataka (azop.hr).
                        </p>
                        <h2>Kolačići</h2>
                        <p>Ne koristimo kolačiće. Prijava i ljubimci pamte se u spremištu preglednika (localStorage i IndexedDB) na tvom uređaju.</p>
                    </>
                ) : (
                    <>
                        <p className="fz-priv-d">In effect from {PRIV_DATE.en}.</p>
                        <h2>Who is responsible</h2>
                        <p>
                            Freshy's, {PRIV_WHO}. Questions about your data: <a className="fz-link" href={"mailto:" + PRIV_MAIL}>{PRIV_MAIL}</a>.
                        </p>
                        <h2>Without an account</h2>
                        <p>Pets, entries and photos are saved only in your browser, on that device. None of it is sent anywhere.</p>
                        <h2>With an account</h2>
                        <p>We keep your e-mail, your name if you type it, and everything you add in My pets: pets, entries and photos. Google keeps your password only in encrypted form. We never see it or store it.</p>
                        <h2>Why</h2>
                        <p>
                            So you can log in and have your pets on all your devices. We use your e-mail only to log you in, to confirm the address and to send a new password. We don't send ads and don't sell data. The legal basis is providing the service you use (Art. 6(1)(b) of the General Data Protection Regulation).
                        </p>
                        <h2>Where the data is</h2>
                        <p>
                            Google keeps accounts and data for us, in Firebase: log-in in Firebase Authentication, and pets, entries and photos in a Cloud Firestore database on a server in Frankfurt. Google processes the data on our behalf. Some data may be processed outside the European Union, with the safeguards EU law requires. The site is served by Vercel, which, like any server, receives technical data about a visit, such as the IP address.
                        </p>
                        <h2>How long</h2>
                        <p>As long as you have an account. When you delete it (My account, Delete account and all data), we delete the account, pets, entries and photos.</p>
                        <h2>Your rights</h2>
                        <p>
                            You can see, correct and delete your data, download a copy (My account, Download a copy of your data) and object. If you think we process data against the rules, you can contact the Croatian data protection authority (azop.hr).
                        </p>
                        <h2>Cookies</h2>
                        <p>We don't use cookies. Your log-in and pets are kept in the browser's storage (localStorage and IndexedDB) on your device.</p>
                    </>
                )}
            </div>
        </section>
    )

    /* Escape closes the photo first, then the form; the ref always holds the latest state */
    const escRef = useRef<() => void>(() => {})
    escRef.current = () => {
        if (lb) setLb(null)
        else if (vpk) setVpk(null)
        else if (ef) closeEnt()
        else if (rmId) setRmId("")
        else if (mdf) closeMed()
    }
    useEffect(() => {
        if (typeof window === "undefined") return
        const k = (e: KeyboardEvent) => {
            if (e.key === "Escape") escRef.current()
        }
        window.addEventListener("keydown", k)
        return () => window.removeEventListener("keydown", k)
    }, [])
    useEffect(() => {
        if (!ef || typeof document === "undefined") return
        const el = document.getElementById("fz-pt-dlg-h")
        if (el) el.focus({ preventScroll: true } as FocusOptions)
    }, [ef ? ef.id : ""])
    useEffect(() => {
        if (!vpk || typeof document === "undefined") return
        const el = document.getElementById(vpk.own ? "fz-pt-vn" : "fz-pt-vq")
        if (el) el.focus({ preventScroll: true } as FocusOptions)
    }, [vpk ? (vpk.own ? "own" : "find") : ""])
    /* on a phone the sections are a row that scrolls sideways: keep the open one in view */
    useEffect(() => {
        if (typeof document === "undefined") return
        const el = document.getElementById("fz-px-n-" + pv)
        const nav = el ? el.parentElement : null
        if (!el || !nav || nav.scrollWidth <= nav.clientWidth) return
        const nb = nav.getBoundingClientRect(),
            eb = el.getBoundingClientRect()
        if (eb.left < nb.left || eb.right > nb.right - 36) nav.scrollLeft += eb.left - nb.left - 16
    }, [pv])
    useEffect(() => {
        if (!rmId || typeof document === "undefined") return
        const el = document.getElementById("fz-px-rmy")
        if (el) el.focus({ preventScroll: true } as FocusOptions)
    }, [rmId])
    useEffect(() => {
        if (!mdf || typeof document === "undefined") return
        const el = document.getElementById("fz-px-mdn")
        if (el) el.focus()
    }, [mdf ? mdf.id : ""])
    useEffect(() => {
        if (!lb || typeof document === "undefined") return
        const el = document.getElementById("fz-pt-lbx")
        if (el) el.focus({ preventScroll: true } as FocusOptions)
    }, [lb])

    /* ---------- my pets: words ---------- */

    const spOf = (p: Pet) => p.sp
    const yourPet = (p: Pet) => pfNm(p) || L(T.ptYour[spOf(p)])
    const sexTxt = (p: Pet) => L(p.sp === 1 ? T.ptCatSex[p.sex] : T.pfSexes[p.sex]).toLowerCase()
    const ageTxtOf = (p: Prof) => {
        const m = monthsOf(p, NOW)
        return m !== null ? (m < 24 ? Math.max(0, m) + " " + L(T.pfMonthsW) : Math.floor(m / 12) + " " + L(T.pfYearsW)) : L(T.pfAges[ageGrpOf(p, NOW)])
    }
    const breedTxtOf = (p: Pet) => {
        if (p.sp === 2) return p.kind.trim() || null
        if (p.sp === 1) return null
        const b1 = bById(p.b1)
        return p.bk === 0 && b1 ? bName(b1) : p.bk === 1 ? L(T.pfMixed) + (b1 ? " · " + bName(b1) + (bById(p.b2) ? " × " + bName(bById(p.b2) as Breed) : "") : "") : null
    }
    const bodyTxt = (p: Pet, b: number) => L(T.pfBodies[b][p.sex]).toLowerCase()
    const tagsOf = (p: Pet) =>
        [
            p.sp === 2 ? null : sexTxt(p) + (ageGrpOf(p, NOW) === 2 ? ", " + L(T.pfNeutS[p.neut ? 0 : 1][p.sex]) : ""),
            p.sp === 2 ? sexTxt(p) : null,
            ageTxtOf(p),
            breedTxtOf(p),
            wFmt(p.kg) + (p.sp !== 2 ? ", " + bodyTxt(p, p.body) : ""),
            p.sp === 0 && ageGrpOf(p, NOW) === 2 ? L(T.acts[p.act]).toLowerCase() : null,
        ].filter(Boolean) as string[]
    const firstLine = (s?: string) => (s || "").split(/\n/)[0].slice(0, 70)
    const entTitle = (p: Pet, e: Ent) => {
        const ty = L(T.ptTy[e.t])
        if (e.t === "start") return L(T.ptStartT)
        if (e.t === "w") return ty + ": " + wFmt(e.kg || 0)
        if (e.t === "b") return ty + ": " + (typeof e.body === "number" ? bodyTxt(p, e.body) : "")
        if (e.t === "inj" || e.t === "ill" || e.t === "par") return e.ti || ty
        if (e.t === "note") return firstLine(e.tx) || ty
        return ty + (e.ti ? ": " + e.ti : "")
    }
    const entSub = (p: Pet, e: Ent) => {
        const nxT = e.nx ? L(T.ptNxL[e.t] || T.ptNxL.vet) + " " + dTxt(e.nx, lang, NOW) : ""
        const rest = e.t === "note" ? (e.tx || "").split(/\n/).slice(1).join(" ").trim() || ((e.tx || "").length > 70 ? (e.tx || "").slice(70) : "") : e.tx || ""
        const parts = [
            e.t === "start" ? wFmt(e.kg || p.kg) + (typeof e.body === "number" && p.sp !== 2 ? ", " + bodyTxt(p, e.body) : "") : "",
            e.t === "w" && typeof e.body === "number" ? L(T.ptBody) + ": " + bodyTxt(p, e.body) : "",
            e.t === "vet" && e.kg ? wFmt(e.kg) + " " + L(T.ptOnScale) : "",
            e.t === "b" && e.tx ? qt(e.tx) : e.t === "b" ? "" : rest,
            ps && ps.vi && ps.vi.some((x) => x.ent === e.id) ? L(T.pvInsIn) : "",
            nxT,
        ]
        return parts.filter(Boolean).join(" · ")
    }
    const stChip = (e: Ent) =>
        e.t === "inj" ? <span className={"fz-pt-chip c-" + (e.st === 2 ? "g" : "o")}>{L(T.ptInjSt[e.st || 0])}</span> : e.t === "ill" ? <span className={"fz-pt-chip c-" + (e.st === 2 ? "g" : "r")}>{L(T.ptIllSt[e.st === 2 ? 1 : 0])}</span> : null
    const upTitle = (u: Up) =>
        u.t === "vac"
            ? L(T.ptUpT.vac) + (u.ti ? ": " + u.ti : "")
            : u.t === "par"
              ? u.ti || L(T.ptUpT.par)
              : u.t === "vet"
                ? L(T.ptUpT.vet) + (u.ti ? ": " + u.ti : "")
                : u.t === "med"
                  ? L(T.ptUpT.med) + (u.ti ? ": " + u.ti : "")
                  : L(T.ptUpT.ctl) + (u.ti ? ": " + u.ti : "")
    const relDay = (s: string) => {
        const n = daysTo(s, NOW)
        if (n === 0) return L(T.ptTodayW)
        if (n === 1) return L(T.ptTomorrow)
        if (n > 1 && n <= 60) return lang === "en" ? "in " + n + " days" : "za " + n + " " + plHr(n, ["dan", "dana", "dana"])
        if (n > 60 && n < 350) {
            const mo = Math.round(n / 30.44)
            return lang === "en" ? "in " + mo + " months" : "za " + mo + " " + plHr(mo, ["mjesec", "mjeseca", "mjeseci"])
        }
        if (n >= 350) {
            const y = Math.max(1, Math.round(n / 365.25))
            return lang === "en" ? (y === 1 ? "in a year" : "in " + y + " years") : y === 1 ? "za godinu dana" : "za " + y + " " + plHr(y, ["godinu", "godine", "godina"])
        }
        if (n < 0) return lang === "en" ? -n + " " + pl(lang, -n, ["day", "days"], ["dan", "dana", "dana"]) + " late" : "kasni " + -n + " " + plHr(-n, ["dan", "dana", "dana"])
        return dTxt(s, lang, NOW, true)
    }
    const calDl = (p: Pet) => {
        if (!ps) return
        const ups = upOf(ps.log, p.id, new Date()).filter((u) => !u.late)
        const today = ymd(new Date())
        const plans = (ps.vz || []).filter((z) => z.pet === p.id && z.d >= today)
        if (!ups.length && !plans.length && !p.mc) return
        const who = pfNm(p) ? pfNm(p) + ": " : ""
        const ask = who + L(T.ptSoonCal)
        const n = ps.rem
        const early = n === 1 ? L(T.ptRemTom) : lang === "en" ? "In " + n + " days: " : "Za " + n + " dana: "
        saveFile(
            "freshys-" + (lang === "hr" ? "podsjetnici" : "reminders") + ".ics",
            icsOf(
                [
                    ...ups.map((u) => ({ id: u.id, d: u.d, t: who + upTi(u), q: ["vet", "inj", "ill", "vac"].includes(u.t) ? ask : undefined })),
                    ...plans.map((z) => ({ id: z.id, d: z.d, t: who + L(T.ptUpT.vet) + (z.why ? ": " + z.why : ""), q: ask })),
                ],
                n,
                early,
                p.mc ? [{ id: p.id, t: who + L(T.ptMcCal) }] : []
            ),
            "text/calendar"
        )
    }
    const setRem = (n: number) => {
        if (ps && ps.rem !== n) commit({ ...ps, rem: n })
    }
    /* one line about an entry, the same in the summary and in emails to the clinic */
    const entLine = (p: Pet, e: Ent) =>
        L(T.ptTy[e.t]) +
        ": " +
        entTitle(p, e).replace(L(T.ptTy[e.t]) + ": ", "") +
        (entSub(p, e) ? " · " + entSub(p, e) : "") +
        (e.t === "inj" ? " · " + L(T.ptInjSt[e.st || 0]) : e.t === "ill" ? " · " + L(T.ptIllSt[e.st === 2 ? 1 : 0]) : "")
    /* "Book a visit": an email written from the pet's notes; the owner reads it, changes it and sends it */
    const bookHref = (p: Pet, reason: string) => {
        if (!ps) return "#"
        const nm = pfNm(p) || L(T.ptYour[p.sp])
        const pts = wPts(ps.log, p.id)
        const since = addMonths(ymd(NOW), -6)
        const rec: string[] = []
        if (pts.length > 1) rec.push("- " + L(T.ptW) + ": " + wFmt(pts[0].kg) + " (" + dTxt(pts[0].d, lang, NOW, true) + ") → " + wFmt(pts[pts.length - 1].kg) + " (" + dTxt(pts[pts.length - 1].d, lang, NOW, true) + ")")
        ps.log
            .filter((e) => e.pet === p.id && ["inj", "ill", "vet", "med"].includes(e.t) && e.d >= since)
            .sort((a, b) => -byT(a, b))
            .slice(0, 4)
            .forEach((e) => rec.push("- " + dTxt(e.d, lang, NOW, true) + " " + entLine(p, e)))
        const latest = new Map<string, Ent>()
        ps.log.filter((e) => e.pet === p.id && (e.t === "vac" || e.t === "par")).sort(byT).forEach((e) => latest.set(e.t + "|" + (e.ti || "").trim().toLowerCase(), e))
        Array.from(latest.values())
            .sort((a, b) => -byT(a, b))
            .slice(0, 3)
            .forEach((e) => rec.push("- " + dTxt(e.d, lang, NOW, true) + " " + entLine(p, e)))
        const lines = [
            L(T.ptBookHi),
            "",
            L(T.ptBookPet) + ": " + [nm, L(T.ptSpN[p.sp]), sexTxt(p) + (p.sp !== 2 ? ", " + L(T.pfNeutS[p.neut ? 0 : 1][p.sex]) : ""), ageTxtOf(p), wFmt(p.kg)].filter(Boolean).join(" · "),
            L(T.ptBookWhy) + ": " + reason,
            L(T.ptBookWhen) + ": ",
            ...(rec.length ? ["", L(T.ptBookRec) + ":", ...rec] : []),
            "",
            L(T.ptVetFoot),
        ]
        return "mailto:" + (isMail(p.vm) ? p.vm : "") + "?subject=" + encodeURIComponent(nm + L(T.ptBookSubj)) + "&body=" + encodeURIComponent(lines.join("\n"))
    }
    const vetLead = (p: Pet) => L(T.ptVetLead[0]) + (pfNm(p) || L(T.ptYour[p.sp]).toLowerCase()) + L(T.ptVetLead[1])
    /* clinic picker */
    const openVpk = (p: Pet) => {
        setVpk({ q: "", more: false, own: false, n: p.vn, a: p.va, t: p.vt, e: p.vm, oe: "" })
        if (vrows) return
        setVload("busy")
        loadClinics()
            .then((r) => {
                setVrows(r)
                setVload("")
            })
            .catch(() => setVload("err"))
    }
    const vpkSet = (x: Partial<VPick>) => setVpk((v) => (v ? { ...v, ...x } : v))
    const vpkPick = (c: Clinic) => {
        if (!prof) return
        saveProf({ ...prof, vn: c.n, va: c.a, vt: c.t, vm: c.e || (prof.vn ? "" : prof.vm) })
        setVpk(null)
    }
    const vpkSaveOwn = () => {
        if (!prof || !vpk) return
        if (!vpk.n.trim()) {
            vpkSet({ oe: L(T.ptVetNeedN) })
            return
        }
        saveProf({ ...prof, vn: vpk.n.trim().slice(0, 120), va: vpk.a.trim().slice(0, 160), vt: vpk.t.trim().slice(0, 40), vm: vpk.e.trim().slice(0, 120) })
        setVpk(null)
    }
    const bodyIco = (b: number, sp: number, s = 30) => <span className="fz-pt-bico">{bodySvg(b, sp === 1, s)}</span>
    const icoBox = (e: Ent | string, p?: Pet) => {
        const t = typeof e === "string" ? e : e.t
        if (t === "b" && typeof e !== "string" && typeof e.body === "number" && p) return <span className={"fz-pt-ic c-" + (e.body === 1 ? "g" : e.body === 0 ? "n" : "o")}>{bodySvg(e.body, p.sp === 1, 16)}</span>
        return <span className={"fz-pt-ic c-" + (PT_C[t] || "n")}>{ptIco(t)}</span>
    }

    /* ---------- my pets: cards ---------- */

    const wCard = (p: Pet, big: boolean) => {
        const pts = ps ? wPts(ps.log, p.id) : []
        const last = pts[pts.length - 1],
            first = pts[0]
        const goal = goalOf(p, NOW)
        const pace = paceOf(pts)
        const adult = ageGrpOf(p, NOW) === 2
        const cls = goal > 0 && pace && pace.pct > 0 ? paceCls(p.sp, pace.pct) : -1
        const proj = goal > 0 && pace && last ? projOf(last, pace.wk, goal) : null
        const dlt = first && last && first.d !== last.d ? Math.round((last.kg - first.kg) * 1000) / 1000 : null
        const label =
            L(T.ptW) +
            ": " +
            pts
                .slice(-12)
                .map((x) => dTxt(x.d, lang, NOW) + " " + wFmt(x.kg))
                .join(", ") +
            (goal ? ". " + L(T.ptGoal) + " " + wFmt(goal) + "." : "")
        return (
            <section className={"fz-pt-card" + (big ? " fz-pt-w2" : "")} aria-labelledby={"fz-pt-wh" + (big ? "" : "s")}>
                <div className="fz-pt-kh">
                    <h3 className="fz-pt-k" id={"fz-pt-wh" + (big ? "" : "s")}>
                        {L(T.ptW)}
                    </h3>
                    <button type="button" className="fz-link" onClick={() => openEnt("w")}>
                        {L(T.ptWAdd)}
                    </button>
                </div>
                <div className="fz-pt-wt">
                    <div className="fz-pt-big">
                        {p.kg < 1 ? nf(Math.round(p.kg * 1000), lang) : kgN(Math.round(p.kg * 10) / 10)}
                        <small>{p.kg < 1 ? "g" : "kg"}</small>
                    </div>
                    <div className="fz-pt-chips">
                        {dlt !== null && Math.abs(dlt) >= 0.05 && (
                            <span className={"fz-pt-chip c-" + (goal > 0 ? (dlt < 0 ? "g" : "o") : "n")}>
                                {(dlt < 0 ? "−" : "+") + wFmt(Math.abs(dlt))} {L(T.ptSince)} {dTxt(first.d, lang, NOW)}
                            </span>
                        )}
                        {isPlus && goal > 0 && pace && (
                            <span className={"fz-pt-chip c-" + (pace.pct <= 0 ? "o" : cls === 1 ? "g" : cls === 2 ? "r" : "o")}>
                                {pace.pct <= 0 ? L(T.ptNoDrop) : nf(pace.pct, lang, 1) + " % " + L(T.ptWk) + (cls >= 0 ? " · " + L(T.ptPace[cls]) : "")}
                            </span>
                        )}
                    </div>
                </div>
                {goal > 0 ? (
                    <p className="fz-pt-goal">
                        {L(T.ptGoal)} <b>{wFmt(goal)}</b>
                        {last && last.kg > goal && (lang === "en" ? " · " + wFmt(Math.round((last.kg - goal) * 1000) / 1000) + " to go" : " · još " + wFmt(Math.round((last.kg - goal) * 1000) / 1000))}
                        {isPlus && proj && (
                            <>
                                {" · " + (lang === "en" ? "at this pace " : "ovim tempom stiže ")}
                                <b>{(lang === "en" ? "by " : "") + whenTxt(proj, lang, NOW)}</b>
                            </>
                        )}
                    </p>
                ) : !adult && p.sp !== 2 ? (
                    <p className="fz-pt-goal">{L(T.ptGrow)}</p>
                ) : null}
                {isPlus ? (
                    <WChart pts={pts} goal={goal} proj={proj} lang={lang} now={NOW} label={label} goalTxt={L(T.ptGoalL) + " " + wFmt(goal)} projTxt={proj ? whenTxt(proj, lang, NOW) : ""} h={big ? 240 : 200} />
                ) : LIVE ? null : (
                    <p className="fz-pt-plusl">
                        {plusSeal("fz-sealw")}
                        <span>{L(T.plusCurve)}</span>
                        <button type="button" className="fz-link" onClick={goPlus}>
                            {L(T.plusTeaseB)}
                        </button>
                    </p>
                )}
                {pts.some((x) => x.v) && (
                    <p className="fz-pt-leg">
                        <i aria-hidden="true" />
                        {L(T.ptAtVet)}
                    </p>
                )}
                {isPlus && pts.length === 1 && <p className="fz-hint">{L(T.ptOneW)}</p>}
                {isPlus && goal > 0 && pace && (pace.pct <= 0 || cls !== 1) && <p className={"fz-hint" + (cls === 2 ? " fz-hint--w" : "")}>{L(pace.pct <= 0 ? T.ptFlat : cls === 2 ? T.ptFast : T.ptSlow)}</p>}
                {p.body === 0 && p.sp !== 2 && <p className="fz-hint fz-hint--w">{L(T.pfThin)}</p>}
                <div className="fz-pt-ft">
                    {isPlus && goal > 0 && p.sp < 2 ? (
                        <p>
                            {L(T.ptPaceSrc[p.sp])}{" "}
                            <a className="fz-link" href={AAHA_WM_URL} target="_blank" rel="noopener noreferrer">
                                {L(T.ptAahaWm)}
                            </a>
                        </p>
                    ) : (
                        <span />
                    )}
                    {last && (
                        <p>
                            {pts.length} {pl(lang, pts.length, ["weigh-in", "weigh-ins"], ["vaganje", "vaganja", "vaganja"])} · {L(T.ptLastW)} {dTxt(last.d, lang, NOW)}
                        </p>
                    )}
                </div>
            </section>
        )
    }
    const bodyCard = (p: Pet) => {
        const lb = ps ? lastBody(ps.log, p.id) : undefined
        const pics = ps
            ? ps.log
                  .filter((e) => e.pet === p.id && (e.t === "b" || e.t === "w" || e.t === "start") && e.ph && e.ph.length)
                  .sort(byT)
                  .flatMap((e) => (e.ph || []).map((id) => ({ id, d: e.d, e })))
                  .slice(-3)
            : []
        const adult = ageGrpOf(p, NOW) === 2
        return (
            <section className="fz-pt-card" aria-labelledby="fz-pt-bh">
                <div className="fz-pt-kh">
                    <h3 className="fz-pt-k" id="fz-pt-bh">
                        {L(T.ptBody)}
                    </h3>
                    <button type="button" className="fz-link" onClick={() => openEnt("b")}>
                        {L(T.ptCheck)}
                    </button>
                </div>
                <div className="fz-pt-bs" role="img" aria-label={L(T.ptBody) + ": " + bodyTxt(p, p.body)}>
                    {[0, 1, 2, 3].map((i) => (
                        <span key={i} className={"fz-pt-b" + (i === p.body ? " on b" + i : "")}>
                            {bodySvg(i, p.sp === 1, 30)}
                            <small>{L(T.pfBodies[i][p.sex])}</small>
                        </span>
                    ))}
                </div>
                {lb && (
                    <p className="fz-pt-d">
                        {dTxt(lb.d, lang, NOW)}: {bodyTxt(p, lb.body as number)}.{lb.tx && lb.t === "b" ? <i> {qt(lb.tx)}</i> : null}
                    </p>
                )}
                {!adult && p.body >= 2 && <p className="fz-hint fz-hint--w">{L(T.pfPupFat)}</p>}
                <p className="fz-hint">{L(T.ptBodyHint)}</p>
                <div className="fz-pt-kh" style={{ marginTop: 18 }}>
                    <h4 className="fz-pt-k">{L(T.ptPics)}</h4>
                    <button type="button" className="fz-link" onClick={() => openEnt("b")}>
                        {L(T.ptPicAdd)}
                    </button>
                </div>
                {pics.length ? (
                    <div className="fz-pt-pics">
                        {pics.map((x) => (
                            <button key={x.id} type="button" className="fz-pt-pic" onClick={() => setLb(x.id)}>
                                <PhImg id={x.id} alt={L(T.ptPics) + ", " + dTxt(x.d, lang, NOW)} />
                                <small>{dTxt(x.d, lang, NOW)}</small>
                            </button>
                        ))}
                    </div>
                ) : (
                    <p className="fz-hint">{L(T.ptPicHint)}</p>
                )}
            </section>
        )
    }
    const foodCard = (p: Pet) => {
        if (p.health > 0)
            return (
                <section className="fz-pt-card">
                    <h3 className="fz-pt-k">{L(T.ptFood)}</h3>
                    <p className="fz-pt-d" style={{ marginTop: 12 }}>
                        {L(p.health === 2 ? T.pfPreg : T.pfIll)} {L(T.ptSwitchVet)}
                    </p>
                </section>
            )
        const d = dogOf(p, NOW)
        const [lo, hi] = kcalRange(d)
        const kc = parseFloat(p.kc100.replace(",", "."))
        const kcOk = kc >= 20 && kc <= 900
        const gLo = kcOk ? rG(lo / (kc / 100)) : 0,
            gHi = kcOk ? rG(hi / (kc / 100)) : 0
        const gNow = +p.gday || 0
        return (
            <section className="fz-pt-card" aria-labelledby="fz-pt-fh">
                <div className="fz-pt-kh">
                    <h3 className="fz-pt-k" id="fz-pt-fh">
                        {L(T.ptFood)}
                    </h3>
                    <button type="button" className="fz-link" onClick={() => setPmode("edit")}>
                        {L(T.ptChange)}
                    </button>
                </div>
                <div className="fz-pt-mid">
                    {nf(rK(lo), lang)}
                    {rK(hi) > rK(lo) ? "–" + nf(rK(hi), lang) : ""}
                    <small>kcal</small>
                </div>
                <p className="fz-pt-d">{d.lose ? L(T.ptLoseAs) + " " + wFmt(targetOf(p)) + " (AAHA). " + L(T.pfLoseVet) : L(T.pfMaint)}</p>
                {kcOk && (
                    <div className="fz-pt-food">
                        <span className="fz-pt-k">
                            {L(T.pfFoodNow)} · {nf(kc, lang, kc % 1 ? 1 : 0)} {L(T.per100)}
                        </span>
                        <div className="fz-pt-mid" style={{ fontSize: 30 }}>
                            {nf(gLo, lang)}
                            {gHi > gLo ? "–" + nf(gHi, lang) : ""}
                            <small>{L(T.pfGrams)}</small>
                        </div>
                        {gNow > 0 && (
                            <p className="fz-pt-d">
                                {L(T.pfNowGive)} {nf(gNow, lang)} g. {gNow > gHi * 1.05 ? nf(gNow - gHi, lang) + " g " + L(T.pfMore) + "." : gNow < gLo * 0.95 ? nf(gLo - gNow, lang) + " g " + L(T.pfLess) + "." : L(T.pfFits)}
                            </p>
                        )}
                    </div>
                )}
                {p.treats > 0 && (
                    <p className="fz-pt-d" style={{ marginTop: 12 }}>
                        {L(T.ptTreatsTo)} {nf(Math.max(5, fl5(lo * 0.1)), lang)} kcal {L(T.ptADay)}.
                    </p>
                )}
                <p className="fz-pt-d" style={{ marginTop: 12 }}>
                    {L(T.ptSwitch)}{" "}
                    <a className="fz-link" href={AAHA_SWITCH_URL} target="_blank" rel="noopener noreferrer">
                        {L(T.ptSwitchSrc)}
                    </a>
                </p>
                <button
                    type="button"
                    className="fz-btn fz-btn--p fz-btn--sm"
                    style={{ marginTop: 16 }}
                    onClick={() => {
                        setDog(dogOf(p, new Date()))
                        go({ p: "recipes" })
                    }}
                >
                    {L(T.pfSeeRec)}
                </button>
            </section>
        )
    }
    const ckCard = (p: Pet, narrow = false) => {
        if (!ps) return null
        const today = ymd(NOW)
        const c = ps.ck.find((x) => x.pet === p.id && x.d === today)
        const wk = ckDays(ps.ck, p.id, NOW, 7)
        const bad = CK_K.map((k, ki) => wk.filter((x) => x.c && ckLvl(ki, x.c[k]) > 0).map((x) => x.d))
        const answered = wk.filter((x) => x.c).length
        const n = pfNm(p)
        return (
            <section className={"fz-pt-card fz-pt-ck" + (narrow ? " fz-pt-ck--n" : "")} aria-labelledby="fz-pt-ckh">
                <div className="fz-pt-kh">
                    <div>
                        <span className="fz-pt-k">{(lang === "en" ? DOW_EN : DOW_HR)[NOW.getDay()] + ", " + dTxt(today, lang, NOW)}</span>
                        <h3 className="fz-pt-ckq" id="fz-pt-ckh">
                            {lang === "en" ? (n ? `How is ${n} today?` : "How are things today?") : n ? `Kako je ${n} danas?` : "Kako je danas?"}
                        </h3>
                    </div>
                    <span className="fz-pt-k fz-pt-k7">{L(T.ptLast7)}</span>
                </div>
                <div className="fz-pt-ckg">
                    {CK_K.map((k, ki) => (
                        <div className="fz-pt-ckr" key={k}>
                            <span className="fz-pt-ckl" id={"fz-pt-ck" + k}>
                                {L(T.ptCkK[ki])}
                            </span>
                            <div className="fz-seg fz-pt-seg" role="group" aria-labelledby={"fz-pt-ck" + k}>
                                {T.ptCkV[ki].map((o, vi) => (
                                    <button key={vi} type="button" aria-pressed={!!c && c[k] === vi} onClick={() => setCk(k, vi)}>
                                        {L(o)}
                                    </button>
                                ))}
                            </div>
                            <span className="fz-pt-dots" role="img" aria-label={L(T.ptCkK[ki]) + ", " + L(T.ptLast7) + ": " + wk.map((x) => dTxt(x.d, lang, NOW) + " " + (x.c && x.c[k] >= 0 ? L(T.ptCkV[ki][x.c[k]]) : "–")).join(", ")}>
                                {wk.map((x, i) => (
                                    <i key={i} className={"l" + (x.c ? ckLvl(ki, x.c[k]) : -1) + (i === 6 ? " t" : "")} />
                                ))}
                            </span>
                        </div>
                    ))}
                </div>
                <p className="fz-hint">
                    {c ? L(T.ptSavedAt) + " " + new Date(c.at).toTimeString().slice(0, 5) + ". " : ""}
                    {bad.some((x) => x.length)
                        ? CK_K.map((_, ki) => (bad[ki].length ? L(T.ptCkBad[ki]) + ": " + dList(bad[ki], lang, NOW).replace(/\.?$/, ".") + " " : "")).join("")
                        : answered >= 3
                          ? L(T.ptCkAll)
                          : L(T.ptCkTap)}
                </p>
                {bad.some((x) => x.length > 0) && <p className="fz-hint">{L(T.ptCkVet)}</p>}
            </section>
        )
    }
    const healthCard = (p: Pet, wide: boolean) => {
        const hs = ps ? ps.log.filter((e) => e.pet === p.id && HEALTH_T.includes(e.t)).sort((a, b) => -byT(a, b)) : []
        const all = ps ? ps.log.filter((e) => e.pet === p.id).length : 0
        return (
            <section className={"fz-pt-card" + (wide ? " fz-pt-w2" : "")} aria-labelledby="fz-pt-hh">
                <div className="fz-pt-kh">
                    <h3 className="fz-pt-k" id="fz-pt-hh">
                        {L(T.ptHealth)}
                    </h3>
                    <button type="button" className="fz-link" onClick={() => setPv("log")}>
                        {L(T.ptAll)} ({all})
                    </button>
                </div>
                {hs.length ? (
                    <ul className="fz-pt-rows">
                        {hs.slice(0, 4).map((e) => (
                            <li key={e.id}>
                                <button type="button" className="fz-pt-row" onClick={() => openEnt(e.t, e)}>
                                    {icoBox(e, p)}
                                    <span className="fz-pt-rb">
                                        <b>{entTitle(p, e)}</b>
                                        {entSub(p, e) && <small>{entSub(p, e)}</small>}
                                        {stChip(e)}
                                    </span>
                                    <span className="fz-pt-when">{dTxt(e.d, lang, NOW)}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <>
                        <p className="fz-pt-d" style={{ marginTop: 12 }}>
                            {L(T.ptNoH)}
                        </p>
                        <button type="button" className="fz-btn fz-btn--g fz-btn--sm" style={{ marginTop: 14 }} onClick={() => openEnt("")}>
                            {ptIco("plus", 17)}
                            {L(T.ptLogB)}
                        </button>
                    </>
                )}
            </section>
        )
    }
    const upCard = (p: Pet) => {
        const plans = vzOf(p).filter((z) => z.d >= ymd(NOW))
        const ups: Up[] = ps ? [...upOf(ps.log, p.id, NOW), ...plans.map((z) => ({ id: z.id, d: z.d, t: "vet", ti: z.why, late: false }))].sort((a, b) => (a.d < b.d ? -1 : a.d > b.d ? 1 : 0)) : []
        return (
            <section className="fz-pt-card" aria-labelledby="fz-pt-uh">
                <div className="fz-pt-kh">
                    <h3 className="fz-pt-k" id="fz-pt-uh">
                        {L(T.ptUp)}
                    </h3>
                    {(ups.some((u) => !u.late) || p.mc) && (
                        <button type="button" className="fz-link" onClick={() => calDl(p)}>
                            {ptIco("cal", 16)}
                            {L(T.ptCal)}
                        </button>
                    )}
                </div>
                {ups.length ? (
                    <ul className="fz-pt-rows">
                        {ups.slice(0, 4).map((u) => {
                            const dd = dOf(u.d)
                            return (
                                <li key={u.id} className="fz-pt-up">
                                    <span className={"fz-pt-date" + (u.late ? " late" : "")} aria-hidden="true">
                                        <b>{dd.getDate()}</b>
                                        <span>{lang === "en" ? MON_EN[dd.getMonth()].slice(0, 3) : MON_HR_S[dd.getMonth()]}</span>
                                    </span>
                                    <span className="fz-pt-rb">
                                        <b>{upTi(u)}</b>
                                        <small className={u.late ? "late" : daysTo(u.d, NOW) <= 7 ? "soon" : ""}>
                                            {dTxt(u.d, lang, NOW, dd.getFullYear() !== NOW.getFullYear())} · {relDay(u.d)}
                                        </small>
                                    </span>
                                    {u.t !== "par" && u.t !== "med" && !plans.some((z) => z.id === u.id) && (
                                        <a className="fz-pt-go" href={bookHref(p, upTitle(u) + " (" + dTxt(u.d, lang, NOW, true) + ")")} aria-label={L(T.ptBook) + ": " + upTitle(u)}>
                                            {L(T.ptBookS)}
                                        </a>
                                    )}
                                </li>
                            )
                        })}
                    </ul>
                ) : (
                    <p className="fz-pt-d" style={{ marginTop: 12 }}>
                        {L(T.ptNoUp)}
                    </p>
                )}
                {(ups.some((u) => !u.late) || p.mc) && (
                    <>
                        <div className="fz-pt-rem">
                            <span>{L(T.ptRemK)}</span>
                            {seg(T.ptRemO, Math.max(0, REM_OPTS.indexOf(ps ? ps.rem : 3)), (i) => setRem(REM_OPTS[i]), T.ptRemK)}
                        </div>
                        <p className="fz-hint">{L(T.ptRemT)}</p>
                    </>
                )}
            </section>
        )
    }
    const idStrip = (p: Pet) => (
        <section className="fz-pt-card fz-pt-w3 fz-pt-strip">
            <span className={"fz-pt-av sp" + p.sp} aria-hidden="true">
                {(pfNm(p)[0] || "?").toUpperCase()}
            </span>
            <div className="fz-pt-sb">
                <b>{yourPet(p)}</b>
                <div className="fz-pf-tags">
                    {tagsOf(p).map((t, i) => (
                        <span key={i} className="fz-tag fz-pt-tag">
                            {t}
                        </span>
                    ))}
                </div>
            </div>
            <button type="button" className="fz-btn fz-btn--g fz-btn--sm" onClick={() => setPmode("edit")}>
                {L(T.ptEditId)}
            </button>
        </section>
    )

    const vetCard = (p: Pet) => (
        <section className="fz-pt-card fz-pt-w2 fz-pt-vc" aria-labelledby="fz-pt-vh">
            <div className="fz-pt-kh">
                <h3 className="fz-pt-k" id="fz-pt-vh">
                    {L(T.ptVetK)}
                </h3>
                {p.vn && (
                    <button type="button" className="fz-link" onClick={() => openVpk(p)}>
                        {L(T.ptVetChg)}
                    </button>
                )}
            </div>
            {p.vn ? (
                <>
                    <div className="fz-pt-clin">
                        <span className="fz-pt-ic c-g">{ptIco("vet", 20)}</span>
                        <div>
                            <b>{p.vn}</b>
                            {p.va && <small>{p.va}</small>}
                            <a className="fz-link fz-pt-gm" href={gmapsOf(p.vn, p.va)} target="_blank" rel="noopener noreferrer">
                                {L(T.ptGoogle)}
                            </a>
                        </div>
                    </div>
                    <div className="fz-pt-vf">
                        <label className="fz-lbl" htmlFor="fz-pt-vce">
                            {L(T.ptVetE)}
                            <input id="fz-pt-vce" className="fz-inp" type="email" inputMode="email" autoComplete="off" maxLength={120} value={p.vm} placeholder={L(T.ptVetIfKnown)} onChange={(e) => saveProf({ ...p, vm: e.target.value.trim() })} />
                        </label>
                        <label className="fz-lbl" htmlFor="fz-pt-vct">
                            {L(T.ptVetT)}
                            <input id="fz-pt-vct" className="fz-inp" type="tel" inputMode="tel" autoComplete="off" maxLength={40} value={p.vt} placeholder={L(T.ptVetIfKnown)} onChange={(e) => saveProf({ ...p, vt: e.target.value })} />
                        </label>
                    </div>
                    <div className="fz-pt-btns">
                        <a className="fz-btn fz-btn--p fz-btn--sm" href={bookHref(p, "")}>
                            {ptIco("mail", 17)}
                            {L(T.ptBook)}
                        </a>
                        {telOf(p.vt) && (
                            <a className="fz-btn fz-btn--g fz-btn--sm" href={"tel:" + telOf(p.vt)}>
                                {ptIco("phone", 16)}
                                {L(T.ptCall)}
                            </a>
                        )}
                        {vetOk && (
                            <button type="button" className="fz-btn fz-btn--g fz-btn--sm" onClick={openVet}>
                                {ptIco("vet", 17)}
                                {L(T.ptSendSum)}
                            </button>
                        )}
                    </div>
                </>
            ) : (
                <>
                    <p className="fz-pt-d" style={{ marginTop: 10 }}>
                        {vetLead(p)}
                    </p>
                    <button type="button" className="fz-btn fz-btn--p fz-btn--sm" style={{ marginTop: 14 }} onClick={() => openVpk(p)}>
                        {ptIco("vet", 17)}
                        {L(T.ptVetPick)}
                    </button>
                </>
            )}
        </section>
    )
    /* monthly check: weigh-in, body shape and a photo this month, ticked from the notes */
    const mcOf = (p: Pet) => {
        const m0 = ymd(NOW).slice(0, 7)
        const es = ps ? ps.log.filter((e) => e.pet === p.id && e.d.slice(0, 7) === m0).sort(byT) : []
        const last = (f: (e: Ent) => boolean) => es.filter(f).pop()
        return [
            last((e) => typeof e.kg === "number" && (e.t === "w" || e.t === "start" || e.t === "vet")),
            last((e) => typeof e.body === "number"),
            last((e) => !!(e.ph && e.ph.length) && (e.t === "b" || e.t === "w" || e.t === "start")),
        ]
    }
    const monthCard = (p: Pet) => {
        const it = mcOf(p)
        const done = it.filter(Boolean).length
        const mon = lang === "en" ? MON_EN[NOW.getMonth()] : MON_HR_N[NOW.getMonth()]
        return (
            <section className="fz-pt-card fz-pt-mc" aria-labelledby="fz-pt-mch">
                <div className="fz-pt-kh">
                    <h3 className="fz-pt-k" id="fz-pt-mch">
                        {L(T.ptMcK)}
                    </h3>
                    <button type="button" role="switch" aria-checked={p.mc} aria-label={L(T.ptMcSw)} className={"fz-pt-sw" + (p.mc ? " on" : "")} onClick={() => saveProf({ ...p, mc: !p.mc })} />
                </div>
                {p.mc ? (
                    <>
                        <p className="fz-pt-mct">
                            {mon}: {L(T.ptMcLeft[3 - done])}
                        </p>
                        <p className="fz-pt-d">
                            {L(T.ptMcOnD)}{" "}
                            <button type="button" className="fz-link fz-pt-inl" onClick={() => calDl(p)}>
                                {L(T.ptCal)}
                            </button>
                        </p>
                        <div className="fz-pt-bar" role="progressbar" aria-valuemin={0} aria-valuemax={3} aria-valuenow={done} aria-label={L(T.ptMcK)}>
                            <i style={{ width: (done / 3) * 100 + "%" }} />
                        </div>
                        <ul className="fz-pt-chk">
                            {T.ptMcItems.map((t, i) => {
                                const e = it[i]
                                return (
                                    <li key={i} className={e ? "y" : ""}>
                                        <i aria-hidden="true">{e ? ptIco("check", 15) : null}</i>
                                        <span>{L(t)}</span>
                                        {e ? (
                                            <small>{dTxt(e.d, lang, NOW)}</small>
                                        ) : (
                                            <button type="button" className="fz-link" onClick={() => openEnt(i === 0 ? "w" : "b")}>
                                                {L(T.ptMcAct[i])}
                                            </button>
                                        )}
                                    </li>
                                )
                            })}
                        </ul>
                    </>
                ) : (
                    <>
                        <p className="fz-pt-mct">{L(T.ptMcOffH)}</p>
                        <p className="fz-pt-d">{L(T.ptMcOffD)}</p>
                    </>
                )}
            </section>
        )
    }
    const vpkDlg = () => {
        if (!vpk || !prof) return null
        const p = prof
        const res = vrows && vpk.q.trim().length >= 2 ? clinicFind(vrows, vpk.q) : null
        const list = res ? (vpk.more ? res : res.slice(0, 12)) : []
        const fld = (id: string, k: "n" | "a" | "t" | "e", lab: LS, ph: string, type = "text") => (
            <label className="fz-lbl" htmlFor={id}>
                {L(lab)}
                <input id={id} className="fz-inp" type={type} autoComplete="off" maxLength={k === "a" ? 160 : k === "t" ? 40 : 120} value={vpk[k]} placeholder={ph} onChange={(e) => vpkSet({ [k]: e.target.value, oe: "" } as Partial<VPick>)} />
            </label>
        )
        return (
            <div className="fz-pt-ov" onClick={(e) => e.target === e.currentTarget && setVpk(null)}>
                <div className="fz-pt-dlg fz-pt-vpk" role="dialog" aria-modal="true" aria-labelledby="fz-pt-vph">
                    <div className="fz-pt-kh">
                        <h2 id="fz-pt-vph">{L(vpk.own ? T.ptVetOwnH : T.ptVetPick)}</h2>
                        <button type="button" className="fz-pt-x" aria-label={L(T.ptClose)} onClick={() => setVpk(null)}>
                            ×
                        </button>
                    </div>
                    {!vpk.own ? (
                        <>
                            <p className="fz-pt-d" style={{ marginTop: 8 }}>
                                {vetLead(p)}
                            </p>
                            <form
                                className="fz-pt-vs"
                                role="search"
                                onSubmit={(e) => {
                                    e.preventDefault()
                                    const el = document.getElementById("fz-pt-vq")
                                    if (el) el.blur()
                                }}
                            >
                                <label className="fz-lbl" htmlFor="fz-pt-vq">
                                    {L(T.ptVetPlace)}
                                </label>
                                <div className="fz-pt-vsr">
                                    <span className="fz-pt-vsi">{ptIco("search", 18)}</span>
                                    <input id="fz-pt-vq" className="fz-inp" type="search" autoComplete="off" maxLength={60} value={vpk.q} placeholder={L(T.ptVetPlacePh)} onChange={(e) => vpkSet({ q: e.target.value, more: false })} />
                                </div>
                            </form>
                            <div aria-live="polite">
                                {vload === "busy" && vpk.q.trim().length >= 2 && <p className="fz-hint">{L(T.ptVetLoading)}</p>}
                                {vload === "err" && <p className="fz-hint fz-hint--w">{L(T.ptVetErr)}</p>}
                                {res && !res.length && <p className="fz-hint">{L(T.ptVetNone)}</p>}
                                {res && res.length > 0 && <p className="fz-hint">{L(T.ptVetOff) + (res.length > 12 ? " " + L(T.ptVetNarrow) : "")}</p>}
                            </div>
                            {list.length > 0 && (
                                <ul className="fz-pt-vres">
                                    {list.map((c, i) => {
                                        const on = c.n === p.vn && c.a === p.va
                                        return (
                                            <li key={i}>
                                                <button type="button" className={on ? "on" : ""} aria-pressed={on} onClick={() => vpkPick(c)}>
                                                    <span>
                                                        <b>{c.n}</b>
                                                        {c.a && <small>{c.a}</small>}
                                                    </span>
                                                    <em>{on ? "✓ " + L(T.ptPicked) : L(T.ptPickB)}</em>
                                                </button>
                                            </li>
                                        )
                                    })}
                                </ul>
                            )}
                            {res && res.length > 12 && !vpk.more && (
                                <button type="button" className="fz-link" style={{ marginTop: 8 }} onClick={() => vpkSet({ more: true })}>
                                    {L(T.ptVetMore)} ({res.length - 12})
                                </button>
                            )}
                            <p className="fz-pt-src">
                                {L(T.ptVetSrc)} (
                                <a className="fz-link" href={CLINICS_SRC} target="_blank" rel="noopener noreferrer">
                                    {L(T.ptVetSrcL)}
                                </a>
                                )
                            </p>
                            <div className="fz-pt-dbar">
                                <button type="button" className="fz-btn fz-btn--g fz-btn--sm" onClick={() => vpkSet({ own: true, oe: "" })}>
                                    {L(T.ptVetOwn)}
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="fz-pt-vown">
                                {fld("fz-pt-vn", "n", T.ptVetN, "")}
                                {fld("fz-pt-va", "a", T.ptVetA, "")}
                                {fld("fz-pt-vt", "t", T.ptVetT, L(T.ptVetIfKnown), "tel")}
                                {fld("fz-pt-ve", "e", T.ptVetE, L(T.ptVetIfKnown), "email")}
                            </div>
                            {vpk.oe && (
                                <p className="fz-hint fz-hint--w" role="alert">
                                    {vpk.oe}
                                </p>
                            )}
                            <div className="fz-pt-dbar">
                                <button type="button" className="fz-btn fz-btn--g fz-btn--sm" onClick={() => vpkSet({ own: false, oe: "" })}>
                                    {L(T.ptVetBackList)}
                                </button>
                                <button type="button" className="fz-btn fz-btn--p fz-btn--sm" onClick={vpkSaveOwn}>
                                    {L(T.ptSaveB)}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        )
    }

    /* ---------- A: overview ---------- */

    /* ---------- warm profile and Freshy's Plus ---------- */

    /* the Freshy's seal without text: green disc, rings and the F (CSS mask, so it needs no ids) */
    const plusSeal = (cls = "") => (
        <span className={"fz-pseal " + cls} aria-hidden="true">
            <i className="r1" />
            <i className="r2" />
            <i className="f" style={{ WebkitMaskImage: "url(" + ART.fLetter + ")", maskImage: "url(" + ART.fLetter + ")" }} />
        </span>
    )
    const avOf = (p: Pet, cls: string) =>
        p.pic ? (
            <span className={"fz-pt-av ph " + cls} aria-hidden="true">
                <PhImg id={p.pic} alt="" />
            </span>
        ) : (
            <span className={"fz-pt-av sp" + p.sp + " " + cls} aria-hidden="true">
                {(pfNm(p)[0] || "?").toUpperCase()}
            </span>
        )
    const trTxt = (p: Pet, k: string) => L((p.sex === 1 ? T.ptTrF : T.ptTr)[TRAITS.indexOf(k)])
    const sinceTxt = (p: Pet) => {
        const s = sinceOf(p.since, NOW)
        if (!s) return ""
        if (!s.y && !s.m) return L(T.ptWithNew)
        const parts = [s.y ? s.y + " " + pl(lang, s.y, ["year", "years"], ["godinu", "godine", "godina"]) : "", s.m ? s.m + " " + pl(lang, s.m, ["month", "months"], ["mjesec", "mjeseca", "mjeseci"]) : ""].filter(Boolean)
        return L(T.ptWithYou) + " " + parts.join(lang === "en" ? " and " : " i ")
    }
    const bdayTxt = (p: Pet) => {
        const b = bdayOf(p, NOW)
        if (!b) return ""
        const turns = b.age > 0 ? (lang === "en" ? " · turns " + b.age : " · puni " + b.age + " " + plHr(b.age, ["godinu", "godine", "godina"])) : ""
        if (b.n === 0) return L(T.ptBdayToday) + (b.age > 0 ? (lang === "en" ? " · " + b.age + " today" : " · danas puni " + b.age + " " + plHr(b.age, ["godinu", "godine", "godina"])) : "")
        if (b.n === 1) return L(T.ptBdayTmr) + turns
        return L(T.ptBdayIn) + " " + b.n + " " + pl(lang, b.n, ["day", "days"], ["dan", "dana", "dana"]) + turns
    }
    /* profile fields: photo, character, since when, birthday, one sentence */
    const fPic = (v: Pet, set: PSet, now: boolean) => (
        <div className="fz-pt-picf">
            {avOf(v, "xl")}
            <div>
                <label className="fz-btn fz-btn--g fz-btn--sm fz-pt-picb">
                    <input
                        type="file"
                        accept="image/*"
                        className="fz-pt-file"
                        onChange={async (e) => {
                            const f = e.target.files ? e.target.files[0] : undefined
                            e.target.value = ""
                            if (!f || !f.type.startsWith("image/")) return
                            try {
                                const id = newId()
                                await phPut(id, await shrink(f))
                                if (now && v.pic) phDel([v.pic]).catch(() => {})
                                set({ pic: id })
                            } catch (err) {}
                        }}
                    />
                    {L(v.pic ? T.ptPicChg : T.ptPicAddP)}
                </label>
                {v.pic && (
                    <button
                        type="button"
                        className="fz-link"
                        onClick={() => {
                            if (now) phDel([v.pic]).catch(() => {})
                            set({ pic: "" })
                        }}
                    >
                        {L(T.ptPicDel)}
                    </button>
                )}
                <p className="fz-hint">{L(T.ptPicNote)}</p>
            </div>
        </div>
    )
    const fTr = (v: Pet, set: PSet, pre: string) => (
        <>
            <div className="fz-chips fz-pt-trs" role="group" aria-label={L(T.ptTrHint)}>
                {TRAITS.map((k) => {
                    const on = v.tr.includes(k)
                    return (
                        <button key={k} type="button" className="fz-chip" aria-pressed={on} disabled={!on && v.tr.length >= 3} onClick={() => set({ tr: on ? v.tr.filter((x) => x !== k) : [...v.tr, k] })}>
                            {trTxt(v, k)}
                        </button>
                    )
                })}
            </div>
            <p className="fz-hint">{L(T.ptTrHint)}</p>
            <div className="fz-gap2" />
            <label className="fz-lbl" htmlFor={pre + "fav"}>
                {L(T.ptFav)}
            </label>
            <input id={pre + "fav"} className="fz-inp" value={v.fav} maxLength={60} placeholder={L(T.ptFavPh)} onChange={(e) => set({ fav: e.target.value })} />
        </>
    )
    const fSince = (v: Pet, set: PSet, pre: string) => (
        <>
            <label className="fz-lbl" htmlFor={pre + "since"}>
                {L(T.ptSinceK)}
            </label>
            <input id={pre + "since"} className="fz-inp fz-pt-mon" type="month" max={ymd(NOW).slice(0, 7)} value={v.since} onChange={(e) => set({ since: /^\d{4}-\d{2}$/.test(e.target.value) && e.target.value <= ymd(NOW).slice(0, 7) ? e.target.value : "" })} />
            <p className="fz-hint">{L(T.ptSinceH)}</p>
            {v.bm > 0 && (
                <>
                    <div className="fz-gap2" />
                    <label className="fz-lbl" htmlFor={pre + "bday"}>
                        {L(T.ptBdayK)}
                    </label>
                    <input
                        id={pre + "bday"}
                        className="fz-inp fz-pt-day"
                        type="number"
                        inputMode="numeric"
                        min={1}
                        max={31}
                        value={v.bday || ""}
                        onChange={(e) => {
                            const n = parseInt(e.target.value, 10)
                            set({ bday: n >= 1 && n <= 31 ? n : 0 })
                        }}
                    />
                    <p className="fz-hint">{L(T.ptBdayH)}</p>
                </>
            )}
        </>
    )
    const fQ = (v: Pet, set: PSet, id: string) => <input id={id} className="fz-inp" value={v.q} maxLength={90} placeholder={L(T.ptQPh)} onChange={(e) => set({ q: e.target.value })} />

    const heroCard = (p: Pet) => {
        const since = sinceTxt(p),
            bd = bdayTxt(p),
            b = bdayOf(p, NOW)
        const bits = [L(T.ptSpN[p.sp]) + (p.sp === 2 && p.kind ? " · " + p.kind : ""), p.sp === 0 ? breedTxtOf(p) : "", ageTxtOf(p)].filter(Boolean)
        return (
            <section className="fz-pt-card fz-pt-w3 fz-pt-hero" aria-labelledby="fz-pt-heroh">
                {avOf(p, "hero")}
                <div className="fz-pt-heb">
                    <h2 id="fz-pt-heroh">{yourPet(p)}</h2>
                    <p className="fz-pt-hes">{bits.join(" · ")}</p>
                    {(since || bd) && (
                        <div className="fz-pt-chips">
                            {since && <span className="fz-pt-chip c-g">{since}</span>}
                            {bd && <span className={"fz-pt-chip " + (b && b.n <= 7 ? "c-o" : "c-n")}>{bd}</span>}
                        </div>
                    )}
                    {p.tr.length > 0 && (
                        <div className="fz-pf-tags">
                            {p.tr.map((k) => (
                                <span key={k} className="fz-tag fz-pt-tag">
                                    {trTxt(p, k)}
                                </span>
                            ))}
                        </div>
                    )}
                    {p.fav && (
                        <p className="fz-pt-fav">
                            {L(T.ptLoves)}: <b>{p.fav}</b>
                        </p>
                    )}
                    {p.q && <p className="fz-pt-q fz-hand">{qt(p.q)}</p>}
                    {!p.pic && !p.tr.length && !p.since && (
                        <button type="button" className="fz-link" onClick={() => setPmode("edit")}>
                            {L(T.ptAddMore)}
                        </button>
                    )}
                </div>
                <button type="button" className="fz-btn fz-btn--g fz-btn--sm fz-pt-hee" onClick={() => setPmode("edit")}>
                    {L(T.ptEditPr)}
                </button>
            </section>
        )
    }
    const hiCard = (p: Pet) => (
        <section className="fz-pt-card fz-pt-w3 fz-pt-hi" role="status">
            {avOf(p, "lg")}
            <div className="fz-pt-heb">
                <h2>
                    {L(T.ptHi)}, {yourPet(p)}!
                </h2>
                <p>
                    {yourPet(p)} {L(T.ptHiT[p.sp === 0 ? 0 : 1])}
                </p>
                {!isPlus && !LIVE && (
                    <p className="fz-pt-hip">
                        {plusSeal("sm")}
                        <span>
                            {L(T.plusTeaseT)} <b>{L(T.plusFree30)}</b>
                        </span>
                    </p>
                )}
                <div className="fz-pt-btns">
                    <button type="button" className="fz-btn fz-btn--p fz-btn--sm" onClick={() => setHi("")}>
                        {L(T.ptHiOk)}
                    </button>
                    {!isPlus && !LIVE && (
                        <button type="button" className="fz-btn fz-btn--g fz-btn--sm" onClick={() => (setHi(""), goPlus())}>
                            {L(T.plusTeaseB)}
                        </button>
                    )}
                </div>
            </div>
        </section>
    )
    const plusBar = () =>
        !LIVE && ps && ps.pt ? (
            <div className={"fz-pt-pbar fz-noprint" + (isPlus ? "" : " end")}>
                {plusSeal("sm")}
                <span>
                    {isPlus ? (
                        <>
                            {ps.pg ? L(T.plusGift) + " " : <b>{L(T.plusOn)} · </b>}
                            {(lang === "en" ? plusN + " " : "još " + plusN + " ") + L(T.plusLeftT)}
                        </>
                    ) : (
                        L(T.plusEnded)
                    )}
                </span>
                <button type="button" className="fz-link" onClick={goPlus}>
                    {L(T.plusTeaseB)}
                </button>
            </div>
        ) : null
    const teaseCard = () => (
        <section className="fz-pt-card fz-pt-tease" aria-labelledby="fz-pt-teh">
            {plusSeal("md")}
            <h3 id="fz-pt-teh">{L(T.plusEb)}</h3>
            <p>{L(T.plusTeaseT)}</p>
            <p className="fz-pt-tp">
                <b>{L(T.plusPrice)}</b> · {L(T.plusFree30)}
            </p>
            <button type="button" className="fz-btn fz-btn--p fz-btn--sm" onClick={goPlus}>
                {L(T.plusTeaseB)}
            </button>
        </section>
    )

    const plusPage = (
        <section className="fz-sec fz-plus" key="plus">
            <div className="fz-wrap">
                <div className="fz-plus-top">
                    {plusSeal("xl")}
                    <div className="fz-eb">{L(T.plusEb)}</div>
                    <h1 className="fz-h2">{L(T.plusH)}</h1>
                    <p className="fz-lead">{L(T.plusLead)}</p>
                </div>
                {ps && ps.pt && (
                    <p className={"fz-plus-st" + (isPlus ? "" : " end")} role="status">
                        {isPlus ? (
                            <>
                                <b>{L(T.plusOn)}</b> · {(lang === "en" ? plusN + " " : "još " + plusN + " ") + L(T.plusLeftT)}
                            </>
                        ) : (
                            L(T.plusEnded)
                        )}
                    </p>
                )}
                <div className="fz-plus-cmp">
                    <div className="fz-plus-c">
                        <h2>{L(T.plusFreeH)}</h2>
                        <p className="fz-plus-pr">0 €</p>
                        <ul>
                            {T.plusFree.map((x, i) => (
                                <li key={i}>
                                    <Ico d={I.check} s={18} />
                                    {L(x)}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="fz-plus-c p">
                        <h2>
                            {plusSeal("sm")}
                            {L(T.plusPlusH)}
                        </h2>
                        <p className="fz-plus-pr">{L(T.plusPrice)}</p>
                        <p className="fz-plus-all">{L(T.plusAll)}</p>
                        <ul>
                            {T.plusPlus.map((x, i) => (
                                <li key={i}>
                                    <Ico d={I.check} s={18} />
                                    {L(x)}
                                </li>
                            ))}
                        </ul>
                        {!ps || !ps.pt ? (
                            <>
                                <button type="button" className="fz-btn fz-btn--p fz-plus-go" onClick={startTrial}>
                                    {L(T.plusTry)}
                                </button>
                                <p className="fz-plus-n">{L(T.plusTryN)}</p>
                            </>
                        ) : null}
                    </div>
                </div>
                <ul className="fz-plus-prom">
                    {T.plusProm.map((x, i) => (
                        <li key={i}>
                            <Ico d={I.check} s={18} />
                            {L(x)}
                        </li>
                    ))}
                </ul>
                <div className="fz-plus-back">
                    <button type="button" className="fz-link" onClick={() => go({ p: "dog" })}>
                        {L(!ps || !ps.pt ? T.plusStay : T.plusBack)}
                    </button>
                </div>
            </div>
        </section>
    )

    const ptDash = (p: Pet) => (
        <div className="fz-pt-grid">
            {hi === p.id && hiCard(p)}
            {heroCard(p)}
            {isPlus ? (
                <>
                    {soonCard(p)}
                    {insCard(p)}
                    {todayCard(p)}
                    {wCard(p, true)}
                    {p.sp !== 2 ? bodyCard(p) : ckCard(p, true)}
                    {p.sp === 0 ? foodCard(p) : p.sp === 1 ? ckCard(p, true) : null}
                    {healthCard(p, p.sp === 2)}
                    {upCard(p)}
                    {vetCard(p)}
                    {monthCard(p)}
                </>
            ) : (
                <>
                    {wCard(p, false)}
                    {p.sp === 0 && foodCard(p)}
                    {!LIVE && teaseCard()}
                    {vetCard(p)}
                </>
            )}
        </div>
    )

    /* ---------- B: journal ---------- */

    const sumCard = (p: Pet) => {
        const pts = ps ? wPts(ps.log, p.id) : []
        const last = pts[pts.length - 1],
            first = pts[0]
        const goal = goalOf(p, NOW)
        const pace = paceOf(pts)
        const cls = goal > 0 && pace && pace.pct > 0 ? paceCls(p.sp, pace.pct) : -1
        const dlt = first && last && first.d !== last.d ? Math.round((last.kg - first.kg) * 1000) / 1000 : null
        const lb = ps ? lastBody(ps.log, p.id) : undefined
        const nE = ps ? ps.log.filter((e) => e.pet === p.id).length : 0
        const kr = p.sp === 0 && p.health === 0 ? kcalRange(dogOf(p, NOW)) : null
        const st = (k: string, v: React.ReactNode, sub: string, cl?: string) => (
            <div className="fz-pt-st" key={k}>
                <span className="fz-pt-k">{k}</span>
                <b className={cl}>{v}</b>
                {sub && <span>{sub}</span>}
            </div>
        )
        return (
            <section className="fz-pt-card fz-pt-sum">
                <div className="fz-pt-who">
                    <span className={"fz-pt-av lg sp" + p.sp} aria-hidden="true">
                        {(pfNm(p)[0] || "?").toUpperCase()}
                    </span>
                    <div>
                        <h3>{yourPet(p)}</h3>
                        <p>
                            {L(T.ptSpN[p.sp])}
                            {p.sp === 2 && p.kind ? " · " + p.kind : ""}
                            {p.sp !== 2 ? " · " + sexTxt(p) + (ageGrpOf(p, NOW) === 2 ? ", " + L(T.pfNeutS[p.neut ? 0 : 1][p.sex]) : "") : ""}
                            {breedTxtOf(p) && p.sp === 0 ? <br /> : null}
                            {p.sp === 0 ? breedTxtOf(p) : null}
                        </p>
                    </div>
                </div>
                <div className="fz-pt-stats">
                    {st(L(T.ptW), wFmt(p.kg), dlt !== null && Math.abs(dlt) >= 0.05 ? (dlt < 0 ? "−" : "+") + wFmt(Math.abs(dlt)) + " " + L(T.ptSince) + " " + dTxt(first.d, lang, NOW) : "")}
                    {goal > 0 ? st(L(T.ptGoal), wFmt(goal), last && last.kg > goal ? (lang === "en" ? wFmt(Math.round((last.kg - goal) * 1000) / 1000) + " to go" : "još " + wFmt(Math.round((last.kg - goal) * 1000) / 1000)) : "") : st(L(T.ptLastWk), last ? dTxt(last.d, lang, NOW) : "–", "")}
                    {p.sp !== 2 ? st(L(T.ptBody), L(T.pfBodies[p.body][p.sex]), lb ? dTxt(lb.d, lang, NOW) : "", p.body === 1 ? "g" : "o") : st(L(T.ptEntries), String(nE), "")}
                    {kr ? st(L(T.ptFood), nf(rK(kr[0]), lang) + (rK(kr[1]) > rK(kr[0]) ? "–" + nf(rK(kr[1]), lang) : "") + " kcal", L(T.ptADay)) : st(p.sp === 2 ? L(T.ptVetRow[2]) : L(T.ptEntries), p.sp === 2 ? ageTxtOf(p) : String(nE), "")}
                </div>
                {pts.length > 1 && <WChart pts={pts} goal={goal} proj={goal && pace && last ? projOf(last, pace.wk, goal) : null} lang={lang} now={NOW} label={L(T.ptW)} goalTxt="" projTxt="" h={92} mini />}
                {goal > 0 && pace && (
                    <span className={"fz-pt-chip c-" + (pace.pct <= 0 ? "o" : cls === 1 ? "g" : cls === 2 ? "r" : "o")} style={{ marginTop: 8 }}>
                        {pace.pct <= 0 ? L(T.ptNoDrop) : nf(pace.pct, lang, 1) + " % " + L(T.ptWk) + (cls >= 0 ? " · " + L(T.ptPace[cls]) : "")}
                    </span>
                )}
                <div className="fz-pt-btns">
                    <button type="button" className="fz-btn fz-btn--g fz-btn--sm" onClick={() => setPmode("edit")}>
                        {L(T.ptEditId)}
                    </button>
                    {vetOk && (
                        <button type="button" className="fz-btn fz-btn--g fz-btn--sm" onClick={openVet}>
                            {ptIco("print", 16)}
                            {L(T.ptVetB)}
                        </button>
                    )}
                </div>
            </section>
        )
    }
    const FILT: string[][] = [[], ["start", "w", "b"], ["inj", "ill", "med"], ["vet", "vac", "par"], ["note"]]
    const entCard = (p: Pet, e: Ent) => {
        const dd = dOf(e.d)
        return (
            <li key={e.id} className={"fz-pt-it c-" + (PT_C[e.t] || "n")}>
                <span className="fz-pt-dt">
                    {dTxt(e.d, lang, NOW)}
                    <small>{e.d === ymd(NOW) ? L(T.ptTodayW) : (lang === "en" ? DOW_EN : DOW_HR)[dd.getDay()]}</small>
                </span>
                <i className="fz-pt-pin" aria-hidden="true" />
                <div className={"fz-pt-ec" + (e.t === "inj" ? " acc" : e.t === "ill" ? " acc r" : "")}>
                    {icoBox(e, p)}
                    <div className="fz-pt-eb">
                        <div className="fz-pt-kh">
                            <h4>{entTitle(p, e)}</h4>
                            <button type="button" className="fz-link" onClick={() => openEnt(e.t, e)} aria-label={L(T.ptEdit) + ": " + entTitle(p, e)}>
                                {L(T.ptEdit)}
                            </button>
                        </div>
                        {entSub(p, e) && <p className="fz-pt-d">{entSub(p, e)}</p>}
                        {(e.t === "inj" || e.t === "ill") && (
                            <div className="fz-pt-steps" role="group" aria-label={L(T.ptSt)}>
                                {(e.t === "inj" ? [0, 1, 2] : [0, 2]).map((s, i, a) => (
                                    <React.Fragment key={s}>
                                        <button type="button" className={"fz-pt-chip c-" + ((e.st || 0) === s ? (s === 2 ? "g" : e.t === "inj" ? "o" : "r") : "n")} aria-pressed={(e.st || 0) === s} onClick={() => setSt(e, s)}>
                                            {e.t === "inj" ? L(T.ptInjSt[s]) : L(T.ptIllSt[s === 2 ? 1 : 0])}
                                        </button>
                                        {i < a.length - 1 && (
                                            <span className="fz-pt-ar" aria-hidden="true">
                                                →
                                            </span>
                                        )}
                                    </React.Fragment>
                                ))}
                            </div>
                        )}
                        {e.ph && e.ph.length > 0 && (
                            <div className="fz-pt-phs">
                                {e.ph.map((id, i) => (
                                    <button key={id} type="button" className="fz-pt-ph" onClick={() => setLb(id)}>
                                        <PhImg id={id} alt={entTitle(p, e) + ", " + L(T.ptPhotos).toLowerCase() + " " + (i + 1)} />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </li>
        )
    }
    const ptLog = (p: Pet) => {
        const es = ps ? ps.log.filter((e) => e.pet === p.id && (lf === 0 || FILT[lf].includes(e.t))).sort((a, b) => -byT(a, b)) : []
        const months: [string, Ent[]][] = []
        es.forEach((e) => {
            const m = e.d.slice(0, 7)
            if (!months.length || months[months.length - 1][0] !== m) months.push([m, []])
            months[months.length - 1][1].push(e)
        })
        const mName = (m: string) => {
            const d = dOf(m + "-15")
            return lang === "en" ? MON_EN[d.getMonth()] + " " + d.getFullYear() : ["Siječanj", "Veljača", "Ožujak", "Travanj", "Svibanj", "Lipanj", "Srpanj", "Kolovoz", "Rujan", "Listopad", "Studeni", "Prosinac"][d.getMonth()] + " " + d.getFullYear() + "."
        }
        return (
            <div className="fz-pt-lay">
                <aside className="fz-pt-side">
                    {sumCard(p)}
                    {upCard(p)}
                </aside>
                <div className="fz-pt-main">
                    {ckCard(p)}
                    <div className="fz-pt-qa" role="group" aria-label={L(T.ptLogB)}>
                        {["w", ...(p.sp !== 2 ? ["b"] : []), "inj", "ill", "vet", "vac", "par", "med", "note"].map((t) => (
                            <button key={t} type="button" className="fz-pt-q" onClick={() => openEnt(t)}>
                                <em aria-hidden="true">+</em>
                                {L(T.ptTy[t])}
                            </button>
                        ))}
                    </div>
                    <div className="fz-pt-flt" role="group" aria-label={L(T.ptAll)}>
                        {T.ptFilt.map((f, i) => (
                            <button key={i} type="button" aria-pressed={lf === i} onClick={() => setLf(i)}>
                                {L(f)}
                            </button>
                        ))}
                    </div>
                    {!months.length && <p className="fz-pt-d" style={{ marginTop: 18 }}>{L(T.ptNoLog)}</p>}
                    {months.map(([m, list], mi) => {
                        const open = lf !== 0 || mi < 2 || list.length <= 3 || lOpen.includes(m)
                        const ws = list.filter((e) => e.kg && (e.t === "w" || e.t === "start" || e.t === "vet")).sort(byT)
                        return (
                            <div key={m} className="fz-pt-month">
                                <h3 className="fz-pt-mo">{mName(m)}</h3>
                                {open ? (
                                    <ol className="fz-pt-tl">{list.map((e) => entCard(p, e))}</ol>
                                ) : (
                                    <div className="fz-pt-card fz-pt-msum">
                                        <div className="fz-pt-chips">
                                            {ws.length > 0 && (
                                                <span className="fz-pt-chip c-n">
                                                    {ws.length} {pl(lang, ws.length, ["weigh-in", "weigh-ins"], ["vaganje", "vaganja", "vaganja"])} · {wFmt(ws[0].kg as number)}
                                                    {ws.length > 1 ? " → " + wFmt(ws[ws.length - 1].kg as number) : ""}
                                                </span>
                                            )}
                                            {list
                                                .filter((e) => HEALTH_T.includes(e.t))
                                                .slice(0, 6)
                                                .map((e) => (
                                                    <span key={e.id} className={"fz-pt-chip c-" + (PT_C[e.t] || "n")}>
                                                        {entTitle(p, e)} · {dTxt(e.d, lang, NOW)}
                                                    </span>
                                                ))}
                                        </div>
                                        <button type="button" className="fz-link" style={{ marginTop: 10 }} onClick={() => setLOpen((o) => [...o, m])}>
                                            {lang === "en" ? "Show all entries (" + list.length + ")" : "Prikaži sve zapise (" + list.length + ")"}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
        )
    }

    /* ---------- entry form (dialog) ---------- */

    const efForm = () => {
        if (!ef || !prof) return null
        const p = prof
        const set = (patch: Partial<EForm>) => setEf((x) => (x ? { ...x, ...patch } : x))
        const today = ymd(NOW)
        const types = isPlus ? ["w", ...(p.sp !== 2 ? ["b"] : []), "inj", "ill", "vet", "vac", "par", "med", "note"] : ["w"]
        const t = ef.t
        const hasTi = ["inj", "ill", "vet", "vac", "par", "med"].includes(t)
        const hasNx = ["vet", "vac", "par", "inj", "ill", "med"].includes(t)
        return (
            <div className="fz-pt-ov" onClick={(e) => e.target === e.currentTarget && closeEnt()}>
                <div className="fz-pt-dlg" role="dialog" aria-modal="true" aria-labelledby="fz-pt-dlg-h">
                    <div className="fz-pt-kh">
                        <h2 id="fz-pt-dlg-h" tabIndex={-1}>
                            {ef.isNew ? (t ? L(T.ptTy[t]) : L(T.ptNewE)) : L(T.ptEditE)}
                        </h2>
                        <button type="button" className="fz-pt-x" aria-label={L(T.ptClose)} onClick={closeEnt}>
                            ×
                        </button>
                    </div>
                    {ef.isNew && (
                        <>
                            <span className="fz-lbl" id="fz-pt-ty">
                                {L(T.ptWhat)}
                            </span>
                            <div className="fz-pt-types" role="group" aria-labelledby="fz-pt-ty">
                                {types.map((x) => (
                                    <button
                                        key={x}
                                        type="button"
                                        aria-pressed={t === x}
                                        onClick={() => set({ t: x, kg: x === "w" && !ef.kg ? kgIn(p.kg) : ef.kg, body: x === "b" && ef.body < 0 ? p.body : ef.body, nx: x === "vac" && !ef.nx ? addMonths(ef.d, 12) : ef.nx })}
                                    >
                                        {x === "b" ? bodySvg(1, p.sp === 1, 16) : ptIco(x, 18)}
                                        {L(T.ptTy[x])}
                                    </button>
                                ))}
                            </div>
                            {!isPlus && !LIVE && (
                                <p className="fz-hint">
                                    {L(T.plusMoreTy)}{" "}
                                    <button type="button" className="fz-link" onClick={() => (closeEnt(), goPlus())}>
                                        {L(T.plusTeaseB)}
                                    </button>
                                </p>
                            )}
                        </>
                    )}
                    {t && (
                        <div className="fz-pt-fs">
                            <label className="fz-lbl" htmlFor="fz-pt-d">
                                {L(T.ptDate)}
                                <input id="fz-pt-d" className="fz-inp" type="date" max={today} value={ef.d} onChange={(e) => set({ d: e.target.value })} />
                            </label>
                            {(t === "w" || t === "start" || t === "vet") && (
                                <label className="fz-lbl" htmlFor="fz-pt-kg">
                                    {t === "vet" ? L(T.ptVetKg) : L(T.ptW)}
                                    <span className="fz-kcin">
                                        <input id="fz-pt-kg" className="fz-inp" inputMode="decimal" value={ef.kg} maxLength={7} autoComplete="off" onChange={(e) => set({ kg: e.target.value.replace(/[^\d.,]/g, "") })} />
                                        <span>kg</span>
                                    </span>
                                    {p.sp === 2 && <small className="fz-hint">{L(T.ptKgSmall)}</small>}
                                </label>
                            )}
                            {(t === "w" || t === "start") && (
                                <div>
                                    <span className="fz-lbl">{L(T.ptWhere)}</span>
                                    {seg(T.ptWhereO, ef.wh, (i) => set({ wh: i }), T.ptWhere)}
                                    {ef.wh === 0 && <small className="fz-hint">{L(T.ptHowW)}</small>}
                                </div>
                            )}
                            {(t === "b" || ((t === "w" || t === "start") && p.sp !== 2)) && (
                                <div>
                                    <span className="fz-lbl" id="fz-pt-bl">
                                        {t === "b" ? L(T.ptBody) : L(T.ptBodyOpt)}
                                    </span>
                                    <div className="fz-pt-bopts" role="radiogroup" aria-labelledby="fz-pt-bl">
                                        {[0, 1, 2, 3].map((i) => (
                                            <button key={i} type="button" role="radio" aria-checked={ef.body === i} onClick={() => set({ body: ef.body === i && t !== "b" ? -1 : i })}>
                                                {bodySvg(i, p.sp === 1, 26)}
                                                {L(T.pfBodies[i][p.sex])}
                                            </button>
                                        ))}
                                    </div>
                                    {t === "b" && ef.body >= 0 && <small className="fz-hint">{L(p.sp === 1 ? T.ptBodyDC[ef.body] : T.pfBodyD[ef.body])}</small>}
                                </div>
                            )}
                            {hasTi && (
                                <label className="fz-lbl" htmlFor="fz-pt-ti">
                                    {L(T.ptTiL[t])}
                                    <input id="fz-pt-ti" className="fz-inp" value={ef.ti} maxLength={80} placeholder={L(T.ptTiPh[t])} autoComplete="off" onChange={(e) => set({ ti: e.target.value })} />
                                </label>
                            )}
                            {t === "ill" && (
                                <div className="fz-chips2" role="group" aria-label={L(T.ptTiL.ill)}>
                                    {T.ptIllPick.map((o, i) => (
                                        <button key={i} type="button" className="fz-chip" aria-pressed={ef.ti === L(o)} onClick={() => set({ ti: L(o) })}>
                                            {L(o)}
                                        </button>
                                    ))}
                                </div>
                            )}
                            {(t === "inj" || t === "ill") && (
                                <div>
                                    <span className="fz-lbl">{L(T.ptSt)}</span>
                                    {t === "inj" ? seg(T.ptInjSt, ef.st, (i) => set({ st: i }), T.ptSt) : seg(T.ptIllSt, ef.st === 2 ? 1 : 0, (i) => set({ st: i ? 2 : 0 }), T.ptSt)}
                                </div>
                            )}
                            {(t === "ill" || t === "inj") && <small className="fz-hint">{L(T.ptSerious)}</small>}
                            {hasNx && (
                                <div>
                                    <label className="fz-lbl" htmlFor="fz-pt-nx">
                                        {L(T.ptNxF[t])}
                                        <input id="fz-pt-nx" className="fz-inp" type="date" min={ef.d} value={ef.nx} onChange={(e) => set({ nx: e.target.value })} />
                                    </label>
                                    {(t === "vac" || t === "par") && (
                                        <div className="fz-chips2">
                                            {[1, 3, 12].map((mo, i) => (
                                                <button key={mo} type="button" className="fz-chip" aria-pressed={ef.nx === addMonths(ef.d, mo)} onClick={() => set({ nx: addMonths(ef.d, mo) })}>
                                                    {L(T.ptIn[i])}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                            <label className="fz-lbl" htmlFor="fz-pt-tx">
                                {T.ptTxL[t] ? L(T.ptTxL[t]) : L(T.ptTxOpt)}
                                <textarea id="fz-pt-tx" className="fz-inp fz-pt-ta" value={ef.tx} maxLength={1200} rows={3} onChange={(e) => set({ tx: e.target.value })} />
                            </label>
                            {t !== "med" && (
                                <div>
                                    <span className="fz-lbl">{L(T.ptPhotos)}</span>
                                    <div className="fz-pt-phs">
                                        {ef.ph.map((id, i) => (
                                            <span key={id} className="fz-pt-ph">
                                                <PhImg id={id} alt={L(T.ptPhotos) + " " + (i + 1)} />
                                                <button type="button" className="fz-pt-phd" aria-label={L(T.ptPhDel) + " " + (i + 1)} onClick={() => set({ ph: ef.ph.filter((x) => x !== id) })}>
                                                    ×
                                                </button>
                                            </span>
                                        ))}
                                        {ef.ph.length < 6 && (
                                            <label className="fz-pt-ph fz-pt-phadd">
                                                <input type="file" accept="image/*" multiple className="fz-pt-file" disabled={efBusy} onChange={(e) => (addPhotos(e.target.files), (e.target.value = ""))} />
                                                {ptIco("cam", 20)}
                                                <small>{efBusy ? L(T.ptPhBusy) : L(T.ptPhAdd)}</small>
                                            </label>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    {efMsg && (
                        <p className="fz-hint fz-hint--w" role="alert">
                            {efMsg}
                        </p>
                    )}
                    <div className="fz-pt-dbar">
                        {!ef.isNew &&
                            (!efDel ? (
                                <button type="button" className="fz-link" onClick={() => setEfDel(true)}>
                                    {L(T.ptDelE)}
                                </button>
                            ) : (
                                <button type="button" className="fz-btn fz-btn--sm fz-pf-del" onClick={delEnt}>
                                    {L(T.ptDelESure)}
                                </button>
                            ))}
                        <span style={{ flex: 1 }} />
                        <button type="button" className="fz-btn fz-btn--g fz-btn--sm" onClick={closeEnt}>
                            {L(T.ptCancel)}
                        </button>
                        <button type="button" className="fz-btn fz-btn--p fz-btn--sm" disabled={!t || efBusy} onClick={saveEnt}>
                            {L(T.ptSave)}
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    /* ---------- vet visits: the cards, the vet's view and form, and the paper for the vet (printable) ---------- */

    const ptVet = (p: Pet) => {
        if (!ps) return null
        if (vf) return vfView(p)
        if (vv) return vetView(p)
        const today = ymd(NOW)
        const since = vp === 0 ? addDays(today, -30) : vp === 1 ? addMonths(today, -6) : "0000-00-00"
        const allPts = wPts(ps.log, p.id)
        const pts = allPts.filter((x) => x.d >= since)
        const goal = goalOf(p, NOW)
        const hs = ps.log.filter((e) => e.pet === p.id && ["inj", "ill", "vet", "note"].includes(e.t) && e.d >= since).sort((a, b) => -byT(a, b))
        const latest = new Map<string, Ent>()
        ps.log.filter((e) => e.pet === p.id && (e.t === "vac" || e.t === "par")).sort(byT).forEach((e) => latest.set(e.t + "|" + (e.ti || "").trim().toLowerCase(), e))
        const prot = Array.from(latest.values()).sort((a, b) => -byT(a, b))
        const meds = ps.log.filter((e) => e.pet === p.id && e.t === "med" && (e.d >= since || (e.nx && e.nx >= today))).sort((a, b) => -byT(a, b))
        const pics = ps.log
            .filter((e) => e.pet === p.id && e.d >= since && e.ph && e.ph.length)
            .sort((a, b) => -byT(a, b))
            .flatMap((e) => (e.ph || []).map((id) => ({ id, e })))
            .slice(0, 24)
        const d14 = ckDays(ps.ck, p.id, NOW, 14)
        const lb = lastBody(ps.log, p.id)
        /* medicines written as the vet prescribed them, with the owner's ticks for the last 7 full days */
        const mdv = (ps.md || []).filter((m) => m.pet === p.id && (!m.d1 || m.d1 >= since)).sort((a, b) => (!a.d1 !== !b.d1 ? (a.d1 ? 1 : -1) : a.d0 < b.d0 ? 1 : -1))
        const ticks = (m: Med) => {
            const ds = dosesSince(m, addDays(today, -7))
            return ds ? (lang === "en" ? "ticked as given " + ds.got + " of " + ds.sch + " times in the last 7 days" : "označeno kao dano " + ds.got + " od " + ds.sch + " puta u zadnjih 7 dana") : ""
        }
        const mdLine = (m: Med) => [qt(m.rx), m.tms.length ? m.tms.join(", ") : L(T.ptMdNoTmS), ticks(m), m.vi ? L(T.ptViBy) : ""].filter(Boolean).join(" · ")
        const mdWhen = (m: Med) => dTxt(m.d0, lang, NOW, true) + " – " + (m.d1 ? dTxt(m.d1, lang, NOW, true) : L(T.ptMdNoEnd))
        /* food, last 7 days: what the owner logged, the average a day and the amount from the scale (or the vet) for comparison */
        const d7 = Array.from({ length: 7 }, (_, i) => addDays(today, -i))
        const ml7 = (ps.ml || []).filter((m) => m.pet === p.id && d7.includes(m.d))
        const mlDays = d7.filter((d) => ml7.some((m) => m.d === d))
        const kcDays = d7.filter((d) => ml7.some((m) => m.d === d && m.kc > 0))
        const kcAvg = kcDays.length ? Math.round(kcDays.reduce((a, d) => a + ml7.filter((m) => m.d === d).reduce((x, m) => x + m.kc, 0), 0) / kcDays.length) : 0
        const byFood = new Map<string, { n: number; kc: number }>()
        ml7.forEach((m) => {
            const k = mlName(m, p)
            const o = byFood.get(k) || { n: 0, kc: 0 }
            byFood.set(k, { n: o.n + 1, kc: o.kc + m.kc })
        })
        const foods = Array.from(byFood.entries()).sort((a, b) => b[1].n - a[1].n).slice(0, 6)
        const kt = kcTarget(p)
        const k100 = kc100Of(p)
        const curFood = p.sp === 0 ? [L(T.pfFoods[p.food] || T.pfFoods[0]), k100 ? nf(k100, lang) + " " + L(T.per100) : "", +p.gday > 0 ? nf(+p.gday, lang) + " g " + L(T.ptADay) : ""].filter(Boolean).join(", ") : ""
        /* walks, last 30 days (dogs) */
        const wk30 = p.sp === 0 ? (ps.wk || []).filter((w) => w.pet === p.id && w.d > addDays(today, -30) && w.d <= today) : []
        const wkDays = new Set(wk30.map((w) => w.d)).size
        const wkKm = wk30.reduce((a, w) => a + w.km, 0),
            wkMin = wk30.reduce((a, w) => a + w.min, 0)
        /* the top of the paper: last time's instructions against how it went, the questions, what is new and the medicines now */
        const x = insOf(p)[0]
        const nv = nextVisit(p)
        const lastVet = ps.log
            .filter((e) => e.pet === p.id && e.t === "vet" && e.d < today)
            .sort(byT)
            .pop()
        const nSince = x ? x.d : lastVet ? lastVet.d : addDays(today, -30)
        const rows = x ? cmpRows(p, x) : []
        const news = newsOf(p, nSince)
        const qs = qsOf(p)
        const other = [p.sp !== 2 ? L(T.ptVetRow[6]) + ": " + L(T.pfBodies[p.body][p.sex]) + (lb ? " (" + dTxt(lb.d, lang, NOW, true) + ")" : "") : "", p.sp !== 2 ? L(T.ptVetRow[7]) + ": " + L(T.pfHealths[p.health][p.sex]) : "", goal > 0 ? L(T.ptVetRow[5]) + ": " + wFmt(goal) + ", " + L(T.ptGoalSrc[p.ideal > 0 && p.ideal < p.kg ? 0 : 1]) : ""].filter(Boolean).join(" · ")
        const line = (e: Ent) => (
            <li key={e.id}>
                <span>{dTxt(e.d, lang, NOW, true)}</span>
                <div>
                    <b>{L(T.ptTy[e.t])}</b>
                    {entLine(p, e).slice(L(T.ptTy[e.t]).length)}
                </div>
            </li>
        )
        const ckTxt = (ki: number) => {
            const k = CK_K[ki]
            const ans = d14.filter((y) => y.c && y.c[k] >= 0)
            const off = ans.filter((y) => ckLvl(ki, (y.c as Ck)[k]) > 0)
            return (
                (off.length
                    ? off.map((y) => dTxt(y.d, lang, NOW) + " " + L(T.ptCkV[ki][(y.c as Ck)[k]]).toLowerCase()).join(", ")
                    : ans.length
                      ? L(T.ptAlways) + " " + L(T.ptCkV[ki][ki === 1 ? 1 : 0]).toLowerCase()
                      : "–") +
                " (" +
                ans.length +
                " " +
                L(T.ptAnswered) +
                ")"
            )
        }
        const subj = yourPet(p) + " – " + L(T.ptVetH).toLowerCase() + " (" + dTxt(today, lang, NOW, true) + ")"
        const mailBody = () => {
            const out: string[] = [L(T.ptMailIntro), ""]
            out.push(yourPet(p) + " · " + basicsOf(p))
            if (x && rows.length) out.push("", L(T.pvSaid) + " (" + dTxt(x.d, lang, NOW, true) + "):", ...rows.map((r) => "- " + r.k + ": " + r.said + " → " + r.now + (r.sub ? " (" + r.sub + ")" : "")))
            if (qs.length) out.push("", L(T.pvQs) + ":", ...qs.map((q, i) => i + 1 + ". " + q))
            if (news.length) out.push("", (x || lastVet ? L(T.pvNews) + " " + dTxt(nSince, lang, NOW, true) : L(T.pvNews30)) + ":", ...news.map((n) => "- " + n.k + ": " + n.v))
            if (mdv.length) out.push("", L(T.ptVetMd) + ":", ...mdv.slice(0, 6).map((m) => "- " + m.ti + ": " + mdLine(m) + " (" + mdWhen(m) + ")"))
            if (pts.length) out.push("", L(T.ptW) + ": " + pts.slice(-6).map((y) => dTxt(y.d, lang, NOW) + " " + wFmt(y.kg) + (y.v ? " (" + L(T.ptAtVet) + ")" : "")).join(", "))
            if (prot.length) out.push("", L(T.ptVetSec[3]) + ":", ...prot.slice(0, 6).map((e) => "- " + dTxt(e.d, lang, NOW, true) + " " + entLine(p, e)))
            out.push("", L(T.ptVetFoot))
            const b = out.join("\n")
            return b.length > 1800 ? b.slice(0, 1790) + "…" : b
        }
        const to = isMail(p.vm) ? p.vm : ""
        const mailHref = "mailto:" + to + "?subject=" + encodeURIComponent(subj) + "&body=" + encodeURIComponent(mailBody())
        const fname = "freshys-" + (slug(pfNm(p)) || (lang === "hr" ? "ljubimac" : "pet")) + "-" + today + ".html"
        let canShare = false
        try {
            canShare = typeof navigator !== "undefined" && typeof File !== "undefined" && !!navigator.canShare && navigator.canShare({ files: [new File(["x"], "x.html", { type: "text/html" })] })
        } catch (e) {}
        const dl = async () => {
            const h = await reportHtml(subj, lang)
            if (h) saveFile(fname, h, "text/html")
        }
        const share = async () => {
            const h = await reportHtml(subj, lang)
            if (!h) return
            try {
                await navigator.share({ files: [new File([h], fname, { type: "text/html" })], title: subj, text: L(T.ptMailIntro) })
            } catch (e: any) {
                if (!e || e.name !== "AbortError") setVmsg(L(T.ptShareFail))
            }
        }
        return (
            <div className="fz-pt-vet fz-pxv">
                {vfDone && (
                    <div className="fz-px-vfok fz-noprint" role="status">
                        <span className="fz-pt-ic c-g">{ptIco("check", 18)}</span>
                        <b id="fz-pxv-ok" tabIndex={-1}>
                            {L(T.ptVfDone)}
                        </b>
                        <button type="button" className="fz-btn fz-btn--g fz-btn--sm" onClick={() => (setVfDone(false), goPx("dash", true))}>
                            {L(T.ptVfSeeIt)}
                        </button>
                    </div>
                )}
                <div className="fz-pxv-cols fz-noprint">
                    <div className="fz-pxv-col">
                        {nextPass(p)}
                        {lastPass(p)}
                    </div>
                    <div className="fz-pxv-col">
                        <section className="fz-pt-card fz-pt-send fz-pxv-send" aria-labelledby="fz-pxv-sdh">
                            <h3 className="fz-pt-k" id="fz-pxv-sdh">
                                {L(T.pvPaperK)}
                            </h3>
                            {p.vn ? (
                                <div className="fz-pt-clin">
                                    <span className="fz-pt-ic c-g">{ptIco("vet", 18)}</span>
                                    <div>
                                        <b>{p.vn}</b>
                                        {p.va && <small>{p.va}</small>}
                                    </div>
                                    <button type="button" className="fz-link" onClick={() => openVpk(p)}>
                                        {L(T.ptVetChg)}
                                    </button>
                                </div>
                            ) : (
                                <button type="button" className="fz-link fz-pt-pickl" onClick={() => openVpk(p)}>
                                    {ptIco("vet", 17)}
                                    {L(T.ptVetPick)}
                                </button>
                            )}
                            <label className="fz-lbl" htmlFor="fz-pt-vm">
                                {L(T.ptVetMail)}
                                <input id="fz-pt-vm" className="fz-inp" type="email" inputMode="email" autoComplete="off" maxLength={120} value={p.vm} placeholder={L(T.ptVetMailPh)} onChange={(e) => saveProf({ ...p, vm: e.target.value.trim() })} />
                            </label>
                            <div className="fz-pt-sendb">
                                <button type="button" className="fz-btn fz-btn--p fz-btn--sm" onClick={() => typeof window !== "undefined" && window.print()}>
                                    {ptIco("print", 17)}
                                    {L(T.ptPrint)}
                                </button>
                                <a className="fz-btn fz-btn--g fz-btn--sm" href={mailHref}>
                                    {L(T.ptSendMail)}
                                </a>
                                {canShare && (
                                    <button type="button" className="fz-btn fz-btn--g fz-btn--sm" onClick={share}>
                                        {L(T.ptShareF)}
                                    </button>
                                )}
                                <button type="button" className="fz-link" onClick={dl}>
                                    {L(T.ptDlF)}
                                </button>
                            </div>
                            <p className="fz-hint">{L(T.ptPdfHint)}</p>
                            <div className="fz-pxv-per">
                                <span>{L(T.ptPerK)}</span>
                                {seg(T.ptPer, vp, (i) => setVp(i), T.ptPerK)}
                            </div>
                            <button type="button" className="fz-btn fz-btn--g fz-btn--sm fz-pxv-tog" aria-expanded={ppv} aria-controls="fz-pt-sheet" onClick={() => setPpv(!ppv)}>
                                {ptIco("kt", 17)}
                                {L(ppv ? T.pvHide : T.pvSee)}
                            </button>
                            {vmsg && (
                                <p className="fz-hint fz-hint--w" role="status">
                                    {vmsg}
                                </p>
                            )}
                        </section>
                        {pastList(p)}
                    </div>
                </div>
                <article className={"fz-pt-sheet fz-pxv-sheet" + (ppv ? "" : " is-off")} id="fz-pt-sheet" aria-hidden={ppv ? undefined : true}>
                    <header className="fz-pxv-shh">
                        <div>
                            <span className="fz-pt-kt">Freshy's · {L(T.pvForVet)}</span>
                            <h2>{yourPet(p)}</h2>
                            <p>{basicsOf(p)}</p>
                        </div>
                        <div className="fz-pxv-shr">
                            <b>{dTxt(today, lang, NOW, true)}</b>
                            {nv && nv.d === today && <span>{nv.ti}</span>}
                            {p.vn && (
                                <span>
                                    {p.vn}
                                    {p.va ? ", " + p.va : ""}
                                </span>
                            )}
                        </div>
                    </header>
                    {x && rows.length > 0 && (
                        <div className="fz-pxv-shc">
                            <h3>
                                {L(T.pvLast)} · {dTxt(x.d, lang, NOW, true)}
                                {x.by ? " · " + x.by : ""}
                            </h3>
                            <table className="fz-pxv-ct">
                                <thead>
                                    <tr>
                                        <td />
                                        <th scope="col">{L(T.pvSaidS)}</th>
                                        <th scope="col">{L(T.pvNow)}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rows.map((r, i) => (
                                        <tr key={i}>
                                            <th scope="row">{r.k}</th>
                                            <td>{r.said}</td>
                                            <td>
                                                <b>{r.now}</b>
                                                {r.sub ? " · " + r.sub : ""}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {nxOf(x) && (
                                <p className="fz-pxv-ctl">
                                    {cap(L(T.pvCtl))} {dTxt(nxOf(x), lang, NOW, true)}
                                    {x.nxr ? " · " + x.nxr : ""}
                                </p>
                            )}
                        </div>
                    )}
                    {qs.length > 0 && (
                        <>
                            <h3>{L(T.pvQs)}</h3>
                            <ol className="fz-pxv-qs">
                                {qs.map((q, i) => (
                                    <li key={i}>{q}</li>
                                ))}
                            </ol>
                        </>
                    )}
                    <h3>{x || lastVet ? L(T.pvNews) + " " + dTxt(nSince, lang, NOW, true) : L(T.pvNews30)}</h3>
                    {news.length ? (
                        <ul className="fz-pt-vl">
                            {news.map((n, i) => (
                                <li key={i}>
                                    <span>{n.k}</span>
                                    <div>{n.v}</div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>{L(T.ptKtNoth)}</p>
                    )}
                    <h3>{L(T.ptVetMd)}</h3>
                    {mdv.length || meds.length ? (
                        <ul className="fz-pt-vl">
                            {mdv.map((m) => (
                                <li key={m.id}>
                                    <span>{mdWhen(m)}</span>
                                    <div>
                                        <b>{m.ti}</b> {mdLine(m)}
                                    </div>
                                </li>
                            ))}
                            {meds.map(line)}
                        </ul>
                    ) : (
                        <p>{L(T.ptNone)}</p>
                    )}
                    <div className="fz-pxv-lines">
                        <h3>{L(T.pvVetLines)}</h3>
                        <div className="fz-pxv-ln" aria-hidden="true">
                            <i />
                            <i />
                            <i />
                            <i />
                        </div>
                    </div>
                    <div className="fz-pxv-rest">
                        <h3>{L(T.ptVetSec[1])}</h3>
                        {pts.length ? (
                            <>
                                <WChart pts={pts} goal={goal} proj={null} lang={lang} now={NOW} label={L(T.ptW)} goalTxt={L(T.ptGoalL) + " " + wFmt(goal)} projTxt="" h={170} />
                                {pts.some((y) => y.v) && (
                                    <p className="fz-pt-leg">
                                        <i aria-hidden="true" />
                                        {L(T.ptAtVet)}
                                    </p>
                                )}
                                <p className="fz-pt-wl">{pts.slice(-12).map((y) => dTxt(y.d, lang, NOW, true) + ": " + wFmt(y.kg) + (y.v ? " (" + L(T.ptAtVet) + ")" : "")).join(" · ")}</p>
                            </>
                        ) : (
                            <p>{L(T.ptNone)}</p>
                        )}
                        {other && <p className="fz-pxv-oth">{other}</p>}
                        <h3>{L(T.ptVetSec[2])}</h3>
                        {hs.length ? <ul className="fz-pt-vl">{hs.map(line)}</ul> : <p>{L(T.ptNone)}</p>}
                        <h3>{L(T.ptVetSec[3])}</h3>
                        {prot.length ? <ul className="fz-pt-vl">{prot.map(line)}</ul> : <p>{L(T.ptNone)}</p>}
                        <h3>{L(T.ptVetFood)}</h3>
                        <ul className="fz-pt-vl">
                            {curFood && (
                                <li>
                                    <span>{L(T.ptVetCurFood)}</span>
                                    <div>{curFood}</div>
                                </li>
                            )}
                            <li>
                                <span>{L(T.ptMl7)}</span>
                                <div>{mlDays.length ? (kcAvg ? nf(kcAvg, lang) + " kcal " + L(T.ptVetAvgDay) + " · " : "") + mlDays.length + " " + L(T.ptVetDaysW) + (kt ? " · " + scaleLbl(p) + ": " + kcR(kt, p) : "") : L(T.ptNone)}</div>
                            </li>
                            {foods.map(([nm, o]) => (
                                <li key={nm}>
                                    <span>{o.n + "×"}</span>
                                    <div>
                                        {nm}
                                        {o.kc ? " · " + nf(o.kc, lang) + " kcal" : ""}
                                    </div>
                                </li>
                            ))}
                        </ul>
                        {p.sp === 0 && (
                            <>
                                <h3>{L(T.ptVetWalk)}</h3>
                                <p>{wk30.length ? [walkN(wk30.length) + (lang === "en" ? " on " + wkDays + " " + (wkDays === 1 ? "day" : "days") : " u " + wkDays + " " + plHr(wkDays, ["dan", "dana", "dana"])), wkKm > 0 ? n2(wkKm) + " " + L(T.ptWkKmT) : "", wkMin > 0 ? nf(wkMin, lang) + " " + L(T.ptWkMinT) : ""].filter(Boolean).join(" · ") : L(T.ptNone)}</p>
                            </>
                        )}
                        <h3>{L(T.ptVetSec[5])}</h3>
                        {d14.some((y) => y.c) ? (
                            <ul className="fz-pt-vl">
                                {CK_K.map((k, ki) => (
                                    <li key={k}>
                                        <span>{L(T.ptCkK[ki])}</span>
                                        <div>{ckTxt(ki)}</div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>{L(T.ptNone)}</p>
                        )}
                        {pics.length > 0 && <h3>{L(T.ptPhotos)}</h3>}
                        {pics.length ? (
                            <div className="fz-pt-vpics">
                                {pics.map(({ id, e }) => (
                                    <figure key={id}>
                                        <PhImg id={id} alt={entTitle(p, e)} />
                                        <figcaption>
                                            {dTxt(e.d, lang, NOW, true)} · {entTitle(p, e)}
                                        </figcaption>
                                    </figure>
                                ))}
                            </div>
                        ) : null}
                    </div>
                    <footer>
                        {L(T.ptVetFoot)} {L(T.ptKtVetTip)}
                    </footer>
                </article>
            </div>
        )
    }

    /* ---------- Plus, second build: sidebar, today, meals, walks, medicines, days to remember ---------- */
    /* Everything here is what the owner writes down. Walks are never tracked and get no calories;
       medicines are written exactly as the vet prescribed them and Freshy's never suggests a dose. */

    const upd = (patch: Partial<PStore>) => {
        if (ps) commit({ ...ps, ...patch })
    }
    /* "1,5" and "1.5" are both numbers; anything else is not */
    const numP = (s: string) => {
        const t = s.trim().replace(",", ".")
        return /^\d*\.?\d+$/.test(t) ? parseFloat(t) : NaN
    }
    const n2 = (x: number) => nf(x, lang, Math.round(x * 100) % 10 ? 2 : Math.round(x * 10) % 10 ? 1 : 0)
    const cap = (x: string) => x.charAt(0).toUpperCase() + x.slice(1)
    const dowOf = (s: string) => (lang === "en" ? DOW_EN : DOW_HR)[dOf(s).getDay()]
    const dayHead = (s: string) => (s === ymd(NOW) ? L(T.ptToday2) : cap(dowOf(s)) + ", " + dTxt(s, lang, NOW))
    const monS = (s: string) => (lang === "en" ? MON_EN[dOf(s).getMonth()].slice(0, 3) : MON_HR_S[dOf(s).getMonth()])
    const focusId = (id: string) =>
        setTimeout(() => {
            const el = typeof document !== "undefined" ? document.getElementById(id) : null
            if (el) el.focus({ preventScroll: true } as FocusOptions)
        }, 0)
    /* remove in two steps: "Remove", then a red "Yes, remove"; never a browser confirm() */
    const twoStep = (id: string, label: string, yes: string, fn: () => void, what: string) =>
        rmId === id ? (
            <span className="fz-px-rmq">
                <button
                    type="button"
                    id="fz-px-rmy"
                    className="fz-btn fz-btn--sm fz-pf-del"
                    onClick={() => {
                        setRmId("")
                        fn()
                        focusId("fz-px-h")
                    }}
                >
                    {yes}
                </button>
                <button
                    type="button"
                    className="fz-link"
                    onClick={() => {
                        setRmId("")
                        focusId("fz-px-rm-" + id)
                    }}
                >
                    {L(T.ptCancel)}
                </button>
            </span>
        ) : (
            <button type="button" id={"fz-px-rm-" + id} className="fz-link fz-px-rm" onClick={() => setRmId(id)} aria-label={label + ": " + what}>
                {label}
            </button>
        )
    const rmBtn = (id: string, fn: () => void, what: string) => twoStep(id, L(T.ptRm), L(T.ptRmY), fn, what)
    /* small bar chart: one bar per day or week, the value written above it; optional band (the amount from the scale) */
    type Bar = { k: string; lab: string; v: number; txt: string; aria: string; sel?: boolean; on?: () => void }
    const bars = (items: Bar[], label: string, band?: [number, number] | null) => {
        const max = Math.max(1, ...items.map((x) => x.v), band ? band[1] * 1.12 : 0)
        const pick = items.some((x) => x.on)
        const body = (x: Bar) => (
            <>
                <span className="fz-px-bv">{x.txt}</span>
                <span className="fz-px-bt">
                    {band && <span className="fz-px-band" style={{ bottom: (band[0] / max) * 100 + "%", height: ((band[1] - band[0]) / max) * 100 + "%" }} />}
                    <i style={{ height: (x.v > 0 ? Math.max(3, (x.v / max) * 100) : 0) + "%" }} />
                </span>
                <span className="fz-px-bl">{x.lab}</span>
            </>
        )
        return pick ? (
            <div className="fz-px-bars" role="group" aria-label={label}>
                {items.map((x) => (
                    <button key={x.k} type="button" className="fz-px-bar" aria-pressed={!!x.sel} aria-label={x.aria} onClick={x.on}>
                        {body(x)}
                    </button>
                ))}
            </div>
        ) : (
            <div className="fz-px-bars" role="img" aria-label={label + ": " + items.map((x) => x.aria).join(", ")}>
                {items.map((x) => (
                    <div key={x.k} className="fz-px-bar" aria-hidden="true">
                        {body(x)}
                    </div>
                ))}
            </div>
        )
    }

    /* --- meals: picked from the kitchen (Freshy's recipes, the full list, the meal builder) or from the owner's own foods --- */
    const mlOf = (p: Pet) => (ps && ps.ml ? ps.ml.filter((m) => m.pet === p.id) : [])
    const kc100Of = (p: Pet) => {
        const k = parseFloat(p.kc100.replace(",", "."))
        return k >= 20 && k <= 900 ? k : 0
    }
    /* the amount from the scale is worked out only for healthy dogs (AAHA 2021); other pets get no number */
    /* the amount a day: what the vet wrote (kcal), else the AAHA range for a healthy dog */
    const kcTarget = (p: Pet): [number, number] | null => {
        const v = kcVet(p)
        if (v) return [v, v]
        return p.sp === 0 && p.health === 0 ? kcalRange(dogOf(p, NOW)) : null
    }
    const kcR = (t: [number, number], p?: Pet) => (p && kcVet(p) ? nf(Math.round(t[0]), lang) + " kcal" : nf(rK(t[0]), lang) + (rK(t[1]) > rK(t[0]) ? "–" + nf(rK(t[1]), lang) : "") + " kcal")
    const scaleLbl = (p: Pet) => L(kcVet(p) ? T.ptViPer : T.ptMlScale)
    const pcW = (n: number) => (lang === "en" ? (n === 1 ? "piece" : "pieces") : plHr(n, ["komad", "komada", "komada"]))
    const porW = (n: number) => (lang === "en" ? (n === 1 ? "portion" : "portions") : plHr(n, ["porcija", "porcije", "porcija"]))
    const allCat = catalog || catCache
    /* where a meal comes from and how many kcal one unit has (0 = not known: then only the amount is written down) */
    type MSrc = { ti: string; u: string; per: number; k: number; info: string; pw?: (n: number) => string }
    const srcOf = (src: string, p: Pet): MSrc | null => {
        if (src === "cur") {
            const k100 = kc100Of(p)
            return { ti: L(T.ptMlK[0]), u: "g", per: k100 / 100, k: 0, info: L(T.pfFoods[p.food] || T.pfFoods[0]) + " · " + (k100 ? nf(k100, lang) + " " + L(T.per100) : L(T.ptFdNoKc)) + " · " + L(T.ptFdProf) }
        }
        if (src.startsWith("fd:")) {
            const f = (ps && ps.fd ? ps.fd : []).find((x) => x.id === src.slice(3))
            if (!f) return null
            return f.u === "por"
                ? { ti: f.n, u: "por", per: f.kc, k: 1, info: L(T.ptFdT[4]) + " · 1 " + porW(1) + " ≈ " + nf(f.kc, lang) + " kcal" }
                : { ti: f.n, u: "g", per: f.kc / 100, k: f.t === 3 ? 3 : 2, info: L(T.ptFdT[f.t]) + " · " + (f.kc ? nf(f.kc, lang) + " " + L(T.per100) : L(T.ptFdNoKc)) }
        }
        if (src.startsWith("r:")) {
            const r = RECIPES.find((x) => x.id === src.slice(2))
            if (!r) return null
            const pw = r.pcw ? (n: number) => pl(lang, n, r.pcw!.en, r.pcw!.hr) : undefined
            return r.kc.pc
                ? { ti: L(r.t), u: "pc", per: r.kc.pc, k: 3, info: "1 " + (pw ? pw(1) : pcW(1)) + " ≈ " + nf(Math.round(r.kc.pc), lang) + " kcal", pw }
                : kpgR(r)
                  ? { ti: L(r.t), u: "g", per: kpgR(r), k: 1, info: "100 g ≈ " + nf(Math.round(kpgR(r) * 100), lang) + " kcal" }
                  : { ti: L(r.t), u: "ml", per: r.kc.g || 0, k: r.kind === "treat" ? 3 : 1, info: r.kc.g ? "100 ml ≈ " + nf(Math.round(r.kc.g * 100), lang) + " kcal" : L(T.ptFdNoKc) }
        }
        if (src.startsWith("c:")) {
            const r = allCat ? allCat.find((x) => cId(x) === src.slice(2)) : undefined
            if (!r) return null
            const ti = lang === "hr" && r.th ? r.th : r.t
            const kc = r.kc,
                k = r.k === "t" ? 3 : 1
            if (!kc) return { ti, u: "g", per: 0, k, info: L(T.ptFdNoKc) }
            if (kc.p === "pc") {
                const pw = (n: number) => (lang === "en" ? (kc.we ? (n === 1 ? kc.we[0] : kc.we[1]) : pcW(n)) : plHr(n, PC_HR[kc.w || ""] || ["komad", "komada", "komada"]))
                return { ti, u: "pc", per: kc.k / kc.a, k, info: "1 " + pw(1) + " ≈ " + nf(Math.round(kc.k / kc.a), lang) + " kcal", pw }
            }
            if (kpgC(r)) return { ti, u: "g", per: kpgC(r), k, info: "100 g ≈ " + nf(Math.round(kpgC(r) * 100), lang) + " kcal" }
            if (kc.p === "ml") return { ti, u: "ml", per: kc.k / kc.a, k, info: nf(Math.round(kc.a), lang) + " ml ≈ " + nf(Math.round(kc.k), lang) + " kcal" }
            return { ti, u: "por", per: kc.k, k, info: "1 " + porW(1) + " ≈ " + nf(Math.round(kc.k), lang) + " kcal" }
        }
        return null
    }
    const FD_IC = ["dry", "can", "bowl", "treat", "pot"]
    const thumbOf = (src: string) => {
        if (src.startsWith("r:")) {
            const r = RECIPES.find((x) => x.id === src.slice(2))
            return r ? r.img + "?scale-down-to=256" : ""
        }
        if (src.startsWith("c:")) {
            const r = allCat ? allCat.find((x) => cId(x) === src.slice(2)) : undefined
            return r ? cImg(r, 256) : ""
        }
        return ""
    }
    const icOfSrc = (src: string, k: number, p: Pet) => {
        if (src === "cur") return p.food === 0 ? "dry" : p.food === 1 ? "can" : "bowl"
        if (src.startsWith("fd:")) {
            const f = (ps && ps.fd ? ps.fd : []).find((x) => "fd:" + x.id === src)
            return f ? FD_IC[f.t] || "bowl" : "bowl"
        }
        return k === 3 ? "treat" : "bowl"
    }
    const srcVis = (src: string, k: number, p: Pet, sm?: boolean) => {
        const th = src ? thumbOf(src) : ""
        return th ? (
            <img className={"fz-px-th" + (sm ? " sm" : "")} src={th} alt="" loading="lazy" />
        ) : (
            <span className={"fz-pt-ic fz-px-tic c-" + (k === 3 ? "o" : "g") + (sm ? " sm" : "")} aria-hidden="true">
                {ptIco(icOfSrc(src, k, p), sm ? 14 : 19)}
            </span>
        )
    }
    const mlName = (m: Meal, p: Pet) => {
        const s = m.src ? srcOf(m.src, p) : null
        return s ? s.ti : m.ti || L(T.ptMlK[m.k])
    }
    const amtOf = (u: string, q: number, s?: MSrc | null) => (u === "pc" ? n2(q) + " " + (s && s.pw ? s.pw(q) : pcW(q)) : u === "ml" ? n2(q) + " ml" : u === "por" ? n2(q) + " " + porW(q) : n2(q) + " g")
    const amtTxt = (m: Meal, p: Pet) => amtOf(m.u, m.q || m.g, m.src ? srcOf(m.src, p) : null)
    const unitW = (u: string) => (u === "pc" ? pcW(2) : u === "por" ? porW(2) : u)
    const mlSort = (a: Meal, b: Meal) => ((a.tm || "99") < (b.tm || "99") ? -1 : (a.tm || "99") > (b.tm || "99") ? 1 : a.at - b.at)
    const qMax = (u: string) => (u === "pc" ? 200 : u === "por" ? 50 : 5000)
    /* the last three different meals, to log the same again with one tap */
    const recentOf = (p: Pet) => {
        const seen = new Set<string>()
        const out: Meal[] = []
        mlOf(p)
            .filter((m) => m.src && m.q > 0)
            .sort((a, b) => b.at - a.at)
            .forEach((m) => {
                if (out.length < 3 && !seen.has(m.src) && srcOf(m.src, p)) {
                    seen.add(m.src)
                    out.push(m)
                }
            })
        return out
    }
    const addMeal = (p: Pet, day: string, pre?: { src: string; q: number }) => {
        if (!ps) return
        const now = new Date()
        let m: Meal
        if (pre || mf.tab !== 2) {
            const src = pre ? pre.src : mf.src
            const s = src ? srcOf(src, p) : null
            if (!s) return setFmsg(L(T.ptMlPickF))
            const q = pre ? pre.q : numP(mf.q)
            if (!(q > 0 && q <= qMax(s.u))) return setFmsg(L(T.ptMlQBad))
            const qq = Math.round(q * 100) / 100
            m = { id: newId(), pet: p.id, d: day, tm: pre ? hmNow(now) : isTm(mf.tm) ? mf.tm : "", at: now.getTime(), k: s.k, ti: s.ti.slice(0, 60), g: s.u === "g" ? qq : 0, kc: Math.round(qq * s.per), u: s.u, q: qq, src }
        } else {
            const g = numP(mf.q)
            if (!(g > 0 && g <= 5000)) return setFmsg(L(T.ptMlNeed))
            const kc0 = mf.kc.trim() ? numP(mf.kc) : 0
            if (!(kc0 >= 0 && kc0 <= 20000)) return setFmsg(L(T.ptMlKcBad))
            const gg = Math.round(g * 10) / 10
            m = { id: newId(), pet: p.id, d: day, tm: isTm(mf.tm) ? mf.tm : "", at: now.getTime(), k: 2, ti: mf.ti.trim().slice(0, 60), g: gg, kc: Math.round(kc0), u: "g", q: gg, src: "" }
        }
        upd({ ml: [...(ps.ml || []), m].slice(-3000) })
        setFmsg("")
        if (!pre) setMf({ ...mf, q: "", ti: "", kc: "", tm: hmNow(now) })
    }
    const saveFood = () => {
        if (!ps || !ff) return
        if (!ff.n.trim()) return setFmsg(L(T.ptFdNeed))
        const kc = ff.kc.trim() ? numP(ff.kc) : 0
        if (ff.kc.trim() && !(kc >= 20 && kc <= 900)) return setFmsg(L(T.ptFdKcBad))
        const f: Food = { id: newId(), n: ff.n.trim().slice(0, 60), t: ff.t, kc: Math.round(kc * 10) / 10, u: "g", at: Date.now() }
        upd({ fd: [...(ps.fd || []), f].slice(-60) })
        setFf(null)
        setFmsg("")
        setMf({ ...mf, src: "fd:" + f.id, q: "" })
    }
    /* from the kitchen (a recipe, the meal builder) straight into the meal log of a dog in My pets */
    const kitchenPet = () => (prof && prof.sp === 0 ? prof : ps ? ps.pets.find((x) => x.sp === 0) || null : null)
    const logMeal = (src: string, q: number, tab = 1) => {
        const kp = kitchenPet()
        if (!ps || !kp) return
        if (ps.cur !== kp.id) {
            const s = { ...ps, cur: kp.id }
            commit(s)
            syncDog(s)
        }
        setMf({ tab, src, q: q > 0 ? String(Math.round(q * 100) / 100).replace(".", lang === "hr" ? "," : ".") : "", tm: hmNow(new Date()), ti: "", kc: "", qs: "" })
        setFf(null)
        setMday("")
        setFmsg("")
        setRmId("")
        setMdf(null)
        setPmode("res")
        setPv("meal")
        go({ p: "dog" })
    }
    const logBuilt = (title: string, kcal: number) => {
        const kp = kitchenPet()
        if (!ps || !kp) return
        const fd = ps.fd || []
        const kc = Math.round(kcal)
        const old = fd.find((f) => f.u === "por" && f.n === title.slice(0, 60) && f.kc === kc)
        const f: Food = old || { id: newId(), n: title.slice(0, 60), t: 4, kc, u: "por", at: Date.now() }
        if (!old || ps.cur !== kp.id) {
            const s: PStore = { ...ps, cur: kp.id, fd: old ? fd : [...fd, f].slice(-60) }
            commit(s)
            if (ps.cur !== kp.id) syncDog(s)
        }
        setMf({ tab: 0, src: "fd:" + f.id, q: "1", tm: hmNow(new Date()), ti: "", kc: "", qs: "" })
        setFf(null)
        setMday("")
        setFmsg("")
        setRmId("")
        setMdf(null)
        setPmode("res")
        setPv("meal")
        go({ p: "dog" })
    }
    const kitchenBtn = (fn: () => void, bare?: boolean) => {
        const kp = kitchenPet()
        if (!kp || (LIVE && !isPlus)) return null
        const b = (
            <button type="button" className="fz-btn fz-btn--g fz-btn--sm fz-px-kbb" onClick={isPlus ? fn : goPlus}>
                {ptIco("bowl", 16)}
                {L(T.ptKbLog)}
                {ps && ps.pets.length > 1 ? " · " + yourPet(kp) : ""}
                {!isPlus && <span className="fz-px-kbp">Plus</span>}
            </button>
        )
        return bare ? b : <div className="fz-px-kb">{b}</div>
    }
    const optRow = (p: Pet, src: string, s: MSrc, rm?: React.ReactNode) => (
        <div key={src} className="fz-px-optw">
            <button type="button" className="fz-px-opt" aria-pressed={mf.src === src} onClick={() => setMf({ ...mf, src, q: mf.src === src ? mf.q : "" })}>
                <span className="fz-px-rad" aria-hidden="true" />
                {srcVis(src, s.k, p)}
                <span className="fz-pt-rb">
                    <b>{s.ti}</b>
                    <small>{s.info}</small>
                </span>
            </button>
            {rm}
        </div>
    )
    const mealForm = (p: Pet, day: string) => {
        const today = ymd(NOW)
        const mine: [string, MSrc][] = [
            ...(p.sp === 0 ? (["cur"] as string[]) : []),
            ...(ps && ps.fd ? ps.fd : []).slice().sort((a, b) => b.at - a.at).map((f) => "fd:" + f.id),
        ]
            .map((src) => [src, srcOf(src, p)] as [string, MSrc | null])
            .filter((x): x is [string, MSrc] => !!x[1])
        const qn = norm(mf.qs)
        const own = RECIPES.map((r) => "r:" + r.id)
        const found: string[] = !qn
            ? own.slice(0, mf.more ? own.length : 6)
            : [
                  ...RECIPES.filter((r) => norm(r.t.en + " " + r.t.hr).includes(qn)).map((r) => "r:" + r.id),
                  ...(allCat ? allCat.filter((r) => norm(r.t + " " + r.th).includes(qn)).map((r) => "c:" + cId(r)) : []),
              ].slice(0, 8)
        const list: [string, MSrc][] = [...(mf.src && (mf.src.startsWith("r:") || mf.src.startsWith("c:")) && !found.includes(mf.src) ? [mf.src] : []), ...found]
            .map((src) => [src, srcOf(src, p)] as [string, MSrc | null])
            .filter((x): x is [string, MSrc] => !!x[1])
        const sel = mf.tab !== 2 && mf.src ? srcOf(mf.src, p) : null
        const showAmt = mf.tab === 2 || (!!sel && (mf.tab === 0 ? !mf.src.startsWith("r:") && !mf.src.startsWith("c:") : mf.src.startsWith("r:") || mf.src.startsWith("c:")))
        const u = mf.tab === 2 ? "g" : sel ? sel.u : "g"
        const q = numP(mf.q)
        const prev = sel && q > 0 && q <= qMax(sel.u) ? Math.round(q * sel.per) : 0
        const again = recentOf(p)
        return (
            <section className="fz-pt-card" aria-labelledby="fz-px-mlf">
                <h3 className="fz-pt-k" id="fz-px-mlf">
                    {L(T.ptMlAdd)}
                    {day !== today ? " · " + dTxt(day, lang, NOW) : ""}
                </h3>
                {again.length > 0 && (
                    <div className="fz-px-again">
                        <span className="fz-px-dk">{L(T.ptMlAgain)}</span>
                        {again.map((m) => (
                            <button key={m.id} type="button" className="fz-px-agb" onClick={() => addMeal(p, day, { src: m.src, q: m.q })} aria-label={L(T.ptMlAdd) + ": " + mlName(m, p) + ", " + amtTxt(m, p)}>
                                {srcVis(m.src, m.k, p, true)}
                                <span>
                                    {mlName(m, p)} · {amtTxt(m, p)}
                                </span>
                            </button>
                        ))}
                    </div>
                )}
                <div className="fz-seg fz-px-tabs" role="group" aria-label={L(T.ptMlAdd)}>
                    {T.ptMlTabs.map((x, i) => (
                        <button key={i} type="button" aria-pressed={mf.tab === i} onClick={() => (i !== mf.tab && setMf({ ...mf, tab: i, src: "", q: "" }), setFf(null), setFmsg(""))}>
                            {L(x)}
                        </button>
                    ))}
                </div>
                {mf.tab === 0 && (
                    <>
                        {mine.length ? <div className="fz-px-pick">{mine.map(([src, s]) => optRow(p, src, s, src.startsWith("fd:") ? rmBtn("fd-" + src.slice(3), () => ps && (upd({ fd: (ps.fd || []).filter((x) => "fd:" + x.id !== src) }), mf.src === src && setMf({ ...mf, src: "" })), s.ti) : null))}</div> : <p className="fz-pt-d">{L(T.ptFdNone)}</p>}
                        {ff ? (
                            <div className="fz-px-ff">
                                <div className="fz-px-f2">
                                    <label className="fz-lbl" htmlFor="fz-px-ffn">
                                        {L(T.ptMlName)}
                                        <input id="fz-px-ffn" className="fz-inp" maxLength={60} autoComplete="off" value={ff.n} placeholder={L(T.ptFdNamePh)} onChange={(e) => setFf({ ...ff, n: e.target.value })} />
                                    </label>
                                    <label className="fz-lbl" htmlFor="fz-px-ffk">
                                        {L(T.ptFdKc)}
                                        <input id="fz-px-ffk" className="fz-inp" inputMode="decimal" autoComplete="off" maxLength={5} value={ff.kc} onChange={(e) => setFf({ ...ff, kc: e.target.value })} />
                                    </label>
                                </div>
                                <div className="fz-px-chips" role="group" aria-label={L(T.ptFdTK)}>
                                    {T.ptFdT.slice(0, 4).map((x, i) => (
                                        <button key={i} type="button" className="fz-chip" aria-pressed={ff.t === i} onClick={() => setFf({ ...ff, t: i })}>
                                            {L(x)}
                                        </button>
                                    ))}
                                </div>
                                <p className="fz-hint">{L(T.ptFdHint)}</p>
                                {fmsg && (
                                    <p className="fz-hint fz-hint--w" role="alert">
                                        {fmsg}
                                    </p>
                                )}
                                <div className="fz-px-fbar">
                                    <button type="button" className="fz-btn fz-btn--g fz-btn--sm" onClick={() => (setFf(null), setFmsg(""))}>
                                        {L(T.ptCancel)}
                                    </button>
                                    <button type="button" className="fz-btn fz-btn--p fz-btn--sm" onClick={saveFood}>
                                        {L(T.ptFdSave)}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button type="button" className="fz-link fz-px-fdadd" onClick={() => (setFf({ n: "", t: 0, kc: "" }), setFmsg(""), focusId("fz-px-ffn"))}>
                                {L(T.ptFdAdd)}
                            </button>
                        )}
                    </>
                )}
                {mf.tab === 1 && (
                    <>
                        <label className="fz-lbl fz-px-f" htmlFor="fz-px-mls">
                            {L(T.ptMlFind)}
                            <input id="fz-px-mls" className="fz-inp" type="search" autoComplete="off" value={mf.qs} placeholder={L(T.ptMlFindPh)} onChange={(e) => setMf({ ...mf, qs: e.target.value })} />
                        </label>
                        {list.length ? <div className="fz-px-pick">{list.map(([src, s]) => optRow(p, src, s))}</div> : <p className="fz-pt-d">{allCat || !qn ? L(T.ptMlNoRes) : L(T.ptMlLoading)}</p>}
                        {!qn && !mf.more && own.length > 6 && (
                            <button type="button" className="fz-link fz-px-fdadd" onClick={() => setMf({ ...mf, more: true })}>
                                {L(T.ptMlMore)} ({own.length})
                            </button>
                        )}
                        {qn && !allCat && list.length > 0 && <p className="fz-hint">{L(T.ptMlLoading)}</p>}
                    </>
                )}
                {mf.tab === 2 && (
                    <label className="fz-lbl fz-px-f" htmlFor="fz-px-mln">
                        {L(T.ptMlName)}
                        <input id="fz-px-mln" className="fz-inp" maxLength={60} autoComplete="off" value={mf.ti} placeholder={L(T.ptMlOtherPh)} onChange={(e) => setMf({ ...mf, ti: e.target.value })} />
                    </label>
                )}
                {showAmt && !ff && (
                    <>
                        <div className={mf.tab === 2 ? "fz-px-f3" : "fz-px-f2 fz-px-f2a"}>
                            <label className="fz-lbl" htmlFor="fz-px-mlg">
                                {L(T.ptMlQ)} ({unitW(u)})
                                <input id="fz-px-mlg" className="fz-inp" inputMode="decimal" autoComplete="off" maxLength={7} value={mf.q} onChange={(e) => setMf({ ...mf, q: e.target.value })} />
                            </label>
                            {mf.tab === 2 && (
                                <label className="fz-lbl" htmlFor="fz-px-mlk">
                                    {L(T.ptMlKc)}
                                    <input id="fz-px-mlk" className="fz-inp" inputMode="decimal" autoComplete="off" maxLength={7} value={mf.kc} onChange={(e) => setMf({ ...mf, kc: e.target.value })} />
                                </label>
                            )}
                            <label className="fz-lbl" htmlFor="fz-px-mlt">
                                {L(T.ptMlTm)}
                                <input id="fz-px-mlt" className="fz-inp" type="time" value={mf.tm} onChange={(e) => setMf({ ...mf, tm: e.target.value })} />
                            </label>
                        </div>
                        {sel && (
                            <p className="fz-hint fz-px-prev" aria-live="polite">
                                {sel.per > 0 ? (prev > 0 ? "≈ " + nf(prev, lang) + " kcal" : sel.info) : L(T.ptMlNoKcF)}
                            </p>
                        )}
                    </>
                )}
                {fmsg && !ff && (
                    <p className="fz-hint fz-hint--w" role="alert">
                        {fmsg}
                    </p>
                )}
                {!ff && (showAmt || mf.tab !== 2) && (
                    <button type="button" className="fz-btn fz-btn--p fz-btn--sm fz-px-go" onClick={() => addMeal(p, day)}>
                        {ptIco("plus", 17)}
                        {L(T.ptMlAdd)}
                    </button>
                )}
            </section>
        )
    }
    const mealSec = (p: Pet) => {
        const today = ymd(NOW)
        const day = mday && mday < today ? mday : today
        const all = mlOf(p)
        const days = Array.from({ length: 7 }, (_, i) => addDays(today, i - 6))
        const t = kcTarget(p)
        const of = (d: string) => all.filter((m) => m.d === d)
        const useKc = all.some((m) => days.includes(m.d) && m.kc > 0)
        const val = (d: string) => of(d).reduce((a, m) => a + (useKc ? m.kc : m.g), 0)
        const unit = useKc ? "kcal" : "g"
        const list = of(day).sort(mlSort)
        const kcSum = list.reduce((a, m) => a + m.kc, 0),
            gSum = list.reduce((a, m) => a + m.g, 0)
        const withM = days.filter((d) => of(d).length)
        const avg = withM.length ? withM.reduce((a, d) => a + val(d), 0) / withM.length : 0
        const mx = t ? Math.max(t[1] * 1.25, kcSum) : 0
        return (
            <div className="fz-px-cols">
                <section className="fz-pt-card" aria-labelledby="fz-px-mlh">
                    <div className="fz-pt-kh">
                        <h3 className="fz-pt-k" id="fz-px-mlh">
                            {dayHead(day)}
                        </h3>
                        {day !== today && (
                            <button type="button" className="fz-link" onClick={() => setMday("")}>
                                {L(T.ptToday2)}
                            </button>
                        )}
                    </div>
                    {list.length ? (
                        <>
                            <div className="fz-pt-mid">
                                {kcSum > 0 ? nf(kcSum, lang) : gSum > 0 ? n2(gSum) : list.length}
                                <small>{kcSum > 0 ? "kcal" : gSum > 0 ? "g" : pl(lang, list.length, ["meal", "meals"], ["obrok", "obroka", "obroka"])}</small>
                            </div>
                            {kcSum > 0 && t && <p className="fz-pt-d">{L(T.ptMlOf) + " " + kcR(t, p) + ", " + scaleLbl(p)}</p>}
                            {gVet(p) && (
                                <p className="fz-pt-d">
                                    {L(T.pvVetAmt)}: {n2((gVet(p) as VetIns).fq)} g {L(T.ptADay)}
                                    {(gVet(p) as VetIns).fn ? " · " + (gVet(p) as VetIns).fn : ""}
                                </p>
                            )}
                            {kcSum > 0 && t && (
                                <div className="fz-px-meter" role="img" aria-label={nf(kcSum, lang) + " kcal, " + L(T.ptMlOf) + " " + kcR(t, p)}>
                                    <span className={"fz-px-mband" + (rK(t[1]) > rK(t[0]) ? "" : " line")} style={{ left: (t[0] / mx) * 100 + "%", width: ((t[1] - t[0]) / mx) * 100 + "%" }} />
                                    <i style={{ width: Math.min(100, (kcSum / mx) * 100) + "%" }} />
                                </div>
                            )}
                            {kcSum > 0 && list.some((m) => !m.kc) && <p className="fz-hint">{L(T.ptMlUnk)}</p>}
                            <ul className="fz-pt-rows fz-px-list">
                                {list.map((m) => (
                                    <li key={m.id} className="fz-pt-up">
                                        {srcVis(m.src, m.k, p)}
                                        <span className="fz-pt-rb">
                                            <b>{mlName(m, p)}</b>
                                            <small>{[m.tm, amtTxt(m, p), m.kc ? nf(m.kc, lang) + " kcal" : ""].filter(Boolean).join(" · ")}</small>
                                        </span>
                                        {rmBtn("ml-" + m.id, () => ps && upd({ ml: (ps.ml || []).filter((x) => x.id !== m.id) }), mlName(m, p) + (m.tm ? " " + m.tm : ""))}
                                    </li>
                                ))}
                            </ul>
                        </>
                    ) : (
                        <p className="fz-pt-d">{L(T.ptMlNone)}</p>
                    )}
                    {!t && <p className="fz-pt-note fz-px-note">{L(p.sp === 0 ? T.ptMlAsk : T.ptMlNoT)}</p>}
                </section>
                {mealForm(p, day)}
                <section className="fz-pt-card fz-px-full" aria-labelledby="fz-px-ml7">
                    <div className="fz-pt-kh">
                        <h3 className="fz-pt-k" id="fz-px-ml7">
                            {L(T.ptMl7)}
                        </h3>
                        {withM.length > 0 && (
                            <span className="fz-px-avg">
                                {L(T.ptMlAvg)}: <b>{useKc ? nf(Math.round(avg), lang) : n2(Math.round(avg))}</b> {unit}
                            </span>
                        )}
                    </div>
                    {bars(
                        days.map((d) => ({
                            k: d,
                            lab: d === today ? L(T.ptTodayW) : dowOf(d).slice(0, 3),
                            v: val(d),
                            txt: of(d).length ? (useKc ? nf(val(d), lang) : n2(val(d))) : "–",
                            aria: dayHead(d) + ": " + (of(d).length ? (useKc ? nf(val(d), lang) : n2(val(d))) + " " + unit : L(T.ptMlNone)),
                            sel: d === day,
                            on: () => setMday(d === today ? "" : d),
                        })),
                        L(T.ptMl7),
                        useKc ? t : null
                    )}
                    {useKc && t && (
                        <p className="fz-px-leg">
                            <i aria-hidden="true" className={rK(t[1]) > rK(t[0]) ? "" : "line"} />
                            {kcR(t, p)}, {scaleLbl(p)}
                        </p>
                    )}
                    <p className="fz-hint">{L(T.ptMlPick)}</p>
                    <p className="fz-hint">{L(T.ptMlSrcN)}</p>
                </section>
            </div>
        )
    }

    /* --- walks: a tap, kilometres and minutes only if the owner wants them --- */
    const wkOf = (p: Pet) => (ps && ps.wk ? ps.wk.filter((w) => w.pet === p.id) : [])
    const walkN = (n: number) => n + " " + pl(lang, n, ["walk", "walks"], ["šetnja", "šetnje", "šetnji"])
    const addWalk = (p: Pet) => {
        if (!ps) return
        const km = wf.km.trim() ? numP(wf.km) : 0,
            min = wf.min.trim() ? numP(wf.min) : 0
        if (!(km >= 0 && km <= 100) || !(min >= 0 && min <= 600)) return setFmsg(L(T.ptWkBad))
        const today = ymd(new Date())
        const w: Walk = { id: newId(), pet: p.id, d: isYmd(wf.d) && wf.d <= today ? wf.d : today, at: Date.now(), km: Math.round(km * 100) / 100, min: Math.round(min) }
        upd({ wk: [...(ps.wk || []), w].slice(-2000) })
        setFmsg("")
        setWf({ d: "", km: "", min: "" })
    }
    const walkSec = (p: Pet) => {
        const today = ymd(NOW),
            w0 = weekStart(today)
        const all = wkOf(p).sort((a, b) => -byT(a, b))
        const inW = (ws: string) => all.filter((w) => w.d >= ws && w.d <= addDays(ws, 6))
        const tw = inW(w0)
        const km = tw.reduce((a, w) => a + w.km, 0),
            min = tw.reduce((a, w) => a + w.min, 0)
        const weeks = [3, 2, 1, 0].map((i) => addDays(w0, -7 * i))
        return (
            <div className="fz-px-cols">
                <section className="fz-pt-card" aria-labelledby="fz-px-wkb">
                    <button type="button" id="fz-px-wkb" className="fz-btn fz-btn--p fz-px-big" onClick={() => addWalk(p)}>
                        {ptIco("walk", 22)}
                        {L(T.ptWkNow)}
                    </button>
                    <div className="fz-px-f3">
                        <label className="fz-lbl" htmlFor="fz-px-wkk">
                            {L(T.ptWkKm)}
                            <input id="fz-px-wkk" className="fz-inp" inputMode="decimal" autoComplete="off" maxLength={6} value={wf.km} onChange={(e) => setWf({ ...wf, km: e.target.value })} />
                        </label>
                        <label className="fz-lbl" htmlFor="fz-px-wkm">
                            {L(T.ptWkMin)}
                            <input id="fz-px-wkm" className="fz-inp" inputMode="numeric" autoComplete="off" maxLength={4} value={wf.min} onChange={(e) => setWf({ ...wf, min: e.target.value })} />
                        </label>
                        <label className="fz-lbl" htmlFor="fz-px-wkd">
                            {L(T.ptWkDay)}
                            <input id="fz-px-wkd" className="fz-inp" type="date" max={today} value={wf.d || today} onChange={(e) => setWf({ ...wf, d: e.target.value })} />
                        </label>
                    </div>
                    {fmsg && (
                        <p className="fz-hint fz-hint--w" role="alert">
                            {fmsg}
                        </p>
                    )}
                    <p className="fz-px-sr" aria-live="polite">
                        {L(T.ptTdWkK)}: {walkN(tw.length)}
                    </p>
                </section>
                <section className="fz-pt-card" aria-labelledby="fz-px-wkw">
                    <h3 className="fz-pt-k" id="fz-px-wkw">
                        {L(T.ptTdWkK)}
                    </h3>
                    <div className="fz-pt-mid">
                        {tw.length}
                        <small>{pl(lang, tw.length, ["walk", "walks"], ["šetnja", "šetnje", "šetnji"])}</small>
                    </div>
                    {(km > 0 || min > 0) && <p className="fz-pt-d">{[km > 0 ? n2(km) + " " + L(T.ptWkKmT) : "", min > 0 ? nf(min, lang) + " " + L(T.ptWkMinT) : ""].filter(Boolean).join(" · ")}</p>}
                    <h3 className="fz-pt-k fz-px-k2">{L(T.ptWk4)}</h3>
                    {bars(
                        weeks.map((ws) => {
                            const ww = inW(ws),
                                k = ww.reduce((a, w) => a + w.km, 0)
                            return { k: ws, lab: dTxt(ws, lang, NOW), v: ww.length, txt: String(ww.length), aria: dTxt(ws, lang, NOW) + ": " + walkN(ww.length) + (k > 0 ? ", " + n2(k) + " km" : "") }
                        }),
                        L(T.ptWk4)
                    )}
                </section>
                <section className="fz-pt-card fz-px-full" aria-labelledby="fz-px-wkl">
                    <h3 className="fz-pt-k" id="fz-px-wkl">
                        {L(T.ptWkList)}
                    </h3>
                    {all.length ? (
                        <ul className="fz-pt-rows fz-px-list">
                            {all.slice(0, 10).map((w) => (
                                <li key={w.id} className="fz-pt-up">
                                    <span className="fz-pt-ic c-g">{ptIco("walk", 18)}</span>
                                    <span className="fz-pt-rb">
                                        <b>{dayHead(w.d)}</b>
                                        {(w.km > 0 || w.min > 0) && <small>{[w.km > 0 ? n2(w.km) + " km" : "", w.min > 0 ? w.min + " min" : ""].filter(Boolean).join(" · ")}</small>}
                                    </span>
                                    {rmBtn("wk-" + w.id, () => ps && upd({ wk: (ps.wk || []).filter((x) => x.id !== w.id) }), dayHead(w.d))}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="fz-pt-d">{L(T.ptWkNone)}</p>
                    )}
                </section>
            </div>
        )
    }

    /* --- medicines: exactly as prescribed, with a tick for each time a dose is given --- */
    const mdOf = (p: Pet) => (ps && ps.md ? ps.md.filter((m) => m.pet === p.id) : [])
    const given = (m: Med, tm: string, d: string) => !!ps && (ps.dz || []).some((z) => z.med === m.id && z.d === d && z.tm === tm)
    const TM_SUG = ["08:00", "20:00", "14:00", "11:00", "17:00"]
    const openMed = (m?: Med) => {
        setFmsg("")
        setRmId("")
        setMdf(m ? { id: m.id, isNew: false, ti: m.ti, rx: m.rx, d0: m.d0, d1: m.d1, tms: [...m.tms] } : { id: newId(), isNew: true, ti: "", rx: "", d0: ymd(new Date()), d1: "", tms: [] })
    }
    const closeMed = () => {
        const back = mdf && !mdf.isNew ? "fz-px-me-" + mdf.id : "fz-px-mdadd"
        setMdf(null)
        setFmsg("")
        focusId(back)
    }
    const saveMed = (p: Pet) => {
        if (!ps || !mdf) return
        if (!mdf.ti.trim() || !mdf.rx.trim()) return setFmsg(L(T.ptMdNeed))
        if (mdf.tms.some((x) => !isTm(x))) return setFmsg(L(T.ptMdTmBad))
        const d0 = isYmd(mdf.d0) ? mdf.d0 : ymd(new Date())
        if (isYmd(mdf.d1) && mdf.d1 < d0) return setFmsg(L(T.ptMdBadEnd))
        const tms = Array.from(new Set(mdf.tms)).sort().slice(0, 4)
        const old = (ps.md || []).find((x) => x.id === mdf.id)
        const m: Med = { id: mdf.id, pet: p.id, ti: mdf.ti.trim().slice(0, 60), rx: mdf.rx.trim().slice(0, 300), d0, d1: isYmd(mdf.d1) ? mdf.d1 : "", tms, at: old ? old.at : Date.now(), vi: old ? old.vi : "" }
        const today = ymd(new Date())
        upd({
            md: old ? (ps.md || []).map((x) => (x.id === m.id ? m : x)) : [...(ps.md || []), m],
            /* ticks of a time that was taken out stay in the past, not today */
            dz: (ps.dz || []).filter((z) => z.med !== m.id || z.d < today || tms.includes(z.tm)),
        })
        setMdf(null)
        setFmsg("")
        focusId("fz-px-me-" + m.id)
    }
    const toggleDose = (m: Med, tm: string) => {
        if (!ps) return
        const today = ymd(new Date())
        const dz = ps.dz || []
        const has = dz.some((z) => z.med === m.id && z.d === today && z.tm === tm)
        upd({ dz: has ? dz.filter((z) => !(z.med === m.id && z.d === today && z.tm === tm)) : [...dz, { med: m.id, d: today, tm, at: Date.now() }].slice(-4000) })
    }
    const medWhen = (m: Med) => {
        const today = ymd(NOW)
        return [
            m.d0 > today ? L(T.ptMdStarts) + " " + dTxt(m.d0, lang, NOW) : L(T.ptMdSince) + " " + dTxt(m.d0, lang, NOW),
            m.d1 ? (m.d1 < today ? L(T.ptMdFin) + " " + dTxt(m.d1, lang, NOW) : L(T.ptMdUntil) + " " + dTxt(m.d1, lang, NOW)) : L(T.ptMdNoEnd),
            m.tms.length ? m.tms.join(", ") : L(T.ptMdNoTmS),
        ].join(" · ")
    }
    const medCal = (p: Pet) => {
        const today = ymd(new Date())
        const who = pfNm(p) ? pfNm(p) + ": " : ""
        const ms = mdOf(p).filter((m) => (!m.d1 || m.d1 >= today) && m.tms.length)
        if (!ms.length) return
        saveFile(
            "freshys-" + (lang === "hr" ? "lijekovi" : "medicines") + ".ics",
            icsTimed(
                ms.flatMap((m) => m.tms.map((tm) => ({ id: m.id, d0: m.d0 < today ? today : m.d0, d1: m.d1, tm, t: who + m.ti + " – " + m.rx }))),
                []
            ),
            "text/calendar"
        )
    }
    const medForm = (p: Pet) =>
        mdf ? (
            <section className="fz-pt-card fz-px-full fz-px-form" aria-labelledby="fz-px-mdh">
                <h3 className="fz-pt-k" id="fz-px-mdh">
                    {mdf.isNew ? L(T.ptMdNew) : L(T.ptEdit) + ": " + mdf.ti}
                </h3>
                <p className="fz-pt-d">{L(T.ptMdLead)}</p>
                <div className="fz-px-f2">
                    <label className="fz-lbl" htmlFor="fz-px-mdn">
                        {L(T.ptMdName)}
                        <input id="fz-px-mdn" className="fz-inp" maxLength={60} autoComplete="off" value={mdf.ti} placeholder={L(T.ptMdNamePh)} onChange={(e) => setMdf({ ...mdf, ti: e.target.value })} />
                    </label>
                    <label className="fz-lbl" htmlFor="fz-px-mdr">
                        {L(T.ptMdRx)}
                        <input id="fz-px-mdr" className="fz-inp" maxLength={300} autoComplete="off" value={mdf.rx} placeholder={L(T.ptMdRxPh)} onChange={(e) => setMdf({ ...mdf, rx: e.target.value })} />
                    </label>
                    <label className="fz-lbl" htmlFor="fz-px-md0">
                        {L(T.ptMdFrom)}
                        <input id="fz-px-md0" className="fz-inp" type="date" value={mdf.d0} onChange={(e) => setMdf({ ...mdf, d0: e.target.value })} />
                    </label>
                    <label className="fz-lbl" htmlFor="fz-px-md1">
                        {L(T.ptMdTo)}
                        <input id="fz-px-md1" className="fz-inp" type="date" min={mdf.d0} value={mdf.d1} onChange={(e) => setMdf({ ...mdf, d1: e.target.value })} />
                    </label>
                </div>
                <fieldset className="fz-px-tms">
                    <legend className="fz-lbl">{L(T.ptMdTimes)}</legend>
                    <div className="fz-px-tmr">
                        {mdf.tms.map((tm, i) => (
                            <span key={i} className="fz-px-tm">
                                <input className="fz-inp" type="time" aria-label={L(T.ptMdTimeN) + " " + (i + 1)} value={tm} onChange={(e) => setMdf({ ...mdf, tms: mdf.tms.map((x, k) => (k === i ? e.target.value : x)) })} />
                                <button type="button" className="fz-px-x" aria-label={L(T.ptMdRmTm) + " " + (i + 1)} onClick={() => setMdf({ ...mdf, tms: mdf.tms.filter((_, k) => k !== i) })}>
                                    ×
                                </button>
                            </span>
                        ))}
                        {mdf.tms.length < 4 && (
                            <button type="button" className="fz-btn fz-btn--g fz-btn--sm" onClick={() => setMdf({ ...mdf, tms: [...mdf.tms, TM_SUG.find((x) => !mdf.tms.includes(x)) || "12:00"] })}>
                                {L(T.ptMdAddTm)}
                            </button>
                        )}
                    </div>
                    <p className="fz-hint">{L(mdf.tms.length ? T.ptMdCalT : T.ptMdNoTm)}</p>
                </fieldset>
                {fmsg && (
                    <p className="fz-hint fz-hint--w" role="alert">
                        {fmsg}
                    </p>
                )}
                <div className="fz-px-fbar">
                    <button type="button" className="fz-btn fz-btn--g fz-btn--sm" onClick={closeMed}>
                        {L(T.ptCancel)}
                    </button>
                    <button type="button" className="fz-btn fz-btn--p fz-btn--sm" onClick={() => saveMed(p)}>
                        {L(T.ptMdSave)}
                    </button>
                </div>
            </section>
        ) : null
    const medSec = (p: Pet) => {
        const today = ymd(NOW)
        const all = mdOf(p)
        const cur = all.filter((m) => !m.d1 || m.d1 >= today).sort((a, b) => (a.d0 < b.d0 ? -1 : a.d0 > b.d0 ? 1 : a.at - b.at))
        const past = all.filter((m) => m.d1 && m.d1 < today).sort((a, b) => (a.d1 > b.d1 ? -1 : 1))
        return (
            <div className="fz-px-cols">
                {medForm(p)}
                <section className="fz-pt-card fz-px-full" aria-labelledby="fz-px-mdc">
                    <div className="fz-pt-kh">
                        <h3 className="fz-pt-k" id="fz-px-mdc">
                            {L(T.ptMdNow)}
                        </h3>
                        <div className="fz-px-acts">
                            {cur.some((m) => m.tms.length) && (
                                <button type="button" className="fz-btn fz-btn--g fz-btn--sm" onClick={() => medCal(p)}>
                                    {ptIco("cal", 16)}
                                    {L(T.ptMdCal)}
                                </button>
                            )}
                            {!mdf && (
                                <button type="button" id="fz-px-mdadd" className="fz-btn fz-btn--p fz-btn--sm" onClick={() => openMed()}>
                                    {ptIco("plus", 16)}
                                    {L(T.ptMdNew)}
                                </button>
                            )}
                        </div>
                    </div>
                    {cur.length ? (
                        <ul className="fz-px-meds">
                            {cur.map((m) => {
                                const on = medOn(m, today)
                                return (
                                    <li key={m.id}>
                                        <div className="fz-px-mh">
                                            <span className="fz-pt-ic c-s">{ptIco("med", 18)}</span>
                                            <div className="fz-pt-rb">
                                                <b>{m.ti}</b>
                                                <span className="fz-px-rx">{qt(m.rx)}</span>
                                                <small>{medWhen(m)}</small>
                                                {m.vi && <span className="fz-pt-chip c-g fz-pxv-vchip">{L(T.ptViBy)}</span>}
                                            </div>
                                        </div>
                                        {on && m.tms.length > 0 && (
                                            <div className="fz-px-doses" role="group" aria-label={L(T.ptMdToday) + ", " + m.ti + ". " + L(T.ptMdTick)}>
                                                <span className="fz-px-dk">{L(T.ptMdToday)}</span>
                                                {m.tms.map((tm) => {
                                                    const ok = given(m, tm, today)
                                                    return (
                                                        <button key={tm} type="button" className={"fz-px-dose" + (ok ? " ok" : "")} aria-pressed={ok} onClick={() => toggleDose(m, tm)}>
                                                            <span className="fz-px-box" aria-hidden="true">
                                                                {ok && ptIco("check", 15)}
                                                            </span>
                                                            <b>{tm}</b>
                                                            <small>{L(ok ? T.ptMdGiven : T.ptMdNot)}</small>
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                        )}
                                        <div className="fz-px-mact">
                                            <button type="button" id={"fz-px-me-" + m.id} className="fz-link" onClick={() => openMed(m)} aria-label={L(T.ptEdit) + ": " + m.ti}>
                                                {L(T.ptEdit)}
                                            </button>
                                            {on && twoStep("st-" + m.id, L(T.ptMdStop), L(T.ptMdStopQ), () => ps && upd({ md: (ps.md || []).map((x) => (x.id === m.id ? { ...x, d1: ymd(new Date()) } : x)) }), m.ti)}
                                            {rmBtn("md-" + m.id, () => ps && upd({ md: (ps.md || []).filter((x) => x.id !== m.id), dz: (ps.dz || []).filter((z) => z.med !== m.id) }), m.ti)}
                                        </div>
                                    </li>
                                )
                            })}
                        </ul>
                    ) : (
                        <p className="fz-pt-d">{L(T.ptMdNone)}</p>
                    )}
                </section>
                {past.length > 0 && (
                    <section className="fz-pt-card fz-px-full" aria-labelledby="fz-px-mdp">
                        <h3 className="fz-pt-k" id="fz-px-mdp">
                            {L(T.ptMdPast)}
                        </h3>
                        <ul className="fz-pt-rows fz-px-list">
                            {past.slice(0, 20).map((m) => (
                                <li key={m.id} className="fz-pt-up">
                                    <span className="fz-pt-ic c-n">{ptIco("med", 18)}</span>
                                    <span className="fz-pt-rb">
                                        <b>{m.ti}</b>
                                        <small>
                                            {qt(m.rx)} · {dTxt(m.d0, lang, NOW, true)} – {dTxt(m.d1, lang, NOW, true)}
                                        </small>
                                    </span>
                                    {rmBtn("md-" + m.id, () => ps && upd({ md: (ps.md || []).filter((x) => x.id !== m.id), dz: (ps.dz || []).filter((z) => z.med !== m.id) }), m.ti)}
                                </li>
                            ))}
                        </ul>
                    </section>
                )}
            </div>
        )
    }

    /* --- days to remember: the birthday from the profile and the owner's own days --- */
    type DRow = { id: string; ti: string; next: string; n: number; sub: string; ic: string; own: boolean }
    const yrsTxt = (n: number) => n + " " + pl(lang, n, ["year", "years"], ["godina", "godine", "godina"])
    const dayRows = (p: Pet): DRow[] => {
        const today = ymd(NOW)
        const out: DRow[] = []
        const b = bdayOf(p, NOW)
        if (b) out.push({ id: "bd", ti: L(T.ptDyBday), next: b.d, n: b.n, sub: b.age > 0 ? (lang === "en" ? "turns " + b.age : "puni " + b.age + " " + plHr(b.age, ["godinu", "godine", "godina"])) : "", ic: "cake", own: false })
        ;(ps && ps.dy ? ps.dy : [])
            .filter((x) => x.pet === p.id)
            .forEach((x) => {
                const next = x.y ? nextYearly(x.d, today) : x.d
                const yrs = x.y ? Number(next.slice(0, 4)) - Number(x.d.slice(0, 4)) : 0
                out.push({ id: x.id, ti: x.ti, next, n: daysTo(next, NOW), sub: x.y ? (yrs > 0 ? yrsTxt(yrs) : L(T.ptDyYearly).toLowerCase()) : L(T.ptDyOnce), ic: "star", own: true })
            })
        /* coming first (soonest on top), days that have passed at the end */
        return out.sort((a, b) => ((a.n < 0) !== (b.n < 0) ? (a.n < 0 ? 1 : -1) : a.n < 0 ? b.n - a.n : a.n - b.n))
    }
    const addDay = (p: Pet) => {
        if (!ps) return
        if (!dyf.ti.trim() || !isYmd(dyf.d)) return setFmsg(L(T.ptDyNeed))
        const x: Day = { id: newId(), pet: p.id, ti: dyf.ti.trim().slice(0, 60), d: dyf.d, y: dyf.y ? 1 : 0, at: Date.now() }
        upd({ dy: [...(ps.dy || []), x].slice(-200) })
        setFmsg("")
        setDyf({ ti: "", d: "", y: true })
    }
    const dayCal = (p: Pet) => {
        if (!ps) return
        const today = ymd(new Date())
        const who = pfNm(p) ? pfNm(p) + ": " : ""
        const b = bdayOf(p, new Date())
        const items = [
            ...(b ? [{ id: "bd-" + p.id, d: b.d, y: 1, t: who + L(T.ptDyBday) }] : []),
            ...(ps.dy || []).filter((x) => x.pet === p.id && (x.y || x.d >= today)).map((x) => ({ id: x.id, d: x.d, y: x.y, t: who + x.ti })),
        ]
        if (items.length) saveFile("freshys-" + (lang === "hr" ? "dani" : "days") + ".ics", icsTimed([], items), "text/calendar")
    }
    const daySec = (p: Pet) => {
        const rows = dayRows(p)
        const sn = p.since && sinceOf(p.since, NOW) ? p.since : ""
        const snTxt = sn ? (lang === "en" ? MON_EN[Number(sn.slice(5, 7)) - 1] + " " + sn.slice(0, 4) : MON_HR_G[Number(sn.slice(5, 7)) - 1] + " " + sn.slice(0, 4) + ".") : ""
        return (
            <div className="fz-px-cols">
                <section className="fz-pt-card fz-px-full" aria-labelledby="fz-px-dyh">
                    <div className="fz-pt-kh">
                        <h3 className="fz-pt-k" id="fz-px-dyh">
                            {L(T.ptUp)}
                        </h3>
                        {rows.some((r) => r.n >= 0) && (
                            <button type="button" className="fz-btn fz-btn--g fz-btn--sm" onClick={() => dayCal(p)}>
                                {ptIco("cal", 16)}
                                {L(T.ptDyCal)}
                            </button>
                        )}
                    </div>
                    {rows.length || sn ? (
                        <ul className="fz-pt-rows fz-px-list">
                            {rows.map((r) => (
                                <li key={r.id} className={"fz-pt-up" + (r.n === 0 ? " fz-px-now" : "")}>
                                    <span className={"fz-pt-date" + (r.n < 0 ? " fz-px-past" : "")} aria-hidden="true">
                                        <b>{dOf(r.next).getDate()}</b>
                                        <span>{monS(r.next)}</span>
                                    </span>
                                    <span className="fz-pt-rb">
                                        <b>
                                            {r.ic === "cake" && <span className="fz-px-ric">{ptIco("cake", 16)}</span>}
                                            {r.ti}
                                        </b>
                                        <small className={r.n === 0 ? "fz-px-tday" : ""}>{[dTxt(r.next, lang, NOW, dOf(r.next).getFullYear() !== NOW.getFullYear()), r.n === 0 ? L(T.ptDyToday) : r.n < 0 ? L(T.ptDyPast) : relDay(r.next), r.sub, r.own ? "" : L(T.ptDyFromP)].filter(Boolean).join(" · ")}</small>
                                    </span>
                                    {r.own && rmBtn("dy-" + r.id, () => ps && upd({ dy: (ps.dy || []).filter((x) => x.id !== r.id) }), r.ti)}
                                </li>
                            ))}
                            {sn && (
                                <li className="fz-pt-up">
                                    <span className="fz-pt-ic c-g">{ptIco("home", 18)}</span>
                                    <span className="fz-pt-rb">
                                        <b>
                                            {L(T.ptDySince)} {snTxt}
                                        </b>
                                        <small>{[sinceTxt(p), L(T.ptDyFromP)].filter(Boolean).join(" · ")}</small>
                                    </span>
                                </li>
                            )}
                        </ul>
                    ) : (
                        <p className="fz-pt-d">{L(T.ptDyNone)}</p>
                    )}
                </section>
                <section className="fz-pt-card fz-px-full" aria-labelledby="fz-px-dya">
                    <h3 className="fz-pt-k" id="fz-px-dya">
                        {L(T.ptDyAdd)}
                    </h3>
                    <div className="fz-px-f3 fz-px-f3w">
                        <label className="fz-lbl" htmlFor="fz-px-dyn">
                            {L(T.ptDyName)}
                            <input id="fz-px-dyn" className="fz-inp" maxLength={60} autoComplete="off" value={dyf.ti} placeholder={L(T.ptDyNamePh)} onChange={(e) => setDyf({ ...dyf, ti: e.target.value })} />
                        </label>
                        <label className="fz-lbl" htmlFor="fz-px-dyd">
                            {L(T.ptDyDate)}
                            <input id="fz-px-dyd" className="fz-inp" type="date" value={dyf.d} onChange={(e) => setDyf({ ...dyf, d: e.target.value })} />
                        </label>
                        <label className="fz-px-chk" htmlFor="fz-px-dyy">
                            <input id="fz-px-dyy" type="checkbox" checked={dyf.y} onChange={(e) => setDyf({ ...dyf, y: e.target.checked })} />
                            {L(T.ptDyYearly)}
                        </label>
                    </div>
                    {fmsg && (
                        <p className="fz-hint fz-hint--w" role="alert">
                            {fmsg}
                        </p>
                    )}
                    <button type="button" className="fz-btn fz-btn--p fz-btn--sm fz-px-go" onClick={() => addDay(p)}>
                        {ptIco("plus", 17)}
                        {L(T.ptDyAdd)}
                    </button>
                </section>
            </div>
        )
    }

    /* ---------- vet visits (Pregledi). The next visit is a card that gathers the questions; "Show the vet" opens it for the vet,
       with what they said last time set against how it went. Their form starts from last time's instructions and marks what is
       the same, new or changed; what they save stamps the card and goes into Medicines, reminders and the next paper.
       Freshy's only keeps and shows it: it never advises. ---------- */
    const VET_T = ["vet", "inj", "ill", "vac"]
    const insOf = (p: Pet) => (ps && ps.vi ? ps.vi.filter((x) => x.pet === p.id).sort((a, b) => (a.d < b.d ? 1 : a.d > b.d ? -1 : b.at - a.at)) : [])
    const vzOf = (p: Pet) => (ps && ps.vz ? ps.vz.filter((z) => z.pet === p.id) : [])
    /* the next check-up of a visit: the date in its journal entry, where the owner can change it */
    const nxOf = (x: VetIns) => {
        const e = ps ? ps.log.find((y) => y.id === x.ent) : undefined
        return e ? e.nx || "" : x.nx
    }
    type NV = { id: string; d: string; ti: string; plan: boolean }
    /* the next visit: an appointment the owner wrote in, or a check-up or vaccination date from the notes, after the last visit the vet wrote */
    const nextVisit = (p: Pet): NV | null => {
        if (!ps) return null
        const today = ymd(NOW)
        const xs = insOf(p)
        const done = xs[0]
        const after = (d: string) => d >= today && (!done || d > done.d)
        const plans: NV[] = vzOf(p)
            .filter((z) => after(z.d))
            .map((z) => ({ id: z.id, d: z.d, ti: z.why ? L(T.ptUpT.vet) + ": " + z.why : L(T.ptUpT.vet), plan: true }))
        const ups: NV[] = upOf(ps.log, p.id, NOW)
            .filter((u) => !u.late && VET_T.includes(u.t) && after(u.d))
            .map((u) => {
                const x = xs.find((y) => y.ent === u.id)
                return { id: u.id, d: u.d, ti: x ? L(T.ptUpT.vet) + (x.nxr ? ": " + x.nxr : "") : upTitle(u), plan: false }
            })
        return [...plans, ...ups].sort((a, b) => (a.d < b.d ? -1 : a.d > b.d ? 1 : a.plan === b.plan ? 0 : a.plan ? -1 : 1))[0] || null
    }
    const wAt = (p: Pet, d: string) => {
        const pts = ps ? wPts(ps.log, p.id).filter((x) => x.d <= d) : []
        return pts.length ? pts[pts.length - 1] : null
    }
    /* the last 7 full days with food written down: the average a day, in grams or in kcal */
    const foodAvg = (p: Pet, u: string) => {
        const today = ymd(NOW)
        const days = Array.from({ length: 7 }, (_, i) => addDays(today, -(i + 1)))
        const val = (m: Meal) => (u === "kcal" ? m.kc : m.g)
        const all = mlOf(p).filter((m) => days.includes(m.d))
        /* grams only add up for one food: the current one when it was written down */
        const cur = u === "g" && all.some((m) => m.src === "cur" && m.g > 0)
        const ml = cur ? all.filter((m) => m.src === "cur") : all
        const got = days.filter((d) => ml.some((m) => m.d === d && val(m) > 0))
        if (!got.length) return null
        return { v: Math.round(got.reduce((a, d) => a + ml.filter((m) => m.d === d).reduce((x, m) => x + val(m), 0), 0) / got.length), n: got.length, cur }
    }
    /* an upcoming check-up the vet set: its reason instead of the vet's name */
    const upTi = (u: Up) => {
        const x = ps && ps.vi ? ps.vi.find((y) => y.ent === u.id) : undefined
        return x ? L(T.ptUpT.vet) + (x.nxr ? ": " + x.nxr : "") : upTitle(u)
    }
    /* doses ticked as given from a day on (at most 60 days back), against how many were planned */
    const dosesSince = (m: Med, from: string) => {
        if (!m.tms.length) return null
        const today = ymd(NOW)
        let sch = 0,
            got = 0
        for (let i = 1; i <= 60; i++) {
            const d = addDays(today, -i)
            if (d < from) break
            if (!medOn(m, d)) continue
            sch += m.tms.length
            got += m.tms.filter((tm) => given(m, tm, d)).length
        }
        return sch ? { sch, got } : null
    }
    const qsOf = (p: Pet) =>
        p.vq
            .split(/\n+/)
            .map((x) => x.trim())
            .filter(Boolean)
    const basicsOf = (p: Pet) => {
        const pts = ps ? wPts(ps.log, p.id) : []
        const last = pts[pts.length - 1]
        return [
            L(T.ptSpN[p.sp]) + (p.sp === 2 && p.kind ? " · " + p.kind : ""),
            p.sp === 0 ? breedTxtOf(p) || "" : "",
            ageTxtOf(p).replace(/ /g, "\u00a0"),
            p.sp !== 2 ? sexTxt(p) + ", " + L(T.pfNeutS[p.neut ? 0 : 1][p.sex]) : "",
            last ? wFmt(last.kg) + "\u00a0(" + dTxt(last.d, lang, NOW).replace(/ /g, "\u00a0") + ")" : "",
        ]
            .filter(Boolean)
            .join(" · ")
    }
    /* what is new since a day: weight, health notes, check-in days that were off and medicines the owner started */
    type NI = { k: string; v: string }
    const newsOf = (p: Pet, since: string): NI[] => {
        if (!ps) return []
        const out: NI[] = []
        const pts = wPts(ps.log, p.id)
        const a = wAt(p, since),
            b = pts[pts.length - 1]
        if (a && b && b.d > a.d && Math.abs(b.kg - a.kg) >= 0.05) {
            const dk = Math.round((b.kg - a.kg) * 10) / 10
            out.push({ k: L(T.ptW), v: wFmt(a.kg) + " → " + wFmt(b.kg) + " (" + (dk < 0 ? "−" : "+") + wFmt(Math.abs(dk)) + ")" })
        }
        const linked = new Set(insOf(p).map((x) => x.ent))
        ps.log
            .filter((e) => e.pet === p.id && ["inj", "ill", "vet", "note"].includes(e.t) && e.d > since && !linked.has(e.id))
            .sort((x, y) => -byT(x, y))
            .slice(0, 6)
            .forEach((e) => out.push({ k: dTxt(e.d, lang, NOW), v: entLine(p, e) }))
        const d30 = ckDays(ps.ck, p.id, NOW, 30).filter((x) => x.d > since && x.c)
        CK_K.forEach((k, ki) => {
            const off = d30.filter((x) => ckLvl(ki, (x.c as Ck)[k]) > 0)
            if (off.length) out.push({ k: L(T.ptCkK[ki]), v: off.map((x) => dTxt(x.d, lang, NOW) + " " + L(T.ptCkV[ki][(x.c as Ck)[k]]).toLowerCase()).join(", ") })
        })
        return out
    }
    /* last time's instructions set against how it went since */
    type CR = { k: string; said: string; now: string; sub: string }
    const cmpRows = (p: Pet, x: VetIns): CR[] => {
        if (!ps) return []
        const today = ymd(NOW)
        const rows: CR[] = []
        const pts = wPts(ps.log, p.id)
        const last = pts[pts.length - 1]
        const then = wAt(p, x.d)
        if (x.goal > 0 || then) {
            const dk = then && last && last.d > then.d ? Math.round((last.kg - then.kg) * 10) / 10 : null
            rows.push({
                k: L(T.ptW),
                said: [x.goal > 0 ? L(T.pvGoalS) + " " + wFmt(x.goal) : "", then ? L(T.pvThen) + " " + wFmt(then.kg) : ""].filter(Boolean).join(" · "),
                now: last ? wFmt(last.kg) : "–",
                sub: dk !== null ? (dk < 0 ? "−" : dk > 0 ? "+" : "±") + wFmt(Math.abs(dk)) + " " + L(T.ptSince) + " " + dTxt(x.d, lang, NOW) : "",
            })
        }
        if (x.fq > 0) {
            const a = foodAvg(p, x.fu)
            rows.push({ k: L(T.ptViFood), said: n2(x.fq) + " " + x.fu + (x.fn ? " · " + x.fn : ""), now: a ? nf(a.v, lang) + " " + x.fu : L(T.pvNotLogged), sub: a ? L(a.cur ? T.pvAvg7Cur : T.pvAvg7) : "" })
        }
        if (x.diet) rows.push({ k: L(T.ptViDiet), said: x.diet + (x.dto ? " · " + L(T.pvUntilD) + " " + dTxt(x.dto, lang, NOW) : ""), now: x.dto && x.dto < today ? L(T.pvEnded) + " " + dTxt(x.dto, lang, NOW) : L(T.pvOngoing), sub: "" })
        mdOf(p)
            .filter((m) => m.vi === x.id)
            .forEach((m) => {
                const ds = dosesSince(m, m.d0 > x.d ? m.d0 : x.d)
                rows.push({ k: m.ti, said: qt(m.rx) + (m.d1 ? " · " + L(T.pvUntilD) + " " + dTxt(m.d1, lang, NOW) : ""), now: ds ? L(T.pvGiven) + " " + ds.got + " " + L(T.pvOf) + " " + ds.sch : L(T.pvNoTicks), sub: "" })
            })
        if (x.watch) {
            const ev = ps.log.filter((e) => e.pet === p.id && (e.t === "inj" || e.t === "ill") && e.d > x.d).sort(byT)
            rows.push({ k: L(T.ptViWatch), said: x.watch, now: ev.length ? ev.map((e) => dTxt(e.d, lang, NOW) + " " + entTitle(p, e)).join(" · ") : L(T.pvNothing), sub: "" })
        }
        return rows
    }
    /* what the vet wrote at one visit, as rows */
    const insRows = (p: Pet, x: VetIns): [string, string, string][] => {
        const e = ps ? ps.log.find((y) => y.id === x.ent) : undefined
        const out: [string, string, string][] = []
        if (e && e.kg) out.push([L(T.ptW), wFmt(e.kg) + " " + L(T.ptOnScale), ""])
        if (x.goal > 0) out.push([L(T.ptViGoal), wFmt(x.goal), ""])
        if (x.fq > 0) out.push([L(T.ptViFood), n2(x.fq) + " " + x.fu + (x.fn ? " · " + x.fn : ""), ""])
        if (x.diet) out.push([L(T.ptViDiet), x.diet + (x.dto ? " · " + L(T.pvUntilD) + " " + dTxt(x.dto, lang, NOW) : ""), ""])
        mdOf(p)
            .filter((m) => m.vi === x.id)
            .forEach((m) => out.push([m.ti, qt(m.rx) + (m.tms.length ? " · " + m.tms.join(", ") : "") + (m.d1 ? " · " + L(T.pvUntilD) + " " + dTxt(m.d1, lang, NOW) : ""), ""]))
        if (nxOf(x)) out.push([L(T.ptViNx), dTxt(nxOf(x), lang, NOW, true) + (x.nxr ? " · " + x.nxr : ""), ""])
        if (x.watch) out.push([L(T.ptViWatch), x.watch, "warn"])
        if (x.note) out.push([L(T.ptViNote), x.note, ""])
        if (x.q.trim()) out.push([L(T.pvQsAsked), x.q.trim().split(/\n+/).join(" · "), ""])
        return out
    }
    const insShort = (x: VetIns) => [x.goal > 0 ? L(T.pvGoalS) + " " + wFmt(x.goal) : "", x.fq > 0 ? n2(x.fq) + " " + x.fu : "", x.diet].filter(Boolean).join(" · ") || (x.note || x.watch).slice(0, 60)
    const stampSvg = (d: string, id: string) => (
        <svg className="fz-pxv-stamp" width="100" height="100" viewBox="0 0 120 120" aria-hidden="true" focusable="false">
            <defs>
                <path id={"fz-pxv-sp-" + id} d="M60,60 m-45,0 a45,45 0 1,1 90,0 a45,45 0 1,1 -90,0" />
            </defs>
            <circle cx="60" cy="60" r="56" fill="none" stroke="currentColor" strokeWidth="2.6" />
            <circle cx="60" cy="60" r="34" fill="none" stroke="currentColor" strokeWidth="1.4" />
            <text fontSize="9.6" fontWeight="700" fill="currentColor">
                <textPath href={"#fz-pxv-sp-" + id} textLength="276" lengthAdjust="spacing">
                    {L(T.pvStamp) + " · " + dTxt(d, lang, NOW, true) + " ·"}
                </textPath>
            </text>
            <path d="M46 61l9 9 19-20" fill="none" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    )
    const toTop = () => {
        if (typeof window === "undefined" || typeof document === "undefined") return
        const el = document.getElementById("fz-px")
        if (el && el.getBoundingClientRect().top < 0) window.scrollTo({ top: window.scrollY + el.getBoundingClientRect().top - 96 })
    }
    const openVv = (p: Pet) => {
        setVv(true)
        setVf(null)
        setVfDone(false)
        setVzf(null)
        setFmsg("")
        setRmId("")
        setPmode("res")
        setPv("vet")
        toTop()
        focusId("fz-pxv-vvh")
    }
    const VF0 = (p: Pet): VForm => {
        const x = insOf(p)[0]
        const today = ymd(new Date())
        const dietOn = !!x && !!x.diet && (!x.dto || x.dto >= today)
        return {
            d: today,
            by: (x && x.by) || p.vn || "",
            kg: "",
            goal: x && x.goal > 0 ? kgIn(x.goal) : p.ideal > 0 ? kgIn(p.ideal) : "",
            fq: x && x.fq > 0 ? kgIn(x.fq) : "",
            fu: x && x.fu === "kcal" ? 1 : 0,
            fn: x ? x.fn : "",
            diet: dietOn && x ? x.diet : "",
            dto: dietOn && x ? x.dto : "",
            md: [],
            nx: "",
            nxr: "",
            watch: x ? x.watch : "",
            note: "",
        }
    }
    const openVf = (p: Pet) => {
        setVf(VF0(p))
        setVv(false)
        setVfDone(false)
        setFmsg("")
        setRmId("")
        setMdf(null)
        setPmode("res")
        setPv("vet")
        toTop()
        focusId("fz-px-vfh")
    }
    const setVm = (i: number, patch: Partial<VForm["md"][number]>) => vf && setVf({ ...vf, md: vf.md.map((m, k) => (k === i ? { ...m, ...patch } : m)) })
    const saveVf = (p: Pet) => {
        if (!ps || !vf) return
        const num = (s: string) => (s.trim() ? numP(s) : 0)
        const kg = num(vf.kg),
            goal = num(vf.goal),
            fq = num(vf.fq)
        if (!(kg >= 0 && kg <= 300) || !(goal >= 0 && goal <= 300) || !(fq >= 0 && fq <= 20000)) return setFmsg(L(T.ptVfBad))
        const mds = vf.md.filter((m) => m.ti.trim() || m.rx.trim())
        if (mds.some((m) => !m.ti.trim() || !m.rx.trim())) return setFmsg(L(T.ptVfMdNeed))
        if (mds.some((m) => m.tms.some((x) => !isTm(x)))) return setFmsg(L(T.ptMdTmBad))
        const now = new Date(),
            today = ymd(now)
        const d = isYmd(vf.d) && vf.d <= today ? vf.d : today
        const nx = isYmd(vf.nx) && vf.nx > d ? vf.nx : ""
        if (!(kg > 0 || goal > 0 || fq > 0 || vf.diet.trim() || mds.length || nx || vf.watch.trim() || vf.note.trim())) return setFmsg(L(T.ptVfNeed))
        const by = vf.by.trim().slice(0, 120)
        const insId = newId(),
            entId = newId()
        const fu = vf.fu ? "kcal" : "g"
        const dto = vf.diet.trim() && isYmd(vf.dto) ? vf.dto : ""
        /* the visit also goes into the journal, so the clinic's scale and the next check-up show where they always did; the instructions themselves live with the visit */
        const ent: Ent = { id: entId, pet: p.id, t: "vet", d, at: now.getTime(), ti: (by || L(T.ptViBy)).slice(0, 80) }
        if (kg > 0) ent.kg = Math.round(kg * 1000) / 1000
        if (vf.note.trim()) ent.tx = vf.note.trim().slice(0, 600)
        if (nx) ent.nx = nx
        const ins: VetIns = { id: insId, pet: p.id, d, by, goal: Math.round(goal * 10) / 10, fq: Math.round(fq * 10) / 10, fu, fn: vf.fn.trim().slice(0, 80), diet: vf.diet.trim().slice(0, 300), dto, watch: vf.watch.trim().slice(0, 600), note: vf.note.trim().slice(0, 600), nx, nxr: vf.nxr.trim().slice(0, 80), ent: entId, at: now.getTime(), q: p.vq.trim().slice(0, 600) }
        const meds: Med[] = mds.map((m) => {
            const d0 = isYmd(m.d0) ? m.d0 : d
            return { id: newId(), pet: p.id, ti: m.ti.trim().slice(0, 60), rx: m.rx.trim().slice(0, 300), d0, d1: isYmd(m.d1) && m.d1 >= d0 ? m.d1 : "", tms: Array.from(new Set(m.tms)).sort().slice(0, 4), at: now.getTime(), vi: insId }
        })
        const log = [...ps.log, ent]
        let pet = ps.pets.find((x) => x.id === p.id) || p
        const pts = wPts(log, pet.id)
        if (pts.length) pet = { ...pet, kg: pts[pts.length - 1].kg }
        if (goal > 0) pet = { ...pet, ideal: Math.round(goal * 10) / 10 }
        /* the questions were for this visit: they stay with it and the box is empty for the next one */
        pet = withGoal({ ...pet, vq: "" }, now)
        const s: PStore = { ...ps, log, pets: ps.pets.map((x) => (x.id === pet.id ? pet : x)), md: [...(ps.md || []), ...meds].slice(-200), vi: [...(ps.vi || []), ins].slice(-100) }
        commit(s)
        syncDog(s)
        setVf(null)
        setVv(false)
        setVfDone(true)
        setFmsg("")
        toTop()
        focusId("fz-pxv-ok")
    }
    /* the instructions count on the overview while something in them is still ahead, or for 30 days after the visit */
    const insNow = (p: Pet) => {
        const x = insOf(p)[0]
        if (!x) return null
        const today = ymd(NOW)
        const live = (x.dto && x.dto >= today) || (nxOf(x) && nxOf(x) >= today) || daysTo(x.d, NOW) >= -30 || mdOf(p).some((m) => m.vi === x.id && medOn(m, today))
        return live ? x : null
    }
    const kcVet = (p: Pet) => {
        const x = insNow(p)
        return x && x.fq > 0 && x.fu === "kcal" ? x.fq : 0
    }
    const gVet = (p: Pet) => {
        const x = insNow(p)
        return x && x.fq > 0 && x.fu === "g" ? x : null
    }
    const savePlan = (p: Pet) => {
        if (!ps || !vzf) return
        const today = ymd(new Date())
        if (!isYmd(vzf.d) || vzf.d < today) return setFmsg(L(T.pvPlanBad))
        upd({ vz: [...(ps.vz || []), { id: newId(), pet: p.id, d: vzf.d, why: vzf.why.trim().slice(0, 80), at: Date.now() }].slice(-100) })
        setVzf(null)
        setFmsg("")
        focusId("fz-pxv-nh")
    }
    /* "same", "new" or "changed" against last time's instructions; a changed field shows the old value struck through */
    const tagOf = (k: string, was: string) =>
        k ? (
            <span className="fz-pxv-tagw">
                <span className={"fz-pxv-tag " + k}>{L(k === "same" ? T.pvSame : k === "new" ? T.pvNew : T.pvChg)}</span>
                {k === "chg" && was && (
                    <span className="fz-pxv-was">
                        {L(T.pvWas)} <s>{was.length > 70 ? was.slice(0, 68) + "…" : was}</s>
                    </span>
                )}
            </span>
        ) : null
    const vfView = (p: Pet) => {
        if (!vf) return null
        const x = insOf(p)[0]
        const today = ymd(NOW)
        const num = (s: string) => (s.trim() ? numP(s) : 0)
        const tg = (now: string, was: string) => (!x ? "" : now === was ? (now ? "same" : "") : !was ? "new" : "chg")
        const g = num(vf.goal),
            q = num(vf.fq)
        const tGoal = tg(g > 0 ? String(g) : "", x && x.goal > 0 ? String(x.goal) : "")
        const tFood = tg(q > 0 ? q + (vf.fu ? "kcal" : "g") + "|" + vf.fn.trim() : "", x && x.fq > 0 ? x.fq + x.fu + "|" + x.fn : "")
        const tDiet = tg(vf.diet.trim() ? vf.diet.trim() + "|" + (vf.dto || "") : "", x && x.diet && (!x.dto || x.dto >= today) ? x.diet + "|" + x.dto : "")
        const tWatch = tg(vf.watch.trim(), x ? x.watch : "")
        const tNx = !x ? "" : vf.nx ? (nxOf(x) ? "chg" : "new") : ""
        const curMeds = mdOf(p).filter((m) => medOn(m, today))
        return (
            <section className="fz-pt-card fz-px-vf" aria-labelledby="fz-px-vfh">
                <span className="fz-pt-kt">Freshy's · {yourPet(p)}</span>
                <h2 id="fz-px-vfh" tabIndex={-1}>
                    {L(T.ptVfH)}
                </h2>
                <p className="fz-pt-d">{L(T.ptVfIntro)}</p>
                {x && (
                    <p className="fz-pxv-pre">
                        {ptIco("note", 16)}
                        <span>
                            {L(T.pvPrefill)} {dTxt(x.d, lang, NOW, true)}
                            {x.by ? " (" + x.by + ")" : ""}. {L(T.pvPrefill2)}
                        </span>
                    </p>
                )}
                <div className="fz-px-f2">
                    <label className="fz-lbl" htmlFor="fz-px-vfd">
                        {L(T.ptVfDate)}
                        <input id="fz-px-vfd" className="fz-inp" type="date" max={today} value={vf.d} onChange={(e) => setVf({ ...vf, d: e.target.value })} />
                    </label>
                    <label className="fz-lbl" htmlFor="fz-px-vfb">
                        {L(T.ptVfBy)}
                        <input id="fz-px-vfb" className="fz-inp" maxLength={120} autoComplete="off" value={vf.by} onChange={(e) => setVf({ ...vf, by: e.target.value })} />
                    </label>
                    <label className="fz-lbl" htmlFor="fz-px-vfk">
                        <span className="fz-pxv-lt">
                            {L(T.ptVfKg)}
                            {tagOf(x && vf.kg.trim() ? "new" : "", "")}
                        </span>
                        <input id="fz-px-vfk" className="fz-inp" inputMode="decimal" autoComplete="off" maxLength={6} value={vf.kg} onChange={(e) => setVf({ ...vf, kg: e.target.value })} />
                    </label>
                    <label className="fz-lbl" htmlFor="fz-px-vfg">
                        <span className="fz-pxv-lt">
                            {L(T.ptVfGoal)}
                            {tagOf(tGoal, x && x.goal > 0 ? wFmt(x.goal) : "")}
                        </span>
                        <input id="fz-px-vfg" className="fz-inp" inputMode="decimal" autoComplete="off" maxLength={6} value={vf.goal} onChange={(e) => setVf({ ...vf, goal: e.target.value })} />
                    </label>
                </div>
                <fieldset className="fz-px-tms">
                    <legend className="fz-lbl">
                        <span className="fz-pxv-lt">
                            {L(T.ptVfFood)}
                            {tagOf(tFood, x && x.fq > 0 ? n2(x.fq) + " " + x.fu + (x.fn ? " · " + x.fn : "") : "")}
                        </span>
                    </legend>
                    <div className="fz-px-vfood">
                        <label className="fz-lbl" htmlFor="fz-px-vfq">
                            {L(T.ptVfFq)}
                            <input id="fz-px-vfq" className="fz-inp" inputMode="decimal" autoComplete="off" maxLength={6} value={vf.fq} onChange={(e) => setVf({ ...vf, fq: e.target.value })} />
                        </label>
                        {seg([X("g", "g"), X("kcal", "kcal")], vf.fu, (i) => setVf({ ...vf, fu: i }), T.ptVfFq)}
                        <label className="fz-lbl" htmlFor="fz-px-vfn">
                            {L(T.ptVfFn)}
                            <input id="fz-px-vfn" className="fz-inp" maxLength={80} autoComplete="off" value={vf.fn} placeholder={L(T.ptVfFnPh)} onChange={(e) => setVf({ ...vf, fn: e.target.value })} />
                        </label>
                    </div>
                </fieldset>
                <div className="fz-px-f2 fz-px-f2w">
                    <label className="fz-lbl" htmlFor="fz-px-vfdi">
                        <span className="fz-pxv-lt">
                            {L(T.ptVfDiet)}
                            {tagOf(tDiet, x && x.diet ? x.diet : "")}
                        </span>
                        <input id="fz-px-vfdi" className="fz-inp" maxLength={300} autoComplete="off" value={vf.diet} placeholder={L(T.ptVfDietPh)} onChange={(e) => setVf({ ...vf, diet: e.target.value })} />
                    </label>
                    <label className="fz-lbl" htmlFor="fz-px-vfdt">
                        {L(T.ptVfDto)}
                        <input id="fz-px-vfdt" className="fz-inp" type="date" min={vf.d} value={vf.dto} onChange={(e) => setVf({ ...vf, dto: e.target.value })} />
                    </label>
                </div>
                <fieldset className="fz-px-tms">
                    <legend className="fz-lbl">
                        <span className="fz-pxv-lt">
                            {L(T.ptVfMd)}
                            {tagOf(x && vf.md.some((m) => m.ti.trim()) ? "new" : "", "")}
                        </span>
                    </legend>
                    {curMeds.length > 0 && (
                        <ul className="fz-pxv-cur">
                            {curMeds.map((m) => (
                                <li key={m.id}>
                                    <span>{L(T.pvNowMd)}</span>
                                    <div>
                                        <b>{m.ti}</b> {qt(m.rx)}
                                        {m.tms.length ? " · " + m.tms.join(", ") : ""}
                                        {m.d1 ? " · " + L(T.pvUntilD) + " " + dTxt(m.d1, lang, NOW) : ""}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                    {vf.md.map((m, i) => (
                        <div key={i} className="fz-px-vmd">
                            <div className="fz-px-f2">
                                <label className="fz-lbl" htmlFor={"fz-px-vmn" + i}>
                                    {L(T.ptMdName)}
                                    <input id={"fz-px-vmn" + i} className="fz-inp" maxLength={60} autoComplete="off" value={m.ti} onChange={(e) => setVm(i, { ti: e.target.value })} />
                                </label>
                                <label className="fz-lbl" htmlFor={"fz-px-vmr" + i}>
                                    {L(T.ptMdRx)}
                                    <input id={"fz-px-vmr" + i} className="fz-inp" maxLength={300} autoComplete="off" value={m.rx} placeholder={L(T.ptMdRxPh)} onChange={(e) => setVm(i, { rx: e.target.value })} />
                                </label>
                                <label className="fz-lbl" htmlFor={"fz-px-vm0" + i}>
                                    {L(T.ptMdFrom)}
                                    <input id={"fz-px-vm0" + i} className="fz-inp" type="date" value={m.d0} onChange={(e) => setVm(i, { d0: e.target.value })} />
                                </label>
                                <label className="fz-lbl" htmlFor={"fz-px-vm1" + i}>
                                    {cap(L(T.ptMdUntil))}
                                    <input id={"fz-px-vm1" + i} className="fz-inp" type="date" min={m.d0} value={m.d1} onChange={(e) => setVm(i, { d1: e.target.value })} />
                                </label>
                            </div>
                            <div className="fz-px-tmr" role="group" aria-label={L(T.ptMdTimes) + ": " + (m.ti || L(T.ptMdName) + " " + (i + 1))}>
                                <span className="fz-px-dk">{L(T.ptMdTimes)}</span>
                                {m.tms.map((tm, j) => (
                                    <span key={j} className="fz-px-tm">
                                        <input className="fz-inp" type="time" aria-label={L(T.ptMdTimeN) + " " + (j + 1)} value={tm} onChange={(e) => setVm(i, { tms: m.tms.map((y, k) => (k === j ? e.target.value : y)) })} />
                                        <button type="button" className="fz-px-x" aria-label={L(T.ptMdRmTm) + " " + (j + 1)} onClick={() => setVm(i, { tms: m.tms.filter((_, k) => k !== j) })}>
                                            ×
                                        </button>
                                    </span>
                                ))}
                                {m.tms.length < 4 && (
                                    <button type="button" className="fz-btn fz-btn--g fz-btn--sm" onClick={() => setVm(i, { tms: [...m.tms, TM_SUG.find((y) => !m.tms.includes(y)) || "12:00"] })}>
                                        {L(T.ptMdAddTm)}
                                    </button>
                                )}
                            </div>
                            <button type="button" className="fz-link fz-px-vmrm" onClick={() => setVf({ ...vf, md: vf.md.filter((_, k) => k !== i) })}>
                                {L(T.ptVfMdRm)}
                            </button>
                        </div>
                    ))}
                    <button type="button" className="fz-btn fz-btn--g fz-btn--sm" onClick={() => setVf({ ...vf, md: [...vf.md, { ti: "", rx: "", d0: vf.d, d1: "", tms: [] }] })}>
                        {L(T.ptVfMdAdd)}
                    </button>
                </fieldset>
                <div className="fz-px-f2 fz-px-f2w">
                    <label className="fz-lbl" htmlFor="fz-px-vfnx">
                        <span className="fz-pxv-lt">
                            {L(T.ptVfNx)}
                            {tagOf(tNx, x && nxOf(x) ? dTxt(nxOf(x), lang, NOW, true) : "")}
                        </span>
                        <input id="fz-px-vfnx" className="fz-inp" type="date" min={vf.d} value={vf.nx} onChange={(e) => setVf({ ...vf, nx: e.target.value })} />
                    </label>
                    <label className="fz-lbl" htmlFor="fz-px-vfnr">
                        {L(T.ptVfNxr)}
                        <input id="fz-px-vfnr" className="fz-inp" maxLength={80} autoComplete="off" value={vf.nxr} placeholder={L(T.ptVfNxrPh)} onChange={(e) => setVf({ ...vf, nxr: e.target.value })} />
                    </label>
                </div>
                <label className="fz-lbl fz-px-f" htmlFor="fz-px-vfw">
                    <span className="fz-pxv-lt">
                        {L(T.ptVfWatch)}
                        {tagOf(tWatch, x ? x.watch : "")}
                    </span>
                    <textarea id="fz-px-vfw" className="fz-inp fz-ta" rows={3} maxLength={600} value={vf.watch} placeholder={L(T.ptVfWatchPh)} onChange={(e) => setVf({ ...vf, watch: e.target.value })} />
                </label>
                <label className="fz-lbl fz-px-f" htmlFor="fz-px-vfo">
                    {L(T.ptVfNote)}
                    <textarea id="fz-px-vfo" className="fz-inp fz-ta" rows={3} maxLength={600} value={vf.note} onChange={(e) => setVf({ ...vf, note: e.target.value })} />
                </label>
                {fmsg && (
                    <p className="fz-hint fz-hint--w" role="alert">
                        {fmsg}
                    </p>
                )}
                <div className="fz-px-fbar">
                    <button
                        type="button"
                        className="fz-btn fz-btn--g fz-btn--sm"
                        onClick={() => {
                            setVf(null)
                            setFmsg("")
                            setVv(true)
                            focusId("fz-pxv-vvh")
                        }}
                    >
                        {L(T.ptCancel)}
                    </button>
                    <button type="button" className="fz-btn fz-btn--p fz-btn--sm" onClick={() => saveVf(p)}>
                        {L(T.ptVfSave)}
                    </button>
                </div>
            </section>
        )
    }
    /* the card opened for the vet: large, only what they need, the same in every language the vet reads it in */
    const vetView = (p: Pet) => {
        if (!ps) return null
        const today = ymd(NOW)
        const x = insOf(p)[0]
        const lastVet = ps.log
            .filter((e) => e.pet === p.id && e.t === "vet" && e.d < today)
            .sort(byT)
            .pop()
        const since = x ? x.d : lastVet ? lastVet.d : addDays(today, -30)
        const rows = x ? cmpRows(p, x) : []
        const news = newsOf(p, since)
        const qs = qsOf(p)
        /* medicines now, and the ones that ended since the last visit */
        const meds = mdOf(p)
            .filter((m) => m.d0 <= today && (!m.d1 || m.d1 >= since))
            .sort((a, b) => (medOn(a, today) !== medOn(b, today) ? (medOn(a, today) ? -1 : 1) : a.d0 < b.d0 ? 1 : -1))
        return (
            <section className="fz-pxv-vv" aria-labelledby="fz-pxv-vvh">
                <div className="fz-pxv-band">
                    <div className="fz-pxv-btop">
                        <span className="fz-pxv-pill">{L(T.pvForVet)}</span>
                        <button
                            type="button"
                            className="fz-pxv-x"
                            onClick={() => {
                                setVv(false)
                                focusId("fz-pxv-show")
                            }}
                        >
                            {L(T.pvClose)}
                        </button>
                    </div>
                    <h2 id="fz-pxv-vvh" tabIndex={-1}>
                        {yourPet(p)}
                    </h2>
                    <p>{basicsOf(p)}</p>
                </div>
                <div className="fz-pxv-vb">
                    {qs.length > 0 && (
                        <section className="fz-pt-card" aria-labelledby="fz-pxv-qh">
                            <h3 className="fz-pt-k" id="fz-pxv-qh">
                                {L(T.pvQs)}
                            </h3>
                            <ol className="fz-pxv-qs">
                                {qs.map((q, i) => (
                                    <li key={i}>{q}</li>
                                ))}
                            </ol>
                        </section>
                    )}
                    {x ? (
                        <section className="fz-pt-card fz-pxv-cmp" aria-labelledby="fz-pxv-ch">
                            <div className="fz-pt-kh">
                                <h3 className="fz-pt-k" id="fz-pxv-ch">
                                    {L(T.pvSaid)} · {dTxt(x.d, lang, NOW)}
                                </h3>
                                {x.by && <span className="fz-px-insby">{x.by}</span>}
                            </div>
                            {rows.map((r, i) => (
                                <div key={i} className="fz-pxv-cr">
                                    <b className="fz-pxv-crk">{r.k}</b>
                                    <div className="fz-pxv-crg">
                                        <div>
                                            <small>{L(T.pvSaidS)}</small>
                                            <span>{r.said}</span>
                                        </div>
                                        <div>
                                            <small>{L(T.pvNow)}</small>
                                            <b>{r.now}</b>
                                            {r.sub && <em>{r.sub}</em>}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {nxOf(x) && (
                                <p className="fz-pxv-ctl">
                                    {cap(L(T.pvCtl))} {dTxt(nxOf(x), lang, NOW, true)}
                                    {x.nxr ? " · " + x.nxr : ""}
                                </p>
                            )}
                        </section>
                    ) : (
                        <p className="fz-pt-note">{L(T.pvFirst)}</p>
                    )}
                    <section className="fz-pt-card" aria-labelledby="fz-pxv-nwh">
                        <h3 className="fz-pt-k" id="fz-pxv-nwh">
                            {x || lastVet ? L(T.pvNews) + " " + dTxt(since, lang, NOW) : L(T.pvNews30)}
                        </h3>
                        {news.length ? (
                            <ul className="fz-pxv-nl">
                                {news.map((n, i) => (
                                    <li key={i}>
                                        <span>{n.k}</span>
                                        <div>{n.v}</div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="fz-pt-d">{L(T.ptKtNoth)}</p>
                        )}
                    </section>
                    {meds.length > 0 && (
                        <section className="fz-pt-card" aria-labelledby="fz-pxv-mh">
                            <h3 className="fz-pt-k" id="fz-pxv-mh">
                                {L(T.ptVetMd)}
                            </h3>
                            <ul className="fz-pxv-nl">
                                {meds.map((m) => {
                                    const ds = dosesSince(m, m.d0 > since ? m.d0 : since)
                                    return (
                                        <li key={m.id}>
                                            <span>{m.ti}</span>
                                            <div>
                                                {qt(m.rx)}
                                                {m.tms.length ? " · " + m.tms.join(", ") : ""}
                                                {" · " + (m.d1 ? dTxt(m.d0, lang, NOW) + " – " + dTxt(m.d1, lang, NOW) + (m.d1 < today ? " (" + L(T.ptMdFin) + ")" : "") : L(T.ptMdFrom).toLowerCase() + " " + dTxt(m.d0, lang, NOW))}
                                                {ds ? " · " + L(T.pvGiven) + " " + ds.got + " " + L(T.pvOf) + " " + ds.sch : ""}
                                            </div>
                                        </li>
                                    )
                                })}
                            </ul>
                        </section>
                    )}
                </div>
                <div className="fz-pxv-dock">
                    <button type="button" className="fz-btn fz-btn--p" onClick={() => openVf(p)}>
                        {ptIco("note", 18)}
                        {L(T.pvWrite)}
                    </button>
                </div>
            </section>
        )
    }
    /* the next visit as a card */
    const nextPass = (p: Pet) => {
        if (!ps) return null
        const today = ymd(NOW)
        const nv = nextVisit(p)
        const x = insOf(p)[0]
        const n = nv ? daysTo(nv.d, NOW) : -1
        const qs = qsOf(p)
        const meds = mdOf(p).filter((m) => medOn(m, today))
        const since = x ? x.d : addDays(today, -30)
        const news = newsOf(p, since)
        const pts = wPts(ps.log, p.id)
        const a = wAt(p, since),
            b = pts[pts.length - 1]
        const dk = a && b && b.d > a.d ? Math.round((b.kg - a.kg) * 10) / 10 : 0
        const nNotes = news.length - (dk ? 1 : 0)
        const newsT = [dk ? (dk < 0 ? "−" : "+") + wFmt(Math.abs(dk)) : "", nNotes > 0 ? nNotes + " " + L(T.pvEntries) : ""].filter(Boolean).join(" · ") || "–"
        const plan = nv && nv.plan ? vzOf(p).find((z) => z.id === nv.id) : undefined
        return (
            <section className={"fz-pxv-pass" + (nv ? "" : " none")} aria-labelledby="fz-pxv-nh">
                <div className="fz-pxv-pb">
                    <div>
                        <span className="fz-pxv-pk">{L(nv ? T.pvNext : T.pvNoNext)}</span>
                        <h3 id="fz-pxv-nh" tabIndex={-1}>
                            {nv ? cap(dowOf(nv.d)) + ", " + dTxt(nv.d, lang, NOW) : L(T.pvNoNextT)}
                        </h3>
                        <p>{nv ? [nv.ti, relDay(nv.d), p.vn].filter(Boolean).join(" · ") : L(T.pvNoNextD)}</p>
                    </div>
                    <span className="fz-pxv-pic" aria-hidden="true">
                        {ptIco("vet", 22)}
                    </span>
                </div>
                <div className="fz-pxv-perf" aria-hidden="true">
                    <i />
                    <i />
                </div>
                <div className="fz-pxv-body">
                    <ul className="fz-pxv-rows">
                        <li>
                            <span>{L(T.pvQs)}</span>
                            <b>{qs.length || "–"}</b>
                        </li>
                        <li>
                            <span>{x ? L(T.pvSinceD) + " " + dTxt(x.d, lang, NOW) : L(T.ptPer[0])}</span>
                            <b>{newsT}</b>
                        </li>
                        <li>
                            <span>{L(T.ptKtMdNow)}</span>
                            <b>{meds.length || "–"}</b>
                        </li>
                        {x && (
                            <li>
                                <span>{L(T.pvLastSaid)}</span>
                                <b>{insShort(x)}</b>
                            </li>
                        )}
                    </ul>
                    <label className="fz-lbl fz-pxv-q" htmlFor="fz-pxv-q">
                        {L(T.ptSoonQ)}
                        <textarea id="fz-pxv-q" className="fz-inp fz-ta" rows={3} maxLength={600} value={p.vq} placeholder={L(T.ptVetQPh)} onChange={(e) => saveProf({ ...p, vq: e.target.value })} />
                    </label>
                    {nv && n >= 0 && n <= 7 && (
                        <div className="fz-px-tips">
                            <b>{L(T.ptTipsK)}</b>
                            <ul>
                                {T.ptTips.slice(0, 3).map((t, i) => (
                                    <li key={i}>
                                        {ptIco("check", 15)}
                                        <span>{L(t)}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    <div className="fz-pxv-acts">
                        <button type="button" id="fz-pxv-show" className="fz-btn fz-btn--p" onClick={() => openVv(p)}>
                            {ptIco("vet", 18)}
                            {L(T.pvShow)}
                        </button>
                        <p className="fz-hint">{n === 0 ? L(T.ptSoonToday) : L(T.pvShowN)}</p>
                    </div>
                    {vzf ? (
                        <div className="fz-pxv-plan">
                            <div className="fz-px-f2">
                                <label className="fz-lbl" htmlFor="fz-pxv-pd">
                                    {L(T.pvPlanD)}
                                    <input id="fz-pxv-pd" className="fz-inp" type="date" min={today} value={vzf.d} onChange={(e) => setVzf({ ...vzf, d: e.target.value })} />
                                </label>
                                <label className="fz-lbl" htmlFor="fz-pxv-pw">
                                    {L(T.pvPlanWhy)}
                                    <input id="fz-pxv-pw" className="fz-inp" maxLength={80} autoComplete="off" value={vzf.why} placeholder={L(T.pvPlanWhyPh)} onChange={(e) => setVzf({ ...vzf, why: e.target.value })} />
                                </label>
                            </div>
                            {fmsg && (
                                <p className="fz-hint fz-hint--w" role="alert">
                                    {fmsg}
                                </p>
                            )}
                            <div className="fz-px-fbar">
                                <button
                                    type="button"
                                    className="fz-btn fz-btn--g fz-btn--sm"
                                    onClick={() => {
                                        setVzf(null)
                                        setFmsg("")
                                        focusId("fz-pxv-plan")
                                    }}
                                >
                                    {L(T.ptCancel)}
                                </button>
                                <button type="button" className="fz-btn fz-btn--p fz-btn--sm" onClick={() => savePlan(p)}>
                                    {L(T.pvPlanSave)}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="fz-pxv-links">
                            <button
                                type="button"
                                id="fz-pxv-plan"
                                className="fz-link"
                                onClick={() => {
                                    setVzf({ d: "", why: "" })
                                    setFmsg("")
                                    focusId("fz-pxv-pd")
                                }}
                            >
                                {ptIco("cal", 16)}
                                {L(T.pvPlan)}
                            </button>
                            {p.vn && (
                                <a className="fz-link" href={bookHref(p, nv ? nv.ti : "")}>
                                    {ptIco("mail", 16)}
                                    {L(T.ptBook)}
                                </a>
                            )}
                            {nv && (
                                <button type="button" className="fz-link" onClick={() => calDl(p)}>
                                    {ptIco("clock", 16)}
                                    {L(T.pvCal)}
                                </button>
                            )}
                            {plan && twoStep("vz-" + plan.id, L(T.pvPlanRm), L(T.pvPlanRmY), () => ps && upd({ vz: (ps.vz || []).filter((z) => z.id !== plan.id) }), dTxt(plan.d, lang, NOW))}
                            {nv && <p className="fz-hint fz-pxv-caln">{L(T.pvCalN)}</p>}
                        </div>
                    )}
                </div>
            </section>
        )
    }
    /* what the vet wrote last time, stamped */
    const lastPass = (p: Pet) => {
        const x = insOf(p)[0]
        if (!x) return null
        return (
            <section className="fz-pxv-pass done" aria-labelledby="fz-pxv-lh">
                <div className="fz-pxv-pb">
                    <div>
                        <span className="fz-pxv-pk">{L(T.pvLast)}</span>
                        <h3 id="fz-pxv-lh">{dTxt(x.d, lang, NOW, true)}</h3>
                        <p>{[x.by, L(T.ptViBy)].filter(Boolean).join(" · ")}</p>
                    </div>
                    {stampSvg(x.d, x.id)}
                </div>
                <div className="fz-pxv-perf" aria-hidden="true">
                    <i />
                    <i />
                </div>
                <div className="fz-pxv-body">
                    <ul className="fz-pxv-rows">
                        {insRows(p, x).map(([k, v, c], i) => (
                            <li key={i} className={c}>
                                <span>{k}</span>
                                <b>{v}</b>
                            </li>
                        ))}
                    </ul>
                    <div className="fz-pxv-ft">
                        <p className="fz-hint">{L(T.pvInsNote)}</p>
                        {twoStep("vi-" + x.id, L(T.pvInsRm), L(T.pvInsRmY), () => rmIns(x), dTxt(x.d, lang, NOW, true))}
                    </div>
                </div>
            </section>
        )
    }
    /* earlier visits: what each vet wrote, and visits written in the journal */
    const pastList = (p: Pet) => {
        if (!ps) return null
        const xs = insOf(p).slice(1)
        const linked = new Set(insOf(p).map((x) => x.ent))
        const js = ps.log.filter((e) => e.pet === p.id && e.t === "vet" && !linked.has(e.id))
        const items = [...xs.map((x) => ({ d: x.d, at: x.at, x, e: null as Ent | null })), ...js.map((e) => ({ d: e.d, at: e.at, x: null as VetIns | null, e }))].sort((a, b) => (a.d < b.d ? 1 : a.d > b.d ? -1 : b.at - a.at)).slice(0, 12)
        if (!items.length) return null
        return (
            <section className="fz-pt-card fz-pxv-past" aria-labelledby="fz-pxv-ph">
                <h3 className="fz-pt-k" id="fz-pxv-ph">
                    {L(T.pvPast)}
                </h3>
                <ul className="fz-pxv-pl">
                    {items.map((it) => {
                        const dd = dOf(it.d)
                        const id = it.x ? it.x.id : it.e ? it.e.id : ""
                        const open = vpo === id
                        return (
                            <li key={id}>
                                <span className="fz-pt-date" aria-hidden="true">
                                    <b>{dd.getDate()}</b>
                                    <span>{lang === "en" ? MON_EN[dd.getMonth()].slice(0, 3) : MON_HR_S[dd.getMonth()]}</span>
                                </span>
                                <div className="fz-pxv-pt">
                                    <b>{it.x ? it.x.by || L(T.ptUpT.vet) : it.e ? entTitle(p, it.e) : ""}</b>
                                    <small>{dTxt(it.d, lang, NOW, true) + (it.x ? " · " + insShort(it.x) : it.e && entSub(p, it.e) ? " · " + entSub(p, it.e) : "")}</small>
                                    {it.x && (
                                        <button type="button" className="fz-link" aria-expanded={open} onClick={() => setVpo(open ? "" : id)}>
                                            {ptIco("check", 14)}
                                            {L(T.pvIns)}
                                        </button>
                                    )}
                                    {open && it.x && (
                                        <>
                                            <ul className="fz-pxv-rows sm">
                                                {insRows(p, it.x).map(([k, v, c], i) => (
                                                    <li key={i} className={c}>
                                                        <span>{k}</span>
                                                        <b>{v}</b>
                                                    </li>
                                                ))}
                                            </ul>
                                            {twoStep("vi-" + it.x.id, L(T.pvInsRm), L(T.pvInsRmY), () => it.x && rmIns(it.x), dTxt(it.x.d, lang, NOW, true))}
                                        </>
                                    )}
                                </div>
                            </li>
                        )
                    })}
                </ul>
            </section>
        )
    }
    /* on the overview: a visit in the next 3 days, with the questions and a few tips */
    const soonCard = (p: Pet) => {
        const nv = nextVisit(p)
        if (!nv) return null
        const n = daysTo(nv.d, NOW)
        if (n < 0 || n > 3) return null
        return (
            <section className="fz-pt-card fz-pt-w3 fz-pxv-soon" aria-labelledby="fz-pxv-sh">
                <div className="fz-pxv-sb">
                    <span className="fz-pxv-pic" aria-hidden="true">
                        {ptIco("vet", 20)}
                    </span>
                    <div>
                        <span className="fz-pxv-pk">{L(T.pvNext)}</span>
                        <h3 id="fz-pxv-sh">
                            {cap(relDay(nv.d))} · {cap(dowOf(nv.d))}, {dTxt(nv.d, lang, NOW)}
                        </h3>
                        <p>{[nv.ti, p.vn].filter(Boolean).join(" · ")}</p>
                    </div>
                </div>
                <div className="fz-pxv-sg">
                    <label className="fz-lbl" htmlFor="fz-pxv-sq">
                        {L(T.ptSoonQ)}
                        <textarea id="fz-pxv-sq" className="fz-inp fz-ta" rows={3} maxLength={600} value={p.vq} placeholder={L(T.ptVetQPh)} onChange={(e) => saveProf({ ...p, vq: e.target.value })} />
                    </label>
                    <div className="fz-px-tips">
                        <b>{L(T.ptTipsK)}</b>
                        <ul>
                            {T.ptTips.slice(0, 3).map((t, i) => (
                                <li key={i}>
                                    {ptIco("check", 15)}
                                    <span>{L(t)}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
                <div className="fz-pt-btns">
                    <button type="button" className="fz-btn fz-btn--p fz-btn--sm" onClick={() => openVv(p)}>
                        {ptIco("vet", 16)}
                        {L(T.pvShow)}
                    </button>
                    <button type="button" className="fz-btn fz-btn--g fz-btn--sm" onClick={() => goPx("vet", true)}>
                        {L(T.ptNav.vet)}
                    </button>
                </div>
            </section>
        )
    }
    /* on the overview: the vet's instructions, and how it is going */
    const insCard = (p: Pet) => {
        const x = insNow(p)
        if (!x || !ps) return null
        const today = ymd(NOW)
        const pts = wPts(ps.log, p.id)
        const last = pts[pts.length - 1]
        const then = wAt(p, x.d)
        const start = then ? then.kg : 0
        const wp = x.goal > 0 && last && start && start !== x.goal ? Math.max(0, Math.min(1, (start - last.kg) / (start - x.goal))) : -1
        const ml0 = mlOf(p).filter((m) => m.d === today)
        const ml = x.fu === "g" && ml0.some((m) => m.src === "cur" && m.g > 0) ? ml0.filter((m) => m.src === "cur") : ml0
        const fNow = x.fq > 0 ? ml.reduce((a, m) => a + (x.fu === "kcal" ? m.kc : m.g), 0) : 0
        const meds = mdOf(p).filter((m) => m.vi === x.id && medOn(m, today))
        return (
            <section className="fz-pt-card fz-pt-w3 fz-pxv-ins" aria-labelledby="fz-pxv-ih">
                <div className="fz-pt-kh">
                    <h3 className="fz-pt-k" id="fz-pxv-ih">
                        {L(T.ptVi)}
                    </h3>
                    <span className="fz-px-insby">{[dTxt(x.d, lang, NOW), x.by].filter(Boolean).join(" · ")}</span>
                </div>
                <div className="fz-pxv-prog">
                    {wp >= 0 && last && (
                        <div className="fz-pxv-pg">
                            <div className="fz-pxv-pgh">
                                <span>{L(T.ptW)}</span>
                                <b>
                                    {wFmt(last.kg)} · {L(T.pvGoalS)} {wFmt(x.goal)}
                                </b>
                            </div>
                            <div className="fz-pxv-bar" role="img" aria-label={L(T.ptW) + ": " + wFmt(last.kg) + ", " + L(T.pvGoalS) + " " + wFmt(x.goal)}>
                                <i style={{ width: Math.round(wp * 100) + "%" }} />
                            </div>
                            <small>
                                {L(T.pvSinceW)} {wFmt(start)} ({dTxt(x.d, lang, NOW)}) · {L(T.pvLeft)} {wFmt(Math.abs(Math.round((last.kg - x.goal) * 10) / 10))}
                            </small>
                        </div>
                    )}
                    {x.fq > 0 && (
                        <div className="fz-pxv-pg">
                            <div className="fz-pxv-pgh">
                                <span>{L(T.pvFoodT)}</span>
                                <b>
                                    {nf(Math.round(fNow), lang)} {L(T.pvOf)} {n2(x.fq)} {x.fu}
                                </b>
                            </div>
                            <div className="fz-pxv-bar" role="img" aria-label={L(T.pvFoodT) + ": " + nf(Math.round(fNow), lang) + " " + L(T.pvOf) + " " + n2(x.fq) + " " + x.fu}>
                                <i style={{ width: Math.min(100, Math.round((fNow / x.fq) * 100)) + "%" }} />
                            </div>
                            {x.fn && <small>{x.fn}</small>}
                        </div>
                    )}
                    {meds.map((m) => {
                        const due = m.tms.filter((tm) => !given(m, tm, today))
                        const left = m.d1 ? daysTo(m.d1, NOW) : -1
                        return (
                            <div key={m.id} className="fz-pxv-pg">
                                <div className="fz-pxv-pgh">
                                    <span>{m.ti}</span>
                                    <b>{m.tms.length ? (due.length ? L(T.pvTonight) + " " + due[0] : L(T.pvAllDone)) : qt(m.rx)}</b>
                                </div>
                                {left >= 0 && (
                                    <small>
                                        {L(T.pvUntilD)} {dTxt(m.d1, lang, NOW)} · {left} {L(T.pvDaysLeft)}
                                    </small>
                                )}
                            </div>
                        )
                    })}
                    {x.diet && (
                        <div className="fz-pxv-pg">
                            <div className="fz-pxv-pgh">
                                <span>{L(T.ptViDiet)}</span>
                                <b>{x.diet}</b>
                            </div>
                            {x.dto && (
                                <small>
                                    {L(T.pvUntilD)} {dTxt(x.dto, lang, NOW)}
                                </small>
                            )}
                        </div>
                    )}
                    {nxOf(x) && nxOf(x) >= today && (
                        <div className="fz-pxv-pg">
                            <div className="fz-pxv-pgh">
                                <span>{L(T.ptViNx)}</span>
                                <b>
                                    {dTxt(nxOf(x), lang, NOW)} · {relDay(nxOf(x))}
                                </b>
                            </div>
                            {x.nxr && <small>{x.nxr}</small>}
                        </div>
                    )}
                </div>
                {x.watch && <p className="fz-pxv-warn">{x.watch}</p>}
                {x.note && <p className="fz-pt-d fz-pxv-nt">{x.note}</p>}
                <div className="fz-pxv-ft">
                    <p className="fz-hint">{L(T.pvInsNote)}</p>
                    <button type="button" className="fz-link" onClick={() => goPx("vet", true)}>
                        {L(T.ptNav.vet)} →
                    </button>
                </div>
            </section>
        )
    }

    /* --- the sidebar and the "Today" strip on the overview --- */
    const SECS: [PV, string][] = [
        ["dash", "grid"],
        ["log", "book"],
        ["meal", "bowl"],
        ["walk", "walk"],
        ["med", "med"],
        ["day", "star"],
        ["vet", "vet"],
    ]
    const secsOf = (p: Pet) => SECS.filter(([k]) => k !== "walk" || p.sp === 0)
    const goPx = (k: PV, focus?: boolean) => {
        setPmode("res")
        setPv(k)
        setRmId("")
        setFmsg("")
        setMdf(null)
        setMday("")
        setVv(false)
        setVf(null)
        setVzf(null)
        if (k !== "vet") setVfDone(false)
        if (k === "meal") setMf((f) => ({ ...f, tm: hmNow(new Date()) }))
        if (typeof window !== "undefined" && typeof document !== "undefined") {
            const el = document.getElementById("fz-px")
            if (el && el.getBoundingClientRect().top < 0) window.scrollTo({ top: window.scrollY + el.getBoundingClientRect().top - 96 })
        }
        if (focus) focusId("fz-px-h")
    }
    const todayCard = (p: Pet) => {
        if (!ps) return null
        const today = ymd(NOW)
        const ml = mlOf(p).filter((m) => m.d === today)
        const kc = ml.reduce((a, m) => a + m.kc, 0),
            g = ml.reduce((a, m) => a + m.g, 0)
        const wk = p.sp === 0 ? wkOf(p).filter((w) => w.d >= weekStart(today) && w.d <= today) : []
        const km = wk.reduce((a, w) => a + w.km, 0)
        const meds = mdOf(p).filter((m) => medOn(m, today) && m.tms.length)
        const due = meds.flatMap((m) => m.tms.filter((tm) => !given(m, tm, today)).map((tm) => ({ m, tm }))).sort((a, b) => (a.tm < b.tm ? -1 : 1))
        const nd = dayRows(p).find((r) => r.n >= 0 && r.n <= 60)
        const tile = (k: PV, ic: string, v: React.ReactNode, sub: string) => (
            <button key={k} type="button" className="fz-px-tile" onClick={() => goPx(k, true)}>
                <span className="fz-px-tk">
                    {ptIco(ic, 17)}
                    {L(T.ptNav[k])}
                </span>
                <b>{v}</b>
                <small>{sub}</small>
            </button>
        )
        return (
            <section className="fz-pt-card fz-pt-w3 fz-px-today" aria-labelledby="fz-px-tdh">
                <h3 className="fz-pt-k" id="fz-px-tdh">
                    {L(T.ptToday2)}
                </h3>
                <div className="fz-px-tiles">
                    {tile("meal", "bowl", ml.length ? (kc ? nf(kc, lang) + " kcal" : n2(g) + " g") : "–", ml.length ? ml.length + " " + pl(lang, ml.length, ["meal", "meals"], ["obrok", "obroka", "obroka"]) + (kc ? " · " + n2(g) + " g" : "") : L(T.ptTdMl0))}
                    {p.sp === 0 && tile("walk", "walk", String(wk.length), wk.length ? pl(lang, wk.length, ["walk", "walks"], ["šetnja", "šetnje", "šetnji"]) + " " + L(T.ptWkThis) + (km > 0 ? " · " + n2(km) + " km" : "") : L(T.ptTdWk0))}
                    {meds.length > 0 && tile("med", "med", due.length ? due[0].tm : ptIco("check", 26), due.length ? due[0].m.ti : L(T.ptTdMdAll))}
                    {nd && tile("day", nd.ic, nd.n === 0 ? L(T.ptDyToday) : cap(relDay(nd.next)), nd.ti)}
                </div>
            </section>
        )
    }
    const plusShell = (p: Pet) => {
        if (!ps) return null
        const secs = secsOf(p)
        const cur: PV = secs.some(([k]) => k === pv) ? pv : "dash"
        const today = ymd(NOW)
        const lead = cur === "meal" ? T.ptMlLead : cur === "walk" ? T.ptWkLead : cur === "med" ? T.ptMdLead : cur === "day" ? T.ptDyLead : null
        return (
            <div className={"fz-px" + (cur === "vet" && (vv || vf) ? " fz-px--focus" : "")} id="fz-px">
                <aside className="fz-px-side fz-noprint">
                    <h2 className="fz-px-k" id="fz-px-pk">
                        {L(T.ptPetsK)}
                    </h2>
                    <div className="fz-px-pets" role="group" aria-labelledby="fz-px-pk">
                        {ps.pets.map((x) => (
                            <button key={x.id} type="button" className="fz-px-it" aria-pressed={x.id === ps.cur} onClick={() => selPet(x.id)}>
                                {avOf(x, "")}
                                <b>{yourPet(x)}</b>
                                <small>{L(T.ptSpN[x.sp])}</small>
                            </button>
                        ))}
                        <button type="button" className="fz-px-it add" onClick={startAdd}>
                            {ptIco("plus", 18)}
                            {L(T.ptAdd)}
                        </button>
                    </div>
                    <h2 className="fz-px-k" id="fz-px-nk">
                        {yourPet(p)}
                    </h2>
                    <nav className="fz-px-nav" aria-labelledby="fz-px-nk">
                        {secs.map(([k, ic]) => (
                            <button key={k} type="button" id={"fz-px-n-" + k} className="fz-px-it" aria-current={cur === k && pmode === "res" ? "page" : undefined} onClick={() => goPx(k)}>
                                {ptIco(ic, 19)}
                                {L(T.ptNav[k])}
                            </button>
                        ))}
                    </nav>
                </aside>
                <div className="fz-px-main">
                    {pmode === "edit" ? (
                        pfCardEd(p)
                    ) : (
                        <>
                            <div className={"fz-px-h fz-noprint" + (cur === "vet" && (vv || vf) ? " fz-vh" : "")}>
                                <h2 id="fz-px-h" tabIndex={-1}>
                                    {L(T.ptNav[cur])}
                                </h2>
                                {cur === "dash" && <span>{cap(dowOf(today)) + ", " + dTxt(today, lang, NOW)}</span>}
                            </div>
                            {lead && <p className="fz-px-lead fz-noprint">{L(lead)}</p>}
                            {cur === "dash" && plusBar()}
                            {cur === "dash" && p.sp !== 0 && <p className="fz-pt-note fz-noprint">{L(T.ptNotDog[p.sp === 2 ? 1 : 0])}</p>}
                            {cur === "log" ? ptLog(p) : cur === "meal" ? mealSec(p) : cur === "walk" ? walkSec(p) : cur === "med" ? medSec(p) : cur === "day" ? daySec(p) : cur === "vet" ? ptVet(p) : ptDash(p)}
                        </>
                    )}
                </div>
            </div>
        )
    }

    /* ---------- page ---------- */

    const curP: Pet | null = prof
    /* Plus: sidebar with pets and sections; free: the pets row and two tabs */
    const shell = isPlus && !!curP && pmode !== "wiz"
    const dogPage = (
        <section className={"fz-sec fz-pf fz-pt" + (shell ? " fz-pt--px" : "")}>
            <div className="fz-wrap">
                <div className="fz-pt-head fz-noprint">
                    <h1 className="fz-h2">{L(T.pfH)}</h1>
                    {curP && pmode === "res" && (shell || pv !== "vet") && !(pv === "vet" && (vv || vf)) && (
                        <div className="fz-pt-acts">
                            {!shell && vetOk && (
                                <button type="button" className="fz-btn fz-btn--g fz-btn--sm" onClick={openVet}>
                                    {ptIco("print", 17)}
                                    {L(T.ptVetB)}
                                </button>
                            )}
                            <button type="button" className="fz-btn fz-btn--p fz-btn--sm" onClick={() => openEnt("")}>
                                {ptIco("plus", 17)}
                                {L(T.ptLogB)}
                            </button>
                        </div>
                    )}
                </div>
                {!shell && acctBar()}
                {ps && ps.pets.length > 0 && !shell && !(pmode === "wiz" && !newPet) && (
                    <div className="fz-pt-pets fz-noprint" role="group" aria-label={L(T.pfH)}>
                        {ps.pets.map((x) => (
                            <button key={x.id} type="button" className="fz-pt-pet" aria-pressed={x.id === ps.cur && pmode !== "wiz"} onClick={() => selPet(x.id)}>
                                {avOf(x, "")}
                                <b>{yourPet(x)}</b>
                                <small>{L(T.ptSpN[x.sp])}</small>
                            </button>
                        ))}
                        {(isPlus || !LIVE) && (
                            <button type="button" className="fz-pt-pet add" aria-pressed={pmode === "wiz" && newPet} onClick={startAdd}>
                                + {L(T.ptAdd)}
                            </button>
                        )}
                    </div>
                )}
                {(pmode === "wiz" || !curP) && <p className="fz-lead">{L(catsOk ? T.pfLead : T.pfLeadDog)}</p>}
                {pmode === "wiz" || !curP ? (
                    pfWizard()
                ) : shell ? (
                    plusShell(curP)
                ) : pmode === "edit" ? (
                    pfCardEd(curP)
                ) : (
                    <>
                        {plusBar()}
                        {curP.sp !== 0 && <p className="fz-pt-note fz-noprint">{L(T.ptNotDog[curP.sp === 2 ? 1 : 0])}</p>}
                        <div className="fz-seg fz-pt-tabs fz-noprint" role="group" aria-label={L(T.pfH)}>
                            {T.ptTabs.map((x, i) => (
                                <button key={i} type="button" aria-pressed={(pv === "log" ? 1 : 0) === i} onClick={() => setPv(i ? "log" : "dash")}>
                                    {L(x)}
                                </button>
                            ))}
                        </div>
                        {pv === "log" ? ptLog(curP) : ptDash(curP)}
                    </>
                )}
                {saveErr && (
                    <p className="fz-hint fz-hint--w fz-noprint" role="alert">
                        {L(T.ptSaveErr)}
                    </p>
                )}
                {ps && ps.pets.length > 0 && pmode !== "wiz" && <p className="fz-pt-bound fz-noprint">{L(T.ptBound)}</p>}
                <div className="fz-pt-foot fz-noprint">
                    <p className="fz-pf-saved">{L(acct ? TA.savedFoot : T.pfSaved)}</p>
                    {ps && ps.pets.length > 0 && (
                        <button type="button" className="fz-link" onClick={expCopy} disabled={expBusy}>
                            {expBusy ? L(T.ptBusy) : L(T.ptExp)}
                        </button>
                    )}
                    <label className="fz-link fz-pt-imp">
                        <input type="file" accept="application/json,.json" className="fz-pt-file" onChange={(e) => (impPick(e.target.files ? e.target.files[0] : undefined), (e.target.value = ""))} />
                        {L(T.ptImp)}
                    </label>
                </div>
                {imp && (
                    <div className="fz-pt-impq fz-noprint" role="status">
                        {imp.err || imp.ok ? (
                            <>
                                <span>{imp.err || imp.ok}</span>
                                <button type="button" className="fz-link" onClick={() => setImp(null)}>
                                    {L(T.ptClose)}
                                </button>
                            </>
                        ) : imp.s ? (
                            <>
                                <span>
                                    {(() => {
                                        const n = imp.s.pets.length,
                                            m = imp.s.log.length,
                                            k = Object.keys(imp.ph || {}).length,
                                            when = imp.at ? dTxt(imp.at, lang, NOW, true) : ""
                                        return lang === "en"
                                            ? `Copy${when ? " from " + when : ""}: ${n} ${n === 1 ? "pet" : "pets"}, ${m} ${m === 1 ? "entry" : "entries"}, ${k} ${k === 1 ? "photo" : "photos"}. Loading it replaces everything here.`
                                            : `Kopija${when ? " od " + when : ""}: ${n} ${plHr(n, ["ljubimac", "ljubimca", "ljubimaca"])}, ${m} ${plHr(m, ["zapis", "zapisa", "zapisa"])}, ${k} ${plHr(k, ["slika", "slike", "slika"])}. Učitavanje zamjenjuje sve što je sada ovdje.`
                                    })()}
                                </span>
                                <button type="button" className="fz-btn fz-btn--sm fz-pf-del" onClick={impGo}>
                                    {L(T.ptImpGo)}
                                </button>
                                <button type="button" className="fz-link" onClick={() => setImp(null)}>
                                    {L(T.ptCancel)}
                                </button>
                            </>
                        ) : null}
                    </div>
                )}
            </div>
            {efForm()}
            {vpkDlg()}
            {lb && (
                <div className="fz-pt-ov fz-pt-lb" onClick={() => setLb(null)} role="dialog" aria-modal="true" aria-label={L(T.ptPhotos)}>
                    <PhImg id={lb} alt={L(T.ptPhotos)} />
                    <button type="button" id="fz-pt-lbx" className="fz-pt-x" aria-label={L(T.ptClose)} onClick={() => setLb(null)}>
                        ×
                    </button>
                </div>
            )}
        </section>
    )

    /* ---------- nav ---------- */

    const navLinks: [string, () => void, boolean, boolean?, boolean?][] = [
        [L(T.recipes), () => go({ p: "recipes" }), page.p === "recipes" || page.p === "recipe"],
        [L(T.myDog), () => go({ p: "dog" }), page.p === "dog"],
        [L(T.build), () => go({ p: "build" }), page.p === "build", true],
        [L(SHOP ? T.order : T.meals), () => go({ p: "order" }), page.p === "order", false, !SHOP],
        [L(T.how), () => goSec("how"), false],
        [L(T.story), () => goSec("story"), false],
    ]
    const nav = (
        <header className="fz-nav fz-noprint">
            <div className="fz-wrap">
                <div className="fz-nl">
                    <button type="button" className={"fz-logo" + (isPlus ? " is-plus" : "")} onClick={() => go({ p: "home" })} aria-label={isPlus ? "Freshy's Plus" : "Freshy's"}>
                        <img src={ART.wmG} alt="Freshy's" width={85} height={34} />
                        {isPlus && <span className="fz-logo-plus">Plus</span>}
                    </button>
                    <nav className="fz-links" aria-label="Freshy's">
                        {navLinks.map(([t, f, on, nw, soon]) => (
                            <button key={t} type="button" onClick={f} aria-current={on ? "page" : undefined}>
                                {t}
                                {nw && <span className="fz-nw">{L(T.newB)}</span>}
                                {soon && <span className="fz-nw fz-nw--s">{L(T.soonB)}</span>}
                            </button>
                        ))}
                    </nav>
                </div>
                <div className="fz-nr">
                    {!LIVE && ps && ps.pets.length > 0 && !isPlus && (
                        <button type="button" className="fz-pluspill" onClick={() => go({ p: "plus" })} aria-current={page.p === "plus" ? "page" : undefined}>
                            {L(T.plus)}
                        </button>
                    )}
                    <div className="fz-lang" role="group" aria-label="Language">
                        <button type="button" aria-pressed={lang === "en"} onClick={() => setLang("en")}>
                            EN
                        </button>
                        <button type="button" aria-pressed={lang === "hr"} onClick={() => setLang("hr")}>
                            HR
                        </button>
                    </div>
                    {ACCT && (
                        <button type="button" className="fz-ac-nav" aria-current={page.p === "acct" ? "page" : undefined} onClick={() => go({ p: "acct" })}>
                            {L(acct ? TA.myAcct : TA.login)}
                        </button>
                    )}
                    <button type="button" className="fz-cart" aria-label={L(T.list) + (lCount ? " (" + lCount + ")" : "")} aria-current={page.p === "list" ? "page" : undefined} onClick={() => go({ p: "list" })}>
                        <Ico d={I.cart} s={21} />
                        {lCount > 0 && (
                            <span className="n" aria-hidden="true">
                                {lCount}
                            </span>
                        )}
                    </button>
                    <button type="button" className="fz-btn fz-btn--sm fz-btn--p" aria-current={!SHOP && page.p === "plan" ? "page" : undefined} onClick={() => (SHOP ? orderPouch() : go({ p: "plan" }))}>
                        {L(SHOP ? T.orderBtn : T.planCta)}
                    </button>
                    <button type="button" className="fz-burger" aria-expanded={menu} aria-label={L(menu ? T.close : T.menu)} onClick={() => setMenu(!menu)}>
                        <Ico d={menu ? I.x : I.menu} s={22} />
                    </button>
                </div>
            </div>
            {menu && (
                <div className="fz-drop">
                    <div className="fz-wrap" style={{ display: "block", height: "auto" }}>
                        {navLinks.map(([t, f, , nw, soon]) => (
                            <button key={t} type="button" onClick={f}>
                                {t}
                                {nw && <span className="fz-nw">{L(T.newB)}</span>}
                                {soon && <span className="fz-nw fz-nw--s">{L(T.soonB)}</span>}
                            </button>
                        ))}
                        {!LIVE && (
                            <button type="button" onClick={() => go({ p: "plus" })}>
                                Freshy's {L(T.plus)}
                            </button>
                        )}
                        <button type="button" onClick={() => go({ p: "list" })}>
                            {L(T.list)}
                            {lCount > 0 ? " (" + lCount + ")" : ""}
                        </button>
                        {ACCT && (
                            <button type="button" onClick={() => go({ p: "acct" })} aria-current={page.p === "acct" ? "page" : undefined}>
                                {L(acct ? TA.myAcct : TA.login)}
                            </button>
                        )}
                        <button type="button" className="fz-btn fz-btn--p" onClick={() => (SHOP ? orderPouch() : go({ p: "plan" }))}>
                            {L(SHOP ? T.cta1 : T.planCta)}
                        </button>
                    </div>
                </div>
            )}
        </header>
    )

    /* ---------- amounts, the simple way: the dog's weight, how it is fed, grams a day ---------- */

    /* the day's energy in whole kcal, so every sum under "How we worked it out" can be checked with a calculator */
    const kLoD = Math.round(kLo)
    const kHiD = Math.round(kHi)
    const kMid = Math.round((kLoD + kHiD) / 2)
    const day10 = Math.round(kLoD * 0.1)
    const pup = dog.age < 2
    /* share of the day's calories that comes from the home-cooked recipe; puppies stay on 10 % */
    const SHARES = [1, 0.5, 0.1]
    const shareOf = (ok: boolean) => (ok && !pup ? SHARES[feed] : 0.1)
    /* kcal a day from the home-cooked dish: the middle of the need (or half of it), or up to 10 % of the lower end */
    const needDay = (sh: number) => (sh > 0.1 ? Math.round(kMid * sh) : day10)
    const tMin = (m: number) => (m < 60 ? m + " min" : Math.floor(m / 60) + " h" + (m % 60 ? " " + (m % 60) + " min" : ""))
    /* grams a day: 10 g steps up to 300 g, 50 g up to 1 kg, then kilograms with one decimal */
    const gTxt = (g: number): [string, string] => {
        const r = g >= 300 ? Math.round(g / 50) * 50 : Math.max(5, Math.round(g / (g >= 100 ? 10 : 5)) * (g >= 100 ? 10 : 5))
        if (r >= 1000) {
            const k = g >= 10000 ? Math.round(g / 1000) : Math.round(g / 100) / 10
            return [nf(k, lang, k % 1 ? 1 : 0), "kg"]
        }
        return [nf(r, lang), "g"]
    }
    /* an "up to" amount: never rounded up (5 g steps, then kilograms rounded down to one decimal) */
    const gTxtDn = (g: number): [string, string] => {
        if (g >= 1000) {
            const k = Math.floor(g / 100) / 10
            return [nf(k, lang, k % 1 ? 1 : 0), "kg"]
        }
        return [nf(Math.max(5, fl5(g)), lang), "g"]
    }
    /* grams a day of a whole-day dish (kcal per gram): about the middle of the need for a whole or half meal, up to 10 % on top of other food */
    const dayG = (kpg: number, sh: number) => (sh > 0.1 ? needDay(sh) / kpg : Math.max(5, fl5(day10 / kpg)))
    const dayGTxt = (kpg: number, sh: number) => {
        const [v, u] = sh > 0.1 ? gTxt(dayG(kpg, sh)) : gTxtDn(dayG(kpg, sh))
        return (sh > 0.1 ? L(T.about) : L(T.upTo)) + " " + v + " " + u + " " + L(T.aDay)
    }
    /* how long one batch lasts, in a few words (d = days) */
    const daysShort = (d: number) => {
        if (d < 0.9) return lang === "en" ? fracTxt(1 / d) + " batches a day" : fracTxt(1 / d) + " recepta za dan"
        const h = d < 3 ? Math.round(d * 2) / 2 : Math.round(d)
        if (lang === "en") return "one batch lasts " + (h % 1 ? Math.floor(h) + "½" : h) + (h === 1 ? " day" : " days")
        return "jedan recept za " + (h === 1.5 ? "dan i pol" : h % 1 ? Math.floor(h) + " i pol dana" : h + " " + plHr(h, ["dan", "dana", "dana"]))
    }
    /* a whole-day dish from the recipe list as one row: photo, name, grams a day and how long a batch lasts */
    const dayRow = (id: number, sh: number, long = true) => {
        const d = DAYC[id]
        const kpg = kpgOf(d[3], d[4])
        return (
            <button key={id} type="button" className="fz-dayr" onClick={() => go({ p: "recipe", id: "mdr-" + id })}>
                <img src={cImg({ img: d[2] }, 256)} alt="" loading="lazy" decoding="async" />
                <span>
                    <b>{lang === "hr" ? d[1] : d[0]}</b>
                    <small>
                        {dayGTxt(kpg, sh)}
                        {long && sh > 0.1 ? " · " + daysShort(d[4] / dayG(kpg, sh)) : ""}
                    </small>
                </span>
                <Ico d={I.right} s={16} w={2.4} />
            </button>
        )
    }
    const dayOk = (id: number) => !!DAYC[id] && !DAYC[id][5].some((a) => dog.no.includes(a))
    /* a whole-day dish as a recipe card (same card as on the recipe list) */
    const dcard = (id: number, i: number) => {
        const d = DAYC[id]
        const rm: RMeta = { has: new Set(), no: new Set(), oven: !!d[8], frozen: false, n: d[7], shop: true, min: d[6] || null }
        const open = () => go({ p: "recipe", id: "mdr-" + id })
        return (
            <article key={"d" + id} className="fz-rc" style={{ ["--r" as any]: ROT[i % ROT.length] + "deg" } as React.CSSProperties}>
                <button className="im" type="button" tabIndex={-1} aria-hidden="true" onClick={open}>
                    <img src={cImg({ img: d[2] }, 512)} alt="" loading="lazy" decoding="async" />
                </button>
                <div className="b">
                    <h3>
                        <button type="button" onClick={open}>
                            {lang === "hr" ? d[1] : d[0]}
                        </button>
                    </h3>
                    <div className="m">
                        {d[6] ? tMin(d[6]) + " · " : ""}
                        {d[7]} {pl(lang, d[7], ["ingredient", "ingredients"], ["sastojak", "sastojka", "sastojaka"])}
                    </div>
                    <div className="row">
                        <span className="tags">
                            <span className="fz-tag fz-tag--t">{L(T.kMeal)}</span>
                            {methodTag(rm)}
                        </span>
                        <span className="bb">
                            <button type="button" className="fz-btn fz-btn--sm fz-btn--g" onClick={open}>
                                {L(T.cook)}
                            </button>
                        </span>
                    </div>
                </div>
            </article>
        )
    }
    /* the dog in one line ("Adult · neutered · normally active · Change"), the rest opens on Change */
    const dogSum = (() => {
        const xs = [feedPet && !pfOff ? pfNm(feedPet) : "", L(T.ages[dog.age]), dog.age === 2 ? L(T.neutS[dog.neut ? 0 : 1]) : "", dog.age === 2 ? L(T.actS[dog.act]) : ""].filter(Boolean)
        const t = xs.map((x, i) => (i && x !== xs[0] ? x.charAt(0).toLowerCase() + x.slice(1) : x)).join(" · ")
        return t.charAt(0).toUpperCase() + t.slice(1)
    })()
    const dogEd = (
        <div className="fz-ded">
            <span className="fz-lbl">{L(T.age)}</span>
            {seg(T.ages, dog.age, setAge, T.age)}
            {dog.age < 2 ? (
                <p className="fz-hint fz-hint--w">{L(T.puppy)}</p>
            ) : (
                <>
                    <span className="fz-lbl">{L(T.neut)}</span>
                    {seg(T.yesNo, dog.neut ? 0 : 1, (i) => setDog({ ...dog, neut: i === 0 }), T.neut)}
                    <span className="fz-lbl">{L(T.active)}</span>
                    {seg(T.acts, dog.act, (i) => setDog({ ...dog, act: i }), T.active)}
                    <p className="fz-hint">{L(T.actHint[dog.act])}</p>
                </>
            )}
        </div>
    )
    const dogLine = (
        <>
            <p className="fz-hint fz-dsum">
                {dogSum}{" "}
                <button type="button" className="fz-link" aria-expanded={dEd} onClick={() => setDEd(!dEd)}>
                    {L(dEd ? T.close : T.chg)}
                </button>
            </p>
            {dEd && dogEd}
        </>
    )

    /* shared by the home scale and the week's plan: the weight, the profile banner and how the dog is fed */
    const kgBox = (id: string) => (
        <>
            <label className="fz-lbl" htmlFor={id}>
                {L(T.weight)}
            </label>
            <div className="fz-kgrow">
                <button type="button" className="fz-step" aria-label={L(T.less)} disabled={dog.kg <= KG_MIN} onClick={() => setKg(dog.kg - 0.5)}>
                    −
                </button>
                <div className="fz-kg">
                    {kgTxt}
                    <small>kg</small>
                </div>
                <button type="button" className="fz-step" aria-label={L(T.more)} disabled={dog.kg >= kgMax} onClick={() => setKg(dog.kg + 0.5)}>
                    +
                </button>
            </div>
            {weightSlider(id)}
        </>
    )
    const pfBan = !isCanvas && (
                        <div className="fz-pf-ban">
                            {feedPet ? (
                                <>
                                    <span>
                                        {L(T.pfFor)}: <b>{pfNm(feedPet) || L(T.pfYourDog)}</b> · {wFmt(feedPet.kg)}
                                        {pfOff ? " · " + L(T.pfManual) : ""}
                                    </span>
                                    {pfOff && (
                                        <button type="button" className="fz-link" onClick={() => setDog(dogOf(feedPet, new Date()))}>
                                            {L(T.pfBackTo)}
                                        </button>
                                    )}
                                    <button type="button" className="fz-link" onClick={() => go({ p: "dog" })}>
                                        {L(T.pfEdit)}
                                    </button>
                                </>
                            ) : (
                                <>
                                    <span>{L(T.pfMake)}</span>
                                    <button type="button" className="fz-btn fz-btn--g fz-btn--sm" onClick={() => go({ p: "dog" })}>
                                        {L(T.pfMakeB)}
                                    </button>
                                </>
                            )}
                        </div>
                    )
    const feedR = (n: number) => (
        <div className="fz-feedr" role="radiogroup" aria-label={L(T.feedL)}>
            {T.feedO.slice(0, n).map((o, i) => (
                <button key={i} type="button" role="radio" aria-checked={feed === i} onClick={() => setFeed(i)}>
                    <i aria-hidden="true" />
                    <span>
                        <b>{L(o)}</b>
                        <small>{L(T.feedD[i])}</small>
                    </span>
                </button>
            ))}
        </div>
    )

    /* ---------- home ---------- */

    /* this week: four dishes for the whole day (salmon, beef, turkey, chicken) and two treats */
    const weekDay = [1306, 813, 501, 1219]
    const weekIds = ["fruit-rings", "pb-banana"]
    const home = (
        <div className="fz-page" key="home">
            <section className="fz-hero fz-ruled">
                <div className="fz-wrap">
                    <div>
                        <div className="fz-eb">{L(T.eb)}</div>
                        <h1 className="fz-h1">
                            {L(T.h1a)}
                            <br />
                            {L(T.h1b)}
                        </h1>
                        <p className="fz-sub">{L(SHOP ? T.sub : T.subNow)}</p>
                        {SHOP ? (
                            <div className="fz-ctas">
                                <button type="button" className="fz-btn fz-btn--p" onClick={() => orderPouch()}>
                                    {L(T.cta1)}
                                </button>
                                <button type="button" className="fz-btn fz-btn--g" onClick={() => go({ p: "recipes" })}>
                                    {L(T.cta2)}
                                </button>
                            </div>
                        ) : (
                            <div className="fz-ctas">
                                <button type="button" className="fz-btn fz-btn--p" onClick={() => go({ p: "plan" })}>
                                    {L(T.planCta)}
                                </button>
                                <button type="button" className="fz-btn fz-btn--g" onClick={() => go({ p: "recipes" })}>
                                    {L(T.cta2)}
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="fz-hp">
                        <i className="fz-tape" style={{ width: 140, left: "calc(50% - 70px)", top: -16, transform: "rotate(-4deg)" }} />
                        <div className="fz-pol">
                            <img src={ART.bronx} alt="Bronx" width={780} height={1040} />
                            <div className="fz-cap fz-hand">Bronx</div>
                        </div>
                        <div className="fz-scrib fz-hand fz-hs1">
                            {L(T.heroNote)} <HandArrow />
                        </div>
                        <div className="fz-scrib fz-hand fz-hs2">
                            <span style={{ display: "inline-block", transform: "scaleX(-1) rotate(30deg)" }}>
                                <HandArrow w={40} />
                            </span>
                            {L(T.heroNote)}
                        </div>
                    </div>
                </div>
            </section>

            <section className="fz-sec fz-sec--2" id="fz-calc">
                <div className="fz-wrap">
                    <h2 className="fz-h2">{L(T.calcH)}</h2>
                    <p className="fz-lead">{L(T.calcSub)}</p>
                    {pfBan}
                    <div className="fz-calc">
                        <div className="fz-cin">
                            {kgBox("fz-kg1")}
                            {dogLine}
                            {!pup && (
                                <>
                                    <div className="fz-gap2" />
                                    <span className="fz-lbl">{L(T.feedL)}</span>
                                    {feedR(3)}
                                </>
                            )}
                        </div>
                        <div className="fz-res" aria-live="polite">
                            <div className="fz-dlist">
                                <div className="k">{L(T.dayL)}</div>
                                {pup && <p className="t">{L(T.dayPup)}</p>}
                                {DAY_HOME.filter(dayOk)
                                    .slice(0, 3)
                                    .map((id) => dayRow(id, shareOf(true)))}
                                <button
                                    type="button"
                                    className="fz-link fz-dall"
                                    onClick={() => {
                                        setCat("daily")
                                        go({ p: "recipes" })
                                    }}
                                >
                                    {L(T.dayAll)} <Ico d={I.right} s={15} w={2.4} />
                                </button>
                            </div>
                            <details className="fz-kib">
                                <summary>
                                    {L(T.kibQ)}
                                    <Ico d={I.down} s={18} w={2.2} />
                                </summary>
                                <label className="fz-lbl" htmlFor="fz-kc">
                                    {L(T.foodK)}
                                </label>
                                {seg(T.foods, foodI, (i) => setKcTxt(String(FOODS[i])), T.foodK)}
                                <div className="fz-kcin">
                                    <input id="fz-kc" className="fz-inp" inputMode="decimal" value={kcTxt} maxLength={5} autoComplete="off" onChange={(e) => setKcTxt(e.target.value.replace(/[^\d.,]/g, ""))} />
                                    <span>{L(T.per100)}</span>
                                </div>
                                <p className={"fz-hint" + (kcOdd || !kcOk ? " fz-hint--w" : "")}>{kcOdd || (!kcOk && kcTxt) ? L(T.kcalBad) : L(T.foodHint)}</p>
                                <div className="fz-res fz-kibr">
                                <div className="fz-tile">
                                    <div className="k">
                                        {L(T.foodDay)}
                                        {foodI >= 0 ? " · " + L(T.foods[foodI]).toLowerCase() : ""}
                                    </div>
                                    {kcOk ? (
                                        <>
                                            <div className="v">
                                                <Num v={rG(gLo)} lang={lang} />
                                                {gHi > gLo && (
                                                    <>
                                                        –<Num v={rG(gHi)} lang={lang} />
                                                    </>
                                                )}
                                                <small>g</small>
                                            </div>
                                            <div className="d">
                                                {L(T.meals2)} {nf(rG(gLo / 2), lang)}
                                                {gHi > gLo ? "–" + nf(rG(gHi / 2), lang) : ""} g · {nf(kc100, lang, kc100 % 1 ? 1 : 0)} {L(T.per100)}
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="v">–</div>
                                            <div className="d">{L(T.foodDayNo)}</div>
                                        </>
                                    )}
                                </div>
                                <div className="fz-tile fz-tile--s">
                                    <div className="k">{L(T.needK)}</div>
                                    <div className="v">
                                        <Num v={rK(kLo)} lang={lang} />
                                        {kHi > kLo && (
                                            <>
                                                –<Num v={rK(kHi)} lang={lang} />
                                            </>
                                        )}
                                        <small>kcal</small>
                                    </div>
                                    <div className="d">
                                        {L(T.restE)} {nf(Math.round(rer), lang)} kcal × {fx(FAC[fk][0], FAC[fk][1])}
                                    </div>
                                </div>
                                <div className="fz-tile fz-tile--o">
                                    <div className="k">{L(T.treatK)}</div>
                                    <div className="v">
                                        <em>{L(T.upTo)}</em>
                                        <Num v={Math.max(5, fl5(day10))} lang={lang} />
                                        <small>kcal</small>
                                    </div>
                                    <div className="d">{L(T.treatD)}</div>
                                </div>
                                </div>
                            </details>
                        </div>
                        <div className="fz-note fz-hand">
                            {L(T.calcNote)}
                            <small>— B.</small>
                        </div>
                    </div>
                    <div className="fz-cx">
                        <p className="fz-start">{L(T.startT)}</p>
                        <details className="fz-det">
                            <summary>
                                {L(T.calcHowH)}
                                <Ico d={I.down} s={18} w={2.2} />
                            </summary>
                            <ol className="fz-calcs">
                                <li>
                                    <b>
                                        {L(T.how1)}
                                        <sup>0{lang === "hr" ? "," : "."}75</sup>
                                    </b>
                                    <span>
                                        70 × {kgTxt}
                                        <sup>0{lang === "hr" ? "," : "."}75</sup> = {nf(Math.round(rer), lang)} kcal
                                    </span>
                                </li>
                                <li>
                                    <b>{L(T.how2)}</b>
                                    <span>
                                        {nf(Math.round(rer), lang)} × {fx(FAC[fk][0], FAC[fk][1])} = {nf(Math.round(kLo), lang)}
                                        {kHi > kLo ? "–" + nf(Math.round(kHi), lang) : ""} kcal
                                    </span>
                                </li>
                                <li>
                                    <b>{L(T.how3)}</b>
                                    <span>
                                        {kcOk
                                            ? `${nf(Math.round(kLo), lang)}${kHi > kLo ? "–" + nf(Math.round(kHi), lang) : ""} kcal ÷ ${nf(kc100 / 100, lang, 2)} kcal/g = ${nf(Math.round(gLo), lang)}${gHi > gLo ? "–" + nf(Math.round(gHi), lang) : ""} g`
                                            : L(T.foodDayNo)}
                                    </span>
                                </li>
                            </ol>
                            <div className="fz-fac">
                                <div className="h">{L(T.facH)}</div>
                                {(["n", "i", "l", "a", "p0", "p1"] as const).map((k) => (
                                    <div key={k} className="r" aria-current={k === fk ? "true" : undefined}>
                                        <span>{L(T.facRows[k])}</span>
                                        <b>{fx(FAC[k][0], FAC[k][1])}</b>
                                    </div>
                                ))}
                                <div className="r">
                                    <span>{L(T.facW)}</span>
                                    <b>{fx(2, 11)}</b>
                                </div>
                            </div>
                            <p className="fz-csrc">
                                <b>{L(T.srcT)}:</b>{" "}
                                <a href={AAHA_URL} target="_blank" rel="noopener noreferrer">
                                    AAHA 2021 Nutrition and Weight Management Guidelines for Dogs and Cats, Box 1
                                </a>
                            </p>
                            <p className="fz-csrc">
                                <b>{L(T.checkT)}:</b> {L(T.checkA)} 70 × {nf(4.5, lang, 1)}
                                <sup>0{lang === "hr" ? "," : "."}75</sup> = {nf(Math.round(rerOf(4.5)), lang)} {L(T.checkB)} {nf(Math.round(rerOf(4.5) * 1.4), lang)} {L(T.checkC)}
                            </p>
                        </details>
                    </div>
                </div>
            </section>

            <section className="fz-sec">
                <div className="fz-wrap">
                    <h2 className="fz-h2">{L(T.weekH)}</h2>
                    <p className="fz-lead">{L(SHOP ? T.weekSub : T.weekSubNow)}</p>
                    <div className="fz-grid fz-grid--week">
                        {weekDay.map((id, i) => dcard(id, i))}
                        {weekIds.map((id, i) => card(RECIPES.find((r) => r.id === id) as Rec, i + weekDay.length))}
                    </div>
                    <div className="fz-center">
                        <button type="button" className="fz-btn fz-btn--g" onClick={() => go({ p: "recipes" })}>
                            {L(T.allR)} <Ico d={I.right} s={16} w={2.4} />
                        </button>
                    </div>
                </div>
            </section>

            <section className="fz-sec fz-sec--2">
                <div className="fz-wrap">
                    <h2 className="fz-h2">{L(SHOP ? T.twoH : T.twoHNow)}</h2>
                    <p className="fz-lead">{L(SHOP ? T.twoSub : T.twoSubNow)}</p>
                    <div className="fz-two">
                        <div className="fz-way">
                            <h3 className="fz-h3">{L(T.cookT)}</h3>
                            <p>{L(T.cookD)}</p>
                            <ul>
                                {T.cookL.map((x, i) => (
                                    <li key={i}>
                                        <Ico d={I.check} s={18} w={2.6} />
                                        {L(x)}
                                    </li>
                                ))}
                            </ul>
                            <button type="button" className="fz-btn fz-btn--g" onClick={() => go({ p: "recipes" })}>
                                {L(T.cookB)}
                            </button>
                            <img className="bis" src={ART.bis1} alt="" loading="lazy" />
                        </div>
                        <div className="fz-way fz-way--g">
                            <h3 className="fz-h3">{L(SHOP ? T.readyT : T.readyNowT)}</h3>
                            <p>{L(SHOP ? T.readyD : T.readyNowD)}</p>
                            {SHOP ? (
                                <>
                                    <ul>
                                        {T.readyL.map((x, i) => (
                                            <li key={i}>
                                                <Ico d={I.check} s={18} w={2.6} />
                                                {L(x)}
                                            </li>
                                        ))}
                                    </ul>
                                    <button type="button" className="fz-btn fz-btn--w" onClick={() => orderPouch()}>
                                        {L(T.makePlan)}
                                    </button>
                                </>
                            ) : (
                                <span className="fz-soonpill">{L(T.soonPill)}</span>
                            )}
                            <div className="pou">
                                <PouchArt p={POUCHES[0]} lang={lang} size={fullG / 2 + " g · " + L(ageW)} w={104} uid="hw" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="fz-sec" id="fz-how">
                <div className="fz-wrap">
                    <h2 className="fz-h2">{L(SHOP ? T.howH : T.howNowH)}</h2>
                    <div className="fz-how">
                        {(SHOP ? T.hows : T.howsNow).map(([h, p], i) => (
                            <div className="fz-hw" key={i}>
                                <div className="n">{i + 1}</div>
                                <h3 className="fz-h3">{L(h)}</h3>
                                <p>{L(p)}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="fz-sec fz-sec--2" id="fz-story">
                <div className="fz-wrap fz-story">
                    <div>
                        <h2 className="fz-h2">{L(T.storyH)}</h2>
                        <p>{L(T.storyP1)}</p>
                        <p>{L(T.storyP2)}</p>
                        <p>{L(LIVE ? T.storyP3Live : SHOP ? T.storyP3 : T.storyP3Now)}</p>
                        <div className="fz-sign fz-hand">{L(T.storySign)}</div>
                        <a className="ig" href="https://www.instagram.com/freshys.os/" target="_blank" rel="noopener noreferrer">
                            <span className="fz-badge av">
                                <img src={ART.wmW} alt="" />
                            </span>
                            <span>
                                <b>@freshys.os</b>
                                <span>{L(T.ig)}</span>
                            </span>
                        </a>
                    </div>
                    <div className="fz-board" aria-hidden="true">
                        <img className="b1" src={ART.bis1} alt="" loading="lazy" />
                        <img className="b2" src={ART.bis2} alt="" loading="lazy" />
                        <span className="fz-badge lg">
                            <img src={ART.wmW} alt="" />
                        </span>
                        <div className="fz-note fz-hand">
                            {L(T.storyNote)}
                            <small>— Bronx</small>
                        </div>
                    </div>
                </div>
            </section>

            <section className="fz-sec">
                <div className="fz-wrap">
                    <div className="fz-faqseal" aria-hidden="true">
                        <FzSeal />
                    </div>
                    <h2 className="fz-h2">{L(T.faqH)}</h2>
                    <p className="fz-lead">{L(T.faqSub)}</p>
                    <div className="fz-faq">
                        {(SHOP ? T.faq : T.faqNow).map(([qq, a], i) => (
                            <details key={i}>
                                <summary>
                                    {L(qq)}
                                    <i aria-hidden="true" />
                                </summary>
                                <p>{L(a)}</p>
                            </details>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    )

    /* ---------- recipes ---------- */

    const qn = norm(q.trim())
    const qw = qn
        .split(/\s+/)
        .filter(Boolean)
        .map((w) => (w.length >= 4 ? w.slice(0, -1) : w))
    const hit = (idx: string) => qw.every((w) => idx.includes(w) || (!!SYN[w] && idx.includes(SYN[w])))
    const passMeta = (m?: RMeta) => {
        if (!m) return true
        if (have.some((k) => !m.has.has(k))) return false
        if (noIng.some((k) => m.no.has(k))) return false
        if (prep === "nobake" && (m.oven || m.frozen)) return false
        if (prep === "oven" && !m.oven) return false
        if (prep === "frozen" && !m.frozen) return false
        if (q30 && !(m.min != null && m.min <= 30)) return false
        if (few && m.n > 5) return false
        if (shopOk && !m.shop) return false
        return true
    }
    const list = RECIPES.filter((r) => {
        if (cat === "meals" && r.kind === "treat") return false
        if (cat === "daily" && !recMealOk(r)) return false
        if (cat === "top" && (r.kind !== "topper" || recMealOk(r))) return false
        if (cat === "treats" && r.kind !== "treat") return false
        if (cat === "stomach" && r.kind !== "bland") return false
        if (!passMeta(RMETA[r.id])) return false
        if (qw.length && !hit(SEARCH_IDX[r.id])) return false
        return true
    })
    const clist = catalog
        ? catalog.filter((r, ix) => {
              if (cat === "meals" && r.k === "t") return false
              if (cat === "daily" && !cMealOk(r)) return false
              if (cat === "top" && (r.k !== "m" || cMealOk(r))) return false
              if (cat === "treats" && r.k !== "t") return false
              if (cat === "stomach" && r.k !== "b") return false
              if (!passMeta(cMeta.get(r.id))) return false
              if (qw.length && !hit(cIdx[ix])) return false
              return true
          })
        : []
    const rTotal = list.length + clist.length
    const allN = RECIPES.length + (catalog ? catalog.length : 0)
    const rSubTxt = (catalog ? allN + " " + pl(lang, allN, ["recipe", "recipes"], ["recept", "recepta", "recepata"]) + " " + L(T.rSubFrom) : L(T.rSubAll)) + L(T.rSub)
    const tapIng = (k: string) => {
        if (imode === 0) {
            setHave(have.includes(k) ? have.filter((x) => x !== k) : [...have, k])
            if (noIng.includes(k)) setNoIng(noIng.filter((x) => x !== k))
        } else {
            setNoIng(noIng.includes(k) ? noIng.filter((x) => x !== k) : [...noIng, k])
            if (have.includes(k)) setHave(have.filter((x) => x !== k))
        }
    }
    const resetAll = () => {
        setQ("")
        setCat("all")
        setHave([])
        setNoIng([])
        setPrep("")
        setQ30(false)
        setFew(false)
        setShopOk(false)
    }
    // "with chicken and carrot, without eggs and no oven, 30 min or less"
    const countRest = () => {
        const en = lang === "en"
        let s = ""
        if (have.length) s += " " + (en ? "with " + andList(have.map((k) => ING[k].ins.en), lang) : sHr(andList(have.map((k) => ING[k].ins.hr), lang)))
        const negs: string[] = []
        if (noIng.length) negs.push((en ? "without " : "bez ") + andList(noIng.map((k) => L(ING[k].gen)), lang))
        if (prep === "nobake") negs.push(L(T.prepPh.nobake))
        const parts: string[] = []
        if (negs.length) parts.push(negs.join(en ? ", " : " i "))
        if (prep === "oven" || prep === "frozen") parts.push(L(T.prepPh[prep]))
        if (q30) parts.push(L(T.q30Ph))
        if (few) parts.push(L(T.fewPh))
        if (shopOk) parts.push(L(T.shopPh))
        return s + (parts.length ? (s ? ", " : " ") + parts.join(", ") : "")
    }
    const buildFromHave = () => {
        const p = have.find((k) => BI[k] && BI[k].g === 0)
        if (p) setBp(p)
        setBc(have.find((k) => BI[k] && BI[k].g === 1) || null)
        setBv(have.filter((k) => BI[k] && BI[k].g === 2).slice(0, 2))
        setBmode(0)
        go({ p: "build" })
    }
    const ingPanel = (
        <div className="fz-ip">
            <div className="fz-ip-h">
                <div>
                    <h2 className="fz-h3">{L(imode ? T.noH : T.haveH)}</h2>
                    <p>{L(T.ipHint)}</p>
                </div>
                <div className="fz-seg" role="group" aria-label={L(T.ipModeL)}>
                    <button type="button" aria-pressed={imode === 0} onClick={() => setImode(0)}>
                        <Em n="check-mark-button" />
                        {L(T.mHave)}
                    </button>
                    <button type="button" aria-pressed={imode === 1} onClick={() => setImode(1)}>
                        <Ico d={I.ban} s={18} />
                        {L(T.mNo)}
                    </button>
                </div>
            </div>
            <div className="fz-ig">
                {ING_DEFS.map((d) => {
                    const s = have.includes(d.k) ? "have" : noIng.includes(d.k) ? "no" : ""
                    return ingTile(d.k, s, () => tapIng(d.k), imode === 0 ? s === "have" : s === "no")
                })}
            </div>
            {(have.length > 0 || noIng.length > 0) && (
                <div className="fz-ip-s">
                    <span>
                        {have.length > 0 && (
                            <>
                                {L(T.youHave)} <b>{have.map((k) => L(ING[k].n).toLowerCase()).join(", ")}</b>
                            </>
                        )}
                        {have.length > 0 && noIng.length > 0 && " · "}
                        {noIng.length > 0 && (
                            <>
                                {L(T.dogNo)} <b className="no">{noIng.map((k) => L(ING[k].n).toLowerCase()).join(", ")}</b>
                            </>
                        )}
                    </span>
                    <button
                        type="button"
                        onClick={() => {
                            setHave([])
                            setNoIng([])
                        }}
                    >
                        {L(T.clearIng)}
                    </button>
                </div>
            )}
        </div>
    )
    const cTitle = (r: CRec) => (lang === "hr" ? r.th : r.t)
    const cTime = (m: number) => (m < 60 ? m + " min" : Math.floor(m / 60) + " h" + (m % 60 ? " " + (m % 60) + " min" : ""))
    const cKind = (r: CRec) =>
        r.k === "t" ? <span className="fz-tag fz-tag--p">{L(T.kTreat)}</span> : r.k === "b" ? <span className="fz-tag fz-tag--b">{L(T.kBland)}</span> : <span className="fz-tag fz-tag--t">{L(cMealOk(r) ? T.kMeal : T.kTopper)}</span>
    const ccard = (r: CRec, i: number) => (
        <article key={r.id} className="fz-rc" style={{ ["--r" as any]: ROT[i % ROT.length] + "deg" } as React.CSSProperties}>
            <button className="im" type="button" tabIndex={-1} aria-hidden="true" onClick={() => go({ p: "recipe", id: cId(r) })}>
                <img src={cImg(r, 512)} alt="" loading="lazy" decoding="async" />
            </button>
            <div className="b">
                <h3>
                    <button type="button" onClick={() => go({ p: "recipe", id: cId(r) })}>
                        {cTitle(r)}
                    </button>
                </h3>
                <div className="m">
                    {r.m ? cTime(r.m) + " · " : ""}
                    {r.i.length} {pl(lang, r.i.length, ["ingredient", "ingredients"], ["sastojak", "sastojka", "sastojaka"])}
                </div>
                {haveIn(cMeta.get(r.id))}
                <div className="row">
                    <span className="tags">
                        {cKind(r)}
                        {methodTag(cMeta.get(r.id))}
                    </span>
                    <span className="bb">
                        <button type="button" className="fz-btn fz-btn--sm fz-btn--g" onClick={() => go({ p: "recipe", id: cId(r) })}>
                            {L(T.cook)}
                        </button>
                    </span>
                </div>
            </div>
        </article>
    )
    const recipesPage = (
        <div className="fz-page" key="recipes">
            <section className="fz-ph fz-ruled">
                <div className="fz-wrap">
                    <h1 className="fz-h1">{L(T.recipes)}</h1>
                    <p className="fz-lead">{rSubTxt}</p>
                    <div className="fz-search">
                        <Ico d={I.search} s={20} />
                        <input type="search" value={q} placeholder={L(T.search)} aria-label={L(T.search)} onChange={(e) => setQ(e.target.value)} />
                        {q && (
                            <button type="button" aria-label={L(T.clear)} onClick={() => setQ("")}>
                                <Ico d={I.x} s={16} w={2.4} />
                            </button>
                        )}
                    </div>
                    <div className="fz-filters" role="group" aria-label={L(T.recipes)}>
                        {T.cats.map(([id, t]) => (
                            <button key={id} type="button" className="fz-chip" aria-pressed={cat === id || (cat === "meals" && (id === "daily" || id === "top"))} onClick={() => setCat(id)}>
                                {L(t)}
                            </button>
                        ))}
                    </div>
                    {cat === "daily" && <p className="fz-hint">{L(T.dailyHint)}</p>}
                    {cat === "stomach" && <p className="fz-hint fz-hint--w">{L(T.blandVet)}</p>}
                    {ingPanel}
                    <div className="fz-filters">
                        <span className="lb">{L(T.prepL)}</span>
                        {["nobake", "oven", "frozen"].map((k) => (
                            <button key={k} type="button" className="fz-chip" aria-pressed={prep === k} onClick={() => setPrep(prep === k ? "" : k)}>
                                <Em n={PREP_EM[k]} />
                                {L(T.prep[k])}
                            </button>
                        ))}
                        <span className="sp" aria-hidden="true" />
                        <span className="lb">{L(T.quickL)}</span>
                        <button type="button" className="fz-chip" aria-pressed={q30} onClick={() => setQ30(!q30)}>
                            <Em n="stopwatch" />
                            {L(T.q30)}
                        </button>
                        <button type="button" className="fz-chip" aria-pressed={few} onClick={() => setFew(!few)}>
                            <Em n="basket" />
                            {L(T.few)}
                        </button>
                        <button type="button" className="fz-chip" aria-pressed={shopOk} onClick={() => setShopOk(!shopOk)}>
                            <Em n="shopping-cart" />
                            {L(T.shopOk)}
                        </button>
                    </div>
                    <div className="fz-note fz-hand">
                        {L(T.wish)}
                        <small>— B.</small>
                    </div>
                </div>
            </section>
            <div className="fz-wrap">
                <div className="fz-count" aria-live="polite">
                    <span>
                        {catalog ? (
                            <>
                                <b>{rTotal + " " + pl(lang, rTotal, ["recipe", "recipes"], ["recept", "recepta", "recepata"])}</b>
                                {countRest()}
                            </>
                        ) : (
                            <b>{L(T.loadingR)}</b>
                        )}
                    </span>
                </div>
                {list.length > 0 && (
                    <>
                        <h2 className="fz-sech">{L(T.favH)}</h2>
                        <div className="fz-grid fz-grid--4">{list.map((r, i) => card(r, i))}</div>
                    </>
                )}
                {catalog && rTotal === 0 ? (
                    <div className="fz-empty">
                        <p>{L(T.none)}</p>
                        <div className="fz-hand">{L(T.noneNote)} — B.</div>
                        <div className="fz-center" style={{ marginTop: 24, gap: 12, flexWrap: "wrap" }}>
                            {have.some((k) => !!BI[k]) && (
                                <button type="button" className="fz-btn fz-btn--p" onClick={buildFromHave}>
                                    {L(T.fromHave)}
                                </button>
                            )}
                            <button type="button" className="fz-btn fz-btn--g" onClick={resetAll}>
                                {L(T.showAll)}
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        {(!catalog || clist.length > 0) && (
                            <h2 className="fz-sech">
                                {L(T.allH)}
                                {catalog && <small>{clist.length}</small>}
                            </h2>
                        )}
                        {catalog ? (
                            clist.length > 0 && (
                                <>
                                    <div className="fz-grid fz-grid--4">{clist.slice(0, shown).map((r, i) => ccard(r, i))}</div>
                                    {clist.length > shown && (
                                        <div className="fz-center" style={{ marginTop: 32 }}>
                                            <button type="button" className="fz-btn fz-btn--g" onClick={() => setShown(shown + 24)}>
                                                {L(T.moreR)} ({clist.length - shown})
                                            </button>
                                        </div>
                                    )}
                                </>
                            )
                        ) : catErr ? (
                            <div className="fz-empty">
                                <p>{L(T.catErr)}</p>
                                <div className="fz-center" style={{ marginTop: 20 }}>
                                    <button type="button" className="fz-btn fz-btn--g" onClick={() => setCatTry(catTry + 1)}>
                                        {L(T.retry)}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="fz-grid fz-grid--4" aria-hidden="true">
                                {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                                    <div key={i} className="fz-skel" />
                                ))}
                            </div>
                        )}
                    </>
                )}
                <p className="fz-src">{L(T.credit)}</p>
            </div>
        </div>
    )

    /* ---------- recipe ---------- */

    const rIdx = Math.max(0, RECIPES.findIndex((r) => r.id === page.id))
    const rec = RECIPES[rIdx]
    const recPouch = rec.pouch ? POUCHES.find((p) => p.id === rec.pouch) : undefined
    /* Why the amount is small: a topper or treats are 10% of the day, the usual food is the other 90%. */
    /* the 10 % bar and why: shown under "How we worked it out" */
    const share10Bar = (treat: boolean) => (
        <>
            <div className="fz-share" aria-hidden="true">
                <i />
            </div>
            <div className="fz-share-l" aria-hidden="true">
                <span>
                    <b>{lang === "en" ? "10%" : "10 %"}</b> {L(treat ? T.shTreat : T.shRec)}
                </span>
                <span>
                    <b>{lang === "en" ? "90%" : "90 %"}</b> {L(T.shFood)}
                </span>
            </div>
        </>
    )
    const share10 = (treat: boolean) => <p className="t">{L(treat ? T.treatsAll : T.onTop)}</p>
    const lowCal = (pc = false) => (
        <>
            <p className="fz-low">{L(T.lowK)}</p>
            <p className="t">{L(pc ? T.lowPc : T.lowMl)}</p>
        </>
    )
    /* A batch that lasts more than 12 days is too much to keep in the fridge. */
    const longTxt = (parts: number) =>
        lang === "en"
            ? `The batch lasts ${parts} days. Make a smaller batch, or split it into portions and freeze them.`
            : `Recept je dovoljan za ${parts} ${plHr(parts, ["dan", "dana", "dana"])}. Skuhaj manju količinu ili ga podijeli u porcije i zamrzni.`
    const partsHr = (n: number) => plHr(n, ["jednak dio", "jednaka dijela", "jednakih dijelova"])
    /* Pieces a day in a form people use. n: pieces allowed (rounded down), perPc: kcal per piece,
       yMax: pieces in the batch (the larger number of a range, so a part is never over the limit; 0 if unknown). */
    const pcView = (n: number, perPc: number, yMax: number, word: (k: number) => string, gen1: string) => {
        if (n < 1) {
            const f = Math.ceil(perPc / day10)
            return (
                <>
                    <div className="big">
                        <em>{L(T.upTo)}</em>1/{f}
                        <small>{lang === "en" ? "of a " + word(1) + " a day" : gen1 + " dnevno"}</small>
                    </div>
                    <p className="t">{lang === "en" ? `Cut one into ${f} pieces and give one piece a day.` : `Podijeli jedan komad na ${f} ${plHr(f, ["dio", "dijela", "dijelova"])} i daj jedan dio dnevno.`}</p>
                </>
            )
        }
        if (!yMax && n > 30) return lowCal(true)
        if (n <= COUNT_MAX || !yMax) {
            const k = n <= COUNT_MAX ? n : Math.floor(n / 5) * 5
            return (
                <>
                    <div className="big">
                        <em>{L(T.upTo)}</em>
                        <Num v={k} lang={lang} />
                        <small>
                            {word(k)} {L(T.aDay)}
                        </small>
                    </div>
                    {k > COUNT_MAX && <p className="t">{L(T.countOnce)}</p>}
                </>
            )
        }
        const parts = Math.ceil(yMax / n)
        if (parts <= 1)
            return (
                <>
                    <div className="big">
                        <em>{L(T.upTo)}</em>
                        <span className="w">{L(T.wholeB)}</span>
                        <small>{L(T.aDay)}</small>
                    </div>
                    <p className="t">
                        {lang === "en"
                            ? `The whole batch (about ${nf(yMax, lang)} ${word(yMax)}) fits in the daily limit, so you don't have to count.`
                            : `Cijeli recept (oko ${nf(yMax, lang)} ${word(yMax)}) stane u dnevnu granicu, pa ih ne moraš brojati.`}
                    </p>
                </>
            )
        return (
            <>
                <div className="big">
                    <em>{L(T.upTo)}</em>1/{parts}
                    <small>
                        {L(T.ofRecipe)} {L(T.aDay)}
                    </small>
                </div>
                <p className="t">
                    {lang === "en"
                        ? `Split the batch into ${parts} equal parts and give one a day, so you don't have to count. The daily limit is ${n} ${word(n)}.`
                        : `Podijeli recept na ${parts} ${partsHr(parts)} i daj jedan dnevno, pa komade ne moraš brojati. Dnevna granica je ${n} ${word(n)}.`}
                </p>
            </>
        )
    }
    /* Millilitres a day: spoons only for small amounts, and how to split the batch when its volume is known (vMax, larger number). */
    const gView = (g: number, total: number, sub?: React.ReactNode) => {
        const parts = total ? Math.ceil(total / g) : 0
        const [v, u] = gTxtDn(g)
        return (
            <>
                <div className="big">
                    <em>{L(T.upTo)}</em>
                    {v}
                    <small>{u + " " + L(T.aDay)}</small>
                </div>
                {sub}
                {parts === 1 && <p className="t">{lang === "en" ? "The whole batch fits in one day." : "Cijeli recept stane u jedan dan."}</p>}
                {parts > 12 && <p className="t">{longTxt(parts)}</p>}
                {parts > 1 && parts <= 12 && (
                    <p className="t">
                        {lang === "en"
                            ? `The batch lasts ${parts} days: split it into ${parts} equal parts and give one a day.${parts > 3 ? " Freeze what you won't use in time." : ""}`
                            : `Recept je dovoljan za ${parts} ${plHr(parts, ["dan", "dana", "dana"])}: podijeli ga na ${parts} ${partsHr(parts)} i daj jedan dnevno.${parts > 3 ? " Što nećeš potrošiti na vrijeme, zamrzni." : ""}`}
                    </p>
                )}
            </>
        )
    }
    const mlView = (ml: number, vMax: number, sub?: React.ReactNode) => {
        const parts = vMax ? Math.ceil(vMax / ml) : 0
        return (
            <>
                <div className="big">
                    <em>{L(T.upTo)}</em>
                    <Num v={ml} lang={lang} />
                    <small>{L(T.mlDay)}</small>
                </div>
                {sub}
                {parts === 1 && <p className="t">{lang === "en" ? "The whole batch fits in one day." : "Cijeli recept stane u jedan dan."}</p>}
                {parts > 12 && <p className="t">{longTxt(parts)}</p>}
                {parts > 1 && parts <= 12 && (
                    <p className="t">
                        {lang === "en"
                            ? `The batch lasts ${parts} days: split it into ${parts} equal parts and give one a day.${parts > 3 ? " Freeze what you won't use in time." : ""}`
                            : `Recept je dovoljan za ${parts} ${plHr(parts, ["dan", "dana", "dana"])}: podijeli ga na ${parts} ${partsHr(parts)} i daj jedan dnevno.${parts > 3 ? " Što nećeš potrošiti na vrijeme, zamrzni." : ""}`}
                    </p>
                )}
            </>
        )
    }
    /* ---- whole meal: the day's food from this recipe, in litres, pieces or parts of the recipe, and how long one recipe lasts ---- */
    const cookOn = cook > 0
    const feedSeg = (ok: boolean) =>
        ok ? (
            <div className="fz-feed">
                <span>{L(T.feedL)}</span>
                {seg(T.feedO, pup ? 2 : feed, (i) => setFeed(i), T.feedL)}
            </div>
        ) : null
    const pct = (v: number) => (lang === "en" ? v + "%" : v + " %")
    const shareBar = (sh: number) => (
        <>
            <div className="fz-share" aria-hidden="true">
                <i style={{ width: sh * 100 + "%", borderRadius: sh === 1 ? 99 : undefined }} />
            </div>
            <div className="fz-share-l" aria-hidden="true">
                <span>
                    <b>{pct(sh * 100)}</b> {L(T.shRec)}
                </span>
                {sh < 1 && (
                    <span>
                        <b>{pct(100 - sh * 100)}</b> {L(T.shFood)}
                    </span>
                )}
            </div>
        </>
    )
    const volTxt = (ml: number) => {
        if (ml >= 1000) { const l = Math.round(ml / 100) / 10; return [nf(l, lang, l % 1 ? 1 : 0), "l"] }
        return [nf(ml >= 300 ? Math.round(ml / 50) * 50 : Math.max(10, Math.round(ml / 10) * 10), lang), "ml"]
    }
    /* how long one recipe lasts as the whole day's food (d = days) */
    const lastsTxt = (d: number) => {
        if (d < 0.9) return ""
        const h = d < 3 ? Math.round(d * 2) / 2 : Math.round(d)
        const n = h === 1.5 ? (lang === "en" ? "a day and a half" : "dan i pol") : h === 2.5 ? (lang === "en" ? "two and a half days" : "dva i pol dana") : lang === "en" ? h + (h === 1 ? " day" : " days") : h + " " + plHr(h, ["dan", "dana", "dana"])
        return (lang === "en" ? "One recipe lasts about " + n + "." : "Jedan recept je dovoljan za oko " + n + ".") + (d > 3 ? (lang === "en" ? " Freeze what you won't use in time." : " Što nećeš potrošiti na vrijeme, zamrzni.") : "")
    }
    const mealTail = (sh: number) => (
        <>
            {sh < 1 && <p className="t">{L(T.halfRest)}</p>}
            <p className="fz-mnote">
                {L(T.vetDay)} (
                <a className="fz-link" href={HOME_URL} target="_blank" rel="noopener noreferrer">
                    {L(T.mealWhy)}
                </a>
                )
            </p>
        </>
    )
    const bigAbout = (num: React.ReactNode, unit: string) => (
        <div className="big">
            <em>{L(T.about)}</em>
            {num}
            <small>{unit}</small>
        </div>
    )
    /* the day's amount as shown (same rounding as gTxt / volTxt), halved for two meals a day */
    const twiceTxt = (x: number, wt: boolean) => {
        const shown = wt
            ? x >= 10000 ? Math.round(x / 1000) * 1000 : x >= 1000 || (x >= 300 && Math.round(x / 50) * 50 >= 1000) ? Math.round(x / 100) * 100 : x >= 300 ? Math.round(x / 50) * 50 : Math.max(5, Math.round(x / (x >= 100 ? 10 : 5)) * (x >= 100 ? 10 : 5))
            : x >= 1000 ? Math.round(x / 100) * 100 : x >= 300 ? Math.round(x / 50) * 50 : Math.max(10, Math.round(x / 10) * 10)
        const h = Math.max(5, Math.round(shown / 2 / 5) * 5)
        const t = h >= 1000 ? nf(h / 1000, lang, h % 100 ? 2 : 1) + (wt ? " kg" : " l") : nf(h, lang) + (wt ? " g" : " ml")
        return lang === "en" ? `If your dog eats twice a day, that's about ${t} a meal.` : `Ako jede dvaput dnevno, to je oko ${t} po obroku.`
    }
    /* by volume: ml a day and how long the batch lasts (total = batch volume in ml, 0 if unknown) */
    const mealVol = (ml: number, total: number, sh: number, dAlt = 0, wt = false) => {
        const [v, u] = wt ? gTxt(ml) : volTxt(ml)
        const dd = total ? total / ml : dAlt
        const l = dd ? lastsTxt(dd) : ""
        return (
            <>
                {bigAbout(v, u + " " + L(T.aDay))}
                {sh === 1 && <p className="t">{twiceTxt(ml, wt)}</p>}
                {l && <p className="t">{l}</p>}
                {dd > 0 && dd < 0.9 && <p className="t">{lang === "en" ? "One recipe isn't enough for a day: make " + fracTxt(1 / dd) + " recipes." : "Jedan recept nije dovoljan za jedan dan: skuhaj " + fracTxt(1 / dd) + " recepta."}</p>}
                {mealTail(sh)}
            </>
        )
    }
    /* by parts of the recipe, when the yield isn't a volume (f = recipes a day) */
    const mealFrac = (f: number, sh: number) => {
        const d = 1 / f
        return (
            <>
                {d > 4.5 ? (
                    <div className="big">
                        <Num v={Math.round(d)} lang={lang} />
                        <small>{L(T.daysOne)}</small>
                    </div>
                ) : f > 0.88 && f <= 1.12 ? (
                    <div className="big">
                        <span className="w">{L(T.wholeRec)}</span>
                        <small>{L(T.aDay)}</small>
                    </div>
                ) : (
                    bigAbout(fracTxt(f), L(f > 1.12 ? T.recsDay : T.recDay))
                )}
                {d > 4.5 ? (
                    <p className="t">{lang === "en" ? `Split it into ${Math.round(d)} equal parts and give one a day. Freeze what you won't use in time.` : `Podijeli ga na ${Math.round(d)} ${partsHr(Math.round(d))} i daj jedan dnevno. Što nećeš potrošiti na vrijeme, zamrzni.`}</p>
                ) : (
                    lastsTxt(d) && <p className="t">{lastsTxt(d)}</p>
                )}
                {mealTail(sh)}
            </>
        )
    }
    /* by pieces (per = kcal in one piece, yMax = pieces in the batch or 0) */
    const mealPc = (per: number, yMax: number, word: (k: number) => string, sh: number) => {
        const n = Math.max(1, Math.round(needDay(sh) / per))
        return (
            <>
                {bigAbout(<Num v={n} lang={lang} />, word(n) + " " + L(T.aDay))}
                {yMax > 0 && yMax / n >= 0.9 && <p className="t">{lastsTxt(yMax / n)}</p>}
                {yMax > 0 && yMax / n < 0.9 && <p className="t">{lang === "en" ? "One recipe isn't enough for a day: make " + fracTxt(n / yMax) + " recipes." : "Jedan recept nije dovoljan za jedan dan: skuhaj " + fracTxt(n / yMax) + " recepta."}</p>}
                {mealTail(sh)}
            </>
        )
    }
    const pupNote = (ok: boolean) => (ok && pup ? <p className="t">{L(T.mealPup)}</p> : null)
    /* "How we worked it out", closed: the share of the day, the dog's energy (AAHA), the dish's calories (USDA) and the sum */
    const howBox = (sh: number, kpg: number, treat: boolean, kcTxt: string, usda: boolean, vet = false) => {
        const en = lang === "en"
        const need = needDay(sh)
        return (
            <details className="fz-calcd">
                <summary>
                    {L(T.howK)}
                    <Ico d={I.down} s={16} w={2.2} />
                </summary>
                {!vet && (sh > 0.1 ? shareBar(sh) : share10Bar(treat))}
                {!vet && (
                    <p className="t">
                        {en ? "Your dog needs " : "Tvom psu dnevno treba "}
                        <span style={{ whiteSpace: "nowrap" }}>
                            {nf(kLoD, lang)}–{nf(kHiD, lang)} kcal
                        </span>
                        {en ? " a day" : ""} (
                        <a className="fz-link" href={AAHA_URL} target="_blank" rel="noopener noreferrer">
                            {L(T.needsSrc)}
                        </a>
                        ).
                    </p>
                )}
                {!vet &&
                    (sh > 0.1 ? (
                        <p className="t">
                            {L(T.kcMid)} {nf(kMid, lang)} kcal
                            {sh < 1 ? (en ? ", " + pct(sh * 100) + " of it from this dish: " : ", od toga iz ovog jela " + pct(sh * 100) + ": ") + nf(need, lang) + " kcal" : ""}.
                        </p>
                    ) : (
                        <p className="t">
                            {L(treat ? T.shWhyT : T.shWhyR)} (
                            <a className="fz-link" href={AAHA_10_URL} target="_blank" rel="noopener noreferrer">
                                {L(T.shSrc)}
                            </a>
                            ) {en ? `10% of ${nf(kLoD, lang)} kcal ≈ ${nf(day10, lang)} kcal.` : `10 % od ${nf(kLoD, lang)} kcal ≈ ${nf(day10, lang)} kcal.`}
                        </p>
                    ))}
                {kcTxt && (
                    <p className="t">
                        {L(T.kcal)}: {kcTxt}
                        {usda ? " · " + L(T.kcSrc) : ""}
                    </p>
                )}
                {!vet && kpg > 0 && (
                    <p className="t fz-sum">
                        {nf(need, lang)} kcal ÷ {nf(kpg, lang, 2)} {en ? "kcal per gram" : "kcal po gramu"} = {nf(Math.round((need / kpg) * 10) / 10, lang, 1)} g
                    </p>
                )}
            </details>
        )
    }
    /* a light dish someone wants to cook as the whole day's food: how much that would be, and a similar whole-day dish */
    const swapBox = (key: string, kpg: number) => {
        if (pup || feed === 2 || !(kpg > 0)) return null
        const alt = (DAY_SWAP[key] || []).find(dayOk)
        if (!alt) return null
        const sh = SHARES[feed]
        const [v, u] = gTxt(needDay(sh) / kpg)
        const en = lang === "en"
        return (
            <div className="fz-swap">
                <p>
                    {sh === 1
                        ? en
                            ? `This dish has fewer calories: as the whole day's food your dog would have to eat about ${v} ${u} of it a day. A dish with more calories is better, for example:`
                            : `Ovo jelo ima manje kalorija: za cijeli dan tvoj pas bi ga morao pojesti oko ${v} ${u} dnevno. Bolje je jelo s više kalorija, na primjer:`
                        : en
                          ? `This dish has fewer calories: for half and half your dog would have to eat about ${v} ${u} of it a day. A dish with more calories is better, for example:`
                          : `Ovo jelo ima manje kalorija: za pola-pola tvoj pas bi ga morao pojesti oko ${v} ${u} dnevno. Bolje je jelo s više kalorija, na primjer:`}
                </p>
                {dayRow(alt, sh, false)}
            </div>
        )
    }
    /* ---- cooking ahead ---- */
    const daysT = (n: number) => (lang === "en" ? n + (n === 1 ? " day" : " days") : n + " " + plHr(n, ["dan", "dana", "dana"]))
    const cookOthOn = cookOth || (cook > 0 && cook !== 7 && cook !== 30)
    const cookPlan = (info: CookI | null, frTxt: string, fzTxt: string, nDays?: number) => {
        const n = nDays || cook
        if (!info || !(n > 0) || !(info.d1 > 0)) return null
        const ds = (frTxt.match(/\d+/g) || []).map((v) => parseInt(v, 10))
        const fLo = ds[0] || 3
        const fHi = ds[ds.length - 1] || 3
        const mult = Math.max(1, Math.ceil(n / info.d1 - 0.1))
        const days = Math.max(n, info.ml || info.n ? Math.floor(mult * info.d1 + 0.1) : Math.round(mult * info.d1))
        return { n, mult, days, fLo, fHi }
    }
    /* days, half days below three: "dan i pol", "4 dana" */
    const daysAbout = (d: number) => {
        const h = d < 3 ? Math.max(0.5, Math.round(d * 2) / 2) : Math.round(d)
        if (lang === "en") return h === 0.5 ? "half a day" : h === 1.5 ? "a day and a half" : h === 2.5 ? "two and a half days" : h + (h === 1 ? " day" : " days")
        return h === 0.5 ? "pola dana" : h === 1.5 ? "dan i pol" : h === 2.5 ? "dva i pol dana" : h + " " + plHr(h, ["dan", "dana", "dana"])
    }
    /* what cooking ahead gives, as text: the plan line, how much and for how long, fridge and freezer, weighing, a big batch */
    type CookTx = { head: string; got: string; keep: string; weigh: string; tail: string; tailW: boolean }
    const cookTx = (info: CookI, p: { n: number; mult: number; days: number; fLo: number; fHi: number }, frTxt: string, fzTxt: string): CookTx => {
        const en = lang === "en"
        const fr = frTxt || daysT(3)
        const vt = (ml: number) => (info.wt ? gTxt(ml) : volTxt(ml)).join(" ")
        // days the recipe keeps in the freezer, from its own storage line (months × 30)
        const fzM = (fzTxt.match(/\d+/g) || []).map((v) => parseInt(v, 10))
        const fzMax = fzM.length ? fzM[fzM.length - 1] * 30 : 0
        const head = p.mult === 1 ? (en ? `One recipe is enough for ${daysT(p.n)}.` : `Za ${daysT(p.n)} dovoljan je jedan recept.`) : en ? `For ${daysT(p.n)}, make ${p.mult} times the recipe.` : `Za ${daysT(p.n)} skuhaj ${p.mult} puta veći recept.`
        let got = ""
        if (info.ml && info.tot)
            got = en
                ? `You get about ${vt(info.tot * p.mult)}, enough for about ${daysAbout(p.mult * info.d1)} at about ${vt(info.ml)} a day.`
                : `Dobiješ oko ${vt(info.tot * p.mult)}, dovoljno za oko ${daysAbout(p.mult * info.d1)} uz oko ${vt(info.ml)} dnevno.`
        else if (info.n && info.pcs && info.word) {
            const all = Math.round(info.pcs * p.mult)
            got = en ? `You get about ${all} ${info.word(all)}: ${info.n} a day, for ${daysT(p.days)}.` : `Dobiješ oko ${all} ${info.word(all)}: ${info.n} na dan, za ${daysT(p.days)}.`
        } else got = en ? `Split it all into ${p.days} equal daily ${p.days === 1 ? "portion" : "portions"}.` : `Sve podijeli na ${p.days} ${plHr(p.days, ["dnevnu porciju", "jednake dnevne porcije", "jednakih dnevnih porcija"])}.`
        const keep =
            p.days <= p.fLo
                ? en
                    ? `It can all go in the fridge (it keeps ${fr}).`
                    : `Sve može u hladnjak (stoji ${fr}).`
                : en
                  ? `Put ${p.fLo} ${p.fLo === 1 ? "portion" : "portions"} in the fridge and freeze the rest${fzTxt ? ` (they keep ${fzTxt})` : ""}. Thaw each one in the fridge overnight.`
                  : `${p.fLo} ${plHr(p.fLo, ["porciju", "porcije", "porcija"])} stavi u hladnjak, a ostale zamrzni${fzTxt ? ` (stoje ${fzTxt})` : ""}. Svaku odmrzni preko noći u hladnjaku.`
        const weigh =
            p.days > 1 && (info.wt || !info.n) && Math.abs(p.mult * info.d1 - p.days) < 0.15
                ? en
                    ? `To be exact, weigh the whole cooked dish and divide by ${p.days}.`
                    : `Najtočnije: izvaži cijelo skuhano jelo i podijeli s ${p.days}.`
                : ""
        const tailW = fzMax > 0 && p.days > fzMax
        const tail = tailW
            ? en
                ? `Frozen, it keeps ${fzTxt}. For ${daysT(p.n)}, cook it in ${Math.ceil(p.days / fzMax)} rounds, not all at once.`
                : `Zamrznuto stoji ${fzTxt}. Za ${daysT(p.n)} kuhaj u ${Math.ceil(p.days / fzMax)} navrata, ne sve odjednom.`
            : p.mult >= 4
              ? en
                  ? "That's a big batch: make it in more than one go."
                  : "To je velika količina: radi je u više navrata."
              : ""
        return { head, got, keep, weigh, tail, tailW }
    }
    const cookBox = (info: CookI | null, frTxt: string, fzTxt: string) => {
        if (!info) return null
        const p = cookPlan(info, frTxt, fzTxt)
        const tx = p ? cookTx(info, p, frTxt, fzTxt) : null
        const en = lang === "en"
        return (
            <div className="fz-cook">
                <div className="k2">{L(T.cookK)}</div>
                <div className="fz-cookd" role="group" aria-label={L(T.bDaysN)}>
                    <button type="button" className="fz-step" aria-label={L(T.less)} disabled={cook <= 1} onClick={() => setCook(cook - 1)}>
                        −
                    </button>
                    <b className="v">{daysT(cook)}</b>
                    <button type="button" className="fz-step" aria-label={L(T.more)} disabled={cook >= COOK_MAX} onClick={() => setCook(cook + 1)}>
                        +
                    </button>
                </div>
                <input
                    className="fz-range fz-cookr"
                    type="range"
                    min={1}
                    max={COOK_MAX}
                    step={1}
                    value={cook}
                    aria-label={L(T.bDaysN)}
                    aria-valuetext={daysT(cook)}
                    style={{ ["--p" as any]: ((cook - 1) / (COOK_MAX - 1)) * 100 + "%" } as React.CSSProperties}
                    onChange={(e) => setCook(+e.target.value)}
                />
                {p && tx && (
                    <div className="fz-cook-p" aria-live="polite">
                        <p>
                            <b>{tx.head}</b>
                            {p.mult > 1 ? (en ? " The ingredients below are already multiplied." : " Sastojci ispod su već pomnoženi.") : ""}
                        </p>
                        <p>{tx.got}</p>
                        <p>{tx.keep}</p>
                        {tx.weigh && <p>{tx.weigh}</p>}
                        {tx.tail && <p className={tx.tailW ? "w" : undefined}>{tx.tail}</p>}
                    </div>
                )}
            </div>
        )
    }
    /* own recipe: storage as written on the recipe, the day's portion by volume */
    const rStore = (() => {
        let fr = "",
            fz = ""
        rec.store.forEach((x) => {
            const t = L(x)
            const v = t.slice(t.indexOf(":") + 2)
            if (/^(Fridge|Hladnjak)/.test(t)) fr = v
            else if (/^(Freezer|Zamrzivač)/.test(t)) fz = v
        })
        return [fr, fz]
    })()
    const vnEnd = vn ? new Date(new Date(vn.t).getFullYear(), new Date(vn.t).getMonth(), new Date(vn.t).getDate() + vn.d) : null
    const vnOn = rec.kind === "bland" && !!vn && !!vnEnd && Date.now() < vnEnd.getTime()
    const rInfo: CookI | null = (() => {
        const sh = shareOf(recMealOk(rec))
        if (!recMealOk(rec) || sh <= 0.1 || !rec.batch || vnOn) return null
        const kpg = kpgR(rec)
        if (kpg) return { d1: rec.fw! / (needDay(sh) / kpg), ml: needDay(sh) / kpg, tot: rec.fw!, wt: true }
        const ml = needDay(sh) / (rec.kc.g || 0.75)
        return { d1: rec.batch / ml, ml, tot: rec.batch }
    })()
    const rPlan = cookPlan(rInfo, rStore[0], rStore[1])
    const bk = rPlan ? rPlan.mult : batch
    const dShort = (t: number) => new Date(t).toLocaleDateString(lang === "en" ? "en-GB" : "hr-HR", lang === "en" ? { day: "numeric", month: "short" } : { day: "numeric", month: "numeric" })
    const vetBox =
        rec.kind !== "bland" ? null : (
            <div className={"fz-vn" + (vn ? " on" : "")}>
                {vn && !vnEd ? (
                    <>
                        <div className="k2">{L(T.vnHead)}</div>
                        <p className="v" data-notr="">
                            {daysT(vn.d)}
                            {vn.a ? " · " + vn.a + (lang === "en" ? " a day" : " na dan") : ""}
                        </p>
                        <p className="t">{vnOn ? dShort(vn.t) + " – " + dShort(vnEnd!.getTime() - 864e5) : L(T.vnOver)}</p>
                        {vnOn && <p className="t">{L(T.vnWhile)}</p>}
                        <p className="fine2">{L(T.vnFine)}</p>
                        <div className="fz-vn-b">
                            <button type="button" className="fz-link" onClick={() => { setVnRm(false); setVnEd({ d: vn.d, a: vn.a }) }}>
                                {L(T.vnEdit)}
                            </button>
                            <button type="button" className="fz-link" onClick={() => { if (vnRm) { setVn(null); setVnRm(false) } else setVnRm(true) }}>
                                {L(vnRm ? T.vnDel2 : T.vnDel)}
                            </button>
                        </div>
                    </>
                ) : vnEd ? (
                    <>
                        <div className="k2">{L(T.vnHead)}</div>
                        <p className="fz-lbl">{L(T.vnDays)}</p>
                        <div className="fz-dstep" role="group" aria-label={L(T.vnDays)}>
                            <button type="button" className="fz-step" aria-label={L(T.less)} disabled={vnEd.d <= 1} onClick={() => setVnEd({ ...vnEd, d: vnEd.d - 1 })}>
                                −
                            </button>
                            <output className="v" aria-live="polite">
                                {daysT(vnEd.d)}
                            </output>
                            <button type="button" className="fz-step" aria-label={L(T.more)} disabled={vnEd.d >= 14} onClick={() => setVnEd({ ...vnEd, d: vnEd.d + 1 })}>
                                +
                            </button>
                        </div>
                        <label className="fz-lbl" htmlFor="fz-vn-a" style={{ display: "block", marginTop: 14 }}>
                            {L(T.vnAmt)}
                        </label>
                        <input id="fz-vn-a" className="fz-inp" type="text" maxLength={60} value={vnEd.a} placeholder={L(T.vnAmtPh)} onChange={(e) => setVnEd({ ...vnEd, a: e.target.value })} />
                        <div className="fz-vn-b">
                            <button type="button" className="fz-btn fz-btn--p fz-btn--sm" onClick={() => { setVn({ d: vnEd.d, a: vnEd.a.trim().slice(0, 60), t: vn ? vn.t : Date.now() }); setVnEd(null) }}>
                                {L(T.vnSave)}
                            </button>
                            <button type="button" className="fz-link" onClick={() => setVnEd(null)}>
                                {L(T.vnCancel)}
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="k2">{L(T.vnK)}</div>
                        <p className="t">{L(T.vnP)}</p>
                        <button type="button" className="fz-btn fz-btn--g fz-btn--sm" style={{ marginTop: 12 }} onClick={() => setVnEd({ d: 3, a: "" })}>
                            {L(T.vnAdd)}
                        </button>
                    </>
                )}
            </div>
        )
    const portion = () => {
        if (vnOn) return null
        if (rec.kind === "treat") {
            const per = rec.kc.pc || 1
            const n = Math.floor(day10 / per)
            const w = (k: number) => pl(lang, k, rec.pcw!.en, rec.pcw!.hr)
            return (
                <>
                    {pcView(n, per, maxNum(rec.makes.en) * bk, w, rec.pcw!.hr[1])}
                    {share10(true)}
                </>
            )
        }
        const sh = shareOf(recMealOk(rec))
        const kpg = kpgR(rec)
        if (sh > 0.1 && kpg) return mealVol(needDay(sh) / kpg, rec.fw! * bk, sh, 0, true)
        if (sh > 0.1) return mealVol(needDay(sh) / (rec.kc.g || 0.75), rec.batch ? rec.batch * bk : 0, sh)
        if (kpg)
            return (
                <>
                    {pupNote(recMealOk(rec))}
                    {gView(Math.max(5, fl5(day10 / kpg)), rec.fw! * bk, share10(false))}
                </>
            )
        const ml = Math.max(5, fl5(day10 / (rec.kc.g || 0.75)))
        return (
            <>
                {pupNote(recMealOk(rec))}
                {mlView(ml, rec.batch ? rec.batch * bk : 0, share10(false))}
            </>
        )
    }
    const prevR = RECIPES[(rIdx + RECIPES.length - 1) % RECIPES.length]
    const nextR = RECIPES[(rIdx + 1) % RECIPES.length]
    const recipePage = (
        <div className="fz-page" key={"r-" + rec.id}>
            <section className="fz-rp">
                <div className="fz-wrap">
                    <div className="fz-crumb fz-noprint">
                        <button type="button" onClick={() => go({ p: "recipes" })}>
                            <Ico d={I.left} s={16} w={2.4} />
                            {L(T.recipes)}
                        </button>
                    </div>
                    <h1 className="fz-h1">{L(rec.t)}</h1>
                    <div className="fz-chips">
                        <span className="fz-ch">
                            <Ico d={I.clock} s={16} />
                            {timeTxt(rec, lang)}
                        </span>
                        <span className="fz-ch">
                            <Ico d={I.list} s={16} />
                            {ingCount(rec, lang)}
                        </span>
                        <span className="fz-ch">
                            <Ico d={I.scale} s={16} />
                            {tok(L(rec.makes), bk, lang)}
                        </span>
                        {kindTag(rec)}
                        {rec.tex && rec.tex !== "frozen" && <span className="fz-tag fz-tag--x">{L(T.tex[rec.tex])}</span>}
                        {methodChip(RMETA[rec.id])}
                        {listBtn(rec.id, bk)}
                        <button type="button" className="fz-ch pr2 fz-noprint" onClick={() => typeof window !== "undefined" && window.print()}>
                            <Ico d={I.print} s={16} />
                            {L(T.print)}
                        </button>
                    </div>
                    <div className="fz-rpg">
                        <div className="ph">
                            <div className="fz-photo">
                                <i className="fz-tape fz-tape--o" style={{ width: 120, right: 30, top: -14, transform: "rotate(5deg)" }} />
                                <img src={rec.img} alt={L(rec.t)} style={{ objectPosition: rec.pos || "50% 50%" }} />
                                <div className="fz-scrib fz-hand">
                                    {L(rec.kind === "treat" ? T.noteTreat : rec.kind === "bland" ? T.noteBland : recMealOk(rec) ? T.noteMeal : T.noteTopper)} — B.
                                </div>
                            </div>
                        </div>
                        <aside className="fz-side">
                            <div className="fz-box">
                                <div className="k">{L(recMealOk(rec) ? T.forDogM : T.forDog)}</div>
                                <div className="mini">
                                    {weightSlider("fz-kg2")}
                                    <span>{kgTxt} kg</span>
                                </div>
                                {dogLine}
                                {!vnOn && feedSeg(recMealOk(rec))}
                                <div style={{ marginTop: 14 }} aria-live="polite">
                                    {portion()}
                                </div>
                                {!vnOn && recLight(rec) && swapBox(rec.id, kpgR(rec))}
                                {cookBox(rInfo, rStore[0], rStore[1])}
                                {vetBox}
                                {kitchenBtn(() => logMeal("r:" + rec.id, rec.kind === "bland" && vnOn ? 0 : rec.kc.pc ? 1 : kpgR(rec) ? (shareOf(recMealOk(rec)) > 0.1 ? Math.max(10, Math.round(needDay(shareOf(recMealOk(rec))) / kpgR(rec) / 10) * 10) : Math.max(5, fl5(day10 / kpgR(rec)))) : shareOf(recMealOk(rec)) > 0.1 ? Math.max(10, Math.round(needDay(shareOf(recMealOk(rec))) / (rec.kc.g || 0.75) / 10) * 10) : Math.max(5, fl5(day10 / (rec.kc.g || 0.75)))))}
                                {howBox(shareOf(recMealOk(rec)), rec.kc.pc ? 0 : kpgR(rec), rec.kind === "treat", kpgR(rec) ? "100 g ≈ " + nf(Math.round(kpgR(rec) * 100), lang) + " kcal · " + L(T.wholeR) + " ≈ " + nf(rec.tk!, lang) + " kcal" : L(rec.kc.per) + " ≈ " + rec.kc.v + " kcal", true, vnOn)}
                            </div>
                            <div className="fz-box">
                                <div className="k">{L(T.keeps)}</div>
                                <div style={{ marginTop: 8 }}>
                                    {rec.store.map((s, i) => (
                                        <div className="ln" key={i}>
                                            <Ico d={/^(Freezer|Zamrzivač)/.test(L(s)) ? I.snow : I.fridge} s={17} />
                                            {L(s)}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {SHOP && recPouch && (
                                <div className="fz-box fz-box--g">
                                    <div className="k">{L(T.noCook)}</div>
                                    <div className="pou">
                                        <PouchArt p={recPouch} lang={lang} size={fullG / 2 + " g · " + L(ageW)} w={70} uid="rp" />
                                        <p className="t" style={{ marginTop: 0 }}>
                                            {lang === "en"
                                                ? `We cook a complete version of this dish, ${recPouch.n.en.toLowerCase()}, portioned for your dog.`
                                                : `Kuhamo cijeli obrok od ovog jela, ${recPouch.n.hr.toLowerCase()}, odmjeren za tvog psa.`}
                                        </p>
                                    </div>
                                    <button type="button" className="fz-btn fz-btn--w" onClick={() => orderPouch(recPouch.id)}>
                                        {L(T.makePlan)}
                                    </button>
                                </div>
                            )}
                        </aside>
                        <div className="bd">
                            <div className="fz-cols">
                                <div>
                                    <div className="fz-colh">
                                        <div>
                                            <h2 className="fz-h3">{L(T.ingH)}</h2>
                                            <p className="fz-noprint">{L(T.tick)}</p>
                                        </div>
                                        {rPlan ? (
                                            <div className="fz-bt">
                                                <span className="fz-xk">{bk}×</span>
                                            </div>
                                        ) : (
                                            <div className="fz-bt fz-noprint">
                                                {seg(
                                                    T.batch3,
                                                    bOther || batch > 2 ? 2 : batch - 1,
                                                    (i) => {
                                                        if (i < 2) setBatch(i + 1)
                                                        else if (batch < 3) setBatch(3)
                                                        setBOther(i === 2)
                                                    },
                                                    T.batchL
                                                )}
                                                {(bOther || batch > 2) && (
                                                    <span className="fz-bstep" role="group" aria-label={L(T.batchN)}>
                                                        <button type="button" className="fz-step" aria-label={L(T.less)} disabled={batch <= 1} onClick={() => setBatch(batch - 1)}>
                                                            −
                                                        </button>
                                                        <output aria-live="polite">{batch}×</output>
                                                        <button type="button" className="fz-step" aria-label={L(T.more)} disabled={batch >= 12} onClick={() => setBatch(batch + 1)}>
                                                            +
                                                        </button>
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <ul className="fz-ing">
                                        {rec.ing.map((ing, i) => {
                                            const k = rec.id + i
                                            return (
                                                <li key={k}>
                                                    <label>
                                                        <input type="checkbox" checked={!!ticks[k]} onChange={() => setTicks({ ...ticks, [k]: !ticks[k] })} />
                                                        <span className="bx">
                                                            <Ico d={I.check} s={14} w={3} />
                                                        </span>
                                                        {ing.q != null && <span className="q">{qty(ing, bk, lang)}</span>}
                                                        <span className="t">
                                                            <span>
                                                                {ingText(ing, bk, lang)}
                                                                {ing.opt && <span className="op"> ({L(T.optional)})</span>}
                                                            </span>
                                                            {ing.w && <span className="nt nt--w">⚠ {L(ing.w)}</span>}
                                                            {ing.s && <span className="nt nt--s">↺ {L(ing.s)}</span>}
                                                        </span>
                                                    </label>
                                                </li>
                                            )
                                        })}
                                    </ul>
                                </div>
                                <div>
                                    <h2 className="fz-h3">{L(T.method)}</h2>
                                    <ol className="fz-steps">
                                        {rec.steps.map((s, i) => (
                                            <li key={i}>{tok(L(s), bk, lang)}</li>
                                        ))}
                                    </ol>
                                </div>
                            </div>
                            <div className="fz-qa">
                                <h2 className="fz-h3">{L(T.qaH)}</h2>
                                {rec.qa.map(([qq, a], i) => (
                                    <div key={i}>
                                        <b>{L(qq)}</b>
                                        <p>{L(a)}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="fz-srcl">
                                <span>{L(T.srcL)}</span>
                            </div>
                        </div>
                    </div>
                    <div className="fz-pn fz-noprint">
                        <button type="button" onClick={() => go({ p: "recipe", id: prevR.id })}>
                            <img src={prevR.img} alt="" loading="lazy" style={{ objectPosition: prevR.pos || "50% 50%" }} />
                            <span>
                                <small>← {L(T.prev)}</small>
                                <b>{L(prevR.t)}</b>
                            </span>
                        </button>
                        <button type="button" className="nx" onClick={() => go({ p: "recipe", id: nextR.id })}>
                            <span>
                                <small>{L(T.next)} →</small>
                                <b>{L(nextR.t)}</b>
                            </span>
                            <img src={nextR.img} alt="" loading="lazy" style={{ objectPosition: nextR.pos || "50% 50%" }} />
                        </button>
                    </div>
                </div>
            </section>
        </div>
    )

    /* ---------- recipe from the full list ---------- */

    const ci = isCat && catalog ? catalog.findIndex((r) => cId(r) === page.id) : -1
    const cr = ci >= 0 && catalog ? catalog[ci] : undefined
    const pcWord = (kc: CKc, n: number) => (lang === "en" ? (kc.we ? (n === 1 ? kc.we[0] : kc.we[1]) : n === 1 ? "piece" : "pieces") : plHr(n, PC_HR[kc.w || ""] || ["komad", "komada", "komada"]))
    const kcLine = (kc: CKc) =>
        kc.p === "pc"
            ? "1 " + pcWord(kc, 1) + " ≈ " + nf(Math.round(kc.k / kc.a), lang) + " kcal"
            : kc.p === "ml"
              ? nf(Math.round(kc.a), lang) + " ml ≈ " + nf(Math.round(kc.k), lang) + " kcal"
              : L(T.wholeR) + " ≈ " + nf(Math.round(kc.k / kc.a), lang) + " kcal"
    /* a catalogue recipe's fridge and freezer lines ("3–4 dana", "2 mjeseca") */
    const cStore = (r: CRec): [string, string] => {
        const up = (v: string) => parseInt(v.split("–").pop() || v, 10) || 0
        const fr = r.st.fridge ? (lang === "en" ? r.st.fridge + " days" : r.st.fridge + " " + plHr(up(r.st.fridge), ["dan", "dana", "dana"])) : ""
        const fz = r.st.freezer ? (lang === "en" ? r.st.freezer + (up(r.st.freezer) === 1 ? " month" : " months") : r.st.freezer + " " + plHr(up(r.st.freezer), ["mjesec", "mjeseca", "mjeseci"])) : ""
        return [fr, fz]
    }
    const cCook = (r: CRec): CookI | null => {
        const kc = r.kc
        const sh = shareOf(cMealOk(r))
        if (!kc || sh <= 0.1) return null
        const need = needDay(sh)
        const vr = volRange(r.y || "")
        const vol = vr ? (vr[0] + vr[1]) / 2 : 0
        const kpg = kpgC(r)
        if (kpg && kc.p !== "pc") return { d1: r.fw! / (need / kpg), ml: need / kpg, tot: r.fw!, wt: true }
        if (kc.p === "pc") {
            const pcs = volOf(r.y || "") || /cup/i.test(r.y || "") ? 0 : midNum(r.y || "")
            const n = Math.max(1, Math.round(need / (kc.k / kc.a)))
            return pcs > 0 ? { d1: pcs / n, n, pcs, word: (k) => pcWord(kc, k) } : null
        }
        if (kc.p === "ml") {
            const ml = need / (kc.k / kc.a)
            return vol ? { d1: vol / ml, ml, tot: vol } : WHOLE_KCAL[r.id] ? { d1: WHOLE_KCAL[r.id] / need } : null
        }
        const f = need / (kc.k / kc.a)
        return vol ? { d1: 1 / f, ml: f * vol, tot: vol } : { d1: 1 / f }
    }
    const cPortion = (r: CRec) => {
        if (SUPP.has(r.id))
            return (
                <>
                    <p className="t" style={{ fontWeight: 600, color: "var(--ink)" }}>
                        {L(T.suppH)}
                    </p>
                    <p className="t">{L(T.suppP)}</p>
                </>
            )
        const kc = r.kc
        const budget = day10
        const tail = share10(r.k === "t")
        const vr = volRange(r.y || "")
        const sh = shareOf(cMealOk(r))
        const kpg = kpgC(r)
        if (kc && sh > 0.1 && kpg && kc.p !== "pc") return mealVol(needDay(sh) / kpg, r.fw!, sh, 0, true)
        if (kc && kpg && kc.p !== "pc" && kpg < LIGHT_KCAL_ML) return lowCal()
        if (kc && kpg && kc.p !== "pc")
            return (
                <>
                    {pupNote(cMealOk(r))}
                    {gView(Math.max(5, fl5(day10 / kpg)), r.fw!, tail)}
                </>
            )
        if (kc && sh > 0.1) {
            const need = needDay(sh)
            if (kc.p === "pc") return mealPc(kc.k / kc.a, volOf(r.y || "") || /cup/i.test(r.y || "") ? 0 : midNum(r.y || ""), (k) => pcWord(kc, k), sh)
            if (kc.p === "ml") return mealVol(need / (kc.k / kc.a), vr ? (vr[0] + vr[1]) / 2 : 0, sh, WHOLE_KCAL[r.id] ? WHOLE_KCAL[r.id] / need : 0)
            // calories for the whole recipe: by volume when the yield is one, otherwise in parts of the recipe
            return vr ? mealVol((need / (kc.k / kc.a)) * ((vr[0] + vr[1]) / 2), (vr[0] + vr[1]) / 2, sh) : mealFrac(need / (kc.k / kc.a), sh)
        }
        if (!kc)
            return (
                <>
                    <p className="t" style={{ fontWeight: 600, color: "var(--ink)" }}>
                        {L(T.noKc)}
                    </p>
                    <p className="t">
                        {L(T.budget)} {nf(Math.max(5, fl5(budget)), lang)} kcal {L(T.aDay)}.
                    </p>
                </>
            )
        if (kc.p === "pc") {
            const per = kc.k / kc.a
            const n = Math.floor(budget / per)
            const forms = PC_HR[kc.w || ""] || ["komad", "komada", "komada"]
            return (
                <>
                    {pupNote(cMealOk(r))}
                    {pcView(n, per, volOf(r.y || "") || /cup/i.test(r.y || "") ? 0 : maxNum(r.y || ""), (k) => pcWord(kc, k), forms[1])}
                    {tail}
                </>
            )
        }
        if (kc.p === "ml") {
            const dens = kc.k / kc.a
            const broth = r.k !== "t" && /\bbroth\b/i.test(r.t)
            if (!broth && dens < LIGHT_KCAL_ML) return lowCal()
            const byKcal = Math.max(5, fl5(budget / dens))
            const byBroth = Math.max(5, fl5(BROTH_ML_KG * dog.kg))
            const brothCap = broth && byBroth < byKcal
            return (
                <>
                    {pupNote(cMealOk(r))}
                    {mlView(brothCap ? byBroth : byKcal, volOf(r.y || ""), brothCap ? undefined : tail)}
                    {brothCap && (
                        <p className="t">
                            {L(T.brothP)} (
                            <a className="fz-link" href={BROTH_URL} target="_blank" rel="noopener noreferrer">
                                {L(T.brothSrc)}
                            </a>
                            )
                        </p>
                    )}
                </>
            )
        }
        const whole = kc.k / kc.a
        const part = Math.max(1, Math.ceil(whole / budget))
        // the yield is a volume: millilitres and spoons say more than a part of the recipe ("1/20"); not for chips and other treats
        if (vr && r.k !== "t")
            return (
                <>
                    {pupNote(cMealOk(r))}
                    {mlView(Math.max(5, fl5(budget / (whole / ((vr[0] + vr[1]) / 2)))), vr[1], tail)}
                </>
            )
        return (
            <>
                {pupNote(cMealOk(r))}
                {part > 4 ? (
                    <div className="big">
                        <Num v={part} lang={lang} />
                        <small>{L(T.daysOne)}</small>
                    </div>
                ) : (
                    <div className="big">
                        <em>{L(T.upTo)}</em>
                        {part === 1 ? <span className="w">{L(T.wholeB)}</span> : ["½", "⅓", "¼"][part - 2]}
                        <small>{part === 1 ? L(T.aDay) : L(T.ofRecipe) + " " + L(T.aDay)}</small>
                    </div>
                )}
                {part > 12 && <p className="t">{longTxt(part)}</p>}
                {part > 1 && part <= 12 && (
                    <p className="t">
                        {lang === "en"
                            ? `Split the batch into ${part} equal parts and give one a day.${part > 3 ? " Freeze what you won't use in time." : ""}`
                            : `Podijeli recept na ${part} ${partsHr(part)} i daj jedan dnevno.${part > 3 ? " Što nećeš potrošiti na vrijeme, zamrzni." : ""}`}
                    </p>
                )}
                {tail}
            </>
        )
    }
    const stLines = (st: CRec["st"]) => {
        const out: [boolean, string][] = []
        const upper = (v: string) => parseInt(v.split("–").pop() || v, 10) || 0
        if (st.fridge) out.push([false, lang === "en" ? `Fridge: ${st.fridge} days` : `Hladnjak: ${st.fridge} ${plHr(upper(st.fridge), ["dan", "dana", "dana"])}`])
        if (st.freezer) out.push([true, lang === "en" ? `Freezer: ${st.freezer} ${upper(st.freezer) === 1 ? "month" : "months"}` : `Zamrzivač: ${st.freezer} ${plHr(upper(st.freezer), ["mjesec", "mjeseca", "mjeseci"])}`])
        if (st.room) {
            const w = st.room.endsWith("w"),
                v = st.room.slice(0, -1)
            out.push([false, lang === "en" ? `Room temperature, airtight: ${v} ${w ? (upper(v) === 1 ? "week" : "weeks") : upper(v) === 1 ? "day" : "days"}` : `Na sobnoj temperaturi, zatvoreno: ${v} ${w ? plHr(upper(v), ["tjedan", "tjedna", "tjedana"]) : plHr(upper(v), ["dan", "dana", "dana"])}`])
        }
        return out
    }
    const crumb = (
        <div className="fz-crumb fz-noprint">
            <button type="button" onClick={() => go({ p: "recipes" })}>
                <Ico d={I.left} s={16} w={2.4} />
                {L(T.recipes)}
            </button>
        </div>
    )
    const catPage = !isCat ? null : !cr ? (
        <div className="fz-page" key="c-wait">
            <section className="fz-rp">
                <div className="fz-wrap">
                    {crumb}
                    <div className="fz-empty">
                        <p>{catalog ? L(T.notFound) : catErr ? L(T.catErr) : L(T.loadingR)}</p>
                        {catErr && !catalog && (
                            <div className="fz-center" style={{ marginTop: 20 }}>
                                <button type="button" className="fz-btn fz-btn--g" onClick={() => setCatTry(catTry + 1)}>
                                    {L(T.retry)}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </div>
    ) : (
        (() => {
            const r = cr
            const prev = catalog![(ci + catalog!.length - 1) % catalog!.length]
            const next = catalog![(ci + 1) % catalog!.length]
            const st = stLines(r.st)
            const enTxt = lang === "en" || origEn
            const ings = enTxt ? r.i : r.ih
            const warnAt = (i: number) => (r.w ? Object.keys(r.w).filter((k) => r.w![k].includes(i)) : [])
            const [cFr, cFz] = cStore(r)
            const cInfo = cCook(r)
            const cPl = cookPlan(cInfo, cFr, cFz)
            const km = cPl ? cPl.mult : 1
            return (
                <div className="fz-page" key={"c-" + r.id}>
                    <section className="fz-rp">
                        <div className="fz-wrap">
                            {crumb}
                            <h1 className="fz-h1">{cTitle(r)}</h1>
                            <div className="fz-chips">
                                {r.m ? (
                                    <span className="fz-ch">
                                        <Ico d={I.clock} s={16} />
                                        {cTime(r.m)}
                                    </span>
                                ) : null}
                                <span className="fz-ch">
                                    <Ico d={I.list} s={16} />
                                    {r.i.length} {pl(lang, r.i.length, ["ingredient", "ingredients"], ["sastojak", "sastojka", "sastojaka"])}
                                </span>
                                {r.y && (
                                    <span className="fz-ch">
                                        <Ico d={I.scale} s={16} />
                                        {r.fw ? (lang === "en" ? "About " : "Oko ") + gTxt(r.fw).join(" ") : lang === "hr" && r.yh ? r.yh : r.y}
                                    </span>
                                )}
                                {cKind(r)}
                                {methodChip(cMeta.get(r.id))}
                                {listBtn(cId(r), km)}
                                <button type="button" className="fz-ch pr2 fz-noprint" onClick={() => typeof window !== "undefined" && window.print()}>
                                    <Ico d={I.print} s={16} />
                                    {L(T.print)}
                                </button>
                            </div>
                            <div className="fz-rpg">
                                <div className="ph">
                                    <div className="fz-photo">
                                        <i className="fz-tape fz-tape--o" style={{ width: 120, right: 30, top: -14, transform: "rotate(5deg)" }} />
                                        <img src={cImg(r, 1024)} alt={cTitle(r)} />
                                        <div className="fz-scrib fz-hand">{L(r.k === "t" ? T.noteTreat : r.k === "b" ? T.noteBland : cMealOk(r) ? T.noteMeal : T.noteTopper)} — B.</div>
                                    </div>
                                </div>
                                <aside className="fz-side">
                                    <div className="fz-box">
                                        <div className="k">{L(cMealOk(r) ? T.forDogM : T.forDog)}</div>
                                        <div className="mini">
                                            {weightSlider("fz-kg4")}
                                            <span>{kgTxt} kg</span>
                                        </div>
                                        {dogLine}
                                        {feedSeg(cMealOk(r))}
                                        <div style={{ marginTop: 14 }} aria-live="polite">
                                            {cPortion(r)}
                                        </div>
                                        {cLight(r) && swapBox(String(r.id), kpgC(r))}
                                        {cookBox(cInfo, cFr, cFz)}
                                        {kitchenBtn(() => logMeal("c:" + cId(r), !r.kc || SUPP.has(r.id) ? 0 : kpgC(r) && r.kc.p !== "pc" ? (shareOf(cMealOk(r)) > 0.1 ? Math.max(10, Math.round(needDay(shareOf(cMealOk(r))) / kpgC(r) / 10) * 10) : Math.max(5, fl5(day10 / kpgC(r)))) : r.kc.p === "ml" ? (shareOf(cMealOk(r)) > 0.1 ? Math.max(10, Math.round(needDay(shareOf(cMealOk(r))) / (r.kc.k / r.kc.a) / 10) * 10) : Math.max(5, fl5(day10 / (r.kc.k / r.kc.a)))) : 1))}
                                        {r.kc && howBox(shareOf(cMealOk(r)), r.kc.p === "pc" || /\bbroth\b/i.test(r.t) || kpgC(r) < LIGHT_KCAL_ML ? 0 : kpgC(r), r.k === "t", kpgC(r) ? "100 g ≈ " + nf(Math.round(kpgC(r) * 100), lang) + " kcal · " + L(T.wholeR) + " ≈ " + nf(r.tk!, lang) + " kcal" : kcLine(r.kc), r.kc.s === "u" || !!kpgC(r), SUPP.has(r.id))}
                                    </div>
                                    {st.length > 0 && (
                                        <div className="fz-box">
                                            <div className="k">{L(T.keeps)}</div>
                                            <div style={{ marginTop: 8 }}>
                                                {st.map(([fz, t], i) => (
                                                    <div className="ln" key={i}>
                                                        <Ico d={fz ? I.snow : I.fridge} s={17} />
                                                        {t}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {r.al.length > 0 && (
                                        <div className="fz-box">
                                            <div className="k">{L(T.contains)}</div>
                                            <div className="fz-alc">
                                                {r.al.map((a) => (
                                                    <span key={a} className="fz-tag fz-tag--x">
                                                        {L(T.alc[a] || X(a, a))}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </aside>
                                <div className="bd">
                                    {lang === "hr" && (
                                        <p className="fz-hrnote">
                                            {L(origEn ? T.origNote : T.enNote)}{" "}
                                            <button type="button" className="fz-link fz-noprint" aria-pressed={origEn} onClick={() => setOrigEn(!origEn)}>
                                                {L(origEn ? T.showTr : T.showOrig)}
                                            </button>
                                        </p>
                                    )}
                                    <div className="fz-cols">
                                        <div>
                                            <div className="fz-colh">
                                                <div>
                                                    <h2 className="fz-h3">{L(T.ingH)}</h2>
                                                    <p className="fz-noprint">{L(T.tick)}</p>
                                                </div>
                                                {km > 1 && (
                                                    <div className="fz-bt">
                                                        <span className="fz-xk">{km}×</span>
                                                    </div>
                                                )}
                                            </div>
                                            <ul className="fz-ing" lang={enTxt ? "en" : "hr"}>
                                                {ings.map((s, i) => {
                                                    const k = "c" + r.id + "-" + i
                                                    return (
                                                        <li key={k}>
                                                            <label>
                                                                <input type="checkbox" checked={!!ticks[k]} onChange={() => setTicks({ ...ticks, [k]: !ticks[k] })} />
                                                                <span className="bx">
                                                                    <Ico d={I.check} s={14} w={3} />
                                                                </span>
                                                                <span className="t">
                                                                    <span>{scaleLine(s, km, enTxt ? "en" : "hr")}</span>
                                                                    {warnAt(i).map((k) => (
                                                                        <span key={k} className="nt nt--w" lang={lang}>
                                                                            ⚠ {L(T.warnC[k])}
                                                                        </span>
                                                                    ))}
                                                                </span>
                                                            </label>
                                                        </li>
                                                    )
                                                })}
                                            </ul>
                                        </div>
                                        <div>
                                            <h2 className="fz-h3">{L(T.method)}</h2>
                                            {km > 1 && <p className="fz-hint">{L(T.cookSteps)}</p>}
                                            <ol className="fz-steps" lang={enTxt ? "en" : "hr"}>
                                                {(enTxt ? r.p : r.ph).map((s, i) => (
                                                    <li key={i}>{s}</li>
                                                ))}
                                            </ol>
                                        </div>
                                    </div>
                                    <div className="fz-srcl">
                                        <span>{L(T.srcL)}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="fz-pn fz-noprint">
                                <button type="button" onClick={() => go({ p: "recipe", id: cId(prev) })}>
                                    <img src={cImg(prev, 256)} alt="" loading="lazy" />
                                    <span>
                                        <small>← {L(T.prev)}</small>
                                        <b>{cTitle(prev)}</b>
                                    </span>
                                </button>
                                <button type="button" className="nx" onClick={() => go({ p: "recipe", id: cId(next) })}>
                                    <span>
                                        <small>{L(T.next)} →</small>
                                        <b>{cTitle(next)}</b>
                                    </span>
                                    <img src={cImg(next, 256)} alt="" loading="lazy" />
                                </button>
                            </div>
                        </div>
                    </section>
                </div>
            )
        })()
    )

    /* ---------- meal builder ---------- */

    const dayLS = (d: number) => X(d + (d === 1 ? " day" : " days"), d + " " + plHr(d, ["dan", "dana", "dana"]))
    /* grains also rule out rice and oats */
    const bNo = (k: string) => noIng.includes(k) || (noIng.includes("zitarice") && (k === "riza" || k === "zob"))
    const selP = bp && !bNo(bp) ? bp : null
    const selC = bc && !bNo(bc) ? bc : null
    const selV = bv.filter((k) => !bNo(k))
    const bKeys = selP ? [selP, ...(selC ? [selC] : []), ...selV] : []
    const bShare = dog.age < 2 ? 0.1 : [1, 0.5, 0.1][feed]
    const bBudget = bShare > 0.1 ? Math.max(10, Math.round((kMid * bShare) / 10) * 10) : Math.max(5, fl5(day10))
    const bg = bKeys.length ? buildGrams(bKeys, bdays, bBudget) : null
    /* how the portion sits in the day, by the choice above */
    const bWith = bShare === 1 ? { en: "", hr: "" } : bShare === 0.5 ? { en: ", with half of the usual food", hr: ", uz pola uobičajene hrane" } : { en: ", on top of the usual food", hr: ", uz uobičajenu hranu" }
    const bTitle = (keys: string[]) => andList(keys.map((k, i) => (i === 0 ? L(ING[k].n) : L(ING[k].n).toLowerCase())), lang)
    const bOnList = lst.items.find((it) => it.t === "b" && it.keys.join() === bKeys.join() && it.days === bdays)
    const bSame = !!(bg && bOnList && bOnList.t === "b" && bOnList.g.join() === bg.g.join())
    const addB = () => {
        if (!bg) return
        const it: LItem = { id: bOnList ? bOnList.id : "b" + Date.now().toString(36), t: "b", keys: bKeys, days: bdays, g: bg.g }
        saveList({ items: bOnList ? lst.items.map((x) => (x.id === bOnList.id ? it : x)) : [...lst.items, it], done: lst.done })
    }
    const noBad = (m?: RMeta) => !!m && !noIng.some((k) => m.no.has(k))
    const simR = bKeys.length ? RECIPES.filter((r) => r.kind !== "treat" && bKeys.every((k) => RMETA[r.id].has.has(k)) && noBad(RMETA[r.id])) : []
    const simC = bKeys.length && catalog ? catalog.filter((r) => r.k !== "t" && bKeys.every((k) => !!cMeta.get(r.id)?.has.has(k)) && noBad(cMeta.get(r.id))) : []
    const simN = simR.length + simC.length
    const simShow = [...simR.map((r) => ({ id: r.id, img: r.img, t: L(r.t) })), ...simC.map((r) => ({ id: cId(r), img: cImg(r, 256), t: cTitle(r) }))].slice(0, 3)
    const seeSim = () => {
        setQ("")
        setHave(bKeys)
        setImode(0)
        setCat("meals")
        setPrep("")
        setQ30(false)
        setFew(false)
        setShopOk(false)
        go({ p: "recipes" })
    }
    const bStep = (n: number, h: LS, sub: LS | null, keys: string[], sel: (k: string) => boolean, pick: (k: string) => void) => (
        <div className="fz-bst">
            <div className="fz-bst-h">
                <span className="n">{n}</span>
                <h2 className="fz-h3">
                    {L(h)}
                    {sub && <small>{L(sub)}</small>}
                </h2>
            </div>
            <div className="fz-ig fz-ig--b">
                {keys.map((k) => {
                    const no = bNo(k)
                    return ingTile(k, sel(k) ? "have" : no ? "no" : "", () => pick(k), sel(k), no, no ? L(T.bNoTile) : undefined)
                })}
            </div>
        </div>
    )
    const blandRec = RECIPES.find((r) => r.id === "chicken-rice") || RECIPES[0]
    const bSum = bg ? bg.g.reduce((a, b) => a + b, 0) : 0
    /* "Other" opens a stepper for any number of days; a number that is not one of the quick choices keeps it open */
    const bOthOn = bOth || !B_DAYS.includes(bdays)
    /* a step keeps the stepper open, also when it lands on 1, 3 or 7 */
    const bStep1 = (d: number) => {
        setBOth(true)
        setBdays(Math.min(B_MAX, Math.max(1, bdays + d)))
    }
    /* up to 3 portions keep in the fridge, the rest is frozen */
    const bMixTxt = (d: number) =>
        d <= 1
            ? L(T.bMix[0])
            : d <= 3
              ? lang === "en"
                  ? `Mix everything and split it into ${d} portions. It keeps in the fridge for up to 3 days.`
                  : `Sve izmiješaj i podijeli na ${d} porcije. U hladnjaku stoji do 3 dana.`
              : d === 4
                ? lang === "en"
                    ? "Mix everything and split it into 4 portions. Keep 3 in the fridge and freeze the fourth. Thaw it in the fridge overnight."
                    : "Sve izmiješaj i podijeli na 4 porcije. Tri stavi u hladnjak, a četvrtu zamrzni. Odmrzni je preko noći u hladnjaku."
                : lang === "en"
                  ? `Mix everything and split it into ${d} portions. Keep 3 in the fridge and freeze the rest. Thaw each one in the fridge overnight.`
                  : `Sve izmiješaj i podijeli na ${d} ${plHr(d, ["porciju", "porcije", "porcija"])}. Tri stavi u hladnjak, a ostale zamrzni. Svaku odmrzni preko noći u hladnjaku.`
    const bPer = bg ? Math.round(bg.kcal) : 0
    const buildPage = (
        <div className="fz-page" key="build">
            <section className="fz-ph fz-ruled">
                <div className="fz-wrap">
                    <h1 className="fz-h1">{L(T.build)}</h1>
                    <p className="fz-lead">{L(T.bLead)}</p>
                </div>
            </section>
            <div className="fz-wrap">
                <div className="fz-bl">
                    <div>
                        {bStep(1, T.bS1, null, ["piletina", "puretina", "govedina", "riba", "jaja"], (k) => selP === k, (k) => setBp(k))}
                        {bStep(2, T.bS2, T.bOpt, ["riza", "zob", "batat", "krumpir"], (k) => selC === k, (k) => setBc(bc === k ? null : k))}
                        {bStep(3, T.bS3, T.bOpt2, ["mrkva", "tikvica", "spinat", "grasak", "bundeva"], (k) => selV.includes(k), (k) => setBv(selV.includes(k) ? selV.filter((x) => x !== k) : [...selV, k].slice(-2)))}
                        {bmode === 0 && simN > 0 && (
                            <div className="fz-sim">
                                <div className="fz-k">
                                    {lang === "en"
                                        ? `Already on the site: ${simN} ${simN === 1 ? "recipe" : "recipes"} with ${andList(bKeys.map((k) => ING[k].ins.en), lang)}`
                                        : `Već postoji: ${simN} ${plHr(simN, ["recept", "recepta", "recepata"])} ${sHr(andList(bKeys.map((k) => ING[k].ins.hr), lang))}`}
                                </div>
                                <div className="row">
                                    {simShow.map((s) => (
                                        <button key={s.id} type="button" className="rr" onClick={() => go({ p: "recipe", id: s.id })}>
                                            <img src={s.img} alt="" loading="lazy" decoding="async" />
                                            <span>{s.t}</span>
                                        </button>
                                    ))}
                                </div>
                                {simN > simShow.length && (
                                    <button type="button" className="fz-link" onClick={seeSim}>
                                        {L(T.bSimAll)} ({simN}) <Ico d={I.right} s={15} w={2.4} />
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                    <aside className="fz-box fz-res">
                        <div className="k">{L(T.forDog)}</div>
                        <div className="mini">
                            {weightSlider("fz-kg5")}
                            <span>{kgTxt} kg</span>
                        </div>
                        {dogLine}
                        <div className="fz-res-o">{seg(T.bModes, bmode, setBmode, T.bModeL)}</div>
                        {bmode === 0 && (
                            <div className="fz-feed">
                                <span>{L(T.feedL)}</span>
                                {seg(T.feedO, dog.age < 2 ? 2 : feed, (i) => setFeed(i), T.feedL)}
                            </div>
                        )}
                        {bmode === 1 ? (
                            <>
                                <p className="fz-res-p">{L(T.bBland)}</p>
                                <p className="t">{L(T.bland)}</p>
                                <button type="button" className="fz-bland" onClick={() => go({ p: "recipe", id: blandRec.id })}>
                                    <img src={blandRec.img} alt="" loading="lazy" style={{ objectPosition: blandRec.pos || "50% 50%" }} />
                                    <span>
                                        <b>{L(blandRec.t)}</b>
                                        <span className="go">{L(T.bBlandR)} →</span>
                                    </span>
                                </button>
                            </>
                        ) : !bg ? (
                            <p className="fz-res-p">{L(T.bPickP)}</p>
                        ) : (
                            <>
                                <div className="fz-res-o">
                                    <span className="lb">{L(T.bDaysL)}</span>
                                    {seg(
                                        T.bDayOpts,
                                        bOthOn ? 3 : B_DAYS.indexOf(bdays),
                                        (i) => {
                                            if (i < 3) setBdays(B_DAYS[i])
                                            setBOth(i === 3)
                                        },
                                        T.bDaysL
                                    )}
                                </div>
                                {bOthOn && (
                                    <div className="fz-dstep" role="group" aria-label={L(T.bDaysN)}>
                                        <button type="button" className="fz-step" aria-label={L(T.less)} disabled={bdays <= 1} onClick={() => bStep1(-1)}>
                                            −
                                        </button>
                                        <output className="v" aria-live="polite">
                                            {L(dayLS(bdays))}
                                        </output>
                                        <button type="button" className="fz-step" aria-label={L(T.more)} disabled={bdays >= B_MAX} onClick={() => bStep1(1)}>
                                            +
                                        </button>
                                    </div>
                                )}
                                <div className="k rawh">{L(T.bRaw)}</div>
                                <table className="fz-tb">
                                    <tbody>
                                        {bg.items.map((b, i) => (
                                            <tr key={b.k}>
                                                <td>
                                                    <span className="nm">
                                                        <Em n={ING[b.k].em} />
                                                        {L(b.n)}
                                                    </span>
                                                </td>
                                                <td className="g">{nf(bg.g[i], lang)} g</td>
                                            </tr>
                                        ))}
                                        <tr className="sum">
                                            <td>
                                                <span className="nm">{L(T.bTotal) + (bdays > 1 ? (lang === "en" ? " for " : " za ") + L(dayLS(bdays)) : "")}</span>
                                            </td>
                                            <td className="g">{nf(bSum, lang)} g</td>
                                        </tr>
                                    </tbody>
                                </table>
                                <p className="fz-res-p" aria-live="polite">
                                    {bdays === 1
                                        ? lang === "en"
                                            ? `One portion for one day${bWith.en}: about ${bPer} kcal.`
                                            : `Jedna porcija za jedan dan${bWith.hr}: oko ${bPer} kcal.`
                                        : lang === "en"
                                          ? `Split it into ${bdays} equal portions, one a day${bWith.en}: about ${bPer} kcal each.`
                                          : `Podijeli na ${bdays} ${plHr(bdays, ["jednaku porciju", "jednake porcije", "jednakih porcija"])}, jednu dnevno${bWith.hr}: svaka ima oko ${bPer} kcal.`}
                                </p>
                                <p className="fine">
                                    {bShare > 0.1 ? (lang === "en" ? (bShare === 1 ? "All of the day's food: about" : "Half of the day's food: about") : bShare === 1 ? "Sva dnevna hrana: oko" : "Pola dnevne hrane: oko") : L(T.budget)} {nf(bBudget, lang)} kcal {L(T.aDay)}. {L(T.bKcal)} (USDA, SR28): {bg.items.map((b) => L(ING[b.k].n).toLowerCase() + " " + b.kc + " kcal").join(", ")}. {L(T.bWhy)}
                                </p>
                                <div className="fz-how2">
                                    <div className="k">{L(T.bHow)}</div>
                                    <ol>
                                        {bg.items.map((b) => (
                                            <li key={b.k}>
                                                <span>{L(b.cook)}</span>
                                            </li>
                                        ))}
                                        <li>
                                            <span>{bMixTxt(bdays)}</span>
                                        </li>
                                    </ol>
                                </div>
                                {dog.age < 2 && <p className="fz-hint fz-hint--w">{L(T.puppy)}</p>}
                                <div className="fz-btns">
                                    <button type="button" className={"fz-btn " + (bSame ? "fz-btn--g" : "fz-btn--p")} onClick={() => (bSame ? go({ p: "list" }) : addB())}>
                                        <Ico d={bSame ? I.check : I.cart} s={18} />
                                        {L(bSame ? T.onList : T.addList)}
                                    </button>
                                    {kitchenBtn(() => logBuilt(bTitle(bKeys), bg.kcal), true)}
                                </div>
                                <div className="fz-warnb">
                                    <Ico d={I.warn} s={20} />
                                    <span>{L(T.bWarn)}</span>
                                </div>
                            </>
                        )}
                    </aside>
                </div>
            </div>
        </div>
    )

    /* ---------- shopping list ---------- */

    type LLine = { id: string; sec: "m" | "v" | "d" | "p" | "s"; em: string | null; t: string; sub?: string; q?: string }
    const lLines: LLine[] = []
    const lSum: Record<string, number> = {}
    let lWait = false
    lst.items.forEach((it) => {
        if (it.t === "b") it.keys.forEach((k, i) => (lSum[k] = (lSum[k] || 0) + (it.g[i] || 0)))
    })
    BUILD.forEach((b) => {
        if (lSum[b.k]) lLines.push({ id: "b:" + b.k, sec: b.sec, em: ING[b.k].em, t: L(b.n), sub: b.note ? L(b.note) : undefined, q: buyAmount(b, lSum[b.k], lang) })
    })
    const lRec = (rid: string) => {
        const cur = RECIPES.find((r) => r.id === rid)
        if (cur) return { t: L(cur.t), img: cur.img, pos: cur.pos }
        const c = catalog ? catalog.find((r) => cId(r) === rid) : undefined
        return c ? { t: cTitle(c), img: cImg(c, 256), pos: undefined } : null
    }
    lst.items.forEach((it) => {
        if (it.t !== "r") return
        const m = it.m || 1
        const cur = RECIPES.find((r) => r.id === it.rid)
        if (cur) {
            cur.ing.forEach((ing, i) => {
                const en = plain(ing.n.en)
                const sec = lineSec(en)
                if (sec) lLines.push({ id: "r:" + it.rid + ":" + i, sec, em: iconOf(en), t: (ing.q != null ? qty(ing, m, lang) + " " : "") + ingText(ing, m, lang) + (ing.opt ? " (" + L(T.optional) + ")" : ""), sub: L(cur.t) })
            })
            return
        }
        const c = catalog ? catalog.find((r) => cId(r) === it.rid) : undefined
        if (!c) {
            if (!catalog) lWait = true
            return
        }
        c.i.forEach((en, i) => {
            const sec = lineSec(en)
            const enL = lang === "en" || !c.ih[i]
            if (sec) lLines.push({ id: "r:" + it.rid + ":" + i, sec, em: iconOf(en), t: scaleLine(enL ? en : c.ih[i], m, enL ? "en" : "hr"), sub: cTitle(c) })
        })
    })
    const tick = (id: string) => saveList({ items: lst.items, done: { ...lst.done, [id]: !lst.done[id] } })
    const removeItem = (id: string) => saveList({ items: lst.items.filter((x) => x.id !== id), done: lst.done })
    const editB = (it: LItem) => {
        if (it.t !== "b") return
        setBp(it.keys[0])
        setBc(it.keys.find((k) => BI[k] && BI[k].g === 1) || null)
        setBv(it.keys.filter((k) => BI[k] && BI[k].g === 2))
        setBdays(it.days)
        setBOth(false)
        setBmode(0)
        go({ p: "build" })
    }
    const listText = () => {
        const out: string[] = [L(T.list) + " · Freshy's"]
        L_SECS.forEach((s) => {
            const ls = lLines.filter((x) => x.sec === s && !lst.done[x.id])
            if (!ls.length) return
            out.push("", L(T.lSecs[s]) + " (" + L(T.lWhere[s]) + ")")
            ls.forEach((x) => out.push("• " + x.t + (x.q ? ": " + x.q : "")))
        })
        return out.join("\n")
    }
    const copyText = (s: string) => {
        const ok = () => {
            setCopied(true)
            window.setTimeout(() => setCopied(false), 2200)
        }
        const old = () => {
            try {
                const ta = document.createElement("textarea")
                ta.value = s
                ta.setAttribute("readonly", "")
                ta.style.position = "fixed"
                ta.style.opacity = "0"
                document.body.appendChild(ta)
                ta.select()
                const r = document.execCommand("copy")
                document.body.removeChild(ta)
                if (r) ok()
            } catch (e) {}
        }
        try {
            if (navigator.clipboard && window.isSecureContext) {
                navigator.clipboard.writeText(s).then(ok, old)
                return
            }
        } catch (e) {}
        old()
    }
    const shareList = () => {
        const s = listText()
        const nv: any = typeof navigator !== "undefined" ? navigator : null
        if (nv && typeof nv.share === "function") {
            nv.share({ title: L(T.list), text: s }).catch(() => {})
            return
        }
        copyText(s)
    }
    const clearList = () => {
        if (!clr) {
            setClr(true)
            window.setTimeout(() => setClr(false), 4000)
            return
        }
        setClr(false)
        saveList({ items: [], done: {} })
    }

    /* ---------- plan for the week: the dog, one whole-day dish, its shopping list and one cooking session for 7 days ---------- */
    const planIds = WPLAN_POOL.filter(dayOk).slice(0, 5)
    const planOn = !pup && feed < 2
    const planSel = planOn && planId && planIds.includes(planId) ? planId : null
    const planR = planSel && catalog ? catalog.find((r) => r.id === planSel) : undefined
    const planInfo = planR ? cCook(planR) : null
    const planSt: [string, string] = planR ? cStore(planR) : ["", ""]
    const planP = planR ? cookPlan(planInfo, planSt[0], planSt[1], WPLAN_DAYS) : null
    const planTx = planInfo && planP ? cookTx(planInfo, planP, planSt[0], planSt[1]) : null
    const planRid = planR ? cId(planR) : ""
    const planLs = planP ? listSt(planRid, planP.mult) : "add"
    const planPick = (id: number) => {
        const d = DAYC[id]
        const kpg = kpgOf(d[3], d[4])
        const sh = shareOf(true)
        return (
            <button key={id} type="button" role="radio" aria-checked={planSel === id} className="fz-dayr fz-ppk" onClick={() => setPlanId(id)}>
                <img src={cImg({ img: d[2] }, 256)} alt="" loading="lazy" decoding="async" />
                <span>
                    <b>{lang === "hr" ? d[1] : d[0]}</b>
                    <small>
                        {dayGTxt(kpg, sh)} · {daysShort(d[4] / dayG(kpg, sh))}
                    </small>
                </span>
                <i aria-hidden="true" />
            </button>
        )
    }
    const planShop = (r: CRec, m: number) =>
        L_SECS.map((sc) => {
            const ls = r.i.map((en, i) => ({ en, i })).filter((x) => lineSec(x.en) === sc)
            if (!ls.length) return null
            return (
                <div className="fz-grp" key={sc}>
                    <div className="fz-grp-h">
                        <span className="fz-k">{L(T.lSecs[sc])}</span>
                        <span className="w">
                            {L(T.lWhereL)} <b>{L(T.lWhere[sc])}</b>
                        </span>
                    </div>
                    <ul className="fz-pl">
                        {ls.map((x) => {
                            const enL = lang === "en" || !r.ih[x.i]
                            const em = iconOf(x.en)
                            const ws = r.w ? Object.keys(r.w).filter((k) => r.w![k].includes(x.i)) : []
                            return (
                                <li key={x.i}>
                                    {em ? <Em n={em} /> : <span className="dot" aria-hidden="true" />}
                                    <span lang={enL ? "en" : "hr"}>
                                        {scaleLine(enL ? x.en : r.ih[x.i], m, enL ? "en" : "hr")}
                                        {ws.map((k) => (
                                            <span key={k} className="nt nt--w" lang={lang}>
                                                ⚠ {L(T.warnC[k])}
                                            </span>
                                        ))}
                                    </span>
                                </li>
                            )
                        })}
                    </ul>
                </div>
            )
        })
    const planPage = (
        <div className="fz-page" key="plan">
            <section className="fz-ph fz-ruled">
                <div className="fz-wrap">
                    <h1 className="fz-h1">{L(T.planH)}</h1>
                    <p className="fz-lead">{L(T.planLead)}</p>
                </div>
            </section>
            <div className="fz-wrap">
                <div className="fz-wk">
                    <section className="fz-pstep" aria-labelledby="fz-ps1">
                        <h2 id="fz-ps1">
                            <span className="n">1</span>
                            {L(T.planS1)}
                        </h2>
                        {pfBan}
                        {kgBox("fz-kg9")}
                        {dogLine}
                        {pup ? (
                            <p className="fz-hint fz-hint--w">
                                {L(T.planPup)} {L(T.puppy)}
                            </p>
                        ) : (
                            <>
                                <div className="fz-gap2" />
                                <span className="fz-lbl">{L(T.feedL)}</span>
                                {feed === 2 && <p className="fz-hint fz-wk-q">{L(T.planFeedQ)}</p>}
                                {feedR(2)}
                            </>
                        )}
                    </section>
                    {planOn && (
                        <section className="fz-pstep" aria-labelledby="fz-ps2">
                            <h2 id="fz-ps2">
                                <span className="n">2</span>
                                {L(T.planS2)}
                            </h2>
                            <div className="fz-ppick" role="radiogroup" aria-labelledby="fz-ps2">
                                {planIds.map((id) => planPick(id))}
                            </div>
                            {shareOf(true) < 1 && <p className="fz-wk-p fz-wk-half">{L(T.halfRest)}</p>}
                            <p className="fz-mnote">
                                {L(T.planVet)} (
                                <a className="fz-link" href={HOME_URL} target="_blank" rel="noopener noreferrer">
                                    {L(T.mealWhy)}
                                </a>
                                )
                            </p>
                            <button
                                type="button"
                                className="fz-link fz-dall"
                                onClick={() => {
                                    setCat("daily")
                                    go({ p: "recipes" })
                                }}
                            >
                                {L(T.dayAll)} <Ico d={I.right} s={15} w={2.4} />
                            </button>
                        </section>
                    )}
                    {planOn && !planSel && <p className="fz-hint fz-wk-hint">{L(T.planPick)}</p>}
                    {planSel && !planR && (
                        <section className="fz-pstep">
                            <p className="fz-wk-p">{catErr ? L(T.catErr) : L(T.loadingR)}</p>
                            {catErr && (
                                <button type="button" className="fz-btn fz-btn--g fz-btn--sm" onClick={() => setCatTry(catTry + 1)}>
                                    {L(T.retry)}
                                </button>
                            )}
                        </section>
                    )}
                    {planR && planP && planTx && (
                        <>
                            <section className="fz-pstep" aria-labelledby="fz-ps3">
                                <h2 id="fz-ps3">
                                    <span className="n">3</span>
                                    {L(T.planS3)}
                                </h2>
                                <p className="fz-wk-p">
                                    <b>{planTx.head}</b>
                                    {planP.mult > 1 ? L(T.planMult) : ""}
                                </p>
                                {planShop(planR, planP.mult)}
                                <div className="fz-btns">
                                    <button type="button" className={"fz-btn " + (planLs === "on" ? "fz-btn--g" : "fz-btn--p")} onClick={() => (planLs === "on" ? go({ p: "list" }) : addR(planRid, planP.mult))}>
                                        <Ico d={planLs === "on" ? I.check : I.cart} s={18} w={planLs === "on" ? 2.6 : 2} />
                                        {L(planLs === "on" ? T.planOpenL : planLs === "upd" ? T.updList : T.addList)}
                                    </button>
                                </div>
                            </section>
                            <section className="fz-pstep" aria-labelledby="fz-ps4">
                                <h2 id="fz-ps4">
                                    <span className="n">4</span>
                                    {L(T.planS4)}
                                </h2>
                                <p className="fz-wk-p">
                                    <b>{L(T.planWhen)}</b>
                                </p>
                                <p className="fz-wk-p">{planTx.got}</p>
                                <p className="fz-wk-p">{planTx.keep}</p>
                                {planTx.weigh && <p className="fz-wk-p">{planTx.weigh}</p>}
                                {planTx.tail && <p className={"fz-wk-p" + (planTx.tailW ? " w" : "")}>{planTx.tail}</p>}
                                <div className="fz-btns">
                                    <button
                                        type="button"
                                        className="fz-btn fz-btn--g"
                                        onClick={() => {
                                            setCook(WPLAN_DAYS)
                                            go({ p: "recipe", id: planRid })
                                        }}
                                    >
                                        {L(T.planOpen)}
                                    </button>
                                </div>
                            </section>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
    const listPage = (
        <div className="fz-page" key="list">
            <section className="fz-ph fz-ruled">
                <div className="fz-wrap">
                    <h1 className="fz-h1">{L(T.list)}</h1>
                    <p className="fz-lead">{L(T.lLead)}</p>
                </div>
            </section>
            <div className="fz-wrap">
                <div className="fz-shl">
                    <div className="fz-sl">
                        {lst.items.length === 0 ? (
                            <div className="fz-lempty">
                                <h2 className="fz-h3">{L(T.lEmpty)}</h2>
                                <p>{L(T.lEmptyP)}</p>
                                <div className="fz-btns">
                                    <button type="button" className="fz-btn fz-btn--p fz-btn--sm" onClick={() => go({ p: "build" })}>
                                        {L(T.build)}
                                    </button>
                                    <button type="button" className="fz-btn fz-btn--g fz-btn--sm" onClick={() => go({ p: "recipes" })}>
                                        {L(T.cookB)}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="fz-lfor">
                                    <div className="fz-k">{L(T.lFor)}</div>
                                    <ul>
                                        {lst.items.map((it) => {
                                            if (it.t === "b") {
                                                const nm = bTitle(it.keys)
                                                return (
                                                    <li key={it.id}>
                                                        <span className="ic">
                                                            <Em n={ING[it.keys[0]].em} />
                                                        </span>
                                                        <span className="tt">
                                                            {nm}
                                                            <small>
                                                                {L(T.build)} · {L(dayLS(it.days))}
                                                            </small>
                                                        </span>
                                                        <button type="button" className="fz-link ch" onClick={() => editB(it)}>
                                                            {L(T.lChange)}
                                                        </button>
                                                        <button type="button" className="x" aria-label={L(T.lRemove) + ": " + nm} onClick={() => removeItem(it.id)}>
                                                            <Ico d={I.x} s={16} w={2.4} />
                                                        </button>
                                                    </li>
                                                )
                                            }
                                            const r = lRec(it.rid)
                                            const nm = r ? r.t : catalog ? L(T.notFound) : L(T.loadingR)
                                            return (
                                                <li key={it.id}>
                                                    {r ? <img src={r.img} alt="" loading="lazy" style={{ objectPosition: r.pos || "50% 50%" }} /> : <span className="ic" />}
                                                    <span className="tt">
                                                        {r ? (
                                                            <button type="button" onClick={() => go({ p: "recipe", id: it.rid })}>
                                                                {nm}
                                                            </button>
                                                        ) : (
                                                            nm
                                                        )}
                                                        <small>{(it.m || 1) > 1 ? (lang === "en" ? it.m + " times the recipe" : it.m + " puta veći recept") : L(T.lRecipe)}</small>
                                                    </span>
                                                    <button type="button" className="x" aria-label={L(T.lRemove) + ": " + nm} onClick={() => removeItem(it.id)}>
                                                        <Ico d={I.x} s={16} w={2.4} />
                                                    </button>
                                                </li>
                                            )
                                        })}
                                    </ul>
                                </div>
                                {L_SECS.map((s) => {
                                    const ls = lLines.filter((x) => x.sec === s)
                                    if (!ls.length) return null
                                    return (
                                        <div className="fz-grp" key={s}>
                                            <div className="fz-grp-h">
                                                <span className="fz-k">{L(T.lSecs[s])}</span>
                                                <span className="w">
                                                    {L(T.lWhereL)} <b>{L(T.lWhere[s])}</b>
                                                </span>
                                            </div>
                                            {ls.map((x) => (
                                                <button key={x.id} type="button" role="checkbox" aria-checked={!!lst.done[x.id]} className="fz-li" onClick={() => tick(x.id)}>
                                                    <span className="bx">
                                                        <Ico d={I.check} s={14} w={3} />
                                                    </span>
                                                    {x.em ? <Em n={x.em} /> : <span className="dot" aria-hidden="true" />}
                                                    <span className="t">
                                                        <span>{x.t}</span>
                                                        {x.sub && <small>{x.sub}</small>}
                                                    </span>
                                                    {x.q && <span className="q">{x.q}</span>}
                                                </button>
                                            ))}
                                        </div>
                                    )
                                })}
                                {lWait && <p className="fz-lwait">{catErr ? L(T.catErr) : L(T.loadingR)}</p>}
                                <div className="fz-lbtns fz-noprint">
                                    <button type="button" className="fz-btn fz-btn--p fz-btn--sm" onClick={shareList}>
                                        <Ico d={I.share} s={18} />
                                        {L(T.lShare)}
                                    </button>
                                    <button type="button" className="fz-btn fz-btn--g fz-btn--sm" onClick={() => copyText(listText())}>
                                        <Ico d={copied ? I.check : I.copy} s={18} />
                                        {L(copied ? T.lCopied : T.lCopy)}
                                    </button>
                                    <button type="button" className="fz-btn fz-btn--g fz-btn--sm" onClick={() => typeof window !== "undefined" && window.print()}>
                                        <Ico d={I.print} s={18} />
                                        {L(T.print)}
                                    </button>
                                    <button type="button" className="fz-btn fz-btn--x fz-btn--sm" onClick={clearList}>
                                        <Ico d={I.trash} s={18} />
                                        {L(clr ? T.lClear2 : T.lClear)}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                    <aside className="fz-lside fz-noprint">
                        {SHOP && (
                            <div className="fz-gc">
                                <h2 className="fz-h3">{L(T.lReadyH)}</h2>
                                <p>{L(T.lReadyP)}</p>
                                <button type="button" className="fz-btn fz-btn--w fz-btn--sm" onClick={() => orderPouch()}>
                                    {L(T.readyT)}
                                </button>
                                <img src={ART.bis1} alt="" />
                            </div>
                        )}
                        <div className="fz-box fz-wb">
                            <div className="k">{L(T.lWhereH)}</div>
                            <ul>
                                {T.lWhereList.map(([a, b], i) => (
                                    <li key={i}>
                                        <Em n={["shopping-cart", "carrot", "jar"][i]} />
                                        <span>
                                            <b>{L(a)}</b> {L(b)}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                            <p className="fine">{L(T.lWhereFine)}</p>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    )

    /* ---------- order ---------- */

    const avail = POUCHES.filter((p) => !p.al.some((a) => dog.no.includes(a)))
    const chosen = avail.filter((p) => ord.sel[p.id])
    const planDays = PLAN_DAYS[ord.plan]
    const perDay = (fullG / 100) * PLAN_RATE[ord.plan]
    const total = Math.round(perDay * planDays * 100) / 100
    const pouchG = Math.round(fullG / 2 / 5) * 5
    const zipOk = /^\d{5}$/.test(ord.zip.trim())
    const addrOk = ord.street.trim().length > 2 && ord.city.trim().length > 1
    const ready = chosen.length > 0 && addrOk && zipOk && ord.day >= 0 && !!days
    const missing = [!chosen.length && L(T.needRec), !addrOk && L(T.needAddr), addrOk && !zipOk && L(T.needZip), ord.day < 0 && L(T.needDay)].filter(Boolean) as string[]
    const dayTxt = days && ord.day >= 0 ? dayParts(days[ord.day], lang).join(" ") : "—"
    const setO = (patch: Partial<Ord>) => setOrd((o) => ({ ...o, ...patch }))
    const stepState = (n: number) => (ord.done ? "done" : ord.step === n ? "on" : ord.step > n ? "done" : "lock")
    const sums = [
        [dog.name.trim() || null, kgTxt + " kg", L(T.ages[dog.age]).toLowerCase(), dog.age === 2 ? L(T.neutS[dog.neut ? 0 : 1]) : null, dog.age === 2 ? L(T.acts[dog.act]).toLowerCase() : null].filter(Boolean).join(" · ") + (dog.no.length ? " · " + L(T.noPre) + " " + dog.no.map((a) => L(T.noGen[a])).join(", ") : ""),
        `${fullG} ${L(T.gDay)} · ${chosen.length} ${pl(lang, chosen.length, ["recipe", "recipes"], ["recept", "recepta", "recepata"])}`,
        L(T.plans[ord.plan][0]) + " · " + planDays + " " + L(T.days),
        (ord.street.trim() ? ord.street.trim() + ", " + ord.city.trim() : "") + (dayTxt !== "—" ? " · " + dayTxt : ""),
    ]
    const stepCard = (n: number, body: React.ReactNode, extra?: React.ReactNode) => {
        const st = stepState(n)
        return (
            <div className={"fz-st " + st} key={n}>
                <div className="fz-sth">
                    <span className="n">{st === "done" ? <Ico d={I.check} s={16} w={3} /> : n}</span>
                    <h2>{n === 2 && dog.name.trim() ? (lang === "en" ? `${dog.name.trim()}'s plan` : `Plan za psa ${dog.name.trim()}`) : L(T.steps[n - 1])}</h2>
                    {st === "done" && !ord.done && (
                        <div className="sum">
                            <span>{sums[n - 1]}</span>
                            <button type="button" onClick={() => setO({ step: n })}>
                                {L(T.edit)}
                            </button>
                        </div>
                    )}
                </div>
                {st === "on" && <div className="fz-stb">{body}</div>}
                {extra}
            </div>
        )
    }
    const contBtn = (n: number, ok = true) => (
        <div className="fz-next">
            <button type="button" className="fz-btn fz-btn--p" disabled={!ok} onClick={() => setO({ step: n + 1 })}>
                {L(T.cont)} <Ico d={I.right} s={16} w={2.4} />
            </button>
        </div>
    )
    const scrollRec = () => recRef.current && recRef.current.scrollIntoView({ behavior: "smooth", block: "start" })
    const receipt = (
        <aside className="fz-rec" ref={recRef as any} aria-live="polite">
            <i className="fz-tape" style={{ width: 130, left: "calc(50% - 65px)", top: -16, transform: "rotate(-3deg)" }} />
            {ord.done ? (
                <div className="ty">
                    <div className="pw">
                        <Paw s={64} />
                    </div>
                    <h3 className="fz-hand">{L(T.thanks)}</h3>
                    <p>
                        {lang === "en"
                            ? `This is a prototype, so nothing was ordered. In the real shop, ${dog.name.trim() || "your dog"}'s first box would arrive on ${dayTxt}.`
                            : `Ovo je prototip, pa ništa nije naručeno. U pravoj trgovini prvi paket bi stigao ${days && ord.day >= 0 ? dayParts(days[ord.day], "hr")[1] + "." : ""}`}
                    </p>
                    <button
                        type="button"
                        className="fz-btn fz-btn--g"
                        onClick={() => {
                            setOrd(ORD0)
                            go({ p: "order" })
                        }}
                    >
                        {L(T.again)}
                    </button>
                </div>
            ) : (
                <>
                    <span className="stamp">
                        <Paw s={52} />
                    </span>
                    {dog.name.trim() ? (
                        <>
                            <div className="for">{L(T.boxFor)}</div>
                            <h3 className="fz-hand">{dog.name.trim()}</h3>
                        </>
                    ) : (
                        <h3 className="fz-hand anon">{L(T.boxAnon)}</h3>
                    )}
                    <div className="ln">
                        <span>{L(T.rRecipes)}</span>
                        <b className={chosen.length ? "" : "mut"}>{chosen.length ? chosen.map((p) => L(p.n)).join(", ") : "—"}</b>
                    </div>
                    <div className="ln">
                        <span>{L(T.rDaily)}</span>
                        <b>
                            <Num v={fullG} lang={lang} /> g
                        </b>
                    </div>
                    <div className="ln">
                        <span>{L(T.rBox)}</span>
                        <b>
                            {planDays} {L(T.days)}
                        </b>
                    </div>
                    <div className="ln">
                        <span>{L(T.rFood)}</span>
                        <b>{nf((fullG * planDays) / 1000, lang, 1)} kg</b>
                    </div>
                    <div className="ln">
                        <span>{L(T.rPouches)}</span>
                        <b>
                            {planDays * 2} × {pouchG} g
                        </b>
                    </div>
                    <div className="ln">
                        <span>{L(T.rDelivery)}</span>
                        <b className={dayTxt === "—" ? "mut" : ""}>{dayTxt}</b>
                    </div>
                    <div className="tot">
                        <span>{L(T.total)}</span>
                        <b>{eur(total, lang)}</b>
                    </div>
                    <div className="ex">
                        {eur(perDay, lang)} {L(T.aDay)} · {L(T.examples)}
                    </div>
                    <button type="button" className="fz-btn fz-btn--p" disabled={!ready} onClick={() => setO({ done: true })}>
                        {L(T.orderBtn)}
                    </button>
                    {!ready && (
                        <div className="need">
                            {L(T.need)}: {missing.join(", ")}
                        </div>
                    )}
                    <div className="proto">{L(T.protoNo)}</div>
                </>
            )}
        </aside>
    )
    const soonPage = (
        <div className="fz-page" key="soon">
            <section className="fz-oh fz-ruled fz-soon">
                <div className="fz-wrap">
                    <div>
                        <div className="fz-eb">{L(T.soonEb)}</div>
                        <h1 className="fz-h1">{L(T.soonH)}</h1>
                        <p className="fz-lead">{L(T.soonP)}</p>
                        <p className="fz-lead">{L(T.soonP2)}</p>
                        <div className="fz-ctas">
                            <button type="button" className="fz-btn fz-btn--p" onClick={() => go({ p: "recipes" })}>
                                {L(T.cta2)}
                            </button>
                            <button type="button" className="fz-btn fz-btn--g" onClick={() => goSec("calc")}>
                                {L(T.ctaCalc)}
                            </button>
                        </div>
                    </div>
                    <div className="fz-soon__art" aria-hidden="true">
                        <i className="fz-tape" style={{ width: 120, left: "calc(50% - 60px)", top: -10, transform: "rotate(-5deg)" }} />
                        <PouchArt p={POUCHES[0]} lang={lang} size={fullG / 2 + " g · " + L(ageW)} w={190} uid="soon" />
                        <span className="fz-soonpill fz-soonpill--o">{L(T.soonPill)}</span>
                    </div>
                </div>
            </section>
        </div>
    )
    const orderPage = (
        <div className="fz-page" key="order">
            <section className="fz-oh fz-ruled">
                <div className="fz-wrap">
                    <h1 className="fz-h1">{L(T.oH)}</h1>
                    <p className="fz-lead">{L(T.oSub)}</p>
                    <div className="fz-stepper" aria-hidden="true">
                        {T.steps.map((s, i) => (
                            <span key={i} className={stepState(i + 1)}>
                                <i>{stepState(i + 1) === "done" ? "✓" : i + 1}</i>
                                {L(s)}
                            </span>
                        ))}
                    </div>
                </div>
            </section>
            <div className="fz-wrap fz-og">
                <div>
                    {stepCard(
                        1,
                        <>
                            <div className="fz-row">
                                <div>
                                    <label className="fz-lbl" htmlFor="fz-name">
                                        {L(T.dogName)}
                                    </label>
                                    <input id="fz-name" className="fz-inp" value={dog.name} maxLength={18} placeholder={L(T.namePh)} autoComplete="off" onChange={(e) => setDog({ ...dog, name: e.target.value })} />
                                    <div className="fz-gap" />
                                    <span className="fz-lbl">{L(T.age)}</span>
                                    {seg(T.ages, dog.age, setAge, T.age)}
                                    {dog.age < 2 && <p className="fz-hint fz-hint--w">{L(T.puppy)}</p>}
                                    {dog.age === 2 && (
                                        <>
                                            <div className="fz-gap" />
                                            <span className="fz-lbl">{L(T.neut)}</span>
                                            {seg(T.yesNo, dog.neut ? 0 : 1, (i) => setDog({ ...dog, neut: i === 0 }), T.neut)}
                                        </>
                                    )}
                                </div>
                                <div>
                                    <label className="fz-lbl" htmlFor="fz-kg3">
                                        {L(T.weight)}
                                    </label>
                                    <div className="fz-kg2">
                                        {kgTxt}
                                        <small>kg</small>
                                    </div>
                                    {weightSlider("fz-kg3")}
                                    {dog.age === 2 && (
                                        <>
                                            <div className="fz-gap" />
                                            <span className="fz-lbl">{L(T.active)}</span>
                                            {seg(T.acts, dog.act, (i) => setDog({ ...dog, act: i }), T.active)}
                                        </>
                                    )}
                                </div>
                            </div>
                            <div className="fz-gap" />
                            <span className="fz-lbl">{L(T.cant)}</span>
                            <div className="fz-chips2" role="group" aria-label={L(T.cant)}>
                                {T.ocal.map(([id, t]) => {
                                    const on = dog.no.includes(id)
                                    return (
                                        <button key={id} type="button" className="fz-chip" aria-pressed={on} onClick={() => setDog({ ...dog, no: on ? dog.no.filter((x) => x !== id) : [...dog.no, id] })}>
                                            {L(t)}
                                        </button>
                                    )
                                })}
                            </div>
                            {dog.no.includes("chicken") && <p className="fz-hint">{L(T.noChicken)}</p>}
                            {contBtn(1)}
                        </>,
                        stepState(1) === "on" ? (
                            <div className="fz-note fz-hand">
                                {L(T.heavier)}
                                <small>— B.</small>
                            </div>
                        ) : null
                    )}
                    {stepCard(
                        2,
                        <>
                            <div className="fz-bigd">
                                <div>
                                    <div className="big">
                                        <Num v={fullG} lang={lang} />
                                        <small>{L(T.gDay)}</small>
                                    </div>
                                    <p className="fz-hint">
                                        {L(T.meals2)} {pouchG} g. {L(T.est)}
                                    </p>
                                </div>
                            </div>
                            <div className="fz-pouches">
                                {POUCHES.map((p) => {
                                    const ok = avail.includes(p)
                                    const on = ok && !!ord.sel[p.id]
                                    return (
                                        <button key={p.id} type="button" className="fz-po" disabled={!ok} aria-pressed={on} onClick={() => setO({ sel: { ...ord.sel, [p.id]: !ord.sel[p.id] } })}>
                                            <PouchArt p={p} lang={lang} size={pouchG + " g · " + L(ageW)} w={96} uid={"po" + p.id} />
                                            <span className="nm">{L(p.n)}</span>
                                            <span className="st">{!ok ? L(T.notFor) : on ? "✓ " + L(T.inBox) : L(T.notChosen)}</span>
                                        </button>
                                    )
                                })}
                            </div>
                            {!avail.length ? <p className="fz-hint fz-hint--w">{L(T.noneFit)}</p> : !chosen.length ? <p className="fz-hint fz-hint--w">{L(T.pickOne)}</p> : null}
                            {contBtn(2, chosen.length > 0)}
                        </>,
                        stepState(2) === "on" && avail.length < POUCHES.length ? (
                            <div className="fz-scrib fz-hand">
                                {L(T.noted)} <HandArrow w={36} down />
                            </div>
                        ) : null
                    )}
                    {stepCard(
                        3,
                        <>
                            <div className="fz-plans" role="group" aria-label={L(T.steps[2])}>
                                {T.plans.map(([t, d], i) => (
                                    <button key={i} type="button" className="fz-plan" aria-pressed={ord.plan === i} onClick={() => setO({ plan: i })}>
                                        <b>{L(t)}</b>
                                        <span>{L(d)}</span>
                                        <span className="pr">
                                            {eur((fullG / 100) * PLAN_RATE[i], lang)} {L(T.aDay)}
                                        </span>
                                        {i === 2 && <em>{L(T.best)}</em>}
                                    </button>
                                ))}
                            </div>
                            <p className="fz-hint">{L(T.noTie)}</p>
                            {contBtn(3)}
                        </>
                    )}
                    {stepCard(
                        4,
                        <>
                            <div className="fz-three">
                                <div>
                                    <label className="fz-lbl" htmlFor="fz-street">
                                        {L(T.street)}
                                    </label>
                                    <input id="fz-street" className="fz-inp" value={ord.street} placeholder={L(T.streetPh)} autoComplete="street-address" onChange={(e) => setO({ street: e.target.value })} />
                                </div>
                                <div>
                                    <label className="fz-lbl" htmlFor="fz-city">
                                        {L(T.city)}
                                    </label>
                                    <input id="fz-city" className="fz-inp" value={ord.city} autoComplete="address-level2" onChange={(e) => setO({ city: e.target.value })} />
                                </div>
                                <div>
                                    <label className="fz-lbl" htmlFor="fz-zip">
                                        {L(T.zip)}
                                    </label>
                                    <input id="fz-zip" className="fz-inp" value={ord.zip} inputMode="numeric" maxLength={5} autoComplete="postal-code" onChange={(e) => setO({ zip: e.target.value.replace(/\D/g, "") })} />
                                </div>
                            </div>
                            <div className="fz-gap" />
                            <span className="fz-lbl">{L(T.when)}</span>
                            <div className="fz-days" role="group" aria-label={L(T.when)}>
                                {(days || []).map((d, i) => {
                                    const [w, dd] = dayParts(d, lang)
                                    return (
                                        <button key={i} type="button" className="fz-day" aria-pressed={ord.day === i} onClick={() => setO({ day: i })}>
                                            {w}
                                            <small>{dd}</small>
                                        </button>
                                    )
                                })}
                            </div>
                            <p className="fz-hint">{L(T.frozen)}</p>
                            {ready && (
                                <div className="fz-next">
                                    <button type="button" className="fz-btn fz-btn--p" onClick={() => setO({ done: true })}>
                                        {L(T.orderBtn)} · {eur(total, lang)}
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                    {!ord.done && (
                        <div className="fz-obar">
                            <div>
                                <b>{eur(total, lang)}</b>
                                <span>
                                    {planDays} {L(T.days)}
                                </span>
                            </div>
                            <button type="button" className="fz-btn fz-btn--w" onClick={scrollRec}>
                                {L(T.seeBox)}
                            </button>
                        </div>
                    )}
                </div>
                {receipt}
            </div>
        </div>
    )

    /* ---------- footer ---------- */

    const footer = (
        <footer className="fz-foot">
            <div className="fz-wrap">
                <div className="top">
                    <div>
                        <img className="wm" src={ART.wmW} alt="Freshy's" width={105} height={42} />
                        <div className="tg">{L(T.tagline).toUpperCase()}</div>
                    </div>
                    <div>
                        <h2>{L(T.footShop)}</h2>
                        <ul>
                            <li>
                                <button type="button" onClick={() => go({ p: "recipes" })}>
                                    {L(T.recipes)}
                                </button>
                            </li>
                            <li>
                                <button type="button" onClick={() => go({ p: "build" })}>
                                    {L(T.build)}
                                </button>
                            </li>
                            <li>
                                <button type="button" onClick={() => go({ p: "list" })}>
                                    {L(T.list)}
                                </button>
                            </li>
                            <li>
                                <button type="button" onClick={() => (SHOP ? orderPouch() : go({ p: "order" }))}>
                                    {L(SHOP ? T.order : T.meals)}
                                    {!SHOP && <span className="fz-nw fz-nw--s">{L(T.soonB)}</span>}
                                </button>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h2>{L(T.footAbout)}</h2>
                        <ul>
                            <li>
                                <button type="button" onClick={() => goSec("how")}>
                                    {L(T.how)}
                                </button>
                            </li>
                            <li>
                                <button type="button" onClick={() => goSec("story")}>
                                    {L(T.story)}
                                </button>
                            </li>
                            <li>
                                <a href="https://www.instagram.com/freshys.os/" target="_blank" rel="noopener noreferrer">
                                    Instagram
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="small">
                    <span>{L(T.credit)}</span>
                    <span>{L(LIVE ? T.liveFoot : SHOP ? T.protoFoot : T.protoFootNow)}</span>
                </div>
            </div>
        </footer>
    )

    return (
        <div ref={rootRef} className="fz" lang={lang} style={{ ...style }}>
            <style>{CSS}</style>
            <div className="fz-in">
                {!LIVE && (
                <div className="fz-bar fz-noprint">
                        <div className="fz-wrap">
                            <span>
                                Freshy's<span className="hide-s"> · {L(T.proto)}</span>
                            </span>
                            <a href={backLink}>
                                <Ico d={I.left} s={14} w={2.4} />
                                {backLabel}
                            </a>
                        </div>
                    </div>
                )}
                {nav}
                <main>{page.p === "recipes" ? recipesPage : page.p === "recipe" ? (isCat ? catPage : recipePage) : page.p === "order" ? (SHOP ? orderPage : soonPage) : page.p === "build" ? buildPage : page.p === "list" ? listPage : page.p === "plan" ? planPage : page.p === "dog" ? (needAuth ? acctPage : dogPage) : page.p === "acct" ? (ACCT ? acctPage : home) : page.p === "privacy" ? privPage : page.p === "plus" ? (LIVE ? home : plusPage) : home}</main>
                {footer}
            </div>
        </div>
    )
}

addPropertyControls(FreshysSite, {
    language: { type: ControlType.Enum, title: "Language", options: ["en", "hr"], optionTitles: ["English", "Hrvatski"], defaultValue: "en" },
    startPage: { type: ControlType.Enum, title: "Start page", options: ["home", "recipes", "order"], optionTitles: ["Home", "Recipes", "Order"], defaultValue: "home" },
    backLink: { type: ControlType.Link, title: "Back link", defaultValue: "/" },
    backLabel: { type: ControlType.String, title: "Back label", defaultValue: "Tonči Hrgović · Portfolio", hidden: (p: any) => p.site === "live" },
    site: { type: ControlType.Enum, title: "Site", options: ["concept", "live"], optionTitles: ["Concept (portfolio)", "Live (freshysfoods.com)"], defaultValue: "concept" },
})
