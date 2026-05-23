/**
 * Maps each Arabic card label to its English Wikipedia article title.
 * Used to fetch real photo thumbnails via the Wikipedia REST API.
 */
export const CARD_WIKI_TITLES: Record<string, string> = {
  // ── Animals — solo, clear-face article picks ──────────────────────────────
  'أسد':      'Lion',
  'نمر':      'Bengal_tiger',             // face-forward portrait
  'فيل':      'African_bush_elephant',
  'زرافة':    'Giraffe',
  'حصان':     'Thoroughbred',             // classic horse portrait, face visible
  'ديك':      'Red_junglefowl',           // vibrant solo male, no hens
  'قط':       'Tabby_cat',
  'كلب':      'Labrador_Retriever',       // iconic clean dog face
  'أرنب':     'Rabbit',
  'ضفدع':     'Frog',                     // reverted — was working fine
  'بومة':     'Great_horned_owl',
  'دلفين':    'Dolphin',                  // reverted — was working fine
  'تمساح':    'American_alligator',       // clear frontal head shot
  'ثعبان':    'Ball_python',
  'طاووس':    'Indian_peafowl',
  'فراشة':    'Monarch_butterfly',
  'دب':       'Brown_bear',
  'ذئب':      'Gray_wolf',
  'قرد':      'Chimpanzee',
  'حمار':     'Domestic_donkey',          // clearer solo face
  'جمل':      'Dromedary',
  'بقرة':     'Cattle',
  'خروف':     'Merino_sheep',             // single sheep clear portrait
  'دجاجة':    'Plymouth_Rock_chicken',    // clear solo hen, no rooster

  // ── Football Stars ────────────────────────────────────────────────────────
  'رونالدو':   'Cristiano_Ronaldo',
  'ميسي':      'Lionel_Messi',
  'نيمار':     'Neymar',
  'مبابي':     'Kylian_Mbappé',
  'هالاند':    'Erling_Haaland',
  'بنزيمة':    'Karim_Benzema',
  'لوكاكو':    'Romelu_Lukaku',
  'ساكا':      'Bukayo_Saka',
  'فينيسيوس':  'Vinícius_Júnior',
  'ديبالا':    'Paulo_Dybala',
  'زيدان':     'Zinedine_Zidane',       // replaced كيليان (dup of مبابي)
  'سالاح':     'Mohamed_Salah',
  'فيرمينو':   'Roberto_Firmino',
  'ماني':      'Sadio_Mané',
  'موراتا':    'Álvaro_Morata',
  'غريزمان':   'Antoine_Griezmann',
  'كانسيلو':   'João_Cancelo',
  'برونو':     'Bruno_Fernandes',
  'ثياغو':     'Thiago_Alcântara',
  'أبو تريكة': 'Mohamed_Aboutrika',    // Egyptian legend
  'لامين':     'Lamine_Yamal',
  'بيدري':     'Pedri',
  'غافي':      'Gavi_(footballer)',
  'بيلينغهام': 'Jude_Bellingham',

  // ── Egyptian Celebrities ──────────────────────────────────────────────────
  'محمد صلاح':        'Mohamed_Salah',
  'عمرو دياب':        'Amr_Diab',
  'أم كلثوم':         'Umm_Kulthum',
  'نجيب محفوظ':       'Naguib_Mahfouz',
  'أحمد زكي':         'Ahmed_Zaki_(actor)',
  'ليلى علوي':        'Laila_Elwi',
  // 'أبو تريكة' already listed above — same Wikipedia article works for both lists
  'عادل إمام':        'Adel_Imam',
  'محمود ياسين':      'Mahmoud_Yassin',
  'فاتن حمامة':       'Faten_Hamama',
  'رشدي أباظة':       'Rushdy_Abaza',
  'سعاد حسني':        'Soad_Hosny',
  'هاني شاكر':        'Hany_Shaker',
  'طه حسين':          'Taha_Hussein',           // Egyptian writer
  'يوسف إدريس':       'Yusuf_Idris',            // Egyptian writer
  'إحسان عبد القدوس': 'Ihsan_Abd_al-Quddus',    // Egyptian writer
  'سمير غانم':        'Samir_Ghanem',
  'فريد شوقي':        'Farid_Shawqi',
  'شريف عرفة':        'Sherif_Arafa',
  'مني زكي':          'Mona_Zaki',
  'أحمد السقا':       'Ahmed_El-Sakka',
  'هند صبري':         'Hend_Sabry',
  'كريم عبد العزيز':  'Karim_Abdel_Aziz',
  'نجاة الصغيرة':     'Najat_Al_Saghira',       // iconic Egyptian singer

  // ── Food ─────────────────────────────────────────────────────────────────
  'كشري':          'Kushari',
  'فول':           'Ful_medames',
  'لحمة مشوية':    'Mixed_grill',           // clear grilled meat image
  'كباب':          'Kebab',
  'فتة':           'Fattah_(food)',          // Egyptian dish
  'كنافة':         'Kunafeh',
  'بقلاوة':        'Baklava',
  'أم علي':        'Om_Ali',
  'ملوخية':        'Mulukhiyah',
  'مكرونة':        'Pasta',
  'بيتزا':         'Pizza',
  'برجر':          'Hamburger',
  'سوشي':          'Sushi',
  'شاورما':        'Shawarma',
  'فلافل':         'Falafel',
  'محشي':          'Mahshi',                // Egyptian stuffed veg
  'حواوشي':        'Hawawshi',             // Egyptian minced meat pastry
  'مسقعة':         'Moussaka',
  'كفتة':          'Kofta',
  'سمك':           'Fish',
  'جمبري':         'Shrimp',
  'بطاطس مقلية':   'French_fries',          // fried, not raw potatoes
  'سلطة':          'Salad',
  'آيس كريم':      'Ice_cream',

  // ── People (professions) ─────────────────────────────────────────────────
  'طبيب':      'Physician',
  'مدرس':      'Teacher',
  'طيار':      'Aviator',
  'شيف':       'Chef',
  'مهندس':     'Engineer',
  'محامي':     'Lawyer',
  'رسام':      'Illustrator',
  'موسيقار':   'Musician',
  'رياضي':     'Athlete',
  'صياد':      'Fisherman',
  'فلاح':      'Farmer',
  'بناء':      'Construction_worker',
  'ممرضة':     'Nursing',
  'شرطي':      'Police_officer',
  'مطفئ':      'Firefighter',
  'صحفي':      'Journalist',
  'عالم':      'Scientist',
  'نجار':      'Carpenter',
  'خياط':      'Tailor',
  'حلاق':      'Barber',
  'ساحر':      'Magician_(illusionist)',
  'باعة':      'Market_trader',
  'قاضي':      'Judge',
  'دبلوماسي':  'Diplomat',
};
