import type { Translation } from "./types";

export const translations: Record<"en" | "fr" | "ar", Translation> = {
  en: {
    nav: {
      features: "Features",
      upload: "Upload",
      about: "About",
      tips: "Tips",
      languageLabel: "Language",
    },
    languages: { en: "English", fr: "Français", ar: "العربية" },
    header: {
      tagline: "Discover the perfect combination of invoices to hit your target",
      description:
        "Upload a spreadsheet or enter invoice details manually. InvoiceMix calculates every unique combination that matches your goal without reusing the same invoice twice.",
      carousel: [
        "Upload an Excel file and let InvoiceMix scan every invoice for target-matching combinations.",
        "Use manual entry with min/max constraints and required IDs for absolute control.",
        "Save, reload, and export scenarios so finance teammates can collaborate instantly.",
      ],
      carouselTitles: ["Smart Uploads", "Manual Precision", "Team Ready"],
      carouselAria: "Show highlight {{index}}",
      homeLinkAria: "Go to the home page",
    },
    sidebar: {
      lastRunTitle: "Last search summary",
      lastRunEmpty: "Run a manual or Excel search to see a quick summary here.",
      targetLabel: "Target",
      invoiceCountLabel: "Invoices",
      rangeLabel: "Range",
      rangeUnset: "Not set",
      requiredLabel: "Required ids",
      requiredEmpty: "None",
      quickActionsTitle: "Quick actions",
      tipsTitle: "Pro tips",
      tips: [
        "Use the Saved scenarios tab (or the new tips page) to reload any combination set instantly.",
        "Switch between manual entry and Excel upload from the Actions tab or the navigation bar.",
        "Export CSV results after every run so teammates can validate the combinations quickly.",
      ],
      savedCta:
        "Saved scenarios live on the manual workspace. Visit it to manage or reload combinations.",
      tabSummary: "Summary",
      tabActions: "Actions",
      tabTips: "Tips",
      tabShortcuts: "Shortcuts",
      tabScenarios: "Saved scenarios",
    },
    sidebarLeft: {
      title: "Workspace shortcuts",
      features: [
        {
          id: "workspace-primary",
          title: "Workspace setup",
          description:
            "Define targets, required ids, and choose manual or Excel entry.",
        },
        {
          id: "workspace-results",
          title: "Results & exports",
          description:
            "Review matching combinations, save favourites, and export CSVs.",
        },
        {
          id: "workspace-scenarios",
          title: "Saved scenarios",
          description:
            "Reload previous scenarios or tidy up what you no longer need.",
        },
      ],
    },
    manualForm: {
      title: "Manual entry",
      targetLabel: "Target amount",
      minLabel: "Min invoices",
      maxLabel: "Max invoices",
      requiredLabel: "Required invoice ids",
      requiredHelper: "Separate multiple ids with commas.",
      invoiceSectionLabel: "Invoice amounts",
      addInvoice: "+ Add invoice",
      invoicePlaceholderLabel: "Invoice",
      amountPlaceholder: "Amount",
      remove: "Remove",
      submit: "Find combinations",
      submitting: "Searching...",
      optionalPlaceholder: "Optional",
    },
    excelForm: {
      title: "Excel upload",
      targetLabel: "Target amount",
      minLabel: "Min invoices",
      maxLabel: "Max invoices",
      requiredLabel: "Required invoice ids",
      requiredHelper: "Separate multiple ids with commas.",
      fileLabel: "Invoice spreadsheet (.xlsx)",
      fileHint:
        "We read the first sheet and treat the first row as optional headers.",
      selectedFileLabel: "Selected file:",
      submit: "Upload and calculate",
      processing: "Processing...",
    },
    results: {
      title: "Results overview",
      introIdle: "Submit the form to see matching combinations.",
      introEmpty: "No combinations matched the target.",
      introFoundSingle: "Found 1 combination that reaches the target.",
      introFoundPlural: "Found {{count}} combinations that reach the target.",
      combinationLabelPrefix: "Combination",
      totalLabel: "Total",
      noResultsHelp:
        "Try adjusting the target or adding more invoices. We will only show combinations that reach the target exactly without reusing an invoice amount.",
      saveScenario: "Save scenario",
      exportCsv: "Export CSV",
      exporting: "Exporting...",
    },
    saved: {
      title: "Saved scenarios",
      countLabelSingle: "1 saved",
      countLabelPlural: "{{count}} saved",
      defaultNamePrefix: "Scenario",
      prompt: "Name this scenario",
      load: "Load",
      delete: "Delete",
      requiresPrefix: "Requires: ",
      cardSummarySingle: "Target {{amount}} · 1 invoice",
      cardSummaryPlural: "Target {{amount}} · {{count}} invoices",
      empty:
        "No scenarios saved yet. Run a search, save it, and it will appear here.",
    },
    about: {
      title: "About InvoiceMix",
      intro:
        "InvoiceMix helps finance teams hunt down invoice combinations that match a specific total in seconds.",
      bullets: [
        "Apply filters to control minimum and maximum invoices per combination.",
        "Keep combinations unique and order-independent to avoid duplicates.",
        "Export the results and share them instantly with your stakeholders.",
      ],
      closing:
        "Built for teams that need clarity fast—whether you're reconciling payments or planning cash flow.",
    },
    footer: {
      tagline: "InvoiceMix – smarter invoice combination search for finance teams.",
      copyright: "© {{year}} InvoiceMix. All rights reserved.",
    },
    errors: {
      targetPositive: "Please provide a target amount greater than zero.",
      minPositive: "Minimum invoice count must be a positive integer.",
      maxPositive: "Maximum invoice count must be a positive integer.",
      minLessThanMax: "Maximum invoice count cannot be less than the minimum.",
      uploadFileRequired: "Please select an .xlsx file containing invoice data.",
      numbersPositive: "Invoice amounts must be numbers greater than zero.",
      duplicateIdTemplate: 'Invoice id "{{id}}" is duplicated. Use unique ids.',
      missingFields: "Each invoice needs both an id and an amount.",
      addInvoices: "Add at least one invoice before searching.",
      fetchFailed: "Unable to fetch combinations right now.",
      manualUnexpected: "An unexpected error occurred.",
      uploadFailed: "Unable to process the uploaded Excel file.",
      excelUnexpected: "An unexpected error occurred while processing the file.",
      runSearchBeforeSave: "Run a search before saving a scenario.",
      runSearchBeforeExport: "Run a search before exporting combinations.",
      exportInvalidTarget:
        "Unable to export because the last target amount is invalid.",
      exportNoInvoices:
        "Unable to export because no valid invoices were found in the last request.",
      exportUnexpected: "An unexpected error occurred while exporting combinations.",
    },
    languageSelectorAria: "Select language",
  },
  fr: {
    nav: {
      features: "Fonctionnalités",
      upload: "Téléversement",
      about: "À propos",
      tips: "Conseils",
      languageLabel: "Langue",
    },
    languages: { en: "English", fr: "Français", ar: "العربية" },
    header: {
      tagline:
        "Découvrez la combinaison idéale de factures pour atteindre votre objectif",
      description:
        "Téléversez une feuille de calcul ou saisissez vos factures manuellement. InvoiceMix calcule chaque combinaison unique qui correspond à votre cible sans réutiliser la même facture.",
      carousel: [
        "Importez un fichier Excel et laissez InvoiceMix détecter les combinaisons qui atteignent l’objectif.",
        "Utilisez la saisie manuelle avec des limites min/max et des identifiants requis pour garder le contrôle.",
        "Enregistrez, rechargez et exportez vos scénarios pour collaborer rapidement avec l’équipe finance.",
      ],
      carouselTitles: ["Import intelligent", "Précision manuelle", "Prêt pour l’équipe"],
      carouselAria: "Afficher la mise en avant {{index}}",
      homeLinkAria: "Aller à la page d’accueil",
    },
    sidebar: {
      lastRunTitle: "Résumé de la dernière recherche",
      lastRunEmpty: "Lancez une recherche manuelle ou Excel pour afficher un résumé ici.",
      targetLabel: "Montant cible",
      invoiceCountLabel: "Factures",
      rangeLabel: "Plage",
      rangeUnset: "Non défini",
      requiredLabel: "Identifiants requis",
      requiredEmpty: "Aucun",
      quickActionsTitle: "Actions rapides",
      tipsTitle: "Astuces",
      tips: [
        "Utilisez l’onglet Scénarios sauvegardés (ou la page des conseils) pour relancer une configuration en un clic.",
        "Basculez entre saisie manuelle et import Excel depuis l’onglet Actions ou la barre de navigation.",
        "Exportez les résultats en CSV après chaque recherche pour les partager rapidement avec l’équipe.",
      ],
      savedCta:
        "Les scénarios enregistrés se gèrent depuis l’espace manuel. Rendez-vous-y pour les recharger ou les organiser.",
      tabSummary: "Résumé",
      tabActions: "Actions",
      tabTips: "Conseils",
      tabShortcuts: "Raccourcis",
      tabScenarios: "Scénarios enregistrés",
    },
    sidebarLeft: {
      title: "Raccourcis du workspace",
      features: [
        {
          id: "workspace-primary",
          title: "Configuration du workspace",
          description:
            "Définissez les montants cibles, les identifiants requis et choisissez une saisie manuelle ou Excel.",
        },
        {
          id: "workspace-results",
          title: "Résultats et exports",
          description:
            "Analysez les correspondances, enregistrez vos favoris et exportez les combinaisons en CSV.",
        },
        {
          id: "workspace-scenarios",
          title: "Scénarios enregistrés",
          description:
            "Rechargez vos configurations ou supprimez celles devenues inutiles.",
        },
      ],
    },
    manualForm: {
      title: "Saisie manuelle",
      targetLabel: "Montant cible",
      minLabel: "Nombre min. de factures",
      maxLabel: "Nombre max. de factures",
      requiredLabel: "Identifiants de facture requis",
      requiredHelper: "Séparez plusieurs identifiants avec des virgules.",
      invoiceSectionLabel: "Montants des factures",
      addInvoice: "+ Ajouter une facture",
      invoicePlaceholderLabel: "Facture",
      amountPlaceholder: "Montant",
      remove: "Supprimer",
      submit: "Rechercher les combinaisons",
      submitting: "Recherche...",
      optionalPlaceholder: "Optionnel",
    },
    excelForm: {
      title: "Import Excel",
      targetLabel: "Montant cible",
      minLabel: "Nombre min. de factures",
      maxLabel: "Nombre max. de factures",
      requiredLabel: "Identifiants de facture requis",
      requiredHelper: "Séparez plusieurs identifiants avec des virgules.",
      fileLabel: "Fichier de factures (.xlsx)",
      fileHint:
        "Nous lisons la première feuille et considérons la première ligne comme un en-tête optionnel.",
      selectedFileLabel: "Fichier sélectionné :",
      submit: "Téléverser et calculer",
      processing: "Traitement...",
    },
    results: {
      title: "Vue d'ensemble des résultats",
      introIdle: "Soumettez le formulaire pour afficher les combinaisons correspondantes.",
      introEmpty: "Aucune combinaison ne correspond au montant cible.",
      introFoundSingle: "Une combinaison atteint le montant cible.",
      introFoundPlural: "{{count}} combinaisons atteignent le montant cible.",
      combinationLabelPrefix: "Combinaison",
      totalLabel: "Total",
      noResultsHelp:
        "Ajustez le montant cible ou ajoutez davantage de factures. Nous n'affichons que les combinaisons qui respectent exactement le montant sans réutiliser de facture.",
      saveScenario: "Enregistrer le scénario",
      exportCsv: "Exporter en CSV",
      exporting: "Export en cours...",
    },
    saved: {
      title: "Scénarios enregistrés",
      countLabelSingle: "1 scénario",
      countLabelPlural: "{{count}} scénarios",
      defaultNamePrefix: "Scénario",
      prompt: "Nommer ce scénario",
      load: "Charger",
      delete: "Supprimer",
      requiresPrefix: "Obligatoire : ",
      cardSummarySingle: "Objectif {{amount}} · 1 facture",
      cardSummaryPlural: "Objectif {{amount}} · {{count}} factures",
      empty:
        "Aucun scénario enregistré pour l’instant. Lancez une recherche et enregistrez-la pour l’afficher ici.",
    },
    about: {
      title: "À propos d'InvoiceMix",
      intro:
        "InvoiceMix aide les équipes financières à trouver rapidement les combinaisons de factures qui correspondent à un total donné.",
      bullets: [
        "Appliquez des filtres pour contrôler le nombre minimum et maximum de factures.",
        "Éliminez les doublons grâce à des combinaisons uniques et indépendantes de l'ordre.",
        "Exportez les résultats et partagez-les facilement avec vos collaborateurs.",
      ],
      closing:
        "Conçu pour les équipes qui ont besoin de réponses claires et rapides, qu'il s'agisse de rapprochement ou de planification.",
    },
    footer: {
      tagline:
        "InvoiceMix – trouvez instantanément les combinaisons de factures adaptées à vos besoins.",
      copyright: "© {{year}} InvoiceMix. Tous droits réservés.",
    },
    errors: {
      targetPositive: "Veuillez saisir un montant cible supérieur à zéro.",
      minPositive:
        "Le nombre minimum de factures doit être un entier positif.",
      maxPositive:
        "Le nombre maximum de factures doit être un entier positif.",
      minLessThanMax:
        "Le nombre maximum ne peut pas être inférieur au minimum.",
      uploadFileRequired:
        "Veuillez sélectionner un fichier .xlsx contenant des factures.",
      numbersPositive:
        "Les montants des factures doivent être des nombres strictement positifs.",
      duplicateIdTemplate:
        "L'identifiant de facture « {{id}} » est dupliqué. Utilisez des identifiants uniques.",
      missingFields:
        "Chaque facture doit comporter un identifiant et un montant.",
      addInvoices: "Ajoutez au moins une facture avant de lancer la recherche.",
      fetchFailed: "Impossible de récupérer les combinaisons pour le moment.",
      manualUnexpected: "Une erreur inattendue est survenue.",
      uploadFailed: "Impossible de traiter le fichier Excel téléversé.",
      excelUnexpected: "Une erreur inattendue est survenue lors du traitement du fichier.",
      runSearchBeforeSave:
        "Lancez une recherche avant d'enregistrer un scénario.",
      runSearchBeforeExport:
        "Lancez une recherche avant d'exporter les combinaisons.",
      exportInvalidTarget:
        "Impossible d'exporter car le dernier montant cible est invalide.",
      exportNoInvoices:
        "Impossible d'exporter car aucune facture valide n'a été trouvée dans la dernière requête.",
      exportUnexpected: "Une erreur inattendue est survenue lors de l'export.",
    },
    languageSelectorAria: "Choisir la langue",
  },
  ar: {
    nav: {
      features: "الخصائص",
      upload: "التحميل",
      about: "حول",
      tips: "نصائح",
      languageLabel: "اللغة",
    },
    languages: { en: "English", fr: "Français", ar: "العربية" },
    header: {
      tagline: "اكتشف التركيبة المثالية من الفواتير للوصول إلى هدفك",
      description:
        "حمّل ملف إكسل أو أدخل تفاصيل الفواتير يدوياً. يقوم InvoiceMix بحساب جميع التركيبات الفريدة التي تطابق هدفك من دون إعادة استخدام نفس الفاتورة.",
      carousel: [
        "ارفع ملف Excel ودع InvoiceMix يبحث عن كل تركيبة تطابق المبلغ المستهدف.",
        "استخدم الإدخال اليدوي مع حدود الحد الأدنى/الأقصى والمعرفات المطلوبة للتحكم الكامل.",
        "احفظ السيناريوهات وأعد تحميلها وصدّرها لتتعاون مع فريقك المالي بسرعة.",
      ],
      carouselTitles: ["تحميل ذكي", "تحكم يدوي", "جاهز للفريق"],
      carouselAria: "عرض الميزة {{index}}",
      homeLinkAria: "الانتقال إلى الصفحة الرئيسية",
    },
    sidebar: {
      lastRunTitle: "ملخص آخر بحث",
      lastRunEmpty: "نفّذ بحثاً يدوياً أو عبر إكسل لعرض ملخص سريع هنا.",
      targetLabel: "المبلغ المستهدف",
      invoiceCountLabel: "عدد الفواتير",
      rangeLabel: "النطاق",
      rangeUnset: "غير محدد",
      requiredLabel: "المعرفات المطلوبة",
      requiredEmpty: "لا يوجد",
      quickActionsTitle: "إجراءات سريعة",
      tipsTitle: "نصائح",
      tips: [
        "استخدم علامة تبويب السيناريوهات المحفوظة (أو صفحة النصائح) لإعادة تحميل أي تركيبة فوراً.",
        "بدّل بين الإدخال اليدوي ورفع Excel من خلال علامة تبويب الإجراءات أو شريط التنقل.",
        "صدّر النتائج بصيغة CSV بعد كل بحث وشاركها مع فريقك للتأكد بسرعة.",
      ],
      savedCta:
        "يمكن إدارة السيناريوهات المحفوظة من مساحة العمل اليدوية. انتقل إليها لإعادة التحميل أو التنظيم.",
      tabSummary: "ملخص",
      tabActions: "إجراءات",
      tabTips: "نصائح",
      tabShortcuts: "اختصارات",
      tabScenarios: "السيناريوهات المحفوظة",
    },
    sidebarLeft: {
      title: "اختصارات مساحة العمل",
      features: [
        {
          id: "workspace-primary",
          title: "إعداد مساحة العمل",
          description:
            "حدد المبالغ المستهدفة والمعرفات المطلوبة واختر الإدخال اليدوي أو عبر إكسل.",
        },
        {
          id: "workspace-results",
          title: "النتائج والتصدير",
          description:
            "استعرض التركيبات المتطابقة، احفظ المفضلة لديك، وصدّرها بصيغة CSV.",
        },
        {
          id: "workspace-scenarios",
          title: "السيناريوهات المحفوظة",
          description:
            "أعد تحميل السيناريوهات السابقة أو نظّف ما لم تعد بحاجة إليه.",
        },
      ],
    },
    manualForm: {
      title: "إدخال يدوي",
      targetLabel: "المبلغ المستهدف",
      minLabel: "الحد الأدنى لعدد الفواتير",
      maxLabel: "الحد الأقصى لعدد الفواتير",
      requiredLabel: "معرّفات الفواتير المطلوبة",
      requiredHelper: "افصل بين المعرّفات باستخدام الفاصلة.",
      invoiceSectionLabel: "مبالغ الفواتير",
      addInvoice: "إضافة فاتورة",
      invoicePlaceholderLabel: "فاتورة",
      amountPlaceholder: "المبلغ",
      remove: "حذف",
      submit: "ابحث عن التركيبات",
      submitting: "جارٍ البحث...",
      optionalPlaceholder: "اختياري",
    },
    excelForm: {
      title: "رفع Excel",
      targetLabel: "المبلغ المستهدف",
      minLabel: "الحد الأدنى لعدد الفواتير",
      maxLabel: "الحد الأقصى لعدد الفواتير",
      requiredLabel: "معرّفات الفواتير المطلوبة",
      requiredHelper: "افصل بين المعرّفات باستخدام الفاصلة.",
      fileLabel: "ملف الفواتير (.xlsx)",
      fileHint: "نقرأ الورقة الأولى ونتعامل مع الصف الأول كعناوين اختيارية.",
      selectedFileLabel: "الملف المحدد:",
      submit: "رفع وحساب",
      processing: "جارٍ المعالجة...",
    },
    results: {
      title: "ملخص النتائج",
      introIdle: "أرسل النموذج لعرض التركيبات المتاحة.",
      introEmpty: "لم تُطابق أي تركيبات الهدف المحدد.",
      introFoundSingle: "تم العثور على تركيبة واحدة تحقق الهدف.",
      introFoundPlural: "تم العثور على {{count}} تركيبة تحقق الهدف.",
      combinationLabelPrefix: "تركيبة",
      totalLabel: "الإجمالي",
      noResultsHelp:
        "جرّب تعديل الهدف أو إضافة المزيد من الفواتير. نعرض فقط التركيبات التي تطابق الهدف من دون تكرار أي فاتورة.",
      saveScenario: "حفظ السيناريو",
      exportCsv: "تصدير CSV",
      exporting: "جارٍ التصدير...",
    },
    saved: {
      title: "السيناريوهات المحفوظة",
      countLabelSingle: "سيناريو واحد",
      countLabelPlural: "{{count}} سيناريوهات",
      defaultNamePrefix: "سيناريو",
      prompt: "أدخل اسم السيناريو",
      load: "تحميل",
      delete: "حذف",
      requiresPrefix: "يتطلب: ",
      cardSummarySingle: "الهدف {{amount}} · فاتورة واحدة",
      cardSummaryPlural: "الهدف {{amount}} · {{count}} فواتير",
      empty:
        "لا توجد سيناريوهات محفوظة بعد. نفّذ بحثاً واحفظه لتجده هنا.",
    },
    about: {
      title: "حول InvoiceMix",
      intro:
        "يمنحك InvoiceMix طريقة سريعة للعثور على مجموعة الفواتير التي تحقق المبلغ المستهدف.",
      bullets: [
        "تطبيق حدود دنيا وعليا لعدد الفواتير داخل كل تركيبة.",
        "ضمان تركيبات فريدة لا تعتمد على ترتيب الفواتير.",
        "تصدير النتائج ومشاركتها بسهولة مع فريقك.",
      ],
      closing: "حل موثوق لفرق المالية التي تحتاج إلى إجابات دقيقة بسرعة.",
    },
    footer: {
      tagline: "InvoiceMix – أداة ذكية لاكتشاف التركيبات المثالية للفواتير.",
      copyright: "© {{year}} InvoiceMix. جميع الحقوق محفوظة.",
    },
    errors: {
      targetPositive: "يرجى إدخال مبلغ مستهدف أكبر من صفر.",
      minPositive: "يجب أن يكون الحد الأدنى لعدد الفواتير عدداً صحيحاً موجباً.",
      maxPositive: "يجب أن يكون الحد الأقصى لعدد الفواتير عدداً صحيحاً موجباً.",
      minLessThanMax: "لا يمكن أن يكون الحد الأقصى أقل من الحد الأدنى.",
      uploadFileRequired: "يرجى اختيار ملف ‎.xlsx يحتوي على الفواتير.",
      numbersPositive: "يجب أن تكون مبالغ الفواتير أرقاماً أكبر من صفر.",
      duplicateIdTemplate: 'معرّف الفاتورة "{{id}}" مكرر. استخدم معرّفات فريدة.',
      missingFields: "يجب أن تحتوي كل فاتورة على معرّف ومبلغ.",
      addInvoices: "أضف فاتورة واحدة على الأقل قبل البحث.",
      fetchFailed: "تعذّر جلب التركيبات حالياً.",
      manualUnexpected: "حدث خطأ غير متوقع.",
      uploadFailed: "تعذّر معالجة ملف Excel المرفوع.",
      excelUnexpected: "حدث خطأ غير متوقع أثناء معالجة الملف.",
      runSearchBeforeSave: "شغّل عملية البحث قبل حفظ السيناريو.",
      runSearchBeforeExport: "شغّل عملية البحث قبل التصدير.",
      exportInvalidTarget: "لا يمكن التصدير لأن المبلغ المستهدف الأخير غير صالح.",
      exportNoInvoices: "لا يمكن التصدير لأنه لم يتم العثور على فواتير صالحة في الطلب الأخير.",
      exportUnexpected: "حدث خطأ غير متوقع أثناء التصدير.",
    },
    languageSelectorAria: "اختيار اللغة",
  },
};
