#!/usr/bin/env bash
dir=lib/data

cert=0
curl --silent --fail https://curl.se/ca/cacert.pem  | while read -r line; do
  if [ "-----BEGIN CERTIFICATE-----" == "$line" ]; then
      cert=1
      echo "$line"
  elif [ "-----END CERTIFICATE-----" == "$line" ]; then
      cert=0
      echo "$line"
  else
      if [ $cert == 1 ]; then
          echo "$line"
      fi
  fi
done > "$dir/cacert.pem"
