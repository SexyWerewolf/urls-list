# URLs List Addon - Enhanced Version

This repository is an improved fork of the original [URLs List addon](https://github.com/moritz-h/urls-list), designed to offer users an advanced way to manage and interact with the URLs of all open tabs in the current window. This enhanced version introduces several new features, including the ability to remember and automatically apply the last used filter input across sessions, as well as detailed tab statistics.

## Features

- **Copy URLs:** Easily copy all the URLs from your current window.
- **Filter URLs:** Use the filter function to narrow down the list of URLs to match specific patterns.
- **Sort URLs:** Sort URLs alphabetically in ascending or descending order.
- **Open URLs:** Open URLs from the list that aren't already open in your browser.
- **Save URLs:** Save the list of URLs to a file for later use.
- **Tab Statistics:** View detailed statistics for tabs, including breakdowns by domain and subdomain.
- **Close Duplicate Domains:** Manually remove duplicate domain entries using the "Close duplicate" button.

## Filter Usage Examples

The filter allows you to include or exclude specific URLs based on patterns. Here are some examples:

### 1. Basic Domain Filtering
   - **Filter:** `example.com`
   - **Result:** Displays all URLs containing `example.com`, such as `http://1.example.com` or `https://2.example.com/page`.

### 2. Exact Match Filtering
   - **Filter:** `^http://1\.example\.com$`
   - **Result:** Displays only the exact URL `http://1.example.com`.

### 3. Excluding a Specific Domain
   - **Filter:** `!1.example.com`
   - **Result:** Displays all URLs except those containing `1.example.com`.

### 4. Excluding Multiple Domains
   - **Filter:** `!(1.example.com|2.example.com)`
   - **Result:** Displays all URLs except those containing `1.example.com` or `2.example.com`.

### 5. Filtering by Path
   - **Filter:** `example.com/page`
   - **Result:** Displays all URLs with `example.com` in the domain and `/page` in the path, such as `http://1.example.com/page` or `https://2.example.com/page`.

## Tab Statistics

- **Tab Statistics Page:** Added a new page to display statistics for tabs, including a breakdown of domains and subdomains.
- **Domain and Subdomain Statistics:** Implemented a detailed view of tab counts by domain and subdomain, with options to expand and view URLs associated with each domain.

## Installation

To install the enhanced version of the addon:

1. Download the addon from [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/urls-list-fork/) or directly from this repository.
2. Open your Firefox browser and navigate to `about:debugging`.
3. Click on "This Firefox" on the left panel.
4. Click on "Load Temporary Add-on...".
5. Select the `manifest.json` file from the downloaded directory.

## Usage

1. Click on the URLs List icon in your browser toolbar.
2. Use the filter box to narrow down the URLs.
3. Close and reopen the addon; your last filter will be automatically applied.

## License

This project is licensed under the [MIT License](LICENSE), just like the original project. Please ensure to comply with the terms of the license.

## Acknowledgments

- Thanks to [moritz-h](https://github.com/moritz-h) for the original URLs List addon.
