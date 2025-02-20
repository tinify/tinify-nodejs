#!/usr/bin/env bash
certs=()
cert=0
current_cert=""

# Fetch and process the certificates
while IFS= read -r line; do
  if [[ "$line" == "-----BEGIN CERTIFICATE-----" ]]; then
      cert=1
      current_cert="$line\n"
  elif [[ "$line" == "-----END CERTIFICATE-----" ]]; then
      cert=0
      current_cert+="$line\n"
      certs+=("$current_cert")
  else
      if [[ $cert -eq 1 ]]; then
          current_cert+="$line\n"
      fi
  fi
done < <(curl --silent --fail https://curl.se/ca/cacert.pem)

# Create JavaScript file with the array of PEM certificates
cat > "./src/tinify/cacert.ts" <<EOF
export const CA_CERTS: string[] = [
$(printf '  `%s`,\n' "${certs[@]}")
];
EOF