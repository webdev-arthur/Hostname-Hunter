# HostHunter - Python Version

This is the **Python** implementation of **HostHunter**, a reverse DNS lookup tool for performing DNS lookups on individual IP addresses.

## Features

- **Reverse DNS Lookup**: Provides hostname information for each IP address.
- **Flexible Input**: Accepts IP addresses from the command line or from a file.
- **Formatted Output**: Displays results in a structured table format with color-coded status.
- **CSV Output**: Optionally save results to a CSV file.

## Installation

To use HostHunter in Python, you need Python 3 installed. Additionally, install `colorama` for colored output:

```bash
pip install colorama
```

## Usage

HostHunter accepts input in two ways:

- **Command Line**: Provide IP addresses as a single or comma-separated list.
- **File**: Specify a file containing a list of IP addresses, each on a new line.


### Basic Usage
```bash
python hosthunter.py -i <IP-Address or IP-Addresses>
python hosthunter.py -iF <File-Path>
python hosthunter.py -i <IP-Address> -o <Output-Filename>
```

-i: Input IP addresses (comma-separated if multiple).
-iF: Specify a file containing IP addresses.
-o: Specify an output file (CSV format).

### Examples

1. Single IP Lookup:
```bash
python hosthunter.py -i 8.8.8.8
```

2. Multiple IPs from Command Line:
```bash
python hosthunter.py -i 8.8.8.8,1.1.1.1,192.168.1.1
```

3. Lookup from a File:
```bash
python hosthunter.py -iF ./sample_ips.txt
```

5. Save Output to CSV:
```bash
python hosthunter.py -i 8.8.8.8,1.1.1.1 -o results.csv
```

---
