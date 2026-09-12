import React, { useState, useMemo, useRef, useLayoutEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";

const newsModules = import.meta.glob("/content/news/*.json", { eager: true });
const NEWS = Object.entries(newsModules)
  .map(([path, mod]) => ({ slug: path.split("/").pop().replace(".json", ""), ...(mod.default || mod) }))
  .sort((a, b) => new Date(b.date) - new Date(a.date));
import {
  Search, X, Moon, Zap, Dumbbell, Brain, HeartPulse, AlertTriangle,
  Clock, Beaker, Shield, Timer, TrendingUp, SlidersHorizontal, Globe, Download, Crown, Check, Sun, Mail,
  Newspaper, Store, Layers, ArrowRight,
} from "lucide-react";

const LANGUAGES = [
  { code: "en", label: "EN" },
  { code: "el", label: "EL" },
  { code: "es", label: "ES" },
  { code: "no", label: "NO" },
];

const UI = {
  en: {
    searchPlaceholder: "Search ingredient or goal",
    filters: "Filters",
    position: "Position:",
    all: "All",
    heroEyebrow: "32 Ingredients. Real Data.",
    heroTitle1: "Know Your",
    heroAccent: "Stack",
    heroSub: "Every ingredient, broken down: what it does, how much to take, when to take it.",
    count: "entries",
    sortBy: "Sorted by score",
    emptyTitle: "No Entries",
    emptySub: "Try a different search term or clear your filters.",
    footer: "Informational content, not medical advice. Talk to a healthcare professional before starting a new supplement, especially if you're on medication.",
    mechanism: "Mechanism of Action",
    benefits: "Benefits",
    dosage: "Dosage",
    timing: "Timing",
    caution: "Caution",
    evidence: "Evidence",
    ovr: "Score",
    detailNote: "Detailed info below is shown in English for accuracy.",
    research: "In The Research",
    tabWelcome: "Welcome",
    welcomeHeroTitle: "Welcome to",
    welcomeIntro: "STCK is a free, independent supplement reference — no sponsored rankings, no affiliate links, nothing for sale here except the Premium coaching option. Here's a quick guide to what you'll find and how to use it.",
    welcomeGuideLibraryDesc: "Browse 60+ supplement ingredients, each backed by real studies — what it does, how much to take, when to take it, and what to watch out for.",
    welcomeGuideResearchDesc: "A live feed of the latest research findings across every ingredient in the Library, in one place.",
    welcomeGuideStackDesc: "Pick what you're already taking and instantly see synergies, overlaps, and cautions between them.",
    welcomeGuideCompareDesc: "Compare real branded products side by side — like a specific whey protein vs. another — with sourced specs and pricing.",
    welcomeGuideNewsDesc: "Site updates and research roundups, posted regularly.",
    welcomeGuidePremiumDesc: "Want it personalized? Get 1-on-1 training and supplement coaching directly from a real person.",
    welcomeCta: "Start Exploring the Library",
    tabLibrary: "Library",
    tabResearch: "Research",
    tabStack: "Stack Builder",
    stackIntro: "Pick the ingredients you're considering. We'll flag synergies, overlaps, and cumulative cautions, and lay out a suggested daily schedule.",
    stackEmpty: "Select a few ingredients above to see how they work together.",
    synergiesTitle: "Synergies",
    cautionsTitle: "Cautions & Overlaps",
    scheduleTitle: "Suggested Schedule",
    noSynergies: "No specific synergies found for this combination — that doesn't mean it's a bad stack, just that we don't have a documented interaction for it.",
    noCautions: "No overlap or cumulative-load cautions detected for this combination.",
    slotMorning: "Morning",
    slotPreWorkout: "Pre-Workout",
    slotPostWorkout: "Post-Workout",
    slotEvening: "Evening",
    slotAnytime: "Anytime",
    clearStack: "Clear",
    tabCompare: "Compare",
    compareIntro: "Real products, side by side — so you can see which one actually fits what you're looking for.",
    compareCategoryLabel: "Category:",
    compareSelectLabel: "Products to compare:",
    compareEmptySub: "Select at least one product above.",
    compareColBrand: "Brand",
    compareColProduct: "Product",
    compareColServing: "Serving Size",
    compareColProtein: "Protein",
    compareColCalories: "Calories",
    compareColCarbs: "Carbs",
    compareColFat: "Fat",
    compareColBcaa: "BCAAs",
    compareColSource: "Protein Source",
    compareColSweeteners: "Sweeteners",
    compareColGrassFed: "Grass-Fed",
    compareColCert: "Certifications",
    compareColPrice: "Price / Serving",
    compareYes: "Yes",
    compareNo: "No",
    compareDataNote: "Figures are sourced from brand and retailer listings and may vary by flavor, batch, or region. Always check the label on the product you actually buy.",
    compareSourceLink: "View source",
    legalLink: "Terms & Disclaimer",
    tabOverview: "Overview",
    tabResearchDetail: "Research",
    tabPractical: "Practical",
    tabPremium: "Premium",
    tabStore: "Store",
    tabNews: "News",
    newsReadMore: "Read more",
    newsBack: "Back to News",
    downloadPdf: "Download PDF",
    premiumEyebrow: "Personalized Coaching",
    premiumTitle1: "Your Personal",
    premiumAccent: "Training & Stack Plan",
    premiumSub: "A workout program and supplement stack built around your goals, schedule, and experience level — put together and reviewed by a real person, not generated by AI.",
    premiumPrice: "Get in touch",
    premiumCta: "Request Your Plan",
    premiumNote: "We reply by email, from a real coach — never an automated or AI-generated response.",
    premiumBullets: [
      "A training program matched to your goal (strength, hypertrophy, endurance, or general fitness)",
      "A supplement stack matched to that program and your budget",
      "Direct email conversation with a real person to fine-tune the plan",
      "Follow-up adjustments as your training progresses",
    ],
    premiumFreeNote: "Not ready yet? Build your own stack below and see it for free first.",
    legalTitle: "Terms & Disclaimer",
    legalBody: [
      "Not Medical Advice — The information on this site is for educational purposes only and is not medical advice. Always consult a qualified healthcare professional before starting any supplement, especially if you are pregnant, nursing, have a medical condition, or take medication.",
      "No Guarantee of Accuracy — We summarize publicly available research to the best of our ability, but we make no warranty that any information is complete, current, or error-free. Supplement research evolves constantly.",
      "Use At Your Own Risk — Your use of this site and any decisions based on its content are entirely at your own risk. We are not liable for any loss, injury, or damage arising from use of the information provided.",
      "No Affiliate Relationship — This site does not sell products or receive commission from any supplement brand. We have no financial relationship with the products or ingredients discussed.",
      "Intellectual Property — All original content on this site is our own work. Ingredient names and general scientific facts are not owned by us and may appear on other educational resources.",
      "Changes — We may update or remove content at any time without notice.",
    ],
    aboutTitle: "About STCK",
    aboutText: "We built STCK to make supplement research easier to actually read. Every entry pulls from real studies and meta-analyses — no sponsored rankings, no affiliate links, no products to sell. Just a straight look at what the evidence says, so you can decide what's worth your money and what isn't.",
    copyright: "© 2026 STCK. All rights reserved.",
  },
  el: {
    searchPlaceholder: "Αναζήτηση συστατικού ή στόχου",
    filters: "Φίλτρα",
    position: "Θέση:",
    all: "Όλες",
    heroEyebrow: "32 Συστατικά. Πραγματικά Δεδομένα.",
    heroTitle1: "Γνώρισε το",
    heroAccent: "Stack",
    heroSub: "Κάθε συστατικό, αναλυμένο: τι κάνει, πόση δόση παίρνεις, πότε το παίρνεις.",
    count: "καταχωρίσεις",
    sortBy: "Ταξινόμηση κατά βαθμολογία",
    emptyTitle: "Καμία Καταχώριση",
    emptySub: "Δοκίμασε διαφορετικό όρο ή καθάρισε τα φίλτρα.",
    footer: "Πληροφοριακό περιεχόμενο, όχι ιατρική συμβουλή. Συμβουλέψου επαγγελματία υγείας πριν από νέο συμπλήρωμα, ιδίως αν λαμβάνεις φαρμακευτική αγωγή.",
    mechanism: "Μηχανισμός Δράσης",
    benefits: "Οφέλη",
    dosage: "Δοσολογία",
    timing: "Χρονισμός",
    caution: "Προσοχή",
    evidence: "Τεκμηρίωση",
    ovr: "Βαθμολογία",
    detailNote: "Οι αναλυτικές πληροφορίες παρακάτω εμφανίζονται στα Αγγλικά για ακρίβεια.",
    research: "Στην Έρευνα",
    tabWelcome: "Καλωσόρισμα",
    welcomeHeroTitle: "Καλώς ήρθες στο",
    welcomeIntro: "Το STCK είναι μια δωρεάν, ανεξάρτητη βιβλιοθήκη συμπληρωμάτων — χωρίς χορηγούμενες κατατάξεις, χωρίς affiliate links, τίποτα προς πώληση εκτός από την επιλογή Premium coaching. Ένας σύντομος οδηγός για το τι θα βρεις και πώς να το χρησιμοποιήσεις.",
    welcomeGuideLibraryDesc: "Εξερεύνησε 60+ συστατικά συμπληρωμάτων, το καθένα τεκμηριωμένο με πραγματικές μελέτες — τι κάνει, πόσο να πάρεις, πότε, και τι να προσέξεις.",
    welcomeGuideResearchDesc: "Ζωντανή ροή με τα τελευταία ερευνητικά ευρήματα από όλα τα συστατικά της Βιβλιοθήκης, σε ένα μέρος.",
    welcomeGuideStackDesc: "Επίλεξε τι ήδη παίρνεις και δες άμεσα συνέργειες, επικαλύψεις και προσοχές μεταξύ τους.",
    welcomeGuideCompareDesc: "Σύγκρινε πραγματικά εμπορικά προϊόντα δίπλα-δίπλα — π.χ. μια συγκεκριμένη πρωτεΐνη whey με μια άλλη — με τεκμηριωμένα specs και τιμές.",
    welcomeGuideNewsDesc: "Ενημερώσεις του site και συνόψεις έρευνας, τακτικά.",
    welcomeGuidePremiumDesc: "Θες εξατομίκευση; Πάρε 1-προς-1 προπόνηση και συμβουλευτική συμπληρωμάτων απευθείας από πραγματικό άνθρωπο.",
    welcomeCta: "Ξεκίνα την Εξερεύνηση της Βιβλιοθήκης",
    tabLibrary: "Βιβλιοθήκη",
    tabResearch: "Έρευνα",
    tabStack: "Χτίσε το Stack",
    stackIntro: "Διάλεξε τα συστατικά που σκέφτεσαι. Θα επισημάνουμε συνέργειες, επικαλύψεις και αθροιστικές προσοχές, και θα προτείνουμε ένα ημερήσιο πρόγραμμα.",
    stackEmpty: "Διάλεξε μερικά συστατικά παραπάνω για να δεις πώς συνεργάζονται.",
    synergiesTitle: "Συνέργειες",
    cautionsTitle: "Προσοχές & Επικαλύψεις",
    scheduleTitle: "Προτεινόμενο Πρόγραμμα",
    noSynergies: "Δεν βρέθηκαν συγκεκριμένες συνέργειες για αυτόν τον συνδυασμό — αυτό δεν σημαίνει ότι είναι κακό stack, απλώς δεν έχουμε τεκμηριωμένη αλληλεπίδραση γι' αυτόν.",
    noCautions: "Δεν εντοπίστηκαν επικαλύψεις ή αθροιστικές προσοχές για αυτόν τον συνδυασμό.",
    slotMorning: "Πρωί",
    slotPreWorkout: "Πριν την Προπόνηση",
    slotPostWorkout: "Μετά την Προπόνηση",
    slotEvening: "Βράδυ",
    slotAnytime: "Οποιαδήποτε Ώρα",
    clearStack: "Καθαρισμός",
    tabCompare: "Σύγκριση",
    compareIntro: "Πραγματικά προϊόντα, δίπλα-δίπλα — για να δεις ποιο πραγματικά ταιριάζει σε αυτό που ψάχνεις.",
    compareCategoryLabel: "Κατηγορία:",
    compareSelectLabel: "Προϊόντα προς σύγκριση:",
    compareEmptySub: "Επίλεξε τουλάχιστον ένα προϊόν παραπάνω.",
    compareColBrand: "Μάρκα",
    compareColProduct: "Προϊόν",
    compareColServing: "Μέγεθος Μερίδας",
    compareColProtein: "Πρωτεΐνη",
    compareColCalories: "Θερμίδες",
    compareColCarbs: "Υδατάνθρακες",
    compareColFat: "Λιπαρά",
    compareColBcaa: "BCAA",
    compareColSource: "Πηγή Πρωτεΐνης",
    compareColSweeteners: "Γλυκαντικά",
    compareColGrassFed: "Grass-Fed",
    compareColCert: "Πιστοποιήσεις",
    compareColPrice: "Τιμή / Μερίδα",
    compareYes: "Ναι",
    compareNo: "Όχι",
    compareDataNote: "Τα στοιχεία προέρχονται από τη μάρκα και καταστήματα λιανικής και μπορεί να διαφέρουν ανά γεύση, παρτίδα ή αγορά. Πάντα έλεγξε την ετικέτα του προϊόντος που αγοράζεις.",
    compareSourceLink: "Δες την πηγή",
    legalLink: "Όροι & Αποποίηση Ευθύνης",
    tabOverview: "Επισκόπηση",
    tabResearchDetail: "Έρευνα",
    tabPractical: "Πρακτικά",
    tabPremium: "Premium",
    tabStore: "Κατάστημα",
    tabNews: "Νέα",
    newsReadMore: "Διάβασε περισσότερα",
    newsBack: "Πίσω στα Νέα",
    downloadPdf: "Λήψη PDF",
    premiumEyebrow: "Εξατομικευμένη Καθοδήγηση",
    premiumTitle1: "Το Προσωπικό σου",
    premiumAccent: "Πρόγραμμα Προπόνησης & Stack",
    premiumSub: "Ένα πρόγραμμα προπόνησης και ένα stack συμπληρωμάτων φτιαγμένα γύρω από τους στόχους, το πρόγραμμα και το επίπεδό σου — σχεδιασμένο και ελεγμένο από πραγματικό άνθρωπο, όχι από AI.",
    premiumPrice: "Επικοινώνησε μαζί μας",
    premiumCta: "Ζήτησε το Πρόγραμμά σου",
    premiumNote: "Απαντάμε μέσω email, από πραγματικό coach — ποτέ με αυτοματοποιημένη ή AI απάντηση.",
    premiumBullets: [
      "Πρόγραμμα προπόνησης ταιριασμένο στον στόχο σου (δύναμη, υπερτροφία, αντοχή, ή γενική φόρμα)",
      "Stack συμπληρωμάτων ταιριασμένο στο πρόγραμμα και το budget σου",
      "Άμεση συνομιλία μέσω email με πραγματικό άνθρωπο για να φινετσάρουμε το πλάνο",
      "Προσαρμογές καθώς εξελίσσεται η προπόνησή σου",
    ],
    premiumFreeNote: "Δεν είσαι ακόμα έτοιμος/η; Φτιάξε το δικό σου stack παρακάτω δωρεάν πρώτα.",
    legalTitle: "Όροι & Αποποίηση Ευθύνης",
    legalBody: [
      "Όχι Ιατρική Συμβουλή — Οι πληροφορίες σε αυτό το site είναι μόνο για εκπαιδευτικούς σκοπούς και δεν αποτελούν ιατρική συμβουλή. Συμβουλέψου πάντα εξειδικευμένο επαγγελματία υγείας πριν ξεκινήσεις οποιοδήποτε συμπλήρωμα, ειδικά αν είσαι έγκυος, θηλάζεις, έχεις κάποια πάθηση, ή λαμβάνεις φαρμακευτική αγωγή.",
      "Καμία Εγγύηση Ακρίβειας — Συνοψίζουμε δημόσια διαθέσιμη έρευνα όσο καλύτερα μπορούμε, αλλά δεν εγγυόμαστε ότι κάθε πληροφορία είναι πλήρης, ενημερωμένη ή χωρίς λάθη. Η έρευνα συμπληρωμάτων εξελίσσεται συνεχώς.",
      "Χρήση με Δική σου Ευθύνη — Η χρήση αυτού του site και οποιεσδήποτε αποφάσεις βασισμένες στο περιεχόμενό του γίνονται αποκλειστικά με δική σου ευθύνη. Δεν φέρουμε ευθύνη για τυχόν απώλεια, τραυματισμό ή ζημία που προκύπτει από τη χρήση των πληροφοριών.",
      "Καμία Συνεργασία Affiliate — Αυτό το site δεν πουλάει προϊόντα ούτε λαμβάνει προμήθεια από καμία μάρκα συμπληρωμάτων. Δεν έχουμε καμία οικονομική σχέση με τα προϊόντα ή συστατικά που αναφέρονται.",
      "Πνευματική Ιδιοκτησία — Όλο το πρωτότυπο περιεχόμενο σε αυτό το site είναι δική μας δουλειά. Τα ονόματα συστατικών και γενικά επιστημονικά γεγονότα δεν ανήκουν σε εμάς και μπορεί να εμφανίζονται και σε άλλες εκπαιδευτικές πηγές.",
      "Αλλαγές — Μπορούμε να ενημερώσουμε ή να αφαιρέσουμε περιεχόμενο ανά πάσα στιγμή χωρίς προειδοποίηση.",
    ],
    aboutTitle: "Σχετικά με το STCK",
    aboutText: "Φτιάξαμε το STCK για να κάνουμε την έρευνα συμπληρωμάτων πιο εύκολα κατανοητή. Κάθε καταχώριση βασίζεται σε πραγματικές μελέτες και μετα-αναλύσεις — χωρίς χορηγούμενες κατατάξεις, χωρίς affiliate links, χωρίς προϊόντα προς πώληση. Μόνο μια ευθεία ματιά στο τι λένε τα στοιχεία, ώστε να αποφασίσεις μόνος σου τι αξίζει τα χρήματά σου.",
    copyright: "© 2026 STCK. Με επιφύλαξη παντός δικαιώματος.",
  },
  es: {
    searchPlaceholder: "Buscar ingrediente u objetivo",
    filters: "Filtros",
    position: "Posición:",
    all: "Todos",
    heroEyebrow: "32 Ingredientes. Datos Reales.",
    heroTitle1: "Conoce tu",
    heroAccent: "Stack",
    heroSub: "Cada ingrediente, explicado: qué hace, cuánto tomar, cuándo tomarlo.",
    count: "entradas",
    sortBy: "Ordenado por puntaje",
    emptyTitle: "Sin Resultados",
    emptySub: "Prueba otro término de búsqueda o borra los filtros.",
    footer: "Contenido informativo, no es consejo médico. Consulta a un profesional de la salud antes de empezar un nuevo suplemento, especialmente si tomas medicación.",
    mechanism: "Mecanismo de Acción",
    benefits: "Beneficios",
    dosage: "Dosis",
    timing: "Momento de Uso",
    caution: "Precaución",
    evidence: "Evidencia",
    ovr: "Puntaje",
    detailNote: "La información detallada se muestra en inglés por precisión.",
    research: "En la Investigación",
    tabWelcome: "Bienvenida",
    welcomeHeroTitle: "Bienvenido a",
    welcomeIntro: "STCK es una biblioteca de suplementos gratuita e independiente — sin rankings patrocinados, sin enlaces de afiliados, nada a la venta excepto la opción de coaching Premium. Aquí tienes una guía rápida de lo que encontrarás y cómo usarlo.",
    welcomeGuideLibraryDesc: "Explora más de 60 ingredientes de suplementos, cada uno respaldado por estudios reales — qué hace, cuánto tomar, cuándo tomarlo y qué vigilar.",
    welcomeGuideResearchDesc: "Un feed en vivo con los últimos hallazgos de investigación de todos los ingredientes de la Biblioteca, en un solo lugar.",
    welcomeGuideStackDesc: "Elige lo que ya tomas y ve al instante sinergias, solapamientos y precauciones entre ellos.",
    welcomeGuideCompareDesc: "Compara productos comerciales reales uno junto a otro — como una proteína whey específica frente a otra — con especificaciones y precios verificados.",
    welcomeGuideNewsDesc: "Actualizaciones del sitio y resúmenes de investigación, publicados regularmente.",
    welcomeGuidePremiumDesc: "¿Quieres algo personalizado? Obtén entrenamiento y coaching de suplementos 1 a 1 directamente de una persona real.",
    welcomeCta: "Empezar a Explorar la Biblioteca",
    tabLibrary: "Biblioteca",
    tabResearch: "Investigación",
    tabStack: "Crear Stack",
    stackIntro: "Elige los ingredientes que estás considerando. Señalaremos sinergias, solapamientos y precauciones acumulativas, y sugeriremos un horario diario.",
    stackEmpty: "Selecciona algunos ingredientes arriba para ver cómo funcionan juntos.",
    synergiesTitle: "Sinergias",
    cautionsTitle: "Precauciones y Solapamientos",
    scheduleTitle: "Horario Sugerido",
    noSynergies: "No se encontraron sinergias específicas para esta combinación — eso no significa que sea un mal stack, solo que no tenemos una interacción documentada.",
    noCautions: "No se detectaron solapamientos ni precauciones acumulativas para esta combinación.",
    slotMorning: "Mañana",
    slotPreWorkout: "Antes del Entreno",
    slotPostWorkout: "Después del Entreno",
    slotEvening: "Noche",
    slotAnytime: "Cualquier Momento",
    clearStack: "Borrar",
    tabCompare: "Comparar",
    compareIntro: "Productos reales, uno junto a otro — para que veas cuál se ajusta realmente a lo que buscas.",
    compareCategoryLabel: "Categoría:",
    compareSelectLabel: "Productos a comparar:",
    compareEmptySub: "Selecciona al menos un producto arriba.",
    compareColBrand: "Marca",
    compareColProduct: "Producto",
    compareColServing: "Tamaño de la Porción",
    compareColProtein: "Proteína",
    compareColCalories: "Calorías",
    compareColCarbs: "Carbohidratos",
    compareColFat: "Grasa",
    compareColBcaa: "BCAA",
    compareColSource: "Fuente de Proteína",
    compareColSweeteners: "Edulcorantes",
    compareColGrassFed: "Grass-Fed",
    compareColCert: "Certificaciones",
    compareColPrice: "Precio / Porción",
    compareYes: "Sí",
    compareNo: "No",
    compareDataNote: "Los datos provienen de la marca y minoristas y pueden variar según sabor, lote o región. Revisa siempre la etiqueta del producto que compres.",
    compareSourceLink: "Ver fuente",
    legalLink: "Términos y Aviso Legal",
    tabOverview: "Resumen",
    tabResearchDetail: "Investigación",
    tabPractical: "Práctico",
    tabPremium: "Premium",
    tabStore: "Tienda",
    tabNews: "Noticias",
    newsReadMore: "Leer más",
    newsBack: "Volver a Noticias",
    downloadPdf: "Descargar PDF",
    premiumEyebrow: "Coaching Personalizado",
    premiumTitle1: "Tu Plan Personal de",
    premiumAccent: "Entrenamiento y Stack",
    premiumSub: "Un programa de entrenamiento y un stack de suplementos creados según tus objetivos, tu horario y tu nivel — diseñados y revisados por una persona real, no generados por IA.",
    premiumPrice: "Contáctanos",
    premiumCta: "Solicita tu Plan",
    premiumNote: "Respondemos por email, siempre una persona real — nunca una respuesta automatizada o generada por IA.",
    premiumBullets: [
      "Un programa de entrenamiento según tu objetivo (fuerza, hipertrofia, resistencia o forma física general)",
      "Un stack de suplementos ajustado a ese programa y a tu presupuesto",
      "Conversación directa por email con una persona real para ajustar el plan",
      "Ajustes de seguimiento a medida que avanza tu entrenamiento",
    ],
    premiumFreeNote: "¿Aún no estás listo? Crea tu propio stack abajo gratis primero.",
    legalTitle: "Términos y Aviso Legal",
    legalBody: [
      "No es Consejo Médico — La información en este sitio es solo para fines educativos y no constituye consejo médico. Consulta siempre a un profesional de la salud cualificado antes de empezar cualquier suplemento, especialmente si estás embarazada, en periodo de lactancia, tienes alguna condición médica o tomas medicación.",
      "Sin Garantía de Exactitud — Resumimos investigación disponible públicamente lo mejor que podemos, pero no garantizamos que la información sea completa, actual o esté libre de errores. La investigación sobre suplementos evoluciona constantemente.",
      "Uso Bajo tu Propio Riesgo — El uso de este sitio y cualquier decisión basada en su contenido es bajo tu propio riesgo. No somos responsables de ninguna pérdida, lesión o daño derivado del uso de la información.",
      "Sin Relación de Afiliado — Este sitio no vende productos ni recibe comisión de ninguna marca de suplementos. No tenemos relación financiera con los productos o ingredientes mencionados.",
      "Propiedad Intelectual — Todo el contenido original de este sitio es trabajo propio. Los nombres de ingredientes y hechos científicos generales no nos pertenecen y pueden aparecer en otros recursos educativos.",
      "Cambios — Podemos actualizar o eliminar contenido en cualquier momento sin previo aviso.",
    ],
    aboutTitle: "Sobre STCK",
    aboutText: "Creamos STCK para hacer que la investigación de suplementos sea más fácil de entender. Cada entrada se basa en estudios reales y metaanálisis — sin rankings patrocinados, sin enlaces de afiliados, sin productos que vender. Solo una mirada directa a lo que dice la evidencia, para que decidas tú qué vale la pena.",
    copyright: "© 2026 STCK. Todos los derechos reservados.",
  },
  no: {
    searchPlaceholder: "Søk etter ingrediens eller mål",
    filters: "Filtre",
    position: "Posisjon:",
    all: "Alle",
    heroEyebrow: "32 Ingredienser. Ekte Data.",
    heroTitle1: "Møt din",
    heroAccent: "Stack",
    heroSub: "Hver ingrediens, forklart: hva den gjør, hvor mye du tar, når du tar den.",
    count: "oppføringer",
    sortBy: "Sortert etter score",
    emptyTitle: "Ingen Treff",
    emptySub: "Prøv et annet søkeord eller fjern filtrene.",
    footer: "Informativt innhold, ikke medisinsk råd. Snakk med helsepersonell før du starter et nytt kosttilskudd, spesielt hvis du bruker medisiner.",
    mechanism: "Virkningsmekanisme",
    benefits: "Fordeler",
    dosage: "Dosering",
    timing: "Timing",
    caution: "Forsiktighet",
    evidence: "Dokumentasjon",
    ovr: "Score",
    detailNote: "Detaljert informasjon vises på engelsk for nøyaktighet.",
    research: "I Forskningen",
    tabWelcome: "Velkommen",
    welcomeHeroTitle: "Velkommen til",
    welcomeIntro: "STCK er et gratis, uavhengig kosttilskudd-oppslagsverk — ingen sponsede rangeringer, ingen affiliate-lenker, ingenting til salgs bortsett fra Premium-coaching. Her er en rask guide til hva du finner og hvordan du bruker det.",
    welcomeGuideLibraryDesc: "Utforsk 60+ kosttilskuddsingredienser, hver underbygget av ekte studier — hva den gjør, hvor mye å ta, når du skal ta den, og hva du bør passe på.",
    welcomeGuideResearchDesc: "En live-strøm med de nyeste forskningsfunnene på tvers av alle ingredienser i Biblioteket, samlet på ett sted.",
    welcomeGuideStackDesc: "Velg hva du allerede tar og se umiddelbart synergier, overlapp og forsiktighetsregler mellom dem.",
    welcomeGuideCompareDesc: "Sammenlign ekte merkevareprodukter side om side — som et spesifikt myseprotein mot et annet — med kildebelagte spesifikasjoner og priser.",
    welcomeGuideNewsDesc: "Nettstedoppdateringer og forskningsoppsummeringer, publisert jevnlig.",
    welcomeGuidePremiumDesc: "Vil du ha noe personlig? Få 1-til-1 trening og kosttilskudd-coaching direkte fra en ekte person.",
    welcomeCta: "Start Utforskingen av Biblioteket",
    tabLibrary: "Bibliotek",
    tabResearch: "Forskning",
    tabStack: "Bygg Stacken",
    stackIntro: "Velg ingrediensene du vurderer. Vi markerer synergier, overlapp og kumulative forsiktighetsregler, og foreslår en daglig plan.",
    stackEmpty: "Velg noen ingredienser over for å se hvordan de fungerer sammen.",
    synergiesTitle: "Synergier",
    cautionsTitle: "Forsiktighet & Overlapp",
    scheduleTitle: "Foreslått Plan",
    noSynergies: "Ingen spesifikke synergier funnet for denne kombinasjonen — det betyr ikke at det er en dårlig stack, bare at vi ikke har en dokumentert interaksjon.",
    noCautions: "Ingen overlapp eller kumulative forsiktighetsregler oppdaget for denne kombinasjonen.",
    slotMorning: "Morgen",
    slotPreWorkout: "Før Trening",
    slotPostWorkout: "Etter Trening",
    slotEvening: "Kveld",
    slotAnytime: "Når Som Helst",
    clearStack: "Fjern",
    tabCompare: "Sammenlign",
    compareIntro: "Ekte produkter, side om side — så du kan se hvilket som faktisk passer det du er ute etter.",
    compareCategoryLabel: "Kategori:",
    compareSelectLabel: "Produkter å sammenligne:",
    compareEmptySub: "Velg minst ett produkt over.",
    compareColBrand: "Merke",
    compareColProduct: "Produkt",
    compareColServing: "Porsjonsstørrelse",
    compareColProtein: "Protein",
    compareColCalories: "Kalorier",
    compareColCarbs: "Karbohydrater",
    compareColFat: "Fett",
    compareColBcaa: "BCAA",
    compareColSource: "Proteinkilde",
    compareColSweeteners: "Søtningsstoffer",
    compareColGrassFed: "Grass-Fed",
    compareColCert: "Sertifiseringer",
    compareColPrice: "Pris / Porsjon",
    compareYes: "Ja",
    compareNo: "Nei",
    compareDataNote: "Tallene er hentet fra merke- og forhandleroppføringer og kan variere etter smak, batch eller region. Sjekk alltid etiketten på produktet du faktisk kjøper.",
    compareSourceLink: "Se kilde",
    legalLink: "Vilkår & Ansvarsfraskrivelse",
    tabOverview: "Oversikt",
    tabResearchDetail: "Forskning",
    tabPractical: "Praktisk",
    tabPremium: "Premium",
    tabStore: "Butikk",
    tabNews: "Nyheter",
    newsReadMore: "Les mer",
    newsBack: "Tilbake til Nyheter",
    downloadPdf: "Last ned PDF",
    premiumEyebrow: "Personlig Coaching",
    premiumTitle1: "Din Personlige",
    premiumAccent: "Trenings- og Stack-plan",
    premiumSub: "Et treningsprogram og en tilskuddsstack bygget rundt dine mål, timeplan og erfaringsnivå — satt sammen og vurdert av en ekte person, ikke generert av AI.",
    premiumPrice: "Ta kontakt",
    premiumCta: "Be om din Plan",
    premiumNote: "Vi svarer på e-post, fra en ekte coach — aldri et automatisert eller AI-generert svar.",
    premiumBullets: [
      "Et treningsprogram tilpasset målet ditt (styrke, hypertrofi, utholdenhet eller generell form)",
      "En tilskuddsstack tilpasset det programmet og budsjettet ditt",
      "Direkte e-postsamtale med en ekte person for å finjustere planen",
      "Oppfølgingsjusteringer etter hvert som treningen din utvikler seg",
    ],
    premiumFreeNote: "Ikke klar ennå? Bygg din egen stack under og se den gratis først.",
    legalTitle: "Vilkår & Ansvarsfraskrivelse",
    legalBody: [
      "Ikke Medisinsk Rådgivning — Informasjonen på dette nettstedet er kun for utdanningsformål og er ikke medisinsk rådgivning. Rådfør deg alltid med kvalifisert helsepersonell før du starter et kosttilskudd, spesielt hvis du er gravid, ammer, har en medisinsk tilstand, eller bruker medisiner.",
      "Ingen Garanti for Nøyaktighet — Vi oppsummerer offentlig tilgjengelig forskning etter beste evne, men garanterer ikke at informasjonen er fullstendig, oppdatert eller feilfri. Forskning på kosttilskudd er i stadig utvikling.",
      "Bruk på Eget Ansvar — Din bruk av dette nettstedet og eventuelle beslutninger basert på innholdet er helt på eget ansvar. Vi er ikke ansvarlige for tap, skade eller andre konsekvenser som følge av bruk av informasjonen.",
      "Ingen Affiliate-tilknytning — Dette nettstedet selger ikke produkter og mottar ikke provisjon fra noe kosttilskuddsmerke. Vi har ingen økonomisk tilknytning til produktene eller ingrediensene som omtales.",
      "Åndsverk — Alt originalt innhold på dette nettstedet er vårt eget arbeid. Ingrediensnavn og generelle vitenskapelige fakta eies ikke av oss og kan finnes på andre undervisningsressurser.",
      "Endringer — Vi kan oppdatere eller fjerne innhold når som helst uten varsel.",
    ],
    aboutTitle: "Om STCK",
    aboutText: "Vi laget STCK for å gjøre kosttilskuddsforskning lettere å forstå. Hver oppføring bygger på ekte studier og metaanalyser — ingen sponsede rangeringer, ingen affiliate-lenker, ingen produkter å selge. Bare et ærlig blikk på hva forskningen faktisk sier, slik at du kan bestemme selv hva som er verdt pengene.",
    copyright: "© 2026 STCK. Alle rettigheter reservert.",
  },
};

const CATEGORY_META = {
  performance: { icon: Zap, code: "PWR", accent: "#FF3B30" },
  muscle: { icon: Dumbbell, code: "MSC", accent: "#FFB020" },
  recovery: { icon: HeartPulse, code: "RCV", accent: "#2DD4BF" },
  sleep: { icon: Moon, code: "SLP", accent: "#818CF8" },
  cognitive: { icon: Brain, code: "FCS", accent: "#C084FC" },
  health: { icon: Shield, code: "HLT", accent: "#4ADE80" },
};

const CATEGORY_LABELS = {
  en: { performance: "Performance", muscle: "Muscle Growth", recovery: "Recovery", sleep: "Sleep", cognitive: "Cognitive Function", health: "General Health" },
  el: { performance: "Απόδοση", muscle: "Μυϊκή Ανάπτυξη", recovery: "Ανάρρωση", sleep: "Ύπνος", cognitive: "Γνωστική Λειτουργία", health: "Γενική Υγεία" },
  es: { performance: "Rendimiento", muscle: "Crecimiento Muscular", recovery: "Recuperación", sleep: "Sueño", cognitive: "Función Cognitiva", health: "Salud General" },
  no: { performance: "Ytelse", muscle: "Muskelvekst", recovery: "Restitusjon", sleep: "Søvn", cognitive: "Kognitiv Funksjon", health: "Generell Helse" },
};

const EVIDENCE_LEVELS = { High: 3, Moderate: 2, Limited: 1 };
const EVIDENCE_SCORE = { High: 90, Moderate: 65, Limited: 40 };

export const INGREDIENTS = [
  { id: "creatine", category: "muscle", tags: [], timingSlot: "anytime", evidence: "High", research: [{ headline: "Meta-analysis confirms consistent strength gains under 50", takeaway: "A 2024 systematic review and meta-analysis in adults under 50 found creatine plus resistance training significantly increased both upper- and lower-body strength versus placebo, with somewhat larger gains in men than women.", tag: "Meta-Analysis, 2024" }, { headline: "A single high dose eased cognitive decline from sleep loss", takeaway: "A 2024 study in Scientific Reports found a single high dose of creatine measurably improved cognitive performance during a night of sleep deprivation, peaking around four hours later; a 2026 follow-up in Nutrients found even a lower dose helped.", tag: "Clinical Trial, 2024–2026" }], goals: ["strength", "muscle mass", "performance"], mechanism: "Increases phosphocreatine stores in muscle, allowing faster ATP regeneration during short, intense effort. Also supports cellular hydration, linked to muscle-building signals.", benefits: ["Increased strength and explosiveness", "Faster recovery between sets", "Supports cognitive function under fatigue"], dosage: "3–5 g daily, taken consistently", timing: "Any time of day — consistency matters more than timing", cautions: "Safe for most healthy adults. Possible mild water retention at first.", i18n: { en: { name: "Creatine Monohydrate", tagline: "The most studied supplement in sports science." }, el: { name: "Κρεατίνη Μονοϋδρική", tagline: "Το πιο μελετημένο συμπλήρωμα στον χώρο της άθλησης.", goals: ["δύναμη", "μυϊκή μάζα", "απόδοση"], mechanism: "Αυξάνει τα αποθέματα φωσφοκρεατίνης στους μύες, επιτρέποντας ταχύτερη αναπλήρωση ATP σε έντονη, σύντομη προσπάθεια. Στηρίζει και κυτταρική ενυδάτωση, συνδεδεμένη με σήματα μυϊκής σύνθεσης.", benefits: ["Αύξηση δύναμης και εκρηκτικότητας", "Ταχύτερη ανάκαμψη μεταξύ σετ", "Στήριξη γνωστικής λειτουργίας υπό κόπωση"], dosage: "3–5 g ημερησίως, σταθερά", timing: "Οποιαδήποτε ώρα — η συνέπεια μετράει περισσότερο", cautions: "Ασφαλής για υγιείς ενήλικες. Πιθανή ήπια κατακράτηση νερού αρχικά.", research: [{ headline: "Μετα-ανάλυση επιβεβαιώνει σταθερά κέρδη δύναμης σε ενήλικες <50", takeaway: "Μια συστηματική ανασκόπηση και μετα-ανάλυση του 2024 σε ενήλικες κάτω των 50 βρήκε ότι η κρεατίνη με προπόνηση αντιστάσεων αύξησε σημαντικά τη δύναμη άνω και κάτω σώματος έναντι εικονικού φαρμάκου, με κάπως μεγαλύτερα οφέλη στους άνδρες.", tag: "Μετα-ανάλυση, 2024" }, { headline: "Μία υψηλή δόση μείωσε τη γνωστική επιβάρυνση από στέρηση ύπνου", takeaway: "Μια μελέτη του 2024 στο Scientific Reports βρήκε ότι μία εφάπαξ υψηλή δόση κρεατίνης βελτίωσε μετρήσιμα τη γνωστική απόδοση σε ολονύκτια στέρηση ύπνου, με μέγιστο αποτέλεσμα περίπου 4 ώρες μετά· μια συνέχεια του 2026 στο Nutrients βρήκε όφελος και σε χαμηλότερη δόση.", tag: "Κλινική Μελέτη, 2024–2026" }] }, es: { name: "Creatina Monohidratada", tagline: "El suplemento más estudiado en la ciencia del deporte." }, no: { name: "Kreatin Monohydrat", tagline: "Det mest studerte kosttilskuddet innen idrettsvitenskap." } } },
  { id: "whey", category: "muscle", tags: [], timingSlot: "post-workout", evidence: "High", research: [{ headline: "Higher leucine content explains its edge over casein", takeaway: "Comparative studies find whey's higher leucine content triggers a faster, larger rise in muscle protein synthesis after exercise than casein, largely due to its more rapid digestion.", tag: "Comparative Studies" }, { headline: "Meta-analysis links it to improved protein synthesis signaling", takeaway: "A 2025 systematic review and meta-analysis found whey protein supplementation combined with exercise measurably increased markers of muscle protein synthesis via the AKT/mTOR signaling pathway in healthy adults.", tag: "Meta-Analysis, 2025" }], goals: ["muscle mass", "recovery", "satiety"], mechanism: "Rich in essential amino acids, especially leucine, which activates the mTOR pathway and stimulates muscle protein synthesis.", benefits: ["Convenient way to hit daily protein targets", "Supports post-workout recovery", "High leucine content vs. other sources"], dosage: "20–40 g per serving", timing: "Post-workout, or whenever there's a gap in protein intake", cautions: "May cause issues for those with lactose intolerance; low-lactose isolates are available.", i18n: { en: { name: "Whey Protein", tagline: "A fast-absorbing source of complete protein." }, el: { name: "Πρωτεΐνη Ορού Γάλακτος", tagline: "Ταχέως απορροφήσιμη πηγή πλήρους πρωτεΐνης.", goals: ["μυϊκή μάζα", "ανάρρωση", "κορεσμός"], mechanism: "Πλούσια σε βασικά αμινοξέα, ιδίως λευκίνη, που ενεργοποιεί το μονοπάτι mTOR και διεγείρει τη μυϊκή πρωτεϊνοσύνθεση.", benefits: ["Πρακτική κάλυψη ημερήσιου στόχου πρωτεΐνης", "Στήριξη ανάκαμψης μετά την προπόνηση", "Υψηλή λευκίνη σε σχέση με άλλες πηγές"], dosage: "20–40 g ανά μερίδα", timing: "Μετά την προπόνηση ή όποτε υπάρχει κενό πρωτεΐνης", cautions: "Δυσανεξία σε άτομα με δυσανεξία λακτόζης· υπάρχουν ισολάτες χαμηλής λακτόζης.", research: [{ headline: "Η υψηλότερη λευκίνη εξηγεί το προβάδισμα έναντι της καζεΐνης", takeaway: "Συγκριτικές μελέτες δείχνουν ότι η υψηλότερη περιεκτικότητα της whey σε λευκίνη προκαλεί ταχύτερη και μεγαλύτερη άνοδο στη μυϊκή πρωτεϊνοσύνθεση μετά την άσκηση σε σχέση με την καζεΐνη, κυρίως λόγω ταχύτερης πέψης.", tag: "Συγκριτικές Μελέτες" }, { headline: "Μετα-ανάλυση τη συνδέει με βελτιωμένη σηματοδότηση πρωτεϊνοσύνθεσης", takeaway: "Μια συστηματική ανασκόπηση και μετα-ανάλυση του 2025 βρήκε ότι η συμπλήρωση whey σε συνδυασμό με άσκηση αύξησε μετρήσιμα δείκτες μυϊκής πρωτεϊνοσύνθεσης μέσω του μονοπατιού AKT/mTOR σε υγιείς ενήλικες.", tag: "Μετα-ανάλυση, 2025" }] }, es: { name: "Proteína de Suero de Leche", tagline: "Una fuente de proteína completa de absorción rápida." }, no: { name: "Myseprotein", tagline: "En raskt absorberende kilde til komplett protein." } } },
  { id: "caffeine", category: "performance", tags: ["stimulant"], timingSlot: "pre-workout", evidence: "High", research: [{ headline: "Meta-analyses confirm real gains in cycling and jump performance", takeaway: "A 2026 meta-analysis of 20 cycling studies found caffeine significantly reduced time-trial completion time and increased mean power output; other reviews report similar small but consistent gains in jump height and high-intensity interval performance.", tag: "Meta-Analysis, 2026" }, { headline: "Effects on team-sport skills are smaller and less consistent", takeaway: "A meta-analysis in female team-sport athletes found caffeine improved countermovement jump and sport-specific skills, but showed no significant effect on perceived exertion, agility, or repeated sprint ability.", tag: "Meta-Analysis" }], goals: ["energy", "alertness", "performance"], mechanism: "Blocks adenosine receptors in the central nervous system, reducing perceived fatigue and increasing alertness and neuromuscular drive.", benefits: ["Improved endurance and perceived exertion", "Increased alertness/focus", "Small improvement in strength/power"], dosage: "3–6 mg per kg of body weight", timing: "30–60 minutes before training", cautions: "Can disrupt sleep if taken late. Tolerance builds with regular use.", i18n: { en: { name: "Caffeine", tagline: "The world's most widely used performance enhancer." }, el: { name: "Καφεΐνη", tagline: "Το πιο διαδεδομένο εργογόνο βοήθημα παγκοσμίως.", goals: ["ενέργεια", "εγρήγορση", "απόδοση"], mechanism: "Ανταγωνίζεται τους υποδοχείς αδενοσίνης στο ΚΝΣ, μειώνοντας την αντιληπτή κόπωση και αυξάνοντας εγρήγορση και νευρομυϊκή διέγερση.", benefits: ["Βελτίωση αντοχής και αντιληπτής προσπάθειας", "Αυξημένη εγρήγορση/συγκέντρωση", "Μικρή βελτίωση δύναμης/ισχύος"], dosage: "3–6 mg/κιλό σωματικού βάρους", timing: "30–60 λεπτά πριν την προπόνηση", cautions: "Διαταραχή ύπνου αν λαμβάνεται αργά. Ανεκτικότητα με τακτική χρήση.", research: [{ headline: "Μετα-αναλύσεις επιβεβαιώνουν πραγματικά οφέλη σε ποδηλασία και άλμα", takeaway: "Μια μετα-ανάλυση του 2026 σε 20 μελέτες ποδηλασίας βρήκε ότι η καφεΐνη μείωσε σημαντικά τον χρόνο time-trial και αύξησε τη μέση ισχύ· άλλες ανασκοπήσεις αναφέρουν παρόμοια μικρή αλλά σταθερή βελτίωση σε άλμα και διαλειμματική άσκηση υψηλής έντασης.", tag: "Μετα-ανάλυση, 2026" }, { headline: "Τα οφέλη σε αθλήματα ομάδας είναι μικρότερα και λιγότερο σταθερά", takeaway: "Μια μετα-ανάλυση σε αθλήτριες ομαδικών αθλημάτων βρήκε βελτίωση σε κάθετο άλμα και εξειδικευμένες δεξιότητες, αλλά καμία σημαντική επίδραση σε αντιληπτή κόπωση, ευκινησία ή επαναλαμβανόμενα σπριντ.", tag: "Μετα-ανάλυση" }] }, es: { name: "Cafeína", tagline: "El potenciador del rendimiento más usado del mundo." }, no: { name: "Koffein", tagline: "Verdens mest brukte prestasjonsfremmende middel." } } },
  { id: "beta-alanine", category: "performance", tags: [], timingSlot: "pre-workout", evidence: "Moderate", research: [{ headline: "Meta-analyses converge on the 1–4 minute window", takeaway: "Multiple meta-analyses find beta-alanine's clearest benefit in maximal efforts lasting roughly 60–240 seconds, translating to small but meaningful performance gains, more pronounced in non-elite than elite athletes.", tag: "Meta-Analysis" }, { headline: "Carnosine response is remarkably consistent across people", takeaway: "A Bayesian meta-analysis found that over 99% of participants show a measurable rise in muscle carnosine after beta-alanine supplementation, though the size of that rise varies by dose and duration.", tag: "Meta-Analysis" }], goals: ["performance", "endurance"], mechanism: "Raises intramuscular carnosine, which helps buffer acidity that builds up during 1–4 minute high-intensity efforts.", benefits: ["Delays muscular fatigue", "Possible improvement in training volume"], dosage: "3.2–6.4 g daily, in split doses", timing: "Any time — effect builds cumulatively over weeks", cautions: "Mild skin tingling (paresthesia) at high single doses.", i18n: { en: { name: "Beta-Alanine", tagline: "A muscle acid buffer for sustained high-intensity effort." }, el: { name: "Βήτα-Αλανίνη", tagline: "Ρυθμιστής οξύτητας στους μύες για παρατεταμένη προσπάθεια.", goals: ["απόδοση", "αντοχή"], mechanism: "Αυξάνει την ενδομυϊκή καρνοσίνη, που βοηθά στην εξουδετέρωση οξύτητας σε άσκηση υψηλής έντασης 1–4 λεπτών.", benefits: ["Καθυστέρηση μυϊκής κόπωσης", "Πιθανή βελτίωση όγκου προπόνησης"], dosage: "3.2–6.4 g ημερησίως, σε δόσεις", timing: "Οποιαδήποτε ώρα — σωρευτικό αποτέλεσμα σε εβδομάδες", cautions: "Ήπιο μυρμήγκιασμα δέρματος (παραισθησία) σε υψηλές εφάπαξ δόσεις.", research: [{ headline: "Οι μετα-αναλύσεις συγκλίνουν στο παράθυρο του 1-4 λεπτού", takeaway: "Πολλαπλές μετα-αναλύσεις εντοπίζουν το σαφέστερο όφελος της βήτα-αλανίνης σε μέγιστες προσπάθειες 60-240 δευτερολέπτων, με μικρά αλλά ουσιαστικά κέρδη απόδοσης, πιο έντονα σε μη-elite παρά σε elite αθλητές.", tag: "Μετα-ανάλυση" }, { headline: "Η απόκριση καρνοσίνης είναι αξιοσημείωτα σταθερή μεταξύ ατόμων", takeaway: "Μια Bayesian μετα-ανάλυση βρήκε ότι πάνω από το 99% των συμμετεχόντων εμφανίζουν μετρήσιμη αύξηση μυϊκής καρνοσίνης μετά τη συμπλήρωση βήτα-αλανίνης, αν και το μέγεθος διαφέρει ανάλογα με τη δόση και διάρκεια.", tag: "Μετα-ανάλυση" }] }, es: { name: "Beta-Alanina", tagline: "Un amortiguador de ácido muscular para esfuerzo sostenido de alta intensidad." }, no: { name: "Beta-Alanin", tagline: "En muskelsyre-buffer for vedvarende høyintensiv innsats." } } },
  { id: "citrulline", category: "performance", tags: ["nitric-oxide"], timingSlot: "pre-workout", evidence: "Moderate", research: [{ headline: "Meta-analyses find a small but real strength benefit", takeaway: "A comprehensive 2025 meta-analysis of 30 randomized trials found citrulline malate modestly improves resistance training performance, with effects varying by dose and training status.", tag: "Meta-Analysis, 2025" }, { headline: "Effect size is small by scientific standards", takeaway: "Earlier meta-analyses (2019-2021) found effect sizes translating to roughly 3 extra repetitions to failure per set — real, but modest.", tag: "Meta-Analysis" }], goals: ["performance", "endurance", "blood flow"], mechanism: "Converts to arginine and then nitric oxide, widening blood vessels and supporting oxygen/nutrient delivery to working muscles.", benefits: ["Reduced perceived exertion across sets", "Possible increase in training volume"], dosage: "6–8 g daily", timing: "30–60 minutes before training", cautions: "Generally well tolerated; occasional mild GI discomfort.", i18n: { en: { name: "Citrulline Malate", tagline: "An arginine precursor for improved blood flow." }, el: { name: "Κιτρουλλίνη Μηλικό", tagline: "Πρόδρομος αργινίνης για βελτιωμένη αιματική ροή.", goals: ["απόδοση", "αντοχή", "αιμάτωση"], mechanism: "Μετατρέπεται σε αργινίνη και μετά σε νιτρικό οξείδιο, διευρύνοντας αγγεία και υποστηρίζοντας παροχή οξυγόνου στους μύες.", benefits: ["Μείωση αντιληπτής κόπωσης σε σετ", "Πιθανή αύξηση όγκου προπόνησης"], dosage: "6–8 g ημερησίως", timing: "30–60 λεπτά πριν την προπόνηση", cautions: "Γενικά καλά ανεκτή, σπάνια ήπια γαστρεντερική δυσφορία.", research: [{ headline: "Οι μετα-αναλύσεις βρίσκουν μικρό αλλά πραγματικό όφελος δύναμης", takeaway: "Μια εκτενής μετα-ανάλυση του 2025 σε 30 τυχαιοποιημένες δοκιμές βρήκε ότι η κιτρουλλίνη μηλικό βελτιώνει ελαφρώς την απόδοση στην προπόνηση αντιστάσεων.", tag: "Μετα-ανάλυση, 2025" }, { headline: "Το μέγεθος του οφέλους είναι μικρό", takeaway: "Παλαιότερες μετα-αναλύσεις (2019-2021) βρήκαν μεγέθη επίδρασης που μεταφράζονται σε περίπου 3 επιπλέον επαναλήψεις μέχρι εξάντληση.", tag: "Μετα-ανάλυση" }] }, es: { name: "Malato de Citrulina", tagline: "Un precursor de arginina para mejorar el flujo sanguíneo." }, no: { name: "Citrullinmalat", tagline: "En arginin-forløper for bedre blodgjennomstrømning." } } },
  { id: "magnesium", category: "sleep", tags: ["calming"], timingSlot: "evening", evidence: "Moderate", research: [{ headline: "Benefit shows up mainly in people who are actually low", takeaway: "A 2024 randomized trial found magnesium bisglycinate modestly improved insomnia scores, with the biggest gains in people who started with lower dietary magnesium intake.", tag: "Randomized Trial, 2024" }, { headline: "Older meta-analyses found the evidence too thin", takeaway: "A meta-analysis pooling 3 randomized trials in older adults found only a modest, statistically insignificant improvement in sleep time.", tag: "Meta-Analysis" }], goals: ["sleep", "relaxation", "recovery"], mechanism: "Involved in neuromuscular function and the GABA system. Deficiency is linked to cramps and disrupted sleep.", benefits: ["Supports sleep quality", "Possible reduction in muscle cramps", "General neuromuscular function"], dosage: "200–400 mg daily (glycinate/citrate forms)", timing: "Evening, 30–60 minutes before bed", cautions: "High doses of the oxide form can cause loose stools.", i18n: { en: { name: "Magnesium", tagline: "A mineral co-factor in hundreds of enzyme reactions." }, el: { name: "Μαγνήσιο", tagline: "Ορυκτό-συμπαράγοντας σε εκατοντάδες ενζυμικές αντιδράσεις.", goals: ["ύπνος", "χαλάρωση", "ανάρρωση"], mechanism: "Συμμετέχει στη νευρομυϊκή λειτουργία και το σύστημα GABA. Η ανεπάρκεια συνδέεται με κράμπες και διαταραγμένο ύπνο.", benefits: ["Στήριξη ποιότητας ύπνου", "Πιθανή μείωση μυϊκών κραμπών", "Γενική νευρομυϊκή λειτουργία"], dosage: "200–400 mg ημερησίως (γλυκινικό/κιτρικό)", timing: "Βράδυ, 30–60' πριν τον ύπνο", cautions: "Υψηλές δόσεις οξειδίου μπορεί να προκαλέσουν χαλαρή κένωση.", research: [{ headline: "Το όφελος εμφανίζεται κυρίως σε όσους έχουν πραγματικά χαμηλά επίπεδα", takeaway: "Μια τυχαιοποιημένη δοκιμή του 2024 βρήκε ότι το γλυκινικό μαγνήσιο βελτίωσε ελαφρώς τη βαθμολογία αϋπνίας, με τα μεγαλύτερα οφέλη σε όσους ξεκίνησαν με χαμηλότερη πρόσληψη.", tag: "Τυχαιοποιημένη Δοκιμή, 2024" }, { headline: "Παλαιότερες μετα-αναλύσεις χαρακτήρισαν τα στοιχεία ανεπαρκή", takeaway: "Μια μετα-ανάλυση 3 δοκιμών σε ηλικιωμένους βρήκε μόνο μια μέτρια, στατιστικά μη σημαντική βελτίωση στον χρόνο ύπνου.", tag: "Μετα-ανάλυση" }] }, es: { name: "Magnesio", tagline: "Un cofactor mineral en cientos de reacciones enzimáticas." }, no: { name: "Magnesium", tagline: "En mineral-kofaktor i hundrevis av enzymreaksjoner." } } },
  { id: "vitamin-d3", category: "health", tags: [], timingSlot: "morning", evidence: "High", research: [{ headline: "Deficiency affects roughly a third of Europeans", takeaway: "Population data across Europe consistently show 30-60% of adults testing below recommended vitamin D levels, rising further in winter and among institutionalized older adults.", tag: "Population Data" }, { headline: "Respiratory infection protection is strongest in the deficient", takeaway: "A pooled analysis of randomized trials found daily vitamin D reduced acute respiratory infection risk, with the clearest benefit in people who started out deficient.", tag: "Meta-Analysis" }], goals: ["immune", "bones", "general health"], mechanism: "Functions more like a hormone — regulates calcium absorption, bone density, and affects immune and muscle function.", benefits: ["Supports bone health", "Supports immune function", "Linked to muscle function"], dosage: "1000–2000 IU daily", timing: "With a meal containing fat", cautions: "Fat-soluble — avoid excessive long-term dosing without monitoring.", i18n: { en: { name: "Vitamin D3", tagline: "The 'sunshine vitamin' — often low in modern life." }, el: { name: "Βιταμίνη D3", tagline: "Η «βιταμίνη του ήλιου» — συχνά ανεπαρκής σήμερα.", goals: ["ανοσοποιητικό", "οστά", "γενική υγεία"], mechanism: "Λειτουργεί σαν ορμόνη· ρυθμίζει απορρόφηση ασβεστίου, οστική πυκνότητα, ανοσολογικές και μυϊκές λειτουργίες.", benefits: ["Στήριξη οστικής υγείας", "Στήριξη ανοσοποιητικού", "Σύνδεση με μυϊκή λειτουργία"], dosage: "1000–2000 IU ημερησίως", timing: "Με γεύμα που περιέχει λίπος", cautions: "Λιποδιαλυτή — αποφυγή υπερβολικών δόσεων χωρίς παρακολούθηση.", research: [{ headline: "Η ανεπάρκεια αφορά περίπου το ένα τρίτο των Ευρωπαίων", takeaway: "Πληθυσμιακά δεδομένα σε όλη την Ευρώπη δείχνουν σταθερά ότι το 30-60% των ενηλίκων έχει επίπεδα κάτω από τα συνιστώμενα, ειδικά τον χειμώνα.", tag: "Πληθυσμιακά Δεδομένα" }, { headline: "Η προστασία από αναπνευστικές λοιμώξεις είναι ισχυρότερη σε όσους έχουν ανεπάρκεια", takeaway: "Μια συγκεντρωτική ανάλυση τυχαιοποιημένων δοκιμών βρήκε ότι η καθημερινή βιταμίνη D μείωσε τον κίνδυνο οξείας αναπνευστικής λοίμωξης.", tag: "Μετα-ανάλυση" }] }, es: { name: "Vitamina D3", tagline: "La 'vitamina del sol' — a menudo baja en la vida moderna." }, no: { name: "Vitamin D3", tagline: "'Solskinnsvitaminet' — ofte for lavt i det moderne liv." } } },
  { id: "omega3", category: "health", tags: ["blood-thinning"], timingSlot: "anytime", evidence: "High", research: [{ headline: "Muscle soreness reduction is real but too small to notice", takeaway: "A meta-analysis of randomized trials found omega-3 reduced muscle soreness after eccentric exercise, but the effect fell below the threshold most people would feel.", tag: "Meta-Analysis" }, { headline: "Inflammation markers respond more clearly than soreness", takeaway: "A separate meta-analysis of 8 trials found omega-3 measurably lowered inflammatory markers after exercise-induced muscle damage, even where soreness didn't change much.", tag: "Meta-Analysis" }], goals: ["heart health", "inflammation"], mechanism: "EPA/DHA integrate into cell membranes, affecting inflammation, lipid profile, and brain function.", benefits: ["Supports cardiovascular health", "May reduce post-exercise inflammation", "Supports cognitive function"], dosage: "1–3 g combined EPA/DHA daily", timing: "With a meal", cautions: "Very high doses may have a mild blood-thinning effect.", i18n: { en: { name: "Omega-3 (EPA/DHA)", tagline: "Essential fats your body can't make on its own." }, el: { name: "Ωμέγα-3 (EPA/DHA)", tagline: "Απαραίτητα λιπαρά που το σώμα δεν παράγει μόνο του.", goals: ["καρδιαγγειακή υγεία", "φλεγμονή"], mechanism: "Το EPA/DHA ενσωματώνονται στις κυτταρικές μεμβράνες, επηρεάζοντας φλεγμονή, λιπιδαιμικό προφίλ και εγκεφαλική λειτουργία.", benefits: ["Στήριξη καρδιαγγειακής υγείας", "Μείωση φλεγμονής μετά από άσκηση", "Στήριξη γνωστικής λειτουργίας"], dosage: "1–3 g συνδυασμένου EPA/DHA", timing: "Με γεύμα", cautions: "Πολύ υψηλές δόσεις: πιθανή αντιπηκτική δράση.", research: [{ headline: "Η μείωση μυϊκού πόνου είναι πραγματική αλλά πολύ μικρή για να γίνει αισθητή", takeaway: "Μια μετα-ανάλυση βρήκε ότι τα ωμέγα-3 μείωσαν τον μυϊκό πόνο μετά από έκκεντρη άσκηση, αλλά κάτω από το όριο που θα γινόταν αισθητό.", tag: "Μετα-ανάλυση" }, { headline: "Οι δείκτες φλεγμονής ανταποκρίνονται πιο καθαρά από τον πόνο", takeaway: "Μια ξεχωριστή μετα-ανάλυση 8 δοκιμών βρήκε ότι τα ωμέγα-3 μείωσαν μετρήσιμα τους φλεγμονώδεις δείκτες μετά από μυϊκή βλάβη.", tag: "Μετα-ανάλυση" }] }, es: { name: "Omega-3 (EPA/DHA)", tagline: "Grasas esenciales que tu cuerpo no puede producir por sí solo." }, no: { name: "Omega-3 (EPA/DHA)", tagline: "Essensielle fettstoffer kroppen ikke kan lage selv." } } },
  { id: "melatonin", category: "sleep", tags: ["sedative"], timingSlot: "evening", evidence: "Moderate", research: [{ headline: "Cochrane review confirms a strong jet lag benefit", takeaway: "A Cochrane review of 10 trials found melatonin taken near destination bedtime reduced jet lag from flights crossing 5+ time zones in 9 of 10 studies.", tag: "Cochrane Review" }, { headline: "Dose-response research points to 4mg as the sweet spot", takeaway: "A 2024 dose-response meta-analysis found melatonin's sleep benefits increase gradually with dose, peaking around 4mg per day.", tag: "Meta-Analysis, 2024" }], goals: ["sleep", "jet lag"], mechanism: "Naturally released in response to darkness; supplementing helps regulate circadian rhythm rather than directly 'sedating.'", benefits: ["Reduces time to fall asleep", "Useful for jet lag/shift work"], dosage: "0.5–3 mg", timing: "30–60 minutes before desired sleep time", cautions: "Possible morning grogginess at high doses.", i18n: { en: { name: "Melatonin", tagline: "The hormone that signals it's time to sleep." }, el: { name: "Μελατονίνη", tagline: "Η ορμόνη που σηματοδοτεί ότι είναι ώρα για ύπνο.", goals: ["ύπνος", "jet lag"], mechanism: "Εκκρίνεται φυσικά ως απόκριση στο σκοτάδι· η λήψη βοηθά στη ρύθμιση κιρκάδιου ρυθμού, όχι άμεση «καταστολή».", benefits: ["Μείωση χρόνου έναρξης ύπνου", "Χρήσιμη για jet lag/βάρδιες"], dosage: "0.5–3 mg", timing: "30–60' πριν τον ύπνο", cautions: "Πιθανή πρωινή υπνηλία σε υψηλές δόσεις.", research: [{ headline: "Ανασκόπηση Cochrane επιβεβαιώνει ισχυρό όφελος για το jet lag", takeaway: "Μια ανασκόπηση Cochrane 10 δοκιμών βρήκε ότι η μελατονίνη κοντά στην ώρα ύπνου στον προορισμό μείωσε το jet lag σε 9 από τις 10 μελέτες.", tag: "Ανασκόπηση Cochrane" }, { headline: "Η έρευνα δοσολογίας δείχνει τα 4mg ως ιδανικό σημείο", takeaway: "Μια μετα-ανάλυση δόσης-απόκρισης του 2024 βρήκε ότι τα οφέλη ύπνου αυξάνονται σταδιακά με τη δόση, κορυφώνονται γύρω στα 4mg ημερησίως.", tag: "Μετα-ανάλυση, 2024" }] }, es: { name: "Melatonina", tagline: "La hormona que indica que es hora de dormir." }, no: { name: "Melatonin", tagline: "Hormonet som signaliserer at det er tid for søvn." } } },
  { id: "zma", category: "recovery", tags: ["calming"], timingSlot: "evening", evidence: "Limited", research: [{ headline: "The original hype study was funded by the patent holder", takeaway: "The 2000 study that launched ZMA's popularity, reporting a 33% testosterone increase, was funded by the company holding the ZMA patent.", tag: "Industry-Funded Study, 2000" }, { headline: "Independent replication found no effect at all", takeaway: "A 2004 independent replication in resistance-trained men found no significant change in testosterone, strength, or body composition.", tag: "Independent Replication, 2004" }], goals: ["sleep", "recovery"], mechanism: "Combines zinc, magnesium, and B6 — nutrients involved in enzymatic function, sleep, and hormonal regulation when a deficiency exists.", benefits: ["Covers potential deficiencies", "Possible sleep support"], dosage: "~30mg Zn / 450mg Mg / 10mg B6", timing: "Evening, on an empty stomach", cautions: "Benefits beyond correcting a deficiency are weakly supported.", i18n: { en: { name: "ZMA", tagline: "A popular combo with debated extra benefits." }, el: { name: "ZMA", tagline: "Δημοφιλής συνδυασμός με αμφιλεγόμενα πρόσθετα οφέλη.", goals: ["ύπνος", "ανάρρωση"], mechanism: "Συνδυάζει ψευδάργυρο, μαγνήσιο, Β6 — θρεπτικά με ρόλο σε ενζυμική λειτουργία, ύπνο και ορμονική ρύθμιση όταν υπάρχει ανεπάρκεια.", benefits: ["Κάλυψη πιθανών ελλείψεων", "Πιθανή στήριξη ύπνου"], dosage: "~30mg Zn / 450mg Mg / 10mg B6", timing: "Βράδυ, με άδειο στομάχι", cautions: "Οφέλη πέρα από διόρθωση ανεπάρκειας ασθενώς τεκμηριωμένα.", research: [{ headline: "Η αρχική μελέτη-πυροδότηση χρηματοδοτήθηκε από τον κάτοχο της πατέντας", takeaway: "Η μελέτη του 2000 που εκτόξευσε τη δημοτικότητα του ZMA, αναφέροντας αύξηση τεστοστερόνης 33%, χρηματοδοτήθηκε από την εταιρεία-κάτοχο της πατέντας.", tag: "Μελέτη Χρηματοδοτούμενη από Βιομηχανία, 2000" }, { headline: "Ανεξάρτητη επανάληψη δεν βρήκε καμία επίδραση", takeaway: "Μια ανεξάρτητη επανάληψη του 2004 σε προπονημένους άνδρες δεν βρήκε σημαντική αλλαγή σε τεστοστερόνη, δύναμη ή σύσταση σώματος.", tag: "Ανεξάρτητη Επανάληψη, 2004" }] }, es: { name: "ZMA", tagline: "Una combinación popular con beneficios extra debatidos." }, no: { name: "ZMA", tagline: "En populær kombinasjon med omdiskuterte tilleggseffekter." } } },
  { id: "bcaa", category: "recovery", tags: [], timingSlot: "pre-workout", evidence: "Limited", research: [{ headline: "Mechanistic research shows why whole protein wins", takeaway: "A detailed review found BCAA can activate muscle-building signaling, but the resulting protein synthesis response is smaller than a complete protein source triggers.", tag: "Narrative Review" }, { headline: "Soreness reduction shows up vs placebo, not vs protein", takeaway: "A meta-analysis found BCAA reduced soreness markers after resistance exercise compared to placebo, but most studies didn't compare it against whey or another complete protein.", tag: "Meta-Analysis" }], goals: ["recovery", "muscle mass"], mechanism: "Leucine, isoleucine, valine — involved in muscle protein synthesis, though leucine alone (already in whey) appears to be the main driver.", benefits: ["Useful for fasted training", "Alternative form of amino acid intake"], dosage: "5–10 g per serving", timing: "Around training", cautions: "Marginal added benefit if daily protein is already sufficient.", i18n: { en: { name: "BCAA", tagline: "Popular, but often redundant if protein intake is covered." }, el: { name: "BCAA", tagline: "Δημοφιλή, αλλά συχνά περιττά αν καλύπτεται η πρωτεΐνη.", goals: ["ανάρρωση", "μυϊκή μάζα"], mechanism: "Λευκίνη, ισολευκίνη, βαλίνη — εμπλέκονται στη μυϊκή πρωτεϊνοσύνθεση, όμως η λευκίνη μόνη (ήδη στη whey) φαίνεται ο κύριος μοχλός.", benefits: ["Χρήσιμο σε προπόνηση νηστείας", "Εναλλακτική μορφή αμινοξέων"], dosage: "5–10 g ανά δόση", timing: "Γύρω από την προπόνηση", cautions: "Οριακό όφελος αν η ημερήσια πρωτεΐνη είναι ήδη επαρκής.", research: [{ headline: "Η μηχανιστική έρευνα δείχνει γιατί κερδίζει η πλήρης πρωτεΐνη", takeaway: "Μια αναλυτική ανασκόπηση βρήκε ότι τα BCAA ενεργοποιούν τη σηματοδότηση μυϊκής ανάπτυξης, αλλά λιγότερο από μια πλήρη πηγή πρωτεΐνης.", tag: "Αφηγηματική Ανασκόπηση" }, { headline: "Η μείωση πόνου εμφανίζεται έναντι εικονικού φαρμάκου, όχι έναντι πρωτεΐνης", takeaway: "Μια μετα-ανάλυση βρήκε ότι τα BCAA μείωσαν δείκτες πόνου σε σχέση με εικονικό φάρμακο, αλλά σπάνια συγκρίθηκαν με whey.", tag: "Μετα-ανάλυση" }] }, es: { name: "BCAA", tagline: "Populares, pero a menudo innecesarios si la proteína ya está cubierta." }, no: { name: "BCAA", tagline: "Populært, men ofte overflødig hvis proteininntaket er dekket." } } },
  { id: "ashwagandha", category: "health", tags: ["calming"], timingSlot: "evening", evidence: "Moderate", research: [{ headline: "Meta-analyses consistently confirm cortisol reduction", takeaway: "Multiple 2024-2025 meta-analyses of randomized trials confirm ashwagandha significantly lowers cortisol and perceived stress scores versus placebo, typically over 8 weeks.", tag: "Meta-Analysis, 2024-2025" }, { headline: "An 8-week trial found real strength gains alongside stress relief", takeaway: "A randomized trial in young men found ashwagandha combined with resistance training nearly doubled strength gains on bench press versus placebo.", tag: "Randomized Trial" }], goals: ["stress", "sleep", "recovery"], mechanism: "An 'adaptogen' — supports regulation of the body's stress axis (cortisol). Also studied for effects on strength/body composition.", benefits: ["Reduces perceived stress", "Improves sleep quality", "Studied for strength/recovery"], dosage: "300–600 mg extract daily (standardized to withanolides)", timing: "With a meal, or in the evening", cautions: "Avoid during pregnancy; possible interaction with thyroid medication.", i18n: { en: { name: "Ashwagandha", tagline: "An adaptogenic herb with a long traditional history." }, el: { name: "Ashwagandha", tagline: "Προσαρμογόνο βότανο με μακρά παραδοσιακή χρήση.", goals: ["στρες", "ύπνος", "ανάρρωση"], mechanism: "«Προσαρμογόνο» — υποστηρίζει τη ρύθμιση του άξονα στρες (κορτιζόλη). Ερευνάται και σε δύναμη/σύνθεση σώματος.", benefits: ["Μείωση αντιληπτού στρες", "Βελτίωση ποιότητας ύπνου", "Ερευνάται για δύναμη/ανάκαμψη"], dosage: "300–600 mg εκχυλίσματος (τυποπ. σε withanolides)", timing: "Με γεύμα, ή βράδυ", cautions: "Αποφυγή σε εγκυμοσύνη· πιθανή αλληλεπίδραση με θυρεοειδικά φάρμακα.", research: [{ headline: "Οι μετα-αναλύσεις επιβεβαιώνουν σταθερά τη μείωση κορτιζόλης", takeaway: "Πολλαπλές μετα-αναλύσεις του 2024-2025 επιβεβαιώνουν ότι η ashwagandha μειώνει σημαντικά την κορτιζόλη και το αντιληπτό στρες σε σχέση με εικονικό φάρμακο.", tag: "Μετα-ανάλυση, 2024-2025" }, { headline: "Δοκιμή 8 εβδομάδων βρήκε πραγματικά κέρδη δύναμης παράλληλα με ανακούφιση στρες", takeaway: "Μια τυχαιοποιημένη δοκιμή σε νέους άνδρες βρήκε ότι η ashwagandha σχεδόν διπλασίασε τα κέρδη δύναμης στο πιέσεις πάγκου.", tag: "Τυχαιοποιημένη Δοκιμή" }] }, es: { name: "Ashwagandha", tagline: "Una hierba adaptógena con una larga historia tradicional." }, no: { name: "Ashwagandha", tagline: "En adaptogen urt med lang tradisjonell historie." } } },
  { id: "rhodiola", category: "cognitive", tags: ["stimulant-mild"], timingSlot: "morning", evidence: "Limited", research: [{ headline: "A 2025 meta-analysis of 26 trials found real endurance benefits", takeaway: "A systematic review and meta-analysis of 668 participants found rhodiola improved VO2max, time to exhaustion, and time-trial performance while lowering creatine kinase and lactate.", tag: "Meta-Analysis, 2025" }, { headline: "Earlier reviews couldn't even run a meta-analysis", takeaway: "A 2012 systematic review found existing trials so inconsistent in what they measured that pooling results wasn't possible — the 2025 review is a major upgrade.", tag: "Systematic Review" }], goals: ["stress", "fatigue", "alertness"], mechanism: "Believed to affect neurotransmitters linked to fatigue/stress; the exact mechanism is still under investigation.", benefits: ["Reduces feelings of fatigue", "Studied for endurance"], dosage: "200–400 mg extract", timing: "Morning, or before a demanding activity", cautions: "Possible mild jitteriness in sensitive individuals.", i18n: { en: { name: "Rhodiola", tagline: "A cold-climate herb with adaptogenic properties." }, el: { name: "Ρόδιολα", tagline: "Βότανο ψυχρών περιοχών με προσαρμογόνες ιδιότητες.", goals: ["στρες", "κόπωση", "εγρήγορση"], mechanism: "Πιστεύεται ότι επηρεάζει νευροδιαβιβαστές σχετιζόμενους με κόπωση/στρες· ο μηχανισμός παραμένει υπό διερεύνηση.", benefits: ["Μείωση αίσθησης κόπωσης", "Ερευνάται για αντοχή"], dosage: "200–400 mg εκχυλίσματος", timing: "Πρωί ή πριν από απαιτητική δραστηριότητα", cautions: "Πιθανή ήπια νευρικότητα σε ευαίσθητα άτομα.", research: [{ headline: "Μετα-ανάλυση του 2025 σε 26 δοκιμές βρήκε πραγματικά οφέλη αντοχής", takeaway: "Μια συστηματική ανασκόπηση 668 συμμετεχόντων βρήκε ότι η ρόδιολα βελτίωσε το VO2max, τον χρόνο εξάντλησης και μείωσε την καρνοσίνη και το γαλακτικό.", tag: "Μετα-ανάλυση, 2025" }, { headline: "Παλαιότερες ανασκοπήσεις δεν μπόρεσαν καν να κάνουν μετα-ανάλυση", takeaway: "Μια ανασκόπηση του 2012 βρήκε τις υπάρχουσες δοκιμές τόσο ασυνεπείς που η συγκέντρωση αποτελεσμάτων δεν ήταν εφικτή.", tag: "Συστηματική Ανασκόπηση" }] }, es: { name: "Rodiola", tagline: "Una hierba de clima frío con propiedades adaptógenas." }, no: { name: "Rosenrot", tagline: "En kaldklima-urt med adaptogene egenskaper." } } },
  { id: "glutamine", category: "recovery", tags: [], timingSlot: "anytime", evidence: "Limited", research: [{ headline: "Large meta-analysis found no performance benefit in athletes", takeaway: "A 2018 meta-analysis of 25 trials found glutamine had no effect on athletic performance, body composition, or immune markers in trained individuals.", tag: "Meta-Analysis, 2018" }, { headline: "Strongest evidence comes from hospitals, not gyms", takeaway: "The most robust glutamine research comes from critical-care and trauma medicine, where the body's needs genuinely exceed what it can produce — a different context from healthy training.", tag: "Clinical Research" }], goals: ["recovery", "gut health"], mechanism: "Used heavily by immune cells and gut cells; the body produces enough in healthy, well-fed individuals.", benefits: ["Possible benefit under high stress/catabolism", "Supports gut health in specific cases"], dosage: "5 g, 1–2 times daily", timing: "Any time", cautions: "Evidence for performance/recovery benefits in healthy trainees is weak.", i18n: { en: { name: "L-Glutamine", tagline: "The body's most abundant amino acid — a debated supplement." }, el: { name: "Γλουταμίνη", tagline: "Το πιο άφθονο αμινοξύ στο σώμα — αμφιλεγόμενο ως συμπλήρωμα.", goals: ["ανάρρωση", "έντερο"], mechanism: "Χρησιμοποιείται από ανοσοκύτταρα και κύτταρα εντέρου· το σώμα την παράγει επαρκώς σε υγιή, καλά διατροφημένα άτομα.", benefits: ["Πιθανό όφελος σε υψηλό στρες/κατάλυση", "Στήριξη εντερικής υγείας σε ειδικές περιπτώσεις"], dosage: "5 g, 1–2 φορές ημερησίως", timing: "Οποιαδήποτε ώρα", cautions: "Σε υγιείς ασκούμενους τα στοιχεία απόδοσης είναι ασθενή.", research: [{ headline: "Μεγάλη μετα-ανάλυση δεν βρήκε όφελος απόδοσης σε αθλητές", takeaway: "Μια μετα-ανάλυση του 2018 σε 25 δοκιμές δεν βρήκε καμία επίδραση σε απόδοση, σύσταση σώματος ή ανοσοποιητικό σε προπονημένα άτομα.", tag: "Μετα-ανάλυση, 2018" }, { headline: "Τα ισχυρότερα στοιχεία προέρχονται από νοσοκομεία, όχι γυμναστήρια", takeaway: "Η πιο στέρεη έρευνα προέρχεται από εντατική ιατρική και τραύματα, πλαίσιο πολύ διαφορετικό από την υγιή προπόνηση.", tag: "Κλινική Έρευνα" }] }, es: { name: "L-Glutamina", tagline: "El aminoácido más abundante del cuerpo — un suplemento debatido." }, no: { name: "L-Glutamin", tagline: "Kroppens mest utbredte aminosyre — et omdiskutert tilskudd." } } },
  { id: "l-theanine", category: "cognitive", tags: ["calming"], timingSlot: "anytime", evidence: "Moderate", research: [{ headline: "EEG studies consistently show a distinct alpha-wave signature", takeaway: "Multiple EEG studies confirm L-theanine increases alpha brain wave activity, a marker of relaxed alertness, though effects on cognitive performance alone are inconsistent.", tag: "EEG Studies" }, { headline: "Combined with caffeine, effects on attention become measurable", takeaway: "A study combining low doses of both compounds found the pairing improved attention accuracy in ways neither substance achieved alone.", tag: "Randomized Trial" }], goals: ["alertness", "focus", "relaxation"], mechanism: "Crosses the blood-brain barrier and is linked to increased alpha brain waves — a state of 'calm alertness.' Often paired with caffeine.", benefits: ["Reduces jitteriness from caffeine", "Supports focus without overstimulation"], dosage: "100–200 mg (often 1:1 or 2:1 ratio with caffeine)", timing: "Alongside caffeine", cautions: "Very well tolerated.", i18n: { en: { name: "L-Theanine", tagline: "A tea amino acid that smooths out caffeine." }, el: { name: "L-Θεανίνη", tagline: "Αμινοξύ του τσαγιού που «στρογγυλεύει» την καφεΐνη.", goals: ["εγρήγορση", "εστίαση", "χαλάρωση"], mechanism: "Διαπερνά τον αιματοεγκεφαλικό φραγμό, σχετίζεται με αυξημένα κύματα άλφα — «χαλαρή εγρήγορση». Συχνά με καφεΐνη.", benefits: ["Μείωση νευρικότητας από καφεΐνη", "Στήριξη εστίασης χωρίς υπερδιέγερση"], dosage: "100–200 mg (αναλογία 1:1 ή 2:1 με καφεΐνη)", timing: "Μαζί με καφεΐνη", cautions: "Πολύ καλά ανεκτή.", research: [{ headline: "Μελέτες ΗΕΓ δείχνουν σταθερά ξεχωριστό μοτίβο κυμάτων άλφα", takeaway: "Πολλαπλές μελέτες ΗΕΓ επιβεβαιώνουν αυξημένη δραστηριότητα άλφα κυμάτων, δείκτη χαλαρής εγρήγορσης, αν και η γνωστική επίδραση μόνης της είναι ασυνεπής.", tag: "Μελέτες ΗΕΓ" }, { headline: "Σε συνδυασμό με καφεΐνη, οι επιδράσεις στην προσοχή γίνονται μετρήσιμες", takeaway: "Μια μελέτη με χαμηλές δόσεις και των δύο ουσιών βρήκε βελτιωμένη ακρίβεια προσοχής που καμία ουσία μόνη της δεν πέτυχε.", tag: "Τυχαιοποιημένη Δοκιμή" }] }, es: { name: "L-Teanina", tagline: "Un aminoácido del té que suaviza la cafeína." }, no: { name: "L-Teanin", tagline: "En aminosyre fra te som jevner ut koffein." } } },
  { id: "multivitamin", category: "health", tags: [], timingSlot: "morning", evidence: "Limited", research: [{ headline: "A 390,000-person, 20-year study found no survival benefit", takeaway: "A 2024 JAMA cohort study following over 390,000 healthy US adults for two decades found daily multivitamin use was not associated with any reduction in mortality risk.", tag: "Cohort Study, 2024" }, { headline: "Cognitive benefits appear in some large trials", takeaway: "A 2026 review of 19 meta-analyses found multivitamins improved global cognition and memory in older adults, and lowered blood pressure in at-risk groups.", tag: "Umbrella Review, 2026" }], goals: ["general health", "covering gaps"], mechanism: "Provides a broad range of micronutrients near daily recommended values, covering gaps from an imperfect diet.", benefits: ["Reduces likelihood of mild deficiencies", "'Insurance' on restrictive diets"], dosage: "1 dose/day per label", timing: "With a meal", cautions: "Doesn't replace a varied diet.", i18n: { en: { name: "Multivitamin", tagline: "An insurance policy for gaps, not a performance pill." }, el: { name: "Πολυβιταμίνη", tagline: "Ασφαλιστική δικλείδα για κενά, όχι χάπι απόδοσης.", goals: ["γενική υγεία", "κάλυψη κενών"], mechanism: "Παρέχει εύρος μικροθρεπτικών κοντά στις ημερήσιες συνιστώμενες τιμές, καλύπτοντας κενά μη ιδανικής διατροφής.", benefits: ["Μειώνει πιθανότητα ήπιων ανεπαρκειών", "«Ασφάλεια» σε περιοριστικές δίαιτες"], dosage: "1 δόση/ημέρα βάσει ετικέτας", timing: "Με γεύμα", cautions: "Δεν υποκαθιστά ποικίλη διατροφή.", research: [{ headline: "Μελέτη 390.000 ατόμων για 20 χρόνια δεν βρήκε όφελος επιβίωσης", takeaway: "Μια μελέτη κοόρτης του 2024 στο JAMA με πάνω από 390.000 υγιείς ενήλικες για δύο δεκαετίες δεν βρήκε μείωση κινδύνου θνησιμότητας.", tag: "Μελέτη Κοόρτης, 2024" }, { headline: "Γνωστικά οφέλη εμφανίζονται σε ορισμένες μεγάλες δοκιμές", takeaway: "Μια ανασκόπηση του 2026 σε 19 μετα-αναλύσεις βρήκε βελτίωση γνωστικής λειτουργίας και μνήμης σε ηλικιωμένους.", tag: "Ανασκόπηση Ομπρέλα, 2026" }] }, es: { name: "Multivitamínico", tagline: "Un seguro para carencias, no una píldora de rendimiento." }, no: { name: "Multivitamin", tagline: "En forsikring mot mangler, ikke en prestasjonspille." } } },
  { id: "electrolytes", category: "performance", tags: [], timingSlot: "pre-workout", evidence: "High", research: [{ headline: "Sweat sodium loss varies up to 10-fold between people", takeaway: "Sweat testing databases show sodium concentration ranging from roughly 200 to over 2,300 mg/L between individuals.", tag: "Field Data" }, { headline: "Sport type predicts risk more than most people expect", takeaway: "Normative data across sports found American football and endurance athletes lose significantly more sweat sodium than basketball, soccer, or baseball players.", tag: "Normative Data Study" }], goals: ["hydration", "endurance"], mechanism: "Maintain osmotic balance and neuromuscular function; loss through sweat during prolonged effort can affect performance.", benefits: ["Supports hydration in long duration/heat", "Reduces sweat-related cramping"], dosage: "Individualized based on duration/temperature", timing: "Before, during, and after exercise", cautions: "Caution with high sodium intake if you have hypertension.", i18n: { en: { name: "Electrolytes", tagline: "Sodium, potassium, magnesium — the salts lost in sweat." }, el: { name: "Ηλεκτρολύτες", tagline: "Νάτριο, κάλιο, μαγνήσιο — τα άλατα του ιδρώτα.", goals: ["ενυδάτωση", "αντοχή"], mechanism: "Διατηρούν οσμωτική ισορροπία και νευρομυϊκή λειτουργία· η απώλειά τους σε παρατεταμένη προσπάθεια επηρεάζει απόδοση.", benefits: ["Στήριξη ενυδάτωσης σε μεγάλη διάρκεια/ζέστη", "Μείωση κραμπών από ιδρώτα"], dosage: "Εξατομικευμένο βάσει διάρκειας/θερμοκρασίας", timing: "Πριν, κατά και μετά την άσκηση", cautions: "Προσοχή σε υπέρταση με υψηλό νάτριο.", research: [{ headline: "Η απώλεια νατρίου στον ιδρώτα διαφέρει έως 10 φορές μεταξύ ατόμων", takeaway: "Βάσεις δεδομένων τεστ ιδρώτα δείχνουν συγκέντρωση νατρίου από 200 έως πάνω από 2.300 mg/L μεταξύ ατόμων.", tag: "Πεδιακά Δεδομένα" }, { headline: "Το είδος αθλήματος προβλέπει τον κίνδυνο περισσότερο απ' όσο νομίζουν οι περισσότεροι", takeaway: "Δεδομένα σε αθλήματα βρήκαν ότι το αμερικανικό ποδόσφαιρο και οι αθλητές αντοχής χάνουν σημαντικά περισσότερο νάτριο.", tag: "Μελέτη Κανονιστικών Δεδομένων" }] }, es: { name: "Electrolitos", tagline: "Sodio, potasio, magnesio — las sales que se pierden con el sudor." }, no: { name: "Elektrolytter", tagline: "Natrium, kalium, magnesium — saltene du mister gjennom svette." } } },
  { id: "colostrum", category: "recovery", tags: [], timingSlot: "morning", evidence: "Limited", research: [{ headline: "Meta-analysis confirms gut permeability benefit", takeaway: "A meta-analysis of 10 randomized trials found bovine colostrum significantly improved a standard gut-permeability marker compared to placebo.", tag: "Meta-Analysis" }, { headline: "Respiratory infection benefit is real but modest", takeaway: "A systematic review and meta-analysis found colostrum reduced upper respiratory symptom days during exercise training.", tag: "Meta-Analysis" }], goals: ["immune", "gut health"], mechanism: "Contains immunoglobulins, growth factors, and peptides that support gut lining and immune function.", benefits: ["Supports gut health in athletes", "Possible reduction in upper respiratory infections"], dosage: "10–20 g daily", timing: "On an empty stomach, morning", cautions: "Animal-derived — caution with milk allergy.", i18n: { en: { name: "Bovine Colostrum", tagline: "The first 'milk' after birth, rich in immune factors." }, el: { name: "Πρωτόγαλα", tagline: "Το πρώτο «γάλα» μετά τον τοκετό, πλούσιο σε ανοσοπαράγοντες.", goals: ["ανοσοποιητικό", "έντερο"], mechanism: "Περιέχει ανοσοσφαιρίνες, αυξητικούς παράγοντες και πεπτίδια που στηρίζουν εντερική επένδυση και ανοσοποιητικό.", benefits: ["Στήριξη εντερικής υγείας σε αθλητές", "Πιθανή μείωση λοιμώξεων αναπνευστικού"], dosage: "10–20 g ημερησίως", timing: "Με άδειο στομάχι, πρωί", cautions: "Ζωικής προέλευσης — προσοχή σε αλλεργία γάλακτος.", research: [{ headline: "Μετα-ανάλυση επιβεβαιώνει όφελος εντερικής διαπερατότητας", takeaway: "Μια μετα-ανάλυση 10 δοκιμών βρήκε ότι το πρωτόγαλα βελτίωσε σημαντικά έναν καθιερωμένο δείκτη εντερικής διαπερατότητας.", tag: "Μετα-ανάλυση" }, { headline: "Το όφελος σε αναπνευστικές λοιμώξεις είναι πραγματικό αλλά μέτριο", takeaway: "Μια συστηματική ανασκόπηση βρήκε ότι το πρωτόγαλα μείωσε τις ημέρες συμπτωμάτων ανώτερου αναπνευστικού.", tag: "Μετα-ανάλυση" }] }, es: { name: "Calostro Bovino", tagline: "La primera 'leche' tras el parto, rica en factores inmunitarios." }, no: { name: "Råmelk (Bovin)", tagline: "Den første 'melken' etter fødsel, rik på immunfaktorer." } } },
  { id: "hmb", category: "muscle", tags: [], timingSlot: "anytime", evidence: "Moderate", research: [{ headline: "A meta-analysis found no benefit in trained athletes", takeaway: "A meta-analysis of 6 studies (193 trained athletes) found HMB had essentially zero effect on strength or body composition in well-trained competitors.", tag: "Meta-Analysis" }, { headline: "But it does help people over 50", takeaway: "A more recent meta-analysis focused on adults over 50 found HMB produced small but statistically significant gains in muscle and lean mass.", tag: "Meta-Analysis, 2025" }], goals: ["muscle mass", "recovery"], mechanism: "Believed to inhibit muscle protein breakdown, with a more noticeable benefit in beginners or during periods of heavy catabolism.", benefits: ["Possible protection of muscle mass during catabolic phases", "More noticeable benefit in untrained individuals"], dosage: "3 g daily", timing: "Split around meals", cautions: "Limited added benefit for already well-trained athletes.", i18n: { en: { name: "HMB", tagline: "A leucine metabolite focused on preventing muscle breakdown." }, el: { name: "HMB", tagline: "Μεταβολίτης της λευκίνης, εστιάζει στην αποτροπή μυϊκής διάσπασης.", goals: ["μυϊκή μάζα", "ανάρρωση"], mechanism: "Θεωρείται ότι αναστέλλει τη διάσπαση μυϊκών πρωτεϊνών, πιο εμφανές όφελος σε αρχάριους ή σε περιόδους έντονου καταβολισμού.", benefits: ["Πιθανή προστασία μυϊκής μάζας σε καταβολικές φάσεις", "Πιο αισθητό όφελος σε μη προπονημένους"], dosage: "3 g ημερησίως", timing: "Σε δόσεις γύρω από τα γεύματα", cautions: "Περιορισμένο πρόσθετο όφελος σε ήδη προπονημένους αθλητές.", research: [{ headline: "Μετα-ανάλυση δεν βρήκε όφελος σε προπονημένους αθλητές", takeaway: "Μια μετα-ανάλυση 6 μελετών (193 αθλητές) βρήκε σχεδόν μηδενική επίδραση σε δύναμη ή σύσταση σώματος σε καλά προπονημένους.", tag: "Μετα-ανάλυση" }, { headline: "Όμως βοηθάει άτομα άνω των 50", takeaway: "Μια πιο πρόσφατη μετα-ανάλυση σε ενήλικες άνω των 50 βρήκε μικρά αλλά σημαντικά κέρδη σε μυϊκή και άλιπη μάζα.", tag: "Μετα-ανάλυση, 2025" }] }, es: { name: "HMB", tagline: "Un metabolito de la leucina enfocado en prevenir la degradación muscular." }, no: { name: "HMB", tagline: "En leucin-metabolitt som fokuserer på å hindre muskelnedbrytning." } } },
  { id: "l-carnitine", category: "performance", tags: [], timingSlot: "pre-workout", evidence: "Limited", research: [{ headline: "Oral bioavailability is surprisingly low", takeaway: "Research consistently shows oral L-carnitine supplements are only 5-18% absorbed, with much of the rest broken down by gut bacteria before reaching muscle.", tag: "Pharmacokinetic Research" }, { headline: "Pairing with carbohydrate unlocks a mechanism carnitine alone can't", takeaway: "A landmark study found that raising insulin via carbohydrate co-ingestion — not carnitine alone — is what drives measurable carnitine accumulation in muscle.", tag: "Mechanistic Study" }], goals: ["fat loss", "recovery"], mechanism: "Transports long-chain fatty acids into mitochondria for oxidation; supplementation doesn't always raise intramuscular levels.", benefits: ["Studied for reduced muscle soreness post-exercise", "Possible recovery support"], dosage: "2–4 g daily", timing: "With carbohydrates for better muscle uptake", cautions: "Fat-loss effect is weaker than commonly advertised.", i18n: { en: { name: "L-Carnitine", tagline: "A 'transporter' that shuttles fatty acids to the mitochondria." }, el: { name: "L-Καρνιτίνη", tagline: "«Μεταφορέας» λιπαρών οξέων προς τα μιτοχόνδρια.", goals: ["λιπόλυση", "ανάρρωση"], mechanism: "Μεταφέρει λιπαρά οξέα μακράς αλυσίδας στα μιτοχόνδρια για οξείδωση· η συμπληρωματική πρόσληψη δεν αυξάνει πάντα τα ενδομυϊκά επίπεδα.", benefits: ["Ερευνάται για μείωση μυϊκού πόνου μετά άσκηση", "Πιθανή στήριξη ανάκαμψης"], dosage: "2–4 g ημερησίως", timing: "Με υδατάνθρακες για καλύτερη πρόσληψη στους μύες", cautions: "Επίδραση στη λιπόλυση ασθενέστερη από ό,τι διαφημίζεται.", research: [{ headline: "Η βιοδιαθεσιμότητα από το στόμα είναι εκπληκτικά χαμηλή", takeaway: "Η έρευνα δείχνει ότι τα συμπληρώματα L-καρνιτίνης απορροφώνται μόλις 5-18%, με το μεγαλύτερο μέρος να διασπάται από βακτήρια του εντέρου.", tag: "Φαρμακοκινητική Έρευνα" }, { headline: "Ο συνδυασμός με υδατάνθρακα ξεκλειδώνει έναν μηχανισμό που η καρνιτίνη μόνη δεν έχει", takeaway: "Μια βασική μελέτη βρήκε ότι η αύξηση ινσουλίνης μέσω υδατάνθρακα οδηγεί σε μετρήσιμη συσσώρευση καρνιτίνης στους μύες.", tag: "Μηχανιστική Μελέτη" }] }, es: { name: "L-Carnitina", tagline: "Un 'transportador' que lleva ácidos grasos a las mitocondrias." }, no: { name: "L-Karnitin", tagline: "En 'transportør' som frakter fettsyrer til mitokondriene." } } },
  { id: "taurine", category: "performance", tags: [], timingSlot: "pre-workout", evidence: "Limited", research: [{ headline: "A 2018 meta-analysis found a real endurance benefit", takeaway: "A meta-analysis of 10 studies found oral taurine improved endurance performance, with similar benefits whether taken as a single dose or over a longer period.", tag: "Meta-Analysis, 2018" }, { headline: "A larger 2025 review confirmed small-to-moderate gains", takeaway: "A newer meta-analysis of 23 trials found acute taurine improved performance across strength, endurance, and coordination tasks, with more consistent benefits in men.", tag: "Meta-Analysis, 2025" }], goals: ["endurance", "hydration"], mechanism: "Involved in cellular hydration, muscle contractility, and antioxidant defense during exercise.", benefits: ["Studied for improved endurance", "Possible reduction in muscle damage"], dosage: "1–3 g daily", timing: "Before training", cautions: "Well tolerated at typical doses.", i18n: { en: { name: "Taurine", tagline: "A sulfur-containing amino acid known from energy drinks." }, el: { name: "Ταυρίνη", tagline: "Αμινοξύ-θειούχο, γνωστό από τα ενεργειακά ποτά.", goals: ["αντοχή", "ενυδάτωση"], mechanism: "Συμμετέχει σε κυτταρική ενυδάτωση, μυϊκή συσταλτικότητα και αντιοξειδωτική άμυνα κατά την άσκηση.", benefits: ["Ερευνάται για βελτίωση αντοχής", "Πιθανή μείωση μυϊκής βλάβης"], dosage: "1–3 g ημερησίως", timing: "Πριν την προπόνηση", cautions: "Καλά ανεκτή στις συνήθεις δόσεις.", research: [{ headline: "Μετα-ανάλυση του 2018 βρήκε πραγματικό όφελος αντοχής", takeaway: "Μια μετα-ανάλυση 10 μελετών βρήκε ότι η ταυρίνη βελτίωσε την απόδοση αντοχής, εφάπαξ ή για μεγαλύτερο διάστημα.", tag: "Μετα-ανάλυση, 2018" }, { headline: "Μεγαλύτερη ανασκόπηση του 2025 επιβεβαίωσε μικρά έως μέτρια κέρδη", takeaway: "Μια νεότερη μετα-ανάλυση 23 δοκιμών βρήκε βελτίωση σε δύναμη, αντοχή και συντονισμό, πιο σταθερά στους άνδρες.", tag: "Μετα-ανάλυση, 2025" }] }, es: { name: "Taurina", tagline: "Un aminoácido azufrado conocido por las bebidas energéticas." }, no: { name: "Taurin", tagline: "En svovelholdig aminosyre kjent fra energidrikker." } } },
  { id: "ginseng", category: "cognitive", tags: ["stimulant-mild"], timingSlot: "morning", evidence: "Moderate", research: [{ headline: "Meta-analyses confirm fatigue reduction, mainly in clinical populations", takeaway: "A meta-analysis of 12 trials in 1,298 patients found ginseng significantly reduced disease-related fatigue, though most research targets illness rather than athletic performance.", tag: "Meta-Analysis" }, { headline: "Athletic performance evidence is thinner than the fatigue evidence", takeaway: "Direct studies on ginseng and sports performance are fewer and more mixed than the fatigue research.", tag: "Mixed Evidence" }], goals: ["energy", "alertness", "stress"], mechanism: "Contains ginsenosides studied for effects on the nervous and endocrine systems, with possible anti-fatigue action.", benefits: ["Possible reduction in feelings of fatigue", "Studied for cognitive performance"], dosage: "200–400 mg standardized extract", timing: "Morning, with a meal", cautions: "Possible interaction with blood-thinning medication.", i18n: { en: { name: "Panax Ginseng", tagline: "A root with centuries of use in Eastern medicine." }, el: { name: "Panax Ginseng", tagline: "Ρίζα με αιώνες παράδοσης στην Ανατολική ιατρική.", goals: ["ενέργεια", "εγρήγορση", "στρες"], mechanism: "Περιέχει γινσενοσίδες που ερευνώνται για επιδράσεις στο νευρικό και ενδοκρινικό σύστημα, με πιθανή αντι-κοπωτική δράση.", benefits: ["Πιθανή μείωση αίσθησης κόπωσης", "Ερευνάται για γνωστική απόδοση"], dosage: "200–400 mg τυποποιημένου εκχυλίσματος", timing: "Πρωί, με γεύμα", cautions: "Πιθανή αλληλεπίδραση με αντιπηκτικά φάρμακα.", research: [{ headline: "Οι μετα-αναλύσεις επιβεβαιώνουν μείωση κόπωσης, κυρίως σε κλινικούς πληθυσμούς", takeaway: "Μια μετα-ανάλυση 12 δοκιμών σε 1.298 ασθενείς βρήκε σημαντική μείωση κόπωσης λόγω ασθένειας.", tag: "Μετα-ανάλυση" }, { headline: "Τα στοιχεία για αθλητική απόδοση είναι πιο αδύναμα", takeaway: "Οι άμεσες μελέτες για ginseng και αθλητική απόδοση είναι λιγότερες και πιο ανάμεικτες από την έρευνα κόπωσης.", tag: "Ανάμεικτα Στοιχεία" }] }, es: { name: "Panax Ginseng", tagline: "Una raíz con siglos de uso en la medicina oriental." }, no: { name: "Panax Ginseng", tagline: "En rot med århundrer med bruk i østlig medisin." } } },
  { id: "astragalus", category: "health", tags: [], timingSlot: "morning", evidence: "Limited", research: [{ headline: "A randomized trial in elite rowers found immune benefits", takeaway: "A double-blind trial in the Polish national rowing team found astragalus root helped restore immune balance after 6 weeks of intensive training.", tag: "Randomized Trial" }, { headline: "Athletic research is still an emerging, small field", takeaway: "A 2023 review protocol noted the literature linking astragalus specifically to sports performance is still sparse enough to warrant a dedicated systematic review.", tag: "Review Protocol" }], goals: ["immune", "energy"], mechanism: "Contains polysaccharides and saponins studied for immune-modulating properties.", benefits: ["Studied for immune support", "Traditional use for vitality"], dosage: "500–1000 mg extract", timing: "With a meal", cautions: "Limited clinical data in athletic populations.", i18n: { en: { name: "Astragalus", tagline: "A traditional herb studied for immune-modulating effects." }, el: { name: "Astragalus", tagline: "Παραδοσιακό βότανο, μελετάται για ανοσορυθμιστική δράση.", goals: ["ανοσοποιητικό", "ενέργεια"], mechanism: "Περιέχει πολυσακχαρίτες και σαπωνίνες που ερευνώνται για ανοσορυθμιστικές ιδιότητες.", benefits: ["Ερευνάται για στήριξη ανοσοποιητικού", "Παραδοσιακή χρήση για ζωτικότητα"], dosage: "500–1000 mg εκχυλίσματος", timing: "Με γεύμα", cautions: "Περιορισμένα κλινικά δεδομένα σε αθλητικό πληθυσμό.", research: [{ headline: "Τυχαιοποιημένη δοκιμή σε κορυφαίους κωπηλάτες βρήκε οφέλη ανοσοποιητικού", takeaway: "Μια διπλά-τυφλή δοκιμή στην πολωνική εθνική ομάδα κωπηλασίας βρήκε αποκατάσταση ανοσολογικής ισορροπίας μετά από 6 εβδομάδες προπόνησης.", tag: "Τυχαιοποιημένη Δοκιμή" }, { headline: "Η αθλητική έρευνα είναι ακόμα αναδυόμενο, μικρό πεδίο", takeaway: "Ένα πρωτόκολλο ανασκόπησης του 2023 σημείωσε ότι η βιβλιογραφία για astragalus και αθλητική απόδοση είναι ακόμα αραιή.", tag: "Πρωτόκολλο Ανασκόπησης" }] }, es: { name: "Astrágalo", tagline: "Una hierba tradicional estudiada por sus efectos inmunomoduladores." }, no: { name: "Astragalus", tagline: "En tradisjonell urt studert for immunmodulerende effekter." } } },
  { id: "cordyceps", category: "performance", tags: [], timingSlot: "morning", evidence: "Limited", research: [{ headline: "A 2025 meta-analysis found real aerobic gains", takeaway: "A meta-analysis of 14 randomized trials in 528 athletes found Cordyceps sinensis significantly improved endurance performance, ventilatory threshold, and VO2peak.", tag: "Meta-Analysis, 2025" }, { headline: "Elderly-population trials also show VO2max gains", takeaway: "A separate randomized trial in healthy elderly adults found 6 weeks of Cordyceps significantly increased VO2max compared to an unchanged placebo group.", tag: "Randomized Trial" }], goals: ["endurance", "oxygenation"], mechanism: "Studied for possible improvement in oxygen utilization (VO2max) and muscle energy metabolism.", benefits: ["Studied for endurance in submaximal exercise", "Traditional use for vitality"], dosage: "1000–3000 mg daily", timing: "Morning or before exercise", cautions: "Product quality varies widely on the market.", i18n: { en: { name: "Cordyceps", tagline: "A high-altitude fungus popular among endurance athletes." }, el: { name: "Cordyceps", tagline: "Μύκητας υψιπέδων, δημοφιλής σε αθλητές αντοχής.", goals: ["αντοχή", "οξυγόνωση"], mechanism: "Ερευνάται για πιθανή βελτίωση χρήσης οξυγόνου (VO2max) και ενεργειακού μεταβολισμού στους μύες.", benefits: ["Ερευνάται για αντοχή σε υπομέγιστη άσκηση", "Παραδοσιακή χρήση για ζωτικότητα"], dosage: "1000–3000 mg ημερησίως", timing: "Πρωί ή πριν την άσκηση", cautions: "Ετερογενή προϊόντα στην αγορά — ποιότητα εκχυλίσματος ποικίλλει.", research: [{ headline: "Μετα-ανάλυση του 2025 βρήκε πραγματικά αερόβια κέρδη", takeaway: "Μια μετα-ανάλυση 14 δοκιμών σε 528 αθλητές βρήκε ότι το Cordyceps sinensis βελτίωσε σημαντικά αντοχή, αναπνευστικό κατώφλι και VO2peak.", tag: "Μετα-ανάλυση, 2025" }, { headline: "Δοκιμές σε ηλικιωμένους δείχνουν επίσης κέρδη VO2max", takeaway: "Μια τυχαιοποιημένη δοκιμή σε υγιείς ηλικιωμένους βρήκε σημαντική αύξηση VO2max μετά από 6 εβδομάδες Cordyceps.", tag: "Τυχαιοποιημένη Δοκιμή" }] }, es: { name: "Cordyceps", tagline: "Un hongo de gran altitud popular entre atletas de resistencia." }, no: { name: "Cordyceps", tagline: "En høyfjellssopp populær blant utholdenhetsutøvere." } } },
  { id: "ginkgo", category: "cognitive", tags: ["blood-thinning"], timingSlot: "morning", evidence: "Limited", research: [{ headline: "The largest dementia-prevention trial ever run found no benefit", takeaway: "The GEM Study — a randomized trial of over 3,000 adults followed for 6+ years — found ginkgo did not reduce dementia or Alzheimer's incidence versus placebo.", tag: "Randomized Trial (GEM Study)" }, { headline: "The same large trial found no effect on general cognitive decline either", takeaway: "Secondary analysis of the GEM Study also found no slowing of decline across memory, attention, and language domains.", tag: "Randomized Trial" }], goals: ["focus", "circulation"], mechanism: "Studied for effects on peripheral circulation and as a brain antioxidant.", benefits: ["Studied for cognitive function in older adults", "Possible circulation support"], dosage: "120–240 mg standardized extract", timing: "With a meal", cautions: "Possible interaction with blood-thinning medication.", i18n: { en: { name: "Ginkgo Biloba", tagline: "One of the oldest tree species on Earth." }, el: { name: "Ginkgo Biloba", tagline: "Ένα από τα αρχαιότερα δέντρα στον κόσμο.", goals: ["εστίαση", "κυκλοφορία"], mechanism: "Ερευνάται για επιδράσεις στην περιφερική κυκλοφορία και ως αντιοξειδωτικό στον εγκέφαλο.", benefits: ["Ερευνάται για γνωστική λειτουργία σε μεγαλύτερες ηλικίες", "Πιθανή στήριξη κυκλοφορίας"], dosage: "120–240 mg τυποποιημένου εκχυλίσματος", timing: "Με γεύμα", cautions: "Πιθανή αλληλεπίδραση με αντιπηκτικά φάρμακα.", research: [{ headline: "Η μεγαλύτερη δοκιμή πρόληψης άνοιας που έγινε ποτέ δεν βρήκε όφελος", takeaway: "Η μελέτη GEM — τυχαιοποιημένη δοκιμή πάνω από 3.000 ενηλίκων για 6+ χρόνια — δεν βρήκε μείωση άνοιας ή Αλτσχάιμερ.", tag: "Τυχαιοποιημένη Δοκιμή (Μελέτη GEM)" }, { headline: "Η ίδια μεγάλη δοκιμή δεν βρήκε επίδραση ούτε στη γενική γνωστική έκπτωση", takeaway: "Δευτερεύουσα ανάλυση της GEM δεν βρήκε επιβράδυνση της γνωστικής έκπτωσης σε μνήμη, προσοχή και γλώσσα.", tag: "Τυχαιοποιημένη Δοκιμή" }] }, es: { name: "Ginkgo Biloba", tagline: "Una de las especies de árboles más antiguas del planeta." }, no: { name: "Ginkgo Biloba", tagline: "En av de eldste tresortene på jorden." } } },
  { id: "curcumin", category: "recovery", tags: ["blood-thinning"], timingSlot: "anytime", evidence: "Moderate", research: [{ headline: "Piperine can boost absorption by up to 2000%", takeaway: "Because plain curcumin is poorly absorbed, research shows pairing it with piperine (black pepper extract) can increase bioavailability by up to 2000%.", tag: "Bioavailability Research" }, { headline: "Meta-analyses confirm reduced markers of muscle damage", takeaway: "A dose-response meta-analysis of 10 trials found curcumin measurably reduced creatine kinase, soreness scores, and inflammatory markers after exercise-induced muscle damage.", tag: "Meta-Analysis" }], goals: ["inflammation", "recovery"], mechanism: "Studied for anti-inflammatory action via pathways like NF-κB inhibition. Low bioavailability without absorption enhancers like piperine.", benefits: ["Possible reduction in post-exercise muscle soreness", "Studied for general anti-inflammatory support"], dosage: "500–1000 mg daily, ideally with piperine", timing: "With a fat-containing meal", cautions: "Very high doses: possible GI discomfort.", i18n: { en: { name: "Curcumin (Turmeric)", tagline: "The active compound in turmeric root." }, el: { name: "Κουρκουμίνη", tagline: "Το ενεργό συστατικό του κουρκουμά.", goals: ["φλεγμονή", "ανάρρωση"], mechanism: "Ερευνάται για αντιφλεγμονώδη δράση μέσω αναστολής μονοπατιών όπως το NF-κB. Χαμηλή βιοδιαθεσιμότητα χωρίς ενισχυτές απορρόφησης όπως πιπερίνη.", benefits: ["Πιθανή μείωση μυϊκού πόνου μετά άσκηση", "Ερευνάται για γενική αντιφλεγμονώδη στήριξη"], dosage: "500–1000 mg ημερησίως, ιδανικά με πιπερίνη", timing: "Με γεύμα που περιέχει λίπος", cautions: "Πολύ υψηλές δόσεις: πιθανή γαστρεντερική δυσφορία.", research: [{ headline: "Η πιπερίνη μπορεί να αυξήσει την απορρόφηση έως 2000%", takeaway: "Επειδή η καθαρή κουρκουμίνη απορροφάται ελάχιστα, ο συνδυασμός με πιπερίνη μπορεί να αυξήσει τη βιοδιαθεσιμότητα έως και 2000%.", tag: "Έρευνα Βιοδιαθεσιμότητας" }, { headline: "Οι μετα-αναλύσεις επιβεβαιώνουν μειωμένους δείκτες μυϊκής βλάβης", takeaway: "Μια μετα-ανάλυση 10 δοκιμών βρήκε μειωμένη κρεατινική κινάση, πόνο και φλεγμονώδεις δείκτες μετά από άσκηση.", tag: "Μετα-ανάλυση" }] }, es: { name: "Curcumina (Cúrcuma)", tagline: "El compuesto activo de la raíz de cúrcuma." }, no: { name: "Kurkumin (Gurkemeie)", tagline: "Den aktive forbindelsen i gurkemeierot." } } },
  { id: "maca", category: "health", tags: [], timingSlot: "morning", evidence: "Limited", research: [{ headline: "Randomized trials show libido benefits without hormone changes", takeaway: "Multiple placebo-controlled trials found maca improved self-reported libido after 6-8 weeks, without measurable change in testosterone or other hormones.", tag: "Randomized Trials" }, { headline: "Semen quality and erectile dysfunction evidence remains weak", takeaway: "Separate meta-analyses found maca had no clear effect on sperm concentration and only limited evidence for erectile dysfunction.", tag: "Meta-Analysis" }], goals: ["energy", "libido"], mechanism: "Studied for possible effects on energy and hormonal balance, without a clearly proven mechanism.", benefits: ["Traditional use for energy/endurance", "Studied for mood"], dosage: "1.5–3 g powder daily", timing: "Morning, with a meal", cautions: "Limited high-quality clinical data.", i18n: { en: { name: "Maca Root", tagline: "A root with traditional use for energy." }, el: { name: "Μάκα", tagline: "Ρίζα με παραδοσιακή χρήση για ενέργεια.", goals: ["ενέργεια", "libido"], mechanism: "Ερευνάται για πιθανές επιδράσεις σε ενέργεια και ορμονική ισορροπία, χωρίς σαφή αποδεδειγμένο μηχανισμό.", benefits: ["Παραδοσιακή χρήση για ενέργεια/αντοχή", "Ερευνάται για διάθεση"], dosage: "1.5–3 g σκόνης ημερησίως", timing: "Πρωί, με γεύμα", cautions: "Περιορισμένα ποιοτικά κλινικά δεδομένα.", research: [{ headline: "Τυχαιοποιημένες δοκιμές δείχνουν οφέλη libido χωρίς αλλαγές ορμονών", takeaway: "Πολλαπλές ελεγχόμενες δοκιμές βρήκαν βελτίωση libido μετά από 6-8 εβδομάδες, χωρίς αλλαγή στην τεστοστερόνη.", tag: "Τυχαιοποιημένες Δοκιμές" }, { headline: "Τα στοιχεία για ποιότητα σπέρματος και στυτική δυσλειτουργία παραμένουν αδύναμα", takeaway: "Ξεχωριστές μετα-αναλύσεις δεν βρήκαν σαφή επίδραση στη συγκέντρωση σπέρματος.", tag: "Μετα-ανάλυση" }] }, es: { name: "Raíz de Maca", tagline: "Una raíz con uso tradicional para la energía." }, no: { name: "Maca-rot", tagline: "En rot med tradisjonell bruk for energi." } } },
  { id: "yohimbine", category: "performance", tags: ["stimulant", "fasted-required"], timingSlot: "pre-workout", evidence: "Limited", research: [{ headline: "A landmark study in elite soccer players showed real fat loss", takeaway: "A 2006 randomized trial in soccer players found yohimbine reduced body fat from 9.3% to 7.1% over 21 days, while placebo showed no change.", tag: "Randomized Trial, 2006" }, { headline: "Insulin cancels the mechanism almost completely", takeaway: "Research consistently shows eating before taking yohimbine, especially carbohydrates, blunts its fat-mobilizing effect.", tag: "Mechanistic Research" }], goals: ["fat loss", "alertness"], mechanism: "Antagonizes alpha-2 adrenergic receptors, studied for targeted fat loss in diet-resistant areas.", benefits: ["Studied for fat loss combined with fasting/exercise"], dosage: "0.2 mg per kg of body weight", timing: "On an empty stomach, before exercise", cautions: "Possible increase in heart rate/anxiety. Avoid with cardiovascular conditions.", i18n: { en: { name: "Yohimbine", tagline: "A tree-bark alkaloid with stimulant properties." }, el: { name: "Γιοχιμβίνη", tagline: "Αλκαλοειδές φλοιού δέντρου με τονωτική δράση.", goals: ["λιπόλυση", "εγρήγορση"], mechanism: "Ανταγωνίζεται άλφα-2 αδρενεργικούς υποδοχείς, ερευνάται για στοχευμένη λιπόλυση σε περιοχές ανθεκτικές στη δίαιτα.", benefits: ["Ερευνάται για λιπόλυση σε συνδυασμό με νηστεία/άσκηση"], dosage: "0.2 mg/κιλό σωματικού βάρους", timing: "Με άδειο στομάχι, πριν την άσκηση", cautions: "Πιθανή αύξηση καρδιακού ρυθμού/άγχους. Αποφυγή σε καρδιαγγειακά προβλήματα.", research: [{ headline: "Βασική μελέτη σε κορυφαίους ποδοσφαιριστές έδειξε πραγματική απώλεια λίπους", takeaway: "Μια δοκιμή του 2006 βρήκε μείωση σωματικού λίπους από 9.3% σε 7.1% σε 21 ημέρες, ενώ το εικονικό φάρμακο δεν έδειξε αλλαγή.", tag: "Τυχαιοποιημένη Δοκιμή, 2006" }, { headline: "Η ινσουλίνη ακυρώνει σχεδόν εντελώς τον μηχανισμό", takeaway: "Η έρευνα δείχνει ότι η κατανάλωση φαγητού πριν τη γιοχιμβίνη αμβλύνει τη λιπολυτική της δράση.", tag: "Μηχανιστική Έρευνα" }] }, es: { name: "Yohimbina", tagline: "Un alcaloide de corteza de árbol con propiedades estimulantes." }, no: { name: "Yohimbin", tagline: "Et bark-alkaloid med stimulerende egenskaper." } } },
  { id: "egcg", category: "health", tags: ["stimulant-mild", "liver-caution"], timingSlot: "morning", evidence: "Moderate", research: [{ headline: "Meta-analyses confirm a small, real metabolic effect", takeaway: "A dose-response meta-analysis found each cup-equivalent of green tea catechins associated with burning roughly 5.7g of body fat — real but modest.", tag: "Meta-Analysis" }, { headline: "Regulators have flagged a specific high-dose threshold", takeaway: "Health regulators including the UK's MHRA warn that doses above 800mg EGCG daily carry a real risk of liver injury, especially on an empty stomach.", tag: "Regulatory Safety Data" }], goals: ["fat loss", "antioxidant"], mechanism: "Catechins, especially EGCG, are studied for effects on energy metabolism and as antioxidants.", benefits: ["Possible small boost to metabolic rate", "Antioxidant activity"], dosage: "300–500 mg EGCG daily", timing: "With food, not on an empty stomach at high doses", cautions: "High doses on an empty stomach: possible liver strain.", i18n: { en: { name: "Green Tea Extract (EGCG)", tagline: "Tea polyphenols with antioxidant activity." }, el: { name: "Εκχύλισμα Πράσινου Τσαγιού", tagline: "Πολυφαινόλες τσαγιού με αντιοξειδωτική δράση.", goals: ["λιπόλυση", "αντιοξειδωτικά"], mechanism: "Οι κατεχίνες, ιδίως η EGCG, ερευνώνται για επίδραση στον ενεργειακό μεταβολισμό και ως αντιοξειδωτικά.", benefits: ["Πιθανή μικρή στήριξη μεταβολικού ρυθμού", "Αντιοξειδωτική δράση"], dosage: "300–500 mg EGCG ημερησίως", timing: "Με γεύμα, όχι με άδειο στομάχι σε υψηλές δόσεις", cautions: "Υψηλές δόσεις με άδειο στομάχι: πιθανή ηπατική επιβάρυνση.", research: [{ headline: "Οι μετα-αναλύσεις επιβεβαιώνουν μικρό, πραγματικό μεταβολικό αποτέλεσμα", takeaway: "Μια μετα-ανάλυση βρήκε ότι κάθε ισοδύναμο φλιτζανιού κατεχινών συνδέεται με καύση περίπου 5.7g σωματικού λίπους.", tag: "Μετα-ανάλυση" }, { headline: "Ρυθμιστικές αρχές έχουν επισημάνει όριο υψηλής δόσης", takeaway: "Η βρετανική MHRA προειδοποιεί ότι δόσεις πάνω από 800mg EGCG ημερησίως έχουν κίνδυνο ηπατικής βλάβης.", tag: "Ρυθμιστικά Δεδομένα Ασφαλείας" }] }, es: { name: "Extracto de Té Verde (EGCG)", tagline: "Polifenoles del té con actividad antioxidante." }, no: { name: "Grønn Te-ekstrakt (EGCG)", tagline: "Te-polyfenoler med antioksidant-aktivitet." } } },
  { id: "collagen", category: "recovery", tags: [], timingSlot: "pre-workout", evidence: "Moderate", research: [{ headline: "A landmark study showed pre-loading doubles collagen synthesis", takeaway: "Shaw et al. (2017) found subjects who took vitamin C-enriched gelatin an hour before exercise showed double the blood marker of new collagen synthesis.", tag: "Randomized Trial (Shaw 2017)" }, { headline: "Not every study agrees — timing and tissue type matter", takeaway: "A more recent trial found collagen added to a week of resistance training didn't boost intramuscular connective tissue synthesis, suggesting protocol matters more than blanket supplementation.", tag: "Randomized Trial" }], goals: ["joints", "tendons"], mechanism: "Provides amino acids (glycine, proline) that form structural building blocks of connective tissue; pairing with vitamin C is studied to enhance collagen synthesis.", benefits: ["Studied for tendon/ligament health support", "Possible support under high-impact loading"], dosage: "10–15 g daily", timing: "30–60 min before load-bearing activity, with vitamin C", cautions: "Doesn't replace a complete-profile protein source.", i18n: { en: { name: "Collagen Peptides", tagline: "A structural protein for joints, tendons, and skin." }, el: { name: "Πεπτίδια Κολλαγόνου", tagline: "Δομική πρωτεΐνη για αρθρώσεις, τένοντες και δέρμα.", goals: ["αρθρώσεις", "τένοντες"], mechanism: "Παρέχει αμινοξέα (γλυκίνη, προλίνη) που αποτελούν δομικά «τούβλα» συνδετικού ιστού· η λήψη με βιταμίνη C ερευνάται για ενίσχυση σύνθεσης κολλαγόνου.", benefits: ["Ερευνάται για στήριξη υγείας τενόντων/συνδέσμων", "Πιθανή στήριξη σε φορτία υψηλής κρούσης"], dosage: "10–15 g ημερησίως", timing: "30–60' πριν από δραστηριότητα φόρτισης τενόντων, με βιταμίνη C", cautions: "Δεν υποκαθιστά πρωτεΐνη πλήρους προφίλ αμινοξέων.", research: [{ headline: "Βασική μελέτη έδειξε ότι η πρόληψη διπλασιάζει τη σύνθεση κολλαγόνου", takeaway: "Οι Shaw et al. (2017) βρήκαν διπλάσιο δείκτη σύνθεσης κολλαγόνου σε όσους πήραν ζελατίνη με βιταμίνη C μία ώρα πριν την άσκηση.", tag: "Τυχαιοποιημένη Δοκιμή (Shaw 2017)" }, { headline: "Δεν συμφωνούν όλες οι μελέτες — ο χρονισμός έχει σημασία", takeaway: "Μια πιο πρόσφατη δοκιμή δεν βρήκε αύξηση σύνθεσης ενδομυϊκού συνδετικού ιστού, δείχνοντας ότι το πρωτόκολλο μετράει.", tag: "Τυχαιοποιημένη Δοκιμή" }] }, es: { name: "Péptidos de Colágeno", tagline: "Una proteína estructural para articulaciones, tendones y piel." }, no: { name: "Kollagenpeptider", tagline: "Et strukturelt protein for ledd, sener og hud." } } },
  { id: "beetroot", category: "performance", tags: ["nitric-oxide"], timingSlot: "pre-workout", evidence: "High", research: [{ headline: "One of sports nutrition's most reliably reproduced effects", takeaway: "The oxygen-economy benefit from dietary nitrate has been replicated across dozens of studies.", tag: "Established Evidence Base" }, { headline: "Mouthwash studies proved the mechanism by removing it", takeaway: "Studies using antiseptic mouthwash to kill oral bacteria needed to convert nitrate to nitrite completely blocked the rise in blood nitrite, confirming the mechanism.", tag: "Mechanistic Study" }], goals: ["endurance", "blood flow"], mechanism: "Dietary nitrates convert to nitric oxide, improving oxygen economy during endurance exercise.", benefits: ["Improves endurance performance", "Reduces oxygen cost at a given intensity"], dosage: "~6–8 mmol nitrate (≈300–500ml beetroot juice)", timing: "2–3 hours before exercise", cautions: "Harmless discoloration of urine/stool. Avoid pairing with antiseptic mouthwash (reduces effect).", i18n: { en: { name: "Beetroot / Nitrate", tagline: "Dietary nitrates with proven endurance benefits." }, el: { name: "Παντζάρι / Νιτρικά", tagline: "Διαιτητικά νιτρικά με αποδεδειγμένη επίδραση στην αντοχή.", goals: ["αντοχή", "αιμάτωση"], mechanism: "Τα διαιτητικά νιτρικά μετατρέπονται σε νιτρικό οξείδιο, βελτιώνοντας την οικονομία οξυγόνου κατά την άσκηση αντοχής.", benefits: ["Βελτίωση απόδοσης σε αντοχή", "Μείωση κατανάλωσης οξυγόνου σε δεδομένη ένταση"], dosage: "~6–8 mmol νιτρικών (≈300-500ml χυμού παντζαριού)", timing: "2–3 ώρες πριν την άσκηση", cautions: "Αβλαβής χρώση ούρων/κοπράνων. Αποφυγή μαζί με αντισηπτικό στοματικό διάλυμα.", research: [{ headline: "Ένα από τα πιο αξιόπιστα αναπαραγόμενα αποτελέσματα στην αθλητική διατροφή", takeaway: "Το όφελος στην οικονομία οξυγόνου από τα διαιτητικά νιτρικά έχει αναπαραχθεί σε δεκάδες μελέτες.", tag: "Καθιερωμένη Βάση Τεκμηρίωσης" }, { headline: "Μελέτες με στοματικό διάλυμα απέδειξαν τον μηχανισμό αφαιρώντας τον", takeaway: "Στοματικό διάλυμα που σκότωσε τα βακτήρια του στόματος μπλόκαρε εντελώς την άνοδο του νιτρώδους στο αίμα.", tag: "Μηχανιστική Μελέτη" }] }, es: { name: "Remolacha / Nitrato", tagline: "Nitratos dietéticos con beneficios probados para la resistencia." }, no: { name: "Rødbete / Nitrat", tagline: "Kostnitrater med bevist utholdenhetseffekt." } } },
  { id: "lions-mane", category: "cognitive", tags: [], timingSlot: "morning", evidence: "Limited", research: [{ headline: "A 16-week trial found real cognitive gains in older adults", takeaway: "Mori et al. (2009) found older adults with mild cognitive impairment who took lion's mane for 16 weeks scored significantly better on cognitive tests than placebo.", tag: "Randomized Trial (Mori 2009)" }, { headline: "Lab research shows a 200% boost to nerve growth signaling", takeaway: "Lab studies show the compounds erinacine and hericenone can boost nerve growth factor synthesis by up to 200%, not yet directly confirmed at that scale in humans.", tag: "Laboratory Research" }], goals: ["focus", "brain health"], mechanism: "Studied for possibly stimulating nerve growth factor (NGF) production, of interest for nerve health.", benefits: ["Studied for cognitive function/memory", "Traditional use for vitality"], dosage: "500–1000 mg extract", timing: "With a meal", cautions: "Limited human clinical data so far.", i18n: { en: { name: "Lion's Mane Mushroom", tagline: "A mushroom traditionally used to support brain health." }, el: { name: "Χαίτη Λιονταριού", tagline: "Μύκητας με παραδοσιακή χρήση για νευρική υγεία.", goals: ["εστίαση", "γνωστική υγεία"], mechanism: "Ερευνάται για πιθανή διέγερση παραγωγής νευροτροφικών παραγόντων (NGF), με ενδιαφέρον για νευρική υγεία.", benefits: ["Ερευνάται για γνωστική λειτουργία/μνήμη", "Παραδοσιακή χρήση για ζωτικότητα"], dosage: "500–1000 mg εκχυλίσματος", timing: "Με γεύμα", cautions: "Περιορισμένα ανθρώπινα κλινικά δεδομένα ακόμη.", research: [{ headline: "Δοκιμή 16 εβδομάδων βρήκε πραγματικά γνωστικά κέρδη σε ηλικιωμένους", takeaway: "Οι Mori et al. (2009) βρήκαν καλύτερα αποτελέσματα σε γνωστικά τεστ σε ηλικιωμένους με ήπια γνωστική εξασθένηση μετά από 16 εβδομάδες.", tag: "Τυχαιοποιημένη Δοκιμή (Mori 2009)" }, { headline: "Εργαστηριακή έρευνα δείχνει αύξηση 200% στη σηματοδότηση νευρικής ανάπτυξης", takeaway: "Οι ενώσεις erinacine και hericenone μπορούν να αυξήσουν τη σύνθεση νευροτροφικού παράγοντα έως 200% σε εργαστηριακές μελέτες.", tag: "Εργαστηριακή Έρευνα" }] }, es: { name: "Melena de León", tagline: "Un hongo usado tradicionalmente para apoyar la salud cerebral." }, no: { name: "Løvemanke-sopp", tagline: "En sopp tradisjonelt brukt for å støtte hjernehelsen." } } },
  { id: "flaxseed-oil", category: "health", tags: [], timingSlot: "anytime", evidence: "Moderate", research: [{ headline: "ALA doesn't convert efficiently to EPA/DHA", takeaway: "Studies show only about 5-10% of the plant omega-3 ALA in flaxseed oil converts to EPA and less than 5% to DHA in the body, far less than getting EPA/DHA directly from fish sources.", tag: "Metabolic Research" }], goals: ["heart health", "plant omega-3"], mechanism: "Rich in alpha-linolenic acid (ALA), a plant-based omega-3 that the body can partially convert to EPA/DHA, plus lignans with antioxidant properties.", benefits: ["Plant-based omega-3 source", "May support cholesterol profile", "Vegan alternative to fish oil"], dosage: "1–2 tbsp (14–28 g) daily", timing: "With a meal", cautions: "Much weaker EPA/DHA delivery than fish or algae oil. Can oxidize/go rancid quickly — store cold.", i18n: { en: { name: "Flaxseed Oil", tagline: "A plant-based omega-3, but a weaker source than fish oil." }, el: { name: "Λάδι Λιναρόσπορου", tagline: "Φυτικό ωμέγα-3, αλλά ασθενέστερη πηγή από το ιχθυέλαιο.", goals: ["καρδιαγγειακή υγεία", "φυτικά ωμέγα-3"], mechanism: "Πλούσιο σε άλφα-λινολενικό οξύ (ALA), φυτικό ωμέγα-3 που το σώμα μετατρέπει εν μέρει σε EPA/DHA, καθώς και λιγνάνες με αντιοξειδωτικές ιδιότητες.", benefits: ["Φυτική πηγή ωμέγα-3", "Πιθανή στήριξη λιπιδαιμικού προφίλ", "Vegan εναλλακτική του ιχθυελαίου"], dosage: "1–2 κ.σ. (14–28 g) ημερησίως", timing: "Με γεύμα", cautions: "Πολύ ασθενέστερη παροχή EPA/DHA σε σχέση με ιχθυέλαιο. Οξειδώνεται εύκολα — αποθήκευση σε ψύξη.", research: [{ headline: "Το ALA δεν μετατρέπεται αποτελεσματικά σε EPA/DHA", takeaway: "Μελέτες δείχνουν ότι μόνο 5-10% του φυτικού ωμέγα-3 ALA στο λιναρόσπορο μετατρέπεται σε EPA και λιγότερο από 5% σε DHA στο σώμα.", tag: "Μεταβολική Έρευνα" }] }, es: { name: "Aceite de Linaza", tagline: "Un omega-3 de origen vegetal, pero una fuente más débil que el aceite de pescado." }, no: { name: "Linfrøolje", tagline: "En plantebasert omega-3, men en svakere kilde enn fiskeolje." } } },
  { id: "raspberry-ketones", category: "health", tags: [], timingSlot: "morning", evidence: "Limited", research: [{ headline: "Human evidence is essentially absent", takeaway: "Nearly all supporting data comes from rodent studies using doses far higher than what's realistic in a supplement; controlled human trials on raspberry ketones alone are lacking.", tag: "Evidence Gap" }], goals: ["fat loss"], mechanism: "Structurally similar to synephrine and capsaicin; theorized to affect fat cell metabolism (lipolysis), but this is based almost entirely on animal/cell studies.", benefits: ["Marketed for fat loss", "Antioxidant properties in lab studies"], dosage: "100–200 mg daily (typical label dose)", timing: "Morning, with a meal", cautions: "One of the weakest-evidenced popular fat-loss ingredients; treat marketing claims skeptically.", i18n: { en: { name: "Raspberry Ketones", tagline: "A popular fat-loss ingredient with almost no human evidence behind it." }, el: { name: "Κετόνες Σμέουρου", tagline: "Δημοφιλές συστατικό λιπόλυσης με σχεδόν καθόλου ανθρώπινα στοιχεία.", goals: ["λιπόλυση"], mechanism: "Δομικά παρόμοιο με τη συνεφρίνη και την καψαϊκίνη· θεωρητικά επηρεάζει τον μεταβολισμό λιποκυττάρων, αλλά σχεδόν όλα τα στοιχεία προέρχονται από ζωικές/κυτταρικές μελέτες.", benefits: ["Διαφημίζεται για λιπόλυση", "Αντιοξειδωτικές ιδιότητες σε εργαστηριακές μελέτες"], dosage: "100–200 mg ημερησίως (συνήθης δόση ετικέτας)", timing: "Πρωί, με γεύμα", cautions: "Ένα από τα πιο αδύναμα τεκμηριωμένα δημοφιλή συστατικά λιπόλυσης· αντιμετώπισε τους ισχυρισμούς μάρκετινγκ με σκεπτικισμό.", research: [{ headline: "Τα ανθρώπινα δεδομένα ουσιαστικά απουσιάζουν", takeaway: "Σχεδόν όλα τα υποστηρικτικά δεδομένα προέρχονται από μελέτες σε τρωκτικά με δόσεις πολύ υψηλότερες από ό,τι είναι ρεαλιστικό σε συμπλήρωμα.", tag: "Κενό Τεκμηρίωσης" }] }, es: { name: "Cetonas de Frambuesa", tagline: "Un popular ingrediente para pérdida de grasa con casi ninguna evidencia humana." }, no: { name: "Bringebærketoner", tagline: "En populær fettforbrenningsingrediens med nesten ingen bevis fra mennesker." } } },
  { id: "creatine-forms", category: "muscle", tags: [], timingSlot: "anytime", evidence: "Moderate", research: [{ headline: "Head-to-head trials keep confirming monohydrate wins", takeaway: "Comparative studies of creatine HCl, ethyl ester, buffered (Kre-Alkalyn), and micronized forms against monohydrate consistently find no strength or muscle advantage, despite marketing claims of better absorption.", tag: "Comparative Trials" }], goals: ["strength", "muscle mass"], mechanism: "All forms deliver the same active creatine molecule to muscle; differences are mainly in solubility and marketing, not in what actually reaches the muscle cell.", benefits: ["Same end result as monohydrate in most trials", "Some forms dissolve better in water"], dosage: "Equivalent creatine content to 3–5 g monohydrate", timing: "Any time of day", cautions: "Monohydrate remains the most-studied, cheapest, and safest reference form — newer forms haven't outperformed it.", i18n: { en: { name: "Creatine Forms (HCl, Ethyl Ester, Buffered)", tagline: "Marketed alternatives to monohydrate — evidence says skip the upsell." }, el: { name: "Μορφές Κρεατίνης (HCl, Ethyl Ester, Buffered)", tagline: "Εμπορικές εναλλακτικές της μονοϋδρικής — τα στοιχεία λένε να τις προσπεράσεις.", goals: ["δύναμη", "μυϊκή μάζα"], mechanism: "Όλες οι μορφές παρέχουν το ίδιο ενεργό μόριο κρεατίνης στον μυ· οι διαφορές αφορούν κυρίως διαλυτότητα και μάρκετινγκ, όχι το τι φτάνει στο κύτταρο.", benefits: ["Ίδιο τελικό αποτέλεσμα με τη μονοϋδρική στις περισσότερες δοκιμές", "Ορισμένες μορφές διαλύονται καλύτερα στο νερό"], dosage: "Ισοδύναμη περιεκτικότητα κρεατίνης με 3–5 g μονοϋδρικής", timing: "Οποιαδήποτε ώρα", cautions: "Η μονοϋδρική παραμένει η πιο μελετημένη, φθηνότερη και ασφαλέστερη μορφή αναφοράς.", research: [{ headline: "Συγκριτικές δοκιμές επιβεβαιώνουν συνεχώς το προβάδισμα της μονοϋδρικής", takeaway: "Συγκριτικές μελέτες κρεατίνης HCl, ethyl ester, buffered (Kre-Alkalyn) και micronized έναντι μονοϋδρικής δεν βρίσκουν πλεονέκτημα σε δύναμη ή μυϊκή μάζα.", tag: "Συγκριτικές Δοκιμές" }] }, es: { name: "Formas de Creatina (HCl, Éster Etílico, Tamponada)", tagline: "Alternativas comercializadas al monohidrato — la evidencia dice que no vale la pena pagar más." }, no: { name: "Kreatinformer (HCl, Etylester, Bufret)", tagline: "Markedsførte alternativer til monohydrat — bevisene sier du kan hoppe over merkostnaden." } } },
  { id: "boron", category: "health", tags: [], timingSlot: "morning", evidence: "Limited", research: [{ headline: "Small trials show a modest free-testosterone bump", takeaway: "Short-term studies in men supplementing 6-10mg of boron daily found measurable increases in free testosterone and reductions in estradiol and inflammatory markers, though sample sizes remain small.", tag: "Small Clinical Trials" }], goals: ["hormones", "bone health"], mechanism: "A trace mineral studied for roles in steroid hormone metabolism and bone/joint health; thought to reduce SHBG, freeing up more active testosterone.", benefits: ["Studied for free testosterone support", "Possible support for bone/joint health"], dosage: "3–10 mg daily", timing: "With a meal", cautions: "Evidence base is still small-scale; long-term safety data at supplemental doses is limited.", i18n: { en: { name: "Boron", tagline: "A trace mineral studied for hormone and bone support." }, el: { name: "Βόριο", tagline: "Ιχνοστοιχείο που ερευνάται για στήριξη ορμονών και οστών.", goals: ["ορμόνες", "οστική υγεία"], mechanism: "Ιχνοστοιχείο που ερευνάται για ρόλο στον μεταβολισμό στεροειδών ορμονών και οστική/αρθρική υγεία· θεωρείται ότι μειώνει την SHBG.", benefits: ["Ερευνάται για στήριξη ελεύθερης τεστοστερόνης", "Πιθανή στήριξη οστικής/αρθρικής υγείας"], dosage: "3–10 mg ημερησίως", timing: "Με γεύμα", cautions: "Η βάση τεκμηρίωσης παραμένει μικρής κλίμακας· περιορισμένα μακροχρόνια δεδομένα ασφάλειας.", research: [{ headline: "Μικρές δοκιμές δείχνουν μέτρια αύξηση ελεύθερης τεστοστερόνης", takeaway: "Βραχυπρόθεσμες μελέτες σε άνδρες με 6-10mg βόριο ημερησίως βρήκαν μετρήσιμη αύξηση ελεύθερης τεστοστερόνης και μείωση οιστραδιόλης, αν και τα δείγματα παραμένουν μικρά.", tag: "Μικρές Κλινικές Δοκιμές" }] }, es: { name: "Boro", tagline: "Un mineral traza estudiado por su apoyo hormonal y óseo." }, no: { name: "Bor", tagline: "Et sporstoff studert for hormon- og benstøtte." } } },
  { id: "mucuna-pruriens", category: "cognitive", tags: [], timingSlot: "morning", evidence: "Limited", research: [{ headline: "Contains natural L-DOPA, the direct dopamine precursor", takeaway: "Mucuna seed extract naturally contains 4-7% L-DOPA by weight — the same compound used in prescription Parkinson's medication — and clinical trials in Parkinson's patients confirm measurable increases in blood L-DOPA and symptom improvement.", tag: "Clinical Trials" }], goals: ["mood", "dopamine support"], mechanism: "Seeds naturally contain L-DOPA, which crosses the blood-brain barrier and converts to dopamine — most research has focused on Parkinson's disease rather than healthy trainees.", benefits: ["Studied for Parkinson's symptom relief", "Traditional use for mood/vitality"], dosage: "500 mg–5 g standardized powder daily", timing: "Morning, on an empty stomach", cautions: "Can interact with MAOI/dopaminergic medications. Not well studied in healthy young adults for fitness goals.", i18n: { en: { name: "Mucuna Pruriens", tagline: "A tropical legume rich in natural L-DOPA, the dopamine precursor." }, el: { name: "Mucuna Pruriens", tagline: "Τροπικό όσπριο πλούσιο σε φυσική L-DOPA, πρόδρομο της ντοπαμίνης.", goals: ["διάθεση", "στήριξη ντοπαμίνης"], mechanism: "Οι σπόροι περιέχουν φυσικά L-DOPA, που διαπερνά τον αιματοεγκεφαλικό φραγμό και μετατρέπεται σε ντοπαμίνη — η έρευνα εστιάζει κυρίως σε Πάρκινσον, όχι υγιείς ασκούμενους.", benefits: ["Ερευνάται για ανακούφιση συμπτωμάτων Πάρκινσον", "Παραδοσιακή χρήση για διάθεση/ζωτικότητα"], dosage: "500 mg–5 g τυποποιημένης σκόνης ημερησίως", timing: "Πρωί, με άδειο στομάχι", cautions: "Πιθανή αλληλεπίδραση με φάρμακα MAOI/ντοπαμινεργικά. Δεν έχει μελετηθεί καλά σε υγιείς νέους για αθλητικούς στόχους.", research: [{ headline: "Περιέχει φυσική L-DOPA, τον άμεσο πρόδρομο ντοπαμίνης", takeaway: "Το εκχύλισμα σπόρου Mucuna περιέχει φυσικά 4-7% L-DOPA κατά βάρος — την ίδια ένωση που χρησιμοποιείται σε φάρμακα για Πάρκινσον — και κλινικές δοκιμές επιβεβαιώνουν αύξηση L-DOPA στο αίμα.", tag: "Κλινικές Δοκιμές" }] }, es: { name: "Mucuna Pruriens", tagline: "Una legumbre tropical rica en L-DOPA natural, el precursor de la dopamina." }, no: { name: "Mucuna Pruriens", tagline: "Et tropisk belgfrukt rikt på naturlig L-DOPA, dopaminforløperen." } } },
  { id: "krill-oil", category: "health", tags: ["blood-thinning"], timingSlot: "anytime", evidence: "Moderate", research: [{ headline: "Phospholipid form may absorb differently than fish oil", takeaway: "Krill oil delivers EPA/DHA bound to phospholipids rather than triglycerides; several studies suggest this form may be absorbed more efficiently at lower doses, though results are mixed across trials.", tag: "Comparative Studies" }], goals: ["heart health", "inflammation"], mechanism: "EPA/DHA bound to phospholipids (vs. triglycerides in fish oil), plus the antioxidant astaxanthin which may help protect the oil from oxidation.", benefits: ["Source of EPA/DHA omega-3s", "Contains astaxanthin antioxidant", "May cause less fishy aftertaste than fish oil"], dosage: "1–2 g daily (≈250–500mg EPA/DHA)", timing: "With a meal", cautions: "Shellfish-derived — avoid with shellfish allergy. Mild blood-thinning effect at high doses.", i18n: { en: { name: "Krill Oil", tagline: "A phospholipid-bound omega-3 source from Antarctic krill." }, el: { name: "Λάδι Κριλ", tagline: "Πηγή ωμέγα-3 δεμένη σε φωσφολιπίδια, από κριλ της Ανταρκτικής.", goals: ["καρδιαγγειακή υγεία", "φλεγμονή"], mechanism: "EPA/DHA δεμένα σε φωσφολιπίδια (αντί τριγλυκεριδίων στο ιχθυέλαιο), συν το αντιοξειδωτικό astaxanthin που προστατεύει το λάδι από οξείδωση.", benefits: ["Πηγή EPA/DHA ωμέγα-3", "Περιέχει το αντιοξειδωτικό astaxanthin", "Πιθανώς λιγότερη 'ψαρίλα' από το ιχθυέλαιο"], dosage: "1–2 g ημερησίως (≈250–500mg EPA/DHA)", timing: "Με γεύμα", cautions: "Προέρχεται από οστρακοειδή — αποφυγή σε αλλεργία οστρακοειδών. Ήπια αντιπηκτική δράση σε υψηλές δόσεις.", research: [{ headline: "Η φωσφολιπιδική μορφή μπορεί να απορροφάται διαφορετικά από το ιχθυέλαιο", takeaway: "Το κριλέλαιο παρέχει EPA/DHA δεμένα σε φωσφολιπίδια αντί για τριγλυκερίδια· αρκετές μελέτες δείχνουν πιθανή καλύτερη απορρόφηση σε χαμηλότερες δόσεις.", tag: "Συγκριτικές Μελέτες" }] }, es: { name: "Aceite de Kril", tagline: "Una fuente de omega-3 unida a fosfolípidos proveniente del kril antártico." }, no: { name: "Krillolje", tagline: "En fosfolipid-bundet omega-3-kilde fra antarktisk krill." } } },
  { id: "cod-liver-oil", category: "health", tags: ["blood-thinning"], timingSlot: "anytime", evidence: "Moderate", research: [{ headline: "Delivers a unique combo — omega-3s plus vitamins A and D", takeaway: "Unlike standard fish body oil, cod liver oil naturally contains meaningful amounts of vitamin A and vitamin D alongside EPA/DHA, making dosing more complex since all three are fat-soluble and can accumulate.", tag: "Nutrient Composition Data" }], goals: ["heart health", "bone health", "immune"], mechanism: "Extracted from cod liver rather than body tissue, so it naturally carries fat-soluble vitamins A and D alongside the same EPA/DHA found in regular fish oil.", benefits: ["Combines omega-3s with vitamin A and D", "Traditional use for joint/bone health"], dosage: "1 tsp (≈5ml) or per label — watch total vitamin A intake", timing: "With a meal", cautions: "Easy to overdose on vitamin A if also taking a separate multivitamin — check combined totals.", i18n: { en: { name: "Cod Liver Oil", tagline: "A traditional omega-3 source that also carries vitamins A and D." }, el: { name: "Μουρουνέλαιο", tagline: "Παραδοσιακή πηγή ωμέγα-3 που φέρει και βιταμίνες A και D.", goals: ["καρδιαγγειακή υγεία", "οστική υγεία", "ανοσοποιητικό"], mechanism: "Εξάγεται από το συκώτι του μπακαλιάρου αντί για τον ιστό του σώματος, οπότε φέρει φυσικά λιποδιαλυτές βιταμίνες A και D μαζί με EPA/DHA.", benefits: ["Συνδυάζει ωμέγα-3 με βιταμίνη A και D", "Παραδοσιακή χρήση για αρθρική/οστική υγεία"], dosage: "1 κ.γ. (≈5ml) ή βάσει ετικέτας — προσοχή στη συνολική πρόσληψη βιταμίνης A", timing: "Με γεύμα", cautions: "Εύκολη υπερβολική δόση βιταμίνης A αν λαμβάνεται και ξεχωριστή πολυβιταμίνη — έλεγξε το άθροισμα.", research: [{ headline: "Παρέχει μοναδικό συνδυασμό — ωμέγα-3 συν βιταμίνες A και D", takeaway: "Σε αντίθεση με το απλό ιχθυέλαιο, το μουρουνέλαιο περιέχει φυσικά σημαντικές ποσότητες βιταμίνης A και D μαζί με EPA/DHA, κάνοντας τη δοσολογία πιο σύνθετη.", tag: "Δεδομένα Σύνθεσης Θρεπτικών" }] }, es: { name: "Aceite de Hígado de Bacalao", tagline: "Una fuente tradicional de omega-3 que también aporta vitaminas A y D." }, no: { name: "Tran (Torskeleverolje)", tagline: "En tradisjonell omega-3-kilde som også gir vitamin A og D." } } },
  { id: "gynostemma-pentaphyllum", category: "health", tags: [], timingSlot: "morning", evidence: "Limited", research: [{ headline: "Traditional 'immortality herb' studied for metabolic effects", takeaway: "Small clinical trials in China and Korea have studied Gynostemma pentaphyllum (jiaogulan) for blood sugar regulation and lipid profile, with some showing modest improvements, though the evidence base outside Asia remains thin.", tag: "Regional Clinical Trials" }], goals: ["metabolic health", "antioxidant"], mechanism: "Contains gypenosides, saponins structurally similar to those in ginseng, studied for antioxidant and metabolic-regulating properties.", benefits: ["Traditional adaptogen use", "Studied for blood sugar/lipid support"], dosage: "1–3 g dried herb or per extract label", timing: "Morning, with a meal", cautions: "Limited large-scale Western clinical data; quality varies widely between suppliers.", i18n: { en: { name: "Gynostemma Pentaphyllum", tagline: "A traditional Chinese adaptogenic herb, also called jiaogulan." }, el: { name: "Gynostemma Pentaphyllum", tagline: "Παραδοσιακό κινέζικο προσαρμογόνο βότανο, γνωστό και ως jiaogulan.", goals: ["μεταβολική υγεία", "αντιοξειδωτικά"], mechanism: "Περιέχει γυπενοσίδες, σαπωνίνες δομικά παρόμοιες με αυτές του ginseng, που ερευνώνται για αντιοξειδωτικές και μεταβολικές ιδιότητες.", benefits: ["Παραδοσιακή χρήση ως προσαρμογόνο", "Ερευνάται για στήριξη σακχάρου/λιπιδίων"], dosage: "1–3 g ξηρού βοτάνου ή βάσει ετικέτας εκχυλίσματος", timing: "Πρωί, με γεύμα", cautions: "Περιορισμένα δυτικά κλινικά δεδομένα μεγάλης κλίμακας· η ποιότητα ποικίλλει σημαντικά μεταξύ προμηθευτών.", research: [{ headline: "Παραδοσιακό «βότανο της αθανασίας» ερευνάται για μεταβολικές επιδράσεις", takeaway: "Μικρές κλινικές δοκιμές στην Κίνα και Κορέα ερεύνησαν το Gynostemma pentaphyllum (jiaogulan) για ρύθμιση σακχάρου και λιπιδίων, με ορισμένες να δείχνουν μέτρια βελτίωση.", tag: "Περιφερειακές Κλινικές Δοκιμές" }] }, es: { name: "Gynostemma Pentaphyllum", tagline: "Una hierba adaptógena tradicional china, también llamada jiaogulan." }, no: { name: "Gynostemma Pentaphyllum", tagline: "En tradisjonell kinesisk adaptogen urt, også kalt jiaogulan." } } },
  { id: "echinacea-purpurea", category: "health", tags: [], timingSlot: "morning", evidence: "Moderate", research: [{ headline: "Cochrane review found a modest preventive effect", takeaway: "A Cochrane systematic review of prevention trials found echinacea products reduced the odds of catching a cold by about 10-20%, though the effect on treating an active cold was weaker and less consistent.", tag: "Cochrane Review" }], goals: ["immune"], mechanism: "Contains alkylamides and polysaccharides studied for stimulating immune cell activity, particularly around upper respiratory infections.", benefits: ["Modest reduction in cold frequency", "Traditional immune support use"], dosage: "300–500 mg extract, 2–3 times daily at first symptoms", timing: "At onset of symptoms, or daily during high-exposure periods", cautions: "Avoid with autoimmune conditions; effects can vary widely by extract/species used.", i18n: { en: { name: "Echinacea Purpurea", tagline: "A traditional immune-support herb with modest cold-prevention evidence." }, el: { name: "Echinacea Purpurea", tagline: "Παραδοσιακό βότανο στήριξης ανοσοποιητικού με μέτρια στοιχεία πρόληψης κρυολογήματος.", goals: ["ανοσοποιητικό"], mechanism: "Περιέχει αλκυλαμίδια και πολυσακχαρίτες που ερευνώνται για διέγερση ανοσοκυττάρων, ιδίως γύρω από λοιμώξεις ανώτερου αναπνευστικού.", benefits: ["Μέτρια μείωση συχνότητας κρυολογήματος", "Παραδοσιακή χρήση για ανοσοποιητικό"], dosage: "300–500 mg εκχυλίσματος, 2-3 φορές ημερησίως στα πρώτα συμπτώματα", timing: "Στην εμφάνιση συμπτωμάτων, ή καθημερινά σε περιόδους υψηλής έκθεσης", cautions: "Αποφυγή σε αυτοάνοσα νοσήματα· τα αποτελέσματα ποικίλλουν σημαντικά ανάλογα με το εκχύλισμα/είδος.", research: [{ headline: "Ανασκόπηση Cochrane βρήκε μέτριο προληπτικό όφελος", takeaway: "Μια συστηματική ανασκόπηση Cochrane σε δοκιμές πρόληψης βρήκε ότι τα προϊόντα echinacea μείωσαν την πιθανότητα κρυολογήματος κατά 10-20%, ενώ το όφελος στη θεραπεία ενεργού κρυολογήματος ήταν ασθενέστερο.", tag: "Ανασκόπηση Cochrane" }] }, es: { name: "Echinacea Purpurea", tagline: "Una hierba tradicional de apoyo inmunitario con evidencia modesta de prevención de resfriados." }, no: { name: "Echinacea Purpurea", tagline: "En tradisjonell immunstøttende urt med moderate bevis for forkjølelsesforebygging." } } },
  { id: "vitamin-b-complex", category: "health", tags: [], timingSlot: "morning", evidence: "Moderate", research: [{ headline: "Clearest benefit shows up in people who are actually deficient", takeaway: "B-vitamin trials consistently show the strongest, most measurable benefits — energy, mood, nerve function — in people with a genuine deficiency (common in vegans, older adults, and heavy drinkers), with weaker effects in already-replete individuals.", tag: "Clinical Nutrition Research" }], goals: ["energy", "nervous system"], mechanism: "B-vitamins (B1, B2, B3, B5, B6, B7, B9, B12) act as coenzymes in energy metabolism, red blood cell formation, and nervous system function.", benefits: ["Supports energy metabolism", "Particularly relevant for vegans (B12) and heavy trainees"], dosage: "1 dose/day per label (varies by formulation)", timing: "Morning, with a meal", cautions: "High-dose B6 (>100mg/day) long-term has been linked to nerve issues.", i18n: { en: { name: "Vitamin B-Complex", tagline: "A group of coenzyme vitamins essential for energy metabolism." }, el: { name: "Σύμπλεγμα Βιταμινών Β", tagline: "Ομάδα συνενζυμικών βιταμινών απαραίτητων για τον ενεργειακό μεταβολισμό.", goals: ["ενέργεια", "νευρικό σύστημα"], mechanism: "Οι βιταμίνες Β (B1, B2, B3, B5, B6, B7, B9, B12) λειτουργούν ως συνένζυμα στον ενεργειακό μεταβολισμό, τον σχηματισμό ερυθρών αιμοσφαιρίων και τη νευρική λειτουργία.", benefits: ["Στήριξη ενεργειακού μεταβολισμού", "Ιδιαίτερα σημαντικό για vegans (B12) και έντονα προπονούμενους"], dosage: "1 δόση/ημέρα βάσει ετικέτας", timing: "Πρωί, με γεύμα", cautions: "Υψηλές δόσεις B6 (>100mg/ημέρα) μακροχρόνια έχουν συνδεθεί με νευρικά προβλήματα.", research: [{ headline: "Το σαφέστερο όφελος εμφανίζεται σε όσους έχουν πραγματική ανεπάρκεια", takeaway: "Οι δοκιμές βιταμινών Β δείχνουν σταθερά τα ισχυρότερα οφέλη — ενέργεια, διάθεση, νευρική λειτουργία — σε άτομα με πραγματική ανεπάρκεια (συχνή σε vegan, ηλικιωμένους), με ασθενέστερα αποτελέσματα σε ήδη επαρκή άτομα.", tag: "Έρευνα Κλινικής Διατροφής" }] }, es: { name: "Complejo de Vitamina B", tagline: "Un grupo de vitaminas coenzimáticas esenciales para el metabolismo energético." }, no: { name: "Vitamin B-Kompleks", tagline: "En gruppe koenzym-vitaminer essensielle for energimetabolismen." } } },
  { id: "vitamin-c", category: "health", tags: [], timingSlot: "anytime", evidence: "High", research: [{ headline: "Doesn't prevent colds, but shortens them slightly", takeaway: "A Cochrane review of over 11,000 participants found regular vitamin C supplementation didn't reduce the number of colds in the general population, but consistently shortened cold duration by about 8% in adults.", tag: "Cochrane Review" }], goals: ["immune", "antioxidant", "collagen synthesis"], mechanism: "A water-soluble antioxidant and essential cofactor for collagen synthesis and immune cell function.", benefits: ["Supports immune function", "Cofactor for collagen production", "Antioxidant activity"], dosage: "500–1000 mg daily", timing: "Any time; pairs well with collagen supplementation", cautions: "Very high doses (>2g) may cause GI upset.", i18n: { en: { name: "Vitamin C", tagline: "A well-known antioxidant and essential collagen cofactor." }, el: { name: "Βιταμίνη C", tagline: "Γνωστό αντιοξειδωτικό και απαραίτητος συμπαράγοντας κολλαγόνου.", goals: ["ανοσοποιητικό", "αντιοξειδωτικά", "σύνθεση κολλαγόνου"], mechanism: "Υδατοδιαλυτό αντιοξειδωτικό και απαραίτητος συμπαράγοντας για τη σύνθεση κολλαγόνου και την ανοσολογική λειτουργία.", benefits: ["Στήριξη ανοσοποιητικού", "Συμπαράγοντας παραγωγής κολλαγόνου", "Αντιοξειδωτική δράση"], dosage: "500–1000 mg ημερησίως", timing: "Οποιαδήποτε ώρα· ταιριάζει καλά με συμπλήρωση κολλαγόνου", cautions: "Πολύ υψηλές δόσεις (>2g) μπορεί να προκαλέσουν γαστρεντερική δυσφορία.", research: [{ headline: "Δεν προλαμβάνει τα κρυολογήματα, αλλά τα μικραίνει ελαφρώς", takeaway: "Μια ανασκόπηση Cochrane σε πάνω από 11.000 συμμετέχοντες βρήκε ότι η τακτική βιταμίνη C δεν μείωσε τα κρυολογήματα στον γενικό πληθυσμό, αλλά μείωσε σταθερά τη διάρκειά τους κατά περίπου 8% σε ενήλικες.", tag: "Ανασκόπηση Cochrane" }] }, es: { name: "Vitamina C", tagline: "Un antioxidante conocido y un cofactor esencial del colágeno." }, no: { name: "Vitamin C", tagline: "En kjent antioksidant og essensiell kollagen-kofaktor." } } },
  { id: "vitamins-a-e-k", category: "health", tags: [], timingSlot: "anytime", evidence: "Moderate", research: [{ headline: "Fat-soluble vitamins require fat to absorb — and can accumulate", takeaway: "Unlike water-soluble vitamins, A, E, and K are stored in body fat and the liver, meaning excess doses (especially of A) don't simply get excreted — chronic over-supplementation carries real toxicity risk.", tag: "Pharmacology Research" }], goals: ["vision", "bone health", "blood clotting", "antioxidant"], mechanism: "Vitamin A supports vision and immune function; Vitamin E is a fat-soluble antioxidant; Vitamin K2 directs calcium toward bone rather than arteries.", benefits: ["A: vision & immune support", "E: antioxidant protection", "K2: works with vitamin D for bone/artery calcium regulation"], dosage: "Per label — typically A: 700–900mcg, E: 15mg, K2: 90–120mcg", timing: "With a meal containing fat", cautions: "Avoid mega-dosing vitamin A, especially during pregnancy — it's the most toxic fat-soluble vitamin in excess.", i18n: { en: { name: "Vitamins A, E & K", tagline: "The other fat-soluble vitamins — best taken with a meal containing fat." }, el: { name: "Βιταμίνες A, E & K", tagline: "Οι υπόλοιπες λιποδιαλυτές βιταμίνες — καλύτερα με γεύμα που περιέχει λίπος.", goals: ["όραση", "οστική υγεία", "πήξη αίματος", "αντιοξειδωτικά"], mechanism: "Η βιταμίνη A στηρίζει όραση και ανοσοποιητικό· η E είναι λιποδιαλυτό αντιοξειδωτικό· η K2 κατευθύνει το ασβέστιο προς τα οστά αντί για τις αρτηρίες.", benefits: ["A: στήριξη όρασης & ανοσοποιητικού", "E: αντιοξειδωτική προστασία", "K2: συνεργάζεται με τη D για ρύθμιση ασβεστίου οστών/αρτηριών"], dosage: "Βάσει ετικέτας — συνήθως A: 700–900mcg, E: 15mg, K2: 90–120mcg", timing: "Με γεύμα που περιέχει λίπος", cautions: "Αποφυγή υπερβολικής δόσης βιταμίνης A, ιδίως σε εγκυμοσύνη — η πιο τοξική λιποδιαλυτή βιταμίνη σε περίσσεια.", research: [{ headline: "Οι λιποδιαλυτές βιταμίνες χρειάζονται λίπος για απορρόφηση — και συσσωρεύονται", takeaway: "Σε αντίθεση με τις υδατοδιαλυτές, οι A, E, K αποθηκεύονται στο λίπος και το συκώτι, οπότε η περίσσεια (ειδικά της A) δεν αποβάλλεται απλά — η χρόνια υπερβολική λήψη έχει πραγματικό κίνδυνο τοξικότητας.", tag: "Φαρμακολογική Έρευνα" }] }, es: { name: "Vitaminas A, E y K", tagline: "Las otras vitaminas liposolubles — mejor tomadas con una comida que contenga grasa." }, no: { name: "Vitamin A, E og K", tagline: "De andre fettløselige vitaminene — best tatt med et fettholdig måltid." } } },
  { id: "quercetin", category: "health", tags: [], timingSlot: "morning", evidence: "Moderate", research: [{ headline: "Pairs with exercise to modestly reduce infection risk", takeaway: "A meta-analysis found quercetin supplementation reduced upper respiratory tract infection incidence specifically in physically stressed/exercising populations, with less clear benefit in sedentary people.", tag: "Meta-Analysis" }], goals: ["immune", "antioxidant"], mechanism: "A flavonoid antioxidant found in onions/apples, studied for anti-inflammatory and immune-modulating effects, especially around intense training periods.", benefits: ["Studied for reduced infection risk during heavy training", "Antioxidant/anti-inflammatory activity"], dosage: "500–1000 mg daily", timing: "With a meal", cautions: "Poor bioavailability alone — often paired with bromelain or vitamin C to improve absorption.", i18n: { en: { name: "Quercetin", tagline: "A plant flavonoid studied for immune support during heavy training." }, el: { name: "Κερκετίνη", tagline: "Φυτικό φλαβονοειδές που ερευνάται για ανοσοποιητική στήριξη σε έντονη προπόνηση.", goals: ["ανοσοποιητικό", "αντιοξειδωτικά"], mechanism: "Φλαβονοειδές αντιοξειδωτικό που βρίσκεται σε κρεμμύδια/μήλα, ερευνάται για αντιφλεγμονώδη και ανοσορυθμιστική δράση, ιδίως σε περιόδους έντονης προπόνησης.", benefits: ["Ερευνάται για μειωμένο κίνδυνο λοίμωξης σε έντονη προπόνηση", "Αντιοξειδωτική/αντιφλεγμονώδης δράση"], dosage: "500–1000 mg ημερησίως", timing: "Με γεύμα", cautions: "Χαμηλή βιοδιαθεσιμότητα μόνη της — συχνά συνδυάζεται με βρωμελίνη ή βιταμίνη C.", research: [{ headline: "Συνδυάζεται με άσκηση για μέτρια μείωση κινδύνου λοίμωξης", takeaway: "Μια μετα-ανάλυση βρήκε ότι η κερκετίνη μείωσε τη συχνότητα λοιμώξεων ανώτερου αναπνευστικού ειδικά σε πληθυσμούς με φυσική καταπόνηση/άσκηση.", tag: "Μετα-ανάλυση" }] }, es: { name: "Quercetina", tagline: "Un flavonoide vegetal estudiado por su apoyo inmunitario durante entrenamientos intensos." }, no: { name: "Quercetin", tagline: "Et plantebasert flavonoid studert for immunstøtte under hard trening." } } },
  { id: "dandelion", category: "health", tags: [], timingSlot: "morning", evidence: "Limited", research: [{ headline: "Mild diuretic effect confirmed, but not much else", takeaway: "A small human trial found dandelion leaf extract produced a measurable, short-term increase in urine output, supporting its traditional use as a diuretic — but broader claims about liver/digestive support have far less direct human trial support.", tag: "Small Human Trial" }], goals: ["water balance", "digestion"], mechanism: "Traditionally used as a mild diuretic and digestive bitter; contains compounds studied for supporting liver enzyme activity, though human evidence is limited.", benefits: ["Mild diuretic effect", "Traditional digestive support use"], dosage: "500–2000 mg root/leaf extract daily", timing: "Morning, with a meal", cautions: "Diuretic effect means it can interact with blood pressure/lithium medications — check with a doctor if on diuretics.", i18n: { en: { name: "Dandelion", tagline: "A traditional mild diuretic and digestive herb." }, el: { name: "Πικραλίδα", tagline: "Παραδοσιακό ήπιο διουρητικό και πεπτικό βότανο.", goals: ["ισορροπία νερού", "πέψη"], mechanism: "Παραδοσιακά χρησιμοποιείται ως ήπιο διουρητικό και πικρό πεπτικό· περιέχει ενώσεις που ερευνώνται για στήριξη ηπατικής ενζυμικής δραστηριότητας.", benefits: ["Ήπια διουρητική δράση", "Παραδοσιακή χρήση για πεπτική στήριξη"], dosage: "500–2000 mg εκχυλίσματος ρίζας/φύλλου ημερησίως", timing: "Πρωί, με γεύμα", cautions: "Η διουρητική δράση σημαίνει πιθανή αλληλεπίδραση με φάρμακα πίεσης/λιθίου.", research: [{ headline: "Επιβεβαιωμένη ήπια διουρητική δράση, αλλά λίγα άλλα", takeaway: "Μια μικρή ανθρώπινη δοκιμή βρήκε μετρήσιμη, βραχυπρόθεσμη αύξηση παραγωγής ούρων από εκχύλισμα φύλλων πικραλίδας, υποστηρίζοντας την παραδοσιακή χρήση της ως διουρητικό.", tag: "Μικρή Ανθρώπινη Δοκιμή" }] }, es: { name: "Diente de León", tagline: "Una hierba tradicional diurética suave y digestiva." }, no: { name: "Løvetann", tagline: "En tradisjonell mild vanndrivende og fordøyelsesfremmende urt." } } },
  { id: "synephrine", category: "performance", tags: ["stimulant"], timingSlot: "pre-workout", evidence: "Limited", research: [{ headline: "Small metabolic bump confirmed, but weaker than caffeine", takeaway: "Studies on bitter orange (synephrine) show a modest, short-term increase in metabolic rate and blood pressure, generally smaller in magnitude than caffeine's effect and often studied in combination with caffeine rather than alone.", tag: "Clinical Research" }], goals: ["fat loss", "energy"], mechanism: "A stimulant compound from bitter orange, structurally similar to ephedrine but weaker; activates beta-adrenergic receptors linked to fat mobilization and thermogenesis.", benefits: ["Modest thermogenic/metabolic boost", "Often combined with caffeine in fat-burner products"], dosage: "20–50 mg daily", timing: "30–60 minutes before training", cautions: "Can raise heart rate/blood pressure. Avoid combining with other stimulants or with cardiovascular conditions.", i18n: { en: { name: "Synephrine (Bitter Orange)", tagline: "A milder, legal alternative to ephedrine used in fat burners." }, el: { name: "Συνεφρίνη (Πικρό Πορτοκάλι)", tagline: "Ηπιότερη, νόμιμη εναλλακτική της εφεδρίνης σε προϊόντα λιπόλυσης.", goals: ["λιπόλυση", "ενέργεια"], mechanism: "Διεγερτική ένωση από το πικρό πορτοκάλι, δομικά παρόμοια με την εφεδρίνη αλλά ασθενέστερη· ενεργοποιεί βήτα-αδρενεργικούς υποδοχείς.", benefits: ["Μέτρια θερμογενετική/μεταβολική ώθηση", "Συχνά συνδυάζεται με καφεΐνη σε προϊόντα λιπόλυσης"], dosage: "20–50 mg ημερησίως", timing: "30–60 λεπτά πριν την προπόνηση", cautions: "Μπορεί να αυξήσει καρδιακό ρυθμό/πίεση. Αποφυγή συνδυασμού με άλλα διεγερτικά ή σε καρδιαγγειακά προβλήματα.", research: [{ headline: "Μικρή μεταβολική αύξηση επιβεβαιωμένη, αλλά ασθενέστερη από την καφεΐνη", takeaway: "Μελέτες στο πικρό πορτοκάλι (συνεφρίνη) δείχνουν μέτρια, βραχυπρόθεσμη αύξηση μεταβολικού ρυθμού και πίεσης, γενικά μικρότερη από την καφεΐνη.", tag: "Κλινική Έρευνα" }] }, es: { name: "Sinefrina (Naranja Amarga)", tagline: "Una alternativa más suave y legal a la efedrina usada en quemadores de grasa." }, no: { name: "Synefrin (Bitter Appelsin)", tagline: "Et mildere, lovlig alternativ til efedrin brukt i fettforbrennere." } } },
  { id: "cla", category: "muscle", tags: [], timingSlot: "anytime", evidence: "Limited", research: [{ headline: "A large meta-analysis found only trivial fat loss", takeaway: "A meta-analysis of 18 randomized trials found CLA supplementation produced a statistically significant but practically tiny fat loss of about 0.05kg/week, with effects plateauing after the first month.", tag: "Meta-Analysis" }], goals: ["body composition"], mechanism: "A group of fatty acid isomers found naturally in beef/dairy, studied for possible effects on fat cell metabolism, though the mechanism in humans remains unclear.", benefits: ["Very small documented fat-loss effect", "Popular but overstated in marketing"], dosage: "3.2–6 g daily", timing: "With meals, split into 2-3 doses", cautions: "Effect size is small enough that most people won't notice a real difference.", i18n: { en: { name: "CLA (Conjugated Linoleic Acid)", tagline: "A popular fat-loss aid with a real but very small measured effect." }, el: { name: "CLA (Συζευγμένο Λινολεϊκό Οξύ)", tagline: "Δημοφιλές βοήθημα λιπόλυσης με πραγματικό αλλά πολύ μικρό μετρημένο όφελος.", goals: ["σύσταση σώματος"], mechanism: "Ομάδα ισομερών λιπαρών οξέων που βρίσκονται φυσικά σε βοδινό/γαλακτοκομικά, ερευνώνται για πιθανή επίδραση στον μεταβολισμό λιποκυττάρων.", benefits: ["Πολύ μικρό τεκμηριωμένο όφελος λιπόλυσης", "Δημοφιλές αλλά υπερεκτιμημένο στο μάρκετινγκ"], dosage: "3.2–6 g ημερησίως", timing: "Με γεύματα, σε 2-3 δόσεις", cautions: "Το μέγεθος επίδρασης είναι αρκετά μικρό ώστε οι περισσότεροι να μην το παρατηρήσουν στην πράξη.", research: [{ headline: "Μεγάλη μετα-ανάλυση βρήκε μόνο ασήμαντη απώλεια λίπους", takeaway: "Μια μετα-ανάλυση 18 τυχαιοποιημένων δοκιμών βρήκε στατιστικά σημαντική αλλά πρακτικά αμελητέα απώλεια λίπους περίπου 0.05kg/εβδομάδα, με τα αποτελέσματα να σταθεροποιούνται μετά τον πρώτο μήνα.", tag: "Μετα-ανάλυση" }] }, es: { name: "CLA (Ácido Linoleico Conjugado)", tagline: "Una ayuda popular para perder grasa con un efecto real pero muy pequeño." }, no: { name: "CLA (Konjugert Linolsyre)", tagline: "Et populært fettforbrenningsmiddel med en reell, men svært liten effekt." } } },
  { id: "garcinia-cambogia", category: "health", tags: [], timingSlot: "morning", evidence: "Limited", research: [{ headline: "Meta-analysis found only marginal weight loss, and safety flags followed", takeaway: "A meta-analysis of randomized trials found Garcinia cambogia (hydroxycitric acid) produced only marginally more weight loss than placebo, while case reports of liver toxicity led several countries to restrict high-dose products.", tag: "Meta-Analysis & Safety Reports" }], goals: ["fat loss"], mechanism: "Contains hydroxycitric acid (HCA), theorized to inhibit an enzyme involved in fat synthesis and suppress appetite, though human results are inconsistent.", benefits: ["Marketed for appetite suppression and fat loss", "Effect size is marginal at best in trials"], dosage: "500–1000 mg (as HCA) before meals", timing: "30–60 minutes before meals", cautions: "Case reports of liver toxicity at high doses — avoid with existing liver conditions.", i18n: { en: { name: "Garcinia Cambogia", tagline: "A once-hyped fat-loss fruit extract with marginal real-world benefit." }, el: { name: "Garcinia Cambogia", tagline: "Κάποτε διαφημισμένο φρουτικό εκχύλισμα λιπόλυσης με οριακό πραγματικό όφελος.", goals: ["λιπόλυση"], mechanism: "Περιέχει υδροξυκιτρικό οξύ (HCA), θεωρητικά αναστέλλει ένζυμο εμπλεκόμενο στη λιπογένεση και καταστέλλει την όρεξη, αν και τα ανθρώπινα αποτελέσματα είναι ασυνεπή.", benefits: ["Διαφημίζεται για καταστολή όρεξης και λιπόλυση", "Οριακό όφελος στις δοκιμές"], dosage: "500–1000 mg (ως HCA) πριν τα γεύματα", timing: "30–60 λεπτά πριν τα γεύματα", cautions: "Αναφορές ηπατοτοξικότητας σε υψηλές δόσεις — αποφυγή σε υπάρχοντα ηπατικά προβλήματα.", research: [{ headline: "Μετα-ανάλυση βρήκε μόνο οριακή απώλεια βάρους, και ακολούθησαν προειδοποιήσεις ασφάλειας", takeaway: "Μια μετα-ανάλυση τυχαιοποιημένων δοκιμών βρήκε ότι το Garcinia cambogia (υδροξυκιτρικό οξύ) παρήγαγε μόνο οριακά μεγαλύτερη απώλεια βάρους από το εικονικό φάρμακο, ενώ αναφορές ηπατοτοξικότητας οδήγησαν σε περιορισμούς.", tag: "Μετα-ανάλυση & Αναφορές Ασφάλειας" }] }, es: { name: "Garcinia Cambogia", tagline: "Un extracto de fruta para pérdida de grasa antes muy popular, con beneficio real marginal." }, no: { name: "Garcinia Cambogia", tagline: "Et tidligere hypet fruktekstrakt for fettforbrenning med marginal reell effekt." } } },
  { id: "beef-protein", category: "muscle", tags: [], timingSlot: "post-workout", evidence: "Moderate", research: [{ headline: "A head-to-head trial found comparable muscle results to whey", takeaway: "A randomized controlled trial comparing beef protein isolate to whey protein isolate over 8 weeks of resistance training found no significant difference in muscle mass or strength gains between the two.", tag: "Randomized Controlled Trial" }], goals: ["muscle mass", "recovery"], mechanism: "A hydrolyzed, dairy-free complete protein isolated from beef, containing a full essential amino acid profile comparable to whey.", benefits: ["Dairy-free complete protein alternative", "Comparable muscle-building results to whey in trials"], dosage: "20–40 g per serving", timing: "Post-workout, or any protein gap", cautions: "Good option for dairy-intolerant individuals who want a whey alternative.", i18n: { en: { name: "Beef Protein Isolate", tagline: "A dairy-free complete protein with muscle-building results comparable to whey." }, el: { name: "Απομονωμένη Πρωτεΐνη Βοδινού", tagline: "Πλήρης πρωτεΐνη χωρίς γαλακτοκομικά, με αποτελέσματα συγκρίσιμα με τη whey.", goals: ["μυϊκή μάζα", "ανάρρωση"], mechanism: "Υδρολυμένη, χωρίς γαλακτοκομικά πλήρης πρωτεΐνη από βοδινό, με πλήρες προφίλ απαραίτητων αμινοξέων συγκρίσιμο με την whey.", benefits: ["Εναλλακτική πλήρης πρωτεΐνη χωρίς γαλακτοκομικά", "Συγκρίσιμα αποτελέσματα μυϊκής ανάπτυξης με τη whey σε δοκιμές"], dosage: "20–40 g ανά μερίδα", timing: "Μετά την προπόνηση, ή σε οποιοδήποτε κενό πρωτεΐνης", cautions: "Καλή επιλογή για άτομα με δυσανεξία γαλακτοκομικών που θέλουν εναλλακτική της whey.", research: [{ headline: "Άμεση σύγκριση βρήκε παρόμοια αποτελέσματα με την whey", takeaway: "Μια τυχαιοποιημένη ελεγχόμενη δοκιμή σύγκρισης πρωτεΐνης βοδινού με whey σε 8 εβδομάδες προπόνησης αντιστάσεων δεν βρήκε σημαντική διαφορά σε μυϊκή μάζα ή δύναμη.", tag: "Τυχαιοποιημένη Ελεγχόμενη Δοκιμή" }] }, es: { name: "Aislado de Proteína de Res", tagline: "Una proteína completa sin lácteos con resultados comparables a la del suero." }, no: { name: "Biffprotein Isolat", tagline: "Et melkefritt komplett protein med muskelbyggende resultater som ligner myse." } } },
  { id: "pea-protein", category: "muscle", tags: [], timingSlot: "post-workout", evidence: "Moderate", research: [{ headline: "A landmark 12-week trial found comparable muscle thickness gains to whey", takeaway: "A randomized trial in resistance-trained men found pea protein produced increases in bicep muscle thickness statistically indistinguishable from whey protein over 12 weeks of training.", tag: "Randomized Trial" }], goals: ["muscle mass", "recovery"], mechanism: "A vegan, allergen-friendly protein source rich in BCAAs (though lower in methionine than animal proteins), often paired with rice protein to complete the amino acid profile.", benefits: ["Vegan-friendly complete-enough protein", "Comparable muscle-building results to whey in trials", "Hypoallergenic — good for dairy/soy sensitivities"], dosage: "20–30 g per serving", timing: "Post-workout, or any protein gap", cautions: "Slightly gritty texture compared to whey; often blended with other plant proteins.", i18n: { en: { name: "Pea Protein", tagline: "A vegan protein with muscle-building results on par with whey." }, el: { name: "Πρωτεΐνη Μπιζελιού", tagline: "Vegan πρωτεΐνη με αποτελέσματα μυϊκής ανάπτυξης αντίστοιχα με τη whey.", goals: ["μυϊκή μάζα", "ανάρρωση"], mechanism: "Vegan πρωτεΐνη φιλική σε αλλεργικούς, πλούσια σε BCAA (αν και χαμηλότερη σε μεθειονίνη από τις ζωικές), συχνά συνδυάζεται με ρυζοπρωτεΐνη για πλήρες προφίλ.", benefits: ["Vegan πρωτεΐνη επαρκούς προφίλ", "Συγκρίσιμα αποτελέσματα μυϊκής ανάπτυξης με τη whey σε δοκιμές", "Υποαλλεργική — καλή για ευαισθησίες γαλακτοκομικών/σόγιας"], dosage: "20–30 g ανά μερίδα", timing: "Μετά την προπόνηση, ή σε οποιοδήποτε κενό πρωτεΐνης", cautions: "Ελαφρώς πιο τραχιά υφή σε σχέση με τη whey· συχνά αναμειγνύεται με άλλες φυτικές πρωτεΐνες.", research: [{ headline: "Βασική δοκιμή 12 εβδομάδων βρήκε συγκρίσιμα κέρδη μυϊκού πάχους με τη whey", takeaway: "Μια τυχαιοποιημένη δοκιμή σε προπονημένους άνδρες βρήκε ότι η πρωτεΐνη μπιζελιού παρήγαγε αύξηση πάχους δικεφάλου στατιστικά αδιάκριτη από τη whey σε 12 εβδομάδες.", tag: "Τυχαιοποιημένη Δοκιμή" }] }, es: { name: "Proteína de Guisante", tagline: "Una proteína vegana con resultados de crecimiento muscular a la par del suero." }, no: { name: "Erteprotein", tagline: "Et vegansk protein med muskelbyggende resultater på nivå med myse." } } },
  { id: "hemp-protein", category: "muscle", tags: [], timingSlot: "anytime", evidence: "Limited", research: [{ headline: "Lower protein density and an incomplete amino acid profile vs. other plant proteins", takeaway: "Hemp protein powder is typically only 50% protein by weight (vs. 80%+ for whey/pea isolates) and runs low in lysine, meaning larger servings or pairing with other proteins is needed to match muscle-building doses.", tag: "Nutrient Composition Analysis" }], goals: ["muscle mass", "fiber intake"], mechanism: "A plant protein from hemp seeds that also delivers fiber and omega-3/omega-6 fats, but with lower protein density and a less complete amino acid profile than whey, pea, or beef protein.", benefits: ["Adds fiber and healthy fats alongside protein", "Vegan and allergen-friendly"], dosage: "30–40 g per serving (to hit ~20g protein)", timing: "Any time — best paired with another protein source", cautions: "Not a complete standalone protein for muscle-building goals — pair with a complementary source.", i18n: { en: { name: "Hemp Protein", tagline: "A fiber-rich plant protein, best paired with another protein source." }, el: { name: "Πρωτεΐνη Κάνναβης", tagline: "Φυτική πρωτεΐνη πλούσια σε φυτικές ίνες, καλύτερα σε συνδυασμό με άλλη πηγή.", goals: ["μυϊκή μάζα", "πρόσληψη φυτικών ινών"], mechanism: "Φυτική πρωτεΐνη από σπόρους κάνναβης που παρέχει και φυτικές ίνες και ωμέγα-3/6 λιπαρά, αλλά με χαμηλότερη πυκνότητα πρωτεΐνης και λιγότερο πλήρες προφίλ αμινοξέων.", benefits: ["Προσθέτει φυτικές ίνες και υγιή λιπαρά μαζί με πρωτεΐνη", "Vegan και φιλική σε αλλεργικούς"], dosage: "30–40 g ανά μερίδα (για ~20g πρωτεΐνη)", timing: "Οποιαδήποτε ώρα — καλύτερα σε συνδυασμό με άλλη πηγή πρωτεΐνης", cautions: "Δεν είναι πλήρης αυτόνομη πρωτεΐνη για στόχους μυϊκής ανάπτυξης — συνδύασέ την με συμπληρωματική πηγή.", research: [{ headline: "Χαμηλότερη πυκνότητα πρωτεΐνης και ελλιπές προφίλ αμινοξέων έναντι άλλων φυτικών πρωτεϊνών", takeaway: "Η σκόνη πρωτεΐνης κάνναβης είναι συνήθως μόλις 50% πρωτεΐνη κατά βάρος (έναντι 80%+ για whey/μπιζέλι) και χαμηλή σε λυσίνη.", tag: "Ανάλυση Σύνθεσης Θρεπτικών" }] }, es: { name: "Proteína de Cáñamo", tagline: "Una proteína vegetal rica en fibra, mejor combinada con otra fuente de proteína." }, no: { name: "Hampeprotein", tagline: "Et fiberrikt planteprotein, best kombinert med en annen proteinkilde." } } },
  { id: "casein", category: "recovery", tags: [], timingSlot: "evening", evidence: "Moderate", research: [{ headline: "Classic overnight study found it sustains protein synthesis for hours", takeaway: "The landmark Boirie et al. study found casein's slow digestion produced a gradual, sustained rise in blood amino acids over several hours — compared to whey's fast spike-and-drop pattern — making it well suited for overnight recovery.", tag: "Foundational Study (Boirie)" }], goals: ["muscle mass", "recovery", "overnight"], mechanism: "A slow-digesting milk protein that forms a gel in the stomach, releasing amino acids gradually over several hours — ideal for extended gaps like overnight sleep.", benefits: ["Sustained amino acid release overnight", "Supports muscle protein synthesis during sleep"], dosage: "20–40 g before bed", timing: "30–60 minutes before sleep", cautions: "Same lactose-intolerance considerations as whey; micellar casein digests slower than casein isolate/hydrolysate.", i18n: { en: { name: "Casein", tagline: "A slow-digesting milk protein ideal for overnight muscle recovery." }, el: { name: "Καζεΐνη", tagline: "Αργά χωνευόμενη πρωτεΐνη γάλακτος, ιδανική για νυχτερινή μυϊκή ανάρρωση.", goals: ["μυϊκή μάζα", "ανάρρωση", "διανυκτέρευση"], mechanism: "Αργά χωνευόμενη πρωτεΐνη γάλακτος που σχηματίζει γέλη στο στομάχι, απελευθερώνοντας αμινοξέα σταδιακά για αρκετές ώρες — ιδανική για κενά όπως ο ύπνος.", benefits: ["Παρατεταμένη απελευθέρωση αμινοξέων κατά τη διάρκεια της νύχτας", "Στηρίζει τη μυϊκή πρωτεϊνοσύνθεση κατά τον ύπνο"], dosage: "20–40 g πριν τον ύπνο", timing: "30–60 λεπτά πριν τον ύπνο", cautions: "Ίδιες παρατηρήσεις δυσανεξίας λακτόζης με τη whey· η μικυλλιακή καζεΐνη χωνεύεται πιο αργά από το isolate/hydrolysate.", research: [{ headline: "Κλασική μελέτη βρήκε ότι στηρίζει την πρωτεϊνοσύνθεση για ώρες", takeaway: "Η θεμελιώδης μελέτη των Boirie et al. βρήκε ότι η αργή πέψη της καζεΐνης παράγει σταδιακή, παρατεταμένη άνοδο αμινοξέων στο αίμα για αρκετές ώρες — σε αντίθεση με την ταχεία αιχμή της whey.", tag: "Θεμελιώδης Μελέτη (Boirie)" }] }, es: { name: "Caseína", tagline: "Una proteína de leche de digestión lenta ideal para la recuperación muscular nocturna." }, no: { name: "Kasein", tagline: "Et sakte-fordøyelig melkeprotein ideelt for muskelgjenoppretting over natten." } } },
  { id: "d-aspartic-acid", category: "muscle", tags: [], timingSlot: "morning", evidence: "Limited", research: [{ headline: "Early positive trial hasn't held up in trained athletes", takeaway: "An initial 2009 study found DAA raised testosterone in untrained men, but subsequent trials in resistance-trained athletes found no significant testosterone or strength benefit — and one found levels actually declined with prolonged use.", tag: "Conflicting Trial Evidence" }], goals: ["testosterone support"], mechanism: "An amino acid involved in the release of luteinizing hormone, theorized to stimulate testosterone production, though effects appear inconsistent and don't replicate well in trained populations.", benefits: ["Marketed as a natural testosterone booster", "Evidence in trained individuals is weak/inconsistent"], dosage: "3 g daily", timing: "Morning", cautions: "Don't expect a testosterone boost if you're already a trained athlete — evidence mostly fails to replicate here.", i18n: { en: { name: "D-Aspartic Acid (DAA)", tagline: "A popular 'test booster' with evidence that mostly fails to hold up in trained athletes." }, el: { name: "D-Ασπαρτικό Οξύ (DAA)", tagline: "Δημοφιλής 'ενισχυτής τεστοστερόνης' με στοιχεία που συνήθως δεν επιβεβαιώνονται σε προπονημένους.", goals: ["στήριξη τεστοστερόνης"], mechanism: "Αμινοξύ εμπλεκόμενο στην απελευθέρωση ωχρινοτρόπου ορμόνης, θεωρητικά διεγείρει την παραγωγή τεστοστερόνης, αλλά τα αποτελέσματα φαίνονται ασυνεπή σε προπονημένους.", benefits: ["Διαφημίζεται ως φυσικός ενισχυτής τεστοστερόνης", "Ασθενή/ασυνεπή στοιχεία σε προπονημένα άτομα"], dosage: "3 g ημερησίως", timing: "Πρωί", cautions: "Μην περιμένεις αύξηση τεστοστερόνης αν είσαι ήδη προπονημένος αθλητής — τα στοιχεία συνήθως δεν επιβεβαιώνονται.", research: [{ headline: "Αρχική θετική δοκιμή δεν επιβεβαιώθηκε σε προπονημένους αθλητές", takeaway: "Μια αρχική μελέτη του 2009 βρήκε αύξηση τεστοστερόνης σε μη προπονημένους άνδρες, αλλά επόμενες δοκιμές σε προπονημένους αθλητές δεν βρήκαν σημαντικό όφελος — μία μάλιστα βρήκε μείωση με παρατεταμένη χρήση.", tag: "Αντικρουόμενα Στοιχεία Δοκιμών" }] }, es: { name: "Ácido D-Aspártico (DAA)", tagline: "Un popular 'potenciador de testosterona' cuya evidencia no se sostiene en atletas entrenados." }, no: { name: "D-Asparaginsyre (DAA)", tagline: "En populær 'testosteronbooster' hvor bevisene stort sett ikke holder for trente utøvere." } } },
  { id: "glucosamine-chondroitin", category: "recovery", tags: [], timingSlot: "anytime", evidence: "Moderate", research: [{ headline: "The largest NIH trial found benefit only in moderate-to-severe cases", takeaway: "The GAIT trial, the largest NIH-funded study of its kind, found glucosamine/chondroitin combined performed no better than placebo for mild knee osteoarthritis overall, but showed a significant benefit in the subgroup with moderate-to-severe pain.", tag: "Landmark Trial (GAIT)" }], goals: ["joint health"], mechanism: "Building blocks of cartilage — glucosamine supports cartilage matrix formation while chondroitin helps retain water in cartilage tissue for cushioning.", benefits: ["May help moderate-to-severe joint pain", "Long track record of use for joint health"], dosage: "1500 mg glucosamine + 1200 mg chondroitin daily", timing: "With a meal", cautions: "Shellfish-derived glucosamine — check for allergy. Effects take 4-8+ weeks to become noticeable.", i18n: { en: { name: "Glucosamine & Chondroitin", tagline: "Classic joint-support supplements, most helpful for moderate-to-severe pain." }, el: { name: "Γλυκοζαμίνη & Χονδροϊτίνη", tagline: "Κλασικά συμπληρώματα αρθρικής στήριξης, πιο χρήσιμα σε μέτριο-σοβαρό πόνο.", goals: ["αρθρική υγεία"], mechanism: "Δομικά στοιχεία του χόνδρου — η γλυκοζαμίνη στηρίζει τον σχηματισμό χόνδρινης μήτρας ενώ η χονδροϊτίνη βοηθά στη συγκράτηση νερού στον χόνδρο.", benefits: ["Πιθανή βοήθεια σε μέτριο-σοβαρό αρθρικό πόνο", "Μακρά ιστορία χρήσης για αρθρική υγεία"], dosage: "1500 mg γλυκοζαμίνη + 1200 mg χονδροϊτίνη ημερησίως", timing: "Με γεύμα", cautions: "Η γλυκοζαμίνη συχνά προέρχεται από οστρακοειδή — έλεγχος αλλεργίας. Τα αποτελέσματα χρειάζονται 4-8+ εβδομάδες.", research: [{ headline: "Η μεγαλύτερη δοκιμή NIH βρήκε όφελος μόνο σε μέτριες-σοβαρές περιπτώσεις", takeaway: "Η δοκιμή GAIT, η μεγαλύτερη χρηματοδοτούμενη από NIH στο είδος της, βρήκε ότι ο συνδυασμός γλυκοζαμίνης/χονδροϊτίνης δεν ήταν καλύτερος από το εικονικό φάρμακο σε ήπια οστεοαρθρίτιδα γόνατος συνολικά, αλλά έδειξε σημαντικό όφελος στην υποομάδα με μέτριο-σοβαρό πόνο.", tag: "Βασική Δοκιμή (GAIT)" }] }, es: { name: "Glucosamina y Condroitina", tagline: "Suplementos clásicos de apoyo articular, más útiles para dolor de moderado a severo." }, no: { name: "Glukosamin og Kondroitin", tagline: "Klassiske leddstøttende tilskudd, mest nyttige for moderat til alvorlig smerte." } } },
  { id: "msm", category: "recovery", tags: [], timingSlot: "anytime", evidence: "Limited", research: [{ headline: "Small trials show reduced pain and stiffness in arthritis", takeaway: "Several small randomized trials found MSM (methylsulfonylmethane) supplementation modestly reduced pain and improved physical function scores in people with knee osteoarthritis over 8-12 weeks compared to placebo.", tag: "Small Randomized Trials" }], goals: ["joint health", "inflammation"], mechanism: "A naturally occurring sulfur compound studied for anti-inflammatory effects and as a building block for connective tissue.", benefits: ["Studied for joint pain/stiffness relief", "Often paired with glucosamine/chondroitin"], dosage: "1500–3000 mg daily", timing: "With meals, split into 2 doses", cautions: "Generally well tolerated; mild GI upset possible at high doses.", i18n: { en: { name: "MSM (Methylsulfonylmethane)", tagline: "A sulfur compound studied for joint pain and connective tissue support." }, el: { name: "MSM (Μεθυλοσουλφονυλομεθάνιο)", tagline: "Ένωση θείου που ερευνάται για αρθρικό πόνο και στήριξη συνδετικού ιστού.", goals: ["αρθρική υγεία", "φλεγμονή"], mechanism: "Φυσική ένωση θείου που ερευνάται για αντιφλεγμονώδη δράση και ως δομικό στοιχείο συνδετικού ιστού.", benefits: ["Ερευνάται για ανακούφιση αρθρικού πόνου/δυσκαμψίας", "Συχνά συνδυάζεται με γλυκοζαμίνη/χονδροϊτίνη"], dosage: "1500–3000 mg ημερησίως", timing: "Με γεύματα, σε 2 δόσεις", cautions: "Γενικά καλά ανεκτό· πιθανή ήπια γαστρεντερική δυσφορία σε υψηλές δόσεις.", research: [{ headline: "Μικρές δοκιμές δείχνουν μειωμένο πόνο και δυσκαμψία σε αρθρίτιδα", takeaway: "Αρκετές μικρές τυχαιοποιημένες δοκιμές βρήκαν ότι το MSM μείωσε μέτρια τον πόνο και βελτίωσε τη λειτουργικότητα σε άτομα με οστεοαρθρίτιδα γόνατος.", tag: "Μικρές Τυχαιοποιημένες Δοκιμές" }] }, es: { name: "MSM (Metilsulfonilmetano)", tagline: "Un compuesto de azufre estudiado por su apoyo al dolor articular y al tejido conectivo." }, no: { name: "MSM (Metylsulfonylmetan)", tagline: "En svovelforbindelse studert for leddsmerter og støtte til bindevev." } } },
  { id: "proline", category: "recovery", tags: [], timingSlot: "anytime", evidence: "Limited", research: [{ headline: "A structural building block, not a standalone performance supplement", takeaway: "Proline (and hydroxyproline) makes up roughly 25% of collagen's amino acid content; research on proline mostly studies it as part of collagen supplementation rather than as an isolated ingredient with its own trial base.", tag: "Nutrient Composition Research" }], goals: ["joints", "skin", "connective tissue"], mechanism: "A non-essential amino acid that's a major structural component of collagen, involved in wound healing and connective tissue repair.", benefits: ["Structural component of collagen", "Supports connective tissue repair"], dosage: "Usually obtained via collagen (10-15g) rather than isolated proline", timing: "With a meal", cautions: "Rarely supplemented alone — most people get it as part of a collagen or complete protein source.", i18n: { en: { name: "Proline", tagline: "A key building block of collagen, usually taken as part of a collagen supplement." }, el: { name: "Προλίνη", tagline: "Βασικό δομικό στοιχείο του κολλαγόνου, συνήθως λαμβάνεται μέσω συμπληρώματος κολλαγόνου.", goals: ["αρθρώσεις", "δέρμα", "συνδετικός ιστός"], mechanism: "Μη απαραίτητο αμινοξύ που αποτελεί βασικό δομικό συστατικό του κολλαγόνου, εμπλέκεται στην επούλωση πληγών και επιδιόρθωση συνδετικού ιστού.", benefits: ["Δομικό συστατικό του κολλαγόνου", "Στηρίζει την επιδιόρθωση συνδετικού ιστού"], dosage: "Συνήθως λαμβάνεται μέσω κολλαγόνου (10-15g) αντί μεμονωμένης προλίνης", timing: "Με γεύμα", cautions: "Σπάνια λαμβάνεται μεμονωμένα — οι περισσότεροι τη λαμβάνουν μέσω κολλαγόνου ή πλήρους πρωτεΐνης.", research: [{ headline: "Δομικό στοιχείο, όχι αυτόνομο συμπλήρωμα απόδοσης", takeaway: "Η προλίνη (και υδροξυπρολίνη) αποτελεί περίπου το 25% του αμινοξικού περιεχομένου του κολλαγόνου· η έρευνα τη μελετά κυρίως ως μέρος της συμπλήρωσης κολλαγόνου.", tag: "Έρευνα Σύνθεσης Θρεπτικών" }] }, es: { name: "Prolina", tagline: "Un componente clave del colágeno, normalmente tomado como parte de un suplemento de colágeno." }, no: { name: "Prolin", tagline: "En nøkkelbyggestein i kollagen, vanligvis tatt som del av et kollagentilskudd." } } },
  { id: "eaa", category: "recovery", tags: [], timingSlot: "pre-workout", evidence: "Moderate", research: [{ headline: "Includes all 9 essential amino acids — a step up from BCAA alone", takeaway: "Unlike BCAA (just 3 amino acids), EAA supplements provide all 9 essential amino acids the body can't produce, and studies find EAA supplementation stimulates muscle protein synthesis more effectively than BCAA alone.", tag: "Comparative Research" }], goals: ["muscle mass", "recovery"], mechanism: "Provides all 9 essential amino acids the body cannot synthesize on its own — a more complete stimulus for muscle protein synthesis than BCAA alone.", benefits: ["More complete muscle-building stimulus than BCAA", "Useful for fasted training or low-protein meals"], dosage: "10–15 g per serving", timing: "Around training", cautions: "Redundant if daily protein intake from complete sources is already sufficient.", i18n: { en: { name: "EAA (Essential Amino Acids)", tagline: "All 9 essential amino acids — a more complete alternative to BCAA." }, el: { name: "EAA (Απαραίτητα Αμινοξέα)", tagline: "Και τα 9 απαραίτητα αμινοξέα — πληρέστερη εναλλακτική του BCAA.", goals: ["μυϊκή μάζα", "ανάρρωση"], mechanism: "Παρέχει και τα 9 απαραίτητα αμινοξέα που το σώμα δεν μπορεί να συνθέσει μόνο του — πιο πλήρες ερέθισμα πρωτεϊνοσύνθεσης από το BCAA μόνο.", benefits: ["Πληρέστερο ερέθισμα μυϊκής ανάπτυξης από το BCAA", "Χρήσιμο για προπόνηση νηστείας ή γεύματα χαμηλής πρωτεΐνης"], dosage: "10–15 g ανά μερίδα", timing: "Γύρω από την προπόνηση", cautions: "Περιττό αν η ημερήσια πρωτεΐνη από πλήρεις πηγές είναι ήδη επαρκής.", research: [{ headline: "Περιλαμβάνει όλα τα 9 απαραίτητα αμινοξέα — ανώτερο από το BCAA μόνο", takeaway: "Σε αντίθεση με το BCAA (μόνο 3 αμινοξέα), τα συμπληρώματα EAA παρέχουν και τα 9 απαραίτητα αμινοξέα, και οι μελέτες δείχνουν καλύτερη διέγερση πρωτεϊνοσύνθεσης από το BCAA μόνο.", tag: "Συγκριτική Έρευνα" }] }, es: { name: "EAA (Aminoácidos Esenciales)", tagline: "Los 9 aminoácidos esenciales — una alternativa más completa al BCAA." }, no: { name: "EAA (Essensielle Aminosyrer)", tagline: "Alle 9 essensielle aminosyrer — et mer komplett alternativ til BCAA." } } },
  { id: "cissus-quadrangularis", category: "recovery", tags: [], timingSlot: "anytime", evidence: "Limited", research: [{ headline: "Traditional bone-healing plant studied for joint support in athletes", takeaway: "A study in athletes with joint pain found Cissus quadrangularis extract reduced joint discomfort over 8 weeks; separate research on bone fracture healing (its traditional Ayurvedic use) shows accelerated healing markers in animal models.", tag: "Clinical & Traditional Use Research" }], goals: ["joint health", "bone health"], mechanism: "A traditional Ayurvedic plant used for bone/fracture healing, studied more recently for joint pain relief in active/athletic populations.", benefits: ["Studied for joint pain relief in athletes", "Traditional use for bone healing"], dosage: "500–1000 mg extract daily", timing: "With a meal", cautions: "Human clinical data is still limited in volume; quality varies by supplier.", i18n: { en: { name: "Cissus Quadrangularis", tagline: "A traditional Ayurvedic plant studied for joint and bone support." }, el: { name: "Cissus Quadrangularis", tagline: "Παραδοσιακό φυτό Ayurveda που ερευνάται για αρθρική και οστική στήριξη.", goals: ["αρθρική υγεία", "οστική υγεία"], mechanism: "Παραδοσιακό φυτό Ayurveda για επούλωση οστών/καταγμάτων, μελετάται πιο πρόσφατα για ανακούφιση αρθρικού πόνου σε αθλητικούς πληθυσμούς.", benefits: ["Ερευνάται για ανακούφιση αρθρικού πόνου σε αθλητές", "Παραδοσιακή χρήση για επούλωση οστών"], dosage: "500–1000 mg εκχυλίσματος ημερησίως", timing: "Με γεύμα", cautions: "Τα ανθρώπινα κλινικά δεδομένα παραμένουν περιορισμένα σε όγκο· η ποιότητα ποικίλλει ανά προμηθευτή.", research: [{ headline: "Παραδοσιακό φυτό επούλωσης οστών, ερευνάται για αρθρική στήριξη σε αθλητές", takeaway: "Μια μελέτη σε αθλητές με αρθρικό πόνο βρήκε ότι το εκχύλισμα Cissus quadrangularis μείωσε τη δυσφορία αρθρώσεων σε 8 εβδομάδες.", tag: "Κλινική & Παραδοσιακή Έρευνα Χρήσης" }] }, es: { name: "Cissus Quadrangularis", tagline: "Una planta ayurvédica tradicional estudiada por su apoyo articular y óseo." }, no: { name: "Cissus Quadrangularis", tagline: "En tradisjonell ayurvedisk plante studert for ledd- og benstøtte." } } },
  { id: "urtica-dioica", category: "health", tags: [], timingSlot: "morning", evidence: "Limited", research: [{ headline: "Nettle root extract studied mainly for prostate health, not fitness", takeaway: "Clinical research on Urtica dioica (stinging nettle) root focuses heavily on benign prostatic hyperplasia (BPH) symptom relief in older men, with weaker and more limited evidence for its marketed 'free testosterone' fitness claims.", tag: "Clinical Research Focus" }], goals: ["prostate health", "hormone balance"], mechanism: "Root extract studied for binding to sex hormone-binding globulin (SHBG) and supporting prostate/urinary comfort, primarily researched in older men rather than athletes.", benefits: ["Studied for prostate/urinary symptom relief in older men", "Marketed but weakly evidenced for 'free testosterone' claims"], dosage: "300–600 mg root extract daily", timing: "Morning, with a meal", cautions: "Fitness/testosterone marketing claims outpace the actual evidence, which is mostly about prostate health in older men.", i18n: { en: { name: "Urtica Dioica (Nettle Root)", tagline: "A traditional root extract mainly studied for prostate health in older men." }, el: { name: "Urtica Dioica (Ρίζα Τσουκνίδας)", tagline: "Παραδοσιακό εκχύλισμα ρίζας που μελετάται κυρίως για προστατική υγεία σε μεγαλύτερους άνδρες.", goals: ["προστατική υγεία", "ορμονική ισορροπία"], mechanism: "Εκχύλισμα ρίζας που ερευνάται για δέσμευση στην SHBG και στήριξη προστάτη/ουροποιητικού, κυρίως σε μεγαλύτερους άνδρες παρά σε αθλητές.", benefits: ["Ερευνάται για ανακούφιση προστατικών/ουρολογικών συμπτωμάτων σε μεγαλύτερους άνδρες", "Διαφημίζεται αλλά ασθενώς τεκμηριωμένο για ισχυρισμούς 'ελεύθερης τεστοστερόνης'"], dosage: "300–600 mg εκχυλίσματος ρίζας ημερησίως", timing: "Πρωί, με γεύμα", cautions: "Οι ισχυρισμοί μάρκετινγκ για φυσική κατάσταση/τεστοστερόνη ξεπερνούν τα πραγματικά στοιχεία, που αφορούν κυρίως προστατική υγεία σε μεγαλύτερους άνδρες.", research: [{ headline: "Το εκχύλισμα ρίζας τσουκνίδας ερευνάται κυρίως για προστατική υγεία, όχι φυσική κατάσταση", takeaway: "Η κλινική έρευνα στο Urtica dioica (τσουκνίδα) εστιάζει κυρίως στην ανακούφιση συμπτωμάτων καλοήθους υπερπλασίας προστάτη σε μεγαλύτερους άνδρες.", tag: "Εστίαση Κλινικής Έρευνας" }] }, es: { name: "Urtica Dioica (Raíz de Ortiga)", tagline: "Un extracto de raíz tradicional estudiado principalmente por la salud prostática en hombres mayores." }, no: { name: "Urtica Dioica (Brenneslerot)", tagline: "Et tradisjonelt rotekstrakt hovedsakelig studert for prostatahelse hos eldre menn." } } },
  { id: "magnesium-forms", category: "sleep", tags: ["calming"], timingSlot: "evening", evidence: "Moderate", research: [{ headline: "Absorption and use vary meaningfully by form", takeaway: "Comparative research finds magnesium glycinate/citrate are better absorbed and gentler on the gut than magnesium oxide (which is poorly absorbed but cheap), while magnesium threonate is specifically studied for crossing into brain tissue.", tag: "Comparative Bioavailability Research" }], goals: ["sleep", "absorption"], mechanism: "Different magnesium salts (glycinate, citrate, oxide, malate, threonate) bind magnesium to different carrier molecules, changing absorption rate, GI tolerance, and in threonate's case, ability to cross the blood-brain barrier.", benefits: ["Glycinate/citrate: better absorbed, gentler on gut", "Oxide: cheap but poorly absorbed, more laxative effect", "Threonate: studied for cognitive/brain applications"], dosage: "200–400 mg elemental magnesium (form-dependent)", timing: "Evening, 30–60 minutes before bed", cautions: "Check 'elemental magnesium' content on the label — total compound weight overstates the actual mineral dose.", i18n: { en: { name: "Magnesium Forms (Glycinate, Citrate, Oxide, Threonate)", tagline: "Not all magnesium is equal — the form changes absorption and effect." }, el: { name: "Μορφές Μαγνησίου (Γλυκινικό, Κιτρικό, Οξείδιο, Threonate)", tagline: "Δεν είναι όλο το μαγνήσιο ίδιο — η μορφή αλλάζει απορρόφηση και αποτέλεσμα.", goals: ["ύπνος", "απορρόφηση"], mechanism: "Διαφορετικά άλατα μαγνησίου (γλυκινικό, κιτρικό, οξείδιο, μηλικό, threonate) δεσμεύουν το μαγνήσιο σε διαφορετικά μόρια-φορείς, αλλάζοντας ρυθμό απορρόφησης, γαστρεντερική ανοχή, και στην περίπτωση του threonate, ικανότητα διέλευσης στον εγκέφαλο.", benefits: ["Γλυκινικό/κιτρικό: καλύτερη απορρόφηση, πιο ήπιο στο έντερο", "Οξείδιο: φθηνό αλλά κακή απορρόφηση, πιο καθαρτικό", "Threonate: ερευνάται για γνωστικές/εγκεφαλικές εφαρμογές"], dosage: "200–400 mg στοιχειακού μαγνησίου (ανάλογα με τη μορφή)", timing: "Βράδυ, 30–60' πριν τον ύπνο", cautions: "Έλεγξε την περιεκτικότητα σε 'στοιχειακό μαγνήσιο' στην ετικέτα — το συνολικό βάρος της ένωσης υπερεκτιμά την πραγματική δόση.", research: [{ headline: "Η απορρόφηση και η χρήση διαφέρουν σημαντικά ανά μορφή", takeaway: "Συγκριτική έρευνα δείχνει ότι το γλυκινικό/κιτρικό μαγνήσιο απορροφώνται καλύτερα και είναι πιο ήπια στο έντερο από το οξείδιο (κακή απορρόφηση αλλά φθηνό), ενώ το threonate μελετάται ειδικά για διέλευση στον εγκέφαλο.", tag: "Συγκριτική Έρευνα Βιοδιαθεσιμότητας" }] }, es: { name: "Formas de Magnesio (Glicinato, Citrato, Óxido, Treonato)", tagline: "No todo el magnesio es igual — la forma cambia la absorción y el efecto." }, no: { name: "Magnesiumformer (Glysinat, Sitrat, Oksid, Treonat)", tagline: "Ikke alt magnesium er likt — formen endrer opptak og effekt." } } },
  { id: "zinc", category: "health", tags: [], timingSlot: "evening", evidence: "Moderate", research: [{ headline: "Meta-analysis confirms it shortens the common cold", takeaway: "A Cochrane meta-analysis of zinc lozenges found they reduced the average duration of a common cold by about 33% when started within 24 hours of symptom onset, one of the more consistently replicated supplement effects in cold research.", tag: "Cochrane Meta-Analysis" }], goals: ["immune", "testosterone support", "recovery"], mechanism: "An essential trace mineral involved in immune function, protein synthesis, and hundreds of enzymatic reactions; deficiency is linked to lower testosterone and impaired recovery.", benefits: ["Shortens cold duration when taken early", "Important for immune function and recovery", "Deficiency linked to lower testosterone"], dosage: "15–30 mg daily (picolinate/citrate/glycinate forms absorb best)", timing: "Evening, away from calcium/iron supplements", cautions: "Excess long-term zinc can interfere with copper absorption — don't exceed the upper limit without monitoring.", i18n: { en: { name: "Zinc", tagline: "An essential mineral for immune function, with proven benefit for shortening colds." }, el: { name: "Ψευδάργυρος", tagline: "Απαραίτητο ορυκτό για ανοσολογική λειτουργία, με αποδεδειγμένο όφελος στη μείωση κρυολογήματος.", goals: ["ανοσοποιητικό", "στήριξη τεστοστερόνης", "ανάρρωση"], mechanism: "Απαραίτητο ιχνοστοιχείο που εμπλέκεται στην ανοσολογική λειτουργία, την πρωτεϊνοσύνθεση και εκατοντάδες ενζυμικές αντιδράσεις· η ανεπάρκεια συνδέεται με χαμηλότερη τεστοστερόνη.", benefits: ["Μειώνει τη διάρκεια κρυολογήματος όταν λαμβάνεται νωρίς", "Σημαντικό για ανοσολογική λειτουργία και ανάρρωση", "Η ανεπάρκεια συνδέεται με χαμηλότερη τεστοστερόνη"], dosage: "15–30 mg ημερησίως (picolinate/citrate/glycinate απορροφώνται καλύτερα)", timing: "Βράδυ, μακριά από ασβέστιο/σίδηρο", cautions: "Υπερβολικό μακροχρόνιο ψευδάργυρο μπορεί να επηρεάσει την απορρόφηση χαλκού — μην υπερβαίνεις το ανώτατο όριο χωρίς παρακολούθηση.", research: [{ headline: "Μετα-ανάλυση επιβεβαιώνει ότι μειώνει τη διάρκεια κρυολογήματος", takeaway: "Μια μετα-ανάλυση Cochrane σε παστίλιες ψευδαργύρου βρήκε μείωση της μέσης διάρκειας κρυολογήματος κατά περίπου 33% όταν ξεκινούσε εντός 24 ωρών από τα πρώτα συμπτώματα.", tag: "Μετα-ανάλυση Cochrane" }] }, es: { name: "Zinc", tagline: "Un mineral esencial para la función inmunitaria, con beneficio probado para acortar resfriados." }, no: { name: "Sink", tagline: "Et essensielt mineral for immunfunksjon, med bevist effekt for å forkorte forkjølelser." } } },
];

const SYNERGIES = [
  { pair: ["caffeine", "l-theanine"], en: "Classic focus stack — L-theanine smooths out caffeine's jitteriness while preserving alertness.", el: "Κλασικό stack συγκέντρωσης — η L-θεανίνη «στρογγυλεύει» τη νευρικότητα της καφεΐνης διατηρώντας την εγρήγορση." },
  { pair: ["creatine", "beta-alanine"], en: "Complementary energy systems — creatine fuels short max-effort bursts, beta-alanine extends output in the 1–4 minute range.", el: "Συμπληρωματικά ενεργειακά συστήματα — η κρεατίνη τροφοδοτεί σύντομες μέγιστες προσπάθειες, η βήτα-αλανίνη επεκτείνει την απόδοση στο εύρος 1–4 λεπτών." },
  { pair: ["creatine", "whey"], en: "One of the most studied combinations — protein plus creatine supports both muscle repair and strength adaptations.", el: "Ένας από τους πιο μελετημένους συνδυασμούς — πρωτεΐνη και κρεατίνη μαζί στηρίζουν και την επιδιόρθωση μυών και τις προσαρμογές δύναμης." },
  { pair: ["vitamin-d3", "omega3"], en: "Both are fat-soluble — taking them in the same meal with some dietary fat can support absorption of both.", el: "Και τα δύο είναι λιποδιαλυτά — η λήψη τους στο ίδιο γεύμα με λίγο λίπος μπορεί να στηρίξει την απορρόφηση και των δύο." },
  { pair: ["magnesium", "ashwagandha"], en: "Both support relaxation through different pathways — a common pairing in evening stress/sleep stacks.", el: "Και τα δύο στηρίζουν τη χαλάρωση μέσω διαφορετικών μηχανισμών — συνηθισμένος συνδυασμός σε βραδινά stacks για στρες/ύπνο." },
  { pair: ["ashwagandha", "melatonin"], en: "A common evening pairing — ashwagandha addresses stress during the day's wind-down, melatonin handles circadian timing at bedtime.", el: "Συνηθισμένος βραδινός συνδυασμός — η ashwagandha βοηθά στο στρες, η μελατονίνη στη ρύθμιση του κιρκάδιου ρυθμού πριν τον ύπνο." },
  { pair: ["l-carnitine", "beetroot"], en: "Both are studied for exercise efficiency through different mechanisms — carnitine for fat-fuel transport, beetroot for oxygen economy.", el: "Και τα δύο μελετώνται για αποδοτικότητα άσκησης μέσω διαφορετικών μηχανισμών — η καρνιτίνη για μεταφορά λίπους, το παντζάρι για οικονομία οξυγόνου." },
];

const CAUTION_RULES = {
  stimulantOverload: {
    en: "Multiple stimulants selected — cumulative effect may cause jitteriness, elevated heart rate, or disrupted sleep. Consider spacing doses apart or dropping one.",
    el: "Επιλέχθηκαν πολλά διεγερτικά — το αθροιστικό αποτέλεσμα μπορεί να προκαλέσει νευρικότητα, αυξημένο καρδιακό ρυθμό ή διαταραγμένο ύπνο. Σκέψου να τα απομακρύνεις χρονικά ή να αφαιρέσεις ένα.",
  },
  calmingOverload: {
    en: "Multiple calming/sedative ingredients selected — fine for an evening stack, but avoid combining before driving or training.",
    el: "Επιλέχθηκαν πολλά ηρεμιστικά συστατικά — καλό για βραδινό stack, αλλά απόφυγέ τα πριν την οδήγηση ή την προπόνηση.",
  },
  bloodThinningOverlap: {
    en: "Multiple ingredients with mild blood-thinning properties — talk to a doctor before combining, especially if you take blood-thinning medication.",
    el: "Πολλά συστατικά με ήπια αντιπηκτική δράση — συμβουλέψου γιατρό πριν τα συνδυάσεις, ειδικά αν λαμβάνεις αντιπηκτική αγωγή.",
  },
  nitricOxideOverlap: {
    en: "Citrulline and beetroot work through overlapping nitric-oxide pathways — taking both at full dose is likely redundant. Consider using one, or halving both doses.",
    el: "Η κιτρουλλίνη και το παντζάρι δρουν μέσω επικαλυπτόμενων μονοπατιών νιτρικού οξειδίου — η λήψη και των δύο σε πλήρη δόση είναι πιθανώς περιττή. Σκέψου να χρησιμοποιήσεις το ένα, ή να μειώσεις και τις δύο δόσεις.",
  },
  wheyHmbOverlap: {
    en: "Whey already supplies leucine, the amino acid HMB is derived from — research on well-trained lifters finds little added benefit from stacking both at full dose.",
    el: "Η whey ήδη παρέχει λευκίνη, το αμινοξύ από το οποίο προέρχεται το HMB — η έρευνα σε καλά προπονημένους αθλητές βρίσκει μικρό πρόσθετο όφελος από τον συνδυασμό των δύο σε πλήρη δόση.",
  },
  yohimbineFastedConflict: {
    en: "Yohimbine works best on an empty stomach — pairing it in the same window as food-timed ingredients (like whey or collagen) blunts its effect. Separate them by a few hours.",
    el: "Η γιοχιμβίνη δουλεύει καλύτερα με άδειο στομάχι — ο συνδυασμός της στο ίδιο χρονικό παράθυρο με συστατικά που παίρνονται με φαγητό (όπως whey ή κολλαγόνο) αμβλύνει τη δράση της. Απομάκρυνέ τα κατά λίγες ώρες.",
  },
};

// Self-contained data for the "Compare" tab (commercial product comparison).
// Deliberately separate from INGREDIENTS — this tab compares real branded
// products, not generic ingredient types, and should stay independent of
// the Library/Stack Builder data model so it can be extended on its own.
// Self-contained data for the "Compare" tab (commercial product comparison).
// Deliberately separate from INGREDIENTS — this tab compares real branded
// products, not generic ingredient types, and should stay independent of
// the Library/Stack Builder data model so it can be extended on its own.
// Each product carries a "specs" list (ordered, category-specific rows) so
// the comparison table can render whatever attributes make sense for that
// category (protein macros vs. a single dose amount for creatine, etc).
const PRODUCT_CATEGORIES = {
  en: { protein: "Whey Protein", creatine: "Creatine", omega3: "Omega-3 / Fish Oil", vitaminD: "Vitamin D3", magnesium: "Magnesium", ashwagandha: "Ashwagandha", melatonin: "Melatonin", collagen: "Collagen", multivitamin: "Multivitamin" },
  el: { protein: "Πρωτεΐνη Ορού Γάλακτος (Whey)", creatine: "Κρεατίνη", omega3: "Ωμέγα-3 / Ιχθυέλαιο", vitaminD: "Βιταμίνη D3", magnesium: "Μαγνήσιο", ashwagandha: "Ashwagandha", melatonin: "Μελατονίνη", collagen: "Κολλαγόνο", multivitamin: "Πολυβιταμίνη" },
  es: { protein: "Proteína de Suero", creatine: "Creatina", omega3: "Omega-3 / Aceite de Pescado", vitaminD: "Vitamina D3", magnesium: "Magnesio", ashwagandha: "Ashwagandha", melatonin: "Melatonina", collagen: "Colágeno", multivitamin: "Multivitamínico" },
  no: { protein: "Myseprotein", creatine: "Kreatin", omega3: "Omega-3 / Fiskeolje", vitaminD: "Vitamin D3", magnesium: "Magnesium", ashwagandha: "Ashwagandha", melatonin: "Melatonin", collagen: "Kollagen", multivitamin: "Multivitamin" },
};

// Products are CMS-managed content (like News) so Andrew can add/edit them
// via /admin without touching code, including uploading a product photo.
const productModules = import.meta.glob("/content/products/*.json", { eager: true });
const PRODUCTS = Object.entries(productModules)
  .map(([path, mod]) => ({ id: path.split("/").pop().replace(".json", ""), ...(mod.default || mod) }))
  .sort((a, b) => a.brand.localeCompare(b.brand));


function RatingBadge({ rating, evidence, size = "sm", ovrLabel }) {
  const cls = evidence === "High" ? "nk-rate-hi" : evidence === "Moderate" ? "nk-rate-mid" : "nk-rate-lo";
  return (
    <div className={`nk-rate-badge ${size === "lg" ? "nk-rate-badge-lg" : ""} ${cls}`}>
      <span className="nk-display nk-rate-num">{rating}</span>
      {size === "lg" && <span className="nk-mono nk-rate-tag">{ovrLabel}</span>}
    </div>
  );
}

function StatBar({ label, value, max = 100 }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="nk-statbar-row">
      <div className="nk-statbar-label">
        <span className="nk-mono nk-eyebrow">{label}</span>
        <span className="nk-mono nk-accent-text">{value}</span>
      </div>
      <div className="nk-statbar-track">
        <div className="nk-statbar-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function SupplementLibrary() {
  const { id: routeId } = useParams();
  const navigate = useNavigate();
  const [lang, setLang] = useState("en");
  const [theme, setTheme] = useState("dark");
  const [view, setView] = useState("welcome");
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState(null);
  const initialSelected = routeId ? INGREDIENTS.find((i) => i.id === routeId) || null : null;
  const [selected, setSelected] = useState(initialSelected);
  const [selectedNews, setSelectedNews] = useState(null);
  const [detailTab, setDetailTab] = useState("overview");
  const openDetail = (item) => {
    setSelected(item);
    setDetailTab("overview");
    navigate(`/ingredient/${item.id}`);
  };
  const closeDetail = () => {
    setSelected(null);
    navigate("/");
  };
  const [showLegal, setShowLegal] = useState(false);
  const [stackSelection, setStackSelection] = useState([]);
  const [compareCategory, setCompareCategory] = useState("protein");
  const [compareSelection, setCompareSelection] = useState(
    PRODUCTS.filter((p) => p.category === "protein").map((p) => p.id)
  );
  const [showFilters, setShowFilters] = useState(false);
  const barRef = useRef(null);
  const [barHeight, setBarHeight] = useState(0);

  const t = UI[lang];
  const catLabels = CATEGORY_LABELS[lang];

  useLayoutEffect(() => {
    const el = barRef.current;
    if (!el) return;
    const update = () => setBarHeight(el.offsetHeight);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [showFilters]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return INGREDIENTS.filter((item) => {
      const localized = item.i18n[lang] || item.i18n.en;
      const matchesQuery =
        !q ||
        localized.name.toLowerCase().includes(q) ||
        item.i18n.en.name.toLowerCase().includes(q) ||
        item.goals.some((g) => g.toLowerCase().includes(q));
      const matchesCategory = !activeCategory || item.category === activeCategory;
      return matchesQuery && matchesCategory;
    }).sort((a, b) => EVIDENCE_SCORE[b.evidence] - EVIDENCE_SCORE[a.evidence]);
  }, [query, activeCategory, lang]);

  const categories = Object.keys(CATEGORY_META);

  const stackItems = useMemo(
    () => stackSelection.map((id) => INGREDIENTS.find((i) => i.id === id)).filter(Boolean),
    [stackSelection]
  );

  const stackAnalysis = useMemo(() => {
    const ids = new Set(stackSelection);
    const synergies = SYNERGIES.filter((s) => s.pair.every((id) => ids.has(id)));

    const cautions = [];
    const stimCount = stackItems.filter((i) => i.tags.includes("stimulant")).length;
    const stimMildCount = stackItems.filter((i) => i.tags.includes("stimulant-mild")).length;
    if (stimCount + stimMildCount * 0.5 >= 2) cautions.push(CAUTION_RULES.stimulantOverload);

    const calmCount = stackItems.filter((i) => i.tags.includes("calming") || i.tags.includes("sedative")).length;
    if (calmCount >= 2) cautions.push(CAUTION_RULES.calmingOverload);

    const thinCount = stackItems.filter((i) => i.tags.includes("blood-thinning")).length;
    if (thinCount >= 2) cautions.push(CAUTION_RULES.bloodThinningOverlap);

    if (ids.has("citrulline") && ids.has("beetroot")) cautions.push(CAUTION_RULES.nitricOxideOverlap);
    if (ids.has("whey") && ids.has("hmb")) cautions.push(CAUTION_RULES.wheyHmbOverlap);
    if (ids.has("yohimbine") && (ids.has("whey") || ids.has("collagen"))) cautions.push(CAUTION_RULES.yohimbineFastedConflict);

    const schedule = { morning: [], "pre-workout": [], "post-workout": [], evening: [], anytime: [] };
    stackItems.forEach((item) => schedule[item.timingSlot].push(item));

    return { synergies, cautions, schedule };
  }, [stackSelection, stackItems]);

  const toggleStackItem = (id) => {
    setStackSelection((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const downloadStackPdf = () => {
    const doc = new jsPDF();
    const pageHeight = doc.internal.pageSize.getHeight();
    const marginLeft = 16;
    const maxWidth = 178;
    let y = 20;

    const ensureSpace = (lines = 1) => {
      if (y + lines * 6 > pageHeight - 16) {
        doc.addPage();
        y = 20;
      }
    };
    const addHeading = (text) => {
      ensureSpace(2);
      doc.setFont(undefined, "bold");
      doc.setFontSize(13);
      doc.text(text, marginLeft, y);
      y += 8;
      doc.setFont(undefined, "normal");
      doc.setFontSize(10.5);
    };
    const addLine = (text, indent = 0) => {
      const lines = doc.splitTextToSize(text, maxWidth - indent);
      ensureSpace(lines.length);
      doc.text(lines, marginLeft + indent, y);
      y += lines.length * 5.5;
    };

    doc.setFont(undefined, "bold");
    doc.setFontSize(20);
    doc.text("Your Stack Report", marginLeft, y);
    y += 8;
    doc.setFont(undefined, "normal");
    doc.setFontSize(10);
    doc.setTextColor(120);
    doc.text("STCK — stck.info", marginLeft, y);
    doc.setTextColor(0);
    y += 12;

    addHeading(t.tabStack);
    stackItems.forEach((item) => {
      const localized = item.i18n[lang] || item.i18n.en;
      addLine(`• ${localized.name}`);
    });
    y += 4;

    if (stackAnalysis.synergies.length) {
      addHeading(t.synergiesTitle);
      stackAnalysis.synergies.forEach((s) => addLine(`• ${s[lang] || s.en}`));
      y += 4;
    }

    if (stackAnalysis.cautions.length) {
      addHeading(t.cautionsTitle);
      stackAnalysis.cautions.forEach((c) => addLine(`• ${c[lang] || c.en}`));
      y += 4;
    }

    addHeading(t.scheduleTitle);
    [
      ["morning", t.slotMorning],
      ["pre-workout", t.slotPreWorkout],
      ["post-workout", t.slotPostWorkout],
      ["evening", t.slotEvening],
      ["anytime", t.slotAnytime],
    ].forEach(([slot, label]) => {
      const items = stackAnalysis.schedule[slot];
      if (!items.length) return;
      ensureSpace(1);
      doc.setFont(undefined, "bold");
      doc.text(label + ":", marginLeft, y);
      doc.setFont(undefined, "normal");
      y += 6;
      items.forEach((item) => {
        const localized = item.i18n[lang] || item.i18n.en;
        addLine(`- ${localized.name}`, 4);
      });
    });

    y += 8;
    ensureSpace(2);
    doc.setFontSize(8.5);
    doc.setTextColor(140);
    doc.text("Informational content, not medical advice. Consult a healthcare professional before starting any supplement.", marginLeft, y);

    doc.save("my-stack-report.pdf");
  };

  const researchFeed = useMemo(() => {
    return INGREDIENTS.flatMap((item) => {
      const localized = item.i18n[lang] || item.i18n.en;
      const items = (localized.research || item.research).map((r, idx) => ({
        ...r,
        ingredient: item,
        ingredientName: localized.name,
        key: `${item.id}-${idx}`,
      }));
      return items;
    });
  }, [lang]);

  return (
    <div className={`nk-root ${theme === "light" ? "light" : ""}`}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700&family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap');

        :root, .nk-root {
          --bg:#0D0D0D; --surface:#141414; --surface-2:#161616;
          --border:#232323; --border-soft:#2A2A2A; --border-faint:#1C1C1C;
          --text:#F5F5F5; --text-secondary:#DEDEDE; --text-muted:#9A9A9A;
          --text-dim:#6B6B6B; --text-faint:#3F3F3F;
          --accent-red:#FF3B30; --accent-gold:#FFB020;
          --caution-bg:#221109; --caution-border:#4A2416; --caution-head:#FF9F3C; --caution-text:#E4CBB5;
          --good-bg:#0F1B14; --good-border:#3DDC84; --good-text:#C9E8D4;
          --watermark:#1D1D1D;
          color-scheme: dark;
        }
        .nk-root.light {
          --bg:#FAF9F6; --surface:#FFFFFF; --surface-2:#F2F1ED;
          --border:#E5E2DB; --border-soft:#DAD7CE; --border-faint:#EDEAE2;
          --text:#181714; --text-secondary:#3A3833; --text-muted:#6E6C64;
          --text-dim:#8E8B81; --text-faint:#B6B3A9;
          --accent-red:#D6301F; --accent-gold:#B5790E;
          --caution-bg:#FBEEDD; --caution-border:#E8C9A0; --caution-head:#B8630A; --caution-text:#6B4423;
          --good-bg:#EAF7EE; --good-border:#2FAE64; --good-text:#1F7A3D;
          --watermark:#F1EFE9;
          color-scheme: light;
        }
        html, body { background:var(--bg); color:var(--text); margin:0; }
        .nk-root {
          background-color:var(--bg);
          background-image:
            radial-gradient(1.2px 1.2px at 8% 12%, rgba(255,255,255,0.1), transparent 60%),
            radial-gradient(1px 1px at 22% 68%, rgba(255,255,255,0.05), transparent 60%),
            radial-gradient(1.5px 1.5px at 38% 30%, rgba(255,255,255,0.06), transparent 60%),
            radial-gradient(1px 1px at 55% 82%, rgba(255,255,255,0.045), transparent 60%),
            radial-gradient(1px 1px at 68% 18%, rgba(255,255,255,0.05), transparent 60%),
            radial-gradient(1.5px 1.5px at 82% 55%, rgba(255,255,255,0.055), transparent 60%),
            radial-gradient(1px 1px at 92% 90%, rgba(255,255,255,0.04), transparent 60%),
            radial-gradient(1px 1px at 15% 95%, rgba(255,255,255,0.04), transparent 60%),
            radial-gradient(1.5px 1.5px at 47% 5%, rgba(255,255,255,0.05), transparent 60%),
            radial-gradient(1px 1px at 75% 75%, rgba(255,255,255,0.045), transparent 60%);
          background-repeat: repeat;
          background-size: 240px 240px;
          color:var(--text); font-family:'Inter',sans-serif; min-height:100vh;
        }
        .nk-display { font-family:'Inter',sans-serif; font-weight:800; text-transform:uppercase; letter-spacing:-0.02em; }
        .nk-eyebrow { font-family:'Barlow Condensed',sans-serif; letter-spacing:0.16em; text-transform:uppercase; }
        .nk-mono { font-family:'JetBrains Mono',monospace; }
        .nk-muted { color:var(--text-muted); }
        .nk-accent-text { color:var(--accent-red); }
        .nk-red-text { color:var(--accent-red); }
        ::selection { background:var(--accent-red); color:#fff; }

        .nk-hero { position:relative; overflow:hidden; border-bottom:1px solid var(--border); padding:56px 24px 44px; background:
          repeating-linear-gradient(115deg, transparent 0 64px, rgba(255,59,48,0.08) 64px 66px), var(--bg); }
        .nk-hero::before { content:""; position:absolute; top:-20%; right:-10%; width:60%; height:140%; background:
          radial-gradient(circle, rgba(255,59,48,0.16) 0%, rgba(255,176,32,0.08) 35%, transparent 70%); pointer-events:none; }
        .nk-hero-inner { max-width:960px; margin:0 auto; position:relative; }
        .nk-hero-eyebrow { display:flex; align-items:center; gap:8px; color:var(--accent-red); margin-bottom:14px; font-size:12px; }
        .nk-hero-title { font-size:4rem; line-height:0.88; font-weight:400; margin:0; color:var(--text); }
        .nk-hero-title .nk-red-text { background:linear-gradient(90deg, var(--accent-red), var(--accent-gold)); -webkit-background-clip:text; background-clip:text; -webkit-text-fill-color:transparent; }
        .nk-hero-sub { margin-top:18px; max-width:560px; color:var(--text-muted); font-size:16px; line-height:1.6; font-family:'Barlow Condensed',sans-serif; letter-spacing:0.01em; }

        .nk-bar { position:fixed; top:0; left:0; right:0; z-index:50; background:var(--bg); border-bottom:1px solid var(--border); padding:14px 24px; box-shadow:0 8px 24px rgba(0,0,0,0.5); }
        .nk-bar-inner { max-width:960px; margin:0 auto; display:flex; flex-direction:column; gap:10px; }
        .nk-tabs-row { margin-bottom:10px; display:flex; align-items:center; justify-content:space-between; gap:10px; }
        .nk-tab-group { overflow-x:auto; -webkit-overflow-scrolling:touch; display:inline-flex; gap:4px; flex-shrink:1; min-width:0; background:var(--surface-2); border:1px solid var(--border); border-radius:999px; padding:3px; max-width:100%; }
        .nk-theme-toggle { flex-shrink:0; width:38px; height:38px; border-radius:999px; border:1px solid var(--border-soft); background:var(--surface-2); color:var(--text-muted); display:flex; align-items:center; justify-content:center; cursor:pointer; }
        .nk-theme-toggle:hover { border-color:var(--accent-red); color:var(--accent-red); }
        .nk-search-row { display:flex; gap:8px; flex-wrap:wrap; }
        .nk-tab-btn { padding:0 14px; height:32px; border-radius:999px; font-size:12px; font-weight:600; border:none; color:var(--text-muted); background:transparent; cursor:pointer; white-space:nowrap; }
        .nk-tab-btn.is-active { background:var(--text); color:var(--bg); }
        .nk-lang-group { display:flex; gap:4px; flex-shrink:0; }
        .nk-lang-btn { padding:0 10px; height:38px; border-radius:999px; font-size:11px; font-weight:700; border:1px solid var(--border-soft); color:var(--text-muted); background:transparent; cursor:pointer; font-family:'JetBrains Mono',monospace; }
        .nk-lang-btn.is-active { background:var(--text); color:var(--bg); border-color:var(--text); }
        .nk-search-wrap { position:relative; flex:1 1 160px; min-width:0; }
        .nk-search-icon { position:absolute; left:14px; top:50%; transform:translateY(-50%); color:var(--text-dim); }
        .nk-search-input { width:100%; background:var(--surface-2); border:1px solid var(--border-soft); border-radius:999px; padding:10px 40px; font-size:14px; color:var(--text); outline:none; box-sizing:border-box; height:38px; }
        .nk-search-input::placeholder { color:var(--text-dim); }
        .nk-search-input:focus { border-color:var(--accent-red); }
        .nk-search-clear { position:absolute; right:14px; top:50%; transform:translateY(-50%); color:var(--text-dim); background:none; border:none; cursor:pointer; }
        .nk-bar-controls { display:flex; gap:8px; flex-shrink:0; flex-wrap:wrap; }
        .nk-filter-toggle { display:flex; align-items:center; gap:6px; padding:0 16px; height:38px; border-radius:999px; font-size:12px; font-weight:700; border:1px solid var(--border-soft); color:var(--text-muted); background:transparent; cursor:pointer; white-space:nowrap; }
        .nk-filter-toggle.is-active { background:var(--accent-red); color:#fff; border-color:var(--accent-red); }
        .nk-chip-row { display:flex; flex-wrap:wrap; gap:6px; align-items:center; }
        .nk-chip-label { font-size:11px; color:var(--text-dim); margin-right:2px; }
        .nk-chip { display:flex; align-items:center; gap:6px; padding:5px 14px; border-radius:999px; font-size:12px; font-weight:500; border:1px solid var(--border-soft); color:var(--text-muted); background:transparent; cursor:pointer; }
        .nk-chip.is-active { background:var(--accent-red); color:#fff; border-color:var(--accent-red); }

        .nk-main { max-width:960px; margin:0 auto; padding:40px 24px; }
        .nk-count-row { display:flex; justify-content:space-between; font-size:11px; color:var(--text-dim); margin-bottom:20px; }
        .nk-grid { display:grid; grid-template-columns:1fr; gap:16px; }
        @media (min-width:640px) { .nk-grid { grid-template-columns:1fr 1fr; } }
        @media (min-width:1024px) { .nk-grid { grid-template-columns:1fr 1fr 1fr; } }

        .nk-card { position:relative; overflow:hidden; text-align:left; background:var(--surface); border:1px solid var(--border); border-left:3px solid var(--cat-accent, var(--border)); border-radius:16px; padding:20px; cursor:pointer; transition:transform 0.15s ease, border-color 0.15s ease; }
        .nk-card:hover { border-color:var(--accent-red); border-left-color:var(--cat-accent, var(--accent-red)); transform:translateY(-3px); }
        .nk-card-watermark { position:absolute; top:-6px; right:8px; font-size:52px; font-weight:800; color:var(--watermark); pointer-events:none; user-select:none; line-height:1; }
        .nk-card-top { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:16px; position:relative; }
        .nk-mvp-tag { font-size:9px; font-weight:800; letter-spacing:0.08em; color:var(--bg); background:var(--accent-gold); padding:2px 6px; border-radius:4px; }
        .nk-card-cat { display:flex; align-items:center; gap:6px; font-size:11px; color:var(--text-muted); margin-bottom:6px; }
        .nk-card-title { font-size:1.9rem; line-height:0.95; font-weight:400; margin:0 0 4px; color:var(--text); }
        .nk-card:hover .nk-card-title { color:var(--accent-red); }
        .nk-card-titleEn { font-size:10px; color:var(--text-dim); margin-bottom:10px; }
        .nk-cta-btn { display:inline-flex; align-items:center; background:var(--accent-red); color:#fff; border:none; border-radius:999px; padding:14px 28px; font-size:14px; font-weight:700; letter-spacing:0.03em; cursor:pointer; transition:opacity 0.15s ease; }
        .nk-cta-btn:hover { opacity:0.88; }
        .nk-welcome-card { text-align:left; }
        .nk-card-tagline { font-size:13.5px; color:var(--text-muted); line-height:1.5; }

        .nk-rate-badge { display:flex; flex-direction:column; align-items:center; justify-content:center; width:44px; height:44px; border-radius:10px; border:2px solid; background:var(--bg); flex-shrink:0; }
        .nk-rate-badge-lg { width:64px; height:64px; border-radius:12px; }
        .nk-rate-num { font-size:17px; line-height:1; }
        .nk-rate-badge-lg .nk-rate-num { font-size:26px; }
        .nk-rate-tag { font-size:8px; color:var(--text-dim); margin-top:2px; letter-spacing:0.1em; }
        .nk-rate-hi { border-color:var(--accent-gold); } .nk-rate-hi .nk-rate-num { color:var(--accent-gold); }
        .nk-rate-mid { border-color:var(--accent-red); } .nk-rate-mid .nk-rate-num { color:var(--accent-red); }
        .nk-rate-lo { border-color:var(--text-dim); } .nk-rate-lo .nk-rate-num { color:var(--text-muted); }

        .nk-empty { text-align:center; padding:90px 0; color:var(--text-muted); }
        .nk-empty h3 { font-size:2.2rem; margin-bottom:8px; color:var(--text); }

        .nk-footer { border-top:1px solid var(--border); padding:40px 24px 28px; text-align:center; }
        .nk-footer-about { max-width:480px; margin:0 auto 28px; padding-bottom:28px; border-bottom:1px solid var(--border-faint); }
        .nk-footer-about h4 { font-size:13px; letter-spacing:0.1em; text-transform:uppercase; color:var(--text); margin:0 0 10px; font-family:'Barlow Condensed',sans-serif; }
        .nk-footer-about p { font-size:13px; color:var(--text-muted); line-height:1.6; margin:0; }
        .nk-footer-disclaimer { font-size:11px; color:var(--text-dim); max-width:420px; margin:0 auto; line-height:1.6; font-family:'JetBrains Mono',monospace; }
        .nk-footer-copyright { font-size:11px; color:var(--text-faint); margin:16px 0 0; font-family:'JetBrains Mono',monospace; }
        .nk-footer-legal-link { background:none; border:none; color:var(--text-dim); font-size:11px; text-decoration:underline; text-underline-offset:3px; cursor:pointer; margin-top:14px; font-family:'JetBrains Mono',monospace; }
        .nk-footer-legal-link:hover { color:var(--accent-red); }
        .nk-legal-list { display:flex; flex-direction:column; gap:16px; }
        .nk-legal-list p { font-size:13.5px; color:var(--text-muted); line-height:1.7; margin:0; }
        .nk-legal-list strong { color:var(--text); }

        .nk-modal-overlay { position:fixed; inset:0; z-index:60; display:flex; align-items:flex-end; justify-content:center; }
        @media (min-width:768px) { .nk-modal-overlay { align-items:center; } }
        .nk-modal-backdrop { position:absolute; inset:0; background:#000000; opacity:0.88; }
        .nk-modal-panel { position:relative; width:100%; max-width:640px; max-height:90vh; overflow-y:auto; background:var(--surface); border:1px solid var(--border-soft); border-radius:24px 24px 0 0; }
        @media (min-width:768px) { .nk-modal-panel { border-radius:24px; } }
        .nk-modal-head { position:sticky; top:0; background:var(--surface); border-bottom:1px solid var(--border); padding:16px 28px; display:flex; align-items:center; justify-content:space-between; z-index:1; }
        .nk-modal-close { background:none; border:none; color:var(--text-muted); cursor:pointer; padding:4px; }
        .nk-modal-close:hover { color:var(--text); }
        .nk-modal-body { padding:24px 28px 32px; }
        .nk-modal-title-row { display:flex; align-items:flex-start; justify-content:space-between; gap:16px; }
        .nk-modal-title { font-size:2.7rem; line-height:0.95; font-weight:400; margin:0; color:var(--text); }
        .nk-modal-titleEn { font-size:12px; color:var(--text-dim); margin-top:8px; font-family:'JetBrains Mono',monospace; }
        .nk-modal-tagline { color:var(--accent-red); font-size:16px; font-style:italic; margin:16px 0 22px; font-family:'Barlow Condensed',sans-serif; }
        .nk-goal-chips { display:flex; flex-wrap:wrap; gap:6px; margin-bottom:26px; }
        .nk-goal-chip { font-size:11px; padding:4px 10px; border-radius:999px; background:var(--border); color:var(--text-muted); font-family:'JetBrains Mono',monospace; }
        .nk-detail-note { font-size:11px; color:var(--text-dim); font-style:italic; margin-bottom:20px; }
        .nk-detail-tabs { display:flex; gap:4px; background:var(--bg); border:1px solid var(--border); border-radius:999px; padding:3px; margin-bottom:22px; }
        .nk-detail-tab { flex:1; padding:8px 10px; border-radius:999px; border:none; background:transparent; color:var(--text-muted); font-size:12px; font-weight:600; cursor:pointer; font-family:'Barlow Condensed',sans-serif; letter-spacing:0.04em; }
        .nk-detail-tab.is-active { background:var(--accent-red); color:#fff; }

        .nk-statbar-row { margin-bottom:10px; }
        .nk-statbar-label { display:flex; justify-content:space-between; font-size:10px; letter-spacing:0.14em; text-transform:uppercase; color:var(--text-muted); margin-bottom:5px; }
        .nk-statbar-track { height:6px; border-radius:999px; background:var(--border); overflow:hidden; }
        .nk-statbar-fill { height:100%; border-radius:999px; background:linear-gradient(90deg,var(--accent-red),var(--accent-gold)); }

        .nk-section { margin-bottom:22px; }
        .nk-section h4 { font-size:12px; letter-spacing:0.14em; text-transform:uppercase; color:var(--text-muted); margin:0 0 10px; font-family:'Barlow Condensed',sans-serif; }
        .nk-section p { font-size:14px; color:var(--text-secondary); line-height:1.6; margin:0; }
        .nk-benefit-list { list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:8px; }
        .nk-benefit-list li { display:flex; gap:10px; font-size:14px; color:var(--text-secondary); line-height:1.5; }
        .nk-benefit-list svg { color:var(--accent-gold); flex-shrink:0; margin-top:2px; }

        .nk-info-grid { display:grid; grid-template-columns:1fr; gap:14px; margin-bottom:22px; }
        @media (min-width:640px) { .nk-info-grid { grid-template-columns:1fr 1fr; } }
        .nk-info-box { background:var(--bg); border:1px solid var(--border); border-radius:14px; padding:16px; }
        .nk-info-box-head { display:flex; align-items:center; gap:6px; font-size:11px; letter-spacing:0.12em; text-transform:uppercase; color:var(--text-muted); margin-bottom:8px; font-family:'Barlow Condensed',sans-serif; }
        .nk-info-box p { font-size:14px; color:var(--text); line-height:1.5; margin:0; }

        .nk-caution-box { background:var(--caution-bg); border:1px solid var(--caution-border); border-radius:14px; padding:16px; }
        .nk-caution-head { display:flex; align-items:center; gap:6px; font-size:11px; letter-spacing:0.12em; text-transform:uppercase; color:var(--caution-head); margin-bottom:8px; font-family:'Barlow Condensed',sans-serif; }
        .nk-caution-box p { font-size:14px; color:var(--caution-text); line-height:1.5; margin:0; }

        .nk-news-list { display:flex; flex-direction:column; }
        .nk-news-item { display:flex; gap:12px; padding:14px 0; border-top:1px solid var(--border); }
        .nk-news-item:first-child { border-top:none; padding-top:0; }
        .nk-news-dot { width:6px; height:6px; border-radius:999px; background:var(--accent-red); margin-top:7px; flex-shrink:0; }
        .nk-news-tag { display:inline-block; font-size:9px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; color:var(--accent-red); font-family:'JetBrains Mono',monospace; margin-bottom:4px; }
        .nk-news-headline { font-size:15px; font-weight:700; color:var(--text); line-height:1.35; margin:0 0 4px; }
        .nk-news-takeaway { font-size:13px; color:var(--text-muted); line-height:1.5; margin:0; }

        .nk-feed-list { display:flex; flex-direction:column; }
        .nk-feed-item { display:flex; gap:14px; text-align:left; background:none; border:none; border-top:1px solid var(--border); padding:20px 0; cursor:pointer; color:inherit; font:inherit; width:100%; }
        .nk-feed-item:first-child { border-top:none; }
        .nk-feed-item:hover .nk-news-headline { color:var(--accent-red); }
        .nk-feed-meta { display:flex; align-items:center; gap:10px; margin-bottom:6px; flex-wrap:wrap; }
        .nk-feed-ingredient { font-size:10px; color:var(--text-dim); }
        .nk-feed-item .nk-news-headline { font-size:17px; }

        .nk-stack-clear { background:none; border:1px solid var(--border-soft); color:var(--text-muted); font-size:11px; padding:4px 12px; border-radius:999px; cursor:pointer; font-family:'JetBrains Mono',monospace; }
        .nk-stack-clear:hover { border-color:var(--accent-red); color:var(--accent-red); }
        .nk-stack-picker { display:flex; flex-wrap:wrap; gap:8px; margin-bottom:32px; }
        .nk-stack-chip { padding:8px 16px; border-radius:999px; font-size:13px; border:1px solid var(--border-soft); background:var(--surface); color:var(--text-muted); cursor:pointer; transition:all 0.15s ease; }
        .nk-stack-chip:hover { border-color:var(--text-dim); }
        .nk-stack-chip.is-active { background:var(--accent-red); border-color:var(--accent-red); color:#fff; font-weight:600; }
        .nk-stack-results { display:flex; flex-direction:column; gap:32px; }
        .nk-stack-section h4 { font-size:13px; letter-spacing:0.12em; text-transform:uppercase; color:var(--text); margin:0 0 14px; font-family:'Barlow Condensed',sans-serif; }
        .nk-stack-note { font-size:13px; color:var(--text-dim); line-height:1.6; font-style:italic; }
        .nk-compare-table { width:100%; border-collapse:collapse; font-size:14px; }
        .nk-compare-table th, .nk-compare-table td { padding:14px 16px; border-bottom:1px solid var(--border); text-align:left; vertical-align:top; white-space:normal; min-width:180px; }
        .nk-compare-table thead th { border-bottom:2px solid var(--text); }
        .nk-compare-photo { width:64px; height:64px; object-fit:contain; border-radius:8px; background:var(--surface-2, #111); margin-bottom:8px; }
        .nk-compare-row-label { font-weight:600; color:var(--text-dim); font-size:12px; letter-spacing:0.06em; text-transform:uppercase; min-width:140px; white-space:nowrap; }
        .nk-compare-source-link { color:var(--accent-red); text-decoration:none; font-size:13px; font-weight:600; }
        .nk-compare-source-link:hover { text-decoration:underline; }
        .nk-stack-list { list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:10px; }
        .nk-stack-list li { font-size:14px; line-height:1.6; padding:12px 16px; border-radius:12px; border-left:3px solid; }
        .nk-stack-list-good li { background:var(--good-bg); border-left-color:var(--good-border); color:var(--good-text); }
        .nk-stack-list-caution li { background:var(--caution-bg); border-left-color:var(--caution-head); color:var(--caution-text); }
        .nk-schedule-grid { display:grid; grid-template-columns:1fr; gap:16px; }
        @media (min-width:640px) { .nk-schedule-grid { grid-template-columns:repeat(auto-fit, minmax(150px, 1fr)); } }
        .nk-schedule-col { background:var(--surface); border:1px solid var(--border); border-radius:14px; padding:14px; }
        .nk-schedule-label { font-size:11px; letter-spacing:0.1em; text-transform:uppercase; color:var(--accent-red); margin-bottom:10px; font-family:'JetBrains Mono',monospace; }
        .nk-schedule-item { display:block; width:100%; text-align:left; background:none; border:none; border-top:1px solid var(--border-faint); padding:8px 0; font-size:13px; color:var(--text-secondary); cursor:pointer; }
        .nk-schedule-item:first-child { border-top:none; }
        .nk-schedule-item:hover { color:var(--accent-red); }

        .nk-download-pdf-btn { display:flex; align-items:center; justify-content:center; gap:8px; width:100%; padding:12px; border-radius:12px; border:1px solid var(--border-soft); background:var(--surface-2); color:var(--text); font-size:13px; font-weight:600; cursor:pointer; }
        .nk-download-pdf-btn:hover { border-color:var(--accent-red); color:var(--accent-red); }

        .nk-tab-premium { display:flex; align-items:center; }
        .nk-tab-premium.is-active { background:linear-gradient(90deg,var(--accent-red),var(--accent-gold)); color:var(--bg); }

        .nk-premium-card { max-width:600px; margin:0 auto; background:var(--surface); border:1px solid var(--border-soft); border-radius:24px; padding:40px 32px; text-align:center; position:relative; overflow:hidden; }
        .nk-premium-photo { width:100%; max-height:280px; object-fit:cover; border-radius:16px; margin-bottom:24px; display:block; position:relative; }
        .nk-store-wrap { max-width:900px; margin:0 auto; }
        .nk-store-photo { width:100%; height:auto; border-radius:20px; display:block; border:1px solid var(--border-soft); }

        .nk-news-grid { display:grid; grid-template-columns:1fr; gap:16px; }
        @media (min-width:640px) { .nk-news-grid { grid-template-columns:1fr 1fr; } }
        .nk-news-card { text-align:left; background:var(--surface); border:1px solid var(--border); border-radius:16px; padding:20px; cursor:pointer; transition:border-color 0.15s ease, transform 0.15s ease; }
        .nk-news-card:hover { border-color:var(--accent-red); transform:translateY(-2px); }
        .nk-news-card-meta { font-size:10px; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.08em; margin-bottom:8px; }
        .nk-news-card-title { font-size:1.5rem; line-height:1; margin:0 0 8px; color:var(--text); }
        .nk-news-card-summary { font-size:13.5px; color:var(--text-muted); line-height:1.5; margin:0 0 14px; }
        .nk-news-card-link { font-size:12px; font-weight:700; color:var(--accent-red); }

        .nk-news-article { max-width:680px; margin:0 auto; }
        .nk-news-article-meta { font-size:11px; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.08em; margin-bottom:10px; }
        .nk-news-article-title { font-size:2.4rem; line-height:1; margin:0 0 24px; color:var(--text); }
        .nk-news-article-body { font-size:15px; line-height:1.7; color:var(--text-secondary); margin:0 0 18px; }
        .nk-premium-card::before { content:""; position:absolute; top:-30%; left:50%; transform:translateX(-50%); width:80%; height:60%; background:radial-gradient(circle, rgba(255,176,32,0.15) 0%, transparent 70%); pointer-events:none; }
        .nk-premium-eyebrow { display:flex; align-items:center; justify-content:center; gap:8px; color:var(--accent-gold); margin-bottom:14px; font-size:12px; position:relative; }
        .nk-premium-title { font-size:2.6rem; line-height:0.95; margin:0 0 16px; position:relative; }
        .nk-premium-sub { color:var(--text-muted); font-size:15px; line-height:1.6; max-width:440px; margin:0 auto 24px; font-family:'Barlow Condensed',sans-serif; position:relative; }
        .nk-premium-bullets { list-style:none; margin:0 0 28px; padding:0; display:flex; flex-direction:column; gap:10px; text-align:left; max-width:380px; margin-left:auto; margin-right:auto; position:relative; }
        .nk-premium-bullets li { display:flex; gap:10px; font-size:14px; color:var(--text-secondary); align-items:flex-start; }
        .nk-premium-bullets svg { color:var(--good-border); flex-shrink:0; margin-top:2px; }
        .nk-premium-buy-row { display:flex; align-items:center; justify-content:center; gap:16px; position:relative; flex-wrap:wrap; }
        .nk-premium-price { font-size:2rem; font-family:'Inter',sans-serif; font-weight:800; color:var(--text); }
        .nk-premium-cta { display:flex; align-items:center; gap:8px; padding:14px 28px; border-radius:999px; background:linear-gradient(90deg,var(--accent-red),var(--accent-gold)); color:var(--bg); font-weight:700; font-size:14px; text-decoration:none; }
        .nk-premium-cta:hover { opacity:0.9; }
        .nk-premium-note { margin-top:16px; font-size:11px; color:var(--text-dim); font-family:'JetBrains Mono',monospace; position:relative; }
        .nk-premium-free-note { text-align:center; margin-top:24px; font-size:13px; color:var(--text-muted); }
        .nk-premium-free-link { background:none; border:none; color:var(--accent-red); font-weight:600; cursor:pointer; font-size:13px; text-decoration:underline; text-underline-offset:3px; }
      `}</style>

      {/* Fixed search + filters + language switcher */}
      <div ref={barRef} className="nk-bar">
        <div className="nk-bar-inner">
          <div className="nk-tabs-row">
            <div className="nk-tab-group">
              <button onClick={() => setView("welcome")} className={`nk-tab-btn ${view === "welcome" ? "is-active" : ""}`}>
                {t.tabWelcome}
              </button>
              <button onClick={() => setView("library")} className={`nk-tab-btn ${view === "library" ? "is-active" : ""}`}>
                {t.tabLibrary}
              </button>
              <button onClick={() => setView("research")} className={`nk-tab-btn ${view === "research" ? "is-active" : ""}`}>
                {t.tabResearch}
              </button>
              <button onClick={() => setView("stack")} className={`nk-tab-btn ${view === "stack" ? "is-active" : ""}`}>
                {t.tabStack}
              </button>
              <button onClick={() => setView("compare")} className={`nk-tab-btn ${view === "compare" ? "is-active" : ""}`}>
                {t.tabCompare}
              </button>
              <button onClick={() => setView("premium")} className={`nk-tab-btn nk-tab-premium ${view === "premium" ? "is-active" : ""}`}>
                <Crown size={12} style={{ marginRight: 4, display: "inline", verticalAlign: "-2px" }} />
                {t.tabPremium}
              </button>
              <button onClick={() => setView("store")} className={`nk-tab-btn ${view === "store" ? "is-active" : ""}`}>
                {t.tabStore}
              </button>
              <button onClick={() => setView("news")} className={`nk-tab-btn ${view === "news" ? "is-active" : ""}`}>
                {t.tabNews}
              </button>
            </div>
            <button
              onClick={() => setTheme((th) => (th === "dark" ? "light" : "dark"))}
              className="nk-theme-toggle"
              aria-label="Toggle light/dark theme"
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
            </button>
          </div>
          <div className="nk-search-row">
            {view === "library" && (
              <div className="nk-search-wrap">
                <Search size={16} className="nk-search-icon" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t.searchPlaceholder}
                  className="nk-search-input"
                />
                {query && (
                  <button onClick={() => setQuery("")} className="nk-search-clear" aria-label="Clear">
                    <X size={15} />
                  </button>
                )}
              </div>
            )}
            <div className="nk-bar-controls" style={view !== "library" ? { marginLeft: "auto" } : undefined}>
              {view === "library" && (
                <button
                  onClick={() => setShowFilters((v) => !v)}
                  className={`nk-filter-toggle ${showFilters || activeCategory ? "is-active" : ""}`}
                >
                  <SlidersHorizontal size={14} strokeWidth={2.25} />
                  <span>{t.filters}</span>
                  {activeCategory && <span className="nk-mono">1</span>}
                </button>
              )}
              <div className="nk-lang-group">
                {LANGUAGES.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => setLang(l.code)}
                    className={`nk-lang-btn ${lang === l.code ? "is-active" : ""}`}
                    aria-label={l.label}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {view === "library" && showFilters && (
            <div className="nk-chip-row">
              <span className="nk-chip-label nk-eyebrow">{t.position}</span>
              <button onClick={() => setActiveCategory(null)} className={`nk-chip ${!activeCategory ? "is-active" : ""}`}>
                {t.all}
              </button>
              {categories.map((cat) => {
                const Icon = CATEGORY_META[cat].icon;
                const active = activeCategory === cat;
                return (
                  <button key={cat} onClick={() => setActiveCategory(active ? null : cat)} className={`nk-chip ${active ? "is-active" : ""}`}>
                    <Icon size={12} strokeWidth={2} />
                    {catLabels[cat]}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div style={{ height: barHeight }} />

      {view === "welcome" ? (
        <>
          <header className="nk-hero">
            <div className="nk-hero-inner">
              <h1 className="nk-display nk-hero-title">
                {t.welcomeHeroTitle}<br /><span className="nk-red-text">STCK</span>
              </h1>
              <p className="nk-hero-sub">{t.welcomeIntro}</p>
            </div>
          </header>

          <main className="nk-main">
            <div className="nk-grid">
              {[
                { icon: Search, view: "library", title: t.tabLibrary, desc: t.welcomeGuideLibraryDesc },
                { icon: Beaker, view: "research", title: t.tabResearch, desc: t.welcomeGuideResearchDesc },
                { icon: SlidersHorizontal, view: "stack", title: t.tabStack, desc: t.welcomeGuideStackDesc },
                { icon: Layers, view: "compare", title: t.tabCompare, desc: t.welcomeGuideCompareDesc },
                { icon: Newspaper, view: "news", title: t.tabNews, desc: t.welcomeGuideNewsDesc },
                { icon: Crown, view: "premium", title: t.tabPremium, desc: t.welcomeGuidePremiumDesc },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <button key={item.view} onClick={() => setView(item.view)} className="nk-card nk-welcome-card">
                    <Icon size={22} className="nk-red-text" style={{ marginBottom: 10 }} />
                    <div className="nk-card-title">{item.title}</div>
                    <p className="nk-card-tagline">{item.desc}</p>
                  </button>
                );
              })}
            </div>

            <button onClick={() => setView("library")} className="nk-cta-btn" style={{ marginTop: 32 }}>
              {t.welcomeCta} <ArrowRight size={16} style={{ marginLeft: 6, display: "inline", verticalAlign: "-3px" }} />
            </button>
          </main>
        </>
      ) : view === "library" ? (
        <>
          {/* Hero */}
          <header className="nk-hero">
            <div className="nk-hero-inner nk-hero-flex">
              <div className="nk-hero-text">
                <h1 className="nk-display nk-hero-title">
                  {t.heroTitle1}<br /><span className="nk-red-text">{t.heroAccent}</span>
                </h1>
                <p className="nk-hero-sub">{t.heroSub}</p>
              </div>
              <img
                src="/images/hero.png"
                alt=""
                className="nk-hero-image"
                onError={(e) => { e.currentTarget.style.display = "none"; }}
              />
            </div>
          </header>

          {/* Grid */}
          <main className="nk-main">
            <div className="nk-count-row nk-mono">
              <span>{filtered.length} {t.count}</span>
              <span>{t.sortBy}</span>
            </div>

            {filtered.length === 0 ? (
              <div className="nk-empty">
                <h3 className="nk-display">{t.emptyTitle}</h3>
                <p className="nk-eyebrow">{t.emptySub}</p>
              </div>
            ) : (
              <div className="nk-grid">
                {filtered.map((item) => {
                  const Icon = CATEGORY_META[item.category].icon;
                  const localized = item.i18n[lang] || item.i18n.en;
                  return (
                    <button key={item.id} onClick={() => openDetail(item)} className="nk-card" style={{ "--cat-accent": CATEGORY_META[item.category].accent }}>
                      <div className="nk-card-watermark nk-display">{CATEGORY_META[item.category].code}</div>
                      <div className="nk-card-top">
                        <RatingBadge rating={EVIDENCE_SCORE[item.evidence]} evidence={item.evidence} />
                        {EVIDENCE_SCORE[item.evidence] >= 90 && <span className="nk-mvp-tag nk-mono">TOP</span>}
                      </div>
                      <div className="nk-card-cat nk-eyebrow">
                        <Icon size={12} strokeWidth={2} style={{ color: CATEGORY_META[item.category].accent }} />
                        {catLabels[item.category]}
                      </div>
                      <h3 className="nk-display nk-card-title">{localized.name}</h3>
                      {lang !== "en" && <p className="nk-mono nk-card-titleEn">{item.i18n.en.name}</p>}
                      <p className="nk-card-tagline">{localized.tagline}</p>
                    </button>
                  );
                })}
              </div>
            )}
          </main>
        </>
      ) : view === "research" ? (
        <>
          {/* Research feed header */}
          <header className="nk-hero">
            <div className="nk-hero-inner">
              <h1 className="nk-display nk-hero-title">
                {t.heroTitle1}<br /><span className="nk-red-text">{t.tabResearch}</span>
              </h1>
              <p className="nk-hero-sub">{t.heroSub}</p>
            </div>
          </header>

          <main className="nk-main">
            <div className="nk-count-row nk-mono">
              <span>{researchFeed.length} {t.count}</span>
            </div>
            <div className="nk-feed-list">
              {researchFeed.map((r) => (
                <button key={r.key} onClick={() => openDetail(r.ingredient)} className="nk-feed-item">
                  <div className="nk-news-dot" />
                  <div>
                    <div className="nk-feed-meta">
                      <span className="nk-news-tag">{r.tag}</span>
                      <span className="nk-feed-ingredient nk-mono">{r.ingredientName}</span>
                    </div>
                    <p className="nk-news-headline">{r.headline}</p>
                    <p className="nk-news-takeaway">{r.takeaway}</p>
                  </div>
                </button>
              ))}
            </div>
          </main>
        </>
      ) : view === "stack" ? (
        <>
          {/* Stack Builder */}
          <header className="nk-hero">
            <div className="nk-hero-inner">
              <h1 className="nk-display nk-hero-title">
                {t.heroTitle1}<br /><span className="nk-red-text">{t.tabStack}</span>
              </h1>
              <p className="nk-hero-sub">{t.stackIntro}</p>
            </div>
          </header>

          <main className="nk-main">
            <div className="nk-count-row nk-mono">
              <span>{stackSelection.length} / {INGREDIENTS.length}</span>
              {stackSelection.length > 0 && (
                <button onClick={() => setStackSelection([])} className="nk-stack-clear">{t.clearStack}</button>
              )}
            </div>

            <div className="nk-stack-picker">
              {INGREDIENTS.map((item) => {
                const localized = item.i18n[lang] || item.i18n.en;
                const active = stackSelection.includes(item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => toggleStackItem(item.id)}
                    className={`nk-stack-chip ${active ? "is-active" : ""}`}
                  >
                    {localized.name}
                  </button>
                );
              })}
            </div>

            {stackSelection.length === 0 ? (
              <div className="nk-empty">
                <p className="nk-eyebrow">{t.stackEmpty}</p>
              </div>
            ) : (
              <div className="nk-stack-results">
                <button onClick={downloadStackPdf} className="nk-download-pdf-btn">
                  <Download size={15} />
                  {t.downloadPdf}
                </button>
                <div className="nk-stack-section">
                  <h4>{t.synergiesTitle}</h4>
                  {stackAnalysis.synergies.length === 0 ? (
                    <p className="nk-stack-note">{t.noSynergies}</p>
                  ) : (
                    <ul className="nk-stack-list nk-stack-list-good">
                      {stackAnalysis.synergies.map((s, i) => (
                        <li key={i}>{s[lang] || s.en}</li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="nk-stack-section">
                  <h4>{t.cautionsTitle}</h4>
                  {stackAnalysis.cautions.length === 0 ? (
                    <p className="nk-stack-note">{t.noCautions}</p>
                  ) : (
                    <ul className="nk-stack-list nk-stack-list-caution">
                      {stackAnalysis.cautions.map((c, i) => (
                        <li key={i}>{c[lang] || c.en}</li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="nk-stack-section">
                  <h4>{t.scheduleTitle}</h4>
                  <div className="nk-schedule-grid">
                    {[
                      ["morning", t.slotMorning],
                      ["pre-workout", t.slotPreWorkout],
                      ["post-workout", t.slotPostWorkout],
                      ["evening", t.slotEvening],
                      ["anytime", t.slotAnytime],
                    ].map(([slot, label]) =>
                      stackAnalysis.schedule[slot].length === 0 ? null : (
                        <div key={slot} className="nk-schedule-col">
                          <div className="nk-schedule-label">{label}</div>
                          {stackAnalysis.schedule[slot].map((item) => {
                            const localized = item.i18n[lang] || item.i18n.en;
                            return (
                              <button key={item.id} onClick={() => openDetail(item)} className="nk-schedule-item">
                                {localized.name}
                              </button>
                            );
                          })}
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            )}
          </main>
        </>
      ) : view === "compare" ? (
        <>
          {/* Product Compare — self-contained, real branded products */}
          <header className="nk-hero">
            <div className="nk-hero-inner">
              <h1 className="nk-display nk-hero-title">
                {t.heroTitle1}<br /><span className="nk-red-text">{t.tabCompare}</span>
              </h1>
              <p className="nk-hero-sub">{t.compareIntro}</p>
            </div>
          </header>

          <main className="nk-main">
            <div className="nk-chip-row" style={{ marginBottom: 16 }}>
              <span className="nk-chip-label nk-eyebrow">{t.compareCategoryLabel}</span>
              {Object.keys(PRODUCT_CATEGORIES.en).map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setCompareCategory(cat);
                    setCompareSelection(PRODUCTS.filter((p) => p.category === cat).map((p) => p.id));
                  }}
                  className={`nk-chip ${compareCategory === cat ? "is-active" : ""}`}
                >
                  {PRODUCT_CATEGORIES[lang][cat]}
                </button>
              ))}
            </div>

            <div className="nk-stack-picker" style={{ marginBottom: 24 }}>
              {PRODUCTS.filter((p) => p.category === compareCategory).map((p) => {
                const active = compareSelection.includes(p.id);
                return (
                  <button
                    key={p.id}
                    onClick={() =>
                      setCompareSelection((sel) =>
                        active ? sel.filter((id) => id !== p.id) : [...sel, p.id]
                      )
                    }
                    className={`nk-stack-chip ${active ? "is-active" : ""}`}
                  >
                    {p.brand} — {p.name}
                  </button>
                );
              })}
            </div>

            {compareSelection.length === 0 ? (
              <div className="nk-empty">
                <p className="nk-eyebrow">{t.compareEmptySub}</p>
              </div>
            ) : (
              <>
                <div style={{ overflowX: "auto" }}>
                  <table className="nk-compare-table">
                    <thead>
                      <tr>
                        <th></th>
                        {PRODUCTS.filter((p) => compareSelection.includes(p.id)).map((p) => (
                          <th key={p.id}>
                            {p.image ? (
                              <img src={p.image} alt={`${p.brand} ${p.name}`} className="nk-compare-photo" />
                            ) : null}
                            <div className="nk-eyebrow">{p.brand}</div>
                            <div className="nk-display">{p.name}</div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(PRODUCTS.find((p) => compareSelection.includes(p.id))?.specs || []).map((spec, i) => (
                        <tr key={spec.label}>
                          <td className="nk-compare-row-label">{spec.label}</td>
                          {PRODUCTS.filter((p) => compareSelection.includes(p.id)).map((p) => (
                            <td key={p.id}>{p.specs[i] ? p.specs[i].value : "—"}</td>
                          ))}
                        </tr>
                      ))}
                      <tr>
                        <td className="nk-compare-row-label">{t.compareColCert}</td>
                        {PRODUCTS.filter((p) => compareSelection.includes(p.id)).map((p) => (
                          <td key={p.id}>{p.certifications}</td>
                        ))}
                      </tr>
                      <tr>
                        <td className="nk-compare-row-label">{t.compareColPrice}</td>
                        {PRODUCTS.filter((p) => compareSelection.includes(p.id)).map((p) => (
                          <td key={p.id}>{p.pricePerServing}</td>
                        ))}
                      </tr>
                      <tr>
                        <td className="nk-compare-row-label">{t.compareSourceLink}</td>
                        {PRODUCTS.filter((p) => compareSelection.includes(p.id)).map((p) => (
                          <td key={p.id}>
                            <a href={p.sourceUrl} target="_blank" rel="noopener noreferrer" className="nk-compare-source-link">
                              {t.compareSourceLink} ↗
                            </a>
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="nk-stack-note" style={{ marginTop: 16 }}>{t.compareDataNote}</p>
              </>
            )}
          </main>
        </>
      ) : view === "premium" ? (
        <>
          {/* Premium */}
          <main className="nk-main" style={{ paddingTop: 48 }}>
            <div className="nk-premium-card">
              <img
                src="/premium.jpg"
                alt="Personal training and stack coaching"
                className="nk-premium-photo"
                onError={(e) => { e.currentTarget.style.display = "none"; }}
              />
              <div className="nk-premium-eyebrow nk-mono">
                <Crown size={14} strokeWidth={2} />
                <span>{t.premiumEyebrow}</span>
              </div>
              <h1 className="nk-display nk-premium-title">
                {t.premiumTitle1}<br /><span className="nk-red-text">{t.premiumAccent}</span>
              </h1>
              <p className="nk-premium-sub">{t.premiumSub}</p>

              <ul className="nk-premium-bullets">
                {t.premiumBullets.map((b, i) => (
                  <li key={i}>
                    <Check size={16} />
                    {b}
                  </li>
                ))}
              </ul>

              <div className="nk-premium-buy-row">
                <span className="nk-premium-price">{t.premiumPrice}</span>
                <a
                  href="mailto:hello@stck.info?subject=Personal%20Training%20%26%20Stack%20Plan%20Request"
                  className="nk-premium-cta"
                >
                  <Mail size={16} />
                  {t.premiumCta}
                </a>
              </div>
              <p className="nk-premium-note">{t.premiumNote}</p>
            </div>

            <p className="nk-premium-free-note">
              {t.premiumFreeNote}{" "}
              <button onClick={() => setView("stack")} className="nk-premium-free-link">{t.tabStack} →</button>
            </p>
          </main>
        </>
      ) : view === "store" ? (
        <>
          {/* Store */}
          <main className="nk-main" style={{ paddingTop: 48 }}>
            <div className="nk-store-wrap">
              <img
                src="/store.jpg"
                alt="Store"
                className="nk-store-photo"
                onError={(e) => { e.currentTarget.style.display = "none"; }}
              />
            </div>
          </main>
        </>
      ) : (
        <>
          {/* News */}
          <header className="nk-hero">
            <div className="nk-hero-inner">
              <h1 className="nk-display nk-hero-title">
                {t.heroTitle1}<br /><span className="nk-red-text">{t.tabNews}</span>
              </h1>
            </div>
          </header>
          <main className="nk-main">
            {selectedNews ? (
              <div className="nk-news-article">
                <button onClick={() => setSelectedNews(null)} className="nk-premium-free-link" style={{ marginBottom: 24 }}>
                  ← {t.newsBack}
                </button>
                <div className="nk-news-article-meta nk-mono">{selectedNews.category} · {selectedNews.date}</div>
                <h2 className="nk-display nk-news-article-title">{selectedNews.title}</h2>
                {selectedNews.body.split("\n\n").map((para, i) => (
                  <p key={i} className="nk-news-article-body">{para}</p>
                ))}
              </div>
            ) : NEWS.length === 0 ? (
              <div className="nk-empty">
                <p className="nk-eyebrow">No news posts yet.</p>
              </div>
            ) : (
              <div className="nk-news-grid">
                {NEWS.map((post) => (
                  <button key={post.slug} onClick={() => setSelectedNews(post)} className="nk-news-card">
                    <div className="nk-news-card-meta nk-mono">{post.category} · {post.date}</div>
                    <h3 className="nk-display nk-news-card-title">{post.title}</h3>
                    <p className="nk-news-card-summary">{post.summary}</p>
                    <span className="nk-news-card-link">{t.newsReadMore} →</span>
                  </button>
                ))}
              </div>
            )}
          </main>
        </>
      )}

      <footer className="nk-footer">
        <div className="nk-footer-about">
          <h4>{t.aboutTitle}</h4>
          <p>{t.aboutText}</p>
        </div>
        <p className="nk-footer-disclaimer">{t.footer}</p>
        <button onClick={() => setShowLegal(true)} className="nk-footer-legal-link">{t.legalLink}</button>
        <p className="nk-footer-copyright">{t.copyright}</p>
      </footer>

      {/* Legal / Disclaimer modal */}
      {showLegal && (
        <div className="nk-modal-overlay">
          <div className="nk-modal-backdrop" onClick={() => setShowLegal(false)} />
          <div className="nk-modal-panel">
            <div className="nk-modal-head">
              <div className="nk-eyebrow" style={{ fontSize: 12, color: "#9A9A9A" }}>{t.legalTitle}</div>
              <button onClick={() => setShowLegal(false)} className="nk-modal-close" aria-label="Close">
                <X size={20} />
              </button>
            </div>
            <div className="nk-modal-body">
              <h2 className="nk-display nk-modal-title" style={{ fontSize: "2.2rem", marginBottom: 20 }}>{t.legalTitle}</h2>
              <div className="nk-legal-list">
                {t.legalBody.map((paragraph, i) => {
                  const [head, ...rest] = paragraph.split(" — ");
                  return (
                    <p key={i}>
                      <strong>{head}</strong>{rest.length ? " — " + rest.join(" — ") : ""}
                    </p>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detail modal */}
      {selected && (() => {
        const localized = selected.i18n[lang] || selected.i18n.en;
        return (
          <div className="nk-modal-overlay">
            <div className="nk-modal-backdrop" onClick={closeDetail} />
            <div className="nk-modal-panel">
              <div className="nk-modal-head">
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#9A9A9A" }} className="nk-eyebrow">
                  {React.createElement(CATEGORY_META[selected.category].icon, { size: 14 })}
                  {catLabels[selected.category]}
                </div>
                <button onClick={closeDetail} className="nk-modal-close" aria-label="Close">
                  <X size={20} />
                </button>
              </div>

              <div className="nk-modal-body">
                {(() => {
                  const hasFullTranslation = !!(localized && localized.mechanism);
                  const detail = hasFullTranslation ? localized : selected;
                  const detailGoals = hasFullTranslation ? localized.goals : selected.goals;
                  const showNote = lang !== "en" && !hasFullTranslation;
                  const TABS = [
                    ["overview", t.tabOverview],
                    ["research", t.tabResearchDetail],
                    ["practical", t.tabPractical],
                  ];
                  return (
                    <>
                      <div className="nk-modal-title-row">
                        <div>
                          <h2 className="nk-display nk-modal-title">{localized.name}</h2>
                          {lang !== "en" && <p className="nk-modal-titleEn">{selected.i18n.en.name}</p>}
                        </div>
                        <RatingBadge rating={EVIDENCE_SCORE[selected.evidence]} evidence={selected.evidence} size="lg" ovrLabel={t.ovr} />
                      </div>

                      <p className="nk-modal-tagline">{localized.tagline}</p>

                      <div className="nk-goal-chips">
                        {detailGoals.map((g) => (
                          <span key={g} className="nk-goal-chip">{g}</span>
                        ))}
                      </div>

                      {showNote && <p className="nk-detail-note">{t.detailNote}</p>}

                      <div className="nk-detail-tabs">
                        {TABS.map(([key, label]) => (
                          <button
                            key={key}
                            onClick={() => setDetailTab(key)}
                            className={`nk-detail-tab ${detailTab === key ? "is-active" : ""}`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>

                      {detailTab === "overview" && (
                        <>
                          <div style={{ marginBottom: 24 }}>
                            <StatBar label={t.evidence} value={EVIDENCE_LEVELS[selected.evidence] * 33} />
                            <StatBar label={t.ovr} value={EVIDENCE_SCORE[selected.evidence]} />
                          </div>
                          <div className="nk-section">
                            <h4>{t.mechanism}</h4>
                            <p>{detail.mechanism}</p>
                          </div>
                          <div className="nk-section" style={{ marginBottom: 0 }}>
                            <h4>{t.benefits}</h4>
                            <ul className="nk-benefit-list">
                              {detail.benefits.map((b, i) => (
                                <li key={i}>
                                  <TrendingUp size={14} />
                                  {b}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </>
                      )}

                      {detailTab === "research" && (
                        <div className="nk-news-list">
                          {detail.research.map((r, i) => (
                            <div key={i} className="nk-news-item">
                              <div className="nk-news-dot" />
                              <div>
                                <span className="nk-news-tag">{r.tag}</span>
                                <p className="nk-news-headline">{r.headline}</p>
                                <p className="nk-news-takeaway">{r.takeaway}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {detailTab === "practical" && (
                        <>
                          <div className="nk-info-grid">
                            <div className="nk-info-box">
                              <div className="nk-info-box-head"><Beaker size={13} /> {t.dosage}</div>
                              <p>{detail.dosage}</p>
                            </div>
                            <div className="nk-info-box">
                              <div className="nk-info-box-head"><Timer size={13} /> {t.timing}</div>
                              <p>{detail.timing}</p>
                            </div>
                          </div>
                          <div className="nk-caution-box" style={{ marginBottom: 0 }}>
                            <div className="nk-caution-head"><AlertTriangle size={13} /> {t.caution}</div>
                            <p>{detail.cautions}</p>
                          </div>
                        </>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
