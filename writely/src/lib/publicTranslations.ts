import type { InterfaceLanguage } from "./writingLanguage";

const english = {
  landing: {
    homeLabel: "Writely home",
    privateSpace: "Your private writing space",
    heroStart: "Give ideas",
    heroAccent: "room",
    heroDescription:
      "Writely keeps the page calm, saves every change, and brings in AI only for the words you choose.",
    heroAction: "Start a private draft",
    principles: [
      {
        number: "01",
        title: "Quiet by default",
        description: "A clean page that keeps the next sentence in view.",
      },
      {
        number: "02",
        title: "Saved as you write",
        description:
          "Autosave and a local recovery copy protect unfinished work.",
      },
      {
        number: "03",
        title: "AI stays in its place",
        description:
          "It only sees the passage you select, when you ask for help.",
      },
    ],
    aiLabel: "Selected-text AI",
    aiTitle: "Ask for a better sentence. Keep the final say.",
    aiDescription:
      "Select the exact passage that needs help, compare the rewrite with your original, and replace it only when it still sounds like you.",
    aiPrivacy: "Only the selected text is sent to AI.",
    focusLabel: "Focus Mode",
    focusTitle: "Give the sentence the whole room.",
    focusDescription:
      "Fade the surrounding interface when you want one clear page and fewer reasons to look away.",
    autosaveLabel: "Autosave & recovery",
    autosaveTitle: "Keep writing. Saving stays quiet.",
    autosaveDescription:
      "Every change is saved, with a recent local recovery copy ready when the connection is not.",
    exportLabel: "Export",
    exportTitle: "Take the finished draft with you.",
    exportDescription:
      "Move from writing to sharing with TXT, Markdown, and Word exports.",
    closingLabel: "One clear page. One thought at a time.",
    closingTitle: "Your next sentence deserves a quieter place.",
    closingDescription:
      "Open a private draft, let Writely handle the saving, and stay with the work in front of you.",
    startWriting: "Start writing",
    desktopBeta: "Writely · Desktop beta",
    privacy: "Privacy",
    settings: "Settings & Help",
  },
  demo: {
    bold: "Bold",
    italic: "Italic",
    list: "List",
    writingLabel: "Writing space",
    previewTitle: "A quieter place to think",
    previewParagraph:
      "Some thoughts arrive softly. Writely gives them room before the rest of the interface asks for attention.",
    previewList: [
      "Let the interface grow quiet around the words.",
      "Begin with the thought.",
      "Shape the language at your own pace.",
    ],
    formattingLabel: "Formatting demo",
    aiOriginalLabel: "Original",
    aiOriginal:
      "The meeting was long and there were many different things that we discussed together.",
    aiImprovedLabel: "Improved · {action}",
    aiActions: {
      improveClarity: "Improve clarity",
      makeConcise: "Make more concise",
      improveFlow: "Improve flow",
    },
    aiResults: {
      improveClarity:
        "We discussed several decisions during the long meeting and clarified the next steps.",
      improveClarityExplanation:
        "Vague wording clarified · next steps made explicit",
      makeConcise: "The meeting ran long as we worked through several topics.",
      makeConciseExplanation: "Repetition removed · meaning preserved",
      improveFlow:
        "The meeting ran long, but together we worked through each topic in turn.",
      improveFlowExplanation: "Ideas connected · rhythm smoothed",
    },
    focusPreviewLabel: "Read-only Writely document preview",
    focusTitle: "A quieter page",
    focusBody:
      "The best sentence often arrives after the interface gets out of the way.",
    enterFocus: "Enter Focus Mode",
    exitFocus: "Exit Focus Mode",
    autosaveInputLabel: "Autosave demo writing",
    autosavePlaceholder: "Type a line…",
    localDraft: "Local draft",
    saving: "Saving…",
    saved: "Saved",
    recoveryKept: "Recovery copy kept",
    tryFailedSave: "Try a failed save",
    keepRecovery: "Keep recovery copy",
    exportTitle: "Project brief",
    exportParagraph: "The draft is ready to share.",
    exportStrong: "Key ideas",
    exportMiddle: "stay clear;",
    exportEmphasis: "your voice",
    exportAfter: "remains.",
    downloadStarted: "{format} download started",
    exportFailed: "{format} export failed. Please try again.",
  },
  privacy: {
    title: "Privacy, in plain language",
    intro:
      "Writely collects only the information needed to provide and protect your writing workspace.",
    storesTitle: "What Writely stores",
    storesAccount:
      "When you sign in with Google, Writely receives basic account information such as your name, email address, and profile image.",
    storesDocuments:
      "Writely also stores your document titles, writing, formatting, editor settings, and save information so your documents can be opened, edited, and recovered.",
    storesUsage:
      "We may store your AI usage total and any feedback you choose to submit.",
    aiTitle: "How AI works",
    aiSelected: "Writely AI works only on text you select.",
    aiProvider:
      "When you choose an AI action, the selected text and instruction are sent to Groq to generate a response. The rest of your document is not included in that request.",
    aiRetention:
      "Writely does not save the selected text, instruction, or AI response in its own database after the request is completed. Groq may process or temporarily retain request data according to its own policies and the data settings used by Writely.",
    recoveryTitle: "Recovery copies",
    recoveryDescription:
      "Writely may keep a recent unsaved copy of your writing in your browser. This helps recover your work after a refresh, closed tab, connection problem, or failed save.",
    recoveryRemoval:
      "You can remove this local recovery data by clearing your browser storage.",
    providersTitle: "Service providers",
    providersIntro:
      "Writely uses third-party services to operate the product, including:",
    providers: [
      "Google for sign-in",
      "Groq for AI processing",
      "Hosting and database providers for storing and delivering the service",
    ],
    providersRole:
      "These services may process the information needed to perform their role.",
    choicesTitle: "Your choices",
    choicesDescription:
      "You may request access to, correction of, or deletion of your personal information and Writely account.",
    contact: "Privacy contact: code.dreamer666@gmail.com",
    betaTitle: "Beta notice",
    betaDescription:
      "Writely is currently in beta. This notice may be updated when the product or its data practices change.",
    updated: "Last updated: 24 July 2026",
  },
};

export type PublicCopy = typeof english;

const chinese: PublicCopy = {
  landing: {
    homeLabel: "Writely 主页",
    privateSpace: "你的私人写作空间",
    heroStart: "给想法留出",
    heroAccent: "空间",
    heroDescription:
      "Writely 让页面保持安静，保存每一次更改，并且只在你选择文字时引入 AI。",
    heroAction: "开始私人草稿",
    principles: [
      {
        number: "01",
        title: "默认安静",
        description: "干净的页面，让下一句话始终在眼前。",
      },
      {
        number: "02",
        title: "边写边保存",
        description: "自动保存和本地恢复副本可保护未完成的内容。",
      },
      {
        number: "03",
        title: "AI 保持适当位置",
        description: "只有在你请求帮助时，它才会看到你选择的段落。",
      },
    ],
    aiLabel: "选中文字 AI",
    aiTitle: "请它改好一句话，最终决定仍由你作出。",
    aiDescription:
      "准确选择需要帮助的段落，将改写与原文比较，只有当它仍然像你的表达时才进行替换。",
    aiPrivacy: "只向 AI 发送选中的文字。",
    focusLabel: "专注模式",
    focusTitle: "把整个空间留给这句话。",
    focusDescription: "需要一页清晰内容、减少干扰时，让周围的界面淡出。",
    autosaveLabel: "自动保存与恢复",
    autosaveTitle: "继续写作，保存保持安静。",
    autosaveDescription:
      "每次更改都会保存；网络不可用时，最近的本地恢复副本随时可用。",
    exportLabel: "导出",
    exportTitle: "带走完成的草稿。",
    exportDescription: "通过 TXT、Markdown 和 Word 导出，从写作走向分享。",
    closingLabel: "一个清晰页面，一次专注一个想法。",
    closingTitle: "你的下一句话值得一个更安静的地方。",
    closingDescription: "打开私人草稿，让 Writely 处理保存，专注于眼前的写作。",
    startWriting: "开始写作",
    desktopBeta: "Writely · 桌面测试版",
    privacy: "隐私",
    settings: "设置与帮助",
  },
  demo: {
    bold: "粗体",
    italic: "斜体",
    list: "列表",
    writingLabel: "写作空间",
    previewTitle: "更安静的思考空间",
    previewParagraph:
      "有些想法轻轻到来。Writely 在界面其他部分吸引注意之前，为它们留出空间。",
    previewList: [
      "让文字周围的界面安静下来。",
      "从想法开始。",
      "按自己的节奏打磨语言。",
    ],
    formattingLabel: "格式演示",
    aiOriginalLabel: "原文",
    aiOriginal: "会议持续了很久，我们一起讨论了许多不同的事情。",
    aiImprovedLabel: "改进 · {action}",
    aiActions: {
      improveClarity: "提升清晰度",
      makeConcise: "更加简洁",
      improveFlow: "改善流畅度",
    },
    aiResults: {
      improveClarity: "我们在长时间的会议中讨论了几个决定，并明确了后续步骤。",
      improveClarityExplanation: "模糊措辞已澄清 · 后续步骤更明确",
      makeConcise: "会议持续较久，我们处理了几个议题。",
      makeConciseExplanation: "删除重复 · 保留原意",
      improveFlow: "会议持续较久，但我们一起逐一处理了每个议题。",
      improveFlowExplanation: "想法连接更自然 · 节奏更流畅",
    },
    focusPreviewLabel: "只读 Writely 文档预览",
    focusTitle: "更安静的页面",
    focusBody: "最好的句子，往往在界面退到一旁后出现。",
    enterFocus: "进入专注模式",
    exitFocus: "退出专注模式",
    autosaveInputLabel: "自动保存演示文字",
    autosavePlaceholder: "输入一行…",
    localDraft: "本地草稿",
    saving: "保存中…",
    saved: "已保存",
    recoveryKept: "已保留恢复副本",
    tryFailedSave: "尝试保存失败",
    keepRecovery: "保留恢复副本",
    exportTitle: "项目简报",
    exportParagraph: "草稿已准备好分享。",
    exportStrong: "关键想法",
    exportMiddle: "保持清晰；",
    exportEmphasis: "你的表达",
    exportAfter: "仍然保留。",
    downloadStarted: "{format} 下载已开始",
    exportFailed: "{format} 导出失败，请重试。",
  },
  privacy: {
    title: "简明隐私说明",
    intro: "Writely 只收集提供和保护写作空间所需的信息。",
    storesTitle: "Writely 存储的内容",
    storesAccount:
      "当你使用 Google 登录时，Writely 会收到姓名、电子邮件地址和头像等基本账户信息。",
    storesDocuments:
      "Writely 还会存储文档标题、正文、格式、编辑器设置和保存信息，以便打开、编辑和恢复文档。",
    storesUsage: "我们可能会存储你的 AI 使用总量以及你选择提交的反馈。",
    aiTitle: "AI 如何运作",
    aiSelected: "Writely AI 只处理你选择的文字。",
    aiProvider:
      "选择 AI 操作时，选中的文字和指示会发送给 Groq 以生成回答。文档其余内容不会包含在该请求中。",
    aiRetention:
      "请求完成后，Writely 不会在自己的数据库中保存选中文字、指示或 AI 回答。Groq 可能会根据其政策及 Writely 使用的数据设置处理或暂时保留请求数据。",
    recoveryTitle: "恢复副本",
    recoveryDescription:
      "Writely 可能会在浏览器中保留最近未保存的写作副本，以便在刷新、关闭标签页、网络问题或保存失败后恢复内容。",
    recoveryRemoval: "清除浏览器存储即可移除这些本地恢复数据。",
    providersTitle: "服务提供商",
    providersIntro: "Writely 使用第三方服务来运行产品，包括：",
    providers: [
      "Google，用于登录",
      "Groq，用于 AI 处理",
      "托管和数据库提供商，用于存储和交付服务",
    ],
    providersRole: "这些服务可能会处理履行其职责所需的信息。",
    choicesTitle: "你的选择",
    choicesDescription: "你可以请求访问、更正或删除个人信息及 Writely 账户。",
    contact: "隐私联系邮箱：code.dreamer666@gmail.com",
    betaTitle: "测试版说明",
    betaDescription:
      "Writely 目前处于测试阶段。当产品或数据处理方式改变时，本说明可能会更新。",
    updated: "最后更新：2026 年 7 月 24 日",
  },
};

const malay: PublicCopy = {
  landing: {
    homeLabel: "Laman utama Writely",
    privateSpace: "Ruang penulisan peribadi anda",
    heroStart: "Beri idea",
    heroAccent: "ruang",
    heroDescription:
      "Writely memastikan halaman tenang, menyimpan setiap perubahan dan menggunakan AI hanya untuk perkataan yang anda pilih.",
    heroAction: "Mulakan draf peribadi",
    principles: [
      {
        number: "01",
        title: "Tenang secara lalai",
        description: "Halaman bersih yang memastikan ayat seterusnya jelas.",
      },
      {
        number: "02",
        title: "Disimpan sambil menulis",
        description:
          "Simpan automatik dan salinan pemulihan setempat melindungi kerja yang belum selesai.",
      },
      {
        number: "03",
        title: "AI kekal pada tempatnya",
        description:
          "AI hanya melihat petikan yang anda pilih apabila anda meminta bantuan.",
      },
    ],
    aiLabel: "AI untuk teks terpilih",
    aiTitle: "Minta ayat yang lebih baik. Keputusan akhir tetap milik anda.",
    aiDescription:
      "Pilih petikan tepat yang memerlukan bantuan, bandingkan penulisan semula dengan teks asal dan gantikannya hanya apabila ia masih kedengaran seperti anda.",
    aiPrivacy: "Hanya teks yang dipilih dihantar kepada AI.",
    focusLabel: "Mod Fokus",
    focusTitle: "Berikan seluruh ruang kepada ayat itu.",
    focusDescription:
      "Kaburkan antara muka sekeliling apabila anda mahukan satu halaman yang jelas dan kurang gangguan.",
    autosaveLabel: "Simpan automatik & pemulihan",
    autosaveTitle: "Teruskan menulis. Simpanan kekal senyap.",
    autosaveDescription:
      "Setiap perubahan disimpan, dengan salinan pemulihan setempat terkini sedia apabila sambungan tiada.",
    exportLabel: "Eksport",
    exportTitle: "Bawa draf yang siap bersama anda.",
    exportDescription:
      "Beralih daripada menulis kepada berkongsi dengan eksport TXT, Markdown dan Word.",
    closingLabel: "Satu halaman yang jelas. Satu fikiran pada satu masa.",
    closingTitle: "Ayat seterusnya layak mendapat tempat yang lebih tenang.",
    closingDescription:
      "Buka draf peribadi, biarkan Writely mengurus simpanan dan kekal bersama kerja di hadapan anda.",
    startWriting: "Mula menulis",
    desktopBeta: "Writely · Beta desktop",
    privacy: "Privasi",
    settings: "Tetapan & Bantuan",
  },
  demo: {
    bold: "Tebal",
    italic: "Condong",
    list: "Senarai",
    writingLabel: "Ruang penulisan",
    previewTitle: "Tempat lebih tenang untuk berfikir",
    previewParagraph:
      "Sesetengah fikiran hadir perlahan. Writely memberinya ruang sebelum bahagian lain antara muka meminta perhatian.",
    previewList: [
      "Biarkan antara muka menjadi tenang di sekeliling perkataan.",
      "Mulakan dengan fikiran.",
      "Bentuk bahasa mengikut rentak anda.",
    ],
    formattingLabel: "Demo pemformatan",
    aiOriginalLabel: "Asal",
    aiOriginal:
      "Mesyuarat itu panjang dan terdapat banyak perkara berbeza yang kami bincangkan bersama.",
    aiImprovedLabel: "Ditambah baik · {action}",
    aiActions: {
      improveClarity: "Perjelas",
      makeConcise: "Ringkaskan",
      improveFlow: "Baiki aliran",
    },
    aiResults: {
      improveClarity:
        "Kami membincangkan beberapa keputusan dalam mesyuarat yang panjang dan menjelaskan langkah seterusnya.",
      improveClarityExplanation:
        "Perkataan kabur diperjelas · langkah seterusnya dinyatakan",
      makeConcise:
        "Mesyuarat berlanjutan semasa kami menyelesaikan beberapa perkara.",
      makeConciseExplanation: "Pengulangan dibuang · maksud dikekalkan",
      improveFlow:
        "Mesyuarat berlanjutan, tetapi kami bersama-sama menyelesaikan setiap perkara secara teratur.",
      improveFlowExplanation: "Idea dihubungkan · rentak dilancarkan",
    },
    focusPreviewLabel: "Pratonton dokumen Writely baca sahaja",
    focusTitle: "Halaman yang lebih tenang",
    focusBody:
      "Ayat terbaik sering tiba selepas antara muka tidak lagi mengganggu.",
    enterFocus: "Masuk Mod Fokus",
    exitFocus: "Keluar Mod Fokus",
    autosaveInputLabel: "Tulisan demo simpan automatik",
    autosavePlaceholder: "Taip satu baris…",
    localDraft: "Draf setempat",
    saving: "Menyimpan…",
    saved: "Disimpan",
    recoveryKept: "Salinan pemulihan dikekalkan",
    tryFailedSave: "Cuba simpanan gagal",
    keepRecovery: "Kekalkan salinan pemulihan",
    exportTitle: "Ringkasan projek",
    exportParagraph: "Draf sedia untuk dikongsi.",
    exportStrong: "Idea utama",
    exportMiddle: "kekal jelas;",
    exportEmphasis: "gaya anda",
    exportAfter: "dikekalkan.",
    downloadStarted: "Muat turun {format} bermula",
    exportFailed: "Eksport {format} gagal. Sila cuba lagi.",
  },
  privacy: {
    title: "Privasi, dalam bahasa mudah",
    intro:
      "Writely hanya mengumpul maklumat yang diperlukan untuk menyediakan dan melindungi ruang penulisan anda.",
    storesTitle: "Apa yang disimpan oleh Writely",
    storesAccount:
      "Apabila anda log masuk dengan Google, Writely menerima maklumat akaun asas seperti nama, alamat e-mel dan imej profil anda.",
    storesDocuments:
      "Writely turut menyimpan tajuk dokumen, tulisan, pemformatan, tetapan editor dan maklumat simpanan supaya dokumen boleh dibuka, diedit dan dipulihkan.",
    storesUsage:
      "Kami mungkin menyimpan jumlah penggunaan AI dan sebarang maklum balas yang anda pilih untuk dihantar.",
    aiTitle: "Cara AI berfungsi",
    aiSelected: "Writely AI hanya berfungsi pada teks yang anda pilih.",
    aiProvider:
      "Apabila anda memilih tindakan AI, teks pilihan dan arahan dihantar kepada Groq untuk menjana jawapan. Bahagian lain dokumen anda tidak disertakan dalam permintaan itu.",
    aiRetention:
      "Writely tidak menyimpan teks pilihan, arahan atau jawapan AI dalam pangkalan datanya selepas permintaan selesai. Groq mungkin memproses atau menyimpan sementara data permintaan mengikut dasar dan tetapan data yang digunakan oleh Writely.",
    recoveryTitle: "Salinan pemulihan",
    recoveryDescription:
      "Writely mungkin menyimpan salinan terkini tulisan yang belum disimpan dalam pelayar anda. Ini membantu memulihkan kerja selepas muat semula, tab tertutup, masalah sambungan atau simpanan gagal.",
    recoveryRemoval:
      "Anda boleh membuang data pemulihan setempat ini dengan mengosongkan storan pelayar.",
    providersTitle: "Penyedia perkhidmatan",
    providersIntro:
      "Writely menggunakan perkhidmatan pihak ketiga untuk mengendalikan produk, termasuk:",
    providers: [
      "Google untuk log masuk",
      "Groq untuk pemprosesan AI",
      "Penyedia pengehosan dan pangkalan data untuk menyimpan dan menyampaikan perkhidmatan",
    ],
    providersRole:
      "Perkhidmatan ini mungkin memproses maklumat yang diperlukan untuk melaksanakan peranannya.",
    choicesTitle: "Pilihan anda",
    choicesDescription:
      "Anda boleh meminta akses, pembetulan atau pemadaman maklumat peribadi dan akaun Writely anda.",
    contact: "Hubungan privasi: code.dreamer666@gmail.com",
    betaTitle: "Notis beta",
    betaDescription:
      "Writely kini dalam versi beta. Notis ini mungkin dikemas kini apabila produk atau amalan datanya berubah.",
    updated: "Kemas kini terakhir: 24 Julai 2026",
  },
};

const tamil: PublicCopy = {
  landing: {
    homeLabel: "Writely முகப்பு",
    privateSpace: "உங்கள் தனிப்பட்ட எழுத்து இடம்",
    heroStart: "சிந்தனைகளுக்கு",
    heroAccent: "இடம் கொடுங்கள்",
    heroDescription:
      "Writely பக்கத்தை அமைதியாக வைத்துக் கொண்டு, ஒவ்வொரு மாற்றத்தையும் சேமித்து, நீங்கள் தேர்ந்தெடுக்கும் சொற்களுக்கு மட்டும் AI உதவியை வழங்குகிறது.",
    heroAction: "தனிப்பட்ட வரைவைத் தொடங்கு",
    principles: [
      {
        number: "01",
        title: "இயல்பாகவே அமைதி",
        description: "அடுத்த வாக்கியத்தை முன் நிறுத்தும் தூய பக்கம்.",
      },
      {
        number: "02",
        title: "எழுதும்போதே சேமிப்பு",
        description:
          "தானியங்குச் சேமிப்பும் உள்ளூர் மீட்பு நகலும் முடியாத வேலையைப் பாதுகாக்கும்.",
      },
      {
        number: "03",
        title: "AI அதன் இடத்தில்",
        description:
          "நீங்கள் உதவி கேட்கும்போது தேர்ந்தெடுத்த பகுதியை மட்டும் அது பார்க்கும்.",
      },
    ],
    aiLabel: "தேர்ந்தெடுத்த உரைக்கான AI",
    aiTitle: "சிறந்த வாக்கியத்தைக் கேளுங்கள். இறுதி முடிவை நீங்களே எடுங்கள்.",
    aiDescription:
      "உதவி தேவைப்படும் சரியான பகுதியைத் தேர்ந்தெடுத்து, மீண்டும் எழுதப்பட்டதை அசலுடன் ஒப்பிட்டு, அது இன்னும் உங்கள் குரலாக இருந்தால் மட்டும் மாற்றவும்.",
    aiPrivacy: "தேர்ந்தெடுத்த உரை மட்டும் AI-க்கு அனுப்பப்படும்.",
    focusLabel: "கவன முறை",
    focusTitle: "வாக்கியத்திற்கு முழு இடத்தையும் கொடுங்கள்.",
    focusDescription:
      "ஒரு தெளிவான பக்கமும் குறைந்த கவனச்சிதறலும் தேவைப்படும்போது சுற்றியுள்ள இடைமுகத்தை மங்கச் செய்யுங்கள்.",
    autosaveLabel: "தானியங்குச் சேமிப்பு & மீட்பு",
    autosaveTitle: "தொடர்ந்து எழுதுங்கள். சேமிப்பு அமைதியாக நடக்கும்.",
    autosaveDescription:
      "ஒவ்வொரு மாற்றமும் சேமிக்கப்படும்; இணைப்பு இல்லாதபோது சமீபத்திய உள்ளூர் மீட்பு நகல் தயாராக இருக்கும்.",
    exportLabel: "ஏற்றுமதி",
    exportTitle: "முடித்த வரைவை உங்களுடன் எடுத்துச் செல்லுங்கள்.",
    exportDescription:
      "TXT, Markdown மற்றும் Word ஏற்றுமதிகளுடன் எழுத்திலிருந்து பகிர்விற்குச் செல்லுங்கள்.",
    closingLabel: "ஒரு தெளிவான பக்கம். ஒரு நேரத்தில் ஒரு சிந்தனை.",
    closingTitle: "உங்கள் அடுத்த வாக்கியத்திற்கு அமைதியான இடம் தேவை.",
    closingDescription:
      "தனிப்பட்ட வரைவைத் திறந்து, சேமிப்பை Writely கவனிக்கட்டும்; முன் உள்ள வேலையில் தொடர்ந்து இருங்கள்.",
    startWriting: "எழுதத் தொடங்கு",
    desktopBeta: "Writely · மேசைக்கணினி பீட்டா",
    privacy: "தனியுரிமை",
    settings: "அமைப்புகள் & உதவி",
  },
  demo: {
    bold: "தடித்த",
    italic: "சாய்வு",
    list: "பட்டியல்",
    writingLabel: "எழுத்து இடம்",
    previewTitle: "சிந்திக்க அமைதியான இடம்",
    previewParagraph:
      "சில சிந்தனைகள் மெதுவாக வருகின்றன. இடைமுகத்தின் மற்ற பகுதிகள் கவனம் கேட்பதற்கு முன் Writely அவற்றுக்கு இடம் கொடுக்கிறது.",
    previewList: [
      "சொற்களைச் சுற்றியுள்ள இடைமுகத்தை அமைதியாக்குங்கள்.",
      "சிந்தனையுடன் தொடங்குங்கள்.",
      "உங்கள் வேகத்தில் மொழியை வடிவமைக்கவும்.",
    ],
    formattingLabel: "வடிவமைப்பு விளக்கம்",
    aiOriginalLabel: "அசல்",
    aiOriginal:
      "கூட்டம் நீண்டது, அதில் பல்வேறு விஷயங்களை நாங்கள் ஒன்றாக விவாதித்தோம்.",
    aiImprovedLabel: "மேம்படுத்தப்பட்டது · {action}",
    aiActions: {
      improveClarity: "தெளிவை மேம்படுத்து",
      makeConcise: "சுருக்கமாக்கு",
      improveFlow: "ஓட்டத்தை மேம்படுத்து",
    },
    aiResults: {
      improveClarity:
        "நீண்ட கூட்டத்தில் பல முடிவுகளை விவாதித்து அடுத்த படிகளைத் தெளிவுபடுத்தினோம்.",
      improveClarityExplanation:
        "தெளிவற்ற சொற்கள் சரிசெய்யப்பட்டன · அடுத்த படிகள் வெளிப்படுத்தப்பட்டன",
      makeConcise: "பல தலைப்புகளைத் தீர்க்கும்போது கூட்டம் நீண்டது.",
      makeConciseExplanation:
        "மீளுரைகள் நீக்கப்பட்டன · பொருள் தக்கவைக்கப்பட்டது",
      improveFlow:
        "கூட்டம் நீண்டது, ஆனால் ஒவ்வொரு தலைப்பையும் ஒன்றாக வரிசையாகத் தீர்த்தோம்.",
      improveFlowExplanation:
        "கருத்துகள் இணைக்கப்பட்டன · ஓட்டம் மென்மையாக்கப்பட்டது",
    },
    focusPreviewLabel: "படிக்க மட்டும் Writely ஆவண முன்னோட்டம்",
    focusTitle: "அமைதியான பக்கம்",
    focusBody: "இடைமுகம் வழிவிடும்போது சிறந்த வாக்கியம் பெரும்பாலும் வருகிறது.",
    enterFocus: "கவன முறையில் நுழை",
    exitFocus: "கவன முறையிலிருந்து வெளியேறு",
    autosaveInputLabel: "தானியங்குச் சேமிப்பு விளக்க எழுத்து",
    autosavePlaceholder: "ஒரு வரியைத் தட்டச்சு செய்யுங்கள்…",
    localDraft: "உள்ளூர் வரைவு",
    saving: "சேமிக்கிறது…",
    saved: "சேமிக்கப்பட்டது",
    recoveryKept: "மீட்பு நகல் வைக்கப்பட்டது",
    tryFailedSave: "தோல்வியடைந்த சேமிப்பை முயற்சி",
    keepRecovery: "மீட்பு நகலை வைத்திரு",
    exportTitle: "திட்டச் சுருக்கம்",
    exportParagraph: "வரைவு பகிரத் தயாராக உள்ளது.",
    exportStrong: "முக்கிய கருத்துகள்",
    exportMiddle: "தெளிவாக இருக்கும்;",
    exportEmphasis: "உங்கள் குரல்",
    exportAfter: "தொடரும்.",
    downloadStarted: "{format} பதிவிறக்கம் தொடங்கியது",
    exportFailed: "{format} ஏற்றுமதி தோல்வியடைந்தது. மீண்டும் முயற்சிக்கவும்.",
  },
  privacy: {
    title: "எளிய மொழியில் தனியுரிமை",
    intro:
      "உங்கள் எழுத்துப் பணியிடத்தை வழங்கவும் பாதுகாக்கவும் தேவையான தகவலை மட்டும் Writely சேகரிக்கிறது.",
    storesTitle: "Writely சேமிப்பவை",
    storesAccount:
      "Google மூலம் உள்நுழையும்போது, உங்கள் பெயர், மின்னஞ்சல் முகவரி மற்றும் சுயவிவரப் படம் போன்ற அடிப்படை கணக்குத் தகவலை Writely பெறுகிறது.",
    storesDocuments:
      "உங்கள் ஆவணங்களைத் திறக்க, திருத்த மற்றும் மீட்டெடுக்க, ஆவணத் தலைப்புகள், எழுத்து, வடிவமைப்பு, எடிட்டர் அமைப்புகள் மற்றும் சேமிப்புத் தகவலையும் Writely சேமிக்கிறது.",
    storesUsage:
      "உங்கள் AI பயன்பாட்டு மொத்தத்தையும் நீங்கள் அனுப்பத் தேர்ந்தெடுக்கும் கருத்தையும் நாங்கள் சேமிக்கலாம்.",
    aiTitle: "AI எவ்வாறு செயல்படுகிறது",
    aiSelected:
      "நீங்கள் தேர்ந்தெடுக்கும் உரையில் மட்டுமே Writely AI செயல்படும்.",
    aiProvider:
      "AI செயலைத் தேர்ந்தெடுக்கும்போது, தேர்ந்தெடுத்த உரையும் வழிமுறையும் பதிலை உருவாக்க Groq-க்கு அனுப்பப்படும். உங்கள் ஆவணத்தின் மற்ற பகுதிகள் அந்தக் கோரிக்கையில் சேர்க்கப்படாது.",
    aiRetention:
      "கோரிக்கை முடிந்த பிறகு தேர்ந்தெடுத்த உரை, வழிமுறை அல்லது AI பதிலை Writely தனது தரவுத்தளத்தில் சேமிக்காது. Groq தனது கொள்கைகள் மற்றும் Writely பயன்படுத்தும் தரவு அமைப்புகளின்படி கோரிக்கைத் தரவைச் செயலாக்கலாம் அல்லது தற்காலிகமாக வைத்திருக்கலாம்.",
    recoveryTitle: "மீட்பு நகல்கள்",
    recoveryDescription:
      "உங்கள் சமீபத்திய சேமிக்காத எழுத்தின் நகலை Writely உலாவியில் வைத்திருக்கலாம். புதுப்பிப்பு, மூடிய தாவல், இணைப்புச் சிக்கல் அல்லது சேமிப்புத் தோல்விக்குப் பிறகு வேலையை மீட்க இது உதவும்.",
    recoveryRemoval:
      "உலாவிச் சேமிப்பகத்தை அழிப்பதன் மூலம் இந்த உள்ளூர் மீட்புத் தரவை நீக்கலாம்.",
    providersTitle: "சேவை வழங்குநர்கள்",
    providersIntro:
      "தயாரிப்பை இயக்க Writely மூன்றாம் தரப்பு சேவைகளைப் பயன்படுத்துகிறது, அவை:",
    providers: [
      "உள்நுழைவிற்கு Google",
      "AI செயலாக்கத்திற்கு Groq",
      "சேவையைச் சேமித்து வழங்க ஹோஸ்டிங் மற்றும் தரவுத்தள வழங்குநர்கள்",
    ],
    providersRole:
      "இந்தச் சேவைகள் தங்கள் பங்கை நிறைவேற்றத் தேவையான தகவலைச் செயலாக்கலாம்.",
    choicesTitle: "உங்கள் தேர்வுகள்",
    choicesDescription:
      "உங்கள் தனிப்பட்ட தகவல் மற்றும் Writely கணக்கை அணுக, திருத்த அல்லது நீக்கக் கோரலாம்.",
    contact: "தனியுரிமை தொடர்பு: code.dreamer666@gmail.com",
    betaTitle: "பீட்டா அறிவிப்பு",
    betaDescription:
      "Writely தற்போது பீட்டாவில் உள்ளது. தயாரிப்பு அல்லது அதன் தரவு நடைமுறைகள் மாறும்போது இந்த அறிவிப்பு புதுப்பிக்கப்படலாம்.",
    updated: "கடைசியாகப் புதுப்பிக்கப்பட்டது: 24 ஜூலை 2026",
  },
};

export const PUBLIC_COPY: Record<InterfaceLanguage, PublicCopy> = {
  English: english,
  Chinese: chinese,
  Malay: malay,
  Tamil: tamil,
};
