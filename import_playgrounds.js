const fs = require('fs');
const path = require('path');
const https = require('https');
const { addPOI } = require('./database');

const playgrounds = [
  {
    "name": "Hössen Skaterplatz",
    "address": "An der Hössen 12, 26655 Westerstede",
    "description": "Maße: 56 x 32 m. Der Skateboardplatz in Westerstede ist mit zwei Funbox Pyramiden, einer Quarterpipe, einer Miniramp, einem Snakerun, einer Treppe und jeweils zwei Handrails und Gaps ausgestattet. • Sauberkeit: Gut • Besonderheit: Anbindung zum Sportplatz. Bewertet vom Kinderrat Westerstede mit der Note: 3-4",
    "imageUrl": "https://www.westerstede.de/static/images/lokalitaeten/skateboardanlage_jpg-7f715df8b88ca220a4f16e15e4f055d5-50.webp"
  },
  {
    "name": "Spielplatz Albertskamp / Vogelkamp",
    "address": "Albertskamp 1, 26655 Westerstede",
    "description": "• Sauberkeit: Sehr gut. Bewertet vom Kinderrat Westerstede mit der Note: 1",
    "imageUrl": "https://www.westerstede.de/static/images/lokalitaeten/albertskamp_vogelkamp_jpg-bfcdaa0e89b924c742e8b98ac1d51a62-50.webp"
  },
  {
    "name": "Spielplatz Am Achterkamp / Hüls",
    "address": "Hüls 43, 26655 Westerstede",
    "description": "Sauberkeit: Sehr gut. Bewertet vom Kinderrat Westerstede mit der Note: 1",
    "imageUrl": "https://www.westerstede.de/static/images/lokalitaeten/am_achterkamp_jpg-390df464835f25b77996813d7e539d93-50.webp"
  },
  {
    "name": "Spielplatz Am Flutter",
    "address": "Am Flutter 15, 26655 Westerstede",
    "description": "• Sauberkeit: Gut • Besonderheit: Riesengroßer Sandkasten. Bewertet vom Kinderrat Westerstede mit der Note: 2",
    "imageUrl": "https://www.westerstede.de/static/images/lokalitaeten/am_flutter_jpg-e6ca986ebe7e07af05372f0216bb1e99-50.webp"
  },
  {
    "name": "Spielplatz Am Stümmel",
    "address": "Am Stümmel 23, 26655 Westerstede",
    "description": "• Sauberkeit: Gut • Besonderheit: Federwippe. Bewertet vom Kinderrat Westerstede mit der Note: 2",
    "imageUrl": "https://www.westerstede.de/static/images/lokalitaeten/csm_am_stuemmel_94c912326f_jpg-064f4753a0113990eea8417977afe17a-50.webp"
  },
  {
    "name": "Spielplatz Auf dem Hochkamp",
    "address": "Auf dem Hochkamp 10, 26655 Westerstede",
    "description": "• Sauberkeit: Sehr gut. Bewertet vom Kinderrat Westerstede mit der Note: 2",
    "imageUrl": "https://www.westerstede.de/static/images/lokalitaeten/csm_auf_dem_hochkamp_034c872d0e_jpg-128d5ace29f69e5fd0629e5ce97e4565-50.webp"
  },
  {
    "name": "Spielplatz Beethovenstraße / Goethestraße",
    "address": "Gutenbergstraße 13, 26655 Westerstede",
    "description": "• Sauberkeit: Gut - befriedigend • Besonderheit: Große Wiese. Bewertet vom Kinderrat Westerstede mit der Note: 2-3",
    "imageUrl": "https://www.westerstede.de/static/images/lokalitaeten/csm_beethovenstrasse_91001ddc15_jpg-d84deb57d23aa3be2155f829a8f88b17-50.webp"
  },
  {
    "name": "Spielplatz Brakenhoffschule",
    "address": "Von-Weber-Straße 8, 26655 Westerstede",
    "description": "• Sauberkeit: Gut - befriedigend • Besonderheit: Großes Fußballfeld & cooler Wall. Bewertet vom Kinderrat Westerstede mit der Note: 1-2",
    "imageUrl": "https://www.westerstede.de/static/images/lokalitaeten/csm_brakenhoffschule_f2910479c9_jpg-d809ab3ca0f5cfea2602df128928c922-50.webp"
  },
  {
    "name": "Spielplatz Dorfgemeinschaftshaus Eggeloge",
    "address": "Eggeloger Straße 14, 26655 Westerstede",
    "description": "• Sauberkeit: Gut • Besonderheit: Riesengroßer Fußballplatz, eine große Hütte zum Sitzen. Bewertet vom Kinderrat Westerstede mit der Note: 1-2",
    "imageUrl": "https://www.westerstede.de/static/images/lokalitaeten/csm_eggeloge_1a47237052_jpg-3d16a817e9ad9a71949e2e9b64456ab4-50.webp"
  },
  {
    "name": "Spielplatz Dorfplatz Burgforde",
    "address": "Kleinburgforder Straße 16, 26655 Westerstede",
    "description": "Sauberkeit: Sehr gut. Besonderheit: Riesen Fußballplatz. Bewertet vom Kinderrat Westerstede mit der Note: 2",
    "imageUrl": "https://www.westerstede.de/static/images/lokalitaeten/csm_dorfplatz_burgforde_cf99831d7b_jpg-40485273c4c41a9979f718f913c40549-50.webp"
  },
  {
    "name": "Spielplatz Dorfplatz Ihausen",
    "address": "Ihauser Damm 4, 26655 Westerstede",
    "description": "Sauberkeit: Sehr gut. Besonderheit: Seilbahn. Bewertet vom Kinderrat Westerstede mit der Note: 3-4",
    "imageUrl": "https://www.westerstede.de/static/images/lokalitaeten/csm_dorfplatz_ihausen_af1930bf00_jpg-51f8547e9aab02dc3a5386c211c6e0b1-50.webp"
  },
  {
    "name": "Spielplatz Dorfplatz Tarbarg",
    "address": "Birkhahnstraße 2, 26655 Westerstede",
    "description": "• Sauberkeit: Sehr gut - Gut • Besonderheit: sehr gepflegt, hohe Wippe, große Rasenfläche. Bewertet vom Kinderrat Westerstede mit der Note: 1-2",
    "imageUrl": "https://www.westerstede.de/static/images/lokalitaeten/csm_tarbarg_254eb90f64_jpg-c4347ed9e1b64e0362c6102053c1f771-50.webp"
  },
  {
    "name": "Spielplatz Eberhard-Ries-Straße",
    "address": "Eberhard-Ries-Straße 17, 26655 Westerstede",
    "description": "• Sauberkeit: Gut. Bewertet vom Kinderrat Westerstede mit der Note: 2",
    "imageUrl": "https://www.westerstede.de/static/images/lokalitaeten/csm_eberhard_riess_strasse_92d2d93c83_jpg-176f8349172d6d7fecc75dcd85b0db96-50.webp"
  },
  {
    "name": "Spielplatz Fliederstraße",
    "address": "Fliederstraße 18, 26655 Westerstede",
    "description": "• Sauberkeit: Sehr gut. Bewertet vom Kinderrat Westerstede mit der Note: 2",
    "imageUrl": "https://www.westerstede.de/static/images/lokalitaeten/csm_fliederstrasse_ad21e2b72b_jpg-c9be67afac67f3b86dcfa3e8592b819d-50.webp"
  },
  {
    "name": "Spielplatz Fritz-Büsing-Straße",
    "address": "Fritz-Büsing-Straße 22, 26655 Westerstede",
    "description": "• Sauberkeit: Sehr gut - gut • Besonderheit: Ordentlich. Bewertet vom Kinderrat Westerstede mit der Note: 2",
    "imageUrl": "https://www.westerstede.de/static/images/lokalitaeten/csm_fritz_buesing_strasse_4b9d00a772_jpg-f1b9cc8ee9ed65657e6412f394f5eb26-50.webp"
  },
  {
    "name": "Spielplatz Gymnasium",
    "address": "Gartenstraße 16, 26655 Westerstede",
    "description": "• Sauberkeit: Gut • Besonderheit: Soccerplatz. Bewertet vom Kinderrat Westerstede mit der Note: 2",
    "imageUrl": "https://www.westerstede.de/static/images/lokalitaeten/csm_gymnasium_8cbd346c64_jpg-450ddeb39c7f51218f3098cafe18d6c3-50.webp"
  },
  {
    "name": "Spielplatz Hainbuchenweg",
    "address": "Hainbuchenweg 8, 26655 Westerstede",
    "description": "• Sauberkeit: Sehr gut • Besonderheit: befindet sich in einer Spielstraße. Bewertet vom Kinderrat Westerstede mit der Note: 1-2",
    "imageUrl": "https://www.westerstede.de/static/images/lokalitaeten/csm_hainbuchenweg_b6740a47ee_jpg-0c122886129066d63755a3312be14f94-50.webp"
  },
  {
    "name": "Spielplatz Hans-Oetken-Padd",
    "address": "Hans-Oetken-Padd 16, 26655 Westerstede",
    "description": "• Sauberkeit: Gut. Bewertet vom Kinderrat Westerstede mit der Note: 3",
    "imageUrl": "https://www.westerstede.de/static/images/lokalitaeten/csm_hans_oetken_padd_99d3af8062_jpg-89db0c29220227c45d1a83b7a81534a6-50.webp"
  },
  {
    "name": "Spielplatz Heidkampsweg",
    "address": "Heidkampsweg 4, 26655 Westerstede",
    "description": "• Sauberkeit: Sehr gut • Besonderheit: Große Wiese und Hügel. Bewertet vom Kinderrat Westerstede mit der Note: 1-2",
    "imageUrl": "https://www.westerstede.de/static/images/lokalitaeten/csm_heidkampsweg_907bbb6a6a_jpg-78c1003ec87dc3b75aa51d0786ec7fce-50.webp"
  },
  {
    "name": "Spielplatz Hössensportanlage",
    "address": "Jahnallee 1, 26655 Westerstede",
    "description": "• Sauberkeit: Gut - befriedigend • Besonderheit: Große Wiese zum Spielen; Piratenschiff. Bewertet vom Kinderrat Westerstede mit der Note: 3",
    "imageUrl": "https://www.westerstede.de/static/images/lokalitaeten/csm_bild_spielplatz_jahnallee_3_f184392967_jpg-b613a7d3cffbfddc95ab28d1fd502b8e-50.webp"
  },
  {
    "name": "Spielplatz Igelstraße / Moosbroksweg",
    "address": "Igelstraße 5, 26655 Westerstede",
    "description": "• Sauberkeit: Sehr gut • Besonderheit: kleiner Sandlastenzug. Bewertet vom Kinderrat Westerstede mit der Note: 1",
    "imageUrl": ""
  },
  {
    "name": "Spielplatz Johanna-Kirchner-Straße",
    "address": "Johanna-Kirchner-Straße 8, 26655 Westerstede",
    "description": "• Sauberkeit: Sehr gut • Besonderheit: Befindet sich in einer Spielstraße. Bewertet vom Kinderrat Westerstede mit der Note: 1-2",
    "imageUrl": "https://www.westerstede.de/static/images/lokalitaeten/csm_johanna_kirchner_strasse_9907b4eca8_jpg-f0dfb8cf727ed56e8e291c318b4b8e1a-50.webp"
  },
  {
    "name": "Spielplatz Kösliner Straße",
    "address": "Kösliner Straße 4, 26655 Westerstede",
    "description": "• Sauberkeit: Gut • Besonderheit: Reifenschaukel zum Stehen. Bewertet vom Kinderrat Westerstede mit der Note: 2",
    "imageUrl": "https://www.westerstede.de/static/images/lokalitaeten/csm_koesliner_strasse_2176b52596_jpg-3a874c1c35b35adcfd965c9769b8bb7a-50.webp"
  },
  {
    "name": "Spielplatz Max-Eyth-Straße",
    "address": "Max-Eyth-Straße 22, 26655 Westerstede",
    "description": "• Sauberkeit: Gut. Bewertet vom Kinderrat Westerstede mit der Note: 3-",
    "imageUrl": "https://www.westerstede.de/static/images/lokalitaeten/csm_max_eyth_str_c7c6147b1f_jpg-014f87e6cde2530f44f28a926f8e1d49-50.webp"
  },
  {
    "name": "Spielplatz Oberschule Westerstede",
    "address": "Dr.-Winters-Straße 14, 26655 Westerstede",
    "description": "• Sauberkeit: Befriedigend • Besonderheit: Tischtennisplatten mit extra Platz. Bewertet vom Kinderrat Westerstede mit der Note: 3",
    "imageUrl": "https://www.westerstede.de/static/images/lokalitaeten/csm_rds_schule_2fe4c8fa26_jpg-443db36367f11b84839ae0d593551189-50.webp"
  },
  {
    "name": "Spielplatz Rosenweg",
    "address": "Rosenweg 32B, 26655 Westerstede",
    "description": "Sauberkeit: Sehr gut. Besonderheit: Seilbahn. Bewertet vom Kinderrat Westerstede mit der Note: 2",
    "imageUrl": "https://www.westerstede.de/static/images/lokalitaeten/csm_primelweg_1_262c777586_jpg-4237ccf01ab258a334079ac037e734ed-50.webp"
  },
  {
    "name": "Spielplatz Sanders Padd / City-Center",
    "address": "Meinardusstraße 18, 26655 Westerstede",
    "description": "• Sauberkeit: gut • Besonderheit: zentrale Lage. Bewertet vom Kinderrat Westerstede mit der Note: 2",
    "imageUrl": "https://www.westerstede.de/static/images/lokalitaeten/csm_dsc_0096_bild_spielplatz_sanders_padd_city_center_-c2ee71c47d4ea9b28ddf4ee257cab4ee-50.webp"
  },
  {
    "name": "Spielplatz Schule an der Goethestraße",
    "address": "Goethestraße 2, 26655 Westerstede",
    "description": "• Sauberkeit: Sehr gut bis Gut • Besonderheit: Basketball, Tischtennisplatten, für ältere Kinder. Bewertet vom Kinderrat Westerstede mit der Note: 2",
    "imageUrl": "https://www.westerstede.de/static/images/lokalitaeten/csm_goethestrasse_fe95fb703c_jpg-6149f7f14040a1a59be5370939ca3978-50.webp"
  },
  {
    "name": "Spielplatz Schule Halsbek",
    "address": "Wittenheimstraße 79, 26655 Westerstede",
    "description": "Sauberkeit: Sehr gut. Besonderheit: Grünes Klassenzimmer. Bewertet vom Kinderrat Westerstede mit der Note: 1-2",
    "imageUrl": "https://www.westerstede.de/static/images/lokalitaeten/grundschule_halsbek_jpg-09c4f21c063849997ccf9dd133a22a7c-50.webp"
  },
  {
    "name": "Spielplatz Süderstraße / Virchowstraße",
    "address": "Süderstraße 34A, 26655 Westerstede",
    "description": "• Sauberkeit: Gut - Befriedigend • Besonderheit: Gut zum Verstecken spielen. Bewertet vom Kinderrat Westerstede mit der Note: 3",
    "imageUrl": "https://www.westerstede.de/static/images/lokalitaeten/csm_suederstrasse_virchowstrasse_42405564ee_jpg-d664bc462f608c47d1655d79a230b03f-50.webp"
  },
  {
    "name": "Spielplatz Südring",
    "address": "Südring 4, 26655 Westerstede",
    "description": "• Sauberkeit: Gut - befriedigend • Besonderheit: Der Spielplatz ist alt - nicht mehr ansprechend. Bewertet vom Kinderrat Westerstede mit der Note: 4-5",
    "imageUrl": "https://www.westerstede.de/static/images/lokalitaeten/csm_suedring_fd09c9e10b_jpg-c2556c49caef058e266328b0769f114a-50.webp"
  },
  {
    "name": "Spielplatz Tannenloge",
    "address": "Tannenloge 29, 26655 Westerstede",
    "description": "• Sauberkeit: Gut • Besonderheit: Große Rasenfläche mit Toren. Bewertet vom Kinderrat Westerstede mit der Note: 2",
    "imageUrl": "https://www.westerstede.de/static/images/lokalitaeten/csm_tannenloge_d79c79148a_jpg-e9a508874d592b50a655a8fd8feee62f-50.webp"
  },
  {
    "name": "Spielplatz Uhlandstraße",
    "address": "Uhlandstraße 11, 26655 Westerstede",
    "description": "• Sauberkeit: Sehr gut • Besonderheit: Fahrradstellplatz, ruhig und gepflegt. Bewertet vom Kinderrat Westerstede mit der Note: 1",
    "imageUrl": "https://www.westerstede.de/static/images/lokalitaeten/csm_uhlandstrasse1_b9d5bd31f5_jpg-31c7df67a135dfc2c6ee56c93e3ed311-50.webp"
  },
  {
    "name": "Spielplatz Zum Stiftungspark / Seggeriedenweg",
    "address": "Zum Stiftungspark 21, 26655 Westerstede",
    "description": "• Sauberkeit: Sehr gut • Besonderheit: Federwippe. Bewertet vom Kinderrat Westerstede mit der Note: 1",
    "imageUrl": "https://www.westerstede.de/static/images/lokalitaeten/csm_zum_stiftungspark_c86a4bc649_jpg-f594f21a1fca9944265dd3ee5461fd40-50.webp"
  }
];

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function geocode(address) {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`;
    try {
        const response = await fetch(url, {
            headers: { 'User-Agent': 'KidstedeDataImport/1.0' }
        });
        const data = await response.json();
        if (data && data.length > 0) {
            return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
        }
    } catch (e) {
        console.error(`Geocoding failed for ${address}:`, e);
    }
    return null;
}

async function downloadImage(url, filename) {
    if (!url) return null;
    const dest = path.join(__dirname, 'uploads', filename);
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        https.get(url, (response) => {
            if (response.statusCode === 200) {
                response.pipe(file);
                file.on('finish', () => {
                    file.close();
                    resolve(`/uploads/${filename}`);
                });
            } else {
                reject(`HTTP ${response.statusCode}`);
            }
        }).on('error', (err) => {
            fs.unlink(dest, () => {});
            reject(err);
        });
    });
}

function cleanDescription(desc) {
    // Remove "Maße: ... m." or similar dimensions
    return desc.replace(/Maße: [^.]+\./g, '').trim();
}

async function run() {
    console.log(`Starting import of ${playgrounds.length} playgrounds...`);
    for (const pg of playgrounds) {
        console.log(`Processing ${pg.name}...`);
        
        // 1. Geocode
        const coords = await geocode(pg.address);
        if (!coords) {
            console.warn(`Skipping ${pg.name} - could not geocode.`);
            continue;
        }
        
        // 2. Clean description
        const description = cleanDescription(pg.description);
        
        // 3. Download image
        let imageUrl = null;
        if (pg.imageUrl) {
            const filename = `${pg.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.webp`;
            try {
                imageUrl = await downloadImage(pg.imageUrl, filename);
            } catch (e) {
                console.error(`Failed to download image for ${pg.name}:`, e);
            }
        }
        
        // 4. Insert into DB
        addPOI(pg.name, description, 'Spielplatz', coords.lat, coords.lng, imageUrl);
        
        // Be nice to Nominatim
        await sleep(1000);
    }
    console.log('Import finished!');
}

run();
