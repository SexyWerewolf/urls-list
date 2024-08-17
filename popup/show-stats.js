document.addEventListener('DOMContentLoaded', () => {
  function fetchStats() {
    browser.runtime.sendMessage({action: 'getStats'}).then(response => {
      const statsContainer = document.getElementById('stats-container');
      statsContainer.innerHTML = ''; // Μπορεί να μείνει το ίδιο, καθώς εδώ αδειάζεις το περιεχόμενο
      for (const [domain, { count, subdomains }] of Object.entries(response.stats)) {
        const domainElement = document.createElement('div');
        domainElement.className = 'domain-item';

        // Δημιουργία του περιεχομένου χωρίς χρήση innerHTML
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
    }).catch(error => {
      console.error('Error fetching stats:', error);
    });
  }

  function fetchUrls(domain) {
    browser.runtime.sendMessage({action: 'getUrlsByDomain', domain: domain}).then(response => {
      if (!response.subdomains) {
        console.error('Error fetching URLs: response.subdomains is undefined');
        return;
      }
      const urlsList = document.getElementById(`urls-${domain}`);
      const urlsUl = urlsList.querySelector('ul');
      urlsUl.innerHTML = ''; // Μπορεί να μείνει το ίδιο, καθώς εδώ αδειάζεις το περιεχόμενο

      for (const [hostname, urls] of Object.entries(response.subdomains)) {
        const subdomainElement = document.createElement('li');

        // Δημιουργία του περιεχομένου χωρίς χρήση innerHTML
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
      const urlsList = document.getElementById(`urls-${domain}`);
      if (urlsList.style.display === 'block') {
        urlsList.style.display = 'none';
      } else {
        fetchUrls(domain);
      }
    } else if (event.target.classList.contains('url-item')) {
      const url = event.target.getAttribute('data-url');
      browser.tabs.query({url: url}).then(tabs => {
        if (tabs.length > 0) {
          browser.tabs.update(tabs[0].id, {active: true});
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
    browser.runtime.sendMessage({action: 'getStats'}).then(response => {
      const dataStr = JSON.stringify(response.stats, null, 2);
      const blob = new Blob([dataStr], {type: 'application/json'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'tab_statistics.json';
      a.click();
      URL.revokeObjectURL(url);
    }).catch(error => {
      console.error('Error saving data:', error);
    });
  });

  document.getElementById('close').addEventListener('click', () => {
    window.close();
  });

  fetchStats();
});
