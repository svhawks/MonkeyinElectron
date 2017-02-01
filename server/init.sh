#!/usr/bin/env bash
cd;
if [ -d ".mie" ]; then
  cd .mie
else
  mkdir .mie;
  cd .mie;
fi

if [ -f "config.json" ]; then
  echo "Cool";
else
  echo '{ "sites": [] }' > config.json;
fi
