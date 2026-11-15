(() => {
  "use strict";

  document.documentElement.classList.remove("no-js");

  const search = document.getElementById("menu-search");
  const clearSearch = document.getElementById("clear-search");
  const resetSearch = document.getElementById("reset-search");
  const searchSummary = document.getElementById("search-summary");
  const menuContent = document.getElementById("menu-content");
  const menuSections = document.getElementById("menu-sections");
  const menuStatus = document.getElementById("menu-status");
  const stateEyebrow = document.getElementById("state-eyebrow");
  const stateTitle = document.getElementById("state-title");
  const stateCopy = document.getElementById("state-copy");
  const retryMenu = document.getElementById("retry-menu");
  const sidebar = document.getElementById("category-sidebar");
  const navigation = document.getElementById("category-nav");
  const layout = document.querySelector(".menu-layout");
  const languageSwitcher = document.getElementById("language-switcher");
  const languageStorageKey = "desfolhada-language";
  const languageFiles = { es: "./menu-es.json", fr: "./menu-fr.json", en: "./menu-en.json" };
  const interfaces = {
    pt: {
      locale: "pt-PT",
      menuLabel: "Ementa",
      languageLabel: "Idioma da ementa",
      skipLink: "Saltar para a ementa",
      caption: "A ementa, com calma.",
      eyebrow: "À mesa",
      heroFirst: "O que lhe",
      heroSecond: "apetece hoje?",
      introFirst: "Escolha com tempo.",
      introSecond: "A ementa está mesmo aqui.",
      searchLabel: "Pesquisar na ementa",
      searchPlaceholder: "O que procura?",
      clearSearch: "Limpar pesquisa",
      filterLabel: "Filtrar por categoria",
      retry: "Tentar novamente",
      reset: "Ver toda a ementa",
      optionsLabel: "Ver opções",
      allCategories: "Todos",
      categoryEmpty: "Não há artigos disponíveis nesta categoria.",
      priceMissing: "Preço não indicado",
      yes: "Sim",
      no: "Não",
      snapshotLabel: "Ementa atualizada em: ",
      loadingSummary: "A carregar a ementa…",
      unavailableSummary: "Ementa indisponível de momento.",
      homeLabel: (name) => `${name} — início da ementa`,
      description: (name) => `Uma forma simples de consultar a ementa de ${name}.`,
      inScope: (count, scope) => `${count} em ${scope}`,
      noResults: (query, category) => `Não há resultados para “${query}”${category ? ` em ${category}` : ""}. Experimente outra palavra ou escolha outra categoria.`,
      noItems: (category) => `Não há artigos disponíveis${category ? ` em ${category}` : ""}. Escolha outra categoria ou volte à ementa completa.`,
      counts: { item: ["artigo", "artigos"], result: ["resultado", "resultados"], category: ["categoria", "categorias"] },
      details: {
        description: "Descrição", name: "Nome", price: "Preço", retailPrice: "PVP",
        basePrice: "Preço base", unitPrice: "Preço unitário", extraPrice: "Preço extra",
        options: "Opções", extras: "Complementos", minExtras: "Mínimo de complementos",
        maxExtras: "Máximo de complementos", menuOptions: "Opções do menu", required: "Obrigatório",
        products: "Produtos", maxOptions: "Máximo de opções", minOptions: "Mínimo de opções", quantity: "Quantidade"
      },
      states: {
        loading: { eyebrow: "Só um momento", title: "A preparar a ementa.", copy: "Estamos a carregar os artigos e os preços." },
        empty: { eyebrow: "Por agora", title: "Ainda não há artigos para mostrar.", copy: "A ementa não tem artigos disponíveis neste momento. Volte a consultar mais tarde." },
        noResults: { eyebrow: "Vamos tentar de outra forma", title: "Não encontrámos o que procura." },
        missing: { eyebrow: "Ainda não está à mesa", title: "A ementa ainda não está disponível.", copy: "Ainda não conseguimos apresentar a ementa deste espaço. Pode tentar novamente mais tarde." },
        data: { eyebrow: "Não foi possível abrir a ementa", title: "Os dados da ementa não puderam ser lidos.", copy: "O ficheiro da ementa não está num formato que possamos apresentar. Tente novamente mais tarde." },
        network: { eyebrow: "Uma pequena interrupção", title: "Não foi possível carregar a ementa.", copy: "Pode haver uma falha de ligação ou no serviço. Tente novamente daqui a pouco." }
      }
    },
    es: {
      locale: "es-ES",
      menuLabel: "Carta",
      languageLabel: "Idioma de la carta",
      skipLink: "Ir a la carta",
      caption: "La carta, sin prisas.",
      eyebrow: "A la mesa",
      heroFirst: "¿Qué le",
      heroSecond: "apetece hoy?",
      introFirst: "Elija sin prisas.",
      introSecond: "La carta está aquí.",
      searchLabel: "Buscar en la carta",
      searchPlaceholder: "¿Qué busca?",
      clearSearch: "Borrar búsqueda",
      filterLabel: "Filtrar por categoría",
      retry: "Volver a intentarlo",
      reset: "Ver toda la carta",
      optionsLabel: "Ver opciones",
      allCategories: "Todos",
      categoryEmpty: "No hay productos disponibles en esta categoría.",
      priceMissing: "Precio no indicado",
      yes: "Sí",
      no: "No",
      snapshotLabel: "Carta actualizada el: ",
      loadingSummary: "Cargando la carta…",
      unavailableSummary: "La carta no está disponible en este momento.",
      homeLabel: (name) => `${name} — inicio de la carta`,
      description: (name) => `Una forma sencilla de consultar la carta de ${name}.`,
      inScope: (count, scope) => `${count} en ${scope}`,
      noResults: (query, category) => `No hay resultados para «${query}»${category ? ` en ${category}` : ""}. Pruebe otra palabra o elija otra categoría.`,
      noItems: (category) => `No hay productos disponibles${category ? ` en ${category}` : ""}. Elija otra categoría o vuelva a la carta completa.`,
      counts: { item: ["producto", "productos"], result: ["resultado", "resultados"], category: ["categoría", "categorías"] },
      details: {
        description: "Descripción", name: "Nombre", price: "Precio", retailPrice: "PVP",
        basePrice: "Precio base", unitPrice: "Precio unitario", extraPrice: "Suplemento",
        options: "Opciones", extras: "Complementos", minExtras: "Mínimo de complementos",
        maxExtras: "Máximo de complementos", menuOptions: "Opciones del menú", required: "Obligatorio",
        products: "Productos", maxOptions: "Máximo de opciones", minOptions: "Mínimo de opciones", quantity: "Cantidad"
      },
      states: {
        loading: { eyebrow: "Un momento", title: "Preparando la carta.", copy: "Estamos cargando los productos y los precios." },
        empty: { eyebrow: "Por ahora", title: "Todavía no hay productos que mostrar.", copy: "La carta no tiene productos disponibles en este momento. Vuelva a consultarla más tarde." },
        noResults: { eyebrow: "Probemos de otra forma", title: "No hemos encontrado lo que busca." },
        missing: { eyebrow: "Aún no está en la mesa", title: "La carta aún no está disponible.", copy: "Todavía no podemos mostrar la carta de este establecimiento. Puede volver a intentarlo más tarde." },
        data: { eyebrow: "No se ha podido abrir la carta", title: "No se han podido leer los datos de la carta.", copy: "El archivo de la carta no tiene un formato que podamos mostrar. Vuelva a intentarlo más tarde." },
        network: { eyebrow: "Una pequeña interrupción", title: "No se ha podido cargar la carta.", copy: "Puede haber un problema de conexión o del servicio. Vuelva a intentarlo dentro de unos instantes." }
      }
    },
    fr: {
      locale: "fr-FR",
      menuLabel: "Carte",
      languageLabel: "Langue de la carte",
      skipLink: "Aller à la carte",
      caption: "La carte, en toute tranquillité.",
      eyebrow: "À table",
      heroFirst: "Quelles envies",
      heroSecond: "aujourd’hui ?",
      introFirst: "Prenez votre temps.",
      introSecond: "La carte est juste ici.",
      searchLabel: "Rechercher dans la carte",
      searchPlaceholder: "Que cherchez-vous ?",
      clearSearch: "Effacer la recherche",
      filterLabel: "Filtrer par catégorie",
      retry: "Réessayer",
      reset: "Voir toute la carte",
      optionsLabel: "Voir les options",
      allCategories: "Tous",
      categoryEmpty: "Aucun produit n’est disponible dans cette catégorie.",
      priceMissing: "Prix non indiqué",
      yes: "Oui",
      no: "Non",
      snapshotLabel: "Carte mise à jour le : ",
      loadingSummary: "Chargement de la carte…",
      unavailableSummary: "La carte est indisponible pour le moment.",
      homeLabel: (name) => `${name} — début de la carte`,
      description: (name) => `Une façon simple de consulter la carte de ${name}.`,
      inScope: (count, scope) => `${count} dans ${scope}`,
      noResults: (query, category) => `Aucun résultat pour « ${query} »${category ? ` dans ${category}` : ""}. Essayez un autre mot ou choisissez une autre catégorie.`,
      noItems: (category) => `Aucun produit n’est disponible${category ? ` dans ${category}` : ""}. Choisissez une autre catégorie ou revenez à la carte complète.`,
      counts: { item: ["produit", "produits"], result: ["résultat", "résultats"], category: ["catégorie", "catégories"] },
      details: {
        description: "Description", name: "Nom", price: "Prix", retailPrice: "Prix conseillé",
        basePrice: "Prix de base", unitPrice: "Prix unitaire", extraPrice: "Supplément",
        options: "Options", extras: "Suppléments", minExtras: "Nombre minimum de suppléments",
        maxExtras: "Nombre maximum de suppléments", menuOptions: "Options du menu", required: "Obligatoire",
        products: "Produits", maxOptions: "Nombre maximum d’options", minOptions: "Nombre minimum d’options", quantity: "Quantité"
      },
      states: {
        loading: { eyebrow: "Un instant", title: "Préparation de la carte.", copy: "Nous chargeons les produits et les prix." },
        empty: { eyebrow: "Pour le moment", title: "Il n’y a pas encore de produits à afficher.", copy: "La carte ne contient aucun produit disponible pour le moment. Revenez la consulter plus tard." },
        noResults: { eyebrow: "Essayons autrement", title: "Nous n’avons pas trouvé ce que vous cherchez." },
        missing: { eyebrow: "Pas encore à table", title: "La carte n’est pas encore disponible.", copy: "Nous ne pouvons pas encore afficher la carte de cet établissement. Vous pouvez réessayer plus tard." },
        data: { eyebrow: "Impossible d’ouvrir la carte", title: "Les données de la carte n’ont pas pu être lues.", copy: "Le fichier de la carte n’est pas dans un format que nous pouvons afficher. Réessayez plus tard." },
        network: { eyebrow: "Une petite interruption", title: "Impossible de charger la carte.", copy: "Il peut s’agir d’un problème de connexion ou de service. Réessayez dans quelques instants." }
      }
    },
    en: {
      locale: "en-GB",
      menuLabel: "Menu",
      languageLabel: "Menu language",
      skipLink: "Skip to the menu",
      caption: "The menu, at your leisure.",
      eyebrow: "At the table",
      heroFirst: "What takes",
      heroSecond: "your fancy today?",
      introFirst: "Take your time.",
      introSecond: "The menu is right here.",
      searchLabel: "Search the menu",
      searchPlaceholder: "What are you looking for?",
      clearSearch: "Clear search",
      filterLabel: "Filter by category",
      retry: "Try again",
      reset: "View the full menu",
      optionsLabel: "View options",
      allCategories: "All",
      categoryEmpty: "There are no items available in this category.",
      priceMissing: "Price not listed",
      yes: "Yes",
      no: "No",
      snapshotLabel: "Menu updated on: ",
      loadingSummary: "Loading the menu…",
      unavailableSummary: "The menu is currently unavailable.",
      homeLabel: (name) => `${name} — start of the menu`,
      description: (name) => `A simple way to browse the menu at ${name}.`,
      inScope: (count, scope) => `${count} in ${scope}`,
      noResults: (query, category) => `There are no results for “${query}”${category ? ` in ${category}` : ""}. Try another word or choose another category.`,
      noItems: (category) => `There are no items available${category ? ` in ${category}` : ""}. Choose another category or return to the full menu.`,
      counts: { item: ["item", "items"], result: ["result", "results"], category: ["category", "categories"] },
      details: {
        description: "Description", name: "Name", price: "Price", retailPrice: "RRP",
        basePrice: "Base price", unitPrice: "Unit price", extraPrice: "Extra charge",
        options: "Options", extras: "Extras", minExtras: "Minimum extras",
        maxExtras: "Maximum extras", menuOptions: "Menu options", required: "Required",
        products: "Products", maxOptions: "Maximum options", minOptions: "Minimum options", quantity: "Quantity"
      },
      states: {
        loading: { eyebrow: "Just a moment", title: "Preparing the menu.", copy: "We’re loading the items and prices." },
        empty: { eyebrow: "For now", title: "There are no items to show yet.", copy: "The menu has no items available at the moment. Please check again later." },
        noResults: { eyebrow: "Let’s try another way", title: "We couldn’t find what you’re looking for." },
        missing: { eyebrow: "Not at the table just yet", title: "The menu isn’t available yet.", copy: "We can’t display this venue’s menu just yet. Please try again later." },
        data: { eyebrow: "Unable to open the menu", title: "The menu data couldn’t be read.", copy: "The menu file isn’t in a format we can display. Please try again later." },
        network: { eyebrow: "A brief interruption", title: "The menu couldn’t be loaded.", copy: "There may be a connection or service problem. Please try again shortly." }
      }
    }
  };
  const blockTags = new Set(["P", "DIV", "LI", "UL", "OL", "H1", "H2", "H3", "H4", "H5", "H6", "SECTION", "ARTICLE", "BLOCKQUOTE", "TABLE", "TR"]);
  const priceKeys = new Set(["preco", "precovenda", "price", "pvp", "precounitario", "precoextra", "precobase"]);
  const primaryPriceKeys = new Set(["preco", "precovenda", "price", "pvp"]);
  const nameKeys = new Set(["nome", "name", "produto", "designacao", "nomeproduto", "productname", "titulo", "title"]);
  const descriptionKeys = new Set(["descricao", "description"]);
  const optionListKeys = new Set(["opcoes", "options", "products", "produtos"]);
  const customerDetailKeys = new Set([...nameKeys, ...descriptionKeys, ...priceKeys, "opcoes", "options", "complementares", "niveismenu", "products", "produtos", "mincomplementos", "maxcomplementos", "minopcoes", "maxopcoes", "obrigatorio", "required", "quantidade"]);
  const quantityDetailKeys = new Set(["mincomplementos", "maxcomplementos", "minopcoes", "maxopcoes", "quantidade"]);
  const detailLabels = new Map([
    ["descricao", "description"],
    ["description", "description"],
    ["nome", "name"],
    ["name", "name"],
    ["preco", "price"],
    ["precovenda", "price"],
    ["price", "price"],
    ["pvp", "retailPrice"],
    ["precobase", "basePrice"],
    ["precounitario", "unitPrice"],
    ["precoextra", "extraPrice"],
    ["opcoes", "options"],
    ["options", "options"],
    ["complementares", "extras"],
    ["mincomplementos", "minExtras"],
    ["maxcomplementos", "maxExtras"],
    ["niveismenu", "menuOptions"],
    ["obrigatorio", "required"],
    ["required", "required"],
    ["products", "products"],
    ["produtos", "products"],
    ["maxopcoes", "maxOptions"],
    ["minopcoes", "minOptions"],
    ["quantidade", "quantity"]
  ]);

  let sectionRecords = [];
  let categoryRecords = [];
  let itemRecords = [];
  let selectedCategory = null;
  let allCategoriesButton = null;
  let allCategoriesCount = null;
  let loading = false;
  let loaded = false;
  let menuData = null;
  let menuPacks = {};
  let searchIndex = new Map();
  let loadError = null;
  let language = "pt";
  try {
    const savedLanguage = localStorage.getItem(languageStorageKey);
    if (Object.hasOwn(interfaces, savedLanguage)) language = savedLanguage;
  } catch {}
  let ui = interfaces[language];
  let currency = new Intl.NumberFormat(ui.locale, { style: "currency", currency: "EUR" });
  let integers = new Intl.NumberFormat(ui.locale);

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function plainText(value) {
    if (value === null || value === undefined) return "";
    const source = String(value);
    let text = source;
    if (/[<&]/.test(source)) {
      const template = document.createElement("template");
      template.innerHTML = source;
      template.content.querySelectorAll("script, style, noscript, iframe, object, embed").forEach((node) => node.remove());
      const readNode = (node) => {
        if (node.nodeType === Node.TEXT_NODE) return node.textContent;
        if (node.nodeType !== Node.ELEMENT_NODE && node.nodeType !== Node.DOCUMENT_FRAGMENT_NODE) return "";
        if (node.nodeName === "BR") return "\n";
        if (node.nodeName === "IMG") return node.getAttribute("alt") || "";
        const content = Array.from(node.childNodes, readNode).join("");
        if (node.nodeName === "TD" || node.nodeName === "TH") return `${content} `;
        return blockTags.has(node.nodeName) ? `\n${content}\n` : content;
      };
      text = readNode(template.content);
    }
    return text.replace(/\r\n?/g, "\n").replace(/\u00a0/g, " ").replace(/[\t ]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
  }

  function normalize(value) {
    return String(value).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s+/g, " ").trim();
  }

  function fieldKey(key) {
    return normalize(key).replace(/[^a-z0-9]/g, "");
  }

  function fieldLabel(key) {
    const known = detailLabels.get(fieldKey(key));
    if (known) return ui.details[known];
    const text = plainText(key).replace(/([a-z])([A-Z])/g, "$1 $2").replace(/[_-]+/g, " ");
    return text.charAt(0).toLocaleUpperCase(ui.locale) + text.slice(1);
  }

  function formatPrice(value) {
    if (typeof value === "number" && Number.isFinite(value)) return currency.format(value);
    const text = plainText(value);
    const numeric = text.replace(/\s+/g, "").replace(/^(?:€|EUR)|(?:€|EUR)$/gi, "");
    if (/^[+-]?\d+(?:[.,]\d+)?$/.test(numeric)) {
      const amount = Number(numeric.replace(",", "."));
      if (Number.isFinite(amount)) return currency.format(amount);
    }
    return text || ui.priceMissing;
  }

  function countLabel(count, kind) {
    const labels = ui.counts[kind];
    return `${integers.format(count)} ${labels[count === 1 ? 0 : 1]}`;
  }

  function httpUrl(value, relative = false) {
    if (typeof value !== "string" || !value.trim()) return null;
    try {
      const url = relative ? new URL(value, window.location.href) : new URL(value);
      return url.protocol === "https:" || url.protocol === "http:" ? url.href : null;
    } catch {
      return null;
    }
  }

  function invalidData() {
    return Object.assign(new Error("Invalid menu data"), { kind: "data" });
  }

  function validateMenu(data) {
    if (!data || typeof data !== "object" || !Array.isArray(data.sections) || data.currency !== "EUR") throw invalidData();
    if (typeof data.name !== "string" || !plainText(data.name)) throw invalidData();
    for (const section of data.sections) {
      if (!section || typeof section.name !== "string" || !Array.isArray(section.categories)) throw invalidData();
      for (const category of section.categories) {
        if (!category || typeof category.name !== "string" || !Array.isArray(category.items)) throw invalidData();
        for (const item of category.items) {
          if (!item || typeof item.name !== "string" || (typeof item.price !== "number" && typeof item.price !== "string")) throw invalidData();
          if (typeof item.price === "number" && !Number.isFinite(item.price)) throw invalidData();
        }
      }
    }
    return data;
  }

  function validatePack(menu, pack) {
    if (!pack || ["sections", "categories", "products", "options"].some((key) => !pack[key] || typeof pack[key] !== "object" || Array.isArray(pack[key]))) throw invalidData();
    const hasText = (value) => typeof value === "string" && Boolean(plainText(value));
    if (!["Cafe", "Curto"].every((key) => hasText(pack.options[key]))) throw invalidData();
    for (const section of menu.sections) {
      if (!hasText(pack.sections[String(section.id)])) throw invalidData();
      for (const category of section.categories) {
        if (!hasText(pack.categories[String(category.id)])) throw invalidData();
        for (const item of category.items) {
          const product = pack.products[`${category.id}:${item.id}`];
          if (!product || !hasText(product.name) || typeof product.description !== "string") throw invalidData();
        }
      }
    }
    return pack;
  }

  function localizeOption(value) {
    const text = plainText(value);
    const options = language === "pt" ? null : menuPacks[language].options;
    return options && Object.hasOwn(options, text) ? plainText(options[text]) : text;
  }

  function customerDetails(value) {
    if (Array.isArray(value)) return value.map(customerDetails);
    if (value === null || typeof value !== "object") return value;
    const result = {};
    for (const [key, content] of Object.entries(value)) {
      const name = fieldKey(key);
      if (!customerDetailKeys.has(name)) continue;
      if (quantityDetailKeys.has(name) && !(Number(content) > 0)) continue;
      result[key] = customerDetails(content);
    }
    return result;
  }

  function detailText(value, options = null) {
    if (value === null || value === undefined) return "";
    if (Array.isArray(value)) return value.map((entry) => detailText(entry, options)).join(" ");
    if (typeof value === "object") return Object.values(value).map((entry) => detailText(entry, options)).join(" ");
    const text = plainText(value);
    return options && Object.hasOwn(options, text) ? options[text] : text;
  }

  function buildSearchIndex(menu) {
    const index = new Map();
    for (const section of menu.sections) {
      for (const category of section.categories) {
        for (const item of category.items) {
          const key = `${category.id}:${item.id}`;
          const details = customerDetails(item.details);
          const aliases = [section.name, category.name, item.name, item.description, detailText(details)];
          for (const pack of Object.values(menuPacks)) {
            const product = pack.products[key];
            aliases.push(pack.sections[String(section.id)], pack.categories[String(category.id)], product.name, product.description, detailText(details, pack.options));
          }
          index.set(key, normalize(aliases.join(" ")));
        }
      }
    }
    return index;
  }

  function detailValue(value, key) {
    if (value === null || value === undefined || value === "") return "";
    const name = fieldKey(key);
    if (typeof value === "boolean") return value ? ui.yes : ui.no;
    if (name === "obrigatorio" || name === "required") {
      const flag = normalize(value);
      if (["1", "true", "s", "sim", "yes"].includes(flag)) return ui.yes;
      if (["0", "false", "n", "nao", "no"].includes(flag)) return ui.no;
    }
    return priceKeys.has(name) ? formatPrice(value) : localizeOption(value);
  }

  function detailIdentity(entries) {
    const named = entries.find(([key, value]) => nameKeys.has(fieldKey(key)) && value !== null && typeof value !== "object" && plainText(value));
    return named || entries.find(([key, value]) => descriptionKeys.has(fieldKey(key)) && value !== null && typeof value !== "object" && plainText(value));
  }

  function renderDetail(value, key = "", itemContext = null) {
    if (Array.isArray(value)) {
      const list = element("ul", "detail-items");
      for (const entry of value) {
        const content = renderDetail(entry, key);
        if (!content) continue;
        const item = element("li");
        item.append(content);
        list.append(item);
      }
      return list.childElementCount ? list : null;
    }
    if (value === null || typeof value !== "object") {
      const text = detailValue(value, key);
      return text ? element("span", "detail-note", text) : null;
    }

    const entries = Object.entries(value);
    const identity = detailIdentity(entries);
    const price = entries.find(([name, content]) => primaryPriceKeys.has(fieldKey(name)) && content !== null && typeof content !== "object" && plainText(content));
    const title = identity ? plainText(identity[1]) : "";
    const showTitle = title && (!itemContext || title !== itemContext.name && title !== itemContext.description);
    const showPrice = price && (!itemContext || formatPrice(price[1]) !== formatPrice(itemContext.price));
    const group = element("div", "detail-group");
    const information = element("dl", "detail-list");
    const consumed = new Set();

    if (identity) consumed.add(identity[0]);
    if (price) consumed.add(price[0]);
    if (showTitle) {
      const heading = element("div", "item-heading");
      heading.append(element("p", "detail-label", localizeOption(title)));
      if (showPrice) heading.append(element("span", "item-price", formatPrice(price[1])));
      group.append(heading);
    }

    const addInformation = (name, content) => {
      const text = detailValue(content, name);
      if (!text) return;
      const entry = element("div", "detail-entry");
      entry.append(element("dt", "detail-label", fieldLabel(name)), element("dd", "detail-value", text));
      information.append(entry);
    };

    if (showPrice && !showTitle) addInformation(price[0], price[1]);
    for (const [name, content] of entries) {
      if (consumed.has(name) || content !== null && typeof content === "object") continue;
      if (descriptionKeys.has(fieldKey(name))) {
        const description = plainText(content);
        if (description && description !== title && (!itemContext || description !== itemContext.description)) group.append(element("p", "detail-note", localizeOption(description)));
      } else {
        addInformation(name, content);
      }
    }
    if (information.childElementCount) group.append(information);

    for (const [name, content] of entries) {
      if (content === null || typeof content !== "object") continue;
      const child = renderDetail(content, name);
      if (!child) continue;
      const childHasIdentity = !Array.isArray(content) && Boolean(detailIdentity(Object.entries(content)));
      if (childHasIdentity || showTitle && optionListKeys.has(fieldKey(name))) {
        group.append(child);
      } else {
        const section = element("section", "detail-group");
        section.append(element("p", "detail-label", fieldLabel(name)), child);
        group.append(section);
      }
    }
    return group.childElementCount ? group : null;
  }

  function renderItem(item, categoryId) {
    const key = `${categoryId}:${item.id}`;
    const product = language === "pt" ? item : menuPacks[language].products[key];
    const name = plainText(product.name);
    const description = plainText(product.description);
    const article = element("article", "menu-item");
    if (item.id !== undefined) article.dataset.sourceId = String(item.id);
    article.dataset.productKey = key;
    const imageUrl = httpUrl(item.image, true);
    if (imageUrl) {
      const image = element("img", "item-image");
      image.alt = name;
      image.loading = "lazy";
      image.decoding = "async";
      image.referrerPolicy = "no-referrer";
      image.width = 144;
      image.height = 144;
      image.addEventListener("error", () => image.remove(), { once: true });
      image.src = imageUrl;
      article.append(image);
    }
    const copy = element("div", "item-copy");
    const heading = element("div", "item-heading");
    heading.append(element("h4", "item-name", name), element("span", "item-price", formatPrice(item.price)));
    copy.append(heading);
    if (description) copy.append(element("p", "item-description", description));
    const detailData = customerDetails(item.details);
    const detailPresentation = renderDetail(detailData, "", { name: plainText(item.name), description: plainText(item.description), price: item.price });
    let details = null;
    if (detailPresentation) {
      details = element("details", "item-details");
      const summary = element("summary", "", ui.optionsLabel);
      const content = element("div", "detail-content");
      content.append(detailPresentation);
      details.append(summary, content);
      copy.append(details);
    }
    article.append(copy);
    return {
      id: key,
      element: article,
      details,
      searchText: searchIndex.get(key)
    };
  }

  function renderMenu(menu) {
    const selectedId = selectedCategory ? selectedCategory.id : null;
    const expandedItems = new Set(itemRecords.filter((item) => item.details && item.details.open).map((item) => item.id));
    const navigationOffset = navigation.scrollLeft;
    const pack = language === "pt" ? null : menuPacks[language];
    const sectionFragment = document.createDocumentFragment();
    const navFragment = document.createDocumentFragment();
    sectionRecords = [];
    categoryRecords = [];
    itemRecords = [];
    selectedCategory = null;
    allCategoriesButton = element("button", "category-filter is-all");
    allCategoriesButton.id = "all-categories";
    allCategoriesButton.type = "button";
    allCategoriesButton.setAttribute("aria-controls", "menu-sections");
    allCategoriesCount = element("span", "category-count");
    allCategoriesCount.setAttribute("aria-hidden", "true");
    allCategoriesButton.append(element("span", "category-filter-name", ui.allCategories), allCategoriesCount);
    allCategoriesButton.addEventListener("click", () => selectCategory(null));
    navFragment.append(allCategoriesButton);

    menu.sections.forEach((sourceSection, sectionIndex) => {
      const sectionName = plainText(pack ? pack.sections[String(sourceSection.id)] : sourceSection.name);
      const section = element("section", "menu-section");
      const sectionId = `section-${sectionIndex + 1}`;
      section.id = sectionId;
      section.setAttribute("aria-labelledby", `${sectionId}-title`);
      if (sourceSection.id !== undefined) section.dataset.sourceId = String(sourceSection.id);
      const heading = element("header", "section-heading");
      const title = element("h2", "section-title", sectionName);
      title.id = `${sectionId}-title`;
      const sectionCount = element("span", "section-count");
      heading.append(element("p", "section-index", String(sectionIndex + 1).padStart(2, "0")), title, sectionCount);
      section.append(heading);
      const navLabel = element("p", "nav-section-label", sectionName);
      navFragment.append(navLabel);
      const sectionRecord = { element: section, count: sectionCount, categories: [] };

      sourceSection.categories.forEach((sourceCategory, categoryIndex) => {
        const categoryName = plainText(pack ? pack.categories[String(sourceCategory.id)] : sourceCategory.name);
        const categoryId = `category-${sectionIndex + 1}-${categoryIndex + 1}`;
        const category = element("section", "menu-category");
        category.id = categoryId;
        category.setAttribute("aria-labelledby", `${categoryId}-title`);
        if (sourceCategory.id !== undefined) category.dataset.sourceId = String(sourceCategory.id);
        const categoryHeading = element("header", "category-heading");
        const categoryTitle = element("h3", "category-title", categoryName);
        categoryTitle.id = `${categoryId}-title`;
        const categoryCount = element("span", "category-total");
        categoryHeading.append(categoryTitle, categoryCount);
        category.append(categoryHeading);
        const itemList = element("div", "item-list");
        const items = sourceCategory.items.map((item) => {
          const record = renderItem(item, sourceCategory.id);
          if (record.details) record.details.open = expandedItems.has(record.id);
          itemList.append(record.element);
          itemRecords.push(record);
          return record;
        });
        if (items.length === 0) itemList.append(element("p", "category-empty", ui.categoryEmpty));
        category.append(itemList);
        section.append(category);

        const button = element("button", "category-filter");
        button.type = "button";
        button.setAttribute("aria-controls", "menu-sections");
        if (sourceCategory.id !== undefined) button.dataset.sourceId = String(sourceCategory.id);
        const navCount = element("span", "category-count");
        navCount.setAttribute("aria-hidden", "true");
        button.append(element("span", "category-filter-name", categoryName), navCount);
        navFragment.append(button);
        const categoryRecord = { id: String(sourceCategory.id), element: category, button, name: categoryName, count: categoryCount, navCount, items };
        if (categoryRecord.id === selectedId) selectedCategory = categoryRecord;
        button.addEventListener("click", () => selectCategory(categoryRecord));
        sectionRecord.categories.push(categoryRecord);
        categoryRecords.push(categoryRecord);
      });
      sectionRecords.push(sectionRecord);
      sectionFragment.append(section);
    });

    menuSections.replaceChildren(sectionFragment);
    navigation.replaceChildren(navFragment);
    navigation.scrollLeft = navigationOffset;
  }

  function updateMetadata(menu) {
    const name = plainText(menu?.name) || "Desfolhada";
    document.querySelector(".wordmark-name").textContent = name;
    document.querySelector(".wordmark").setAttribute("aria-label", ui.homeLabel(name));
    document.title = `${name} — ${ui.menuLabel}`;
    document.querySelector('meta[name="description"]').content = ui.description(name);
    const snapshot = document.getElementById("snapshot-date");
    const updatedAt = plainText(menu?.updatedAt);
    snapshot.hidden = !updatedAt;
    snapshot.replaceChildren();
    if (updatedAt) {
      const date = new Date(updatedAt);
      const time = element("time");
      if (Number.isNaN(date.getTime())) {
        time.textContent = updatedAt;
      } else {
        time.dateTime = date.toISOString();
        time.textContent = new Intl.DateTimeFormat(ui.locale, { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Lisbon" }).format(date);
      }
      snapshot.append(document.createTextNode(ui.snapshotLabel), time);
    }
  }

  function applyLanguage() {
    ui = interfaces[language];
    currency = new Intl.NumberFormat(ui.locale, { style: "currency", currency: "EUR" });
    integers = new Intl.NumberFormat(ui.locale);
    document.documentElement.lang = ui.locale;
    document.querySelectorAll("[data-i18n]").forEach((node) => {
      node.textContent = ui[node.dataset.i18n];
    });
    languageSwitcher.setAttribute("aria-label", ui.languageLabel);
    languageSwitcher.querySelectorAll("button").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.language === language));
    });
    document.querySelector(".menu-tools").setAttribute("aria-label", ui.searchLabel);
    search.placeholder = ui.searchPlaceholder;
    clearSearch.setAttribute("aria-label", ui.clearSearch);
    navigation.setAttribute("aria-label", ui.filterLabel);
    menuContent.setAttribute("aria-label", ui.menuLabel);
    updateMetadata(menuData);
    if (loaded) {
      renderMenu(menuData);
      applyFilter();
      revealSelectedCategory();
    } else {
      showRequestState();
    }
  }

  function changeLanguage(nextLanguage) {
    if (!Object.hasOwn(interfaces, nextLanguage) || language === nextLanguage) return;
    language = nextLanguage;
    try {
      localStorage.setItem(languageStorageKey, language);
    } catch {}
    applyLanguage();
  }

  function showState(type, message, retry = false, reset = false, copy = message.copy) {
    menuStatus.className = `menu-state is-${type}`;
    menuStatus.hidden = false;
    stateEyebrow.textContent = message.eyebrow;
    stateTitle.textContent = message.title;
    stateCopy.textContent = copy;
    retryMenu.hidden = !retry;
    resetSearch.hidden = !reset;
  }

  function showRequestState() {
    if (loadError) {
      searchSummary.textContent = ui.unavailableSummary;
      showState("error", ui.states[loadError], true);
    } else {
      searchSummary.textContent = ui.loadingSummary;
      showState("loading", ui.states.loading);
    }
  }

  function revealSelectedCategory() {
    const button = selectedCategory ? selectedCategory.button : allCategoriesButton;
    if (!button || navigation.scrollWidth <= navigation.clientWidth) return;
    const bounds = button.getBoundingClientRect();
    const viewport = navigation.getBoundingClientRect();
    if (bounds.left < viewport.left) navigation.scrollLeft -= viewport.left - bounds.left;
    else if (bounds.right > viewport.right) navigation.scrollLeft += bounds.right - viewport.right;
  }

  function selectCategory(category) {
    if (category === null) navigation.scrollLeft = 0;
    if (selectedCategory === category) return;
    selectedCategory = category;
    applyFilter();
    revealSelectedCategory();
    if (menuContent.getBoundingClientRect().top < 0) menuContent.scrollIntoView({ block: "start" });
  }

  function applyFilter() {
    if (!loaded) return;
    const query = normalize(search.value);
    const terms = query ? query.split(" ") : [];
    let total = 0;
    let allMatches = 0;
    let visibleCategories = 0;
    clearSearch.hidden = search.value.length === 0;

    for (const section of sectionRecords) {
      let sectionTotal = 0;
      for (const category of section.categories) {
        const selected = selectedCategory === null || selectedCategory === category;
        let matches = 0;
        for (const item of category.items) {
          const matchesQuery = terms.every((term) => item.searchText.includes(term));
          item.element.hidden = !selected || !matchesQuery;
          if (matchesQuery) matches += 1;
        }
        const visibleCount = selected ? matches : 0;
        category.element.hidden = visibleCount === 0;
        category.count.textContent = countLabel(visibleCount, "item");
        category.navCount.textContent = integers.format(matches);
        category.button.setAttribute("aria-pressed", String(selectedCategory === category));
        category.button.setAttribute("aria-label", `${category.name}, ${countLabel(matches, "item")}`);
        if (visibleCount > 0) visibleCategories += 1;
        sectionTotal += visibleCount;
        allMatches += matches;
      }
      section.element.hidden = sectionTotal === 0;
      section.count.textContent = countLabel(sectionTotal, "item");
      total += sectionTotal;
    }

    allCategoriesButton.setAttribute("aria-pressed", String(selectedCategory === null));
    allCategoriesButton.setAttribute("aria-label", `${ui.allCategories}, ${countLabel(allMatches, "item")}`);
    allCategoriesCount.textContent = integers.format(allMatches);
    sidebar.hidden = categoryRecords.length === 0;
    layout.classList.toggle("has-navigation", !sidebar.hidden);
    menuSections.hidden = total === 0;
    if (selectedCategory) {
      searchSummary.textContent = ui.inScope(countLabel(total, query ? "result" : "item"), selectedCategory.name);
    } else if (query) {
      searchSummary.textContent = ui.inScope(countLabel(total, "result"), countLabel(visibleCategories, "category"));
    } else {
      searchSummary.textContent = `${countLabel(total, "item")} · ${countLabel(categoryRecords.length, "category")}`;
    }
    if (itemRecords.length === 0) {
      showState("empty", ui.states.empty);
    } else if (total === 0) {
      const category = selectedCategory ? selectedCategory.name : "";
      const explanation = query ? ui.noResults(search.value.trim(), category) : ui.noItems(category);
      showState("empty", ui.states.noResults, false, true, explanation);
    } else {
      menuStatus.hidden = true;
    }
  }

  function clearQuery() {
    search.value = "";
    applyFilter();
    search.focus();
  }

  function resetFilters() {
    selectedCategory = null;
    clearQuery();
    navigation.scrollLeft = 0;
  }

  async function fetchJson(path) {
    const response = await fetch(path, { cache: "no-cache" });
    if (!response.ok) throw Object.assign(new Error("Menu request failed"), { kind: response.status === 404 ? "missing" : "network" });
    try {
      return await response.json();
    } catch {
      throw invalidData();
    }
  }

  async function loadMenu() {
    if (loading || loaded) return;
    loading = true;
    loaded = false;
    loadError = null;
    search.disabled = true;
    retryMenu.disabled = true;
    clearSearch.hidden = true;
    sidebar.hidden = true;
    layout.classList.remove("has-navigation");
    menuSections.hidden = true;
    menuContent.setAttribute("aria-busy", "true");
    showRequestState();
    try {
      const codes = Object.keys(languageFiles);
      const [data, ...packs] = await Promise.all(["./menu.json", ...Object.values(languageFiles)].map(fetchJson));
      const menu = validateMenu(data);
      const translations = {};
      codes.forEach((code, index) => {
        translations[code] = validatePack(menu, packs[index]);
      });
      menuData = menu;
      menuPacks = translations;
      searchIndex = buildSearchIndex(menu);
      renderMenu(menu);
      updateMetadata(menu);
      loaded = true;
      search.disabled = false;
      menuContent.setAttribute("aria-busy", "false");
      applyFilter();
    } catch (error) {
      menuContent.setAttribute("aria-busy", "false");
      loadError = error.kind === "missing" || error.kind === "data" ? error.kind : "network";
      showRequestState();
    } finally {
      loading = false;
      retryMenu.disabled = false;
    }
  }

  search.addEventListener("input", applyFilter);
  search.addEventListener("search", applyFilter);
  search.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && search.value) {
      event.preventDefault();
      clearQuery();
    }
  });
  clearSearch.addEventListener("click", clearQuery);
  resetSearch.addEventListener("click", resetFilters);
  retryMenu.addEventListener("click", loadMenu);
  languageSwitcher.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => changeLanguage(button.dataset.language));
  });

  applyLanguage();
  loadMenu();
})();
