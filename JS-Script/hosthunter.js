const dns = require('dns');
const fs = require('fs');
const chalk = require('chalk');
const path = require('path');

// Utility function to generate a random color for the tool name
const getRandomColor = () => {
    const colors = [
        chalk.red, chalk.green, chalk.yellow, chalk.cyan, chalk.magenta, chalk.blue
    ];
    return colors[Math.floor(Math.random() * colors.length)];
};

// Function to get the terminal width (cross-platform)
const getTerminalWidth = () => {
    return process.stdout.columns || 80; // Default to 80 if unable to get terminal width
};

// Validation function to check if a single IP address is valid
const isValidIp = (ip) => {
    const ipRegex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipRegex.test(ip);
};

// Validation function to check if a CIDR IP range is valid
const isValidIpRange = (range) => {
    const rangeRegex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\/([1-9]|[1-2][0-9]|3[0-2]))$/;
    return rangeRegex.test(range);
};

// Function to validate a list of IP addresses or ranges
const validateIps = (ips) => {
    return ips.every(ipLine => {
        // Split comma-separated IPs/ranges on each line
        const ipParts = ipLine.split(',').map(part => part.trim());
        
        // Validate each part individually
        return ipParts.every(ip => {
            const isValid = isValidIp(ip) || isValidIpRange(ip);
            if (!isValid) {
                console.error(chalk.red(`Invalid IP address or range format: "${ip}"`));
            }
            return isValid;
        });
    });
};

// Variable Initialization
const args = process.argv.slice(2);
let ipAddresses = [];
let outputFileName = null;
let results = [['IP Address', 'Status', 'Hostname']]; // Initial headers for results
let completedLookups = 0; // Track completed lookups

// Stylized output for HostHunter tool name with random color
const randomColor = getRandomColor();
const toolName = `
${randomColor.bold('HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH')}
${randomColor.bold('H')}${randomColor('              HostHunter              ')}${randomColor.bold('H')}
${randomColor.bold('H')}${randomColor('      A Reverse DNS Lookup Tool       ')}${randomColor.bold('H')}
${randomColor.bold('HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH')}
`;

// Display the tool name at the start of the script
console.log(toolName);

// Section 2: Argument Parsing and File Validation

// Argument Parsing and Error Handling
for (let i = 0; i < args.length; i++) {
    if (args[i] === '-i') {
        const input = args[i + 1];
        ipAddresses = input.split(',').map(ip => ip.trim());
        i++;
    } else if (args[i] === '-iF') {
        const filePath = args[i + 1];
        try {
            if (!fs.existsSync(filePath)) {
                console.error(chalk.red(`File not found: ${filePath}`));
                process.exit(1);
            }
            const fileContent = fs.readFileSync(filePath, 'utf-8');
            ipAddresses = fileContent.split(/\r?\n/).map(line => line.trim()).filter(line => line);
            
            // Check if the file contains any CIDR ranges along with IPs
            const hasCidr = ipAddresses.some(isValidIpRange);
            const hasIps = ipAddresses.some(isValidIp);

            if (hasCidr && hasIps) {
                console.log(chalk.yellow("CIDR is mixed with valid IPs, convert those to IPs."));
                process.exit(1);
            } else if (hasCidr) {
                console.log(chalk.yellow("Please provide the list of IPs, not the CIDR Notation. Can't Handle that as of now."));
                process.exit(1);
            } else if (!validateIps(ipAddresses)) {
                console.error(chalk.red("File contains invalid IP address or range format."));
                process.exit(1);
            }
            i++;
        } catch (error) {
            console.error(chalk.red(`Error reading file: ${error.message}`));
            process.exit(1);
        }
    } else if (args[i] === '-o') {
        outputFileName = args[i + 1] ? args[i + 1] : 'output.csv';
        i++;
    }
}

// Check if any IP addresses are provided
if (ipAddresses.length === 0) {
    console.error(chalk.red("No IP addresses provided. Use -i <IP-Address> or -iF <File-Path>."));
    process.exit(1);
}

// Check for CIDR notation in command-line input
const hasCidrInArgs = ipAddresses.some(isValidIpRange);
if (hasCidrInArgs) {
    console.log(chalk.yellow("I don't handle the CIDR Range."));
    process.exit(1);
}


// Section 3: DNS Lookup with Completion Tracking and Error Handling

// Function to perform reverse DNS lookup on individual IPs only
const handleDnsLookup = (ip) => {
    if (isValidIpRange(ip)) {
        // CIDR range detected; log a message indicating it can't be handled
        console.log(chalk.yellow(`Can't handle the CIDR range: "${ip}"`));
        results.push([ip, 'Not Applicable', 'CIDR range - Not handled']);
        completedLookups++;

        // Check if all lookups are complete and finalize output
        if (completedLookups === totalLookups) {
            finalizeOutput();
        }
    } else if (isValidIp(ip)) {
        // Perform DNS lookup for individual IP addresses
        dns.reverse(ip, (err, hostnames) => {
            const status = err ? 'Failed' : 'Success';
            const hostname = err ? `Error: ${err.message}` : hostnames.join(', ');

            results.push([ip, status, hostname]); // Store result for CSV export
            completedLookups++;

            // Check if all lookups are complete and finalize output
            if (completedLookups === totalLookups) {
                finalizeOutput();
            }
        });
    } else {
        // Handle invalid IP or range (shouldn’t reach here due to prior validation)
        console.error(chalk.red(`Invalid IP address or range format encountered: "${ip}"`));
        completedLookups++;
        
        // Check if all lookups are complete and finalize output
        if (completedLookups === totalLookups) {
            finalizeOutput();
        }
    }
};

// Track the total number of lookups
let totalLookups = 0;
ipAddresses.forEach(ipLine => {
    const ipParts = ipLine.split(',').map(part => part.trim());
    totalLookups += ipParts.length; // Count each IP or range separately
    ipParts.forEach(ip => handleDnsLookup(ip));
});

// Function to finalize output after all lookups are complete
function finalizeOutput() {
    printTable(); // Print results in tabular format
    if (outputFileName) saveToCSV(); // Save to CSV if specified
}


// Section 4: Table Printing and CSV Export Functions

// Function to Print Table with Proper Formatting and Color-Coded Status
function printTable() {
    if (results.length <= 1) {
        console.log(chalk.yellow("No results to display."));
        return;
    }

    // Determine the maximum column widths
    const maxIpLength = Math.max(...results.map(row => row[0].length), 'IP Address'.length);
    const maxStatusLength = Math.max(...results.map(row => row[1].length), 'Status'.length);
    const maxHostnameLength = Math.max(...results.map(row => row[2].length), 'Hostname'.length);

    // Construct row separator based on column widths
    const rowSeparator = `+${'-'.repeat(maxIpLength + 2)}+${'-'.repeat(maxStatusLength + 2)}+${'-'.repeat(maxHostnameLength + 2)}+`;

    // Print table header
    console.log(rowSeparator);
    console.log(`| ${'IP Address'.padEnd(maxIpLength)} | ${'Status'.padEnd(maxStatusLength)} | ${'Hostname'.padEnd(maxHostnameLength)} |`);
    console.log(rowSeparator);

    // Print each row with color-coded status
    results.slice(1).forEach(row => {
        // Apply color to the status and pad to ensure alignment
        const colorStatus = row[1] === 'Success' 
            ? chalk.green(row[1].padEnd(maxStatusLength)) 
            : chalk.red(row[1].padEnd(maxStatusLength));

        console.log(`| ${row[0].padEnd(maxIpLength)} | ${colorStatus} | ${row[2].padEnd(maxHostnameLength)} |`);
        console.log(rowSeparator); // Add a separator after each row
    });
}

// Function to Save Results to CSV if -o Option is Provided
function saveToCSV() {
    const csvData = results.map(row => row.join(',')).join('\n');
    const filePath = path.resolve(__dirname, outputFileName);
    fs.writeFileSync(filePath, csvData);
    console.log(chalk.green(`Results saved to ${filePath}`));
}
