# HostHunter

**HostHunter** is a reverse DNS lookup tool designed to perform DNS lookups on a list of IP addresses, providing hostname information for each IP. This tool supports both **JavaScript (Node.js)** and **Python** implementations, allowing users to choose the language they are more comfortable with or the one that best fits their environment.

## Purpose

The purpose of providing HostHunter in multiple languages is to offer flexibility and compatibility across various platforms. Whether you prefer the JavaScript/Node.js ecosystem or the Python environment, you can use HostHunter to perform efficient DNS lookups for individual IP addresses.

## Available Implementations

- **JavaScript (Node.js)**: Located in the `JS-Script` folder.
- **Python**: Located in the `Python-Script` folder.

Each implementation provides the same core functionality and usage, allowing users to easily switch between versions if needed.

## Functionality Overview

HostHunter is designed to:
1. Perform reverse DNS lookups for a list of individual IP addresses (CIDR ranges are not supported).
2. Accept IP input directly from the command line or via a file.
3. Output results in a structured table format with color-coded status (success or failure).
4. Support CSV output if specified.

Refer to the specific README files within the `JS-Script` and `Python-Script` folders for detailed installation and usage instructions for each language.
