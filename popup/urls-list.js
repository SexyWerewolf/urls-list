let resetBtn = document.querySelector('.reset');
let openBtn = document.querySelector('.open');
let copyBtn = document.querySelector('.copy');
let saveBtn = document.querySelector('.save');
let sortAscBtn = document.querySelector('.sortAsc');
let sortDescBtn = document.querySelector('.sortDesc');
let resetFilterBtn = document.querySelector('.resetFilter');
let closeTabsBtn = document.querySelector('.closeTabs');
let closeDuplicatesBtn = document.querySelector('.closeDuplicates');
let urlText = document.querySelector('.urlText');
let filterInput = document.querySelector('.filterInput');
let filterWarning = document.querySelector('.filterWarning');
let alwaysOpenAllTabs = false;
let filterBackup = '';
let filterMode = false;
let previousUrls = '';
let currentFilter = '';
function saveFilterValue(value) {
  browser.storage.sync.set({ filterInputValue: value });
}
function restoreFilterValue() {
  return browser.storage.sync.get('filterInputValue').then(settings => {
    return ('filterInputValue' in settings) ? settings.filterInputValue : '';
  });
}
function applyFilter() {
  let val = filterInput.value;
  filterInput.classList.remove("filterInputError");
  currentFilter = val;
  if (val !== '') {
    enableFilterMode();
    try {
      let re;
      if (val.startsWith('!')) {
        re = new RegExp(`^(?!.*(${val.slice(1)})).*$`, 'i');
      } else {
        re = new RegExp(val, 'i');
      }
      let urls = filterBackup.split('\n');
      let filteredUrls = [];
      for (let i in urls) {
        let clean = urls[i].trim();
        if (clean !== '' && re.test(clean)) {
          filteredUrls.push(clean);
        }
      }
      urlText.value = filteredUrls.join('\n') + '\n';
    } catch (ex) {
      filterInput.classList.add("filterInputError");
    }
  } else {
    disableFilterMode();
  }
  saveFilterValue(val);
}
function listTabs() {
  browser.tabs.query({currentWindow: true}).then((tabs) => {
    let urls = '';
    for (let tab of tabs) {
      urls += tab.url + '\n';
    }
    if (urls !== previousUrls) {
      previousUrls = urls;
      filterBackup = urls;
      urlText.value = urls;
      applyFilter();
    }
  });
}
function open() {
  browser.tabs.query({currentWindow: true}).then((tabs) => {
    let currentUrls = [];
    for (let tab of tabs) {
      currentUrls.push(tab.url);
    }
    let newUrls = urlText.value.split('\n');
    for (let url of newUrls) {
      if (url !== '' && (alwaysOpenAllTabs || currentUrls.indexOf(url) < 0)) {
        if (url.indexOf('://') < 0) {
          url = 'http://' + url;
        }
        browser.tabs.create({
          active: false,
          url: url
        });
      }
    }
  });
}
function copy() {
  let tmp = urlText.value;
  urlText.select();
  document.execCommand('Copy');
  urlText.value = '';
  urlText.value = tmp;
}
function save() {
  let d = new Date();
  let year = d.getFullYear();
  let month = ('0' + (d.getMonth() + 1)).slice(-2);
  let day = ('0' + d.getDate()).slice(-2);
  let hour = ('0' + d.getHours()).slice(-2);
  let min = ('0' + d.getMinutes()).slice(-2);
  let sec = ('0' + d.getSeconds()).slice(-2);
  let dateString = [year, month, day, hour, min, sec].join('-');
  let dl = document.createElement('a');
  dl.download = 'urls-list-' + dateString + '.txt';
  dl.href = window.URL.createObjectURL(
    new Blob([urlText.value], {type: 'text/plain'})
  );
  dl.onclick = event => document.body.removeChild(event.target);
  dl.style.display = 'none';
  document.body.appendChild(dl);
  dl.click();
}
function sort(desc = false) {
  let urls = urlText.value.split('\n');
  let cleanUrls = [];
  for (let i in urls) {
    let clean = urls[i].trim();
    if (clean !== '') {
      cleanUrls.push(clean);
    }
  }
  cleanUrls.sort();
  if (desc) {
    cleanUrls.reverse();
  }
  urlText.value = cleanUrls.join('\n') + '\n';
}
function sortAsc() {
  sort(false);
}
function sortDesc() {
  sort(true);
}
function enableFilterMode() {
  if (!filterMode) {
    filterBackup = urlText.value;
    urlText.readOnly = true;
    urlText.classList.add("urlTextFilterMode");
    filterWarning.classList.remove("hide");
    filterMode = true;
  }
}
function disableFilterMode() {
  if (filterMode) {
    urlText.value = filterBackup;
    urlText.readOnly = false;
    urlText.classList.remove("urlTextFilterMode");
    filterWarning.classList.add("hide");
    filterInput.classList.remove("filterInputError");
    filterMode = false;
  }
}
function resetFilter() {
  disableFilterMode();
}
function closeTabs() {
  browser.tabs.query({currentWindow: true}).then((tabs) => {
    let urlsToClose = urlText.value.split('\n').map(url => url.trim()).filter(url => url !== '');
    let tabsToClose = tabs.filter(tab => urlsToClose.includes(tab.url)).map(tab => tab.id);
    if (tabsToClose.length > 0) {
      browser.tabs.remove(tabsToClose);
    }
  });
}
function closeDuplicates() {
  browser.tabs.query({currentWindow: true}).then((tabs) => {
    let urlMap = {};
    let duplicateTabs = [];

    tabs.forEach(tab => {
      let normalizedUrl = tab.url.split('#')[0].split('?')[0];
      if (urlMap[normalizedUrl]) {
        duplicateTabs.push(tab.id);
      } else {
        urlMap[normalizedUrl] = true;
      }
    });

    if (duplicateTabs.length > 0) {
      browser.tabs.remove(duplicateTabs);
    }
  });
}
document.addEventListener('DOMContentLoaded', () => {
  restoreFilterValue().then(value => {
    filterInput.value = value;
    currentFilter = value;
    listTabs();
  });
});
let showStatsBtn = document.querySelector('.showStats');
showStatsBtn.addEventListener('click', () => {
  browser.tabs.create({ url: browser.runtime.getURL('popup/show-stats.html') });
});
resetBtn.addEventListener('click', listTabs);
openBtn.addEventListener('click', open);
copyBtn.addEventListener('click', copy);
saveBtn.addEventListener('click', save);
sortAscBtn.addEventListener('click', sortAsc);
sortDescBtn.addEventListener('click', sortDesc);
resetFilterBtn.addEventListener('click', resetFilter);
filterInput.addEventListener('input', applyFilter);
closeTabsBtn.addEventListener('click', closeTabs);
closeDuplicatesBtn.addEventListener('click', closeDuplicates);
setInterval(listTabs, 1000);