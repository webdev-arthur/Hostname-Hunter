# HostHunter

**HostHunter** is a reverse DNS lookup tool designed to perform DNS lookups on a list of IP addresses, providing hostname information for each IP. It supports reading input from both command-line arguments and files. Please note that HostHunter is designed to handle individual IP addresses only and does not support CIDR ranges.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
  - [Basic Usage](#basic-usage)
  - [Examples](#examples)
---

## Features

- **Reverse DNS Lookup**: Provides hostname information for each IP address.
- **Flexible Input**: Accepts IPs from command-line arguments or from a file.
- **Formatted Output**: Displays results in a structured table format and can save output to CSV.
- **Error Handling**: Notifies users of unsupported inputs, such as CIDR ranges.

---

## Installation

To use HostHunter, you need [Node.js](https://nodejs.org/) installed on your system.

1. Clone the repository:
    ```bash
    git clone https://github.com/yourusername/hosthunter.git
    cd hosthunter
    ```

2. Install dependencies:
    ```bash
    npm install
    ```

---

## Usage

HostHunter supports two primary options for input:

1. **Directly from Command Line**: Input IP addresses as a single or comma-separated list.
2. **From a File**: Specify a file containing a list of IP addresses, each on a new line.

### Basic Usage

```bash
node hosthunter.js -i <IP-Address or IP-Addresses>
node hosthunter.js -iF <File-Path>
node hosthunter.js -i <IP-Address> -o <Output-Filename>
```

-i: Input IP addresses (comma-separated if multiple).
-iF: Specify a file containing IP addresses.
-o: Specify an output file (CSV format).


### Examples

1. Single IP Lookup:
```bash
node hosthunter.js -i 8.8.8.8
```

2. Multiple IPs from Command Line:
```bash
node hosthunter.js -i 8.8.8.8,1.1.1.1,192.168.1.1
```

3. Lookup from a File:
```bash
node hosthunter.js -iF ./sample_ips.txt
```

5. Save Output to CSV:
```bash
node hosthunter.js -i 8.8.8.8,1.1.1.1 -o results.csv
```

---
