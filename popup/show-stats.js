document.addEventListener('DOMContentLoaded', () => {
  function processIPStats(stats) {
    let localIPs = {};
    let publicIPs = {};
    for (const [domain, { count, subdomains }] of Object.entries(stats)) {
      for (const [hostname, urls] of Object.entries(subdomains)) {
        if (isLocalIP(hostname)) {
          if (!localIPs[hostname]) {
            localIPs[hostname] = { count: 0, urls: [] };
          }
          localIPs[hostname].count += urls.length;
          localIPs[hostname].urls.push(...urls);
        } else {
          if (!publicIPs[hostname]) {
            publicIPs[hostname] = { count: 0, urls: [] };
          }
          publicIPs[hostname].count += urls.length;
          publicIPs[hostname].urls.push(...urls);
        }
      }
    }
    return { localIPs, publicIPs };
  }
  function isLocalIP(ip) {
    const localIPPatterns = [
      /^10\./,
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
      /^192\.168\./,
    ];
    return localIPPatterns.some(pattern => pattern.test(ip));
  }
  function fetchStats() {
    browser.runtime.sendMessage({ action: 'getStats' }).then(response => {
      const stats = processIPStats(response.stats);
      const statsContainer = document.getElementById('stats-container');
      statsContainer.innerHTML = '';
      const publicSection = document.createElement('div');
      publicSection.className = 'section-title';
      publicSection.textContent = 'Public Domains';
      statsContainer.appendChild(publicSection);
      for (const [domain, { count, urls }] of Object.entries(stats.publicIPs)) {
        if (!domain.trim()) continue;
        const domainElement = document.createElement('div');
        domainElement.className = 'domain-item';
        const domainName = document.createElement('div');
        domainName.className = 'domain-name';
        domainName.setAttribute('data-domain', domain);
        domainName.textContent = domain;
        const domainCount = document.createElement('div');
        domainCount.className = 'domain-count';
        domainCount.textContent = `${count} tabs`;
        const urlsList = document.createElement('div');
        urlsList.className = 'urls-list';
        urlsList.id = `urls-${domain}`;
        urlsList.style.display = 'none';
        const urlsUl = document.createElement('ul');
        urlsList.appendChild(urlsUl);
        domainElement.appendChild(domainName);
        domainElement.appendChild(domainCount);
        domainElement.appendChild(urlsList);
        statsContainer.appendChild(domainElement);
      }
      if (Object.keys(stats.localIPs).length > 0) {
        const localIPSection = document.createElement('div');
        localIPSection.className = 'section-title';
        localIPSection.textContent = 'Local IPs';
        statsContainer.appendChild(localIPSection);
        for (const [domain, { count, urls }] of Object.entries(stats.localIPs)) {
          if (!domain.trim()) continue;
          if (domain.startsWith('moz-extension://')) {
            continue;
          }
          const domainElement = document.createElement('div');
          domainElement.className = 'domain-item';
          const domainName = document.createElement('div');
          domainName.className = 'domain-name';
          domainName.setAttribute('data-domain', domain);
          domainName.textContent = domain;
          const domainCount = document.createElement('div');
          domainCount.className = 'domain-count';
          domainCount.textContent = `${count} tabs`;
          const urlsList = document.createElement('div');
          urlsList.className = 'urls-list';
          urlsList.id = `urls-${domain}`;
          urlsList.style.display = 'none';
          const urlsUl = document.createElement('ul');
          urlsList.appendChild(urlsUl);
          domainElement.appendChild(domainName);
          domainElement.appendChild(domainCount);
          domainElement.appendChild(urlsList);
          localIPSection.appendChild(domainElement);
        }
      }
    }).catch(error => {
      console.error('Error fetching stats:', error);
    });
  }
  function fetchUrls(domain) {
    browser.runtime.sendMessage({ action: 'getUrlsByDomain', domain: domain }).then(response => {
      if (!response.subdomains) {
        console.error('Error fetching URLs: response.subdomains is undefined');
        return;
      }
      const urlsList = document.getElementById(`urls-${domain}`);
      if (!urlsList) {
        console.error(`No element found for domain: ${domain}`);
        return;
      }
      const urlsUl = urlsList.querySelector('ul');
      urlsUl.innerHTML = '';
      for (const [hostname, urls] of Object.entries(response.subdomains)) {
        const subdomainElement = document.createElement('li');
        const subdomainName = document.createElement('div');
        subdomainName.className = 'subdomain-name';
        subdomainName.textContent = hostname;
        const urlList = document.createElement('ul');
        urls.forEach(url => {
          const urlItem = document.createElement('li');
          urlItem.className = 'url-item';
          urlItem.setAttribute('data-url', url);
          urlItem.textContent = url;
          urlList.appendChild(urlItem);
        });
        subdomainElement.appendChild(subdomainName);
        subdomainElement.appendChild(urlList);
        urlsUl.appendChild(subdomainElement);
      }
      urlsList.style.display = 'block';
    }).catch(error => {
      console.error('Error fetching URLs:', error);
    });
  }
  document.getElementById('stats-container').addEventListener('click', event => {
    if (event.target.classList.contains('domain-name')) {
      const domain = event.target.getAttribute('data-domain');
      if (domain) {
        const urlsList = document.getElementById(`urls-${domain}`);
        if (urlsList) {
          if (urlsList.style.display === 'block') {
            urlsList.style.display = 'none';
          } else {
            fetchUrls(domain);
          }
        } else {
          console.error(`No URLs list found for domain: ${domain}`);
        }
      } else {
        console.error('No domain specified.');
      }
    } else if (event.target.classList.contains('url-item')) {
      const url = event.target.getAttribute('data-url');
      browser.tabs.query({ url: url }).then(tabs => {
        if (tabs.length > 0) {
          browser.tabs.update(tabs[0].id, { active: true });
        } else {
          window.open(url, '_blank');
        }
      });
    }
  });
  const searchInput = document.getElementById('search');
  searchInput.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase();
    const domainItems = document.querySelectorAll('.domain-item');
    domainItems.forEach(item => {
      const domainName = item.querySelector('.domain-name').textContent.toLowerCase();
      item.style.display = domainName.includes(query) ? '' : 'none';
    });
  });
  document.getElementById('save').addEventListener('click', () => {
    browser.runtime.sendMessage({ action: 'getStats' }).then(response => {
      const dataStr = JSON.stringify(response.stats, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'tab-stats.json';
      a.click();
      URL.revokeObjectURL(url);
    }).catch(error => {
      console.error('Error saving stats:', error);
    });
  });
  fetchStats();
});