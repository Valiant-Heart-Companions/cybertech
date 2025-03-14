#!/bin/bash

# Create the certs directory if it doesn't exist
mkdir -p certs

# Generate self-signed certificates
openssl req -x509 -out certs/localhost.crt -keyout certs/localhost.key \
  -newkey rsa:2048 -nodes -sha256 \
  -subj '/CN=localhost' -extensions EXT -config <( \
   printf "[dn]\nCN=localhost\n[req]\ndistinguished_name = dn\n[EXT]\nsubjectAltName=DNS:localhost\nkeyUsage=digitalSignature\nextendedKeyUsage=serverAuth")

echo "Self-signed certificates generated in certs/ directory." 