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
  const currency = new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" });
  const integers = new Intl.NumberFormat("pt-PT");
  const mobileLayout = window.matchMedia("(max-width: 899px)");
  const blockTags = new Set(["P", "DIV", "LI", "UL", "OL", "H1", "H2", "H3", "H4", "H5", "H6", "SECTION", "ARTICLE", "BLOCKQUOTE", "TABLE", "TR"]);
  const priceKeys = new Set(["preco", "precovenda", "price", "pvp", "precounitario", "precoextra", "precobase"]);
  const primaryPriceKeys = new Set(["preco", "precovenda", "price", "pvp"]);
  const nameKeys = new Set(["nome", "name", "produto", "designacao", "nomeproduto", "productname", "titulo", "title"]);
  const descriptionKeys = new Set(["descricao", "description"]);
  const optionListKeys = new Set(["opcoes", "options", "products", "produtos"]);
  const customerDetailKeys = new Set([...nameKeys, ...descriptionKeys, ...priceKeys, "opcoes", "options", "complementares", "niveismenu", "products", "produtos", "mincomplementos", "maxcomplementos", "minopcoes", "maxopcoes", "obrigatorio", "required", "quantidade"]);
  const quantityDetailKeys = new Set(["mincomplementos", "maxcomplementos", "minopcoes", "maxopcoes", "quantidade"]);
  const sourceInfoKeys = ["pessoas", "tempo", "calorias"];
  const positiveSourceFlags = new Map([
    ["sal", "Sem sal"],
    ["vegetariano", "Vegetariano"],
    ["lactose", "Sem lactose"],
    ["gluten", "Sem glúten"],
    ["dieta", "Dieta"],
    ["alergenios", "Alergénios"],
    ["picante", "Picante"]
  ]);
  const detailLabels = new Map([
    ["descricao", "Descrição"],
    ["description", "Descrição"],
    ["nome", "Nome"],
    ["name", "Nome"],
    ["preco", "Preço"],
    ["precovenda", "Preço"],
    ["price", "Preço"],
    ["pvp", "PVP"],
    ["precobase", "Preço base"],
    ["precounitario", "Preço unitário"],
    ["precoextra", "Preço extra"],
    ["opcoes", "Opções"],
    ["options", "Opções"],
    ["complementares", "Complementos"],
    ["mincomplementos", "Mínimo de complementos"],
    ["maxcomplementos", "Máximo de complementos"],
    ["niveismenu", "Opções do menu"],
    ["obrigatorio", "Obrigatório"],
    ["required", "Obrigatório"],
    ["products", "Produtos"],
    ["produtos", "Produtos"],
    ["maxopcoes", "Máximo de opções"],
    ["minopcoes", "Mínimo de opções"],
    ["quantidade", "Quantidade"],
    ["informacoesorigem", "Informações da ementa original"],
    ["pessoas", "Dose"],
    ["tempo", "Tempo estimado"],
    ["calorias", "Calorias"],
  ]);

  let sectionRecords = [];
  let categoryRecords = [];
  let itemRecords = [];
  let currentCategory = null;
  let animationFrame = null;
  let loading = false;
  let loaded = false;

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
    return String(value).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-PT").replace(/\s+/g, " ").trim();
  }

  function fieldKey(key) {
    return normalize(key).replace(/[^a-z0-9]/g, "");
  }

  function fieldLabel(key) {
    const known = detailLabels.get(fieldKey(key));
    if (known) return known;
    const text = plainText(key).replace(/([a-z])([A-Z])/g, "$1 $2").replace(/[_-]+/g, " ");
    return text.charAt(0).toLocaleUpperCase("pt-PT") + text.slice(1);
  }

  function formatPrice(value) {
    if (typeof value === "number" && Number.isFinite(value)) return currency.format(value);
    const text = plainText(value);
    const numeric = text.replace(/\s+/g, "").replace(/^(?:€|EUR)|(?:€|EUR)$/gi, "");
    if (/^[+-]?\d+(?:[.,]\d+)?$/.test(numeric)) {
      const amount = Number(numeric.replace(",", "."));
      if (Number.isFinite(amount)) return currency.format(amount);
    }
    return text || "Preço não indicado";
  }

  function countLabel(count, singular, plural) {
    return `${integers.format(count)} ${count === 1 ? singular : plural}`;
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
    if (!data || typeof data !== "object" || !Array.isArray(data.sections) || data.currency !== "EUR" || !httpUrl(data.sourceUrl)) throw invalidData();
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
    const sourceInformation = {};
    for (const key of sourceInfoKeys) {
      if (value[key] !== null && value[key] !== undefined && Number.isFinite(Number(value[key])) && Number(value[key]) > 0) sourceInformation[key] = value[key];
    }
    for (const [key, label] of positiveSourceFlags) {
      const flag = value[key];
      if (flag === true || typeof flag === "number" && flag > 0) sourceInformation[label] = "Assinalado na ementa original";
    }
    if (Object.keys(sourceInformation).length) result.informacoesOrigem = sourceInformation;
    return result;
  }

  function detailText(value) {
    if (value === null || value === undefined) return "";
    if (Array.isArray(value)) return value.map(detailText).join(" ");
    if (typeof value === "object") return Object.values(value).map(detailText).join(" ");
    return plainText(value);
  }

  function detailValue(value, key) {
    if (value === null || value === undefined || value === "") return "";
    const name = fieldKey(key);
    if (typeof value === "boolean") return value ? "Sim" : "Não";
    if (name === "calorias") return `${integers.format(Number(value))} kcal`;
    if (name === "tempo") return `${integers.format(Number(value))} ${Number(value) === 1 ? "minuto" : "minutos"}`;
    if (name === "pessoas") return `${integers.format(Number(value))} ${Number(value) === 1 ? "pessoa" : "pessoas"}`;
    if (name === "obrigatorio" || name === "required") {
      const flag = normalize(value);
      if (["1", "true", "s", "sim", "yes"].includes(flag)) return "Sim";
      if (["0", "false", "n", "nao", "no"].includes(flag)) return "Não";
    }
    return priceKeys.has(name) ? formatPrice(value) : plainText(value);
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
      heading.append(element("p", "detail-label", title));
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
        if (description && description !== title && (!itemContext || description !== itemContext.description)) group.append(element("p", "detail-note", description));
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

  function renderItem(item, categoryName, sectionName) {
    const name = plainText(item.name);
    const description = plainText(item.description);
    const article = element("article", "menu-item");
    if (item.id !== undefined) article.dataset.sourceId = String(item.id);
    const imageUrl = httpUrl(item.image, true);
    if (imageUrl) {
      const image = element("img", "item-image");
      image.src = imageUrl;
      image.alt = name;
      image.loading = "lazy";
      image.decoding = "async";
      image.referrerPolicy = "no-referrer";
      image.width = 144;
      image.height = 144;
      article.classList.add("has-image");
      image.addEventListener("error", () => {
        image.remove();
        article.classList.remove("has-image");
      }, { once: true });
      article.append(image);
    }
    const copy = element("div", "item-copy");
    const heading = element("div", "item-heading");
    heading.append(element("h4", "item-name", name), element("span", "item-price", formatPrice(item.price)));
    copy.append(heading);
    if (description) copy.append(element("p", "item-description", description));
    const detailData = customerDetails(item.details);
    const detailPresentation = renderDetail(detailData, "", { name, description, price: item.price });
    if (detailPresentation) {
      const details = element("details", "item-details");
      const summary = element("summary", "", "Opções e informações");
      const content = element("div", "detail-content");
      content.append(detailPresentation);
      details.append(summary, content);
      copy.append(details);
    }
    article.append(copy);
    return {
      element: article,
      searchText: normalize([name, description, categoryName, sectionName, detailText(detailData)].join(" "))
    };
  }

  function renderMenu(menu) {
    const sectionFragment = document.createDocumentFragment();
    const navFragment = document.createDocumentFragment();
    sectionRecords = [];
    categoryRecords = [];
    itemRecords = [];
    currentCategory = null;

    menu.sections.forEach((sourceSection, sectionIndex) => {
      const sectionName = plainText(sourceSection.name);
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
      const sectionRecord = { element: section, count: sectionCount, navLabel, categories: [] };

      sourceSection.categories.forEach((sourceCategory, categoryIndex) => {
        const categoryName = plainText(sourceCategory.name);
        const categoryId = `category-${sectionIndex + 1}-${categoryIndex + 1}`;
        const category = element("section", "menu-category");
        category.id = categoryId;
        category.tabIndex = -1;
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
          const record = renderItem(item, categoryName, sectionName);
          itemList.append(record.element);
          itemRecords.push(record);
          return record;
        });
        if (items.length === 0) itemList.append(element("p", "category-empty", "Não há artigos disponíveis nesta categoria."));
        category.append(itemList);
        section.append(category);

        const link = element("a", "category-link");
        link.href = `#${categoryId}`;
        if (sourceCategory.id !== undefined) link.dataset.sourceId = String(sourceCategory.id);
        const navCount = element("span", "category-count");
        navCount.setAttribute("aria-hidden", "true");
        link.append(element("span", "category-link-name", categoryName), navCount);
        navFragment.append(link);
        const categoryRecord = { element: category, link, name: categoryName, count: categoryCount, navCount, items };
        link.addEventListener("click", () => setCurrentCategory(categoryRecord));
        sectionRecord.categories.push(categoryRecord);
        categoryRecords.push(categoryRecord);
      });
      sectionRecords.push(sectionRecord);
      sectionFragment.append(section);
    });

    menuSections.replaceChildren(sectionFragment);
    navigation.replaceChildren(navFragment);
  }

  function updateMetadata(menu) {
    const name = plainText(menu.name) || "Desfolhada";
    document.querySelector(".wordmark-name").textContent = name;
    document.querySelector(".wordmark").setAttribute("aria-label", `${name} — início da ementa`);
    document.title = `${name} — Ementa`;
    document.querySelector('meta[name="description"]').content = `Uma forma simples de consultar a ementa de ${name}.`;
    const sourceLink = document.getElementById("source-link");
    sourceLink.href = httpUrl(menu.sourceUrl);
    sourceLink.hidden = false;
    const snapshot = document.getElementById("snapshot-date");
    const updatedAt = plainText(menu.updatedAt);
    snapshot.hidden = !updatedAt;
    snapshot.replaceChildren();
    if (updatedAt) {
      const date = new Date(updatedAt);
      const time = element("time");
      if (Number.isNaN(date.getTime())) {
        time.textContent = updatedAt;
      } else {
        time.dateTime = date.toISOString();
        time.textContent = new Intl.DateTimeFormat("pt-PT", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Lisbon" }).format(date);
      }
      snapshot.append(document.createTextNode("Atualização da cópia: "), time);
    }
  }

  function showState(type, eyebrow, title, copy, retry = false, reset = false) {
    menuStatus.className = `menu-state is-${type}`;
    menuStatus.hidden = false;
    stateEyebrow.textContent = eyebrow;
    stateTitle.textContent = title;
    stateCopy.textContent = copy;
    retryMenu.hidden = !retry;
    resetSearch.hidden = !reset;
  }

  function setCurrentCategory(category) {
    if (currentCategory === category) return;
    if (currentCategory) currentCategory.link.removeAttribute("aria-current");
    currentCategory = category;
    if (category) category.link.setAttribute("aria-current", "location");
  }

  function updateCurrentCategory() {
    animationFrame = null;
    if (!loaded || sidebar.hidden) return;
    const offset = mobileLayout.matches ? Math.max(24, sidebar.getBoundingClientRect().bottom + 16) : 40;
    let candidate = null;
    for (const category of categoryRecords) {
      if (category.element.hidden) continue;
      if (!candidate) candidate = category;
      if (category.element.getBoundingClientRect().top <= offset) candidate = category;
      else break;
    }
    setCurrentCategory(candidate);
  }

  function scheduleCurrentCategory() {
    if (animationFrame === null) animationFrame = window.requestAnimationFrame(updateCurrentCategory);
  }

  function applyFilter() {
    if (!loaded) return;
    const query = normalize(search.value);
    const terms = query ? query.split(" ") : [];
    let total = 0;
    let visibleCategories = 0;
    clearSearch.hidden = search.value.length === 0;

    for (const section of sectionRecords) {
      let sectionTotal = 0;
      for (const category of section.categories) {
        let matches = 0;
        for (const item of category.items) {
          const visible = terms.every((term) => item.searchText.includes(term));
          item.element.hidden = !visible;
          if (visible) matches += 1;
        }
        category.element.hidden = Boolean(query) && matches === 0;
        category.link.hidden = category.element.hidden;
        category.count.textContent = countLabel(matches, "artigo", "artigos");
        category.navCount.textContent = integers.format(matches);
        category.link.setAttribute("aria-label", `${category.name}, ${countLabel(matches, "artigo", "artigos")}`);
        if (!category.element.hidden) visibleCategories += 1;
        sectionTotal += matches;
      }
      section.element.hidden = Boolean(query) && sectionTotal === 0;
      section.navLabel.hidden = section.element.hidden;
      section.count.textContent = countLabel(sectionTotal, "artigo", "artigos");
      total += sectionTotal;
    }

    sidebar.hidden = visibleCategories === 0 || total === 0;
    layout.classList.toggle("has-navigation", !sidebar.hidden);
    menuSections.hidden = total === 0;
    if (query) {
      searchSummary.textContent = `${countLabel(total, "resultado", "resultados")} em ${countLabel(visibleCategories, "categoria", "categorias")}`;
    } else {
      searchSummary.textContent = `${countLabel(itemRecords.length, "artigo", "artigos")} · ${countLabel(categoryRecords.length, "categoria", "categorias")}`;
    }
    if (itemRecords.length === 0) {
      showState("empty", "Por agora", "Ainda não há artigos para mostrar.", "A cópia da ementa não contém artigos disponíveis. Consulte a ementa original ou fale com o estabelecimento.");
    } else if (total === 0) {
      showState("empty", "Vamos tentar de outra forma", "Não encontrámos o que procura.", `Não há resultados para “${search.value.trim()}”. Experimente outra palavra ou volte à ementa completa.`, false, true);
    } else {
      menuStatus.hidden = true;
    }
    if (sidebar.hidden) setCurrentCategory(null);
    else scheduleCurrentCategory();
  }

  function clearQuery() {
    search.value = "";
    applyFilter();
    search.focus();
  }

  async function loadMenu() {
    if (loading) return;
    loading = true;
    loaded = false;
    search.disabled = true;
    retryMenu.disabled = true;
    clearSearch.hidden = true;
    sidebar.hidden = true;
    layout.classList.remove("has-navigation");
    menuSections.hidden = true;
    menuContent.setAttribute("aria-busy", "true");
    searchSummary.textContent = "A carregar a ementa…";
    showState("loading", "Só um momento", "A preparar a ementa.", "Estamos a carregar os artigos e os preços.");
    try {
      const response = await fetch("./menu.json", { cache: "no-cache" });
      if (!response.ok) throw Object.assign(new Error("Menu request failed"), { kind: response.status === 404 ? "missing" : "network" });
      let data;
      try {
        data = await response.json();
      } catch {
        throw invalidData();
      }
      const menu = validateMenu(data);
      renderMenu(menu);
      updateMetadata(menu);
      loaded = true;
      search.disabled = false;
      menuContent.setAttribute("aria-busy", "false");
      applyFilter();
      if (window.location.hash) {
        let target;
        try {
          target = document.getElementById(decodeURIComponent(window.location.hash.slice(1)));
        } catch {
          target = null;
        }
        if (target && target.classList.contains("menu-category") && !target.hidden) target.scrollIntoView();
      }
    } catch (error) {
      menuContent.setAttribute("aria-busy", "false");
      searchSummary.textContent = "Ementa indisponível de momento.";
      if (error.kind === "missing") {
        showState("error", "Ainda não está à mesa", "A ementa ainda não está disponível.", "Ainda não conseguimos apresentar a ementa deste espaço. Pode tentar novamente mais tarde.", true);
      } else if (error.kind === "data") {
        showState("error", "Não foi possível abrir a ementa", "Os dados da ementa não puderam ser lidos.", "O ficheiro da ementa não está num formato que possamos apresentar. Tente novamente mais tarde.", true);
      } else {
        showState("error", "Uma pequena interrupção", "Não foi possível carregar a ementa.", "Pode haver uma falha de ligação ou no serviço. Tente novamente daqui a pouco.", true);
      }
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
  resetSearch.addEventListener("click", clearQuery);
  retryMenu.addEventListener("click", loadMenu);
  window.addEventListener("scroll", scheduleCurrentCategory, { passive: true });
  window.addEventListener("resize", scheduleCurrentCategory, { passive: true });

  loadMenu();
})();
