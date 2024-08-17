function initContextMenu() {
  browser.storage.sync.get().then(settings => {
    let showEntry = ('showTabContextMenuCopyUrls' in settings) ? settings.showTabContextMenuCopyUrls : true;
    if (showEntry) {
      browser.contextMenus.create({
        id: "url-list-copy-urls",
        title: "Copy URLs (all tabs)",
        contexts: ["tab"],
      });
      browser.contextMenus.onClicked.addListener(onContextMenuClick);
    }
  }, error => {
    console.log(`Error: ${error}`);
  });
}
function clearContextMenu() {
  browser.contextMenus.onClicked.removeListener(onContextMenuClick);
  browser.contextMenus.remove('url-list-copy-urls');
}
function onContextMenuClick(info, tab) {
  if (info.menuItemId === "url-list-copy-urls") {
    browser.tabs.query({currentWindow: true}).then((tabs) => {
      let urls = tabs.map(tab => tab.url).join('\r\n');
      navigator.clipboard.writeText(urls).then(() => {
      }, () => {
        notifyError();
      });
    });
  }
}
function notifyError() {
  browser.notifications.create({
    "type": "basic",
    "iconUrl": browser.runtime.getURL("icons/error.svg"),
    "title": "Error!",
    "message": "Writing to clipboard is not possible!"
  });
}
function settingsChanged(message) {
  clearContextMenu();
  initContextMenu();
}
initContextMenu();
browser.runtime.onMessage.addListener((message) => {
  if (message.action === 'getStats') {
    return getTabStatistics();
  }
  if (message.action === 'getUrlsByDomain') {
    return getUrlsByDomain(message.domain);
  }
});
function getTabStatistics() {
  return browser.tabs.query({currentWindow: true}).then((tabs) => {
    let domainStats = {};
    tabs.forEach(tab => {
      let url = new URL(tab.url);
      let hostname = url.hostname;
      let domainParts = hostname.split('.').slice(-2);
      let domain = domainParts.join('.');
      if (!domainStats[domain]) {
        domainStats[domain] = { count: 0, subdomains: {} };
      }
      domainStats[domain].count++;
      if (!domainStats[domain].subdomains[hostname]) {
        domainStats[domain].subdomains[hostname] = [];
      }
      domainStats[domain].subdomains[hostname].push(tab.url);
    });
    return { stats: domainStats };
  });
}
function getUrlsByDomain(domain) {
  return browser.tabs.query({currentWindow: true}).then((tabs) => {
    let subdomains = {};
    tabs.forEach(tab => {
      let url = new URL(tab.url);
      let hostname = url.hostname;
      if (hostname.endsWith(domain)) {
        if (!subdomains[hostname]) {
          subdomains[hostname] = [];
        }
        subdomains[hostname].push(tab.url);
      }
    });
    return { subdomains: subdomains };
  });
}