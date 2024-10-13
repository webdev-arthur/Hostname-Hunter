import argparse
import csv
import socket
import sys
import os
from colorama import Fore, Style, init

# Initialize colorama for colored output in Windows
init(autoreset=True)

def is_valid_ip(ip):
    """Validate if an IP address is valid."""
    try:
        socket.inet_aton(ip)
        return True
    except socket.error:
        return False

def is_valid_ip_range(ip):
    """Check if the input is in CIDR notation, which is unsupported."""
    return '/' in ip

def perform_dns_lookup(ip):
    """Perform reverse DNS lookup on a single IP address."""
    try:
        hostname = socket.gethostbyaddr(ip)[0]
        return "Success", hostname
    except socket.herror:
        return "Failed", "No hostname found"

def load_ips_from_file(file_path):
    """Load IP addresses from a file."""
    with open(file_path, 'r') as file:
        return [line.strip() for line in file if line.strip()]

def print_table(results):
    """Print results in a table format with color-coded status."""
    # Calculate max column widths
    max_ip_len = max(len(row[0]) for row in results)
    max_status_len = max(len(row[1]) for row in results)
    max_hostname_len = max(len(row[2]) for row in results)

    # Construct row separator based on column widths
    row_separator = f"+{'-' * (max_ip_len + 2)}+{'-' * (max_status_len + 2)}+{'-' * (max_hostname_len + 2)}+"
    print(row_separator)
    
    # Header row with the same width calculations
    header = f"| {'IP Address'.ljust(max_ip_len)} | {'Status'.ljust(max_status_len)} | {'Hostname'.ljust(max_hostname_len)} |"
    print(header)
    print(row_separator)

    for row in results:
        ip, status, hostname = row
        # Apply color to the status
        color_status = Fore.GREEN + status + Style.RESET_ALL if status == "Success" else Fore.RED + status + Style.RESET_ALL

        # Print each row with color and alignment
        print(f"| {ip.ljust(max_ip_len)} | {color_status.ljust(max_status_len + len(Fore.GREEN) + len(Style.RESET_ALL))} | {hostname.ljust(max_hostname_len)} |")
        print(row_separator)  # Add separator after each row


def save_to_csv(results, output_file):
    """Save results to a CSV file."""
    with open(output_file, 'w', newline='') as csvfile:
        writer = csv.writer(csvfile)
        writer.writerow(['IP Address', 'Status', 'Hostname'])
        writer.writerows(results)
    print(Fore.GREEN + f"Results saved to {output_file}")

def main():
    parser = argparse.ArgumentParser(description="HostHunter - A Reverse DNS Lookup Tool")
    parser.add_argument('-i', type=str, help="Comma-separated IP addresses")
    parser.add_argument('-iF', type=str, help="Path to a file with IP addresses")
    parser.add_argument('-o', type=str, help="Output CSV file (optional)")
    args = parser.parse_args()

    ip_addresses = []
    if args.i:
        ip_addresses = [ip.strip() for ip in args.i.split(',')]
    elif args.iF:
        if not os.path.exists(args.iF):
            print(Fore.RED + f"File not found: {args.iF}")
            sys.exit(1)
        ip_addresses = load_ips_from_file(args.iF)
    else:
        print(Fore.RED + "No IP addresses provided. Use -i <IP-Address> or -iF <File-Path>.")
        sys.exit(1)

    # Check for CIDR and mixed IP/CIDR content
    has_cidr = any(is_valid_ip_range(ip) for ip in ip_addresses)
    has_ips = any(is_valid_ip(ip) for ip in ip_addresses)

    if has_cidr and has_ips:
        print(Fore.YELLOW + "Only IPs are accepted, convert the CIDR into the list of IPs and update the file.")
        sys.exit(1)
    elif has_cidr:
        print(Fore.YELLOW + "I don't handle the CIDR Range.")
        sys.exit(1)

    # Perform DNS lookup for each IP and collect results
    results = [['IP Address', 'Status', 'Hostname']]
    for ip in ip_addresses:
        if is_valid_ip(ip):
            status, hostname = perform_dns_lookup(ip)
            results.append([ip, status, hostname])
        else:
            print(Fore.RED + f"Invalid IP address format: {ip}")
            results.append([ip, "Invalid", "N/A"])

    # Print table of results
    print_table(results[1:])

    # Save to CSV if -o argument is provided
    if args.o:
        save_to_csv(results[1:], args.o)

if __name__ == "__main__":
    main()
