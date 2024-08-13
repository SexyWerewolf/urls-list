function saveOptions(e) {
  e.preventDefault();
  browser.storage.sync.set({
    showTabContextMenuCopyUrls: document.querySelector("#showTabContextMenuCopyUrls").checked,
    openUrlsAlreadyOpened: document.querySelector("#openUrlsAlreadyOpened").checked,
    filterInputValue: document.querySelector("#filterInput").value,
  });
  browser.runtime.sendMessage({});
}
function restoreOptions() {
  browser.storage.sync.get().then(settings => {
    let showContextMenu = ('showTabContextMenuCopyUrls' in settings) ? settings.showTabContextMenuCopyUrls : true;
    let openTabs = ('openUrlsAlreadyOpened' in settings) ? settings.openUrlsAlreadyOpened : false;
    let filterInputValue = ('filterInputValue' in settings) ? settings.filterInputValue : ''; 
    document.querySelector("#showTabContextMenuCopyUrls").checked = showContextMenu;
    document.querySelector("#openUrlsAlreadyOpened").checked = openTabs;
    document.querySelector("#filterInput").value = filterInputValue;
  }, error => {
    console.log(`Error: ${error}`);
  });
}
document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);
