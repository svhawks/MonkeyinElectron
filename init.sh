#!/usr/bin/env bash
cd;
if [ -d ".mie" ]; then
  cd .mie
else
  mkdir .mie;
  cd .mie;
fi

if [ -d "scripts" ]; then
  echo "scripts available"
else
  mkdir scripts;
  echo "*.js" > scripts/.gitignore
fi

if [ -d "script" ]; then
  echo "script available"
else
  mkdir script;
  echo "*.js" > script/.gitignore
fi

if [ -f "config.json" ]; then
  echo "Cool";
else
  echo '{ "sites": [] }' > config.json;
fi
